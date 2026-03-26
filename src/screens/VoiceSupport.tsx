import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiVoiceBackgroundPreview, apiVoiceReply } from '../api/client'

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

const SPEEDS = [0.75, 1, 1.25, 1.5] as const

type BgMusicKey = 'calm1' | 'calm2' | 'calm3'

const BG_PREVIEW_SECONDS = 20
const BG_FADE_IN_MS = 350
/** Длинное затухание в конце превью — иначе в наушниках почти не слышно. */
const BG_FADE_OUT_MS = 4500
const BG_START_FALLBACK_MS = 8000
/** Запас до ended, с которого начинаем fade-out (сек). */
const BG_FADE_LEAD_SEC = BG_FADE_OUT_MS / 1000 + 0.45

function effectiveBgDurationSec(audio: HTMLAudioElement): number {
  let d = audio.duration
  if (!Number.isFinite(d) || d <= 0) d = BG_PREVIEW_SECONDS
  // M4A в WebView иногда даёт сильно завышенное значение.
  if (d > BG_PREVIEW_SECONDS + 3) d = BG_PREVIEW_SECONDS
  try {
    if (audio.seekable && audio.seekable.length > 0) {
      const end = audio.seekable.end(audio.seekable.length - 1)
      if (Number.isFinite(end) && end > 0.2) d = Math.min(d, end)
    }
  } catch {
    /* ignore */
  }
  return Math.max(d, BG_FADE_IN_MS / 1000 + 0.5)
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface VoiceSupportProps {
  onBack: () => void
}

export function VoiceSupport({ onBack }: VoiceSupportProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bgPlayError, setBgPlayError] = useState<string | null>(null)
  // Выбранный фон для микширования голосового ответа.
  const [musicKey, setMusicKey] = useState<BgMusicKey>('calm1')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [copyDone, setCopyDone] = useState(false)
  const audioBlobRef = useRef<Blob | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bgPreviewRef = useRef<HTMLAudioElement | null>(null)
  const bgPreviewTimerRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  const [audioReady, setAudioReady] = useState(false)

  // Фоновое предпрослушивание (кнопки "Фон 1/2/3").
  const [, setBgPreviewUrls] = useState<Record<string, string>>({})
  const [bgLoadingKey, setBgLoadingKey] = useState<string | null>(null)
  const [bgPlayingKey, setBgPlayingKey] = useState<string | null>(null)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const bgPreviewUrlsRef = useRef<Record<string, string>>({})
  const bgFadeRafRef = useRef<number | null>(null)
  const bgFadeGenRef = useRef(0)
  const bgStopTimerRef = useRef<number | null>(null)
  const bgStartCheckTimerRef = useRef<number | null>(null)
  const bgPlaySessionRef = useRef(0)
  const bgFadeOutStartedRef = useRef(false)
  const bgPlannedFadeTimerRef = useRef<number | null>(null)
  const bgEndRafRef = useRef<number | null>(null)

  const stopBg = useCallback(async (fadeMs = BG_FADE_OUT_MS): Promise<void> => {
    const audio = bgAudioRef.current
    if (!audio) return

    if (bgEndRafRef.current != null) {
      window.cancelAnimationFrame(bgEndRafRef.current)
      bgEndRafRef.current = null
    }
    if (bgStopTimerRef.current != null) {
      window.clearTimeout(bgStopTimerRef.current)
      bgStopTimerRef.current = null
    }
    if (bgStartCheckTimerRef.current != null) {
      window.clearTimeout(bgStartCheckTimerRef.current)
      bgStartCheckTimerRef.current = null
    }
    if (bgPlannedFadeTimerRef.current != null) {
      window.clearTimeout(bgPlannedFadeTimerRef.current)
      bgPlannedFadeTimerRef.current = null
    }

    bgFadeGenRef.current += 1
    const gen = bgFadeGenRef.current
    bgFadeOutStartedRef.current = true

    const from = audio.volume
    const start = performance.now()
    const step = (t: number) => {
      if (gen !== bgFadeGenRef.current) return
      const p = Math.min(1, (t - start) / Math.max(1, fadeMs))
      audio.volume = from + (0 - from) * p
      if (p < 1) {
        bgFadeRafRef.current = window.requestAnimationFrame(step)
      }
    }

    if (bgFadeRafRef.current != null) {
      window.cancelAnimationFrame(bgFadeRafRef.current)
    }
    bgFadeRafRef.current = window.requestAnimationFrame(step)

    window.setTimeout(() => {
      try {
        if (gen === bgFadeGenRef.current) {
          audio.pause()
          audio.currentTime = 0
          audio.volume = 0
          setBgPlayingKey(null)
        }
      } catch {
        /* ignore */
      }
    }, fadeMs + 30)

    await new Promise((r) => window.setTimeout(r, fadeMs + 50))
  }, [])

  const playBg = useCallback(
    async (key: BgMusicKey) => {
      setBgPlayError(null)
      const audio = bgAudioRef.current
      if (!audio) return

      bgPlaySessionRef.current += 1
      const session = bgPlaySessionRef.current

      // Очистим таймеры предыдущего проигрывания.
      if (bgEndRafRef.current != null) {
        window.cancelAnimationFrame(bgEndRafRef.current)
        bgEndRafRef.current = null
      }
      if (bgStopTimerRef.current != null) {
        window.clearTimeout(bgStopTimerRef.current)
        bgStopTimerRef.current = null
      }
      if (bgStartCheckTimerRef.current != null) {
        window.clearTimeout(bgStartCheckTimerRef.current)
        bgStartCheckTimerRef.current = null
      }
      if (bgPlannedFadeTimerRef.current != null) {
        window.clearTimeout(bgPlannedFadeTimerRef.current)
        bgPlannedFadeTimerRef.current = null
      }

      const ensureUrl = async (k: BgMusicKey): Promise<string | null> => {
        let u = bgPreviewUrlsRef.current[k]
        if (u) return u
        setBgLoadingKey(k)
        const blob = await apiVoiceBackgroundPreview(k)
        setBgLoadingKey(null)
        if (!blob) return null
        u = URL.createObjectURL(blob)
        bgPreviewUrlsRef.current[k] = u
        setBgPreviewUrls((prev) => (prev[k] ? prev : { ...prev, [k]: u }))
        return u
      }

      const startWithUrl = async (startKey: BgMusicKey, startUrl: string): Promise<boolean> => {
        bgFadeOutStartedRef.current = false
        try {
          if (audio.src !== startUrl) audio.src = startUrl
          audio.currentTime = 0
          audio.volume = 0.15
          audio.pause()
        } catch {
          /* ignore */
        }

        try {
          await audio.play()
        } catch {
          return false
        }

        bgFadeGenRef.current += 1
        const gen = bgFadeGenRef.current
        const fadeMs = BG_FADE_IN_MS
        const start = performance.now()
        const from = 0.15
        const step = (t: number) => {
          if (gen !== bgFadeGenRef.current) return
          const p = Math.min(1, (t - start) / Math.max(1, fadeMs))
          audio.volume = from + (1 - from) * p
          if (p < 1) bgFadeRafRef.current = window.requestAnimationFrame(step)
        }
        if (bgFadeRafRef.current != null) window.cancelAnimationFrame(bgFadeRafRef.current)
        bgFadeRafRef.current = window.requestAnimationFrame(step)
        setBgPlayingKey(startKey)
        return true
      }

      const url = await ensureUrl(key)
      if (!url) return

      let ok = await startWithUrl(key, url)
      if (!ok && key !== 'calm1') ok = await startWithUrl(key, url)

      if (!ok) {
        if (key !== 'calm1') {
          setBgPlayError('Фон не стартовал — включён Фон 1.')
          const fallbackUrl = await ensureUrl('calm1')
          if (fallbackUrl) ok = await startWithUrl('calm1', fallbackUrl)
        } else {
          setBgPlayError('Не удалось воспроизвести фон. Попробуй ещё раз.')
        }
      }

      if (!ok) return

      // Конец превью: на iOS duration/currentTime и timeupdate часто врут — каждый кадр
      // сравниваем прогресс со стеной времени и с effectiveBgDurationSec (seekable + запас 20 с).
      const playWallStartedAt = performance.now()
      const tickEndFade = () => {
        if (bgPlaySessionRef.current !== session || bgFadeOutStartedRef.current) return
        try {
          const d = effectiveBgDurationSec(audio)
          const wallSec = (performance.now() - playWallStartedAt) / 1000
          const pos = Math.max(audio.currentTime, Math.min(wallSec, d + 0.25))
          if (d - pos <= BG_FADE_LEAD_SEC) {
            void stopBg(BG_FADE_OUT_MS)
            return
          }
        } catch {
          /* ignore */
        }
        bgEndRafRef.current = window.requestAnimationFrame(tickEndFade)
      }
      bgEndRafRef.current = window.requestAnimationFrame(tickEndFade)

      // Жёсткий запас: даже если rAF «заморозится», к концу отрезка всё равно плавно гасим.
      const backupMs = Math.max(0, Math.floor((BG_PREVIEW_SECONDS - BG_FADE_LEAD_SEC) * 1000))
      bgPlannedFadeTimerRef.current = window.setTimeout(() => {
        if (bgPlaySessionRef.current !== session || bgFadeOutStartedRef.current) return
        void stopBg(BG_FADE_OUT_MS)
      }, Math.min(backupMs, 2147483647))

      bgStopTimerRef.current = window.setTimeout(() => {
        if (bgPlaySessionRef.current !== session) return
        void stopBg(BG_FADE_OUT_MS)
      }, BG_PREVIEW_SECONDS * 1000 + 400)

      // Мягкая проверка: если спустя время аудио всё ещё на паузе — откат.
      bgStartCheckTimerRef.current = window.setTimeout(() => {
        if (bgPlaySessionRef.current !== session) return
        if (audio.paused && key !== 'calm1') {
          setBgPlayError('Фон 2 не стартовал — включён Фон 1.')
          const fallbackKey: BgMusicKey = 'calm1'
          const fallbackUrl = bgPreviewUrlsRef.current[fallbackKey]
          if (fallbackUrl) void startWithUrl(fallbackKey, fallbackUrl)
        }
      }, BG_START_FALLBACK_MS)
    },
    [stopBg],
  )

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (bgPreviewRef.current) {
        try {
          bgPreviewRef.current.pause()
        } catch {
          /* ignore */
        }
        bgPreviewRef.current.src = ''
      }
      if (bgPreviewTimerRef.current) {
        window.clearTimeout(bgPreviewTimerRef.current)
      }
    }
  }, [audioUrl])

  useEffect(() => {
    const audio = bgAudioRef.current
    if (!audio) return
    const onEnded = () => {
      if (bgEndRafRef.current != null) {
        window.cancelAnimationFrame(bgEndRafRef.current)
        bgEndRafRef.current = null
      }
      if (bgPlannedFadeTimerRef.current != null) {
        window.clearTimeout(bgPlannedFadeTimerRef.current)
        bgPlannedFadeTimerRef.current = null
      }
      setBgPlayingKey(null)
      try {
        audio.volume = 0
        audio.currentTime = 0
      } catch {
        /* ignore */
      }
    }
    const onTimeUpdate = () => {
      if (!bgPlayingKey) return
      if (bgFadeOutStartedRef.current) return
      try {
        const dur = effectiveBgDurationSec(audio)
        if (dur - audio.currentTime <= BG_FADE_LEAD_SEC) void stopBg(BG_FADE_OUT_MS)
      } catch {
        /* ignore */
      }
    }
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [bgPlayingKey, stopBg])

  // Предзагружаем фоны 1/2/3, чтобы по кнопке звук начинался без ожидания.
  useEffect(() => {
    let cancelled = false
    const keys: Array<BgMusicKey> = ['calm1', 'calm2', 'calm3']
    async function load() {
      const next: Record<string, string> = {}
      for (const k of keys) {
        setBgLoadingKey(k)
        const blob = await apiVoiceBackgroundPreview(k)
        if (cancelled) return
        setBgLoadingKey(null)
        if (blob) {
          next[k] = URL.createObjectURL(blob)
        }
      }
      if (cancelled) return
      setBgPreviewUrls((prev) => {
        // revoke старых если были
        Object.values(prev).forEach((u) => {
          try {
            URL.revokeObjectURL(u)
          } catch {
            /* ignore */
          }
        })
        const merged = { ...prev, ...next }
        bgPreviewUrlsRef.current = merged
        return merged
      })
    }
    void load()
    return () => {
      cancelled = true
      const urls = Object.values(bgPreviewUrlsRef.current)
      urls.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {
          /* ignore */
        }
      })
      stopBg(200)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!audioUrl) {
      setAudioReady(false)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [audioUrl])

  const setAudioRef = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el
    setAudioReady(!!el)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    if (Number.isFinite(audio.duration)) setDuration(audio.duration)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [audioUrl, audioReady])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.playbackRate = playbackRate
  }, [audioReady, playbackRate])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
  }, [isPlaying])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    const audio = audioRef.current
    if (audio && Number.isFinite(v)) {
      audio.currentTime = v
      setCurrentTime(v)
    }
  }, [])

  const copyDownloadLink = useCallback(() => {
    if (!downloadUrl) return
    navigator.clipboard?.writeText(downloadUrl).then(() => {
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2500)
    })
  }, [downloadUrl])

  const handleDownload = useCallback(async () => {
    const blob = audioBlobRef.current
    if (!blob) return
    const dateStr = new Date().toISOString().slice(0, 10)
    const filename = `golosovaya-podderzhka-${dateStr}.mp3`
    const file = new File([blob], filename, { type: 'audio/mpeg' })

    // Web Share API: меню «Поделиться» → «Сохранить в Файлы»; пользователь остаётся в приложении
    if (typeof navigator.share === 'function') {
      try {
        const canShare = typeof navigator.canShare === 'function' ? navigator.canShare({ files: [file] }) : true
        if (canShare) {
          await navigator.share({
            files: [file],
            title: 'Голосовая поддержка',
            text: 'Ответ ИИ',
          })
          return
        }
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return // пользователь закрыл меню
      }
    }

    // Fallback: программная загрузка (десктоп)
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
  }, [])

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
    await stopBg(200)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    audioBlobRef.current = null
    setDownloadUrl(null)
    setCopyDone(false)
    setLoading(true)
    try {
      const result = await apiVoiceReply(trimmed, musicKey)
      if ('error' in result) {
        setError(result.error || 'Ошибка запроса')
        return
      }
      audioBlobRef.current = result.blob
      if (result.downloadUrl) setDownloadUrl(result.downloadUrl)
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
        className="card-premium flex items-center px-4 mb-5 rounded-2xl h-14"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <button
          type="button"
            onClick={() => {
              void stopBg(250)
              onBack()
            }}
          className="min-w-[52px] text-left font-semibold text-[var(--color-forest-dark)] active:opacity-80 transition-opacity"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
        >
          ← Назад
        </button>
        <h1 className="font-display flex-1 text-center text-base font-bold text-[var(--color-text-primary)] tracking-tight">
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
        {/* Тихий аудиоплеер для предпрослушивания фона (кнопки "Фон 1/2") */}
        <audio ref={bgAudioRef} preload="auto" className="hidden" />

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
              className="text-sm text-[var(--color-text-secondary)] mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Напиши, что чувствуешь или о чём хочешь поговорить — ИИ-поддержка ответит тёплым голосом.
            </motion.p>
            <motion.p
              className="text-xs text-[var(--color-text-secondary)] mb-4 opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontStyle: 'italic' }}
            >
              Голосовой ответ не сохраняется после выхода из раздела или приложения. Чтобы слушать повторно — сохрани его в Файлы внизу.
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

            {/* Выбор фона для микширования голосового ответа + предпрослушивание */}
            <div className="flex gap-3 mb-4">
              {(['calm1', 'calm2', 'calm3'] as const).map((k) => {
                const isSelected = musicKey === k
                const isPlaying = bgPlayingKey === k
                return (
                  <motion.button
                    key={k}
                    type="button"
                    onClick={async () => {
                      // 1) Повторный клик по активному фону → плавно затухаем и стоп.
                      if (isSelected && isPlaying) {
                        await stopBg(BG_FADE_OUT_MS)
                        return
                      }

                      // 2) Переключение фона во время проигрывания → сначала плавно гасим текущий, потом стартуем новый.
                      if (bgPlayingKey && bgPlayingKey !== k) {
                        await stopBg(BG_FADE_OUT_MS)
                      }

                      setMusicKey(k)
                      await playBg(k)
                    }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3.5 px-3 rounded-xl text-sm font-semibold relative overflow-hidden transition-all duration-300"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(145deg, rgba(125,211,192,0.65) 0%, rgba(90,184,168,0.35) 100%)'
                        : 'rgba(255,255,255,0.35)',
                      border: isSelected ? '1px solid rgba(125,211,192,0.8)' : '1px solid rgba(201,184,232,0.45)',
                      boxShadow: isSelected
                        ? '0 10px 30px rgba(125,211,192,0.22), inset 0 1px 0 rgba(255,255,255,0.25)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.12)',
                      color: 'var(--color-forest-dark)',
                    }}
                    animate={
                      isSelected && bgLoadingKey === null
                        ? {
                            boxShadow: [
                              '0 10px 30px rgba(125,211,192,0.22), inset 0 1px 0 rgba(255,255,255,0.25)',
                              '0 10px 55px rgba(125,211,192,0.32), inset 0 1px 0 rgba(255,255,255,0.35)',
                              '0 10px 30px rgba(125,211,192,0.22), inset 0 1px 0 rgba(255,255,255,0.25)',
                            ],
                          }
                        : undefined
                    }
                    transition={{ duration: 1.8, repeat: isSelected ? Infinity : 0 }}
                  >
                    {/* премиум анимация “сияния” */}
                    {isSelected && (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,255,255,0.55), transparent 60%)',
                        }}
                        animate={{ opacity: isPlaying ? 1 : 0.55 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span aria-hidden>🎧</span> Фон {k === 'calm1' ? '1' : k === 'calm2' ? '2' : '3'}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            {bgPlayError && (
              <motion.p
                className="text-xs text-rose-600 mt-[-10px] mb-4"
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {bgPlayError}
              </motion.p>
            )}

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
                  Ответ готовится (до 3 минут)…
                </span>
              </motion.div>
            )}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl btn-primary min-h-[48px] relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
              whileHover={!loading ? { scale: 1.02 } : {}}
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
                background: 'linear-gradient(160deg, rgba(125,211,192,0.18) 0%, rgba(255,255,255,0.22) 40%, rgba(248,252,251,0.2) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(125,211,192,0.4)',
                boxShadow: '0 12px 40px rgba(90,184,168,0.18), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 1px rgba(125,211,192,0.08)',
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-60"
                style={{
                  background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(125,211,192,0.25), transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(255,255,255,0.15), transparent)',
                }}
              />
              <audio ref={setAudioRef} src={audioUrl} preload="metadata" className="hidden" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.span
                    className="text-xl"
                    animate={isPlaying ? { scale: [1, 1.1, 1], opacity: [1, 0.9, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    ✨
                  </motion.span>
                  <p className="text-sm font-semibold text-[var(--color-forest-dark)] tracking-tight">Ответ ИИ</p>
                </div>

                <div
                  className="rounded-xl p-3.5 mb-4 flex items-start gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,212,166,0.22) 0%, rgba(232,220,235,0.18) 100%)',
                    border: '1px solid rgba(184,164,224,0.35)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                >
                  <span className="flex-shrink-0 text-lg leading-none mt-0.5" aria-hidden>
                    💡
                  </span>
                  <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug" style={{ color: 'var(--color-forest-dark)' }}>
                    Ответ в голосовом формате не сохраняется после выхода из раздела или закрытия приложения. Чтобы прослушивать его повторно — сохрани файл кнопкой ниже.
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 100%)',
                    boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.6), 0 4px 16px rgba(45,62,46,0.08)',
                    border: '1px solid rgba(255,255,255,0.6)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={togglePlay}
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(145deg, #5ab8a8 0%, #7dd3c0 100%)',
                        boxShadow: '0 4px 14px rgba(90,184,168,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                        border: '1px solid rgba(255,255,255,0.35)',
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(90,184,168,0.45)' }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ marginLeft: 2 }}>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
                          {formatTime(currentTime)}
                        </span>
                        <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
                          {formatTime(duration)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={seek}
                        className="voice-progress w-full cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--color-glow-teal) 0%, var(--color-glow-teal) ${(duration ? (currentTime / duration) * 100 : 0)}%, rgba(201,184,232,0.35) ${(duration ? (currentTime / duration) * 100 : 0)}%, rgba(201,184,232,0.35) 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs text-[var(--color-text-secondary)]">Скорость</span>
                  <div className="flex gap-1.5">
                    {SPEEDS.map((speed) => (
                      <motion.button
                        key={speed}
                        type="button"
                        onClick={() => setPlaybackRate(speed)}
                        className="min-w-[2.5rem] py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors"
                        style={{
                          background: playbackRate === speed
                            ? 'linear-gradient(145deg, rgba(125,211,192,0.5) 0%, rgba(90,184,168,0.4) 100%)'
                            : 'rgba(255,255,255,0.4)',
                          color: playbackRate === speed ? 'var(--color-forest-dark)' : 'var(--color-text-secondary)',
                          border: `1px solid ${playbackRate === speed ? 'rgba(125,211,192,0.5)' : 'rgba(255,255,255,0.5)'}`,
                          boxShadow: playbackRate === speed ? 'inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {speed === 1 ? '1×' : `${speed}×`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => void handleDownload()}
                  className="w-full py-3.5 px-4 rounded-xl min-h-[48px] flex items-center justify-center gap-2.5 font-semibold text-[var(--color-forest-dark)] relative overflow-hidden transition-all duration-300"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,252,251,0.9) 100%)',
                    border: '2px solid rgba(125,211,192,0.6)',
                    boxShadow: '0 4px 16px rgba(90,184,168,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
                    color: 'var(--color-forest-dark)',
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 6px 24px rgba(90,184,168,0.35), inset 0 1px 0 rgba(255,255,255,0.9)',
                    borderColor: 'rgba(125,211,192,0.85)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Сохранить в Файлы</span>
                </motion.button>
                {downloadUrl && (
                  <button
                    type="button"
                    onClick={copyDownloadLink}
                    className="mt-2 w-full py-2 px-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] border border-[rgba(125,211,192,0.4)] bg-transparent active:opacity-80"
                  >
                    {copyDone ? 'Ссылка скопирована' : 'Скопировать ссылку для скачивания'}
                  </button>
                )}
                <p className="text-xs text-[var(--color-text-secondary)] text-center mt-2">
                  Меню «Поделиться» → «Сохранить в Файлы». Можно вернуться и слушать здесь, потом — из сохранённого
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
