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
      <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl">
        <button type="button" onClick={onBack} className="text-[var(--color-glow-teal)] font-medium">
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)]">
          Каталог тестов
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex flex-col gap-3 max-w-[420px] mx-auto w-full px-1">
        {TESTS.map((test, i) => {
          const isCompleted = completedTestIds.has(test.id)
          return (
            <motion.div
              key={test.id}
              className="glass-card p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-[var(--color-text-primary)]">{test.title}</h3>
                {isCompleted && (
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--color-glow-teal)]/25 text-[var(--color-glow-teal)]">
                    Пройден
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">{test.description}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                {test.questionCount} вопросов
              </p>
              <button
                type="button"
                onClick={() => startTest(test.id)}
                className="w-full py-2.5 px-4 rounded-xl font-medium border-2 border-[var(--color-lavender)] text-[var(--color-text-primary)] hover:bg-white/10 active:scale-[0.98] transition-all"
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
