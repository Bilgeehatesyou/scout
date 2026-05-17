/* ============================================================
   form.js — Join form submit + Age card click
   ============================================================ */

/* ── Join form submission ── */
(function () {
  const form = document.getElementById('joinForm');
  if (!form) return;

  const btn = document.getElementById('joinSubmitBtn');
  const successEl = document.getElementById('joinSuccess');
  const errorEl   = document.getElementById('joinError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    successEl.hidden = true;
    errorEl.hidden = true;

    const fd = new FormData(form);
    const payload = {
      firstName: (fd.get('firstName') || '').trim(),
      lastName:  (fd.get('lastName') || '').trim(),
      email:     (fd.get('email') || '').trim(),
      phone:     (fd.get('phone') || '').trim(),
      age:       (fd.get('age') || '').trim(),
      location:  (fd.get('location') || '').trim(),
      message:   (fd.get('message') || '').trim(),
    };

    if (!payload.firstName || !payload.lastName || !payload.email) {
      errorEl.textContent = 'Овог, нэр, имэйл шаардлагатай.';
      errorEl.hidden = false;
      return;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Илгээж байна...';

    try {
      const r = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('Submit failed');
      successEl.hidden = false;
      form.reset();
    } catch (err) {
      errorEl.textContent = 'Илгээх үед алдаа гарлаа. Дахин оролдоно уу.';
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
})();

/* ── Age card click — active card swap ── */
(function () {
  const cards = document.querySelectorAll('.age-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('age-card--featured'));
      card.classList.add('age-card--featured');
    });
  });
})();
