# -*- coding: utf-8 -*-
"""جداسازی مکعب‌ها با مورفولوژی: فرسایش → برچسب‌گذاری → گسترش مجدد
خروجی: assets/crops/cube_R{r}C{c}.png + meta.json
"""
import numpy as np
from PIL import Image
from scipy import ndimage
import os, json

SRC = '/home/z/my-project/assets/shop-ref.img'
OUT = '/home/z/my-project/assets/crops'
os.makedirs(OUT, exist_ok=True)
# پاک‌سازی برش‌های قبلی
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))

img = Image.open(SRC).convert('RGB')
W, H = img.size
a = np.asarray(img).astype(int)
bg = np.array([20, 32, 43])
mask = (np.abs(a - bg).sum(axis=2) > 45)

# --- فرسایش برای قطع پل‌های نازک بین مکعب‌ها ---
r = 5
struct = ndimage.generate_binary_structure(2, 2)
er = ndimage.binary_erosion(mask, structure=struct, iterations=r)
labels, n = ndimage.label(er)
print('after erosion components:', n)

cores = []
for i in range(1, n + 1):
    ys, xs = np.where(labels == i)
    if len(ys) < 4000:            # هسته‌ی مکعب بزرگ است (در مقیاس کامل)
        continue
    cores.append({'i': i, 'x0': xs.min(), 'x1': xs.max(), 'y0': ys.min(), 'y1': ys.max(),
                  'cx': (xs.min() + xs.max()) / 2, 'cy': (ys.min() + ys.max()) / 2})
print('cube cores:', len(cores))

# --- گسترش مجدد هر هسته در ماسک اصلی (بازیابی قاب/هاله‌ی همان مکعب) ---
for c in cores:
    reg = (labels == c['i'])
    for _ in range(r + 2):
        reg = ndimage.binary_dilation(reg, structure=struct, iterations=2) & mask
    ys, xs = np.where(reg)
    c['fx0'], c['fx1'], c['fy0'], c['fy1'] = xs.min(), xs.max(), ys.min(), ys.max()

# --- چینش ۳×۴ بر اساس مرکز ---
cores.sort(key=lambda c: c['cy'])
rows, cur = [], [cores[0]]
for c in cores[1:]:
    if c['cy'] - cur[-1]['cy'] < 90:
        cur.append(c)
    else:
        rows.append(cur); cur = [c]
rows.append(cur)
print('rows:', [len(r_) for r_ in rows])

meta = []
for ri, r_ in enumerate(rows):
    r_.sort(key=lambda c: c['cx'])
    for ci, c in enumerate(r_):
        pad = 4
        x0 = max(0, c['fx0'] - pad); y0 = max(0, c['fy0'] - pad)
        x1 = min(W, c['fx1'] + pad); y1 = min(H, c['fy1'] + pad)
        crop = img.crop((x0, y0, x1, y1))
        side = max(crop.size)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(crop, ((side - crop.size[0]) // 2, (side - crop.size[1]) // 2))
        p = f'{OUT}/cube_R{ri}C{ci}.png'
        sq.save(p)
        meta.append({'file': p, 'r': ri, 'c': ci,
                     'box': [int(x0), int(y0), int(x1), int(y1)],
                     'side': side})
        print(f'  R{ri}C{ci}: box=({x0},{y0})-({x1},{y1})  {x1-x0}x{y1-y0}  side={side}')

json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
print('saved', len(meta), 'crops')
