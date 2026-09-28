#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""درج کلید صدا (v) در همه‌ی خطوط گفتگو + به‌روزرسانی فراخوانی‌های bark — نسخه ۱۳"""
import re, sys

def patch(path, pairs, must=True):
    with open(path, encoding='utf-8') as f:
        src = f.read()
    for old, new in pairs:
        if old not in src:
            if must:
                print(f'  !! NOT FOUND in {path}: {old[:60]}...')
                sys.exit(1)
            continue
        src = src.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f'  OK {path} ({len(pairs)} ویرایش)')

# ---------- ۱) افتتاحیه ----------
INTRO = [
    ("همه‌چیز از یه ویروس ناشناخته شروع شد... از حومه‌ی شهر نشت کرد.", 'i1n1'),
    ("چند هفته بیشتر نکشید؛ شهر یواش‌یواش خالی شد.", 'i2n1'),
    ("وای... چه قدر ساکت شده! فک کنم فقط ما دوتا مونده‌ایم.", 'i3a1'),
    ("شاید... ولی تا این برج وایساده، ما هم وایساده‌ایم.", 'i4p1'),
    ("بیار ببین... طبقه‌ی سوم بهترین جاست؛ از بالا همه‌جا رو می‌بینیم.", 'i5a1'),
    ("با هر چیزی که دم دستتون بود، برج ساختید.", 'i6n1'),
    ("صداشون رو می‌شنوی؟ دارن میان!", 'i7a1'),
    ("آره... امشب اولین شبه. آماده باش!", 'i8p1'),
    ("به همه‌ی بازمانده‌ها: به سمت پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شود.", 'i9r1'),
    ("شنیدی؟! یه جای امن هست! باید برسیمش!", 'i10a1'),
    ("اول باید از این شب زنده بمونیم... بعد حرف می‌زنیم.", 'i11p1'),
    ("هر شبی که دووم بیاری، یه قدم به پناهگاه نزدیک‌تری.", 'i12n1'),
]
pairs = []
for text, key in INTRO:
    # { who: 'x', text: '...' }  →  { who: 'x', v: 'key', text: '...' }
    pairs.append((f"text: '{text}'", f"v: '{key}', text: '{text}'"))
patch('/home/z/my-project/scripts/v4_intro_menu.js', pairs)

# ---------- ۲) انتقال‌ها ----------
TRD = [
    ("برج داره فرو می‌ریزه! بپر! سریع!", 't1a1'),
    ("همه‌چی سیاهه... هیچی نمی‌تونم ببینم!", 't2p1'),
    ("چراغ‌قوه‌ت رو روشن کن! موانع رو هم رد کن!", 't2a1'),
    ("راه زمینی بسته‌ست! باید از بالای دره بریم!", 't3a1'),
    ("از بالای دره؟! تو دیوونه‌ای ارشان!", 't3p1'),
    ("گرفتمت! محکم خودت رو بگیر!", 'tb1c'),
    ("فرمان با توئه! گاز بده!", 'tb1s'),
    ("به انبارهای مه‌گرفته رسیدید...", 'tb1o'),
    ("بدو! رد شو!", 'tb2s'),
    ("از تونل تاریک بیرون اومدید...", 'tb2o'),
    ("بگیرش! زیپ رو بگیر!", 'tb3c'),
    ("به برج مخابراتی رسیدید...", 'tb3o'),
]
pairs = [(f"text: '{t}'", f"v: '{k}', text: '{t}'") for t, k in TRD]
# transBark: کلید را به speak بدهد
pairs.append((
    "const d = (b && b.text && !(typeof SETT !== 'undefined' && !SETT.sfx)) ? VOICE.speak(b.text, b.who) : 0;",
    "const d = (b && b.text && !(typeof SETT !== 'undefined' && !SETT.sfx)) ? VOICE.speak(b.text, b.who, b.v) : 0;",
))
patch('/home/z/my-project/scripts/v4_transitions.js', pairs)

# ---------- ۳) آخرین شب/پیروزی ----------
pairs = [
    # باس: هشدار آوار (فراخوانی bark جدید با کلید)
    ("try { bark('a', 'آوارها رو بترکون! نذار به برج بخورن!',",
     "try { bark('fbw1', 'a', 'آوارها رو بترکون! نذار به برج بخورن!',"),
    ("try { bark('b', 'خشم... من!',",
     "try { bark('fb1b1', 'b', 'خشم... من!',"),
    # پیروزی
    ("{ who: 'n', text: 'سحر رسیده... و تو هنوز ایستاده‌ای.' },",
     "{ who: 'n', v: 'v1n1', text: 'سحر رسیده... و تو هنوز ایستاده‌ای.' },"),
    ("{ who: 'a', text: 'شنیدی؟! پناهگاه هنوز بازه... فقط چند کیلومتر مونده. بریم!' },",
     "{ who: 'a', v: 'v2a1', text: 'شنیدی؟! پناهگاه هنوز بازه... فقط چند کیلومتر مونده. بریم!' },"),
]
patch('/home/z/my-project/scripts/v4_final.js', pairs)

# ---------- ۴) بقا: قطع برق + دستفروش ----------
pairs = [
    ("try { bark('p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!',",
     "try { bark('sbo1', 'p', 'وای... برق رفت! چراغ‌قوه رو روشن کن!',"),
    ("try { bark('d', 'کالای کمیاب دارم... فقط، برای تو.',",
     "try { bark('spd1', 'd', 'کالای کمیاب دارم... فقط، برای تو.',"),
]
patch('/home/z/my-project/scripts/v4_survival.js', pairs)

# ---------- ۵) مرگ نگهبان (part2) ----------
pairs = [
    ("if (state.wave >= FINAL_WAVE) { try { VOICE.speak('نمی‌شه... تمومش کردی...', 'b'); } catch (e) {} }",
     "if (state.wave >= FINAL_WAVE) { try { VOICE.speak('نمی‌شه... تمومش کردی...', 'b', 'fbd1'); } catch (e) {} }"),
]
patch('/home/z/my-project/scripts/v3_part2.js', pairs)

# ---------- ۶) ورود باس آخرین شب (part3): تبدیل announce به bark صوتی ----------
pairs = [
    ("""          setAnnounce(state.wave >= FINAL_WAVE ? '🌑 زمین می‌لرزه...' : 'زمین می‌لرزه... 👑',
            state.wave >= FINAL_WAVE ? 'نگهبانِ آخرین شب داره میاد!' : 'پادشاه زامبی‌ها داره میاد!', 2.2);""",
     """          if (state.wave >= FINAL_WAVE) {
            try { bark('fbw2', 'a', 'نگهبانِ آخرین شب داره میاد!', '🌑 زمین می‌لرزه...', 'نگهبانِ آخرین شب داره میاد!', 2.6); } catch (e) {
              setAnnounce('🌑 زمین می‌لرزه...', 'نگهبانِ آخرین شب داره میاد!', 2.2);
            }
          } else setAnnounce('زمین می‌لرزه... 👑', 'پادشاه زامبی‌ها داره میاد!', 2.2);"""),
]
patch('/home/z/my-project/scripts/v3_part3.js', pairs)

# ---------- ۷) سینمایی باخت: خط راوی در پایان ----------
pairs = [
    ("[5.2, 5.55, 'برج... از بین رفت.'],",
     "[5.2, 5.55, 'برج... از بین رفت.'],"),
]
# خط صوتی باخت جداگانه اضافه می‌شود (در فایل شکست، شروع کات‌سین):
with open('/home/z/my-project/scripts/v4_defeat.js', encoding='utf-8') as f:
    dsrc = f.read()
old = """function startDefeatCine() {
  if (state.mode === 'defeatcine' || state.mode === 'gameover') return;"""
new = """function startDefeatCine() {
  if (state.mode === 'defeatcine' || state.mode === 'gameover') return;
  /* (۱۳٫۰) صدای راوی هنگام شروع سقوط برج */
  try { VOICE.speak('برج فرو ریخت... زامبی‌ها همه‌جا هستند.', 'n', 'fdf1'); } catch (e) {}"""
if old in dsrc:
    dsrc = dsrc.replace(old, new, 1)
    with open('/home/z/my-project/scripts/v4_defeat.js', 'w', encoding='utf-8') as f:
        f.write(dsrc)
    print('  OK v4_defeat.js (۱ ویرایش)')
else:
    print('  !! startDefeatCine pattern NOT FOUND')
    sys.exit(1)

print('همه‌ی کلیدهای صدا درج شدند.')
