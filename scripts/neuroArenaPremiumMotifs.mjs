/**
 * Премиум-пары: понятные силуэты, объём (градиенты), аккуратные обводки.
 * Спокойный вариант — мягкие формы; напряжённый — те же темы, резче/плотнее линии (ink).
 */
export function buildPremiumMotifs({ cardBg, ST }) {
  const vol = (u, suffix) => `<defs><linearGradient id="v-${u}-${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="#f4f2f6"/><stop offset="100%" stop-color="#d8d6de"/></linearGradient></defs>`

  return [
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'a')}
  <path d="M44 52 h32 a6 6 0 0 1 6 6 v18 a6 6 0 0 1 -6 6 H44 a6 6 0 0 1 -6 -6V58a6 6 0 0 1 6 -6z" fill="url(#v-${u}-a)" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42 50 h36" stroke="${ST.lineM}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M52 46 Q60 38 68 46" fill="none" stroke="${ST.lineL}" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
  <path d="M54 42 Q58 36 62 40 Q66 36 70 42" fill="none" stroke="${ST.lineL}" stroke-width="1.4" stroke-linecap="round" opacity="0.45"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'b')}
  <path d="M42 54 h36 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 H42 a4 4 0 0 1 -4 -4V58a4 4 0 0 1 4 -4z" fill="url(#v-${u}-b)" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M40 52 h40" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M48 44 L52 38 L56 44 M64 44 L68 38 L72 44" fill="none" stroke="${ST.inkM}" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="72" cy="68" r="3" fill="${ST.inkM}" opacity="0.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'c')}
  <rect x="38" y="50" width="44" height="36" rx="5" fill="url(#v-${u}-c)" stroke="${ST.line}" stroke-width="2"/>
  <path d="M44 58 H76 M44 66 H72 M44 74 H68" stroke="${ST.lineL}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'd')}
  <path d="M36 48 h48 v40 H36 Z" fill="url(#v-${u}-d)" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M42 58 L50 66 L70 52" fill="none" stroke="${ST.inkM}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M44 72 H74" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'e')}
  <path d="M42 58 C42 48 78 48 78 58 V74 H42 Z" fill="url(#v-${u}-e)" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="52" cy="56" rx="8" ry="10" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.5"/>
  <ellipse cx="68" cy="56" rx="8" ry="10" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'f')}
  <path d="M40 60 C40 46 80 46 80 60 V76 H40 Z" fill="url(#v-${u}-f)" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M48 54 L56 62 L48 70 M72 54 L64 62 L72 70" stroke="${ST.inkM}" stroke-width="2.2" stroke-linecap="round"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 78 L52 48 L60 42 L68 48 L72 78 Z" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M44 48 H76" stroke="${ST.lineM}" stroke-width="2" stroke-linecap="round"/>
  <rect x="54" y="54" width="12" height="10" rx="2" fill="${ST.white}" stroke="${ST.lineL}" stroke-width="1.2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 78 L50 46 L60 38 L70 46 L74 78 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 52 L60 62 L68 52" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M40 44 L44 40 M80 44 L76 40" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'g')}
  <circle cx="60" cy="58" r="22" fill="url(#v-${u}-g)" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="52" cy="56" r="4" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.2"/>
  <circle cx="68" cy="56" r="4" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.2"/>
  <path d="M48 68 Q60 76 72 68" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'h')}
  <circle cx="60" cy="58" r="22" fill="url(#v-${u}-h)" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 60 L48 68 M72 52 L64 60 L72 68" stroke="${ST.inkM}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M52 72 H68" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="52" r="14" fill="${ST.cream2}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M46 52 L46 72 M74 52 L74 72" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M38 72 H82" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="58" cy="54" rx="12" ry="14" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" transform="rotate(-8 58 54)"/>
  <path d="M44 54 L44 74 M76 50 L76 74" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M36 74 H84" stroke="${ST.ink}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="50" r="12" fill="${ST.cream}" stroke="${ST.line}" stroke-width="1.8"/>
  <path d="M48 50 L40 42 M72 50 L80 42 M48 50 L40 58 M72 50 L80 58" stroke="${ST.lineL}" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="48" r="11" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M46 48 L38 36 M74 48 L82 36 M46 48 L36 52 M74 48 L84 52" stroke="${ST.inkM}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M52 62 L60 72 L68 62" fill="none" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 72 Q60 38 82 72" fill="none" stroke="${ST.lineM}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M48 48 L52 56 L56 48" fill="none" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M36 72 Q60 36 84 72" fill="none" stroke="${ST.ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M50 42 L54 52 L58 44 L62 54 L66 42" fill="none" stroke="${ST.inkM}" stroke-width="2.2" stroke-linecap="round"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'i')}
  <rect x="44" y="46" width="32" height="28" rx="4" fill="url(#v-${u}-i)" stroke="${ST.line}" stroke-width="2"/>
  <path d="M50 52 L60 60 L70 52" fill="none" stroke="${ST.lineM}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M58 46 V40 L62 44" stroke="${ST.lineL}" stroke-width="1.6" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'j')}
  <rect x="42" y="44" width="36" height="32" rx="3" fill="url(#v-${u}-j)" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 54 H72 M48 62 H68" stroke="${ST.inkM}" stroke-width="2.2"/>
  <path d="M58 44 L62 38 L66 44" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 78 V48 L60 40 L68 48 V78" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="52" r="5" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.2"/>
  <path d="M56 62 h8" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 78 V46 L60 36 L70 46 V78" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M54 56 L60 64 L66 56" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M72 50 L78 44" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="40" y="50" width="40" height="28" rx="6" fill="${ST.white}" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="52" cy="64" r="5" fill="none" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="68" cy="64" r="3" fill="${ST.lineM}"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="38" y="48" width="44" height="32" rx="4" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 60 H72" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M52 68 L60 58 L68 68" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="none" stroke="${ST.lineL}" stroke-width="2"/>
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <path d="M60 42 L60 48 M60 68 L60 74 M42 58 H48 M72 58 H78" stroke="${ST.lineM}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-dasharray="6 5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${ST.inkM}" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="60" cy="58" r="6" fill="${ST.inkM}" opacity="0.35"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 56 h32 v20 H44 Z" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M42 56 L60 48 L78 56" fill="none" stroke="${ST.lineM}" stroke-width="2" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 58 h36 v18 H42 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M40 58 L60 46 L80 58" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M48 52 L52 48 M72 52 L68 48" stroke="${ST.ink}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M60 40 L64 52 H76 L66 58 L70 70 L60 64 L50 70 L54 58 L44 52 H56 Z" fill="${ST.cream2}" stroke="${ST.line}" stroke-width="1.8" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M60 38 L66 54 H80 L68 60 L72 74 L60 66 L48 74 L52 60 L40 54 H54 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M46 44 L50 40 M74 44 L70 40" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="34" ry="12" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.8" opacity="0.85"/>
  <path d="M60 38 V58" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="64" rx="36" ry="14" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M48 40 L56 52 L52 58 M72 40 L64 52 L68 58" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 72 V44 L60 36 L68 44 V72" fill="none" stroke="${ST.line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 52 h24" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 74 V42 L60 32 L70 42 V74" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M44 56 L56 48 L68 56" fill="none" stroke="${ST.inkM}" stroke-width="2.2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${ST.white}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 58 H72 M60 46 V70" stroke="${ST.lineL}" stroke-width="1.5" opacity="0.45"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 52 L68 64 M68 52 L52 64" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="36" rx="4" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <rect x="52" y="50" width="16" height="10" rx="2" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.2"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="44" y="42" width="32" height="40" rx="3" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M50 56 H70 M50 64 H66 M50 72 H72" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 62 Q60 44 82 62 Q60 80 38 62" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" opacity="0.9"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M36 62 Q60 40 84 62 Q60 84 36 62" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 54 L56 62 L64 54 L72 62" fill="none" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="48" cy="58" rx="10" ry="14" fill="${ST.cream}" stroke="${ST.line}" stroke-width="1.8"/>
  <ellipse cx="72" cy="58" rx="10" ry="14" fill="${ST.cream}" stroke="${ST.line}" stroke-width="1.8"/>
  <circle cx="60" cy="48" r="8" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="46" cy="60" rx="9" ry="13" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" transform="rotate(-12 46 60)"/>
  <ellipse cx="74" cy="60" rx="9" ry="13" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" transform="rotate(12 74 60)"/>
  <circle cx="60" cy="46" r="8" fill="${ST.white}" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M32 72 Q60 36 88 72" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M44 52 h32" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M30 72 Q60 34 90 72" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M48 46 L56 54 L64 46 L72 54" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="18" fill="${ST.cream2}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M52 56 h16 M56 52 v8" stroke="${ST.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="18" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 56 L60 64 L68 56 M52 64 L60 56 L68 64" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 70 V50 L60 38 L76 50 V70 Z" fill="${ST.white}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <rect x="54" y="56" width="12" height="8" rx="1" fill="${ST.cream}" stroke="${ST.lineM}" stroke-width="1"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 72 V48 L60 34 L78 48 V72 Z" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 56 H70 M54 64 H66" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M40 58 h40 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 H40 a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2z" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M44 54 h32" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M38 60 h44 v12 H38 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M42 56 h36" stroke="${ST.inkM}" stroke-width="3"/>
  <path d="M48 50 L52 46 M72 50 L68 46" stroke="${ST.ink}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M50 72 C50 52 70 52 70 72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="50" r="6" fill="${ST.cream}" stroke="${ST.lineM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M48 72 C48 50 72 50 72 72" fill="none" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round"/>
  <path d="M54 48 L60 56 L66 48" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 64 Q60 44 82 64" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M48 58 h24" stroke="${ST.lineL}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M36 66 Q60 42 84 66" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M44 52 L52 60 L60 52 L68 60 L76 52" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}${vol(u, 'k')}
  <circle cx="60" cy="62" r="18" fill="url(#v-${u}-k)" stroke="${ST.line}" stroke-width="2"/>
  <path d="M60 44 Q58 38 60 36 Q62 38 60 44" fill="none" stroke="${ST.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}${vol(u, 'l')}
  <path d="M48 62 A12 12 0 1 1 72 62 A12 12 0 0 1 48 62" fill="url(#v-${u}-l)" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M54 52 L58 48 L62 54" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="40" y="50" width="40" height="22" rx="8" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="48" cy="76" r="6" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="1.5"/>
  <circle cx="72" cy="76" r="6" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M38 52 L48 48 L82 52 L84 58 L82 70" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M46 74 L50 82 M70 74 L66 82" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M52 56 H68 M52 62 H64" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M36 72 L48 48 L72 48 L84 72 Z" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round" opacity="0.85"/>
  <path d="M52 56 H68 M56 64 H64" stroke="${ST.lineM}" stroke-width="1.8" opacity="0.7"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M34 74 L50 44 L76 44 L86 74 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M42 52 L56 60 L70 52 L78 64" fill="none" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="60" rx="28" ry="12" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M38 60 h44 M52 44 L56 52 L60 44 L64 52 L68 44" fill="none" stroke="${ST.lineM}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M34 62 Q60 48 86 62" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 50 L54 54 L60 48 L66 54 L72 50" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="22" ry="10" fill="${ST.cream2}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M42 50 L52 44 L60 52 L68 44 L78 50" fill="none" stroke="${ST.lineM}" stroke-width="2" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M40 64 Q60 44 80 64" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 50 L54 42 L60 50 L66 42 L72 50" fill="none" stroke="${ST.inkM}" stroke-width="2.2" stroke-linejoin="round"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 72 C48 50 72 50 72 72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M56 48 Q60 40 64 48" fill="none" stroke="${ST.lineL}" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 72 C46 48 74 48 74 72" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M54 46 L58 58 L62 46" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="50" y="44" width="20" height="36" rx="4" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <rect x="54" y="48" width="12" height="8" rx="1" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M48 46 L56 42 L72 46 L78 52 L78 78 L48 78 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 56 H74 M52 64 H68" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="52" cy="56" r="4" fill="${ST.lineM}"/><circle cx="68" cy="56" r="4" fill="${ST.lineM}"/>
  <path d="M44 68 Q60 76 76 68" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 70 Q60 80 78 70" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 50 L54 44 M66 50 L74 54" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 72 V44 L60 38 L68 44 V72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="60" cy="78" rx="14" ry="4" fill="${ST.fill}" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 74 V42 L60 34 L70 42 V74" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M42 78 L78 78" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="20" rx="3" fill="${ST.white}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M50 52 H70 M50 58 H64" stroke="${ST.lineL}" stroke-width="1.6"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M44 46 L52 40 L76 46 L76 66 L44 66 Z" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 44 L64 52" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M60 42 L60 52 M60 64 L60 74 M42 58 H52 M68 58 H78" stroke="${ST.lineL}" stroke-width="1.6" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="32" rx="3" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="60" cy="58" r="8" fill="none" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="60" cy="58" r="4" fill="${ST.lineL}" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="44" y="42" width="32" height="36" rx="4" fill="${ST.cream}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 52 L68 64 M68 52 L52 64" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 58 h32 v16 H44 Z" fill="${ST.white}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M44 58 L60 48 L76 58" fill="none" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="68" cy="64" r="2.5" fill="${ST.lineM}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 60 h36 v14 H42 Z" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 56 L56 64 L72 52" fill="none" stroke="${ST.inkM}" stroke-width="2.2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 62 Q60 44 82 62" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <circle cx="60" cy="58" r="12" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <path d="M60 50 L60 66 M52 58 H68" stroke="${ST.lineL}" stroke-width="1.5" opacity="0.55"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="14" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L72 64" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M54 46 L66 70" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 78 V48 L60 40 L68 48 V78" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="52" r="5" fill="${ST.white}" stroke="${ST.lineM}" stroke-width="1.2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 78 V46 L60 36 L70 46 V78" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M56 62 h8" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 42 L48 36" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M40 58 h40 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 H40 a4 4 0 0 1 -4 -4V62a4 4 0 0 1 4 -4z" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 58 v16 M56 58 v16 M64 58 v16 M72 58 v12" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="40" y="50" width="40" height="28" rx="4" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 58 v8" stroke="${ST.ink}" stroke-width="4" stroke-linecap="round"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M42 52 Q60 40 78 52" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <path d="M52 56 Q60 48 68 56" fill="none" stroke="${ST.lineL}" stroke-width="2" opacity="0.55"/>
  <path d="M54 60 Q60 54 66 60" fill="none" stroke="${ST.lineL}" stroke-width="2" opacity="0.45"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M38 54 Q60 38 82 54" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 58 H72" stroke="${ST.inkM}" stroke-width="2" stroke-dasharray="4 5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 72 C48 50 72 50 72 72" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" opacity="0.85"/>
  <path d="M60 38 V46" stroke="${ST.lineM}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 74 C46 48 74 48 74 74" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M56 40 L60 48 L64 40 L68 48" fill="none" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M60 40 L64 52 H74 L66 58 L70 70 L60 64 L50 70 L54 58 L46 52 H56 Z" fill="${ST.cream2}" stroke="${ST.line}" stroke-width="1.8"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M60 38 L66 54 H78 L70 60 L74 74 L60 66 L46 74 L50 60 L42 54 H54 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M46 44 L50 38 M74 44 L70 38" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 72 V44 L60 36 L68 44 V72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M56 72 Q60 78 64 72" fill="none" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 74 V42 L60 32 L70 42 V74" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M42 78 L78 78" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="32" rx="3" fill="${ST.white}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M52 56 H68 M52 64 H62" stroke="${ST.lineL}" stroke-width="1.8"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M44 46 L52 40 L76 46 L80 58 L76 76 H44 Z" fill="${ST.white}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 56 H70" stroke="${ST.inkM}" stroke-width="2.5" stroke-dasharray="3 4"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 70 Q60 52 72 70" fill="none" stroke="${ST.lineM}" stroke-width="3"/>
  <line x1="60" y1="40" x2="60" y2="52" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 72 Q60 50 74 72" fill="none" stroke="${ST.ink}" stroke-width="3.5"/>
  <path d="M54 42 L60 52 L66 42" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="52" cy="58" rx="8" ry="10" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.8"/>
  <ellipse cx="68" cy="58" rx="8" ry="10" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.8"/>
  <path d="M48 46 Q60 40 72 46" fill="none" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 60 L54 54 L58 58 L62 52 L66 56 L70 50" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 78 V48 L60 42 L68 48 V78" fill="${ST.cream}" stroke="${ST.line}" stroke-width="2"/>
  <path d="M44 52 h32" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 78 V46 L60 38 L70 46 V78" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M56 56 L60 64 L64 56" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="none" stroke="${ST.lineL}" stroke-width="2"/>
  <path d="M60 42 L60 52 M60 64 L60 74" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 72 C48 50 72 50 72 72" fill="none" stroke="${ST.line}" stroke-width="2.5"/>
  <circle cx="60" cy="58" r="12" fill="none" stroke="${ST.lineM}" stroke-width="3"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 74 C46 48 74 48 74 74" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M42 58 H78" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'premium',
      neutral: (u) => `${cardBg(u)}
  <circle cx="48" cy="72" r="8" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="72" cy="72" r="8" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 72 L58 56 L70 56 L72 72 M58 56 L52 48" fill="none" stroke="${ST.lineM}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="46" cy="74" r="8" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <circle cx="76" cy="70" r="8" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 74 L56 54 L74 58 L78 72" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linejoin="round"/>`,
    },
  ]
}
