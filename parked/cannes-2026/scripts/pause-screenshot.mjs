import { chromium, devices } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  ...devices['iPhone 14 Pro'],
  viewport: { width: 393, height: 852 },
  ignoreHTTPSErrors: true,
  reducedMotion: 'no-preference',
});
const page = await ctx.newPage();
await page.goto('https://www.makeyourmindup.ai/', { waitUntil: 'networkidle' });
await new Promise(r => setTimeout(r, 2200));

await page.getByRole('button', { name: 'Show me' }).click();
await new Promise(r => setTimeout(r, 500));

// Drag Q1
const s1 = await page.locator('[role="slider"]').first().boundingBox();
await page.mouse.move(s1.x + s1.width * 0.5, s1.y + s1.height * 0.5);
await page.mouse.down();
await page.mouse.move(s1.x + s1.width * 0.7, s1.y + s1.height * 0.5, { steps: 5 });
await page.mouse.up();
await page.getByRole('button', { name: 'Next' }).click();
await new Promise(r => setTimeout(r, 500));

await page.getByText('Thinking. The deep work I never get to.').click();
await new Promise(r => setTimeout(r, 700));

const s2 = await page.locator('[role="slider"]').first().boundingBox();
await page.mouse.move(s2.x + s2.width * 0.5, s2.y + s2.height * 0.5);
await page.mouse.down();
await page.mouse.move(s2.x + s2.width * 0.6, s2.y + s2.height * 0.5, { steps: 5 });
await page.mouse.up();
await page.getByRole('button', { name: 'Next' }).click();
await new Promise(r => setTimeout(r, 500));

await page.getByText('A hybrid. Humans and agents working as one team.').click();
await new Promise(r => setTimeout(r, 700));

await page.locator('input[type="text"]').fill('Whether to rebuild the team around AI');
await page.getByRole('button', { name: 'Done' }).click();

// Now we're on the pause screen. Capture multiple beats.
console.log('Captured pause screen states:');
const timestamps = [200, 1500, 3800, 7500];
for (const t of timestamps) {
  await new Promise(r => setTimeout(r, t === timestamps[0] ? t : t - timestamps[timestamps.indexOf(t) - 1]));
  const path = `/tmp/mm-screens-v3/pause-t${t}ms.png`;
  await page.screenshot({ path });
  console.log(`  ${path}`);
}

await browser.close();
