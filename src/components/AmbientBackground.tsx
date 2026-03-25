/**
 * Декоративный фон «Путь к Себе»: лаванда + мягкие световые пятна (только CSS, без WebGL).
 */
export function AmbientBackground() {
  return (
    <div className="pts-ambient fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <div className="pts-ambient__base" />
      <div className="pts-ambient__orb pts-ambient__orb--rose" />
      <div className="pts-ambient__orb pts-ambient__orb--teal" />
      <div className="pts-ambient__orb pts-ambient__orb--cream" />
      <div className="pts-ambient__veil" />
    </div>
  )
}
