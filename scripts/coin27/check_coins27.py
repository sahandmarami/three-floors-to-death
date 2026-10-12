#!/usr/bin/env python3
# check_coins27.py — ساخت کلاژ برای ممیزی VLM + بررسی شفافیت
from PIL import Image
import glob

# بررسی آلفا
for f in sorted(glob.glob('coin_*.img')):
    im = Image.open(f)
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    if has_alpha:
        im = im.convert('RGBA')
        a = im.getchannel('A')
        mn, mx = a.getextrema()
        print(f, im.size, 'alpha:', mn, '-', mx)
    else:
        print(f, im.size, 'NO alpha', im.mode)

# کلاژ
tiles = []
for i in range(8):
    im = Image.open(f'coin_{i}.img').convert('RGBA')
    im.thumbnail((220, 220))
    tile = Image.new('RGBA', (240, 260), (30, 36, 60, 255))
    tile.paste(im, ((240 - im.width) // 2, 20), im)
    from PIL import ImageDraw
    d = ImageDraw.Draw(tile)
    d.text((10, 5), f'#{i}', fill=(255, 255, 255, 255))
    tiles.append(tile)
sheet = Image.new('RGBA', (240 * 4, 260 * 2), (20, 24, 40, 255))
for i, t in enumerate(tiles):
    sheet.paste(t, ((i % 4) * 240, (i // 4) * 260))
sheet.convert('RGB').save('coin_sheet.jpg', quality=88)
print('sheet saved')

# کلاژ شات از پیکرت تپانچه روی زمینه بازی
p = Image.open('/home/z/my-project/scripts/pistol27_preview.png').convert('RGBA')
pv = Image.new('RGBA', (300, 320), (30, 36, 60, 255))
pv.paste(p, (80, 90), p)
pv.convert('RGB').save('pistol_sheet.jpg', quality=90)
print('pistol sheet saved')
