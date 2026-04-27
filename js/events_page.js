/* ============================================================
   events_page.js — Redesigned with Calendar + List View
   ============================================================ */
(function () {
  const UPCOMING_PER_PAGE = 6;

  let allEvents = [];
  let currentFilter = 'all';
  let currentView = 'calendar';
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let listShown = 0;

  /* ── Page load дээр шууд calendar skeleton харуулна ──
     fetch дуусахыг хүлэх шаардлагагүй                  */
  buildCalendar();

  /* ── Fetch & Init ── */
  fetch('/api/events')
    .then(r => r.ok ? r.json() : Promise.reject('Failed to load events'))
    .then(data => {
      allEvents = data;
      buildCalendar();          // events-тай дахин render
      buildSidebarUpcoming();
    })
    .catch(err => console.error('Events load error:', err));

  fetch('/api/news')
    .then(r => r.json())
    .then(news => renderSidebarNews(news))
    .catch(err => console.error('News load error:', err));

  /* ── Calendar ── */
  function buildCalendar() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const monthNames = [
      '1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
      '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'
    ];
    const header = document.getElementById('cal-month-year');
    if (header) header.textContent = `${currentYear} оны ${monthNames[currentMonth]}`;

    /* firstDayOfWeek: 0=Ням, 1=Даваа ... 6=Бямба
       Монгол: 7 хоногийн эхлэл Даваа (1)
       getDay() нь: 0=Ням, 1=Даваа, ...
       Даваа-аас эхлэхийн тулд: pad = (getDay() + 6) % 7            */
    const firstDayJS   = new Date(currentYear, currentMonth, 1).getDay(); // 0–6
    const startPad     = (firstDayJS + 6) % 7;  // Даваа=0, Мягмар=1, ... Ням=6
    const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev   = new Date(currentYear, currentMonth, 0).getDate();

    const today        = new Date();
    const isThisMonth  = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    // Өмнөх сарын сүүл өдрүүд (бүдгэр)
    for (let i = startPad; i > 0; i--) {
      const d = daysInPrev - i + 1;
      grid.insertAdjacentHTML('beforeend',
        `<div class="cal-day cal-day--other"><div class="cal-day-number">${d}</div></div>`);
    }

    // Тухайн сарын өдрүүд
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr   = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday   = isThisMonth && d === today.getDate();
      grid.insertAdjacentHTML('beforeend', buildCalDay(d, dayEvents, isToday));
    }

    // Дараа сарын эхний өдрүүд (бүдгэр)
    const totalCells = startPad + daysInMonth;
    const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextMonth  = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear   = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= remaining; d++) {
      const dateStr2   = `${nextYear}-${String(nextMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEvents2 = getEventsForDate(dateStr2);
      const eventHtml2 = dayEvents2.map(ev => {
        const badgeClass = ev.status === 'past' ? 'cal-event--past' : `cal-event--${ev.badgeType || 'camp'}`;
        return `<div class="cal-event ${badgeClass} cal-event--overflow" onclick="openModal('${ev.id}')">${esc(ev.title)}</div>`;
      }).join('');
      grid.insertAdjacentHTML('beforeend',
        `<div class="cal-day cal-day--other"><div class="cal-day-number">${d}</div><div class="cal-day-events">${eventHtml2}</div></div>`);
    }
  }

  function buildCalDay(day, events, isToday) {
    let dayClass = 'cal-day';
    if (isToday) dayClass += ' cal-day--today';

    if (!events.length) {
      return `<div class="${dayClass}"><div class="cal-day-number">${day}</div><div class="cal-day-events"></div></div>`;
    }

    const eventHtml = events.map(ev => {
      const badgeClass = ev.status === 'past' ? 'cal-event--past' : `cal-event--${ev.badgeType || 'camp'}`;
      return `<div class="cal-event ${badgeClass}" onclick="openModal('${ev.id}')">${esc(ev.title)}</div>`;
    }).join('');

    return `<div class="${dayClass}">
      <div class="cal-day-number">${day}</div>
      <div class="cal-day-events">${eventHtml}</div>
    </div>`;
  }

  function getEventsForDate(dateStr) {
    return allEvents.filter(ev => {
      if (ev.status === 'upcoming' && ev.hidden) return false;
      if (!ev.startDate) return false;
      const start = ev.startDate;
      const end = ev.endDate || start;
      return dateStr >= start && dateStr <= end;
    });
  }

  window.changeMonth = function (dir) {
    currentMonth += dir;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
    buildCalendar();
  };

  /* ── List View ── */
  function buildList() {
    const el = document.getElementById('ev-list');
    if (!el) return;
    el.innerHTML = '';
    listShown = 0;

    const items = getFilteredList();
    const slice = items.slice(0, UPCOMING_PER_PAGE);
    listShown = slice.length;

    if (!slice.length) {
      el.innerHTML = `<div class="empty-state">
     
        <h3>Арга хэмжээ олдсонгүй</h3>
        <p>Одоогоор энэ ангилалд арга хэмжээ байхгүй байна.</p>
      </div>`;
    } else {
      slice.forEach(ev => el.insertAdjacentHTML('beforeend', buildListItem(ev)));
    }
    updateMoreBtn(items.length);
  }

  window.loadMoreList = function () {
    const items = getFilteredList();
    const el    = document.getElementById('ev-list');
    const slice = items.slice(listShown, listShown + UPCOMING_PER_PAGE);
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
    const base     = currentFilter === 'all' ? allEvents : allEvents.filter(e => e.badgeType === currentFilter);
    const upcoming = base.filter(e => e.status === 'upcoming' && !e.hidden);
    const past     = base.filter(e => e.status === 'past');
    return [...upcoming, ...past];
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>${esc(ev.info.fee)}</span>` : ''}
          </div>
          <div class="ev-list-actions">
            ${ev.registerUrl && ev.status === 'upcoming'
              ? `<a href="${ev.registerUrl}" target="_blank" class="ev-btn ev-btn--accent" onclick="event.stopPropagation()">Бүртгүүлэх →</a>`
              : ''}
            ${ev.facebookUrl
              ? `<a href="${ev.facebookUrl}" target="_blank" class="ev-btn ev-btn--outline" onclick="event.stopPropagation()">Facebook →</a>`
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
    if (currentView === 'list') buildList();
    buildCalendar();
    buildSidebarUpcoming();
  };

  /* ── View Toggle ── */
  window.switchView = function (view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('view-btn--active'));
    document.querySelector(`.view-btn[data-view="${view}"]`)?.classList.add('view-btn--active');

    const calEl  = document.getElementById('view-calendar');
    const listEl = document.getElementById('view-list');

    if (view === 'calendar') {
      calEl.style.display  = 'block';
      listEl.style.display = 'none';
      buildCalendar();
    } else {
      calEl.style.display  = 'none';
      listEl.style.display = 'block';
      buildList();
    }
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

    // Modal байхгүй бол үүсгэнэ
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

    // Header
    header.style.backgroundImage    = ev.image ? `url('${ev.image}')` : '';
    header.style.backgroundSize     = 'cover';
    header.style.backgroundPosition = 'center';

    badge.className   = `ev-card__badge${ev.badgeType ? ' ev-card__badge--' + ev.badgeType : ''}`;
    badge.textContent = ev.badge || '';

    // Info grid
    const infoItems = [
      ev.info?.location && { label: 'Байршил', value: ev.info.location },
      ev.info?.date     && { label: 'Огноо',   value: ev.info.date },
      ev.info?.age      && { label: 'Нас',      value: ev.info.age },
      ev.info?.fee      && { label: 'Төлбөр',   value: ev.info.fee },
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
    const bank     = ev.bank     ? `
    <div class="modal-bank">
      <strong>Данс:</strong> ${esc(ev.bank.account)} · ${esc(ev.bank.bank)}<br/>
      <strong>Гүйлгээний утга:</strong> ${esc(ev.bank.note)}
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

    const actions = [
      ev.registerUrl && ev.status === 'upcoming'
        ? `<a href="${ev.registerUrl}" target="_blank" class="ev-btn ev-btn--accent">Бүртгүүлэх →</a>` : '',
      ev.facebookUrl
        ? `<a href="${ev.facebookUrl}" target="_blank" class="ev-btn ev-btn--outline">Facebook →</a>` : '',
    ].filter(Boolean);

    body.innerHTML = `
      <div class="modal-eyebrow">${esc(ev.eyebrow || '')}</div>
      <h2 class="modal-title">${esc(ev.title)}</h2>
      ${ev.subtitle ? `<p style="color:var(--color-text-muted);margin-bottom:8px;font-style:italic;">${esc(ev.subtitle)}</p>` : ''}
      ${infoGrid}
      <p class="modal-desc">${esc(ev.description)}</p>
      ${includes}${bonus}${bank}${deadline}${contacts}
      ${actions.length ? `<div class="modal-actions">${actions.join('')}</div>` : ''}
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
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();