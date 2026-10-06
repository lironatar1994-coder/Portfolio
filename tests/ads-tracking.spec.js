import { test, expect } from '@playwright/test';

async function configured(page) {
  const loaded = [];
  await page.route('**/ads-config.js', route => route.fulfill({ contentType: 'application/javascript', body: "window.LA_ADS={googleId:'AW-123456789',contactConversion:'AW-123456789/test',metaPixelId:'123456789012345',ga4Id:''}" }));
  await page.route(/https:\/\/(www\.googletagmanager\.com|connect\.facebook\.net)\//, route => { loaded.push(route.request().url()); return route.fulfill({ body: '', contentType: 'application/javascript' }); });
  return loaded;
}

test('advertising scripts wait for consent and refusal persists', async ({ page }) => {
  const loaded = await configured(page);
  await page.goto('/lp/short/');
  await expect(page.getByRole('button', { name: 'המשך בלי מדידה', exact: true })).toBeVisible();
  expect(loaded).toEqual([]);
  await page.getByRole('button', { name: 'המשך בלי מדידה', exact: true }).click();
  await page.reload();
  await expect(page.locator('.ad-consent')).toHaveCount(0);
  expect(loaded).toEqual([]);
  await page.evaluate(() => window.LA_trackContact('whatsapp'));
  expect(await page.evaluate(() => window.dataLayer || [])).toEqual([]);
});

test('consent enables Contact intent without claiming Lead or passing personal details', async ({ page }) => {
  const loaded = await configured(page);
  await page.goto('/lp/short/?utm_source=facebook&utm_campaign=studio');
  await page.getByRole('button', { name: 'אישור מדידה', exact: true }).click();
  await expect.poll(() => loaded.length).toBe(2);
  await page.evaluate(() => { window.LA_trackContact('whatsapp'); window.LA_trackContact('whatsapp'); });
  const events = await page.evaluate(() => ({ google: window.dataLayer.map(value => Array.from(value)), meta: window.fbq.queue.map(value => Array.from(value)) }));
  expect(events.google.filter(event => event[1] === 'contact_intent')).toHaveLength(1);
  expect(events.google.some(event => event[1] === 'generate_lead')).toBe(false);
  expect(events.meta.filter(event => event[1] === 'Contact')).toHaveLength(1);
  expect(events.meta.some(event => event[1] === 'Lead')).toBe(false);
  expect(JSON.stringify(events)).not.toContain('name');
  expect(JSON.stringify(events)).not.toContain('phone');
});

test('campaign source survives navigation and a blocked-storage visitor can still use contact', async ({ page }) => {
  await page.goto('/lp/short/?utm_source=google&utm_campaign=lawebs_search&utm_content=tadmit');
  await page.goto('/lp/?t=tadmit');
  expect(await page.evaluate(() => window.LA_contactSource())).toBe('\nמקור הפנייה: google / lawebs_search / tadmit');
  await page.addInitScript(() => { Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('blocked'); } }); Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await page.reload();
  expect(await page.evaluate(() => window.LA_contactSource())).toBe('');
  await expect(page.locator('a[href^="https://wa.me"]:visible').first()).toBeVisible();
});
