import image from '../assets/outside.webp';
import offImage from '../assets/outside-off.webp';
import type { SceneDefinition } from './types';

// Scene-owned artwork and normalized touch targets; add objects here.
export const outside: SceneDefinition = {
  origin: [48, 55],
  image,
  offImage,
  label: 'Snowy forest cabin',
  focus: 'enter',
  escape: undefined,
  treeBounds: [0.39, 0.7],
  targets: [
    { id: 'moon', name: 'Make a wish', x: 69, y: 6, w: 16, h: 10 },
    { id: 'roof', name: 'Brush snow off the roof', x: 15, y: 27, w: 57, h: 18 },
    {
      id: 'left-window',
      name: 'Left window lights',
      x: 22.7,
      y: 47.3,
      w: 9.4,
      h: 6.5,
      light: true,
      mask: 'polygon(22.5% 47%,32.2% 47%,32.2% 54%,22.5% 54%)',
    },
    {
      id: 'right-window',
      name: 'Right window lights',
      x: 63,
      y: 48.5,
      w: 8,
      h: 5,
      light: true,
      mask: 'polygon(62.8% 48.1%,71.3% 48.1%,71.3% 54%,62.8% 54%)',
    },
    { id: 'enter', name: 'Enter the cabin', x: 43, y: 48, w: 11, h: 12 },
    {
      id: 'lantern',
      name: 'Lantern light',
      x: 14,
      y: 62,
      w: 13,
      h: 12,
      light: true,
      mask: 'polygon(15% 66%,26.5% 66%,26.5% 74%,15% 74%)',
    },
    {
      id: 'tree',
      name: 'Christmas tree lights',
      x: 67,
      y: 39,
      w: 26,
      h: 29,
      light: true,
      mask: 'polygon(81% 39%,88% 46%,85% 48%,91% 51%,90% 53%,96% 57%,94% 59%,99% 65%,95% 68%,63% 69%,61% 65%,67% 61%,67% 58%,72% 54%,72% 51%,77% 46%)',
    },
    { id: 'snowman', name: 'Greet the snowman', x: 77, y: 64, w: 19, h: 15 },
    { id: 'branches', name: 'Brush snow off the pine branches', x: 0, y: 12, w: 13, h: 20 },
    { id: 'powder', name: 'Sweep the powder snow', x: 17, y: 81, w: 67, h: 17 },
  ],
};
