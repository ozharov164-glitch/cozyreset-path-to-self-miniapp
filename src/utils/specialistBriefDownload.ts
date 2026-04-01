/** Скачивание PDF: Telegram.downloadFile (Bot API 8.0+) или blob fallback. */
export function downloadSpecialistPdf(downloadUrl: string, fileName: string): void {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  if (tg?.downloadFile) {
    try {
      tg.downloadFile({ url: downloadUrl, file_name: fileName })
      return
    } catch {
      // fallback ниже
    }
  }
  void fetch(downloadUrl, { method: 'GET' })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status))
      return res.blob()
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'k-specialistu.pdf'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    })
    .catch(() => {
      tg?.showAlert?.('Не удалось скачать файл. Открой ссылку в браузере или попробуй позже.')
    })
}
