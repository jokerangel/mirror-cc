/**
 * 记忆存储服务 - 对话记录 + 碎片提取 + 会话管理
 */

const MEMORY_KEY = 'mirror_memory_store';

// === 类型 ===

export interface MemoryMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  emotionTag?: string;
}

export interface DialogueBreakpoint {
  lastTopic: string;
  depth: 'casual' | 'deep';
}

export interface RawDialogue {
  id: string;
  sessionId: string;
  messages: MemoryMessage[];
  startedAt: string;
  endedAt?: string;
  source: string;
  breakpoint?: DialogueBreakpoint;
}

export interface SessionMeta {
  id: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
  breakpoint?: DialogueBreakpoint;
}

export interface Fragment {
  id: string;
  type: string;
  sourceDialogueId: string;
  sourceMessageIndex: number;
  content: string;
  extractedAt: string;
  confidence: number;
  tags: string[];
}

export interface MemoryStore {
  rawDialogues: RawDialogue[];
  sessionMeta: SessionMeta[];
  fragments: Fragment[];
  timelines: {
    life: any[];
    decisions: any[];
    ghost: any[];
  };
  index: {
    byKeyword: Record<string, string[]>;
    byEmotion: Record<string, string[]>;
    byRelation: Record<string, string[]>;
    byDimension: Record<string, string[]>;
  };
  hidden: string[];
}

// === 碎片提取规则 ===

const FRAGMENT_RULES: Record<string, { keywords: string[]; patterns: RegExp[] }> = {
  key_decision: {
    keywords: ['决定', '选择', '辞职', '跳槽', '入职', '放弃', '接受', '拒绝', '定了', '确定了', '下决心', '决定了'],
    patterns: [/我(决定了|选择了|打算|准备|要|决定)[^。！？]{1,30}/],
  },
  emotional_peak: {
    keywords: ['非常', '特别', '太', '极了', '超级', '崩溃', '激动', '难受', '开心得', '气死', '感动', '兴奋', '紧张', '害怕'],
    patterns: [/(真的|实在|简直)(太|很|非常)[^。！？]{1,30}/],
  },
  relationship: {
    keywords: ['妈妈', '爸爸', '老公', '老婆', '男朋友', '女朋友', '老板', '同事', '朋友', '家人', '闺蜜', '兄弟', '我妈', '我爸', '我老公', '我老婆', '我老板', '我同事', '我朋友'],
    patterns: [/(我跟|我和)(我妈|我爸|老公|老婆|老板|同事|朋友|家人|闺蜜)[^。！？]{1,40}/],
  },
  regret_clue: {
    keywords: ['如果当初', '本来', '要是', '差点', '后悔', '可惜', '遗憾', '当初', '早知道', '不应该', '如果当时'],
    patterns: [/(如果当初|要是[^。！？]{1,10}|本来[^。！？]{1,10}|差点[^。！？]{1,10})[^。！？]{1,40}/],
  },
  new_discovery: {
    keywords: ['原来', '才发现', '意识到', '明白了', '知道了', '突然觉得', '我发现', '第一次', '重新认识'],
    patterns: [/(原来[^。！？]{1,30}|我才(发现|意识到|知道)[^。！？]{1,30}|突然(觉得|发现)[^。！？]{1,30})/],
  },
};

// 情绪标签提取
const EMOTION_CATEGORIES: Record<string, RegExp> = {
  '工作': /工作|职业|跳槽|入职|辞职|创业|加班|项目|老板|同事/i,
  '感情': /感情|恋爱|爱情|结婚|分手|伴侣|对象|在一起/i,
  '家庭': /家|妈妈|爸爸|父母|孩子|家人|家庭|亲戚/i,
  '成长': /成长|进步|学习|改变|突破|懂了|明白|发现自己/i,
  '金钱': /钱|工资|收入|买房|房价|投资|花费|省/i,
  '健康': /健康|生病|身体|体检|失眠|锻炼|运动|压力/i,
  '社交': /朋友|聚会|社交|人脉|圈子|认识|联系/i,
};

// === 工具 ===

function genId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyStore(): MemoryStore {
  return {
    rawDialogues: [],
    sessionMeta: [],
    fragments: [],
    timelines: { life: [], decisions: [], ghost: [] },
    index: { byKeyword: {}, byEmotion: {}, byRelation: {}, byDimension: {} },
    hidden: [],
  };
}

// === 核心 API ===

export function getMemoryStore(): MemoryStore {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createEmptyStore();
}

function saveStore(store: MemoryStore): void {
  // 自动清理30天前的非断点对话
  const cutoff = Date.now() - 2592e6; // 30 days
  store.rawDialogues = store.rawDialogues.filter(
    d => new Date(d.startedAt).getTime() > cutoff || d.breakpoint !== undefined
  );
  localStorage.setItem(MEMORY_KEY, JSON.stringify(store));
}

/** 提取情绪标签 */
function extractEmotionTags(text: string): string[] {
  const tags: string[] = [];
  for (const [category, regex] of Object.entries(EMOTION_CATEGORIES)) {
    if (regex.test(text)) tags.push(category);
  }
  return tags;
}

// === 会话管理 ===

let currentSessionId: string | null = null;

/** 创建新对话会话，返回 sessionId */
export function createSession(source = 'web'): string {
  const store = getMemoryStore();
  const sessionId = genId();
  const now = new Date().toISOString();

  store.sessionMeta.push({ id: sessionId, startedAt: now, messageCount: 0 });
  store.rawDialogues.push({ id: genId(), sessionId, messages: [], startedAt: now, source });

  saveStore(store);
  currentSessionId = sessionId;
  return sessionId;
}

/** 记录消息 */
export function recordMessage(sessionId: string, role: 'user' | 'model', content: string, emotionTag?: string): void {
  const store = getMemoryStore();
  const dialogue = store.rawDialogues.find(d => d.sessionId === sessionId);
  if (!dialogue) return;

  dialogue.messages.push({ role, content, timestamp: new Date().toISOString(), emotionTag });

  const meta = store.sessionMeta.find(s => s.id === sessionId);
  if (meta) meta.messageCount = dialogue.messages.length;

  // 自动检测断点
  if (dialogue.messages.length >= 4 && !dialogue.breakpoint) {
    const userMsgs = dialogue.messages.filter(m => m.role === 'user').map(m => m.content);
    if (userMsgs.some(m => m.length > 80) || /决定|选择|如果|后悔|原来|其实|真的|一直/i.test(userMsgs.join(' '))) {
      const lastUserMsg = dialogue.messages.filter(m => m.role === 'user').pop();
      dialogue.breakpoint = { lastTopic: lastUserMsg?.content.slice(0, 40) ?? '', depth: 'deep' };
      if (meta) meta.breakpoint = dialogue.breakpoint;
    }
  }

  saveStore(store);
}

/** 结束会话 */
export function endSession(sessionId: string, breakpoint?: DialogueBreakpoint): void {
  const store = getMemoryStore();
  const dialogue = store.rawDialogues.find(d => d.sessionId === sessionId);
  const meta = store.sessionMeta.find(s => s.id === sessionId);
  const now = new Date().toISOString();

  if (dialogue) {
    dialogue.endedAt = now;
    if (breakpoint) dialogue.breakpoint = breakpoint;
  }
  if (meta) {
    meta.endedAt = now;
    if (breakpoint) meta.breakpoint = breakpoint;
  }

  currentSessionId = null;
  saveStore(store);
}

/** 获取会话消息 */
export function getSessionMessages(sessionId: string): MemoryMessage[] {
  const dialogue = getMemoryStore().rawDialogues.find(d => d.sessionId === sessionId);
  return dialogue?.messages ?? [];
}

/** 获取近期会话列表 */
export function getRecentSessions(count = 5): SessionMeta[] {
  return [...getMemoryStore().sessionMeta]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, count);
}

/** 获取上次会话（用于重入检测） */
export function getLastSession(): SessionMeta | null {
  const sessions = getRecentSessions(2);
  return sessions.find(s => s.endedAt && s.id !== currentSessionId) ?? null;
}

/** 计算重入策略 */
export function getReentryStrategy(): {
  strategy: 'contextual_awakening' | 'seamless_continuation' | 'natural_guidance';
  lastTopic?: string;
  lastSessionAt: string;
  daysSinceLastSession: number;
  unfinishedDimensions: string[];
} {
  const last = getLastSession();
  const now = Date.now();

  if (!last) {
    return { strategy: 'natural_guidance', lastSessionAt: '', daysSinceLastSession: 999, unfinishedDimensions: [] };
  }

  const lastTime = last.endedAt ? new Date(last.endedAt).getTime() : new Date(last.startedAt).getTime();
  const daysSince = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));

  // 需要从 profileService 获取未覆盖维度，这里简化处理
  const unfinishedDimensions: string[] = [];

  let strategy: 'contextual_awakening' | 'seamless_continuation' | 'natural_guidance';
  if (daysSince < 1 && last.breakpoint?.depth === 'deep') {
    strategy = 'contextual_awakening';
  } else if (daysSince < 3) {
    strategy = 'seamless_continuation';
  } else {
    strategy = 'natural_guidance';
  }

  return {
    strategy,
    lastTopic: last.breakpoint?.lastTopic,
    lastSessionAt: last.endedAt ?? last.startedAt,
    daysSinceLastSession: daysSince,
    unfinishedDimensions,
  };
}

/** 从对话中提取碎片 */
export function extractFragments(sessionId: string, messages: MemoryMessage[]): Fragment[] {
  const store = getMemoryStore();
  const newFragments: Fragment[] = [];

  messages.filter(m => m.role === 'user').forEach((msg, idx) => {
    for (const [type, rule] of Object.entries(FRAGMENT_RULES)) {
      const keywordMatch = rule.keywords.some(kw => msg.content.includes(kw));
      const patternMatch = rule.patterns.some(p => p.test(msg.content));

      if (keywordMatch || patternMatch) {
        const content = msg.content.length > 120 ? msg.content.slice(0, 120) + '...' : msg.content;
        const fragment: Fragment = {
          id: genId(),
          type,
          sourceDialogueId: sessionId,
          sourceMessageIndex: idx,
          content,
          extractedAt: new Date().toISOString(),
          confidence: keywordMatch && patternMatch ? 0.85 : 0.7,
          tags: extractEmotionTags(msg.content),
        };

        // 避免重复
        if (!store.fragments.some(f => f.type === type && f.sourceDialogueId === sessionId && f.sourceMessageIndex === idx)) {
          store.fragments.push(fragment);
          newFragments.push(fragment);

          // 更新索引
          for (const tag of fragment.tags) {
            if (!store.index.byKeyword[tag]) store.index.byKeyword[tag] = [];
            store.index.byKeyword[tag].push(fragment.id);
          }
          if (msg.emotionTag) {
            if (!store.index.byEmotion[msg.emotionTag]) store.index.byEmotion[msg.emotionTag] = [];
            store.index.byEmotion[msg.emotionTag].push(sessionId);
          }
        }
      }
    }
  });

  // 从碎片构建时间线
  const decisionFragments = store.fragments.filter(f => f.type === 'key_decision');
  store.timelines.decisions = decisionFragments.map(f => ({
    id: genId(),
    type: 'decision',
    title: f.content.slice(0, 30),
    date: f.extractedAt,
    description: f.content,
    sourceFragmentIds: [f.id],
    linkedDimensions: ['base.decisionPrinciples'],
  }));

  const regretFragments = store.fragments.filter(f => f.type === 'regret_clue');
  store.timelines.ghost = regretFragments.map(f => ({
    id: genId(),
    type: 'ghost',
    title: f.content.slice(0, 30),
    date: f.extractedAt,
    description: f.content,
    sourceFragmentIds: [f.id],
    linkedDimensions: ['mirror.regretClues'],
  }));

  const lifeFragments = store.fragments.filter(f => f.type === 'emotional_peak' || f.type === 'new_discovery');
  store.timelines.life = lifeFragments.map(f => ({
    id: genId(),
    type: 'life_event',
    title: f.content.slice(0, 30),
    date: f.extractedAt,
    description: f.content,
    sourceFragmentIds: [f.id],
    linkedDimensions: ['base.lifeStage'],
  }));

  saveStore(store);
  return newFragments;
}

/** 情绪标签提取（导出供外部使用） */
export { extractEmotionTags };