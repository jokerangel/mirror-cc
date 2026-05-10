import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, History, MousePointer2, X, Heart, Sparkles, RotateCcw, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParticleHandle } from './ParticleBackground';
import { getStoredNodes, StoredNode } from '../services/nodeStorageService';

// Key matter type definitions
interface KeyMatterDef {
  label: string;
  color: string;
  tagBg: string;
}

const keyMatterMap: Record<string, KeyMatterDef> = {
  decision: { label: '决定', color: '#D4A574', tagBg: 'bg-node-decision/15 text-node-decision' },
  event: { label: '事件', color: '#6B8CAE', tagBg: 'bg-node-event/15 text-node-event' },
  turning: { label: '转折', color: '#B8A5D0', tagBg: 'bg-node-turning/15 text-node-turning' },
  almost: { label: '差点发生', color: '#A8A8A8', tagBg: 'bg-node-almost/20 text-node-almost' },
};

// Node shape mapping
const nodeShapeMap: Record<string, string> = {
  origin: 'circle',
  ghost: 'dashed-circle',
  feedback: 'circle',
  deduction: 'diamond',
  parallel: 'hexagon',
  pending: 'dashed-circle',
};

// Node type badge labels for non-origin nodes
const nodeTypeBadge: Record<string, { label: string; cls: string }> = {
  feedback: { label: '反馈', cls: 'bg-white/5 text-white/40' },
  deduction: { label: '推演', cls: 'bg-node-turning/15 text-node-turning/70' },
  parallel: { label: '并行', cls: 'bg-node-event/15 text-node-event/70' },
  pending: { label: '待决', cls: 'bg-node-almost/20 text-node-almost' },
};

// Filter tabs
const filterTabs = [
  { id: 'all', label: '全部' },
  { id: 'decision', label: '决定' },
  { id: 'turning', label: '转折' },
  { id: 'almost', label: '差点发生' },
  { id: 'deduction', label: '推演' },
  { id: 'regret', label: '遗憾' },
];

// Regret status type
type RegretStatus = 'compensable' | 'irreparable' | 'resolved';

interface WorldlineNode {
  id: string;
  year: number;
  month: string;
  type: 'origin' | 'ghost' | 'feedback' | 'deduction' | 'parallel' | 'pending';
  keyMatter?: string;
  title: string;
  description: string;
  hasRegret?: boolean;
  regretStatus?: RegretStatus;
  parentId?: string;
  feedbackTargetId?: string;
  isNew?: boolean;
}

// Default nodes
const DEFAULT_NODES: WorldlineNode[] = [
  {
    id: 'd1',
    year: 2021,
    month: '10月',
    type: 'origin',
    keyMatter: 'event',
    title: '第一行代码',
    description: '一切好奇心的起点，那是第一次尝试理解数字世界的运作逻辑。',
  },
  {
    id: 'd2',
    year: 2022,
    month: '3月',
    type: 'origin',
    keyMatter: 'decision',
    title: '加入创业公司',
    description: '当时放弃了稳定的大厂工作，选择了一个充满不确定性的初创团队。那个决定开启了现在的一切。',
  },
  {
    id: 'dd1',
    year: 2022,
    month: '6月',
    type: 'deduction',
    title: '留在原公司',
    description: '推演路径：如果当时没有离开大厂，而是选择留下赌期权。',
    parentId: 'd2',
  },
  {
    id: 'd3',
    year: 2022,
    month: '5月',
    type: 'ghost',
    keyMatter: 'almost',
    title: '差点买房',
    description: '在首付差一点点的时候选择了放弃，看着后来房价的波动，心中总在推测另一个结局。',
    hasRegret: true,
    regretStatus: 'irreparable',
  },
  {
    id: 'd4',
    year: 2022,
    month: '11月',
    type: 'origin',
    keyMatter: 'event',
    title: '深夜的灵感',
    description: '在无数个挫败的夜晚后，突然看到了产品核心逻辑的突破口。',
  },
  {
    id: 'd5',
    year: 2023,
    month: '2月',
    type: 'origin',
    keyMatter: 'turning',
    title: '生活轴心偏移',
    description: '生了一场小病后，重新定义了成功的标准，想清楚健康比工作重要。',
  },
  {
    id: 'd7',
    year: 2023,
    month: '6月',
    type: 'ghost',
    keyMatter: 'almost',
    title: '差点学设计',
    description: '一直想学设计却总被推后，如果当初迈出那一步，现在的视角会不会截然不同？',
    hasRegret: true,
    regretStatus: 'compensable',
  },
  {
    id: 'd7_fb',
    year: 2023,
    month: '9月',
    type: 'feedback',
    title: '开始学设计',
    description: '后悔之后决定行动，报名了线上设计课程，找到了新的表达方式。',
    feedbackTargetId: 'd7',
    parentId: 'd7',
  },
  {
    id: 'd6',
    year: 2023,
    month: '5月',
    type: 'origin',
    keyMatter: 'event',
    title: '项目上线',
    description: '无数个通宵的结晶，终于见到了阳光。',
  },
  {
    id: 'd2_fb',
    year: 2023,
    month: '3月',
    type: 'feedback',
    title: '关于加入的反思',
    description: '一年后回头看，当时的决定是对的。',
    feedbackTargetId: 'd2',
    parentId: 'd2',
  },
  {
    id: 'p1',
    year: 2022,
    month: '8月',
    type: 'parallel',
    title: '如果当初去旅行',
    description: '独立于"加入创业公司"的假设推演。',
    parentId: 'd2',
  },
  {
    id: 'f1',
    year: 2026,
    month: '1月',
    type: 'pending',
    title: '是否接受offer？',
    description: '一个新的机会出现了，但这次你会怎么选？',
  },
];

// Branch offsets for different node types
const branchOffsets: Record<string, number> = {
  feedback: -220,
  origin: 0,
  ghost: 0,
  pending: 0,
  deduction: 200,
  parallel: 320,
};

// Catmull-Rom style curve generator
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function catmullRomPath(points: { x: number; y: number }[], tension = 0.5): string {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return path;
}

function generateWavePath(
  startY: number,
  endY: number,
  baseY: number,
  amplitude: number = 22,
  wavelength: number = 420,
  seed: number = 42
): string {
  const rand = seededRandom(seed);
  const points: { x: number; y: number }[] = [];
  const step = 50;
  const range = endY - startY;

  for (let x = startY; x <= endY; x += step) {
    const progress = (x - startY) / range;
    const wave1 = Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
    const wave2 = Math.sin((x / (wavelength * 0.62)) * Math.PI * 2 + 1.3) * amplitude * 0.35;
    const wave3 = Math.sin((x / (wavelength * 0.28)) * Math.PI * 2 + 2.7) * amplitude * 0.12;
    const noise = (rand() - 0.5) * amplitude * 0.15;
    const fadeIn = Math.min(1, progress * 6);
    const fadeOut = Math.min(1, (1 - progress) * 6);
    const fade = fadeIn * fadeOut;
    points.push({ x, y: baseY + (wave1 + wave2 + wave3 + noise) * fade });
  }
  return catmullRomPath(points, 0.6);
}

function getConnectionStyle(type: string, keyMatter?: string) {
  switch (type) {
    case 'deduction':
      return { stroke: 'rgba(184,165,208,0.5)', strokeWidth: 2, strokeDasharray: 'none' };
    case 'parallel':
      return { stroke: 'rgba(107,140,174,0.45)', strokeWidth: 2, strokeDasharray: '8 3 2 3' };
    case 'feedback':
      return { stroke: `${keyMatter ? keyMatterMap[keyMatter]?.color || '#D4A574' : '#D4A574'}88`, strokeWidth: 1.5, strokeDasharray: '6 4' };
    default:
      return { stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: 'none' };
  }
}

// SVG Node Shape Component
const NodeShape: React.FC<{
  type: string;
  color: string;
  size: number;
  opacity: number;
  hasRegret?: boolean;
  isHighlighted?: boolean;
}> = ({ type, color, size, opacity, hasRegret, isHighlighted }) => {
  const shape = nodeShapeMap[type] || 'circle';

  // Regret overlay
  const regretOverlay = hasRegret ? (
    <circle
      cx="50" cy="50" r="46"
      fill="none"
      stroke="#AE8B8B"
      strokeWidth="2.5"
      opacity="0.4"
    >
      <animate attributeName="r" values="44;48;44" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.2;0.45;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
  ) : null;

  const content = (() => {
    switch (shape) {
      case 'circle':
        return (
          <>
            <circle cx="50" cy="50" r="38" fill={`${color}30`} stroke={color} strokeWidth="2.5" opacity={opacity > 0.3 ? 1 : 0.6} />
            <circle cx="50" cy="50" r="7" fill={color} opacity="1" />
            {isHighlighted && (
              <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="2" opacity="0.5">
                <animate attributeName="r" values="38;46;38" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
          </>
        );
      case 'dashed-circle': {
        const isGhost = type === 'ghost';
        return (
          <>
            <circle cx="50" cy="50" r="38" fill={`${color}35`} stroke={color} strokeWidth="2.5" strokeDasharray="6 4" opacity={isGhost ? 0.8 : 0.9} />
            {isGhost ? (
              <text x="50" y="56" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold" opacity="0.8">?</text>
            ) : (
              <circle cx="50" cy="50" r="5" fill={color} opacity="0.8">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
          </>
        );
      }
      case 'diamond':
        return (
          <>
            <rect x="28" y="28" width="44" height="44" rx="4" transform="rotate(45 50 50)" fill="rgba(184,165,208,0.25)" stroke="#B8A5D0" strokeWidth="2" opacity={opacity > 0.3 ? 0.9 : 0.5} />
            <circle cx="50" cy="50" r="5" fill="#B8A5D0" opacity="0.8" />
          </>
        );
      case 'hexagon': {
        const points = [50, 18, 74, 32, 74, 68, 50, 82, 26, 68, 26, 32].join(',');
        return (
          <>
            <polygon points={points} fill="rgba(107,140,174,0.25)" stroke="#6B8CAE" strokeWidth="2" opacity={opacity > 0.3 ? 0.9 : 0.5} />
            <circle cx="50" cy="50" r="5" fill="#6B8CAE" opacity="0.8" />
          </>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      {regretOverlay}
      {content}
    </svg>
  );
};

// Key Matter Badge
const KeyMatterBadge: React.FC<{ nodeType: string; keyMatter?: string }> = ({ nodeType, keyMatter }) => {
  if (keyMatter) {
    const def = keyMatterMap[keyMatter];
    if (!def) return null;
    return (
      <span className={cn("inline-flex items-center rounded-full font-medium whitespace-nowrap px-2 py-0.5 text-[10px]", def.tagBg)}>
        {def.label}
      </span>
    );
  }
  const badge = nodeTypeBadge[nodeType];
  if (!badge) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium whitespace-nowrap px-2 py-0.5 text-[10px]", badge.cls)}>
      {badge.label}
    </span>
  );
};

// Regret Badge
const RegretBadge: React.FC<{ status?: RegretStatus }> = ({ status }) => {
  if (!status || status === 'resolved') return null;
  if (status === 'compensable') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-node-regret">
        <Heart size={10} className="inline" /> 可弥补
      </span>
    );
  }
  if (status === 'irreparable') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-white/40">
        不可弥补
      </span>
    );
  }
  return null;
};

// Convert stored node to worldline node
const convertStoredNode = (node: StoredNode, isNew = false): WorldlineNode => {
  const yearMatch = node.scenario.timePoint.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

  const monthMatch = node.scenario.timePoint.match(/(\d{1,2})月|([一二三四五六七八九十]+)月/);
  let month = '';
  if (monthMatch) {
    month = monthMatch[1] ? `${monthMatch[1]}月` : `${monthMatch[2]}月`;
  } else if (node.scenario.timePoint.includes('去年')) {
    month = '去年';
  } else if (node.scenario.timePoint.includes('前年')) {
    month = '前年';
  } else {
    month = '其他';
  }

  const typeMap: Record<string, WorldlineNode['type']> = {
    origin: 'origin',
    branch: 'deduction',
    ending: 'deduction',
    parallel: 'parallel',
    pending: 'pending',
  };

  return {
    id: node.id,
    year,
    month,
    type: typeMap[node.nodeType] || 'origin',
    keyMatter: node.nodeType === 'origin' ? 'decision' : undefined,
    title: node.scenario.title,
    description: node.scenario.predicate || node.summary,
    isNew,
  };
};

interface WorldlineSectionProps {
  progress: number;
  particleRef: React.RefObject<ParticleHandle | null>;
  highlightedNodeId?: string;
}

export const WorldlineSection: React.FC<WorldlineSectionProps> = ({ particleRef, highlightedNodeId }) => {
  const [selectedNode, setSelectedNode] = useState<WorldlineNode | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [nodes, setNodes] = useState<WorldlineNode[]>([]);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const storedNodes = getStoredNodes();
    const worldlineNodes = storedNodes.map(node => convertStoredNode(node));
    setNodes([...DEFAULT_NODES, ...worldlineNodes]);
  }, []);

  useEffect(() => {
    if (highlightedNodeId) {
      setHighlightedNode(highlightedNodeId);
      const timer = setTimeout(() => setHighlightedNode(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedNodeId]);

  useEffect(() => {
    if (particleRef?.current) {
      particleRef.current.morphTo('world');
    }
    setScrollPos(window.innerWidth / 2);
  }, []);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return nodes;
    if (activeFilter === 'regret') return nodes.filter(n => n.hasRegret);
    if (activeFilter === 'almost') return nodes.filter(n => n.keyMatter === 'almost' || n.type === 'ghost');
    if (activeFilter === 'decision') return nodes.filter(n => n.keyMatter === 'decision' || n.keyMatter === 'turning');
    if (activeFilter === 'deduction') return nodes.filter(n => n.type === 'deduction' || n.type === 'parallel' || n.type === 'feedback');
    if (activeFilter === 'turning') return nodes.filter(n => n.keyMatter === 'turning');
    return nodes;
  }, [nodes, activeFilter]);

  // Compute node positions with branching
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const baseSpacing = 450;

    filteredNodes.forEach((node, i) => {
      const yOffset = branchOffsets[node.type] || 0;
      const microShift = Math.sin(i * 3.7) * 40;
      const verticalShift = Math.sin(i * 1.5) * 150 + (Math.cos(i * 2.2) * 50);
      positions[node.id] = {
        x: i * baseSpacing + microShift,
        y: yOffset + verticalShift,
      };
    });
    return positions;
  }, [filteredNodes]);

  return (
    <div className="relative w-full min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-16 md:top-24 left-0 right-0 z-10 flex flex-col items-center pointer-events-none px-6 text-center"
      >
        <span className="text-[8px] md:text-[10px] tracking-[0.5em] md:tracking-[0.8em] text-white/30 uppercase mb-2 md:mb-4">
          Worldline Sequence
        </span>
        <h2 className="text-xl md:text-3xl font-serif text-white/80">所有的因果，皆由于此</h2>
      </motion.div>

      {/* Timeline */}
      <div
        className="absolute inset-0 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
        onScroll={(e) => {
          const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
          const viewportWidth = (e.target as HTMLDivElement).clientWidth;
          setScrollPos(scrollLeft + viewportWidth / 2);
        }}
      >
        <div className="relative h-full min-w-max px-[30vw] md:px-[45vw] flex items-center">
          {/* Background wave lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <motion.path
                key={i}
                d={`M 0,${200 + i * 80} C 600,${i * 100} 1200,${600 - i * 50} 1800,${300 + i * 20} S 3000,${100 + i * 100} 4000,${400}`}
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth={0.5 + i % 2}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.1 + (i * 0.05) }}
                transition={{ duration: 5 + i, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              />
            ))}
          </svg>

          {/* Nodes */}
          <div className="relative flex h-full">
            {/* Floating sparks */}
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1.5 h-1.5 bg-white/30 rounded-full blur-[1px]"
                initial={{ x: Math.random() * 4000, y: Math.random() * 1000 - 500, opacity: 0 }}
                animate={{ y: [null, Math.random() * 800 - 400], opacity: [0, 0.6, 0], scale: [0.5, 2, 0.5] }}
                transition={{ duration: 15 + Math.random() * 25, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* Connection lines between nodes */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 1 }}>
              {filteredNodes.map((node, i) => {
                if (i === 0) return null;
                const prevPos = nodePositions[filteredNodes[i - 1].id];
                const currPos = nodePositions[node.id];
                if (!prevPos || !currPos) return null;

                const style = getConnectionStyle(node.type, node.keyMatter);
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={prevPos.x + 30}
                    y1={50 + prevPos.y}
                    x2={currPos.x - 30}
                    y2={50 + currPos.y}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    strokeDasharray={style.strokeDasharray}
                  />
                );
              })}
            </svg>

            {/* Node elements */}
            {filteredNodes.map((node, i) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const nodeX = pos.x + (window.innerWidth * 0.45);
              const distToCenter = Math.abs(nodeX - scrollPos);
              const maxDist = 600;
              const proximity = Math.max(0, 1 - distToCenter / maxDist);
              const dynamicScale = 0.5 + (proximity * 1);
              const opacity = 0.3 + (proximity * 0.7);
              const isHighlighted = highlightedNode === node.id || node.isNew;
              const nodeColor = node.keyMatter ? keyMatterMap[node.keyMatter]?.color || '#D4A574' :
                node.type === 'deduction' ? '#B8A5D0' :
                node.type === 'parallel' ? '#6B8CAE' :
                node.type === 'ghost' ? '#A8A8A8' : '#D4A574';

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: dynamicScale }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `calc(50% + ${pos.y}px)`,
                    opacity,
                    scale: dynamicScale,
                    zIndex: Math.round(proximity * 10) + 20,
                  }}
                  className="flex-shrink-0 group"
                >
                  <button
                    onClick={() => setSelectedNode(node)}
                    className="relative flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {/* Node SVG */}
                    <div className={cn(
                      isHighlighted && "scale-110"
                    )}>
                      <NodeShape
                        type={node.type}
                        color={nodeColor}
                        size={64}
                        opacity={opacity}
                        hasRegret={node.hasRegret}
                        isHighlighted={isHighlighted}
                      />
                    </div>

                    {/* Badge row */}
                    <div className="mt-1 flex items-center gap-1">
                      <KeyMatterBadge nodeType={node.type} keyMatter={node.keyMatter} />
                      {node.hasRegret && <RegretBadge status={node.regretStatus} />}
                    </div>

                    {/* Labels */}
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-40 text-center pointer-events-none transition-all duration-500",
                        pos.y > 0 ? "-top-16" : "top-16"
                      )}
                      style={{ scale: dynamicScale > 1.5 ? 1 / (dynamicScale / 1.5) : 1 }}
                    >
                      <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-1 block font-mono">
                        {node.year} · {node.month}
                      </span>
                      <h3 className="text-xs md:text-sm text-white/60 font-serif group-hover:text-white transition-colors leading-tight">
                        {node.title}
                      </h3>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="w-[50vw] flex-shrink-0" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="fixed bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-4 px-6 md:px-0 w-full md:w-auto overflow-x-auto no-scrollbar justify-center">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "whitespace-nowrap px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[10px] border transition-colors",
              activeFilter === tab.id
                ? "text-white/80 border-white/20 bg-white/10"
                : "text-white/40 border-white/5 hover:text-white/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Node detail popup */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0d] border border-white/10 rounded-[2rem] w-full max-w-xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-48 relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent flex items-center justify-center">
                  {selectedNode.type === 'deduction' || selectedNode.type === 'parallel' ? (
                    <GitBranch className="w-24 h-24 text-white/20" />
                  ) : (
                    <History className="w-24 h-24 text-white/20" />
                  )}
                </div>
                <div className="z-10 flex flex-col items-center">
                  <NodeShape
                    type={selectedNode.type}
                    color={selectedNode.keyMatter ? keyMatterMap[selectedNode.keyMatter]?.color || '#D4A574' : '#D4A574'}
                    size={48}
                    opacity={1}
                    hasRegret={selectedNode.hasRegret}
                  />
                  <span className="text-[10px] tracking-[0.5em] text-white/40 uppercase mt-3">
                    {selectedNode.year} · {selectedNode.month}
                  </span>
                </div>
              </div>

              <div className="p-12">
                <div className="flex items-center gap-2 mb-3">
                  <KeyMatterBadge nodeType={selectedNode.type} keyMatter={selectedNode.keyMatter} />
                  {selectedNode.hasRegret && <RegretBadge status={selectedNode.regretStatus} />}
                </div>
                <h3 className="text-2xl font-serif text-white mb-4">{selectedNode.title}</h3>
                <p className="text-white/60 leading-relaxed mb-8">
                  {selectedNode.description}
                </p>

                <div className="flex flex-col gap-3">
                  {selectedNode.type === 'ghost' && (
                    <>
                      <button className="w-full py-4 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                        <Sparkles className="w-4 h-4" />
                        推演：如果当时{selectedNode.title.replace('差点', '')}
                      </button>
                      {selectedNode.hasRegret && (
                        <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4" />
                          {selectedNode.regretStatus === 'compensable' ? '加入遗憾管理' : '面对这个遗憾'}
                        </button>
                      )}
                    </>
                  )}
                  {selectedNode.type === 'pending' && (
                    <button className="w-full py-4 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                      <MousePointer2 className="w-4 h-4" />
                      决定这个时刻
                    </button>
                  )}
                  {(selectedNode.type === 'origin' || selectedNode.type === 'feedback') && (
                    <>
                      <button className="w-full py-4 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        推演这一刻的"如果..."
                      </button>
                      <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" />
                        补充那个瞬间的细节
                      </button>
                    </>
                  )}
                  {(selectedNode.type === 'deduction' || selectedNode.type === 'parallel') && (
                    <button className="w-full py-4 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                      <GitBranch className="w-4 h-4" />
                      继续推演这条分支
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="mt-4 text-[10px] tracking-widest text-white/20 uppercase hover:text-white transition-colors"
                  >
                    BACK TO WORLDLINE
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};