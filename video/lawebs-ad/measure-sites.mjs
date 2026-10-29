// Measures real layout facts on the live sites (390×844 phone) so the "every detail" scene labels true values:
// Koral's main button, the spacing around it and the side margin, and where Pinhas's WhatsApp link sits.
// Usage: node measure-sites.mjs   (prints JSON)
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'he-IL' });
const page = await ctx.newPage();
const out = {};
await page.goto('https://lawebs.co.il/koralevents', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3500);
out.koral = await page.evaluate(() => {
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < 844; };
  const rect = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
  const byText = (sel, txt) => [...document.querySelectorAll(sel)].filter(vis).find(e => e.textContent.trim().includes(txt));
  const cta = byText('a,button', 'הערב הבא');
  const title = [...document.querySelectorAll('h1,h2')].filter(vis)[0];
  const sub = cta && [...document.querySelectorAll('p')].filter(vis).filter(p => p.getBoundingClientRect().bottom <= cta.getBoundingClientRect().top + 2).pop();
  const card = cta && [...document.querySelectorAll('a,article,div')].filter(vis).filter(e => { const r = e.getBoundingClientRect(); return r.top >= cta.getBoundingClientRect().bottom && r.height > 50 && r.width > 250; }).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  const fonts = el => el ? getComputedStyle(el).fontFamily : null;
  return { cta: cta && rect(cta), ctaRadius: cta && getComputedStyle(cta).borderRadius, title: title && rect(title), titleFont: fonts(title), sub: sub && rect(sub), card: card && rect(card), bodyFont: fonts(document.body) };
});
await page.goto('https://pinhasratzon.co.il/', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(3000);
out.pinhas = await page.evaluate(() => {
  const wa = [...document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]')].find(a => { const r = a.getBoundingClientRect(); return r.width > 0 && r.top < 120; });
  const r = wa && wa.getBoundingClientRect();
  return { wa: r && { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) } };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
