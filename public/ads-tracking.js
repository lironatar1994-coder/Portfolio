(() => {
  'use strict';
  const c = window.LA_ADS || {};
  const valid = (value, expression) => typeof value === 'string' && expression.test(value);
  const google = [c.googleId, c.ga4Id].filter(v => valid(v, /^(AW-\d+|G-[A-Z0-9]+)$/));
  const meta = valid(c.metaPixelId, /^\d+$/);
  let consent = '', ready = false, lastContact = 0;
  const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  let attribution = {};
  try {
    consent = localStorage.getItem('la-ad-consent') || '';
    const query = new URLSearchParams(location.search);
    const incoming = Object.fromEntries(attributionKeys.filter(k => query.has(k)).map(k => [k, query.get(k).slice(0, 120)]));
    if (Object.keys(incoming).length) sessionStorage.setItem('la-ad-source', JSON.stringify(incoming));
    attribution = JSON.parse(sessionStorage.getItem('la-ad-source') || '{}');
  } catch { /* contact links work when storage is blocked */ }
  window.LA_contactSource = () => {
    const summary = ['utm_source', 'utm_campaign', 'utm_content'].filter(k => attribution[k]).map(k => String(attribution[k]).replace(/[\r\n<>]/g, '').slice(0, 80)).join(' / ');
    return summary ? '\nמקור הפנייה: ' + summary : '';
  };
  const sourceText = window.LA_contactSource();
  if (sourceText) document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
    const url = new URL(link.href);
    url.searchParams.set('text', (url.searchParams.get('text') || '') + sourceText);
    link.href = url.href;
  });
  const load = src => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.append(s); };
  const init = () => {
    if (ready) return;
    ready = true;
    if (google.length) {
      window.dataLayer ||= [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
      window.gtag('js', new Date());
      google.forEach(id => window.gtag('config', id));
      load('https://www.googletagmanager.com/gtag/js?id=' + google[0]);
    }
    if (meta) {
      const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0';
      fbq('init', c.metaPixelId); fbq('track', 'PageView');
      load('https://connect.facebook.net/en_US/fbevents.js');
    }
  };
  window.LA_trackContact = method => {
    if (!ready || Date.now() - lastContact < 1500) return;
    lastContact = Date.now();
    window.gtag?.('event', 'contact_intent', { method, landing_page: location.pathname, ...attribution });
    if (valid(c.contactConversion, /^AW-\d+\/[\w-]+$/)) window.gtag?.('event', 'conversion', { send_to: c.contactConversion });
    window.fbq?.('track', 'Contact', { method });
  };
  if (!google.length && !meta) return;
  if (consent === 'granted') return init();
  if (consent === 'denied') return;
  const banner = document.createElement('aside');
  banner.className = 'ad-consent'; banner.setAttribute('aria-label', 'העדפות מדידה ופרסום');
  banner.innerHTML = '<p>אפשר לאשר עוגיות כדי שנוכל למדוד את הפרסום. אפשר גם להמשיך בלי מדידה. <a href="/privacy/">מדיניות פרטיות</a></p><button type="button" data-choice="granted">אישור מדידה</button><button type="button" data-choice="denied">המשך בלי מדידה</button>';
  banner.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]')?.dataset.choice;
    if (!choice) return;
    try { localStorage.setItem('la-ad-consent', choice); } catch { /* current-page choice still applies */ }
    banner.remove(); if (choice === 'granted') init();
  });
  document.body.append(banner);
})();
