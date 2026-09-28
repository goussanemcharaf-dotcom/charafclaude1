// SCENE 06 — «خدمتك تستاهل Presentation أحسن.» The violet point waits as the
// full stop of the sentence; words arrive with controlled, blur-to-sharp rises.
import { h, pose } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE } from '../utils/ease.js';

export default {
  id: 'S06_Insight',
  create({ root, ctx }) {
    const L6 = ctx.line('L6');
    const [tA, tB, tC] = L6.phrases.map((p) => p.t[0]);
    const tD = tC + 0.5;                                  // «أحسن»
    const w1 = h('span', { class: 's6-w' }, 'خدمتك');
    const w2 = h('span', { class: 's6-w' }, 'تستاهل');
    const w3 = h('span', { class: 's6-en' }, 'Presentation');
    const w4 = h('span', { class: 's6-w s6-acc' }, 'أحسن');
    const slot = h('span', { class: 's6-slot' }, '.');
    const block = h('div', { class: 's6-block' },
      h('div', { class: 's6-l1', dir: 'rtl' }, w1, w2),
      h('div', { class: 's6-l2' }, w3),
      h('div', { class: 's6-l3', dir: 'rtl' }, w4, slot));
    root.append(block);
    const words = [[w1, tA], [w2, tB], [w3, tC], [w4, tD]];
    const measure = () => {
      const r = slot.getBoundingClientRect(), s = root.getBoundingClientRect();
      if (!r.width) return null;                       // hidden: try again later
      ctx.shared.insightDot = { x: r.left - s.left + r.width * 0.5, y: r.top - s.top + r.height * 0.735 };
      ctx.shared.insightDotSize = 26;
      return ctx.shared.insightDot;
    };
    ctx.shared.measureInsight = measure;
    const out0 = 17.3;
    return {
      update(t) {
        if (!ctx.shared.insightDot) measure();
        words.forEach(([w, at], i) => {
          const e = prog(t, at - 0.06, at + 0.55, EASE.premium);
          const o = prog(t, out0 + i * 0.02, out0 + 0.16 + i * 0.02, EASE.glide);
          pose(w, { y: (1 - e) * 60 - o * 50, o: e * (1 - o), blur: (1 - e) * 16 + o * 6 });
        });
      },
    };
  },
};
