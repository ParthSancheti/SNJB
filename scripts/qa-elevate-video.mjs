import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = (process.env.SNJB_QA_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
const performanceOnly = process.argv.includes('--performance-only');
await fs.mkdir('qa', { recursive: true });
const channel = process.env.SNJB_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({ channel });
const results = [];
const files = {};
for (const name of ['campus-desktop-v10.mp4', 'campus-mobile-v10.mp4', 'campus-poster-desktop-v10.webp', 'campus-poster-mobile-v10.webp']) {
  files[name] = (await fs.stat(`public/media/${name}`)).size;
}
const report = () => fs.writeFile('qa/elevate-video.json', JSON.stringify({
  checkedAt: new Date().toISOString(), base, mode: performanceOnly ? 'isolated responsive performance rerun' : 'five grouped functional and performance cases', browser: `Headless ${channel} ${browser.version()} on Windows`,
  method: 'Fresh browser context percase; local production preview, no network throttling except the explicitly held response. Mobile viewport is emulation. LCP observed via buffered PerformanceObserver. CDP task metrics only sampled on desktop.',
  limits: 'Not physical-phone, Safari, GPU, internet-throughput or production-CDN certification. Request body sizes include actual range responses and may differ from encoded file bytes. Poster LCP is reported only when observed as an LCP candidate.',
  encodedFileBytes: files, results,
}, null, 2));

async function check(name, work) {
  try { const evidence = await work(); results.push({ name, status: 'passed', evidence }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
  await report();
}

async function instrument(context) {
  await context.addInitScript(() => {
    window.__campusVideoAudit = { mediaEvents: [], lcp: [] };
    for (const type of ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'playing', 'waiting', 'stalled', 'error']) {
      document.addEventListener(type, event => {
        if (event.target instanceof HTMLVideoElement) window.__campusVideoAudit.mediaEvents.push({
          type, atMs: performance.now(), time: event.target.currentTime, readyState: event.target.readyState,
        });
      }, true);
    }
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) window.__campusVideoAudit.lcp.push({
          atMs: entry.startTime, renderTimeMs: entry.renderTime, loadTimeMs: entry.loadTime,
          size: entry.size, tag: entry.element?.tagName, className: entry.element?.className || '', url: entry.url,
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { window.__campusVideoAudit.lcpUnavailable = true; }
  });
}

const playerState = film => film.evaluate(video => {
  const quality = video.getVideoPlaybackQuality();
  return {
    src: video.currentSrc, duration: video.duration, time: video.currentTime, paused: video.paused,
    width: video.videoWidth, height: video.videoHeight, loop: video.loop, readyState: video.readyState,
    quality: { totalFrames: quality.totalVideoFrames, droppedFrames: quality.droppedVideoFrames },
  };
});

try {
  for (const width of [1440, 390]) await check(`responsive playback and loading ${width}`, async () => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 768, hasTouch: width < 768, reducedMotion: 'no-preference' });
    await instrument(context);
    const page = await context.newPage();
    const responses = [];
    const pending = [];
    page.on('requestfinished', request => {
      if (!/\/media\/campus-(?:desktop|mobile|poster-).*v10\.(?:mp4|webp)(?:\?|$)/.test(request.url())) return;
      pending.push((async () => {
        const response = await request.response();
        responses.push({ url: request.url(), status: response.status(), timing: request.timing(), sizes: await request.sizes(), contentRange: await response.headerValue('content-range') });
      })().catch(error => responses.push({ url: request.url(), error: error.message })));
    });
    const cdp = await context.newCDPSession(page);
    const streams = new Map();
    await cdp.send('Network.enable');
    cdp.on('Network.requestWillBeSent', event => {
      if (/\/media\/campus-/.test(event.request.url)) streams.set(event.requestId, {
        url: event.request.url, startedAtEpochMs: event.wallTime * 1000,
        receivedBodyBytes: 0, receivedEncodedChunkBytes: 0, completed: false,
      });
    });
    cdp.on('Network.responseReceived', event => {
      const stream = streams.get(event.requestId);
      const header = name => Object.entries(event.response.headers).find(([key]) => key.toLowerCase() === name)?.[1];
      if (stream) Object.assign(stream, { status: event.response.status, declaredContentLength: header('content-length'), contentRange: header('content-range') });
    });
    cdp.on('Network.dataReceived', event => {
      const stream = streams.get(event.requestId);
      if (stream) { stream.receivedBodyBytes += event.dataLength; stream.receivedEncodedChunkBytes += event.encodedDataLength; }
    });
    cdp.on('Network.loadingFinished', event => {
      const stream = streams.get(event.requestId);
      if (stream) Object.assign(stream, { completed: true, totalEncodedResponseBytes: event.encodedDataLength });
    });
    if (width >= 1024) await cdp.send('Performance.enable');
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      const film = page.locator('.cinematic-video');
      await expect(film).toHaveClass(/is-ready/, { timeout: 30000 });
      await expect.poll(() => film.evaluate(video => video.paused)).toBe(false);
      const before = await playerState(film);
      assert.match(before.src, width < 768 ? /mobile-v10/ : /desktop-v10/);
      assert.ok(Math.abs(before.duration - 15) < .1);
      assert.equal(before.loop, true);
      const metricStart = width >= 1024 ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name, item.value])) : null;
      const sampleStarted = Date.now();
      await page.waitForTimeout(2200);
      const after = await playerState(film);
      const sampleDuration = Date.now() - sampleStarted;
      const advanced = (after.time - before.time + after.duration) % after.duration;
      assert.ok(advanced > .5, `Actual video time advanced ${advanced}s`);
      const metricEnd = width >= 1024 ? Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name, item.value])) : null;
      const metrics = metricStart ? {
        method: 'Desktop host CDP Performance domain; task durations, not device CPU utilization',
        sampledWallMs: (metricEnd.Timestamp - metricStart.Timestamp) * 1000,
        taskDurationMs: (metricEnd.TaskDuration - metricStart.TaskDuration) * 1000,
        scriptDurationMs: (metricEnd.ScriptDuration - metricStart.ScriptDuration) * 1000,
        layoutDurationMs: (metricEnd.LayoutDuration - metricStart.LayoutDuration) * 1000,
        styleDurationMs: (metricEnd.RecalcStyleDuration - metricStart.RecalcStyleDuration) * 1000,
      } : undefined;
      await Promise.all(pending);
      const observed = await page.evaluate(() => ({
        timeOrigin: performance.timeOrigin,
        ...window.__campusVideoAudit,
        paint: performance.getEntriesByType('paint').map(entry => ({ name: entry.name, atMs: entry.startTime })),
        mediaResources: performance.getEntriesByType('resource').filter(entry => /\/media\/campus-/.test(entry.name)).map(entry => ({
          url: entry.name, startMs: entry.startTime, durationMs: entry.duration, transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize, decodedBodySize: entry.decodedBodySize, initiatorType: entry.initiatorType,
        })),
      }));
      const network = responses.map(response => ({ ...response, startRelativeToNavigationMs: response.timing ? response.timing.startTime - observed.timeOrigin : undefined }));
      const posterLCP = observed.lcp.filter(entry => typeof entry.className === 'string' && entry.className.includes('cinematic-poster'));
      const renderedFrames = after.quality.totalFrames - before.quality.totalFrames;
      const droppedFrames = after.quality.droppedFrames - before.quality.droppedFrames;
      return {
        viewport: { width, height: 900 }, before, after, sampleDurationMs: sampleDuration, advancedSeconds: advanced,
        frameSample: { totalFrames: renderedFrames, droppedFrames, droppedFraction: renderedFrames ? droppedFrames / renderedFrames : null },
        posterLCP: posterLCP.length ? posterLCP : 'Poster was not an observed LCP candidate; see actual candidates below.',
        ...observed, network, networkStreams: [...streams.values()].map(stream => ({ ...stream, startRelativeToNavigationMs: stream.startedAtEpochMs - observed.timeOrigin })), desktopTaskMetrics: metrics,
      };
    } finally { await context.close(); }
  });

  if (!performanceOnly) {
  await check('reduced motion and Save-Data request no MP4', async () => {
    const evidence = [];
    for (const policy of ['reduced-motion', 'save-data']) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: policy === 'reduced-motion' ? 'reduce' : 'no-preference' });
      if (policy === 'save-data') await context.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
      const page = await context.newPage();
      let mp4Requests = 0;
      page.on('request', request => { if (/\.mp4(?:\?|$)/.test(request.url())) mp4Requests++; });
      try {
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('.cinematic-poster')).toBeVisible();
        await expect.poll(() => page.locator('.cinematic-poster').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        await page.waitForTimeout(800);
        await expect(page.locator('.cinematic-video')).toHaveCount(0);
        assert.equal(mp4Requests, 0);
        evidence.push({ policy, mp4Requests, posterLoaded: true });
      } finally { await context.close(); }
    }
    return evidence;
  });

  await check('video request failure preserves the poster', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    await context.route('**/*.mp4', route => route.abort());
    const page = await context.newPage();
    let requests = 0;
    page.on('request', request => { if (request.url().includes('.mp4')) requests++; });
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await expect.poll(() => requests).toBeGreaterThan(0);
      await expect(page.locator('.cinematic-video')).toHaveCount(0);
      await expect.poll(() => page.locator('.cinematic-poster').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      await expect(page.locator('.cinematic-copy h1')).toBeVisible();
      return { abortedVideoRequests: requests, posterLoaded: true, homeHeadingRemainsVisible: true };
    } finally { await context.close(); }
  });

  await check('slow video response leaves poster visible and recovers', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await context.route('**/*.mp4', async route => { await gate; await route.continue().catch(() => {}); });
    const page = await context.newPage();
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.hero-v7-slow')).toBeVisible({ timeout: 8000 });
      await expect.poll(() => page.locator('.cinematic-poster').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
      const before = await page.locator('.cinematic-video').evaluate(video => ({ readyState: video.readyState, time: video.currentTime, opacity: getComputedStyle(video).opacity }));
      const slowStatusAtMs = await page.evaluate(() => performance.now());
      assert.equal(Number(before.opacity), 0);
      release();
      await expect(page.locator('.cinematic-video')).toHaveClass(/is-ready/, { timeout: 30000 });
      await expect(page.locator('.hero-v7-slow')).toHaveCount(0);
      await expect.poll(() => page.locator('.cinematic-video').evaluate(video => video.currentTime)).toBeGreaterThan(.1);
      return { deliberatelyHeldResponse: true, slowStatusObservedAtMs: slowStatusAtMs, waitingVideo: before, posterLoaded: true, recoveredToPlayback: true };
    } finally { release(); await context.close(); }
  });
  }
} finally { await browser.close(); }

assert.equal(results.filter(result => result.status === 'failed').length, 0, 'All video audit cases must pass; see qa/elevate-video.json');
