import outside from './assets/outside.webp';
import inside from './assets/inside.webp';
import outsideOff from './assets/outside-off.webp';
import insideOff from './assets/inside-off.webp';
import type { Scene } from './animation';
export type Target = { id: string; name: string; x: number; y: number; w: number; h: number; light?: boolean; mask?: string };
export const images = { outside, inside };
export const offImages = { outside: outsideOff, inside: insideOff };
export const targets: Record<Scene, Target[]> = {
  outside: [
    { id: 'roof', name: '지붕의 눈 털기', x: 15, y: 27, w: 57, h: 18 },
    { id: 'left-window', name: '왼쪽 창문 조명', x: 22.7, y: 47.3, w: 9.4, h: 6.5, light: true, mask: 'polygon(22.5% 47%,32.2% 47%,32.2% 54%,22.5% 54%)' },
    { id: 'right-window', name: '오른쪽 창문 조명', x: 63, y: 48.5, w: 8, h: 5, light: true, mask: 'polygon(62.8% 48.1%,71.3% 48.1%,71.3% 54%,62.8% 54%)' },
    { id: 'enter', name: '오두막 안으로 들어가기', x: 43, y: 48, w: 11, h: 12 },
    { id: 'lantern', name: '가로등 조명', x: 14, y: 62, w: 13, h: 12, light: true, mask: 'polygon(15% 66%,26.5% 66%,26.5% 74%,15% 74%)' },
    { id: 'tree', name: '크리스마스 트리 조명', x: 67, y: 39, w: 26, h: 29, light: true, mask: 'polygon(81% 39%,88% 46%,85% 48%,91% 51%,90% 53%,96% 57%,94% 59%,99% 65%,95% 68%,63% 69%,61% 65%,67% 61%,67% 58%,72% 54%,72% 51%,77% 46%)' },
    { id: 'snowman', name: '눈사람에게 인사하기', x: 77, y: 64, w: 19, h: 15 },
  ],
  inside: [
    { id: 'tree', name: '실내 트리 조명', x: 1, y: 25, w: 29, h: 38, light: true, mask: 'polygon(12% 24%,17% 29%,17% 34%,22% 40%,23% 45%,28% 53%,32% 63%,0 65%,0 32%,7% 30%)' },
    { id: 'fire', name: '벽난로 불 더하기', x: 32, y: 48, w: 22, h: 12, light: true },
    { id: 'candle', name: '촛불 조명', x: 30, y: 31, w: 7, h: 5.5, light: true, mask: 'polygon(29.7% 30.8%,36.5% 30.8%,36.5% 36.5%,29.7% 36.5%)' },
    { id: 'gift', name: '선물 열기', x: 10, y: 63, w: 25, h: 9 },
    { id: 'mug', name: '따뜻한 코코아', x: 51, y: 65.5, w: 9, h: 5 },
    { id: 'exit', name: '마을로 돌아가기', x: 86, y: 36, w: 12, h: 17 },
  ],
};
