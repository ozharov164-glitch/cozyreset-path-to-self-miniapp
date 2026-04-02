/** Скачивание PDF с устройства (blob — надёжно при одноразовой ссылке с сервера). */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'k-specialistu-cozyreset.pdf'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch {
    tg?.showAlert?.('Не удалось сохранить файл. Попробуй ещё раз.')
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 90_000)
}

/** Один GET по одноразовой ссылке — дальше только blob (предпросмотр + скачивание). */
export async function fetchSpecialistPdfOnce(downloadUrl: string): Promise<Blob> {
  const res = await fetch(downloadUrl, { method: 'GET', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`pdf ${res.status}`)
  }
  return res.blob()
}
