const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const mobile = matchMedia('(max-width: 760px)');

/* A living capture: fetch the long capture of the site only when it is needed, then let CSS tour it. */
const goLive = img => {
  if (!img || reduceMotion.matches) return;
  if (!img.getAttribute('src')) img.src = img.dataset.src;
  (img.decode ? img.decode() : Promise.resolve()).then(() => img.classList.add('is-ready')).catch(() => {});
};

/* ---------- Mobile menu ---------- */
const menuButton = $('.menu-toggle');
const navigation = $('#site-nav');
function closeMenu() {
  if (!menuButton) return;
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
  document.body.style.overflow = '';
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) navigation.querySelector('a')?.focus({ preventScroll: true });
});
navigation?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
});
document.addEventListener('focusin', event => {
  if (menuButton?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
});
mobile.addEventListener('change', event => { if (!event.matches) closeMenu(); });

/* ---------- Header: change state only after deliberate movement in one direction ---------- */
const header = $('.site-header');
if (header) {
  let lastY = scrollY, travel = 0, queued = false;
  const update = () => {
    queued = false;
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - lastY;
    if (delta !== 0) travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
    const menuOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    if (menuOpen || y <= 160 || header.contains(document.activeElement)) {
      header.classList.remove('is-hidden');
      travel = 0;
    } else if (travel >= 16) {
      header.classList.add('is-hidden');
      travel = 0;
    } else if (travel <= -12) {
      header.classList.remove('is-hidden');
      travel = 0;
    }
    lastY = y;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  document.addEventListener('focusin', event => { if (event.target.closest('.site-header')) header.classList.remove('is-hidden'); });
}

/* ---------- Catalog strip: arrows and drag-to-scroll on desktop ---------- */
for (const catalog of $$('.catalog')) {
  const strip = $('.strip', catalog);
  if (!strip) continue;
  const step = () => { const item = $('.strip-item', strip); return item ? item.getBoundingClientRect().width + 20 : strip.clientWidth * 0.8; };
  const dots = $$('.strip-dots i', catalog);
  if (dots.length && 'IntersectionObserver' in window) {
    const items = $$('.strip-item', strip);
    const follow = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) dots.forEach((dot, i) => dot.classList.toggle('is-on', i === items.indexOf(entry.target)));
    }, { root: strip, threshold: 0.6 });
    items.forEach(item => follow.observe(item));
  }
  for (const button of $$('.strip-btn', catalog)) button.addEventListener('click', () => strip.scrollBy({ left: -Number(button.dataset.dir) * step(), behavior: 'smooth' }));
  if (!finePointer.matches) continue;
  let startX = 0, startLeft = 0, dragging = false, moved = false;
  strip.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true; moved = false; startX = event.clientX; startLeft = strip.scrollLeft;
    strip.setPointerCapture(event.pointerId);
  });
  strip.addEventListener('pointermove', event => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 5 && !moved) { moved = true; strip.classList.add('is-dragging'); }
    if (moved) strip.scrollLeft = startLeft - dx;
  });
  const release = () => { if (!dragging) return; dragging = false; strip.classList.remove('is-dragging'); };
  strip.addEventListener('pointerup', release);
  strip.addEventListener('pointercancel', release);
  strip.addEventListener('click', event => { if (moved) { event.preventDefault(); moved = false; } }, true);
}

/* ---------- Hand of cards (phone hero): fan, drag the front card and flick it away ---------- */
const hand = $('.hand');
if (hand) {
  const cardEls = $$('.hand-card', hand);
  const count = cardEls.length;
  const half = Math.floor(count / 2);
  // The fan is a ring of fixed slots: card 0 starts in front, then +1, -1, +2, -2... in reading order.
  // A swipe turns the whole ring one slot in the finger's direction, so every card keeps its neighbours
  // and only the card that falls off one edge re-enters, unseen, at the other edge behind the fan.
  const base = cardEls.map((card, i) => i === 0 ? 0 : Math.ceil(i / 2) * (i % 2 ? 1 : -1));
  const wrap = p => ((p + half) % count + count) % count - half;
  let offset = 0;
  const posOf = i => wrap(base[i] + offset);
  const front = () => cardEls[base.findIndex((b, i) => posOf(i) === 0)];
  let liveOn = false; // the front card starts touring its site once the deal has landed
  const wake = () => { if (liveOn) goLive($('.live', front())); };
  const layout = () => { cardEls.forEach((card, i) => {
    const pos = posOf(i);
    const prev = Number(card.style.getPropertyValue('--pos'));
    if (card.style.getPropertyValue('--pos') !== '' && Math.abs(pos - prev) > half) {
      // this card went round the back of the ring: jump there without sliding through the front
      card.classList.add('no-transition');
      void card.offsetWidth;
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('no-transition')));
    }
    card.style.setProperty('--pos', pos);
    card.style.setProperty('--abs', Math.abs(pos));
    card.style.setProperty('--depth', Math.abs(pos));
    card.classList.toggle('is-front', pos === 0);
  }); wake(); };
  // dir = +1 turns the ring toward the start side in RTL (the front card slides left, the card on its right comes forward)
  const turn = steps => { offset -= steps; layout(); };
  layout();
  if (!reduceMotion.matches) {
    // Phones: the hand sits under the headline on the first screen. The cards spring out into the fan once
    // when it is in view, then the front card comes alive.
    const cardsBox = $('.hand-cards', hand);
    const comeAlive = () => { liveOn = true; wake(); };
    if (cardsBox && 'IntersectionObserver' in window && mobile.matches) {
      hand.classList.add('is-waiting');
      const dealObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) return;
        dealObserver.unobserve(hand);
        // A short local entrance avoids pulling cards across the screen on scroll.
        hand.style.setProperty('--from-y', '18px');
        hand.style.setProperty('--from-s', '1');
        hand.classList.remove('is-waiting');
        hand.classList.add('is-dealing');
        setTimeout(comeAlive, 1100);
      }, { threshold: [0, 0.3] });
      dealObserver.observe(hand);
    } else if (mobile.matches) comeAlive(); // the hand is hidden on larger screens, so its capture is never fetched there
    const markTouched = () => { hand.classList.add('is-touched'); };
    // Drag: the front card follows the pointer; a decisive drag turns the ring that way, a short one springs back.
    let startX = 0, startY = 0, dragging = false, moved = false, held = null, pointerId = null, pressed = null;
    // Phones nudge a tap toward the nearest large link, so a touch on the thin edge of a card behind lands on its
    // bigger neighbour. The card under the raw touch point is the one the visitor meant.
    const cardAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.hand-card'); };
    const settle = () => { if (held) { held.classList.remove('is-dragging'); held.style.translate = ''; held.style.rotate = ''; } dragging = false; held = null; };
    hand.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true; moved = false; startX = event.clientX; startY = event.clientY; pointerId = event.pointerId;
      markTouched();
      held = front();
      pressed = cardAt(event.clientX, event.clientY) || event.target.closest('.hand-card');
    });
    hand.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!moved) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        moved = true; markTouched();
        held.classList.add('is-dragging');
        try { hand.setPointerCapture(pointerId); } catch {}
      }
      held.style.translate = `${dx}px ${Math.abs(dx) * -0.12}px`;
      held.style.rotate = `${dx * 0.06}deg`;
    });
    const release = event => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const decisive = moved && Math.abs(dx) > 56;
      settle();
      if (decisive) turn(dx < 0 ? 1 : -1);
    };
    hand.addEventListener('pointerup', release);
    hand.addEventListener('pointercancel', settle);
    hand.addEventListener('click', event => {
      if (moved) { event.preventDefault(); moved = false; return; }
      if (event.detail === 0) return; // keyboard activation: let the focused link work as a link
      const card = pressed || event.target.closest('.hand-card');
      pressed = null;
      if (!card) return;
      event.preventDefault();
      const i = cardEls.indexOf(card);
      if (posOf(i) !== 0) { markTouched(); turn(posOf(i)); }
      else location.assign(card.querySelector('a').href);
    });
  }
}

/* ---------- Pre-decode heavy captures just before they enter the viewport ---------- */
const heavy = $$('.hand, .card, .case .row, .stack-item');
if (heavy.length && 'IntersectionObserver' in window) {
  const warm = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      warm.unobserve(entry.target);
      for (const img of entry.target.querySelectorAll('img')) { img.loading = 'eager'; img.decode?.().catch(() => {}); }
    }
  }, { rootMargin: '120% 0px 120% 0px' });
  heavy.forEach(section => warm.observe(section));
}

/* ---------- Reveal on scroll ---------- */
const revealTargets = $$('.reveal');
if (revealTargets.length && 'IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  revealTargets.forEach(target => observer.observe(target));
} else revealTargets.forEach(target => target.classList.add('in'));

/* ---------- Floating WhatsApp: appears once the visitor is into the work, hidden over the contact block ---------- */
const floating = $('.wa-float');
const contact = $('#contact');
if (floating) {
  const start = $('#work') || $('main');
  let overContact = false, queued = false;
  const update = () => {
    queued = false;
    const past = start.getBoundingClientRect().top < innerHeight * 0.5;
    floating.classList.toggle('is-hidden', !past || overContact);
  };
  if (contact && 'IntersectionObserver' in window) new IntersectionObserver(([entry]) => { overContact = entry.isIntersecting; update(); }, { threshold: 0.1 }).observe(contact);
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- Cursor dot (fine pointers only) ---------- */
const cursor = $('.cursor');
if (cursor && finePointer.matches && !reduceMotion.matches && !mobile.matches) {
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0, on = false;
  const tick = () => {
    x += (tx - x) * 0.22; y += (ty - y) * 0.22;
    cursor.style.translate = `${x}px ${y}px`;
    if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) raf = requestAnimationFrame(tick); else raf = 0;
  };
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    tx = event.clientX; ty = event.clientY;
    if (!on) { on = true; cursor.classList.add('is-on'); x = tx; y = ty; }
    if (!raf) raf = requestAnimationFrame(tick);
    const work = event.target.closest('.work-link');
    cursor.classList.toggle('is-work', Boolean(work));
  }, { passive: true });
  document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.documentElement.addEventListener('pointerleave', () => { on = false; cursor.classList.remove('is-on'); });
}

/* ---------- Magnetic pills ---------- */
if (finePointer.matches && !reduceMotion.matches) {
  for (const pill of $$('.pill, .next-arrow, .menu-toggle')) {
    pill.addEventListener('pointermove', event => {
      const rect = pill.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      pill.style.translate = `${dx * 8}px ${dy * 8}px`;
    });
    pill.addEventListener('pointerleave', () => { pill.style.translate = ''; });
  }
}

/* ---------- Before / after slider ---------- */
for (const compare of $$('.ba')) {
  const input = $('input[type="range"]', compare);
  const apply = value => compare.style.setProperty('--cut', `${value}%`);
  input.addEventListener('input', () => apply(input.value));
  compare.addEventListener('pointerdown', event => {
    if (event.target === input) return;
    const rect = compare.getBoundingClientRect();
    const value = Math.round(((rect.right - event.clientX) / rect.width) * 100);
    input.value = Math.max(0, Math.min(100, value)); apply(input.value);
  });
}

/* Desktop fan: reveal once, keeping the visible stack and reduced-motion default usable. */
const desktopFan = $('.desktop-fan');
if (desktopFan) {
  let opened = false;
  const openFan = () => {
    if (opened) return;
    opened = true;
    desktopFan.classList.add('is-open');
    setTimeout(() => {
      desktopFan.classList.add('is-settled');
      setTimeout(() => goLive($('.live', desktopFan)), 500); // the centre card starts touring its site
    }, reduceMotion.matches ? 0 : 1350);
  };
  if (reduceMotion.matches || !('IntersectionObserver' in window)) openFan();
  else {
    const fanObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        fanObserver.disconnect();
        setTimeout(openFan, 1100); // let the peeking stack land and be seen first
      }
    }, { threshold: .2 });
    fanObserver.observe(desktopFan);
  }
  desktopFan.addEventListener('focusin', openFan);
  desktopFan.addEventListener('pointerenter', openFan);
  reduceMotion.addEventListener('change', event => { if (event.matches) openFan(); });
}

/* Featured panels: each frame tours its site while it is on screen and rests when it leaves. */
const tours = $$('.frame.auto');
if (tours.length && 'IntersectionObserver' in window && !reduceMotion.matches) {
  const tourObserver = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-live', entry.isIntersecting);
  }, { threshold: 0.35 });
  tours.forEach(frame => tourObserver.observe(frame));
}
