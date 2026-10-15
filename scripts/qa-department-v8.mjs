import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

await fs.mkdir('qa',{recursive:true});
const base=process.env.SNJB_PREVIEW_URL||'http://127.0.0.1:4173';
const directory=JSON.parse(await fs.readFile('src/data/faculty-directory.json','utf8'));
const browser=await chromium.launch({channel:'chrome'}),report=[];
try {
  for(const width of [320,390,430,768,1440]) for(const theme of ['light','dark']) {
    const context=await browser.newContext({viewport:{width,height:width<600?844:900},reducedMotion:'no-preference'});
    if(process.env.SNJB_QA_OFFLINE_FONTS==='1') await context.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,route=>route.abort());
    await context.addInitScript(value=>localStorage.setItem('snjb-theme',value),theme);
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${base}/computer-engineering`,{waitUntil:'domcontentloaded'});
    await expect(page.locator('.department-v8 h1')).toBeVisible({timeout:20000});
    await expect(page.locator('#dept-curriculum')).toBeAttached();
    await page.locator('#dept-curriculum').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
    const curriculum=await page.evaluate(()=>{const finder=document.querySelector('.dept-syllabus-finder'),story=document.querySelector('.dept-curriculum-story');return{finderY:finder.getBoundingClientRect().top,storyY:story.getBoundingClientRect().top,font:[...finder.querySelectorAll('select')].map(el=>parseFloat(getComputedStyle(el).fontSize)),sectionY:document.querySelector('#dept-curriculum').getBoundingClientRect().top+scrollY}});
    assert.ok(curriculum.font.every(size=>size>=16),'Curriculum selectors stay readable');
    if(width<=850) assert.ok(curriculum.finderY<curriculum.storyY,'Finder precedes editorial copy');
    await page.getByLabel('Admission batch',{exact:true}).selectOption('2025–29');
    await page.getByLabel('Study year',{exact:true}).selectOption('2');
    await expect(page.locator('.dept-syllabus-result')).toContainText('Second Year B.Tech');
    await expect(page.locator('.dept-syllabus-result a')).toHaveAttribute('href',/2026-27_SYBTech_COMP_2025-2029.pdf$/);
    if(width===320||width===390||width===1440) await page.screenshot({path:`qa/v8-curriculum-${width}-${theme}.png`});
    await page.locator('#dept-faculty').scrollIntoViewIfNeeded();await page.waitForTimeout(450);
    await page.getByRole('button',{name:'Show all 37 people',exact:true}).click();
    await expect(page.locator('.dept-faculty-card')).toHaveCount(37);
    const people=await page.locator('.dept-faculty-card').evaluateAll(cards=>cards.map(card=>({height:card.getBoundingClientRect().height,columns:getComputedStyle(card).gridTemplateColumns,name:card.querySelector('h3').innerText,roleFont:parseFloat(getComputedStyle(card.querySelector('.dept-faculty-info>p')).fontSize),nameFont:parseFloat(getComputedStyle(card.querySelector('h3')).fontSize),src:card.querySelector('img')?.getAttribute('src'),fields:card.querySelector('dl').textContent})));
    assert.deepEqual(people.map(person=>person.src),directory.people.map(person=>person.image),'All original portrait identities remain');
    people.forEach((person,index)=>{assert.ok(person.roleFont>=14);assert.ok(person.nameFont>=16);Object.values(directory.people[index].fields).forEach(value=>assert.ok(person.fields.includes(value),`${person.name}: preserved field ${value}`));});
    if(width<851) {
      const positions=await page.locator('.dept-faculty-grid>div').evaluateAll(nodes=>nodes.slice(0,3).map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
      assert.ok(Math.abs(positions[0].x-positions[1].x)<1,'Phone people directory uses one readable column');
      assert.ok(positions[1].y>positions[0].y);
      assert.ok(people[0].height<300,'Closed faculty cards remain compact');
    }
    if(width===320||width===390||width===1440) await page.screenshot({path:`qa/v8-faculty-list-${width}-${theme}.png`});
    await page.getByRole('combobox',{name:'Filter faculty and staff'}).selectOption('Staff');await expect(page.locator('.dept-faculty-card')).toHaveCount(10);
    await page.getByRole('combobox',{name:'Filter faculty and staff'}).selectOption('Everyone');
    await page.getByRole('searchbox',{name:'Search faculty and staff by name or interest'}).fill('Sanghavi');await expect(page.locator('.dept-faculty-card')).toHaveCount(2);
    const first=page.locator('.dept-faculty-card').first();await first.locator('summary').click();await expect(first.locator('dl')).toBeVisible();await expect(first.locator('dl')).toContainText('Image Processing');await expect(first.locator('dl a[href^="mailto:"]')).toBeVisible();
    if(width===320||width===390||width===1440) await page.screenshot({path:`qa/v8-faculty-${width}-${theme}.png`});
    await expect(page.locator('.dept-source-panel')).toHaveCount(16);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page stays within viewport');
    assert.deepEqual(errors,[]);
    report.push({width,theme,curriculum,firstCardHeight:people[0].height,portraitCount:people.length,sourceSections:16,errors});
    console.log(`CS task layout passed ${width}px ${theme}`);await context.close();
  }
  for(const theme of ['light','dark']) {
    const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await context.addInitScript(t=>localStorage.setItem('snjb-theme',t),theme);const page=await context.newPage();await page.goto(`${base}/computer-engineering`);await expect(page.locator('h1')).toBeVisible();
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();await fs.writeFile(`qa/v8-cs-axe-${theme}.json`,JSON.stringify(scan.violations,null,2));assert.deepEqual(scan.violations.map(v=>({id:v.id,targets:v.nodes.map(node=>node.target)})),[]);await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),page=await context.newPage();await page.goto(`${base}/computer-engineering`);await expect(page.locator('h1')).toBeVisible();const disclosure=page.locator('.dept-model-disclosure');await expect(disclosure).not.toHaveAttribute('open','');await disclosure.locator('summary').click();await page.locator('.engineering-scene').scrollIntoViewIfNeeded();await expect(page.locator('.es-stage')).toHaveClass(/is-ready/,{timeout:20000});const canvas=page.locator('.es-stage canvas'),slider=page.locator('.es-controls input');await slider.focus();await page.keyboard.press('Home');await page.waitForTimeout(100);const hash=buffer=>createHash('sha256').update(buffer).digest('hex'),before=hash(await canvas.screenshot());for(let i=0;i<12;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);assert.notEqual(hash(await canvas.screenshot()),before,'Optional computing model responds to accessible keyboard control');await context.close();
  await fs.writeFile('qa/v8-department-verification.json',JSON.stringify({status:'passed',report,fonts:process.env.SNJB_QA_OFFLINE_FONTS==='1'?'External font hosts blocked to exercise fallback':'Site fonts loaded normally',axe:'390px light/dark',processor:'Optional disclosure and keyboard interaction passed',limitations:'Desktop Chrome viewport emulation; no physical phone or Safari certification'},null,2));
} finally {await browser.close();}
