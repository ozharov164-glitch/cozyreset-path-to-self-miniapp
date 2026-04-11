import { useEffect, type ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  apiTestHistory,
  apiAiSuggestions,
  apiStatistics,
  getBackendUrl,
  syncPremiumFromInit,
  type ApiStatisticsResult,
} from '../api/client'
import { useAppStore } from '../store/appStore'
import { goBackToBot, copyQuestionToClipboard } from '../utils/telegram'
import { PremiumCard } from '../components/PremiumCard'
import {
  IconChart,
  IconLayers,
  IconMic,
  IconPulse,
  IconSparkle,
  IconSprout,
} from '../components/FeatureIcons'

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

function CardHeading({
  icon: Icon,
  title,
  iconClassName,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  iconClassName: string
}) {
  return (
    <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-1 flex items-start gap-2.5 tracking-tight leading-snug">
      <Icon className={`shrink-0 mt-0.5 ${iconClassName}`} aria-hidden />
      <span>{title}</span>
    </h3>
  )
}

export function Dashboard({ onOpenCatalog, onOpenHistory }: DashboardProps) {
  const queryClient = useQueryClient()
  const reduceMotion = useReducedMotion()
  const authReady = useAuthStore((s) => s.isInitialized)
  const appAuthReady = useAppStore((s) => s.authReady)
  const appSaveToken = useAuthStore((s) => s.appSaveToken)
  const isPremium = useAuthStore((s) => s.isPremium)
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
    enabled: authReady && !!appSaveToken && items.length > 0,
  })
  const suggestions = suggestionsData?.suggestions ?? []

  const openResult = (id: string) => {
    openResultFromHistory(id)
  }

  useEffect(() => {
    if (!appAuthReady || !appSaveToken) return
    const run = async () => {
      let premium = useAuthStore.getState().isPremium
      if (premium === null) {
        await syncPremiumFromInit()
        premium = useAuthStore.getState().isPremium
      }
      if (premium === true) {
        await queryClient.prefetchQuery<ApiStatisticsResult>({
          queryKey: ['statistics', 'month', appSaveToken ?? ''],
          queryFn: async () => {
            const r = await apiStatistics('month')
            if (r.status === 'ok') return r
            if ('premium_required' in r && r.premium_required) return r
            throw new Error('stats')
          },
          staleTime: 60_000,
        })
      }
    }
    void run()
  }, [appAuthReady, appSaveToken, queryClient])

  const headerMotion = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <motion.header
        className="header-app-glass h-14 flex items-center justify-between px-4 mb-5 rounded-2xl"
        {...headerMotion}
      >
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold select-none tracking-tight text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← В бота
        </button>
        <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Путь к себе
        </h1>
        <button
          type="button"
          onClick={() => onOpenHistory()}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] select-none"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          История
        </button>
      </motion.header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <PremiumCard accent="coral" delay={0}>
          <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)] mb-1.5 tracking-tight">
            Привет, {userName}!
          </h2>
          <p className="text-[15px] text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Здесь — срез твоего состояния. Каждый тест помогает тебе.
          </p>
          <button
            type="button"
            onClick={onOpenCatalog}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Каталог тестов
          </button>
        </PremiumCard>

        {authReady && appSaveToken && (
          <PremiumCard accent="lavender" delay={0.03}>
            <CardHeading icon={IconChart} title="Документы к специалисту" iconClassName="text-[#6b7eb8]" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              Два PDF к визиту: анкета «К специалисту» и «Карта терапии» — как тебе спокойнее в процессе, темп и границы 💛
            </p>
            {isPremium === true ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => useAppStore.getState().setScreen('specialistBrief')}
                  className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  Заполнить анкету «К специалисту»
                </button>
                <button
                  type="button"
                  onClick={() => useAppStore.getState().setScreen('therapyMap')}
                  className="w-full py-3.5 px-4 rounded-xl btn-secondary min-h-[48px] font-semibold border border-white/55"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  Собрать «Карту терапии»
                </button>
              </div>
            ) : isPremium === false ? (
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Доступно с Премиум-подпиской — оформи в боте: «Тарифы» или кнопка мини-приложения в меню 💛
              </p>
            ) : (
              <p className="text-sm text-[var(--color-text-secondary)]">Проверяем доступ…</p>
            )}
          </PremiumCard>
        )}

        <PremiumCard accent="slate" delay={0.05}>
          <CardHeading icon={IconPulse} title="Прогресс" iconClassName="text-[#5c7caf]" />
          <p className="font-display text-[15px] font-semibold text-[var(--color-forest-dark)] mb-1.5 leading-snug">
            Оцени свой прогресс
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Настроение, тесты, ритуалы и диалоги с ИИ — наглядно и с анимацией.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('statistics')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold mb-6"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Открыть статистику
          </button>

          <div className="border-t border-white/35 pt-5">
            <CardHeading icon={IconLayers} title="Твои тесты" iconClassName="text-[#9b8bc9]" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              Регулярные замеры помогают видеть динамику и бережнее относиться к себе.
            </p>

            {showHistoryLoading ? (
              <p className="text-sm text-[var(--color-text-secondary)] py-2">Загрузка…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] py-2">
                Пока нет сохранённых результатов. Пройди первый тест из каталога — он станет началом твоей карты.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <motion.span
                    className="text-2xl font-bold font-display"
                    style={{ color: 'var(--color-glow-teal)' }}
                    initial={reduceMotion ? false : { scale: 0.82 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  >
                    {items.length}
                  </motion.span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {items.length === 1 ? 'тест пройден' : items.length < 5 ? 'теста пройдено' : 'тестов пройдено'}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-3 font-medium tracking-wide uppercase opacity-80">
                  Последние результаты
                </p>
                <ul className="space-y-2">
                  {recentItems.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.32, delay: 0.2 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => openResult(item.id)}
                        className="pts-btn-shimmer w-full text-left min-h-[44px] py-2.5 px-3 rounded-xl transition-all hover:bg-white/35 active:scale-[0.99] select-none border border-white/50 text-[var(--color-text-primary)] shadow-sm"
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
          </div>
        </PremiumCard>

        <PremiumCard accent="rose" delay={0.08}>
          <CardHeading icon={IconMic} title="Практики" iconClassName="text-[var(--color-glow-teal-dim)]" />
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Голос ИИ и игра «Ритм сердца» — короткие практики: выговориться и слегка замедлиться в теле.
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => useAppStore.getState().setScreen('voiceSupport')}
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Голосовая поддержка
            </button>
            <button
              type="button"
              onClick={() => {
                const backend = getBackendUrl()
                const token = useAuthStore.getState().appSaveToken
                const gameUrl = `${backend}/heart-rhythm/${token ? `?token=${encodeURIComponent(token)}` : ''}`
                window.location.href = gameUrl
              }}
              className="w-full py-3.5 px-4 rounded-xl btn-secondary min-h-[48px] font-semibold border border-white/55"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Ритм сердца — играть
            </button>
          </div>
        </PremiumCard>

        <PremiumCard accent="mint" delay={0.11}>
          <CardHeading icon={IconSprout} title="Самореализация" iconClassName="text-[#4aab9c]" />
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Уверенность, учёба, цели, анти‑прокрастинация — опиши трудности и работай над ними в тандеме с ИИ.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('selfRealization')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Открыть «Самореализацию»
          </button>
        </PremiumCard>

        {items.length > 0 && suggestions.length > 0 && (
          <PremiumCard accent="coral" delay={0.22}>
            <CardHeading icon={IconSparkle} title="Проработать с ИИ в боте" iconClassName="text-[#c98a90]" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-1 leading-relaxed">
              На основе твоих тестов — темы, которые стоит обсудить с поддержкой в боте:
            </p>
            <p className="text-xs mb-3 text-[var(--color-glow-teal)] font-semibold tracking-wide">
              Нажми на вопрос — скопируется
            </p>
            <ul className="space-y-2 mb-4">
              {suggestions.slice(0, 4).map((s, i) => (
                <li key={i} className="text-sm flex gap-2 text-[var(--color-text-primary)]">
                  <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                  <button
                    type="button"
                    onClick={() => copyQuestionToClipboard(s)}
                    className="copyable-question text-left flex-1 min-h-[44px] py-2 px-2 -mx-2 rounded-lg hover:bg-white/25 transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => goBackToBot()}
              className="block w-full py-3 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Вернуться в бота
            </button>
          </PremiumCard>
        )}

        {!authReady && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] px-4 py-2">Загрузка...</p>
        )}

        <motion.p
          className="text-sm text-center mt-auto pt-4 leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.45, duration: 0.5 }}
        >
          Глубже работа с состоянием — в боте: поддержка, практики и ежедневная забота о себе.
        </motion.p>
      </div>
    </div>
  )
}
