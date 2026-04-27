import { useState, useRef, useEffect } from 'react';
import { ParticleBackground, ParticleHandle } from './components/ParticleBackground';
import { EntryAnimation } from './components/EntryAnimation';
import { DiscoverySection } from './components/DiscoverySection';
import { RecordsSection } from './components/RecordsSection';
import { WorldlineSection } from './components/WorldlineSection';

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
  const particleRef = useRef<ParticleHandle>(null);

  const currentIdx = CHAPTERS.findIndex(c => c.id === activeChapter);

  // 启动粒子动画
  useEffect(() => {
    if (!showEntry && particleRef.current) {
      particleRef.current.morphTo(activeChapter);
    }
  }, [showEntry, activeChapter]);

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
          <div style={{ textAlign: 'center', padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ color: '#e8d5b7', fontSize: '14px', letterSpacing: '0.2em', marginBottom: '8px' }}>PARALLEL REALITY</div>
            <h2 style={{ fontSize: '32px', marginBottom: '12px', color: '#fff', fontFamily: 'serif', fontStyle: 'italic' }}>你想推演哪一种可能？</h2>
            <div style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                color: '#fff',
                cursor: 'pointer',
                minWidth: '220px',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '16px', color: '#e8d5b7' }}>⏮</div>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>如果当初...</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>回溯历史的转折点</div>
              </button>
              <button style={{
                padding: '32px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                color: '#fff',
                cursor: 'pointer',
                minWidth: '220px',
                textAlign: 'left',
                transition: 'all 0.3s'
              }}>
                <div style={{ fontSize: '28px', marginBottom: '16px', color: '#d4a574' }}>🔮</div>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>如果未来...</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>预演未来的轨迹</div>
              </button>
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
            <WorldlineSection progress={progress} particleRef={particleRef} />
          </div>
        );
      case 'injection':
        return (
          <div style={{ textAlign: 'center', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🗄</div>
            <h2 style={{ fontSize: '28px', marginBottom: '12px', color: '#fff', fontFamily: 'serif', fontStyle: 'italic' }}>记忆注入</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '40px', lineHeight: 1.6 }}>
              同步你在其他平台的对话、日志与日历，让我们能更全面地拼凑出你的灵魂图景
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {['AI聊天记录', '个人笔记', '日历事件', '社交动态'].map((item, i) => (
                <button key={i} style={{
                  padding: '32px 24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>{['💬', '📝', '📅', '🌐'][i]}</div>
                  {item}
                </button>
              ))}
            </div>
            <p style={{ marginTop: '32px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>所有数据将经过端对端加密</p>
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