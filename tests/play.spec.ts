import { test, expect } from '@playwright/test';

async function drag(
  page: import('@playwright/test').Page,
  selector: string,
  points: [number, number][],
  touch = false,
) {
  const box = (await page.locator(selector).boundingBox())!;
  if (touch) {
    const session = await page.context().newCDPSession(page);
    const send = async (type: 'touchStart' | 'touchMove' | 'touchEnd', point?: [number, number]) =>
      session.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: point
          ? [{ x: box.x + point[0] * box.width, y: box.y + point[1] * box.height }]
          : [],
      });
    await send('touchStart', points[0]);
    for (const point of points.slice(1)) await send('touchMove', point);
    await send('touchEnd');
    await session.detach();
    return;
  }
  await page.mouse.move(box.x + points[0][0] * box.width, box.y + points[0][1] * box.height);
  await page.mouse.down();
  for (const [x, y] of points.slice(1))
    await page.mouse.move(box.x + x * box.width, box.y + y * box.height, { steps: 8 });
  await page.mouse.up();
}

test('sweep powder without drawn lines, wipe frost and preserve glass marks', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  const surfaces = page.locator('#surfaces');
  await drag(
    page,
    '[data-action="powder"]',
    [
      [0.2, 0.25],
      [0.3, 0.5],
      [0.45, 0.25],
      [0.6, 0.5],
    ],
    testInfo.project.name === 'mobile',
  );
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'powder');
  await expect.poll(() => page.locator('#animation').getAttribute('data-particles')).not.toBe('0');
  await expect(surfaces).toHaveAttribute('data-marks', '0');
  // Read the transparent canvas itself: screenshots also include the moving snow behind it.
  expect(
    await surfaces.evaluate((element: HTMLCanvasElement) => {
      const pixels = element
        .getContext('2d')!
        .getImageData(0, 0, element.width, element.height).data;
      return pixels.every((value, index) => index % 4 !== 3 || value === 0);
    }),
  ).toBe(true);
  await expect(page.getByRole('button', { name: 'Draw in the snow', exact: true })).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Enter the cabin', exact: true }).click();
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'inside');
  const frost = await surfaces.screenshot();
  await drag(
    page,
    '[data-action="frost"]',
    [
      [0.12, 0.16],
      [0.5, 0.5],
      [0.85, 0.85],
      [0.2, 0.85],
    ],
    testInfo.project.name === 'mobile',
  );
  await expect(surfaces).toHaveAttribute('data-marks', '1');
  expect((await surfaces.screenshot()).equals(frost)).toBe(false);
  const still = await surfaces.screenshot();
  await page.waitForTimeout(180);
  expect((await surfaces.screenshot()).equals(still)).toBe(true);
  await page.getByRole('button', { name: 'Return to the village', exact: true }).click();
  await expect(surfaces).toHaveAttribute('data-marks', '0');
  await page.getByRole('button', { name: 'Sweep the powder snow', exact: true }).press('Enter');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'powder');
  await page.getByRole('button', { name: 'Enter the cabin', exact: true }).click();
  await expect(surfaces).toHaveAttribute('data-marks', '1');
  expect(errors).toEqual([]);
});

test('holding tree runs upward lighting and release does not toggle it off', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  const tree = page.getByRole('button', { name: 'Christmas tree lights', exact: true }),
    box = (await tree.boundingBox())!;
  const session =
    testInfo.project.name === 'mobile' ? await page.context().newCDPSession(page) : null;
  if (session)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 }],
    });
  else {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.down();
  }
  await expect(page.locator('#stage')).toHaveAttribute('data-tree-show', 'running');
  if (session) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else await page.mouse.up();
  await expect(tree).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-plate="tree"]')).toHaveClass(/sequencing/);
  await expect(page.locator('#stage')).toHaveAttribute('data-tree-show', 'done', { timeout: 6000 });
  await expect(page.locator('[data-plate="tree"]')).toHaveCSS('opacity', '0');
  await tree.click();
  await expect(tree).toHaveAttribute('aria-pressed', 'false');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tree.press('Shift+Enter');
  await expect(page.locator('#stage')).toHaveAttribute('data-tree-show', 'done');
  await expect(tree).toHaveAttribute('aria-pressed', 'true');
});

test('sound starts only by its button, changes with room and mutes', async ({ page }) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const probe = {
      count: 0,
      context: null as AudioContext | null,
      analyser: null as AnalyserNode | null,
    };
    (window as unknown as { audioProbe: typeof probe }).audioProbe = probe;
    window.AudioContext = class extends Native {
      constructor() {
        super();
        probe.count++;
        probe.context = this;
      }
      createGain() {
        const gain = super.createGain();
        if (!probe.analyser) {
          probe.analyser = this.createAnalyser();
          probe.analyser.fftSize = 256;
          gain.connect(probe.analyser);
        }
        return gain;
      }
    };
  });
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  expect(
    await page.evaluate(
      () => (window as unknown as { audioProbe: { count: number } }).audioProbe.count,
    ),
  ).toBe(0);
  await page.getByRole('button', { name: 'Enable winter sounds', exact: true }).click();
  const mute = page.getByRole('button', { name: 'Mute winter sounds', exact: true });
  await expect(mute).toHaveAttribute('aria-pressed', 'true');
  await expect(mute).toHaveAttribute('data-audio-state', 'running');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const a = (window as unknown as { audioProbe: { analyser: AnalyserNode } }).audioProbe
            .analyser,
          bytes = new Uint8Array(a.fftSize);
        a.getByteTimeDomainData(bytes);
        return bytes.some((b) => b !== 128);
      }),
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Enter the cabin', exact: true }).click();
  await expect(mute).toHaveAttribute('data-audio-scene', 'inside');
  await mute.click();
  await expect(
    page.getByRole('button', { name: 'Enable winter sounds', exact: true }),
  ).toHaveAttribute('data-audio-state', 'suspended');
  await page.getByRole('button', { name: 'Enable winter sounds', exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { audioProbe: { count: number } }).audioProbe.count,
    ),
  ).toBe(1);
});
