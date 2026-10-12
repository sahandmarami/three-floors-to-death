#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ساخت بلوک CSS فونت وزیرمتن (base64) از فایل‌های woff2"""
import base64, os

FD = '/home/z/my-project/scripts/fonts'
OUT = '/home/z/my-project/scripts/vazir_font.css'

# name, weight, style
FONTS = [
    ('Vazirmatn-Regular.woff2', 400, 'normal'),
    ('Vazirmatn-Medium.woff2', 500, 'normal'),
    ('Vazirmatn-SemiBold.woff2', 600, 'normal'),
    ('Vazirmatn-Bold.woff2', 700, 'normal'),
    ('Vazirmatn-Black.woff2', 900, 'normal'),
]

css = []
css.append('/* ---------- (۲۵٫۰) فونت فارسی «وزیرمتن» — تعبیه‌شده در خود بازی ----------')
css.append('   ریشه‌ی «عربی‌نما شدنِ» متن‌ها: Tahoma روی اندروید نیست و مرورگر')
css.append('   به Noto Naskh Arabic (خط نسخ عربی) برمی‌گردد. حالا فونت فارسی')
css.append('   مدرنِ ایرانی داخل خود فایل است — بدون نیاز به اینترنت. ---------- */')

total = 0
for fname, weight, style in FONTS:
    path = os.path.join(FD, fname)
    b64 = base64.b64encode(open(path, 'rb').read()).decode('ascii')
    total += len(b64)
    css.append(f"@font-face{{font-family:'Vazirmatn';font-style:{style};font-weight:{weight};")
    css.append(f"  font-display:swap;src:url(data:font/woff2;base64,{b64}) format('woff2')}}")

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(css))

print(f'font css: {total/1024:.0f}KB base64 -> {OUT}')
