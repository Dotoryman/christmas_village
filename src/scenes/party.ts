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
    { id: 'frost', name: 'Clear frost from the table window', x: 74, y: 8, w: 22, h: 15 },
    { id: 'party-garland', name: 'Wake the garland lights', x: 61, y: 3, w: 10, h: 26 },
    { id: 'party-lantern', name: 'Warm the window lantern', x: 72, y: 23, w: 10, h: 7 },
    { id: 'party-roast', name: 'Savor the Christmas roast', x: 29, y: 53, w: 46, h: 10 },
    { id: 'party-berries', name: 'Polish the cranberry sparkle', x: 22, y: 66, w: 17, h: 6 },
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
