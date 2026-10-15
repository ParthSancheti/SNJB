import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const source = await fs.readFile('src/data/department-content.json', 'utf8');
assert.equal(source, await fs.readFile('public/data/department-content.json', 'utf8'));
const content = JSON.parse(source);
assert.equal(content.sections.length, 16);
assert.equal(content.counts.failed, 0);
let images = 0, tables = 0, text = 0;
for (const section of content.sections) {
  assert.ok(section.text.trim()); text += section.text.length;
  assert.doesNotMatch(section.html, /<(?:script|iframe|form|style)\b|\son\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:javascript|data):/i);
  for (const match of section.html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
    assert.ok(match[1].startsWith('/images/')); await fs.access(`public${match[1]}`);
    assert.match(match[0], /loading="lazy"/); images++;
  }
  tables += [...section.html.matchAll(/<table\b/g)].length;
}
assert.equal(images, 146); assert.equal(tables, 55); assert.equal(text, 50115);
const resources = JSON.parse(await fs.readFile('public/images/resources/manifest.json', 'utf8'));
assert.equal(resources.files.length, 109);
// Original capture hashes/URLs remain provenance; only the rendered delivery
// copies belong in the runnable distribution.
for (const record of resources.files) for (const [path, hash, count] of [[record.deliveryPath, record.deliverySha256, record.deliveryBytes]]) {
  const bytes = await fs.readFile(`public${path}`); assert.equal(bytes.length, count);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
}
console.log(`Content verified: 16 sections, ${text} text characters, ${tables} tables, ${images} local image references, 109 optimized resource files.`);
const homeBytes = await fs.readFile('public/data/homepage-content.json');
const fullHome = JSON.parse(homeBytes);
const summary = JSON.parse(await fs.readFile('public/data/homepage-summary.json', 'utf8'));
assert.equal(summary.metadata.sourceSnapshotSha256, createHash('sha256').update(homeBytes).digest('hex'));
for (const key of ['eventsVisible', 'notices', 'testimonials', 'recruiters']) assert.deepEqual(summary[key], fullHome[key]);
console.log('Visible homepage summary matches all original events, notices, testimonial texts and recruiter records.');
