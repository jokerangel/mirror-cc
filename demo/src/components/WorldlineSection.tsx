import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitBranch, History, MousePointer2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParticleHandle } from './ParticleBackground';

interface WorldlineNode {
  id: string;
  year: number;
  month: string;
  type: 'decision' | 'event' | 'turning' | 'regret' | 'deduction';
  title: string;
  description: string;
  color: string;
}

const NODES: WorldlineNode[] = [
  {
    id: '1',
    year: 2021,
    month: '10月',
    type: 'event',
    title: '第一行代码',
    description: '一切好奇心的起点，那是第一次尝试理解数字世界的运作逻辑。',
    color: 'bg-emerald-400'
  },
  {
    id: '2',
    year: 2022,
    month: '3月',
    type: 'decision',
    title: '加入创业公司',
    description: '当时放弃了稳定的大厂工作，选择了一个充满不确定性的初创团队。那个决定开启了现在的一切。',
    color: 'bg-yellow-400'
  },
  {
    id: '3',
    year: 2022,
    month: '5月',
    type: 'regret',
    title: '放弃买房计划',
    description: '在首付差一点点的时候选择了放弃，看着后来房价的波动，心中总在推测另一个结局。',
    color: 'bg-gray-400'
  },
  {
    id: '4',
    year: 2022,
    month: '11月',
    type: 'event',
    title: '深夜的灵感',
    description: '在无数个挫败的夜晚后，突然看到了产品核心逻辑的突破口。',
    color: 'bg-orange-400'
  },
  {
    id: '5',
    year: 2023,
    month: '2月',
    type: 'turning',
    title: '生活轴心偏移',
    description: '生了一场小病后，重新定义了成功的标准，想清楚健康比工作重要。',
    color: 'bg-purple-400'
  },
  {
    id: '6',
    year: 2023,
    month: '5月',
    type: 'event',
    title: '项目上线',
    description: '无数个通宵的结晶，终于见到了阳光。',
    color: 'bg-blue-400'
  },
  {
    id: '7',
    year: 2023,
    month: '9月',
    type: 'turning',
    title: '镜中的对视',
    description: '开始记录情绪，试图剥离外界评价，审视真实的自我。',
    color: 'bg-pink-400'
  }
];

interface WorldlineSectionProps {
  progress: number;
  particleRef: React.RefObject<ParticleHandle | null>;
}

export const WorldlineSection: React.FC<WorldlineSectionProps> = ({ particleRef }) => {
  const [selectedNode, setSelectedNode] = useState<WorldlineNode | null>(null);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    if (particleRef?.current) {
      particleRef.current.morphTo('world');
    }
    // Initial center position
    setScrollPos(window.innerWidth / 2);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Top Header */}
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

      {/* Integrated Timeline Nodes with organic distribution */}
      <div 
        className="absolute inset-0 overflow-x-auto overflow-y-hidden no-scrollbar scroll-smooth"
        onScroll={(e) => {
          const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
          const viewportWidth = (e.target as HTMLDivElement).clientWidth;
          const centerX = scrollLeft + viewportWidth / 2;
          
          // Use a ref to trigger re-renders or update style directly if needed.
          // For Framer Motion, we can use useScroll and useTransform, but since we are in a custom scroll container, 
          // let's use a state or a scroll listener with motion values.
          setScrollPos(centerX);
        }}
      >
        <div className="relative h-full min-w-max px-[30vw] md:px-[45vw] flex items-center">
          {/* Divergent SVG Worldlines Background */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* Draw multiple organic paths */}
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

          {/* Nodes Layer */}
          <div className="relative flex h-full">
            {/* Floating Sparks - Scrollable with nodes container */}
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1.5 h-1.5 bg-white/30 rounded-full blur-[1px]"
                initial={{ 
                  x: Math.random() * 4000, 
                  y: Math.random() * 1000 - 500,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * 800 - 400],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 2, 0.5]
                }}
                transition={{ 
                  duration: 15 + Math.random() * 25, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}

            {NODES.map((node, i) => {
              // Calculate organic offsets
              const verticalShift = Math.sin(i * 1.5) * 150 + (Math.cos(i * 2.2) * 50);
              const horizontalShift = (i * 450); // Increased spacing to accommodate larger nodes
              const microShift = Math.sin(i * 3.7) * 40;
              
              // Proximity to center logic
              const nodeX = horizontalShift + microShift + (window.innerWidth * 0.45); // Approximate offset
              const distToCenter = Math.abs(nodeX - scrollPos);
              const maxDist = 600;
              const proximity = Math.max(0, 1 - distToCenter / maxDist);
              
              // Scale from base 0.5x to 1.5x (halved from previous 1x-3x)
              const dynamicScale = 0.5 + (proximity * 1);
              const opacity = 0.3 + (proximity * 0.7);

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.4 }}
                  whileInView={{ opacity: 1, scale: dynamicScale }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    position: 'absolute',
                    left: `${horizontalShift + microShift}px`,
                    top: `calc(50% + ${verticalShift}px)`,
                    opacity: opacity,
                    scale: dynamicScale,
                    zIndex: Math.round(proximity * 10) + 20
                  }}
                  className="flex-shrink-0 group"
                >
                  {/* Connection Line to prev node (visual only) */}
                  {i > 0 && (
                    <div 
                      className="absolute pointer-events-none h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                      style={{
                        width: '450px',
                        left: '-450px',
                        top: '50%',
                        transform: `rotate(${Math.atan2(verticalShift - (Math.sin((i-1) * 1.5) * 150 + (Math.cos((i-1) * 2.2) * 50)), 450) * 180 / Math.PI}deg)`,
                        transformOrigin: 'right center'
                      }}
                    />
                  )}

                  {/* The Node Bubble */}
                  <button
                    onClick={() => setSelectedNode(node)}
                    className="relative w-8 h-8 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/30 transition-all duration-700 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                      <div className={cn("w-2 h-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]", node.color)} />
                      {/* Pulsing ring */}
                      <motion.div 
                        animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={cn("absolute inset-2 rounded-full border border-current opacity-20", node.color.replace('bg-', 'text-'))}
                      />
                    </div>
                    
                    {/* Floating Label */}
                    <div 
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-48 text-center pointer-events-none transition-all duration-500",
                        verticalShift > 0 ? "bottom-24 group-hover:bottom-28" : "top-24 group-hover:top-28"
                      )}
                      style={{ scale: dynamicScale > 1.5 ? 1 / (dynamicScale / 1.5) : 1 }}
                    >
                      <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2 block font-mono">
                        {node.year} · {node.month}
                      </span>
                      <h3 className="text-sm md:text-base text-white/60 font-serif group-hover:text-white transition-colors leading-tight">
                        {node.title}
                      </h3>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Spacer at the end for scrolling comfort */}
          <div className="w-[50vw] flex-shrink-0" />
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-4 px-6 md:px-0 w-full md:w-auto overflow-x-auto no-scrollbar justify-center">
        {['全部', '决定', '遗憾', '关键转折'].map(f => (
          <button key={f} className="whitespace-nowrap px-3 md:px-4 py-1.5 rounded-full glass-panel text-[8px] md:text-[10px] text-white/40 hover:text-white/80 border-white/5">
            {f}
          </button>
        ))}
      </div>

      {/* Node Details Popup */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0d] border border-white/10 rounded-[2rem] w-full max-w-xl overflow-hidden relative"
            >
              <div className="h-48 relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent flex items-center justify-center">
                  {selectedNode.type === 'decision' ? <GitBranch className="w-24 h-24" /> : <History className="w-24 h-24" />}
                </div>
                <div className="z-10 flex flex-col items-center">
                   <div className={cn("w-2 h-2 rounded-full mb-4", selectedNode.color)} />
                   <span className="text-[10px] tracking-[0.5em] text-white/40 uppercase">
                     {selectedNode.year} . {selectedNode.month}
                   </span>
                </div>
              </div>

              <div className="p-12">
                <h3 className="text-2xl font-serif text-white mb-4">{selectedNode.title}</h3>
                <p className="text-white/60 leading-relaxed mb-8">
                  {selectedNode.description}
                </p>

                <div className="flex flex-col gap-3">
                  <button className="w-full py-4 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                    <MousePointer2 className="w-4 h-4" />
                    推演这一刻的“如果...”
                  </button>
                  <button className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors">
                    完善那个瞬间的细节
                  </button>
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
