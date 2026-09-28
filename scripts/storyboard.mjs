// 06 — Storyboard: renders one key frame per scene from the real film and lays
// them out with VO / picture / motion / sound notes → PDF + PNG.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'deliverables/06_storyboard');
const FR = path.join(OUT, 'frames');
await fs.mkdir(FR, { recursive: true });
const TL = JSON.parse(await fs.readFile(path.join(ROOT, 'src/config/timeline.json'), 'utf8'));
const vo = (id) => TL.lines.find((l) => l.id === id).text;

const S = [
  { n: '01', name: 'This is for you', t: 3.6, time: '0:00–0:04', vo: vo('L1'), pic: 'Kinetic role roll on one focus line, older roles stacked above and dimmed. A tilted content card changes to match each role.', motion: 'Blur-to-sharp rises; the card wipes up per role.', sound: 'Air swell · 112 BPM pulse · swipe per role' },
  { n: '02', name: 'The old way', t: 7.9, time: '0:04–0:08', vo: vo('L2'), pic: 'The card lands in a WhatsApp-style chat as a video bubble. Files, voice note, Drive and WeTransfer links. A Drive window. FINAL v2 / FINAL FINAL / FINAL (use this one).', motion: 'Springy pops; Drive slams in; the chat slides aside.', sound: 'Message pops · window slam · notification · comic slaps' },
  { n: '03', name: 'Videos / Files / Links', t: 10.6, time: '0:08–0:11', vo: vo('L3'), pic: 'Three clusters land with black sticker labels, then a flood of debris.', motion: 'Fast arrivals with overshoot; push-in; shake rises.', sound: 'Thwips · sticker slaps · panned pop flood' },
  { n: '04', name: 'The client has to search', t: 13.9, time: '0:11–0:14', vo: vo('L4'), pic: 'Client POV: «Access required», stalled download, loading PDF, «No results». Who are you? / What do you offer? / Where\'s the best work?', motion: 'Erratic cursor; modals pop; agitation peaks.', sound: 'Clicks · denied buzz · typing · question tones · riser' },
  { n: '05', name: '«لا.»', t: 14.6, time: '0:14.5–0:15', vo: vo('L5'), pic: 'Freeze frame. «لا.» over the dimmed chaos, then everything collapses into its violet full stop.', motion: 'Hard freeze → cubic implosion → a single point.', sound: 'TRUE SILENCE · reverse swell · deep impact' },
  { n: '06', name: 'Better presentation', t: 17.1, time: '0:15–0:17', vo: vo('L6'), pic: '«خدمتك تستاهل / Presentation / أحسن.» The violet point is the full stop.', motion: 'Word-by-word blur-to-sharp, no overshoot.', sound: 'Warm Dmaj9 pad · soft air' },
  { n: '07', name: 'I build it', t: 19.4, time: '0:17–0:21', vo: vo('L7'), pic: 'The full stop grows into a browser. Grid, nav, «Lina» typed, AMRANI, showreel; Contact turns violet. Pull back to the whole page.', motion: 'Glide growth; staged build; isometric pull-back.', sound: 'Bloom · glass chime · keystrokes · sparkle · long whoosh' },
  { n: '08', name: 'Your world, organized', t: 24.4, time: '0:21–0:26', vo: vo('L8'), pic: 'Dive into Work → Services → About. Three creators, three different sites. Pull back: one experience.', motion: 'Controlled camera glides; card fan out and in.', sound: 'Swishes · groove with felt keys' },
  { n: '09', name: '10 links', t: 27.3, time: '0:26–0:28', vo: vo('L9'), pic: '«بدل ما تبعث 10 LINKS». Ten real-looking URLs crowd the frame.', motion: 'Jitter, then a spiral merge to the centre.', sound: 'Groove drops out · pops · riser' },
  { n: '10', name: 'One link', t: 28.2, time: '0:28–0:29', vo: vo('L10'), pic: 'Flash. yourname.com. «1 LINK». The URL stretches into the address bar; the window unrolls.', motion: 'Signature morph: pill → address bar → browser.', sound: 'THE chime: latch click + bell chord + sub' },
  { n: '11', name: 'The client opens it', t: 31.3, time: '0:29–0:32', vo: vo('L11'), pic: 'Client clicks; the page loads; calm scroll. The questions come back answered ✓ ✓ ✓.', motion: 'Unhurried scroll; checks rise in.', sound: 'Click · load blip · ascending positive ticks' },
  { n: '12', name: 'The payoff', t: 33.6, time: '0:32–0:34', vo: vo('L12'), pic: 'The page rises full-bleed over the browser; slow push-in. «خلي خدمتك تبان كيما تستاهل.»', motion: 'Opaque sheet rise; 2% push-in; the ad breathes.', sound: 'Fullest voicing + airy octave pad' },
  { n: '13', name: 'CTA', t: 36.2, time: '0:34–0:36', vo: vo('L13'), pic: 'PREMIUM WEBSITE PORTFOLIO. «راسلني ونبداو.» A composer types «سلام! حاب Portfolio تاعي 👋» and send is tapped.', motion: 'Words rise; the composer springs in; the send tap ripples.', sound: 'Soft impact · final chime · send pop' },
];

const { server, url } = await serve(0);
const b = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`${url}/src/index.html`);
await p.waitForFunction(() => window.__ready !== undefined); await p.evaluate(() => window.__ready);
for (const s of S) {
  await p.evaluate((t) => window.renderAt(t), s.t);
  await p.screenshot({ path: path.join(FR, `S${s.n}.jpg`), type: 'jpeg', quality: 88 });
}
await p.close();

const iso = (x) => x.replace(/«([^»]+)»/g, '<bdi dir="auto">«$1»</bdi>');
const card = (s) => `<article><div class="fr"><img src="frames/S${s.n}.jpg"></div><div class="tx">
  <div class="hd"><span class="n">${s.n}</span><b>${s.name}</b><span class="tm">${s.time}</span></div>
  <p class="vo" dir="rtl">${s.vo.replace(/([A-Za-z0-9][A-Za-z0-9 .]*[A-Za-z0-9]|[A-Za-z0-9])/g, '<bdi>$1</bdi>')}</p>
  <dl><dt>Picture</dt><dd>${iso(s.pic)}</dd><dt>Motion</dt><dd>${iso(s.motion)}</dd><dt>Sound</dt><dd>${iso(s.sound)}</dd></dl></div></article>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/fonts/fonts.css"><style>
  @page { size: 1754px 2480px; margin: 0 }
  body { margin: 0; background: #FAFAF8; font-family: Inter; color: #0E0E12; width: 1754px; }
  header { padding: 60px 70px 10px; display: flex; align-items: flex-end; justify-content: space-between; }
  header h1 { margin: 0; font: 800 58px 'Inter Tight'; letter-spacing: -0.04em; } header h1 i { font: italic 400 62px 'Instrument Serif'; color: #6D42E5; letter-spacing: 0 }
  header p { margin: 0; color: #4A4A55; font-size: 19px; text-align: right; line-height: 1.5 }
  .arc { margin: 20px 70px 30px; padding: 16px 22px; border-radius: 16px; background: #fff; box-shadow: 0 0 0 1px #E4E4E8; font-size: 18px; color: #4A4A55 }
  .arc b { color: #0E0E12 } .arc span { color: #6D42E5; font-weight: 700 }
  main { display: grid; grid-template-columns: repeat(2, 1fr); gap: 26px; padding: 0 70px 60px; }
  article { display: flex; gap: 18px; background: #fff; border-radius: 20px; padding: 16px; box-shadow: 0 0 0 1px #E4E4E8, 0 16px 40px -28px rgba(30,20,60,.35); break-inside: avoid; }
  .fr { flex: none; width: 170px; height: 302px; border-radius: 12px; overflow: hidden; box-shadow: 0 0 0 1px #E4E4E8 } .fr img { width: 100%; height: 100%; object-fit: cover; display: block }
  .tx { flex: 1; min-width: 0 } .hd { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px }
  .hd .n { font: 800 26px 'Inter Tight'; color: #6D42E5 } .hd b { font: 700 24px 'Inter Tight'; letter-spacing: -0.02em } .hd .tm { margin-left: auto; font-size: 15px; color: #8E8E99; font-variant-numeric: tabular-nums }
  .vo { margin: 0 0 10px; font: 600 19px/1.5 'Readex Pro'; padding: 10px 12px; border-radius: 10px; background: #F5F2FE }
  dl { margin: 0; display: grid; grid-template-columns: 70px 1fr; gap: 5px 10px; font-size: 14.5px; line-height: 1.4 } dt { color: #8E8E99; font-weight: 600 } dd { margin: 0; color: #2a2a33 }
</style></head><body>
<header><h1>Storyboard — <i>Premium Website Portfolio</i></h1><p>Vertical Meta ad · 1080×1920 · 30 fps · ${TL.duration}s<br>Frames rendered from the final film</p></header>
<div class="arc"><b>Arc:</b> creator → scattered work → confusion → <span>«لا.»</span> → the point grows into a website → your work, services, info, style → 10 links → <span>1 link</span> → the client understands in one visit → <span>«راسلني ونبداو.»</span></div>
<main>${S.map(card).join('')}</main></body></html>`;
await fs.writeFile(path.join(OUT, 'storyboard.html'), html.replace(/\/fonts\/fonts\.css/, '../../fonts/fonts.css'));
const page = await b.newPage({ viewport: { width: 1754, height: 2480 } });
await page.goto(`${url}/deliverables/06_storyboard/storyboard.html`);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
const fullH = await page.evaluate(() => document.documentElement.scrollHeight);
await page.addStyleTag({ content: `@page { size: 1754px ${fullH}px; margin: 0 }` });
await page.pdf({ path: path.join(OUT, 'Storyboard.pdf'), width: '1754px', height: `${fullH}px`, printBackground: true, pageRanges: '1' });
await page.screenshot({ path: path.join(OUT, 'Storyboard.png'), fullPage: true });
await b.close(); server.close();
console.log('✓ storyboard: PDF + PNG + 13 frames');
