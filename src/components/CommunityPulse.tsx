import { motion } from 'framer-motion'
import type { CommunityPulseResponse } from '../api/client'

function pluralPeople(n: number): string {
  const abs = Math.abs(n) % 100
  const d = abs % 10
  if (abs > 10 && abs < 20) return 'человек'
  if (d > 1 && d < 5) return 'человека'
  if (d === 1) return 'человек'
  return 'человек'
}

function pluralTests(n: number): string {
  const abs = Math.abs(n) % 100
  const d = abs % 10
  if (abs > 10 && abs < 20) return 'тестов'
  if (d > 1 && d < 5) return 'теста'
  if (d === 1) return 'тест'
  return 'тестов'
}

function pluralSessions(n: number): string {
  const abs = Math.abs(n) % 100
  const d = abs % 10
  if (abs > 10 && abs < 20) return 'сессий'
  if (d > 1 && d < 5) return 'сессии'
  if (d === 1) return 'сессия'
  return 'сессий'
}

interface CommunityPulseProps {
  data: CommunityPulseResponse | undefined
  isLoading: boolean
}

export function CommunityPulse({ data, isLoading }: CommunityPulseProps) {
  if (isLoading) {
    return (
      <motion.div
        className="pts-pulse-card mb-4 overflow-hidden rounded-[22px] px-5 py-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center gap-3">
          <div className="pts-pulse-dot pts-pulse-dot--muted" aria-hidden />
          <p className="text-sm text-[var(--color-text-secondary)]">Считаем пульс сообщества…</p>
        </div>
      </motion.div>
    )
  }

  if (!data) {
    return null
  }

  if ('error' in data && data.error) {
    return null
  }

  if (data && 'status' in data && data.status === 'forbidden') {
    return (
      <motion.div
        className="pts-pulse-card pts-pulse-card--soft mb-4 overflow-hidden rounded-[22px] px-5 py-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.04 }}
      >
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          💫 <span className="font-semibold text-[var(--color-text-primary)]">Пульс приложения</span> — с Премиум.
          Здесь появятся живые цифры о том, сколько людей сегодня проходят тесты и практики.
        </p>
      </motion.div>
    )
  }

  if (!data || !('pulse' in data) || !data.pulse) {
    return null
  }

  const { pulse } = data

  if (!pulse.showNumbers) {
    return (
      <motion.div
        className="pts-pulse-card mb-4 overflow-hidden rounded-[22px] px-5 py-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none mt-0.5" aria-hidden>
            💠
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight mb-1">
              Пульс приложения
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{pulse.privacyMessage}</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n)

  return (
    <motion.div
      className="pts-pulse-card mb-4 overflow-hidden rounded-[22px] px-5 py-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-3 w-3 shrink-0" aria-hidden>
            <span className="pts-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[var(--color-glow-teal)] opacity-40 animate-ping" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-glow-teal)] shadow-[0_0_12px_rgba(107,196,181,0.65)]" />
          </span>
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight truncate">
            Пульс приложения
          </h3>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-glow-teal-dim)] shrink-0">
          сегодня
        </span>
      </div>

      <div className="relative rounded-2xl bg-gradient-to-br from-white/95 via-[rgba(252,249,255,0.92)] to-[rgba(232,228,248,0.55)] border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] px-4 py-4 mb-3">
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Уникальных людей в тестах и практиках</p>
        <motion.p
          className="font-display text-4xl font-bold tracking-tight tabular-nums bg-gradient-to-r from-[#1e2b1f] via-[#4aab9c] to-[#d89a9f] bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.08 }}
        >
          {fmt(pulse.peopleToday)}
        </motion.p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          {pluralPeople(pulse.peopleToday)} · только агрегаты, без имён
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-[rgba(232,180,184,0.12)] border border-[rgba(232,180,184,0.28)] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#b8787e] mb-0.5">Тесты</p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">{fmt(pulse.testsCompletedToday)}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">{pluralTests(pulse.testsCompletedToday)} завершено</p>
        </div>
        <div className="rounded-xl bg-[rgba(107,196,181,0.12)] border border-[rgba(107,196,181,0.35)] px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-glow-teal-dim)] mb-0.5">
            Ритм сердца
          </p>
          <p className="text-lg font-bold tabular-nums text-[var(--color-text-primary)]">{fmt(pulse.heartSessionsToday)}</p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">{pluralSessions(pulse.heartSessionsToday)}</p>
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-secondary)] mt-3 leading-relaxed opacity-90">
        Цифры обновляются каждые пару минут. Так мы не раскрываем микро-аудиторию и не показываем личные данные.
      </p>
    </motion.div>
  )
}
