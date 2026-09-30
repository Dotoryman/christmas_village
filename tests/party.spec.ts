import { test, expect } from '@playwright/test';

test('visit the feast by touch or mouse, then return with living-room state intact', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const activate = async (name: string) => {
    const target = page.getByRole('button', { name, exact: true });
    if (testInfo.project.name === 'mobile') await target.tap();
    else await target.click();
  };
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await activate('Enter the cabin');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'inside');
  await activate('Indoor tree lights');
  await activate('Enable winter sounds');
  await expect(page.locator('#sound')).toHaveAttribute('data-audio-state', 'running');
  await page.getByRole('button', { name: 'Clear frost from the window' }).press('Enter');
  await activate('Visit the Christmas table');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'party');
  await expect(page.locator('#world')).toHaveAttribute('aria-label', 'Christmas party table');
  await page.locator('#landscape').evaluate((image: HTMLImageElement) => image.decode());
  await expect(page.locator('#plates img')).toHaveCount(0);
  await expect(page.locator('#surfaces')).toHaveAttribute('data-marks', '0');
  await expect(page.locator('#sound')).toHaveAttribute('data-audio-scene', 'party');
  await expect(page.locator('body')).toHaveText('');
  const frame = await page
    .locator('#animation')
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await expect
    .poll(() =>
      page.locator('#animation').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
    )
    .not.toBe(frame);
  await activate('Warm the table candlelight');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'party-candles');
  await activate('Warm the left festive cocoa');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'party-cocoa');
  await activate('Warm the right festive cocoa');
  await expect(page.locator('#world')).toHaveAttribute('data-last-action', 'party-cocoa-right');
  await activate('Return to the living room');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'inside');
  await expect(page.getByRole('button', { name: 'Indoor tree lights' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(page.locator('#surfaces')).toHaveAttribute('data-marks', '1');
  await activate('Return to the village');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'outside');
  expect(errors).toEqual([]);
});

test('party keyboard navigation restores focus and reduced motion stays still', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#world.ready').waitFor();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Enter the cabin' }).press('Enter');
  await page.getByRole('button', { name: 'Visit the Christmas table' }).press('Enter');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'party');
  await expect(page.getByRole('button', { name: 'Return to the living room' })).toBeFocused();
  const frame = await page
    .locator('#animation')
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(180);
  expect(
    await page.locator('#animation').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
  ).toBe(frame);
  await page.keyboard.press('Escape');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'inside');
  await expect(page.getByRole('button', { name: 'Tend the fire' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#world')).toHaveAttribute('data-scene', 'outside');
});
