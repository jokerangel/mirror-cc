import { useState, useRef, useEffect } from 'react';
import { DialogueSession } from './DialogueSession';
import { ParticleHandle } from './ParticleBackground';
import { extractTraits } from '../services/geminiService';
import { MessageCircle, Sparkles } from 'lucide-react';

interface DiscoverySectionProps {
  progress: number;
  particleRef: React.RefObject<ParticleHandle | null>;
}

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({ progress, particleRef }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [traits, setTraits] = useState<string[]>(['成长优先', '内向社交', '行动犹豫']);
  const [insight, setInsight] = useState('你是一个在稳定与自由之间反复拉扯的人');
  const personaContainerRef = useRef<HTMLDivElement>(null);

  const updateParticlePosition = () => {
    if (!particleRef.current) return;

    if (!hasStarted) {
      particleRef.current.morphTo('idle');
      return;
    }

    if (personaContainerRef.current) {
      const rect = personaContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      particleRef.current.morphTo('discovery', { centerX, centerY });
    } else {
      particleRef.current.morphTo('discovery');
    }
  };

  const handleDialogueUpdate = async (messages: any[]) => {
    if (messages.length > 3 && messages.length % 2 === 0) {
      const history = messages.map(m => ({ role: m.role as "user" | "model", content: m.content }));
      const newTraits = await extractTraits(history);
      if (newTraits.length > 0) {
        setTraits(newTraits);
        setInsight(`基于"${newTraits.join('、')}"，镜像看见了你的深层核心。`);
      }
    }
  };

  useEffect(() => {
    updateParticlePosition();
    window.addEventListener('resize', updateParticlePosition);
    return () => window.removeEventListener('resize', updateParticlePosition);
  }, [hasStarted, particleRef]);

  if (!hasStarted) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '40px 40px'
      }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#d4a574', marginBottom: '12px', fontWeight: 'bold' }}>
            了解程度 20%
          </div>
          <h1 style={{ fontSize: '30px', fontFamily: 'serif', fontStyle: 'italic', color: '#fff', marginBottom: '10px' }}>
            让我更了解你
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.6, fontSize: '14px' }}>
            每一个回答都是对镜像的一次补完。选择一种方式，开启你的自我探索之旅。
          </p>
        </div>

        {/* 功能卡片 */}
        <div style={{ display: 'flex', gap: '24px', maxWidth: '700px', width: '100%', marginBottom: '32px' }}>
          <button
            onClick={() => setHasStarted(true)}
            className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-mirror-gold/30 transition-all text-left overflow-hidden"
            style={{ flex: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-mirror-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-mirror-gold mb-6">
                <MessageCircle size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-display text-white mb-3">快速对话</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                5-10个问题，快速生成你的画像轮廓。
              </p>
              <div className="text-xs text-white/30">
                约3-5分钟，适合快速了解自己
              </div>
            </div>
          </button>

          <button
            onClick={() => setHasStarted(true)}
            className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-mirror-accent/30 transition-all text-left overflow-hidden"
            style={{ flex: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-mirror-accent mb-6">
                <Sparkles size={36} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-display text-white mb-3">深度探索</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                沉浸式对话，进行深度灵魂画像。
              </p>
              <div className="text-xs text-white/30">
                约10-15分钟，适合完整探索
              </div>
            </div>
          </button>
        </div>

        {/* 导入按钮 */}
        <button style={{
          padding: '14px 28px',
          background: 'rgba(10, 10, 10, 0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '12px',
          letterSpacing: '0.15em',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}>
          导入AI聊天记录
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* 顶部标题栏 */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
        display: 'flex'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: 'rgba(212,165,116,0.1)',
          border: '1px solid rgba(212,165,116,0.2)',
          fontSize: '10px',
          color: '#d4a574'
        }}>
          <span>✨</span> 实时镜像同步
        </div>
        <span style={{ fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
          正在解析你的灵魂图谱
        </span>
      </div>

      {/* 主内容区 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {/* 左侧：画像可视化 - 居中显示 */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
          overflow: 'auto'
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            {/* 粒子区域 */}
            <div ref={personaContainerRef} style={{ width: '100%', height: '280px', position: 'relative', marginBottom: '28px' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>清晰度</span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} style={{
                        width: '8px',
                        height: '4px',
                        borderRadius: '2px',
                        background: i < progress / 10 ? '#d4a574' : 'rgba(212,165,116,0.1)'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: '#d4a574', fontWeight: 'bold' }}>{progress}%</span>
                </div>
              </div>
            </div>

            {/* 洞察卡片 */}
            <div style={{
              padding: '24px',
              background: 'rgba(10,10,10,0.4)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '16px' }}>
                "{insight}"
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {traits.map(kw => (
                  <span key={kw} style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    # {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：对话区域 - 居中显示 */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          minWidth: 0,
          height: '100%'
        }}>
          <div style={{ width: '100%', maxWidth: '560px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 对话内容 */}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
              <DialogueSession onMessage={handleDialogueUpdate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};