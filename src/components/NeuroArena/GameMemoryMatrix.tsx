import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { playTapCell, playTapWrong, preloadMemoryMatrixTap, primeMemoryMatrixAudio } from './memoryMatrixAudio'
import {
  joinPhraseWords,
  loadPhraseGender,
  pickRandomPhrase,
  prefixWords,
  type PhraseGender,
  type PhraseRow,
  savePhraseGender,
  wordsForPhrase,
} from './memoryMatrixPhrases'

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
  phraseId: string | null
  phrasePrefix: string | null
  phraseFull: string | null
  phraseCompleted: boolean
  phraseGender: PhraseGender
}

type Props = {
  onComplete: (r: MemoryMatrixResult) => void
  onBack: () => void
}

type Phase = 'intro' | 'playing' | 'endFail' | 'endWin'

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.06 },
  },
}

const gridCell = {
  hidden: { opacity: 0, y: 10, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 420, damping: 28, mass: 0.65 },
  },
}

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

  const phraseRowRef = useRef<PhraseRow | null>(null)
  const phraseWordsRef = useRef<string[]>([])
  const [phase, setPhase] = useState<Phase>('intro')
  const [gender, setGender] = useState<PhraseGender>(() => loadPhraseGender())
  const [highlight, setHighlight] = useState<number | null>(null)
  const [mode, setMode] = useState<'watch' | 'repeat' | null>(null)
  const [canTap, setCanTap] = useState(false)
  const [chainLen, setChainLen] = useState(1)

  const [endFailPrefix, setEndFailPrefix] = useState('')
  const [endWinFull, setEndWinFull] = useState('')
  /** Длина фразы в словах — для шапки во время игры (ref не даёт перерисовку). */
  const [phraseWordCount, setPhraseWordCount] = useState(0)
  /** Текст фразы, уже «собранный» в текущем раунде повтора (обновляется после каждого верного тапа). */
  const [phraseLine, setPhraseLine] = useState('')
  /** Полная фраза собрана без ошибки — показываем премиальный баннер, затем экран победы. */
  const [phraseWinCelebration, setPhraseWinCelebration] = useState(false)
  const winCelebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const highlightMs = reduce ? 720 : 480
  const gapMs = reduce ? 320 : 200

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (winCelebrationTimerRef.current) {
        clearTimeout(winCelebrationTimerRef.current)
        winCelebrationTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    preloadMemoryMatrixTap()
  }, [])

  const playSequence = useCallback(
    async (seq: number[], gen: number) => {
      setMode('watch')
      setCanTap(false)
      setPhraseLine('')
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

  const startRoundAfterSuccess = useCallback(async () => {
    const gen = ++generationRef.current
    const seq = sequenceRef.current
    await playSequence(seq, gen)
  }, [playSequence])

  const submitResult = useCallback(
    (opts: { finalScore: number; completed: boolean; phrasePrefixText: string | null }) => {
      const taps = tapsRef.current
      const ok = okTapsRef.current
      const flashes = flashesRef.current
      const completed = opts.completed
      const acc =
        taps > 0 ? Math.min(100, Math.round((ok / taps) * 1000) / 10) : completed ? 100 : 0
      const stimuliCount = Math.max(2, flashes + taps)
      const playtimeSec = Math.max(1, Math.round((performance.now() - startedAt.current) / 1000))
      const pr = phraseRowRef.current
      const words = phraseWordsRef.current
      const full = words.length ? joinPhraseWords(words) : null
      onComplete({
        score: opts.finalScore,
        accuracy: acc,
        avgReactionMs: null,
        stimuliCount,
        playtimeSec,
        phraseId: pr?.id ?? null,
        phrasePrefix: opts.phrasePrefixText,
        phraseFull: full,
        phraseCompleted: completed,
        phraseGender: gender,
      })
    },
    [gender, onComplete],
  )

  const beginSession = useCallback(async () => {
    await primeMemoryMatrixAudio()
    savePhraseGender(gender)
    const picked = pickRandomPhrase()
    phraseRowRef.current = picked
    const w = wordsForPhrase(picked, gender)
    phraseWordsRef.current = w
    setPhraseWordCount(w.length)
    setPhraseLine('')

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
  }, [gender, startRoundAfterSuccess])

  const onCellPress = useCallback(
    (index: number) => {
      if (phase !== 'playing' || !canTap || mode !== 'repeat') return
      const seq = sequenceRef.current
      const i = inputIndexRef.current
      const expected = seq[i]
      const words = phraseWordsRef.current
      const maxLen = words.length

      tapsRef.current += 1
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light')

      if (expected !== index) {
        playTapWrong()
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium')
        generationRef.current += 1
        setCanTap(false)
        const pref = joinPhraseWords(prefixWords(words, i))
        setEndFailPrefix(pref)
        setPhase('endFail')
        return
      }

      playTapCell(index)
      okTapsRef.current += 1
      setPhraseLine(joinPhraseWords(prefixWords(words, i + 1)))

      if (i + 1 >= seq.length) {
        if (seq.length >= maxLen) {
          generationRef.current += 1
          setCanTap(false)
          const fullLine = joinPhraseWords(words)
          setEndWinFull(fullLine)
          if (winCelebrationTimerRef.current) {
            clearTimeout(winCelebrationTimerRef.current)
            winCelebrationTimerRef.current = null
          }
          setPhraseWinCelebration(true)
          try {
            const hf = window.Telegram?.WebApp?.HapticFeedback as
              | { notificationOccurred?: (t: 'success' | 'error' | 'warning') => void }
              | undefined
            hf?.notificationOccurred?.('success')
          } catch {
            /* ignore */
          }
          const delayMs = reduce ? 850 : 2600
          winCelebrationTimerRef.current = setTimeout(() => {
            winCelebrationTimerRef.current = null
            if (!mountedRef.current) return
            setPhraseWinCelebration(false)
            setPhase('endWin')
          }, delayMs)
          return
        }
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
    [canTap, mode, phase, startRoundAfterSuccess],
  )

  const statusText =
    mode === 'watch'
      ? 'Смотрите на подсветку'
      : mode === 'repeat'
        ? 'Повторите последовательность'
        : ''

  if (phase === 'endFail') {
    const pref = endFailPrefix.trim()
    const line = pref ? pref : 'Пока без слов — это нормально: можно попробовать ещё раз.'
    const failScore = Math.max(0, sequenceRef.current.length - 1)

    return (
      <div className="flex flex-col min-h-[min(100dvh,780px)] px-3 pb-8 max-w-[420px] mx-auto w-full safe-area">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              submitResult({ finalScore: failScore, completed: false, phrasePrefixText: pref || null })
            }}
            className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          >
            ← В лобби
          </button>
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.35rem] border border-white/50 bg-white/38 px-5 py-6 shadow-[0_12px_40px_rgba(45,62,46,0.1)] mb-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-secondary)] mb-2">
            Фраза до ошибки
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)] font-medium mb-4">{line}</p>
          <button
            type="button"
            onClick={() => submitResult({ finalScore: failScore, completed: false, phrasePrefixText: pref || null })}
            className="w-full py-3.5 rounded-xl btn-primary font-semibold min-h-[48px]"
          >
            Дальше
          </button>
        </motion.div>
        <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed">
          Текст подобран заранее, чтобы поддержать без спешки. Не медицинский совет.
        </p>
      </div>
    )
  }

  if (phase === 'endWin') {
    const full = endWinFull
    return (
      <div className="flex flex-col min-h-[min(100dvh,780px)] px-3 pb-8 max-w-[420px] mx-auto w-full safe-area">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              const full = joinPhraseWords(phraseWordsRef.current)
              submitResult({ finalScore: phraseWordsRef.current.length, completed: true, phrasePrefixText: full })
            }}
            className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          >
            ← В лобби
          </button>
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.35rem] border border-white/50 bg-white/38 px-5 py-6 shadow-[0_12px_40px_rgba(45,62,46,0.1)] mb-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-glow-teal-dim)] mb-2">
            Целая фраза собрана
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)] font-medium mb-4">{full}</p>
          <button
            type="button"
            onClick={() =>
              submitResult({
                finalScore: phraseWordsRef.current.length,
                completed: true,
                phrasePrefixText: joinPhraseWords(phraseWordsRef.current),
              })
            }
            className="w-full py-3.5 rounded-xl btn-primary font-semibold min-h-[48px]"
          >
            Завершить
          </button>
        </motion.div>
      </div>
    )
  }

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

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.35rem] border border-white/50 bg-white/35 px-5 py-6 shadow-[0_12px_40px_rgba(45,62,46,0.11)] mb-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)] mb-2">
            Память · последовательность
          </p>
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4 leading-snug">
            Матрица памяти
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            Повторяйте порядок подсветки на сетке. В каждом раунде к фразе добавляется следующее слово — так, шаг за
            шагом, складывается цельное предложение с правильными окончаниями. После ошибки вы увидите текст до момента
            сбоя. Это не оценка и не диагностика.
          </p>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)] mb-2">
              Формулировки фразы
            </p>
            <div
              role="radiogroup"
              aria-label="Формулировки фразы: женские или мужские окончания"
              className="flex rounded-2xl border border-white/55 bg-white/25 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={gender === 'f'}
                onClick={() => setGender('f')}
                className={[
                  'relative flex-1 min-h-[52px] rounded-[0.85rem] px-2 py-2.5 text-sm font-semibold transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white/30',
                  gender === 'f'
                    ? 'text-white shadow-[0_8px_28px_rgba(107,196,181,0.35)] bg-gradient-to-br from-[#f4b8a8] via-[#d4b8e8] to-[#9ec9c4]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/20',
                ].join(' ')}
              >
                <span className="block leading-tight">Женские</span>
                <span className="mt-0.5 block text-[11px] font-medium opacity-90">окончания</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={gender === 'm'}
                onClick={() => setGender('m')}
                className={[
                  'relative flex-1 min-h-[52px] rounded-[0.85rem] px-2 py-2.5 text-sm font-semibold transition-all duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white/30',
                  gender === 'm'
                    ? 'text-white shadow-[0_8px_28px_rgba(107,196,181,0.35)] bg-gradient-to-br from-[#f4b8a8] via-[#d4b8e8] to-[#9ec9c4]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/20',
                ].join(' ')}
              >
                <span className="block leading-tight">Мужские</span>
                <span className="mt-0.5 block text-[11px] font-medium opacity-90">окончания</span>
              </button>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-2 leading-snug">
              От выбора зависят грамматические формы в тексте (глаголы, краткие прилагательные и т. п.).
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => void beginSession()}
            className="w-full py-3.5 rounded-xl btn-primary font-semibold min-h-[48px]"
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          >
            Начать
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence>
        {phraseWinCelebration && phase === 'playing' ? (
          <motion.div
            key="mm-phrase-win"
            role="status"
            initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -88 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -32 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.65 }}
            className="fixed left-0 right-0 top-0 z-[100] flex justify-center px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pointer-events-none"
          >
            <div
              className="pointer-events-none w-full max-w-[min(100%,420px)] rounded-2xl border border-white/65 bg-gradient-to-br from-white/92 via-white/88 to-[rgba(158,201,196,0.22)] px-4 py-3.5 shadow-[0_20px_48px_rgba(45,62,46,0.2),0_0_0_1px_rgba(255,255,255,0.35)_inset] backdrop-blur-md"
              style={{ WebkitBackdropFilter: 'blur(14px)' }}
            >
              <p className="font-display text-[17px] font-bold text-[var(--color-text-primary)] leading-snug">
                Фраза собрана полностью
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Вы прошли цепочку без ошибки — отлично получилось. Так держать.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col min-h-[min(100dvh,780px)] px-3 pb-8 max-w-[420px] mx-auto w-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
        >
          ← Выход
        </button>
        <span
          className="font-display text-xs font-semibold text-[var(--color-text-secondary)] tabular-nums text-right max-w-[11rem] leading-tight"
          title="Первое число — сколько шагов нужно повторить в этом раунде; второе — сколько всего слов во фразе."
        >
          Шагов: {chainLen}/{phraseWordCount || '—'}
        </span>
      </div>

      <div
        className="min-h-[4.75rem] mb-4 flex flex-col items-center justify-center text-center px-2 overflow-hidden"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={`${mode ?? 'x'}-${statusText}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm font-medium text-[var(--color-text-primary)] leading-snug min-h-[2.75rem] flex items-center justify-center"
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 min-h-[1.25rem]">
          {mode === 'repeat'
            ? 'Каждый верный тап в этом раунде добавляет следующее слово ниже.'
            : '\u00a0'}
        </p>
      </div>

      {mode === 'repeat' ? (
        <div
          className="mb-4 rounded-2xl border border-white/45 bg-white/30 px-3 py-3 text-center min-h-[3rem] flex items-center justify-center"
          aria-live="polite"
        >
          <p className="text-[15px] leading-snug text-[var(--color-text-primary)] font-medium">
            {phraseLine ? phraseLine : <span className="text-[var(--color-text-secondary)] font-normal">Фраза появится после первого верного тапа…</span>}
          </p>
        </div>
      ) : null}

      <div className="w-full max-w-[min(100%,19rem)] aspect-square mx-auto mb-6">
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid h-full w-full grid-cols-3 grid-rows-3 gap-2.5 p-0"
        >
          {Array.from({ length: CELLS }, (_, i) => {
            const isOn = highlight === i
            return (
              <motion.button
                key={i}
                type="button"
                variants={gridCell}
                disabled={!canTap}
                onClick={() => onCellPress(i)}
                whileTap={canTap && !reduce ? { scale: 0.94 } : undefined}
                className={[
                  'relative min-h-0 min-w-0 rounded-2xl border overflow-hidden',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,255,255,0.4)]',
                  canTap ? 'cursor-pointer' : 'cursor-default',
                  isOn
                    ? 'border-[var(--color-glow-teal)] bg-[rgba(107,196,181,0.38)] shadow-[inset_0_0_0_2px_rgba(74,171,156,0.5),0_0_32px_rgba(74,171,156,0.22)]'
                    : 'border-white/55 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]',
                  !canTap ? 'opacity-[0.92]' : 'opacity-100',
                ].join(' ')}
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                aria-label={`Ячейка ${i + 1}`}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_20px_rgba(255,255,255,0.35)]"
                  initial={false}
                  animate={
                    isOn && !reduce
                      ? { opacity: [0.2, 1, 0.65] }
                      : { opacity: 0 }
                  }
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
                <span
                  className="pointer-events-none absolute inset-[3px] rounded-[1.15rem] bg-gradient-to-br from-white/25 to-transparent opacity-70"
                  aria-hidden
                />
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed px-1">
        Подсказка: смотрите на центр поля — так проще держать порядок.
      </p>
    </div>
    </>
  )
}
