// Amber serum dropper bottle on a travertine plinth, palm-shadow sunlight.
import { THREE, setup, cyclorama, lathe, canvasTex, stoneTex, palmGobo, sun, camera, mats, shade, post } from '../lib.js';

export async function render({ width, height }) {
  const { renderer, scene } = setup({ width, height, bg: '#e9d9c6', exposure: 1.12, env: 0.6 });
  scene.add(cyclorama({ color: '#e6d2bb', radius: 14, z: -12 }));

  // plinth
  const stone = stoneTex({ base: '#eee6da' });
  const plinth = new THREE.Mesh(lathe([[0, 0], [4.6, 0], [4.6, 3.0, 0.08], [0, 3.0]], { seg: 180, fillet: 6 }), new THREE.MeshStandardMaterial({ color: '#efe7db', roughness: 0.9, map: stone, bumpMap: stone, bumpScale: 0.6 }));
  plinth.rotation.y = Math.PI; // texture seam to the back
  scene.add(shade(plinth));
  const B = 3.0; // bottle base height

  const g = new THREE.Group(); g.position.y = B; scene.add(g);
  // amber glass body
  const body = new THREE.Mesh(lathe([[0, 0], [1.62, 0], [1.72, 0.14, 0.12], [1.72, 5.9, 0.2], [1.5, 6.85, 0.5], [0.78, 7.3, 0.22], [0.74, 7.62], [0, 7.62]]), mats.glass('#7a3a0c', 0.75, 0.018));
  g.add(body);
  // serum (opaque, seen through glass)
  const liquid = new THREE.Mesh(lathe([[0, 0.3], [1.5, 0.3], [1.55, 0.4, 0.1], [1.55, 4.9], [0, 4.9]]), new THREE.MeshPhysicalMaterial({ color: '#b5651d', roughness: 0.2, clearcoat: 1, emissive: '#6b3006', emissiveIntensity: 0.35 }));
  g.add(liquid);
  // pipette
  const pip = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 6.6, 32), mats.glass('#ffffff', 10, 0.02));
  pip.position.y = 4.35; g.add(pip);
  // gold collar with fine ridges
  const collarPts = [[0, 7.5], [0.86, 7.5]];
  for (let i = 0; i <= 10; i++) collarPts.push([i % 2 ? 0.9 : 0.87, 7.55 + i * 0.085]);
  collarPts.push([0.86, 8.45], [0.62, 8.5], [0, 8.5]);
  const collar = new THREE.Mesh(lathe(collarPts, { fillet: 2 }), mats.gold());
  g.add(collar);
  // rubber bulb
  const bulb = new THREE.Mesh(lathe([[0, 8.45], [0.66, 8.45], [0.7, 8.9, 0.25], [0.57, 9.35, 0.35], [0.63, 10.05, 0.45], [0.46, 10.8, 0.5], [0, 10.97]], { seg: 200, fillet: 40 }), new THREE.MeshPhysicalMaterial({ color: '#1f1b19', roughness: 0.78, clearcoat: 0.08, clearcoatRoughness: 0.8 }));
  g.add(bulb);
  // label
  const label = canvasTex(1400, 700, (c, w, h) => {
    c.fillStyle = '#f7f1e7'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a211b'; c.textAlign = 'center';
    c.font = '600 58px "Inter"'; c.letterSpacing = '14px';
    c.fillText('HYDRATING', w / 2, 250);
    c.font = 'italic 400 150px "Instrument Serif"'; c.letterSpacing = '0px';
    c.fillText('Serum', w / 2, 400);
    c.fillStyle = 'rgba(42,33,27,0.55)'; c.fillRect(w / 2 - 60, 450, 120, 3);
    c.font = '400 40px "Inter"'; c.letterSpacing = '6px';
    c.fillText('30 ml  ·  1 fl.oz', w / 2, 540);
  });
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(1.735, 1.735, 3.0, 128, 1, true, -1.25, 2.5), new THREE.MeshStandardMaterial({ map: label, roughness: 0.7, emissive: '#f7f1e7', emissiveIntensity: 0.22, emissiveMap: label }));
  lab.position.y = 2.9; g.add(lab);
  shade(g);

  // lights
  const key = sun({ intensity: 4.2, color: '#ffe0b8', pos: [-14, 20, 14], target: [0, 5, 0], extent: 16, radius: 5, blurSamples: 24 });
  scene.add(key, key.target);
  const gobo = palmGobo({ size: 30 });
  const dir = new THREE.Vector3(-14, 20, 14).normalize();
  gobo.position.copy(new THREE.Vector3(1.5, 5, -3).add(dir.clone().multiplyScalar(13)));
  gobo.lookAt(gobo.position.clone().add(dir));
  scene.add(gobo);
  const rim = new THREE.SpotLight('#fff6ea', 60, 60, 0.5, 0.8, 1.5);
  rim.position.set(9, 12, -8); rim.target.position.set(0, 6, 0); scene.add(rim, rim.target);
  const fill = new THREE.HemisphereLight('#fff3e6', '#d9c3a8', 0.35); scene.add(fill);

  const cam = camera(width, height, { fov: 24, pos: [0, 9.0, 43], look: [0, 7.0, 0] });
  renderer.render(scene, cam);
  return post(renderer.domElement, { vignette: 0.2, grain: 0.03 });
}
