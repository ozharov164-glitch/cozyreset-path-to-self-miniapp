import { useCallback, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { apiCheckinRitual, apiCheckinSave, apiCheckinStatus, type CheckinType } from '../api/client'
import { PremiumCard } from '../components/PremiumCard'

interface CheckinsProps {
  onBack: () => void
}

const MOODS = [
  { icon: '💫', label: 'Вдохновлён(а)', value: '💫 Вдохновлён(а)' },
  { icon: '🙂', label: 'Нормально', value: '🙂 Нормально' },
  { icon: '😴', label: 'Устал(а)', value: '😴 Устал(а)' },
  { icon: '💔', label: 'Тяжело', value: '💔 Тяжело' },
] as const

function formatCheckinDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function Checkins({ onBack }: CheckinsProps) {
  const queryClient = useQueryClient()
  const reduceMotion = useReducedMotion()
  const [checkinType, setCheckinType] = useState<CheckinType>('morning')
  const [mood, setMood] = useState<string>(MOODS[1].value)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ritual, setRitual] = useState<string | null>(null)
  const [ritualLoading, setRitualLoading] = useState(false)
  const [ritualError, setRitualError] = useState<string | null>(null)
  const [ritualDailyLimit, setRitualDailyLimit] = useState<number | null>(null)
  const [ritualDailyUsed, setRitualDailyUsed] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['checkin-status'],
    queryFn: apiCheckinStatus,
  })

  const doneToday = useMemo(() => {
    if (!data || 'error' in data) return false
    return checkinType === 'morning' ? data.today.morning : data.today.evening
  }, [data, checkinType])

  const submit = useCallback(async () => {
    if (saving || doneToday) return
    setError(null)
    setSaving(true)
    try {
      const res = await apiCheckinSave({
        checkinType,
        mood,
        note: note.trim() || undefined,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      setNote('')
      await queryClient.invalidateQueries({ queryKey: ['checkin-status'] })
    } finally {
      setSaving(false)
    }
  }, [saving, doneToday, checkinType, mood, note, queryClient])

  const generateRitual = useCallback(async () => {
    if (ritualLoading) return
    if (ritualDailyLimit !== null && ritualDailyUsed !== null && ritualDailyUsed >= ritualDailyLimit) {
      setRitualError(`Лимит ритуалов на сегодня исчерпан (${ritualDailyLimit}). Возвращайся завтра 💛`)
      return
    }
    setRitualError(null)
    setRitualLoading(true)
    try {
      const res = await apiCheckinRitual({
        checkinType,
        mood,
        note: note.trim() || undefined,
      })
      if ('error' in res) {
        if (typeof res.dailyLimit === 'number') setRitualDailyLimit(res.dailyLimit)
        if (typeof res.dailyUsed === 'number') setRitualDailyUsed(res.dailyUsed)
        setRitualError(res.error)
        return
      }
      if (typeof res.dailyLimit === 'number') setRitualDailyLimit(res.dailyLimit)
      if (typeof res.dailyUsed === 'number') setRitualDailyUsed(res.dailyUsed)
      setRitual(res.ritual)
    } finally {
      setRitualLoading(false)
    }
  }, [ritualLoading, ritualDailyLimit, ritualDailyUsed, checkinType, mood, note])

  const ritualLimitReached =
    ritualDailyLimit !== null && ritualDailyUsed !== null && ritualDailyUsed >= ritualDailyLimit

  const entries = !data || 'error' in data ? [] : data.items
  const todayProgress = !data || 'error' in data ? 0 : Number(data.today.morning) + Number(data.today.evening)
  const progressLabel = todayProgress === 2 ? 'День закрыт' : `Выполнено сегодня: ${todayProgress}/2`

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="header-app-glass h-14 flex items-center justify-between px-4 mb-5 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">Чек-ины</h1>
        <span className="w-[62px]" />
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-6 gap-3">
        <PremiumCard accent="mint" delay={0.02} className="relative overflow-hidden">
          {!reduceMotion && (
            <motion.div
              className="absolute -inset-16 pointer-events-none opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 18% 16%, rgba(125,211,192,0.33), transparent 56%), radial-gradient(circle at 84% 8%, rgba(184,164,224,0.30), transparent 48%), radial-gradient(circle at 72% 88%, rgba(232,180,184,0.24), transparent 52%)',
              }}
              animate={{ rotate: [0, 8, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] tracking-tight">Ежедневные чек-ины</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  Утро и вечер в одном ритме: короткая фиксация состояния и спокойный фокус на себе.
                </p>
              </div>
              <div
                className="shrink-0 rounded-xl px-2.5 py-1.5 border border-[var(--color-lavender)]/40 text-xs font-semibold text-[var(--color-text-primary)] bg-white/70"
                style={{ boxShadow: '0 6px 18px rgba(90,184,168,0.12)' }}
              >
                ✨ Premium flow
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-white/45 bg-white/55 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Прогресс</span>
                <span className="text-xs font-semibold text-[var(--color-text-primary)]">{progressLabel}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-lavender)]/35 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7dd3c0 0%, #9b8dd4 100%)' }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${todayProgress * 50}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                />
              </div>
            </div>

          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Выбирай формат, отмечай состояние и добавляй пару слов — история останется в приложении.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <motion.button
              type="button"
              onClick={() => setCheckinType('morning')}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className={`rounded-xl py-3 px-3 text-sm font-semibold border ${
                checkinType === 'morning'
                  ? 'bg-[var(--color-glow-teal)]/25 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)] shadow-md'
                  : 'bg-white/65 border-[var(--color-lavender)]/45 text-[var(--color-text-secondary)]'
              }`}
            >
              🌅 Утро
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setCheckinType('evening')}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
              className={`rounded-xl py-3 px-3 text-sm font-semibold border ${
                checkinType === 'evening'
                  ? 'bg-[var(--color-glow-teal)]/25 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)] shadow-md'
                  : 'bg-white/65 border-[var(--color-lavender)]/45 text-[var(--color-text-secondary)]'
              }`}
            >
              🌙 Вечер
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {MOODS.map((m) => (
              <motion.button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value)}
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className={`rounded-xl py-2.5 px-2 text-xs font-semibold border ${
                  mood === m.value
                    ? 'bg-white/95 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)] shadow-sm'
                    : 'bg-white/60 border-[var(--color-lavender)]/45 text-[var(--color-text-secondary)]'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden>{m.icon}</span>
                  <span>{m.label}</span>
                </span>
              </motion.button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Пара слов о состоянии (опционально)"
            className="w-full min-h-[92px] rounded-xl border border-[var(--color-lavender)]/40 bg-white/75 p-3 text-sm text-[var(--color-text-primary)] outline-none"
            maxLength={1200}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-[11px] text-[var(--color-text-secondary)]">{note.length}/1200</span>
          </div>

          {doneToday && (
            <p className="mt-3 text-xs font-semibold text-[var(--color-text-secondary)]">
              Этот чек-ин уже отмечен сегодня. Можно выбрать другой тип.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || doneToday}
            className="w-full mt-4 py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-60"
          >
            {saving ? 'Сохраняю…' : 'Сохранить чек-ин'}
          </button>
          </div>
        </PremiumCard>

        <PremiumCard accent="lavender" delay={0.04}>
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-3 tracking-tight">
            Последние отметки
          </h3>
          {isLoading ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Загрузка…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">Пока пусто. Сделай первый чек-ин.</p>
          ) : (
            <ul className="space-y-2">
              {entries.slice(0, 10).map((item, idx) => (
                <motion.li
                  key={`${item.createdAt}-${idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.02 }}
                  className="rounded-xl border border-[var(--color-lavender)]/35 bg-white/65 p-3 shadow-[0_8px_18px_rgba(76,91,120,0.08)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {item.checkinType === 'morning' ? '🌅 Утренний' : '🌙 Вечерний'} · {item.mood}
                    </p>
                    <span className="text-xs text-[var(--color-text-secondary)]">{formatCheckinDate(item.createdAt)}</span>
                  </div>
                  {item.note ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.note}</p> : null}
                </motion.li>
              ))}
            </ul>
          )}
        </PremiumCard>

        <PremiumCard accent="rose" delay={0.06} className="relative overflow-hidden">
          {!reduceMotion && (
            <motion.div
              className="absolute -inset-[55px] opacity-65 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 18% 22%, rgba(255,198,208,0.35), transparent 58%), radial-gradient(circle at 82% 10%, rgba(184,164,224,0.35), transparent 48%), radial-gradient(circle at 70% 88%, rgba(125,211,192,0.22), transparent 52%)',
                filter: 'blur(10px)',
              }}
              animate={{ rotate: [0, 9, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <div className="relative z-10">
            <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
              Ритуал для себя
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              Как в старом формате бота: ИИ собирает мягкий ритуал под твой чек-ин, настроение и заметку.
            </p>
            <button
              type="button"
              onClick={() => void generateRitual()}
              disabled={ritualLoading || ritualLimitReached}
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-60"
            >
              {ritualLoading ? 'Собираю ритуал…' : ritualLimitReached ? 'Лимит на сегодня достигнут' : 'Подобрать ритуал'}
            </button>
            {ritualDailyLimit !== null && ritualDailyUsed !== null ? (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                Попыток сегодня: {Math.min(ritualDailyUsed, ritualDailyLimit)}/{ritualDailyLimit}
              </p>
            ) : null}
            {ritualError ? <p className="mt-3 text-sm text-rose-600">{ritualError}</p> : null}
            {ritual ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-4 rounded-2xl border border-[var(--color-lavender)]/40 bg-white/75 p-4 shadow-[0_10px_22px_rgba(82,68,115,0.09)]"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">
                  Твой ритуал на сейчас
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">{ritual}</p>
              </motion.div>
            ) : null}
          </div>
        </PremiumCard>
      </div>
    </div>
  )
}
