# -*- coding: utf-8 -*-
"""تحلیل ریزتر: داخل هر باندِ ردیف، مرز عنوان/مکعب‌ها و قطعات ستونی هر مکعب"""
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
    print(f'===== BAND {bi}: y{y0}-{y1} =====')
    sub = mask[y0:y1]
    rs = sub.sum(axis=1)
    # چاپ پروفایل سطری فشرده (هر 10px)
    print('row profile (هر سطر: y محلی، تعداد محتوا):')
    for i in range(0, len(rs), 10):
        seg = rs[i:i+10].mean()
        bar = '#' * int(seg / 20)
        print(f'   {y0+i:4d} {int(seg):4d} {bar}')
    # ستون‌ها با آستانه‌ی پایین و بدون ادغام
    cs = sub.sum(axis=0)
    segs = []
    ins = False
    for x in range(W):
        if cs[x] > 8 and not ins:
            x0, ins = x, True
        elif cs[x] <= 8 and ins:
            segs.append((x0, x)); ins = False
    if ins: segs.append((x0, W))
    print(f'column segments (thr=8): {len(segs)}')
    for s in segs:
        print(f'    x {s[0]:4d}-{s[1]:4d}  w={s[1]-s[0]:4d}')
    print()
