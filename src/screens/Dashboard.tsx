import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { apiTestHistory } from '../api/client'

interface DashboardProps {
  onOpenCatalog: () => void
  onOpenHistory: () => void
}

export function Dashboard({ onOpenCatalog, onOpenHistory }: DashboardProps) {
  const authReady = useAuthStore((s) => s.isInitialized)
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  const userName = tg?.initDataUnsafe?.user?.first_name || 'друг'

  const { data: historyData } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
  })
  const savedCount = historyData?.items?.length ?? 0

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="glass-card h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
        <span className="text-xl">🌱</span>
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">Путь к Себе</h1>
        <button
          type="button"
          onClick={onOpenHistory}
          className="text-sm text-[var(--color-text-secondary)]"
        >
          История
        </button>
      </header>

      <motion.div
        className="glass-card p-5 mb-6 mx-auto w-full max-w-[420px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
          Привет, {userName}!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          {savedCount > 0
            ? `Твой сад растёт: уже ${savedCount} ${savedCount === 1 ? 'результат' : savedCount < 5 ? 'результата' : 'результатов'}. Продолжай в том же духе.`
            : 'Твой сад растёт с каждым пройденным тестом. Начни с каталога — и здесь появятся деревья, цветы и кристаллы.'}
        </p>
        <button
          type="button"
          onClick={onOpenCatalog}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-sunset-rose)] hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
        >
          Каталог тестов
        </button>
      </motion.div>

      {!authReady && (
        <p className="text-center text-sm text-[var(--color-text-secondary)] px-4">
          Загрузка...
        </p>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-[var(--color-text-secondary)] text-center max-w-[280px]">
          {savedCount > 0
            ? 'За спиной — уютный сад твоих ответов. Открой «История», чтобы пересмотреть результаты.'
            : 'Пройди тесты из каталога — здесь появятся твои результаты и рост сада.'}
        </p>
      </div>
    </div>
  )
}
