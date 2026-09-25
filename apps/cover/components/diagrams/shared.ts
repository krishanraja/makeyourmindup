export const C = {
  ink: '#0C1512',
  cream: '#F4EFE4',
  mint: '#7EF0C0',
  coral: '#FF6A4D',
  butter: '#FFD84D',
  lilac: '#B7A6FF',
}

export const MONO = { fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }
export const SANS = { fontFamily: 'var(--font-archivo), system-ui, sans-serif', fontWeight: 800 }
export const DISPLAY = { fontFamily: 'var(--font-anton), sans-serif', textTransform: 'uppercase' as const }

type Pt = [number, number]

/** A point on a cubic Bezier, so dots sit exactly on their thread. */
export function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}
