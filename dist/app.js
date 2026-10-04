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

/* A hand that turns by itself: every few seconds the next project comes to the front, the caption names it and a
   line runs to the next turn. It rests while hovered or focused, while off screen and while the tab is hidden, and
   stops for good once the visitor pauses it or takes over. Reduced motion starts it paused. */
const TURN_EVERY = 4000;
function rotator(root, cycleEl, advance, frontCard) {
  const toggle = $('.cycle-toggle', cycleEl), text = $('.cycle-text', cycleEl);
  let timer = 0, holds = 0, visible = true, started = false, stopped = reduceMotion.matches;
  cycleEl.style.setProperty('--cycle', `${TURN_EVERY}ms`);
  const label = () => {
    toggle.setAttribute('aria-pressed', String(stopped));
    toggle.setAttribute('aria-label', stopped ? 'הפעלת ההחלפה האוטומטית' : 'עצירת ההחלפה האוטומטית');
  };
  const show = () => {
    const card = frontCard();
    if (!card) return;
    text.classList.add('is-swapping');
    setTimeout(() => {
      text.querySelector('strong').textContent = card.dataset.name;
      text.querySelector('span').textContent = card.dataset.kind;
      text.classList.remove('is-swapping');
    }, 220);
  };
  const run = () => {
    clearTimeout(timer);
    cycleEl.classList.remove('is-running');
    if (!started || stopped || holds > 0 || !visible || document.hidden) return;
    void cycleEl.offsetWidth; // restart the progress line from zero
    cycleEl.classList.add('is-running');
    timer = setTimeout(() => { advance(); show(); run(); }, TURN_EVERY);
  };
  const stop = () => { stopped = true; label(); run(); };
  toggle.addEventListener('click', () => { if (stopped) { stopped = false; label(); run(); } else stop(); });
  const hold = delta => { holds = Math.max(0, holds + delta); run(); };
  root.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') hold(1); });
  root.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') hold(-1); });
  root.addEventListener('focusin', () => hold(1));
  root.addEventListener('focusout', () => hold(-1));
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }, { threshold: 0.25 }).observe(root);
  document.addEventListener('visibilitychange', run);
  label();
  return { start: () => { started = true; run(); }, stop, show };
}

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
  let handTurns = null; // the hand turns by itself once the deal has landed (see rotator)
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
  }); };
  // dir = +1 turns the ring toward the start side in RTL (the front card slides left, the card on its right comes forward)
  const turn = steps => { offset -= steps; layout(); };
  layout();
  if (!reduceMotion.matches) {
    // Phones: the hand sits under the headline on the first screen. The cards spring out into the fan once
    // when it is in view, then the front card comes alive.
    const cardsBox = $('.hand-cards', hand);
    const handCycle = $('.cycle', hand);
    if (handCycle) handTurns = rotator(hand, handCycle, () => turn(1), front);
    const comeAlive = () => handTurns?.start();
    if (cardsBox && 'IntersectionObserver' in window && mobile.matches) {
      hand.classList.add('is-waiting', 'is-closed');
      const dealObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) return;
        dealObserver.unobserve(hand);
        // Same opening as the desktop fan: the cards are dealt onto a tight stack one by one, from the back of
        // the hand to the front card, hold for a beat, then spring open. Then the hand starts turning by itself.
        const rank = [...cardEls].sort((a, b) => Number(b.style.getPropertyValue('--abs')) - Number(a.style.getPropertyValue('--abs'))
          || Number(b.style.getPropertyValue('--pos')) - Number(a.style.getPropertyValue('--pos')));
        rank.forEach((card, i) => { card.style.setProperty('--deal', i); card.style.setProperty('--spin', `${(i % 2 ? 1 : -1) * (14 - i)}deg`); });
        hand.style.setProperty('--from-y', '70vh');
        hand.classList.remove('is-waiting');
        hand.classList.add('is-dealing');
        const landed = 150 + (rank.length - 1) * 105 + 750; // the front card's landing, matching the CSS stagger
        setTimeout(() => {
          hand.classList.add('is-opening');
          hand.classList.remove('is-closed');
          setTimeout(() => { hand.classList.remove('is-opening'); comeAlive(); }, 1500);
        }, landed + 250);
      }, { threshold: [0, 0.3] });
      dealObserver.observe(hand);
    } else if (mobile.matches) comeAlive(); // the hand is hidden on larger screens, so it never turns there
    const markTouched = () => { hand.classList.add('is-touched'); handTurns?.stop(); }; // the visitor has taken over
    // Drag: the front card follows the pointer; a decisive drag turns the ring that way, a short one springs back.
    let startX = 0, startY = 0, dragging = false, moved = false, held = null, pointerId = null, pressed = null;
    // Phones nudge a tap toward the nearest large link, so a touch on the thin edge of a card behind lands on its
    // bigger neighbour. The card under the raw touch point is the one the visitor meant.
    const cardAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.hand-card'); };
    const settle = () => { if (held) { held.classList.remove('is-dragging'); held.style.translate = ''; held.style.rotate = ''; } dragging = false; held = null; };
    hand.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('.cycle')) return; // the pause button is not a card
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
      for (const img of entry.target.querySelectorAll('img')) {
        if (img.checkVisibility && !img.checkVisibility()) continue; // hidden on this screen size: never fetch it
        img.loading = 'eager'; img.decode?.().catch(() => {});
      }
    }
  }, { rootMargin: '120% 0px 120% 0px' });
  // only once the first screen has loaded, so preloading never competes with what the visitor sees first
  const startWarm = () => setTimeout(() => heavy.forEach(section => warm.observe(section)), 1200);
  if (document.readyState === 'complete') startWarm(); else addEventListener('load', startWarm, { once: true });
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

/* Template vs. our site: the line sweeps once when it comes into view, so it is obvious it can be dragged. */
for (const vs of $$('.ba.vs')) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) break;
  const input = $('input[type="range"]', vs);
  let touched = false;
  vs.addEventListener('pointerdown', () => { touched = true; });
  input.addEventListener('input', event => { if (event.isTrusted) touched = true; });
  const sweep = () => {
    const keys = [50, 22, 80, 50], leg = 650, start = performance.now();
    const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const step = now => {
      if (touched) return;
      const t = (now - start) / leg, i = Math.min(Math.floor(t), keys.length - 2);
      const value = keys[i] + (keys[i + 1] - keys[i]) * ease(Math.min(1, t - i));
      input.value = value; vs.style.setProperty('--cut', `${value}%`);
      if (t < keys.length - 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  new IntersectionObserver(([entry], observer) => { if (entry.isIntersecting) { observer.disconnect(); setTimeout(sweep, 350); } }, { threshold: 0.6 }).observe(vs);
}

/* Desktop fan: reveal once, keeping the visible stack and reduced-motion default usable. Once open it turns by
   itself: every card owns a slot (-2..2) and a turn moves each one slot to the left, so the card on the right of the
   centre comes forward and the leftmost card swings round behind the hand to the far right. */
const desktopFan = $('.desktop-fan');
if (desktopFan) {
  let opened = false;
  const fanCards = $$('.fan-card', desktopFan);
  let fanOffset = 0;
  const slotOf = i => ((i - 2 + fanOffset + 2) % 5 + 5) % 5 - 2;
  const place = () => fanCards.forEach((card, i) => {
    const slot = slotOf(i), prev = Number(card.dataset.slot ?? i - 2);
    const wrapping = Math.abs(slot - prev) > 2;
    card.dataset.slot = slot;
    card.classList.toggle('is-wrapping', wrapping);
    card.classList.toggle('is-centre', slot === 0);
    card.style.setProperty('--angle', `${slot * 14}deg`);
    card.style.setProperty('--layer', wrapping ? 0 : 5 - Math.abs(slot));
    if (wrapping) setTimeout(() => { card.style.setProperty('--layer', 5 - Math.abs(slot)); card.classList.remove('is-wrapping'); }, 1100);
  });
  const fanCycle = $('.fan-stage .cycle');
  const fanTurns = fanCycle ? rotator(desktopFan, fanCycle, () => { fanOffset -= 1; place(); }, () => $('.fan-card.is-centre', desktopFan)) : null;
  const openFan = () => {
    if (opened) return;
    opened = true;
    desktopFan.classList.add('is-open');
    setTimeout(() => {
      desktopFan.classList.add('is-settled');
      fanTurns?.start();
      // a card tours its site under the pointer or keyboard focus (and the hand rests meanwhile)
      for (const card of $$('.fan-card', desktopFan)) {
        const wake = () => goLive($('.live', card));
        card.addEventListener('pointerenter', wake);
        card.addEventListener('focusin', wake);
      }
    }, reduceMotion.matches ? 0 : 1350);
  };
  if (reduceMotion.matches || !('IntersectionObserver' in window)) openFan();
  else {
    const fanObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        fanObserver.disconnect();
        // The cards are dealt from page load (CSS); open once the front card has landed and been seen.
        setTimeout(openFan, Math.max(300, 1850 - performance.now()));
      }
    }, { threshold: .2 });
    fanObserver.observe(desktopFan);
  }
  desktopFan.addEventListener('focusin', openFan);
  desktopFan.addEventListener('pointerenter', () => { if (performance.now() > 1650) openFan(); }); // never cut the deal short
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

/* ---------- Leads: report every WhatsApp, call and form contact (Google Ads tag only on the landing page) ---------- */
const trackLead = method => {
  window.dataLayer?.push({ event: 'lead', method });
  const leadTo = window.LA_ADS?.lead;
  if (leadTo && typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: leadTo });
};
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="https://wa.me"], a[href^="tel:"]');
  if (link) trackLead(link.href.startsWith('tel:') ? 'call' : 'whatsapp');
});

/* ---------- Landing page form: write the WhatsApp message from the visitor's answers ---------- */
for (const lead of $$('form.lead')) { // one beside the hero (desktop), one after the proof (phones)
  // A missing answer gets a gentle nudge instead of the browser's bubble alone.
  lead.addEventListener('invalid', event => {
    const field = event.target;
    field.classList.remove('is-missing'); void field.offsetWidth; field.classList.add('is-missing');
    field.addEventListener('input', () => field.classList.remove('is-missing'), { once: true });
  }, true);
  lead.addEventListener('submit', event => {
    event.preventDefault();
    // the button confirms with a drawn check for a moment, then returns to its label
    const button = $('.lead-submit', lead);
    if (button && !button.classList.contains('is-sent')) {
      const label = button.innerHTML;
      button.classList.add('is-sent');
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg> נפתח בוואטסאפ';
      setTimeout(() => { button.classList.remove('is-sent'); button.innerHTML = label; }, 3500);
    }
    const data = new FormData(lead);
    const need = String(data.get('w') || '');
    const ask = need && !need.startsWith('עוד לא') ? `אשמח לשמוע על ${need} לעסק שלי.` : 'אשמח לשמוע מה יתאים לעסק שלי.';
    const text = `היי LA webs, אני ${String(data.get('n')).trim()} (${String(data.get('b')).trim()}). ${ask}`;
    const url = `${lead.action}?text=${encodeURIComponent(text)}`;
    trackLead('form');
    const opened = window.open(url, '_blank'); // ('noopener' would make this always null, so the opener is cut by hand)
    if (opened) opened.opener = null;
    else location.href = url; // a blocked pop-up still reaches WhatsApp
  });
}

/* ---------- Landing page deck: deal the project cards behind the form when it comes into view ---------- */
const deck = $('.lead-deck');
if (deck) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) deck.classList.add('is-dealt');
  else new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    deck.classList.add('is-dealt');
  }, { threshold: 0.15 }).observe(deck);
}

/* ---------- Works stack depth: each panel recedes as the next one slides over it (desktop, where they stack) ---------- */
const stackItems = $$('.stack-item');
if (stackItems.length > 1 && !reduceMotion.matches) {
  let queued = false;
  const update = () => {
    queued = false;
    const stuck = getComputedStyle(stackItems[0]).position === 'sticky';
    stackItems.forEach((item, i) => {
      const next = stackItems[i + 1];
      if (!stuck || !next) { item.style.removeProperty('--cover'); return; }
      // 0 while the next panel is below the fold, 1 once it has reached its own resting place
      const top = next.getBoundingClientRect().top, rest = parseFloat(getComputedStyle(next).top) || 0;
      const p = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight - rest)));
      item.style.setProperty('--cover', p.toFixed(3));
    });
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
}
