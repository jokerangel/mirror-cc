// 平行推演引擎 - 完整节点生成流程

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

export interface StoryNode {
  id: string;
  nodeType: NodeType;
  scenario: {
    timePoint: string;
    title: string;
    predicate: string;
  };

  // Phase 1: 起源节点信息
  originInfo?: {
    extractedTime: string;
    extractedEvent: string;
    userOriginalChoice?: string;
    userAlternativeChoice?: string;
    situationContext: string;
  };

  // Phase 2: 推演路径规划
  pathPlan?: {
    timeline: TimelineEvent[];
    branchPoints: BranchPoint[];
    totalDuration: string;
    estimatedNodes: number;
  };

  // Phase 3: 故事内容
  story?: {
    narrative: string;
    facts: string[];
    worldContext: string;
  };

  // Phase 4: 漫画
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

// ===== Phase 1: 起源节点构建 =====
export function buildOriginNode(userInput: string, type: 'history' | 'future'): {
  node: StoryNode;
  feedback: string[];
} {
  const feedback: string[] = [];

  // 提取时间点
  const extractedTime = extractTimePoint(userInput) || (type === 'history' ? '那个重要时刻' : '当下');
  feedback.push(`✓ 提取时间点: ${extractedTime}`);

  // 提取事件
  const extractedEvent = extractEvent(userInput);
  feedback.push(`✓ 识别关键事件: ${extractedEvent}`);

  // 提取选择
  const choices = extractChoices(userInput, type);
  feedback.push(`✓ 发现选择分支: ${choices.length} 个可能性`);

  // 构建情境上下文
  const situationContext = buildSituationContext(extractedEvent, type);
  feedback.push(`✓ 构建情境上下文完成`);

  const node: StoryNode = {
    id: `node_${Date.now()}`,
    nodeType: type === 'future' ? 'pending' : 'origin',
    scenario: {
      timePoint: extractedTime,
      title: extractedEvent,
      predicate: type === 'history' ? `如果当初在${extractedTime}...` : `面对${extractedTime}的选择`
    },
    originInfo: {
      extractedTime,
      extractedEvent,
      situationContext,
      userOriginalChoice: type === 'history' ? choices[0]?.label : undefined,
      userAlternativeChoice: type === 'history' ? choices[1]?.label : undefined
    },
    choices,
    userContext: {
      timeMarker: extractedTime
    },
    status: 'active',
    createdAt: new Date().toISOString()
  };

  return { node, feedback };
}

// ===== Phase 2: 推演路径规划 =====
export function planDeductionPath(node: StoryNode, type: 'history' | 'future'): {
  node: StoryNode;
  feedback: string[];
} {
  const feedback: string[] = [];

  feedback.push('✓ 加载用户画像数据...');
  feedback.push('✓ 分析决策路径...');

  // 生成时间线
  const timeline = generateTimeline(node, type);
  feedback.push(`✓ 生成推演时间线: ${timeline.length} 个关键节点`);

  // 生成分支点
  const branchPoints = generateBranchPoints(node, timeline);
  feedback.push(`✓ 规划分支选择点: ${branchPoints.length} 个选择节点`);

  // 计算推演时长
  const totalDuration = calculateDuration(timeline);
  feedback.push(`✓ 预估推演时长: ${totalDuration}`);

  const updatedNode: StoryNode = {
    ...node,
    pathPlan: {
      timeline,
      branchPoints,
      totalDuration,
      estimatedNodes: timeline.length + branchPoints.length
    }
  };

  return { node: updatedNode, feedback };
}

// ===== Phase 3: 故事渲染生成 =====
export function generateStory(node: StoryNode, type: 'history' | 'future'): {
  node: StoryNode;
  feedback: string[];
} {
  const feedback: string[] = [];

  feedback.push('✓ 初始化叙事引擎...');
  feedback.push('✓ 生成情境描述...');

  // 生成叙事内容
  const narrative = generateNarrative(node, type);
  feedback.push('✓ 故事渲染完成');

  // 生成事实数据
  const facts = generateFacts(node.scenario.title);
  feedback.push('✓ 嵌入背景数据');

  // 生成世界上下文
  const worldContext = generateWorldContext(node, type);
  feedback.push('✓ 整合世界线上下文');

  const updatedNode: StoryNode = {
    ...node,
    story: {
      narrative,
      facts,
      worldContext
    }
  };

  return { node: updatedNode, feedback };
}

// ===== Phase 4: 动态漫画生成 =====
export function generateManga(node: StoryNode): {
  node: StoryNode;
  feedback: string[];
} {
  const feedback: string[] = [];

  // 选择视觉风格
  const visualStyle = selectVisualStyle(node);
  feedback.push(`✓ 选择视觉风格: ${getVisualStyleName(visualStyle)}`);

  // 生成分镜脚本
  feedback.push('✓ 生成分镜脚本...');
  const panels = generateMangaPanels(node);
  feedback.push(`✓ 生成${panels.length}帧漫画面板`);

  // 模拟图像生成
  feedback.push('✓ 渲染漫画场景...');

  const updatedNode: StoryNode = {
    ...node,
    manga: {
      panels,
      visualStyle
    }
  };

  return { node: updatedNode, feedback };
}

// ===== 辅助函数 =====

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
    const baseChoices: Choice[] = [
      { id: 'choice_a', label: '坚持当初的选择', preview: '继续走这条路' },
      { id: 'choice_b', label: '选择另一条路', preview: '探索未知的可能' },
      { id: 'choice_c', label: '我有不一样的想法', preview: '自定义路径' }
    ];
    return baseChoices;
  }

  return [
    { id: 'option_a', label: '选择A方案', preview: '深入分析第一条路' },
    { id: 'option_b', label: '选择B方案', preview: '深入分析第二条路' },
    { id: 'option_c', label: '还有其他选择', preview: '告诉我更多可能' }
  ];
}

function buildSituationContext(event: string, type: 'history' | 'future'): string {
  if (type === 'history') {
    return `回顾${event}的那个决定，两条路摆在你面前——一条是你走过的，另一条是没选的。`;
  }
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

function generateBranchPoints(_node: StoryNode, timeline: TimelineEvent[]): BranchPoint[] {
  return timeline
    .filter(t => t.type === 'branch')
    .map((t, idx) => ({
      id: `branch_${idx}`,
      time: t.time,
      question: `在${t.event}，你会怎么选？`,
      choices: [
        { id: `b${idx}_a`, label: '积极进取', preview: '主动创造机会' },
        { id: `b${idx}_b`, label: '稳妥行事', preview: '等待时机成熟' },
        { id: `b${idx}_c`, label: '换个思路', preview: '尝试不同的方法' }
      ]
    }));
}

function calculateDuration(timeline: TimelineEvent[]): string {
  const milestones = timeline.filter(t => t.type === 'milestone' || t.type === 'ending');
  if (milestones.length < 2) return '数月';

  const start = milestones[0].time;
  const end = milestones[milestones.length - 1].time;

  return `从${start}到${end}`;
}

function generateNarrative(node: StoryNode, type: 'history' | 'future'): string {
  const timePoint = node.scenario.timePoint;
  const event = node.scenario.title;

  if (type === 'history') {
    return `${timePoint}，${event}。那是一个关键的决定时刻。

你站在人生的十字路口，面前是两条截然不同的路。一条是你最终选择的，另一条是未知的可能性。

让我们穿越时间，去看看那条没走的路上，会发生什么。`;
  }

  return `你正在面对一个重要的决定——${event}。

两个方向各有利弊，不确定性的迷雾笼罩着未来。让我们试着拨开迷雾，看清每条路的走向。

这不是预测，只是可能性的探索。`;
}

function generateFacts(theme: string): string[] {
  const factBank: Record<string, string[]> = {
    '辞职': ['行业人才流动率近20%', '职业转换期平均3-6个月', '空窗期不等于失败'],
    '创业': ['创业成功率约10%', '早期融资完成率不足5%', '成熟赛道更容易获客'],
    '出国': ['留学生回国率超80%', '海外工作经历薪资溢价显著', '文化适应需要6-12个月'],
    'default': ['选择的时机很重要', '信息不对称是决策的最大障碍', '每个选择都有机会成本']
  };

  for (const [key, facts] of Object.entries(factBank)) {
    if (theme.includes(key)) return facts;
  }
  return factBank.default;
}

function generateWorldContext(node: StoryNode, type: 'history' | 'future'): string {
  const year = node.scenario.timePoint.match(/\d{4}/)?.[0] || '2024';

  if (type === 'history') {
    return `${year}年的外部环境：市场在变化，机会在流动，每一步都踩在时代的节拍上。`;
  }
  return `当下的外部环境：不确定性是常态，但趋势可以被识别。`;
}

function selectVisualStyle(node: StoryNode): VisualStyle {
  const event = node.scenario.title;

  if (event.includes('工作') || event.includes('辞职') || event.includes('跳槽')) {
    return 'cold_documentary';
  }
  if (event.includes('感情') || event.includes('结婚') || event.includes('分手')) {
    return 'nostalgic_film';
  }
  if (event.includes('迷茫') || event.includes('焦虑')) {
    return 'fractured_memory';
  }
  return 'cold_documentary';
}

function getVisualStyleName(style: VisualStyle): string {
  const names: Record<VisualStyle, string> = {
    'nostalgic_film': '怀旧胶片',
    'cold_documentary': '冷峻纪实',
    'fractured_memory': '碎片记忆',
    'ink_wash': '水墨写意'
  };
  return names[style];
}

function generateMangaPanels(node: StoryNode): MangaPanel[] {
  const timePoint = node.scenario.timePoint;
  const event = node.scenario.title;

  return [
    {
      id: 'panel_1',
      description: '远景镜头，城市天际线',
      caption: `${timePoint}`,
      imageUrl: undefined
    },
    {
      id: 'panel_2',
      description: '中景，人物背影',
      caption: `${event}的决定时刻`,
      imageUrl: undefined
    },
    {
      id: 'panel_3',
      description: '特写，分岔路口',
      caption: '两条路摆在你面前',
      imageUrl: undefined
    },
    {
      id: 'panel_4',
      description: '正面特写，眼神',
      caption: '你会怎么选？',
      imageUrl: undefined
    }
  ];
}

// 生成下一个节点
export function generateNextNode(
  parentNode: StoryNode,
  selectedChoice: Choice,
  _customInput?: string
): StoryNode {
  const nodeId = `node_${Date.now()}`;
  const timeOffsets = ['三个月后', '半年后', '一年后'];
  const timeOffset = timeOffsets[Math.floor(Math.random() * timeOffsets.length)];

  const narrative = `你选择了"${selectedChoice.label}"。

时间来到了${timeOffset}。

这个决定带来了一系列连锁反应——新的环境、新的挑战、新的可能性。有些在你预料之中，有些则完全出乎意料。

站在这里回望，那个选择改变了什么？`;

  return {
    id: nodeId,
    nodeType: Math.random() > 0.7 ? 'ending' : 'branch',
    scenario: {
      timePoint: timeOffset,
      title: selectedChoice.label,
      predicate: `选择"${selectedChoice.label}"之后...`
    },
    story: {
      narrative,
      facts: generateFacts(selectedChoice.label),
      worldContext: '推演继续展开...'
    },
    choices: [
      { id: 'next_a', label: '继续前进', preview: '相信当初的选择' },
      { id: 'next_b', label: '调整方向', preview: '换个方式走' },
      { id: 'next_c', label: '我有不同的想法', preview: '自定义路径' }
    ],
    userContext: {
      timeMarker: `${parentNode.userContext.timeMarker} → ${timeOffset}`,
      originalChoice: selectedChoice.label
    },
    status: 'active',
    createdAt: new Date().toISOString()
  };
}

// 生成推演总结
export function generateSummary(nodes: StoryNode[]): string {
  const nodeCount = nodes.length;
  const pathLength = nodes.length;

  return `## 推演总结

**探索节点数目**：${nodeCount} 个
**推演路径长度**：${pathLength} 步

---

### 关键发现

这次推演揭示了几个要点：

- 每个选择都导向不同的风景，没有绝对正确的路
- 时间会验证选择，也会提供修正的机会
- 你始终拥有选择的主动权

---

推演已保存到你的世界线。你可以随时回来，探索其他分支的可能性。`;
}