import { test, expect } from '@playwright/test';

test('glass and gift react while muted and share the enabled audio context', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    const probe = { contexts: 0, tones: 0, active: 0 };
    (window as unknown as { chimeProbe: typeof probe }).chimeProbe = probe;
    window.AudioContext = class extends Native {
      constructor() {
        super();
        probe.contexts++;
      }
      createOscillator() {
        const tone = super.createOscillator();
        probe.tones++;
        probe.active++;
        tone.addEventListener('ended', () => probe.active--);
        return tone;
      }
    };
  });
  const activate = async (name: string) => {
    const button = page.getByRole('button', { name, exact: true });
    if (info.project.name === 'mobile') await button.tap();
    else await button.click();
  };
  const probe = () =>
    page.evaluate(
      () =>
        (window as unknown as { chimeProbe: { contexts: number; tones: number; active: number } })
          .chimeProbe,
    );
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await activate('Enter the cabin');
  await activate('Tend the fire');
  await expect(page.getByRole('button', { name: 'Tend the fire' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect
    .poll(async () => Number(await page.locator('#animation').getAttribute('data-particles')))
    .toBeGreaterThan(0);
  await activate('Visit the Christmas table');
  await activate('Ring the crystal glass');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'glass-chime');
  expect((await probe()).contexts).toBe(0);
  await expect
    .poll(async () => Number(await page.locator('#animation').getAttribute('data-particles')))
    .toBeGreaterThan(0);
  await activate('Enable winter sounds');
  await expect(page.locator('#sound')).toHaveAttribute('data-audio-state', 'running');
  await activate('Ring the crystal glass');
  await expect.poll(async () => (await probe()).tones).toBe(3);
  // Wait for the audio clock, which can advance slower than wall time on CI.
  await expect.poll(async () => (await probe()).active).toBe(0);
  await activate('Discover the table gift');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'party-gift');
  await expect.poll(async () => (await probe()).tones).toBe(6);
  await expect.poll(async () => (await probe()).active).toBe(0);
  await activate('Mute winter sounds');
  await activate('Ring the crystal glass');
  expect((await probe()).tones).toBe(6);
  expect((await probe()).contexts).toBe(1);
});

test('image save menus and dragging are suppressed while interactions remain available', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await expect(page.locator('#landscape')).toHaveAttribute('draggable', 'false');
  await expect(page.locator('#landscape')).toHaveCSS('user-select', 'none');
  expect(
    await page.locator('#landscape').evaluate((image) => {
      const menu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      const drag = new Event('dragstart', { bubbles: true, cancelable: true });
      return [image.dispatchEvent(menu), image.dispatchEvent(drag)];
    }),
  ).toEqual([false, false]);
  await page.getByRole('button', { name: 'Enter the cabin' }).click();
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'inside');
});
