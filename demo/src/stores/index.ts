import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ User Store ============

interface Keyword {
  text: string
  type: 'primary' | 'secondary'
}

interface UserProfile {
  id: string
  name: string
  summary: string
  keywords: Keyword[]
  clarity: number // 0-100
  personality: 'contemplative' | 'looking_around' | 'relaxed'
  hook?: {
    text: string
    action: string
  }
  createdAt: string
  updatedAt: string
}

interface UserState {
  profile: UserProfile | null
  clarityTimeline: Array<{ date: string; clarity: number }>
  isFirstVisit: boolean

  setProfile: (profile: Partial<UserProfile>) => void
  updateClarity: (clarity: number) => void
  setFirstVisit: (value: boolean) => void
  reset: () => void
}

const defaultProfile: UserProfile = {
  id: 'demo-user',
  name: '小北',
  summary: '你是一个在稳定与自由之间反复拉扯的人',
  keywords: [
    { text: '成长优先', type: 'primary' },
    { text: '内向社交', type: 'secondary' },
    { text: '行动犹豫', type: 'secondary' },
    { text: '深度思考', type: 'secondary' },
  ],
  clarity: 60,
  personality: 'contemplative',
  hook: {
    text: '你提到过3次学设计，但每次都没有行动',
    action: '推演如果当初开始会怎样',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      clarityTimeline: [
        { date: '2026-03', clarity: 40 },
        { date: '2026-04', clarity: 60 },
      ],
      isFirstVisit: true,

      setProfile: (profile) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...profile, updatedAt: new Date().toISOString() }
            : ({ ...defaultProfile, ...profile } as UserProfile),
        })),

      updateClarity: (clarity) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, clarity, updatedAt: new Date().toISOString() }
            : null,
          clarityTimeline: [
            ...state.clarityTimeline,
            { date: new Date().toISOString().slice(0, 7), clarity },
          ],
        })),

      setFirstVisit: (value) => set({ isFirstVisit: value }),

      reset: () =>
        set({
          profile: defaultProfile,
          clarityTimeline: [],
          isFirstVisit: true,
        }),
    }),
    { name: 'mirror-user' }
  )
)

// ============ Chat Store ============

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: string
}

interface ChatState {
  messages: Message[]
  isTyping: boolean

  addUserMessage: (content: string) => void
  addAIMessage: (content: string) => void
  setTyping: (typing: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'ai',
      content: '最近有什么想聊的吗？',
      timestamp: new Date().toISOString(),
    },
  ],
  isTyping: false,

  addUserMessage: (content) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, newMessage],
    }))
  },

  addAIMessage: (content) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      messages: [...state.messages, newMessage],
      isTyping: false,
    }))
  },

  setTyping: (typing) => set({ isTyping: typing }),

  clearMessages: () =>
    set({
      messages: [
        {
          id: '1',
          role: 'ai',
          content: '最近有什么想聊的吗？',
          timestamp: new Date().toISOString(),
        },
      ],
    }),
}))

// ============ Worldline Store ============

type NodeType = '决定' | '事件' | '转折' | '差点发生' | '遗憾' | '推演'

interface WorldlineNode {
  id: string
  type: NodeType
  title: string
  date: string
  description: string
  color: string
}

interface WorldlineState {
  nodes: WorldlineNode[]
  currentNodeId: string | null
  viewMode: 'timeline' | 'parallel' | 'regret'
  filter: 'all' | NodeType

  addNode: (node: Omit<WorldlineNode, 'id' | 'color'>) => void
  setCurrentNode: (id: string | null) => void
  setViewMode: (mode: 'timeline' | 'parallel' | 'regret') => void
  setFilter: (filter: 'all' | NodeType) => void
}

const nodeColors: Record<NodeType, string> = {
  '决定': '#D4A574',
  '事件': '#6B8CAE',
  '转折': '#B8A5D0',
  '差点发生': '#7A7A7A',
  '遗憾': '#AE8B8B',
  '推演': '#8B9A7A',
}

const defaultNodes: WorldlineNode[] = [
  {
    id: '1',
    type: '决定',
    title: '加入创业公司',
    date: '2022-03',
    description: '放弃了稳定的大厂工作，选择了创业公司',
    color: nodeColors['决定'],
  },
  {
    id: '2',
    type: '差点发生',
    title: '差点买房',
    date: '2022-05',
    description: '当时看中的那套房子...',
    color: nodeColors['差点发生'],
  },
  {
    id: '3',
    type: '转折',
    title: '想清楚健康比工作重要',
    date: '2023-02',
    description: '开始重新审视生活的意义',
    color: nodeColors['转折'],
  },
  {
    id: '4',
    type: '事件',
    title: '项目上线',
    date: '2023-05',
    description: '付出的努力终于有了成果',
    color: nodeColors['事件'],
  },
]

export const useWorldlineStore = create<WorldlineState>()(
  persist(
    (set) => ({
      nodes: defaultNodes,
      currentNodeId: null,
      viewMode: 'timeline',
      filter: 'all',

      addNode: (node) =>
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              ...node,
              id: Date.now().toString(),
              color: nodeColors[node.type],
            },
          ],
        })),

      setCurrentNode: (id) => set({ currentNodeId: id }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setFilter: (filter) => set({ filter }),
    }),
    { name: 'mirror-worldline' }
  )
)

// ============ Scenario Store ============

interface ComicAct {
  scene: string
  text: string
}

interface Branch {
  id: string
  label: string
  description: string
}

interface Scenario {
  id: string
  type: 'history' | 'future'
  title: string
  timestamp: string
  dialogue: Array<{ role: 'user' | 'ai'; content: string }>
  comic: {
    acts: ComicAct[]
    branches?: Branch[]
  }
  status: 'dialogue' | 'comic' | 'completed'
}

interface ScenarioState {
  currentScenario: Scenario | null
  currentAct: number
  isPlaying: boolean

  startScenario: (type: 'history' | 'future', title: string, timestamp: string) => void
  addDialogue: (role: 'user' | 'ai', content: string) => void
  setComic: (acts: ComicAct[], branches?: Branch[]) => void
  nextAct: () => void
  prevAct: () => void
  setPlaying: (playing: boolean) => void
  completeScenario: () => void
}

const defaultScenario: Scenario = {
  id: 'demo-scenario',
  type: 'history',
  title: '如果当初没有辞职',
  timestamp: '2022-03',
  dialogue: [
    { role: 'ai', content: '让我们回到2022年3月。那个时候，你没有辞职。' },
    { role: 'ai', content: '继续在原来的公司工作，接下来的几个月会怎样？' },
    { role: 'user', content: '可能会比较稳定，但也可能继续感到压抑...' },
    { role: 'ai', content: '在原来的公司继续工作，3个月后你会面临什么？' },
    { role: 'user', content: '可能会有一次升职机会，但可能也会错过一些成长的机会' },
    { role: 'ai', content: '我已经了解了这个场景。要不要我把它画成一段画面？' },
  ],
  comic: {
    acts: [
      { scene: 'office', text: '2022年3月15日，是你原本要离职的日子。但你选择了留下。' },
      { scene: 'meeting', text: '三个月后，领导把你叫进了办公室。升职通知书递到你面前。' },
      { scene: 'window', text: '你站在窗前，看着这座城市。心里却想起了那家创业公司。' },
      { scene: 'night', text: '深夜，你打开了招聘网站。稳定，真的是你想要的吗？' },
    ],
    branches: [
      { id: 'a', label: '继续坚持', description: '在这个位置上深耕' },
      { id: 'b', label: '重新出发', description: '即使现在，也不晚' },
    ],
  },
  status: 'completed',
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  currentScenario: defaultScenario,
  currentAct: 0,
  isPlaying: false,

  startScenario: (type, title, timestamp) => {
    set({
      currentScenario: {
        id: Date.now().toString(),
        type,
        title,
        timestamp,
        dialogue: [],
        comic: { acts: [] },
        status: 'dialogue',
      },
      currentAct: 0,
      isPlaying: false,
    })
  },

  addDialogue: (role, content) =>
    set((state) => {
      if (!state.currentScenario) return state
      return {
        currentScenario: {
          ...state.currentScenario,
          dialogue: [...state.currentScenario.dialogue, { role, content }],
        },
      }
    }),

  setComic: (acts, branches) =>
    set((state) => {
      if (!state.currentScenario) return state
      return {
        currentScenario: {
          ...state.currentScenario,
          comic: { acts, branches },
          status: 'comic',
        },
      }
    }),

  nextAct: () =>
    set((state) => {
      if (!state.currentScenario) return state
      const maxAct = state.currentScenario.comic.acts.length - 1
      return { currentAct: Math.min(state.currentAct + 1, maxAct) }
    }),

  prevAct: () =>
    set((state) => ({ currentAct: Math.max(state.currentAct - 1, 0) })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  completeScenario: () =>
    set((state) => {
      if (!state.currentScenario) return state
      return {
        currentScenario: {
          ...state.currentScenario,
          status: 'completed',
        },
      }
    }),
}))

// ============ UI Store ============

interface UIState {
  isLoading: boolean
  currentPhase: 'dark' | 'light' | 'human' | 'approach' | 'mirror' | 'slogan' | 'greeting'

  setLoading: (loading: boolean) => void
  setPhase: (phase: UIState['currentPhase']) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  currentPhase: 'dark',

  setLoading: (loading) => set({ isLoading: loading }),
  setPhase: (phase) => set({ currentPhase: phase }),
}))