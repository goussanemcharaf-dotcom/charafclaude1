// Minimal DOM builder + per-frame style writer with change detection.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const svg = (markup) => {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
};

const cache = new WeakMap();
function write(el, key, val) {
  let c = cache.get(el);
  if (!c) cache.set(el, (c = {}));
  if (c[key] !== val) { c[key] = val; el.style[key] = val; }
}

const r2 = (v) => Math.round(v * 100) / 100;

// Set transform/opacity/filter/visibility from a compact spec.
// spec: {x,y,z,s,sx,sy,r,rx,ry,o,blur,origin,vis,clip,...rawStyle}
export function pose(el, spec) {
  const { x = 0, y = 0, z = 0, s = 1, sx, sy, r = 0, rx = 0, ry = 0, o, blur, bright, sat, clip, origin, ...rest } = spec;
  let tf = '';
  if (x || y || z) tf += `translate3d(${r2(x)}px,${r2(y)}px,${r2(z)}px) `;
  if (rx) tf += `rotateX(${r2(rx)}deg) `;
  if (ry) tf += `rotateY(${r2(ry)}deg) `;
  if (r) tf += `rotate(${r2(r)}deg) `;
  const scx = sx ?? s, scy = sy ?? s;
  if (scx !== 1 || scy !== 1) tf += `scale(${r2(scx * 1000) / 1000},${r2(scy * 1000) / 1000}) `;
  write(el, 'transform', tf.trim() || 'none');
  if (o !== undefined) {
    const oo = Math.max(0, Math.min(1, o));
    write(el, 'opacity', String(Math.round(oo * 1000) / 1000));
    write(el, 'visibility', oo <= 0.001 ? 'hidden' : 'visible');
  }
  let f = '';
  if (blur) f += `blur(${r2(blur)}px) `;
  if (bright !== undefined && bright !== 1) f += `brightness(${r2(bright)}) `;
  if (sat !== undefined && sat !== 1) f += `saturate(${r2(sat)}) `;
  if (blur !== undefined || bright !== undefined || sat !== undefined) write(el, 'filter', f.trim() || 'none');
  if (clip !== undefined) write(el, 'clipPath', clip);
  if (origin !== undefined) write(el, 'transformOrigin', origin);
  for (const [k, v] of Object.entries(rest)) write(el, k, typeof v === 'number' && !/opacity|zIndex/.test(k) ? `${r2(v)}px` : String(v));
}

export const show = (el, on) => write(el, 'display', on ? '' : 'none');
export const css = (el, key, val) => write(el, key, val);
