#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# insert_v33e.py — اصلاح مسیر REAL فروریختن برج (introUpdate1 در انتقال فصل ۱→۲):
# ۱) ارشان از بام با پله‌های کناری پایین می‌آید (نه «با ماشین از بیرون می‌آید»)
# ۲) ماشین از قبل کنار برج پارک است؛ ارشان سوارش می‌شود و زیر برج می‌آورد
# ۳) زیرنویس‌های SUBS_INTRO1 = دیالوگ ارشان + منطق جدید؛ فونت درشت‌تر (۱۷px)
# ۴) بارک «گرفتمت» به لحظه‌ی واقعی فرود بازیکن روی ماشین (t>5.85)
# ۵) رسم ارشان + پله‌ها در render() (همان مسیری که کاربر واقعاً می‌بیند)
import io

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

# ---------------------------------------------------------------
# R1) SUBS_INTRO1 — دیالوگ ارشان با منطق پله‌ها/ماشین پارک
# ---------------------------------------------------------------
i = s.find('const SUBS_INTRO1 = [')
assert i >= 0
j = s.find('];', i)
assert j > i
NEW_SUBS = """const SUBS_INTRO1 = [
  [0.4, 2.2, '— [ارشان]: صدای این ستون‌ها رو می‌شنوی؟ ساختمون داره فرو می‌ریزه!'],
  [2.3, 4.2, '— [ارشان]: من از پله‌ها می‌رم پایین و ماشین رو روشن می‌کنم — موقعش بپر!'],
  [4.4, 5.1, 'طبقه‌ی اول و دوم فرو ریختن...'],
  [5.3, 5.85, 'بام می‌لغزه — بپر!'],
  [6.0, 6.6, '— [ارشان]: گرفتمت! محکم خودت رو بگیر!'],
  [6.8, 7.75, '— [ارشان]: فرمان با توئه! گاز بده تا برج بعدی!'],
];"""
s = s[:i] + NEW_SUBS + s[j + 2:]
log.append('  OK  R1: SUBS_INTRO1 جدید (۶ خط دیالوگ ارشان)')

# ---------------------------------------------------------------
# R2) introUpdate1 — بلوک ماشین: پارک از ابتدا + حرکت زیر برج
# ---------------------------------------------------------------
OLD_CAR = """  /* ماشین ارشان از چپ می‌رسد */
  if (t >= 4.2) {
    const cx = clamp(-170 + (t - 4.2) * 240, -170, 316);
    CS.car = { x: cx, y: GROUND_Y + 8, kick: 0, spin: t * 9, hand: t < 5.9 ? 1 : 0 };
    if (!TR.ev.engine) { TR.ev.engine = 1; SFX.csEngine(); }
  }"""
NEW_CAR = """  /* (۳۳) ماشین از قبل کنار برج پارک است؛ ارشان سوارش می‌شود و زیر برج می‌آورد */
  if (!TR.ev.carInit) { TR.ev.carInit = 1; CS.car = { x: TOWER.x - 205, y: GROUND_Y + 8, kick: 0, spin: 0, hand: 0 }; }
  if (t < 5.2) {
    CS.car.spin = 0;                       /* پارکِ خاموش — ارشان هنوز نرسیده */
  } else {
    const u = clamp((t - 5.2) / 0.7, 0, 1);          /* زیر برج می‌آورد */
    CS.car.x = (TOWER.x - 205) + (330 - (TOWER.x - 205)) * u;
    CS.car.spin = t * 9;
    CS.car.hand = t < 5.9 ? 1 : 0;
    if (!TR.ev.engine) { TR.ev.engine = 1; SFX.csEngine(); }
  }
  /* (۳۳) ارشان: بام → پله‌های کناری → دویدن به ماشین → سوار شدن */
  if (!TR.ev.arash) TR.ev.arash = { st: 'roof', x: TOWER.x + 42, y: TOWER_TOP_Y, ph: 0 };
  const A = TR.ev.arash;
  A.ph += dt * 9;
  if (t < 1.6) { A.st = 'roof'; A.x = TOWER.x + 42; A.y = TOWER_TOP_Y + F[2].dy; }
  else if (t < 4.4) {
    A.st = 'stairs';
    const k = clamp((t - 1.6) / (4.4 - 1.6), 0, 1);
    A.x = TOWER.x - 62 + Math.sin(k * Math.PI * 3) * 7;   /* زیگزاگ پله‌ها */
    A.y = TOWER_TOP_Y + (GROUND_Y + 10 - TOWER_TOP_Y) * k;
  } else if (t < 5.2) {
    A.st = 'run';
    const k = clamp((t - 4.4) / 0.8, 0, 1);
    A.x = (TOWER.x - 62) + ((TOWER.x - 205) - (TOWER.x - 62)) * k;
    A.y = GROUND_Y + 10;
  } else { A.st = 'in'; }"""
rep(OLD_CAR, NEW_CAR, 'R2: ماشین پارک + ماشین‌روشن‌کردنِ ارشان')

# ---------------------------------------------------------------
# R3) بارک «گرفتمت» در لحظه‌ی واقعی فرود (t>5.85 برای فصل ۱)
# ---------------------------------------------------------------
rep("if (b && b.catch && !TR.ev.catchBark && TR.t > (TR.ch === 1 ? 4.9 : 4.2)) {",
    "if (b && b.catch && !TR.ev.catchBark && TR.t > (TR.ch === 1 ? 5.85 : 4.2)) {",
    'R3: بارک گرفتن در t>5.85 (لحظه‌ی فرود)')

# ---------------------------------------------------------------
# R4) فونت زیرنویس انتقال: 14.5 → 17px
# ---------------------------------------------------------------
rep("ctx.font = 'bold 14.5px Vazirmatn, Tahoma, sans-serif';\n    const a = Math.min(1, TR.subT / 0.3);",
    "ctx.font = 'bold 17px Vazirmatn, Tahoma, sans-serif';\n    const a = Math.min(1, TR.subT / 0.3);",
    'R4: فونت زیرنویس انتقال ۱۷px')

# ---------------------------------------------------------------
# R5) رسم ارشان + پله‌ها در render() — بعد از drawPlayer
# ---------------------------------------------------------------
i = s.find('  drawPlayer();', s.find('function render() {'))
assert i > 0, 'drawPlayer در render پیدا نشد'
eol = s.find('\n', i)
s = s[:eol + 1] + """  /* (۳۳) ارشان + پله‌های کناری در فروریختن فصل ۱ — مسیر واقعی رندر */
  try {
    if (typeof TR !== 'undefined' && TR && TR.phase === 1 && TR.ch === 1 && typeof drawCsArash33 === 'function') {
      drawCsStairs33();
      if (TR.ev.arash && TR.ev.arash.st !== 'in') drawCsArash33(TR.ev.arash);
    }
  } catch (e) {}
""" + s[eol + 1:]
log.append('  OK  R5: رسم ارشان + پله‌ها در render()')

# ---------------------------------------------------------------
# R6) تابع پله‌ها — به ماژول v33 (کنار drawCsArash33)
# ---------------------------------------------------------------
rep("/* ---------- ۳۳-۳) پرچم‌های تست/بوت ---------- */",
    """/* ---------- ۳۳-۲b) پله‌های کناری برج (فروریختن فصل ۱) ---------- */
function drawCsStairs33() {
  const x0 = TOWER.x - 66;
  ctx.save();
  ctx.strokeStyle = 'rgba(26,22,18,0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x0, TOWER_TOP_Y); ctx.lineTo(x0, GROUND_Y);
  ctx.moveTo(x0 + 14, TOWER_TOP_Y); ctx.lineTo(x0 + 14, GROUND_Y);
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = 'rgba(48,40,32,0.9)';
  ctx.beginPath();
  const n = 9, dy = (GROUND_Y - TOWER_TOP_Y) / n;
  for (let i = 0; i < n; i++) {
    const y = TOWER_TOP_Y + dy * (i + 0.5);
    ctx.moveTo(x0, y); ctx.lineTo(x0 + 14, y + dy * 0.5);
  }
  ctx.stroke();
  ctx.restore();
}

/* ---------- ۳۳-۳) پرچم‌های تست/بوت ---------- */""",
    'R6: تابع drawCsStairs33')

# ---------------------------------------------------------------
# R7) drawCsArash33: زمانِ مطمئن (TR.t || CS.t) — در انتقال CS.t ثابت است
# ---------------------------------------------------------------
rep("  const t = (typeof CS !== 'undefined' && CS) ? CS.t : 0;",
    "  const t = (typeof TR !== 'undefined' && TR && TR.t) ? TR.t : ((typeof CS !== 'undefined' && CS) ? CS.t : 0);",
    'R7: منبع زمان drawCsArash33')

# ---------------------------------------------------------------
# R8) CS_CAPS مرده: املای ارشان یکدست (آرش → ارشان)
# ---------------------------------------------------------------
s = s.replace('آرش: ', 'ارشان: ')
log.append('  OK  R8: املای ارشان یکدست در CS_CAPS')

io.open(P, 'w', encoding='utf-8').write(s)
print('\n'.join(log))
print(f'size: {orig} -> {len(s)} bytes')
