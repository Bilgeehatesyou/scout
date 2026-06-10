/* ============================================================
   events_page.js — Past / Upcoming tabs (calendar archived in
   _archive/calendar/)
   ============================================================ */
(function () {
  const PER_PAGE = 6;

  let allEvents = [];
  let currentFilter = 'all';
  let currentView = 'upcoming';
  let listShown = 0;

  /* ── Fetch & Init ── */
  fetch('/api/events')
    .then(r => r.ok ? r.json() : Promise.reject('Failed to load events'))
    .then(data => {
      allEvents = data;
      buildList();
      buildSidebarUpcoming();
    })
    .catch(err => {
      console.error('Events load error:', err);
      renderEventsError();
    });

  fetch('/api/news')
    .then(r => r.ok ? r.json() : Promise.reject('Failed to load news'))
    .then(news => renderSidebarNews(news))
    .catch(err => {
      console.error('News load error:', err);
      renderNewsError();
    });

  function renderEventsError() {
    const list = document.getElementById('ev-list');
    if (list) {
      list.innerHTML = `<div class="empty-state">
        <h3>Арга хэмжээний мэдээлэл ачаалагдсангүй</h3>
        <p>Холболтод алдаа гарлаа. Хуудсыг дахин ачаалж үзнэ үү эсвэл хэсэг хүлээгээд дахин оролдоно уу.</p>
      </div>`;
    }
    const moreBtn = document.getElementById('ev-more-list');
    if (moreBtn) moreBtn.style.display = 'none';
    const sidebar = document.getElementById('sidebar-upcoming');
    if (sidebar) {
      sidebar.innerHTML = `<p style="font-size:var(--text-sm);color:var(--color-text-faint);">Мэдээлэл ачаалагдсангүй.</p>`;
    }
  }

  function renderNewsError() {
    const el = document.getElementById('sidebar-news');
    if (!el) return;
    el.innerHTML = `<p style="font-size:var(--text-sm);color:var(--color-text-faint);">Мэдэгдэл ачаалагдсангүй.</p>`;
  }

  /* ── List View ── */
  function buildList() {
    const el = document.getElementById('ev-list');
    if (!el) return;
    el.innerHTML = '';
    listShown = 0;

    const items = getFilteredList();
    const slice = items.slice(0, PER_PAGE);
    listShown = slice.length;

    if (!slice.length) {
      const emptyMsg = currentView === 'past'
        ? 'Өнгөрсөн арга хэмжээ байхгүй байна.'
        : 'Удахгүй болох арга хэмжээ байхгүй байна.';
      el.innerHTML = `<div class="empty-state">
        <h3>Арга хэмжээ олдсонгүй</h3>
        <p>${emptyMsg}</p>
      </div>`;
    } else {
      slice.forEach(ev => el.insertAdjacentHTML('beforeend', buildListItem(ev)));
    }
    updateMoreBtn(items.length);
  }

  window.loadMoreList = function () {
    const items = getFilteredList();
    const el    = document.getElementById('ev-list');
    const slice = items.slice(listShown, listShown + PER_PAGE);
    slice.forEach(ev => el.insertAdjacentHTML('beforeend', buildListItem(ev)));
    listShown += slice.length;
    updateMoreBtn(items.length);
  };

  function updateMoreBtn(total) {
    const btn = document.getElementById('ev-more-list');
    if (!btn) return;
    if (listShown >= total) {
      btn.disabled    = true;
      btn.textContent = 'Бүгдийг үзлээ';
    } else {
      btn.disabled    = false;
      btn.textContent = `Цааш үзэх (${total - listShown} үлдсэн)`;
    }
  }

  function getFilteredList() {
    const base = currentFilter === 'all'
      ? allEvents
      : allEvents.filter(e => e.badgeType === currentFilter);
    if (currentView === 'past') {
      return base.filter(e => e.status === 'past');
    }
    return base.filter(e => e.status === 'upcoming' && !e.hidden);
  }

  function buildListItem(ev) {
    const bgStyle   = ev.image
      ? `background-image: url('${ev.image}');`
      : (ev.imageBg ? `background: ${ev.imageBg};` : '');
    const badgeClass = ev.badgeType ? `ev-card__badge--${ev.badgeType}` : '';

    return `
    <div class="ev-list-item" onclick="openModal('${ev.id}')">
      <div class="ev-list-img" style="${bgStyle}">
        <span class="ev-card__badge ${badgeClass}">${esc(ev.badge || ev.badgeType || '')}</span>
      </div>
      <div class="ev-list-body">
        <div>
          <div class="ev-list-meta">
            <span class="ev-list-date">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${esc(ev.info?.date || ev.eyebrow || '')}
            </span>
          </div>
          <h3 class="ev-list-title">${esc(ev.title)}</h3>
          <p class="ev-list-desc">${esc(ev.description)}</p>
        </div>
        <div class="ev-list-footer">
          <div class="ev-list-info">
            ${ev.info?.location ? `<span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>${esc(ev.info.location)}</span>` : ''}
            ${ev.info?.age  ? `<span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>${esc(ev.info.age)}</span>` : ''}
            ${ev.info?.fee  ? `<span>
              <span class="ev-fee-symbol" aria-hidden="true">₮</span>${esc(stripTugrik(ev.info.fee))}</span>` : ''}
          </div>
          <div class="ev-list-actions">
            ${ev.registerUrl && ev.status === 'upcoming'
              ? `<a href="${ev.registerUrl}" target="_blank" class="ev-btn ev-btn--accent" onclick="event.stopPropagation()">Бүртгүүлэх →</a>`
              : ''}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ── Filters ── */
  window.filterEvents = function (filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('filter-chip--active'));
    document.querySelector(`.filter-chip[data-filter="${filter}"]`)?.classList.add('filter-chip--active');
    buildList();
    buildSidebarUpcoming();
  };

  /* ── View Toggle (Удахгүй / Өнгөрсөн) ── */
  window.switchView = function (view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('view-btn--active'));
    document.querySelector(`.view-btn[data-view="${view}"]`)?.classList.add('view-btn--active');
    buildList();
  };

  /* ── Sidebar ── */
  function buildSidebarUpcoming() {
    const el = document.getElementById('sidebar-upcoming');
    if (!el) return;
    const upcoming = allEvents.filter(e => e.status === 'upcoming' && !e.hidden).slice(0, 4);
    if (!upcoming.length) {
      el.innerHTML = `<p style="font-size:var(--text-sm);color:var(--color-text-faint);">Удахгүй болох арга хэмжээ байхгүй байна.</p>`;
      return;
    }
    el.innerHTML = upcoming.map(ev => {
      const bgStyle = ev.image ? `background-image: url('${ev.image}');` : '';
      return `
      <div class="sidebar-item" onclick="openModal('${ev.id}')">
        <div class="sidebar-item-img" style="${bgStyle}"></div>
        <div class="sidebar-item-body">
          <div class="sidebar-item-title">${esc(ev.title)}</div>
          <div class="sidebar-item-date">${esc(ev.info?.date || '')}</div>
        </div>
      </div>`;
    }).join('');
  }

  function renderSidebarNews(items) {
    const el = document.getElementById('sidebar-news');
    if (!el) return;
    if (!items?.length) {
      el.innerHTML = `<p style="font-size:var(--text-sm);color:var(--color-text-faint);">Мэдэгдэл байхгүй байна.</p>`;
      return;
    }
    el.innerHTML = items.map(n => `
    <div class="news-item ${n.tagType === 'urgent' ? 'news-item--urgent' : ''}">
      <div class="news-item-title">${esc(n.title)}</div>
      <div class="news-item-body">${esc(n.body)}</div>
      <div class="news-item-date">${esc(n.date)}</div>
    </div>`).join('');
  }

  /* ── Modal ── */
  window.openModal = function (id) {
    const ev = allEvents.find(e => e.id === id);
    if (!ev) return;

    if (!document.getElementById('event-modal-overlay')) {
      document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="event-modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="modal" id="event-modal">
          <div class="modal-header" id="modal-header">
            <span class="ev-card__badge" id="modal-badge"></span>
            <button class="modal-close" onclick="closeModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" id="modal-body"></div>
        </div>
      </div>`);
    }

    const overlay = document.getElementById('event-modal-overlay');
    const header  = document.getElementById('modal-header');
    const badge   = document.getElementById('modal-badge');
    const body    = document.getElementById('modal-body');

    header.style.backgroundImage    = ev.image ? `url('${ev.image}')` : '';
    header.style.backgroundSize     = 'cover';
    header.style.backgroundPosition = 'center';

    badge.className   = `ev-card__badge${ev.badgeType ? ' ev-card__badge--' + ev.badgeType : ''}`;
    badge.textContent = ev.badge || '';

    const infoItems = [
      ev.info?.location && { label: 'Байршил', value: ev.info.location },
      ev.info?.date     && { label: 'Огноо',   value: ev.info.date },
      ev.info?.age      && { label: 'Нас',      value: ev.info.age },
      ev.info?.fee      && { label: 'Төлбөр',   value: stripTugrik(ev.info.fee) + '₮' },
    ].filter(Boolean);

    const infoGrid = infoItems.length ? `
    <div class="modal-info-grid">
      ${infoItems.map(i => `
        <div class="modal-info-item">
          <div class="modal-info-label">${i.label}</div>
          <div class="modal-info-value">${esc(i.value)}</div>
        </div>`).join('')}
    </div>` : '';

    const includes = ev.includes?.length ? `
    <div class="modal-includes">
      <div class="modal-includes-label">Төлбөрт багтах зүйлс</div>
      <div class="modal-includes-chips">
        ${ev.includes.map(c => `<span class="ev-chip">${esc(c)}</span>`).join('')}
      </div>
    </div>` : '';

    const bonus    = ev.bonus    ? `<div class="modal-bonus">${esc(ev.bonus)}</div>` : '';
    const bank     = ev.bank && (ev.bank.account || ev.bank.bank || ev.bank.note) ? `
    <div class="modal-bank">
      <strong>Данс:</strong> ${esc(ev.bank.account || '')}${ev.bank.bank ? ' · ' + esc(ev.bank.bank) : ''}<br/>
      <strong>Гүйлгээний утга:</strong> ${esc(ev.bank.note || '')}
    </div>` : '';
    const deadline = ev.deadline ? `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;font-family:var(--font-display);font-size:var(--text-xs);font-weight:700;color:#b71c1c;text-transform:uppercase;letter-spacing:0.08em;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      Бүртгэл хаагдах: ${esc(ev.deadline)}
    </div>` : '';
    const contacts = ev.contacts?.length ? `
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
      ${ev.contacts.map(c => `<span style="font-family:var(--font-display);font-size:var(--text-xs);font-weight:600;padding:6px 14px;border:1px solid rgba(29,67,130,0.2);color:var(--color-primary);background:var(--color-bg-alt);border-radius:20px;">📞 ${esc(c)}</span>`).join('')}
    </div>` : '';

    const actions = ev.registerUrl && ev.status === 'upcoming'
      ? `<a href="${ev.registerUrl}" target="_blank" class="ev-btn ev-btn--accent">Бүртгүүлэх →</a>`
      : '';

    body.innerHTML = `
      <div class="modal-eyebrow">${esc(ev.eyebrow || '')}</div>
      <h2 class="modal-title">${esc(ev.title)}</h2>
      ${ev.subtitle ? `<p style="color:var(--color-text-muted);margin-bottom:8px;font-style:italic;">${esc(ev.subtitle)}</p>` : ''}
      ${infoGrid}
      <p class="modal-desc">${esc(ev.description)}</p>
      ${includes}${bonus}${bank}${deadline}${contacts}
      ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    const overlay = document.getElementById('event-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Utility ── */
  // Removes a trailing/embedded ₮ (or "төгрөг") so the prefix symbol
  // isn't duplicated for fees that already include it.
  function stripTugrik(str) {
    return String(str || '').replace(/\s*(₮|төгрөг)\s*$/i, '').trim();
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
