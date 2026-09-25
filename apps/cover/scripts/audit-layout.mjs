// Layout audit: fails when any text or container runs past the right edge of
// the screen, even where overflow-hidden would clip it silently. Runs at the
// common phone widths, at 100% and 130% text (Android's larger font setting).
// Usage: node scripts/audit-layout.mjs [baseUrl]
import { chromium } from 'playwright-core'

const BASE = process.argv[2] || 'http://localhost:3100'
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const WIDTHS = (process.env.WIDTHS || '320,360,375,390,412,768').split(',').map(Number)
const SCALES = (process.env.SCALES || '1,1.3').split(',').map(Number)

const browser = await chromium.launch({ executablePath: CHROME })
let failures = 0

for (const scale of SCALES) {
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
// Alignment: the three spreads share one structure, so every slot must sit at
// the same height in each, and every slot must share the same left edge.
const SLOTS = ['meta', 'tag', 'headline', 'dek', 'card', 'caption', 'question', 'body']
const STACKED = (process.env.ALIGN_WIDTHS || '360,375,390,412,640,768').split(',').map(Number)
const WIDE = [1280, 1440]
let misaligned = 0
for (const width of [...STACKED, ...WIDE]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'load', timeout: 90000 })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    // Measure with the real fonts, never the fallback: a wider fallback wraps lines.
    await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  const spreads = await page.evaluate(slots => [...document.querySelectorAll('[data-spread]')].map(sec => {
    const grid = sec.querySelector('.page')
    const g = grid.getBoundingClientRect()
    const pad = parseFloat(getComputedStyle(grid).paddingLeft)
    const out = { id: sec.id, left: g.left + pad, right: g.right - parseFloat(getComputedStyle(grid).paddingRight) }
    for (const name of slots) {
      const el = sec.querySelector(`[data-slot="${name}"]`)
      const r = el.getBoundingClientRect()
      out[name] = { top: Math.round((r.top - g.top) * 10) / 10, left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10 }
    }
    return out
  }), SLOTS)
  const problems = []
  if (width < 1024) {
    for (const name of SLOTS) {
      const tops = spreads.map(s => s[name].top)
      if (Math.max(...tops) - Math.min(...tops) > 1) problems.push(`${name} tops differ: ${spreads.map(s => `${s.id} ${s[name].top}`).join(', ')}`)
    }
  } else {
    for (const s of spreads) {
      if (Math.abs(s.card.top - s.meta.top) > 1) problems.push(`${s.id}: card top ${s.card.top} vs meta top ${s.meta.top}`)
    }
  }
  // Left edges: in a stacked layout every slot starts on the page margin.
  if (width < 1024) {
    for (const s of spreads) {
      for (const name of SLOTS) {
        if (Math.abs(s[name].left - s.left) > 0.5) problems.push(`${s.id}: ${name} left ${s[name].left} vs margin ${s.left}`)
      }
      if (Math.abs(s.card.right - s.right) > 0.5) problems.push(`${s.id}: card right ${s.card.right} vs margin ${s.right}`)
    }
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

await browser.close()
console.log(failures ? `${failures} overflow(s)` : 'PASS  no overflow at any width')
console.log(misaligned ? `${misaligned} alignment problem(s)` : 'PASS  spreads aligned at every width')
process.exit(failures || misaligned ? 1 : 0)
