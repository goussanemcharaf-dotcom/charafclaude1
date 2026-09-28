// Studio condenser microphone, dark room, violet rim light (voice-over).
import { THREE, setup, cyclorama, lathe, canvasTex, camera, shade, post } from '../lib.js';

export async function render({ width, height }) {
  const { renderer, scene } = setup({ width, height, bg: '#0f0f14', exposure: 1.0, env: 0.18 });
  scene.add(cyclorama({ color: '#16161c', radius: 14, z: -14, roughness: 0.9 }));
  // studio glow behind
  const glow = canvasTex(1024, 1024, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(120,90,230,0.55)'); gr.addColorStop(0.45, 'rgba(70,50,150,0.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  gl.position.set(2, 12, -12); scene.add(gl);
  const mic = new THREE.Group(); mic.position.set(0, 3.2, 0); mic.rotation.z = 0.05; mic.rotation.x = 0.06; scene.add(mic);
  const black = new THREE.MeshPhysicalMaterial({ color: '#141418', roughness: 0.42, metalness: 0.6, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const body = new THREE.Mesh(lathe([[0, 0], [0.95, 0, 0.1], [1.0, 0.3], [1.0, 5.2], [1.05, 5.25], [0, 5.25]]), black); mic.add(body);
  const ring = new THREE.Mesh(lathe([[0, 5.2], [1.1, 5.2], [1.1, 5.5], [0, 5.5]]), new THREE.MeshStandardMaterial({ color: '#c9a86a', metalness: 1, roughness: 0.25 })); mic.add(ring);
  // grille: fine wire mesh (alpha) over a dark capsule
  const mesh = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 7; for (let i = -w; i <= 2 * w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); } }, { srgb: false, repeat: [34, 22] });
  const grilleGeo = lathe([[0, 5.45], [1.12, 5.45], [1.12, 8.75, 1.12], [0, 8.75]], { seg: 180, fillet: 36 });
  const grille = new THREE.Mesh(grilleGeo, new THREE.MeshStandardMaterial({ color: '#c8c8d2', metalness: 1, roughness: 0.3, alphaMap: mesh, alphaTest: 0.5, side: THREE.DoubleSide }));
  mic.add(grille);
  const capsule = new THREE.Mesh(lathe([[0, 5.5], [1.0, 5.5], [1.0, 8.62, 1.0], [0, 8.62]], { fillet: 30 }), new THREE.MeshStandardMaterial({ color: '#07070a', roughness: 0.9, metalness: 0.1 }));
  mic.add(capsule);
  // shock mount
  const mount = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.12, 20, 120), black); mount.rotation.x = Math.PI / 2; mount.position.y = 2.2; mic.add(mount);
  const mount2 = mount.clone(); mount2.position.y = 0.5; mic.add(mount2);
  const band = new THREE.MeshStandardMaterial({ color: '#2a2a33', roughness: 0.7 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    for (const y of [2.2, 0.5]) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), band);
      s.position.set(Math.cos(a) * 1.45, y, Math.sin(a) * 1.45); s.rotation.z = Math.PI / 2; s.rotation.y = -a; mic.add(s);
    }
  }
  const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 7, 24), black); yoke.position.set(0, -2.2, 0); mic.add(yoke);
  shade(mic);
  // lights: warm soft key, strong violet rim, cool top
  const key = new THREE.SpotLight('#ffe6cc', 140, 60, 0.45, 1, 1.6); key.position.set(9, 10, 14); key.target.position.set(0, 6, 0); scene.add(key, key.target);
  const rim = new THREE.SpotLight('#8a63ff', 520, 50, 0.5, 0.7, 1.4); rim.position.set(-7, 9, -9); rim.target.position.set(0, 6, 0); scene.add(rim, rim.target);
  const rim2 = new THREE.SpotLight('#c7b6ff', 180, 50, 0.4, 0.8, 1.5); rim2.position.set(8, 12, -8); rim2.target.position.set(0, 6.5, 0); scene.add(rim2, rim2.target);
  const cam = camera(width, height, { fov: 22, pos: [0, 8.4, 30], look: [0, 6.6, 0] });
  renderer.render(scene, cam);
  return post(renderer.domElement, { vignette: 0.35, grain: 0.04, seed: 21 });
}
