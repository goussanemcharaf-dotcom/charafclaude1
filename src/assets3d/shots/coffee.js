// Flat white with latte-art heart, linen table, morning light through blinds.
import { THREE, setup, cyclorama, lathe, canvasTex, rand, sun, camera, mats, shade, post } from '../lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export async function render({ width, height }) {
  const { renderer, scene } = setup({ width, height, bg: '#efe6da', exposure: 1.08, env: 0.6 });
  const linen = canvasTex(1024, 1024, (c, w, h) => {
    const R = rand(4); c.fillStyle = '#ede3d5'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(120,100,80,${0.03 + R() * 0.05})`; c.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 2) { c.fillStyle = `rgba(255,255,255,${0.02 + R() * 0.05})`; c.fillRect(x, 0, 1, h); }
  }, { repeat: [6, 6] });
  const table = cyclorama({ color: '#eadfce', radius: 18, z: -16 });
  table.material.map = linen; table.material.needsUpdate = true;
  scene.add(table);
  const g = new THREE.Group(); scene.add(g);
  // saucer
  const saucer = new THREE.Mesh(lathe([[0, 0], [2.2, 0, 0.1], [3.6, 0.28, 0.2], [3.75, 0.42, 0.06], [3.62, 0.44], [2.35, 0.24, 0.3], [0, 0.2]], { seg: 180, fillet: 8 }), mats.ceramic('#f5f2ec'));
  saucer.material.side = THREE.DoubleSide; g.add(saucer);
  // cup (outer up, over the rim, inner down)
  const cup = new THREE.Mesh(lathe([[0, 0.2], [1.05, 0.2, 0.1], [1.3, 0.5, 0.3], [1.95, 2.9, 0.6], [2.02, 3.2, 0.07], [1.9, 3.22, 0.06], [1.82, 2.9], [1.18, 0.62, 0.35], [0, 0.55]], { seg: 180, fillet: 10 }), mats.ceramic('#f6f3ee'));
  cup.material.side = THREE.DoubleSide; g.add(cup);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.17, 24, 64, Math.PI * 1.15), mats.ceramic('#f6f3ee'));
  handle.position.set(2.05, 1.95, 0); handle.rotation.z = -Math.PI / 2 - 0.5; g.add(handle);
  // coffee surface with latte-art heart
  const art = canvasTex(1024, 1024, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    const gr = c.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
    gr.addColorStop(0, '#7a4a2a'); gr.addColorStop(0.75, '#6b3d20'); gr.addColorStop(0.93, '#b98555'); gr.addColorStop(1, '#8a5a36');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f3e6d4';
    const heart = (s, oy) => { c.beginPath(); c.moveTo(cx, cy + 190 * s + oy); c.bezierCurveTo(cx - 330 * s, cy - 10 * s + oy, cx - 190 * s, cy - 300 * s + oy, cx, cy - 120 * s + oy); c.bezierCurveTo(cx + 190 * s, cy - 300 * s + oy, cx + 330 * s, cy - 10 * s + oy, cx, cy + 190 * s + oy); c.fill(); };
    heart(1, 20); c.fillStyle = '#c99b6f'; heart(0.62, 50); c.fillStyle = '#f3e6d4'; heart(0.4, 64);
    c.strokeStyle = '#f3e6d4'; c.lineWidth = 16; c.beginPath(); c.moveTo(cx, cy - 330); c.lineTo(cx, cy + 250); c.stroke();
  });
  const surf = new THREE.Mesh(new THREE.CircleGeometry(1.8, 96), new THREE.MeshPhysicalMaterial({ map: art, roughness: 0.25, clearcoat: 0.8 }));
  surf.rotation.x = -Math.PI / 2; surf.rotation.z = 0.12; surf.position.y = 2.72; g.add(surf);
  // book behind
  const book = new THREE.Group();
  const cover = new THREE.Mesh(new RoundedBoxGeometry(7.2, 0.7, 9.6, 2, 0.06), new THREE.MeshStandardMaterial({ color: '#b8654a', roughness: 0.8 }));
  const pages = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.56, 9.3), new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: 0.9 }));
  pages.position.set(0.2, 0, 0); book.add(cover, pages); book.position.set(-5.2, 0.35, -5.5); book.rotation.y = 0.35; g.add(book);
  shade(g);
  // light through blinds
  const key = sun({ intensity: 5.2, color: '#ffe3bf', pos: [-15, 14, -6], target: [0, 1, 0], extent: 18, radius: 4, blurSamples: 20 });
  scene.add(key, key.target);
  const blinds = new THREE.Group();
  for (let i = -12; i <= 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(40, 0.55, 0.1), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })); m.position.set(0, i * 1.25, 0); m.castShadow = true; blinds.add(m); }
  const dir = new THREE.Vector3(-15, 14, -6).normalize();
  blinds.position.copy(new THREE.Vector3(0, 1, 0).add(dir.clone().multiplyScalar(12)));
  blinds.lookAt(blinds.position.clone().add(dir)); blinds.rotateZ(0.2);
  scene.add(blinds);
  scene.add(new THREE.HemisphereLight('#fff6ea', '#d8c6ae', 0.3));
  const cam = camera(width, height, { fov: 26, pos: [3.5, 17, 17], look: [-0.6, 1.2, -0.6] });
  renderer.render(scene, cam);
  return post(renderer.domElement, { vignette: 0.24, grain: 0.035, seed: 8 });
}
