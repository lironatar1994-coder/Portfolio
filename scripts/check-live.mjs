// Checks that every project's live site answers, and records the result for the build's "באוויר" pills.
// Run before deploying: node scripts/check-live.mjs. The build never fetches anything; it reads docs/live-status.json.
// A site that fails loses its pill on the next build instead of claiming to be live.
import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/projects.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sites = {};
await Promise.all(projects.map(async p => {
  try {
    const response = await fetch(p.url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'LA-webs-liveness-check' } });
    const html = response.ok ? await response.text() : '';
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || '';
    sites[p.slug] = { ok: response.ok && html.length > 500, status: response.status, title };
  } catch (error) {
    sites[p.slug] = { ok: false, status: 0, error: String(error.cause?.code || error.name) };
  }
}));
const checked = new Date().toISOString();
await writeFile(resolve(root, 'docs/live-status.json'), JSON.stringify({ checked, sites }, null, 2) + '\n');
for (const p of projects) console.log(`${sites[p.slug].ok ? 'live ' : 'DOWN '} ${p.slug.padEnd(7)} ${sites[p.slug].status} ${p.url}`);
