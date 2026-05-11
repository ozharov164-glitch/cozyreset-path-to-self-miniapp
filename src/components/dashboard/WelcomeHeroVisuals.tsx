const assetBase = import.meta.env.BASE_URL

const fingerprintBadgeSrc = `${assetBase}dashboard-fingerprint-badge.png`
const pathJourneyArtSrc = `${assetBase}dashboard-path-journey.png`

export function WelcomeFingerprintBadge() {
  return (
    <img
      src={fingerprintBadgeSrc}
      alt=""
      className="pts-welcome-fingerprint"
      width={32}
      height={32}
      decoding="async"
    />
  )
}

export function WelcomePathJourneyArt() {
  return (
    <img
      src={pathJourneyArtSrc}
      alt=""
      className="pts-welcome-hero__art"
      width={120}
      height={120}
      decoding="async"
    />
  )
}
