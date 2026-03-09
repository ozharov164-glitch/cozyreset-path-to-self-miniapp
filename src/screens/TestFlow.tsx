import { useEffect } from 'react'
import { motion } from 'framer-motion'
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
      <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl">
        <button type="button" onClick={onBack} className="text-[var(--color-glow-teal)] font-medium">
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold truncate" style={{ color: '#2d2a26' }}>
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
        <p className="text-xs mt-1" style={{ color: '#5a5550' }}>
          Вопрос {n} из {total}
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-2" style={{ overflow: 'visible' }}>
        <div className="flex flex-col flex-1 min-h-[120px]" style={{ overflow: 'visible' }}>
          <div
            className="rounded-xl mb-6"
            style={{
              padding: 20,
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(0,0,0,0.08)',
              overflow: 'visible',
              minHeight: 80,
            }}
          >
            <p
              className="m-0 break-words"
              style={{
                color: '#000',
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 1.45,
                overflow: 'visible',
              }}
            >
              {questionText}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SCALE.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleAnswer(num)}
                className="flex-1 min-w-[52px] py-3 px-3 rounded-xl font-semibold glass-card border-2 border-transparent hover:border-[var(--color-glow-teal)] hover:shadow-lg hover:shadow-[var(--color-glow-teal)]/20 transition-all active:scale-[0.98]"
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
