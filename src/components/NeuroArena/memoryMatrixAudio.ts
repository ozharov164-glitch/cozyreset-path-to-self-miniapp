/**
 * Звуки «Матрицы памяти»: WAV через HTMLAudioElement.
 * В Telegram WebView OscillatorNode/Web Audio часто не слышен; короткий PCM в blob
 * + audio.play() после жеста пользователя работает стабильнее.
 */

const CELL_FREQ_HZ: readonly number[] = [
  261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
]

function writeAscii(view: DataView, offset: number, s: string): void {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
}

/** Моно 16-bit PCM WAV, синус. */
function createSineWav(frequencyHz: number, durationSec: number, volume: number): ArrayBuffer {
  const sampleRate = 44100
  const n = Math.max(1, Math.floor(sampleRate * durationSec))
  const samples = new Int16Array(n)
  const amp = Math.min(0.92, Math.max(0, volume)) * 32767
  for (let i = 0; i < n; i++) {
    samples[i] = Math.round(amp * Math.sin((2 * Math.PI * frequencyHz * i) / sampleRate))
  }
  const dataSize = n * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const v = new DataView(buffer)
  writeAscii(v, 0, 'RIFF')
  v.setUint32(4, 36 + dataSize, true)
  writeAscii(v, 8, 'WAVE')
  writeAscii(v, 12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  writeAscii(v, 36, 'data')
  v.setUint32(40, dataSize, true)
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 2, samples[i]!, true)
  }
  return buffer
}

function playWavBuffer(buf: ArrayBuffer): void {
  try {
    if (typeof window === 'undefined') return
    const url = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
    const a = new Audio(url)
    a.setAttribute('playsinline', 'true')
    a.setAttribute('webkit-playsinline', 'true')
    const revoke = () => {
      try {
        URL.revokeObjectURL(url)
      } catch {
        /* ignore */
      }
    }
    a.addEventListener('ended', revoke, { once: true })
    a.addEventListener('error', revoke, { once: true })
    void a.play().catch(revoke)
  } catch {
    /* ignore */
  }
}

/**
 * Вызывать из клика «Начать» — разблокирует &lt;audio&gt; в WebView (короткий тихий импульс).
 */
export function primeMemoryMatrixAudio(): void {
  const buf = createSineWav(523.25, 0.06, 0.12)
  playWavBuffer(buf)
}

export function playFlashNote(cellIndex: number): void {
  const hz = CELL_FREQ_HZ[Math.max(0, Math.min(CELL_FREQ_HZ.length - 1, cellIndex))]!
  const buf = createSineWav(hz, 0.11, 0.28)
  playWavBuffer(buf)
}

export function playTapCell(cellIndex: number): void {
  const hz = CELL_FREQ_HZ[Math.max(0, Math.min(CELL_FREQ_HZ.length - 1, cellIndex))]!
  const buf = createSineWav(hz, 0.1, 0.42)
  playWavBuffer(buf)
}

export function playTapWrong(): void {
  const buf = createSineWav(130.81, 0.22, 0.35)
  playWavBuffer(buf)
}
