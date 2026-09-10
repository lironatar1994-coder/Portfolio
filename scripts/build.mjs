import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, studio } from '../src/projects.mjs';
import { presentation } from '../src/presentation.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'dist');
const captures = JSON.parse(await readFile(resolve(root, 'docs/project-longcaptures.json'), 'utf8')).projects
  .reduce((map, entry) => ({ ...map, [entry.name]: entry }), {});

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const pad = n => String(n).padStart(2, '0');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 18 6 6M6 17V6h11"/></svg>';
const arrowOut = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 7 7 17M7 7h10v10"/></svg>';
const chat = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.6.5-1.4 0-1.4-.7z"/></svg>';
const brand = '<a class="brand" href="/" aria-label="LA webs — לעמוד הבית">LA<span>webs</span><i class="dot" aria-hidden="true"></i></a>';
const vars = p => `--bg:${p.colors.bg};--fg:${p.colors.fg};--accent:${p.colors.accent};--soft:${p.colors.soft}`;
function isLight(hex) { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150; }
const tone = p => isLight(p.colors.bg) ? 'row-light' : 'row-dark';

function comparison({ scrollDriven = false } = {}) {
  return `<div class="ba${scrollDriven ? ' ba-scroll' : ''}"${scrollDriven ? '' : ' style="--cut:50%"'}>
    <img class="ba-before" src="/images/miryam-before.webp" width="1000" height="1250" alt="לפני האיפור" loading="lazy" decoding="async">
    <img class="ba-after" src="/images/miryam-after.webp" width="1000" height="1250" alt="אחרי האיפור" loading="lazy" decoding="async">
    <span class="ba-handle" aria-hidden="true"></span>
    <span class="ba-tag ba-tag-before" aria-hidden="true">לפני</span><span class="ba-tag ba-tag-after" aria-hidden="true">אחרי</span>
    <label class="ba-control"><span class="sr-only">מיקום קו ההשוואה בין לפני לאחרי</span><input type="range" min="0" max="100" value="50"></label>
  </div>`;
}

function showcase(project) {
  const link = content => `<a class="row-shot-link work-link" href="/work/${project.slug}/" aria-label="לפרויקט ${escape(project.hebrew)}">${content}</a>`;
  if (project.slug === 'koral') return link(frame(project, 'browser', { vt: 'cover-koral' }) + frame(project, 'phone', { className: 'float' }));
  if (project.beforeAfter) return `<div class="stage-duo">${link(frame(project, 'phone', { vt: 'cover-miryam', className: 'lead' }))}<div class="showcase-comparison">${comparison({ scrollDriven: true })}<p class="visual-caption">גללו או גררו כדי לראות את השינוי</p></div></div>`;
  return link(frame(project, 'browser', { vt: `cover-${project.slug}`, className: 'wide' }) + frame(project, 'phone', { className: 'float only-mobile' }));
}

/** A framed full-page capture of a live site. kind: browser | phone. */
function frame(project, kind, { loading = 'lazy', priority = false, vt = '', className = '', mobileImage = false, mobileSrc = null } = {}) {
  const capture = captures[project.slug];
  const isPhone = kind === 'phone';
  const shot = isPhone ? capture.mobileCapture : capture.desktopCapture;
  const src = `/images/${project.slug}-${isPhone ? 'mobile' : 'desktop'}-full.webp`;
  const alt = isPhone ? `האתר הפעיל של ${project.hebrew} בתצוגת טלפון, לאורך כל העמוד` : `האתר הפעיל של ${project.hebrew} בתצוגת מחשב, לאורך כל העמוד`;
  const attrs = `width="${shot.width}" height="${shot.height}" loading="${loading}" decoding="async"${priority ? ' fetchpriority="high"' : ''}`;
  const image = mobileImage
    ? `<picture><source media="(max-width:760px)" srcset="${mobileSrc ? mobileSrc.src : `/images/${project.slug}-mobile-full.webp`}" width="${mobileSrc ? mobileSrc.width : capture.mobileCapture.width}" height="${mobileSrc ? mobileSrc.height : capture.mobileCapture.height}"><img src="${src}" alt="${escape(alt)}" ${attrs}></picture>`
    : `<img src="${src}" alt="${escape(alt)}" ${attrs}>`;
  const chrome = isPhone ? '<span class="notch" aria-hidden="true"></span>' : `<span class="bar" aria-hidden="true"><i></i><i></i><i></i><bdi>${escape(project.domain)}</bdi></span>`;
  return `<div class="frame ${kind}${className ? ' ' + className : ''}"${vt ? ` style="view-transition-name:${vt}"` : ''}>${chrome}<div class="shot">${image}</div></div>`;
}

function head(title, description, { pathname = '/', image = '/images/koral-desktop.webp', themeColor = '#fbfaf7' } = {}) {
  const origin = process.env.SITE_ORIGIN;
  const url = origin ? new URL(pathname, origin).href : null;
  return `<meta name="theme-color" content="${themeColor}">
  <meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
  ${url ? `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(new URL(image, origin).href)}">` : '<meta name="robots" content="noindex,nofollow">'}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/frank-ruhl-libre-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-hebrew-400-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles.css">
  <script>document.documentElement.classList.add('js')</script>
  <script type="module" src="/app.js"></script>`;
}

const header = `<header class="site-header" id="top">
  ${brand}
  <nav class="site-nav" id="site-nav" aria-label="ניווט ראשי">
    <a href="/#work">העבודות</a><a href="/#studio">הסטודיו</a><a href="/#contact">יצירת קשר</a>
    <a class="pill pill-cta" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">נדבר בוואטסאפ ${arrowOut}</a>
    <a class="nav-phone" href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a>
  </nav>
  <button type="button" class="menu-toggle" aria-label="תפריט" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
</header>`;

const flagship = projects[0];
const order = ['koral', 'miryam', 'pinhas', 'libi', 'reuven'];
const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
const pinned = order.slice(0, 3).map(slug => bySlug[slug]);
const cards = order.slice(3).map(slug => bySlug[slug]);
const swapWords = ['מושקע', 'מעוצב', 'מדויק', 'מהיר', 'מצליח'];
const heroMobile = { src: '/images/koral-hero-mobile.webp', width: 585, height: 1400 };

const hero = `<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">סטודיו לעיצוב ופיתוח אתרים</p>
      <h1 id="hero-title" class="display" aria-label="נבנה לעסק שלך אתר תדמית ${swapWords[0]}.">נבנה לעסק שלך<br>אתר תדמית <span class="swap-group"><span class="swap" aria-hidden="true">${swapWords.map((w, i) => `<span class="swap-word${i === 0 ? ' is-active' : ''}">${w}</span>`).join('')}<i class="swap-line"></i></span><span class="period">.</span></span></h1>
      <p class="lede">אנחנו <bdi>LA webs</bdi>. כל אתר כאן נכתב מאפס סביב העסק שמאחוריו, וכולם חיים באוויר.</p>
      <div class="hero-actions"><a class="pill pill-cta" href="#work">לעבודות ${arrow}</a><a class="text-link" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">נדבר בוואטסאפ ${arrowOut}</a></div>
      <p class="hero-fact">אתרים באוויר, לא הדמיות. אפס תבניות.</p>
    </div>
    <a class="hero-shot work-link" href="/work/${flagship.slug}/" aria-label="לפרויקט ${escape(flagship.hebrew)}">
      ${frame(flagship, 'browser', { loading: 'eager', priority: true, className: 'hero-frame', mobileImage: true, mobileSrc: heroMobile })}
      ${frame(flagship, 'phone', { className: 'float hero-float' })}
      <span class="hero-caption"><span><strong>${escape(flagship.hebrew)}</strong> · ${escape(flagship.kicker)}</span><span class="hero-caption-link">לפרויקט ${arrow}</span></span>
    </a>
  </div>
  <nav class="hero-index wrap" aria-label="הפרויקטים בעמוד">
    <ol>${order.map((slug, i) => `<li><a href="#project-${slug}"><span class="idx-num">${pad(i + 1)}</span><span class="idx-label">${escape(bySlug[slug].short)}</span></a></li>`).join('')}</ol>
    <p class="hero-index-note">מבחר מהעבודות. גללו למטה.</p>
  </nav>
</section>`;

const down = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>';

// Pinned stage: page scroll while a project stays pinned, derived from the phone capture (shown ~300px wide)
// so the phone moves about 2.6x the page, clamped to roughly one screen.
function stageScroll(project) {
  const capture = captures[project.slug].mobileCapture;
  const content = (capture.height / 1.5) * (300 / 390);
  return Math.round(Math.max(600, content - 620) / 2.6);
}

const stages = pinned.map((p, i) => `<article class="row work-card project-${p.slug} stage-track ${tone(p)}${i % 2 ? ' flip' : ''}" id="project-${p.slug}" style="${vars(p)};--scroll:clamp(80svh,${stageScroll(p)}px,100svh)">
  <div class="stage">
    <div class="wrap stage-grid">
      <div class="row-copy">
        <p class="row-index"><span>${pad(i + 1)}</span></p>
        <p class="kicker">${escape(p.categoryLabel)}</p>
        <h3 class="row-title display" style="view-transition-name:title-${p.slug}">${escape(p.hebrew)}</h3>
        <p class="row-desc">${escape(presentation[p.slug].summary)}</p>
        <ul class="tags" aria-label="תחומי הפרויקט">${p.scope.map(s => `<li>${escape(s)}</li>`).join('')}</ul>
        <div class="row-links"><a class="pill work-link" href="/work/${p.slug}/">לפרויקט המלא ${arrow}</a><a class="text-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר החי של ${escape(p.hebrew)} — נפתח בחלון חדש"><bdi>${escape(p.domain)}</bdi> ${arrowOut}</a></div>
      </div>
      <div class="row-visual">
        ${showcase(p)}
      </div>
    </div>
    <span class="stage-bar" aria-hidden="true"><i></i></span>
    <p class="stage-cue" aria-hidden="true">גללו כדי לדפדף באתר ${down}</p>
  </div>
</article>`).join('\n');

const cardFor = (p, i) => `<article class="card work-card ${tone(p)}${p.mobileFirst ? ' mobile-first' : ''}" id="project-${p.slug}" style="${vars(p)}">
  <a class="card-link work-link" href="/work/${p.slug}/" aria-label="לפרויקט ${escape(p.hebrew)}">
    <div class="card-visual">${p.mobileFirst ? frame(p, 'phone', { vt: `cover-${p.slug}`, className: 'lead' }) : frame(p, 'browser', { vt: `cover-${p.slug}` })}</div>
    <div class="card-copy"><p class="row-index"><span>${pad(i + 4)}</span></p><p class="kicker">${escape(p.categoryLabel)}</p><h3 class="card-title display" style="view-transition-name:title-${p.slug}">${escape(p.hebrew)}</h3><p class="card-desc">${escape(presentation[p.slug].summary)}</p><span class="card-cta">לפרויקט המלא ${arrow}</span></div>
  </a>
  <a class="text-link card-live" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר החי של ${escape(p.hebrew)} — נפתח בחלון חדש"><bdi>${escape(p.domain)}</bdi> ${arrowOut}</a>
</article>`;
const more = `<section class="more wrap" aria-labelledby="more-title">
  <div class="more-head"><p class="kicker reveal">ועוד מהסטודיו</p><h3 id="more-title" class="display reveal">וגם קטלוגים.<br>אותה תשומת לב לפרטים.</h3><p class="more-note reveal">עברו עם העכבר על כרטיס כדי לדפדף באתר.</p></div>
  <div class="cards">${cards.map(cardFor).join('')}</div>
</section>`;

const rows = stages + more;

const contact = `<section class="contact" id="contact" aria-labelledby="contact-title"><div class="wrap">
  <p class="kicker reveal">בואו נדבר</p>
  <h2 id="contact-title" class="display reveal">יש לכם עסק?<br>מגיע לו אתר<br><span class="keep-together">עם אופי.</span></h2>
  <div class="contact-actions reveal">
    <a class="pill pill-light" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} נדבר בוואטסאפ</a>
    <a class="phone-link" href="tel:${studio.tel}"><span>או בטלפון</span><bdi>${studio.phone}</bdi></a>
  </div>
  <p class="contact-note reveal">מענה אישי, בלי טפסים ארוכים. מספרים לנו על העסק, ואנחנו חוזרים עם כיוון.</p>
</div></section>`;

const footer = `<footer class="site-footer"><div class="wrap">
  <div class="footer-row"><p>סטודיו לעיצוב ופיתוח אתרים. מהרעיון ועד לפרט האחרון.</p><nav class="footer-links" aria-label="ניווט בתחתית העמוד"><a href="/#work">העבודות</a><a href="/#studio">הסטודיו</a><a href="tel:${studio.tel}">טלפון</a><a href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">וואטסאפ</a></nav></div>
  <p class="footer-mark" aria-hidden="true">LA webs<i class="dot"></i></p>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} LA webs. מעוצב ומפותח אצלנו.</span><a class="back-top" href="#top">למעלה <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></a></div>
</div></footer>
<a class="wa-float" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat}<span>וואטסאפ</span></a>
<div class="cursor" aria-hidden="true" data-label="לצפייה"></div>`;

function page({ title, description, body, bodyClass = '', pathname = '/', image, themeColor }) {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(description)}">${head(title, description, { pathname, image, themeColor })}</head><body class="${bodyClass}"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}</main>${footer}</body></html>`;
}

function casePage(project, index) {
  const others = order.filter(slug => slug !== project.slug).map(slug => bySlug[slug]);
  const live = `<a class="pill" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר הפעיל של ${escape(project.hebrew)} — נפתח בחלון חדש">לאתר החי ${arrowOut}</a>`;
  const window = (kind, extra = {}) => frame(project, kind, { className: 'window', ...extra }).replace('<div class="shot">', `<div class="shot" tabindex="0" role="region" aria-label="${kind === 'phone' ? 'גלילה בתוך גרסת הטלפון' : 'גלילה בתוך גרסת המחשב'}">`);
  const beforeAfter = project.beforeAfter ? `
    <section class="case-ba wrap" aria-labelledby="ba-title">
      <div class="case-ba-copy"><p class="kicker reveal">מתוך האתר</p><h2 id="ba-title" class="display reveal">לפני. אחרי.</h2></div>
      ${comparison()}
    </section>` : '';
  const body = `
    <section class="case-hero wrap">
      <a class="back-link" href="/#project-${project.slug}">${arrow} כל העבודות</a>
      <p class="kicker">${escape(project.categoryLabel)}</p>
      <h1 class="case-title display" style="view-transition-name:title-${project.slug}">${escape(project.hebrew)}</h1>
      <div class="case-hero-grid">
        <p class="lede">${escape(project.description)}</p>
        <div class="case-meta"><ul class="tags" aria-label="תחומי הפרויקט">${project.scope.map(s => `<li>${escape(s)}</li>`).join('')}</ul><div class="case-actions">${live}<a class="text-link" href="${project.url}" target="_blank" rel="noopener noreferrer"><bdi>${escape(project.domain)}</bdi></a></div></div>
      </div>
    </section>
    <section class="case-views row ${tone(project)}${project.mobileFirst ? ' mobile-first' : ''}" style="${vars(project)}" aria-label="האתר בתצוגת מחשב ובתצוגת טלפון">
      <div class="wrap">
        <p class="views-hint">גללו בתוך המסכים. האתר כולו, מלמעלה למטה.</p>
        <div class="views-grid">
          <figure class="view view-desktop"><figcaption class="kicker">מחשב</figcaption>${window('browser', { vt: project.mobileFirst ? '' : `cover-${project.slug}` })}</figure>
          <figure class="view view-phone"><figcaption class="kicker">טלפון</figcaption>${window('phone', { vt: project.mobileFirst ? `cover-${project.slug}` : '' })}</figure>
        </div>
      </div>
    </section>
    <section class="case-stage row stage-track ${tone(project)}" style="${vars(project)};--scroll:clamp(80svh,${stageScroll(project)}px,100svh)" aria-label="האתר בתצוגת טלפון">
      <div class="stage">
        <div class="wrap stage-grid">
          <div class="row-copy"><p class="kicker">האתר בטלפון</p><p class="row-desc">גללו, והאתר מדפדף איתכם מלמעלה למטה.</p></div>
          <div class="row-visual"><a class="row-shot-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר הפעיל של ${escape(project.hebrew)} — נפתח בחלון חדש">${frame(project, 'phone', { className: 'float' })}</a></div>
        </div>
        <span class="stage-bar" aria-hidden="true"><i></i></span>
        <p class="stage-cue" aria-hidden="true">גללו כדי לדפדף באתר ${down}</p>
      </div>
    </section>
    ${beforeAfter}
    <section class="more-work" aria-labelledby="more-work-title">
      <div class="wrap more-work-head"><p class="kicker reveal">עוד עבודות</p><h2 id="more-work-title" class="display reveal">ממשיכים לדפדף.</h2><p class="strip-hint reveal">החליקו הצידה</p></div>
      <ul class="strip" role="list">${others.map(p => `<li class="strip-item"><a href="/work/${p.slug}/" class="strip-link"><div class="strip-shot" style="${vars(p)}"><span class="strip-frame"><img src="/images/${p.slug}-desktop.webp" width="1440" height="1000" alt="" loading="lazy" decoding="async"></span></div><div class="strip-copy"><h3 class="display">${escape(p.hebrew)}</h3><p>${escape(p.categoryLabel)}</p></div></a></li>`).join('')}</ul>
    </section>
    ${contact}`;
  return page({ title: `${project.hebrew} — ${project.headline} | LA webs`, description: project.description, body, bodyClass: 'case', pathname: `/work/${project.slug}/`, image: `/images/${project.slug}-desktop.webp`, themeColor: project.colors.bg });
}

export async function build() {
  await mkdir(destination, { recursive: true });
  await cp(resolve(root, 'public'), destination, { recursive: true });
  for (const file of ['styles.css', 'app.js']) await cp(resolve(root, 'src', file), resolve(destination, file));
  let home = await readFile(resolve(root, 'src/index.html'), 'utf8');
  const homeTitle = home.match(/<title>(.*?)<\/title>/)[1];
  const homeDescription = home.match(/<meta name="description" content="(.*?)">/)[1];
  home = home.replace('<!--HEAD-->', head(homeTitle, homeDescription)).replace('<!--HEADER-->', header).replace('<!--HERO-->', hero).replace('<!--ROWS-->', rows).replace('<!--CONTACT-->', contact).replace('<!--FOOTER-->', footer).replace('<!--CURSOR-->', '');
  await writeFile(resolve(destination, 'index.html'), home.replace(/[\t ]+$/gm, ''));
  for (const [index, project] of projects.entries()) {
    const dir = resolve(destination, 'work', project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), casePage(project, index).replace(/[\t ]+$/gm, ''));
  }
  await writeFile(resolve(destination, '404.html'), page({ title: 'העמוד לא נמצא | LA webs', description: 'העמוד שחיפשתם לא נמצא. אפשר לחזור לעבודות של LA webs.', body: `<section class="not-found wrap"><p class="kicker">404</p><h1 class="display">העמוד הזה<br>קצת הלך לאיבוד.</h1><p class="lede">אבל העבודות שלנו עדיין כאן.</p><a class="pill" href="/#work">לעבודות ${arrow}</a></section>${contact}`, bodyClass: 'case', pathname: '/404.html' }));
  await writeFile(resolve(destination, 'robots.txt'), process.env.SITE_ORIGIN ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', process.env.SITE_ORIGIN)}\n` : 'User-agent: *\nDisallow: /\n');
  if (process.env.SITE_ORIGIN) await writeFile(resolve(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...projects.map(p => `/work/${p.slug}/`)].map(path => `<url><loc>${escape(new URL(path, process.env.SITE_ORIGIN).href)}</loc></url>`).join('')}</urlset>`);
  console.log(`Built homepage, ${projects.length} project pages, and 404 page.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
