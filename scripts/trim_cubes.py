# -*- coding: utf-8 -*-
"""برش نهایی مکعب‌ها: نوار قیمت حذف، مکعب + قاب نگه داشته، همه ۲۶۴×۲۶۴"""
import numpy as np
from PIL import Image
import os, json

SRC = '/home/z/my-project/assets/crops'
OUT = '/home/z/my-project/assets/cubes'
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

BG = np.array([20, 32, 43])
KEYS = {
    'R0C0': 'repair', 'R0C1': 'speed', 'R0C2': 'health', 'R0C3': 'weapon',
    'R1C1': 'mg', 'R1C3': 'sniper',
    'R2C0': 'frost', 'R2C1': 'gatling', 'R2C3': 'turretUp',
    'R1C0': '_trap_base', 'R2C2': '_shotgun_base',
}
FINAL = 264

report = []
for tile, key in KEYS.items():
    img = Image.open(os.path.join(SRC, f'cube_{tile}.png')).convert('RGB')
    a = np.asarray(img).astype(int)
    Hh, Ww = a.shape[:2]
    # محتوای سطری در نوار میانی ۸۴٪
    c0, c1 = int(Ww * 0.08), int(Ww * 0.92)
    cont = (np.abs(a[:, c0:c1] - BG).sum(axis=2) > 45).mean(axis=1)
    # بالا: اولین سطر محتوایی (لبه‌ی قاب)
    top = next((i for i in range(Hh) if cont[i] > 0.5), 0)
    top = max(0, top - 6)
    # پایین مکعب: آخرین سطرِ پیوسته‌ی پهن (c >= 0.65) از بالا به پایین
    bottom = top
    for i in range(top, min(Hh, int(Hh * 0.9))):
        if cont[i] >= 0.65:
            bottom = i
        elif bottom > top and i - bottom > 14:   # بعد از قطعِ واضح، توقف
            break
    bottom = min(Hh, bottom + 7)
    # ستون‌ها: کادر محتوایی کامل (قاب‌های کناری)
    sub = (np.abs(a[top:bottom] - BG).sum(axis=2) > 45)
    colcnt = sub.sum(axis=0)
    cols = np.where(colcnt > (bottom - top) * 0.08)[0]
    x0, x1 = (max(0, cols.min() - 4), min(Ww, cols.max() + 4)) if len(cols) else (0, Ww)

    cube = img.crop((x0, top, x1, bottom))
    sq = Image.new('RGB', (max(cube.size),) * 2, tuple(BG.tolist()))
    sq.paste(cube, ((sq.width - cube.width) // 2, (sq.height - cube.height) // 2))
    sq = sq.resize((FINAL, FINAL), Image.LANCZOS)
    sq.save(os.path.join(OUT, f'{key}.png'))
    report.append({'key': key, 'tile': tile})
    print(f'{tile} -> {key}: rows {top}-{bottom} cols {x0}-{x1}')

# شیت بازبینی
sheet = Image.new('RGB', (6 * 190 + 70, 2 * 190 + 30), (10, 14, 22))
items = sorted([r['key'] for r in report])
for i, k in enumerate(items):
    im = Image.open(os.path.join(OUT, k + '.png')).resize((180, 180), Image.LANCZOS)
    sheet.paste(im, (10 + (i % 6) * 190, 10 + (i // 6) * 190))
sheet.save(os.path.join(OUT, '_sheet.png'))
print('saved', len(report), 'cubes +', '_sheet.png')
