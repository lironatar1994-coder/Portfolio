import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { projects, studio } from '../src/projects.mjs';
import { presentation } from '../src/presentation.mjs';
import { enhanceSite } from './seo.mjs';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(root, 'dist');
const assetVersion = createHash('sha256').update(await readFile(resolve(root, 'src/styles.css'))).update(await readFile(resolve(root, 'src/app.js'))).digest('hex').slice(0, 12);
const captures = JSON.parse(await readFile(resolve(root, 'docs/project-longcaptures.json'), 'utf8')).projects
  .reduce((map, entry) => ({ ...map, [entry.name]: entry }), {});

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const pad = n => String(n).padStart(2, '0');
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 18 6 6M6 17V6h11"/></svg>';
const down = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>';
const check = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
const phoneIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';
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

/** A framed full-page capture of a live site. kind: browser | phone. */
function frame(project, kind, { loading = 'lazy', priority = false, vt = '', className = '', mobileImage = false, mobileSrc = null } = {}) {
  const capture = captures[project.slug];
  const isPhone = kind === 'phone';
  const shot = isPhone ? capture.mobileCapture : capture.desktopCapture;
  const src = `/images/${project.slug}-${isPhone ? 'mobile' : 'desktop'}-full.webp`;
  const alt = isPhone ? `האתר הפעיל של ${project.hebrew} בתצוגת טלפון, לאורך כל העמוד` : `האתר הפעיל של ${project.hebrew} בתצוגת מחשב, לאורך כל העמוד`;
  const attrs = `width="${shot.width}" height="${shot.height}" loading="${loading}" decoding="async"${priority ? ' fetchpriority="high"' : className.includes('auto') ? ' fetchpriority="low"' : ''}`;
  const image = mobileImage
    ? `<picture><source media="(max-width:760px)" srcset="${mobileSrc ? mobileSrc.src : `/images/${project.slug}-mobile-full.webp`}" width="${mobileSrc ? mobileSrc.width : capture.mobileCapture.width}" height="${mobileSrc ? mobileSrc.height : capture.mobileCapture.height}"><img src="${src}" alt="${escape(alt)}" ${attrs}></picture>`
    : `<img src="${src}" alt="${escape(alt)}" ${attrs}>`;
  const chrome = isPhone ? '<span class="notch" aria-hidden="true"></span>' : `<span class="bar" aria-hidden="true"><i></i><i></i><i></i><bdi>${escape(project.domain)}</bdi></span>`;
  return `<div class="frame ${kind}${className ? ' ' + className : ''}"${vt ? ` style="view-transition-name:${vt}"` : ''}>${chrome}<div class="shot">${image}</div></div>`;
}

function head(title, description, { pathname = '/', image = '/images/la-webs-share-20261004.jpg', themeColor = '#f7f1e8' } = {}) {
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
  <script>document.documentElement.classList.add('js')</script>
  <script type="module" src="/app.js?v=${assetVersion}"></script>`;
}

const header = `<header class="site-header" id="top">
  ${brand}
  <nav class="site-nav" id="site-nav" aria-label="ניווט ראשי">
    <a href="/#work">העבודות</a><a href="/#process">התהליך</a><a href="/#faq">שאלות</a><a href="/#contact">יצירת קשר</a>
    <a class="pill pill-cta" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">נדבר בוואטסאפ ${arrowOut}</a>
    <a class="nav-phone" href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a>
  </nav>
  <button type="button" class="menu-toggle" aria-label="תפריט" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
</header>`;

const order = ['pizza', 'koral', 'pinhas', 'miryam', 'libi', 'reuven', 'sos', 'seder', 'pdf'];
// The featured four have their own panel on the homepage; a hero card for one of them scrolls to that panel,
// so the visitor stays in the page's flow. Every other card opens its project page.
const featuredOrder = ['pizza', 'koral', 'pinhas', 'miryam'];
const heroTarget = slug => featuredOrder.includes(slug) ? `#project-${slug}` : `/work/${slug}/`;
const pauseIcon = '<svg class="i-pause" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg><svg class="i-play" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>';
// The caption under a rotating hand: what the front project is, a progress line to the next turn, and a pause button.
const cycle = first => `<div class="cycle"><button type="button" class="cycle-toggle" aria-pressed="false" aria-label="עצירת ההחלפה האוטומטית">${pauseIcon}</button><p class="cycle-text"><strong>${escape(first.hebrew)}</strong><span>${escape(first.kicker)}</span></p><span class="cycle-timer" aria-hidden="true"><i></i></span></div>`;
const bySlug = Object.fromEntries(projects.map(p => [p.slug, p]));
const work = order.map(slug => bySlug[slug]);

// Phone hero: the work as a hand of cards. Front card upright, the rest fanned behind; swipe to shuffle, tap to open.
const catalogOnly = ['sos', 'seder']; // in the work grid, not in the hero hand
const handOrder = work.filter(p => !catalogOnly.includes(p.slug));
// The front card comes alive: its long phone capture is fetched only when that card is in front, then tours the site.
const live = p => `<img class="live" data-src="/images/${p.slug}-mobile-full.webp" width="${captures[p.slug].mobileCapture.width}" height="${captures[p.slug].mobileCapture.height}" alt="" decoding="async">`;
const hand = `<div class="hand" role="group" aria-label="העבודות שלנו, כמו יד של קלפים">
  <ul class="hand-cards" role="list">${handOrder.map((p, i) => `<li class="hand-card ${tone(p)}" style="${vars(p)};--i:${i}" data-name="${escape(p.hebrew)}" data-kind="${escape(p.kicker)}"><a class="hand-link" href="${heroTarget(p.slug)}" draggable="false" aria-label="לפרויקט ${escape(p.hebrew)}"><span class="hand-face"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async"></span><span class="hand-name"><span>${escape(p.hebrew)}</span><i aria-hidden="true"></i></span></a></li>`).join('')}<li class="hand-card hand-back" style="--i:${handOrder.length}" data-name="כל העבודות" data-kind="אתרים, מערכות וקטלוגים"><a class="hand-link" href="#work" draggable="false" aria-label="לכל העבודות"><span class="hand-face"><img class="hand-mark" src="/la-monogram-white.svg" width="960" height="960" alt="" decoding="async"></span><span class="hand-name"><span>כל העבודות</span><i aria-hidden="true"></i></span></a></li>
  </ul>
  ${cycle(handOrder[0])}
</div>`;

// Four featured projects as full-colour panels that stack on desktop; each frame tours the live site by itself.
const featured = [
  { slug: 'pizza', line: 'מסך פתיחה שמריחים ממנו את התנור, ופיצה שמשתנה מול העיניים עם כל תוספת. מזמינים משלוח או איסוף בכמה הקשות.' },
  { slug: 'koral', line: 'ערבי נשים עם אווירה של קהילה. האירועים הקרובים, התמונות וההרשמה נמצאים במקום אחד, ונוחים מהטלפון.' },
  { slug: 'pinhas', line: 'נוכחות רצינית למשרד עורכי דין: תחומי עיסוק ברורים ודרך קצרה לפנייה. מי שמחפש עורך דין מבין מיד שהגיע למקום הנכון.' },
  { slug: 'miryam', line: 'העבודות במרכז: גלריה נקייה, השוואת לפני ואחרי ופנייה אישית לבדיקת תאריך פנוי.' },
];
const featuredSection = `<section class="featured" id="work" aria-labelledby="work-title">
  <header class="wrap featured-head"><h2 id="work-title" class="display reveal">העבודות<span class="period">.</span></h2></header>
  <ol class="stack wrap" role="list">${featured.map(({ slug, line }, i) => {
    const p = bySlug[slug];
    return `<li class="stack-item ${tone(p)}" id="project-${slug}" style="${vars(p)};--n:${i}"><article class="stack-panel" aria-labelledby="stack-${slug}">
      <div class="stack-copy">
        <h3 id="stack-${slug}" class="display stack-name" style="view-transition-name:title-${slug}">${escape(p.hebrew)}</h3>
        <p class="stack-kind">${escape(p.kicker)}</p>
        <p class="stack-line">${escape(line)}</p>
        <div class="stack-actions"><a class="pill" href="/work/${slug}/">לפרויקט ${arrow}</a><a class="text-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר החי של ${escape(p.hebrew)} — נפתח בחלון חדש">לאתר החי ${arrowOut}</a></div>
      </div>
      <a class="stack-visual work-link" href="/work/${slug}/" tabindex="-1" aria-hidden="true">${frame(p, 'browser', { className: 'auto stack-browser' })}${frame(p, 'phone', { className: 'auto stack-phone' })}</a>
    </article></li>`;
  }).join('')}<li class="stack-item stack-next" style="--n:${featured.length}"><article class="stack-panel" aria-labelledby="stack-next">
      <div class="stack-copy">
        <h3 id="stack-next" class="display stack-name">הבא בתור:<br>העסק שלך<span class="period">.</span></h3>
        <p class="stack-line">ספרו לנו על העסק בהודעה אחת, ונחזור אליכם עם כיוון ראשון לאתר שלכם.</p>
        <div class="stack-actions"><a class="pill" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} נדבר בוואטסאפ</a><a class="text-link" href="tel:${studio.tel}">או חייגו <bdi>${studio.phone}</bdi></a></div>
      </div>
      <div class="stack-visual next-visual" aria-hidden="true"><span class="next-card"><img src="/la-monogram-white.svg" width="960" height="960" alt="" loading="lazy" decoding="async"></span></div>
    </article></li></ol>
</section>`;

// How a project runs, in three steps. The sequence is the information, so the numerals stay. Each step acts itself
// out in a small looping scene, one story across the three: a pizzeria writes in, its design paints over the
// wireframe, and the site goes live and gets its first message. The scenes are decorative; the text carries it.
const pizzaShot = cls => `<img class="${cls}" src="/images/pizza-card-20261004-300w.webp" width="300" height="421" alt="" loading="lazy" decoding="async">`;
const scenes = [
  `<div class="scene scene-chat" aria-hidden="true">
    <span class="chat-head"><i class="chat-avatar"><img src="/la-monogram-white.svg" width="20" height="20" alt=""></i><b>LA webs</b><small>זמינים עכשיו</small></span>
    <span class="bubble sent b1">היי, יש לי פיצרייה ברמת גן</span>
    <span class="bubble sent b2">צריך אתר שיביא הזמנות</span>
    <span class="reply"><span class="bubble got typing"><i></i><i></i><i></i></span><span class="bubble got b3">מעולה! נדבר מחר ב-10?</span></span>
  </div>`,
  `<div class="scene scene-build" aria-hidden="true">
    <span class="mini-phone"><span class="wire"><i class="w-bar"></i><i class="w-hero"></i><i class="w-line"></i><i class="w-line short"></i><i class="w-btn"></i></span>${pizzaShot('paint')}<i class="scan"></i></span>
    <span class="token t-colors"><i style="background:#141614"></i><i style="background:#d2321f"></i><i style="background:#f4e6c8"></i></span>
    <span class="token t-type"><b>אבג</b><small>Heebo</small></span>
  </div>`,
  `<div class="scene scene-live" aria-hidden="true">
    <i class="live-glow"></i>
    <span class="mini-phone">${pizzaShot('shot-live')}</span>
    <span class="live-pill"><i></i>באוויר</span>
    <span class="live-chip c1">${check}מהיר</span>
    <span class="live-chip c2">${check}מוכן לגוגל</span>
    <span class="toast"><i class="toast-icon">${chat}</i><span><b>הודעה חדשה</b><small>היי, אפשר משלוח לרמת גן?</small></span></span>
  </div>`,
];
const steps = [
  { title: 'שיחה אחת.', text: 'מספרים לנו על העסק, על הלקוחות ועל מה שחשוב לכם. משם כבר ברור מה האתר צריך לעשות.' },
  { title: 'עיצוב ובנייה.', text: 'עיצוב שנבנה סביב העסק שלכם ופיתוח מאפס, בלי תבניות. רואים את האתר מתקדם לאורך כל הדרך.' },
  { title: 'עולים לאוויר.', text: 'האתר עולה מהיר, מוכן לטלפון ולגוגל. ואנחנו נשארים זמינים גם אחרי ההשקה.' },
].map((step, i) => ({ ...step, scene: scenes[i] }));
const included = [
  ['עיצוב אישי מאפס', 'בלי תבניות. כל פרט נבנה סביב העסק שלכם.'],
  ['מושלם בטלפון', 'מתוכנן קודם למסך הקטן, שם רוב הלקוחות יפגשו אותו.'],
  ['מהיר ומוכן לגוגל', 'נטען מהר, עם מבנה נקי שגוגל מבין.'],
  ['וואטסאפ וחיוג בלחיצה', 'הדרך הקצרה מלקוח מתעניין לשיחה איתכם.'],
  ['דומיין, אחסון ואבטחה', 'אנחנו מעלים לאוויר ודואגים לכל השאר.'],
  ['ליווי אחרי ההשקה', 'שינויים ועדכונים כשהעסק צריך.'],
];
// What every site ships with, assembled on a phone as the list is read: each item checks itself off and adds its part
// to a real site we built (Miryam Zelig): the design opens out of a skeleton, the page fits, a load bar runs, the
// contact bar rises, the address capsule drops in and a support notification arrives. Complete, the phone grows a
// little and browses the whole site by itself. Decorative; the list carries it.
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
const processSection = `<section class="process" id="process" aria-labelledby="process-title"><div class="wrap">
  <h2 id="process-title" class="display reveal">מרעיון<br>לאתר באוויר<span class="period">.</span></h2>
  <ol class="steps" role="list">${steps.map((x, i) => `<li class="step reveal" style="--s:${i}">${x.scene}<span class="step-n" aria-hidden="true">${i + 1}<i></i></span><h3 class="display">${x.title}</h3><p>${x.text}</p></li>`).join('')}</ol>
  <div class="included">
    <h3 class="display included-title reveal">ובכל אתר שיוצא מאיתנו<span class="period">:</span></h3>
    <ul class="included-list" role="list">${included.map(([title, text]) => `<li class="reveal"><i class="inc-check" aria-hidden="true">${check}</i><strong>${title}</strong><span>${text}</span></li>`).join('')}</ul>
    ${includedPhone}
  </div>
</div></section>`;

const questions = [
  ['כמה זמן לוקח לבנות אתר?', 'אתר תדמית עולה בדרך כלל תוך שבועות ספורים. מערכות כמו הזמנות או הרשמה לוקחות קצת יותר, ולוח הזמנים נקבע כבר בשיחה הראשונה.'],
  ['כמה זה עולה?', `${studio.priceFrom ? `אתר תדמית מתחיל ב-${studio.priceFrom} ₪. ` : ''}המחיר הסופי תלוי במה שהעסק צריך: מספר העמודים, מערכות כמו הזמנות או הרשמה, ותוכן. מקבלים הצעה מסודרת לפני שמתחילים, בלי הפתעות בדרך.`],
  ['מה קורה אחרי שאני שולח הודעה?', 'חוזרים אליכם באותו יום לשיחת היכרות קצרה, ואחריה מקבלים הצעה מסודרת. בלי עלות ובלי התחייבות.'],
  ['צריך להכין תוכן ותמונות?', 'לא חובה. מספיק לספר על העסק: את הטקסטים כותבים יחד, ואפשר לעבוד עם התמונות שיש לכם.'],
  ['האתר ייראה טוב בטלפון?', 'כל אתר מתוכנן קודם לטלפון, כי שם רוב הלקוחות שלכם יפגשו אותו. ואז גם למחשב, כמובן.'],
  ['אפשר לשנות דברים אחרי שהאתר עולה?', 'כן. אנחנו זמינים לעדכונים, לתוספות ולשינויים גם אחרי ההשקה, כדי שהאתר יגדל יחד עם העסק.'],
  ['מה עם דומיין, אחסון וגוגל?', 'אנחנו דואגים להכול: דומיין, אחסון, תעודת אבטחה והעלאה לאוויר. האתר נבנה מהיר ונקי, כדי שגוגל יבין אותו ולקוחות ימצאו אתכם.'],
];
const plus = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const faqFor = list => `<section class="faq" id="faq" aria-labelledby="faq-title"><div class="wrap faq-grid">
  <h2 id="faq-title" class="display reveal">שאלות<br>שחוזרות<span class="period">.</span></h2>
  <div class="faq-list">${list.map(([q, a]) => `<details class="qa reveal"><summary><span>${q}</span>${plus}</summary><p>${a}</p></details>`).join('')}</div>
</div></section>`;
const faq = faqFor(questions);
// The short landing page keeps the five questions a visitor asks before writing; hosting and later changes stay on the site.
const faqShort = faqFor(questions.filter(([q]) => !q.startsWith('אפשר לשנות') && !q.startsWith('מה עם דומיין')));

// Compact process for the short landing page: the three steps as lines and the included list without the phone.
const processCompact = `<section class="process process-compact" id="process" aria-labelledby="process-title"><div class="wrap">
  <h2 id="process-title" class="display reveal">מרעיון<br>לאתר באוויר<span class="period">.</span></h2>
  <ol class="steps steps-compact" role="list">${steps.map((x, i) => `<li class="step reveal" style="--s:${i}"><span class="step-n" aria-hidden="true">${i + 1}<i></i></span><h3 class="display">${x.title}</h3><p>${x.text}</p></li>`).join('')}</ol>
  <div class="included included-compact">
    <h3 class="display included-title reveal">ובכל אתר שיוצא מאיתנו<span class="period">:</span></h3>
    <ul class="included-list" role="list">${included.map(([title, text]) => `<li class="reveal"><i class="inc-check" aria-hidden="true">${check}</i><strong>${title}</strong><span>${text}</span></li>`).join('')}</ul>
  </div>
</div></section>`;

// Five real projects sharing one pivot. The centred card is the visible stack before opening, and comes alive once open.
const desktopOrder = ['miryam', 'koral', 'pizza', 'pinhas', 'libi'];
const desktopFan = `<ul class="desktop-fan" aria-label="חמש עבודות נבחרות">${desktopOrder.map((slug, i) => {
  const p = bySlug[slug];
  return `<li class="fan-card${i === 2 ? ' is-centre' : ''}" style="--angle:${(i-2)*14}deg;--layer:${5-Math.abs(i-2)};--delay:${Math.abs(i-2)*55}ms;--deal:${[0, 2, 4, 3, 1][i]};--spin:${(i - 2) * 7 + (i === 2 ? 3 : 0)}deg" data-name="${escape(p.hebrew)}" data-kind="${escape(p.kicker)}"><a class="fan-link" href="${heroTarget(slug)}" aria-label="לפרויקט ${escape(p.hebrew)}"><span class="fan-face"><img src="/images/${slug}-card-20261004.webp" width="585" height="820" alt="" loading="${i === 2 ? 'eager' : 'lazy'}" decoding="async"${i===2 ? ' fetchpriority="high"' : ''}>${live(p)}</span><span class="fan-label"><span>${escape(p.hebrew)}</span>${arrow}</span></a></li>`;
}).join('')}</ul>`;
const hero = `<section class="hero hero-centered" aria-labelledby="hero-title">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <h1 id="hero-title" class="display brand-headline"><span>העסק שלך<span class="period">.</span></span><span>האתר שמתאים לו<span class="period">.</span></span></h1>
      <p class="lede">אתרים ומערכות בעיצוב אישי, שנבנים מאפס ונראים מושלם בטלפון.</p>
      <div class="fan-stage">${desktopFan}${cycle(bySlug[desktopOrder[2]])}</div>
      <div class="hero-actions"><a class="pill pill-cta" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} נדבר בוואטסאפ</a><a class="text-link hero-work-link" href="#work">לעבודות ${down}</a></div>
    </div>
    ${hand}
  </div>
</section>`;

const arrowLeft = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
const arrowRight = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

/** A project card in the project's own color: the phone capture rising from the bottom, name, domain and an arrow. */
function card(p, { className = '', withId = false, summary = false } = {}) {
  return `<li class="work-card card ${tone(p)}${className ? ' ' + className : ''}"${withId ? ` id="project-${p.slug}"` : ''} style="${vars(p)}">
    <a class="card-link work-link" href="/work/${p.slug}/" aria-label="לפרויקט ${escape(p.hebrew)}" draggable="false">
      <div class="card-shot"><span class="frame phone card-phone"><span class="shot"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="" loading="lazy" decoding="async"></span></span></div>
      <div class="card-copy"><div><h3 class="display" style="view-transition-name:title-${p.slug}">${escape(p.hebrew)}</h3>${summary ? `<p class="card-desc">${escape(presentation[p.slug].summary)}</p>` : ''}<p class="card-domain"><bdi>${escape(p.domain)}</bdi></p></div><span class="card-arrow">${arrow}</span></div>
    </a>
  </li>`;
}

/** Home: the projects that are not featured, in the same swipeable strip the case pages use. */
const more = work.filter(p => !featured.some(f => f.slug === p.slug));

/** Case pages: one-line carousel of the other projects. Native scroll-snap, swipe on touch, drag + arrows on desktop. */
function catalogStrip(items, { id = 'more' } = {}) {
  return `<section class="catalog" id="${id}" aria-labelledby="${id}-title">
  <div class="wrap catalog-head">
    <h2 id="${id}-title" class="display reveal">עוד עבודות<span class="period">.</span></h2>
    <div class="catalog-nav"><button type="button" class="strip-btn" data-dir="-1" aria-label="הקודם">${arrowRight}</button><button type="button" class="strip-btn" data-dir="1" aria-label="הבא">${arrowLeft}</button></div>
  </div>
  <ul class="strip" role="list">${items.map(p => card(p, { className: 'strip-item' })).join('')}</ul>
  <div class="strip-dots" aria-hidden="true">${items.map(() => '<i></i>').join('')}</div>
</section>`;
}

const contact = `<section class="contact" id="contact" aria-labelledby="contact-title"><div class="wrap">
  <div class="contact-copy">
  <h2 id="contact-title" class="display reveal">בואו נבנה<br>את האתר שלכם<span class="period">.</span></h2>
  <p class="contact-note reveal">שיחת היכרות קצרה, בלי עלות ובלי התחייבות.</p>
  </div>
  <div class="contact-actions reveal">
    <a class="pill pill-light" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} נדבר בוואטסאפ</a>
    <a class="phone-link" href="tel:${studio.tel}"><span>או בטלפון</span><bdi class="display">${studio.phone}</bdi></a>
  </div>
</div></section>`;

const footer = `<footer class="site-footer"><div class="wrap">
  <p class="footer-mark" aria-hidden="true">LA webs<i class="dot"></i></p>
  <nav class="footer-links" aria-label="ניווט בתחתית העמוד"><a href="/#work">העבודות</a><a href="/#process">התהליך</a><a href="tel:${studio.tel}">טלפון</a><a href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer">וואטסאפ</a></nav>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} LA webs. מעוצב ומפותח אצלנו.</span><span class="legal-links"><a href="/privacy/">מדיניות פרטיות</a><a href="/accessibility/">הצהרת נגישות</a></span><a class="back-top" href="#top">למעלה <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></a></div>
</div></footer>
<a class="wa-float" href="${escape(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat}<span>וואטסאפ</span></a>
<div class="cursor" aria-hidden="true" data-label="לצפייה"></div>`;

function page({ title, description, body, bodyClass = '', pathname = '/', image, themeColor }) {
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(description)}">${head(title, description, { pathname, image, themeColor })}</head><body class="${bodyClass}"><a class="skip-link" href="#main">דלגו לתוכן</a>${header}<main id="main">${body}</main>${footer}</body></html>`;
}

function casePage(project, index) {
  const others = order.filter(slug => slug !== project.slug).map(slug => bySlug[slug]);
  // The case page asks for the next project directly; the WhatsApp message names the project the visitor liked.
  const ask = `<a class="pill pill-cta" href="${escape(`https://wa.me/${studio.tel.replace('+', '')}?text=${encodeURIComponent(`היי LA webs, ראיתי את ${project.hebrew} באתר שלכם ואשמח לאתר כזה לעסק שלי.`)}`)}" target="_blank" rel="noopener noreferrer" aria-label="רוצים אתר כזה? לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} רוצים אתר כזה?</a>`;
  const live = `<a class="text-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר הפעיל של ${escape(project.hebrew)} — נפתח בחלון חדש">לאתר החי ${arrowOut}</a>`;
  const window = (kind, extra = {}) => frame(project, kind, { className: 'window', ...extra }).replace('<div class="shot">', `<div class="shot" tabindex="0" role="region" aria-label="${kind === 'phone' ? 'גלילה בתוך גרסת הטלפון' : 'גלילה בתוך גרסת המחשב'}">`);
  const beforeAfter = project.beforeAfter ? `
    <section class="case-ba wrap" aria-labelledby="ba-title">
      <div class="case-ba-copy"><h2 id="ba-title" class="display reveal">לפני. אחרי.</h2></div>
      ${comparison()}
    </section>` : '';
  const body = `
    <section class="case-hero wrap">
      <a class="back-link" href="/#project-${project.slug}">${arrowRight} כל העבודות</a>
      <h1 class="case-title display" style="view-transition-name:title-${project.slug}">${escape(project.hebrew)}</h1>
      <div class="case-hero-grid">
        <p class="lede">${escape(project.description)}</p>
        <div class="case-meta"><div class="case-actions">${ask}${live}</div></div>
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
        <div class="row-visual"><a class="row-shot-link" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר הפעיל של ${escape(project.hebrew)} — נפתח בחלון חדש">${frame(project, 'phone', { className: 'float auto' })}</a></div>
      </div>
    </section>
    ${beforeAfter}
    ${catalogStrip(others)}
    ${contact}`;
  return page({ title: `${project.hebrew} — ${project.headline} | LA webs`, description: project.description, body, bodyClass: 'case', pathname: `/work/${project.slug}/`, image: `/images/${project.slug}-desktop-20261004.webp`, themeColor: project.colors.bg });
}

/* ---------- Privacy policy and accessibility statement ---------- */
const legalUpdated = '4 באוקטובר 2026';
const legalPages = [
  { path: 'privacy', title: 'מדיניות פרטיות | LA webs', h1: 'מדיניות פרטיות', description: 'איזה מידע נאסף באתר LA webs, איך משתמשים בו ואיך פונים אלינו בנושא פרטיות.', sections: [
    ['מי אנחנו', [`LA webs הוא סטודיו לעיצוב ופיתוח אתרים ומערכות. לכל שאלה בנושא פרטיות אפשר לפנות בטלפון או בוואטסאפ: <a href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a>.`]],
    ['איזה מידע נאסף', ['האתר לא שולח מידע אישי לשרת שלנו. הטופס בדף הנחיתה מנסח הודעה ופותח אותה בוואטסאפ שלכם, והמידע עובר אלינו רק אם תבחרו לשלוח אותה.', 'כשאתם פונים אלינו בוואטסאפ או בטלפון, נשתמש בפרטים שמסרתם רק כדי לחזור אליכם ולטפל בפנייה.']],
    ['מדידה ופרסום', ['אנחנו משתמשים בכלי מדידה כדי להבין איך משתמשים באתר, ובתג של Google Ads כדי למדוד פניות שמגיעות מפרסום. הכלים האלה עשויים להשתמש בעוגיות ובמזהים דומים.', 'אפשר לנהל את העדפות הפרסום של Google ב<a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">מרכז המודעות שלי</a>, ולחסום או למחוק עוגיות בהגדרות הדפדפן.']],
    ['שמירה וזכויות', ['איננו מוכרים מידע ואיננו מעבירים אותו לגורמים אחרים, מלבד ספקי השירות שמפעילים את הכלים שצוינו כאן. אפשר לבקש לעיין במידע שמסרתם, לתקן אותו או למחוק אותו בפנייה אלינו.']],
    ['שינויים', ['אם המדיניות תשתנה, הגרסה המעודכנת תופיע בעמוד הזה עם תאריך העדכון.']],
  ] },
  { path: 'accessibility', title: 'הצהרת נגישות | LA webs', h1: 'הצהרת נגישות', description: 'הצהרת הנגישות של אתר LA webs: ההתאמות שבוצעו ופרטי רכז הנגישות.', sections: [
    ['המחויבות שלנו', ['אנחנו רוצים שכל אחד יוכל להשתמש באתר בנוחות, כולל אנשים עם מוגבלות. האתר נבנה בהתאם להנחיות התקן הישראלי 5568 ולהנחיות WCAG ברמה AA, ונבדק בכלים אוטומטיים ובבדיקה ידנית.']],
    ['ההתאמות באתר', ['ניווט מלא במקלדת עם סימון ברור של הרכיב הפעיל, וקישור "דלגו לתוכן" בתחילת כל עמוד.', 'מבנה כותרות, תוויות לטפסים ולכפתורים וטקסט חלופי לתמונות, לתמיכה בקוראי מסך.', 'ניגודיות צבעים לפי התקן, וגופנים שאפשר להגדיל בדפדפן.', 'כיבוד ההגדרה "הפחתת תנועה" במערכת ההפעלה, וכפתור לעצירת התוכן המתחלף בראש העמוד.', 'התאמה מלאה לטלפון ולטאבלט.']],
    ['אם משהו לא נגיש', [`למרות המאמצים, ייתכן שחלק מהתכנים עדיין לא נגישים במלואם. אם נתקלתם בבעיה, נשמח לשמוע ולתקן. רכז הנגישות: לירון עטאר, <a href="tel:${studio.tel}"><bdi>${studio.phone}</bdi></a> (טלפון או וואטסאפ).`]],
  ] },
];
const legalPage = l => page({ title: l.title, description: l.description, bodyClass: 'case', pathname: `/${l.path}/`, body: `<section class="legal wrap"><h1 class="display">${l.h1}<span class="period">.</span></h1><p class="legal-date">עודכן: ${legalUpdated}</p>${l.sections.map(([h, ps]) => `<h2>${h}</h2>${ps.map(p => `<p>${p}</p>`).join('')}`).join('')}</section>${contact}` });

/* ---------- Ads landing page (/lp/) ----------
   One goal (a conversation), no navigation leaks, headline matched to the ad group through ?t=, and a short form
   that writes the WhatsApp message for the visitor. Not indexed: it exists for paid traffic.
   /lp/short/ is the same page cut for a test against it: every project shown once (on phones the dealt deck under
   the headline is the work, with the four names under it linking to the live sites, and the separate works section
   is hidden), the process as three lines, the included list without the phone, five questions, and on phones the
   page ends in the form (no contact block). Google Ads can split traffic between the two final URLs. */
const lpNeeds = ['אתר תדמית', 'מערכת הזמנות', 'הרשמה לאירועים', 'קטלוג או חנות', 'עוד לא בטוח/ה'];
const lpVariants = {
  tadmit: { lines: ['בניית אתר תדמית', 'שנראה כמו העסק שלך'], need: 'אתר תדמית' },
  hazmanot: { lines: ['מערכת הזמנות אונליין', 'לעסק שלך'], need: 'מערכת הזמנות' },
  events: { lines: ['אתר והרשמה לאירועים', 'הכול במקום אחד'], need: 'הרשמה לאירועים' },
  catalog: { lines: ['קטלוג דיגיטלי', 'שעושה סדר במוצרים'], need: 'קטלוג או חנות' },
};
const lpDefault = { lines: ['אתר שנבנה לעסק שלך', 'ומביא אליו פניות'], need: lpNeeds[0] };
// Google Ads: set GOOGLE_ADS_ID (AW-…) and GOOGLE_ADS_LEAD (AW-…/label) when building to load the tag and report leads.
function adsTag() {
  const id = process.env.GOOGLE_ADS_ID, lead = process.env.GOOGLE_ADS_LEAD;
  if (!id || !/^AW-\d+$/.test(id)) return '';
  const leadTo = lead && /^AW-\d+\/[\w-]+$/.test(lead) ? lead : '';
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');window.LA_ADS={lead:'${leadTo}'};</script>`;
}

// The lead form, written as a WhatsApp conversation: the studio asks one thing at a time and each answer becomes a
// sent bubble, ending with the ready message and the send button. app.js runs the conversation; without it (or with
// reduced motion) every question shows at once and it is an ordinary form. Desktop shows it beside the hero; phones
// show it after the work and the process, once there is proof.
const send = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';
const leadForm = (id, title = 'ספרו לנו על העסק') => `
      <form class="lead" id="${id}" action="https://wa.me/${studio.tel.replace('+', '')}" method="get" target="_blank" aria-labelledby="${id}-title">
        <h2 id="${id}-title" class="lead-title display">${title}<span class="period">.</span></h2>
        <div class="lead-chat">
          <div class="lead-chat-head" aria-hidden="true"><i class="chat-avatar"><img src="/la-monogram-white.svg" width="20" height="20" alt=""></i><b>LA webs</b><small>זמינים עכשיו</small></div>
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
  const wa = escape(studio.whatsapp);
  const proof = featuredOrder.map(slug => bySlug[slug]);
  const body = `
  <header class="lp-header wrap">
    <span class="brand" aria-label="LA webs">LA<span>webs</span><i class="dot" aria-hidden="true"></i></span>
    <a class="lp-call" href="tel:${studio.tel}">${phoneIcon}<bdi>${studio.phone}</bdi></a>
  </header>
  <main id="main">
    <section class="lp-hero" aria-labelledby="lp-title"><div class="wrap lp-hero-grid">
      <div class="lp-copy hero-copy">
        <h1 id="lp-title" class="display brand-headline"><span data-l1>${lpDefault.lines[0]}</span><span><span data-l2>${lpDefault.lines[1]}</span><span class="period">.</span></span></h1>
        <p class="lede">עיצוב ופיתוח מאפס, בלי תבניות. שיחת היכרות קצרה, בלי עלות.</p>
        <ul class="lp-points" role="list"><li>${check}עיצוב אישי, סביב העסק שלכם</li><li>${check}מהיר, מושלם בטלפון ומוכן לגוגל</li>${studio.priceFrom ? `<li>${check}אתר תדמית החל מ-${escape(studio.priceFrom)} ₪</li>` : `<li>${check}וואטסאפ וחיוג בלחיצה אחת</li>`}</ul>
        <div class="hero-actions"><a class="pill pill-cta" href="${wa}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat} נדבר בוואטסאפ</a><a class="text-link" href="tel:${studio.tel}">או חייגו <bdi>${studio.phone}</bdi></a></div>
      </div>
      <div class="lead-deck">
      ${proof.map((p, i) => `<span class="deck-card" aria-hidden="true" style="${vars(p)};--d:${i};--r:${[-15, -6, 6, 15][i]}deg"><img src="/images/${p.slug}-card-20261004-300w.webp" width="300" height="421" alt="" decoding="async" fetchpriority="high"></span>`).join('')}
      ${leadForm('lead')}
      <a class="pill pill-cta lp-deck-cta" href="#lead-m">ספרו לנו על העסק ${down}</a>
      </div>
      ${short ? `<ul class="deck-names" role="list" aria-label="האתרים שבקלפים">${proof.map(p => `<li><a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר של ${escape(p.hebrew)} — נפתח בחלון חדש">${escape(p.hebrew)} ${arrowOut}</a></li>`).join('')}</ul>` : ''}
      <script>(() => { const v = ${JSON.stringify(lpVariants)}[new URLSearchParams(location.search).get('t')]; if (!v) return;
        document.querySelector('[data-l1]').textContent = v.lines[0]; document.querySelector('[data-l2]').textContent = v.lines[1]; })();</script>
    </div></section>
    <section class="lp-work" aria-labelledby="lp-work-title"><div class="wrap">
      <h2 id="lp-work-title" class="display reveal">עבודות אמיתיות<span class="period">.</span><br>באוויר עכשיו<span class="period">.</span></h2>
      <ul class="lp-cards" role="list" tabindex="0" aria-label="עבודות נבחרות (אפשר לגלול הצידה)">${proof.map(p => `<li class="lp-card reveal" style="${vars(p)}"><span class="lp-shot"><img src="/images/${p.slug}-card-20261004.webp" width="585" height="820" alt="מסך הפתיחה של ${escape(p.hebrew)} בטלפון" loading="lazy" decoding="async"></span><span class="lp-card-copy"><strong>${escape(p.hebrew)}</strong><span>${escape(p.kicker)}</span><a class="lp-card-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="לאתר של ${escape(p.hebrew)} — נפתח בחלון חדש">לאתר ${arrowOut}</a></span></li>`).join('')}</ul>
    </div></section>
    ${short ? processCompact : processSection}
    ${short ? faqShort : ''}
    <section class="lp-lead-m" aria-label="טופס פנייה"><div class="wrap">${leadForm('lead-m', 'הבא בתור: העסק שלך')}</div></section>
    <script>(() => { const v = ${JSON.stringify(lpVariants)}[new URLSearchParams(location.search).get('t')]; if (!v) return; // both forms exist now
      document.querySelectorAll('form.lead input[name="w"]').forEach(i => { if (i.value === v.need) i.checked = true; }); })();</script>
    ${short ? '' : faq}
    ${contact}
  </main>
  <footer class="lp-footer wrap"><span>© ${new Date().getFullYear()} LA webs</span><span class="legal-links"><a href="/privacy/">מדיניות פרטיות</a><a href="/accessibility/">הצהרת נגישות</a></span><a href="/">לאתר הסטודיו ולכל העבודות</a></footer>
  <nav class="lp-bar" aria-label="יצירת קשר מהירה"><a href="${wa}" target="_blank" rel="noopener noreferrer">${chat} וואטסאפ</a><a href="tel:${studio.tel}">${phoneIcon} חיוג</a></nav>`;
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="noindex,follow">${head(title, description, { pathname: short ? '/lp/short/' : '/lp/' })}${adsTag()}</head><body class="lp${short ? ' lp-short' : ''}"><a class="skip-link" href="#main">דלגו לתוכן</a>${body}</body></html>`;
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
  home = home.replace('<!--HEAD-->', head(homeTitle, homeDescription)).replace('<!--HEADER-->', header).replace('<!--HERO-->', hero).replace('<!--FEATURED-->', featuredSection).replace('<!--MORE-->', catalogStrip(more)).replace('<!--PROCESS-->', processSection).replace('<!--FAQ-->', faq).replace('<!--CONTACT-->', contact).replace('<!--FOOTER-->', footer).replace('<!--CURSOR-->', '');
  await writeFile(resolve(destination, 'index.html'), home.replace(/[\t ]+$/gm, ''));
  for (const [index, project] of projects.entries()) {
    const dir = resolve(destination, 'work', project.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), casePage(project, index).replace(/[\t ]+$/gm, ''));
  }
  for (const l of legalPages) {
    await mkdir(resolve(destination, l.path), { recursive: true });
    await writeFile(resolve(destination, l.path, 'index.html'), legalPage(l).replace(/[	 ]+$/gm, ''));
  }
  await mkdir(resolve(destination, 'lp'), { recursive: true });
  await writeFile(resolve(destination, 'lp/index.html'), landingPage().replace(/[\t ]+$/gm, ''));
  await mkdir(resolve(destination, 'lp/short'), { recursive: true });
  await writeFile(resolve(destination, 'lp/short/index.html'), landingPage({ short: true }).replace(/[\t ]+$/gm, ''));
  await writeFile(resolve(destination, '404.html'), page({ title: 'העמוד לא נמצא | LA webs', description: 'העמוד שחיפשתם לא נמצא. אפשר לחזור לעבודות של LA webs.', body: `<section class="not-found wrap"><p class="kicker">404</p><h1 class="display">העמוד הזה<br>קצת הלך לאיבוד.</h1><p class="lede">אבל העבודות שלנו עדיין כאן.</p><a class="pill" href="/#work">לעבודות ${arrow}</a></section>${contact}`, bodyClass: 'case', pathname: '/404.html' }));
  await writeFile(resolve(destination, 'robots.txt'), process.env.SITE_ORIGIN ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', process.env.SITE_ORIGIN)}\n` : 'User-agent: *\nDisallow: /\n');
  if (process.env.SITE_ORIGIN) await writeFile(resolve(destination, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...projects.map(p => `/work/${p.slug}/`)].map(path => `<url><loc>${escape(new URL(path, process.env.SITE_ORIGIN).href)}</loc></url>`).join('')}</urlset>`);
  await enhanceSite(destination);
  console.log(`Built homepage, ${projects.length} project pages, and 404 page.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
