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
import { IconSparkle } from '../components/FeatureIcons'

interface PathCoachProps {
  onBack: () => void
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
  const [messages, setMessages] = useState<PathCoachChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootLoading, setBootLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastActions, setLastActions] = useState<PathCoachAction[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'end' })
    })
  }, [reduceMotion])

  useEffect(() => {
    scrollToBottom()
  }, [messages, lastActions, scrollToBottom])

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
        setMessages(r.messages)
        setLastActions([])
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

  const send = async () => {
    const text = draft.trim()
    if (!text || loading) return
    setError(null)
    setDraft('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLastActions([])
    setLoading(true)
    const r = await apiPathCoachSend(text)
    setLoading(false)
    if (r.status === 'ok') {
      setMessages((m) => [...m, { role: 'assistant', content: r.reply }])
      setLastActions(r.actions || [])
    } else {
      setMessages((m) => m.slice(0, -1))
      if ('premium_required' in r && r.premium_required) {
        setError('Нужен премиум — оформи подписку в боте 💛')
      } else {
        setError(r.error || 'Что-то пошло не так')
      }
    }
  }

  const onReset = async () => {
    if (!window.confirm('Очистить весь диалог с коучом в приложении?')) return
    setError(null)
    const r = await apiPathCoachReset()
    if ('ok' in r && r.ok) {
      setMessages([])
      setLastActions([])
    } else {
      setError('error' in r ? r.error : 'Не удалось очистить')
    }
  }

  const intro = (
    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
      Коуч видит твой прогресс в приложении (тесты, самореализация, нейро-арена — только агрегаты из данных, без
      доступа к чужим аккаунтам). Ответы идут через отдельный канал ИИ внутри «Пути к Себе» — не путай с чатом
      поддержки в боте.
    </p>
  )

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <motion.header
        className="header-app-glass h-14 flex items-center justify-between px-3 mb-3 rounded-2xl shrink-0"
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
          ИИ-коуч
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

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-28">
        <PremiumCard accent="mint" delay={0}>
          <div className="flex items-start gap-2.5 mb-3">
            <IconSparkle className="shrink-0 mt-0.5 w-6 h-6 text-[#4aab9c]" aria-hidden />
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                Путь к себе — коуч
              </h2>
              {intro}
            </div>
          </div>
        </PremiumCard>

        {isPremium !== true && (
          <PremiumCard accent="coral" delay={0.05}>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Раздел доступен с премиум-подпиской: так мы можем безопасно подставлять твою статистику в контекст ИИ.
            </p>
          </PremiumCard>
        )}

        {bootLoading && isPremium === true && (
          <div className="flex justify-center py-10">
            <motion.div
              className="w-10 h-10 rounded-full border-2 border-[var(--color-glow-teal)] border-t-transparent"
              animate={reduceMotion ? {} : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              aria-label="Загрузка"
            />
          </div>
        )}

        <div className="space-y-3 mt-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={`${i}-${msg.role}-${msg.content.slice(0, 24)}`}
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
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rounded-2xl px-4 py-3 bg-white/40 border border-white/50 flex items-center gap-2">
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
                <span className="text-sm text-[var(--color-text-secondary)]">Коуч пишет…</span>
              </div>
            </motion.div>
          )}
        </div>

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
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c5f5ec]/90 to-white/80 border border-[var(--color-glow-teal)]/40 text-[var(--color-forest-dark)] shadow-sm"
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

        <div ref={bottomRef} />
      </div>

      {isPremium === true && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-[#0f2a24]/12 via-[#eaf8f4]/95 to-transparent pointer-events-none">
          <div className="max-w-[420px] mx-auto w-full pointer-events-auto">
            <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md shadow-lg p-2 flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Напиши, что происходит и чем помочь…"
                rows={2}
                maxLength={3800}
                className="flex-1 resize-none rounded-xl bg-white/70 border border-white/60 px-3 py-2.5 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/50 min-h-[48px]"
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
                className="shrink-0 min-h-[48px] min-w-[52px] rounded-xl btn-primary px-3 font-semibold disabled:opacity-45"
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
