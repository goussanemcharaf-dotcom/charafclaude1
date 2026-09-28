// Shared camera for the chaos layers (S02–S04): slow push-in, rising shake,
// freeze at «لا», then collapse into the purple point (staggered per layer).
import { prog, wobble } from '../utils/anim.js';
import { inOutSine, inQuad, inCubic } from '../utils/ease.js';

export function deskPose(t, ctx, k = 0) {
  const F = ctx.marker('freeze'), C0 = ctx.marker('collapseStart'), C1 = ctx.marker('collapseEnd');
  const tc = Math.min(t, F);
  const push = 1 + 0.045 * prog(tc, 4.2, F, inOutSine);
  const amp = 6 * prog(tc, 10.3, F - 0.05, inQuad);
  const x = amp * wobble(tc * 7, 11 + k), y = amp * wobble(tc * 7, 29 + k);
  if (!ctx.shared.dot && t >= F && ctx.shared.measureDot) ctx.shared.measureDot();
  const dot = ctx.shared.dot || { x: 540, y: 960 };
  const c = prog(t, C0 + k * 0.02, C1 - (2 - k) * 0.015, inCubic);
  return {
    x: x * (1 - c), y: y * (1 - c),
    s: push * (1 - 0.985 * c),
    r: 14 * c * (k % 2 ? -1 : 1),
    blur: 10 * c,
    o: 1 - prog(t, C1 - 0.06, C1),
    origin: `${dot.x}px ${dot.y}px`,
  };
}

// Local chaos clock: stops at the freeze frame.
export const chaosT = (t, ctx) => Math.min(t, ctx.marker('freeze'));
