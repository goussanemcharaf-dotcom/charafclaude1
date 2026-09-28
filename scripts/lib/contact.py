# Contact sheet: python3 scripts/lib/contact.py out.png cols thumbW img1 img2 ...
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
pad, lab = 8, 26
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + lab) + pad), (40, 40, 44))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
except Exception:
    font = None
for i, (im, f) in enumerate(zip(ims, files)):
    r, c = divmod(i, cols)
    x, y = pad + c * (tw + pad), pad + r * (th + pad + lab)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    d.text((x + 2, y + 4), f.split('/')[-1], fill=(230, 230, 230), font=font)
sheet.save(out)
print(out, sheet.size)
