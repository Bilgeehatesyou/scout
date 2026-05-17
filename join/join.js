/* ============================================================
   join.js — /join page logic
   - Loads /api/groups, populates aimag + group dropdowns
   - Pre-fills from URL params (?aimag=khuvsgul or ?group=ub-1)
   - Submits to /api/applications
   ============================================================ */
(function () {
  const AIMAG_LABELS = {
    'arkhangai': 'Архангай',
    'bayankhongor': 'Баянхонгор',
    'bayan-olgii': 'Баян-Өлгий',
    'bulgan': 'Булган',
    'darkhan-uul': 'Дархан-Уул',
    'dornod': 'Дорнод',
    'dornogovi': 'Дорноговь',
    'dundgovi': 'Дундговь',
    'govi-altai': 'Говь-Алтай',
    'govisumber': 'Говьсүмбэр',
    'khentii': 'Хэнтий',
    'khovd': 'Ховд',
    'khuvsgul': 'Хөвсгөл',
    'omnogovi': 'Өмнөговь',
    'orkhon': 'Орхон',
    'ovorkhangai': 'Өвөрхангай',
    'selenge': 'Сэлэнгэ',
    'sukhbaatar': 'Сүхбаатар',
    'tov': 'Төв',
    'ulaanbaatar': 'Улаанбаатар',
    'uvs': 'Увс',
    'zavkhan': 'Завхан',
  };

  const aimagSelect = document.getElementById('aimagSelect');
  const groupSelect = document.getElementById('groupSelect');
  const form        = document.getElementById('joinPageForm');
  const btn         = document.getElementById('joinPageSubmit');
  const successEl   = document.getElementById('joinPageSuccess');
  const errorEl     = document.getElementById('joinPageError');

  let allGroups = [];
  let groupsByAimag = {};

  /* ── Populate aimag dropdown ── */
  Object.keys(AIMAG_LABELS).sort((a, b) => AIMAG_LABELS[a].localeCompare(AIMAG_LABELS[b], 'mn')).forEach(slug => {
    const opt = document.createElement('option');
    opt.value = slug;
    opt.textContent = AIMAG_LABELS[slug];
    aimagSelect.appendChild(opt);
  });

  /* ── Fetch groups ── */
  fetch('/api/groups')
    .then(r => r.ok ? r.json() : [])
    .catch(() => [])
    .then(groups => {
      allGroups = groups || [];
      groupsByAimag = {};
      allGroups.forEach(g => {
        if (!g.aimag) return;
        (groupsByAimag[g.aimag] = groupsByAimag[g.aimag] || []).push(g);
      });
      applyUrlPrefill();
    });

  /* ── Aimag change → repopulate group dropdown ── */
  aimagSelect.addEventListener('change', () => {
    refreshGroupSelect(aimagSelect.value);
  });

  function refreshGroupSelect(aimagSlug, preselectGroupId) {
    groupSelect.innerHTML = '';
    if (!aimagSlug) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Эхлээд аймгаа сонгоно уу';
      groupSelect.appendChild(opt);
      groupSelect.disabled = true;
      return;
    }
    const list = groupsByAimag[aimagSlug] || [];
    if (!list.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Энэ аймагт бүлгэм байхгүй байна';
      groupSelect.appendChild(opt);
      groupSelect.disabled = true;
      return;
    }
    groupSelect.disabled = false;
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = 'Аль ч бүлгэм (бид санал болгоно)';
    groupSelect.appendChild(emptyOpt);
    list.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name + (g.sum ? ' — ' + g.sum : '');
      groupSelect.appendChild(opt);
    });
    if (preselectGroupId) groupSelect.value = preselectGroupId;
  }

  /* ── URL prefill (?aimag=khuvsgul or ?group=ub-1) ── */
  function applyUrlPrefill() {
    const params = new URLSearchParams(location.search);
    const groupId = params.get('group');
    let aimag = params.get('aimag');

    // If a group is given, derive aimag from it
    if (groupId) {
      const g = allGroups.find(x => x.id === groupId);
      if (g && g.aimag) aimag = g.aimag;
    }
    if (aimag && AIMAG_LABELS[aimag]) {
      aimagSelect.value = aimag;
      refreshGroupSelect(aimag, groupId || '');
    }
  }

  /* ── Form submit ── */
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
      aimag:     (fd.get('aimag') || '').trim(),
      groupId:   (fd.get('groupId') || '').trim(),
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
      refreshGroupSelect('');
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    } catch (err) {
      errorEl.textContent = 'Илгээх үед алдаа гарлаа. Дахин оролдоно уу.';
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
})();
