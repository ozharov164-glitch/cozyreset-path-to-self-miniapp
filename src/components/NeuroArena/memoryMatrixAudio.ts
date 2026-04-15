/**
 * Звук нажатия — один предзагруженный MP3 → AudioBuffer, воспроизведение через BufferSource (без задержки).
 * Демонстрация цепочки без звука (только визуальная подсветка).
 */

import { publicUrl } from '../../utils/publicUrl'

const TAP_SRC = publicUrl('/neuro-arena/memory-tap.mp3')

const ACtor =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : null

let ctx: AudioContext | null = null
let master: GainNode | null = null
/** Сырые байты MP3 — подгружаем заранее (fetch без AudioContext). */
let mp3Bytes: ArrayBuffer | null = null
let fetchPromise: Promise<ArrayBuffer> | null = null
/** Декодированный буфер — один на все нажатия. */
let tapDecoded: AudioBuffer | null = null

function ensureContext(): AudioContext | null {
  if (!ACtor) return null
  if (!ctx) {
    ctx = new ACtor()
    master = ctx.createGain()
    master.gain.value = 0.88
    master.connect(ctx.destination)
  }
  return ctx
}

/** Вызвать на экране интро: только fetch в фоне, без AudioContext. */
export function preloadMemoryMatrixTap(): void {
  if (typeof window === 'undefined' || mp3Bytes || fetchPromise) return
  fetchPromise = fetch(TAP_SRC)
    .then((r) => {
      if (!r.ok) throw new Error(`memory-tap ${r.status}`)
      return r.arrayBuffer()
    })
    .then((ab) => {
      mp3Bytes = ab
      return ab
    })
    .catch(() => {
      fetchPromise = null
      return new ArrayBuffer(0)
    })
}

/**
 * По клику «Начать»: контекст, decodeAudioData один раз, resume.
 * Если fetch ещё шёл — дождётся (файл маленький).
 */
export async function primeMemoryMatrixAudio(): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    const c = ensureContext()
    if (!c || !master) return

    if (!mp3Bytes) {
      if (!fetchPromise) preloadMemoryMatrixTap()
      if (fetchPromise) await fetchPromise
    }
    if (!mp3Bytes || mp3Bytes.byteLength === 0) return

    if (!tapDecoded) {
      const copy = mp3Bytes.slice(0)
      tapDecoded = await c.decodeAudioData(copy)
    }

    void c.resume()
  } catch {
    /* ignore */
  }
}

function playTapInternal(playbackRate: number): void {
  if (!ctx || !tapDecoded || !master) return
  try {
    void ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = tapDecoded
    src.playbackRate.value = playbackRate
    src.connect(master)
    src.start(0)
  } catch {
    /* ignore */
  }
}

/** Нажатие по ячейке (верно). */
export function playTapCell(_cellIndex: number): void {
  playTapInternal(1)
}

/** Неверное нажатие — тот же семпл чуть ниже по тону. */
export function playTapWrong(): void {
  playTapInternal(0.82)
}

/** Демонстрация: без звука (только подсветка). */
export function playFlashNote(_cellIndex: number): void {
  /* намеренно пусто */
}
