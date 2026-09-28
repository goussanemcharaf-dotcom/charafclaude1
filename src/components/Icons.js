// Stroke icon set (24x24, 1.8 stroke) — drawn for this film, Lucide-like.
const S = (d, { fill = 'none', sw = 1.8 } = {}) =>
  `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const ICON = {
  play: S('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>'),
  pause: S('<rect x="7" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.4" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none"/>'),
  lock: S('<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>'),
  folder: S('<path d="M3.5 7.2A2.2 2.2 0 0 1 5.7 5h3.7l2 2.2h6.9a2.2 2.2 0 0 1 2.2 2.2v7.4a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2z" fill="currentColor" stroke="none"/>'),
  file: S('<path d="M14 3.5H7.2A2.2 2.2 0 0 0 5 5.7v12.6a2.2 2.2 0 0 0 2.2 2.2h9.6a2.2 2.2 0 0 0 2.2-2.2V8.5z"/><path d="M14 3.5v5h5"/>'),
  link: S('<path d="M10 13.5a4.2 4.2 0 0 0 6 .4l2.6-2.6a4.2 4.2 0 0 0-6-6l-1.4 1.4"/><path d="M14 10.5a4.2 4.2 0 0 0-6-.4l-2.6 2.6a4.2 4.2 0 0 0 6 6l1.4-1.4"/>'),
  search: S('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  back: S('<path d="M15 5.5 8.5 12l6.5 6.5"/>'),
  fwd: S('<path d="m9 5.5 6.5 6.5L9 18.5"/>'),
  arrowUR: S('<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>'),
  arrowR: S('<path d="M4.5 12h15"/><path d="m13.5 6 6 6-6 6"/>'),
  check: S('<path d="m5 12.5 4.5 4.5L19 7.5"/>', { sw: 2.2 }),
  checks: S('<path d="m2.5 12.5 4 4 8-9"/><path d="m11 16 1 .9 8-9"/>', { sw: 2 }),
  send: S('<path d="M4.5 12 20 4.5 15.5 20l-3.2-6.8z" fill="currentColor" stroke="none"/>'),
  mic: S('<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v2.5"/>'),
  heart: S('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'),
  heartFill: S('<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" fill="currentColor"/>'),
  comment: S('<path d="M20 11.6a7.9 7.9 0 0 1-11.8 6.9L4 19.6l1.2-3.9A7.9 7.9 0 1 1 20 11.6z"/>'),
  share: S('<path d="M20.5 3.5 10 14"/><path d="M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>'),
  more: S('<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>'),
  moreV: S('<circle cx="12" cy="5.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor"/>'),
  download: S('<path d="M12 4v11"/><path d="m7 10.5 5 5 5-5"/><path d="M5 20h14"/>'),
  x: S('<path d="M6 6l12 12M18 6 6 18"/>'),
  image: S('<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.5-4.5L6 19.5"/>'),
  clip: S('<path d="m20 11.5-7.8 7.8a4.8 4.8 0 0 1-6.8-6.8l8.2-8.2a3.2 3.2 0 0 1 4.5 4.5l-8.2 8.2a1.6 1.6 0 0 1-2.3-2.3L15 7.3"/>'),
  camera: S('<path d="M4 8.5A2 2 0 0 1 6 6.5h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>'),
  phone: S('<path d="M6.5 3.5h3l1.5 4.5-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/>'),
  video: S('<rect x="3" y="6.5" width="12.5" height="11" rx="2.2"/><path d="m15.5 10.5 5.5-3v9l-5.5-3z"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  smile: S('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4.5 4.5 0 0 0 7 0"/><circle cx="9.3" cy="9.8" r=".6" fill="currentColor"/><circle cx="14.7" cy="9.8" r=".6" fill="currentColor"/>'),
  grid: S('<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>'),
  list: S('<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.8" cy="6.5" r=".9" fill="currentColor"/><circle cx="4.8" cy="12" r=".9" fill="currentColor"/><circle cx="4.8" cy="17.5" r=".9" fill="currentColor"/>'),
  refresh: S('<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.5H15"/>'),
  sidebar: S('<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><path d="M9.5 4.5v15"/>'),
  alert: S('<path d="M12 4.5 21 19.5H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>'),
  wave: S('<path d="M3 12h1.5M6.5 9v6M9.5 6v12M12.5 9.5v5M15.5 7v10M18.5 10v4M21 12h.5"/>'),
};

// Coloured file-type badge (third-party chaos palette).
export const FILETYPE = {
  pdf: { c: '#E5484D', t: 'PDF' },
  zip: { c: '#8E8E99', t: 'ZIP' },
  doc: { c: '#2F6FEB', t: 'DOC' },
  mp3: { c: '#E5A000', t: 'MP3' },
  mp4: { c: '#7C66DC', t: 'MP4' },
  mov: { c: '#11A683', t: 'MOV' },
  png: { c: '#0EA5E9', t: 'PNG' },
};

// macOS-style pointer, drawn as SVG (white fill, black outline).
export const CURSOR_SVG = `<svg viewBox="0 0 28 40" width="100%" height="100%"><path d="M3 2.5v29.2l7.4-7.1 4.6 11 5.3-2.3-4.6-10.7 10.3-.4z" fill="#fff" stroke="#0E0E12" stroke-width="2" stroke-linejoin="round"/></svg>`;
