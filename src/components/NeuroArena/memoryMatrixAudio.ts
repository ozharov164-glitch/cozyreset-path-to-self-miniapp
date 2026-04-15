/**
 * Спокойные звуки «Матрицы памяти»: Web Audio + заранее посчитанные буферы.
 * Без генерации WAV/blob на каждый тап — только BufferSource.start(), минимальная задержка.
 */

const ACtor =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : null

/** Пентатоника пониже — мягче, «воздушнее», ближе к нейтральному UI. */
const CELL_FREQ_HZ: readonly number[] = [
  196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0,
]

let ctx: AudioContext | null = null
let cellBuffers: AudioBuffer[] = []
let flashBuffers: AudioBuffer[] = []
let wrongBuffer: AudioBuffer | null = null
let master: GainNode | null = null

/** Мягкий синус: линейная атака, экспоненциальное затухание — без щелчков. */
function renderSoftTone(
  context: AudioContext,
  frequencyHz: number,
  durationSec: number,
  peak: number,
): AudioBuffer {
  const sr = context.sampleRate
  const n = Math.max(32, Math.floor(sr * durationSec))
  const buf = context.createBuffer(1, n, sr)
  const ch = buf.getChannelData(0)
  const attack = Math.floor(sr * 0.05)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const atk = i < attack ? i / Math.max(1, attack) : 1
    const decay = Math.exp(-3.6 * t)
    ch[i] = peak * atk * decay * Math.sin(2 * Math.PI * frequencyHz * t)
  }
  return buf
}

/** Очень тихий двухтон для ошибки — без резких обертонов. */
function renderWrongTone(context: AudioContext): AudioBuffer {
  const sr = context.sampleRate
  const durationSec = 0.36
  const n = Math.floor(sr * durationSec)
  const buf = context.createBuffer(1, n, sr)
  const ch = buf.getChannelData(0)
  const f1 = 130.81
  const f2 = 98.0
  const attack = Math.floor(sr * 0.055)
  const peak = 0.14
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const atk = i < attack ? i / Math.max(1, attack) : 1
    const decay = Math.exp(-3.2 * t)
    const w = 0.58 * Math.sin(2 * Math.PI * f1 * t) + 0.42 * Math.sin(2 * Math.PI * f2 * t)
    ch[i] = peak * atk * decay * w
  }
  return buf
}

function ensureBuffers(): void {
  if (!ctx || cellBuffers.length > 0) return
  const demoPeak = 0.11
  const tapPeak = 0.15
  flashBuffers = CELL_FREQ_HZ.map((hz) => renderSoftTone(ctx!, hz * 0.98, 0.34, demoPeak))
  cellBuffers = CELL_FREQ_HZ.map((hz) => renderSoftTone(ctx!, hz * 0.98, 0.3, tapPeak))
  wrongBuffer = renderWrongTone(ctx!)
}

function playBuffer(buf: AudioBuffer | null | undefined): void {
  if (!ctx || !buf || !master) return
  try {
    void ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(master)
    src.start(0)
  } catch {
    /* ignore */
  }
}

/**
 * Вызвать по клику «Начать» (жест пользователя) — создаёт контекст, буферы, resume.
 */
export function primeMemoryMatrixAudio(): void {
  try {
    if (typeof window === 'undefined' || !ACtor) return
    if (!ctx) {
      ctx = new ACtor()
      master = ctx.createGain()
      master.gain.value = 0.72
      master.connect(ctx.destination)
    }
    ensureBuffers()
    void ctx.resume()
  } catch {
    /* ignore */
  }
}

/** Демонстрация цепочки — чуть тише, чем тап. */
export function playFlashNote(cellIndex: number): void {
  primeMemoryMatrixAudio()
  const i = Math.max(0, Math.min(flashBuffers.length - 1, cellIndex))
  playBuffer(flashBuffers[i] ?? null)
}

export function playTapCell(cellIndex: number): void {
  primeMemoryMatrixAudio()
  const i = Math.max(0, Math.min(cellBuffers.length - 1, cellIndex))
  playBuffer(cellBuffers[i] ?? null)
}

export function playTapWrong(): void {
  primeMemoryMatrixAudio()
  playBuffer(wrongBuffer)
}
