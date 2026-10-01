import { drawOutside } from './outside-effects';
import { drawInside } from './inside-effects';
import { drawParty } from './party-effects';
import type { Scene } from './types';
import type { ScenePainter } from '../effects/types';
// Register one renderer per scene; the engine owns timing, visibility and motion preferences.
export const painters: Record<Scene, (view: ScenePainter, dt: number) => void> = {
  outside: drawOutside,
  inside: drawInside,
  party: drawParty,
};
