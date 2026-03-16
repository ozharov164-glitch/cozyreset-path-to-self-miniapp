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
  const questionText = currentQ?.text ?? `Вопрос ${currentQuestionIndex + 1} из ${total}. Оцени по шкале от 1 до 10.`
  const n = currentQuestionIndex + 1
  const progress = (n / total) * 100

  useEffect(() => {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[TestFlow] question text', n, total, questionText.slice(0, 80) + '...')
    }
  }, [n, total, questionText])

  const handleAnswer = (value: number) => {
    addAnswer(value)
    if (isLast) setScreen('result')
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6" style={{ overflow: 'visible' }}>
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button type="button" onClick={onBack} className="text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] flex items-center -ml-1" style={{ WebkitTapHighlightColor: 'transparent' }}>
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[var(--color-text-primary)] truncate">
          {test.title}
        </h1>
        <span className="w-14" />
      </header>

      <div className="px-2 mb-2">
        <div className="h-1 rounded-full bg-white/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-sunset-rose)] to-[var(--color-lavender)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
          Вопрос {n} из {total}
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-2" style={{ overflow: 'visible' }}>
        <div className="flex flex-col flex-1 min-h-[120px]" style={{ overflow: 'visible' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              className="rounded-2xl mb-6 p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(252,250,255,0.88) 100%)',
                border: '1px solid rgba(184,164,224,0.25)',
                boxShadow: '0 4px 16px rgba(30,43,31,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                overflow: 'visible',
                minHeight: 80,
              }}
            >
              <p
                className="m-0 break-words text-[var(--color-text-primary)] text-center leading-relaxed"
                style={{ fontSize: 16, lineHeight: 1.5 }}
              >
                {questionText}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex flex-wrap gap-2">
            {SCALE.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleAnswer(num)}
                className="flex-1 min-w-[52px] py-3 px-3 rounded-xl font-semibold btn-secondary transition-all active:scale-[0.98]"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
