import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, ArrowLeft, Sparkles, GitBranch, AlertCircle, Link2, Layers } from 'lucide-react';
import { DeductionFlow } from './DeductionFlow';
import { cn } from '../lib/utils';
import { findNodesByTimePoint, getStoredNodes, StoredNode } from '../services/nodeStorageService';
import { ParticleHandle } from './ParticleBackground';

type ViewPhase =
  | 'landing'           // 入口页：选择分支类型
  | 'history_input'     // 历史推演：输入时间点和事项
  | 'history_relation'  // 历史推演：节点关系选择
  | 'future_input'      // 未来决策：输入决策内容
  | 'dialogue';         // 推演对话

type RelationType = 'child' | 'pre_branch' | 'parallel' | 'new';

interface DeductionSectionProps {
  onChapterChange?: (chapter: string, savedNode?: StoredNode) => void;
  particleRef?: React.RefObject<ParticleHandle | null>;
}

export function DeductionSection({ onChapterChange, particleRef }: DeductionSectionProps) {
  const [view, setView] = useState<ViewPhase>('landing');
  const [input, setInput] = useState('');
  const [timePoint, setTimePoint] = useState('');
  const [event, setEvent] = useState('');
  const [deductionType, setDeductionType] = useState<'history' | 'future'>('history');

  // 节点关系相关状态
  const [existingNodes, setExistingNodes] = useState<StoredNode[]>([]);
  const [selectedExistingNode, setSelectedExistingNode] = useState<StoredNode | null>(null);
  const [relationType, setRelationType] = useState<RelationType>('new');
  const [allNodes, setAllNodes] = useState<StoredNode[]>([]);

  // 加载已有节点
  useEffect(() => {
    const nodes = getStoredNodes();
    setAllNodes(nodes);
  }, []);

  // 选择推演类型
  const handleSelectType = (type: 'history' | 'future') => {
    setDeductionType(type);
    if (type === 'history') {
      setView('history_input');
    } else {
      setView('future_input');
    }
  };

  // 历史推演：输入后检查节点关系
  const handleHistoryInputNext = () => {
    if (!timePoint.trim() || !event.trim()) return;

    // 检查是否有相关节点
    const relatedNodes = findNodesByTimePoint(timePoint);
    if (relatedNodes.length > 0) {
      setExistingNodes(relatedNodes);
      setView('history_relation');
    } else {
      // 没有相关节点，直接进入推演
      setView('dialogue');
    }
  };

  // 选择节点关系后进入推演
  const handleRelationSelect = () => {
    // 直接进入推演，关系信息通过 relationType 状态传递
    setView('dialogue');
  };

  // 未来决策：直接进入推演
  const handleFutureInputNext = () => {
    if (!input.trim()) return;
    setView('dialogue');
  };

  // 返回上一级
  const handleBack = () => {
    switch (view) {
      case 'history_input':
      case 'future_input':
        setView('landing');
        setTimePoint('');
        setEvent('');
        setInput('');
        break;
      case 'history_relation':
        setView('history_input');
        setSelectedExistingNode(null);
        setRelationType('new');
        break;
      case 'dialogue':
        setView('landing');
        setInput('');
        setTimePoint('');
        setEvent('');
        setExistingNodes([]);
        setSelectedExistingNode(null);
        break;
      default:
        setView('landing');
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ===== 入口页：选择分支类型 ===== */}
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 md:px-8"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-mirror-accent/80 text-xs tracking-[0.3em] uppercase mb-2"
              >
                Parallel Reality
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-serif italic text-white"
              >
                你想推演哪一种可能？
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 mt-2 max-w-lg mx-auto text-xs md:text-sm"
              >
                平行推演基于你的记忆和选择，展开不同时间线上的可能性。
              </motion.p>
            </div>

            {/* 选择卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4 max-w-3xl w-full"
            >
              <button
                onClick={() => handleSelectType('history')}
                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-gold/30 transition-all text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-gold mb-4">
                    <Clock size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-display text-white mb-2">如果当初...</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">
                    回到过去的关键节点，探索另一种选择。
                  </p>
                  <div className="text-[10px] text-white/30">
                    那些你没走的路
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectType('future')}
                className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-mirror-accent/30 transition-all text-left overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-mirror-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-mirror-accent mb-4">
                    <MapPin size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-display text-white mb-2">如果未来...</h3>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">
                    面对当下的决策，剖析每条路的走向。
                  </p>
                  <div className="text-[10px] text-white/30">
                    让思绪先行一步
                  </div>
                </div>
              </button>
            </motion.div>

            {/* 最近推演 */}
            {allNodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 w-full max-w-3xl"
              >
                <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1">
                  <GitBranch size={10} />
                  最近的推演路径
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allNodes.slice(0, 5).map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setTimePoint(node.scenario.timePoint);
                        setEvent(node.scenario.title);
                        setDeductionType('history');
                        setView('dialogue');
                      }}
                      className="shrink-0 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/30 transition-colors text-left group"
                    >
                      <div className="text-[10px] text-white/30 mb-1">{node.scenario.timePoint}</div>
                      <div className="text-sm text-white/70 group-hover:text-white transition-colors">{node.scenario.title}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===== 历史推演：输入时间点和事项 ===== */}
        {view === 'history_input' && (
          <motion.div
            key="history_input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 可滚动内容区域 */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6">
              <div className="max-w-xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  <span className="text-xs">返回</span>
                </button>

                <div className="mb-5">
                  <div className="text-mirror-gold text-xs tracking-wider uppercase mb-1">历史推演</div>
                  <h2 className="text-xl md:text-2xl font-serif italic text-white">那个重要的时刻是？</h2>
                  <p className="text-white/40 mt-2 text-xs">告诉我们时间点和当时面临的选择。</p>
                </div>

                <div className="space-y-4">
                  {/* 时间点输入 */}
                  <div>
                    <label className="text-[10px] text-white/50 mb-1.5 block">时间点</label>
                    <input
                      type="text"
                      placeholder="如：2023年、去年、三年前"
                      className="w-full bg-white/[0.03] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-mirror-gold/30 transition-colors placeholder:text-white/20"
                      value={timePoint}
                      onChange={(e) => setTimePoint(e.target.value)}
                    />
                  </div>

                  {/* 事件描述 */}
                  <div>
                    <label className="text-[10px] text-white/50 mb-1.5 block">发生了什么？</label>
                    <textarea
                      placeholder="描述当时的选择或事件，如：我在考虑要不要辞职"
                      className="w-full h-24 bg-white/[0.03] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-mirror-gold/30 resize-none transition-colors placeholder:text-white/20"
                      value={event}
                      onChange={(e) => setEvent(e.target.value)}
                    />
                  </div>

                  {/* 快捷选项 */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['辞职', '换工作', '搬家', '创业'].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setEvent(prev => prev ? `${prev}、${hint}` : hint)}
                        className="px-2.5 py-1 rounded-full text-[10px] bg-white/[0.03] text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                      >
                        + {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 固定底部按钮 */}
            <div className="shrink-0 px-4 md:px-8 py-4 border-t border-white/5 bg-gradient-to-t from-mirror-deep via-mirror-deep/98 to-transparent">
              <div className="max-w-xl mx-auto flex justify-center">
                <button
                  onClick={handleHistoryInputNext}
                  disabled={!timePoint.trim() || !event.trim()}
                  className="px-8 py-3 bg-mirror-gold text-mirror-deep text-sm font-medium rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  继续
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== 历史推演：节点关系选择 ===== */}
        {view === 'history_relation' && (
          <motion.div
            key="history_relation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 可滚动内容区域 */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6">
              <div className="max-w-xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft size={14} />
                  <span className="text-xs">返回</span>
                </button>

                <div className="mb-4">
                  <div className="text-mirror-gold text-xs tracking-wider uppercase mb-1">发现相关节点</div>
                  <h2 className="text-lg md:text-xl font-serif italic text-white">
                    这个推演和之前的有关联吗？
                  </h2>
                  <p className="text-white/40 mt-2 text-xs">
                    你在 {timePoint} 已经有推演记录，请选择这次推演与它们的关系。
                  </p>
                </div>

                {/* 已有节点列表 */}
                <div className="mb-4 space-y-2">
                  {existingNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedExistingNode(node)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        selectedExistingNode?.id === node.id
                          ? "bg-mirror-gold/10 border-mirror-gold/30"
                          : "bg-white/[0.02] border-white/10 hover:border-white/30"
                      )}
                    >
                      <div className="text-[10px] text-white/40 mb-0.5">{node.scenario.timePoint}</div>
                      <div className="text-sm text-white/80">{node.summary}</div>
                    </button>
                  ))}
                </div>

                {/* 关系类型选择 */}
                <div className="space-y-2 pb-4">
                  <div className="text-[10px] text-white/50 mb-2">选择节点关系：</div>

                  <button
                    onClick={() => setRelationType('new')}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                      relationType === 'new'
                        ? "bg-white/[0.05] border-white/30"
                        : "bg-white/[0.02] border-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="text-mirror-gold mt-0.5"><Sparkles size={16} /></div>
                    <div>
                      <div className="text-sm text-white font-medium">创建新节点</div>
                      <div className="text-[10px] text-white/40 mt-0.5">与已有节点独立，开启全新的推演路径</div>
                    </div>
                  </button>

                  {selectedExistingNode && (
                    <>
                      <button
                        onClick={() => setRelationType('child')}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                          relationType === 'child'
                            ? "bg-mirror-gold/10 border-mirror-gold/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="text-mirror-gold mt-0.5"><Link2 size={16} /></div>
                        <div>
                          <div className="text-sm text-white font-medium">子节点分叉</div>
                          <div className="text-[10px] text-white/40 mt-0.5">从这个节点延伸，推演后续发展</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setRelationType('pre_branch')}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                          relationType === 'pre_branch'
                            ? "bg-mirror-gold/10 border-mirror-gold/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="text-mirror-gold mt-0.5"><AlertCircle size={16} /></div>
                        <div>
                          <div className="text-sm text-white font-medium">前序分叉</div>
                          <div className="text-[10px] text-white/40 mt-0.5">在这个节点之前分叉，推演"如果当初没这样做"</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setRelationType('parallel')}
                        className={cn(
                          "w-full p-3 rounded-lg border text-left transition-all flex items-start gap-3",
                          relationType === 'parallel'
                            ? "bg-mirror-gold/10 border-mirror-gold/30"
                            : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="text-mirror-gold mt-0.5"><Layers size={16} /></div>
                        <div>
                          <div className="text-sm text-white font-medium">并行节点</div>
                          <div className="text-[10px] text-white/40 mt-0.5">同一时期的不同事件，独立但平行的推演</div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 固定底部按钮 */}
            <div className="shrink-0 px-4 md:px-8 py-4 border-t border-white/5 bg-gradient-to-t from-mirror-deep via-mirror-deep/98 to-transparent">
              <div className="max-w-xl mx-auto flex justify-center">
                <button
                  onClick={handleRelationSelect}
                  disabled={!relationType || (relationType !== 'new' && !selectedExistingNode)}
                  className="px-8 py-3 bg-mirror-gold text-mirror-deep text-sm font-medium rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  开始推演
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== 未来决策：输入决策内容 ===== */}
        {view === 'future_input' && (
          <motion.div
            key="future_input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 flex flex-col"
          >
            {/* 可滚动内容区域 */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6">
              <div className="max-w-xl mx-auto">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-white/40 hover:text-white transition-colors mb-5"
                >
                  <ArrowLeft size={14} />
                  <span className="text-xs">返回</span>
                </button>

                <div className="mb-5">
                  <div className="text-mirror-accent text-xs tracking-wider uppercase mb-1">未来决策</div>
                  <h2 className="text-xl md:text-2xl font-serif italic text-white">你在考虑什么决定？</h2>
                  <p className="text-white/40 mt-2 text-xs">描述你正面临的选择，让我们帮你剖析每条路的可能走向。</p>
                </div>

                <div className="space-y-3">
                  <textarea
                    placeholder="如：我在考虑要不要接受一个新的工作机会，薪资更高但需要去外地..."
                    className="w-full h-32 bg-white/[0.03] border border-white/10 p-3 rounded-xl text-sm text-white outline-none focus:border-mirror-accent/30 resize-none transition-colors placeholder:text-white/20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />

                  {/* 快捷场景 */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['跳槽', '创业', '搬家', '进修'].map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setInput(prev => prev ? `${prev}\n\n场景：${hint}` : `我在考虑${hint}相关的事`)}
                        className="px-2.5 py-1 rounded-full text-[10px] bg-white/[0.03] text-white/50 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                      >
                        + {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 固定底部按钮 */}
            <div className="shrink-0 px-4 md:px-8 py-4 border-t border-white/5 bg-gradient-to-t from-mirror-deep via-mirror-deep/98 to-transparent">
              <div className="max-w-xl mx-auto flex justify-center">
                <button
                  onClick={handleFutureInputNext}
                  disabled={!input.trim()}
                  className="px-8 py-3 bg-mirror-accent text-mirror-deep text-sm font-medium rounded-full hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  开始分析
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== 推演生成流程 ===== */}
        {view === 'dialogue' && (
          <motion.div
            key="dialogue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <DeductionFlow
              timePoint={deductionType === 'history' ? timePoint : '当下'}
              event={deductionType === 'history' ? event : input}
              type={deductionType}
              relationType={relationType === 'new' ? undefined : relationType}
              existingNodeTitle={selectedExistingNode?.summary}
              onBack={handleBack}
              onComplete={() => {
                // 保存节点后返回
                setView('landing');
                setInput('');
                setTimePoint('');
                setEvent('');
                setExistingNodes([]);
                setSelectedExistingNode(null);
                // 刷新节点列表
                setAllNodes(getStoredNodes());
              }}
              onChapterChange={onChapterChange}
              particleRef={particleRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}