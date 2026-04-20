import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import {
  apiSaveTestResult,
  apiTestResult,
  apiAiSuggestions,
  apiPathCoachIngestTestResult,
  ensureAuth,
  getInitDataString,
  loadBackendConfig,
  refreshInitData,
} from '../api/client'
import { ResultPremiumAiLoading } from '../components/ResultPremiumAiLoading'
import { goBackToBot, copyQuestionToClipboard } from '../utils/telegram'

function readVenCoachStored(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    return sessionStorage.getItem('pts_vcoach_return') === '1'
  } catch {
    return false
  }
}

/** Краткое описание результата по среднему баллу — в духе поддержки и тематики бота. */
function getScoreDescription(avg: number, _testTitle: string): string {
  if (avg <= 2.5) {
    return 'Уровень низкий. Это хорошая опора, чтобы замечать изменения и бережно поддерживать себя.'
  }
  if (avg <= 5) {
    return 'Умеренный уровень. Маленькие шаги и регулярная забота о себе помогают двигаться вперёд.'
  }
  if (avg <= 7.5) {
    return 'Заметный уровень. Важно давать себе отдых и обращаться к ресурсам, которые вас поддерживают.'
  }
  return 'Высокий уровень. Признание этого — уже шаг. Не стесняйтесь опираться на близких и специалистов.'
}

interface ResultProps {
  onBack: () => void
}

export function Result({ onBack }: ResultProps) {
  const authReady = useAuthStore((s) => s.isInitialized)
  const appSaveToken = useAuthStore((s) => s.appSaveToken)
  const queryClient = useQueryClient()
  const currentTestId = useAppStore((s) => s.currentTestId)
  const answers = useAppStore((s) => s.answers)
  const setLastSavedResultId = useAppStore((s) => s.setLastSavedResultId)
  const lastSavedResultId = useAppStore((s) => s.lastSavedResultId)
  const resetTest = useAppStore((s) => s.resetTest)
  const openResultId = useAppStore((s) => s.openResultId)
  const setOpenResultId = useAppStore((s) => s.setOpenResultId)
  const pathCoachReturnZustand = useAppStore((s) => s.pathCoachReturnAfterTest)
  const setPathCoachReturnAfterTest = useAppStore((s) => s.setPathCoachReturnAfterTest)
  const setScreen = useAppStore((s) => s.setScreen)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveStartedRef = useRef(false)
  const lastSaveKeyRef = useRef<string>('')
  const coachIngestSentRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (openResultId) return
    if (readVenCoachStored()) {
      useAppStore.getState().setPathCoachReturnAfterTest(true)
    }
  }, [openResultId])

  const pathCoachReturnAfterTest =
    pathCoachReturnZustand || (!openResultId && readVenCoachStored())

  const test = TESTS.find((t) => t.id === currentTestId)
  const isViewingHistory = !!openResultId
  const saveKey = test ? `${test.id}-${answers.length}` : ''

  const { data: loadedResult, isLoading: isLoadingResult } = useQuery({
    queryKey: ['test-result', openResultId ?? ''],
    queryFn: () => (openResultId ? apiTestResult(openResultId) : Promise.resolve(null)),
    enabled: !!openResultId,
  })

  const displayResult = loadedResult ?? null
  const displayTest = displayResult
    ? { title: displayResult.testTitle, id: displayResult.testId }
    : test
  const displayAnswers = displayResult?.answers ?? answers

  const isOpeningFromHistory = !!openResultId

  // Сохранение один раз при открытии экрана (результат теста). Без мерцания; при новом тесте сбрасываем ref.
  useEffect(() => {
    if (saveKey && saveKey !== lastSaveKeyRef.current) {
      lastSaveKeyRef.current = saveKey
      saveStartedRef.current = false
    }
    if (isViewingHistory || !test || saved || saving || saveStartedRef.current) return
    saveStartedRef.current = true
    loadBackendConfig()
      .then(() => {
        refreshInitData()
        return new Promise<void>((r) => setTimeout(r, 500))
      })
      .then(() => {
        setSaving(true)
        refreshInitData()
        return ensureAuth()
      })
      .then((token) => {
        return new Promise<string | null>((r) => setTimeout(() => r(token), 150))
      })
      .then(() =>
        apiSaveTestResult({
          testId: test.id,
          testTitle: test.title,
          answers,
          completedAt: new Date().toISOString(),
        })
      )
      .then((res) => {
        if ('id' in res && res.id) {
          setLastSavedResultId(res.id)
          setSaved(true)
          queryClient.invalidateQueries({ queryKey: ['test-history'] })
        } else {
          const err = 'error' in res ? String(res.error) : ''
          const noInitData = !getInitDataString()?.length
          const msg = noInitData
            ? 'В боте нажми «🌱 Путь к Себе», затем нажми кнопку под сообщением — откроется приложение с сохранением в бот.'
            : err === 'network'
              ? 'Нет связи. Открой приложение заново из бота (кнопка «🌱 Путь к Себе»).'
              : err && (err.includes('Token') || err.includes('token') || err.includes('401'))
                ? 'Сессия истекла. Закрой приложение и открой снова из бота.'
                : err || 'Не удалось сохранить. Открой приложение из бота.'
          setError(msg)
        }
      })
      .catch(() => {
        const noInitData = !getInitDataString()?.length
        setError(noInitData
          ? 'В боте нажми «🌱 Путь к Себе», затем кнопку под сообщением — откроется приложение с сохранением.'
          : 'Нет связи. В боте нажми «🌱 Путь к Себе» и кнопку под сообщением.')
      })
      .finally(() => setSaving(false))
  }, [saveKey, test, answers, saved, saving, isViewingHistory, setLastSavedResultId, queryClient])

  const avg = displayAnswers.length ? displayAnswers.reduce((a, b) => a + b, 0) / displayAnswers.length : 0
  const avgRounded = Math.round(avg * 10) / 10
  const scorePercent = Math.min(100, Math.max(0, (avg / 10) * 100))
  const description = getScoreDescription(avgRounded, displayTest?.title ?? '')

  // Точный resultId нужен, чтобы темы ИИ не генерировались повторно при повторном заходе.
  const suggestionsResultId = openResultId ?? lastSavedResultId

  const suggestionsQueryEnabled = !!(
    displayTest?.title &&
    displayAnswers.length > 0 &&
    authReady &&
    appSaveToken &&
    suggestionsResultId &&
    !pathCoachReturnAfterTest
  )

  const { data: suggestionsData, isLoading: aiSuggestionsLoading } = useQuery({
    queryKey: ['ai-suggestions-result', displayTest?.title ?? '', avgRounded, suggestionsResultId ?? ''],
    queryFn: () => apiAiSuggestions(displayTest?.title ?? '', avgRounded, suggestionsResultId),
    enabled: suggestionsQueryEnabled,
  })
  const aiSuggestions = suggestionsData?.suggestions ?? []
  const aiMovies = suggestionsData?.movies ?? []

  useEffect(() => {
    if (!saved || !pathCoachReturnAfterTest || !lastSavedResultId || !displayTest?.title) return
    const key = lastSavedResultId
    if (coachIngestSentRef.current === key) return
    coachIngestSentRef.current = key
    const narrative = getScoreDescription(avgRounded, displayTest.title)
    void apiPathCoachIngestTestResult({
      testTitle: displayTest.title,
      avgRounded,
      narrative,
    }).catch(() => {
      coachIngestSentRef.current = null
    })
  }, [saved, pathCoachReturnAfterTest, lastSavedResultId, displayTest?.title, avgRounded])

  const openBot = () => {
    goBackToBot()
  }

  const goToPathCoach = () => {
    setPathCoachReturnAfterTest(false)
    try {
      sessionStorage.removeItem('pts_vcoach_return')
    } catch {
      /* ignore */
    }
    setOpenResultId(null)
    resetTest()
    setScreen('pathCoach')
  }

  const handleBack = () => {
    setOpenResultId(null)
    resetTest()
    if (pathCoachReturnAfterTest) {
      setPathCoachReturnAfterTest(false)
      try {
        sessionStorage.removeItem('pts_vcoach_return')
      } catch {
        /* ignore */
      }
      setScreen('pathCoach')
    } else {
      onBack()
    }
  }

  const handleRetrySave = () => {
    if (!test) return
    setError(null)
    setSaving(true)
    loadBackendConfig()
      .then(() => ensureAuth())
      .then(() =>
        apiSaveTestResult({
          testId: test.id,
          testTitle: test.title,
          answers,
          completedAt: new Date().toISOString(),
        })
      )
      .then((res) => {
        if ('id' in res && res.id) {
          setLastSavedResultId(res.id)
          setSaved(true)
          queryClient.invalidateQueries({ queryKey: ['test-history'] })
        } else {
          setError(!getInitDataString()?.length
            ? 'В боте нажми «🌱 Путь к Себе», затем кнопку под сообщением.'
            : 'Не удалось сохранить. В боте нажми «🌱 Путь к Себе» и кнопку под сообщением.')
        }
      })
      .catch(() => setError(!getInitDataString()?.length
        ? 'В боте нажми «🌱 Путь к Себе», затем кнопку под сообщением.'
        : 'Нет связи. В боте нажми «🌱 Путь к Себе» и кнопку под сообщением.'))
      .finally(() => setSaving(false))
  }

  // Не вызывать onBack при открытии из истории, пока грузится результат — иначе сбрасывает на главную
  if (!isOpeningFromHistory && !displayTest && !test) {
    onBack()
    return null
  }
  if (isOpeningFromHistory && !isLoadingResult && !loadedResult && !displayTest) {
    onBack()
    return null
  }
  if (isOpeningFromHistory && isLoadingResult) {
    return (
      <div className="min-h-screen flex flex-col safe-area pb-8">
        <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl">
          <button type="button" onClick={() => { setOpenResultId(null); onBack() }} className="btn-ghost text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] px-2 -ml-1 rounded-xl">
            ← Назад
          </button>
          <h1 className="font-display flex-1 text-center text-base font-semibold" style={{ color: '#2d2a26' }}>
            Результат
          </h1>
          <span className="w-14" />
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-8" style={{ overflow: 'auto' }}>
      <header className="card-premium h-14 flex items-center px-4 mb-5 rounded-2xl flex-shrink-0">
        <button type="button" onClick={handleBack} className="btn-ghost text-[var(--color-glow-teal)] font-semibold min-h-[44px] min-w-[52px] px-2 -ml-1 rounded-xl">
          ← Назад
        </button>
        <h1 className="font-display flex-1 text-center text-base font-semibold" style={{ color: '#2d2a26' }}>
          Результат
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3" style={{ minHeight: 0 }}>
        {/* Карточка результата: балл, шкала, описание — в тематике бота */}
        <motion.div
          className="rounded-2xl p-5 mb-4 flex-shrink-0"
          /* Без opacity:0 — в Telegram WebView framer иногда не доанимирует, экран остаётся пустым */
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(249,245,255,0.9) 100%)',
            border: '1px solid rgba(201,184,232,0.4)',
            boxShadow: '0 4px 24px rgba(45,42,38,0.08)',
          }}
        >
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
            {displayTest?.title ?? 'Тест'}
          </h2>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Средний балл: <strong style={{ color: 'var(--color-glow-teal)' }}>{avgRounded}</strong> из 10
          </p>
          {/* Горизонтальная шкала 0–10 с заполнением до балла */}
          <div className="w-full mb-4">
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{
                background: 'rgba(201,184,232,0.35)',
                border: '1px solid rgba(201,184,232,0.5)',
              }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  background: 'linear-gradient(90deg, var(--color-glow-teal) 0%, var(--color-lavender) 100%)',
                  boxShadow: '0 0 12px rgba(125,211,192,0.4)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <span>0</span>
              <span>10</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {description}
          </p>
        </motion.div>

        {/* Одна секция статуса: сохранение | успех | ошибка — без наложения */}
        <div className="flex-shrink-0 space-y-3">
          {saving && (
            <p className="text-center text-sm py-2" style={{ color: '#5a5550' }}>
              Сохранение…
            </p>
          )}

          {!saving && saved && (
            <div className="space-y-4">
              <p className="text-center text-sm font-medium py-2" style={{ color: '#0d9488' }}>
                Результат сохранён в истории ✅
              </p>
              {pathCoachReturnAfterTest ? (
                <>
                  <motion.div
                    className="rounded-2xl p-5"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background:
                        'linear-gradient(155deg, rgba(255,255,255,0.96) 0%, rgba(238,230,252,0.94) 50%, rgba(222,210,245,0.9) 100%)',
                      border: '1px solid rgba(155,130,200,0.42)',
                      boxShadow: '0 10px 36px rgba(75,55,115,0.14)',
                    }}
                  >
                    <h4 className="font-display text-base font-bold mb-2" style={{ color: '#3a2d4d' }}>
                      Продолжим в чате с ИИ-Венерой
                    </h4>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                      Краткий итог теста и твой средний балл уже добавлены в диалог с Венерой — можно сразу продолжить
                      разбор там, без отдельных фраз для чата в боте.
                    </p>
                    <motion.button
                      type="button"
                      onClick={goToPathCoach}
                      className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white mb-3 min-h-[52px]"
                      style={{
                        background: 'linear-gradient(135deg, #9578c4 0%, #6b5090 45%, #5a4578 100%)',
                        boxShadow: '0 10px 30px rgba(80,55,120,0.38)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.015 }}
                    >
                      Вернуться к Венере
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => {
                        setPathCoachReturnAfterTest(false)
                        onBack()
                      }}
                      className="w-full py-2.5 px-4 rounded-xl btn-secondary text-sm font-semibold"
                    >
                      На главную приложения
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    className="rounded-2xl p-4"
                    initial={{ y: 8 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 }}
                    style={{
                      background: 'linear-gradient(145deg, rgba(125,211,192,0.15) 0%, rgba(201,184,232,0.12) 100%)',
                      border: '1px solid rgba(125,211,192,0.35)',
                    }}
                  >
                    <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-forest-dark)' }}>
                      Что дальше?
                    </h4>
                    <ul className="space-y-2 text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      <li className="flex gap-2">
                        <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                        <span>Терапия и регулярные практики усиливают эффект — в боте есть поддержка и инструменты для каждого дня.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                        <span>Чек-ины, аффирмации и ИИ-поддержка помогут закрепить прогресс и замечать изменения.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                        <span>Твоя дорога к себе продолжается в боте — открой его и сделай следующий шаг.</span>
                      </li>
                    </ul>
                    {(aiSuggestionsLoading || aiSuggestions.length > 0) && (
                      <AnimatePresence mode="wait" initial={false}>
                        {aiSuggestionsLoading ? (
                          <motion.div
                            key="ai-suggestions-loading"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          >
                            <ResultPremiumAiLoading withTopDivider />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="ai-suggestions-ready"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.32, ease: 'easeOut' }}
                          >
                            <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
                              Проработать с ИИ в боте:
                            </h5>
                            <p className="text-xs mb-1.5" style={{ color: 'var(--color-glow-teal)' }}>
                              Нажми на фразу — скопируется
                            </p>
                            <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                              {aiSuggestions.slice(0, 4).map((s, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                                  <button
                                    type="button"
                                    onClick={() => copyQuestionToClipboard(s)}
                                    className="copyable-question text-left flex-1 min-h-[44px] py-1.5 px-2 -mx-2 rounded-lg"
                                  >
                                    {s}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                    {aiMovies.length > 0 && (
                      <motion.div
                        className="mt-4 pt-4"
                        initial={{ y: 6 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ borderTop: '1px solid rgba(125,211,192,0.3)' }}
                      >
                        <h5 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-forest-dark)' }}>
                          🎬 Фильмы, которые могут откликнуться в твоём состоянии
                        </h5>
                        <div className="space-y-3">
                          {aiMovies.slice(0, 3).map((movie) => (
                            <div
                              key={movie.id}
                              className="rounded-xl p-3.5"
                              style={{
                                background: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(201,184,232,0.35)',
                                boxShadow: '0 2px 12px rgba(45,42,38,0.06)',
                              }}
                            >
                              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-forest-dark)' }}>
                                {movie.title}{movie.year ? ` • ${movie.year}` : ''}
                              </p>
                              <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                {movie.director && `Режиссёр: ${movie.director}`}
                                {Array.isArray(movie.actors) && movie.actors.length > 0 && ` • ${movie.actors.join(', ')}`}
                              </p>
                              <p className="text-xs leading-relaxed mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                                {movie.plot}
                              </p>
                              <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-glow-teal)' }}>
                                {movie.whyWatch}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Фильмы не заменяют работу со специалистом, но могут помочь мягче прожить своё состояние 💛
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                  <button type="button" onClick={openBot} className="w-full py-3.5 px-4 rounded-xl btn-primary font-semibold">
                    Вернуться в бота
                  </button>
                </>
              )}
            </div>
          )}

          {!saving && error && (
            <div className="space-y-3">
              <p className="text-center text-sm py-2" style={{ color: '#b91c1c' }}>
                {error}
              </p>
              <button type="button" onClick={handleRetrySave} className="w-full py-2.5 px-4 rounded-xl btn-secondary font-medium">
                Повторить сохранение
              </button>
            </div>
          )}

          {!saving && !saved && !error && isViewingHistory && (
            <div className="space-y-3">
              {(aiSuggestionsLoading || aiSuggestions.length > 0) && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(125,211,192,0.12) 0%, rgba(201,184,232,0.1) 100%)',
                    border: '1px solid rgba(125,211,192,0.3)',
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {aiSuggestionsLoading ? (
                      <motion.div
                        key="ai-suggestions-loading-history"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <ResultPremiumAiLoading />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ai-suggestions-ready-history"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.32, ease: 'easeOut' }}
                      >
                        <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
                          Проработать с ИИ в боте:
                        </h5>
                        <p className="text-xs mb-1.5" style={{ color: 'var(--color-glow-teal)' }}>
                          Нажми на фразу — скопируется
                        </p>
                        <ul className="space-y-1 text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
                          {aiSuggestions.slice(0, 4).map((s, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                              <button
                                type="button"
                                onClick={() => copyQuestionToClipboard(s)}
                                className="copyable-question text-left flex-1 min-h-[44px] py-1.5 px-2 -mx-2 rounded-lg"
                              >
                                {s}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {aiMovies.length > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(249,245,255,0.75) 100%)',
                    border: '1px solid rgba(201,184,232,0.35)',
                  }}
                >
                  <h5 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-forest-dark)' }}>
                    🎬 Фильмы, которые могут откликнуться
                  </h5>
                  <div className="space-y-3">
                    {aiMovies.slice(0, 3).map((movie) => (
                      <div
                        key={movie.id}
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(201,184,232,0.3)',
                        }}
                      >
                        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-forest-dark)' }}>
                          {movie.title}{movie.year ? ` • ${movie.year}` : ''}
                        </p>
                        <p className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          {movie.director && `Режиссёр: ${movie.director}`}
                          {Array.isArray(movie.actors) && movie.actors.length > 0 && ` • ${movie.actors.join(', ')}`}
                        </p>
                        <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--color-text-primary)' }}>
                          {movie.plot}
                        </p>
                        <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-glow-teal)' }}>
                          {movie.whyWatch}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Фильмы не заменяют работу со специалистом 💛
                  </p>
                </div>
              )}
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                Продолжить путь и получить поддержку — в боте.
              </p>
              <button type="button" onClick={openBot} className="w-full py-3.5 px-4 rounded-xl btn-primary font-semibold">
                Вернуться в бота
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
