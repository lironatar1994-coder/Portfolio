// The next studio home, as a preview (/next/). The page does not list services: it shows the sites we built,
// and lets the visitor see the rest working around them (live checks, search result, bot, automation, CRM).
// It stays out of search engines and the sitemap until approved.
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const svg = (paths, className = 'ico') => `<svg class="${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${paths}</svg>`;
const icons = {
  out: '<path d="M17 7 7 17M7 7h10v10"/>',
  chat: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.6.5-1.4 0-1.4-.7z"/>',
  down: '<path d="M12 5v14m-6-6 6 6 6-6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.700 2 7.500 5.600"/>',
  bell: '<path d="M6 16.500V11a6 6 0 1 1 12 0v5.500l1.500 2h-15zM10 20.500h4"/>',
  cal: '<path d="M5 6.500A1.500 1.500 0 0 1 6.500 5h11A1.500 1.500 0 0 1 19 6.500v11a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 17.500zM5 10h14M9 3.500v3M15 3.500v3"/>',
  cart: '<path d="M3.500 5h2.200l2 10h9.800l1.800-7.500H6.600"/><circle cx="9.500" cy="18.800" r="1.300"/><circle cx="16.500" cy="18.800" r="1.300"/>',
};
const icon = (key, className) => svg(icons[key], className);

// The sites in the reel, in this order. Only sites that are live and built for a real business or product.
// tint: a light, bright take on the client's own colour, for the flat disc behind the device.
// icon: a small file on the site's own server. The page asks for it to learn that the site answers.
// title: the site's real <title>, as a search engine shows it (read 11 November 2026).
const reel = [
  { slug: 'koral', tint: '#ffc4d6', icon: 'https://lawebs.co.il/Koralevents/icon.svg',
    title: '״אישה לאישה מלכה״ | ערבי נשים לזיכוי הרבות' },
  { slug: 'reuven', tint: '#aee0fb', icon: 'https://www.dfusreuven.co.il/assets/brand/favicon-32.png',
    title: 'דפוס ראובן בבני ברק | עיצוב, דפוס ומתנות בעיצוב אישי' },
  { slug: 'miryam', tint: '#ffd3c2', icon: 'https://miryamzelig.co.il/Miryam_Zelig/icons/miryam-mz-v1-32.png',
    title: 'מרים זליג · מאפרת כלות, ערב ואירועים — איפור עד הבית' },
  { slug: 'seder', tint: '#c9ecd9', icon: 'https://lawebs.co.il/seder/icon.png',
    title: 'סדר (Seder) — מסדר את המשימות שלכם | ניהול משימות בעברית' },
  { slug: 'sos', tint: '#ffdc8c', icon: 'https://sosbaderech.co.il/favicon.ico',
    title: 'מנעולן לדלתות ולרכב באזור המרכז — בדרך אליך' },
  // PDF Studio moved: the old vee-app.co.il address now forwards here.
  { slug: 'pdf', tint: '#bcd0ff', icon: 'https://lawebs.co.il/pdf-studio/favicon.svg', domain: 'lawebs.co.il/pdf-studio', url: 'https://lawebs.co.il/pdf-studio/',
    title: 'PDF Studio — עריכה והמרה של PDF בעברית, חינם' },
  { slug: 'pinhas', tint: '#f0dea0', icon: 'https://pinhasratzon.co.il/assets/img/brand/pr-icon-96.png',
    title: 'עורך דין מקרקעין וצוואות בפתח תקווה | עו״ד פנחס רצון' },
];

// How much scroll the opening and every site own, in screens. The script reads the same numbers from the page.
const INTRO = 0.5;
const EACH = 0.85;
const wideQuery = '(min-width:900px),(orientation:landscape) and (min-width:620px)';

export function nextPage({ projects, studio, version }) {
  const sites = reel.map(entry => ({ ...projects.find(p => p.slug === entry.slug), ...entry })).filter(p => p.url);
  const count = sites.length;
  const title = 'העסק שלך. האתר שמתאים לו. | LA webs';
  const description = 'אתרים שבנינו לעסקים, ומה שעובד סביבם: בוט וואטסאפ, אוטומציות, CRM, הופעה בגוגל וניטור.';

  const titles = sites.map((p, i) => `<div class="title" data-for="${i}">
            <h2>${esc(p.hebrew)}</h2>
            <p class="kicker">${esc(p.kicker)}</p>
            <p class="live" data-site="${i}" data-state="checking"><i class="dot" aria-hidden="true"></i><span class="live-text">בודקים…</span><a class="live-link" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(p.hebrew)} — האתר נפתח בחלון חדש"><bdi>${esc(p.domain)}</bdi>${icon('out')}</a></p>
          </div>`).join('\n          ');

  // The opening shows the first three sites, so their pictures load with the page. The rest load once it is idle.
  const devices = sites.map((p, i) => `<div class="device" data-i="${i}" style="--site-bg:${p.colors.bg}">
            <div class="browser" aria-hidden="true"><span class="bar"><i></i><i></i><i></i></span><img ${i < 3 ? `src="/images/${p.slug}-desktop.webp" loading="lazy"` : `data-wide="/images/${p.slug}-desktop.webp" src="/images/blank.webp"`} width="1440" height="1000" alt="" decoding="async"></div>
            <div class="phone"><img ${i < 3 ? `src="/images/${p.slug}-mobile-top.webp"${i ? '' : ' fetchpriority="high"'}` : `data-src="/images/${p.slug}-mobile-top.webp" src="/images/blank.webp"`} width="585" height="1200" alt="${esc(p.kicker)} — ${esc(p.hebrew)}, בתצוגת טלפון" decoding="async"></div>
          </div>`).join('\n          ');

  const serps = sites.map((p, i) => `<a class="serp" data-for="${i}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="כך האתר מופיע בחיפוש: ${esc(p.title)} — נפתח בחלון חדש">${icon('search')}<span>${esc(p.title)}</span></a>`).join('\n          ');

  const pips = sites.map((p, i) => `<button type="button" data-go="${i}" data-state="checking" aria-label="${esc(p.hebrew)}"></button>`).join('');
  const siteData = sites.map(p => ({ url: p.url, icon: p.icon, tint: p.tint }));
  const first = sites[0].slug;

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" href="/la-monogram-32-v2.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/la-monogram-192-v2.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/la-monogram-180-v2.png" sizes="180x180">
  <link rel="preload" href="/fonts/plex-hebrew-700-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-hebrew-400-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/images/${first}-mobile-top.webp" as="image" type="image/webp" fetchpriority="high">
  <link rel="preload" href="/images/${first}-desktop.webp" as="image" type="image/webp" media="${wideQuery}">
  <link rel="stylesheet" href="/next.css?v=${version}">
  <script>document.documentElement.classList.add('js')</script>
  <script type="module" src="/next.js?v=${version}"></script>
</head>
<body>
  <a class="skip-link" href="#talk">דלגו ליצירת קשר</a>
  <header class="top">
    <a class="brand" href="/" aria-label="LA webs — לעמוד הבית">LA<span>webs</span><i aria-hidden="true"></i></a>
    <a class="top-cta" href="${esc(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${icon('chat')}<span>נדבר בוואטסאפ</span></a>
  </header>
  <main id="main">
    <section class="reel" id="reel" aria-label="אתרים שבנינו" data-intro="${INTRO}" data-each="${EACH}" style="--screens:${(INTRO + EACH * count + 1).toFixed(2)}">
      <div class="stage" data-view="intro">
        <div class="disc" aria-hidden="true"></div>
        <div class="titles">
          <div class="title is-on" data-for="intro">
            <h1>העסק שלך<i class="period">.</i><br>האתר שמתאים לו<i class="period">.</i></h1>
          </div>
          ${titles}
        </div>
        <div class="devices">
          ${devices}
        </div>
        <div class="serps">
          ${serps}
        </div>
        <span class="hint" aria-hidden="true">${icon('down')}</span>
        <div class="watch">
          <nav class="pips" aria-label="האתרים">${pips}</nav>
          <p class="sr-only" id="watch-text" role="status"></p>
        </div>
      </div>
    </section>
    <section class="sys" id="sys" aria-labelledby="sys-title">
      <h2 class="sr-only" id="sys-title">הדגמה: בוט וואטסאפ, אוטומציה ו־CRM</h2>
      <div class="sys-grid">
        <span class="demo-tag">הדגמה</span>
        <div class="chat" id="chat" role="group" aria-label="הדגמת בוט וואטסאפ">
          <div class="chat-head"><span class="chat-avatar">${icon('chat')}</span><span class="chat-who"><b>העסק שלך</b><small>מקוון</small></span></div>
          <div class="chat-log" id="chat-log"></div>
        </div>
        <div class="flow" id="flow" aria-hidden="true">
          <span class="node">${icon('chat')}</span>
          <span class="node">${icon('user')}</span>
          <span class="node">${icon('bell')}</span>
          <span class="node">${icon('cal')}</span>
          <span class="runner"><i></i></span>
        </div>
        <div class="biz">
          <div class="crm">
            <div class="crm-head"><b>לקוחות</b><span class="crm-count" id="crm-count" aria-hidden="true">0</span></div>
            <ul class="crm-rows" id="crm-rows" aria-live="polite">
              <li class="row is-ghost" aria-hidden="true"><i></i><span></span></li>
              <li class="row is-ghost" aria-hidden="true"><i></i><span></span></li>
              <li class="row is-ghost" aria-hidden="true"><i></i><span></span></li>
            </ul>
          </div>
          <div class="owner" id="owner" aria-hidden="true">
            <span class="owner-clock" id="owner-clock">09:41</span>
            <ul class="notes" id="notes"></ul>
          </div>
        </div>
      </div>
    </section>
    <section class="talk" id="talk">
      <h2>בואו נבנה<br>את האתר שלכם<i class="period">.</i></h2>
      <div class="talk-actions">
        <a class="cta" href="${esc(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${icon('chat')}<span>נדבר בוואטסאפ</span></a>
        <a class="tel" href="tel:${studio.tel}">או בטלפון <bdi>${studio.phone}</bdi></a>
      </div>
    </section>
  </main>
  <footer class="foot">
    <span>© ${new Date().getFullYear()} LA webs</span>
    <a href="/">לאתר הסטודיו ולכל העבודות</a>
  </footer>
  <script type="application/json" id="sites-data">${JSON.stringify(siteData).replaceAll('<', '\\u003c')}</script>
  <noscript><style>.reel{height:auto}.stage{position:static;height:auto}.hint,.watch{display:none}</style></noscript>
</body>
</html>
`;
}
