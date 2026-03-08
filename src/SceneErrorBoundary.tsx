import { Component, type ReactNode } from 'react'

/** Фон как в сцене (#c9b8e8 + градиент), если WebGL/Canvas упал (например в Telegram WebView). */
const FALLBACK_BG = (
  <div
    className="absolute inset-0"
    style={{
      background: 'linear-gradient(180deg, #c9b8e8 0%, #b8a8d8 50%, #a898c8 100%)',
    }}
    aria-hidden
  />
)

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Ловит падения WebGL/Canvas в Telegram WebView и показывает статичный фон,
 * чтобы интерфейс (Dashboard и т.д.) оставался видимым.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[SceneErrorBoundary] WebGL/Canvas error, using fallback background:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? FALLBACK_BG
    }
    return this.props.children
  }
}
