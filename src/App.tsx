import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ensureAuth, loadBackendConfig, getConnectionDiag, refreshInitData } from './api/client'
import { SceneBackground } from './components/SceneBackground'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { Dashboard } from './screens/Dashboard'
import { Catalog } from './screens/Catalog'
import { TestFlow } from './screens/TestFlow'
import { Result } from './screens/Result'
import { History } from './screens/History'
import { VoiceSupport } from './screens/VoiceSupport'
import { SelfRealization } from './screens/SelfRealization'
import { useAppStore } from './store/appStore'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })

const SHOW_CONNECTION_DIAG = false

function AppContent() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const reducedMotion = usePrefersReducedMotion()
  const [connectionDiag, setConnectionDiag] = useState<{ search: string; backend: string; initDataLength: number } | null>(null)

  useEffect(() => {
    if (reducedMotion) return
    const lenis = new Lenis({
      smoothWheel: true,
      touchMultiplier: 1.12,
      syncTouch: true,
    })
    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [reducedMotion])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    refreshInitData()
    tg?.ready()
    tg?.expand()
    let mounted = true
    const timers: number[] = []
    ;[0, 200, 500, 1200, 2500].forEach((ms) => {
      const t = window.setTimeout(() => {
        refreshInitData()
        if (mounted && SHOW_CONNECTION_DIAG) setConnectionDiag(getConnectionDiag())
      }, ms)
      timers.push(t)
    })
    loadBackendConfig().then(() => {
      refreshInitData()
      if (mounted && SHOW_CONNECTION_DIAG) setConnectionDiag(getConnectionDiag())
      const runAuth = () => {
        if (!mounted) return
        ensureAuth().then(() => {
          if (mounted && SHOW_CONNECTION_DIAG) setConnectionDiag(getConnectionDiag())
          if (mounted) {
            useAppStore.getState().setAuthReady(true)
            queryClient.invalidateQueries({ queryKey: ['test-history'] })
          }
        })
      }
      runAuth()
      ;[300, 800, 1500].forEach((ms) => setTimeout(runAuth, ms))
    })
    const onHash = () => {
      refreshInitData()
      ensureAuth()
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      mounted = false
      timers.forEach((id) => clearTimeout(id))
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  const dimOverlay = screen === 'catalog' || screen === 'history'

  const screenMotion = reducedMotion
    ? { duration: 0.12, ease: 'easeOut' as const }
    : { duration: 0.44, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="relative min-h-screen">
      <SceneBackground screen={screen} />
      {dimOverlay && (
        <div className="fixed inset-0 z-[5] pointer-events-none bg-black/30" aria-hidden />
      )}
      {SHOW_CONNECTION_DIAG && connectionDiag && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 bg-black/80 text-white text-xs p-2 font-mono max-h-24 overflow-auto pointer-events-auto"
          style={{ fontSize: 10 }}
          aria-label="Диагностика связи"
        >
          <div>query: {connectionDiag.search}</div>
          <div>backend: {connectionDiag.backend ? `${connectionDiag.backend.slice(0, 40)}…` : '(empty)'}</div>
          <div>initData length: {connectionDiag.initDataLength}</div>
        </div>
      )}
      <div className="relative z-10 pointer-events-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className="flex-1 flex flex-col min-h-screen min-h-0"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={screenMotion}
          >
            {screen === 'catalog' && <Catalog onBack={() => setScreen('dashboard')} />}
            {screen === 'test' && <TestFlow onBack={() => setScreen('catalog')} />}
            {screen === 'result' && <Result onBack={() => setScreen('dashboard')} />}
            {screen === 'history' && <History onBack={() => setScreen('dashboard')} />}
            {screen === 'voiceSupport' && <VoiceSupport onBack={() => setScreen('dashboard')} />}
            {screen === 'selfRealization' && <SelfRealization onBack={() => setScreen('dashboard')} />}
            {screen === 'dashboard' && (
              <Dashboard onOpenCatalog={() => setScreen('catalog')} onOpenHistory={() => setScreen('history')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
