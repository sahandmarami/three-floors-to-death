#!/usr/bin/env python3
# detect grid in icons.png and crop cells
from PIL import Image
import numpy as np

im = Image.open('/home/z/my-project/scripts/icons.png').convert('RGB')
a = np.asarray(im).astype(int)
H, W, _ = a.shape
print('size', W, H)

# Column-wise mean brightness (to find vertical grid gaps)
colmean = a.mean(axis=(0, 2))
rowmean = a.mean(axis=(1, 2))

# find gaps: columns that are consistently bright (borders) or consistently uniform
# Cell borders: the VLM said cells have glowing blue borders on dark navy bg
colstd = a.std(axis=(0, 2))
rowstd = a.std(axis=(1, 2))

# print stats in windows
def runs(vals, lo, hi):
    out = []
    start = None
    for i, v in enumerate(vals):
        inside = lo <= v <= hi
        if inside and start is None:
            start = i
        elif not inside and start is not None:
            out.append((start, i - 1))
            start = None
    if start is not None:
        out.append((start, len(vals) - 1))
    return out

# detect low-variance vertical strips (uniform background between cells)
low_col = [1 if s < 18 else 0 for s in colstd]
low_row = [1 if s < 18 else 0 for s in rowstd]
col_runs = runs(low_col, 1, 1)
row_runs = runs(low_row, 1, 1)
# merge runs closer than 6px
def merge(rs, gap=6):
    out = []
    for r in rs:
        if out and r[0] - out[-1][1] <= gap:
            out[-1] = (out[-1][0], r[1])
        else:
            out.append(r)
    return out
col_runs = merge([r for r in col_runs if r[1] - r[0] >= 2])
row_runs = merge([r for r in row_runs if r[1] - r[0] >= 2])
print('uniform col strips:', col_runs)
print('uniform row strips:', row_runs)
