import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import { apiSaveTestResult, apiTestResult, apiAiSuggestions, ensureAuth, getInitDataString, loadBackendConfig, refreshInitData } from '../api/client'
import { goBackToBot } from '../utils/telegram'

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
  const queryClient = useQueryClient()
  const currentTestId = useAppStore((s) => s.currentTestId)
  const answers = useAppStore((s) => s.answers)
  const setLastSavedResultId = useAppStore((s) => s.setLastSavedResultId)
  const resetTest = useAppStore((s) => s.resetTest)
  const openResultId = useAppStore((s) => s.openResultId)
  const setOpenResultId = useAppStore((s) => s.setOpenResultId)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveStartedRef = useRef(false)
  const lastSaveKeyRef = useRef<string>('')

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

  const { data: suggestionsData } = useQuery({
    queryKey: ['ai-suggestions-result', displayTest?.title ?? '', avgRounded],
    queryFn: () => apiAiSuggestions(displayTest?.title ?? '', avgRounded),
    enabled: !!(displayTest?.title && displayAnswers.length > 0),
  })
  const aiSuggestions = suggestionsData?.suggestions ?? []

  const openBot = () => {
    goBackToBot()
  }

  const handleBack = () => {
    setOpenResultId(null)
    resetTest()
    onBack()
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
        <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl">
          <button type="button" onClick={() => { setOpenResultId(null); onBack() }} className="text-[var(--color-glow-teal)] font-medium">
            ← Назад
          </button>
          <h1 className="flex-1 text-center text-base font-semibold" style={{ color: '#2d2a26' }}>Результат</h1>
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
      <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl flex-shrink-0">
        <button type="button" onClick={handleBack} className="text-[var(--color-glow-teal)] font-medium">
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold" style={{ color: '#2d2a26' }}>
          Результат
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3" style={{ minHeight: 0 }}>
        {/* Карточка результата: балл, шкала, описание — в тематике бота */}
        <motion.div
          className="rounded-2xl p-5 mb-4 flex-shrink-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
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
              <motion.div
                className="rounded-2xl p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
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
                {aiSuggestions.length > 0 && (
                  <>
                    <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
                      Проработать с ИИ в боте:
                    </h5>
                    <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {aiSuggestions.slice(0, 4).map((s, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
              <button
                type="button"
                onClick={openBot}
                className="w-full py-3.5 px-4 rounded-xl font-semibold border-0 shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
                style={{ background: 'var(--color-sunset-rose)', color: 'var(--color-text-primary)' }}
              >
                Вернуться в бота
              </button>
            </div>
          )}

          {!saving && error && (
            <div className="space-y-3">
              <p className="text-center text-sm py-2" style={{ color: '#b91c1c' }}>
                {error}
              </p>
              <button
                type="button"
                onClick={handleRetrySave}
                className="w-full py-2.5 px-4 rounded-xl font-medium border-2"
                style={{ borderColor: 'var(--color-lavender)', color: '#2d2a26' }}
              >
                Повторить сохранение
              </button>
            </div>
          )}

          {!saving && !saved && !error && isViewingHistory && (
            <div className="space-y-3">
              {aiSuggestions.length > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(125,211,192,0.12) 0%, rgba(201,184,232,0.1) 100%)',
                    border: '1px solid rgba(125,211,192,0.3)',
                  }}
                >
                  <h5 className="text-xs font-semibold mb-2" style={{ color: 'var(--color-forest-dark)' }}>
                    Проработать с ИИ в боте:
                  </h5>
                  <ul className="space-y-1 text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {aiSuggestions.slice(0, 4).map((s, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-[var(--color-glow-teal)] shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                Продолжить путь и получить поддержку — в боте.
              </p>
              <button
                type="button"
                onClick={openBot}
                className="w-full py-3.5 px-4 rounded-xl font-semibold border-0 shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
                style={{ background: 'var(--color-sunset-rose)', color: 'var(--color-text-primary)' }}
              >
                Вернуться в бота
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
