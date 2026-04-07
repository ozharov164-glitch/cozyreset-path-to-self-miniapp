import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

const ACCENT: Record<string, string> = {
  coral: 'card-premium--accent-coral',
  mint: 'card-premium--accent-mint',
  lavender: 'card-premium--accent-lavender',
  slate: 'card-premium--accent-slate',
  rose: 'card-premium--accent-rose',
}

export type PremiumCardAccent = keyof typeof ACCENT

type PremiumCardProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children: ReactNode
  accent?: PremiumCardAccent
  delay?: number
}

export function PremiumCard({
  children,
  accent,
  delay = 0,
  className = '',
  ...rest
}: PremiumCardProps) {
  const reduce = useReducedMotion()
  const accentCls = accent ? ACCENT[accent] : ''

  return (
    <motion.div
      className={`card-premium overflow-hidden p-5 mb-4 ${accentCls} ${className}`.trim()}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.52,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={reduce ? undefined : { scale: 0.992 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
