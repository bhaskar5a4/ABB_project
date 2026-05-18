'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, Sparkles, Brain, Bot, User, Loader2, Cpu, MemoryStick, AlertTriangle, TrendingUp } from 'lucide-react'
import { useCluster } from '@/context/cluster-context'
import { getChatResponse } from '@/lib/chat-engine'
import { useMounted } from '@/hooks/use-mounted'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  { icon: <Cpu className="h-4 w-4" />, text: 'Which pod is failing?' },
  { icon: <AlertTriangle className="h-4 w-4" />, text: 'Show abnormal services' },
  { icon: <MemoryStick className="h-4 w-4" />, text: 'Why is CPU usage high?' },
  { icon: <TrendingUp className="h-4 w-4" />, text: 'Predict future failures' },
]

function formatContent(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          )
        )}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const mounted = useMounted()
  const { pods, alerts } = useCluster()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm KubeMind AI. Ask about failing pods, CPU spikes, anomalies, or failure predictions.",
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isTyping])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    setMessages((prev) => [...prev, { id: `u-${prev.length}`, role: 'user', content: messageText }])
    setInput('')
    setIsTyping(true)
    await new Promise((r) => setTimeout(r, 900))

    let response = getChatResponse(messageText, pods, alerts)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (apiUrl) {
      try {
        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText }),
        })
        if (res.ok) {
          const data = await res.json()
          response = data.reply ?? response
        }
      } catch {
        /* fallback */
      }
    }

    setMessages((prev) => [...prev, { id: `a-${prev.length}`, role: 'assistant', content: response }])
    setIsTyping(false)
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed bottom-4 right-4 top-4 z-50 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 p-4">
              <div className="flex items-center gap-3">
                <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="font-semibold">KubeMind AI</h2>
                  <p className="text-xs text-muted-foreground">Infrastructure assistant</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div ref={scrollRef} className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                      )}
                    >
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                    </div>
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'border border-border/50 bg-muted/50'
                      )}
                    >
                      {formatContent(message.content)}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Analyzing cluster metrics...
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length <= 2 && (
              <div className="border-t border-border/50 p-3">
                <p className="mb-2 text-xs text-muted-foreground">Suggested:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(q.text)}
                      className="flex items-center gap-1.5 rounded-full border border-border/50 px-3 py-1.5 text-xs hover:bg-primary/10"
                    >
                      {q.icon}
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="border-t border-border p-4"
            >
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your cluster..."
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function FloatingAIChat() {
  const [open, setOpen] = useState(false)
  const mounted = useMounted()
  if (!mounted) return null
  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl"
        aria-label="Open AI assistant"
      >
        <Brain className="h-6 w-6" />
      </motion.button>
      <AIAssistant isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
