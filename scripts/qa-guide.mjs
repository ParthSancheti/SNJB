import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.SNJB_QA_URL || 'http://localhost:4173';
const browser = await chromium.launch({ channel: 'chrome' });
const report = { target: base, scope: 'SNJB guide; emulated phone and desktop Chromium', cases: [], defects: [] };
const controls = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
const recordDefect = (label, details) => { report.defects.push({ label, ...details }); console.log(`DEFECT ${label}: ${JSON.stringify(details)}`); };

await fs.mkdir('qa', { recursive: true });
try {
  for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, reducedMotion: 'reduce' });
      await context.addInitScript(theme => localStorage.setItem('snjb-theme', theme), theme);
      const page = await context.newPage();
      const errors = [], failed = [], guideRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => { if (request.url().startsWith(base)) failed.push({ url: request.url(), error: request.failure()?.errorText }); });
      page.on('request', request => { if (/navigation-directory|openai|anthropic|gemini/.test(request.url())) guideRequests.push({ url: request.url(), method: request.method() }); });
      const current = { width, height, theme, queries: [], axe: [], checks: {} };
      report.cases.push(current);
      try {
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const launch = page.getByRole('button', { name: 'Open SNJB guide', exact: true });
        await launch.click();
        const panel = page.getByRole('dialog', { name: 'SNJB guide', exact: true });
        await expect(panel).toBeVisible();
        await expect(panel.locator('.snjb-guide-directory small')).toHaveText(/\d+ published destinations/);
        await expect(panel.getByRole('button', { name: 'Close SNJB guide', exact: true })).toBeFocused();
        current.checks.initialFocus = true;
        current.checks.backgroundIsolated = await page.locator('#root').evaluate(node => node.inert);
        current.checks.bodyScrollLocked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
        const geometry = await panel.evaluate(node => {
          const bounds = node.getBoundingClientRect();
          return { x: bounds.x, y: bounds.y, right: bounds.right, bottom: bounds.bottom, width: bounds.width, height: bounds.height, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth, viewportWidth: innerWidth, viewportHeight: innerHeight };
        });
        current.geometry = geometry;
        if (geometry.x < -.1 || geometry.y < -.1 || geometry.right > width + .1 || geometry.bottom > height + .1 || geometry.scrollWidth > geometry.clientWidth + 1) recordDefect('Guide overflow', { width, height, theme, geometry });
        const scan = async state => {
          const axe = await new AxeBuilder({ page }).include('.snjb-guide').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          current.axe.push({ state, violations: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) })) });
          if (axe.violations.length) recordDefect('Guide accessibility', { width, height, theme, state, violations: current.axe.at(-1).violations });
        };
        await scan('welcome');

        await panel.getByRole('button', { name: 'Close SNJB guide', exact: true }).focus();
        await page.keyboard.press('Shift+Tab');
        // Reset is the first focusable control. Shift+Tab there must wrap to the final control.
        await expect(panel.getByRole('button', { name: 'Clear guide search', exact: true })).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        const trapped = await panel.evaluate((node, selector) => {
          const items = [...node.querySelectorAll(selector)].filter(element => element.getClientRects().length);
          return document.activeElement === items.at(-1) && node.contains(document.activeElement);
        }, controls);
        current.checks.backwardFocusTrap = trapped;
        if (!trapped) recordDefect('Guide focus trap', { width, height, theme, direction: 'backward' });
        await page.keyboard.press('Tab');
        await expect(panel.getByRole('button', { name: 'Clear guide search', exact: true })).toBeFocused();
        current.checks.forwardFocusTrap = true;

        for (const query of ['computer faculty', 'admissions', 'hostel']) {
          const input = panel.getByRole('searchbox', { name: 'What are you looking for?', exact: true });
          await input.fill(query);
          await input.press('Enter');
          await expect(panel.locator('.snjb-guide-question h3')).toHaveText(query);
          const links = await panel.locator('.snjb-guide-results li a').evaluateAll(nodes => nodes.map(node => ({ label: node.querySelector('strong')?.textContent, href: node.getAttribute('href'), target: node.getAttribute('target'), rel: node.getAttribute('rel') })));
          current.queries.push({ query, status: await panel.locator('.snjb-guide-result-status').textContent(), links });
          if (!links.length) recordDefect('Guide has no expected result', { width, height, theme, query });
          if (query === 'computer faculty' && !links.some(link => /source-people-computer/.test(link.href))) recordDefect('Computer faculty local source missing', { width, height, theme, links });
          if (query === 'admissions' && !links.some(link => /admissions\/fy-btech/.test(link.href))) recordDefect('First-year admission result missing', { width, height, theme, links });
          if (query === 'hostel' && !links.some(link => /hostel/.test(link.href))) recordDefect('Hostel result missing', { width, height, theme, links });
          for (const link of links) if (/^https?:/.test(link.href) && (link.target !== '_blank' || !/noopener/.test(link.rel))) recordDefect('External result lacks safe new-tab attributes', { width, height, theme, link });
          const horizontalOverflow = await panel.locator('.snjb-guide-content').evaluate(node => node.scrollWidth > node.clientWidth + 1);
          if (horizontalOverflow) recordDefect('Guide results horizontal overflow', { width, height, theme, query });
        }
        await scan('hostel results');
        await page.screenshot({ path: `qa/guide-${width}-${theme}.png` });
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
        await expect(launch).toBeFocused();
        current.checks.escapeRestoresFocus = true;
        current.checks.backgroundRestored = await page.locator('#root').evaluate(node => !node.inert);
        current.checks.bodyScrollRestored = await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');

        await launch.click();
        await expect(panel).toBeVisible();
        // A click on the uncovered background strip is an outside dismissal.
        await page.locator('.snjb-guide-backdrop').click({ position: { x: 2, y: 2 } });
        await expect(panel).toHaveCount(0);
        await expect(launch).toBeFocused();
        current.checks.outsideRestoresFocus = true;

        await launch.click();
        await expect(panel).toBeVisible();
        await panel.getByRole('searchbox', { name: 'What are you looking for?', exact: true }).fill('computer faculty');
        await panel.getByRole('button', { name: 'Find official resources', exact: true }).click();
        await panel.locator('a[href="/computer-engineering#source-people-computer"]').click();
        await expect(page).toHaveURL(/\/computer-engineering#source-people-computer$/);
        await expect(panel).toHaveCount(0);
        await expect(page.locator('#source-people-computer')).toHaveAttribute('open', '');
        const localTarget = await page.locator('#source-people-computer').evaluate(node => ({ focused: document.activeElement === node, y: node.getBoundingClientRect().y, open: node.open }));
        current.checks.localFacultyNavigation = localTarget;
        if (!localTarget.focused || !localTarget.open || localTarget.y < -1 || localTarget.y > height / 2) recordDefect('Local guide destination focus/scroll', { width, height, theme, localTarget });
        await page.getByRole('button', { name: 'Open SNJB guide', exact: true }).click();
        await panel.getByRole('button', { name: 'Clear guide search', exact: true }).click();
        await expect(panel.getByRole('button', { name: 'Meet the faculty', exact: true })).toBeVisible();
        current.checks.departmentTopics = true;
        await panel.getByRole('link', { name: /Browse the complete directory/ }).click();
        await expect(page).toHaveURL(/\/explore$/);
        await expect(panel).toHaveCount(0);
        current.checks.directoryNavigation = true;
        current.runtimeErrors = errors; current.failedLocalRequests = failed; current.guideRequests = guideRequests;
        if (errors.length || failed.length) recordDefect('Guide runtime/request errors', { width, height, theme, errors, failed });
        if (guideRequests.some(item => !item.url.startsWith(base) || item.method !== 'GET')) recordDefect('Guide unexpected service request', { width, height, theme, guideRequests });
        current.passed = !report.defects.some(item => item.width === width && item.height === height && item.theme === theme);
        console.log(`Guide checked ${width}x${height} ${theme}: ${current.passed ? 'PASS' : 'DEFECTS'}`);
      } catch (error) {
        current.error = error.message;
        recordDefect('Guide test could not complete', { width, height, theme, error: error.message });
      } finally { await context.close(); }
      await fs.writeFile('qa/guide-verification-v7.json', JSON.stringify(report, null, 2));
    }
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ cases: report.cases.length, defects: report.defects.length }));
if (report.defects.length) process.exitCode = 1;
