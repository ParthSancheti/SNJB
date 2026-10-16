import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = (process.env.SNJB_QA_URL || 'http://127.0.0.1:4178').replace(/\/$/, '');
const channel = process.env.SNJB_QA_CHANNEL || 'msedge';
async function imagesIn(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? imagesIn(file) : /\.(avif|gif|ico|jpe?g|png|svg|webp)$/i.test(entry.name) ? [file] : [];
  }));
  return nested.flat();
}
const sources = (await imagesIn('public')).map(file => '/' + path.relative('public', file).split(path.sep).map(encodeURIComponent).join('/')).sort();
assert.ok(sources.length, 'The image library must not be empty');
const browser = await chromium.launch({ channel });
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  // A same-origin minimal document avoids rendering the site or starting media.
  await page.route(`${base}/__image-library-check__`, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Image library check</title>' }));
  await page.goto(`${base}/__image-library-check__`);
  const results = await page.evaluate(async sources => {
    const results = [];
    let cursor = 0;
    async function worker() {
      while (cursor < sources.length) {
        const src = sources[cursor++];
        let objectURL;
        try {
          const response = await fetch(src, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
          const mime = response.headers.get('content-type') || '';
          if (!response.ok || !/^image\//.test(mime)) throw new Error(`HTTP ${response.status}, MIME ${mime}`);
          const blob = await response.blob();
          objectURL = URL.createObjectURL(blob);
          const image = new Image();
          image.src = objectURL;
          await image.decode();
          if (!image.naturalWidth || !image.naturalHeight) throw new Error('Decoded image has zero dimensions');
          results.push({ src, status: 'passed', mime, bytes: blob.size, width: image.naturalWidth, height: image.naturalHeight });
          image.src = '';
        } catch (error) {
          results.push({ src, status: 'failed', error: error.message });
        } finally {
          if (objectURL) URL.revokeObjectURL(objectURL);
        }
      }
    }
    await Promise.all(Array.from({ length: 4 }, worker));
    return results.sort((a, b) => a.src.localeCompare(b.src));
  }, sources);
  const failures = results.filter(result => result.status !== 'passed');
  await fs.mkdir('qa/elevate', { recursive: true });
  await fs.writeFile('qa/elevate/image-library.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, browser: browser.version(), channel, total: results.length, passed: results.length - failures.length, failed: failures.length, scope: 'Every image file under public: HTTP, MIME and actual browser decoding, including unused responsive variants.', results }, null, 2));
  assert.deepEqual(failures, [], 'All image files must load as images and decode');
  console.log(`PASS: all ${results.length} public images returned image MIME and decoded with nonzero dimensions.`);
} finally {
  await browser.close();
}
