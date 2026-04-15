import { PremiumCard } from '../PremiumCard'
import neuroArenaInfo from '../../data/neuroArenaInfo.json'

type Section = {
  id: string
  kicker: string
  title: string
  body: string[]
}

const data = neuroArenaInfo as {
  title: string
  intro: string
  sections: Section[]
}

export function NeuroArenaInfoPanel() {
  return (
    <PremiumCard accent="slate" delay={0.025}>
      <h3 className="font-display text-base font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
        {data.title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">{data.intro}</p>
      <div className="space-y-2">
        {data.sections.map((s) => (
          <details
            key={s.id}
            className="group rounded-xl border border-white/40 bg-white/22 px-3 py-2.5 open:bg-white/32 open:border-white/50 transition-[background-color,border-color,box-shadow] duration-300 ease-out shadow-sm open:shadow-[0_8px_28px_rgba(45,62,46,0.08)]"
          >
            <summary className="cursor-pointer list-none flex flex-col gap-0.5 [&::-webkit-details-marker]:hidden">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                {s.kicker}
              </span>
              <span className="font-display text-sm font-semibold text-[var(--color-text-primary)] pr-6 relative">
                {s.title}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] text-lg leading-none group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </span>
            </summary>
            <div className="mt-3 space-y-2.5 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-white/25 pt-3">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </PremiumCard>
  )
}
