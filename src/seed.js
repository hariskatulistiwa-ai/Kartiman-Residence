// Data awal (bisa diubah semuanya dari Panel Admin).
const now = Date.now();
const min = 60 * 1000;

export function seed() {
  return {
    settings: {
      // Identitas
      fullName: 'Aufa Rahma Hilya',
      degree: 'S.Pd.',
      nickname: 'Aufa',
      university: 'Universitas Islam Negeri Sumatera Utara',
      siteTitle: 'Happy Graduation • Aufa Rahma Hilya, S.Pd.',
      photoMain: '/assets/graduate.webp',
      logoMark: '/assets/logo-mark.webp',
      music: '/assets/music/piano-kenangan.mp3',
      musicTitle: 'Piano • Kenangan',
      pianoImage: '',

      // Cover
      coverTitleTop: 'Happy',
      coverTitleBottom: 'Graduation',
      coverTagline: 'Sebuah perjalanan, sejuta kenangan.',
      coverButton: 'Buka Graduation',
      coverHint: 'Ketuk untuk membuka & memulai musik',

      // Cerita
      storyTitle: 'Jejak langkahku',
      storySubtitle: 'Setiap langkah menyimpan cerita.',
      storyNote: 'Ilustrasi • foto perjalanan dapat diganti',

      // Terima kasih
      thanksTitle: 'Untuk kalian,\nsepenuh hati.',
      thanksQuote: 'Aku yakin ini bukan akhir perjalanan, tetapi awal langkah baru.',

      // Photobooth
      boothTitle: 'Virtual Photobooth',
      boothSubtitle: 'Kenangan untuk Aufa',
      frameTitle: 'Bingkai kenanganmu',
      frameCaption: 'Happy Graduation • Aufa',
      boothHeaderStyle: 'graduation', // graduation | undangan
      inviteText:
        'Dengan penuh rasa syukur, saya mengundang Bapak/Ibu/Saudara/i untuk berbagi kebahagiaan dalam momen wisuda saya di **Universitas Islam Negeri Sumatera Utara.**',
      wishTitle: 'Satu foto, sejuta doa',
      wishText:
        'Abadikan momen dukunganmu untuk Aufa. Unggah foto, tulis ucapan terbaik, lalu simpan ke Live Greetings untuk merayakan wisudanya bersama.',
      wishNamePlaceholder: 'Sahabat Aufa',
      wishMessagePlaceholder: 'Selamat wisuda, Aufa! Semoga ilmu dan langkah barumu membawa banyak kebaikan.',
      toastSaved: 'Foto dan ucapan anda sudah masuk di galery live greetings',

      // Live greetings
      liveTitle: 'Live Greetings',
      liveSubtitle: 'Cinta dan doa yang terus berdatangan',

      // Penutup
      closingTitle: 'Terima kasih',
      closingSubtitle: 'atas cinta & kehangatan kalian semua.',
      closingText:
        'Setiap doa, senyum, dan kehadiran kalian akan selalu menjadi bagian terindah dari perjalanan ini.',
      closingQuote: 'Bukan akhir cerita. Ini awal langkah baru.',
    },

    stories: [
      {
        id: 's1',
        title: 'Awal Perkuliahan',
        text: 'Langkah pertama memasuki dunia perkuliahan, penuh rasa ingin tahu, harapan, dan semangat baru.',
        date: '',
        images: ['/assets/story/campus.webp'],
        visible: true,
        order: 1,
      },
      {
        id: 's2',
        title: 'Sempro',
        text: 'Pintu awal menuju penelitian skripsi. Belajar merumuskan ide, memperkuat argumen, dan menerima banyak masukan berharga.',
        date: '',
        images: ['/assets/story/books.webp'],
        visible: true,
        order: 2,
      },
      {
        id: 's3',
        title: 'KKN',
        text: 'Turun langsung ke tengah masyarakat. Belajar mengabdi, beradaptasi, dan memaknai ilmu dengan lebih nyata.',
        date: '',
        images: ['/assets/story/kkn.webp'],
        visible: true,
        order: 3,
      },
      {
        id: 's4',
        title: 'Sidang',
        text: 'Ujian yang menguji bukan hanya isi skripsi, tapi juga ketekunan, kesabaran, dan keyakinan pada proses yang telah dijalani.',
        date: '',
        images: ['/assets/story/skripsi.webp'],
        visible: true,
        order: 4,
      },
      {
        id: 's5',
        title: 'Wisuda',
        text: 'Puncak dari perjalanan panjang ini. Rasa syukur atas setiap proses, dukungan, dan doa yang selalu mengiringi langkahku.',
        date: '',
        images: ['@graduate'],
        visible: true,
        order: 5,
      },
    ],

    thanks: [
      {
        id: 't1',
        title: 'Ayah & Mama',
        text: 'Terima kasih untuk doa yang tak pernah putus, pelukan yang menguatkan, dan cinta yang selalu menjadi rumah.',
        icon: 'parents',
        visible: true,
        order: 1,
      },
      {
        id: 't2',
        title: 'Keluarga Besar',
        text: 'Terima kasih telah percaya dan mengiringi setiap langkahku.',
        icon: 'family',
        visible: true,
        order: 2,
      },
      {
        id: 't3',
        title: 'Teman-teman',
        text: 'Kalian membuat perjuangan ini penuh tawa dan kenangan.',
        icon: 'friends',
        visible: true,
        order: 3,
      },
      {
        id: 't4',
        title: 'Dosen & Pembimbing',
        text: 'Terima kasih atas ilmu, kesabaran, dan bimbingan yang membentukku.',
        icon: 'lecturer',
        visible: true,
        order: 4,
      },
      {
        id: 't5',
        title: 'Semua yang Hadir',
        text: 'Setiap bantuan dan doa kalian berarti begitu besar.',
        icon: 'all',
        visible: true,
        order: 5,
      },
    ],

    frames: [
      { id: 'emerald', label: 'Emerald', enabled: true, order: 1 },
      { id: 'golden', label: 'Golden', enabled: true, order: 2 },
      { id: 'floral', label: 'Floral', enabled: true, order: 3 },
      { id: 'minimal', label: 'Minimal', enabled: true, order: 4 },
    ],

    greetings: [
      {
        id: 'g6',
        name: 'Keluarga',
        message: 'Selamat wisuda, Aufa! Kami sangat bangga dengan pencapaianmu. Teruslah menjadi pribadi yang bermanfaat dan menginspirasi.',
        photo: '/assets/sample/face6.webp',
        thumb: '/assets/sample/face6.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 6 * min,
      },
      {
        id: 'g5',
        name: 'Teman Kampus',
        message: 'Congrats, Aufa! Kerja kerasmu luar biasa. Semoga ini jadi awal dari cita-cita besar berikutnya. Semangat terus!',
        photo: '/assets/sample/face5.webp',
        thumb: '/assets/sample/face5.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 12 * min,
      },
      {
        id: 'g4',
        name: 'Sahabat Aufa',
        message: 'Akhirnya wisuda juga! Selamat, Aufa! Semoga selalu diberi kesehatan, kelancaran, dan sukses di masa depan.',
        photo: '/assets/sample/face4.webp',
        thumb: '/assets/sample/face4.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 18 * min,
      },
      {
        id: 'g3',
        name: 'Keluarga',
        message: 'Alhamdulillah, selamat wisuda, Aufa sayang! Semoga ilmu yang diperoleh membawa manfaat, berkah, dan kemudahan dalam setiap langkahmu.',
        photo: '/assets/sample/face3.webp',
        thumb: '/assets/sample/face3.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 24 * min,
      },
      {
        id: 'g2',
        name: 'Teman Kampus',
        message: 'Selamat atas gelar S.Pd.-nya, Aufa! Perjuangan panjangmu akhirnya terbayar. Sukses untuk langkah selanjutnya!',
        photo: '/assets/sample/face2.webp',
        thumb: '/assets/sample/face2.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 30 * min,
      },
      {
        id: 'g1',
        name: 'Sahabat Aufa',
        message: 'Selamat wisuda, Aufa! Bangga banget lihat perjalanan dan pencapaianmu. Semoga ilmunya berkah dan sukses selalu!',
        photo: '/assets/sample/face1.webp',
        thumb: '/assets/sample/face1.webp',
        sample: true,
        hidden: false,
        likes: 0,
        createdAt: now - 36 * min,
      },
    ],
  };
}
