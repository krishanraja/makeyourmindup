import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const url = process.argv[2] || 'http://localhost:3100'
const out = process.argv[3] || '.shots'
await mkdir(out, { recursive: true })
const browser = process.env.CHROME_CDP_URL
  ? await chromium.connectOverCDP(process.env.CHROME_CDP_URL)
  : await chromium.launch({ executablePath: process.env.CHROME_PATH })
async function pageAt(width, height) {
  const page = process.env.CHROME_CDP_URL ? await browser.contexts()[0].newPage() : await browser.newPage()
  await page.setViewportSize({ width, height })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.removeItem('mymu-desk'))
  return page
}
async function discoveryShots() {
  for (const width of [390, 1280]) {
    const page = await pageAt(width, width === 390 ? 844 : 900)
    await page.goto(url)
    const paths = await page.locator('nav.edition-links a').evaluateAll(links => links.map(a => a.pathname))
    if (paths.length !== 9 || !paths.some(path => path.startsWith('/edition/'))) {
      throw Error('A published fixture edition and all nine discovery links are required')
    }
    for (const path of ['/', ...paths]) {
      const res = await page.goto(new URL(path, url).href)
      if (!res?.ok()) throw Error('Could not render ' + path)
      await page.evaluate(async () => {
        for (const img of document.images) img.loading = 'eager'
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
        await document.fonts.ready
      })
      const name = path.slice(1).replaceAll('/', '-') || 'home'
      await page.screenshot({ path: join(out, name + '-' + width + '.png'), fullPage: true })
    }
    await page.close()
  }
}

try {
  if (process.argv.includes('--discovery')) await discoveryShots()
  else for (const [name, width, height] of [
    ['desk', 1440, 900],
    ['phone', 390, 844],
  ]) {
    const page = await pageAt(width, height)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setScrollbarsHidden', { hidden: true })
    await page.clock.setFixedTime(new Date('2026-11-26T09:00:00Z'))
    await page.goto(url)
    await page.locator('.room').first().waitFor()
    async function shot(file, fullPage = false) {
      await page.evaluate(async () => {
        for (const image of document.images) image.loading = 'eager'
        await Promise.all([...document.images].map((img) => img.decode().catch(() => {})))
        await document.fonts.ready
      })
      await page.screenshot({ path: join(out, file + '.png'), fullPage })
    }
    await shot(name + '-fold')
    await shot(name + '-full', true)
    if (name === 'desk') {
      await page.locator('.room[data-k=music]').click()
      await page.locator('.cos button[data-t=SPOT]').click()
      await page
        .locator('.rooms')
        .evaluate((el) => window.scrollTo({ top: el.offsetTop - 12, behavior: 'instant' }))
      await shot('interaction')
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await shot('music-fold')
      await page.locator('.mood').click()
      await shot('evening')
    }
    await page.locator('.lead .alt').click()
    await shot(name + '-feed')
    await page.close()
  }
} finally {
  await browser.close()
}
