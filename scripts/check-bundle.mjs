import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
assert.deepEqual(await readFile('dist-ios/index.html'), await readFile('ios/ChristmasVillage/Web/index.html'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ offline: true });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('../dist-ios/index.html', import.meta.url).href);
  await page.locator('#landscape').evaluate(image => image.decode());
  await page.getByRole('button', { name: '오두막 안으로 들어가기' }).click();
  await page.getByRole('button', { name: '벽난로 불 더하기' }).waitFor();
  await page.locator('#landscape').evaluate(image => image.decode());
  assert.equal(await page.locator('body').innerText(), ''); assert.deepEqual(errors, []);
  console.log('Image-only offline bundle and iOS resource verified.');
} finally { await browser.close(); }
