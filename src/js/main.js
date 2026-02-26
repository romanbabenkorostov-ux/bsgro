/* ===== Fade-up animation on scroll ===== */
const faders = document.querySelectorAll('.fade-up');
const obsOpts = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, obsOpts);
faders.forEach(f => observer.observe(f));

/* ===== Animate bar fills on scroll ===== */
const bars = document.querySelectorAll('.bar-fill[data-width]');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.width = e.target.dataset.width;
      barObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
bars.forEach(b => barObs.observe(b));

/* ===== Active nav link on scroll (index page only) ===== */
(function() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });
})();

/* ===== Mobile navbar: auto-close on link/dropdown-item click ===== */
(function() {
  const navCollapse = document.getElementById('navContent');
  if (!navCollapse) return;

  // Get Bootstrap Collapse instance (created by bootstrap.bundle.min.js)
  function getCollapseInstance() {
    return bootstrap.Collapse.getInstance(navCollapse);
  }

  // Close menu when any nav-link or dropdown-item is clicked (mobile only)
  navCollapse.addEventListener('click', function(e) {
    const link = e.target.closest('a.nav-link, a.dropdown-item');
    if (!link) return;

    // Only act when navbar is in mobile collapsed mode
    if (!navCollapse.classList.contains('show')) return;

    // Skip dropdown toggles — they should open the submenu, not close the navbar
    if (link.classList.contains('dropdown-toggle')) return;

    // Close the navbar
    const bsCollapse = getCollapseInstance();
    if (bsCollapse) {
      bsCollapse.hide();
    }
  });
})();
