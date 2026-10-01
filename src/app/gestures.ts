// Gestures own capture and hold cancellation; scenes only supply callbacks.
export function bindTree(
  button: HTMLButtonElement,
  startTreeShow: (button: HTMLButtonElement) => void,
  toggle: () => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined,
    held = false,
    pointer: number | undefined,
    startX = 0,
    startY = 0;
  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  const cancelHold = () => {
    clear();
    held = false;
    pointer = undefined;
  };
  button.setAttribute(
    'aria-description',
    'Tap to toggle lights. Hold to light the tree from bottom to top. Keyboard: Shift+Enter.',
  );
  button.onpointerdown = (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    held = false;
    pointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    button.setPointerCapture(pointer);
    timer = setTimeout(() => {
      timer = undefined;
      held = true;
      startTreeShow(button);
    }, 650);
  };
  button.onpointermove = (event) => {
    if (
      event.pointerId === pointer &&
      Math.hypot(event.clientX - startX, event.clientY - startY) > 14
    )
      clear();
  };
  button.onpointerup = () => {
    clear();
    pointer = undefined;
  };
  button.onpointercancel = () => {
    clear();
    pointer = undefined;
    held = false;
  };
  button.onlostpointercapture = clear;
  button.oncontextmenu = (event) => event.preventDefault();
  button.onkeydown = (event) => {
    if (event.shiftKey && event.key === 'Enter') {
      event.preventDefault();
      startTreeShow(button);
    }
  };
  button.onclick = (event) => {
    if (held && event.detail !== 0) {
      held = false;
      return;
    }
    held = false;
    toggle();
  };
  return cancelHold;
}
/** Pointer capture keeps a sweep continuous, even if the finger leaves the zone.
 * Distance throttling bounds particles and prevents a puff on every tiny event. */
export function bindPowder(
  button: HTMLButtonElement,
  stage: HTMLElement,
  emit: (x: number, y: number) => void,
  touch: () => void,
  track: () => void,
) {
  let pointer: number | undefined,
    lastX = 0,
    lastY = 0;
  const puff = (event: PointerEvent) => {
    const box = stage.getBoundingClientRect();
    emit((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height);
    lastX = event.clientX;
    lastY = event.clientY;
    track();
  };
  button.onpointerdown = (event) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    pointer = event.pointerId;
    button.setPointerCapture(pointer);
    puff(event);
    touch();
  };
  button.onpointermove = (event) => {
    if (pointer === event.pointerId && Math.hypot(event.clientX - lastX, event.clientY - lastY) > 9)
      puff(event);
  };
  const end = () => {
    pointer = undefined;
  };
  button.onpointerup = end;
  button.onpointercancel = end;
  button.onlostpointercapture = end;
  button.onclick = (event) => {
    if (event.detail === 0) {
      emit(0.34, 0.86);
      touch();
      track();
    }
  };
}
