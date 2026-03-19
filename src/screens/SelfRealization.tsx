import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import { apiSelfRealizationWelcome, apiVoiceReply } from '../api/client'

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
    difficulties: ['Трудно сосредоточиться', 'Быстро устаю', 'Сложно запоминать', 'Откладываю учебу'],
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

function playChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const start = ctx.currentTime

    const addTone = (freq: number, from: number, dur: number, volume: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, from)
      osc.connect(gain)
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.0001, from)
      gain.gain.exponentialRampToValueAtTime(volume, from + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, from + dur)
      osc.start(from)
      osc.stop(from + dur + 0.01)
    }

    addTone(392, start, 0.22, 0.045)
    addTone(523.25, start + 0.12, 0.28, 0.04)
    addTone(659.25, start + 0.26, 0.38, 0.035)
  } catch {
    /* ignore */
  }
}

function buildPrompt(direction: Direction, selected: string[], details: string): string {
  const selectedText = selected.length ? selected.join(', ') : 'без выбранных пунктов'
  const ownText = (details || '').trim() || 'без дополнительного описания'
  return [
    'Ты мягкий, спокойный психологический ассистент.',
    `Направление: ${direction.title}.`,
    `Трудности: ${selectedText}.`,
    `Описание пользователя: ${ownText}.`,
    'Дай короткую поддерживающую речь на русском (до 120 слов):',
    '1) валидация чувств;',
    '2) 2-3 маленьких практичных шага на сегодня;',
    '3) тёплое завершение без давления.',
  ].join('\n')
}

interface SelfRealizationProps {
  onBack: () => void
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const [welcomeLoading, setWelcomeLoading] = useState(true)
  const [welcomeError, setWelcomeError] = useState<string | null>(null)
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null)
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [details, setDetails] = useState('')
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null)

  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null)
  const adviceAudioRef = useRef<HTMLAudioElement | null>(null)
  const chimePlayed = useRef(false)

  const playWelcomeAudio = useCallback(async (audioUrl: string) => {
    try {
      const res = await fetch(audioUrl, { mode: 'cors' })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      welcomeAudioRef.current = audio
      audio.onended = () => {
        URL.revokeObjectURL(url)
        welcomeAudioRef.current = null
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        welcomeAudioRef.current = null
      }
      await audio.play()
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (!chimePlayed.current) {
      chimePlayed.current = true
      playChime()
    }
    const onFirstTouch = () => {
      if (!chimePlayed.current) {
        chimePlayed.current = true
        playChime()
      }
      window.removeEventListener('pointerdown', onFirstTouch)
    }
    window.addEventListener('pointerdown', onFirstTouch, { once: true })
    return () => window.removeEventListener('pointerdown', onFirstTouch)
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
      if (welcomeAudioRef.current) {
        welcomeAudioRef.current.pause()
        welcomeAudioRef.current = null
      }
      if (adviceAudioRef.current) {
        adviceAudioRef.current.pause()
        adviceAudioRef.current = null
      }
      if (voiceUrl) URL.revokeObjectURL(voiceUrl)
    }
  }, [playWelcomeAudio, voiceUrl])

  const toggleDifficulty = (value: string) => {
    setSelectedDifficulties((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]))
  }

  const onOpenDirection = (dir: Direction) => {
    setActiveDirection(dir)
    setSelectedDifficulties([])
    setDetails('')
    setVoiceError(null)
    setVoiceUrl(null)
  }

  const onGenerateVoice = async () => {
    if (!activeDirection) return
    setVoiceError(null)
    setVoiceLoading(true)
    if (adviceAudioRef.current) adviceAudioRef.current.pause()
    try {
      const prompt = buildPrompt(activeDirection, selectedDifficulties, details)
      const result = await apiVoiceReply(prompt)
      if ('error' in result) {
        setVoiceError(result.error || 'Не удалось получить голосовой ответ')
        return
      }
      const url = URL.createObjectURL(result.blob)
      setVoiceUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      const audio = new Audio(url)
      adviceAudioRef.current = audio
      await audio.play()
    } catch {
      setVoiceError('Ошибка воспроизведения')
    } finally {
      setVoiceLoading(false)
    }
  }

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
        <h1 className="text-base font-bold text-[var(--color-text-primary)] tracking-tight">Самореализация</h1>
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
          <motion.p className="text-sm text-[var(--color-text-secondary)] py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Загружаем приветствие...
          </motion.p>
        )}
        {welcomeError && (
          <motion.p className="text-sm text-amber-700 dark:text-amber-400 py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {welcomeError}
          </motion.p>
        )}

        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          Выбери направление, отметь трудности и получи мягкую голосовую поддержку с конкретными шагами.
        </motion.p>

        <motion.ul
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li
              key={dir.id}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <button
                type="button"
                onClick={() => onOpenDirection(dir)}
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

      <AnimatePresence>
        {activeDirection && (
          <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/45" onClick={() => setActiveDirection(null)} aria-label="Закрыть" />
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl card-premium p-5 max-h-[82vh] overflow-y-auto"
              initial={{ y: 40, opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0.8 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">{activeDirection.icon} {activeDirection.title}</h3>
                <button className="text-sm text-[var(--color-glow-teal)]" onClick={() => setActiveDirection(null)}>
                  Закрыть
                </button>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">Что сейчас откликается сильнее всего?</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {activeDirection.difficulties.map((item) => {
                  const active = selectedDifficulties.includes(item)
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDifficulty(item)}
                      className={`px-3 py-2 rounded-xl text-sm border ${active ? 'bg-[var(--color-glow-teal)]/15 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)]' : 'border-[var(--color-lavender)]/40 text-[var(--color-text-secondary)]'}`}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Опиши коротко, где тебе сейчас сложнее всего..."
                className="w-full min-h-[100px] rounded-xl border border-[var(--color-lavender)]/40 bg-white/60 p-3 text-sm text-[var(--color-text-primary)] mb-4 outline-none"
              />

              <button
                type="button"
                disabled={voiceLoading}
                onClick={onGenerateVoice}
                className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] disabled:opacity-60"
              >
                {voiceLoading ? 'Генерируем мягкий голос...' : 'Получить голосовую поддержку'}
              </button>

              {voiceError && <p className="text-sm text-amber-700 dark:text-amber-400 mt-3">{voiceError}</p>}
              {voiceUrl && !voiceLoading && (
                <audio controls src={voiceUrl} className="w-full mt-3" preload="metadata" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
