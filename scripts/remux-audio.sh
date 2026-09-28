#!/usr/bin/env bash
# Re-mux the current audio mix into every delivered video without re-encoding
# the picture (video stream copied). Use after changing only the sound.
set -euo pipefail
cd "$(dirname "$0")/.."
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
AUDIO=audio/mix.wav; [ -f audio/mix_vo.wav ] && AUDIO=audio/mix_vo.wav
for f in deliverables/01_master/*.mp4 deliverables/02_meta_ads/*.mp4 deliverables/03_clean/*.mp4 deliverables/04_arabic_subtitles/*.mp4; do
  br=256k; [[ "$f" == *01_master* ]] && br=320k
  "$FF" -y -hide_banner -loglevel error -i "$f" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a $br -ar 48000 -ac 2 -shortest -movflags +faststart "$f.tmp.mp4"
  mv "$f.tmp.mp4" "$f"; echo "remuxed $f ($br)"
done
