/* ============================================================
   enhancements.js
   ─ Theme toggle (light / dark)
   ─ LQIP / blur-up image fade-in
   theme-init нь <head>-д inline байрлуулсан тул FOUC байхгүй.
   ============================================================ */

/* ── 1. THEME TOGGLE BUTTON ────────────────────────────── */
(function () {
  const KEY = 'scout-theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    updateButton(theme);
  }

  function updateButton(theme) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
    // Show moon when light, sun when dark (icon = "what you'll switch TO")
    btn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
  }

  const MOON_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;

  const SUN_SVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41
               M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>`;

  const btn = document.createElement('button');
  btn.className = 'theme-switch';
  btn.type = 'button';
  document.body.appendChild(btn);

  updateButton(currentTheme());

  btn.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
})();


/* ── 2. LQIP / BLUR-UP image fade-in ────────────────────
   Бүх <img>-д lqip-img class нэмж, ачаалагдмагц fade-in
   хийнэ. Жижиг icon, nav-ийн logo-г оруулахгүй.
   ──────────────────────────────────────────────────────── */
(function () {
  function shouldSkip(img) {
    if (img.classList.contains('no-lqip')) return true;
    if (img.closest('nav')) return true;
    if (img.closest('footer')) return true;
    /* Very small or unknown-size images (icons) */
    const w = img.getAttribute('width');
    if (w && parseInt(w, 10) < 80) return true;
    return false;
  }

  function activate(img) {
    if (shouldSkip(img)) return;
    img.classList.add('lqip-img');

    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('lqip-loaded');
      const wrap = img.closest('.lqip');
      if (wrap) wrap.classList.add('lqip-done');
      return;
    }

    const onLoad = () => {
      img.classList.add('lqip-loaded');
      const wrap = img.closest('.lqip');
      if (wrap) wrap.classList.add('lqip-done');
    };
    img.addEventListener('load', onLoad, { once: true });
    img.addEventListener('error', onLoad, { once: true });
  }

  function scan() {
    document.querySelectorAll('img').forEach(activate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan);
  } else {
    scan();
  }

  /* Re-scan when new content is added dynamically (events list, etc.) */
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') activate(node);
        else node.querySelectorAll && node.querySelectorAll('img').forEach(activate);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
