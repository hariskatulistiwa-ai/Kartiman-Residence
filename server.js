// Server website wisuda digital + panel admin.
// Jalankan: npm install && npm start  →  buka http://localhost:3000  (admin: /admin)
import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { getDB, save, saveNow, uid, DATA_DIR, replaceDB } from './src/store.js';

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'wisuda2026';
const ROOT = path.resolve('.');
const PUBLIC_DIR = path.join(ROOT, 'public');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Rahasia untuk menandatangani sesi admin (dibuat sekali, disimpan di data/)
const SECRET_FILE = path.join(DATA_DIR, '.secret');
if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'));
const SECRET = process.env.SESSION_SECRET || fs.readFileSync(SECRET_FILE, 'utf8').trim();

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));

// ---------- util ----------
const clean = (v, max = 2000) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const sortByOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const good = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return null;
  const data = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (data.exp < Date.now()) return null;
  return data;
}
function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}
function requireAdmin(req, res, next) {
  const token = getCookie(req, 'grad_admin') || (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!verify(token)) return res.status(401).json({ error: 'Silakan login dulu.' });
  next();
}

// Pembatas sederhana untuk kiriman publik (anti-spam)
const hits = new Map();
function rateLimit(max, windowMs) {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (list.length >= max) return res.status(429).json({ error: 'Terlalu banyak percobaan, coba lagi sebentar ya.' });
    list.push(now);
    hits.set(key, list);
    next();
  };
}
setInterval(() => hits.clear(), 30 * 60 * 1000).unref();

// ---------- upload ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = new Date().toISOString().slice(0, 7); // yyyy-mm
    const dir = path.join(UPLOAD_DIR, sub);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname || '') || mimeExt(file.mimetype)).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(5).toString('hex')}${ext || '.bin'}`);
  },
});
function mimeExt(m) {
  return { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'audio/mpeg': '.mp3', 'audio/mp4': '.m4a', 'audio/ogg': '.ogg', 'audio/wav': '.wav' }[m] || '';
}
const imageOnly = (req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype));
const mediaOnly = (req, file, cb) => cb(null, /^(image\/(jpeg|png|webp|gif)|audio\/(mpeg|mp3|mp4|x-m4a|aac|ogg|wav|x-wav|webm))$/.test(file.mimetype));
const uploadPublic = multer({ storage, fileFilter: imageOnly, limits: { fileSize: 12 * 1024 * 1024, files: 2 } });
const uploadAdmin = multer({ storage, fileFilter: mediaOnly, limits: { fileSize: 40 * 1024 * 1024, files: 20 } });
const fileUrl = (f) => '/uploads/' + path.relative(UPLOAD_DIR, f.path).split(path.sep).join('/');

function removeUpload(url) {
  if (typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const p = path.join(UPLOAD_DIR, url.slice('/uploads/'.length));
  if (!p.startsWith(UPLOAD_DIR)) return;
  fs.promises.unlink(p).catch(() => {});
}

// ---------- realtime (Server-Sent Events) ----------
const clients = new Set();
function broadcast(type, data) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}
setInterval(() => {
  for (const res of clients) res.write(': ping\n\n');
}, 25000).unref();

// ---------- data publik ----------
const publicGreeting = (g) => ({
  id: g.id,
  name: g.name,
  message: g.message,
  photo: g.photo,
  thumb: g.thumb || g.photo,
  sample: !!g.sample,
  likes: g.likes || 0,
  createdAt: g.createdAt,
});

function publicPayload() {
  const db = getDB();
  return {
    settings: db.settings,
    stories: db.stories.filter((s) => s.visible !== false).sort(sortByOrder),
    thanks: db.thanks.filter((t) => t.visible !== false).sort(sortByOrder),
    frames: db.frames.filter((f) => f.enabled !== false).sort(sortByOrder),
    greetingsCount: db.greetings.filter((g) => !g.hidden).length,
  };
}

app.get('/api/public', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(publicPayload());
});

app.get('/api/greetings', (req, res) => {
  const db = getDB();
  const q = clean(req.query.q, 100).toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 12, 50);
  const before = Number(req.query.before) || Infinity;
  let list = db.greetings.filter((g) => !g.hidden);
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q) || g.message.toLowerCase().includes(q));
  list.sort((a, b) => b.createdAt - a.createdAt);
  const total = list.length;
  const page = list.filter((g) => g.createdAt < before).slice(0, limit);
  const last = page[page.length - 1];
  res.set('Cache-Control', 'no-store');
  res.json({
    total,
    items: page.map(publicGreeting),
    next: page.length === limit && last ? last.createdAt : null,
  });
});

app.get('/api/stream', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write('retry: 4000\n\n');
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

// Simpan foto + ucapan dari photobooth (langsung tampil, tanpa konfirmasi)
app.post(
  '/api/greetings',
  rateLimit(15, 10 * 60 * 1000),
  uploadPublic.fields([{ name: 'photo', maxCount: 1 }, { name: 'thumb', maxCount: 1 }]),
  (req, res) => {
    const photo = req.files?.photo?.[0];
    const thumb = req.files?.thumb?.[0];
    const name = clean(req.body.name, 60);
    const message = clean(req.body.message, 600);
    if (!photo || !name || !message) {
      if (photo) removeUpload(fileUrl(photo));
      if (thumb) removeUpload(fileUrl(thumb));
      return res.status(400).json({ error: 'Foto, nama, dan ucapan wajib diisi.' });
    }
    const g = {
      id: uid(),
      name,
      message,
      photo: fileUrl(photo),
      thumb: thumb ? fileUrl(thumb) : fileUrl(photo),
      frame: clean(req.body.frame, 20),
      mode: clean(req.body.mode, 20),
      sample: false,
      hidden: false,
      likes: 0,
      createdAt: Date.now(),
    };
    getDB().greetings.push(g);
    save();
    broadcast('greeting', publicGreeting(g));
    res.json({ ok: true, greeting: publicGreeting(g) });
  }
);

app.post('/api/greetings/:id/like', rateLimit(60, 60 * 1000), (req, res) => {
  const g = getDB().greetings.find((x) => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Tidak ditemukan' });
  g.likes = (g.likes || 0) + (req.body?.undo ? -1 : 1);
  if (g.likes < 0) g.likes = 0;
  save();
  broadcast('like', { id: g.id, likes: g.likes });
  res.json({ likes: g.likes });
});

// ---------- admin ----------
app.post('/api/admin/login', rateLimit(10, 10 * 60 * 1000), (req, res) => {
  const pass = String(req.body?.password || '');
  const a = crypto.createHash('sha256').update(pass).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'Kata sandi salah.' });
  const token = sign({ role: 'admin', exp: Date.now() + 7 * 24 * 3600 * 1000 });
  res.setHeader('Set-Cookie', `grad_admin=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${req.secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});
app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'grad_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ ok: true });
});

const admin = express.Router();
admin.use(requireAdmin);

admin.get('/me', (req, res) => res.json({ ok: true, defaultPassword: !process.env.ADMIN_PASSWORD }));

admin.get('/stats', (req, res) => {
  const db = getDB();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const real = db.greetings.filter((g) => !g.sample);
  res.json({
    greetings: db.greetings.length,
    realGreetings: real.length,
    today: real.filter((g) => g.createdAt >= start.getTime()).length,
    hidden: db.greetings.filter((g) => g.hidden).length,
    samples: db.greetings.filter((g) => g.sample).length,
    likes: db.greetings.reduce((s, g) => s + (g.likes || 0), 0),
    stories: db.stories.length,
    thanks: db.thanks.length,
    live: clients.size,
    latest: [...db.greetings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
  });
});

// Pengaturan (teks, foto utama, musik, dll)
admin.get('/settings', (req, res) => res.json(getDB().settings));
admin.put('/settings', (req, res) => {
  const db = getDB();
  const incoming = req.body || {};
  for (const [k, v] of Object.entries(incoming)) {
    if (k in db.settings) db.settings[k] = typeof v === 'string' ? clean(v, 4000) : v;
  }
  save();
  broadcast('content', { at: Date.now() });
  res.json(db.settings);
});

// Upload file umum (gambar / musik)
admin.post('/upload', uploadAdmin.array('files', 20), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'File tidak valid (gunakan JPG/PNG/WEBP atau MP3/M4A/OGG/WAV).' });
  res.json({ urls: req.files.map(fileUrl) });
});

// CRUD generik untuk koleksi: stories, thanks, frames
function crud(collection, shape) {
  const r = express.Router();
  r.get('/', (req, res) => res.json([...getDB()[collection]].sort(sortByOrder)));
  r.post('/', (req, res) => {
    const list = getDB()[collection];
    const item = { id: uid(), ...shape(req.body || {}), order: Math.max(0, ...list.map((x) => x.order || 0)) + 1 };
    list.push(item);
    save();
    broadcast('content', { at: Date.now() });
    res.json(item);
  });
  r.put('/reorder', (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const list = getDB()[collection];
    ids.forEach((id, i) => {
      const it = list.find((x) => x.id === id);
      if (it) it.order = i + 1;
    });
    save();
    broadcast('content', { at: Date.now() });
    res.json([...list].sort(sortByOrder));
  });
  r.put('/:id', (req, res) => {
    const list = getDB()[collection];
    const it = list.find((x) => x.id === req.params.id);
    if (!it) return res.status(404).json({ error: 'Tidak ditemukan' });
    const before = JSON.stringify(it);
    Object.assign(it, shape({ ...it, ...req.body }));
    // hapus file lama yang tidak dipakai lagi
    const old = JSON.parse(before);
    for (const u of [].concat(old.images || [])) if (!(it.images || []).includes(u)) removeUpload(u);
    save();
    broadcast('content', { at: Date.now() });
    res.json(it);
  });
  r.delete('/:id', (req, res) => {
    const db = getDB();
    const idx = db[collection].findIndex((x) => x.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Tidak ditemukan' });
    const [gone] = db[collection].splice(idx, 1);
    for (const u of [].concat(gone.images || [])) removeUpload(u);
    save();
    broadcast('content', { at: Date.now() });
    res.json({ ok: true });
  });
  return r;
}

admin.use(
  '/stories',
  crud('stories', (b) => ({
    title: clean(b.title, 120),
    text: clean(b.text, 3000),
    date: clean(b.date, 60),
    images: (Array.isArray(b.images) ? b.images : []).map((u) => clean(u, 400)).filter(Boolean).slice(0, 20),
    visible: b.visible !== false,
  }))
);
admin.use(
  '/thanks',
  crud('thanks', (b) => ({
    title: clean(b.title, 120),
    text: clean(b.text, 2000),
    icon: clean(b.icon || 'heart', 30),
    visible: b.visible !== false,
  }))
);
admin.use(
  '/frames',
  crud('frames', (b) => ({
    label: clean(b.label, 40),
    enabled: b.enabled !== false,
  }))
);

// Live greetings (moderasi)
admin.get('/greetings', (req, res) => {
  const q = clean(req.query.q, 100).toLowerCase();
  let list = [...getDB().greetings].sort((a, b) => b.createdAt - a.createdAt);
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q) || g.message.toLowerCase().includes(q));
  res.json(list);
});
admin.post('/greetings', uploadAdmin.single('photo'), (req, res) => {
  const name = clean(req.body.name, 60);
  const message = clean(req.body.message, 600);
  const photo = req.file ? fileUrl(req.file) : clean(req.body.photoUrl, 400);
  if (!name || !message || !photo) return res.status(400).json({ error: 'Nama, ucapan, dan foto wajib diisi.' });
  const g = { id: uid(), name, message, photo, thumb: photo, sample: false, hidden: false, likes: 0, createdAt: Date.now() };
  getDB().greetings.push(g);
  save();
  broadcast('greeting', publicGreeting(g));
  res.json(g);
});
admin.put('/greetings/:id', uploadAdmin.single('photo'), (req, res) => {
  const g = getDB().greetings.find((x) => x.id === req.params.id);
  if (!g) return res.status(404).json({ error: 'Tidak ditemukan' });
  if (req.body.name !== undefined) g.name = clean(req.body.name, 60) || g.name;
  if (req.body.message !== undefined) g.message = clean(req.body.message, 600) || g.message;
  if (req.body.hidden !== undefined) g.hidden = req.body.hidden === true || req.body.hidden === 'true';
  if (req.body.likes !== undefined) g.likes = Math.max(0, Number(req.body.likes) || 0);
  if (req.file) {
    removeUpload(g.photo);
    if (g.thumb !== g.photo) removeUpload(g.thumb);
    g.photo = g.thumb = fileUrl(req.file);
  }
  save();
  broadcast('greeting-update', { ...publicGreeting(g), hidden: g.hidden });
  res.json(g);
});
admin.delete('/greetings/:id', (req, res) => {
  const db = getDB();
  const idx = db.greetings.findIndex((x) => x.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Tidak ditemukan' });
  const [g] = db.greetings.splice(idx, 1);
  removeUpload(g.photo);
  if (g.thumb !== g.photo) removeUpload(g.thumb);
  save();
  broadcast('greeting-remove', { id: g.id });
  res.json({ ok: true });
});
admin.post('/greetings/delete-samples', (req, res) => {
  const db = getDB();
  const gone = db.greetings.filter((g) => g.sample);
  db.greetings = db.greetings.filter((g) => !g.sample);
  save();
  gone.forEach((g) => broadcast('greeting-remove', { id: g.id }));
  res.json({ removed: gone.length });
});

// Cadangan data
admin.get('/backup', (req, res) => {
  saveNow();
  res.setHeader('Content-Disposition', `attachment; filename="backup-wisuda-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(getDB());
});
admin.post('/restore', (req, res) => {
  const d = req.body;
  if (!d || typeof d !== 'object' || !d.settings || !Array.isArray(d.greetings)) return res.status(400).json({ error: 'File cadangan tidak valid.' });
  replaceDB(d);
  broadcast('content', { at: Date.now() });
  res.json({ ok: true });
});

app.use('/api/admin', admin);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- file statis ----------
const vendor = (p) => path.join(ROOT, 'node_modules', p);
const longCache = { maxAge: '30d', immutable: false };
app.use('/vendor/three', express.static(vendor('three/build'), longCache));
app.use('/vendor/gsap', express.static(vendor('gsap/dist'), longCache));
app.use('/vendor/alpine', express.static(vendor('alpinejs/dist'), longCache));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }));

app.get(['/admin', '/admin/'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin', 'index.html')));

// index.html dengan meta judul & gambar untuk preview saat dibagikan (WhatsApp, dll)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function sendIndex(req, res) {
  const s = getDB().settings;
  const html = fs
    .readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8')
    .replaceAll('{{TITLE}}', esc(s.siteTitle || 'Happy Graduation'))
    .replaceAll('{{DESC}}', esc(s.coverTagline || ''))
    .replaceAll('{{OG_IMAGE}}', esc(`${req.protocol}://${req.get('host')}${s.photoMain}`));
  res.set('Cache-Control', 'no-cache').type('html').send(html);
}
app.get('/', sendIndex);
app.get('/index.html', sendIndex);
app.use(express.static(PUBLIC_DIR, { maxAge: '1h', index: false }));
app.use((req, res) => sendIndex(req, res));

app.use((err, req, res, next) => {
  console.error(err);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file terlalu besar.' : 'Terjadi kesalahan pada server.';
  res.status(err.status || 500).json({ error: msg });
});

const server = app.listen(PORT, () => {
  console.log(`\n🎓  Website wisuda berjalan di  http://localhost:${PORT}`);
  console.log(`🛠   Panel admin               http://localhost:${PORT}/admin`);
  if (!process.env.ADMIN_PASSWORD) console.log(`🔑  Password admin default: ${ADMIN_PASSWORD}  (ubah lewat env ADMIN_PASSWORD)\n`);
});
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    saveNow();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500).unref();
  });
}
