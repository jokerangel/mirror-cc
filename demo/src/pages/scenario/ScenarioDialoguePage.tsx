import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useScenarioStore, useUIStore } from '@/stores'

export function ScenarioDialoguePage() {
  const navigate = useNavigate()
  const { currentScenario, addDialogue, setComic } = useScenarioStore()
  const { setPhase } = useUIStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [dialogueCount, setDialogueCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPhase('mirror')
  }, [setPhase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentScenario?.dialogue])

  const handleSend = async () => {
    if (!input.trim() || isTyping || !currentScenario) return

    const userMessage = input.trim()
    addDialogue('user', userMessage)
    setInput('')
    setDialogueCount((prev) => prev + 1)
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `在${currentScenario.timestamp}的那个选择节点，让我们仔细思考一下。`,
        '这个决定会如何影响你周围的人？',
        '想象一下那天早上醒来，你会看到什么不同的景象？',
        '这种改变会带给你怎样的感受？是期待还是不安？',
        '让我们把这一幕画下来，让它变得具体。你准备好了吗？',
      ]

      addDialogue('ai', responses[Math.min(dialogueCount, responses.length - 1)])
      setIsTyping(false)
    }, 1500)
  }

  const handleGenerateComic = () => {
    // Set comic acts
    setComic(
      [
        { scene: 'office', text: `${currentScenario?.timestamp || '那个时间点'}，你站在人生的十字路口。` },
        { scene: 'street', text: '另一条路上的风景，会是什么样子？' },
        { scene: 'home', text: '你坐下来思考，这次选择带来的改变。' },
        { scene: 'sunset', text: '最终的画面，是你想象中的样子吗？' },
      ],
      [
        { id: 'a', label: '继续探索', description: '深入这个场景' },
        { id: 'b', label: '尝试另一个', description: '换一个可能的未来' },
      ]
    )
    navigate('/scenario/comic')
  }

  const canGenerateComic = dialogueCount >= 3

  return (
    <div className="min-h-screen bg-bg-black flex flex-col pt-16 pb-20 md:pb-4">
      {/* Header */}
      <header className="px-6 py-4 border-b border-bg-medium">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-text-dark px-2 py-0.5 bg-bg-medium rounded">
              {currentScenario?.type === 'history' ? '历史推演' : '未来推演'}
            </span>
          </div>
          <h1 className="text-xl font-medium text-text-white">
            {currentScenario?.title || '平行推演'}
          </h1>
          <p className="text-sm text-text-dark mt-1">
            {currentScenario?.timestamp}
          </p>
        </div>
      </header>

      {/* Dialogue */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {currentScenario?.dialogue.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gold text-bg-black rounded-br-md'
                      : 'bg-bg-medium text-text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-bg-medium text-text-white px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-dark rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-text-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-text-dark rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Generate comic button */}
      {canGenerateComic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 border-t border-bg-medium bg-bg-dark"
        >
          <div className="max-w-2xl mx-auto">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGenerateComic}
            >
              生成动态漫画 ✨
            </Button>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-bg-medium">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="描述你在那个场景中的感受..."
            className="flex-1 bg-bg-dark border border-bg-medium rounded-xl px-4 py-3 text-text-white placeholder:text-text-dark focus:outline-none focus:border-gold/50 transition-colors"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            发送
          </Button>
        </div>
      </div>
    </div>
  )
}