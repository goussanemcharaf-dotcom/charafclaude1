# QA Report — self-critique, passes, tests

## Self-critique scores (brief §33)

Scores are for the delivered film **as it stands (music + sound design, no VO)**. Where a score depends on an asset only you can supply, both numbers are given.

| Category | Score | Evidence | What would raise it |
|---|---|---|---|
| Hook | 92 | Frame 1 already reads «إذا كنت… UGC CREATOR» plus a premium content card. Four roles in 3.6 s on a single focus line. | Your voice on «إذا كنت». |
| Clarity | 93 | Every beat is legible without sound (see the sound-off test). | — |
| Retention | 89 | A novelty beat every 0.6–1.2 s in the problem half, and a new camera move every 0.5–1 s in the solution half. The 36.3 s runtime is set by the verbatim script. | A tighter VO read (the timeline re-flows). |
| Visual quality | 91 | Physically lit 3D stills, editorial type, one coherent system, motion blur. | Real client stills (with permission). |
| Brand perception | 92 | White + one violet; the ad itself looks like a premium product film. | Your real brand purple. |
| Service clarity | 94 | «أنا نبنيلك Premium Website Portfolio» over a site being built from scratch, then used by a client. | — |
| Emotional impact | 86 → **92 with VO** | «لا.» silence + collapse, the answered-questions callback, the payoff sheet. | **The VO.** The emotional lines («لا.», «خلي خدمتك تبان…») are carried by voice. |
| Mobile readability | 92 | Captions 56–60 px; stickers 76 px; all essential text inside y 270–1248 and x 65–1015. | — |
| Motion quality | 91 | Consistent grammar (chaos = springs with overshoot and jitter; clarity = critically damped springs, glides, no overshoot); 4-sample motion blur. | — |
| Audio | 84 → **91 with VO** | −14.0 LUFS; delivered files −1.9 to −2.0 dBTP after AAC; true silence at «لا.»; phone-translated EQ; every cue synced to the picture. Verified analytically, not by ear here. | The VO, and one listening pass on phone speakers. |
| CTA | 93 | One action, «راسلني ونبداو.» with the composer and send tap; matches the Meta *Send message* button. | — |
| Originality | 91 | The full stop device («لا.» → «أحسن.» → the website), the question → answer callback, and the URL-to-browser morph. | — |

**Verdict:** every category the production controls is at 89 or higher. The two categories below 90 are held back by the one missing asset, **the owner's voice**, which the brief explicitly does not allow to be faked with an AI voice. The film is complete and VO-ready.

## Passes (brief §35) — what was found and fixed

| Pass | Finding | Fix |
|---|---|---|
| 1 Story & pacing | Violet seed grew while «Presentation أحسن.» was still leaving (17.5 s) | Words exit faster; seed starts at 17.47 s |
| 1 | CTA eyebrow overlapped the payoff line (34.0 s) | Staggered hand-off |
| 1 | Chat alone on the left of an empty frame (4.5–5.5 s) | Chat starts centred, slides aside when Drive arrives |
| 2 Visual | Hook card flew *behind* the chat window | Hook layer raised during the hand-off |
| 2 | Stickers «Videos/Files/Links هنا» sat in the Reels bottom overlay | Moved into the safe zone |
| 2 | Random flood looked messy | Hand-placed flood composition |
| 2 | Style fan: two creator sites hidden behind the third | Clean row of three with labels |
| 2 | Whole-page overview was a thin skewed strip | Isometric diagonal "case-study" view |
| 3 Typography | Stickers read «هنا Videos» for RTL readers | Corrected order |
| 3 | Consecutive caption phrases crossfaded into jumbled text | One morphing panel per line; clean swaps |
| 3 | Caption from one line ghosting under the next line or scene type | Captions leave before the next caption or type arrives |
| 3 | Arabic prefix touching English («للـClients») | Hair-space join (0.14 em) |
| 4 Motion | Hand-off bubble blinked for one frame | Instant bubble on landing |
| 4 | Collapse happened in 2 frames (read as a cut) | Cubic implosion over ~10 frames; lighter veil |
| 4 | Seed jumped from dot to square in 2 frames | Symmetric glide |
| 4 | Pull-back swung the page up through the caption | Shrink early, lengthen late |
| 4 | Overview receded too slowly under the incoming links | 0.37 s recede |
| 4 | «10 LINKS» → «1 LINK» double exposure | Sequential swap |
| 4 | Client view → payoff crossfade double exposure | Opaque sheet rises over the browser |
| 5 Sound | Hook 9 dB quieter than the body | Pulse and ostinato lifted (now −17 LUFS vs −14 body) |
| 5 | 68% of energy below 250 Hz (inaudible on phones) | Knock on kicks, brighter pads and keys, master EQ |
| 5 | «لا.» window had a −48 dB filter tail | Re-gated after mastering → exact digital silence |
| 5 | True peak +0.1 dBTP | 4× oversampled look-ahead limiter |
| 5 | AAC encoding pushed the Meta files to −0.8 dBTP (found by `scripts/verify.py`) | −2 dBTP master ceiling, audio remuxed into every file (picture untouched) → −1.9 dBTP delivered |
| 6 | SRT cues of 0.4–0.9 s in the hook | Short neighbours merged within each line: 23 cues, most ≥ 1.2 s |
| 6 Mobile | 4:5 feed crop | All essential text sits in y 285–1635, so a crop-safe 4:5 version ships |
| 7 Polish | Motion blur | 4 sub-frames, 180° shutter. The «لا» cut (14.45 s) falls between frames 433 and 434, and a 180° shutter never straddles it, so the freeze stays razor sharp |
| 7 | Frame 1 washed out: blur sub-frames sampled before t = 0 (empty stage) | Sub-frame times clamped to the film; `scripts/verify.py` now checks frame 1 of every file |

## Tests

**3-second question (§41)** — freeze at:

| Time | Question | Result |
|---|---|---|
| 3.0 s | Is this for creators? | ✅ UGC CREATOR / CONTENT CREATOR / VOICE OVER stacked, with a matching content card |
| 10.0 s | Problem recognized? | ✅ WhatsApp chat, Drive window, «Videos هنا / Files هنا / Links هنا», FINAL FINAL folders |
| 18.0 s | "He builds premium portfolio websites"? | ✅ «أنا نبنيلك Premium Website Portfolio» over a browser being built |
| 27.0 s | ONE LINK? | ✅ «بدل ما تبعث 10 LINKS» → «1 LINK» + yourname.com at 28.1 s |
| Final frame | What to do? | ✅ PREMIUM WEBSITE PORTFOLIO — «راسلني ونبداو.» with the message composer |

**Remove the voice (§42), sound-off:** creator (role stack) → mess (chat, Drive, stickers, flood) → confusion (client cursor, Access required, No results, three questions) → «لا.» → premium portfolio (built on screen) → one link (10 LINKS → 1 LINK) → answered questions → CTA. ✅ The story is carried by the picture and the designed captions.

**Remove the visuals (§43), sound-only:** can only be fully passed once the VO is recorded. The score alone already tells the arc: tension builds → silence → impact → warmth → the one-link chime → resolution.

**Technical:** 1089 frames, 30 fps CFR, yuv420p, BT.709 tagged, AAC 48 kHz; −14.0 LUFS integrated, −1.9 to −2.0 dBTP measured on the delivered MP4s (EBU R128, `scripts/verify.py`); the render is deterministic (the same `t` gives the same frame).
