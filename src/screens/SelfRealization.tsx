import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import { apiSelfRealizationWelcome, apiSelfRealizationChat } from '../api/client'

const BG_MUSIC_VOLUME = 0.07
const FADE_OUT_MS = 900

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

function fadeAudioTo(audio: HTMLAudioElement, target: number, ms: number): Promise<void> {
  const start = audio.volume
  const diff = target - start
  const steps = Math.max(10, Math.floor(ms / 40))
  const stepMs = ms / steps
  let i = 0
  return new Promise((resolve) => {
    const timer = window.setInterval(() => {
      i += 1
      const t = i / steps
      audio.volume = Math.max(0, Math.min(1, start + diff * t))
      if (i >= steps) {
        window.clearInterval(timer)
        resolve()
      }
    }, stepMs)
  })
}

function startTinyIntroTone(): (() => void) | null {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const master = ctx.createGain()
    master.gain.value = 0.0001
    master.connect(ctx.destination)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.frequency.linearRampToValueAtTime(2600, now + 1.3)
    filter.connect(master)
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(392, now)
    osc.frequency.linearRampToValueAtTime(440, now + 0.7)
    osc.connect(filter)
    master.gain.exponentialRampToValueAtTime(0.035, now + 0.08)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    osc.start(now)
    osc.stop(now + 1.22)
    return () => {
      try {
        ctx.close()
      } catch {
        /* ignore */
      }
    }
  } catch {
    return null
  }
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [musicMuted, setMusicMuted] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const voiceRef = useRef<HTMLAudioElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const toggleMute = useCallback(() => {
    const bg = bgMusicRef.current
    if (!bg) {
      setMusicMuted(true)
      return
    }
    if (musicMuted) {
      bg.volume = 0
      bg.play().then(() => fadeAudioTo(bg, BG_MUSIC_VOLUME, 600))
      setMusicMuted(false)
    } else {
      fadeAudioTo(bg, 0, 400).then(() => {
        bg.pause()
        setMusicMuted(true)
      })
    }
  }, [musicMuted])

  useEffect(() => {
    let mounted = true
    const stopTone = startTinyIntroTone()
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/'
    const bg = new Audio(`${base}audio/powerful-maxkomusic.mp3`)
    bg.loop = true
    bg.preload = 'auto'
    bg.volume = 0
    bgMusicRef.current = bg
    bg.play().then(() => {
      if (mounted && !musicMuted) fadeAudioTo(bg, BG_MUSIC_VOLUME, 800)
    }).catch(() => {})

    const unlockBgOnTap = () => {
      const current = bgMusicRef.current
      if (!current || musicMuted) return
      current.play().then(() => fadeAudioTo(current, BG_MUSIC_VOLUME, 600)).catch(() => {})
      window.removeEventListener('pointerdown', unlockBgOnTap)
    }
    window.addEventListener('pointerdown', unlockBgOnTap, { once: true })

    apiSelfRealizationWelcome().then(async (result) => {
      if (!mounted || 'error' in result) return
      try {
        const url = URL.createObjectURL(result.blob)
        const voice = new Audio(url)
        voiceRef.current = voice
        voice.onended = () => {
          URL.revokeObjectURL(url)
          voiceRef.current = null
        }
        voice.onerror = () => {
          URL.revokeObjectURL(url)
          voiceRef.current = null
        }
        await voice.play()
      } catch {
        /* ignore */
      }
    })

    return () => {
      mounted = false
      if (stopTone) stopTone()
      window.removeEventListener('pointerdown', unlockBgOnTap)
      const bgCurrent = bgMusicRef.current
      if (bgCurrent) {
        bgCurrent.pause()
        bgCurrent.src = ''
      }
      bgMusicRef.current = null
      const voiceCurrent = voiceRef.current
      if (voiceCurrent) {
        voiceCurrent.pause()
        voiceCurrent.src = ''
      }
      voiceRef.current = null
    }
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
  }, [selectedDirection, directionWelcome])

  const openDirection = useCallback(async (dir: Direction) => {
    setIsFadingOut(true)
    const bg = bgMusicRef.current
    if (bg && !musicMuted) {
      await fadeAudioTo(bg, 0, FADE_OUT_MS)
      bg.pause()
    }
    setIsFadingOut(false)
    setSelectedDirection(dir)
  }, [musicMuted])

  const toggleDifficulty = useCallback((value: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    )
  }, [])

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
      <div className="min-h-screen flex flex-col safe-area bg-gradient-to-b from-[#e8e0f4]/30 to-transparent">
        <header className="card-premium h-14 flex items-center justify-between px-4 mb-4 rounded-2xl shadow-lg">
          <button
            type="button"
            onClick={() => setSelectedDirection(null)}
            className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ← Назад
          </button>
          <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight truncate max-w-[180px]">
            {selectedDirection.title}
          </h1>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium text-[var(--color-glow-teal)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </header>

        <div className="flex-1 flex flex-col max-w-[460px] mx-auto w-full px-3 pb-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {isFirstStep ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="card-premium rounded-2xl p-4 shadow-md">
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    Что сейчас откликается сильнее всего? Отметь и добавь свои слова — ИИ будет вести диалог по шагам.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDirection.difficulties.map((item) => {
                      const active = selectedDifficulties.includes(item)
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleDifficulty(item)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                            active
                              ? 'bg-[var(--color-glow-teal)]/20 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)] shadow-sm'
                              : 'border-[var(--color-lavender)]/40 text-[var(--color-text-secondary)] bg-white/60'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="card-premium rounded-2xl p-4 shadow-md">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Опиши ситуацию или контекст, с которого хочешь начать..."
                    className="w-full min-h-[100px] rounded-xl border border-[var(--color-lavender)]/30 bg-white/80 p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/30 resize-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={loadingReply || !canStartChat}
                    className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[50px] font-semibold disabled:opacity-50 mt-3 shadow-md"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {loadingReply ? 'ИИ печатает...' : 'Начать диалог с ИИ'}
                  </button>
                  {error && <p className="text-sm text-amber-700 mt-2">{error}</p>}
                </div>
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
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        layout
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            m.role === 'assistant'
                              ? 'card-premium border border-[var(--color-lavender)]/20 text-[var(--color-text-primary)]'
                              : 'bg-gradient-to-br from-[var(--color-glow-teal)]/25 to-[var(--color-glow-teal)]/10 border border-[var(--color-glow-teal)]/30 text-[var(--color-forest-dark)]'
                          }`}
                        >
                          {m.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loadingReply && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="card-premium rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] border border-[var(--color-lavender)]/20">
                        ИИ думает над ответом...
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="pt-3 flex-shrink-0">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Напиши сообщение..."
                    className="w-full min-h-[88px] rounded-xl border border-[var(--color-lavender)]/40 bg-white/90 p-3 text-sm text-[var(--color-text-primary)] mb-2 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/30 resize-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={loadingReply || !inputText.trim()}
                    className="w-full py-3 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-50 shadow-md"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {loadingReply ? 'Отправка...' : 'Отправить'}
                  </button>
                  {error && <p className="text-sm text-amber-700 mt-2">{error}</p>}
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
      <header className="card-premium h-14 flex items-center justify-between px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Самореализация</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[var(--color-text-secondary)] hover:bg-black/5"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={musicMuted ? 'Включить музыку' : 'Выключить музыку'}
          >
            {musicMuted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium text-[var(--color-glow-teal)]"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Выбери направление — откроется страница для глубокой работы в диалоге с ИИ.
        </motion.p>

        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li key={dir.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <button
                type="button"
                onClick={() => void openDirection(dir)}
                disabled={isFadingOut}
                className="w-full text-left card-premium p-5 rounded-2xl min-h-[88px] transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-70 shadow-md"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>{dir.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">{dir.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{dir.description}</p>
                  </div>
                </div>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
