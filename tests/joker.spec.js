import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function observeErrors(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(`JavaScript: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`Console: ${message.text()}`); });
  page.on('response', response => {
    if (response.url().startsWith('http://127.0.0.1:4173') && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return errors;
}
// The pinned deck measures its chapters in screens.
const scrollScreens = (page, screens) => page.evaluate(value => scrollTo(0, value * document.querySelector('.stage').offsetHeight), screens);

test('joker page turns the card through its chapters as the page scrolls', async ({ page }) => {
  const errors = observeErrors(page);
  await page.goto('/joker/');
  const card = page.locator('#card');
  await expect(page.locator('h1')).toHaveText('הג׳וקרשל העסק שלך.');
  await expect(card).toHaveAttribute('data-face', 'joker');

  await scrollScreens(page, 0.8);
  await expect(card).toHaveAttribute('data-face', 'web');
  await expect(page.locator('.site-name')).toHaveText('קורל אירועים');
  await expect(page.locator('.site-link')).toHaveAttribute('href', 'https://lawebs.co.il/koralevents');
  await scrollScreens(page, 2.7);
  await expect(page.locator('.site-name')).toHaveText('פנחס רצון');
  await expect(page.locator('.site.is-on img')).toHaveJSProperty('complete', true);

  await scrollScreens(page, 3.2);
  await expect(card).toHaveAttribute('data-face', 'bot');
  // The card floats, so it never counts as stable; the tap itself is what matters.
  await page.locator('.chips button', { hasText: 'היום' }).click({ force: true });
  await page.locator('.chips button', { hasText: '12:30' }).click({ force: true });
  await expect(page.locator('#chat-log')).toContainText('נקבע. היום ב־12:30.');

  await scrollScreens(page, 0);
  await expect(card).toHaveAttribute('data-face', 'joker');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  expect(errors).toEqual([]);
});

test('joker page lets the visitor pick a service and talk about it', async ({ page }) => {
  const errors = observeErrors(page);
  await page.goto('/joker/');
  await page.locator('#hand').scrollIntoViewIfNeeded();
  await expect(page.locator('#hand')).toHaveClass(/is-dealt/);
  const cta = page.locator('#hand-cta');
  const general = await cta.getAttribute('href');
  const crm = page.locator('.hand-card', { hasText: 'CRM' });
  await crm.click();
  await expect(crm).toHaveAttribute('aria-pressed', 'true');
  await expect(cta).toContainText('נדבר בוואטסאפ על CRM');
  expect(decodeURIComponent(await cta.getAttribute('href'))).toContain('אשמח לדבר על CRM');
  await crm.click();
  await expect(cta).toHaveAttribute('href', general);
  expect(errors).toEqual([]);
});

test('joker page stays out of search results and passes accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/joker/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
  await expect(page.locator('#card')).toHaveAttribute('data-face', 'joker');
  const top = await new AxeBuilder({ page }).analyze();
  expect(top.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  await scrollScreens(page, 3.4);
  await expect(page.locator('#chat-log')).toContainText('אשלח לך תזכורת לפני התור.');
  const bot = await new AxeBuilder({ page }).analyze();
  expect(bot.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  await page.locator('#hand').scrollIntoViewIfNeeded();
  await expect(page.locator('#hand')).toHaveClass(/is-dealt/);
  const hand = await new AxeBuilder({ page }).analyze();
  expect(hand.violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});
