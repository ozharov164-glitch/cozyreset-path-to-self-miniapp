import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiVoiceReply } from '../api/client'

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
    <div className="min-h-screen flex flex-col safe-area pb-6">
      <header className="glass-card h-14 flex items-center px-4 mb-4 rounded-2xl">
        <button
          type="button"
          onClick={onBack}
          className="min-w-[52px] text-left font-medium text-[var(--color-forest-dark)]"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)]">
          Голосовая поддержка
        </h1>
        <span className="w-14" />
      </header>

      <div className="flex-1 flex flex-col max-w-[420px] mx-auto w-full px-3">
        <motion.div
          className="glass-card p-5 mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1 flex items-center gap-2">
            <span aria-hidden>🎙️</span> Ответ голосом
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Напиши, что чувствуешь или о чём хочешь поговорить — ИИ-поддержка ответит тёплым голосом, в стиле приложения.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Например: сегодня тревожно, не могу сосредоточиться..."
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] border border-[var(--color-lavender)]/40 bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-glow-teal)]/50 mb-3"
            style={{ fontSize: 15, lineHeight: 1.5 }}
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-[var(--color-text-primary)] bg-[var(--color-sunset-rose)] hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? 'Генерирую ответ…' : 'Получить ответ голосом'}
          </button>
        </motion.div>

        {audioUrl && (
          <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Ответ ИИ</p>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full h-12"
              style={{ accentColor: 'var(--color-glow-teal)' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
