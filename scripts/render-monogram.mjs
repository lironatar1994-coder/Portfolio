// Regenerate PNG fallbacks from the SVG masters. Pass a sharp module path when
// using a shared tooling installation: node scripts/render-monogram.mjs <path>.
// Ordinary site builds use the committed assets and do not require sharp.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
await Promise.all([
  ...[32, 180, 192].map(size => sharp(resolve(root, 'public/favicon.svg'))
    .resize(size, size).png().toFile(resolve(root, `public/la-monogram-${size}-v2.png`))),
  sharp(resolve(root, 'public/images/la-webs-share.svg')).png()
    .toFile(resolve(root, 'public/images/la-webs-share-v2.png')),
]);
