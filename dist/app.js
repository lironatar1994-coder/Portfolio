const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const mobile = matchMedia('(max-width: 760px)');

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

/* ---------- Hero: rotating word with a redrawn underline ---------- */
const swap = $('.swap');
if (swap && !reduceMotion.matches) {
  const words = $$('.swap-word', swap);
  const line = $('.swap-line', swap);
  const title = $('#hero-title');
  let current = Math.max(0, words.findIndex(word => word.classList.contains('is-active')));
  // The slot follows the active word's width so the period never drifts away from shorter words.
  const fit = word => { swap.style.width = Math.ceil(word.getBoundingClientRect().width) + 'px'; };
  document.fonts.ready.then(() => fit(words[current]));
  addEventListener('resize', () => fit(words[current]));
  setInterval(() => {
    if (document.hidden) return;
    const previous = words[current];
    current = (current + 1) % words.length;
    const next = words[current];
    previous.classList.remove('is-active'); previous.classList.add('is-leaving');
    setTimeout(() => previous.classList.remove('is-leaving'), 520);
    next.classList.add('is-active');
    fit(next);
    line?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
    title?.setAttribute('aria-label', `נבנה לעסק שלך אתר תדמית ${next.textContent}.`);
  }, 2600);
}

/* ---------- Header: slides away while scrolling down, returns on the first scroll up ---------- */
const header = $('.site-header');
if (header) {
  let lastY = scrollY, queued = false;
  const update = () => {
    queued = false;
    const y = scrollY;
    const menuOpen = menuButton?.getAttribute('aria-expanded') === 'true';
    if (!menuOpen) header.classList.toggle('is-hidden', y > lastY + 4 && y > 160);
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

/* ---------- Hand of cards (phone hero): fan, drag the front card and flick it away, gentle auto-shuffle until touched ---------- */
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
  let offset = 0, touched = false, away = false;
  const posOf = i => wrap(base[i] + offset);
  const front = () => cardEls[base.findIndex((b, i) => posOf(i) === 0)];
  const layout = () => cardEls.forEach((card, i) => {
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
  });
  // dir = +1 turns the ring toward the start side in RTL (the front card slides left, the card on its right comes forward)
  const turn = steps => { offset -= steps; layout(); };
  layout();
  if (!reduceMotion.matches) {
    // Phones: the cards peeking under the hero headline become the fan. When the hand enters the screen the
    // real cards start from the peek's size and place and spring out into the fan; leaving the screen resets it.
    const peek = $('.hero-peek'), cardsBox = $('.hand-cards', hand);
    if (peek && cardsBox && 'IntersectionObserver' in window && getComputedStyle(peek).display !== 'none') {
      hand.classList.add('is-waiting');
      let dealt = false;
      new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) { dealt = false; hand.classList.remove('is-dealing'); hand.classList.add('is-waiting'); peek.classList.remove('is-gone'); return; }
        if (dealt || entry.intersectionRatio < 0.3) return;
        dealt = true;
        const peekCard = $('.peek-card', peek), first = cardEls[0];
        const s = peekCard.offsetWidth / first.offsetWidth, h = first.offsetHeight;
        // scale happens about the fan pivot (50% 140%), so the top edge drops by (1 - s) * 1.4 * h
        const dy = peek.getBoundingClientRect().top - cardsBox.getBoundingClientRect().top - (1 - s) * 1.4 * h;
        hand.style.setProperty('--from-y', `${Math.round(dy)}px`);
        hand.style.setProperty('--from-s', s.toFixed(3));
        peek.classList.add('is-gone');
        hand.classList.remove('is-waiting');
        hand.classList.add('is-dealing');
      }, { threshold: [0, 0.3] }).observe(hand);
    }
    const timer = setInterval(() => { if (!touched && !away && !document.hidden) turn(1); }, 3800);
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { away = !entry.isIntersecting; }, { threshold: 0.2 }).observe(hand);
    const markTouched = () => { touched = true; hand.classList.add('is-touched'); };
    // Drag: the front card follows the pointer; a decisive drag turns the ring that way, a short one springs back.
    let startX = 0, startY = 0, dragging = false, moved = false, held = null, pointerId = null;
    const settle = () => { if (held) { held.classList.remove('is-dragging'); held.style.translate = ''; held.style.rotate = ''; } dragging = false; held = null; };
    hand.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true; moved = false; startX = event.clientX; startY = event.clientY; pointerId = event.pointerId;
      held = front();
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
      const card = event.target.closest('.hand-card');
      const i = cardEls.indexOf(card);
      if (card && posOf(i) !== 0) { event.preventDefault(); markTouched(); turn(posOf(i)); }
    });
    addEventListener('pagehide', () => clearInterval(timer));
  }
}

/* ---------- Pre-decode heavy captures just before they enter the viewport ---------- */
const heavy = $$('.hand, .card, .case .row, .hero-float');
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
