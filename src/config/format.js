// Canvas, frame rate and placement safe zones. Every scene positions
// essential text inside SAFE; decorative visuals may bleed to the edges.
export const W = 1080;
export const H = 1920;

// Meta Reels overlay guidance: keep the top 14% and bottom 35% free of
// essential text (profile row, caption, CTA button), plus ~6% side margins.
export const SAFE = {
  top: Math.round(H * 0.14),        // 269
  bottom: Math.round(H * (1 - 0.35)), // 1248
  left: Math.round(W * 0.06),       // 65
  right: Math.round(W * (1 - 0.06)),  // 1015
};

// 4:5 feed crop (1080x1350) is centred vertically: y 285..1635.
export const CROP_4x5 = { y0: (H - 1350) / 2, y1: (H + 1350) / 2 };

// Caption anchors (centre line of the caption block).
export const CAPTION = {
  low: 1150,   // problem scenes — over the chaos, on a frosted panel
  high: 400,   // solution scenes — editorial headline above the product
  top: 385,    // standard-subtitle version: lines whose low zone is taken
};
