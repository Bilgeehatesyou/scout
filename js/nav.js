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

/* ── PATTERN TOGGLE — ALL pages ── */
(function () {
  const KEY = 'scout-pattern-all';

  const stored = localStorage.getItem(KEY);
  const isOn   = stored === null ? true : stored === 'true';
  if (isOn) document.body.classList.add('show-pattern');

  const btn = document.createElement('button');
  btn.className = 'pattern-switch' + (isOn ? ' pattern-switch--on' : '');
  btn.setAttribute('aria-label', 'Pattern toggle');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pattern-switch__icon">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  `;

  btn.addEventListener('click', () => {
    const nowOn = document.body.classList.toggle('show-pattern');
    localStorage.setItem(KEY, String(nowOn));
    btn.classList.toggle('pattern-switch--on', nowOn);
    document.body.style.backgroundImage = nowOn
      ? "url('/img/logo/pattern_grey_color.png')"
      : 'none';
  });

  document.body.appendChild(btn);
})();