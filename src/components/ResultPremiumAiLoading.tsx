import { motion, useReducedMotion } from 'framer-motion'
import { IconSparkle } from './FeatureIcons'

type Props = {
  /** Разделитель сверху — уместно внутри карточки «Что дальше?» после прохождения теста */
  withTopDivider?: boolean
}

/**
 * Премиум-состояние загрузки персональных фраз для ИИ на экране результата.
 * Только для Result — не путать с компактным скелетоном на Dashboard.
 */
export function ResultPremiumAiLoading({ withTopDivider = false }: Props) {
  const reduceMotion = useReducedMotion()
  const lines = [0, 1, 2, 3]

  const inner = (
    <div className="relative z-10 flex flex-col items-center text-center">
      <motion.div
        className="relative mb-3 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl pts-result-ai-premium-icon-ring"
        animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {!reduceMotion && <div className="pts-result-ai-premium-orb" aria-hidden />}
        <motion.div
          animate={reduceMotion ? undefined : { rotate: [0, 6, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-[1]"
        >
          <IconSparkle className="h-8 w-8 text-[#c98a90] drop-shadow-sm" />
        </motion.div>
      </motion.div>

      <p
        className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2"
        style={{ color: 'var(--color-glow-teal)' }}
      >
        Проработать с ИИ в боте
      </p>
      <p className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight text-[var(--color-forest-dark)] mb-1.5">
        Готовим фразы для чата
      </p>
      <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)] max-w-[272px] mb-4">
        ИИ подбирает формулировки под твой результат — обычно это несколько секунд
      </p>

      <ul className="w-full space-y-2.5 text-left">
        {lines.map((i) => (
          <li key={i} className="flex gap-2.5 items-center">
            <span className="text-[var(--color-glow-teal)] shrink-0 opacity-45 text-xs" aria-hidden>
              ✦
            </span>
            <div
              className="pts-result-ai-premium-line flex-1 min-h-[44px] rounded-xl"
              style={
                reduceMotion
                  ? { opacity: 0.58, animation: 'none' }
                  : { animationDelay: `${i * 0.13}s` }
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Готовим персональные фразы для чата с поддержкой"
      className={withTopDivider ? 'mt-4 pt-5 border-t border-[rgba(125,211,192,0.32)]' : ''}
    >
      <motion.div
        className="pts-result-ai-premium relative overflow-hidden rounded-2xl px-4 py-5 sm:px-5"
        style={{ opacity: 1 }}
        initial={reduceMotion ? false : { y: 8 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {!reduceMotion && <div className="pts-result-ai-premium-shimmer" aria-hidden />}
        {inner}
      </motion.div>
    </div>
  )
}
