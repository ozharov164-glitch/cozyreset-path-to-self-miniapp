import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()
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

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.85 }

  const cardTransition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const }

  const setCurrentAnswer = (v: string) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: v }))
  }

  const goNext = () => setStep((s) => Math.min(s + 1, total - 1))
  const goSkip = () => goNext()

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

  const progress = ((step + 1) / total) * 100

  return (
    <div className="min-h-screen flex flex-col safe-area relative overflow-x-hidden">
      {/* Локальные «блики» для экрана (поверх AmbientBackground) */}
      {!reduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -top-6 right-[-20%] w-[55vw] max-w-[220px] h-[220px] rounded-full opacity-[0.18]"
            style={{
              background: 'radial-gradient(circle, rgba(107, 196, 181, 0.55) 0%, transparent 68%)',
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.14, 0.22, 0.14] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-[18%] -left-[15%] w-[50vw] max-w-[200px] h-[200px] rounded-full opacity-[0.14]"
            style={{
              background: 'radial-gradient(circle, rgba(184, 164, 224, 0.5) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.06, 1], x: [0, 6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </>
      )}

      <header className="relative z-[1] card-premium h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
        <motion.button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : onBack())}
          className="min-h-[44px] min-w-[52px] flex items-center justify-center py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          {step > 0 ? '← Назад' : '← Дашборд'}
        </motion.button>
        <motion.h1
          className="font-display text-sm font-bold text-[var(--color-text-primary)] tracking-tight text-center px-1"
          initial={false}
          animate={reduceMotion ? {} : { opacity: [0.92, 1] }}
          transition={{ duration: 0.35 }}
        >
          К специалисту
        </motion.h1>
        <motion.button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] text-xs font-medium text-[var(--color-glow-teal)] px-2"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          В бота
        </motion.button>
      </header>

      <div className="relative z-[1] flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-8">
        <motion.div
          key={current?.id}
          className="card-premium p-5 mb-4 overflow-hidden shadow-[0_8px_32px_-6px_rgba(100,80,140,0.14)] border border-white/85"
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={cardTransition}
        >
          <div className="h-2 rounded-full bg-[rgba(184,164,224,0.2)] overflow-hidden mb-4 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-glow-teal-dim)] via-[var(--color-glow-teal)] to-[var(--color-lavender)] shadow-[0_0_12px_rgba(107,196,181,0.45)]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={spring}
            />
          </div>

          <div className="flex items-center justify-between gap-2 mb-3">
            <motion.p
              className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide"
              key={`label-${step}`}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring}
            >
              Вопрос {step + 1} из {total}
            </motion.p>
            {!reduceMotion && (
              <motion.span
                className="text-[10px] text-[var(--color-glow-teal-dim)] font-medium"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                ✦
              </motion.span>
            )}
          </div>

          <motion.h2
            className="font-display text-base font-bold text-[var(--color-text-primary)] mb-4 leading-snug"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: reduceMotion ? 0 : 0.04 }}
          >
            {current?.text}
          </motion.h2>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.08, ...spring }}
          >
            <textarea
              value={answers[current?.id || ''] || ''}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Напиши коротко или развёрнуто — как тебе комфортно…"
              maxLength={2000}
              rows={6}
              className="w-full rounded-xl border border-[var(--color-lavender)]/45 bg-white/90 px-3 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 resize-y min-h-[140px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/35 focus:border-[var(--color-glow-teal)]/50 transition-shadow duration-200"
            />
          </motion.div>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">
            {(answers[current?.id || ''] || '').length}/2000
          </p>
        </motion.div>

        {error && (
          <motion.p
            className="text-sm text-red-700/90 mb-3 px-1"
            role="alert"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}

        {step < total - 1 ? (
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={goSkip}
                className="flex-1 py-3.5 rounded-xl btn-secondary min-h-[48px] font-semibold text-[var(--color-text-primary)]"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Пропустить
              </motion.button>
              <motion.button
                type="button"
                onClick={goNext}
                className="flex-[1.15] py-3.5 rounded-xl btn-primary min-h-[48px] font-semibold"
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Далее
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.div className="mt-auto" whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={busy || !canSubmit}
              className="w-full py-3.5 rounded-xl btn-premium-glow min-h-[48px] font-semibold disabled:opacity-50"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {busy ? 'Формируем PDF… до 2–3 мин' : 'Скачать PDF'}
            </button>
          </motion.div>
        )}

        <motion.p
          className="text-[11px] text-[var(--color-text-secondary)] mt-4 leading-relaxed px-1"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          Документ для разговора с психологом или коучем — не диагноз. При остром кризисе вызови скорую (112) или
          обратись{' '}
          <span className="text-[var(--color-forest-dark)] font-semibold">на линию доверия</span>.
        </motion.p>
      </div>
    </div>
  )
}
