import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'

interface TestFlowProps {
  onBack: () => void
}

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function TestFlow({ onBack }: TestFlowProps) {
  const currentTestId = useAppStore((s) => s.currentTestId)
  const currentQuestionIndex = useAppStore((s) => s.currentQuestionIndex)
  const addAnswer = useAppStore((s) => s.addAnswer)
  const setScreen = useAppStore((s) => s.setScreen)

  const test = TESTS.find((t) => t.id === currentTestId)
  if (!test) {
    onBack()
    return null
  }

  const total = test.questions.length
  const isLast = currentQuestionIndex === total - 1
  const currentQ = test.questions[currentQuestionIndex]
  const rawText = currentQ?.text ?? `Вопрос ${currentQuestionIndex + 1} из ${total}. Оцени по шкале от 1 до 10.`
  const scaleHintMarker = ' Оцени по шкале от 1 до 10:'
  const scaleHintIdx = rawText.indexOf(scaleHintMarker)
  const questionPart = scaleHintIdx >= 0 ? rawText.slice(0, scaleHintIdx).trim() : rawText
  const scalePart = scaleHintIdx >= 0 ? rawText.slice(scaleHintIdx + scaleHintMarker.length).trim() : null
  const n = currentQuestionIndex + 1
  const progress = (n / total) * 100

  useEffect(() => {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[TestFlow] question text', n, total, questionPart.slice(0, 80) + '...')
    }
  }, [n, total, questionPart])

  const handleAnswer = (value: number) => {
    addAnswer(value)
    if (isLast) setScreen('result')
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6" style={{ overflow: 'visible' }}>
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button type="button" onClick={onBack} className="btn-ghost text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] px-2 -ml-1 rounded-xl" style={{ WebkitTapHighlightColor: 'transparent' }}>
          ← Назад
        </button>
        <h1 className="font-display flex-1 text-center text-base font-bold text-[var(--color-text-primary)] truncate">
          {test.title}
        </h1>
        <span className="w-14" />
      </header>

      <div className="px-3 mb-4">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(184,164,224,0.2)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-glow-teal) 0%, var(--color-lavender) 100%)', boxShadow: '0 0 12px rgba(107,196,181,0.4)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
        </div>
        <p className="text-xs mt-2 font-medium text-[var(--color-text-secondary)] tabular-nums">
          Вопрос {n} из {total}
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-2" style={{ overflow: 'visible' }}>
        <div className="flex flex-col flex-1 min-h-[120px]" style={{ overflow: 'visible' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentTestId ?? 't'}-${currentQuestionIndex}`}
              className="rounded-2xl mb-6 p-6 relative overflow-hidden test-question-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(252,250,255,0.95) 50%, rgba(248,245,255,0.92) 100%)',
                border: '1px solid rgba(184,164,224,0.35)',
                boxShadow: '0 8px 32px rgba(30,43,31,0.08), 0 0 0 1px rgba(255,255,255,0.8) inset',
                minHeight: 88,
              }}
            >
              <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(125,211,192,0.15), transparent)' }} />
              <div className="relative flex flex-col gap-4 text-center">
                <p className="test-question-main m-0 break-words text-[var(--color-text-primary)] font-semibold leading-[1.5] tracking-tight">
                  {questionPart}
                </p>
                {scalePart && (
                  <p className="test-question-scale m-0 break-words text-[var(--color-text-secondary)] font-normal leading-[1.5] text-sm tracking-wide">
                    {scalePart}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2.5">
            {SCALE.map((num, idx) => (
              <motion.button
                key={num}
                type="button"
                onClick={() => handleAnswer(num)}
                className="pts-btn-shimmer flex-1 min-w-[52px] py-3.5 px-3 rounded-xl font-bold text-[var(--color-text-primary)] transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
                whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(107,196,181,0.3)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,252,251,0.9) 100%)',
                  border: '2px solid rgba(125,211,192,0.4)',
                  boxShadow: '0 2px 12px rgba(30,43,31,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
