import { useReducedMotion } from 'framer-motion'

type Props = {
  /** Разделитель сверху — внутри карточки «Что дальше?» */
  withTopDivider?: boolean
}

/** Компактная премиум-загрузка: маленький спиннер + тонкий индикатор. Исчезновение — через AnimatePresence в Result. */
export function ResultPremiumAiLoading({ withTopDivider = false }: Props) {
  const reduceMotion = useReducedMotion()
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Готовим фразы для чата"
      className={withTopDivider ? 'mt-4 pt-4 border-t border-[rgba(125,211,192,0.28)]' : ''}
    >
      <div className="flex items-center gap-3 min-h-[44px]">
        <div
          className={`pts-ai-mini-spinner shrink-0 ${reduceMotion ? 'pts-ai-mini-spinner--still' : ''}`}
          aria-hidden
        />
        <span className="text-xs leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
          Готовим фразы для чата…
        </span>
      </div>
      <div className="pts-ai-mini-track mt-3 h-[3px] rounded-full overflow-hidden">
        <div className={`pts-ai-mini-gleam ${reduceMotion ? 'pts-ai-mini-gleam--still' : ''}`} />
      </div>
    </div>
  )
}
