import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { ParticleHuman } from '@/components/particle'
import { useUserStore, useUIStore } from '@/stores'

export function ProfilePage() {
  const { profile, clarityTimeline, reset } = useUserStore()
  const { setPhase } = useUIStore()

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？这将清除你的画像和对话记录。')) {
      reset()
      window.location.href = '/intro'
    }
  }

  return (
    <div className="min-h-screen bg-bg-black pt-16 pb-20 md:pb-8 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="py-6">
          <h1 className="text-2xl font-medium text-text-white mb-2">我的画像</h1>
          <p className="text-text-gray">你在镜中的样子</p>
        </header>

        {/* Profile card with particle human */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card variant="glass" className="p-6 relative overflow-hidden">
            {/* Background particle */}
            <div className="absolute inset-0 opacity-30">
              <ParticleHuman
                clarity={profile?.clarity || 60}
                pose="relaxed"
                particleCount={15000}
              />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-medium text-text-white mb-2">
                    {profile?.name || '小北'}
                  </h2>
                  <p className="text-text-gray">{profile?.summary}</p>
                </div>
                <Button variant="ghost" size="sm">
                  编辑
                </Button>
              </div>

              {/* Clarity */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-gray">清晰度</span>
                  <span className="text-gold font-medium">{profile?.clarity || 60}%</span>
                </div>
                <div className="h-2 bg-bg-medium rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${profile?.clarity || 60}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-2">
                {profile?.keywords?.map((keyword) => (
                  <span
                    key={keyword.text}
                    className={`px-3 py-1 rounded-full text-sm ${
                      keyword.type === 'primary'
                        ? 'bg-gold text-bg-black'
                        : 'bg-white/10 text-text-gray'
                    }`}
                  >
                    {keyword.text}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Clarity timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-medium text-text-white mb-4">清晰度变化</h3>
          <Card className="p-4">
            <div className="h-32 flex items-end gap-2">
              {clarityTimeline.map((item, index) => (
                <div key={item.date} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className="w-full bg-gold rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${item.clarity}%` }}
                    transition={{ delay: index * 0.1 }}
                  />
                  <span className="text-xs text-text-dark mt-2">{item.date}</span>
                </div>
              ))}
              {/* Current */}
              <div className="flex-1 flex flex-col items-center">
                <motion.div
                  className="w-full bg-gold/50 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${profile?.clarity || 60}%` }}
                  transition={{ delay: 0.3 }}
                />
                <span className="text-xs text-text-dark mt-2">现在</span>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-medium text-text-white mb-4">统计数据</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-medium text-gold mb-1">12</p>
              <p className="text-sm text-text-gray">对话次数</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-medium text-gold mb-1">3</p>
              <p className="text-sm text-text-gray">推演场景</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-medium text-gold mb-1">7</p>
              <p className="text-sm text-text-gray">碎片记录</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-medium text-gold mb-1">5</p>
              <p className="text-sm text-text-gray">世界线节点</p>
            </Card>
          </div>
        </motion.section>

        {/* Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button variant="secondary" className="w-full">
            导出我的数据
          </Button>
          <Button variant="ghost" className="w-full text-red-400 hover:text-red-300">
            重新开始
          </Button>
        </motion.section>
      </div>
    </div>
  )
}