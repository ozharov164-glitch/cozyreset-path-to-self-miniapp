import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Canvas } from '@react-three/fiber'
import { ensureAuth, loadBackendConfig, getConnectionDiag, refreshInitData } from './api/client'
import { apiTestHistory } from './api/client'
import { Dashboard } from './screens/Dashboard'
import { Catalog } from './screens/Catalog'
import { TestFlow } from './screens/TestFlow'
import { Result } from './screens/Result'
import { History } from './screens/History'
import { useAppStore } from './store/appStore'
import { GardenScene } from './scenes/GardenScene'
import { SceneErrorBoundary } from './SceneErrorBoundary'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 0 } } })

/** В WebView бота WebGL часто падает или экран пустеет — показываем статичный фон. */
function useSkip3DInTelegram(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.Telegram?.WebApp?.initData || (window as unknown as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy)
}

const SHOW_CONNECTION_DIAG = false

function AppContent() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const skip3D = useSkip3DInTelegram()
  const [connectionDiag, setConnectionDiag] = useState<{ search: string; backend: string; initDataLength: number } | null>(null)

  const { data: historyData } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
  })
  const historyItems = (historyData?.items ?? []).map((item) => ({ testId: item.testId }))

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
          mounted && useAppStore.getState().setAuthReady(true)
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

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {skip3D ? (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #c9b8e8 0%, #b8a8d8 50%, #a898c8 100%)',
            }}
            aria-hidden
          />
        ) : (
          <SceneErrorBoundary>
            <Canvas
              camera={{ position: [0, 2, 8], fov: 50 }}
              gl={{ alpha: true, antialias: true }}
              dpr={[1, 2]}
            >
              <GardenScene variant={screen} historyItems={historyItems} />
            </Canvas>
          </SceneErrorBoundary>
        )}
      </div>
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
        {screen === 'catalog' && <Catalog onBack={() => setScreen('dashboard')} />}
        {screen === 'test' && <TestFlow onBack={() => setScreen('catalog')} />}
        {screen === 'result' && <Result onBack={() => setScreen('dashboard')} />}
        {screen === 'history' && <History onBack={() => setScreen('dashboard')} />}
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
      <AppContent />
    </QueryClientProvider>
  )
}
