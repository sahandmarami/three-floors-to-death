#!/usr/bin/env python3
"""برش ناحیه‌های مشکوک دو اسکرین‌شات برای بررسی دقیق VLM"""
from PIL import Image

# ۱) روز: ناحیه‌ی اعلان (بالا-وسط) — ادعای «متن روی متن»
img = Image.open('/home/z/my-project/scripts/shots15/02_day_bottomright.png')
w, h = img.size
img.crop((0, 0, w, int(h * 0.42))).save('/home/z/my-project/scripts/shots15/crop_day_top.png')
img.crop((int(w * 0.55), int(h * 0.5), w, h)).save('/home/z/my-project/scripts/shots15/crop_day_btn.png')

# ۲) کات‌سین باخت: گوشه‌ی پایین‌چپ — ادعای «دکمه‌ی رد کردن»
img2 = Image.open('/home/z/my-project/scripts/shots15/05_defeat_cine.png')
w2, h2 = img2.size
img2.crop((0, int(h2 * 0.62), int(w2 * 0.55), h2)).save('/home/z/my-project/scripts/shots15/crop_defeat_bl.png')
print('cropped:', w, h, '|', w2, h2)
