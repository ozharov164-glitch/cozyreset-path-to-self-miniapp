import { useAuthStore } from '../store/authStore'

let backendUrlOverride: string | null = null

const BACKEND_STORAGE_KEY = 'pts_backend_url'
const DEBUG = true // диагностика «Нет связи» — потом убрать или по env

/** Загрузить backend URL: сначала из ссылки (бот передаёт ?backend=...), затем из config.json. */
export async function loadBackendConfig(): Promise<void> {
  if (typeof window === 'undefined') return
  // 1) Из ссылки при открытии из бота (?backend=https://...) — приоритет, связь с ботом
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('backend')?.trim()
  if (DEBUG) {
    console.log('[PTS] loadBackendConfig: location.href=', window.location.href)
    console.log('[PTS] loadBackendConfig: location.search=', window.location.search)
    console.log('[PTS] loadBackendConfig: backend from query=', fromQuery || '(empty)')
  }
  if (fromQuery && (fromQuery.startsWith('http://') || fromQuery.startsWith('https://'))) {
    backendUrlOverride = fromQuery.replace(/\/$/, '')
    try {
      sessionStorage.setItem(BACKEND_STORAGE_KEY, backendUrlOverride)
    } catch {
      /* ignore */
    }
    return
  }
  // 2) Из sessionStorage (если уже открывали с backend= в этой сессии)
  try {
    const stored = sessionStorage.getItem(BACKEND_STORAGE_KEY)
    if (stored && (stored.startsWith('http://') || stored.startsWith('https://'))) {
      backendUrlOverride = stored.replace(/\/$/, '')
      return
    }
  } catch {
    /* ignore */
  }
  // 3) Из config.json
  try {
    const base = (import.meta.env.VITE_BASE_PATH as string) || '/'
    const path = base.endsWith('/') ? `${base}config.json` : `${base}/config.json`
    const url = `${window.location.origin}${path}`
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return
    const j = (await r.json()) as { backendUrl?: string }
    const u = j?.backendUrl && typeof j.backendUrl === 'string' ? j.backendUrl.replace(/\/$/, '') : null
    if (u && (u.startsWith('http://') || u.startsWith('https://'))) backendUrlOverride = u
  } catch {
    /* ignore */
  }
  if (DEBUG) console.log('[PTS] loadBackendConfig: final backendUrlOverride=', backendUrlOverride)
}

function getBackendUrl(): string {
  if (backendUrlOverride) return backendUrlOverride
  const fromEnv = import.meta.env.VITE_BOT_BACKEND_URL
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

const INIT_RETRY_DELAYS = [0, 100, 300, 1000, 2500] // 5 попыток, exponential backoff

// Приоритет авторизации: токен из store → токен из hash → POST /mini-app/init с initData (с retry при 401/network)
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
  if (DEBUG) console.log('[PTS] ensureAuth: initData length=', initData?.length ?? 0)
  if (!initData) {
    useAuthStore.getState().setInitialized(true)
    return null
  }

  const backend = getBackendUrl()
  if (DEBUG) console.log('[PTS] ensureAuth: getBackendUrl()=', backend || '(empty)')
  if (!backend) {
    useAuthStore.getState().setInitialized(true)
    return null
  }

  for (let attempt = 0; attempt < INIT_RETRY_DELAYS.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, INIT_RETRY_DELAYS[attempt]))
    }
    try {
      if (DEBUG) console.log('[PTS] ensureAuth: attempt', attempt + 1, 'POST', backend + '/mini-app/init')
      const res = await fetch(`${backend}/mini-app/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })
      if (!res.ok) {
        if (res.status === 401 || res.status >= 500) continue
        useAuthStore.getState().setInitialized(true)
        return null
      }
      const data = await res.json()
      const newToken = (data as { app_save_token?: string }).app_save_token?.trim()
      if (newToken) {
        useAuthStore.getState().setToken(newToken)
        useAuthStore.getState().setInitialized(true)
        return newToken
      }
    } catch (e) {
      if (DEBUG) console.warn('[PTS] ensureAuth: attempt', attempt + 1, 'fetch error', e)
    }
  }
  useAuthStore.getState().setInitialized(true)
  return null
}

function getTokenFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.slice(1)
  if (!hash) return null
  const params = new URLSearchParams(hash)
  return params.get('s')?.trim() || params.get('token')?.trim() || null
}

// initData: приоритет Telegram.WebApp.initData, затем hash/search tgWebAppData (для сохранения без токена)
export function getInitDataString(): string {
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
  if (options.method === 'POST' && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>
      if (token && !parsed.token) parsed.token = token
      const initData = getInitDataString()
      if (initData && !parsed.initData) parsed.initData = initData
      body = JSON.stringify(parsed)
    } catch {
      // leave body as is
    }
  }

  const res = await fetch(url, { ...options, headers, body })
  if (res.status === 401 && !options.skipRetry) {
    useAuthStore.getState().setToken(null)
    for (let attempt = 0; attempt < 3; attempt++) {
      const retryToken = await ensureAuth()
      if (retryToken) {
        const retryRes = await fetchWithAuth(path, { ...options, skipRetry: true })
        if (retryRes.status !== 401) return retryRes
      }
    }
  }
  return res
}

export type SaveResult = { id: string } | { error: string; status?: number }

export async function apiSaveTestResult(payload: {
  testId: string
  testTitle: string
  answers: number[]
  dimensions?: Record<string, number>
  completedAt: string
}): Promise<SaveResult> {
  const body: Record<string, unknown> = { ...payload }
  const initData = getInitDataString()
  if (initData) body.initData = initData

  const trySave = async (): Promise<SaveResult> => {
    try {
      const res = await fetchWithAuth('/mini-app/save-test-result', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({})) as { id?: string; error?: string }
      if (res.ok && data.id) return { id: data.id }
      return { error: data.error || 'Не удалось сохранить', status: res.status }
    } catch {
      return { error: 'network', status: 0 }
    }
  }

  let result = await trySave()
  if (('id' in result && result.id) || result.error !== 'network') return result
  useAuthStore.getState().setToken(null)
  await new Promise((r) => setTimeout(r, 300))
  const reToken = await ensureAuth()
  if (reToken) result = await trySave()
  return result
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
