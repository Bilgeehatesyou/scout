/* ============================================================
   main.js — Mongolian Scout Association
   ============================================================ */

/* ── 1. NAV SCROLL — цэнхэр → цагаан, цагаан лого → хөх шар ── */
(function () {
  const nav = document.querySelector('nav');
  const THRESHOLD = 80; // px — хэдэн px scroll хийсний дараа өөрчлөгдөх

  function onScroll() {
    if (window.scrollY > THRESHOLD) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // анхны байдлыг шалгана
})();


/* ── 2. REVEAL on scroll ── */
(function () {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));
})();


/* ── 3. ACTIVITY CAROUSEL ── */
(function () {
  const wrapper      = document.querySelector('.act-carousel-wrapper');
  const carousel     = document.getElementById('actCarousel');
  const dotsContainer= document.getElementById('actDots');
  if (!carousel || !wrapper) return;

  const cards = Array.from(carousel.querySelectorAll('.act-card'));
  const dots  = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.act-dot')) : [];
  const total = cards.length;
  let current = 2;

  const CARD_W = 240;
  const CARD_H = 360;   // бүх карт ижил өндөр
  const GAP    = 20;

  wrapper.style.position  = 'relative';
  wrapper.style.overflow  = 'hidden';
  carousel.style.position = 'relative';
  carousel.style.width    = '100%';

  /* ── render ── */
  function render(animate) {
    const cW = carousel.offsetWidth;
    const cx = cW / 2;
    wrapper.style.height  = (CARD_H + 80) + 'px';
    carousel.style.height = wrapper.style.height;

    cards.forEach((card, i) => {
      let dist = i - current;
      if (dist >  total / 2) dist -= total;
      if (dist < -total / 2) dist += total;
      const abs = Math.abs(dist);

      // Бүх карт ижил өндөр, зөвхөн scale-аар идэвхтэй картыг томруулна
      const scale  = abs === 0 ? 1.05 : 0.98;
      const opacity = abs === 0 ? 1 : abs === 1 ? 0.75 : 0.45;
      const zIndex  = abs === 0 ? 10 : abs === 1 ? 6 : 2;

      card.style.position        = 'absolute';
      card.style.left            = (cx + dist * (CARD_W + GAP) - CARD_W / 2) + 'px';
      card.style.top             = '20px';
      card.style.width           = CARD_W + 'px';
      card.style.height          = CARD_H + 'px';
      card.style.transform       = `scale(${scale})`;
      card.style.transformOrigin = 'center center';
      card.style.opacity         = opacity;
      card.style.zIndex          = zIndex;
      card.style.transition      = animate ? 'all 0.85s cubic-bezier(.4,0,.2,1)' : 'none';
      card.classList.toggle('act-card--active', abs === 0);
    });

    dots.forEach((d, i) => d.classList.toggle('act-dot--active', i === current));
  }

  /* ── goTo ── */
  function goTo(idx) {
    current = ((idx % total) + total) % total;
    render(true);
  }

  /* ── auto timer ── */
  let timer = null;
  function startAuto() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => { current = (current + 1) % total; render(true); }, 3000);
  }

  /* ── events ── */
  cards.forEach((card, i) => card.addEventListener('click', () => { goTo(i); startAuto(); }));
  dots.forEach((dot,  i) => dot.addEventListener('click',  () => { goTo(i); startAuto(); }));

  let dragX = null;
  carousel.addEventListener('mousedown',  e => { dragX = e.pageX; });
  carousel.addEventListener('mouseup',    e => {
    if (dragX === null) return;
    const d = dragX - e.pageX;
    if (Math.abs(d) > 40) { goTo(current + (d > 0 ? 1 : -1)); startAuto(); }
    dragX = null;
  });
  carousel.addEventListener('mouseleave', () => { dragX = null; });

  let touchX = null;
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].pageX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    if (touchX === null) return;
    const d = touchX - e.changedTouches[0].pageX;
    if (Math.abs(d) > 40) { goTo(current + (d > 0 ? 1 : -1)); startAuto(); }
    touchX = null;
  });

  /* ── init ── */
  render(false);
  startAuto();
  window.addEventListener('resize', () => render(false));
})();


/* ── 4. EVENTS — Google Sheet CSV-ээс татна ── */
(function () {
  // ── Google Sheet-ийн published CSV холбоос ──
  const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTPdSIhsWJ_uvuhm8U0XbT2uP9SgPeFVLC4-gSWWCZtRNtDD21rwk_HvfeOSZUskcgJoFsVRhwRKc4J/pub?output=csv';

  const typeConfig = {
    'ulsiin':  { label: 'Улсын',   color: 'var(--color-primary)' },
    'ulsin':   { label: 'Улсын',   color: 'var(--color-primary)' },
    'busiin':  { label: 'Бүсийн',  color: 'var(--color-primary-light)' },
    'surgalt': { label: 'Сургалт', color: 'var(--color-danger)' },
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
    const cfg      = typeConfig[typeRaw] || { label: typeRaw || '—', color: 'var(--color-primary)' };
    const metaKey  = Object.keys(r).find(k => k.includes('дэлгэрэнгүй')) || '';
    const meta     = r[metaKey] || '';

    return `
      <div class="event-item">
        <div class="event-date">
          <span class="day">${r['өдөр']}</span>
          <span class="month">${r['сар'] || ''}</span>
        </div>
        <div class="event-info">
          <div class="event-title">${r['гарчиг']}</div>
          <div class="event-meta">${meta}</div>
        </div>
        <span class="event-type-tag" style="
          font-family: var(--font-display);
          font-size: var(--text-xs);
          font-weight: var(--weight-bold);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          padding: 6px 16px;
          border: 1px solid ${cfg.color};
          color: ${cfg.color};
          white-space: nowrap;
          min-width: 90px;
          text-align: center;
        ">${cfg.label}</span>
      </div>`;
  }

  const list = document.querySelector('.events-list');
  if (!list) return;

  list.innerHTML = `<p style="padding:20px;color:var(--color-primary);
    font-family:var(--font-display);font-size:var(--text-xs);
    letter-spacing:var(--tracking-widest);">АЧААЛЛАЖ БАЙНА...</p>`;

  fetch(SHEET_CSV_URL)
    .then(r => { if (!r.ok) throw new Error('Network error'); return r.text(); })
    .then(csv => {
      const rows = parseCSV(csv);
      list.innerHTML = rows.length
        ? rows.map(renderEvent).join('')
        : '<p style="padding:20px;color:#999;">Одоогоор арга хэмжээ байхгүй байна.</p>';
    })
    .catch(() => {
      list.innerHTML = `<p style="padding:20px;color:var(--color-danger);
        font-family:var(--font-display);font-size:var(--text-xs);">
        Мэдээлэл татахад алдаа гарлаа.</p>`;
    });
})();


/* ── 5. FORM товч — Google Form руу шилжинэ ── */
(function () {
  const formBtn = document.querySelector('.join-form .btn-primary');
  if (!formBtn) return;
  // btn-primary нь <a> тул href-ийг шалгана
  // Хэрэглэгч дарахад visual feedback өгнө
  formBtn.addEventListener('click', function () {
    this.textContent = '✓ Маягт нээгдэж байна...';
    this.style.background = 'var(--color-primary)';
    this.style.color = '#fff';
    setTimeout(() => {
      this.textContent = 'Илгээх →';
      this.style.background = '';
      this.style.color = '';
    }, 2000);
  });
})();

/* ── AGE CARD CLICK SELECT ── */
(function () {

  const ageCards = document.querySelectorAll('.age-card');

  ageCards.forEach(card => {
    card.addEventListener('click', () => {

      // өмнөх active card арилгана
      ageCards.forEach(c => {
        c.classList.remove('age-card--featured');
      });

      // дарсан card active болно
      card.classList.add('age-card--featured');

    });
  });

})();

(function () {

  const tabs = document.querySelectorAll('.prog-tab');
  const tabsBar = document.querySelector('.prog-tabs-bar');
  const nav = document.querySelector('#main-nav');

  if (!tabs.length || !tabsBar) return;

  tabs.forEach(tab => {

    tab.addEventListener('click', (e) => {

      e.preventDefault();

      const id = tab.getAttribute('href');
      const target = document.querySelector(id);

      if (!target) return;

      const navHeight = nav ? nav.offsetHeight : 70;

      window.scrollTo({
        top: target.offsetTop - (tabsBar.offsetHeight + navHeight),
        behavior: 'smooth'
      });

    });

  });

})();