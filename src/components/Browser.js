// Minimal premium browser chrome around a page element.
import { h, css } from '../utils/dom.js';
import { icon, img } from './ui.js';
import { SITE_URL } from '../config/creator.js';
import { VARIANTS } from '../config/creator.js';

export function Browser(page, { url = SITE_URL, theme = 'light', w = 900 } = {}) {
  const load = h('i', { class: 'br-load' });
  const addr = h('div', { class: 'br-addr' }, icon('lock', 18, 'currentColor'), h('span', { class: 'br-url' }, url), load);
  const chrome = h('div', { class: 'br-chrome' },
    h('div', { class: 'br-dots' }, h('i'), h('i'), h('i')),
    h('div', { class: 'br-nav' }, icon('back', 22, 'currentColor'), icon('fwd', 22, 'currentColor')),
    addr, h('div', { class: 'br-side' }, icon('refresh', 20, 'currentColor')));
  const view = h('div', { class: 'br-view' }, page);
  const el = h('div', { class: `br br-${theme}`, style: { width: `${w}px` } }, chrome, view);
  return {
    el, chrome, view, addr, load, page,
    setView(hh) { css(view, 'height', `${hh.toFixed(1)}px`); },
    setScroll(y) { css(page, 'transform', `translateY(${(-y).toFixed(1)}px)`); },
  };
}

export function VariantVoice() {
  const bars = Array.from({ length: 46 }, (_, i) => h('i', { style: { height: `${18 + Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.23 + 1)) * 82}%` } }));
  const page = h('div', { class: 'vv' },
    h('div', { class: 'vv-nav' }, h('b', {}, VARIANTS.voice.first.toUpperCase()), h('span', {}, 'Demos'), h('span', {}, 'Clients'), h('span', { class: 'vv-cta' }, 'Book a session')),
    h('div', { class: 'vv-kick' }, h('i'), `${VARIANTS.voice.role} — AR · FR · EN`),
    h('h1', {}, VARIANTS.voice.first.toUpperCase()),
    h('p', {}, VARIANTS.voice.line),
    h('div', { class: 'vv-wave' }, ...bars),
    h('div', { class: 'vv-row' }, h('span', { class: 'vv-play' }, icon('play', 26, '#0F0E13')), h('b', {}, 'Play demo reel'), h('span', { class: 'vv-t' }, '0:58')),
    h('div', { class: 'vv-img' }, img('mic')));
  return Browser(page, { url: 'yourname.com', theme: 'dark' });
}

export function VariantFilm() {
  const page = h('div', { class: 'vfm' }, img('dunes', 'vfm-bg'),
    h('div', { class: 'vfm-nav' }, h('b', {}, VARIANTS.film.first), h('span', {}, 'Films'), h('span', {}, 'Journal'), h('span', {}, 'Contact')),
    h('div', { class: 'vfm-copy' }, h('h1', {}, VARIANTS.film.first), h('p', {}, `${VARIANTS.film.role} — ${VARIANTS.film.line.toLowerCase()}`),
      h('div', { class: 'vfm-btn' }, icon('play', 22, '#111'), 'Watch the film')));
  return Browser(page, { url: 'yourname.com', theme: 'light' });
}
