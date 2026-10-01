import type { ScenePainter } from '../effects/types';
import { wisp } from '../effects/atmosphere';

// The original photograph stays intact; all motion is drawn in its coordinates.
export function drawParty(view: ScenePainter) {
  const ctx = view.ctx,
    t = view.time;
  view.canvas.dataset.star = 'hidden';
  const boost = performance.now() < view.state.candleUntil ? 1.7 : 1;
  ctx.globalCompositeOperation = 'screen';
  for (const [x, y, phase] of [
    [0.409, 0.334, 0],
    [0.521, 0.294, 2],
    [0.589, 0.344, 4],
  ]) {
    const flicker = view.state.reduced
      ? 0
      : Math.sin(t * 3.1 + phase) * 0.012 + Math.sin(t * 5.7 + phase) * 0.006;
    view.glow(x, y, 0.039, (0.075 + flicker) * boost);
  }
  ctx.globalCompositeOperation = 'source-over';
  if (!view.state.reduced) {
    const cocoa = performance.now() < view.state.cocoaUntil ? 1.55 : 1;
    wisp(ctx, view.width, view.height, 0.162, 0.574, 0.052 * cocoa, t, cocoa);
    wisp(ctx, view.width, view.height, 0.895, 0.625, 0.052 * cocoa, t + 3, cocoa);
  }
}
