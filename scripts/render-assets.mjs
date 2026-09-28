// Renders the Three.js stills in src/assets3d/shots into src/assets/generated.
// node scripts/render-assets.mjs [shot ...] [--w=1080 --h=1440 --ss=1.5]
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import { FFMPEG } from './lib/ffmpeg.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/assets/generated');
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => a.slice(2).split('=')));
let shots = args.filter((a) => !a.startsWith('--'));
if (!shots.length) shots = (await fs.readdir(path.join(ROOT, 'src/assets3d/shots'))).filter((f) => !f.startsWith('_') && f.endsWith('.js')).map((f) => f.replace('.js', ''));
const W = Number(opt.w || 1080), H = Number(opt.h || 1440), SS = Number(opt.ss || 1.5);

await fs.mkdir(OUT, { recursive: true });
const { server, url } = await serve(0);
const browser = await chromium.launch({ args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const shot of shots) {
  const rw = Math.round(W * SS), rh = Math.round(H * SS);
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on('console', (m) => console.log(`  [${shot}] ${m.text()}`));
  page.on('pageerror', (e) => console.log(`  [${shot}] ERROR ${e}`));
  await page.goto(`${url}/src/assets3d/studio.html?shot=${shot}&w=${rw}&h=${rh}`);
  await page.waitForFunction(() => window.__done, null, { timeout: 600000 });
  const { err, data, ms } = await page.evaluate(() => ({ err: window.__err, data: window.__data, ms: window.__ms }));
  await page.close();
  if (err) { console.error(`✗ ${shot}: ${err}`); continue; }
  const raw = path.join(OUT, `${shot}.raw.png`);
  await fs.writeFile(raw, Buffer.from(data.split(',')[1], 'base64'));
  const out = path.join(OUT, `${shot}.jpg`);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', raw, '-vf', `scale=${W}:${H}:flags=lanczos`, '-q:v', '2', out]);
  await fs.unlink(raw);
  console.log(`✓ ${shot} ${W}x${H} (rendered ${rw}x${rh} in ${(ms / 1000).toFixed(1)}s)`);
}
await browser.close();
server.close();
