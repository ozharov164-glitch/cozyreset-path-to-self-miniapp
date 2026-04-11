import { useReducedMotion } from 'framer-motion'

/** Плейсхолдер, пока бэкенд генерирует темы для чата с ИИ-поддержкой. */
export function AiSuggestionsLoading({ compact = false }: { compact?: boolean }) {
  const reduceMotion = useReducedMotion()
  const lines = [0, 1, 2, 3]
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-glow-teal)' }}>
        Подбираем персональные фразы…
      </p>
      <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
        {lines.map((i) => (
          <li key={i} className="flex gap-2 items-center">
            <span className="text-[var(--color-glow-teal)] shrink-0 opacity-35" aria-hidden>
              •
            </span>
            <div
              className={`pts-ai-suggestions-skeleton-line flex-1 rounded-lg ${compact ? 'min-h-[36px]' : 'min-h-[40px]'}`}
              style={
                reduceMotion
                  ? { opacity: 0.6, animation: 'none' }
                  : { animationDelay: `${i * 0.16}s` }
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
