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
    if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return errors;
}

async function ready(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Let entrance animations finish (scroll-driven ones never "finish", so they are skipped and a 2.5s cap applies).
  await page.evaluate(() => Promise.race([
    Promise.allSettled(document.getAnimations().filter(a => !(typeof ScrollTimeline !== 'undefined' && a.timeline instanceof ScrollTimeline)).map(a => a.finished)),
    new Promise(resolve => setTimeout(resolve, 2500)),
  ]));
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

test('homepage presents Hebrew RTL content, the hero and five project rows without resource errors', async ({ page }) => {
  const errors = observeErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // the phone hero demo never holds still otherwise
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await ready(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('נבנה לעסק שלך');
  await expect(page.locator('.hero .hero-shot')).toHaveCount(1);
  await expect(page.locator('.hero-index a')).toHaveCount(5);
  await expect(page.locator('.work-card')).toHaveCount(8);
  await expect(page.locator('.stage-track')).toHaveCount(3);
  await expect(page.locator('#catalog .strip-item')).toHaveCount(5);
  for (const [slug] of liveSites) await expect(page.locator(`.work-card a.work-link[href="/work/${slug}/"]`).first()).toBeVisible();
  await expectImages(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('hero index links jump to the matching project row', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const link = page.locator('.hero-index a').nth(1);
  await expect(link).toHaveAttribute('href', '#project-miryam');
  await link.click();
  await expect(page).toHaveURL(/#project-miryam$/);
  await expect.poll(() => page.locator('#project-miryam').evaluate(el => el.getBoundingClientRect().top < window.innerHeight)).toBe(true);
  await expectNoOverflow(page);
});

test('pinned project stage stays fixed while its capture scrolls with the page', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const track = page.locator('#project-koral');
  await track.evaluate(el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.5, behavior: 'instant' }));
  await page.waitForTimeout(500);
  const progress = await track.evaluate(el => parseFloat(getComputedStyle(el).getPropertyValue('--p')));
  expect(progress).toBeGreaterThan(0.2);
  expect(progress).toBeLessThan(0.8);
  expect(await track.locator('.stage').evaluate(el => Math.abs(Math.round(el.getBoundingClientRect().top)))).toBeLessThanOrEqual(1);
  expect(await track.locator('.frame.phone .shot img').evaluate(img => getComputedStyle(img).transform)).not.toBe('none');
  await expectNoOverflow(page);
});

test('hero word rotates and keeps the heading label in sync', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const first = await page.locator('.swap-word.is-active').textContent();
  await expect.poll(() => page.locator('.swap-word.is-active').textContent(), { timeout: 5000 }).not.toBe(first);
  const active = await page.locator('.swap-word.is-active').textContent();
  await expect(page.locator('#hero-title')).toHaveAttribute('aria-label', `נבנה לעסק שלך אתר תדמית ${active}.`);
});

test('case page desktop and phone windows scroll inside themselves', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Windows are desktop only');
  await page.goto('/work/koral/');
  await ready(page);
  for (const shot of await page.locator('.case-views .frame.window .shot').all()) {
    await shot.scrollIntoViewIfNeeded();
    expect(await shot.evaluate(el => el.scrollHeight > el.clientHeight + 200)).toBe(true);
    await expect(shot).toHaveAttribute('tabindex', '0');
  }
});

test('on phones the pinned stage window fills the screen below the copy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone layout only');
  await page.goto('/');
  await ready(page);
  const track = page.locator('#project-koral');
  await track.evaluate(el => scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.4, behavior: 'instant' }));
  await page.waitForTimeout(400);
  const box = await track.locator('.frame.phone .shot').first().boundingBox();
  const viewport = page.viewportSize().height;
  expect(box.height).toBeGreaterThan(viewport * 0.38);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport + 1);
  // the phone hero is a hand of cards: six cards, the front one changes when a card behind it is tapped
  await page.goto('/');
  await ready(page);
  await expect(page.locator('.hand-card')).toHaveCount(6);
  await expect(page.locator('.hero-shot')).toBeHidden();
  const front = await page.locator('.hand-card').first().evaluate(el => el.style.getPropertyValue('--pos'));
  expect(front).toBe('0');
  await page.locator('.hand-card').nth(2).dispatchEvent('click'); // the front card covers the centres of the fanned ones
  await expect.poll(() => page.locator('.hand-card').nth(2).evaluate(el => el.style.getPropertyValue('--pos'))).toBe('0');
  await page.goto('/work/koral/');
  await ready(page);
  await expect(page.locator('.case-views')).toBeHidden();
  await expect(page.locator('.case-stage')).toBeVisible();
  await expect(page.locator('#more .strip-item')).toHaveCount(4);
});

test('studio section lists three steps and deliverables', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.steps li')).toHaveCount(3);
  await expect(page.locator('.deliverables li')).toHaveCount(6);
});

test('mobile navigation supports keyboard, Escape and closing after a link', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation only');
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const navigation = page.locator('#site-nav');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
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
  test(`direct project route /work/${slug}/ has live link, palette and intact imagery`, async ({ page }) => {
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
    await expect(page.locator('.case-views .frame.window')).toHaveCount(2);
    await expect(page.locator('#more .strip-item')).toHaveCount(4);
    await expectImages(page);
    await expectNoOverflow(page);
    expect(errors).toEqual([]);
  });
}

test('before/after slider on Miryam responds to the range input', async ({ page }) => {
  await page.goto('/work/miryam/');
  await ready(page);
  const compare = page.locator('.ba');
  await compare.scrollIntoViewIfNeeded();
  await compare.locator('input[type="range"]').fill('20');
  await expect.poll(() => compare.evaluate(el => el.style.getPropertyValue('--cut'))).toBe('20%');
});

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

test('reduced motion keeps the hero capture still while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  const image = page.locator('.hero .hero-frame .shot img');
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  expect(await image.evaluate(img => getComputedStyle(img).transform)).toBe('none');
});

test('without JavaScript the work, navigation and studio content remain usable', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, baseURL: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(testInfo.project.name === 'mobile' ? '.hand-card' : '.hero .hero-shot').first()).toBeVisible();
    await expect(page.locator('.work-card')).toHaveCount(8);
    await expect(page.locator('.steps li')).toHaveCount(3);
    await expectNoOverflow(page);
    await page.locator('.work-card a[href="/work/koral/"]').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('קורל אירועים');
  } finally {
    await context.close();
  }
});

test('capture public portfolio QA screenshots', async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== '1', 'Set CAPTURE_QA=1 for a single intentional capture batch');
  await mkdir(path.resolve('docs/qa'), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, name] of [['/', 'home'], ['/work/koral/', 'case-koral'], ['/work/miryam/', 'case-miryam'], ['/work/libi/', 'case-libi']]) {
    await page.goto(route);
    await ready(page);
    await expectImages(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.resolve(`docs/qa/${name}-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
    if (name === 'home') await page.screenshot({ path: path.resolve(`docs/qa/home-${testInfo.project.name}-viewport.png`), fullPage: false, animations: 'disabled' });
  }
});
