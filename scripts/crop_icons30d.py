#!/usr/bin/env python3
# inspect cell border structure via scanlines
from PIL import Image
import numpy as np

im = Image.open('/home/z/my-project/scripts/icons.png').convert('RGB')
a = np.asarray(im).astype(int)

def scan(name, vals, coords, label):
    print(f'--- {name} {label} ---')
    prev = None
    for i, v in zip(coords, vals):
        s = f'{i:4d}: {v}'
        if prev is not None and i - prev > 1:
            print('    ...')
        print(s)
        prev = i

# pistol cell horizontal scan at y=190 (middle of row1)
y = 190
row = a[y]
# print every 12px from x=195 to 545
xs = list(range(195, 546, 12))
print('PISTOL row y=190:')
for x in xs:
    print(f'  x={x:4d} rgb={tuple(row[x])}')

# vertical scan at x=370 (middle of pistol cell)
x = 370
col = a[:, x]
print('PISTOL col x=370:')
for y2 in range(20, 360, 12):
    print(f'  y={y2:4d} rgb={tuple(col[y2])}')

# row2 landmine vertical scan x=1378
x = 1378
col = a[:, x]
print('LANDMINE col x=1378:')
for y2 in range(430, 760, 10):
    print(f'  y={y2:4d} rgb={tuple(col[y2])}')

# row3 flashlight vertical scan x=1408
x = 1408
col = a[:, x]
print('FLASHLIGHT col x=1408:')
for y2 in range(700, 1024, 10):
    print(f'  y={y2:4d} rgb={tuple(col[y2])}')

# horizontal scan row3 at y=870 across boundaries between cells
y = 870
row = a[y]
print('ROW3 y=870 boundary scan x=260..300 and x=520..550:')
for x in range(255, 300, 5):
    print(f'  x={x:4d} rgb={tuple(row[x])}')
for x in range(515, 550, 5):
    print(f'  x={x:4d} rgb={tuple(row[x])}')
