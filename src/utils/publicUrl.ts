/** Путь к файлам из `public/` с учётом `import.meta.env.BASE_URL` (GitHub Pages). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base.replace(/\/$/, '')}${normalized}`
}
