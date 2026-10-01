import { random } from './math';
import type { Particle } from './types';

/** Touch reactions originate on the photographed object and fade on the shared
 * clock. No image distortion, persistent marks or additional frame loop. */
export function celebrationParticles(kind: 'glass' | 'gift' | 'hearth'): Particle[] {
  const count = kind === 'glass' ? 18 : 32;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    if (kind === 'glass')
      return {
        x: 0.267 + Math.cos(angle) * 0.031,
        y: 0.407 + Math.sin(angle) * 0.006,
        vx: Math.cos(angle) * 0.003,
        vy: -0.003,
        age: 0,
        life: random(0.55, 0.95),
        size: random(0.55, 1.2),
        kind: 'icing',
        phase: angle,
        delay: i * 0.012,
      };
    const hearth = kind === 'hearth';
    return {
      x: hearth ? random(0.36, 0.49) : 0.322 + random(-0.055, 0.055),
      y: hearth ? random(0.552, 0.57) : 0.482 + random(-0.012, 0.012),
      vx: random(-0.008, 0.008),
      vy: hearth ? random(-0.055, -0.025) : random(-0.045, -0.018),
      age: 0,
      life: random(0.6, 1.3),
      size: random(0.4, 1),
      kind: 'spark',
      phase: angle,
      delay: random(0, 0.25),
    };
  });
}
