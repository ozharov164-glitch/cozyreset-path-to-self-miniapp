/**
 * Фон «Путь к себе»: лавандовый градиент, аврора и мягкие орбы (CSS + лёгкий motion).
 */
import { motion, useReducedMotion } from 'framer-motion'

export function AmbientBackground() {
  const reduce = useReducedMotion()

  const float = reduce
    ? undefined
    : {
        animate: {
          x: [0, 14, -10, 6, 0],
          y: [0, -12, 8, -4, 0],
        },
        transition: {
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

  const floatSlow = reduce
    ? undefined
    : {
        animate: {
          x: [0, -18, 12, -6, 0],
          y: [0, 10, -14, 6, 0],
        },
        transition: {
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

  const floatCream = reduce
    ? undefined
    : {
        animate: {
          x: [0, -10, 14, 0],
          y: [0, 14, -8, 0],
        },
        transition: {
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

  return (
    <div className="pts-ambient fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <div className="pts-ambient__base" />
      <div className="pts-ambient__aurora" />
      <motion.div className="pts-ambient__orb-wrap pts-ambient__orb-wrap--rose" {...float}>
        <div className="pts-ambient__orb pts-ambient__orb--rose" />
      </motion.div>
      <motion.div className="pts-ambient__orb-wrap pts-ambient__orb-wrap--teal" {...floatSlow}>
        <div className="pts-ambient__orb pts-ambient__orb--teal" />
      </motion.div>
      <motion.div className="pts-ambient__orb-wrap pts-ambient__orb-wrap--cream" {...floatCream}>
        <div className="pts-ambient__orb pts-ambient__orb--cream" />
      </motion.div>
      <div className="pts-ambient__veil" />
      <div className="pts-ambient__grain" />
    </div>
  )
}
