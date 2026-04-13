import { useCallback, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import scenariosData from '../../data/neuroArenaScenarios.json'

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
  const startedAt = useRef(performance.now())
  const [rounds] = useState(() => shuffle(scenariosData.scenarios as ScenarioItem[]).slice(0, ROUND_COUNT))
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

  if (!item) {
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
        Выбери завершение, которое <span className="font-semibold text-[var(--color-glow-teal-dim)]">мягче</span> и
        полезнее для тебя сейчас.
      </p>

      <motion.div
        className="rounded-3xl border border-white/45 bg-white/30 p-5 mb-5 shadow-[0_8px_28px_rgba(45,62,46,0.1)]"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={item.id}
        transition={{ duration: 0.35 }}
      >
        <p className="text-[16px] font-semibold text-[var(--color-text-primary)] leading-relaxed">{item.text}</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {buttons.map((b, i) => (
          <button
            type="button"
            key={`${item.id}-${i}`}
            disabled={!!feedback}
            onClick={() => pick(b.positive)}
            className={`w-full text-left py-4 px-4 rounded-2xl border border-white/50 active:scale-[0.99] transition-all text-[15px] leading-snug text-[var(--color-text-primary)] min-h-[72px] disabled:opacity-60 ${
              b.positive
                ? 'bg-white/40 font-semibold hover:bg-white/48'
                : 'bg-white/22 font-normal hover:bg-white/30'
            }`}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            {b.text}
          </button>
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
        Задания в духе CBM-I: тренировка интерпретации неоднозначных ситуаций. Не медицинская диагностика.
      </p>
    </div>
  )
}
