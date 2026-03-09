import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { apiTestHistory, apiAiSuggestions } from '../api/client'
import { useAppStore } from '../store/appStore'

const BOT_LINK = 'https://t.me/CozyReset_bot'

interface DashboardProps {
  onOpenCatalog: () => void
  onOpenHistory: () => void
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дн. назад`
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

export function Dashboard({ onOpenCatalog, onOpenHistory }: DashboardProps) {
  const authReady = useAuthStore((s) => s.isInitialized)
  const openResultFromHistory = useAppStore((s) => s.openResultFromHistory)
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  const userName = tg?.initDataUnsafe?.user?.first_name || 'друг'

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
    enabled: authReady,
    refetchOnMount: true,
    staleTime: 0,
  })
  const items = historyData?.items ?? []
  const recentItems = items.slice(0, 5)
  const showHistoryLoading = !authReady || (authReady && historyLoading && items.length === 0)

  const { data: suggestionsData } = useQuery({
    queryKey: ['ai-suggestions-dashboard'],
    queryFn: () => apiAiSuggestions(),
    enabled: authReady && items.length > 0,
  })
  const suggestions = suggestionsData?.suggestions ?? []

  const openResult = (id: string) => {
    openResultFromHistory(id)
  }

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="glass-card h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
        <span className="text-xl">🌱</span>
        <h1 className="text-base font-semibold text-[var(--color-text-primary)]">Путь к Себе</h1>
        <button
          type="button"
          onClick={() => onOpenHistory()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] active:bg-white/20 select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          История
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <motion.div
          className="glass-card p-5 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            Привет, {userName}!
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Здесь — срез твоего состояния. Каждый тест помогает заметить динамику и опереться на себя.
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-sunset-rose)] hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
          >
            Каталог тестов
          </button>
        </motion.div>

        {/* Блок: Общая статистика состояния */}
        <motion.div
          className="rounded-2xl p-5 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(249,245,255,0.9) 100%)',
            border: '1px solid rgba(201,184,232,0.4)',
            boxShadow: '0 4px 24px rgba(45,42,38,0.08)',
          }}
        >
          <h3 className="text-base font-semibold text-[var(--color-forest-dark)] mb-1">
            Твоё состояние
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-4">
            Регулярные замеры помогают видеть прогресс и бережнее относиться к себе. Здесь — твой срез.
          </p>

          {showHistoryLoading ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-2">
              Загрузка…
            </p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-2">
              Пока нет сохранённых результатов. Пройди первый тест из каталога — он станет началом твоей карты.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <motion.span
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-glow-teal)' }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {items.length}
                </motion.span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {items.length === 1 ? 'тест пройден' : items.length < 5 ? 'теста пройдено' : 'тестов пройдено'}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3">Последние результаты:</p>
              <ul className="space-y-2">
                {recentItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => openResult(item.id)}
                      className="w-full text-left min-h-[44px] py-2.5 px-3 rounded-xl transition-all hover:bg-white/60 active:scale-[0.99] select-none"
                      style={{
                        border: '1px solid rgba(201,184,232,0.35)',
                        color: 'var(--color-text-primary)',
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span className="block text-sm font-medium truncate">{item.testTitle}</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDate(item.completedAt)}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
              {items.length > 5 && (
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="mt-3 text-sm font-medium w-full py-2 rounded-xl border border-[var(--color-lavender)]/50 text-[var(--color-glow-teal)] hover:bg-white/50 transition-colors"
                >
                  Вся история
                </button>
              )}
            </>
          )}
        </motion.div>

        {items.length > 0 && suggestions.length > 0 && (
          <motion.div
            className="rounded-2xl p-4 mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            style={{
              background: 'linear-gradient(145deg, rgba(125,211,192,0.18) 0%, rgba(201,184,232,0.12) 100%)',
              border: '1px solid rgba(125,211,192,0.35)',
            }}
          >
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
              Проработать с ИИ в боте
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              На основе твоих тестов — темы, которые стоит обсудить с поддержкой в боте:
            </p>
            <ul className="space-y-1.5 mb-3">
              {suggestions.slice(0, 4).map((s, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <a
              href={BOT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 px-4 rounded-xl font-medium text-center text-[var(--color-text-primary)] bg-[var(--color-sunset-rose)]/90 hover:opacity-95 active:scale-[0.98] transition-all"
              onClick={(e) => {
                if (window.Telegram?.WebApp?.openTelegramLink) {
                  e.preventDefault()
                  window.Telegram.WebApp.openTelegramLink(BOT_LINK)
                }
              }}
            >
              Открыть бота
            </a>
          </motion.div>
        )}

        {!authReady && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] px-4 py-2">
            Загрузка...
          </p>
        )}

        <motion.p
          className="text-sm text-center mt-auto pt-4"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Глубже работа с состоянием — в боте: поддержка, практики и ежедневная забота о себе.
        </motion.p>
      </div>
    </div>
  )
}
