import type { Scene } from '../scenes/types';
type Point = { x: number; y: number };
type Stroke = { points: Point[]; age: number };
const panes = [
  [
    [0.625, 0.247],
    [0.705, 0.254],
    [0.705, 0.31],
    [0.625, 0.305],
  ],
  [
    [0.719, 0.255],
    [0.811, 0.262],
    [0.811, 0.316],
    [0.719, 0.311],
  ],
  [
    [0.625, 0.32],
    [0.705, 0.325],
    [0.706, 0.369],
    [0.625, 0.364],
  ],
  [
    [0.719, 0.325],
    [0.812, 0.331],
    [0.812, 0.374],
    [0.719, 0.369],
  ],
  [
    [0.625, 0.379],
    [0.707, 0.384],
    [0.707, 0.454],
    [0.625, 0.45],
  ],
  [
    [0.72, 0.384],
    [0.812, 0.391],
    [0.812, 0.462],
    [0.72, 0.456],
  ],
];

/** Wipe marks use portrait coordinates and the shared scene clock. Only the
 * six glass panes are frosted; the wooden frame stays part of the photograph. */
export class FrostWindow {
  private ctx: CanvasRenderingContext2D;
  private frost = document.createElement('canvas');
  private working = document.createElement('canvas');
  private marks: Stroke[] = [];
  private scene: Scene = 'outside';
  private active?: Stroke;
  private width = 1;
  private height = 1;
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.frost.width = this.working.width = 256;
    this.frost.height = this.working.height = 448;
    const ctx = this.frost.getContext('2d')!;
    const veil = ctx.createRadialGradient(128, 205, 20, 128, 205, 280);
    veil.addColorStop(0, 'rgba(206,229,239,.22)');
    veil.addColorStop(1, 'rgba(218,241,248,.72)');
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, 256, 448);
    // Deterministic ice grain and feathered crystal veins, concentrated at edges.
    let seed = 17;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    ctx.fillStyle = '#effaff26';
    for (let i = 0; i < 3000; i++)
      ctx.fillRect(rand() * 256, rand() * 448, 0.5 + rand() * 1.2, 0.5 + rand() * 1.2);
    ctx.strokeStyle = '#eefaff3a';
    ctx.lineWidth = 0.65;
    for (let i = 0; i < 75; i++) {
      const x = rand() < 0.5 ? rand() * 45 : 211 + rand() * 45,
        y = rand() * 448,
        a = x < 128 ? -0.8 : 0.8,
        length = 18 + rand() * 35;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(a) * length, y - length);
      for (let j = 1; j < 6; j++) {
        const u = j / 6,
          px = x + Math.sin(a) * length * u,
          py = y - length * u;
        ctx.moveTo(px, py);
        ctx.lineTo(px + (x < 128 ? 1 : -1) * 7, py - 7);
        ctx.moveTo(px, py);
        ctx.lineTo(px - (x < 128 ? 1 : -1) * 4, py - 9);
      }
      ctx.stroke();
    }
  }
  /** Preserve wiped glass between visits, but never paint frost outdoors. */
  setScene(scene: Scene) {
    this.scene = scene;
    this.active = undefined;
    this.draw(0);
  }
  private point(event: PointerEvent): Point {
    const box = this.canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)),
      y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)),
    };
  }
  /** Keyboard wiping follows the same mask path as captured touch strokes. */
  bind(button: HTMLButtonElement, onTouch: () => void) {
    let pointer: number | undefined;
    button.onpointerdown = (event) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault();
      pointer = event.pointerId;
      button.setPointerCapture(pointer);
      this.active = { points: [this.point(event)], age: 0 };
      this.marks.push(this.active);
      this.marks = this.marks.slice(-48);
      onTouch();
      this.draw(0);
    };
    button.onpointermove = (event) => {
      if (event.pointerId !== pointer || !this.active) return;
      const point = this.point(event),
        last = this.active.points.at(-1)!;
      if (Math.hypot(point.x - last.x, point.y - last.y) > 0.0015) {
        this.active.points.push(point);
        if (this.active.points.length > 350) this.active.points.splice(0, 1);
        this.active.age = 0;
        this.draw(0);
      }
    };
    const finish = () => {
      pointer = undefined;
      this.active = undefined;
    };
    button.onpointerup = finish;
    button.onpointercancel = finish;
    button.onlostpointercapture = finish;
    button.onclick = (event) => {
      // Enter/Space provide an equivalent mark without requiring a drag gesture.
      if (event.detail !== 0) return;
      const points: Point[] = [];
      points.push({ x: 0.667, y: 0.286 }, { x: 0.762, y: 0.351 }, { x: 0.669, y: 0.423 });
      this.marks.push({ points, age: 0 });
      this.marks = this.marks.slice(-48);
      onTouch();
      this.draw(0);
    };
  }
  /** Rebuild a small erase mask; reduced motion passes dt=0, freezing refrost. */
  draw(dt: number) {
    const box = this.canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    if (box.width !== this.width || box.height !== this.height) {
      this.width = box.width;
      this.height = box.height;
      this.canvas.width = Math.max(1, Math.round(box.width * dpr));
      this.canvas.height = Math.max(1, Math.round(box.height * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ctx = this.ctx,
      w = this.width,
      h = this.height;
    ctx.clearRect(0, 0, w, h);
    this.canvas.dataset.marks = String(this.scene === 'inside' ? this.marks.length : 0);
    if (this.scene !== 'inside') return;
    for (const mark of this.marks) if (mark !== this.active) mark.age += dt;
    this.marks = this.marks.filter((mark) => mark.age < 40);
    if (this.scene === 'inside') {
      const work = this.working.getContext('2d')!;
      work.clearRect(0, 0, 256, 448);
      work.drawImage(this.frost, 0, 0);
      work.globalCompositeOperation = 'destination-out';
      work.lineCap = work.lineJoin = 'round';
      for (const mark of this.marks) {
        work.globalAlpha = Math.max(0, Math.min(1, (40 - mark.age) / 28));
        work.lineWidth = 38;
        work.beginPath();
        mark.points.forEach((p, i) => {
          const x = ((p.x - 0.615) / 0.21) * 256,
            y = ((p.y - 0.245) / 0.225) * 448;
          i ? work.lineTo(x, y) : work.moveTo(x, y);
        });
        if (mark.points.length === 1) {
          const p = mark.points[0];
          work.lineTo(((p.x - 0.615) / 0.21) * 256 + 0.01, ((p.y - 0.245) / 0.225) * 448);
        }
        work.stroke();
      }
      work.globalAlpha = 1;
      work.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.beginPath();
      for (const pane of panes) {
        pane.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
        ctx.closePath();
      }
      ctx.clip();
      ctx.drawImage(this.working, 0.615 * w, 0.245 * h, 0.21 * w, 0.225 * h);
      ctx.restore();
    }
  }
}
