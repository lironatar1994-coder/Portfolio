// The joker concept page: one pinned card that turns into each service while the page scrolls natively.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const deck = $('#deck');
const stage = $('.stage');
const card = $('#card');
const glow = $('.glow');
const titles = $$('.title');
const pips = $$('.pips button');

// Each chapter owns a share of the pinned scroll, measured in screens.
const chapters = [
  { id: 'joker', length: 0.6, glow: '#244be8' },
  { id: 'web', length: 2.25 },
  { id: 'bot', length: 1.3, glow: '#25d366' },
];
const total = chapters.reduce((sum, chapter) => sum + chapter.length, 0);
deck.style.setProperty('--screens', (total + 1).toFixed(2));

/* ---- The card flip ---- */
let shown = card.dataset.face;
let wanted = shown;
let turning = false;
let direction = 1;
let revealed = false;

async function turnTo(face) {
  wanted = face;
  if (turning) return;
  turning = true;
  while (shown !== wanted) {
    const next = wanted;
    if (reduced || !card.animate) { card.dataset.face = shown = next; continue; }
    const sign = direction;
    const away = card.animate(
      [{ transform: 'rotateY(0deg) scale(1)' }, { transform: `rotateY(${90 * sign}deg) scale(1.07)` }],
      { duration: 230, easing: 'cubic-bezier(.55,0,.9,.45)', fill: 'forwards' });
    await away.finished.catch(() => {});
    card.dataset.face = shown = next;
    const back = card.animate(
      [{ transform: `rotateY(${-90 * sign}deg) scale(1.07)` }, { transform: 'rotateY(0deg) scale(1)' }],
      { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    await back.finished.catch(() => {});
    away.cancel();
    back.cancel();
  }
  turning = false;
}
const faceFor = id => (id === 'joker' ? (revealed ? 'joker' : 'back') : id);

/* ---- Chapter 01: client sites ---- */
const sites = $$('#sites .site');
const siteWindow = $('#sites');
const siteLink = $('.site-link');
let siteIndex = 0;
let shotsLoaded = false;

function loadShots() {
  if (shotsLoaded) return;
  shotsLoaded = true;
  for (const image of $$('img[data-src]', siteWindow)) { image.src = image.dataset.src; image.removeAttribute('data-src'); }
}

function showSite(index) {
  siteIndex = index;
  sites.forEach((site, i) => {
    site.classList.toggle('is-on', i === index);
    site.classList.toggle('is-past', i < index);
  });
  const { name, domain, url } = sites[index].dataset;
  $('.site-name', siteLink).textContent = name;
  $('.site-domain', siteLink).textContent = domain;
  siteLink.href = url;
}

function updateSites(progress) {
  const position = Math.min(sites.length - 0.0001, progress * sites.length);
  const index = Math.floor(position);
  if (index !== siteIndex) { showSite(index); setGlow(); }
  // The visitor's own scrolling moves the site inside the card.
  const image = $('img', sites[index]);
  const windowHeight = siteWindow.clientHeight;
  const imageHeight = image.offsetHeight || siteWindow.clientWidth * image.height / image.width;
  const range = Math.max(0, Math.min(imageHeight - windowHeight, windowHeight * 3.2));
  const travelled = Math.min(1, (position - index) / 0.92);
  image.style.transform = `translate3d(0,${(-range * travelled).toFixed(1)}px,0)`;
}

/* ---- Chapter 02: the WhatsApp bot ---- */
const log = $('#chat-log');
let run = 0;
let botActive = false;
let chatStarted = false;
const pause = ms => new Promise(resolve => setTimeout(resolve, reduced ? 0 : ms));

async function runChat() {
  const id = ++run;
  log.textContent = '';
  // Timers only advance while the bot chapter is on screen.
  const step = async ms => {
    await pause(ms);
    while (!botActive && id === run) await new Promise(resolve => setTimeout(resolve, 160));
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
  const choose = (options, fallback, wait = 3400) => new Promise((resolve, reject) => {
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
        await step(wait);
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
    await step(500);
    await bot('בטח. לאיזה יום?');
    const day = await choose(['היום', 'מחר', 'יום חמישי'], 1);
    say(day, true);
    await step(450);
    await bot('יש מקום ב־10:00, ב־12:30 או ב־17:00.');
    const time = await choose(['10:00', '12:30', '17:00'], 2);
    say(time, true);
    await step(450);
    await bot(`נקבע. ${day} ב־${time}.`);
    await step(350);
    await bot('אשלח לך תזכורת לפני התור.');
    await step(700);
    await choose(['שוב'], null);
    runChat();
  } catch { /* a newer run replaced this one */ }
}

/* ---- Scroll drives the chapters ---- */
let chapter = 'joker';

function setGlow() {
  const current = chapters.find(c => c.id === chapter);
  glow.style.backgroundColor = chapter === 'web' ? sites[siteIndex].dataset.accent : current.glow;
}

function setChapter(id) {
  if (id === chapter) return;
  direction = chapters.findIndex(c => c.id === id) > chapters.findIndex(c => c.id === chapter) ? 1 : -1;
  chapter = id;
  revealed = true;
  stage.dataset.chapter = id;
  for (const title of titles) title.classList.toggle('is-on', title.dataset.for === id);
  for (const pip of pips) pip.setAttribute('aria-current', String(pip.dataset.go === id));
  siteLink.tabIndex = id === 'web' ? 0 : -1;
  botActive = id === 'bot';
  if (botActive && !chatStarted) { chatStarted = true; runChat(); }
  if (id !== 'joker') loadShots();
  setGlow();
  turnTo(faceFor(id));
}

function update() {
  const screen = stage.offsetHeight;
  const scrolled = Math.max(0, Math.min(total, -deck.getBoundingClientRect().top / screen));
  let start = 0;
  let current = chapters[chapters.length - 1];
  let progress = 1;
  for (const candidate of chapters) {
    if (scrolled < start + candidate.length) { current = candidate; progress = (scrolled - start) / candidate.length; break; }
    start += candidate.length;
  }
  setChapter(current.id);
  if (current.id === 'web') updateSites(progress);
}

let queued = false;
function requestUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; update(); });
}
addEventListener('scroll', requestUpdate, { passive: true });
addEventListener('resize', requestUpdate);

for (const pip of pips) {
  pip.addEventListener('click', () => {
    let start = 0;
    for (const candidate of chapters) { if (candidate.id === pip.dataset.go) break; start += candidate.length; }
    const top = deck.getBoundingClientRect().top + scrollY + (start + (start ? 0.03 : 0)) * stage.offsetHeight;
    scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  });
}

// On pointer devices the card leans towards the cursor.
if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const tilt = $('.tilt');
  stage.addEventListener('pointermove', event => {
    const box = card.getBoundingClientRect();
    const x = (event.clientX - (box.left + box.width / 2)) / innerWidth;
    const y = (event.clientY - (box.top + box.height / 2)) / innerHeight;
    tilt.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`);
    tilt.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
  });
  stage.addEventListener('pointerleave', () => { tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg'); });
}

/* ---- The full hand ---- */
const hand = $('#hand');
const handCards = $$('.hand-card');
const cta = $('#hand-cta');
const ctaText = $('#hand-cta-text');
const ctaDefault = ctaText.textContent;

for (const button of handCards) {
  button.addEventListener('click', () => {
    const select = button.getAttribute('aria-pressed') !== 'true';
    for (const other of handCards) other.setAttribute('aria-pressed', String(select && other === button));
    cta.href = select ? button.dataset.wa : cta.dataset.default;
    ctaText.textContent = select ? `${ctaDefault} על ${button.dataset.name}` : ctaDefault;
  });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { hand.classList.add('is-dealt'); observer.disconnect(); }
  }, { threshold: 0.2 });
  observer.observe(hand);
} else hand.classList.add('is-dealt');

/* ---- Opening: the face-down card turns over ---- */
update();
setTimeout(() => {
  revealed = true;
  if (chapter === 'joker') turnTo('joker');
}, reduced ? 0 : 700);
if ('requestIdleCallback' in window) requestIdleCallback(loadShots, { timeout: 2500 }); else setTimeout(loadShots, 1500);
