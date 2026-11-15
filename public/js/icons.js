// Ikon garis (SVG) yang dipakai di seluruh situs.
const s = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;

export const icons = {
  book: s('<path d="M12 6.5C10 5 7 4.6 3.5 5v13c3.5-.4 6.5 0 8.5 1.5 2-1.5 5-1.9 8.5-1.5V5C17 4.6 14 5 12 6.5Z"/><path d="M12 6.5v13"/>'),
  heart: s('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/>'),
  heartFill: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20Z"/></svg>`,
  camera: s('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="12.8" r="3.4"/><circle cx="17" cy="9.6" r=".3" fill="currentColor"/>'),
  live: s('<circle cx="12" cy="12" r="2.1" fill="currentColor"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.3 5.3a9.5 9.5 0 0 0 0 13.4M18.7 5.3a9.5 9.5 0 0 1 0 13.4"/>'),
  search: s('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  plus: s('<path d="M12 5v14M5 12h14"/>'),
  download: s('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  share: s('<circle cx="17.5" cy="6" r="2.3"/><circle cx="6.5" cy="12" r="2.3"/><circle cx="17.5" cy="18" r="2.3"/><path d="m8.6 10.9 6.8-3.8M8.6 13.1l6.8 3.8"/>'),
  image: s('<rect x="3.5" y="5" width="17" height="14" rx="1.6"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5L20 17"/>'),
  refresh: s('<path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M17.8 3.8v3.4h-3.4M6.2 20.2v-3.4h3.4"/>'),
  restart: s('<path d="M5 12a7 7 0 1 0 2.1-5"/><path d="M5 4.5V9h4.5"/>'),
  arrowRight: s('<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>'),
  chevronRight: s('<path d="m9.5 6 6 6-6 6"/>'),
  chevronLeft: s('<path d="m14.5 6-6 6 6 6"/>'),
  check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  flip: s('<path d="M4.5 9.5A8 8 0 0 1 18.8 7.5M19.5 14.5a8 8 0 0 1-14.3 2"/><path d="M19.3 3.8v3.9h-3.9M4.7 20.2v-3.9h3.9"/><circle cx="12" cy="12" r="2.6"/>'),
  single: s('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="12.8" r="3.4"/>'),
  grid: s('<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>'),
  upload: s('<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 19.5h14"/>'),
  people: s('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.5 14.2c2.6-.3 4.5 1.3 5 4.3"/>'),
  cap: s('<path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5-9.5-4.5Z"/><path d="M6.5 11.5v4c1.5 1.6 3.4 2.4 5.5 2.4s4-.8 5.5-2.4v-4"/><path d="M21.5 9.5v5"/>'),
  sparkle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c.6 4.6 2.4 7 7 7.9-4.6.9-6.4 3.3-7 8.1-.6-4.8-2.4-7.2-7-8.1C9.6 9 11.4 6.6 12 2Z"/></svg>`,
  // ikon kartu terima kasih
  parents: s('<circle cx="8" cy="6.8" r="2.4"/><circle cx="16" cy="6.8" r="2.4"/><path d="M3.8 17.5c0-3.4 1.8-6 4.2-6 1.2 0 2.2.6 3 1.6M20.2 17.5c0-3.4-1.8-6-4.2-6-1.2 0-2.2.6-3 1.6"/><path d="M12 20.2s-3-1.8-3-4a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2.2-3 4-3 4Z"/>'),
  family: s('<circle cx="12" cy="6.5" r="2.4"/><circle cx="5.8" cy="8.6" r="2"/><circle cx="18.2" cy="8.6" r="2"/><path d="M7.8 18c0-3.3 1.8-5.6 4.2-5.6s4.2 2.3 4.2 5.6M2.6 17c.2-2.6 1.4-4.3 3.2-4.3M21.4 17c-.2-2.6-1.4-4.3-3.2-4.3"/>'),
  friends: s('<circle cx="8.2" cy="9" r="2.4"/><circle cx="15.8" cy="9" r="2.4"/><path d="M3.6 19c.4-3.4 2.2-5.4 4.6-5.4 1.4 0 2.6.7 3.4 2M20.4 19c-.4-3.4-2.2-5.4-4.6-5.4-1.4 0-2.6.7-3.4 2"/><path d="M12 3v1.6M8.6 3.8l.8 1.2M15.4 3.8l-.8 1.2"/>'),
  lecturer: s('<path d="m2.5 10 9.5-4.6 9.5 4.6-9.5 4.6L2.5 10Z"/><path d="M6.5 12v4.2c1.5 1.5 3.4 2.3 5.5 2.3s4-.8 5.5-2.3V12"/><path d="M21.5 10v5"/>'),
  all: s('<circle cx="12" cy="10.5" r="2.2"/><circle cx="6.2" cy="11.8" r="1.9"/><circle cx="17.8" cy="11.8" r="1.9"/><path d="M8.3 19.5c.4-2.6 1.8-4.3 3.7-4.3s3.3 1.7 3.7 4.3M3 19.2c.3-2 1.4-3.3 3.2-3.3M21 19.2c-.3-2-1.4-3.3-3.2-3.3"/><path d="M12 6.4s-1.9-1.1-1.9-2.5a1 1 0 0 1 1.9-.5 1 1 0 0 1 1.9.5c0 1.4-1.9 2.5-1.9 2.5Z"/>'),
  star: s('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z"/>'),
  mosque: s('<path d="M12 3.5c2.6 1.8 4.5 3.6 4.5 6.2H7.5c0-2.6 1.9-4.4 4.5-6.2Z"/><path d="M5 20.5V12h14v8.5M3.5 20.5h17M10 20.5v-4a2 2 0 0 1 4 0v4M12 1.8v1.7"/>'),
  book2: s('<path d="M5 4.5h10.5a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3v-12Z"/><path d="M5 16.5a3 3 0 0 1 3-3h10.5"/>'),
  flower: s('<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8C10 6.5 10.6 4 12 3c1.4 1 2 3.5 0 6.8ZM12 14.2c2 3.3 1.4 5.8 0 6.8-1.4-1-2-3.5 0-6.8ZM9.8 12C6.5 14 4 13.4 3 12c1-1.4 3.5-2 6.8 0ZM14.2 12c3.3-2 5.8-1.4 6.8 0-1 1.4-3.5 2-6.8 0Z"/>'),
};

export const thanksIcons = {
  parents: 'Ayah & Ibu',
  family: 'Keluarga',
  friends: 'Teman',
  lecturer: 'Dosen / Toga',
  all: 'Semua orang',
  heart: 'Hati',
  star: 'Bintang',
  mosque: 'Masjid',
  book2: 'Buku',
  flower: 'Bunga',
  people: 'Orang-orang',
};

export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (!el.dataset.iconDone) {
      el.innerHTML = icons[el.dataset.icon] || '';
      el.dataset.iconDone = '1';
    }
  });
}
