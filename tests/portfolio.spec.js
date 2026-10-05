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
  ['sos', 'בדרך אליך', 'https://sosbaderech.co.il/'],
  ['seder', 'סדר', 'https://lawebs.co.il/seder'],
  ['pdf', 'PDF Studio', 'https://vee-app.co.il/pdf-studio/'],
  ['pizza', 'פיצת התנור', 'https://lawebs.co.il/PizzaManager/'],
];
const featuredSlugs = ['pizza', 'koral', 'pinhas', 'miryam'];

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

async function settleScroll(page) {
  await page.evaluate(() => new Promise(resolve => {
    let last = scrollY, since = performance.now();
    const tick = now => {
      if (scrollY !== last) { last = scrollY; since = now; }
      if (now - since >= 150) resolve(); else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));
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

test('homepage presents Hebrew RTL content, the hero and every project without resource errors', async ({ page }) => {
  const errors = observeErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' }); // the phone hero demo never holds still otherwise
  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await ready(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('האתר שמתאים לו');
  await expect(page.locator('.hero .fan-card')).toHaveCount(5);
  await expect(page.locator('.hero-index')).toHaveCount(0);
  await expect(page.locator('#work .stack-item:not(.stack-next)')).toHaveCount(featuredSlugs.length);
  await expect(page.locator('#more .strip-item')).toHaveCount(liveSites.length - featuredSlugs.length);
  for (const [slug] of liveSites) await expect(page.locator(`main :is(.stack-actions, .strip-item) a[href="/work/${slug}/"]`)).toHaveCount(1);
  await expectImages(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('the hero call to action scrolls to the work grid and the header hides on the way down', async ({ page }, testInfo) => {
  await page.goto('/');
  await ready(page);
  const link = page.locator('.hero-actions .hero-work-link');
  await expect(link).toHaveAttribute('href', '#work');
  await link.click();
  await expect(page).toHaveURL(/#work$/);
  await expect.poll(() => page.locator('#work').evaluate(el => el.getBoundingClientRect().top < window.innerHeight)).toBe(true);
  await settleScroll(page);
  await page.mouse.wheel(0, 600);
  await settleScroll(page);
  await expect(page.locator('.site-header')).toHaveClass(/is-hidden/);
  await page.mouse.wheel(0, -200);
  await settleScroll(page);
  await expect(page.locator('.site-header')).not.toHaveClass(/is-hidden/);
  await expectNoOverflow(page);
});

test('header stays hidden during slow downward scrolling and ignores tiny reversals', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const move = async y => {
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  await move(400);
  const header = page.locator('.site-header');
  await expect(header).toHaveClass(/is-hidden/);
  for (const y of [403, 406, 409, 412, 415, 413, 415]) {
    await move(y);
    await expect(header).toHaveClass(/is-hidden/);
  }
  for (const y of [412, 409, 406, 403]) await move(y);
  await expect(header).not.toHaveClass(/is-hidden/);
});

test('phone cards enter once and remain visible after scrolling away and back', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone fan only');
  await page.goto('/');
  await ready(page);
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollSnapType)).toBe('none');
  const hand = page.locator('.hand');
  await hand.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(hand).toHaveClass(/is-dealing/);
  await page.evaluate(() => window.__dealStarts = 0);
  await hand.evaluate(el => el.addEventListener('animationstart', event => { if (event.target.classList.contains('hand-card')) window.__dealStarts++; })); // the caption's progress line runs on its own
  // Wait for the initial staggered entrance before counting replays.
  await page.waitForTimeout(1100);
  await page.evaluate(() => window.__dealStarts = 0);
  await page.locator('#contact').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(150);
  await expect(hand).not.toHaveClass(/is-waiting/);
  await hand.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__dealStarts)).toBe(0);
  await expect(hand.locator('.hand-card').first()).toHaveCSS('opacity', '1');
  await expectNoOverflow(page);
});

test('four featured projects stack in their own colours, with live links, and the rest follow in the strip', async ({ page }, testInfo) => {
  await page.goto('/');
  await ready(page);
  for (const slug of featuredSlugs) {
    const item = page.locator(`#project-${slug}`);
    await expect(item.locator('.stack-actions a.pill')).toHaveAttribute('href', `/work/${slug}/`);
    await expect(item.locator('.stack-actions a[target="_blank"]')).toHaveAttribute('href', liveSites.find(([s]) => s === slug)[2]);
    await expect(item.locator('.frame.phone img')).toHaveAttribute('src', `/images/${slug}-mobile-full.webp`);
  }
  const position = await page.locator('#project-koral').evaluate(el => getComputedStyle(el).position);
  expect(position).toBe(testInfo.project.name === 'desktop' ? 'sticky' : 'static');
  // a featured frame tours its site while it is on screen
  await page.locator('#project-pizza .stack-phone').scrollIntoViewIfNeeded();
  await expect(page.locator('#project-pizza .stack-phone')).toHaveClass(/is-live/);
  await expectNoOverflow(page);
});

test('process and FAQ answer the questions before contact', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#process .step')).toHaveCount(3);
  // each step acts itself out while on screen, and rests once it leaves
  const scene = page.locator('#process .scene').first();
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveClass(/is-playing/);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(scene).not.toHaveClass(/is-playing/);
  const qa = page.locator('#faq details.qa');
  await expect(qa).toHaveCount(5);
  await qa.first().locator('summary').click();
  await expect(qa.first()).toHaveAttribute('open', '');
  await expect(qa.first().locator('p')).toBeVisible();
  for (const id of ['work', 'process', 'faq', 'contact']) await expect(page.locator(`.site-nav a[href="/#${id}"]`)).toHaveCount(1);
});

test('floating WhatsApp waits for the work section and hides over the contact block', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The floating control is phone only');
  await page.goto('/');
  await ready(page);
  const floating = page.locator('.wa-float');
  await expect(floating).toHaveClass(/is-hidden/);
  await page.locator('#work .stack-item').nth(1).scrollIntoViewIfNeeded();
  await expect(floating).not.toHaveClass(/is-hidden/);
  await page.locator('#contact-title').scrollIntoViewIfNeeded();
  await expect(floating).toHaveClass(/is-hidden/);
});

test('hero shows the approved brand slogan without rotating copy', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#hero-title')).toHaveText('העסק שלך.האתר שמתאים לו.');
  await expect(page.locator('.swap')).toHaveCount(0);
  await expectNoOverflow(page);
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

test('on phones the hero is a hand of cards and case pages show a touring phone capture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone layout only');
  // the phone hero is a hand of cards: seven projects plus the studio card, the front one changes when a card behind it is tapped
  await page.goto('/');
  await ready(page);
  await expect(page.locator('.hand-card')).toHaveCount(8);
  // the hand shares the first screen with the headline
  expect((await page.locator('.hand-card').first().boundingBox()).y).toBeLessThan(page.viewportSize().height * 0.7);
  await expect(page.locator('.desktop-fan')).toBeHidden();
  const front = await page.locator('.hand-card').first().evaluate(el => el.style.getPropertyValue('--pos'));
  expect(front).toBe('0');
  await page.locator('.hand-card').nth(2).dispatchEvent('click', { detail: 1 }); // the front card covers the centres of the fanned ones; detail 1 marks it as a pointer click, not keyboard
  await expect.poll(() => page.locator('.hand-card').nth(2).evaluate(el => el.style.getPropertyValue('--pos'))).toBe('0');
  await page.goto('/work/koral/');
  await ready(page);
  await expect(page.locator('.case-views')).toBeHidden();
  await expect(page.locator('.case-stage')).toBeVisible();
  const box = await page.locator('.case-stage .frame.phone .shot').boundingBox();
  expect(box.height).toBeGreaterThan(page.viewportSize().height * 0.45);
  await page.locator('.case-stage .frame.phone').scrollIntoViewIfNeeded();
  await expect(page.locator('.case-stage .frame.phone')).toHaveClass(/is-live/); // the phone capture tours the site by itself, nothing scrolls inside the page
  await expect(page.locator('#more .strip-item')).toHaveCount(liveSites.length - 1);
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
    await expect(page.locator('#more .strip-item')).toHaveCount(liveSites.length - 1);
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

test('reduced motion keeps the fan screenshots still while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await ready(page);
  const image = page.locator('.hero .fan-link img').first();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  expect(await image.evaluate(img => getComputedStyle(img).transform)).toBe('none');
});

test('without JavaScript the work, navigation, process and FAQ remain usable', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, baseURL: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator(testInfo.project.name === 'mobile' ? '.hand-card' : '.desktop-fan .fan-card').first()).toBeVisible();
    await page.waitForTimeout(1500); // let the hand finish dealing in (CSS animation, runs without JS)
    await expect(page.locator('#work .stack-item:not(.stack-next)')).toHaveCount(featuredSlugs.length);
    await expect(page.locator('#process .step h3')).toHaveCount(3);
    await expect(page.locator('#process .step').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('#faq details.qa')).toHaveCount(5);
    await expectNoOverflow(page);
    await page.locator('#project-koral .stack-actions a.pill').click();
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

test('the hero hand turns by itself, names the front project and can be paused', async ({ page }, testInfo) => {
  const scope = testInfo.project.name === 'desktop' ? '.fan-stage' : '.hand';
  await page.goto('/');
  const caption = page.locator(`${scope} .cycle-text strong`);
  await expect(caption).toHaveText('פיצת התנור');
  await expect(caption).not.toHaveText('פיצת התנור', { timeout: 12_000 });
  const toggle = page.locator(`${scope} .cycle-toggle`);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const held = await caption.textContent();
  await page.waitForTimeout(5000);
  await expect(caption).toHaveText(held);
  // hero cards lead to their panel on this page when the project is featured
  await expect(page.locator(testInfo.project.name === 'desktop' ? '.fan-link[href="#project-pizza"]' : '.hand-link[href="#project-pizza"]')).toHaveCount(1);
});

test('ads landing page matches the ad group and writes the WhatsApp message from the form', async ({ page, context }) => {
  const errors = observeErrors(page);
  await page.goto('/lp/?t=hazmanot');
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('מערכת הזמנות אונליין' + 'לעסק שלך.');
  await expect(page.locator('form.lead:visible input[name="w"]:checked')).toHaveValue('מערכת הזמנות');
  await expect(page.locator('.site-nav')).toHaveCount(0); // no navigation leaks on the ad page
  // the form is a conversation: one question at a time, each answer sent with Enter, the need as a quick reply
  const form = page.locator('form.lead:visible');
  await form.scrollIntoViewIfNeeded();
  await expect(form.locator('input[name="b"]')).toBeHidden();
  await form.locator('input[name="n"]').press('Enter'); // an empty answer does not move on
  await expect(form.locator('input[name="b"]')).toBeHidden();
  await form.locator('input[name="n"]').fill('דנה');
  await form.locator('input[name="n"]').press('Enter');
  await expect(form.locator('[data-echo]')).toHaveText(', דנה');
  await form.locator('input[name="b"]').fill('פיצרייה ברמת גן');
  await form.locator('input[name="b"]').press('Enter');
  await form.locator('.chip', { hasText: 'מערכת הזמנות' }).click();
  await expect(form.locator('.lead-bubble')).toContainText('אני דנה (פיצרייה ברמת גן)');
  const [popup] = await Promise.all([context.waitForEvent('page'), page.locator('form.lead:visible .lead-submit').click()]);
  expect(decodeURIComponent(popup.url()).replaceAll('+', ' ')).toContain('אשמח לשמוע על מערכת הזמנות לעסק שלי'); // WhatsApp's redirect encodes spaces as +
  await popup.close();
  await page.goto('/lp/?t=<script>');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('אתר שנבנה לעסק שלך,' + 'ומביא אליו פניות.');
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('landing page has no serious or critical WCAG violations', async ({ page }) => {
  await page.goto('/lp/');
  await page.locator('.lead-deck').scrollIntoViewIfNeeded();
  await expect(page.locator('.lead-deck')).toHaveClass(/is-dealt/);
  await page.waitForTimeout(1200); // let the deal land
  await expectAccessible(page);
});

test('on phones the landing page shows proof before the form', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone order only');
  await page.goto('/lp/');
  await expect(page.locator('.lead-deck .lead')).toBeHidden();
  await expect(page.locator('.lp-deck-cta')).toBeVisible();
  const form = page.locator('#lead-m');
  await expect(form).toBeAttached();
  // the phone form comes after the work and the process
  const order = await page.evaluate(() => ['.lp-work', '#process', '#lead-m'].map(s => document.querySelector(s).getBoundingClientRect().top + scrollY));
  expect(order[0]).toBeLessThan(order[2]);
  expect(order[1]).toBeLessThan(order[2]);
  await page.locator('.lp-deck-cta').click();
  await expect(form).toBeInViewport();
});
