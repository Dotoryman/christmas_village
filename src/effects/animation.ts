import fireArt from '../assets/inside.webp';
import outsideArt from '../assets/outside.webp';
import { wisp, windowSnow, branchSway, starShimmer } from './atmosphere';
export type Scene = 'outside' | 'inside' | 'party';
export interface AnimationState {
  scene: Scene;
  lit: (id: string) => boolean;
  cocoaUntil: number;
  candleUntil: number;
  reduced: boolean;
}
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  kind: 'snow' | 'spark' | 'clump';
  phase: number;
  delay?: number;
};
type Flake = { x: number; y: number; depth: number; phase: number };
const random = (a: number, b: number) => a + Math.random() * (b - a);

/** One bounded canvas loop. Coordinates are normalized to the portrait art. */
export class VillageAnimation {
  private ctx: CanvasRenderingContext2D;
  private width = 1;
  private height = 1;
  private frame = 0;
  private last = 0;
  private time = 0;
  private particles: Particle[] = [];
  private fireImage = new Image();
  private outsideImage = new Image();
  private starAge = -11;
  private windUntil = 0;
  private treeAge = -1;
  private glowSprites = new Map<string, HTMLCanvasElement>();
  // Dense distant flakes establish snowfall; larger near flakes stay sparse so
  // the artwork remains readable. Sprite glows are cached rather than blurred.
  private snow: Flake[] = Array.from({ length: 360 }, () => ({
    x: Math.random(),
    y: Math.random(),
    depth: Math.pow(Math.random(), 1.6) * 0.85 + 0.15,
    phase: random(0, Math.PI * 2),
  }));
  private observer: ResizeObserver;
  private visibility = () => {
    this.stop();
    if (!document.hidden) this.start();
  };
  constructor(
    private canvas: HTMLCanvasElement,
    private state: AnimationState,
    private afterDraw: (dt: number, treeProgress: number) => void = () => {},
  ) {
    this.ctx = canvas.getContext('2d', { alpha: true })!;
    this.fireImage.src = fireArt;
    this.outsideImage.src = outsideArt;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    document.addEventListener('visibilitychange', this.visibility);
    this.resize();
    this.start();
  }
  private resize() {
    const box = this.canvas.getBoundingClientRect();
    this.width = box.width;
    this.height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(box.width * dpr));
    this.canvas.height = Math.max(1, Math.round(box.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(0);
  }
  start() {
    this.stop();
    this.last = 0;
    if (document.hidden) return;
    if (this.state.reduced) {
      this.draw(0);
      return;
    }
    this.frame = requestAnimationFrame(this.tick);
  }
  stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
  }
  reset() {
    this.particles = [];
    this.treeAge = -1;
    this.start();
  }
  lightTree() {
    this.treeAge = this.state.reduced ? -1 : 0;
    this.start();
  }
  cancelTree() {
    this.treeAge = -1;
  }
  /** Sweep powder into the air without painting persistent lines on the photo. */
  powder(x: number, y: number) {
    if (
      this.state.reduced ||
      this.state.scene !== 'outside' ||
      x < 0.17 ||
      x > 0.84 ||
      y < 0.81 ||
      y > 0.98
    )
      return;
    for (let i = 0; i < 12; i++)
      this.particles.push({
        x: x + random(-0.009, 0.009),
        y: y + random(-0.002, 0.002),
        vx: random(-0.025, 0.025),
        vy: random(-0.052, -0.015),
        age: 0,
        life: random(0.5, 1.1),
        size: random(0.6, 2),
        kind: 'snow',
        phase: random(0, 7),
      });
    this.particles = this.particles.slice(-240);
  }
  makeWish() {
    if (!this.state.reduced) this.starAge = 0;
  }
  destroy() {
    this.stop();
    this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.visibility);
  }
  private tick = (now: number) => {
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.12) : 0;
    this.last = now;
    this.time += dt;
    this.draw(dt);
    this.frame = requestAnimationFrame(this.tick);
  };
  burst(kind: 'roof' | 'gift' | 'snowman' | 'branches') {
    if (this.state.reduced) return;
    if (kind === 'snowman' || kind === 'branches') this.windUntil = this.time + 3;
    const count = kind === 'roof' ? 64 : kind === 'gift' ? 32 : kind === 'branches' ? 40 : 24;
    for (let i = 0; i < count; i++) {
      // Release from the photographed eaves in staggered small clusters.
      const eave = [
        [0.16, 0.427],
        [0.35, 0.442],
        [0.6, 0.435],
        [0.71, 0.456],
      ][i % 4];
      const clump = (kind === 'roof' || kind === 'branches') && i % 4 === 0;
      this.particles.push({
        x:
          kind === 'roof'
            ? eave[0] + random(-0.025, 0.025)
            : kind === 'branches'
              ? random(0.025, 0.12)
              : kind === 'gift'
                ? random(0.13, 0.3)
                : random(0.81, 0.93),
        y:
          kind === 'roof'
            ? eave[1] + random(-0.006, 0.006)
            : kind === 'branches'
              ? random(0.12, 0.3)
              : kind === 'gift'
                ? random(0.635, 0.68)
                : 0.64,
        vx:
          kind === 'roof'
            ? random(-0.018, 0.018)
            : kind === 'branches'
              ? random(0.008, 0.04)
              : random(-0.05, 0.05),
        vy: kind === 'roof' || kind === 'branches' ? random(0.005, 0.025) : random(-0.12, -0.045),
        life: kind === 'roof' || kind === 'branches' ? random(0.9, 1.8) : random(1.2, 2.4),
        age: 0,
        size: clump ? random(2.2, 4.3) : random(0.6, 1.7),
        kind: clump ? 'clump' : kind === 'gift' ? 'spark' : 'snow',
        phase: random(0, 7),
        delay: kind === 'roof' || kind === 'branches' ? random(0, 0.65) : 0,
      });
    }
    this.particles = this.particles.slice(-240);
  }
  private glow(x: number, y: number, radius: number, alpha: number, color = '255,182,70') {
    const ctx = this.ctx,
      px = x * this.width,
      py = y * this.height,
      r = radius * this.width;
    if (r <= 0) return;
    let sprite = this.glowSprites.get(color);
    if (!sprite) {
      sprite = document.createElement('canvas');
      sprite.width = sprite.height = 64;
      const ink = sprite.getContext('2d')!;
      const gradient = ink.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, `rgba(${color},1)`);
      gradient.addColorStop(0.3, `rgba(${color},.36)`);
      gradient.addColorStop(1, `rgba(${color},0)`);
      ink.fillStyle = gradient;
      ink.fillRect(0, 0, 64, 64);
      this.glowSprites.set(color, sprite);
    }
    const previous = ctx.globalAlpha;
    ctx.globalAlpha = previous * Math.max(0, Math.min(1, alpha));
    ctx.drawImage(sprite, px - r, py - r, r * 2, r * 2);
    ctx.globalAlpha = previous;
  }
  private draw(dt: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.width < 1 || this.height < 1) return;
    if (this.treeAge >= 0) this.treeAge += dt;
    if (this.state.scene === 'outside') this.drawOutside(dt);
    else if (this.state.scene === 'inside') this.drawInside(dt);
    else this.drawParty();
    if (!this.state.reduced) this.drawParticles(dt);
    this.afterDraw(
      this.state.reduced ? 0 : dt,
      this.treeAge < 0 ? 1 : Math.min(1, this.treeAge / 2.8),
    );
    if (this.treeAge > 3.9) this.treeAge = -1;
  }
  private drawOutside(dt: number) {
    const ctx = this.ctx,
      t = this.time;
    if (!this.state.reduced && this.outsideImage.complete && this.outsideImage.naturalWidth) {
      branchSway(ctx, this.outsideImage, this.width, this.height, t, t < this.windUntil);
      starShimmer(ctx, this.width, this.height, t);
    }
    ctx.globalCompositeOperation = 'screen';
    if (this.state.lit('left-window')) this.glow(0.275, 0.505, 0.08, 0.055);
    if (this.state.lit('right-window')) this.glow(0.67, 0.515, 0.07, 0.055);
    if (this.state.lit('lantern')) this.glow(0.2, 0.698, 0.065, 0.09 + Math.sin(t * 3) * 0.018);
    if (this.state.lit('tree')) this.drawTree(0.805, 0.41, 0.17, 0.28);
    ctx.globalCompositeOperation = 'source-over';
    if (!this.state.reduced) {
      wisp(ctx, this.width, this.height, 0.31, 0.22, 0.16, t, 0.8, true);
      this.drawShootingStar(dt);
      this.drawSnow(dt);
    } else this.canvas.dataset.star = 'still';
  }
  private drawSnow(dt: number) {
    const ctx = this.ctx,
      t = this.time;
    const gust = t < this.windUntil ? Math.sin(((this.windUntil - t) / 3) * Math.PI) * 0.035 : 0;
    for (const flake of this.snow) {
      flake.y += dt * (0.011 + flake.depth * 0.032);
      flake.x += dt * (0.003 + Math.sin(t * 0.24 + flake.phase) * 0.009 + gust) * flake.depth;
      if (flake.y > 1.03) {
        flake.y = -0.03;
        flake.x = Math.random();
      }
      if (flake.x > 1.05) flake.x = -0.05;
      if (flake.x < -0.05) flake.x = 1.05;
      const x = flake.x + Math.sin(t * 0.5 + flake.phase) * 0.009 * flake.depth;
      if (flake.depth > 0.78)
        this.glow(x, flake.y, 0.003 + flake.depth * 0.003, 0.25, '235,245,255');
      else {
        ctx.beginPath();
        ctx.arc(x * this.width, flake.y * this.height, 0.35 + flake.depth * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231,242,255,${0.18 + flake.depth * 0.36})`;
        ctx.fill();
      }
    }
  }
  private drawShootingStar(dt: number) {
    this.starAge += dt;
    if (this.starAge > 1.7) this.starAge = -28 - Math.random() * 12;
    this.canvas.dataset.star = this.starAge < 0 ? 'waiting' : 'streak';
    if (this.starAge < 0) return;
    const progress = this.starAge / 1.7;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 24; i++) {
      const u = progress - i * 0.008;
      if (u < 0) continue;
      const opacity = Math.sin(progress * Math.PI) * (1 - i / 24) * 0.7;
      ctx.strokeStyle = `rgba(221,239,255,${opacity})`;
      ctx.lineWidth = Math.max(0.9, this.width * 0.0015);
      ctx.beginPath();
      ctx.moveTo((0.18 + u * 0.46) * this.width, (0.045 + u * 0.076) * this.height);
      ctx.lineTo(
        (0.18 + (u + 0.008) * 0.46) * this.width,
        (0.045 + (u + 0.008) * 0.076) * this.height,
      );
      ctx.stroke();
    }
    this.glow(
      0.18 + progress * 0.46,
      0.045 + progress * 0.076,
      0.013,
      Math.sin(progress * Math.PI) * 0.55,
      '215,237,255',
    );
    ctx.restore();
  }
  private drawTree(cx: number, top: number, spread: number, height: number) {
    for (let row = 0; row < 6; row++) {
      const n = 4 + row * 2;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1),
          depth = (row + 1) / 6;
        const x = cx + (u - 0.5) * spread * depth * 1.7;
        const y = top + height * depth + Math.sin(u * Math.PI) * 0.006;
        if (this.treeAge >= 0 && this.treeAge / 2.8 < 1 - depth) continue;
        const shimmer = 0.5 + 0.5 * Math.sin(this.time * 0.75 + row * 1.4 + i * 0.67);
        this.glow(x, y, 0.01, 0.035 + shimmer * 0.09);
      }
    }
    if (this.treeAge >= 2.8) {
      const pulse = Math.sin(Math.min(1, (this.treeAge - 2.8) / 1.1) * Math.PI);
      this.glow(cx, top, 0.055, pulse * 0.22);
    }
  }
  private drawInside(dt: number) {
    const ctx = this.ctx,
      t = this.time;
    this.canvas.dataset.star = 'hidden';
    if (!this.state.reduced) windowSnow(ctx, this.width, this.height, t);
    ctx.globalCompositeOperation = 'screen';
    if (this.state.lit('tree')) this.drawTree(0.13, 0.28, 0.18, 0.34);
    if (this.state.lit('candle')) this.glow(0.318, 0.322, 0.035, 0.14 + Math.sin(t * 4) * 0.025);
    const boost = this.state.lit('fire') ? 1.25 : 0.85;
    this.glow(
      0.425,
      0.565,
      0.22,
      (0.07 + 0.016 * Math.sin(t * 2.8) + 0.008 * Math.sin(t * 7)) * boost,
    );
    ctx.globalCompositeOperation = 'source-over';
    // Displace the original photographic fire in overlapping scanlines. This keeps
    // the fine flame texture, with a small upward shimmer rather than solid shapes.
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.width * 0.318, this.height * 0.478, this.width * 0.225, this.height * 0.108);
    ctx.clip();
    if (this.fireImage.complete && this.fireImage.naturalWidth) {
      const art = this.fireImage,
        y0 = 0.478,
        y1 = 0.586,
        step = 2 / this.height;
      for (let y = y0; y < y1; y += step) {
        const strength = y > 0.512 && y < 0.574 ? Math.sin(((y - 0.512) / 0.062) * Math.PI) : 0;
        const shift = this.state.reduced
          ? 0
          : Math.sin(t * 5.1 + y * 85) * this.width * 0.0017 * strength;
        const rise = this.state.reduced
          ? 0
          : Math.sin(t * 3.8 + y * 34) * this.height * 0.0011 * strength;
        ctx.drawImage(
          art,
          art.width * 0.318,
          art.height * y,
          art.width * 0.225,
          art.height * (step + 0.001),
          this.width * 0.318 + shift,
          this.height * y + rise,
          this.width * 0.225,
          this.height * (step + 0.001),
        );
      }
      ctx.globalCompositeOperation = 'screen';
      this.glow(0.425, 0.563, 0.065, 0.03 * boost + 0.012 * Math.sin(t * 8));
      ctx.globalCompositeOperation = 'source-over';
    }
    if (!this.state.reduced && Math.random() < dt * 2.4)
      this.particles.push({
        x: random(0.35, 0.51),
        y: 0.56,
        vx: random(-0.007, 0.007),
        vy: random(-0.07, -0.035),
        life: random(0.5, 1.1),
        age: 0,
        size: random(0.4, 0.9),
        kind: 'spark',
        phase: 0,
      });
    ctx.restore();
    if (!this.state.reduced) {
      const cocoa = performance.now() < this.state.cocoaUntil ? 1.7 : 1;
      wisp(ctx, this.width, this.height, 0.547, 0.665, 0.052 * cocoa, t, cocoa);
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 18; i++) {
        const age = (t * 0.009 + i * 0.071) % 1;
        const x = 0.28 + ((i * 0.131) % 0.5) + Math.sin(t * 0.18 + i) * 0.009;
        this.glow(x, 0.72 - age * 0.39, 0.003, Math.sin(age * Math.PI) * 0.11, '255,219,156');
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  /** Glows sit on the photographed flames; steam rises only from the two mugs.
   * The feast has its own coordinates, never borrowing the living-room masks. */
  private drawParty() {
    const ctx = this.ctx,
      t = this.time;
    this.canvas.dataset.star = 'hidden';
    const boost = performance.now() < this.state.candleUntil ? 1.7 : 1;
    ctx.globalCompositeOperation = 'screen';
    for (const [x, y, phase] of [
      [0.409, 0.334, 0],
      [0.521, 0.294, 2],
      [0.589, 0.344, 4],
    ]) {
      const flicker = this.state.reduced
        ? 0
        : Math.sin(t * 3.1 + phase) * 0.012 + Math.sin(t * 5.7 + phase) * 0.006;
      this.glow(x, y, 0.039, (0.075 + flicker) * boost);
    }
    ctx.globalCompositeOperation = 'source-over';
    if (!this.state.reduced) {
      const cocoa = performance.now() < this.state.cocoaUntil ? 1.55 : 1;
      wisp(ctx, this.width, this.height, 0.162, 0.574, 0.052 * cocoa, t, cocoa);
      wisp(ctx, this.width, this.height, 0.895, 0.625, 0.052 * cocoa, t + 3, cocoa);
    }
  }
  private drawParticles(dt: number) {
    this.particles = this.particles.filter((p) => p.age < p.life);
    this.canvas.dataset.particles = String(this.particles.length);
    for (const p of this.particles) {
      if (p.delay && p.delay > 0) {
        p.delay = Math.max(0, p.delay - dt);
        continue;
      }
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'snow' || p.kind === 'clump') p.vy += (p.kind === 'clump' ? 0.24 : 0.12) * dt;
      const alpha = Math.min(1, p.age / 0.08) * Math.max(0, Math.min(1, (p.life - p.age) / 0.45));
      const x = p.x * this.width,
        y = p.y * this.height;
      if (p.kind === 'clump') {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(p.phase + p.age * 0.9);
        this.ctx.fillStyle = `rgba(225,239,253,${alpha * 0.64})`;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 1.2, p.size * 0.64, 0, 0, Math.PI * 2);
        this.ctx.ellipse(
          -p.size * 0.5,
          -p.size * 0.35,
          p.size * 0.65,
          p.size * 0.55,
          0,
          0,
          Math.PI * 2,
        );
        this.ctx.fill();
        this.ctx.restore();
        continue;
      }
      this.ctx.beginPath();
      this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle =
        p.kind === 'snow' ? `rgba(235,246,255,${alpha * 0.65})` : `rgba(255,203,106,${alpha})`;
      this.ctx.fill();
      if (p.kind === 'snow' && p.size > 3)
        this.glow(p.x, p.y, (p.size / this.width) * 2, alpha * 0.17, '235,245,255');
    }
  }
}
