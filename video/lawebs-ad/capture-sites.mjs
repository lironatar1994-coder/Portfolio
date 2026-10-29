// Captures the live sites at phone size for the ad: the first screen at 3x (1170×2532, sharp enough to fill the
// 1080×1920 frame) and up to four screens of each site at 2x (Miryam Zelig's whole page) for the scrolling phones.
// Usage: node capture-sites.mjs
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const out = fileURLToPath(new URL('./assets/hd/', import.meta.url));
await mkdir(out, { recursive: true });
const SITES = {
  pizza: 'https://lawebs.co.il/PizzaManager/',
  koral: 'https://lawebs.co.il/koralevents',
  pinhas: 'https://pinhasratzon.co.il/',
  miryam: 'https://miryamzelig.co.il/',
  libi: 'https://www.libidiamonds.co.il/',
};
const browser = await chromium.launch({ channel: 'chrome' });
const open = async (url, dpr) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, locale: 'he-IL', reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3500); // intro animations settle
  return { ctx, page };
};
for (const [slug, url] of Object.entries(SITES)) {
  const { ctx, page } = await open(url, 3);
  await page.screenshot({ path: `${out}${slug}.jpg`, type: 'jpeg', quality: 92 });
  console.log('captured', slug);
  await ctx.close();
}
// a few screens of each site at 2x for the scrolling phones: scroll through first so lazy images load and
// reveal-on-scroll content shows, then return to the top (Miryam's whole page for the phone scene)
for (const [slug, url] of Object.entries(SITES)) {
  const { ctx, page } = await open(url, 2);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 400) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(140); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1500);
  const deep = slug === 'miryam' ? undefined : { x: 0, y: 0, width: 390, height: Math.min(height, 844 * 4) };
  await page.screenshot({ path: `${out}${slug}-full.jpg`, type: 'jpeg', quality: 88, fullPage: true, ...(deep ? { clip: deep } : {}) });
  console.log('captured', slug, 'page', height);
  await ctx.close();
}
await browser.close();
