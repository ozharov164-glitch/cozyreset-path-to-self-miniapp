import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SpecialistBriefPdfPreview } from '../components/SpecialistBriefPdfPreview'
import { THERAPY_MAP_QUESTIONS } from '../data/therapyMapQuestions'
import { apiTherapyMapGenerate } from '../api/client'
import { downloadPdfCrossPlatform, fetchSpecialistPdfOnce, pdfBlobFromBase64 } from '../utils/specialistBriefDownload'
import { goBackToBot } from '../utils/telegram'

type AnswersMap = Record<string, string>

const initialAnswers = (): AnswersMap =>
  Object.fromEntries(THERAPY_MAP_QUESTIONS.map((q) => [q.id, '']))

interface TherapyMapProps {
  onBack: () => void
}

type PreviewState = { blob: Blob; fileName: string; downloadUrl: string }

const EXPORT_STEP = THERAPY_MAP_QUESTIONS.length

function defaultShortIds(answers: AnswersMap): string[] {
  const filled = THERAPY_MAP_QUESTIONS.filter((q) => q.shortEligible && (answers[q.id] || '').trim())
  const preferred = filled.filter((q) => q.includeInShortByDefault).map((q) => q.id)
  if (preferred.length >= 2) return preferred
  const sel = [...preferred]
  for (const q of filled) {
    if (sel.length >= 2) break
    if (!sel.includes(q.id)) sel.push(q.id)
  }
  return sel
}

export function TherapyMap({ onBack }: TherapyMapProps) {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AnswersMap>(initialAnswers)
  const [exportMode, setExportMode] = useState<'full' | 'short'>('full')
  const [shortSectionIds, setShortSectionIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [savingPdf, setSavingPdf] = useState(false)
  const prevStepRef = useRef(step)

  const qCount = THERAPY_MAP_QUESTIONS.length
  const onExportStep = step === EXPORT_STEP
  const current = !onExportStep ? THERAPY_MAP_QUESTIONS[step] : null

  const filledCount = useMemo(
    () => Object.values(answers).filter((v) => v.trim().length > 0).length,
    [answers],
  )
  const canGoExport = filledCount >= 2

  const shortSelectionOk = useMemo(() => {
    if (exportMode === 'full') return true
    if (shortSectionIds.length < 2) return false
    return shortSectionIds.every((id) => (answers[id] || '').trim().length > 0)
  }, [exportMode, shortSectionIds, answers])

  useEffect(() => {
    const prev = prevStepRef.current
    prevStepRef.current = step
    const enteredExport = prev !== EXPORT_STEP && step === EXPORT_STEP
    if (enteredExport) {
      setShortSectionIds(defaultShortIds(answers))
    }
  }, [step, answers])

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.85 }

  const cardTransition = reduceMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const }

  const clearPreview = () => {
    setPreview(null)
    setStep(EXPORT_STEP)
  }

  const setCurrentAnswer = (v: string) => {
    if (!current) return
    setAnswers((a) => ({ ...a, [current.id]: v }))
  }

  const goNext = () => setStep((s) => Math.min(s + 1, EXPORT_STEP))
  const goSkip = () => goNext()

  const toggleShortId = (id: string) => {
    const q = THERAPY_MAP_QUESTIONS.find((x) => x.id === id)
    if (!q?.shortEligible) return
    if (!(answers[id] || '').trim()) return
    setShortSectionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleDownloadPdf = async () => {
    if (!preview || savingPdf) return
    setSavingPdf(true)
    try {
      await downloadPdfCrossPlatform(preview.blob, preview.fileName, {
        httpsDownloadUrl: preview.downloadUrl,
      })
    } catch {
      window.Telegram?.WebApp?.showAlert?.(
        'Не удалось сохранить PDF. Попробуй ещё раз или открой мини-приложение в браузере.',
      )
    } finally {
      setSavingPdf(false)
    }
  }

  const handleGenerate = async () => {
    setError(null)
    if (!canGoExport) {
      setError('Заполни хотя бы два ответа.')
      return
    }
    if (exportMode === 'short' && !shortSelectionOk) {
      setError('В краткой версии выбери не меньше двух разделов с заполненными ответами.')
      return
    }
    setBusy(true)
    try {
      const payloadAnswers = THERAPY_MAP_QUESTIONS.map((q) => ({
        id: q.id,
        answer: (answers[q.id] || '').trim(),
      }))
      const res = await apiTherapyMapGenerate({
        answers: payloadAnswers,
        exportMode,
        shortSectionIds: exportMode === 'short' ? shortSectionIds : undefined,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      let blob: Blob
      try {
        blob = res.previewPdfBase64
          ? pdfBlobFromBase64(res.previewPdfBase64)
          : await fetchSpecialistPdfOnce(res.downloadUrl)
      } catch {
        setError('Не удалось загрузить PDF для просмотра. Попробуй сформировать ещё раз.')
        return
      }
      setPreview({
        blob,
        fileName: res.fileName || 'karta-terapii-cozyreset.pdf',
        downloadUrl: res.downloadUrl,
      })
    } finally {
      setBusy(false)
    }
  }

  const progress = onExportStep ? 100 : ((step + 1) / qCount) * 100

  if (preview) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden safe-area relative w-full">
        <header className="relative z-[2] card-premium h-14 flex items-center justify-between px-4 mb-2 rounded-2xl shrink-0 mx-3 mt-1">
          <button
            type="button"
            onClick={() => clearPreview()}
            className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            ← К карте
          </button>
          <h1 className="font-display text-sm font-bold text-[var(--color-text-primary)] tracking-tight text-center px-1">
            Предпросмотр
          </h1>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="btn-ghost min-h-[44px] text-xs font-medium text-[var(--color-glow-teal)] px-2 rounded-lg"
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </header>

        <div className="relative z-[1] flex-1 flex flex-col min-h-0 max-w-[420px] w-full mx-auto px-3 pb-3">
          <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/95 to-[rgba(232,246,243,0.95)] px-3.5 py-2.5 mb-2 shadow-sm shrink-0">
            <p className="text-xs font-semibold text-[var(--color-forest-dark)] leading-snug mb-1">
              Анонимность и одноразовый файл
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
              Мы не храним твои ответы и не храним PDF у себя после выдачи. Сохрани файл на устройство сейчас — из
              раздела скачать снова не получится; при необходимости собери карту заново. После выхода из раздела «Карта
              терапии» этот PDF в приложении недоступен.
            </p>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain rounded-2xl border border-[var(--color-lavender)]/35 bg-[rgba(255,255,255,0.92)] shadow-inner px-2 py-3 mb-2"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <SpecialistBriefPdfPreview file={preview.blob} />
          </div>

          <p className="text-[11px] text-[var(--color-text-secondary)] mb-2 px-0.5 shrink-0 leading-relaxed">
            Листай документ выше. «Скачать PDF» сохраняет файл на устройство. Редактировать PDF в приложении нельзя —
            изменить смысл можно только новым проходом анкеты.
          </p>

          <div className="flex flex-col gap-2 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={savingPdf}
              className="w-full py-3.5 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-60"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {savingPdf ? 'Сохраняем…' : 'Скачать PDF'}
            </button>
            <button
              type="button"
              onClick={() => clearPreview()}
              className="w-full py-3 rounded-xl btn-secondary min-h-[48px] font-semibold text-[var(--color-text-primary)]"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Закрыть без скачивания
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col safe-area relative overflow-x-hidden">
      {!reduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -top-6 right-[-18%] w-[52vw] max-w-[210px] h-[210px] rounded-full opacity-[0.16]"
            style={{
              background: 'radial-gradient(circle, rgba(90, 160, 148, 0.5) 0%, transparent 68%)',
            }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute bottom-[16%] -left-[12%] w-[48vw] max-w-[190px] h-[190px] rounded-full opacity-[0.13]"
            style={{
              background: 'radial-gradient(circle, rgba(184, 164, 224, 0.48) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.05, 1], x: [0, 5, 0] }}
            transition={{ duration: 8.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </>
      )}

      <header className="relative z-[1] card-premium h-14 flex items-center justify-between px-4 mb-4 rounded-2xl">
        <motion.button
          type="button"
          onClick={() => {
            if (onExportStep) setStep((s) => Math.max(0, s - 1))
            else if (step > 0) setStep((s) => s - 1)
            else onBack()
          }}
          className="btn-ghost min-h-[44px] min-w-[52px] py-2 px-3 -my-1 -ml-1 rounded-xl text-sm font-semibold text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          {onExportStep ? '← Вопросы' : step > 0 ? '← Назад' : '← Дашборд'}
        </motion.button>
        <motion.h1
          className="font-display text-sm font-bold text-[var(--color-text-primary)] tracking-tight text-center px-1"
          initial={false}
          animate={reduceMotion ? {} : { opacity: [0.92, 1] }}
          transition={{ duration: 0.35 }}
        >
          Карта терапии
        </motion.h1>
        <motion.button
          type="button"
          onClick={() => goBackToBot()}
          className="btn-ghost min-h-[44px] text-xs font-medium text-[var(--color-glow-teal)] px-2 rounded-lg"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          В бота
        </motion.button>
      </header>

      <div className="relative z-[1] flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3 pb-8">
        <motion.div
          key={onExportStep ? 'export' : current?.id}
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

          {onExportStep ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Формат PDF</p>
              <h2 className="font-display text-base font-bold text-[var(--color-text-primary)] leading-snug">
                Как сохранить карту
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Полная версия — все заполненные блоки. Краткая — только выбранные разделы, чтобы передать специалисту
                меньше личного.
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[var(--color-lavender)]/40 bg-white/80 px-3 py-3">
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === 'full'}
                    onChange={() => setExportMode('full')}
                    className="mt-1"
                  />
                  <span className="text-sm text-[var(--color-text-primary)] leading-snug">
                    <span className="font-semibold">Полная карта</span> — все твои ответы в документе
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[var(--color-lavender)]/40 bg-white/80 px-3 py-3">
                  <input
                    type="radio"
                    name="exportMode"
                    checked={exportMode === 'short'}
                    onChange={() => setExportMode('short')}
                    className="mt-1"
                  />
                  <span className="text-sm text-[var(--color-text-primary)] leading-snug">
                    <span className="font-semibold">Краткая для специалиста</span> — только отмеченные блоки
                  </span>
                </label>
              </div>
              {exportMode === 'short' && (
                <div className="rounded-xl border border-[var(--color-glow-teal)]/25 bg-[rgba(232,246,243,0.35)] p-3 space-y-2">
                  <p className="text-xs font-semibold text-[var(--color-forest-dark)]">Включить в PDF</p>
                  <ul className="space-y-2">
                    {THERAPY_MAP_QUESTIONS.filter((q) => q.shortEligible).map((q) => {
                      const filled = !!(answers[q.id] || '').trim()
                      const checked = shortSectionIds.includes(q.id)
                      return (
                        <li key={q.id}>
                          <label
                            className={`flex items-start gap-2 text-sm ${filled ? 'cursor-pointer' : 'opacity-45'}`}
                          >
                            <input
                              type="checkbox"
                              disabled={!filled}
                              checked={checked && filled}
                              onChange={() => toggleShortId(q.id)}
                              className="mt-0.5"
                            />
                            <span className="text-[var(--color-text-primary)] leading-snug">
                              {q.text.slice(0, 72)}
                              {q.text.length > 72 ? '…' : ''}
                              {!filled && <span className="text-[var(--color-text-secondary)]"> (пусто)</span>}
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 mb-3">
                <motion.p
                  className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide"
                  key={`label-${step}`}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={spring}
                >
                  Вопрос {step + 1} из {qCount}
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

              {step === 0 && (
                <motion.p
                  className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3 rounded-lg bg-[rgba(232,246,243,0.45)] border border-[var(--color-glow-teal)]/20 px-3 py-2"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={spring}
                >
                  Здесь не нужно описывать «с чем пришёл» — это про то,{' '}
                  <strong className="text-[var(--color-forest-dark)]">как</strong> тебе комфортно в процессе: с какой
                  скоростью говорить, какие темы пока не трогать, от чего берёшь опору. Готовый текст можно принести на
                  приём.
                </motion.p>
              )}

              <motion.h2
                className="font-display text-base font-bold text-[var(--color-text-primary)] mb-4 leading-snug whitespace-pre-line"
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
                  placeholder="Можно коротко или развёрнуто — как удобнее…"
                  maxLength={2000}
                  rows={6}
                  className="w-full rounded-xl border border-[var(--color-lavender)]/45 bg-white/90 px-3 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 resize-y min-h-[140px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/35 focus:border-[var(--color-glow-teal)]/50 transition-shadow duration-200"
                />
              </motion.div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-2">
                {(answers[current?.id || ''] || '').length}/2000
              </p>
            </>
          )}
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

        {onExportStep ? (
          <motion.div className="mt-auto" whileTap={reduceMotion ? undefined : { scale: 0.99 }}>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={busy || !canGoExport || !shortSelectionOk}
              className="w-full py-3.5 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-50"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              {busy ? 'Формируем PDF… до 2–3 мин' : 'Сформировать и посмотреть'}
            </button>
          </motion.div>
        ) : step < qCount - 1 ? (
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
              onClick={() => setStep(EXPORT_STEP)}
              disabled={!canGoExport}
              className="w-full py-3.5 rounded-xl btn-primary min-h-[48px] font-semibold disabled:opacity-50"
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            >
              Далее: формат PDF
            </button>
          </motion.div>
        )}

        <motion.div
          className="mt-4 mx-0.5 rounded-2xl border border-[var(--color-lavender)]/45 bg-gradient-to-br from-white/[0.97] via-white/92 to-[rgba(250,248,255,0.94)] shadow-[0_10px_40px_-12px_rgba(90,70,130,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] px-4 py-3.5"
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <p className="font-display text-xs leading-relaxed text-[var(--color-text-secondary)] text-center tracking-[0.01em]">
            Не диагноз и не замена кризисной помощи. При остром кризисе — 112 или линия доверия. Повторное формирование —
            если захочешь что-то изменить; отредактировать готовый PDF в приложении нельзя.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
