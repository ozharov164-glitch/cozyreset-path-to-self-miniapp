import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { SPECIALIST_BRIEF_QUESTIONS } from '../data/specialistBriefQuestions'
import { apiSpecialistBriefGenerate } from '../api/client'
import { downloadSpecialistPdf } from '../utils/specialistBriefDownload'
import { goBackToBot } from '../utils/telegram'

type AnswersMap = Record<string, string>

const initialAnswers = (): AnswersMap =>
  Object.fromEntries(SPECIALIST_BRIEF_QUESTIONS.map((q) => [q.id, '']))

interface SpecialistBriefProps {
  onBack: () => void
}

export function SpecialistBrief({ onBack }: SpecialistBriefProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = SPECIALIST_BRIEF_QUESTIONS.length
  const current = SPECIALIST_BRIEF_QUESTIONS[step]
  const filledCount = useMemo(
    () => Object.values(answers).filter((v) => v.trim().length > 0).length,
    [answers],
  )
  const canSubmit = filledCount >= 2

  const setCurrentAnswer = (v: string) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: v }))
  }

  const handleGenerate = async () => {
    setError(null)
    if (!canSubmit) {
      setError('Заполни хотя бы два ответа.')
      return
    }
    setBusy(true)
    try {
      const payload = SPECIALIST_BRIEF_QUESTIONS.map((q) => ({
        id: q.id,
        answer: (answers[q.id] || '').trim(),
      }))
      const res = await apiSpecialistBriefGenerate(payload)
      if ('error' in res) {
        setError(res.error)
        return
      }
      downloadSpecialistPdf(res.downloadUrl, res.fileName)
      const tg = window.Telegram?.WebApp
      if (res.aiGenerated) {
        tg?.showAlert?.('PDF готов. В документе — твои ответы и сжатый текст для разговора со специалистом.')
      } else {
        tg?.showAlert?.(
          'PDF готов с твоими ответами. Сейчас оформление ИИ недоступно — при следующем разе попробуй снова.',
        )
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col safe-area">
      <header className="card-premium h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : onBack())}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          {step > 0 ? '← Назад' : '← Дашборд'}
        </button>
        <h1 className="font-display text-sm font-bold text-[var(--color-text-primary)] tracking-tight text-center px-1">
          К специалисту
        </h1>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] text-xs font-medium text-[var(--color-glow-teal)] px-2"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-8">
        <motion.div
          className="card-premium p-5 mb-4"
          key={current?.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">
            Вопрос {step + 1} из {total}
          </p>
          <h2 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-4 leading-snug">
            {current?.text}
          </h2>
          <textarea
            value={answers[current?.id || ''] || ''}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Напиши коротко или развёрнуто — как тебе комфортно…"
            maxLength={2000}
            rows={6}
            className="w-full rounded-xl border border-[var(--color-lavender)]/40 bg-white/80 px-3 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 resize-y min-h-[140px]"
          />
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">
            {(answers[current?.id || ''] || '').length}/2000 · можно пропустить и вернуться позже
          </p>
        </motion.div>

        {error && (
          <p className="text-sm text-red-700/90 mb-3 px-1" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2 mt-auto">
          {step < total - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
              className="flex-1 py-3.5 rounded-xl btn-primary min-h-[48px] font-semibold"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Далее
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={busy || !canSubmit}
              className="flex-1 py-3.5 rounded-xl btn-premium-glow min-h-[48px] font-semibold disabled:opacity-50"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {busy ? 'Формируем PDF…' : 'Скачать PDF'}
            </button>
          )}
        </div>

        <p className="text-[11px] text-[var(--color-text-secondary)] mt-4 leading-relaxed px-1">
          Документ для разговора с психологом или коучем — не диагноз. При остром кризисе звони 112 или линию доверия.
        </p>
      </div>
    </div>
  )
}
