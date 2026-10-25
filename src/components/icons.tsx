// Simple inline SVG icons inspired by the Style Guide (no external icon service)
type IconProps = { size?: number }
type NavIconProps = IconProps & { filled?: boolean }

export function HomeIcon({ size = 26, filled = false }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {filled && <path d="M10.5 20v-5.5h3V20" fill="#fff" />}
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

export function InfoIcon({ size = 26, filled = false }: NavIconProps) {
  const mark = filled ? '#fff' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v6" stroke={mark} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.3" fill={mark} />
    </svg>
  )
}

export function StarIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m12 2.8 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8L12 2.8Z"
        fill="var(--color-highlight)"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlayIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5v15l12-7.5-12-7.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function RestartIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12a7 7 0 1 1-2.05-4.95M19 4.5v3.5h-3.5"
        stroke="var(--color-secondary)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TrophyIcon({ size = 96 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <TrophyPaths />
    </svg>
  )
}

// Trophy with short light rays and stars for the win state (mockups)
export function TrophyCelebration({ size = 132 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g stroke="var(--color-highlight)" strokeWidth="3" strokeLinecap="round">
        <path d="M14 30l8 5M86 30l-8 5M24 12l5 8M76 12l-5 8M50 4v8" />
      </g>
      <path d="m12 62 1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L12 62Z" fill="#a78bfa" />
      <path d="m88 56 1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6L88 56Z" fill="#a78bfa" />
      <g transform="translate(18 18)">
        <TrophyPaths />
      </g>
    </svg>
  )
}

function TrophyPaths() {
  return (
    <>
      <path
        d="M20 10h24v14c0 6.6-5.4 12-12 12s-12-5.4-12-12V10Z"
        fill="var(--color-accent)"
        stroke="#b45309"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 15h-7c0 7 3.5 11 8.5 12M44 15h7c0 7-3.5 11-8.5 12" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 36v10" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      <rect x="21" y="46" width="22" height="8" rx="3" fill="var(--color-accent)" stroke="#b45309" strokeWidth="2.5" />
      <path d="m32 16 2.4 4.8 5.3.8-3.8 3.7.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.8-3.7 5.3-.8L32 16Z" fill="#fff" />
    </>
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
