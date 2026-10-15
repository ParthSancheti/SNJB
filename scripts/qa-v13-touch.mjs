import {chromium,devices,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('qa',{recursive:true});
const base=process.env.SNJB_QA_URL||'http://127.0.0.1:4178',browser=await chromium.launch({channel:'chrome'}),results=[];
try{for(const name of ['iPhone 13','Pixel 7']){
 const context=await browser.newContext({...devices[name],reducedMotion:'no-preference'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base);await expect(page.locator('.cinematic-video')).toHaveClass(/is-ready/,{timeout:30000});assert.equal(await page.evaluate(()=>matchMedia('(hover:hover)').matches),false);
  const taps=await page.locator('.cinematic-actions a').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{label:node.textContent,hit:node.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),height:r.height}}));assert.ok(taps.every(item=>item.hit&&item.height>=44));
  const dock=page.getByRole('navigation',{name:'Primary pages'});await dock.getByRole('link',{name:'Campus',exact:true}).tap();await expect(page.locator('.navigation-app-sheet')).toBeVisible();await expect(page).toHaveURL(base+'/student-life');await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);await expect(page.locator('.site-footer')).toHaveCount(0);
  await dock.getByRole('link',{name:'Explore',exact:true}).tap();await expect(page).toHaveURL(base+'/explore');await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);await expect(page.locator('.resource-list-root>li')).toHaveCount(9);
  await page.locator('.resource-list-root button').filter({hasText:'Academics'}).tap();await expect(page.locator('#resource-folder-title')).toHaveText('Academics');await page.locator('.resource-row').filter({hasText:'Departments'}).first().tap();await expect(page.locator('#resource-folder-title')).toHaveText('Departments');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Open SNJB menu',exact:true}).tap();await expect(page.getByRole('dialog',{name:'Quick access'})).toBeVisible();assert.ok(await page.locator('.hub-background-glass').evaluate(el=>parseFloat(getComputedStyle(el).backdropFilter.match(/blur\(([\d.]+)px/)[1])>=14));await page.getByRole('button',{name:'Close navigation',exact:true}).tap();
  await page.getByRole('button',{name:'Search programmes and resources',exact:true}).tap();await expect(page.locator('.snjb-search').getByRole('searchbox')).toBeFocused();await expect.poll(()=>page.evaluate(()=>document.getElementById('root').inert)).toBe(true);await page.locator('.snjb-search').getByRole('searchbox').fill('fees');await expect(page.locator('[data-search-result]').first()).toContainText('2026–27');await page.getByRole('button',{name:'Close search',exact:true}).tap();await expect(page.locator('.snjb-search')).toHaveCount(0);
  await dock.getByRole('link',{name:'Apply',exact:true}).tap();await expect(page).toHaveURL(base+'/apply');await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);await page.getByRole('button',{name:'Direct second year',exact:true}).tap();await expect(page.locator('.visitor-route h2')).toHaveText('Direct second year');await page.screenshot({path:`qa/v13-touch-${name.replaceAll(' ','-')}.png`});assert.deepEqual(errors,[]);results.push({device:name,status:'passed',heroTapTargets:taps});console.log(`PASS touch ${name}`);
 }finally{await context.close()}
}}finally{await browser.close()}
await fs.writeFile('qa/v13-touch-verification.json',JSON.stringify({method:'Chrome emulated touch/mobile/device scale; not physical hardware',results},null,2));
