import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const URL = process.env.TARGET_URL ?? 'https://www.makeyourmindup.ai/';
const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
try {
  const r = await lighthouse(URL, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    onlyCategories: ['accessibility'],
  });
  const audits = r.lhr.audits;
  for (const id of ['color-contrast', 'aria-prohibited-attr', 'meta-viewport', 'tap-targets', 'button-name']) {
    const a = audits[id];
    if (!a) continue;
    console.log(`\n=== ${id} (score=${a.score}) ===`);
    if (a.details?.items?.length) {
      for (const it of a.details.items.slice(0, 8)) {
        if (it.node) {
          console.log(`  selector: ${it.node.selector}`);
          console.log(`  snippet : ${(it.node.snippet || '').slice(0, 200)}`);
          if (it.node.explanation) console.log(`  why     : ${it.node.explanation}`);
        }
      }
    } else if (a.explanation) {
      console.log(`  ${a.explanation}`);
    }
  }
} finally {
  await chrome.kill();
}
