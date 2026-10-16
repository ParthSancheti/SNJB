import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run against an owned preview: SNJB_QA_URL=http://127.0.0.1:4178 node scripts/qa-elevate.mjs.
// Individual scopes keep a media recovery investigation separate from final UI verification.
const base = (process.env.SNJB_QA_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
const scope = process.env.SNJB_QA_SCOPE || process.argv[2] || 'all';
const selected = name => scope === 'all' || scope.split(',').includes(name);
const channel = process.env.SNJB_QA_CHANNEL || 'msedge';
const out = 'qa/elevate';
const widths = process.env.SNJB_QA_WIDTHS ? process.env.SNJB_QA_WIDTHS.split(',').map(Number) : [320, 360, 390, 430, 768, 1024, 1440, 1920];
const themes = process.env.SNJB_QA_THEMES ? process.env.SNJB_QA_THEMES.split(',') : ['light', 'dark'];
const routes = ['/', '/computer-engineering', '/ai-data-science', '/civil-engineering', '/electronics-telecommunication', '/mechanical-engineering', '/first-year-engineering', '/mba', '/student-life', '/apply', '/explore', '/audit'];
const results = [];
let buildAssets;
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel });
process.once('SIGINT', async () => { await browser.close(); process.exit(130); });

async function record(name, work) {
  const begin = Date.now();
  try {
    const evidence = await work();
    results.push({ name, status: 'passed', durationMs: Date.now() - begin, evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'failed', durationMs: Date.now() - begin, error: error.stack || error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
  await writeReport(false);
}

async function writeReport(completed) {
  await fs.writeFile(`${out}/verification-${scope.replaceAll(',', '-')}.json`, JSON.stringify({ base, channel, checkedAt: new Date().toISOString(), scope, completed, status: completed ? results.some(result => result.status !== 'passed') ? 'failed' : 'passed' : 'in progress', buildAssets, limitations: 'Desktop Edge automation and viewport emulation; no physical iOS/Safari certification.', results }, null, 2));
}

async function open(page, route) {
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main h1')).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  if (route === '/explore') await expect(page.locator('.resource-list-root > li')).toHaveCount(9);
  if (route === '/audit') await expect(page.locator('.supplement-table table')).toBeVisible();
  if (routes.slice(2, 8).includes(route)) await expect(page.locator('.supplement-glass [role="status"]')).toHaveCount(0);
  if (!buildAssets) buildAssets = await page.evaluate(() => ({ script: document.querySelector('head script[type="module"][src]')?.getAttribute('src'), stylesheet: [...document.querySelectorAll('head link[rel="stylesheet"]')].map(node => node.getAttribute('href')).find(value => /(?:index-[^/]+\.css|\/src\/)/.test(value)) }));
}

async function revealSources(page, route) {
  if (route === '/') {
    const expand = page.locator('.hsa-expand-records');
    if (await expand.count()) {
      await expand.scrollIntoViewIfNeeded();
      if (await expand.getAttribute('aria-expanded') !== 'true') await expand.click();
      for (const summary of await page.locator('.hsa-disclosure > summary').all()) await summary.evaluate(node => { if (!node.parentElement.open) node.click(); });
      await expect(page.locator('.hsa-disclosure-body')).toHaveCount(7);
      await expect(page.locator('.hsa-load-state[role="status"]')).toHaveCount(0, { timeout: 10000 });
    }
  }
  if (route === '/computer-engineering') {
    const allPeople = page.getByRole('button', { name: 'Show all 37 people', exact: true });
    if (await allPeople.count()) await allPeople.click();
    await expect(page.locator('.dept-faculty-card')).toHaveCount(37);
    const drawer = page.locator('.dept-archival-drawer');
    await drawer.locator('> summary').evaluate(node => { if (!node.parentElement.open) node.click(); });
    await expect(page.locator('.dept-source-panel')).toHaveCount(16);
    for (const summary of await page.locator('.dept-source-panel > summary').all()) await summary.evaluate(node => { if (!node.parentElement.open) node.click(); });
  }
}

async function loadEveryImage(page) {
  // A lazy photograph outside the viewport is not a missing photograph. Actually visit it first.
  // Re-query after each scroll because a decoded Photo removes its temporary preview node.
  const sources = await page.locator('img[src]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute('src')))]);
  for (const source of sources) {
    const handle = await page.evaluateHandle(source => [...document.images].find(node => node.getAttribute('src') === source && node.getClientRects().length), source);
    const element = handle.asElement();
    if (element) {
      try { await element.scrollIntoViewIfNeeded({ timeout: 2000 }); } catch { /* Detached previews are expected after decode. */ }
    }
    await handle.dispose();
  }
  await page.locator('img[src]').evaluateAll(nodes => nodes.forEach(node => { node.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.images].every(node => !node.getAttribute('src') || (node.complete && node.naturalWidth > 0)), null, { timeout: 15000 });
  return page.locator('img[src]').evaluateAll(nodes => nodes.map(node => ({ src: node.getAttribute('src'), current: node.currentSrc, srcset: node.getAttribute('srcset'), width: node.naturalWidth, height: node.naturalHeight, visible: Boolean(node.getClientRects().length) })));
}

async function clearInteraction(page) {
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.mouse.move(1, 1);
}

try {
  if (selected('media')) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const checkedPaths = new Set();
    for (const route of routes) await record(`runtime images ${route}`, async () => {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      try {
        await open(page, route);
        await revealSources(page, route);
        const images = await loadEveryImage(page);
        await expect(page.locator('.photo-fallback, .dept-image-fallback')).toHaveCount(0);
        const paths = [...new Set(images.flatMap(image => [image.src, image.current, ...(image.srcset || '').split(',').map(value => value.trim().split(' ')[0])]).filter(value => value?.startsWith('/') || value?.startsWith(base + '/')).map(value => new URL(value, base).pathname))];
        for (const path of paths) {
          if (checkedPaths.has(path)) continue;
          const response = await page.request.get(base + path);
          assert.equal(response.status(), 200, `${route}: image HTTP status ${path}`);
          assert.match(response.headers()['content-type'] || '', /^image\//, `${route}: image MIME, not SPA fallback ${path}`);
          checkedPaths.add(path);
        }
        assert.deepEqual(errors, [], `${route}: no browser runtime errors`);
        return { images: images.length, imagePaths: paths.length, decodedImages: images.filter(image => image.width > 0).length, all37PeopleAnd16SourceSectionsOpened: route === '/computer-engineering', errors };
      } finally { page.off('pageerror', onError); }
    });
    await record('all 109 archival delivery images retain verified bytes', async () => {
      const manifest = JSON.parse(await fs.readFile('public/images/resources/manifest.json', 'utf8'));
      for (const file of manifest.files) {
        const bytes = await fs.readFile('public' + file.deliveryPath);
        assert.equal(createHash('sha256').update(bytes).digest('hex'), file.deliverySha256, file.deliveryPath);
      }
      return { files: manifest.files.length, bytes: manifest.totalDeliveryBytes, failures: manifest.failures };
    });
    await record('self-hosted fonts load as fonts and decode in the browser', async () => {
      const families = ['Manrope', 'DM Sans', 'Instrument Serif', 'Noto Sans Devanagari'];
      const files = ['manrope-latin.woff2', 'dm-sans-latin.woff2', 'instrument-serif-latin.woff2', 'noto-sans-devanagari-devanagari.woff2', 'noto-sans-devanagari-latin.woff2'];
      for (const file of files) {
        const response = await page.request.get(`${base}/fonts/${file}`);
        assert.equal(response.status(), 200, file);
        assert.match(response.headers()['content-type'] || '', /font|woff|octet-stream/, file);
        assert.ok((await response.body()).byteLength > 1000, file);
      }
      const faces = await page.evaluate(async families => {
        for (const family of families) await document.fonts.load(`16px "${family}"`, family === 'Noto Sans Devanagari' ? 'ज्ञान' : 'SNJB');
        return [...document.fonts].map(face => ({ family: face.family, status: face.status }));
      }, families);
      for (const family of families) assert.ok(faces.some(face => face.family === family && face.status === 'loaded'), family);
      return { files, faces };
    });
    await context.close();
  }

  if (selected('ui')) for (const width of widths) for (const theme of themes) await record(`layout ${width}px ${theme}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 1000 }, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('snjb-theme', theme), theme);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      const routeEvidence = [];
      for (const route of routes) {
        await open(page, route);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px ${theme} ${route}: no document overflow`);
        const headings = await page.locator('main h1').count();
        assert.equal(headings, 1, `${route}: one main page heading`);
        if ((width === 1440 && theme === 'light') || (width === 390 && theme === 'dark')) await page.screenshot({ path: `${out}/route-${route === '/' ? 'home' : route.slice(1)}-${width}-${theme}.png` });
        routeEvidence.push(route);
      }
      await open(page, '/');
      const material = await page.locator('.header-inner').evaluate(node => {
        const style = getComputedStyle(node);
        return { blur: style.backdropFilter, fill: style.backgroundColor, bodyFont: getComputedStyle(document.body).fontFamily, palette: ['--brand-mist', '--brand-orange', '--brand-teal', '--brand-deep'].map(name => [name, getComputedStyle(document.documentElement).getPropertyValue(name).trim()]) };
      });
      assert.match(material.blur, /blur\(/, 'Header retains native backdrop blur');
      assert.match(material.bodyFont, /Manrope/, 'Shared typography uses self-hosted Manrope');
      assert.deepEqual(Object.fromEntries(material.palette), { '--brand-mist': '#e9f3f2', '--brand-orange': '#ee672b', '--brand-teal': '#23737a', '--brand-deep': '#1e4a4d' }, 'Tokens match the supplied palette');
      const dock = page.locator('.bottom-navigation');
      if (width < 1024) {
        await expect(dock).toBeVisible();
        await expect(dock.locator('.bottom-navigation-pill')).toHaveCount(1);
        const labels = await dock.locator('.bottom-navigation-label').evaluateAll(nodes => nodes.filter(node => { const style = getComputedStyle(node); return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && node.getBoundingClientRect().width > 1; }).map(node => node.textContent));
        assert.deepEqual(labels, ['Home'], 'Only the active tab displays a label');
        for (const [label, href] of [['Campus', '/student-life'], ['Explore', '/explore'], ['Apply', '/apply'], ['Home', '/']]) {
          await dock.getByRole('link', { name: label, exact: true }).click();
          await expect(page).toHaveURL(base + href);
          await expect(page.locator('.app-shell')).toHaveAttribute('data-page', { '/': 'home', '/student-life': 'campus', '/explore': 'directory', '/apply': 'apply' }[href]);
          await expect(page.locator('main h1')).toBeVisible();
          await expect(page.locator('main')).not.toHaveAttribute('aria-busy', 'true');
          await expect(page.locator('.route-loading, .navigation-app-sheet')).toHaveCount(0);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await expect(dock.locator('[aria-current="page"]')).toHaveAttribute('href', href);
          await expect(dock.locator('.bottom-navigation-pill')).toHaveCount(1);
        }
      } else await expect(dock).toBeHidden();
      await expect(page.getByRole('button', { name: /^(?:Pause|Resume)\b/i })).toHaveCount(0);
      await expect(page.locator('.ambient-slide-progress')).toHaveCount(0);
      await page.screenshot({ path: `${out}/home-${width}-${theme}.png` });
      await page.locator('#programmes').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/fields-${width}-${theme}.png` });
      assert.deepEqual(errors, [], 'No runtime errors while visiting every route');
      return { routes: routeEvidence, material, errors };
    } finally { await context.close(); }
  });

  if (selected('motion')) {
    await record('mobile dock stays outside all seven department pages', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      await context.addInitScript(() => localStorage.setItem('snjb-theme', 'dark'));
      const page = await context.newPage();
      try {
        const departments = routes.slice(1, 8);
        for (const route of departments) {
          await open(page, route);
          await expect(page.locator('.bottom-navigation')).toHaveCount(0);
          await page.screenshot({ path: `${out}/route-${route.slice(1)}-390-dark.png` });
        }
        return { routes: departments, dock: 'absent', refreshedPhoneScreenshots: 7 };
      } finally { await context.close(); }
    });
    for (const theme of ['light', 'dark']) await record(`subject photography and learning hover ${theme}`, async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
      await context.addInitScript(theme => localStorage.setItem('snjb-theme', theme), theme);
      const page = await context.newPage();
      try {
        await open(page, '/');
        const wordmark = page.locator('.hero-v7.hero-v10 h1 > span:first-child');
        const typography = await wordmark.evaluate(node => ({ family: getComputedStyle(node).fontFamily, weight: getComputedStyle(node).fontWeight, text: node.textContent.trim(), lines: node.getClientRects().length }));
        assert.match(typography.family, /Manrope/);
        assert.ok(Number(typography.weight) >= 700);
        assert.equal(typography.text, 'SNJB');
        assert.equal(typography.lines, 1);
        await page.locator('#programmes').scrollIntoViewIfNeeded();
        const filters = await page.locator('.h8-programme-image img').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).filter));
        assert.equal(filters.length, 6);
        for (const filter of filters) { assert.match(filter, /brightness\(0\.[0-8]/); assert.match(filter, /saturate\(1\.[1-9]/); }
        const card = page.locator('.h8-resource-card').first();
        await card.scrollIntoViewIfNeeded();
        await clearInteraction(page);
        const before = await card.evaluate(node => ({ card: getComputedStyle(node).transform, image: getComputedStyle(node.querySelector('img')).transform }));
        await card.hover();
        await expect.poll(() => card.evaluate(node => getComputedStyle(node).transform)).not.toBe(before.card);
        await expect.poll(() => card.locator('img').evaluate(node => getComputedStyle(node).transform)).not.toBe(before.image);
        const after = await card.evaluate(node => ({ card: getComputedStyle(node).transform, image: getComputedStyle(node.querySelector('img')).transform }));
        await page.screenshot({ path: `${out}/learning-hover-${theme}.png` });
        return { typography, subjectFilters: filters, hover: { before, after } };
      } finally { await context.close(); }
    });
    await record('requested automatic cadence and edge-only carousel arrows', async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
      const page = await context.newPage();
      try {
        await open(page, '/');
        const evidence = [];
        for (const [selector, interval] of [['.campus-news-v12', 5000], ['.campus-v12', 3000], ['.recognition-rail', 1000], ['.recruiter-rail', 1000]]) {
          const surface = page.locator(selector);
          await surface.scrollIntoViewIfNeeded();
          await clearInteraction(page);
          await expect(surface).toHaveAttribute('data-autoplay', 'playing');
          await expect(surface).toHaveAttribute('data-autoplay-interval', String(interval));
          const initial = await surface.getAttribute('data-slide-index');
          const start = Date.now();
          await expect(surface).not.toHaveAttribute('data-slide-index', initial, { timeout: interval + 2400 });
          const elapsed = Date.now() - start;
          assert.ok(elapsed >= interval - 650 && elapsed <= interval + 2400, `${selector}: actual cadence ${elapsed}ms for requested ${interval}ms`);
          const edgeFrame = surface.locator('.edge-carousel-frame').first();
          const frameBox = await edgeFrame.boundingBox();
          await edgeFrame.hover({ position: { x: 10, y: frameBox.height / 2 } });
          const previous = surface.locator('[data-carousel-edge="previous"]');
          const next = surface.locator('[data-carousel-edge="next"]');
          await expect(previous).toHaveCount(1);
          await expect(next).toHaveCount(1);
          await expect(previous).toBeVisible();
          await expect.poll(() => previous.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(.95);
          await previous.focus();
          const before = await surface.getAttribute('data-slide-index');
          await page.keyboard.press('Enter');
          await expect(surface).not.toHaveAttribute('data-slide-index', before, { timeout: 2200 });
          await clearInteraction(page);
          await expect.poll(() => previous.evaluate(node => Number(getComputedStyle(node).opacity))).toBeLessThan(.05);
          evidence.push({ selector, requestedMs: interval, actualMs: elapsed, edgeControls: 'pointer reveal + keyboard activation + hidden when idle' });
        }
        await expect(page.getByRole('button', { name: /^(?:Pause|Resume)\b/i })).toHaveCount(0);
        await expect(page.locator('.ambient-slide-progress')).toHaveCount(0);
        return evidence;
      } finally { await context.close(); }
    });
    await record('mobile shared pill visibly moves during page changes', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference', isMobile: true, hasTouch: true });
      const page = await context.newPage();
      try {
        await open(page, '/');
        const frames = await page.locator('.bottom-navigation a[href="/student-life"]').evaluate(async node => {
          const result = [];
          node.click();
          const start = performance.now();
          while (performance.now() - start < 950) {
            const pill = document.querySelector('.bottom-navigation-pill');
            if (pill) { const box = pill.getBoundingClientRect(); result.push({ at: performance.now() - start, x: box.x, width: box.width, transform: getComputedStyle(pill).transform }); }
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          return result;
        });
        await expect(page).toHaveURL(base + '/student-life');
        await expect(page.locator('.bottom-navigation [aria-current="page"]')).toHaveAttribute('href', '/student-life');
        assert.ok(frames.length > 3, 'Captured actual pill animation frames');
        assert.ok(frames.some(frame => Math.abs(frame.x - frames.at(-1).x) > 3 || frame.transform !== frames.at(-1).transform), 'Pill has an intermediate position/transform');
        const finalLabels = await page.locator('.bottom-navigation-label').evaluateAll(nodes => nodes.filter(node => node.getBoundingClientRect().width > 1 && Number(getComputedStyle(node).opacity) > .5).map(node => node.textContent));
        assert.deepEqual(finalLabels, ['Campus']);
        return { first: frames[0], middle: frames[Math.floor(frames.length / 2)], final: frames.at(-1), visibleLabels: finalLabels };
      } finally { await context.close(); }
    });
    for (const preference of ['no-preference', 'reduce']) await record(`rapid mobile destination changes preserve latest intent ${preference}`, async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: preference, isMobile: true, hasTouch: true });
      const page = await context.newPage();
      try {
        await open(page, '/');
        await page.locator('.bottom-navigation').evaluate(node => {
          node.querySelector('a[href="/student-life"]').click();
          node.querySelector('a[href="/explore"]').click();
        });
        await expect(page).toHaveURL(base + '/explore', { timeout: 12000 });
        await expect(page.locator('.app-shell')).toHaveAttribute('data-page', 'directory');
        await expect(page.locator('main')).not.toHaveAttribute('aria-busy', 'true');
        await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
        await expect(page.locator('.bottom-navigation [aria-current="page"]')).toHaveAttribute('href', '/explore');
        return { rapidIntents: ['/student-life', '/explore'], settledRoute: '/explore', activeTab: 'Explore' };
      } finally { await context.close(); }
    });
    await record('reduced motion stops automatic replacement without hiding content', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      try {
        await open(page, '/');
        const surface = page.locator('.campus-v12');
        await surface.scrollIntoViewIfNeeded();
        await clearInteraction(page);
        await expect(surface).toHaveAttribute('data-autoplay', 'paused');
        const initial = await surface.getAttribute('data-slide-index');
        await page.waitForTimeout(3300);
        await expect(surface).toHaveAttribute('data-slide-index', initial);
        await expect(surface.locator('img.photo').first()).toBeVisible();
        return { automaticReplacement: 'off', images: 'available' };
      } finally { await context.close(); }
    });
  }
} finally { await browser.close(); }

await writeReport(true);
assert.ok(results.length, `Unknown SNJB_QA_SCOPE=${scope}`);
assert.deepEqual(results.filter(result => result.status !== 'passed').map(({ name, error }) => ({ name, error })), [], 'Every selected Elevate check must pass');
