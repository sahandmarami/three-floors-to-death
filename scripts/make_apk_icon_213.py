#!/usr/bin/env python3
# (۲۱٫۳) آیکون جدید APK از فایل کاربر — «ایکون.png» (۱۲۵۴×۱۲۵۴)
# خروجی: همه‌ی چگالی‌های mipmap + نسخه‌ی بزرگ download/apk/icon.png
from PIL import Image
import os

SRC = '/home/z/my-project/download/drive_assets/extracted/ایکون.png'
RES = '/home/z/my-project/android/res'

im = Image.open(SRC).convert('RGBA')
print('source:', im.size, im.mode)

DENS = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
for d, size in DENS.items():
    out = os.path.join(RES, d, 'ic_launcher.png')
    im.resize((size, size), Image.LANCZOS).save(out)
    print('wrote', out, size)

# نسخه‌ی بزرگ برای مستندها/گیت‌هاب
im.resize((512, 512), Image.LANCZOS).save('/home/z/my-project/download/apk/icon.png')
# آیکون وب/پیش‌نمایش هم تازه شود
im.resize((512, 512), Image.LANCZOS).save('/home/z/my-project/download/icon.png')
print('done')
