import type { FollowUpSuggestion } from '@shared/types';

interface DigSignal {
  type: 'emotion' | 'theme_repeat' | 'specific_event' | 'contradiction' | 'vagueness' | 'relationship' | 'turning_point';
  strength: number; // 0-10
  excerpt: string;
  reason: string;
  suggestedDirection: string;
}

/**
 * Analyze user response for "dig-worthy" signals.
 * Returns follow-up suggestions ranked by priority.
 */
export function analyzeForDigging(
  userMessage: string,
  conversationHistory: string[],  // last N user messages for context
  currentProfile: { completedDimensions: string[]; pendingDimensions: string[] }
): FollowUpSuggestion[] {
  const signals: DigSignal[] = [];

  // 1. Emotional signals
  const emotionalIntensity = detectEmotionalIntensity(userMessage);
  if (emotionalIntensity >= 5) {
    signals.push({
      type: 'emotion',
      strength: emotionalIntensity,
      excerpt: userMessage.slice(0, 100),
      reason: `情绪强度 ${emotionalIntensity}/10，值得追问`,
      suggestedDirection: '问问当时发生了什么，以及后来的感受变化',
    });
  }

  // 2. Repeated themes
  const repeatedTheme = detectRepeatedThemes(userMessage, conversationHistory);
  if (repeatedTheme) {
    signals.push({
      type: 'theme_repeat',
      strength: 7,
      excerpt: repeatedTheme,
      reason: `主题"${repeatedTheme}"反复出现`,
      suggestedDirection: '这个主题对你来说意味着什么？',
    });
  }

  // 3. Specific events mentioned
  const events = detectSpecificEvents(userMessage);
  for (const event of events) {
    signals.push({
      type: 'specific_event',
      strength: 6,
      excerpt: event,
      reason: '提到了具体事件',
      suggestedDirection: '可以多聊聊这件事的细节',
    });
  }

  // 4. Contradictions within the message
  const contradictions = detectInMessageContradictions(userMessage);
  for (const c of contradictions) {
    signals.push({
      type: 'contradiction',
      strength: 8,
      excerpt: c,
      reason: '表达中存在矛盾',
      suggestedDirection: '温柔地指出矛盾，看看对方怎么解释',
    });
  }

  // 5. Vagueness / avoidance
  const vaguenessScore = detectVagueness(userMessage);
  if (vaguenessScore >= 6) {
    signals.push({
      type: 'vagueness',
      strength: vaguenessScore,
      excerpt: userMessage.slice(0, 100),
      reason: '回答比较模糊或回避',
      suggestedDirection: '可以换个角度轻问，但不逼迫',
    });
  }

  // 6. Relationship mentions
  const relationScore = detectRelationshipContent(userMessage);
  if (relationScore >= 5) {
    signals.push({
      type: 'relationship',
      strength: relationScore,
      excerpt: userMessage.slice(0, 100),
      reason: '涉及重要关系',
      suggestedDirection: '这个人对你影响大吗？可以多说说',
    });
  }

  // 7. Turning points
  const turningPoint = detectTurningPoint(userMessage);
  if (turningPoint) {
    signals.push({
      type: 'turning_point',
      strength: 9,
      excerpt: turningPoint,
      reason: '可能是重要转折点',
      suggestedDirection: '那个时刻发生了什么变化？',
    });
  }

  // Rank by strength, convert to FollowUpSuggestion
  return signals
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((s, i) => ({
      topic: s.type,
      priority: Math.min(10, s.strength),
      reason: s.reason,
      suggestedQuestion: generateFollowUpQuestion(s),
    }));
}

function detectEmotionalIntensity(text: string): number {
  let score = 0;
  const highIntensity = ['崩溃', '绝望', '愤怒', '痛哭', '撕心裂肺', '承受不了', '受不了', '炸了', '疯了', '受不了了'];
  const mediumIntensity = ['难过', '焦虑', '害怕', '委屈', '生气', '失眠', '痛苦', '伤心', '烦躁'];
  const mildIntensity = ['不太舒服', '有点', '稍微', '不太开心', '低落', '累'];

  for (const w of highIntensity) if (text.includes(w)) score += 3;
  for (const w of mediumIntensity) if (text.includes(w)) score += 2;
  for (const w of mildIntensity) if (text.includes(w)) score += 1;

  // Check for exclamation marks and repetition
  if (/[！!]{2,}/.test(text)) score += 1;
  if (/(.{2,})\1{2,}/.test(text)) score += 1; // repeated phrases

  return Math.min(10, score);
}

function detectRepeatedThemes(text: string, history: string[]): string | null {
  const themes = [
    { words: ['一个人', '独处', '孤独', '寂寞'], label: '独处与孤独' },
    { words: ['不被理解', '误解', '不懂我'], label: '不被理解' },
    { words: ['妈妈', '爸爸', '父母', '家里'], label: '家庭关系' },
    { words: ['工作', '压力', '加班', '职场'], label: '工作压力' },
    { words: ['分手', '前任', '恋爱', '喜欢'], label: '亲密关系' },
    { words: ['朋友', '信任', '背叛', '疏远'], label: '友情' },
    { words: ['自己', '自我', '我是'], label: '自我认知' },
    { words: ['改变', '成长', '以前', '现在'], label: '变化与成长' },
  ];

  for (const theme of themes) {
    let currentCount = 0;
    for (const w of theme.words) {
      if (text.includes(w)) currentCount++;
    }
    for (const h of history.slice(-3)) {
      for (const w of theme.words) {
        if (h.includes(w)) currentCount++;
      }
    }
    if (currentCount >= 3) return theme.label;
  }
  return null;
}

function detectSpecificEvents(text: string): string[] {
  const events: string[] = [];
  const markers = [
    /那次/g, /当时/g, /有一.*次/g, /那天/g, /记得.*有一次/g,
    /大学.*时候/g, /小时候/g, /去年/g, /前.*年/g,
    /第一次/g, /最后一次/g,
  ];
  for (const m of markers) {
    let match;
    while ((match = m.exec(text)) !== null) {
      events.push(match[0]);
    }
  }
  return [...new Set(events)].slice(0, 2);
}

function detectInMessageContradictions(text: string): string[] {
  const contradictions: string[] = [];

  const patterns: [RegExp, string][] = [
    [/不在乎.*但是|不在意.*可是|无所谓.*不过/g, '声称不在意但有转折'],
    [/不想.*但是.*还是.*想/g, '不想但还在想'],
    [/一个人.*也.*挺好.*但是/g, '声称独立但有保留'],
    [/不.*需要.*别人.*但是/g, '不需要但有转折'],
    [/说.*不.*在意.*其实/g, '直接承认矛盾'],
  ];

  for (const [pattern, label] of patterns) {
    if (pattern.test(text)) {
      contradictions.push(label);
    }
  }
  return contradictions;
}

function detectVagueness(text: string): number {
  let score = 0;
  const vagueMarkers = [
    '可能吧', '不知道', '说不好', '没什么特别的', '还行', '都差不多',
    '就那么回事', '不好说', '随便', '都行', '无所谓',
  ];
  for (const m of vagueMarkers) {
    if (text.includes(m)) score += 2;
  }
  // Short responses are often evasive
  if (text.length < 20) score += 3;
  return Math.min(10, score);
}

function detectRelationshipContent(text: string): number {
  let score = 0;
  const relationWords = [
    '妈妈', '爸爸', '父母', '前任', '男朋友', '女朋友',
    '闺蜜', '好朋友', '老板', '同事', '家人', '对象',
  ];
  for (const w of relationWords) {
    if (text.includes(w)) score += 3;
  }
  return Math.min(10, score);
}

function detectTurningPoint(text: string): string | null {
  const markers = [
    /从.*那.*以后/,
    /那.*是.*我.*第.*一.*次/,
    /突.*然.*发.*现/,
    /后.*来.*才.*知.*道/,
    /那.*个.*时.*候.*我.*终.*于/,
    /那.*一.*刻.*我.*觉.*得/,
    /从.*那.*天.*开.*始/,
    /改.*变.*了.*我.*的/,
  ];
  for (const m of markers) {
    const match = text.match(m);
    if (match) return match[0];
  }
  return null;
}

function generateFollowUpQuestion(signal: DigSignal): string {
  const templates: Record<string, string[]> = {
    emotion: [
      '你提到这件事的时候，我感觉到了一些情绪——如果不介意的话，可以多说说当时发生了什么吗？',
      '那个时刻对你来说，最难受的是什么？',
      '后来那种感觉有变化吗？',
    ],
    theme_repeat: [
      '我注意到你提到了好几次"${topic}"——你觉得这件事在你生活里占的分量重吗？',
      '这个主题好像一直在你心里——如果用一个词形容它对你的意义，会是什么？',
    ],
    specific_event: [
      '你提到的"${excerpt}"，可以多说说那次经历吗？',
      '那时候你的感受是什么样的？',
    ],
    contradiction: [
      '我有一点好奇——你前面说不在意，但好像又记得很清楚。你自己怎么理解这种矛盾？',
      '我隐约感觉到你说的和做的可能不太一样——你自己意识到了吗？',
    ],
    vagueness: [
      '你是不是不太想聊这个？没关系，我们可以换一个方向。',
      '如果这个问题太重了，你可以跳过它。',
    ],
    relationship: [
      '这个人对你来说是什么样的存在？',
      '你和他的关系有过比较大的变化吗？',
    ],
    turning_point: [
      '那个转折点对你后来的影响大吗？',
      '如果可以回到那个时刻，你会对自己说什么？',
    ],
  };

  const pool = templates[signal.type] || templates.emotion;
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template
    .replace('${topic}', signal.excerpt)
    .replace('${excerpt}', signal.excerpt);
}
