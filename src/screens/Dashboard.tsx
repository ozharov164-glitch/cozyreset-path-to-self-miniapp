import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { apiTestHistory, apiAiSuggestions, getBackendUrl } from '../api/client'
import { useAppStore } from '../store/appStore'
import { goBackToBot, copyQuestionToClipboard } from '../utils/telegram'

interface DashboardProps {
  onOpenCatalog: () => void
  onOpenHistory: () => void
}

function formatDateWithTime(iso: string): string {
  try {
    const d = new Date(iso)
    const timeStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays === 0) return `Сегодня, ${timeStr}`
    if (diffDays === 1) return `Вчера, ${timeStr}`
    if (diffDays < 7) return `${diffDays} дн. назад, ${timeStr}`
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ', ' + timeStr
  } catch {
    return ''
  }
}

export function Dashboard({ onOpenCatalog, onOpenHistory }: DashboardProps) {
  const authReady = useAuthStore((s) => s.isInitialized)
  const appSaveToken = useAuthStore((s) => s.appSaveToken)
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
    queryKey: ['ai-suggestions-dashboard', appSaveToken ?? ''],
    queryFn: () => apiAiSuggestions(),
    // Не дергаем API до токена из /mini-app/init — иначе 401 и гонка с initData
    enabled: authReady && !!appSaveToken && items.length > 0,
  })
  const suggestions = suggestionsData?.suggestions ?? []

  const openResult = (id: string) => {
    openResultFromHistory(id)
  }

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="card-premium h-14 flex items-center justify-between px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold select-none tracking-tight text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← В бота
        </button>
        <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Путь к Себе
        </h1>
        <button
          type="button"
          onClick={() => onOpenHistory()}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-medium text-[var(--color-glow-teal)] active:opacity-80 select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          История
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <motion.div
          className="card-premium p-5 mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-1 tracking-tight">
            Привет, {userName}!
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Здесь — срез твоего состояния. Каждый тест помогает заметить динамику и опереться на себя.
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px]"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Каталог тестов
          </button>
        </motion.div>

        <motion.div
          className="card-premium p-5 mb-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
            <span aria-hidden>🎙️</span> Голосовая поддержка
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Напиши, что на душе — ИИ ответит тёплым голосом, в стиле психологической поддержки.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('voiceSupport')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px]"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Ответ голосом
          </button>
        </motion.div>

        <motion.div
          className="card-premium p-5 mb-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
            <span aria-hidden>❤️</span> Ритм Сердца
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Тап в такт дыханию — 90 секунд, затем комментарий от ИИ и короткая мелодия.
          </p>
          <button
            type="button"
            onClick={() => {
              const backend = getBackendUrl()
              const token = useAuthStore.getState().appSaveToken
              const gameUrl = `${backend}/heart-rhythm/${token ? `?token=${encodeURIComponent(token)}` : ''}`
              window.location.href = gameUrl
            }}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px]"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Играть
          </button>
        </motion.div>

        <motion.div
          className="card-premium p-5 mb-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
            <span aria-hidden>🌱</span> Самореализация
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Уверенность, учёба, цели, анти‑прокрастинация — опиши трудности и работай над ними в тандеме с ИИ.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('selfRealization')}
            className="w-full py-3.5 px-4 rounded-xl btn-premium-glow min-h-[48px]"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            🌱 Открыть «Самореализацию»
          </button>
        </motion.div>

        <motion.div
          className="card-premium rounded-2xl p-5 mb-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h3 className="text-base font-bold text-[var(--color-forest-dark)] mb-1">
            Твоё состояние
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
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
                      className="w-full text-left min-h-[44px] py-2.5 px-3 rounded-xl transition-all hover:bg-[var(--color-lavender-soft)]/20 active:scale-[0.99] select-none border border-[var(--color-lavender)]/30 text-[var(--color-text-primary)]"
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    >
                      <span className="block text-sm font-medium truncate">{item.testTitle}</span>
                      <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatDateWithTime(item.completedAt)}
                      </span>
                    </button>
                  </motion.li>
                ))}
              </ul>
              {items.length > 5 && (
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="mt-3 text-sm font-semibold w-full py-2.5 rounded-xl btn-secondary"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  Вся история
                </button>
              )}
            </>
          )}
        </motion.div>

        {items.length > 0 && suggestions.length > 0 && (
          <motion.div
            className="card-premium rounded-2xl p-5 mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h4 className="text-base font-bold text-[var(--color-forest-dark)] mb-2">
              Проработать с ИИ в боте
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1 leading-relaxed">
              На основе твоих тестов — темы, которые стоит обсудить с поддержкой в боте:
            </p>
            <p className="text-xs mb-3 text-[var(--color-glow-teal)] font-medium">
              Нажми на вопрос — скопируется
            </p>
            <ul className="space-y-2 mb-4">
              {suggestions.slice(0, 4).map((s, i) => (
                <li key={i} className="text-sm flex gap-2 text-[var(--color-text-primary)]">
                  <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                  <button
                    type="button"
                    onClick={() => copyQuestionToClipboard(s)}
                    className="copyable-question text-left flex-1 min-h-[44px] py-2 px-2 -mx-2 rounded-lg hover:bg-[var(--color-lavender-soft)]/15 transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => goBackToBot()}
              className="block w-full py-3 px-4 rounded-xl btn-primary min-h-[48px]"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Вернуться в бота
            </button>
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
