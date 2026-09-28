// Drive-inspired file browser window (original drawing; no logos or assets).
import { h, pose } from '../utils/dom.js';
import { spring } from '../utils/ease.js';
import { prog } from '../utils/anim.js';
import { icon, img } from './ui.js';

export function DriveWindow({ w = 640, h: hh = 600 } = {}) {
  const grid = h('div', { class: 'dw-grid' });
  const el = h('div', { class: 'dw', style: { width: `${w}px`, height: `${hh}px` } },
    h('div', { class: 'dw-bar' }, h('i', { class: 'd r' }), h('i', { class: 'd y' }), h('i', { class: 'd g' }), h('div', { class: 'dw-url' }, icon('lock', 18, '#5F6368'), 'drive.google.com/drive/folders/1Xa9…')),
    h('div', { class: 'dw-top' }, h('b', {}, 'Drive'), h('div', { class: 'dw-search' }, icon('search', 22, '#5F6368'), 'Search in Drive')),
    h('div', { class: 'dw-crumb' }, 'My Drive', icon('fwd', 18, '#5F6368'), 'Portfolio', icon('fwd', 18, '#5F6368'), h('b', {}, 'FINAL')),
    grid);
  const items = [];
  return {
    el,
    folder(name, at) { const f = h('div', { class: 'dw-f' }, icon('folder', 34, '#5F6368'), h('span', {}, name)); grid.append(f); items.push({ el: f, at }); return f; },
    file(name, pic, at) { const f = h('div', { class: 'dw-file' }, h('div', { class: 'dw-th' }, pic ? img(pic) : icon('file', 40, '#9aa0a6')), h('div', { class: 'dw-fn' }, icon('video', 18, '#E5484D'), h('span', {}, name))); grid.append(f); items.push({ el: f, at }); return f; },
    update(t) {
      for (const it of items) {
        const p = t - it.at;
        pose(it.el, { o: p < 0 ? 0 : prog(p, 0, 0.06), s: p < 0 ? 0.8 : 0.8 + 0.2 * spring(p, { freq: 3.4, zeta: 0.7 }) });
      }
    },
  };
}
