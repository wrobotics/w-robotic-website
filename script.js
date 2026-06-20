const button = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

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
