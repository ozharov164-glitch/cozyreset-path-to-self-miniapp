/**
 * Закрыть Mini App и вернуться в чат с ботом.
 * В Telegram WebView вызывается WebApp.close(); вне Telegram (браузер) — открывается ссылка на бота.
 */
const BOT_LINK = 'https://t.me/CozyReset_bot'

/** Скопировать текст в буфер и показать уведомление (Telegram showAlert или fallback). */
export function copyQuestionToClipboard(text: string): void {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => {
        const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
        if (tg?.showAlert) tg.showAlert('Скопировано')
      },
      () => {}
    )
  }
}

export function goBackToBot(): void {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  if (tg?.close) {
    tg.close()
    return
  }
  // Вне Telegram (например, открыто в браузере) — открыть бота в новой вкладке
  if (typeof window !== 'undefined' && window.open) {
    window.open(BOT_LINK, '_blank', 'noopener,noreferrer')
  }
}
