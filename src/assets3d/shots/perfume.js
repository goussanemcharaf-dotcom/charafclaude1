// Perfume flacon on a stone slab, lilac backdrop, window-mullion light.
import { THREE, setup, cyclorama, lathe, canvasTex, stoneTex, sun, camera, mats, shade, post } from '../lib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export async function render({ width, height }) {
  const { renderer, scene } = setup({ width, height, bg: '#d6cde3', exposure: 1.0, env: 0.9 });
  scene.add(cyclorama({ color: '#cdc2de', radius: 14, z: -12 }));
  const stone = stoneTex({ base: '#e9e5ee', seed: 9 });
  const slab = new THREE.Mesh(new RoundedBoxGeometry(14, 1.6, 7, 4, 0.12), new THREE.MeshStandardMaterial({ color: '#ebe7ef', roughness: 0.88, map: stone, bumpMap: stone, bumpScale: 0.4 }));
  slab.position.set(0, 0.8, 0); scene.add(shade(slab));
  const Y = 1.6;
  const g = new THREE.Group(); g.position.set(0.4, Y, 0.4); g.rotation.y = -0.38; scene.add(g);
  // thick glass flacon
  const glass = new THREE.Mesh(new RoundedBoxGeometry(4.2, 5.0, 2.6, 8, 0.42), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.04, transparent: true, opacity: 0.22, clearcoat: 1, specularIntensity: 1, envMapIntensity: 2.2, depthWrite: false }));
  const base = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.9, 2.6, 6, 0.4), mats.glass('#efe6ff', 6, 0.02)); base.position.y = 0.45; g.add(base);
  glass.position.y = 2.5; g.add(glass);
  // juice (rosé) inside
  const juice = new THREE.Mesh(new RoundedBoxGeometry(3.7, 3.2, 2.1, 6, 0.3), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 2, roughness: 0.04, ior: 1.36, attenuationColor: new THREE.Color('#d8928a'), attenuationDistance: 1.4 }));
  juice.position.y = 2.55; g.add(juice);
  // printed wordmark on the front face
  const print = canvasTex(1024, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(40,24,48,0.88)'; c.textAlign = 'center';
    c.font = 'italic 400 150px "Instrument Serif"'; c.fillText('Nuit', w / 2, 250);
    c.font = '600 34px "Inter"'; c.letterSpacing = '12px'; c.fillText('EAU DE PARFUM', w / 2, 340);
  });
  const printM = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshBasicMaterial({ map: print, transparent: true, depthWrite: false }));
  printM.position.set(0, 2.7, 1.31); g.add(printM);
  // neck + cap
  const neck = new THREE.Mesh(lathe([[0, 5.0], [0.55, 5.0], [0.55, 5.35], [0, 5.35]]), mats.gold());
  g.add(neck);
  const cap = new THREE.Mesh(lathe([[0, 5.3], [1.05, 5.3], [1.05, 7.05, 0.18], [0, 7.05]], { seg: 12, fillet: 6 }), new THREE.MeshPhysicalMaterial({ color: '#1a1622', roughness: 0.18, metalness: 0.2, clearcoat: 1, flatShading: true }));
  g.add(cap);
  shade(g);
  // light through a window: vertical mullions as gobo
  const key = sun({ intensity: 5.0, color: '#fff1e2', pos: [16, 14, 12], target: [0, 3, 0], extent: 16, radius: 4, blurSamples: 24 });
  scene.add(key, key.target);
  const frame = new THREE.Group();
  const bar = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })); m.position.set(x, y, 0); m.castShadow = true; frame.add(m); };
  for (const x of [-7, -2.2, 2.6, 7.4]) bar(0.5, 30, x, 0);
  bar(30, 0.5, 0, 2.5);
  const dir = new THREE.Vector3(16, 17, 12).normalize();
  frame.position.copy(new THREE.Vector3(0, 3, -4).add(dir.clone().multiplyScalar(14)));
  frame.lookAt(frame.position.clone().add(dir));
  scene.add(frame);
  const rim = new THREE.SpotLight('#efe6ff', 50, 60, 0.5, 0.9, 1.5); rim.position.set(-10, 10, -8); rim.target.position.set(0, 3, 0); scene.add(rim, rim.target);
  scene.add(new THREE.HemisphereLight('#f6f0ff', '#cfc4dd', 0.25));
  const cam = camera(width, height, { fov: 20, pos: [0, 6.2, 36], look: [0, 4.0, 0] });
  renderer.render(scene, cam);
  return post(renderer.domElement, { vignette: 0.3, grain: 0.03, seed: 5 });
}
