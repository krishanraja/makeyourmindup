// Check the reader's layout, including text runs that overflow a narrowing grid.
import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

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
const widths = (process.env.WIDTHS || '320,360,390,412,1280').split(',').map(Number)
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
      if (!node.textContent.trim() || !parent || parent.closest('script,style,.sr,.skip,.seg,.chips,.movers,svg'))
        continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) {
        if (r.width && r.height && (r.right > viewport + 1 || r.left < -1))
          errors.add(node.textContent.trim().slice(0, 60))
      }
    }
    const strip = document.querySelector('.movers')
    if (strip) {
      const track = strip.firstElementChild
      const close = document.querySelector('.tick-label')
      if (!strip.clientWidth || !close?.getClientRects().length) errors.add('missing ticker or close label')
      if (getComputedStyle(track).animationName !== 'none') errors.add('moving reduced motion ticker')
      if (getComputedStyle(strip).overflowX !== 'auto') errors.add('ticker cannot scroll')
      if (Array.from(track.querySelectorAll('[aria-hidden]')).some(el => el.getClientRects().length))
        errors.add('duplicate visible in static ticker')
      const end = track.querySelector('.tape-group .mv:last-child')
      if (end) {
        strip.scrollLeft = strip.scrollWidth
        if (end.getBoundingClientRect().right > strip.getBoundingClientRect().right + 1)
          errors.add('last constituent unreachable')
        strip.scrollLeft = 0
      }
    }
    return [...errors]
  })
}

async function checkMotion(width) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 800 } })
  const page = await context.newPage()
  try {
    await page.goto(url)
    await page.evaluate(() => document.fonts.ready)
    const strip = page.locator('.movers')
    const track = strip.locator('.tape-track')
    await strip.locator('.tape-group[aria-hidden="true"]').first().waitFor()
    const symbols = await strip.locator('.tape-group:first-child .sym').allTextContents()
    await page.locator('#all24').click()
    const board = await page.locator('#board .srow > :first-child').allTextContents()
    assert.deepEqual(symbols.toSorted(), board.toSorted())
    await page.locator('#all24').click()
    await page.mouse.move(0, 0)
    const start = await track.evaluate(el => getComputedStyle(el).transform)
    await page.waitForTimeout(150)
    assert.notEqual(await track.evaluate(el => getComputedStyle(el).transform), start)
    for (const pause of [() => strip.hover(), () => strip.focus()]) {
      await pause()
      assert.equal(await track.evaluate(el => getComputedStyle(el).animationPlayState), 'paused')
      await page.mouse.move(0, 0)
    }
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('#all24').evaluate(el => el === document.activeElement), true)
    await page.getByRole('button', { name: 'Music', exact: true }).first().click()
    const selected = await strip.locator('.tape-group:first-child .sym').allTextContents()
    const drill = await page.locator('.cos button[data-t]').evaluateAll(els => els.map(el => el.dataset.t))
    assert.deepEqual(selected.toSorted(), drill.toSorted())
    const lastRoom = page.locator('.room').last()
    await lastRoom.scrollIntoViewIfNeeded()
    await page.locator('.room[data-entered]').last().waitFor()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForFunction(() => !document.documentElement.classList.contains('motion'))
    assert.equal(await track.evaluate(el => getComputedStyle(el).transform), 'none')
    await page.goto(new URL('/music', url).href)
    if (await page.locator('.market-data').count()) {
      const list = await page.locator('.market-data tbody th small').allTextContents()
      assert.deepEqual((await page.locator('.tape-group:first-child .sym').allTextContents()).toSorted(), list.toSorted())
    }
  } finally {
    await context.close()
  }
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 844 } })
  try {
    const p = await plain.newPage()
    await p.goto(url)
    for (const selector of ['.lead h1', '.movers', '.room', '.thing', '.done', '#subscribe']) {
      assert(await p.locator(selector).first().isVisible(), 'Server-rendered ' + selector)
    }
    assert.equal(await p.locator('.movers').evaluate(el => getComputedStyle(el).overflowX), 'auto')
    assert.equal(await p.locator('.tape-group[aria-hidden]').count(), 0)
  } finally {
    await plain.close()
  }
}

let failures = 0
try {
  for (const width of [390, 1280]) await checkMotion(width)
  for (const width of widths)
    for (const scale of scales) {
      const page = await pageAt(width, 844)
      await page.goto(url)
      await page.locator('.movers').waitFor()
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
