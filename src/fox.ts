import foxSheet from './assets/fox-walk.webp';

type Paw = { x: number; y: number; age: number; side: number };
const smooth = (x: number) => x * x * (3 - 2 * x);

/** A visitor uses scene time, so leaving the scene or hiding the tab pauses it. */
export class FoxVisitor {
  private image = new Image();
  private age = -3;
  private direction = 1;
  private paws: Paw[] = [];
  private lastStep = -1;
  private duration = 14;
  constructor() { this.image.src = foxSheet; }
  invite() {
    if (this.age >= 0 && this.age < this.duration) return;
    this.age = 0; this.lastStep = -1;
  }
  draw(ctx: CanvasRenderingContext2D, width: number, height: number, dt: number, reduced: boolean) {
    if (reduced) return { status: 'still', frame: 0 };
    this.age += dt;
    for (const paw of this.paws) paw.age += dt;
    this.paws = this.paws.filter(paw => paw.age < 11);
    if (this.age > this.duration + 36) {
      this.age = -1; this.direction *= -1; this.lastStep = -1;
    }
    ctx.save();
    for (const paw of this.paws) {
      ctx.globalAlpha = Math.min(1, (11 - paw.age) / 3) * .14;
      ctx.fillStyle = '#263e57';
      ctx.beginPath(); ctx.ellipse(paw.x * width, paw.y * height, width * .0032, height * .0016, paw.side * .4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    if (this.age < 0 || this.age > this.duration || !this.image.complete || !this.image.naturalWidth) return { status: 'waiting', frame: 0 };
    const progress = this.age / this.duration;
    const x = this.direction === 1 ? -.16 + progress * 1.32 : 1.16 - progress * 1.32;
    const ground = .858 - Math.sin(progress * Math.PI) * .041;
    const gait = this.age * 8;
    const frame = Math.floor(gait) % 8;
    const step = Math.floor(this.age * 3.3);
    if (step !== this.lastStep && progress > .12 && progress < .88) {
      this.paws.push({ x: x - this.direction * .016, y: ground - .002, side: 1, age: 0 }, { x: x - this.direction * .036, y: ground + .005, side: -1, age: 0 });
      this.lastStep = step;
    }
    const size = width * (.22 - Math.sin(progress * Math.PI) * .014);
    const bob = Math.sin(gait * Math.PI / 2) * height * .0009;
    // Enter/leave behind the snowy edge rather than appearing abruptly.
    const fade = smooth(Math.min(1, progress / .045)) * smooth(Math.min(1, (1 - progress) / .045));
    ctx.save(); ctx.translate(x * width, ground * height + bob);
    ctx.globalAlpha = fade * .19;
    const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * .42);
    shadow.addColorStop(0, '#152a45'); shadow.addColorStop(1, '#152a4500');
    ctx.save(); ctx.scale(1, .14); ctx.fillStyle = shadow; ctx.fillRect(-size * .45, -size * .45, size * .9, size * .9); ctx.restore();
    ctx.scale(this.direction, 1); ctx.globalAlpha = fade;
    const cell = this.image.width / 4;
    ctx.drawImage(this.image, (frame % 4) * cell, Math.floor(frame / 4) * cell, cell, cell, -size / 2, -size * .79, size, size);
    ctx.restore();
    return { status: 'walking', frame };
  }
}
