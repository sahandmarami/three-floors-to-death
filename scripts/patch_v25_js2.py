#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — تعمیر فایل‌های دوبار پچ‌شده + ادامه بخش‌های ۲ تا ۵"""
import re

S = '/home/z/my-project/scripts/'

# ---------- ۰) نرمال‌سازی پیشوندهای تکراری Vazirmatn ----------
for fn in ['v3_part3.js', 'v3_part5.js', 'v4_cine23.js']:
    path = S + fn
    data = open(path, encoding='utf-8').read()
    before = data.count('Vazirmatn, Vazirmatn')
    data = re.sub(r'(?:Vazirmatn, )+Tahoma', 'Vazirmatn, Tahoma', data)
    # حالت بدون Tahoma: (Vazirmatn, )+Vazirmatn, Tahoma هم بالا پوشش داده شد
    open(path, 'w', encoding='utf-8').write(data)
    print(f'{fn}: normalized {before} duplicate prefixes')

def patch(fn, pairs):
    path = S + fn
    data = open(path, encoding='utf-8').read()
    for old, new, cnt in pairs:
        n = data.count(old)
        assert n >= cnt, f'{fn}: «{old[:60]}» فقط {n} بار (انتظار ≥{cnt})'
        data = data.replace(old, new)
    open(path, 'w', encoding='utf-8').write(data)
    print(f'{fn}: OK')

# ---------- ۲) استوری موشن: متن کات‌سین با مقیاس UI درشت شود ----------
UZ = 'Math.max(1, window.__uiz || 1)'
patch('v4_cine23.js', [
    ("ctx.font = '900 34px Vazirmatn, Tahoma, sans-serif';",
     f"ctx.font = '900 ' + Math.round(34 * {UZ}) + 'px Vazirmatn, Tahoma, sans-serif';", 1),
    ("ctx.font = 'bold 14px Vazirmatn, Tahoma, sans-serif';",
     f"ctx.font = 'bold ' + Math.round(16 * {UZ}) + 'px Vazirmatn, Tahoma, sans-serif';", 1),
    ("ctx.fillRect(0, H * 0.16 - 38, W, 84);",
     f"ctx.fillRect(0, H * 0.16 - 40 * {UZ}, W, 92 * {UZ});", 1),
    ("ctx.fillText(sub, W / 2, H * 0.16 + 28);",
     f"ctx.fillText(sub, W / 2, H * 0.16 + 30 * {UZ});", 1),
])

# ---------- ۳) حذف تطویل عربی ----------
patch('v4_mystery23.js', [
    ("stat.textContent = 'شــــوش... شوش...';", "stat.textContent = 'شوش... شوش...';", 1),
])

# ---------- ۴) حذف کامل دکمه‌ی تمام‌صفحه ----------
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
     """  /* (۲۵٫۰) دکمه‌ی تمام‌صفحه حذف شد — درخواست کاربر: «کلا حذفش کن»
     داخل APK بازی خودش تمام‌صفحه است؛ در مرورگر هم F11 وجود دارد. */
""", 1),
])

# ---------- ۵) ثبت __uiz در fitWrap ----------
patch('v4_mobile.js', [
    ("""  try {
    el.style.setProperty('--uiz', uiz);
    el.style.setProperty('--uiz2', ((1 + uiz) / 2).toFixed(3));
  } catch (e) {}""",
     """  try {
    el.style.setProperty('--uiz', uiz);
    el.style.setProperty('--uiz2', ((1 + uiz) / 2).toFixed(3));
  } catch (e) {}
  /* (۲۵٫۰) مقیاس UI برای متن‌های Canvas (کات‌سین/تیترها) —
     همان ضریب --uiz تا متن‌های بومی Canvas هم روی گوشی درشت بمانند */
  window.__uiz = uiz;""", 1),
])

print('REPAIR + SECTIONS 2-5 OK')
