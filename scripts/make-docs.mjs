// Generates the data-driven documents from the live config, so documentation
// can never drift from the edit:  07 scene timeline · 11 sound cue sheet.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TL = JSON.parse(await fs.readFile(path.join(ROOT, 'src/config/timeline.json'), 'utf8'));
const SND = JSON.parse(await fs.readFile(path.join(ROOT, 'src/config/sound.json'), 'utf8'));
const D = (p) => path.join(ROOT, 'deliverables', p);
const f2 = (t) => t.toFixed(2);
const plain = (s) => s.replace(/\[|\]/g, '').replace(/ \/ /g, ' ');

// Narrative windows (what the viewer experiences); render windows overlap for transitions.
const NARR = { S01_Hook: [0, 4.0], S02_OldWay: [4.0, 8.2], S03_Chaos: [8.2, 10.9], S04_Client: [10.9, 14.45], S05_No: [14.45, 15.3], S06_Insight: [15.3, 17.45], P_Product: [17.45, 21.6], S08_System: [21.6, 26.25], S09_TenLinks: [26.25, 27.98], S10_OneLink: [27.98, 29.3], S11_ClientView: [29.3, 32.0], S12_Payoff: [32.0, 34.0], S13_CTA: [34.0, 36.3] };
const SCENES = [
  ['S01_Hook', '01', 'This is for you', 'Identity hook: the four creator roles roll through one focus line and stack above it, dimmed; the media card changes with each role (product UGC, desert film, studio mic, lifestyle post).'],
  ['S02_OldWay', '02', 'The old way', 'The card is "sent" and lands in a WhatsApp-style chat as a video bubble. Files, a voice note, a Drive link and a WeTransfer link follow. A Drive-style window slams in. Folder joke: FINAL v2 / FINAL FINAL / FINAL (use this one).'],
  ['S03_Chaos', '03', 'Videos / Files / Links', 'Rhythmic fragmentation: three clusters land on «هنا» with black sticker labels, then a flood of screenshots, toasts, folders and links. The camera pushes in and the shake rises.'],
  ['S04_Client', '04', 'The client has to search', 'Client POV: a tagged "Client" cursor clicks and hits «Access required», a 48 MB download, a loading PDF, and a search that returns «No results». The questions Who are you? / What do you offer? / Where\'s the best work? pile up.'],
  ['S05_No', '05', '«لا.»', 'Freeze frame and hard audio cut. «لا.» slams in over the dimmed chaos. Everything collapses into its violet full stop, which ripples once and then waits.'],
  ['S06_Insight', '06', 'Better presentation', '«خدمتك تستاهل Presentation أحسن.» Controlled blur-to-sharp reveals, word by word. The violet point is the sentence\'s full stop.'],
  ['P_Product', '07', 'I build it', 'The full stop grows into a browser window. Grid lines draw in, «Lina» is typed, the hero assembles, and the Contact button takes the violet accent. The camera pulls back to the whole page on an isometric diagonal.'],
  ['S08_System', '08', 'Your world, organized', 'The camera dives into Work, glides to Services and then About. Style fan: three creators get three different sites (Voice-Over, UGC, Filmmaker). Pull back: one experience.'],
  ['S09_TenLinks', '09', '10 links', '«بدل ما تبعث 10 LINKS»: ten real-looking URLs crowd the frame, jitter, and spiral into the centre.'],
  ['S10_OneLink', '10', 'One link', 'Flash. One pill: yourname.com. «1 LINK». The URL stretches into the browser\'s address bar and the window unrolls beneath it.'],
  ['S11_ClientView', '11', 'The client opens it', 'The client clicks, the page loads, and a calm scroll follows. The three questions from Scene 04 come back answered: Who you are ✓ / Your best work ✓ / What you offer ✓.'],
  ['S12_Payoff', '12', 'The payoff', 'The page rises as an opaque, full-bleed sheet with a slow push-in. «خلي خدمتك تبان كيما تستاهل.»'],
  ['S13_CTA', '13', 'CTA', 'PREMIUM WEBSITE PORTFOLIO — «راسلني ونبداو.» A message composer types «سلام! حاب Portfolio تاعي 👋» and the send button is tapped. One action.'],
];

// scene → VO lines overlapping its window
const vo = (a, b) => TL.lines.filter((l) => l.start >= a - 0.01 && l.start < b).map((l) => `${l.id}: ${plain(l.text)}`).join('<br>');

let md = `# 07 — Scene Timeline\n\nGenerated from \`src/config/timeline.json\` by \`scripts/make-docs.mjs\`. **Total duration ${TL.duration}s @ ${TL.fps} fps** (${Math.round(TL.duration * TL.fps)} frames, 1080×1920).\n\n`;
md += `## Scenes\n\n| # | Scene | Time (s) | VO | Picture | Render window |\n|---|---|---|---|---|---|\n`;
for (const [id, n, name, desc] of SCENES) {
  const [a, b] = NARR[id];
  const [ra, rb] = TL.scenes[id];
  md += `| ${n} | ${name} | ${f2(a)}–${f2(b)} | ${vo(a, b) || '—'} | ${desc} | ${f2(ra)}–${f2(rb)} |\n`;
}
md += `\nScene windows overlap on purpose: that is where the transitions happen. Chaos layers (S02–S04) stay alive until the collapse at ${TL.markers.collapseEnd}s. \`P_Product\` is the single camera path for the website (S07–S11).\n\n`;
md += `## Markers\n\n| Marker | Time (s) | Meaning |\n|---|---|---|\n| freeze | ${f2(TL.markers.freeze)} | «لا.»: picture freezes, all audio cut |\n| collapseStart | ${f2(TL.markers.collapseStart)} | collapse into the violet point begins (audio: reverse swell) |\n| collapseEnd | ${f2(TL.markers.collapseEnd)} | point alone on white; deep impact |\n| insightStart | ${f2(TL.markers.insightStart)} | insight typography begins |\n\n`;
md += `## Voice-over cue sheet (phrase level)\n\nThese are target times for a natural Algerian Darija read. Record against \`12_production_notes/VO_Guide_Teleprompter_9x16.mp4\`, then fine-tune these numbers to the real take and re-render.\n\n| Line | Phrase | In (s) | Out (s) | Dur | On-screen treatment |\n|---|---|---|---|---|---|\n`;
for (const l of TL.lines) for (const p of l.phrases) {
  const how = l.caption ? `Designed caption (${l.pos}, ${l.tone}${l.panel ? ', frosted panel' : ''})` : 'Carried by scene typography';
  md += `| ${l.id} | ${plain(p.text)} | ${f2(p.t[0])} | ${f2(p.t[1])} | ${f2(p.t[1] - p.t[0])} | ${how} |\n`;
}
md += `\n## Freeze-frame tests (brief §41)\n\n| Time | Question | Answer on screen |\n|---|---|---|\n| 3.0 s | Is this for creators? | UGC CREATOR / CONTENT CREATOR / VOICE OVER stacked, with a content card showing each role |\n| 10.0 s | Is the problem recognizable? | WhatsApp chat, Drive window, «Videos هنا / Files هنا / Links هنا» stickers, FINAL FINAL folders |\n| 18.0 s | Does the viewer get that I BUILD premium portfolio websites? | Caption «أنا نبنيلك Premium Website Portfolio» over a browser being built from scratch |\n| 27.0 s | Is ONE LINK understood? | «بدل ما تبعث 10 LINKS» with ten URLs on screen → 28.1 s «1 LINK» + yourname.com |\n| Last frame | Does the viewer know what to do? | PREMIUM WEBSITE PORTFOLIO — «راسلني ونبداو.» and a message composer with the send button tapped |\n`;
await fs.mkdir(D('07_scene_timeline'), { recursive: true });
await fs.writeFile(D('07_scene_timeline/Scene_Timeline.md'), md);
await fs.copyFile(path.join(ROOT, 'src/config/timeline.json'), D('07_scene_timeline/timeline.json'));

// ---------------- 11 sound cue sheet
const group = (t) => {
  for (const [id, n, name] of SCENES.slice().reverse()) if (t >= NARR[id][0]) return `${n} ${name}`;
  return '01';
};
let sd = `| Time (s) | Scene | Cue | Level (dBFS pre-master) | Pan |\n|---|---|---|---|---|\n`;
for (const c of SND.cues) sd += `| ${f2(c.t)} | ${group(c.t)} | ${c.type}${c.pitch ? ` ×${c.pitch}` : ''}${c.dur ? ` (${c.dur}s)` : ''} | ${c.gain} | ${c.pan ?? 0} |\n`;
await fs.mkdir(D('11_sound_design'), { recursive: true });
await fs.writeFile(D('11_sound_design/Sound_Cue_Sheet.md'), `# Sound cue sheet\n\nGenerated from \`src/config/sound.json\` (${SND.cues.length} cues). The score is described in \`Sound_Design_Notes.md\`.\n\n${sd}`);
console.log('✓ docs: 07 timeline, 11 cue sheet');
