// Penggambar bingkai photobooth (canvas). Dipakai oleh situs & panel admin.
export const GEOM = {
  single: {
    W: 1080,
    H: 1350,
    slots: [{ x: 80, y: 112, w: 920, h: 1060 }],
    capY: 1262,
  },
  collage: {
    W: 1350,
    H: 1140,
    slots: [
      { x: 110, y: 122, w: 553, h: 413 },
      { x: 687, y: 122, w: 553, h: 413 },
      { x: 110, y: 559, w: 553, h: 413 },
      { x: 687, y: 559, w: 553, h: 413 },
    ],
    capY: 1058,
  },
};
export const slotAspect = (mode) => GEOM[mode].slots[0].w / GEOM[mode].slots[0].h;

export const FRAME_STYLES = ['emerald', 'golden', 'floral', 'minimal'];

const cache = new Map();
export function loadImage(src) {
  if (!cache.has(src)) {
    cache.set(
      src,
      new Promise((res) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
      })
    );
  }
  return cache.get(src);
}

const DECO = {
  lilyTL: '/assets/deco/lily_tl.webp',
  lilyTR: '/assets/deco/lily_tr.webp',
  lilyBL: '/assets/deco/lily_bl.webp',
  lilyBR: '/assets/deco/lily_br.webp',
  sprig: '/assets/deco/sprig.webp',
  sprig2: '/assets/deco/sprig_tr.webp',
  corner: '/assets/deco/gold-corner.webp',
};
let decoReady;
export function preloadFrameAssets() {
  if (!decoReady) {
    decoReady = Promise.all(Object.entries(DECO).map(async ([k, v]) => [k, await loadImage(v)])).then(
      (pairs) => Object.fromEntries(pairs)
    );
    if (document.fonts?.load) {
      decoReady = Promise.all([
        decoReady,
        document.fonts.load('64px "Great Vibes"').catch(() => {}),
        document.fonts.load('600 40px "Cormorant Garamond"').catch(() => {}),
        document.fonts.load('600 40px "Playfair Display"').catch(() => {}),
      ]).then(([d]) => d);
    }
  }
  return decoReady;
}

// ---------- helpers ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function goldGrad(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#9c7426');
  g.addColorStop(0.22, '#ecd28a');
  g.addColorStop(0.45, '#b8892f');
  g.addColorStop(0.7, '#f5e0a0');
  g.addColorStop(1, '#a77b2c');
  return g;
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function drawCover(ctx, img, x, y, w, h) {
  const iw = img.videoWidth || img.naturalWidth || img.width;
  const ih = img.videoHeight || img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih);
  const sw = w / s,
    sh = h / s;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}
function drawImg(ctx, img, x, y, w, { flipX = false, flipY = false, rot = 0, alpha = 1 } = {}) {
  if (!img) return;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  ctx.drawImage(img, flipX ? -w : 0, flipY ? -h : 0, w, h);
  ctx.restore();
}
function paper(ctx, W, H, base = ['#fbf5ea', '#f3e8d3']) {
  const g = ctx.createRadialGradient(W / 2, H * 0.4, 50, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, base[0]);
  g.addColorStop(1, base[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const r = rng(11);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(120,90,40,${r() * 0.05})`;
    ctx.fillRect(r() * W, r() * H, 1.5, 1.5);
  }
}
function speckles(ctx, W, H, n, seed, color = '230,190,100', maxA = 0.8) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W,
      y = r() * H,
      rad = r() * 2.4 + 0.4;
    ctx.fillStyle = `rgba(${color},${r() * maxA})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}
function placeholder(ctx, x, y, w, h) {
  ctx.fillStyle = '#f2ebde';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#cdbfa8';
  const person = (cx, sc) => {
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.42, h * 0.16 * sc, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 1.02, h * 0.3 * sc, h * 0.42 * sc, 0, Math.PI, 0);
    ctx.fill();
  };
  ctx.save();
  rr(ctx, x, y, w, h, 2);
  ctx.clip();
  person(x + w * 0.4, 1);
  ctx.fillStyle = '#d6cab5';
  person(x + w * 0.64, 0.92);
  ctx.restore();
}
function drawShot(ctx, shot, s, radius = 0) {
  ctx.save();
  if (radius) {
    rr(ctx, s.x, s.y, s.w, s.h, radius);
    ctx.clip();
  }
  if (shot) drawCover(ctx, shot, s.x, s.y, s.w, s.h);
  else placeholder(ctx, s.x, s.y, s.w, s.h);
  // vignette halus
  const v = ctx.createRadialGradient(s.x + s.w / 2, s.y + s.h / 2, Math.min(s.w, s.h) * 0.45, s.x + s.w / 2, s.y + s.h / 2, Math.max(s.w, s.h) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(30,20,5,0.18)');
  ctx.fillStyle = v;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.restore();
}
function diamondRule(ctx, cx, y, half, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - 14, y);
  ctx.moveTo(cx + 14, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, y - 7);
  ctx.lineTo(cx + 7, y);
  ctx.lineTo(cx, y + 7);
  ctx.lineTo(cx - 7, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function gradCap(ctx, cx, cy, size, fill) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.45);
  ctx.lineTo(cx + size, cy);
  ctx.lineTo(cx, cy + size * 0.45);
  ctx.lineTo(cx - size, cy);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.55, cy + size * 0.2);
  ctx.lineTo(cx - size * 0.55, cy + size * 0.62);
  ctx.quadraticCurveTo(cx, cy + size * 0.95, cx + size * 0.55, cy + size * 0.62);
  ctx.lineTo(cx + size * 0.55, cy + size * 0.2);
  ctx.lineTo(cx, cy + size * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx + size * 0.78, cy, 3, size * 0.75);
  ctx.beginPath();
  ctx.arc(cx + size * 0.79, cy + size * 0.8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function laurel(ctx, cx, cy, len, dir, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.quadraticCurveTo(cx + dir * len * 0.5, cy - 14, cx + dir * len, cy - 2);
  ctx.stroke();
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const x = cx + dir * len * t;
    const y = cy - 14 * Math.sin(Math.PI * t) * 0.9;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(dir * (side * 0.9 - 0.3));
      ctx.beginPath();
      ctx.ellipse(0, -9 * side, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}
function fitText(ctx, text, maxW, font, size) {
  let s = size;
  do {
    ctx.font = font.replace('{s}', s);
    if (ctx.measureText(text).width <= maxW) break;
    s -= 2;
  } while (s > 20);
  return s;
}

// ---------- gaya bingkai ----------
const STYLE = {
  emerald(ctx, G, shots, cap, D) {
    const { W, H } = G;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#11503a');
    bg.addColorStop(0.5, '#0d3f2e');
    bg.addColorStop(1, '#092d20');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // tekstur daun samar
    const r = rng(5);
    ctx.save();
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(60,120,85,${0.05 + r() * 0.08})`;
      ctx.save();
      ctx.translate(r() * W, r() * H);
      ctx.rotate(r() * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, 14 + r() * 26, 5 + r() * 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    speckles(ctx, W, H, 220, 9, '232,196,110', 0.75);
    // bingkai emas ganda
    ctx.strokeStyle = goldGrad(ctx, 0, 0, W, H);
    ctx.lineWidth = 7;
    ctx.strokeRect(16, 16, W - 32, H - 32);
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    // ranting atas
    drawImg(ctx, D.sprig2, 34, 34, W * 0.2);
    drawImg(ctx, D.sprig2, W - 34, 34, W * 0.2, { flipX: true });
    // toga + laurel
    const gg = goldGrad(ctx, W / 2 - 60, 0, W / 2 + 60, 0);
    gradCap(ctx, W / 2, 62, 40, gg);
    laurel(ctx, W / 2 - 58, 72, 110, -1, gg);
    laurel(ctx, W / 2 + 58, 72, 110, 1, gg);
    // foto
    G.slots.forEach((s, i) => {
      ctx.fillStyle = '#f6eedd';
      ctx.fillRect(s.x - 10, s.y - 10, s.w + 20, s.h + 20);
      drawShot(ctx, shots[i], s);
      ctx.strokeStyle = goldGrad(ctx, s.x, s.y, s.x + s.w, s.y + s.h);
      ctx.lineWidth = 4;
      ctx.strokeRect(s.x - 10, s.y - 10, s.w + 20, s.h + 20);
    });
    // lili sudut bawah
    const lw = W * 0.27;
    drawImg(ctx, D.lilyBL, 6, H - lw * 1.17 - 6, lw);
    drawImg(ctx, D.lilyBR, W - lw - 6, H - lw * 1.14 - 6, lw);
    // keterangan
    const size = fitText(ctx, cap, W * 0.6, '{s}px "Great Vibes"', G.W > 1200 ? 78 : 74);
    ctx.font = `${size}px "Great Vibes"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = goldGrad(ctx, W * 0.2, 0, W * 0.8, 0);
    ctx.shadowColor = 'rgba(0,0,0,.35)';
    ctx.shadowBlur = 8;
    ctx.fillText(cap, W / 2, G.capY - 8);
    ctx.shadowBlur = 0;
    diamondRule(ctx, W / 2, G.capY + 42, 110, '#d9b866');
  },

  golden(ctx, G, shots, cap, D) {
    const { W, H } = G;
    paper(ctx, W, H);
    speckles(ctx, W, H, 120, 4, '205,160,70', 0.5);
    const gg = goldGrad(ctx, 0, 0, W, H);
    ctx.strokeStyle = gg;
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.lineWidth = 1.6;
    ctx.strokeRect(34, 34, W - 68, H - 68);
    G.slots.forEach((s, i) => {
      ctx.save();
      ctx.shadowColor = 'rgba(80,55,15,.28)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(s.x - 12, s.y - 12, s.w + 24, s.h + 24);
      ctx.restore();
      drawShot(ctx, shots[i], s);
      ctx.strokeStyle = gg;
      ctx.lineWidth = 3;
      ctx.strokeRect(s.x - 5, s.y - 5, s.w + 10, s.h + 10);
    });
    const cw = Math.min(W, H) * 0.2;
    drawImg(ctx, D.corner, 26, 26, cw);
    drawImg(ctx, D.corner, W - 26, 26, cw, { flipX: true });
    drawImg(ctx, D.corner, 26, H - 26, cw, { flipY: true });
    drawImg(ctx, D.corner, W - 26, H - 26, cw, { flipX: true, flipY: true });
    gradCap(ctx, W / 2, 62, 34, gg);
    const size = fitText(ctx, cap, W * 0.62, '{s}px "Great Vibes"', 76);
    ctx.font = `${size}px "Great Vibes"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = goldGrad(ctx, W * 0.2, 0, W * 0.8, 0);
    ctx.fillText(cap, W / 2, G.capY - 8);
    diamondRule(ctx, W / 2, G.capY + 42, 120, '#b8892f');
  },

  floral(ctx, G, shots, cap, D) {
    const { W, H } = G;
    paper(ctx, W, H, ['#fdf9f1', '#f4ecdc']);
    ctx.strokeStyle = goldGrad(ctx, 0, 0, W, H);
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    G.slots.forEach((s, i) => {
      ctx.save();
      ctx.shadowColor = 'rgba(60,45,20,.22)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(s.x - 10, s.y - 10, s.w + 20, s.h + 20);
      ctx.restore();
      drawShot(ctx, shots[i], s);
      ctx.strokeStyle = 'rgba(185,140,55,.8)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(s.x - 4, s.y - 4, s.w + 8, s.h + 8);
    });
    const lw = Math.min(W, H) * 0.3;
    drawImg(ctx, D.lilyTL, 0, 0, lw);
    drawImg(ctx, D.lilyTR, W - lw, 0, lw);
    drawImg(ctx, D.lilyBL, 0, H - lw * 1.17, lw * 0.92);
    drawImg(ctx, D.lilyBR, W - lw * 0.92, H - lw * 1.06, lw * 0.92);
    const size = fitText(ctx, cap, W * 0.55, '{s}px "Great Vibes"', 74);
    ctx.font = `${size}px "Great Vibes"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#134631';
    ctx.fillText(cap, W / 2, G.capY - 8);
    diamondRule(ctx, W / 2, G.capY + 42, 90, '#c29a45');
  },

  minimal(ctx, G, shots, cap) {
    const { W, H } = G;
    ctx.fillStyle = '#fbf7ef';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2.5;
    rr(ctx, 30, 30, W - 60, H - 60, 30);
    ctx.stroke();
    G.slots.forEach((s, i) => {
      drawShot(ctx, shots[i], s, 16);
      ctx.strokeStyle = 'rgba(201,162,74,.65)';
      ctx.lineWidth = 1.5;
      rr(ctx, s.x, s.y, s.w, s.h, 16);
      ctx.stroke();
    });
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#c9a24a';
    ctx.font = '600 22px "Mulish", sans-serif';
    ctx.fillText('✦', W / 2, 70);
    const text = cap.toUpperCase();
    const size = fitText(ctx, text, W * 0.75, '600 {s}px "Cormorant Garamond"', 50);
    ctx.font = `600 ${size}px "Cormorant Garamond"`;
    ctx.fillStyle = '#13392a';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '6px';
    ctx.fillText(text, W / 2, G.capY - 10);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
    ctx.font = '500 24px "Mulish", sans-serif';
    ctx.fillStyle = '#a8842f';
    const d = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillText(d.toUpperCase(), W / 2, G.capY + 40);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  },
};

/**
 * Gambar bingkai lengkap ke canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {{frame:string, mode:'single'|'collage', shots:(CanvasImageSource|null)[], caption:string, scale?:number}} o
 */
export async function renderFrame(canvas, { frame = 'emerald', mode = 'single', shots = [], caption = '', scale = 1 }) {
  const D = await preloadFrameAssets();
  const G = GEOM[mode];
  canvas.width = Math.round(G.W * scale);
  canvas.height = Math.round(G.H * scale);
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(scale, scale);
  (STYLE[frame] || STYLE.emerald)(ctx, G, shots, caption || 'Happy Graduation', D);
  ctx.restore();
  return canvas;
}
