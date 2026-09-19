import lighthouse from 'lighthouse';
import { launch as launchChrome } from 'chrome-launcher';

const URL = process.env.TARGET_URL ?? 'https://www.makeyourmindup.ai/';

const chrome = await launchChrome({
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--ignore-certificate-errors'],
});
try {
  const result = await lighthouse(URL, {
    port: chrome.port,
    output: 'json',
    logLevel: 'error',
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
      disabled: false,
    },
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 750,
    },
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const cats = result.lhr.categories;
  console.log(`Performance:    ${Math.round(cats.performance.score * 100)}`);
  console.log(`Accessibility:  ${Math.round(cats.accessibility.score * 100)}`);
  console.log(`Best Practices: ${Math.round(cats['best-practices'].score * 100)}`);
  console.log(`SEO:            ${Math.round(cats.seo.score * 100)}`);
  console.log('');
  console.log('Top audits below 90:');
  for (const cat of Object.values(cats)) {
    for (const ref of cat.auditRefs) {
      const a = result.lhr.audits[ref.id];
      if (a.scoreDisplayMode === 'binary' || a.scoreDisplayMode === 'numeric') {
        if (a.score !== null && a.score < 0.9) {
          console.log(`  [${Math.round(a.score * 100)}] ${a.id}: ${a.title}`);
        }
      }
    }
  }
} finally {
  await chrome.kill();
}
