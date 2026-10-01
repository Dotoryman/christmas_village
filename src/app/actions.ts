import { feastParticles } from '../effects/feast';
import { celebrationParticles } from '../effects/celebration';
import type { WinterSound } from '../effects/sound';
import type { AnimationState } from '../effects/types';
import type { VillageAnimation } from '../effects/animation';
import type { Scene } from '../scenes/types';

type Services = {
  engine: VillageAnimation;
  state: AnimationState;
  sound: WinterSound;
  travel: (scene: Scene) => void;
  openGift: () => void;
};

/** Add a named reaction here and a hotspot in its scene file. Navigation and
 * pointer capture remain shared; reactions never start an extra animation loop. */
export function createActions({ engine, state, sound, travel, openGift }: Services) {
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
    // Finite pulses fade on the shared clock and are cleared on room changes.
    'party-garland': () => {
      state.partyReactions.garland = performance.now();
    },
    'party-lantern': () => {
      state.partyReactions.lantern = performance.now();
    },
    'party-roast': () => {
      state.partyReactions.roast = performance.now();
    },
    'party-berries': () => {
      state.partyReactions.berries = performance.now();
    },
    'party-candles': () => {
      state.candleUntil = performance.now() + 3500;
    },
    moon: () => engine.makeWish(),
    'cookie-stars': () => engine.emit(feastParticles('cookies')),
    'cake-sugar': () => engine.emit(feastParticles('cake')),
    'glass-chime': () => {
      engine.emit(celebrationParticles('glass'));
      sound.chime();
    },
    'party-gift': () => {
      engine.emit(celebrationParticles('gift'));
      sound.chime(0.8);
    },
    fire: () => {
      if (state.lit('fire')) engine.emit(celebrationParticles('hearth'));
    },
  } satisfies Record<string, () => void>;
}
