import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const origin = process.env.CV_ORIGIN || 'http://127.0.0.1:5198';
const out = resolve('../cv-landing-mockup/checks/production');
await mkdir(out, { recursive: true });
const results = [], problems = [];
const browser = await chromium.launch({ channel: 'msedge' });
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const p = await context.newPage();
    const errors = [];
    p.on('pageerror', error => errors.push(error.message));
    p.on('response', response => { if (response.status() >= 400 && response.url().startsWith(origin)) errors.push(response.url() + ' ' + response.status()); });
    for (const route of ['/', '/privacy.html', '/accessibility.html', '/thank-you.html']) {
      const response = await p.goto(origin + route, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      const data = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src), missing: document.querySelectorAll('.is-missing').length, placeholders: /\[תאריך\]|\[שם העסק הרשום\]|טיוטה לתבנית/.test(document.body.innerText) }));
      const axe = await new AxeBuilder({ page: p }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const serious = axe.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
      results.push({ width: viewport.width, route, status: response.status(), ...data, violations: serious });
      if (response.status() !== 200 || data.overflow || data.brokenImages.length || data.missing || data.placeholders || serious.length) problems.push(results.at(-1));
      if (route === '/') {
        if (await p.locator('img[src^="work/"]').count()) problems.push('Private client CV image is referenced');
        await p.screenshot({ path: resolve(out, `cv-${viewport.width}.png`), fullPage: true, animations: 'disabled' });
        await p.screenshot({ path: resolve(out, `cv-${viewport.width}-hero.png`), animations: 'disabled' });
        await p.locator('#f-name').fill('בדיקת אתר');
        await p.locator('#f-phone').fill('123');
        await p.locator('#submit-btn').click();
        if (await p.locator('#e-phone').isHidden()) problems.push('Invalid phone was accepted');
        // Intercept the WhatsApp navigation. No test contact or personal data is sent externally.
        let outbound = '';
        await p.route('https://wa.me/**', route => { outbound = decodeURIComponent(route.request().url()); return route.fulfill({ body: '<title>Intercepted test</title>', contentType:'text/html' }); });
        await p.locator('#f-phone').fill('0500000000');
        await p.locator('#submit-btn').click();
        await p.waitForURL('https://wa.me/**');
        if (!outbound.includes('בדיקת אתר') || !outbound.includes('100')) problems.push('WhatsApp form payload mismatch');
      }
    }
    if (errors.length) problems.push({ width: viewport.width, errors });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(resolve(out, origin.startsWith('https:') ? 'live-verification.json' : 'local-verification.json'), JSON.stringify({ origin, results, problems }, null, 2));
console.log(JSON.stringify({ origin, routes: results.length, problems }, null, 2));
if (problems.length) process.exitCode = 1;
