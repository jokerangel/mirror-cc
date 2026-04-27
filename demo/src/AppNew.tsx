import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ParticleBackground, ParticleHandle } from './components/ParticleBackground';
import { EntryAnimation } from './components/EntryAnimation';
import { cn } from './lib/utils';

import { DiscoverySection } from './components/DiscoverySection';
import { RecordsSection } from './components/RecordsSection';
import { DeductionSection } from './components/DeductionSection';
import { WorldlineSection } from './components/WorldlineSection';

type Chapter = 'discovery' | 'records' | 'deduction' | 'world' | 'injection';

const CHAPTERS: { id: Chapter; title: string; subtitle: string; index: string }[] = [
  { id: 'discovery', title: '自我探索', subtitle: '和镜子里的自己聊聊天', index: '01' },
  { id: 'records', title: '碎片记录', subtitle: '记录人生关键时刻', index: '02' },
  { id: 'deduction', title: '平行推演', subtitle: '探索另一种可能', index: '03' },
  { id: 'world', title: '世界线', subtitle: '时间线上的轨迹', index: '04' },
  { id: 'injection', title: '记忆注入', subtitle: '你在别处的痕迹', index: '05' },
];

export default function App() {
  const [showEntry, setShowEntry] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter>('discovery');
  const [showMenu, setShowMenu] = useState(false);
  const [progress] = useState(40);
  const particleRef = useRef<ParticleHandle>(null);

  const currentIdx = CHAPTERS.findIndex(c => c.id === activeChapter);

  useEffect(() => {
    if (!showEntry && particleRef.current) {
      particleRef.current.morphTo(activeChapter);
    }
  }, [activeChapter, showEntry]);

  const navigate = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next'
      ? (currentIdx + 1) % CHAPTERS.length
      : (currentIdx - 1 + CHAPTERS.length) % CHAPTERS.length;
    setActiveChapter(CHAPTERS[nextIdx].id);
  };

  if (showEntry) {
    return (
      <>
        <ParticleBackground ref={particleRef} />
        <EntryAnimation onComplete={() => setShowEntry(false)} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col">
      <ParticleBackground ref={particleRef} />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 md:h-20 px-6 md:px-12 flex items-center justify-between z-40 bg-gradient-to-b from-mirror-deep/40 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-4 md:gap-10">
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
          >
            <Menu size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="font-serif italic text-xl md:text-2xl tracking-[0.2em] text-mirror-accent/80">MIRROR</span>
            <span className="hidden sm:block text-[8px] md:text-[10px] text-white/20 tracking-[0.3em] uppercase ml-2 md:ml-4 pt-1 border-l border-white/10 pl-4 md:pl-6">
              {CHAPTERS[currentIdx].title} · . {CHAPTERS[currentIdx].index}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4 md:gap-6 border-l border-white/10 pl-4 md:pl-8">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-[10px] md:text-[11px] text-white/60 font-serif overflow-hidden bg-white/5 group cursor-pointer hover:border-white/50 transition-colors">
              <User size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" />
            </div>
            <Settings size={18} className="md:w-5 md:h-5 text-white/20 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </header>

      {/* Navigation Arrows */}
      <div className="fixed inset-y-0 left-0 w-16 md:w-32 flex items-center justify-center z-30 group">
        <button
          onClick={() => navigate('prev')}
          className="p-3 md:p-6 rounded-full bg-white/0 hover:bg-white/5 text-white/0 group-hover:text-white/30 transition-all duration-700"
        >
          <ChevronLeft size={32} className="md:w-12 md:h-12" strokeWidth={1} />
        </button>
      </div>
      <div className="fixed inset-y-0 right-0 w-16 md:w-32 flex items-center justify-center z-30 group">
        <button
          onClick={() => navigate('next')}
          className="p-3 md:p-6 rounded-full bg-white/0 hover:bg-white/5 text-white/0 group-hover:text-white/30 transition-all duration-700"
        >
          <ChevronRight size={32} className="md:w-12 md:h-12" strokeWidth={1} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 pt-16 md:pt-24 pb-4 md:pb-16 px-6 md:px-12 lg:px-32 max-w-[1400px] mx-auto w-full flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeChapter}
            initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full flex flex-col"
          >
            {activeChapter === 'discovery' && (
              <DiscoverySection progress={progress} particleRef={particleRef} />
            )}
            {activeChapter === 'records' && (
              <RecordsSection onChapterChange={setActiveChapter} particleRef={particleRef} />
            )}
            {activeChapter === 'world' && (
              <WorldlineSection progress={progress} particleRef={particleRef} />
            )}
            {activeChapter === 'deduction' && (
              <DeductionSection particleRef={particleRef} />
            )}
            {activeChapter === 'injection' && (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-2xl w-full glass-panel rounded-3xl p-16 text-center">
                  <h2 className="text-3xl font-serif italic text-white mb-6">记忆注入</h2>
                  <p className="text-white/40 leading-relaxed mb-12">
                    通过导入你在其他平台的对话、日志与日历，让我们能够更全面地拼凑出你的灵魂图景。
                  </p>
                  <p className="text-white/20 text-sm">即将上线...</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 px-12 flex items-center justify-between z-40 bg-gradient-to-t from-mirror-deep/40 to-transparent">
        <nav className="flex gap-12 items-center">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChapter(c.id)}
              className={cn(
                "text-[10px] uppercase tracking-[0.3em] font-medium transition-all duration-500 relative py-2 group",
                activeChapter === c.id ? "text-mirror-gold" : "text-white/20 hover:text-white/50"
              )}
            >
              {c.title}
              {activeChapter === c.id && (
                <motion.div
                  layoutId="footer-active"
                  className="absolute bottom-0 left-0 right-0 h-px bg-mirror-gold shadow-[0_0_10px_rgba(212,165,116,0.6)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-10">
          <div className="flex items-center gap-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="24" cy="24" r="21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-white/5"
                />
                <motion.circle
                  cx="24" cy="24" r="21"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray={132}
                  animate={{ strokeDashoffset: 132 - (132 * progress) / 100 }}
                  className="text-mirror-gold"
                />
              </svg>
              <span className="absolute text-[9px] font-bold text-mirror-gold">{progress}%</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] uppercase tracking-widest text-white/30">探测进度</span>
              <span className="text-[10px] text-white/60 font-medium">画像构建中...</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-mirror-deep/98 backdrop-blur-3xl px-12 py-10 flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif italic text-2xl tracking-[0.4em] text-mirror-accent/40">EXPLORE</span>
              <button onClick={() => setShowMenu(false)} className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X size={32} strokeWidth={1} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center space-y-12 pl-20">
              {CHAPTERS.map((c, idx) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    setActiveChapter(c.id);
                    setShowMenu(false);
                  }}
                  className="group flex items-end gap-10 text-left"
                >
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif italic text-mirror-gold opacity-10 group-hover:opacity-40 transition-opacity mb-2">. {c.index}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-light text-white/90 group-hover:text-mirror-gold transition-all duration-500 tracking-tight leading-none">
                      {c.title}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/20 mt-4 group-hover:text-white/40 transition-colors">
                      {c.subtitle}
                    </span>
                  </div>
                </motion.button>
              ))}
            </nav>

            <div className="mt-auto pt-12 border-t border-white/5 flex justify-between items-end">
              <div className="flex gap-16">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-white/20 mb-3 block">Connection</label>
                  <span className="text-sm font-medium text-mirror-gold">Encrypted Node 0426</span>
                </div>
              </div>
              <div className="flex gap-8">
                <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">数据隐私</button>
                <button className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-colors">关于项目</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}