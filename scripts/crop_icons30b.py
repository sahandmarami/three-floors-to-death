#!/usr/bin/env python3
# detect glowing blue cell borders in icons.png
from PIL import Image
import numpy as np

im = Image.open('/home/z/my-project/scripts/icons.png').convert('RGB')
a = np.asarray(im).astype(int)
H, W, _ = a.shape

r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
# border-ish: bluish (b > r+25) and reasonably bright
border = (b > r + 25) & (b > 60) & (g > 40)
colcnt = border.sum(axis=0)
rowcnt = border.sum(axis=1)

def peaks(cnt, thresh):
    out = []
    start = None
    for i, v in enumerate(cnt):
        if v >= thresh and start is None:
            start = i
        elif v < thresh and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(cnt) - 1))
    return [(s, e) for s, e in out if e - s >= 1]

print('col peaks (>=80):', peaks(colcnt, 80))
print('row peaks (>=80):', peaks(rowcnt, 80))

# Also: content-based — colorful pixels (saturated)
mx = a.max(axis=2); mn = a.min(axis=2)
sat = mx - mn
colorful = sat > 60
cc = colorful.sum(axis=0)
print('col content peaks (>=60):', peaks(cc, 60))
