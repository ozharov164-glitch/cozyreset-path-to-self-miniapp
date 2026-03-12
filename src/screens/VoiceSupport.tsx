import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiVoiceReply } from '../api/client'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

interface VoiceSupportProps {
  onBack: () => void
}

export function VoiceSupport({ onBack }: VoiceSupportProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Напиши хотя бы пару слов')
      return
    }
    if (trimmed.length > 2000) {
      setError('Текст не больше 2000 символов')
      return
    }
    setError(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setLoading(true)
    try {
      const result = await apiVoiceReply(trimmed)
      if ('error' in result) {
        setError(result.error || 'Ошибка запроса')
        return
      }
      const url = URL.createObjectURL(result.blob)
      setAudioUrl(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col safe-area pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.header
        className="flex items-center px-4 mb-4 rounded-2xl h-14"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(249,245,255,0.18) 100%)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 24px rgba(45,62,46,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <button
          type="button"
          onClick={onBack}
          className="min-w-[52px] text-left font-medium text-[var(--color-forest-dark)] active:opacity-80 transition-opacity"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)] tracking-tight">
          Голосовая поддержка
        </h1>
        <span className="w-14" />
      </motion.header>

      <motion.div
        className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl p-5 mb-4"
          style={{
            background: 'linear-gradient(155deg, rgba(255,255,255,0.28) 0%, rgba(248,245,255,0.2) 50%, rgba(232,220,235,0.18) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 12px 40px rgba(45,62,46,0.14), 0 0 0 1px rgba(201,184,232,0.15) inset',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(125,211,192,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(232,180,184,0.15), transparent)',
            }}
          />
          <div className="relative">
            <motion.h2
              className="text-lg font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-2"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.span
                aria-hidden
                className="text-xl"
                animate={loading ? { scale: [1, 1.15, 1], opacity: [1, 0.8, 1] } : {}}
                transition={{ duration: 1.2, repeat: loading ? Infinity : 0 }}
              >
                🎙️
              </motion.span>
              Ответ голосом
            </motion.h2>
            <motion.p
              className="text-sm text-[var(--color-text-secondary)] mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Напиши, что чувствуешь или о чём хочешь поговорить — ИИ-поддержка ответит тёплым голосом.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Например: сегодня тревожно, не могу сосредоточиться..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3.5 rounded-xl resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] transition-all duration-200 border-2 mb-1"
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  background: 'rgba(255,255,255,0.5)',
                  borderColor: 'rgba(201,184,232,0.35)',
                  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.4)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(125,211,192,0.6)'
                  e.target.style.boxShadow = 'inset 0 2px 8px rgba(255,255,255,0.5), 0 0 0 3px rgba(125,211,192,0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(201,184,232,0.35)'
                  e.target.style.boxShadow = 'inset 0 2px 8px rgba(255,255,255,0.4)'
                }}
                disabled={loading}
              />
              <div className="flex justify-end">
                <motion.span
                  className="text-xs text-[var(--color-text-secondary)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {text.length}/2000
                </motion.span>
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="err"
                  className="text-sm text-rose-600 mb-3"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            {loading && (
              <motion.div
                className="flex items-center gap-2 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-[var(--color-glow-teal)]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  Ответ готовится (до 2 минут)…
                </span>
              </motion.div>
            )}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-[var(--color-text-primary)] relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #e8b4b8 0%, #f0c4c8 50%, #e8b4b8 100%)',
                boxShadow: '0 6px 20px rgba(232,180,184,0.45), inset 0 1px 0 rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
              whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 28px rgba(232,180,184,0.5)' } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              <span className="relative z-10">
                {loading ? 'Генерирую ответ…' : 'Получить ответ голосом'}
              </span>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {audioUrl && (
            <motion.div
              key="audio-card"
              variants={item}
              className="relative overflow-hidden rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              style={{
                background: 'linear-gradient(145deg, rgba(125,211,192,0.12) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(125,211,192,0.35)',
                boxShadow: '0 8px 32px rgba(90,184,168,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-50"
                style={{
                  background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(125,211,192,0.2), transparent)',
                }}
              />
              <div className="relative flex items-center gap-3 mb-3">
                <motion.span
                  className="text-lg"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
                <p className="text-sm font-semibold text-[var(--color-forest-dark)]">Ответ ИИ</p>
              </div>
              <div
                className="rounded-xl overflow-hidden p-2"
                style={{
                  background: 'rgba(255,255,255,0.4)',
                  boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.5)',
                }}
              >
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full h-12"
                  style={{ accentColor: 'var(--color-glow-teal)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
