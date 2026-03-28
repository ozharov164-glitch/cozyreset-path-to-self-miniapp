import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MiniAppStatisticsBundle } from '../../api/client'

const TEAL = '#6bc4b5'
const LAV = '#b8a4e0'
const ROSE = '#e8b4b8'
const ORANGE = '#f4d4a6'
const MUTED = 'rgba(26, 25, 23, 0.45)'

function shortDate(iso: string) {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

function ChartCard({
  title,
  subtitle,
  children,
  empty,
  emptyHint,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  empty?: boolean
  emptyHint?: string
}) {
  return (
    <motion.div
      layout
      className="card-premium rounded-2xl p-4 border border-[var(--color-lavender)]/20 min-h-[240px] flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-[var(--color-text-secondary)] mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-2" />}
      {empty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-8">
          <span className="text-3xl mb-2" aria-hidden>
            🌱
          </span>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{emptyHint ?? 'Пока нет данных за этот период.'}</p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[200px] [&_.recharts-surface]:overflow-visible">
          <AnimatePresence mode="wait">
            <motion.div
              key={title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-[220px] w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export function MoodChart({ data }: { data: MiniAppStatisticsBundle['mood_over_time'] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: shortDate(d.date),
  }))
  const hasAny = chartData.some((d) => d.morning_mood != null || d.evening_mood != null)

  return (
    <ChartCard
      title="Настроение"
      subtitle="Утро и вечер (шкала 2–5)"
      empty={!hasAny}
      emptyHint="Сделай утренний или вечерний чек-ин в боту — здесь появится линия настроения."
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis domain={[1, 5]} tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(184,164,224,0.35)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-text-primary)' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="morning_mood"
            name="Утро"
            stroke={TEAL}
            strokeWidth={3}
            dot={{ r: 3, fill: TEAL }}
            activeDot={{ r: 5 }}
            connectNulls
            animationDuration={900}
          />
          <Line
            type="monotone"
            dataKey="evening_mood"
            name="Вечер"
            stroke={LAV}
            strokeWidth={3}
            dot={{ r: 3, fill: LAV }}
            activeDot={{ r: 5 }}
            connectNulls
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function ActivityChart({ data }: { data: MiniAppStatisticsBundle['daily_activity'] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: shortDate(d.date),
  }))
  const hasAny = chartData.some((d) => d.checkins + d.tests + d.rituals + d.ai_messages > 0)

  return (
    <ChartCard
      title="Активность по дням"
      subtitle="Чек-ины, тесты, ритуалы, сообщения ИИ"
      empty={!hasAny}
      emptyHint="Загляни в бота: чек-ин, тест из каталога или ритуал — столбцы оживут."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(184,164,224,0.35)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="checkins" name="Чек-ины" stackId="a" fill={TEAL} radius={[4, 4, 0, 0]} animationDuration={800} />
          <Bar dataKey="tests" name="Тесты" stackId="a" fill={LAV} animationDuration={800} />
          <Bar dataKey="rituals" name="Ритуалы" stackId="a" fill={ORANGE} animationDuration={800} />
          <Bar dataKey="ai_messages" name="ИИ" stackId="a" fill={ROSE} radius={[0, 0, 4, 4]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

const PIE_COLORS = [TEAL, LAV, ROSE, ORANGE, '#7c9aa0', '#c9b8e6', '#9fd4cb', '#ddb8e6']

function truncateLabel(s: string, max = 36) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

export function TestPopularityChart({ data }: { data: MiniAppStatisticsBundle['test_popularity'] }) {
  const chartData = data.map((d, i) => ({ name: d.test_name, value: d.count, fill: PIE_COLORS[i % PIE_COLORS.length] }))
  const empty = chartData.length === 0
  const totalPasses = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <motion.div
      layout
      className="card-premium rounded-2xl p-4 border border-[var(--color-lavender)]/20 flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-0.5">Тесты</h3>
      <p className="text-xs text-[var(--color-text-secondary)] mb-3">Что проходил чаще всего</p>

      {empty ? (
        <div className="flex flex-col items-center justify-center text-center px-3 py-8 min-h-[200px]">
          <span className="text-3xl mb-2" aria-hidden>
            🌱
          </span>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Пройди любой тест из каталога — здесь появится диаграмма и подписи.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto w-full max-w-[280px] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="78%"
                  paddingAngle={2}
                  animationDuration={900}
                  animationBegin={0}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={1}
                  label={false}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`${entry.name}-${idx}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name: string, props: { payload?: { name?: string } }) => [
                    `${value} · ${props?.payload?.name ?? ''}`,
                    'Прохождений',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(184,164,224,0.35)',
                    background: 'rgba(255,255,255,0.96)',
                    fontSize: 12,
                    maxWidth: 260,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <motion.div
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{ marginTop: -4 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                всего
              </span>
              <motion.span
                className="font-display text-2xl font-bold tabular-nums text-[var(--color-text-primary)] leading-none mt-0.5"
                key={totalPasses}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                {totalPasses}
              </motion.span>
            </motion.div>
          </div>

          <motion.ul
            className="mt-4 space-y-2"
            initial="hidden"
            animate="show"
            variants={{
              show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
            }}
          >
            {chartData.map((entry, idx) => {
              const pct = totalPasses > 0 ? Math.round((entry.value / totalPasses) * 100) : 0
              return (
                <motion.li
                  key={`${entry.name}-${idx}`}
                  variants={{
                    hidden: { opacity: 0, x: -12, filter: 'blur(4px)' },
                    show: {
                      opacity: 1,
                      x: 0,
                      filter: 'blur(0px)',
                      transition: { type: 'spring', stiffness: 400, damping: 28 },
                    },
                  }}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-lavender)]/20 bg-[var(--color-text-primary)]/[0.035] px-3 py-2.5 shadow-sm"
                >
                  <span className="flex min-w-0 flex-1 items-start gap-2.5">
                    <motion.span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: entry.fill }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.08 + idx * 0.05, type: 'spring', stiffness: 500, damping: 22 }}
                    />
                    <span className="text-left text-[13px] font-medium leading-snug text-[var(--color-text-primary)]">
                      {truncateLabel(entry.name)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <motion.span
                      className="block font-display text-sm font-bold tabular-nums text-[var(--color-text-primary)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      {entry.value}×
                    </motion.span>
                    <motion.span
                      className="block text-xs font-semibold tabular-nums text-[var(--color-glow-teal)]"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + idx * 0.05, type: 'spring', stiffness: 380, damping: 26 }}
                    >
                      {pct}%
                    </motion.span>
                  </span>
                </motion.li>
              )
            })}
          </motion.ul>
        </>
      )}
    </motion.div>
  )
}

export function AIActivityChart({ data }: { data: MiniAppStatisticsBundle['ai_activity_over_time'] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: shortDate(d.date),
  }))
  const hasAny = chartData.some((d) => d.messages > 0)

  return (
    <ChartCard
      title="Диалог с ИИ"
      subtitle="Твои сообщения и ответы ассистента по дням"
      empty={!hasAny}
      emptyHint="Открой голосовую поддержку или чат в боте — график заполнится."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gUser" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TEAL} stopOpacity={0.55} />
              <stop offset="100%" stopColor={TEAL} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gAsst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LAV} stopOpacity={0.5} />
              <stop offset="100%" stopColor={LAV} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,25,23,0.08)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(184,164,224,0.35)',
              background: 'rgba(255,255,255,0.95)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="user_messages"
            name="Ты"
            stackId="1"
            stroke={TEAL}
            fill="url(#gUser)"
            strokeWidth={2}
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="assistant_messages"
            name="ИИ"
            stackId="1"
            stroke={LAV}
            fill="url(#gAsst)"
            strokeWidth={2}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
