import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/** Ловит падение React (иначе в Telegram Mini App часто просто чёрный экран). */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[PTS] AppErrorBoundary', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center bg-[#ede6f8]">
          <p className="font-display text-lg font-bold text-[var(--color-text-primary)] mb-2">
            Не удалось загрузить приложение
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm">
            Обнови страницу или закрой мини-приложение и открой снова из бота. Если повторяется — напиши в поддержку.
          </p>
          <button
            type="button"
            className="py-3 px-6 rounded-xl btn-primary font-semibold"
            onClick={() => window.location.reload()}
          >
            Обновить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
