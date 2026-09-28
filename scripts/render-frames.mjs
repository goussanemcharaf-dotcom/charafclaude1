// Deterministic frame renderer: N Chromium workers render t = i/fps and write
// a PNG sequence. Usage:
//   node scripts/render-frames.mjs --out out/frames/master [--fps 30] [--workers 4]
//        [--start 0] [--end <duration>] [--query "captions=none"] [--sub 1]
// --sub N renders N sub-frames per frame (for shutter-blur blending in export).
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : '1']] : a), []));
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tl = JSON.parse(await fs.readFile(path.join(ROOT, 'src/config/timeline.json'), 'utf8'));
const fps = Number(args.fps || tl.fps), sub = Number(args.sub || 1), shutter = Number(args.shutter || 0.5);
const start = Number(args.start || 0), end = Number(args.end || tl.duration);
const workers = Number(args.workers || 4);
const out = path.resolve(ROOT, args.out || 'out/frames/master');
const query = args.query ? `?${args.query}` : '';
await fs.mkdir(out, { recursive: true });

const total = Math.round((end - start) * fps) * sub;
const jobs = Array.from({ length: total }, (_, i) => i);
const { server, url } = await serve(0);
const t0 = Date.now();
let done = 0;

async function worker(k) {
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(`[w${k}] ${e}`));
  await page.goto(`${url}/src/index.html${query}`);
  await page.waitForFunction(() => window.__ready !== undefined);
  await page.evaluate(() => window.__ready);
  for (let j = k; j < total; j += workers) {
    // sub-frames spread symmetrically over the shutter interval (motion blur)
    const i = Math.floor(j / sub), k = j % sub;
    // clamp to the film: a sub-frame before the start would average in an empty stage
    const t = Math.min(end, Math.max(start, start + i / fps + (sub > 1 ? ((k - (sub - 1) / 2) / sub) * (shutter / fps) : 0)));
    await page.evaluate((tt) => window.renderAt(tt), t);
    await page.screenshot({ path: path.join(out, `${String(j).padStart(5, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    done++;
    if (done % 60 === 0) {
      const el = (Date.now() - t0) / 1000;
      process.stdout.write(`  ${done}/${total} frames · ${(done / el).toFixed(1)} fps · eta ${((total - done) / (done / el)).toFixed(0)}s\n`);
    }
  }
  await browser.close();
}
await Promise.all(Array.from({ length: workers }, (_, k) => worker(k)));
server.close();
console.log(`✓ ${total} frames → ${path.relative(ROOT, out)} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
