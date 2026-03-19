import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import { apiSelfRealizationWelcome, apiSelfRealizationChat, apiSelfRealizationHistory, apiSelfRealizationClearHistory } from '../api/client'

const DIRECTIONS = [
  {
    id: 'confidence',
    title: 'Уверенность в обществе',
    description: 'Общение, границы, самопрезентация — опора в контакте с людьми.',
    icon: '🌟',
    difficulties: ['Стеснение в общении', 'Тревога перед знакомствами', 'Сложно отстаивать границы', 'Страх оценки'],
  },
  {
    id: 'study',
    title: 'Учёба и концентрация',
    description: 'Фокус, запоминание, режим — чтобы учиться без выгорания.',
    icon: '📚',
    difficulties: ['Трудно сосредоточиться', 'Быстро устаю', 'Сложно запоминать', 'Откладываю учёбу'],
  },
  {
    id: 'goals',
    title: 'Цели и дисциплина',
    description: 'Планирование, привычки, движение к целям шаг за шагом.',
    icon: '🎯',
    difficulties: ['Нет стабильного режима', 'Бросаю начатое', 'Непонятно с чего начать', 'Нет энергии на системность'],
  },
  {
    id: 'antiprocrastination',
    title: 'Анти‑прокрастинация',
    description: 'Старт дела, откладывание, внутреннее сопротивление — разбираем и двигаемся.',
    icon: '⏳',
    difficulties: ['Постоянно откладываю', 'Паралич перед задачей', 'Залипаю в телефоне', 'Чувство вины после откладывания'],
  },
] as const

type Direction = (typeof DIRECTIONS)[number]
type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
}

interface SelfRealizationProps {
  onBack: () => void
}

const TYPEWRITER_MS = 42
const CURSOR_BLINK_MS = 530

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [visibleLength, setVisibleLength] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!text) return
    setVisibleLength(0)
    const len = text.length
    const t = setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= len) {
          clearInterval(t)
          onCompleteRef.current?.()
          return len
        }
        return prev + 1
      })
    }, TYPEWRITER_MS)
    return () => clearInterval(t)
  }, [text])

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), CURSOR_BLINK_MS)
    return () => clearInterval(blink)
  }, [])

  const visible = text.slice(0, visibleLength)
  const done = visibleLength >= text.length

  return (
    <span>
      {visible}
      {!done && <motion.span animate={{ opacity: cursorVisible ? 1 : 0 }} transition={{ duration: 0.15 }}>|</motion.span>}
    </span>
  )
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [welcomeText, setWelcomeText] = useState('')
  const [welcomeDone, setWelcomeDone] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    apiSelfRealizationWelcome().then((result) => {
      if ('error' in result) {
        setWelcomeDone(true)
        return
      }
      const text = result.welcomeText || ''
      setWelcomeText(text)
      if (!text) setWelcomeDone(true)
    })
  }, [])

  const directionWelcome = useMemo(() => {
    if (!selectedDirection) return ''
    return `Отличный выбор — ${selectedDirection.title.toLowerCase()}. Отметь, что сейчас откликается, и опиши ситуацию — будем разбирать по шагам в диалоге.`
  }, [selectedDirection])

  useEffect(() => {
    if (!selectedDirection) return
    setMessages([{ role: 'assistant', content: directionWelcome }])
    setSelectedDifficulties([])
    setInputText('')
    setError(null)
    setHistoryLoading(true)
    apiSelfRealizationHistory(selectedDirection.title).then((res) => {
      if ('error' in res) {
        setHistoryLoading(false)
        return
      }
      if (res.items.length > 0) {
        setMessages(res.items.map((m) => ({ role: m.role, content: m.content })))
      }
      setHistoryLoading(false)
    })
  }, [selectedDirection, directionWelcome])

  const openDirection = useCallback((dir: Direction) => {
    setSelectedDirection(dir)
  }, [])

  const toggleDifficulty = useCallback((value: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    )
  }, [])

  const clearDirectionHistory = useCallback(async () => {
    if (!selectedDirection) return
    setError(null)
    const result = await apiSelfRealizationClearHistory(selectedDirection.title)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setMessages([{ role: 'assistant', content: directionWelcome }])
    setSelectedDifficulties([])
    setInputText('')
  }, [selectedDirection, directionWelcome])

  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!selectedDirection || !text || loadingReply) return
    setError(null)
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInputText('')
    setLoadingReply(true)
    const result = await apiSelfRealizationChat({
      direction: selectedDirection.title,
      text,
      difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
      history: nextMessages,
    })
    if ('error' in result) {
      setError(result.error)
      setLoadingReply(false)
      return
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
    setLoadingReply(false)
  }, [selectedDirection, messages, inputText, loadingReply, selectedDifficulties])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingReply])

  const isFirstStep = messages.length <= 1 && messages[0]?.role === 'assistant'
  const canStartChat = inputText.trim().length > 0

  if (selectedDirection) {
    return (
      <div className="min-h-screen flex flex-col safe-area">
        <header className="flex items-center justify-between h-14 px-4 mb-4 gap-2">
          <button
            type="button"
            onClick={() => setSelectedDirection(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] bg-white/90 shadow-lg border border-[var(--color-lavender)]/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-base font-bold text-[var(--color-text-primary)] truncate px-2">
            {selectedDirection.title}
          </h1>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] bg-white/90 shadow-lg border border-[var(--color-lavender)]/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </header>

        <div className="flex-1 flex flex-col max-w-[440px] mx-auto w-full px-4 pb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {isFirstStep ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-5"
              >
                <div className="rounded-2xl p-5 bg-white/95 backdrop-blur-xl border border-[var(--color-lavender)]/25 shadow-xl shadow-[var(--color-lavender)]/10">
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    Что сейчас откликается сильнее всего? Отметь и добавь свои слова — ИИ будет вести диалог по шагам.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDirection.difficulties.map((item) => {
                      const active = selectedDifficulties.includes(item)
                      return (
                        <motion.button
                          key={item}
                          type="button"
                          onClick={() => toggleDifficulty(item)}
                          whileTap={{ scale: 0.97 }}
                          className={`px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                            active
                              ? 'bg-[var(--color-glow-teal)]/20 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)] shadow-md'
                              : 'border-[var(--color-lavender)]/40 text-[var(--color-text-secondary)] bg-white/70'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {item}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <div className="rounded-2xl p-5 bg-white/95 backdrop-blur-xl border border-[var(--color-lavender)]/25 shadow-xl shadow-[var(--color-lavender)]/10">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Опиши ситуацию или контекст, с которого хочешь начать..."
                    className="w-full min-h-[100px] rounded-xl border border-[var(--color-lavender)]/30 bg-white/80 p-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={loadingReply || !canStartChat}
                    className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[52px] font-semibold disabled:opacity-50 mt-4 shadow-lg"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {loadingReply ? 'ИИ печатает...' : 'Начать диалог с ИИ'}
                  </button>
                  {error && <p className="text-sm text-amber-700 mt-3">{error}</p>}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center">
                  <button
                    type="button"
                    onClick={clearDirectionHistory}
                    className="text-sm font-medium text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-forest-dark)]"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Удалить чат и начать сначала
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
                  <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                        layout
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                            m.role === 'assistant'
                              ? 'bg-white/95 backdrop-blur-xl border border-[var(--color-lavender)]/25 shadow-lg text-[var(--color-text-primary)]'
                              : 'bg-gradient-to-br from-[var(--color-glow-teal)]/20 to-[var(--color-glow-teal)]/8 border border-[var(--color-glow-teal)]/35 text-[var(--color-forest-dark)] shadow-md'
                          }`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {historyLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] bg-white/80 border border-[var(--color-lavender)]/20">
                        Загружаем историю...
                      </div>
                    </div>
                  )}
                  {loadingReply && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] bg-white/80 border border-[var(--color-lavender)]/20">
                        ИИ думает над ответом...
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="pt-3 flex-shrink-0 space-y-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Напиши сообщение..."
                    className="w-full min-h-[88px] rounded-xl border border-[var(--color-lavender)]/35 bg-white/95 p-3.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={loadingReply || !inputText.trim()}
                      className="flex-1 py-3 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-50 shadow-lg"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {loadingReply ? 'Отправка...' : 'Отправить'}
                    </button>
                    <button
                      type="button"
                      onClick={clearDirectionHistory}
                      className="py-3 px-4 rounded-xl btn-secondary min-h-[48px] text-sm font-semibold"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Удалить чат и начать сначала
                    </button>
                  </div>
                  {error && <p className="text-sm text-amber-700">{error}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="flex items-center justify-between h-14 px-4 mb-4 gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] bg-white/90 shadow-lg border border-[var(--color-lavender)]/20"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[var(--color-text-primary)] px-2">
          Самореализация
        </h1>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] bg-white/90 shadow-lg border border-[var(--color-lavender)]/20"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-4 pb-6">
        <AnimatePresence mode="wait">
          {!welcomeDone && welcomeText ? (
            <motion.div
              key="typewriter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-6 mb-6 bg-white/95 backdrop-blur-xl border border-[var(--color-lavender)]/25 shadow-xl shadow-[var(--color-lavender)]/10"
            >
              <p className="text-[var(--color-text-primary)] text-base leading-relaxed font-medium min-h-[3.5em]">
                <TypewriterText text={welcomeText} onComplete={() => setWelcomeDone(true)} />
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="subtitle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed"
            >
              Выбери направление — откроется страница для глубокой работы в диалоге с ИИ.
            </motion.p>
          )}
        </AnimatePresence>

        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li
              key={dir.id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.button
                type="button"
                onClick={() => openDirection(dir)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left rounded-2xl p-5 min-h-[92px] bg-white/95 backdrop-blur-xl border border-[var(--color-lavender)]/25 shadow-lg shadow-[var(--color-lavender)]/10 hover:shadow-xl transition-shadow"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>{dir.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">{dir.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{dir.description}</p>
                  </div>
                </div>
              </motion.button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
