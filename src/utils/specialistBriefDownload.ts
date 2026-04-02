declare global {
  interface Window {
    showSaveFilePicker?(options: {
      suggestedName?: string
      types?: { description: string; accept: Record<string, string[]> }[]
    }): Promise<{
      createWritable(): Promise<{
        write(data: BufferSource): Promise<void>
        close(): Promise<void>
      }>
    }>
  }
}

function ensurePdfFileName(fileName: string): string {
  const n = (fileName || 'k-specialistu-cozyreset.pdf').trim()
  return n.toLowerCase().endsWith('.pdf') ? n : `${n}.pdf`
}

function tgAlert(message: string): void {
  try {
    window.Telegram?.WebApp?.showAlert?.(message)
  } catch {
    window.alert?.(message)
  }
}

/** Скачивание через <a download> с запасным MIME и длинным revoke (ПК иногда медленнее). */
function tryAnchorDownload(blob: Blob, safeName: string, mime: string): boolean {
  const b = new Blob([blob], { type: mime })
  const url = URL.createObjectURL(b)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = safeName
    a.setAttribute('download', safeName)
    a.rel = 'noopener'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    window.setTimeout(() => {
      a.remove()
      URL.revokeObjectURL(url)
    }, 4500)
    return true
  } catch {
    URL.revokeObjectURL(url)
    return false
  }
}

/**
 * Кроссплатформенное сохранение PDF: Chromium «Сохранить как», legacy Edge, якорь, новая вкладка.
 * Работает из жеста пользователя (кнопка); на ПК в Telegram Desktop предпочтителен File System Access API.
 */
export async function downloadPdfCrossPlatform(blob: Blob, fileName: string): Promise<void> {
  const safeName = ensurePdfFileName(fileName)

  // 1) Chrome / Edge / Telegram Desktop (WebView2): системный диалог «Сохранить как»
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: safeName,
        types: [
          {
            description: 'PDF',
            accept: { 'application/pdf': ['.pdf'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(await blob.arrayBuffer())
      await writable.close()
      return
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
    }
  }

  // 2) Старый Edge / IE-режим
  const nav = navigator as Navigator & { msSaveOrOpenBlob?: (b: Blob, name?: string) => boolean }
  if (typeof nav.msSaveOrOpenBlob === 'function') {
    const ok = nav.msSaveOrOpenBlob(new Blob([blob], { type: 'application/octet-stream' }), safeName)
    if (ok) return
  }

  // 3) Универсальный якорь: сначала «файл», затем явный PDF
  if (tryAnchorDownload(blob, safeName, 'application/octet-stream')) return
  if (tryAnchorDownload(blob, safeName, 'application/pdf')) return

  // 4) Новая вкладка — пользователь сохраняет через Ctrl+S / меню (часть десктопов блокирует download)
  const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const opened = window.open(pdfUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 180_000)
  if (opened) {
    tgAlert('Если загрузка не началась: в новой вкладке нажми Ctrl+S (ПК) или «Сохранить» в меню браузера.')
    return
  }

  tgAlert('Не удалось сохранить PDF. Открой мини-приложение во внешнем браузере или с телефона.')
}

/** @deprecated используй downloadPdfCrossPlatform */
export function forceDownloadPdfBlob(blob: Blob, fileName: string): void {
  void downloadPdfCrossPlatform(blob, fileName)
}

/** Один GET по одноразовой ссылке — дальше только blob (предпросмотр + скачивание). */
export async function fetchSpecialistPdfOnce(downloadUrl: string): Promise<Blob> {
  const res = await fetch(downloadUrl, { method: 'GET', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`pdf ${res.status}`)
  }
  return res.blob()
}
