import { useAuthStore } from '../store/authStore'

const getBackendUrl = (): string => {
  const fromEnv = import.meta.env.VITE_BOT_BACKEND_URL
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

// Приоритет авторизации: токен из store → токен из hash (#s= или #token=) → POST /mini-app/init с initData из Telegram.WebApp
export async function ensureAuth(): Promise<string | null> {
  const token = useAuthStore.getState().appSaveToken
  if (token) return token

  const fromHash = getTokenFromHash()
  if (fromHash) {
    useAuthStore.getState().setToken(fromHash)
    useAuthStore.getState().setInitialized(true)
    return fromHash
  }

  const initData = getInitDataString()
  if (!initData) return null

  const backend = getBackendUrl()
  if (!backend) return null

  try {
    const res = await fetch(`${backend}/mini-app/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newToken = (data as { app_save_token?: string }).app_save_token?.trim()
    if (newToken) {
      useAuthStore.getState().setToken(newToken)
      useAuthStore.getState().setInitialized(true)
      return newToken
    }
  } catch {
    // ignore
  }
  return null
}

function getTokenFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  const params = new URLSearchParams(hash)
  return params.get('s')?.trim() || params.get('token')?.trim() || null
}

// initData: приоритет Telegram.WebApp.initData (из initDataUnsafe контекста), затем hash/search tgWebAppData
function getInitDataString(): string {
  if (typeof window === 'undefined') return ''
  const tg = window.Telegram?.WebApp
  if (tg?.initData?.trim()) return tg.initData.trim()
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  const fromHash = params.get('tgWebAppData')?.trim()
  if (fromHash) return fromHash
  const search = new URLSearchParams(window.location.search)
  return search.get('tgWebAppData')?.trim() || ''
}

async function fetchWithAuth(
  path: string,
  options: RequestInit & { skipRetry?: boolean } = {}
): Promise<Response> {
  const backend = getBackendUrl()
  if (!backend) return new Response(null, { status: 502 })

  let token = useAuthStore.getState().appSaveToken
  if (!token) token = await ensureAuth()
  if (!token && !options.skipRetry) {
    const initData = getInitDataString()
    if (initData) {
      const res = await fetch(`${backend}/mini-app/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })
      if (res.ok) {
        const data = await res.json()
        const newToken = (data as { app_save_token?: string }).app_save_token?.trim()
        if (newToken) {
          useAuthStore.getState().setToken(newToken)
          token = newToken
        }
      }
    }
  }

  const url = path.startsWith('http') ? path : `${backend}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  let body = options.body
  if (token && options.method === 'POST' && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>
      if (!parsed.token) {
        parsed.token = token
        body = JSON.stringify(parsed)
      }
    } catch {
      // leave body as is
    }
  }

  const res = await fetch(url, { ...options, headers, body })
  if (res.status === 401 && !options.skipRetry) {
    useAuthStore.getState().setToken(null)
    const retryToken = await ensureAuth()
    if (retryToken) {
      return fetchWithAuth(path, { ...options, skipRetry: true })
    }
  }
  return res
}

export async function apiSaveTestResult(payload: {
  testId: string
  testTitle: string
  answers: number[]
  dimensions?: Record<string, number>
  completedAt: string
}): Promise<{ id: string } | null> {
  const res = await fetchWithAuth('/mini-app/save-test-result', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data as { id: string }
}

export async function apiTestHistory(): Promise<{ items: Array<{ id: string; testId: string; testTitle: string; completedAt: string }> }> {
  const res = await fetchWithAuth('/mini-app/test-history', { method: 'POST', body: '{}' })
  if (!res.ok) return { items: [] }
  const data = await res.json()
  return data as { items: Array<{ id: string; testId: string; testTitle: string; completedAt: string }> }
}

export async function apiTestResult(id: string): Promise<{
  id: string
  testId: string
  testTitle: string
  answers: number[]
  dimensions?: Record<string, number>
  completedAt: string
} | null> {
  const token = useAuthStore.getState().appSaveToken || (await ensureAuth())
  const backend = getBackendUrl()
  const url = token
    ? `${backend}/mini-app/test-result/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`
    : `${backend}/mini-app/test-result/${encodeURIComponent(id)}`
  const res = await fetch(url)
  if (res.status === 401) {
    useAuthStore.getState().setToken(null)
    const retryToken = await ensureAuth()
    if (retryToken) return apiTestResult(id)
  }
  if (!res.ok) return null
  const data = await res.json()
  return data as { id: string; testId: string; testTitle: string; answers: number[]; dimensions?: Record<string, number>; completedAt: string }
}
