import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const liveSites = [
  ['koral', 'קורל אירועים', 'https://lawebs.co.il/koralevents'],
  ['libi', 'ליבי יהלומים', 'https://www.libidiamonds.co.il/'],
  ['miryam', 'מרים זליג', 'https://miryamzelig.co.il/'],
  ['pinhas', 'פנחס רצון', 'https://pinhasratzon.co.il/'],
  ['reuven', 'דפוס ראובן', 'https://www.dfusreuven.co.il/'],
];

function observeErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`JavaScript: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`Console: ${message.text()}`); });
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  return errors;
}

async function ready(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

async function expectImages(page) {
  const images = page.locator('img');
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    if (await image.isVisible()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0), {
        message: `Image should load: ${await image.getAttribute('src')}`,
      }).toBe(true);
    }
  }
}

async function expectNoOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(dimensions.document, `Document overflow at ${dimensions.viewport}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
  expect(dimensions.body, `Body overflow at ${dimensions.viewport}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
}

async function expectAccessible(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
  expect(serious.map(item => ({
    id: item.id, impact: item.impact, help: item.help,
    nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })),
  }))).toEqual([]);
}

test('homepage presents Hebrew RTL content and five projects without resource errors', async ({ page }) => {
  const errors = observeErrors(page);
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await ready(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('אתר עם אופי');
  await expect(page.locator('.work-card:visible')).toHaveCount(5);
  for (const [slug] of liveSites) await expect(page.locator(`.work-card a[href="/work/${slug}/"], a.work-card[href="/work/${slug}/"]`).first()).toBeVisible();
  await expectImages(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('work filters show matching projects and reset completely', async ({ page }) => {
  await page.goto('/');
  for (const [filter, count] of [['brand', 2], ['commerce', 2], ['systems', 1], ['all', 5]]) {
    const button = page.locator(`[data-filter="${filter}"]`);
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.filter[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.locator('.work-card:visible')).toHaveCount(count);
    await expect(page.locator('#filter-status')).toContainText(String(count));
    await expectNoOverflow(page);
  }
});

test('native service disclosures open and close with keyboard', async ({ page }) => {
  await page.goto('/');
  const details = page.locator('.services details');
  await expect(details).toHaveCount(3);
  const second = details.nth(1);
  await expect(second).not.toHaveAttribute('open', '');
  await second.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('open', '');
  await expect(second.locator('p')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(second).not.toHaveAttribute('open', '');
});

test('mobile navigation supports keyboard, Escape and closing after a link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation only');
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const navigation = page.locator('#site-navigation');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect.poll(() => navigation.evaluate(nav => nav.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  const firstLink = navigation.locator('a').first();
  const href = await firstLink.getAttribute('href');
  await firstLink.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  if (href.includes('#')) await expect(page).toHaveURL(new RegExp(`${href.split('#')[1]}$`));
});

for (const [slug, name, url] of liveSites) {
  test(`direct project route /work/${slug}/ has live link and intact imagery`, async ({ page }) => {
    const errors = observeErrors(page);
    const response = await page.goto(`/work/${slug}/`);
    expect(response.status()).toBe(200);
    await ready(page);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
    const liveLink = page.locator(`main a[href="${url}"]`).first();
    await expect(liveLink).toBeVisible();
    if (await liveLink.getAttribute('target') === '_blank') await expect(liveLink).toHaveAttribute('rel', /noopener/);
    await expectImages(page);
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
  });
}

test('homepage and project remain within narrow, tablet and laptop widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Dimension sweep runs once');
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/work/koral/']) {
      await page.goto(route);
      await ready(page);
      await expectNoOverflow(page);
    }
  }
});

test('home has no serious or critical WCAG violations', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expectAccessible(page);
});

test('case study has no serious or critical WCAG violations', async ({ page }) => {
  await page.goto('/work/koral/');
  await ready(page);
  await expectAccessible(page);
});

test('reduced motion keeps gallery steady during pointer movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  const gallery = page.locator('.hero-gallery');
  const track = page.locator('.gallery-track');
  await gallery.scrollIntoViewIfNeeded();
  const before = await track.evaluate(element => getComputedStyle(element).transform);
  const bounds = await gallery.boundingBox();
  await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .5);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await track.evaluate(element => getComputedStyle(element).transform)).toBe(before);
  expect(await gallery.evaluate(element => element.style.getPropertyValue('--pointer-x'))).toMatch(/^(|0px)$/);
});

test('without JavaScript the work, navigation and service content remain usable', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.work-card:visible')).toHaveCount(5);
    await expect(page.locator('.filters')).toBeHidden();
    await expect(page.locator('#site-navigation a').first()).toBeVisible();
    const summary = page.locator('.services details').nth(1).locator('summary');
    await summary.click();
    await expect(page.locator('.services details').nth(1).locator('p')).toBeVisible();
    await expectNoOverflow(page);
    await page.locator('a[href="/work/koral/"]').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('קורל אירועים');
  } finally {
    await context.close();
  }
});

test('capture public portfolio QA screenshots', async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== '1', 'Set CAPTURE_QA=1 for a single intentional capture batch');
  await mkdir(path.resolve('docs/qa'), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, name] of [['/', 'home'], ['/work/koral/', 'case-koral'], ['/work/libi/', 'case-libi']]) {
    await page.goto(route);
    await ready(page);
    await expectImages(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.resolve(`docs/qa/${name}-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
    if (name === 'home') await page.screenshot({ path: path.resolve(`docs/qa/home-${testInfo.project.name}-viewport.png`), fullPage: false, animations: 'disabled' });
  }
});
