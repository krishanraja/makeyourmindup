// Renders the cover at phone and desktop widths, scrolling through first so
// every in-view animation has fired. Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:3100'
const OUT = process.argv[3] || '.shots'
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME })

async function walk(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= h; y += 350) {
    await page.evaluate(v => window.scrollTo(0, v), y)
    await page.waitForTimeout(220)
  }
  await page.waitForTimeout(3500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
}

const runs = [
  { name: 'phone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
]

for (const r of runs) {
  const ctx = await browser.newContext({ viewport: r.viewport, deviceScaleFactor: r.deviceScaleFactor, isMobile: r.isMobile, hasTouch: r.hasTouch })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => m.type() === 'error' && errors.push(m.text()))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3200)
  await page.screenshot({ path: `${OUT}/${r.name}-fold.png` })
  await walk(page)
  // The sticky bar is fixed, so it would paint over every section capture.
  await page.addStyleTag({ content: '[data-sticky]{display:none!important}' })
  await page.screenshot({ path: `${OUT}/${r.name}-full.png`, fullPage: true })
  for (const id of ['mind_the_gap', 'follow_the_money', 'under_the_hood', 'scoreboard', 'latest', 'platforms', 'staff']) {
    await page.locator(`#${id}`).screenshot({ path: `${OUT}/${r.name}-${id}.png` })
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(r.name, 'horizontal overflow px:', overflow, 'errors:', errors.length ? errors : 'none')
  await ctx.close()
}

// Reduced motion: everything must be visible without any animation.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/reduced-full.png`, fullPage: true })
  await ctx.close()
}

// JavaScript off: the page must still show everything.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${OUT}/nojs-full.png`, fullPage: true })
  await ctx.close()
}

// The 404.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const res = await page.goto(`${BASE}/no-such-page`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/404.png` })
  console.log('404 status', res?.status())
  await ctx.close()
}

await browser.close()
