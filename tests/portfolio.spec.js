import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const liveSites = [
  ['koral', 'קורל אירועים', 'https://lawebs.co.il/koralevents'],
  ['miryam', 'מרים זליג', 'https://miryamzelig.co.il/'],
  ['pinhas', 'פנחס רצון', 'https://pinhasratzon.co.il/'],
  ['reuven', 'דפוס ראובן', 'https://www.dfusreuven.co.il/'],
  ['sos', 'בדרך אליך', 'https://sosbaderech.co.il/'],
  ['seder', 'סדר', 'https://lawebs.co.il/seder'],
  ['pdf', 'PDF Studio', 'https://vee-app.co.il/pdf-studio/'],
  ['pizza', 'פיצת התנור', 'https://lawebs.co.il/PizzaManager/'],
];
const featuredSlugs = ['koral', 'miryam', 'pinhas', 'reuven'];
const demoSlug = 'pizza'; // the ordering demo has its own chapter (#demo), labelled as a demo
const rowSlugs = liveSites.map(([slug]) => slug).filter(slug => !featuredSlugs.includes(slug) && slug !== demoSlug);

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
      await image.evaluate(img => img.scrollIntoView({ block: 'center' }));
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
  // check the settled page: reveal fades would otherwise be measured mid-transition
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')));
  await page.waitForTimeout(450);
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('אחר כך נדבר');
  await expect(page.locator('.hero .fan-card')).toHaveCount(5);
  await expect(page.locator('#work .stack-item')).toHaveCount(featuredSlugs.length);
  await expect(page.locator('#more .work-row')).toHaveCount(rowSlugs.length);
  for (const slug of [...featuredSlugs, ...rowSlugs]) await expect(page.locator(`main :is(.stack-actions, .work-row) a[href="/work/${slug}/"]`)).toHaveCount(1);
  // the demo appears once, labelled, and never as a client in the hero or the work
  await expect(page.locator('#demo .status-tag')).toContainText('פרויקט הדגמה');
  await expect(page.locator(`.hero [href="#project-${demoSlug}"], #work [href="/work/${demoSlug}/"]`)).toHaveCount(0);
  await expectImages(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test('the header hides on the way down and returns on the way up', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await page.locator('#work').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
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

test('four featured projects stack in their own colours, with live links, and the rest follow as rows', async ({ page }, testInfo) => {
  await page.goto('/');
  await ready(page);
  for (const slug of featuredSlugs) {
    const item = page.locator(`#project-${slug}`);
    await expect(item.locator('.stack-actions a.pill')).toHaveAttribute('href', liveSites.find(([s]) => s === slug)[2]);
    await expect(item.locator('.stack-actions a.pill')).toHaveAttribute('rel', /noopener/);
    await expect(item.locator('.stack-actions a.text-link')).toHaveAttribute('href', `/work/${slug}/`);
    await expect(item.locator('.want-link')).toHaveAttribute('href', /wa\.me/);
    await item.scrollIntoViewIfNeeded(); // touring captures are fetched shortly before they are seen
    await expect(item.locator('.frame.phone img')).toHaveAttribute('src', `/images/${slug}-mobile-full.webp`);
  }
  // featured panels alternate dark and light
  await expect(page.locator('#work .stack-item.row-light')).toHaveCount(2);
  const position = await page.locator('#project-koral').evaluate(el => getComputedStyle(el).position);
  expect(position).toBe(testInfo.project.name === 'desktop' ? 'sticky' : 'static');
  // a featured frame tours its site while it is on screen
  await page.locator('#project-koral .stack-phone').scrollIntoViewIfNeeded();
  await expect(page.locator('#project-koral .stack-phone')).toHaveClass(/is-live/);
  // every row links to its case page and opens the live site in a new tab, without nesting links
  for (const row of await page.locator('#more .work-row').all()) {
    await expect(row.locator('a')).toHaveCount(2);
    await expect(row.locator('a.row-out')).toHaveAttribute('target', '_blank');
  }
  await expectNoOverflow(page);
});

test('need chips filter the work in place and announce the result', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const chip = page.locator('.need-chip[data-need="catalog"]');
  await expect(chip).toHaveAttribute('href', '/services/catalogs/'); // a plain link without JavaScript
  await expect(chip).toHaveAttribute('role', 'button');
  await chip.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#work .stack-item:visible')).toHaveCount(1);
  await expect(page.locator('#project-reuven')).toBeVisible();
  await expect(page.locator('#more .work-row:visible')).toHaveCount(1);
  await expect(page.locator('#work-status')).toContainText('קטלוג מוצרים');
  await expect(chip).toBeFocused(); // focus stays on the pressed chip; the live region announces the result
  await page.locator('.need-chip[data-need="system"]').click();
  await expect(page.locator('.need-system-note a[href="#demo"]')).toBeVisible();
  await page.locator('.need-chip[data-need="all"]').click();
  await expect(page.locator('#work .stack-item:visible')).toHaveCount(featuredSlugs.length);
  await expect(page.locator('#more .work-row:visible')).toHaveCount(rowSlugs.length);
});

test('process, prices and FAQ answer the questions before contact', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#process .step')).toHaveCount(3);
  await expect(page.locator('#process .pscene')).toHaveCount(3);
  await expect(page.locator('#process .scene, #process .inc-stage')).toHaveCount(0); // no invented conversation, no client assets
  // the first step shows the message the hero button actually sends
  const sent = await page.locator('#hero-actions .pill').getAttribute('href');
  expect(decodeURIComponent(sent)).toContain(await page.locator('.msg-out').evaluate(el => el.firstChild.textContent.trim()));
  await expect(page.locator('#price .ticket-price b')).toHaveText('2,500');
  await expect(page.locator('#services .service-row')).toHaveCount(4);
  for (const slug of ['websites', 'landing-pages', 'catalogs', 'web-apps']) await expect(page.locator(`#services a[href="/services/${slug}/"]`)).toHaveCount(1);
  const qa = page.locator('#faq details.qa');
  await expect(qa).toHaveCount(9);
  await qa.first().locator('summary').click();
  await expect(qa.first()).toHaveAttribute('open', '');
  await expect(qa.first().locator('p')).toBeVisible();
  for (const href of ['/#work', '/#demo', '/#price', '/about/', '/#faq']) await expect(page.locator(`.site-nav a[href="${href}"]`)).toHaveCount(1);
});

test('the contact bar waits for the hero button to leave and steps aside at the closing section', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The contact bar is phone only');
  await page.goto('/');
  await ready(page);
  const bar = page.locator('.contact-bar');
  await expect(bar).not.toHaveClass(/is-on/);
  await page.locator('#work .stack-item').nth(1).scrollIntoViewIfNeeded();
  await expect(bar).toHaveClass(/is-on/);
  await expect(bar.locator('a')).toHaveCount(2);
  await page.locator('#contact-title').scrollIntoViewIfNeeded();
  await expect(bar).not.toHaveClass(/is-on/);
});

test('the closing composer writes the WhatsApp message and fills in the visitor\'s card', async ({ page, context }) => {
  await page.goto('/');
  await ready(page);
  const form = page.locator('#contact form.composer');
  await form.scrollIntoViewIfNeeded();
  await form.locator('.chip', { hasText: 'קטלוג מוצרים' }).click();
  await form.locator('.chip', { hasText: 'כן' }).click();
  await form.locator('input[name="biz"]').fill('דפוס הגליל');
  await expect(form.locator('.composer-text')).toHaveText('היי LA webs, כאן דפוס הגליל. אשמח לשמוע על קטלוג מוצרים לעסק שלי. יש לי אתר היום.');
  await expect(page.locator('.closing-next .next-name')).toHaveText('דפוס הגליל');
  await expect(page.locator('.closing-next .next-wire')).toHaveAttribute('data-kind', 'catalog');
  const [popup] = await Promise.all([context.waitForEvent('page'), form.locator('.composer-send').click()]);
  expect(decodeURIComponent(popup.url()).replaceAll('+', ' ')).toContain('אשמח לשמוע על קטלוג מוצרים לעסק שלי');
  await popup.close();
});

test('placeholder facts are marked so they cannot be published by accident', async ({ page }) => {
  await page.goto('/');
  // every invented value from src/facts.mjs carries data-placeholder; check.mjs and deploy.ps1 refuse to publish them
  const marked = await page.locator('[data-placeholder]').count();
  const facts = await import('../src/facts.mjs');
  const drafts = JSON.stringify(facts.facts).includes('"draft":true');
  expect(marked > 0).toBe(drafts);
  // no reviews, ratings or counters on the page
  await expect(page.locator('[itemprop="ratingValue"], .rating, .counter')).toHaveCount(0);
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

test('the hero is one poster: the headline, one action on the first screen, and the real work beside it', async ({ page }, testInfo) => {
  await page.goto('/');
  await ready(page);
  await expect(page.locator('#hero-title')).toHaveText('קודם תראו,אחר כך נדבר.');
  const cta = await page.locator('#hero-actions .pill').boundingBox();
  expect(cta.y + cta.height).toBeLessThanOrEqual(page.viewportSize().height);
  await expect(page.locator('#hero-actions .pill')).toHaveAttribute('data-cta', 'hero');
  // the slogan closes the page instead
  await expect(page.locator('#contact-title')).toContainText('האתר שמתאים לו');
  await page.goto('/?hero=b');
  await expect(page.locator('html')).toHaveAttribute('data-hero', 'b');
  await expectNoOverflow(page);
});

test('on phones the hero is a hand of cards and case pages show a touring phone capture', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone layout only');
  // the phone hero is a hand of cards: eight projects plus the studio card, Miryam in front; tapping a card behind brings it forward
  await page.goto('/');
  await ready(page);
  await expect(page.locator('.hand-card')).toHaveCount(9);
  await expect(page.locator('.hand-card').first()).toHaveAttribute('data-name', 'מרים זליג');
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

test('phone hand: a cancelled touch never turns a later button tap into a card tap', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone hand only');
  await page.goto('/');
  await ready(page);
  const hand = page.locator('.hand');
  const box = await hand.locator('.hand-card').first().boundingBox();
  const at = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2, pointerId: 7, pointerType: 'touch', button: 0, bubbles: true };
  await hand.dispatchEvent('pointerdown', at); // a finger lands on the front card, then the page scrolls (cancel)
  await hand.dispatchEvent('pointercancel', at);
  await hand.locator('.cycle-toggle').click(); // the touch paused the hand, so this resumes it, and it must not open a card
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(hand.locator('.cycle-toggle')).toHaveAttribute('aria-pressed', 'false');
  const caption = hand.locator('.cycle-text strong');
  await hand.locator('.cycle-step[data-step="1"]').click();
  const first = await caption.textContent();
  await hand.locator('.cycle-step[data-step="1"]').click();
  await expect(caption).not.toHaveText(first);
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
});

test('every touring capture can be paused', async ({ page }) => {
  await page.goto('/');
  await ready(page);
  const toggle = page.locator('#project-koral .tour-toggle');
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#project-koral .stack-panel')).toHaveClass(/is-tour-paused/);
  await expect(page.locator('#demo .tour-toggle')).toHaveCount(1);
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

test('the Miryam comparison stays off until a real matched pair replaces the current images', async ({ page }) => {
  // public/images/miryam-before|after.webp show two different people (see beforeAfterPairChecked in src/projects.mjs)
  await page.goto('/work/miryam/');
  await expect(page.locator('.ba')).toHaveCount(0);
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
    await expect(page.locator('#work .stack-item')).toHaveCount(featuredSlugs.length);
    await expect(page.locator('.need-chip[data-need="site"]')).toHaveAttribute('href', '/services/websites/');
    await expect(page.locator('#process .step h3')).toHaveCount(3);
    await expect(page.locator('#process .step').first()).toHaveCSS('opacity', '1');
    await expect(page.locator('#faq details.qa')).toHaveCount(9);
    await expect(page.locator('#contact form.composer button[type="submit"]')).toBeVisible();
    await expectNoOverflow(page);
    await page.locator('#project-koral .stack-actions a.text-link').click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('קורל אירועים');
  } finally {
    await context.close();
  }
});

test('capture public portfolio QA screenshots', async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== '1', 'Set CAPTURE_QA=1 for a single intentional capture batch');
  await mkdir(path.resolve('docs/qa'), { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [route, name] of [['/', 'home'], ['/work/koral/', 'case-koral'], ['/work/miryam/', 'case-miryam']]) {
    await page.goto(route);
    await ready(page);
    await expectImages(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: path.resolve(`docs/qa/${name}-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
    if (name === 'home') await page.screenshot({ path: path.resolve(`docs/qa/home-${testInfo.project.name}-viewport.png`), fullPage: false, animations: 'disabled' });
  }
});

test('the hero hand turns by itself, names the front project, can be paused and stepped', async ({ page }, testInfo) => {
  const scope = testInfo.project.name === 'desktop' ? '.fan-stage' : '.hand';
  await page.goto('/');
  const caption = page.locator(`${scope} .cycle-text strong`);
  await expect(caption).toHaveText('מרים זליג');
  await expect(caption).not.toHaveText('מרים זליג', { timeout: 12_000 });
  const toggle = page.locator(`${scope} .cycle-toggle`);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const held = await caption.textContent();
  await page.waitForTimeout(5000);
  await expect(caption).toHaveText(held);
  // next and previous move one card and leave the hand paused
  await page.locator(`${scope} .cycle-step[data-step="1"]`).click();
  await expect(caption).not.toHaveText(held);
  await page.locator(`${scope} .cycle-step[data-step="-1"]`).click();
  await expect(caption).toHaveText(held);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  // hero cards lead to their panel on this page when the project is featured
  await expect(page.locator(testInfo.project.name === 'desktop' ? '.fan-link[href="#project-miryam"]' : '.hand-link[href="#project-miryam"]')).toHaveCount(1);
});

test('the ordering demo is labelled as a demo on the homepage, its case page and the landing pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#demo')).toContainText('שום הזמנה לא נשלחת');
  await expect(page.locator('#demo a[href="https://lawebs.co.il/PizzaManager/"]').first()).toHaveAttribute('target', '_blank');
  await page.goto('/work/pizza/');
  await expect(page.locator('.case-demo-note')).toContainText('פרויקט הדגמה');
  await expect(page.locator('.case-tags .status-tag')).toHaveText('פרויקט הדגמה');
  await page.goto('/lp/');
  await expect(page.locator('.lp-card', { hasText: 'פיצת התנור' })).toContainText('פרויקט הדגמה');
});

test('ads landing page matches the ad group and writes the WhatsApp message from the form', async ({ page, context }) => {
  const errors = observeErrors(page);
  await page.goto('/lp/?t=hazmanot');
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'index,follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://lawebs.co.il/lp/');
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('אתר שנבנה לעסק שלך' + 'ומביא אליו פניות.');
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

test('short landing page shows each project once and ends in the form on phones', async ({ page }, testInfo) => {
  const errors = observeErrors(page);
  const response = await page.goto('/lp/short/');
  expect(response.status()).toBe(200);
  await ready(page);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'index,follow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://lawebs.co.il/lp/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('אתר שנבנה לעסק שלך');
  await expect(page.locator('.scene, .pscene')).toHaveCount(0);
  await expect(page.locator('.inc-stage')).toHaveCount(0);
  await expect(page.locator('#faq details.qa')).toHaveCount(5);
  await expect(page.locator('.lp-cards .lp-card')).toHaveCount(4);
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.deck-card').first()).toBeVisible(); // the deck is the work on phones
    await expect(page.locator('.lp-work')).toBeHidden();
    await expect(page.locator('.deck-names a[target="_blank"]')).toHaveCount(4);
    await expect(page.locator('#contact')).toBeHidden();
    const faqTop = await page.locator('#faq').evaluate(el => el.getBoundingClientRect().top + scrollY);
    const formTop = await page.locator('.lp-lead-m').evaluate(el => el.getBoundingClientRect().top + scrollY);
    expect(formTop).toBeGreaterThan(faqTop);
  } else {
    await expect(page.locator('.lead-deck .lead')).toBeVisible();
  }
  await expectImages(page);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
  await expectAccessible(page);
});
