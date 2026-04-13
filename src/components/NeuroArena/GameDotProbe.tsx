import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import dotProbeData from '../../data/neuroArenaDotProbe.json'

export type DotProbeStimulus = {
  id: string
  category: string
  threat: string
  neutral: string
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

const TRIALS = 22
const FIX_MS = 380
const CUE_MS = 520
const BLANK_MS = 100
const PROBE_MS = 2400

export type DotProbeResult = {
  score: number
  accuracy: number
  avgReactionMs: number
  stimuliCount: number
  playtimeSec: number
}

type Props = {
  onComplete: (r: DotProbeResult) => void
  onBack: () => void
}

export function GameDotProbe({ onComplete, onBack }: Props) {
  const reduce = useReducedMotion()
  const startedAt = useRef<number>(performance.now())
  const [trials] = useState(() => shuffle(dotProbeData.stimuli as DotProbeStimulus[]).slice(0, TRIALS))
  const [trialIndex, setTrialIndex] = useState(0)
  const trialIdxRef = useRef(0)
  const [sub, setSub] = useState<'fix' | 'cue' | 'blank' | 'probe'>('fix')
  const [neutralLeft, setNeutralLeft] = useState(true)
  const probeStartRef = useRef(0)
  const answeredRef = useRef(false)
  const rtsRef = useRef<number[]>([])
  const correctRef = useRef(0)
  const timeoutsRef = useRef<number[]>([])
  const finishTrialRef = useRef<(correct: boolean, rt: number) => void>(() => {})

  useEffect(() => {
    trialIdxRef.current = trialIndex
  }, [trialIndex])

  const pair = trials[trialIndex]

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id))
    timeoutsRef.current = []
  }, [])

  const finishTrial = useCallback(
    (correct: boolean, rt: number) => {
      if (correct) {
        correctRef.current += 1
        rtsRef.current.push(Math.min(rt, PROBE_MS))
      }
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(correct ? 'light' : 'medium')

      const idx = trialIdxRef.current
      if (idx + 1 >= trials.length) {
        const n = trials.length
        const acc = (correctRef.current / n) * 100
        const rts = rtsRef.current
        const avgRt = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0
        const score = Math.min(
          10000,
          correctRef.current * 42 + Math.max(0, Math.round(480 - avgRt / 2.5)),
        )
        const playtimeSec = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000))
        onComplete({
          score,
          accuracy: Math.round(acc * 10) / 10,
          avgReactionMs: avgRt,
          stimuliCount: n,
          playtimeSec,
        })
        return
      }
      setTrialIndex(idx + 1)
      setSub('fix')
    },
    [trials.length, onComplete, trials],
  )

  useEffect(() => {
    finishTrialRef.current = finishTrial
  }, [finishTrial])

  useEffect(() => {
    setNeutralLeft(Math.random() < 0.5)
  }, [trialIndex])

  useEffect(() => {
    if (!pair) return
    clearTimers()
    answeredRef.current = false
    if (sub === 'fix') {
      const t = window.setTimeout(() => setSub('cue'), FIX_MS)
      timeoutsRef.current.push(t)
    } else if (sub === 'cue') {
      const t = window.setTimeout(() => setSub('blank'), CUE_MS)
      timeoutsRef.current.push(t)
    } else if (sub === 'blank') {
      const t = window.setTimeout(() => setSub('probe'), BLANK_MS)
      timeoutsRef.current.push(t)
    }
    return clearTimers
  }, [sub, trialIndex, pair, clearTimers])

  useEffect(() => {
    if (sub !== 'probe') return
    probeStartRef.current = performance.now()
    const t = window.setTimeout(() => {
      if (!answeredRef.current) {
        answeredRef.current = true
        finishTrialRef.current(false, PROBE_MS)
      }
    }, PROBE_MS)
    timeoutsRef.current.push(t)
    return () => clearTimeout(t)
  }, [sub, trialIndex])

  const onTap = (side: 'left' | 'right') => {
    if (sub !== 'probe' || answeredRef.current || !pair) return
    answeredRef.current = true
    const rt = performance.now() - probeStartRef.current
    const isNeutral = side === 'left' ? neutralLeft : !neutralLeft
    finishTrial(isNeutral, rt)
  }

  if (!pair) {
    return (
      <div className="px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">Загрузка…</div>
    )
  }

  const leftEmoji = neutralLeft ? pair.neutral : pair.threat
  const rightEmoji = neutralLeft ? pair.threat : pair.neutral

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
          {trialIndex + 1} / {trials.length}
        </span>
      </div>

      <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
        Нажми на мишень там, где было <span className="text-[var(--color-glow-teal-dim)] font-semibold">спокойное</span>{' '}
        изображение.
      </p>

      <div className="flex-1 flex flex-col justify-center">
        <div className="relative rounded-3xl overflow-hidden border border-white/40 bg-white/25 shadow-[0_8px_32px_rgba(45,62,46,0.12)] min-h-[220px]">
          {(sub === 'fix' || sub === 'cue' || sub === 'blank') && (
            <div className="flex h-[220px]">
              <div className="flex-1 flex items-center justify-center text-5xl sm:text-6xl border-r border-white/30 bg-white/10">
                {sub === 'cue' ? leftEmoji : sub === 'fix' ? '+' : ''}
              </div>
              <div className="flex-1 flex items-center justify-center text-5xl sm:text-6xl bg-white/10">
                {sub === 'cue' ? rightEmoji : sub === 'fix' ? '+' : ''}
              </div>
            </div>
          )}
          {sub === 'probe' && (
            <div className="flex h-[220px]">
              <button
                type="button"
                className="flex-1 flex items-center justify-center border-r border-white/30 bg-gradient-to-br from-white/30 to-white/5 active:scale-[0.98] transition-transform"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                onPointerDown={() => onTap('left')}
              >
                <motion.span
                  className="w-14 h-14 rounded-full bg-[var(--color-sunset-rose-deep)] shadow-lg shadow-[#d89a9f]/40"
                  initial={reduce ? false : { scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                />
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center bg-gradient-to-br from-white/30 to-white/5 active:scale-[0.98] transition-transform"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                onPointerDown={() => onTap('right')}
              >
                <motion.span
                  className="w-14 h-14 rounded-full bg-[var(--color-sunset-rose-deep)] shadow-lg shadow-[#d89a9f]/40"
                  initial={reduce ? false : { scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-[var(--color-text-secondary)] mt-6 leading-relaxed opacity-85">
        Парадигма dot-probe: мишень на стороне нейтрального стимула — тренируется переключение внимания.
      </p>
    </div>
  )
}
