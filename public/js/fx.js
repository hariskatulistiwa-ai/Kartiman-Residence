// Efek 3D & partikel (Three.js): debu emas berkilau, kelopak lili 3D yang berjatuhan,
// ledakan kilau, konfeti, dan toga 3D yang dilempar ke udara.
import * as THREE from 'three';

const noop = () => {};
const NOOP_API = { burst: noop, confetti: noop, capToss: noop, setMode: noop, hearts: noop };

export function createFX(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    console.warn('WebGL tidak tersedia, efek 3D dimatikan.', e);
    canvas.remove();
    return NOOP_API;
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600;
  const DPR = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;
  let worldH = 1,
    worldW = 1;

  scene.add(new THREE.AmbientLight(0xfff4e0, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1d0, 2.2);
  sun.position.set(3, 6, 8);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xffd98a, 1.1);
  rim.position.set(-5, -2, 4);
  scene.add(rim);

  // ---------- Debu emas ----------
  const DUST = reduce ? 90 : small ? 260 : 420;
  const dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(DUST * 3);
  const phase = new Float32Array(DUST);
  const size = new Float32Array(DUST);
  const speed = new Float32Array(DUST);
  const tint = new Float32Array(DUST * 3);
  const golds = [new THREE.Color('#f6dc8f'), new THREE.Color('#e6be62'), new THREE.Color('#fff3c9'), new THREE.Color('#d6a640')];
  for (let i = 0; i < DUST; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = Math.random() * 7 - 4;
    phase[i] = Math.random() * Math.PI * 2;
    size[i] = Math.random() < 0.08 ? 7 + Math.random() * 6 : 1.6 + Math.random() * 3.2;
    speed[i] = 0.12 + Math.random() * 0.35;
    const c = golds[(Math.random() * golds.length) | 0];
    tint.set([c.r, c.g, c.b], i * 3);
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  dustGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  dustGeo.setAttribute('aColor', new THREE.BufferAttribute(tint, 3));
  const dustMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: DPR }, uOpacity: { value: 0.9 }, uRange: { value: 18 } },
    vertexShader: /* glsl */ `
      attribute float aPhase; attribute float aSize; attribute float aSpeed; attribute vec3 aColor;
      uniform float uTime; uniform float uPx; uniform float uRange;
      varying float vTw; varying vec3 vColor; varying float vBig;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * aSpeed + uRange*0.5, uRange) - uRange*0.5;
        p.x += sin(uTime * 0.35 + aPhase) * 0.35;
        p.z += cos(uTime * 0.25 + aPhase) * 0.3;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vTw = 0.45 + 0.55 * sin(uTime * (1.2 + aSpeed*3.0) + aPhase * 3.0);
        vColor = aColor; vBig = step(6.5, aSize);
        gl_PointSize = aSize * uPx * (9.0 / -mv.z) * (0.75 + 0.35 * vTw);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying float vTw; varying vec3 vColor; varying float vBig;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        float core = smoothstep(0.5, 0.0, d);
        float glow = pow(core, 2.2);
        float star = vBig * (smoothstep(0.06, 0.0, abs(c.x)) + smoothstep(0.06, 0.0, abs(c.y))) * smoothstep(0.5, 0.0, d) * 0.9;
        float a = (glow + star) * vTw * uOpacity;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor * (1.0 + star), a);
      }`,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ---------- Kelopak lili 3D ----------
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, -0.5);
  petalShape.bezierCurveTo(0.32, -0.25, 0.3, 0.25, 0, 0.55);
  petalShape.bezierCurveTo(-0.3, 0.25, -0.32, -0.25, 0, -0.5);
  const petalGeo = new THREE.ShapeGeometry(petalShape, 10);
  {
    const p = petalGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      p.setZ(i, x * x * 1.4 + y * y * 0.25);
    }
    petalGeo.computeVertexNormals();
  }
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xfff7ea,
    emissive: 0xf0dcb4,
    emissiveIntensity: 0.25,
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });
  const PETALS = reduce ? 0 : small ? 11 : 16;
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, Math.max(PETALS, 1));
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const pState = [];
  for (let i = 0; i < PETALS; i++) pState.push(newPetal(true));
  scene.add(petals);
  function newPetal(anywhere) {
    return {
      x: (Math.random() - 0.5) * (worldW || 8) * 1.1,
      y: anywhere ? (Math.random() - 0.5) * (worldH || 14) : (worldH || 14) / 2 + 1 + Math.random() * 3,
      z: Math.random() * 4 - 2.5,
      vy: 0.35 + Math.random() * 0.4,
      rx: Math.random() * 6,
      ry: Math.random() * 6,
      rz: Math.random() * 6,
      sx: 0.6 + Math.random() * 1.6,
      sy: 0.4 + Math.random() * 1.2,
      s: 0.22 + Math.random() * 0.2,
      ph: Math.random() * 6,
    };
  }
  let petalsOn = 1,
    petalsTarget = 1;

  // ---------- Kilau ledakan ----------
  const SPARK = 520;
  const sGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(SPARK * 3);
  const sLife = new Float32Array(SPARK);
  const sSize = new Float32Array(SPARK);
  const sCol = new Float32Array(SPARK * 3);
  const sVel = new Float32Array(SPARK * 3);
  const sMax = new Float32Array(SPARK);
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute('aLife', new THREE.BufferAttribute(sLife, 1));
  sGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  sGeo.setAttribute('aColor', new THREE.BufferAttribute(sCol, 3));
  const sMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPx: { value: DPR } },
    vertexShader: /* glsl */ `
      attribute float aLife; attribute float aSize; attribute vec3 aColor; uniform float uPx;
      varying float vL; varying vec3 vC;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix*mv;
        vL = aLife; vC = aColor; gl_PointSize = aSize * uPx * (10.0 / -mv.z) * (0.4 + aLife); }`,
    fragmentShader: /* glsl */ `
      varying float vL; varying vec3 vC;
      void main(){ vec2 c = gl_PointCoord-0.5; float d=length(c);
        float a = pow(smoothstep(0.5,0.0,d),1.8) + (smoothstep(0.05,0.0,abs(c.x))+smoothstep(0.05,0.0,abs(c.y)))*smoothstep(0.5,0.1,d)*0.6;
        a *= clamp(vL,0.0,1.0); if(a<0.01) discard; gl_FragColor = vec4(vC, a); }`,
  });
  scene.add(new THREE.Points(sGeo, sMat));
  let sCursor = 0;

  // ---------- Konfeti ----------
  const CONF = reduce ? 40 : 170;
  const confGeo = new THREE.PlaneGeometry(0.12, 0.22);
  const confMat = new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.55, side: THREE.DoubleSide });
  const conf = new THREE.InstancedMesh(confGeo, confMat, CONF);
  conf.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const confColors = ['#e9c86e', '#d4a542', '#f7e6b0', '#0f4a33', '#ffffff', '#c9a24a', '#1d6a4b'].map((c) => new THREE.Color(c));
  const cState = [];
  for (let i = 0; i < CONF; i++) {
    conf.setColorAt(i, confColors[i % confColors.length]);
    cState.push({ alive: false });
  }
  conf.instanceColor.needsUpdate = true;
  scene.add(conf);

  // ---------- Toga 3D ----------
  const capProto = buildCap();
  const caps = [];

  const dummy = new THREE.Object3D();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

  function resize() {
    const w = innerWidth,
      h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    worldH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    worldW = worldH * camera.aspect;
    dustMat.uniforms.uRange.value = worldH * 1.4;
  }
  resize();
  addEventListener('resize', resize);

  // Paralaks dari sentuhan / kemiringan HP
  const look = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener(
    'pointermove',
    (e) => {
      look.tx = (e.clientX / innerWidth - 0.5) * 0.5;
      look.ty = (e.clientY / innerHeight - 0.5) * 0.4;
    },
    { passive: true }
  );
  addEventListener(
    'deviceorientation',
    (e) => {
      if (e.gamma == null) return;
      look.tx = THREE.MathUtils.clamp(e.gamma / 45, -1, 1) * 0.35;
      look.ty = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1) * 0.25;
    },
    { passive: true }
  );

  function toWorld(x, y, z = 0) {
    const d = camera.position.z - z;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return new THREE.Vector3((x / innerWidth - 0.5) * h * camera.aspect, -(y / innerHeight - 0.5) * h, z);
  }

  // ---------- API ----------
  function burst(x = innerWidth / 2, y = innerHeight / 2, n = 60, power = 1) {
    const o = toWorld(x, y, 1);
    for (let k = 0; k < n; k++) {
      const i = sCursor++ % SPARK;
      const a = Math.random() * Math.PI * 2;
      const el = (Math.random() - 0.5) * Math.PI;
      const sp = (1.5 + Math.random() * 4.5) * power;
      sPos.set([o.x, o.y, o.z], i * 3);
      sVel.set([Math.cos(a) * Math.cos(el) * sp, Math.sin(a) * Math.cos(el) * sp + 1.2, Math.sin(el) * sp * 0.6], i * 3);
      sMax[i] = sLife[i] = 0.8 + Math.random() * 1.1;
      sSize[i] = 3 + Math.random() * 7;
      const c = golds[(Math.random() * golds.length) | 0];
      sCol.set([c.r, c.g, c.b], i * 3);
    }
  }
  function confetti(n = 120, fromTop = true) {
    let spawned = 0;
    for (let i = 0; i < CONF && spawned < n; i++) {
      const c = cState[i];
      if (c.alive) continue;
      spawned++;
      Object.assign(c, {
        alive: true,
        x: (Math.random() - 0.5) * worldW,
        y: fromTop ? worldH / 2 + Math.random() * worldH * 0.6 : -worldH / 2,
        z: Math.random() * 3 - 1,
        vx: (Math.random() - 0.5) * 1.2,
        vy: fromTop ? -(1 + Math.random() * 1.4) : 7 + Math.random() * 5,
        rx: Math.random() * 6,
        ry: Math.random() * 6,
        rz: Math.random() * 6,
        wx: 2 + Math.random() * 6,
        wy: 2 + Math.random() * 6,
        ph: Math.random() * 6,
      });
    }
  }
  function capToss(n = small ? 6 : 8) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const g = capProto.clone();
      const s = 0.55 + Math.random() * 0.35;
      g.scale.setScalar(s);
      g.position.set((Math.random() - 0.5) * worldW * 0.8, -worldH / 2 - 1, Math.random() * 3 - 1);
      g.userData = {
        vx: (Math.random() - 0.5) * 2.4,
        vy: worldH * (1.1 + Math.random() * 0.25),
        vr: new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6),
        delay: i * 0.08,
      };
      g.visible = false;
      scene.add(g);
      caps.push(g);
    }
  }
  function hearts(x, y, n = 8) {
    burst(x, y, n * 3, 0.7);
  }
  const MODES = {
    cover: { dust: 1, petals: 0.6 },
    cerita: { dust: 0.75, petals: 0.5 },
    'terima-kasih': { dust: 0.8, petals: 1 },
    photobooth: { dust: 0.35, petals: 0 },
    live: { dust: 0.6, petals: 0.35 },
    penutup: { dust: 1, petals: 1 },
  };
  let dustTarget = 1;
  function setMode(name) {
    const m = MODES[name] || MODES.cover;
    dustTarget = m.dust;
    petalsTarget = m.petals;
  }

  // ---------- loop ----------
  let last = performance.now();
  let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    dustMat.uniforms.uTime.value = t;
    dustMat.uniforms.uOpacity.value += (dustTarget * 0.9 - dustMat.uniforms.uOpacity.value) * 0.04;
    petalsOn += (petalsTarget - petalsOn) * 0.03;
    petalMat.opacity = 0.92 * petalsOn;
    petals.visible = petalsOn > 0.02;

    look.x += (look.tx - look.x) * 0.05;
    look.y += (look.ty - look.y) * 0.05;
    dust.rotation.y = look.x * 0.6;
    dust.rotation.x = look.y * 0.4;

    // kelopak
    for (let i = 0; i < PETALS; i++) {
      const p = pState[i];
      p.y -= p.vy * dt;
      p.x += Math.sin(t * 0.8 + p.ph) * 0.006 + look.x * 0.004;
      p.rx += dt * p.sx * 0.6;
      p.ry += dt * p.sy * 0.5;
      p.rz += dt * 0.3;
      if (p.y < -worldH / 2 - 1) Object.assign(p, newPetal(false));
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;

    // kilau
    let anySpark = false;
    for (let i = 0; i < SPARK; i++) {
      if (sLife[i] <= 0) continue;
      anySpark = true;
      sLife[i] -= dt;
      sVel[i * 3] *= 0.97;
      sVel[i * 3 + 1] = sVel[i * 3 + 1] * 0.97 - 2.4 * dt;
      sVel[i * 3 + 2] *= 0.97;
      sPos[i * 3] += sVel[i * 3] * dt;
      sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt;
      sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
      if (sLife[i] <= 0) sLife[i] = 0;
    }
    if (anySpark) {
      sGeo.attributes.position.needsUpdate = true;
      sGeo.attributes.aLife.needsUpdate = true;
      sGeo.attributes.aSize.needsUpdate = true;
      sGeo.attributes.aColor.needsUpdate = true;
    }

    // konfeti
    for (let i = 0; i < CONF; i++) {
      const c = cState[i];
      if (!c.alive) {
        conf.setMatrixAt(i, hidden);
        continue;
      }
      c.vy = Math.max(c.vy - 4.2 * dt, -1.6);
      c.vx *= 0.99;
      c.x += (c.vx + Math.sin(t * 2 + c.ph) * 0.4) * dt;
      c.y += c.vy * dt;
      c.rx += c.wx * dt;
      c.ry += c.wy * dt;
      if (c.y < -worldH / 2 - 1) c.alive = false;
      dummy.position.set(c.x, c.y, c.z);
      dummy.rotation.set(c.rx, c.ry, c.rz);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      conf.setMatrixAt(i, dummy.matrix);
    }
    conf.instanceMatrix.needsUpdate = true;

    // toga
    for (let i = caps.length - 1; i >= 0; i--) {
      const g = caps[i];
      const u = g.userData;
      if (u.delay > 0) {
        u.delay -= dt;
        continue;
      }
      g.visible = true;
      u.vy -= worldH * 0.9 * dt;
      g.position.x += u.vx * dt;
      g.position.y += u.vy * dt;
      g.rotation.x += u.vr.x * dt;
      g.rotation.y += u.vr.y * dt;
      g.rotation.z += u.vr.z * dt;
      if (u.vy < 0 && g.position.y < -worldH / 2 - 2) {
        scene.remove(g);
        caps.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }
  frame();

  // kilau kecil setiap kali layar disentuh
  addEventListener(
    'pointerdown',
    (e) => {
      if (e.target.closest('input, textarea, video')) return;
      burst(e.clientX, e.clientY, 14, 0.45);
    },
    { passive: true }
  );

  return { burst, confetti, capToss, setMode, hearts };
}

function buildCap() {
  const g = new THREE.Group();
  const black = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.45, metalness: 0.15 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe0b450, roughness: 0.3, metalness: 0.85, emissive: 0x3a2800, emissiveIntensity: 0.4 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 1.5), black);
  board.rotation.y = Math.PI / 4;
  g.add(board);
  const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.42, 28, 1, true), black);
  skull.position.y = -0.24;
  skull.material.side = THREE.DoubleSide;
  g.add(skull);
  const btn = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), gold);
  btn.position.y = 0.06;
  g.add(btn);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.75, 6), gold);
  cord.rotation.z = Math.PI / 2;
  cord.position.set(0.37, 0.06, 0);
  g.add(cord);
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 6), gold);
  drop.position.set(0.74, -0.14, 0);
  g.add(drop);
  const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.32, 12), gold);
  tassel.position.set(0.74, -0.46, 0);
  g.add(tassel);
  return g;
}
