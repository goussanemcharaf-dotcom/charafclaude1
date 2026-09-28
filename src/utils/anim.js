import { clamp, lerp } from './ease.js';

// Normalized progress of t across [a, b], clamped, optionally eased.
export const prog = (t, a, b, ease) => {
  const p = clamp((t - a) / (b - a));
  return ease ? ease(p) : p;
};

// Map t across [a,b] to [from,to] with easing.
export const tween = (t, a, b, from, to, ease) => lerp(from, to, prog(t, a, b, ease));

// Piecewise keyframes: [[time, value], ...] with per-segment easing.
export function keys(t, frames, ease) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1, e1] = frames[i];
    const [t0, v0] = frames[i - 1];
    if (t <= t1) {
      const p = (t - t0) / (t1 - t0 || 1);
      const fn = e1 || ease;
      return lerp(v0, v1, fn ? fn(p) : p);
    }
  }
  return frames[frames.length - 1][1];
}

// Window envelope: fades in over [a, a+fi] and out over [b-fo, b].
export const window01 = (t, a, b, fi = 0.2, fo = 0.2, ease) =>
  Math.min(prog(t, a, a + fi, ease), 1 - prog(t, b - fo, b, ease));

// Deterministic pseudo-random (mulberry32) for repeatable chaos.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth deterministic noise in [-1, 1] (sum of sines), for jitter/float.
export const wobble = (t, seed = 0, speed = 1) =>
  (Math.sin(t * 1.7 * speed + seed * 12.9898) * 0.6 +
    Math.sin(t * 2.9 * speed + seed * 78.233) * 0.3 +
    Math.sin(t * 5.3 * speed + seed * 37.719) * 0.1);
