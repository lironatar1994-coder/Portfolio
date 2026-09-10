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

/* ---------- Scroll-progress fallback where CSS scroll timelines are missing (older Safari, Firefox) ---------- */
const timelines = window.CSS && CSS.supports('animation-timeline: view()');
const tracks = $$('.stage-track');
const hero = $('.hero');
const stripCards = []; // catalog cards show the top of each site; no scroll-linked motion
if (!timelines && !reduceMotion.matches && (tracks.length || hero || stripCards.length)) {
  let queued = false;
  const clamp = value => Math.min(1, Math.max(0, value));
  const update = () => {
    queued = false;
    const viewport = innerHeight;
    if (hero) hero.style.setProperty('--p', clamp(scrollY / (viewport * 1.1)).toFixed(4));
    for (const track of tracks) {
      const rect = track.getBoundingClientRect();
      const total = rect.height - viewport;
      if (total <= 0 || rect.bottom < 0 || rect.top > viewport) continue;
      track.style.setProperty('--p', clamp(-rect.top / total).toFixed(4));
    }
    for (const card of stripCards) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewport) continue;
      // mirrors animation-range "entry 30% exit 70%"
      const start = viewport - rect.height * 0.3, end = -rect.height * 0.7;
      card.style.setProperty('--p', clamp((start - rect.top) / (start - end)).toFixed(4));
    }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
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
  let active = 0, touched = false, away = false;
  const layout = () => cardEls.forEach((card, i) => {
    let pos = ((i - active) % count + count) % count;
    if (pos > count / 2) pos -= count; // spread both sides of the front card
    card.style.setProperty('--pos', pos);
    card.style.setProperty('--abs', Math.abs(pos));
  });
  // dir = +1 brings the next card forward (swipe toward the start side in RTL), the leaving card flies the way the finger went
  const shuffle = dir => {
    const leaving = cardEls[active];
    leaving.style.setProperty('--fly', -dir);
    leaving.classList.remove('is-dragging');
    leaving.classList.add('is-flying');
    active = ((active + dir) % count + count) % count;
    layout(); // the others start sliding forward while the leaving card is still on top
    setTimeout(() => {
      leaving.classList.add('no-transition');
      leaving.classList.remove('is-flying');
      leaving.style.translate = ''; leaving.style.rotate = '';
      void leaving.offsetWidth;
      leaving.classList.remove('no-transition');
    }, 440);
  };
  layout();
  if (!reduceMotion.matches) {
    const timer = setInterval(() => { if (!touched && !away && !document.hidden) shuffle(1); }, 3800);
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { away = !entry.isIntersecting; }, { threshold: 0.2 }).observe(hand);
    const markTouched = () => { touched = true; hand.classList.add('is-touched'); };
    // Drag: the front card follows the pointer; a decisive drag flicks it away, a short one springs back.
    let startX = 0, startY = 0, dragging = false, moved = false, front = null, pointerId = null;
    const settle = () => { if (front) { front.classList.remove('is-dragging'); front.style.translate = ''; front.style.rotate = ''; } dragging = false; front = null; };
    hand.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true; moved = false; startX = event.clientX; startY = event.clientY; pointerId = event.pointerId;
      front = cardEls[active];
    });
    hand.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointerId) return;
      const dx = event.clientX - startX, dy = event.clientY - startY;
      if (!moved) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        moved = true; markTouched();
        front.classList.add('is-dragging');
        try { hand.setPointerCapture(pointerId); } catch {}
      }
      front.style.translate = `${dx}px ${Math.abs(dx) * -0.12}px`;
      front.style.rotate = `${dx * 0.06}deg`;
    });
    const release = event => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (moved && Math.abs(dx) > 56) { const leaving = front; front = null; dragging = false; leaving.classList.remove('is-dragging'); shuffle(dx < 0 ? 1 : -1); }
      else settle();
    };
    hand.addEventListener('pointerup', release);
    hand.addEventListener('pointercancel', settle);
    hand.addEventListener('click', event => {
      if (moved) { event.preventDefault(); moved = false; return; }
      const card = event.target.closest('.hand-card');
      if (card && cardEls.indexOf(card) !== active) { event.preventDefault(); markTouched(); active = cardEls.indexOf(card); layout(); }
    });
    addEventListener('pagehide', () => clearInterval(timer));
  }
}

/* ---------- Pre-decode heavy captures just before they enter the viewport ---------- */
const heavy = $$('.hand, .stage-track, .strip-item, .case .row, .case-full, .hero-float');
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

/* ---------- Floating WhatsApp: visible after the hero, hidden over the contact block ---------- */
const floating = $('.wa-float');
const contact = $('#contact');
if (floating && 'IntersectionObserver' in window) {
  const covering = new Set();
  const watcher = new IntersectionObserver(entries => {
    for (const entry of entries) entry.isIntersecting ? covering.add(entry.target) : covering.delete(entry.target);
    floating.classList.toggle('is-hidden', covering.size > 0);
  }, { threshold: 0.15 });
  for (const section of [contact, $('.hero')]) if (section) watcher.observe(section);
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
