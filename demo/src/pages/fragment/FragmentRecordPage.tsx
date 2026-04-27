import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { useUIStore } from '@/stores'

const fragmentTypes = [
  { id: 'thought', label: '想法', icon: '💭', placeholder: '今天有一个想法冒出来...' },
  { id: 'dream', label: '梦境', icon: '🌙', placeholder: '昨晚做了一个梦...' },
  { id: 'moment', label: '瞬间', icon: '✨', placeholder: '有一个瞬间让我停下了...' },
  { id: 'question', label: '疑问', icon: '❓', placeholder: '我一直在想...' },
]

const mockFragments = [
  { id: '1', type: 'thought', content: '突然意识到我在做的选择都是别人期望的', date: '2026-04-25' },
  { id: '2', type: 'dream', content: '梦见自己站在两条路的分岔口，醒了还是很纠结', date: '2026-04-24' },
  { id: '3', type: 'moment', content: '看到路边的小花开了，想到我也该有些变化', date: '2026-04-23' },
]

export function FragmentRecordPage() {
  const { setPhase } = useUIStore()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedType, setSelectedType] = useState(fragmentTypes[0])
  const [content, setContent] = useState('')

  const handleCreateFragment = () => {
    if (!content.trim()) return
    // In demo, just close the form
    setIsCreating(false)
    setContent('')
  }

  return (
    <div className="min-h-screen bg-bg-black pt-16 pb-20 md:pb-8 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="py-6">
          <h1 className="text-2xl font-medium text-text-white mb-2">碎片记录</h1>
          <p className="text-text-gray">记录生活中的点点滴滴</p>
        </header>

        {/* Create new fragment */}
        {!isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button onClick={() => setIsCreating(true)} className="w-full md:w-auto">
              + 记录新的碎片
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card variant="glass" className="p-5">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {fragmentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedType.id === type.id
                        ? 'bg-gold text-bg-black'
                        : 'bg-bg-medium text-text-gray hover:bg-bg-light'
                    }`}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={selectedType.placeholder}
                className="w-full h-32 bg-bg-dark border border-bg-medium rounded-lg p-4 text-text-white placeholder:text-text-dark resize-none focus:outline-none focus:border-gold/50 transition-colors"
              />

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateFragment} disabled={!content.trim()}>
                  保存
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Fragment list */}
        <section>
          <h2 className="text-lg font-medium text-text-white mb-4">最近的碎片</h2>
          <div className="space-y-3">
            {mockFragments.map((fragment, index) => (
              <motion.div
                key={fragment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {fragmentTypes.find((t) => t.id === fragment.type)?.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-white text-sm leading-relaxed">
                        {fragment.content}
                      </p>
                      <p className="text-text-dark text-xs mt-2">{fragment.date}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}