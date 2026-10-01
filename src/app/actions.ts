import { feastParticles } from '../effects/feast';
import type { AnimationState } from '../effects/types';
import type { VillageAnimation } from '../effects/animation';
import type { Scene } from '../scenes/types';

type Services = {
  engine: VillageAnimation;
  state: AnimationState;
  travel: (scene: Scene) => void;
  openGift: () => void;
};

/** Add a named reaction here and a hotspot in its scene file. Navigation and
 * pointer capture remain shared; reactions never start an extra animation loop. */
export function createActions({ engine, state, travel, openGift }: Services) {
  const cocoa = () => {
    state.cocoaUntil = performance.now() + 3500;
  };
  return {
    enter: () => travel('inside'),
    exit: () => travel('outside'),
    'party-table': () => travel('party'),
    'living-room': () => travel('inside'),
    roof: () => engine.burst('roof'),
    branches: () => engine.burst('branches'),
    snowman: () => engine.burst('snowman'),
    gift: () => {
      engine.burst('gift');
      openGift();
    },
    mug: cocoa,
    'party-cocoa': cocoa,
    'party-cocoa-right': cocoa,
    'party-candles': () => {
      state.candleUntil = performance.now() + 3500;
    },
    moon: () => engine.makeWish(),
    'cookie-stars': () => engine.emit(feastParticles('cookies')),
    'cake-sugar': () => engine.emit(feastParticles('cake')),
  } satisfies Record<string, () => void>;
}
