/**
 * Safety & Tone Agent:
 * Ensures all system output is safe, natural, non-diagnostic, and appropriately empathetic.
 * This runs as the final filter before any content reaches the user.
 */

interface SafetyCheck {
  passed: boolean;
  flags: SafetyFlag[];
  sanitized: string;
}

interface SafetyFlag {
  type: 'diagnostic' | 'absolute_statement' | 'invasive' | 'over_familiar' | 'clinical';
  original: string;
  issue: string;
}

export function sanitizeOutput(text: string): SafetyCheck {
  const flags: SafetyFlag[] = [];
  let sanitized = text;

  // Rule 1: Remove diagnostic language
  const diagnosticTerms = [
    '抑郁症', '焦虑症', '人格障碍', '创伤后应激', 'PTSD', 'ADHD',
    '强迫症', '双相', '精神分裂', '边缘型', '自恋型',
    '症状', '诊断', '治疗', '病理', '障碍', '疾病',
  ];
  for (const term of diagnosticTerms) {
    if (sanitized.includes(term)) {
      flags.push({ type: 'diagnostic', original: term, issue: '使用了临床诊断术语' });
      // Replace with softer language
      const replacements: Record<string, string> = {
        '抑郁症': '持续低落的情绪',
        '焦虑症': '长期的紧张和担忧',
        '强迫症': '反复出现的思维',
        '创伤后应激': '过去的伤害留下的影响',
        'PTSD': '过去的伤害留下的影响',
        '症状': '表现',
        '诊断': '理解',
        '治疗': '帮助',
      };
      sanitized = sanitized.replace(term, replacements[term] || '一些困扰');
    }
  }

  // Rule 2: Soften absolute statements about the user
  const absolutePatterns: [RegExp, string][] = [
    [/你就是[一种个]/g, '你似乎是一个'],
    [/你永远是/g, '你常常是'],
    [/你从来不/g, '你似乎很少'],
    [/你就是这种人/g, '你给我的感觉是这样'],
    [/本质上.*你就是/g, '从我们的对话来看，你'],
    [/你的本质/g, '你的特点'],
    [/你天生/g, '你可能倾向于'],
    [/注定/g, '很可能'],
  ];
  for (const [pattern, replacement] of absolutePatterns) {
    if (pattern.test(sanitized)) {
      flags.push({ type: 'absolute_statement', original: pattern.source, issue: '使用了过于绝对的表述' });
      sanitized = sanitized.replace(pattern, replacement);
    }
  }

  // Rule 3: Add softening qualifiers where needed
  sanitized = addSofteningQualifiers(sanitized);

  // Rule 4: Check for over-familiarity
  if (/宝贝|亲爱的|乖乖|小可爱/.test(sanitized)) {
    flags.push({ type: 'over_familiar', original: '', issue: '称呼过于亲密' });
    sanitized = sanitized.replace(/宝贝|亲爱的|乖乖|小可爱/g, '你');
  }

  // Rule 5: Check for clinical/analytical tone
  if (/根据.*分析|数据显示|统计.*表明|研究.*显示/.test(sanitized)) {
    flags.push({ type: 'clinical', original: '', issue: '语言过于分析化/临床化' });
  }

  return { passed: flags.length === 0, flags, sanitized };
}

function addSofteningQualifiers(text: string): string {
  // Add softening words to strong assertions
  let result = text;

  // Replace assertive "你是" with softer alternatives (but not always)
  result = result.replace(/^你是(.{1,20})的/gm, '你似乎是$1的');
  result = result.replace(/你是一个(.{1,15})人/g, '你可能是一个$1的人');

  return result;
}

/**
 * Determine if user is showing signs of discomfort
 */
export function detectUserDiscomfort(message: string): {
  uncomfortable: boolean;
  severity: 'low' | 'medium' | 'high';
  reason: string;
} {
  let severity: 'low' | 'medium' | 'high' = 'low';
  let reason = '';
  let uncomfortable = false;

  const highDiscomfort = [
    '不想说了', '别问了', '够了', '不要再问了', '你烦不烦',
    '不想聊', '太累了', '不想提', '不谈这个',
  ];
  const mediumDiscomfort = [
    '不知道', '说不清', '没什么好说的', '下次再说', '现在不想说',
    '跳过', '不聊这个', '换个话题',
  ];
  const lowDiscomfort = [
    '可能吧', '也许', '差不多', '随便', '都行',
    '不太想说', '有点难说',
  ];

  for (const phrase of highDiscomfort) {
    if (message.includes(phrase)) {
      severity = 'high';
      reason = `用户表达了明确的回避: "${phrase}"`;
      uncomfortable = true;
      break;
    }
  }

  if (!uncomfortable) {
    for (const phrase of mediumDiscomfort) {
      if (message.includes(phrase)) {
        severity = 'medium';
        reason = `用户表达了回避倾向: "${phrase}"`;
        uncomfortable = true;
        break;
      }
    }
  }

  if (!uncomfortable) {
    for (const phrase of lowDiscomfort) {
      if (message.includes(phrase)) {
        severity = 'low';
        reason = `用户回答较模糊: "${phrase}"`;
        uncomfortable = true;
        break;
      }
    }
  }

  return { uncomfortable, severity, reason };
}

/**
 * Generate a gentle response when user is uncomfortable
 */
export function generateComfortResponse(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'high':
      return '没关系，我们不聊这个。你可以随时告诉我你想聊什么，或者我们也可以停一停。';
    case 'medium':
      return '好的，这个问题先放一放。那我们换一个轻松一点的方向——';
    case 'low':
      return '嗯，不用勉强。你可以按照你舒服的节奏来。';
  }
}
