// SCENE 09 — «بدل ما تبعث 10 Links…» ten links crowd the screen, then fuse.
import { h, pose } from '../utils/dom.js';
import { prog, wobble } from '../utils/anim.js';
import { EASE, spring, lerp } from '../utils/ease.js';
import { linkChip, LINKS } from '../components/Chaos.js';
import { mixed } from '../utils/text.js';

export const MERGE = { x: 540, y: 960, t0: 27.45, t1: 27.98 };

export default {
  id: 'S09_TenLinks',
  create({ root, ctx }) {
    const L9 = ctx.line('L9');
    const t0 = L9.start;
    const ar = h('div', { class: 's9-ar' }, mixed('بدل ما تبعث'));
    const big = h('div', { class: 's9-big' }, h('span', { class: 'n' }, '10'), h('span', {}, ' LINKS'));
    const spots = [[70, 640, -6], [560, 610, 5], [300, 735, 3], [40, 850, -3], [600, 820, -5], [240, 950, 6], [640, 1030, 2], [60, 1100, -4], [380, 1160, 4], [560, 1250, -2]];
    const chips = LINKS.map((u, i) => {
      const el = linkChip(u);
      const [x, y, r] = spots[i];
      Object.assign(el.style, { left: `${x}px`, top: `${y}px`, zIndex: 10 + i });
      root.append(el);
      return { el, x, y, r, at: t0 - 0.12 + i * 0.075, seed: i * 3.7 };
    });
    root.append(ar, big);
    return {
      update(t) {
        const inH = prog(t, t0 - 0.15, t0 + 0.35, EASE.premium);
        const outH = prog(t, 27.86, 27.99, EASE.glide);
        pose(ar, { y: (1 - inH) * 30 - outH * 30, o: inH * (1 - outH), blur: outH * 8 });
        pose(big, { y: (1 - inH) * 50 - outH * 40, o: inH * (1 - outH), blur: (1 - inH) * 10 + outH * 10 });
        const m = prog(t, MERGE.t0, MERGE.t1, EASE.suck);
        for (const c of chips) {
          const d = t - c.at;
          if (d < 0) { pose(c.el, { o: 0 }); continue; }
          const sp = spring(d, { freq: 2.6, zeta: 0.55 });
          const cx = c.x + c.el.offsetWidth / 2, cy = c.y + 35;
          const jx = wobble(t * 2.2, c.seed) * 10, jy = wobble(t * 2.2, c.seed + 9) * 8;
          const ang = (c.seed * 57) % 360;
          const fromX = Math.cos(ang) * 420, fromY = Math.sin(ang) * 420;
          const dx = lerp((1 - sp) * fromX + jx, MERGE.x - cx, m);
          const dy = lerp((1 - sp) * fromY + jy, MERGE.y - cy, m);
          pose(c.el, { x: dx, y: dy, r: lerp(c.r + (1 - sp) * 20, c.r + 180 * (c.seed % 2 ? 1 : -1), m), s: (0.7 + 0.3 * sp) * (1 - 0.92 * m), o: prog(d, 0, 0.06) * (1 - prog(t, MERGE.t1 - 0.08, MERGE.t1)), blur: 6 * m });
        }
      },
    };
  },
};
