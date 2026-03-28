import { motion } from 'framer-motion'
import type { MiniAppStatisticsBundle } from '../../api/client'

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.35, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {value.toLocaleString('ru-RU')}
    </motion.span>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export function KPICards({ kpi }: { kpi: MiniAppStatisticsBundle['kpi'] }) {
  const items: { label: string; value: number; emoji: string; accent: string }[] = [
    { label: 'Дней с ботом', value: kpi.days_with_bot, emoji: '🌿', accent: 'from-[var(--color-glow-teal)]/25' },
    { label: 'Чек-ины', value: kpi.total_checkins, emoji: '☀️', accent: 'from-[var(--color-sunset-orange)]/30' },
    { label: 'Тесты', value: kpi.total_tests, emoji: '🧭', accent: 'from-[var(--color-lavender)]/30' },
    { label: 'Ритуалы', value: kpi.total_rituals, emoji: '✨', accent: 'from-[var(--color-sunset-rose)]/25' },
    { label: 'Сообщения ИИ', value: kpi.total_ai_messages, emoji: '💬', accent: 'from-[var(--color-glow-teal)]/20' },
  ]

  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          custom={i}
          variants={cardVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className={`card-premium rounded-2xl p-4 border border-[var(--color-lavender)]/20 bg-gradient-to-br ${item.accent} to-transparent relative overflow-hidden`}
        >
          <div
            className="absolute -right-4 -top-4 text-3xl opacity-[0.12] select-none pointer-events-none"
            aria-hidden
          >
            {item.emoji}
          </div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 pr-6">{item.label}</p>
          <p className="font-display text-2xl font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
            <AnimatedNumber value={item.value} />
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}
