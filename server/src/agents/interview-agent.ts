import type { Conversation, UserProfile, ConversationPhase, Message } from '../../../shared/types';
import type { BaseQuestion } from '../data/questions/base-questions';
import {
  FOUNDATION_QUESTIONS,
  getNextFoundationQuestion,
  getPendingFoundationQuestions,
  isFoundationComplete,
} from '../data/questions/base-questions';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interview Agent: manages conversation flow, question selection, and response tone.
 * This is the "face" of the system — all user-visible text goes through here.
 *
 * Conversation flow:
 *   greeting → foundation → dynamic_followup → mid_summary → final_profile → continuous_update
 *
 * The FOUNDATION phase is mandatory. All 8 foundation questions are asked before
 * the system enters dynamic (LLM-driven) follow-up. This ensures every user gets
 * consistent baseline coverage across all 12 personality dimensions.
 */

export function generateGreeting(profile: UserProfile): string {
  const nickname = profile.basicInfo.nickname;

  if (nickname) {
    const namedGreetings = [
      `${nickname}，你好。\n\n我是回声。\n\n我不做测试，也不会给你分类。我想做的，是通过一些对话，慢慢理解你——像一个愿意认真听的人那样。\n\n如果你愿意的话，我们就从几个简单的问题开始。不用想太多，按你真实的感觉来就好。`,

      `嘿，${nickname}。\n\n欢迎你来。\n\n我不是一个问卷，也不是一个性格测试。我更像一个在和你聊天的人——想了解你，不是想分析你。\n\n我们可以慢慢来。先从随便聊聊开始？`,
    ];
    return namedGreetings[Math.floor(Math.random() * namedGreetings.length)];
  }

  const greetings = [
    `你好。\n\n我是回声。\n\n我不做测试，也不会给你分类。我想做的，是通过一些对话，慢慢理解你——像一个愿意认真听的人那样。\n\n如果你愿意的话，我们就从几个简单的问题开始。不用想太多，按你真实的感觉来就好。`,

    `嘿，欢迎你来。\n\n我不是一个问卷，也不是一个性格测试。我更像一个在和你聊天的人——想了解你，不是想分析你。\n\n我们可以慢慢来。先从随便聊聊开始？`,

    `你好。\n\n我叫回声。我做一件事：通过对话，帮你看见一个更完整的自己。\n\n这不着急，也不需要一次聊完。现在，我只有几个简单的问题想先听听你的回答。`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function generateTransition(
  profile: UserProfile,
  conversation: Conversation
): string {
  const transitions = [
    '谢谢你跟我说这些。我可以再问你一个问题吗？',
    '我大概对你的感觉有了一些理解。想继续聊聊下一个话题——',
    '了解。那我们换一个方向，聊聊别的——',
    '好，我记下来了。下一个问题可能会不太一样——',
  ];

  return transitions[Math.floor(Math.random() * transitions.length)];
}

export function generateMidSummary(profile: UserProfile): string {
  const dims = profile.personalityDimensions;
  const highTraits = Object.entries(dims)
    .filter(([_, t]) => t.value >= 7 && t.confidence !== 'low')
    .map(([k, _]) => traitDisplayName(k));
  const lowTraits = Object.entries(dims)
    .filter(([_, t]) => t.value <= 3 && t.confidence !== 'low')
    .map(([k, _]) => traitDisplayName(k));

  const parts: string[] = [];

  parts.push('聊了这些，我大概有了一些感觉——不过你不要把它当成一个结论，它更像是目前为止的一个草图。');

  if (highTraits.length > 0) {
    parts.push(`我感觉到你可能是一个比较${highTraits.slice(0, 2).join('、')}的人。`);
  }

  if (lowTraits.length > 0) {
    parts.push(`同时，你似乎不太${lowTraits.slice(0, 2).join('、')}。`);
  }

  const defensePatterns = profile.narrativeDimensions.defenseMechanisms;
  if (defensePatterns.length > 0) {
    const uniquePatterns = [...new Set(defensePatterns)].slice(0, 2);
    parts.push(`我也注意到，你在面对一些不舒服的事情时，似乎习惯${uniquePatterns.join('和')}。`);
  }

  parts.push('你觉得这些说得对吗？还是说我有哪里理解得不对？');

  return parts.join('\n\n');
}

export function generateNextQuestion(
  profile: UserProfile,
  conversation: Conversation,
  followUpSuggestions: Array<{ priority: number; suggestedQuestion: string }>
): string {
  // During foundation phase, use structured questions
  if (conversation.phase === 'foundation') {
    return getNextFoundationResponse(conversation);
  }

  // If there are high-priority follow-up suggestions, use one of those
  const highPriority = followUpSuggestions.filter(s => s.priority >= 6);
  if (highPriority.length > 0) {
    return highPriority[0].suggestedQuestion;
  }

  // Otherwise, pick the next uncovered base question
  const askedBaseIds = FOUNDATION_QUESTIONS
    .filter((q: BaseQuestion) => conversation.messages.some(m => m.content.includes(q.text.slice(0, 20))))
    .map((q: BaseQuestion) => q.id);

  const nextQ = getNextFoundationQuestion(askedBaseIds);
  if (nextQ) {
    return nextQ.text;
  }

  // All base questions asked, generate a dynamic question
  return generateDynamicQuestion(profile);
}

/**
 * Returns the next foundation question, with a natural transition intro.
 */
function getNextFoundationResponse(conversation: Conversation): string {
  const askedIds = conversation.foundationQuestionsAsked || [];
  const nextQ = getNextFoundationQuestion(askedIds);

  if (!nextQ) {
    // All foundation questions done — this shouldn't happen if phase logic is correct
    return generateTransitionForProfile({} as UserProfile, conversation);
  }

  // First foundation question: no transition needed
  if (askedIds.length === 0) {
    return nextQ.text;
  }

  // Later questions: add a brief acknowledgment transition
  const transitions = [
    '嗯，我听到了。',
    '谢谢你跟我分享这些。',
    '了解。',
    '这让我对你有了更多的理解。',
  ];
  const pick = transitions[Math.floor(Math.random() * transitions.length)];

  return `${pick}\n\n${nextQ.text}`;
}

function generateTransitionForProfile(profile: UserProfile, conversation: Conversation): string {
  const transitions = [
    '谢谢你跟我说这些。我可以再问你一个问题吗？',
    '我大概对你的感觉有了一些理解。想继续聊聊下一个话题——',
    '了解。那我们换一个方向，聊聊别的——',
  ];
  return transitions[Math.floor(Math.random() * transitions.length)];
}

function generateDynamicQuestion(profile: UserProfile): string {
  const pendingDims = profile.pendingDimensions;
  const dimQuestions: Record<string, string[]> = {
    socialEnergy: ['你现在一个人待着的时候，通常在做些什么？', '你觉得自己需要多少独处的时间来恢复精力？'],
    emotionalStability: ['你觉得自己最近的情绪状态怎么样？像什么样的天气？'],
    selfExpressionTendency: ['你更习惯用什么样的方式表达自己——说话、写字、还是别的什么？'],
    dependencyIndependence: ['你求助的时候，心里会有什么感觉？', '你觉得自己是更倾向于靠自己解决问题，还是寻求帮助？'],
    riskAversion: ['你最近有做过什么需要一点勇气的事吗？'],
    relationshipSensitivity: ['在一段关系里，你什么时候会觉得安全？'],
    controlNeed: ['有没有什么事是你很想控制但其实控制不了的？'],
    reflectionAbility: ['你有没有一个反复问自己的问题？'],
    empathyTendency: ['你觉得自己是一个容易被别人的情绪影响的人吗？'],
    actionPreference: ['遇到困难的时候，你先做还是先想？'],
    decisionStyle: ['你做决定的时候，最怕的是什么？'],
    selfDisclosureTendency: ['你觉得和一个人建立信任，需要多长时间？'],
  };

  for (const dim of pendingDims) {
    const pool = dimQuestions[dim];
    if (pool && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  return '我还想了解更多关于你的故事——有没有什么你觉得很重要、但我们还没聊到的事？';
}

export function shouldGenerateProfile(profile: UserProfile): boolean {
  const answeredDimensions = Object.values(profile.personalityDimensions)
    .filter(t => t.confidence !== 'low').length;

  const hasContradictions = profile.contradictions.length > 0;
  const hasTimeline = profile.timeline.length > 0;
  const hasRelationships = profile.relationshipMap.length > 0;

  return answeredDimensions >= 6 && (hasContradictions || hasTimeline || hasRelationships);
}

export function determinePhase(profile: UserProfile, conversation: Conversation): ConversationPhase {
  const msgCount = conversation.messages.filter(m => m.role === 'user').length;

  if (msgCount === 0) return 'greeting';

  // Foundation phase: mandatory baseline questions
  const foundationDone = isFoundationComplete(conversation.foundationQuestionsAsked || []);
  if (msgCount <= 2 && !foundationDone) return 'foundation';
  if (!foundationDone && msgCount < FOUNDATION_QUESTIONS.length + 2) return 'foundation';

  if (shouldGenerateProfile(profile)) return 'final_profile';
  if (msgCount >= 5) return 'dynamic_followup';
  return 'initial_questions';
}

function traitDisplayName(key: string): string {
  const names: Record<string, string> = {
    emotionalStability: '情绪稳定',
    socialEnergy: '享受独处',
    selfExpressionTendency: '善于表达',
    selfDisclosureTendency: '开放坦诚',
    dependencyIndependence: '独立',
    riskAversion: '谨慎',
    relationshipSensitivity: '对关系敏感',
    controlNeed: '需要掌控',
    reflectionAbility: '善于反思',
    empathyTendency: '有共情力',
    actionPreference: '行动导向',
    decisionStyle: '理性决策',
  };
  return names[key] || key;
}

/**
 * Build a summary of pending foundation questions for the LLM.
 */
export function getFoundationContext(conversation: Conversation): string {
  const askedIds = conversation.foundationQuestionsAsked || [];
  const pending = getPendingFoundationQuestions(askedIds);

  if (pending.length === 0) {
    return '（基础知识已经全部覆盖，现在可以自由深入了。）';
  }

  const pendingTitles = pending.map((q: BaseQuestion) => `· ${q.text}`);
  const askedTitles = askedIds.map((id: string) => {
    const q = FOUNDATION_QUESTIONS.find((q: BaseQuestion) => q.id === id);
    return q ? `✓ ${q.text}` : '';
  }).filter(Boolean);

  return [
    '【已问过的基础问题】',
    ...askedTitles,
    '',
    '【还需要问的基础问题（必须覆盖）】',
    ...pendingTitles,
    '',
    '请先问完上面未覆盖的问题，再自由追问。每次只问一个问题。',
  ].join('\n');
}

export function buildChatMessage(
  content: string,
  displayStyle: NonNullable<Message['metadata']>['displayStyle'] = 'question'
): Message {
  return {
    id: uuidv4(),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    metadata: {
      displayStyle,
    },
  };
}
