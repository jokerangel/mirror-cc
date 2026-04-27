import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useChatStore, useUserStore, useUIStore } from '@/stores'

export function SelfExplorePage() {
  const { messages, addUserMessage, addAIMessage, setTyping, isTyping } = useChatStore()
  const { profile, updateClarity } = useUserStore()
  const { setPhase } = useUIStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPhase('human')
  }, [setPhase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    addUserMessage(userMessage)
    setInput('')

    setTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        '这让我想起你之前说的，你常常在稳定与自由之间徘徊。这次的想法和以前有什么不同吗？',
        '能再多说一些吗？我想更深入地理解你的感受。',
        '听起来这件事对你很重要。如果把这件事放在人生的时间线上，你觉得它意味着什么？',
        '这种感受是一直都有，还是最近才开始的？',
        '如果你的朋友遇到同样的情况，你会怎么跟他说？',
      ]
      addAIMessage(responses[Math.floor(Math.random() * responses.length)])

      // Update clarity occasionally
      if (Math.random() > 0.7 && profile && profile.clarity < 100) {
        updateClarity(Math.min(profile.clarity + 5, 100))
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-bg-black flex flex-col pt-16 pb-20 md:pb-4">
      {/* Header */}
      <header className="px-6 py-4 border-b border-bg-medium">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium text-text-white">自我探索</h1>
            <p className="text-sm text-text-dark">与镜中的自己对话</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-dark">清晰度</span>
            <div className="w-16 h-1.5 bg-bg-medium rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{ width: `${profile?.clarity || 60}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
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

      {/* Input */}
      <div className="px-6 py-4 border-t border-bg-medium">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="说说你最近在想什么..."
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