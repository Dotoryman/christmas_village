import { VillageAnimation, type AnimationState, type Scene } from './animation';
import { images, offImages, targets, type Target } from './scene-config';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main id="world" aria-label="크리스마스 마을"><div id="ambient" aria-hidden="true"></div><div id="stage"><img id="landscape" alt="" draggable="false"><div id="plates" aria-hidden="true"></div><canvas id="animation" aria-hidden="true"></canvas><div id="targets"></div></div><div id="fade" aria-hidden="true"></div></main>`;
const world = document.querySelector<HTMLElement>('#world')!;
const stage = document.querySelector<HTMLDivElement>('#stage')!;
const landscape = document.querySelector<HTMLImageElement>('#landscape')!;
const ambient = document.querySelector<HTMLDivElement>('#ambient')!;
const targetLayer = document.querySelector<HTMLDivElement>('#targets')!;
const plates = document.querySelector<HTMLDivElement>('#plates')!;
const canvas = document.querySelector<HTMLCanvasElement>('#animation')!;
const media = matchMedia('(prefers-reduced-motion: reduce)');
const lightStates = new Map<string, boolean>();
let scene: Scene = 'outside';
let busy = false;
let keyboardMode = false;
let actionSerial = 0;
const stateKey = (id: string) => `${scene}:${id}`;
const animationState: AnimationState = {
  scene, lit: id => lightStates.get(stateKey(id)) ?? true,
  cocoaUntil: 0, snowmanUntil: 0, reduced: media.matches,
};
const engine = new VillageAnimation(canvas, animationState);
const imageCache = new Map<string, HTMLImageElement>();
async function preload(src: string) {
  let image = imageCache.get(src);
  if (!image) { image = new Image(); image.src = src; imageCache.set(src, image); }
  await image.decode();
}
function position(element: HTMLElement, target: Target) {
  Object.assign(element.style, { left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%`, height: `${target.h}%` });
}
function addPlate(id: string, mask: string, off: boolean) {
  const image = document.createElement('img'); image.className = 'switch-plate';
  image.src = offImages[scene]; image.alt = ''; image.draggable = false;
  image.dataset.plate = id; image.style.clipPath = mask;
  image.classList.toggle('off', off); plates.append(image);
}
function render() {
  world.dataset.scene = scene; animationState.scene = scene;
  stage.className = '';
  landscape.src = images[scene]; ambient.style.backgroundImage = `url("${images[scene]}")`;
  world.setAttribute('aria-label', scene === 'outside' ? '눈 내리는 숲 속 오두막' : '따뜻한 오두막 실내');
  targetLayer.replaceChildren(); plates.replaceChildren();
  if (scene === 'inside') addPlate('firebox', 'polygon(31.2% 49%,34% 47.2%,52% 47.2%,55% 49%,55% 59.6%,31.2% 59.6%)', true);
  for (const target of targets[scene]) {
    const button = document.createElement('button'); button.className = `target ${target.id}`;
    button.dataset.action = target.id; button.setAttribute('aria-label', target.name); position(button, target);
    if (target.light) {
      if (!lightStates.has(stateKey(target.id))) lightStates.set(stateKey(target.id), target.id !== 'fire');
      const on = lightStates.get(stateKey(target.id))!;
      if (target.mask) addPlate(target.id, target.mask, !on);
      button.setAttribute('aria-pressed', String(on));
    }
    button.onclick = () => interact(target, button); targetLayer.append(button);
  }
  if (scene === 'inside') {
    const gifts = document.createElement('img'); gifts.src = images.inside; gifts.alt = ''; gifts.className = 'gift-ribbon'; gifts.draggable = false; plates.append(gifts);
  }
  engine.reset();
}
function trackAction(id: string) {
  world.dataset.lastAction = id; world.dataset.actionSerial = String(++actionSerial);
}
async function travel(next: Scene) {
  if (busy) return;
  busy = true; targetLayer.inert = true;
  stage.style.setProperty('--door-x', scene === 'outside' ? '48%' : '92%');
  stage.style.setProperty('--door-y', scene === 'outside' ? '55%' : '45%');
  world.classList.add('travelling');
  try {
    await Promise.all([preload(images[next]), preload(offImages[next]), new Promise(resolve => setTimeout(resolve, media.matches ? 0 : 440))]);
    scene = next; render(); world.classList.remove('travelling');
    if (keyboardMode) targetLayer.querySelector<HTMLButtonElement>(`[data-action="${scene === 'inside' ? 'fire' : 'enter'}"]`)!.focus({ preventScroll: true });
    trackAction('travel');
  } catch {
    // A failed image request keeps the current scene playable; retry the door.
    world.classList.remove('travelling');
  } finally { busy = false; targetLayer.inert = false; }
}
function interact(target: Target, button: HTMLButtonElement) {
  if (busy) return;
  if (target.id === 'enter' || target.id === 'exit') { void travel(target.id === 'enter' ? 'inside' : 'outside'); return; }
  trackAction(target.id);
  if (target.light) {
    const on = !lightStates.get(stateKey(target.id)); lightStates.set(stateKey(target.id), on);
    button.setAttribute('aria-pressed', String(on));
    plates.querySelector<HTMLElement>(`[data-plate="${target.id}"]`)?.classList.toggle('off', !on);
  } else if (target.id === 'roof' || target.id === 'gift' || target.id === 'snowman') {
    engine.burst(target.id);
    if (target.id === 'gift') {
      stage.classList.remove('gift-open'); void stage.offsetWidth; stage.classList.add('gift-open');
      setTimeout(() => stage.classList.remove('gift-open'), 1800);
    }
  } else if (target.id === 'mug') animationState.cocoaUntil = performance.now() + 3500;
  if (animationState.reduced) engine.start();
}
function applyMotion() {
  animationState.reduced = media.matches;
  document.documentElement.classList.toggle('reduced-motion', media.matches);
  canvas.dataset.motion = media.matches ? 'still' : 'running'; engine.start();
}
media.addEventListener('change', applyMotion);
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') keyboardMode = true;
  if (event.key === 'Escape' && scene === 'inside') void travel('outside');
});
document.addEventListener('pointerdown', () => { keyboardMode = false; });
world.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || media.matches || busy) return;
  const box = world.getBoundingClientRect();
  stage.style.setProperty('--look-x', `${(event.clientX / box.width - .5) * 2}px`);
  stage.style.setProperty('--look-y', `${(event.clientY / box.height - .5) * 1.2}px`);
});
world.addEventListener('pointerleave', () => { stage.style.setProperty('--look-x', '0px'); stage.style.setProperty('--look-y', '0px'); });
render(); applyMotion();
// The first scene loads first. Preload the room during idle time.
const loadRoom = () => { void Promise.all([preload(images.inside), preload(offImages.inside)]).catch(() => {}); };
void preload(images.outside).then(() => {
  world.classList.add('ready');
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadRoom); else setTimeout(loadRoom, 900);
}).catch(() => world.classList.add('ready'));
