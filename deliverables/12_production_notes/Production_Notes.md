# 12 — Production Notes

## How the film is made

The ad is a **deterministic HTML/CSS/JS film**. Every frame is a pure function of time, `window.renderAt(t)`: there are no CSS animations and no real-time playback. Headless Chromium (Playwright) screenshots each frame, and FFmpeg encodes. The same source renders the master, the clean and subtitle versions, and the VO teleprompter, so they can never drift apart.

| Layer | Technology | Why |
|---|---|---|
| Scenes, typography, UI, motion | HTML + CSS + JS modules (`src/`) | Perfect Arabic shaping and bidi (Chromium), crisp vector type, real UI layouts |
| Product and cinematic imagery | Three.js r180 (WebGL2 via SwiftShader) → stills | Physically based lighting, glass transmission, soft shadows. Rendered once, used as images |
| Motion blur | 4 sub-frames per frame, 180° shutter, FFmpeg `tmix` | Real blur on fast moves; static type stays razor sharp |
| Score + sound design | numpy/scipy synthesis (`scripts/build_audio.py`) | No samples or licences; every cue tied to the timeline |
| Encoding | FFmpeg 7 (libx264, AAC) | Master CRF 12; Meta CRF 17 capped at 14 Mb/s |

Three.js was used only where it improved the result (believable glass, metal and light on the product stills). It was not used for the UI, where DOM rendering is sharper and fully editable.

## Project structure

```
src/
  index.html · main.js            engine: renderAt(t), two-pass (visibility → update)
  config/  timeline.json          ← VO cues, scene windows, markers (single timing truth)
           sound.json             ← 166 SFX cues
           theme.js · format.js   ← colour tokens · canvas, safe zones, caption anchors
           creator.js             ← demo creator identity (name, URL, work, services)
  scenes/  Scene01Hook … Scene13CTA.js, Product.js (the website's camera path S07–S11)
  components/  Captions · Chat · Drive · Chaos · Browser · Site · Guide · Desk · Icons · ui
  utils/   ease (cubic-bezier, springs) · anim (tween, keys, rng) · dom · text (bidi)
  styles/  base.css · scenes.css · portfolio.css
  assets3d/  lib.js + shots/*.js  (Three.js studio)  →  assets/generated/*.jpg
  cover.html                      thumbnail / cover composition
scripts/  render-frames · render-assets · build_audio.py · export · make-docs · storyboard · stills · serve
fonts/    OFL WOFF2 + fonts.css
audio/    music / sfx / mix (+ vo.wav slot)
```

## Commands

```bash
npm install                    # playwright + three
pip install numpy scipy soundfile pyloudnorm imageio-ffmpeg pillow
npm run assets                 # re-render 3D stills   (~40 s)
npm run audio                  # synthesize score + SFX, master   (~8 s)
npm run export                 # render all variants with motion blur + encode everything   (~20 min)
node scripts/stills.mjs out/qa 3 10 18 27 36   # QA stills at any times
npm run preview                # http://127.0.0.1:8080/src/index.html?t=12.5   (scrub with renderAt)
```

Useful query flags: `?captions=designed|none|standard`, `?guide=1`, `?t=seconds`.

## Common changes

| Change | Where |
|---|---|
| **Brand purple** | `accent` in `src/config/theme.js` **and** `--accent` (+ `--accent-deep`, `--accent-tint`) in `src/styles/base.css` |
| **Creator shown in the portfolio** (name, role, city, work, services) | `src/config/creator.js` |
| **URL** (`yourname.com`) | `SITE_URL` in `src/config/creator.js` |
| **Contact handle on the CTA** (only if you want one) | `src/scenes/Scene13CTA.js`: add a line under the composer; keep one action |
| **Re-time to the real VO** | `src/config/timeline.json` → phrase `t` values; `markers.freeze` = start of «لا» |
| **Caption wording / emphasis** | `timeline.json` → `phrases[].text` (`[Latin]`, `/` line break) and `em` |
| **Sound levels** | `src/config/sound.json` (`gain` in dB), music levels in `build_audio.py` |
| **Swap an image** | Put a 1080×1440 JPG in `src/assets/generated/` with the same name |

## Safe zones and formats

- **9:16 master** (1080×1920). Essential text lives between y = 270 and 1248 (clear of the Meta Reels top and bottom overlays) and inside x = 65–1015. Decorative imagery bleeds.
- **4:5 feed** (1080×1350) is a centre crop (y 285–1635). All captions, stickers, headlines and the CTA sit inside it, so no re-layout is needed.
- **3:4 grid crop** of the cover is included for the profile grid.
- **1:1** (1080×1080, y 420–1500) keeps the captions and the product, but would crop the "high" captions in the solution half. For a square placement, move `CAPTION.high` to ≈ 470 in `format.js` and re-export.

## Meta upload checklist

- Upload `02_meta_ads/PremiumPortfolio_Meta_Reels_9x16.mp4` (H.264 High, 30 fps CFR, AAC 48 kHz, −14 LUFS, faststart) for Reels/Stories. Upload `…_Feed_4x5.mp4` for Feed.
- Captions are already burned in. If you use the clean version instead, upload `04_arabic_subtitles/PremiumPortfolio.ar_AR.srt`.
- Set the cover to `05_thumbnail_cover/Cover_9x16_1080x1920.png`.
- CTA button: **Send message** (WhatsApp / Messenger / Instagram Direct). This matches «راسلني ونبداو».
- Primary text idea (Darija): «خدمتك تستاهل Presentation أحسن. نبنيلك Premium Website Portfolio من الصفر — Link واحد يقدّمك باحترافية. راسلني ونبداو.»

## Honest limitations

- **VO not included.** It must be your recording (see `VO_Recording_Guide.md`). The music-only mix is a complete, usable sound-off/sound-on bed.
- **Purple is a chosen token**, not extracted from a brand file (none was supplied).
- **Demo imagery is 3D product and landscape stills**, not real UGC footage of a person. That's deliberate: no generic AI people and no stock. If you have a real client's permission, swapping in their stills or frames will make the portfolio even more persuasive.
- **The sound was verified analytically** (loudness per section, true peak, spectrum, silence window), not by ear in this environment. Listen once on phone speakers and on headphones before launch.
