#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌های ۱۷٫۰ (بخش ۲): راهنمای کنترل رانندگی + لایه‌های عمق تونل/زیپ‌لاین"""
import io

P = '/home/z/my-project/scripts/v4_transitions.js'
src = io.open(P, encoding='utf-8').read()
n = 0

def rep(old, new, count=1):
    global src, n
    assert src.count(old) >= count, f'NOT FOUND ({n}): {old[:80]!r}'
    src = src.replace(old, new, count)
    n += 1

# ---------- راهنمای کنترل: شاخه‌ی رانندگی ----------
rep("""    /* راهنمای کنترل (۵ ثانیه‌ی اول) */
    const k = clamp(MG.t2 / 0.5, 0, 1) * clamp((5.6 - MG.t2) / 0.8, 0, 1);
    if (k > 0.03) {
      ctx.globalAlpha = k;
      const hw = 470, hx = (W - hw) / 2, hy = by + 26;
      ctx.fillStyle = 'rgba(4,7,18,0.94)';
      rr(hx, hy, hw, 34, 17); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.6)'; ctx.lineWidth = 1.6;
      rr(hx, hy, hw, 34, 17); ctx.stroke();
      ctx.font = 'bold 13.5px Tahoma, sans-serif';
      ctx.fillStyle = '#ffd873';
      ctx.fillText('پرش', hx + hw - 130, hy + 17);
      ctx.fillStyle = '#8fd6ff';
      ctx.fillText('خم‌شدن', hx + 168, hy + 17);
      ctx.fillStyle = '#c3cdea';
      ctx.font = 'bold 12px Tahoma, sans-serif';
      ctx.fillText('↑ یا Space', hx + hw - 74, hy + 17);
      ctx.fillText('↓', hx + 108, hy + 17);
      ctx.fillStyle = '#c3cdea';
      ctx.font = 'bold 11.5px Tahoma, sans-serif';
      ctx.fillText('سرعت: ←/→      (لمس صفحه = پرش)', W / 2 - 60, hy + 17);
      ctx.globalAlpha = 1;
    }""",
    """    /* راهنمای کنترل (۵ ثانیه‌ی اول) — (۱۷٫۰) رانندگی متن خودش را دارد */
    const k = clamp(MG.t2 / 0.5, 0, 1) * clamp((5.6 - MG.t2) / 0.8, 0, 1);
    if (k > 0.03) {
      ctx.globalAlpha = k;
      const isDrive = cfg.theme === 'drive';
      const hw = isDrive ? 500 : 470, hx = (W - hw) / 2, hy = by + 26;
      ctx.fillStyle = 'rgba(4,7,18,0.94)';
      rr(hx, hy, hw, 34, 17); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.6)'; ctx.lineWidth = 1.6;
      rr(hx, hy, hw, 34, 17); ctx.stroke();
      ctx.font = 'bold 13.5px Tahoma, sans-serif';
      if (isDrive) {
        ctx.fillStyle = '#ffd873';
        ctx.fillText('فرمان', hx + hw - 92, hy + 17);
        ctx.fillStyle = '#8fd6ff';
        ctx.fillText('گاز', hx + 190, hy + 17);
        ctx.fillStyle = '#ff9d8f';
        ctx.fillText('ترمز', hx + 52, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 12px Tahoma, sans-serif';
        ctx.fillText('← / →', hx + hw - 40, hy + 17);
        ctx.fillText('↑', hx + 226, hy + 17);
        ctx.fillText('↓', hx + 92, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 10.5px Tahoma, sans-serif';
        ctx.fillText('لمس: چپ/راست فرمان — وسط ترمز (گاز خودکار) • کج‌کردن گوشی = فرمان', W / 2 - 62, hy + 17);
      } else {
        ctx.fillStyle = '#ffd873';
        ctx.fillText('پرش', hx + hw - 130, hy + 17);
        ctx.fillStyle = '#8fd6ff';
        ctx.fillText('خم‌شدن', hx + 168, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 12px Tahoma, sans-serif';
        ctx.fillText('↑ یا Space', hx + hw - 74, hy + 17);
        ctx.fillText('↓', hx + 108, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 11.5px Tahoma, sans-serif';
        ctx.fillText('سرعت: ←/→      (لمس صفحه = پرش)', W / 2 - 60, hy + 17);
      }
      ctx.globalAlpha = 1;
    }""")

# ---------- تونل: ردیفِ قوس‌های دور (پرسپکتیو) ----------
rep("""function tunnelBG(scroll, gy) {
  ctx.fillStyle = '#020309';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  /* قوس‌های تونل */
  const spacing = 200, off = scroll * 0.85;""",
    """function tunnelBG(scroll, gy) {
  ctx.fillStyle = '#020309';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  /* (۱۷٫۰) لایه‌ی عمق: ردیف قوس‌های دور — کوچک‌تر/کم‌رنگ‌تر/کندتر
     (هماهنگ با پرسپکتیو مینی‌گیم رانندگی) */
  {
    const sp2 = 340, off2 = scroll * 0.34;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#0d1420'; ctx.lineWidth = 4;
    for (let i = -1; i < W / sp2 + 2; i++) {
      const sx = i * sp2 - (off2 % sp2);
      ctx.beginPath();
      ctx.moveTo(sx - 26, H);
      ctx.quadraticCurveTo(sx - 26, gy - 88, sx, gy - 88);
      ctx.quadraticCurveTo(sx + 26, gy - 88, sx + 26, H);
      ctx.stroke();
    }
    ctx.restore();
  }
  /* قوس‌های تونل */
  const spacing = 200, off = scroll * 0.85;""")

# ---------- زیپ‌لاین: ستیغ کوهِ دورتر (پارالاکس کندتر) ----------
rep("""  /* کوهستان دور (پارالاکس) */
  const off = scroll * 0.22;
  ctx.fillStyle = '#131b2c';
  ctx.beginPath(); ctx.moveTo(-20, gy + 60);
  for (let i = 0; i < 16; i++) {
    const x = i * 92 - (off % 92);
    ctx.lineTo(x + 46, gy - 44 - ((i * 41) % 66));
    ctx.lineTo(x + 92, gy + 34);
  }
  ctx.lineTo(W + 20, gy + 60); ctx.closePath(); ctx.fill();""",
    """  /* (۱۷٫۰) لایه‌ی عمق: ستیغِ خیلی دور — روشن‌تر/کندتر (پرسپکتیو) */
  {
    const off0 = scroll * 0.09;
    ctx.fillStyle = 'rgba(38,50,74,0.55)';
    ctx.beginPath(); ctx.moveTo(-20, gy + 40);
    for (let i = 0; i < 12; i++) {
      const x = i * 124 - (off0 % 124);
      ctx.lineTo(x + 62, gy - 64 - ((i * 53) % 82));
      ctx.lineTo(x + 124, gy + 28);
    }
    ctx.lineTo(W + 20, gy + 40); ctx.closePath(); ctx.fill();
  }
  /* کوهستان دور (پارالاکس) */
  const off = scroll * 0.22;
  ctx.fillStyle = '#131b2c';
  ctx.beginPath(); ctx.moveTo(-20, gy + 60);
  for (let i = 0; i < 16; i++) {
    const x = i * 92 - (off % 92);
    ctx.lineTo(x + 46, gy - 44 - ((i * 41) % 66));
    ctx.lineTo(x + 92, gy + 34);
  }
  ctx.lineTo(W + 20, gy + 60); ctx.closePath(); ctx.fill();""")

# ---------- تونل: موانع ثانویه‌ی دور (سیلوی بشکه/تیر دور) ----------
rep("""function tunnelProps(scroll, gy) {
  /* ارشان با فانوس جلوتر (سایه‌ی روشن) */""",
    """function tunnelProps(scroll, gy) {
  /* (۱۷٫۰) لایه‌ی عمق: بشکه‌های دور — کوچک/کم‌رنگ/کند */
  {
    const sp2 = 300, off2 = scroll * 0.38;
    ctx.save();
    ctx.globalAlpha = 0.45;
    for (let i = -1; i < W / sp2 + 2; i++) {
      const sx = i * sp2 - (off2 % sp2) + 90;
      if (sx < -30 || sx > W + 30) continue;
      ctx.fillStyle = '#241d24';
      rr(sx - 7, gy - 15, 14, 15, 3); ctx.fill();
      ctx.fillStyle = '#8a6a2c';
      ctx.fillRect(sx - 7, gy - 11, 14, 2.4);
    }
    ctx.restore();
  }
  /* ارشان با فانوس جلوتر (سایه‌ی روشن) */""")

# ---------- زیپ‌لاین: تیرک‌های دور دره ----------
rep("""function ziplineProps(scroll, gy) {
  /* دسته‌ی زیپ‌لاین روی کابل بالای بازیکن */""",
    """function ziplineProps(scroll, gy) {
  /* (۱۷٫۰) لایه‌ی عمق: تیرک‌های دور دره — کوچک/کم‌رنگ/کند */
  {
    const sp2 = 420, off2 = scroll * 0.36;
    ctx.save();
    ctx.globalAlpha = 0.4;
    for (let i = -1; i < W / sp2 + 2; i++) {
      const sx = i * sp2 - (off2 % sp2) + 140;
      if (sx < -30 || sx > W + 30) continue;
      ctx.strokeStyle = '#26314a'; ctx.lineWidth = 3.4; ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(sx, gy + 54);
      ctx.lineTo(sx - 3, gy + 6);
      ctx.lineTo(sx + 2, gy - 16);
      ctx.stroke();
      ctx.fillStyle = '#7a5a2c';
      circle(sx + 2, gy - 17, 1.6);
    }
    ctx.restore();
  }
  /* دسته‌ی زیپ‌لاین روی کابل بالای بازیکن */""")

io.open(P, 'w', encoding='utf-8').write(src)
print(f'OK — {n} وصله‌ی دوم روی v4_transitions.js اعمال شد')
