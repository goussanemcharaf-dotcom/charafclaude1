// SCENE 10 — «تبعث Link واحد.» One URL. It stretches into the address bar and
// the browser unrolls beneath it (the director draws the window).
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE, lerp } from '../utils/ease.js';
import { icon } from '../components/ui.js';
import { mixed } from '../utils/text.js';
import { SITE_URL } from '../config/creator.js';
import { MERGE } from './Scene09TenLinks.js';

const ADDR = { cx: 596, cy: 632, w: 668, h: 40, fs: 19 };   // browser address field (client-view pose)
const PILL = { cx: 540, cy: 960, w: 640, h: 124, fs: 54 };

export default {
  id: 'S10_OneLink',
  create({ root, ctx }) {
    const L10 = ctx.line('L10');
    const flash = h('div', { class: 's10-flash' });
    const ring = h('div', { class: 's10-ring' });
    const url = h('span', { class: 's10-url' }, SITE_URL);
    const lock = icon('lock', 40, 'var(--accent)');
    const pill = h('div', { class: 's10-pill' }, lock, url);
    const ar = h('div', { class: 's10-ar' }, mixed('تبعث [Link] واحد.'));
    const big = h('div', { class: 's10-big' }, h('span', { class: 'n' }, '1'), h('span', {}, ' LINK'));
    root.append(flash, ring, ar, big, pill);
    const tA = MERGE.t1;
    return {
      update(t) {
        const f = prog(t, tA - 0.04, tA + 0.35);
        pose(flash, { o: t >= tA - 0.04 ? (1 - EASE.premium(f)) * 0.95 : 0, s: 0.6 + f * 1.4 });
        const r = prog(t, tA, tA + 0.8, EASE.premium);
        pose(ring, { s: 0.5 + r * 1.6, o: (1 - r) * 0.6 * (t >= tA ? 1 : 0) });
        const inT = prog(t, 27.99, 28.32, EASE.premium);
        const outT = prog(t, 29.08, 29.3, EASE.glide);
        pose(ar, { y: (1 - inT) * 30 - outT * 20, o: inT * (1 - outT) });
        pose(big, { y: (1 - inT) * 50 - outT * 30, o: inT * (1 - outT), blur: (1 - inT) * 10 });
        // pill: appears from the merge point, then morphs into the address field
        const a = prog(t, tA, tA + 0.42, EASE.premium);
        const m = prog(t, 28.44, 28.86, EASE.glide);
        const cx = lerp(PILL.cx, ADDR.cx, m), cy = lerp(PILL.cy, ADDR.cy, m);
        const w = lerp(PILL.w, ADDR.w, m), hh = lerp(PILL.h, ADDR.h, m);
        css(pill, 'left', `${(cx - w / 2).toFixed(1)}px`); css(pill, 'top', `${(cy - hh / 2).toFixed(1)}px`);
        css(pill, 'width', `${w.toFixed(1)}px`); css(pill, 'height', `${hh.toFixed(1)}px`);
        css(pill, 'borderRadius', `${(hh / 2).toFixed(1)}px`);
        css(url, 'fontSize', `${lerp(PILL.fs, ADDR.fs, m).toFixed(2)}px`);
        const ls = lerp(40, 18, m); css(lock, 'width', `${ls}px`); css(lock, 'height', `${ls}px`);
        css(pill, 'boxShadow', `0 ${lerp(30, 0, m)}px ${lerp(70, 0, m)}px -20px rgba(60,30,160,${lerp(0.35, 0, m)}), 0 0 0 ${lerp(3, 0, m)}px rgba(109,66,229,${lerp(0.9, 0, m)})`);
        pose(pill, { s: t < tA ? 0 : 0.35 + 0.65 * a, o: (t >= tA ? 1 : 0) * (1 - prog(t, 28.88, 28.96)) });
      },
    };
  },
};
