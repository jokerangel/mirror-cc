import { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, Layers } from 'lucide-react';
import { chatWithMirror } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface DeductionDialogueProps {
  initialPrompt: string;
}

export const DeductionDialogue: React.FC<DeductionDialogueProps> = ({ initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: `让我们回到 ${initialPrompt}。那个瞬间，选择了另一种可能，一切都开始改变。接下来，你感觉那个“推演的你”在经历什么？` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      history.push({ role: 'user', parts: [{ text: userMsg }] });

      const assistantMsg = await chatWithMirror(history as any);
      setMessages(prev => [...prev, { role: 'model', content: assistantMsg }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: '推演的镜像有些模糊，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full gap-6 p-6">
      {/* Left: Deduction Visualization */}
      <div className="w-1/2 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
            <Layers size={100} className="text-mirror-gold/20 mx-auto mb-6" strokeWidth={0.5} />
            <div className="text-white/20 tracking-[0.5em] uppercase text-xs">生成对应的推演场景</div>
        </div>
      </div>

      {/* Right: Dialogue */}
      <div className="w-1/2 flex flex-col h-full bg-mirror-glass rounded-3xl border border-white/10">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <div className="text-mirror-accent font-serif italic">推演对话</div>
            <button className="text-white/30 hover:text-white transition-colors">
                <BookOpen size={18} />
            </button>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[90%] px-6 py-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-mirror-gold text-mirror-deep" 
                  : "bg-white/[0.05] text-white/80 border border-white/5"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-mirror-gold/40 text-xs animate-pulse">镜像解析中...</div>
          )}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="继续进行推演..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 outline-none focus:border-mirror-gold/30 text-sm text-white placeholder:text-white/10 pr-16"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 text-mirror-gold/60"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
