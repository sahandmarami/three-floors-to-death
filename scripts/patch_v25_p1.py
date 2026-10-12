#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v25 — پچ v3_part1.html:
1) تعبیه فونت وزیرمتن (base64) + فونت پایه
2) حذف اسم سازنده از منوی اصلی
3) جعبه تأیید اندرویدی (متریال) + CSS جدید
4) بزرگ‌سازی جعبه گفتگو/دکمه رد کردن (استوری موشن برای اندروید)
5) حذف کشیده‌نویسی عربی (تطویل) از متن‌های نمایان
"""
import re

SRC = '/home/z/my-project/scripts/v3_part1.html'
FONT_CSS = open('/home/z/my-project/scripts/vazir_font.css', encoding='utf-8').read()
data = open(SRC, encoding='utf-8').read()
orig = data

# ---------- 1) فونت وزیرمتن ----------
data = data.replace('<style>\n', '<style>\n' + FONT_CSS + '\n', 1)

# فونت پایه — ریشه‌ی عربی‌نمایی: حذف Noto Naskh Arabic
data = data.replace(
    "font-family:Tahoma,'Segoe UI','Noto Naskh Arabic','Noto Sans Arabic',Arial,sans-serif;",
    "font-family:'Vazirmatn',Tahoma,'Segoe UI',Arial,sans-serif;", 1)

# ---------- 2) منو: حذف اسم سازنده (فقط نسخه) ----------
data = data.replace(
    '<div class="m23-foot">نسخه‌ی ۲۴٫۰ &nbsp;·&nbsp; ساخته‌ی <b>سهند مرامی</b></div>',
    '<div class="m23-foot">نسخه‌ی ۲۵٫۰</div>', 1)

# ---------- 5) حذف تطویل عربی از متن‌های نمایان ----------
data = data.replace('آخـریـن شـب', 'آخرین شب')

# ---------- 4) بزرگ‌سازی جعبه گفتگو (استوری موشن) ----------
data = data.replace(
    "#dlgPortrait{width:92px;height:92px;border-radius:14px;",
    "#dlgPortrait{width:calc(104px * var(--uiz,1));height:calc(104px * var(--uiz,1));border-radius:16px;", 1)
data = data.replace(
    "border:1.5px solid #4d6aa8;border-radius:14px 14px 4px 14px;padding:9px 16px 11px;min-width:320px;max-width:600px;",
    "border:1.5px solid #4d6aa8;border-radius:16px 16px 5px 16px;padding:calc(11px * var(--uiz,1)) calc(18px * var(--uiz,1)) calc(13px * var(--uiz,1));min-width:calc(340px * var(--uiz,1));max-width:calc(640px * var(--uiz,1));", 1)
data = data.replace(
    "#dlgWho{font-size:calc(12px * var(--uiz,1));font-weight:bold;letter-spacing:.5px;margin-bottom:3px}",
    "#dlgWho{font-size:calc(13.5px * var(--uiz,1));font-weight:900;letter-spacing:.5px;margin-bottom:4px}", 1)
data = data.replace(
    "#dlgText{font-size:calc(15.5px * var(--uiz,1));line-height:1.85;min-height:calc(28px * var(--uiz,1));color:#fdf7e3;font-weight:bold;",
    "#dlgText{font-size:calc(17.5px * var(--uiz,1));line-height:1.9;min-height:calc(32px * var(--uiz,1));color:#fdf7e3;font-weight:bold;", 1)
data = data.replace(
    "#dlgHint{font-size:calc(9px * var(--uiz,1));color:#9fb2dd;margin-top:4px;text-align:left}",
    "#dlgHint{font-size:calc(10.5px * var(--uiz,1));color:#9fb2dd;margin-top:5px;text-align:left}", 1)
data = data.replace(
    "#dlgBox{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);z-index:30;\n  display:flex;align-items:flex-end;gap:10px;direction:rtl;max-width:88%;pointer-events:none}",
    "#dlgBox{position:absolute;bottom:calc(20px * var(--uiz,1));left:50%;transform:translateX(-50%);z-index:30;\n  display:flex;align-items:flex-end;gap:calc(12px * var(--uiz,1));direction:rtl;max-width:92%;pointer-events:none}", 1)
# صفحه کوتاه: پرتره هم بزرگ‌تر بماند
data = data.replace(
    "  #dlgPortrait{width:68px;height:68px}",
    "  #dlgPortrait{width:calc(84px * var(--uiz,1));height:calc(84px * var(--uiz,1))}", 1)

# دکمه «رد کردن» — درشت‌تر و لمسی‌تر (۲۵٫۰)
data = data.replace(
    "#skipCs{font-size:calc(13.5px * var(--uiz,1));color:#241a06;font-weight:900;",
    "#skipCs{font-size:calc(15px * var(--uiz,1));color:#241a06;font-weight:900;", 1)

# ---------- 3) جعبه تأیید اندرویدی ----------
old_confirm = '''  <!-- ============ (۱۰٫۰) جعبه‌ی تایید عمومی ============ -->
  <div class="overlay hidden" id="confirmBox">
    <div class="panel" style="max-width:380px">
      <p class="subtitle" id="cfMsg" style="font-size:14.5px;color:#e8ecf5">مطمئنی؟</p>
      <div class="btn-row">
        <button class="btn-sec" id="cfNo">نه</button>
        <button class="btn-main" id="cfYes">بله</button>
      </div>
    </div>
  </div>'''
new_confirm = '''  <!-- ============ (۲۵٫۰) جعبه‌ی تأیید اندرویدی — کارت متریال + دکمه‌های درشت لمسی ============ -->
  <div class="overlay hidden" id="confirmBox">
    <div class="cf-card">
      <div class="cf-icon" id="cfIcon">⚠️</div>
      <h2 class="cf-title" id="cfTitle">مطمئنی؟</h2>
      <p class="cf-msg" id="cfMsg">این کار قابل برگشت نیست.</p>
      <div class="cf-acts">
        <button class="cf-btn cf-no" id="cfNo">نه، برگرد</button>
        <button class="cf-btn cf-yes" id="cfYes">بله، انجامش بده</button>
      </div>
    </div>
  </div>'''
assert old_confirm in data, 'confirm block not found'
data = data.replace(old_confirm, new_confirm, 1)

# CSS جعبه تأیید — بعد از استایل‌های .icon-btn اضافه می‌شود
cf_css = '''
/* ---------- (۲۵٫۰) جعبه‌ی تأیید اندرویدی — سبک متریال؛ درشت، لمسی، خوانا ---------- */
.cf-card{background:linear-gradient(180deg,#1d2b54,#0d1530);border:1.5px solid #4d6aa8;border-radius:calc(22px * var(--uiz,1));
  width:min(92%,calc(440px * var(--uiz,1)));padding:calc(22px * var(--uiz,1)) calc(20px * var(--uiz,1)) calc(16px * var(--uiz,1));
  text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.09);
  animation:cfIn .22s cubic-bezier(.2,1.2,.4,1)}
@keyframes cfIn{from{transform:scale(.86);opacity:0}to{transform:scale(1);opacity:1}}
.cf-icon{width:calc(66px * var(--uiz,1));height:calc(66px * var(--uiz,1));margin:0 auto calc(10px * var(--uiz,1));
  border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:calc(31px * var(--uiz,1));
  background:radial-gradient(circle at 35% 30%,rgba(255,190,60,.28),rgba(255,150,40,.08));
  border:1.5px solid rgba(255,200,90,.5);box-shadow:0 0 26px rgba(255,180,60,.28)}
.cf-title{font-size:calc(19.5px * var(--uiz,1));font-weight:900;color:#ffd873;margin-bottom:calc(7px * var(--uiz,1));
  text-shadow:0 2px 10px rgba(255,190,60,.25)}
.cf-msg{font-size:calc(15px * var(--uiz,1));line-height:1.95;color:#dbe5fa;margin-bottom:calc(15px * var(--uiz,1))}
.cf-acts{display:flex;gap:calc(10px * var(--uiz,1))}
.cf-btn{flex:1;cursor:pointer;font-family:inherit;font-weight:900;border-radius:calc(14px * var(--uiz,1));
  min-height:calc(54px * var(--uiz,1));font-size:calc(15.5px * var(--uiz,1));transition:transform .12s,filter .12s;
  padding:calc(12px * var(--uiz,1)) calc(14px * var(--uiz,1))}
.cf-btn:active{transform:scale(.95)}
.cf-no{background:linear-gradient(180deg,#28355c,#1a2546);border:1.5px solid #46609e;color:#dbe5fa;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.cf-no:hover{background:linear-gradient(180deg,#31456e,#243358);color:#fff}
.cf-yes{background:linear-gradient(180deg,#ffd873,#eda93c);border:none;color:#141a2e;
  box-shadow:0 6px 24px rgba(240,180,60,.4),inset 0 1px 0 rgba(255,255,255,.5)}
.cf-yes:hover{filter:brightness(1.07)}
/* حالت خطر (پاک‌کردن سیو) — دکمه‌ی تأیید قرمز می‌شود */
#confirmBox.danger .cf-yes{background:linear-gradient(180deg,#ff7a6b,#d63d2e);color:#fff;
  box-shadow:0 6px 24px rgba(230,80,60,.45),inset 0 1px 0 rgba(255,255,255,.35)}
#confirmBox.danger .cf-icon{background:radial-gradient(circle at 35% 30%,rgba(255,110,80,.28),rgba(220,60,40,.1));
  border-color:rgba(255,120,90,.55);box-shadow:0 0 26px rgba(255,90,60,.3)}
'''
anchor = '.icon-btn:hover{background:#31456e;transform:translateY(-1px)}'
assert anchor in data
data = data.replace(anchor, anchor + '\n' + cf_css, 1)

open(SRC, 'w', encoding='utf-8').write(data)
print('patched v3_part1.html:', len(orig), '->', len(data), 'bytes')
print('checks:',
      'font' if 'Vazirmatn' in data else 'FONT-FAIL',
      '| foot' if 'ساخته‌ی' not in data.split('aboutScreen')[0].split('victoryScreen')[0] else 'FOOT-FAIL',
      '| cf-card' if 'cf-card' in data else 'CF-FAIL',
      '| dlg' if '17.5px' in data else 'DLG-FAIL')
