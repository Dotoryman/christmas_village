import type { Particle } from './types';
import { random } from './math';

/** Icing glints and a sugar dusting stay above the food and fade completely.
 * Returns bounded particles; timing and reduced motion belong to the engine. */
export function feastParticles(kind: 'cookies' | 'cake'): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 30; i++) {
    const cake = kind === 'cake';
    particles.push({
      x: cake ? random(0.57, 0.91) : random(0.06, 0.38),
      y: cake ? random(0.754, 0.84) : random(0.72, 0.795),
      vx: cake ? random(-0.004, 0.004) : 0,
      vy: cake ? random(0.012, 0.028) : random(-0.005, 0),
      life: random(0.7, 1.6),
      age: 0,
      size: random(0.45, 1.15),
      kind: cake ? 'sugar' : 'icing',
      phase: random(0, 7),
      delay: i * 0.022,
    });
  }
  return particles;
}
