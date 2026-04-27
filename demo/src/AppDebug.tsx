import { useState, useRef, useEffect } from 'react';
import { ParticleBackground, ParticleHandle } from './components/ParticleBackground';
import { EntryAnimation } from './components/EntryAnimation';

type Chapter = 'discovery' | 'records' | 'deduction' | 'world' | 'injection';

const CHAPTERS: { id: Chapter; title: string; subtitle: string }[] = [
  { id: 'discovery', title: '自我探索', subtitle: '和镜子里的自己聊聊天' },
  { id: 'records', title: '碎片记录', subtitle: '记录人生关键时刻' },
  { id: 'deduction', title: '平行推演', subtitle: '探索另一种可能' },
  { id: 'world', title: '世界线', subtitle: '时间线上的轨迹' },
  { id: 'injection', title: '记忆注入', subtitle: '你在别处的痕迹' },
];

export default function App() {
  const [showEntry, setShowEntry] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter>('discovery');
  const [showMenu, setShowMenu] = useState(false);
  const [progress] = useState(40);
  const particleRef = useRef<ParticleHandle>(null);

  const currentIdx = CHAPTERS.findIndex(c => c.id === activeChapter);

  // 启动粒子动画
  useEffect(() => {
    if (!showEntry && particleRef.current) {
      particleRef.current.morphTo(activeChapter);
    }
  }, [showEntry, activeChapter]);

  // 进入主界面时启动粒子
  useEffect(() => {
    const timer = setTimeout(() => {
      if (particleRef.current) {
        particleRef.current.morphTo('idle');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      <ParticleBackground ref={particleRef} />

      {/* 跳过动画按钮 */}
      <button
        onClick={() => setShowEntry(true)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 100,
          padding: '8px 16px',
          background: '#d4a574',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        播放动画
      </button>

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
      <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
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
      <main style={{ flex: 1, position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '80px', padding: '80px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontFamily: 'serif', fontStyle: 'italic', color: '#fff', marginBottom: '16px' }}>{CHAPTERS[currentIdx].title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>{CHAPTERS[currentIdx].subtitle}</p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 40, background: 'linear-gradient(to top, rgba(10,10,10,0.4), transparent)' }}>
        <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChapter(c.id)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: activeChapter === c.id ? '#d4a574' : 'rgba(255,255,255,0.2)'
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} onClick={e => e.stopPropagation()}>
            {CHAPTERS.map((c) => (
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
                  cursor: 'pointer'
                }}
              >
                {c.title}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}