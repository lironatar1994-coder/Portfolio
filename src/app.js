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

/* ---------- Pinned stages: progress fallback where CSS scroll timelines are missing ---------- */
const tracks = $$('.stage-track');
if (tracks.length && !reduceMotion.matches && !(window.CSS && CSS.supports('animation-timeline: view()'))) {
  let queued = false;
  const update = () => {
    queued = false;
    const viewport = innerHeight;
    for (const track of tracks) {
      const rect = track.getBoundingClientRect();
      const total = rect.height - viewport;
      if (total <= 0 || rect.bottom < 0 || rect.top > viewport) continue;
      track.style.setProperty('--p', Math.min(1, Math.max(0, -rect.top / total)).toFixed(4));
    }
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------- Pre-decode heavy captures just before they enter the viewport ---------- */
const heavy = $$('.stage-track, .card, .case .row, .case-full, .hero-float');
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
