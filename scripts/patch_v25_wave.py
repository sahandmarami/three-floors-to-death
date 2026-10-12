#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — نمایش پیشرفت فقط «مرحله X» (درخواست کاربر: مثل بازی‌های واقعی)
- waveLabel: «فصل X · موج Y از ۳۶» → «مرحله Y»
- اعلان‌ها: «موج بعدی: X» → «مرحله X» و ...
"""
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

# ---------- برچسب اصلی: فقط «مرحله X» ----------
patch('v4_chapters.js', [
    ("""function waveLabel() {
  if (state.wave >= FINAL_WAVE) return '🌑 آخرین شب';
  const w = clamp(state.wave, 1, FINAL_WAVE);
  return 'فصل ' + faNum(waveChapter(w)) + ' · موج ' + faNum(w) + ' از ' + faNum(FINAL_WAVE);
}""",
     """function waveLabel() {
  /* (۲۵٫۰) خواسته‌ی کاربر: مثل بازی‌های واقعی فقط «مرحله X» —
     بدون شماره‌ی فصل/موج/کل. آخرین مرحله حس ویژه دارد */
  if (state.wave >= FINAL_WAVE) return '🌑 آخرین مرحله';
  const w = clamp(state.wave, 1, FINAL_WAVE);
  return 'مرحله ' + faNum(w);
}""", 1),
])

# ---------- اعلان وقفه: «موج بعدی: X» → «مرحله X» ----------
patch('v3_part3.js', [
    ("$('announceBig').textContent = 'موج بعدی: ' + faNum(waveInChapter(state.wave + 1));",
     "$('announceBig').textContent = 'مرحله ' + faNum(clamp(state.wave + 1, 1, FINAL_WAVE));", 1),
])

# ---------- اعلان شروع موج/صبح/شب در v3_part2 ----------
patch('v3_part2.js', [
    ("setAnnounce('موج ' + faNum(n),",
     "setAnnounce('مرحله ' + faNum(n),", 1),
    ("setAnnounce('☀️ صبح شد!', 'موج ' + faNum(state.wave) + ' پاک شد — ارتقا بخر و شب را شروع کن', 3);",
     "setAnnounce('☀️ صبح شد!', 'مرحله ' + faNum(state.wave) + ' گرفتی — ارتقا بخر و شب رو شروع کن', 3);", 1),
    ("setAnnounce('🌙 شب می‌شود...', 'موج ' + faNum(state.wave + 1) + ' در راه است — آماده باش!', 1.8);",
     "setAnnounce('🌙 شب می‌شود...', 'مرحله ' + faNum(clamp(state.wave + 1, 1, FINAL_WAVE)) + ' در راه است — آماده باش!', 1.8);", 1),
])

# ---------- HUD پیش‌فرض HTML ----------
patch('v3_part1.html', [
    ('<div class="hud-item" title="موج فعلی">💀 <span id="waveText">موج ۱/۱۰</span></div>',
     '<div class="hud-item" title="مرحله">💀 <span id="waveText">مرحله ۱</span></div>', 1),
])

print('WAVE LABEL PATCHES OK')
