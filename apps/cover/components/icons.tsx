// Simple drawn marks for each platform. Not the official logos; they only
// need to say which screen is which.
type P = { className?: string }

export function SubstackIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M4 3h16v2.6H4zM4 7.4h16V10H4zM4 11.8h16V22l-8-4.4L4 22z" />
    </svg>
  )
}
export function YouTubeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M22 7.2c-.2-1.4-1.3-2.4-2.7-2.6C17.2 4.3 12 4.3 12 4.3s-5.2 0-7.3.3C3.3 4.8 2.2 5.8 2 7.2 1.7 8.8 1.7 12 1.7 12s0 3.2.3 4.8c.2 1.4 1.3 2.4 2.7 2.6 2.1.3 7.3.3 7.3.3s5.2 0 7.3-.3c1.4-.2 2.5-1.2 2.7-2.6.3-1.6.3-4.8.3-4.8s0-3.2-.3-4.8zM10 15.4V8.6l5.9 3.4z" />
    </svg>
  )
}
export function InstagramIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
export function TikTokIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.6 2h-3.4v13.3a3 3 0 1 1-3-3c.3 0 .6 0 .9.1V8.9a6.4 6.4 0 1 0 5.5 6.4V8.6a8 8 0 0 0 4.7 1.5V6.7a4.8 4.8 0 0 1-4.7-4.7z" />
    </svg>
  )
}
export function SpotifyIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" fill="currentColor" />
      <g fill="none" stroke="var(--icon-bg, #F4EFE4)" strokeLinecap="round">
        <path d="M6.5 9.3c3.8-1.2 8-.9 11.2 1" strokeWidth="2" />
        <path d="M7.2 12.6c3.1-.9 6.4-.6 9 .9" strokeWidth="1.7" />
        <path d="M7.9 15.6c2.4-.6 4.8-.4 6.8.7" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

export const PLATFORM_ICON = {
  substack: SubstackIcon,
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  spotify: SpotifyIcon,
} as const
