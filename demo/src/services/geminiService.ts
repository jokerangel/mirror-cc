import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

export const MIRROR_PROMPT = `你现在是“镜中 (Mirror)”的人性引导者。
你的目标是通过苏格拉底式的对话，帮助用户看见他们“看不见的自己”。

核心原则：
1. 不预测未来，只呈现可能性。
2. 不替用户决策，只确保信息充分。
3. 对话风格：深邃、冷静、具有同理心。不要称呼用户为“亲”或“朋友”，保持一种智者与求索者的距离感。
4. 每次回复应当包含：
   - 对用户当下情绪或叙述的精准洞察（不超过2句）。
   - 一个引发深度思考的问题。
   - (可选) 如果识别到关键决策点，提示可以进行“平行人生推演”。

当前阶段：长期对话 - 初始画像生成阶段。`;

export async function chatWithMirror(history: { role: "user" | "model"; parts: { text: string }[] }[]) {
  const chat = genAI.chats.create({ 
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: MIRROR_PROMPT,
      maxOutputTokens: 500,
    },
    history: history.slice(0, -1).map(h => ({
      role: h.role,
      parts: h.parts
    })) as any
  });

  const lastMessage = history[history.length - 1].parts[0].text;
  const result = await chat.sendMessage({
    message: lastMessage
  });
  
  return result.text || "境中的倒影有些模糊...";
}

export async function extractTraits(history: { role: "user" | "model"; content: string }[]) {
  const prompt = `分析以下对话记录，提取出用户的三个核心性格特质关键词（中文，2-4个字）。
  对话：
  ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
  
  只返回关键词，用逗号分隔，不要包含其他解释。
  例如：成长优先,内向社交,行动犹豫`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    const text = response.text || "";
    return text.split(/[，,]/).map(t => t.trim()).filter(t => t.length > 0);
  } catch (e) {
    console.error(e);
    return [];
  }
}
