import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ParticleHuman, ParticleCover } from '@/components/particle'
import { useUserStore, useUIStore } from '@/stores'

const phases = [
  { text: '在黑暗中', delay: 0, duration: 2000 },
  { text: '看见自己', delay: 2000, duration: 2000 },
  { text: '每一粒灰尘都在述说', delay: 4000, duration: 2500 },
  { text: '你是谁', delay: 6500, duration: 2000 },
  { text: '曾是别人眼中的你', delay: 9000, duration: 2500 },
  { text: '还是内心深处的你', delay: 11500, duration: 2500 },
]

export function IntroPage() {
  const navigate = useNavigate()
  const { isFirstVisit, setFirstVisit } = useUserStore()
  const { setPhase } = useUIStore()
  const [currentPhase, setCurrentPhase] = useState(0)
  const [showHuman, setShowHuman] = useState(false)
  const [clarity, setClarity] = useState(0)

  useEffect(() => {
    setPhase('dark')

    const timers: ReturnType<typeof setTimeout>[] = []

    phases.forEach((phase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index)
      }, phase.delay)
      timers.push(timer)
    })

    const showHumanTimer = setTimeout(() => {
      setShowHuman(true)
    }, 8000)
    timers.push(showHumanTimer)

    const clarityTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setClarity((prev) => {
          if (prev >= 60) {
            clearInterval(interval)
            return 60
          }
          return prev + 2
        })
      }, 50)
      timers.push(interval as unknown as NodeJS.Timeout)
    }, 10000)
    timers.push(clarityTimer)

    const finishTimer = setTimeout(() => {
      if (isFirstVisit) {
        setFirstVisit(false)
        navigate('/onboarding/explore-choice')
      } else {
        navigate('/home')
      }
    }, 16000)
    timers.push(finishTimer)

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [isFirstVisit, setFirstVisit, navigate, setPhase])

  return (
    <div className="fixed inset-0 bg-bg-black flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        <ParticleCover scene="intro" particleCount={10000} />
      </div>

      {/* Human figure */}
      {showHuman && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <ParticleHuman
            clarity={clarity}
            pose="contemplative"
            particleCount={30000}
            onLoaded={() => setPhase('human')}
          />
        </motion.div>
      )}

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          {currentPhase < phases.length && (
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
              className="text-center px-6"
            >
              <p className="text-2xl md:text-4xl text-text-white font-light tracking-wide">
                {phases[currentPhase].text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 right-8 text-text-dark hover:text-text-gray transition-colors"
        onClick={() => {
          if (isFirstVisit) {
            setFirstVisit(false)
            navigate('/onboarding/explore-choice')
          } else {
            navigate('/home')
          }
        }}
      >
        跳过 →
      </motion.button>
    </div>
  )
}