import type { ScenePainter } from '../effects/types';
import { random } from '../effects/math';
import { wisp, windowSnow } from '../effects/atmosphere';

// The original photograph stays intact; all motion is drawn in its coordinates.
export function drawInside(view: ScenePainter, dt: number) {
  const ctx = view.ctx,
    t = view.time;
  view.canvas.dataset.star = 'hidden';
  if (!view.state.reduced) windowSnow(ctx, view.width, view.height, t);
  ctx.globalCompositeOperation = 'screen';
  if (view.state.lit('tree')) view.drawTree(0.13, 0.28, 0.18, 0.34);
  if (view.state.lit('candle')) view.glow(0.318, 0.322, 0.035, 0.14 + Math.sin(t * 4) * 0.025);
  const boost = view.state.lit('fire') ? 1.25 : 0.85;
  view.glow(
    0.425,
    0.565,
    0.22,
    (0.07 + 0.016 * Math.sin(t * 2.8) + 0.008 * Math.sin(t * 7)) * boost,
  );
  ctx.globalCompositeOperation = 'source-over';
  // Displace the original photographic fire in overlapping scanlines. This keeps
  // the fine flame texture, with a small upward shimmer rather than solid shapes.
  ctx.save();
  ctx.beginPath();
  ctx.rect(view.width * 0.318, view.height * 0.478, view.width * 0.225, view.height * 0.108);
  ctx.clip();
  if (view.fireImage.complete && view.fireImage.naturalWidth) {
    const art = view.fireImage,
      y0 = 0.478,
      y1 = 0.586,
      step = 2 / view.height;
    for (let y = y0; y < y1; y += step) {
      const strength = y > 0.512 && y < 0.574 ? Math.sin(((y - 0.512) / 0.062) * Math.PI) : 0;
      const shift = view.state.reduced
        ? 0
        : Math.sin(t * 5.1 + y * 85) * view.width * 0.0017 * strength;
      const rise = view.state.reduced
        ? 0
        : Math.sin(t * 3.8 + y * 34) * view.height * 0.0011 * strength;
      ctx.drawImage(
        art,
        art.width * 0.318,
        art.height * y,
        art.width * 0.225,
        art.height * (step + 0.001),
        view.width * 0.318 + shift,
        view.height * y + rise,
        view.width * 0.225,
        view.height * (step + 0.001),
      );
    }
    ctx.globalCompositeOperation = 'screen';
    view.glow(0.425, 0.563, 0.065, 0.03 * boost + 0.012 * Math.sin(t * 8));
    ctx.globalCompositeOperation = 'source-over';
  }
  if (!view.state.reduced && Math.random() < dt * 2.4)
    view.particles.push({
      x: random(0.35, 0.51),
      y: 0.56,
      vx: random(-0.007, 0.007),
      vy: random(-0.07, -0.035),
      life: random(0.5, 1.1),
      age: 0,
      size: random(0.4, 0.9),
      kind: 'spark',
      phase: 0,
    });
  ctx.restore();
  if (!view.state.reduced) {
    const cocoa = performance.now() < view.state.cocoaUntil ? 1.7 : 1;
    wisp(ctx, view.width, view.height, 0.547, 0.665, 0.052 * cocoa, t, cocoa);
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 18; i++) {
      const age = (t * 0.009 + i * 0.071) % 1;
      const x = 0.28 + ((i * 0.131) % 0.5) + Math.sin(t * 0.18 + i) * 0.009;
      view.glow(x, 0.72 - age * 0.39, 0.003, Math.sin(age * Math.PI) * 0.11, '255,219,156');
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
