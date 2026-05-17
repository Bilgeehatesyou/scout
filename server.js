const express = require('express');
const path = require('path');
const multer = require('multer');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = 'scout_mongolia';

const UPLOAD_DIR = path.join(__dirname, 'img', 'data');

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config — store in img/data/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
    cb(null, name + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB connection pool
let db;
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB Atlas');

  // Seed data only on a totally fresh DB.
  // We DO NOT auto-seed groups on existing DBs — admin manages those manually.
  const eventsCount = await db.collection('events').countDocuments();
  if (eventsCount === 0) {
    await seedData();
  }
}

async function seedData() {
  const events = [
    {
      id: 'bubashus-137',
      status: 'upcoming',
      featured: true,
      badge: 'Кемп',
      badgeType: 'camp',
      eyebrow: '#137 дугаарт · Удахгүй',
      title: 'БУБАШҮС #137',
      subtitle: 'Бүлэг Байгуулалтын Шинэ Үеийн Сургууль',
      image: '/img/data/bubashus.jpg',
      description: 'Оройн мэнд скаутуудаа! Урин дулаан цаг ирж буй энэ цагт бид бүхний хүсэн хүлээсэн 137-р БУБАШҮС-ын тов гарлаа! Найз нөхөд, хамт олонтойгоо хөгжилтэй цагийг өнгөрүүлж, скаутын ур чадваруудаа хөгжүүлэн, дурсамжаар дүүрэн 6 өдрийг Найрамдал зусланд хамтдаа өнгөрүүлцгээе!',
      info: {
        location: 'Олон Улсын Хүүхдийн Найрамдал Цогцолбор',
        date: '2026 оны 4-р сарын 14–19 (6 өдөр, 5 шөнө)',
        age: '+8 болон дээш',
        fee: '515,000₮'
      },
      includes: ['Хоол, байр', 'Унаа', 'Бүч', 'Хөтөлбөрийн зардал'],
      bonus: '10+1 урамшуулал: 10 болон түүнээс дээш хүүхэд хариуцаж ирсэн багш үнэ төлбөргүй!',
      bank: {
        account: '48000500 · 5077216889',
        bank: 'Хаан банк — Монголын Скаутын Холбоо',
        note: 'Нэр, утасны дугаар, хаанаас оролцож буйгаа бичнэ үү'
      },
      deadline: '2026 оны 4-р сарын 10',
      contacts: ['11-324171', '89390516', '88927079'],
      registerUrl: 'https://forms.gle/jm86LgSDFAtrEqSG7',
      facebookUrl: 'https://www.facebook.com/ScoutMongolia/posts/pfbid0WrBJ45Efm6gipqv1ktwujo9tqJYsyaNnuNzGKjTyPwvxNdF9VYedYVuuVTa4xdFpl',
      hidden: false,
      startDate: '2026-04-14',
      endDate: '2026-04-19'
    },
    {
      id: 'warrior-challenge',
      hidden: true,
      status: 'upcoming',
      featured: false,
      badge: 'Олон улс',
      badgeType: 'intl',
      eyebrow: 'Жамборийн онцлох арга хэмжээ',
      title: 'Дайчны сорилт (Warrior Challenge)',
      subtitle: 'Жамбори дахь онцлох арга хэмжээ',
      image: '/img/washy.jpg',
      imageBg: 'linear-gradient(135deg, #6b1f00 0%, #a33000 100%)',
      description: 'Чингис хааны үеийн дайчид хэрхэн бэлтгэгдэж, өрсөлдөж, баяр тэмдэглэдэг байсныг туулан үзээрэй. Монгол дахь Жамборид өөрийгөө сорь!',
      info: {
        location: 'Монгол улс',
        date: '2026 он',
        age: 'Бүх нас',
        fee: 'Жамборийн бүртгэлтэй'
      },
      includes: [],
      bonus: '',
      bank: null,
      deadline: '',
      contacts: [],
      registerUrl: 'https://forms.gle/yaeDR7RnJm8QbAYt9',
      facebookUrl: 'https://www.facebook.com/share/p/1Bced77QUZ/'
    },
    {
      id: 'bubashus-136',
      status: 'past',
      featured: false,
      badge: 'Кемп',
      badgeType: 'camp',
      eyebrow: '30 жил',
      title: '30 жилийн ойн Жемборий',
      subtitle: '',
      image: '/img/data/jamboree.jpg',
      description: 'Амжилттай зохион байгуулагдсан жемборий.',
      info: {
        location: 'Найрамдал цогцолбор',
        date: '2022 он',
        age: '+8',
        fee: ''
      },
      includes: [],
      bonus: '',
      bank: null,
      deadline: '',
      contacts: [],
      registerUrl: '',
      facebookUrl: ''
    },
    {
      id: 'jamboree-2023',
      status: 'past',
      featured: false,
      badge: 'Олон улс',
      badgeType: 'intl',
      eyebrow: '2023 он · Солонгос',
      title: 'World Scout Jamboree 2023',
      subtitle: '',
      image: '/img/data/oluulaa_alhaj_bna.jpg',
      description: '25-р Дэлхийн Жамбори дээр Монголын скаутууд амжилттай оролцлоо.',
      info: {
        location: 'Солонгос улс',
        date: '2023 он',
        age: '12–17',
        fee: ''
      },
      includes: [],
      bonus: '',
      bank: null,
      deadline: '',
      contacts: [],
      registerUrl: '',
      facebookUrl: ''
    }
  ];

  const news = [
    {
      id: 'n1',
      tag: 'Зар',
      tagType: 'info',
      date: '2026.04.20',
      title: 'Дүрэмт хувцасны захиалга эхэллээ',
      body: '4-р сарын 30-ны дотор удирдагчтайгаа холбогдоно уу.'
    },
    {
      id: 'n2',
      tag: 'Яаралтай',
      tagType: 'urgent',
      date: '2026.04.18',
      title: 'Гишүүнчлэлийн төлбөрийн хугацаа дуусч байна',
      body: '4/30 хүртэл төлөөгүй бол бүртгэл цуцлагдана.'
    }
  ];

  const groups = [
    { id: 'ub-1',  aimag: 'ulaanbaatar', sum: 'Хан-Уул дүүрэг',     name: 'УБ #1 Хан-Уул',         ageGroups: ['cub','scout'],            members: 64, leader: 'Б. Дорж',         contact: '99001122', meetingTime: 'Бямба 14:00' },
    { id: 'ub-2',  aimag: 'ulaanbaatar', sum: 'Сүхбаатар дүүрэг',   name: 'УБ #2 Сүхбаатар',       ageGroups: ['scout','venchir'],        members: 48, leader: 'Г. Сараа',        contact: '99334455', meetingTime: 'Ням 10:00' },
    { id: 'ub-3',  aimag: 'ulaanbaatar', sum: 'Чингэлтэй дүүрэг',   name: 'УБ #3 Чингэлтэй',       ageGroups: ['cub'],                    members: 30, leader: 'Д. Болд',         contact: '99221133', meetingTime: 'Бямба 11:00' },
    { id: 'ub-4',  aimag: 'ulaanbaatar', sum: 'Баянзүрх дүүрэг',    name: 'УБ #4 Баянзүрх',        ageGroups: ['scout','venchir','rover'],members: 72, leader: 'Х. Энхтуяа',      contact: '99445566', meetingTime: 'Ням 14:00' },
    { id: 'ub-5',  aimag: 'ulaanbaatar', sum: 'СХД',                name: 'УБ #5 Сонгинохайрхан',  ageGroups: ['cub','scout'],            members: 55, leader: 'Б. Очир',         contact: '99776655', meetingTime: 'Бямба 13:00' },
    { id: 'kh-1',  aimag: 'khuvsgul',    sum: 'Мөрөн',              name: 'Мөрөн #14',             ageGroups: ['cub','scout'],            members: 38, leader: 'Б. Энхбат',       contact: '88112233', meetingTime: 'Бямба 14:00' },
    { id: 'kh-2',  aimag: 'khuvsgul',    sum: 'Алаг-Эрдэнэ',        name: 'Хатгал #2',             ageGroups: ['scout'],                  members: 24, leader: 'Г. Цэрэн',        contact: '88223344', meetingTime: 'Ням 10:00' },
    { id: 'dr-1',  aimag: 'darkhan-uul', sum: 'Дархан',             name: 'Дархан #7',             ageGroups: ['cub','scout','venchir'],  members: 58, leader: 'Д. Алтанцэцэг',   contact: '88445566', meetingTime: 'Бямба 14:00' },
    { id: 'dr-2',  aimag: 'darkhan-uul', sum: 'Дархан',             name: 'Дархан #8',             ageGroups: ['cub'],                    members: 32, leader: 'Ц. Бат-Эрдэнэ',   contact: '88556677', meetingTime: 'Ням 11:00' },
    { id: 'or-1',  aimag: 'orkhon',      sum: 'Эрдэнэт',            name: 'Эрдэнэт #9',            ageGroups: ['cub','scout','venchir'],  members: 65, leader: 'Х. Тэмүүлэн',     contact: '88889900', meetingTime: 'Бямба 13:00' },
    { id: 'or-2',  aimag: 'orkhon',      sum: 'Эрдэнэт',            name: 'Эрдэнэт #10',           ageGroups: ['scout'],                  members: 22, leader: 'Г. Анхбаяр',      contact: '88990011', meetingTime: 'Ням 10:00' },
    { id: 'sl-1',  aimag: 'selenge',     sum: 'Сүхбаатар',          name: 'Сүхбаатар #3',          ageGroups: ['cub','scout'],            members: 28, leader: 'Б. Гэрэлмаа',     contact: '88778899', meetingTime: 'Бямба 14:00' },
    { id: 'ar-1',  aimag: 'arkhangai',   sum: 'Цэцэрлэг',           name: 'Цэцэрлэг #5',           ageGroups: ['cub','scout'],            members: 30, leader: 'Ж. Болормаа',     contact: '88001122', meetingTime: 'Бямба 14:00' },
    { id: 'tv-1',  aimag: 'tov',         sum: 'Зуунмод',            name: 'Зуунмод #4',            ageGroups: ['cub','scout'],            members: 35, leader: 'Б. Энхтайван',    contact: '88112233', meetingTime: 'Бямба 13:00' },
    { id: 'dn-1',  aimag: 'dornod',      sum: 'Чойбалсан',          name: 'Чойбалсан #11',         ageGroups: ['cub','scout'],            members: 26, leader: 'О. Жаргалмаа',    contact: '88334455', meetingTime: 'Бямба 14:00' },
    { id: 'bo-1',  aimag: 'bayan-olgii', sum: 'Өлгий',              name: 'Өлгий #6',              ageGroups: ['scout','venchir'],        members: 32, leader: 'Е. Бекмурат',     contact: '88445566', meetingTime: 'Ням 14:00' },
  ];

  await db.collection('events').insertMany(events);
  await db.collection('news').insertMany(news);
  await db.collection('groups').insertMany(groups);
  console.log('Seeded initial data to MongoDB');
}

// ─── API Routes ──────────────────────────────────────────────

// GET all events
app.get('/api/events', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const events = await db.collection('events').find({}).toArray();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET single event
app.get('/api/events/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const event = await db.collection('events').findOne({ id: req.params.id });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST create event
app.post('/api/events', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { id: rawId, ...rest } = req.body;
    const newEvent = {
      id: rawId || generateId(rest.title || 'event'),
      ...rest
    };
    await db.collection('events').insertOne(newEvent);
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event
app.put('/api/events/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('events').findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Event not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE event
app.delete('/api/events/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('events').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST upload image
app.post('/api/upload', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/img/data/${req.file.filename}`;
  res.json({ url });
});

// GET news
app.get('/api/news', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const news = await db.collection('news').find({}).toArray();
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// POST news
app.post('/api/news', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const item = { id: Date.now().toString(36), ...req.body };
    await db.collection('news').insertOne(item);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create news' });
  }
});

// PUT news
app.put('/api/news/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('news').findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'News not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update news' });
  }
});

// DELETE news
app.delete('/api/news/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('news').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// ─── Groups API ───────────────────────────────────────────────

// GET all groups (public)
app.get('/api/groups', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const groups = await db.collection('groups').find({}).toArray();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// POST create group (admin)
app.post('/api/groups', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { id: rawId, ...rest } = req.body;
    const newGroup = {
      id: rawId || generateId(rest.name || 'group'),
      ...rest,
    };
    await db.collection('groups').insertOne(newGroup);
    res.json(newGroup);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// PUT update group (admin)
app.put('/api/groups/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { _id, ...patch } = req.body;
    const result = await db.collection('groups').findOneAndUpdate(
      { id: req.params.id },
      { $set: patch },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Group not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE group (admin)
app.delete('/api/groups/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('groups').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Group not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// ─── Applications API (join requests) ────────────────────────

// POST application (PUBLIC — from join form)
app.post('/api/applications', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { firstName, lastName, email, phone, age, location, message, aimag, groupId } = req.body || {};
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'firstName, lastName, email required' });
    }
    const application = {
      id: 'app-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      firstName: String(firstName).slice(0, 80),
      lastName:  String(lastName).slice(0, 80),
      email:     String(email).slice(0, 200),
      phone:     String(phone || '').slice(0, 40),
      age:       String(age || '').slice(0, 40),
      location:  String(location || '').slice(0, 200),
      message:   String(message || '').slice(0, 2000),
      aimag:     String(aimag || '').slice(0, 60),
      groupId:   String(groupId || '').slice(0, 60),
      status:    'new',
      submittedAt: new Date().toISOString(),
    };
    await db.collection('applications').insertOne(application);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET applications (admin)
app.get('/api/applications', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const apps = await db.collection('applications')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET unread count (admin) — for sidebar badge
app.get('/api/applications/unread-count', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const count = await db.collection('applications').countDocuments({ status: 'new' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count' });
  }
});

// PUT update application status (admin)
app.put('/api/applications/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const { status } = req.body || {};
    if (!['new', 'read', 'contacted', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const result = await db.collection('applications').findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Application not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE application (admin)
app.delete('/api/applications/:id', adminAuth, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('applications').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Application not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// ─── Admin Auth Middleware ──────────────────────────────────────

function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// ─── Admin Panel ──────────────────────────────────────────────

app.get('/admin', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'admin', 'index.html'), 'utf8');
  const injected = html.replace(
    "let events = [];",
    "let events = [];"
  );
  res.send(injected);
});

app.post('/api/admin/login', (req, res) => {
  const pw = req.headers['x-admin-password'];
  if (pw && pw === process.env.ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false });
});

app.get('/api/admin/verify', adminAuth, (req, res) => {
  res.json({ ok: true });
});

// ─── 404 handler ──────────────────────────────────────────────
// Static files are served by express.static() above. If the request
// reaches here, nothing matched — return a 404.

app.use((req, res) => {
  res.status(404).send('Not found');
});

// ─── Helpers ──────────────────────────────────────────────────

function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50)
    + '-' + Date.now().toString(36);
}

// ─── Start ────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin panel at http://localhost:${PORT}/admin`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
