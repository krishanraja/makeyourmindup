// Renders the Substack refresh kit and the site's social card at exact sizes.
// Usage: node scripts/render-kit.mjs   (needs network for Google Fonts)
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
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
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wdth,wght@62..125,400..900&family=Fraunces:ital,wght@1,400&family=IBM+Plex+Mono:wght@500;600&display=block'
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
  .grain::after{content:'';position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
  .display{font-family:Anton,sans-serif;text-transform:uppercase;line-height:.88}
  .mono{font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:.14em;font-weight:600}
  .dek{font-family:Fraunces,serif;font-style:italic}
  .swipe{position:relative;z-index:0;color:#0C1512;white-space:nowrap}
  .swipe::before{content:'';position:absolute;inset:20% -.06em 4% -.06em;background:#7EF0C0;transform:skewX(-8deg) rotate(-1deg);z-index:-1}
  .pill{display:inline-block;color:#0C1512;padding:.3em .6em}
  .sticker{display:inline-block;border:3px solid #0C1512;border-radius:999px;padding:.5em 1.1em;color:#0C1512;box-shadow:4px 4px 0 #0C1512}
`
const LINES = `<span class="pill mono" style="background:#FF6A4D">mind.the.gap</span> <span class="pill mono" style="background:#FFD84D">follow.the.money</span> <span class="pill mono" style="background:#B7A6FF">under.the.hood</span>`

const pages = {
  // The social card, used by Substack and by the site itself.
  'social-preview-1200x630': {
    w: 1200, h: 630, scale: 1,
    html: `<div class="grain" style="width:1200px;height:630px;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between">
      <img src="${brand('masthead.png')}" style="width:560px">
      <div>
        <p class="display" style="font-size:118px">AI, <span class="swipe">unpicked.</span></p>
        <p class="dek" style="font-size:32px;margin-top:40px;max-width:980px;color:rgba(244,239,228,.92)">We follow the money, look under the hood and mind the gap. You make your mind up.</p>
      </div>
      <p style="font-size:17px">${LINES}</p>
      <span class="sticker mono" style="position:absolute;right:64px;top:70px;background:#FFD84D;font-size:18px;transform:rotate(-8deg)">Reading age 12</span>
      <span class="sticker mono" style="position:absolute;right:92px;top:150px;background:#FF6A4D;font-size:18px;transform:rotate(5deg)">Zero preaching</span>
    </div>`,
  },
  // Substack cover image: square, at least 600.
  'cover-1200x1200': {
    w: 1200, h: 1200, scale: 1,
    html: `<div class="grain" style="width:1200px;height:1200px;padding:90px;display:flex;flex-direction:column;justify-content:center;gap:70px">
      <img src="${brand('masthead.png')}" style="width:1020px">
      <p class="dek" style="font-size:52px;line-height:1.2;color:rgba(244,239,228,.92)">We follow the money, look under the hood and mind the gap. You make your mind up.</p>
      <p style="font-size:26px">${LINES}</p>
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
  writeFileSync(file, `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}</style></head><body style="width:${p.w}px;height:${p.h}px">${p.html}</body></html>`)
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

// The site's own social card is the same image.
copyFileSync(`${OUT}/social-preview-1200x630.png`, 'app/opengraph-image.png')
copyFileSync(`${OUT}/social-preview-1200x630.png`, 'app/twitter-image.png')
console.log('kit done')
