/* ============================================================
   carousel.js — Activity Carousel
   ============================================================ */
(function () {
  const wrapper       = document.querySelector('.act-carousel-wrapper');
  const carousel      = document.getElementById('actCarousel');
  const dotsContainer = document.getElementById('actDots');
  if (!carousel || !wrapper) return;

  const cards = Array.from(carousel.querySelectorAll('.act-card'));
  const dots  = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.act-dot')) : [];
  const total = cards.length;
  let current = 0;
  let started = false;

  const CARD_W  = 240;
  const CARD_H  = 360;
  const GAP     = 24;
  const VISIBLE = 2;

  function getWidth() {
    return wrapper.offsetWidth || wrapper.getBoundingClientRect().width || 0;
  }

  function calcLeft(dist, cw) {
    const cx = cw / 2;
    const natural = cx + dist * (CARD_W + GAP) - CARD_W / 2;
    if (Math.abs(dist) <= VISIBLE) return natural;
    return dist > 0 ? cw + CARD_W * 2 : -(CARD_W * 3);
  }

  function getDist(i, cur) {
    let d = i - cur;
    if (d >  total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  }

  function setCard(card, dist, animate) {
    const cw  = getWidth();
    const abs = Math.abs(dist);
    const vis = abs <= VISIBLE;

    card.style.transition = animate
      ? 'left 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s, opacity 0.35s'
      : 'none';

    card.style.position    = 'absolute';
    card.style.width       = CARD_W + 'px';
    card.style.height      = CARD_H + 'px';
    card.style.top         = '20px';
    card.style.left        = calcLeft(dist, cw) + 'px';

    card.style.transform       = `scale(${abs === 0 ? 1.05 : 0.95})`;
    card.style.transformOrigin = 'center center';

    card.style.opacity =
      abs === 0 ? 1 :
      abs === 1 ? 0.72 :
      abs === 2 ? 0.42 : 0;

    card.style.zIndex        = vis ? (abs === 0 ? 10 : abs === 1 ? 6 : 3) : -1;
    card.style.visibility    = vis ? 'visible' : 'hidden';
    card.style.pointerEvents = vis ? 'auto' : 'none';

    card.classList.toggle('act-card--active', abs === 0);
  }

  function render(animate, prevCurrent) {
    if (getWidth() === 0) return;

    carousel.style.position = 'relative';
    carousel.style.height   = (CARD_H + 80) + 'px';

    cards.forEach((card, i) => {
      const distNew = getDist(i, current);
      const distOld = getDist(i, prevCurrent);

      if (!animate) {
        setCard(card, distNew, false);
        return;
      }

      const wasVisible = Math.abs(distOld) <= VISIBLE;
      const isVisible  = Math.abs(distNew) <= VISIBLE;

      if (!wasVisible && isVisible) {
        const entryDist = distNew > 0 ? (VISIBLE + 1) : -(VISIBLE + 1);
        const entryLeft = calcLeft(entryDist, getWidth());

        card.style.transition = 'none';
        card.style.visibility = 'hidden';
        card.style.left       = entryLeft + 'px';
        card.style.opacity    = '0';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.visibility = 'visible';
            setCard(card, distNew, true);
          });
        });
      } else if (wasVisible && !isVisible) {
        setCard(card, distNew, true);
      } else {
        setCard(card, distNew, animate);
      }
    });

    dots.forEach((d, i) => d.classList.toggle('act-dot--active', i === current));
  }

  function goTo(idx) {
    const p = current;
    current = ((idx % total) + total) % total;
    render(true, p);
  }

  let timer = null;
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => {
      const p = current;
      current = (current + 1) % total;
      render(true, p);
    }, 3000);
  }

  function init() {
    if (started) return;
    if (getWidth() === 0) return;
    started = true;
    render(false, current);
    startAuto();
  }

  cards.forEach((card, i) => card.addEventListener('click', () => { goTo(i); startAuto(); }));
  dots.forEach((dot, i)   => dot.addEventListener('click',  () => { goTo(i); startAuto(); }));

  let dragX = null;
  carousel.addEventListener('mousedown',  e => { dragX = e.pageX; });
  carousel.addEventListener('mouseup',    e => {
    if (dragX === null) return;
    const d = dragX - e.pageX;
    if (Math.abs(d) > 40) { goTo(((current + (d > 0 ? -1 : 1)) + total) % total); startAuto(); }
    dragX = null;
  });
  carousel.addEventListener('mouseleave', () => { dragX = null; });

  let touchX = null;
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].pageX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    if (touchX === null) return;
    const d = touchX - e.changedTouches[0].pageX;
    if (Math.abs(d) > 40) { goTo(((current + (d > 0 ? -1 : 1)) + total) % total); startAuto(); }
    touchX = null;
  });

  window.addEventListener('resize',           () => render(false, current));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(false, current); });
  window.addEventListener('focus',            () => render(false, current));

  /* nav.js-ийн reveal callback-аас дуудагдана */
  window.addEventListener('carousel-reveal', init);

  /* reveal class байхгүй эсвэл аль хэдийн visible бол шууд эхлүүл */
  const actEl = wrapper.closest('.reveal');
  if (!actEl || actEl.classList.contains('visible')) {
    requestAnimationFrame(() => requestAnimationFrame(init));
  }

})();