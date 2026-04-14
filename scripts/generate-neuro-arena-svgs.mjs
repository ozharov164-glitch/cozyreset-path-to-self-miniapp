/**
 * Генерирует пары SVG для dot-probe: бытовые узнаваемые иконки, пастель по мотиву.
 * Запуск: node scripts/generate-neuro-arena-svgs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildDailyMotifs } from './neuroArenaDailyMotifs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public/neuro-arena/dp')
const JSON_OUT = path.join(ROOT, 'src/data/neuroArenaDotProbe.json')

/** Пул файлов n01…nXX (дублирование мотивов с alt-трансформом только при i > числа мотивов). */
const PAIRS = 200

const MOTIFS = [...buildDailyMotifs({ motifIndexStart: 0 })]

/** Второй проход: разный лёгкий сдвиг/поворот по индексу, чтобы повторы мотивов отличались. */
function wrapSvg(inner, altPass, pairIndex) {
  if (!altPass) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">
${inner}
</svg>`
  }
  const rot = pairIndex % 2 === 0 ? 5 : -5
  const tx = pairIndex % 3 === 1 ? 6 : pairIndex % 3 === 2 ? -4 : 2
  const ty = pairIndex % 4 === 0 ? -4 : 3
  const sc = 0.94 + (pairIndex % 5) * 0.01
  const g = `<g transform="translate(${tx} ${ty}) rotate(${rot} 60 60) scale(${sc.toFixed(3)})">${inner}</g>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">
${g}
</svg>`
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const stimuli = []
const nMotifs = MOTIFS.length

for (let i = 1; i <= PAIRS; i++) {
  const id = String(i).padStart(2, '0')
  const uid = `p${id}`
  const motifIndex = (i - 1) % nMotifs
  const altPass = i > nMotifs
  const m = MOTIFS[motifIndex]

  const neutralInner = m.neutral(uid)
  const threatInner = m.threat(uid)

  const neutralSvg = wrapSvg(neutralInner, altPass, i)
  const threatSvg = wrapSvg(threatInner, altPass, i)

  fs.writeFileSync(path.join(OUT_DIR, `n${id}.svg`), neutralSvg, 'utf8')
  fs.writeFileSync(path.join(OUT_DIR, `t${id}.svg`), threatSvg, 'utf8')

  stimuli.push({
    id: `dp_art_${id}`,
    category: m.category,
    neutral: `/neuro-arena/dp/n${id}.svg`,
    threat: `/neuro-arena/dp/t${id}.svg`,
  })
}

const doc = {
  meta: {
    version: 11,
    assetKind: 'svg',
    pairCount: PAIRS,
    motifLibrarySize: nMotifs,
    note: 'LIFE v1: 100 бытовых узнаваемых пар; без спиц на колёсах и без разметки на кругах; пастель по мотиву; без цветового кода ответа.',
  },
  stimuli,
}

fs.writeFileSync(JSON_OUT, JSON.stringify(doc, null, 2), 'utf8')
console.log(`Motifs: ${nMotifs}, pairs: ${PAIRS} (alt transform for i>${nMotifs})`)
console.log(`Wrote → ${OUT_DIR}`)
console.log(`Updated ${JSON_OUT}`)
