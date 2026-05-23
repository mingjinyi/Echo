import type { UserProfile, Contradiction, Confidence } from '../../../shared/types';

/**
 * Detect contradictions between:
 * 1. What user says vs what user does (based on profile evidence)
 * 2. Self-evaluation vs other-feedback
 * 3. Stated needs vs avoidance behaviors
 * 4. Past self vs present self
 */
export function detectContradictions(
  newMessage: string,
  profile: UserProfile
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // 0. Intra-message: contradictions within the same message (works for all users)
  const intraMsg = checkIntraMessage(newMessage);
  contradictions.push(...intraMsg);

  // 1. Say vs Do: Check if user claims something that conflicts with profile data
  const sayVsDo = checkSayVsDo(newMessage, profile);
  contradictions.push(...sayVsDo);

  // 2. Self vs Other: Check if self-evaluation conflicts with relationship patterns
  const selfVsOther = checkSelfVsOther(newMessage, profile);
  contradictions.push(...selfVsOther);

  // 3. Need vs Avoid: Check if stated needs conflict with defensive patterns
  const needVsAvoid = checkNeedVsAvoid(newMessage, profile);
  contradictions.push(...needVsAvoid);

  // 4. Past vs Present: Check if past description conflicts with current state
  const pastVsPresent = checkPastVsPresent(newMessage, profile);
  contradictions.push(...pastVsPresent);

  return contradictions;
}

/**
 * Detect contradictions within a single message.
 * This works even for brand-new users with no profile history.
 */
function checkIntraMessage(text: string): Contradiction[] {
  const results: Contradiction[] = [];

  // "I'm fine alone" + subtle hints of loneliness in the SAME message
  const claimsFine = /一个人.*也挺好|不用.*别人.*管|习惯.*一个人|独立.*没.*问题|不需要.*依赖/.test(text);
  const hintsLonely = /有时候.*还是|虽然.*但是|寂寞|孤单|希望.*有人|偶尔.*也/.test(text);
  if (claimsFine && hintsLonely) {
    results.push({
      id: '',
      statementA: '强调自己可以独立、一个人也很好',
      statementB: '但语言中也透露出偶尔的孤独或对连接的渴望',
      category: 'say_vs_do',
      resolution: '独立和需要他人并不是对立的——真正的独立是"可以选择"，而不是"必须一个人"。',
      confidence: 'low',
    });
  }

  // "I don't care what others think" + detailed analysis of others' views
  const claimsDontCare = /不在乎|不在意|无所谓.*别人|不.*管.*别人/.test(text);
  const analyzesOthers = /他们.*觉得|别人.*可能|会.*不会.*觉得|看起来/.test(text);
  if (claimsDontCare && analyzesOthers) {
    results.push({
      id: '',
      statementA: '声称不在意别人的看法',
      statementB: '但同时细致地想象了别人可能的评价',
      category: 'say_vs_do',
      resolution: '真正不在意的人通常不会反复分析和想象。这种"不在意"更像是一种保护色。',
      confidence: 'low',
    });
  }

  // "I'm very rational" + emotionally charged language
  const claimsRational = /理智|冷静|逻辑|理性地|客观/.test(text);
  const emotionalLanguage = /难过|受伤|崩溃|生气|忍不住|受不了/.test(text);
  if (claimsRational && emotionalLanguage) {
    results.push({
      id: '',
      statementA: '描述自己是理性/冷静的人',
      statementB: '同时使用了情绪强度较高的表达',
      category: 'say_vs_do',
      resolution: '理智可能是她的自我认知，但情绪并没有因此消失——它们只是换了一种方式被表达。',
      confidence: 'low',
    });
  }

  // "I've changed" + describing the same pattern
  const claimsChanged = /以前.*现在.*不|已经.*变|不再.*是|现在.*不一样/.test(text);
  const samePattern = /还是.*会|依然|还是.*一样|一直.*都/.test(text);
  if (claimsChanged && samePattern) {
    results.push({
      id: '',
      statementA: '描述了自己的变化',
      statementB: '但语言中也有"还是""依然"等延续性的暗示',
      category: 'past_vs_present',
      resolution: '变化和延续常常是同时发生的——有些东西变了，有些东西只是不再被注意到了。',
      confidence: 'low',
    });
  }

  // "I want to be understood" + "but I don't like to explain myself"
  const wantsUnderstanding = /被理解|有人懂|了解.*我|看.*懂.*我/.test(text);
  const resistsOpening = /不想.*说|懒得.*解释|说了.*也没用|不.*喜欢.*表达/.test(text);
  if (wantsUnderstanding && resistsOpening) {
    results.push({
      id: '',
      statementA: '渴望被理解',
      statementB: '但同时表达了对解释自己的抗拒',
      category: 'need_vs_avoid',
      resolution: '渴望被理解却不愿解释——这是"希望别人能看见真实的我，但怕主动展示会失望"的典型信号。',
      confidence: 'low',
    });
  }

  return results;
}

function checkSayVsDo(text: string, profile: UserProfile): Contradiction[] {
  const results: Contradiction[] = [];

  // User says they don't care about others' opinions...
  const claimsIndependence = /不在乎|不在意.*别人|无所谓.*别人|不.*管.*别人.*怎么/.test(text);
  // ...but has high relationship sensitivity in profile
  const highSensitivity = profile.personalityDimensions.relationshipSensitivity.value >= 7
    && profile.personalityDimensions.relationshipSensitivity.confidence !== 'low';

  if (claimsIndependence && highSensitivity) {
    results.push({
      id: '',
      statementA: '声称不在意他人看法',
      statementB: `关系敏感度偏高 (${profile.personalityDimensions.relationshipSensitivity.value}/10)`,
      category: 'say_vs_do',
      resolution: '可能在用"不在意"来保护自己不受他人评价的影响——真正不在意的人通常不会反复强调这一点。',
      confidence: 'medium',
    });
  }

  // User says they're fine alone...
  const claimsFineAlone = /一个人.*挺好|不.*需要.*谁|自己.*可以|独.*立.*没.*问题/.test(text);
  const hasLonelinessPatterns = profile.narrativeDimensions.emotionalExpressionPatterns
    .some(p => p.includes('孤独') || p.includes('难过'));

  if (claimsFineAlone && hasLonelinessPatterns) {
    results.push({
      id: '',
      statementA: '声称一个人也很好',
      statementB: '情绪表达中有孤独和难过的痕迹',
      category: 'say_vs_do',
      resolution: '独立可能既是能力，也是防御。真正的独立不需要反复宣告。',
      confidence: 'medium',
    });
  }

  return results;
}

function checkSelfVsOther(text: string, profile: UserProfile): Contradiction[] {
  const results: Contradiction[] = [];

  // User describes themselves one way, but relationship data suggests another
  const claimsRational = /理智|逻辑|理性|冷静/.test(text);
  const hasEmotionalPatterns =
    profile.narrativeDimensions.emotionalExpressionPatterns.length > 2 ||
    profile.personalityDimensions.emotionalStability.value <= 4;

  if (claimsRational && hasEmotionalPatterns) {
    results.push({
      id: '',
      statementA: '自我描述为理性/逻辑型',
      statementB: '对话中表现出较多情绪波动和情感表达',
      category: 'self_vs_other',
      resolution: '可能习惯用理性框架来理解自己，但内心的情绪感受其实很丰富——这两者不矛盾，但需要被同时看见。',
      confidence: 'medium',
    });
  }

  return results;
}

function checkNeedVsAvoid(text: string, profile: UserProfile): Contradiction[] {
  const results: Contradiction[] = [];

  // User expresses need for connection...
  const expressesNeed = /想要.*有人|需要.*理解|希望.*被|渴望.*陪伴/.test(text);
  // ...but has avoidance patterns
  const avoidancePatterns = profile.narrativeDimensions.defenseMechanisms
    .filter(d => ['回避话题', '疏离', '否认'].includes(d));

  if (expressesNeed && avoidancePatterns.length > 0) {
    results.push({
      id: '',
      statementA: '表达了被理解和陪伴的需求',
      statementB: `常见的应对方式是${avoidancePatterns.join('、')}`,
      category: 'need_vs_avoid',
      resolution: '渴望连接，但也害怕靠近。这种矛盾本身就是一个重要的自我发现点。',
      confidence: 'medium',
    });
  }

  // User wants control but also wants to let go
  const wantsControl = /掌控|计划|安排.*好|不能.*失控/.test(text);
  const wantsLetGo = /随缘|算了|不管了|顺其自然/.test(text);

  if (wantsControl && wantsLetGo) {
    results.push({
      id: '',
      statementA: '需要掌控感',
      statementB: '也表达了想要放手或随缘',
      category: 'need_vs_avoid',
      resolution: '在掌控和放手之间反复，可能是对不确定性的深层不安。',
      confidence: 'low',
    });
  }

  return results;
}

function checkPastVsPresent(text: string, profile: UserProfile): Contradiction[] {
  const results: Contradiction[] = [];

  // Check if user describes significant change
  const describesChange = /以前.*现在|过去.*现在|变.*了|不.*一样.*了|和.*之前.*不/.test(text);

  if (describesChange && profile.timeline.length > 0) {
    results.push({
      id: '',
      statementA: '描述了自己前后的变化',
      statementB: `时间线中已有 ${profile.timeline.length} 个重要节点`,
      category: 'past_vs_present',
      resolution: '人的变化不是线性的——有些"变了"只是换了表达方式，有些"没变"只是藏得更深了。',
      confidence: 'low',
    });
  }

  return results;
}

/**
 * Merge new contradictions with existing ones, avoiding duplicates
 */
export function mergeContradictions(
  existing: Contradiction[],
  newOnes: Contradiction[]
): Contradiction[] {
  const merged = [...existing];
  for (const nc of newOnes) {
    const isDuplicate = existing.some(
      ec =>
        ec.category === nc.category &&
        ec.statementA === nc.statementA &&
        ec.statementB === nc.statementB
    );
    if (!isDuplicate) {
      merged.push({ ...nc, id: `contra_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` });
    }
  }
  return merged;
}
