import { chromium, devices } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch();
try {
  // The public README uses portrait screenshots only; avoid stale duplicate views.
  for (const [name, options] of [['mobile', devices['iPhone 13']]]) {
    const page = await browser.newPage(options);
    await page.goto('http://127.0.0.1:5173');
    await page.locator('#landscape').evaluate((image) => image.decode());
    await page.locator('#world.ready').waitFor();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `docs/screenshots/${name}-outside.png`, scale: 'css' });
    await page.getByRole('button', { name: 'Enter the cabin' }).click();
    await page.getByRole('button', { name: 'Tend the fire' }).waitFor();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `docs/screenshots/${name}-inside.png`, scale: 'css' });
    await page
      .getByRole('button', { name: 'Clear frost from the window', exact: true })
      .press('Enter');
    await page.screenshot({ path: `docs/screenshots/${name}-frost.png`, scale: 'css' });
    await page.close();
  }
} finally {
  await browser.close();
}
