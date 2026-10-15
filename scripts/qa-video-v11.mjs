import { chromium,expect } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('qa',{recursive:true});
const base=process.env.SNJB_QA_URL||'http://127.0.0.1:4178';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'}),page=await context.newPage();await page.goto(base);
  const film=page.locator('.cinematic-video');await expect(film).toHaveClass(/is-ready/,{timeout:30000});
  const state=await film.evaluate(el=>({src:el.getAttribute('src'),loop:el.loop,paused:el.paused,duration:el.duration,time:el.currentTime}));assert.equal(state.loop,true);assert.equal(state.paused,false);assert.ok(Math.abs(state.duration-15)<.1);assert.match(state.src,width<768?/mobile-v10/:/desktop-v10/);
  await page.waitForTimeout(600);assert.ok(await film.evaluate(el=>el.currentTime)>state.time);await expect(page.locator('.hero-motion-toggle')).toHaveCount(0);
  if(width>=1024)await page.getByRole('button',{name:'College menu',exact:true}).click();else await page.getByRole('button',{name:'Open SNJB menu',exact:true}).click();
  await page.getByRole('switch',{name:'Background motion',exact:true}).uncheck();await expect(film).toHaveCount(0);
  await page.reload();await expect(film).toHaveCount(0);assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.site-atmosphere span')).animationName),'none');
  await context.close();results.push({width,policy:'responsive source, actual playback, 15s loop, no visible Pause, persisted motion-off',status:'passed'});
 }
 for(const policy of ['reduce','saveData','failed']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:policy==='reduce'?'reduce':'no-preference'}),page=await context.newPage();let mp4=0;
  if(policy==='saveData')await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
  if(policy==='failed')await page.route('**/*.mp4',route=>route.abort());page.on('request',request=>{if(request.url().endsWith('.mp4'))mp4++});await page.goto(base);
  await expect(page.locator('.cinematic-poster')).toBeVisible();await page.waitForTimeout(500);if(policy!=='failed')assert.equal(mp4,0);else await expect(page.locator('.cinematic-video')).toHaveCount(0);
  await context.close();results.push({policy,status:'passed',mp4Requests:mp4});
 }
}finally{await browser.close()}
await fs.writeFile('qa/v11-video-verification.json',JSON.stringify({base,results,limitations:'Chrome host playback; no physical phone or low-end GPU certification'},null,2));console.log(`PASS ${results.length} video and fallback cases`);
