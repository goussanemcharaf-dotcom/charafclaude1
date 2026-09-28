// Tiny helper: screenshot an HTML file (or URL) with the pre-installed Chromium.
// node scripts/lib/shot.mjs <file.html> <out.png> [width] [height] [fullPage]
import { chromium } from 'playwright';
import path from 'node:path';
const [,, input, out, w = '1080', h = '1920', full = '0'] = process.argv;
const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const url = input.startsWith('http') ? input : 'file://' + path.resolve(input);
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
console.log('saved', out);
