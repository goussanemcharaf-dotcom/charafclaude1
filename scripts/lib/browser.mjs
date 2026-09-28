// Shared Playwright launcher for the ad page.
import { chromium } from 'playwright';
import { serve } from '../serve.mjs';

export async function openAd({ query = '' } = {}) {
  const { server, url } = await serve(0);
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${url}/src/index.html${query}`);
  await page.waitForFunction(() => window.__ready !== undefined, null, { timeout: 30000 });
  await page.evaluate(() => window.__ready);
  if (errors.length) console.error('PAGE ERRORS:\n' + errors.join('\n'));
  const close = async () => { await browser.close(); server.close(); };
  return { page, browser, close, errors };
}

export async function renderAt(page, t) {
  await page.evaluate((tt) => window.renderAt(tt), t);
}
