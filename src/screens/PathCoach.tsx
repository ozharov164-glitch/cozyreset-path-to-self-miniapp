import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  apiPathCoachHistory,
  apiPathCoachReset,
  apiPathCoachSend,
  apiPathCoachAttachCached,
  getBackendUrl,
  isUsingPageOriginAsBackend,
  loadBackendConfig,
  syncPremiumFromInit,
  type PathCoachAction,
  type PathCoachChatMessage,
} from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { PremiumCard } from '../components/PremiumCard'

interface PathCoachProps {
  onBack: () => void
}

const PTS_VENUS_RESULT_PENDING = 'pts_venus_result_pending'

function readPendingVenusResultCatchUp(): boolean {
  try {
    return sessionStorage.getItem(PTS_VENUS_RESULT_PENDING) === '1'
  } catch {
    return false
  }
}

function clearPendingVenusResultCatchUp(): void {
  try {
    sessionStorage.removeItem(PTS_VENUS_RESULT_PENDING)
    sessionStorage.removeItem('pts_venus_pending_since')
  } catch {
    /* ignore */
  }
}

type CoachUserRow = { id: string; role: 'user'; content: string }
type CoachAssistantRow = {
  id: string
  role: 'assistant'
  content: string
  createdAt?: string
  coachActions?: PathCoachAction[]
  voiceSupportSuggestion?: string | null
  /** Скрыть чипы и блок голоса после перехода в другой раздел из этого ответа */
  coachAttachmentsDismissed?: boolean
}
type CoachRow = CoachUserRow | CoachAssistantRow

function isAssistantRow(r: CoachRow): r is CoachAssistantRow {
  return r.role === 'assistant'
}

function rowId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Naive ISO от сервера (UTC) без Z — иначе Date.parse в браузере трактует как локальное время и ломает catch-up. */
function parseCoachCreatedAtUtcMs(iso: string | undefined): number {
  if (!iso) return 0
  let s = iso.trim().replace(' ', 'T')
  if (!s) return 0
  const hasTz =
    /[zZ]$/.test(s) || /[+-]\d\d:\d\d$/.test(s) || /[+-]\d\d\d\d$/.test(s) || /[+-]\d\d:\d\d:\d\d$/.test(s)
  if (!hasTz) s += 'Z'
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : 0
}

/** Пока фон не записал venus_* в БД, attach отдаёт reason=no_cache — короткие повторы (ритм сердца / тест). */
async function pathCoachAttachCachedWithNoCacheRetry(
  kind: 'test' | 'heart',
  id: string,
  opts?: { forceDuplicate?: boolean },
): Promise<void> {
  const maxAttempts = 15
  const delayMs = 2500
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await apiPathCoachAttachCached({
      kind,
      id,
      ...(kind === 'heart' && opts?.forceDuplicate && attempt === 0 ? { forceDuplicate: true } : {}),
    })
    if (res.status !== 'ok') return
    if (res.attached) return
    if (res.reason !== 'no_cache') return
    if (attempt < maxAttempts - 1) await sleepMs(delayMs)
  }
}

function contentKeySuffix(content: string): string {
  const s = content.slice(0, 96)
  let h = 0
  for (let j = 0; j < s.length; j++) h = (h * 33 + s.charCodeAt(j)) >>> 0
  return `${h}-${content.length}`
}

function toRowsFromServer(messages: PathCoachChatMessage[]): CoachRow[] {
  return messages.map((m, i) => {
    const sid = m.id
    const id =
      typeof sid === 'number' && Number.isFinite(sid)
        ? `pc-${sid}`
        : `pc-${i}-${m.role}-${contentKeySuffix(m.content)}`
    if (m.role === 'assistant') {
      const row: CoachAssistantRow = { id, role: 'assistant', content: m.content }
      if (m.created_at) {
        const raw = m.created_at.trim().replace(' ', 'T')
        const hasTz =
          /[zZ]$/.test(raw) ||
          /[+-]\d\d:\d\d$/.test(raw) ||
          /[+-]\d\d\d\d$/.test(raw) ||
          /[+-]\d\d:\d\d:\d\d$/.test(raw)
        row.createdAt = hasTz ? raw : `${raw}Z`
      }
      return row
    }
    return { id, role: 'user', content: m.content }
  })
}

/** true — выполнен переход в другой раздел (чипы этого ответа можно скрыть) */
function applyCoachAction(a: PathCoachAction): boolean {
  const type =
    {
      openNeuroArena: 'open_neuro_arena',
      open_neuroArena: 'open_neuro_arena',
      'open_neuro-arena': 'open_neuro_arena',
      openNeuro_arena: 'open_neuro_arena',
      neuro_arena: 'open_neuro_arena',
      open_neuroarena: 'open_neuro_arena',
    }[a.type.trim()] ?? a.type.trim()
  const setScreen = useAppStore.getState().setScreen
  const setCurrentTest = useAppStore.getState().setCurrentTest
  switch (type) {
    case 'open_catalog':
      useAppStore.getState().setPathCoachReturnAfterTest(false)
      try {
        sessionStorage.removeItem('pts_vcoach_return')
      } catch {
        /* ignore */
      }
      setScreen('catalog')
      return true
    case 'open_statistics':
      setScreen('statistics')
      return true
    case 'open_self_realization':
      setScreen('selfRealization')
      return true
    case 'open_voice_support':
      setScreen('voiceSupport')
      return true
    case 'open_therapy_map':
      setScreen('therapyMap')
      return true
    case 'open_specialist_brief':
      setScreen('specialistBrief')
      return true
    case 'open_heart_rhythm': {
      const backend = getBackendUrl()
      const token = useAuthStore.getState().appSaveToken
      const gameUrl = `${backend}/heart-rhythm/${token ? `?token=${encodeURIComponent(token)}` : ''}`
      window.location.href = gameUrl
      return true
    }
    case 'open_neuro_arena':
      setScreen('neuroArena')
      return true
    case 'open_test': {
      const id = (a.testId || '').trim()
      if (!id) return false
      useAppStore.getState().setPathCoachReturnAfterTest(true)
      try {
        sessionStorage.setItem('pts_vcoach_return', '1')
      } catch {
        /* ignore */
      }
      setCurrentTest(id)
      setScreen('test')
      return true
    }
    default:
      return false
  }
}

export function PathCoach({ onBack }: PathCoachProps) {
  const reduceMotion = useReducedMotion()
  const isPremium = useAuthStore((s) => s.isPremium)
  const [messages, setMessages] = useState<CoachRow[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootLoading, setBootLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voiceCopiedForId, setVoiceCopiedForId] = useState<string | null>(null)
  const [introOpen, setIntroOpen] = useState(true)
  const [waitSec, setWaitSec] = useState(0)
  /** Ожидание появления разбора Венеры после теста / «Ритма сердца» (серверный ingest). */
  const [resultCatchUpLoading, setResultCatchUpLoading] = useState(false)
  const [catchUpWaitSec, setCatchUpWaitSec] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' })
    })
  }, [reduceMotion])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, resultCatchUpLoading, scrollToBottom])

  const dismissCoachAttachments = useCallback((assistantMessageId: string) => {
    setMessages((rows) =>
      rows.map((r) =>
        r.id === assistantMessageId && isAssistantRow(r)
          ? { ...r, coachAttachmentsDismissed: true }
          : r,
      ),
    )
  }, [])

  useEffect(() => {
    void import('../components/NeuroArena/NeuroArenaScreen')
  }, [])

  /** Пока isPremium=null, не блокируем историю — иначе после результата теста экран «пустой». */
  useEffect(() => {
    if (useAuthStore.getState().isPremium !== null) return
    void syncPremiumFromInit()
  }, [])

  useEffect(() => {
    if (isPremium === false) {
      setBootLoading(false)
      return
    }
    let cancelled = false
    let catchUpStartId: number | undefined
    let catchUpIntervalId: number | undefined
    ;(async () => {
      await loadBackendConfig()
      if (!getBackendUrl()) {
        setBootLoading(false)
        setError(
          'Не удалось определить адрес сервера. Закройте мини-приложение и откройте «Путь к Себе» из бота ещё раз.',
        )
        return
      }
      if (isUsingPageOriginAsBackend()) {
        setBootLoading(false)
        setError(
          'Сервер ещё не подключён (часто после перехода с «Ритма сердца»). Закройте мини-приложение и откройте «Путь к Себе» или Венеру по кнопке из бота.',
        )
        return
      }
      setBootLoading(true)
      let r: Awaited<ReturnType<typeof apiPathCoachHistory>>
      try {
        r = await apiPathCoachHistory()
      } finally {
        setBootLoading(false)
      }
      if (cancelled) return
      if (r.status === 'ok') {
        if (useAuthStore.getState().isPremium === null) {
          useAuthStore.getState().setPremium(true)
        }
        let rowsWorking = toRowsFromServer(r.messages)
        try {
          const tid = sessionStorage.getItem('pts_attach_test_result_id')
          const hid = sessionStorage.getItem('pts_attach_heart_session_id')
          let heartForceDup = false
          try {
            heartForceDup = sessionStorage.getItem('pts_attach_heart_force_dup') === '1'
          } catch {
            /* ignore */
          }
          if (tid) sessionStorage.removeItem('pts_attach_test_result_id')
          if (hid) {
            sessionStorage.removeItem('pts_attach_heart_session_id')
            try {
              sessionStorage.removeItem('pts_attach_heart_force_dup')
            } catch {
              /* ignore */
            }
          }
          if (tid) await pathCoachAttachCachedWithNoCacheRetry('test', tid)
          if (hid) await pathCoachAttachCachedWithNoCacheRetry('heart', hid, { forceDuplicate: heartForceDup })
          if (tid || hid) {
            const rAttach = await apiPathCoachHistory()
            if (!cancelled && rAttach.status === 'ok') {
              rowsWorking = toRowsFromServer(rAttach.messages)
            }
          }
        } catch {
          /* ignore */
        }
        setMessages(rowsWorking)
        if (rowsWorking.length > 0) setIntroOpen(false)
        // Ingest + LLM на сервере часто 6–25 с — опрашиваем историю до новой реплики ассистента.
        let pendingVcoachReturn = false
        try {
          pendingVcoachReturn = sessionStorage.getItem('pts_vcoach_return') === '1'
          if (pendingVcoachReturn) {
            sessionStorage.removeItem('pts_vcoach_return')
          }
        } catch {
          /* ignore */
        }
        const pendingResult = readPendingVenusResultCatchUp()
        const fromZustandBack = useAppStore.getState().pathCoachReturnAfterTest
        let sinceMs = 0
        try {
          sinceMs = parseInt(sessionStorage.getItem('pts_venus_pending_since') || '0', 10) || 0
        } catch {
          sinceMs = 0
        }
        /* Любая реплика ассистента новее метки — уже подтянули разбор (последняя строка может быть user). */
        const alreadyHaveIngestAssistant =
          pendingResult &&
          sinceMs > 0 &&
          rowsWorking.some((row) => {
            if (!isAssistantRow(row)) return false
            const t = parseCoachCreatedAtUtcMs(row.createdAt)
            return t > 0 && t >= sinceMs && (row.content?.length ?? 0) > 48
          })

        if (alreadyHaveIngestAssistant) {
          clearPendingVenusResultCatchUp()
        }

        const shouldCatchUp =
          !alreadyHaveIngestAssistant && (pendingResult || pendingVcoachReturn || fromZustandBack)

        if (shouldCatchUp) {
          setResultCatchUpLoading(true)
          const baselineLen = rowsWorking.length
          let polls = 0
          const maxPolls = 28
          const finishCatchUp = async () => {
            if (cancelled) return
            if (catchUpIntervalId !== undefined) {
              window.clearInterval(catchUpIntervalId)
              catchUpIntervalId = undefined
            }
            if (!cancelled) {
              try {
                const r3 = await apiPathCoachHistory()
                if (!cancelled && r3.status === 'ok') {
                  const fresh = toRowsFromServer(r3.messages)
                  setMessages(fresh)
                  if (fresh.length > 0) setIntroOpen(false)
                }
              } catch {
                /* ignore */
              }
            }
            clearPendingVenusResultCatchUp()
            if (!cancelled) setResultCatchUpLoading(false)
          }
          const runPoll = async () => {
            if (cancelled) return
            polls += 1
            const r2 = await apiPathCoachHistory()
            if (cancelled || r2.status !== 'ok') return
            const rows2 = toRowsFromServer(r2.messages)
            setMessages(rows2)
            if (rows2.length > 0) setIntroOpen(false)
            const gotNewAssistantSinceMark = rows2.some((row) => {
              if (!isAssistantRow(row)) return false
              const t = parseCoachCreatedAtUtcMs(row.createdAt)
              return t >= sinceMs && (row.content?.length ?? 0) > 48
            })
            if (
              rows2.length > baselineLen ||
              gotNewAssistantSinceMark ||
              polls >= maxPolls
            ) {
              void finishCatchUp()
            }
          }
          catchUpStartId = window.setTimeout(() => {
            void runPoll()
            catchUpIntervalId = window.setInterval(() => void runPoll(), 2000)
          }, 300)
        }
      } else if ('premium_required' in r && r.premium_required) {
        useAuthStore.getState().setPremium(false)
        setError('Нужен премиум — оформи подписку в боте 💛')
      } else {
        setError(r.error || 'Не удалось загрузить историю')
      }
    })()
    return () => {
      cancelled = true
      setBootLoading(false)
      setResultCatchUpLoading(false)
      if (catchUpStartId !== undefined) window.clearTimeout(catchUpStartId)
      if (catchUpIntervalId !== undefined) window.clearInterval(catchUpIntervalId)
    }
  }, [isPremium])

  useEffect(() => {
    if (!loading) {
      setWaitSec(0)
      return
    }
    const t = window.setInterval(() => setWaitSec((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [loading])

  useEffect(() => {
    if (!resultCatchUpLoading) {
      setCatchUpWaitSec(0)
      return
    }
    const t = window.setInterval(() => setCatchUpWaitSec((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [resultCatchUpLoading])

  const send = async () => {
    const text = draft.trim()
    if (!text || loading) return
    setError(null)
    setDraft('')
    const userRow: CoachUserRow = { id: rowId('u'), role: 'user', content: text }
    setMessages((m) => [...m, userRow])
    setLoading(true)
    const r = await apiPathCoachSend(text)
    setLoading(false)
    if (r.status === 'ok') {
      const replyText = (r.reply || '').trim()
      if (!replyText) {
        setMessages((m) => m.filter((x) => x.id !== userRow.id))
        setError('Пустой ответ сервера — попробуй ещё раз или зайди чуть позже.')
        return
      }
      const vs = r.voiceSupportSuggestion?.trim() || null
      const acts = r.actions || []
      const assistantRow: CoachAssistantRow = {
        id: rowId('a'),
        role: 'assistant',
        content: replyText,
        ...(acts.length > 0 ? { coachActions: acts } : {}),
        ...(vs ? { voiceSupportSuggestion: vs } : {}),
      }
      setMessages((m) => [...m, assistantRow])
      setIntroOpen(false)
    } else {
      setMessages((m) => m.filter((x) => x.id !== userRow.id))
      if ('premium_required' in r && r.premium_required) {
        setError('Нужен премиум — оформи подписку в боте 💛')
      } else {
        setError(r.error || 'Что-то пошло не так')
      }
    }
  }

  const onReset = async () => {
    if (!window.confirm('Очистить весь диалог с ИИ-Венерой в приложении?')) return
    setError(null)
    const r = await apiPathCoachReset()
    if ('ok' in r && r.ok) {
      setMessages([])
      setIntroOpen(true)
      useAppStore.getState().setPathCoachReturnAfterTest(false)
      try {
        sessionStorage.removeItem('pts_vcoach_return')
      } catch {
        /* ignore */
      }
    } else {
      setError('error' in r ? r.error : 'Не удалось очистить')
    }
  }

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden bg-transparent pt-[max(12px,env(safe-area-inset-top,0px))]">
      <div className="flex flex-1 flex-col min-h-0 min-w-0 pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))]">
      <motion.header
        className="header-app-glass h-14 flex items-center justify-between px-3 mb-2 rounded-2xl shrink-0 mt-1 w-full"
        initial={reduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-2 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="font-display text-[15px] font-bold text-[var(--color-text-primary)] tracking-tight text-center flex-1 px-1">
          ИИ-Венера
        </h1>
        <button
          type="button"
          onClick={() => void onReset()}
          className="btn-ghost min-h-[44px] py-2 px-2 -mr-1 rounded-xl text-xs font-semibold text-[var(--color-glow-teal)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          Сброс
        </button>
      </motion.header>

      <div
        className={`flex-1 flex flex-col min-h-0 max-w-[420px] mx-auto w-full px-3 ${isPremium !== false ? '' : 'pb-[max(16px,env(safe-area-inset-bottom,0px))]'}`}
      >
        {isPremium === true && (
          <div className="shrink-0 mb-2">
            <PremiumCard accent="mint" delay={0} className="!mb-2 !p-4">
              <div className="flex items-start gap-3">
                <img
                  src={`${import.meta.env.BASE_URL}ai-venus-avatar.png`}
                  alt="Иллюстративный образ ИИ-Венеры"
                  width={48}
                  height={48}
                  className="w-12 h-12 shrink-0 rounded-xl object-cover ring-2 ring-white/45 shadow-sm"
                  decoding="async"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
                      ИИ-Венера
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIntroOpen((v) => !v)}
                      className="text-xs font-semibold text-[var(--color-glow-teal)] shrink-0 py-1 px-2 rounded-lg btn-ghost"
                      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                      aria-expanded={introOpen}
                    >
                      {introOpen ? 'Свернуть' : 'Подробнее'}
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {introOpen && (
                      <motion.div
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2">
                          Ответы строятся по твоим данным в приложении: тесты, самореализация, нейро-арена (в виде
                          обезличенных сводок). Это отдельный канал от поддержки в боте и не заменяет работу со
                          специалистом.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </PremiumCard>
          </div>
        )}

        {isPremium === false && (
          <PremiumCard accent="coral" delay={0.05} className="shrink-0 !mb-2">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Чат с ИИ-Венерой доступен с премиум-подпиской — так мы безопасно подставляем твою статистику в контекст
              модели.
            </p>
          </PremiumCard>
        )}

        {isPremium === null && !bootLoading && !error && (
          <p className="text-sm text-center text-[var(--color-text-secondary)] py-4 shrink-0">
            Проверяем доступ к чату…
          </p>
        )}

        {bootLoading && isPremium !== false && (
          <div className="flex justify-center py-8 shrink-0">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-[var(--color-glow-teal)] border-t-transparent"
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              aria-label="Загрузка"
            />
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-5 [-webkit-overflow-scrolling:touch]"
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={
                    msg.role === 'user'
                      ? 'flex justify-end w-full'
                      : 'flex flex-col items-stretch gap-2.5 w-full max-w-[min(100%,420px)]'
                  }
                >
                  <div
                    className={`rounded-2xl px-3.5 py-3 shadow-sm border ${
                      msg.role === 'user'
                        ? 'max-w-[92%] ml-auto bg-gradient-to-br from-[#5ad4c4]/35 to-white/50 border-white/50 text-[var(--color-text-primary)]'
                        : 'max-w-[92%] self-start bg-white/55 border-white/60 text-[var(--color-text-primary)] backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  {isAssistantRow(msg) && !msg.coachAttachmentsDismissed && (
                    <>
                      {!!msg.voiceSupportSuggestion?.trim() && (
                        <motion.div
                          className="rounded-2xl border border-[#d8c8ec]/90 bg-white/60 px-3.5 py-3 backdrop-blur-sm shadow-[0_2px_14px_rgba(55,40,95,0.06)] max-w-[92%] self-start"
                          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        >
                          <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1.5">
                            Промпт для «Голосовой поддержки» в боте
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] leading-snug mb-2 opacity-90">
                            Скопируй целиком в бот — это запрос к голосовому ИИ под твоё состояние, не второй чат с
                            Венерой.
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap break-words mb-3 select-text">
                            {msg.voiceSupportSuggestion}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const t = msg.voiceSupportSuggestion ?? ''
                                void navigator.clipboard?.writeText(t).then(
                                  () => {
                                    setVoiceCopiedForId(msg.id)
                                    window.setTimeout(() => setVoiceCopiedForId((cur) => (cur === msg.id ? null : cur)), 2000)
                                  },
                                  () => {},
                                )
                              }}
                              className="px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-br from-[#a088cc] via-[#8465b3] to-[#6a4d96] text-white shadow-sm active:scale-[0.98]"
                              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                            >
                              {voiceCopiedForId === msg.id ? '✓ Скопировано' : 'Скопировать'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                dismissCoachAttachments(msg.id)
                                useAppStore.getState().setScreen('voiceSupport')
                              }}
                              className="px-3 py-2 rounded-xl text-sm font-semibold border border-[#c4b0dc] bg-white/70 text-[#3a2d4a] active:scale-[0.98]"
                              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                            >
                              Открыть голос
                            </button>
                          </div>
                        </motion.div>
                      )}
                      {!!msg.coachActions?.length && (
                        <motion.div
                          className="flex flex-wrap gap-2.5"
                          role="group"
                          aria-label="Предложения ИИ-Венеры"
                          initial="hidden"
                          animate="visible"
                          variants={
                            reduceMotion
                              ? { hidden: {}, visible: {} }
                              : {
                                  hidden: {},
                                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                                }
                          }
                        >
                          {msg.coachActions.map((a, idx) => (
                            <motion.button
                              key={`${msg.id}-${a.type}-${a.testId ?? ''}-${idx}-${a.label.slice(0, 24)}`}
                              type="button"
                              variants={
                                reduceMotion
                                  ? { hidden: {}, visible: {} }
                                  : {
                                      hidden: { opacity: 0, y: 14, scale: 0.92, filter: 'blur(5px)' },
                                      visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        filter: 'blur(0px)',
                                        transition: { type: 'spring', stiffness: 380, damping: 26, mass: 0.85 },
                                      },
                                    }
                              }
                              whileHover={reduceMotion ? {} : { scale: 1.02, y: -1 }}
                              whileTap={reduceMotion ? {} : { scale: 0.96 }}
                              onClick={() => {
                                if (applyCoachAction(a)) dismissCoachAttachments(msg.id)
                              }}
                              className="relative isolate overflow-hidden px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#3a2d4a] bg-gradient-to-br from-white via-[#faf7ff] to-[#ede4f7] border border-[#d2c2e6] shadow-[0_2px_14px_rgba(55,40,95,0.08)] active:opacity-[0.96] [transform:translateZ(0)]"
                              style={{
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent',
                                WebkitFontSmoothing: 'antialiased',
                              }}
                            >
                              <span className="relative z-10">{a.label}</span>
                              {!reduceMotion && (
                                <motion.span
                                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/45 to-transparent skew-x-[-14deg]"
                                  initial={{ x: '-120%', opacity: 0 }}
                                  animate={{ x: '120%', opacity: [0, 0.9, 0] }}
                                  transition={{ duration: 1.1, delay: 0.15 + idx * 0.06, ease: 'easeInOut' }}
                                  aria-hidden
                                />
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                className="flex flex-col gap-2 justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="rounded-2xl px-4 py-3 bg-white/40 border border-white/50 flex items-center gap-2 w-fit max-w-[92%]">
                  <span className="inline-flex gap-1" aria-hidden>
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="w-2 h-2 rounded-full bg-[var(--color-glow-teal)]"
                        animate={reduceMotion ? {} : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.12 }}
                      />
                    ))}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">ИИ-Венера анализирует запрос…</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug px-1">
                  Ответ собирается с учётом твоего прогресса — обычно 10–50 сек.
                  {waitSec >= 18 ? ` Уже ${waitSec} сек — подожди ещё чуть-чуть.` : ''}
                </p>
              </motion.div>
            )}

            {resultCatchUpLoading && !loading && (
              <motion.div
                className="flex flex-col gap-2 justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className="rounded-2xl px-4 py-3 bg-white/45 border border-[#d8c8ec]/70 flex items-center gap-2 w-fit max-w-[92%]"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <span className="inline-flex gap-1" aria-hidden>
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="w-2 h-2 rounded-full bg-[#9d82c9]"
                        animate={reduceMotion ? {} : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.12 }}
                      />
                    ))}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    ИИ-Венера анализирует ваш результат…
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug px-1">
                  Собираем разбор по твоему тесту или сессии «Ритм сердца» — обычно 10–40 сек.
                  {catchUpWaitSec >= 22 ? ` Уже ${catchUpWaitSec} сек — подожди ещё чуть-чуть.` : ''}
                </p>
              </motion.div>
            )}
          </div>

          {!bootLoading &&
            isPremium === true &&
            messages.length === 0 &&
            !loading &&
            !resultCatchUpLoading && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-8 px-2 leading-relaxed">
              Напиши первое сообщение — ИИ-Венера ответит с опорой на твои тесты и активность в приложении.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-700/90 mt-3 px-1" role="alert">
              {error}
            </p>
          )}

          <div ref={bottomRef} className="h-4 shrink-0" aria-hidden />
        </div>
      </div>
      </div>

      {isPremium === true && (
        <div className="shrink-0 z-20 relative w-full bg-transparent">
          {/*
            Без отдельного «лаванда-блока»: виден тот же ambient, что и в чате.
            Низ — цвет последней ступени глобального градиента (#ebe3f9), зерно fixed как у .pts-ambient__grain.
          */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 bg-[#ebe3f9]"
            style={{ height: 'max(1.4rem, calc(env(safe-area-inset-bottom, 0px) + 0.7rem))' }}
            aria-hidden
          />
          <div className="pts-pathcoach-dock-grain z-[1]" aria-hidden />
          <div className="relative z-[2] max-w-[420px] mx-auto w-full pl-[max(12px,env(safe-area-inset-left,0px))] pr-[max(12px,env(safe-area-inset-right,0px))] pt-4 pb-[max(0.9rem,calc(env(safe-area-inset-bottom,0px)+0.55rem))]">
            <div
              className="flex gap-2 items-end rounded-[1.4rem] border border-[#e4daf0]/90 px-2 py-2 transition-[box-shadow,border-color,background] duration-300 ease-out focus-within:border-[#d2c4e8] focus-within:shadow-[0_0_0_1px_rgba(200,185,225,0.35),inset_0_1px_0_rgba(255,255,255,0.6)]"
              style={{
                WebkitTapHighlightColor: 'transparent',
                background:
                  'linear-gradient(158deg, rgba(255,255,255,0.9) 0%, rgba(250,246,255,0.86) 42%, rgba(240,232,252,0.88) 100%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.68), inset 0 -1px 0 rgba(185,160,215,0.07), 0 4px 22px rgba(90,65,125,0.08)',
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Напиши, что происходит…"
                rows={2}
                maxLength={3800}
                className="flex-1 min-h-[48px] max-h-[min(40vh,9.5rem)] resize-none rounded-xl bg-transparent border-0 px-2.5 py-2.5 text-[15px] leading-relaxed text-[#3a2d4a] placeholder:text-[#7a6b92] placeholder:opacity-[0.78] focus:outline-none focus:ring-0 min-w-0 caret-[#7b5fa8]"
                style={{ WebkitAppearance: 'none' }}
                disabled={loading || bootLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void send()
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || bootLoading || !draft.trim()}
                className="shrink-0 mb-px min-h-[44px] min-w-[50px] rounded-xl px-2.5 font-semibold text-white self-end bg-gradient-to-br from-[#a088cc] via-[#8465b3] to-[#6a4d96] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_14px_rgba(75,48,115,0.28)] hover:brightness-[1.05] active:scale-[0.97] active:brightness-[0.96] disabled:opacity-45 disabled:hover:brightness-100 disabled:active:scale-100 transition-[transform,filter,opacity]"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
