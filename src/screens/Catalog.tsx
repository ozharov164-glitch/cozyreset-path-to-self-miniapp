import { motion } from 'framer-motion'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'

interface CatalogProps {
  onBack: () => void
}

export function Catalog({ onBack }: CatalogProps) {
  const setScreen = useAppStore((s) => s.setScreen)
  const setCurrentTest = useAppStore((s) => s.setCurrentTest)

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
        {TESTS.map((test, i) => (
          <motion.div
            key={test.id}
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">{test.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{test.description}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {test.questionCount} вопросов
            </p>
            <button
              type="button"
              onClick={() => startTest(test.id)}
              className="w-full py-2.5 px-4 rounded-xl font-medium border-2 border-[var(--color-lavender)] text-[var(--color-text-primary)] hover:bg-white/10 active:scale-[0.98] transition-all"
            >
              Пройти
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
