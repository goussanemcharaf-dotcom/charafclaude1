// Demo creator shown inside the ad's portfolio. Fictional, generic identity:
// no real person, no client logos, no statistics, no testimonials.
// Swap these values to feature a real client (with their permission).
export const SITE_URL = 'yourname.com';

export const CREATOR = {
  first: 'Lina',
  last: 'Amrani',
  role: 'UGC Creator & Content Producer',
  niche: 'Beauty, skincare & lifestyle',
  city: 'Algiers',
  langs: 'AR · FR · EN',
  status: 'Available for new projects',
  bio: 'I make brands feel human — honest, scroll-stopping content, shot and edited in Algiers.',
  work: [
    { img: 'serum', title: 'Hydra Serum', kind: 'UGC Ad', len: '0:32' },
    { img: 'perfume', title: 'Eau de Parfum', kind: 'Unboxing', len: '0:24' },
    { img: 'coffee', title: 'Morning Ritual', kind: 'Lifestyle Reel', len: '0:18' },
    { img: 'dunes', title: 'Sahara Light', kind: 'Brand Film', len: '1:05' },
  ],
  services: [
    ['01', 'UGC Video Ads', 'Hooks, testimonials and unboxings made for paid social.'],
    ['02', 'Product Photography', 'Clean studio stills and lifestyle frames.'],
    ['03', 'Voice-Over', 'Arabic, French and English — studio delivery.'],
    ['04', 'Content Strategy', 'Concepts and scripts built around your product.'],
  ],
};

// Two more identities used for the "Style تاعك" beat: every creator gets
// their own site, not a template.
export const VARIANTS = {
  voice: { first: 'Yanis', role: 'Voice-Over Artist', line: 'A voice brands remember.' },
  film: { first: 'Ines', role: 'Content Creator & Filmmaker', line: 'Stories told in light.' },
};
