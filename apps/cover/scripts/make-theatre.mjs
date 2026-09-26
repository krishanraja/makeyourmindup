// Builds the cover's operating-theatre photo from brand/theatre-source.webp.
// Deterministic: same input, same outputs. Run with `npm run assets`.
//
// public/cover/theatre.webp  the photo cut at the table's edge, its backdrop
//                            lightened onto the page ink so no edge shows
// public/cover/threads.png   the three threads below that cut, on
//                            transparency, so they hang into the headline
import { mkdirSync } from 'node:fs'
import { cutOnInk, liftThreads } from './photo-cut.mjs'

const SRC = 'brand/theatre-source.webp'
const OUT = 'public/cover'
const W = 2000
const CUT = 550 // the table's edge, in source pixels
mkdirSync(OUT, { recursive: true })

await cutOnInk(SRC, { width: W, cut: CUT }, `${OUT}/theatre.webp`)
const box = { left: 1080, top: CUT - 8, width: 175, height: 662 - (CUT - 8) }
await liftThreads(SRC, box, `${OUT}/threads.png`)
console.log('theatre', W, 'x', CUT, 'threads', box)
