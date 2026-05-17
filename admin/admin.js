/* ============================================================
   admin.js — Admin panel logic for all sections
   ============================================================ */

const AIMAGS = [
  { slug: 'arkhangai',    mn: 'Архангай' },
  { slug: 'bayankhongor', mn: 'Баянхонгор' },
  { slug: 'bayan-olgii',  mn: 'Баян-Өлгий' },
  { slug: 'bulgan',       mn: 'Булган' },
  { slug: 'darkhan-uul',  mn: 'Дархан-Уул' },
  { slug: 'dornod',       mn: 'Дорнод' },
  { slug: 'dornogovi',    mn: 'Дорноговь' },
  { slug: 'dundgovi',     mn: 'Дундговь' },
  { slug: 'govi-altai',   mn: 'Говь-Алтай' },
  { slug: 'govisumber',   mn: 'Говьсүмбэр' },
  { slug: 'khentii',      mn: 'Хэнтий' },
  { slug: 'khovd',        mn: 'Ховд' },
  { slug: 'khuvsgul',     mn: 'Хөвсгөл' },
  { slug: 'omnogovi',     mn: 'Өмнөговь' },
  { slug: 'orkhon',       mn: 'Орхон' },
  { slug: 'ovorkhangai',  mn: 'Өвөрхангай' },
  { slug: 'selenge',      mn: 'Сэлэнгэ' },
  { slug: 'sukhbaatar',   mn: 'Сүхбаатар' },
  { slug: 'tov',          mn: 'Төв' },
  { slug: 'ulaanbaatar',  mn: 'Улаанбаатар' },
  { slug: 'uvs',          mn: 'Увс' },
  { slug: 'zavkhan',      mn: 'Завхан' },
];
const AGE_LABEL = { cub: 'Каб', scout: 'Скаут', venchir: 'Венчир', rover: 'Ровер' };
const BADGE_LABEL = { camp: 'Кемп', intl: 'Олон улс', training: 'Сургалт' };

/* ── State ── */
let events = [];
let news = [];
let groups = [];
let applications = [];
let activeView = 'dashboard';
let eventsFilter = 'all';
let appsFilter = 'all';
let editingEventId = null;
let editingNewsId = null;
let editingGroupId = null;
let activeAppId = null;

/* ════════════════ AUTH ════════════════ */

function attemptLogin() {
  const pw = document.getElementById('passwordInput').value;
  fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': pw }
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminPassword', pw);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminShell').classList.add('is-active');
        loadAll();
      } else {
        document.getElementById('loginError').classList.add('is-on');
      }
    })
    .catch(() => {
      document.getElementById('loginError').classList.add('is-on');
    });
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminPassword');
  location.reload();
}

function apiFetch(url, options = {}) {
  const pw = sessionStorage.getItem('adminPassword');
  const headers = { ...(options.headers || {}) };
  if (pw) headers['x-admin-password'] = pw;
  return fetch(url, { ...options, headers });
}

if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminShell').classList.add('is-active');
  loadAll();
}

document.getElementById('passwordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptLogin();
});

/* ════════════════ DATA LOAD ════════════════ */

async function loadAll() {
  await Promise.all([loadEvents(), loadNews(), loadGroups(), loadApplications()]);
  renderAll();
}

async function loadEvents() {
  try {
    const r = await apiFetch('/api/events');
    events = await r.json();
  } catch { events = []; }
}
async function loadNews() {
  try {
    const r = await apiFetch('/api/news');
    news = await r.json();
  } catch { news = []; }
}
async function loadGroups() {
  try {
    const r = await apiFetch('/api/groups');
    groups = await r.json();
  } catch { groups = []; }
}
async function loadApplications() {
  try {
    const r = await apiFetch('/api/applications');
    applications = await r.json();
  } catch { applications = []; }
}

function renderAll() {
  document.getElementById('countEvents').textContent = events.length;
  document.getElementById('countNews').textContent = news.length;
  document.getElementById('countGroups').textContent = groups.length;

  const newApps = applications.filter(a => a.status === 'new').length;
  const badge = document.getElementById('badgeApplications');
  if (newApps > 0) { badge.textContent = newApps; badge.hidden = false; }
  else { badge.hidden = true; }

  renderDashboard();
  renderEvents();
  renderNews();
  renderGroups();
  renderApplications();
  populateAimagSelects();
}

/* ════════════════ VIEW SWITCHING ════════════════ */

function switchView(view) {
  activeView = view;
  document.querySelectorAll('.view').forEach(v => v.hidden = v.id !== `view-${view}`);
  document.querySelectorAll('.sb-link').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
}

/* ════════════════ DASHBOARD ════════════════ */

function renderDashboard() {
  const upcoming = events.filter(e => e.status === 'upcoming' && !e.hidden);
  const totalMembers = groups.reduce((s, g) => s + (parseInt(g.members) || 0), 0);
  const newApps = applications.filter(a => a.status === 'new');

  document.getElementById('statUpcomingEvents').textContent = upcoming.length;
  document.getElementById('statGroups').textContent = groups.length;
  document.getElementById('statMembers').textContent = totalMembers.toLocaleString('mn-MN');
  document.getElementById('statNewApplications').textContent = newApps.length;

  /* Recent applications */
  const recentApps = applications.slice(0, 5);
  const appsEl = document.getElementById('dashRecentApplications');
  appsEl.innerHTML = recentApps.length
    ? recentApps.map(a => `
        <div class="list-thin-item" onclick="openApplicationModal('${a.id}')">
          <div class="lti-main">
            <div class="lti-title">${esc(a.lastName)} ${esc(a.firstName)}</div>
            <div class="lti-meta">${esc(a.email)} · ${esc(a.age || '—')}</div>
          </div>
          <span class="lti-badge ${a.status === 'new' ? 'lti-badge--new' : ''}">${statusLabel(a.status)}</span>
        </div>`).join('')
    : '<div class="empty-row">Хүсэлт алга</div>';

  /* Upcoming events */
  const upcomingList = [...upcoming]
    .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
    .slice(0, 5);
  const evEl = document.getElementById('dashUpcomingEvents');
  evEl.innerHTML = upcomingList.length
    ? upcomingList.map(ev => `
        <div class="list-thin-item" onclick="editEvent('${ev.id}')">
          <div class="lti-main">
            <div class="lti-title">${esc(ev.title || '')}</div>
            <div class="lti-meta">${esc(formatDate(ev.startDate))} · ${esc(ev.info?.location || '—')}</div>
          </div>
          <span class="lti-badge">${esc(ev.badge || BADGE_LABEL[ev.badgeType] || '—')}</span>
        </div>`).join('')
    : '<div class="empty-row">Удахгүй болох арга хэмжээ алга</div>';
}

/* ════════════════ EVENTS ════════════════ */

function filterEvents(f) {
  eventsFilter = f;
  document.querySelectorAll('#view-events .pill').forEach(p => p.classList.toggle('is-active', p.dataset.filter === f));
  renderEvents();
}

function renderEvents() {
  const search = (document.getElementById('eventsSearch')?.value || '').toLowerCase().trim();
  let list = events.slice();
  if (eventsFilter === 'upcoming') list = list.filter(e => e.status === 'upcoming');
  if (eventsFilter === 'past') list = list.filter(e => e.status === 'past');
  if (search) {
    list = list.filter(e =>
      (e.title || '').toLowerCase().includes(search) ||
      (e.info?.location || '').toLowerCase().includes(search) ||
      (e.description || '').toLowerCase().includes(search));
  }

  const el = document.getElementById('eventsList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><h3>Арга хэмжээ алга</h3><p>Шинээр нэмэхийн тулд дээрх товчийг дарна уу.</p></div>`;
    return;
  }
  el.innerHTML = list.map(ev => {
    const img = ev.image ? `<div class="ic-image" style="background-image:url('${ev.image}');"></div>` : `<div class="ic-image-fallback">${esc((ev.title || '?').charAt(0))}</div>`;
    const badge = ev.status === 'past' ? '<span class="ic-badge ic-badge--past">Өнгөрсөн</span>' :
                  `<span class="ic-badge ic-badge--${ev.badgeType || 'camp'}">${esc(ev.badge || BADGE_LABEL[ev.badgeType] || 'Кемп')}</span>`;
    return `<div class="item-card" onclick="editEvent('${ev.id}')">
      <div style="position:relative;">${img}${badge}</div>
      <div class="ic-body">
        <div class="ic-eyebrow">${esc(ev.eyebrow || formatDate(ev.startDate))}</div>
        <div class="ic-title">${esc(ev.title || '(гарчиггүй)')}</div>
        <div class="ic-meta">
          ${ev.info?.location ? `<span class="ic-meta-row">📍 ${esc(ev.info.location)}</span>` : ''}
          ${ev.info?.age ? `<span class="ic-meta-row">👥 ${esc(ev.info.age)}</span>` : ''}
          ${ev.info?.fee ? `<span class="ic-meta-row">💰 ${esc(ev.info.fee)}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ── Event modal ── */
function openEventModal() {
  editingEventId = null;
  document.getElementById('eventModalTitle').textContent = 'Шинэ арга хэмжээ';
  document.getElementById('eventForm').reset();
  document.getElementById('evImagePreview').src = '';
  document.getElementById('deleteEventBtn').hidden = true;
  document.getElementById('eventModal').classList.add('is-on');
}
function editEvent(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;
  editingEventId = id;
  document.getElementById('eventModalTitle').textContent = 'Арга хэмжээ засах';
  document.getElementById('eventId').value = id;
  document.getElementById('evTitle').value = ev.title || '';
  document.getElementById('evStatus').value = ev.status || 'upcoming';
  document.getElementById('evSubtitle').value = ev.subtitle || '';
  document.getElementById('evDescription').value = ev.description || '';
  document.getElementById('evStartDate').value = ev.startDate || '';
  document.getElementById('evEndDate').value = ev.endDate || '';
  document.getElementById('evLocation').value = ev.info?.location || '';
  document.getElementById('evImage').value = ev.image || '';
  document.getElementById('evBadgeType').value = ev.badgeType || 'camp';
  document.getElementById('evBadge').value = ev.badge || '';
  document.getElementById('evEyebrow').value = ev.eyebrow || '';
  document.getElementById('evAge').value = ev.info?.age || '';
  document.getElementById('evFee').value = ev.info?.fee || '';
  document.getElementById('evDeadline').value = ev.deadline || '';
  document.getElementById('evIncludes').value = (ev.includes || []).join('\n');
  document.getElementById('evBonus').value = ev.bonus || '';
  document.getElementById('evBankAccount').value = ev.bank?.account || '';
  document.getElementById('evBankName').value = ev.bank?.bank || '';
  document.getElementById('evContacts').value = (ev.contacts || []).join(', ');
  document.getElementById('evRegisterUrl').value = ev.registerUrl || '';
  document.getElementById('evFacebookUrl').value = ev.facebookUrl || '';
  document.getElementById('evFeatured').checked = !!ev.featured;
  document.getElementById('evHidden').checked = !!ev.hidden;
  document.getElementById('evImagePreview').src = ev.image || '';
  document.getElementById('deleteEventBtn').hidden = false;
  document.getElementById('eventModal').classList.add('is-on');
}
function closeEventModal() {
  document.getElementById('eventModal').classList.remove('is-on');
  editingEventId = null;
}
async function saveEvent(e) {
  e.preventDefault();

  let imageUrl = document.getElementById('evImage').value;
  const fileInput = document.getElementById('evImageFile');
  if (fileInput.files.length > 0) {
    const fd = new FormData();
    fd.append('image', fileInput.files[0]);
    try {
      const r = await apiFetch('/api/upload', { method: 'POST', body: fd });
      const d = await r.json();
      imageUrl = d.url;
    } catch {
      toast('Зураг upload алдаа', 'error');
      return;
    }
  }

  const startDate = document.getElementById('evStartDate').value;
  const endDate = document.getElementById('evEndDate').value || startDate;

  const months = ['1-р сарын','2-р сарын','3-р сарын','4-р сарын','5-р сарын','6-р сарын','7-р сарын','8-р сарын','9-р сарын','10-р сарын','11-р сарын','12-р сарын'];
  let dateDisplay = '';
  if (startDate) {
    const sd = new Date(startDate + 'T00:00:00');
    const startStr = `${sd.getFullYear()} оны ${months[sd.getMonth()]} ${sd.getDate()}`;
    if (endDate && endDate !== startDate) {
      const ed = new Date(endDate + 'T00:00:00');
      const dayDiff = Math.ceil((ed - sd) / (86400000)) + 1;
      dateDisplay = `${startStr}–${ed.getDate()} (${dayDiff} өдөр)`;
    } else {
      dateDisplay = startStr;
    }
  }

  const payload = {
    status: document.getElementById('evStatus').value,
    featured: document.getElementById('evFeatured').checked,
    hidden: document.getElementById('evHidden').checked,
    badge: document.getElementById('evBadge').value,
    badgeType: document.getElementById('evBadgeType').value,
    eyebrow: document.getElementById('evEyebrow').value,
    title: document.getElementById('evTitle').value,
    subtitle: document.getElementById('evSubtitle').value,
    image: imageUrl,
    description: document.getElementById('evDescription').value,
    startDate,
    endDate,
    info: {
      location: document.getElementById('evLocation').value,
      date: dateDisplay,
      age: document.getElementById('evAge').value,
      fee: document.getElementById('evFee').value,
    },
    includes: document.getElementById('evIncludes').value.split('\n').map(s => s.trim()).filter(Boolean),
    bonus: document.getElementById('evBonus').value,
    bank: {
      account: document.getElementById('evBankAccount').value,
      bank: document.getElementById('evBankName').value,
      note: '',
    },
    deadline: document.getElementById('evDeadline').value,
    contacts: document.getElementById('evContacts').value.split(',').map(s => s.trim()).filter(Boolean),
    registerUrl: document.getElementById('evRegisterUrl').value,
    facebookUrl: document.getElementById('evFacebookUrl').value,
  };

  try {
    const url = editingEventId ? `/api/events/${editingEventId}` : '/api/events';
    const method = editingEventId ? 'PUT' : 'POST';
    const r = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('Save failed');
    toast(editingEventId ? 'Шинэчлэгдлээ' : 'Нэмэгдлээ', 'success');
    closeEventModal();
    await loadEvents();
    renderAll();
  } catch {
    toast('Хадгалах алдаа', 'error');
  }
}
async function deleteCurrentEvent() {
  if (!editingEventId || !confirm('Энэ арга хэмжээг устгах уу?')) return;
  try {
    const r = await apiFetch(`/api/events/${editingEventId}`, { method: 'DELETE' });
    if (!r.ok) throw new Error();
    toast('Устгагдлаа', 'success');
    closeEventModal();
    await loadEvents();
    renderAll();
  } catch { toast('Устгах алдаа', 'error'); }
}

/* ════════════════ NEWS ════════════════ */

function renderNews() {
  const el = document.getElementById('newsList');
  if (!news.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📰</div><h3>Мэдэгдэл алга</h3><p>Шинээр нэмэхийн тулд дээрх товчийг дарна уу.</p></div>`;
    return;
  }
  const TAG_LABEL = { info: 'Зар', urgent: 'Яаралтай', update: 'Шинэчлэл' };
  el.innerHTML = news.map(n => `
    <div class="news-card" onclick="editNews('${n.id}')">
      <div class="news-card-body">
        <h3>${esc(n.title || '')}</h3>
        <p>${esc(n.body || '')}</p>
        <div class="news-card-meta">
          <span class="news-badge news-badge--${n.tagType || 'info'}">${esc(TAG_LABEL[n.tagType] || 'Зар')}</span>
          <span class="news-date">${esc(n.date || '')}</span>
        </div>
      </div>
      <div class="news-card-actions">
        <button class="btn btn--ghost btn--sm" onclick="event.stopPropagation();editNews('${n.id}')">Засах</button>
        <button class="btn btn--danger btn--sm" onclick="event.stopPropagation();quickDeleteNews('${n.id}')">×</button>
      </div>
    </div>`).join('');
}

function openNewsModal() {
  editingNewsId = null;
  document.getElementById('newsModalTitle').textContent = 'Шинэ мэдэгдэл';
  document.getElementById('newsForm').reset();
  document.getElementById('newsDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('deleteNewsBtn').hidden = true;
  document.getElementById('newsModal').classList.add('is-on');
}
function editNews(id) {
  const n = news.find(x => x.id === id);
  if (!n) return;
  editingNewsId = id;
  document.getElementById('newsModalTitle').textContent = 'Мэдэгдэл засах';
  document.getElementById('newsId').value = id;
  document.getElementById('newsTitle').value = n.title || '';
  document.getElementById('newsBody').value = n.body || '';
  document.getElementById('newsTag').value = n.tagType || 'info';
  document.getElementById('newsDate').value = n.date || '';
  document.getElementById('deleteNewsBtn').hidden = false;
  document.getElementById('newsModal').classList.add('is-on');
}
function closeNewsModal() {
  document.getElementById('newsModal').classList.remove('is-on');
  editingNewsId = null;
}
async function saveNews(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('newsTitle').value,
    body: document.getElementById('newsBody').value,
    tag: document.getElementById('newsTag').value,
    tagType: document.getElementById('newsTag').value,
    date: document.getElementById('newsDate').value,
  };
  try {
    const url = editingNewsId ? `/api/news/${editingNewsId}` : '/api/news';
    const method = editingNewsId ? 'PUT' : 'POST';
    const r = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error();
    toast(editingNewsId ? 'Шинэчлэгдлээ' : 'Нэмэгдлээ', 'success');
    closeNewsModal();
    await loadNews();
    renderAll();
  } catch { toast('Хадгалах алдаа', 'error'); }
}
async function deleteNews() {
  if (!editingNewsId || !confirm('Энэ мэдэгдэлг устгах уу?')) return;
  await quickDeleteNews(editingNewsId);
  closeNewsModal();
}
async function quickDeleteNews(id) {
  if (!confirm('Устгах уу?')) return;
  try {
    const r = await apiFetch(`/api/news/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error();
    toast('Устгагдлаа', 'success');
    await loadNews();
    renderAll();
  } catch { toast('Устгах алдаа', 'error'); }
}

/* ════════════════ GROUPS ════════════════ */

function populateAimagSelects() {
  // For filter on Groups list
  const filter = document.getElementById('groupsAimagFilter');
  if (filter) {
    const cur = filter.value;
    filter.innerHTML = '<option value="">Бүх аймаг</option>' +
      AIMAGS.map(a => `<option value="${a.slug}">${esc(a.mn)}</option>`).join('');
    filter.value = cur;
  }
  // For new group modal
  const select = document.getElementById('grpAimag');
  if (select) {
    const cur = select.value;
    select.innerHTML = AIMAGS.map(a => `<option value="${a.slug}">${esc(a.mn)}</option>`).join('');
    select.value = cur;
  }
}

function renderGroups() {
  const search = (document.getElementById('groupsSearch')?.value || '').toLowerCase().trim();
  const aimagFilter = document.getElementById('groupsAimagFilter')?.value || '';
  let list = groups.slice();
  if (aimagFilter) list = list.filter(g => g.aimag === aimagFilter);
  if (search) {
    list = list.filter(g =>
      (g.name || '').toLowerCase().includes(search) ||
      (g.sum || '').toLowerCase().includes(search) ||
      (g.leader || '').toLowerCase().includes(search));
  }

  const el = document.getElementById('groupsList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📍</div><h3>Бүлгэм алга</h3><p>Шинээр нэмэхийн тулд дээрх товчийг дарна уу.</p></div>`;
    return;
  }

  el.innerHTML = list.map(g => {
    const aimagName = AIMAGS.find(a => a.slug === g.aimag)?.mn || g.aimag;
    return `<div class="item-card" onclick="editGroup('${g.id}')">
      <div class="ic-body">
        <span class="group-card-aimag">${esc(aimagName)}</span>
        <div class="ic-title">${esc(g.name || '(нэргүй)')}</div>
        <div class="ic-meta">
          ${g.sum ? `<span class="ic-meta-row">📍 ${esc(g.sum)}</span>` : ''}
          ${g.members ? `<span class="ic-meta-row">👥 ${esc(g.members)} скаут</span>` : ''}
          ${g.leader ? `<span class="ic-meta-row">👤 ${esc(g.leader)}</span>` : ''}
          ${g.contact ? `<span class="ic-meta-row">📞 ${esc(g.contact)}</span>` : ''}
          ${g.meetingTime ? `<span class="ic-meta-row">🕐 ${esc(g.meetingTime)}</span>` : ''}
        </div>
        <div class="group-card-tags">
          ${(g.ageGroups || []).map(a => `<span class="group-tag">${esc(AGE_LABEL[a] || a)}</span>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

function openGroupModal() {
  editingGroupId = null;
  document.getElementById('groupModalTitle').textContent = 'Шинэ бүлгэм';
  document.getElementById('groupForm').reset();
  document.getElementById('deleteGroupBtn').hidden = true;
  document.getElementById('groupModal').classList.add('is-on');
}
function editGroup(id) {
  const g = groups.find(x => x.id === id);
  if (!g) return;
  editingGroupId = id;
  document.getElementById('groupModalTitle').textContent = 'Бүлгэм засах';
  document.getElementById('groupId').value = id;
  document.getElementById('grpName').value = g.name || '';
  document.getElementById('grpAimag').value = g.aimag || '';
  document.getElementById('grpSum').value = g.sum || '';
  document.getElementById('grpLeader').value = g.leader || '';
  document.getElementById('grpContact').value = g.contact || '';
  document.getElementById('grpMembers').value = g.members || '';
  document.getElementById('grpMeetingTime').value = g.meetingTime || '';
  const ages = g.ageGroups || [];
  document.getElementById('grpAgeCub').checked = ages.includes('cub');
  document.getElementById('grpAgeScout').checked = ages.includes('scout');
  document.getElementById('grpAgeVenchir').checked = ages.includes('venchir');
  document.getElementById('grpAgeRover').checked = ages.includes('rover');
  document.getElementById('deleteGroupBtn').hidden = false;
  document.getElementById('groupModal').classList.add('is-on');
}
function closeGroupModal() {
  document.getElementById('groupModal').classList.remove('is-on');
  editingGroupId = null;
}
async function saveGroup(e) {
  e.preventDefault();
  const ageGroups = [];
  if (document.getElementById('grpAgeCub').checked) ageGroups.push('cub');
  if (document.getElementById('grpAgeScout').checked) ageGroups.push('scout');
  if (document.getElementById('grpAgeVenchir').checked) ageGroups.push('venchir');
  if (document.getElementById('grpAgeRover').checked) ageGroups.push('rover');

  const payload = {
    name: document.getElementById('grpName').value,
    aimag: document.getElementById('grpAimag').value,
    sum: document.getElementById('grpSum').value,
    leader: document.getElementById('grpLeader').value,
    contact: document.getElementById('grpContact').value,
    members: parseInt(document.getElementById('grpMembers').value) || 0,
    meetingTime: document.getElementById('grpMeetingTime').value,
    ageGroups,
  };

  try {
    const url = editingGroupId ? `/api/groups/${editingGroupId}` : '/api/groups';
    const method = editingGroupId ? 'PUT' : 'POST';
    const r = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error();
    toast(editingGroupId ? 'Шинэчлэгдлээ' : 'Нэмэгдлээ', 'success');
    closeGroupModal();
    await loadGroups();
    renderAll();
  } catch { toast('Хадгалах алдаа', 'error'); }
}
async function deleteGroup() {
  if (!editingGroupId || !confirm('Энэ бүлгэмийг устгах уу?')) return;
  try {
    const r = await apiFetch(`/api/groups/${editingGroupId}`, { method: 'DELETE' });
    if (!r.ok) throw new Error();
    toast('Устгагдлаа', 'success');
    closeGroupModal();
    await loadGroups();
    renderAll();
  } catch { toast('Устгах алдаа', 'error'); }
}

/* ════════════════ APPLICATIONS ════════════════ */

function filterApplications(f) {
  appsFilter = f;
  document.querySelectorAll('#view-applications .pill').forEach(p => p.classList.toggle('is-active', p.dataset.filter === f));
  renderApplications();
}

function renderApplications() {
  const search = (document.getElementById('appsSearch')?.value || '').toLowerCase().trim();
  let list = applications.slice();
  if (appsFilter !== 'all') list = list.filter(a => a.status === appsFilter);
  if (search) {
    list = list.filter(a =>
      (a.firstName + ' ' + a.lastName).toLowerCase().includes(search) ||
      (a.email || '').toLowerCase().includes(search) ||
      (a.phone || '').toLowerCase().includes(search) ||
      (a.location || '').toLowerCase().includes(search));
  }

  const el = document.getElementById('applicationsList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📨</div><h3>Бүртгэлийн хүсэлт алга</h3><p>Шинэ хүсэлт ирэхэд эндээс харна.</p></div>`;
    return;
  }
  el.innerHTML = list.map(a => {
    const initials = ((a.firstName || '?')[0] + (a.lastName || '')[0] || '').toUpperCase();
    return `<div class="app-card ${a.status === 'new' ? 'is-new' : ''}" onclick="openApplicationModal('${a.id}')">
      <div class="app-avatar">${esc(initials)}</div>
      <div class="app-info">
        <div class="app-name">${esc(a.lastName)} ${esc(a.firstName)}</div>
        <div class="app-meta">${esc(a.email)} · ${esc(a.phone || '—')} · ${esc(a.location || '—')}</div>
      </div>
      <span class="app-status app-status--${a.status}">${statusLabel(a.status)}</span>
      <span class="app-time">${esc(timeAgo(a.submittedAt))}</span>
    </div>`;
  }).join('');
}

async function openApplicationModal(id) {
  const a = applications.find(x => x.id === id);
  if (!a) return;
  activeAppId = id;
  switchView('applications');

  if (a.status === 'new') {
    try {
      await apiFetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });
      a.status = 'read';
      renderAll();
    } catch {}
  }

  const aimagName = a.aimag ? (AIMAGS.find(x => x.slug === a.aimag)?.mn || a.aimag) : '';
  const groupRef  = a.groupId ? groups.find(g => g.id === a.groupId) : null;
  const groupName = groupRef ? groupRef.name : '';

  document.getElementById('appModalBody').innerHTML = `
    <div class="app-detail-row"><span class="app-detail-label">Овог нэр</span><span class="app-detail-value">${esc(a.lastName)} ${esc(a.firstName)}</span></div>
    <div class="app-detail-row"><span class="app-detail-label">Имэйл</span><span class="app-detail-value"><a href="mailto:${esc(a.email)}">${esc(a.email)}</a></span></div>
    <div class="app-detail-row"><span class="app-detail-label">Утас</span><span class="app-detail-value">${a.phone ? `<a href="tel:${esc(a.phone)}">${esc(a.phone)}</a>` : '—'}</span></div>
    <div class="app-detail-row"><span class="app-detail-label">Нас</span><span class="app-detail-value">${esc(a.age || '—')}</span></div>
    <div class="app-detail-row"><span class="app-detail-label">Байршил</span><span class="app-detail-value">${esc(a.location || '—')}</span></div>
    ${aimagName ? `<div class="app-detail-row"><span class="app-detail-label">Сонгосон аймаг</span><span class="app-detail-value">${esc(aimagName)}</span></div>` : ''}
    ${groupName ? `<div class="app-detail-row"><span class="app-detail-label">Сонгосон бүлгэм</span><span class="app-detail-value">${esc(groupName)}</span></div>` : ''}
    ${a.message ? `<div class="app-detail-row"><span class="app-detail-label">Зурвас</span><span class="app-detail-value app-detail-msg">${esc(a.message)}</span></div>` : ''}
    <div class="app-detail-row"><span class="app-detail-label">Илгээсэн</span><span class="app-detail-value">${esc(formatDateTime(a.submittedAt))}</span></div>
    <div class="app-detail-row"><span class="app-detail-label">Төлөв</span><span class="app-detail-value"><span class="app-status app-status--${a.status}">${statusLabel(a.status)}</span></span></div>
  `;
  document.getElementById('appModal').classList.add('is-on');
}
function closeAppModal() {
  document.getElementById('appModal').classList.remove('is-on');
  activeAppId = null;
}
async function markAppStatus(status) {
  if (!activeAppId) return;
  try {
    const r = await apiFetch(`/api/applications/${activeAppId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error();
    toast('Шинэчлэгдлээ', 'success');
    closeAppModal();
    await loadApplications();
    renderAll();
  } catch { toast('Шинэчлэх алдаа', 'error'); }
}
async function deleteApplication() {
  if (!activeAppId || !confirm('Энэ хүсэлтийг устгах уу?')) return;
  try {
    const r = await apiFetch(`/api/applications/${activeAppId}`, { method: 'DELETE' });
    if (!r.ok) throw new Error();
    toast('Устгагдлаа', 'success');
    closeAppModal();
    await loadApplications();
    renderAll();
  } catch { toast('Устгах алдаа', 'error'); }
}

/* ════════════════ UTILS ════════════════ */

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function statusLabel(s) {
  return ({ new: 'Шинэ', read: 'Уншсан', contacted: 'Холбогдсон', archived: 'Архивласан' })[s] || s;
}

function formatDate(s) {
  if (!s) return '';
  return s.replace(/-/g, '.');
}

function formatDateTime(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n) { return String(n).padStart(2, '0'); }

function timeAgo(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return '';
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return 'дөнгөж сая';
  const min = Math.floor(sec / 60); if (min < 60) return `${min} мин`;
  const hr = Math.floor(min / 60);  if (hr < 24) return `${hr} ц`;
  const dy = Math.floor(hr / 24);   if (dy < 30) return `${dy} өдөр`;
  const mo = Math.floor(dy / 30);   if (mo < 12) return `${mo} сар`;
  return `${Math.floor(mo / 12)} жил`;
}

function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast is-on ' + (type ? 'toast--' + type : '');
  setTimeout(() => { t.className = 'toast'; }, 2500);
}

/* Close modals on overlay click */
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('is-on'); });
});

/* Image preview */
const fileInput = document.getElementById('evImageFile');
if (fileInput) {
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('evImagePreview').src = ev.target.result;
      document.getElementById('evImage').value = '[uploaded file]';
    };
    reader.readAsDataURL(file);
  });
}

/* Poll for new applications every 30s when logged in */
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  setInterval(async () => {
    const before = applications.filter(a => a.status === 'new').length;
    await loadApplications();
    const after = applications.filter(a => a.status === 'new').length;
    if (after > before) {
      toast(`Шинэ бүртгэлийн хүсэлт ирлээ (${after - before})`, 'success');
      renderAll();
    }
  }, 30000);
}
