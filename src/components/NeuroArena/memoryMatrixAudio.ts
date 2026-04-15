/**
 * Лёгкие синтезированные звуки для «Матрицы памяти» (без внешних файлов).
 * Громкость низкая, чтобы не раздражать при повторных нажатиях.
 */

const BASE_VOL = 0.11

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  return new AC()
}

let ctxSingleton: AudioContext | null = null

export function resumeMemoryMatrixAudio(): void {
  try {
    if (!ctxSingleton) ctxSingleton = getAudioContext()
    if (ctxSingleton?.state === 'suspended') void ctxSingleton.resume()
  } catch {
    /* ignore */
  }
}

/** Нота для ячейки: пентатоника — без диссонансов при быстром переключении. */
const CELL_FREQ_HZ: readonly number[] = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
]

function playTone(opts: {
  frequencyHz: number
  durationSec: number
  type?: OscillatorType
  peakGain?: number
}): void {
  try {
    if (!ctxSingleton) ctxSingleton = getAudioContext()
    const ctx = ctxSingleton
    if (!ctx) return
    if (ctx.state === 'suspended') void ctx.resume()

    const t0 = ctx.currentTime
    const dur = Math.max(0.04, opts.durationSec)
    const peak = opts.peakGain ?? BASE_VOL

    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = opts.type ?? 'sine'
    osc.frequency.setValueAtTime(opts.frequencyHz, t0)

    g.gain.setValueAtTime(0.0001, t0)
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)

    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + dur + 0.03)
  } catch {
    /* Safari / автозапуск и т.д. */
  }
}

export function playFlashNote(cellIndex: number): void {
  const hz = CELL_FREQ_HZ[Math.max(0, Math.min(CELL_FREQ_HZ.length - 1, cellIndex))]!
  playTone({ frequencyHz: hz, durationSec: 0.11, type: 'sine', peakGain: 0.1 })
}

export function playTapCorrect(): void {
  playTone({ frequencyHz: 523.25, durationSec: 0.06, type: 'sine', peakGain: 0.09 })
}

export function playTapWrong(): void {
  playTone({ frequencyHz: 130.81, durationSec: 0.22, type: 'triangle', peakGain: 0.12 })
}
