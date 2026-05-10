import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { chatWithMirror } from '../services/geminiService';
import { getDialogueContext } from '../services/profileService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface DialogueSessionProps {
  onMessage?: (messages: Message[]) => void;
  initialMessage?: string;
}

export const DialogueSession: React.FC<DialogueSessionProps> = ({ onMessage, initialMessage }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialMessage) {
      return [{ role: 'model', content: initialMessage }];
    }
    return [
      { role: 'model', content: '所有的镜子都能照见容颜，但这面镜子想带你看看更深处。' },
      { role: 'model', content: '你最近是否感觉到，生活正处于某个微妙的节点？' },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onMessage) onMessage(messages);
  }, [messages, onMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      // 注入画像上下文
      const context = getDialogueContext();
      const assistantMsg = await chatWithMirror(history as any, context);
      const updatedMessages = [...newMessages, { role: 'model' as const, content: assistantMsg }];
      setMessages(updatedMessages);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: '镜像有些模糊，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full mx-auto w-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 md:pt-10 pb-4 space-y-8 md:space-y-12 no-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex flex-col",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[90%] md:max-w-[85%] px-6 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-3xl text-sm md:text-[15px] leading-relaxed tracking-wide transition-all duration-700",
                msg.role === 'user'
                  ? "bg-mirror-gold text-mirror-deep font-medium shadow-[0_10px_30px_rgba(212,165,116,0.2)]"
                  : "bg-white/[0.03] text-white/70 border-l-[3px] border-mirror-gold/30 font-serif italic text-base md:text-lg"
              )}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-6 md:px-10 text-mirror-gold/40 text-[9px] md:text-[11px] tracking-[0.3em] font-medium uppercase animate-pulse"
          >
            <Sparkles size={12} />
            镜像正在感应中...
          </motion.div>
        )}
      </div>

      <div className="px-6 md:px-10 pb-6 md:pb-10 pt-4 md:pt-6 shrink-0">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入你的困惑或设想..."
            className="w-full bg-white/[0.05] border border-white/5 rounded-xl md:rounded-2xl px-6 md:px-10 py-4 md:py-6 outline-none focus:border-mirror-gold/30 focus:bg-white/[0.08] transition-all text-xs md:text-sm text-white placeholder:text-white/10 pr-16 md:pr-20 shadow-2xl"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-4 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30 text-mirror-gold/60 hover:text-mirror-gold"
          >
            <Send size={18} className="md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};