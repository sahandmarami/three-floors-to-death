#!/usr/bin/env python3
"""برش‌های زوم‌شده از اسکرین‌شات‌های باگ v30 برای تحلیل دقیق‌تر VLM"""
from PIL import Image
import os, glob

SH = '/home/z/my-project/scripts/userui30/'
OUT = SH + 'crops/'
os.makedirs(OUT, exist_ok=True)

files = sorted(glob.glob(SH + '*.jpg'))
print('files:', [os.path.basename(f) for f in files])

def crop_zoom(src, name, box, zoom=1.6):
    """box = (l, t, r, b) در کسرهای 0..1 از تصویر"""
    im = Image.open(src)
    W, H = im.size
    l, t, r, b = int(box[0]*W), int(box[1]*H), int(box[2]*W), int(box[3]*H)
    c = im.crop((l, t, r, b))
    if zoom != 1:
        c = c.resize((int(c.width*zoom), int(c.height*zoom)), Image.LANCZOS)
    c.save(OUT + name, quality=92)
    print(name, c.size)

# ترتیب فایل‌ها بر اساس نام (ساعت)
# 1) پنل دستفروش — وسط تصویر ۱
crop_zoom(files[0], 'p1_peddler_full.png', (0.18, 0.02, 0.85, 0.98), 1.4)
crop_zoom(files[0], 'p1_peddler_items.png', (0.30, 0.18, 0.75, 0.75), 2.2)
# 2) چیپ‌های سلاح چپ + دکمه‌های ستون چپ — تصویر ۲
crop_zoom(files[1], 'p2_leftcol.png', (0.0, 0.05, 0.30, 0.95), 1.8)
crop_zoom(files[1], 'p2_right_build.png', (0.70, 0.30, 1.0, 1.0), 1.8)
# 3) پنل کوله/سلاح‌ها — سمت راست تصویر ۳
crop_zoom(files[2], 'p3_backpack.png', (0.35, 0.0, 1.0, 1.0), 1.5)
# 4) دکمه‌های منوی اصلی — راست تصویر ۴
crop_zoom(files[3], 'p4_menu_buttons.png', (0.55, 0.05, 1.0, 0.95), 1.6)
print('done')
