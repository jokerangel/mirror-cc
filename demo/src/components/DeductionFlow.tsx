import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Clock, Sparkles, GitBranch, Image, BookOpen, CheckCircle, Loader2, Lock, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  StoryNode,
  GenerationPhase,
  buildOriginNode,
  planDeductionPath,
  generateStory,
  generateManga,
  Choice
} from '../services/deductionService';
import { saveNode, generateNodeSummary, StoredNode } from '../services/nodeStorageService';
import { ParticleHandle } from './ParticleBackground';

interface DeductionFlowProps {
  timePoint: string;
  event: string;
  type: 'history' | 'future';
  relationType?: string;
  existingNodeTitle?: string;
  onBack: () => void;
  onComplete: () => void;
  onChapterChange?: (chapter: string, savedNode?: StoredNode) => void;
  particleRef?: React.RefObject<ParticleHandle | null>;
}

export const DeductionFlow: React.FC<DeductionFlowProps> = ({
  timePoint,
  event,
  type,
  relationType,
  existingNodeTitle,
  onBack,
  onComplete,
  onChapterChange,
  particleRef
}) => {
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [feedbackLogs, setFeedbackLogs] = useState<string[]>([]);
  const [_nodeHistory, setNodeHistory] = useState<StoryNode[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPremium] = useState(false); // TODO: 从用户状态获取
  const hasRunRef = useRef(false);

  // 保存到世界线并切换视图
  const handleSaveToWorldline = async () => {
    if (isSaving || !currentNode) return;

    setIsSaving(true);

    // 保存节点
    const summary = generateNodeSummary(currentNode);
    const savedNode = saveNode(currentNode, summary);

    // 触发粒子动画
    particleRef?.current?.morphTo('aggregate');

    // 等待动画完成后切换到世界线视图
    setTimeout(() => {
      onChapterChange?.('world', savedNode);
      onComplete();
    }, 1500);
  };

  // 添加反馈日志
  const addFeedback = (msg: string) => {
    setFeedbackLogs(prev => [...prev, msg]);
  };

  // Phase 1: 起源节点构建
  const runPhase1 = async (): Promise<StoryNode> => {
    setPhase('origin');
    setFeedbackLogs([]);

    await delay(300);
    const input = `${timePoint}，${event}`;
    const { node, feedback } = buildOriginNode(input, type);

    for (const msg of feedback) {
      await delay(400);
      addFeedback(msg);
    }

    setCurrentNode(node);
    setNodeHistory([node]);
    await delay(800);
    return node;
  };

  // Phase 2: 推演路径规划
  const runPhase2 = async (node: StoryNode): Promise<StoryNode> => {
    setPhase('planning');

    await delay(300);
    const { node: updatedNode, feedback } = planDeductionPath(node, type);

    for (const msg of feedback) {
      await delay(400);
      addFeedback(msg);
    }

    setCurrentNode(updatedNode);
    setNodeHistory(prev => [updatedNode, ...prev.slice(1)]);
    await delay(800);
    return updatedNode;
  };

  // Phase 3: 故事生成
  const runPhase3 = async (node: StoryNode): Promise<StoryNode> => {
    setPhase('story');

    await delay(300);
    const { node: updatedNode, feedback } = generateStory(node, type);

    for (const msg of feedback) {
      await delay(400);
      addFeedback(msg);
    }

    setCurrentNode(updatedNode);
    setNodeHistory(prev => [updatedNode, ...prev.slice(1)]);
    await delay(800);
    return updatedNode;
  };

  // Phase 4: 漫画生成
  const runPhase4 = async (node: StoryNode) => {
    setPhase('manga');

    await delay(300);
    const { node: updatedNode, feedback } = generateManga(node);

    for (const msg of feedback) {
      await delay(400);
      addFeedback(msg);
    }

    setCurrentNode(updatedNode);
    setNodeHistory(prev => [updatedNode, ...prev.slice(1)]);
    await delay(500);
    setPhase('complete');
  };

  // 延迟函数
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 启动生成流程
  useEffect(() => {
    // 防止React StrictMode下重复执行
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const runGeneration = async () => {
      const node1 = await runPhase1();
      const node2 = await runPhase2(node1);
      const node3 = await runPhase3(node2);
      await runPhase4(node3);
    };
    runGeneration();
  }, []);

  // 选择分支（记录选择，不自动生成下一节点）
  const handleSelectChoice = (choice: Choice) => {
    setSelectedChoice(choice);
  };

  return (
    <div className="flex h-full w-full gap-4 p-4 md:gap-6 md:p-6">
      {/* 左侧：进度面板 */}
      <div className="hidden md:flex w-56 flex-col rounded-2xl bg-white/[0.02] border border-white/10 p-4 overflow-hidden">
        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-4">生成进度</div>

        {/* Phase 进度 */}
        <div className="space-y-3 mb-6">
          {[
            { id: 'origin', name: '节点构建', icon: GitBranch },
            { id: 'planning', name: '路径规划', icon: Clock },
            { id: 'story', name: '故事生成', icon: BookOpen },
            { id: 'manga', name: '漫画渲染', icon: Image }
          ].map(({ id, name, icon: Icon }) => (
            <div
              key={id}
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                phase === id ? "text-mirror-gold" :
                ['planning', 'story', 'manga', 'complete'].indexOf(phase) > ['origin', 'planning', 'story', 'manga'].indexOf(id as GenerationPhase)
                  ? "text-white/40"
                  : "text-white/20"
              )}
            >
              {phase === id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : ['planning', 'story', 'manga', 'complete'].indexOf(phase) > ['origin', 'planning', 'story', 'manga'].indexOf(id as GenerationPhase) ? (
                <CheckCircle size={14} />
              ) : (
                <Icon size={14} />
              )}
              <span>{name}</span>
            </div>
          ))}
        </div>

        {/* 反馈日志 */}
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">处理日志</div>
          <div className="space-y-1.5 overflow-y-auto no-scrollbar h-full">
            <AnimatePresence>
              {feedbackLogs.map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[11px] text-white/50"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 右侧：主内容区 */}
      <div className="flex-1 flex flex-col bg-mirror-glass rounded-2xl border border-white/10 overflow-hidden">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">返回</span>
          </button>

          <div className="flex items-center gap-2 text-white/30">
            <GitBranch size={14} />
            <span className="text-[11px] uppercase tracking-wider">
              {type === 'history' ? '历史推演' : '未来决策'}
            </span>
          </div>

          <div className="text-xs text-white/30">
            {relationType === 'child' && `子节点 · ${existingNodeTitle}`}
            {relationType === 'pre_branch' && `前序分叉 · ${existingNodeTitle}`}
            {relationType === 'parallel' && `并行节点 · ${existingNodeTitle}`}
            {!relationType && '新推演'}
          </div>
        </div>

        {/* 主内容 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 flex flex-col">
          <AnimatePresence mode="wait">
            {/* 加载阶段 */}
            {phase !== 'complete' && phase !== 'idle' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full"
              >
                {/* 当前阶段标题 */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-mirror-gold/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    {phase === 'origin' && <GitBranch size={28} className="text-mirror-gold" />}
                    {phase === 'planning' && <Clock size={28} className="text-mirror-gold" />}
                    {phase === 'story' && <BookOpen size={28} className="text-mirror-gold" />}
                    {phase === 'manga' && <Image size={28} className="text-mirror-gold" />}
                  </div>
                  <h2 className="text-xl text-white mb-2">
                    {phase === 'origin' && '构建起源节点...'}
                    {phase === 'planning' && '规划推演路径...'}
                    {phase === 'story' && '生成推演故事...'}
                    {phase === 'manga' && '渲染动态漫画...'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {phase === 'origin' && '提取关键信息，构建推演起点'}
                    {phase === 'planning' && '设计时间线和分支选择点'}
                    {phase === 'story' && '基于画像生成叙事内容'}
                    {phase === 'manga' && '生成分镜和视觉呈现'}
                  </p>
                </div>

                {/* 显示已生成的节点信息 */}
                {currentNode && (
                  <div className="space-y-4">
                    {/* Phase 1 结果 */}
                    {currentNode.originInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-mirror-gold/60 mb-3">起源节点</div>
                        <div className="space-y-2 text-sm text-white/70">
                          <div>时间点：<span className="text-white">{currentNode.originInfo.extractedTime}</span></div>
                          <div>关键事件：<span className="text-white">{currentNode.originInfo.extractedEvent}</span></div>
                          <div>情境：<span className="text-white/60">{currentNode.originInfo.situationContext}</span></div>
                        </div>
                      </motion.div>
                    )}

                    {/* Phase 2 结果 */}
                    {currentNode.pathPlan && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-mirror-gold/60 mb-3">推演路径</div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {currentNode.pathPlan.timeline.map((t, idx) => (
                            <div key={idx} className="shrink-0 flex items-center gap-2">
                              <div className={cn(
                                "px-3 py-1.5 rounded-lg text-xs",
                                t.type === 'milestone' ? "bg-mirror-gold/20 text-mirror-gold" :
                                t.type === 'branch' ? "bg-white/10 text-white/60" :
                                "bg-emerald-500/20 text-emerald-400"
                              )}>
                                {t.time}
                              </div>
                              {idx < currentNode.pathPlan!.timeline.length - 1 && (
                                <div className="w-4 h-px bg-white/20" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-white/40 mt-2">
                          预计 {currentNode.pathPlan.estimatedNodes} 个节点，推演 {currentNode.pathPlan.totalDuration}
                        </div>
                      </motion.div>
                    )}

                    {/* Phase 3 结果 */}
                    {currentNode.story && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-mirror-gold/60 mb-3">故事内容</div>
                        <div className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                          {currentNode.story.narrative}
                        </div>
                        {currentNode.story.facts.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="text-[10px] text-white/30 mb-2">背景数据</div>
                            <div className="space-y-1">
                              {currentNode.story.facts.map((fact, idx) => (
                                <div key={idx} className="text-xs text-white/50">· {fact}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Phase 4 结果 */}
                    {currentNode.manga && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-mirror-gold/60 mb-3">
                          动态漫画 · {currentNode.manga.visualStyle}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {currentNode.manga.panels.map((panel, idx) => (
                            <div
                              key={panel.id}
                              className="aspect-video bg-white/[0.03] rounded-lg border border-white/5 flex items-center justify-center p-2 text-center"
                            >
                              <div className="text-[10px] text-white/30">
                                <div className="mb-1">第{idx + 1}帧</div>
                                <div className="text-white/50 text-[9px]">{panel.caption}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 移动端日志 */}
                <div className="md:hidden mt-6">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">处理日志</div>
                  <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                    {feedbackLogs.slice(-3).map((log, idx) => (
                      <div key={idx} className="text-[11px] text-white/40">{log}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 完成/选择阶段 */}
            {phase === 'complete' && currentNode && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col max-w-2xl mx-auto w-full"
              >
                {/* 最终故事 */}
                {currentNode.story && (
                  <div className="mb-8">
                    <div className="text-lg text-white/90 leading-relaxed whitespace-pre-line">
                      {currentNode.story.narrative}
                    </div>
                    {currentNode.manga && (
                      <div className="mt-6 grid grid-cols-4 gap-2">
                        {currentNode.manga.panels.map((panel) => (
                          <div
                            key={panel.id}
                            className="aspect-square bg-white/[0.03] rounded-lg border border-white/5 flex items-center justify-center p-1 text-center"
                          >
                            <div className="text-[9px] text-white/30">{panel.caption}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {currentNode.story.facts.length > 0 && (
                      <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">背景数据</div>
                        <div className="space-y-1">
                          {currentNode.story.facts.map((fact, idx) => (
                            <div key={idx} className="text-xs text-white/50">· {fact}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 保存到世界线 */}
                {!isSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl border border-mirror-gold/20 bg-mirror-gold/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/90 font-medium">将此推演保存到世界线</div>
                        <div className="text-xs text-white/40 mt-1">
                          {currentNode.scenario.timePoint} · {currentNode.scenario.title}
                        </div>
                      </div>
                      <button
                        onClick={handleSaveToWorldline}
                        disabled={isSaving}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                          isSaving
                            ? "bg-white/10 text-white/40 cursor-wait"
                            : "bg-mirror-gold text-mirror-deep hover:bg-white"
                        )}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            保存
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
                  >
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400">已保存到世界线</span>
                  </motion.div>
                )}

                {/* 分支选择 */}
                {currentNode.choices && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white/60 text-sm">接下来会发生什么？</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider">
                        {currentNode.choices.length} 条可能的时间线
                      </div>
                    </div>
                    <div className="space-y-3">
                      {currentNode.choices.map((choice, idx) => {
                        const isLocked = idx > 0 && !isPremium;
                        return (
                          <motion.div
                            key={choice.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <button
                              onClick={() => !isLocked && handleSelectChoice(choice)}
                              disabled={isLocked}
                              className={cn(
                                "w-full p-5 rounded-xl border text-left transition-all group relative",
                                isLocked
                                  ? "bg-white/[0.01] border-white/5 cursor-not-allowed"
                                  : selectedChoice?.id === choice.id
                                    ? "bg-mirror-gold/10 border-mirror-gold/30"
                                    : "bg-white/[0.02] border-white/10 hover:border-white/30"
                              )}
                            >
                              {isLocked && (
                                <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-mirror-gold/20 border border-mirror-gold/30">
                                    <Lock size={14} className="text-mirror-gold" />
                                    <span className="text-sm text-mirror-gold font-medium">
                                      解锁更多分支
                                    </span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className={cn(
                                    "font-medium transition-colors",
                                    isLocked ? "text-white/30" : "text-white group-hover:text-mirror-gold"
                                  )}>
                                    {choice.label}
                                  </div>
                                  <div className={cn(
                                    "text-sm mt-1",
                                    isLocked ? "text-white/20" : "text-white/40"
                                  )}>
                                    {choice.preview}
                                  </div>
                                </div>
                                {!isLocked && idx === 0 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-mirror-gold/20 text-mirror-gold">
                                    免费
                                  </span>
                                )}
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* 升级提示 */}
                    {!isPremium && currentNode.choices.length > 1 && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-mirror-gold/10 to-transparent border border-mirror-gold/20">
                        <div className="flex items-center gap-3">
                          <Sparkles size={20} className="text-mirror-gold" />
                          <div className="flex-1">
                            <div className="text-white/90 text-sm font-medium">
                              解锁全部 {currentNode.choices.length} 条时间线
                            </div>
                            <div className="text-white/40 text-xs mt-0.5">
                              成为会员，探索每一条平行人生的可能性
                            </div>
                          </div>
                          <button className="px-4 py-2 rounded-lg bg-mirror-gold text-mirror-deep text-sm font-medium hover:bg-white transition-colors">
                            升级会员
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 自定义输入 */}
                    {selectedChoice && (selectedChoice.id.includes('_c') || selectedChoice.label.includes('想法') || selectedChoice.label.includes('其他')) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                      >
                        <textarea
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="描述你的想法..."
                          className="w-full h-24 bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 outline-none focus:border-mirror-gold/30 resize-none"
                        />
                        <button
                          disabled={!customInput.trim()}
                          className="mt-3 w-full px-6 py-3 rounded-xl bg-mirror-gold text-mirror-deep font-medium hover:bg-white transition-colors disabled:opacity-30"
                        >
                          继续推演
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 结局节点 */}
                {currentNode.nodeType === 'ending' && (
                  <div className="mt-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-mirror-gold/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={24} className="text-mirror-gold" />
                    </div>
                    <h3 className="text-xl text-white mb-2">推演完成</h3>
                    <p className="text-white/40 text-sm mb-6">这个结局是众多可能性之一</p>
                    <button
                      onClick={onComplete}
                      className="px-6 py-3 rounded-xl bg-mirror-gold text-mirror-deep font-medium hover:bg-white transition-colors"
                    >
                      返回世界线
                    </button>
                  </div>
                )}

                {/* 底部操作 */}
                {currentNode.nodeType !== 'ending' && !selectedChoice && (
                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                    <button
                      onClick={onComplete}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      暂时返回，稍后继续
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};