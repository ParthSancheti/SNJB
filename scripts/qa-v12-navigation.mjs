import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
await fs.mkdir('qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),report=[];
try{
for(const [width,height,theme] of [[1440,900,'light'],[1024,768,'dark'],[390,844,'light']]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await context.addInitScript(t=>localStorage.setItem('snjb-theme',t),theme);
 await page.goto((process.env.SNJB_QA_URL||'http://127.0.0.1:4178')+'/');await expect(page.locator('main h1')).toBeVisible();
 if(width>=1024){
  const about=page.getByRole('navigation',{name:'Desktop primary navigation'}).getByRole('button',{name:'About',exact:true});
  await about.hover();await expect(page.locator('.desktop-mega')).toBeVisible();await expect(page.locator('.desktop-mega-content h3')).toHaveText('About the college');
  await page.mouse.move(width-8,height-8);await expect(page.locator('.desktop-mega')).toHaveCount(0);
  await about.hover();const header=await page.locator('.header-inner').boundingBox(),panel=await page.locator('.desktop-mega').boundingBox();await page.mouse.move(header.x+header.width/2,header.y+header.height+4);await page.waitForTimeout(80);await page.mouse.move(panel.x+panel.width/2,panel.y+10);await expect(page.locator('.desktop-mega')).toBeVisible();
  await page.mouse.move(width-8,height-8);await expect(page.locator('.desktop-mega')).toHaveCount(0);
  await about.click();await expect(page.locator('.desktop-mega')).toHaveAttribute('data-pinned','true');await page.mouse.move(width-8,height-8);await expect(page.locator('.desktop-mega')).toBeVisible();
  await page.getByRole('navigation',{name:'College navigation categories'}).getByRole('button',{name:'Academics',exact:true}).hover();await expect(page.locator('.desktop-mega-content h3')).toHaveText('Academics');
  const departments=page.locator('.desktop-mega-content summary').filter({hasText:'Departments'}).first();await departments.hover();await expect(departments.locator('..')).toHaveAttribute('open','');const computer=page.locator('.desktop-mega-content summary').filter({hasText:'Computer Engineering'}).first();await computer.hover();await expect(computer.locator('..')).toHaveAttribute('open','');await expect(page.locator('.desktop-mega-content a[href="/computer-engineering#source-people-computer"]')).toBeVisible();
  await page.screenshot({path:`qa/v12-nav-${width}-${theme}.png`});const axe=await new AxeBuilder({page}).include('.site-header').analyze();if(axe.violations.length)throw Error(JSON.stringify(axe.violations.map(v=>[v.id,v.nodes.map(n=>n.target)])));
  await page.keyboard.press('Escape');await expect(page.locator('.desktop-mega')).toHaveCount(0);await expect(about).toBeFocused();
 }
 const search=page.getByRole('button',{name:'Search programmes and resources',exact:true});await search.click();await expect(page.getByRole('dialog',{name:'Search SNJB'})).toBeVisible();await expect(page.getByRole('searchbox')).toBeFocused();await page.getByRole('searchbox').fill('computer curriculum');await expect(page.locator('[data-search-result]').first()).toContainText('Computer Engineering curriculum');
 const geometry=await page.locator('.snjb-search').boundingBox(),nav=await page.locator('.header-inner').boundingBox();if(width>=1024&&Math.abs(geometry.width-nav.width)>2)throw Error('Search not navbar width');if(geometry.x<0||geometry.x+geometry.width>width+1||geometry.y+geometry.height>height+1)throw Error('Search overflow '+JSON.stringify(geometry));
 const axe=await new AxeBuilder({page}).include('.snjb-search-layer').analyze();if(axe.violations.length)throw Error(JSON.stringify(axe.violations.map(v=>[v.id,v.nodes.map(n=>n.target)])));
 await page.screenshot({path:`qa/v12-search-${width}-${theme}.png`});await page.keyboard.press('Escape');await expect(search).toBeFocused();await expect(page.locator('.snjb-search')).toHaveCount(0);
 if(errors.length)throw Error(errors.join('\n'));report.push({width,height,theme,status:'passed',searchGeometry:geometry});console.log('PASS',width,theme);await context.close();
}
}catch(e){console.error(e);process.exitCode=1}finally{await browser.close();await fs.writeFile('qa/v12-navigation-verification.json',JSON.stringify(report,null,2))}
