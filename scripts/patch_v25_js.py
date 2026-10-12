#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — پچ فونت Canvas در همه‌ی فایل‌های JS: Tahoma → Vazirmatn
+ بزرگ‌سازی متن کات‌سین‌ها (استوری موشن) با مقیاس UI
+ حذف تطویل عربی در mystery23
+ حذف دکمه تمام‌صفحه در mobile.js
"""
import re

S = '/home/z/my-project/scripts/'

def patch(fn, pairs, count_check=None):
    path = S + fn
    data = open(path, encoding='utf-8').read()
    orig = data
    for old, new, cnt in pairs:
        n = data.count(old)
        assert n >= cnt, f'{fn}: «{old[:50]}» فقط {n} بار (انتظار ≥{cnt})'
        data = data.replace(old, new)
    open(path, 'w', encoding='utf-8').write(data)
    print(f'{fn}: patched ({len(orig)} → {len(data)} bytes)')

# ---------- ۱) فونت Canvas: Tahoma → Vazirmatn (全局) ----------
files = [
    ('v3_part3.js', 3), ('v3_part5.js', 8), ('v4_cine23.js', 3),
    ('v4_transitions.js', 9), ('v4_intro_menu.js', 2), ('v4_defeat.js', 1),
    ('v4_shelter.js', 1),
]
for fn, cnt in files:
    patch(fn, [('Tahoma, sans-serif', 'Vazirmatn, Tahoma, sans-serif', cnt)])
# موارد بدون sans-serif
patch('v4_cine23.js', [("ctx.font = 'bold 15px Tahoma';", "ctx.font = 'bold 15px Vazirmatn, Tahoma';", 1)])
patch('v4_audio.js', [("c.font = 'bold 10px Tahoma';", "c.font = 'bold 10px Vazirmatn, Tahoma';", 1)])
patch('v4_drive.js', [("ctx.font = 'bold 7px Tahoma';", "ctx.font = 'bold 7px Vazirmatn, Tahoma';", 1)])
patch('v4_mystery23.js', [("ctx.font = 'bold 12px Tahoma';", "ctx.font = 'bold 12px Vazirmatn, Tahoma';", 1)])
patch('v4_shelter.js', [("ctx.font = 'bold 13px Tahoma';", "ctx.font = 'bold 13px Vazirmatn, Tahoma';", 1)])

# ---------- ۲) استوری موشن: متن کات‌سین با مقیاس UI درشت شود ----------
# __uiz در fitWrap ثبت می‌شود؛ داخل تابع در زمان فراخوانی خوانده می‌شود
# (v4_mobile.js بعد از cine23 لود می‌شود اما فقط در زمان اجرا نیاز است)
patch('v4_cine23.js', [
    # عنوان اصلی: 34 → 34×uiz
    ("ctx.font = '900 34px Vazirmatn, Tahoma, sans-serif';",
     "ctx.font = '900 ' + Math.round(34 * Math.max(1, window.__uiz || 1)) + 'px Vazirmatn, Tahoma, sans-serif';", 1),
    # زیرعنوان: 14 → 16×uiz
    ("ctx.font = 'bold 14px Vazirmatn, Tahoma, sans-serif';",
     "ctx.font = 'bold ' + Math.round(16 * Math.max(1, window.__uiz || 1)) + 'px Vazirmatn, Tahoma, sans-serif';", 1),
    # نوار پشت عنوان هم متناسب
    ("ctx.fillRect(0, H * 0.16 - 38, W, 84);",
     "ctx.fillRect(0, H * 0.16 - 40 * Math.max(1, window.__uiz || 1), W, 92 * Math.max(1, window.__uiz || 1));", 1),
    ("ctx.fillText(sub, W / 2, H * 0.16 + 28);",
     "ctx.fillText(sub, W / 2, H * 0.16 + 30 * Math.max(1, window.__uiz || 1));", 1),
])

# ---------- ۳) حذف تطویل عربی در متن بی‌سیم mystery23 ----------
patch('v4_mystery23.js', [
    ("stat.textContent = 'شــــوش... شوش...';", "stat.textContent = 'شوش... شوش...';", 1),
])

# ---------- ۴) حذف کامل دکمه‌ی تمام‌صفحه (درخواست قبلی کاربر) ----------
patch('v4_mobile.js', [
    ("""  /* دکمه‌ی تمام‌صفحه کنار دکمه‌های HUD (لمسی) — (۲۴٫۰) داخل گروه HUD چپ */
  if (IS_TOUCH) {
    const hudCtl = document.querySelector('#hud .hud-ctl');
    if (hudCtl) {
      const fs = document.createElement('button');
      fs.className = 'ctl-btn hud-mini';
      fs.id = 'btnFull';
      fs.title = 'تمام‌صفحه';
      fs.textContent = '⛶';
      fs.addEventListener('click', toggleFullscreen);
      hudCtl.appendChild(fs);
    }
  }
""",
     """  /* (۲۵٫۰) دکمه‌ی تمام‌صفحه حذف شد — درخواست کاربر: «کلا حذفش کن»»
     * داخل APK بازی خودش تمام‌صفحه است؛ در مرورگر هم F11 وجود دارد. */
""", 1),
])

# ---------- ۵) ثبت CINZ/__uiz در fitWrap (v4_mobile.js) ----------
patch('v4_mobile.js', [
    ("""  try {
    el.style.setProperty('--uiz', uiz);
    el.style.setProperty('--uiz2', ((1 + uiz) / 2).toFixed(3));
  } catch (e) {}""",
     """  try {
    el.style.setProperty('--uiz', uiz);
    el.style.setProperty('--uiz2', ((1 + uiz) / 2).toFixed(3));
  } catch (e) {}
  /* (۲۵٫۰) مقیاس UI برای متن‌های Canvas (کات‌سین/کمبو/تیترها) —
     همان ضریب --uiz تا متن‌های بومی Canvas هم روی گوشی درشت بمانند */
  window.__uiz = uiz;""", 1),
])

print('ALL JS PATCHES OK')
