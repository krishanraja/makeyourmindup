import { chromium, devices } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  viewport: { width: 393, height: 852 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
await page.goto('https://www.makeyourmindup.ai/', { waitUntil: 'networkidle' });
await new Promise(r => setTimeout(r, 3000));

const els = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (!el.textContent || el.textContent.trim().length === 0) return;
    if (el.children.length > 0) return; // leaf-ish
    const cs = window.getComputedStyle(el);
    out.push({
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().slice(0, 60),
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      opacity: cs.opacity,
      transform: cs.transform,
      clipPath: cs.clipPath,
      cls: el.className?.toString().slice(0, 80),
    });
  });
  return out.sort((a,b) => a.y - b.y);
});
console.log(JSON.stringify(els, null, 2));
await browser.close();
