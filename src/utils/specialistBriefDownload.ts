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

export type DownloadPdfOptions = {
  /** Публичный HTTPS URL второго GET (после предпросмотра) — для Telegram.downloadFile / openLink */
  httpsDownloadUrl?: string | null
}

function isInsideTelegramWebApp(): boolean {
  return typeof window.Telegram?.WebApp !== 'undefined'
}

/**
 * Кроссплатформенное сохранение PDF: в Telegram — нативное скачивание или открытие HTTPS; иначе «Сохранить как», якорь.
 * Не использует window.open(blob:) внутри Telegram (диалог «Перейти по ссылке» и пустой результат).
 */
export async function downloadPdfCrossPlatform(
  blob: Blob,
  fileName: string,
  options?: DownloadPdfOptions,
): Promise<void> {
  const safeName = ensurePdfFileName(fileName)
  const httpsUrl = (options?.httpsDownloadUrl || '').trim()
  const tg = window.Telegram?.WebApp
  const inTg = isInsideTelegramWebApp()

  // 1) Telegram: Bot API 8.0+ — нативная загрузка по HTTPS (без blob)
  if (httpsUrl && inTg && tg && typeof tg.downloadFile === 'function' && tg.isVersionAtLeast?.('8.0')) {
    try {
      await new Promise<void>((resolve, reject) => {
        tg.downloadFile!({ url: httpsUrl, file_name: safeName }, (accepted) => {
          if (accepted) resolve()
          else reject(new Error('tg-download-declined'))
        })
      })
      return
    } catch {
      // отмена или ошибка — openLink или blob
    }
  }

  // 2) Telegram Desktop / macOS: внешний браузер по той же ссылке (второй GET — файл ещё на сервере)
  if (httpsUrl && inTg && tg && typeof tg.openLink === 'function') {
    tg.openLink(httpsUrl)
    return
  }

  // 3) Chrome / Edge: системный диалог «Сохранить как»
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

  // 4) Старый Edge / IE-режим
  const nav = navigator as Navigator & { msSaveOrOpenBlob?: (b: Blob, name?: string) => boolean }
  if (typeof nav.msSaveOrOpenBlob === 'function') {
    const ok = nav.msSaveOrOpenBlob(new Blob([blob], { type: 'application/octet-stream' }), safeName)
    if (ok) return
  }

  // 5) Якорь: сначала «файл», затем явный PDF
  if (tryAnchorDownload(blob, safeName, 'application/octet-stream')) return
  if (tryAnchorDownload(blob, safeName, 'application/pdf')) return

  // 6) Вне Telegram: новая вкладка с blob (в TG это даёт бесполезный диалог про blob:)
  if (!inTg) {
    const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    const opened = window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 180_000)
    if (opened) {
      tgAlert('Если загрузка не началась: в новой вкладке нажми Ctrl+S (ПК) или «Сохранить» в меню браузера.')
      return
    }
  }

  if (httpsUrl && !inTg) {
    window.open(httpsUrl, '_blank', 'noopener,noreferrer')
    return
  }

  tgAlert(
    'Не удалось сохранить PDF из этого окна. Обнови Telegram до последней версии или открой мини-приложение в браузере.',
  )
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
