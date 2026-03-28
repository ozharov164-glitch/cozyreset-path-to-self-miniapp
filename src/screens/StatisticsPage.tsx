import { AnimatePresence, motion } from 'framer-motion'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { apiStatistics, type StatsPeriod } from '../api/client'
import { useAuthStore } from '../store/authStore'
import { goBackToBot } from '../utils/telegram'
import { PeriodSelector } from '../components/statistics/PeriodSelector'
import { KPICards } from '../components/statistics/KPICards'
import { StatisticsSkeleton } from '../components/statistics/StatisticsSkeleton'
import {
  ActivityChart,
  AIActivityChart,
  MoodChart,
  TestPopularityChart,
} from '../components/statistics/StatisticsCharts'

interface StatisticsPageProps {
  onBack: () => void
}

export function StatisticsPage({ onBack }: StatisticsPageProps) {
  const [period, setPeriod] = useState<StatsPeriod>('month')
  const authReady = useAuthStore((s) => s.isInitialized)

  const { data, isPending, isFetching, refetch } = useQuery({
    queryKey: ['statistics', period],
    queryFn: () => apiStatistics(period),
    enabled: authReady,
    staleTime: 45_000,
    placeholderData: keepPreviousData,
  })

  const ok = data && 'status' in data && data.status === 'ok'
  const stats = ok ? data.stats : undefined
  const needPremium = Boolean(data && 'premium_required' in data && data.premium_required)
  const loadError = Boolean(data && !ok && !needPremium)
  const showSkeleton = !authReady || (isPending && data === undefined && !needPremium)

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="card-premium h-14 flex items-center justify-between px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold select-none tracking-tight text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">Моя статистика</h1>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-medium text-[var(--color-glow-teal)] active:opacity-80 select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-8">
        <motion.p
          className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed text-center"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          Твой прогресс в одном экране: настроение, активность и тесты.
        </motion.p>

        <PeriodSelector period={period} onChange={setPeriod} />

        <AnimatePresence mode="wait">
          {needPremium && (
            <motion.div
              key="premium"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="card-premium rounded-2xl p-6 text-center border border-[var(--color-lavender)]/30 bg-gradient-to-br from-[var(--color-lavender)]/15 to-[var(--color-glow-teal)]/10"
            >
              <div className="text-4xl mb-3" aria-hidden>
                ✨
              </div>
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">Статистика в премиуме</h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
                Подключи премиум в боте — откроются графики, KPI и история активности.
              </p>
              <button
                type="button"
                onClick={() => goBackToBot()}
                className="w-full py-3.5 px-4 rounded-xl btn-premium-glow min-h-[48px] font-semibold"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                Перейти в бота
              </button>
            </motion.div>
          )}

          {loadError && (
            <motion.div
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-premium rounded-2xl p-5 text-center"
            >
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">Не удалось загрузить данные.</p>
              <button type="button" onClick={() => refetch()} className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold">
                Повторить
              </button>
            </motion.div>
          )}

          {!needPremium && !loadError && showSkeleton && (
            <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StatisticsSkeleton />
            </motion.div>
          )}

          {!needPremium && !loadError && authReady && stats && ok && !showSkeleton && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {isFetching && (
                <motion.div
                  className="h-1 rounded-full bg-[var(--color-lavender)]/20 overflow-hidden mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-[var(--color-glow-teal)] to-[var(--color-lavender)]"
                    animate={{ x: ['-30%', '200%'] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              )}
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
                }}
              >
                <KPICards kpi={stats.kpi} />
              </motion.div>
              <div className="grid grid-cols-1 gap-5">
                <MoodChart data={stats.mood_over_time} />
                <ActivityChart data={stats.daily_activity} />
                <div className="grid grid-cols-1 gap-5">
                  <TestPopularityChart data={stats.test_popularity} />
                  <AIActivityChart data={stats.ai_activity_over_time} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
