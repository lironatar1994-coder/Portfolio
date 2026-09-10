const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work/KoralEvents/node_modules/sharp');
const work = 'C:/Users/liron/OneDrive/שולחן העבודה/Liron/Work';
const sources = [
  ['libi-hero.webp', `${work}/github-repos/LibiDiamondsRework/images/home/hero-01.jpg`],
  ['koral-hero.webp', `${work}/KoralEvents - Copy/public/brand/hero-signature-landscape.webp`],
  ['koral-hero-portrait.webp', `${work}/KoralEvents - Copy/public/brand/hero-signature-portrait.webp`],
  ['miryam-hero.webp', `${work}/github-repos/Miryam_Zelig/gallery/img1.jpeg`],
  ['miryam-portrait.webp', `${work}/github-repos/Miryam_Zelig/gallery/hero.jpeg`],
  ['reuven-hero.webp', `${work}/github-repos/DfusReuven/public/images/hero-collage.webp`],
  ['pinhas-hero.webp', `${work}/github-repos/PinhasRatzon/site/public/assets/img/hero-room.jpg`],
];

(async () => {
  await fs.mkdir(path.resolve('public/images'), { recursive: true });
  const results = [];
  for (const [filename, source] of sources) {
    const output = path.resolve('public/images', filename);
    const info = await sharp(source).rotate().resize({ width: 1600, height: 1800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(output);
    results.push({ filename, source, ...info });
  }
  await fs.writeFile(path.resolve('docs/project-assets.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})();
