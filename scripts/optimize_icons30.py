#!/usr/bin/env python3
# optimize icons: quantize + generate data-URI JS map
from PIL import Image
import os, json, base64

SRC = '/home/z/my-project/scripts/icons30'
OUT = SRC
total = 0
uris = {}
for name in sorted(os.listdir(SRC)):
    if not name.endswith('.png') or name == 'sheet.png':
        continue
    key = name[:-4]
    im = Image.open(f'{SRC}/{name}').convert('RGBA')
    # quantize with alpha (FASTOCTREE supports RGBA)
    q = im.quantize(colors=110, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
    p = f'{OUT}/{key}_q.png'
    q.save(p, optimize=True)
    sz = os.path.getsize(p)
    # if quantized is not much smaller, keep original
    if sz >= os.path.getsize(f'{SRC}/{name}'):
        q = im
        p = f'{SRC}/{name}'
        sz = os.path.getsize(p)
    total += sz
    with open(p, 'rb') as f:
        uris[key] = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    print(f'{key:12s} {sz:6d}B')

print(f'TOTAL: {total/1024:.0f}KB')
json.dump(uris, open(f'{OUT}/uris.json', 'w'))
print('uris.json saved with', len(uris), 'icons')
