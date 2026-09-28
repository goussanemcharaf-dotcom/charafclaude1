# Premium Website Portfolio — Vertical Meta Ad

A 36-second, 1080×1920 ad for a premium portfolio-website service for creators (UGC creators, content creators, voice-over artists, influencers). The script is in Algerian Darija.

> **CHAOS → «لا.» → CLARITY → ONE LINK → «راسلني ونبداو.»**
> The ad doesn't talk about a premium portfolio: it builds one on screen, and that build is the proof of the service.

## Deliverables

| # | Deliverable | Path |
|---|---|---|
| 01 | Final master video (H.264 High, CRF 12, AAC 320k) | `deliverables/01_master/` |
| 02 | Meta Ads versions: Reels 9:16 + Feed 4:5 (−14 LUFS, faststart) | `deliverables/02_meta_ads/` |
| 03 | Clean version (no captions) | `deliverables/03_clean/` |
| 04 | Arabic subtitle version + `.ar_AR.srt` / `.ar.vtt` | `deliverables/04_arabic_subtitles/` |
| 05 | Thumbnail / cover (9:16, 4:5, 3:4 grid crop, first frame) | `deliverables/05_thumbnail_cover/` |
| 06 | Storyboard (PDF + PNG, frames from the final film) | `deliverables/06_storyboard/` |
| 07 | Scene timeline + VO cue sheet + freeze-frame tests | `deliverables/07_scene_timeline/` |
| 08 | Asset manifest (A–E classification) | `deliverables/08_asset_manifest/` |
| 09 | Font list (all SIL OFL) + bidi rules | `deliverables/09_font_list/` |
| 10 | Colour system + measured contrast + swatches | `deliverables/10_color_system/` |
| 11 | Sound design notes + 166-cue sheet + stems | `deliverables/11_sound_design/` |
| 12 | Production notes · **VO recording guide + teleprompter video** · QA report | `deliverables/12_production_notes/` |

Creative strategy (asset inspection, audience, script analysis, 3 directions with scoring): [`docs/01_creative_strategy.md`](docs/01_creative_strategy.md).
QA report (self-critique scores, fixes, freeze-frame and sound-off tests): [`docs/QA_Report.md`](docs/QA_Report.md).

## What you still need to supply

1. **Your voice-over.** The script is first-person, and the brief rules out an AI voice. Record it against `deliverables/12_production_notes/VO_Guide_Teleprompter_9x16.mp4`, save it as `audio/vo.wav`, and run `npm run export`. The guide is `VO_Recording_Guide.md`.
2. **Your brand purple** (optional). The ad uses a deliberately chosen violet (`#6D42E5`) because no brand file was supplied. It's one token: see `10_color_system`.
3. **A contact handle** (optional). The CTA is «راسلني ونبداو.» with the Meta *Send message* button; add a handle only if you want one.

## Build

```bash
npm install && pip install numpy scipy soundfile pyloudnorm imageio-ffmpeg pillow
npm run export          # audio + all video variants with motion blur + covers + subtitles
node scripts/storyboard.mjs && node scripts/make-docs.mjs
```

Architecture, safe zones, how to rebrand or re-time: `deliverables/12_production_notes/Production_Notes.md`.
