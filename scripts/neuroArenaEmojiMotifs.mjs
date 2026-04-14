/**
 * @deprecated Не подключается к генератору: библиотека dot-probe переведена на премиум-силуэты (см. neuroArenaPremiumMotifs*.mjs).
 * Пары в стиле эмодзи. Один фон и серая палитра — нельзя отличить «хорошую» картинку по цвету (не голубой vs красный).
 */
export function buildEmojiMotifs({ cardBg, ST }) {
  const F = {
    face: ST.cream,
    hi: ST.cream2,
  }
  return [
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="50" cy="54" r="3.5" fill="${ST.line}"/><circle cx="70" cy="54" r="3.5" fill="${ST.line}"/>
  <path d="M48 68 Q60 78 72 68" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M46 50 L54 54 M66 50 L74 54" stroke="${ST.ink}" stroke-width="2.2" stroke-linecap="round"/>
  <ellipse cx="50" cy="58" rx="3" ry="4" fill="${ST.ink}"/><ellipse cx="70" cy="58" rx="3" ry="4" fill="${ST.ink}"/>
  <path d="M48 72 H72" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M82 46 Q88 42 86 52" fill="none" stroke="${ST.lineM}" stroke-width="2.5" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M46 50 Q50 46 54 50 M66 50 Q70 46 74 50" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="50" cy="58" r="3" fill="${ST.line}"/><circle cx="70" cy="58" r="3" fill="${ST.line}"/>
  <path d="M46 70 Q60 80 74 70" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 58 L48 64 M72 52 L64 58 L72 64" stroke="${ST.ink}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M52 72 H68" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M44 52 L48 56 L52 52 M68 52 L72 56 L76 52" fill="none" stroke="${ST.line}" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="50" cy="60" r="2.5" fill="${ST.lineL}"/><circle cx="70" cy="60" r="2.5" fill="${ST.lineL}"/>
  <circle cx="60" cy="48" r="5" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M46 48 L54 52 L46 56 M66 48 L74 52 L66 56" stroke="${ST.ink}" stroke-width="2"/>
  <circle cx="50" cy="62" r="2.5" fill="${ST.ink}"/><circle cx="70" cy="62" r="2.5" fill="${ST.ink}"/>
  <path d="M56 74 H64" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M60 40 C45 40 38 55 38 62 C38 72 48 82 60 82 C72 82 82 72 82 62 C82 52 75 40 60 40" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <ellipse cx="52" cy="58" rx="4" ry="5" fill="${ST.line}"/><ellipse cx="68" cy="58" rx="4" ry="5" fill="${ST.line}"/>
  <path d="M48 72 Q60 62 72 72" fill="none" stroke="${ST.line}" stroke-width="2.5" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M60 42 C46 42 40 54 40 62 C40 74 50 84 60 84 C70 84 80 74 80 62 C80 50 74 42 60 42" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 56 L56 64 M64 56 L72 64" stroke="${ST.ink}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M50 74 H70" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 48 L52 40 L60 48 L68 40 L76 48 V72 H44 Z" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="54" cy="58" r="3" fill="white"/><circle cx="66" cy="58" r="3" fill="white"/>
  <path d="M54 66 Q60 70 66 66" fill="none" stroke="white" stroke-width="1.8"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 50 L52 38 L62 50 L72 38 L82 50 V76 H42 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 58 H68" stroke="${ST.ink}" stroke-width="2"/><path d="M56 66 H64" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 38 L60 32 L68 38 V78 H52 Z" fill="white" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="52" r="10" fill="${ST.lineM}" opacity="0.5"/>
  <path d="M56 68 H64" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 40 L60 30 L70 40 V80 H50 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M54 50 L66 62 M66 50 L54 62" stroke="${ST.inkM}" stroke-width="2.5"/>
  <circle cx="60" cy="72" r="4" fill="${ST.ink}"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="60" rx="22" ry="18" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M50 56 L56 62 L70 48" fill="none" stroke="${ST.line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="60" rx="22" ry="18" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 58 H68 M60 52 V66" stroke="${ST.ink}" stroke-width="3" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M48 78 C48 58 72 58 72 78 Z" fill="${ST.lineM}" opacity="0.45" stroke="${ST.line}" stroke-width="1.5"/>
  <circle cx="60" cy="48" r="14" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="56" cy="46" r="2" fill="${ST.line}"/><circle cx="64" cy="46" r="2" fill="${ST.line}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M46 78 C46 56 74 56 74 78 Z" fill="${ST.fillD}" opacity="0.5" stroke="${ST.ink}" stroke-width="2"/>
  <circle cx="60" cy="46" r="14" fill="${F.face}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M54 44 L58 48 L62 44" fill="none" stroke="${ST.ink}" stroke-width="1.8"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="56" cy="62" rx="14" ry="18" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="2" transform="rotate(-8 56 62)"/>
  <ellipse cx="74" cy="62" rx="14" ry="18" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="2" transform="rotate(8 74 62)"/>
  <circle cx="60" cy="52" r="8" fill="${F.face}" stroke="${ST.line}" stroke-width="1.8"/>
  <path d="M56 54 H64" stroke="${ST.line}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="54" cy="64" rx="12" ry="16" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2" transform="rotate(-15 54 64)"/>
  <ellipse cx="72" cy="64" rx="12" ry="16" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2" transform="rotate(15 72 64)"/>
  <circle cx="62" cy="50" r="9" fill="${F.face}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M58 52 L66 52" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="22" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <polygon points="60,38 66,48 78,48 68,56 72,68 60,62 48,68 52,56 42,48 54,48" fill="${F.hi}" stroke="${ST.line}" stroke-width="1.8" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="22" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>
  <polygon points="60,36 68,50 82,50 70,60 74,76 60,68 46,76 50,60 38,50 52,50" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" stroke-linejoin="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="44" y="42" width="32" height="44" rx="8" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="54" cy="56" r="3" fill="${ST.line}"/><circle cx="66" cy="56" r="3" fill="${ST.line}"/>
  <path d="M52 66 H68" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="42" y="40" width="36" height="48" rx="6" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 54 H68" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M48 64 Q60 58 72 64" fill="none" stroke="${ST.inkM}" stroke-width="2"/>
  <path d="M78 48 L82 52 L78 56" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="30" ry="20" fill="white" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M38 62 H82" stroke="${ST.line}" stroke-width="1.5" opacity="0.4"/>
  <path d="M48 58 H72" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="30" ry="20" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M42 58 H78" stroke="${ST.inkM}" stroke-width="3" stroke-linecap="round"/>
  <path d="M50 68 L60 74 L70 68" fill="none" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M40 72 L48 44 L72 44 L80 72 Z" fill="${ST.fill}" opacity="0.35" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="54" cy="58" r="5" fill="${ST.lineM}"/><circle cx="66" cy="58" r="5" fill="${ST.lineM}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M38 74 L46 42 L74 42 L82 74 Z" fill="${ST.fillM}" opacity="0.6" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 56 L60 66 L68 56" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="58" cy="64" rx="8" ry="20" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.8"/>
  <ellipse cx="72" cy="64" rx="8" ry="20" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.8"/>
  <circle cx="60" cy="48" r="12" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="56" cy="66" rx="7" ry="18" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2"/>
  <ellipse cx="70" cy="66" rx="7" ry="18" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="2"/>
  <circle cx="62" cy="46" r="12" fill="${F.face}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M58 50 H66" stroke="${ST.ink}" stroke-width="1.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 78 C38 52 82 52 82 78 Z" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="52" cy="64" rx="5" ry="7" fill="white"/><ellipse cx="68" cy="64" rx="5" ry="7" fill="white"/>
  <circle cx="52" cy="64" r="3" fill="${ST.line}"/><circle cx="68" cy="64" r="3" fill="${ST.line}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M36 78 C36 50 84 50 84 78 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 60 L54 68 L58 60 M62 60 L66 68 L70 60" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="42" y="48" width="36" height="28" rx="6" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 58 H72 M48 64 H66" stroke="${ST.lineL}" stroke-width="1.8" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="40" y="46" width="40" height="32" rx="5" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M46 56 H74" stroke="${ST.inkM}" stroke-width="2.5"/>
  <path d="M78 52 L82 60 L78 68" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="18" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M52 52 L56 56 L60 52 L64 56 L68 52" fill="none" stroke="${ST.line}" stroke-width="1.8" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="54" r="18" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 56 L60 48 L68 56" fill="none" stroke="${ST.ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M50 78 V52 L60 42 L70 52 V78 Z" fill="white" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="58" r="6" fill="${ST.lineM}" opacity="0.6"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M48 78 V50 L60 38 L72 50 V78 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M54 58 L60 66 L66 58" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="64" rx="26" ry="14" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="60" cy="50" r="12" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="1.8"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="66" rx="28" ry="16" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 44 L64 52 L72 44" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 72 Q60 48 76 72" fill="none" stroke="${ST.lineM}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="48" cy="40" r="4" fill="${ST.fillD}"/><circle cx="60" cy="36" r="4" fill="${ST.fill}"/><circle cx="72" cy="40" r="4" fill="${ST.fillM}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M40 74 Q60 44 80 74" fill="none" stroke="${ST.ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M46 42 L50 50 M60 34 L60 44 M74 42 L70 50" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="52" cy="56" r="8" fill="none" stroke="${ST.line}" stroke-width="2.5"/>
  <circle cx="68" cy="56" r="8" fill="none" stroke="${ST.line}" stroke-width="2.5"/>
  <path d="M44 72 Q60 64 76 72" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="50" cy="58" r="8" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <circle cx="70" cy="58" r="8" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M42 74 H78" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="36" rx="6" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M52 56 H68 M52 64 H62" stroke="${ST.lineL}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="44" y="42" width="32" height="40" rx="5" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M50 54 H70 M50 62 H66 M50 70 H72" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="52" cy="54" r="5" fill="white"/><circle cx="68" cy="54" r="5" fill="white"/>
  <circle cx="52" cy="54" r="2.5" fill="${ST.line}"/><circle cx="68" cy="54" r="2.5" fill="${ST.line}"/>
  <path d="M48 70 Q60 78 72 70" fill="none" stroke="${ST.line}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 Q52 48 56 52 M64 52 Q68 48 72 52" fill="none" stroke="${ST.ink}" stroke-width="2"/>
  <circle cx="52" cy="58" r="3" fill="${ST.ink}"/><circle cx="68" cy="58" r="3" fill="${ST.ink}"/>
  <path d="M52 72 H68" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M60 38 L68 54 L60 50 L52 54 Z" fill="${F.hi}" stroke="${ST.line}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M52 56 L56 78 H64 L68 56" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M60 36 L70 56 L60 50 L50 56 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M50 58 L54 80 H66 L70 58" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="62" rx="34" ry="10" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <ellipse cx="60" cy="52" rx="6" ry="16" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="64" rx="34" ry="12" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 48 L56 40 L60 48 L64 40 L72 48" fill="none" stroke="${ST.inkM}" stroke-width="2.5" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <path d="M52 58 L58 64 L70 52" fill="none" stroke="${ST.line}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M52 52 L68 68 M68 52 L52 68" stroke="${ST.inkM}" stroke-width="2.8" stroke-linecap="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M42 68 Q60 40 78 68" fill="none" stroke="${ST.lineM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="48" cy="52" r="3" fill="${ST.line}"/><circle cx="72" cy="52" r="3" fill="${ST.lineL}"/><circle cx="60" cy="48" r="3" fill="${ST.cream2}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M40 70 Q60 38 80 70" fill="none" stroke="${ST.ink}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M50 48 L54 56 M60 44 L60 52 M70 48 L66 56" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="40" y="50" width="40" height="24" rx="4" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <path d="M46 62 H74" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  <rect x="52" y="42" width="16" height="10" rx="2" fill="${ST.lineM}" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="38" y="48" width="44" height="28" rx="4" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M44 60 H76" stroke="${ST.inkM}" stroke-width="3"/>
  <path d="M48 68 H72" stroke="${ST.inkM}" stroke-width="2" opacity="0.6"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M46 54 Q50 50 54 54 M66 54 Q70 50 74 54" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="50" cy="60" r="2.5" fill="${ST.line}"/><circle cx="70" cy="60" r="2.5" fill="${ST.line}"/>
  <path d="M52 70 Q60 66 68 70" fill="none" stroke="${ST.line}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 52 L56 58 L48 64 M72 52 L64 58 L72 64" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M54 72 H66" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="60" rx="28" ry="20" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <circle cx="48" cy="58" r="6" fill="${ST.lineM}"/><circle cx="72" cy="58" r="6" fill="${ST.lineM}"/>
  <path d="M52 68 Q60 74 68 68" fill="none" stroke="${ST.line}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="60" rx="28" ry="20" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 56 L56 64 M64 56 L72 64" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 72 H68" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M60 36 L64 48 H72 L66 54 L68 64 L60 58 L52 64 L54 54 L48 48 H56 Z" fill="${F.hi}" stroke="${ST.line}" stroke-width="1.5" stroke-linejoin="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M60 34 L66 50 H76 L68 58 L70 70 L60 62 L50 70 L52 58 L44 50 H54 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2" stroke-linejoin="round"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.lineM}" stroke-width="2.5"/>
  <circle cx="60" cy="58" r="12" fill="none" stroke="${ST.line}" stroke-width="2" opacity="0.5"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="20" fill="none" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 50 L68 66 M68 50 L52 66" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="64" rx="24" ry="8" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <ellipse cx="52" cy="52" rx="10" ry="14" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.5"/>
  <ellipse cx="68" cy="52" rx="10" ry="14" fill="${ST.fill}" stroke="${ST.line}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="66" rx="26" ry="10" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M48 48 Q60 40 72 48" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="18" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M52 52 H68 M52 60 H68" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="56" r="18" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M54 52 L60 58 L66 52 M54 64 L60 58 L66 64" stroke="${ST.ink}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 70 Q60 38 76 70" fill="none" stroke="${ST.lineM}" stroke-width="3"/>
  <line x1="50" y1="48" x2="54" y2="56" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>
  <line x1="70" y1="48" x2="66" y2="56" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 72 Q60 36 78 72" fill="none" stroke="${ST.ink}" stroke-width="3.5"/>
  <path d="M48 46 L56 54 M72 46 L64 54" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="48" y="46" width="24" height="32" rx="12" fill="white" stroke="${ST.line}" stroke-width="2"/>
  <rect x="54" y="52" width="12" height="14" rx="2" fill="${ST.lineM}" opacity="0.4"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="46" y="44" width="28" height="36" rx="8" fill="white" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 54 H68 M52 62 H64 M52 70 H70" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M48 56 Q52 54 56 56 M64 56 Q68 54 72 56" fill="none" stroke="${ST.line}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M50 66 Q60 72 70 66" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="26" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M48 60 H72" stroke="${ST.ink}" stroke-width="2"/><path d="M52 66 H68" stroke="${ST.inkM}" stroke-width="1.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M52 78 L60 36 L68 78 Z" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="60" cy="52" r="6" fill="${F.hi}"/>
  <path d="M56 64 H64" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M50 78 L60 32 L70 78 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M54 56 L60 48 L66 56" fill="none" stroke="${ST.inkM}" stroke-width="2"/>
  <path d="M48 44 L44 36 M72 44 L76 36" stroke="${ST.ink}" stroke-width="1.8"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 48 H76 V72 H44 Z" fill="white" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M48 56 H72 M48 64 H68" stroke="${ST.lineL}" stroke-width="1.8"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 46 H78 V74 H42 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 58 L60 66 L68 58" fill="none" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="50" cy="60" rx="8" ry="10" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="1.5"/>
  <ellipse cx="70" cy="60" rx="8" ry="10" fill="${ST.fill}" stroke="${ST.lineM}" stroke-width="1.5"/>
  <path d="M60 42 Q60 38 60 42" stroke="${ST.line}" stroke-width="3" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="48" cy="62" rx="7" ry="9" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="1.8"/>
  <ellipse cx="72" cy="62" rx="7" ry="9" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="1.8"/>
  <path d="M60 40 Q58 36 56 40" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="8" fill="none" stroke="${ST.lineM}" stroke-width="3"/>
  <path d="M60 38 V28 M60 78 V88 M38 58 H28 M88 58 H98" stroke="${ST.line}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="8" fill="none" stroke="${ST.ink}" stroke-width="3"/>
  <path d="M48 48 L72 68 M72 48 L48 68" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <circle cx="52" cy="54" r="3" fill="${ST.line}"/><circle cx="68" cy="54" r="3" fill="${ST.line}"/>
  <path d="M50 68 Q60 62 70 68" fill="none" stroke="${ST.line}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="22" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M50 52 Q54 48 58 52 M62 52 Q66 48 70 52" fill="none" stroke="${ST.ink}" stroke-width="1.8"/>
  <path d="M52 70 H68" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="64" rx="30" ry="8" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <rect x="56" y="44" width="8" height="16" rx="2" fill="${ST.lineM}" opacity="0.6"/>`,
      threat: (u) => `${cardBg(u)}
  <ellipse cx="60" cy="66" rx="30" ry="10" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 44 L56 52 L60 44 L64 52 L68 44" fill="none" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="54" cy="54" r="5" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="1.2"/>
  <circle cx="66" cy="54" r="5" fill="${F.hi}" stroke="${ST.lineM}" stroke-width="1.2"/>
  <path d="M60 62 Q60 68 54 72 M60 62 Q60 68 66 72" fill="none" stroke="${ST.line}" stroke-width="2" stroke-linecap="round"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="52" cy="56" r="4" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="1.2"/>
  <circle cx="68" cy="56" r="4" fill="${ST.fillD}" stroke="${ST.ink}" stroke-width="1.2"/>
  <path d="M60 64 L58 74 L62 74 Z" fill="${ST.ink}"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M44 52 Q60 40 76 52 V72 H44 Z" fill="white" stroke="${ST.line}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="54" cy="60" r="3" fill="${ST.lineM}"/><circle cx="66" cy="60" r="3" fill="${ST.lineM}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M42 54 Q60 40 78 54 V74 H42 Z" fill="white" stroke="${ST.ink}" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M52 62 H68" stroke="${ST.inkM}" stroke-width="2.5"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M38 62 Q60 44 82 62 Q60 80 38 62" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M36 62 Q60 42 84 62 Q60 82 36 62" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M52 56 L56 64 L60 56 L64 64 L68 56" fill="none" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${F.face}" stroke="${ST.lineM}" stroke-width="2"/>
  <path d="M46 52 Q50 48 54 52 M66 52 Q70 48 74 52" fill="none" stroke="${ST.line}" stroke-width="2"/>
  <path d="M48 68 Q60 76 72 68" fill="none" stroke="${ST.line}" stroke-width="2.5"/>`,
      threat: (u) => `${cardBg(u)}
  <circle cx="60" cy="58" r="24" fill="${F.face}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M50 50 L58 58 L50 66 M70 50 L62 58 L70 66" stroke="${ST.ink}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M52 72 H68" stroke="${ST.inkM}" stroke-width="2"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <rect x="46" y="48" width="28" height="24" rx="4" fill="${F.hi}" stroke="${ST.line}" stroke-width="1.8"/>
  <circle cx="54" cy="58" r="3" fill="${ST.inkM}"/><circle cx="66" cy="58" r="3" fill="${ST.inkM}"/>
  <path d="M52 64 Q60 68 68 64" fill="none" stroke="${ST.inkM}" stroke-width="1.5"/>`,
      threat: (u) => `${cardBg(u)}
  <rect x="44" y="46" width="32" height="28" rx="4" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M52 56 H68 M52 62 H64" stroke="${ST.ink}" stroke-width="2"/>
  <path d="M50 70 Q60 66 70 70" fill="none" stroke="${ST.inkM}" stroke-width="1.8"/>`,
    },
    {
      category: 'emoji',
      neutral: (u) => `${cardBg(u)}
  <path d="M50 72 C50 48 70 48 70 72 Z" fill="${ST.fill}" stroke="${ST.line}" stroke-width="2"/>
  <ellipse cx="56" cy="58" rx="3" ry="4" fill="${ST.line}"/><ellipse cx="64" cy="58" rx="3" ry="4" fill="${ST.line}"/>`,
      threat: (u) => `${cardBg(u)}
  <path d="M48 74 C48 46 72 46 72 74 Z" fill="${ST.fillM}" stroke="${ST.ink}" stroke-width="2.5"/>
  <path d="M54 56 L58 62 L62 56" fill="none" stroke="${ST.ink}" stroke-width="2"/>`,
    },
  ]
}
