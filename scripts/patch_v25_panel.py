#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — تایپوگرافی پنل‌های اورلی (توقف/تنظیمات/باخت/درباره) با مقیاس اندروید
+ اصلاح کامنت قدیمی waveLabel"""
S = '/home/z/my-project/scripts/'

def patch(fn, pairs):
    path = S + fn
    data = open(path, encoding='utf-8').read()
    for old, new, cnt in pairs:
        n = data.count(old)
        assert n >= cnt, f'{fn}: «{old[:60]}» فقط {n} بار (انتظار ≥{cnt})'
        data = data.replace(old, new)
    open(path, 'w', encoding='utf-8').write(data)
    print(f'{fn}: OK')

patch('v3_part1.html', [
    (".panel h1{font-size:28px;margin-bottom:8px;color:#ffd873;text-shadow:0 2px 12px rgba(255,190,60,.3)}",
     ".panel h1{font-size:calc(29px * var(--uiz,1));margin-bottom:8px;color:#ffd873;text-shadow:0 2px 12px rgba(255,190,60,.3)}", 1),
    (".panel h2{font-size:20px;margin-bottom:4px;color:#ffd873}",
     ".panel h2{font-size:calc(21px * var(--uiz,1));margin-bottom:6px;color:#ffd873}", 1),
    (".subtitle{color:#b7c5e6;font-size:14px;margin-bottom:4px}",
     ".subtitle{color:#b7c5e6;font-size:calc(14.5px * var(--uiz,1));margin-bottom:5px}", 1),
    (".hint{color:#8fa3cf;font-size:11.5px;margin-top:14px}",
     ".hint{color:#8fa3cf;font-size:calc(11.5px * var(--uiz,1));margin-top:14px}", 1),
    (".stat-line{color:#b7c5e6;font-size:13px;margin-top:4px}",
     ".stat-line{color:#b7c5e6;font-size:calc(13.5px * var(--uiz,1));margin-top:4px}", 1),
])

# کامنت stale
patch('v4_chapters.js', [
    ("/* برچسب موج برای HUD (۲۴٫۰): «فصل ۲ · موج ۱۰ از ۳۶» — پیشرفتِ کل همیشه دیده شود */",
     "/* برچسب مرحله برای HUD (۲۵٫۰): فقط «مرحله ۱۰» — مثل بازی‌های واقعی، بدون فصل/کل */", 1),
])

print('PANEL TYPOGRAPHY OK')
