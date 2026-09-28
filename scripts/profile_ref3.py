# -*- coding: utf-8 -*-
"""پروفایل ستونی فقط روی ناحیه‌ی مکعب‌های هر باند (حذف نوار عنوان)"""
import numpy as np
from PIL import Image

SRC = '/home/z/my-project/assets/shop-ref.img'
img = Image.open(SRC).convert('RGB')
W, H = img.size
a = np.asarray(img).astype(int)
bg = np.array([20, 32, 43])
mask = (np.abs(a - bg).sum(axis=2) > 45)

bands = [(40, 427), (452, 805), (832, 1254)]

for bi, (y0, y1) in enumerate(bands):
    sub_full = mask[y0:y1]
    rs = sub_full.sum(axis=1)
    # شروع مکعب‌ها: اولین سطرِ محتوایی > 800px (عنوان باریک‌تر است)
    cube_start = None
    for i, v in enumerate(rs):
        if v > 800:
            cube_start = y0 + i
            break
    print(f'===== BAND {bi}: y{y0}-{y1}, cubes from y{cube_start} =====')
    sub = mask[cube_start:y1]
    cs = sub.sum(axis=0)
    segs = []
    ins = False
    for x in range(W):
        if cs[x] > 8 and not ins:
            x0, ins = x, True
        elif cs[x] <= 8 and ins:
            segs.append((x0, x)); ins = False
    if ins: segs.append((x0, W))
    # ادغام شکاف‌های کوچک (< 18px) — درز بین مکعب‌ها معمولاً ~20-40px است
    print(f'raw segments: {len(segs)}')
    for s in segs:
        print(f'    x {s[0]:4d}-{s[1]:4d}  w={s[1]-s[0]:4d}')
