// Builds the panel's portraits and the row of tiny heads in the staff box.
// Deterministic: same input, same outputs. Run with `npm run assets`.
//
// public/panel/<id>.webp  one square portrait per card, onto the page ink
// public/panel/heads.webp the ten judges' heads in one strip, for the staff box
//
// Each portrait comes from brand/panel/<id>-source.webp. Until a judge has its
// own photo, the standing robot stands in, so the cards can be judged on copy
// and layout before any image is generated. The Chair is not a judge and is
// left out of the heads.
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import sharp from 'sharp'
import { INK, STANDING, squareOnInk } from './photo-cut.mjs'

const OUT = 'public/panel'
const PORTRAIT = 600
const HEAD = 64
mkdirSync(OUT, { recursive: true })

const { cards } = JSON.parse(readFileSync('content/site.json', 'utf8')).panel

// Where the portrait and the head sit, in source pixels. A judge's own photo is
// shot square, head and shoulders, so its head is the middle of its top half.
const STAND_IN = { src: STANDING.src, portrait: { left: 330, top: 0, width: 700, height: 700 }, head: { left: 583, top: 15, width: 220, height: 220 } }
async function framing(id) {
  const src = `brand/panel/${id}-source.webp`
  if (!existsSync(src)) return { ...STAND_IN, standIn: true }
  const { width, height } = await sharp(src).metadata()
  const side = Math.min(width, height)
  const left = Math.round((width - side) / 2)
  return {
    src,
    portrait: { left, top: 0, width: side, height: side },
    head: { left: left + Math.round(side * 0.25), top: Math.round(side * 0.04), width: Math.round(side * 0.5), height: Math.round(side * 0.5) },
    standIn: false,
  }
}

const heads = []
for (const card of cards) {
  const f = await framing(card.id)
  await squareOnInk(f.src, f.portrait, PORTRAIT, `${OUT}/${card.id}.webp`)
  if (card.stamp !== 'chair') heads.push(await sharp(f.src).extract(f.head).resize(HEAD, HEAD).toBuffer())
  console.log('panel', card.id, f.standIn ? 'stand-in' : 'own photo')
}

await sharp({ create: { width: HEAD * heads.length, height: HEAD, channels: 3, background: INK } })
  .composite(heads.map((input, i) => ({ input, left: i * HEAD, top: 0 })))
  .webp({ quality: 82 })
  .toFile(`${OUT}/heads.webp`)
console.log('heads', heads.length)
