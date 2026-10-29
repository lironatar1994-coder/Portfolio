// Frame renderer for the ad: drives window.render(t) in headless Chrome (raw DevTools protocol, no dependencies).
// Usage:
//   node render.mjs <outDir> --times 1.2 3.4 ...      key frames (t1_2.jpg ...)
//   node render.mjs <outDir> --range <from> <to>        frames [from, to) at the page's FPS (f00000.jpg ...)
//   node render.mjs <file.json> --events                write the page's event timeline (META) and exit
// Env: URL=http://127.0.0.1:4181/  PORT=9400 (DevTools port; use a different one per parallel job)
// The frame size comes from the page's META (width/height), 1080x1920 when it doesn't say.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const [out, mode, ...rest] = process.argv.slice(2);
const base = process.env.URL || 'http://127.0.0.1:4181/';
const port = Number(process.env.PORT || 9400);
const profile = mkdtempSync(join(tmpdir(), 'adrender-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--hide-scrollbars',
  '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--disable-gpu-vsync', 'about:blank'
], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let page;
for (let i = 0; i < 80 && !page; i++) {
  try { page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
  if (!page) await sleep(150);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => {
  const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) throw new Error(JSON.stringify(res.result.exceptionDetails).slice(0, 600));
  return res.result?.result?.value;
};
const errors = [];
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); });
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `${base}?capture` });
for (let i = 0; i < 400; i++) { if (await evaluate('window.READY === true').catch(() => false)) break; await sleep(150); }
if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
const assets = await evaluate('window.ASSETS_REPORT');
if (!assets || !assets.fontsOk || !assets.imagesOk) {
  console.log('ASSETS MISSING, not rendering:', JSON.stringify(assets));
  ws.close(); chrome.kill(); process.exit(2);
}
const meta = await evaluate('window.META');
const W = meta.width || 1080, H = meta.height || 1920;
if (W !== 1080 || H !== 1920) { await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }); await sleep(300); }

try {
  if (mode === '--events') {
    writeFileSync(out, JSON.stringify(meta, null, 1));
    console.log('events', meta.events.length);
  } else {
    mkdirSync(out, { recursive: true });
    let jobs;
    if (mode === '--times') jobs = rest.map(Number).map(t => [t, `t${String(t).replace('.', '_')}.jpg`]);
    else {
      const total = Math.round(meta.duration * meta.fps);
      const from = Number(rest[0] ?? 0), to = Math.min(total, Number(rest[1] ?? total));
      jobs = [];
      for (let i = from; i < to; i++) jobs.push([i / meta.fps, `f${String(i).padStart(5, '0')}.jpg`]);
    }
    let n = 0;
    for (const [t, name] of jobs) {
      await evaluate(`window.render(${t}); new Promise(r => requestAnimationFrame(() => r(1)))`);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: W, height: H, scale: 1 }, captureBeyondViewport: false });
      writeFileSync(join(out, name), Buffer.from(shot.result.data, 'base64'));
      if (++n % 120 === 0) console.log(`${n}/${jobs.length}`);
    }
    if (errors.length) console.log('PAGE ERRORS:\n' + errors.join('\n'));
    console.log('done', jobs.length);
  }
} finally {
  ws.close(); chrome.kill();
  await sleep(300); try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
process.exit(0);
