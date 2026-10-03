#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""نسخه‌ی ۲۰٫۴ — آماده‌سازی ۴ اسپرایت تصویری زامبی برای جاسازی در تک‌فایل بازی:
  ۱) برش دقیق با آلفا (پس‌زمینه‌ی سرمه‌ای قبلاً شفاف شده)
  ۲) آینه‌ افقی — اسپرایت‌ها رو به چپ‌اند؛ موتور بازی بدنه را «رو به راست»
     می‌پزد و با scale(z.dir) آینه می‌کند (سازگاری با ZSPR فعلی)
  ۳) هماهنگ‌سازی ظریف باس (کمی فلت‌تر/گرافیکی‌تر: رنگ ۰٫۹۳ + کنتراست ۱٫۰۶)
  ۴) تغییر اندازه به ۲ برابرِ اندازه‌ی نمایش در بازی (برای وضوح)
  ۵) کوانتیزه به پالت ۲۵۵رنگه (حجم کم) → base64 → scripts/spr_z_data.js
اندازه‌های نمایش در بازی (واحد جهان):
  normal: 84x64   fast: 84x86   tank: 106x103   boss: 178x144
"""
import base64
from PIL import Image, ImageEnhance

SRC = '/home/z/my-project/upload/spr_{}.png'
OUT_JS = '/home/z/my-project/scripts/spr_z_data.js'

# (کلید، ارتفاع هدف پخت=۲x نمایش، هماهنگ‌سازی؟)
SPEC = [
    ('normal', 168, False),
    ('fast',   168, False),
    ('tank',   212, False),
    ('boss',   356, True),
]

parts = []
total = 0
for key, th, harmonize in SPEC:
    im = Image.open(SRC.format(key)).convert('RGBA')
    # ۱) برش تنگ بر اساس آلفا
    bbox = im.getchannel('A').getbbox()
    im = im.crop(bbox)
    # ۲) آینه — رو به راست (قرارداد موتور)
    im = im.transpose(Image.FLIP_LEFT_RIGHT)
    # ۳) هماهنگ‌سازی باس
    if harmonize:
        im = ImageEnhance.Color(im).enhance(0.93)
        im = ImageEnhance.Contrast(im).enhance(1.06)
    # ۴) اندازه
    w = round(im.width * th / im.height)
    im = im.resize((w, th), Image.LANCZOS)
    # ۵) کوانتیزه + ذخیره‌ی موقت برای بازبینی
    q = im.quantize(colors=255, method=Image.FASTOCTREE)
    q = q.convert('RGBA') if 'transparency' not in q.info else q
    tmp = f'/home/z/my-project/upload/bake_{key}.png'
    q.save(tmp, optimize=True)
    b = open(tmp, 'rb').read()
    b64 = base64.b64encode(b).decode()
    total += len(b64)
    print(f'{key:7s} bake={w}x{th}px  png={len(b)//1024}KB  b64={len(b64)//1024}KB')
    parts.append(f"  {key}: 'data:image/png;base64,{b64}'")

with open(OUT_JS, 'w', encoding='utf-8') as f:
    f.write('/* (۲۰٫۴) اسپرایت‌های تصویری زامبی — ساخته‌شده توسط gen_spr202.py\n'
            '   ۴ اسپرایت (معمولی/سریع/تانک/باس) — آینه‌شده رو به راست، برش‌خورده،\n'
            '   ۲برابرِ اندازه‌ی نمایش، پالت ۲۵۵رنگه. پختِ قاب‌های متحرک: ZSPR.bakeImg */\n'
            'const ZIMG_DATA = {\n' + ',\n'.join(parts) + '\n};\n')
print(f'---\n{OUT_JS} written. total base64: {total//1024}KB')
