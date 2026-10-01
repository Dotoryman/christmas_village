import { createActions } from './actions';
import type { Scene } from '../scenes/types';
import { bindTree, bindPowder } from './gestures';
import { VillageAnimation, type AnimationState } from '../effects/animation';
import { images, offImages, targets, scenes, type Target } from '../scene-config';
import { FrostWindow } from '../effects/frost';
import { WinterSound } from '../effects/sound';
import '../style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<main id="world" aria-label="Christmas Village"><div id="ambient" aria-hidden="true"></div><div id="stage"><img id="landscape" alt="" draggable="false"><div id="plates" aria-hidden="true"></div><canvas id="animation" aria-hidden="true"></canvas><canvas id="surfaces" aria-hidden="true"></canvas><div id="targets"></div><button id="sound" aria-label="Enable winter sounds" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path class="waves" d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/><path class="slash" d="M16 9l5 6m0-6l-5 6"/></svg></button></div><div id="fade" aria-hidden="true"></div></main>`;
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
  scene,
  lit: (id) => lightStates.get(stateKey(id)) ?? true,
  cocoaUntil: 0,
  candleUntil: 0,
  reduced: media.matches,
};
const surfaces = new FrostWindow(document.querySelector<HTMLCanvasElement>('#surfaces')!);
const sound = new WinterSound(document.querySelector<HTMLButtonElement>('#sound')!);
/** Remove the dark tree mask without flashing the fully dark image for a frame. */
function finishTreePlate(plate: HTMLImageElement | null) {
  if (!plate) return;
  plate.style.opacity = '0';
  plate.classList.remove('off');
  plate.style.maskImage = '';
  void plate.offsetWidth;
  plate.classList.remove('sequencing');
  plate.style.opacity = '';
}
const engine = new VillageAnimation(canvas, animationState, (dt, progress) => {
  surfaces.draw(dt);
  if (stage.dataset.treeShow === 'running') {
    const plate = plates.querySelector<HTMLImageElement>('[data-plate="tree"]');
    const [top, bottom] = scenes[scene].treeBounds ?? [0, 1];
    const edge = (bottom - (bottom - top) * progress) * 100;
    if (plate)
      plate.style.maskImage = `linear-gradient(to bottom,black ${edge}%,transparent ${edge + 1.5}%)`;
    if (progress === 1) {
      stage.dataset.treeShow = 'done';
      finishTreePlate(plate);
    }
  }
});
let cancelHold: () => void = () => {};
const imageCache = new Map<string, HTMLImageElement>();
/** Reuse decoded plates so doorway transitions do not flash unloaded artwork. */
async function preload(src: string) {
  let image = imageCache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    imageCache.set(src, image);
  }
  await image.decode();
}
function position(element: HTMLElement, target: Target) {
  Object.assign(element.style, {
    left: `${target.x}%`,
    top: `${target.y}%`,
    width: `${target.w}%`,
    height: `${target.h}%`,
  });
}
function addPlate(id: string, mask: string, off: boolean) {
  const image = document.createElement('img');
  image.className = 'switch-plate';
  image.src = offImages[scene];
  image.alt = '';
  image.draggable = false;
  image.dataset.plate = id;
  image.style.clipPath = mask;
  image.classList.toggle('off', off);
  plates.append(image);
}
/** Rebuild only scene-specific plates and hotspots; sound and frost survive. */
function render() {
  cancelHold();
  delete stage.dataset.treeShow;
  world.dataset.scene = scene;
  animationState.scene = scene;
  stage.className = '';
  landscape.src = images[scene];
  ambient.style.backgroundImage = `url("${images[scene]}")`;
  world.setAttribute('aria-label', scenes[scene].label);
  targetLayer.replaceChildren();
  plates.replaceChildren();
  for (const plate of scenes[scene].plates ?? []) addPlate(plate.id, plate.mask, plate.off);
  for (const target of targets[scene]) {
    const button = document.createElement('button');
    button.className = `target ${target.id}`;
    button.dataset.action = target.id;
    button.setAttribute('aria-label', target.name);
    position(button, target);
    if (target.light) {
      if (!lightStates.has(stateKey(target.id)))
        lightStates.set(stateKey(target.id), target.id !== 'fire');
      const on = lightStates.get(stateKey(target.id))!;
      if (target.mask) addPlate(target.id, target.mask, !on);
      button.setAttribute('aria-pressed', String(on));
    }
    if (target.id === 'frost') {
      button.classList.add('paint-surface');
      surfaces.bind(button, () => {
        trackAction(target.id);
        sound.snowTouch();
      });
    } else if (target.id === 'powder') {
      button.classList.add('paint-surface');
      bindPowder(
        button,
        stage,
        (x, y) => engine.powder(x, y),
        () => sound.snowTouch(),
        () => trackAction('powder'),
      );
    } else if (target.id === 'tree')
      cancelHold = bindTree(button, startTreeShow, () => {
        engine.cancelTree();
        delete stage.dataset.treeShow;
        const plate = plates.querySelector<HTMLImageElement>('[data-plate="tree"]');
        plate?.classList.remove('sequencing');
        if (plate) plate.style.maskImage = '';
        interact(target, button);
      });
    else button.onclick = () => interact(target, button);
    targetLayer.append(button);
  }
  for (const className of scenes[scene].decorations ?? []) {
    const decoration = document.createElement('img');
    decoration.src = images[scene];
    decoration.alt = '';
    decoration.className = className;
    decoration.draggable = false;
    plates.append(decoration);
  }
  surfaces.setScene(scene);
  sound.setScene(scene);
  engine.reset();
}
/** A hold forces lights on; releasing it must never trigger the short-tap toggle. */
function startTreeShow(button: HTMLButtonElement) {
  if (busy) return;
  lightStates.set(stateKey('tree'), true);
  button.setAttribute('aria-pressed', 'true');
  trackAction('tree-show');
  const plate = plates.querySelector<HTMLImageElement>('[data-plate="tree"]');
  if (animationState.reduced) {
    stage.dataset.treeShow = 'done';
    finishTreePlate(plate);
  } else {
    stage.dataset.treeShow = 'running';
    plate?.classList.add('off', 'sequencing');
    if (plate) plate.style.maskImage = 'linear-gradient(black,black)';
  }
  engine.lightTree();
}
function trackAction(id: string) {
  world.dataset.lastAction = id;
  world.dataset.actionSerial = String(++actionSerial);
}
/** Decode the destination under the fade, then swap both visual and sound scenes. */
async function travel(next: Scene) {
  if (busy) return;
  busy = true;
  targetLayer.inert = true;
  cancelHold();
  // Zoom toward the object actually used: front door, table or return archway.
  const [x, y] = scenes[scene].destinationOrigins?.[next] ?? scenes[scene].origin;
  stage.style.setProperty('--door-x', `${x}%`);
  stage.style.setProperty('--door-y', `${y}%`);
  world.classList.add('travelling');
  try {
    await Promise.all([
      preload(images[next]),
      preload(offImages[next]),
      new Promise((resolve) => setTimeout(resolve, media.matches ? 0 : 440)),
    ]);
    scene = next;
    animationState.cocoaUntil = animationState.candleUntil = 0;
    render();
    world.classList.remove('travelling');
    targetLayer.inert = false;
    if (keyboardMode)
      targetLayer
        .querySelector<HTMLButtonElement>(`[data-action="${scenes[scene].focus}"]`)!
        .focus({ preventScroll: true });
    trackAction('travel');
  } catch {
    // A failed image request keeps the current scene playable; retry the door.
    world.classList.remove('travelling');
  } finally {
    busy = false;
    targetLayer.inert = false;
  }
}
// Actions are registered separately from rendering and navigation.
const actions: Record<string, () => void> = createActions({
  engine,
  state: animationState,
  travel: (next) => {
    void travel(next);
  },
  openGift: () => {
    stage.classList.remove('gift-open');
    void stage.offsetWidth;
    stage.classList.add('gift-open');
    setTimeout(() => stage.classList.remove('gift-open'), 1800);
  },
});
function interact(target: Target, button: HTMLButtonElement) {
  if (busy) return;
  trackAction(target.id);
  if (target.light) {
    const on = !lightStates.get(stateKey(target.id));
    lightStates.set(stateKey(target.id), on);
    button.setAttribute('aria-pressed', String(on));
    plates.querySelector<HTMLElement>(`[data-plate="${target.id}"]`)?.classList.toggle('off', !on);
  } else actions[target.id]?.();
  if (animationState.reduced) engine.start();
}
function applyMotion() {
  animationState.reduced = media.matches;
  document.documentElement.classList.toggle('reduced-motion', media.matches);
  canvas.dataset.motion = media.matches ? 'still' : 'running';
  engine.start();
  if (media.matches && stage.dataset.treeShow === 'running') {
    engine.cancelTree();
    stage.dataset.treeShow = 'done';
    finishTreePlate(plates.querySelector<HTMLImageElement>('[data-plate="tree"]'));
  }
}
media.addEventListener('change', applyMotion);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') keyboardMode = true;
  const destination = scenes[scene].escape;
  if (event.key === 'Escape' && destination) void travel(destination);
});
document.addEventListener('pointerdown', () => {
  keyboardMode = false;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelHold();
});
world.addEventListener('pointermove', (event) => {
  if (
    event.pointerType !== 'mouse' ||
    media.matches ||
    busy ||
    (event.target as HTMLElement).closest('.paint-surface')
  )
    return;
  const box = world.getBoundingClientRect();
  stage.style.setProperty('--look-x', `${(event.clientX / box.width - 0.5) * 2}px`);
  stage.style.setProperty('--look-y', `${(event.clientY / box.height - 0.5) * 1.2}px`);
});
world.addEventListener('pointerleave', () => {
  stage.style.setProperty('--look-x', '0px');
  stage.style.setProperty('--look-y', '0px');
});
render();
applyMotion();
// Keep the first view fast; decode indoor artwork during idle time for smooth visits.
const loadRoom = () => {
  void Promise.all([
    preload(images.inside),
    preload(offImages.inside),
    preload(images.party),
  ]).catch(() => {});
};
void preload(images.outside)
  .then(() => {
    world.classList.add('ready');
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadRoom);
    else setTimeout(loadRoom, 900);
  })
  .catch(() => world.classList.add('ready'));
