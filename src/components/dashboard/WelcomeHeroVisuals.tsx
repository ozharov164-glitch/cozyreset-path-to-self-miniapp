import fingerprintBadge from '../../assets/dashboard/fingerprint-badge.webp'
import pathJourneyArt from '../../assets/dashboard/path-journey.webp'

export function WelcomeFingerprintBadge() {
  return (
    <img
      src={fingerprintBadge}
      alt=""
      className="pts-welcome-fingerprint"
      width={36}
      height={36}
      decoding="async"
      loading="eager"
      fetchPriority="high"
    />
  )
}

export function WelcomePathJourneyArt() {
  return (
    <img
      src={pathJourneyArt}
      alt=""
      className="pts-welcome-hero__art"
      width={140}
      height={140}
      decoding="async"
      loading="eager"
    />
  )
}
