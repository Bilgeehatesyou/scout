/* ============================================================
   bulgem.js — Bulgem page (Mongolia map)
   Loads the Wikimedia SVG, assigns aimag IDs to unnamed paths
   by matching path bbox centers to known aimag label positions,
   then wires hover + click interactions.
   ============================================================ */
(function () {
  /* ── Known aimag label positions (from text labels in source SVG) ── */
  const AIMAG_POSITIONS = [
    { slug: 'arkhangai',    mn: 'Архангай',       x: 720, y: 380 },
    { slug: 'bayankhongor', mn: 'Баянхонгор',     x: 650, y: 610 },
    { slug: 'bayan-olgii',  mn: 'Баян-Өлгий',     x: 90,  y: 300 },
    { slug: 'bulgan',       mn: 'Булган',         x: 860, y: 330 },
    { slug: 'khentii',      mn: 'Хэнтий',         x: 1240,y: 365 },
    { slug: 'khovd',        mn: 'Ховд',           x: 290, y: 440 },
    { slug: 'khuvsgul',     mn: 'Хөвсгөл',        x: 640, y: 210 },
    { slug: 'darkhan-uul',  mn: 'Дархан-Уул',     x: 960,y: 205 },
    { slug: 'dornogovi',    mn: 'Дорноговь',      x: 1180,y: 615 },
    { slug: 'dornod',       mn: 'Дорнод',         x: 1520,y: 420 },
    { slug: 'dundgovi',     mn: 'Дундговь',       x: 1000,y: 550 },
    { slug: 'govi-altai',   mn: 'Говь-Алтай',     x: 440, y: 565 },
    { slug: 'govisumber',   mn: 'Говьсүмбэр',     x: 1170,y: 525 },
    { slug: 'orkhon',       mn: 'Орхон',          x: 870, y: 255 },
    { slug: 'omnogovi',     mn: 'Өмнөговь',       x: 890, y: 735 },
    { slug: 'ovorkhangai',  mn: 'Өвөрхангай',     x: 810, y: 505 },
    { slug: 'selenge',      mn: 'Сэлэнгэ',        x: 1040, y: 265 },
    { slug: 'sukhbaatar',   mn: 'Сүхбаатар',      x: 1370,y: 530 },
    { slug: 'tov',          mn: 'Төв',            x: 980, y: 430 },
    { slug: 'uvs',          mn: 'Увс',            x: 295, y: 240 },
    { slug: 'zavkhan',      mn: 'Завхан',         x: 485, y: 320 },
    { slug: 'ulaanbaatar',  mn: 'Улаанбаатар',    x: 1060,y: 345 },
  ];

  /* ── Groups are loaded from /api/groups (admin-managed) ── */
  let GROUPS_BY_AIMAG = {};

  function groupsByAimag(groups) {
    const out = {};
    (groups || []).forEach(g => {
      if (!g.aimag) return;
      (out[g.aimag] = out[g.aimag] || []).push(g);
    });
    return out;
  }

  const AGE_LABEL = { cub: 'Каб', scout: 'Скаут', venchir: 'Венчир', rover: 'Ровер' };

  /* ── Density bucket ── */
  function density(count) {
    if (!count) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    return 3;
  }

  /* ── Path bbox center (rough) ──
     Parses M/L/m/l/H/h/V/v commands from a path 'd' attribute and
     returns the bounding box midpoint. Good enough for matching. */
  function pathCenter(d) {
    const tokens = d.match(/-?\d+(\.\d+)?/g);
    if (!tokens) return null;
    const cmds  = d.replace(/[^A-Za-z,\s\d.\-]/g, '').match(/[A-Za-z]/g) || [];

    // Quick & dirty: every number is a coordinate; alternate x,y.
    // Not perfect for arcs but fine for polygon-style paths.
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i + 1 < tokens.length; i += 2) {
      const x = parseFloat(tokens[i]);
      const y = parseFloat(tokens[i + 1]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (!Number.isFinite(minX)) return null;
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }

  /* ── Better: use getBBox() once SVG is in DOM ── */
  function pathCenterFromElement(pathEl) {
    try {
      const b = pathEl.getBBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    } catch {
      return null;
    }
  }

  /* ── Match each path to nearest aimag center ── */
  function assignAimagsToPaths(svg) {
    const provincesGroup = svg.querySelector('#Provinces');
    if (!provincesGroup) {
      console.warn('No #Provinces group in SVG');
      return;
    }
    const paths = Array.from(provincesGroup.querySelectorAll('path'));

    // Each aimag gets the path whose center is closest to its label position.
    const used = new Set();
    AIMAG_POSITIONS.forEach(aimag => {
      let bestPath = null, bestDist = Infinity;
      paths.forEach(p => {
        if (used.has(p)) return;
        const c = pathCenterFromElement(p);
        if (!c) return;
        const dx = c.x - aimag.x, dy = c.y - aimag.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) { bestDist = dist; bestPath = p; }
      });
      if (bestPath) {
        bestPath.setAttribute('data-aimag', aimag.slug);
        bestPath.setAttribute('data-aimag-name', aimag.mn);
        used.add(bestPath);
      }
    });

    // Unmatched paths get a sentinel attr so CSS doesn't style them.
    paths.forEach(p => {
      if (!p.hasAttribute('data-aimag')) {
        p.setAttribute('data-unmatched', '');
      }
    });
  }

  /* ── Apply density coloring ── */
  function colorByDensity(svg) {
    AIMAG_POSITIONS.forEach(aimag => {
      const count = (GROUPS_BY_AIMAG[aimag.slug] || []).length;
      const path = svg.querySelector(`path[data-aimag="${aimag.slug}"]`);
      if (path) path.setAttribute('data-density', density(count));
    });
  }

  /* ── Interaction wiring ── */
  function wireInteractions(svg) {
    const tooltip = document.getElementById('mt-tooltip');
    const panel   = document.getElementById('mt-panel');
    const wrap    = document.querySelector('.mt-map-wrap');
    let activePath = null;

    svg.addEventListener('mousemove', e => {
      const path = e.target.closest('path[data-aimag]');
      if (!path) { tooltip.classList.remove('is-on'); return; }
      const slug = path.dataset.aimag;
      const name = path.dataset.aimagName;
      const count = (GROUPS_BY_AIMAG[slug] || []).length;
      tooltip.innerHTML = `<span class="tt-name">${escapeHtml(name)}</span>${count ? count + ' бүлгэм' : 'Бүлгэмгүй'}`;
      const wrapRect = wrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX - wrapRect.left) + 'px';
      tooltip.style.top  = (e.clientY - wrapRect.top - 10) + 'px';
      tooltip.classList.add('is-on');
    });

    svg.addEventListener('mouseleave', () => tooltip.classList.remove('is-on'));

    svg.addEventListener('click', e => {
      const path = e.target.closest('path[data-aimag]');
      if (!path) return;
      if (activePath) activePath.classList.remove('is-active');
      path.classList.add('is-active');
      activePath = path;
      renderPanel(path.dataset.aimag, path.dataset.aimagName);
    });
  }

  /* ── Panel renderer ── */
  function renderPanel(slug, name) {
    const panel = document.getElementById('mt-panel');
    const groups = GROUPS_BY_AIMAG[slug] || [];
    const totalMembers = groups.reduce((s, g) => s + (g.members || 0), 0);

    const isUB        = slug === 'ulaanbaatar';
    const regionLabel = isUB ? 'Нийслэл' : 'Аймаг';
    const emptyText   = isUB
      ? 'Улаанбаатарт идэвхтэй скаутын бүлгэм одоохондоо алга байна.'
      : 'Энэ аймагт идэвхтэй скаутын бүлгэм одоохондоо алга байна.';

    if (!groups.length) {
      panel.innerHTML = `
        <div class="mt-panel-content">
          <div class="mt-panel-eyebrow">${regionLabel}</div>
          <h2>${escapeHtml(name)}</h2>
          <div class="mt-panel-empty-aimag">
            <p>${emptyText}</p>
            <p style="margin-top:12px;">Бүлгэм байгуулах сонирхолтой бол бидэнтэй холбогдоно уу.</p>
          </div>
        </div>`;
      return;
    }

    panel.innerHTML = `
      <div class="mt-panel-content">
        <div class="mt-panel-eyebrow">${regionLabel}</div>
        <h2>${escapeHtml(name)}</h2>
        <div class="mt-panel-stats">
          <div class="mt-panel-stat">
            <span class="mt-panel-stat-num">${groups.length}</span>
            <span class="mt-panel-stat-label">бүлгэм</span>
          </div>
          <div class="mt-panel-stat">
            <span class="mt-panel-stat-num">${totalMembers}</span>
            <span class="mt-panel-stat-label">скаут</span>
          </div>
        </div>
        ${groups.map(g => `
          <div class="mt-group">
            <div class="mt-group-name">${escapeHtml(g.name)}</div>
            <div class="mt-group-meta">
              ${escapeHtml(g.sum)}<br/>
              Нийт ${g.members} скаут<br/>
              Удирдагч: ${escapeHtml(g.leader)} · 📞 ${escapeHtml(g.contact)}<br/>
              🕐 ${escapeHtml(g.meetingTime)}
            </div>
            <div class="mt-group-tags">
              ${(g.ageGroups || []).map(a => `<span class="mt-group-tag">${AGE_LABEL[a] || a}</span>`).join('')}
            </div>
          </div>
        `).join('')}
        <a href="/join?aimag=${encodeURIComponent(slug)}" class="mt-panel-cta">Бүлгэмд нэгдэх →</a>
      </div>`;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Load SVG + groups data in parallel, then init ── */
  Promise.all([
    fetch('/img/map/mongolia-aimags.svg').then(r => r.ok ? r.text() : Promise.reject('SVG fetch failed')),
    fetch('/api/groups').then(r => r.ok ? r.json() : []).catch(() => []),
  ])
    .then(([svgText, groups]) => {
      GROUPS_BY_AIMAG = groupsByAimag(groups);

      const mapEl = document.getElementById('mt-map');
      mapEl.innerHTML = svgText;
      const svg = mapEl.querySelector('svg');
      if (!svg) throw new Error('No <svg> in fetched file');

      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      assignAimagsToPaths(svg);
      colorByDensity(svg);
      wireInteractions(svg);

      document.getElementById('mt-loading').classList.add('is-hidden');
    })
    .catch(err => {
      console.error('Map load error:', err);
      const loading = document.getElementById('mt-loading');
      loading.textContent = 'Газрын зураг ачаалахад алдаа гарлаа.';
    });
})();
