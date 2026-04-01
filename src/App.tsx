import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ensureAuth,
  loadBackendConfig,
  getConnectionDiag,
  refreshInitData,
  prefetchTtsVoicePreviews,
  prefetchBgVoicePreviews,
} from './api/client'
import { AmbientBackground } from './components/AmbientBackground'
import { Dashboard } from './screens/Dashboard'
import { Catalog } from './screens/Catalog'
import { TestFlow } from './screens/TestFlow'
import { Result } from './screens/Result'
import { History } from './screens/History'
import { VoiceSupport } from './screens/VoiceSupport'
import { SelfRealization } from './screens/SelfRealization'
import { StatisticsPage } from './screens/StatisticsPage'
import { SpecialistBrief } from './screens/SpecialistBrief'
import { useAppStore } from './store/appStore'
import { AppErrorBoundary } from './components/AppErrorBoundary'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })

const SHOW_CONNECTION_DIAG = false

function AppContent() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const [connectionDiag, setConnectionDiag] = useState<{ search: string; backend: string; initDataLength: number } | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      document.documentElement.classList.add('tg-mini-app')
    }
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
      void prefetchTtsVoicePreviews()
      void prefetchBgVoicePreviews()
      ;[400, 2000].forEach((ms) => {
        window.setTimeout(() => {
          if (!mounted) return
          void prefetchTtsVoicePreviews()
          void prefetchBgVoicePreviews()
        }, ms)
      })
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


  return (
    <div className="relative min-h-screen min-h-[100dvh]">
      <AmbientBackground />
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
        {screen === 'catalog' && <Catalog onBack={() => setScreen('dashboard')} />}
        {screen === 'test' && <TestFlow onBack={() => setScreen('catalog')} />}
        {screen === 'result' && <Result onBack={() => setScreen('dashboard')} />}
        {screen === 'history' && <History onBack={() => setScreen('dashboard')} />}
        {screen === 'voiceSupport' && <VoiceSupport onBack={() => setScreen('dashboard')} />}
        {screen === 'selfRealization' && <SelfRealization onBack={() => setScreen('dashboard')} />}
        {screen === 'statistics' && <StatisticsPage onBack={() => setScreen('dashboard')} />}
        {screen === 'specialistBrief' && <SpecialistBrief onBack={() => setScreen('dashboard')} />}
        {screen === 'dashboard' && (
          <Dashboard onOpenCatalog={() => setScreen('catalog')} onOpenHistory={() => setScreen('history')} />
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </QueryClientProvider>
  )
}
