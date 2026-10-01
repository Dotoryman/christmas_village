import type { ScenePainter } from '../effects/types';
import { wisp, branchSway, starShimmer } from '../effects/atmosphere';

// The original photograph stays intact; all motion is drawn in its coordinates.
export function drawOutside(view: ScenePainter, dt: number) {
  const ctx = view.ctx,
    t = view.time;
  if (!view.state.reduced && view.outsideImage.complete && view.outsideImage.naturalWidth) {
    branchSway(ctx, view.outsideImage, view.width, view.height, t, t < view.windUntil);
    starShimmer(ctx, view.width, view.height, t);
  }
  ctx.globalCompositeOperation = 'screen';
  if (view.state.lit('left-window')) view.glow(0.275, 0.505, 0.08, 0.055);
  if (view.state.lit('right-window')) view.glow(0.67, 0.515, 0.07, 0.055);
  if (view.state.lit('lantern')) view.glow(0.2, 0.698, 0.065, 0.09 + Math.sin(t * 3) * 0.018);
  if (view.state.lit('tree')) view.drawTree(0.805, 0.41, 0.17, 0.28);
  ctx.globalCompositeOperation = 'source-over';
  if (!view.state.reduced) {
    wisp(ctx, view.width, view.height, 0.31, 0.22, 0.16, t, 0.8, true);
    view.drawShootingStar(dt);
    view.drawSnow(dt);
  } else view.canvas.dataset.star = 'still';
}
