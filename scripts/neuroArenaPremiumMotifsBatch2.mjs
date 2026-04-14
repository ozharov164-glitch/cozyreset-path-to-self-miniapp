/**
 * Доп. премиум-пары: цветные пастели, объём; без цветового кода ответа.
 */
import { makePalette, cardBgColored } from './neuroArenaPremiumPalette.mjs'

export function buildPremiumMotifsBatch2({ motifIndexStart = 0 }) {
  let ix = motifIndexStart
  const G = (u, i, P) => `<defs><linearGradient id="p2-${u}-x${i}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${P.volTop}"/><stop offset="100%" stop-color="${P.volBot}"/></linearGradient></defs>`

  const bind = (neutral, threat) => {
    const idx = ix++
    return {
      category: 'premium',
      neutral: (u) => neutral(u, makePalette(idx)),
      threat: (u) => threat(u, makePalette(idx)),
    }
  }

  return [
    bind(
      (u, P) => `${cardBgColored(u, P)}${G(u, 1, P)}
  <path d="M52 78 V56 Q60 44 68 56 V78" fill="none" stroke="${P.line}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M48 56 Q60 48 72 56" fill="none" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="60" cy="52" rx="14" ry="6" fill="url(#p2-${u}-x1)" stroke="${P.line}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}${G(u, 2, P)}
  <path d="M50 78 V54 Q60 42 70 54 V78" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M46 54 L50 48 M74 54 L70 48" stroke="${P.inkM}" stroke-width="2"/>
  <ellipse cx="60" cy="50" rx="12" ry="5" fill="url(#p2-${u}-x2)" stroke="${P.ink}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 52 H76 Q80 52 80 56 V68 Q80 72 76 72 H44 Q40 72 40 68 V56 Q40 52 44 52" fill="${P.cream}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M56 48 V42 M52 44 H64" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>
  <path d="M48 56 H72" stroke="${P.lineL}" stroke-width="1.5" opacity="0.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 54 H78 Q82 54 82 58 V70 Q82 74 78 74 H42 Q38 74 38 70 V58 Q38 54 42 54" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 48 L60 40 L66 48" fill="none" stroke="${P.inkM}" stroke-width="2"/>
  <path d="M50 60 H70" stroke="${P.ink}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}${G(u, 3, P)}
  <path d="M52 42 Q60 36 68 42 Q72 52 68 68 Q60 78 52 68 Q44 78 36 68 Q32 52 36 42 Q44 36 52 42" fill="url(#p2-${u}-x3)" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M60 36 V32" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}${G(u, 4, P)}
  <path d="M50 40 Q60 34 70 40 Q74 54 70 70 Q60 80 50 70 Q40 80 30 70 Q26 54 30 40 Q40 34 50 40" fill="url(#p2-${u}-x4)" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 60 L64 52" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <line x1="58" y1="38" x2="62" y2="44" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="60" cy="52" r="10" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/>
  <path d="M56 58 Q60 62 64 58" fill="none" stroke="${P.line}" stroke-width="1.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M56 40 L60 36 L64 40" fill="none" stroke="${P.inkM}" stroke-width="2"/>
  <circle cx="60" cy="54" r="11" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M56 60 H64" stroke="${P.ink}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 72 L52 48 L68 48 L72 72 Z" fill="${P.cream}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="60" cy="52" rx="10" ry="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 74 L50 46 L70 46 L74 74 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 54 L60 62 L66 54" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 58 Q60 48 76 58 Q60 72 44 58" fill="${P.cream2}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M52 56 Q60 52 68 56" fill="none" stroke="${P.lineM}" stroke-width="1.5" opacity="0.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 60 Q60 46 78 60 Q60 76 42 60" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M50 56 L56 62 L62 56 L68 62" fill="none" stroke="${P.inkM}" stroke-width="1.8"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="58" rx="22" ry="14" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>
  <path d="M48 54 Q60 48 72 54" fill="none" stroke="${P.lineM}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="58" rx="22" ry="14" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 56 L58 50 L64 56 L70 50" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <rect x="48" y="44" width="24" height="32" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <circle cx="54" cy="56" r="3" fill="${P.lineM}"/><circle cx="66" cy="56" r="3" fill="${P.lineM}"/>
  <path d="M52 66 H68" stroke="${P.line}" stroke-width="1.8" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <rect x="46" y="42" width="28" height="36" rx="3" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 54 H68 M52 62 H64" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="60" rx="26" ry="8" fill="${P.fill}" stroke="${P.line}" stroke-width="2"/>
  <path d="M60 44 V56" stroke="${P.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="62" rx="28" ry="10" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2"/>
  <path d="M52 46 L56 40 L60 46 L64 40 L68 46" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M52 72 V48 L60 40 L68 48 V72" fill="${P.cream}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M56 52 H64 M56 60 H62" stroke="${P.lineM}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 74 V46 L60 36 L70 46 V74" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 54 L60 62 L66 54" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}${G(u, 5, P)}
  <circle cx="60" cy="58" r="20" fill="url(#p2-${u}-x5)" stroke="${P.line}" stroke-width="2"/>
  <path d="M52 52 H68 M60 46 V64" stroke="${P.lineM}" stroke-width="1.8" opacity="0.55"/>`,
      (u, P) => `${cardBgColored(u, P)}${G(u, 6, P)}
  <circle cx="60" cy="58" r="20" fill="url(#p2-${u}-x6)" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 70 L48 46 H72 L76 70 Z" fill="${P.white}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M52 58 H68 M52 64 H62" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 72 L46 44 H74 L78 72 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M50 56 L60 66 L70 56" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 62 Q60 50 72 62 Q60 74 48 62" fill="${P.fill}" stroke="${P.line}" stroke-width="2"/>
  <line x1="60" y1="44" x2="60" y2="52" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 64 Q60 48 74 64 Q60 80 46 64" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 52 L60 44 L66 52" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 68 L52 44 H68 L78 68 Z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M52 56 H68" stroke="${P.lineM}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 70 L50 42 H70 L80 70 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 54 L56 62 L64 54 L72 62" fill="none" stroke="${P.inkM}" stroke-width="1.8"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 78 V52 L60 44 L70 52 V78" fill="none" stroke="${P.line}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M54 52 H66" stroke="${P.lineM}" stroke-width="2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 78 V50 L60 40 L72 50 V78" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M44 56 L76 56" stroke="${P.inkM}" stroke-width="2" stroke-dasharray="3 3"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <rect x="46" y="48" width="28" height="24" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M50 56 H70 M50 62 H64" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 50 L52 44 L76 50 L76 74 H44 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 58 H72" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="48" cy="58" r="6" fill="none" stroke="${P.line}" stroke-width="2"/>
  <circle cx="72" cy="58" r="6" fill="none" stroke="${P.line}" stroke-width="2"/>
  <path d="M48 58 H72" stroke="${P.lineM}" stroke-width="2.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="46" cy="60" r="6" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <circle cx="74" cy="56" r="6" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M44 62 L76 54" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 72 Q60 40 80 72" fill="none" stroke="${P.lineM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="48" r="4" fill="${P.line}"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M38 74 Q60 38 82 74" fill="none" stroke="${P.ink}" stroke-width="3.5"/>
  <path d="M52 46 L58 54 L64 46 L70 54" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M52 44 L60 38 L68 44 V74 H52 Z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>
  <circle cx="60" cy="54" r="5" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 46 L60 36 L70 46 V76 H50 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M56 58 L60 64 L64 58" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M38 62 H82 V72 H38 Z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/>
  <path d="M42 62 V56 L48 50 L54 56 L60 50 L66 56 L72 50 L78 56 V62" fill="none" stroke="${P.lineM}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M36 64 H84 V74 H36 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M42 64 V58 L50 52 L58 58 L66 52 L74 58 L78 64" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <rect x="44" y="50" width="32" height="22" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M50 58 H70" stroke="${P.lineL}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <rect x="42" y="48" width="36" height="26" rx="3" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 56 H72 M48 64 H66" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="18" fill="none" stroke="${P.lineM}" stroke-width="2.5"/>
  <circle cx="60" cy="58" r="10" fill="none" stroke="${P.line}" stroke-width="1.8" opacity="0.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="18" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}${G(u, 7, P)}
  <rect x="46" y="46" width="28" height="30" rx="4" fill="url(#p2-${u}-x7)" stroke="${P.line}" stroke-width="2"/>
  <path d="M52 56 H68 M52 64 H62" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}${G(u, 8, P)}
  <rect x="44" y="44" width="32" height="34" rx="3" fill="url(#p2-${u}-x8)" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M50 54 L60 64 L70 54" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 72 L54 48 H66 L72 72 Z" fill="${P.fill}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="56" y="56" width="8" height="10" rx="1" fill="${P.white}" stroke="${P.lineM}" stroke-width="1"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 74 L52 46 H68 L74 74 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 58 L60 66 L66 58" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="64" rx="30" ry="10" fill="${P.fill}" stroke="${P.line}" stroke-width="2"/>
  <path d="M60 42 V58" stroke="${P.lineM}" stroke-width="2.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="66" rx="30" ry="12" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2"/>
  <path d="M52 44 L56 52 L60 44 L64 52 L68 44" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 58 H76 V70 H44 Z" fill="${P.white}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M44 58 L60 48 L76 58" fill="none" stroke="${P.lineM}" stroke-width="2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 60 H78 V72 H42 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 64 L56 56 L64 64 L72 56" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="52" cy="56" r="5" fill="${P.cream}" stroke="${P.line}" stroke-width="1.5"/>
  <circle cx="68" cy="56" r="5" fill="${P.cream}" stroke="${P.line}" stroke-width="1.5"/>
  <path d="M46 68 Q60 76 74 68" fill="none" stroke="${P.line}" stroke-width="2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="50" cy="58" r="5" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2"/>
  <circle cx="70" cy="58" r="5" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2"/>
  <path d="M52 72 H68" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 70 Q60 44 80 70" fill="none" stroke="${P.lineM}" stroke-width="2.5"/>
  <circle cx="48" cy="52" r="3" fill="${P.line}"/><circle cx="72" cy="52" r="3" fill="${P.line}"/><circle cx="60" cy="46" r="3" fill="${P.lineL}"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M38 72 Q60 42 82 72" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M50 50 L54 58 M60 46 L60 54 M70 50 L66 58" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M52 78 V50 L60 44 L68 50 V78" fill="none" stroke="${P.line}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 54 H72" stroke="${P.lineM}" stroke-width="2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 78 V48 L60 40 L70 48 V78" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M44 52 L76 60" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="58" rx="24" ry="16" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>
  <ellipse cx="52" cy="56" rx="4" ry="5" fill="${P.white}" stroke="${P.lineM}" stroke-width="1"/>
  <ellipse cx="68" cy="56" rx="4" ry="5" fill="${P.white}" stroke="${P.lineM}" stroke-width="1"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="58" rx="24" ry="16" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 56 L56 60 L60 56 L64 60 L68 56" fill="none" stroke="${P.inkM}" stroke-width="1.8"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 62 H76 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -4 4 H44 a4 4 0 0 1 -4 -4v-6a4 4 0 0 1 4 -4z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M48 62 v14 M56 62 v14 M64 62 v14 M72 62 v10" stroke="${P.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 64 H78 v12 H42 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M50 64 v6" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="22" fill="none" stroke="${P.lineL}" stroke-width="2"/>
  <path d="M60 40 L60 50 M40 58 H50 M70 58 H80" stroke="${P.lineM}" stroke-width="1.6" opacity="0.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="22" fill="none" stroke="${P.ink}" stroke-width="2.5" stroke-dasharray="5 4"/>
  <path d="M52 50 L68 66" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 70 C48 52 72 52 72 70" fill="none" stroke="${P.line}" stroke-width="2.5"/>
  <line x1="60" y1="44" x2="60" y2="50" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 72 C46 50 74 50 74 72" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M54 46 L60 56 L66 46" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <rect x="48" y="46" width="24" height="30" rx="3" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/>
  <circle cx="60" cy="58" r="6" fill="none" stroke="${P.lineM}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <rect x="46" y="44" width="28" height="34" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 54 L66 66 M66 54 L54 66" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 58 Q60 46 78 58 Q60 70 42 58" fill="${P.fill}" stroke="${P.line}" stroke-width="2"/>
  <circle cx="60" cy="56" r="4" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 60 Q60 44 80 60 Q60 76 40 60" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 52 L60 62 L68 52" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 76 V48 L60 40 L70 48 V76" fill="${P.white}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="54" y="56" width="12" height="8" rx="1" fill="${P.cream}" stroke="${P.lineM}" stroke-width="1"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 78 V46 L60 36 L72 46 V78" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M54 60 H66" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="56" r="20" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>
  <path d="M52 54 H68 M56 60 H64" stroke="${P.lineM}" stroke-width="1.8"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="56" r="20" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 56 L60 64 L68 56 M52 64 L60 56 L68 64" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M38 64 Q60 44 82 64" fill="none" stroke="${P.lineM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M48 56 h24" stroke="${P.lineL}" stroke-width="1.8" opacity="0.45"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M36 66 Q60 42 84 66" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M44 50 L52 58 L60 50 L68 58 L76 50" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 52 H76 V72 H44 Z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M50 60 H70 M50 66 H62" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 54 H78 V74 H42 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 62 L60 72 L72 62" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="56" cy="60" rx="10" ry="14" fill="${P.cream}" stroke="${P.line}" stroke-width="1.8"/>
  <ellipse cx="64" cy="60" rx="10" ry="14" fill="${P.cream}" stroke="${P.line}" stroke-width="1.8"/>
  <circle cx="60" cy="48" r="8" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="54" cy="62" rx="9" ry="13" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2"/>
  <ellipse cx="66" cy="62" rx="9" ry="13" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2"/>
  <path d="M60 44 L58 52 L62 52 Z" fill="${P.inkM}"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 74 V50 L60 42 L72 50 V74" fill="none" stroke="${P.line}" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="60" cy="56" r="5" fill="${P.lineM}" opacity="0.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 76 V48 L60 38 L74 48 V76" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M54 58 L60 66 L66 58" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <rect x="42" y="48" width="36" height="28" rx="6" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M48 58 H72" stroke="${P.line}" stroke-width="1.8" opacity="0.45"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <rect x="40" y="46" width="40" height="32" rx="4" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M46 56 H74" stroke="${P.inkM}" stroke-width="2.5" stroke-dasharray="4 3"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="24" fill="none" stroke="${P.lineM}" stroke-width="2"/>
  <path d="M60 38 V48 M48 58 H72" stroke="${P.line}" stroke-width="1.8" opacity="0.55"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="24" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 58 h40 v14 H40 Z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/>
  <path d="M44 54 h32" stroke="${P.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M38 60 h44 v12 H38 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 52 L52 48 M72 52 L68 48" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M52 40 L60 34 L68 40 L66 70 H54 Z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="50" r="4" fill="${P.white}" stroke="${P.lineM}" stroke-width="1"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 42 L60 32 L70 42 L68 72 H52 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M56 56 L60 64 L64 56" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M44 68 Q60 48 76 68" fill="none" stroke="${P.lineM}" stroke-width="3" stroke-linecap="round"/>
  <line x1="60" y1="40" x2="60" y2="50" stroke="${P.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 70 Q60 46 78 70" fill="none" stroke="${P.ink}" stroke-width="3.5"/>
  <path d="M54 44 L60 54 L66 44" fill="none" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="48" cy="72" r="7" fill="none" stroke="${P.line}" stroke-width="2"/>
  <circle cx="72" cy="72" r="7" fill="none" stroke="${P.line}" stroke-width="2"/>
  <path d="M48 72 L58 56 L70 56 L72 72" fill="none" stroke="${P.lineM}" stroke-width="2" stroke-linejoin="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="46" cy="74" r="7" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <circle cx="74" cy="70" r="7" fill="none" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M44 74 L56 52 L74 58" fill="none" stroke="${P.inkM}" stroke-width="2.5"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}${G(u, 9, P)}
  <rect x="44" y="48" width="32" height="26" rx="5" fill="url(#p2-${u}-x9)" stroke="${P.line}" stroke-width="2"/>
  <path d="M50 56 H70 M50 62 H64" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}${G(u, 10, P)}
  <rect x="42" y="46" width="36" height="30" rx="4" fill="url(#p2-${u}-x10)" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M48 56 L60 66 L72 56" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M50 78 C50 52 70 52 70 78 Z" fill="${P.cream}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="56" cy="62" rx="3" ry="4" fill="${P.line}"/><ellipse cx="64" cy="62" rx="3" ry="4" fill="${P.line}"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M48 78 C48 50 72 50 72 78 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M56 58 L60 64 L64 58" fill="none" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M46 62 H74 a3 3 0 0 1 3 3 v8 a3 3 0 0 1 -3 3 H46 a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/>
  <path d="M50 62 v12 M58 62 v12 M66 62 v12" stroke="${P.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <rect x="44" y="58" width="32" height="20" rx="3" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M50 62 v6" stroke="${P.ink}" stroke-width="3"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M60 38 L64 50 H74 L66 56 L70 68 L60 62 L50 68 L54 56 L46 50 H56 Z" fill="${P.cream2}" stroke="${P.line}" stroke-width="1.8" stroke-linejoin="round"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M60 36 L66 52 H78 L70 58 L74 72 L60 64 L46 72 L50 58 L42 52 H54 Z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="16" fill="none" stroke="${P.lineM}" stroke-width="2.5"/>
  <path d="M60 46 V54 M54 58 H66" stroke="${P.line}" stroke-width="2"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <circle cx="60" cy="58" r="16" fill="none" stroke="${P.ink}" stroke-width="3"/>
  <path d="M54 52 L66 64 M66 52 L54 64" stroke="${P.inkM}" stroke-width="2"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <path d="M42 54 H78 V74 H42 Z" fill="${P.white}" stroke="${P.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M48 62 H72 M48 68 H66" stroke="${P.lineL}" stroke-width="1.6"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <path d="M40 56 H80 V76 H40 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/>
  <path d="M46 64 H74" stroke="${P.inkM}" stroke-width="2.5" stroke-dasharray="5 4"/>`
    ),
    bind(
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="62" rx="32" ry="12" fill="${P.fill}" stroke="${P.line}" stroke-width="1.8"/>
  <path d="M60 40 V60" stroke="${P.lineM}" stroke-width="2.5"/>`,
      (u, P) => `${cardBgColored(u, P)}
  <ellipse cx="60" cy="64" rx="34" ry="14" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2"/>
  <path d="M48 42 L56 52 M72 42 L64 52" stroke="${P.inkM}" stroke-width="2"/>`
    ),
  
  ]
}
