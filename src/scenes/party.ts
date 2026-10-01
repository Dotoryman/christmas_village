import image from '../assets/party.webp';
const offImage = image;
import type { SceneDefinition } from './types';

// Scene-owned artwork and normalized touch targets; add objects here.
export const party: SceneDefinition = {
  origin: [20, 24],
  image,
  offImage,
  label: 'Christmas party table',
  focus: 'living-room',
  escape: 'inside',
  targets: [
    { id: 'living-room', name: 'Return to the living room', x: 2, y: 10, w: 37, h: 27 },
    { id: 'party-candles', name: 'Warm the table candlelight', x: 36, y: 28, w: 28, h: 19 },
    { id: 'party-cocoa', name: 'Warm the left festive cocoa', x: 4, y: 55, w: 20, h: 11 },
    { id: 'party-cocoa-right', name: 'Warm the right festive cocoa', x: 80, y: 61, w: 19, h: 11 },
    { id: 'cookie-stars', name: 'Sparkle the gingerbread icing', x: 3, y: 72, w: 40, h: 11 },
    { id: 'cake-sugar', name: 'Dust the Christmas cake with sugar', x: 54, y: 75, w: 44, h: 16 },
    { id: 'glass-chime', name: 'Ring the crystal glass', x: 22, y: 39, w: 12, h: 8 },
    { id: 'party-gift', name: 'Discover the table gift', x: 25, y: 48, w: 14, h: 7 },
  ],
};
