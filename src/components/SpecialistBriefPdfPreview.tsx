import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

type Props = {
  file: Blob
}

/** Полный предпросмотр: все страницы подряд, прокрутка как у длинного документа. */
export function SpecialistBriefPdfPreview({ file }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pageWidth, setPageWidth] = useState(340)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const measure = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const w = el.clientWidth
    if (w > 0) setPageWidth(Math.min(440, Math.max(260, w - 4)))
  }, [])

  useLayoutEffect(() => {
    measure()
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <Document
        file={file}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n)
          setLoadError(null)
        }}
        onLoadError={() => setLoadError('Не удалось открыть предпросмотр. Скачай PDF кнопкой ниже.')}
        loading={
          <p className="text-sm text-center py-10 text-[var(--color-text-secondary)]">Открываем документ…</p>
        }
      >
        {numPages !== null &&
          Array.from({ length: numPages }, (_, i) => (
            <div
              key={i + 1}
              className="mb-3 rounded-xl overflow-hidden bg-white shadow-[0_4px_24px_-4px_rgba(80,60,120,0.15)] border border-[var(--color-lavender)]/25"
            >
              <Page
                pageNumber={i + 1}
                width={pageWidth}
                renderTextLayer
                renderAnnotationLayer
                className="!bg-white"
              />
            </div>
          ))}
      </Document>
      {loadError && <p className="text-sm text-red-700/90 text-center px-2 py-2">{loadError}</p>}
    </div>
  )
}
