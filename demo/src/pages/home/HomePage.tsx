import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { ParticleHuman } from '@/components/particle'
import { useUserStore, useUIStore } from '@/stores'

const chapters = [
  { path: '/self-explore', title: '自我探索', icon: '◈', description: '通过对话了解自己' },
  { path: '/fragment', title: '碎片记录', icon: '◇', description: '记录生活的点滴' },
  { path: '/scenario', title: '平行推演', icon: '∮', description: '探索另一种可能' },
  { path: '/worldline', title: '世界线', icon: '∞', description: '看见人生的轨迹' },
]

export function HomePage() {
  const { profile } = useUserStore()
  const { setPhase } = useUIStore()

  useEffect(() => {
    setPhase('light')
  }, [setPhase])

  return (
    <div className="min-h-screen bg-bg-black pt-16 md:pt-20 pb-20 md:pb-8">
      {/* Hero section */}
      <section className="relative px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="order-2 md:order-1"
            >
              <h1 className="text-3xl md:text-4xl font-medium text-text-white mb-4">
                你好，{profile?.name || '小北'}
              </h1>
              <p className="text-text-gray mb-6">{profile?.summary}</p>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm text-text-dark">清晰度</span>
                <div className="flex-1 h-2 bg-bg-medium rounded-full overflow-hidden max-w-[200px]">
                  <motion.div
                    className="h-full bg-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile?.clarity || 60}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </div>
                <span className="text-gold text-sm">{profile?.clarity || 60}%</span>
              </div>

              {profile?.hook && (
                <Card variant="glass" className="p-4">
                  <p className="text-sm text-text-dark mb-1">今日发现</p>
                  <p className="text-text-white">{profile.hook.text}</p>
                  <button className="mt-3 text-gold text-sm hover:underline">
                    {profile.hook.action} →
                  </button>
                </Card>
              )}
            </motion.div>

            {/* Particle human */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="order-1 md:order-2 h-[300px] md:h-[400px]"
            >
              <ParticleHuman
                clarity={profile?.clarity || 60}
                pose={profile?.personality || 'contemplative'}
                particleCount={20000}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-medium text-text-white mb-4">探索章节</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link to={chapter.path}>
                  <Card hover className="p-4 h-full">
                    <span className="text-3xl text-gold mb-3 block">{chapter.icon}</span>
                    <h3 className="text-lg font-medium text-text-white mb-1">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-text-dark">{chapter.description}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-medium text-text-white mb-4">最近对话</h2>
          <Card variant="glass" className="p-4">
            <p className="text-text-gray text-center py-8">
              还没有对话记录，开始探索吧
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}