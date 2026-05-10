// 平行推演引擎 - AI驱动的完整节点生成流程

import { GoogleGenAI } from '@google/genai';
import { getProfile, getProfileSummary } from './profileService';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBFf8myhi95YrBH26hgrfDZqEVwFxGSZr8' });

const MODEL = 'gemini-2.0-flash';

export type NodeType = 'origin' | 'branch' | 'ending' | 'parallel' | 'pending';
export type NodeStatus = 'active' | 'completed' | 'paused' | 'deleted';
export type RelationType = 'child' | 'pre_branch' | 'parallel' | 'new';
export type VisualStyle = 'nostalgic_film' | 'cold_documentary' | 'fractured_memory' | 'ink_wash';
export type GenerationPhase = 'idle' | 'origin' | 'planning' | 'story' | 'manga' | 'complete';

export interface Choice {
  id: string;
  label: string;
  preview: string;
}

export interface MangaPanel {
  id: string;
  description: string;
  imageUrl?: string;
  caption: string;
}

export interface UserProfile {
  keywords?: string[];
  summary?: string;
}

export interface StoryNode {
  id: string;
  nodeType: NodeType;
  scenario: {
    timePoint: string;
    title: string;
    predicate: string;
  };

  originInfo?: {
    extractedTime: string;
    extractedEvent: string;
    userOriginalChoice?: string;
    userAlternativeChoice?: string;
    situationContext: string;
  };

  pathPlan?: {
    timeline: TimelineEvent[];
    branchPoints: BranchPoint[];
    totalDuration: string;
    estimatedNodes: number;
  };

  story?: {
    narrative: string;
    facts: string[];
    worldContext: string;
  };

  manga?: {
    panels: MangaPanel[];
    visualStyle: VisualStyle;
  };

  choices?: Choice[];
  userContext: {
    timeMarker: string;
    originalChoice?: string;
  };
  status: NodeStatus;
  createdAt: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
  type: 'milestone' | 'branch' | 'ending';
}

export interface BranchPoint {
  id: string;
  time: string;
  question: string;
  choices: Choice[];
}

export interface SufficiencyResult {
  isSufficient: boolean;
  missingAspects: string[];
  followUpQuestion: string;
}

// ===== 获取用户画像上下文 =====

function getUserProfile(): UserProfile {
  try {
    const summary = getProfileSummary();
    const profile = getProfile();
    const allKeywords: string[] = [];

    // 从各维度收集关键词
    const dims = [
      profile.base.values, profile.base.personality, profile.base.cognition,
      profile.base.workHabits, profile.base.behaviorPrefs, profile.base.decisionPrinciples,
      profile.base.lifeStage, profile.mirror.relationshipMap, profile.mirror.regretClues,
      profile.mirror.riskTolerance, profile.mirror.capacityBoundary, profile.mirror.selfNarrative,
    ];
    for (const dim of dims) {
      if (dim.content) {
        allKeywords.push(...dim.content.split('；').filter(k => k.trim()));
      }
      if (dim.subDimensions) {
        allKeywords.push(...Object.values(dim.subDimensions));
      }
    }

    return {
      keywords: allKeywords.length > 0 ? [...new Set(allKeywords)].slice(0, 8) : undefined,
      summary: summary !== '画像尚未建立。' ? summary : undefined,
    };
  } catch {
    return {};
  }
}

// ===== Phase 1: 起源节点构建 =====

export function buildOriginNode(userInput: string, type: 'history' | 'future'): {
  node: StoryNode;
  feedback: string[];
} {
  const feedback: string[] = [];
  const extractedTime = extractTimePoint(userInput) || (type === 'history' ? '那个重要时刻' : '当下');
  feedback.push(`✓ 提取时间点: ${extractedTime}`);

  const extractedEvent = extractEvent(userInput);
  feedback.push(`✓ 识别关键事件: ${extractedEvent}`);

  const choices = extractChoices(userInput, type);
  feedback.push(`✓ 发现选择分支: ${choices.length} 个可能性`);

  const situationContext = buildSituationContext(extractedEvent, type);
  feedback.push('✓ 构建情境上下文完成');

  const node: StoryNode = {
    id: `node_${Date.now()}`,
    nodeType: type === 'future' ? 'pending' : 'origin',
    scenario: {
      timePoint: extractedTime,
      title: extractedEvent,
      predicate: type === 'history' ? `如果当初在${extractedTime}...` : `面对${extractedTime}的选择`,
    },
    originInfo: { extractedTime, extractedEvent, situationContext, userOriginalChoice: type === 'history' ? choices[0]?.label : undefined, userAlternativeChoice: type === 'history' ? choices[1]?.label : undefined },
    choices,
    userContext: { timeMarker: extractedTime },
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  return { node, feedback };
}

// ===== Phase 2: AI推演路径规划 =====

export async function planDeductionPath(node: StoryNode, type: 'history' | 'future'): Promise<{
  node: StoryNode;
  feedback: string[];
}> {
  const feedback: string[] = [];
  feedback.push('✓ 加载用户画像数据...');
  feedback.push('✓ 分析决策路径...');

  const timeline = generateTimeline(node, type);
  feedback.push(`✓ 生成推演时间线: ${timeline.length} 个关键节点`);

  feedback.push('✓ AI 规划分支选择点...');
  const profile = getUserProfile();
  const branchPoints = await generateAIBranchChoices(
    node.scenario.timePoint,
    node.scenario.title,
    timeline.map(t => ({ time: t.time, event: t.event })),
    profile.keywords ? { keywords: profile.keywords } : undefined,
  );
  feedback.push(`✓ 规划分支选择点: ${branchPoints.length} 个选择节点`);

  const totalDuration = calculateDuration(timeline);
  feedback.push(`✓ 预估推演时长: ${totalDuration}`);

  return {
    node: {
      ...node,
      pathPlan: { timeline, branchPoints, totalDuration, estimatedNodes: timeline.length + branchPoints.length },
    },
    feedback,
  };
}

// ===== Phase 3: AI故事渲染生成 =====

export async function generateStory(node: StoryNode, type: 'history' | 'future'): Promise<{
  node: StoryNode;
  feedback: string[];
}> {
  const feedback: string[] = [];
  feedback.push('✓ 初始化 AI 叙事引擎...');
  feedback.push('✓ 生成情境描述...');

  const profile = getUserProfile();
  const result = await generateAINarrative(
    node.scenario.timePoint,
    node.scenario.title,
    type,
    profile.keywords ? { keywords: profile.keywords, summary: profile.summary } : undefined,
  );
  feedback.push('✓ AI 故事渲染完成');

  const worldContext = generateWorldContext(node, type);
  feedback.push('✓ 整合世界线上下文');

  return {
    node: { ...node, story: { narrative: result.narrative, facts: result.facts, worldContext } },
    feedback,
  };
}

// ===== Phase 4: AI动态漫画生成 =====

export async function generateManga(node: StoryNode): Promise<{
  node: StoryNode;
  feedback: string[];
}> {
  const feedback: string[] = [];
  const visualStyle = selectVisualStyle(node);
  feedback.push(`✓ 选择视觉风格: ${getVisualStyleName(visualStyle)}`);
  feedback.push('✓ AI 生成分镜脚本...');

  const narrative = node.story?.narrative || '';
  const panels = await generateAIMangaPanels(node.scenario.timePoint, node.scenario.title, narrative);
  feedback.push(`✓ 生成${panels.length}帧漫画面板`);
  feedback.push('✓ 渲染漫画场景...');

  return { node: { ...node, manga: { panels, visualStyle } }, feedback };
}

// ===== AI 信息充分性检测 =====

export async function checkInfoSufficiency(
  timePoint: string, event: string, type: 'history' | 'future', profile?: UserProfile,
): Promise<SufficiencyResult> {
  const profileInfo = profile?.keywords?.length
    ? `已知关于这个人的线索：${profile.keywords.join('、')}。${profile.summary || ''}`
    : '目前对这个人的了解还很少。';

  const prompt = `你负责判断一个推演请求是否有足够的信息来生成有意义的推演内容。

时间点：${timePoint}
事件描述：${event}
推演类型：${type === 'history' ? '历史推演（回顾过去）' : '未来决策（展望未来）'}
${profileInfo}

判断标准：
- 信息充分：事件描述具体（能想象出一个场景），时间点清楚，用户画像至少有1-2个特质关键词
- 信息不足：事件太模糊（如"换工作"没有上下文），时间点含糊（如"以前"），用户画像几乎为空

如果信息不足，生成一个自然的追问——像朋友聊天一样，帮对方补充缺失的部分。不要用"请提供"这种正式语气。

返回JSON（只返回JSON）：
{
  "isSufficient": true或false,
  "missingAspects": ["缺失的方面1", "缺失的方面2"],
  "followUpQuestion": "如果不足，一句话追问；如果足够，空字符串"
}`;

  try {
    const response = await genAI.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        isSufficient: parsed.isSufficient === true || parsed.isSufficient === false ? parsed.isSufficient : true,
        missingAspects: Array.isArray(parsed.missingAspects) ? parsed.missingAspects : [],
        followUpQuestion: typeof parsed.followUpQuestion === 'string' ? parsed.followUpQuestion : '',
      };
    }
  } catch {}
  return { isSufficient: true, missingAspects: [], followUpQuestion: '' };
}

// ===== AI 追问对话 =====

export async function generateFollowUp(
  contextSummary: string, worldContext: string, lastQuestion: string, userReply: string,
): Promise<string> {
  const prompt = `你正在帮一个人完善推演场景的细节。你已经问了一个问题，对方回答了。根据回答，要么再追问一个最关键的细节，要么觉得差不多了就说"好的，我大概了解了"然后结束。

${contextSummary}
${worldContext}

你的上一句话：${lastQuestion}
对方回答：${userReply}

如果还需要了解什么，就问一个简短的问题（一句话，像朋友聊天）。
如果差不多了，说"好的，这些信息足够了，我们开始推演吧。"`;

  try {
    const response = await genAI.models.generateContent({ model: MODEL, contents: prompt });
    return (response.text || '').trim() || '好的，这些信息足够了，我们开始推演吧。';
  } catch {
    return '好的，这些信息足够了，我们开始推演吧。';
  }
}

// ===== AI 生成下一个节点 =====

export async function generateAINextNode(
  parentNode: StoryNode, selectedChoice: Choice, _customInput?: string,
): Promise<StoryNode> {
  const profile = getUserProfile();
  const timeline = parentNode.pathPlan?.timeline?.map(t => ({ time: t.time, event: t.event })) || [];

  const [narrativeResult, branchResult] = await Promise.all([
    generateAINarrative(
      parentNode.scenario.timePoint,
      `选择"${selectedChoice.label}"之后`,
      parentNode.scenario.predicate.includes('如果当初') ? 'history' : 'future',
      profile.keywords ? { keywords: profile.keywords, summary: profile.summary } : undefined,
    ),
    generateAIBranchChoices(
      parentNode.scenario.timePoint,
      selectedChoice.label,
      timeline,
      profile.keywords ? { keywords: profile.keywords } : undefined,
    ),
  ]);

  return {
    id: `node_${Date.now()}`,
    nodeType: Math.random() > 0.7 ? 'ending' : 'branch',
    scenario: {
      timePoint: '后续',
      title: selectedChoice.label,
      predicate: `选择"${selectedChoice.label}"之后...`,
    },
    story: { narrative: narrativeResult.narrative, facts: narrativeResult.facts, worldContext: '推演继续展开...' },
    choices: branchResult[0]?.choices?.map((c, i) => ({ id: `next_${i}`, label: c.label, preview: c.preview })) || [
      { id: 'next_a', label: '继续前进', preview: '相信当初的选择' },
      { id: 'next_b', label: '调整方向', preview: '换个方式走' },
      { id: 'next_c', label: '我有不同想法', preview: '自定义路径' },
    ],
    userContext: {
      timeMarker: `${parentNode.userContext.timeMarker} → 后续`,
      originalChoice: selectedChoice.label,
    },
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

// ===== 同步生成下一个节点（后备） =====

export function generateNextNode(
  parentNode: StoryNode, selectedChoice: Choice, _customInput?: string,
): StoryNode {
  const timeOffsets = ['三个月后', '半年后', '一年后'];
  const timeOffset = timeOffsets[Math.floor(Math.random() * timeOffsets.length)];
  const narrative = `你选择了"${selectedChoice.label}"。\n\n时间来到了${timeOffset}。\n\n这个决定带来了一系列连锁反应——新的环境、新的挑战、新的可能性。有些在你预料之中，有些则完全出乎意料。\n\n站在这里回望，那个选择改变了什么？`;
  return {
    id: `node_${Date.now()}`,
    nodeType: Math.random() > 0.7 ? 'ending' : 'branch',
    scenario: { timePoint: timeOffset, title: selectedChoice.label, predicate: `选择"${selectedChoice.label}"之后...` },
    story: { narrative, facts: generateFacts(selectedChoice.label), worldContext: '推演继续展开...' },
    choices: [
      { id: 'next_a', label: '继续前进', preview: '相信当初的选择' },
      { id: 'next_b', label: '调整方向', preview: '换个方式走' },
      { id: 'next_c', label: '我有不同的想法', preview: '自定义路径' },
    ],
    userContext: { timeMarker: `${parentNode.userContext.timeMarker} → ${timeOffset}`, originalChoice: selectedChoice.label },
    status: 'active',
    createdAt: new Date().toISOString(),
  };
}

// ===== AI 叙事生成 =====

async function generateAINarrative(
  timePoint: string, event: string, type: 'history' | 'future', profile?: { keywords: string[]; summary?: string },
): Promise<{ narrative: string; facts: string[] }> {
  const profileInfo = profile?.keywords?.length
    ? `关于这个人的一些线索：${profile.keywords.join('、')}。${profile.summary || ''}`
    : '';

  const prompt = `你是一个可能性探索者。你的任务是根据一个关键选择，构想一条时间线的走向。

${profileInfo}
时间点：${timePoint}
关键事件：${event}
推演类型：${type === 'history' ? '平行人生（回顾过去没选的路）' : '决策辅助（探索未来的可能性）'}

请用口语化的方式，写一段推演叙事（80-150字）。

要求：
- 像在讲故事，不像在写报告。用"你"来称呼对方。
- 具体。不要用"一切都会好起来"、"人生充满可能"这种空话。说具体会发生什么。
- 如果推演类型是"平行人生"，要能感觉出这是一条"没走的路"，有一种淡淡的"如果当初..."的质感。
- 如果推演类型是"决策辅助"，帮对方看清每条路大概会通向哪里。不替对方决定。
- 叙事要有画面感——某个具体的场景、某个具体的时刻。

另外再给3条"背景事实"（每条15字以内），模拟如果这个世界线真的发生，可能会伴随的真实情况。比如行业变化、生活细节、人际关系的转变。

返回JSON（只返回JSON）：
{
  "narrative": "叙事文本",
  "facts": ["事实1", "事实2", "事实3"]
}`;

  try {
    const response = await genAI.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        narrative: typeof parsed.narrative === 'string' ? parsed.narrative : '',
        facts: Array.isArray(parsed.facts) ? parsed.facts.filter((f: any) => typeof f === 'string').slice(0, 5) : [],
      };
    }
  } catch {}
  return { narrative: `${timePoint}，${event}。你站在选择的岔路口。每条路都有它独特的风景和挑战。`, facts: ['每个选择都有机会成本', '时间会验证一切', '你永远有修正方向的能力'] };
}

// ===== AI 分支选择生成 =====

async function generateAIBranchChoices(
  timePoint: string, event: string, timeline: { time: string; event: string }[], profile?: { keywords: string[] },
): Promise<BranchPoint[]> {
  const profileInfo = profile?.keywords?.length
    ? `这个人的一些特质：${profile.keywords.join('、')}。设计选项时考虑这些特质。`
    : '';

  const timelineText = timeline.map(t => `${t.time}: ${t.event}`).join('\n');
  const branchEvents = timeline
    .filter(t => t.event.includes('选择') || t.event.includes('转折') || t.event.includes('决定'))
    .map(t => `${t.time}: ${t.event}`)
    .join('\n') || '请根据时间线自行判断关键选择点';

  const prompt = `为一个推演故事设计分支选择点。

时间点：${timePoint}
事件：${event}
时间线：
${timelineText}
${profileInfo}

为时间线中的关键节点（branch类型的节点）设计具体的选择。每个节点给2-3个选项。

选项要求：
- 具体。不要用"积极进取"、"稳妥行事"这种泛泛的词。要说具体做什么。
- 比如："继续在这家公司深耕技术"vs"接受朋友推荐的创业团队"vs"裸辞休息半年"
- 选项要反映真实人生的困境——每个选项都有代价，没有完美选择。

时间线中的branch节点：
${branchEvents}

返回JSON（只返回JSON）：
{
  "branchPoints": [
    {
      "time": "时间",
      "question": "选择的问题（10字内）",
      "choices": [
        {"label": "选项1（8字内）", "preview": "这个选择的简短描述（15字内）"},
        {"label": "选项2", "preview": "简短描述"},
        {"label": "选项3", "preview": "简短描述"}
      ]
    }
  ]
}

最多3个分支点，每个最多3个选项。`;

  try {
    const response = await genAI.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.branchPoints)) {
        return parsed.branchPoints.map((bp: any, i: number) => ({
          time: typeof bp.time === 'string' ? bp.time : '',
          question: typeof bp.question === 'string' ? bp.question : '你会怎么选？',
          choices: Array.isArray(bp.choices) ? bp.choices.map((c: any, j: number) => ({
            id: `b${i}_${j}`,
            label: typeof c.label === 'string' ? c.label : '',
            preview: typeof c.preview === 'string' ? c.preview : '',
          })) : [],
        }));
      }
    }
  } catch {}
  return [{ id: 'b0', time: '关键节点', question: '在这个时刻，你会怎么选？', choices: [{ id: 'b0_a', label: '按计划前进', preview: '沿着当前路径继续' }, { id: 'b0_b', label: '调整方向', preview: '试试另一种可能' }, { id: 'b0_c', label: '我有不同想法', preview: '说一个你自己的选择' }] }];
}

// ===== AI 漫画面板生成 =====

async function generateAIMangaPanels(timePoint: string, event: string, narrative: string): Promise<MangaPanel[]> {
  const prompt = `为一个推演故事生成4帧漫画分镜。

时间点：${timePoint}
事件：${event}
叙事：${narrative}

设计4帧连续画面，像一组有故事性的漫画：
- 第1帧：远景/环境——这个时间点发生的场景
- 第2帧：中景/人物——一个人面对选择的状态
- 第3帧：特写/细节——某个关键的东西或瞬间
- 第4帧：正面/对视——直接面对观看者，像在问一个问题

每帧包含：
- description：画面描述（中文，10字以内）
- caption：配文（中文，15字以内，像漫画的对话框或旁白）

返回JSON（只返回JSON）：
{
  "panels": [
    {"description": "画面描述1", "caption": "配文1"},
    {"description": "画面描述2", "caption": "配文2"},
    {"description": "画面描述3", "caption": "配文3"},
    {"description": "画面描述4", "caption": "配文4"}
  ]
}`;

  try {
    const response = await genAI.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.panels)) {
        return parsed.panels.map((p: any, i: number) => ({
          id: `panel_${i + 1}`,
          description: typeof p.description === 'string' ? p.description : '场景',
          caption: typeof p.caption === 'string' ? p.caption : '',
          imageUrl: undefined,
        })).slice(0, 4);
      }
    }
  } catch {}
  return [
    { id: 'panel_1', description: '城市天际线远景', caption: timePoint, imageUrl: undefined },
    { id: 'panel_2', description: '人物背影中景', caption: `${event}的决定时刻`, imageUrl: undefined },
    { id: 'panel_3', description: '分岔路口特写', caption: '两条路摆在你面前', imageUrl: undefined },
    { id: 'panel_4', description: '正面眼神对视', caption: '你会怎么选？', imageUrl: undefined },
  ];
}

// ===== 辅助函数（本地，不需要 AI） =====

function extractTimePoint(input: string): string | null {
  const yearMatch = input.match(/(\d{4})年?/);
  if (yearMatch) return yearMatch[1] + '年';
  const relativeTime = input.match(/(去年|前年|大前年|今年|明年|去年这时候|那时候|三年前|两年前|一年前)/);
  if (relativeTime) return relativeTime[1];
  return null;
}

function extractEvent(input: string): string {
  const keywords = ['辞职', '入职', '换工作', '结婚', '分手', '搬家', '创业', '买房', '出国', '考研', '跳槽', '离职', '留学', '转行'];
  for (const kw of keywords) {
    if (input.includes(kw)) return kw;
  }
  return input.slice(0, 20) + (input.length > 20 ? '...' : '');
}

function extractChoices(_input: string, type: 'history' | 'future'): Choice[] {
  if (type === 'history') {
    return [
      { id: 'choice_a', label: '坚持当初的选择', preview: '继续走这条路' },
      { id: 'choice_b', label: '选择另一条路', preview: '探索未知的可能' },
      { id: 'choice_c', label: '我有不一样的想法', preview: '自定义路径' },
    ];
  }
  return [
    { id: 'option_a', label: '选择A方案', preview: '深入分析第一条路' },
    { id: 'option_b', label: '选择B方案', preview: '深入分析第二条路' },
    { id: 'option_c', label: '还有其他选择', preview: '告诉我更多可能' },
  ];
}

function buildSituationContext(event: string, type: 'history' | 'future'): string {
  if (type === 'history') return `回顾${event}的那个决定，两条路摆在你面前——一条是你走过的，另一条是没选的。`;
  return `面对${event}的抉择，每条路都有它的代价和收获。`;
}

function generateTimeline(node: StoryNode, type: 'history' | 'future'): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const startTime = node.scenario.timePoint;
  if (type === 'history') {
    events.push({ time: startTime, event: node.scenario.title, type: 'milestone' });
    events.push({ time: '三个月后', event: '适应期结束时', type: 'branch' });
    events.push({ time: '半年后', event: '第一个转折点', type: 'branch' });
    events.push({ time: '一年后', event: '阶段性结果', type: 'ending' });
  } else {
    events.push({ time: '当下', event: node.scenario.title, type: 'milestone' });
    events.push({ time: '短期', event: '即将面临的第一个选择', type: 'branch' });
    events.push({ time: '中期', event: '关键决策点', type: 'branch' });
    events.push({ time: '长期', event: '可能的结局', type: 'ending' });
  }
  return events;
}

function calculateDuration(timeline: TimelineEvent[]): string {
  const milestones = timeline.filter(t => t.type === 'milestone' || t.type === 'ending');
  if (milestones.length < 2) return '数月';
  return `从${milestones[0].time}到${milestones[milestones.length - 1].time}`;
}

function generateWorldContext(node: StoryNode, type: 'history' | 'future'): string {
  const year = node.scenario.timePoint.match(/\d{4}/)?.[0] || '2024';
  if (type === 'history') return `${year}年的外部环境：市场在变化，机会在流动，每一步都踩在时代的节拍上。`;
  return '当下的外部环境：不确定性是常态，但趋势可以被识别。';
}

function selectVisualStyle(node: StoryNode): VisualStyle {
  const event = node.scenario.title;
  if (event.includes('工作') || event.includes('辞职') || event.includes('跳槽')) return 'cold_documentary';
  if (event.includes('感情') || event.includes('结婚') || event.includes('分手')) return 'nostalgic_film';
  if (event.includes('迷茫') || event.includes('焦虑')) return 'fractured_memory';
  return 'cold_documentary';
}

function getVisualStyleName(style: VisualStyle): string {
  const names: Record<VisualStyle, string> = { nostalgic_film: '怀旧胶片', cold_documentary: '冷峻纪实', fractured_memory: '碎片记忆', ink_wash: '水墨写意' };
  return names[style];
}

function generateFacts(theme: string): string[] {
  const factBank: Record<string, string[]> = {
    '辞职': ['行业人才流动率近20%', '职业转换期平均3-6个月', '空窗期不等于失败'],
    '创业': ['创业成功率约10%', '早期融资完成率不足5%', '成熟赛道更容易获客'],
    '出国': ['留学生回国率超80%', '海外工作经历薪资溢价显著', '文化适应需要6-12个月'],
    default: ['选择的时机很重要', '信息不对称是决策的最大障碍', '每个选择都有机会成本'],
  };
  for (const [key, facts] of Object.entries(factBank)) {
    if (theme.includes(key)) return facts;
  }
  return factBank.default;
}

// 生成推演总结
export function generateSummary(nodes: StoryNode[]): string {
  const nodeCount = nodes.length;
  return `## 推演总结\n\n**探索节点数目**：${nodeCount} 个\n\n---\n\n### 关键发现\n\n这次推演揭示了几个要点：\n\n- 每个选择都导向不同的风景，没有绝对正确的路\n- 时间会验证选择，也会提供修正的机会\n- 你始终拥有选择的主动权\n\n---\n\n推演已保存到你的世界线。你可以随时回来，探索其他分支的可能性。`;
}