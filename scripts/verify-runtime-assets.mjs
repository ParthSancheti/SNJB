import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.SNJB_QA_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({channel:'chrome'});
try {
 for(const route of ['/','/computer-engineering','/student-life','/apply','/explore']) {
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),failures=[];
  page.on('pageerror',error=>failures.push(error.message));
  await page.goto(base+route);await expect(page.locator('main h1')).toBeVisible();
  if(route==='/') {await page.locator('.hsa-expand-records').click();for(const node of await page.locator('.hsa-disclosure summary').all())await node.click()}
  if(route==='/computer-engineering')for(const node of await page.locator('.dept-source-panel summary').all())await node.click();
  await page.evaluate(()=>document.fonts.ready);
  const sources=await page.locator('img').evaluateAll(nodes=>nodes.flatMap(node=>[node.getAttribute('src'),...(node.getAttribute('srcset')||'').split(',').map(part=>part.trim().split(' ')[0])]).filter(src=>src?.startsWith('/')));
  for(const path of new Set(sources)) {
   const response=await page.request.get(base+path);
   assert.equal(response.status(),200,`${route}: ${path}`);
   assert.match(response.headers()['content-type']||'',/^image\//,`${route}: actual image rather than HTML fallback: ${path}`);
  }
  assert.deepEqual(failures,[]);console.log(`PASS ${route}: ${new Set(sources).size} local image paths, no page errors`);await page.close();
 }
 for(const name of ['campus-desktop-v10.mp4','campus-mobile-v10.mp4'])assert.ok((await fs.stat(`public/media/${name}`)).size>1000000);
 for(const name of ['dm-sans-latin.woff2','manrope-latin.woff2','instrument-serif-latin.woff2','noto-sans-devanagari-devanagari.woff2','noto-sans-devanagari-latin.woff2'])await fs.access(`public/fonts/${name}`);
 console.log('PASS current responsive videos and self-hosted fonts present');
}finally{await browser.close()}
