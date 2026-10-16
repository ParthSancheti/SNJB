import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

// Focused functional journeys. This complements, rather than replaces, the
// responsive matrix. Synthetic enquiry data is never sent externally.
const base = process.env.SNJB_QA_URL || 'http://127.0.0.1:4178';
const output = 'qa/elevate/flows';
await fs.mkdir(output, { recursive: true });
const report = { target: base, startedAt: new Date().toISOString(), browser: 'Installed Microsoft Edge / Playwright', cases: [], defects: [], limitations: ['Viewport/touch emulation, not a physical device or Safari certification.', 'Enquiry handoff links are inspected; no WhatsApp/email is sent.', 'Automated accessibility checks do not establish full WCAG conformance.'] };
const browser = await chromium.launch({ channel: process.env.SNJB_QA_CHANNEL || 'msedge', headless: true });
const persist = () => fs.writeFile(`${output}/workflow-report.json`, JSON.stringify(report, null, 2));

async function runCase(config) {
  const context = await browser.newContext({ viewport: { width: config.width, height: config.height }, colorScheme: config.theme, reducedMotion: config.reduced ? 'reduce' : 'no-preference', isMobile: config.width < 700, hasTouch: config.width < 700 });
  await context.addInitScript(theme => localStorage.setItem('snjb-theme', theme), config.theme);
  if (config.noWebGL) await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return /webgl/i.test(type) ? null : original.call(this, type, ...args); };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  const item = { ...config, steps: [], runtimeErrors: [], failedResponses: [], externalWrites: [], serviceRequests: [] };
  report.cases.push(item);
  page.on('pageerror', error => item.runtimeErrors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) item.failedResponses.push({ url: response.url(), status: response.status() }); });
  page.on('request', request => {
    if (/openai|anthropic|gemini|generativelanguage/i.test(request.url())) item.serviceRequests.push({ url: request.url(), method: request.method() });
    if (!request.url().startsWith(base) && !['GET', 'HEAD', 'OPTIONS'].includes(request.method())) item.externalWrites.push({ url: request.url(), method: request.method() });
  });
  const step = async (name, fn) => {
    const result = { name, startedAt: new Date().toISOString() };
    item.steps.push(result);
    try { result.evidence = await fn(); result.status = 'passed'; console.log(`PASS ${config.name}: ${name}`); }
    catch (error) { result.status = 'failed'; result.error = error.message; report.defects.push({ case: config.name, name, error: error.message }); console.error(`FAIL ${config.name}: ${name}: ${error.message}`); await page.screenshot({ path: `${output}/${config.name}-${item.steps.length}-failure.png`, timeout: 6000 }).catch(() => {}); }
    await persist();
  };
  const goto = async path => {
    await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await expect(page.locator('main h1')).toBeVisible({ timeout: 16000 });
    await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
  };
  const scan = async selector => {
    const results = await new AxeBuilder({ page }).include(selector).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const findings = results.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target), summary: v.nodes.map(n => n.failureSummary) }));
    if (findings.length) throw new Error(`Accessibility findings: ${JSON.stringify(findings)}`);
    return { selector, violations: findings.length, incompleteChecks: results.incomplete.length };
  };

  if (config.noWebGL) {
    await step('WebGL unavailable has a readable fallback and preserves academic controls', async () => {
      await goto('/computer-engineering');
      await page.locator('.dept-model-disclosure > summary').click();
      await page.locator('.es-stage').scrollIntoViewIfNeeded();
      await expect(page.locator('.es-status')).toContainText('3D view is unavailable in this browser.', { timeout: 20000 });
      await expect(page.getByLabel('Admission batch', { exact: true })).toBeEnabled();
      await expect(page.locator('#dept-faculty')).toBeAttached();
      await page.screenshot({ path: `${output}/${config.name}-fallback.png` });
      return { status: await page.locator('.es-status').innerText(), academicFinderPreserved: true };
    });
    await step('Reduced motion omits the Home film and keeps navigation usable', async () => {
      await goto('/');
      await expect(page.locator('video.cinematic-video')).toHaveCount(0);
      await page.getByRole('button', { name: 'Search programmes and resources', exact: true }).click();
      await expect(page.getByRole('dialog', { name: 'Search SNJB', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.snjb-search')).toHaveCount(0);
      return { movieElements: 0, searchEscape: true };
    });
  } else {
    await step('Navigation hover/click or phone quick access', async () => {
      await goto('/');
      if (config.width >= 1024) {
        const about = page.getByRole('navigation', { name: 'Desktop primary navigation' }).getByRole('button', { name: 'About', exact: true });
        await about.hover(); await expect(page.locator('.desktop-mega')).toBeVisible();
        await page.mouse.move(config.width - 3, config.height - 3); await expect(page.locator('.desktop-mega')).toHaveCount(0);
        await about.click(); await expect(page.locator('.desktop-mega')).toHaveAttribute('data-pinned', 'true');
        await page.mouse.move(config.width - 3, config.height - 3); await expect(page.locator('.desktop-mega')).toBeVisible();
        await page.getByRole('navigation', { name: 'College navigation categories' }).getByRole('button', { name: 'Academics', exact: true }).hover();
        const departments = page.locator('.desktop-mega-content summary').filter({ hasText: 'Departments' }).first();
        await departments.hover(); await expect(departments.locator('..')).toHaveAttribute('open', '');
        const computer = page.locator('.desktop-mega-content summary').filter({ hasText: 'Computer Engineering' }).first();
        await computer.hover(); await expect(computer.locator('..')).toHaveAttribute('open', '');
        await expect(page.locator('.desktop-mega-content a[href="/computer-engineering#source-people-computer"]')).toBeVisible();
        const axe = await scan('.site-header');
        await page.keyboard.press('Escape'); await expect(page.locator('.desktop-mega')).toHaveCount(0); await expect(about).toBeFocused();
        return { hoverDismiss: true, clickPinned: true, nestedFolder: true, escapeFocus: true, axe };
      }
      const button = page.getByRole('button', { name: 'Open SNJB menu', exact: true });
      await button.click(); const popup = page.getByRole('dialog', { name: 'Quick access', exact: true });
      await expect(popup).toBeVisible(); await expect(popup.getByRole('switch', { name: 'Background motion' })).toBeVisible();
      const isolation = await page.locator('#root').evaluate(node => node.inert); expect(isolation).toBe(true);
      const axe = await scan('.navigation-hub');
      await page.keyboard.press('Escape'); await expect(popup).toHaveCount(0); await expect(button).toBeFocused();
      return { inertBackground: isolation, escapeFocus: true, axe };
    });

    await step('Search source expansion, results, Escape and focus restoration', async () => {
      await goto('/');
      const trigger = page.getByRole('button', { name: 'Search programmes and resources', exact: true });
      await trigger.click(); const search = page.getByRole('dialog', { name: 'Search SNJB', exact: true });
      await expect(search).toBeVisible(); const input = search.getByRole('searchbox'); await expect(input).toBeFocused();
      await input.fill('computer curriculum'); await expect(search.locator('[data-search-result]').first()).toContainText('Computer Engineering curriculum');
      const href = await search.locator('[data-search-result]').first().getAttribute('href'); expect(href).toContain('/computer-engineering#dept-curriculum');
      const axe = await scan('.snjb-search-layer');
      await page.screenshot({ path: `${output}/${config.name}-search.png` });
      await page.keyboard.press('Escape'); await expect(search).toHaveCount(0); await expect(trigger).toBeFocused();
      return { href, focusRestored: true, axe };
    });

    await step('Search-to-guide mode, local source results and modal focus trap', async () => {
      await goto('/');
      await page.getByRole('button', { name: 'Search programmes and resources', exact: true }).click();
      await page.locator('.snjb-search-guide').click();
      const guide = page.getByRole('dialog', { name: 'SNJB guide', exact: true });
      await expect(guide).toBeVisible(); await expect(page.locator('.snjb-search')).toHaveCount(0);
      await expect(guide.getByRole('button', { name: 'Close SNJB guide', exact: true })).toBeFocused();
      const input = guide.getByRole('searchbox', { name: 'What are you looking for?', exact: true });
      await input.fill('computer faculty'); await input.press('Enter');
      await expect(guide.locator('.snjb-guide-results a[href="/computer-engineering#source-people-computer"]')).toBeVisible();
      const resources = await guide.locator('.snjb-guide-results a').evaluateAll(nodes => nodes.map(n => ({ title: n.innerText.trim(), href: n.getAttribute('href') })));
      await guide.getByRole('button', { name: 'Clear guide search', exact: true }).focus();
      await page.keyboard.press('Shift+Tab');
      expect(await guide.evaluate(node => node.contains(document.activeElement))).toBe(true);
      await page.keyboard.press('Tab'); await expect(guide.getByRole('button', { name: 'Clear guide search', exact: true })).toBeFocused();
      const axe = await scan('.snjb-guide');
      await page.screenshot({ path: `${output}/${config.name}-guide.png` });
      await page.keyboard.press('Escape'); await expect(guide).toHaveCount(0);
      expect(await page.locator('#root').evaluate(node => node.inert)).toBe(false);
      expect(item.serviceRequests).toEqual([]);
      return { resources, mode: 'Local source-linked guide; no external AI service', focusTrapped: true, axe };
    });

    await step('Home film resumes after an internal route return', async () => {
      await goto('/');
      const movie = page.locator('video.cinematic-video');
      await expect.poll(() => movie.evaluate(v => !v.paused && v.currentTime > .1), { timeout: 20000 }).toBe(true);
      await page.locator('.cinematic-actions a[href="/apply"]').click(); await expect(page).toHaveURL(`${base}/apply`); await expect(page.locator('.visitor-enquiry-section')).toBeAttached(); await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
      await page.locator('.brand-wordmark').click(); await expect(page).toHaveURL(`${base}/`); await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
      await expect.poll(() => movie.evaluate(v => !v.paused && v.currentTime > .1), { timeout: 20000 }).toBe(true);
      const before = await movie.evaluate(v => v.currentTime); await page.waitForTimeout(650); const after = await movie.evaluate(v => v.currentTime);
      expect(after).toBeGreaterThan(before); return { before, after, responsiveSource: await movie.getAttribute('src') };
    });

    await step('Computer curriculum batch/year selects official documents', async () => {
      await goto('/computer-engineering');
      await page.getByLabel('Admission batch', { exact: true }).selectOption('2025–29');
      await page.getByLabel('Study year', { exact: true }).selectOption('2');
      await expect(page.locator('.dept-syllabus-result')).toContainText('Second Year B.Tech');
      await expect(page.locator('.dept-syllabus-result a')).toHaveAttribute('href', /2026-27_SYBTech_COMP_2025-2029.pdf$/);
      await page.getByLabel('Admission batch', { exact: true }).selectOption('2026–30');
      await expect(page.getByLabel('Study year', { exact: true })).toHaveValue('1');
      await expect(page.locator('.dept-syllabus-result a')).toHaveAttribute('href', /FY_BTech_Syllabus_Comp_2026-30.pdf$/);
      return { batchSwitchResetsUnavailableYear: true, officialLinksPreserved: true };
    });

    await step('All 37 faculty/staff identities, filters and empty state', async () => {
      await goto('/computer-engineering');
      await page.getByRole('button', { name: 'Show all 37 people', exact: true }).click(); await expect(page.locator('.dept-faculty-card')).toHaveCount(37);
      const source = JSON.parse(await fs.readFile('src/data/faculty-directory.json', 'utf8'));
      expect(await page.locator('.dept-faculty-info h3').allTextContents()).toEqual(source.people.map(p => p.name));
      await page.getByRole('combobox', { name: 'Filter faculty and staff' }).selectOption('Staff'); await expect(page.locator('.dept-faculty-card')).toHaveCount(10);
      await page.getByRole('combobox', { name: 'Filter faculty and staff' }).selectOption('Everyone');
      const query = page.getByRole('searchbox', { name: 'Search faculty and staff by name or interest' });
      await query.fill('Sanghavi'); await expect(page.locator('.dept-faculty-card')).toHaveCount(2);
      await page.locator('.dept-faculty-card').first().locator('summary').click(); await expect(page.locator('.dept-faculty-card').first().locator('dl')).toBeVisible();
      // Native details scrolling can leave an otherwise full-size filter partly
      // behind the sticky chapter bar. Inspect controls in their usable viewport
      // position; retain the full target-size rule rather than excluding it.
      await page.locator('.dept-filter-bar').evaluate(node => window.scrollBy({ top: node.getBoundingClientRect().top - 180, behavior: 'instant' }));
      await page.waitForTimeout(150);
      const axe = await scan('#dept-faculty');
      await query.fill('ZZQA999-no-person'); await expect(page.locator('.dept-empty-state')).toBeVisible();
      await page.getByRole('button', { name: 'Reset filters', exact: true }).click(); await expect(page.locator('.dept-faculty-card')).toHaveCount(37);
      return { allIdentitiesMatchJSON: true, staff: 10, nameSearch: 2, emptyReset: true, axe };
    });

    await step('All 16 source sections and resource search retain source content', async () => {
      await goto('/computer-engineering');
      await page.locator('.dept-archival-summary').click(); await expect(page.locator('.dept-source-panel')).toHaveCount(16);
      const source = JSON.parse(await fs.readFile('src/data/department-content.json', 'utf8'));
      expect(await page.locator('.dept-source-panel').evaluateAll(nodes => nodes.map(n => n.id))).toEqual(source.sections.map(s => `source-${s.id}`));
      await page.locator('#source-people-computer > summary').click(); await expect(page.locator('#source-people-computer .imported-dept-body')).toBeVisible();
      await expect(page.locator('#source-people-computer .dept-source-link')).toHaveAttribute('href', /people-computer$/);
      const search = page.getByRole('searchbox', { name: 'Search academic resources' });
      await search.fill('BoS'); expect(await page.locator('.dept-source-panel').count()).toBeGreaterThan(0);
      await search.fill('ZZQA999-no-record'); await expect(page.locator('.dept-empty-resource')).toBeVisible();
      await page.getByRole('button', { name: 'Clear resource search' }).click(); await expect(page.locator('.dept-source-panel')).toHaveCount(16);
      return { archiveSections: 16, sourceIDsMatchJSON: true, officialPeopleSource: true, searchAndReset: true };
    });

    await step('Apply validates enquiry and prepares WhatsApp/email without sending', async () => {
      await goto('/apply');
      const form = page.locator('.visitor-enquiry-form');
      await form.getByRole('button', { name: 'Prepare admission enquiry' }).click();
      await expect(form.locator('[aria-invalid="true"]')).toHaveCount(2);
      await form.getByRole('textbox', { name: /Full name/ }).fill('Astra QA Example');
      await form.getByRole('textbox', { name: /Mobile \/ WhatsApp number/ }).fill('9000000000');
      await form.getByRole('textbox', { name: 'Email address' }).fill('invalid-email');
      await form.getByRole('button', { name: 'Prepare admission enquiry' }).click(); await expect(form.locator('[aria-invalid="true"]')).toHaveCount(1);
      await form.getByRole('textbox', { name: 'Email address' }).fill('qa@example.invalid');
      await form.getByRole('textbox', { name: 'City / District' }).fill('QA City');
      await form.getByRole('button', { name: 'Prepare admission enquiry' }).click();
      const summary = page.locator('.visitor-enquiry-success'); await expect(summary).toContainText('Enquiry summary prepared for Astra QA Example');
      const whatsapp = await summary.getByRole('link', { name: /Send via WhatsApp/ }).getAttribute('href');
      const mail = await summary.getByRole('link', { name: /Send Official Email/ }).getAttribute('href');
      expect(whatsapp).toMatch(/^https:\/\/wa\.me\/919730478001\?text=/); expect(decodeURIComponent(whatsapp)).toContain('Astra QA Example');
      expect(mail).toMatch(/^mailto:principalcoe@snjb.org\?subject=/); expect(decodeURIComponent(mail)).toContain('Admission Enquiry AY 2026-27');
      const axe = await scan('.visitor-enquiry-section');
      await page.screenshot({ path: `${output}/${config.name}-enquiry.png` });
      await summary.getByRole('button', { name: 'Edit enquiry details' }).click(); await expect(form.getByRole('textbox', { name: /Full name/ })).toHaveValue('Astra QA Example');
      expect(item.externalWrites).toEqual([]); return { missingRequiredFields: 2, invalidEmailRejected: true, preparedOnly: true, whatsapp, mail, editPreservesValues: true, axe };
    });

    await step('Institutional directory search, empty state and restoration', async () => {
      await goto('/explore');
      await expect(page.locator('.resource-list-root > li')).toHaveCount(9);
      const input = page.getByRole('searchbox', { name: 'Search all college resources' });
      await input.fill('fees'); await expect(page.locator('#resource-folder-title')).toContainText('fees');
      await expect(page.locator('.resource-list a[href*="fra-fees-structure"]')).toBeVisible();
      const axe = await scan('.resource-directory');
      await input.fill('ZZQA999-no-resource'); await expect(page.locator('.resource-empty')).toContainText('No resources match');
      await page.getByRole('button', { name: 'Clear search', exact: true }).click(); await expect(page.locator('.resource-list-root > li')).toHaveCount(9);
      return { rootCategories: 9, feesReachable: true, emptyAndReset: true, axe };
    });

    if (config.width < 700) await step('Phone dock has one active labelled pill and back/forward routes', async () => {
      await goto('/'); const dock = page.getByRole('navigation', { name: 'Primary pages', exact: true });
      await expect(dock).toBeVisible(); await expect(dock.locator('.bottom-navigation-label')).toHaveCount(1);
      await dock.getByRole('link', { name: 'Campus', exact: true }).click(); await expect(page).toHaveURL(`${base}/student-life`); await expect(page.locator('.navigation-app-sheet')).toHaveCount(0);
      await expect(dock.getByRole('link', { name: 'Campus', exact: true })).toHaveAttribute('aria-current', 'page'); await expect(dock.locator('.bottom-navigation-label')).toHaveCount(1);
      await page.goBack(); await expect(page).toHaveURL(`${base}/`); await expect(dock.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
      await page.goForward(); await expect(page).toHaveURL(`${base}/student-life`); await expect(dock.getByRole('link', { name: 'Campus', exact: true })).toHaveAttribute('aria-current', 'page');
      await page.screenshot({ path: `${output}/${config.name}-dock.png` }); return { oneLabel: true, activePillMatchesRoute: true, historyBackForward: true };
    });
  }
  if (item.runtimeErrors.length || item.failedResponses.length || item.externalWrites.length) report.defects.push({ case: config.name, name: 'Runtime/network integrity', runtimeErrors: item.runtimeErrors, failedResponses: item.failedResponses, externalWrites: item.externalWrites });
  item.status = report.defects.some(d => d.case === config.name) ? 'failed' : 'passed';
  await context.close(); await persist();
}

try {
  for (const config of [{ name: 'desktop-light', width: 1440, height: 900, theme: 'light' }, { name: 'phone-dark', width: 390, height: 844, theme: 'dark' }, { name: 'reduced-no-webgl', width: 390, height: 844, theme: 'light', reduced: true, noWebGL: true }]) await runCase(config);
} finally { report.finishedAt = new Date().toISOString(); await browser.close(); await persist(); }
console.log(JSON.stringify({ cases: report.cases.length, steps: report.cases.reduce((sum, c) => sum + c.steps.length, 0), defects: report.defects.length, report: `${output}/workflow-report.json` }));
if (report.defects.length) process.exitCode = 1;
