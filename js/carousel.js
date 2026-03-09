/* ============================================================
   carousel.js — Activity Carousel
   Яг 5 card харагдана. Visible бус card wrapper-оос гадагш.
   Wrap үед: шууд position тавиад, дараа animate.
   ============================================================ */
(function () {
  const wrapper       = document.querySelector('.act-carousel-wrapper');
  const carousel      = document.getElementById('actCarousel');
  const dotsContainer = document.getElementById('actDots');
  if (!carousel || !wrapper) return;

  const cards = Array.from(carousel.querySelectorAll('.act-card'));
  const dots  = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.act-dot')) : [];
  const total = cards.length;  // 6
  let current = 0;
  let prev    = 0;

  const CARD_W  = 240;
  const CARD_H  = 360;
  const GAP     = 24;
  const VISIBLE = 2;

  wrapper.style.overflow = 'hidden';
  wrapper.style.position = 'relative';

  /* card-ийн dist-аас байрлал тооцно */
  function calcLeft(dist, cw) {
    const cx = cw / 2;
    const natural = cx + dist * (CARD_W + GAP) - CARD_W / 2;
    if (Math.abs(dist) <= VISIBLE) return natural;
    /* visible биш — wrapper гадагш */
    return dist > 0 ? cw + CARD_W * 2 : -(CARD_W * 3);
  }

  /* dist тооцох — wrap ашиглахгүй, шууд зөрүү */
  function getDist(i, cur) {
    let d = i - cur;
    if (d >  total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  }

  function setCard(card, dist, animate) {
    const cw  = carousel.offsetWidth;
    const abs = Math.abs(dist);
    const vis = abs <= VISIBLE;

    card.style.transition      = animate
      ? 'left 0.65s cubic-bezier(.4,0,.2,1), transform 0.65s, opacity 0.35s'
      : 'none';
    card.style.position        = 'absolute';
    card.style.width           = CARD_W + 'px';
    card.style.height          = CARD_H + 'px';
    card.style.top             = '20px';
    card.style.left            = calcLeft(dist, cw) + 'px';
    card.style.transform       = `scale(${abs === 0 ? 1.05 : 0.95})`;
    card.style.transformOrigin = 'center center';
    card.style.opacity         = abs === 0 ? 1 : abs === 1 ? 0.72 : abs === 2 ? 0.42 : 0;
    card.style.zIndex          = abs === 0 ? 10 : abs === 1 ? 6 : abs === 2 ? 3 : 0;
    card.style.pointerEvents   = vis ? 'auto' : 'none';
    card.classList.toggle('act-card--active', abs === 0);
  }

  function render(animate, prevCurrent) {
    const cw = carousel.offsetWidth;
    wrapper.style.height  = (CARD_H + 80) + 'px';
    carousel.style.height = (CARD_H + 80) + 'px';
    carousel.style.position = 'relative';

    cards.forEach((card, i) => {
      const distNew = getDist(i, current);
      const distOld = getDist(i, prevCurrent);

      if (!animate) {
        setCard(card, distNew, false);
        return;
      }

      /* Wrap detection:
         Хэрэв card visible бус байрлалаас visible руу орж ирэх гэж байвал
         эхлээд зөв гадаа талаас нь transition-гүй тавиад, дараа animate хийнэ */
      const wasVisible = Math.abs(distOld) <= VISIBLE;
      const isVisible  = Math.abs(distNew) <= VISIBLE;

      if (!wasVisible && isVisible) {
        /* Ямар талаас орж ирэх вэ? distNew-ийн тэмдгээр */
        const entryLeft = calcLeft(distNew > 0 ? VISIBLE + 1 : -(VISIBLE + 1), cw);
        card.style.transition = 'none';
        card.style.left       = entryLeft + 'px';
        card.style.opacity    = '0';
        /* Дараагийн frame-д animate */
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCard(card, distNew, true);
          });
        });
      } else if (wasVisible && !isVisible) {
        /* Гарч явна — animate хийгээд visible бус болно */
        setCard(card, distNew, true);
      } else {
        setCard(card, distNew, animate);
      }
    });

    dots.forEach((d, i) => d.classList.toggle('act-dot--active', i === current));
  }

  function goTo(idx) {
    const p = current;
    current  = ((idx % total) + total) % total;
    render(true, p);
  }

  let timer = null;
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => {
      const p = current;
      current  = (current - 1 + total) % total;
      render(true, p);
    }, 3000);
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

  render(false, current);
  startAuto();
  window.addEventListener('resize', () => render(false, current));
})();