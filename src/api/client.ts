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

/** Сырые MP3 образцов TTS в памяти — подгружаются параллельно при старте и при открытии «Голос». */
const ttsVoicePreviewBytes = new Map<string, ArrayBuffer>()

export function getTtsVoicePreviewBytesCached(engine: string): ArrayBuffer | undefined {
  return ttsVoicePreviewBytes.get(engine)
}

export function rememberTtsVoicePreviewBytes(engine: string, bytes: ArrayBuffer): void {
  ttsVoicePreviewBytes.set(engine, bytes)
}

/** Загрузить оба образца сразу (после loadBackendConfig), чтобы по нажатию не ждать сеть. */
export async function prefetchTtsVoicePreviews(): Promise<void> {
  const backend = getBackendUrl()
  if (!backend || typeof window === 'undefined') return
  const engines = ['yandex', 'edge'] as const
  await Promise.all(
    engines.map(async (engine) => {
      if (ttsVoicePreviewBytes.has(engine)) return
      try {
        const res = await fetch(`${backend}/mini-app/voice-tts-preview/${engine}`, {
          cache: 'force-cache',
        })
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        ttsVoicePreviewBytes.set(engine, buf)
      } catch {
        /* ignore */
      }
    }),
  )
}

/** Сегменты предпрослушивания фонов (calm1–3) — чтобы по нажатию сразу играть, без ожидания fetch. */
const bgVoicePreviewBytes = new Map<string, ArrayBuffer>()

export function getBgVoicePreviewBytesCached(key: string): ArrayBuffer | undefined {
  return bgVoicePreviewBytes.get(key)
}

export function rememberBgVoicePreviewBytes(key: string, bytes: ArrayBuffer): void {
  bgVoicePreviewBytes.set(key, bytes)
}

export async function prefetchBgVoicePreviews(): Promise<void> {
  const backend = getBackendUrl()
  if (!backend || typeof window === 'undefined') return
  const keys = ['calm1', 'calm2', 'calm3'] as const
  await Promise.all(
    keys.map(async (key) => {
      if (bgVoicePreviewBytes.has(key)) return
      try {
        const res = await fetch(`${backend}/mini-app/voice-background/${key}`, {
          cache: 'force-cache',
        })
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        bgVoicePreviewBytes.set(key, buf)
      } catch {
        /* ignore */
      }
    }),
  )
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

/**
 * Уже есть app_save_token, но ensureAuth раньше выходил без /mini-app/init — isPremium оставался null
 * (persist не хранил премиум / холодный старт). Подтягиваем флаг премиума тем же init, что и у WebApp.
 */
async function syncMiniAppPremiumFromInitIfPossible(): Promise<void> {
  const backend = getBackendUrl()
  const initData = getInitDataString()
  if (!backend || !initData) return
  try {
    const res = await fetch(`${backend}/mini-app/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    if (!res.ok) return
    const data = (await res.json()) as { isPremium?: boolean; app_save_token?: string }
    if (typeof data.isPremium === 'boolean') {
      useAuthStore.getState().setPremium(data.isPremium)
    }
    const newer = data.app_save_token?.trim()
    if (newer) setTokenPersist(newer)
  } catch {
    /* ignore */
  }
}

// Приоритет: токен в store/session → hash → start_token из URL → initData
export async function ensureAuth(): Promise<string | null> {
  const token = getStoredToken()
  if (token) {
    useAuthStore.getState().setInitialized(true)
    if (useAuthStore.getState().isPremium === null) {
      await syncMiniAppPremiumFromInitIfPossible()
    }
    return token
  }

  const fromHash = getTokenFromHash()
  if (fromHash) {
    setTokenPersist(fromHash)
    useAuthStore.getState().setInitialized(true)
    if (useAuthStore.getState().isPremium === null) {
      await syncMiniAppPremiumFromInitIfPossible()
    }
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
        const data = (await res.json()) as { app_save_token?: string; isPremium?: boolean }
        const newToken = data.app_save_token?.trim()
        if (newToken) {
          setTokenPersist(newToken)
          useAuthStore.getState().setInitialized(true)
        }
        if (typeof data.isPremium === 'boolean') {
          useAuthStore.getState().setPremium(data.isPremium)
        }
        if (newToken) return newToken
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
      const data = (await res.json()) as { app_save_token?: string; isPremium?: boolean }
      const newToken = data.app_save_token?.trim()
      if (typeof data.isPremium === 'boolean') {
        useAuthStore.getState().setPremium(data.isPremium)
      }
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
        const data = (await res.json()) as { app_save_token?: string; isPremium?: boolean }
        const newToken = data.app_save_token?.trim()
        if (typeof data.isPremium === 'boolean') {
          useAuthStore.getState().setPremium(data.isPremium)
        }
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

/** Если в сессии уже есть token, но isPremium ещё не подтянут — один запрос /mini-app/init по initData. */
export async function syncPremiumFromInit(): Promise<void> {
  const backend = getBackendUrl()
  const initData = getInitDataString()
  if (!backend || !initData) return
  try {
    const res = await fetch(`${backend}/mini-app/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
    if (!res.ok) return
    const data = (await res.json()) as { isPremium?: boolean; app_save_token?: string }
    if (typeof data.isPremium === 'boolean') {
      useAuthStore.getState().setPremium(data.isPremium)
    }
    const t = data.app_save_token?.trim()
    if (t) setTokenPersist(t)
  } catch {
    /* ignore */
  }
}

export type StatsPeriod = 'week' | 'month' | 'all'

export interface MiniAppStatisticsBundle {
  kpi: {
    days_with_bot: number
    total_checkins: number
    total_tests: number
    total_rituals: number
    total_ai_messages: number
  }
  mood_over_time: Array<{ date: string; morning_mood: number | null; evening_mood: number | null }>
  daily_activity: Array<{ date: string; checkins: number; tests: number; rituals: number; ai_messages: number }>
  test_popularity: Array<{ test_name: string; count: number }>
  ai_activity_over_time: Array<{
    date: string
    messages: number
    user_messages: number
    assistant_messages: number
  }>
  period: string
}

export type ApiStatisticsResult =
  | { status: 'ok'; stats: MiniAppStatisticsBundle }
  | { error: string; premium_required?: boolean; status: number }

export async function apiStatistics(period: StatsPeriod): Promise<ApiStatisticsResult> {
  const res = await fetchWithAuth('/mini-app/statistics', {
    method: 'POST',
    body: JSON.stringify({ period }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403) {
    return { error: 'premium', premium_required: true, status: 403 }
  }
  if (!res.ok) {
    return {
      error: typeof data.error === 'string' ? data.error : 'Ошибка загрузки',
      status: res.status,
    }
  }
  if (data.status === 'ok' && data.stats && typeof data.stats === 'object') {
    return { status: 'ok', stats: data.stats as MiniAppStatisticsBundle }
  }
  return { error: 'Некорректный ответ', status: res.status }
}

export type NeuroArenaLimits = {
  dotprobeRemaining: number
  scenariosRemaining: number
  memoryMatrixRemaining: number
  freePerDayDotprobe: number
  freePerDayScenarios: number
  freePerDayMemoryMatrix: number
}

export type NeuroArenaProgressApi = {
  dotprobeBest: number
  dotprobeSessions: number
  scenariosBest: number
  scenariosSessions: number
  memoryMatrixBest: number
  memoryMatrixSessions: number
  streakDays: number
  lastPlayedDate: string | null
  totalMinutes: number
}

export type NeuroArenaSessionRow = {
  game_type: string
  score: number
  accuracy: number | null
  avg_reaction_ms: number | null
  stimuli_count: number
  completed_at: string
}

export async function apiNeuroArenaStatus(): Promise<
  | {
      status: 'ok'
      premium: boolean
      limits: NeuroArenaLimits
      progress: NeuroArenaProgressApi
      recentSessions: NeuroArenaSessionRow[]
    }
  | { error: string }
> {
  try {
    const res = await fetchWithAuth('/mini-app/neuro-arena/status', { method: 'POST', body: '{}' })
    if (res.status === 404) {
      return {
        error:
          'Сервер ещё не обновлён: эндпоинт Нейро-Арены недоступен. Открой приложение позже или напиши в поддержку.',
      }
    }
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      return { error: typeof data.error === 'string' ? data.error : 'Ошибка загрузки' }
    }
    if (data.status === 'ok' && data.limits && data.progress) {
      const lim = data.limits as Record<string, unknown>
      const pr = data.progress as Record<string, unknown>
      return {
        status: 'ok',
        premium: !!data.premium,
        limits: {
          dotprobeRemaining: Number(lim.dotprobeRemaining ?? 0),
          scenariosRemaining: Number(lim.scenariosRemaining ?? 0),
          memoryMatrixRemaining: Number(lim.memoryMatrixRemaining ?? 999),
          freePerDayDotprobe: Number(lim.freePerDayDotprobe ?? 1),
          freePerDayScenarios: Number(lim.freePerDayScenarios ?? 1),
          freePerDayMemoryMatrix: Number(lim.freePerDayMemoryMatrix ?? 1),
        },
        progress: {
          dotprobeBest: Number(pr.dotprobeBest ?? 0),
          dotprobeSessions: Number(pr.dotprobeSessions ?? 0),
          scenariosBest: Number(pr.scenariosBest ?? 0),
          scenariosSessions: Number(pr.scenariosSessions ?? 0),
          memoryMatrixBest: Number(pr.memoryMatrixBest ?? 0),
          memoryMatrixSessions: Number(pr.memoryMatrixSessions ?? 0),
          streakDays: Number(pr.streakDays ?? 0),
          lastPlayedDate: typeof pr.lastPlayedDate === 'string' ? pr.lastPlayedDate : null,
          totalMinutes: Number(pr.totalMinutes ?? 0),
        },
        recentSessions: Array.isArray(data.recentSessions) ? (data.recentSessions as NeuroArenaSessionRow[]) : [],
      }
    }
    return { error: 'Некорректный ответ сервера' }
  } catch {
    return { error: 'Нет соединения с сервером. Проверьте сеть и попробуйте снова.' }
  }
}

export async function apiNeuroArenaSessionEnd(payload: {
  gameType: 'dotprobe' | 'scenarios' | 'memory_matrix'
  score: number
  accuracy?: number | null
  avgReactionMs?: number | null
  stimuliCount: number
  playtimeSec?: number
  moodNote?: string
}): Promise<{ ok: true } | { error: string; premium_required?: boolean; limit?: boolean }> {
  const res = await fetchWithAuth('/mini-app/neuro-arena/session-end', {
    method: 'POST',
    body: JSON.stringify({
      gameType: payload.gameType,
      score: payload.score,
      accuracy: payload.accuracy ?? null,
      avgReactionMs: payload.avgReactionMs ?? null,
      stimuliCount: payload.stimuliCount,
      playtimeSec: payload.playtimeSec ?? 0,
      moodNote: payload.moodNote ?? '',
    }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403 && data.premium_required) {
    return { error: typeof data.message === 'string' ? data.message : 'Лимит', premium_required: true, limit: true }
  }
  if (!res.ok) {
    return { error: typeof data.error === 'string' ? data.error : 'Ошибка сохранения' }
  }
  if (data.status === 'ok') return { ok: true }
  return { error: 'Некорректный ответ' }
}

export type PathCoachAction = { type: string; label: string; testId?: string }

/** Совпадает с алиасами на бэкенде (llm_service): иначе кнопка не переключит экран. */
function canonicalPathCoachActionType(raw: string): string {
  const t = raw.trim()
  const aliases: Record<string, string> = {
    openNeuroArena: 'open_neuro_arena',
    open_neuroArena: 'open_neuro_arena',
    'open_neuro-arena': 'open_neuro_arena',
    openNeuro_arena: 'open_neuro_arena',
    neuro_arena: 'open_neuro_arena',
    open_neuroarena: 'open_neuro_arena',
  }
  return aliases[t] ?? t
}

export type PathCoachChatMessage = {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export async function apiPathCoachHistory(): Promise<
  { status: 'ok'; messages: PathCoachChatMessage[] } | { error: string; premium_required?: boolean; status?: number }
> {
  const res = await fetchWithAuth('/mini-app/path-coach', {
    method: 'POST',
    body: JSON.stringify({ historyOnly: true }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403) {
    return { error: 'premium', premium_required: true, status: 403 }
  }
  if (!res.ok) {
    return {
      error: typeof data.error === 'string' ? data.error : 'Ошибка загрузки',
      status: res.status,
    }
  }
  if (data.status === 'ok' && Array.isArray(data.messages)) {
    const messages = (data.messages as Record<string, unknown>[])
      .map((m) => {
        const rawId = m.id
        let id: number | undefined
        if (typeof rawId === 'number' && Number.isFinite(rawId)) id = rawId
        else if (typeof rawId === 'string' && /^\d+$/.test(rawId)) id = parseInt(rawId, 10)
        const content = typeof m.content === 'string' ? m.content : ''
        const created_at = typeof m.created_at === 'string' ? m.created_at : undefined
        return {
          ...(id !== undefined ? { id } : {}),
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content,
          ...(created_at ? { created_at } : {}),
        } as PathCoachChatMessage
      })
      .filter((m) => m.content.trim())
    return { status: 'ok', messages }
  }
  return { error: 'Некорректный ответ', status: res.status }
}

function telegramFirstNameForCoach(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const n = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name
  return typeof n === 'string' && n.trim() ? n.trim().slice(0, 64) : undefined
}

export async function apiPathCoachSend(
  message: string,
): Promise<
  | { status: 'ok'; reply: string; actions: PathCoachAction[]; voiceSupportSuggestion?: string }
  | { error: string; code?: string; premium_required?: boolean; status?: number }
> {
  const firstName = telegramFirstNameForCoach()
  const res = await fetchWithAuth('/mini-app/path-coach', {
    method: 'POST',
    body: JSON.stringify({
      message: message.trim(),
      ...(firstName ? { firstName } : {}),
    }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403) {
    return { error: 'premium', premium_required: true, status: 403 }
  }
  if (res.status === 429) {
    return { error: typeof data.error === 'string' ? data.error : 'Слишком много запросов', status: 429 }
  }
  if (res.status === 503) {
    return {
      error: typeof data.error === 'string' ? data.error : 'Сервис временно недоступен',
      code: typeof data.code === 'string' ? data.code : undefined,
      status: 503,
    }
  }
  if (!res.ok) {
    return {
      error: typeof data.error === 'string' ? data.error : 'Ошибка ИИ',
      status: res.status,
    }
  }
  if (data.status === 'ok' && typeof data.reply === 'string') {
    const raw = Array.isArray(data.actions) ? data.actions : []
    const actions: PathCoachAction[] = raw
      .map((a) => {
        const o = a as Record<string, unknown>
        const type = typeof o.type === 'string' ? canonicalPathCoachActionType(o.type) : ''
        const label = typeof o.label === 'string' ? o.label : ''
        const testId = typeof o.testId === 'string' ? o.testId : undefined
        return { type, label, testId }
      })
      .filter((a) => a.type && a.label)
    const vs =
      typeof data.voiceSupportSuggestion === 'string' && data.voiceSupportSuggestion.trim()
        ? data.voiceSupportSuggestion.trim()
        : undefined
    return { status: 'ok', reply: data.reply, actions, ...(vs ? { voiceSupportSuggestion: vs } : {}) }
  }
  return { error: 'Некорректный ответ', status: res.status }
}

/** Ingest после теста на сервере вызывает LLM — даём запас по времени. */
const PATH_COACH_INGEST_TIMEOUT_MS = 120_000

export async function apiPathCoachIngestTestResult(payload: {
  testTitle: string
  avgRounded: number
  narrative: string
  /** id строки test_results — кэш разбора Венеры и дедупликация без лишних вызовов LLM */
  resultId?: string | null
}): Promise<{ status: 'ok'; ingested: boolean } | { error: string; status?: number }> {
  const firstName = telegramFirstNameForCoach()
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), PATH_COACH_INGEST_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetchWithAuth('/mini-app/path-coach', {
      method: 'POST',
      signal: controller.signal,
      body: JSON.stringify({
        ingestTestResult: true,
        testTitle: payload.testTitle.trim().slice(0, 200),
        avgRounded: payload.avgRounded,
        narrative: payload.narrative.trim().slice(0, 2400),
        ...(payload.resultId ? { resultId: String(payload.resultId).trim() } : {}),
        ...(firstName ? { firstName } : {}),
      }),
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { error: 'Запись в чат заняла слишком много времени. Зайди к Венере из результата ещё раз или напиши в чате.', status: 408 }
    }
    throw e
  } finally {
    window.clearTimeout(timeoutId)
  }
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 429) {
    return { error: typeof data.error === 'string' ? data.error : 'Слишком много запросов', status: 429 }
  }
  if (!res.ok) {
    return { error: typeof data.error === 'string' ? data.error : 'Ошибка записи в чат', status: res.status }
  }
  if (data.status === 'ok' && data.ingested === true) {
    return { status: 'ok', ingested: true }
  }
  return { error: 'Некорректный ответ', status: res.status }
}

/** Подставить в чат Венеры сохранённый разбор по тесту или сессии «Ритм сердца» (без OpenRouter). */
export async function apiPathCoachAttachCached(payload: {
  kind: 'test' | 'heart'
  id: string
}): Promise<
  | { status: 'ok'; attached: boolean; reason?: string }
  | { error: string; status?: number }
> {
  const res = await fetchWithAuth('/mini-app/path-coach', {
    method: 'POST',
    body: JSON.stringify({
      attachCachedKind: payload.kind,
      attachCachedId: payload.id.trim(),
    }),
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 403) {
    return { error: 'premium', status: 403 }
  }
  if (!res.ok) {
    return {
      error: typeof data.error === 'string' ? data.error : 'Ошибка',
      status: res.status,
    }
  }
  if (data.status === 'ok') {
    return {
      status: 'ok',
      attached: data.attached === true,
      ...(typeof data.reason === 'string' ? { reason: data.reason } : {}),
    }
  }
  return { error: 'Некорректный ответ', status: res.status }
}

export async function apiPathCoachReset(): Promise<{ ok: boolean; cleared: number } | { error: string }> {
  const res = await fetchWithAuth('/mini-app/path-coach', {
    method: 'POST',
    body: JSON.stringify({ reset: true }),
  })
  const data = await res.json().catch(() => ({})) as { status?: string; cleared?: number; error?: string }
  if (!res.ok) return { error: data.error || 'Ошибка' }
  if (data.status === 'ok') return { ok: true, cleared: data.cleared ?? 0 }
  return { error: data.error || 'Ошибка' }
}

export async function apiClearTestHistory(): Promise<{ ok: boolean; deleted: number } | { error: string }> {
  const res = await fetchWithAuth('/mini-app/clear-test-history', { method: 'POST', body: '{}' })
  const data = await res.json().catch(() => ({})) as { ok?: boolean; deleted?: number; error?: string }
  if (!res.ok) return { error: data.error || 'Ошибка удаления' }
  return { ok: !!data.ok, deleted: data.deleted ?? 0 }
}

export async function apiClearHeartRhythmHistory(): Promise<{ ok: boolean; deleted: number } | { error: string }> {
  const res = await fetchWithAuth('/mini-app/clear-heart-rhythm-history', { method: 'POST', body: '{}' })
  const data = await res.json().catch(() => ({})) as { ok?: boolean; deleted?: number; error?: string }
  if (!res.ok) return { error: data.error || 'Ошибка удаления' }
  return { ok: !!data.ok, deleted: data.deleted ?? 0 }
}

export async function apiTestResult(id: string): Promise<{
  id: string
  testId: string
  testTitle: string
  answers: number[]
  dimensions?: Record<string, number>
  completedAt: string
  venusAnalysis?: string | null
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
  return data as {
    id: string
    testId: string
    testTitle: string
    answers: number[]
    dimensions?: Record<string, number>
    completedAt: string
    venusAnalysis?: string | null
  }
}

export type AiMovie = {
  id: string
  title: string
  director: string
  year: number
  actors: string[]
  plot: string
  whyWatch: string
}

/** Темы для проработки с ИИ в боте. Без аргументов — по последнему результату пользователя. resultId — id прохождения теста для кэша на бэкенде. */
export async function apiAiSuggestions(
  testTitle?: string,
  avg?: number,
  resultId?: string | number | null,
): Promise<{ suggestions: string[]; movies: AiMovie[] }> {
  let token = useAuthStore.getState().appSaveToken
  if (!token) {
    token = await ensureAuth()
  }
  if (!token) {
    return { suggestions: [], movies: [] }
  }
  const body: Record<string, unknown> = {}
  if (testTitle != null && avg != null) {
    body.test_title = testTitle
    body.avg = avg
  }
  if (resultId != null && String(resultId).trim() !== '') {
    body.result_id = resultId
  }
  const res = await fetchWithAuth('/mini-app/ai-suggestions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) return { suggestions: [], movies: [] }
  const data = await res.json().catch(() => ({})) as { suggestions?: string[]; movies?: AiMovie[] }
  return {
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    movies: Array.isArray(data.movies) ? data.movies : [],
  }
}

/** LLM + PDF + nginx до первого байта — запас против 504 при медленной модели */
const SPECIALIST_BRIEF_GENERATE_TIMEOUT_MS = 240000

export type SpecialistBriefGenerateResult =
  | { downloadUrl: string; fileName: string; aiGenerated: boolean; previewPdfBase64?: string }
  | { error: string; status?: number; premium_required?: boolean }

/** Анкета «К специалисту» → PDF (премиум; ИИ — DeepSeek через бэкенд при наличии ключа). */
export async function apiSpecialistBriefGenerate(
  answers: { id: string; answer: string }[],
): Promise<SpecialistBriefGenerateResult> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), SPECIALIST_BRIEF_GENERATE_TIMEOUT_MS)
  try {
    const res = await fetchWithAuth('/mini-app/specialist-brief-generate', {
      method: 'POST',
      body: JSON.stringify({ answers }),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.status === 403) {
      return {
        error: typeof data.error === 'string' ? data.error : 'Доступно с Премиум',
        status: 403,
        premium_required: !!data.premium_required,
      }
    }
    if (!res.ok) {
      const msg =
        typeof data.error === 'string'
          ? data.error
          : res.status === 401
            ? 'Открой приложение из бота — нужна авторизация'
            : res.status === 429
              ? 'Слишком много запросов. Попробуй позже.'
              : 'Не удалось сформировать PDF'
      return { error: msg, status: res.status }
    }
    const downloadUrl = typeof data.downloadUrl === 'string' ? data.downloadUrl.trim() : ''
    const fileName = typeof data.fileName === 'string' ? data.fileName.trim() : 'k-specialistu-cozyreset.pdf'
    if (!downloadUrl) {
      return { error: 'Пустой ответ сервера', status: res.status }
    }
    const previewPdfBase64 =
      typeof data.previewPdfBase64 === 'string' && data.previewPdfBase64.length > 100
        ? data.previewPdfBase64
        : undefined
    return {
      downloadUrl,
      fileName,
      aiGenerated: !!data.aiGenerated,
      ...(previewPdfBase64 ? { previewPdfBase64 } : {}),
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return {
        error:
          'Сервер долго формировал PDF (иногда до 2–3 минут). Подожди и попробуй ещё раз — таймаут увеличен.',
        status: 0,
      }
    }
    return { error: 'Нет связи с сервером', status: 0 }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

const THERAPY_MAP_GENERATE_TIMEOUT_MS = 240000

export type TherapyMapGenerateResult =
  | {
      downloadUrl: string
      fileName: string
      aiGenerated: boolean
      exportMode?: string
      previewPdfBase64?: string
    }
  | { error: string; status?: number; premium_required?: boolean }

/** «Карта терапии» → PDF (премиум; DeepSeek через бэкенд). */
export async function apiTherapyMapGenerate(payload: {
  answers: { id: string; answer: string }[]
  exportMode: 'full' | 'short'
  shortSectionIds?: string[]
}): Promise<TherapyMapGenerateResult> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), THERAPY_MAP_GENERATE_TIMEOUT_MS)
  try {
    const body: Record<string, unknown> = {
      answers: payload.answers,
      exportMode: payload.exportMode,
    }
    if (payload.exportMode === 'short' && payload.shortSectionIds?.length) {
      body.shortSectionIds = payload.shortSectionIds
    }
    const res = await fetchWithAuth('/mini-app/therapy-map-generate', {
      method: 'POST',
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (res.status === 403) {
      return {
        error: typeof data.error === 'string' ? data.error : 'Доступно с Премиум',
        status: 403,
        premium_required: !!data.premium_required,
      }
    }
    if (!res.ok) {
      const msg =
        typeof data.error === 'string'
          ? data.error
          : res.status === 401
            ? 'Открой приложение из бота — нужна авторизация'
            : res.status === 429
              ? 'Слишком много запросов. Попробуй позже.'
              : 'Не удалось сформировать PDF'
      return { error: msg, status: res.status }
    }
    const downloadUrl = typeof data.downloadUrl === 'string' ? data.downloadUrl.trim() : ''
    const fileName = typeof data.fileName === 'string' ? data.fileName.trim() : 'karta-terapii-cozyreset.pdf'
    if (!downloadUrl) {
      return { error: 'Пустой ответ сервера', status: res.status }
    }
    const previewB64 =
      typeof data.previewPdfBase64 === 'string' && data.previewPdfBase64.length > 100
        ? data.previewPdfBase64
        : undefined
    return {
      downloadUrl,
      fileName,
      aiGenerated: !!data.aiGenerated,
      exportMode: typeof data.exportMode === 'string' ? data.exportMode : undefined,
      ...(previewB64 ? { previewPdfBase64: previewB64 } : {}),
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return {
        error:
          'Сервер долго формировал PDF (иногда до 2–3 минут). Подожди и попробуй ещё раз — таймаут увеличен.',
        status: 0,
      }
    }
    return { error: 'Нет связи с сервером', status: 0 }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/** Таймаут запроса голосового ответа (LLM + TTS может занять до 1–2 минут). */
const VOICE_REPLY_TIMEOUT_MS = 120000

/** Голосовой ответ ИИ: пользователь отправляет текст, получает MP3. downloadUrl — временная ссылка для скачивания во внешнем браузере. */
export async function apiVoiceReply(
  text: string,
  musicKey?: string,
  ttsEngine?: 'yandex' | 'edge',
): Promise<{ blob: Blob; downloadUrl?: string | null } | { error: string; status?: number }> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), VOICE_REPLY_TIMEOUT_MS)
  try {
    const body: Record<string, unknown> = { text: text.trim(), musicKey: musicKey || undefined }
    if (ttsEngine === 'yandex' || ttsEngine === 'edge') body.ttsEngine = ttsEngine
    const res = await fetchWithAuth('/mini-app/voice-reply', {
      method: 'POST',
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const ct = res.headers.get('content-type') || ''
      const errorMsg =
        ct.includes('application/json')
          ? ((await res.json().catch(() => ({})) as { error?: string }).error) || res.statusText
          : res.statusText
      const message =
        res.status === 401
          ? 'Открой приложение заново из чата с ботом — нужна авторизация'
          : res.status === 429
            ? 'Слишком много запросов. Подожди минуту и попробуй снова.'
            : errorMsg || 'Ошибка запроса'
      return { error: message, status: res.status }
    }
    const blob = await res.blob()
    const downloadUrl = res.headers.get('X-Voice-Download-URL')?.trim() || null
    return { blob, downloadUrl }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { error: 'Превышено время ожидания. Попробуй ещё раз или сократи текст.', status: 0 }
    }
    return { error: 'Нет связи с сервером. Проверь интернет и попробуй снова.', status: 0 }
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/** Приветствие раздела «Самореализация»: MP3 из одного ответа (без доп. подзагрузки). */
export async function apiSelfRealizationWelcome(): Promise<
  { firstVisit: boolean; welcomeText: string } | { error: string; status?: number }
> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-welcome', {
      method: 'POST',
      body: '{}',
    })
    const data = (await res.json().catch(() => ({}))) as { firstVisit?: boolean; welcomeText?: string; error?: string }
    if (!res.ok) {
      return {
        error: data.error || (res.status === 401 ? 'Нужна авторизация' : 'Ошибка приветствия'),
        status: res.status,
      }
    }
    return {
      firstVisit: !!data.firstVisit,
      welcomeText: typeof data.welcomeText === 'string' ? data.welcomeText : '',
    }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

/** Блоки коучинга с бэкенда (camelCase) — для карточек в UI */
export type SelfRealizationCoachingBlocks = {
  checkInPrevious?: string
  empathy?: string
  pattern?: string
  stepsToday?: string
  microExperiment?: string
  question?: string
  progressBridge?: string
  toneClose?: string
}

/** Курируемый день: методичка + персонализация (без свободного чата). */
export type SelfRealizationCuratedDay = {
  kind: 'sr_curated_day'
  displayStep?: number
  stepTitle?: string
  personalizedOpening?: string
  theory?: string
  chosenKey?: string
  assignment?: string
  planB?: string
  doneCriterion?: string
  reflection?: string
  safety?: string
}

/** Состояние курируемого трека (8 этапов, один «выполнено» в день). */
export type SelfRealizationTrackSync = {
  directionKey: string
  displayStep: number
  totalSteps: number
  awaitingNextDay: boolean
  nextUnlockDate: string
  canCompleteStep: boolean
  completedAll: boolean
  hasDayPackage: boolean
  dayPackage: SelfRealizationCuratedDay | null
}

export async function apiSelfRealizationTrackSync(payload: {
  direction: string
  directionKey: string
}): Promise<SelfRealizationTrackSync | { error: string; status?: number }> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-track-sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as SelfRealizationTrackSync & { error?: string }
    if (!res.ok) {
      return { error: data.error || 'Ошибка синхронизации трека', status: res.status }
    }
    if (typeof data.displayStep !== 'number' || typeof data.totalSteps !== 'number') {
      return { error: 'Некорректный ответ трека', status: 500 }
    }
    const sync = data as SelfRealizationTrackSync
    if (typeof sync.hasDayPackage !== 'boolean') {
      sync.hasDayPackage = !!sync.dayPackage
    }
    return sync
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

export async function apiSelfRealizationCompleteStep(payload: {
  direction: string
  directionKey: string
  report: string
}): Promise<
  { ok: true; reply: string; track: SelfRealizationTrackSync } | { error: string; status?: number }
> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-complete-step', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      reply?: string
      track?: SelfRealizationTrackSync
      error?: string
    }
    if (!res.ok || !data.ok || !data.reply || !data.track) {
      return { error: data.error || 'Не удалось зафиксировать этап', status: res.status }
    }
    return { ok: true, reply: data.reply, track: data.track }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

/**
 * Переход к следующему этапу:
 * - пользователь даёт обратную связь по прошлому этапу
 * - ИИ анализирует результативность прошлого этапа
 * - ИИ выдаёт новое задание дня (curated day blocks) для текущего displayStep
 */
export async function apiSelfRealizationAdvanceToNextStage(payload: {
  direction: string
  directionKey: string
  feedback?: string
  difficulties?: string[]
}): Promise<
  | {
      ok: true
      analysisReply: string
      reply: string
      day: SelfRealizationCuratedDay | null
      track: SelfRealizationTrackSync
    }
  | { error: string; status?: number }
> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-advance-stage', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      analysisReply?: string
      reply?: string
      day?: SelfRealizationCuratedDay | null
      track?: SelfRealizationTrackSync
      error?: string
    }
    if (!res.ok || !data.ok || !data.analysisReply || !data.reply || !data.track) {
      return { error: data.error || 'Ошибка перехода к следующему этапу', status: res.status }
    }
    return {
      ok: true,
      analysisReply: data.analysisReply,
      reply: data.reply,
      day: data.day ?? null,
      track: data.track,
    }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

/** Собрать задание дня: курируемая программа + короткая персонализация (один раз за день на этап). */
export async function apiSelfRealizationCompileDay(payload: {
  direction: string
  directionKey: string
  context: string
  difficulties?: string[]
}): Promise<
  | {
      reply: string
      day: SelfRealizationCuratedDay | null
      track: SelfRealizationTrackSync
      cached: boolean
    }
  | { error: string; status?: number }
> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-compile-day', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as {
      reply?: string
      day?: SelfRealizationCuratedDay | null
      track?: SelfRealizationTrackSync
      cached?: boolean
      error?: string
    }
    if (!res.ok) {
      return { error: data.error || 'Ошибка сборки дня', status: res.status }
    }
    if (!data.reply) return { error: 'Пустой ответ', status: 500 }
    if (!data.track || typeof data.track.displayStep !== 'number') {
      return { error: 'Некорректный ответ трека', status: 500 }
    }
    const tr = data.track as SelfRealizationTrackSync
    if (typeof tr.hasDayPackage !== 'boolean') {
      tr.hasDayPackage = !!tr.dayPackage
    }
    return {
      reply: data.reply,
      day: data.day ?? null,
      track: tr,
      cached: !!data.cached,
    }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

export async function apiSelfRealizationHistory(direction: string): Promise<
  | {
      items: Array<{
        role: 'user' | 'assistant'
        content: string
        createdAt: string
        blocks?: SelfRealizationCoachingBlocks | SelfRealizationCuratedDay
      }>
    }
  | { error: string; status?: number }
> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-history', {
      method: 'POST',
      body: JSON.stringify({ direction }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      items?: Array<{
        role: 'user' | 'assistant'
        content: string
        createdAt: string
        blocks?: SelfRealizationCoachingBlocks | SelfRealizationCuratedDay
      }>
      error?: string
    }
    if (!res.ok) return { error: data.error || 'Ошибка загрузки истории', status: res.status }
    return { items: Array.isArray(data.items) ? data.items : [] }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}

export async function apiSelfRealizationClearHistory(
  direction: string,
  directionKey: string
): Promise<{ ok: true } | { error: string; status?: number }> {
  try {
    const res = await fetchWithAuth('/mini-app/self-realization-clear-history', {
      method: 'POST',
      body: JSON.stringify({ direction, directionKey }),
    })
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!res.ok || !data.ok) return { error: data.error || 'Ошибка очистки истории', status: res.status }
    return { ok: true }
  } catch {
    return { error: 'Нет связи с сервером', status: 0 }
  }
}
