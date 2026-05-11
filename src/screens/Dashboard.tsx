import { useEffect, useState, type ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { apiTestHistory, apiStatistics, getBackendUrl, syncPremiumFromInit, type ApiStatisticsResult } from '../api/client'
import { useAppStore } from '../store/appStore'
import { goBackToBot } from '../utils/telegram'
import { PremiumCard } from '../components/PremiumCard'
import { WelcomeFingerprintBadge, WelcomePathJourneyArt } from '../components/dashboard/WelcomeHeroVisuals'
import { VenusCoachNudgeCard } from '../components/VenusCoachNudgeCard'
import {
  IconChart,
  IconHeartLine,
  IconLayers,
  IconMic,
  IconMapPin,
  IconNeuroArena,
  IconPulse,
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

function pluralizeDaysRu(n: number): string {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return 'дней'
  if (last === 1) return 'день'
  if (last >= 2 && last <= 4) return 'дня'
  return 'дней'
}

function calcPremiumDaysLeft(iso: string | null): number | null {
  if (!iso) return null
  const end = new Date(iso)
  if (Number.isNaN(end.getTime())) return null
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const days = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
  return days
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

function IconSparkle({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.4 5.2L18.5 9 13.4 11.8 12 17l-1.4-5.2L5.5 9l5.1-1.8L12 2zm7 13l.8 3 3 .8-3 .8-.8 3-.8-3-3-.8 3-.8.8-3z" />
    </svg>
  )
}

function IconShieldSoft({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3l7 3v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6l7-3z" />
    </svg>
  )
}

function IconChatBubble({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 18l-3 3V6a3 3 0 013-3h10a3 3 0 013 3v7a3 3 0 01-3 3H9l-2 2z" />
    </svg>
  )
}

function IconBookOpen({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6.5A2.5 2.5 0 016.5 4H12v16H6.5A2.5 2.5 0 014 17.5v-11z" />
      <path d="M20 6.5A2.5 2.5 0 0017.5 4H12v16h5.5A2.5 2.5 0 0020 17.5v-11z" />
    </svg>
  )
}

function IconChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function DashboardHeroButton({
  label,
  onClick,
  leadIcon,
}: {
  label: string
  onClick: () => void
  leadIcon: ComponentType<{ className?: string }>
}) {
  const LeadIcon = leadIcon
  return (
    <button
      type="button"
      onClick={onClick}
      className="pts-hero-cta btn-primary font-semibold"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      <span className="pts-hero-cta__lead">
        <span className="pts-hero-cta__icon">
          <LeadIcon className="text-white" />
        </span>
        <span className="pts-hero-cta__label">{label}</span>
      </span>
      <span className="pts-hero-cta__trail" aria-hidden>
        <IconChevronRight />
        <IconSparkle className="text-white/90" />
      </span>
    </button>
  )
}

export function Dashboard({ onOpenCatalog, onOpenHistory }: DashboardProps) {
  const queryClient = useQueryClient()
  const reduceMotion = useReducedMotion()
  const authReady = useAuthStore((s) => s.isInitialized)
  const appAuthReady = useAppStore((s) => s.authReady)
  const appSaveToken = useAuthStore((s) => s.appSaveToken)
  const isPremium = useAuthStore((s) => s.isPremium)
  const premiumUntilIso = useAuthStore((s) => s.premiumUntilIso)
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

  const openResult = (id: string) => {
    openResultFromHistory(id)
  }

  /** Блок «Твоё состояние» — по умолчанию свёрнут, если есть результаты (экономия места). */
  const [isStateSectionExpanded, setIsStateSectionExpanded] = useState(false)

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
  const premiumDaysLeft = calcPremiumDaysLeft(premiumUntilIso)

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <motion.header
        className="header-app-glass pts-dashboard-header h-14 flex items-center justify-between px-4 mb-5"
        {...headerMotion}
      >
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="btn-ghost min-h-[44px] py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold select-none tracking-tight text-[var(--color-forest-dark)]"
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
          className="btn-ghost min-h-[44px] py-2 px-3 -my-1 -mr-1 rounded-xl text-sm font-semibold text-[#7b63b8] select-none inline-flex items-center gap-1.5"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          <IconSparkle className="text-[#9b6fe3]" />
          История
        </button>
      </motion.header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6">
        <PremiumCard accent="slate" delay={0} className="pts-dashboard-tariff">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {isPremium === true ? (
                <>
                  <p className="pts-dashboard-tariff__label">
                    Текущий тариф
                  </p>
                  <p className="pts-dashboard-tariff__value">
                    Премиум
                    {premiumDaysLeft !== null
                      ? ` · ещё ${premiumDaysLeft} ${pluralizeDaysRu(premiumDaysLeft)}`
                      : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="pts-dashboard-tariff__label">
                    Бесплатно сейчас
                  </p>
                  <p className="pts-dashboard-tariff__note">
                    Тесты, базовые практики, 10 сообщений ИИ‑Венере за 3 дня и по одному PDF «К специалисту» и «Карта
                    терапии».
                  </p>
                </>
              )}
            </div>
          </div>
        </PremiumCard>

        <PremiumCard accent="lavender" delay={0.02}>
          <div className="flex gap-4 mb-4">
            <img
              src={`${import.meta.env.BASE_URL}ai-venus-avatar.png`}
              alt="Иллюстративный образ ИИ-Венеры, коуча приложения"
              width={80}
              height={80}
              className="w-20 h-20 shrink-0 rounded-[18px] object-cover shadow-md ring-2 ring-white/60"
              decoding="async"
            />
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-display text-lg font-bold text-[var(--color-text-primary)] tracking-tight leading-snug flex items-center gap-1.5 flex-wrap">
                <span>ИИ-Венера</span>
                <IconSparkle className="text-[#9b6fe3]" />
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-snug font-medium">
                Коуч внутри приложения «Путь к себе»
              </p>
              <span className="pts-venus-badge">
                <IconShieldSoft />
                Твой проводник к осознанности
              </span>
            </div>
          </div>
          <p className="text-sm pts-venus-copy mb-4 leading-relaxed">
            Спокойный ИИ-собеседник: отвечает с учётом твоих тестов, заметок и сессий в нейро-арене. Помогает
            сформулировать следующий шаг и подсказать, куда перейти в приложении. Это не психотерапия, а поддержка в
            понятном темпе.
          </p>
          <DashboardHeroButton
            label="Открыть чат"
            leadIcon={IconChatBubble}
            onClick={() => useAppStore.getState().setScreen('pathCoach')}
          />
        </PremiumCard>

        <PremiumCard accent="coral" delay={0.04} className="pts-dashboard-welcome">
          <div className="pts-welcome-hero">
            <WelcomeFingerprintBadge />
            <h2 className="pts-welcome-hero__title font-display text-xl font-bold text-[var(--color-text-primary)] tracking-tight leading-snug">
              Привет, {userName} 👋
            </h2>
            <p className="pts-welcome-hero__text text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
              Это основной продукт «Путь к себе»: начни бесплатно и двигайся в своём темпе.
            </p>
            <WelcomePathJourneyArt />
          </div>
          <DashboardHeroButton label="Каталог тестов" leadIcon={IconBookOpen} onClick={onOpenCatalog} />
        </PremiumCard>

        {authReady && appSaveToken && (
          <PremiumCard accent="lavender" delay={0.03}>
            <CardHeading icon={IconChart} title="К специалисту" iconClassName="text-[#6b7eb8]" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              Ответь на короткую анкету — ИИ поможет собрать связный текст и скачать PDF для психолога или коуча. 💛
            </p>
            <button
              type="button"
              onClick={() => useAppStore.getState().setScreen('specialistBrief')}
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Заполнить анкету
            </button>

            <div className="border-t border-white/35 pt-5 mt-5">
              <CardHeading icon={IconMapPin} title="Карта терапии" iconClassName="text-[#3d9e8f]" />
              <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                Темп, границы, опоры и пожелания к формату — связный PDF для специалиста. Не про симптомы, а про то, как
                тебе спокойнее в процессе.
              </p>
              <button
                type="button"
                onClick={() => useAppStore.getState().setScreen('therapyMap')}
                className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                Собрать карту
              </button>
            </div>
          </PremiumCard>
        )}

        <PremiumCard accent="lavender" delay={0.045}>
          <CardHeading icon={IconNeuroArena} title="Нейро-Арена" iconClassName="text-[#6b5b9c]" />
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Короткие тренировки внимания и гибкости интерпретации: обычно несколько минут за сессию. Образовательный
            формат: не медицина, не психотерапия и не замена очному приёму специалиста.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('neuroArena')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Открыть Нейро-Арену
          </button>
        </PremiumCard>

        <PremiumCard accent="slate" delay={0.05}>
          <CardHeading icon={IconPulse} title="Моя статистика" iconClassName="text-[#5c7caf]" />
          <p className="font-display text-[15px] font-semibold text-[var(--color-forest-dark)] mb-1.5 leading-snug">
            Оцени свой прогресс
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Настроение, тесты, ритуалы и диалоги с ИИ — наглядно и с анимацией.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('statistics')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Открыть статистику
          </button>

          <div className="border-t border-white/35 pt-5 mt-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <CardHeading icon={IconLayers} title="Твоё состояние" iconClassName="text-[#9b8bc9]" />
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsStateSectionExpanded((v) => !v)}
                  className="shrink-0 mt-0.5 py-2 px-3 rounded-xl text-sm font-semibold text-[var(--color-glow-teal)] btn-ghost min-h-[40px]"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  aria-expanded={isStateSectionExpanded}
                >
                  {isStateSectionExpanded ? 'Свернуть' : 'Развернуть'}
                </button>
              )}
            </div>

            {showHistoryLoading ? (
              <p className="text-sm text-[var(--color-text-secondary)] py-2">Загрузка…</p>
            ) : items.length === 0 ? (
              <>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                  Регулярные замеры помогают видеть прогресс и бережнее относиться к себе. Здесь — твой срез.
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] py-2">
                  Пока нет сохранённых результатов. Пройди первый тест из каталога — он станет началом твоей карты.
                </p>
              </>
            ) : !isStateSectionExpanded ? (
              <button
                type="button"
                onClick={() => setIsStateSectionExpanded(true)}
                className="w-full text-left rounded-xl py-3 px-3 -mx-1 border border-white/40 bg-white/20 hover:bg-white/30 transition-colors"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--color-text-primary)]">{items.length}</span>{' '}
                  {items.length === 1 ? 'тест пройден' : items.length < 5 ? 'теста пройдено' : 'тестов пройдено'}
                  {recentItems[0] && (
                    <>
                      {' '}
                      · последний:{' '}
                      <span className="text-[var(--color-text-primary)]">{recentItems[0].testTitle}</span>
                    </>
                  )}
                </p>
                <p className="text-xs mt-1.5 text-[var(--color-glow-teal)] font-semibold">Нажми, чтобы открыть список</p>
              </button>
            ) : (
              <>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                  Регулярные замеры помогают видеть прогресс и бережнее относиться к себе. Здесь — твой срез.
                </p>
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

        <PremiumCard accent="lavender" delay={0.1}>
          <CardHeading icon={IconMic} title="Голосовая поддержка" iconClassName="text-[var(--color-glow-teal-dim)]" />
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Напиши, что на душе — ИИ ответит тёплым голосом, в стиле психологической поддержки.
          </p>
          <button
            type="button"
            onClick={() => useAppStore.getState().setScreen('voiceSupport')}
            className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            Ответ голосом
          </button>

          <div className="border-t border-white/35 pt-5 mt-5">
            <CardHeading icon={IconPulse} title="Чек-ины" iconClassName="text-[#5c7caf]" />
            <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
              Утренний и вечерний формат в приложении: отметка состояния, короткая заметка и история твоего ритма.
            </p>
            <button
              type="button"
              onClick={() => useAppStore.getState().setScreen('checkins')}
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Открыть чек-ины
            </button>
          </div>

          <div className="border-t border-white/35 pt-5 mt-5">
            <CardHeading icon={IconHeartLine} title="Ритм Сердца" iconClassName="text-[#c97a8a]" />
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
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Открыть
            </button>
          </div>
        </PremiumCard>

        <PremiumCard accent="mint" delay={0.16}>
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

        {items.length > 0 && <VenusCoachNudgeCard delay={0.22} />}

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
          Бот теперь помогает с подпиской, отзывами, поддержкой, рефералами и новостями проекта.
        </motion.p>
      </div>
    </div>
  )
}
