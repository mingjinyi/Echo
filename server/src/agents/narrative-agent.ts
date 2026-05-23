import type { UserProfile } from '@shared/types';

/**
 * Generate a literary narrative portrait from structured profile data.
 * Output should read like a short character story / documentary narration.
 */
export function generateNarrative(profile: UserProfile): string {
  const dims = profile.personalityDimensions;
  const narr = profile.narrativeDimensions;
  const contradictions = profile.contradictions;
  const timeline = profile.timeline;
  const relationships = profile.relationshipMap;

  const parts: string[] = [];

  // --- Opening hook ---
  parts.push(generateOpening(dims, narr));

  // --- Core personality ---
  parts.push(generatePersonalitySection(dims, narr));

  // --- Relationships ---
  if (relationships.length > 0) {
    parts.push(generateRelationshipSection(relationships));
  }

  // --- Contradictions ---
  if (contradictions.length > 0) {
    parts.push(generateContradictionSection(contradictions));
  }

  // --- Timeline / Growth ---
  if (timeline.length > 0) {
    parts.push(generateTimelineSection(timeline));
  }

  // --- Closing ---
  parts.push(generateClosing(dims, narr));

  return parts.filter(Boolean).join('\n\n');
}

function generateOpening(dims: UserProfile['personalityDimensions'], narr: NarrativeDimensions): string {
  const socialEnergy = dims.socialEnergy.value;
  const disclosure = dims.selfDisclosureTendency.value;
  const coreNarrative = narr.coreNarrative || '一个还在认识自己的人';

  // Introvert + guarded
  if (socialEnergy <= 4 && disclosure <= 4) {
    return `她不是那种一眼就能看透的人。\n\n她的世界有很清晰的边界——外面的人看到的是安静、克制、甚至有些疏离，而里面的人在很久很久以后才会意识到，自己是被认真放进来的。`;
  }

  // Introvert + open
  if (socialEnergy <= 4 && disclosure >= 6) {
    return `她话不多，但每一句都带着真实的重量。\n\n在人群中她常常是安静的观察者，但在安全的对话里，她愿意把很深的自己交出来——像从一个很深的抽屉里，小心翼翼地拿出了珍藏的东西。`;
  }

  // Extrovert + guarded
  if (socialEnergy >= 7 && disclosure <= 4) {
    return `她看起来很容易靠近，笑容、回应、轻松的语气——但她知道，大多数人对她的了解停在第一层。\n\n那些真正的情绪、犹豫、怕被看见的东西，她都妥帖地收在热闹的后面。很多人以为认识她，但只有很少的人真的见过她。`;
  }

  // Extrovert + open
  if (socialEnergy >= 7 && disclosure >= 6) {
    return `她是一个有温度的人——她的温度不只是热情，更是一种让人放松的坦率。\n\n她不太习惯把心事藏起来，比起一个人消化，她更愿意把感受放在对话里，放在和别人的连接里。她相信说出来会好一点，而大多数时候确实如此。`;
  }

  // Balanced
  return `她是一个有层次的人。\n\n外冷内热、表面随意内里在意——这些反差不只是她的矛盾，更是她的深度。认识她像翻一本书，每一章都在打破上一章的判断。`;
}

function generatePersonalitySection(
  dims: UserProfile['personalityDimensions'],
  narr: NarrativeDimensions
): string {
  const highTraits = getHighTraits(dims);
  const lowTraits = getLowTraits(dims);

  const lines: string[] = [];

  // Emotional landscape
  if (highTraits.includes('emotionalStability')) {
    lines.push('她的情绪像一潭深水——不是没有波动，而是波动都发生在很深的地方，不容易被看见。她习惯了自己消化，也擅长让外面保持平静。');
  } else if (lowTraits.includes('emotionalStability')) {
    lines.push('她的情绪是活的。快乐和难过都会比较直接地到来，她不一定会大声表达，但那些波动是真实的，是有分量的，是不容易被理性完全覆盖的。');
  }

  // Decision making
  if (highTraits.includes('decisionStyle')) {
    lines.push('她做决定的时候更像一个分析者——会权衡、会比较、会把事情拆开来看。逻辑是她的工具，有时候也是她的保护伞。');
  } else if (lowTraits.includes('decisionStyle')) {
    lines.push('她相信直觉——那种说不清楚但就是知道的感觉。她的决定不一定能被解释成完美的逻辑，但往往最贴合她内心真正想要的方向。');
  }

  // Control
  if (highTraits.includes('controlNeed')) {
    lines.push('她对生活有掌控欲——不太能接受事情脱离自己的预期。这让她在很多事情上做得很好，但也让她在一些必须放手的时候特别辛苦。');
  }

  // Self-disclosure
  if (lowTraits.includes('selfDisclosureTendency')) {
    lines.push('她不是一个会轻易把自己交给别人的人。她的信任需要时间，需要证据，需要在反复的试探中慢慢确认——"这个人真的可以吗"。但一旦确认了，她会比看起来的更加投入。');
  }

  // Reflection
  if (highTraits.includes('reflectionAbility')) {
    lines.push('她经常回过头看自己。那些事后的反思、那些"我后来才意识到"的时刻，是她理解自己和世界的重要方式。她在和自己的对话中成长。');
  }

  // Relationship sensitivity
  if (highTraits.includes('relationshipSensitivity')) {
    lines.push('她在关系里很敏锐——对方一个微小的变化、一个微妙的语气，她都能捕捉到。这让她很会照顾别人的感受，但也让她比别人更容易在关系中感到疲惫。');
  }

  return lines.join('\n\n');
}

function generateRelationshipSection(relationships: UserProfile['relationshipMap']): string {
  const significantRelations = relationships
    .filter(r => r.significance >= 6)
    .slice(0, 3);

  if (significantRelations.length === 0) return '';

  const lines = ['在她的关系世界里——'];

  for (const rel of significantRelations) {
    lines.push(`关于${rel.label}，她的感觉是${rel.emotionalTone}的。${rel.userAttitude || ''}`);
  }

  return lines.join('\n');
}

function generateContradictionSection(contradictions: UserProfile['contradictions']): string {
  if (contradictions.length === 0) return '';

  const mainContradiction = contradictions[0];
  const lines: string[] = [];

  lines.push('但这还不是全部的她。');

  switch (mainContradiction.category) {
    case 'say_vs_do':
      lines.push(`她${mainContradiction.statementA}，但${mainContradiction.statementB}。`);
      lines.push(mainContradiction.resolution);
      break;
    case 'need_vs_avoid':
      lines.push(`${mainContradiction.statementA}，同时${mainContradiction.statementB}。`);
      lines.push(mainContradiction.resolution);
      break;
    case 'self_vs_other':
      lines.push(`${mainContradiction.statementA}，然而${mainContradiction.statementB}。`);
      lines.push(mainContradiction.resolution);
      break;
    case 'past_vs_present':
      lines.push(`${mainContradiction.statementA}。${mainContradiction.resolution}`);
      break;
  }

  return lines.join('\n');
}

function generateTimelineSection(timeline: UserProfile['timeline']): string {
  if (timeline.length === 0) return '';

  const past = timeline.filter(t => t.phase === 'past').slice(0, 2);
  const present = timeline.filter(t => t.phase === 'present');

  const lines: string[] = [];
  lines.push('在时间的维度上看她——');

  if (past.length > 0) {
    lines.push(`过去经历过${past.map(t => t.label).join('、')}，这些都没有简单地过去——它们沉淀在她的性格里，变成了她现在看待世界的方式的一部分。`);
  }

  if (present.length > 0) {
    lines.push(`现在的她${present[0].description || '正在一个自己也在观察的变化中'}。`);
  }

  return lines.join('\n');
}

function generateClosing(
  dims: UserProfile['personalityDimensions'],
  narr: NarrativeDimensions
): string {
  const coreNarrative = narr.coreNarrative;
  const reflectionAbility = dims.reflectionAbility.value;

  const closings = [
    `也许最准确的说法是：她是一个${coreNarrative || '复杂而真实'}的人。\n\n不是标签能概括的，不是问卷能测出来的。她是一段正在进行中的故事，有过去的回声，也有未来的空白页。`,
    `写到这里，其实最想说的是——\n\n她不是某种类型，她是一部正在被写的故事。有些章节已经翻过去了，有些还在写。不是完美的，但每一页都是她自己的。`,
    `理解一个人，从来不是一次总结就能完成的事。\n\n她还在变化，还在成长，还在一些自己也没注意到的地方悄悄变得不一样。这篇画像只是一个时间的切片——而关于她的故事，还有很长的路。`,
  ];

  if (reflectionAbility >= 7) {
    closings.push(
      `她是一个会回头审视自己的人。这既是天赋，也是一种辛苦——因为她看到的比别人更多，包括那些不太好看的部分。\n\n但也许正是这种"看见自己"的能力，让她在人群中多了一层人所不知的深刻。`
    );
  }

  return closings[Math.floor(Math.random() * closings.length)];
}

function getHighTraits(dims: UserProfile['personalityDimensions']): string[] {
  return Object.entries(dims)
    .filter(([_, trait]) => trait.value >= 7 && trait.confidence !== 'low')
    .map(([key]) => key);
}

function getLowTraits(dims: UserProfile['personalityDimensions']): string[] {
  return Object.entries(dims)
    .filter(([_, trait]) => trait.value <= 3 && trait.confidence !== 'low')
    .map(([key]) => key);
}

// Import needed for the NarrativeDimensions reference
import type { NarrativeDimensions } from '@shared/types';
