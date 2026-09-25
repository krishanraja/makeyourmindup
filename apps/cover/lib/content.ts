import site from '@/content/site.json'
import config from '@/content/config.json'

export type Site = typeof site
export type Subchannel = Site['subchannels'][number]

export type Call = {
  statement: string
  due: string
  confidence: number
  status: 'held' | 'broke' | 'unclear' | 'open'
  href?: string
}

export type PlatformKey = 'youtube' | 'instagram' | 'tiktok' | 'spotify'

export const SITE = site
type Config = Omit<typeof config, 'scoreboard' | 'platforms'> & {
  scoreboard: { show: boolean; calls: Call[] }
  platforms: Record<PlatformKey, string | null>
}
export const CONFIG = config as unknown as Config

/** Substack's subscribe page accepts ?email= and prefills the field. */
export function subscribeUrl(email?: string) {
  const base = `${CONFIG.substackUrl}/subscribe`
  return email ? `${base}?email=${encodeURIComponent(email)}` : base
}

/** One colour per subchannel, and nothing else uses these. */
// Class names are written out in full so Tailwind can see them.
export const ACCENT: Record<string, { bg: string; text: string; hoverText: string; hex: string }> = {
  mind_the_gap: { bg: 'bg-coral', text: 'text-coral', hoverText: 'group-hover:text-coral', hex: '#FF6A4D' },
  follow_the_money: { bg: 'bg-butter', text: 'text-butter', hoverText: 'group-hover:text-butter', hex: '#FFD84D' },
  under_the_hood: { bg: 'bg-lilac', text: 'text-lilac', hoverText: 'group-hover:text-lilac', hex: '#B7A6FF' },
}
