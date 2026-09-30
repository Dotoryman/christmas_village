import fireArt from './assets/inside.webp';
import { FoxVisitor } from './fox';
import { wisp, windowSnow } from './atmosphere';
export type Scene = 'outside' | 'inside';
export interface AnimationState {
  scene: Scene;
  lit: (id: string) => boolean;
  cocoaUntil: number;
  reduced: boolean;
}
type Particle = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; kind: 'snow' | 'spark'; phase: number };
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
  private fox = new FoxVisitor();
  private starAge = -11;
  private windUntil = 0;
  private glowSprites = new Map<string, HTMLCanvasElement>();
  private snow: Flake[] = Array.from({ length: 135 }, () => ({ x: Math.random(), y: Math.random(), depth: random(.15, 1), phase: random(0, Math.PI * 2) }));
  private observer: ResizeObserver;
  private visibility = () => { this.stop(); if (!document.hidden) this.start(); };
  constructor(private canvas: HTMLCanvasElement, private state: AnimationState) {
    this.ctx = canvas.getContext('2d', { alpha: true })!;
    this.fireImage.src = fireArt;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    document.addEventListener('visibilitychange', this.visibility);
    this.resize(); this.start();
  }
  private resize() {
    const box = this.canvas.getBoundingClientRect();
    this.width = box.width; this.height = box.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(box.width * dpr));
    this.canvas.height = Math.max(1, Math.round(box.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw(0);
  }
  start() {
    this.stop(); this.last = 0;
    if (document.hidden) return;
    if (this.state.reduced) { this.draw(0); return; }
    this.frame = requestAnimationFrame(this.tick);
  }
  stop() { cancelAnimationFrame(this.frame); this.frame = 0; }
  reset() { this.particles = []; this.start(); }
  inviteFox() { if (!this.state.reduced) this.fox.invite(); }
  makeWish() { if (!this.state.reduced) this.starAge = 0; }
  destroy() { this.stop(); this.observer.disconnect(); document.removeEventListener('visibilitychange', this.visibility); }
  private tick = (now: number) => {
    const dt = this.last ? Math.min((now - this.last) / 1000, .04) : 0;
    this.last = now; this.time += dt;
    this.draw(dt);
    this.frame = requestAnimationFrame(this.tick);
  };
  burst(kind: 'roof' | 'gift' | 'snowman') {
    if (this.state.reduced) return;
    if (kind === 'snowman') this.windUntil = this.time + 3;
    const count = kind === 'roof' ? 95 : kind === 'gift' ? 48 : 24;
    for (let i = 0; i < count; i++) {
      const roofX = random(.16, .75);
      const roofY = .276 + Math.abs(roofX - .53) * .37;
      this.particles.push({
        x: kind === 'roof' ? roofX : kind === 'gift' ? random(.13, .30) : random(.81, .93),
        y: kind === 'roof' ? roofY : kind === 'gift' ? random(.635, .68) : .64,
        vx: random(-.07, .07), vy: kind === 'roof' ? random(.015, .06) : random(-.15, -.045),
        life: random(1.2, 2.8), age: 0, size: kind === 'roof' ? random(1.5, 5.5) : random(.8, 2.6),
        kind: kind === 'gift' ? 'spark' : 'snow', phase: random(0, 7),
      });
    }
    this.particles = this.particles.slice(-240);
  }
  private glow(x: number, y: number, radius: number, alpha: number, color = '255,182,70') {
    const ctx = this.ctx, px = x * this.width, py = y * this.height, r = radius * this.width;
    if (r <= 0) return;
    let sprite = this.glowSprites.get(color);
    if (!sprite) {
      sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
      const ink = sprite.getContext('2d')!;
      const gradient = ink.createRadialGradient(32,32,0,32,32,32);
      gradient.addColorStop(0, `rgba(${color},1)`); gradient.addColorStop(.3, `rgba(${color},.36)`); gradient.addColorStop(1, `rgba(${color},0)`);
      ink.fillStyle = gradient; ink.fillRect(0,0,64,64); this.glowSprites.set(color,sprite);
    }
    const previous = ctx.globalAlpha; ctx.globalAlpha = previous * Math.max(0,Math.min(1,alpha));
    ctx.drawImage(sprite,px-r,py-r,r*2,r*2); ctx.globalAlpha = previous;
  }
  private draw(dt: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    if (this.width < 1 || this.height < 1) return;
    if (this.state.scene === 'outside') this.drawOutside(dt); else this.drawInside(dt);
    if (!this.state.reduced) this.drawParticles(dt);
  }
  private drawOutside(dt: number) {
    const ctx = this.ctx, t = this.time;
    ctx.globalCompositeOperation = 'screen';
    if (this.state.lit('left-window')) this.glow(.275, .505, .08, .055);
    if (this.state.lit('right-window')) this.glow(.67, .515, .07, .055);
    if (this.state.lit('lantern')) this.glow(.20, .698, .065, .09 + Math.sin(t * 3) * .018);
    if (this.state.lit('tree')) this.drawTree(.805, .41, .17, .28);
    ctx.globalCompositeOperation = 'source-over';
    const fox = this.fox.draw(ctx,this.width,this.height,dt,this.state.reduced);
    this.canvas.dataset.fox = fox.status; this.canvas.dataset.foxFrame = String(fox.frame);
    if (!this.state.reduced) {
      wisp(ctx,this.width,this.height,.31,.22,.16,t,.8,true);
      this.drawShootingStar(dt);
      this.drawSnow(dt);
    } else this.canvas.dataset.star = 'still';
  }
  private drawSnow(dt: number) {
    const ctx = this.ctx, t = this.time;
    const gust = t < this.windUntil ? Math.sin((this.windUntil - t) / 3 * Math.PI) * .035 : 0;
    for (const flake of this.snow) {
      flake.y += dt * (.011 + flake.depth * .032);
      flake.x += dt * (.003 + Math.sin(t * .24 + flake.phase) * .009 + gust) * flake.depth;
      if (flake.y > 1.03) { flake.y = -.03; flake.x = Math.random(); }
      if (flake.x > 1.05) flake.x = -.05;
      if (flake.x < -.05) flake.x = 1.05;
      const x = flake.x + Math.sin(t * .5 + flake.phase) * .009 * flake.depth;
      if (flake.depth > .78) this.glow(x,flake.y,.003 + flake.depth * .003,.25,'235,245,255');
      else {
        ctx.beginPath(); ctx.arc(x * this.width,flake.y * this.height,.35 + flake.depth * .7,0,Math.PI*2);
        ctx.fillStyle = `rgba(231,242,255,${.12 + flake.depth * .3})`; ctx.fill();
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
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for(let i=0;i<24;i++) {
      const u = progress - i * .008;
      if(u<0) continue;
      const opacity = Math.sin(progress * Math.PI) * (1-i/24) * .7;
      ctx.strokeStyle = `rgba(221,239,255,${opacity})`; ctx.lineWidth = Math.max(.9,this.width*.0015);
      ctx.beginPath(); ctx.moveTo((.18+u*.46)*this.width,(.045+u*.076)*this.height);
      ctx.lineTo((.18+(u+.008)*.46)*this.width,(.045+(u+.008)*.076)*this.height); ctx.stroke();
    }
    this.glow(.18+progress*.46,.045+progress*.076,.013,Math.sin(progress*Math.PI)*.55,'215,237,255');
    ctx.restore();
  }
  private drawTree(cx: number, top: number, spread: number, height: number) {
    for (let row = 0; row < 6; row++) {
      const n = 4 + row * 2;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), depth = (row + 1) / 6;
        const x = cx + (u - .5) * spread * depth * 1.7;
        const y = top + height * depth + Math.sin(u * Math.PI) * .006;
        const shimmer = .5 + .5 * Math.sin(this.time * .75 + row * 1.4 + i * .67);
        this.glow(x, y, .01, .035 + shimmer * .09);
      }
    }
  }
  private drawInside(dt: number) {
    const ctx = this.ctx, t = this.time;
    this.canvas.dataset.fox = 'hidden'; this.canvas.dataset.star = 'hidden';
    if(!this.state.reduced) windowSnow(ctx,this.width,this.height,t);
    ctx.globalCompositeOperation = 'screen';
    if (this.state.lit('tree')) this.drawTree(.13, .28, .18, .34);
    if (this.state.lit('candle')) this.glow(.318, .322, .035, .14 + Math.sin(t * 4) * .025);
    const boost = this.state.lit('fire') ? 1.25 : .85;
    this.glow(.425, .565, .22, (.07 + .016 * Math.sin(t * 2.8) + .008 * Math.sin(t * 7)) * boost);
    ctx.globalCompositeOperation = 'source-over';
    // Displace the original photographic fire in overlapping scanlines. This keeps
    // the fine flame texture, with a small upward shimmer rather than solid shapes.
    ctx.save(); ctx.beginPath(); ctx.rect(this.width * .318, this.height * .478, this.width * .225, this.height * .108); ctx.clip();
    if (this.fireImage.complete && this.fireImage.naturalWidth) {
      const art = this.fireImage, y0 = .478, y1 = .586, step = 2 / this.height;
      for (let y = y0; y < y1; y += step) {
        const strength = y > .512 && y < .574 ? Math.sin((y - .512) / .062 * Math.PI) : 0;
        const shift = this.state.reduced ? 0 : Math.sin(t * 5.1 + y * 85) * this.width * .0017 * strength;
        const rise = this.state.reduced ? 0 : Math.sin(t * 3.8 + y * 34) * this.height * .0011 * strength;
        ctx.drawImage(art, art.width * .318, art.height * y, art.width * .225, art.height * (step + .001), this.width * .318 + shift, this.height * y + rise, this.width * .225, this.height * (step + .001));
      }
      ctx.globalCompositeOperation = 'screen';
      this.glow(.425, .563, .065, .03 * boost + .012 * Math.sin(t * 8));
      ctx.globalCompositeOperation = 'source-over';
    }
    if (!this.state.reduced && Math.random() < dt * 12) this.particles.push({ x: random(.35,.51), y: .56, vx: random(-.013,.013), vy: random(-.10,-.045), life: random(.5,1.3), age: 0, size: random(.5,1.4), kind: 'spark', phase: 0 });
    ctx.restore();
    if (!this.state.reduced) {
      const cocoa = performance.now() < this.state.cocoaUntil ? 1.7 : 1;
      wisp(ctx,this.width,this.height,.547,.665,.052*cocoa,t,cocoa);
      ctx.globalCompositeOperation = 'screen';
      for(let i=0;i<18;i++) {
        const age = (t * .009 + i *.071) % 1;
        const x = .28 + (i * .131 % .5) + Math.sin(t*.18+i)*.009;
        this.glow(x,.72-age*.39,.003,Math.sin(age*Math.PI)*.11,'255,219,156');
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  private drawParticles(dt: number) {
    this.particles = this.particles.filter(p => p.age < p.life);
    this.canvas.dataset.particles = String(this.particles.length);
    for (const p of this.particles) {
      p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'snow') p.vy += .20 * dt;
      const alpha = Math.max(0, 1 - p.age / p.life);
      const x = p.x * this.width, y = p.y * this.height;
      this.ctx.beginPath(); this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.kind === 'snow' ? `rgba(235,246,255,${alpha * .65})` : `rgba(255,203,106,${alpha})`;
      this.ctx.fill();
      if(p.kind === 'snow' && p.size > 3) this.glow(p.x,p.y,p.size/this.width*2,alpha*.17,'235,245,255');
    }
  }
}
