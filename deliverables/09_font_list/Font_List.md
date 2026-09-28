# 09 — Font List

All four families are **SIL Open Font License 1.1** (free for commercial use, redistribution and embedding). The WOFF2 files are in `/fonts` (subsets: latin, latin-ext, arabic), with `@font-face` rules in `/fonts/fonts.css`. They were fetched by `scripts/fetch-fonts.mjs` from Google Fonts.

| Role | Family | Weights used | Why |
|---|---|---|---|
| **Arabic: captions, headlines, CTA** | **Readex Pro** (variable 160–700) | 500 captions, 600 emphasis/eyebrows, 700 display («لا.», «راسلني ونبداو.») | Modern, highly readable Arabic sans. Its colour and optical size match Inter Tight without size hacks, so mixed Darija/English lines sit on one visual weight. The bold lam-alef makes «لا» a strong graphic. |
| **Latin display** | **Inter Tight** (variable 100–900) | 600–800, tracking −0.02 to −0.055 em | Premium grotesk with a tight setting. Used for the English words inside Arabic lines and for big type (UGC CREATOR, 10 LINKS, 1 LINK, Presentation). |
| **UI text in mockups** | **Inter** (variable, opsz 14–32) | 400–650 | SF Pro-like UI voice for the chat, Drive, browser and chips. |
| **Demo portfolio identity only** | **Instrument Serif** (regular + italic) | 400 italic | Gives the creator's site its own editorial personality (the big «Lina», the about statement, «together.»), so it reads as a custom build rather than more ad graphics. |

## Mixed-script rules (bidi)

- Every caption is an RTL flex row. Each Latin run is an isolated LTR group, so multi-word English ("Premium Website Portfolio", "Google Drive") keeps its internal order and no Unicode bidi guessing happens.
- Arabic prefixes that attach to English words («و», «للـ», «والـ», «الـ») are separate tokens joined to the Latin run with a hair space (0.14 em), so the scripts never collide.
- Punctuation after an English run («،», «…», «.») is its own RTL token, so it always lands on the reading-end (left) side.
- Line breaks are set by hand in the cue sheet (`/` in the markup); nothing auto-wraps.
