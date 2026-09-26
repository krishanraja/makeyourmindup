// Renders the Substack refresh kit and the site's social card at exact sizes.
// Usage: node scripts/render-kit.mjs   (needs network for Google Fonts)
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import sharp from 'sharp'

const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const OUT = 'substack-kit/images'
const TMP = resolve('substack-kit/.tmp')
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const brand = f => `file://${resolve('public/brand', f)}`
// The headless browser does not go through the network proxy, so fonts are
// fetched with curl (which does) and served to the page from disk.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@62..125,400..900&family=Fraunces:ital,wght@1,300..500&family=IBM+Plex+Mono:wght@500;600;700&display=block'
mkdirSync(`${TMP}/fonts`, { recursive: true })
let css = execFileSync('curl', ['-sS', '-m', '30', FONT_CSS]).toString()
for (const [, url] of css.matchAll(/url\((https:[^)]+)\)/g)) {
  const local = `${TMP}/fonts/${url.split('/').slice(-1)[0]}`
  if (!existsSync(local)) execFileSync('curl', ['-sS', '-m', '60', '-o', local, url])
  css = css.replace(url, `file://${local}`)
}
const FONTS = `<style>${css}</style>`
const BASE = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#0C1512;color:#F4EFE4;font-family:Archivo,sans-serif;overflow:hidden;position:relative}
  .grain::after{content:'';position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay;pointer-events:none;z-index:9;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
  .display{font-family:Anton,sans-serif;text-transform:uppercase;line-height:.88;white-space:nowrap}
  .mono{font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.14em;font-weight:600}
  .dek{font-family:Fraunces,serif;font-style:italic}
  .mast{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;background:#0C1512;border-bottom:1px solid rgba(244,239,228,.2)}
  .date{font-family:'IBM Plex Mono',monospace;font-weight:500;text-transform:uppercase;letter-spacing:.14em;text-align:right;line-height:1.55;color:rgba(244,239,228,.72)}
  .date span{display:block}
  .date .strong{color:#F4EFE4;font-weight:700}
  .part{font-family:'IBM Plex Mono',monospace;font-weight:500;letter-spacing:.06em;line-height:1;white-space:nowrap;font-size:var(--part)}
  .stamp{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:700;letter-spacing:.18em;text-transform:uppercase;border:var(--bw) solid currentColor;padding:.2em .3em .2em .5em;line-height:1.1;background:#0C1512;white-space:nowrap;transform:rotate(-4deg);font-size:var(--stamp)}
  .stamp.real{background:#F4EFE4;color:#0C1512;border-color:#F4EFE4;transform:rotate(3deg)}
  .note{position:absolute;display:flex;flex-direction:column;gap:var(--gap)}
  .lead path{fill:none;stroke:#F4EFE4;stroke-width:var(--sw);vector-effect:non-scaling-stroke;opacity:.9}
  .lead circle{fill:#0C1512;stroke:#F4EFE4;stroke-width:calc(var(--sw) * 1.2);vector-effect:non-scaling-stroke}
`

// The social card and the welcome image are the cover itself, built from its
// own parts: the photo and threads from `npm run assets`, the words from
// content/site.json, and the stamps and leader lines at the cover's positions
// (components/Cover.tsx and Cover.module.css), in source-photo pixels.
const SITE = JSON.parse(readFileSync('content/site.json', 'utf8'))
const TH = SITE.cover.theatre
const [HED1, HED2] = SITE.cover.splash
const DAYS = SITE.strap.centre
const FREE = SITE.strap.right.replace(/\*$/, '') // no small print here, so no asterisk
const cover = f => `file://${resolve('public/cover', f)}`
const DATELINE = `<p class="date"><span>${DAYS}</span><span class="strong">${FREE}</span></p>`
// The card is wider than its type allows, so its visor note tucks in closer than the cover's.
const CARD = {
  leaders: '<path d="M1212 258 L1040 172 L872 172"/><path d="M1628 292 L1668 172 L1682 172"/><circle cx="1212" cy="258" r="7"/><circle cx="1628" cy="292" r="7"/>',
  stuff: { x: 862, y: 150, right: true },
  visor: { x: 1692, y: 150, right: false },
}
const PHONE = {
  leaders: '<path d="M1160 170 L1212 258"/><path d="M1651 170 L1628 290"/><circle cx="1212" cy="258" r="9"/><circle cx="1628" cy="292" r="9"/>',
  stuff: { x: 1110, y: 94, right: false },
  visor: { x: 1704, y: 94, right: true },
}
// A window onto the photo: s is px per source pixel, (x0, y0) the source point at its top left.
function theatre({ s, x0, y0, h, set, extra = '' }) {
  const note = (n, t, real) =>
    `<div class="note" style="left:${n.x * s}px;top:${n.y * s}px;align-items:${n.right ? 'flex-end;transform:translateX(-100%)' : 'flex-start'}"><span class="part">${t.part}</span><span class="stamp${real ? ' real' : ''}">${t.stamp}</span></div>`
  return `<div style="position:relative;height:${h}px;z-index:2">
    <div style="position:absolute;left:${-x0 * s}px;top:${-y0 * s}px;width:${2000 * s}px;height:${550 * s}px">
      <img src="${cover('theatre.webp')}" style="position:absolute;inset:0;width:100%;height:100%">
      <img src="${cover('threads.png')}" style="position:absolute;left:${1080 * s}px;top:${542 * s}px;width:${175 * s}px">
      <svg class="lead" viewBox="0 0 2000 550" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">${set.leaders}</svg>
      ${extra}${note(set.stuff, TH.stuffing, true)}${note(set.visor, TH.visor, false)}
    </div>
  </div>`
}

const pages = {
  // The social card, used by Substack and by the site itself: the desktop cover without the form.
  'social-preview-1200x630': {
    w: 1200, h: 630, scale: 1,
    vars: '--part:20px;--stamp:21px;--bw:3px;--gap:10px;--sw:2',
    html: `<div class="grain" style="width:1200px;height:630px;position:relative;overflow:hidden">
      <div class="mast" style="height:78px;padding:0 33px"><img src="${brand('masthead.png')}" style="height:62px"><div style="font-size:17px">${DATELINE}</div></div>
      ${theatre({ s: 0.6, x0: 0, y0: 30, h: 312, set: CARD, extra: `<div style="position:absolute;left:34px;top:42px;display:flex;flex-direction:column;gap:8px"><span style="font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:17px;color:#B7A6FF">${TH.chartSection}</span><span class="dek" style="font-size:30px;font-weight:380;line-height:1">${TH.chartLine}</span></div>` })}
      <p class="display" style="font-size:218px;padding-left:33px;margin-top:9px">${HED1} ${HED2}</p>
    </div>`,
  },
  // Substack welcome image, square: the phone cover, with "AI," beside the threads.
  'cover-1200x1200': {
    w: 1200, h: 1200, scale: 1,
    vars: '--part:28px;--stamp:30px;--bw:4px;--gap:13px;--sw:2.5',
    html: `<div class="grain" style="width:1200px;height:1200px;position:relative;overflow:hidden">
      <div class="mast" style="height:132px;padding:0 44px"><img src="${brand('masthead.png')}" style="height:100px"><div style="font-size:24px">${DATELINE}</div></div>
      ${theatre({ s: 1.19, x0: 902, y0: 74, h: 566, set: PHONE })}
      <p class="display" style="font-size:236px;padding-left:40px;margin-top:22px"><span style="display:block;margin-left:${Math.round((1255 - 902) * 1.19 - 22)}px">${HED1}</span><span style="display:block;margin-top:.2em">${HED2}</span></p>
    </div>`,
  },
  // Email banner: 1100 by 220, rendered at 2x.
  'email-banner-1100x220': {
    w: 1100, h: 220, scale: 2,
    html: `<div class="grain" style="width:1100px;height:220px;padding:0 56px;display:flex;align-items:center;justify-content:space-between;border-bottom:6px solid #7EF0C0">
      <img src="${brand('wordmark.png')}" style="width:600px">
      <div style="text-align:right">
        <p class="mono" style="font-size:16px;color:rgba(244,239,228,.8)">Mondays, Wednesdays, Fridays</p>
        <p class="mono" style="font-size:16px;margin-top:10px;color:#7EF0C0">Free to read</p>
      </div>
    </div>`,
  },
  // Wordmark for the Substack header, on ink so the white type always reads.
  'wordmark-ink-1344x256': {
    w: 1344, h: 256, scale: 1,
    html: `<div style="width:1344px;height:256px;display:flex;align-items:center;justify-content:center"><img src="${brand('wordmark.png')}" style="width:1180px"></div>`,
  },
}

const browser = await chromium.launch({ executablePath: CHROME })
for (const [name, p] of Object.entries(pages)) {
  const file = `${TMP}/${name}.html`
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}</style></head><body style="width:${p.w}px;height:${p.h}px;${p.vars || ''}">${p.html}</body></html>`)
  const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: p.scale })
  await page.goto(`file://${file}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  await page.close()
  console.log('rendered', name)
}
await browser.close()

// Transparent wordmark for dark Substack themes, padded to 1344x256.
const wm = await sharp('public/brand/wordmark.png').resize({ width: 1180 }).toBuffer()
const meta = await sharp(wm).metadata()
await sharp({ create: { width: 1344, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: wm, left: 82, top: Math.round((256 - meta.height) / 2) }])
  .png()
  .toFile(`${OUT}/wordmark-transparent-1344x256.png`)

// Publication logo: the block mark on ink, 1024 square.
const mark = await sharp('public/brand/mark.png').resize(640, 640, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: '#0C1512' } })
  .composite([{ input: mark, gravity: 'centre' }])
  .png()
  .toFile(`${OUT}/logo-1024.png`)

// The site's own social card is the same image, as a JPEG: it is a photograph
// now, and WhatsApp drops link previews much over 300KB.
for (const f of ['app/opengraph-image.jpg', 'app/twitter-image.jpg']) {
  await sharp(`${OUT}/social-preview-1200x630.png`).jpeg({ quality: 84, mozjpeg: true }).toFile(f)
}
console.log('kit done')
