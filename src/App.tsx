import { lazy, Suspense, useEffect, useState } from 'react'
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
import { useAppStore } from './store/appStore'

const Dashboard = lazy(async () => {
  const m = await import('./screens/Dashboard')
  return { default: m.Dashboard }
})
const Catalog = lazy(async () => {
  const m = await import('./screens/Catalog')
  return { default: m.Catalog }
})
const TestFlow = lazy(async () => {
  const m = await import('./screens/TestFlow')
  return { default: m.TestFlow }
})
const Result = lazy(async () => {
  const m = await import('./screens/Result')
  return { default: m.Result }
})
const History = lazy(async () => {
  const m = await import('./screens/History')
  return { default: m.History }
})
const VoiceSupport = lazy(async () => {
  const m = await import('./screens/VoiceSupport')
  return { default: m.VoiceSupport }
})
const Checkins = lazy(async () => {
  const m = await import('./screens/Checkins')
  return { default: m.Checkins }
})
const SelfRealization = lazy(async () => {
  const m = await import('./screens/SelfRealization')
  return { default: m.SelfRealization }
})
const StatisticsPage = lazy(async () => {
  const m = await import('./screens/StatisticsPage')
  return { default: m.StatisticsPage }
})
const SpecialistBrief = lazy(async () => {
  const m = await import('./screens/SpecialistBrief')
  return { default: m.SpecialistBrief }
})
const TherapyMap = lazy(async () => {
  const m = await import('./screens/TherapyMap')
  return { default: m.TherapyMap }
})
const PathCoach = lazy(async () => {
  const m = await import('./screens/PathCoach')
  return { default: m.PathCoach }
})
const NeuroArenaScreen = lazy(async () => {
  const m = await import('./components/NeuroArena/NeuroArenaScreen')
  return { default: m.NeuroArenaScreen }
})
import { AppErrorBoundary } from './components/AppErrorBoundary'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })

const SHOW_CONNECTION_DIAG = false

function AppContent() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const [connectionDiag, setConnectionDiag] = useState<{ search: string; backend: string; initDataLength: number } | null>(null)

  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const attachHeart = url.searchParams.get('attachHeartSession')?.trim()
      if (attachHeart && /^\d+$/.test(attachHeart)) {
        try {
          sessionStorage.setItem('pts_attach_heart_session_id', attachHeart)
        } catch {
          /* ignore */
        }
        url.searchParams.delete('attachHeartSession')
      }
      if (url.searchParams.get('heartDup') === '1') {
        try {
          sessionStorage.setItem('pts_attach_heart_force_dup', '1')
        } catch {
          /* ignore */
        }
        url.searchParams.delete('heartDup')
      }
      if (url.searchParams.get('venusPending') === '1') {
        try {
          sessionStorage.setItem('pts_venus_result_pending', '1')
          sessionStorage.setItem('pts_venus_pending_since', String(Date.now() - 2500))
        } catch {
          /* ignore */
        }
        url.searchParams.delete('venusPending')
      }
      const hashNorm = (url.hash || '').replace(/^#/, '').trim().toLowerCase()
      if (hashNorm === 'pathcoach' || hashNorm === 'path-coach' || hashNorm === 'venus') {
        useAppStore.getState().setScreen('pathCoach')
        url.hash = ''
      }
      const next = url.pathname + url.search + url.hash
      const cur = window.location.pathname + window.location.search + window.location.hash
      if (next !== cur) {
        window.history.replaceState(null, '', next)
      }
    } catch {
      /* ignore invalid URL */
    }
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
      <div className="relative z-10 pointer-events-auto min-h-screen flex flex-col isolate [transform:translateZ(0)]">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center px-4 text-sm text-[var(--color-text-secondary)]">
              Загрузка…
            </div>
          }
        >
          {screen === 'catalog' && <Catalog onBack={() => setScreen('dashboard')} />}
          {screen === 'test' && (
            <TestFlow
              onBack={() => {
                const st = useAppStore.getState()
                if (st.pathCoachReturnAfterTest) {
                  st.setPathCoachReturnAfterTest(false)
                  st.setScreen('pathCoach')
                } else {
                  st.setScreen('catalog')
                }
              }}
            />
          )}
          {screen === 'result' && <Result onBack={() => setScreen('dashboard')} />}
          {screen === 'history' && <History onBack={() => setScreen('dashboard')} />}
          {screen === 'voiceSupport' && <VoiceSupport onBack={() => setScreen('dashboard')} />}
          {screen === 'checkins' && <Checkins onBack={() => setScreen('dashboard')} />}
          {screen === 'selfRealization' && <SelfRealization onBack={() => setScreen('dashboard')} />}
          {screen === 'statistics' && <StatisticsPage onBack={() => setScreen('dashboard')} />}
          {screen === 'specialistBrief' && <SpecialistBrief onBack={() => setScreen('dashboard')} />}
          {screen === 'therapyMap' && <TherapyMap onBack={() => setScreen('dashboard')} />}
          {screen === 'pathCoach' && <PathCoach onBack={() => setScreen('dashboard')} />}
          {screen === 'neuroArena' && <NeuroArenaScreen onBack={() => setScreen('dashboard')} />}
          {screen === 'dashboard' && (
            <Dashboard onOpenCatalog={() => setScreen('catalog')} onOpenHistory={() => setScreen('history')} />
          )}
        </Suspense>
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
