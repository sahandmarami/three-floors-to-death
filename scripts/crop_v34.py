#!/usr/bin/env python3
"""Crop user screenshots into halves/quadrants for detailed VLM analysis."""
from PIL import Image
import os

SRC = '/home/z/my-project/download/drive_v34/extracted/'
DST = '/home/z/my-project/download/drive_v34/crops/'
os.makedirs(DST, exist_ok=True)

files = [f for f in os.listdir(SRC) if f.endswith('.jpg')]
for f in files:
    im = Image.open(SRC + f)
    w, h = im.size
    tag = f.replace('Screenshot_', '').replace('.jpg', '').strip()[:12]
    # left half and right half (RTL game: panels usually center/left)
    im.crop((0, 0, w // 2, h)).save(f'{DST}{tag}_L.png')
    im.crop((w // 2, 0, w, h)).save(f'{DST}{tag}_R.png')
    # center strip (where panels often are)
    im.crop((w // 4, 0, 3 * w // 4, h)).save(f'{DST}{tag}_C.png')
    # bottom strip (announce/toast area)
    im.crop((0, int(h * 0.6), w, h)).save(f'{DST}{tag}_B.png')
print('crops saved:', len(os.listdir(DST)))
