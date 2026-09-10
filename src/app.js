const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const filters = document.querySelector('.filters');
if (filters) {
  filters.hidden = false;
  const projects = [...document.querySelectorAll('.work-card')];
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    projects.forEach(project => {
      const visible = button.dataset.filter === 'all' || project.dataset.category === button.dataset.filter;
      project.hidden = !visible;
      if (visible) count++;
    });
    document.querySelector('.work-grid').classList.toggle('is-filtered', button.dataset.filter !== 'all');
    document.querySelector('#filter-status').textContent = `מוצגות ${count} עבודות`;
  });
}

const gallery = document.querySelector('.hero-gallery');
const motionQuery = matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)');
let frame = 0;
if (gallery) {
  gallery.addEventListener('pointermove', event => {
    if (!motionQuery.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const bounds = gallery.getBoundingClientRect();
      gallery.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 16}px`);
      gallery.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 10}px`);
    });
  });
  function resetGallery() {
    cancelAnimationFrame(frame);
    gallery.style.setProperty('--pointer-x', '0px');
    gallery.style.setProperty('--pointer-y', '0px');
  }
  gallery.addEventListener('pointerleave', resetGallery);
  motionQuery.addEventListener('change', resetGallery);
}

const header = document.querySelector('.site-header');
if (header && 'IntersectionObserver' in window) {
  const sentinel = document.createElement('div');
  sentinel.className = 'header-sentinel';
  sentinel.setAttribute('aria-hidden', 'true');
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => header.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);
}
