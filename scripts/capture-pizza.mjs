// Captures the public PizzaManager demo flow (hero, menu, builder with toppings) and stitches it into
// the portfolio's capture set: card face, long phone strip, long desktop strip and a desktop viewport image.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = fileURLToPath(new URL('../public/images', import.meta.url));
const base = 'https://lawebs.co.il/PizzaManager/';
const b = await chromium.launch({ channel: 'chrome' });

async function flow(ctxOpts) {
  const ctx = await b.newContext({ ...ctxOpts, locale: 'he-IL' });
  const p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
  const hero = await p.screenshot();
  await p.locator('a,button').filter({ hasText: 'משלוח' }).first().click(); await p.waitForTimeout(1800);
  const menu = await p.screenshot();
  await p.locator('a,button').filter({ hasText: 'מרכיבים' }).first().click(); await p.waitForTimeout(1800);
  for (const t of ['בינונית', 'זיתים +', 'פטריות +', 'בצל סגול +', 'עגבניות +']) { await p.locator('button,label').filter({ hasText: t }).first().click().catch(() => {}); await p.waitForTimeout(350); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  const builder = await p.screenshot({ fullPage: true });
  await ctx.close();
  return { hero, menu, builder };
}

// Stitch PNG buffers vertically in a blank page and return WebP bytes.
async function stitch(parts, { width, crops, quality = 0.86, maxHeight = 6000 }) {
  const p = await b.newPage();
  const result = await p.evaluate(async ({ parts, width, crops, quality, maxHeight }) => {
    const imgs = await Promise.all(parts.map(src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + src; })));
    const heights = imgs.map((img, k) => Math.min(crops[k] ?? img.height, img.height) * width / img.width);
    const total = Math.min(Math.round(heights.reduce((a, c) => a + c, 0)), maxHeight);
    const c = document.createElement('canvas'); c.width = width; c.height = total;
    const g = c.getContext('2d'); let y = 0;
    imgs.forEach((img, k) => { const sh = Math.min(crops[k] ?? img.height, img.height); g.drawImage(img, 0, 0, img.width, sh, 0, y, width, heights[k]); y += heights[k]; });
    return { data: c.toDataURL('image/webp', quality).split(',')[1], height: total };
  }, { parts: parts.map(x => x.toString('base64')), width, crops, quality, maxHeight });
  await p.close();
  return { bytes: Buffer.from(result.data, 'base64'), height: result.height };
}

const m = await flow({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
const d = await flow({ viewport: { width: 1440, height: 1000 } });
const card = await stitch([m.hero], { width: 585, crops: [820] });
const mobile = await stitch([m.hero, m.menu, m.builder], { width: 585, crops: [1266, 1080, 2010] });
const desktop = await stitch([d.hero, d.builder], { width: 1440, crops: [1000, undefined] });
const view = await stitch([d.hero], { width: 1440, crops: [1000], quality: 0.88 });
await writeFile(`${out}/pizza-card-20261004.webp`, card.bytes);
await writeFile(`${out}/pizza-mobile-full.webp`, mobile.bytes);
await writeFile(`${out}/pizza-desktop-full.webp`, desktop.bytes);
await writeFile(`${out}/pizza-desktop-20261004.webp`, view.bytes);
await writeFile(`${out}/pizza-desktop.webp`, view.bytes);
console.log(JSON.stringify({ card: card.height, mobile: mobile.height, desktop: desktop.height, sizes: [card, mobile, desktop, view].map(x => x.bytes.length) }));
await b.close();
