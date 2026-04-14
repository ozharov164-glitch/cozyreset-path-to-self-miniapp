/**
 * Генерирует пары SVG для dot-probe. Важно: нет цветового «кода» (не мятный=хорошо / красный=плохо):
 * одинаковый нейтральный фон карточки и общая серая палитра; отличие нейтрального и угрожающего стимула —
 * форма, плотность линий, углы (спокойное vs резкое), без доминанты оттенка.
 * Запуск: node scripts/generate-neuro-arena-svgs.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildEmojiMotifs } from './neuroArenaEmojiMotifs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const OUT_DIR = path.join(ROOT, 'public/neuro-arena/dp')
const JSON_OUT = path.join(ROOT, 'src/data/neuroArenaDotProbe.json')

/** Пул файлов n01…nXX (дублирование мотивов с alt-трансформом только при i > числа мотивов). */
const PAIRS = 96

/** Один фон для обеих картинок пары — без сдвига в «холодный» vs «тёплый». */
function cardBg(uid) {
  return `<defs>
    <linearGradient id="bg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#efedf1"/>
      <stop offset="50%" stop-color="#ebe9ee"/>
      <stop offset="100%" stop-color="#e8e6eb"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#bg-${uid})"/>
  <rect x="1" y="1" width="118" height="118" rx="23" fill="none" stroke="rgba(45,52,64,0.11)" stroke-width="1"/>`
}

/** Общая монохромная палитра; «напряжённость» — через ink (темнее), не через красный. */
const ST = {
  line: '#4d5664',
  lineM: '#5c6573',
  lineL: '#6d7684',
  fill: '#b4bcc8',
  fillM: '#a0aab6',
  fillD: '#8e98a6',
  ink: '#2a303c',
  inkM: '#3a4250',
  cream: '#e2dfe8',
  cream2: '#d8d5de',
  white: '#f7f7f9',
}

/**
 * Библиотека мотивов: спокойная и напряжённая версия одной идеи.
 * idx 0..27 — уникальные; для 28..55 используется зеркало + смещение id.
 */
const MOTIFS_CORE = [
  {
    category: 'weather',
    neutral: (u) => `${cardBg(u)}
  <circle cx="72" cy="48" r="22" fill="${ST.cream}" stroke="${ST.lineM}" stroke-width="2.2" opacity="0.95"/>
  <path d="M38 78 Q58 62 78 68 T108 78" fill="none" stroke="${ST.line}" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
  <ellipse cx="52" cy="82" rx="28" ry="14" fill="${ST.fill}" opacity="0.5"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M35 52 L55 38 L75 52 L95 38" fill="none" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 58 L58 48 L68 58 L78 48 L88 58" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M62 42 L62 28 M52 34 L72 34" stroke="${ST.inkM}" stroke-width="2.8" stroke-linecap="round"/>
  <ellipse cx="60" cy="78" rx="32" ry="16" fill="rgba(75,82,94,0.14)"/>`,
  },
  {
    category: 'weather',
    neutral: (u) => `${cardBg(u)}
  <path d="M20 75 Q40 55 60 58 T100 72" fill="none" stroke="${ST.lineM}" stroke-width="3.5" stroke-linecap="round" opacity="0.65"/>
  <path d="M25 78 Q45 68 65 70 T105 78" fill="none" stroke="${ST.lineL}" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M18 70 L32 58 L46 72 L60 56 L74 70 L88 58 L102 72" fill="none" stroke="${ST.ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <circle cx="95" cy="44" r="4" fill="${ST.inkM}" opacity="0.9"/>
  <circle cx="78" cy="38" r="3" fill="${ST.inkM}" opacity="0.65"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <rect x="28" y="42" width="64" height="44" rx="14" fill="white" stroke="${ST.line}" stroke-width="2.2" opacity="0.95"/>
  <path d="M42 62 Q60 72 78 62" fill="none" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="26" y="40" width="68" height="48" rx="10" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L60 68 L72 52" fill="none" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="88" cy="48" r="5" fill="${ST.fillD}"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="none" stroke="${ST.lineL}" stroke-width="2.5" opacity="0.7"/>
  <circle cx="60" cy="58" r="8" fill="${ST.lineM}" opacity="0.85"/>
  <path d="M60 34 L60 44 M60 72 L60 82 M34 58 L44 58 M76 58 L86 58" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="38" y="38" width="44" height="44" rx="6" fill="none" stroke="${ST.ink}" stroke-width="3" transform="rotate(12 60 60)"/>
  <path d="M52 52 L68 68 M68 52 L52 68" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="58" r="4" fill="${ST.ink}"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M30 78 C30 52 90 52 90 78" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 56 Q60 44 82 56" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M28 78 L48 48 L60 62 L72 48 L92 78" fill="none" stroke="${ST.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M40 52 H80" stroke="${ST.inkM}" stroke-width="2.5" stroke-dasharray="4 5"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="34" y="36" width="52" height="40" rx="8" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M42 50 H78 M42 58 H68" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="32" y="34" width="56" height="44" rx="6" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 48 L56 60 L76 44" fill="none" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="88" cy="42" r="6" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <circle cx="48" cy="52" r="14" fill="${ST.lineM}" opacity="0.35"/>
  <circle cx="72" cy="52" r="14" fill="${ST.fill}" opacity="0.4"/>
  <path d="M42 72 Q60 82 78 72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="36" y="40" width="20" height="36" rx="4" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <rect x="64" y="40" width="20" height="36" rx="4" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M56 58 H64" stroke="${ST.ink}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="20" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <path d="M60 38 L60 48 M60 60 L60 70 M48 54 H70" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M42 40 L78 40 L72 76 L48 76 Z" fill="none" stroke="${ST.ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M52 52 L68 64 M68 52 L52 64" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'weather',
    neutral: (u) => `${cardBg(u)}
  <circle cx="68" cy="44" r="8" fill="${ST.cream2}" opacity="0.85"/>
  <path d="M32 76 Q52 60 72 64 T104 76" fill="none" stroke="${ST.lineL}" stroke-width="2.8" stroke-linecap="round" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M30 50 Q50 35 70 42 T110 48" fill="none" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 72 Q60 58 80 72" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M55 32 L58 42 M72 30 L70 40" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <circle cx="44" cy="52" r="12" fill="${ST.lineM}" opacity="0.5"/>
  <circle cx="76" cy="52" r="12" fill="${ST.fill}" opacity="0.45"/>
  <path d="M38 70 Q60 78 82 70" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="34" y="44" width="20" height="28" rx="6" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <rect x="66" y="44" width="20" height="28" rx="6" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M54 56 H66" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="58" rx="36" ry="20" fill="none" stroke="${ST.lineM}" stroke-width="2.2" opacity="0.6"/>
  <circle cx="60" cy="58" r="6" fill="${ST.line}"/>`,
    threat: (u) => `${cardBg(u)}
  <ellipse cx="52" cy="58" rx="14" ry="22" fill="none" stroke="${ST.inkM}" stroke-width="2.5" transform="rotate(-8 52 58)"/>
  <ellipse cx="68" cy="58" rx="14" ry="22" fill="none" stroke="${ST.ink}" stroke-width="2.5" transform="rotate(8 68 58)"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="40" y="38" width="40" height="48" rx="6" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 52 H72 M48 60 H68 M48 68 H72" stroke="${ST.lineL}" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="38" y="36" width="44" height="52" rx="4" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M46 48 L74 72 M74 48 L46 72" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="88" cy="44" r="5" fill="${ST.fillD}"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M30 82 Q60 48 90 82" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="50" r="10" fill="${ST.fill}" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M28 82 L42 50 L54 68 L66 44 L78 64 L92 82" fill="none" stroke="${ST.ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="none" stroke="${ST.line}" stroke-width="2" opacity="0.45"/>
  <path d="M60 42 L60 52 M42 58 H52 M68 58 H78" stroke="${ST.lineM}" stroke-width="2.2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-dasharray="6 8"/>
  <path d="M48 46 L72 70 M72 46 L48 70" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <rect x="32" y="44" width="56" height="36" rx="12" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="46" cy="62" r="4" fill="${ST.line}"/>
  <circle cx="60" cy="62" r="4" fill="${ST.line}"/>
  <circle cx="74" cy="62" r="4" fill="${ST.line}"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="30" y="42" width="60" height="40" rx="8" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 58 H76" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M48 66 H72" stroke="${ST.inkM}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M38 78 L52 48 L68 62 L82 42 L88 78 Z" fill="rgba(78,86,98,0.1)" stroke="${ST.line}" stroke-width="2.2" stroke-linejoin="round"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M32 82 L48 38 L64 58 L80 32 L96 82 Z" fill="rgba(72,78,90,0.1)" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="36" y="40" width="48" height="36" rx="8" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M44 54 H76 M44 62 H68" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M34 78 L46 48 H74 L86 78 Z" fill="rgba(70,76,88,0.12)" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M59 38 h2 v22 h-2z M59 66 h2 v8 h-2z" fill="${ST.inkM}"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="22" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <path d="M52 46 L68 62 M68 46 L52 62" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.35"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="22" fill="none" stroke="${ST.inkM}" stroke-width="3"/>
  <path d="M52 46 L68 62 M68 46 L52 62" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <rect x="40" y="46" width="40" height="28" rx="8" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M48 58 H72" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="36" y="42" width="48" height="36" rx="6" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 54 L56 66 L76 48" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'weather',
    neutral: (u) => `${cardBg(u)}
  <path d="M28 68 Q48 52 72 56 T108 68" fill="none" stroke="${ST.lineL}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
  <circle cx="78" cy="44" r="10" fill="${ST.cream}" opacity="0.9"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M24 72 L36 52 L48 64 L60 48 L72 64 L84 52 L96 72" fill="none" stroke="${ST.ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M52 36 L56 44 M68 34 L64 42" stroke="${ST.inkM}" stroke-width="2.5"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <path d="M40 72 Q60 52 80 72" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="48" cy="48" r="10" fill="${ST.lineM}" opacity="0.45"/>
  <circle cx="72" cy="48" r="10" fill="${ST.fill}" opacity="0.45"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="44" cy="50" r="12" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <circle cx="76" cy="50" r="12" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M56 50 H64" stroke="${ST.ink}" stroke-width="3"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="58" rx="40" ry="24" fill="none" stroke="${ST.line}" stroke-width="2" opacity="0.35"/>
  <circle cx="60" cy="58" r="10" fill="${ST.lineM}" opacity="0.7"/>`,
    threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="58" rx="38" ry="26" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M42 58 H78" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 42 V74" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="38" y="40" width="44" height="36" rx="10" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="60" cy="58" r="8" fill="${ST.line}" opacity="0.4"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="34" y="38" width="52" height="40" rx="8" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 52 L56 64 L76 46" fill="none" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M34 78 C34 50 86 50 86 78" fill="none" stroke="${ST.lineM}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="60" cy="48" r="6" fill="${ST.lineL}" opacity="0.5"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M32 78 L48 44 L60 60 L72 40 L88 78" fill="none" stroke="${ST.ink}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="60" cy="52" r="5" fill="${ST.fillD}"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <polygon points="60,38 78,72 42,72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="60" cy="62" r="5" fill="${ST.lineM}" opacity="0.6"/>`,
    threat: (u) => `${cardBg(u)}
  <polygon points="60,36 84,78 36,78" fill="rgba(68,74,86,0.11)" stroke="${ST.ink}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M54 40 Q54 34 60 34 Q68 34 68 42 Q68 50 60 52 L60 58 M60 66 v6" fill="none" stroke="${ST.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <circle cx="44" cy="50" r="14" fill="${ST.lineM}" opacity="0.35"/>
  <circle cx="76" cy="50" r="14" fill="${ST.fill}" opacity="0.35"/>
  <path d="M44 68 Q60 74 76 68" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M38 72 L44 48 L52 60 L60 44 L68 60 L76 48 L82 72" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <rect x="42" y="44" width="36" height="36" rx="10" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M50 58 H70 M50 66 H64" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="38" y="40" width="44" height="44" rx="8" fill="none" stroke="${ST.ink}" stroke-width="2.8"/>
  <path d="M48 52 L72 76 M72 52 L48 76" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="28" fill="none" stroke="${ST.lineM}" stroke-width="2" opacity="0.5"/>
  <path d="M60 36 L60 48 M60 64 L60 76" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="56" r="6" fill="${ST.line}"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="28" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M48 48 L72 64 M72 48 L48 64" stroke="${ST.ink}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="60" cy="56" r="5" fill="${ST.fillD}"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M26 78 Q60 42 94 78" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="48" r="12" fill="${ST.fill}" opacity="0.45"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M24 78 Q60 36 96 78" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M48 56 L60 44 L72 56" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <path d="M38 52 L60 38 L82 52 V78 H38 Z" fill="white" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M46 58 H74 M46 66 H68" stroke="${ST.lineL}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M36 54 L60 36 L84 54 V80 H36 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 62 L60 74 L72 62" fill="none" stroke="${ST.inkM}" stroke-width="2.8" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M60 36 C48 36 40 46 40 56 C40 70 60 82 60 82 C60 82 80 70 80 56 C80 46 72 36 60 36" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <circle cx="52" cy="52" r="3" fill="${ST.line}"/><circle cx="68" cy="52" r="3" fill="${ST.line}"/>
  <path d="M50 64 Q60 70 70 64" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="28" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 50 L56 58 L48 66 M72 50 L64 58 L72 66" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="58" rx="22" ry="14" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M50 56 H70 M50 62 H64" stroke="${ST.line}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="38" y="46" width="44" height="28" rx="6" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M46 60 H74" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M52 54 L68 66 M68 54 L52 66" stroke="${ST.inkM}" stroke-width="2" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M58 34 v8 M52 42 h12" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M44 52 Q60 46 76 52 L76 78 H44 Z" fill="rgba(78,86,98,0.09)" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M56 32 L64 44 L56 56 L48 44 Z" fill="${ST.fillD}" opacity="0.85"/>
  <path d="M52 60 Q60 54 68 60 L68 80 H52 Z" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="44" y="40" width="32" height="40" rx="6" fill="none" stroke="${ST.line}" stroke-width="2.2"/>
  <circle cx="60" cy="54" r="6" fill="${ST.lineM}" opacity="0.5"/>
  <path d="M52 66 H68" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="42" y="38" width="36" height="44" rx="5" fill="none" stroke="${ST.ink}" stroke-width="2.8"/>
  <path d="M52 50 H68 M52 58 H64 M52 66 H70" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <path d="M40 78 Q60 28 80 78" fill="none" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M52 48 L60 56 L68 48" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M38 78 L46 42 L60 54 L74 42 L82 78" fill="none" stroke="${ST.ink}" stroke-width="2.8" stroke-linejoin="round"/>
  <circle cx="60" cy="62" r="5" fill="${ST.inkM}"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <path d="M38 72 Q60 48 82 72" fill="none" stroke="${ST.lineM}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="60" cy="52" r="14" fill="${ST.fill}" opacity="0.4"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M36 74 Q60 44 84 74" fill="none" stroke="${ST.inkM}" stroke-width="3"/>
  <path d="M48 56 L60 68 L72 56" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  {
    category: 'uncertainty',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="none" stroke="${ST.line}" stroke-width="2" opacity="0.4"/>
  <path d="M60 42 v10 M60 64 v10" stroke="${ST.lineM}" stroke-width="2.2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-dasharray="4 6"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${ST.inkM}" stroke-width="2.5"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="28" ry="18" fill="rgba(95,100,112,0.1)" stroke="${ST.lineL}" stroke-width="2"/>
  <path d="M44 62 H76" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.45"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M40 48 L80 48 L76 76 H44 Z" fill="rgba(72,78,90,0.1)" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 56 H72 M48 64 H68" stroke="${ST.inkM}" stroke-width="2.5"/>`,
  },
  {
    category: 'work',
    neutral: (u) => `${cardBg(u)}
  <rect x="36" y="44" width="48" height="36" rx="8" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M44 56 H76 M44 64 H70" stroke="${ST.line}" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>`,
    threat: (u) => `${cardBg(u)}
  <path d="M34 78 L42 44 L78 44 L86 78 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 56 H72" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    category: 'general',
    neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="20" fill="none" stroke="${ST.lineM}" stroke-width="2.2"/>
  <path d="M52 48 L60 40 L68 48" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
    threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="20" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M52 60 L68 60 M60 52 V68" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    category: 'social',
    neutral: (u) => `${cardBg(u)}
  <rect x="34" y="46" width="52" height="32" rx="10" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="48" cy="62" r="4" fill="${ST.lineM}"/><circle cx="60" cy="62" r="4" fill="${ST.lineM}"/><circle cx="72" cy="62" r="4" fill="${ST.lineM}"/>`,
    threat: (u) => `${cardBg(u)}
  <rect x="32" y="44" width="56" height="36" rx="8" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 58 H76" stroke="${ST.inkM}" stroke-width="3"/><path d="M48 66 H72" stroke="${ST.inkM}" stroke-width="2" opacity="0.65"/>`,
  },
]

const MOTIFS = [...MOTIFS_CORE, ...buildEmojiMotifs({ cardBg, ST })]

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
    version: 5,
    assetKind: 'svg',
    pairCount: PAIRS,
    motifLibrarySize: nMotifs,
    note: 'CORE: абстрактные и смысловые иконки; EMOJI: нарисованные «эмодзи»-пары. При повторе индекса — alt-трансформ.',
  },
  stimuli,
}

fs.writeFileSync(JSON_OUT, JSON.stringify(doc, null, 2), 'utf8')
console.log(`Motifs: ${nMotifs}, pairs: ${PAIRS} (alt transform for i>${nMotifs})`)
console.log(`Wrote → ${OUT_DIR}`)
console.log(`Updated ${JSON_OUT}`)
