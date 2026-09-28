// The demo portfolio — the product the ad sells. A complete, custom site:
// hero → selected work → services → about → contact. Built as real HTML at a
// 900px viewport; every block carries a build time for the construction scene.
import { h } from '../utils/dom.js';
import { icon, img } from './ui.js';
import { CREATOR, SITE_URL } from '../config/creator.js';

export function Site() {
  const C = CREATOR;
  const B = (el, key) => { el.dataset.b = key; return el; };
  const nav = B(h('nav', { class: 'st-nav' },
    h('div', { class: 'st-logo' }, h('i', {}, C.first), ' ', C.last),
    h('div', { class: 'st-links' }, h('span', {}, 'Work'), h('span', {}, 'Services'), h('span', {}, 'About')),
    h('div', { class: 'st-cta' }, 'Contact')), 'nav');

  const nameA = h('span', { class: 'st-first' }, '');
  const nameB = h('span', { class: 'st-last' }, C.last.toUpperCase());
  const hero = h('section', { class: 'st-hero' },
    B(h('div', { class: 'st-meta' }, h('span', { class: 'st-status' }, h('i'), C.status), h('span', {}, `${C.city} — worldwide`)), 'meta'),
    h('h1', { class: 'st-name' }, B(h('div', { class: 'st-l1' }, nameA, h('b', { class: 'st-caret' })), 'first'), B(h('div', { class: 'st-l2' }, nameB), 'last')),
    B(h('p', { class: 'st-role' }, `${C.role} — ${C.niche.toLowerCase()}.`), 'role'),
    B(h('div', { class: 'st-reel' }, img('serum'), h('div', { class: 'st-reel-ui' }, h('span', { class: 'st-reel-play' }, icon('play', 26, '#111')), h('span', {}, 'Showreel 2026'), h('span', { class: 'st-reel-t' }, '0:45'))), 'reel'),
    B(h('div', { class: 'st-scroll' }, h('span', {}, '(01)'), 'Selected work', icon('arrowR', 22, '#111', { transform: 'rotate(90deg)' })), 'scroll'));

  const cards = C.work.map((w, i) => B(h('article', { class: 'st-card' },
    h('div', { class: 'st-card-im' }, img(w.img), h('span', { class: 'st-card-len' }, icon('play', 14, '#fff'), w.len), h('div', { class: 'st-card-bar' }, h('i'))),
    h('div', { class: 'st-card-tx' }, h('b', {}, w.title), h('span', {}, w.kind))), `card${i}`));
  const work = h('section', { class: 'st-work' },
    B(h('div', { class: 'st-h2' }, h('h2', {}, 'Selected work'), h('sup', {}, `(${String(C.work.length).padStart(2, '0')})`)), 'workTitle'),
    h('div', { class: 'st-grid' }, cards));

  const services = h('section', { class: 'st-services' },
    B(h('div', { class: 'st-h2' }, h('h2', {}, 'Services'), h('sup', {}, '(04)')), 'svcTitle'),
    ...C.services.map(([n, t, d], i) => B(h('div', { class: 'st-svc' }, h('span', { class: 'n' }, n), h('div', { class: 'tx' }, h('b', {}, t), h('span', {}, d)), h('span', { class: 'go' }, icon('arrowUR', 30, 'currentColor'))), `svc${i}`)));

  const about = h('section', { class: 'st-about' },
    B(h('div', { class: 'st-kicker' }, '(03) About'), 'aboutK'),
    B(h('p', { class: 'st-state' }, 'I make brands feel ', h('em', {}, 'human'), ' — honest, scroll-stopping content, shot and edited in Algiers.'), 'aboutP'),
    B(h('div', { class: 'st-facts' },
      h('div', {}, h('span', {}, 'Based in'), h('b', {}, `${C.city}, Algeria`)),
      h('div', {}, h('span', {}, 'Languages'), h('b', {}, C.langs)),
      h('div', {}, h('span', {}, 'Clients'), h('b', {}, 'Worldwide, remote'))), 'facts'));

  const contact = h('section', { class: 'st-contact' },
    B(h('div', { class: 'st-kicker' }, '(04) Contact'), 'contactK'),
    B(h('h3', { class: 'st-big' }, 'Let’s create ', h('em', {}, 'together.')), 'contactH'),
    B(h('div', { class: 'st-row' }, h('div', { class: 'st-btn' }, 'Start a project', icon('arrowR', 26, '#fff')), h('span', { class: 'st-mail' }, `hello@${SITE_URL}`)), 'contactRow'),
    B(h('footer', { class: 'st-foot' }, h('span', {}, `© 2026 ${C.first} ${C.last}`), h('span', {}, 'Instagram · TikTok · LinkedIn')), 'foot'));

  const grid = h('div', { class: 'st-gridlines' }, ...Array.from({ length: 13 }, () => h('i')));
  const el = h('div', { class: 'site' }, nav, hero, work, services, about, contact, grid);
  const blocks = [...el.querySelectorAll('[data-b]')];
  const byKey = Object.fromEntries(blocks.map((b) => [b.dataset.b, b]));
  return { el, blocks, byKey, nameA, nameB, cards, grid, sections: { hero, work, services, about, contact } };
}
