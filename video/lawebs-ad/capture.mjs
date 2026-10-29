// Renders index.html frame by frame in headless Chrome and encodes the MP4 with ffmpeg.
// Usage: node capture.mjs <dark|light> <out.mp4> [audio] [--stills 1,4.5,...]
//   --stills writes PNGs of those seconds to out/stills instead of the whole video.
import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const [theme = 'dark', out = `out/lawebs-ad-${theme}.mp4`, audio] = process.argv.slice(2).filter(a => !a.startsWith('--') && !/^[\d.,]+$/.test(a));
const stillsAt = process.argv.includes('--stills') ? process.argv[process.argv.indexOf('--stills') + 1].split(',').map(Number) : null;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(resolve(here, 'index.html')).href + `?capture&theme=${theme}`);
// fonts and images must be ready before the first frame
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
  for (const w of ['Plex', 'Frank']) await document.fonts.load(`700 40px ${w}`, 'אבג abc');
});
const shot = async (t, path) => { await page.evaluate(x => window.render(x), t); await page.screenshot({ path, type: path.endsWith('.png') ? 'png' : 'jpeg', quality: path.endsWith('.png') ? undefined : 94 }); };

if (stillsAt) {
  await mkdir(resolve(here, 'out/stills'), { recursive: true });
  for (const t of stillsAt) await shot(t, resolve(here, `out/stills/${theme}-${String(t).replace('.', '_')}.png`));
} else {
  const dir = resolve(here, `out/frames-${theme}`);
  await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true });
  const total = 30 * 30;
  for (let f = 0; f < total; f++) {
    await shot(f / 30, resolve(dir, `f${String(f).padStart(4, '0')}.jpg`));
    if (f % 150 === 0) console.log(`${theme}: frame ${f}/${total}`);
  }
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '30', '-i', resolve(dir, 'f%04d.jpg')];
  if (audio) args.push('-i', resolve(here, audio));
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-movflags', '+faststart');   // capped: social platforms re-encode to well under this
  if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push(resolve(here, out));
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  await rm(dir, { recursive: true, force: true });
  console.log('wrote', out);
}
await browser.close();
