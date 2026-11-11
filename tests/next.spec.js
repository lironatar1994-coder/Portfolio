import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const INTRO = 0.5;
const EACH = 0.85;

// The client sites live on other hosts. The tests answer for them, so the suite never depends on the network.
async function answerForSites(page, { down = [] } = {}) {
  await page.route(url => !['127.0.0.1', 'localhost'].includes(url.hostname), route => {
    const host = new URL(route.request().url()).hostname;
    if (down.some(name => host.includes(name))) return route.abort();
    return route.fulfill({ status: 200, contentType: 'image/png', body: pixel });
  });
}
const scrollScreens = (page, screens) => page.evaluate(n => scrollTo(0, n * document.querySelector('.stage').offsetHeight), screens);
const restingOn = site => INTRO + EACH * site + 0.15;

test('next page moves from one site to the next as the page scrolls', async ({ page }) => {
  await answerForSites(page);
  await page.goto('/next/');
  const stage = page.locator('.stage');
  await expect(stage).toHaveAttribute('data-view', 'intro');
  await expect(page.locator('h1')).toContainText('העסק שלך');
  await expect(page.locator('.serp.is-on')).toHaveCount(0);

  await scrollScreens(page, restingOn(0));
  await expect(stage).toHaveAttribute('data-view', 'site');
  await expect(page.locator('.title.is-on h2')).toHaveText('קורל אירועים');
  await expect(page.locator('.serp.is-on')).toContainText('אישה לאישה');
  await expect(page.locator('.pips button').first()).toHaveAttribute('aria-current', 'true');

  await scrollScreens(page, restingOn(2));
  await expect(page.locator('.title.is-on h2')).toHaveText('מרים זליג');
  await expect(page.locator('.title.is-on .live-link')).toHaveAttribute('href', 'https://miryamzelig.co.il/');
  await expect(page.locator('.serp.is-on')).toHaveAttribute('href', 'https://miryamzelig.co.il/');
  await expect(page.locator('.device[data-i="2"]')).toBeVisible();
  await expect(page.locator('.device[data-i="4"]')).toBeHidden();

  await page.locator('.pips button').nth(4).click();
  await expect(page.locator('.title.is-on h2')).toHaveText('בדרך אליך');
});

test('next page always comes to rest on one site, wherever the scroll stops', async ({ page }) => {
  await answerForSites(page);
  await page.goto('/next/');
  // Stop just before the next site takes over, and just after: either way one device is in place and the rest are gone.
  for (const [screens, site] of [[INTRO + EACH * 1.97, 1], [INTRO + EACH * 2.03, 2]]) {
    await scrollScreens(page, screens);
    await expect(page.locator('.title.is-on h2')).toHaveText(site === 1 ? 'דפוס ראובן' : 'מרים זליג');
    await expect.poll(() => page.locator('.device').evaluateAll(devices => devices.filter(device => getComputedStyle(device).visibility === 'visible' && Number(device.style.opacity) > 0.01).map(device => device.dataset.i).join())).toBe(String(site));
  }
});

test('next page keeps each screen to a few words', async ({ page }) => {
  await answerForSites(page);
  await page.goto('/next/');
  await expect(page.locator('#watch-text')).toContainText('7 מתוך 7');
  // The count of sites that answer is for screen readers only. On screen, a dot says it.
  expect(await page.locator('#watch-text').evaluate(node => node.getBoundingClientRect().width)).toBeLessThanOrEqual(1);
  await scrollScreens(page, restingOn(0));
  await expect(page.locator('.title.is-on h2')).toHaveText('קורל אירועים');
  await expect(page.locator('.device[data-i="1"]')).toBeHidden();
  await expect(page.locator('.serp.is-on')).toHaveCSS('opacity', '1');
  const words = await page.locator('.stage').evaluate(stage => {
    const seen = [];
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    for (let node; (node = walker.nextNode());) {
      const box = node.parentElement.getBoundingClientRect();
      const style = getComputedStyle(node.parentElement);
      if (node.textContent.trim() && style.visibility === 'visible' && Number(style.opacity) > 0 && box.width > 1 && !node.parentElement.closest('.title:not(.is-on),.serp:not(.is-on)')) seen.push(node.textContent.trim());
    }
    return seen;
  });
  expect(words).toEqual(['קורל אירועים', 'אתר ומערכת הרשמה לאירועי נשים', 'lawebs.co.il/koralevents', '״אישה לאישה מלכה״ | ערבי נשים לזיכוי הרבות']);
});

test('next page checks every site and says which ones answer', async ({ page }) => {
  await answerForSites(page, { down: ['pinhasratzon'] });
  await page.goto('/next/');
  await expect(page.locator('#watch-text')).toContainText('6 מתוך 7 אתרים באוויר');
  const pips = page.locator('.pips button');
  await expect(pips.nth(0)).toHaveAttribute('data-state', 'up');
  await expect(pips.nth(6)).toHaveAttribute('data-state', 'down');
  await expect(page.locator('.live[data-site="0"] .live-text')).toHaveText('באוויר עכשיו');
  await expect(page.locator('.live[data-site="6"] .live-text')).toHaveText('לא עונה כרגע');
});

test('next page runs the bot and shows each event in the CRM and on the phone', async ({ page }) => {
  test.setTimeout(60000);
  await answerForSites(page);
  await page.goto('/next/');
  await page.locator('.sys-grid').scrollIntoViewIfNeeded();
  const rows = page.locator('#crm-rows .row:not(.is-ghost)');
  const notes = page.locator('#notes .note');
  await expect(page.locator('#chat-log .msg').first()).toHaveText('היי, אפשר לקבוע תור?', { timeout: 15000 });
  await expect(rows.first()).toContainText('לקוח חדש נרשם', { timeout: 15000 });
  await expect(notes.first()).toContainText('לקוח חדש נרשם');

  // The scene keeps moving, so the taps do not wait for it to stand still.
  await page.getByRole('button', { name: 'יום חמישי' }).click({ force: true, timeout: 15000 });
  await page.getByRole('button', { name: '10:00' }).click({ force: true, timeout: 15000 });
  await expect(rows.first()).toContainText('תור נקבע', { timeout: 15000 });
  await expect(rows.first()).toContainText('יום חמישי · 10:00');
  await expect(notes.first()).toContainText('תור נקבע');

  await page.getByRole('button', { name: 'כן, להוסיף' }).click({ force: true, timeout: 15000 });
  await expect(rows.first()).toContainText('מוצר נקנה', { timeout: 15000 });
  await expect(page.locator('#crm-count')).toHaveText('3');
  await expect(notes).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'שוב' })).toBeVisible({ timeout: 15000 });
});

test('next page stays out of search results and passes accessibility checks', async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await answerForSites(page);
  await page.goto('/next/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  const sitemap = await (await page.request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/next/');
  await expect(page.locator('#watch-text')).toContainText('7 מתוך 7');
  const check = async () => expect((await new AxeBuilder({ page }).analyze()).violations.map(v => `${v.id}: ${v.nodes.map(n => n.html.slice(0, 120) + ' // ' + n.any.map(c => c.message).join(' ')).join(' ## ')}`)).toEqual([]);
  await check();

  await scrollScreens(page, restingOn(1));
  await expect(page.locator('.title.is-on h2')).toHaveText('דפוס ראובן');
  await check();

  await page.locator('.sys-grid').scrollIntoViewIfNeeded();
  await expect(page.locator('#crm-rows .row:not(.is-ghost)').first()).toContainText('לקוח חדש נרשם', { timeout: 15000 });
  await check();

  await page.locator('#talk').scrollIntoViewIfNeeded();
  await check();
});
