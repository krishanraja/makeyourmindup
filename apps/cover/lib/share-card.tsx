import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp, { type OverlayOptions } from 'sharp'
import type { HubImage } from './hub'
import type { Story } from './edition'
import { desks } from './desks'

const ink = '#0C1512', cream = '#F4EFE4', mint = '#7EF0C0'
export const strapline = 'Creativity, AI and money, simplified.'
const publicDir = path.join(process.cwd(), 'public')
const fontDir = path.join(process.cwd(), 'app', 'fonts')
const faces = {
  headline: ['Fraunces Black', 'Fraunces-Upright-Variable.ttf'],
  italic: ['Fraunces Bold Italic', 'Fraunces-Italic-Variable.ttf'],
  label: ['DM Mono', 'DMMono-Regular.ttf'],
} as const

export type Card = { label: string; title: string; headline?: string; dek?: string; photo?: HubImage | null }
export function storyCard(story: Story, title: string, label = 'The Edition / ' + desks[story.item.subsector].label): Card {
  return { label, title, headline: story.item.headline, dek: story.item.dek, photo: story.art || story.portrait }
}

function lettering(value: string, face: keyof typeof faces, size: number, width: number, colour = cream) {
  const [family, file] = faces[face]
  const text = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return sharp({ text: {
    text: '<span foreground="' + colour + '">' + text + '</span>',
    font: family + ' ' + size, fontfile: path.join(fontDir, file),
    dpi: 72, rgba: true, width, wrap: 'word', spacing: face === 'headline' ? -Math.round(size * 0.13) : 0,
  } }).png().toBuffer({ resolveWithObject: true })
}

async function fittedTitle(card: Card, width: number) {
  for (const text of new Set([card.headline, card.dek, card.title])) {
    if (!text?.trim() || text.length > 1400) continue
    for (const size of [58, 54, 50, 46, 42, 38, 34]) {
      const line = await lettering(text, 'headline', size, width)
      if (line.info.height <= 270 && line.info.width <= width) return line.data
    }
  }
  throw Error('Share card needs a page title that fits')
}

async function photoLayers(photo?: HubImage | null): Promise<OverlayOptions[]> {
  if (!photo) return []
  try {
    let bytes: Buffer
    if (/^\/hub\/(?:people\/)?[\w-]+\.jpg$/.test(photo.url)) {
      bytes = await readFile(path.join(publicDir, photo.url))
    } else {
      const url = new URL(photo.url)
      if (url.origin !== 'https://upload.wikimedia.org' || url.username || url.password ||
          !url.pathname.startsWith('/wikipedia/commons/') || !photo.credit) return []
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(4500) })
      if (!response.ok) return []
      bytes = Buffer.from(await response.arrayBuffer())
    }
    const image = await sharp(bytes).rotate().resize(560, 526, { fit: 'cover' })
      .modulate({ brightness: 0.89 }).png().toBuffer()
    const layers: OverlayOptions[] = [{ input: image, left: 640, top: 104 }]
    if (photo.credit) {
      const credit = await lettering(photo.credit, 'label', 13, 528)
      if (credit.info.height > 100 || credit.info.width > 528) return []
      layers.push({
        input: { create: { width: 560, height: credit.info.height + 16, channels: 4, background: ink } },
        left: 640, top: 630 - credit.info.height - 16,
      }, { input: credit.data, left: 654, top: 622 - credit.info.height })
    }
    return layers
  } catch {
    // A missing or unreadable photograph still leaves a complete typographic card.
    return []
  }
}

export async function shareCard(card: Card | null, ttl = 900) {
  const [logo, photo, motto] = await Promise.all([
    sharp(path.join(publicDir, 'hub', 'wordmark.svg'), { density: 144 }).resize(486).png().toBuffer(),
    photoLayers(card?.photo),
    lettering(strapline, 'italic', card ? 29 : 48, card ? 579 : 1100),
  ])
  const layers: OverlayOptions[] = [
    { input: logo, left: 42, top: 27 },
    { input: { create: { width: 1200, height: 1, channels: 4, background: '#385044' } }, left: 0, top: 103 },
    ...photo,
  ]
  if (card) {
    const width = photo.length ? 556 : 1100
    const [label, title] = await Promise.all([
      lettering(card.label.toUpperCase().replace(' / ', '   /   '), 'label', 20, width, mint),
      fittedTitle(card, width),
    ])
    layers.push({ input: label.data, left: 42, top: 164 }, { input: title, left: 42, top: 245 })
  }
  layers.push({ input: motto.data, left: 42, top: 584 - motto.info.height })
  const png = await sharp({ create: { width: 1200, height: 630, channels: 3, background: ink } })
    .composite(layers).png().toBuffer()
  return new Response(new Uint8Array(png), { headers: {
    'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=' + ttl,
  } })
}
