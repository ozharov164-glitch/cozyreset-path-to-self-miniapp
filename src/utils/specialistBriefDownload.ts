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

function isTelegramWebApp(): boolean {
  return typeof window.Telegram?.WebApp !== 'undefined'
}

/** Скачивание через <a download> (вне Telegram; в TG blob:-ссылки дают диалог «Перейти по ссылке»). */
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
  /** Публичный HTTPS URL: второй GET после предпросмотра — для Telegram.downloadFile / openLink / повторного fetch */
  httpsDownloadUrl?: string | null
}

/**
 * Кроссплатформенное сохранение PDF.
 * В Telegram не вызываем window.open(blob:) и не кликаем по blob:-якорю — только HTTPS или запись с диска через picker.
 */
export async function downloadPdfCrossPlatform(
  blob: Blob,
  fileName: string,
  options?: DownloadPdfOptions,
): Promise<void> {
  const safeName = ensurePdfFileName(fileName)
  const httpsUrl = (options?.httpsDownloadUrl || '').trim()
  const tg = window.Telegram?.WebApp
  const inTg = isTelegramWebApp()

  // 1) Bot API 8.0+: нативное скачивание по HTTPS
  if (httpsUrl && tg && typeof tg.downloadFile === 'function' && tg.isVersionAtLeast?.('8.0')) {
    try {
      await new Promise<void>((resolve, reject) => {
        tg.downloadFile!({ url: httpsUrl, file_name: safeName }, (accepted) => {
          if (accepted) resolve()
          else reject(new Error('tg-download-declined'))
        })
      })
      return
    } catch {
      // отмена / ошибка — ниже
    }
  }

  // 2) Telegram: системное открытие ссылки (часто внешний браузер с нормальной загрузкой)
  if (httpsUrl && tg && typeof tg.openLink === 'function') {
    tg.openLink(httpsUrl)
    return
  }

  // 3) Обычный браузер / запасной путь: новая вкладка по HTTPS
  if (httpsUrl) {
    const opened = window.open(httpsUrl, '_blank', 'noopener,noreferrer')
    if (opened) return
  }

  // 4) Второй GET в том же контексте (CORS уже прошёл при предпросмотре) — свежий blob без нового blob:-URL для навигации
  let outBlob = blob
  if (httpsUrl) {
    try {
      const res = await fetch(httpsUrl, { method: 'GET', cache: 'no-store' })
      if (res.ok) outBlob = await res.blob()
    } catch {
      /* оставляем preview blob */
    }
  }

  // 5) Chromium: «Сохранить как» (Telegram Desktop WebView2 часто поддерживает)
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
      await writable.write(await outBlob.arrayBuffer())
      await writable.close()
      return
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return
    }
  }

  const nav = navigator as Navigator & { msSaveOrOpenBlob?: (b: Blob, name?: string) => boolean }
  if (typeof nav.msSaveOrOpenBlob === 'function') {
    const ok = nav.msSaveOrOpenBlob(new Blob([outBlob], { type: 'application/octet-stream' }), safeName)
    if (ok) return
  }

  // 6) Якорь / blob-вкладка только вне Telegram
  if (!inTg) {
    if (tryAnchorDownload(outBlob, safeName, 'application/octet-stream')) return
    if (tryAnchorDownload(outBlob, safeName, 'application/pdf')) return
    const pdfUrl = URL.createObjectURL(new Blob([outBlob], { type: 'application/pdf' }))
    const openedPdf = window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 180_000)
    if (openedPdf) {
      tgAlert('Если загрузка не началась: в новой вкладке нажми Ctrl+S (ПК) или «Сохранить» в меню браузера.')
      return
    }
    if (httpsUrl) {
      window.open(httpsUrl, '_blank', 'noopener,noreferrer')
      return
    }
  }

  tgAlert(
    'Не удалось сохранить файл из окна Telegram. Открой мини-приложение в браузере (⋮ → «Открыть в…») или скачай с телефона.',
  )
}

/** @deprecated используй downloadPdfCrossPlatform */
export function forceDownloadPdfBlob(blob: Blob, fileName: string): void {
  void downloadPdfCrossPlatform(blob, fileName)
}

/** Первый GET по одноразовой ссылке для предпросмотра (на сервере разрешён второй GET на скачивание). */
export async function fetchSpecialistPdfOnce(downloadUrl: string): Promise<Blob> {
  const res = await fetch(downloadUrl, { method: 'GET', cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`pdf ${res.status}`)
  }
  return res.blob()
}
