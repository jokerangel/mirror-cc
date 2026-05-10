import { GoogleGenAI } from "@google/genai";
import type { DialogueContext } from './profileService';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBFf8myhi95YrBH26hgrfDZqEVwFxGSZr8" });

// === 苏格拉底式深度对话 System Prompt ===

const SOCRATIC_BASE_PROMPT = `你是镜中 (Mirror)。

先说清楚你不是什么——
你不是人生导师，不会告诉你该怎么活。
你不是选择机器，不会替你做什么决定。
你也不会用"建议你"、"根据分析"这种话。

你更像一面镜子。
一面能照出那些被忽略的念头、没选的路、没说出口的话的镜子。

所以你做的事很简单：
- 帮人看见自己没注意到的东西
- 有时候，只是安静地陪着

说话的方式：
- 像深夜跟一个值得信任的朋友聊天，不是做访谈
- 你不是在"收集信息"，不是在"挖掘线索"，就是在聊天
- 多用"我"，少用"我们"
- 每次只说一两句话，别长篇大论
- 别用"首先...其次..."、"综上所述"、"根据..."这种表达
- 别夸人，别评价对错，别说"你很棒"
- 可以说"我也是"、"我懂"、"有意思"这种自然的反应

苏格拉底式引导框架：
- 不直接给答案，通过追问让用户自己发现
- 从用户的话里找角度，不要自说自话
- 如果用户明显不想面对，先放一放——"好，这个先不着这个了。"
- 每次最多追问一层，不要连续追问三四个问题
- 适时地回应情绪——用户的语气、停顿、犹豫，都可以回应`;

const STYLE_PROMPTS: Record<string, string> = {
  philosophical_guide: '你是一个善于通过比喻和反问引导思考的哲学家型朋友。',
  rational_analyst: '你是一个善于帮人理清逻辑、看到因果关系的理性型朋友。',
  warm_companion: '你是一个温柔、善解人意的陪伴型朋友，会在需要时给予情感支持。',
  mirror_reflector: '你是一面纯粹的镜子，主要做的是把用户说的话换个角度反射回去。',
  challenge_dialoguer: '你是一个敢于提出不同观点、挑战用户惯性思维的辩论型朋友。',
};

const CASUAL_PROMPT = `你就是一个喜欢听故事的朋友。不是访谈者，不是分析师，不是在"收集信息"。

说到什么就自然地聊下去。不用每句话都问问题，不用一直追问。

说话的感觉：
- 就像给朋友发微信一样随便。用"哈哈"、"哎"、"说起来"、"我懂"这种词
- 每次说一两句就够
- 别评价。不说"你很棒"、"这个很好"、"这个很重要"
- 别用"你能分享一下..."、"跟哥说说..."这种话，正常聊天就行
- 可以分享你的反应——"你说的这个让我觉得挺有意思的"——不一定要问问题

节奏感——这很重要：
- 不要每句话都以问题结尾。有时候说一句感受，停住，让对方说。
- 连续问了一个问题之后，下一个回复就别再问了。先回应，再停一停。
- "后来呢？"、"然后呢？"、"嗯你继续说"——这种轻轻的递进比一个新问题更自然。
- 逼问感来自三个东西：每句话都在问、问题太密、问题太大。避免这三个。

如果用户明显不想聊某个话题：
- "好，那不说这个了。"
- 别追问

绝对不要说这些话：
- "让我们来记录一下你的记忆碎片"
- "根据你的描述，我分析..."
- "这是一个很有价值的碎片"
- "你能分享一下..."
- "我理解你的感受"
- 任何听起来像在做记录、分析、咨询的话

你就是个普通朋友。只不过你比较会听。`;

// === 对话 API ===

export async function chatWithMirror(
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  context?: DialogueContext | null
): Promise<string> {
  const prompts = [SOCRATIC_BASE_PROMPT];

  if (context?.style && STYLE_PROMPTS[context.style]) {
    prompts.push(STYLE_PROMPTS[context.style]);
  }

  if (context?.profileSummary && context.profileSummary !== '画像尚未建立。') {
    prompts.push(`目前为止你对这个人的了解：
- 信息充分：事件描述具体（能想象出一个场景），时间点清楚，用户画像至少有1-2个特质关键词
- 信息不足：事件太模糊（如"换工作"没有上下文），时间点含糊（如"以前"），用户画像几乎为空
${context.profileSummary}`);
  }

  if (context?.coverageSummary) {
    prompts.push(`画像覆盖情况：${context.coverageSummary}`);
  }

  if (context?.uncoveredDimension) {
    prompts.push(`还没聊到的维度：${context.uncoveredDimension}。如果对话自然地往那边走了，可以稍微引导一下；但别硬转话题。`);
  }

  // 重入策略
  if (context?.reentryStrategy === 'contextual_awakening' && context.reentryContext) {
    prompts.push(`上次对话刚好聊到了"${context.reentryContext}"——这是用户的断点，可以从这里自然接上。`);
  }

  const chat = genAI.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: prompts.join('\n\n'),
      maxOutputTokens: 256,
    },
    history: history.slice(0, -1).map(h => ({
      role: h.role,
      parts: h.parts,
    })) as any,
  });

  const lastMessage = history[history.length - 1].parts[0].text;
  const result = await chat.sendMessage({ message: lastMessage });
  return result.text || '镜中的倒影有些模糊...';
}

/** 休闲对话模式（碎片记录等场景） */
export async function chatCasual(
  history: { role: "user" | "model"; content: string }[],
  profileSummary?: string
): Promise<string> {
  const prompts = [CASUAL_PROMPT];

  if (profileSummary && profileSummary !== '画像尚未建立。') {
    prompts.push(`关于跟你聊天的这个人，你知道这些（不要主动提起这些信息，但可以用来理解对方说的事）：
${profileSummary}`);
  }

  // 信息充分性检测指令
  prompts.push(`每次回复之前，先判断用户提供的信息是否充分：
- 信息充分：事件描述具体（能想象出一个场景），时间点清楚，用户画像至少有1-2个特质关键词
- 信息不足：事件太模糊（如"换工作"没有上下文），时间点含糊（如"以前"），用户画像几乎为空
信息不足时，自然地问一句补充问题，不要一次问多个。信息充分时，正常回应就好。`);

  const chatHistory = history.slice(0, -1).map(h => ({
    role: h.role as "user" | "model",
    parts: [{ text: h.content }],
  }));

  const chat = genAI.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: prompts.join('\n\n'),
      maxOutputTokens: 256,
    },
    history: chatHistory,
  });

  const lastMsg = history[history.length - 1].content;
  const result = await chat.sendMessage({ message: lastMsg });
  return result.text || '境中的倒影有些模糊...';
}

/** AI 快速画像分析（5个苏格拉底式问答后） */
export async function buildQuickProfile(
  qaPairs: { question: string; answer: string }[]
): Promise<{ keywords: string[]; impression: string }> {
  const prompt = `你是一位专业的心理画像分析师。根据以下5个问答，构建用户的初步人格画像。

${qaPairs.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`).join('\n\n')}

请用JSON格式返回（只返回JSON，不要其他内容）：
{
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "impression": "一句话概括这个人的核心特质（30-50字，中文）"
}

关键词要求：每个2-4个中文字，反映用户的核心性格特质，如：成长优先、内向社交、行动犹豫、深度思考、情感丰富、理性克制、追求自由、稳定至上、成就驱动、直觉驱动、风险规避、热爱挑战、独立自主、关系依赖、务实主义、情感回避、自省能力强等。`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = (response.text || '').trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        keywords: Array.isArray(parsed.keywords)
          ? parsed.keywords.filter((k: any) => typeof k === 'string' && k.length > 0)
          : [],
        impression: typeof parsed.impression === 'string' ? parsed.impression : '镜中的倒影还有些模糊。',
      };
    }

    // JSON 解析失败，回退到行提取
    return {
      keywords: text.split('\n').filter(l => l.trim()).filter(l => l.length >= 2 && l.length <= 6 && !l.includes(' ') && !l.includes('：')).slice(0, 5),
      impression: '镜中看见了一个独特的灵魂——但还需要更多对话来确认。',
    };
  } catch (e) {
    console.error('buildQuickProfile failed:', e);
    return { keywords: [], impression: '' };
  }
}

/** 从对话历史中提取特质关键词（AI 分析） */
export async function extractTraits(
  history: { role: string; content: string }[]
): Promise<string[]> {
  const prompt = `分析以下对话记录，提取出用户的核心性格特质关键词（中文，2-4个字）。
对话：
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

只返回关键词，用逗号分隔，不要包含其他解释。
例如：成长优先,内向社交,行动犹豫`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const text = (response.text || '').split(/[，,]/).map(t => t.trim()).filter(t => t.length > 0);
    return text;
  } catch (e) {
    console.error('extractTraits failed:', e);
    return [];
  }
}