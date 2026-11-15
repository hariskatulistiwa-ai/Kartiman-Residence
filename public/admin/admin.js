// Panel admin (Alpine.js): CRUD cerita, terima kasih, bingkai, live greetings, pengaturan.
import { icons, thanksIcons } from '/js/icons.js';
import { renderFrame } from '/js/frames.js';

const api = async (url, opts = {}) => {
  const o = { credentials: 'same-origin', ...opts };
  if (o.body && !(o.body instanceof FormData) && typeof o.body !== 'string') {
    o.body = JSON.stringify(o.body);
    o.headers = { 'Content-Type': 'application/json', ...(o.headers || {}) };
  }
  const res = await fetch(url, o);
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Gagal (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
};

// Perkecil gambar sebelum diunggah (hemat kuota & cepat). Tetap mempertahankan transparansi.
async function shrinkImage(file, max = 1800) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    if (s === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * s);
    cv.height = Math.round(img.naturalHeight * s);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
    const blob = await new Promise((r) => cv.toBlob(r, type, 0.9));
    if (!blob) return file;
    const ext = blob.type === 'image/jpeg' ? '.jpg' : blob.type === 'image/webp' ? '.webp' : '.png';
    return new File([blob], file.name.replace(/\.\w+$/, '') + ext, { type: blob.type });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function upload(files) {
  const fd = new FormData();
  for (const f of files) fd.append('files', f.type.startsWith('image/') ? await shrinkImage(f) : f);
  return (await api('/api/admin/upload', { method: 'POST', body: fd })).urls;
}

const ADMIN_ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
};

window.adminApp = () => ({
  ready: false,
  authed: false,
  defaultPassword: false,
  password: '',
  loginError: '',
  busy: false,
  uploading: false,
  tab: location.hash.slice(1) || 'dashboard',
  tabs: [
    { id: 'dashboard', label: 'Dashboard', icon: ADMIN_ICONS.dashboard },
    { id: 'greetings', label: 'Live Greetings', icon: icons.live },
    { id: 'stories', label: 'Cerita', icon: icons.book },
    { id: 'thanks', label: 'Terima Kasih', icon: icons.heart },
    { id: 'frames', label: 'Bingkai', icon: icons.image },
    { id: 'settings', label: 'Konten & Musik', icon: icons.sparkle },
    { id: 'backup', label: 'Cadangan', icon: icons.download },
  ],
  stats: {},
  settings: {},
  stories: [],
  thanks: [],
  frames: [],
  greetings: [],
  gq: '',
  gfilter: 'all',
  modal: null,
  form: {},
  toasts: [],
  framePreviewMode: 'single',
  thanksIconList: Object.entries(thanksIcons).map(([key, label]) => ({ key, label })),
  siteUrl: location.origin,
  settingGroups: [
    { title: 'Identitas wisudawan', fields: [['fullName', 'Nama lengkap'], ['degree', 'Gelar (mis. S.Pd.)'], ['nickname', 'Nama panggilan'], ['university', 'Nama universitas'], ['siteTitle', 'Judul situs (tab & saat dibagikan)']] },
    { title: '1 • Cover', fields: [['coverTitleTop', 'Judul baris 1'], ['coverTitleBottom', 'Judul baris 2'], ['coverTagline', 'Tagline'], ['coverButton', 'Teks tombol'], ['coverHint', 'Teks petunjuk di bawah tombol']] },
    { title: '2 • Cerita perjalanan', fields: [['storyTitle', 'Judul'], ['storySubtitle', 'Subjudul'], ['storyNote', 'Catatan kecil di bawah (kosongkan untuk menyembunyikan)']] },
    { title: '3 • Terima kasih', fields: [['thanksTitle', 'Judul (Enter = baris baru)', 'area'], ['thanksQuote', 'Kutipan', 'area']] },
    {
      title: '4–5 • Photobooth',
      fields: [
        ['boothTitle', 'Judul halaman kamera'], ['boothSubtitle', 'Subjudul'], ['frameTitle', 'Judul pilih bingkai'], ['wishTitle', 'Judul halaman ucapan'],
        ['wishText', 'Teks ajakan', 'area'], ['inviteText', 'Teks undangan (header gaya Undangan, **tebal**)', 'area'],
        ['wishNamePlaceholder', 'Contoh isian nama'], ['wishMessagePlaceholder', 'Contoh isian ucapan'], ['toastSaved', 'Notifikasi setelah Simpan (3 detik)', 'area'],
      ],
    },
    { title: '6 • Live Greetings', fields: [['liveTitle', 'Judul'], ['liveSubtitle', 'Subjudul']] },
    { title: '7 • Penutup', fields: [['closingTitle', 'Judul'], ['closingSubtitle', 'Subjudul'], ['closingText', 'Teks', 'area'], ['closingQuote', 'Kutipan', 'area']] },
  ],

  async init() {
    try {
      const me = await api('/api/admin/me');
      this.authed = true;
      this.defaultPassword = me.defaultPassword;
      await this.loadAll();
    } catch {
      this.authed = false;
    }
    this.ready = true;
    addEventListener('hashchange', () => (this.tab = location.hash.slice(1) || 'dashboard'));
  },
  async login() {
    this.busy = true;
    this.loginError = '';
    try {
      await api('/api/admin/login', { method: 'POST', body: { password: this.password } });
      this.password = '';
      await this.init();
    } catch (e) {
      this.loginError = e.message;
    } finally {
      this.busy = false;
    }
  },
  async logout() {
    await api('/api/admin/logout', { method: 'POST' });
    this.authed = false;
  },
  setTab(t) {
    this.tab = t;
    location.hash = t;
    scrollTo(0, 0);
    if (t === 'frames') this.$nextTick(() => this.drawFrames());
    if (t === 'greetings') this.loadGreetings();
    if (t === 'dashboard') this.loadStats();
  },
  async loadAll() {
    const [settings, stories, thanks, frames] = await Promise.all([
      api('/api/admin/settings'), api('/api/admin/stories'), api('/api/admin/thanks'), api('/api/admin/frames'),
    ]);
    Object.assign(this, { settings, stories, thanks, frames });
    await Promise.all([this.loadStats(), this.loadGreetings()]);
    if (this.tab === 'frames') this.$nextTick(() => this.drawFrames());
  },
  async loadStats() {
    this.stats = await api('/api/admin/stats');
  },
  async loadGreetings() {
    this.greetings = await api('/api/admin/greetings?q=' + encodeURIComponent(this.gq));
  },
  get filteredGreetings() {
    return this.greetings.filter((g) =>
      this.gfilter === 'visible' ? !g.hidden : this.gfilter === 'hidden' ? g.hidden : this.gfilter === 'sample' ? g.sample : true
    );
  },

  // ---------- util ----------
  icon(k) {
    return icons[k] || icons.heart;
  },
  img(u) {
    return u === '@graduate' ? this.settings.photoMain : u;
  },
  fmtDate(t) {
    return new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  toast(msg, type = 'ok') {
    const id = Math.random();
    this.toasts.push({ id, msg, type });
    setTimeout(() => (this.toasts = this.toasts.filter((t) => t.id !== id)), 2800);
  },
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast('Tautan disalin');
    } catch {
      this.toast('Salin manual dari kotak teks', 'err');
    }
  },
  async run(fn, okMsg) {
    this.busy = true;
    try {
      const r = await fn();
      if (okMsg) this.toast(okMsg);
      return r;
    } catch (e) {
      if (e.status === 401) this.authed = false;
      this.toast(e.message, 'err');
    } finally {
      this.busy = false;
    }
  },

  // ---------- pengaturan ----------
  async saveSettings() {
    await this.run(async () => {
      this.settings = await api('/api/admin/settings', { method: 'PUT', body: this.settings });
    }, 'Perubahan disimpan ✓');
  },
  async uploadSetting(key, ev) {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file) return;
    this.toast('Mengunggah…');
    await this.run(async () => {
      const [url] = await upload([file]);
      this.settings[key] = url;
      this.settings = await api('/api/admin/settings', { method: 'PUT', body: { [key]: url } });
    }, 'Berhasil diganti ✓');
  },

  // ---------- urutan ----------
  async move(coll, i, d, persist = true) {
    const list = this[coll];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    if (persist) await this.run(() => api(`/api/admin/${coll}/reorder`, { method: 'PUT', body: { ids: list.map((x) => x.id) } }));
  },
  async removeItem(coll, item) {
    if (!confirm(`Hapus "${item.title}"?`)) return;
    await this.run(async () => {
      await api(`/api/admin/${coll}/${item.id}`, { method: 'DELETE' });
      this[coll] = this[coll].filter((x) => x.id !== item.id);
    }, 'Dihapus');
  },

  // ---------- cerita ----------
  openStory(s) {
    this.form = s ? JSON.parse(JSON.stringify(s)) : { title: '', text: '', date: '', images: [], visible: true };
    this.modal = 'story';
  },
  movePic(i, d) {
    const a = this.form.images;
    const j = i + d;
    [a[i], a[j]] = [a[j], a[i]];
  },
  async uploadStoryPics(ev) {
    const files = [...ev.target.files];
    ev.target.value = '';
    if (!files.length) return;
    this.uploading = true;
    try {
      const urls = await upload(files);
      this.form.images.push(...urls);
    } catch (e) {
      this.toast(e.message, 'err');
    } finally {
      this.uploading = false;
    }
  },
  async saveStory() {
    await this.run(async () => {
      const f = this.form;
      const saved = f.id ? await api(`/api/admin/stories/${f.id}`, { method: 'PUT', body: f }) : await api('/api/admin/stories', { method: 'POST', body: f });
      const i = this.stories.findIndex((x) => x.id === saved.id);
      i >= 0 ? (this.stories[i] = saved) : this.stories.push(saved);
      this.modal = null;
    }, 'Cerita disimpan ✓');
  },

  // ---------- terima kasih ----------
  openThanks(t) {
    this.form = t ? { ...t } : { title: '', text: '', icon: 'heart', visible: true };
    this.modal = 'thanks';
  },
  async saveThanks() {
    await this.run(async () => {
      const f = this.form;
      const saved = f.id ? await api(`/api/admin/thanks/${f.id}`, { method: 'PUT', body: f }) : await api('/api/admin/thanks', { method: 'POST', body: f });
      const i = this.thanks.findIndex((x) => x.id === saved.id);
      i >= 0 ? (this.thanks[i] = saved) : this.thanks.push(saved);
      this.modal = null;
    }, 'Tersimpan ✓');
  },

  // ---------- bingkai ----------
  async drawFrames() {
    await document.fonts?.ready;
    for (const f of this.frames) {
      const cv = document.querySelector(`canvas[data-frame="${f.id}"]`);
      if (cv) await renderFrame(cv, { frame: f.id, mode: this.framePreviewMode, shots: [], caption: this.settings.frameCaption, scale: 0.32 });
    }
  },
  async saveFrames() {
    await this.run(async () => {
      for (const f of this.frames) await api(`/api/admin/frames/${f.id}`, { method: 'PUT', body: f });
      await api('/api/admin/frames/reorder', { method: 'PUT', body: { ids: this.frames.map((f) => f.id) } });
      await api('/api/admin/settings', { method: 'PUT', body: { frameCaption: this.settings.frameCaption, boothHeaderStyle: this.settings.boothHeaderStyle } });
    }, 'Bingkai disimpan ✓');
  },

  // ---------- greetings ----------
  openGreeting(g) {
    this.form = g ? { ...g, file: null, preview: null } : { name: '', message: '', file: null, preview: null, photo: '' };
    this.modal = 'greeting';
  },
  async pickGreetingPhoto(ev) {
    const f = ev.target.files[0];
    if (!f) return;
    this.form.file = await shrinkImage(f, 1600);
    this.form.preview = URL.createObjectURL(this.form.file);
  },
  async saveGreeting() {
    const f = this.form;
    if (!f.id && !f.file) return this.toast('Pilih foto terlebih dahulu', 'err');
    await this.run(async () => {
      const fd = new FormData();
      fd.append('name', f.name);
      fd.append('message', f.message);
      if (f.id) fd.append('hidden', !!f.hidden);
      if (f.file) fd.append('photo', f.file);
      await api(f.id ? `/api/admin/greetings/${f.id}` : '/api/admin/greetings', { method: f.id ? 'PUT' : 'POST', body: fd });
      this.modal = null;
      await this.loadGreetings();
      this.loadStats();
    }, 'Ucapan disimpan ✓');
  },
  async toggleHidden(g) {
    await this.run(async () => {
      const fd = new FormData();
      fd.append('hidden', !g.hidden);
      const r = await api(`/api/admin/greetings/${g.id}`, { method: 'PUT', body: fd });
      g.hidden = r.hidden;
    }, g.hidden ? 'Ditampilkan kembali' : 'Disembunyikan');
  },
  async removeGreeting(g) {
    if (!confirm(`Hapus ucapan dari "${g.name}"? Foto juga akan dihapus.`)) return;
    await this.run(async () => {
      await api(`/api/admin/greetings/${g.id}`, { method: 'DELETE' });
      this.greetings = this.greetings.filter((x) => x.id !== g.id);
      this.loadStats();
    }, 'Ucapan dihapus');
  },
  async deleteSamples() {
    if (!confirm('Hapus semua ucapan contoh?')) return;
    await this.run(async () => {
      const r = await api('/api/admin/greetings/delete-samples', { method: 'POST' });
      await Promise.all([this.loadGreetings(), this.loadStats()]);
      return r;
    }, 'Ucapan contoh dihapus');
  },

  // ---------- cadangan ----------
  async restore(ev) {
    const file = ev.target.files[0];
    ev.target.value = '';
    if (!file || !confirm('Ganti semua data dengan isi file cadangan ini?')) return;
    await this.run(async () => {
      const data = JSON.parse(await file.text());
      await api('/api/admin/restore', { method: 'POST', body: data });
      await this.loadAll();
    }, 'Data dipulihkan ✓');
  },
});
