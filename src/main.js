// Deterministic renderer: every pixel is a pure function of time t.
// No CSS animations/transitions are used; scenes write styles in update(t).
import timeline from './config/timeline.json' with { type: 'json' };
import { h, show } from './utils/dom.js';
import { SCENES } from './scenes/index.js';
import { Captions } from './components/Captions.js';

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);

const ctx = {
  tl: timeline,
  stage,
  mode: {
    captions: params.get('captions') ?? 'designed', // designed | none | standard
    guide: params.get('guide') === '1',               // teleprompter overlay for VO recording
  },
  shared: {},
  marker: (k) => timeline.markers[k],
  line: (id) => timeline.lines.find((l) => l.id === id),
  phrase: (id, i) => timeline.lines.find((l) => l.id === id).phrases[i],
};

const scenes = SCENES.map((S) => {
  const [a, b] = timeline.scenes[S.id];
  const root = h('div', { class: `layer scene ${S.id}` });
  stage.append(root);
  const inst = S.create({ root, ctx, start: a, end: b });
  return { id: S.id, a, b, root, inst };
});

const captions = Captions(ctx);
stage.append(captions.el);

let overlays = [];
if (ctx.mode.guide) {
  const { Guide } = await import('./components/Guide.js');
  overlays.push(Guide(ctx));
  overlays.forEach((o) => stage.append(o.el));
}

window.renderAt = (t) => {
  // pass 1: visibility (so scenes can measure each other), pass 2: update
  for (const s of scenes) { s.on = t >= s.a && t < s.b; show(s.root, s.on); }
  for (const s of scenes) if (s.on) s.inst.update(t);
  captions.update(t);
  for (const o of overlays) o.update(t);
};

window.__timeline = timeline;
window.__ready = (async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete && i.naturalWidth ? i.decode() : new Promise((r) => { i.onload = () => i.decode().then(r, r); i.onerror = r; })).catch(() => {})));
  window.renderAt(Number(params.get('t') || 0));
  return true;
})();
