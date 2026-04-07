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
/* ── Hamburger menu ── */
(function () {
  const hamburger = document.getElementById('navHamburger');
  const navUl     = document.querySelector('nav ul');
  if (!hamburger || !navUl) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navUl.classList.toggle('open');
  });

  // Цэс дээр дарахад хаагдана
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

        /* Carousel-тай элемент visible болмогц render дуудна */
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


/* ── PATTERN TOGGLE ── */
(function () {
  const KEY = 'scout-pattern';

  const stored = localStorage.getItem(KEY);
  const isOn = stored === null ? true : stored === 'true';
  if (!isOn) document.body.classList.add('no-pattern');

  const btn = document.createElement('button');
  btn.className = 'pattern-switch' + (isOn ? ' pattern-switch--on' : '');
  btn.setAttribute('aria-label', 'Pattern toggle');
  btn.innerHTML = `
    <span class="pattern-switch__label">Pattern</span>
    <span class="pattern-switch__toggle"></span>
  `;

  btn.addEventListener('click', () => {
    const nowOn = document.body.classList.toggle('no-pattern');
    const patternOn = !nowOn;
    localStorage.setItem(KEY, String(patternOn));
    btn.classList.toggle('pattern-switch--on', patternOn);
  });

  document.body.appendChild(btn);
})();