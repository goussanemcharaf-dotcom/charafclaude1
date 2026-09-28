# Frame strip for motion QA: python3 scripts/lib/strip.py frames_dir out.png t0 t1 step_frames [fps] [thumbW]
import sys
from PIL import Image, ImageDraw
d, out, t0, t1, step = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5])
fps = float(sys.argv[6]) if len(sys.argv) > 6 else 30
tw = int(sys.argv[7]) if len(sys.argv) > 7 else 200
th = int(tw * 1920 / 1080)
frames = list(range(int(round(t0 * fps)), int(round(t1 * fps)) + 1, step))
cols = min(len(frames), 10)
rows = (len(frames) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 4) + 4, rows * (th + 20) + 4), (30, 30, 34))
dr = ImageDraw.Draw(sheet)
for k, f in enumerate(frames):
    try: im = Image.open(f'{d}/{f:05d}.png').convert('RGB').resize((tw, th), Image.LANCZOS)
    except FileNotFoundError: continue
    r, c = divmod(k, cols); x, y = 4 + c * (tw + 4), 4 + r * (th + 20)
    sheet.paste(im, (x, y + 16)); dr.text((x + 2, y + 2), f'{f / fps:.2f}s', fill=(220, 220, 220))
sheet.save(out); print(out, sheet.size)
