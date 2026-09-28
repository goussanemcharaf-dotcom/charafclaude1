#!/usr/bin/env python3
"""Verify every delivered video: streams, duration, loudness (EBU R128) and
that frame 1 is fully formed (catches blank/washed-out first frames)."""
import glob, json, os, re, subprocess, sys
import numpy as np
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ok = True
for f in sorted(glob.glob(os.path.join(ROOT, 'deliverables/**/*.mp4'), recursive=True)):
    rel = os.path.relpath(f, ROOT)
    info = subprocess.run([FF, '-hide_banner', '-i', f], capture_output=True, text=True).stderr
    dur = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
    secs = int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3]) if dur else 0
    v = re.search(r'Video: (\w+).*?, (\d+)x(\d+).*?, ([\d.]+) fps', info)
    if not v or not dur:
        print(f'SKIP {rel} (incomplete / still encoding)'); ok = False; continue
    a = re.search(r'Audio: (\w+).*?, (\d+) Hz, (\w+)', info)
    lo = subprocess.run([FF, '-hide_banner', '-nostats', '-i', f, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', lo); TP = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', lo)
    raw = subprocess.run([FF, '-v', 'error', '-i', f, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    w, h = int(v[2]), int(v[3])
    g = np.frombuffer(raw, np.uint8)[: w * h].reshape(h, w)
    dark = (g < 60).mean() * 100          # share of dark (ink) pixels: a formed frame has real type
    size = os.path.getsize(f) / 1e6
    status = 'OK'
    if dark < 0.5 and 'Guide' not in rel: status = 'FIRST FRAME LOOKS EMPTY/WASHED'; ok = False
    print(f'{status:4} {rel}\n     {v[1]} {w}x{h} {v[4]}fps · {secs:.2f}s · {a[1] if a else "no audio"} {a[2] if a else ""}Hz · '
          f'{I[-1] if I else "?"} LUFS · TP {TP[-1] if TP else "?"} dBFS · {size:.1f} MB · frame1 ink {dark:.1f}%')
sys.exit(0 if ok else 1)
