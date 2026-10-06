import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const p = await context.newPage();
  const hits = [];
  await p.route('**/config.js', async route => {
    const response = await route.fetch();
    let source = await response.text();
    source = source.replace('REPLACE_WEB3FORMS_KEY', 'test-mocked-key').replace('REPLACE_META_PIXEL_ID', '123456789012345').replace('REPLACE_GOOGLE_ADS_ID', 'AW-123456789').replace('REPLACE_CONVERSION_LABEL', 'test');
    await route.fulfill({ response, body: source });
  });
  await p.route(/https:\/\/(connect\.facebook\.net|www\.googletagmanager\.com)\//, route => { hits.push(route.request().url()); return route.fulfill({ body:'', contentType:'application/javascript' }); });
  await p.route('https://api.web3forms.com/submit', route => route.fulfill({ json: { success: true } }));
  await p.goto('http://127.0.0.1:5198/');
  if (hits.length) throw new Error('Tracking loaded before consent');
  await p.locator('[data-consent="granted"]').click();
  await p.locator('#f-name').fill('בדיקת אתר'); await p.locator('#f-phone').fill('0500000000');
  await p.locator('#submit-btn').click();
  await p.waitForURL('**/thank-you.html?plan=upgrade');
  const first = await p.evaluate(() => ({ g: window.dataLayer.map(v => Array.from(v)), f: window.fbq.queue.map(v => Array.from(v)) }));
  if (first.g.filter(v => v[1] === 'generate_lead').length !== 1 || first.f.filter(v => v[1] === 'Lead').length !== 1) throw new Error('Confirmed mocked submission was not counted once');
  if (JSON.stringify(first).includes('0500000000') || JSON.stringify(first).includes('בדיקת אתר') || JSON.stringify(first).includes('value')) throw new Error('Personal data or unverified lead value was sent to pixels');
  await p.reload();
  if ((await p.evaluate(() => window.fbq.queue.map(v => Array.from(v)))).some(v => v[1] === 'Lead')) throw new Error('Reload duplicated the lead');
  await context.close();
  console.log('CV tracking: consent, confirmed mocked submission, no duplicate on reload, no personal data or fabricated monetary value: passed');
} finally { await browser.close(); }
