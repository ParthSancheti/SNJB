import { preview } from 'vite';
import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const server = await preview({ preview: { host: '127.0.0.1', port: 4176, strictPort: true } });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const route of ['/', '/computer-engineering', '/explore', '/student-life', '/apply']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`http://127.0.0.1:4176${route}`);
    assert.equal(response.status(), 200);
    await expect(page.locator('main h1')).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (route === '/computer-engineering') {
      await expect(page.locator('.dept-source-panel')).toHaveCount(16);
      await page.goto('http://127.0.0.1:4176/computer-engineering#source-people-computer');
      await expect(page.locator('#source-people-computer')).toHaveAttribute('open', '');
    }
    if (route === '/explore') await expect(page.locator('.resource-list-root>li')).toHaveCount(9);
    await page.getByRole('button', { name: 'Open SNJB menu', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Quick access' })).toBeVisible();
    const layering = await page.evaluate(() => ({ header: getComputedStyle(document.querySelector('.site-header')).zIndex, backdrop: getComputedStyle(document.querySelector('.navigation-hub-backdrop')).zIndex }));
    assert.ok(Number(layering.header) > Number(layering.backdrop), 'The anchored menu keeps its header visible above the page blur');
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`Production entry, responsive layout and menu verified: ${route}`);
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
