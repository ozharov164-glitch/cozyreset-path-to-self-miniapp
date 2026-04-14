/**
 * Пулы стимулов для Нейро-Арены: без повторов внутри полного цикла; после исчерпания — новый цикл.
 * Первый цикл: порядок «с конца» списка в данных (более поздние id — раньше в очереди).
 * Следующие цели: полный набор в случайном порядке.
 */

export type PoolState = {
  unused: string[]
  /** Пока true — при пустой очереди наполняем с конца списка; после первого полного прохода — false. */
  useEndFirstRefill: boolean
}

function shuffleIds(ids: string[]): string[] {
  const a = [...ids]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]!
    a[i] = a[j]!
    a[j] = t
  }
  return a
}

function loadPool(storageKey: string): PoolState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { unused: [], useEndFirstRefill: true }
    const p = JSON.parse(raw) as unknown
    if (
      p &&
      typeof p === 'object' &&
      Array.isArray((p as PoolState).unused) &&
      typeof (p as PoolState).useEndFirstRefill === 'boolean'
    ) {
      return p as PoolState
    }
  } catch {
    /* ignore */
  }
  return { unused: [], useEndFirstRefill: true }
}

function savePool(storageKey: string, state: PoolState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export const NEURO_ARENA_POOL_KEYS = {
  dotProbe: 'neuroArena.pool.dotProbe.v3',
  scenarios: 'neuroArena.pool.scenarios.v1',
} as const

/**
 * Забирает до batchSize элементов по id; при пустой очереди пополняет её (конец-вперёд или shuffle).
 */
export type TakeUniqueBatchOptions = {
  /** Первое пополнение пустой очереди: `reverse` — как раньше (с конца списка id); `shuffle` — случайный порядок. */
  firstRefillOrder?: 'reverse' | 'shuffle'
}

export function takeUniqueBatchById<T extends { id: string }>(
  storageKey: string,
  all: T[],
  batchSize: number,
  opts?: TakeUniqueBatchOptions,
): T[] {
  if (batchSize <= 0 || all.length === 0) return []

  const byId = new Map(all.map((x) => [x.id, x]))
  const allIds = all.map((x) => x.id)

  let state = loadPool(storageKey)

  if (state.unused.length === 0) {
    const order = opts?.firstRefillOrder ?? 'reverse'
    state.unused = state.useEndFirstRefill
      ? order === 'shuffle'
        ? shuffleIds(allIds)
        : [...allIds].reverse()
      : shuffleIds(allIds)
  }

  const out: T[] = []
  for (let i = 0; i < batchSize && state.unused.length > 0; i++) {
    const id = state.unused.shift()!
    const item = byId.get(id)
    if (item) out.push(item)
  }

  if (state.unused.length === 0) {
    state.useEndFirstRefill = false
  }

  savePool(storageKey, state)
  return out
}
