// PRODUCT DIRECTOR — the portfolio website as one continuous object from its
// birth (S07) to the client's visit (S11). One camera path, keyed to the VO.
//   S07 seed → frontal build → pull back to the whole page (tilted)
//   S08 dive into Work → Services → About → style fan → pull back
//   S09 recede   ·   S10 re-form from the single URL   ·   S11 client scroll
import { h, pose, css } from '../utils/dom.js';
import { prog, keys, wobble } from '../utils/anim.js';
import { EASE, lerp, outCubic, inCubic, inOutCubic } from '../utils/ease.js';
import { Site } from '../components/Site.js';
import { Browser, VariantVoice, VariantFilm } from '../components/Browser.js';
import { CREATOR } from '../config/creator.js';

const HOME = { cx: 540, cy: 1060, s: 1, rx: 0, ry: 0, rz: 0 };
const OVER = Object.assign({ cx: 560, cy: 1050, s: 0.44, rx: 42, ry: 0, rz: -30 }, globalThis.__OVER || {});
const CHROME = 64, VIEW = 936, BW = 900;

// Build schedule (S07): block key -> reveal time.
export const BUILD = {
  nav: 18.3, meta: 19.12, first: 18.45, last: 18.9, role: 19.02, reel: 19.2, scroll: 19.42,
  workTitle: 20.42, card0: 20.5, card1: 20.58, card2: 20.66, card3: 20.74,
  svcTitle: 20.86, svc0: 20.92, svc1: 20.98, svc2: 21.04, svc3: 21.1,
  aboutK: 21.14, aboutP: 21.18, facts: 21.24, contactK: 21.3, contactH: 21.33, contactRow: 21.38, foot: 21.42,
};

const mixPose = (a, b, p) => Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k], b[k], p)]));

export default {
  id: 'P_Product',
  create({ root, ctx }) {
    const site = Site();
    const br = Browser(site.el);
    const vVoice = VariantVoice(), vFilm = VariantFilm();
    const seed = h('div', { class: 'pd-seed' });
    br.el.append(seed);
    const stageEl = h('div', { class: 'pd-stage' }, vVoice.el, vFilm.el, br.el);
    root.append(stageEl);
    ctx.shared.product = { site, br };
    let M = null;
    const measure = () => {
      const s = site.sections;
      M = { full: site.el.offsetHeight, work: s.work.offsetTop, svc: s.services.offsetTop, about: s.about.offsetTop, contact: s.contact.offsetTop };
      ctx.shared.siteMetrics = M;
    };
    const place = (b, P, H, o = 1) => {
      const Ht = CHROME + H;
      pose(b.el, { x: P.cx - 540, y: P.cy - (560 + Ht / 2), s: P.s, rx: P.rx, ry: P.ry, r: P.rz, origin: `${BW / 2}px ${Ht / 2}px`, o });
      b.setView(H);
    };

    // Site build (S07): reveal each block at its time; typing for the name.
    const blockKeys = Object.keys(BUILD);
    function build(t, mode) {
      for (const k of blockKeys) {
        const el = site.byKey[k];
        if (!el) continue;
        if (mode === 'loaded') { pose(el, { o: 1, y: 0 }); continue; }
        const e = prog(t, BUILD[k], BUILD[k] + 0.45, EASE.premium);
        pose(el, { o: e, y: (1 - e) * 40 });
      }
      const name = CREATOR.first;
      const n = mode === 'loaded' ? name.length : Math.max(0, Math.min(name.length, Math.floor((t - BUILD.first) / 0.09) + 1));
      site.nameA.textContent = t < BUILD.first && mode !== 'loaded' ? '' : name.slice(0, n);
      const caret = site.el.querySelector('.st-caret');
      const blink = mode === 'loaded' ? 0 : (t < 19.35 ? (Math.floor(t * 4) % 2 ? 0.25 : 1) : 1 - prog(t, 19.35, 19.5));
      css(caret, 'opacity', String(blink));
      // grid lines: draw in, then retire once the hero stands
      const gl = mode === 'loaded' ? 0 : prog(t, 17.95, 18.3) * (1 - prog(t, 19.55, 19.95));
      css(site.grid, 'opacity', String(gl));
      [...site.grid.children].forEach((ln, i) => css(ln, 'transform', `scaleY(${prog(t, 17.95 + i * 0.018, 18.35 + i * 0.018, EASE.premium).toFixed(3)})`));
      css(site.grid, 'transformOrigin', '50% 0');
      // «من الصفر» — the identity arrives: contact button takes the accent colour
      const acc = mode === 'loaded' ? 1 : prog(t, 19.65, 19.95);
      css(site.el.querySelector('.st-cta'), 'background', acc > 0.5 ? 'var(--accent)' : '#121114');
    }

    const hover = (t, a, b) => {
      const c0 = site.cards[0];
      const im = c0.querySelector('.ph'), bar = c0.querySelector('.st-card-bar'), bi = bar.firstChild;
      const p = prog(t, a, a + 0.3, EASE.premium) * (1 - prog(t, b - 0.15, b));
      pose(im, { s: 1 + 0.06 * p });
      css(bar, 'opacity', String(p));
      css(bi, 'width', `${(prog(t, a, b + 0.6) * 60).toFixed(1)}%`);
    };

    return {
      update(t) {
        if (!M) measure();
        let P = HOME, H = VIEW, scroll = 0, o = 1, mode = 'build';
        let fan = 0;

        if (t < 20.2) {                                   // S07 — seed + frontal build
          P = HOME;
        } else if (t < 21.62) {                           // S07 — pull back to the whole page
          // shrink early, lengthen late: the page never climbs into the caption
          const p = prog(t, 20.2, 21.4);
          P = mixPose(HOME, OVER, EASE.glide(p)); P.s = lerp(HOME.s, OVER.s, outCubic(p)); H = lerp(VIEW, M.full, inCubic(p));
        } else if (t < 22.2) {                            // S08 — dive into Work
          const p = prog(t, 21.62, 22.18);
          P = mixPose(OVER, HOME, EASE.glide(p)); P.s = lerp(OVER.s, HOME.s, inCubic(p));
          H = lerp(M.full, VIEW, outCubic(p)); scroll = lerp(0, M.work, outCubic(p));
        } else if (t < 24.95) {                           // S08 — Work → Services → About, style fan
          scroll = keys(t, [[22.2, M.work], [22.55, M.work], [22.9, M.svc - 20, EASE.glide], [23.2, M.svc - 20], [23.55, M.about - 30, EASE.glide], [23.95, M.about - 30], [24.3, 0, EASE.glide]]);
          fan = prog(t, 23.95, 24.32, EASE.premium) * (1 - prog(t, 24.7, 24.95, EASE.glide));
          const zoom = 1 + 0.025 * prog(t, 22.2, 23.9);
          P = { ...HOME, s: lerp(zoom, 0.335, prog(t, 23.95, 24.32, EASE.premium)), ry: 0 };
          if (t >= 24.7) P = { ...HOME, s: 0.335 };
        } else if (t < 26.25) {                           // S08 — pull back: one experience
          const p = prog(t, 24.95, 25.65);
          const from = { ...HOME, s: 0.335 };
          P = mixPose(from, OVER, EASE.glide(p)); H = lerp(VIEW, M.full, inOutCubic(p)); scroll = 0;
          P = { ...P, cy: P.cy + wobble(t, 4, 0.6) * 6 * p };
        } else if (t < 28.5) {                            // S09 — recede
          const p = prog(t, 26.18, 26.55, EASE.glide);
          P = { ...OVER, s: OVER.s * (1 - 0.3 * p), cy: OVER.cy + 160 * p };
          H = M.full; o = 1 - p;
        } else {                                          // S10/S11 — one link, the client visits
          P = { ...HOME, cy: HOME.cy + 40 }; mode = 'loaded'; o = prog(t, 28.8, 28.86);
          scroll = keys(t, [[30.55, 0], [31.0, M.work - 10, EASE.glide], [31.12, M.work - 10], [31.55, M.svc - 20, EASE.glide]]);
          o *= 1 - prog(t, 32.5, 32.56);                  // covered by the rising payoff sheet
          const rec = prog(t, 32.0, 32.5, EASE.glide);
          P = { ...P, s: 1 - 0.06 * rec, cy: P.cy - 30 * rec };
        }

        place(br, P, H, o);
        build(t, mode);
        hover(t, 22.25, 23.0);

        // S07 seed: the violet point grows into the window
        const seedP = prog(t, 17.47, 18.05, EASE.glide);
        if (!ctx.shared.insightDot && ctx.shared.measureInsight) ctx.shared.measureInsight();
        const dot = ctx.shared.insightDot || { x: 540, y: 1060 };
        const Ht = CHROME + H;
        const lx = dot.x - 90, ly = dot.y - 560, r0 = 13;
        const top = lerp(ly - r0, 0, seedP), left = lerp(lx - r0, 0, seedP);
        const right = lerp(BW - lx - r0, 0, seedP), bottom = lerp(Ht - ly - r0, 0, seedP);
        if (t < 18.0) css(br.el, 'clipPath', `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${lerp(r0, 26, seedP).toFixed(1)}px)`);
        else if (t >= 28.5 && t < 29.35) {                // S10 — body unrolls below the address bar
          const u = prog(t, 28.86, 29.32, EASE.premium);
          css(br.el, 'clipPath', `inset(0px 0px ${((1 - u) * (Ht - CHROME)).toFixed(1)}px 0px round 26px)`);
        } else css(br.el, 'clipPath', 'none');
        pose(seed, { o: 1 - prog(t, 17.66, 17.98) });
        pose(br.chrome, { o: t < 20 ? prog(t, 17.8, 18.1) : t >= 28.5 ? prog(t, 28.8, 28.9) : 1 });
        const siteVis = t < 20 ? prog(t, 17.85, 18.05) : t >= 28.5 ? prog(t, 29.58, 29.9) : 1;
        css(site.el, 'opacity', String(siteVis));
        const lift = t >= 28.5 ? (1 - prog(t, 29.58, 30.05, EASE.premium)) * 40 : 0;
        br.setScroll(scroll - lift);
        css(br.load, 'width', `${(prog(t, 29.38, 29.7, EASE.premium) * 100).toFixed(1)}%`);
        css(br.load, 'opacity', String(1 - prog(t, 29.72, 29.86)));

        // S08 style fan — every creator gets their own site
        [[vVoice, -1], [vFilm, 1]].forEach(([v, side]) => {
          const vp = { cx: 540 + side * 352 * fan, cy: 1060, s: 0.335, rx: 0, ry: -side * 14 * fan, rz: 0 };
          place(v, vp, VIEW, fan > 0.001 ? Math.min(1, fan * 2.5) : 0);
        });
      },
    };
  },
};
