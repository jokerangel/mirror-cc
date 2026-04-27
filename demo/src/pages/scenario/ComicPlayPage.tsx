import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useScenarioStore, useUIStore } from '@/stores'
import { ParticleCover } from '@/components/particle'

const sceneVisuals: Record<string, { color: string; description: string }> = {
  office: { color: '#4A5568', description: '办公室，窗外是熟悉的城市天际线' },
  street: { color: '#2D3748', description: '街道，不同方向的岔路口' },
  home: { color: '#553C9A', description: '家中，安静思考的空间' },
  sunset: { color: '#D4A574', description: '黄昏，想象中的未来' },
  meeting: { color: '#3182CE', description: '会议室，人生转折的舞台' },
  window: { color: '#4A5568', description: '窗前，眺望远方的身影' },
  night: { color: '#1A202C', description: '深夜，独处的时刻' },
}

export function ComicPlayPage() {
  const navigate = useNavigate()
  const { currentScenario, currentAct, nextAct, prevAct, setPlaying, isPlaying, completeScenario } = useScenarioStore()
  const { setPhase } = useUIStore()
  const [showBranches, setShowBranches] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const acts = currentScenario?.comic?.acts || []
  const branches = currentScenario?.comic?.branches || []
  const currentActData = acts[currentAct]

  useEffect(() => {
    setPhase('slogan')
  }, [setPhase])

  useEffect(() => {
    if (isPlaying && currentAct < acts.length - 1) {
      const timer = setTimeout(() => {
        nextAct()
      }, 4000)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentAct === acts.length - 1) {
      setPlaying(false)
      setShowBranches(true)
    }
  }, [isPlaying, currentAct, acts.length, nextAct, setPlaying])

  const handleNext = () => {
    if (currentAct < acts.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        nextAct()
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handlePrev = () => {
    if (currentAct > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        prevAct()
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleBranchSelect = (branchId: string) => {
    completeScenario()
    // In demo, just go back to scenario choice
    navigate('/scenario')
  }

  const handleSave = () => {
    completeScenario()
    navigate('/worldline')
  }

  if (!currentScenario || acts.length === 0) {
    return (
      <div className="min-h-screen bg-bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-gray mb-4">还没有推演内容</p>
          <Button onClick={() => navigate('/scenario')}>选择场景</Button>
        </div>
      </div>
    )
  }

  const sceneInfo = sceneVisuals[currentActData?.scene] || sceneVisuals.office

  return (
    <div className="min-h-screen bg-bg-black flex flex-col pt-16 pb-20 md:pb-8">
      {/* Header */}
      <header className="px-6 py-4 border-b border-bg-medium">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text-white">{currentScenario.title}</h1>
            <p className="text-sm text-text-dark mt-1">
              第 {currentAct + 1} 幕 / 共 {acts.length} 幕
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? '暂停' : '自动播放'}
            </Button>
          </div>
        </div>
      </header>

      {/* Comic display */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAct}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden"
            >
              {/* Scene background with particles */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${sceneInfo.color}33, #0A0A0A)` }}
              >
                <div className="absolute inset-0 opacity-30">
                  <ParticleCover scene={currentActData?.scene} particleCount={8000} />
                </div>
              </div>

              {/* Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center max-w-lg">
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl text-text-white leading-relaxed"
                  >
                    {currentActData?.text}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-text-dark mt-4"
                  >
                    {sceneInfo.description}
                  </motion.p>
                </div>
              </div>

              {/* Progress dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {acts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const diff = index - currentAct
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) nextAct()
                      } else if (diff < 0) {
                        for (let i = 0; i < -diff; i++) prevAct()
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentAct
                        ? 'w-6 bg-gold'
                        : index < currentAct
                        ? 'bg-gold/50'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              disabled={currentAct === 0}
            >
              ← 上一幕
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={currentAct === acts.length - 1}
            >
              下一幕 →
            </Button>
          </div>
        </div>
      </div>

      {/* Branches overlay */}
      <AnimatePresence>
        {showBranches && branches.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-black/90 flex items-center justify-center p-6 z-50"
          >
            <div className="max-w-md w-full">
              <h2 className="text-2xl font-medium text-text-white text-center mb-6">
                推演结束，接下来呢？
              </h2>
              <div className="space-y-3">
                {branches.map((branch) => (
                  <motion.button
                    key={branch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-4 bg-bg-medium rounded-xl text-left hover:bg-bg-light transition-colors"
                    onClick={() => handleBranchSelect(branch.id)}
                  >
                    <p className="text-lg font-medium text-text-white">{branch.label}</p>
                    <p className="text-sm text-text-gray mt-1">{branch.description}</p>
                  </motion.button>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowBranches(false)}>
                  返回查看
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  保存到世界线
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}