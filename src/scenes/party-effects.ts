import type { ScenePainter } from '../effects/types';
import { wisp } from '../effects/atmosphere';

// The original photograph stays intact; all motion is drawn in its coordinates.
export function drawParty(view: ScenePainter) {
  const ctx = view.ctx,
    t = view.time;
  view.canvas.dataset.star = 'hidden';
  drawTableSurprises(view);
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

/** Small object-local reactions: no photo deformation or independent timers.
 * Reduced motion shows a steady highlight instead of moving decorative trails. */
function drawTableSurprises(view: ScenePainter) {
  const now = performance.now();
  const pulse = (kind: keyof typeof view.state.partyReactions, duration: number) => {
    const start = view.state.partyReactions[kind];
    const elapsed = start === undefined ? -1 : (now - start) / 1000;
    const active = elapsed >= 0 && elapsed < duration;
    view.canvas.dataset[kind] = active ? 'active' : 'idle';
    return active
      ? {
          age: elapsed,
          strength: view.state.reduced ? 0.65 : Math.sin((Math.PI * elapsed) / duration),
        }
      : undefined;
  };
  const ctx = view.ctx;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const garland = pulse('garland', 4);
  if (garland) {
    const bulbs = [
      [0.625, 0.027],
      [0.657, 0.061],
      [0.66, 0.087],
      [0.667, 0.136],
      [0.673, 0.184],
      [0.692, 0.222],
      [0.695, 0.254],
    ];
    bulbs.forEach(([x, y], i) => {
      const wave = view.state.reduced
        ? 1
        : Math.pow(Math.max(0, Math.cos(garland.age * 3 - i * 0.65)), 4);
      view.glow(x, y, 0.024, garland.strength * (0.12 + wave * 0.42));
    });
  }
  const lantern = pulse('lantern', 3.5);
  if (lantern) {
    view.glow(0.76, 0.255, 0.085, lantern.strength * 0.32);
    view.glow(0.76, 0.255, 0.023, lantern.strength * 0.5);
  }
  const berries = pulse('berries', 2.8);
  if (berries) {
    [
      [0.265, 0.661],
      [0.311, 0.671],
      [0.339, 0.66],
      [0.295, 0.655],
    ].forEach(([x, y], i) => {
      const wave = view.state.reduced ? 1 : Math.pow(Math.max(0, Math.sin(berries.age * 4 - i)), 2);
      view.glow(x, y, 0.011, berries.strength * wave * 0.55, '255,228,203');
    });
  }
  ctx.globalCompositeOperation = 'source-over';
  const roast = pulse('roast', 4.5);
  if (roast) {
    if (view.state.reduced) view.glow(0.51, 0.556, 0.09, 0.08);
    else
      for (const [x, y] of [
        [0.415, 0.566],
        [0.52, 0.542],
        [0.625, 0.574],
      ])
        wisp(ctx, view.width, view.height, x, y, 0.065, view.time + x * 8, roast.strength * 3);
  }
  ctx.restore();
}
