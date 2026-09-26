// Builds the cover's operating-theatre photo from brand/theatre-source.webp.
// Deterministic: same input, same outputs. Run with `npm run assets`.
//
// public/cover/theatre.webp  the photo cut at the table's edge, its backdrop
//                            lightened onto the page ink so no edge shows
// public/cover/threads.png   the three threads below that cut, on
//                            transparency, so they hang into the headline
import { mkdirSync } from 'node:fs'
import { THEATRE, cutOnInk, liftThreads } from './photo-cut.mjs'

const OUT = 'public/cover'
mkdirSync(OUT, { recursive: true })

await cutOnInk(THEATRE.src, THEATRE, `${OUT}/theatre.webp`)
await liftThreads(THEATRE.src, THEATRE.threads, `${OUT}/threads.png`)
console.log('theatre', THEATRE.width, 'x', THEATRE.cut, 'threads', THEATRE.threads)
