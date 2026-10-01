import type { Scene } from '../scenes/types';
export interface AnimationState {
  scene: Scene;
  lit: (id: string) => boolean;
  cocoaUntil: number;
  candleUntil: number;
  reduced: boolean;
}
export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  kind: 'snow' | 'spark' | 'clump' | 'sugar' | 'icing';
  phase: number;
  delay?: number;
};

/** Shared drawing services: scene effects never create their own frame loops. */
export interface ScenePainter {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  state: AnimationState;
  particles: Particle[];
  fireImage: HTMLImageElement;
  outsideImage: HTMLImageElement;
  canvas: HTMLCanvasElement;
  windUntil: number;
  glow: (x: number, y: number, radius: number, alpha: number, color?: string) => void;
  drawTree: (cx: number, top: number, spread: number, height: number) => void;
  drawSnow: (dt: number) => void;
  drawShootingStar: (dt: number) => void;
}
