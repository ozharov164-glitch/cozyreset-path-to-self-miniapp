/** Принудительное скачивание файла (как «Сохранить»), а не открытие во встроенном просмотрщике. */
export function forceDownloadPdfBlob(blob: Blob, fileName: string): void {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
  const name = (fileName || 'k-specialistu-cozyreset.pdf').trim()
  const safeName = name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`

  const octet = new Blob([blob], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(octet)

  try {
    const a = document.createElement('a')
    a.href = url
    a.download = safeName
    a.setAttribute('download', safeName)
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    requestAnimationFrame(() => {
      a.remove()
      URL.revokeObjectURL(url)
    })
  } catch {
    URL.revokeObjectURL(url)
    tg?.showAlert?.('Не удалось начать скачивание. Попробуй ещё раз или открой из «Файлов».')
  }
}

/** Один GET по одноразовой ссылке — дальше только blob (предпросмотр + скачивание). */
export async function fetchSpecialistPdfOnce(downloadUrl: string): Promise<Blob> {
  const res = await fetch(downloadUrl, { method: 'GET', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`pdf ${res.status}`)
  }
  return res.blob()
}
