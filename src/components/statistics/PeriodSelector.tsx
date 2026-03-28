import { motion } from 'framer-motion'
import type { StatsPeriod } from '../../api/client'

const options: { id: StatsPeriod; label: string }[] = [
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'all', label: 'Всё время' },
]

interface PeriodSelectorProps {
  period: StatsPeriod
  onChange: (p: StatsPeriod) => void
}

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div
      className="flex p-1 rounded-2xl bg-[var(--color-text-primary)]/[0.06] border border-[var(--color-lavender)]/25 mb-5"
      role="tablist"
      aria-label="Период графиков"
    >
      {options.map((o) => {
        const active = period === o.id
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className="relative flex-1 min-h-[44px] rounded-xl text-sm font-semibold z-10 transition-colors"
            style={{
              color: active ? 'var(--color-forest-dark)' : 'var(--color-text-secondary)',
              touchAction: 'manipulation',
            }}
          >
            {active && (
              <motion.span
                layoutId="period-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--color-glow-teal)]/45 to-[var(--color-lavender-soft)]/50 border border-[var(--color-lavender)]/35 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 px-1">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
