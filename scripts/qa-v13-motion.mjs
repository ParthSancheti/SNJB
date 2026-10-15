import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = (process.env.SNJB_QA_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
await fs.mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];
async function check(name, work) {
  try { report.push({ name, status: 'passed', evidence: await work() }); console.log(`PASS ${name}`); }
  catch (error) { report.push({ name, status: 'failed', error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
  await fs.writeFile('qa/v13-motion-verification.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, results: report }, null, 2));
}

async function clearFocusAndHover(page) {
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  await page.mouse.move(1, 1);
}

async function openingFrames(page, button, selector) {
  // Observe rendered animation frames rather than asking the animation implementation for its target.
  // Start and sample in the same browser task, avoiding automation IPC delays that can skip the animation.
  const samples = await button.evaluate(async (trigger, selector) => {
    const frames = [];
    const begin = performance.now();
    trigger.click();
    while (performance.now() - begin < 900) {
      const element = document.querySelector(selector);
      if (element) {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        frames.push({ at: Math.round(performance.now() - begin), opacity: Number(style.opacity), transform: style.transform, clip: style.clipPath, filter: style.filter, width: box.width, height: box.height });
      }
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    return frames;
  }, selector);
  const last = samples.at(-1);
  assert.ok(samples.length >= 2, `Captured opening and settled frames: ${JSON.stringify(samples)}`);
  assert.ok(last.opacity > .99, 'Opening reaches fully readable opacity');
  const varied = samples.slice(0, -1).some(frame => Math.abs(frame.opacity - last.opacity) > .03 || frame.transform !== last.transform || frame.clip !== last.clip || frame.filter !== last.filter || Math.abs(frame.width - last.width) > 3);
  assert.ok(varied, `Opening has a visible intermediate state: ${JSON.stringify(samples.slice(0, 4))}`);
  return { first: samples[0], middle: samples[Math.floor(samples.length / 3)], final: last };
}

try {
  for (const width of [390, 1440]) await check(`live search/menu opening and film return ${width}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    try {
      await page.goto(base);
      const film = () => page.locator('.cinematic-video');
      await expect(film()).toHaveClass(/is-ready/, { timeout: 30000 });
      const start = await film().evaluate(node => node.currentTime);
      await expect.poll(() => film().evaluate(node => node.currentTime), { timeout: 7000 }).toBeGreaterThan(start + .15);
      const evidence = {};
      evidence.searchOpening = await openingFrames(page, page.getByRole('button', { name: 'Search programmes and resources', exact: true }), '.snjb-search');
      const box = await page.locator('.snjb-search').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width + 1 && box.y >= 0 && box.y + box.height <= 901, `Search bounded after animated open: ${JSON.stringify(box)}`);
      await expect(page.getByRole('searchbox')).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.locator('.snjb-search')).toHaveCount(0);
      if (width < 1024) {
        const menu = page.getByRole('button', { name: 'Open SNJB menu', exact: true });
        evidence.menuOpening = await openingFrames(page, menu, '.navigation-hub');
        await expect(page.getByRole('dialog', { name: 'Quick access' })).toBeVisible();
        await expect(page.locator('.bottom-navigation')).toHaveCount(0);
        await page.mouse.click(width - 3, 890);
        await expect(page.locator('.navigation-hub')).toHaveCount(0);
        await expect(menu).toBeFocused();
        const dock = page.getByRole('navigation', { name: 'Primary pages' });
        await dock.getByRole('link', { name: 'Explore', exact: true }).click();
        await expect(page).toHaveURL(base + '/explore');
        await dock.getByRole('link', { name: 'Home', exact: true }).click();
      } else {
        await page.getByRole('button', { name: 'College menu', exact: true }).click();
        await page.getByRole('link', { name: 'Open complete directory', exact: true }).click();
        await expect(page).toHaveURL(base + '/explore');
        await page.getByRole('link', { name: 'SNJB homepage', exact: true }).click();
      }
      await expect(page.locator('.app-shell')).toHaveAttribute('data-page', 'home');
      await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
      await expect(film()).toHaveClass(/is-ready/, { timeout: 30000 });
      await expect.poll(() => film().evaluate(node => node.paused)).toBe(false);
      const returning = await film().evaluate(node => node.currentTime);
      await expect.poll(() => film().evaluate(node => node.currentTime), { timeout: 7000 }).toBeGreaterThan(returning + .15);
      await page.locator('#learning').scrollIntoViewIfNeeded();
      await expect.poll(() => film().evaluate(node => node.paused)).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      await expect.poll(() => film().evaluate(node => node.paused)).toBe(false);
      await film().evaluate(node => node.pause());
      await page.evaluate(() => dispatchEvent(new Event('pageshow')));
      await expect.poll(() => film().evaluate(node => node.paused)).toBe(false);
      return { ...evidence, routeReturn: 'playing', offscreen: 'paused', pageshow: 'playing' };
    } finally { await context.close(); }
  });

  await check('all five automatic surfaces advance at about five seconds', async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    try {
      await page.goto(base);
      const evidence = [];
      for (const selector of ['.campus-news-v12', '.campus-v12', '.recognition-rail', '.recruiter-rail', '#testimonials']) {
        const surface = page.locator(selector);
        await surface.scrollIntoViewIfNeeded();
        await surface.hover();
        await expect(surface).toHaveAttribute('data-autoplay', 'paused');
        const firstIndex = await surface.getAttribute('data-slide-index');
        assert.notEqual(firstIndex, null, `${selector}: exposes current slide for its accessible reading state`);
        const started = Date.now();
        await clearFocusAndHover(page);
        await expect(surface).toHaveAttribute('data-autoplay', 'playing');
        await expect(surface).not.toHaveAttribute('data-slide-index', firstIndex, { timeout: 7300 });
        const elapsed = Date.now() - started;
        assert.ok(elapsed >= 4400 && elapsed <= 7300, `${selector}: advancement after ${elapsed}ms, expected about five seconds`);
        if (selector.includes('rail')) assert.ok(await surface.locator('.rail-track').evaluate(node => node.scrollLeft) > 0, `${selector}: content actually scrolled`);
        evidence.push({ selector, elapsed, firstIndex, nextIndex: await surface.getAttribute('data-slide-index') });
      }
      await page.screenshot({ path: 'qa/v13-automatic-motion.png' });
      return evidence;
    } finally { await context.close(); }
  });

  await check('reading, hover and keyboard pauses resume without hidden controls', async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    try {
      await page.goto(base);
      const rail = page.locator('.recognition-rail');
      await rail.scrollIntoViewIfNeeded();
      await rail.hover();
      await expect(rail).toHaveAttribute('data-autoplay', 'paused');
      const held = await rail.getAttribute('data-slide-index');
      await page.waitForTimeout(5600);
      await expect(rail).toHaveAttribute('data-slide-index', held);
      await clearFocusAndHover(page);
      await expect(rail).toHaveAttribute('data-autoplay', 'playing');
      await expect(rail).not.toHaveAttribute('data-slide-index', held, { timeout: 7200 });
      await rail.locator('.rail-track').focus();
      await expect(rail).toHaveAttribute('data-autoplay', 'paused');
      const manual = await rail.getAttribute('data-slide-index');
      await page.keyboard.press('ArrowRight');
      await expect(rail).not.toHaveAttribute('data-slide-index', manual);
      await clearFocusAndHover(page);
      await expect(rail).toHaveAttribute('data-autoplay', 'playing');
      const voices = page.locator('#testimonials');
      await voices.scrollIntoViewIfNeeded();
      await voices.getByRole('button', { name: 'Read the full quote', exact: true }).first().click();
      await clearFocusAndHover(page);
      await expect(voices).toHaveAttribute('data-autoplay', 'paused');
      const reading = await voices.getAttribute('data-slide-index');
      await page.waitForTimeout(5600);
      await expect(voices).toHaveAttribute('data-slide-index', reading);
      const collapse = voices.getByRole('button', { name: /(?:Show less|Close full quote|Read less|Collapse)/i }).first();
      await expect(collapse).toBeVisible();
      await collapse.click();
      await clearFocusAndHover(page);
      await expect(voices).toHaveAttribute('data-autoplay', 'playing');
      await expect(voices).not.toHaveAttribute('data-slide-index', reading, { timeout: 7200 });
      return { hover: 'stable longer than interval, then resumed', keyboard: 'manual next available without a visible button', quote: 'stable while expanded, resumes after collapse' };
    } finally { await context.close(); }
  });

  await check('reduced motion retains keyboard access and requests no film', async () => {
    const context = await browser.newContext({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    let filmRequests = 0;
    page.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) filmRequests++; });
    try {
      await page.goto(base);
      for (const selector of ['.campus-news-v12', '.campus-v12', '.recognition-rail', '.recruiter-rail', '#testimonials']) {
        const surface = page.locator(selector);
        await surface.scrollIntoViewIfNeeded();
        await expect(surface).toHaveAttribute('data-autoplay', 'paused');
        const first = await surface.getAttribute('data-slide-index');
        await (selector.includes('rail') ? surface.locator('.rail-track') : surface).focus();
        await page.keyboard.press('ArrowRight');
        await expect(surface).not.toHaveAttribute('data-slide-index', first);
      }
      await expect(page.getByRole('button', { name: /^(?:Pause|Resume|Previous|Next|Enlarge)\b/i })).toHaveCount(0);
      assert.equal(filmRequests, 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      return { filmRequests, fiveSurfaces: 'paused with keyboard next preserved' };
    } finally { await context.close(); }
  });

  await check('saved global motion preference stops all automatic surfaces', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    try {
      await page.goto(base);
      await page.getByRole('button', { name: 'Open SNJB menu', exact: true }).click();
      await page.getByRole('switch', { name: 'Background motion', exact: true }).uncheck();
      await page.keyboard.press('Escape');
      await page.reload();
      await expect(page.locator('.cinematic-video')).toHaveCount(0);
      const indices = {};
      for (const selector of ['.campus-news-v12', '.campus-v12', '.recognition-rail', '.recruiter-rail', '#testimonials']) {
        const surface = page.locator(selector);
        await surface.scrollIntoViewIfNeeded();
        await clearFocusAndHover(page);
        await expect(surface).toHaveAttribute('data-autoplay', 'paused');
        indices[selector] = await surface.getAttribute('data-slide-index');
      }
      await page.waitForTimeout(5600);
      for (const [selector, index] of Object.entries(indices)) await expect(page.locator(selector)).toHaveAttribute('data-slide-index', index);
      return { persisted: true, allFive: 'paused', film: 'not requested' };
    } finally { await context.close(); }
  });
} finally { await browser.close(); }
assert.equal(report.filter(item => item.status === 'failed').length, 0);
