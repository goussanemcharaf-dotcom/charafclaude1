// VO recording guide (teleprompter): ?guide=1
// Shows the current line large, the next line small, a per-line progress bar
// and a 3-2-1 count-in, over a dimmed picture — record while watching.
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { mixed } from '../utils/text.js';

export function Guide(ctx) {
  const lines = ctx.tl.lines;
  const dim = h('div', { class: 'gd-dim' });
  const box = h('div', { class: 'gd-box' });
  const tag = h('div', { class: 'gd-tag' });
  const cur = h('div', { class: 'gd-cur' });
  const nxt = h('div', { class: 'gd-next' });
  const bar = h('i');
  const track = h('div', { class: 'gd-track' }, bar);
  const count = h('div', { class: 'gd-count' });
  const clock = h('div', { class: 'gd-clock' });
  box.append(tag, cur, track, nxt);
  const el = h('div', { class: 'layer gd', style: { zIndex: 90 } }, dim, box, count, clock);
  const built = lines.map((l) => ({ l, cur: mixed(l.phrases.map((p) => p.text.replace(/ \/ /g, ' ')).join(' ')) }));
  let last = -1;
  return {
    el,
    update(t) {
      let i = lines.findIndex((l) => t < l.end + 0.15);
      if (i < 0) i = lines.length - 1;
      const L = lines[i];
      if (i !== last) {
        cur.replaceChildren(built[i].cur.cloneNode(true));
        nxt.textContent = lines[i + 1] ? `التالي: ${lines[i + 1].text}` : '';
        tag.textContent = `${L.id} · ${L.start.toFixed(2)}s → ${L.end.toFixed(2)}s`;
        last = i;
      }
      const active = t >= L.start && t <= L.end;
      css(bar, 'width', `${(prog(t, L.start, L.end) * 100).toFixed(1)}%`);
      css(box, 'borderColor', active ? 'var(--accent)' : 'rgba(255,255,255,0.25)');
      pose(cur, { o: t < L.start - 1.2 ? 0.45 : 1 });
      // 3-2-1 count-in over the pre-roll (render the guide from t = -3)
      count.textContent = t < 0 ? String(Math.ceil(-t)) : '';
      pose(count, { o: t < 0 ? 1 : 0 });
      clock.textContent = t.toFixed(2) + 's';
    },
  };
}
