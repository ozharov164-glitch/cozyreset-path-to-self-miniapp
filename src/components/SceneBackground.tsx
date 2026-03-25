import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { GardenScene, type SceneVariant } from '../scenes/GardenScene'
import { SceneErrorBoundary } from '../SceneErrorBoundary'
import { apiTestHistory } from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { Screen } from '../store/appStore'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

function mapScreenToVariant(screen: Screen): SceneVariant {
  switch (screen) {
    case 'catalog':
      return 'catalog'
    case 'test':
      return 'test'
    case 'result':
      return 'result'
    case 'history':
      return 'history'
    default:
      return 'dashboard'
  }
}

const SOFT_GRADIENT = {
  background:
    'linear-gradient(165deg, #e8e0f4 0%, #d4c8f0 28%, #c4b4e8 55%, #b8a4e0 82%, #a894d8 100%)',
} as const

/**
 * Живой фон: полноценная 3D-сцена (R3F + postprocessing) или мягкий градиент при reduced-motion / падении WebGL.
 */
export function SceneBackground({ screen }: { screen: Screen }) {
  const reducedMotion = usePrefersReducedMotion()
  const authReady = useAuthStore((s) => s.isInitialized)

  const { data } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
    enabled: authReady,
  })

  const historyItems = useMemo(
    () => (data?.items ?? []).map((i) => ({ testId: i.testId })),
    [data?.items],
  )

  if (reducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={SOFT_GRADIENT}
        aria-hidden
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    )
  }

  const variant = mapScreenToVariant(screen)

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <SceneErrorBoundary
        fallback={
          <motion.div
            className="absolute inset-0"
            style={SOFT_GRADIENT}
            animate={{ opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
        }
      >
        <Canvas
          camera={{ position: [0, 2, 8], fov: 45, near: 0.1, far: 64 }}
          dpr={[1, 1.5]}
          gl={{ alpha: false, antialias: true, powerPreference: 'default' }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <GardenScene variant={variant} historyItems={historyItems} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
