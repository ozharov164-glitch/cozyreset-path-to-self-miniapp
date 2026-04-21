import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import {
  apiSaveTestResult,
  apiTestResult,
  apiPathCoachIngestTestResult,
  ensureAuth,
  getInitDataString,
  loadBackendConfig,
  refreshInitData,
} from '../api/client'
import { VenusCoachNudgeCard } from '../components/VenusCoachNudgeCard'
import { goBackToBot } from '../utils/telegram'

function readVenCoachStored(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  try {
    return sessionStorage.getItem('pts_vcoach_return') === '1'
  } catch {
    return false
  }
}

/** PathCoach опрашивает историю, пока на сервере не появится разбор после теста / «Ритма сердца». */
function setPendingVenusAnalysisFlag(): void {
  try {
    sessionStorage.setItem('pts_venus_result_pending', '1')
  } catch {
    /* ignore */
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
  const reduceMotion = useReducedMotion()
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
          setPendingVenusAnalysisFlag()
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

  useEffect(() => {
    if (!saved || !lastSavedResultId || !displayTest?.title) return
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
  }, [saved, lastSavedResultId, displayTest?.title, avgRounded])

  const openBot = () => {
    goBackToBot()
  }

  const goToPathCoach = () => {
    setOpenResultId(null)
    resetTest()
    setPendingVenusAnalysisFlag()
    setScreen('pathCoach')
    setPathCoachReturnAfterTest(false)
    // pts_vcoach_return не трогаем здесь — снимает PathCoach после загрузки истории, чтобы не сорвать ingest.
  }

  const handleBack = () => {
    setOpenResultId(null)
    resetTest()
    if (pathCoachReturnAfterTest) {
      setPathCoachReturnAfterTest(false)
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
          setPendingVenusAnalysisFlag()
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
              <motion.p
                className="text-center text-sm font-medium py-2"
                style={{ color: '#0d9488' }}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                Результат сохранён в истории ✅
              </motion.p>
              {pathCoachReturnAfterTest ? (
                  <motion.div
                    key="path-coach-venus-nudge"
                    className="relative pt-1"
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 26, scale: 0.96, filter: 'blur(10px)' }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    transition={
                      reduceMotion
                        ? { duration: 0.22, delay: 0.12 }
                        : { duration: 0.62, delay: 0.38, ease: [0.22, 1, 0.36, 1] }
                    }
                  >
                    {!reduceMotion && (
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute -left-2 -right-2 -top-2 bottom-0 rounded-[1.75rem] bg-gradient-to-b from-[#c4aedc]/35 via-[#e8dff8]/12 to-transparent blur-2xl"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    <div
                      className="relative rounded-2xl p-5 overflow-hidden ring-1 ring-white/60"
                      style={{
                        background:
                          'linear-gradient(155deg, rgba(255,255,255,0.97) 0%, rgba(240,232,252,0.95) 48%, rgba(224,210,246,0.92) 100%)',
                        border: '1px solid rgba(155,130,200,0.38)',
                        boxShadow: '0 12px 40px rgba(75,55,115,0.16), inset 0 1px 0 rgba(255,255,255,0.75)',
                      }}
                    >
                      {!reduceMotion && (
                        <motion.span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent"
                          initial={{ opacity: 0, scaleX: 0.2 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.55, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                      <motion.h4
                        className="font-display text-base font-bold mb-2"
                        style={{ color: '#3a2d4d' }}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.2, delay: 0.55 }
                            : { type: 'spring', stiffness: 400, damping: 28, delay: 0.58 }
                        }
                      >
                        Продолжим в чате с ИИ-Венерой
                      </motion.h4>
                      <motion.p
                        className="text-sm leading-relaxed mb-5"
                        style={{ color: 'var(--color-text-secondary)' }}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.2, delay: 0.62 }
                            : { type: 'spring', stiffness: 380, damping: 30, delay: 0.68 }
                        }
                      >
                        Краткий итог теста и твой средний балл уже добавлены в диалог с Венерой — можно сразу продолжить
                        разбор там, без отдельных фраз для чата в боте.
                      </motion.p>
                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={goToPathCoach}
                          className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white min-h-[52px]"
                          style={{
                            background: 'linear-gradient(135deg, #9d82c9 0%, #7352a0 42%, #5c4385 100%)',
                            boxShadow: '0 10px 32px rgba(80,55,120,0.4), inset 0 1px 0 rgba(255,255,255,0.22)',
                          }}
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.2, delay: 0.7 }
                              : { type: 'spring', stiffness: 360, damping: 26, delay: 0.76 }
                          }
                          whileTap={reduceMotion ? {} : { scale: 0.98 }}
                          whileHover={reduceMotion ? {} : { scale: 1.02, y: -1 }}
                        >
                          Вернуться к Венере
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setPathCoachReturnAfterTest(false)
                            onBack()
                          }}
                          className="w-full py-2.5 px-4 rounded-xl btn-secondary text-sm font-semibold"
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.2, delay: 0.78 }
                              : { type: 'spring', stiffness: 340, damping: 28, delay: 0.84 }
                          }
                          whileTap={reduceMotion ? {} : { scale: 0.99 }}
                        >
                          На главную приложения
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
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
                        <span>Чек-ины, аффирмации и ИИ-Венера в приложении помогут закрепить прогресс и замечать изменения.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                        <span>Твоя дорога к себе продолжается в боте — открой его и сделай следующий шаг.</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-1">
                      <VenusCoachNudgeCard className="!mb-0 shadow-none" />
                    </div>
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
              <VenusCoachNudgeCard />
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                Продолжить путь — в боте или в чате с Венерой в приложении.
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
