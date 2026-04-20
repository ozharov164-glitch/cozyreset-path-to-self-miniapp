import { useEffect } from 'react'
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

  useEffect(() => {
    useAppStore.getState().setPathCoachReturnAfterTest(false)
  }, [])

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
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button type="button" onClick={onBack} className="btn-ghost text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] px-2 -ml-1 rounded-xl" style={{ WebkitTapHighlightColor: 'transparent' }}>
          ← Назад
        </button>
        <h1 className="font-display flex-1 text-center text-base font-bold text-[var(--color-text-primary)] tracking-tight">
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
                <h3 className="font-bold text-[var(--color-text-primary)] text-base flex-1 min-w-0 pr-1 leading-snug">
                  {test.title}
                </h3>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  {test.isNew && (
                    <motion.span
                      className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full text-white shadow-md"
                      style={{
                        background: 'linear-gradient(120deg, #5eb9a8 0%, #8b7ab8 45%, #c4a8d8 100%)',
                        boxShadow: '0 2px 14px rgba(107, 196, 181, 0.35), 0 0 0 1px rgba(255,255,255,0.25) inset',
                      }}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.07 + 0.1, type: 'spring', stiffness: 320, damping: 22 }}
                    >
                      Новинка
                    </motion.span>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-glow-teal)]/20 text-[var(--color-glow-teal)]">
                      Пройден
                    </span>
                  )}
                </div>
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
