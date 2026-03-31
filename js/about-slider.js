/* ============================================================
   about-slider.js — About section зургийн автомат slider
   ============================================================ */
(function () {
  const slider = document.getElementById('aboutSlider');
  if (!slider) return;

  const slides    = Array.from(slider.querySelectorAll('.about-slide'));
  const dotsWrap  = document.getElementById('aboutSliderDots');
  const total     = slides.length;
  let current     = 0;

  /* dots үүсгэнэ */
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('span'));

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  let timer = setInterval(() => goTo(current + 1), 3500);

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 3500);
  }
})();