import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { TESTS } from '../data/tests'
import { useAppStore } from '../store/appStore'
import { apiSaveTestResult, apiTestResult, ensureAuth } from '../api/client'

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

  const test = TESTS.find((t) => t.id === currentTestId)
  const isViewingHistory = !!openResultId

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

  useEffect(() => {
    if (isViewingHistory || !test || saved || saving) return
    setSaving(true)
    setError(null)
    ensureAuth()
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
          const msg =
            err === 'network'
              ? 'Ошибка сети. Откройте приложение из бота.'
              : err && (err.includes('Token') || err.includes('token') || err.includes('401'))
                ? 'Не удалось сохранить. Закройте приложение и откройте снова из бота.'
                : err || 'Не удалось сохранить'
          setError(msg)
        }
      })
      .catch(() => setError('Ошибка сети. Откройте приложение из бота.'))
      .finally(() => setSaving(false))
  }, [test, answers, saved, saving, isViewingHistory, setLastSavedResultId])

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

  if (!displayTest && !loadedResult) {
    if (!test) {
      onBack()
      return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col safe-area pb-6">
      <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl">
        <button type="button" onClick={handleBack} className="text-[var(--color-glow-teal)] font-medium">
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)]">
          Результат
        </h1>
        <span className="w-14" />
      </header>

      <motion.div
        className="glass-card p-5 max-w-[420px] mx-auto w-full mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Результат: {displayTest?.title ?? 'Тест'}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Средний балл по ответам: {avg.toFixed(1)} из 10.
          {!isViewingHistory && ' Результат сохранён в твоей истории.'}
        </p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-lavender)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'var(--color-text-secondary)' }} />
              <Radar name="Балл" dataKey="value" stroke="var(--color-glow-teal)" fill="var(--color-glow-teal)" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {saving && (
        <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4">Сохранение...</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 mb-4">{error}</p>
      )}
      {(saved || isViewingHistory) && (
        <motion.div
          className="max-w-[420px] mx-auto w-full px-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {saved && (
            <p className="text-center text-[var(--color-glow-teal)] font-medium mb-2">
              Результат сохранён ✅ Перейди в бота
            </p>
          )}
          {isViewingHistory && !saved && (
            <p className="text-center text-[var(--color-text-secondary)] font-medium mb-2">
              Перейди в бота
            </p>
          )}
          <button
            type="button"
            onClick={openBot}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-sunset-rose)] hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Открыть бота
          </button>
        </motion.div>
      )}
    </div>
  )
}
