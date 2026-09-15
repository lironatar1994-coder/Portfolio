// Render the homepage sharing card (scripts/share-card.html) to a 1200 x 630 image
// with the site's real fonts and project card images. Uses the Playwright already
// installed for the browser tests: node scripts/render-share.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { stat } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(root, 'public/images/la-webs-share-v3.jpg');
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'msedge' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve(root, 'scripts/share-card.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(img => img.complete && img.naturalWidth > 0));
// WhatsApp only shows the large preview for images well under ~300 KB, so ship a JPEG.
await page.screenshot({ path: out, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`${out} (${Math.round((await stat(out)).size / 1024)} KB)`);
