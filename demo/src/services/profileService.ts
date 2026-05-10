/**
 * 用户画像引擎 - 12维度建模 + 覆盖度追踪 + 置信度递增
 */

// === 类型定义 ===

export interface DimensionData {
  content: string;
  confidence: number;
  source: string;
  lastUpdated: string;
  subDimensions?: Record<string, string>;
}

export interface BaseProfile {
  values: DimensionData;
  personality: DimensionData;
  cognition: DimensionData;
  workHabits: DimensionData;
  behaviorPrefs: DimensionData;
  decisionPrinciples: DimensionData;
  lifeStage: DimensionData;
}

export interface MirrorProfile {
  relationshipMap: DimensionData;
  regretClues: DimensionData;
  riskTolerance: DimensionData;
  capacityBoundary: DimensionData;
  selfNarrative: DimensionData;
}

export interface ProfileStyle {
  hardRules: string[];
  identity: string;
  speakingStyle: string;
  emotionalPatterns: string;
  interpersonal: string;
  corrections: string[];
}

export interface ProfileMetadata {
  version: number;
  createdAt: string;
  lastUpdated: string;
  socraticCompletion: number;
  dataSources: string[];
  stylePreferences: string[];
}

export interface Profile {
  base: BaseProfile;
  style: ProfileStyle;
  mirror: MirrorProfile;
  metadata: ProfileMetadata;
}

export interface CoverageItem {
  dimKey: string;
  displayName: string;
  covered: boolean;
  confidence: number;
  lastTouched: string;
}

export interface CoverageMap {
  items: CoverageItem[];
  completedCount: number;
  totalCount: number;
  estimatedSessionsRemaining: number;
}

// === 12维度定义 ===

export const DIMENSIONS: { dimKey: string; displayName: string }[] = [
  { dimKey: 'base.values', displayName: '价值观' },
  { dimKey: 'base.personality', displayName: '性格特征' },
  { dimKey: 'base.cognition', displayName: '认知模式' },
  { dimKey: 'base.workHabits', displayName: '工作习惯' },
  { dimKey: 'base.behaviorPrefs', displayName: '行为偏好' },
  { dimKey: 'base.decisionPrinciples', displayName: '决策原则' },
  { dimKey: 'base.lifeStage', displayName: '人生阶段' },
  { dimKey: 'mirror.relationshipMap', displayName: '关系图谱' },
  { dimKey: 'mirror.regretClues', displayName: '遗憾线索' },
  { dimKey: 'mirror.riskTolerance', displayName: '风险承受' },
  { dimKey: 'mirror.capacityBoundary', displayName: '能力边界' },
  { dimKey: 'mirror.selfNarrative', displayName: '自我叙事' },
];

// 覆盖度面板展示维度（左侧6个关键维度）
export const COVERAGE_DISPLAY_DIMS = [
  { key: 'values', label: '价值观', part: 'base' as const, icon: '◆', isRequired: true },
  { key: 'decisionPrinciples', label: '决策原则', part: 'base' as const, icon: '◇', isRequired: true },
  { key: 'personality', label: '性格', part: 'base' as const, icon: '●', isRequired: false },
  { key: 'riskTolerance', label: '风险承受', part: 'mirror' as const, icon: '◉', isRequired: false },
  { key: 'lifeStage', label: '人生阶段', part: 'base' as const, icon: '◎', isRequired: true },
  { key: 'regretClues', label: '遗憾线索', part: 'mirror' as const, icon: '◈', isRequired: true },
];

// 完整画像面板 - 基础画像维度
export const BASE_DIMS_DETAIL = [
  { key: 'values', label: '价值观', part: 'base' as const, isRequired: true },
  { key: 'personality', label: '性格特征', part: 'base' as const, isRequired: false },
  { key: 'cognition', label: '认知模式', part: 'base' as const, isRequired: false },
  { key: 'workHabits', label: '工作习惯', part: 'base' as const, isRequired: false },
  { key: 'behaviorPrefs', label: '行为偏好', part: 'base' as const, isRequired: false },
  { key: 'decisionPrinciples', label: '决策原则', part: 'base' as const, isRequired: true },
  { key: 'lifeStage', label: '人生阶段', part: 'base' as const, isRequired: true },
];

// 完整画像面板 - 深度画像维度
export const MIRROR_DIMS_DETAIL = [
  { key: 'relationshipMap', label: '关系图谱', part: 'mirror' as const, isRequired: false },
  { key: 'regretClues', label: '遗憾线索', part: 'mirror' as const, isRequired: true },
  { key: 'riskTolerance', label: '风险承受', part: 'mirror' as const, isRequired: false },
  { key: 'capacityBoundary', label: '能力边界', part: 'mirror' as const, isRequired: false },
  { key: 'selfNarrative', label: '自我叙事', part: 'mirror' as const, isRequired: false },
];

// === 苏格拉底问题 ===

export const SOCRATIC_QUESTIONS = [
  {
    id: 1,
    text: '我们不妨从最近说起——过去一两周里，有没有哪个时刻让你印象特别深？开心的、烦恼的、或者一闪而过的念头都可以。',
    hint: '就像跟朋友聊天一样，随便说说就好',
    targetDims: ['base.lifeStage', 'base.personality'],
  },
  {
    id: 2,
    text: '了解了。在你每天做的事情里，哪些让你觉得充实、时间过得特别快？反过来，哪些是纯粹的"不得不做"？',
    hint: '你投入时间的方式，藏着你最在意的东西',
    targetDims: ['base.values', 'base.behaviorPrefs', 'base.workHabits'],
  },
  {
    id: 3,
    text: '我想聊聊选择。假设面前有两条路：A 是大概率稳妥但没什么惊喜，B 是有可能很好也可能很糟——你一般会往哪边走？能结合你最近某个实际的选择来说说吗？',
    hint: '没有对错，每个人的风格都不一样',
    targetDims: ['base.decisionPrinciples', 'mirror.riskTolerance'],
  },
  {
    id: 4,
    text: '说到选择，往往跟身边的人有关。你生活里有没有一个人，对你的影响特别大——好的影响或者比较复杂的影响都算？',
    hint: '人是我们最重要的"环境"',
    targetDims: ['mirror.relationshipMap', 'base.personality'],
  },
  {
    id: 5,
    text: '如果把目前为止的人生比作一本书，你觉得现在正处在哪个章节？这个章节的"标题"大概会是什么？',
    hint: '不用想得太复杂，直觉回答就好',
    targetDims: ['mirror.selfNarrative', 'base.lifeStage', 'base.cognition'],
  },
  {
    id: 6,
    text: '最后一个问题了。如果接下来半年，你可以让生活里的一件事变好——任何一件事——你最想改变的是什么？',
    hint: '大的小的都算，不用想"怎么实现"',
    targetDims: ['mirror.regretClues', 'mirror.capacityBoundary', 'base.values'],
  },
];

// === 关键词到画像维度映射 ===

export const KEYWORD_DIM_MAP: Record<string, { part: 'base' | 'mirror'; key: string; subKey?: string }> = {
  // 价值观
  '成长优先': { part: 'base', key: 'values', subKey: '成长观' },
  '家庭优先': { part: 'base', key: 'values', subKey: '家庭观' },
  '追求自由': { part: 'base', key: 'values', subKey: '自由观' },
  '稳定至上': { part: 'base', key: 'values', subKey: '安全感' },
  '成就驱动': { part: 'base', key: 'values', subKey: '成就观' },
  '注重关系': { part: 'base', key: 'values', subKey: '关系观' },
  '享乐主义': { part: 'base', key: 'values', subKey: '享乐观' },
  '追求意义': { part: 'base', key: 'values', subKey: '意义观' },
  '金钱驱动': { part: 'base', key: 'values', subKey: '财富观' },
  '奉献精神': { part: 'base', key: 'values', subKey: '奉献观' },
  '平衡生活': { part: 'base', key: 'values', subKey: '平衡观' },
  // 性格
  '内向社交': { part: 'base', key: 'personality' },
  '外向社交': { part: 'base', key: 'personality' },
  '情感丰富': { part: 'base', key: 'personality' },
  '理性克制': { part: 'base', key: 'personality' },
  '完美主义': { part: 'base', key: 'personality' },
  '随性洒脱': { part: 'base', key: 'personality' },
  '敏感细腻': { part: 'base', key: 'personality' },
  '乐观开朗': { part: 'base', key: 'personality' },
  '沉稳内敛': { part: 'base', key: 'personality' },
  '固执己见': { part: 'base', key: 'personality' },
  '随和包容': { part: 'base', key: 'personality' },
  '急躁冲动': { part: 'base', key: 'personality' },
  '拖延倾向': { part: 'base', key: 'personality' },
  '自律严谨': { part: 'base', key: 'personality' },
  '好奇心强': { part: 'base', key: 'personality' },
  // 工作习惯
  '独立工作': { part: 'base', key: 'workHabits' },
  '团队协作': { part: 'base', key: 'workHabits' },
  '早起高效': { part: 'base', key: 'workHabits' },
  '夜猫子型': { part: 'base', key: 'workHabits' },
  '专注时段': { part: 'base', key: 'workHabits' },
  // 决策原则
  '行动犹豫': { part: 'base', key: 'decisionPrinciples' },
  '果断行动': { part: 'base', key: 'decisionPrinciples' },
  '直觉驱动': { part: 'base', key: 'decisionPrinciples' },
  '数据驱动': { part: 'base', key: 'decisionPrinciples' },
  '安全优先': { part: 'base', key: 'decisionPrinciples' },
  '追求最优': { part: 'base', key: 'decisionPrinciples' },
  '从众决策': { part: 'base', key: 'decisionPrinciples' },
  '独立决断': { part: 'base', key: 'decisionPrinciples' },
  '感情用事': { part: 'base', key: 'decisionPrinciples' },
  '利弊权衡': { part: 'base', key: 'decisionPrinciples' },
  '冲动决策': { part: 'base', key: 'decisionPrinciples' },
  // 认知模式
  '深度思考': { part: 'base', key: 'cognition' },
  '务实主义': { part: 'base', key: 'cognition' },
  '抽象思维': { part: 'base', key: 'cognition' },
  '细节导向': { part: 'base', key: 'cognition' },
  '大局观强': { part: 'base', key: 'cognition' },
  '经验主义': { part: 'base', key: 'cognition' },
  '创新思维': { part: 'base', key: 'cognition' },
  '逻辑严密': { part: 'base', key: 'cognition' },
  '发散思维': { part: 'base', key: 'cognition' },
  // 风险承受
  '风险规避': { part: 'mirror', key: 'riskTolerance' },
  '热爱挑战': { part: 'mirror', key: 'riskTolerance' },
  '谨慎保守': { part: 'mirror', key: 'riskTolerance' },
  '乐于冒险': { part: 'mirror', key: 'riskTolerance' },
  '稳健前行': { part: 'mirror', key: 'riskTolerance' },
  // 关系图谱
  '关系依赖': { part: 'mirror', key: 'relationshipMap' },
  '独立自主': { part: 'mirror', key: 'relationshipMap' },
  '渴望连接': { part: 'mirror', key: 'relationshipMap' },
  '回避亲密': { part: 'mirror', key: 'relationshipMap' },
  '重视家庭': { part: 'mirror', key: 'relationshipMap' },
  '社交焦虑': { part: 'mirror', key: 'relationshipMap' },
  '信任困难': { part: 'mirror', key: 'relationshipMap' },
  // 自我叙事
  '情感回避': { part: 'mirror', key: 'selfNarrative' },
  '自省能力强': { part: 'mirror', key: 'selfNarrative' },
  '自我否定': { part: 'mirror', key: 'selfNarrative' },
  '过度反思': { part: 'mirror', key: 'selfNarrative' },
  '自我接纳': { part: 'mirror', key: 'selfNarrative' },
  '身份迷茫': { part: 'mirror', key: 'selfNarrative' },
  '意义追寻': { part: 'mirror', key: 'selfNarrative' },
};

// 正则提取规则
const TRAIT_REGEX_RULES: { regex: RegExp; trait: string }[] = [
  { regex: /成长|进步|提升|学习|变好|突破/, trait: '成长优先' },
  { regex: /家人|父母|孩子|家庭|回家|陪伴.*家人/, trait: '家庭优先' },
  { regex: /自由|随心|不想.*束缚|自己.*做|掌控/, trait: '追求自由' },
  { regex: /稳定|安稳|踏实|安全感|确定性/, trait: '稳定至上' },
  { regex: /成功|成就|目标|达成|证明自己|认可/, trait: '成就驱动' },
  { regex: /意义|价值|为什么.*活|使命|值得/, trait: '追求意义' },
  { regex: /开心|享受|快乐|好玩|有趣|体验/, trait: '享乐主义' },
  { regex: /平衡|兼顾|工作.*生活|生活.*工作/, trait: '平衡生活' },
  { regex: /一个人|独处|安静|不喜欢.*社交|社恐|宅/, trait: '内向社交' },
  { regex: /朋友.*一起|聚会|聊天|社交|认识.*人/, trait: '外向社交' },
  { regex: /犹豫|纠结|拿不定|想来想去|不确定/, trait: '行动犹豫' },
  { regex: /果断|决定了|立刻就|不犹豫/, trait: '果断行动' },
  { regex: /直觉|感觉|第六感|凭感觉/, trait: '直觉驱动' },
  { regex: /数据|分析|对比|权衡|理性/, trait: '数据驱动' },
  { regex: /安全|稳定|保障|担心风险/, trait: '安全优先' },
  { regex: /完美|细节|做到最好|不够好/, trait: '完美主义' },
  { regex: /拖延|等等.*做|晚点|再说/, trait: '拖延倾向' },
  { regex: /计划|规律|坚持|自律/, trait: '自律严谨' },
  { regex: /思考|想.*深|反思|琢磨/, trait: '深度思考' },
  { regex: /实际|现实|务实|落地|可行/, trait: '务实主义' },
  { regex: /创新|新的|不同|创意|突破/, trait: '创新思维' },
  { regex: /依赖|需要.*陪|离不开|孤独/, trait: '关系依赖' },
  { regex: /独立|自己.*解决|不用.*管|靠自己/, trait: '独立自主' },
  { regex: /怪我|我的错|不够好|失败/, trait: '自我否定' },
  { regex: /原来|我才.*发现|突然.*明白|意识到/, trait: '自省能力强' },
  { regex: /后悔|如果当初|要是.*就|遗憾/, trait: '过度反思' },
];

// 备用正则提取（AI 失败时用）
const FALLBACK_REGEX_RULES: { regex: RegExp; trait: string }[] = [
  { regex: /犹豫|纠结|拿不定|想来想去|不确定/, trait: '行动犹豫' },
  { regex: /果断|决定了|立刻就|不犹豫/, trait: '果断行动' },
  { regex: /直觉|感觉|第六感|凭感觉/, trait: '直觉驱动' },
  { regex: /数据|分析|对比|权衡|理性/, trait: '数据驱动' },
  { regex: /安全|稳定|保障|担心风险/, trait: '安全优先' },
  { regex: /最好|最优|完美|挑/, trait: '追求最优' },
  { regex: /一个人|独处|安静|不喜欢.*社交|社恐/, trait: '内向社交' },
  { regex: /朋友.*一起|聚会|聊天|社交|认识.*人/, trait: '外向社交' },
  { regex: /感动|哭|难过|情绪|敏感/, trait: '情感丰富' },
  { regex: /理性|冷静|逻辑|分析/, trait: '理性克制' },
  { regex: /完美|细节|做到最好|不够好/, trait: '完美主义' },
  { regex: /随便|都行|无所谓|怎么都/, trait: '随性洒脱' },
  { regex: /拖延|等等.*做|晚点|再说/, trait: '拖延倾向' },
  { regex: /计划|规律|坚持|自律/, trait: '自律严谨' },
  { regex: /成长|进步|学习|提升|变好/, trait: '成长优先' },
  { regex: /家人|父母|孩子|家庭|回家/, trait: '家庭优先' },
  { regex: /自由|随心|不想.*束缚|自己.*活/, trait: '追求自由' },
  { regex: /稳定|安稳|踏实|安全感/, trait: '稳定至上' },
  { regex: /成功|成就|目标|达成|证明/, trait: '成就驱动' },
  { regex: /意义|为什么.*活|人生.*意义|价值/, trait: '追求意义' },
  { regex: /思考|想.*深|反思|琢磨/, trait: '深度思考' },
  { regex: /实际|现实|务实|落地|可行/, trait: '务实主义' },
  { regex: /创新|新的|不同|创意|突破/, trait: '创新思维' },
  { regex: /依赖|需要.*陪|离不开|孤独/, trait: '关系依赖' },
  { regex: /独立|自己.*解决|不用.*管|靠自己/, trait: '独立自主' },
  { regex: /怪我|我的错|不够好|失败/, trait: '自我否定' },
  { regex: /原来|我才.*发现|突然.*明白|意识到/, trait: '自省能力强' },
  { regex: /后悔|如果当初|要是.*就|遗憾/, trait: '过度反思' },
];

// === 苏格拉底风格映射 ===

export const SOCRATIC_STYLES: Record<string, string> = {
  philosophical_guide: '哲学',
  rational_analyst: '理性',
  warm_companion: '温暖',
  mirror_reflector: '镜像',
  challenge_dialoguer: '挑战',
};

// === 对话上下文类型 ===

export interface DialogueContext {
  profileSummary: string;
  coverageSummary: string;
  uncoveredDimension?: string;
  style: string;
  reentryStrategy: string;
  reentryContext?: string;
}

let currentDialogueContext: DialogueContext | null = null;

// === localStorage 键 ===

const PROFILE_KEY = 'mirror_user_profile';
const COVER_MAP_KEY = 'mirror_cover_map';

// === 工厂函数 ===

function createEmptyDimension(): DimensionData {
  return { content: '', confidence: 0, source: '', lastUpdated: '', subDimensions: {} };
}

function createBaseProfile(): BaseProfile {
  return {
    values: createEmptyDimension(),
    personality: createEmptyDimension(),
    cognition: createEmptyDimension(),
    workHabits: createEmptyDimension(),
    behaviorPrefs: createEmptyDimension(),
    decisionPrinciples: createEmptyDimension(),
    lifeStage: createEmptyDimension(),
  };
}

function createStyle(): ProfileStyle {
  return {
    hardRules: ['不替用户做价值判断', '不预测未来', '不替用户决策'],
    identity: '',
    speakingStyle: '',
    emotionalPatterns: '',
    interpersonal: '',
    corrections: [],
  };
}

function createMirrorProfile(): MirrorProfile {
  return {
    relationshipMap: createEmptyDimension(),
    regretClues: createEmptyDimension(),
    riskTolerance: createEmptyDimension(),
    capacityBoundary: createEmptyDimension(),
    selfNarrative: createEmptyDimension(),
  };
}

function createProfile(): Profile {
  const now = new Date().toISOString();
  return {
    base: createBaseProfile(),
    style: createStyle(),
    mirror: createMirrorProfile(),
    metadata: {
      version: 1,
      createdAt: now,
      lastUpdated: now,
      socraticCompletion: 0,
      dataSources: [],
      stylePreferences: ['philosophical_guide'],
    },
  };
}

function createCoverageMap(): CoverageMap {
  return {
    items: DIMENSIONS.map(d => ({
      dimKey: d.dimKey,
      displayName: d.displayName,
      covered: false,
      confidence: 0,
      lastTouched: '',
    })),
    completedCount: 0,
    totalCount: 12,
    estimatedSessionsRemaining: 8,
  };
}

// === 读写函数 ===

export function getProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createProfile();
}

function saveProfile(profile: Profile): void {
  profile.metadata.lastUpdated = new Date().toISOString();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getCoverageMap(): CoverageMap {
  try {
    const raw = localStorage.getItem(COVER_MAP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createCoverageMap();
}

function saveCoverageMap(map: CoverageMap): void {
  localStorage.setItem(COVER_MAP_KEY, JSON.stringify(map));
}

function getDimension(profile: Profile, part: 'base' | 'mirror', key: string): DimensionData | null {
  const section = part === 'base' ? profile.base : profile.mirror;
  return (section as unknown as Record<string, DimensionData>)[key] ?? null;
}

function setDimension(profile: Profile, part: 'base' | 'mirror', key: string, data: DimensionData): void {
  const section = part === 'base' ? profile.base : profile.mirror;
  (section as any)[key] = data;
}

// === 画像操作 ===

/** 添加关键词特质到画像 */
export function addTrait(part: 'base' | 'mirror', key: string, trait: string, confidence = 0.65, source = 'socratic_dialogue'): void {
  const profile = getProfile();
  const dim = getDimension(profile, part, key);
  const now = new Date().toISOString();

  if (dim && dim.content) {
    const content = dim.content.includes(trait) ? dim.content : `${dim.content}；${trait}`;
    const newConf = Math.min(0.95, dim.confidence + (1 - dim.confidence) * confidence * 0.3);
    setDimension(profile, part, key, { ...dim, content, confidence: newConf, source, lastUpdated: now, subDimensions: dim.subDimensions });
  } else {
    setDimension(profile, part, key, { content: trait, confidence, source, lastUpdated: now });
  }

  saveProfile(profile);
  updateCoverage();
}

/** 添加子维度特质到画像 */
export function addSubDimension(part: 'base' | 'mirror', key: string, subKey: string, value: string): void {
  const profile = getProfile();
  const dim = getDimension(profile, part, key);
  const now = new Date().toISOString();

  if (dim) {
    const subs = dim.subDimensions ?? {};
    subs[subKey] = value;
    setDimension(profile, part, key, { ...dim, subDimensions: subs, lastUpdated: now, confidence: Math.min(0.95, dim.confidence + 0.05) });
  } else {
    setDimension(profile, part, key, { content: '', confidence: 0.3, source: 'socratic_dialogue', lastUpdated: now, subDimensions: { [subKey]: value } });
  }

  saveProfile(profile);
  updateCoverage();
}

/** 通过关键词映射批量更新画像 */
export function updateProfileFromKeywords(keywords: string[]): void {
  for (const kw of keywords) {
    const mapping = KEYWORD_DIM_MAP[kw];
    if (mapping) {
      if (mapping.subKey) {
        addSubDimension(mapping.part, mapping.key, mapping.subKey, kw);
      } else {
        addTrait(mapping.part, mapping.key, kw, 0.65, 'socratic_dialogue');
      }
    }
  }
}

/** 通过正则从文本中提取特质关键词 */
export function extractTraitsFromText(answers: string[]): string[] {
  const text = answers.join(' ');
  const traits = new Set<string>();
  for (const { regex, trait } of TRAIT_REGEX_RULES) {
    if (regex.test(text)) {
      traits.add(trait);
      if (traits.size >= 8) break;
    }
  }
  return Array.from(traits);
}

/** 备用正则提取（AI 失败时） */
export function fallbackExtractTraits(messages: { role: string; content: string }[]): string[] {
  const text = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
  const traits = new Set<string>();
  for (const { regex, trait } of FALLBACK_REGEX_RULES) {
    if (regex.test(text)) {
      traits.add(trait);
      if (traits.size >= 5) break;
    }
  }
  return Array.from(traits);
}

/** 生成印象一句话（从关键词） */
export function generateImpression(keywords: string[]): string {
  if (keywords.length === 0) return '镜中的倒影还有些模糊。但没关系，每一次对话都会让影像更清晰。';

  const top3 = keywords.slice(0, 3).join('、');
  const isIntroverted = keywords.some(k => k === '内向社交' || k === '敏感细腻');
  const isGrowth = keywords.some(k => k === '成长优先' || k === '追求意义');
  const isStable = keywords.some(k => k === '稳定至上' || k === '安全优先');
  const isAdventurous = keywords.some(k => k === '热爱挑战' || k === '乐于冒险');
  const isHesitant = keywords.some(k => k === '行动犹豫' || k === '风险规避');
  const isDecisive = keywords.some(k => k === '果断行动' || k === '独立自主');
  const isSelfDoubt = keywords.some(k => k === '自我否定' || k === '身份迷茫');
  const isReflective = keywords.some(k => k === '自省能力强' || k === '深度思考');

  if (isGrowth && isHesitant) return `镜中看见了一个渴望成长却又谨慎前行的人——${top3}，这些特质交织成了你此刻的样貌。`;
  if (isSelfDoubt && isReflective) return `镜中映出一个对自己要求很高的人——${top3}。你比你以为的更了解自己，只是有时候对自己太严苛了。`;
  if (isAdventurous && isDecisive) return `镜中看见了一个充满行动力的人——${top3}。你敢于迈出步伐，这是很珍贵的品质。`;
  if (isIntroverted && isReflective) return `镜中映出一个安静但有深度的人——${top3}。你的内心世界比外表看起来丰富得多。`;
  if (isStable && isGrowth) return `镜中看见了一个在稳定与成长之间寻找平衡的人——${top3}。这是很多人一生都在面对的课题。`;
  return `镜中看见了一个${top3}的人。这些只是第一眼的印象，每一次对话都会让影像更加清晰。`;
}

/** 提取说话风格 */
export function extractSpeakingStyle(answers: string[]): { speakingStyle: string; emotionalPatterns: string } {
  const text = answers.join(' ');

  const catchphrases: [RegExp, string][] = [
    [/其实/g, '其实'], [/怎么说呢/g, '怎么说呢'], [/算了/g, '算了'],
    [/也行/g, '也行'], [/随便/g, '随便'], [/我觉得/g, '我觉得'],
    [/可能/g, '可能'], [/应该/g, '应该'], [/不太确定/g, '不太确定'],
  ];
  const foundCatchphrases = new Set<string>();
  for (const [regex, label] of catchphrases) {
    const matches = text.match(regex);
    if (matches && matches.length >= 2) foundCatchphrases.add(label);
  }

  const styleMarkers: [RegExp, string][] = [
    [/[吧呢啊呀嘛哦哈]/g, '语气词丰富'], [/[！!]/g, '感叹号使用者'],
    [/[？?]/g, '反问句式'], [/\.{2,}/g, '省略号偏好'], [/[～~]/g, '波浪号用户'],
  ];
  const foundStyles: string[] = [];
  for (const [regex, label] of styleMarkers) {
    const matches = text.match(regex);
    if (matches && matches.length >= 2) foundStyles.push(label);
  }

  const emojiCount = (text.match(/[\p{Emoji}]/gu) || []).length;
  const emojiStyle = emojiCount >= 3 ? '高频使用emoji' : emojiCount > 0 ? '偶尔使用emoji' : '纯文字表达';

  const avgLen = answers.reduce((sum, a) => sum + a.length, 0) / answers.length;
  const lenStyle = avgLen > 80 ? '表达偏正式' : avgLen > 40 ? '自然口语化' : '短句直接';

  const styleParts = [
    foundCatchphrases.size > 0 ? `口头禅: ${Array.from(foundCatchphrases).join('、')}` : null,
    foundStyles.length > 0 ? foundStyles.join('、') : null,
    emojiStyle,
    lenStyle,
  ].filter(Boolean);

  // 情感模式
  const hasAnxiety = /焦虑|担心|紧张|压力|怕/.test(text);
  const hasOptimism = /开心|乐观|期待|希望|相信/.test(text);
  const hasRegret = /后悔|遗憾|如果当初|错过/.test(text);
  const hasSelfCriticism = /不够好|怪我|失败|自责/.test(text);
  const emotionParts: string[] = [];
  if (hasAnxiety) emotionParts.push('倾向于表达焦虑');
  if (hasOptimism) emotionParts.push('整体偏乐观');
  if (hasRegret) emotionParts.push('常有回顾性情感');
  if (hasSelfCriticism) emotionParts.push('自我评价偏严苛');

  return {
    speakingStyle: styleParts.join('；'),
    emotionalPatterns: emotionParts.length > 0 ? emotionParts.join('；') : '情感表达平和',
  };
}

/** 更新说话风格 */
export function updateStyle(style: Partial<ProfileStyle>): void {
  const profile = getProfile();
  Object.assign(profile.style, style);
  saveProfile(profile);
}

// === 覆盖度 ===

/** 更新覆盖度，返回新的覆盖度 map */
export function updateCoverage(): CoverageMap {
  const profile = getProfile();
  const map = getCoverageMap();
  let completedCount = 0;

  map.items.forEach(item => {
    const [part, key] = item.dimKey.split('.');
    const dim = getDimension(profile, part as 'base' | 'mirror', key);
    if (!dim) return;

    item.confidence = dim.confidence;
    item.lastTouched = dim.lastUpdated || '';

    let covered = false;
    switch (item.dimKey) {
      case 'base.values':
        covered = dim.confidence >= 0.6 && Object.keys(dim.subDimensions ?? {}).length >= 2;
        break;
      case 'base.decisionPrinciples':
        covered = dim.confidence >= 0.6 && dim.content.length > 0;
        break;
      case 'base.lifeStage':
        covered = dim.confidence >= 0.6 && dim.content.length > 0;
        break;
      case 'mirror.regretClues':
        covered = dim.confidence >= 0.6 && Object.keys(dim.subDimensions ?? {}).length >= 1;
        break;
      default:
        covered = dim.confidence >= 0.6;
    }

    item.covered = covered;
    if (covered) completedCount++;
  });

  map.completedCount = completedCount;
  map.estimatedSessionsRemaining = completedCount === 12 ? 0 : Math.max(1, Math.ceil((12 - completedCount) / 2));
  saveCoverageMap(map);
  return map;
}

export function getCompletionPct(): number {
  const map = getCoverageMap();
  return Math.round((map.completedCount / map.totalCount) * 100);
}

/** 是否可以进行推演（4个核心维度达标） */
export function canDeduce(): boolean {
  const profile = getProfile();
  const { values, decisionPrinciples, lifeStage } = profile.base;
  const { regretClues } = profile.mirror;
  return (
    values.confidence >= 0.6 && Object.keys(values.subDimensions ?? {}).length >= 2 &&
    decisionPrinciples.confidence >= 0.6 && decisionPrinciples.content.length > 0 &&
    lifeStage.confidence >= 0.6 && lifeStage.content.length > 0 &&
    regretClues.confidence >= 0.6 && Object.keys(regretClues.subDimensions ?? {}).length >= 1
  );
}

/** 获取未覆盖的关键维度名 */
export function getUncoveredDimension(): string | null {
  const items = getCoverageMap().items.filter(i => !i.covered);
  if (items.length === 0) return null;
  const priority = ['base.lifeStage', 'base.values', 'base.decisionPrinciples', 'mirror.regretClues'];
  for (const key of priority) {
    const found = items.find(i => i.dimKey === key);
    if (found) return found.displayName;
  }
  return items[0].displayName;
}

/** 生成画像摘要 */
export function getProfileSummary(): string {
  const profile = getProfile();
  const lines: string[] = [];
  const dims: { key: string; label: string; section: any }[] = [
    { key: 'values', label: '价值观', section: profile.base },
    { key: 'personality', label: '性格', section: profile.base },
    { key: 'decisionPrinciples', label: '决策风格', section: profile.base },
    { key: 'lifeStage', label: '人生阶段', section: profile.base },
    { key: 'regretClues', label: '遗憾线索', section: profile.mirror },
    { key: 'riskTolerance', label: '风险承受', section: profile.mirror },
  ];

  for (const { key, label, section } of dims) {
    const dim = section[key];
    if (dim && dim.content && dim.confidence >= 0.4) {
      lines.push(`${label}: ${dim.content.slice(0, 60)}`);
    }
  }
  return lines.length > 0 ? lines.join('\n') : '画像尚未建立。';
}

/** 生成覆盖度摘要文本 */
export function getCoverageSummary(map: CoverageMap): string {
  if (!map || map.completedCount === 0) return '尚未覆盖任何维度。';
  const covered = map.items.filter(i => i.covered).map(i => i.displayName);
  const uncovered = map.items.filter(i => !i.covered).map(i => i.displayName);
  let text = `已覆盖(${map.completedCount}/12): ${covered.join('、')}`;
  if (uncovered.length > 0) text += `\n待探索: ${uncovered.join('、')}`;
  return text;
}

// === 对话上下文 ===

export function setDialogueContext(ctx: DialogueContext): void {
  currentDialogueContext = ctx;
}

export function getDialogueContext(): DialogueContext | null {
  return currentDialogueContext;
}