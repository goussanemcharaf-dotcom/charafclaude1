// Export all deliverables.
//   node scripts/export.mjs                 full pipeline
//   node scripts/export.mjs --skip-audio    reuse audio/*.wav
//   node scripts/export.mjs --only master,clean,subs,guide,covers,subtitles
//   node scripts/export.mjs --sub 4         motion-blur sub-frames (default 4, 180° shutter)
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { FFMPEG } from './lib/ffmpeg.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const opt = (k, d) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : d; };
const ONLY = opt('only', 'master,clean,subs,guide,covers,subtitles').split(',');
const SUB = Number(opt('sub', 4));
const TL = JSON.parse(await fs.readFile(path.join(ROOT, 'src/config/timeline.json'), 'utf8'));
const D = (p) => path.join(ROOT, 'deliverables', p);
const run = (cmd, args, o = {}) => { const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...o }); if (r.status) throw new Error(`${cmd} failed`); };
const ff = (...a) => run(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...a]);
const mb = (f) => (fss.statSync(f).size / 1e6).toFixed(1) + ' MB';

for (const d of ['01_master', '02_meta_ads', '03_clean', '04_arabic_subtitles', '05_thumbnail_cover', '12_production_notes']) await fs.mkdir(D(d), { recursive: true });

// ---------------------------------------------------------------- audio
if (!flag('skip-audio')) run('python3', ['scripts/build_audio.py']);
const VO = fss.existsSync(path.join(ROOT, 'audio/mix_vo.wav'));
const AUDIO = path.join(ROOT, VO ? 'audio/mix_vo.wav' : 'audio/mix.wav');
console.log(`audio: ${path.relative(ROOT, AUDIO)}${VO ? ' (with VO)' : ' (music + sound design; VO slot empty)'}`);

// ---------------------------------------------------------------- video
const VCOMMON = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart'];
const blend = SUB > 1 ? [`tmix=frames=${SUB}`, `select='eq(mod(n\\,${SUB})\\,${SUB - 1})'`, 'setpts=N/(30*TB)'] : [];

async function renderVariant(name, query, extra = []) {
  const dir = path.join(ROOT, 'out/frames', name);
  await fs.rm(dir, { recursive: true, force: true });
  run('node', ['scripts/render-frames.mjs', '--out', `out/frames/${name}`, '--fps', String(TL.fps), '--sub', String(SUB), '--shutter', '0.5', ...(query ? ['--query', query] : []), ...extra]);
  return dir;
}
const input = (dir, fps = TL.fps * SUB) => ['-framerate', String(fps), '-i', path.join(dir, '%05d.png')];
const vf = (...f) => ['-vf', [...blend, ...f, 'format=yuv420p'].join(',')];

if (ONLY.includes('master')) {
  const dir = await renderVariant('master', 'captions=designed');
  const master = D('01_master/PremiumPortfolio_Master_9x16_1080x1920.mp4');
  ff(...input(dir), '-i', AUDIO, ...vf(), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-profile:v', 'high', '-level', '5.1', '-tune', 'animation',
    '-g', '60', '-bf', '2', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest', ...VCOMMON, master);
  const meta = D('02_meta_ads/PremiumPortfolio_Meta_Reels_9x16.mp4');
  ff(...input(dir), '-i', AUDIO, ...vf(), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '14M', '-bufsize', '28M', '-profile:v', 'high', '-level', '4.1',
    '-g', '60', '-keyint_min', '30', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest', ...VCOMMON, meta);
  const feed = D('02_meta_ads/PremiumPortfolio_Meta_Feed_4x5.mp4');   // centre crop: everything essential lives in y 285–1635
  ff(...input(dir), '-i', AUDIO, ...vf('crop=1080:1350:0:285'), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '12M', '-bufsize', '24M', '-profile:v', 'high', '-level', '4.1',
    '-g', '60', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2', '-shortest', ...VCOMMON, feed);
  // first frame (what autoplay shows before motion) as a still
  ff('-i', path.join(dir, `${String(Math.floor(SUB / 2)).padStart(5, '0')}.png`), '-frames:v', '1', D('05_thumbnail_cover/FirstFrame_9x16.png'));
  console.log(`✓ master ${mb(master)} · meta 9x16 ${mb(meta)} · meta 4x5 ${mb(feed)}`);
  if (!flag('keep-frames')) await fs.rm(dir, { recursive: true, force: true });
}
if (ONLY.includes('clean')) {
  const dir = await renderVariant('clean', 'captions=none');
  const out = D('03_clean/PremiumPortfolio_Clean_NoCaptions_9x16.mp4');
  ff(...input(dir), '-i', AUDIO, ...vf(), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level', '4.1', '-g', '60',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', ...VCOMMON, out);
  console.log(`✓ clean ${mb(out)}`);
  if (!flag('keep-frames')) await fs.rm(dir, { recursive: true, force: true });
}
if (ONLY.includes('subs')) {
  const dir = await renderVariant('subs', 'captions=standard');
  const out = D('04_arabic_subtitles/PremiumPortfolio_ArabicSubtitles_9x16.mp4');
  ff(...input(dir), '-i', AUDIO, ...vf(), '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-maxrate', '14M', '-bufsize', '28M', '-profile:v', 'high', '-level', '4.1', '-g', '60',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', ...VCOMMON, out);
  console.log(`✓ subtitles ${mb(out)}`);
  if (!flag('keep-frames')) await fs.rm(dir, { recursive: true, force: true });
}
if (ONLY.includes('guide')) {
  // Teleprompter for recording the VO in sync: 3 s count-in, 2-pop at -2 s, bed at -8 dB.
  const dir = path.join(ROOT, 'out/frames/guide');
  await fs.rm(dir, { recursive: true, force: true });
  run('node', ['scripts/render-frames.mjs', '--out', 'out/frames/guide', '--fps', String(TL.fps), '--start', '-3', '--query', 'guide=1&captions=none']);
  const gaudio = path.join(ROOT, 'out/guide_audio.wav');
  ff('-i', path.join(ROOT, 'audio/mix.wav'), '-f', 'lavfi', '-i', 'sine=frequency=1000:duration=0.0333:sample_rate=48000',
    '-filter_complex', '[0:a]volume=-8dB,adelay=3000|3000[bed];[1:a]volume=-12dB,adelay=1000|1000,aformat=channel_layouts=stereo[pop];[bed][pop]amix=inputs=2:normalize=0[a]',
    '-map', '[a]', '-ar', '48000', gaudio);
  const out = D('12_production_notes/VO_Guide_Teleprompter_9x16.mp4');
  ff('-framerate', String(TL.fps), '-i', path.join(dir, '%05d.png'), '-i', gaudio, '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-c:a', 'aac', '-b:a', '160k', '-shortest', ...VCOMMON, out);
  console.log(`✓ VO guide ${mb(out)}`);
  if (!flag('keep-frames')) await fs.rm(dir, { recursive: true, force: true });
}

// ---------------------------------------------------------------- subtitles (SRT / VTT, Arabic)
if (ONLY.includes('subtitles')) {
  const ts = (t, sep) => { const ms = Math.round(t * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}`; };
  const plain = (s) => s.replace(/\[|\]/g, '').replace(/ \/ /g, '\n');
  const RLM = '\u200F';  // right-to-left mark at line start: RTL paragraphs even in LTR-default players
  // one cue per VO phrase, then merge short neighbours within a line so every
  // cue stays on screen >= 1.2 s and within two lines
  const cues = [];
  TL.lines.forEach((l, li) => {
    const group = [];
    l.phrases.forEach((p, pi) => {
      const next = l.phrases[pi + 1] || (TL.lines[li + 1] && TL.lines[li + 1].phrases[0]);
      const end = Math.min(p.t[1] + 0.35, next ? next.t[0] - 0.02 : p.t[1] + 1.2);
      const cur = group[group.length - 1];
      const text = plain(p.text).replace(/\n/g, ' ');
      if (cur && (cur.b - cur.a < 1.2) && (cur.text + ' ' + text).length <= 46) { cur.b = end; cur.text += (cur.text.length > 18 ? '\n' : ' ') + text; }
      else group.push({ a: p.t[0], b: end, text: plain(p.text) });
    });
    cues.push(...group);
  });
  const srt = cues.map((c, i) => `${i + 1}\n${ts(c.a, ',')} --> ${ts(c.b, ',')}\n${c.text.split('\n').map((x) => RLM + x).join('\n')}\n`).join('\n');
  const vtt = 'WEBVTT\n\n' + cues.map((c) => `${ts(c.a, '.')} --> ${ts(c.b, '.')}\n${c.text.split('\n').map((x) => RLM + x).join('\n')}\n`).join('\n');
  await fs.writeFile(D('04_arabic_subtitles/PremiumPortfolio.ar_AR.srt'), '﻿' + srt);
  await fs.writeFile(D('04_arabic_subtitles/PremiumPortfolio.ar.vtt'), vtt);
  console.log(`✓ subtitles: ${cues.length} cues (SRT + VTT)`);
}

// ---------------------------------------------------------------- covers
if (ONLY.includes('covers')) {
  const { chromium } = await import('playwright');
  const { serve } = await import('./serve.mjs');
  const { server, url } = await serve(0);
  const b = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto(`${url}/src/cover.html`); await p.waitForFunction(() => window.__ready); await p.waitForTimeout(200);
  const c916 = D('05_thumbnail_cover/Cover_9x16_1080x1920.png');
  await p.screenshot({ path: c916 });
  await b.close(); server.close();
  ff('-i', c916, '-vf', 'crop=1080:1350:0:285', D('05_thumbnail_cover/Cover_4x5_1080x1350.png'));
  ff('-i', c916, '-vf', 'crop=1080:1440:0:240', D('05_thumbnail_cover/Cover_3x4_GridCrop_1080x1440.png'));
  console.log('✓ covers');
}
console.log('done.');
