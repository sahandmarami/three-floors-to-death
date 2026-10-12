#!/usr/bin/env python3
# process_all_coins.py — پردازش همه کاندیدها و ساخت پیش‌نمایش برای انتخاب
from PIL import Image, ImageDraw, ImageFilter
import glob

def process(src):
    im = Image.open(src).convert('RGBA')
    W, H = im.size
    px = im.load()
    xs, ys = [], []
    for y in range(0, H, 4):
        for x in range(0, W, 4):
            r, g, b, a = px[x, y]
            if r > 120 and g > 70 and b < 140 and r > b + 40 and (r + g) > 260:
                xs.append(x); ys.append(y)
    if not xs: return None
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    side = max(x1 - x0, y1 - y0) + 30
    side = min(side, W, H)
    box = (max(0, cx - side // 2), max(0, cy - side // 2), min(W, cx + side // 2), min(H, cy + side // 2))
    return im.crop(box)

# کلاژ همه پردازش‌شده‌ها
tiles = []
for i in range(8):
    im = process(f'coin_{i}.img')
    if im is None: continue
    im = im.resize((200, 200), Image.LANCZOS)
    tile = Image.new('RGBA', (220, 240), (30, 36, 60, 255))
    tile.paste(im, (10, 20), im if im.mode == 'RGBA' else None)
    d = ImageDraw.Draw(tile)
    d.text((10, 5), f'#{i}', fill=(255, 255, 255, 255))
    tiles.append(tile)
cols = 4
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGBA', (220 * cols, 240 * rows), (20, 24, 40, 255))
for i, t in enumerate(tiles):
    sheet.paste(t, ((i % cols) * 220, (i // cols) * 240))
sheet.convert('RGB').save('coin_sheet2.jpg', quality=90)
print('sheet2 saved —', len(tiles), 'coins')
