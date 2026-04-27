import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { useUIStore } from '@/stores'

const exploreOptions = [
  {
    id: 'depth',
    title: '深度探索',
    description: '通过一系列问题，逐步了解你的内心',
    icon: '◎',
    time: '约15分钟',
  },
  {
    id: 'quick',
    title: '快速开始',
    description: '回答几个核心问题，快速建立画像',
    icon: '◉',
    time: '约5分钟',
  },
  {
    id: 'skip',
    title: '稍后再说',
    description: '先看看镜中是什么样子',
    icon: '○',
    time: '跳过引导',
  },
]

export function ExploreChoicePage() {
  const navigate = useNavigate()
  const { setPhase } = useUIStore()
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSelected(id)
  }

  const handleContinue = () => {
    if (!selected) return

    switch (selected) {
      case 'depth':
        navigate('/onboarding/explore-quick?mode=depth')
        break
      case 'quick':
        navigate('/onboarding/explore-quick')
        break
      case 'skip':
        navigate('/onboarding/profile-result')
        break
    }
  }

  return (
    <div className="min-h-screen bg-bg-black flex flex-col">
      {/* Header */}
      <div className="pt-20 pb-8 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-medium text-text-white mb-4"
        >
          你想怎样开始探索?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-gray"
        >
          选择适合你的方式来认识自己
        </motion.p>
      </div>

      {/* Options */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-md mx-auto space-y-4">
          {exploreOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card
                hover
                className={`p-5 cursor-pointer transition-all ${
                  selected === option.id
                    ? 'border-gold bg-gold/5'
                    : ''
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl text-gold">{option.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-text-white">
                        {option.title}
                      </h3>
                      <span className="text-sm text-text-dark">{option.time}</span>
                    </div>
                    <p className="text-sm text-text-gray">{option.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-black via-bg-black to-transparent">
        <div className="max-w-md mx-auto">
          <Button
            className="w-full"
            disabled={!selected}
            onClick={handleContinue}
          >
            继续
          </Button>
        </div>
      </div>
    </div>
  )
}