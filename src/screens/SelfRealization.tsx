import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { goBackToBot } from '../utils/telegram'
import {
  apiSelfRealizationWelcome,
  apiSelfRealizationCompileDay,
  apiSelfRealizationHistory,
  apiSelfRealizationClearHistory,
  apiSelfRealizationTrackSync,
  apiSelfRealizationCompleteStep,
  apiSelfRealizationAdvanceToNextStage,
  type SelfRealizationCoachingBlocks,
  type SelfRealizationCuratedDay,
  type SelfRealizationTrackSync,
} from '../api/client'

const DIRECTIONS = [
  {
    id: 'confidence',
    title: 'Уверенность в обществе',
    description: 'Общение, границы, самопрезентация — опора в контакте с людьми.',
    icon: '🌟',
    difficulties: ['Стеснение в общении', 'Тревога перед знакомствами', 'Сложно отстаивать границы', 'Страх оценки'],
  },
  {
    id: 'study',
    title: 'Учёба и концентрация',
    description: 'Фокус, запоминание, режим — чтобы учиться без выгорания.',
    icon: '📚',
    difficulties: ['Трудно сосредоточиться', 'Быстро устаю', 'Сложно запоминать', 'Откладываю учёбу'],
  },
  {
    id: 'goals',
    title: 'Цели и дисциплина',
    description: 'Планирование, привычки, движение к целям шаг за шагом.',
    icon: '🎯',
    difficulties: ['Нет стабильного режима', 'Бросаю начатое', 'Непонятно с чего начать', 'Нет энергии на системность'],
  },
  {
    id: 'antiprocrastination',
    title: 'Анти‑прокрастинация',
    description: 'Старт дела, откладывание, внутреннее сопротивление — разбираем и двигаемся.',
    icon: '⏳',
    difficulties: ['Постоянно откладываю', 'Паралич перед задачей', 'Залипаю в телефоне', 'Чувство вины после откладывания'],
  },
] as const

type Direction = (typeof DIRECTIONS)[number]
type ChatRole = 'user' | 'assistant'

interface ChatMessage {
  role: ChatRole
  content: string
  blocks?: SelfRealizationCoachingBlocks | SelfRealizationCuratedDay
}

interface SelfRealizationProps {
  onBack: () => void
}

const TYPEWRITER_MS = 34
const CURSOR_BLINK_MS = 540
const MAX_ANIM_CHARS = 900

function getDirectionWelcome(dir: Direction): string {
  return `Отличный выбор — ${dir.title.toLowerCase()}. Это курируемая программа: задания уже заложены в продукте, а ИИ лишь свяжет их с твоим контекстом и выберет вариант A/B/C. Отметь трудности и кратко опиши ситуацию — затем нажми «Собрать задание дня».`
}

function isCuratedDayBlock(b: unknown): b is SelfRealizationCuratedDay {
  return typeof b === 'object' && b !== null && (b as { kind?: string }).kind === 'sr_curated_day'
}

const CURATED_SECTIONS: Array<{
  key: keyof SelfRealizationCuratedDay
  title: string
  borderClass: string
}> = [
  { key: 'personalizedOpening', title: 'К твоему контексту', borderClass: 'border-l-[#b898c4]' },
  { key: 'theory', title: 'Теория и рамка', borderClass: 'border-l-[#9b8dd4]' },
  { key: 'assignment', title: 'Задание из программы', borderClass: 'border-l-[#6bc4b5]' },
  { key: 'planB', title: 'План Б', borderClass: 'border-l-[#c9a86c]' },
  { key: 'doneCriterion', title: 'Критерий «сделано»', borderClass: 'border-l-[#5eb8aa]' },
  { key: 'reflection', title: 'После выполнения', borderClass: 'border-l-[#8b9dc9]' },
  { key: 'safety', title: 'Безопасность', borderClass: 'border-l-[#d4a5ab]' },
]

const srSpring = { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.85 }

function CuratedDayCards({ day }: { day: SelfRealizationCuratedDay }) {
  const reduceMotion = useReducedMotion()
  const variant =
    day.chosenKey === 'b' ? 'Вариант B (облегчённый)' : day.chosenKey === 'c' ? 'Вариант C (минимум)' : 'Вариант A (полный)'
  const transition = reduceMotion ? { duration: 0.2 } : srSpring
  const stagger = reduceMotion ? 0 : 0.055

  return (
    <motion.div
      className="space-y-2.5"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: reduceMotion ? 0 : 0.04 } },
      }}
    >
      {day.stepTitle ? (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 6 },
            show: { opacity: 1, y: 0, transition },
          }}
          className="text-[12px] font-bold text-[var(--color-forest-dark)]"
        >
          Этап: {day.stepTitle}
        </motion.div>
      ) : null}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition },
        }}
        className="text-[10px] uppercase font-bold tracking-wide text-[var(--color-text-secondary)]"
      >
        {variant}
      </motion.div>
      {CURATED_SECTIONS.map(({ key, title, borderClass }) => {
        const raw = day[key]
        const text = typeof raw === 'string' ? raw.trim() : ''
        if (!text) return null
        return (
          <motion.div
            key={String(key)}
            variants={{
              hidden: { opacity: 0, x: reduceMotion ? 0 : -10, filter: reduceMotion ? 'none' : 'blur(4px)' },
              show: {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
                transition,
              },
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.01, transition: { duration: 0.2 } }}
            whileTap={reduceMotion ? undefined : { scale: 0.995 }}
            className={`rounded-xl border border-[var(--color-lavender)]/20 bg-white/50 pl-3 pr-3 py-2.5 border-l-4 shadow-sm ${borderClass}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
              {title}
            </div>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">{text}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function clampForAnim(text: string) {
  if (text.length <= MAX_ANIM_CHARS) return text
  return text.slice(0, MAX_ANIM_CHARS)
}

function TypewriterText({
  text,
  animate,
  onComplete,
}: {
  text: string
  animate: boolean
  onComplete?: () => void
}) {
  const [visibleLength, setVisibleLength] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const fullText = text || ''
  const animText = animate ? clampForAnim(fullText) : fullText
  const done = visibleLength >= animText.length

  useEffect(() => {
    if (!fullText) {
      setVisibleLength(0)
      return
    }

    if (!animate) {
      setVisibleLength(fullText.length)
      return
    }

    setVisibleLength(0)
    const len = animText.length
    const t = window.setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= len) {
          window.clearInterval(t)
          onCompleteRef.current?.()
          return len
        }
        return prev + 1
      })
    }, TYPEWRITER_MS)

    return () => window.clearInterval(t)
  }, [animate, fullText, animText.length])

  useEffect(() => {
    if (!animate || done) return
    const blink = window.setInterval(() => setCursorVisible((v) => !v), CURSOR_BLINK_MS)
    return () => window.clearInterval(blink)
  }, [animate, done])

  if (!animate) return <>{fullText}</>

  return (
    <span>
      {animText.slice(0, visibleLength)}
      {!done && (
        <motion.span animate={{ opacity: cursorVisible ? 1 : 0 }} transition={{ duration: 0.15 }}>
          |
        </motion.span>
      )}
    </span>
  )
}

function PremiumHoloCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <div className={`card-premium relative overflow-hidden ${className || ''}`}>
      <motion.div
        className="absolute -inset-[60px] opacity-70"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(107,196,181,0.35), transparent 55%), radial-gradient(circle at 80% 10%, rgba(184,164,224,0.35), transparent 45%), radial-gradient(circle at 60% 85%, rgba(232,180,184,0.25), transparent 50%)',
          filter: 'blur(10px)',
        }}
        animate={reduceMotion ? undefined : { rotate: [0, 12, 0] }}
        transition={reduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-[-40%] top-[-60%] w-[180%] h-[180%] opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(110deg, rgba(107,196,181,0.0) 25%, rgba(107,196,181,0.6) 45%, rgba(107,196,181,0.0) 65%)',
        }}
        animate={reduceMotion ? undefined : { x: ['-10%', '10%'], y: ['-5%', '5%'] }}
        transition={reduceMotion ? undefined : { duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

const COACHING_SECTIONS: Array<{
  key: keyof SelfRealizationCoachingBlocks
  title: string
  borderClass: string
}> = [
  { key: 'checkInPrevious', title: 'Связь с прошлым шагом', borderClass: 'border-l-[#5eb8aa]' },
  { key: 'empathy', title: 'Понимаю тебя', borderClass: 'border-l-[#b898c4]' },
  { key: 'pattern', title: 'Что под капотом', borderClass: 'border-l-[#c9a86c]' },
  { key: 'stepsToday', title: 'Шаги прямо сейчас', borderClass: 'border-l-[#6bc4b5]' },
  { key: 'microExperiment', title: 'Эксперимент до следующего раза', borderClass: 'border-l-[#e8a0a8]' },
  { key: 'question', title: 'Вопрос', borderClass: 'border-l-[#8b9dc9]' },
  { key: 'progressBridge', title: 'Как это двигает вперёд', borderClass: 'border-l-[#7bc4a8]' },
  { key: 'toneClose', title: 'Опора', borderClass: 'border-l-[#d4a5ab]' },
]

function hasCoachingBlocks(b: SelfRealizationCoachingBlocks | SelfRealizationCuratedDay | undefined): boolean {
  if (!b) return false
  if (isCuratedDayBlock(b)) return false
  return Object.values(b as SelfRealizationCoachingBlocks).some((v) => typeof v === 'string' && v.trim().length > 0)
}

function CoachingCards({ blocks }: { blocks: SelfRealizationCoachingBlocks }) {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0.2 } : srSpring
  const stagger = reduceMotion ? 0 : 0.05
  return (
    <motion.div
      className="space-y-2.5"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: reduceMotion ? 0 : 0.03 } },
      }}
    >
      {COACHING_SECTIONS.map(({ key, title, borderClass }) => {
        const raw = blocks[key]
        const text = typeof raw === 'string' ? raw.trim() : ''
        if (!text) return null
        return (
          <motion.div
            key={key}
            variants={{
              hidden: { opacity: 0, x: reduceMotion ? 0 : -8 },
              show: { opacity: 1, x: 0, transition },
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.008 }}
            whileTap={reduceMotion ? undefined : { scale: 0.995 }}
            className={`rounded-xl border border-[var(--color-lavender)]/20 bg-white/50 pl-3 pr-3 py-2.5 border-l-4 shadow-sm ${borderClass}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
              {title}
            </div>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-[var(--color-text-primary)]">{text}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

function ChatLoadingBubble({ label }: { label: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0.2 } : srSpring}
    >
      <motion.div
        className="card-premium rounded-2xl px-4 py-3 text-sm text-[var(--color-text-secondary)] border border-[var(--color-lavender)]/20 overflow-hidden relative"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  '0 0 0 0 rgba(107,196,181,0)',
                  '0 0 0 6px rgba(107,196,181,0.06)',
                  '0 0 0 0 rgba(107,196,181,0)',
                ],
              }
        }
        transition={reduceMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="relative z-10">{label}</span>
        {!reduceMotion && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: 'linear', repeatDelay: 0.35 }}
          />
        )}
      </motion.div>
    </motion.div>
  )
}

export function SelfRealization({ onBack }: SelfRealizationProps) {
  const reduceMotion = useReducedMotion()
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [inputText, setInputText] = useState('')
  const [loadingReply, setLoadingReply] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [track, setTrack] = useState<SelfRealizationTrackSync | null>(null)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [completeReport, setCompleteReport] = useState('')
  const [completeLoading, setCompleteLoading] = useState(false)
  const [advanceLoading, setAdvanceLoading] = useState(false)

  const [welcomeText, setWelcomeText] = useState('')
  const [welcomeDone, setWelcomeDone] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const directionTitleRef = useRef<string | null>(null)
  directionTitleRef.current = selectedDirection?.title ?? null

  useEffect(() => {
    apiSelfRealizationWelcome().then((result) => {
      if ('error' in result) {
        setWelcomeText('')
        setWelcomeDone(true)
        return
      }
      const text = result.welcomeText || ''
      setWelcomeText(text)
      setWelcomeDone(!text)
    })
  }, [])

  const openDirection = useCallback((dir: Direction) => {
    setSelectedDirection(dir)
    setMessages([])
    setSelectedDifficulties([])
    setInputText('')
    setError(null)
    setAdvanceLoading(false)
    setHistoryLoading(true)
    setLoadingReply(false)
  }, [])

  const goBackToList = useCallback(() => {
    setSelectedDirection(null)
    setMessages([])
    setSelectedDifficulties([])
    setInputText('')
    setError(null)
    setHistoryLoading(false)
    setLoadingReply(false)
    setTrack(null)
    setCompleteOpen(false)
    setCompleteReport('')
    setAdvanceLoading(false)
  }, [])

  useEffect(() => {
    if (!selectedDirection) return

    const directionTitle = selectedDirection.title
    const directionKey = selectedDirection.id
    setError(null)
    setHistoryLoading(true)
    setLoadingReply(false)
    setTrack(null)

    Promise.all([
      apiSelfRealizationHistory(directionTitle),
      apiSelfRealizationTrackSync({ direction: directionTitle, directionKey }),
    ]).then(([res, sync]) => {
      if (directionTitleRef.current !== directionTitle) return

      if (!('error' in sync)) {
        setTrack(sync)
      }

      if ('error' in res) {
        setHistoryLoading(false)
        setMessages([{ role: 'assistant', content: 'Не удалось загрузить историю. Попробуй ещё раз.' }])
        return
      }

      if (res.items.length > 0) {
        setMessages(
          res.items.map((m) => {
            let blocks: ChatMessage['blocks']
            if (m.role === 'assistant' && m.blocks) {
              if (isCuratedDayBlock(m.blocks)) blocks = m.blocks
              else if (hasCoachingBlocks(m.blocks)) blocks = m.blocks
            }
            return { role: m.role, content: m.content, blocks }
          })
        )
      } else {
        setMessages([{ role: 'assistant', content: getDirectionWelcome(selectedDirection) }])
      }
      setHistoryLoading(false)
    })
  }, [selectedDirection])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loadingReply])

  const toggleDifficulty = useCallback((value: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]
    )
  }, [])

  const clearDirectionHistory = useCallback(async () => {
    if (!selectedDirection) return
    setError(null)
    const result = await apiSelfRealizationClearHistory(selectedDirection.title, selectedDirection.id)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setMessages([{ role: 'assistant', content: getDirectionWelcome(selectedDirection) }])
    setSelectedDifficulties([])
    setInputText('')
    setLoadingReply(false)
    setHistoryLoading(false)
    setCompleteOpen(false)
    setCompleteReport('')
    setAdvanceLoading(false)
    const sync = await apiSelfRealizationTrackSync({
      direction: selectedDirection.title,
      directionKey: selectedDirection.id,
    })
    if (!('error' in sync)) setTrack(sync)
  }, [selectedDirection])

  const compileDay = useCallback(async () => {
    const context = inputText.trim()
    if (!selectedDirection || context.length < 12 || loadingReply) return

    setError(null)
    setLoadingReply(true)
    const loadingStartedAt = Date.now()

    const result = await apiSelfRealizationCompileDay({
      direction: selectedDirection.title,
      directionKey: selectedDirection.id,
      context,
      difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
    })

    if ('error' in result) {
      const elapsed = Date.now() - loadingStartedAt
      if (elapsed < 700) {
        await new Promise((resolve) => setTimeout(resolve, 700 - elapsed))
      }
      setError(result.error)
      setLoadingReply(false)
      return
    }

    setTrack(result.track)
    setInputText('')

    const elapsed = Date.now() - loadingStartedAt
    if (elapsed < 700) {
      await new Promise((resolve) => setTimeout(resolve, 700 - elapsed))
    }

    const userLine = `Контекст дня: ${context}`
    const dayBlocks = result.day && isCuratedDayBlock(result.day) ? result.day : undefined
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userLine },
      { role: 'assistant', content: result.reply, blocks: dayBlocks },
    ])
    setLoadingReply(false)
  }, [selectedDirection, inputText, loadingReply, selectedDifficulties])

  const submitCompleteStep = useCallback(async () => {
    const report = completeReport.trim()
    if (!selectedDirection || report.length < 3 || completeLoading) return
    setError(null)
    setCompleteLoading(true)
    const result = await apiSelfRealizationCompleteStep({
      direction: selectedDirection.title,
      directionKey: selectedDirection.id,
      report,
    })
    setCompleteLoading(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setTrack(result.track)
    setCompleteOpen(false)
    setCompleteReport('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: `Отчёт о задании: ${report}` },
      { role: 'assistant', content: result.reply },
    ])
  }, [selectedDirection, completeReport, completeLoading])

  const submitAdvance = useCallback(async () => {
    if (!selectedDirection || advanceLoading) return

    setError(null)
    setAdvanceLoading(true)
    try {
      const result = await apiSelfRealizationAdvanceToNextStage({
        direction: selectedDirection.title,
        directionKey: selectedDirection.id,
      })
      setAdvanceLoading(false)

      if ('error' in result) {
        setError(result.error)
        return
      }

      const dayBlocks = result.day && isCuratedDayBlock(result.day) ? result.day : undefined

      setTrack(result.track)

      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `Переход к этапу ${result.track.displayStep}` },
        { role: 'assistant', content: result.analysisReply },
        { role: 'assistant', content: result.reply, blocks: dayBlocks },
      ])
    } catch (e: unknown) {
      setAdvanceLoading(false)
      setError((e as any)?.message || 'Ошибка перехода к следующему этапу')
    }
  }, [advanceLoading, selectedDirection])

  // На следующий день старые сообщения из истории НЕ должны считаться "контентом" текущего этапа:
  // опираемся на серверный dayPackage (cache дня для текущего displayStep).
  const hasDayContent = !!track?.hasDayPackage

  const showCompileForm =
    !!track &&
    !track.awaitingNextDay &&
    !track.completedAll &&
    track.displayStep === 1 &&
    !hasDayContent
  const canCompile = inputText.trim().length >= 12
  const showCompleteButton =
    !!track && hasDayContent && track.canCompleteStep && !track.completedAll && !track.awaitingNextDay

  const showAdvanceForm =
    !!track &&
    !track.awaitingNextDay &&
    !track.completedAll &&
    track.displayStep > 1 &&
    !hasDayContent &&
    track.canCompleteStep

  if (selectedDirection) {
    return (
      <div className="min-h-screen flex flex-col safe-area self-realization-page">
        <header className="flex items-center justify-between h-14 px-4 gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={goBackToList}
            className="btn-ghost min-h-[44px] min-w-[44px] rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] shadow-md"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-center text-base font-bold text-[var(--color-text-primary)] truncate">
              {selectedDirection.title}
            </h1>
            <p className="text-center text-xs text-[var(--color-text-secondary)] mt-0.5">
              {track
                ? `Этап ${track.displayStep} из ${track.totalSteps} · один этап в день`
                : 'Загрузка трека…'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => goBackToBot()}
            className="min-h-[44px] min-w-[92px] flex items-center justify-center rounded-xl text-sm font-semibold btn-primary px-3"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            В бота
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 max-w-[440px] mx-auto w-full px-4 py-4">
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-1 pt-2 pb-8 min-h-0 scroll-smooth">
            {historyLoading && <ChatLoadingBubble label="ИИ готовит старт…" />}

            {track?.awaitingNextDay && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0.2 } : srSpring}
                className="rounded-2xl border border-[var(--color-glow-teal)]/40 bg-[var(--color-glow-teal)]/10 px-4 py-3 text-sm text-[var(--color-forest-dark)]"
              >
                Сегодняшний этап выполнен. Следующий откроется{' '}
                {track.nextUnlockDate ? ` ${track.nextUnlockDate}` : ' завтра'}. Отдых — тоже часть трека 💛
              </motion.div>
            )}

            {track?.completedAll && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0.2 } : srSpring}
                className="rounded-2xl border border-[var(--color-lavender)]/30 bg-white/60 px-4 py-3 text-sm text-[var(--color-text-primary)]"
              >
                Все 8 этапов в этом направлении пройдены. Можно собрать закрепляющий день из финального блока программы или
                вернуться к боту за живой поддержкой.
              </motion.div>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((m, i) => {
                const fromRight = m.role === 'user'
                const assistantPlain = m.role === 'assistant' && !m.blocks
                const delay = reduceMotion ? 0 : Math.min(i * 0.022, 0.2)
                const bubbleTransition = reduceMotion
                  ? { duration: 0.18, delay }
                  : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.82, delay }
                const bubbleClass =
                  assistantPlain
                    ? 'sr-feedback-ack max-w-[min(100%,92%)] min-w-0 rounded-2xl px-4 pt-3.5 pb-4'
                    : m.role === 'assistant'
                      ? 'card-premium max-w-[min(100%,92%)] min-w-0 rounded-2xl px-4 py-3.5 border border-[var(--color-lavender)]/20 text-[var(--color-text-primary)] shadow-md text-[15px] leading-relaxed'
                      : 'max-w-[min(100%,92%)] min-w-0 rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed bg-gradient-to-br from-[var(--color-glow-teal)]/25 to-[var(--color-glow-teal)]/10 border border-[var(--color-glow-teal)]/30 text-[var(--color-forest-dark)] shadow-md'
                return (
                  <motion.div
                    key={`${selectedDirection.id}-${i}`}
                    layout
                    initial={{ opacity: 0, y: 14, scale: 0.97, x: fromRight ? 18 : -18 }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={bubbleTransition}
                    className={`flex w-full min-w-0 ${fromRight ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={bubbleClass}>
                      <div className={`space-y-2 min-w-0 ${assistantPlain ? 'space-y-3' : ''}`}>
                        {m.role === 'assistant' && (
                          <div
                            className={
                              assistantPlain
                                ? 'flex items-center gap-2 min-w-0'
                                : 'text-[11px] font-semibold text-[var(--color-text-secondary)]'
                            }
                          >
                            {assistantPlain ? (
                              <>
                                <span
                                  className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-glow-teal)]/18 text-[15px] shadow-sm border border-white/50"
                                  aria-hidden
                                >
                                  ✨
                                </span>
                                <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--color-forest-dark)]/85">
                                  Обратная связь
                                </span>
                              </>
                            ) : m.blocks && isCuratedDayBlock(m.blocks) ? (
                              'Методичка · программа'
                            ) : (
                              'Самореализация'
                            )}
                          </div>
                        )}
                        {assistantPlain ? <div className="sr-feedback-ack-accent shrink-0" aria-hidden /> : null}
                        {m.role === 'assistant' && m.blocks && isCuratedDayBlock(m.blocks) ? (
                          <CuratedDayCards day={m.blocks} />
                        ) : m.role === 'assistant' && m.blocks && hasCoachingBlocks(m.blocks) ? (
                          <CoachingCards blocks={m.blocks as SelfRealizationCoachingBlocks} />
                        ) : m.role === 'assistant' ? (
                          <p className="sr-feedback-ack-body whitespace-pre-wrap">{m.content}</p>
                        ) : (
                          <span className="block whitespace-pre-wrap break-words">{m.content}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {loadingReply && <ChatLoadingBubble label="Собираю задание дня…" />}

            <div ref={chatEndRef} />
          </div>

          <motion.div layout className="flex-shrink-0 pt-3 space-y-3">
            <AnimatePresence>
              {completeOpen && (
                <motion.div
                  key="complete-report"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 400, damping: 34 }}
                  className="card-premium rounded-2xl p-4 shadow-lg border border-[var(--color-lavender)]/25 overflow-hidden"
                >
                  <div className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Отчёт о задании</div>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                    Коротко: что сделал(а), что мешало, что заметил(а).
                  </p>
                  <textarea
                    value={completeReport}
                    onChange={(e) => setCompleteReport(e.target.value)}
                    placeholder="3–10 предложений…"
                    className="w-full min-h-[88px] rounded-xl border border-[var(--color-lavender)]/35 bg-white/95 p-3 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCompleteOpen(false)
                        setCompleteReport('')
                      }}
                      className="flex-1 py-3 rounded-xl btn-secondary min-h-[48px] text-sm font-semibold"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitCompleteStep()}
                      disabled={completeLoading || completeReport.trim().length < 3}
                      className="flex-1 py-3 rounded-xl btn-primary min-h-[48px] text-sm font-semibold disabled:opacity-50"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {completeLoading ? 'Отправка…' : 'Задание выполнено'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showCompileForm ? (
              <>
                <PremiumHoloCard className="p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl" aria-hidden>
                      📘
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--color-text-primary)]">Не чат, а методичка</div>
                      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-1">
                        Задания и теория этапа заранее собраны в продукте (как в хорошем курсе). ИИ делает одно: читает твой
                        контекст и <b>выбирает вариант A/B/C</b> из уже заготовленных, плюс коротко связывает это с твоими
                        словами. <b>Свободного переписывания</b> с ботом здесь нет — один осмысленный заход в день.
                      </div>
                    </div>
                  </div>
                </PremiumHoloCard>

                <div className="card-premium rounded-2xl p-5 shadow-lg">
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    Что откликается? Отметь трудности — так точнее подберётся вариант задания.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDirection.difficulties.map((item) => {
                      const active = selectedDifficulties.includes(item)
                      return (
                        <motion.button
                          key={item}
                          type="button"
                          onClick={() => toggleDifficulty(item)}
                          whileTap={{ scale: 0.99 }}
                          className={`pts-btn-shimmer px-3.5 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                            active
                              ? 'bg-[var(--color-glow-teal)]/25 border-[var(--color-glow-teal)] text-[var(--color-forest-dark)]'
                              : 'border-[var(--color-lavender)]/40 text-[var(--color-text-secondary)] bg-white/80'
                          }`}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          {item}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div className="card-premium rounded-2xl p-5 shadow-lg">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Контекст на сегодня (минимум ~12 символов): что происходит, что хочешь сдвинуть…"
                    className="w-full min-h-[100px] rounded-xl border border-[var(--color-lavender)]/30 bg-white/90 p-3.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/70 outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/40 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => void compileDay()}
                    disabled={loadingReply || !canCompile}
                    className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[52px] font-semibold disabled:opacity-50 mt-4"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {loadingReply ? 'Сборка…' : 'Собрать задание дня'}
                  </button>
                  {error && <p className="text-sm text-amber-700 mt-3">{error}</p>}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={clearDirectionHistory}
                    className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-forest-dark)]"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Сбросить трек и историю
                  </button>
                </div>
              </>
            ) : (
              <>
                {showAdvanceForm && (
                  <button
                    type="button"
                    onClick={() => void submitAdvance()}
                    disabled={advanceLoading}
                    className="w-full py-3.5 rounded-xl btn-primary min-h-[52px] font-semibold disabled:opacity-60"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {advanceLoading ? 'Открываю следующий этап…' : `Перейти к этапу ${track?.displayStep ?? 0}`}
                  </button>
                )}
                {hasDayContent && !track?.awaitingNextDay && !track?.completedAll && (
                  <p className="text-center text-xs text-[var(--color-text-secondary)] -mt-1">
                    Один этап — одно задание из программы. Завершил(а) — отметь ниже; новый этап откроется завтра.
                  </p>
                )}
                {showCompleteButton && !completeOpen && (
                  <button
                    type="button"
                    onClick={() => setCompleteOpen(true)}
                    className="w-full py-3.5 rounded-xl btn-primary min-h-[52px] font-semibold"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Задание выполнено
                  </button>
                )}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={clearDirectionHistory}
                    className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-forest-dark)] py-2"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    Сбросить трек и историю
                  </button>
                </div>
                {error && <p className="text-sm text-amber-700 text-center">{error}</p>}
              </>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col safe-area self-realization-page">
      <header className="flex items-center justify-between h-14 px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="btn-ghost min-h-[44px] min-w-[44px] rounded-xl text-sm font-semibold text-[var(--color-forest-dark)] shadow-md"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <h1 className="font-display text-base font-bold text-[var(--color-text-primary)] tracking-tight">
            Самореализация
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Уверенность, самооценка и социализация</p>
        </div>
        <button
          type="button"
          onClick={() => goBackToBot()}
          className="min-h-[44px] min-w-[92px] flex items-center justify-center rounded-xl text-sm font-semibold btn-primary px-3"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          В бота
        </button>
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-4 pb-6 min-h-0 overflow-y-auto">
        <PremiumHoloCard className="p-5 mb-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="text-3xl mt-0.5" aria-hidden>
              🌱
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[var(--color-text-secondary)] text-sm mb-2 leading-relaxed">
                Выбери направление — курируемая программа по этапам, без бесконечного чата.
              </div>
              <p className="text-[var(--color-text-primary)] text-base leading-relaxed font-medium min-h-[3.6em]">
                {welcomeText ? (
                  <TypewriterText
                    text={welcomeText}
                    animate={!welcomeDone}
                    onComplete={() => setWelcomeDone(true)}
                  />
                ) : (
                  <span className="text-[var(--color-text-secondary)]">Загрузка…</span>
                )}
              </p>
            </div>
          </div>
        </PremiumHoloCard>

        <motion.ul
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.04 },
            },
          }}
        >
          {DIRECTIONS.map((dir) => (
            <motion.li
              key={dir.id}
              variants={{
                hidden: { opacity: 0, y: 12, scale: 0.98 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={reduceMotion ? { duration: 0.22 } : { type: 'spring', stiffness: 380, damping: 28 }}
            >
              <motion.button
                type="button"
                onClick={() => openDirection(dir)}
                whileTap={{ scale: 0.99 }}
                whileHover={reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                className="pts-btn-shimmer w-full text-left card-premium rounded-2xl p-5 min-h-[88px] shadow-md hover:shadow-lg transition-shadow border border-[var(--color-lavender)]/20"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0" aria-hidden>
                    {dir.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">{dir.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{dir.description}</p>
                  </div>
                </div>
              </motion.button>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
