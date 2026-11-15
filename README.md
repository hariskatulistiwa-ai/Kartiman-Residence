# 🎓 Graduation Digital — Aufa Rahma Hilya, S.Pd.

Website wisuda digital (khusus tampilan HP) dengan efek 3D & partikel, musik piano otomatis,
virtual photobooth, live greetings realtime, dan **panel admin** untuk mengatur semua isinya.

Dibangun dengan **Node.js + Express** (server & API), **GSAP** (animasi teks/scroll),
**Three.js** (partikel emas, kelopak lili 3D, toga 3D yang dilempar), dan **Alpine.js** (panel admin).
Tanpa WordPress, tanpa database server — semua data tersimpan di satu file `data/db.json`.

## Alur halaman

| # | Halaman | Isi |
|---|---------|-----|
| 1 | **Cover** (`/`) | Logo UIN, lengkung tirai beludru + pilar, foto wisudawan, "Happy Graduation". Tombol **Buka Graduation** → musik mulai, toga 3D dilempar, konfeti, tirai membuka. |
| 2 | **Cerita** (`#/cerita`) | "Jejak langkahku": timeline Awal Kuliah → Sempro → KKN → Sidang → Wisuda. Foto polaroid berputar 3D, garis emas tergambar saat di-scroll, galeri lightbox (geser kiri/kanan). |
| 3 | **Terima Kasih** (`#/terima-kasih`) | "Untuk kalian, sepenuh hati": Ayah & Mama, Keluarga Besar, Teman, Dosen, Semua yang hadir. |
| 4 | **Photobooth** (`#/photobooth`) | Kamera langsung aktif dalam bingkai emas. Pilih **Single** atau **Kolase 4 foto** → jepret (hitung mundur) → pilih 1 dari 4 bingkai (Emerald, Golden, Floral, Minimal). |
| 5 | **Ucapan** | Tulis nama & ucapan → **Unduh**, **Bagikan**, **Simpan ke Live Greetings** (langsung tampil tanpa konfirmasi, notifikasi kecil hilang dalam 3 detik). |
| 6 | **Live** (`#/live`) | Semua foto & ucapan, berapa pun jumlahnya (scroll tanpa batas), pencarian, tombol suka ❤, dan ucapan baru muncul **realtime** di semua HP. |
| 7 | **Penutup** (`#/penutup`) | "Terima kasih atas cinta & kehangatan kalian semua" + foto wisudawan. |

Musik piano (komposisi orisinal, bebas hak cipta) berputar terus tanpa tombol mute; yang tampil hanya
indikator piano berputar dengan not balok melayang. Catatan: semua browser HP mewajibkan **satu sentuhan**
sebelum suara boleh berbunyi — karena itu musik mulai saat tombol *Buka Graduation* (atau layar) disentuh.

## Menjalankan

Butuh **Node.js 18+**.

```bash
npm install
npm start
```

- Website: <http://localhost:3000>
- Panel admin: <http://localhost:3000/admin> — kata sandi bawaan **`wisuda2026`**

Ganti kata sandi admin (wajib sebelum dibagikan):

```bash
ADMIN_PASSWORD="sandi-rahasia-anda" npm start
```

> Kamera di photobooth hanya bisa dipakai lewat **HTTPS** (atau `localhost`). Saat online, pastikan domain memakai HTTPS.

## Panel admin (CRUD)

- **Dashboard** — jumlah ucapan, ucapan hari ini, total suka, pengunjung live, tautan untuk dibagikan.
- **Live Greetings** — lihat, cari, edit, sembunyikan/tampilkan, unduh, hapus, tambah manual, hapus semua contoh.
- **Cerita** — tambah/edit/hapus/urutkan cerita; tiap cerita bisa punya banyak foto (galeri).
- **Terima Kasih** — tambah/edit/hapus/urutkan kartu, pilih ikon.
- **Bingkai** — nama, aktif/nonaktif, urutan, tulisan di bingkai, gaya header (Happy Graduation / Undangan Digital).
- **Konten & Musik** — semua teks di setiap halaman, foto wisudawan, logo, foto piano, upload musik.
- **Cadangan** — unduh / pulihkan seluruh data (.json).

Data awal berisi 6 *ucapan contoh* (foto dari desain). Hapus lewat **Live Greetings → Hapus contoh** sebelum acara.

## Online-kan (deploy)

Aplikasi ini butuh server Node.js yang **menyimpan file** (folder `data/` berisi database & foto unggahan),
jadi pilih hosting yang punya penyimpanan permanen:

- **VPS** (mis. Niagahoster/IDCloudHost/DigitalOcean): `npm install && ADMIN_PASSWORD=... npx pm2 start server.js --name wisuda`, lalu pasang Nginx + HTTPS (Certbot).
- **Railway / Render / Fly.io**: deploy dari repo ini, tambahkan *volume/disk* yang di-mount ke `/app/data` (atau set `DATA_DIR` ke path disk), dan isi variabel `ADMIN_PASSWORD`.
- **Docker**: `docker build -t wisuda . && docker run -p 3000:3000 -e ADMIN_PASSWORD=... -v wisuda-data:/app/data wisuda`

Variabel lingkungan: `PORT` (bawaan 3000), `ADMIN_PASSWORD`, `DATA_DIR` (bawaan `./data`), `UPLOAD_DIR` (bawaan `DATA_DIR/uploads`).

> Hosting statis/serverless (Vercel, Netlify, GitHub Pages) **tidak cocok** karena foto & ucapan perlu disimpan di server.

## Struktur

```
server.js            API, upload, realtime (Server-Sent Events), auth admin
src/store.js         penyimpanan JSON atomik (data/db.json)
src/seed.js          isi awal (teks, cerita, terima kasih, contoh ucapan)
public/index.html    kerangka situs
public/css/app.css   tema krem • emerald • emas
public/js/main.js    router, halaman, animasi, musik, live greetings
public/js/booth.js   virtual photobooth
public/js/frames.js  4 bingkai foto (canvas) — dipakai situs & admin
public/js/fx.js      efek 3D & partikel (Three.js)
public/admin/        panel admin (Alpine.js)
public/assets/       logo, foto wisudawan, ornamen lili, foto cerita, musik
```
