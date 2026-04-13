/**
 * Генерирует пары SVG-стимулов (нейтральный / «тревожный») для dot-probe
 * и перезаписывает src/data/neuroArenaDotProbe.json.
 * Запуск: node scripts/generate-neuro-arena-svgs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public/neuro-arena/dp')
const JSON_OUT = path.join(ROOT, 'src/data/neuroArenaDotProbe.json')

const PAIRS = 56

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function neutralSvg(seed) {
  const rnd = mulberry32(seed * 9973 + 1)
  const cx1 = 32 + rnd() * 24
  const cy1 = 40 + rnd() * 28
  const r1 = 12 + rnd() * 10
  const cx2 = 68 + rnd() * 20
  const cy2 = 48 + rnd() * 24
  const r2 = 8 + rnd() * 8
  const cx3 = 48 + rnd() * 18
  const cy3 = 72 + rnd() * 20
  const r3 = 6 + rnd() * 6
  const rot = rnd() * 40 - 20
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="bg${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8f5f2"/>
      <stop offset="55%" stop-color="#e8dff8"/>
      <stop offset="100%" stop-color="#f0e8fb"/>
    </linearGradient>
    <linearGradient id="c${seed}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6bc4b5"/>
      <stop offset="100%" stop-color="#8fd4c8"/>
    </linearGradient>
    <linearGradient id="d${seed}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b8a4e0"/>
      <stop offset="100%" stop-color="#d4c8f0"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#bg${seed})"/>
  <g transform="rotate(${rot.toFixed(1)} 60 60)">
    <circle cx="${cx1.toFixed(1)}" cy="${cy1.toFixed(1)}" r="${r1.toFixed(1)}" fill="url(#c${seed})" opacity="0.88"/>
    <circle cx="${cx2.toFixed(1)}" cy="${cy2.toFixed(1)}" r="${r2.toFixed(1)}" fill="url(#d${seed})" opacity="0.72"/>
    <circle cx="${cx3.toFixed(1)}" cy="${cy3.toFixed(1)}" r="${r3.toFixed(1)}" fill="#6bc4b5" opacity="0.45"/>
  </g>
  <path d="M20 95 Q60 88 100 95" fill="none" stroke="#6bc4b5" stroke-width="2" stroke-opacity="0.35" stroke-linecap="round"/>
</svg>`
}

function threatSvg(seed) {
  const rnd = mulberry32(seed * 7919 + 17)
  const x0 = 22 + rnd() * 12
  const y0 = 28 + rnd() * 15
  const spikes = 5 + Math.floor(rnd() * 4)
  let d = `M${x0.toFixed(0)} ${y0.toFixed(0)}`
  for (let i = 0; i < spikes; i++) {
    const x = 35 + rnd() * 55
    const y = 35 + rnd() * 55
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`
  }
  d += ' Z'
  const bx = 18 + rnd() * 8
  const by = 70 + rnd() * 12
  const bw = 28 + rnd() * 15
  const bh = 18 + rnd() * 10
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="tb${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdeaea"/>
      <stop offset="100%" stop-color="#f5e0e8"/>
    </linearGradient>
    <linearGradient id="ts${seed}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e8a0a8"/>
      <stop offset="100%" stop-color="#d89a9f"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="14" fill="url(#tb${seed})"/>
  <path d="${d}" fill="none" stroke="url(#ts${seed})" stroke-width="4.5" stroke-linejoin="miter" stroke-linecap="square"/>
  <rect x="${bx.toFixed(0)}" y="${by.toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" rx="4" fill="none" stroke="#c07078" stroke-width="3" transform="rotate(${(-8 + rnd() * 16).toFixed(1)} 60 60)"/>
  <path d="M25 38 L40 52 L25 66 M75 38 L95 55 L75 72" fill="none" stroke="#d89a9f" stroke-width="3.2" stroke-linecap="square"/>
</svg>`
}

const CATS = ['abstract', 'social', 'uncertainty', 'general', 'work']

fs.mkdirSync(OUT_DIR, { recursive: true })

const stimuli = []
for (let i = 1; i <= PAIRS; i++) {
  const id = String(i).padStart(2, '0')
  const nPath = `/neuro-arena/dp/n${id}.svg`
  const tPath = `/neuro-arena/dp/t${id}.svg`
  fs.writeFileSync(path.join(OUT_DIR, `n${id}.svg`), neutralSvg(i), 'utf8')
  fs.writeFileSync(path.join(OUT_DIR, `t${id}.svg`), threatSvg(i), 'utf8')
  stimuli.push({
    id: `dp_art_${id}`,
    category: CATS[(i - 1) % CATS.length],
    neutral: nPath,
    threat: tPath,
  })
}

const doc = {
  meta: {
    version: 2,
    assetKind: 'svg',
    pairCount: PAIRS,
    note: 'Сгенерировано scripts/generate-neuro-arena-svgs.mjs — абстрактные пары для тренировки внимания.',
  },
  stimuli,
}

fs.writeFileSync(JSON_OUT, JSON.stringify(doc, null, 2), 'utf8')
console.log(`Wrote ${PAIRS} pairs (${PAIRS * 2} SVG) → ${OUT_DIR}`)
console.log(`Updated ${JSON_OUT}`)
