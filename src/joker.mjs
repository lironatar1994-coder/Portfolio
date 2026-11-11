// The joker concept page (/joker/): one card that turns into each service as the visitor scrolls.
// A preview direction for the studio home. It stays out of search engines and the sitemap until approved.
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// The jester cap is the joker mark: three horns, three bells, one band. No face, no clown.
const cap = (className = '') => `<svg class="cap ${className}" viewBox="0 0 120 96" aria-hidden="true"><path class="cap-side" d="M30 78C27 58 23 41 8 30c22 0 38 16 46 48z"/><path class="cap-side" d="M90 78c3-20 7-37 22-48-22 0-38 16-46 48z"/><path class="cap-mid" d="M41 78c4-26 12-50 19-70 7 20 15 44 19 70z"/><rect class="cap-band" x="24" y="75" width="72" height="15" rx="7.5"/><circle class="cap-bell" cx="8" cy="28" r="6.5"/><circle class="cap-bell" cx="60" cy="8" r="6.5"/><circle class="cap-bell" cx="112" cy="28" r="6.5"/></svg>`;
const out = '<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 7 7 17M7 7h10v10"/></svg>';
const chat = '<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.6.5-1.4 0-1.4-.7z"/></svg>';
const down = '<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>';

const icons = {
  web: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h14a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5zM3.5 9.5h17M6.5 7.3h.01M9 7.3h.01"/>',
  bot: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.6 3.6c-.6.5-1.4 0-1.4-.7zM8.5 10h.01M12 10h.01M15.5 10h.01"/>',
  auto: '<path d="M13 3 5 13.5h6L10 21l9-11.5h-6z"/>',
  crm: '<path d="M4 5h4v14H4zM10 5h4v8h-4zM16 5h4v11h-4z"/>',
  google: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  monitor: '<path d="M2.5 12h4l2.5-7 4 14 2.5-7h6"/>',
};
const icon = key => `<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">${icons[key]}</svg>`;

// The full hand. Only the first two have a scroll chapter in this preview.
const services = [
  { key: 'web', name: 'אתרים ודפי נחיתה' },
  { key: 'bot', name: 'בוטים לוואטסאפ' },
  { key: 'auto', name: 'אוטומציות' },
  { key: 'crm', name: 'CRM' },
  { key: 'google', name: 'הופעה בגוגל' },
  { key: 'monitor', name: 'ניטור' },
];
// Real client sites shown inside the card, in this order. Heights are the real capture heights at 585px wide.
// The third value is the wash behind the card: a brighter take on the client's own colour, so the light stage stays lively.
const siteShots = [['koral', 7863, '#ff5c8a'], ['miryam', 7819, '#ff9770'], ['pinhas', 9000, '#f5b82e']];

const index = n => String(n).padStart(2, '0');
const strip = (n, className = '') => `<div class="strip ${className}" aria-hidden="true"><b>${index(n)}</b>${cap()}</div>`;
const jokerIndex = (className = '') => `<div class="jk-index ${className}" aria-hidden="true"><span>J</span><span>O</span><span>K</span><span>E</span><span>R</span>${cap()}</div>`;

export function jokerPage({ projects, studio, version }) {
  const sites = siteShots.map(([slug, height, wash]) => ({ ...projects.find(p => p.slug === slug), height, wash })).filter(p => p.slug);
  const waBase = studio.whatsapp.split('?')[0];
  const waFor = name => `${waBase}?text=${encodeURIComponent(`היי LA webs, אשמח לדבר על ${name}.`)}`;
  const title = 'הג׳וקר של העסק שלך | LA webs';
  const description = 'אתרים, דפי נחיתה, בוטים לוואטסאפ, אוטומציות, CRM, הופעה בגוגל וניטור. קלף אחד שהופך למה שהעסק שלך צריך.';
  const siteFaces = sites.map((p, i) => `<div class="site${i ? '' : ' is-on'}" style="--site-bg:${p.colors.bg}" data-name="${esc(p.hebrew)}" data-domain="${esc(p.domain)}" data-url="${esc(p.url)}" data-accent="${p.wash}"><img data-src="/images/${p.slug}-mobile-full.webp" src="/images/blank.webp" width="585" height="${p.height}" alt="${esc(p.kicker)} — ${esc(p.hebrew)}" decoding="async"></div>`).join('');
  const first = sites[0];

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="noindex,nofollow">
  <meta name="theme-color" content="#f7f9fc">
  <link rel="icon" href="/la-monogram-32-v2.png" type="image/png" sizes="32x32">
  <link rel="icon" href="/la-monogram-192-v2.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="/la-monogram-180-v2.png" sizes="180x180">
  <link rel="preload" href="/fonts/frank-ruhl-libre-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/plex-hebrew-500-hebrew.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/joker.css?v=${version}">
  <script>document.documentElement.classList.add('js')</script>
  <script type="module" src="/joker.js?v=${version}"></script>
</head>
<body>
  <a class="skip-link" href="#hand">דלגו לכל השירותים</a>
  <header class="top">
    <a class="brand" href="/" aria-label="LA webs — לעמוד הבית">${cap()}<span class="brand-word">LA<span>webs</span></span></a>
    <a class="top-cta" href="${esc(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat}<span>נדבר בוואטסאפ</span></a>
  </header>
  <main id="main">
    <section class="deck" id="deck" aria-label="מה אנחנו בונים">
      <div class="stage" data-chapter="joker">
        <div class="glow" aria-hidden="true"></div>
        <div class="titles">
          <div class="title is-on" data-for="joker">
            <h1>הג׳וקר<br>של העסק שלך<i class="period">.</i></h1>
            <p class="sub">אתרים · בוטים · אוטומציות · CRM · גוגל · ניטור</p>
          </div>
          <div class="title" data-for="web">
            <span class="num">01</span>
            <h2>אתרים<i class="period">.</i></h2>
            <p class="sub"><a class="site-link" tabindex="-1" href="${esc(first.url)}" target="_blank" rel="noopener noreferrer"><span class="site-name">${esc(first.hebrew)}</span><bdi class="site-domain">${esc(first.domain)}</bdi>${out}</a></p>
          </div>
          <div class="title" data-for="bot">
            <span class="num">02</span>
            <h2>בוט וואטסאפ<i class="period">.</i></h2>
            <p class="sub">הדגמה. אפשר ללחוץ על התשובות.</p>
          </div>
        </div>
        <div class="table">
          <div class="float"><div class="tilt">
            <div class="card" id="card" data-face="back">
              <div class="face face-back" aria-hidden="true"><div class="back-art">${cap('cap-on-dark')}</div></div>
              <div class="face face-joker" aria-hidden="true">
                ${jokerIndex()}
                <div class="jk-center">${cap()}<span class="jk-word">LA<span>webs</span></span></div>
                ${jokerIndex('is-flipped')}
              </div>
              <div class="face face-web">
                ${strip(1)}
                <div class="window sites" id="sites">${siteFaces}</div>
                ${strip(1, 'is-flipped')}
              </div>
              <div class="face face-bot">
                ${strip(2)}
                <div class="window chat" id="chat" aria-label="הדגמת בוט וואטסאפ">
                  <div class="chat-head"><span class="chat-avatar">${cap('cap-on-dark')}</span><span class="chat-who"><b>העסק שלך</b><small>מקוון</small></span></div>
                  <div class="chat-log" id="chat-log"></div>
                </div>
                ${strip(2, 'is-flipped')}
              </div>
            </div>
          </div></div>
        </div>
        <nav class="pips" aria-label="פרקים">
          <button type="button" data-go="joker" aria-label="פתיחה" aria-current="true"></button>
          <button type="button" data-go="web" aria-label="אתרים"></button>
          <button type="button" data-go="bot" aria-label="בוט וואטסאפ"></button>
        </nav>
        <p class="hint" aria-hidden="true">גללו ${down}</p>
      </div>
    </section>
    <section class="hand" id="hand">
      <h2>מה העסק שלך צריך<i class="period">?</i></h2>
      <ul class="hand-cards">
        ${services.map((s, i) => `<li style="--i:${i}"><button type="button" class="hand-card" aria-pressed="false" data-name="${esc(s.name)}" data-wa="${esc(waFor(s.name))}"><b aria-hidden="true">${index(i + 1)}</b>${icon(s.key)}<span>${esc(s.name)}</span></button></li>`).join('\n        ')}
      </ul>
      <div class="hand-actions">
        <a class="cta" id="hand-cta" href="${esc(studio.whatsapp)}" data-default="${esc(studio.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="לשיחה בוואטסאפ — נפתח בחלון חדש">${chat}<span id="hand-cta-text">נדבר בוואטסאפ</span></a>
        <a class="tel" href="tel:${studio.tel}">או בטלפון <bdi>${studio.phone}</bdi></a>
      </div>
    </section>
  </main>
  <footer class="foot">
    <span>© ${new Date().getFullYear()} LA webs</span>
    <a href="/">לאתר הסטודיו ולכל העבודות</a>
  </footer>
  <noscript><style>.card .face-back{visibility:hidden}.card .face-joker{visibility:visible}.hint,.pips{display:none}</style></noscript>
</body>
</html>
`;
}
