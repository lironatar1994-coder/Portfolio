// Renders the homepage sharing image (1200×630) from the live desktop hero: headline and the open fan.
// Run with the dev server up (npm run dev), then rebuild.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../public/images/la-webs-share-studio-20261006.jpg', import.meta.url));
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1200 / 1320, reducedMotion: 'reduce' });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
await page.screenshot({ path: out, type: 'jpeg', quality: 90, clip: { x: 60, y: 96, width: 1320, height: 693 } });
await browser.close();
console.log('wrote', out);
