#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۱۷٫۰: VOICES14 → VOICES17 در v4_audio.js و v3_part4.js + نسخه + API v17"""
import io

# ---------- v4_audio.js ----------
P = '/home/z/my-project/scripts/v4_audio.js'
src = io.open(P, encoding='utf-8').read()
n = 0

def rep(s, old, new, cnt=1):
    global n
    assert s.count(old) >= cnt, f'NOT FOUND: {old[:70]!r}'
    n += 1
    return s.replace(old, new, cnt)

src = rep(src, 'const meta = (typeof VOICES14 !== \'undefined\') && VOICES14[key];',
               'const meta = (typeof VOICES17 !== \'undefined\') && VOICES17[key];   /* (۱۷٫۰) */')
src = rep(src, "if (this._warmAll || !(typeof VOICES14 !== 'undefined')) return;",
               "if (this._warmAll || !(typeof VOICES17 !== 'undefined')) return;")
src = rep(src, 'const keys = Object.keys(VOICES14);',
               'const keys = Object.keys(VOICES17);')
src = rep(src, "if (!muted && v && (typeof VOICES14 !== 'undefined') && VOICES14[v]) {",
               "if (!muted && v && (typeof VOICES17 !== 'undefined') && VOICES17[v]) {")
src = rep(src, "this.dur = VOICES14[v].d;",
               "this.dur = VOICES17[v].d;")
io.open(P, 'w', encoding='utf-8').write(src)
print(f'v4_audio.js: {n} جایگزینی VOICES17')

# ---------- v3_part4.js: v13 getter + API v17 ----------
P = '/home/z/my-project/scripts/v3_part4.js'
src = io.open(P, encoding='utf-8').read()
n = 0
src = rep(src, "    get VOICES() { return (typeof VOICES14 !== 'undefined') ? VOICES14 : null; },",
               "    get VOICES() { return (typeof VOICES17 !== 'undefined') ? VOICES17 : null; },   /* (۱۷٫۰) */")
src = rep(src, "    get clipCount() { return (typeof VOICES14 !== 'undefined') ? Object.keys(VOICES14).length : 0; },",
               "    get clipCount() { return (typeof VOICES17 !== 'undefined') ? Object.keys(VOICES17).length : 0; },")

# اضافه‌کردن namespace v17 بعد از v14
old_v14_end = """  /* ---- (۱۴٫۰) دستفروش استوری‌مود + ابزار تست رابط ---- */
  v14: {
    get PED() { return (typeof PED !== 'undefined') ? PED : null; },
    peddlerForce: () => { if (typeof PED !== 'undefined') peddlerRoll(true); },
    fitWrap: () => { if (typeof fitWrap !== 'undefined') fitWrap(); },
    orient: () => { if (window.ttbOrient) window.ttbOrient(); },
    get dlgOn() { return document.getElementById('wrap').classList.contains('dlg-on'); },
  },"""
new_v14_end = old_v14_end + """
  /* ---- (۱۷٫۰) رانندگی شبه‌سه‌بعدی + ارشان روی برج ---- */
  v17: {
    get DRV() { return (typeof DRV !== 'undefined') ? DRV : null; },
    mgGas, mgBrake, mgSteer,
    get ARSHAN() { return (typeof ARSHAN !== 'undefined') ? ARSHAN : null; },
    arshanForce,
    get ARSHAN_BARKS() { return (typeof ARSHAN_BARKS !== 'undefined') ? ARSHAN_BARKS : null; },
  },"""
assert src.count(old_v14_end) == 1
src = src.replace(old_v14_end, new_v14_end, 1)
io.open(P, 'w', encoding='utf-8').write(src)
print(f'v3_part4.js: {n} جایگزینی + namespace v17')

# ---------- v3_part1.html: نسخه ۱۷ ----------
P = '/home/z/my-project/scripts/v3_part1.html'
src = io.open(P, encoding='utf-8').read()
n = 0
src = rep(src,
  '<meta name="description" content="سه طبقه تا بقا — نسخه‌ی ۱۶٫۰: دکمه‌ی شروع شب داخل پنل ساخت‌وساز، کوله‌پشتی با قاب رنگی هر وسیله، و تاریکیِ لکه‌ایِ متغیر از فصل دو — بهینه برای موبایل و اندروید">',
  '<meta name="description" content="سه طبقه تا بقا — نسخه‌ی ۱۷٫۰: مینی‌گیم رانندگی شبه‌سه‌بعدی بین فصل ۱ و ۲، ارشانِ دیده‌بان روی طبقه‌ی دوم برج با جمله‌های وسط موج، و دیالوگ‌های افتتاحیه‌ی محاوره‌ای — بهینه برای موبایل و اندروید">')
src = rep(src, 'سه طبقه تا بقا — نسخه‌ی ۱۶٫۰ — استایل‌های صفحه',
               'سه طبقه تا بقا — نسخه‌ی ۱۷٫۰ — استایل‌های صفحه')

old_hdr = """   تازه‌های ۱۶٫۰ (بازخورد کاربر):
     - «شب شود» دیگر دکمه‌ی شناورِ گوشه‌ی صفحه نیست — دکمه‌ی
       طلاییِ خودِ پنل ساخت‌وساز شد (زیر سربرگ؛ باز و جمع)
     - جاخاله‌های کوله‌پشتی خوشگل‌تر: قاب و هاله‌ی رنگی هر وسیله،
       حذف جعبه‌درون‌جعبه، کی‌چیپ لطیف، «+» وسطِ جاخالیِ خالی
     - تاریکی از فصل ۲ لکه‌ای و متغیر: پایه‌ی ملایم همه‌جا +
       لکه‌های شناورِ تیره‌تر — بعضی جاها کمی، بعضی خیلی، بعضی روشن"""
new_hdr = """   تازه‌های ۱۷٫۰ (بازخورد کاربر):
     - مینی‌گیم رانندگی شبه‌سه‌بعدی (فصل ۱→۲): جاده‌ی پرسپکتیو با
       پیچ و خطوط رونده، موانع/زامبی‌هایی که از دور بزرگ می‌شوند،
       فرمان/گاز/ترمز (کیبورد، لمس، کج‌کردن گوشی)، ارشان روی صندلی
       کمکی + آیتم مخفیِ کنار جاده با ستون نور
     - ارشان حالا در گیم‌پلی دفاعی روی لبه‌ی طبقه‌ی دوم برج است:
       دیده‌بانی با دوربین، مهمات‌رسانی، نگاه به سمت خطر + بارک‌های
       کوتاه محاوره‌ای وسط موج (۶ صدای تازه)
     - دیالوگ‌های افتتاحیه محاوره‌ای شدند (هم‌لحن انتقال‌ها) + خط
       راوی که توضیح می‌دهد چرا ارشان همان لحظه‌ی فروریختن با ماشین
       می‌رسد (از قبل پایین بود و ماشین را گرم کرده بود)
     - تونل و زیپ‌لاین: لایه‌ی عمق پرسپکتیو (موانع دور = کوچک/کم‌رنگ)

   تازه‌های ۱۶٫۰ (بازخورد کاربر):
     - «شب شود» دیگر دکمه‌ی شناورِ گوشه‌ی صفحه نیست — دکمه‌ی
       طلاییِ خودِ پنل ساخت‌وساز شد (زیر سربرگ؛ باز و جمع)
     - جاخاله‌های کوله‌پشتی خوشگل‌تر: قاب و هاله‌ی رنگی هر وسیله،
       حذف جعبه‌درون‌جعبه، کی‌چیپ لطیف، «+» وسطِ جاخالیِ خالی
     - تاریکی از فصل ۲ لکه‌ای و متغیر: پایه‌ی ملایم همه‌جا +
       لکه‌های شناورِ تیره‌تر — بعضی جاها کمی، بعضی خیلی، بعضی روشن"""
assert src.count(old_hdr) == 1
src = src.replace(old_hdr, new_hdr, 1)
io.open(P, 'w', encoding='utf-8').write(src)
print(f'v3_part1.html: {n} جایگزینی نسخه/سربرگ')
