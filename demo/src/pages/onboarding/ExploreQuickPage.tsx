import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useUserStore } from '@/stores'

const quickQuestions = [
  {
    id: 'recent',
    question: '最近让你反复思考的事情是?',
    placeholder: '比如：工作方向、人际关系、生活意义...',
  },
  {
    id: 'value',
    question: '什么对你来说是重要的?',
    placeholder: '比如：自由、成就、稳定、连接...',
  },
  {
    id: 'conflict',
    question: '你经常在什么事情上犹豫不决?',
    placeholder: '比如：换工作、表达真实想法、做决定...',
  },
  {
    id: 'hope',
    question: '你希望一年后的自己是怎样的?',
    placeholder: '可以是任何想法...',
  },
]

export function ExploreQuickPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')
  const { setProfile } = useUserStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentQuestion = quickQuestions[currentIndex]
  const isLastQuestion = currentIndex === quickQuestions.length - 1

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = () => {
    if (!answers[currentQuestion.id]?.trim()) return

    if (isLastQuestion) {
      setProfile({
        summary: generateSummary(answers),
        keywords: extractKeywords(answers),
      })
      navigate('/onboarding/profile-result')
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="min-h-screen bg-bg-black flex flex-col">
      {/* Progress */}
      <div className="pt-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-gray">
              问题 {currentIndex + 1} / {quickQuestions.length}
            </span>
            {mode === 'depth' && (
              <span className="text-xs text-text-dark">深度探索模式</span>
            )}
          </div>
          <div className="h-1 bg-bg-medium rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold"
              initial={false}
              animate={{ width: `${((currentIndex + 1) / quickQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center px-6 py-12">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-medium text-text-white mb-8">
                {currentQuestion.question}
              </h2>

              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full h-40 bg-bg-dark border border-bg-medium rounded-xl p-4 text-text-white placeholder:text-text-dark resize-none focus:outline-none focus:border-gold/50 transition-colors"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="max-w-md mx-auto flex gap-4">
          {currentIndex > 0 && (
            <Button variant="secondary" onClick={handlePrev}>
              上一题
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={!answers[currentQuestion.id]?.trim()}
            onClick={handleNext}
          >
            {isLastQuestion ? '完成' : '下一题'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function generateSummary(answers: Record<string, string>): string {
  const templates = [
    '你是一个在稳定与自由之间反复拉扯的人',
    '常常在行动与犹豫之间徘徊',
    '内心渴望成长，但总是被现实牵绊',
    '追求意义，但不确定路径在哪里',
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function extractKeywords(answers: Record<string, string>): Array<{ text: string; type: 'primary' | 'secondary' }> {
  return [
    { text: '成长优先', type: 'primary' as const },
    { text: '内向社交', type: 'secondary' as const },
    { text: '行动犹豫', type: 'secondary' as const },
    { text: '深度思考', type: 'secondary' as const },
  ]
}