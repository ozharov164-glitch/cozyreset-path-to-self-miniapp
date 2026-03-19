import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import {
  apiSelfRealizationWelcome,
  apiSelfRealizationChat,
  apiSelfRealizationHistory,
  apiSelfRealizationClearHistory,
} from '../api/client'

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

const TYPEWRITER_MS = 34
const CURSOR_BLINK_MS = 540
const MAX_ANIM_CHARS = 900

function getDirectionWelcome(dir: Direction): string {
  return `Отличный выбор — ${dir.title.toLowerCase()}. Отметь, что сейчас откликается, и опиши ситуацию — будем разбирать по шагам в диалоге.`
}

function clampForAnim(text: string) {
  if (text.length <= MAX_ANIM_CHARS) return text
  return text.slice(0, MAX_ANIM_CHARS)
}

function TypewriterText({
  text,
  animate,
  onComplete,
}: {
  text: string
  animate: boolean
  onComplete?: () => void
}) {
  const [visibleLength, setVisibleLength] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const fullText = text || ''
  const animText = animate ? clampForAnim(fullText) : fullText
  const done = visibleLength >= animText.length

  useEffect(() => {
    if (!fullText) {
      setVisibleLength(0)
      return
    }

    if (!animate) {
      setVisibleLength(fullText.length)
      return
    }

    setVisibleLength(0)
    const len = animText.length
    const t = window.setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= len) {
          window.clearInterval(t)
          onCompleteRef.current?.()
          return len
        }
        return prev + 1
      })
    }, TYPEWRITER_MS)

    return () => window.clearInterval(t)
  }, [animate, fullText, animText.length])

  useEffect(() => {
    if (!animate || done) return
    const blink = window.setInterval(() => setCursorVisible((v) => !v), CURSOR_BLINK_MS)
    return () => window.clearInterval(blink)
  }, [animate, done])

  if (!animate) return <>{fullText}</>

  return (
    <span>
      {animText.slice(0, visibleLength)}
      {!done && (
        <motion.span animate={{ opacity: cursorVisible ? 1 : 0 }} transition={{ duration: 0.15 }}>
          |
        </motion.span>
      )}
    </span>
  )
}

function PremiumHoloCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`card-premium relative overflow-hidden ${className || ''}`}>
      <motion.div
        className="absolute -inset-[60px] opacity-70"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(107,196,181,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(184,164,224,0.35), transparent 45%), radial-gradient(circle at 60% 85%, rgba(232,180,184,0.25), transparent 50%)',
          filter: 'blur(10px)',
        }}
        animate={{ rotate: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[-40%] top-[-60%] w-[180%] h-[180%] opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(110deg, rgba(107,196,181,0.0) 25%, rgba(107,196,181,0.6) 45%, rgba(107,196,181,0.0) 65%)',
        }}
        animate={{ x: ['-10%', '10%'], y: ['-5%', '5%'] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [welcomeText, setWelcomeText] = useState('')
  const [welcomeDone, setWelcomeDone] = useState(false)
  const [directionIntroDone, setDirectionIntroDone] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const directionTitleRef = useRef<string | null>(null)
  directionTitleRef.current = selectedDirection?.title ?? null

  useEffect(() => {
    apiSelfRealizationWelcome().then((result) => {
      if ('error' in result) {
        setWelcomeText('')
        setWelcomeDone(true)
        return
      }
      const text = result.welcomeText || ''
      setWelcomeText(text)
      setWelcomeDone(!text)
    })
  }, [])

  const directionWelcome = useMemo(() => {
    if (!selectedDirection) return ''
    return getDirectionWelcome(selectedDirection)
  }, [selectedDirection])

  const openDirection = useCallback((dir: Direction) => {
    setSelectedDirection(dir)
    setMessages([])
    setSelectedDifficulties([])
    setInputText('')
    setError(null)
    setHistoryLoading(true)
    setLoadingReply(false)
    setDirectionIntroDone(false)
  }, [])

  const goBackToList = useCallback(() => {
    setSelectedDirection(null)
    setMessages([])
    setSelectedDifficulties([])
    setInputText('')
    setError(null)
    setHistoryLoading(false)
    setLoadingReply(false)
    setDirectionIntroDone(false)
  }, [])

  useEffect(() => {
    if (!selectedDirection) return

    const directionTitle = selectedDirection.title
    setError(null)
    setHistoryLoading(true)
    setLoadingReply(false)
    setDirectionIntroDone(false)

    apiSelfRealizationHistory(directionTitle).then((res) => {
      if (directionTitleRef.current !== directionTitle) return

      if ('error' in res) {
        setHistoryLoading(false)
        setMessages([{ role: 'assistant', content: 'Не удалось загрузить историю. Попробуй ещё раз.' }])
        setDirectionIntroDone(true)
        return
      }

      if (res.items.length > 0) {
        setMessages(res.items.map((m) => ({ role: m.role, content: m.content })))
        setDirectionIntroDone(true)
      } else {
        setMessages([{ role: 'assistant', content: getDirectionWelcome(selectedDirection) }])
        setDirectionIntroDone(false)
      }
      setHistoryLoading(false)
    })
  }, [selectedDirection])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingReply])

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
    setMessages([{ role: 'assistant', content: getDirectionWelcome(selectedDirection) }])
    setSelectedDifficulties([])
    setInputText('')
    setLoadingReply(false)
    setHistoryLoading(false)
    setDirectionIntroDone(false)
  }, [selectedDirection])

  const sendMessage = useCallback(async () => {
    const text = inputText.trim()
    if (!selectedDirection || !text || loadingReply) return

    setError(null)
    if (messages.length === 1 && messages[0]?.role === 'assistant') {
      setDirectionIntroDone(true)
    }

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

  // Keep the same layout while waiting for the first assistant reply.
  // This prevents any visible jumps right after the user presses "send".
  const isSetupMode =
    (messages.length <= 1 && messages[0]?.role === 'assistant') ||
    (loadingReply && messages.length === 2 && messages[1]?.role === 'user')
  const canStartChat = inputText.trim().length > 0
  const isIntroTyping = isSetupMode && !directionIntroDone && !historyLoading

  if (selectedDirection) {
    return (
      <div className="min-h-screen flex flex-col safe-area self-realization-page">
        <header className="flex items-center justify-between h-14 px-4 gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={goBackToList}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] bg-white/95 shadow-md border border-[var(--color-lavender)]/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-center text-base font-bold text-[var(--color-text-primary)] truncate">
              {selectedDirection.title}
            </h1>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-0.5">Структурированный диалог по шагам</p>
          </div>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] bg-white/95 shadow-md border border-[var(--color-lavender)]/20"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 max-w-[440px] mx-auto w-full px-4 py-4">
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-1 py-2 min-h-0">
            {historyLoading && (
              <div className="flex justify-start">
                <div className="card-premium rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] border border-[var(--color-lavender)]/20">
                  ИИ готовит старт…
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const showIntroTypewriter = i === 0 && m.role === 'assistant' && isIntroTyping
                return (
                  <motion.div
                    key={`${selectedDirection.id}-${i}`}
                    layout
                    initial={false}
                    animate={{ opacity: 1 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed ${
                        m.role === 'assistant'
                          ? 'card-premium border border-[var(--color-lavender)]/20 text-[var(--color-text-primary)] shadow-md'
                          : 'bg-gradient-to-br from-[var(--color-glow-teal)]/25 to-[var(--color-glow-teal)]/10 border border-[var(--color-glow-teal)]/30 text-[var(--color-forest-dark)] shadow-md'
                      }`}
                    >
                      {showIntroTypewriter ? (
                        <TypewriterText text={m.content} animate={true} onComplete={() => setDirectionIntroDone(true)} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {loadingReply && (
              <div className="flex justify-start">
                <div className="card-premium rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] border border-[var(--color-lavender)]/20">
                  ИИ печатает ответ…
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <motion.div layout className="flex-shrink-0 pt-3 space-y-3">
            {isSetupMode ? (
              <>
                <PremiumHoloCard className="p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl" aria-hidden>
                      🏆
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--color-text-primary)]">Почему это лучше обычной ИИ‑поддержки</div>
                      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-1">
                        ИИ ведёт по направлению: ты выбираешь фокус, добавляешь сложности и получаешь шаги, которые укрепляют
                        уверенность, самооценку и способность общаться.
                        <span className="block mt-1">Плюс — история сохраняется для этого направления.</span>
                      </div>
                    </div>
                  </div>
                </PremiumHoloCard>

                <div className="card-premium rounded-2xl p-5 shadow-lg">
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
                          whileTap={{ scale: 0.99 }}
                          className={`px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                            active
                              ? 'bg-[var(--color-glow-teal)]/25 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)]'
                              : 'border-[var(--color-lavender)]/40 text-[var(--color-text-secondary)] bg-white/80'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {item}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div className="card-premium rounded-2xl p-5 shadow-lg">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Опиши ситуацию или контекст, с которого хочешь начать..."
                    className="w-full min-h-[100px] rounded-xl border border-[var(--color-lavender)]/30 bg-white/90 p-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={loadingReply || !canStartChat}
                    className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[52px] font-semibold disabled:opacity-50 mt-4"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {loadingReply ? 'ИИ печатает...' : 'Отправить и начать диалог'}
                  </button>
                  {error && <p className="text-sm text-amber-700 mt-3">{error}</p>}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={clearDirectionHistory}
                    className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-forest-dark)]"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Удалить чат и начать сначала
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-xs text-[var(--color-text-secondary)] -mt-1">Продолжаем. ИИ уточняет и закрепляет шаги.</div>
                <div className="card-premium rounded-2xl p-4 shadow-lg">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Напиши сообщение…"
                    className="w-full min-h-[88px] rounded-xl border border-[var(--color-lavender)]/35 bg-white/95 p-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={loadingReply || !inputText.trim()}
                      className="flex-1 py-3 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-50"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {loadingReply ? 'Отправка...' : 'Отправить'}
                    </button>
                    <button
                      type="button"
                      onClick={clearDirectionHistory}
                      className="py-3 px-3 rounded-xl btn-secondary min-h-[48px] text-xs font-semibold leading-tight"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Удалить чат и начать сначала
                    </button>
                  </div>
                  {error && <p className="text-sm text-amber-700 mt-2">{error}</p>}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col safe-area self-realization-page">
      <header className="flex items-center justify-between h-14 px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] bg-white/95 shadow-md border border-[var(--color-lavender)]/20"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Самореализация</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Уверенность, самооценка и социализация</p>
        </div>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] bg-white/95 shadow-md border border-[var(--color-lavender)]/20"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-4 pb-6 min-h-0 overflow-y-auto">
        <PremiumHoloCard className="p-5 mb-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-3xl mt-0.5" aria-hidden>
              🌱
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[var(--color-text-secondary)] text-sm mb-2 leading-relaxed">
                Выбери направление — откроется страница для глубокой работы в диалоге с ИИ.
              </div>
              <p className="text-[var(--color-text-primary)] text-base leading-relaxed font-medium min-h-[3.6em]">
                {welcomeText ? (
                  <TypewriterText
                    text={welcomeText}
                    animate={!welcomeDone}
                    onComplete={() => setWelcomeDone(true)}
                  />
                ) : (
                  <span className="text-[var(--color-text-secondary)]">Загрузка…</span>
                )}
              </p>
            </div>
          </div>
        </PremiumHoloCard>

        <motion.ul
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.03 } },
          }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li
              key={dir.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.button
                type="button"
                onClick={() => openDirection(dir)}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left card-premium rounded-2xl p-5 min-h-[88px] shadow-md hover:shadow-lg transition-shadow border border-[var(--color-lavender)]/20"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {dir.icon}
                  </span>
                  <div className="min-w-0">
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
