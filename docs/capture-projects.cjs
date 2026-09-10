const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents/node_modules/playwright');
const sharp = require('C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents/node_modules/sharp');

const projects = [
  ['libi', 'https://www.libidiamonds.co.il/'],
  ['koral', 'https://lawebs.co.il/koralevents'],
  ['miryam', 'https://miryamzelig.co.il/'],
  ['reuven', 'https://www.dfusreuven.co.il/'],
  ['pinhas', 'https://pinhasratzon.co.il/'],
];

(async () => {
  const output = path.resolve('public/images');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [name, url] of projects) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 35000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).every(i => i.complete), { timeout: 12000 }).catch(() => {});
      const meta = await page.evaluate(() => ({ title: document.title, imageSources: [...document.images].slice(0, 8).map(i => ({ src: i.currentSrc, alt: i.alt })) }));
      const screenshot = await page.screenshot({ fullPage: false });
      await sharp(screenshot).webp({ quality: 88 }).toFile(path.join(output, `${name}-desktop.webp`));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: 'networkidle', timeout: 35000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight).every(i => i.complete), { timeout: 12000 }).catch(() => {});
      await sharp(await page.screenshot({ fullPage: false })).webp({ quality: 88 }).toFile(path.join(output, `${name}-mobile.webp`));
      const result = { name, url, status: response.status(), ...meta };
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (error) {
      results.push({ name, url, error: error.message });
      console.log(JSON.stringify({ name, error: error.message }));
    }
    await context.close();
  }
  await browser.close();
  await fs.writeFile(path.resolve('docs/project-captures.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), projects: results }, null, 2));
})();
