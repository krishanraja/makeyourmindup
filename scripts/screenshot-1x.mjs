import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
await page.goto('https://www.makeyourmindup.ai/', { waitUntil: 'networkidle' });
await new Promise(r => setTimeout(r, 3500));
await page.screenshot({ path: '/tmp/mm-screens/v2-threshold-1x.png' });
console.log('saved');
await browser.close();
