#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — پچ نهایی JS:
۱) پیش‌بارگذاری فونت وزیرمتن (Canvas قبل از اولین رسم)
۲) askConfirm اندرویدی: عنوان + آیکن + دکمه‌های متن‌دار + حالت خطر
۳) پیام‌های جدید «بازی جدید» / «پاک‌کردن سیو»
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

# ---------- ۱) پیش‌بارگذاری فونت — اولین بخش JS (v3_part2.js) ----------
patch('v3_part2.js', [
    ("'use strict';\n",
     """'use strict';
/* (۲۵٫۰) پیش‌بارگذاری «وزیرمتن» — فونت باید قبل از اولین رسم Canvas
   آماده باشد وگرنه متن‌ها با قلم جایگزین (نسخ عربی!) نقاشی می‌شوند */
if (document.fonts && document.fonts.load) {
  ['400 16px Vazirmatn', '500 16px Vazirmatn', '600 16px Vazirmatn',
   '700 16px Vazirmatn', '900 16px Vazirmatn'].forEach(f => {
    try { document.fonts.load(f); } catch (e) {}
  });
}
""", 1),
])

# ---------- ۲) askConfirm اندرویدی ----------
patch('v4_chapters.js', [
    ("""let _cfYes = null;
function askConfirm(msg, onYes) {
  $('cfMsg').textContent = msg;
  _cfYes = onYes;
  showScreen('confirmBox');
}""",
     """let _cfYes = null;
/* (۲۵٫۰) جعبه‌ی تأیید اندرویدی — عنوان + آیکن + دکمه‌های متن‌دار
   opt: {title, icon, yes, no, danger} */
function askConfirm(msg, onYes, opt) {
  opt = opt || {};
  const box = $('confirmBox');
  $('cfMsg').textContent = msg;
  if ($('cfTitle')) $('cfTitle').textContent = opt.title || 'مطمئنی؟';
  if ($('cfIcon')) $('cfIcon').textContent = opt.icon || '⚠️';
  if ($('cfYes')) $('cfYes').textContent = opt.yes || 'بله';
  if ($('cfNo')) $('cfNo').textContent = opt.no || 'نه، برگرد';
  if (box) box.classList.toggle('danger', !!opt.danger);
  _cfYes = onYes;
  showScreen('confirmBox');
}""", 1),
])

# ---------- ۳) پیام‌های «بازی جدید» و «پاک‌کردن سیو» — متن اندرویدی دوستانه ----------
patch('v4_chapters.js', [
    ("askConfirm('با شروع بازی جدید، سیوِ قبلی پاک می‌شود. ادامه بدهم؟', () => {",
     """askConfirm('سیوِ قبلی‌ات پاک می‌شه و داستان از شب اول شروع می‌شه. ',
    () => {""", 1),
    ("""      hideScreen('confirmBox');
      wipeSave();
      startIntroCine();
    });""",
     """      hideScreen('confirmBox');
      wipeSave();
      startIntroCine();
    }, { title: 'بازی جدید رو شروع کنم؟', icon: '🎮', danger: true,
         yes: 'آره، از شب اول', no: 'نه، سیو بمونه' });""", 1),
])

patch('v3_part4.js', [
    ("$('btnWipe').addEventListener('click', () => askConfirm('همه‌ی پیشرفتت پاک بشه؟', wipeSaveAndUI));",
     """$('btnWipe').addEventListener('click', () => askConfirm(
    'همه‌ی پیشرفت و وسایلت برای همیشه پاک می‌شه. مطمئنی؟',
    wipeSaveAndUI, { title: 'پاک‌کردن سیو', icon: '🗑', danger: true,
                     yes: 'پاکش کن', no: 'نه، موندم' }));""", 1),
])

print('FINAL JS PATCHES OK')
