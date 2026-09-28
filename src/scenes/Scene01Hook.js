// SCENE 01 — "THIS IS FOR YOU" (identity hook).
// Kinetic role roll synced to the VO; each role pairs with a content card.
import { h, pose, css } from '../utils/dom.js';
import { prog, wobble } from '../utils/anim.js';
import { EASE, lerp, clamp } from '../utils/ease.js';
import { icon, img } from '../components/ui.js';

const ROLES = ['UGC CREATOR', 'CONTENT CREATOR', 'VOICE OVER', 'INFLUENCER'];
const SLOT_Y = [690, 580, 508, 436];   // focus line, then dimmed history
const SLOT_O = [1, 0.3, 0.2, 0.13];
const BASE = 132, DIM = 58, MAXW = 930;

// Card geometry and the WhatsApp bubble it lands in (shared with Scene 02).
export const CARD = { cx: 540, cy: 1102, w: 500, h: 625 };
export const BUBBLE_THUMB = { cx: 641, cy: 620, w: 310, h: 388 };

function overlayFor(i) {
  if (i === 0) return h('div', { class: 'ov ov-ugc' },
    h('div', { class: 'ov-rail' }, icon('heart', 44, '#fff'), icon('comment', 44, '#fff'), icon('share', 42, '#fff')),
    h('div', { class: 'ov-meta' }, h('b', {}, '@yourname'), h('span', {}, 'Skincare routine · UGC')),
    h('div', { class: 'ov-bar' }, h('i', { class: 'ov-prog' })));
  if (i === 1) return h('div', { class: 'ov ov-cine' },
    h('i', { class: 'vf tl' }), h('i', { class: 'vf tr' }), h('i', { class: 'vf bl' }), h('i', { class: 'vf br' }),
    h('div', { class: 'rec' }, h('i'), 'REC', h('span', { class: 'tc' }, '00:12:04:17')),
    h('div', { class: 'spec' }, '4K · 24 FPS'));
  if (i === 2) return h('div', { class: 'ov ov-vo' },
    h('div', { class: 'vo-top' }, h('i'), 'Voice demo · Brand spot'),
    h('div', { class: 'wave' }, ...Array.from({ length: 34 }, () => h('i'))));
  return h('div', { class: 'ov ov-social' },
    h('div', { class: 'so-top' }, h('i', { class: 'av' }), h('b', {}, 'yourname'), h('span', { class: 'follow' }, 'Follow')),
    h('div', { class: 'so-bot' }, icon('heartFill', 40, '#fff'), icon('comment', 40, '#fff'), icon('share', 38, '#fff')));
}

export default {
  id: 'S01_Hook',
  create({ root, ctx }) {
    root.style.zIndex = 4;   // the card flies over the chat during the hand-off
    const L1 = ctx.line('L1');
    const at = [-0.4, L1.phrases[2].t[0] - 0.06, L1.phrases[3].t[0] - 0.06, L1.phrases[4].t[0] + 0.1];
    const eyebrow = h('div', { class: 's1-eyebrow', dir: 'rtl' }, 'إذا كنت…');
    const roles = ROLES.map((r) => h('div', { class: 's1-role' }, r));
    const stack = h('div', { class: 's1-stack' }, roles);
    const layers = [0, 1, 2, 3].map((i) => {
      const im = img(['serum', 'dunes', 'mic', 'coffee'][i]);
      const ov = overlayFor(i);
      return { el: h('div', { class: 's1-layer' }, im, ov), im, ov };
    });
    const card = h('div', { class: 's1-card' }, layers.map((l) => l.el));
    const shadow = h('div', { class: 's1-shadow' });
    const cardWrap = h('div', { class: 's1-cardwrap' }, shadow, card);
    root.append(eyebrow, stack, cardWrap);
    const waveBars = [...layers[2].ov.querySelectorAll('.wave i')];
    const prog0 = layers[0].ov.querySelector('.ov-prog');
    let fits = null;

    return {
      update(t) {
        if (!fits) fits = roles.map((r) => Math.min(1, MAXW / r.offsetWidth));
        const out = prog(t, 3.98, 4.3, EASE.glide);           // exit / hand-off
        pose(eyebrow, { y: -30 * out, o: 1 - prog(t, 3.86, 4.02) });

        roles.forEach((r, i) => {
          const e = prog(t, at[i], at[i] + 0.5, EASE.premium);
          let lvl = 0;
          for (let j = i + 1; j < 4; j++) lvl += prog(t, at[j], at[j] + 0.5, EASE.premium);
          const k = Math.min(3, Math.floor(lvl)), f = lvl - k;
          const y = lerp(SLOT_Y[k], SLOT_Y[Math.min(3, k + 1)], f);
          const o = lerp(SLOT_O[k], SLOT_O[Math.min(3, k + 1)], f);
          const sc = lerp(fits[i], DIM / BASE, clamp(lvl));
          pose(r, {
            y: y + (1 - e) * 70 - out * 60,
            s: sc * (1 + (1 - e) * 0.04),
            o: e * o * (1 - prog(t, 3.86, 4.02)),
            blur: (1 - e) * 14,
          });
        });

        // content card: wipes between role layers, gentle float, 3D tilt
        layers.forEach((l, i) => {
          if (i === 0) return;
          const e = prog(t, at[i] - 0.02, at[i] + 0.5, EASE.premium);
          css(l.el, 'clipPath', `inset(${((1 - e) * 100).toFixed(2)}% 0 0 0 round 30px)`);
          pose(l.im, { s: 1.14 - 0.14 * e });
        });
        pose(layers[0].im, { s: 1.06 - 0.06 * prog(t, -0.4, 1.2, EASE.premium) });
        css(prog0, 'width', `${(18 + prog(t, 0, 1.4) * 40).toFixed(1)}%`);
        if (t > at[2] - 0.1 && t < 4.4) waveBars.forEach((b, j) => {
          const v = 0.25 + 0.75 * Math.abs(Math.sin(t * 7.3 + j * 0.9) * Math.sin(t * 3.1 + j * 0.37));
          css(b, 'transform', `scaleY(${v.toFixed(3)})`);
        });
        // overlays fade as the card is "sent"
        layers.forEach((l) => pose(l.ov, { o: 1 - prog(t, 3.95, 4.12) }));

        const tx = lerp(0, BUBBLE_THUMB.cx - CARD.cx, out);
        const ty = lerp(0, BUBBLE_THUMB.cy - CARD.cy, out);
        const sc = lerp(1, BUBBLE_THUMB.w / CARD.w, out);
        const intro = prog(t, -0.4, 0.5, EASE.premium);
        pose(cardWrap, {
          x: tx, y: ty + wobble(t, 1, 0.8) * 5 * (1 - out) + (1 - intro) * 40,
          s: sc * (0.96 + 0.04 * intro),
          rx: 5 * (1 - out), ry: -9 * (1 - out) + wobble(t, 3, 0.5) * 2 * (1 - out),
          r: wobble(t, 2, 0.6) * 0.5 * (1 - out),
          o: 1,
        });
        css(card, 'borderRadius', `${lerp(30, 20, out)}px`);
        pose(shadow, { o: (1 - out) * 0.9 });
      },
    };
  },
};
