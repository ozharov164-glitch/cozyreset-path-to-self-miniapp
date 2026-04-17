import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

type Phase = 'intro' | 'playing' | 'endFail'

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
  /** Индекс шага, на котором ошиблись (сколько верных тапов подряд в этом раунде до ошибки). */
  const [failTapIndex, setFailTapIndex] = useState(0)
  /** Пользователь уже собрал полную фразу в сессии — на экране ошибки показываем целиком. */
  const [phraseUnlocked, setPhraseUnlocked] = useState(false)
  /** Длина фразы в словах — для шапки во время игры (ref не даёт перерисовку). */
  const [phraseWordCount, setPhraseWordCount] = useState(0)
  /** Краткий тост «строка собрана» (один раз за сессию), игра не останавливается. */
  const [phraseLineToast, setPhraseLineToast] = useState(false)
  const phraseToastDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [portalReady, setPortalReady] = useState(false)

  const highlightMs = reduce ? 720 : 480
  const gapMs = reduce ? 320 : 200

  useEffect(() => {
    mountedRef.current = true
    setPortalReady(typeof document !== 'undefined')
    return () => {
      mountedRef.current = false
      if (phraseToastDismissRef.current) {
        clearTimeout(phraseToastDismissRef.current)
        phraseToastDismissRef.current = null
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
    setPhraseUnlocked(false)
    if (phraseToastDismissRef.current) {
      clearTimeout(phraseToastDismissRef.current)
      phraseToastDismissRef.current = null
    }
    setPhraseLineToast(false)

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
        if (phraseToastDismissRef.current) {
          clearTimeout(phraseToastDismissRef.current)
          phraseToastDismissRef.current = null
        }
        setPhraseLineToast(false)
        setFailTapIndex(i)
        const pref = joinPhraseWords(prefixWords(words, i))
        setEndFailPrefix(pref)
        setPhase('endFail')
        return
      }

      playTapCell(index)
      okTapsRef.current += 1

      if (i + 1 >= seq.length) {
        if (seq.length >= maxLen) {
          generationRef.current += 1
          setCanTap(false)
          if (!phraseUnlocked) {
            setPhraseUnlocked(true)
            if (phraseToastDismissRef.current) {
              clearTimeout(phraseToastDismissRef.current)
              phraseToastDismissRef.current = null
            }
            setPhraseLineToast(true)
            try {
              const hf = window.Telegram?.WebApp?.HapticFeedback as
                | { notificationOccurred?: (t: 'success' | 'error' | 'warning') => void }
                | undefined
              hf?.notificationOccurred?.('success')
            } catch {
              /* ignore */
            }
            const dismissMs = reduce ? 2200 : 3200
            phraseToastDismissRef.current = setTimeout(() => {
              phraseToastDismissRef.current = null
              if (!mountedRef.current) return
              setPhraseLineToast(false)
            }, dismissMs)
          }
          seq.push(Math.floor(Math.random() * CELLS))
          sequenceRef.current = seq
          setChainLen(seq.length)
          void startRoundAfterSuccess()
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
    [canTap, mode, phase, phraseUnlocked, startRoundAfterSuccess],
  )

  const statusText =
    mode === 'watch'
      ? 'Смотрите на подсветку'
      : mode === 'repeat'
        ? 'Повторите последовательность'
        : ''

  const lineToastPortal =
    portalReady && typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {phraseLineToast ? (
              <motion.div
                key="mm-phrase-toast-pill"
                role="status"
                aria-live="polite"
                initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -36, scale: 0.86 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 540, damping: 36, mass: 0.72 }}
                className="fixed left-1/2 z-[400] w-[min(92vw,22rem)] -translate-x-1/2 pointer-events-none"
                style={{ top: 'max(0.65rem, env(safe-area-inset-top))' }}
              >
                <div
                  className="rounded-[999px] border border-white/50 bg-white/78 px-5 py-3 text-center shadow-[0_16px_44px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.55)_inset] backdrop-blur-2xl"
                  style={{ WebkitBackdropFilter: 'blur(18px)' }}
                >
                  <p className="font-display text-[15px] font-bold tracking-tight text-[var(--color-text-primary)] leading-snug">
                    Строка собрана
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-[var(--color-text-secondary)]">
                    Игра продолжается: цепочка может расти дальше. Фразу целиком вы увидите после ошибки — спокойно и без
                    спешки.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null

  if (phase === 'endFail') {
    const pref = endFailPrefix.trim()
    const fullPhrase = phraseWordsRef.current.length
      ? joinPhraseWords(phraseWordsRef.current)
      : ''
    const failScore = phraseUnlocked ? phraseWordCount : failTapIndex
    const line =
      phraseUnlocked && fullPhrase
        ? fullPhrase
        : pref || 'Пока без слов — это нормально: можно попробовать ещё раз.'
    const prefixForApi = phraseUnlocked && fullPhrase ? fullPhrase : pref || null

    return (
      <>
        {lineToastPortal}
        <div className="flex flex-col min-h-[min(100dvh,780px)] px-3 pb-8 max-w-[420px] mx-auto w-full safe-area">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              submitResult({
                finalScore: failScore,
                completed: phraseUnlocked,
                phrasePrefixText: prefixForApi,
              })
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
            {phraseUnlocked ? 'Ваша фраза' : 'Фраза до ошибки'}
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)] font-medium mb-3">{line}</p>
          {phraseUnlocked ? (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Вы уже собрали строку целиком — игра шла дальше. Здесь можно спокойно перечитать текст целиком; ошибка была
              уже на более длинной цепочке.
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
              Это не оценка и не диагностика — просто опорная формулировка.
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              submitResult({
                finalScore: failScore,
                completed: phraseUnlocked,
                phrasePrefixText: prefixForApi,
              })
            }
            className="w-full py-3.5 rounded-xl btn-primary font-semibold min-h-[48px]"
          >
            Дальше
          </button>
        </motion.div>
        <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed">
          Текст подобран заранее, чтобы поддержать без спешки. Не медицинский совет.
        </p>
      </div>
      </>
    )
  }

  if (phase === 'intro') {
    return (
      <>
        {lineToastPortal}
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
            Повторяйте порядок подсветки на сетке. Сам текст фразы во время игры{' '}
            <span className="text-[var(--color-text-primary)] font-medium">не показываем</span> — только цепочку и счётчик
            шагов. Когда длина цепочки совпадёт с длиной фразы и вы пройдёте раунд без ошибки, сверху появится короткое
            уведомление, что строка собрана; игра при этом{' '}
            <span className="text-[var(--color-text-primary)] font-medium">не заканчивается</span>, цепочка может расти
            дальше. Полностью фразу вы увидите после ошибки, когда сессия завершится. Это не оценка и не диагностика.
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
      </>
    )
  }

  return (
    <>
      {lineToastPortal}
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
          className="font-display text-[11px] font-semibold text-[var(--color-text-secondary)] tabular-nums text-right max-w-[12.5rem] leading-tight"
          title="Сколько шагов в текущей цепочке и сколько слов во фразе (после сборки фразы первая цифра может расти дальше)."
        >
          Цепочка: {chainLen} · слов: {phraseWordCount || '—'}
        </span>
      </div>

      <div
        className="mb-4 flex min-h-[3rem] flex-col items-center justify-center px-2 text-center"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={`${mode ?? 'x'}-${statusText}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm font-medium text-[var(--color-text-primary)] leading-snug"
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
      </div>

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
