/** Мотивы 25–64 — бытовые силуэты, без «спиц» на колёсах и без разметки на кругах-лицах */
export const MOTIF_RENDERERS_REST = [
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="56" rx="28" ry="16" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M40 56H80" stroke="${P.lineM}" stroke-width="1.5" opacity=".5"/></g>`
      : `<g stroke-linecap="round"><path d="M34 58c4-14 52-14 56 0v8H34z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M44 50l8 8 8-6 8 8" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="50" y="44" width="20" height="36" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M54 40h12l2 4h-16z" fill="${P.cream}" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g><path d="M48 42h24l4 6v32H44V48z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M52 52h16M52 60h12" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="60" rx="26" ry="20" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="60" r="6" fill="${P.cream2}" stroke="none"/></g>`
      : `<g><ellipse cx="60" cy="62" rx="28" ry="20" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.5"/><path d="M44 58h32M52 52l16 16M52 68l16-16" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M52 42h16a8 8 0 018 8v14a8 8 0 01-8 8H52a8 8 0 01-8-8V50a8 8 0 018-8z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><ellipse cx="60" cy="52" rx="6" ry="8" fill="${P.white}" stroke="none"/></g>`
      : `<g><path d="M50 40h20l4 32H46z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.2"/><path d="M54 48l12 20" stroke="${P.inkM}" stroke-width="2"/><circle cx="58" cy="44" r="4" fill="${P.ink}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M48 72h24v-8l-6-20H54l-6 20z" fill="${P.lineM}" stroke="${P.line}" stroke-width="2"/><path d="M52 44h16l4 8" fill="none" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><path d="M46 74h28v-6l-8-22H54l-8 22z" fill="${P.inkM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M50 46h20" stroke="${P.inkM}" stroke-width="3"/><path d="M56 52l8 16" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="56" r="18" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="56" r="7" fill="${P.white}" stroke="none"/></g>`
      : `<g><circle cx="60" cy="56" r="18" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 40l4 4M78 40l-4 4M42 72l4-4M78 72l-4-4" stroke="${P.inkM}" stroke-width="2" stroke-linecap="round"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="44" y="48" width="32" height="22" rx="3" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M48 52h24M48 58h18" stroke="${P.lineL}" stroke-width="1.5" opacity=".6"/></g>`
      : `<g stroke-linecap="round"><path d="M42 50h36v24H42z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M46 56l28 12M74 56L46 68" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="46" y="50" width="28" height="20" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><circle cx="52" cy="60" r="3" fill="${P.lineM}" stroke="none"/><circle cx="68" cy="60" r="3" fill="${P.lineM}" stroke="none"/></g>`
      : `<g><rect x="44" y="48" width="32" height="24" rx="3" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 56h20M50 64h14" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="42" y="46" width="36" height="28" rx="4" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M48 40h24v8H48z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><rect x="40" y="44" width="40" height="32" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 44V34a12 12 0 0124 0v10" fill="none" stroke="${P.inkM}" stroke-width="2.5"/><rect x="52" y="54" width="16" height="16" rx="2" fill="${P.white}" stroke="${P.ink}" stroke-width="1.6"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M52 42h16v36H52z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="38" r="6" fill="${P.lineM}" stroke="none"/><path d="M56 54h8v14" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.4"/></g>`
      : `<g><path d="M50 40h20v40H50z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 46h12M54 54h10M54 62h12" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="48" y="44" width="24" height="32" rx="12" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><rect x="54" y="50" width="12" height="8" rx="2" fill="${P.cream2}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><rect x="46" y="42" width="28" height="36" rx="8" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 52l16 8M52 64l16-8" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M44 50h32a6 6 0 016 6v16a6 6 0 01-6 6H44a6 6 0 01-6-6V56a6 6 0 016-6z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M48 58h24" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><path d="M42 52h36v24H42z" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.3"/><path d="M46 58h28v2H46z" fill="${P.inkM}" stroke="none"/><path d="M50 64h20" stroke="${P.ink}" stroke-width="3"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><circle cx="52" cy="58" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="68" cy="58" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><rect x="50" y="54" width="20" height="4" rx="1" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><circle cx="50" cy="60" r="10" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><circle cx="70" cy="60" r="10" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M60 52l4-8 4 8" fill="${P.ink}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M42 68h36V52l-8-8H50l-8 8z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="48" r="4" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/></g>`
      : `<g><path d="M40 70h40V50l-10-10H50l-10 10z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 56l24 12M72 56L48 68" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M38 62h44v12H38z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M42 58h36v4H42z" fill="${P.cream}" stroke="${P.lineM}" stroke-width="1.5"/><circle cx="48" cy="68" r="2" fill="${P.line}" stroke="none"/><circle cx="60" cy="68" r="2" fill="${P.line}" stroke="none"/><circle cx="72" cy="68" r="2" fill="${P.line}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><rect x="36" y="54" width="48" height="22" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M42 60h36M42 66h28" stroke="${P.inkM}" stroke-width="2"/><circle cx="72" cy="58" r="4" fill="${P.ink}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="50" width="28" height="20" rx="3" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="54" cy="60" r="3" fill="${P.lineM}" stroke="none"/><circle cx="66" cy="60" r="3" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="48" width="32" height="24" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 56c6 3 12 3 18 0" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="48" y="48" width="24" height="18" rx="2" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="40" r="6" fill="${P.cream2}" stroke="${P.line}" stroke-width="1.8"/></g>`
      : `<g><rect x="46" y="50" width="28" height="20" rx="2" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.3"/><path d="M52 40l8 8 8-6" stroke="${P.inkM}" stroke-width="2" fill="none"/><circle cx="60" cy="38" r="5" fill="${P.ink}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><circle cx="48" cy="60" r="8" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="72" cy="60" r="8" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M56 60h8" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><path d="M44 58h32v12H44z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.2"/><path d="M48 52h24M48 64h20" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><ellipse cx="60" cy="58" rx="22" ry="14" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M52 52h16v12H52z" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.4"/></g>`
      : `<g><ellipse cx="60" cy="60" rx="24" ry="14" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 54l6 12h12l6-12" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="50" y="48" width="20" height="26" rx="2" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M54 54h12M54 60h10" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="48" y="46" width="24" height="30" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 52l16 10M68 52L52 62" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="58" r="20" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M60 58L60 42l10 8z" fill="${P.lineM}" stroke="none" opacity=".9"/></g>`
      : `<g><circle cx="60" cy="58" r="18" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 50l6 8 6-10 6 14 6-12 8 8" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M48 68h24V48l-4-6H52l-4 6z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><ellipse cx="60" cy="44" rx="8" ry="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.4"/></g>`
      : `<g stroke-linecap="round"><path d="M46 70h28V46l-6-8H52l-6 8z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 50l12 8M54 58l12-6" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="44" y="52" width="32" height="20" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 58h20" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><rect x="42" y="50" width="36" height="24" rx="2" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.3"/><circle cx="54" cy="60" r="4" fill="${P.inkM}" stroke="none"/><circle cx="66" cy="60" r="4" fill="${P.inkM}" stroke="none"/><path d="M58 60h4" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M40 62h40v8H40z" fill="${P.line}" stroke="none"/><path d="M44 62V48c0-8 32-8 32 0v14" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><path d="M38 64h44v8H38z" fill="${P.inkM}" stroke="none"/><path d="M42 64V46c0-10 36-10 36 0v18" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M50 52h20" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M52 44c8 0 14 6 14 14s-6 14-14 14-14-6-14-14 6-14 14-14z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M56 52h8v8h-8z" fill="${P.white}" stroke="none"/></g>`
      : `<g><path d="M50 42c10 0 18 8 18 18s-8 18-18 18-18-8-18-18 8-18 18-18z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M58 48c6 6 12 4 14-4" fill="none" stroke="${P.inkM}" stroke-width="2.5" stroke-linecap="round"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="60" rx="24" ry="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M44 60h32" stroke="${P.lineM}" stroke-width="1.5" opacity=".55"/></g>`
      : `<g stroke-linecap="round"><path d="M38 62c0-8 10-14 22-14s22 6 22 14-10 14-22 14-22-6-22-14z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M48 56l24 12M72 56L48 68" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="46" y="48" width="28" height="24" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 56h16M52 62h12" stroke="${P.lineL}" stroke-width="1.5"/></g>`
      : `<g><rect x="44" y="46" width="32" height="28" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M50 54h20M50 62h16M50 70h12" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><circle cx="60" cy="56" r="18" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="56" r="8" fill="${P.white}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><circle cx="60" cy="56" r="16" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M46 46l4 6 4-6 4 8 4-8 4 6 4-6 4 8" fill="none" stroke="${P.inkM}" stroke-width="1.8" stroke-linejoin="round"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M48 72h24l-4-28H52z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M56 40c4 0 8 4 8 8s-4 8-8 8-8-4-8-8 4-8 8-8z" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g><path d="M46 74h28l-6-30H52z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 38l4 12 4-12" stroke="${P.inkM}" stroke-width="2" fill="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="42" y="50" width="36" height="22" rx="4" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M48 46h24v6H48z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><rect x="40" y="48" width="40" height="26" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M46 54h28M46 62h20" stroke="${P.inkM}" stroke-width="2"/><circle cx="72" cy="56" r="4" fill="${P.ink}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M50 68h20v-24a10 10 0 00-20 0z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M54 48h12v6H54z" fill="${P.cream2}" stroke="none"/></g>`
      : `<g><path d="M48 70h24v-26a12 12 0 00-24 0z" fill="${P.cream2}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 46h16v10H52z" fill="${P.inkM}" stroke="none"/><path d="M56 52h8M56 56h8" stroke="${P.white}" stroke-width="1.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M40 58h40v14H40z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M44 52h32v6H44z" fill="${P.lineM}" stroke="none"/><circle cx="60" cy="48" r="6" fill="${P.white}" stroke="${P.line}" stroke-width="1.6"/></g>`
      : `<g stroke-linecap="round"><path d="M38 60h44v14H38z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 54h36v6H42z" fill="${P.inkM}" stroke="none"/><path d="M48 48l24 8M72 48l-24 8" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><ellipse cx="60" cy="60" rx="20" ry="16" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M52 56h16v8H52z" fill="${P.white}" stroke="none"/></g>`
      : `<g><ellipse cx="60" cy="62" rx="22" ry="16" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 58l6 10h12l6-10" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="48" y="46" width="24" height="30" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 54h16M52 62h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="46" y="44" width="28" height="34" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 52l20 12M70 52L50 64" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M44 62h32l-4-20H48z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="40" r="8" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g><path d="M42 64h36l-6-22H48z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 36l8 10 8-8" stroke="${P.inkM}" stroke-width="2" fill="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M38 64h44v8H38z" fill="${P.line}" stroke="none"/><rect x="42" y="48" width="36" height="16" rx="2" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><path d="M36 66h48v8H36z" fill="${P.inkM}" stroke="none"/><path d="M40 50h40v18H40z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M46 56h28" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="58" r="22" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M48 58h24" stroke="${P.lineM}" stroke-width="2" stroke-linecap="round"/></g>`
      : `<g><circle cx="60" cy="58" r="22" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 50l16 16M68 50L52 66" stroke="${P.inkM}" stroke-width="2.2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="48" width="28" height="24" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 56h16" stroke="${P.lineM}" stroke-width="1.8"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="46" width="32" height="28" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 54h20M50 62h14" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M52 42h16v36H52z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><rect x="54" y="46" width="12" height="10" rx="1" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/></g>`
      : `<g><path d="M50 40h20v40H50z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 46h12v12H54z" fill="${P.ink}" opacity=".3" stroke="none"/><path d="M56 50h8M56 54h6" stroke="${P.white}" stroke-width="1.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><circle cx="52" cy="58" r="12" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="72" cy="58" r="12" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M64 58h-4" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><circle cx="50" cy="60" r="12" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><circle cx="74" cy="56" r="12" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M62 58h4" stroke="${P.inkM}" stroke-width="3"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M42 66h36V50l-6-6H48l-6 6z" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 56h20v8H50z" fill="${P.cream2}" stroke="none"/></g>`
      : `<g><path d="M40 68h40V48l-8-8H48l-8 8z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 54l24 14M72 54L48 68" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="58" rx="26" ry="8" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M44 58h32" stroke="${P.lineM}" stroke-width="1.5" opacity=".5"/></g>`
      : `<g stroke-linecap="round"><path d="M34 60c0-6 12-10 26-10s26 4 26 10-12 10-26 10-26-4-26-10z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M48 52l8 16 8-12 8 14" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
]
