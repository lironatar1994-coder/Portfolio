// The next studio home (/next/): scrolling moves between the sites we built, while the page itself
// checks that they answer, shows how they appear in search, and runs a bot, automation and CRM demo.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wide = matchMedia('(min-width:900px),(orientation:landscape) and (min-width:620px)');
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = t => t * t * (3 - 2 * t);

const sites = JSON.parse($('#sites-data').textContent);
const reel = $('#reel');
const stage = $('.stage');
const titles = $$('.title');
const devices = $$('.device');
const serps = $$('.serp');
const pips = $$('.pips button');
const count = devices.length;

/* ---- Scroll picks the site; the devices then move to it on their own ---- */
// The opening owns a short stretch of the pinned scroll, then every site owns the same share, measured in screens.
// Scrolling only chooses which site is on screen. The move itself runs on a spring, so it is always smooth and
// always ends resting on one site, however the scroll stopped.
const INTRO = Number(reel.dataset.intro);
const EACH = Number(reel.dataset.each);
const total = INTRO + EACH * count;

let view = 'intro';
function setView(next) {
  if (next === view) return;
  view = next;
  stage.dataset.view = next === 'intro' ? 'intro' : 'site';
  for (const title of titles) title.classList.toggle('is-on', title.dataset.for === String(next));
  for (const serp of serps) serp.classList.toggle('is-on', serp.dataset.for === String(next));
  for (const pip of pips) pip.setAttribute('aria-current', String(pip.dataset.go === String(next)));
  if (next === 'intro') stage.style.removeProperty('--tint'); else stage.style.setProperty('--tint', sites[next].tint);
}

// Where a device sits for a given distance from the site on screen: waiting below, on screen, or receding behind.
function pose(distance) {
  if (distance >= 0) return { x: 0, y: Math.min(distance, 1.3) * 128, rotate: Math.min(distance, 1) * 4, scale: 1, opacity: 1 };
  const back = Math.max(distance, -1);
  return { x: 0, y: back * 12, rotate: 0, scale: 1 + back * 0.14, opacity: clamp(1 + back * 1.2) };
}
// The opening: the first three sites fan out behind the heading.
function fan(i) {
  const spread = wide.matches ? 9 : 37;
  if (i === 0) return { x: 0, y: 5, rotate: 0, scale: 0.92, opacity: 1 };
  if (i === 1) return { x: spread, y: 9, rotate: 8, scale: 0.8, opacity: 1 };
  if (i === 2) return { x: -spread, y: 9, rotate: -8, scale: 0.8, opacity: 1 };
  return null;
}
const mix = (a, b, k) => a + (b - a) * k;

// position: which site is in front. intro: 1 while the opening fan is open. drift: a small lift that follows
// the finger inside one site's share, so the page never feels stuck while a site rests.
const keys = ['position', 'intro', 'drift'];
const goal = { position: 0, intro: 1, drift: 0 };
const now = { position: 0, intro: 1, drift: 0 };
const speed = { position: 0, intro: 0, drift: 0 };
let screen = stage.offsetHeight;
let reelTop = reel.offsetTop;
const measure = () => { screen = stage.offsetHeight; reelTop = reel.offsetTop; };

function readScroll() {
  const scrolled = clamp((scrollY - reelTop) / screen, 0, total);
  if (scrolled < INTRO / 2) { goal.position = 0; goal.intro = 1; goal.drift = 0; setView('intro'); return; }
  const along = Math.max(0, (scrolled - INTRO) / EACH);
  const i = Math.min(count - 1, Math.floor(along));
  goal.position = i;
  goal.intro = 0;
  goal.drift = reduced ? 0 : (0.5 - clamp(along - i)) * 3;
  setView(i);
}

const drawn = devices.map(() => '');
function render() {
  const k = ease(clamp(now.intro));
  devices.forEach((device, i) => {
    let p = pose(i - now.position);
    const open = k > 0 ? fan(i) : null;
    if (open) p = { x: mix(p.x, open.x, k), y: mix(p.y, open.y, k), rotate: mix(p.rotate, open.rotate, k), scale: mix(p.scale, open.scale, k), opacity: mix(p.opacity, open.opacity, k) };
    const hidden = p.opacity < 0.01 || p.y > 127;
    const y = p.y + now.drift * (1 - k);
    const style = hidden ? 'hidden' : `${k > 0 ? (i === 0 ? 3 : 1) : i + 1}|${p.opacity.toFixed(3)}|translate3d(${p.x.toFixed(2)}%,${y.toFixed(2)}%,0) rotate(${p.rotate.toFixed(2)}deg) scale(${p.scale.toFixed(3)})`;
    if (style === drawn[i]) return;
    drawn[i] = style;
    if (hidden) { device.style.visibility = 'hidden'; return; }
    const [z, opacity, transform] = style.split('|');
    device.style.visibility = 'visible';
    device.style.zIndex = z;
    device.style.opacity = opacity;
    device.style.transform = transform;
  });
}

// A critically damped spring: quick to start, soft to land, never overshoots.
const STIFF = 120;
const DAMP = 2 * Math.sqrt(STIFF);
let running = false;
let stale = true;
let last = 0;
function frame(time) {
  // The scroll position is read once per frame, here, and never between a style write and the next paint.
  if (stale) { stale = false; readScroll(); }
  const dt = Math.min(0.034, (time - last) / 1000 || 0.016);
  last = time;
  let moving = false;
  for (const key of keys) {
    const gap = goal[key] - now[key];
    if (reduced || (Math.abs(gap) < 0.0006 && Math.abs(speed[key]) < 0.004)) { now[key] = goal[key]; speed[key] = 0; continue; }
    speed[key] += (gap * STIFF - speed[key] * DAMP) * dt;
    now[key] += speed[key] * dt;
    moving = true;
  }
  render();
  if (moving) requestAnimationFrame(frame); else running = false;
}
function wake() {
  stale = true;
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}
addEventListener('scroll', wake, { passive: true });
addEventListener('resize', () => { measure(); wake(); });

for (const pip of pips) {
  pip.addEventListener('click', () => {
    const top = reelTop + (INTRO + EACH * (Number(pip.dataset.go) + 0.3)) * screen;
    scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });
}

/* ---- Pictures: the first three come with the page, the rest once it is idle; browser frames only on wide screens ---- */
const warm = image => { if (image.decode) image.decode().catch(() => {}); };
let restLoaded = false;
function loadWide() {
  if (!wide.matches || !restLoaded) return;
  for (const image of $$('img[data-wide]')) { image.src = image.dataset.wide; image.removeAttribute('data-wide'); warm(image); }
}
function loadRest() {
  if (restLoaded) return;
  restLoaded = true;
  for (const image of $$('img[data-src]')) {
    image.addEventListener('error', () => { image.style.visibility = 'hidden'; }, { once: true });
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
    warm(image);
  }
  loadWide();
}
wide.addEventListener('change', () => { loadWide(); measure(); wake(); });

/* ---- Live check: does every site answer right now? ---- */
// A site on this same address is asked directly. Any other site is asked for a small file of its own:
// the file only loads when that site's server is really serving it.
const states = sites.map(() => 'checking');
const lives = $$('.live');
const watchText = $('#watch-text');
let checkedAt = 0;

function probe(site) {
  if (new URL(site.url).origin === location.origin) {
    return fetch(site.url, { method: 'HEAD', cache: 'no-store' }).then(response => response.ok).catch(() => false);
  }
  return new Promise(resolve => {
    const image = new Image();
    const timer = setTimeout(() => { image.onload = image.onerror = null; resolve(false); }, 9000);
    image.onload = () => { clearTimeout(timer); resolve(true); };
    image.onerror = () => { clearTimeout(timer); resolve(false); };
    image.referrerPolicy = 'no-referrer';
    image.src = `${site.icon}${site.icon.includes('?') ? '&' : '?'}check=${Date.now()}`;
  });
}

const stateText = { checking: 'בודקים…', up: 'באוויר עכשיו', down: 'לא עונה כרגע' };
function paintState(i) {
  pips[i].dataset.state = states[i];
  lives[i].dataset.state = states[i];
  $('.live-text', lives[i]).textContent = stateText[states[i]];
}
let checking = false;
async function checkAll() {
  if (checking || document.hidden) return;
  checking = true;
  await Promise.all(sites.map(async (site, i) => { states[i] = (await probe(site)) ? 'up' : 'down'; paintState(i); }));
  checkedAt = Date.now();
  checking = false;
  watchText.textContent = `${states.filter(state => state === 'up').length} מתוך ${count} אתרים באוויר`;
}
const RECHECK = 120000;
setInterval(() => { if (checkedAt && Date.now() - checkedAt > RECHECK) checkAll(); }, 15000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - checkedAt > RECHECK) checkAll(); });

/* ---- The live scene: bot, automation line, CRM and the owner's phone ---- */
const sys = $('#sys');
const log = $('#chat-log');
const flow = $('#flow');
const runner = $('.runner', flow);
const nodes = $$('.node', flow);
const crmRows = $('#crm-rows');
const crmCount = $('#crm-count');
const owner = $('#owner');
const notes = $('#notes');
const clock = $('#owner-clock');
const paths = {
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.500 20c.800-3.600 3.800-5.600 7.500-5.600s6.700 2 7.500 5.600"/>',
  cal: '<path d="M5 6.500A1.500 1.500 0 0 1 6.500 5h11A1.500 1.500 0 0 1 19 6.500v11a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 17.500zM5 10h14M9 3.500v3M15 3.500v3"/>',
  cart: '<path d="M3.500 5h2.200l2 10h9.800l1.800-7.500H6.600"/><circle cx="9.500" cy="18.800" r="1.300"/><circle cx="16.500" cy="18.800" r="1.300"/>',
  bell: '<path d="M6 16.500V11a6 6 0 1 1 12 0v5.500l1.500 2h-15zM10 20.500h4"/>',
};
const kinds = {
  new: { icon: 'user', text: 'לקוח חדש נרשם', tone: '#d9431f', soft: '#fff0eb' },
  booked: { icon: 'cal', text: 'תור נקבע', tone: '#1d5fd6', soft: '#eaf2ff' },
  bought: { icon: 'cart', text: 'מוצר נקנה', tone: '#0b7a45', soft: '#e5f6ec' },
};
const iconNode = key => {
  const holder = document.createElement('template');
  holder.innerHTML = `<svg class="ico" viewBox="0 0 24 24" fill="none" aria-hidden="true">${paths[key]}</svg>`;
  return holder.content.firstChild;
};
function entry(tag, className, kind, iconKey, detail) {
  const item = document.createElement(tag);
  item.className = className;
  item.style.setProperty('--tone', kind.tone);
  item.style.setProperty('--row', kind.soft);
  const words = document.createElement('div');
  const strong = document.createElement('b');
  strong.textContent = kind.text;
  words.append(strong);
  if (detail) { const small = document.createElement('small'); small.textContent = detail; words.append(small); }
  item.append(iconNode(iconKey), words);
  return item;
}

let run = 0;
let sysActive = false;
let chatStarted = false;
let events = 0;
const later = (ms, id, action) => setTimeout(() => { if (id === run) action(); }, reduced ? 0 : ms);

// One event travels the whole line: message, CRM, notification, calendar.
function fire(type, detail, note = detail) {
  const id = run;
  const kind = kinds[type];
  if (!reduced && runner.animate) {
    const direction = getComputedStyle(flow).direction === 'rtl' ? -1 : 1;
    runner.animate(
      [{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${100 * direction}%)`, opacity: 1, offset: 0.92 }, { transform: `translateX(${100 * direction}%)`, opacity: 0 }],
      { duration: 1300, easing: 'cubic-bezier(.45,0,.2,1)' });
    nodes.forEach((node, i) => node.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.16)' }, { transform: 'scale(1)' }],
      { duration: 460, delay: i * 380, easing: 'ease-out' }));
  }
  later(420, id, () => {
    crmRows.prepend(entry('li', 'row', kind, kind.icon, detail));
    while (crmRows.children.length > 3) crmRows.lastElementChild.remove();
    crmCount.textContent = String(++events);
    crmCount.classList.add('is-bump');
    setTimeout(() => crmCount.classList.remove('is-bump'), 300);
  });
  later(900, id, () => {
    notes.prepend(entry('li', 'note', kind, 'bell', note));
    while (notes.children.length > 3) notes.lastElementChild.remove();
    owner.classList.remove('is-buzz');
    void owner.offsetWidth;
    owner.classList.add('is-buzz');
  });
}

function resetScene() {
  events = 0;
  crmCount.textContent = '0';
  notes.textContent = '';
  crmRows.textContent = '';
  for (let i = 0; i < 3; i++) {
    const ghost = document.createElement('li');
    ghost.className = 'row is-ghost';
    ghost.setAttribute('aria-hidden', 'true');
    ghost.append(document.createElement('i'), document.createElement('span'));
    crmRows.append(ghost);
  }
}

// Pauses between messages are skipped with reduced motion. Time given to the visitor to answer never is.
const pause = (ms, real = false) => new Promise(resolve => setTimeout(resolve, reduced && !real ? 0 : ms));
async function runChat() {
  const id = ++run;
  log.textContent = '';
  resetScene();
  // Timers only advance while the scene is on screen.
  const step = async (ms, real = false) => {
    await pause(ms, real);
    while (!sysActive && id === run) await new Promise(resolve => setTimeout(resolve, 160));
    if (id !== run) throw new Error('stale');
  };
  const say = (text, user = false) => {
    const bubble = document.createElement('div');
    bubble.className = user ? 'msg is-user' : 'msg';
    bubble.textContent = text;
    log.append(bubble);
  };
  const bot = async text => {
    const typing = document.createElement('div');
    typing.className = 'msg typing';
    typing.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
    log.append(typing);
    try { await step(900); } finally { typing.remove(); }
    say(text);
  };
  const choose = (options, fallback, wait = 3600) => new Promise((resolve, reject) => {
    const row = document.createElement('div');
    row.className = 'chips';
    let done = false;
    const pick = value => { if (done) return; done = true; row.remove(); resolve(value); };
    for (const option of options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => pick(option));
      row.append(button);
    }
    log.append(row);
    if (fallback == null) return;
    // No tap? The demo answers for the visitor and keeps going.
    (async () => {
      try {
        await step(wait, true);
        if (done) return;
        row.children[fallback].classList.add('is-auto');
        await step(450);
        pick(options[fallback]);
      } catch (error) { if (!done) { done = true; row.remove(); reject(error); } }
    })();
  });
  try {
    await step(700);
    say('היי, אפשר לקבוע תור?', true);
    fire('new');
    await step(900);
    await bot('בטח. לאיזה יום?');
    const day = await choose(['היום', 'מחר', 'יום חמישי'], 1);
    say(day, true);
    await step(450);
    await bot('יש מקום ב־10:00, ב־12:30 או ב־17:00.');
    const time = await choose(['10:00', '12:30', '17:00'], 2);
    say(time, true);
    await step(450);
    await bot(`נקבע. ${day} ב־${time}.`);
    fire('booked', `${day} · ${time}`);
    await step(1700);
    await bot('רוצה להוסיף שובר מתנה ב־₪100?');
    const gift = await choose(['כן, להוסיף', 'לא עכשיו'], 0);
    say(gift, true);
    await step(450);
    if (gift === 'כן, להוסיף') {
      await bot('נוסף. תודה!');
      fire('bought', 'שובר מתנה · ₪100', '₪100');
    } else await bot('אין בעיה. נתראה!');
    await step(1500);
    await choose(['שוב'], null);
    runChat();
  } catch { /* a newer run replaced this one */ }
}

function paintClock() {
  const now = new Date();
  clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
paintClock();
setInterval(paintClock, 20000);

if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    sysActive = entries.some(item => item.isIntersecting);
    if (sysActive && !chatStarted) { chatStarted = true; runChat(); }
  }, { threshold: 0.3 }).observe($('.sys-grid'));
} else { sysActive = true; chatStarted = true; runChat(); }

/* ---- Start ---- */
// The first state is drawn at once. The other pictures and the live check wait until the page itself has loaded.
readScroll();
for (const key of keys) now[key] = goal[key];
render();
const idle = action => ('requestIdleCallback' in window ? requestIdleCallback(action, { timeout: 2000 }) : setTimeout(action, 600));
const afterLoad = () => idle(() => { loadRest(); checkAll(); });
if (document.readyState === 'complete') afterLoad(); else addEventListener('load', afterLoad, { once: true });
