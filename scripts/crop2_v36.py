#!/usr/bin/env python3
"""crop2 v36 — برش دقیق ناحیه آیکون کوله‌پشتی از اسکرین‌شات مرجع"""
from PIL import Image
import os

D = '/home/z/my-project/download/drive_v33/'
OUT = '/home/z/my-project/scripts/shots36/'
f = 'Screenshot_۲۰۲۶۱۰۱۳_۱۹۴۸۳۵_   .jpg'
im = Image.open(D + f)
w, h = im.size
print(f'{w}x{h}')

# ریل چپ در تمام عرض — بزرگ‌نمایی ۲x
for (name, box) in {
    'rail_full': (0, 0, 350, h),
    'rail_top': (0, 0, 350, 400),
    'rail_mid': (0, 300, 350, 700),
    'rail_bot': (0, 600, 350, h),
}.items():
    c = im.crop(box)
    c = c.resize((c.width * 2, c.height * 2), Image.LANCZOS)
    c.save(OUT + name + '.png')
    print(name, box, '->', c.size)
print('done')
