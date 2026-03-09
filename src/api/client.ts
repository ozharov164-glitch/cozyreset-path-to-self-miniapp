import { useAuthStore } from '../store/authStore'

let backendUrlOverride: string | null = null

const BACKEND_STORAGE_KEY = 'pts_backend_url'
const BACKEND_LOCALSTORAGE_KEY = 'pts_last_backend'
const AUTH_TOKEN_SESSION_KEY = 'pts_app_save_token'
const DEBUG = false

function setBackendStored(url: string): void {
  try {
    sessionStorage.setItem(BACKEND_STORAGE_KEY, url)
    localStorage.setItem(BACKEND_LOCALSTORAGE_KEY, url)
  } catch {
    /* ignore */
  }
}

/** Временные туннели (Cloudflare и т.п.) — игнорируем, используем постоянный backend из config.json */
function isUnreliableBackend(url: string): boolean {
  const u = url.toLowerCase()
  return u.includes('trycloudflare.com') || u.includes('ngrok') || u.includes('localtunnel')
}

/** Загрузить backend URL: из ссылки (бот ?backend=...), затем config.json. trycloudflare не используем. */
export async function loadBackendConfig(): Promise<void> {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('backend')?.trim()
  if (DEBUG) {
    console.log('[PTS] loadBackendConfig: location.search=', window.location.search)
    console.log('[PTS] loadBackendConfig: backend from query=', fromQuery || '(empty)')
  }
  // 1) Из ссылки при открытии из бота — только если не временный туннель
  if (fromQuery && (fromQuery.startsWith('http://') || fromQuery.startsWith('https://')) && !isUnreliableBackend(fromQuery)) {
    backendUrlOverride = fromQuery.replace(/\/$/, '')
    setBackendStored(backendUrlOverride)
    return
  }
  // 2) sessionStorage — игнорируем trycloudflare
  try {
    const stored = sessionStorage.getItem(BACKEND_STORAGE_KEY)
    if (stored && (stored.startsWith('http://') || stored.startsWith('https://')) && !isUnreliableBackend(stored)) {
      backendUrlOverride = stored.replace(/\/$/, '')
      return
    }
  } catch {
    /* ignore */
  }
  // 3) localStorage — игнорируем trycloudflare
  try {
    const local = localStorage.getItem(BACKEND_LOCALSTORAGE_KEY)
    if (local && (local.startsWith('http://') || local.startsWith('https://')) && !isUnreliableBackend(local)) {
      backendUrlOverride = local.replace(/\/$/, '')
      return
    }
  } catch {
    /* ignore */
  }
  // 4) config.json (постоянный HTTPS, например 217-114-11-97.sslip.io)
  try {
    const base = (import.meta.env.VITE_BASE_PATH as string) || '/'
    const path = base.endsWith('/') ? `${base}config.json` : `${base}/config.json`
    const url = `${window.location.origin}${path}`
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return
    const j = (await r.json()) as { backendUrl?: string }
    const u = j?.backendUrl && typeof j.backendUrl === 'string' ? j.backendUrl.replace(/\/$/, '') : null
    if (u && (u.startsWith('http://') || u.startsWith('https://'))) {
      backendUrlOverride = u
      setBackendStored(u)
    }
  } catch {
    /* ignore */
  }
  if (DEBUG) console.log('[PTS] loadBackendConfig: final backendUrlOverride=', backendUrlOverride)
}

export function getBackendUrl(): string {
  if (backendUrlOverride) return backendUrlOverride
  const fromEnv = import.meta.env.VITE_BOT_BACKEND_URL
  if (fromEnv && typeof fromEnv === 'string') return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

/** Для диагностики «Нет связи»: данные для debug UI. */
export function getConnectionDiag(): { search: string; backend: string; initDataLength: number } {
  if (typeof window === 'undefined') return { search: '', backend: '', initDataLength: 0 }
  return {
    search: window.location.search || '(empty)',
    backend: getBackendUrl() || '(empty)',
    initDataLength: getInitDataString()?.length ?? 0,
  }
}

const INIT_RETRY_DELAYS = [0, 100, 300, 1000, 2500] // 5 попыток, exponential backoff

/** Одноразовый токен из ссылки (бот подставляет в URL) — связь без initData */
function getStartTokenFromUrl(): string {
  if (typeof window === 'undefined') return ''
  const search = new URLSearchParams(window.location.search)
  const fromSearch = search.get('start_token')?.trim() || search.get('startToken')?.trim()
  if (fromSearch) return fromSearch
  const hash = window.location.hash.slice(1)
  if (!hash) return ''
  const params = new URLSearchParams(hash)
  return params.get('start_token')?.trim() || params.get('startToken')?.trim() || ''
}

function getStoredToken(): string | null {
  const fromStore = useAuthStore.getState().appSaveToken
  if (fromStore) return fromStore
  try {
    const fromSession = sessionStorage.getItem(AUTH_TOKEN_SESSION_KEY)
    if (fromSession) {
      useAuthStore.getState().setToken(fromSession)
      return fromSession
    }
  } catch {
    /* ignore */
  }
  return null
}

function setTokenPersist(token: string | null): void {
  useAuthStore.getState().setToken(token)
  try {
    if (token) sessionStorage.setItem(AUTH_TOKEN_SESSION_KEY, token)
    else sessionStorage.removeItem(AUTH_TOKEN_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

// Приоритет: токен в store/session → hash → start_token из URL → initData
export async function ensureAuth(): Promise<string | null> {
  const token = getStoredToken()
  if (token) return token

  const fromHash = getTokenFromHash()
  if (fromHash) {
    setTokenPersist(fromHash)
    useAuthStore.getState().setInitialized(true)
    return fromHash
  }

  const backend = getBackendUrl()
  if (!backend) {
    useAuthStore.getState().setInitialized(true)
    return null
  }

  const startToken = getStartTokenFromUrl()
  if (startToken) {
    try {
      if (DEBUG) console.log('[PTS] ensureAuth: по start_token')
      const res = await fetch(`${backend}/mini-app/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_token: startToken }),
      })
      if (res.ok) {
        const data = await res.json()
        const newToken = (data as { app_save_token?: string }).app_save_token?.trim()
        if (newToken) {
          setTokenPersist(newToken)
          useAuthStore.getState().setInitialized(true)
          return newToken
        }
      }
    } catch (e) {
      if (DEBUG) console.warn('[PTS] ensureAuth: start_token error', e)
    }
  }

  const initData = getInitDataString()
  if (DEBUG) console.log('[PTS] ensureAuth: initData length=', initData?.length ?? 0)
  if (!initData) {
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
        setTokenPersist(newToken)
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

// Кэш initData на случай, если Telegram подставляет его асинхронно после ready()
let cachedInitData: string | null = null

function readInitDataSync(): string {
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

/** Вызвать при старте и после Telegram.WebApp.ready() — обновляет кэш, если Telegram подставил initData позже */
export function refreshInitData(): void {
  if (typeof window === 'undefined') return
  const raw = readInitDataSync()
  if (raw) cachedInitData = raw
}

// initData: кэш (после ready) → Telegram.WebApp.initData → hash/search tgWebAppData
export function getInitDataString(): string {
  if (typeof window === 'undefined') return ''
  if (cachedInitData) return cachedInitData
  const raw = readInitDataSync()
  if (raw) cachedInitData = raw
  return raw
}

async function fetchWithAuth(
  path: string,
  options: RequestInit & { skipRetry?: boolean } = {}
): Promise<Response> {
  const backend = getBackendUrl()
  if (!backend) return new Response(null, { status: 502 })

  let token = getStoredToken()
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
          setTokenPersist(newToken)
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
    setTokenPersist(null)
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
  let token = getStoredToken()
  if (!token) token = await ensureAuth()
  if (token) body.token = token
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
  if (('id' in result && result.id) || ('error' in result && result.error !== 'network')) return result
  setTokenPersist(null)
  await new Promise((r) => setTimeout(r, 400))
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

/** Темы для проработки с ИИ в боте. Без аргументов — по последнему результату пользователя. */
export async function apiAiSuggestions(testTitle?: string, avg?: number): Promise<{ suggestions: string[] }> {
  const body: Record<string, unknown> = {}
  if (testTitle != null && avg != null) {
    body.test_title = testTitle
    body.avg = avg
  }
  const res = await fetchWithAuth('/mini-app/ai-suggestions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) return { suggestions: [] }
  const data = await res.json().catch(() => ({})) as { suggestions?: string[] }
  return { suggestions: Array.isArray(data.suggestions) ? data.suggestions : [] }
}
