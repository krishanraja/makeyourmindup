// Builds the downloadable brand kit at ../../brand-kit from the live cover's
// own files, so the kit can never drift from what readers see.
// Usage: npm run brand-kit   (needs network the first time, for the fonts)
//
// Out: logos, colour tokens, fonts with their licences, finished
// applications, the brand book as HTML and PDF, and one zip of all of it.
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, copyFileSync, existsSync, rmSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import sharp from 'sharp'

const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const KIT = resolve('../../brand-kit')
const NAME = 'makeyourmindup-brand-kit'
const VERSION = '1.3'
const DATED = '26 September 2026'
const SITE = JSON.parse(readFileSync('content/site.json', 'utf8'))

// Screenshots of the live cover come from `npm run shots`. Keep the last ones
// so the kit still builds when no fresh screenshots exist.
const SHOTS = [['.shots/desktop-fold.png', 'website-desktop.png'], ['.shots/phone-fold.png', 'website-phone.png']]
const kept = Object.fromEntries(SHOTS.map(([, out]) => [out, existsSync(join(KIT, 'applications', out)) ? readFileSync(join(KIT, 'applications', out)) : null]))
for (const d of ['logos', 'colours', 'tokens', 'fonts', 'applications', 'guidelines']) {
  rmSync(join(KIT, d), { recursive: true, force: true })
  mkdirSync(join(KIT, d), { recursive: true })
}

// ---------------------------------------------------------------- colours
// Every colour has one job. The jobs are the rule, the hex values follow.
const COLOURS = [
  { key: 'ink', hex: '#0C1512', name: 'Ink', job: 'The page. Every dark block, every line of type on a colour block.' },
  { key: 'cream', hex: '#F4EFE4', name: 'Cream', job: 'The reading colour on ink, and the light page.' },
  { key: 'mint', hex: '#7EF0C0', name: 'Mint', job: 'The brand, the answer and every primary action.' },
  { key: 'lilac', hex: '#B7A6FF', name: 'Lilac', job: 'under.the.hood, Mondays. Nothing else.' },
  { key: 'butter', hex: '#FFD84D', name: 'Butter', job: 'follow.the.money, Wednesdays. Nothing else.' },
  { key: 'coral', hex: '#FF6A4D', name: 'Coral', job: 'mind.the.gap, Fridays. Nothing else.' },
  { key: 'ink-deep', hex: '#070D0B', name: 'Ink deep', job: 'Support. The footer and the deepest blocks.' },
  { key: 'ink-soft', hex: '#16221D', name: 'Ink soft', job: 'Support. Raised panels on ink.' },
]
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
const lum = h => {
  const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
const grade = r => (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large only' : 'Fails')
const C = Object.fromEntries(COLOURS.map(c => [c.key, c.hex]))

writeFileSync(join(KIT, 'tokens/tokens.json'), JSON.stringify({
  name: 'makeyourmindup', version: VERSION,
  colour: Object.fromEntries(COLOURS.map(c => [c.key, { value: c.hex, rgb: hexRgb(c.hex), job: c.job }])),
  font: {
    display: { family: 'Anton', weight: 400, transform: 'uppercase', lineHeight: 0.88, letterSpacing: '0.005em' },
    heavy: { family: 'Archivo', weight: 900, variation: "'wdth' 112", letterSpacing: '-0.02em' },
    body: { family: 'Archivo', weight: 400, lineHeight: 1.5 },
    dek: { family: 'Fraunces', style: 'italic', weight: 400 },
    label: { family: 'IBM Plex Mono', weight: 500, transform: 'uppercase', letterSpacing: '0.14em', size: '0.75rem' },
  },
  shadow: { brutal: '6px 6px 0 0 #0C1512', brutalSmall: '3px 3px 0 0 #0C1512', brutalMint: '6px 6px 0 0 #7EF0C0' },
  border: { sticker: '2px solid #0C1512', stamp: '3px solid currentColor' },
  radius: { sticker: '999px', card: '0' },
  layout: { maxWidth: '1400px', gutter: { phone: '16px', tablet: '24px', desktop: '40px' } },
  texture: { grainOpacity: 0.07, halftoneDot: '14px' },
  motion: { marquee: '38s linear infinite', reducedMotion: 'everything holds still' },
}, null, 2) + '\n')

writeFileSync(join(KIT, 'tokens/tokens.css'), `/* makeyourmindup design tokens, v${VERSION}. Every colour has one job. */
:root {
${COLOURS.map(c => `  --${c.key}: ${c.hex}; /* ${c.job} */`).join('\n')}

  --font-display: 'Anton', 'Arial Narrow', sans-serif;
  --font-sans: 'Archivo', system-ui, sans-serif;
  --font-dek: 'Fraunces', Georgia, serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  --shadow-brutal: 6px 6px 0 0 var(--ink);
  --shadow-brutal-sm: 3px 3px 0 0 var(--ink);
  --page-max: 1400px;
}

.display { font-family: var(--font-display); text-transform: uppercase; line-height: .88; letter-spacing: .005em; }
.heavy { font-family: var(--font-sans); font-weight: 900; font-variation-settings: 'wdth' 112; letter-spacing: -.02em; }
.dek { font-family: var(--font-dek); font-style: italic; }
.label { font-family: var(--font-mono); font-size: .75rem; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; }
.brutal { box-shadow: var(--shadow-brutal); }
.sticker { font-family: var(--font-mono); font-weight: 600; font-size: .75rem; letter-spacing: .14em; text-transform: uppercase;
  display: inline-flex; padding: .5rem 1rem; border: 2px solid var(--ink); border-radius: 999px; color: var(--ink); box-shadow: var(--shadow-brutal-sm); }
`)

writeFileSync(join(KIT, 'tokens/tailwind.preset.cjs'), `// makeyourmindup Tailwind preset, v${VERSION}. Add to presets: [require('./tailwind.preset.cjs')]
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '${C.ink}', deep: '${C['ink-deep']}', soft: '${C['ink-soft']}' },
        mint: '${C.mint}',
        cream: '${C.cream}',
        coral: '${C.coral}',
        butter: '${C.butter}',
        lilac: '${C.lilac}',
      },
      fontFamily: {
        display: ['Anton', 'Arial Narrow', 'sans-serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: { brutal: '6px 6px 0 0 ${C.ink}', 'brutal-sm': '3px 3px 0 0 ${C.ink}' },
      maxWidth: { page: '1400px' },
    },
  },
}
`)

writeFileSync(join(KIT, 'colours/palette.txt'), COLOURS.map(c =>
  `${c.name.padEnd(9)} ${c.hex}  rgb(${hexRgb(c.hex).join(', ')})  ${c.job}`).join('\n') + '\n')

// ---------------------------------------------------------------- fonts
// All four families are Google Fonts under the SIL Open Font License: free to
// use, embed and share, commercially too. The licence travels with each one.
const FONTS = {
  Anton: [['anton/Anton-Regular.ttf', 'Anton-Regular.ttf'], ['anton/OFL.txt', 'OFL.txt']],
  Archivo: [['archivo/Archivo%5Bwdth,wght%5D.ttf', 'Archivo-Variable.ttf'], ['archivo/OFL.txt', 'OFL.txt']],
  Fraunces: [['fraunces/Fraunces-Italic%5BSOFT,WONK,opsz,wght%5D.ttf', 'Fraunces-Italic-Variable.ttf'], ['fraunces/OFL.txt', 'OFL.txt']],
  'IBM-Plex-Mono': ['Regular', 'Medium', 'SemiBold', 'Bold'].map(w => [`ibmplexmono/IBMPlexMono-${w}.ttf`, `IBMPlexMono-${w}.ttf`])
    .concat([['ibmplexmono/OFL.txt', 'OFL.txt']]),
}
const CACHE = resolve('substack-kit/.tmp/brand-fonts')
mkdirSync(CACHE, { recursive: true })
for (const [family, files] of Object.entries(FONTS)) {
  mkdirSync(join(KIT, 'fonts', family), { recursive: true })
  for (const [src, out] of files) {
    const cached = join(CACHE, `${family}-${out}`)
    if (!existsSync(cached)) execFileSync('curl', ['-sS', '-f', '-m', '90', '-o', cached, `https://raw.githubusercontent.com/google/fonts/main/ofl/${src}`])
    copyFileSync(cached, join(KIT, 'fonts', family, out))
  }
}

// ---------------------------------------------------------------- logos
// Three lockups from the Canva exports, via the files the site already uses.
// Clear space is built into every on-ink file. There is no light-background
// version yet: the white type disappears on cream, so none is invented here.
const LOGOS = [
  { src: 'public/brand/masthead.png', slug: 'stacked', pad: 0.25 },
  { src: 'public/brand/wordmark.png', slug: 'horizontal', pad: 0.5 },
  { src: 'public/brand/mark.png', slug: 'mark', pad: 0.25 },
]
for (const l of LOGOS) {
  const dir = join(KIT, 'logos', l.slug)
  mkdirSync(dir, { recursive: true })
  const meta = await sharp(l.src).metadata()
  const pad = Math.round(meta.height * l.pad)
  await sharp(l.src).png({ compressionLevel: 9 }).toFile(join(dir, `makeyourmindup-${l.slug}-transparent.png`))
  await sharp(l.src).resize({ width: 1200 }).png({ compressionLevel: 9 }).toFile(join(dir, `makeyourmindup-${l.slug}-transparent-1200w.png`))
  await sharp(l.src).extend({ top: pad, bottom: pad, left: pad, right: pad, background: C.ink }).flatten({ background: C.ink })
    .png({ compressionLevel: 9 }).toFile(join(dir, `makeyourmindup-${l.slug}-on-ink.png`))
}
const markDir = join(KIT, 'logos', 'mark')
for (const [f, out] of [['app/icon.png', 'makeyourmindup-icon.png'], ['app/apple-icon.png', 'makeyourmindup-apple-icon.png'], ['substack-kit/images/logo-1024.png', 'makeyourmindup-avatar-1024.png']]) {
  copyFileSync(f, join(markDir, out))
}

// ---------------------------------------------------------------- applications
const APPS = [
  ['substack-kit/images/social-preview-1200x630.png', 'social-card-1200x630.png'],
  ['substack-kit/images/cover-1200x1200.png', 'substack-cover-1200x1200.png'],
  ['substack-kit/images/email-banner-1100x220.png', 'email-banner-1100x220.png'],
  ['substack-kit/images/wordmark-transparent-1344x256.png', 'substack-wordmark-1344x256.png'],
]
for (const [f, out] of APPS) copyFileSync(f, join(KIT, 'applications', out))
for (const [f, out] of SHOTS) {
  if (existsSync(f)) copyFileSync(f, join(KIT, 'applications', out))
  else if (kept[out]) writeFileSync(join(KIT, 'applications', out), kept[out])
}

// ---------------------------------------------------------------- the brand book
const subs = SITE.subchannels
const pill = (s, extra = '') => `<span class="pill" style="background:var(--${{ under_the_hood: 'lilac', follow_the_money: 'butter', mind_the_gap: 'coral' }[s.slug]});${extra}">${s.label}</span>`
const sub = slug => subs.find(s => s.slug === slug)
const PAIRS = [
  ['cream', 'ink'], ['mint', 'ink'], ['lilac', 'ink'], ['butter', 'ink'], ['coral', 'ink'],
  ['ink', 'cream'], ['ink', 'mint'], ['ink', 'lilac'], ['ink', 'butter'], ['ink', 'coral'],
]
const strap = (left, right, dark = true) => `<div class="strap ${dark ? '' : 'on-light'}"><span>${left}</span><span>makeyourmindup brand book · v${VERSION}</span><span>${right}</span></div>`
const L = f => `../logos/${f}`

const pages = [
  // 1. Cover
  `<section class="page ink grain">
    ${strap('Vol. 01', 'Issue: brand')}
    <div style="position:absolute;left:80px;top:120px"><img src="${L('stacked/makeyourmindup-stacked-transparent.png')}" style="width:600px"></div>
    <div style="position:absolute;left:80px;bottom:110px">
      <p class="label" style="color:var(--mint)">Brand guidelines</p>
      <h1 class="display" style="font-size:132px;margin-top:18px">The <span class="swipe" style="color:var(--ink)">house</span> style.</h1>
      <p class="dek" style="font-size:30px;margin-top:26px;max-width:760px;color:rgba(244,239,228,.9)">How makeyourmindup looks, sounds and behaves, on every screen it lands on.</p>
    </div>
    <span class="sticker" style="position:absolute;right:120px;top:190px;background:var(--butter);transform:rotate(-8deg)">Free from jargon</span>
    <span class="sticker" style="position:absolute;right:170px;top:270px;background:var(--coral);transform:rotate(5deg)">No added sermons</span>
    <span class="sticker" style="position:absolute;right:110px;top:350px;background:var(--lilac);transform:rotate(-3deg)">Contains British spelling</span>
    <p class="label" style="position:absolute;right:80px;bottom:110px;color:rgba(244,239,228,.7);text-align:right">Version ${VERSION}<br>${DATED}</p>
  </section>`,

  // 2. What it is
  `<section class="page cream halftone on-light">
    ${strap('p. 02', 'What it is', false)}
    <div class="cols" style="top:130px">
      <div style="width:700px">
        <p class="label">The cover story</p>
        <h2 class="display" style="font-size:150px;margin-top:22px">AI,<br><span class="swipe">unpicked.</span></h2>
        <p class="dek" style="font-size:34px;margin-top:34px;line-height:1.25">${SITE.cover.dek}</p>
      </div>
      <div style="width:520px;padding-top:12px">
        <div class="card brutal">
          <p class="label">What it is</p>
          <p class="body">A free publication on how AI really works, in plain English, three times a week. Every written piece is free to read, in full.</p>
        </div>
        <div class="card brutal" style="margin-top:28px">
          <p class="label">How a reader should feel, in order</p>
          <ol class="body ranked">
            <li><b>Entertained</b>, because the accurate line was also the funny one.</li>
            <li><b>Relieved</b> that someone explained it plainly.</li>
            <li><b>Slightly alarmed, and equipped.</b></li>
          </ol>
        </div>
        <div class="card brutal" style="margin-top:28px;background:var(--mint)">
          <p class="label">The one-line brief</p>
          <p class="body">A magazine cover for AI: bold, irreverent and exact. The fun is in the layout and the jokes. The evidence handling is deadly serious.</p>
        </div>
      </div>
    </div>
  </section>`,

  // 3. The name
  `<section class="page ink grain">
    ${strap('p. 03', 'The name')}
    <div class="cols" style="top:130px">
      <div style="width:640px">
        <p class="label" style="color:var(--mint)">In running text</p>
        <p class="heavy" style="font-size:64px;margin-top:20px;color:var(--mint)">makeyourmindup</p>
        <ul class="rules" style="margin-top:36px">
          <li>One word, all lowercase, every time. Even at the start of a sentence.</li>
          <li>The slash in MAKE YOUR MIND/UP lives in the logo only. In words, there is no slash.</li>
          <li>Never abbreviated, never spaced out, never title case.</li>
          <li>The web address is <b>makeyourmindup.ai</b>.</li>
        </ul>
      </div>
      <div style="width:560px">
        <p class="label" style="color:var(--mint)">The three sections, always in this order</p>
        ${['under_the_hood', 'follow_the_money', 'mind_the_gap'].map(k => { const s = sub(k); return `
        <div class="row-sub">${pill(s, 'font-size:22px;padding:.35em .7em')}<span class="label" style="color:rgba(244,239,228,.75)">${s.day}</span></div>
        <p class="dek" style="font-size:24px;margin:10px 0 26px;color:rgba(244,239,228,.9)">${s.coverLine}</p>`}).join('')}
        <ul class="rules">
          <li>Lowercase, joined by dots, in mono. Never capitalised.</li>
          <li>Listed Monday, Wednesday, Friday. Every list, every time.</li>
        </ul>
      </div>
    </div>
  </section>`,

  // 4. Logo
  `<section class="page ink grain">
    ${strap('p. 04', 'The logo')}
    <div style="position:absolute;left:80px;top:120px;right:80px">
      <h2 class="display" style="font-size:96px">Three lockups.<br>One job each.</h2>
      <div class="logo-grid">
        <div class="logo-cell" style="grid-row:span 2"><div class="logo-panel" style="height:420px"><img src="${L('stacked/makeyourmindup-stacked-transparent.png')}" style="width:88%"></div>
          <p class="label" style="color:var(--mint)">Stacked, the primary</p><p class="small">Covers, first screens, anything that gets a big moment. Minimum 160px wide on screen.</p></div>
        <div class="logo-cell"><div class="logo-panel" style="height:150px"><img src="${L('horizontal/makeyourmindup-horizontal-transparent.png')}" style="width:86%"></div>
          <p class="label" style="color:var(--mint)">Horizontal</p><p class="small">Navigation, footers, email headers. Minimum 128px wide.</p></div>
        <div class="logo-cell"><div class="logo-panel" style="height:150px"><img src="${L('mark/makeyourmindup-mark-transparent.png')}" style="height:74%"></div>
          <p class="label" style="color:var(--mint)">The mark</p><p class="small">Avatars, favicons, app icons. Minimum 24px tall.</p></div>
      </div>
      <p class="small" style="margin-top:22px;max-width:1100px"><b>Clear space.</b> Keep a quarter of the logo's height clear on every side of the stacked lockup and the mark, and half its height around the horizontal one. The on-ink files in <span class="mono">logos/</span> already carry it.</p>
    </div>
  </section>`,

  // 5. Logo misuse
  `<section class="page cream on-light halftone">
    ${strap('p. 05', 'The logo, misused', false)}
    <div style="position:absolute;left:80px;top:120px;right:80px">
      <h2 class="display" style="font-size:96px">Hands off the logo.</h2>
      <div class="dont-grid">
        ${[
          ['On a light background', 'The type is white. There is no light version yet, so the logo only sits on ink.', 'background:var(--cream);border:2px solid var(--ink)', ''],
          ['Recoloured', 'The colours are the logo. Never swap them for a section colour.', '', 'filter:hue-rotate(160deg) saturate(1.4)'],
          ['Stretched or squashed', 'Scale it by the corner, never by one side.', '', 'transform:scaleX(1.45)'],
          ['Rotated', 'Stickers tilt. The logo stays level.', '', 'transform:rotate(-9deg)'],
          ['Outlined or glowing', 'No strokes, shadows or effects on the logo itself.', '', 'filter:drop-shadow(0 0 14px #FF6A4D) drop-shadow(0 0 2px #FFD84D)'],
          ['With a tagline bolted on', 'The logo ships alone. Taglines live in the layout.', '', ''],
        ].map(([t, why, panel, img], i) => `
        <div>
          <div class="dont-panel" style="${panel}">
            <img src="${L('horizontal/makeyourmindup-horizontal-transparent.png')}" style="width:74%;${img}">
            ${i === 5 ? '<p class="dek" style="position:absolute;bottom:22px;font-size:20px;color:var(--cream)">the future of everything, today</p>' : ''}
            <span class="stamp" style="position:absolute;top:12px;right:12px;color:var(--coral);border-color:var(--coral);transform:rotate(6deg)">No</span>
          </div>
          <p class="label" style="margin-top:14px">${t}</p><p class="small">${why}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`,

  // 6. Colour
  `<section class="page ink grain">
    ${strap('p. 06', 'Colour')}
    <div style="position:absolute;left:80px;top:120px;right:80px">
      <h2 class="display" style="font-size:96px">Every colour has one job.</h2>
      <div class="swatches">
        ${COLOURS.slice(0, 6).map(c => `
        <div class="swatch brutal-cream" style="background:${c.hex};color:${c.key === 'ink' ? 'var(--cream)' : 'var(--ink)'};${c.key === 'ink' ? 'outline:2px solid rgba(244,239,228,.35);outline-offset:-2px' : ''}">
          <p class="display" style="font-size:52px">${c.name}</p>
          <p class="mono" style="margin-top:auto;font-size:15px">${c.hex}<br>rgb ${hexRgb(c.hex).join(' ')}</p>
          <p class="small" style="margin-top:10px;font-size:15px">${c.job}</p>
        </div>`).join('')}
      </div>
      <div class="support">
        ${COLOURS.slice(6).map(c => `<div style="display:flex;align-items:center;gap:16px"><span style="width:56px;height:56px;background:${c.hex};outline:2px solid rgba(244,239,228,.35)"></span><p class="small"><b>${c.name}</b> <span class="mono">${c.hex}</span><br>${c.job}</p></div>`).join('')}
        <p class="small" style="max-width:420px">The logo carries its own gradient. Never rebuild it from these swatches: always use the logo files.</p>
      </div>
    </div>
  </section>`,

  // 7. Colour rules and contrast
  `<section class="page cream on-light">
    ${strap('p. 07', 'Colour, used properly', false)}
    <div class="cols" style="top:120px">
      <div style="width:560px">
        <h2 class="display" style="font-size:88px">The rules.</h2>
        <ul class="rules" style="margin-top:30px">
          <li><b>Type on a colour block is always ink.</b> Mint, lilac, butter and coral are backgrounds for ink, or accents on ink. Never type on cream.</li>
          <li><b>Mint means the brand and the next action.</b> Buttons, the swipe behind the key word, focus rings.</li>
          <li><b>A section colour means that section.</b> Lilac is under.the.hood and nothing else. Same for butter and coral.</li>
          <li><b>All three together only when listing all three</b>, in day order.</li>
          <li><b>Ink and cream do the heavy lifting.</b> Colour blocks are loud because the rest is quiet.</li>
        </ul>
      </div>
      <div style="width:640px">
        <p class="label">Contrast, checked against WCAG 2.2</p>
        <table class="contrast">
          ${PAIRS.map(([fg, bg]) => { const r = ratio(C[fg], C[bg]); return `<tr><td><span class="chip" style="background:${C[bg]};color:${C[fg]}">Aa ${fg} on ${bg}</span></td><td class="mono">${r.toFixed(1)}:1</td><td class="mono">${grade(r)}</td></tr>` }).join('')}
          <tr class="bad"><td><span class="chip" style="background:${C.cream};color:${C.mint}">Aa mint on cream</span></td><td class="mono">${ratio(C.mint, C.cream).toFixed(1)}:1</td><td class="mono">Never</td></tr>
        </table>
      </div>
    </div>
  </section>`,

  // 8. Type
  `<section class="page ink grain">
    ${strap('p. 08', 'Type')}
    <div style="position:absolute;left:80px;top:110px;right:80px">
      <h2 class="display" style="font-size:88px">Four faces, four roles.</h2>
      <div class="type-grid">
        <div class="type-cell"><p class="label" style="color:var(--mint)">Anton · Display</p><p class="display" style="font-size:112px;margin-top:14px">Real, or<br>theatre?</p>
          <p class="small">Headlines and the splash. Always uppercase, line height 0.88, set big. Rhymes with the logo's condensed caps.</p></div>
        <div class="type-cell"><p class="label" style="color:var(--mint)">Fraunces italic · The dek</p><p class="dek" style="font-size:46px;margin-top:14px;line-height:1.15">We look under the hood, follow the money and mind the gap.</p>
          <p class="small">Standfirsts, captions with a voice, the human line under a loud headline. Italic only.</p></div>
        <div class="type-cell"><p class="label" style="color:var(--mint)">Archivo · Structure and body</p><p style="font-size:26px;margin-top:14px;line-height:1.45">Every AI deal has a bill, and somebody pays it.</p><p class="heavy" style="font-size:54px;margin-top:10px">Subscribe free</p>
          <p class="small">Body copy at 400. <b>Heavy</b> is 900 at width 112: buttons, prices, the wordmark in type.</p></div>
        <div class="type-cell"><p class="label" style="color:var(--mint)">IBM Plex Mono · Labels and data</p><p class="mono up" style="font-size:22px;margin-top:18px;letter-spacing:.14em;line-height:1.7">Mon · Wed · Fri<br>Due 2027-03 · 70% sure<br>under.the.hood</p>
          <p class="small">Labels, dates, section names, stickers, numbers. Uppercase with 0.14em tracking for labels.</p></div>
      </div>
      <p class="small" style="margin-top:18px">All four are Google Fonts under the SIL Open Font License, free for any use. The files and licences are in <span class="mono">fonts/</span>.</p>
    </div>
  </section>`,

  // 9. Hierarchy
  `<section class="page lilac halftone on-light">
    ${strap('p. 09', 'Hierarchy', false)}
    <div class="cols" style="top:120px">
      <div style="width:620px">
        <div class="meta">${pill(sub('under_the_hood'), 'background:var(--ink);color:var(--lilac)')}<span class="label">Mondays</span></div>
        <span class="sticker" style="background:var(--cream);transform:rotate(-3deg);margin-top:22px">Screwdriver included</span>
        <h2 class="display" style="font-size:118px;margin-top:22px">Real, or<br>theatre?<br>We take it apart.</h2>
        <p class="dek" style="font-size:30px;margin-top:22px">How it gets built, and why it works.</p>
      </div>
      <div style="width:560px">
        <table class="scale">
          <tr><td class="label">Label</td><td>Plex Mono 500, 12px, +0.14em, uppercase</td></tr>
          <tr><td class="label">Sticker</td><td>Plex Mono 600 in a pill, 2px ink border, tilted between -8 and +5 degrees</td></tr>
          <tr><td class="label">Splash</td><td>Anton, clamp(3.6rem, 17vw, 8.6rem)</td></tr>
          <tr><td class="label">Headline</td><td>Anton, clamp(2.6rem, 13vw, 5.6rem) on phones, up to 5.6rem on desktop</td></tr>
          <tr><td class="label">Dek</td><td>Fraunces italic 400, 1.25 to 1.5rem</td></tr>
          <tr><td class="label">Body</td><td>Archivo 400, 1rem to 1.125rem, line height 1.5</td></tr>
          <tr><td class="label">Button</td><td>Archivo heavy, uppercase, mint, 6px ink shadow</td></tr>
        </table>
        <p class="small" style="margin-top:22px">Read top to bottom: what section, the tag, the claim, the human line. One loud thing per block, and it is always the headline.</p>
      </div>
    </div>
  </section>`,

  // 10. Components
  `<section class="page cream on-light">
    ${strap('p. 10', 'The kit of parts', false)}
    <div style="position:absolute;left:80px;top:110px;right:80px">
      <h2 class="display" style="font-size:88px">The kit of parts.</h2>
      <div class="parts">
        <div class="part"><div class="demo"><span class="btn">Subscribe free</span></div><p class="label">Primary button</p><p class="small">Mint, heavy caps, 6px hard ink shadow. One per view.</p></div>
        <div class="part"><div class="demo"><div class="brutal" style="background:var(--cream);border:2px solid var(--ink);padding:18px 20px;width:260px"><p class="label">The question</p><p style="font-weight:700;margin-top:8px">Where does the money move?</p></div></div><p class="label">Brutal card</p><p class="small">Square corners, 2px ink border, hard offset shadow. No blur, ever.</p></div>
        <div class="part"><div class="demo"><span class="sticker" style="background:var(--butter);transform:rotate(-6deg)">Bring a calculator</span></div><p class="label">Sticker</p><p class="small">Slapped on, slightly tilted. The voice in miniature.</p></div>
        <div class="part"><div class="demo">${pill(sub('follow_the_money'), 'font-size:18px')}</div><p class="label">Section pill</p><p class="small">Mono, ink on the section colour. Names a section, nothing else.</p></div>
        <div class="part"><div class="demo"><p class="display" style="font-size:44px;white-space:nowrap">AI, <span class="swipe">unpicked.</span></p></div><p class="label">Highlighter swipe</p><p class="small">Mint by default, skewed 8 degrees. One swiped word per headline.</p></div>
        <div class="part"><div class="demo" style="gap:14px"><span class="stamp" style="color:#1d7a55;border-color:#1d7a55;transform:rotate(-4deg)">Real</span><span class="stamp" style="color:var(--coral);border-color:var(--coral);transform:rotate(4deg)">Theatre</span></div><p class="label">Stamp</p><p class="small">3px border, heavy tracking. For verdicts on a part, never on a person.</p></div>
        <div class="part"><div class="demo"><div class="receipt-demo"><p class="label" style="text-align:center">Receipt</p><p class="mono small" style="margin-top:8px">Who paid <span class="leader"></span> ?</p><p class="mono small">Who got paid <span class="leader"></span> ?</p></div></div><p class="label">Receipt</p><p class="small">Till roll with a torn edge. follow.the.money's signature.</p></div>
        <div class="part"><div class="demo" style="overflow:hidden;background:var(--ink);width:100%;justify-content:flex-start"><p class="heavy up" style="white-space:nowrap;color:var(--cream);font-size:24px">under.the.hood · Mondays <span style="color:var(--mint)">✦</span> Free from jargon <span style="color:var(--mint)">✦</span> follow.the.money</p></div><p class="label">Marquee</p><p class="small">A slow ticker between sections. 38 seconds a loop, stills for reduced motion.</p></div>
      </div>
    </div>
  </section>`,

  // 11. Sections
  `<section class="page ink">
    ${strap('p. 11', 'The three sections')}
    <div class="three">
      ${['under_the_hood', 'follow_the_money', 'mind_the_gap'].map(k => { const s = sub(k); const bg = { under_the_hood: 'lilac', follow_the_money: 'butter', mind_the_gap: 'coral' }[k]; const device = { under_the_hood: 'Real or theatre: the shipped thing, apart, every part stamped.', follow_the_money: 'The money map and the receipt: flows between parties, width is the amount.', mind_the_gap: 'Threads on a time axis that bend and meet, ending in a dated call.' }[k]; return `
      <div class="third halftone on-light" style="background:var(--${bg})">
        <p class="label">${s.day}</p>
        <p class="pill" style="background:var(--ink);color:var(--${bg});font-size:20px;margin-top:14px">${s.label}</p>
        <h3 class="display" style="font-size:62px;margin-top:26px">${s.headline.join('<br>')}</h3>
        <p class="dek" style="font-size:24px;margin-top:18px">${s.oneLiner}</p>
        <div class="card brutal" style="margin-top:auto"><p class="label">The question</p><p style="font-weight:700;margin-top:8px;font-size:17px">${s.question}</p></div>
        <p class="small" style="margin-top:22px"><b>Its device.</b> ${device}</p>
      </div>` }).join('')}
    </div>
  </section>`,

  // 12. Texture, layout, motion
  `<section class="page ink grain">
    ${strap('p. 12', 'Texture, layout, motion')}
    <div style="position:absolute;left:80px;top:120px;right:80px">
      <h2 class="display" style="font-size:88px">Printed, not rendered.</h2>
      <div class="tri">
        <div><div class="tex grain" style="background:var(--ink-soft)"></div><p class="label" style="color:var(--mint)">Grain</p><p class="small">Fractal noise at 7% on every dark block, so ink reads as paper, not a screen.</p></div>
        <div><div class="tex halftone" style="background:var(--butter)"></div><p class="label" style="color:var(--mint)">Halftone</p><p class="small">Ink dots on a 14px grid over colour blocks. Printed-page texture, felt more than seen.</p></div>
        <div><div class="tex" style="background:var(--cream);display:flex;align-items:center;justify-content:center"><span class="sticker" style="background:var(--coral);transform:rotate(-8deg)">-8°</span><span class="sticker" style="background:var(--lilac);transform:rotate(5deg);margin-left:12px">+5°</span></div><p class="label" style="color:var(--mint)">Tilt</p><p class="small">Stickers and receipts tilt between -8 and +5 degrees. Type, logos and layout never tilt.</p></div>
      </div>
      <div class="tri" style="margin-top:40px">
        <div><p class="label" style="color:var(--mint)">Layout</p><p class="small">Pages max out at 1400px. Gutters are 16px on phones, 24px on tablets, 40px on desktop. Sections are full-bleed colour blocks.</p></div>
        <div><p class="label" style="color:var(--mint)">Alignment</p><p class="small">Side-by-side spreads align row for row: label, tag, headline, dek, figure, caption, question. Nothing runs off a phone screen, at any text size.</p></div>
        <div><p class="label" style="color:var(--mint)">Motion</p><p class="small">Things arrive as you scroll: slide, drop, slap. Nothing moves for its own sake. With reduced motion switched on, everything holds still.</p></div>
      </div>
    </div>
  </section>`,

  // 13. Voice
  `<section class="page butter halftone on-light">
    ${strap('p. 13', 'Voice', false)}
    <div class="cols" style="top:120px">
      <div style="width:600px">
        <h2 class="display" style="font-size:96px">The house rules.</h2>
        <p class="dek" style="font-size:30px;margin-top:22px;line-height:1.3">Plain English. If jargon sneaks in, we translate it on the spot. No sermons: we show our working, and you make your mind up.</p>
        <ul class="rules" style="margin-top:30px">
          <li>Every number names whoever produced it.</li>
          <li>British spelling, obviously.</li>
          <li>No em dashes. No exclamation marks.</li>
          <li>Misses go up as big as hits.</li>
          <li>The joke points at the hype, never the reader. The joke is never the finding.</li>
        </ul>
      </div>
      <div style="width:580px">
        <div class="card brutal"><p class="label">Sounds like us</p>
          <p class="body">"Every AI deal has a bill, and somebody pays it."</p>
          <p class="body">"Every part gets a stamp, real or theatre."</p>
          <p class="body">"This page hasn't made its mind up."</p></div>
        <div class="card brutal" style="margin-top:26px;background:var(--cream)"><p class="label">Never sounds like</p>
          <p class="body">A warm-up paragraph about how fast everything is moving.</p>
          <p class="body">A closing moral telling the reader what to think.</p>
          <p class="body">A vendor pitch, or a word nobody says out loud.</p></div>
        <div class="card brutal" style="margin-top:26px;background:var(--ink);color:var(--cream)"><p class="label" style="color:var(--mint)">Stickers are the voice in miniature</p>
          <p class="body">Food-label parodies, dry and short: Free from jargon. No added sermons. Contains British spelling.</p></div>
      </div>
    </div>
  </section>`,

  // 14. Applications
  `<section class="page ink grain">
    ${strap('p. 14', 'In the wild')}
    <div style="position:absolute;left:80px;top:110px;right:80px">
      <h2 class="display" style="font-size:88px">In the wild.</h2>
      <div class="apps">
        <figure><img src="../applications/website-desktop.png" style="width:100%;height:auto"><figcaption class="label">The cover, makeyourmindup.ai</figcaption></figure>
        <div style="display:flex;flex-direction:column;gap:22px">
          <figure><img src="../applications/social-card-1200x630.png"><figcaption class="label">Social card, 1200 by 630</figcaption></figure>
          <figure><img src="../applications/email-banner-1100x220.png"><figcaption class="label">Email banner, 1100 by 220</figcaption></figure>
          <figure style="flex-direction:row;align-items:end;gap:18px"><img src="../applications/substack-cover-1200x1200.png" style="width:150px;height:150px"><figcaption class="label">Substack cover, 1200 square</figcaption></figure>
        </div>
      </div>
    </div>
  </section>`,

  // 15. Back cover
  `<section class="page ink grain">
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
      <img src="${L('horizontal/makeyourmindup-horizontal-transparent.png')}" style="width:900px">
      <p class="dek" style="font-size:34px;color:rgba(244,239,228,.9)">You make your mind up.</p>
      <p class="label" style="color:var(--mint)">makeyourmindup.ai</p>
    </div>
  </section>`,
]

const FONT_FACES = `
@font-face{font-family:'Anton';src:url(../fonts/Anton/Anton-Regular.ttf)}
@font-face{font-family:'Archivo';src:url(../fonts/Archivo/Archivo-Variable.ttf);font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'Fraunces';src:url(../fonts/Fraunces/Fraunces-Italic-Variable.ttf);font-style:italic;font-weight:100 900}
${['Regular:400', 'Medium:500', 'SemiBold:600', 'Bold:700'].map(p => { const [w, n] = p.split(':'); return `@font-face{font-family:'IBM Plex Mono';src:url(../fonts/IBM-Plex-Mono/IBMPlexMono-${w}.ttf);font-weight:${n}}` }).join('\n')}`

const CSS = `
${FONT_FACES}
:root{${COLOURS.map(c => `--${c.key}:${c.hex}`).join(';')}}
*{margin:0;padding:0;box-sizing:border-box}
html{background:#050908}
body{font-family:Archivo,system-ui,sans-serif;color:var(--cream);-webkit-font-smoothing:antialiased}
.book{display:flex;flex-direction:column;align-items:center;gap:32px;padding:32px 0}
.page{position:relative;width:1440px;height:900px;overflow:hidden;flex:none;transform-origin:top center}
.ink{background:var(--ink)} .cream{background:var(--cream)} .lilac{background:var(--lilac)} .butter{background:var(--butter)}
.on-light{color:var(--ink)}
.display{font-family:Anton,'Arial Narrow',sans-serif;font-weight:400;text-transform:uppercase;line-height:.88;letter-spacing:.005em}
.heavy{font-family:Archivo;font-weight:900;font-variation-settings:'wdth' 112;letter-spacing:-.02em}
.dek{font-family:Fraunces,Georgia,serif;font-style:italic;font-weight:400}
.mono{font-family:'IBM Plex Mono',monospace}
.up{text-transform:uppercase}
.label{font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:.14em;text-transform:uppercase;font-weight:500}
.small{font-size:17px;line-height:1.5;margin-top:8px}
.body{font-size:19px;line-height:1.5;margin-top:10px}
.strap{position:absolute;left:80px;right:80px;top:36px;display:flex;justify-content:space-between;border-top:1px solid rgba(244,239,228,.3);border-bottom:1px solid rgba(244,239,228,.3);padding:10px 0;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:rgba(244,239,228,.75)}
.strap.on-light{border-color:rgba(12,21,18,.3);color:rgba(12,21,18,.75)}
.cols{position:absolute;left:80px;right:80px;display:flex;justify-content:space-between;gap:60px}
.brutal{box-shadow:6px 6px 0 0 var(--ink)} .brutal-cream{box-shadow:6px 6px 0 0 var(--cream)}
.card{border:2px solid var(--ink);background:var(--cream);color:var(--ink);padding:22px 26px}
.swipe{position:relative;z-index:0;white-space:nowrap}
.swipe::before{content:'';position:absolute;inset:20% -.06em 4% -.06em;background:var(--mint);transform:skewX(-8deg) rotate(-1deg);z-index:-1}
.grain::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.halftone{background-image:radial-gradient(rgba(12,21,18,.13) 1.1px,transparent 1.2px);background-size:14px 14px}
.sticker{display:inline-flex;align-items:center;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:15px;letter-spacing:.14em;text-transform:uppercase;padding:10px 20px;border:2px solid var(--ink);border-radius:999px;color:var(--ink);box-shadow:3px 3px 0 0 var(--ink)}
.pill{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);padding:.3em .6em}
.stamp{display:inline-block;font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:15px;letter-spacing:.18em;text-transform:uppercase;border:3px solid;padding:4px 10px}
.btn{display:inline-block;background:var(--mint);color:var(--ink);border:2px solid var(--ink);box-shadow:6px 6px 0 0 var(--ink);padding:14px 26px;font-family:Archivo;font-weight:900;font-variation-settings:'wdth' 112;text-transform:uppercase;font-size:20px}
.rules{list-style:none;display:flex;flex-direction:column;gap:14px;font-size:20px;line-height:1.45}
.rules li{padding-left:28px;position:relative}
.rules li::before{content:'';position:absolute;left:0;top:.5em;width:12px;height:12px;background:var(--mint);border:2px solid var(--ink)}
.on-light .rules li::before{background:var(--ink)}
.ranked{padding-left:26px;display:flex;flex-direction:column;gap:6px}
.row-sub{display:flex;align-items:center;gap:18px;margin-top:22px}
.meta{display:flex;align-items:center;gap:16px}
.logo-grid{display:grid;grid-template-columns:1.25fr 1fr;grid-template-rows:auto auto;gap:26px 40px;margin-top:34px}
.logo-panel{background:var(--ink-deep);outline:2px solid rgba(244,239,228,.2);outline-offset:-2px;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.dont-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px 36px;margin-top:30px}
.dont-panel{position:relative;height:160px;background:var(--ink);display:flex;align-items:center;justify-content:center;overflow:hidden}
.swatches{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:22px;margin-top:34px}
.swatch{height:390px;padding:20px;display:flex;flex-direction:column}
.support{display:flex;gap:44px;align-items:center;margin-top:40px}
.contrast{width:100%;border-collapse:collapse;margin-top:16px}
.contrast td{padding:7px 0;border-bottom:1px solid rgba(12,21,18,.15);font-size:17px}
.contrast .chip{display:inline-block;padding:6px 14px;font-weight:700;font-size:17px;min-width:260px;border:1px solid rgba(12,21,18,.2)}
.contrast .bad td{color:#b3351c}
.type-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px 60px;margin-top:28px}
.type-cell{border-top:2px solid rgba(244,239,228,.25);padding-top:16px}
.scale{width:100%;border-collapse:collapse}
.scale td{padding:12px 0;border-bottom:2px solid rgba(12,21,18,.2);font-size:17px;vertical-align:top}
.scale td.label{width:150px}
.parts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px 34px;margin-top:30px}
.demo{height:150px;display:flex;align-items:center;justify-content:center;background:rgba(12,21,18,.05);border:2px dashed rgba(12,21,18,.18);margin-bottom:14px;padding:10px}
.receipt-demo{background:#fff;color:var(--ink);width:210px;padding:14px 16px 20px;transform:rotate(3deg);filter:drop-shadow(4px 4px 0 var(--ink));-webkit-mask:conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) 50%/16px 100%}
.receipt-demo .small{font-size:13px;margin-top:4px;display:flex;gap:6px}
.leader{flex:1;border-bottom:2px dotted currentColor;opacity:.4;transform:translateY(-.35em)}
.three{position:absolute;left:0;right:0;top:92px;bottom:0;display:grid;grid-template-columns:repeat(3,1fr)}
.third{padding:40px 44px;display:flex;flex-direction:column}
.tri{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:44px;margin-top:30px}
.tex{height:170px;margin-bottom:14px;outline:2px solid rgba(244,239,228,.2);outline-offset:-2px;position:relative}
.apps{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:34px;margin-top:26px;align-items:start}
.apps figure{display:flex;flex-direction:column;gap:10px}
.apps img{width:100%;display:block;outline:2px solid rgba(244,239,228,.2)}
@media screen{.page{box-shadow:0 20px 60px rgba(0,0,0,.5)}}
@page{size:1440px 900px;margin:0}
@media print{html,body{background:none}.book{display:block;padding:0}.page{page-break-after:always;box-shadow:none;transform:none!important;margin:0!important}}
`

const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>makeyourmindup brand book v${VERSION}</title>
<style>${CSS}</style></head>
<body><main class="book">${pages.join('\n')}</main>
<script>
  // Fit the fixed 1440 x 900 pages to any screen. Print is unaffected.
  function fit(){var s=Math.min(1,(innerWidth-32)/1440);document.querySelectorAll('.page').forEach(function(p){p.style.transform='scale('+s+')';p.style.marginBottom=(900*s-900)+'px'})}
  addEventListener('resize',fit);fit()
</script>
</body></html>
`
const bookPath = join(KIT, 'guidelines', 'makeyourmindup-brand-book.html')
writeFileSync(bookPath, html)

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 1504, height: 964 } })
await page.goto(`file://${bookPath}`, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.emulateMedia({ media: 'print' })
await page.pdf({ path: join(KIT, 'guidelines', 'makeyourmindup-brand-book.pdf'), width: '1440px', height: '900px', printBackground: true, preferCSSPageSize: true })
await page.emulateMedia({ media: 'screen' })
mkdirSync(resolve('.review/brand-book'), { recursive: true })
const sections = await page.$$('.page')
for (let i = 0; i < sections.length; i++) {
  await sections[i].screenshot({ path: resolve(`.review/brand-book/p${String(i + 1).padStart(2, '0')}.png`) })
}
await sections[0].screenshot({ path: join(KIT, 'guidelines', 'preview-cover.png') })
const text = await page.evaluate(() => document.body.innerText)
writeFileSync(resolve('.review/brand-book/text.txt'), text)
await browser.close()

// ---------------------------------------------------------------- readme
writeFileSync(join(KIT, 'README.md'), `# makeyourmindup brand kit, v${VERSION}

${DATED}. Everything here is built from the live cover at makeyourmindup.ai by
\`npm run brand-kit\` in \`apps/cover\`, so it matches what readers see.

**Download:** \`makeyourmindup-brand-kit.zip\` in this folder holds all of it.

## Start here

Open \`guidelines/makeyourmindup-brand-book.pdf\`. Fifteen pages: the name, the
logo, colour, type, the kit of parts, the three sections, texture and motion,
voice, and the brand in use.

## What is inside

| Folder | What | Use it for |
|---|---|---|
| \`guidelines/\` | The brand book as PDF and HTML | Briefing anyone who touches the brand |
| \`logos/stacked/\` | The primary lockup, transparent and on ink | Covers, first screens, big moments |
| \`logos/horizontal/\` | The one-line lockup | Navigation, footers, email headers |
| \`logos/mark/\` | The block mark, app icons, a 1024 avatar | Avatars, favicons, social profiles |
| \`colours/\` | Every colour with hex, RGB and its one job | Quick reference |
| \`tokens/\` | CSS variables, JSON tokens, a Tailwind preset | Building anything on screen |
| \`fonts/\` | Anton, Archivo, Fraunces, IBM Plex Mono, each with its licence | Installing the type |
| \`applications/\` | Social card, Substack cover, email banner, site screenshots | Seeing it done right |

## The five rules that matter most

1. The name is one word, all lowercase: makeyourmindup.
2. The sections run under.the.hood, follow.the.money, mind.the.gap. Monday,
   Wednesday, Friday, in that order, every time.
3. Every colour has one job. Type on a colour block is always ink.
4. The logo only sits on ink, level, untouched. A light version does not exist
   yet.
5. No em dashes, no exclamation marks, British spelling, and no sermons.

## Fonts

All four families are Google Fonts under the SIL Open Font License: free to
use, embed and share, commercially too. The licence sits next to each one.
`)

// ---------------------------------------------------------------- zip
const ZIP = join(KIT, `${NAME}.zip`)
rmSync(ZIP, { force: true })
const STAGE = resolve('substack-kit/.tmp/zip-stage')
rmSync(STAGE, { recursive: true, force: true })
mkdirSync(STAGE, { recursive: true })
execFileSync('cp', ['-r', KIT, join(STAGE, NAME)])
execFileSync('zip', ['-q', '-r', '-X', ZIP, NAME], { cwd: STAGE })
rmSync(STAGE, { recursive: true, force: true })
console.log('brand kit built:', KIT)
