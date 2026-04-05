/* ============================================================
   events-page.js — JSON-оос уншиж карт render хийнэ
   ============================================================ */
(function () {
  const UPCOMING_PER_PAGE = 4;  /* Нэг удаад харагдах тоо */
  const PAST_PER_PAGE     = 4;

  let upcomingAll = [];
  let pastAll     = [];
  let upcomingShown = 0;
  let pastShown     = 0;

  /* ── Fetch JSON ── */
fetch('./json/events.json')
  .then(r => {
    if (!r.ok) {
      throw new Error('JSON олдсонгүй: ' + r.status);
    }
    return r.json();
  })
  .then(data => {
    console.log('JSON амжилттай уншигдлаа:', data);

    upcomingAll = data.filter(e => e.status === 'upcoming' && !e.hidden);
    pastAll     = data.filter(e => e.status === 'past' && !e.hidden);

    renderUpcoming();
    renderPast();
  })
  .catch(err => console.error('events.json алдаа:', err));
  /* ══════════════════════════════════════════
     UPCOMING
  ══════════════════════════════════════════ */
  function renderUpcoming() {
    const featured  = upcomingAll.filter(e => e.featured);
    const regular   = upcomingAll.filter(e => !e.featured);

    /* Featured карт */
    const featuredEl = document.getElementById('ev-featured');
    if (featuredEl) {
      featuredEl.innerHTML = '';
      featured.forEach(ev => {
        featuredEl.insertAdjacentHTML('beforeend', buildFeaturedCard(ev));
      });
    }

    /* Regular карт — UPCOMING_PER_PAGE хүртэл */
    const regularEl = document.getElementById('ev-regular');
    if (regularEl) {
      const slice = regular.slice(0, UPCOMING_PER_PAGE);
      upcomingShown = slice.length;
      regularEl.innerHTML = '';
      slice.forEach(ev => {
        regularEl.insertAdjacentHTML('beforeend', buildCard(ev));
      });
    }

    updateBtn('ev-more-upcoming', upcomingShown, regular.length);
  }

  function loadMoreUpcoming() {
    const regular  = upcomingAll.filter(e => !e.featured);
    const regularEl = document.getElementById('ev-regular');
    if (!regularEl) return;
    const slice = regular.slice(upcomingShown, upcomingShown + UPCOMING_PER_PAGE);
    slice.forEach(ev => regularEl.insertAdjacentHTML('beforeend', buildCard(ev)));
    upcomingShown += slice.length;
    updateBtn('ev-more-upcoming', upcomingShown, regular.length);
  }

  /* ══════════════════════════════════════════
     PAST
  ══════════════════════════════════════════ */
  function renderPast() {
    const pastEl = document.getElementById('ev-past');
    if (!pastEl) return;
    const slice = pastAll.slice(0, PAST_PER_PAGE);
    pastShown = slice.length;
    pastEl.innerHTML = '';
    slice.forEach(ev => pastEl.insertAdjacentHTML('beforeend', buildCard(ev)));
    updateBtn('ev-more-past', pastShown, pastAll.length);
  }

  function loadMorePast() {
    const pastEl = document.getElementById('ev-past');
    if (!pastEl) return;
    const slice = pastAll.slice(pastShown, pastShown + PAST_PER_PAGE);
    slice.forEach(ev => pastEl.insertAdjacentHTML('beforeend', buildCard(ev)));
    pastShown += slice.length;
    updateBtn('ev-more-past', pastShown, pastAll.length);
  }

  /* ══════════════════════════════════════════
     BUILDERS
  ══════════════════════════════════════════ */
  function buildFeaturedCard(ev) {
    return `
    <div class="ev-card ev-card--featured">
      ${buildImg(ev, true)}
      <div class="ev-card__body">
        <div class="ev-card__eyebrow">${esc(ev.eyebrow)}</div>
        <div class="ev-card__title">${esc(ev.title)}</div>
        ${ev.subtitle ? `<div class="ev-card__subtitle">${esc(ev.subtitle)}</div>` : ''}
        ${buildInfoList(ev)}
        <p class="ev-card__desc">${esc(ev.description)}</p>
        ${buildIncludes(ev)}
        ${buildBonus(ev)}
        ${buildBank(ev)}
        ${buildDeadline(ev)}
        ${buildContacts(ev)}
        ${buildActions(ev)}
      </div>
    </div>`;
  }

  function buildCard(ev) {
    const pastClass = ev.status === 'past' ? ' ev-card--past' : '';
    return `
    <div class="ev-card${pastClass}">
      ${buildImg(ev, false)}
      <div class="ev-card__body">
        <div class="ev-card__eyebrow">${esc(ev.eyebrow)}</div>
        <div class="ev-card__title">${esc(ev.title)}</div>
        ${ev.subtitle ? `<div class="ev-card__subtitle">${esc(ev.subtitle)}</div>` : ''}
        ${buildInfoList(ev)}
        <p class="ev-card__desc">${esc(ev.description)}</p>
        ${buildIncludes(ev)}
        ${buildBonus(ev)}
        ${buildBank(ev)}
        ${buildDeadline(ev)}
        ${buildContacts(ev)}
        ${buildActions(ev)}
      </div>
    </div>`;
  }

  function buildImg(ev, featured) {
    const style = ev.image
      ? `background-image: url('${ev.image}');`
      : (ev.imageBg ? `background: ${ev.imageBg};` : '');
    const intlClass = ev.badgeType === 'intl' ? ' ev-card__badge--intl' : '';
    return `
    <div class="ev-card__img" style="${style}">
      <span class="ev-card__badge${intlClass}">${esc(ev.badge)}</span>
    </div>`;
  }

  function buildInfoList(ev) {
    if (!ev.info) return '';
    const rows = [
      ev.info.location ? `<li><strong>Байршил</strong>${esc(ev.info.location)}</li>` : '',
      ev.info.date     ? `<li><strong>Огноо</strong>${esc(ev.info.date)}</li>`     : '',
      ev.info.age      ? `<li><strong>Нас</strong>${esc(ev.info.age)}</li>`        : '',
      ev.info.fee      ? `<li><strong>Төлбөр</strong>${esc(ev.info.fee)}</li>`    : '',
    ].filter(Boolean).join('');
    return rows ? `<ul class="ev-info-list">${rows}</ul>` : '';
  }

  function buildIncludes(ev) {
    if (!ev.includes || ev.includes.length === 0) return '';
    const chips = ev.includes.map(c => `<span class="ev-chip">${esc(c)}</span>`).join('');
    return `
      <div class="ev-includes-label">Төлбөрт багтах зүйлс</div>
      <div class="ev-includes">${chips}</div>`;
  }

  function buildBonus(ev) {
    if (!ev.bonus) return '';
    return `<div class="ev-bonus">&nbsp;${esc(ev.bonus)}</div>`;
  }

  function buildBank(ev) {
    if (!ev.bank) return '';
    return `
    <div class="ev-bank">
      <strong>Данс:</strong> ${esc(ev.bank.account)} · ${esc(ev.bank.bank)}<br/>
      <strong>Гүйлгээний утга:</strong> ${esc(ev.bank.note)}
    </div>`;
  }

  function buildDeadline(ev) {
    if (!ev.deadline) return '';
    return `
    <div class="ev-deadline">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Бүртгэл хаагдах: ${esc(ev.deadline)}
    </div>`;
  }

  function buildContacts(ev) {
    if (!ev.contacts || ev.contacts.length === 0) return '';
    const chips = ev.contacts.map(c => `<span class="ev-contact-chip">📞 ${esc(c)}</span>`).join('');
    return `<div class="ev-contacts">${chips}</div>`;
  }

  function buildActions(ev) {
    const btns = [];
    // if (ev.registerUrl) {
    //   const cls = ev.status === 'upcoming' ? 'ev-btn--accent' : 'ev-btn--primary';
    //   btns.push(`<a href="${ev.registerUrl}" target="_blank" class="ev-btn ${cls}">Бүртгүүлэх →</a>`);
    // }
    if (ev.facebookUrl) {
      btns.push(`<a href="${ev.facebookUrl}" target="_blank" class="ev-btn ev-btn--outline">Facebook →</a>`);
    }
    return btns.length ? `<div class="ev-card__actions">${btns.join('')}</div>` : '';
  }

  /* ── Utility ── */
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateBtn(id, shown, total) {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (shown >= total) {
      btn.disabled = true;
      btn.textContent = 'Бүгдийг үзлээ';
    } else {
      btn.disabled = false;
      btn.textContent = `Цааш үзэх (${total - shown} үлдсэн)`;
    }
  }

  /* ── Button listeners (global) ── */
  window.evLoadMoreUpcoming = loadMoreUpcoming;
  window.evLoadMorePast     = loadMorePast;
})();