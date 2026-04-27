import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Send, History, ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParticleHandle } from './ParticleBackground';

interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  hasImage?: boolean;
}

interface RecordsSectionProps {
  onChapterChange?: (chapter: any) => void;
  particleRef: React.RefObject<ParticleHandle | null>;
}

// 本地预设回复
const getLocalResponse = (_userText: string): string => {
  const responses = [
    "这段记忆很珍贵。它让你想起了什么？",
    "我能感受到其中的情感。那个时刻对你意味着什么？",
    "星尘之中，我看见了这一刻的轮廓。还有更多细节吗？",
    "这是一个重要的瞬间。那时的心情是怎样的？",
    "记忆正在汇聚成星河。然后呢？",
    "我感受到了这其中有故事。能多说一些吗？",
    "这个片段很独特。它如何影响了你？",
    "时间在碎片中凝固。那一刻你最想记住什么？",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const RecordsSection: React.FC<RecordsSectionProps> = ({ onChapterChange, particleRef }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'ai', text: '"我是mirror，既然你来到了这里，说明有些记忆值得被永久留存。你想记录什么？"' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (particleRef?.current) {
      particleRef.current.morphTo('records');
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        particleRef.current?.morphToImage(url);
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: '[上传了一张图像]' }]);

        setTimeout(() => {
          const aiMsg: Message = {
            id: Date.now().toString(),
            type: 'ai',
            text: '这张画面里藏着怎样的故事？'
          };
          setMessages(prev => [...prev, aiMsg]);
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    const userMsg: Message = { id: Date.now().toString(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // 模拟思考延迟
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now().toString(),
        type: 'ai',
        text: getLocalResponse(text)
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600 + Math.random() * 400);
  };

  const handleSave = () => {
    if (isSaving) return;

    setIsSaving(true);
    particleRef.current?.morphTo('aggregate');

    setTimeout(() => {
      onChapterChange?.('world');
    }, 1500);
  };

  return (
    <div className="relative w-full h-full flex flex-col pointer-events-none select-none">
      {/* Top Header Placeholder */}
      <div className="shrink-0 flex justify-between items-center py-6 px-4 pt-4 z-50 pointer-events-auto">
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-full glass-panel border-white/5 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-mirror-gold shadow-[0_0_8px_rgba(212,165,116,0.6)]" />
             <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">碎片模式</span>
          </div>
        </div>

        <button
          onClick={() => onChapterChange?.('world')}
          className="group flex items-center gap-3 px-6 py-2.5 rounded-full glass-panel border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white transition-all shadow-lg"
        >
          <History size={14} className="group-hover:rotate-[-45deg] transition-transform" />
          查看记录 <span className="opacity-20 ml-1">08</span>
        </button>
      </div>

      {/* Main Dialogue Scroll Area */}
      <div className="flex-1 relative min-h-0 pointer-events-auto px-4 md:px-6 overflow-hidden">
        <div
          ref={scrollRef}
          className="w-full max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 overflow-y-auto no-scrollbar scroll-smooth h-full p-4 md:p-8 pb-4"
        >
          <div className="flex-1" />
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  "flex flex-col relative",
                  msg.type === 'user' ? "items-end" : "items-start"
                )}
              >
                {msg.type === 'ai' && (
                  <div className="mb-2 ml-4 text-[10px] md:text-[11px] font-medium tracking-wide text-white/30">星尘</div>
                )}
                <div className={cn(
                  "max-w-[90%] md:max-w-[80%] px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-[2rem] text-base md:text-lg leading-relaxed relative backdrop-blur-2xl shadow-2xl transition-all border",
                  msg.type === 'ai'
                    ? "bg-[#0A0A0A]/60 text-white/90 border-white/10 font-serif"
                    : "text-white font-medium bg-[#6A63F6]/20 border-[#6A63F6]/30"
                )}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Top Fade Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-mirror-deep to-transparent pointer-events-none z-10" />
      </div>

      {/* 固定在底部的输入区域 */}
      <div className="shrink-0 pb-8 md:pb-12 pt-6 pointer-events-auto z-50 bg-gradient-to-t from-mirror-deep via-mirror-deep/98 to-transparent">
         <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 relative z-10 px-4 md:px-6">
            {/* Input Container */}
            <div className="flex-1 glass-panel rounded-2xl md:rounded-[1.5rem] border-white/10 p-1.5 md:p-2 pl-3 md:pl-4 flex items-center gap-2 md:gap-3 shadow-[0_-10px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="这些记忆正在汇聚..."
                className="flex-1 bg-transparent py-2.5 md:py-3 px-1 md:px-2 text-white placeholder:text-white/40 outline-none font-medium text-sm md:text-[15px] tracking-wide"
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              <div className="flex items-center gap-1 md:gap-2">
                {/* Minimal Mic Button inside Input */}
                <button
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isRecording
                        ? "bg-red-500/20 text-red-500 border border-red-500/30 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        : "text-white/40 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic size={18} className="md:w-5 md:h-5" />
                </button>

                {/* Image Upload Button */}
                <button
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 text-white/40 hover:text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={18} className="md:w-5 md:h-5" />
                </button>

                {/* Send Button */}
                <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSendMessage();
                    }}
                    disabled={!inputValue.trim()}
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1rem] flex items-center justify-center transition-all",
                      inputValue.trim()
                        ? "bg-[#6A63F6] text-white hover:bg-[#7b75f8] shadow-[0_0_20px_rgba(106,99,246,0.4)] active:scale-95"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    )}
                >
                  <Send size={16} className={inputValue.trim() ? "translate-x-[1px] md:translate-x-[2px] transition-transform" : "md:w-[18px] md:h-[18px]"} />
                </button>
              </div>
            </div>

            {/* Save Memory Button placed alongside input */}
            <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isSaving}
                className={cn(
                  "px-6 h-14 md:h-[64px] rounded-2xl md:rounded-[1.5rem] border border-[rgba(106,99,246,0.3)] hover:border-[rgba(106,99,246,0.8)] bg-black/40 hover:bg-[#6A63F6]/20 text-[#a39df8] hover:text-white text-sm font-medium transition-all shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex items-center justify-center gap-2 group whitespace-nowrap",
                  isSaving && "opacity-50 cursor-wait"
                )}
              >
                {isSaving ? "存档中..." : "保存记忆"}
                <Sparkles size={16} className="text-[#a39df8]/50 group-hover:text-white transition-colors" />
            </button>
         </div>

         <div className="hidden md:flex mt-6 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 select-none items-center gap-4">
           PRESS ENTER TO SEND
         </div>

      </div>


      {/* Background Dust/Environment Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};