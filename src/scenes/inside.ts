import image from '../assets/inside.webp';
import offImage from '../assets/inside-off.webp';
import type { SceneDefinition } from './types';

// Scene-owned artwork and normalized touch targets; add objects here.
export const inside: SceneDefinition = {
  origin: [92, 45],
  destinationOrigins: { party: [52, 75] },
  plates: [
    {
      id: 'firebox',
      mask: 'polygon(31.2% 49%,34% 47.2%,52% 47.2%,55% 49%,55% 59.6%,31.2% 59.6%)',
      off: true,
    },
  ],
  decorations: ['gift-ribbon'],
  image,
  offImage,
  label: 'Warm cabin interior',
  focus: 'fire',
  escape: 'outside',
  treeBounds: [0.24, 0.65],
  targets: [
    {
      id: 'tree',
      name: 'Indoor tree lights',
      x: 1,
      y: 25,
      w: 29,
      h: 38,
      light: true,
      mask: 'polygon(12% 24%,17% 29%,17% 34%,22% 40%,23% 45%,28% 53%,32% 63%,0 65%,0 32%,7% 30%)',
    },
    { id: 'fire', name: 'Tend the fire', x: 32, y: 48, w: 22, h: 12, light: true },
    {
      id: 'candle',
      name: 'Candlelight',
      x: 30,
      y: 31,
      w: 7,
      h: 5.5,
      light: true,
      mask: 'polygon(29.7% 30.8%,36.5% 30.8%,36.5% 36.5%,29.7% 36.5%)',
    },
    { id: 'gift', name: 'Open the gift', x: 10, y: 63, w: 25, h: 9 },
    { id: 'mug', name: 'Warm cocoa', x: 51, y: 65.5, w: 9, h: 5 },
    { id: 'exit', name: 'Return to the village', x: 86, y: 36, w: 12, h: 17 },
    { id: 'frost', name: 'Clear frost from the window', x: 61.5, y: 24.5, w: 21, h: 22.5 },
    { id: 'party-table', name: 'Visit the Christmas table', x: 39, y: 71, w: 26, h: 11 },
  ],
};
