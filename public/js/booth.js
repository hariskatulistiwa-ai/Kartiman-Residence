// Virtual Photobooth: kamera langsung → pilih bingkai → tulis ucapan → simpan/unduh/bagikan.
import { icons, hydrateIcons } from './icons.js';
import { renderFrame, slotAspect, preloadFrameAssets, drawCover } from './frames.js';
import { esc, $, $$, DECO, heroHTML, tilt } from './ui.js';

const booth = { mode: 'single', shots: [], frame: null, facing: 'user', stream: null, final: null, saved: null };

const stepsHTML = (n) => {
  const st = (i, label) => {
    const cls = i === n ? 'on' : i < n ? 'done pill' : 'pill';
    return `<span class="st ${cls}"><b>${i}</b>${label}${i < n ? icons.check : ''}</span>`;
  };
  return `<div class="steps">${st(1, 'Foto')}<i class="dash"></i>${st(2, 'Bingkai')}<i class="dash"></i>${st(3, 'Ucapan')}</div>`;
};

export function renderBooth(root, c) {
  const { S, gsap } = c;
  preloadFrameAssets();
  const frames = c.data.frames.length ? c.data.frames : [{ id: 'emerald', label: 'Emerald' }];
  if (!booth.frame || !frames.find((f) => f.id === booth.frame)) booth.frame = frames[0].id;
  let alive = true;

  const stopCamera = () => {
    booth.stream?.getTracks().forEach((t) => t.stop());
    booth.stream = null;
  };

  const show = (step) => {
    if (!alive) return;
    const doRender = () => {
      if (step === 1) stepCamera();
      else if (step === 2) stepFrame();
      else stepWish();
      hydrateIcons(root);
      scrollTo({ top: 0, behavior: 'instant' });
      gsap.fromTo(root.firstElementChild, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.55 });
    };
    if (root.firstElementChild) gsap.to(root.firstElementChild, { opacity: 0, x: -30, duration: 0.25, onComplete: doRender });
    else doRender();
  };

  /* ---------------- Langkah 1: Kamera ---------------- */
  function stepCamera() {
    booth.shots = [];
    booth.final = null;
    booth.saved = null;
    const ar = slotAspect(booth.mode);
    root.innerHTML = `
    <section class="page booth booth-cam">
      <img class="deco sway" src="${DECO.lilyTL}" style="left:-10px;top:-6px;width:28%" alt=""/>
      ${''}
      <img class="deco sway" src="${DECO.lilyBL}" style="left:-8px;bottom:calc(var(--nav-h) + 6px);width:24%" alt=""/>
      <img class="deco sway r" src="${DECO.sprig}" style="right:-14px;bottom:calc(var(--nav-h) + 20px);width:22%" alt=""/>
      <div class="page-inner">
        <h1 class="title-xl emerald-text" style="font-size:clamp(30px,9.4vw,44px);white-space:nowrap">${esc(S.boothTitle)}</h1>
        <div class="sub">${esc(S.boothSubtitle)}</div>
        <div class="orn star" style="margin-top:4px"><i>✦</i></div>
        <div class="cam-frame" style="--ar:${ar}">
          <div class="inner">
            <video playsinline muted autoplay></video>
            <div class="cam-placeholder"><div class="avatar"></div><p>Pratinjau kamera</p><small class="cam-msg">Mengaktifkan kamera…</small></div>
            <div class="shot-strip"></div>
            <div class="cam-countdown"></div>
            <div class="cam-flash"></div>
          </div>
          <img class="corner tl" src="${DECO.corner}" alt=""/><img class="corner tr" src="${DECO.corner}" alt=""/>
          <img class="corner bl" src="${DECO.corner}" alt=""/><img class="corner br" src="${DECO.corner}" alt=""/>
        </div>
        <div class="seg ${booth.mode === 'collage' ? 'right' : ''}">
          <span class="knob"></span>
          <button data-mode="single" class="${booth.mode === 'single' ? 'on' : ''}">${icons.single}<span>Single</span></button>
          <button data-mode="collage" class="${booth.mode === 'collage' ? 'on' : ''}">${icons.grid}<span>Kolase • 4 foto</span></button>
        </div>
        <div class="shutter-row">
          <label class="round-btn side l file-btn" title="Pilih dari galeri" aria-label="Pilih foto dari galeri">${icons.image}<input type="file" accept="image/*" ${booth.mode === 'collage' ? 'multiple' : ''}/></label>
          <button class="shutter" aria-label="Ambil foto">${icons.camera}</button>
          <button class="round-btn side r flip" aria-label="Ganti kamera">${icons.flip}</button>
        </div>
        ${stepsHTML(1)}
        <p class="booth-hint">Pilih <b>Single</b> atau <b>Kolase</b>, lalu tekan tombol kamera. Tidak bisa pakai kamera? Ketuk ikon galeri.</p>
      </div>
    </section>`;
    const q = (s) => $(s, root);
    const video = q('video');
    const msg = q('.cam-msg');
    const ph = q('.cam-placeholder');

    gsap.from(q('.cam-frame'), { scale: 0.92, opacity: 0, rotateX: 20, transformPerspective: 900, duration: 1, ease: 'back.out(1.4)' });
    gsap.from($$('.corner', root), { scale: 0, opacity: 0, rotate: -45, duration: 0.9, stagger: 0.08, delay: 0.3, ease: 'back.out(2)' });
    gsap.from([q('.seg'), q('.shutter-row'), q('.steps')], { y: 24, opacity: 0, stagger: 0.1, duration: 0.7, delay: 0.3 });

    async function startCamera() {
      stopCamera();
      if (!navigator.mediaDevices?.getUserMedia) {
        msg.textContent = 'Browser ini tidak mendukung kamera. Gunakan tombol galeri untuk memilih foto.';
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: booth.facing, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (!alive || !root.contains(video)) return stream.getTracks().forEach((t) => t.stop());
        booth.stream = stream;
        video.srcObject = stream;
        video.classList.toggle('mirror', booth.facing === 'user');
        await video.play().catch(() => {});
        gsap.to(ph, { opacity: 0, duration: 0.5, onComplete: () => (ph.style.display = 'none') });
        c.playMusic();
      } catch (err) {
        console.warn(err);
        ph.style.display = '';
        gsap.set(ph, { opacity: 1 });
        msg.innerHTML =
          err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Izinkan kamera di pengaturan browser, atau pilih foto dari galeri (ikon di kiri).'
            : 'Kamera tidak ditemukan. Pilih foto dari galeri (ikon di kiri).';
      }
    }
    startCamera();

    $$('.seg button', root).forEach((b) =>
      b.addEventListener('click', () => {
        booth.mode = b.dataset.mode;
        booth.shots = [];
        q('.shot-strip').innerHTML = '';
        $$('.seg button', root).forEach((x) => x.classList.toggle('on', x === b));
        q('.seg').classList.toggle('right', booth.mode === 'collage');
        q('.cam-frame').style.setProperty('--ar', slotAspect(booth.mode));
        q('.file-btn input').multiple = booth.mode === 'collage';
      })
    );
    q('.flip').addEventListener('click', () => {
      booth.facing = booth.facing === 'user' ? 'environment' : 'user';
      gsap.fromTo(q('.cam-frame .inner'), { rotateY: 90, transformPerspective: 800 }, { rotateY: 0, duration: 0.6 });
      startCamera();
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const countdown = async (n) => {
      const el = q('.cam-countdown');
      for (let i = n; i > 0; i--) {
        if (!alive) return;
        el.textContent = i;
        gsap.fromTo(el, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
        await sleep(800);
      }
      el.textContent = '';
    };
    const flash = () => gsap.fromTo(q('.cam-flash'), { opacity: 0.95 }, { opacity: 0, duration: 0.6 });
    const grab = () => {
      const ar = slotAspect(booth.mode);
      const w = booth.mode === 'single' ? 1104 : 830;
      const h = Math.round(w / ar);
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext('2d');
      if (booth.facing === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      drawCover(ctx, video, 0, 0, w, h);
      return cv;
    };
    const addThumb = (cv) => {
      const t = document.createElement('i');
      t.style.backgroundImage = `url(${cv.toDataURL('image/jpeg', 0.6)})`;
      q('.shot-strip').appendChild(t);
      gsap.from(t, { scale: 0, duration: 0.4, ease: 'back.out(2)' });
    };

    let busy = false;
    q('.shutter').addEventListener('click', async () => {
      if (busy) return;
      if (!booth.stream || !video.videoWidth) {
        q('.file-btn input').click();
        return;
      }
      busy = true;
      q('.shutter').classList.add('busy');
      const total = booth.mode === 'collage' ? 4 : 1;
      booth.shots = [];
      q('.shot-strip').innerHTML = '';
      for (let i = 0; i < total; i++) {
        await countdown(i === 0 ? 3 : 2);
        if (!alive) return;
        const cv = grab();
        flash();
        booth.shots.push(cv);
        if (total > 1) addThumb(cv);
        const r = q('.cam-frame').getBoundingClientRect();
        c.fx.burst(r.left + r.width / 2, r.top + r.height / 2, 24, 0.7);
        await sleep(450);
      }
      busy = false;
      stopCamera();
      show(2);
    });

    q('.file-btn input').addEventListener('change', async (e) => {
      const files = [...e.target.files].slice(0, booth.mode === 'collage' ? 4 : 1);
      if (!files.length) return;
      const imgs = await Promise.all(files.map(fileToCanvas));
      const ok = imgs.filter(Boolean);
      if (!ok.length) return c.toast('Foto tidak dapat dibaca, coba foto lain.', { type: 'error' });
      if (booth.mode === 'collage') while (ok.length < 4) ok.push(ok[ok.length % files.length] || ok[0]);
      booth.shots = ok;
      stopCamera();
      show(2);
    });
  }

  /* ---------------- Langkah 2: Bingkai ---------------- */
  function stepFrame() {
    if (!booth.shots.length) return show(1);
    const header = S.boothHeaderStyle === 'undangan' ? 'undangan' : 'booth';
    root.innerHTML = `
    <section class="page booth">
      ${heroHTML(header, S)}
      <div class="page-inner">
        <div class="section-head">
          <div class="rule"><span class="cam-badge">${icons.camera}</span></div>
          <h2 class="emerald-text">${esc(S.frameTitle)}</h2>
        </div>
        ${stepsHTML(2)}
        <div class="frame-preview ${booth.mode === 'single' ? 'portrait' : ''}"><canvas></canvas></div>
        <div class="frame-options">
          ${frames
            .map(
              (f) => `<button class="frame-opt ${f.id === booth.frame ? 'on' : ''}" data-frame="${esc(f.id)}"><span class="thumb"><canvas></canvas><span class="tick">${icons.check}</span></span><span>${esc(f.label)}</span></button>`
            )
            .join('')}
        </div>
        <div class="btn-row">
          <button class="btn btn-ghost" data-retake>${icons.refresh}<span>Foto ulang</span></button>
          <button class="btn btn-green" data-next><span>Lanjut • Tulis ucapan</span>${icons.arrowRight}</button>
        </div>
      </div>
      <img class="deco sway" src="${DECO.lilyBL}" style="left:-8px;bottom:calc(var(--nav-h) + 6px);width:22%;opacity:.9" alt=""/>
    </section>`;
    const prev = $('.frame-preview canvas', root);
    const draw = async () => {
      await renderFrame(prev, { frame: booth.frame, mode: booth.mode, shots: booth.shots, caption: S.frameCaption, scale: 0.6 });
    };
    draw().then(() => {
      gsap.from(prev, { rotateY: -25, rotateX: 10, scale: 0.9, opacity: 0, transformPerspective: 1000, duration: 1, ease: 'back.out(1.3)' });
    });
    tilt($('.frame-preview', root), 8);
    $$('.frame-opt', root).forEach((b, i) => {
      renderFrame($('canvas', b), { frame: b.dataset.frame, mode: booth.mode, shots: booth.shots, caption: S.frameCaption, scale: 0.12 });
      gsap.from(b, { y: 30, opacity: 0, duration: 0.6, delay: 0.3 + i * 0.08 });
      b.addEventListener('click', async () => {
        booth.frame = b.dataset.frame;
        $$('.frame-opt', root).forEach((x) => x.classList.toggle('on', x === b));
        await gsap.to(prev, { rotateY: 90, duration: 0.25, ease: 'power2.in', transformPerspective: 1000 });
        await draw();
        gsap.fromTo(prev, { rotateY: -90 }, { rotateY: 0, duration: 0.5, ease: 'back.out(1.6)' });
        const r = b.getBoundingClientRect();
        c.fx.burst(r.left + r.width / 2, r.top + r.height / 2, 16, 0.5);
      });
    });
    heroAnim(root, gsap);
    $('[data-retake]', root).addEventListener('click', () => show(1));
    $('[data-next]', root).addEventListener('click', async () => {
      const full = document.createElement('canvas');
      await renderFrame(full, { frame: booth.frame, mode: booth.mode, shots: booth.shots, caption: S.frameCaption, scale: 1 });
      booth.final = full;
      booth.saved = null;
      show(3);
    });
  }

  /* ---------------- Langkah 3: Ucapan ---------------- */
  function stepWish() {
    if (!booth.final) return show(booth.shots.length ? 2 : 1);
    const dataUrl = booth.final.toDataURL('image/jpeg', 0.85);
    root.innerHTML = `
    <section class="page booth wish">
      ${heroHTML('wish', S)}
      <div class="page-inner">
        <div class="section-head">
          <div class="rule" style="color:var(--gold-deep)"><span style="width:26px;height:26px;display:inline-block">${icons.cap}</span></div>
          <h2 class="emerald-text" style="margin-top:4px">${esc(S.wishTitle)}</h2>
        </div>
        <p class="lead" style="font-size:14.5px">${esc(S.wishText)}</p>
        ${stepsHTML(3)}
        <figure class="wish-figure" style="${booth.mode === 'collage' ? 'width:86%' : ''}">
          <div class="in"><img src="${dataUrl}" alt="Foto kenanganmu"/></div>
          <img class="deco sway r" src="${DECO.sprig}" alt=""/>
        </figure>
        <form class="wish-form" novalidate>
          <label class="field"><span>Nama kamu</span><input name="name" maxlength="60" autocomplete="name" placeholder="${esc(S.wishNamePlaceholder)}"/></label>
          <label class="field"><span>Ucapan untuk ${esc(S.nickname)}</span><textarea name="message" maxlength="600" rows="3" placeholder="${esc(S.wishMessagePlaceholder)}"></textarea></label>
          <p class="form-note">Dengan menekan <b>Simpan</b>, foto dan ucapan tampil di Live Greetings.</p>
          <div class="btn-row even">
            <button type="button" class="btn btn-ghost" data-dl>${icons.download}<span>Unduh</span></button>
            <button type="button" class="btn btn-ghost" data-share>${icons.share}<span>Bagikan</span></button>
          </div>
          <button type="submit" class="btn btn-green save-btn">${icons.image}<span>Simpan ke Live Greetings</span></button>
          <div class="after-save">
            <a class="btn btn-gold small" href="#/live">${icons.live}<span>Lihat Live</span></a>
            <button type="button" class="btn btn-ghost small" data-again>${icons.camera}<span>Foto lagi</span></button>
          </div>
        </form>
      </div>
      <img class="deco sway" src="${DECO.lilyBL}" style="left:-8px;bottom:calc(var(--nav-h) + 6px);width:24%" alt=""/>
      <img class="deco sway r" src="${DECO.lilyBR}" style="right:-8px;bottom:calc(var(--nav-h) + 6px);width:22%" alt=""/>
    </section>`;
    heroAnim(root, gsap);
    const fig = $('.wish-figure', root);
    gsap.from(fig, { rotate: -8, scale: 0.7, opacity: 0, duration: 1, ease: 'back.out(1.5)', delay: 0.2 });
    tilt(fig, 10);
    gsap.from($$('.field, .form-note, .btn-row, .save-btn', root), { y: 24, opacity: 0, stagger: 0.08, duration: 0.6, delay: 0.4 });

    const form = $('.wish-form', root);
    const nameI = form.elements.name;
    const msgI = form.elements.message;
    nameI.value = localStorage.getItem('guestName') || '';
    const fileName = () => `kenangan-wisuda-${(S.nickname || 'wisuda').toLowerCase().replace(/\W+/g, '-')}-${Date.now()}.jpg`;
    const toBlob = (cv, q = 0.92) => new Promise((r) => cv.toBlob(r, 'image/jpeg', q));

    $('[data-dl]', root).addEventListener('click', async () => {
      const blob = await toBlob(booth.final);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: fileName() });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      c.toast('Foto berhasil diunduh', { duration: 2200 });
    });
    $('[data-share]', root).addEventListener('click', async () => {
      const blob = await toBlob(booth.final);
      const file = new File([blob], fileName(), { type: 'image/jpeg' });
      const text = `${msgI.value.trim() || 'Happy Graduation!'} — untuk ${S.fullName}, ${S.degree} 🎓`;
      try {
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: S.siteTitle, text });
        else if (navigator.share) await navigator.share({ title: S.siteTitle, text, url: location.origin });
        else {
          await navigator.clipboard.writeText(location.origin);
          c.toast('Tautan website disalin. Tempel di WhatsApp/Instagram ya!', { duration: 2600 });
        }
      } catch (e) {
        if (e.name !== 'AbortError') c.toast('Tidak bisa membagikan dari browser ini. Coba Unduh.', { type: 'error' });
      }
    });
    $('[data-again]', root).addEventListener('click', () => show(1));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (booth.saved) return;
      let bad = false;
      for (const el of [nameI, msgI]) {
        const f = el.closest('.field');
        f.classList.remove('err');
        if (!el.value.trim()) {
          void f.offsetWidth;
          f.classList.add('err');
          bad = true;
        }
      }
      if (bad) return c.toast('Isi nama dan ucapanmu dulu ya 😊', { type: 'error', duration: 2400 });
      const btn = $('.save-btn', root);
      btn.disabled = true;
      $('span', btn).textContent = 'Menyimpan…';
      try {
        const photo = await toBlob(booth.final, 0.9);
        const tcv = document.createElement('canvas');
        const tw = 560;
        tcv.width = tw;
        tcv.height = Math.round((tw * booth.final.height) / booth.final.width);
        tcv.getContext('2d').drawImage(booth.final, 0, 0, tcv.width, tcv.height);
        const thumb = await toBlob(tcv, 0.82);
        const fd = new FormData();
        fd.append('name', nameI.value.trim());
        fd.append('message', msgI.value.trim());
        fd.append('frame', booth.frame);
        fd.append('mode', booth.mode);
        fd.append('photo', photo, 'photo.jpg');
        fd.append('thumb', thumb, 'thumb.jpg');
        const res = await fetch('/api/greetings', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
        booth.saved = data.greeting.id;
        c.mySaves.add(data.greeting.id);
        localStorage.setItem('guestName', nameI.value.trim());
        c.toast(S.toastSaved || 'Foto dan ucapan anda sudah masuk di galery live greetings', { duration: 3000 });
        btn.innerHTML = `${icons.check}<span>Tersimpan di Live Greetings</span>`;
        $('.after-save', root).classList.add('show');
        gsap.from($$('.after-save > *', root), { y: 16, opacity: 0, stagger: 0.1, duration: 0.5 });
        c.fx.confetti(110);
        const r = fig.getBoundingClientRect();
        c.fx.burst(r.left + r.width / 2, r.top + r.height / 2, 90, 1.1);
        nameI.readOnly = msgI.readOnly = true;
      } catch (err) {
        btn.disabled = false;
        $('span', btn).textContent = 'Simpan ke Live Greetings';
        c.toast(err.message || 'Gagal menyimpan, coba lagi.', { type: 'error' });
      }
    });
  }

  show(booth.shots.length && booth.final ? 3 : booth.shots.length ? 2 : 1);
  return () => {
    alive = false;
    stopCamera();
  };
}

function heroAnim(root, gsap) {
  const h = $('.hero', root);
  if (!h) return;
  gsap.from($('.h-photo', h), { y: 50, opacity: 0, duration: 1.1, onComplete: () => gsap.to($('.h-photo', h), { y: '-=6', duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' }) });
  gsap.from($$('.h-left > *', h), { x: -24, opacity: 0, stagger: 0.07, duration: 0.7, delay: 0.15 });
  gsap.from($('.h-wave', h), { yPercent: 50, opacity: 0, duration: 0.9 });
}

function fileToCanvas(file) {
  return new Promise((res) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.naturalWidth * s);
      cv.height = Math.round(img.naturalHeight * s);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      res(cv);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      res(null);
    };
    img.src = url;
  });
}
