// Measures the first screen of miryamzelig.co.il (390×844) so the ad can rebuild it from its own pixels.
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'he-IL' });
const page = await ctx.newPage();
await page.goto('https://miryamzelig.co.il/', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3500);
const out = await page.evaluate(() => {
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width < 4 || r.height < 4 || r.top > 844 || r.bottom < 0 || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').trim();
    const isImg = el.tagName === 'IMG' || el.tagName === 'PICTURE' || (cs.backgroundImage && cs.backgroundImage !== 'none');
    if (!own && !isImg && !['A', 'BUTTON', 'HR', 'svg'].includes(el.tagName)) continue;
    rows.push({ tag: el.tagName, cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 40), text: own.slice(0, 40), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, img: isImg });
  }
  return { rows, bodyBg: getComputedStyle(document.body).backgroundColor, htmlBg: getComputedStyle(document.documentElement).backgroundColor };
});
console.log(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'));
await browser.close();
