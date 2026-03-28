import { motion } from 'framer-motion'

const bar = {
  initial: { opacity: 0.45 },
  animate: { opacity: [0.45, 0.85, 0.45] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
}

export function StatisticsSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Загрузка статистики">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="card-premium rounded-2xl p-4 h-[88px] border border-[var(--color-lavender)]/15"
            style={{ background: 'linear-gradient(90deg, rgba(107,196,181,0.12) 0%, rgba(184,164,224,0.1) 100%)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <motion.div className="h-3 w-16 rounded-full bg-[var(--color-text-primary)]/10 mb-3" {...bar} />
            <motion.div className="h-7 w-12 rounded-lg bg-[var(--color-glow-teal)]/20" {...bar} transition={{ ...bar.transition, delay: i * 0.08 }} />
          </motion.div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`ch${i}`}
          className="card-premium rounded-2xl p-4 h-[220px] border border-[var(--color-lavender)]/15"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06 }}
        >
          <motion.div
            className="h-full w-full rounded-xl bg-gradient-to-br from-[var(--color-glow-teal)]/8 to-[var(--color-lavender)]/8"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
          />
        </motion.div>
      ))}
    </div>
  )
}
