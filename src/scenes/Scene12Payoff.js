// SCENE 12 — «خلي خدمتك تبان كيما تستاهل.» The page, edge to edge, breathing.
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE, lerp, inOutSine } from '../utils/ease.js';
import { Site } from '../components/Site.js';
import { CREATOR } from '../config/creator.js';

export default {
  id: 'S12_Payoff',
  create({ root, ctx }) {
    const L12 = ctx.line('L12');
    const site = Site();
    site.nameA.textContent = CREATOR.first;
    site.el.querySelector('.st-caret').style.display = 'none';
    site.grid.style.display = 'none';
    site.el.querySelector('.st-cta').style.background = 'var(--accent)';
    const sheet = h('div', { class: 's12-sheet' }, site.el);
    const words = ['خلي', 'خدمتك', 'تبان'].map((w) => h('span', { class: 's12-w' }, w));
    const words2 = ['كيما', 'تستاهل.'].map((w) => h('span', { class: 's12-w acc' }, w));
    const text = h('div', { class: 's12-text' }, h('div', { class: 's12-l', dir: 'rtl' }, words), h('div', { class: 's12-l', dir: 'rtl' }, words2));
    root.append(sheet, text);
    const all = [...words, ...words2];
    const times = [0, 0.28, 0.58, 0.9, 1.18].map((d) => L12.start + d);
    const bar = site.el.querySelector('.st-reel');
    return {
      update(t) {
        const a = prog(t, 32.0, 32.52, EASE.premium);
        const out = prog(t, 33.96, 34.3, EASE.glide);
        // the page rises as an opaque sheet over the client's browser, then a slow push-in
        pose(sheet, { y: lerp(1360, 0, a) + out * 1300, o: 1 });
        css(site.el, 'transform', `scale(${(1.2 + 0.045 * prog(t, 32.3, 34.1, inOutSine)).toFixed(4)})`);
        all.forEach((w, i) => {
          const e = prog(t, times[i] - 0.05, times[i] + 0.5, EASE.premium);
          pose(w, { y: (1 - e) * 40 - out * 40, o: e * (1 - out), blur: (1 - e) * 12 });
        });
      },
    };
  },
};
