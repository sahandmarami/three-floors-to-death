#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — ادامه: «مرحله X» در برچسب ادامه‌ی بازی + زیرنویس باخت"""
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

# برچسب دکمه‌ی «ادامه‌ی بازی» در منو — فقط مرحله
patch('v4_chapters.js', [
    ("""    _c.textContent = d
      ? 'فصل ' + faNum(d.chapter) + ' • موج ' + faNum(waveInChapter(d.wave)) + ' از ۳۶'
      : 'هنوز سیوی نداری';""",
     """    _c.textContent = d
      ? 'مرحله ' + faNum(clamp(d.wave, 1, FINAL_WAVE))
      : 'هنوز سیوی نداری';""", 1),
])

# زیرنویس باخت — فقط مرحله
patch('v3_part3.js', [
    ("$('goSubtitle').textContent = 'تا شب ' + faNum(state.wave) + ' از ' + faNum(FINAL_WAVE) + ' دوام آوردی';",
     "$('goSubtitle').textContent = 'تا مرحله ' + faNum(clamp(state.wave, 1, FINAL_WAVE)) + ' دوام آوردی';", 1),
])
patch('v4_defeat.js', [
    ("$('goSubtitle').textContent = 'تا شب ' + faNum(state.wave) + ' از ' + faNum(FINAL_WAVE) + ' دوام آوردی';",
     "$('goSubtitle').textContent = 'تا مرحله ' + faNum(clamp(state.wave, 1, FINAL_WAVE)) + ' دوام آوردی';", 1),
])
patch('v3_part1.html', [
    ('<p class="subtitle" id="goSubtitle">تا شب ۱ از ۳۶ دوام آوردی</p>',
     '<p class="subtitle" id="goSubtitle">تا مرحله ۱ دوام آوردی</p>', 1),
])

print('WAVE LABEL PART2 OK')
