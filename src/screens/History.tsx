import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { apiTestHistory } from '../api/client'
import { useAppStore } from '../store/appStore'

interface HistoryProps {
  onBack: () => void
}

export function History({ onBack }: HistoryProps) {
  const openResultFromHistory = useAppStore((s) => s.openResultFromHistory)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
    refetchOnMount: true,
    staleTime: 0,
  })

  const items = data?.items ?? []
  const showLoading = isLoading || isFetching

  const openResult = (id: string) => {
    openResultFromHistory(id)
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6">
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={() => onBack()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center -ml-1 rounded-xl text-[var(--color-glow-teal)] font-semibold select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          История
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex flex-col gap-4 max-w-[420px] mx-auto w-full px-1">
        {showLoading && items.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-8">Загрузка...</p>
        )}
        {!showLoading && items.length === 0 && (
          <div className="card-premium p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Пока нет сохранённых результатов. Пройди тест из каталога.
            </p>
          </div>
        )}
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="card-premium p-5"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h3 className="font-bold text-[var(--color-text-primary)]">{item.testTitle}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {new Date(item.completedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <button
              type="button"
              onClick={() => openResult(item.id)}
              className="mt-4 min-h-[44px] flex items-center text-sm font-semibold text-[var(--color-glow-teal)] select-none hover:opacity-90"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Смотреть результат
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
