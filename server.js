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

  // Seed data if collections are empty
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
      hidden: false
    },
    {
      id: 'warrior-challenge',
      hidden: true,
      status: 'upcoming',
      featured: false,
      badge: 'Олон улс',
      badgeType: 'intl',
      eyebrow: 'Jamboree Activity Highlight',
      title: 'Warrior Challenge',
      subtitle: 'Жамбори дахь онцлох арга хэмжээ',
      image: '/img/washy.jpg',
      imageBg: 'linear-gradient(135deg, #6b1f00 0%, #a33000 100%)',
      description: 'At the Warrior Challenge, you will experience how the warriors of Chinggis Khaan trained, competed and celebrated. Challenge yourself at Jamboree in Mongolia!',
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

  await db.collection('events').insertMany(events);
  await db.collection('news').insertMany(news);
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
app.post('/api/events', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const newEvent = {
      id: req.body.id || generateId(req.body.title || 'event'),
      ...req.body
    };
    await db.collection('events').insertOne(newEvent);
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT update event
app.put('/api/events/:id', async (req, res) => {
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
app.delete('/api/events/:id', async (req, res) => {
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
app.post('/api/upload', upload.single('image'), (req, res) => {
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
app.post('/api/news', async (req, res) => {
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
app.put('/api/news/:id', async (req, res) => {
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
app.delete('/api/news/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });
    const result = await db.collection('news').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'News not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

// ─── Admin Auth Middleware ──────────────────────────────────────

function adminAuth(req, res, next) {
  const password = req.query.password || req.headers['x-admin-password'];
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// ─── Admin Panel ──────────────────────────────────────────────

app.get('/admin', (req, res) => {
  const html = fs.readFileSync(path.join(__dirname, 'admin', 'index.html'), 'utf8');
  const safePassword = JSON.stringify(process.env.ADMIN_PASSWORD || '');
  const injected = html.replace(
    "const ADMIN_PASSWORD = 'scoutadmin123';",
    `const ADMIN_PASSWORD = ${safePassword};`
  );
  res.send(injected);
});

app.get('/api/admin/verify', adminAuth, (req, res) => {
  res.json({ ok: true });
});

// ─── Serve static files (catch-all) ───────────────────────────

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
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
