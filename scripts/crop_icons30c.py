#!/usr/bin/env python3
# find content bbox inside each expected cell region
from PIL import Image
import numpy as np

im = Image.open('/home/z/my-project/scripts/icons.png').convert('RGB')
a = np.asarray(im).astype(int)
H, W, _ = a.shape
mx = a.max(axis=2); mn = a.min(axis=2)
sat = mx - mn
bright = mx > 70
colorful = (sat > 55) & (mx > 60)
content = bright | colorful

# expected cells from VLM (l%, t%, r%, b%) of 1536x1024
CELLS = {
  'pistol':    (13.5, 3.5, 35.0, 33.5),
  'shotgun':   (38.5, 3.5, 61.0, 33.5),
  'rifle':     (64.5, 3.5, 86.5, 33.5),
  'firstaid':  (2.5, 44.0, 17.7, 70.0),
  'ammobox':   (18.5, 44.0, 34.2, 70.0),
  'energy':    (35.0, 44.0, 50.0, 70.0),
  'vest':      (51.0, 44.0, 66.0, 70.0),
  'grenade':   (67.0, 44.0, 82.0, 70.0),
  'landmine':  (82.0, 44.0, 97.5, 71.5),
  'backpack':  (2.0, 71.5, 17.5, 98.0),
  'runner':    (18.3, 71.5, 33.8, 98.0),
  'shield':    (34.8, 71.5, 50.0, 98.0),
  'radar':     (51.2, 71.5, 66.5, 98.0),
  'binoculars':(67.6, 71.5, 82.9, 98.0),
  'flashlight':(84.0, 71.5, 99.4, 98.0),
}

for name, (l, t, rr, bb) in CELLS.items():
    x0, y0 = int(W * l / 100), int(H * t / 100)
    x1, y1 = int(W * rr / 100), int(H * bb / 100)
    reg = content[y0:y1, x0:x1]
    ys, xs = np.where(reg)
    if len(xs) == 0:
        print(f'{name:12s} NO CONTENT in region {x0},{y0},{x1},{y1}')
        continue
    cx0, cx1 = xs.min() + x0, xs.max() + x0
    cy0, cy1 = ys.min() + y0, ys.max() + y0
    # fill ratio & bbox size
    print(f'{name:12s} cell=({x0:4d},{y0:3d},{x1:4d},{y1:3d}) content=({cx0:4d},{cy0:3d},{cx1:4d},{cy1:3d}) size={cx1-cx0:3d}x{cy1-cy0:3d} fill={len(xs)/((x1-x0)*(y1-y0)):.2f}')
