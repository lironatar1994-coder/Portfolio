// Full-page captures of the five live production sites (desktop + mobile), plus verifiable palette/typography facts.
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents - Copy/node_modules/playwright');
const sharp = require('C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents - Copy/node_modules/sharp');

const projects = [
  ['koral', 'https://lawebs.co.il/koralevents'],
  ['libi', 'https://www.libidiamonds.co.il/'],
  ['miryam', 'https://miryamzelig.co.il/'],
  ['pinhas', 'https://pinhasratzon.co.il/'],
  ['reuven', 'https://www.dfusreuven.co.il/'],
];
const MAX_DESKTOP = 6400, MAX_MOBILE = 6000;
const kinds = (process.env.KINDS || 'desktop,mobile').split(',');

async function settle(page) {
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  // Walk the page to trigger lazy loading, then return to top.
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(innerHeight * 0.7));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForFunction(() => [...document.images].every(i => i.complete), { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
}

async function facts(page) {
  return page.evaluate(() => {
    const area = el => { const r = el.getBoundingClientRect(); return r.width * r.height; };
    const counts = new Map();
    for (const el of document.querySelectorAll('body, body *')) {
      const cs = getComputedStyle(el); const bg = cs.backgroundColor;
      if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue;
      const a = area(el); if (a < 8000) continue;
      counts.set(bg, (counts.get(bg) || 0) + a);
    }
    const backgrounds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c]) => c);
    const vars = {};
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) if (rule.selectorText === ':root' || rule.selectorText === 'html') for (const p of rule.style) if (p.startsWith('--') && /color|bg|accent|primary|brand|ink|gold|green|purple|dark|light/i.test(p)) vars[p] = rule.style.getPropertyValue(p).trim();
    }
    const font = sel => { const el = document.querySelector(sel); return el ? getComputedStyle(el).fontFamily : null; };
    return { title: document.title, height: document.documentElement.scrollHeight, backgrounds, vars, fonts: { h1: font('h1'), h2: font('h2'), body: font('body'), button: font('button, a.btn, .btn') } };
  });
}

(async () => {
  const output = path.resolve('public/images');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [name, url] of projects) {
    const result = { name, url };
    for (const [kind, viewport, dsf, max, mobile] of [['desktop', { width: 1440, height: 1000 }, 1, MAX_DESKTOP, false], ['mobile', { width: 390, height: 844 }, 1.5, MAX_MOBILE, true]]) {
      if (!kinds.includes(kind)) continue;
      const context = await browser.newContext({ viewport, deviceScaleFactor: dsf, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', locale: 'he-IL' });
      const page = await context.newPage();
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 40000 }).catch(() => page.goto(url, { waitUntil: 'load', timeout: 40000 }));
        await settle(page);
        if (kind === 'desktop') Object.assign(result, { status: response?.status(), ...(await facts(page)) });
        else result.mobileHeight = (await facts(page)).height;
        const height = Math.min(await page.evaluate(() => document.documentElement.scrollHeight), max);
        const shot = await page.screenshot({ fullPage: true, animations: 'disabled' });
        const img = sharp(shot);
        const meta = await img.metadata();
        const cropH = Math.min(meta.height, Math.floor(height * dsf));
        await img.extract({ left: 0, top: 0, width: meta.width, height: cropH }).webp({ quality: kind === 'mobile' ? 78 : 82 }).toFile(path.join(output, `${name}-${kind}-full.webp`));
        result[`${kind}Capture`] = { width: meta.width, height: cropH, truncated: meta.height > cropH };
      } catch (error) { result[`${kind}Error`] = error.message; }
      await context.close();
    }
    results.push(result); console.log(JSON.stringify(result));
  }
  await browser.close();
  // Miryam before/after artwork from the user's own project source.
  const gallery = 'C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/github-repos/Miryam_Zelig/gallery';
  for (const [src, dest] of [['before-after-before.jpeg', 'miryam-before.webp'], ['before-after-after.jpeg', 'miryam-after.webp']]) {
    await sharp(path.join(gallery, src)).resize({ width: 1000, height: 1250, fit: 'inside' }).webp({ quality: 84 }).toFile(path.join(output, dest));
  }
  let previous = []; try { previous = JSON.parse(await fs.readFile(path.resolve('docs/project-longcaptures.json'), 'utf8')).projects; } catch {}
  const merged = results.map(r => ({ ...(previous.find(p => p.name === r.name) || {}), ...r }));
  await fs.writeFile(path.resolve('docs/project-longcaptures.json'), JSON.stringify({ capturedAt: new Date().toISOString(), projects: merged }, null, 2));
  console.log('done');
})();
