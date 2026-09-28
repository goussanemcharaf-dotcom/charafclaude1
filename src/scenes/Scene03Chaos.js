// SCENE 03 — "VIDEOS هنا… FILES هنا… LINKS هنا…" rhythmic fragmentation.
import { pose } from '../utils/dom.js';
import { prog, rng, wobble } from '../utils/anim.js';
import { spring } from '../utils/ease.js';
import { deskPose, chaosT } from '../components/Desk.js';
import { videoThumb, fileCard, linkChip, shot, toast, folderChip, sticker, LINKS } from '../components/Chaos.js';

export default {
  id: 'S03_Chaos',
  create({ root, ctx }) {
    const L3 = ctx.line('L3');
    const [tV, tF, tL] = L3.phrases.map((p) => p.t[0] - 0.04);
    const items = [];
    const add = (el, at, x, y, r = 0, s = 1, z = 10, from = {}) => {
      Object.assign(el.style, { left: `${x}px`, top: `${y}px`, zIndex: z });
      root.append(el);
      items.push({ el, at, r, s, from, seed: items.length * 7.3 });
    };
    // Videos — upper left cluster
    [['serum', '0:32', 'IMG_4821.MOV'], ['coffee', '0:18', 'video (2).mp4'], ['perfume', '0:24', 'final_cut.mov'], ['dunes', '1:05', 'reel_v4.mp4']]
      .forEach(([p, d, n], i) => add(videoThumb(p, d, n), tV + i * 0.06, 40 + i * 118, 330 + [0, 40, 10, 60][i], [-9, -3, 4, 10][i], 1, 20 + i, { x: -160, y: -120 }));
    add(sticker('Videos'), tV + 0.02, 120, 640, -4, 1, 40, { y: 60 });
    // Files — right cluster
    [['pdf', 'rates_2024 (2).pdf'], ['zip', 'photos_all.zip'], ['doc', 'brief_final.docx'], ['mp3', 'voice_demo_v2.mp3']]
      .forEach(([ty, n], i) => add(fileCard(ty, n), tF + i * 0.06, 610 + (i % 2) * 210, 470 + Math.floor(i / 2) * 240 + (i % 2) * 30, [5, -6, -3, 7][i], 1, 24 + i, { x: 180, y: -40 }));
    add(sticker('Files'), tF + 0.02, 640, 950, 3, 1, 41, { y: 60 });
    // Links — lower left, stacked chips
    LINKS.slice(0, 6).forEach((u, i) => add(linkChip(u), tL + i * 0.05, 40 + (i % 2) * 60 + (i > 2 ? 380 : 0), 790 + (i % 3) * 84 + (i > 2 ? 250 : 0), [-2, 3, -4, 2, -1, 4][i], 1, 28 + i, { x: -200, y: 40 }));
    add(sticker('Links'), tL + 0.02, 90, 1060, -3, 1, 42, { y: 60 });
    // Flood — everything else, faster and faster
    const R = rng(42);
    const flood = [
      () => toast('WhatsApp', 'Client', 'Do you have a portfolio?'),
      () => shot('serum', 'Screenshot'),
      () => folderChip('FINAL FINAL (2)'),
      () => linkChip(LINKS[6]),
      () => toast('Drive', 'Access request', 'Someone wants to open “FINAL”', '#1A73E8'),
      () => videoThumb('mic', '0:42', 'vo_take3.wav'),
      () => shot('perfume'),
      () => linkChip(LINKS[7]),
      () => folderChip('old / backup'),
      () => fileCard('png', 'Screenshot 2026-04-12.png'),
      () => toast('WhatsApp', 'Client', 'Which one is the latest?'),
      () => linkChip(LINKS[8]),
      () => shot('coffee'),
      () => fileCard('mov', 'IMG_4907.MOV'),
      () => linkChip(LINKS[9]),
      () => folderChip('new folder (3)'),
    ];
    const spots = [[560, 300], [40, 1290], [640, 1240], [700, 1420], [30, 1480], [860, 720], [380, 1390], [560, 1600], [250, 300], [820, 1560], [480, 380], [80, 1700], [300, 1560], [900, 1000], [620, 1720], [360, 560]];
    flood.forEach((mk, i) => {
      const at = tL + 0.55 + Math.pow(i / flood.length, 0.8) * 0.9;
      const [x, y] = spots[i];
      add(mk(), at, x, y, (R() - 0.5) * 18, 0.9 + R() * 0.2, 50 + i, { x: (R() - 0.5) * 300, y: (R() - 0.5) * 300 });
    });

    return {
      update(t) {
        const tc = chaosT(t, ctx);
        pose(root, deskPose(t, ctx, 1));
        const agitation = prog(tc, 10.2, 14.4);
        for (const it of items) {
          const p = tc - it.at;
          if (p < 0) { pose(it.el, { o: 0 }); continue; }
          const sp = spring(p, { freq: 2.8, zeta: 0.58 });
          const j = 5 * agitation;
          pose(it.el, {
            x: (1 - sp) * (it.from.x || 0) + wobble(tc * 3, it.seed) * j,
            y: (1 - sp) * (it.from.y || 0) + wobble(tc * 3, it.seed + 3) * j,
            r: it.r + (1 - sp) * 10 + wobble(tc * 2, it.seed + 5) * 1.5 * agitation,
            s: it.s * (0.6 + 0.4 * sp),
            o: prog(p, 0, 0.05),
          });
        }
      },
    };
  },
};
