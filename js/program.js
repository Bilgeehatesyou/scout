/* ============================================================
   program.js — program.html sticky tab navigation
   ============================================================ */
(function () {
  const tabs      = document.querySelectorAll('.prog-tab');
  const tabsBar   = document.querySelector('.prog-tabs-bar');
  const nav       = document.getElementById('main-nav');
  const sectionIds = ['intro', 'ages', 'badges', 'curriculum', 'training'];
  const sections  = sectionIds.map(id => document.getElementById(id));

  if (!tabs.length || !tabsBar) return;

  function getOffset() {
    return (nav ? nav.offsetHeight : 70) + tabsBar.offsetHeight + 10;
  }

  /* Active tab тодруулах */
  function updateActive() {
    const offset  = getOffset();
    let current   = sections[0];
    sections.forEach(s => {
      if (s && window.scrollY >= s.offsetTop - offset) current = s;
    });
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('href') === '#' + (current?.id || ''));
    });
  }

  /* Smooth scroll on tab click */
  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(tab.getAttribute('href'));
      if (!target) return;
      window.scrollTo({ top: target.offsetTop - getOffset(), behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();