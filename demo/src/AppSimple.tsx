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
      color: '#fafafa',
      padding: '80px 40px'
    }}>
      <ParticleBackground ref={particleRef} />
      <h1 style={{ fontSize: '32px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>自我探索</h1>
      <p style={{ color: '#888', marginBottom: '40px', position: 'relative', zIndex: 1 }}>和镜子里的自己聊聊天</p>
    </div>
  );
}