/* ============================================================
   form.js — Join form товч + Age card click select
   ============================================================ */

/* ── Form button visual feedback ── */
(function () {
  const btn = document.querySelector('.join-form .btn-primary');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const original = this.textContent;
    this.textContent = '✓ Маягт нээгдэж байна...';
    this.classList.add('btn-primary--loading');
    setTimeout(() => {
      this.textContent = original;
      this.classList.remove('btn-primary--loading');
    }, 2000);
  });
})();

/* ── Age card click — active card солих ── */
(function () {
  const cards = document.querySelectorAll('.age-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('age-card--featured'));
      card.classList.add('age-card--featured');
    });
  });
})();