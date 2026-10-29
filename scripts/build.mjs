import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projects, studio } from '../src/projects.mjs';
import { facts, isDraft, valueOf } from '../src/facts.mjs';
import { services } from '../src/seo-content.mjs';
import { enhanceSite } from './seo.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'dist');
const assetVersion = createHash('sha256').update(await readFile(resolve(root, 'src/styles.css'))).update(await readFile(resolve(root, 'src/app.js'))).digest('hex').slice(0, 12);
const captures = JSON.parse(await readFile(resolve(root, 'docs/project-longcaptures.json'), 'utf8')).projects
  .reduce((map, entry) => ({ ...map, [entry.name]: entry }), {});
// Written by scripts/check-live.mjs before a deploy. A project shows "באוויר" only while its last check passed.
let liveStatus = {};
try { liveStatus = JSON.parse(await readFile(resolve(root, 'docs/live-status.json'), 'utf8')).sites || {}; } catch { /* no check yet: no pills */ }

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 18 6 6M6 17V6h11"/></svg>';
const down = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>';
const check = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const cross = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
const arrowOut = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 7 7 17M7 7h10v10"/></svg>';
const chat = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.6.5-1.4 0-1.4-.7z"/></svg>';
const shareIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4m-4 4 4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/></svg>';
const arrowLeft = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const arrowRight = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
const brand = '<a class="brand" href="/" aria-label="LA webs — לעמוד הבית">LA<span>webs</span><i class="dot" aria-hidden="true"></i></a>';
const vars = p => `--bg:${p.colors.bg};--fg:${p.colors.fg};--accent:${p.colors.accent};--soft:${p.colors.soft}`;
function isLight(hex) { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150; }
const tone = p => isLight(p.colors.bg) ? 'row-light' : 'row-dark';

/* ---------- Facts and contact ---------- */
// A fact as HTML text. Draft (invented) values carry data-placeholder so check.mjs and deploy.ps1 refuse to publish them.
// Number ranges (9:00-19:00, 2-3) never break across lines.
const keepRanges = html => html.replace(/\d[\d:,]*-\d[\d:,]*/g, m => `<span class="keep-together">${m}</span>`);
const fact = (f, tag = 'span', attrs = '') => isDraft(f) ? `<${tag}${attrs} data-placeholder>${keepRanges(escape(f.value))}</${tag}>` : `<${tag}${attrs}>${keepRanges(escape(f))}</${tag}>`;
const draftAttr = f => isDraft(f) ? ' data-placeholder' : '';
const items = f => (valueOf(f) || []).map(text => ({ text, attr: draftAttr(f) }));
// An answer that states a policy: marked while it is a draft, and absent (null) once the fact is deleted.
const answer = f => f == null ? null : isDraft(f) ? `<span data-placeholder>${keepRanges(escape(f.value))}</span>` : keepRanges(escape(f));
const waNumber = studio.tel.replace('+', '');
const waHref = text => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
// Each location sends its own first message, so a conversation shows where it started (table: docs/whatsapp-prefills.md).
const prefill = {
  general: 'היי LA webs, ראיתי את האתר ואשמח לדבר על אתר לעסק שלי',
  other: 'היי LA webs, יש לי עסק בתחום ',
  demo: 'היי LA webs, ניסיתי את הדגמת ההזמנות באתר ואשמח למערכת כזו לעסק שלי',
  price: `היי LA webs, אשמח להצעה לאתר תדמית (החל מ-${facts.price.from} ₪)`,
  founder: `היי ${facts.founder.name.split(' ')[0]}, `,
  project: name => `היי LA webs, ראיתי את ${name} באתר ואשמח למשהו בסגנון הזה לעסק שלי`,
};
const wa = (cta, text = prefill.general) => `href="${escape(waHref(text))}" target="_blank" rel="noopener noreferrer" data-cta="${cta}"`;
const tel = cta => `href="tel:${studio.tel}" data-cta="${cta}"`;
const newTab = '— נפתח בחלון חדש';

/* ---------- Project presentation ---------- */
const isLive = slug => Boolean(liveStatus[slug]?.ok);
const liveTag = (p, { domain = true } = {}) => isLive(p.slug) ? `<span class="live-tag"><i aria-hidden="true"></i>באוויר${p.slug === 'pizza' ? ' · הדגמה' : domain ? `<span class="live-sep"> · </span><bdi>${escape(p.domain)}</bdi>` : ''}</span>` : '';
const statusTag = p => facts.status[p.slug] ? fact(facts.status[p.slug], 'span', ` class="status-tag${p.slug === 'pizza' ? ' is-demo' : ''}"`) : '';
// Work groups follow the four service pages, so each need has real examples behind it.
const needOf = { miryam: 'site', pinhas: 'site', sos: 'site', reuven: 'catalog', koral: 'system', seder: 'system', pdf: 'system', pizza: 'system' };
const needs = [
  { key: 'site', label: 'אתר או דף נחיתה', href: '/services/websites/' },
  { key: 'catalog', label: 'קטלוג מוצרים', href: '/services/catalogs/' },
  { key: 'system', label: 'הזמנות, הרשמה ומערכות', href: '/services/web-apps/' },
];

function comparison({ scrollDriven = false } = {}) {
  return `<div class="ba${scrollDriven ? ' ba-scroll' : ''}"${scrollDriven ? '' : ' style="--cut:50%"'}>
    <img class="ba-before" src="/images/miryam-before.webp" width="1000" height="1250" alt="לפני האיפור" loading="lazy" decoding="async">
    <img class="ba-after" src="/images/miryam-after.webp" width="1000" height="1250" alt="אחרי האיפור" loading="lazy" decoding="async">
    <span class="ba-handle" aria-hidden="true"></span>
    <span class="ba-tag ba-tag-before" aria-hidden="true">לפני</span><span class="ba-tag ba-tag-after" aria-hidden="true">אחרי</span>
    <label class="ba-control"><span class="sr-only">מיקום קו ההשוואה בין לפני האיפור לאחריו</span><input type="range" min="0" max="100" value="50"></label>
  </div>`;
}

/** A framed full-page capture of a live site. kind: browser | phone. */
function frame(project, kind, { loading = 'lazy', priority = false, vt = '', className = '', mobileImage = false, mobileSrc = null } = {}) {
  const capture = captures[project.slug];
  const isPhone = kind === 'phone';
  const shot = isPhone ? capture.mobileCapture : capture.desktopCapture;
  // The homepage shows desktop captures in a slot about 750px wide, so it uses the 900px copies.
  const small = !isPhone && className.includes('stack-browser');
  const src = `/images/${project.slug}-${isPhone ? 'mobile' : 'desktop'}-full${small ? '-900w' : ''}.webp`;
  const size = small ? { width: 900, height: Math.round(shot.height * 900 / shot.width) } : shot;
  const what = project.slug === 'pizza' ? `הדגמת מערכת ההזמנות ${project.hebrew}` : `האתר הפעיל של ${project.hebrew}`;
  const alt = `${what} בתצוגת ${isPhone ? 'טלפון' : 'מחשב'}, לאורך כל העמוד`;
  // Touring captures (.auto) are fetched by app.js shortly before they scroll into view, and only where they are shown.
  const deferred = className.includes('auto');
  const attrs = `width="${size.width}" height="${size.height}" loading="${loading}" decoding="async"${priority ? ' fetchpriority="high"' : deferred ? ' fetchpriority="low"' : ''}`;
  const image = mobileImage
    ? `<picture><source media="(max-width:760px)" srcset="${mobileSrc ? mobileSrc.src : `/images/${project.slug}-mobile-full.webp`}" width="${mobileSrc ? mobileSrc.width : capture.mobileCapture.width}" height="${mobileSrc ? mobileSrc.height : capture.mobileCapture.height}"><img src="${src}" alt="${escape(alt)}" ${attrs}></picture>`
    : deferred ? `<img data-src="${src}" alt="${escape(alt)}" ${attrs}><noscript><img src="${src}" alt="${escape(alt)}" ${attrs}></noscript>`
    : `<img src="${src}" alt="${escape(alt)}" ${attrs}>`;
  const chrome = isPhone ? '<span class="notch" aria-hidden="true"></span>' : `<span class="bar" aria-hidden="true"><i></i><i></i><i></i><bdi>${escape(project.domain)}</bdi></span>`;
  return `<div class="frame ${kind}${className ? ' ' + className : ''}"${vt ? ` style="view-transition-name:${vt}"` : ''}>${chrome}<div class="shot">${image}</div></div>`;
}

// Colour themes: 'paper' (ivory, charcoal, terracotta), 'cobalt' (cream, black, electric blue), 'night' (deep charcoal,
// hot coral) and 'night-cobalt' (deep charcoal, electric blue). THEME picks the build; ?theme=… previews any of them on
// the live site and sticks for the session, so two directions can be compared on real pages before one is chosen.
export const themes = { studio: '#f7f9fc', paper: '#f7f1e8', cobalt: '#f6f4ee', night: '#121110', 'night-cobalt': '#121110' };
export const theme = themes[process.env.THEME] ? process.env.THEME : 'studio';
const htmlOpen = `<html lang="he" dir="rtl" data-theme="${theme}">`;
const themeSwitch = `<script>(()=>{try{const q=new URLSearchParams(location.search).get('theme'),k='la-theme-studio-20261006',ok=${JSON.stringify(Object.keys(themes))};if(q&&ok.includes(q))sessionStorage.setItem(k,q);const t=sessionStorage.getItem(k);if(t&&ok.includes(t))document.documentElement.dataset.theme=t}catch{}})()</script>`;
// Hero test: ?hero=b sets the second line in Plex instead of Frank Ruhl Libre (variant A, the default) for the session.
const heroSwitch = `<script>(()=>{try{const q=new URLSearchParams(location.search).get('hero'),k='la-hero-20261018';if(q==='a'||q==='b')sessionStorage.setItem(k,q);const v=sessionStorage.getItem(k);if(v)document.documentElement.dataset.hero=v}catch{}})()</script>`;
function head(title, description, { pathname = '/', image = '/images/portfolio-shares-20261008/lawebs.png', themeColor = themes[theme] } = {}) {
  const origin = process.env.SITE_ORIGIN;
  const url = origin ? new URL(pathname, origin).href : null;
  return `<meta name="theme-color" content="${themeColor}">
  <meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="he_IL"><meta property="og:site_name" content="LA webs"><meta name="twitter:card" content="summary_large_image">
  ${url ? `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(new URL(image, origin).href)}">${image.endsWith('.jpg') ? '<meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' : ''}` : '<meta name="robots" content="noindex,nofollow">'}
  <link rel="icon" href="/la-monogram-32-v2.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/la-monogram-192-v2.png" type="image/png" sizes="192x192">
  <link rel="icon" href="/favicon.svg?v=${assetVersion}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/la-monogram-180-v2.png" sizes="180x180">
  <link rel="preload" href="/fonts/frank-ruhl-libre-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-hebrew-400-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/styles.css?v=${assetVersion}">
  <script>document.documentElement.classList.add('js')</script>${themeSwitch}${heroSwitch}
  <script type="module" src="/app.js?v=${assetVersion}"></script>`;
}

/* ---------- Header: the work, the demo, the price and who builds it; WhatsApp and the phone always one tap away ---------- */
const header = `<header class="site-header" id="top">
  ${brand}
  <nav class="site-nav" id="site-nav" aria-label="ניווט ראשי">
    <a href="/#work">העבודות</a><a href="/#demo">נסו בעצמכם</a><a href="/#price">מחירים</a><a href="/about/">מי בונה</a><a href="/#faq">שאלות</a>
    <a class="nav-tel" ${tel('header-tel')}><bdi>${studio.phone}</bdi></a>
    <a class="pill pill-cta" ${wa('header')} aria-label="נדבר בוואטסאפ ${newTab}">נדבר בוואטסאפ ${arrowOut}</a>
  </nav>
  <a class="call-button" ${tel('header-call')} aria-label="חיוג ל־${studio.phone}">${phoneIcon}</a>
  <button type="button" class="menu-toggle" aria-label="תפריט" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
</header>`;

const order = ['koral', 'miryam', 'pinhas', 'reuven', 'sos', 'seder', 'pdf', 'pizza'];
// The featured four have their own panel on the homepage; a hero card for one of them scrolls to that panel,
// so the visitor stays in the page's flow. Every other card opens its project page.
const featuredOrder = ['koral', 'miryam', 'pinhas', 'reuven'];
const heroTarget = slug => featuredOrder.includes(slug) ? `#project-${slug}` : `/work/${slug}/`;
const pauseIcon = '<svg class="i-pause" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>';
// The caption under a rotating hand: previous, pause and next, what the front project is, and a line to the next turn.
const cycle = first => `<div class="cycle"><span class="cycle-controls"><button type="button" class="cycle-step" data-step="-1" aria-label="העבודה הקודמת">${arrowRight}</button><button type="button" class="cycle-toggle" aria-pressed="false" aria-label="עצירת ההחלפה האוטומטית">${pauseIcon}</button><button type="button" class="cycle-step" data-step="1" aria-label="העבודה הבאה">${arrowLeft}</button></span><p class="cycle-text" aria-live="off" aria-atomic="true"><strong>${escape(first.hebrew)}</strong><span>${escape(first.kicker)}</span></p><span class="cycle-timer" aria-hidden="true"><i></i></span></div>`;
const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
const work = order.map(slug => bySlug[slug]);

// Phone hero: every live client site and product as a hand of cards, Miryam in front. The demo has its own chapter.
const handOrder = ['miryam', 'koral', 'pinhas', 'reuven', 'sos', 'seder', 'pdf'].map(slug => bySlug[slug]);
// The front card comes alive: its long phone capture is fetched only when that card is in front, then tours the site.
const live = p => `<img class="live" data-src="/images/${p.slug}-mobile-full.webp" width="${captures[p.slug].mobileCapture.width}" height="${captures[p.slug].mobileCapture.height}" alt="" decoding="async">`;
const hand = `<div class="hand is-waiting is-closed" role="group" aria-label="העבודות, כמו יד של קלפים">
  <ul class="hand-cards" role="list">${handOrder.map((p, i) => `<li class="hand-card ${tone(p)}" style="${vars(p)};--i:${i}" data-name="${escape(p.hebrew)}" data-kind="${escape(p.kicker)}"><a class="hand-link" href="${heroTarget(p.slug)}" draggable="false" aria-label="לפרויקט ${escape(p.hebrew)}"><span class="hand-face"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="" loading="eager" decoding="async" fetchpriority="${i === 0 ? 'high' : 'low'}">${liveTag(p, { domain: false })}</span><span class="hand-name"><span>${escape(p.hebrew)}</span><i aria-hidden="true"></i></span></a></li>`).join('')}<li class="hand-card hand-back" style="--i:${handOrder.length}" data-name="כל העבודות" data-kind="אתרים, מערכות וקטלוגים"><a class="hand-link" href="#work" draggable="false" aria-label="לכל העבודות"><span class="hand-face"><img class="hand-mark" src="/la-monogram-white.svg" width="960" height="960" alt="" decoding="async"></span><span class="hand-name"><span>כל העבודות</span><i aria-hidden="true"></i></span></a></li>
  </ul>
  ${cycle(handOrder[0])}
</div>`;

// Desktop hero: five real projects sharing one pivot, Miryam in the centre.
const desktopOrder = ['pinhas', 'koral', 'miryam', 'reuven', 'pizza'];
const desktopFan = `<ul class="desktop-fan" aria-label="חמש עבודות נבחרות">${desktopOrder.map((slug, i) => {
  const p = bySlug[slug];
  return `<li class="fan-card${i === 2 ? ' is-centre' : ''}" style="--angle:${(i - 2) * 10}deg;--layer:${5 - Math.abs(i - 2)};--delay:${Math.abs(i - 2) * 55}ms;--deal:${[0, 2, 4, 3, 1][i]};--spin:${(i - 2) * 7 + (i === 2 ? 3 : 0)}deg" data-name="${escape(p.hebrew)}" data-kind="${escape(p.kicker)}"><a class="fan-link" href="${heroTarget(slug)}" aria-label="לפרויקט ${escape(p.hebrew)}"><span class="fan-face"><img src="/images/${slug}-card-20261004.webp" width="585" height="820" alt="" loading="eager" decoding="async" fetchpriority="${i === 2 ? 'high' : 'low'}">${live(p)}${liveTag(p)}</span><span class="fan-label"><span>${escape(p.hebrew)}</span>${arrow}</span></a></li>`;
}).join('')}</ul>`;

/* ---------- Hero: a cobalt poster. One idea, the real work beside it, one action. ---------- */
const hero = `<section class="hero hero-poster" aria-labelledby="hero-title">
  <div class="wrap poster-grid">
    <div class="poster-copy">
      <h1 id="hero-title" class="poster-title"><span class="l1">קודם תראו,</span><span class="l2">אחר כך נדבר<span class="period">.</span></span></h1>
      <p class="poster-sub">בניית אתרים ומערכות לעסקים, בעיצוב אישי. כל קלף כאן הוא אתר שבאוויר עכשיו.</p>
      <div class="poster-actions" id="hero-actions"><a class="pill pill-light" ${wa('hero')} aria-label="נדבר בוואטסאפ ${newTab}">${chat} נדבר בוואטסאפ</a><a class="poster-tel" ${tel('hero-tel')}>או <bdi>${studio.phone}</bdi></a></div>
    </div>
    <div class="fan-stage">${desktopFan}${cycle(bySlug[desktopOrder[2]])}</div>
    ${hand}
  </div>
</section>`;

/* Every touring capture can be paused (WCAG 2.2.2); app.js also rests a tour while its panel is hovered or focused. */
const tourPause = '<svg class="i-pause" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>';
const tourToggle = name => `<button type="button" class="tour-toggle" aria-pressed="false" aria-label="עצירת הגלילה האוטומטית בתצוגה של ${escape(name)}">${tourPause}</button>`;

/* ---------- The work: four deep panels, the rest as rows, filtered by what the visitor needs ---------- */
const featured = [
  { slug: 'koral', line: 'ערבי נשים עם אווירה של קהילה. האירועים הקרובים, התמונות וההרשמה נמצאים במקום אחד, ונוחים מהטלפון.' },
  { slug: 'miryam', line: 'העבודות במרכז: גלריה נקייה, השוואת איפור לפני ואחרי ופנייה אישית לבדיקת תאריך פנוי.' },
  { slug: 'pinhas', line: 'נוכחות רצינית למשרד עורכי דין: תחומי עיסוק ברורים ודרך קצרה לפנייה. מי שמחפש עורך דין מבין מיד שהגיע למקום הנכון.' },
  { slug: 'reuven', line: 'קטלוג מסודר לבית דפוס: עמוד לכל מוצר ובקשת הצעת מחיר בכמה הקשות, גם מהטלפון.' },
];
const scopeOf = p => p.scope.slice(0, 3);
const needChips = `<div class="need-chips" role="group" aria-label="סינון העבודות לפי מה שצריך">
    <a class="need-chip" href="#work" data-need="all">הכול</a>${needs.map(n => `<a class="need-chip" href="${n.href}" data-need="${n.key}">${n.label}</a>`).join('')}
    <a class="need-chip need-other" ${wa('chip-other', prefill.other)} aria-label="משהו אחר? כתבו בוואטסאפ ${newTab}">משהו אחר? כתבו בוואטסאפ ${arrowOut}</a>
  </div>
  <p class="sr-only" id="work-status" aria-live="polite"></p>`;
const more = work.filter(p => !featuredOrder.includes(p.slug) && p.slug !== 'pizza');
const workRows = `<div class="more-work wrap" id="more">
    <h3 class="more-title">עוד עבודות</h3>
    <ul class="work-rows" role="list">${more.map(p => `<li class="work-row" data-need="${needOf[p.slug]}" style="--thumb:${p.colors.bg}">
      <span class="row-thumb" aria-hidden="true"><img src="/images/${p.slug}-card-20261004-150w.webp" width="150" height="210" alt="" loading="lazy" decoding="async"></span>
      <span class="row-body"><a class="row-link work-link" href="/work/${p.slug}/">${escape(p.hebrew)}</a><span class="row-kind">${escape(p.kicker)}</span><span class="row-meta">${statusTag(p)}${liveTag(p)}</span></span>
      <a class="row-out" href="${p.url}" target="_blank" rel="noopener noreferrer" data-cta="row-live" aria-label="לאתר של ${escape(p.hebrew)} ${newTab}">${arrowOut}</a>
    </li>`).join('')}</ul>
    <p class="need-system-note" data-need="system">רוצים לראות מערכת הזמנות בפעולה? <a href="#demo">נסו את הדגמת ההזמנות ${down}</a></p>
  </div>`;
const featuredSection = `<section class="featured" id="work" aria-labelledby="work-title">
  <header class="wrap featured-head">
    <h2 id="work-title" class="display">העבודות</h2>
    ${needChips}
  </header>
  <ol class="stack wrap" role="list">${featured.map(({ slug, line }, i) => {
    const p = bySlug[slug];
    return `<li class="stack-item ${tone(p)}" id="project-${slug}" data-need="${needOf[slug]}" style="${vars(p)};--n:${i}"><article class="stack-panel" aria-labelledby="stack-${slug}">
      <div class="stack-copy">
        <p class="stack-tags">${statusTag(p)}${liveTag(p)}</p>
        <h3 id="stack-${slug}" class="stack-name" style="view-transition-name:title-${slug}">${escape(p.hebrew)}</h3>
        <p class="stack-kind">${escape(p.kicker)}</p>
        <p class="stack-line">${escape(line)}</p>
        <ul class="scope" role="list" aria-label="מה נבנה">${scopeOf(p).map(s => `<li>${escape(s)}</li>`).join('')}</ul>
        <div class="stack-actions"><a class="pill" href="${p.url}" target="_blank" rel="noopener noreferrer" data-cta="panel-live" aria-label="לאתר החי של ${escape(p.hebrew)} ${newTab}">לאתר החי ${arrowOut}</a><a class="text-link" href="/work/${slug}/">איך זה נבנה ${arrow}</a></div>
        <a class="want-link" ${wa('panel', prefill.project(p.hebrew))} aria-label="רוצים משהו כזה? כמו ${escape(p.hebrew)}, כתבו בוואטסאפ ${newTab}">${chat} רוצים משהו כזה?</a>
      </div>
      <a class="stack-visual work-link" href="/work/${slug}/" tabindex="-1" aria-hidden="true">${frame(p, 'browser', { className: 'auto stack-browser' })}${frame(p, 'phone', { className: 'auto stack-phone' })}</a>
      ${tourToggle(p.hebrew)}
    </article></li>`;
  }).join('')}</ol>
  ${workRows}
</section>`;

/* ---------- Try it: the ordering demo, labelled as a demo everywhere it appears ---------- */
const pizza = bySlug.pizza;
const demoSection = `<section class="demo" id="demo" aria-labelledby="demo-title" style="${vars(pizza)}"><div class="wrap demo-grid">
  <div class="demo-copy">
    <p class="status-tag is-demo">פרויקט הדגמה · שום הזמנה לא נשלחת</p>
    <h2 id="demo-title" class="display">נסו בעצמכם:<br>הזמינו פיצה<span class="period">.</span></h2>
    <p class="demo-lede">מערכת ההזמנות הזו נבנתה ב־LA webs כהדגמה. בחרו גודל, הוסיפו תוספות לחצי פיצה ותראו את המחיר מתעדכן. שום הזמנה לא נשלחת ושום תשלום לא נגבה.</p>
    <ul class="demo-points" role="list"><li>${check}הפיצה נבנית מול העיניים</li><li>${check}תוספות לחצאים</li><li>${check}סל וקופה בטלפון</li></ul>
    <div class="demo-actions"><a class="pill pill-fire" href="${pizza.url}" target="_blank" rel="noopener noreferrer" data-cta="demo-open" aria-label="פתחו את ההדגמה של מערכת ההזמנות ${newTab}">פתחו את ההדגמה ${arrowOut}</a><a class="text-link" ${wa('demo', prefill.demo)} aria-label="רוצים מערכת כזו לעסק? כתבו בוואטסאפ ${newTab}">רוצים מערכת כזו לעסק?</a></div>
  </div>
  <a class="demo-visual" href="${pizza.url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><span class="demo-glow"></span>${frame(pizza, 'phone', { className: 'auto demo-phone' })}</a>
  ${tourToggle('הדגמת ההזמנות')}
</div></section>`;

/* ---------- Process: three steps shown with real artefacts only ---------- */
const shareTitle = 'בניית אתרים לעסקים ופיתוח אפליקציות | LA webs';
const scenes = [
  `<div class="pscene pscene-msg" aria-hidden="true">
    <span class="pscene-label">ההודעה שתישלח</span>
    <span class="msg-out">${escape(prefill.general)}<small>עכשיו</small></span>
  </div>`,
  `<div class="pscene pscene-build" aria-hidden="true">
    <span class="pscene-label">המחשה</span>
    <span class="wire-phone"><i class="w-bar"></i><i class="w-hero"></i><i class="w-line"></i><i class="w-line short"></i><i class="w-btn"></i></span>
    <span class="token t-colors"><i style="background:#244be8"></i><i style="background:#17243b"></i><i style="background:#e8edff"></i></span>
    <span class="token t-type"><b>אבג</b><small>Frank Ruhl</small></span>
  </div>`,
  `<div class="pscene pscene-share" aria-hidden="true">
    <span class="pscene-label">הלינק של האתר הזה, בוואטסאפ</span>
    <span class="share-card"><img src="/images/lawebs-share-preview-640.webp" width="640" height="640" alt="" loading="lazy" decoding="async"><span class="share-text"><b>${escape(shareTitle)}</b><small>בניית אתרים לעסקים, דפי נחיתה, קטלוגים ואפליקציות ווב בעיצוב אישי.</small><bdi>lawebs.co.il</bdi></span></span>
  </div>`,
];
const steps = [
  { title: 'הודעה אחת', text: 'כותבים מה העסק עושה ומה צריך. אפשר גם להתקשר.' },
  { title: 'רואים את האתר מתקדם', text: 'עיצוב שנבנה סביב העסק ופיתוח מאפס, בלי תבניות, ושלבים שאפשר לראות ולהגיב עליהם.', note: facts.process.build },
  { title: 'באוויר, ומוכן לשליחה', text: 'האתר עולה מהיר, מוכן לטלפון ולגוגל, ונראה טוב גם כששולחים את הלינק שלו בוואטסאפ.' },
].map((step, i) => ({ ...step, scene: scenes[i] }));
const included = [
  ['עיצוב אישי מאפס', 'בלי תבניות. כל פרט נבנה סביב העסק שלכם.'],
  ['מושלם בטלפון', 'מתוכנן קודם למסך הקטן, שם רוב הלקוחות יפגשו אותו.'],
  ['מהיר ומוכן לגוגל', 'נטען מהר, עם מבנה נקי שגוגל מבין.'],
  ['וואטסאפ וחיוג בלחיצה', 'הדרך הקצרה מלקוח מתעניין לשיחה איתכם.'],
  ['דומיין, אחסון ואבטחה', 'מעלים לאוויר ודואגים לכל השאר.'],
  ['ליווי אחרי ההשקה', 'שינויים ועדכונים כשהעסק צריך.'],
];
// What every site ships with, assembled on a phone as the list is read (landing page only). Decorative; the list carries it.
const lock = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z"/></svg>';
const statusIcons = '<svg viewBox="0 0 54 12" aria-hidden="true"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/><path d="M27.5 3.2a8.6 8.6 0 0 1 11 0l-1.3 1.4a6.6 6.6 0 0 0-8.4 0zM29.9 5.8a5.2 5.2 0 0 1 6.2 0L33 9.4z"/><rect x="42" y="1.5" width="10" height="9" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.1"/><rect x="43.6" y="3.1" width="6.8" height="5.8" rx="1.3"/></svg>';
const includedPhone = `<div class="inc-stage" aria-hidden="true">
    <div class="inc-phone">
      <span class="inc-screen">
        <span class="inc-skeleton"><i class="sk-logo"></i><i class="sk-hero"></i><i class="sk-line"></i><i class="sk-line short"></i></span>
        <span class="inc-page"><img src="/images/miryam-mobile-full.webp" width="585" height="7819" alt="" loading="lazy" decoding="async"></span>
        <span class="inc-status"><b>9:41</b>${statusIcons}</span>
        <span class="inc-island"></span>
        <span class="inc-load"></span>
        <span class="inc-url">${lock}<bdi>miryamzelig.co.il</bdi></span>
        <span class="inc-actions"><i class="wa">${chat} וואטסאפ</i><i class="call">${phoneIcon} חיוג</i></span>
        <span class="inc-toast"><i class="inc-app"><img src="/la-monogram-white.svg" width="16" height="16" alt="" loading="lazy"></i><span><b>LA webs <small>עכשיו</small></b><span>עדכנו את הגלריה באתר ✓</span></span></span>
      </span>
    </div>
    <span class="inc-chip"><b>G</b>מוכן לגוגל</span>
  </div>`;
const stepsList = ({ compact = false } = {}) => `<ol class="steps${compact ? ' steps-compact' : ''}" role="list">${steps.map((x, i) => `<li class="step reveal" style="--s:${i}">${compact ? '' : x.scene}<span class="step-n" aria-hidden="true">${i + 1}<i></i></span><h3 class="display">${x.title}</h3><p>${x.text}</p>${x.note ? fact(x.note, 'span', ' class="step-note"') : ''}</li>`).join('')}</ol>`;
const includedList = `<ul class="included-list" role="list">${included.map(([title, text]) => `<li class="reveal"><i class="inc-check" aria-hidden="true">${check}</i><strong>${title}</strong><span>${text}</span></li>`).join('')}</ul>`;
// Homepage: the three steps. The landing pages add what every site includes (with the phone on /lp/, compact on /lp/short/).
const processFor = ({ compact = false, withIncluded = false } = {}) => `<section class="process${compact ? ' process-compact' : ''}" id="process" aria-labelledby="process-title"><div class="wrap">
  <h2 id="process-title" class="display reveal">מתחיל בהודעה,<br>נגמר בלינק</h2>
  ${stepsList({ compact })}
  ${withIncluded ? `<div class="included${compact ? ' included-compact' : ''}">
    <h3 class="display included-title reveal">מה יש בכל אתר</h3>
    ${includedList}
    ${compact ? '' : includedPhone}
  </div>` : ''}
</div></section>`;
const processSection = processFor();

/* ---------- Founder: the person a visitor talks to ---------- */
const photo = facts.founder.photo;
const founderPhoto = isDraft(photo)
  ? '<span class="founder-placeholder" data-placeholder><img src="/la-monogram-white.svg" width="160" height="160" alt="" loading="lazy" decoding="async"><small>כאן תבוא תמונה אמיתית</small></span>'
  : photo ? `<img src="${photo.src}" width="${photo.width}" height="${photo.height}" alt="${escape(photo.alt)}" loading="lazy" decoding="async">` : '';
const factRows = () => [['רישום', facts.business.id], ['איפה', facts.business.area], ['מתי', facts.business.hours]].filter(([, f]) => f).map(([k, f]) => `<div><dt>${k}</dt>${fact(f, 'dd')}</div>`).join('');
const founderBlock = (headingTag = 'h2', id = 'founder-title') => `<div class="founder-grid">
  ${founderPhoto ? `<figure class="founder-photo">${founderPhoto}</figure>` : ''}
  <div class="founder-copy">
    <${headingTag} id="${id}" class="display">מדברים ישירות<br>עם מי שבונה</${headingTag}>
    <p class="founder-name">${fact(facts.founder.name, 'b')}${fact(facts.founder.role)}</p>
    ${facts.founder.lines ? `<div class="founder-lines">${items(facts.founder.lines).map(l => `<p${l.attr}>${escape(l.text)}</p>`).join('')}</div>` : ''}
    ${facts.commitments ? `<ul class="commitments" role="list">${items(facts.commitments).map(c => `<li${c.attr}>${check}${escape(c.text)}</li>`).join('')}</ul>` : ''}
    <dl class="business-facts">${factRows()}</dl>
    <a class="pill pill-cta" ${wa('founder', prefill.founder)} aria-label="לכתוב ל${escape(facts.founder.name.split(' ')[0])} בוואטסאפ ${newTab}">${chat} לכתוב ל${escape(facts.founder.name.split(' ')[0])} בוואטסאפ</a>
  </div>
</div>`;
// The chapter ships only with a photo: a real one, or the marked placeholder while it is a draft. photo: null drops it.
const founderSection = founderPhoto ? `<section class="founder" id="founder" aria-labelledby="founder-title"><div class="wrap">${founderBlock()}</div></section>` : '';

/* ---------- Prices and services: the number in the open, and the four kinds of work ---------- */
const serviceRows = `<ul class="service-rows" role="list">${services.map(s => {
  const info = facts.services[s.slug] || {};
  const price = info.from ? (isDraft(info.from) ? `<span class="service-price" data-placeholder>החל מ־${escape(info.from.value)} ₪</span>` : `<span class="service-price">החל מ־${escape(info.from)} ₪</span>`) : '<span class="service-price">לפי אפיון</span>';
  return `<li><a class="service-row" href="/services/${s.slug}/"><span class="service-name">${escape(s.name)}</span>${fact(info.line || s.intro, 'span', ' class="service-line"')}${price}<span class="service-arrow" aria-hidden="true">${arrowLeft}</span></a></li>`;
}).join('')}</ul>`;
const fitCard = (f, cls, title, icon) => items(f).length ? `<div class="fit-card ${cls}"><h3>${title}</h3><ul role="list">${items(f).map(x => `<li${x.attr}>${icon}${escape(x.text)}</li>`).join('')}</ul></div>` : '';
const fitCards = fitCard(facts.price.fit, 'is-yes', 'מתאים לכם אם…', check) + fitCard(facts.price.notFit, 'is-no', 'פחות מתאים אם…', cross);
const fitBlock = fitCards ? `<div class="fit">${fitCards}</div>` : '';
const priceSection = `<section class="pricing" id="price" aria-labelledby="price-title"><div class="wrap">
  <h2 id="price-title" class="display">כמה זה עולה?<br>הכול כתוב כאן</h2>
  <div class="price-grid">
    <article class="ticket" aria-labelledby="ticket-title">
      <p id="ticket-title" class="ticket-name">אתר תדמית לעסק</p>
      <p class="ticket-price"><span class="ticket-from">החל מ־</span><span class="ticket-amount">${fact(facts.price.from, 'b')}<span class="ticket-cur">₪</span></span></p>
      ${facts.price.vat ? fact(facts.price.vat, 'p', ' class="ticket-vat"') : ''}
      ${items(facts.price.includes).length ? `<ul class="ticket-list" role="list">${items(facts.price.includes).map(x => `<li${x.attr}>${check}${escape(x.text)}</li>`).join('')}</ul>` : ''}
      ${facts.price.changes ? `<p class="ticket-changes"><b>מה משנה את המחיר:</b> ${fact(facts.price.changes)}</p>` : ''}
      <p class="ticket-quote">הצעה מסודרת לפני שמתחילים.</p>
      <a class="pill pill-cta" ${wa('price', prefill.price)} aria-label="לקבל הצעה בוואטסאפ ${newTab}">${chat} לקבל הצעה בוואטסאפ</a>
    </article>
    ${fitBlock}
  </div>
  <div class="services" id="services">
    <h3 class="services-title">מה אפשר לבנות</h3>
    ${serviceRows}
  </div>
</div></section>`;

/* ---------- FAQ ---------- */
const questions = [
  facts.answers.timeline && ['כמה זמן לוקח לבנות אתר?', answer(facts.answers.timeline)],
  ['כמה זה עולה?', `אתר תדמית מתחיל ב־${answer(facts.price.from)} ₪. המחיר הסופי תלוי במה שהעסק צריך: מספר העמודים, מערכות כמו הזמנות או הרשמה, ותוכן. מקבלים הצעה מסודרת לפני שמתחילים. <a href="/#price">כל הפרטים על המחיר</a>`],
  ['מה קורה אחרי ששולחים הודעה?', facts.business.reply ? `${answer(facts.business.reply)} לשיחת היכרות קצרה, ואחריה מקבלים הצעה מסודרת. בלי עלות ובלי התחייבות.` : 'קובעים שיחת היכרות קצרה, ואחריה מקבלים הצעה מסודרת. בלי עלות ובלי התחייבות.'],
  ['מה צריך להכין?', 'לא חובה להכין כלום. מספיק לספר על העסק: את הטקסטים כותבים יחד, ואפשר לעבוד עם התמונות שיש לכם.'],
  ['האתר ייראה טוב בטלפון?', 'כל אתר מתוכנן קודם לטלפון, כי שם רוב הלקוחות שלכם יפגשו אותו. ואז גם למחשב, כמובן.'],
  facts.answers.ownership && ['למי שייכים האתר והדומיין?', answer(facts.answers.ownership)],
  facts.answers.changes && ['מה קורה כשצריך שינוי אחרי ההשקה?', answer(facts.answers.changes)],
  ['אפשר לחדש אתר קיים?', 'כן. שולחים קישור לאתר הקיים, ובשיחה מבינים מה כדאי לשמור, מה לשפר ומה לבנות מחדש.'],
  ['מה עם דומיין, אחסון וגוגל?', 'דואגים להכול: דומיין, אחסון, תעודת אבטחה והעלאה לאוויר. האתר נבנה מהיר ונקי, כדי שגוגל יבין אותו ולקוחות ימצאו אתכם.'],
].filter(Boolean);
const plus = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const faqFor = list => `<section class="faq" id="faq" aria-labelledby="faq-title"><div class="wrap faq-grid">
  <h2 id="faq-title" class="display reveal">שאלות<br>לפני שכותבים</h2>
  <div class="faq-list">${list.map(([q, a]) => `<details class="qa reveal"><summary><span>${q}</span>${plus}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`;
const faq = faqFor(questions);
// The short landing page keeps the five questions a visitor asks before writing.
const faqShort = faqFor(questions.filter(([q]) => ['כמה זמן', 'כמה זה', 'מה קורה אחרי', 'מה צריך', 'האתר ייראה'].some(start => q.startsWith(start))));

/* ---------- Closing: the deck returns around the visitor's own card, and one message composes itself ---------- */
// [what the chip says, what the message says]
const composerNeeds = [['אתר לעסק', 'אתר'], ['דף נחיתה', 'דף נחיתה'], ['קטלוג מוצרים', 'קטלוג מוצרים'], ['מערכת הזמנות או הרשמה', 'מערכת הזמנות או הרשמה'], ['עוד לא בטוחים', '']];
const composerDefault = 'היי LA webs, אשמח לשמוע על אתר לעסק שלי.';
const closingCards = ['koral', 'pinhas', 'reuven', 'pizza'].map(slug => bySlug[slug]);
const contact = `<section class="contact" id="contact" aria-labelledby="contact-title"><div class="wrap contact-grid">
  <div class="contact-copy">
    <h2 id="contact-title" class="display">העסק שלך<span class="period">.</span><br>האתר שמתאים לו<span class="period">.</span></h2>
    <div class="closing-deck" aria-hidden="true">${closingCards.map((p, i) => `<span class="closing-card" style="--k:${i}"><img src="/images/${p.slug}-card-20261004-300w.webp" width="300" height="421" alt="" loading="lazy" decoding="async"></span>`).join('')}<span class="closing-next"><span class="next-label">הקלף הבא: העסק שלכם</span><span class="next-wire" data-kind="site"><i class="nw-bar"></i><i class="nw-hero"></i><i class="nw-line"></i><i class="nw-line short"></i><i class="nw-grid"></i></span><b class="next-name"></b><small class="next-only">תצוגה בלבד</small></span></div>
  </div>
  <form class="composer" action="https://wa.me/${waNumber}" method="get" target="_blank" aria-labelledby="composer-title" data-cta="composer">
    <h3 id="composer-title" class="composer-title">ספרו בקצרה, וממשיכים בוואטסאפ</h3>
    <fieldset class="composer-q"><legend>מה צריך?</legend><span class="composer-chips">${composerNeeds.map(([label, say], i) => `<label class="chip"><input type="radio" name="need" value="${say}" data-kind="${['site', 'landing', 'catalog', 'system', 'site'][i]}"${i === 0 ? ' checked' : ''}><span>${label}</span></label>`).join('')}</span></fieldset>
    <fieldset class="composer-q"><legend>יש אתר היום?</legend><span class="composer-chips">${['כן', 'לא'].map(n => `<label class="chip"><input type="radio" name="has" value="${n}"><span>${n}</span></label>`).join('')}</span></fieldset>
    <label class="composer-field"><span>שם העסק <small>(לא חובה)</small></span><input name="biz" maxlength="60" autocomplete="organization" placeholder="למשל: פיצריית התנור"></label>
    <div class="composer-preview"><span>ההודעה שתישלח:</span><p class="composer-text">${composerDefault}</p></div>
    <input type="hidden" name="text" value="${composerDefault}">
    <button class="pill composer-send" type="submit">${chat} שליחה בוואטסאפ</button>
    <p class="composer-note">שום דבר לא נשמר באתר. ההודעה נפתחת אצלכם בוואטסאפ, ואתם שולחים.</p>
  </form>
  <div class="contact-alt">
    <a class="phone-link" ${tel('contact-tel')}><span>או בטלפון</span><bdi class="display">${studio.phone}</bdi></a>
    <p class="contact-note">שיחת היכרות קצרה, בלי עלות.${facts.business.hours ? ` ${fact(facts.business.hours)}.` : ''}${facts.business.direct ? ` ${fact(facts.business.direct)}.` : ''}</p>
  </div>
</div></section>`;
// The landing pages already end in their own form, so they keep the plain closing.
const contactSimple = `<section class="contact contact-simple" id="contact" aria-labelledby="contact-title"><div class="wrap">
  <div class="contact-copy">
  <h2 id="contact-title" class="display reveal">בואו נבנה<br>את האתר שלכם<span class="period">.</span></h2>
  <p class="contact-note reveal">שיחת היכרות קצרה, בלי עלות ובלי התחייבות.</p>
  </div>
  <div class="contact-actions reveal">
    <a class="pill pill-light" ${wa('lp-contact')} aria-label="נדבר בוואטסאפ ${newTab}">${chat} נדבר בוואטסאפ</a>
    <a class="phone-link" ${tel('lp-contact-tel')}><span>או בטלפון</span><bdi class="display">${studio.phone}</bdi></a>
  </div>
</div></section>`;

/* ---------- Footer, local facts and the contact bar ---------- */
const keep = ' class="keep-together"';
const footerFacts = ['<span class="keep-together">LA webs</span>', fact(facts.founder.name, 'span', keep), facts.business.id ? fact(facts.business.id, 'span', keep) : '', facts.business.area ? fact(facts.business.area) : '', facts.business.hours ? fact(facts.business.hours) : '', `<a ${tel('footer-tel')} class="keep-together"><bdi>${studio.phone}</bdi></a>`].filter(Boolean).join('<span aria-hidden="true"> · </span>');
const contactBar = `<nav class="lp-bar contact-bar" aria-label="יצירת קשר מהירה"><a ${wa('bar')} aria-label="וואטסאפ ${newTab}">${chat} וואטסאפ</a><a ${tel('bar-tel')}>${phoneIcon} חיוג</a></nav>`;
const footer = `<footer class="site-footer"><div class="wrap">
  <p class="footer-mark" aria-hidden="true">LA webs<i class="dot"></i></p>
  <p class="footer-facts">${footerFacts}</p>
  <nav class="footer-links" aria-label="ניווט בתחתית העמוד"><a href="/services/">השירותים</a><a href="/#work">העבודות</a><a href="/#price">מחירים</a><a href="/about/">מי בונה</a><a href="/#faq">שאלות</a><a ${wa('footer')}>וואטסאפ</a></nav>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} LA webs. עיצוב ופיתוח: LA webs.</span><span class="legal-links"><a href="/privacy/">מדיניות פרטיות</a><a href="/accessibility/">הצהרת נגישות</a></span><a class="back-top" href="#top">למעלה <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></a></div>
</div></footer>
${contactBar}
<div class="cursor" aria-hidden="true" data-label="לצפייה"></div>`;

function page({ title, description, body, bodyClass = '', pathname = '/', image, themeColor }) {
  return `<!doctype html>${htmlOpen}<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(description)}">${head(title, description, { pathname, image, themeColor })}</head><body class="${bodyClass}"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}</main>${footer}</body></html>`;
}

/** A project card in the project's own color: the phone capture rising from the bottom, name, domain and an arrow. */
function card(p, { className = '', withId = false } = {}) {
  return `<li class="work-card card ${tone(p)}${className ? ' ' + className : ''}"${withId ? ` id="project-${p.slug}"` : ''} style="${vars(p)}">
    <a class="card-link work-link" href="/work/${p.slug}/" aria-label="לפרויקט ${escape(p.hebrew)}${p.slug === 'pizza' ? ' (פרויקט הדגמה)' : ''}" draggable="false">
      <div class="card-shot"><span class="frame phone card-phone"><span class="shot"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="" loading="lazy" decoding="async"></span></span></div>
      <div class="card-copy"><div><h3 class="display" style="view-transition-name:title-${p.slug}">${escape(p.hebrew)}</h3><p class="card-domain">${p.slug === 'pizza' ? 'פרויקט הדגמה · ' : ''}<bdi>${escape(p.domain)}</bdi></p></div><span class="card-arrow">${arrow}</span></div>
    </a>
  </li>`;
}

/** Case pages: one-line carousel of the other projects. Native scroll-snap, swipe on touch, drag + arrows on desktop. */
function catalogStrip(items, { id = 'more' } = {}) {
  return `<section class="catalog" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap catalog-head">
    <h2 id="${id}-title" class="display reveal">עוד עבודות</h2>
    <div class="catalog-nav"><button type="button" class="strip-btn" data-dir="-1" aria-label="הקודם">${arrowRight}</button><button type="button" class="strip-btn" data-dir="1" aria-label="הבא">${arrowLeft}</button></div>
  </div>
  <ul class="strip" role="list">${items.map(p => card(p, { className: 'strip-item' })).join('')}</ul>
  <div class="strip-dots" aria-hidden="true">${items.map(() => '<i></i>').join('')}</div>
</section>`;
}

function casePage(project) {
  const others = order.filter(slug => slug !== project.slug).map(slug => bySlug[slug]);
  // The case page asks for the next project directly; the WhatsApp message names the project the visitor liked.
  const askText = project.slug === 'pizza' ? 'רוצים מערכת כזו?' : 'רוצים אתר כזה?';
  const ask = `<a class="pill pill-cta" ${wa('case', `היי LA webs, ראיתי את ${project.hebrew} באתר ואשמח ל${project.slug === 'pizza' ? 'מערכת כזו' : 'אתר כזה'} לעסק שלי`)} aria-label="${askText} לשיחה בוואטסאפ ${newTab}">${chat} ${askText}</a>`;
  const liveLink = `<a class="text-link" href="${project.url}" target="_blank" rel="noopener noreferrer" data-cta="case-live" aria-label="${project.slug === 'pizza' ? 'פתחו את ההדגמה' : 'לאתר החי'} של ${escape(project.hebrew)} ${newTab}">${project.slug === 'pizza' ? 'פתחו את ההדגמה' : 'לאתר החי'} ${arrowOut}</a>`;
  const share = `<button type="button" class="text-link share-button" data-share-title="${escape(`${project.hebrew} — LA webs`)}" hidden>${shareIcon} שלחו לשותף</button>`;
  const window = (kind, extra = {}) => frame(project, kind, { className: 'window', ...extra }).replace('<div class="shot">', `<div class="shot" tabindex="0" role="region" aria-label="${kind === 'phone' ? 'גלילה בתוך גרסת הטלפון' : 'גלילה בתוך גרסת המחשב'}">`);
  const beforeAfter = project.beforeAfter && project.beforeAfterPairChecked ? `
    <section class="case-ba wrap" aria-labelledby="ba-title">
      <div class="case-ba-copy"><h2 id="ba-title" class="display reveal">השוואת איפור<br>לפני ואחרי</h2><p class="case-ba-note">מתוך האתר של ${escape(project.hebrew)}: גררו את הקו כדי להשוות.</p></div>
      ${comparison()}
    </section>` : '';
  const demoNote = project.slug === 'pizza' ? '<p class="case-demo-note">פרויקט הדגמה: אפשר להזמין, לבחור תוספות ולהגיע לקופה, אבל שום הזמנה לא נשלחת ושום תשלום לא נגבה.</p>' : '';
  const body = `
    <section class="case-hero wrap">
      <a class="back-link" href="${featuredOrder.includes(project.slug) ? `/#project-${project.slug}` : project.slug === 'pizza' ? '/#demo' : '/#more'}">${arrowRight} כל העבודות</a>
      <p class="case-tags">${statusTag(project)}${liveTag(project)}</p>
      <h1 class="case-title display" style="view-transition-name:title-${project.slug}">${escape(project.hebrew)}</h1>
      <div class="case-hero-grid">
        <div class="case-intro"><p class="lede">${escape(project.description)}</p>${demoNote}</div>
        <div class="case-meta"><div class="case-actions">${ask}${liveLink}${share}<span class="sr-only" role="status" data-share-status></span></div></div>
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
    <section class="case-stage row ${tone(project)}" style="${vars(project)}" aria-label="האתר בתצוגת טלפון">
      <div class="wrap stage-grid">
        <div class="row-visual"><a class="row-shot-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="${project.slug === 'pizza' ? 'להדגמה' : 'לאתר הפעיל'} של ${escape(project.hebrew)} ${newTab}">${frame(project, 'phone', { className: 'float auto' })}</a></div>
      </div>
    </section>
    ${beforeAfter}
    ${catalogStrip(others)}
    ${contact}`;
  return page({ title: `${project.hebrew} — ${project.headline} | LA webs`, description: project.description, body, bodyClass: 'case', pathname: `/work/${project.slug}/`, image: ['miryam','pinhas','koral','seder','pdf','pizza'].includes(project.slug) ? `/images/portfolio-shares-20261008/${project.slug}.png` : `/images/${project.slug}-desktop-20261004.webp`, themeColor: project.colors.bg });
}

/* ---------- Privacy policy and accessibility statement ---------- */
const legalUpdated = '18 באוקטובר 2026';
const legalPages = [
  { path: 'privacy', title: 'מדיניות פרטיות | LA webs', h1: 'מדיניות פרטיות', description: 'איזה מידע נאסף באתר LA webs, איך משתמשים בו ואיך פונים בנושא פרטיות.', sections: [
    ['מי מפעיל את האתר', [`LA webs הוא סטודיו לעיצוב ופיתוח אתרים ומערכות. לכל שאלה בנושא פרטיות אפשר לפנות בטלפון או בוואטסאפ: <a href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a>.`]],
    ['איזה מידע נאסף', ['האתר לא שולח מידע אישי לשרת של LA webs. הטפסים באתר מנסחים הודעה ופותחים אותה בוואטסאפ שלכם, והמידע עובר רק אם תבחרו לשלוח אותה.', 'כשפונים בוואטסאפ או בטלפון, הפרטים שמסרתם משמשים רק כדי לחזור אליכם ולטפל בפנייה.']],
    ['מדידה ופרסום', ['באתר פועלים כלי מדידה שעוזרים להבין איך משתמשים בו. תגי פרסום של Google ו־Meta, כאשר הוגדרו, נטענים בדפי הנחיתה רק אחרי אישור מדידה. לחיצה על וואטסאפ או חיוג מעידה על כוונת פנייה ואינה מאשרת שהודעה נשלחה.', 'אפשר לבחור להמשיך בלי מדידת פרסום. לבחירה מחדש מחקו את נתוני האתר בדפדפן. אפשר לנהל את העדפות הפרסום של Google ב<a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">מרכז המודעות שלי</a>.']],
    ['שמירה וזכויות', ['LA webs לא מוכר מידע ולא מעביר אותו לגורמים אחרים, מלבד ספקי השירות שמפעילים את הכלים שצוינו כאן. אפשר לבקש לעיין במידע שמסרתם, לתקן אותו או למחוק אותו בפנייה בטלפון או בוואטסאפ.']],
    ['שינויים', ['אם המדיניות תשתנה, הגרסה המעודכנת תופיע בעמוד הזה עם תאריך העדכון.']],
  ] },
  { path: 'accessibility', title: 'הצהרת נגישות | LA webs', h1: 'הצהרת נגישות', description: 'הצהרת הנגישות של אתר LA webs: ההתאמות שבוצעו ופרטי רכז הנגישות.', sections: [
    ['המחויבות לנגישות', ['המטרה היא שכל אחד יוכל להשתמש באתר בנוחות, כולל אנשים עם מוגבלות. האתר נבנה בהתאם להנחיות התקן הישראלי 5568 ולהנחיות WCAG ברמה AA, ונבדק בכלים אוטומטיים ובבדיקה ידנית.']],
    ['ההתאמות באתר', ['ניווט מלא במקלדת עם סימון ברור של הרכיב הפעיל, וקישור "דלגו לתוכן" בתחילת כל עמוד.', 'מבנה כותרות, תוויות לטפסים ולכפתורים וטקסט חלופי לתמונות, לתמיכה בקוראי מסך.', 'ניגודיות צבעים לפי התקן, וגופנים שאפשר להגדיל בדפדפן.', 'כיבוד ההגדרה "הפחתת תנועה" במערכת ההפעלה, וכפתורים לעצירת התוכן המתחלף ולמעבר בין העבודות בראש העמוד.', 'התאמה מלאה לטלפון ולטאבלט.']],
    ['אם משהו לא נגיש', [`למרות המאמצים, ייתכן שחלק מהתכנים עדיין לא נגישים במלואם. אם נתקלתם בבעיה, אפשר לפנות לרכז הנגישות והיא תטופל. רכז הנגישות: ${escape(facts.founder.name)}, <a href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a> (טלפון או וואטסאפ).`]],
  ] },
];
const legalPage = l => page({ title: l.title, description: l.description, bodyClass: 'case', pathname: `/${l.path}/`, body: `<section class="legal wrap"><h1 class="display">${l.h1}<span class="period">.</span></h1><p class="legal-date">עודכן: ${legalUpdated}</p>${l.sections.map(([h, ps]) => `<h2>${h}</h2>${ps.map(p => `<p>${p}</p>`).join('')}`).join('')}</section>${contact}` });

/* ---------- Ads landing page (/lp/) ----------
   One goal (a conversation), no navigation leaks, headline matched to the ad group through ?t=, and a short form
   that writes the WhatsApp message for the visitor. Indexed with /lp/ as canonical (see seo.mjs) and built for paid traffic.
   /lp/short/ is the same page cut for a test against it: every project shown once (on phones the dealt deck under
   the headline is the work, with the four names under it linking to the live sites, and the separate works section
   is hidden), the process as three lines, the included list without the phone, five questions, and on phones the
   page ends in the form (no contact block). Google Ads can split traffic between the two final URLs. */
const lpNeeds = ['אתר תדמית', 'מערכת הזמנות', 'הרשמה לאירועים', 'קטלוג או חנות', 'עוד לא בטוחים'];
const lpVariants = {
  tadmit: { lines: ['בניית אתר תדמית', 'שנראה כמו העסק שלך'], need: 'אתר תדמית' },
  hazmanot: { lines: ['מערכת הזמנות אונליין', 'לעסק שלך'], need: 'מערכת הזמנות' },
  events: { lines: ['אתר והרשמה לאירועים', 'הכול במקום אחד'], need: 'הרשמה לאירועים' },
  catalog: { lines: ['קטלוג דיגיטלי', 'שעושה סדר במוצרים'], need: 'קטלוג או חנות' },
};
const lpDefault = { lines: ['אתר שנבנה לעסק שלך', 'ומביא אליו פניות'], need: lpNeeds[0] };
// Real client sites first; the ordering demo last, labelled, for the ordering ad group.
const lpProofOrder = ['miryam', 'koral', 'pinhas', 'pizza'];
// Google Ads: set GOOGLE_ADS_ID (AW-…) and GOOGLE_ADS_LEAD (AW-…/label) when building to load the tag and report leads.
function adsTag() {
  return '<script src="/ads-config.js"></script><script src="/ads-tracking.js" defer></script>';
}

// The lead form, written as a WhatsApp conversation: the studio asks one thing at a time and each answer becomes a
// sent bubble, ending with the ready message and the send button. app.js runs the conversation; without it (or with
// reduced motion) every question shows at once and it is an ordinary form. Desktop shows it beside the hero; phones
// show it after the work and the process, once there is proof.
const send = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';
const leadForm = (id, title = 'ספרו על העסק') => `
      <form class="lead" id="${id}" action="https://wa.me/${waNumber}" method="get" target="_blank" aria-labelledby="${id}-title">
        <h2 id="${id}-title" class="lead-title display">${title}<span class="period">.</span></h2>
        <div class="lead-chat">
          <div class="lead-chat-head" aria-hidden="true"><i class="chat-avatar"><img src="/la-monogram-white.svg" width="20" height="20" alt=""></i><b>LA webs</b><small>שיחת היכרות</small></div>
          <div class="lead-step">
            <label class="lead-q" for="${id}-n">היי, כאן LA webs. איך קוראים לך?</label>
            <span class="lead-a"><input id="${id}-n" name="n" autocomplete="name" required maxlength="60" placeholder="השם שלך" enterkeyhint="next"><button class="lead-next" type="button" aria-label="המשך">${send}</button></span>
          </div>
          <div class="lead-step">
            <label class="lead-q" for="${id}-b">נעים מאוד<span data-echo></span>! מה העסק ומה הוא עושה?</label>
            <span class="lead-a"><input id="${id}-b" name="b" required maxlength="80" placeholder="למשל: פיצרייה ברמת גן" enterkeyhint="next"><button class="lead-next" type="button" aria-label="המשך">${send}</button></span>
          </div>
          <fieldset class="lead-step" aria-labelledby="${id}-w">
            <p class="lead-q" id="${id}-w">ומה צריך?</p>
            <span class="lead-chips">${lpNeeds.map(need => `<label class="chip"><input type="radio" name="w" value="${need}"${need === lpDefault.need ? ' checked' : ''}><span>${need}</span></label>`).join('')}</span>
          </fieldset>
          <div class="lead-step lead-end">
            <p class="lead-q">מעולה! ההודעה מוכנה. שולחים, וממשיכים בוואטסאפ:</p>
            <p class="lead-bubble">היי LA webs, אשמח לשמוע על ${lpDefault.need} לעסק שלי.</p>
          </div>
          <span class="lead-typing" aria-hidden="true" hidden><i></i><i></i><i></i></span>
        </div>
        <input type="hidden" name="text" value="היי LA webs, אשמח לשמוע על אתר לעסק שלי.">
        <button class="pill pill-cta lead-submit" type="submit">${chat} שליחה בוואטסאפ</button>
        <p class="lead-note">ההודעה נפתחת אצלכם בוואטסאפ, ואתם שולחים. שיחת היכרות קצרה, בלי עלות ובלי התחייבות.</p>
      </form>`;

function landingPage({ short = false } = {}) {
  const title = 'בניית אתר לעסק — עיצוב אישי, מושלם בטלפון | LA webs';
  const description = 'אתרי תדמית, מערכות הזמנה וקטלוגים בעיצוב אישי, שנבנים מאפס ונראים מושלם בטלפון. שיחת היכרות קצרה, בלי עלות ובלי התחייבות.';
  const proof = lpProofOrder.map(slug => bySlug[slug]);
  const proofName = p => `${escape(p.hebrew)}${p.slug === 'pizza' ? ' · הדגמה' : ''}`;
  const body = `
  <header class="lp-header wrap">
    <span class="brand" aria-label="LA webs">LA<span>webs</span><i class="dot" aria-hidden="true"></i></span>
    <a class="lp-call" ${tel('lp-header-tel')}>${phoneIcon}<bdi>${studio.phone}</bdi></a>
  </header>
  <main id="main">
    <section class="lp-hero" aria-labelledby="lp-title"><div class="wrap lp-hero-grid">
      <div class="lp-copy hero-copy">
        <h1 id="lp-title" class="display brand-headline"><span data-l1>${lpDefault.lines[0]}</span><span><span data-l2>${lpDefault.lines[1]}</span><span class="period">.</span></span></h1>
        <p class="lede">עיצוב ופיתוח מאפס, בלי תבניות. שיחת היכרות קצרה, בלי עלות.</p>
        <ul class="lp-points" role="list"><li>${check}עיצוב אישי, סביב העסק שלכם</li><li>${check}מהיר, מושלם בטלפון ומוכן לגוגל</li>${studio.priceFrom ? `<li>${check}אתר תדמית החל מ־${escape(studio.priceFrom)} ₪</li>` : `<li>${check}וואטסאפ וחיוג בלחיצה אחת</li>`}</ul>
        <div class="hero-actions"><a class="pill pill-cta" ${wa('lp-hero')} aria-label="נדבר בוואטסאפ ${newTab}">${chat} נדבר בוואטסאפ</a><a class="text-link" ${tel('lp-hero-tel')}>או חייגו <bdi>${studio.phone}</bdi></a></div>
      </div>
      <div class="lead-deck">
      ${proof.map((p, i) => `<span class="deck-card" aria-hidden="true" style="${vars(p)};--d:${i};--r:${[-15, -6, 6, 15][i]}deg"><img src="/images/${p.slug}-card-20261004-300w.webp" width="300" height="421" alt="" decoding="async" fetchpriority="high"></span>`).join('')}
      ${leadForm('lead')}
      <a class="pill pill-cta lp-deck-cta" href="#lead-m">ספרו על העסק ${down}</a>
      </div>
      ${short ? `<ul class="deck-names" role="list" aria-label="האתרים שבקלפים">${proof.map(p => `<li><a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.slug === 'pizza' ? 'להדגמה' : 'לאתר'} של ${escape(p.hebrew)} ${newTab}">${proofName(p)} ${arrowOut}</a></li>`).join('')}</ul>` : ''}
      <script>(() => { const v = ${JSON.stringify(lpVariants)}[new URLSearchParams(location.search).get('t')]; if (!v) return;
        document.querySelector('[data-l1]').textContent = v.lines[0]; document.querySelector('[data-l2]').textContent = v.lines[1]; })();</script>
    </div></section>
    <section class="lp-work" aria-labelledby="lp-work-title"><div class="wrap">
      <h2 id="lp-work-title" class="display reveal">עבודות<br>שבאוויר עכשיו<span class="period">.</span></h2>
      <ul class="lp-cards" role="list" tabindex="0" aria-label="עבודות נבחרות (אפשר לגלול הצידה)">${proof.map(p => `<li class="lp-card reveal" style="${vars(p)}"><span class="lp-shot"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="מסך הפתיחה של ${escape(p.hebrew)} בטלפון" loading="lazy" decoding="async"></span><span class="lp-card-copy"><strong>${escape(p.hebrew)}</strong><span>${escape(p.kicker)}${p.slug === 'pizza' ? ' · פרויקט הדגמה' : ''}</span><a class="lp-card-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.slug === 'pizza' ? 'להדגמה' : 'לאתר'} של ${escape(p.hebrew)} ${newTab}">${p.slug === 'pizza' ? 'להדגמה' : 'לאתר'} ${arrowOut}</a></span></li>`).join('')}</ul>
    </div></section>
    ${processFor({ compact: short, withIncluded: true })}
    ${short ? faqShort : ''}
    <section class="lp-lead-m" aria-label="טופס פנייה"><div class="wrap">${leadForm('lead-m', 'הבא בתור: העסק שלך')}</div></section>
    <script>(() => { const v = ${JSON.stringify(lpVariants)}[new URLSearchParams(location.search).get('t')]; if (!v) return; // both forms exist now
      document.querySelectorAll('form.lead input[name="w"]').forEach(i => { if (i.value === v.need) i.checked = true; }); })();</script>
    ${short ? '' : faq}
    ${contactSimple}
  </main>
  <footer class="lp-footer wrap"><span>© ${new Date().getFullYear()} LA webs</span><span class="legal-links"><a href="/privacy/">מדיניות פרטיות</a><a href="/accessibility/">הצהרת נגישות</a></span><a href="/">לאתר הסטודיו ולכל העבודות</a></footer>
  <nav class="lp-bar" aria-label="יצירת קשר מהירה"><a ${wa('lp-bar')} aria-label="וואטסאפ ${newTab}">${chat} וואטסאפ</a><a ${tel('lp-bar-tel')}>${phoneIcon} חיוג</a></nav>`;
  return `<!doctype html>${htmlOpen}<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="noindex,follow">${head(title, description, { pathname: short ? '/lp/short/' : '/lp/' })}${adsTag()}</head><body class="lp${short ? ' lp-short' : ''}"><a class="skip-link" href="#main">דלגו לתוכן</a>${body}</body></html>`;
}

export async function build() {
  await mkdir(destination, { recursive: true });
  // Retire the removed Vee case page even when building over an older output.
  await rm(resolve(destination, 'work/vee'), { recursive: true, force: true });
  // These generated-image icons were replaced by the font-based monogram.
  // Remove stale copies too when rebuilding over an existing dist directory.
  for (const size of [32, 180, 192]) await rm(resolve(destination, `la-webs-icon-${size}.png`), { force: true });
  await cp(resolve(root, 'public'), destination, { recursive: true });
  for (const file of ['styles.css', 'app.js']) await cp(resolve(root, 'src', file), resolve(destination, file));
  let home = await readFile(resolve(root, 'src/index.html'), 'utf8');
  const homeTitle = home.match(/<title>(.*?)<\/title>/)[1];
  const homeDescription = home.match(/<meta name="description" content="(.*?)">/)[1];
  const sections = { HEAD: head(homeTitle, homeDescription), HEADER: header, HERO: hero, FEATURED: featuredSection, DEMO: demoSection, PROCESS: processSection, FOUNDER: founderSection, PRICE: priceSection, FAQ: faq, CONTACT: contact, FOOTER: footer, CURSOR: '' };
  home = home.replace('<html lang="he" dir="rtl">', htmlOpen).replace(/<!--([A-Z]+)-->/g, (marker, name) => name in sections ? sections[name] : marker);
  await writeFile(resolve(destination, 'index.html'), home.replace(/[\t ]+$/gm, ''));
  for (const project of projects) {
    const dir = resolve(destination, 'work', project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), casePage(project).replace(/[\t ]+$/gm, ''));
  }
  for (const l of legalPages) {
    await mkdir(resolve(destination, l.path), { recursive: true });
    await writeFile(resolve(destination, l.path, 'index.html'), legalPage(l).replace(/[	 ]+$/gm, ''));
  }
  await mkdir(resolve(destination, 'lp'), { recursive: true });
  await writeFile(resolve(destination, 'lp/index.html'), landingPage().replace(/[\t ]+$/gm, ''));
  await mkdir(resolve(destination, 'lp/short'), { recursive: true });
  await writeFile(resolve(destination, 'lp/short/index.html'), landingPage({ short: true }).replace(/[\t ]+$/gm, ''));
  await writeFile(resolve(destination, '404.html'), page({ title: 'העמוד לא נמצא | LA webs', description: 'העמוד שחיפשתם לא נמצא. אפשר לחזור לעבודות של LA webs.', body: `<section class="not-found wrap"><p class="kicker">404</p><h1 class="display">העמוד הזה<br>קצת הלך לאיבוד.</h1><p class="lede">אבל העבודות עדיין כאן.</p><a class="pill" href="/#work">לעבודות ${arrow}</a></section>${contact}`, bodyClass: 'case', pathname: '/404.html' }));
  await writeFile(resolve(destination, 'robots.txt'), process.env.SITE_ORIGIN ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', process.env.SITE_ORIGIN)}\n` : 'User-agent: *\nDisallow: /\n');
  if (process.env.SITE_ORIGIN) await writeFile(resolve(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...projects.map(p => `/work/${p.slug}/`)].map(path => `<url><loc>${escape(new URL(path, process.env.SITE_ORIGIN).href)}</loc></url>`).join('')}</urlset>`);
  await enhanceSite(destination);
  console.log(`Built homepage, ${projects.length} project pages, and 404 page.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
