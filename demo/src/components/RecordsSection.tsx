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
      // 将粒子定位到左侧区域中心
      const centerX = window.innerWidth * 0.25; // 左侧区域的中心
      const centerY = window.innerHeight * 0.5;
      particleRef.current.morphTo('records', { centerX, centerY });
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
    <div className="relative w-full h-full flex pointer-events-none select-none">
      {/* 左侧：粒子图像区域 - 透明背景让粒子显示 */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center relative z-10">
        {/* 顶部标签 */}
        <div className="absolute top-6 left-6 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mirror-gold shadow-[0_0_8px_rgba(212,165,116,0.6)] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-white/60">碎片模式</span>
          </div>
        </div>

        {/* 中央提示 */}
        <div className="text-center pointer-events-auto px-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02]">
            <Sparkles size={32} className="text-mirror-gold/60" />
          </div>
          <div className="text-white/30 text-[10px] uppercase tracking-[0.2em] mb-2">
            记忆粒子
          </div>
          <div className="text-white/60 text-sm font-serif italic max-w-xs leading-relaxed">
            你的碎片记忆正在汇聚
          </div>
          <div className="text-white/25 text-xs mt-2">
            等待成形...
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="absolute bottom-6 left-6 pointer-events-auto">
          <button
            onClick={() => onChapterChange?.('world')}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-[10px] uppercase font-bold tracking-widest text-white/50 hover:text-white hover:border-white/30 transition-all"
          >
            <History size={12} className="group-hover:rotate-[-45deg] transition-transform" />
            查看世界线
          </button>
        </div>
      </div>

      {/* 右侧：对话框区域 */}
      <div className="w-1/2 h-full flex flex-col bg-mirror-deep/80 backdrop-blur-sm border-l border-white/10">
        {/* 对话标题 */}
        <div className="shrink-0 px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-mirror-gold/10 flex items-center justify-center">
              <Sparkles size={14} className="text-mirror-gold" />
            </div>
            <div>
              <div className="text-white/90 text-sm font-medium">星尘</div>
              <div className="text-white/40 text-[10px]">记忆收集助手</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/40">在线</span>
          </div>
        </div>

        {/* 对话内容区域 */}
        <div className="flex-1 relative min-h-0 pointer-events-auto overflow-hidden">
          <div
            ref={scrollRef}
            className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-6"
          >
            <div className="flex-1" />
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    "flex flex-col relative mb-4",
                    msg.type === 'user' ? "items-end" : "items-start"
                  )}
                >
                  {msg.type === 'ai' && (
                    <div className="mb-1.5 ml-3 text-[9px] font-medium tracking-wide text-white/30">星尘</div>
                  )}
                  <div className={cn(
                    "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-xl border",
                    msg.type === 'ai'
                      ? "bg-white/[0.03] text-white/90 border-white/10 font-serif rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl"
                      : "text-white font-medium bg-mirror-accent/20 border-mirror-accent/30 rounded-tl-xl rounded-tr-sm rounded-br-xl rounded-bl-xl"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 顶部渐变遮罩 */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-mirror-deep to-transparent pointer-events-none z-10" />
        </div>

        {/* 固定底部输入区域 */}
        <div className="shrink-0 p-4 pointer-events-auto border-t border-white/5 bg-mirror-deep/50">
          <div className="flex flex-col gap-3">
            {/* 输入框 */}
            <div className="flex items-center gap-2 glass-panel rounded-xl border-white/10 p-1.5">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="记录你的碎片记忆..."
                className="flex-1 bg-transparent py-2 px-3 text-white text-sm placeholder:text-white/30 outline-none"
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              <div className="flex items-center gap-1">
                <button
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isRecording
                      ? "bg-red-500/20 text-red-400"
                      : "text-white/40 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic size={16} />
                </button>

                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all text-white/40 hover:text-white hover:bg-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    inputValue.trim()
                      ? "bg-mirror-accent text-white"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  )}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "w-full py-2.5 rounded-xl border border-mirror-gold/30 bg-mirror-gold/10 hover:bg-mirror-gold/20 text-mirror-gold text-xs font-medium transition-all flex items-center justify-center gap-2",
                isSaving && "opacity-50 cursor-wait"
              )}
            >
              {isSaving ? "存档中..." : "保存记忆"}
              <Sparkles size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Background Dust/Environment Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};