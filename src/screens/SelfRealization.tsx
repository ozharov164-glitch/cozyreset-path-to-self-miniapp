import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import { apiSelfRealizationWelcome, apiSelfRealizationChat } from '../api/client'

const DIRECTIONS = [
  {
    id: 'confidence',
    title: 'Уверенность в обществе',
    description: 'Общение, границы, самопрезентация — опора в контакте с людьми.',
    icon: '🌟',
  },
  {
    id: 'study',
    title: 'Учёба и концентрация',
    description: 'Фокус, запоминание, режим — чтобы учиться без выгорания.',
    icon: '📚',
  },
  {
    id: 'goals',
    title: 'Цели и дисциплина',
    description: 'Планирование, привычки, движение к целям шаг за шагом.',
    icon: '🎯',
  },
  {
    id: 'antiprocrastination',
    title: 'Анти‑прокрастинация',
    description: 'Старт дела, откладывание, внутреннее сопротивление — разбираем и двигаемся.',
    icon: '⏳',
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

function fadeAudioTo(audio: HTMLAudioElement, target: number, ms = 600): Promise<void> {
  const start = audio.volume
  const diff = target - start
  const steps = 20
  const stepMs = Math.max(15, Math.floor(ms / steps))
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
  const [inputText, setInputText] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const voiceRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let mounted = true
    const stopTone = startTinyIntroTone()

    const bg = new Audio('/cozyreset-path-to-self-miniapp/audio/powerful-maxkomusic.mp3')
    bg.loop = true
    bg.preload = 'auto'
    bg.volume = 0.01
    bgMusicRef.current = bg
    bg.play().then(() => fadeAudioTo(bg, 0.2, 850)).catch(() => {
      /* autoplay can be blocked in some webviews */
    })

    const unlockBgOnTap = () => {
      const current = bgMusicRef.current
      if (!current) return
      current.play().then(() => fadeAudioTo(current, 0.2, 650)).catch(() => {
        /* ignore */
      })
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
    return `Отличный выбор — ${selectedDirection.title.toLowerCase()}. Опиши свою текущую ситуацию, и я помогу разобрать её по шагам.`
  }, [selectedDirection])

  useEffect(() => {
    if (!selectedDirection) return
    setMessages([{ role: 'assistant', content: directionWelcome }])
    setInputText('')
    setError(null)
  }, [selectedDirection, directionWelcome])

  const openDirection = async (dir: Direction) => {
    const bg = bgMusicRef.current
    if (bg) {
      await fadeAudioTo(bg, 0.01, 500)
      bg.pause()
    }
    setSelectedDirection(dir)
  }

  const sendMessage = async () => {
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
      history: nextMessages,
    })

    if ('error' in result) {
      setError(result.error)
      setLoadingReply(false)
      return
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }])
    setLoadingReply(false)
  }

  if (selectedDirection) {
    return (
      <div className="min-h-screen flex flex-col safe-area">
        <header className="card-premium h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedDirection(null)}
            className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          >
            ← Назад
          </button>
          <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">{selectedDirection.title}</h1>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium text-[var(--color-glow-teal)]"
          >
            В бота
          </button>
        </header>

        <div className="flex-1 flex flex-col max-w-[460px] mx-auto w-full pb-3">
          <div className="card-premium rounded-2xl p-4 mb-3">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Здесь работа идёт в тандеме с ИИ: глубоко, текстом и по шагам.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-3 text-sm leading-relaxed ${
                  m.role === 'assistant'
                    ? 'card-premium text-[var(--color-text-primary)]'
                    : 'bg-[var(--color-glow-teal)]/15 border border-[var(--color-glow-teal)]/40 text-[var(--color-forest-dark)]'
                }`}
              >
                {m.content}
              </motion.div>
            ))}
            {loadingReply && (
              <div className="card-premium rounded-2xl p-3 text-sm text-[var(--color-text-secondary)]">ИИ думает над твоим запросом...</div>
            )}
          </div>

          <div className="pt-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Опиши ситуацию, в которой хочешь продвинуться..."
              className="w-full min-h-[98px] rounded-xl border border-[var(--color-lavender)]/40 bg-white/70 p-3 text-sm text-[var(--color-text-primary)] mb-2 outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={loadingReply || !inputText.trim()}
              className="w-full py-3 px-4 rounded-xl btn-primary min-h-[48px] disabled:opacity-60"
            >
              {loadingReply ? 'Генерация ответа...' : 'Получить текстовый ответ ИИ'}
            </button>
            {error && <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">{error}</p>}
          </div>
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
        >
          ← Назад
        </button>
        <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Самореализация</h1>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 rounded-xl text-sm font-medium text-[var(--color-glow-teal)]"
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Выбери направление — откроется отдельная страница для глубокой текстовой работы с ИИ.
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
                className="w-full text-left card-premium p-5 rounded-2xl min-h-[88px] transition-all hover:shadow-lg active:scale-[0.99]"
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
