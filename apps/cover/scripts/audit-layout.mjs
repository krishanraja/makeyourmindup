// Layout audit, three phases:
//   overflow   no text or container runs past the right edge of the screen,
//              even where overflow-hidden would clip it silently. Common phone
//              widths, at 100% and 130% text (Android's larger font setting).
//   alignment  the three format panels line up slot for slot.
//   fit        every section fits on one screen, below the sticky bar, from a
//              small phone in Safari to a large desktop.
// Usage: node scripts/audit-layout.mjs [baseUrl]   ONLY=fit runs one phase.
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || 'http://localhost:3100'
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const WIDTHS = (process.env.WIDTHS || '320,360,375,390,412,768').split(',').map(Number)
const SCALES = (process.env.SCALES || '1,1.3').split(',').map(Number)

const ONLY = process.env.ONLY || ''
const run = phase => !ONLY || ONLY === phase

const browser = await chromium.launch({ executablePath: CHROME })
let failures = 0

for (const scale of run('overflow') ? SCALES : []) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto(BASE, { waitUntil: 'load', timeout: 90000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    // Measure with the real fonts, never the fallback: a wider fallback wraps lines.
    await page.evaluate(() => document.fonts.ready)
    if (scale !== 1) await page.evaluate(s => { document.documentElement.style.fontSize = `${s * 100}%` }, scale)
    await page.waitForTimeout(300)
    const found = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const out = []
      const section = el => {
        const s = el.closest('section, header, footer, [id]')
        return s ? `${s.tagName.toLowerCase()}${s.id ? '#' + s.id : ''}` : 'page'
      }
      // Every visible text run.
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      while (walker.nextNode()) {
        const node = walker.currentNode
        const el = node.parentElement
        if (!el || !node.textContent.trim()) continue
        if (el.closest('[data-bleed], .sr-only, [aria-hidden="true"] .sr-only')) continue
        const style = getComputedStyle(el)
        if (style.visibility === 'hidden' || style.display === 'none') continue
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const r of range.getClientRects()) {
          if (r.width === 0) continue
          if (r.right > vw + 1 || r.left < -1) {
            out.push({ kind: 'text', where: section(el), sample: node.textContent.trim().slice(0, 40), right: Math.round(r.right), left: Math.round(r.left) })
            break
          }
        }
      }
      // Containers whose content is wider than themselves.
      for (const el of document.querySelectorAll('.page')) {
        if (el.closest('[data-bleed]')) continue
        if (el.scrollWidth > el.clientWidth + 1) {
          out.push({ kind: 'container', where: section(el), sample: `scrollWidth ${el.scrollWidth} > ${el.clientWidth}` })
        }
      }
      return out
    })
    const label = `${width}px at ${Math.round(scale * 100)}% text`
    if (found.length) {
      failures += found.length
      console.log(`FAIL  ${label}: ${found.length}`)
      for (const f of found.slice(0, Number(process.env.SHOW || 8))) console.log(`      ${f.kind} in ${f.where}: ${JSON.stringify(f.sample)}${f.right !== undefined ? ` (left ${f.left}, right ${f.right})` : ''}`)
    } else {
      console.log(`PASS  ${label}`)
    }
    await ctx.close()
  }
}
// Alignment: the three format panels sit side by side in one section (a swipe
// row on phones, three columns from tablet up) and share one set of rows, so
// every slot must sit at the same height in each panel.
const SLOTS = ['meta', 'tag', 'headline', 'card', 'question', 'body']
const STACKED = (process.env.ALIGN_WIDTHS || '360,375,390,412,640,768').split(',').map(Number)
const WIDE = [1024, 1280, 1440]
let misaligned = 0
for (const width of run('alignment') ? [...STACKED, ...WIDE] : []) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  // Measure with the real fonts, never the fallback: a wider fallback wraps lines.
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  const spreads = await page.evaluate(slots => [...document.querySelectorAll('[data-spread]')].map(sec => {
    const g = sec.getBoundingClientRect()
    const out = { id: sec.id, top: Math.round(g.top * 10) / 10, height: Math.round(g.height * 10) / 10 }
    for (const name of slots) {
      const el = sec.querySelector(`[data-slot="${name}"]`)
      // A slot a layout leaves out (the body on short screens) has nothing to align.
      if (!el || !el.getClientRects().length) continue
      const r = el.getBoundingClientRect()
      out[name] = { top: Math.round((r.top - g.top) * 10) / 10, right: Math.round((r.right - g.left) * 10) / 10, width: Math.round(g.width * 10) / 10 }
    }
    return out
  }), SLOTS)
  const problems = []
  const shown = name => spreads.every(s => s[name])
  const spread = xs => Math.max(...xs) - Math.min(...xs)
  if (spreads.length !== 3) problems.push(`expected 3 panels, found ${spreads.length}`)
  if (spread(spreads.map(s => s.top)) > 1) problems.push(`panel tops differ: ${spreads.map(s => `${s.id} ${s.top}`).join(', ')}`)
  if (spread(spreads.map(s => s.height)) > 1) problems.push(`panel heights differ: ${spreads.map(s => `${s.id} ${s.height}`).join(', ')}`)
  for (const name of SLOTS.filter(shown)) {
    const tops = spreads.map(s => s[name].top)
    if (spread(tops) > 1) problems.push(`${name} tops differ: ${spreads.map(s => `${s.id} ${s[name].top}`).join(', ')}`)
    for (const s of spreads) if (s[name].right > s[name].width + 0.5) problems.push(`${s.id}: ${name} runs past the panel edge`)
  }
  if (problems.length) {
    misaligned += problems.length
    console.log(`MISALIGNED  ${width}px`)
    for (const p of problems) console.log(`      ${p}`)
  } else {
    console.log(`ALIGNED  ${width}px`)
  }
  await ctx.close()
}

// Fit: each section fits on one screen. The cover gets the whole screen;
// every later section sits below the sticky bar (3.5rem plus its border).
// Heights are what a browser shows with its toolbars in view, not the
// device's full screen: a phone in Safari has far less room than its specs.
const FIT = (process.env.FIT_VIEWS || '360x640,375x553,390x664,412x780,430x740,768x954,820x1106,1024x700,1280x720,1366x657,1440x789,1536x730,1920x960,2560x1300')
  .split(',').map(v => v.split('x').map(Number))
const BAR = 58
let unfit = 0
for (const [width, height] of run('fit') ? FIT : []) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  const blocks = await page.evaluate(() => [...document.querySelectorAll('main > header, main > section, body > footer, main ~ footer')]
    .map(el => ({ id: el.id || el.tagName.toLowerCase(), h: Math.round(el.getBoundingClientRect().height) })))
  const over = blocks.filter(b => b.h > (b.id === 'header' ? height : height - BAR))
  if (over.length) {
    unfit += over.length
    console.log(`TOO TALL  ${width}x${height}: ${over.map(b => `${b.id} ${b.h}px (+${b.h - (b.id === 'header' ? height : height - BAR)})`).join(', ')}`)
  } else {
    console.log(`FITS  ${width}x${height}`)
  }
  await ctx.close()
}

await browser.close()
if (run('fit')) console.log(unfit ? `${unfit} section(s) taller than the screen` : 'PASS  every section fits on one screen')
if (!run('overflow') && !run('alignment')) process.exit(unfit ? 1 : 0)
console.log(failures ? `${failures} overflow(s)` : 'PASS  no overflow at any width')
console.log(misaligned ? `${misaligned} alignment problem(s)` : 'PASS  panels aligned at every width')
process.exit(failures || misaligned || unfit ? 1 : 0)
