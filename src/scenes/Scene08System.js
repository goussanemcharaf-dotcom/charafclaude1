// SCENE 08 — overlay labels: the style fan names each creator; the whole-page
// view names each section. (The page itself is driven by Product.js.)
import { h, pose } from '../utils/dom.js';
import { prog } from '../utils/anim.js';
import { EASE } from '../utils/ease.js';

export default {
  id: 'S08_System',
  create({ root, ctx }) {
    const fanLabels = [['Voice-Over', 188], ['UGC Creator', 540], ['Filmmaker', 892]].map(([txt, x]) => {
      const el = h('div', { class: 's8-lab' }, txt);
      el.style.left = `${x}px`;
      root.append(el);
      return el;
    });
    return {
      update(t) {
        const f = prog(t, 24.12, 24.4, EASE.premium) * (1 - prog(t, 24.66, 24.86, EASE.glide));
        fanLabels.forEach((el, i) => pose(el, { y: (1 - f) * 16, o: f }));
      },
    };
  },
};
