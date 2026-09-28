import { h } from '../utils/dom.js';
import { ICON, CURSOR_SVG } from './Icons.js';
import { pose } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE } from '../utils/ease.js';

export const icon = (name, size = 24, color, extra = {}) =>
  h('span', { class: 'ic', html: ICON[name], style: { width: `${size}px`, height: `${size}px`, color, ...extra } });

export const img = (name, cls = '') => h('img', { class: `ph ${cls}`, src: `./assets/generated/${name}.jpg`, alt: '' });

// Pointer with click ripple. update(t, x, y, clicks[]) — clicks are times.
export function Cursor({ size = 58, z = 60 } = {}) {
  const el = h('div', { class: 'cursor', style: { width: `${size}px`, height: `${size * 40 / 28}px`, zIndex: z } });
  const ring = h('div', { class: 'cursor-ring' });
  const arrow = h('div', { class: 'cursor-arrow', html: CURSOR_SVG });
  el.append(ring, arrow);
  return {
    el,
    update(t, x, y, { o = 1, clicks = [], s = 1 } = {}) {
      let press = 0, rp = -1;
      for (const c of clicks) {
        const d = t - c;
        if (d >= -0.06 && d < 0.12) press = Math.max(press, 1 - Math.abs(d - 0.03) / 0.09);
        if (d >= 0 && d < 0.45) rp = d / 0.45;
      }
      pose(el, { x, y, o, s: s * (1 - 0.12 * Math.max(0, press)) , origin: '10% 6%' });
      if (rp >= 0) pose(ring, { s: 0.2 + EASE.premium(rp) * 1.6, o: (1 - rp) * 0.55 });
      else pose(ring, { o: 0 });
    },
  };
}

// Deterministic typing: returns substring of text for time t.
export function typed(text, t, t0, cps = 18) {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * cps)));
  return text.slice(0, n);
}

export const fade = (t, a, b, e = EASE.premium) => prog(t, a, b, e);
