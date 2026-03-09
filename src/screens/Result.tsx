import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import { apiSaveTestResult, apiTestResult, ensureAuth, getInitDataString, loadBackendConfig, refreshInitData } from '../api/client'

interface ResultProps {
  onBack: () => void
}

const BOT_LINK = 'https://t.me/CozyReset_bot'

export function Result({ onBack }: ResultProps) {
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

  const { data: loadedResult } = useQuery({
    queryKey: ['test-result', openResultId ?? ''],
    queryFn: () => (openResultId ? apiTestResult(openResultId) : Promise.resolve(null)),
    enabled: !!openResultId,
  })

  const displayResult = loadedResult ?? null
  const displayTest = displayResult
    ? { title: displayResult.testTitle, id: displayResult.testId }
    : test
  const displayAnswers = displayResult?.answers ?? answers

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
  }, [saveKey, test, answers, saved, saving, isViewingHistory, setLastSavedResultId])

  const avg = displayAnswers.length ? displayAnswers.reduce((a, b) => a + b, 0) / displayAnswers.length : 0
  const radarData = [{ subject: 'Общий', value: avg, fullMark: 10 }]

  const openBot = () => {
    window.Telegram?.WebApp?.openTelegramLink?.(BOT_LINK)
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

  if (!displayTest && !loadedResult && !test) {
    onBack()
    return null
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
        {/* Карточка результата — одна секция, без наложения */}
        <div
          className="rounded-2xl p-5 mb-4 flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: '#2d2a26' }}>
            {displayTest?.title ?? 'Тест'}
          </h2>
          <p className="text-sm mb-4" style={{ color: '#5a5550' }}>
            Средний балл: {avg.toFixed(1)} из 10
          </p>
          <div className="w-full" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-lavender)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5a5550', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#5a5550' }} />
                <Radar name="Балл" dataKey="value" stroke="var(--color-glow-teal)" fill="var(--color-glow-teal)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Одна секция статуса: сохранение | успех | ошибка — без наложения */}
        <div className="flex-shrink-0 space-y-3">
          {saving && (
            <p className="text-center text-sm py-2" style={{ color: '#5a5550' }}>
              Сохранение…
            </p>
          )}

          {!saving && saved && (
            <div className="space-y-3">
              <p className="text-center text-sm font-medium py-2" style={{ color: '#0d9488' }}>
                Результат сохранён в истории ✅
              </p>
              <button
                type="button"
                onClick={openBot}
                className="w-full py-3.5 px-4 rounded-xl font-semibold rounded-xl border-0"
                style={{ background: 'var(--color-sunset-rose)', color: '#2d2a26' }}
              >
                Открыть бота
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
            <button
              type="button"
              onClick={openBot}
              className="w-full py-3.5 px-4 rounded-xl font-semibold border-0"
              style={{ background: 'var(--color-sunset-rose)', color: '#2d2a26' }}
            >
              Открыть бота
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
