// Deterministic easing library. All functions map [0,1] -> [0,1].
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const linear = (t) => t;

export const inQuad = (t) => t * t;
export const outQuad = (t) => 1 - (1 - t) * (1 - t);
export const inCubic = (t) => t * t * t;
export const outCubic = (t) => 1 - Math.pow(1 - t, 3);
export const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const outQuart = (t) => 1 - Math.pow(1 - t, 4);
export const inQuart = (t) => t * t * t * t;
export const inOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const outQuint = (t) => 1 - Math.pow(1 - t, 5);
export const inOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);
export const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inExpo = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const inOutExpo = (t) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
export const inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

// CSS-style cubic-bezier solver (Newton + bisection), cached per curve.
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 30; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

// Named curves used across the film.
export const EASE = {
  premium: bezier(0.16, 1, 0.3, 1),     // long, silky ease-out (clarity)
  glide: bezier(0.65, 0, 0.35, 1),      // symmetric in-out (camera moves)
  snap: bezier(0.2, 0.9, 0.1, 1),       // fast arrival (chaos)
  suck: bezier(0.7, 0, 0.84, 0),        // accelerating collapse
  apple: bezier(0.25, 0.1, 0.25, 1),
};

// Damped spring step response. zeta=1 critically damped (no overshoot);
// zeta<1 gives overshoot — used only in the chaos section.
export function spring(t, { freq = 2.2, zeta = 1 } = {}) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  if (zeta >= 1) return 1 - (1 + w * t) * Math.exp(-w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
}
