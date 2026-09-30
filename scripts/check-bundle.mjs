import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
assert.deepEqual(await readFile('dist-ios/index.html'), await readFile('ios/ChristmasVillage/Web/index.html'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ offline: true });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('../dist-ios/index.html', import.meta.url).href);
  assert.ok(await page.locator('link[rel="icon"]').evaluate(icon => icon.href.startsWith('data:')), 'Offline favicon must be embedded');
  await page.locator('#landscape').evaluate(image => image.decode());
  assert.equal(await page.getByRole('button', { name: /fox/i }).count(),0);
  await page.getByRole('button', { name: 'Brush snow off the pine branches' }).click();
  assert.equal(await page.locator('#world').getAttribute('data-last-action'),'branches');
  await page.getByRole('button', { name: 'Enter the cabin' }).click();
  await page.getByRole('button', { name: 'Tend the fire' }).waitFor();
  await page.locator('#landscape').evaluate(image => image.decode());
  assert.equal(await page.locator('body').innerText(), ''); assert.deepEqual(errors, []);
  console.log('Image-only offline bundle and iOS resource verified.');
} finally { await browser.close(); }
