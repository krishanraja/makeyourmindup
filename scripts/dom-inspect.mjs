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

const buttons = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).map(b => {
    const r = b.getBoundingClientRect();
    const cs = window.getComputedStyle(b);
    return { text: b.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), opacity: cs.opacity, parent: b.parentElement?.className?.slice(0, 60) ?? '' };
  })
);
console.log(JSON.stringify(buttons, null, 2));
await browser.close();
