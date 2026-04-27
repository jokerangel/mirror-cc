import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a0a',
      color: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>镜中 Mirror</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px', color: '#888' }}>测试页面</p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          background: '#d4a574',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        点击次数: {count}
      </button>
    </div>
  );
}