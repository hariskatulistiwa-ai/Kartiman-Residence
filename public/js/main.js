// Aplikasi utama: router halaman, animasi, musik, live greetings.
import { icons, hydrateIcons } from './icons.js';
import { createFX } from './fx.js';
import { renderBooth } from './booth.js';
import {
  esc, nl2br, $, $$, DECO, nameHTML, flourishSVG, swashSVG, laurelSVG, badgeShapeSVG, swooshCornerSVG,
  pianoSVG, heroHTML, toast, splitChars, openLightbox, tilt,
} from './ui.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

const view = $('#view');
const state = { data: null, route: null, cleanup: [], opened: sessionStorage.getItem('opened') === '1', mySaves: new Set() };
const S = () => state.data.settings;
const imgSrc = (u) => (u === '@graduate' ? S().photoMain : u);
let fx = { burst() {}, confetti() {}, capToss() {}, setMode() {}, hearts() {} };

/* =========================================================
   Musik latar (otomatis, tanpa tombol mute)
   ========================================================= */
const bgm = $('#bgm');
const piano = $('#piano');
let notesTimer;
function setupMusic() {
  bgm.src = S().music;
  bgm.volume = 0.85;
  const img = piano.querySelector('img');
  if (S().pianoImage) img.src = S().pianoImage;
  else img.replaceWith(Object.assign(document.createElement('div'), { innerHTML: pianoSVG(), style: 'display:grid;place-items:center;width:100%;height:100%' }));
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: S().musicTitle || 'Piano', artist: `${S().fullName} ${S().degree}`, artwork: [{ src: S().logoMark, sizes: '512x512' }] });
  }
  bgm.addEventListener('playing', () => piano.classList.add('playing'));
  bgm.addEventListener('pause', () => piano.classList.remove('playing'));
  // Coba mainkan kembali jika dijeda sistem (mis. setelah kamera aktif)
  bgm.addEventListener('pause', () => setTimeout(playMusic, 600));
  document.addEventListener('visibilitychange', () => !document.hidden && playMusic());
}
function playMusic() {
  piano.classList.add('show');
  const p = bgm.play();
  if (p?.catch) p.catch(() => {});
  if (!notesTimer) {
    notesTimer = setInterval(() => {
      if (bgm.paused || document.hidden) return;
      const n = document.createElement('span');
      n.textContent = ['♪', '♫', '♩', '♬'][(Math.random() * 4) | 0];
      n.style.setProperty('--dx', `${(Math.random() - 0.5) * 50}px`);
      n.style.setProperty('--rot', `${(Math.random() - 0.5) * 50}deg`);
      piano.querySelector('.piano-notes').appendChild(n);
      setTimeout(() => n.remove(), 2700);
    }, 1100);
  }
}
// Browser mewajibkan interaksi pertama sebelum audio boleh berbunyi:
// begitu pengunjung menyentuh layar di halaman mana pun, musik langsung jalan.
['pointerdown', 'keydown', 'touchstart', 'touchend', 'click'].forEach((ev) =>
  addEventListener(ev, playMusic, { passive: true })
);

/* =========================================================
   Router & transisi
   ========================================================= */
const ROUTES = {
  '': renderCover,
  cerita: renderStory,
  'terima-kasih': renderThanks,
  photobooth: (root) => renderBooth(root, ctx()),
  live: renderLive,
  penutup: renderClosing,
};
const NAV_OF = { cerita: 'cerita', 'terima-kasih': 'terima-kasih', penutup: 'terima-kasih', photobooth: 'photobooth', live: 'live' };

function ctx() {
  return { S: S(), data: state.data, fx, toast, gsap, go, playMusic, mySaves: state.mySaves, ScrollTrigger };
}
const routeOf = () => location.hash.replace(/^#\/?/, '').split('?')[0];

function go(route) {
  if (location.hash !== '#/' + route) location.hash = '#/' + route;
  else navigate(route);
}

let navigating = false;
async function navigate(route, { instant = false } = {}) {
  if (!(route in ROUTES)) route = '';
  if (navigating) return;
  navigating = true;
  const first = state.route === null;
  state.route = route;
  if (!first && !instant) {
    await gsap.to(view, { opacity: 0, y: -14, filter: 'blur(6px)', duration: 0.32, ease: 'power2.in' });
  }
  state.cleanup.forEach((fn) => { try { fn(); } catch {} });
  state.cleanup = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  scrollTo(0, 0);
  view.innerHTML = '';
  const page = document.createElement('div');
  view.appendChild(page);
  document.body.classList.toggle('on-cover', route === '');
  document.body.classList.toggle('nav-on', route !== '');
  setNav(route);
  fx.setMode(route || 'cover');
  const clean = await ROUTES[route](page);
  if (typeof clean === 'function') state.cleanup.push(clean);
  hydrateIcons(page);
  gsap.set(view, { clearProps: 'filter' });
  gsap.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 });
  requestAnimationFrame(() => ScrollTrigger.refresh());
  view.focus({ preventScroll: true });
  navigating = false;
}
addEventListener('hashchange', () => navigate(routeOf()));

function setNav(route) {
  const key = NAV_OF[route];
  const nav = $('#nav');
  const pill = nav.querySelector('.nav-pill');
  $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === key));
  const act = nav.querySelector('a.active');
  if (act) {
    pill.style.opacity = 1;
    pill.style.left = act.offsetLeft - 4 + 'px';
    pill.style.width = act.offsetWidth + 8 + 'px';
  } else pill.style.opacity = 0;
}
addEventListener('resize', () => setNav(state.route));

/* ---------- animasi umum ---------- */
function revealAll(root) {
  $$('[data-reveal]', root).forEach((el) => {
    const type = el.dataset.reveal;
    const from = { opacity: 0, y: 34 };
    if (type === 'left') Object.assign(from, { x: -40, y: 0 });
    if (type === 'right') Object.assign(from, { x: 40, y: 0 });
    if (type === 'zoom') Object.assign(from, { scale: 0.85, y: 10 });
    if (type === 'flip') Object.assign(from, { rotateX: -70, y: 30, transformPerspective: 800, transformOrigin: '50% 0%' });
    gsap.fromTo(el, from, {
      opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, duration: 1, delay: Number(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
  $$('.draw', root).forEach((p) => {
    const len = p.getTotalLength?.() || 400;
    gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', scrollTrigger: { trigger: p.closest('svg'), start: 'top 95%', once: true } });
  });
}
function charsIn(el, opts = {}) {
  const chars = splitChars(el);
  return gsap.from(chars, { opacity: 0, y: 40, rotateX: -90, transformPerspective: 500, stagger: 0.035, duration: 0.9, ease: 'back.out(1.7)', ...opts });
}
function heroIn(root) {
  const h = $('.hero', root);
  if (!h) return;
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from($('.h-photo', h), { y: 60, opacity: 0, scale: 1.06, duration: 1.2 })
    .from($('.h-wave', h), { yPercent: 60, opacity: 0, duration: 1 }, 0.1)
    .from($$('.h-left > *, .name-plaque', h), { x: -30, opacity: 0, stagger: 0.09, duration: 0.8 }, 0.25)
    .from($$('.h-lily', h), { scale: 0.6, opacity: 0, rotate: -12, duration: 1.2, stagger: 0.15, ease: 'back.out(1.6)' }, 0.3);
  tl.add(() => floatY($('.h-photo', h), 6));
  // paralaks foto saat scroll
  gsap.to($('.h-photo', h), { yPercent: 10, ease: 'none', scrollTrigger: { trigger: h, start: 'top top', end: 'bottom top', scrub: true } });
}
function floatY(el, amt = 6, dur = 3.2) {
  if (el) gsap.to(el, { y: `-=${amt}`, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}
function nextChapter(label, route, icon = 'arrowRight') {
  return `<div class="next-chapter" data-reveal="zoom"><a class="btn btn-green" href="#/${route}"><span>${esc(label)}</span>${icons[icon]}</a></div>`;
}

/* =========================================================
   1. COVER
   ========================================================= */
function renderCover(root) {
  const s = S();
  root.innerHTML = `
  <section class="cover">
    <div class="cover-frame">
      <img class="deco sprig-l sway" src="${DECO.sprig2}" alt=""/>
      <img class="deco sprig-r sway r flip" src="${DECO.sprig2}" alt="" style="transform:scaleX(-1)"/>
      <img class="logo" src="${esc(s.logoMark)}" alt="Logo ${esc(s.university)}"/>
      <div class="logo-star">✦</div>
      <div class="arch-wrap">
        <div class="arch"></div>
        <div class="arch-ring"></div>
        <div class="pillar l"></div><div class="pillar r"></div>
        <img class="arch-photo" src="${esc(s.photoMain)}" alt="${esc(s.fullName)}"/>
        <svg class="swirl" viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="swirlGrad" x1="0" x2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity="0"/><stop offset=".4" stop-color="#ffe29a"/><stop offset="1" stop-color="#f3c96a" stop-opacity=".1"/></linearGradient></defs>
          <path id="swirlPath" d="M40 330 C 10 290, 40 250, 110 236 C 190 222, 250 190, 262 150 C 270 120, 250 110, 236 118"/>
          <path d="M70 300 C 120 280, 200 270, 250 220" opacity=".55"/>
          <circle r="3.2"/><circle r="2"/>
        </svg>
        <img class="deco lily-l sway" src="${DECO.lilyBL}" alt=""/>
        <img class="deco lily-r sway r" src="${DECO.lilyBR}" alt=""/>
      </div>
      <h1 class="hg">
        <span class="w1 gold-text">${esc(s.coverTitleTop)}</span>
        <span class="w2 gold-text">${esc(s.coverTitleBottom)}</span>
      </h1>
      ${flourishSVG('hg-flourish')}
      <div class="banner"><b></b><b></b><b></b><b></b><span>${nameHTML(s)}</span></div>
      <p class="uni">${esc(s.university).replace(/ (Sumatera)/i, '<br>$1')}</p>
      <p class="tagline">${esc(s.coverTagline)}</p>
      <div class="spacer"></div>
      <button class="btn btn-gold btn-open"><span>${esc(s.coverButton)}</span>${icons.chevronRight}</button>
      <p class="hint">${esc(s.coverHint)}</p>
      <img class="deco lily-bl sway" src="${DECO.lilyBL}" alt=""/>
      <img class="deco lily-br sway r" src="${DECO.lilyBR}" alt=""/>
    </div>
  </section>`;

  const q = (s) => $(s, root);
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from(q('.cover-frame'), { scale: 0.96, opacity: 0, duration: 1 })
    .from(q('.logo'), { y: -30, rotateY: 180, opacity: 0, duration: 1.2, ease: 'back.out(1.4)' }, 0.2)
    .from(q('.arch'), { scaleY: 0.2, transformOrigin: '50% 100%', opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.35)
    .from(q('.arch-ring'), { opacity: 0, duration: 1 }, 0.8)
    .from($$('.pillar', root), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, stagger: 0.1 }, 0.5)
    .from(q('.arch-photo'), { y: 80, opacity: 0, duration: 1.4, ease: 'power4.out' }, 0.7)
    .from($$('.arch-wrap .deco, .sprig-l, .sprig-r, .lily-bl, .lily-br', root), { scale: 0.4, opacity: 0, rotate: -15, duration: 1.3, stagger: 0.08, ease: 'back.out(1.5)' }, 0.8)
    .from($$('.hg span', root), { y: 50, opacity: 0, scale: 0.8, filter: 'blur(8px)', duration: 1.2, stagger: 0.18, ease: 'power4.out' }, 1.0)
    .from(q('.banner'), { clipPath: 'inset(0 50% 0 50%)', duration: 0.9, ease: 'power2.inOut' }, 1.5)
    .from($$('.uni, .tagline', root), { y: 16, opacity: 0, stagger: 0.12, duration: 0.8 }, 1.8)
    .from(q('.btn-open'), { scale: 0.6, opacity: 0, duration: 0.9, ease: 'elastic.out(1, 0.6)' }, 2.0)
    .from(q('.hint'), { opacity: 0, duration: 0.6 }, 2.3)
    .add(() => {
      floatY(q('.arch-photo'), 8, 3.4);
      gsap.to(q('.btn-open'), { scale: 1.04, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    });

  // garis kilau melingkar + titik cahaya yang bergerak
  const path = q('#swirlPath');
  const len = path.getTotalLength();
  gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.4, delay: 1.2, ease: 'power2.inOut' });
  const dots = $$('.swirl circle', root);
  const pos = { t: 0 };
  const tw = gsap.to(pos, {
    t: 1, duration: 4.5, repeat: -1, ease: 'sine.inOut', yoyo: true, delay: 1.2,
    onUpdate: () => {
      dots.forEach((d, i) => {
        const p = path.getPointAtLength(((pos.t + i * 0.08) % 1) * len);
        d.setAttribute('cx', p.x);
        d.setAttribute('cy', p.y);
      });
    },
  });
  tilt(q('.arch-wrap'), 8);

  q('.btn-open').addEventListener('click', openGraduation);
  return () => tw.kill();
}

async function openGraduation(e) {
  state.opened = true;
  sessionStorage.setItem('opened', '1');
  playMusic();
  const r = e.currentTarget.getBoundingClientRect();
  fx.burst(r.left + r.width / 2, r.top + r.height / 2, 120, 1.3);
  fx.capToss();
  fx.confetti(120);
  const c = $('#curtain');
  c.style.visibility = 'visible';
  const tl = gsap.timeline();
  tl.to('#curtain .c-left', { xPercent: 102, duration: 0.9, ease: 'power3.inOut' }, 0.35)
    .to('#curtain .c-right', { xPercent: -102, duration: 0.9, ease: 'power3.inOut' }, 0.35)
    .to('#curtain .c-medal', { scale: 1, rotate: 360, duration: 0.9, ease: 'back.out(1.6)' }, 1.0)
    .add(() => go('cerita'), 1.6)
    .to('#curtain .c-medal', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.in(1.6)' }, 2.3)
    .to('#curtain .c-left', { xPercent: 0, duration: 1.1, ease: 'power3.inOut' }, 2.5)
    .to('#curtain .c-right', { xPercent: 0, duration: 1.1, ease: 'power3.inOut' }, 2.5)
    .add(() => {
      c.style.visibility = 'hidden';
      gsap.set('#curtain .c-medal', { opacity: 1, rotate: 0 });
      fx.burst(innerWidth / 2, innerHeight * 0.35, 80, 1);
    });
}

/* =========================================================
   2. CERITA – Jejak langkahku
   ========================================================= */
function renderStory(root) {
  const s = S();
  const stories = state.data.stories;
  const rows = stories
    .map((st, i) => {
      const imgs = (st.images || []).map(imgSrc).filter(Boolean);
      const alt = i % 2 === 1;
      const rot = alt ? 2.5 : -2.5;
      const isGrad = (st.images || [])[0] === '@graduate';
      return `
      <div class="t-row ${alt ? 'alt' : ''}" data-i="${i}">
        <div class="t-photo" style="--rot:${rot}deg">
          ${imgs.length > 1 ? '<div class="ghost"></div>' : ''}
          <button class="polaroid ${isGrad ? 'grad' : ''}" data-story="${i}" aria-label="Lihat foto ${esc(st.title)}">
            <i class="tape ${alt ? 'tr' : 'tl'}"></i>
            ${imgs[0] ? `<img src="${esc(imgs[0])}" alt="${esc(st.title)}" loading="lazy"/>` : '<img alt=""/>'}
            ${imgs.length > 1 ? `<span class="stack-count">+${imgs.length - 1} foto</span>` : ''}
          </button>
        </div>
        <span class="t-ball"></span>
        <div class="t-text">
          <span class="ribbon">${esc(st.title)}</span>
          ${st.date ? `<span class="t-date">${esc(st.date)}</span>` : ''}
          <p>${nl2br(st.text)}</p>
        </div>
      </div>`;
    })
    .join('');
  root.innerHTML = `
  <section class="page story">
    ${heroHTML('story', s)}
    <div class="page-inner">
      <div class="story-head">
        <h1 class="title-xl emerald-text" id="storyTitle">${esc(s.storyTitle)}</h1>
        <p class="subtitle" data-reveal>${esc(s.storySubtitle)}</p>
        <div class="orn wide star" data-reveal><i>✦</i></div>
      </div>
      <div class="timeline">
        <svg class="timeline-line" aria-hidden="true"><defs><linearGradient id="lineGold" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e6c875"/><stop offset=".5" stop-color="#b8892f"/><stop offset="1" stop-color="#e6c875"/></linearGradient></defs><path/></svg>
        ${rows || '<p class="empty">Belum ada cerita.</p>'}
      </div>
      ${s.storyNote ? `<div class="story-note" data-reveal><b>✦</b><span>${esc(s.storyNote)}</span><b>✦</b></div>` : ''}
      ${nextChapter('Lanjut: Terima Kasih', 'terima-kasih', 'heart')}
    </div>
    <img class="deco sway" src="${DECO.lilyBL}" style="left:-8px;bottom:calc(var(--nav-h) + 6px);width:28%" alt=""/>
    <img class="deco sway r" src="${DECO.lilyBR}" style="right:-8px;bottom:calc(var(--nav-h) + 6px);width:28%" alt=""/>
  </section>`;

  heroIn(root);
  charsIn($('#storyTitle', root), { delay: 0.5 });

  // gambar garis berkelok emas yang mengikuti bola-bola timeline
  const tlEl = $('.timeline', root);
  const svg = $('.timeline-line', tlEl);
  const path = $('path', svg);
  const buildLine = () => {
    const box = tlEl.getBoundingClientRect();
    const balls = $$('.t-ball', tlEl).map((b) => {
      const r = b.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    if (!balls.length) return;
    let d = `M ${balls[0].x} ${Math.max(0, balls[0].y - 60)} L ${balls[0].x} ${balls[0].y}`;
    for (let i = 1; i < balls.length; i++) {
      const a = balls[i - 1], b = balls[i];
      const off = i % 2 ? -26 : 26;
      d += ` C ${a.x + off} ${a.y + (b.y - a.y) * 0.35}, ${b.x - off} ${a.y + (b.y - a.y) * 0.65}, ${b.x} ${b.y}`;
    }
    const last = balls[balls.length - 1];
    d += ` L ${last.x} ${last.y + 60}`;
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    path.setAttribute('d', d);
    return path.getTotalLength();
  };
  let len = buildLine() || 1;
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 75%', end: 'bottom 70%', scrub: 0.6 } });
  const onResize = () => {
    len = buildLine() || 1;
    gsap.set(path, { strokeDasharray: len });
  };
  addEventListener('resize', onResize);
  // gambar mungkin baru selesai dimuat → hitung ulang
  $$('img', tlEl).forEach((im) => im.addEventListener('load', () => { onResize(); ScrollTrigger.refresh(); }, { once: true }));

  $$('.t-row', root).forEach((row) => {
    const alt = row.classList.contains('alt');
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 82%', once: true } });
    tl.from($('.polaroid', row), { rotateY: alt ? 80 : -80, x: alt ? 60 : -60, opacity: 0, duration: 1.1, ease: 'power3.out', transformPerspective: 900 })
      .from($('.t-ball', row), { scale: 0, duration: 0.7, ease: 'back.out(3)' }, 0.2)
      .from($('.ribbon', row), { clipPath: 'inset(0 100% 0 0)', duration: 0.8, ease: 'power2.inOut' }, 0.35)
      .from($('.t-text p', row), { y: 20, opacity: 0, duration: 0.8 }, 0.6)
      .add(() => {
        const b = $('.t-ball', row).getBoundingClientRect();
        fx.burst(b.left + b.width / 2, b.top + b.height / 2, 18, 0.5);
      }, 0.4);
    tilt($('.polaroid', row), 12);
  });
  root.addEventListener('click', (e) => {
    const p = e.target.closest('[data-story]');
    if (!p) return;
    const st = stories[Number(p.dataset.story)];
    const imgs = (st.images || []).map(imgSrc).filter(Boolean);
    openLightbox(imgs.map((src) => ({ src, title: st.title, text: st.text })), 0);
  });
  revealAll(root);
  return () => removeEventListener('resize', onResize);
}

/* =========================================================
   3. TERIMA KASIH – Untuk kalian, sepenuh hati
   ========================================================= */
function renderThanks(root) {
  const s = S();
  const cards = state.data.thanks
    .map(
      (t) => `
    <article class="thank-card">
      <div class="badge">${badgeShapeSVG()}<span class="ico" data-icon="${esc(t.icon)}"></span></div>
      <i class="vline"></i>
      <div><h3>${esc(t.title)}</h3><p>${nl2br(t.text)}</p></div>
    </article>`
    )
    .join('');
  root.innerHTML = `
  <section class="page thanks">
    <div class="page-border"></div>
    ${swooshCornerSVG('tl')}
    ${swooshCornerSVG('br')}
    <img class="deco sway" src="${DECO.lilyTL}" style="left:0;top:0;width:36%" alt=""/>
    <div class="page-inner">
      <div class="top">
        <div class="uni-block"><img src="${esc(s.logoMark)}" alt="Logo"/><div class="uni-name">${esc(s.university).replace(/ (Sumatera)/i, '<br>$1')}</div></div>
        <div class="orn" style="margin:8px 0 0"><i style="width:4px;height:4px"></i></div>
        <div class="portrait-oval">
          <div class="oval"><img src="${esc(s.photoMain)}" alt="${esc(s.fullName)}"/></div>
          <img class="deco l sway" src="${DECO.lilyBL}" alt=""/>
          <img class="deco r sway r" src="${DECO.lilyBR}" alt=""/>
        </div>
        <div class="banner"><b></b><b></b><b></b><b></b><span>${esc(s.fullName).toUpperCase()}, <em>${esc(s.degree)}</em></span></div>
        <div class="uni-mini">${esc(s.university)}</div>
      </div>
      <h1 class="title-xl emerald-text" id="thanksTitle">${nl2br(s.thanksTitle)}</h1>
      <div class="orn" data-reveal><i></i></div>
      <div class="thank-list">${cards}</div>
      ${s.thanksQuote ? `<p class="quote" data-reveal><span class="q">“</span>${esc(s.thanksQuote)}<span class="q">”</span></p><div class="orn" data-reveal><i></i></div>` : ''}
      ${nextChapter('Abadikan di Photobooth', 'photobooth', 'camera')}
    </div>
    <img class="deco sway" src="${DECO.lilyBL}" style="left:-6px;bottom:calc(var(--nav-h) + 4px);width:30%" alt=""/>
    <img class="deco sway r" src="${DECO.lilyBR}" style="right:-6px;bottom:calc(var(--nav-h) + 4px);width:26%" alt=""/>
  </section>`;
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from($$('.swoosh', root), { opacity: 0, scale: 0.6, transformOrigin: '0 0', duration: 1.2 })
    .from($('.uni-block', root), { y: -20, opacity: 0, duration: 0.8 }, 0.1)
    .from($('.portrait-oval .oval', root), { scale: 0.5, opacity: 0, rotateY: 90, transformPerspective: 800, duration: 1.3, ease: 'back.out(1.4)' }, 0.3)
    .from($$('.portrait-oval .deco', root), { scale: 0.3, opacity: 0, duration: 1.1, stagger: 0.1, ease: 'back.out(1.6)' }, 0.7)
    .from($('.thanks .banner', root), { clipPath: 'inset(0 50% 0 50%)', duration: 0.9, ease: 'power2.inOut' }, 0.9)
    .from($('.uni-mini', root), { opacity: 0, y: 10, duration: 0.6 }, 1.2);
  charsIn($('#thanksTitle', root), { delay: 1.2, scrollTrigger: { trigger: '#thanksTitle', start: 'top 92%' } });
  $$('.thank-card', root).forEach((card, i) => {
    gsap.from(card, { rotateX: -75, y: 40, opacity: 0, transformPerspective: 900, transformOrigin: '50% 0%', duration: 1.1, ease: 'back.out(1.2)', scrollTrigger: { trigger: card, start: 'top 90%', once: true }, delay: (i % 2) * 0.05 });
    gsap.from($('.badge', card), { rotate: -180, scale: 0.3, duration: 1.2, ease: 'back.out(1.8)', scrollTrigger: { trigger: card, start: 'top 90%', once: true }, onComplete: () => { const b = $('.badge', card).getBoundingClientRect(); fx.hearts(b.left + b.width / 2, b.top + b.height / 2, 6); } });
    tilt(card, 6);
  });
  revealAll(root);
}

/* =========================================================
   6. LIVE GREETINGS
   ========================================================= */
const live = { el: null, cols: [], next: null, q: '', loading: false, done: false, ids: new Set(), total: 0 };
const liked = new Set(JSON.parse(localStorage.getItem('liked') || '[]'));

function renderLive(root) {
  const s = S();
  root.innerHTML = `
  <section class="page live">
    ${heroHTML('live', s)}
    <div class="page-inner">
      <div class="live-head">
        <img class="deco sway" src="${DECO.sprig}" style="left:-26px;top:-6px;width:24%;transform:scaleX(-1)" alt=""/>
        <img class="deco sway r" src="${DECO.sprig}" style="right:-26px;top:-6px;width:24%" alt=""/>
        <h1><span class="live-dot"></span><span id="liveTitle">${esc(s.liveTitle)}</span></h1>
        <div class="sub">${esc(s.liveSubtitle)}</div>
        <div class="count-pill"><b id="liveCount">${state.data.greetingsCount}</b> ucapan &amp; doa</div>
      </div>
      <div class="live-tools">
        <label class="search">${icons.search}<input type="search" placeholder="Cari ucapan…" aria-label="Cari nama atau ucapan"/></label>
        <a class="btn btn-green" href="#/photobooth">${icons.plus}<span>Tambah foto &amp; ucapan</span></a>
      </div>
      <div class="masonry"><div class="col"></div><div class="col"></div></div>
      <div class="loader-row"><span class="ring-dots">${[...Array(8)].map((_, i) => `<i style="--i:${i}"></i>`).join('')}</span><span class="lt">Memuat kenangan berikutnya...</span></div>
      ${nextChapter('Penutup', 'penutup', 'heart')}
    </div>
    <img class="deco sway" src="${DECO.lilyBL}" style="left:-6px;bottom:calc(var(--nav-h) + 4px);width:26%" alt=""/>
    <img class="deco sway r" src="${DECO.lilyBR}" style="right:-6px;bottom:calc(var(--nav-h) + 4px);width:24%" alt=""/>
  </section>`;
  // tombol "Tambah" di layar kecil diringkas
  if (innerWidth < 350) $('.live-tools .btn span', root).textContent = 'Tambah';
  Object.assign(live, { el: root, cols: $$('.masonry .col', root), next: null, q: '', loading: false, done: false, ids: new Set() });
  heroIn(root);
  charsIn($('#liveTitle', root), { delay: 0.4 });
  revealAll(root);

  const input = $('.search input', root);
  let tmr;
  input.addEventListener('input', () => {
    clearTimeout(tmr);
    tmr = setTimeout(() => {
      live.q = input.value.trim();
      live.next = null;
      live.done = false;
      live.ids.clear();
      live.cols.forEach((c) => (c.innerHTML = ''));
      loadMore();
    }, 350);
  });
  const loader = $('.loader-row', root);
  const io = new IntersectionObserver((en) => en[0].isIntersecting && loadMore(), { rootMargin: '400px' });
  io.observe(loader);
  loadMore();

  root.querySelector('.masonry').addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like');
    const card = e.target.closest('.g-card');
    if (!card) return;
    const g = card._g;
    if (likeBtn) {
      e.stopPropagation();
      toggleLike(g, likeBtn);
      return;
    }
    const all = $$('.g-card', root).map((c) => c._g);
    openLightbox(all.map((x) => ({ src: x.photo, title: x.name, text: x.message, download: true })), all.indexOf(g));
  });
  return () => io.disconnect();
}

async function loadMore() {
  if (live.loading || live.done || !live.el) return;
  live.loading = true;
  const lt = $('.loader-row', live.el);
  lt.style.visibility = 'visible';
  try {
    const p = new URLSearchParams({ limit: 12 });
    if (live.next) p.set('before', live.next);
    if (live.q) p.set('q', live.q);
    const res = await fetch('/api/greetings?' + p).then((r) => r.json());
    res.items.forEach((g) => addCard(g));
    live.next = res.next;
    live.done = !res.next;
    if (!live.q) setCount(res.total);
    if (live.done) {
      lt.style.visibility = live.ids.size ? 'hidden' : 'visible';
      if (!live.ids.size) $('.lt', lt).textContent = live.q ? 'Tidak ada ucapan yang cocok.' : 'Belum ada ucapan. Jadilah yang pertama!';
      $('.ring-dots', lt).style.display = live.ids.size ? '' : 'none';
    }
  } catch {
    toast('Gagal memuat ucapan. Periksa koneksi internet.', { type: 'error' });
  } finally {
    live.loading = false;
  }
  // jika layar belum penuh, muat lagi
  if (!live.done && live.el && $('.loader-row', live.el).getBoundingClientRect().top < innerHeight + 300) setTimeout(loadMore, 50);
}
function setCount(n) {
  live.total = n;
  const c = live.el && $('#liveCount', live.el);
  if (c) c.textContent = n;
}
function cardHTML(g) {
  const icon = /teman|kampus|dosen|kuliah/i.test(g.name) ? icons.cap : icons.people;
  const when = timeAgo(g.createdAt);
  return `
    <div class="ph"><img src="${esc(g.thumb || g.photo)}" alt="Foto dari ${esc(g.name)}" loading="lazy"/>${g.sample ? '<span class="sample">Foto contoh</span>' : ''}</div>
    <h4>${icon}<span>${esc(g.name)}</span></h4>
    <div class="rule"></div>
    <p>${nl2br(g.message)}</p>
    <div class="meta"><span>${when}</span><button class="like ${liked.has(g.id) ? 'on' : ''}" aria-label="Suka">${liked.has(g.id) ? icons.heartFill : icons.heart}<b>${g.likes || ''}</b></button></div>`;
}
function addCard(g, prepend = false) {
  if (live.ids.has(g.id) || !live.cols.length) return;
  live.ids.add(g.id);
  const card = document.createElement('article');
  card.className = 'g-card';
  card.dataset.id = g.id;
  card._g = g;
  card.innerHTML = cardHTML(g);
  const [a, b] = live.cols;
  const col = a.offsetHeight <= b.offsetHeight ? a : b;
  if (prepend) {
    col.prepend(card);
    card.classList.add('new');
    gsap.from(card, { scale: 0.6, opacity: 0, rotate: -6, duration: 0.9, ease: 'back.out(1.7)', onComplete: () => {
      const r = card.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height / 3, 50, 0.9);
    } });
  } else {
    col.appendChild(card);
    gsap.from(card, { y: 40, opacity: 0, rotateX: -35, transformPerspective: 800, duration: 0.8, delay: (live.ids.size % 4) * 0.06 });
  }
  tilt(card, 7);
}
async function toggleLike(g, btn) {
  const on = !liked.has(g.id);
  on ? liked.add(g.id) : liked.delete(g.id);
  localStorage.setItem('liked', JSON.stringify([...liked]));
  btn.classList.toggle('on', on);
  btn.innerHTML = `${on ? icons.heartFill : icons.heart}<b>${(g.likes = Math.max(0, (g.likes || 0) + (on ? 1 : -1))) || ''}</b>`;
  if (on) {
    const r = btn.getBoundingClientRect();
    fx.hearts(r.left + r.width / 2, r.top + r.height / 2, 8);
    gsap.fromTo(btn, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
  }
  fetch(`/api/greetings/${g.id}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ undo: !on }) }).catch(() => {});
}
function timeAgo(t) {
  const d = (Date.now() - t) / 1000;
  if (d < 60) return 'baru saja';
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* =========================================================
   7. PENUTUP – Terima kasih atas cinta & kehangatan
   ========================================================= */
function renderClosing(root) {
  const s = S();
  root.innerHTML = `
  <section class="page closing">
    <img class="deco lily-tl sway" src="${DECO.lilyTL}" alt=""/>
    <img class="deco lily-tr sway r" src="${DECO.lilyTR}" alt=""/>
    <div class="page-inner">
      <div class="top">
        <img src="${esc(s.logoMark)}" alt="Logo"/>
        <div class="uni-lines"><span>${esc(s.university).replace(/ (Sumatera)/i, '<br>$1')}</span></div>
        <div style="color:var(--gold);font-size:10px;margin-top:6px">◆</div>
      </div>
      <h1 class="closing-title emerald-text" id="closeTitle">${esc(s.closingTitle)}</h1>
      ${swashSVG()}
      <p class="subtitle" data-reveal>${esc(s.closingSubtitle)}</p>
      <p class="lead" data-reveal data-delay=".15">${nl2br(s.closingText)}</p>
      <div class="end-arch">
        <div class="ring"></div>
        <img class="photo" src="${esc(s.photoMain)}" alt="${esc(s.fullName)}"/>
        <img class="deco l sway" src="${DECO.lilyBL}" alt=""/>
        <img class="deco r sway r" src="${DECO.lilyBR}" alt=""/>
      </div>
      <h2 class="closing-name emerald-text" id="closeName">${esc(s.fullName)} ${esc(s.degree)}</h2>
      <div class="orn wide" data-reveal><i style="width:6px;height:6px"></i></div>
      <p class="uni-spaced" data-reveal>${esc(s.university)}</p>
      ${s.closingQuote ? `<p class="quote" data-reveal><span class="q">“</span>${esc(s.closingQuote)}<span class="q">”</span></p>` : ''}
      <div class="btns">
        <a class="btn btn-green" href="#/live" data-reveal="zoom">${icons.live}<span>Lihat Live Greetings</span>${icons.chevronRight}</a>
        <button class="btn btn-ghost" data-restart data-reveal="zoom">${icons.restart}<span>Kembali ke awal</span></button>
      </div>
    </div>
    <img class="deco lily-bl sway" src="${DECO.lilyBL}" alt=""/>
    <img class="deco lily-br sway r" src="${DECO.lilyBR}" alt=""/>
  </section>`;
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from($$('.lily-tl, .lily-tr', root), { scale: 0.4, opacity: 0, rotate: -20, duration: 1.4, stagger: 0.15, ease: 'back.out(1.5)' })
    .from($('.top', root), { y: -20, opacity: 0, duration: 0.8 }, 0.2);
  charsIn($('#closeTitle', root), { delay: 0.5, stagger: 0.06, duration: 1.1 });
  const arch = $('.end-arch', root);
  gsap.timeline({ scrollTrigger: { trigger: arch, start: 'top 85%', once: true } })
    .from($('.ring', arch), { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.out' })
    .from($('.photo', arch), { y: 100, opacity: 0, duration: 1.4, ease: 'power4.out', onComplete: () => floatY($('.photo', arch), 6, 3) }, 0.3)
    .from($$('.deco', arch), { scale: 0.3, opacity: 0, duration: 1.2, stagger: 0.12, ease: 'back.out(1.5)' }, 0.6)
    .add(() => {
      fx.confetti(90);
      const r = arch.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height * 0.3, 90, 1.2);
    }, 0.8);
  charsIn($('#closeName', root), { scrollTrigger: { trigger: '#closeName', start: 'top 92%' } });
  tilt(arch, 7);
  $('[data-restart]', root).addEventListener('click', () => {
    go('');
  });
  setTimeout(() => fx.confetti(60), 900);
  revealAll(root);
}

/* =========================================================
   Realtime: ucapan baru masuk langsung
   ========================================================= */
function connectStream() {
  if (!('EventSource' in window)) return;
  const es = new EventSource('/api/stream');
  es.addEventListener('greeting', (e) => {
    const g = JSON.parse(e.data);
    state.data.greetingsCount++;
    if (state.route === 'live' && !live.q) {
      setCount(live.total + 1);
      addCard(g, true);
    } else if (!state.mySaves.has(g.id) && state.route !== '') {
      toast(`Ucapan baru dari ${g.name} 💌`, { icon: icons.heartFill, duration: 2600 });
    }
  });
  es.addEventListener('like', (e) => {
    const { id, likes } = JSON.parse(e.data);
    const card = live.el && live.el.querySelector(`.g-card[data-id="${CSS.escape(id)}"]`);
    if (card) {
      card._g.likes = likes;
      const b = card.querySelector('.like b');
      if (b) b.textContent = likes || '';
    }
  });
  es.addEventListener('greeting-remove', (e) => {
    const { id } = JSON.parse(e.data);
    const card = live.el && live.el.querySelector(`.g-card[data-id="${CSS.escape(id)}"]`);
    if (card) gsap.to(card, { scale: 0.8, opacity: 0, duration: 0.4, onComplete: () => card.remove() });
  });
  es.addEventListener('greeting-update', (e) => {
    const g = JSON.parse(e.data);
    const card = live.el && live.el.querySelector(`.g-card[data-id="${CSS.escape(g.id)}"]`);
    if (!card) return;
    if (g.hidden) return card.remove();
    card._g = g;
    card.innerHTML = cardHTML(g);
  });
  es.addEventListener('content', async () => {
    state.data = await fetch('/api/public').then((r) => r.json());
    if (['cerita', 'terima-kasih', 'penutup'].includes(state.route)) navigate(state.route, { instant: true });
  });
}

/* =========================================================
   Start
   ========================================================= */
async function boot() {
  const bar = $('.pl-bar i');
  bar.style.width = '20%';
  try {
    state.data = await fetch('/api/public').then((r) => r.json());
  } catch {
    $('.pl-text').textContent = 'Gagal memuat. Muat ulang halaman ya.';
    return;
  }
  bar.style.width = '50%';
  document.title = S().siteTitle || document.title;
  // muat gambar utama & font lebih dulu supaya animasi pembuka mulus
  const pre = [S().photoMain, S().logoMark, DECO.lilyBL, DECO.lilyBR, DECO.sprig2].map(
    (src) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })
  );
  await Promise.race([Promise.all([...pre, document.fonts?.ready]), new Promise((r) => setTimeout(r, 4000))]);
  bar.style.width = '100%';
  setupMusic();
  hydrateIcons(document);
  fx = createFX($('#fx'));
  connectStream();
  setTimeout(() => $('#preloader').classList.add('done'), 250);
  const r = routeOf();
  await navigate(r);
  playMusic(); // autoplay bila diizinkan browser; jika tidak, mulai pada sentuhan pertama
}
boot();
