import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const CELLS = 9

function sleep(ms: number): Promise<void> {
  return new Promise((r) => {
    window.setTimeout(r, ms)
  })
}

export type MemoryMatrixResult = {
  score: number
  accuracy: number
  avgReactionMs: null
  stimuliCount: number
  playtimeSec: number
}

type Props = {
  onComplete: (r: MemoryMatrixResult) => void
  onBack: () => void
}

type Phase = 'intro' | 'playing'

/**
 * Тренировка: последовательность удлиняется до ошибки.
 * Счёт — число полностью пройденных раундов (длина последней удачной цепочки).
 */
export function GameMemoryMatrix({ onComplete, onBack }: Props) {
  const reduce = useReducedMotion()
  const startedAt = useRef(0)
  const sequenceRef = useRef<number[]>([])
  const inputIndexRef = useRef(0)
  const generationRef = useRef(0)
  const mountedRef = useRef(true)
  const flashesRef = useRef(0)
  const tapsRef = useRef(0)
  const okTapsRef = useRef(0)

  const [phase, setPhase] = useState<Phase>('intro')
  const [highlight, setHighlight] = useState<number | null>(null)
  const [mode, setMode] = useState<'watch' | 'repeat' | null>(null)
  const [canTap, setCanTap] = useState(false)
  /** Длина текущей цепочки (для отображения; обновляется вместе с sequenceRef). */
  const [chainLen, setChainLen] = useState(1)

  const highlightMs = reduce ? 720 : 480
  const gapMs = reduce ? 320 : 200

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const playSequence = useCallback(
    async (seq: number[], gen: number) => {
      setMode('watch')
      setCanTap(false)
      setHighlight(null)
      await sleep(reduce ? 220 : 140)
      if (!mountedRef.current || generationRef.current !== gen) return
      for (let i = 0; i < seq.length; i++) {
        if (!mountedRef.current || generationRef.current !== gen) return
        const cell = seq[i]!
        setHighlight(cell)
        flashesRef.current += 1
        await sleep(highlightMs)
        setHighlight(null)
        await sleep(gapMs)
      }
      if (!mountedRef.current || generationRef.current !== gen) return
      setMode('repeat')
      setCanTap(true)
      inputIndexRef.current = 0
    },
    [gapMs, highlightMs, reduce],
  )

  const finish = useCallback(
    (finalScore: number) => {
      const taps = tapsRef.current
      const ok = okTapsRef.current
      const flashes = flashesRef.current
      const acc = taps > 0 ? Math.min(100, Math.round((ok / taps) * 1000) / 10) : 0
      const stimuliCount = Math.max(2, flashes + taps)
      const playtimeSec = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000))
      onComplete({
        score: finalScore,
        accuracy: acc,
        avgReactionMs: null,
        stimuliCount,
        playtimeSec,
      })
    },
    [onComplete],
  )

  const startRoundAfterSuccess = useCallback(async () => {
    const gen = ++generationRef.current
    const seq = sequenceRef.current
    await playSequence(seq, gen)
  }, [playSequence])

  const beginSession = useCallback(() => {
    generationRef.current += 1
    sequenceRef.current = [Math.floor(Math.random() * CELLS)]
    setChainLen(sequenceRef.current.length)
    inputIndexRef.current = 0
    flashesRef.current = 0
    tapsRef.current = 0
    okTapsRef.current = 0
    startedAt.current = performance.now()
    setPhase('playing')
    setMode('watch')
    void startRoundAfterSuccess()
  }, [startRoundAfterSuccess])

  const onCellPress = useCallback(
    (index: number) => {
      if (phase !== 'playing' || !canTap || mode !== 'repeat') return
      const seq = sequenceRef.current
      const i = inputIndexRef.current
      const expected = seq[i]
      tapsRef.current += 1
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light')

      if (expected !== index) {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium')
        generationRef.current += 1
        setCanTap(false)
        const finalScore = Math.max(0, seq.length - 1)
        finish(finalScore)
        return
      }

      okTapsRef.current += 1
      if (i + 1 >= seq.length) {
        generationRef.current += 1
        setCanTap(false)
        seq.push(Math.floor(Math.random() * CELLS))
        sequenceRef.current = seq
        setChainLen(seq.length)
        void startRoundAfterSuccess()
      } else {
        inputIndexRef.current = i + 1
      }
    },
    [canTap, finish, mode, phase, startRoundAfterSuccess],
  )

  if (phase === 'intro') {
    return (
      <div className="flex flex-col min-h-[60vh] px-3 pb-8 max-w-[420px] mx-auto w-full">
        <div className="flex items-center justify-between mb-5 shrink-0">
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
            Память · последовательность
          </p>
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4 leading-snug">
            Матрица памяти
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            Запоминайте порядок подсветки ячеек и воспроизводите его по нажатиям. С каждым удачным раундом цепочка
            становится длиннее. Если нажали не ту ячейку — сессия завершается. Это тренировка внимания и рабочей памяти,
            не диагностика и не медицинское исследование.
          </p>
          <button
            type="button"
            onClick={beginSession}
            className="w-full py-3.5 rounded-xl btn-primary font-semibold min-h-[48px]"
          >
            Начать
          </button>
        </div>
      </div>
    )
  }

  const statusText =
    mode === 'watch'
      ? 'Смотрите на подсветку'
      : mode === 'repeat'
        ? 'Повторите последовательность'
        : ''

  return (
    <div className="flex flex-col min-h-[min(100dvh,780px)] px-3 pb-8 max-w-[420px] mx-auto w-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
        >
          ← Выход
        </button>
        <span className="font-display text-sm font-semibold text-[var(--color-text-secondary)] tabular-nums">
          Ячеек в цепочке: {chainLen}
        </span>
      </div>

      <div
        className="min-h-[4.75rem] mb-4 flex flex-col items-center justify-center text-center px-2"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug min-h-[2.75rem] flex items-center justify-center">
          {statusText}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 min-h-[1.25rem]">
          {mode === 'repeat' ? 'Нажимайте по очереди, как запомнили.' : '\u00a0'}
        </p>
      </div>

      <div className="w-full max-w-[min(100%,19rem)] aspect-square mx-auto mb-6">
        <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2.5 p-0">
          {Array.from({ length: CELLS }, (_, i) => {
            const isOn = highlight === i
            return (
              <motion.button
                key={i}
                type="button"
                disabled={!canTap}
                onClick={() => onCellPress(i)}
                className={[
                  'relative min-h-0 min-w-0 rounded-2xl border transition-[background-color,box-shadow] duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,255,255,0.4)]',
                  canTap ? 'cursor-pointer active:opacity-95' : 'cursor-default opacity-95',
                  isOn
                    ? 'border-[var(--color-glow-teal)] bg-[rgba(107,196,181,0.42)] shadow-[inset_0_0_0_2px_rgba(74,171,156,0.55),0_0_28px_rgba(74,171,156,0.28)]'
                    : 'border-white/55 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
                ].join(' ')}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                aria-label={`Ячейка ${i + 1}`}
                animate={
                  isOn && !reduce
                    ? { opacity: [0.88, 1, 1] }
                    : { opacity: canTap || mode === 'watch' ? 1 : 0.88 }
                }
                transition={{ duration: 0.2 }}
              />
            )
          })}
        </div>
      </div>

      <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed px-1">
        Подсказка: держите взгляд на центре поля — так проще удерживать порядок.
      </p>
    </div>
  )
}
