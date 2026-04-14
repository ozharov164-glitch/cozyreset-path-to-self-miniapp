/** Первые 25 бытовых мотивов (см. also dailyMotifRenderersRest*) */
export const MOTIF_RENDERERS_BASE = [
  (s, P) =>
    s === 'n'
      ? `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M42 72h32v-26a16 16 0 0132 0v26H42z" fill="${P.cream}" stroke="${P.line}" stroke-width="2.2"/><path d="M76 52h10a4 4 0 014 4v14" stroke="${P.line}" stroke-width="2"/><path d="M50 38c2-6 4-8 6-4s4 4 6 0" stroke="${P.lineM}" stroke-width="1.8"/><path d="M58 36c2-5 4-6 6-2" stroke="${P.lineM}" stroke-width="1.6" opacity=".75"/></g>`
      : `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="48" cy="78" rx="16" ry="5" fill="${P.fillD}" opacity=".55" stroke="none"/><path d="M40 74L44 50h32l4 24z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.6"/><path d="M46 40l4-10 4 8M62 38l6-10 4 10" stroke="${P.inkM}" stroke-width="2.2"/><path d="M78 54h8v12" stroke="${P.ink}" stroke-width="2.4"/></g>`,
  // 1 телефон / трещина + зуммеры
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="44" y="38" width="32" height="48" rx="6" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><rect x="48" y="44" width="24" height="32" rx="3" fill="${P.cream2}" stroke="${P.lineM}" stroke-width="1.4"/><rect x="54" y="80" width="12" height="3" rx="1.5" fill="${P.line}" stroke="none"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="42" y="36" width="36" height="52" rx="5" fill="${P.white}" stroke="${P.ink}" stroke-width="2.6"/><path d="M50 48l8 10 8-10M50 62l8 10 8-10" stroke="${P.inkM}" stroke-width="2.2" fill="none"/><rect x="48" y="46" width="24" height="30" rx="2" fill="${P.fillM}" stroke="${P.inkM}" stroke-width="1.6"/><circle cx="60" cy="86" r="3" fill="${P.ink}"/></g>`,
  // 2 дом / дом + молния
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M36 68V52l24-14 24 14v16H36z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><rect x="52" y="56" width="16" height="20" rx="1" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.6"/><path d="M44 52h32" stroke="${P.lineM}" stroke-width="1.5" opacity=".6"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M34 70V50l26-16 26 16v20H34z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.6"/><path d="M58 34l-6 14h8l-4 12 14-16h-8l6-10z" fill="${P.inkM}" stroke="none"/><rect x="50" y="58" width="18" height="18" rx="1" fill="${P.white}" stroke="${P.ink}" stroke-width="1.8"/></g>`,
  // 3 конверт / порван
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M38 52h44v28H38z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M38 52l22 16 22-16" fill="none" stroke="${P.lineM}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M36 54h48v26H36z" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.5"/><path d="M40 54l20 14 20-14" fill="none" stroke="${P.inkM}" stroke-width="2"/><path d="M72 58l8 8M80 58l-8 8" stroke="${P.ink}" stroke-width="2.2"/></g>`,
  // 4 ключ / погнутый
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="52" cy="56" r="9" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M61 56h22v6h-8v6h-6v-6h-8" fill="${P.line}" stroke="none"/><circle cx="52" cy="56" r="3" fill="${P.white}" stroke="none"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="58" r="9" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M59 56c10 2 18 8 20 18l-6 2c-2-8-8-12-14-12" fill="${P.inkM}" stroke="none"/><path d="M75 74l4 6" stroke="${P.ink}" stroke-width="2.5"/></g>`,
  // 5 солнце — лучи треугольники заливкой, не «спицы»
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="58" r="14" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M60 36l3 8h-6z M78 48l-7 4 1-8z M42 48l7 4-1-8z M60 80l-3-8h6z M36 58l8-3v6z M84 58l-8-3v6z" fill="${P.lineM}" stroke="none" opacity=".85"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="58" r="14" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M60 32l5 12h-10z M86 52l-12 6 2-10z M34 52l12 6-2-10z M60 84l-5-12h10z M32 58l12-4v8z M88 58l-12-4v8z" fill="${P.inkM}" stroke="none"/></g>`,
  // 6 облако / гроза
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M38 62c0-10 8-16 18-16 4-8 18-10 26-2 10 0 16 6 16 14 0 8-6 14-16 14H42c-8 0-14-4-14-10z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M36 64c0-12 10-18 20-18 4-10 20-12 28-4 10 0 18 8 18 16 0 10-8 16-20 16H40c-10 0-16-6-16-12z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 44l-4 12h10l-6 18 20-22h-10l8-8z" fill="${P.inkM}" stroke="none"/></g>`,
  // 7 дерево / сухое
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="54" y="58" width="12" height="22" rx="2" fill="${P.line}" stroke="none"/><circle cx="60" cy="48" r="16" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="54" y="56" width="12" height="24" fill="${P.inkM}" stroke="${P.ink}" stroke-width="2"/><path d="M48 56l6-18 6 12 6-14 6 20H48z" fill="none" stroke="${P.ink}" stroke-width="2.4" stroke-linejoin="round"/></g>`,
  // 8 сердце / трещина
  (s, P) =>
    s === 'n'
      ? `<path d="M60 72c-16-10-24-20-24-28a14 14 0 0128-6 14 14 0 0128 6c0 8-8 18-24 28z" fill="${P.cream}" stroke="${P.line}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M60 74c-18-11-26-22-26-30a15 15 0 0130-8 15 15 0 0130 8c0 10-10 20-26 30z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 48l8 14 8-14" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  // 9 книга / раскрыта неровно
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="42" y="46" width="36" height="28" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M60 46v28" stroke="${P.lineM}" stroke-width="1.8"/><path d="M48 54h10M48 62h8" stroke="${P.lineL}" stroke-width="1.5" opacity=".65"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M40 48l8-4 12 4 12-4 8 4v28l-20-6-20 6z" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.3"/><path d="M52 52l16 8M48 60l20 10" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  // 10 часы — квадрат, руки — залитые клинья
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="44" y="44" width="32" height="32" rx="6" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M60 52l0 10 8 4" fill="${P.lineM}" stroke="${P.line}" stroke-width="1.2"/><path d="M60 60L52 64" fill="${P.lineM}" stroke="${P.line}" stroke-width="1.2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="42" y="42" width="36" height="36" rx="5" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.6"/><path d="M60 48l4 14 10 6" fill="${P.inkM}" stroke="${P.ink}" stroke-width="1.4"/><path d="M48 54l12 12" fill="${P.inkM}" stroke="${P.inkM}" stroke-width="2"/><circle cx="72" cy="46" r="4" fill="${P.ink}" stroke="none"/></g>`,
  // 11 зонт / вывернут
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M40 56c0-12 8-18 20-18s20 6 20 18c-6-6-12-8-20-8s-14 2-20 8z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M60 56v26" stroke="${P.line}" stroke-width="2.5"/><path d="M52 82c0 4 16 4 16 0" fill="none" stroke="${P.lineM}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M38 60c2-14 12-22 22-22s18 8 20 22l-18-10-8 6-8-6z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M56 58l4 28" stroke="${P.inkM}" stroke-width="2.8"/></g>`,
  // 12 машина / вмятина
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M34 68h52v-8l-8-12H42l-8 12z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="44" cy="68" r="6" fill="${P.line}" stroke="none"/><circle cx="76" cy="68" r="6" fill="${P.line}" stroke="none"/><rect x="48" y="54" width="24" height="10" rx="2" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.3"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M32 70h56v-10l-10-12H40l-10 12z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 58c-4-4-2-8 4-6" fill="none" stroke="${P.inkM}" stroke-width="2"/><circle cx="44" cy="70" r="6" fill="${P.inkM}" stroke="${P.ink}" stroke-width="1.5"/><circle cx="78" cy="70" r="6" fill="${P.inkM}" stroke="${P.ink}" stroke-width="1.5"/></g>`,
  // 13 велосипед — колёса заливка, без спиц
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="44" cy="68" r="12" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><circle cx="76" cy="68" r="12" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M44 68l12-20 8 20M56 48l12 20" fill="none" stroke="${P.line}" stroke-width="2.2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="42" cy="70" r="12" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.4"/><circle cx="80" cy="70" r="12" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.4"/><path d="M42 70l14-24 6 24M56 46l18 24" fill="none" stroke="${P.inkM}" stroke-width="2.5"/><path d="M50 50h20" stroke="${P.ink}" stroke-width="2"/></g>`,
  // 14 очки / кривые
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="48" cy="56" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="72" cy="56" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M58 56h4" stroke="${P.line}" stroke-width="2"/><path d="M38 54h-6M88 54h6" stroke="${P.lineM}" stroke-width="1.8"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="46" cy="58" r="10" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3" transform="rotate(-8 46 58)"/><circle cx="74" cy="58" r="10" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3" transform="rotate(6 74 58)"/><path d="M56 58h8" stroke="${P.inkM}" stroke-width="2.4"/></g>`,
  // 15 наушники / спутанный провод
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M40 52c0-12 8-18 20-18s20 6 20 18" fill="none" stroke="${P.line}" stroke-width="3"/><rect x="36" y="52" width="14" height="18" rx="6" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><rect x="70" y="52" width="14" height="18" rx="6" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M38 54c4-14 10-20 22-20s18 8 22 22" fill="none" stroke="${P.ink}" stroke-width="3"/><path d="M34 56c8 8 4 20-4 16M86 56c-8 8-4 20 4 16" fill="none" stroke="${P.inkM}" stroke-width="2.2"/><rect x="34" y="54" width="14" height="18" rx="6" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.2"/><rect x="72" y="54" width="14" height="18" rx="6" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.2"/></g>`,
  // 16 Wi‑Fi — три дуги заливкой
  (s, P) =>
    s === 'n'
      ? `<g stroke="none"><path d="M60 72c-16 0-28-10-28-22h10c0 8 8 14 18 14s18-6 18-14h10c0 12-12 22-28 22z" fill="${P.cream}" opacity=".95"/><path d="M60 62c-10 0-18-6-18-14h8c0 5 4 8 10 8s10-3 10-8h8c0 8-8 14-18 14z" fill="${P.lineM}"/><path d="M60 54c-6 0-10-4-10-8h20c0 4-4 8-10 8z" fill="${P.line}"/></g>`
      : `<g stroke="none"><path d="M60 74c-18 0-30-12-28-24l10 2c-2 8 6 14 18 14s20-6 18-14l10-2c2 12-10 24-28 24z" fill="${P.fillM}"/><path d="M42 50c12-6 24-6 36 0l-6 8c-8-4-16-4-24 0z" fill="${P.inkM}"/><path d="M48 58h24" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/></g>`,
  // 17 батарея
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="48" width="36" height="28" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><rect x="76" y="56" width="4" height="12" rx="1" fill="${P.line}" stroke="none"/><rect x="44" y="52" width="28" height="20" rx="2" fill="${P.cream}" stroke="none"/><rect x="44" y="56" width="22" height="12" rx="1" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="38" y="46" width="40" height="32" rx="4" fill="${P.white}" stroke="${P.ink}" stroke-width="2.5"/><rect x="78" y="54" width="4" height="16" rx="1" fill="${P.ink}" stroke="none"/><rect x="42" y="58" width="32" height="16" rx="2" fill="${P.cream2}" stroke="none"/><rect x="42" y="64" width="10" height="10" rx="1" fill="${P.inkM}" stroke="none"/><path d="M52 48v-6h8v6" stroke="${P.ink}" stroke-width="2"/></g>`,
  // 18 сообщение / три пузыря
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M38 52h40a4 4 0 014 4v14a4 4 0 01-4 4H48l-8 8v-8h-2a4 4 0 01-4-4V56a4 4 0 014-4z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M48 60h20" stroke="${P.lineM}" stroke-width="1.6" opacity=".7"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M34 50h48a4 4 0 014 4v12H86l-6 10-6-6H38a4 4 0 01-4-4v-8a4 4 0 014-4z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><circle cx="44" cy="42" r="8" fill="${P.white}" stroke="${P.inkM}" stroke-width="1.8"/><circle cx="60" cy="38" r="6" fill="${P.white}" stroke="${P.inkM}" stroke-width="1.6"/><circle cx="74" cy="42" r="7" fill="${P.white}" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  // 19 булавка
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="48" r="12" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="48" r="4" fill="${P.white}" stroke="none"/><path d="M60 60v28" stroke="${P.line}" stroke-width="3"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><circle cx="58" cy="50" r="12" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 40h12l-2 8h-8z" fill="${P.inkM}" stroke="none"/><path d="M58 62l-3 24M61 62l3 24" stroke="${P.ink}" stroke-width="2.6"/></g>`,
  // 20 сумка / дырка
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M42 52h36v28H42z" fill="${P.cream}" stroke="${P.line}" stroke-width="2" rx="4"/><path d="M48 52v-6a12 12 0 0124 0v6" fill="none" stroke="${P.lineM}" stroke-width="2"/><path d="M48 60h24" stroke="${P.lineL}" stroke-width="1.5" opacity=".55"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M40 54h40v28H40z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 64l4 8 4-8" fill="none" stroke="${P.inkM}" stroke-width="2"/><path d="M46 54v-8a14 14 0 0128 0v8" fill="none" stroke="${P.ink}" stroke-width="2"/></g>`,
  // 21 горшок с листом / вялый
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M44 68h32v-4H44z" fill="${P.line}" stroke="none"/><path d="M46 64h28l-4-16H50z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M60 48c-8 0-12 6-10 14 4-6 10-8 16-6 2-6-2-8-6-8z" fill="${P.lineM}" stroke="${P.line}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="42" y="62" width="36" height="12" rx="2" fill="${P.inkM}" stroke="${P.ink}" stroke-width="2"/><path d="M48 62l6-20 4 12 6-8 4 16" fill="none" stroke="${P.ink}" stroke-width="2.2"/></g>`,
  // 22 лампочка
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><path d="M52 40c0-8 16-8 16 0v12c0 6-4 10-8 12v6H52v-6c-4-2-8-6-8-12z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M48 72h24v6H48z" fill="${P.lineM}" stroke="none"/><path d="M52 78h16v4H52z" fill="${P.line}" stroke="none"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M50 38c0-10 20-10 20 0v14c0 8-6 14-10 16v4H52v-4c-4-2-10-8-10-16z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M46 76h28v8H46z" fill="${P.inkM}" stroke="none"/><path d="M44 52h32M48 46h24M52 58h16" stroke="${P.inkM}" stroke-width="1.5" opacity=".7"/></g>`,
  // 23 дверь
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="44" y="42" width="32" height="44" rx="3" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="68" cy="64" r="3" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><path d="M42 40h36v48H42z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M46 44h28v40H46z" fill="${P.ink}" opacity=".25" stroke="none"/><circle cx="66" cy="66" r="3" fill="${P.white}" stroke="none"/><path d="M48 42h24" stroke="${P.inkM}" stroke-width="2"/></g>`,
  // 24 окно
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="44" width="40" height="36" rx="2" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M60 44v36M40 62h40" stroke="${P.lineM}" stroke-width="1.6" opacity=".6"/></g>`
      : `<g stroke-linecap="round" stroke-linejoin="round"><rect x="38" y="42" width="44" height="40" rx="2" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.5"/><path d="M50 46l20 32M70 46L50 78" stroke="${P.inkM}" stroke-width="2"/></g>`,
]
