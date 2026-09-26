// Shared by make-theatre.mjs (the cover) and render-kit.mjs (the Substack
// welcome image): cut a studio photo at an edge, lighten its backdrop onto the
// page ink so no edge shows, and lift the threads that hang below the cut.
import sharp from 'sharp'

export const INK = { r: 12, g: 21, b: 18 }

// The photo above the cut, lightened onto ink. The backdrops are darker than
// ink, so they disappear into the page.
export async function cutOnInk(src, { width, cut }, out) {
  const top = await sharp(src).extract({ left: 0, top: 0, width, height: cut }).toBuffer()
  await sharp({ create: { width, height: cut, channels: 3, background: INK } })
    .composite([{ input: top, blend: 'lighten' }])
    .webp({ quality: 90 })
    .toFile(out)
}

// How much of a pixel is thread. Every thread is lilac, butter or coral.
// Behind a teal drape, thread is red above green, or blue well above green.
export const behindTeal = (r, g, b) => Math.max((r - g - 4) / 16, (b - g - 12) / 16)
// Behind a warm grey plinth, thread is simply the saturated colour: the plinth
// stays under 30 on a 0 to 255 scale, the threads run well past 50.
export const behindGrey = (r, g, b) => (Math.max(r, g, b) - Math.min(r, g, b) - 34) / 22

// The threads below the cut, on transparency, so they hang into the headline.
export async function liftThreads(src, box, out, alpha = behindTeal) {
  const { data, info } = await sharp(src).extract(box).raw().toBuffer({ resolveWithObject: true })
  const px = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0, j = 0; i < data.length; i += info.channels, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    px[j] = r
    px[j + 1] = g
    px[j + 2] = b
    px[j + 3] = Math.round(Math.max(0, Math.min(1, alpha(r, g, b))) * 255)
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(out)
}
