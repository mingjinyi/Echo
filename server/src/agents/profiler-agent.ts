import type { PersonalityDimensions, Confidence, Evidence, TraitValue } from '../../../shared/types';

// Keyword and pattern dictionaries for personality dimension inference
// Each dimension has indicators organized by direction (high vs low)

interface DimensionIndicator {
  keywords: string[];
  phrases: RegExp[];
  weight: number; // how strongly this indicates the trait
}

interface DimensionConfig {
  high: DimensionIndicator;
  low: DimensionIndicator;
  description: string;
}

const DIMENSION_INDICATORS: Record<keyof PersonalityDimensions, DimensionConfig> = {
  emotionalStability: {
    description: '情绪稳定性',
    high: {
      keywords: ['平静', '稳定', '不容易波动', '自我调节', '冷静', '接受', '顺其自然', '看开', '没什么大不了', '习惯了', '不在意'],
      phrases: [/不太会影响我/, /很快就过去/, /自己能消化/, /不怎么波动/, /一直很稳/, /睡一觉就/],
      weight: 0.15,
    },
    low: {
      keywords: ['崩溃', '焦虑', '失眠', '反复想', '控制不住', '突然哭', '愤怒', '烦躁', '敏感', '承受不了', '喘不过气', '绷不住', '很累', '撑不住'],
      phrases: [/忍不住/, /一直想/, /停不下来/, /很难平静/, /越想越/, /睡不好/, /突然就/, /不知道为什么/],
      weight: 0.15,
    },
  },

  socialEnergy: {
    description: '社交能量',
    high: {
      keywords: ['喜欢聚会', '一群人', '热闹', '聊天能充电', '朋友多', '主动约', '见面', '一起', '热闹让我开心'],
      phrases: [/和朋友.*充电/, /聚会.*期待/, /喜欢.*热闹/, /主动.*约/],
      weight: 0.15,
    },
    low: {
      keywords: ['独处', '一个人待着', '社交会累', '安静', '不想说话', '需要空间', '人太多会累', '不想见人', '自己待着舒服', '回避聚会', '耗电', '社交恐惧'],
      phrases: [/一个人.*舒服/, /社交.*累/, /不想.*见人/, /需要.*独处/, /自己.*待着/, /回家.*充电/],
      weight: 0.15,
    },
  },

  selfExpressionTendency: {
    description: '主动表达倾向',
    high: {
      keywords: ['直接说', '表达', '沟通', '说出来', '讲清楚', '不会憋着', '说出来才舒服', '有问题就说', '不藏着'],
      phrases: [/我觉得.*应该说/, /直接.*表达/, /不会.*憋/],
      weight: 0.15,
    },
    low: {
      keywords: ['不说', '憋着', '不会表达', '不知道怎么说', '写出来比说出来容易', '不会主动说', '沉默', '放在心里', '不习惯说', '不好意思说'],
      phrases: [/不说.*比较好/, /.在心里/, /不.*擅长.*表达/, /不知道.*怎么.*说/],
      weight: 0.15,
    },
  },

  selfDisclosureTendency: {
    description: '自我暴露倾向',
    high: {
      keywords: ['分享', '倾诉', '什么都聊', '容易相信', '愿意讲', '不藏着掖着', '开放', '坦诚'],
      phrases: [/什么.*都.*说/, /不.*隐瞒/, /愿意.*分享/],
      weight: 0.15,
    },
    low: {
      keywords: ['不会全说', '保留', '信任需要时间', '试探', '看人', '不会一开始就', '保护自己', '选择性说', '不想暴露太多'],
      phrases: [/不会.*全.*说/, /需要.*时间.*信任/, /.一部分.*自己/],
      weight: 0.15,
    },
  },

  dependencyIndependence: {
    description: '依赖/独立倾向',
    high: {
      keywords: ['自己解决', '不靠别人', '独立', '不想麻烦别人', '我能搞定', '依赖自己', '靠山是自己', '不轻易求助', '一个人也行'],
      phrases: [/不.*靠.*别人/, /自己.*处理/, /一个人.*也能/, /不.*需要.*帮忙/],
      weight: 0.12,
    },
    low: {
      keywords: ['需要陪伴', '依赖', '离不开', '想要有人', '需要一个依靠', '一个人不行', '害怕孤独', '需要被照顾', '想有人分担'],
      phrases: [/需要.*有人/, /离不开/, /一个人.*不行/, /想要.*陪伴/],
      weight: 0.12,
    },
  },

  riskAversion: {
    description: '风险规避倾向',
    high: {
      keywords: ['安全', '稳定', '不想冒险', '慎重', '再三考虑', '不敢试', '害怕失败', '稳妥', '有把握才做', '不做没把握的事'],
      phrases: [/不敢.*尝试/, /.怕.*失败/, /稳定.*重要/, /安全.*第一/],
      weight: 0.12,
    },
    low: {
      keywords: ['试了再说', '失败也没关系', '愿意冒险', '大不了重来', '刺激', '挑战', '不管了先做', '不试怎么知道'],
      phrases: [/试.*再说/, /不怕.*失败/, /勇敢.*试/],
      weight: 0.12,
    },
  },

  relationshipSensitivity: {
    description: '关系敏感度',
    high: {
      keywords: ['在意', '敏感', '察觉', '细微变化', '对方情绪', '反复想', '一句话想很久', '怕说错话', '过度解读', '在意别人怎么看'],
      phrases: [/对方.*一个.*眼神/, /一句.*话.*想了.*很久/, /怕.*别人.*不高兴/, /敏感.*察觉/],
      weight: 0.12,
    },
    low: {
      keywords: ['不太在意', '粗线条', '别人怎么想和我无关', '不纠结', '不计较', '没什么感觉', '懒得猜', '不琢磨'],
      phrases: [/不.*在意.*别人/, /不.*琢磨/, /不.*纠结.*关系/],
      weight: 0.12,
    },
  },

  controlNeed: {
    description: '控制感需求',
    high: {
      keywords: ['需要掌控', '计划', '不确定性让我焦虑', '安排好', '不能失控', '按节奏来', '提前准备', '不喜欢意外', '要有把握'],
      phrases: [/需要.*掌控/, /.计划.*安排好/, /不.*喜欢.*意外/, /.不确定性.*焦虑/],
      weight: 0.12,
    },
    low: {
      keywords: ['随缘', '顺其自然', '不勉强', '怎样都行', '没计划也行', '灵活', '流程不重要', '随便'],
      phrases: [/随.*缘/, /无所谓/, /怎么.*都.*行/],
      weight: 0.12,
    },
  },

  reflectionAbility: {
    description: '反思能力',
    high: {
      keywords: ['后来我意识到', '反思', '回头看', '我发现了自己的', '我其实在', '原因可能是', '我习惯性地', '我后来才明白', '自省'],
      phrases: [/后来.*才.*发现/, /.意识到.*自己/, /反思.*之后/, /回头看.*当时/],
      weight: 0.15,
    },
    low: {
      keywords: ['不知道为什么', '可能就这样吧', '不去想太多', '就是这样的性格', '天生如此', '没法改变'],
      phrases: [/不.*知道.*为什么/, /就.*这样/, /不.*想.*太多.*原因/],
      weight: 0.15,
    },
  },

  empathyTendency: {
    description: '共情倾向',
    high: {
      keywords: ['理解别人的感受', '换位思考', '能感觉到', '替别人想', '照顾对方', '共情', '不忍心', '心软'],
      phrases: [/站在.*对方.*角度/, /理解.*感受/, /替.*想/],
      weight: 0.12,
    },
    low: {
      keywords: ['不太懂别人的感受', '理智优先', '先管好自己', '每个人有自己的问题', '不过度代入'],
      phrases: [/每.*个人.*自己.*问题/, /不.*过度.*代入/, /先.*管.*自己/],
      weight: 0.12,
    },
  },

  actionPreference: {
    description: '行动偏好',
    high: {
      keywords: ['先做再说', '行动派', '解决问题', '做点什么', '行动起来', '不纠结', '干就完了', '直接处理'],
      phrases: [/先.*做/, /行动.*解决/, /不.*犹豫/],
      weight: 0.12,
    },
    low: {
      keywords: ['先想清楚', '观察', '不急着做', '想好再做', '等等看', '观望', '思考优先', '想明白了再'],
      phrases: [/先.*想.*清楚/, /观.*察.*再/, /不.*急着/],
      weight: 0.12,
    },
  },

  decisionStyle: {
    description: '决策风格',
    high: {
      keywords: ['逻辑', '分析', '利弊', '理性', '数据', '权衡', '推理', '条理', '按逻辑来'],
      phrases: [/理性.*分析/, /逻.*辑.*推/, /权衡.*利弊/],
      weight: 0.12,
    },
    low: {
      keywords: ['直觉', '感受', '感觉对了', '第六感', '心里觉得', '说不出为什么', '就是觉得', '跟着感觉', '感性', '冲动'],
      phrases: [/感觉.*对/, /直觉.*告诉/, /说不出.*理由/, /跟着.*感觉/],
      weight: 0.12,
    },
  },
};

export interface ProfilerOutput {
  dimension: string;
  previousValue: number;
  newValue: number;
  confidence: Confidence;
  evidence: string;
  direction: 'increased' | 'decreased' | 'unchanged';
}

/**
 * Analyze user response and update personality dimensions.
 * Returns list of changed dimensions with evidence.
 */
export function analyzeResponse(
  response: string,
  currentDimensions: PersonalityDimensions
): ProfilerOutput[] {
  const results: ProfilerOutput[] = [];
  const text = response.toLowerCase();

  for (const [dimKey, config] of Object.entries(DIMENSION_INDICATORS)) {
    const dim = dimKey as keyof PersonalityDimensions;
    const current = currentDimensions[dim];
    let score = current.value;
    let evidence = '';
    let totalWeight = 0;

    // Check high indicators
    for (const kw of config.high.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += config.high.weight * 10;
        evidence = `提到/暗示"${kw}"`;
        totalWeight += config.high.weight;
      }
    }
    for (const phrase of config.high.phrases) {
      if (phrase.test(response)) {
        score += config.high.weight * 10;
        evidence = `表达模式匹配: ${phrase.source}`;
        totalWeight += config.high.weight;
      }
    }

    // Check low indicators
    for (const kw of config.low.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score -= config.low.weight * 10;
        evidence = evidence || `提到/暗示"${kw}"`;
        totalWeight += config.low.weight;
      }
    }
    for (const phrase of config.low.phrases) {
      if (phrase.test(response)) {
        score -= config.low.weight * 10;
        evidence = evidence || `表达模式匹配: ${phrase.source}`;
        totalWeight += config.low.weight;
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(10, Math.round(score))) as TraitValue;

    if (Math.abs(score - current.value) >= 1 && totalWeight > 0) {
      const newConfidence = totalWeight >= 0.3 ? 'medium' : 'low';
      const betterConfidence = confidenceOrder(newConfidence) > confidenceOrder(current.confidence)
        ? newConfidence
        : current.confidence;

      results.push({
        dimension: dim,
        previousValue: current.value,
        newValue: score,
        confidence: betterConfidence as Confidence,
        evidence,
        direction: score > current.value ? 'increased' : score < current.value ? 'decreased' : 'unchanged',
      });
    }
  }

  return results;
}

/**
 * Extract narrative patterns from user response
 */
export function extractNarrativePatterns(response: string): {
  selfExplanations: string[];
  defenseMechanisms: string[];
  emotionalPatterns: string[];
  humorStyles: string[];
} {
  const patterns = {
    selfExplanations: [] as string[],
    defenseMechanisms: [] as string[],
    emotionalPatterns: [] as string[],
    humorStyles: [] as string[],
  };

  // Self-explanation patterns
  const selfExplanationMarkers = [
    /因为我是.*的人/,
    /我这种人.*就/,
    /可能.*我就是/,
    /我一直.*都/,
    /我天生/,
  ];
  for (const marker of selfExplanationMarkers) {
    const match = response.match(marker);
    if (match) patterns.selfExplanations.push(match[0]);
  }

  // Defense mechanism patterns
  const defenseMarkers: [RegExp, string][] = [
    [/不想.*说.*这个/, '回避话题'],
    [/没什么.*大不了/, '淡化'],
    [/别人.*也.*一样/, '正常化'],
    [/不.*关.*我的事/, '疏离'],
    [/我.*不在乎/, '否认'],
    [/可能.*我.*太.*敏感/, '自我怀疑'],
    [/算了.*不.*想/, '放弃思考'],
    [/习惯了/, '习惯化应对'],
    [/反正.*都.*一样/, '虚无化'],
  ];
  for (const [marker, label] of defenseMarkers) {
    if (marker.test(response)) patterns.defenseMechanisms.push(label);
  }

  // Emotional expression patterns
  const emotionMarkers: [RegExp, string][] = [
    [/有点.*难过/, '轻度悲伤'],
    [/突然.*哭/, '情绪爆发'],
    [/控制不住/, '情绪失控感'],
    [/一直.*想/, '反刍思维'],
    [/睡.*不.*着/, '躯体化'],
    [/说不出.*什么.*感觉/, '情感表达困难'],
    [/很.*开心/, '正向表达'],
    [/愤怒/, '愤怒'],
    [/委屈/, '委屈'],
    [/害怕/, '恐惧'],
    [/焦虑/, '焦虑'],
  ];
  for (const [marker, label] of emotionMarkers) {
    if (marker.test(response)) patterns.emotionalPatterns.push(label);
  }

  // Humor / self-deprecation patterns
  const humorMarkers: [RegExp, string][] = [
    [/可能.*我.*太.*傻/, '自嘲-傻'],
    [/我.*这种.*人/, '自嘲-归类'],
    [/哈哈哈/, '笑声缓冲'],
    [/搞笑.*的.*是/, '苦笑'],
    [/说.*来.*好笑/, '自嘲叙事'],
  ];
  for (const [marker, label] of humorMarkers) {
    if (marker.test(response)) patterns.humorStyles.push(label);
  }

  return patterns;
}

/**
 * Extract key relationships mentioned in response
 */
export function extractRelationships(response: string): Array<{
  label: string;
  relationType: string;
  emotionalTone: string;
}> {
  const relationships: Array<{ label: string; relationType: string; emotionalTone: string }> = [];

  const relationPatterns: [RegExp, string, string][] = [
    [/我.*妈/, '家人', '妈妈'],
    [/我.*爸/, '家人', '爸爸'],
    [/前任/, '伴侣', '前任'],
    [/男.*朋友|女.*朋友|对象|伴侣/, '伴侣', '伴侣'],
    [/闺蜜|好.*朋友|最.*好.*的.*朋友/, '朋友', '好朋友'],
    [/同事|老板|领导/, '同事', '同事'],
    [/室友/, '朋友', '室友'],
    [/同学/, '朋友', '同学'],
    [/老师/, '关系', '老师'],
  ];

  for (const [pattern, type, label] of relationPatterns) {
    if (pattern.test(response)) {
      // Detect emotional tone
      let tone = 'neutral';
      if (/爱|温暖|支持|帮.*我|在.*身边|理解/.test(response)) tone = '温暖';
      if (/伤害|失望|讨厌|疏远|离开|冷/.test(response)) tone = '复杂/负面';
      if (/感恩|谢谢|感激/.test(response)) tone = '感恩';

      relationships.push({ label, relationType: type, emotionalTone: tone });
    }
  }

  return relationships;
}

function confidenceOrder(c: Confidence): number {
  return c === 'high' ? 3 : c === 'medium' ? 2 : 1;
}
