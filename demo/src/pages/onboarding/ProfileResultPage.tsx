import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { ParticleHuman } from '@/components/particle'
import { useUserStore, useUIStore } from '@/stores'

export function ProfileResultPage() {
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const { setPhase } = useUIStore()
  const [clarity, setClarity] = useState(0)

  useEffect(() => {
    setPhase('human')

    const interval = setInterval(() => {
      setClarity((prev) => {
        if (prev >= 60) {
          clearInterval(interval)
          return 60
        }
        return prev + 3
      })
    }, 50)

    return () => clearInterval(interval)
  }, [setPhase])

  const handleStart = () => {
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-bg-black flex flex-col">
      {/* Particle human */}
      <div className="absolute inset-0 opacity-60">
        <ParticleHuman clarity={clarity} pose="relaxed" particleCount={25000} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-medium text-text-white mb-2">
            你的镜中影像
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-text-gray">清晰度</span>
            <span className="text-gold text-lg">{clarity}%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-md"
        >
          <Card variant="glass" className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-medium text-gold mb-2">
                {profile?.name || '小北'}
              </h2>
              <p className="text-text-gray text-sm">{profile?.summary}</p>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {profile?.keywords?.map((keyword, index) => (
                <motion.span
                  key={keyword.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    keyword.type === 'primary'
                      ? 'bg-gold/20 text-gold'
                      : 'bg-white/10 text-text-gray'
                  }`}
                >
                  {keyword.text}
                </motion.span>
              ))}
            </div>

            {/* Hook */}
            {profile?.hook && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="border-t border-white/10 pt-4"
              >
                <p className="text-sm text-text-dark mb-1">今日发现</p>
                <p className="text-text-white">{profile.hook.text}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 text-center"
        >
          <p className="text-text-dark text-sm mb-4">
            通过持续对话，你的影像会更加清晰
          </p>
          <Button onClick={handleStart}>开始探索</Button>
        </motion.div>
      </div>
    </div>
  )
}