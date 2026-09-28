// SCENE 13 — «راسلني ونبداو.» One action: start the conversation.
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE, spring } from '../utils/ease.js';
import { icon, typed } from '../components/ui.js';

export default {
  id: 'S13_CTA',
  create({ root, ctx }) {
    const L13 = ctx.line('L13');
    const t0 = L13.start;
    const eyebrow = h('div', { class: 's13-eyebrow' }, 'PREMIUM WEBSITE PORTFOLIO');
    const w1 = h('div', { class: 's13-w' }, 'راسلني');
    const w2 = h('div', { class: 's13-w' }, 'ونبداو', h('span', { class: 's13-dot' }));
    const msgText = h('span', { class: 's13-msg' });
    const caret = h('i', { class: 's13-caret' });
    const send = h('div', { class: 's13-send' }, icon('send', 40, '#fff'));
    const ripple = h('div', { class: 's13-ripple' });
    const composer = h('div', { class: 's13-comp' }, h('div', { class: 's13-field', dir: 'rtl' }, msgText, caret), h('div', { class: 's13-sendwrap' }, ripple, send));
    root.append(eyebrow, h('div', { class: 's13-head', dir: 'rtl' }, w1, w2), composer);
    const MSG = 'سلام! حاب Portfolio تاعي 👋';
    const tSend = 35.72;
    return {
      update(t) {
        const e0 = prog(t, t0 + 0.1, t0 + 0.55, EASE.premium);
        pose(eyebrow, { y: (1 - e0) * 30, o: e0 });
        const e1 = prog(t, t0 - 0.05, t0 + 0.5, EASE.premium);
        const e2 = prog(t, t0 + 0.42, t0 + 0.95, EASE.premium);
        pose(w1, { y: (1 - e1) * 70, o: e1, blur: (1 - e1) * 16 });
        pose(w2, { y: (1 - e2) * 70, o: e2, blur: (1 - e2) * 16 });
        const c = t - (t0 + 0.55);
        const sp = c < 0 ? 0 : spring(c, { freq: 1.8, zeta: 1 });
        pose(composer, { y: (1 - sp) * 90, o: prog(c, 0, 0.2) });
        msgText.textContent = typed(MSG, t, t0 + 0.72, 36);
        css(caret, 'opacity', t < tSend ? (Math.floor(t * 3.2) % 2 ? '0' : '1') : '0');
        const press = Math.max(0, 1 - Math.abs(t - tSend) / 0.1);
        pose(send, { s: 1 - 0.12 * press });
        const rp = prog(t, tSend, tSend + 0.6);
        pose(ripple, { s: 0.6 + rp * 1.6, o: t >= tSend ? (1 - rp) * 0.5 : 0 });
        css(send, 'background', t >= tSend + 0.05 ? 'var(--accent-deep)' : 'var(--accent)');
      },
    };
  },
};
