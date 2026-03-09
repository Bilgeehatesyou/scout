/* ============================================================
   events.js — Google Sheet CSV-ээс арга хэмжээ татаж харуулна
   ============================================================ */
(function () {
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTPdSIhsWJ_uvuhm8U0XbT2uP9SgPeFVLC4-gSWWCZtRNtDD21rwk_HvfeOSZUskcgJoFsVRhwRKc4J/pub?output=csv';

  /* Төрлийн тохиргоо — CSS class + label */
  const typeConfig = {
    'ulsiin':  { label: 'Улсын',   cls: 'event-type-tag--national' },
    'ulsin':   { label: 'Улсын',   cls: 'event-type-tag--national' },
    'busiin':  { label: 'Бүсийн',  cls: 'event-type-tag--regional' },
    'surgalt': { label: 'Сургалт', cls: 'event-type-tag--training'  },
  };

  function parseCSV(text) {
    const lines   = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const cols = [];
      let cur = '', inQ = false;
      for (const c of line) {
        if (c === '"') { inQ = !inQ; }
        else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += c; }
      }
      cols.push(cur.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = (cols[i] || '').replace(/"/g, ''));
      return obj;
    }).filter(r => r['өдөр'] && r['гарчиг']);
  }

  function renderEvent(r) {
    const torolKey = Object.keys(r).find(k => k.includes('төрөл')) || '';
    const typeRaw  = (r[torolKey] || '').trim().toLowerCase();
    const cfg      = typeConfig[typeRaw] || { label: typeRaw || '—', cls: 'event-type-tag--national' };
    const metaKey  = Object.keys(r).find(k => k.includes('дэлгэрэнгүй')) || '';

    return `
      <div class="event-item">
        <div class="event-date">
          <span class="day">${r['өдөр']}</span>
          <span class="month">${r['сар'] || ''}</span>
        </div>
        <div class="event-info">
          <div class="event-title">${r['гарчиг']}</div>
          <div class="event-meta">${r[metaKey] || ''}</div>
        </div>
        <span class="event-type-tag ${cfg.cls}">${cfg.label}</span>
      </div>`;
  }

  const list = document.querySelector('.events-list');
  if (!list) return;

  list.innerHTML = '<p class="events-loading">АЧААЛЛАЖ БАЙНА...</p>';

  fetch(SHEET_CSV_URL)
    .then(r => { if (!r.ok) throw new Error('Network error'); return r.text(); })
    .then(csv => {
      const rows = parseCSV(csv);
      list.innerHTML = rows.length
        ? rows.map(renderEvent).join('')
        : '<p class="events-empty">Одоогоор арга хэмжээ байхгүй байна.</p>';
    })
    .catch(() => {
      list.innerHTML = '<p class="events-error">Мэдээлэл татахад алдаа гарлаа.</p>';
    });
})();