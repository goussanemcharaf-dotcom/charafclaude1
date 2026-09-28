// Tuning helper: render the page overview with several camera candidates.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const out = process.argv[2];
const cands = JSON.parse(process.argv[3]);
const { server, url } = await serve(0);
const b = await chromium.launch();
for (const [i, c] of cands.entries()) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.addInitScript((cc) => { globalThis.__OVER = cc; }, c);
  await p.goto(`${url}/src/index.html`);
  await p.waitForFunction(() => window.__ready !== undefined); await p.evaluate(() => window.__ready);
  await p.evaluate(() => window.renderAt(21.55));
  await p.screenshot({ path: `${out}/over${i}.png` });
  await p.close();
}
await b.close(); server.close();
