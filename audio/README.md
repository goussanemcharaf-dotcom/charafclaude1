# audio/

`npm run audio` (scripts/build_audio.py) writes `music.wav`, `sfx.wav` and `mix.wav` here. They are regenerated, so they're not committed.

**VO slot:** put your recorded voice-over here as `vo.wav` (48 kHz / 24-bit preferred), aligned so that t = 0 is the first frame of the ad. Then run `npm run export`: the VO is mixed on top, the music is ducked under speech, and everything is mastered to −14 LUFS / −1 dBTP. See `deliverables/12_production_notes/VO_Recording_Guide.md`.
