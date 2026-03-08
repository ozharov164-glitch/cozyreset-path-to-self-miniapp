import { useEffect } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { Canvas } from '@react-three/fiber'
import { ensureAuth, loadBackendConfig } from './api/client'
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

function AppContent() {
  const screen = useAppStore((s) => s.screen)
  const setScreen = useAppStore((s) => s.setScreen)
  const skip3D = useSkip3DInTelegram()

  const { data: historyData } = useQuery({
    queryKey: ['test-history'],
    queryFn: apiTestHistory,
  })
  const historyItems = (historyData?.items ?? []).map((item) => ({ testId: item.testId }))

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    tg?.ready()
    tg?.expand()
    loadBackendConfig().then(() => {
      ensureAuth().then(() => useAppStore.getState().setAuthReady(true))
    })
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
