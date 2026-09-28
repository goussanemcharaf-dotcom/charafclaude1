// SCENE 11 — «يفتحه الـClient… ويشوف Portfolio احترافي ومختلف.»
// The client opens the one link; the questions from Scene 04 come back answered.
import { h, pose } from '../utils/dom.js';
import { prog, keys } from '../utils/anim.js';
import { EASE, spring } from '../utils/ease.js';
import { Cursor, icon } from '../components/ui.js';

export default {
  id: 'S11_ClientView',
  create({ root, ctx }) {
    const cursor = Cursor({ size: 60 });
    cursor.el.append(h('div', { class: 'c4-tag' }, 'Client'));
    const answers = [['Who you are', 29.98], ['Your best work', 31.0], ['What you offer', 31.55]].map(([txt, at]) => {
      const el = h('div', { class: 's11-ans' }, h('span', { class: 'ok' }, icon('check', 26, '#fff')), txt);
      return { el, at };
    });
    const row = h('div', { class: 's11-row' }, answers.map((a) => a.el));
    root.append(row, cursor.el);
    const px = [[29.12, 1060], [29.34, 640, EASE.snap], [29.62, 640], [30.05, 830, EASE.glide], [31.6, 840], [32.0, 900, EASE.glide]];
    const py = [[29.12, 1500], [29.34, 596, EASE.snap], [29.62, 596], [30.05, 980, EASE.glide], [31.6, 1000], [32.0, 1060, EASE.glide]];
    return {
      update(t) {
        cursor.update(t, keys(t, px), keys(t, py), { o: prog(t, 29.12, 29.22) * (1 - prog(t, 31.95, 32.1)), clicks: [29.36] });
        for (const a of answers) {
          const d = t - a.at;
          const sp = d < 0 ? 0 : spring(d, { freq: 2.4, zeta: 1 });
          pose(a.el, { y: (1 - sp) * 24, s: 0.85 + 0.15 * sp, o: prog(d, 0, 0.12) * (1 - prog(t, 32.0, 32.2)) });
        }
      },
    };
  },
};
