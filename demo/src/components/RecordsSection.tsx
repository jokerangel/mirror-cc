import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Upload, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParticleHandle } from './ParticleBackground';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface RecordsSectionProps {
  onChapterChange?: (chapter: any) => void;
  particleRef: React.RefObject<ParticleHandle | null>;
}

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
    { id: '1', role: 'ai', text: '我是mirror，既然你来到了这里，说明有些记忆值得被永久留存。你想记录什么？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMainCenter = useCallback(() => {
    const el = document.getElementById('records-main-area');
    if (el) {
      const rect = el.getBoundingClientRect();
      return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2, panelWidth: rect.width * 0.9, panelHeight: rect.height * 0.85 };
    }
    const leftPanel = document.getElementById('records-left-panel');
    if (leftPanel) {
      const rect = leftPanel.getBoundingClientRect();
      return { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2, panelWidth: rect.width * 0.85, panelHeight: rect.height * 0.7 };
    }
    return { centerX: window.innerWidth * 0.25, centerY: window.innerHeight * 0.5, panelWidth: window.innerWidth * 0.4, panelHeight: window.innerHeight * 0.6 };
  }, []);

  // 粒子位置自适应
  const updateParticlePosition = useCallback(() => {
    if (!particleRef?.current) return;
    const { centerX, centerY } = getMainCenter();
    particleRef.current.morphTo('records', { centerX, centerY });
  }, [particleRef, getMainCenter]);

  useEffect(() => {
    updateParticlePosition();
    window.addEventListener('resize', updateParticlePosition);
    return () => window.removeEventListener('resize', updateParticlePosition);
  }, [updateParticlePosition]);

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
        setHasUploadedImage(true);
        setUploadedImages(prev => {
          const next = [...prev, url];
          setActiveImageIndex(next.length - 1);
          return next;
        });
        const { centerX, centerY, panelWidth, panelHeight } = getMainCenter();
        particleRef.current?.morphToImage(url, { centerX, centerY, panelWidth, panelHeight });
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: '[上传了一张图像]' }]);
        setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: '这张画面里藏着怎样的故事？' }]);
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: getLocalResponse(text) }]);
    }, 600 + Math.random() * 400);
  };

  const handleSwitchImage = (index: number) => {
    if (index === activeImageIndex) return;
    setActiveImageIndex(index);
    const url = uploadedImages[index];
    const { centerX, centerY, panelWidth, panelHeight } = getMainCenter();
    // Smooth morph without scatter animation
    particleRef.current?.morphToImage(url, { centerX, centerY, panelWidth, panelHeight, animate: false });
  };

  const handleDeleteImage = () => {
    if (uploadedImages.length === 0) return;
    const nextImages = uploadedImages.filter((_, i) => i !== activeImageIndex);
    setUploadedImages(nextImages);

    if (nextImages.length === 0) {
      setHasUploadedImage(false);
      setActiveImageIndex(0);
      updateParticlePosition();
    } else {
      const newIdx = Math.min(activeImageIndex, nextImages.length - 1);
      setActiveImageIndex(newIdx);
      const { centerX, centerY, panelWidth, panelHeight } = getMainCenter();
      particleRef.current?.morphToImage(nextImages[newIdx], { centerX, centerY, panelWidth, panelHeight, animate: false });
    }
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);
    particleRef.current?.morphTo('aggregate');
    setTimeout(() => { onChapterChange?.('world'); }, 1500);
  };

  const prevIndex = uploadedImages.length >= 2
    ? (activeImageIndex - 1 + uploadedImages.length) % uploadedImages.length
    : -1;
  const nextIndex = uploadedImages.length >= 2
    ? (activeImageIndex + 1) % uploadedImages.length
    : -1;
  const showLeftThumb = uploadedImages.length >= 2;
  const showRightThumb = uploadedImages.length >= 3;

  return (
    <div className="relative w-full h-full flex pointer-events-none select-none">
      {/* 左侧：粒子图像区域 */}
      <div id="records-left-panel" className="w-1/2 h-full flex items-center justify-center relative z-10 px-6">
        {/* 顶部标签 */}
        <div className="absolute top-6 left-6 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mirror-gold shadow-[0_0_8px_rgba(212,165,116,0.6)] animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-white/50">碎片模式</span>
          </div>
        </div>

        {/* 未上传：居中上传按钮 */}
        {!hasUploadedImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group text-center pointer-events-auto flex flex-col items-center"
          >
            <div className="w-20 h-20 mx-auto mb-5 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] group-hover:border-mirror-gold/30 group-hover:bg-mirror-gold/5 transition-all">
              <Upload size={28} className="text-white/30 group-hover:text-mirror-gold transition-colors" />
            </div>
            <div className="text-white/60 text-sm font-serif italic group-hover:text-white/80 transition-colors">
              上传你的记忆碎片
            </div>
            <div className="text-white/20 text-[10px] mt-2 group-hover:text-white/30 transition-colors">
              支持图片上传
            </div>
          </button>
        )}

        {/* 已上传：轮播布局 */}
        {hasUploadedImage && (
          <div className="flex items-center gap-2 w-full h-[80vh] max-h-[700px]">
            {/* 左侧缩略图 */}
            {showLeftThumb && prevIndex >= 0 ? (
              <button
                onClick={() => handleSwitchImage(prevIndex)}
                className="pointer-events-auto shrink-0 w-[5%] h-[22%] rounded-lg overflow-hidden border border-white/5 opacity-20 hover:opacity-45 hover:border-white/10 transition-all duration-500"
              >
                <img
                  src={uploadedImages[prevIndex]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="shrink-0 w-[10%]" />
            )}

            {/* 中间主展示区 */}
            <div id="records-main-area" className="relative flex-1 min-w-0 h-full">
              {/* 删除按钮 */}
              <button
                onClick={handleDeleteImage}
                className="absolute top-3 right-3 pointer-events-auto z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/20 hover:border-red-400/40 transition-all"
              >
                <X size={16} />
              </button>
              {/* 左箭头 */}
              {uploadedImages.length >= 2 && (
                <button
                  onClick={() => handleSwitchImage(prevIndex)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-auto z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              {/* 右箭头 */}
              {uploadedImages.length >= 2 && (
                <button
                  onClick={() => handleSwitchImage(nextIndex)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-auto z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* 右侧缩略图 */}
            {showRightThumb && nextIndex >= 0 ? (
              <button
                onClick={() => handleSwitchImage(nextIndex)}
                className="pointer-events-auto shrink-0 w-[5%] h-[22%] rounded-lg overflow-hidden border border-white/5 opacity-20 hover:opacity-45 hover:border-white/10 transition-all duration-500"
              >
                <img
                  src={uploadedImages[nextIndex]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="shrink-0 w-[10%]" />
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {/* 底部上传按钮 + 计数 */}
        {hasUploadedImage && (
          <div className="absolute bottom-6 left-6 right-6 pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/50 hover:text-mirror-gold hover:border-mirror-gold/30 transition-all"
            >
              <Upload size={12} className="group-hover:scale-110 transition-transform" />
              继续上传记忆碎片
            </button>
            {uploadedImages.length >= 2 && (
              <div className="px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 text-[11px] text-white/40 font-medium tabular-nums">
                {activeImageIndex + 1} / {uploadedImages.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 右侧：对话区域 */}
      <div className="w-1/2 h-full flex flex-col">
        <div className="flex-1 relative min-h-0 pointer-events-auto overflow-hidden">
          <div
            ref={scrollRef}
            className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth px-6 md:px-10 pt-6 md:pt-10 pb-4 space-y-8 md:space-y-12"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-mirror-deep to-transparent pointer-events-none z-10" />
        </div>

        <div className="shrink-0 px-6 md:px-10 pb-6 md:pb-10 pt-4 pointer-events-auto">
          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="这些记忆正在汇聚..."
              className="w-full bg-white/[0.05] border border-white/5 rounded-xl md:rounded-2xl px-6 md:px-10 py-4 md:py-5 outline-none focus:border-mirror-gold/30 focus:bg-white/[0.08] transition-all text-xs md:text-sm text-white placeholder:text-white/10 pr-14 shadow-2xl"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-30 text-mirror-gold/60 hover:text-mirror-gold"
            >
              <Send size={18} />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "mt-3 w-full py-2.5 rounded-xl border border-mirror-gold/20 bg-mirror-gold/5 hover:bg-mirror-gold/10 hover:border-mirror-gold/30 text-mirror-gold/70 hover:text-mirror-gold text-xs font-medium transition-all flex items-center justify-center gap-2",
              isSaving && "opacity-50 cursor-wait"
            )}
          >
            <Sparkles size={12} />
            {isSaving ? "存档中..." : "保存记忆"}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};