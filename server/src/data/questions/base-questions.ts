/**
 * Foundation Interview Questions — based on narrative psychology research.
 *
 * Design principles (McAdams Life Story Interview, Big Five narrative mapping,
 * Motivational Interviewing OARS framework):
 * 1. Open-ended, elicit stories not yes/no answers
 * 2. Ask about concrete experiences, not abstract self-assessments
 * 3. Cover all 12 personality dimensions through narrative indices
 * 4. Progress from rapport-building → deeper self-exploration
 * 5. Each question serves as a "key scene" prompt in the life-story tradition
 *
 * These 8 questions are MANDATORY — every user goes through them before
 * entering dynamic follow-up. Even when LLM is enabled, the foundation
 * phase uses structured questions to ensure consistent coverage.
 */

export interface BaseQuestion {
  id: string;
  text: string;
  targets: string[];       // personality dimensions targeted
  category: string;
  followUpHints: string[]; // what to probe if answer is rich
  phaseOrder: number;      // 0-7, the order in which this question is asked
}

export const FOUNDATION_QUESTIONS: BaseQuestion[] = [
  {
    id: 'fnd_life_chapter',
    text: '如果把你的生活想象成一本书，你觉得现在正在写第几章？这一章大概在讲一个什么样的故事？',
    targets: ['coreNarrative', 'reflectionAbility', 'selfExplanationPatterns', 'emotionalStability'],
    category: 'identity',
    followUpHints: [
      '前面的章节是什么样的',
      '这一章的标题会是什么',
      '你觉得下一章可能会写什么',
    ],
    phaseOrder: 0,
  },
  {
    id: 'fnd_high_point',
    text: '你能想起一个让你觉得特别满足、或者特别快乐的时刻吗？不用是什么大事——就是一个你觉得"那一刻挺好的"的场景。',
    targets: ['socialEnergy', 'actionPreference', 'emotionalStability', 'empathyTendency'],
    category: 'emotional',
    followUpHints: [
      '那时候有别人在场吗',
      '那种满足感主要来自什么',
      '这样的时刻在你的生活里经常出现吗',
    ],
    phaseOrder: 1,
  },
  {
    id: 'fnd_low_point',
    text: '每个人的生活里都有一些比较难的时候。你能想起一段让你觉得很难熬的时期吗？那时候你是怎么过来的？',
    targets: ['emotionalStability', 'defenseMechanisms', 'reflectionAbility', 'dependencyIndependence'],
    category: 'emotional',
    followUpHints: [
      '那段经历让你对自己有什么新的认识',
      '有谁在那段时间里对你特别重要',
      '回头看，你觉得你当时的应对方式怎么样',
    ],
    phaseOrder: 2,
  },
  {
    id: 'fnd_relationship',
    text: '在你生命中比较重要的关系里——可以是家人、朋友、伴侣——你觉得什么样的时刻让你感到自己真正被在乎？',
    targets: ['relationshipSensitivity', 'dependencyIndependence', 'selfDisclosureTendency', 'empathyTendency'],
    category: 'relationship',
    followUpHints: [
      '这个人做了什么让你觉得被在乎',
      '你觉得你对这个人来说意味着什么',
      '在你的关系里，你更倾向于照顾别人还是被照顾',
    ],
    phaseOrder: 3,
  },
  {
    id: 'fnd_decision',
    text: '在你的生活里，有没有一个对你影响很大的决定？当时你是怎么做出这个选择的——想了很久，还是凭直觉？',
    targets: ['decisionStyle', 'riskAversion', 'controlNeed', 'reflectionAbility'],
    category: 'decision',
    followUpHints: [
      '如果现在回头再看，你会做同样的选择吗',
      '做决定的时候，你最在意的是什么',
      '有没有谁的意见对你这个决定影响很大',
    ],
    phaseOrder: 4,
  },
  {
    id: 'fnd_self_other_gap',
    text: '你觉得别人眼中的你，和你自己感觉中的你，是一样的吗？如果不一样，最大的不同在哪里？',
    targets: ['selfExpressionTendency', 'empathyTendency', 'selfExplanationPatterns', 'narrativeDimensions'],
    category: 'identity',
    followUpHints: [
      '你有没有过"被误解"的体验',
      '你会在不同的人面前展现不同的自己吗',
      '你觉得这种"不一样"让你舒服还是不太舒服',
    ],
    phaseOrder: 5,
  },
  {
    id: 'fnd_emotional_weather',
    text: '如果把你最近这段时间的情绪比作天气，你觉得更像什么样的天气？为什么是这种天气？',
    targets: ['emotionalStability', 'selfDisclosureTendency', 'narrativeDimensions', 'defenseMechanisms'],
    category: 'emotional',
    followUpHints: [
      '这种"天气"持续多久了',
      '在什么情况下天气会变',
      '你通常怎么度过"坏天气"',
    ],
    phaseOrder: 6,
  },
  {
    id: 'fnd_future_self',
    text: '如果可以抛开所有现实的限制——不用考虑"应不应该"，只考虑"想不想"——五年后的你，最希望自己是一个什么样的人？',
    targets: ['coreNarrative', 'actionPreference', 'reflectionAbility', 'selfExplanationPatterns'],
    category: 'growth',
    followUpHints: [
      '你觉得现在的自己和那个理想中的自己差多远',
      '有什么东西在阻挡你成为那个人吗',
      '如果可以迈出一小步，那会是什么',
    ],
    phaseOrder: 7,
  },
];

// Backwards-compatible alias
export const BASE_QUESTIONS = FOUNDATION_QUESTIONS;

/**
 * Returns the next foundation question to ask, based on which ones have already been asked.
 */
export function getNextFoundationQuestion(askedIds: string[]): BaseQuestion | null {
  const remaining = FOUNDATION_QUESTIONS.filter(q => !askedIds.includes(q.id));
  if (remaining.length === 0) return null;
  // Return in phaseOrder sequence
  remaining.sort((a, b) => a.phaseOrder - b.phaseOrder);
  return remaining[0];
}

/**
 * Returns all foundation questions not yet asked, in order.
 */
export function getPendingFoundationQuestions(askedIds: string[]): BaseQuestion[] {
  return FOUNDATION_QUESTIONS
    .filter(q => !askedIds.includes(q.id))
    .sort((a, b) => a.phaseOrder - b.phaseOrder);
}

/**
 * Check if all foundation questions have been asked.
 */
export function isFoundationComplete(askedIds: string[]): boolean {
  return FOUNDATION_QUESTIONS.every(q => askedIds.includes(q.id));
}

// ---- Legacy compatibility (keeps existing orchestrator working) ----

export function pickInitialQuestions(count: number = 4): BaseQuestion[] {
  return FOUNDATION_QUESTIONS.slice(0, count);
}

export function getNextQuestion(askedIds: string[]): BaseQuestion | null {
  return getNextFoundationQuestion(askedIds);
}
