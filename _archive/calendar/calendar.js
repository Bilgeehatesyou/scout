/* Calendar logic that used to live inside the events_page.js IIFE.
   Restore the state vars at the top, the four functions, and re-add
   switchView/currentView handling. */

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/* Page load дээр шууд calendar skeleton харуулна */
buildCalendar();

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

  /* firstDayOfWeek: Даваа-аас эхлэхийн тулд: pad = (getDay() + 6) % 7 */
  const firstDayJS   = new Date(currentYear, currentMonth, 1).getDay();
  const startPad     = (firstDayJS + 6) % 7;
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev   = new Date(currentYear, currentMonth, 0).getDate();

  const today        = new Date();
  const isThisMonth  = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  for (let i = startPad; i > 0; i--) {
    const d = daysInPrev - i + 1;
    grid.insertAdjacentHTML('beforeend',
      `<div class="cal-day cal-day--other"><div class="cal-day-number">${d}</div></div>`);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr   = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayEvents = getEventsForDate(dateStr);
    const isToday   = isThisMonth && d === today.getDate();
    grid.insertAdjacentHTML('beforeend', buildCalDay(d, dayEvents, isToday));
  }

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
