import { PremiumCard } from './PremiumCard'
import { IconSparkle } from './FeatureIcons'
import { useAppStore } from '../store/appStore'

type VenusCoachNudgeCardProps = {
  /** Задержка появления (как у соседних PremiumCard на дашборде) */
  delay?: number
  className?: string
  /** Компактная подсказка на экране «Голосовая поддержка» */
  variant?: 'default' | 'voiceSupport'
  /** Переопределение заголовка (например «Открыть анализ», если разбор уже сохранён) */
  heading?: string
  bodyText?: string
  buttonLabel?: string
  /**
   * Полный переход в ИИ-Венеру с экрана результата (сброс теста, pts_venus_result_pending, навигация).
   * Без этого только setScreen — чат не ждёт разбор и кажется «мёртвым».
   */
  onOpenCoach?: () => void
}

/**
 * Призыв открыть ИИ-Венеру вместо устаревших «фраз для чата с поддержкой в боте».
 */
export function VenusCoachNudgeCard({
  delay = 0,
  className = '',
  variant = 'default',
  heading,
  bodyText,
  buttonLabel,
  onOpenCoach,
}: VenusCoachNudgeCardProps) {
  const openCoach = () => {
    if (onOpenCoach) onOpenCoach()
    else useAppStore.getState().setScreen('pathCoach')
  }
  if (variant === 'voiceSupport') {
    return (
      <PremiumCard accent="mint" delay={delay} className={`!p-4 !mb-4 ${className}`.trim()}>
        <div className="flex items-start gap-2.5 mb-3">
          <img
            src={`${import.meta.env.BASE_URL}ai-venus-avatar.png`}
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 shrink-0 rounded-lg object-cover ring-2 ring-white/45 shadow-sm"
            decoding="async"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] font-bold text-[var(--color-text-primary)] tracking-tight mb-1">
              Не знаешь, что хочется услышать?
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Посоветуйся с ИИ-Венерой — она поможет сформулировать запрос под твоё состояние. Потом вставь текст сюда
              или скопируй промпт для бота.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCoach}
          className="w-full py-2.5 px-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#5ad4c4] via-[#3db8a8] to-[#2a9d8f] shadow-[0_6px_20px_rgba(45,130,118,0.28),inset_0_1px_0_rgba(255,255,255,0.25)] active:scale-[0.98] transition-transform"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          К ИИ-Венере
        </button>
      </PremiumCard>
    )
  }

  return (
    <PremiumCard accent="lavender" delay={delay} className={className}>
      <div className="flex items-start gap-3 mb-4">
        <img
          src={`${import.meta.env.BASE_URL}ai-venus-avatar.png`}
          alt=""
          width={44}
          height={44}
          className="w-11 h-11 shrink-0 rounded-xl object-cover ring-2 ring-white/50 shadow-sm"
          decoding="async"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight mb-1 flex items-center gap-2">
            <IconSparkle className="w-5 h-5 shrink-0 text-[#9d82c9]" aria-hidden />
            {heading ?? 'Проработать с ИИ-Венерой'}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {bodyText ??
              'Венера видит твои тесты, самореализацию и нейро-арену — можно мягко разобрать переживания и собрать текст для голоса, без отдельных заготовок для чата в боте.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={openCoach}
        className="w-full py-3.5 px-4 rounded-xl font-semibold text-white min-h-[48px] bg-gradient-to-br from-[#a088cc] via-[#8465b3] to-[#6a4d96] shadow-[0_8px_28px_rgba(75,48,115,0.35),inset_0_1px_0_rgba(255,255,255,0.22)] active:scale-[0.98] transition-transform"
        style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
      >
        {buttonLabel ?? 'Открыть ИИ-Венеру'}
      </button>
    </PremiumCard>
  )
}
