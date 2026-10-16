#!/usr/bin/env python3
"""crop v36 — برش نواحی اسکرین‌شات کاربر برای یافتن آیکون کوله‌پشتی"""
from PIL import Image
import os

D = '/home/z/my-project/download/drive_v33/'
OUT = '/home/z/my-project/scripts/shots36/'
os.makedirs(OUT, exist_ok=True)

for f in os.listdir(D):
    if not f.endswith('.jpg'):
        continue
    im = Image.open(D + f)
    w, h = im.size
    tag = f.replace('Screenshot_', '').replace('   .jpg', '')[:12]
    # نسخه کوچک کل
    im.resize((w // 3, h // 3)).save(OUT + f'full_{tag}.png')
    # نوار چپ (ریل دکمه‌ها)
    im.crop((0, 0, int(w * 0.12), h)).save(OUT + f'left_{tag}.png')
    # بالای صفحه (اعلان‌ها)
    im.crop((0, 0, w, int(h * 0.22))).save(OUT + f'top_{tag}.png')
    print(f'{f}: {w}x{h} -> {tag}')
print('done')
