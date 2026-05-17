/* Updates dynamic year-based bits across the site:
   - [data-years-since="YYYY"]  → current year minus YYYY
   - #copyright-year             → current year */
(function () {
  const now = new Date().getFullYear();

  document.querySelectorAll('[data-years-since]').forEach(el => {
    const since = parseInt(el.dataset.yearsSince, 10);
    if (Number.isFinite(since)) el.textContent = now - since;
  });

  const yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = now;
})();
