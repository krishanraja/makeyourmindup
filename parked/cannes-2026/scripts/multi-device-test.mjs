import { chromium, devices } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TARGET_URL ?? 'https://www.makeyourmindup.ai/';
const OUT = process.env.OUT_DIR ?? '/tmp/mm-screens-v3';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const TARGETS = [
  { name: 'iphone14', viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'pixel7',   viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'iphonese', viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'desktop',  viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
try {
  for (const t of TARGETS) {
    console.log(`\n=== ${t.name} (${t.viewport.width}x${t.viewport.height}) ===`);
    const ctx = await browser.newContext({
      viewport: t.viewport,
      isMobile: t.isMobile,
      hasTouch: t.hasTouch,
      deviceScaleFactor: t.deviceScaleFactor,
      ignoreHTTPSErrors: true,
      colorScheme: 'dark',
    });
    const page = await ctx.newPage();
    const consoleErrs = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrs.push(m.text()); });
    page.on('pageerror', (e) => consoleErrs.push(`pageerror: ${e.message}`));

    const shot = (n) => page.screenshot({ path: join(OUT, `${t.name}-${n}.png`) });

    try {
      await page.goto(URL, { waitUntil: 'networkidle' });
      await sleep(2500);
      await shot('01-threshold');

      await page.getByRole('button', { name: 'Show me' }).click();
      await sleep(600);
      await shot('02-q1');

      // Drag Q1 to ~70%
      const slider1 = page.locator('[role="slider"]').first();
      const b1 = await slider1.boundingBox();
      await page.mouse.move(b1.x + b1.width * 0.5, b1.y + b1.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(b1.x + b1.width * 0.7, b1.y + b1.height * 0.5, { steps: 10 });
      await page.mouse.up();
      await sleep(200);
      await shot('02b-q1-dragged');

      await page.getByRole('button', { name: 'Next' }).click();
      await sleep(600);
      await shot('03-q2');

      await page.getByText('Doing. The execution that piles up.').click();
      await sleep(700);
      await shot('04-q3');

      const slider2 = page.locator('[role="slider"]').first();
      const b2 = await slider2.boundingBox();
      await page.mouse.move(b2.x + b2.width * 0.5, b2.y + b2.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(b2.x + b2.width * 0.65, b2.y + b2.height * 0.5, { steps: 10 });
      await page.mouse.up();
      await sleep(200);
      await page.getByRole('button', { name: 'Next' }).click();
      await sleep(600);
      await shot('05-q4');

      await page.getByText('A leaner one. Half the headcount, double the output.').click();
      await sleep(700);
      await shot('06-q5');

      await page.locator('input[type="text"]').fill('Which AI tools to actually consolidate');
      await sleep(200);
      await shot('06b-q5-typed');
      await page.getByRole('button', { name: 'Done' }).click();
      await sleep(400);
      await shot('07-pause');

      await page.waitForSelector('input[type="email"]', { timeout: 25000 });
      await sleep(1500);
      await shot('08-result');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await sleep(300);
      await shot('08b-result-mid');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await sleep(300);
      await shot('08c-result-bottom');

      console.log('  ✅ full flow OK');
      if (consoleErrs.length) {
        console.log('  console errors:');
        for (const e of consoleErrs) console.log(`    ${e}`);
      }
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
      await shot('error');
    } finally {
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}
