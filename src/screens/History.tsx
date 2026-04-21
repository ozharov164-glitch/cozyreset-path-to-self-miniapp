import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { apiTestHistory, apiClearTestHistory, apiClearHeartRhythmHistory } from '../api/client'
import { useAppStore } from '../store/appStore'

interface HistoryProps {
  onBack: () => void
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function History({ onBack }: HistoryProps) {
  const openResultFromHistory = useAppStore((s) => s.openResultFromHistory)
  const queryClient = useQueryClient()
  const [clearing, setClearing] = useState<'tests' | 'heart' | null>(null)
  const [clearError, setClearError] = useState<string | null>(null)

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

  const handleClearTestHistory = async () => {
    if (clearing) return
    setClearError(null)
    setClearing('tests')
    const result = await apiClearTestHistory()
    setClearing(null)
    if ('error' in result) {
      setClearError(result.error)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['test-history'] })
  }

  const handleClearHeartRhythmHistory = async () => {
    if (clearing) return
    setClearError(null)
    setClearing('heart')
    const result = await apiClearHeartRhythmHistory()
    setClearing(null)
    if ('error' in result) {
      setClearError(result.error)
      return
    }
    setClearError(null)
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6">
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={() => onBack()}
          className="btn-ghost min-h-[44px] min-w-[52px] px-2 -ml-1 rounded-xl text-[var(--color-glow-teal)] font-semibold select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="font-display flex-1 text-center text-base font-bold text-[var(--color-text-primary)] tracking-tight">
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
            <p className="text-xs text-[var(--color-text-secondary)] mt-1 tabular-nums">
              {formatDateTime(item.completedAt)}
            </p>
            <button
              type="button"
              onClick={() => openResult(item.id)}
              className="btn-ghost mt-4 min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] select-none"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Смотреть результат
            </button>
          </motion.div>
        ))}

        <motion.div
            className="card-premium p-5 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">Очистить историю</h4>
            {clearError && (
              <p className="text-sm text-rose-600 mb-3">{clearError}</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClearTestHistory}
                disabled={!!clearing || items.length === 0}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold btn-secondary disabled:opacity-50"
              >
                {clearing === 'tests' ? 'Очистка…' : 'Очистить историю тестов'}
              </button>
              <button
                type="button"
                onClick={handleClearHeartRhythmHistory}
                disabled={!!clearing}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold btn-secondary disabled:opacity-50"
              >
                {clearing === 'heart' ? 'Очистка…' : 'Очистить историю «Ритм Сердца»'}
              </button>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              После очистки на главной странице соответствующие блоки перестанут отображаться.
            </p>
          </motion.div>
      </div>
    </div>
  )
}
