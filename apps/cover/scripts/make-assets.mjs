// Derives every logo file the site uses from the two Canva exports in brand/.
// Deterministic: same inputs, same outputs. Run with `npm run assets`.
//
// The stacked export carries the line "build your edge in the AI era." under
// the mark. That line fails the repo kill list, so it is cut off here rather
// than shown anywhere on the site.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const INK = '#0C1512'
mkdirSync('public/brand', { recursive: true })

/** Rows (or columns) that are fully transparent, as a boolean array. */
async function emptyLines(file, axis) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const n = axis === 'row' ? height : width
  const out = new Array(n).fill(true)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] > 8) {
        out[axis === 'row' ? y : x] = false
      }
    }
  }
  return { out, width, height }
}

/** The first run of content along an axis, stopping at the first gap of at least `gap` empty lines. */
function firstBlock(empty, gap) {
  const start = empty.indexOf(false)
  let run = 0
  for (let i = start; i < empty.length; i++) {
    if (empty[i]) { run++; if (run >= gap) return [start, i - run + 1] }
    else run = 0
  }
  return [start, empty.length]
}

// 1. The masthead: the stacked lockup without its tagline.
const trimmedStack = await sharp('brand/stacked-3x.png').trim({ threshold: 1 }).png().toBuffer()
await sharp(trimmedStack).toFile('/tmp/stack-trim.png')
const rows = await emptyLines('/tmp/stack-trim.png', 'row')
const [top, bottom] = firstBlock(rows.out, 30)
const mast = await sharp(trimmedStack)
  .extract({ left: 0, top, width: rows.width, height: bottom - top })
  .trim({ threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true })
await sharp(mast.data).png({ compressionLevel: 9 }).toFile('public/brand/masthead.png')
console.log('masthead', mast.info.width, 'x', mast.info.height)

// 2. The one-line wordmark for the nav and footer.
const word = await sharp('brand/horizontal-3x.png').trim({ threshold: 1 }).png().toBuffer({ resolveWithObject: true })
await sharp(word.data).png({ compressionLevel: 9 }).toFile('public/brand/wordmark.png')
console.log('wordmark', word.info.width, 'x', word.info.height)

// 3. The block mark on its own, cut from the masthead's left edge. The swoosh
// behind the type touches the mark mid-height, so gaps are measured on the
// bottom band only: the first gap splits the two block columns, the second
// separates the mark from the type.
const { data: px, info: mi } = await sharp(mast.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const band0 = Math.floor(mi.height * 0.85)
const emptyCol = []
for (let x = 0; x < mi.width; x++) {
  let e = true
  for (let y = band0; y < mi.height; y++) if (px[(y * mi.width + x) * mi.channels + 3] > 8) { e = false; break }
  emptyCol.push(e)
}
const gaps = []
for (let x = 1, s = -1; x < mi.width; x++) {
  if (emptyCol[x] && s < 0) s = x
  if (!emptyCol[x] && s >= 0) { gaps.push(s); s = -1 }
}
const markRight = gaps[1]
const mark = await sharp(mast.data)
  .extract({ left: 0, top: 0, width: markRight, height: mi.height })
  .trim({ threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true })
await sharp(mark.data).png({ compressionLevel: 9 }).toFile('public/brand/mark.png')
console.log('mark', mark.info.width, 'x', mark.info.height)

// 4. App icons: the mark centred on ink.
async function icon(size, file, pad = 0.18) {
  const inner = Math.round(size * (1 - pad * 2))
  const m = await sharp(mark.data).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
  await sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: m, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(file)
}
await icon(512, 'app/icon.png')
await icon(180, 'app/apple-icon.png', 0.14)
console.log('icons done')
