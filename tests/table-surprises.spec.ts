import { test, expect } from '@playwright/test';

const reactions = [
  ['Wake the garland lights', 'garland'],
  ['Warm the window lantern', 'lantern'],
  ['Savor the Christmas roast', 'roast'],
  ['Polish the cranberry sparkle', 'berries'],
] as const;

test('table frost wipes with touch, keeps room masks independent and avoids wooden frames', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await page.getByRole('button', { name: 'Enter the cabin', exact: true }).click();
  await page
    .getByRole('button', { name: 'Clear frost from the window', exact: true })
    .press('Enter');
  await page.getByRole('button', { name: 'Visit the Christmas table', exact: true }).click();
  const canvas = page.locator('#surfaces');
  await expect(canvas).toHaveAttribute('data-marks', '0');
  const sample = () =>
    canvas.evaluate((c: HTMLCanvasElement) => {
      const ctx = c.getContext('2d')!;
      const alpha = (x: number, y: number) =>
        ctx.getImageData(Math.floor(x * c.width), Math.floor(y * c.height), 1, 1).data[3];
      return { glass: alpha(0.89, 0.125), frame: alpha(0.84, 0.125), wall: alpha(0.68, 0.13) };
    });
  const before = await sample();
  expect(before.glass).toBeGreaterThan(0);
  expect(before.frame).toBe(0);
  expect(before.wall).toBe(0);
  const box = (await page.locator('#stage').boundingBox())!;
  const points = [
    [0.87, 0.12],
    [0.89, 0.125],
    [0.91, 0.13],
  ];
  if (info.project.name === 'mobile') {
    const session = await page.context().newCDPSession(page);
    for (const [i, [x, y]] of points.entries())
      await session.send('Input.dispatchTouchEvent', {
        type: i === 0 ? 'touchStart' : 'touchMove',
        touchPoints: [{ x: box.x + x * box.width, y: box.y + y * box.height }],
      });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
  } else {
    await page.mouse.move(box.x + points[0][0] * box.width, box.y + points[0][1] * box.height);
    await page.mouse.down();
    for (const [x, y] of points.slice(1))
      await page.mouse.move(box.x + x * box.width, box.y + y * box.height, { steps: 8 });
    await page.mouse.up();
  }
  await expect(canvas).toHaveAttribute('data-marks', '1');
  expect((await sample()).glass).toBeLessThan(before.glass);
  const wiped = await canvas.screenshot();
  await page.getByRole('button', { name: 'Return to the living room', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-marks', '1');
  await page
    .getByRole('button', { name: 'Clear frost from the window', exact: true })
    .press('Enter');
  await expect(canvas).toHaveAttribute('data-marks', '2');
  await page.getByRole('button', { name: 'Visit the Christmas table', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-marks', '1');
  expect((await canvas.screenshot()).equals(wiped)).toBe(true);
  await page
    .getByRole('button', { name: 'Clear frost from the table window', exact: true })
    .press('Enter');
  await expect(canvas).toHaveAttribute('data-marks', '2');
});

test('four table reactions work through real hotspots, expire and clear on travel', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await page.getByRole('button', { name: 'Enter the cabin', exact: true }).click();
  await page.getByRole('button', { name: 'Visit the Christmas table', exact: true }).click();
  const canvas = page.locator('#animation');
  for (const [name, kind] of reactions) {
    const button = page.getByRole('button', { name, exact: true });
    if (info.project.name === 'mobile') await button.tap();
    else await button.click();
    await expect(page.locator('#world')).toHaveAttribute('data-last-action', `party-${kind}`);
    await expect(canvas).toHaveAttribute(`data-${kind}`, 'active');
  }
  for (const [, kind] of reactions)
    await expect(canvas).toHaveAttribute(`data-${kind}`, 'idle', { timeout: 6000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [name, kind] of reactions) {
    await page.getByRole('button', { name, exact: true }).press('Enter');
    await expect(canvas).toHaveAttribute(`data-${kind}`, 'active');
  }
  await page.getByRole('button', { name: 'Return to the living room', exact: true }).click();
  await page.getByRole('button', { name: 'Visit the Christmas table', exact: true }).click();
  for (const [, kind] of reactions) await expect(canvas).toHaveAttribute(`data-${kind}`, 'idle');
  expect(errors).toEqual([]);
});
