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

/**
 * Обёртка без поворота/масштаба: раньше для пар 101–200 добавлялись rotate(±5°) и translate —
 * из‑за этого при первой выдаче пула (стимулы с конца списка) всё выглядело «кривым».
 * Повторы мотивов 1…100 в парах 101…200 допустимы как те же силуэты (разные id файлов).
 */
function wrapSvg(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true" shape-rendering="geometricPrecision">
${inner}
</svg>`
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const stimuli = []
const nMotifs = MOTIFS.length

for (let i = 1; i <= PAIRS; i++) {
  const id = String(i).padStart(2, '0')
  const uid = `p${id}`
  const motifIndex = (i - 1) % nMotifs
  const m = MOTIFS[motifIndex]

  const neutralInner = m.neutral(uid)
  const threatInner = m.threat(uid)

  const neutralSvg = wrapSvg(neutralInner)
  const threatSvg = wrapSvg(threatInner)

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
    version: 13,
    assetKind: 'svg',
    pairCount: PAIRS,
    motifLibrarySize: nMotifs,
    note: 'LIFE v3: 48 гамм фона без подсказки n/t; упрощённый фон SVG; без rotate на очках; только форма отличает n/t.',
  },
  stimuli,
}

fs.writeFileSync(JSON_OUT, JSON.stringify(doc, null, 2), 'utf8')
console.log(`Motifs: ${nMotifs}, pairs: ${PAIRS}`)
console.log(`Wrote → ${OUT_DIR}`)
console.log(`Updated ${JSON_OUT}`)
