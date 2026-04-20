import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  apiPathCoachHistory,
  apiPathCoachReset,
  apiPathCoachSend,
  getBackendUrl,
  type PathCoachAction,
  type PathCoachChatMessage,
} from '../api/client'
import { useAuthStore } from '../store/authStore'
import { useAppStore } from '../store/appStore'
import { PremiumCard } from '../components/PremiumCard'

interface PathCoachProps {
  onBack: () => void
}

type CoachRow = { id: string; role: 'user' | 'assistant'; content: string }

function rowId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function toRowsFromServer(messages: PathCoachChatMessage[]): CoachRow[] {
  return messages.map((m, i) => ({
    id: `srv-${i}-${m.content.length}`,
    role: m.role,
    content: m.content,
  }))
}

function applyCoachAction(a: PathCoachAction): void {
  const setScreen = useAppStore.getState().setScreen
  const setCurrentTest = useAppStore.getState().setCurrentTest
  switch (a.type) {
    case 'open_catalog':
      setScreen('catalog')
      break
    case 'open_statistics':
      setScreen('statistics')
      break
    case 'open_self_realization':
      setScreen('selfRealization')
      break
    case 'open_voice_support':
      setScreen('voiceSupport')
      break
    case 'open_therapy_map':
      setScreen('therapyMap')
      break
    case 'open_specialist_brief':
      setScreen('specialistBrief')
      break
    case 'open_heart_rhythm': {
      const backend = getBackendUrl()
      const token = useAuthStore.getState().appSaveToken
      const gameUrl = `${backend}/heart-rhythm/${token ? `?token=${encodeURIComponent(token)}` : ''}`
      window.location.href = gameUrl
      break
    }
    case 'open_neuro_arena':
      setScreen('neuroArena')
      break
    case 'open_test': {
      const id = (a.testId || '').trim()
      if (id) {
        setCurrentTest(id)
        setScreen('test')
      }
      break
    }
    default:
      break
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
  const [lastActions, setLastActions] = useState<PathCoachAction[]>([])
  const [introOpen, setIntroOpen] = useState(true)
  const [waitSec, setWaitSec] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' })
    })
  }, [reduceMotion])

  useEffect(() => {
    scrollToBottom()
  }, [messages, lastActions, loading, scrollToBottom])

  useEffect(() => {
    if (isPremium !== true) {
      setBootLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setBootLoading(true)
      const r = await apiPathCoachHistory()
      if (cancelled) return
      if (r.status === 'ok') {
        const rows = toRowsFromServer(r.messages)
        setMessages(rows)
        setLastActions([])
        if (rows.length > 0) setIntroOpen(false)
      } else if ('premium_required' in r && r.premium_required) {
        setError('Нужен премиум — оформи подписку в боте 💛')
      } else {
        setError(r.error || 'Не удалось загрузить историю')
      }
      setBootLoading(false)
    })()
    return () => {
      cancelled = true
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

  const send = async () => {
    const text = draft.trim()
    if (!text || loading) return
    setError(null)
    setDraft('')
    const userRow: CoachRow = { id: rowId('u'), role: 'user', content: text }
    setMessages((m) => [...m, userRow])
    setLastActions([])
    setLoading(true)
    const r = await apiPathCoachSend(text)
    setLoading(false)
    if (r.status === 'ok') {
      setMessages((m) => [...m, { id: rowId('a'), role: 'assistant', content: r.reply }])
      setLastActions(r.actions || [])
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
      setLastActions([])
      setIntroOpen(true)
    } else {
      setError('error' in r ? r.error : 'Не удалось очистить')
    }
  }

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] flex flex-col safe-area overflow-hidden bg-transparent">
      <motion.header
        className="header-app-glass h-14 flex items-center justify-between px-3 mb-2 rounded-2xl shrink-0 mx-3 mt-1"
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

      <div className="flex-1 flex flex-col min-h-0 max-w-[420px] mx-auto w-full px-3">
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

        {isPremium !== true && (
          <PremiumCard accent="coral" delay={0.05} className="shrink-0 !mb-2">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Чат с ИИ-Венерой доступен с премиум-подпиской — так мы безопасно подставляем твою статистику в контекст
              модели.
            </p>
          </PremiumCard>
        )}

        {bootLoading && isPremium === true && (
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
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-3 [-webkit-overflow-scrolling:touch]"
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-3 shadow-sm border ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#5ad4c4]/35 to-white/50 border-white/50 text-[var(--color-text-primary)]'
                        : 'bg-white/55 border-white/60 text-[var(--color-text-primary)] backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
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
                  <span className="text-sm text-[var(--color-text-secondary)]">ИИ-Венера отвечает…</span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-snug px-1">
                  Ответ собирается с учётом твоего прогресса — обычно 10–50 сек.
                  {waitSec >= 18 ? ` Уже ${waitSec} сек — модель иногда дольше думает.` : ''}
                </p>
              </motion.div>
            )}
          </div>

          {!bootLoading && isPremium === true && messages.length === 0 && !loading && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-8 px-2 leading-relaxed">
              Напиши первое сообщение — ИИ-Венера ответит с опорой на твои тесты и активность в приложении.
            </p>
          )}

          {lastActions.length > 0 && !loading && (
            <motion.div
              className="mt-4 flex flex-wrap gap-2"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {lastActions.map((a, idx) => (
                <motion.button
                  key={`${a.type}-${a.testId ?? ''}-${idx}`}
                  type="button"
                  whileTap={reduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => applyCoachAction(a)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c5f5ec]/90 to-white/80 border border-[var(--color-glow-teal)]/40 text-[var(--color-forest-dark)] shadow-sm active:opacity-90"
                  style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                >
                  {a.label}
                </motion.button>
              ))}
            </motion.div>
          )}

          {error && (
            <p className="text-sm text-red-700/90 mt-3 px-1" role="alert">
              {error}
            </p>
          )}

          <div ref={bottomRef} className="h-4 shrink-0" aria-hidden />
        </div>
      </div>

      {isPremium === true && (
        <div className="shrink-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 bg-gradient-to-t from-[#f6f4fa] from-40% via-[#f6f4fa]/70 to-transparent">
          <div className="max-w-[420px] mx-auto w-full">
            <div
              className="flex gap-1.5 items-end rounded-[1.35rem] bg-white/90 backdrop-blur-xl px-2 py-1.5 border border-[#e8e4f0] shadow-[0_6px_24px_rgba(55,45,75,0.07)] focus-within:border-[#d4cce8] focus-within:shadow-[0_8px_28px_rgba(55,45,75,0.1)] focus-within:ring-1 focus-within:ring-[#c4b8dc]/35 transition-[box-shadow,border-color] duration-200"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Напиши, что происходит…"
                rows={2}
                maxLength={3800}
                className="flex-1 min-h-[48px] max-h-[min(40vh,9.5rem)] resize-none rounded-[1rem] bg-transparent border-0 px-2.5 py-2.5 text-[15px] leading-relaxed text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] placeholder:opacity-80 focus:outline-none focus:ring-0 min-w-0"
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
                className="shrink-0 mb-0.5 min-h-[44px] min-w-[48px] rounded-[1rem] px-2.5 font-semibold text-white self-end bg-[#6b5b8c] shadow-[0_2px_10px_rgba(80,60,110,0.25)] hover:brightness-105 active:scale-[0.98] active:brightness-95 disabled:opacity-45 disabled:hover:brightness-100 disabled:active:scale-100 transition-[transform,filter,opacity]"
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
