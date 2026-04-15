/**
 * Лёгкие синтезированные звуки для «Матрицы памяти» (без внешних файлов).
 * В Telegram / iOS WebView AudioContext нужно явно разблокировать жестом пользователя
 * и при необходимости дождаться resume() перед планированием осцилляторов.
 */

const BASE_VOL = 0.14

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  return new AC()
}

let ctxSingleton: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  if (!ctxSingleton) ctxSingleton = getAudioContext()
  return ctxSingleton
}

/**
 * Вызывать из обработчика клика «Начать»: разблокирует воспроизведение в WebView
 * (бесшумный кадр + resume).
 */
export function primeMemoryMatrixAudio(): void {
  try {
    const ctx = ensureCtx()
    if (!ctx) return
    void ctx.resume()
    const buf = ctx.createBuffer(1, 1, Math.max(8000, ctx.sampleRate))
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
  } catch {
    /* ignore */
  }
}

export function resumeMemoryMatrixAudio(): void {
  try {
    const ctx = ensureCtx()
    if (!ctx) return
    void ctx.resume()
  } catch {
    /* ignore */
  }
}

/** Нота для ячейки: пентатоника — без диссонансов при быстром переключении. */
const CELL_FREQ_HZ: readonly number[] = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
]

function scheduleTone(opts: {
  frequencyHz: number
  durationSec: number
  type?: OscillatorType
  peakGain?: number
}): void {
  const ctx = ctxSingleton
  if (!ctx) return

  const dur = Math.max(0.055, opts.durationSec)
  const peak = Math.min(0.35, opts.peakGain ?? BASE_VOL)
  const t0 = ctx.currentTime + 0.002

  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(opts.frequencyHz, t0)

  /* linearRamp надёжнее exponential в Safari/WebKit при малых значениях */
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + 0.006)
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur)

  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function playTone(opts: Parameters<typeof scheduleTone>[0]): void {
  try {
    if (!ensureCtx()) return

    const run = () => {
      try {
        scheduleTone(opts)
      } catch {
        /* ignore */
      }
    }

    const ctx = ctxSingleton!
    if (ctx.state === 'suspended') {
      void ctx.resume().then(run).catch(run)
    } else {
      run()
    }
  } catch {
    /* ignore */
  }
}

export function playFlashNote(cellIndex: number): void {
  const hz = CELL_FREQ_HZ[Math.max(0, Math.min(CELL_FREQ_HZ.length - 1, cellIndex))]!
  playTone({ frequencyHz: hz, durationSec: 0.12, type: 'sine', peakGain: 0.12 })
}

/** Звук нажатия по ячейке — та же высота, что и при демонстрации, чуть дольше и громче. */
export function playTapCell(cellIndex: number): void {
  const hz = CELL_FREQ_HZ[Math.max(0, Math.min(CELL_FREQ_HZ.length - 1, cellIndex))]!
  playTone({ frequencyHz: hz, durationSec: 0.1, type: 'sine', peakGain: 0.2 })
}

export function playTapWrong(): void {
  playTone({ frequencyHz: 130.81, durationSec: 0.24, type: 'triangle', peakGain: 0.16 })
}
