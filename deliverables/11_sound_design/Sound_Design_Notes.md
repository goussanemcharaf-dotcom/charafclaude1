# 11 — Sound Design Notes

Everything you hear is **synthesized** by `scripts/build_audio.py`: no samples, no stock music, no licensing risk. Timing comes from `src/config/timeline.json` (VO cues and markers) and `src/config/sound.json` (166 SFX cues, see `Sound_Cue_Sheet.md`).

## Structure

| Time | Section | Score | Sound design |
|---|---|---|---|
| 0.0–4.0 | Hook | 112 BPM "modern pulse": soft kick with a phone-audible knock, felt-keys ostinato in D minor (D–A–F–C), low pad | Air swell at frame 1; a soft swipe on each role change (1.34 / 2.24 / 3.30 s); a swoosh as the card is "sent" |
| 4.0–8.2 | Old way | Bass joins; 8th-note hats | Message-sent pops; window slam on «Google Drive»; notification on «WhatsApp»; three comic "slaps" for FINAL v2 / FINAL FINAL / FINAL (use this one) |
| 8.2–10.9 | Videos / Files / Links | 16th hats, filter opening | Cluster thwips and a sticker slap on each «هنا»; a flood of pops panned wide |
| 10.9–14.45 | Client friction | 32nd hat rolls; tension riser (noise + detuned saws) | Mouse clicks, a denied buzz, a download blip, typing "portfolio", a soft error, three "question" tones |
| **14.45** | **«لا.»** | **Hard cut: true digital silence** (verified as 0.0 in the mix) | Nothing. The VO «لا» is the only sound. |
| 14.74–15.08 | Collapse | — | Reverse swell sucked into the point |
| 15.08 | Impact | — | Deep sub impact (62→32 Hz) with a soft transient and high shimmer |
| 15.1–26.2 | Clarity | Half-time D major: Dmaj9 → Gmaj9 → Em9 → A6sus → F#m7 → Gmaj9. Felt-keys arpeggio, sub bass, soft kick, rim, shaker | Seed bloom; glass chime as the window forms; grid "shimmer sweep"; typing «Lina»; sparkle on «من الصفر»; long whoosh on the pull-back; gentle ticks as sections build; swishes for the style fan |
| 26.25–27.98 | 10 links | Groove drops out, pad filtered to Em7 | Ten scattered pops, then a riser into… |
| **27.98** | **One link** | Full band returns on Dmaj9 | The signature: a latch click, bright bell chord (D6 A6 D7) and a soft sub. The loudest moment (≈ −8 LUFS momentary). |
| 28.4–32.0 | Client visit | Bm9 → Gmaj9 | URL "zip", window unroll, client click, load blip, three ascending positive ticks for the answered questions (A5 → B5 → C#6) |
| 32.2–34.0 | Payoff | Fullest voicing plus an airy octave pad | Warm whoosh as the page rises |
| 34.15–36.3 | CTA | Final Dmaj9 ring-out, fade | Soft impact and final chime; composer typing; send pop and swoosh |

## Mix and master

- **Phone translation:** 68% of the energy initially sat below 250 Hz, which phones can't reproduce. The fixes: kicks carry a 1.4 kHz knock, the pads are brighter, and a master EQ adds a 38 Hz high-pass, −3 dB low shelf at 130 Hz and +4 dB high shelf at 3.5 kHz. Measured balance now: sub 20%, low 28%, mid 47%, high+air 4%.
- **Loudness:** −14.0 LUFS integrated with a −2.0 dBTP ceiling (4× oversampled look-ahead limiter). The ceiling leaves room for AAC overshoot: the delivered MP4s measure **−1.9 to −2.0 dBTP**, inside Meta's −1 dBTP guidance.
- **Section loudness (no VO, measured):** hook −17.1 · old way −14.3 · chaos −14.3 · client −12.5 · insight −15.2 · build −13.6 · system −16.9 · 10 links −17.2 · one link −12.0 · payoff −15.9 · CTA −11.4 LUFS. This is the intended energy curve: build → silence → warm → dip → peak → resolve.
- **Reverb:** a synthetic stereo hall (2.2 s) on a send, used mainly by the impact, bells and shimmer.

## Voice-over slot (the missing asset)

The script is in the first person («أنا نبنيلك», «راسلني»), and the brief forbids an AI voice, so the VO must be the owner's own recording. Drop it in as `audio/vo.wav`, aligned so that t = 0 is the first frame (see `12_production_notes/VO_Recording_Guide.md`). `build_audio.py` then:
1. high-passes the VO at 80 Hz and sets it to −16 LUFS,
2. ducks the score by up to −9 dB and the SFX by −4 dB under speech (sidechain envelope, 40 ms attack / 350 ms release),
3. masters the result to −14 LUFS / −1 dBTP as `audio/mix_vo.wav`, which the export uses automatically.

The «لا» silence is kept for the VO: the bed is gated there, but the VO passes through.

## Stems

`Stem_music.flac`, `Stem_sfx.flac` and `Stem_mix.flac` (48 kHz / 24-bit, lossless) are included for re-mixing in any DAW or editor.
