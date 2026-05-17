# Calendar view — archived

This is the calendar view that used to live on the events page (`events/index.html`).
It was removed on 2026-05-16 and replaced with a simple Past / Upcoming tab list.

If you want to bring it back, copy each snippet into the matching active file
at the marker described below.

## Files
- `calendar.html` — the toolbar toggle button + the `<div id="view-calendar">` block.
  Paste back into `events/index.html` inside `.events-main`.
- `calendar.js` — `buildCalendar()`, `buildCalDay()`, `getEventsForDate()`,
  `changeMonth` and the matching state vars. Paste back into the IIFE inside
  `js/events_page.js`. Also re-add the `currentView` toggle logic.
- `calendar.css` — `.cal-*` rules. Paste back into `css/events.css`.
