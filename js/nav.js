/* ============================================================
   nav.js — Nav scroll өнгө + Reveal on scroll
   Бүх хуудсанд хэрэглэнэ
   ============================================================ */

/* ── Nav scroll behavior ──
   Events хуудсанд:  анхандаа primary blue → scroll хийхэд цагаан
   Бусад хуудасд:    анхандаа transparent → scroll хийхэд цагаан
   CSS-д events.css нь #main-nav анхны өнгийг override хийнэ      */
(function () {
  const nav       = document.querySelector('nav');
  if (!nav) return;
  const THRESHOLD = 80;

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Анхны байдлыг шалгана
})();

/* ── Hamburger menu ── */
(function () {
  const hamburger = document.getElementById('navHamburger');
  const navUl     = document.querySelector('nav ul');
  if (!hamburger || !navUl) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navUl.classList.toggle('open');
  });

  navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navUl.classList.remove('open');
    });
  });
})();

/* ── Reveal on scroll ── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);

        if (entry.target.querySelector('#actCarousel')) {
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('carousel-reveal'));
          });
        }
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ── Decorative background pattern ──
   The standalone toggle button was removed (it duplicated the theme
   switch and confused users). The pattern is simply on by default in
   light mode; dark mode hides it via CSS. */
(function () {
  document.body.classList.add('show-pattern');
})();