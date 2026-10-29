import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const out = resolve('docs/facebook');
await mkdir(out, { recursive: true });
const uri = async (path, type) => 'data:' + type + ';base64,' + (await readFile(resolve(path))).toString('base64');
const monogram = await uri('public/la-monogram-white.svg', 'image/svg+xml');
const bold = await uri('public/fonts/plex-hebrew-700-hebrew.woff2', 'font/woff2');
const regular = await uri('public/fonts/plex-hebrew-400-hebrew.woff2', 'font/woff2');
const wordmarkFont = await uri('public/fonts/frank-ruhl-libre-latin.woff2', 'font/woff2');
const pinhas = await uri('public/images/pinhas-desktop-20261004.webp', 'image/webp');
const miryam = await uri('public/images/miryam-desktop-20261004.webp', 'image/webp');
const shared = `@font-face{font-family:Plex;src:url('${bold}');font-weight:700}@font-face{font-family:Plex;src:url('${regular}');font-weight:400}*{box-sizing:border-box}body{margin:0;font-family:Plex,Arial;background:#17243b;color:#f7f9fc}`;
const cover = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>${shared}
main{width:1640px;height:624px;position:relative;overflow:hidden;background:#17243b}
.blue{position:absolute;width:640px;height:624px;left:0;top:0;background:#244be8;clip-path:polygon(0 0,83% 0,100% 100%,0 100%)}
.work{position:absolute;direction:ltr;border:7px solid #f7f9fc;border-radius:16px;background:#f7f9fc;box-shadow:0 28px 56px #07112370;overflow:hidden}
.work:before{content:'';display:block;height:24px;background:radial-gradient(circle at 10px 11px,#a7b2c4 0 3px,transparent 4px),radial-gradient(circle at 23px 11px,#a7b2c4 0 3px,transparent 4px),radial-gradient(circle at 36px 11px,#a7b2c4 0 3px,transparent 4px);background-color:#f7f9fc}
.work img{display:block;width:100%;height:100%;object-fit:cover;object-position:top}
.rear{width:615px;height:373px;left:105px;top:98px;transform:rotate(-5deg)}
.front{width:485px;height:282px;left:277px;top:285px;transform:rotate(4deg)}
.copy{position:absolute;left:790px;top:67px;width:574px;text-align:right}
.brand{display:flex;direction:ltr;align-items:center;justify-content:flex-end;gap:11px;margin-bottom:22px}
.brand img{height:82px;width:82px}.brand span{font:58px/1 Georgia,serif;letter-spacing:-2px}
h1{font-size:96px;line-height:1.08;letter-spacing:-2px;margin:0;font-weight:700}
h1 span{display:block;color:#a9baff}
p{font-size:29px;margin:24px 0 0;line-height:1.45;color:#dbe3f0;white-space:nowrap}
.url{font:27px/1.4 Arial,sans-serif;direction:ltr;display:inline-block;margin-top:26px;color:#cdd6e5}
</style></head><body><main><div class="blue"></div><div class="work rear"><img alt="אתר עורך הדין פנחס רצון" src="${pinhas}"></div><div class="work front"><img alt="אתר מרים זליג" src="${miryam}"></div><div class="copy"><div class="brand"><img alt="LA" src="${monogram}"><span>webs</span></div><h1>בניית אתרים<span>לעסקים</span></h1><p>אתרי תדמית · דפי נחיתה · קטלוגים</p><div class="url">lawebs.co.il</div></div></main></body></html>`;
const profile = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>@font-face{font-family:Wordmark;src:url('${wordmarkFont}');font-weight:300 900}*{box-sizing:border-box}body{margin:0;background:#244be8;color:#fbfaf7;width:1024px;height:1024px;display:grid;place-items:center}.wordmark{display:inline-flex;align-items:baseline;font-family:Wordmark,serif;font-weight:800;font-size:224px;letter-spacing:-.03em;line-height:1;direction:ltr;white-space:nowrap}.wordmark span{font-weight:500;margin-left:.22em}</style></head><body><div class="wordmark" role="img" aria-label="LA webs">LA<span>webs</span></div></body></html>`;
const browser = await chromium.launch({ channel: 'msedge' });
try {
  const p = await browser.newPage({deviceScaleFactor:1,viewport:{width:1640,height:624}});
  for (const [name, html, width, height] of [['lawebs-cover-v2',cover,1640,624],['lawebs-profile-v2-full',profile,1024,1024]]) {
    await p.setViewportSize({width,height});
    await p.setContent(html,{waitUntil:'networkidle'});
    await p.evaluate(() => document.fonts.ready);
    if (name === 'lawebs-profile-v2-full') {
      const fit = await p.evaluate(() => {
        const logo = document.querySelector('.wordmark');
        const first = logo.getBoundingClientRect();
        if (first.width > 820) logo.style.fontSize = `${224 * 820 / first.width}px`;
        const box = logo.getBoundingClientRect();
        const radius = Math.max(...[[box.left,box.top],[box.right,box.top],[box.left,box.bottom],[box.right,box.bottom]].map(([x,y]) => Math.hypot(x-512,y-512)));
        return {text:logo.textContent, width:box.width, height:box.height, insideCircle:radius < 512};
      });
      if (fit.text !== 'LAwebs' || !fit.insideCircle) throw new Error('Full wordmark does not fit the avatar circle');
      console.log('Profile circle fit', JSON.stringify(fit));
    }
    await writeFile(resolve(out,name+'.html'),html);
    await p.screenshot({path:resolve(out,name+'.png'),animations:'disabled'});
    if (name === 'lawebs-profile-v2-full') {
      await p.setViewportSize({width:520,height:280});
      await p.setContent(`<!doctype html><html><head><style>body{margin:0;background:#f7f9fc;display:flex;align-items:center;justify-content:center;gap:42px;width:520px;height:280px}img{width:170px;height:170px;border-radius:50%}.small{width:56px;height:56px}</style></head><body><img alt="Full logo in Page avatar" src="${await uri('docs/facebook/'+name+'.png','image/png')}"><img class="small" alt="Full logo in compact avatar" src="${await uri('docs/facebook/'+name+'.png','image/png')}"></body></html>`,{waitUntil:'networkidle'});
      await p.screenshot({path:resolve(out,'lawebs-profile-circle-preview.png'),animations:'disabled'});
    }
    console.log(name, width, height);
  }
} finally {await browser.close();}
const plan = {
  status:'PREPARED', pageName:'La webs - בניית אתרים לעסקים',category:'Web Designer',
  bio:'אתרי תדמית, דפי נחיתה וקטלוגים לעסקים. עיצוב ופיתוח לפי הצרכים של העסק, עם קישורים לפנייה בטלפון ובוואטסאפ. לצפייה בעבודות ולשיחה על האתר שלך: lawebs.co.il',
  website:'https://lawebs.co.il/',phone:'+972508611888',email:'lawebsmng@gmail.com',
  profile:'lawebs-profile-v2-full.png',cover:'lawebs-cover-v2.png',actionButton:{type:'Contact us',url:'https://lawebs.co.il/lp/short/'},
  address:null,openingHours:null,paidAdvertising:false
};
try {
  await writeFile(resolve(out,'page-plan.json'),JSON.stringify(plan,null,2)+'\n',{flag:'wx'});
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
