import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, Card } from '@/components/ui'
import { useUserStore, useScenarioStore, useUIStore } from '@/stores'

const scenarioTemplates = [
  {
    id: 'career',
    title: '如果当初没有辞职',
    type: 'history' as const,
    timestamp: '2022-03',
    description: '探索另一条职业道路',
  },
  {
    id: 'relationship',
    title: '如果当时在一起了',
    type: 'history' as const,
    timestamp: '2021-06',
    description: '重温那段未开始的关系',
  },
  {
    id: 'education',
    title: '如果选择了另一所学校',
    type: 'history' as const,
    timestamp: '2018-09',
    description: '看看不同的人生起点',
  },
  {
    id: 'future-career',
    title: '如果我决定创业',
    type: 'future' as const,
    description: '推演未来的可能性',
  },
  {
    id: 'future-city',
    title: '如果我搬去另一个城市',
    type: 'future' as const,
    description: '想象不同的生活场景',
  },
  {
    id: 'custom',
    title: '自定义推演',
    type: 'history' as const,
    custom: true,
    description: '创建你想要的场景',
  },
]

export function ScenarioChoicePage() {
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const { startScenario } = useScenarioStore()
  const { setPhase } = useUIStore()
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  const handleSelect = (scenario: typeof scenarioTemplates[0]) => {
    setSelectedScenario(scenario.id)
  }

  const handleStart = () => {
    const scenario = scenarioTemplates.find((s) => s.id === selectedScenario)
    if (!scenario) return

    startScenario(scenario.type, scenario.title, scenario.timestamp || new Date().toISOString())
    navigate('/scenario/dialogue')
  }

  return (
    <div className="min-h-screen bg-bg-black pt-16 pb-20 md:pb-8 px-6">
      <div className="max-w-3xl mx-auto">
        <header className="py-6">
          <h1 className="text-2xl font-medium text-text-white mb-2">平行推演</h1>
          <p className="text-text-gray">选择一个场景，探索另一种可能</p>
        </header>

        {/* Suggestions */}
        {profile?.hook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card variant="glass" className="p-4">
              <p className="text-xs text-text-dark mb-2">根据你的画像建议</p>
              <p className="text-text-white">{profile.hook.text}</p>
              <button
                onClick={() => setSelectedScenario(scenarioTemplates[0].id)}
                className="mt-3 text-gold text-sm hover:underline"
              >
                {profile.hook.action} →
              </button>
            </Card>
          </motion.div>
        )}

        {/* Scenario list */}
        <section>
          <h2 className="text-lg font-medium text-text-white mb-4">选择推演场景</h2>
          <div className="grid gap-3">
            {scenarioTemplates.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className={`p-4 cursor-pointer transition-all ${
                    selectedScenario === scenario.id
                      ? 'border-gold bg-gold/5'
                      : ''
                  }`}
                  onClick={() => handleSelect(scenario)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-text-white mb-1">
                        {scenario.title}
                      </h3>
                      <p className="text-sm text-text-gray">{scenario.description}</p>
                    </div>
                    {scenario.timestamp && (
                      <span className="text-xs text-text-dark px-2 py-1 bg-bg-medium rounded">
                        {scenario.timestamp}
                      </span>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-20 md:bottom-8 left-0 right-0 p-6 bg-gradient-to-t from-bg-black via-bg-black to-transparent"
        >
          <div className="max-w-3xl mx-auto">
            <Button
              className="w-full md:w-auto"
              disabled={!selectedScenario}
              onClick={handleStart}
            >
              开始推演
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}