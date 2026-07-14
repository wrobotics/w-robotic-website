const button = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');

document.documentElement.classList.add('motion-ready');

requestAnimationFrame(() => {
  requestAnimationFrame(() => hero?.classList.add('hero-loaded'));
});

const revealItems = document.querySelectorAll(
  '.section:not(.hero) .section-heading, .lead-card, .contact-panel',
);
const revealGroups = document.querySelectorAll(
  '.achievement-layout, .values-grid, .programme-grid, .journey, .join-grid',
);

revealItems.forEach((item) => item.classList.add('reveal'));
revealGroups.forEach((group) => group.classList.add('reveal-group'));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
);

[...revealItems, ...revealGroups].forEach((item) => revealObserver.observe(item));

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

button?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  });
});
