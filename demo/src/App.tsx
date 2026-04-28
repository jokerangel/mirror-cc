import { useState, useRef, useEffect } from 'react';
import { ParticleBackground, ParticleHandle } from './components/ParticleBackground';
import { EntryAnimation } from './components/EntryAnimation';
import { DiscoverySection } from './components/DiscoverySection';
import { RecordsSection } from './components/RecordsSection';
import { WorldlineSection } from './components/WorldlineSection';
import { DeductionSection } from './components/DeductionSection';
import { StoredNode } from './services/nodeStorageService';
import { MessageSquare, FileText, Calendar, Globe } from 'lucide-react';

type Chapter = 'discovery' | 'records' | 'deduction' | 'world' | 'injection';

const CHAPTERS: { id: Chapter; title: string; subtitle: string }[] = [
  { id: 'discovery', title: '自我探索', subtitle: '和镜子里的自己聊聊天' },
  { id: 'records', title: '碎片记录', subtitle: '记录人生关键时刻' },
  { id: 'deduction', title: '平行推演', subtitle: '探索另一种可能' },
  { id: 'world', title: '世界线', subtitle: '时间线上的轨迹' },
  { id: 'injection', title: '记忆注入', subtitle: '你在别处的痕迹' },
];

export default function App() {
  const [showEntry, setShowEntry] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter>('discovery');
  const [showMenu, setShowMenu] = useState(false);
  const [progress] = useState(40);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | undefined>();
  const particleRef = useRef<ParticleHandle>(null);

  const currentIdx = CHAPTERS.findIndex(c => c.id === activeChapter);

  // 启动粒子动画
  useEffect(() => {
    if (!showEntry && particleRef.current) {
      particleRef.current.morphTo(activeChapter);
    }
  }, [showEntry, activeChapter]);

  // 处理章节切换，支持传入保存的节点
  const handleChapterChange = (chapter: string, savedNode?: StoredNode) => {
    setActiveChapter(chapter as Chapter);
    if (savedNode) {
      setHighlightedNodeId(savedNode.id);
    }
  };

  if (showEntry) {
    return (
      <>
        <ParticleBackground ref={particleRef} />
        <EntryAnimation onComplete={() => setShowEntry(false)} />
      </>
    );
  }

  const navigate = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next'
      ? (currentIdx + 1) % CHAPTERS.length
      : (currentIdx - 1 + CHAPTERS.length) % CHAPTERS.length;
    setActiveChapter(CHAPTERS[nextIdx].id);
  };

  const renderContent = () => {
    switch (activeChapter) {
      case 'discovery':
        return (
          <div style={{
            width: '100%',
            height: 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px'
          }}>
            <div style={{ width: '100%', maxWidth: '1200px', height: '100%' }}>
              <DiscoverySection progress={progress} particleRef={particleRef} />
            </div>
          </div>
        );
      case 'records':
        return (
          <div style={{
            width: '100%',
            height: 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px'
          }}>
            <div style={{ width: '100%', maxWidth: '1200px', height: '100%' }}>
              <RecordsSection onChapterChange={(chapter) => setActiveChapter(chapter)} particleRef={particleRef} />
            </div>
          </div>
        );
      case 'deduction':
        return (
          <div style={{
            width: '100%',
            height: 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px'
          }}>
            <div style={{ width: '100%', maxWidth: '1200px', height: '100%' }}>
              <DeductionSection
                onChapterChange={handleChapterChange}
                particleRef={particleRef}
              />
            </div>
          </div>
        );
      case 'world':
        return (
          <div style={{
            width: '100%',
            height: 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <WorldlineSection progress={progress} particleRef={particleRef} highlightedNodeId={highlightedNodeId} />
          </div>
        );
      case 'injection':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden px-4 md:px-8">
            <div className="text-center mb-5">
              <div className="text-[10px] tracking-[0.3em] text-mirror-gold mb-2 font-bold uppercase">
                数据同步
              </div>
              <h1 className="text-xl md:text-2xl font-serif italic text-white mb-2">
                记忆注入
              </h1>
              <p className="text-white/40 max-w-md mx-auto text-xs leading-relaxed">
                同步其他平台的对话、日志与日历，更全面地拼凑你的灵魂图景
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-2xl w-full mb-4">
              <button className="group relative p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-gold/30 transition-all text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-gold mb-3">
                    <MessageSquare size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-display text-white mb-1.5">AI聊天记录</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed mb-2">
                    导入ChatGPT、Claude对话
                  </p>
                  <div className="text-[10px] text-white/30">
                    JSON / TXT
                  </div>
                </div>
              </button>

              <button className="group relative p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-accent/30 transition-all text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-accent mb-3">
                    <FileText size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-display text-white mb-1.5">个人笔记</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed mb-2">
                    导入Notion、Obsidian笔记
                  </p>
                  <div className="text-[10px] text-white/30">
                    Markdown / HTML
                  </div>
                </div>
              </button>

              <button className="group relative p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-gold/30 transition-all text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-gold mb-3">
                    <Calendar size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-display text-white mb-1.5">日历事件</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed mb-2">
                    同步Google、Apple日历
                  </p>
                  <div className="text-[10px] text-white/30">
                    自动识别重要事件
                  </div>
                </div>
              </button>

              <button className="group relative p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-accent/30 transition-all text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-accent mb-3">
                    <Globe size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-display text-white mb-1.5">社交动态</h3>
                  <p className="text-white/50 text-[11px] leading-relaxed mb-2">
                    导入微博、朋友圈数据
                  </p>
                  <div className="text-[10px] text-white/30">
                    本地处理，隐私安全
                  </div>
                </div>
              </button>
            </div>

            <p className="text-[10px] text-white/25">所有数据将经过端对端加密</p>
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      <ParticleBackground ref={particleRef} />

      {/* Top Navigation */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '64px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40, background: 'linear-gradient(to bottom, rgba(10,10,10,0.4), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setShowMenu(true)} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '20px' }}>
            ☰
          </button>
          <span style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: '20px', letterSpacing: '0.2em', color: '#e8d5b7' }}>MIRROR</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            👤
          </div>
        </div>
      </header>

      {/* Navigation Arrows */}
      <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <button onClick={() => navigate('prev')} style={{ padding: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '24px' }}>
          ←
        </button>
      </div>
      <div style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
        <button onClick={() => navigate('next')} style={{ padding: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '24px' }}>
          →
        </button>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '80px', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40, background: 'linear-gradient(to top, rgba(10,10,10,0.4), transparent)' }}>
        <nav style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChapter(c.id)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: activeChapter === c.id ? '#d4a574' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.3s'
              }}
            >
              {c.title}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="24" cy="24" r="21" fill="none" stroke="#d4a574" strokeWidth="1.5" strokeDasharray={132} strokeDashoffset={132 - (132 * progress) / 100} />
            </svg>
            <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: '#d4a574' }}>{progress}%</span>
          </div>
        </div>
      </footer>

      {/* Menu Overlay */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,10,0.98)' }}
        >
          <button onClick={() => setShowMenu(false)} style={{ position: 'absolute', top: '24px', right: '24px', padding: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '24px' }}>
            ✕
          </button>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} onClick={e => e.stopPropagation()}>
            {CHAPTERS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => { setActiveChapter(c.id); setShowMenu(false); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '28px',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#d4a574'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', marginRight: '16px' }}>0{idx + 1}</span>
                {c.title}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}