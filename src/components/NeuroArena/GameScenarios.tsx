import { useCallback, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import scenariosData from '../../data/neuroArenaScenarios.json'
import { NEURO_ARENA_POOL_KEYS, takeUniqueBatchById } from '../../utils/neuroArenaSessionPool'

export type ScenarioItem = {
  id: string
  category: string
  text: string
  positive_ending: string
  negative_ending: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }
  return a
}

const ROUND_COUNT = 14

const ALL_SCENARIOS = scenariosData.scenarios as ScenarioItem[]

export type ScenariosResult = {
  score: number
  accuracy: number
  avgReactionMs: null
  stimuliCount: number
  playtimeSec: number
}

type Props = {
  onComplete: (r: ScenariosResult) => void
  onBack: () => void
}

export function GameScenarios({ onComplete, onBack }: Props) {
  const reduce = useReducedMotion()
  const startedAt = useRef(0)
  const [phase, setPhase] = useState<'intro' | 'playing'>('intro')
  const [rounds, setRounds] = useState<ScenarioItem[]>([])
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const correctRef = useRef(0)

  const item = rounds[idx]

  const buttons = useMemo(() => {
    if (!item) return [] as { positive: boolean; text: string }[]
    const pos = { positive: true, text: item.positive_ending }
    const neg = { positive: false, text: item.negative_ending }
    return Math.random() < 0.5 ? [pos, neg] : [neg, pos]
  }, [item])

  const finish = useCallback(() => {
    const n = rounds.length
    const acc = (correctRef.current / n) * 100
    const score = Math.min(10000, Math.round(correctRef.current * 65 + acc * 2))
    const playtimeSec = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000))
    onComplete({
      score,
      accuracy: Math.round(acc * 10) / 10,
      avgReactionMs: null,
      stimuliCount: n,
      playtimeSec,
    })
  }, [onComplete, rounds.length])

  const pick = (chosePositive: boolean) => {
    if (!item || feedback) return
    const ok = chosePositive
    if (ok) {
      correctRef.current += 1
      setFeedback('Верно: можно удерживать и такую интерпретацию — она часто менее тяжёлая.')
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light')
    } else {
      setFeedback(
        'Можно по-разному: негативная версия не «ошибка», но есть и более нейтральные объяснения — в следующий раз попробуй мягкий вариант.',
      )
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium')
    }
    window.setTimeout(() => {
      setFeedback(null)
      if (idx + 1 >= rounds.length) {
        finish()
      } else {
        setIdx((i) => i + 1)
      }
    }, ok ? 900 : 1400)
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col min-h-[60vh] px-3 pb-8 max-w-[420px] mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={onBack}
            className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          >
            ← Выход
          </button>
        </div>

        <div className="rounded-[1.35rem] border border-white/50 bg-white/35 px-5 py-6 shadow-[0_12px_40px_rgba(45,62,46,0.11)] mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
            Интерпретации
          </p>
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4 leading-snug">
            Сценарии
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            Прочитай ситуацию и выбери одно из двух завершений — то, которое сейчас кажется тебе мягче и менее
            тяжёлым. Оба варианта оформлены одинаково; ориентируйся на собственное ощущение, а не на «красивость»
            формулировки.
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed opacity-90">
            Упражнение в духе CBM-I: тренировка гибкости толкования, не диагностика.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const batch = takeUniqueBatchById(NEURO_ARENA_POOL_KEYS.scenarios, ALL_SCENARIOS, ROUND_COUNT)
            setRounds(shuffle(batch))
            setIdx(0)
            correctRef.current = 0
            startedAt.current = performance.now()
            setPhase('playing')
          }}
          className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[52px] font-semibold text-[15px]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          Начать сценарии
        </button>
      </div>
    )
  }

  if (!item || rounds.length === 0) {
    return <div className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">Загрузка…</div>
  }

  return (
    <div className="flex flex-col min-h-[60vh] px-3 pb-8 max-w-[420px] mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
        >
          ← Выход
        </button>
        <span className="text-sm font-semibold text-[var(--color-text-secondary)] tabular-nums">
          {idx + 1} / {rounds.length}
        </span>
      </div>

      <p className="text-center text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
        Выбери завершение, которое сейчас кажется тебе мягче и менее бременем.
      </p>

      <motion.div
        className="rounded-3xl border border-white/45 bg-white/30 p-5 mb-5 shadow-[0_8px_28px_rgba(45,62,46,0.1)]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={item.id}
        transition={{ duration: 0.35 }}
      >
        <p className="text-[16px] font-medium text-[var(--color-text-primary)] leading-relaxed">{item.text}</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {buttons.map((b, i) => (
          <div key={`${item.id}-${i}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-1.5 px-0.5">
              Вариант {i === 0 ? 'А' : 'Б'}
            </p>
            <button
              type="button"
              disabled={!!feedback}
              onClick={() => pick(b.positive)}
              className="w-full text-left py-4 px-4 rounded-2xl border border-white/50 bg-white/32 hover:bg-white/40 active:scale-[0.99] transition-all text-[15px] font-medium leading-snug text-[var(--color-text-primary)] min-h-[72px] disabled:opacity-60"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {b.text}
            </button>
          </div>
        ))}
      </div>

      {feedback && (
        <motion.p
          className="mt-5 text-sm text-[var(--color-text-secondary)] leading-relaxed text-center px-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {feedback}
        </motion.p>
      )}

      <p className="text-xs text-center text-[var(--color-text-secondary)] mt-8 leading-relaxed opacity-85">
        Неоднозначные ситуации можно читать по-разному; здесь ты тренируешь выбор менее тяжёлого прочтения. Не
        диагностика.
      </p>
    </div>
  )
}
