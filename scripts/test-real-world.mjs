#!/usr/bin/env node
import { chromium, devices } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.env.TARGET_URL ?? 'https://www.makeyourmindup.ai/';
const OUT = process.env.OUT_DIR ?? '/tmp/mm-screens';
const TAG = process.env.TAG ?? 'iphone14';
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const consoleLog = [];
const networkLog = [];

const device = devices['iPhone 14 Pro'];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  ...device,
  viewport: { width: 393, height: 852 },
  reducedMotion: 'no-preference',
  colorScheme: 'dark',
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
page.on('console', (msg) => consoleLog.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => consoleLog.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) =>
  networkLog.push(`[failed] ${req.method()} ${req.url()} :: ${req.failure()?.errorText}`),
);
page.on('response', (res) => {
  if (res.status() >= 400) networkLog.push(`[${res.status()}] ${res.request().method()} ${res.url()}`);
});

const shot = async (name) => {
  await page.screenshot({ path: join(OUT, `${TAG}-${name}.png`), fullPage: false });
  console.log(`  📸 ${TAG}-${name}.png`);
};

const step = async (label, fn) => {
  console.log(`▶ ${label}`);
  try {
    await fn();
  } catch (err) {
    console.log(`  ❌ ${err.message}`);
    await shot(`error-${label.replace(/\s+/g, '-')}`);
    throw err;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await step('load page', async () => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await shot('01-threshold');
  });

  await step('click Show me', async () => {
    await page.getByRole('button', { name: 'Show me' }).click();
    await sleep(700);
    await shot('02-q1-slider');
  });

  await step('drag Q1 slider to ~75%', async () => {
    const slider = page.locator('[role="slider"]').first();
    const box = await slider.boundingBox();
    const startX = box.x + box.width * 0.5;
    const endX = box.x + box.width * 0.75;
    const y = box.y + box.height * 0.5;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 12 });
    await page.mouse.up();
    await sleep(300);
    await shot('02b-q1-dragged');
  });

  await step('submit Q1', async () => {
    await page.getByRole('button', { name: 'Next' }).click();
    await sleep(700);
    await shot('03-q2-cards');
  });

  await step('pick Q2 = think (deep work)', async () => {
    await page.getByText('Thinking. The deep work I never get to.').click();
    await sleep(800);
    await shot('04-q3-slider');
  });

  await step('drag Q3 slider to ~60%', async () => {
    const slider = page.locator('[role="slider"]').first();
    const box = await slider.boundingBox();
    const endX = box.x + box.width * 0.60;
    const y = box.y + box.height * 0.5;
    await page.mouse.move(box.x + box.width * 0.5, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 12 });
    await page.mouse.up();
    await sleep(300);
    await page.getByRole('button', { name: 'Next' }).click();
    await sleep(700);
    await shot('05-q4-cards');
  });

  await step('pick Q4 = hybrid', async () => {
    await page.getByText('A hybrid. Humans and agents working as one team.').click();
    await sleep(800);
    await shot('06-q5-text');
  });

  await step('type Q5 answer', async () => {
    const input = page.locator('input[type="text"]');
    await input.fill('Whether to rebuild the team around AI');
    await sleep(300);
    await shot('07-q5-typed');
    await page.getByRole('button', { name: 'Done' }).click();
    await sleep(500);
    await shot('08-pause');
  });

  await step('wait for result', async () => {
    // Wait up to 20s for "Send" button on the result screen
    await page.waitForSelector('input[type="email"]', { timeout: 20000 });
    await sleep(1500);  // let result animate in
    await shot('09-result-top');
    // Scroll to see the artifact
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(400);
    await shot('09b-result-mid');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(400);
    await shot('09c-result-bottom');
  });

  await step('submit email', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('input[type="email"]').fill('krishanraja@gmail.com');
    await page.getByRole('button', { name: 'Send' }).click();
    await sleep(2000);
    await shot('10-fork-top');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(400);
    await shot('10b-fork-bottom');
  });

  console.log('\n✅ Full flow completed');
} finally {
  console.log('\n=== console events ===');
  for (const l of consoleLog) console.log('  ' + l);
  console.log('\n=== network errors ===');
  for (const l of networkLog) console.log('  ' + l);
  await browser.close();
}
