import type { UserProfile, Contradiction, Confidence } from '@shared/types';

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
