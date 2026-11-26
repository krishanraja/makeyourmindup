// Check the reader's layout, including text runs that overflow a narrowing grid.
import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:3100'
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
const widths = (process.env.WIDTHS || '320,360,390,412').split(',').map(Number)
const scales = (process.env.SCALES || '1,1.3').split(',').map(Number)

async function overflow(page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth,
      errors = new Set()
    if (document.documentElement.scrollWidth > viewport) errors.add('document')
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode,
        parent = node.parentElement
      if (!node.textContent.trim() || !parent || parent.closest('script,style,.sr,.skip,.seg,.chips,svg'))
        continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) {
        if (r.width && r.height && (r.right > viewport + 1 || r.left < -1))
          errors.add(node.textContent.trim().slice(0, 60))
      }
    }
    const strip = document.querySelector('.movers')?.getBoundingClientRect()
    if (strip)
      for (const m of document.querySelectorAll('.mv')) {
        const r = m.getBoundingClientRect()
        if (
          r.width &&
          (r.right > strip.right + 1 || r.bottom > strip.bottom + 1 || m.scrollWidth > r.width + 1)
        )
          errors.add('partial ticker entry')
      }
    return [...errors]
  })
}

let failures = 0
try {
  for (const width of widths)
    for (const scale of scales) {
      const page = await pageAt(width, 844)
      await page.goto(url)
      await page.locator('.movers[data-fitted="true"]').waitFor({ state: 'attached' })
      await page.evaluate(async (s) => {
        document.documentElement.style.fontSize = s * 100 + '%'
        await document.fonts.ready
      }, scale)
      async function check(state) {
        await page.evaluate(
          () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        )
        const issues = await overflow(page)
        if (issues.length) {
          failures++
          console.error(width, scale, state, issues)
        }
      }
      // The fallback edition has no dated page, so the homepage links to one only once an edition is published.
      const editionLink = (await page.locator('.edition-links a[href^="/edition/"]').count())
        ? await page.locator('.edition-links a[href^="/edition/"]').first().getAttribute('href') : null
      const routes = [...(editionLink ? [editionLink] : []), '/music', '/film-tv', '/gaming', '/sport', '/publishing-media', '/art-design', '/creative-24', '/editions']
      await check('front page')
      await page.locator('#all24').click()
      await check('all 24')
      await page.locator('#all24').click()
      for (const room of await page.locator('.room').all()) {
        await room.click()
        await check(await room.getAttribute('data-k'))
      }
      await page.locator('.cos button').first().click()
      await check('company detail')
      await page.locator('.done .ghost').click()
      await check('full feed')
      for (const route of routes) {
        const response = await page.goto(new URL(route, url).href)
        if (response.status() !== 200) throw Error('Failed to render ' + route)
        await page.evaluate(async (s) => {
          document.documentElement.style.fontSize = s * 100 + '%'
          await document.fonts.ready
        }, scale)
        await check(route)
      }
      await page.close()
      console.log('Checked', width + 'px', scale * 100 + '%')
    }
} finally {
  await browser.close()
}
process.exitCode = failures ? 1 : 0
