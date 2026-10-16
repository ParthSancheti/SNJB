import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { loadEnv } from 'vite';
import { ROUTE_META, ROUTE_PATHS, deploymentBase, deploymentURL } from '../src/data/route-metadata.js';

const origin = deploymentBase(process.env.VITE_SITE_URL || loadEnv('production', process.cwd(), 'VITE_').VITE_SITE_URL);
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
for (const [key, path] of Object.entries(ROUTE_PATHS)) {
  const html = await fs.readFile(path === '/' ? 'dist/index.html' : `dist${path}/index.html`, 'utf8');
  const meta = ROUTE_META[key];
  assert.equal(decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || ''), meta.title, path);
  for (const [attr, name, expected] of [
    ['name', 'description', meta.description], ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description], ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description],
  ]) {
    const values = [...html.matchAll(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`, 'g'))];
    assert.equal(values.length, 1, `${path} ${name} is unique`);
    assert.equal(decode(values[0][1]), expected, `${path} ${name}`);
  }
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const ogURL = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  if (origin) {
    assert.equal(decode(canonical || ''), deploymentURL(origin, path));
    assert.equal(decode(ogURL || ''), deploymentURL(origin, path));
    assert.match(html, /name="robots" content="index, follow"/);
  } else {
    assert.equal(canonical, undefined, `${path}: no guessed deployment canonical`);
    assert.equal(ogURL, undefined, `${path}: no inherited Home URL`);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
  }
}
assert.equal(deploymentURL(deploymentBase('https://example.org/engineering/'), '/apply'), 'https://example.org/engineering/apply');
for (const invalid of ['javascript:alert(1)', 'https://user:pass@example.org', 'https://example.org/?key=1']) {
  assert.throws(() => deploymentBase(invalid));
}
console.log(`PASS: all 12 static HTML entries have distinct route metadata; ${origin ? 'configured deployment URLs' : 'demo noindex without guessed canonical'}.`);
