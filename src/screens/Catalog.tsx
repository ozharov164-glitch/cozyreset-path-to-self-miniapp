import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import { apiTestHistory } from '../api/client'
import { useAuthStore } from '../store/authStore'

interface CatalogProps {
  onBack: () => void
}

export function Catalog({ onBack }: CatalogProps) {
  const setScreen = useAppStore((s) => s.setScreen)
  const setCurrentTest = useAppStore((s) => s.setCurrentTest)
  const authReady = useAuthStore((s) => s.isInitialized)

  const { data: historyData } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
    enabled: authReady,
  })
  const completedTestIds = new Set((historyData?.items ?? []).map((item) => item.testId))

  const startTest = (testId: string) => {
    setCurrentTest(testId)
    setScreen('test')
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6">
      <header className="card-premium relative overflow-hidden animate-glass-sheen h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button type="button" onClick={onBack} className="text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] flex items-center -ml-1" style={{ WebkitTapHighlightColor: 'transparent' }}>
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Каталог тестов
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex flex-col gap-4 max-w-[420px] mx-auto w-full px-1">
        {TESTS.map((test, i) => {
          const isCompleted = completedTestIds.has(test.id)
          return (
            <motion.div
              key={test.id}
              className="card-premium p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[var(--color-text-primary)] text-base">{test.title}</h3>
                {isCompleted && (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-glow-teal)]/20 text-[var(--color-glow-teal)]">
                    Пройден
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3 leading-relaxed">{test.description}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                {test.questionCount} вопросов
              </p>
              <button
                type="button"
                onClick={() => startTest(test.id)}
                className="w-full py-3 px-4 rounded-xl btn-secondary min-h-[48px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isCompleted ? 'Пройти снова (после терапии с ботом)' : 'Пройти'}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
