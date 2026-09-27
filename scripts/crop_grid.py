# -*- coding: utf-8 -*-
"""برش شبکه‌ی ثابت ۳×۴ از تصویر مرجع (مراکز ستون‌ها: 196/479/764/1058)
خروجی: assets/crops/cube_R{r}C{c}.png + شیت پیش‌نمایش assets/crops/_sheet.png
"""
import numpy as np
from PIL import Image
import os, json

SRC = '/home/z/my-project/assets/shop-ref.img'
OUT = '/home/z/my-project/assets/crops'
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

img = Image.open(SRC).convert('RGB')
W, H = img.size

# مرزهای ستونی (میانِ مراکز مکعب‌ها) + حاشیه
X_CUTS = [45, 340, 622, 912, 1216]
# مرزهای سطری (عنوان بالای هر ردیف حذف می‌شود)
Y_CUTS = [(118, 432), (512, 808), (896, 1254)]

meta = []
for ri, (ry0, ry1) in enumerate(Y_CUTS):
    for ci in range(4):
        x0, x1 = X_CUTS[ci], X_CUTS[ci + 1]
        crop = img.crop((x0, ry0, x1, ry1))
        side = max(crop.size)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(crop, ((side - crop.size[0]) // 2, (side - crop.size[1]) // 2))
        p = f'{OUT}/cube_R{ri}C{ci}.png'
        sq.save(p)
        meta.append({'file': p, 'r': ri, 'c': ci,
                     'box': [x0, ry0, x1, ry1], 'side': side})
        print(f'R{ri}C{ci}: ({x0},{ry0})-({x1},{ry1})  {x1-x0}x{ry1-ry0}')

# شیت پیش‌نمایش ۴×۳ برای بازبینی سریع
sheet = Image.new('RGB', (4 * 310 + 30, 3 * 360 + 40), (10, 14, 22))
for m in meta:
    im = Image.open(m['file']).convert('RGBA').resize((300, 300), Image.LANCZOS)
    sheet.paste(im, (10 + m['c'] * 310, 10 + m['r'] * 360), im)
sheet.save(f'{OUT}/_sheet.png')
json.dump(meta, open(f'{OUT}/meta.json', 'w'), indent=1)
print('saved 12 crops + sheet')
