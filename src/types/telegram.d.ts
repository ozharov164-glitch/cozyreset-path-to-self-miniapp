export interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser
  auth_date?: number
  hash?: string
}

export interface TelegramDownloadFileParams {
  url: string
  file_name: string
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: TelegramWebAppInitDataUnsafe
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  ready: () => void
  expand: () => void
  close: () => void
  openTelegramLink: (url: string) => void
  showAlert: (message: string) => void
  /** Bot API 8.0+ — нативное скачивание по публичному HTTPS URL */
  downloadFile?: (params: TelegramDownloadFileParams, callback?: (accepted: boolean) => void) => void
  isVersionAtLeast?: (version: string) => boolean
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}
