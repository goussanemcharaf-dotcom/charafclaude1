// Chaos debris: video thumbs, file cards, link chips, screenshots, toasts.
import { h } from '../utils/dom.js';
import { icon, img } from './ui.js';
import { FILETYPE } from './Icons.js';

export const videoThumb = (pic, dur, name) => h('div', { class: 'ch-vid' },
  h('div', { class: 'ch-vid-im' }, img(pic), h('div', { class: 'ch-vid-play' }, icon('play', 30, '#fff')), h('span', { class: 'ch-vid-dur' }, dur)),
  name ? h('div', { class: 'ch-vid-name' }, name) : null);

export const fileCard = (type, name) => {
  const ft = FILETYPE[type];
  return h('div', { class: 'ch-file' }, h('div', { class: 'ch-page' }, h('i', { class: 'fold' }), h('b', { style: { background: ft.c } }, ft.t)), h('span', {}, name));
};

export const linkChip = (url, tone = '') => h('div', { class: `ch-link ${tone}` }, h('span', { class: 'ch-link-ic' }, icon('link', 26, '#5F6368')), h('span', { class: 'ch-link-url' }, url));

export const shot = (pic, label) => h('div', { class: 'ch-shot' }, h('div', { class: 'ch-shot-bar' }, h('span', {}, '9:41'), h('i')), img(pic), label ? h('div', { class: 'ch-shot-lab' }, label) : null);

export const toast = (app, title, body, color = '#25D366') => h('div', { class: 'ch-toast' },
  h('div', { class: 'ch-toast-app', style: { background: color } }, icon(app === 'Drive' ? 'folder' : 'comment', 22, '#fff')),
  h('div', { class: 'ch-toast-tx' }, h('div', { class: 'ch-toast-top' }, h('b', {}, app), h('span', {}, 'now')), h('div', { class: 'ch-toast-title' }, title), body ? h('div', { class: 'ch-toast-body' }, body) : null));

export const folderChip = (name) => h('div', { class: 'ch-folder' }, icon('folder', 34, '#5F6368'), h('span', {}, name));

// Black sticker label: big Latin word + Arabic "هنا".
export const sticker = (latin, arabic = 'هنا') => h('div', { class: 'ch-sticker' },
  h('span', { class: 'ar', dir: 'rtl' }, arabic), h('span', { class: 'en' }, latin));

export const LINKS = [
  'drive.google.com/drive/folders/1Xa9…',
  'we.tl/t-8fK2mZq',
  'wa.me/p/21355…',
  'youtu.be/x8Kq2Lp',
  'instagram.com/yourname',
  'tiktok.com/@yourname',
  'bit.ly/3portf0lio',
  'dropbox.com/s/h7x…/reel.mp4',
  'vimeo.com/8812…',
  'docs.google.com/…/rates',
];
