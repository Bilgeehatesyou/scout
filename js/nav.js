/* ============================================================
   nav.js — Nav scroll өнгө + Reveal on scroll
   index.html болон program.html хоёуланд хэрэглэнэ
   ============================================================ */

/* ── Nav scroll: цэнхэр → цагаан ── */
(function () {
  const nav       = document.querySelector('nav');
  const THRESHOLD = 80;

  function onScroll() {
    nav.classList.toggle('nav-scrolled', window.scrollY > THRESHOLD);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Reveal on scroll ── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();