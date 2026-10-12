#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""جزئیات زمین صحنه‌های اینترو (۲۶٫۰) — پس‌زمینه‌ی «باحال‌تر»"""
import io
P = '/home/z/my-project/scripts/v4_cine23.js'
s = io.open(P, encoding='utf-8').read()

# ---------- صحنه ۱: خیابان آسفالتِ ترک‌خورده + چاله‌مان + علف هرز + کاغذپاره ----------
old1 = """  /* خطوط کتانی خیابان که با دوربین می‌لغزند */
  ctx.strokeStyle = 'rgba(240,205,140,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const lx = ((i * 150 - t * 52) % (W + 200)) + 50;
    ctx.moveTo(lx, GROUND_Y + 14); ctx.lineTo(lx + 26, GROUND_Y + 14);
  }
  ctx.stroke();"""
assert old1 in s, 'scene1 anchor'
new1 = """  /* خطوط کتانی خیابان که با دوربین می‌لغزند */
  ctx.strokeStyle = 'rgba(240,205,140,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const lx = ((i * 150 - t * 52) % (W + 200)) + 50;
    ctx.moveTo(lx, GROUND_Y + 14); ctx.lineTo(lx + 26, GROUND_Y + 14);
  }
  ctx.stroke();
  /* (۲۶٫۰) زمینِ زنده: ترک‌های آسفالت + چاله‌مان + علف هرز + کاغذپاره */
  ctx.strokeStyle = 'rgba(12,10,20,0.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const cxx = ((i * 277 - t * 52) % (W + 300)) + 40;
    const cyy = GROUND_Y + 22 + (i % 3) * 14;
    ctx.moveTo(cxx, cyy);
    ctx.lineTo(cxx + 14 + (i % 2) * 9, cyy + 3 + (i % 3) * 2);
    ctx.lineTo(cxx + 20 + (i % 2) * 9, cyy + 12);
    if (i % 2 === 0) ctx.lineTo(cxx + 34, cyy + 16);
  }
  ctx.stroke();
  /* چاله‌ی فاضلاب */
  for (let i = 0; i < 2; i++) {
    const mx = ((i * 620 - t * 52) % (W + 700)) + 130;
    ctx.fillStyle = 'rgba(8,8,16,0.75)';
    ctx.beginPath(); ctx.ellipse(mx, GROUND_Y + 40, 17, 6.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,110,100,0.55)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(mx, GROUND_Y + 40, 17, 6.5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx - 12, GROUND_Y + 37.5); ctx.lineTo(mx + 12, GROUND_Y + 37.5);
    ctx.moveTo(mx - 12, GROUND_Y + 42.5); ctx.lineTo(mx + 12, GROUND_Y + 42.5);
    ctx.stroke();
  }
  /* علف هرزِ بین‌ترک‌ها */
  ctx.strokeStyle = 'rgba(58,84,52,0.75)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const gx = ((i * 199 + 90 - t * 52) % (W + 260)) + 30;
    const gy = GROUND_Y + 16 + (i % 4) * 9;
    const wv = Math.sin(t * 1.6 + i) * 1.8;
    ctx.moveTo(gx, gy); ctx.lineTo(gx - 2 + wv, gy - 6);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 3 + wv, gy - 8);
    ctx.moveTo(gx, gy); ctx.lineTo(gx + 1, gy - 4);
  }
  ctx.stroke();
  /* کاغذپاره‌های روان */
  ctx.fillStyle = 'rgba(225,220,205,0.30)';
  for (let i = 0; i < 4; i++) {
    const px = ((i * 311 + t * 34) % (W + 200)) - 100;
    const py = GROUND_Y + 18 + (i % 3) * 12 + Math.sin(t * 2.2 + i * 2) * 3;
    ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(t * 1.8 + i) * 0.8);
    ctx.fillRect(-4, -2.6, 8, 5.2); ctx.restore();
  }"""
s = s.replace(old1, new1)

# ---------- صحنه ۲: زمین کوچه — لکه‌آبِ بازتابنده‌ی مهتاب ----------
old2 = """  /* سطل زباله/گاری واژگونه در پیش‌زمینه */
  ctx.fillStyle = '#1a2038';
  rr(W * 0.16, GROUND_Y - 22, 30, 22, 4); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W * 0.78, GROUND_Y - 5, 26, 12, 0.2, 0, Math.PI * 2); ctx.fill();"""
assert old2 in s, 'scene2 anchor'
new2 = """  /* سطل زباله/گاری واژگونه در پیش‌زمینه */
  ctx.fillStyle = '#1a2038';
  rr(W * 0.16, GROUND_Y - 22, 30, 22, 4); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W * 0.78, GROUND_Y - 5, 26, 12, 0.2, 0, Math.PI * 2); ctx.fill();
  /* (۲۶٫۰) لکه‌آبِ بازتابنده‌ی مهتاب + خرده‌آوار کوچه */
  for (let i = 0; i < 3; i++) {
    const pxx = W * (0.2 + i * 0.28) + Math.sin(i * 2.4) * 40;
    const pyy = GROUND_Y + 14 + (i % 2) * 16;
    const pw = 34 + (i % 3) * 22, ph = 5 + (i % 2) * 2.6;
    const pg = ctx.createLinearGradient(pxx - pw, pyy, pxx + pw, pyy);
    pg.addColorStop(0, 'rgba(160,178,230,0.03)');
    pg.addColorStop(0.5, 'rgba(190,205,245,' + (0.22 - i * 0.04) + ')');
    pg.addColorStop(1, 'rgba(160,178,230,0.03)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.ellipse(pxx, pyy, pw, ph, 0, 0, Math.PI * 2); ctx.fill();
    /* موجِ آرام روی آب */
    ctx.strokeStyle = 'rgba(210,222,255,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath();
    const rp = (t * 0.6 + i) % 1;
    ctx.ellipse(pxx, pyy, pw * rp, ph * rp, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(22,26,44,0.9)';
  for (let i = 0; i < 6; i++) {
    const dx = ((i * 173 + 40) % (W - 80)) + 40;
    const dy = GROUND_Y + 12 + (i % 4) * 10;
    ctx.fillRect(dx, dy, 5 + (i % 3) * 3, 2.4);
    if (i % 3 === 0) { ctx.beginPath(); ctx.arc(dx + 9, dy + 5, 2, 0, Math.PI * 2); ctx.fill(); }
  }"""
s = s.replace(old2, new2)

# ---------- صحنه ۳: زمین خاکی — آوار آجر و میل‌گرد پراکنده ----------
old3 = """  /* زمین — با بازتاب مهتاب */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#1e2136'); gr.addColorStop(1, '#131526');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* دوربین: زومِ آرام به ساختمان + پنِ نرم */"""
assert old3 in s, 'scene3 anchor'
new3 = """  /* زمین — با بازتاب مهتاب */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#1e2136'); gr.addColorStop(1, '#131526');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* (۲۶٫۰) زمینِ محلِ ساختمان نیمه‌کاره: آوار آجر/سنگ + میل‌گرد پیچ‌خورده */
  {
    let s7 = 91;
    const rd7 = () => { s7 = (s7 * 1103515245 + 12345) & 0x7fffffff; return s7 / 0x7fffffff; };
    for (let i = 0; i < 14; i++) {
      const bx = 60 + rd7() * (W - 120);
      const by = GROUND_Y + 12 + rd7() * (H - GROUND_Y - 24);
      const bs = 3 + rd7() * 4.5;
      ctx.save(); ctx.translate(bx, by); ctx.rotate(rd7() * 2.4);
      ctx.fillStyle = i % 3 === 0 ? 'rgba(122,66,48,0.75)' : 'rgba(64,70,96,0.7)';
      ctx.fillRect(-bs, -bs * 0.42, bs * 2, bs * 0.84);
      ctx.fillStyle = 'rgba(255,255,255,0.09)';
      ctx.fillRect(-bs, -bs * 0.42, bs * 2, bs * 0.28);
      ctx.restore();
    }
    /* دو میل‌گرد پیچ‌خورده از آوار */
    ctx.strokeStyle = 'rgba(72,80,110,0.85)'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W * 0.16, GROUND_Y + 30);
    ctx.quadraticCurveTo(W * 0.2, GROUND_Y + 20, W * 0.25, GROUND_Y + 32);
    ctx.moveTo(W * 0.78, GROUND_Y + 40);
    ctx.quadraticCurveTo(W * 0.83, GROUND_Y + 30, W * 0.87, GROUND_Y + 42);
    ctx.stroke();
    /* تکه‌چوبِ پرت‌شده */
    ctx.strokeStyle = 'rgba(96,72,44,0.8)'; ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, GROUND_Y + 26); ctx.lineTo(W * 0.34, GROUND_Y + 30);
    ctx.moveTo(W * 0.64, GROUND_Y + 18); ctx.lineTo(W * 0.68, GROUND_Y + 22);
    ctx.stroke();
  }
  /* دوربین: زومِ آرام به ساختمان + پنِ نرم */"""
s = s.replace(old3, new3)

# ---------- صحنه ۴: زمین کارگاهی — تخته‌ها + جعبه‌ابزار + ارابه‌کوهی ----------
old4 = """  /* (۲۴٫۰) چراغ کارِ ایستاده کنار نردبان — نور گرمِ صحنه‌ی کار */"""
assert old4 in s, 'scene4 anchor'
new4 = """  /* (۲۶٫۰) زمینِ کارگاه: تخته‌های خوابیده + جعبه‌ابزار قرمز + ارابه‌کوهی */
  {
    /* تخته‌های چوبی خوابیده — همون تخته‌هایی که به پنجره‌ها کوبیده می‌شوند */
    const plank = (px, py, ang, len) => {
      ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
      ctx.fillStyle = 'rgba(122,92,54,0.92)';
      rr(-len / 2, -3.4, len, 6.8, 1.6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(-len / 2, -3.4, len, 1.8);
      ctx.strokeStyle = 'rgba(70,50,28,0.8)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(-len / 2 + 5, 0.5); ctx.lineTo(len / 2 - 5, 0.5); ctx.stroke();
      ctx.restore();
    };
    plank(W * 0.24, GROUND_Y + 30, 0.12, 64);
    plank(W * 0.3, GROUND_Y + 38, -0.06, 48);
    plank(W * 0.68, GROUND_Y + 34, 0.05, 56);
    plank(W * 0.74, GROUND_Y + 44, -0.14, 42);
    /* جعبه‌ابزار قرمز — چفت‌های طلایی */
    ctx.fillStyle = '#8f2f24';
    rr(W * 0.41, GROUND_Y + 20, 34, 15, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(W * 0.41, GROUND_Y + 20, 34, 2.6);
    ctx.strokeStyle = '#e8b54a'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(W * 0.41 + 6, GROUND_Y + 27); ctx.lineTo(W * 0.41 + 12, GROUND_Y + 27);
    ctx.moveTo(W * 0.41 + 22, GROUND_Y + 27); ctx.lineTo(W * 0.41 + 28, GROUND_Y + 27);
    ctx.stroke();
    ctx.strokeStyle = '#5f1e16'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(W * 0.41 + 17, GROUND_Y + 20, 7, Math.PI, 0); ctx.stroke();
    /* دسته‌چکش از جعبه بیرون */
    ctx.strokeStyle = 'rgba(138,122,86,0.95)'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(W * 0.41 + 27, GROUND_Y + 21); ctx.lineTo(W * 0.41 + 36, GROUND_Y + 12); ctx.stroke();
    /* ارابه‌کوهی (sawhorse) با نوار هشدار */
    const shx = W * 0.58, shy = GROUND_Y + 30;
    ctx.strokeStyle = 'rgba(110,86,56,0.95)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shx - 16, shy); ctx.lineTo(shx - 6, shy - 16);
    ctx.moveTo(shx + 4, shy - 16); ctx.lineTo(shx + 14, shy);
    ctx.moveTo(shx - 6, shy - 16); ctx.lineTo(shx + 4, shy - 16);
    ctx.stroke();
    ctx.fillStyle = 'rgba(214,178,64,0.85)';
    ctx.fillRect(shx - 9, shy - 19, 20, 5);
    ctx.fillStyle = 'rgba(24,22,18,0.85)';
    ctx.fillRect(shx - 5, shy - 19, 4, 5); ctx.fillRect(shx + 3, shy - 19, 4, 5);
  }
  /* (۲۴٫۰) چراغ کارِ ایستاده کنار نردبان — نور گرمِ صحنه‌ی کار */"""
s = s.replace(old4, new4)

io.open(P, 'w', encoding='utf-8').write(s)
print('OK ground details applied')
