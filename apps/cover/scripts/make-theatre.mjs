// Builds the cover's operating-theatre photo from brand/theatre-source.webp.
// Deterministic: same input, same outputs. Run with `npm run assets`.
//
// public/cover/theatre.webp  the photo cut at the table's edge, its backdrop
//                            lightened onto the page ink so no edge shows
// public/cover/threads.png   the three threads below that cut, on
//                            transparency, so they hang into the headline
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SRC = 'brand/theatre-source.webp'
const OUT = 'public/cover'
const W = 2000
const CUT = 550 // the table's edge, in source pixels
const INK = { r: 12, g: 21, b: 18 }
mkdirSync(OUT, { recursive: true })

// 1. The photo above the table's edge, lightened onto ink.
const top = await sharp(SRC).extract({ left: 0, top: 0, width: W, height: CUT }).toBuffer()
await sharp({ create: { width: W, height: CUT, channels: 3, background: INK } })
  .composite([{ input: top, blend: 'lighten' }])
  .webp({ quality: 90 })
  .toFile(`${OUT}/theatre.webp`)

// 2. The threads below the cut. The drape is teal (red below green) and every
// thread is lilac, butter or coral (red above green, or blue well above green),
// so that difference becomes the alpha channel.
const box = { left: 1080, top: CUT - 8, width: 175, height: 662 - (CUT - 8) }
const { data, info } = await sharp(SRC).extract(box).raw().toBuffer({ resolveWithObject: true })
const out = Buffer.alloc(info.width * info.height * 4)
for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
  const a = Math.max(0, Math.min(1, Math.max((r - g - 4) / 16, (b - g - 12) / 16)))
  out[j] = r
  out[j + 1] = g
  out[j + 2] = b
  out[j + 3] = Math.round(a * 255)
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(`${OUT}/threads.png`)
console.log('theatre', W, 'x', CUT, 'threads', box)
