import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = (process.env.SNJB_QA_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
const recognition = JSON.parse(await fs.readFile('public/data/homepage-recognitions-v10.json', 'utf8'));
const source = JSON.parse(await fs.readFile('public/data/homepage-content.json', 'utf8'));
await fs.mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];

async function noOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${label}: no horizontal document overflow`);
}

async function glass(locator, label) {
  const material = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    const blur = Number((style.backdropFilter.match(/blur\(([\d.]+)px\)/) || [])[1] || 0);
    const fills = [style.backgroundColor, style.backgroundImage].join(' ');
    const alphas = [...fills.matchAll(/rgba\([^()]*,\s*([\d.]+)\)/g)].map(match => Number(match[1]));
    return { blur, background: style.backgroundColor, image: style.backgroundImage, alphas };
  });
  assert.ok(material.blur >= 24, `${label}: native glass blur >=24px, ${JSON.stringify(material)}`);
  assert.ok(material.alphas.length && material.alphas.every(alpha => alpha < .98), `${label}: translucent fills, ${JSON.stringify(material)}`);
  return material;
}

async function axe(page, selector) {
  const builder = new AxeBuilder({ page });
  if (selector) builder.include(selector);
  const report = await builder.analyze();
  assert.deepEqual(report.violations.map(row => ({ id: row.id, targets: row.nodes.map(node => node.target) })), []);
}

async function noMediaControls(page) {
  await expect(page.locator('.photo-enlarge')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^(?:Enlarge|Full.?screen|Pause|Resume|Previous|Next)\b/i })).toHaveCount(0);
  await expect(page.locator('.news-v12-pagination button, .rail-controls button, .campus-v12-controls button, .hcs-carousel-actions button')).toHaveCount(0);
}

try {
  for (const [width, height] of [[320, 568], [390, 844], [768, 900], [1024, 768], [1440, 900], [1920, 720]]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      await context.addInitScript(value => localStorage.setItem('snjb-theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      const evidence = {};
      page.on('pageerror', error => errors.push(error.message));
      try {
        console.log(`CHECK ${width}×${height} ${theme}`);
        await page.goto(base);
        await expect(page.locator('main h1')).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        const hero = await page.locator('.cinematic-copy').boundingBox();
        const header = await page.locator('.site-header').boundingBox();
        assert.ok(hero.y >= header.y + header.height + 8, `Hero clear of header: ${JSON.stringify({ hero, header })}`);
        await noOverflow(page, 'Home');
        await noMediaControls(page);
        evidence.header = await glass(page.locator('.header-inner'), 'Header');
        const heroActions = page.locator('.cinematic-actions a');
        await expect(heroActions).toHaveCount(2);
        evidence.heroActions = [];
        for (const action of await heroActions.all()) evidence.heroActions.push(await glass(action, 'Home action'));
        assert.equal(evidence.heroActions[0].background, evidence.heroActions[1].background, 'Programmes and Admissions use the same glass fill');
        for (const action of await heroActions.all()) assert.equal(await action.evaluate(node => getComputedStyle(node).color), 'rgb(255, 255, 255)', 'Film actions retain white text in both themes');

        if (width >= 1024) {
          await expect(page.getByRole('navigation', { name: 'Primary pages' })).toBeHidden();
          await expect(page.getByRole('button', { name: 'Open SNJB menu', exact: true })).toBeHidden();
          const about = page.getByRole('navigation', { name: 'Desktop primary navigation' }).getByRole('button', { name: 'About', exact: true });
          await about.hover();
          await expect(page.locator('.desktop-mega')).toBeVisible();
          await expect(page.locator('.desktop-mega-content h3')).toHaveText('About the college');
          await page.mouse.move(width - 4, height - 4);
          await expect(page.locator('.desktop-mega')).toHaveCount(0);
          await page.getByRole('button', { name: 'College menu', exact: true }).click();
          await expect(page.locator('.desktop-mega')).toHaveAttribute('data-pinned', 'true');
          evidence.collegeMenu = await glass(page.locator('.desktop-mega'), 'College menu');
          await expect(page.getByRole('navigation', { name: 'College navigation categories' }).locator('button')).toHaveCount(9);
          const panel = await page.locator('.desktop-mega').boundingBox();
          assert.ok(panel.x >= 0 && panel.x + panel.width <= width + 1 && panel.y + panel.height <= height + 1);
          await page.getByRole('navigation', { name: 'College navigation categories' }).getByRole('button', { name: 'Academics', exact: true }).hover();
          const departments = page.locator('.desktop-mega-content summary').filter({ hasText: 'Departments' }).first();
          await departments.hover();
          await page.locator('.desktop-mega-content summary').filter({ hasText: 'Computer Engineering' }).first().hover();
          await expect(page.locator('.desktop-mega-content a[href="/computer-engineering#source-people-computer"]')).toBeVisible();
          await axe(page, '.site-header');
          await page.screenshot({ path: `qa/v13-menu-${width}-${theme}.png` });
          await page.keyboard.press('Escape');
          await expect(page.locator('.desktop-mega')).toHaveCount(0);
        } else {
          const dock = page.getByRole('navigation', { name: 'Primary pages' });
          await expect(dock).toBeVisible();
          assert.deepEqual(await dock.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['/', '/student-life', '/explore', '/apply']);
          await page.getByRole('button', { name: 'Open SNJB menu', exact: true }).click();
          await expect(page.getByRole('dialog', { name: 'Quick access' })).toBeVisible();
          await expect(page.locator('.hub-categories')).toHaveCount(0);
          await expect(dock).toBeHidden();
          evidence.quickMenu = await glass(page.locator('.navigation-hub'), 'Quick access');
          await axe(page, '.navigation-hub-backdrop');
          await page.screenshot({ path: `qa/v13-menu-${width}-${theme}.png` });
          await page.keyboard.press('Escape');
          await expect(page.getByRole('button', { name: 'Open SNJB menu', exact: true })).toBeFocused();
          await expect(dock).toBeVisible();
          for (const [name, href] of [['Campus', '/student-life'], ['Apply', '/apply'], ['Explore', '/explore'], ['Home', '/']]) {
            await dock.getByRole('link', { name, exact: true }).click();
            await expect(page).toHaveURL(base + href);
            await expect(page.locator('main h1')).toBeVisible();
          }
        }

        if (width === 390 || width === 1440) {
          for (const value of [theme === 'light' ? 'dark' : 'light', theme]) {
            await page.getByRole('button', { name: width >= 1024 ? 'College menu' : 'Open SNJB menu', exact: true }).click();
            const group = page.getByRole('group', { name: width >= 1024 ? 'Choose desktop appearance' : 'Choose appearance', exact: true });
            await group.getByRole('button', { name: value === 'dark' ? 'Dark' : 'Light', exact: true }).click();
            await expect(page.locator('html')).toHaveAttribute('data-theme', value);
            assert.equal(await page.evaluate(() => localStorage.getItem('snjb-theme')), value);
          }
        }
        const search = page.getByRole('button', { name: 'Search programmes and resources', exact: true });
        await search.click();
        await expect(page.getByRole('dialog', { name: 'Search SNJB' })).toBeVisible();
        await expect(page.getByRole('searchbox')).toBeFocused();
        evidence.search = await glass(page.locator('.snjb-search'), 'Search');
        const searchBox = await page.locator('.snjb-search').boundingBox();
        assert.ok(searchBox.x >= 0 && searchBox.x + searchBox.width <= width + 1 && searchBox.y + searchBox.height <= height + 1, `Search stays in viewport: ${JSON.stringify(searchBox)}`);
        if (width >= 1024) assert.ok(Math.abs(searchBox.width - (await page.locator('.header-inner').boundingBox()).width) <= 2, 'Desktop search expands to navbar width');
        if (width < 1024) assert.ok(await page.getByRole('searchbox').evaluate(node => parseFloat(getComputedStyle(node).fontSize)) >= 16, 'Phone search does not trigger input zoom');
        await page.getByRole('searchbox').fill('computer curriculum');
        await expect(page.locator('[data-search-result]').first()).toContainText('Computer Engineering curriculum');
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[data-search-result]').first()).toBeFocused();
        await axe(page, '.snjb-search-layer');
        await page.screenshot({ path: `qa/v13-search-${width}-${theme}.png` });
        await page.keyboard.press('Escape');
        await expect(page.locator('.snjb-search')).toHaveCount(0);
        await expect(search).toBeFocused();
        await page.screenshot({ path: `qa/v13-home-${width}-${theme}.png` });

        await page.locator('#vision-mission').scrollIntoViewIfNeeded();
        await expect(page.locator('#vision-mission li')).toHaveCount(4);
        const vision = page.locator('.purpose-v12-vision');
        const textBox = await vision.getByRole('heading', { name: 'Our vision', exact: true }).boundingBox();
        const iconBox = await vision.locator('svg').first().boundingBox();
        assert.ok(Math.abs(textBox.y + textBox.height / 2 - iconBox.y - iconBox.height / 2) <= 4, 'Our vision icon and heading share one row');
        await expect(page.locator('.recognition-rail article')).toHaveCount(9);
        assert.deepEqual(await page.locator('.recognition-rail h4').allTextContents(), recognition.entries.map(row => row.title));
        await page.locator('.recognition-rail .rail-track').focus();
        await page.locator('.recognition-rail .rail-track').evaluate(node => node.scrollTo({ left: 0, behavior: 'instant' }));
        const initial = await page.locator('.recognition-rail .rail-track').evaluate(node => node.scrollLeft);
        await page.keyboard.press('ArrowRight');
        await expect.poll(() => page.locator('.recognition-rail .rail-track').evaluate(node => node.scrollLeft)).toBeGreaterThan(initial);
        await expect(page.locator('.h10-campus-services a')).toHaveCount(12);
        await expect(page.locator('.h10-campus-services details')).toHaveCount(0);
        await expect(page.locator('#updates .hcs-event')).toHaveCount(3);
        await expect(page.locator('#updates .hcs-notice-board li')).toHaveCount(2);
        await expect(page.locator('#testimonials')).toHaveAttribute('data-slide-count', '10');
        await page.locator('#programmes').scrollIntoViewIfNeeded();
        await expect(page.locator('.h8-programme')).toHaveCount(5);
        await page.screenshot({ path: `qa/v13-programmes-${width}-${theme}.png` });
        await page.locator('#learning').scrollIntoViewIfNeeded();
        await expect(page.locator('.h11-resource-image')).toHaveCount(4);
        for (const image of await page.locator('.h11-resource-image').all()) { await image.scrollIntoViewIfNeeded(); await image.evaluate(node => node.decode()); }
        await page.screenshot({ path: `qa/v13-learning-${width}-${theme}.png` });
        await expect(page.locator('.recruiter-rail img')).toHaveCount(34);
        await page.locator('.h10-placement-details summary').click();
        await expect(page.locator('.placement-chart-row')).toHaveCount(5);
        await page.locator('.hsa-expand-records').click();
        await expect(page.locator('.hsa-disclosure')).toHaveCount(7);
        for (const item of await page.locator('.hsa-disclosure summary').all()) await item.click();
        await noOverflow(page, 'Expanded source archive');
        await noMediaControls(page);
        assert.equal(source.achievements.length, 9, 'Original achievement archive unchanged');
        await axe(page);
        await page.locator('.site-footer').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `qa/v13-footer-${width}-${theme}.png` });

        for (const route of ['/student-life', '/apply', '/explore', '/computer-engineering']) {
          await page.goto(base + route);
          await expect(page.locator('main h1')).toBeVisible();
          await noOverflow(page, route);
          await noMediaControls(page);
          if (route === '/student-life') await expect(page.locator('.h10-campus-services a')).toHaveCount(12);
          if (route === '/apply') {
            await page.getByRole('button', { name: 'Direct second year', exact: true }).click();
            await expect(page.locator('.visitor-route h2')).toHaveText('Direct second year');
            await expect(page.locator('.visitor-route a')).toHaveAttribute('href', /direct-second-year-engineering/);
          }
          if (route === '/explore') await expect(page.locator('.resource-list-root>li')).toHaveCount(9);
          if (route === '/computer-engineering') {
            await expect(page.locator('.dept-source-panel')).toHaveCount(16);
            await expect(page.locator('.bottom-navigation')).toBeHidden();
          }
          await expect(page.locator('.site-footer')).toHaveCount(0);
          if (width < 1024 && route !== '/computer-engineering') await expect(page.locator('.bottom-navigation a[aria-current=page]')).toHaveAttribute('href', route);
          if (route !== '/computer-engineering') await axe(page, '#main-content');
        }
        assert.deepEqual(errors, []);
        results.push({ width, height, theme, status: 'passed', evidence });
        console.log(`PASS ${width}×${height} ${theme}`);
      } catch (error) {
        results.push({ width, height, theme, status: 'failed', error: error.message, evidence });
        console.error(`FAIL ${width} ${theme}: ${error.message}`);
        await page.screenshot({ path: `qa/v13-failure-${width}-${theme}.png` }).catch(() => {});
      } finally { await context.close(); }
      await fs.writeFile('qa/v13-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, method: 'Installed Chrome; emulated viewport and saved light/dark preferences; production build when pointed at preview', results }, null, 2));
    }
  }
} finally { await browser.close(); }
assert.equal(results.filter(result => result.status === 'failed').length, 0);
