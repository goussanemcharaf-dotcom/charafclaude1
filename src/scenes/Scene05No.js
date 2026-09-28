// SCENE 05 — «لا.» Pattern interrupt: freeze, silence, collapse to one violet point.
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE, lerp } from '../utils/ease.js';

export default {
  id: 'S05_No',
  create({ root, ctx }) {
    const F = ctx.marker('freeze'), C0 = ctx.marker('collapseStart'), C1 = ctx.marker('collapseEnd');
    const veil = h('div', { class: 's5-veil' });
    const word = h('span', { class: 's5-la' }, 'لا');
    const dotSlot = h('span', { class: 's5-dotslot' }, '.');
    const no = h('div', { class: 's5-no', dir: 'rtl' }, word, dotSlot);
    const dot = h('div', { class: 's5-dot' });
    const ring = h('div', { class: 's5-ring' });
    root.append(veil, no, ring, dot);
    let home = null;
    const measure = () => {
      const r = dotSlot.getBoundingClientRect(), s = root.getBoundingClientRect();
      if (!r.width) return null;                       // hidden: try again later
      // the full stop's ink sits near the baseline, centred in its advance
      home = { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height * 0.74 };
      ctx.shared.dot = home;
      return home;
    };
    ctx.shared.measureDot = measure;

    return {
      update(t) {
        if (!home) measure();
        if (!ctx.shared.insightDot && ctx.shared.measureInsight) ctx.shared.measureInsight();
        const target = ctx.shared.insightDot || home;       // where the full stop lives next (S06)
        const on = prog(t, F, F + 0.001);
        pose(veil, { o: on * lerp(0.55, 1, prog(t, C0, C1, (x) => x * x)) });
        pose(no, { o: on * (1 - prog(t, C0 + 0.08, C1 - 0.02, EASE.glide)), s: 1 + 0.04 * (1 - prog(t, F, F + 0.18, EASE.premium)) - 0.06 * prog(t, C0, C1, (x) => x * x) });
        const imp = prog(t, C1, C1 + 0.35, EASE.premium);
        const move = prog(t, C1 + 0.12, 15.42, EASE.glide);
        const x = lerp(home.x, target.x, move), y = lerp(home.y, target.y, move);
        const size = lerp(34, ctx.shared.insightDotSize || 34, move);
        pose(dot, { x: x - size / 2, y: y - size / 2, o: t >= F && t < 17.5 ? 1 : 0, s: 1 + 0.35 * Math.sin(Math.min(1, prog(t, C1 - 0.02, C1 + 0.22)) * Math.PI) });
        css(dot, 'width', `${size}px`); css(dot, 'height', `${size}px`);
        pose(ring, { x: home.x - 60, y: home.y - 60, s: 0.3 + 2.6 * imp, o: (1 - imp) * 0.5 * (t >= C1 ? 1 : 0) });
      },
    };
  },
};
