#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v33.py — نسخه‌ی ۳۳٫۰ (رفع ۶ مورد از بازخورد باقی‌مانده کاربر)
# ۱) مینی‌گیم فصل ۱: حذف فرمانِ کج‌کردن گوشی (رفع «ماشین خودش به چپ می‌ره»)
# ۲) مینی‌گیم: در خودِ مینی‌گیم دکمه/عمل «رد کردن» وجود ندارد
# ۳) کات‌سین فروریختن برج: آرش از بام با پله‌ها پایین می‌آید + ماشین از قبل پارک
#    + زیرنویس‌های دیالوگ‌دار درشت‌تر + صدای tb1c/tb1s در لحظه‌های درست
# ۴) حذف دکمه‌ی «گوش» (شنود) از ریل چپ → کارت اکشن در پرونده‌ی سرنخ‌ها
# ۵) نام روی کاشی‌های ساخت‌وساز (روی گوشی hover نداریم)
# ۶) منوی اصلی روشن‌تر + زامبی سایه‌ای: نیم‌رخِ درست (یک چشم + فک) و بازوهای متضادِ پاها
import io, sys

P = '/home/z/my-project/download/three-floors-to-survival.html'
s = io.open(P, encoding='utf-8').read()
orig = len(s)
log = []

def rep(old, new, label, n=1):
    global s
    c = s.count(old)
    assert c == n, f'[{label}] انتظار {n}، پیدا شد {c}'
    s = s.replace(old, new)
    log.append(f'  OK  {label}')

def span(marker_start, marker_end, new, label, keep_end=True):
    """جایگزینی بازه‌ی [marker_start, marker_end) — بدون نیاز به رونویسی متن قدیم"""
    global s
    i = s.find(marker_start)
    assert i >= 0, f'[{label}] marker_start پیدا نشد'
    j = s.find(marker_end, i + len(marker_start))
    assert j > i, f'[{label}] marker_end پیدا نشد'
    s = s[:i] + new + (s[j:] if keep_end else s[j + len(marker_end):])
    log.append(f'  OK  {label}')

# ---------------------------------------------------------------
# E1) CS_CAPS — زیرنویس‌های جدید با آرش + منطق پارک‌شدن ماشین
# ---------------------------------------------------------------
i = s.find('const CS_CAPS = [')
assert i >= 0, 'CS_CAPS پیدا نشد'
j = s.find('];', i)
assert j > i
NEW_CAPS = """const CS_CAPS = [
  [0.35, 2.45, 'آرش: صدای این ستون‌ها رو می‌شنوی؟ ساختمون داره فرو می‌ریزه!'],
  [2.55, 4.3, 'آرش: من از پله‌ها پایین می‌رم و ماشین رو روشن می‌کنم — موقعش بپر!'],
  [4.5, 5.1, 'طبقه‌ی اول فرو ریخت!'],
  [5.35, 5.95, 'آرش: زود باش! طبقه‌ی دوم هم دارد می‌ریزه!'],
  [6.25, 6.85, 'آرش: رسیدم به ماشین — موتور رو گرم می‌کنم!'],
  [7.0, 7.9, 'بام می‌لغزد — بپر!'],
  [8.55, 9.15, 'آرش: گرفتمت! محکم خودت رو بگیر!'],
  [9.5, 12.8, 'آرش: فرمان با توئه! گاز بده!'],
];"""
s = s[:i] + NEW_CAPS + s[j + 2:]
log.append('  OK  E1: CS_CAPS جدید (۸ خط با دیالوگ آرش)')

# ---------------------------------------------------------------
# E2) فونت زیرنویس کات‌سین: 15 → 17px (خوانایی روی گوشی)
# ---------------------------------------------------------------
rep("ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';\n  for (const c of CS_CAPS) {",
    "ctx.font = 'bold 17px Vazirmatn, Tahoma, sans-serif';\n  for (const c of CS_CAPS) {",
    'E2: فونت زیرنویس ۱۷px')

# ---------------------------------------------------------------
# E3) بلوک ماشین: پارک از ابتدا + حرکت آرش (بام→پله→دویدن→سوار)
# ---------------------------------------------------------------
NEW_CAR = """  /* ---- (۳۳) ماشینِ نجات از قبل پارکِ کنار برج است؛ آرش از پله‌ها پایین می‌آید ----
     منطق جدید (درخواست کاربر): «آرش با ماشین میاد» غیرمنطقی بود — حالا آرش
     خودش از بام با پله‌های کناری پایین می‌آید، ماشینِ خودشان را روشن می‌کند
     و زیر برج می‌آید تا بازیکن از بام روی ماشین بپرد. */
  const catchT = CS_T.playerDrop + CS_T.fallDur;   // لحظه‌ی رسیدن بازیکن به ماشین
  if (!cs.arash) cs.arash = { st: 'roof', x: 0, y: 0, ph: 0 };
  const A = cs.arash;
  A.ph += dt * 9;
  if (t < 2.5) {                                   // روی بام، کنار بازیکن
    A.st = 'roof';
    A.x = TOWER.x + 42;
    A.y = TOWER_TOP_Y + D.floors[2].dy;
  } else if (t < 6.2) {                            // پایین‌آمدن از پله‌های سمت چپ
    A.st = 'stairs';
    const k = clamp((t - 2.5) / (6.2 - 2.5), 0, 1);
    A.x = TOWER.x - 62 + Math.sin(k * Math.PI * 3) * 7;   // زیگزاگ پله‌ها
    A.y = TOWER_TOP_Y + (GROUND_Y + 10 - TOWER_TOP_Y) * k;
  } else if (t < 6.9) {                            // دویدن به ماشینِ پارک‌شده
    A.st = 'run';
    const k = clamp((t - 6.2) / 0.7, 0, 1);
    A.x = (TOWER.x - 62) + ((TOWER.x - 205) - (TOWER.x - 62)) * k;
    A.y = GROUND_Y + 10;
  } else {
    A.st = 'in';                                   // سوار شد — داخل ماشین
  }
  /* ماشین: از ابتدای صحنه پارک است (خاموش)؛ آرش سوار که شد روشن و زیر برج می‌آید */
  if (t < CS_T.driveStart) {
    if (!cs.car) {
      cs.car = { x: TOWER.x - 205, y: GROUND_Y + 14, spin: 0, kick: 0, hand: 0 };
    }
    if (t < CS_T.carEnter) {
      cs.car.spin = 0;                             // پارکِ خاموش کنار خیابان
    } else {
      const u = clamp((t - CS_T.carEnter) / 0.7, 0, 1);
      const e = u * u * (3 - 2 * u);
      cs.car.x = (TOWER.x - 205) + 205 * e;        // زیر برج می‌آید
      cs.car.spin += 24 * dt;
      cs.car.hand = Math.max(0, 1.5 - (t - CS_T.carEnter));
      SFX.csEngine();
      for (const z of cs.zombies) {
        if (!z.hit && Math.abs(z.x - cs.car.x) < 76) csKnockZombie(z, 430);
      }
    }
  }
"""
span('/* ---- ماشین نجات: ورود نرم از چپ', '/* ---- سقوط قوسی بازیکن', NEW_CAR, 'E3: بلوک ماشین+آرش')

# ---------------------------------------------------------------
# E4) صدای tb1c در لحظه‌ی گرفتن بازیکن
# ---------------------------------------------------------------
rep("      cs.caught = true;\n      state.shake = 4;",
    "      cs.caught = true;\n      try { VOICE.speak('گرفتمت! محکم خودت رو بگیر!', 'a', 'tb1c'); } catch (e) {}\n      state.shake = 4;",
    'E4: صدای tb1c هنگام گرفتن')

# ---------------------------------------------------------------
# E5) صدای tb1s در شروع رانندگی
# ---------------------------------------------------------------
rep("function startCsDrive() {\n  const cs = CS;\n  cs.zombies = [];",
    "function startCsDrive() {\n  const cs = CS;\n  try { VOICE.speak('فرمان با توئه! گاز بده!', 'a', 'tb1s'); } catch (e) {}\n  cs.zombies = [];",
    'E5: صدای tb1s در شروع رانندگی')

# ---------------------------------------------------------------
# E6) رسم آرش در drawCutscene (قبل از تپش قرمز لرزش)
# ---------------------------------------------------------------
i = s.find('if (t < CS_T.shakeEnd) {', s.find('function drawCutscene'))
assert i > 0
k = s.rfind('\n', 0, i)
s = s[:k] + "\n  /* (۳۳) آرش: بام → پله‌ها → ماشین */\n  if (CS.arash && CS.arash.st !== 'in' && CS.t < CS_T.driveStart) drawCsArash33(CS.arash);" + s[k:]
log.append('  OK  E6: فراخوانی رسم آرش در drawCutscene')

# ---------------------------------------------------------------
# E7) حذف فرمان شیب گوشی (deviceorientation) — ریشه‌ی «ماشین خودش به چپ می‌ره»
# ---------------------------------------------------------------
i = s.find('const g = clamp(e.gamma, -24, 24) / 18;')
assert i >= 0, 'gamma anchor'
j = s.find('DRV.steer = clamp(g, -1, 1);\n    }', i)
assert j > i
j = s.find('}', s.find('DRV.steer = clamp(g, -1, 1);', i)) + 1
TILT_OFF = """/* (۳۳) فرمانِ کج‌کردن گوشی حذف شد — ریشه‌ی «ماشین خودش به چپ می‌ره»:
       در حالت افقی محور gamma همان محورِ درست نیست و بدون ناحیه‌ی مرده و
       کالیبراسیون، ماشین به‌سمت شیبِ طبیعی دستِ کاربر می‌لغزید.
       فرمان فقط با لمسِ ثلث چپ/راست یا کلیدهای جهت‌دار. */
    void 0;"""
s = s[:i] + TILT_OFF + s[j:]
log.append('  OK  E7: فرمان شیب گوشی غیرفعال')

# ---------------------------------------------------------------
# E8) رد کردنِ مینی‌گیم ممنوع (فقط فاز ۲؛ افتتاحیه/پایان قابل رد شدن می‌مانند)
# ---------------------------------------------------------------
rep("function skipTransition() {\n  if (!TR) return;\n  SFX.click();",
    "function skipTransition() {\n  if (!TR) return;\n  if (TR.phase === 2) return;   /* (۳۳) خودِ مینی‌گیم قابل رد کردن نیست */\n  SFX.click();",
    'E8a: گارد skipTransition')

rep("  MG.reset(MGCFG[TR.ch]);\n  setTransSub(MGCFG[TR.ch].startSub, 3.2);",
    "  MG.reset(MGCFG[TR.ch]);\n  $('skipCs').classList.add('hidden');      /* (۳۳) در مینی‌گیم دکمه‌ی رد کردن نیست */\n  setTransSub(MGCFG[TR.ch].startSub, 3.2);",
    'E8b: مخفی‌کردن دکمه در mgBegin')

rep("function mgOutro() {\n  TR.phase = 3;\n  TR.t = 0;\n  TR.ev = {};",
    "function mgOutro() {\n  TR.phase = 3;\n  TR.t = 0;\n  $('skipCs').classList.remove('hidden');   /* (۳۳) پس از مینی‌گیم، رد کردن برمی‌گردد */\n  TR.ev = {};",
    'E8c: بازگشت دکمه در mgOutro')

io.open(P, 'w', encoding='utf-8').write(s)
print('\n'.join(log))
print(f'size: {orig} -> {len(s)} bytes')
print('PART 1 DONE — ادامه با insert_v33b.py')
