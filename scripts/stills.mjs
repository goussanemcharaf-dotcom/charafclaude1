// QA tool: render stills at given times.  node scripts/stills.mjs out/dir 0 1.5 3 ...
// Also accepts ranges: 8:11:0.5  (start:end:step)
import fs from 'node:fs/promises';
import path from 'node:path';
import { openAd, renderAt } from './lib/browser.mjs';

const [dir, ...specs] = process.argv.slice(2);
const times = [];
for (const s of specs) {
  if (s.includes(':')) { const [a, b, st] = s.split(':').map(Number); for (let t = a; t <= b + 1e-9; t += st) times.push(+t.toFixed(3)); }
  else times.push(Number(s));
}
await fs.mkdir(dir, { recursive: true });
const { page, close } = await openAd();
for (const t of times) {
  await renderAt(page, t);
  const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
  await page.locator('#stage').screenshot({ path: f });
  console.log(f);
}
await close();
