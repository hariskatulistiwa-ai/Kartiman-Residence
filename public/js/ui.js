// Komponen UI bersama: escape, hero, ornamen SVG, toast, lightbox, split text.
import { icons } from './icons.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
// **tebal** sederhana
export const rich = (s) => nl2br(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let uidN = 0;
const uid = (p) => `${p}${++uidN}`;

export const DECO = {
  lilyTL: '/assets/deco/lily_tl.webp',
  lilyTR: '/assets/deco/lily_tr.webp',
  lilyBL: '/assets/deco/lily_bl.webp',
  lilyBR: '/assets/deco/lily_br.webp',
  sprig: '/assets/deco/sprig.webp',
  sprig2: '/assets/deco/sprig_tr.webp',
  corner: '/assets/deco/gold-corner.webp',
};

export function nameHTML(S, { degreeClass = '' } = {}) {
  return `${esc(S.fullName).toUpperCase()} <em class="${degreeClass}">${esc(S.degree)}</em>`;
}

export function flourishSVG(cls = 'flourish') {
  const id = uid('fl');
  return `<svg class="${cls}" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#c9a24a" stop-opacity="0"/><stop offset=".25" stop-color="#d7b45f"/><stop offset=".6" stop-color="#b8892f"/><stop offset="1" stop-color="#c9a24a" stop-opacity="0"/></linearGradient></defs>
    <path class="draw" d="M4 15 C 70 4, 120 22, 160 13 C 185 7, 196 2, 190 9 C 185 15, 172 14, 178 9 C 200 0, 250 12, 296 8" fill="none" stroke="url(#${id})" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

export function swashSVG() {
  const id = uid('sw');
  return `<svg class="swash" viewBox="0 0 320 30" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#c9a24a" stop-opacity="0"/><stop offset=".3" stop-color="#e2c272"/><stop offset=".7" stop-color="#b8892f"/><stop offset="1" stop-color="#c9a24a" stop-opacity="0"/></linearGradient></defs>
    <path class="draw" d="M6 20 C 60 8, 110 26, 160 16 S 250 4, 314 12" fill="none" stroke="url(#${id})" stroke-width="2" stroke-linecap="round"/>
    <path class="draw" d="M70 22 C 120 30, 190 26, 240 18" fill="none" stroke="url(#${id})" stroke-width="1" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}

export function waveSVG() {
  const g = uid('wv');
  const l = uid('wl');
  return `<svg class="h-wave" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="${g}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#0f4430"/><stop offset=".55" stop-color="#175a3f"/><stop offset="1" stop-color="#0b3324"/></linearGradient>
      <linearGradient id="${l}" x1="0" x2="1"><stop offset="0" stop-color="#b8892f" stop-opacity=".2"/><stop offset=".4" stop-color="#ecd28a"/><stop offset="1" stop-color="#b8892f"/></linearGradient>
    </defs>
    <path d="M0 40 C 90 92, 240 40, 400 0 L400 26 C 250 62, 120 116, 0 70 Z" fill="url(#${g})"/>
    <path d="M0 40 C 90 92, 240 40, 400 0" fill="none" stroke="url(#${l})" stroke-width="2.2"/>
    <path d="M0 70 C 120 116, 250 62, 400 26" fill="none" stroke="url(#${l})" stroke-width="1.6"/>
    <path d="M0 64 C 110 112, 250 52, 400 18" fill="none" stroke="#e7cd86" stroke-width="1"/>
  </svg>`;
}

export function sparkleArcSVG() {
  const id = uid('sa');
  return `<svg class="h-sparkle" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#e8cd83" stop-opacity="0"/><stop offset=".5" stop-color="#f3dc98"/><stop offset="1" stop-color="#e8cd83" stop-opacity="0"/></linearGradient></defs>
    <path class="draw" d="M10 170 C 40 90, 120 40, 196 30" fill="none" stroke="url(#${id})" stroke-width="1.4"/>
    <path class="draw" d="M30 190 C 70 130, 140 90, 200 80" fill="none" stroke="url(#${id})" stroke-width="1"/>
  </svg>`;
}

export function laurelSVG(cls) {
  return `<svg class="laurel ${cls}" viewBox="0 0 16 34" aria-hidden="true"><g fill="currentColor"><path d="M13 33C5 28 3 18 6 6" fill="none" stroke="currentColor" stroke-width="1.2"/><ellipse cx="4" cy="9" rx="2" ry="4" transform="rotate(-20 4 9)"/><ellipse cx="3" cy="16" rx="2" ry="4" transform="rotate(-35 3 16)"/><ellipse cx="4.5" cy="23" rx="2" ry="4" transform="rotate(-50 4.5 23)"/><ellipse cx="9" cy="12" rx="1.6" ry="3.4" transform="rotate(25 9 12)"/><ellipse cx="9" cy="20" rx="1.6" ry="3.4" transform="rotate(15 9 20)"/></g></svg>`;
}

export function badgeShapeSVG() {
  const id = uid('bd');
  const pts = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const r = 46 * (0.88 + 0.12 * Math.cos(4 * t));
    pts.push(`${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)}`);
  }
  const inner = pts.map((p) => {
    const [x, y] = p.split(',').map(Number);
    return `${(50 + (x - 50) * 0.86).toFixed(2)},${(50 + (y - 50) * 0.86).toFixed(2)}`;
  });
  return `<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">
    <defs><radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#1f6a4b"/><stop offset="1" stop-color="#0a2c20"/></radialGradient></defs>
    <polygon points="${pts.join(' ')}" fill="url(#${id})" stroke="#d9b866" stroke-width="2.2"/>
    <polygon points="${inner.join(' ')}" fill="none" stroke="#e8cd83" stroke-width=".8" opacity=".75"/>
  </svg>`;
}

export function swooshCornerSVG(cls) {
  const g = uid('sc');
  return `<svg class="swoosh ${cls}" viewBox="0 0 220 260" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3324"/><stop offset=".6" stop-color="#175a3f"/><stop offset="1" stop-color="#0f4430"/></linearGradient></defs>
    <path d="M0 0 H150 C 95 30, 40 90, 0 250 Z" fill="url(#${g})"/>
    <path d="M150 0 C 95 30, 40 90, 0 250" fill="none" stroke="#d9b866" stroke-width="2.4"/>
    <path d="M118 0 C 70 34, 26 92, 0 200" fill="none" stroke="#e8cd83" stroke-width=".9" opacity=".8"/>
  </svg>`;
}

export function pianoSVG() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="pg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#f6e3a6"/><stop offset=".5" stop-color="#d4a542"/><stop offset="1" stop-color="#9c7426"/></linearGradient></defs>
    <path d="M9 33 C 9 19 20 11 33 12 C 44 13 47 21 52 25 C 55 27 56 30 56 33 Z" fill="url(#pg)"/>
    <path d="M14 30 L 40 14" stroke="#fff3c9" stroke-width="1.2" opacity=".7"/>
    <rect x="8" y="33" width="49" height="5" rx="1" fill="#b8892f"/>
    <rect x="10" y="38" width="45" height="8" rx="1" fill="#fffaf0"/>
    <g fill="#1a1a1a"><rect x="13" y="38" width="2.4" height="5"/><rect x="18" y="38" width="2.4" height="5"/><rect x="26" y="38" width="2.4" height="5"/><rect x="31" y="38" width="2.4" height="5"/><rect x="36" y="38" width="2.4" height="5"/><rect x="44" y="38" width="2.4" height="5"/><rect x="49" y="38" width="2.4" height="5"/></g>
    <path d="M13 46 V56 M52 46 V56 M33 46 V54" stroke="url(#pg)" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

/** Header bergaya mockup dengan foto wisudawan di kanan dan pita hijau. */
export function heroHTML(variant, S) {
  const photo = `<div class="h-photo-wrap"><img class="h-photo" src="${esc(S.photoMain)}" alt="${esc(S.fullName)}" /></div>`;
  const chip = `<div class="uni-chip"><img src="${esc(S.logoMark)}" alt="Logo"/><span>${esc(S.university).replace(/ (Negeri) /i, ' $1<br>').replace(/ (Sumatera)/i, '<br>$1')}</span></div>`;
  let left = '';
  if (variant === 'story') {
    left = `<div class="h-left story-left">
        <div class="uni-chip col" data-a="chip">
          <img src="${esc(S.logoMark)}" alt="Logo"/>
          <span>${esc(S.university).replace(/ (Sumatera)/i, '<br>$1')}</span>
        </div>
        <div class="name-plaque" data-a="plaque">${laurelSVG('l')}${laurelSVG('r')}<span>${esc(S.fullName).toUpperCase().replace(/ (\S+)$/, '<br>$1')} <em>${esc(S.degree)}</em></span></div>
      </div>`;
  } else if (variant === 'live') {
    left = `<div class="h-left">
        ${chip}
        <div class="live-name" data-a="name">${esc(S.fullName).toUpperCase().replace(/^(\S+) /, '$1<br>')}<em>${esc(S.degree)}</em></div>
        <div class="orn" style="margin-left:28px"><i></i></div>
      </div>`;
  } else if (variant === 'undangan') {
    left = `<div class="h-left">
        ${chip}
        <div class="caps" style="font-size:11px;letter-spacing:.42em;margin-top:14px">Undangan Digital</div>
        <div class="hero-title emerald-text" style="font-family:var(--serif2);font-size:clamp(44px,13vw,60px);letter-spacing:.02em;margin-top:2px" data-a="title">WISUDA</div>
        ${flourishSVG()}
        <div class="hero-name" data-a="name">${esc(S.fullName).toUpperCase().replace(/ (\S+)$/, '<br>$1')} <em>${esc(S.degree)}</em></div>
        <div class="line"></div>
        <p style="font:400 11.5px/1.5 var(--sans);margin:8px 0 0;color:#2f3a33">${rich(S.inviteText)}</p>
      </div>`;
  } else {
    // booth / wish
    left = `<div class="h-left">
        ${variant === 'wish' ? `<div class="uni-chip plain"><img src="${esc(S.logoMark)}" alt="Logo"/><span>${esc(S.university).replace(/ (Negeri) /i, ' $1<br>').replace(/ (Sumatera)/i, '<br>$1')}</span></div>` : chip}
        <div class="hero-title emerald-text" data-a="title"><i>Happy</i><i>Graduation</i></div>
        ${flourishSVG()}
        <div class="hero-name" data-a="name">${esc(S.fullName).toUpperCase().replace(/ (\S+)$/, '<br>$1')} <em>${esc(S.degree)}</em></div>
        <div class="line"></div>
      </div>`;
  }
  const lily =
    variant === 'live'
      ? `<img class="deco h-lily sway r" src="${DECO.lilyTR}" style="right:-6px;top:-4px;width:24%" alt=""/>`
      : variant === 'story'
      ? `<img class="deco h-lily sway r" src="${DECO.lilyTR}" style="right:-10px;top:40%;width:30%" alt=""/>`
      : `<img class="deco h-lily sway" src="${DECO.lilyBL}" style="left:-12px;top:32%;width:26%;opacity:.95" alt=""/>
         <img class="deco h-lily sway r" src="${DECO.lilyTR}" style="right:-6px;top:-4px;width:26%" alt=""/>`;
  return `<header class="hero ${variant}">${lily}${photo}${sparkleArcSVG()}${left}${waveSVG()}</header>`;
}

/* ---------- Toast ---------- */
export function toast(message, { type = 'ok', duration = 3000, icon } = {}) {
  const box = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.style.setProperty('--dur', duration + 'ms');
  t.innerHTML = `<span class="tick">${icon || (type === 'error' ? icons.close : icons.check)}</span><span class="vsep"></span><span>${esc(message)}</span><i class="bar"></i>`;
  box.appendChild(t);
  const g = window.gsap;
  if (g) g.from(t, { y: 30, opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.8)' });
  setTimeout(() => {
    if (g) g.to(t, { y: 20, opacity: 0, duration: 0.35, onComplete: () => t.remove() });
    else t.remove();
  }, duration);
}

/* ---------- Split text ---------- */
export function splitChars(el) {
  if (!el || el.dataset.split) return [];
  el.dataset.split = '1';
  const moveGrad = el.classList.contains('emerald-text');
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((word) => {
          if (!word) return;
          if (/^\s+$/.test(word)) {
            frag.appendChild(document.createTextNode(word));
            return;
          }
          const w = document.createElement('span');
          w.className = 'split-word';
          [...word].forEach((ch) => {
            const c = document.createElement('span');
            c.className = 'split-char' + (moveGrad ? ' emerald-text' : '');
            c.textContent = ch;
            w.appendChild(c);
            chars.push(c);
          });
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  if (moveGrad) el.classList.remove('emerald-text');
  return chars;
}

/* ---------- Lightbox ---------- */
export function openLightbox(items, index = 0) {
  const lb = document.getElementById('lightbox');
  let i = index;
  const g = window.gsap;
  lb.innerHTML = `
    <div class="lb-top"><span class="count"></span><button class="lb-btn" data-x aria-label="Tutup">${icons.close}</button></div>
    <div class="lb-stage"><img alt=""/>${items.length > 1 ? `<button class="lb-btn lb-nav prev" aria-label="Sebelumnya">${icons.chevronLeft}</button><button class="lb-btn lb-nav next" aria-label="Berikutnya">${icons.chevronRight}</button>` : ''}</div>
    <div class="lb-cap"></div>`;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('.lb-cap');
  const count = lb.querySelector('.count');
  const show = (dir = 0) => {
    const it = items[i];
    count.textContent = items.length > 1 ? `${i + 1} / ${items.length}` : '';
    const swap = () => {
      img.src = it.src;
      cap.innerHTML = `${it.title ? `<h3>${esc(it.title)}</h3>` : ''}${it.text ? `<p>${nl2br(it.text)}</p>` : ''}${
        it.download ? `<div class="lb-actions"><a class="btn btn-gold small" href="${esc(it.src)}" download>${icons.download}<span>Unduh</span></a></div>` : ''
      }`;
      if (g) g.fromTo(img, { opacity: 0, x: dir * 60, rotateY: dir * 25, scale: 0.94 }, { opacity: 1, x: 0, rotateY: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
    };
    if (dir && g) g.to(img, { opacity: 0, x: -dir * 60, duration: 0.2, onComplete: swap });
    else swap();
  };
  const go = (d) => {
    if (items.length < 2) return;
    i = (i + d + items.length) % items.length;
    show(d);
  };
  const close = () => {
    removeEventListener('keydown', onKey);
    if (g) g.to(lb, { opacity: 0, duration: 0.3, onComplete: () => { lb.hidden = true; lb.style.opacity = ''; } });
    else lb.hidden = true;
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  addEventListener('keydown', onKey);
  lb.querySelector('[data-x]').onclick = close;
  lb.querySelector('.prev')?.addEventListener('click', () => go(-1));
  lb.querySelector('.next')?.addEventListener('click', () => go(1));
  lb.querySelector('.lb-stage').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) close();
  });
  let sx = null;
  const stage = lb.querySelector('.lb-stage');
  stage.addEventListener('pointerdown', (e) => (sx = e.clientX));
  stage.addEventListener('pointerup', (e) => {
    if (sx == null) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    sx = null;
  });
  lb.hidden = false;
  if (g) g.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.35 });
  show(0);
}

/* ---------- 3D tilt ---------- */
export function tilt(el, max = 10) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const g = window.gsap;
  const move = (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    g.to(el, { rotateY: x * max, rotateX: -y * max, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
  };
  const leave = () => g.to(el, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.5)' });
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointerup', leave);
}
