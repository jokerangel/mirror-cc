import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Zap, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

interface Node {
  id: string;
  title: string;
  type: 'decision' | 'event' | 'turning' | 'regret' | 'deduction';
  color: string;
  description: string;
  date: string;
  x: number;
  y: number;
}

const NODES: Node[] = [
  { id: '1', title: '加入创业公司', type: 'decision', color: '#d4a574', date: '2022.03', x: 200, y: 300, description: '当时放弃了稳定的大厂工作，选择了这一条充满未知的道路。这不仅是一份工作，更是对自我价值的一次豪赌。' },
  { id: '2', title: '差点买房', type: 'regret', color: '#7a7a7a', date: '2022.05', x: 350, y: 150, description: '由于当时对行业前景的担忧，在最后关头放弃了那套心仪的公寓。如果买了，现在的财务状况或许截然不同。' },
  { id: '3', title: '人生观转折', type: 'turning', color: '#b8a5d0', date: '2023.02', x: 500, y: 400, description: '经历了一次深刻的病痛后，突然意识到健康的权重远高于世俗的成功。从此开始调整生活节奏，寻找身心平衡。' },
  { id: '4', title: '项目成功上线', type: 'event', color: '#6b8cae', date: '2023.05', x: 700, y: 250, description: '长达一年的高压开发后，核心产品终于获得市场认可。这是对团队努力最好的证明。' },
  { id: '5', title: '平行：留在大厂', type: 'deduction', color: '#ae8b8b', date: '2022.03平行', x: 200, y: 100, description: '推演结果：如果你留在了大厂，你或许已经成为了资深专家，但内心的那份不安分或许会转化成更深层的焦虑。' },
];

interface NodePointProps {
  node: Node;
  isSelected: boolean;
  onClick: () => void;
}

const NodePoint: React.FC<NodePointProps> = ({ node, isSelected, onClick }) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ 
        left: `${node.x}px`, 
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={() => onClick()}
      className="absolute z-10 p-6 rounded-full group outline-none"
    >
      <div 
        className={cn(
          "w-5 h-5 rounded-full transition-all duration-700 relative flex items-center justify-center",
          isSelected ? "scale-125" : "group-hover:scale-110"
        )}
        style={{ 
          backgroundColor: node.color,
          boxShadow: isSelected 
            ? `0 0 40px ${node.color}cc, 0 0 10px ${node.color}` 
            : `0 0 15px ${node.color}44`
        }}
      >
        {/* Animated Inner Core */}
        <motion.div 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-1.5 h-1.5 bg-white rounded-full" 
        />

        {/* Pulse Ring */}
        {isSelected && (
          <motion.div 
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border border-white/40"
          />
        )}
        
        {/* Glow Ring */}
        <div 
          className="absolute inset-x-[-16px] inset-y-[-16px] rounded-full border border-white/5 scale-0 group-hover:scale-100 transition-transform duration-700 bg-white/[0.02]" 
        />
        
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:-translate-y-2">
           <div className="px-4 py-2 glass-panel rounded-xl whitespace-nowrap shadow-2xl border-white/10">
              <span className="text-[11px] text-white/90 font-serif italic tracking-wide">{node.title}</span>
              <div className="text-[8px] text-white/30 uppercase tracking-widest mt-1 font-bold">{node.type}</div>
           </div>
           <div className="w-px h-5 bg-white/20 mx-auto" />
        </div>
      </div>
    </motion.button>
  );
}

export const WorldLine: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Chapter Title & Controls */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 px-1">世界线 .04</h2>
          <h1 className="text-4xl font-serif italic text-white px-1">时间线上的轨迹</h1>
        </div>
        
        <div className="flex gap-6 items-center">
           <div className="flex bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-sm">
              <button className="px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-mirror-gold bg-white/10">时间线</button>
              <button className="px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest text-white/20 hover:text-white/40">平行视图</button>
           </div>
           <div className="p-3 rounded-full border border-white/10 text-white/40 hover:text-white cursor-pointer transition-colors">
              <Filter size={16} />
           </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative glass-panel rounded-[3rem] overflow-hidden group/canvas">
        {/* Background Grid/Noise */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        
        {/* Connection Lines (Simulated SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
           <motion.path 
             d="M 200 300 L 500 400 L 700 250"
             fill="none"
             stroke="rgba(255,255,255,0.05)"
             strokeWidth="2"
             strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 2 }}
           />
        </svg>

        {/* Nodes Layer */}
        {NODES.map((node) => (
          <NodePoint 
            key={node.id} 
            node={node} 
            isSelected={selectedNode?.id === node.id}
            onClick={() => setSelectedNode(node)}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-10 left-12 flex gap-8">
           <LegendItem color="#d4a574" label="决定" />
           <LegendItem color="#b8a5d0" label="转折" />
           <LegendItem color="#6b8cae" label="事件" />
           <LegendItem color="#7a7a7a" label="差点发生" />
           <LegendItem color="#ae8b8b" label="遗憾/推演" />
        </div>

        {/* Bottom Right Counter */}
        <div className="absolute bottom-10 right-12 flex items-center gap-4 text-[9px] uppercase tracking-widest text-white/20">
           <History size={14} className="mb-px" />
           <span>活跃节点: {NODES.length}</span>
           <span className="opacity-20">|</span>
           <span>已发现通路: 02</span>
        </div>
      </div>

      {/* Node Detail Popup (Penderecki Style) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-mirror-deep/60 backdrop-blur-md"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-panel rounded-[2rem] overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              {/* Header Visual */}
              <div 
                className="h-48 w-full relative flex items-center justify-center overflow-hidden"
                style={{ background: `radial-gradient(circle at center, ${selectedNode.color}22 0%, transparent 70%)` }}
              >
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                 <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-32 h-32 rounded-full blur-3xl"
                    style={{ backgroundColor: selectedNode.color }}
                 />
                 <div className={cn(
                   "w-16 h-16 rounded-full glass-panel flex items-center justify-center border-2",
                 )} style={{ borderColor: `${selectedNode.color}44` }}>
                   <Zap size={24} style={{ color: selectedNode.color }} />
                 </div>
              </div>

              {/* Content Panel */}
              <div className="p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h5 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2" style={{ color: selectedNode.color }}>
                       {selectedNode.type} · . {selectedNode.date}
                    </h5>
                    <h3 className="text-4xl font-serif italic text-white">{selectedNode.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-lg text-white/60 leading-relaxed font-light mb-12">
                  {selectedNode.description}
                </p>

                <div className="flex gap-4">
                  <button className="flex-1 py-4 glass-panel rounded-xl text-[10px] uppercase tracking-[0.4em] font-bold text-mirror-gold hover:bg-white/5 transition-all outline-none">
                    推演平行分支
                  </button>
                  <button className="px-8 py-4 bg-white/5 rounded-xl text-[10px] uppercase tracking-[0.4em] font-bold text-white/40 hover:text-white transition-all">
                    补充记录
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
       <span className="text-[9px] uppercase tracking-widest text-white/30 font-medium">{label}</span>
    </div>
  );
}
