// Golden-hour Sahara: transverse dunes (gentle windward slope, sharp crest,
// steep slip face), low side sun, warm aerial haze.
import { THREE, setup, canvasTex, rand, camera, post } from '../lib.js';

function duneH(x, z) {
  const prof = (d, lam, amp, up = 0.78) => {
    const p = ((d / lam) % 1 + 1) % 1;
    const v = p < up ? Math.sin((p / up) * Math.PI / 2) ** 1.4 : Math.cos(((p - up) / (1 - up)) * Math.PI / 2) ** 0.9;
    return v * amp;
  };
  const d = x + 26 * Math.sin(z * 0.009) + 9 * Math.sin(z * 0.023 + 1.3);
  let h = prof(d, 120, 26);
  const d2 = x * 0.96 + z * 0.28 + 12 * Math.sin(z * 0.017);
  h = Math.max(h, prof(d2 + 40, 70, 13) + 2);
  h += 5 * Math.sin(z * 0.004 + x * 0.002);
  return h;
}

export async function render({ width, height }) {
  const { renderer, scene } = setup({ width, height, bg: '#f2b98a', exposure: 1.0, env: 0.2 });
  const sunDir = new THREE.Vector3(-0.93, 0.17, 0.2).normalize();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1400, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec3 vDir; uniform vec3 sunDir;
      void main(){ float y = clamp(vDir.y, 0.0, 1.0);
        vec3 horizon = vec3(1.0, 0.80, 0.58); vec3 mid = vec3(0.98, 0.70, 0.52); vec3 zen = vec3(0.47, 0.55, 0.72);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.08, y)); c = mix(c, zen, smoothstep(0.03, 0.42, y));
        float s = max(dot(normalize(vDir), sunDir), 0.0);
        c += vec3(1.0, 0.72, 0.42) * pow(s, 10.0) * 0.55;
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  scene.add(sky);
  scene.fog = new THREE.Fog('#f2bd8e', 420, 2400);
  const size = 1600, seg = 700;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, duneH(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const ripples = canvasTex(512, 512, (c, w, h) => {
    const R = rand(2); c.fillStyle = 'rgb(128,128,255)'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { c.fillStyle = `rgba(${165 + R() * 25},128,255,0.9)`; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x * 0.05 + y * 0.3) * 2.5); c.lineTo(w, y + 2.5); c.lineTo(0, y + 2.5); c.fill(); }
  }, { srgb: false, repeat: [260, 260] });
  const sand = new THREE.MeshStandardMaterial({ color: '#dd9a5e', roughness: 0.97, normalMap: ripples, normalScale: new THREE.Vector2(0.25, 0.25) });
  const land = new THREE.Mesh(geo, sand); land.receiveShadow = true; land.castShadow = true; scene.add(land);
  const sunL = new THREE.DirectionalLight('#ffc68a', 9.5);
  sunL.position.copy(sunDir.clone().multiplyScalar(600)); sunL.target.position.set(0, 0, -120);
  sunL.position.add(sunL.target.position);
  sunL.castShadow = true; sunL.shadow.mapSize.set(4096, 4096);
  const sc = sunL.shadow.camera; sc.left = -420; sc.right = 420; sc.top = 420; sc.bottom = -420; sc.near = 10; sc.far = 1800;
  sunL.shadow.bias = -0.0008; sunL.shadow.normalBias = 0.5; sunL.shadow.radius = 1.5; sunL.shadow.blurSamples = 6;
  scene.add(sunL, sunL.target);
  scene.add(new THREE.HemisphereLight('#7f97cc', '#9c5a30', 0.42));
  const cam = camera(width, height, { fov: 38, pos: [-10, 70, 280], look: [-30, 22, -220] });
  renderer.render(scene, cam);
  return post(renderer.domElement, { vignette: 0.26, grain: 0.04, seed: 33 });
}
