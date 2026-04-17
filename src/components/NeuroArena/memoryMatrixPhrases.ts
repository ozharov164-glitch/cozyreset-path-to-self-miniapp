import raw from '../../data/memoryMatrixPhrases.json'

export type PhraseGender = 'f' | 'm'

const MM_GENDER_KEY = 'mm_phrase_gender'

export function loadPhraseGender(): PhraseGender {
  try {
    const v = localStorage.getItem(MM_GENDER_KEY)
    if (v === 'm' || v === 'f') return v
  } catch {
    /* ignore */
  }
  return 'f'
}

export function savePhraseGender(g: PhraseGender): void {
  try {
    localStorage.setItem(MM_GENDER_KEY, g)
  } catch {
    /* ignore */
  }
}

export type PhraseRow = {
  id: string
  words_f: string[]
  words_m: string[]
}

const data = raw as {
  meta: { version: number; maxWords: number }
  phrases: PhraseRow[]
}

export function getPhrasePool(): PhraseRow[] {
  return data.phrases
}

export function pickRandomPhrase(): PhraseRow {
  const pool = getPhrasePool()
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function wordsForPhrase(p: PhraseRow, gender: PhraseGender): string[] {
  return gender === 'm' ? p.words_m : p.words_f
}

export function prefixWords(words: string[], count: number): string[] {
  if (count <= 0) return []
  return words.slice(0, Math.min(count, words.length))
}

export function joinPhraseWords(words: string[]): string {
  return words.join(' ').replace(/\s+—\s+/g, ' — ').replace(/\s+/g, ' ').trim()
}
