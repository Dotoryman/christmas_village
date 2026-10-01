import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
assert.deepEqual(
  await readFile('dist-ios/index.html'),
  await readFile('ios/ChristmasVillage/Web/index.html'),
);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ offline: true });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(new URL('../dist-ios/index.html', import.meta.url).href);
  assert.ok(
    await page.locator('link[rel="icon"]').evaluate((icon) => icon.href.startsWith('data:')),
    'Offline favicon must be embedded',
  );
  await page.locator('#landscape').evaluate((image) => image.decode());
  assert.equal(await page.getByRole('button', { name: /fox/i }).count(), 0);
  await page.getByRole('button', { name: 'Brush snow off the pine branches' }).click();
  assert.equal(await page.locator('#world').getAttribute('data-last-action'), 'branches');
  await page.getByRole('button', { name: 'Sweep the powder snow', exact: true }).press('Enter');
  assert.equal(await page.locator('#world').getAttribute('data-last-action'), 'powder');
  await page
    .getByRole('button', { name: 'Christmas tree lights', exact: true })
    .press('Shift+Enter');
  await page.locator('#stage[data-tree-show="done"]').waitFor();
  await page.getByRole('button', { name: 'Enable winter sounds', exact: true }).click();
  await page.locator('#sound[data-audio-state="running"]').waitFor();
  await page.getByRole('button', { name: 'Enter the cabin' }).click();
  await page.getByRole('button', { name: 'Tend the fire' }).waitFor();
  await page.locator('#landscape').evaluate((image) => image.decode());
  await page
    .getByRole('button', { name: 'Clear frost from the window', exact: true })
    .press('Enter');
  assert.equal(await page.locator('#surfaces').getAttribute('data-marks'), '1');
  // Verify the third scene and its artwork with the browser completely offline.
  await page.getByRole('button', { name: 'Visit the Christmas table', exact: true }).click();
  await page.getByRole('button', { name: 'Return to the living room', exact: true }).waitFor();
  await page.locator('#landscape').evaluate((image) => image.decode());
  assert.equal(await page.locator('#world').getAttribute('data-scene'), 'party');
  await page
    .getByRole('button', { name: 'Sparkle the gingerbread icing', exact: true })
    .press('Enter');
  assert.equal(await page.locator('#world').getAttribute('data-last-action'), 'cookie-stars');
  await page
    .getByRole('button', { name: 'Dust the Christmas cake with sugar', exact: true })
    .press('Enter');
  assert.equal(await page.locator('#world').getAttribute('data-last-action'), 'cake-sugar');
  await page.getByRole('button', { name: 'Warm the table candlelight', exact: true }).click();
  await page.getByRole('button', { name: 'Return to the living room', exact: true }).click();
  await page.getByRole('button', { name: 'Tend the fire' }).waitFor();
  assert.equal(await page.locator('#surfaces').getAttribute('data-marks'), '1');
  await page.getByRole('button', { name: 'Mute winter sounds', exact: true }).click();
  await page.locator('#sound[data-audio-state="suspended"]').waitFor();
  assert.equal(await page.locator('body').innerText(), '');
  assert.deepEqual(errors, []);
  console.log('Image-only offline bundle and iOS resource verified.');
} finally {
  await browser.close();
}
