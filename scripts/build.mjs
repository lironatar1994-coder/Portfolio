import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, studio } from '../src/projects.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'dist');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 18 6 6M6 17V6h11"/></svg>';
const mark = '<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M27 4h10v19.3l16.7-9.6 5 8.6L42 32l16.7 9.7-5 8.6L37 40.7V60H27V40.7l-16.7 9.6-5-8.6L22 32 5.3 22.3l5-8.6L27 23.3Z"/></svg>';

const header = `<header class="site-header page-width" id="top">
  <a class="brand" href="/" aria-label="LA Webs — לעמוד הבית"><span class="brand-name">LA<span> webs</span></span>${mark}</a>
  <button type="button" class="menu-toggle" aria-label="תפריט ניווט" aria-expanded="false" aria-controls="site-navigation"><span></span><span></span></button>
  <nav class="site-navigation" id="site-navigation" aria-label="ניווט ראשי"><a href="/#work">העבודות שלנו</a><a href="/#studio">הסטודיו</a><a class="nav-contact" href="#contact">נדבר על האתר שלכם ${arrow}</a></nav>
</header><noscript><style>@media(max-width:760px){.menu-toggle{display:none}.site-header{height:auto;position:relative;flex-wrap:wrap;padding-block:22px}.site-navigation{display:flex;position:static;width:100%;box-shadow:none;padding:15px 0 0;gap:5px}.site-navigation>a{font-size:16px}}</style></noscript>`;

const contact = `<section class="contact-section" id="contact" aria-labelledby="contact-title"><div class="page-width">
  <div class="contact-top"><p>הפרויקט הבא שלנו יכול להיות שלכם.</p>${mark}</div>
  <div class="contact-main"><h2 id="contact-title">יש לכם חזון?<br>בואו ניתן לו אתר.</h2><div class="contact-actions">
    <a class="contact-button" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="בואו נדבר בוואטסאפ — נפתח בחלון חדש">בואו נדבר בוואטסאפ ${arrow}</a>
    <a class="phone-link" href="tel:${studio.tel}"><span>או פשוט להתקשר</span><bdi>${studio.phone}</bdi></a>
  </div></div>
</div></section>`;

const footer = `<footer class="site-footer page-width"><div class="footer-row"><p>סטודיו לעיצוב ופיתוח אתרים. מהרעיון ועד לפרט האחרון.</p><nav class="footer-links" aria-label="ניווט בתחתית העמוד"><a href="/#work">עבודות</a><a href="/#studio">הסטודיו</a><a href="tel:${studio.tel}">יצירת קשר</a></nav></div>
  <div class="footer-wordmark" aria-hidden="true">LA webs ${mark}</div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} LA Webs. מעוצב ומפותח אצלנו.</span><a class="back-top" href="#top">בחזרה למעלה <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6"/></svg></a></div></footer>`;

function projectVisual(project) {
  const slug = project.slug;
  const screenshot = `<img src="/images/${slug}-${['libi','miryam'].includes(slug) ? 'mobile' : 'desktop'}.webp" width="${['libi','miryam'].includes(slug) ? '390' : '1440'}" height="${['libi','miryam'].includes(slug) ? '844' : '1000'}" alt="צילום האתר הפעיל של ${escape(project.hebrew)}" loading="lazy">`;
  const artwork = ['koral','libi','miryam'].includes(slug) ? `<img class="project-art" src="/images/${slug}-hero.webp" width="${slug==='koral'?'1536':'1200'}" height="${slug==='koral'?'1024':'1600'}" alt="" loading="lazy">` : '';
  const label = slug === 'libi' ? '<span class="project-label">ליבי<br>יהלומים.</span>' : slug === 'reuven' ? '<span class="project-label">דפוס<br>ראובן.<small>מהנייר, לדיגיטל.</small></span>' : '';
  return `<div class="project-visual project-${slug}" style="--project-color:${project.color}">${artwork}${label}<div class="project-device">${screenshot}</div><span class="project-open">${arrow}</span></div>`;
}

const cards = projects.map(project => `<article class="work-card" data-category="${project.category}"><a class="work-link" href="/work/${project.slug}/" aria-label="לפרויקט ${escape(project.hebrew)}">${projectVisual(project)}<div class="project-caption"><div><h3>${escape(project.hebrew)}</h3><p>${escape(project.categoryLabel)}</p></div>${arrow}</div></a></article>`).join('\n');

function page(title, description, body, extraClass = '') {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} | LA Webs</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#f5f3ed"><meta property="og:title" content="${escape(title)} | LA Webs"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="he_IL"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/noto-sans-hebrew.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.js"></script></head><body class="${extraClass}"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}</main>${footer}</body></html>`;
}

function casePage(project, next) {
  const mobile = project.slug === 'libi';
  const liveLink = `<a class="text-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר הפעיל של ${escape(project.hebrew)} — נפתח בחלון חדש">לאתר הפעיל ${arrow}</a>`;
  const cover = mobile ? `<div class="case-cover case-cover-libi"><img class="libi-cover-art" src="/images/libi-hero.webp" width="1200" height="1600" alt="טבעת יהלום מקטלוג ליבי"><img class="case-mobile" src="/images/libi-mobile.webp" width="390" height="844" alt="האתר הפעיל של ליבי יהלומים בתצוגת טלפון" fetchpriority="high"></div>` : `<div class="case-cover" style="--project-color:${project.color}"><img class="case-desktop" src="/images/${project.slug}-desktop.webp" width="1440" height="1000" alt="צילום מסך של האתר הפעיל של ${escape(project.hebrew)}" fetchpriority="high"></div>`;
  return page(`${project.hebrew} — ${project.headline}`, project.description, `
    <section class="case-intro page-width"><a class="back-link" href="/#work">${arrow} בחזרה לעבודות</a><div class="case-title-row"><h1>${escape(project.hebrew)}</h1>${liveLink}</div></section>
    ${cover}
    <section class="case-story page-width" aria-labelledby="case-story-title"><div><h2 id="case-story-title">${escape(project.headline)}</h2><p class="case-description">${escape(project.description)}</p><ul class="scope-list" aria-label="תחומי הפרויקט">${project.scope.map(scope=>`<li>${escape(scope)}</li>`).join('')}</ul></div><div class="case-story-body"><div><h3>המחשבה שמאחורי העיצוב</h3><p>${escape(project.idea)}</p></div><div><h3>מהעיצוב לחוויה עובדת</h3><p>${escape(project.build)}</p></div></div></section>
    <section class="case-mobile-section" aria-labelledby="case-mobile-title"><div class="case-mobile-copy"><h2 id="case-mobile-title">אותו אופי.<br>בכף היד.</h2><p>מבט מקרוב על גרסת המובייל של ${escape(project.hebrew)}. אפשר להמשיך לאתר הפעיל ולחוות אותו בעצמכם.</p>${liveLink}</div><img src="/images/${project.slug}-mobile.webp" width="390" height="844" alt="צילום תצוגת המובייל של ${escape(project.hebrew)}" loading="lazy"></section>
    <section class="next-project page-width"><a href="/work/${next.slug}/"><div><p>ממשיכים לפרויקט הבא</p><h2>${escape(next.hebrew)}</h2></div><span class="next-arrow">${arrow}</span></a></section>${contact}`, 'case-page');
}

function metadata(html, pathname) {
  const origin = process.env.SITE_ORIGIN;
  if (!origin) return html.replace('</head>', '<meta name="robots" content="noindex,nofollow"></head>');
  const url = new URL(pathname, origin).href;
  return html.replace('</head>', `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"></head>`);
}

export async function build() {
  await mkdir(destination, { recursive: true });
  await cp(resolve(root, 'public'), destination, { recursive: true });
  for (const file of ['styles.css','app.js']) await cp(resolve(root,'src',file),resolve(destination,file));
  let home = await readFile(resolve(root, 'src/index.html'), 'utf8');
  home = home.replace('<!--HEADER-->',header).replace('<!--PROJECTS-->',cards).replace('<!--CONTACT-->',contact).replace('<!--FOOTER-->',footer).replaceAll('<!--ARROW-->',arrow).replaceAll('<!--MARK-->',mark);
  await writeFile(resolve(destination,'index.html'),metadata(home,'/'));
  for (const [index, project] of projects.entries()) {
    const projectDir = resolve(destination,'work',project.slug);
    await mkdir(projectDir,{recursive:true});
    await writeFile(resolve(projectDir,'index.html'),metadata(casePage(project,projects[(index+1)%projects.length]),`/work/${project.slug}/`));
  }
  await writeFile(resolve(destination,'404.html'),page('העמוד לא נמצא','העמוד שחיפשתם לא נמצא. אפשר לחזור לעבודות של LA Webs.',`<section class="not-found page-width"><h1>העמוד הזה<br>קצת הלך לאיבוד.</h1><p>אבל העבודות שלנו עדיין כאן. אפשר לחזור לתיק העבודות ולמצוא משהו מעניין.</p><a class="text-link" href="/#work">בחזרה לעבודות ${arrow}</a></section>${contact}`));
  await writeFile(resolve(destination,'robots.txt'),process.env.SITE_ORIGIN ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',process.env.SITE_ORIGIN)}\n` : 'User-agent: *\nDisallow: /\n');
  if(process.env.SITE_ORIGIN) await writeFile(resolve(destination,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...projects.map(p=>`/work/${p.slug}/`)].map(path=>`<url><loc>${escape(new URL(path,process.env.SITE_ORIGIN).href)}</loc></url>`).join('')}</urlset>`);
  console.log(`Built homepage, ${projects.length} project pages, and 404 page.`);
}
if(process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
