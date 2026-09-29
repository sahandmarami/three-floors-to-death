#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌ی ۱۷٫۰ روی v3_part2.js — ورودی‌های مینی‌گیم رانندگی (گاز/ترمز/فرمان)"""
import io

P = '/home/z/my-project/scripts/v3_part2.js'
src = io.open(P, encoding='utf-8').read()
n = 0

def rep(old, new, count=1):
    global src, n
    assert src.count(old) >= count, f'NOT FOUND ({n}): {old[:80]!r}'
    src = src.replace(old, new, count)
    n += 1

# ---------- pointerdown: در رانندگی لمس = فرمان/ترمز (نه پرش) ----------
rep("""  /* (۱۰٫۰) مینی‌گیم فرار (انتقال بین فصل‌ها): کلیک/لمس = پرش */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    mgJump();
    e.preventDefault();
    return;
  }""",
    """  /* (۱۰٫۰) مینی‌گیم فرار (انتقال بین فصل‌ها): کلیک/لمس = پرش
     (۱۷٫۰) تم رانندگی: یک‌سوم چپ/راست = فرمان، وسط = ترمز (گاز خودکار) */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (typeof MG !== 'undefined' && MG.cfg && MG.cfg.theme === 'drive') {
      if (p.x < W / 3) mgNudge(-1);
      else if (p.x > W * 2 / 3) mgNudge(1);
      else mgBrake(true);
    } else mgJump();
    e.preventDefault();
    return;
  }""")

# ---------- pointerup: رها کردن فرمان/ترمز لمسی ----------
rep("""window.addEventListener('pointerup', () => {
  state.mouse.down = false;
  /* (۸٫۰) رها کردن لمس = قطع گاز/ترمز لمسی */
  if (CS && CS.drive) { CS.drive.touch.a = false; CS.drive.touch.b = false; }
});""",
    """window.addEventListener('pointerup', () => {
  state.mouse.down = false;
  /* (۸٫۰) رها کردن لمس = قطع گاز/ترمز لمسی */
  if (CS && CS.drive) { CS.drive.touch.a = false; CS.drive.touch.b = false; }
  /* (۱۷٫۰) رها کردن لمس مینی‌گیم رانندگی = قطع فرمان/ترمز */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    mgNudge(0); mgBrake(false);
  }
});""")

# ---------- keydown: ↑=گاز (در رانندگی)، ↓=ترمز ----------
rep("""  /* (۱۰٫۰) مینی‌گیم فرار در انتقال فصل‌ها: پرش/خم‌شدن/سرعت */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (e.code === 'ArrowUp' || e.code === 'Space') { mgJump(); e.preventDefault(); }
    else if (e.code === 'ArrowDown') { mgDuck(true); e.preventDefault(); }
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(-1); e.preventDefault(); }
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(1); e.preventDefault(); }
    return;
  }""",
    """  /* (۱۰٫۰) مینی‌گیم فرار در انتقال فصل‌ها: پرش/خم‌شدن/سرعت
     (۱۷٫۰) تم رانندگی: ↑/W/Space = گاز • ↓/S = ترمز • ←/→ = فرمان */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    const isDrive = typeof MG !== 'undefined' && MG.cfg && MG.cfg.theme === 'drive';
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
      if (isDrive) mgGas(true); else mgJump();
      e.preventDefault();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (isDrive) mgBrake(true); else mgDuck(true);
      e.preventDefault();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(-1); e.preventDefault(); }
    else if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(1); e.preventDefault(); }
    return;
  }""")

# ---------- keyup: رها کردن گاز/ترمز ----------
rep("""  /* (۱۰٫۰) رها کردن کلیدهای مینی‌گیم فرار (خم‌شدن + سرعت) */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (e.code === 'ArrowDown') { mgDuck(false); return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(0); return; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(0); return; }
  }""",
    """  /* (۱۰٫۰) رها کردن کلیدهای مینی‌گیم فرار (خم‌شدن + سرعت + گاز/ترمزِ ۱۷٫۰) */
  if (state.mode === 'transition' && typeof TR !== 'undefined' && TR && TR.phase === 2) {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { mgDuck(false); mgBrake(false); return; }
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') { mgGas(false); return; }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { mgNudge(0); return; }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { mgNudge(0); return; }
  }""")

io.open(P, 'w', encoding='utf-8').write(src)
print(f'OK — {n} وصله روی v3_part2.js اعمال شد')
