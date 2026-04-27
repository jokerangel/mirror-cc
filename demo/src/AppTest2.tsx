import { useState, useRef } from 'react';
import { ParticleBackground, ParticleHandle } from './components/ParticleBackground';
import { EntryAnimation } from './components/EntryAnimation';

export default function App() {
  const [showEntry, setShowEntry] = useState(true);
  const particleRef = useRef<ParticleHandle>(null);

  if (showEntry) {
    return (
      <>
        <ParticleBackground ref={particleRef} />
        <EntryAnimation onComplete={() => setShowEntry(false)} />
      </>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      color: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <ParticleBackground ref={particleRef} />
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>自我探索</h1>
        <p style={{ color: '#888' }}>和镜子里的自己聊聊天</p>
        <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          {['自我探索', '碎片记录', '平行推演', '世界线', '记忆注入'].map((item, i) => (
            <button key={i} style={{
              background: 'transparent',
              border: 'none',
              color: i === 0 ? '#d4a574' : 'rgba(255,255,255,0.3)',
              fontSize: '12px',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              textTransform: 'uppercase',
              padding: '8px 16px'
            }}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}