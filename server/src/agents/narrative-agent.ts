import type { UserProfile } from '../../../shared/types';

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

  // --- Cross-dimension synthesis ---
  const synthesis = generateCrossDimensionSynthesis(dims);
  if (synthesis) {
    parts.push(synthesis);
  }

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
  const reflection = dims.reflectionAbility.value;
  const empathy = dims.empathyTendency.value;
  const independence = dims.dependencyIndependence.value;
  const coreNarrative = narr.coreNarrative || '一个还在认识自己的人';

  // Find the most extreme trait (furthest from midpoint 5)
  const extremes = Object.entries(dims)
    .filter(([_, t]) => t.confidence !== 'low')
    .map(([k, t]) => ({ key: k, value: t.value, distance: Math.abs(t.value - 5) }))
    .sort((a, b) => b.distance - a.distance);

  const mostExtreme = extremes[0];

  // High reflection ability — the deepest, most introspective hook
  if (reflection >= 7 && mostExtreme?.key === 'reflectionAbility') {
    return `她对自己是好奇的。\n\n不是那种自恋的好奇，而是一种认真的、有时候甚至有点辛苦的"想知道自己为什么会这样"。她会回头看过往的选择，会琢磨那些反复出现的模式。这种反思不是偶尔为之，而是她理解世界和自己在其中的位置的方式。`;
  }

  // High empathy — the most emotionally attuned hook
  if (empathy >= 7 && mostExtreme?.key === 'empathyTendency') {
    return `我注意到她有一个很特别的地方——她对别人的情绪有一种几乎是本能的感知。\n\n不需要对方说出来，她已经察觉到了空气里的变化。这让她在关系里常常是那个被信任、被需要的人。但也让她背负了一些原本不属于她的重量——因为她感受到了，就没法假装没有。`;
  }

  // High independence — the self-reliant hook
  if (independence >= 7 && mostExtreme?.key === 'dependencyIndependence') {
    return `她是一个习惯了"自己来"的人。\n\n不是因为不相信别人，而是独立已经成了一种本能。很多事她一个人就解决了，很多人她不需要开口就会自己离开。这种独立让她很强大，但也让她在某些时刻，错过了一些可以不用一个人撑着的可能。`;
  }

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

  // Social energy
  if (lowTraits.includes('socialEnergy')) {
    lines.push('她的能量像是内向型的——独处不是逃避，而是充电。在人群中她可以应对，但那之后她需要一段安静的时间来恢复自己。这不是社交障碍，而是她的自然节奏。');
  } else if (highTraits.includes('socialEnergy')) {
    lines.push('她在和人的连接里获得能量。交谈、聚会、一起做点什么——这些不是消耗，而是她的燃料。一个人的时候也可以，但有温度的人群让她感觉到自己是活着的。');
  }

  // Self-expression
  if (highTraits.includes('selfExpressionTendency')) {
    lines.push('她不太把话闷在心里——有什么想法、感受、意见，她会选择说出来。这不是冲动，而是她相信表达本身是有价值的：说出来，才能被理解；不说，就是默认沉默。');
  } else if (lowTraits.includes('selfExpressionTendency')) {
    lines.push('她的表达方式不是直接的。很多话在她心里转了好几圈才出来，或者就不出来了。这不是不信任，而是她需要一个比日常对话更安全的空间，才能让语言自然流动。');
  }

  // Dependency / independence
  if (highTraits.includes('dependencyIndependence')) {
    lines.push('她习惯了靠自己。求助对她来说不是一件轻松的事——她会先试过所有自己能做的事情，实在不行了，才会犹豫着开口。这种独立有时候会被误解为疏远，但对她来说，这是对自己的尊重。');
  } else if (lowTraits.includes('dependencyIndependence')) {
    lines.push('她知道一个人的力量是有限的。她愿意在需要的时候依靠别人，也相信关系中的相互支撑不是软弱，而是一种成熟。在人和人之间，她找到的不是负担，而是安全。');
  }

  // Risk aversion
  if (highTraits.includes('riskAversion')) {
    lines.push('她对不确定性有一种天然的警觉。值得冒险的事，她会反复衡量——这并不是胆小，而是她对安全感的看重，远超过对刺激的渴望。她宁愿走得稳，也不愿走得快而后悔。');
  } else if (lowTraits.includes('riskAversion')) {
    lines.push('她不太怕未知。比起稳妥的路径，她更在意那件事值不值得——如果值得，风险反而是让她觉得"这真的是我"的理由。她不是鲁莽，只是相比后悔没做，她更愿意承受做了的后果。');
  }

  // Empathy
  if (highTraits.includes('empathyTendency')) {
    lines.push('她的同理心很强——不是那种刻意的"我理解你"，而是一种自动的共振。别人还没开口，她已经感觉到气氛的变化。这让她在亲密关系中很受信任，但也让她常常背上了不属于自己的情绪重量。');
  } else if (lowTraits.includes('empathyTendency')) {
    lines.push('她不是不关心别人的感受，而是她更习惯用理性去回应，而不是用情绪。面对别人的痛苦，她会想"我能做什么"而不是"我也好难过"。这是一种能力——在别人被情绪淹没时，她是那个还能站着的人。');
  }

  // Action preference
  if (highTraits.includes('actionPreference')) {
    lines.push('她是一个先做再说的人。不是冲动，而是她相信行动本身会带来答案——等着想清楚有时候反而会困在原地。她的风格是：在移动中瞄准，而不是先瞄准再移动。');
  } else if (lowTraits.includes('actionPreference')) {
    lines.push('她更倾向于想好了再动。观察、思考、在心里推演一遍——然后才是行动。这让她看起来比同龄人稳重，但也让她在一些需要快速反应的时候错过了一些可能性。');
  }

  return lines.join('\n\n');
}

/**
 * Cross-dimension synthesis — connect related traits into deeper insights.
 * This is what makes the profile feel like "understanding" rather than "listing."
 */
function generateCrossDimensionSynthesis(
  dims: UserProfile['personalityDimensions']
): string {
  const highTraits = getHighTraits(dims);
  const lowTraits = getLowTraits(dims);
  const insights: string[] = [];

  // High empathy + low social energy: deeply feels but needs solitude
  if (highTraits.includes('empathyTendency') && lowTraits.includes('socialEnergy')) {
    insights.push('最让我感触的是——她有很强的共情能力，能敏锐地感受到别人的情绪，但她的社交能量却是内向的。这意味着她常常在感受到很多之后，需要一个人安静地消化那些不属于自己的情绪。这是一种比别人更累的温柔。');
  }

  // High empathy + high control need: feels others' pain but wants to fix it
  if (highTraits.includes('empathyTendency') && highTraits.includes('controlNeed')) {
    insights.push('她的共情和控制欲之间存在一种张力：她感受到别人的痛苦，然后忍不住想要去解决它——但有些事不是她能控制的。这种"感受到却不一定能帮上"的冲突，可能是她内心疲惫的一个重要来源。');
  }

  // High independence + low disclosure: alone but not necessarily by choice
  if (highTraits.includes('dependencyIndependence') && lowTraits.includes('selfDisclosureTendency')) {
    insights.push('她习惯了一个人处理事情，也不轻易对人敞开心扉——这两者叠加在一起，让她看起来很"不需要别人"。但独立和封闭之间的那条线，有时候并不像看起来那么清晰。');
  }

  // High reflection + low emotional stability: thinks deeply about pain
  if (highTraits.includes('reflectionAbility') && lowTraits.includes('emotionalStability')) {
    insights.push('她有一个值得关注的特点：她的情绪不太平稳，但她的反思能力又很强。这意味着她在难过的时候不只是难过——她还会反复去想"我为什么难过"，这让她的情感体验比别人更深，但有时候也更难走出来。');
  }

  // Low risk + high action preference: acts fast but plays safe — interesting tension
  if (lowTraits.includes('riskAversion') && highTraits.includes('actionPreference')) {
    insights.push('她行动力很强，但同时也很在意安全——这是一个有意思的组合。她不是那种不顾后果的人，她的快是"想好了底线的快"，不是鲁莽，而是在安全范围内的果断。');
  }

  // High relationship sensitivity + high independence: needs people but resists relying
  if (highTraits.includes('relationshipSensitivity') && highTraits.includes('dependencyIndependence')) {
    insights.push('在关系里，她处于一种微妙的矛盾中：她对他人的情绪和反应非常敏感，但她又不习惯依赖任何人。她会在乎、会观察、会在意——但不太会开口说"我需要你"。这种自给自足的敏感，是她的性格中最容易被误解的地方。');
  }

  if (insights.length === 0) return '';
  return insights.slice(0, 2).join('\n\n');
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
  const coreNarrative = narr.coreNarrative || '复杂而真实';
  const reflectionAbility = dims.reflectionAbility.value;
  const empathy = dims.empathyTendency.value;
  const independence = dims.dependencyIndependence.value;
  const socialEnergy = dims.socialEnergy.value;
  const risk = dims.riskAversion.value;

  // Personalized closing — match the most distinctive trait
  if (reflectionAbility >= 7) {
    return `她是一个会回头审视自己的人。这既是天赋，也是一种辛苦——因为她看到的比别人更多，包括那些不太好看的部分。\n\n但也许正是这种"看见自己"的能力，让她在人群中多了一层人所不知的深刻。`;
  }
  if (empathy >= 7) {
    return `她像一面敏感的镜子——映照着别人的情绪，也承受着因此而来的重量。\n\n这种敏感不是弱点，而是她理解世界的特殊方式。她不是那种会把一切想得很简单的人，因为她感受到的太多。但也许，这正是她能触碰到人心深处的原因。`;
  }
  if (independence >= 7) {
    return `她是一个可以依靠自己的人。这比大多数人能做到的都更难——一个人撑过一些东西，一个人想明白一些事情。\n\n独立是她的盔甲，但她也会在一些不经意的瞬间发现，有些温柔只有在对别人卸下盔甲时才会到来。`;
  }
  if (socialEnergy <= 4) {
    return `有时候安静的人不是没有故事，而是他们的故事需要被认真地问，才能被好好地听。\n\n她是那种深水型的人——表面不容易起波澜，但越往下越有温度，越往下越亮。也许这就是为什么和她相处久了的人，会越来越觉得珍贵。`;
  }
  if (risk >= 7) {
    return `她不是一个轻易冒险的人。她珍视已经拥有的东西——稳定、安全、可预期。\n\n这不是胆怯，而是她的节奏。在别人急着往前跑的时候，她会在后面慢慢走。而当那些人精疲力尽地停下来时，会发现她不慌不忙地跟在后面——什么都没错过。`;
  }

  // Default: warm, non-classifying closing
  return `也许最准确的说法是：她是一个${coreNarrative}的人。\n\n不是标签能概括的，不是问卷能测出来的。她是一段正在进行中的故事，有过去的回声，也有未来的空白页。`;
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
import type { NarrativeDimensions } from '../../../shared/types';
