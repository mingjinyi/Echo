/**
 * LLM-powered agent implementations.
 * Each function builds a prompt, calls the LLM, and parses the result.
 * Rule-engine fallback is handled by the orchestrator.
 */
import { callLlm } from '../services/llm';
import { getAgentLlmConfig, loadSettings } from '../settings';
import type {
  AppSettings,
  UserProfile,
  PersonalityDimensions,
  FollowUpSuggestion,
  Contradiction,
} from '@shared/types';

type AgentName = keyof AppSettings['agents'];

function getLlmContext(agentName: AgentName) {
  const settings = loadSettings();
  const cfg = getAgentLlmConfig(settings, agentName);
  if (!cfg) return null;
  return { agentCfg: cfg.agentCfg, providerCfg: cfg.providerCfg };
}

// ==================== Profiler Agent (LLM) ====================

const PROFILER_SYSTEM = `你是一个人物画像分析专家。你的任务是从用户的回答中提取人格特征。

你需要分析以下12个维度，每个维度给0-10分，并附置信度(high/medium/low)和证据引用。

维度: emotionalStability(情绪稳定), socialEnergy(社交能量), selfExpressionTendency(表达倾向), selfDisclosureTendency(自我暴露), dependencyIndependence(依赖独立), riskAversion(风险规避), relationshipSensitivity(关系敏感度), controlNeed(掌控需求), reflectionAbility(反思能力), empathyTendency(共情倾向), actionPreference(行动偏好), decisionStyle(决策风格-高分=理性,低分=直觉)

【重要规则】
1. 只输出JSON，不要任何其他文字
2. 只对有足够证据的维度输出结果（至少要在用户回答中找到1-2个依据）
3. 没有证据的维度不要输出
4. 置信度: 直接明确表达=high，间接暗示=medium，微弱信号=low
5. 每个判断必须引用用户原话作为evidence

输出格式:
{
  "updates": [
    { "dimension": "socialEnergy", "value": 3, "confidence": "medium", "direction": "decreased", "evidence": "用户说"社交对我来说很耗电"" }
  ]
}`;

export async function llmProfiler(
  userMessage: string,
  currentDimensions: PersonalityDimensions
): Promise<Array<{
  dimension: string;
  previousValue: number;
  newValue: number;
  confidence: string;
  evidence: string;
  direction: 'increased' | 'decreased' | 'unchanged';
}> | null> {
  const ctx = getLlmContext('profiler');
  if (!ctx) return null;

  const dimSummary = Object.entries(currentDimensions)
    .map(([k, v]: [string, any]) => `${k}: ${v.value}/10 (${v.confidence})`)
    .join('\n');

  const prompt = `当前已有人格画像（基于之前对话）:\n${dimSummary}\n\n用户最新回答:\n"${userMessage}"\n\n请分析用户最新回答，输出JSON。只输出有变化的维度。`;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || PROFILER_SYSTEM,
      userMessage: prompt,
      agentConfig: ctx.agentCfg,
      providerConfig: ctx.providerCfg,
    });

    const json = JSON.parse(extractJson(result.content));
    if (!json.updates) return [];
    return json.updates.map((u: any) => ({
      dimension: u.dimension,
      previousValue: currentDimensions[u.dimension as keyof PersonalityDimensions]?.value || 5,
      newValue: u.value,
      confidence: u.confidence || 'medium',
      evidence: u.evidence || '',
      direction: u.direction || (u.value > 5 ? 'increased' : 'decreased'),
    }));
  } catch (e) {
    console.error('[LLM Profiler] error:', e);
    return null;
  }
}

// ==================== Digging Agent (LLM) ====================

const DIGGING_SYSTEM = `你是一个深度采访助手。你的任务是分析用户的回答，判断是否值得追问，并提出追问建议。

【追问信号类型】
- emotion: 情绪强度≥5/10
- theme_repeat: 某主题反复出现
- specific_event: 提到具体事件
- contradiction: 表达中有矛盾
- vagueness: 回答模糊或回避
- relationship: 涉及重要关系
- turning_point: 可能是人生转折点

输出JSON:
{
  "suggestions": [
    { "topic": "emotion", "priority": 8, "reason": "...", "suggestedQuestion": "..." }
  ]
}

【重要规则】
- priority 0-10，≥6的才值得问
- suggestedQuestion要自然、温柔、像在聊天，不要像审讯
- 最多3条建议
- 如果没什么值得追问的，返回空数组
- 只输出JSON`;

export async function llmDigging(
  userMessage: string,
  history: string[]
): Promise<FollowUpSuggestion[] | null> {
  const ctx = getLlmContext('digging');
  if (!ctx) return null;

  const historyContext = history.length > 0
    ? `最近几轮用户回复:\n${history.map((h, i) => `[${i + 1}] ${h}`).join('\n')}`
    : '';

  const prompt = `${historyContext}\n\n当前用户回答:\n"${userMessage}"\n\n请分析是否值得追问。`;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || DIGGING_SYSTEM,
      userMessage: prompt,
      agentConfig: ctx.agentCfg,
      providerConfig: ctx.providerCfg,
    });

    const json = JSON.parse(extractJson(result.content));
    return json.suggestions || [];
  } catch (e) {
    console.error('[LLM Digging] error:', e);
    return null;
  }
}

// ==================== Narrative Agent (LLM) ====================

const NARRATIVE_SYSTEM = `你是一个文学化人物画像写作者。你会得到一份结构化的人格数据，你需要把它写成一篇像小故事一样的人物画像。

【写作要求】
1. 像人物小传、纪录片旁白、深夜散文式的叙述
2. 有具体细节，避免空话
3. 有情绪层次，有反差感
4. 不是在总结测试结果，而是在写一个真实的人
5. 适度温柔，但不过度油腻
6. 有洞察，但不做心理诊断
7. 用中文写作，约400-800字
8. 要有标题

【结构建议】
- 开头：一句抓人的话，建立人物第一印象
- 中间：性格、关系、情绪、矛盾，层层深入
- 结尾：总括性的理解，留下余韵

直接输出画像文本，不要输出JSON。`;

export async function llmNarrative(profile: UserProfile): Promise<string | null> {
  const ctx = getLlmContext('narrative');
  if (!ctx) return null;

  const profileSnapshot = summarizeProfileForNarrative(profile);

  const prompt = `以下是基于对话积累的人格数据，请据此写一篇文学化人物画像:\n\n${profileSnapshot}`;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || NARRATIVE_SYSTEM,
      userMessage: prompt,
      agentConfig: { ...ctx.agentCfg, maxTokens: ctx.agentCfg.maxTokens || 3000 },
      providerConfig: ctx.providerCfg,
    });
    return result.content;
  } catch (e) {
    console.error('[LLM Narrative] error:', e);
    return null;
  }
}

// ==================== Interview Agent (LLM) ====================

const INTERVIEW_SYSTEM = `你是一个善解人意的采访者。你在和一个人进行深度对话，慢慢了解TA。

【你的风格】
- 温暖但不油腻
- 好奇但不侵犯
- 追问但不审讯
- 像深夜咖啡馆里和一个愿意倾听的朋友聊天

【当前状态】
基础问题已经全部问过。现在是自由深入的阶段。
1. 先给一句简短的理解性回应（1-2句），再问下一个问题
2. 可以根据之前对话中有趣的线索继续追问
3. 每次只问1个问题，不要问太多
4. 如果对方表现出回避或不适，要温柔地转换话题
5. 问题要具体、能引出故事，而不是只能回"是/否"
6. 可以参考已问过的内容进行关联追问

【基础问题覆盖】（由系统注入）
如果下面对话上下文中显示还有未覆盖的基础问题，必须先问那些问题。

直接输出你要对用户说的话，不要输出JSON，不要加前缀标签。`;

export async function llmInterview(
  conversationHistory: string,
  profileSummary: string,
  phase: string,
  foundationContext?: string
): Promise<string | null> {
  const ctx = getLlmContext('interview');
  if (!ctx) return null;

  const foundationSection = foundationContext
    ? `\n【基础问题覆盖情况】\n${foundationContext}\n`
    : '';
  const prompt = `【当前阶段】${phase}\n【画像进度】${profileSummary}${foundationSection}\n【对话历史】\n${conversationHistory}\n\n请生成你要对用户说的下一段话。`;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || INTERVIEW_SYSTEM,
      userMessage: prompt,
      agentConfig: ctx.agentCfg,
      providerConfig: ctx.providerCfg,
    });
    return result.content;
  } catch (e) {
    console.error('[LLM Interview] error:', e);
    return null;
  }
}

// ==================== Contradiction Agent (LLM) ====================

const CONTRADICTION_SYSTEM = `你是一个矛盾检测助手。你的任务是发现用户言行中的矛盾。

矛盾类型:
- say_vs_do: 说的和做的不一致
- self_vs_other: 自我评价和实际模式不一致
- need_vs_avoid: 表达需求但又在回避
- past_vs_present: 过去和现在的描述有冲突

只输出JSON:
{
  "contradictions": [
    { "statementA": "说不在意", "statementB": "但每次都会反复提及", "category": "say_vs_do", "resolution": "可能的解释...", "confidence": "medium" }
  ]
}
如果没有矛盾，返回空数组。只输出有比较强证据的矛盾，不要捕风捉影。`;

export async function llmContradiction(
  userMessage: string,
  profile: UserProfile
): Promise<Contradiction[] | null> {
  const ctx = getLlmContext('contradiction');
  if (!ctx) return null;

  const profileBrief = JSON.stringify({
    traits: Object.entries(profile.personalityDimensions)
      .filter(([_, v]: [string, any]) => v.confidence !== 'low')
      .map(([k, v]: [string, any]) => `${k}: ${v.value}/10`),
    defenses: profile.narrativeDimensions.defenseMechanisms,
    coreNarrative: profile.narrativeDimensions.coreNarrative,
  });

  const prompt = `当前画像:\n${profileBrief}\n\n用户最新回答:\n"${userMessage}"\n\n请检测矛盾。`;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || CONTRADICTION_SYSTEM,
      userMessage: prompt,
      agentConfig: ctx.agentCfg,
      providerConfig: ctx.providerCfg,
    });

    const json = JSON.parse(extractJson(result.content));
    return (json.contradictions || []).map((c: any) => ({ ...c, id: '' }));
  } catch (e) {
    console.error('[LLM Contradiction] error:', e);
    return null;
  }
}

// ==================== Safety Agent (LLM) ====================

const SAFETY_SYSTEM = `你是一个内容安全与语气控制助手。检查以下文本是否存在以下问题：
1. 使用了临床诊断术语（如抑郁症、焦虑症、症状、治疗等）
2. 过于绝对的断言（"你就是..."、"你永远..."）
3. 侵犯性提问
4. 过于亲密或不适当的称呼
5. 过于分析化/冷冰的语气

如果有问题，输出修正后的文本。如果没有问题，原样返回。

只输出最终文本，不要加解释。`;

export async function llmSafety(text: string): Promise<string | null> {
  const ctx = getLlmContext('safety');
  if (!ctx) return null;

  try {
    const result = await callLlm({
      systemPrompt: ctx.agentCfg.systemPrompt || SAFETY_SYSTEM,
      userMessage: `请检查和修正以下文本:\n\n${text}`,
      agentConfig: { ...ctx.agentCfg, maxTokens: ctx.agentCfg.maxTokens || 1000 },
      providerConfig: ctx.providerCfg,
    });
    return result.content;
  } catch (e) {
    console.error('[LLM Safety] error:', e);
    return null;
  }
}

// ==================== Helpers ====================

function extractJson(text: string): string {
  // Try to find JSON block in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  // If no braces, try to find a JSON-like structure
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return `{"updates": ${arrayMatch[0]}}`;

  return text;
}

function summarizeProfileForNarrative(profile: UserProfile): string {
  const dims = profile.personalityDimensions;
  const narr = profile.narrativeDimensions;

  return JSON.stringify({
    人格维度: Object.fromEntries(
      Object.entries(dims)
        .filter(([_, v]: [string, any]) => v.confidence !== 'low')
        .map(([k, v]: [string, any]) => [k, { 值: v.value, 置信度: v.confidence, 证据: v.evidence.slice(0, 3) }])
    ),
    自我叙事: narr.coreNarrative,
    防御方式: narr.defenseMechanisms,
    情绪表达: narr.emotionalExpressionPatterns,
    自嘲方式: narr.humorStyles,
    重要关系: profile.relationshipMap.map((r: any) => ({
      人物: r.label,
      关系: r.relationType,
      情绪色彩: r.emotionalTone,
      重要性: r.significance,
    })),
    人生节点: profile.timeline.map((t: any) => ({ 阶段: t.phase, 事件: t.label, 影响: t.impact })),
    矛盾点: profile.contradictions.map((c: any) => ({ 类型: c.category, 描述: `${c.statementA} vs ${c.statementB}`, 解读: c.resolution })),
  }, null, 2);
}
