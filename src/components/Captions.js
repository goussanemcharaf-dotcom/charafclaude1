// Designed caption system. One block per VO line: a (frosted) panel that
// morphs its size between phrases while the text swaps cleanly; words light
// up as they are spoken; emphasis is semantic — ink for the problem, violet
// for the solution. Lines flagged caption:false are carried by scene type.
import { h, pose, css } from '../utils/dom.js';
import { parse, build, timeUnits } from '../utils/text.js';
import { prog } from '../utils/anim.js';
import { EASE, lerp } from '../utils/ease.js';
import { CAPTION } from '../config/format.js';

export function Captions(ctx) {
  const el = h('div', { class: 'layer captions', style: { zIndex: 50 } });
  const mode = ctx.mode.captions;
  if (mode === 'none') return { el, update() {} };
  const designed = mode === 'designed';
  const lines = [];

  const shown = (l) => l && (!designed || l.caption);
  ctx.tl.lines.forEach((line, li) => {
    if (designed && !line.caption) return;
    const nextLine = ctx.tl.lines[li + 1];
    const tone = designed ? line.tone || 'solution' : 'standard';
    const pos = designed ? line.pos || 'low' : line.stdPos || 'low';
    const panelOn = !designed || line.panel;
    const wrap = h('div', { class: `cap tone-${tone} pos-${pos}` });
    wrap.style.top = `${CAPTION[pos]}px`;
    const stage = h('div', { class: 'cap-stage' });
    const panel = h('div', { class: panelOn ? 'cap-panel' : 'cap-panel off' });
    stage.append(panel);
    const phrases = line.phrases.map((ph) => {
      const { el: bx, units } = build(parse(ph.text, designed ? ph.em || [] : []));
      timeUnits(units, ph.t[0], ph.t[1]);
      const block = h('div', { class: 'cap-block' }, bx);
      stage.append(block);
      return { ph, block, units, w: 0, hgt: 0 };
    });
    wrap.append(stage);
    el.append(wrap);
    const tIn = line.phrases[0].t[0] - 0.07;
    const last = line.phrases[line.phrases.length - 1];
    // leave before the next caption arrives, and earlier still when the next
    // line is carried by scene typography in the same space
    const nextIn = nextLine ? nextLine.phrases[0].t[0] - 0.07 : Infinity;
    const gap = !nextLine ? 0 : shown(nextLine) ? (nextLine.start - nextIn) + 0.16 : designed ? 0.24 : 0.06;
    const tOut = Math.min(last.t[1] + 0.45, nextLine ? nextLine.start - gap : last.t[1] + 0.8);
    lines.push({ wrap, panel, phrases, tIn, tOut, tone, measured: false });
  });

  const PADX = 40, PADY = 24;
  function update(t) {
    for (const L of lines) {
      if (t < L.tIn - 0.02 || t > L.tOut + 0.2) { pose(L.wrap, { o: 0 }); continue; }
      if (!L.measured) {
        for (const p of L.phrases) { p.w = p.block.offsetWidth + PADX * 2; p.hgt = p.block.offsetHeight + PADY * 2; }
        L.measured = true;
      }
      const aIn = prog(t, L.tIn, L.tIn + 0.22, EASE.premium);
      const aOut = prog(t, L.tOut - 0.02, L.tOut + 0.16, EASE.glide);
      pose(L.wrap, { y: (1 - aIn) * 18 - aOut * 8, o: aIn * (1 - aOut) });
      // current phrase + swap progress
      let i = 0;
      for (let k = 0; k < L.phrases.length; k++) if (t >= L.phrases[k].ph.t[0] - 0.1) i = k;
      const sw = i > 0 ? prog(t, L.phrases[i].ph.t[0] - 0.1, L.phrases[i].ph.t[0] + 0.1, EASE.premium) : 1;
      const prev = L.phrases[Math.max(0, i - 1)], cur = L.phrases[i];
      css(L.panel, 'width', `${lerp(prev.w, cur.w, sw).toFixed(1)}px`);
      css(L.panel, 'height', `${lerp(prev.hgt, cur.hgt, sw).toFixed(1)}px`);
      L.phrases.forEach((p, k) => {
        let o = 0, y = 0;
        if (k === i) { o = sw; y = (1 - sw) * 12; }
        else if (k === i - 1) { o = 1 - prog(sw, 0, 0.45); y = -sw * 8; }
        pose(p.block, { o, y });
        if (o <= 0) return;
        for (const u of p.units) {
          const on = prog(t, u.t - 0.03, u.t + 0.09);
          const base = designed ? 0.3 : 1;
          css(u.el, 'opacity', String(Math.round((base + (1 - base) * on) * 1000) / 1000));
          if (designed && u.em && L.tone === 'solution') css(u.el, 'color', on > 0.5 ? 'var(--accent)' : 'var(--ink)');
        }
      });
    }
  }
  return { el, update };
}
