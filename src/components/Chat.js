// WhatsApp-inspired chat window (original drawing; no logos or assets).
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { spring } from '../utils/ease.js';
import { icon, img } from './ui.js';
import { FILETYPE } from './Icons.js';

const time = (s) => h('span', { class: 'ct-time' }, s, h('span', { class: 'ct-ticks' }, icon('checks', 20, '#53BDEB')));

export function bubble(kind, data = {}) {
  let body;
  if (kind === 'video') body = h('div', { class: 'cb-media' }, img(data.img), h('div', { class: 'cb-play' }, icon('play', 34, '#fff')), h('div', { class: 'cb-dur' }, icon('video', 20, '#fff'), data.dur || '0:18'), time(data.at || '10:42'));
  else if (kind === 'text') body = h('div', { class: 'cb-text', dir: 'rtl' }, data.text, time(data.at || '10:42'));
  else if (kind === 'file') { const ft = FILETYPE[data.type] || FILETYPE.pdf; body = h('div', { class: 'cb-file' }, h('div', { class: 'cf-row' }, h('div', { class: 'cf-badge', style: { background: ft.c } }, ft.t), h('div', { class: 'cf-meta' }, h('b', {}, data.name), h('span', {}, data.size || '')), h('div', { class: 'cf-dl' }, icon('download', 24, '#54656F'))), time(data.at || '10:43')); }
  else if (kind === 'voice') body = h('div', { class: 'cb-voice' }, h('div', { class: 'cv-play' }, icon('play', 30, '#54656F')), h('div', { class: 'cv-wave' }, ...Array.from({ length: 28 }, (_, i) => h('i', { style: { height: `${20 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 80}%` } }))), h('div', { class: 'cv-av' }, icon('mic', 22, '#fff')), h('span', { class: 'cv-dur' }, data.dur || '0:42'), time(data.at || '10:44'));
  else if (kind === 'link') body = h('div', { class: 'cb-link' }, h('div', { class: 'cl-card' }, h('div', { class: 'cl-fav' }, icon('folder', 26, '#5F6368')), h('div', { class: 'cl-meta' }, h('b', {}, data.title), h('span', {}, data.host))), h('div', { class: 'cl-url' }, data.url), time(data.at || '10:44'));
  else if (kind === 'in') body = h('div', { class: 'cb-text', dir: data.dir || 'ltr' }, data.text, h('span', { class: 'ct-time' }, data.at || '10:47'));
  return h('div', { class: `cb ${kind === 'in' ? 'in' : 'out'}` }, body);
}

export function ChatWindow({ w = 560, h: hh = 900, name = 'Client', status = 'online' } = {}) {
  const list = h('div', { class: 'cw-list' });
  const el = h('div', { class: 'cw', style: { width: `${w}px`, height: `${hh}px` } },
    h('div', { class: 'cw-head' }, icon('back', 30, '#54656F'), h('div', { class: 'cw-av' }, 'C'), h('div', { class: 'cw-id' }, h('b', {}, name), h('span', {}, status)), h('div', { class: 'cw-acts' }, icon('video', 30, '#54656F'), icon('phone', 28, '#54656F'), icon('moreV', 28, '#54656F'))),
    h('div', { class: 'cw-body' }, list),
    h('div', { class: 'cw-comp' }, icon('plus', 30, '#54656F'), h('div', { class: 'cw-input' }, 'Message'), icon('mic', 30, '#54656F')));
  const items = [];
  return {
    el, list,
    add(b, at, instant = false) { list.append(b); items.push({ b, at, instant }); return b; },
    update(t) {
      let scroll = 0;
      for (const it of items) {
        const p = t - it.at;
        if (p < 0) { css(it.b, 'display', 'none'); continue; }
        css(it.b, 'display', '');
        const s = it.instant ? 1 : spring(p, { freq: 3.2, zeta: 0.62 });
        pose(it.b, { s: 0.55 + 0.45 * s, o: it.instant ? 1 : prog(p, 0, 0.08), origin: it.b.classList.contains('in') ? '0% 100%' : '100% 100%' });
      }
      const body = list.parentElement;
      const over = list.scrollHeight - body.clientHeight + 16;
      if (over > 0) scroll = over;
      css(list, 'transform', `translateY(${-scroll}px)`);
    },
  };
}
