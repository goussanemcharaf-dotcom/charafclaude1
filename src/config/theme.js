// Central design tokens. Change ACCENT here to rebrand the whole ad.
export const COLOR = {
  paper: '#FAFAF8',      // canvas off-white
  paper2: '#F2F2F0',     // secondary light neutral (cards, sections)
  line: '#E4E4E8',       // hairlines
  ink: '#0E0E12',        // near-black type
  graphite: '#4A4A55',   // secondary type
  mute: '#8E8E99',       // tertiary type
  accent: '#6D42E5',     // brand violet — OKLCH(0.53 0.23 288), 5.6:1 on paper
  accentDeep: '#5231C2', // pressed / text on tint
  accentTint: '#ECE6FD', // soft fill
  accentMist: '#F5F2FE', // faint wash
  // third-party-inspired UI colours — only ever seen during the chaos
  chatGreen: '#D9FDD3',
  chatBg: '#EFE7DE',
  chatHeader: '#F0F2F5',
  driveBlue: '#1A73E8',
  folderGrey: '#5F6368',
  success: '#16A34A',
};

export const FONT = {
  display: "'Inter Tight', 'Readex Pro', sans-serif",
  ui: "'Inter', 'Readex Pro', sans-serif",
  arabic: "'Readex Pro', 'Inter Tight', sans-serif",
  serif: "'Instrument Serif', 'Readex Pro', serif",
};

// Motion grammar: chaos moves fast, clarity moves with control.
export const MOTION = {
  chaos: { dur: 0.22 },       // snappy arrivals
  clarity: { dur: 0.7 },      // controlled, no overshoot
};
