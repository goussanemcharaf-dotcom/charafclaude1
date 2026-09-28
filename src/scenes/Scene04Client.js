// SCENE 04 — the CLIENT's side: open, scroll, back, search… and still no answer.
import { h, pose, css } from '../utils/dom.js';
import { prog, keys, wobble } from '../utils/anim.js';
import { spring, EASE } from '../utils/ease.js';
import { deskPose, chaosT } from '../components/Desk.js';
import { Cursor, icon, typed } from '../components/ui.js';

const card = (cls, ...kids) => h('div', { class: `c4 ${cls}` }, ...kids);

export default {
  id: 'S04_Client',
  create({ root, ctx }) {
    const L4 = ctx.line('L4');
    const t0 = L4.phrases[0].t[0], t1 = L4.phrases[1].t[0];   // 10.95, 12.45
    const who = t1 + 0.1, what = t1 + 0.95, where = t1 + 1.35;

    const access = card('c4-access', h('div', { class: 'c4-lock' }, icon('lock', 44, '#5F6368')), h('b', {}, 'Access required'), h('p', {}, 'Ask the owner for permission to open “FINAL”.'), h('div', { class: 'c4-btn' }, 'Request access'));
    const dlBar = h('i');
    const download = card('c4-dl', h('div', { class: 'c4-dl-top' }, icon('download', 30, '#1A73E8'), h('b', {}, 'UGC_final_v3.mp4')), h('div', { class: 'c4-track' }, dlBar), h('span', {}, 'Downloading… 48.2 MB · 3 min left'));
    const spin = h('div', { class: 'c4-spin' });
    const pdf = card('c4-pdf', h('div', { class: 'c4-pdf-top' }, h('b', {}, 'rates_2024 (2).pdf'), icon('x', 26, '#666')), h('div', { class: 'c4-pdf-page' }, spin, h('span', {}, 'Loading preview…')));
    const qText = h('span', { class: 'c4-q' });
    const search = card('c4-search', icon('search', 34, '#5F6368'), qText, h('i', { class: 'c4-caret' }));
    const noRes = card('c4-nores', icon('alert', 28, '#B45309'), 'No results for “portfolio”');
    const chips = [['Who are you?', who], ['What do you offer?', what], ['Where’s the best work?', where]].map(([txt, at], i) => {
      const el = h('div', { class: 'c4-chip' }, h('span', { class: 'qm' }, '?'), txt);
      Object.assign(el.style, { left: `${[470, 420, 370][i]}px`, top: `${[318, 408, 498][i]}px` });
      return { el, at };
    });
    Object.assign(access.style, { left: '250px', top: '640px' });
    Object.assign(download.style, { left: '430px', top: '700px' });
    Object.assign(pdf.style, { left: '120px', top: '560px' });
    Object.assign(search.style, { left: '60px', top: '318px' });
    Object.assign(noRes.style, { left: '60px', top: '420px' });

    const cursor = Cursor({ size: 60 });
    const tag = h('div', { class: 'c4-tag' }, 'Client');
    cursor.el.append(tag);
    root.append(access, download, pdf, search, noRes, ...chips.map((c) => c.el), cursor.el);

    // cursor path (client POV): click Drive link → request access → video → PDF → search → frantic
    const clicks = [t0 + 0.28, t0 + 0.78, t0 + 1.2, t1 + 0.28, t1 + 1.02, t1 + 1.22, t1 + 1.42, t1 + 1.58, t1 + 1.74];
    const P = [
      [t0 - 0.15, 1150, 1780], [t0 + 0.25, 250, 830, EASE.snap], [t0 + 0.55, 250, 830], [t0 + 0.75, 540, 905, EASE.snap],
      [t0 + 0.95, 540, 905], [t0 + 1.18, 205, 470, EASE.snap], [t1 + 0.0, 200, 480], [t1 + 0.25, 690, 560, EASE.snap],
      [t1 + 0.45, 690, 560], [t1 + 0.6, 260, 360, EASE.snap], [t1 + 1.0, 270, 355], [t1 + 1.2, 880, 1020, EASE.snap],
      [t1 + 1.4, 180, 700, EASE.snap], [t1 + 1.56, 760, 380, EASE.snap], [t1 + 1.72, 420, 1130, EASE.snap], [t1 + 1.9, 560, 760, EASE.snap],
    ];
    const px = P.map(([tt, x, , e]) => [tt, x, e]), py = P.map(([tt, , y, e]) => [tt, y, e]);
    const pop = (el, at, out = 99, from = 0.7) => ({ el, at, out, from });
    const pops = [pop(access, t0 + 0.34, t0 + 0.86), pop(download, t0 + 1.26), pop(pdf, t1 + 0.34), pop(search, t1 + 0.5), pop(noRes, t1 + 0.98)];

    return {
      update(t) {
        const tc = chaosT(t, ctx);
        pose(root, deskPose(t, ctx, 2));
        for (const p of pops) {
          const d = tc - p.at;
          const sp = d < 0 ? 0 : spring(d, { freq: 3.2, zeta: 0.6 });
          const out = prog(tc, p.out, p.out + 0.14, EASE.glide);
          pose(p.el, { s: (p.from + (1 - p.from) * sp) * (1 - 0.2 * out), o: prog(d, 0, 0.05) * (1 - out) });
        }
        // access modal "denied" shake
        if (tc > t0 + 0.78 && tc < t0 + 0.9) css(access, 'translate', `${Math.sin((tc - t0) * 90) * 10}px 0`); else css(access, 'translate', '0 0');
        css(dlBar, 'width', `${(8 + prog(tc, t0 + 1.3, 14.4) * 14).toFixed(1)}%`);
        css(spin, 'transform', `rotate(${(tc * 540) % 360}deg)`);
        qText.textContent = typed('portfolio', tc, t1 + 0.55, 22);
        for (const c of chips) {
          const d = tc - c.at;
          const sp = d < 0 ? 0 : spring(d, { freq: 2.8, zeta: 0.6 });
          pose(c.el, { y: (1 - sp) * 26, s: 0.8 + 0.2 * sp, o: prog(d, 0, 0.06), r: wobble(tc, c.at) * 1.2 });
        }
        const x = keys(tc, px), y = keys(tc, py);
        cursor.update(tc, x, y, { o: prog(tc, t0 - 0.15, t0 + 0.05), clicks });
      },
    };
  },
};
