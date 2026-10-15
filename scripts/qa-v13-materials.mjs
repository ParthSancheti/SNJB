import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('qa',{recursive:true});

const base=process.env.SNJB_QA_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({channel:'chrome'}),results=[];
const alpha=style=>{const match=style.match(/rgba\([^()]*,\s*([\d.]+)\)/);return match?Number(match[1]):1};
try {
  for(const [width,height,theme] of [[390,844,'dark'],[1440,900,'light']]) {
    const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage();
    await context.addInitScript(value=>localStorage.setItem('snjb-theme',value),theme);
    try {
      await page.goto(base);await expect(page.locator('main h1')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
      for(const action of await page.locator('.cinematic-actions a').all())assert.equal(await action.evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');
      await page.screenshot({path:`qa/v13-final-hero-${width}-${theme}.png`});
      if(width<1024) {
        await page.getByRole('button',{name:'Open SNJB menu',exact:true}).click();
        await expect(page.getByRole('dialog',{name:'Quick access'})).toBeVisible();
        assert.equal(alpha(await page.locator('.navigation-hub-layer-v13').evaluate(el=>getComputedStyle(el).backgroundColor)),0,'Dark quick menu has no inherited black veil');
        assert.ok(alpha(await page.locator('.hub-background-glass').evaluate(el=>getComputedStyle(el).backgroundColor))<=.1);
        await page.screenshot({path:'qa/v13-final-quick-dark.png'});await page.keyboard.press('Escape');
      }
      await page.getByRole('button',{name:'Search programmes and resources',exact:true}).click();
      await expect(page.getByRole('dialog',{name:'Search SNJB'})).toBeVisible();
      assert.ok(alpha(await page.locator('.snjb-search-backdrop').evaluate(el=>getComputedStyle(el).backgroundColor))<.2);
      await page.keyboard.press('Escape');await expect(page.locator('.snjb-search')).toHaveCount(0);
      await page.getByRole('button',{name:'Open SNJB guide',exact:true}).click();
      await expect(page.locator('.snjb-guide')).toBeVisible();
      assert.ok(alpha(await page.locator('.snjb-guide-backdrop').evaluate(el=>getComputedStyle(el).backgroundColor))<.2,'Guide backdrop is also translucent in dark mode');
      await page.keyboard.press('Escape');await expect(page.locator('.snjb-guide')).toHaveCount(0);
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      const footer=await page.locator('.site-footer').evaluate(el=>({fill:getComputedStyle(el).backgroundImage,blur:getComputedStyle(el).backdropFilter}));
      assert.match(footer.fill,/linear-gradient/);assert.match(footer.blur,/blur\(30px\)/);
      await page.screenshot({path:`qa/v13-final-footer-${width}-${theme}.png`});
      results.push({width,height,theme,status:'passed'});console.log(`PASS material regressions ${width} ${theme}`);
    }finally{await context.close()}
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();
  let releaseImage;
  const imageGate=new Promise(resolve=>{releaseImage=resolve});
  try {
    await page.route('**/campaign/v8/orientation.webp',async route=>{await imageGate;await route.continue()});
    await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.campus-v12').scrollIntoViewIfNeeded();
    const loading=page.locator('.campus-v12 .photo-frame[aria-busy=true]').first();
    await expect(loading.locator('.photo-loading-sheen')).toHaveCount(1);
    releaseImage();
    await expect(page.locator('.campus-v12 .photo-frame.is-loaded')).toHaveCount(2,{timeout:10000});
    await expect(page.locator('.campus-v12 .photo-loading-sheen')).toHaveCount(0);
    results.push({name:'Real image loading and reveal',status:'passed'});console.log('PASS actual image load feedback');
  }finally{releaseImage();await context.close()}
}finally{await browser.close()}
await fs.writeFile('qa/v13-material-verification.json',JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));
