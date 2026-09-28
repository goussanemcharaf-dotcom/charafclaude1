# 08 — Asset Manifest

## Supplied assets

**None.** At the start of production the repository was empty: no reference video or image, no brand file, no voice-over, no creator footage, no contact details. Every asset below was created for this film and is reproducible from source.

## Classification (brief §24)

A = essential · B = supporting · C = optional · D = redundant (not shipped) · E = low quality (rejected)

| Asset | Source | Class | Where it is used |
|---|---|---|---|
| `src/assets/generated/serum.jpg` | Three.js still (`src/assets3d/shots/serum.js`): amber glass dropper, travertine plinth, palm-leaf sunlight | **A** | Hook card 1 · WhatsApp video bubble · Drive thumbnail · portfolio showreel (hero) · work card 1 · cover |
| `src/assets/generated/coffee.jpg` | Three.js still: flat white with latte-art heart, linen, blinds light | **A** | Hook card 4 (influencer) · the video bubble the hook card lands as · work card 3 |
| `src/assets/generated/perfume.jpg` | Three.js still: flacon, transmissive rosé juice, lilac backdrop | B | Work card 2 · chaos thumbnails |
| `src/assets/generated/mic.jpg` | Three.js still: large-diaphragm condenser, violet rim light | B | Hook card 3 (voice-over) · Voice-Over variant site · chaos |
| `src/assets/generated/dunes.jpg` | Three.js still: golden-hour transverse dunes | B | Hook card 2 (content creator) · work card 4 · Filmmaker variant site |
| Fonts (4 families, `fonts/`) | Google Fonts, SIL OFL 1.1 | **A** | See `09_font_list` |
| Icon set (`src/components/Icons.js`) | Drawn for this film (24 px stroke system) | B | UI across all scenes |
| Chat / Drive / browser UIs (`src/components/*`) | Original HTML/CSS drawings, *inspired by* familiar apps; no logos, no copied assets | **A** | Scenes 02–04, 07–12 |
| Demo portfolio (`src/components/Site.js`) | Designed for this film | **A** | Scenes 07–12, cover |
| Variant sites Yanis / Ines (`Browser.js`) | Designed for this film | C | 0.8 s style beat in Scene 08 |
| Score + 166 SFX cues | Synthesized (`scripts/build_audio.py`, `src/config/sound.json`) | **A** | Entire film |
| Voice-over | **Not supplied.** Slot: `audio/vo.wav` | **A (missing)** | Must be recorded by the owner (see `12_production_notes/VO_Recording_Guide.md`) |

## Not shipped

| Asset | Class | Why |
|---|---|---|
| Candidate fonts (IBM Plex Sans Arabic, Noto Kufi Arabic, Alexandria, Vazirmatn, Beiruti, Zain, Noto Sans Arabic, Manrope, Geist) | D | Compared in type specimens. Readex Pro + Inter Tight won on weight and optical-size harmony. |
| Dunes v1–v3 (low-poly "mountains", flat haze) | E | Did not read as dunes. Rebuilt with transverse dune profiles and side light. |
| Perfume v1 (opaque "pink box" juice) | E | Rebuilt as a transparent shell over transmissive juice. |
| Microphone v1 (cone-shaped "pencil" grille) | E | Rebuilt with a domed capsule and a fine diamond mesh. |
| Serum v1 (orange plastic look, camera too close) | E | Darker amber attenuation, reframed, label and bulb fixed. |

## Rules applied

- No real people, no AI-generated faces, no stock photos or video.
- No fake testimonials, client logos, statistics or revenue claims. The demo creator ("Lina Amrani") is a fictional identity used only to show the product; the URL is the placeholder `yourname.com`.
- Third-party UIs are recognizable by layout and colour logic, not by copied logos or artwork.
