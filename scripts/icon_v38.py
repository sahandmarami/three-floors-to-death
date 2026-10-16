#!/usr/bin/env python3
# icon_v38.py — ساخت آیکون‌های APK از webp کاربر
from PIL import Image
import os

src = '/tmp/feedback_v30/ایکون_بازی.png'   # قبلاً تبدیل شده (RGBA)
if not os.path.exists(src):
    src = '/tmp/feedback_v30/ایکون بازی.webp'

img = Image.open(src).convert('RGBA')
print('source:', img.size, img.mode)

# برش مربع مرکزی (اگر لازم باشد)
w, h = img.size
if w != h:
    m = min(w, h)
    img = img.crop(((w - m) // 2, (h - m) // 2, (w + m) // 2, (h + m) // 2))
    print('cropped to square:', img.size)

res = '/home/z/my-project/android/res'
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
for folder, size in sizes.items():
    out = os.path.join(res, folder, 'ic_launcher.png')
    img.resize((size, size), Image.LANCZOS).save(out, 'PNG')
    print(f'{out} ({size}x{size}, {os.path.getsize(out)//1024}KB)')

# نسخه‌ی مرجع در download
img.resize((512, 512), Image.LANCZOS).save('/home/z/my-project/download/icon.png', 'PNG')
print('reference: /home/z/my-project/download/icon.png')

# favicon کوچک برای HTML (base64)
fav = img.resize((64, 64), Image.LANCZOS)
fav.save('/tmp/favicon64.png', 'PNG', optimize=True)
import base64
b64 = base64.b64encode(open('/tmp/favicon64.png', 'rb').read()).decode()
open('/tmp/favicon_b64.txt', 'w').write(b64)
print('favicon b64 length:', len(b64))
