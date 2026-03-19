import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import { apiSelfRealizationWelcome } from '../api/client'

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

function playChime(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, start)
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration)
      osc.start(start)
      osc.stop(start + duration)
    }
    playTone(523.25, 0, 0.12)
    playTone(659.25, 0.14, 0.2)
  } catch {
    /* ignore */
  }
}

interface SelfRealizationProps {
  onBack: () => void
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const [welcomeLoading, setWelcomeLoading] = useState(true)
  const [welcomeError, setWelcomeError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chimePlayed = useRef(false)

  const playWelcomeAudio = useCallback(async (audioUrl: string) => {
    if (!audioUrl) return
    try {
      const res = await fetch(audioUrl, { mode: 'cors' })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      await audio.play()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (chimePlayed.current) return
    chimePlayed.current = true
    playChime()
  }, [])

  useEffect(() => {
    let cancelled = false
    setWelcomeError(null)
    apiSelfRealizationWelcome()
      .then((result) => {
        if (cancelled) return
        if ('error' in result) {
          setWelcomeError(result.error)
          setWelcomeLoading(false)
          return
        }
        setWelcomeLoading(false)
        if (result.audioUrl) playWelcomeAudio(result.audioUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setWelcomeError('Не удалось загрузить приветствие')
          setWelcomeLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [playWelcomeAudio])

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="card-premium h-14 flex items-center justify-between px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold select-none tracking-tight text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Самореализация
        </h1>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-medium text-[var(--color-glow-teal)] active:opacity-80 select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        {welcomeLoading && (
          <motion.p
            className="text-sm text-[var(--color-text-secondary)] py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Загрузка…
          </motion.p>
        )}
        {welcomeError && (
          <motion.p
            className="text-sm text-amber-700 dark:text-amber-400 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {welcomeError}
          </motion.p>
        )}

        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          Выбери направление — опиши трудности, и мы будем работать над ними вместе с ИИ.
        </motion.p>

        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.1 },
            },
          }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li
              key={dir.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <button
                type="button"
                className="w-full text-left card-premium p-5 rounded-2xl min-h-[88px] transition-all hover:shadow-lg active:scale-[0.99]"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {dir.icon}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                      {dir.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {dir.description}
                    </p>
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
