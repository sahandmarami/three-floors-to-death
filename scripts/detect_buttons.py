#!/usr/bin/env python3
"""Detect dark-blue rounded button rectangles in user screenshots via color masking."""
from PIL import Image
import numpy as np

def analyze(path, name):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    # dark blue chips: rgb roughly (24,36,74)..(40,60,120) — high blue, low red
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mask = (b > 55) & (b < 140) & (r < 60) & (g < 80) & (b - r > 25)
    # find connected boxes via simple row/col projection on downsampled grid
    # split into 40px cells
    ys, xs = np.where(mask)
    print(f'\n== {name} ({w}x{h}) blue-ish px: {len(xs)}')
    if len(xs) == 0:
        return
    # cluster: grid of 60px cells, keep cells with >40% blue
    cell = 60
    grid = np.zeros((h // cell + 1, w // cell + 1), dtype=int)
    for y, x in zip(ys[::7], xs[::7]):
        grid[y // cell, x // cell] += 1
    # print significant clusters
    from scipy import ndimage
    lbl, n = ndimage.label(grid > 3)
    for i in range(1, n + 1):
        cells = np.argwhere(lbl == i)
        y0, x0 = cells.min(0) * cell
        y1, x1 = (cells.max(0) + 1) * cell
        if (y1 - y0) * (x1 - x0) < 120 * 120:
            continue  # too small
        print(f'  blue block: x={x0}-{x1}, y={y0}-{y1}  (w={x1-x0}, h={y1-y0})')

for i in range(1, 5):
    try:
        analyze(f'/home/z/my-project/bugs29/bug{i}.jpg', f'bug{i}')
    except Exception as e:
        print(f'bug{i} ERR {e}')
