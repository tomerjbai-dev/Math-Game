// Simple inline SVG icons for the bottom navigation (no external icon service)
type IconProps = { size?: number }

export function HomeIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TimesIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function InfoIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

export function TrophyIcon({ size = 96 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M20 10h24v14c0 6.6-5.4 12-12 12s-12-5.4-12-12V10Z"
        fill="var(--color-accent)"
        stroke="#b45309"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 15h-7c0 7 3.5 11 8.5 12M44 15h7c0 7-3.5 11-8.5 12"
        stroke="#b45309"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M32 36v10" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      <rect x="21" y="46" width="22" height="8" rx="3" fill="var(--color-accent)" stroke="#b45309" strokeWidth="2.5" />
      <path d="m32 16 2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L32 16Z" fill="#fff" />
    </svg>
  )
}

export function LostIcon({ size = 96 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" fill="var(--color-error)" stroke="var(--color-error-text)" strokeWidth="2.5" />
      <path d="M22 22l20 20M42 22 22 42" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
