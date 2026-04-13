import { useCallback, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PremiumCard } from '../PremiumCard'
import { IconNeuroArena } from '../FeatureIcons'
import { apiNeuroArenaSessionEnd, apiNeuroArenaStatus } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { GameDotProbe, type DotProbeResult } from './GameDotProbe'
import { GameScenarios, type ScenariosResult } from './GameScenarios'

type View = 'lobby' | 'dotprobe' | 'scenarios' | 'result'

type ResultState = {
  game: 'dotprobe' | 'scenarios'
  payload: DotProbeResult | ScenariosResult
  saved: boolean
  error?: string
}

const MAX_GAMES_PER_VISIT = 3

export function NeuroArenaScreen({ onBack }: { onBack: () => void }) {
  const reduce = useReducedMotion()
  const queryClient = useQueryClient()
  const authReady = useAuthStore((s) => s.isInitialized)
  const isPremium = useAuthStore((s) => s.isPremium)
  const [view, setView] = useState<View>('lobby')
  const [result, setResult] = useState<ResultState | null>(null)
  const gamesThisVisit = useRef(0)

  const {
    data: status,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['neuro-arena-status'],
    queryFn: apiNeuroArenaStatus,
    enabled: authReady,
    staleTime: 30_000,
    retry: 1,
  })

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['neuro-arena-status'] })
  }, [queryClient])

  const stOk = status && 'status' in status && status.status === 'ok' ? status : null
  const statusErr = status && 'error' in status ? status.error : null
  const canPlayDot =
    !!stOk && (isPremium === true || (stOk.limits.dotprobeRemaining ?? 0) > 0)
  const canPlaySc =
    !!stOk && (isPremium === true || (stOk.limits.scenariosRemaining ?? 0) > 0)

  const pushResult = useCallback(
    async (game: 'dotprobe' | 'scenarios', payload: DotProbeResult | ScenariosResult) => {
      gamesThisVisit.current += 1
      setResult({ game, payload, saved: false })
      setView('result')
      const r = await apiNeuroArenaSessionEnd({
        gameType: game,
        score: payload.score,
        accuracy: payload.accuracy,
        avgReactionMs: 'avgReactionMs' in payload && payload.avgReactionMs != null ? payload.avgReactionMs : null,
        stimuliCount: payload.stimuliCount,
        playtimeSec: payload.playtimeSec,
      })
      if ('ok' in r && r.ok) {
        setResult((prev) => (prev ? { ...prev, saved: true, error: undefined } : prev))
        refresh()
      } else if ('limit' in r && r.limit) {
        setResult((prev) => (prev ? { ...prev, error: r.error || 'Лимит', saved: false } : prev))
      } else {
        setResult((prev) =>
          prev ? { ...prev, error: 'error' in r ? r.error : 'Ошибка сохранения', saved: false } : prev,
        )
      }
    },
    [refresh],
  )

  if (view === 'dotprobe') {
    return (
      <GameDotProbe
        onBack={() => setView('lobby')}
        onComplete={(r) => {
          void pushResult('dotprobe', r)
        }}
      />
    )
  }
  if (view === 'scenarios') {
    return (
      <GameScenarios
        onBack={() => setView('lobby')}
        onComplete={(r) => {
          void pushResult('scenarios', r)
        }}
      />
    )
  }

  if (view === 'result' && result) {
    const p = result.payload
    const title = result.game === 'dotprobe' ? 'Детектор внимания' : 'Сценарии'
    return (
      <div className="min-h-screen flex flex-col safe-area px-3 pb-8 max-w-[420px] mx-auto w-full">
        <motion.header
          className="header-app-glass h-14 flex items-center justify-between px-2 mb-4 rounded-2xl"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            type="button"
            onClick={() => {
              setView('lobby')
              setResult(null)
            }}
            className="btn-ghost min-h-[44px] px-3 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          >
            В лобби
          </button>
          <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Готово
          </h1>
          <span className="w-12" />
        </motion.header>

        <PremiumCard accent="mint" delay={0}>
          <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">{title}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm text-[var(--color-text-secondary)] mb-4">
            <div className="rounded-xl bg-white/35 px-3 py-2 border border-white/40">
              <div className="text-xs uppercase tracking-wide opacity-75">Очки</div>
              <div className="text-xl font-bold font-display text-[var(--color-glow-teal-dim)] tabular-nums">
                {p.score}
              </div>
            </div>
            <div className="rounded-xl bg-white/35 px-3 py-2 border border-white/40">
              <div className="text-xs uppercase tracking-wide opacity-75">Точность</div>
              <div className="text-xl font-bold font-display text-[var(--color-forest-dark)] tabular-nums">
                {p.accuracy}%
              </div>
            </div>
            {result.game === 'dotprobe' && 'avgReactionMs' in p && (
              <div className="rounded-xl bg-white/35 px-3 py-2 border border-white/40 col-span-2">
                <div className="text-xs uppercase tracking-wide opacity-75">Средняя реакция</div>
                <div className="text-lg font-bold font-display tabular-nums">{p.avgReactionMs} мс</div>
              </div>
            )}
          </div>
          {result.error && (
            <p className="text-sm text-amber-950/90 mb-3 bg-amber-100/55 rounded-xl px-3 py-2 border border-amber-200/50">
              {result.error}
            </p>
          )}
          {result.saved ? (
            <p className="text-sm text-[var(--color-glow-teal-dim)] font-medium mb-3">Результат сохранён ✓</p>
          ) : (
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">Сохранение…</p>
          )}
          <button
            type="button"
            onClick={() => {
              setView('lobby')
              setResult(null)
            }}
            className="w-full py-3 rounded-xl btn-primary font-semibold"
          >
            Закрыть
          </button>
        </PremiumCard>

        <p className="text-xs text-center text-[var(--color-text-secondary)] leading-relaxed px-2 mt-4">
          Нейро-Арена не заменяет консультацию специалиста. При дискомфорте сделай паузу.
        </p>
      </div>
    )
  }

  const prog = stOk?.progress ?? null
  const lim = stOk?.limits ?? null

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <motion.header
        className="header-app-glass h-14 flex items-center justify-between px-4 mb-4 rounded-2xl mx-3"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
        >
          ← Назад
        </button>
        <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Нейро-Арена
        </h1>
        <span className="w-14" />
      </motion.header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-8">
        <PremiumCard accent="lavender" delay={0}>
          <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-1.5 flex items-start gap-2.5 tracking-tight leading-snug">
            <IconNeuroArena className="shrink-0 mt-0.5 text-[#7b6bb8]" aria-hidden />
            <span>Тренажёры внимания и интерпретации</span>
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            Два разных формата: быстрый «детектор» на переключение внимания и неспешные сценарии — выбор менее тяжёлого
            прочтения неоднозначной ситуации. Обратная связь после каждой сессии. Не диагностика и не лечение.
          </p>
          {gamesThisVisit.current >= MAX_GAMES_PER_VISIT && (
            <p className="text-sm rounded-xl bg-amber-100/45 border border-amber-200/60 px-3 py-2 mb-1 text-amber-950/90">
              Отличная серия. Сделай паузу — глазам и нервной системе полезен отдых.
            </p>
          )}
        </PremiumCard>

        {!authReady ? (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">Подключаемся к боту…</p>
        ) : isLoading && !status ? (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">Загрузка…</p>
        ) : statusErr || (!stOk && status) ? (
          <PremiumCard accent="rose" delay={0.02}>
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-4">
              {statusErr ||
                'Не удалось загрузить данные Нейро-Арены. Если вы только что обновили приложение, подождите несколько минут и обновите страницу.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="w-full py-3 rounded-xl btn-primary font-semibold disabled:opacity-50"
            >
              {isFetching ? 'Повтор…' : 'Повторить'}
            </button>
          </PremiumCard>
        ) : stOk ? (
          <>
            <PremiumCard accent="coral" delay={0.04}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-3">
                Прогресс
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white/30 px-3 py-2 border border-white/35">
                  <div className="text-[var(--color-text-secondary)] text-xs">Серия дней</div>
                  <div className="font-display font-bold text-lg text-[var(--color-glow-teal-dim)] tabular-nums">
                    {prog?.streakDays ?? 0}
                  </div>
                </div>
                <div className="rounded-xl bg-white/30 px-3 py-2 border border-white/35">
                  <div className="text-[var(--color-text-secondary)] text-xs">Минут всего</div>
                  <div className="font-display font-bold text-lg text-[var(--color-forest-dark)] tabular-nums">
                    {prog?.totalMinutes ?? 0}
                  </div>
                </div>
                <div className="rounded-xl bg-white/30 px-3 py-2 border border-white/35">
                  <div className="text-[var(--color-text-secondary)] text-xs">Рекорд «Детектор»</div>
                  <div className="font-bold tabular-nums">{prog?.dotprobeBest ?? 0}</div>
                </div>
                <div className="rounded-xl bg-white/30 px-3 py-2 border border-white/35">
                  <div className="text-[var(--color-text-secondary)] text-xs">Рекорд «Сценарии»</div>
                  <div className="font-bold tabular-nums">{prog?.scenariosBest ?? 0}</div>
                </div>
              </div>
              {isPremium === false && lim && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-3 leading-relaxed">
                  Без премиума: до {lim.freePerDayDotprobe} сессии «Детектор» и {lim.freePerDayScenarios} «Сценарии» в
                  сутки. С премиумом — без лимита.
                </p>
              )}
            </PremiumCard>

            <PremiumCard accent="mint" delay={0.07}>
              <div className="neuro-arena-mode neuro-arena-mode--detector">
                <p className="neuro-arena-mode__kicker">Скорость · dot-probe</p>
                <h4 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
                  Детектор внимания
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                  Пара картинок и мишень: нужно быстро нажать там, где была нейтральная картинка — тренируется увод
                  внимания с отрицательного стимула.
                </p>
              </div>
              <button
                type="button"
                disabled={!canPlayDot || gamesThisVisit.current >= MAX_GAMES_PER_VISIT}
                onClick={() => setView('dotprobe')}
                className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-45"
              >
                {canPlayDot ? 'Открыть' : 'Лимит на сегодня'}
              </button>
            </PremiumCard>

            <PremiumCard accent="rose" delay={0.1}>
              <div className="neuro-arena-mode neuro-arena-mode--scenarios">
                <p className="neuro-arena-mode__kicker">Смысл · CBM-I</p>
                <h4 className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
                  Сценарии
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                  Короткий текст и два завершения: выбери то, что сейчас кажется мягче — тренируется гибкость
                  интерпретации, не «правильный ответ из учебника».
                </p>
              </div>
              <button
                type="button"
                disabled={!canPlaySc || gamesThisVisit.current >= MAX_GAMES_PER_VISIT}
                onClick={() => setView('scenarios')}
                className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-45"
              >
                {canPlaySc ? 'Открыть' : 'Лимит на сегодня'}
              </button>
            </PremiumCard>
          </>
        ) : (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-6">Загрузка…</p>
        )}
      </div>
    </div>
  )
}
