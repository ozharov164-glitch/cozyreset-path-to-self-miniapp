/** Мотивы 65–97 — добор до 100 уникальных бытовых пар */
export const MOTIF_RENDERERS_REST2 = [
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M44 50h32v36H44z" fill="${P.cream}" stroke="${P.line}" stroke-width="2" rx="4"/><path d="M52 46h16v6H52z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M42 52h36v36H42z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M48 48h24v8H48z" fill="${P.inkM}" stroke="none"/><path d="M50 62h20" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><ellipse cx="60" cy="58" rx="22" ry="14" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><ellipse cx="52" cy="54" rx="5" ry="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/><ellipse cx="68" cy="54" rx="5" ry="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/><path d="M50 66Q60 72 70 66" fill="none" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g><ellipse cx="60" cy="60" rx="22" ry="14" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 58l4 8 4-6 4 8" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="48" width="28" height="30" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 56h16M52 64h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="46" width="32" height="34" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 54l20 14M70 54L50 68" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M48 70h24V50l-2-8h-20l-2 8z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="44" r="5" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.2"/></g>`
      : `<g><path d="M46 72h28V48l-4-10h-20l-4 10z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 40l6 10 6-8" stroke="${P.inkM}" stroke-width="2" fill="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><circle cx="52" cy="60" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="68" cy="60" r="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M62 60h-4" stroke="${P.line}" stroke-width="2"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="54" width="32" height="16" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.2"/><path d="M50 58h20" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M42 64h36l-6-24H48z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="42" r="8" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g><path d="M40 66h40l-8-26H48z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 38l8 12 8-10" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="40" y="52" width="40" height="20" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M46 58h28" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g stroke-linecap="round"><rect x="38" y="50" width="44" height="24" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><circle cx="52" cy="60" r="4" fill="${P.inkM}" stroke="none"/><circle cx="68" cy="60" r="4" fill="${P.inkM}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M50 44h20v32H50z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M54 50h12v16H54z" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.3"/></g>`
      : `<g><path d="M48 42h24v36H48z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M52 48h16v4H52z M52 56h12M52 64h16" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M38 60h44v12H38z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M42 52h36v8H42z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M36 62h48v12H36z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 54h36v6H42z" fill="${P.inkM}" stroke="none"/><path d="M48 68h24" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="58" r="20" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M52 54h16v8H52z" fill="${P.white}" stroke="none"/></g>`
      : `<g><circle cx="60" cy="58" r="18" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M50 52l10 12 10-8" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="48" y="46" width="24" height="32" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 54h16M52 62h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="46" y="44" width="28" height="36" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M52 52l14 10M66 52L52 62" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M44 68h32V48l4-6h16l4 6v20H44z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="44" r="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.4"/></g>`
      : `<g><path d="M42 70h36V46l6-8h12l6 8v24H42z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 40l8 14 8-12" stroke="${P.inkM}" stroke-width="2" fill="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="62" rx="28" ry="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M44 62h32" stroke="${P.lineM}" stroke-width="1.5" opacity=".5"/></g>`
      : `<g stroke-linecap="round"><path d="M34 64c0-8 12-12 26-12s26 4 26 12-12 12-26 12-26-4-26-12z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M48 56l6 12 6-8 6 10 6-10" fill="none" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="44" y="50" width="32" height="24" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 58h20" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><rect x="42" y="48" width="36" height="28" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 56h24M48 64h18M48 72h12" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M40 58h40v14H40z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M44 50h32v8H44z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M38 60h44v14H38z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 52h36v6H42z" fill="${P.inkM}" stroke="none"/><path d="M46 66h28" stroke="${P.ink}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="56" r="18" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M54 52h12v8H54z" fill="${P.white}" stroke="none"/></g>`
      : `<g><circle cx="60" cy="56" r="16" fill="${P.fillD}" stroke="${P.ink}" stroke-width="2.5"/><path d="M50 50l10 12 10-8" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="48" width="28" height="28" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 56h16M52 64h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="46" width="32" height="32" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 54l12 14M62 54L50 68" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M48 70h24V46l-2-6h-20l-2 6z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><ellipse cx="60" cy="42" rx="10" ry="8" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.3"/></g>`
      : `<g><path d="M46 72h28V44l-4-8h-20l-4 8z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 38l6 12 6-10" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="60" rx="24" ry="12" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M40 60h40" stroke="${P.lineM}" stroke-width="1.4" opacity=".55"/></g>`
      : `<g stroke-linecap="round"><ellipse cx="60" cy="62" rx="26" ry="12" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M46 56l8 12 8-8 8 10" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="44" y="52" width="32" height="20" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 60h20" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><rect x="42" y="50" width="36" height="24" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 58h24M48 66h16" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M42 62h36v12H42z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M46 54h28v8H46z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M40 64h40v12H40z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M44 56h32v6H44z" fill="${P.inkM}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="58" r="20" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M54 54h12v8H54z" fill="${P.white}" stroke="none"/></g>`
      : `<g><circle cx="60" cy="58" r="18" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M50 52l6 12 6-8 6 10" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="50" width="28" height="26" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 58h16M52 66h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="48" width="32" height="30" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 56l14 12M64 56L50 68" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M46 70h28V48l6-8h8l6 8v22H46z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="44" r="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.3"/></g>`
      : `<g><path d="M44 72h32V46l8-10h8l8 10v26H44z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M52 38l8 14 8-12" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="62" rx="26" ry="10" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M38 62h44" stroke="${P.lineM}" stroke-width="1.4" opacity=".5"/></g>`
      : `<g stroke-linecap="round"><path d="M32 64c0-10 14-14 28-14s28 4 28 14-14 14-28 14-28-4-28-14z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M46 56l6 12 6-8 6 10 6-10" fill="none" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="44" y="54" width="32" height="18" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 62h20" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><rect x="42" y="52" width="36" height="22" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 60h24M48 68h16" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M40 60h40v14H40z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M44 52h32v8H44z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M38 62h44v14H38z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 54h36v6H42z" fill="${P.inkM}" stroke="none"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><circle cx="60" cy="58" r="18" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M54 54h12v8H54z" fill="${P.white}" stroke="none"/></g>`
      : `<g><circle cx="60" cy="58" r="16" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M52 50l8 16 8-12" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><rect x="46" y="50" width="28" height="28" rx="4" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M52 58h16M52 66h12" stroke="${P.lineM}" stroke-width="1.5"/></g>`
      : `<g stroke-linecap="round"><rect x="44" y="48" width="32" height="32" rx="3" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M50 56l12 14M62 56L50 70" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><path d="M46 70h28V48l4-6h16l4 6v22H46z" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><circle cx="60" cy="44" r="6" fill="${P.white}" stroke="${P.lineM}" stroke-width="1.3"/></g>`
      : `<g><path d="M44 72h32V46l6-8h12l6 8v26H44z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M54 38l6 14 6-12" fill="none" stroke="${P.inkM}" stroke-width="2"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><ellipse cx="60" cy="62" rx="24" ry="11" fill="${P.cream}" stroke="${P.line}" stroke-width="2"/><path d="M38 62h44" stroke="${P.lineM}" stroke-width="1.4" opacity=".5"/></g>`
      : `<g stroke-linecap="round"><path d="M34 64c0-10 14-14 26-14s26 4 26 14-14 14-26 14-26-4-26-14z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.3"/><path d="M48 56l6 12 6-8 6 10" fill="none" stroke="${P.inkM}" stroke-width="1.8"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g><rect x="44" y="54" width="32" height="18" rx="3" fill="${P.white}" stroke="${P.line}" stroke-width="2"/><path d="M50 62h20" stroke="${P.lineM}" stroke-width="1.6"/></g>`
      : `<g><rect x="42" y="52" width="36" height="22" rx="2" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.4"/><path d="M48 60h24M48 68h16" stroke="${P.inkM}" stroke-width="2.5"/></g>`,
  (s, P) =>
    s === 'n'
      ? `<g stroke-linecap="round"><path d="M40 60h40v14H40z" fill="${P.cream2}" stroke="${P.line}" stroke-width="2"/><path d="M44 52h32v8H44z" fill="${P.lineM}" stroke="none"/></g>`
      : `<g stroke-linecap="round"><path d="M38 62h44v14H38z" fill="${P.fillM}" stroke="${P.ink}" stroke-width="2.5"/><path d="M42 54h36v6H42z" fill="${P.inkM}" stroke="none"/></g>`,
]
