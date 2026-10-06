// Render original typographic ad assets using real site screenshots. No customer CV files are read.
import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const cvRoot = resolve('../cv-landing-mockup');
const webOut = resolve('docs/ads/creatives'), cvOut = resolve(cvRoot, 'docs/ads/creatives');
await Promise.all([mkdir(webOut, { recursive: true }), mkdir(cvOut, { recursive: true })]);
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await p.goto('http://127.0.0.1:5198/');
  await p.evaluate(() => document.fonts.ready);
  const cvImage = 'data:image/png;base64,' + (await p.locator('.stage').screenshot({ animations: 'disabled' })).toString('base64');
  const cards = await Promise.all(['pinhas', 'miryam', 'koral'].map(async slug => 'data:image/webp;base64,' + (await readFile(resolve('public/images/' + slug + '-card-20261004.webp'))).toString('base64')));
  for (const product of ['lawebs', 'cv', 'cv-scratch']) for (const story of [false, true]) {
    const width = 1080, height = story ? 1920 : 1350, isWeb = product === 'lawebs', scratch = product === 'cv-scratch';
    const name = product + (story ? '-story' : '-feed');
    const title = isWeb ? 'האתר הבא<br>יכול להיות שלכם.' : scratch ? 'קורות חיים<br>שנכתבים סביבכם.' : 'הניסיון שלכם.<br>במילים טובות יותר.';
    const sub = isWeb ? 'עיצוב אישי. פיתוח סביב העסק.' : scratch ? 'פגישה אישית מרחוק, כתיבה ועיצוב.' : 'משכתבים ומעצבים קורות חיים קיימים.';
    const price = isWeb ? 'אתר תדמית החל מ־2,500 ₪' : scratch ? 'כתיבה מאפס · 350 ₪' : 'שדרוג במחיר השקה · 100 ₪';
    const media = isWeb ? `<div class="cards">${cards.map((src, i) => `<img src="${src}" style="--i:${i}">`).join('')}</div>` : `<div class="cv-image"><img src="${cvImage}"><span>הדגמה להמחשה</span></div>`;
    const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
    @font-face{font-family:Plex;src:url('http://127.0.0.1:4173/fonts/plex-hebrew-700-hebrew.woff2');font-weight:700}
    @font-face{font-family:Plex;src:url('http://127.0.0.1:4173/fonts/plex-hebrew-400-hebrew.woff2');font-weight:400}
    *{box-sizing:border-box}body{margin:0;font-family:Plex,Arial;background:${isWeb ? '#17243b' : '#f7f9fc'};color:${isWeb ? '#f7f9fc' : '#17243b'}}
    main{width:${width}px;height:${height}px;padding:${story ? '225px 78px 240px' : '65px 72px 68px'};display:flex;flex-direction:column;overflow:hidden}
    .brand{font-size:36px;font-weight:700;direction:${isWeb ? 'ltr' : 'rtl'};align-self:flex-start;border-bottom:5px solid ${isWeb ? '#9caeff' : '#244be8'};padding-bottom:9px;margin-bottom:40px}
    h1{font-size:${story ? '88' : '86'}px;line-height:1.08;letter-spacing:-1.5px;margin:0 0 20px;font-weight:700}p{font-size:32px;margin:0;line-height:1.5}
    .media{flex:1;min-height:0;display:flex;justify-content:center;align-items:center;margin:35px 0}
    .cards{position:relative;width:890px;height:${story ? '530' : '510'}px;direction:ltr}.cards img{position:absolute;width:330px;height:462px;object-fit:cover;left:calc(30px + var(--i)*235px);top:calc(22px + var(--i)*10px);transform:rotate(calc(-9deg + var(--i)*9deg));border:7px solid white;border-radius:14px;box-shadow:0 20px 45px -16px #050d1e;}
    .cv-image{height:100%;max-height:650px;display:flex;flex-direction:column;align-items:center;gap:10px}.cv-image img{height:calc(100% - 30px);width:auto;max-width:900px;object-fit:contain}.cv-image span{font-size:20px;color:#52627a}
    .price{font-size:42px;font-weight:700;line-height:1.3;margin-bottom:20px}.cta{background:#244be8;color:white;padding:19px 32px;border-radius:12px;font-size:32px;font-weight:700;align-self:flex-start}.foot{font-size:24px;line-height:1.4;margin-top:18px;color:${isWeb ? '#d0ddf6' : '#52627a'}}
    </style></head><body><main><div class="brand">${isWeb ? 'LA webs' : 'מילה טובה'}</div><h1>${title}</h1><p>${sub}</p><div class="media">${media}</div><div class="price">${price}</div><div class="cta">${isWeb ? 'צפו בעבודות ונדבר' : 'צפו בהדגמה ובחרו מסלול'}</div><div class="foot">${isWeb ? 'שיחת היכרות בלי עלות · lawebs.co.il' : 'הכול מרחוק · lawebs.co.il/cv'}</div></main></body></html>`;
    await p.setViewportSize({ width, height });
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const folder = isWeb ? webOut : cvOut;
    await writeFile(resolve(folder, name + '.html'), html);
    await p.screenshot({ path: resolve(folder, name + '.png'), animations: 'disabled' });
    console.log(name, width, height);
  }
} finally { await browser.close(); }
