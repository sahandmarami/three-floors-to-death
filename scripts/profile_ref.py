# -*- coding: utf-8 -*-
"""تشخیص ساختار تصویر مرجع با پروفایل سطر/ستون برای یافتن شبکه‌ی مکعب‌ها"""
import numpy as np
from PIL import Image

SRC = '/home/z/my-project/assets/shop-ref.img'
img = Image.open(SRC).convert('RGB')
W, H = img.size
a = np.asarray(img).astype(int)

bg = np.array([20, 32, 43])
diff = np.abs(a - bg).sum(axis=2)
mask = diff > 45

# پروفایل سطری: چند پیکسلِ محتوایی در هر سطر
rowsum = mask.sum(axis=1)
colsum = mask.sum(axis=0)

print('=== ROW bands (سطرهایی با محتوا > 60px) ===')
bands = []
inb = False
for y in range(H):
    if rowsum[y] > 60 and not inb:
        y0, inb = y, True
    elif rowsum[y] <= 60 and inb:
        bands.append((y0, y)); inb = False
if inb: bands.append((y0, H))
for b in bands:
    print(f'  y {b[0]:4d}-{b[1]:4d}  h={b[1]-b[0]:4d}  peak={rowsum[b[0]:b[1]].max():4d}')

print()
print('=== داخل هر باند: قطعات ستونی (محتوا > 30px) ===')
for bi, (y0, y1) in enumerate(bands):
    sub = mask[y0:y1]
    cs = sub.sum(axis=0)
    segs = []
    ins = False
    for x in range(W):
        if cs[x] > 30 and not ins:
            x0, ins = x, True
        elif cs[x] <= 30 and ins:
            segs.append((x0, x)); ins = False
    if ins: segs.append((x0, W))
    # ادغام قطعات خیلی نزدیک (شکاف < 12px)
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < 12:
            merged[-1] = (merged[-1][0], s[1])
        else:
            merged.append(list(s))
    print(f'band {bi} (y{y0}-{y1}): {len(merged)} قطعه')
    for s in merged:
        print(f'    x {s[0]:4d}-{s[1]:4d}  w={s[1]-s[0]:4d}')
