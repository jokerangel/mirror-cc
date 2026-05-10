import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';
import { ParticleHandle } from './ParticleBackground';
import { DialogueSession } from './DialogueSession';
import {
  SOCRATIC_QUESTIONS,
  SOCRATIC_STYLES,
  COVERAGE_DISPLAY_DIMS,
  BASE_DIMS_DETAIL,
  MIRROR_DIMS_DETAIL,
  getProfile,
  getCompletionPct,
  getCoverageMap,
  getProfileSummary,
  getCoverageSummary,
  getUncoveredDimension,
  canDeduce,
  updateProfileFromKeywords,
  updateCoverage,
  updateStyle,
  extractTraitsFromText,
  generateImpression,
  extractSpeakingStyle,
  setDialogueContext,
  type CoverageMap,
  type DimensionData,
} from '../services/profileService';
import {
  createSession,
  recordMessage,
  endSession,
  getSessionMessages,
  getReentryStrategy,
  extractFragments,
  extractEmotionTags,
} from '../services/memoryService';
import { buildQuickProfile, extractTraits } from '../services/geminiService';

// === 置信度指示器 ===

const ConfidenceIndicator: React.FC<{ confidence: number; covered: boolean }> = ({ confidence, covered }) => {
  if (covered) {
    return <span style={{ color: '#5ee2a0', fontSize: '10px', marginRight: '6px' }} title={`置信度 ${Math.round(confidence * 100)}%`}>●</span>;
  }
  if (confidence > 0 && confidence < 0.6) {
    return <span style={{ color: '#d4a574', fontSize: '10px', marginRight: '6px' }} title={`置信度 ${Math.round(confidence * 100)}%`}>◐</span>;
  }
  return <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px', marginRight: '6px' }}>○</span>;
};

// === 画像维度详情行 ===

const DimensionRow: React.FC<{
  info: { key: string; label: string; part: string; isRequired?: boolean };
  item?: CoverageMap['items'][0];
  contentPreview?: string;
}> = ({ info, item, contentPreview }) => {
  const [expanded, setExpanded] = useState(false);
  const covered = item?.covered ?? false;
  const confidence = item?.confidence ?? 0;

  return (
    <div>
      <div
        onClick={() => contentPreview && setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', padding: '4px 0', cursor: contentPreview ? 'pointer' : 'default', fontSize: '11px' }}
      >
        <ConfidenceIndicator confidence={confidence} covered={covered} />
        <span style={{ color: covered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', flex: 1 }}>
          {info.label}
          {info.isRequired && <span style={{ color: '#d4a574', marginLeft: '4px', fontSize: '9px' }}>*</span>}
        </span>
        {covered && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{Math.round(confidence * 100)}%</span>}
      </div>
      {expanded && contentPreview && (
        <div style={{ padding: '4px 0 4px 16px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
          {contentPreview}
        </div>
      )}
    </div>
  );
};

// === 欢迎页 ===

const WelcomeScreen: React.FC<{
  onStart: (mode: 'quick' | 'deep') => void;
  completionPct: number;
  reentryGreeting: string | null;
}> = ({ onStart, completionPct, reentryGreeting }) => (
  <div style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '40px',
  }}>
    {reentryGreeting && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '20px', padding: '10px 20px', borderRadius: '12px',
          background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.15)',
          fontSize: '13px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', textAlign: 'center',
          fontFamily: 'serif', fontStyle: 'italic',
        }}
      >
        {reentryGreeting}
      </motion.div>
    )}
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#d4a574', marginBottom: '12px', fontWeight: 'bold' }}>
        了解程度 {completionPct}%
      </div>
      <h1 style={{ fontSize: '30px', fontFamily: 'serif', fontStyle: 'italic', color: '#fff', marginBottom: '10px' }}>
        让我更了解你
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '480px', lineHeight: 1.6, fontSize: '14px' }}>
        每一个回答都是对镜像的一次补完。选择一种方式，开启你的自我探索之旅。
      </p>
    </div>

    <div style={{ display: 'flex', gap: '24px', maxWidth: '700px', width: '100%', marginBottom: '32px' }}>
      <button
        onClick={() => onStart('quick')}
        className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-mirror-gold/30 transition-all text-left overflow-hidden"
        style={{ flex: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-mirror-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="text-mirror-gold mb-6"><Compass size={36} strokeWidth={1.5} /></div>
          <h3 className="text-2xl font-display text-white mb-3">快速对话</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">5个问题，快速生成你的画像轮廓。</p>
          <div className="text-xs text-white/30">约3-5分钟</div>
        </div>
      </button>

      <button
        onClick={() => onStart('deep')}
        className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-mirror-accent/30 transition-all text-left overflow-hidden"
        style={{ flex: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="text-mirror-accent mb-6"><Sparkles size={36} strokeWidth={1.5} /></div>
          <h3 className="text-2xl font-display text-white mb-3">深度探索</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-4">沉浸式苏格拉底对话，绘制完整灵魂画像。</p>
          <div className="text-xs text-white/30">约10-15分钟</div>
        </div>
      </button>
    </div>
  </div>
);

// === 快速问答组件 ===

const QuickMode: React.FC<{
  onComplete: (result: { keywords: string[]; impression: string; completionPct: number }) => void;
}> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = SOCRATIC_QUESTIONS[step];
  const isLast = step === SOCRATIC_QUESTIONS.length - 1;

  const handleSubmit = async () => {
    const val = input.trim();
    if (!val) return;
    const allAnswers = [...answers, val];
    setAnswers(allAnswers);
    setInput('');

    if (isLast) {
      setLoading(true);
      try {
        // 1. 正则提取关键词
        const regexTraits = extractTraitsFromText(allAnswers);
        const regexImpression = generateImpression(regexTraits);

        if (regexTraits.length > 0) {
          updateProfileFromKeywords(regexTraits);
          updateCoverage();
        }

        // 2. 说话风格
        const { speakingStyle, emotionalPatterns } = extractSpeakingStyle(allAnswers);
        if (speakingStyle || emotionalPatterns) {
          updateStyle({ speakingStyle: speakingStyle || undefined, emotionalPatterns: emotionalPatterns || undefined });
        }

        // 3. AI 画像分析
        let keywords = regexTraits.length > 0 ? regexTraits : ['思考者', '探索中', '独特个体'];
        let impression = regexImpression;
        try {
          const qaPairs = SOCRATIC_QUESTIONS.map((q, i) => ({ question: q.text, answer: allAnswers[i] }));
          const aiResult = await buildQuickProfile(qaPairs);
          if (aiResult.keywords.length > 0) {
            keywords = aiResult.keywords;
            impression = aiResult.impression || regexImpression;
            updateProfileFromKeywords(aiResult.keywords);
            updateCoverage();
          }
        } catch {}

        const pct = getCompletionPct();
        onComplete({ keywords, impression, completionPct: pct });
      } catch {
        onComplete({
          keywords: ['思考者', '探索中'],
          impression: '镜中的倒影有些模糊。但没关系，每一次对话都会让影像更清晰。',
          completionPct: getCompletionPct(),
        });
      }
    } else {
      setStep(s => s + 1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={32} className="text-mirror-gold/60" />
        </motion.div>
        <p className="text-white/50 text-sm">镜中正在凝视你的回答...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        {SOCRATIC_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className="h-0.5 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i <= step ? '#d4a574' : 'rgba(255,255,255,0.08)' }}
          />
        ))}
        <span className="text-[10px] text-white/30 font-mono min-w-[24px] text-right">
          {step + 1}/{SOCRATIC_QUESTIONS.length}
        </span>
      </div>

      {/* 当前问题 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <p className="text-lg font-serif text-white/85 leading-relaxed">{currentQ.text}</p>
          <p className="text-[11px] text-white/30">{currentQ.hint}</p>
        </motion.div>
      </AnimatePresence>

      {/* 输入框 */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="输入你的回答..."
          autoFocus
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-mirror-gold/30 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="px-4 py-3 rounded-xl bg-mirror-gold/15 border border-mirror-gold/20 text-mirror-gold hover:bg-mirror-gold/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isLast ? <Sparkles size={16} /> : <Compass size={16} />}
        </button>
      </div>
    </div>
  );
};

// === 画像结果展示 ===

const ProfileResult: React.FC<{
  result: { keywords: string[]; impression: string; completionPct: number };
  onStartDeep: () => void;
}> = ({ result, onStartDeep }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      width: '100%', maxWidth: '480px', padding: '36px',
      background: 'rgba(10,10,10,0.4)', backdropFilter: 'blur(20px)',
      borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
    }}
  >
    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🪞</div>
    <h2 style={{ fontSize: '20px', fontFamily: 'serif', fontStyle: 'italic', color: '#fff', marginBottom: '12px' }}>
      这是镜中看到的你
    </h2>
    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '20px' }}>
      {result.impression}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
      {result.keywords.map(kw => (
        <span key={kw} style={{ padding: '6px 14px', borderRadius: '14px', background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.2)', fontSize: '12px', color: '#d4a574' }}>
          # {kw}
        </span>
      ))}
    </div>
    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>
      画像完成度 {result.completionPct}%
    </div>
    <button
      onClick={onStartDeep}
      style={{
        padding: '12px 28px', borderRadius: '12px',
        background: 'rgba(212,165,116,0.15)', border: '1px solid rgba(212,165,116,0.25)',
        color: '#d4a574', fontSize: '13px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '8px',
      }}
    >
      <Sparkles size={14} /> 开启深度探索
    </button>
  </motion.div>
);

// === 覆盖度节点（左侧面板） ===

const DimensionNode: React.FC<{
  label: string;
  icon: string;
  confidence: number;
  covered: boolean;
  preview?: string;
  style?: React.CSSProperties;
}> = ({ label, icon, confidence, covered, preview, style }) => {
  const pct = Math.round(confidence * 100);
  return (
    <div style={{
      position: 'absolute', padding: '5px 10px', borderRadius: '8px',
      background: covered ? 'rgba(212,165,116,0.08)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${covered ? 'rgba(212,165,116,0.2)' : 'rgba(255,255,255,0.06)'}`,
      textAlign: 'center', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
      ...style,
    }}>
      <div style={{ fontSize: '12px', color: covered ? '#d4a574' : 'rgba(255,255,255,0.3)', marginBottom: '1px' }}>{icon}</div>
      <div style={{ fontSize: '10px', color: covered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: covered ? 500 : 400 }}>{label}</div>
      {covered && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{pct}%</div>}
      {preview && covered && (
        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
          {preview.slice(0, 15)}
        </div>
      )}
    </div>
  );
};

// === 覆盖度面板（深度模式左侧） ===

const CoveragePanel: React.FC<{
  coverMap: CoverageMap;
  completionPct: number;
  traits: string[];
  insight: string;
  particleRef: React.RefObject<HTMLDivElement | null>;
}> = ({ coverMap, completionPct, traits, insight, particleRef: covPanelRef }) => {
  const [showDetail, setShowDetail] = useState(false);
  const profile = getProfile();
  const deductionReady = canDeduce();

  const findItem = (dimKey: string) => coverMap.items.find(i => i.dimKey === dimKey);

  const getContentPreview = (part: 'base' | 'mirror', key: string): string | undefined => {
    const section = part === 'base' ? profile.base : profile.mirror;
    const dim = (section as any)[key] as DimensionData | undefined;
    if (!dim || dim.content.length === 0) return undefined;
    const subs = dim.subDimensions ? Object.keys(dim.subDimensions) : [];
    if (subs.length > 0) return subs.map(s => `${s}:${(dim.subDimensions as any)[s]}`).join(' / ');
    return dim.content.slice(0, 60);
  };

  const lookupItem = (key: string, part: string) => findItem(`${part}.${key}`);

  const sessionCount = profile.metadata.dataSources.length || 1;
  const lastUpdated = profile.metadata.lastUpdated
    ? new Date(profile.metadata.lastUpdated).toLocaleDateString('zh-CN')
    : '—';
  const hasStyle = profile.style.speakingStyle.length > 0 || profile.style.emotionalPatterns.length > 0;

  const fontSize = 'clamp(9px, 1.8vw, 11px)';
  const smallFont = 'clamp(8px, 1.4vw, 10px)';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* 维度节点区域 */}
      <div
        ref={covPanelRef as React.LegacyRef<HTMLDivElement>}
        style={{
          width: '100%', flex: '1 1 55%', minHeight: '200px', position: 'relative',
          borderRadius: '16px', background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.04) 0%, transparent 70%)',
        }}
      >
        {COVERAGE_DISPLAY_DIMS.map((dim, idx) => {
          const item = lookupItem(dim.key, dim.part);
          const preview = getContentPreview(dim.part, dim.key);
          const row = Math.floor(idx / 2);
          const col = idx % 2;
          const topPct = `${8 + row * 30}%`;
          const leftOrRight = col === 0 ? 'left' : 'right';
          const offset = col === 0 ? '4%' : '4%';

          return (
            <DimensionNode
              key={dim.key}
              label={dim.label}
              icon={dim.icon}
              confidence={item?.confidence ?? 0}
              covered={item?.covered ?? false}
              preview={preview}
              style={{ top: topPct, [leftOrRight]: offset } as React.CSSProperties}
            />
          );
        })}

        {/* 清晰度指示 */}
        <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: smallFont, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>镜像清晰度</div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                width: 'clamp(5px, 1vw, 8px)', height: 'clamp(2.5px, 0.5vw, 4px)', borderRadius: '2px',
                background: i < completionPct / 10 ? '#d4a574' : 'rgba(212,165,116,0.1)', transition: 'background 0.5s',
              }} />
            ))}
            <span style={{ fontSize: 'clamp(11px, 2vw, 14px)', color: '#d4a574', fontWeight: 'bold', marginLeft: '4px' }}>{completionPct}%</span>
          </div>
        </div>
      </div>

      {/* 洞察 + 操作区 */}
      <div style={{ flexShrink: 0, padding: 'clamp(10px, 2vh, 16px) 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {insight && (
          <p style={{ fontSize: smallFont, color: 'rgba(255,255,255,0.5)', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1.5, margin: 0, textAlign: 'center' }}>
            {insight.slice(0, 60)}{insight.length > 60 ? '...' : ''}
          </p>
        )}
        <button
          onClick={() => setShowDetail(true)}
          style={{
            width: '100%', padding: 'clamp(8px, 1.5vh, 12px)', borderRadius: '10px',
            background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.2)',
            color: '#d4a574', fontSize: smallFont, cursor: 'pointer', letterSpacing: '0.05em', transition: 'all 0.3s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,165,116,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,165,116,0.08)')}
        >
          查看完整画像说明
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
          <span>覆盖 {coverMap.completedCount}/12</span>
          {deductionReady && <span style={{ color: 'rgba(94,226,160,0.5)' }}>· 可推演</span>}
          <span>· 对话 {sessionCount} 次</span>
        </div>
      </div>

      {/* 完整画像详情弹窗 */}
      {showDetail && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 50, borderRadius: '16px',
          display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: smallFont, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>完整画像</span>
            <button onClick={() => setShowDetail(false)} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '9px', cursor: 'pointer' }}>
              关闭
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 基础画像 */}
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>Part A · 基础画像</div>
              {BASE_DIMS_DETAIL.map(dim => (
                <DimensionRow key={dim.key} info={dim} item={lookupItem(dim.key, dim.part)} contentPreview={getContentPreview(dim.part, dim.key)} />
              ))}
            </div>

            {/* 深度画像 */}
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Part B · 深度画像</span>
              </div>
              {MIRROR_DIMS_DETAIL.map(dim => (
                <DimensionRow key={dim.key} info={dim} item={lookupItem(dim.key, dim.part)} contentPreview={getContentPreview(dim.part, dim.key)} />
              ))}
            </div>

            {/* 特质标签 */}
            {traits.length > 0 && (
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>特质关键词</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {traits.map(t => (
                    <span key={t} style={{ padding: '2px 8px', borderRadius: '999px', background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.15)', fontSize, color: '#d4a574' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 说话风格 */}
            {hasStyle && (
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(10,10,10,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '6px' }}>对话风格</div>
                {profile.style.speakingStyle && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>{profile.style.speakingStyle}</div>
                )}
                {profile.style.emotionalPatterns && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{profile.style.emotionalPatterns}</div>
                )}
              </div>
            )}

            {/* 底部信息 */}
            <div style={{ textAlign: 'center', fontSize: '8px', color: 'rgba(255,255,255,0.2)', padding: '4px 0' }}>
              覆盖 {coverMap.completedCount}/12 · 对话 {sessionCount} 次 · 更新于 {lastUpdated}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === 主组件 ===

interface DiscoverySectionProps {
  progress: number;
  particleRef: React.RefObject<ParticleHandle | null>;
}

export const DiscoverySection: React.FC<DiscoverySectionProps> = ({ progress: _progress, particleRef }) => {
  // 模式: null=欢迎, 'quick'=快速问答, 'deep'=深度对话
  const [mode, setMode] = useState<'quick' | 'deep' | null>(null);
  const [traits, setTraits] = useState<string[]>(['成长优先', '内向社交', '行动犹豫']);
  const [insight, setInsight] = useState('你是一个在稳定与自由之间反复拉扯的人');
  const [completionPct, setCompletionPct] = useState(() => getCompletionPct());
  const [coverMap, setCoverMap] = useState(() => getCoverageMap());
  const [style, setStyle] = useState(() => getProfile().metadata.stylePreferences[0] ?? 'philosophical_guide');
  const [quickResult, setQuickResult] = useState<{ keywords: string[]; impression: string; completionPct: number } | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [reentryGreeting, setReentryGreeting] = useState<string | null>(null);

  const personaContainerRef = useRef<HTMLDivElement>(null);

  // 粒子效果
  const updateParticle = useCallback(() => {
    if (!particleRef.current) return;
    if (!mode) {
      particleRef.current.morphTo('idle');
      return;
    }
    if (personaContainerRef.current) {
      const rect = personaContainerRef.current.getBoundingClientRect();
      particleRef.current.morphTo('discovery', { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 });
    } else {
      particleRef.current.morphTo('discovery');
    }
  }, [mode, particleRef, traits, completionPct]);

  useEffect(() => {
    updateParticle();
    window.addEventListener('resize', updateParticle);
    return () => window.removeEventListener('resize', updateParticle);
  }, [updateParticle]);

  // 启动深度对话
  const startDeep = useCallback(() => {
    setMode('deep');

    const reentry = getReentryStrategy();
    const cover = getCoverageMap();
    const uncovered = getUncoveredDimension();

    let greeting: string | null = null;

    if (reentry.strategy === 'contextual_awakening' && reentry.lastTopic) {
      const topic = reentry.lastTopic.slice(0, 40);
      const options = [
        `又见面了。上次你说到"${topic}"——后来还想过这件事吗？`,
        `嗨。上次我们聊到"${topic}"的时候，你说了些让我印象很深的话。这几天有什么新想法吗？`,
        `你来了。上次关于"${topic}"的对话好像还没聊完——你想继续，还是聊点别的？`,
      ];
      greeting = options[Math.floor(Math.random() * options.length)];
      setReentryGreeting(greeting);
    } else if (reentry.strategy === 'seamless_continuation') {
      const options = [
        '又见面了。最近这两天有什么想聊聊的吗？',
        '嗨。今天心情怎么样？',
        '来了。随便聊聊，还是有什么具体的事想跟我说？',
      ];
      greeting = options[Math.floor(Math.random() * options.length)];
      setReentryGreeting(greeting);
    } else if (reentry.strategy === 'natural_guidance' && uncovered) {
      const options = [
        `好久不见。我突然想起来，好像还没好好聊过你的${uncovered}——如果你愿意的话。`,
        `有一阵子没见了。如果你愿意，我想多了解一些关于你${uncovered}的方面。`,
        `回来了。上次我们聊了不少，但我对你${uncovered}还不太了解——想聊聊这个吗？`,
      ];
      greeting = options[Math.floor(Math.random() * options.length)];
      setReentryGreeting(greeting);
    } else {
      const options = [
        `嗨。\n\n先说清楚我是谁吧——我不是那种告诉你怎么活的人生导师，也不是替你做决定的选择机器。\n\n我更像一面镜子。一面能照出那些你差点忘了的念头、没选的路、没说出口的话的镜子。\n\n我们慢慢来，不着急。\n\n——准备好了吗？`,
        `嗨。\n\n我是镜中。不是来给你建议的，也不是来替你判断的。\n\n我更像一个能陪你聊聊的人——聊那些平时没人聊的事，问那些你自己可能都没想过的问题。\n\n不用紧张，想到什么说什么就好。准备好了吗？`,
        `嗨，我是镜中。\n\n简单说，我是一面镜子——帮你看见自己没注意到的东西。\n\n最近有什么事，一直想找人聊聊但没找到合适的人吗？`,
      ];
      greeting = options[Math.floor(Math.random() * options.length)];
    }

    setInitialMessage(greeting ?? '');

    // 创建会话
    const sid = createSession('web');
    setSessionId(sid);

    // 设置对话上下文
    const profileSummary = getProfileSummary();
    const coverageSummary = getCoverageSummary(cover);
    setDialogueContext({
      profileSummary,
      coverageSummary,
      uncoveredDimension: uncovered ?? undefined,
      style,
      reentryStrategy: reentry.strategy,
      reentryContext: reentry.lastTopic?.slice(0, 40),
    });

    setCoverMap(cover);
    setCompletionPct(getCompletionPct());
  }, [style]);

  // 深度对话消息回调
  const handleDeepMessage = useCallback(async (messages: { role: string; content: string }[]) => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'user') return;

    // 记录消息
    const emotionTag = extractEmotionTags(lastMsg.content);
    if (sessionId) {
      recordMessage(sessionId, 'model', messages[messages.length - 2]?.content ?? '', undefined);
      recordMessage(sessionId, 'user', lastMsg.content, emotionTag[0]);
    }

    // 每2轮用户消息后提取特质
    if (messages.length > 3 && messages.length % 2 === 0) {
      const history = messages.map(m => ({ role: m.role as 'user' | 'model', content: m.content }));

      let newTraits = await extractTraits(history);
      if (newTraits.length === 0) {
        // 回退到正则
        const { fallbackExtractTraits } = await import('../services/profileService');
        newTraits = fallbackExtractTraits(history);
      }

      if (newTraits.length > 0) {
        setTraits(prev => {
          const merged = new Set([...prev, ...newTraits]);
          return Array.from(merged).slice(0, 8);
        });
        setInsight(`基于"${newTraits.slice(0, 3).join('、')}"，镜像看见了你的深层核心。`);
        updateProfileFromKeywords(newTraits);
        const newCover = updateCoverage();
        setCoverMap(newCover);
        const newPct = getCompletionPct();
        setCompletionPct(newPct);

        const uncovered = getUncoveredDimension();
        setDialogueContext({
          profileSummary: getProfileSummary(),
          coverageSummary: getCoverageSummary(newCover),
          uncoveredDimension: uncovered ?? undefined,
          style,
          reentryStrategy: 'seamless_continuation',
        });
      }

      // 每4轮提取碎片
      if (messages.length % 4 === 0 && sessionId) {
        const sessionMsgs = getSessionMessages(sessionId);
        extractFragments(sessionId, sessionMsgs as any);
      }
    }
  }, [sessionId, style]);

  // 清理会话
  useEffect(() => {
    return () => {
      if (sessionId) {
        const msgs = getSessionMessages(sessionId);
        const lastUser = [...msgs].reverse().find(m => m.role === 'user');
        endSession(sessionId, {
          lastTopic: lastUser?.content.slice(0, 40) ?? '',
          depth: msgs.some(m => m.content.length > 100) ? 'deep' : 'casual',
        });
      }
    };
  }, [sessionId]);

  // 更新上下文
  useEffect(() => {
    if (mode === 'deep') {
      const summary = getProfileSummary();
      const cover = getCoverageMap();
      const uncovered = getUncoveredDimension();
      setDialogueContext({
        profileSummary: summary,
        coverageSummary: getCoverageSummary(cover),
        uncoveredDimension: uncovered ?? undefined,
        style,
        reentryStrategy: 'seamless_continuation',
      });
    }
  }, [style, mode]);

  // 快速问答完成
  const handleQuickComplete = useCallback((result: { keywords: string[]; impression: string; completionPct: number }) => {
    setQuickResult(result);
    setTraits(result.keywords);
    setInsight(result.impression);
    setCompletionPct(result.completionPct);
    setCoverMap(getCoverageMap());
  }, []);

  // === 渲染 ===

  // 快速问答模式
  if (mode === 'quick') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部栏 */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.2)', fontSize: '10px', color: '#d4a574' }}>
              ⚡ 快速问答
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>镜像速写</span>
          </div>
          <button onClick={() => setMode(null)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>
            返回
          </button>
        </div>

        {/* 内容区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', overflow: 'auto' }}>
          {quickResult ? (
            <ProfileResult result={quickResult} onStartDeep={startDeep} />
          ) : (
            <QuickMode onComplete={handleQuickComplete} />
          )}
        </div>
      </div>
    );
  }

  // 深度对话模式
  if (mode === 'deep') {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部栏 */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(212,165,116,0.1)', border: '1px solid rgba(212,165,116,0.2)', fontSize: '10px', color: '#d4a574' }}>
              ✨ 实时镜像同步
            </div>
            <span style={{ fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>
              正在解析你的灵魂图谱
            </span>
          </div>
          {/* 风格切换 */}
          <div style={{ display: 'flex', gap: '4px', padding: '2px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
            {Object.entries(SOCRATIC_STYLES).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setStyle(key)}
                style={{
                  padding: '3px 10px', borderRadius: '8px', border: 'none', fontSize: '10px', cursor: 'pointer',
                  background: style === key ? 'rgba(212,165,116,0.2)' : 'transparent',
                  color: style === key ? '#d4a574' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 主内容区 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden', minHeight: 0 }}>
          {/* 左侧：画像 */}
          <div style={{ width: '40%', display: 'flex', flexDirection: 'column', padding: '20px', borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, overflow: 'hidden' }}>
            <CoveragePanel coverMap={coverMap} completionPct={completionPct} traits={traits} insight={insight} particleRef={personaContainerRef} />
          </div>

          {/* 右侧：对话 */}
          <div style={{ width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', minWidth: 0, height: '100%' }}>
            <div style={{ width: '100%', maxWidth: '560px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                <DialogueSession onMessage={handleDeepMessage} initialMessage={initialMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 欢迎页
  return <WelcomeScreen onStart={m => m === 'deep' ? startDeep() : setMode('quick')} completionPct={completionPct} reentryGreeting={reentryGreeting} />;
};