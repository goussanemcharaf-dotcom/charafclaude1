// Bidi-safe mixed Arabic/English text.
// Markup: "ومازال تبعث خدمتك / للـ[Clients]"  — "/" = line break, [..] = LTR run.
// Every token becomes an inline flex item inside an RTL row, so logical order
// is preserved and no Unicode bidi guessing happens. Latin runs are LTR rows
// of their own; Arabic prefixes (و، للـ، والـ، الـ) hug the Latin run with a
// hair space; trailing punctuation hugs the run on its left.
import { h } from './dom.js';

const PUNCT = /^[،.…؟!,:]+$/;
const LATIN = /[A-Za-z0-9]/;

function syllables(word) {
  if (LATIN.test(word)) {
    const g = word.toLowerCase().match(/[aeiouy]+/g);
    return Math.max(1, g ? g.length : 1);
  }
  const letters = word.replace(/[^ء-ي]/g, '').length;
  return Math.max(1, Math.round(letters / 2.1));
}

// Split markup into lines of tokens.
export function parse(markup, em = []) {
  const emSet = new Set(em);
  const lines = markup.split(' / ').map((line) => {
    const out = [];
    // tokenise: keep [..] groups intact (they may contain spaces)
    const re = /([^\s\[]*)\[([^\]]+)\]([^\s]*)|(\S+)/g;
    let m;
    while ((m = re.exec(line))) {
      if (m[4] !== undefined) {
        const word = m[4];
        const tail = word.match(/[،.…؟!,:]+$/);
        // Arabic word keeps its own punctuation (RTL run handles it).
        out.push({ kind: 'ar', text: word, em: emSet.has(word) || (tail && emSet.has(word.slice(0, -tail[0].length))) });
      } else {
        const [, pre, latin, post] = m;
        if (pre) out.push({ kind: 'pre', text: pre, em: emSet.has(latin) });
        out.push({ kind: 'en', text: latin, words: latin.split(' '), em: emSet.has(latin) || latin.split(' ').some((w) => emSet.has(w)) });
        if (post) out.push({ kind: 'punct', text: post, em: false });
      }
    }
    return out;
  });
  return lines;
}

// Build DOM rows. Returns { el, units } where units are the animatable word
// elements in speaking order with their syllable weights.
export function build(lines, { cls = '' } = {}) {
  const units = [];
  const rows = lines.map((toks) => {
    const row = h('div', { class: `bx-row ${cls}` });
    for (const tk of toks) {
      if (tk.kind === 'en') {
        const grp = h('span', { class: `bx-en${tk.em ? ' em' : ''}`, dir: 'ltr' });
        for (const w of tk.words) {
          const span = h('span', { class: 'bx-w', text: w });
          grp.append(span);
          units.push({ el: span, w: syllables(w), em: tk.em });
        }
        row.append(grp);
      } else if (tk.kind === 'pre') {
        const span = h('span', { class: `bx-pre bx-w${tk.em ? ' em' : ''}`, text: tk.text });
        row.append(span);
        units.push({ el: span, w: 0.5, em: tk.em });
      } else if (tk.kind === 'punct') {
        const span = h('span', { class: 'bx-punct bx-w', text: tk.text });
        row.append(span);
        units.push({ el: span, w: 0, em: false, attach: true });
      } else {
        const span = h('span', { class: `bx-ar bx-w${tk.em ? ' em' : ''}`, text: tk.text });
        row.append(span);
        units.push({ el: span, w: syllables(tk.text), em: tk.em });
      }
    }
    return row;
  });
  const el = h('div', { class: 'bx', dir: 'rtl' }, rows);
  return { el, units };
}

// Distribute start times over [t0, t1] by syllable weight.
export function timeUnits(units, t0, t1) {
  const total = units.reduce((s, u) => s + u.w, 0) || 1;
  let acc = 0;
  const span = (t1 - t0) * 0.92; // last word lands before the phrase ends
  for (const u of units) {
    u.t = t0 + (acc / total) * span;
    acc += u.w;
  }
  // punctuation shares the time of the word before it
  for (let i = 1; i < units.length; i++) if (units[i].attach) units[i].t = units[i - 1].t;
  return units;
}

// Convenience: one-shot mixed-direction label (no animation).
export function mixed(markup, em = [], cls = '') {
  return build(parse(markup, em), { cls }).el;
}
