// Shared "photo studio" for the product stills.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { THREE };

export function setup({ width, height, bg = '#e8dccd', exposure = 1, env = 0.7, tone = 'agx' }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = tone === 'neutral' ? THREE.NeutralToneMapping : tone === 'aces' ? THREE.ACESFilmicToneMapping : THREE.AgXToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  document.body.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = env;
  return { renderer, scene };
}

// Seamless studio backdrop: floor that curves up into a back wall.
export function cyclorama({ color = '#e3cdb4', width = 80, depth = 40, height = 40, radius = 12, roughness = 1, z = -10 } = {}) {
  const steps = 48;
  // shape is in (zLocal, y): fix arc so it goes from floor (0,0) to wall (0,radius)
  const pts = [[depth, 0], [0.0001, 0]];
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push([-Math.sin(a) * radius, radius - Math.cos(a) * radius]);
  }
  pts.push([-radius, height]);
  const geo = new THREE.BufferGeometry();
  const pos = [], uv = [], idx = [];
  const nx = 2;
  let acc = 0; const lens = [0];
  for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(acc); }
  for (let i = 0; i < pts.length; i++) {
    for (let j = 0; j < nx; j++) {
      const x = (j / (nx - 1) - 0.5) * width;
      pos.push(x, pts[i][1], pts[i][0] + z);
      uv.push(j / (nx - 1), lens[i] / acc);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * nx, b = (i + 1) * nx;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 }));
  mesh.receiveShadow = true;
  return mesh;
}

// Polyline with per-vertex fillet radius -> smooth 2D profile (x=radius, y=height).
export function roundPath(pts, seg = 14) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y, r = 0] = pts[i];
    if (!r || i === 0 || i === pts.length - 1) { out.push(new THREE.Vector2(x, y)); continue; }
    const P = new THREE.Vector2(x, y);
    const A = new THREE.Vector2(pts[i - 1][0], pts[i - 1][1]);
    const B = new THREE.Vector2(pts[i + 1][0], pts[i + 1][1]);
    const u = A.clone().sub(P), v = B.clone().sub(P);
    const lu = u.length(), lv = v.length();
    u.normalize(); v.normalize();
    const th = Math.acos(THREE.MathUtils.clamp(u.dot(v), -1, 1));
    let d = r / Math.tan(th / 2);
    d = Math.min(d, lu * 0.5, lv * 0.5);
    const rr = d * Math.tan(th / 2);
    const S = P.clone().add(u.clone().multiplyScalar(d));
    const E = P.clone().add(v.clone().multiplyScalar(d));
    const bis = u.clone().add(v).normalize();
    const C = P.clone().add(bis.multiplyScalar(rr / Math.sin(th / 2)));
    let a0 = Math.atan2(S.y - C.y, S.x - C.x), a1 = Math.atan2(E.y - C.y, E.x - C.x);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= seg; k++) {
      const a = a0 + (da * k) / seg;
      out.push(new THREE.Vector2(C.x + Math.cos(a) * rr, C.y + Math.sin(a) * rr));
    }
  }
  return out;
}

export function lathe(pts, { seg = 160, fillet = 14 } = {}) {
  const g = new THREE.LatheGeometry(roundPath(pts, fillet), seg);
  g.computeVertexNormals();
  return g;
}

export function canvasTex(w, h, draw, { srgb = true, repeat } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}

// Seeded random for textures.
export function rand(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let r = Math.imul(a ^ (a >>> 15), 1 | a); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

// Travertine / plaster: soft mottling + horizontal pores.
export function stoneTex({ base = '#ece4d8', seed = 3, pores = true } = {}) {
  return canvasTex(1024, 1024, (g, w, h) => {
    const R = rand(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = R() * w, y = R() * h, r = 8 + R() * 60;
      g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '120,100,80'},${0.015 + R() * 0.025})`;
      g.beginPath(); g.ellipse(x, y, r * 2.2, r * 0.5, 0, 0, Math.PI * 2); g.fill();
    }
    if (pores) for (let i = 0; i < 420; i++) {
      const x = R() * w, y = R() * h, l = 2 + R() * 14;
      g.fillStyle = `rgba(110,90,70,${0.03 + R() * 0.06})`;
      g.beginPath(); g.ellipse(x, y, l, 0.8 + R(), 0, 0, Math.PI * 2); g.fill();
    }
  }, { repeat: [1, 1] });
}

// Palm frond silhouette (alpha) for sun gobo shadows.
export function palmGobo({ size = 26, seed = 7 } = {}) {
  const tex = canvasTex(1024, 1024, (g, w, h) => {
    const R = rand(seed);
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#fff';
    const fronds = [
      { x0: 0.05, y0: 0.95, x1: 0.95, y1: 0.18, bend: 0.22 },
      { x0: 0.0, y0: 0.55, x1: 0.78, y1: 0.02, bend: 0.16 },
      { x0: 0.25, y0: 1.02, x1: 1.02, y1: 0.62, bend: 0.1 },
    ];
    for (const f of fronds) {
      const N = 44;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const bx = f.x0 + (f.x1 - f.x0) * t + Math.sin(t * Math.PI) * f.bend * 0.3;
        const by = f.y0 + (f.y1 - f.y0) * t - Math.sin(t * Math.PI) * f.bend;
        const ang = Math.atan2(f.y1 - f.y0, f.x1 - f.x0);
        const len = (0.2 + 0.25 * Math.sin(t * Math.PI)) * w * (0.8 + R() * 0.3);
        for (const side of [-1, 1]) {
          const a = ang + side * (0.9 + R() * 0.25) - 0.35 * side * t;
          g.beginPath();
          g.moveTo(bx * w, by * h);
          const mx = bx * w + Math.cos(a) * len * 0.5, my = by * h + Math.sin(a) * len * 0.5;
          const ex = bx * w + Math.cos(a + side * 0.18) * len, ey = by * h + Math.sin(a + side * 0.18) * len;
          g.quadraticCurveTo(mx + Math.cos(a + Math.PI / 2) * 9, my + Math.sin(a + Math.PI / 2) * 9, ex, ey);
          g.quadraticCurveTo(mx - Math.cos(a + Math.PI / 2) * 9, my - Math.sin(a + Math.PI / 2) * 9, bx * w, by * h);
          g.fill();
        }
      }
      g.lineWidth = 9; g.strokeStyle = '#fff';
      g.beginPath(); g.moveTo(f.x0 * w, f.y0 * h);
      g.quadraticCurveTo(((f.x0 + f.x1) / 2) * w, ((f.y0 + f.y1) / 2 - f.bend) * h, f.x1 * w, f.y1 * h); g.stroke();
    }
  }, { srgb: false });
  const mat = new THREE.MeshBasicMaterial({ alphaMap: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, colorWrite: false, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ alphaMap: tex, alphaTest: 0.5, depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  mesh.customDistanceMaterial = undefined;
  return mesh;
}

export function sun({ color = '#ffe2bd', intensity = 3, pos = [-10, 16, 10], target = [0, 2, 0], extent = 14, mapSize = 2048, radius = 6, blurSamples = 20, bias = -0.0004 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos);
  l.target.position.set(...target);
  l.castShadow = true;
  l.shadow.mapSize.set(mapSize, mapSize);
  const c = l.shadow.camera;
  c.left = -extent; c.right = extent; c.top = extent; c.bottom = -extent; c.near = 1; c.far = 80;
  l.shadow.radius = radius;
  l.shadow.blurSamples = blurSamples;
  l.shadow.bias = bias;
  l.shadow.normalBias = 0.02;
  return l;
}

export function camera(width, height, { fov = 24, pos = [0, 6, 24], look = [0, 5, 0] } = {}) {
  const cam = new THREE.PerspectiveCamera(fov, width / height, 0.1, 400);
  cam.position.set(...pos);
  cam.lookAt(...look);
  return cam;
}

export const mats = {
  gold: () => new THREE.MeshStandardMaterial({ color: '#d9b877', metalness: 1, roughness: 0.2 }),
  rubber: (c = '#161616') => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.48, clearcoat: 0.3, clearcoatRoughness: 0.5 }),
  glass: (tint = '#ffffff', dist = 3, rough = 0.03) => new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 1.4, roughness: rough, ior: 1.5, attenuationColor: new THREE.Color(tint), attenuationDistance: dist, specularIntensity: 1, envMapIntensity: 1.3 }),
  matte: (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }),
  ceramic: (c = '#f4f1ec') => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
};

export function shade(o, cast = true, receive = true) {
  o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = receive; } });
  return o;
}

// Photographic finish: soft vignette + fine monochrome grain, on a 2D copy.
export function post(glCanvas, { vignette = 0.22, grain = 0.035, seed = 11, warm = 0 } = {}) {
  const w = glCanvas.width, h = glCanvas.height;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.drawImage(glCanvas, 0, 0);
  if (vignette) {
    const grad = g.createRadialGradient(w / 2, h * 0.46, Math.min(w, h) * 0.25, w / 2, h / 2, Math.hypot(w, h) * 0.62);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(20,12,6,${vignette})`);
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  }
  if (warm) { g.fillStyle = `rgba(255,170,90,${warm})`; g.globalCompositeOperation = 'soft-light'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
  if (grain) {
    const img = g.getImageData(0, 0, w, h);
    const d = img.data;
    const R = rand(seed);
    for (let i = 0; i < d.length; i += 4) {
      const n = (R() + R() + R() - 1.5) * 255 * grain;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
  }
  return c;
}
