// SCENE 02 — "THE OLD WAY": work sent through WhatsApp + Google Drive.
import { h, pose, css } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE, spring } from '../utils/ease.js';
import { ChatWindow, bubble } from '../components/Chat.js';
import { DriveWindow } from '../components/Drive.js';
import { deskPose, chaosT } from '../components/Desk.js';

export default {
  id: 'S02_OldWay',
  create({ root, ctx }) {
    const L2 = ctx.line('L2');
    const tDrive = L2.phrases[1].t[0];            // «في Google Drive»
    const tWA = tDrive + 0.75;                    // «وWhatsApp»
    const tChange = L2.phrases[2].t[0];           // «لازم تبدل هاد الطريقة»

    const chat = ChatWindow({ w: 560, h: 960 });
    Object.assign(chat.el.style, { left: '260px', top: '300px' });   // centred, slides aside for Drive
    chat.add(bubble('video', { img: 'coffee', dur: '0:18', at: '10:42' }), 4.3, true);
    chat.add(bubble('text', { text: 'هاهي الخدمة تاعي 👇', at: '10:42' }), 4.62);
    chat.add(bubble('file', { type: 'mp4', name: 'UGC_final_v3.mp4', size: '48.2 MB · MP4' }), 4.92);
    chat.add(bubble('voice', { dur: '0:42' }), 5.22);
    chat.add(bubble('link', { title: 'Portfolio (FINAL) – Google Drive', host: 'drive.google.com', url: 'https://drive.google.com/drive/folders/1Xa9kPq…' }), 5.52);
    chat.add(bubble('file', { type: 'pdf', name: 'rates_2024 (2).pdf', size: '2 pages · PDF' }), tWA + 0.05);
    chat.add(bubble('text', { text: 'الباقي في الـ Drive 🙏', at: '10:45' }), tWA + 0.45);
    chat.add(bubble('link', { title: '3 files · expires in 7 days', host: 'we.tl', url: 'https://we.tl/t-8fK2mZ…' }), tChange + 0.25);
    chat.add(bubble('video', { img: 'serum', dur: '0:32', at: '10:46' }), tChange + 0.7);

    const drive = DriveWindow({ w: 590, h: 660 });
    Object.assign(drive.el.style, { left: '455px', top: '360px' });
    ['Portfolio', 'UGC 2024', 'Voice demos', 'FINAL', 'old', 'Photos'].forEach((n, i) => drive.folder(n, tDrive + 0.1 + i * 0.07));
    drive.file('IMG_4821.MOV', 'serum', tDrive + 0.55);
    drive.file('edit_v3.mp4', 'dunes', tDrive + 0.63);
    drive.file('video (1).mp4', 'perfume', tDrive + 0.71);
    const gag = ['FINAL v2', 'FINAL FINAL', 'FINAL (use this one)'].map((n, i) => {
      const el = h('div', { class: 'gag' }, h('span', { class: 'ic', html: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M3.5 7.2A2.2 2.2 0 0 1 5.7 5h3.7l2 2.2h6.9a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2z" fill="#5F6368"/></svg>', style: { width: '48px', height: '48px' } }), h('span', {}, n));
      Object.assign(el.style, { left: `${[500, 430, 360][i]}px`, top: `${[640, 752, 864][i]}px`, zIndex: 5 + i });
      return { el, at: tChange + 0.12 + i * 0.26 };
    });

    root.append(drive.el, chat.el, ...gag.map((g) => g.el));

    return {
      update(t) {
        const tc = chaosT(t, ctx);
        pose(root, deskPose(t, ctx, 0));
        // chat enters as the hook card lands in it
        const ci = prog(tc, 3.98, 4.26, EASE.premium);
        const bump = tc > tWA ? Math.sin(Math.min(1, (tc - tWA) / 0.35) * Math.PI) * 0.025 : 0;
        const aside = prog(tc, tDrive - 0.05, tDrive + 0.45, EASE.premium);
        pose(chat.el, { x: -190 * aside, y: (1 - ci) * 140, o: ci, s: 1 + bump });
        css(chat.el, 'zIndex', tc >= tWA ? '3' : '1');
        chat.update(tc);
        // drive slams in on «Google Drive»
        const d = tc - tDrive;
        const ds = d < 0 ? 0 : spring(d, { freq: 2.6, zeta: 0.72 });
        pose(drive.el, { x: (1 - ds) * 260, y: (1 - ds) * -30, r: (1 - ds) * 6, o: prog(d, 0, 0.1), s: 0.92 + 0.08 * ds });
        css(drive.el, 'zIndex', '2');
        drive.update(tc);
        for (const [i, g] of gag.entries()) {
          const p = tc - g.at;
          const sp = p < 0 ? 0 : spring(p, { freq: 3.0, zeta: 0.55 });
          pose(g.el, { x: (1 - sp) * 120, y: (1 - sp) * -90, s: 0.5 + 0.5 * sp, r: (1 - sp) * 14 + [-3, 2, -1.5][i], o: prog(p, 0, 0.06) });
        }
      },
    };
  },
};
