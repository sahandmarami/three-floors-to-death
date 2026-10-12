/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — موتور موشن‌گرافیک کات‌سین‌ها
   ==================================================================
   سبک «کلیپ موشن‌گرافیکی»: پارالاکس چندلایه + دوربین متحرک (پن/زوم)
   + سایه‌سیم‌های شخصیت‌ها با چرخه‌ی راه‌رفتن + کارت‌های عنوان سینمایی
   + نوار لتربوکس واقعی + گرین فیلم + مه روان.
   صحنه‌های اینترو (اصلاح داستانی!):
     ۱) شهر در حال خالی‌شدن — دو بازمانده در حال راه
     ۲) کوچه‌ی تاریک — صدای زامبی‌ها نزدیک می‌شود
     ۳) پیدا کردن ساختمانِ «موجودِ» نیمه‌کاره (نه ساختِ برج!)
     ۴) استحکام‌بخشی: تخته‌کوبی پنجره‌ها — اولین شب نزدیک است
   ================================================================== */

const MG23 = {
  grainT: 0,

  /* (۲۴٫۰) بالابرندیِ نهایی صحنه — همه‌چیز دیده شود، رنگ‌ها نشویند */
  lift(k) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(30,36,64,' + (0.50 * k) + ')');
    g.addColorStop(0.55, 'rgba(24,28,52,' + (0.34 * k) + ')');
    g.addColorStop(1, 'rgba(16,18,34,' + (0.20 * k) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  },

  /* ---------- ابزار مشترک ---------- */
  /* (۲۴٫۰) نوار لتربوکس باریک‌تر — تصویر بیشتر دیده شود */
  letterbox() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, 30);
    ctx.fillRect(0, H - 30, W, 30);
  },

  /* گرین فیلم سبک‌تر (۲۴: تاریکی کمتر) */
  grain(dt) {
    this.grainT += dt || 0.016;
    const g = this.grainT;
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      const x = ((Math.sin(g * 3.1 + i * 2.7) + 1) / 2) * W;
      const y = ((Math.sin(g * 2.3 + i * 1.3 + 1) + 1) / 2) * H;
      ctx.fillRect(x, y, 90, 26);
    }
    ctx.restore();
  },

  /* کارت عنوان — (۲۴٫۰) درشت‌تر و روشن‌تر */
  title(t, main, sub) {
    const a = clamp(Math.sin(Math.min(t / 1.1, 1) * Math.PI * 0.5) * (t < 4 ? 1 : clamp(1 - (t - 4) / 0.8, 0, 1)), 0, 1);
    if (a <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(3,5,12,0.62)';
    ctx.fillRect(0, H * 0.16 - 38, W, 84);
    ctx.font = '900 34px Tahoma, sans-serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 10;
    ctx.fillText(main, W / 2, H * 0.16);
    if (sub) {
      ctx.font = 'bold 14px Tahoma, sans-serif';
      ctx.fillStyle = '#cfd9f2';
      ctx.shadowBlur = 6;
      ctx.fillText(sub, W / 2, H * 0.16 + 28);
    }
    ctx.restore();
  },

  /* دو بازمانده — سیم‌سایه با چرخه‌ی راه‌رفتن (سهند + آرشانِ کلاه‌قرمز) */
  /* x,y = پا؛ s = مقیاس؛ ph = فاز راه؛ moving=1 در حال راه، 0 ایستاده */
  walk2(x, y, s, ph, moving, look) {
    const step = Math.sin(ph), step2 = Math.sin(ph + Math.PI);
    const bob = Math.abs(Math.sin(ph)) * 1.6 * moving;
    const m1 = moving;
    /* --- سهند (جلو، بلندتر) --- */
    ctx.save();
    ctx.translate(x, y - bob);
    ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath(); ctx.ellipse(0, 1, 15, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    const B1 = '#1c2338';
    /* پاها */
    ctx.strokeStyle = B1; ctx.lineWidth = 5.6; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -14); ctx.lineTo(-3 + step * 8 * m1, -1);
    ctx.moveTo(3, -14); ctx.lineTo(4 + step2 * 8 * m1, -1);
    ctx.stroke();
    /* بدن + کوله */
    ctx.fillStyle = B1;
    rr(-7.5, -27, 15, 14, 5); ctx.fill();
    ctx.fillStyle = '#2a3452';
    rr(-10.5, -26, 5.5, 10, 3); ctx.fill();
    /* بازوها — تاب آرام */
    ctx.strokeStyle = B1; ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(-5, -24); ctx.lineTo(-7 - step * 3 * m1, -14);
    ctx.moveTo(5, -24); ctx.lineTo(7 - step2 * 3 * m1, -14);
    ctx.stroke();
    /* سر + موی کوتاه */
    ctx.fillStyle = B1;
    circle(1.5, -32, 5.6);
    /* (۲۴٫۰) خطِ نورِ لبه‌ی قوی‌تر — شخصیت‌ها همیشه خوانا */
    ctx.strokeStyle = 'rgba(190,205,245,0.5)'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(-7, -26.5); ctx.lineTo(6, -26.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(190,205,245,0.30)';
    ctx.beginPath(); ctx.arc(1.5, -32, 5.6, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
    ctx.restore();

    /* --- آرشان (عقب، کلاه‌قرمز) --- */
    const x2 = x - 26 * s, ph2 = ph + 0.6;
    const st1 = Math.sin(ph2), st2 = Math.sin(ph2 + Math.PI);
    const bob2 = Math.abs(Math.sin(ph2)) * 1.5 * moving;
    ctx.save();
    ctx.translate(x2, y - bob2);
    ctx.scale(s * 0.92, s * 0.92);
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath(); ctx.ellipse(0, 1, 13, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    const B2 = '#1e2540';
    ctx.strokeStyle = B2; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -12.5); ctx.lineTo(-3 + st1 * 7 * m1, -1);
    ctx.moveTo(3, -12.5); ctx.lineTo(4 + st2 * 7 * m1, -1);
    ctx.stroke();
    ctx.fillStyle = B2;
    rr(-7, -24.5, 14, 13, 5); ctx.fill();
    /* کوله‌پشتی نارنجیِ تیره */
    ctx.fillStyle = '#4a341f';
    rr(6.5, -23.5, 5, 9, 3); ctx.fill();
    ctx.strokeStyle = B2; ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(-4.5, -22); ctx.lineTo(-6 - st1 * 3 * m1, -13);
    ctx.moveTo(4.5, -22); ctx.lineTo(6 - st2 * 3 * m1, -13);
    ctx.stroke();
    /* سر + کلاه‌قرمز روشن‌تر — لکه‌ی رنگ صحنه */
    ctx.fillStyle = B2;
    circle(1, -29, 5);
    ctx.fillStyle = '#8a2a34';
    ctx.beginPath(); ctx.arc(1, -29.6, 5.4, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-4.4, -30.8, 10.8, 2.6);
    ctx.strokeStyle = 'rgba(190,205,245,0.34)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-7, -24); ctx.lineTo(6, -24); ctx.stroke();
    ctx.restore();
    void look;
  },

  /* افق شهری پارالاکس — ۳ لایه با درجه‌ی روشنایی و سرعت متفاوت */
  cityLayer(yBase, hMin, hMax, col, drift, seed, windowGlow) {
    let s = seed;
    const rd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    ctx.fillStyle = col;
    let x = -60 + drift % 90;
    let guard = 0;
    while (x < W + 60 && guard++ < 70) {
      const bw = 50 + rd() * 74;
      const bh = hMin + rd() * hMax;
      ctx.fillRect(x, yBase - bh, bw, bh + 4);
      /* آنتن/پشت‌بمه‌های نادر */
      if (rd() < 0.22) ctx.fillRect(x + bw * 0.35, yBase - bh - 9, 3, 9);
      if (rd() < 0.16) ctx.fillRect(x + bw * 0.7, yBase - bh - 14, 2, 14);
      /* پنجره‌های روشن — (۲۴٫۰) بیشتر و درشت‌تر: شهر زنده‌تر دیده شود */
      if (windowGlow && rd() < 0.34) {
        ctx.fillStyle = 'rgba(255,190,110,0.34)';
        ctx.fillRect(x + 8 + rd() * bw * 0.5, yBase - bh + 10 + rd() * (bh * 0.5), 4.5, 6.5);
        ctx.fillStyle = col;
      }
      x += bw + 10 + rd() * 34;
    }
  },

  /* نوار مه روان */
  fogBands(t, y, n, speed, alpha, hue) {
    for (let i = 0; i < n; i++) {
      const fx = ((t * speed * (0.6 + (i % 3) * 0.28) + i * 370) % (W + 500)) - 250;
      const fw = 190 + (i % 4) * 90;
      ctx.fillStyle = 'rgba(' + (hue || '120,140,190') + ',' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(fx, y + Math.sin(i * 2.1 + t * 0.4) * 7, fw / 2, 17 + (i % 3) * 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  /* کلاغ‌های عبوری */
  crows(t, y) {
    for (let i = 0; i < 3; i++) {
      const cx = ((t * (34 + i * 9) + i * 330) % (W + 160)) - 80;
      const cy = y + Math.sin(t * 2 + i * 2.4) * 9 + i * 13;
      const fl = Math.sin(t * 7 + i * 2) * 4;
      ctx.strokeStyle = 'rgba(8,9,16,0.9)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - fl * 0.4); ctx.lineTo(cx, cy); ctx.lineTo(cx + 6, cy - fl * 0.4);
      ctx.stroke();
    }
  },

  /* ساختمانِ «موجودِ» نیمه‌کاره — قهرمانِ صحنه‌ی ۳ و ۴
     حالت‌ها: found = پیدا شدن (خرابه/شکسته) | fort = استحکام‌یافته (تخته‌ها) */
  building23(x, y, s, t, mode, duskK) {
    const bw = 158, fh = 64;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    /* آوار و خارپشتِ آهنیِ ساختِ نیمه‌کاره — سمت چپِ بنا (۲۴: روشن‌تر) */
    ctx.fillStyle = '#141a30';
    ctx.beginPath();
    ctx.moveTo(-bw / 2 - 34, 0);
    ctx.lineTo(-bw / 2 - 12, -12); ctx.lineTo(-bw / 2 - 4, -5);
    ctx.lineTo(-bw / 2 + 8, -16); ctx.lineTo(-bw / 2 + 18, -4);
    ctx.lineTo(-bw / 2 + 2, 0);
    ctx.closePath(); ctx.fill();
    /* میل‌گردهای بیرون‌زده از طبقه‌ی سوم (نشانه‌ی نیمه‌کاره بودن) */
    ctx.strokeStyle = '#2a3158'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const rx = -bw / 2 + 14 + i * 13;
      ctx.moveTo(rx, -fh * 3 + 2); ctx.lineTo(rx + 2, -fh * 3 - 13 - (i % 3) * 5);
    }
    ctx.stroke();
    /* سایه روی زمین */
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.moveTo(-bw / 2, 2); ctx.lineTo(bw / 2, 2);
    ctx.lineTo(bw / 2 - 96, 26); ctx.lineTo(-bw / 2 - 120, 26);
    ctx.closePath(); ctx.fill();
    /* ضلع راست — عمق ۲.۵بعدی (۲۴: روشن‌تر) */
    ctx.fillStyle = mode === 'fort' ? '#161c3c' : '#141a36';
    ctx.beginPath();
    ctx.moveTo(bw / 2, 0); ctx.lineTo(bw / 2 + 27, -10);
    ctx.lineTo(bw / 2 + 27, -fh * 3 - 10); ctx.lineTo(bw / 2, -fh * 3);
    ctx.closePath(); ctx.fill();
    /* نمای اصلی — بتنیِ خسته (۲۴: روشن‌تر با ته‌رنگ مهتاب) */
    const fg = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    const base = mode === 'fort' ? ['#242c54', '#1c2446', '#151b38'] : ['#20284c', '#19203f', '#121734'];
    fg.addColorStop(0, base[0]); fg.addColorStop(0.6, base[1]); fg.addColorStop(1, base[2]);
    ctx.fillStyle = fg;
    ctx.fillRect(-bw / 2, -fh * 3, bw, fh * 3);
    /* کتنه‌ی بام نیمه‌کاره — یک طرفش آماده، طرف دیگر میل‌گرد */
    ctx.fillStyle = '#2a3158';
    ctx.fillRect(-bw / 2 - 7, -fh * 3 - 9, bw * 0.72, 10);
    ctx.fillRect(bw / 2 + 19, -fh * 3 - 17, 12, 10);
    /* (۲۴٫۰) لبه‌ی نورِ ماه روی سمتِ چپِ بنا */
    ctx.strokeStyle = 'rgba(205,218,255,0.28)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(-bw / 2, -fh * 3); ctx.lineTo(-bw / 2, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(205,218,255,0.16)';
    ctx.beginPath(); ctx.moveTo(bw / 2 + 27, -fh * 3 - 10); ctx.lineTo(bw / 2 + 27, -10); ctx.stroke();
    /* ترک‌های دیوار (حالت found) */
    if (mode === 'found') {
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-bw / 2 + 30, -fh * 3 + 8);
      ctx.lineTo(-bw / 2 + 38, -fh * 3 + 34);
      ctx.lineTo(-bw / 2 + 33, -fh * 3 + 58);
      ctx.moveTo(bw / 2 - 40, -fh * 2 + 6);
      ctx.lineTo(bw / 2 - 33, -fh * 2 + 30);
      ctx.stroke();
    }
    /* پنجره‌ها */
    const win23 = (wx, wy, ww, wh, state23) => {
      ctx.fillStyle = '#0a0e1c';
      rr(wx, wy, ww, wh, 2); ctx.fill();
      ctx.strokeStyle = '#2a3158'; ctx.lineWidth = 1.4;
      rr(wx, wy, ww, wh, 2); ctx.stroke();
      if (state23 === 'broken') {
        /* شیشه‌ی شکسته — (۲۴: برقِ شیشه پررنگ‌تر) */
        ctx.strokeStyle = 'rgba(170,195,240,0.55)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(wx + 3, wy + 5); ctx.lineTo(wx + ww * 0.45, wy + wh * 0.5); ctx.lineTo(wx + 5, wy + wh - 4);
        ctx.moveTo(wx + ww - 4, wy + 4); ctx.lineTo(wx + ww * 0.55, wy + wh * 0.4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,255,0.10)';
        rr(wx, wy, ww, wh, 2); ctx.fill();
      } else if (state23 === 'board') {
        /* تخته‌ی کوبیده‌شده — چوبِ روشن‌تر */
        ctx.strokeStyle = '#5c4722'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wx - 3, wy + 5); ctx.lineTo(wx + ww + 3, wy + 9);
        ctx.moveTo(wx - 3, wy + wh - 8); ctx.lineTo(wx + ww + 3, wy + wh - 12);
        ctx.stroke();
      } else if (state23 === 'lit') {
        const wm = 0.8 + 0.2 * Math.sin(t * 2.2) * Math.sin(t * 0.8);
        const g2 = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        g2.addColorStop(0, 'rgba(255,198,112,' + (0.85 * wm * duskK) + ')');
        g2.addColorStop(1, 'rgba(220,130,60,' + (0.6 * wm * duskK) + ')');
        ctx.fillStyle = g2;
        rr(wx, wy, ww, wh, 2); ctx.fill();
        ctx.strokeStyle = 'rgba(18,14,8,0.85)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
        ctx.stroke();
        const hg = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 3, wx + ww / 2, wy + wh / 2, 52);
        hg.addColorStop(0, 'rgba(255,170,80,' + (0.15 * wm * duskK) + ')');
        hg.addColorStop(1, 'rgba(255,170,80,0)');
        ctx.fillStyle = hg; circle(wx + ww / 2, wy + wh / 2, 52);
      }
    };
    if (mode === 'found') {
      win23(-bw / 2 + 18, -fh * 3 + 12, 30, 36, 'broken');
      win23(bw / 2 - 48, -fh * 3 + 12, 30, 36, 'broken');
      win23(-bw / 2 + 18, -fh * 2 + 12, 30, 36, 'broken');
      win23(bw / 2 - 48, -fh * 2 + 12, 30, 36, 'dark');
      win23(-bw / 2 + 18, -fh + 12, 30, 36, 'broken');
      win23(bw / 2 - 48, -fh + 12, 30, 36, 'broken');
      /* درِ شکسته/باز — (۲۴: روشن‌تر) */
      ctx.fillStyle = '#0e1424';
      ctx.fillRect(-17, -46, 34, 46);
      ctx.strokeStyle = '#3a311c'; ctx.lineWidth = 2;
      ctx.strokeRect(-17, -46, 34, 46);
      /* دیوارنگاره‌ی مبهم روی دیوار (حس انسانی‌هایی که بودند) — پررنگ‌تر */
      ctx.fillStyle = 'rgba(232,84,64,0.42)';
      ctx.font = 'bold 15px Tahoma';
      ctx.textAlign = 'center';
      ctx.fillText('زنده بمان', 0, -fh * 2 - 12);
    } else {
      /* fort: طبقه‌ی بالا روشن (دیده‌بانی)، بقیه تخته‌کوبی */
      win23(-bw / 2 + 18, -fh * 3 + 12, 30, 36, 'lit');
      win23(bw / 2 - 48, -fh * 3 + 12, 30, 36, 'dark');
      win23(-bw / 2 + 18, -fh * 2 + 12, 30, 36, 'board');
      win23(bw / 2 - 48, -fh * 2 + 12, 30, 36, 'board');
      win23(-bw / 2 + 18, -fh + 12, 30, 36, 'board');
      win23(bw / 2 - 48, -fh + 12, 30, 36, 'board');
      /* درِ ورودی — ورق فلزی (۲۴: روشن‌تر) */
      ctx.fillStyle = '#141a2a';
      ctx.fillRect(-17, -46, 34, 46);
      ctx.fillStyle = '#323846';
      ctx.fillRect(-15, -44, 30, 42);
      ctx.strokeStyle = '#141a2a'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { ctx.moveTo(-15, -38 + i * 13); ctx.lineTo(15, -38 + i * 13); }
      ctx.stroke();
      /* نور از درزِ در — پررنگ‌تر */
      const dg = ctx.createRadialGradient(0, -22, 3, 0, -22, 48);
      dg.addColorStop(0, 'rgba(255,190,100,' + (0.22 * duskK) + ')');
      dg.addColorStop(1, 'rgba(255,190,100,0)');
      ctx.fillStyle = dg; circle(0, -22, 48);
    }
    /* خطوط طبقات */
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bw / 2, -fh); ctx.lineTo(bw / 2, -fh);
    ctx.moveTo(-bw / 2, -fh * 2); ctx.lineTo(bw / 2, -fh * 2);
    ctx.moveTo(bw / 2, -fh); ctx.lineTo(bw / 2 + 27, -fh - 10);
    ctx.moveTo(bw / 2, -fh * 2); ctx.lineTo(bw / 2 + 27, -fh * 2 - 10);
    ctx.stroke();
    ctx.restore();
  },

  /* زامبی‌های پس‌زمینه با چشم سرخ — آرام نزدیک می‌شوند */
  bgZombies23(t, x0, y, n, spread, k, scale) {
    for (let i = 0; i < n; i++) {
      const ph = t * 2 + i * 1.7;
      const zx = x0 + i * spread - k * (40 + i * 22);
      const zz = 0.55 + (i % 3) * 0.28;
      const zs = scale * zz;
      ctx.save();
      ctx.translate(zx, y + (1 - zz) * 8);
      ctx.scale(zs, zs);
      const BC = 'rgba(14,18,34,0.97)';
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(0, 1, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = BC; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-2, -11); ctx.lineTo(-3 + Math.sin(ph) * 6, -1);
      ctx.moveTo(3, -11); ctx.lineTo(4 + Math.sin(ph + Math.PI) * 6, -1);
      ctx.stroke();
      ctx.fillStyle = BC;
      rr(-7, -23, 14, 13, 4); ctx.fill();
      ctx.strokeStyle = BC; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-5, -21); ctx.lineTo(-8 - Math.sin(ph) * 3, -11);
      ctx.moveTo(5, -21); ctx.lineTo(8 + Math.sin(ph + 1.3) * 3, -11);
      ctx.stroke();
      circle(1.5, -27.5, 4.8);
      /* (۲۴٫۰) چشم‌های سرخ درشت‌تر و تابان‌تر */
      const er = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i));
      ctx.shadowColor = 'rgba(255,60,40,0.8)'; ctx.shadowBlur = 6;
      ctx.fillStyle = 'rgba(255,80,55,' + Math.min(1, er + 0.35).toFixed(2) + ')';
      circle(2.6, -28.4, 1.6); circle(4.8, -28.4, 1.6);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  },
};

/* ==================================================================
   صحنه‌های موشن‌گرافیکی اینترو (۲۳٫۰)
   ================================================================== */

/* --- صحنه ۱: شهر در حال خالی‌شدن — (۲۴٫۰) غروبِ زنده و دیده‌شودنی --- */
function introScCityMG(t) {
  /* آسمانِ غروبِ دیرهنگام — (۲۴: گرم‌تر و روشن‌تر) */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#1a2044');
  sky.addColorStop(0.45, '#4a2a4e');
  sky.addColorStop(0.75, '#8a3a42');
  sky.addColorStop(1, '#c65a34');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* خورشیدِ در حال غروب — پشتِ افق، درشت و تابان */
  const sx = W * 0.62 - t * 3.5;
  const sg = ctx.createRadialGradient(sx, GROUND_Y - 66, 8, sx, GROUND_Y - 66, 170);
  sg.addColorStop(0, 'rgba(255,150,80,0.75)');
  sg.addColorStop(0.45, 'rgba(255,110,60,0.30)');
  sg.addColorStop(1, 'rgba(255,90,50,0)');
  ctx.fillStyle = sg; circle(sx, GROUND_Y - 66, 170);
  ctx.fillStyle = 'rgba(255,175,105,0.95)';
  circle(sx, GROUND_Y - 66, 36);
  ctx.fillStyle = 'rgba(255,220,170,0.9)';
  circle(sx - 8, GROUND_Y - 74, 14);
  /* نوارِ نورِ خورشید روی آسمان */
  const bg = ctx.createLinearGradient(0, GROUND_Y - 130, 0, GROUND_Y);
  bg.addColorStop(0, 'rgba(255,140,70,0)');
  bg.addColorStop(1, 'rgba(255,140,70,0.18)');
  ctx.fillStyle = bg; ctx.fillRect(0, GROUND_Y - 130, W, 130);
  /* ستاره‌های کم‌سو */
  for (let i = 0; i < 22; i++) {
    const stx = (i * 173.3) % W, sty = (i * 91.7) % 150;
    ctx.fillStyle = 'rgba(220,228,255,' + (0.18 + 0.14 * Math.sin(t * 1.4 + i)).toFixed(2) + ')';
    ctx.fillRect(stx, sty, 1.6, 1.6);
  }
  MG23.crows(t, 92);
  /* سه لایه‌ی شهری پارالاکس — (۲۴: روشن‌تر) */
  MG23.cityLayer(GROUND_Y + 2, 60, 150, '#2e3a63', -t * 26, 42, true);
  MG23.cityLayer(GROUND_Y + 2, 34, 92, '#222b4e', -t * 48, 77, true);
  MG23.cityLayer(GROUND_Y + 2, 16, 48, '#161c38', -t * 78, 13, false);
  /* خیابان — با بازتاب گرمِ غروب */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#3a2836'); gr.addColorStop(1, '#1c1424');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* خطوط کتانی خیابان که با دوربین می‌لغزند */
  ctx.strokeStyle = 'rgba(240,205,140,0.16)'; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const lx = ((i * 150 - t * 52) % (W + 200)) + 50;
    ctx.moveTo(lx, GROUND_Y + 14); ctx.lineTo(lx + 26, GROUND_Y + 14);
  }
  ctx.stroke();
  /* ماشینِ متروکه‌ی کنار خیابان — با بازتابِ آسمان */
  const carx = ((-t * 30 + 400) % (W + 400)) - 200;
  ctx.save();
  ctx.translate(carx, GROUND_Y + 6);
  ctx.fillStyle = '#1a2038';
  rr(-42, -20, 84, 15, 5); ctx.fill();
  rr(-26, -30, 48, 13, 4); ctx.fill();
  ctx.fillStyle = '#0a0c18';
  circle(-26, -4, 7); circle(26, -4, 7);
  ctx.strokeStyle = 'rgba(255,150,90,0.35)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-42, -20); ctx.lineTo(42, -20); ctx.stroke();
  ctx.restore();
  /* تیرهای چراغ خیابان — (۲۴: همه روشن، هاله‌ی گرم) */
  for (let i = 0; i < 4; i++) {
    const lx = ((i * 340 - t * 52) % (W + 400)) + 100;
    ctx.strokeStyle = '#1a2038'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(lx, GROUND_Y + 10); ctx.lineTo(lx, GROUND_Y - 108);
    ctx.quadraticCurveTo(lx + 26, GROUND_Y - 116, lx + 44, GROUND_Y - 108);
    ctx.stroke();
    const fl = 0.75 + 0.25 * Math.sin(t * 7 + i);
    const lg = ctx.createRadialGradient(lx + 44, GROUND_Y - 104, 3, lx + 44, GROUND_Y - 104, 62);
    lg.addColorStop(0, 'rgba(255,208,130,' + (0.44 * fl) + ')');
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = lg; circle(lx + 44, GROUND_Y - 104, 62);
    ctx.fillStyle = 'rgba(255,235,190,' + (0.85 * fl) + ')';
    circle(lx + 44, GROUND_Y - 105, 4);
  }
  /* دو بازمانده در حالِ راه — مرکز قاب ثابت، جهان می‌لغزد */
  MG23.walk2(W * 0.46, GROUND_Y + 30, 3.3, t * 5.4, 1);
  /* گرد‌وغبار معلق — گرم‌تر */
  for (let i = 0; i < 14; i++) {
    const dx = (i * 137 + t * 9) % W, dy = 210 + (i * 53) % 240;
    ctx.fillStyle = 'rgba(255,215,160,0.16)';
    ctx.fillRect(dx, dy + Math.sin(t + i) * 6, 2.2, 2.2);
  }
  MG23.title(t, 'شهر سقوط کرد', 'چهل روز از اولین ویروس — و غروب دارد تمام می‌شود');
  MG23.lift(1);
  MG23.grain();
}

/* --- صحنه ۲: کوچه — (۲۴٫۰) ماهِ تابان + روشنایی مه‌آلود --- */
function introScStreetMG(t) {
  const k = clamp(t / 8, 0, 1);
  /* آسمان شبِ مه‌تابی — روشن‌تر */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#101833'); sky.addColorStop(1, '#232a4e');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* ماهِ درشت و تابان */
  const mx2 = W * 0.3, my2 = 96;
  const mgg = ctx.createRadialGradient(mx2, my2, 18, mx2, my2, 190);
  mgg.addColorStop(0, 'rgba(225,232,255,0.5)'); mgg.addColorStop(1, 'rgba(210,220,255,0)');
  ctx.fillStyle = mgg; circle(mx2, my2, 190);
  ctx.fillStyle = '#e8ecff'; circle(mx2, my2, 40);
  ctx.fillStyle = 'rgba(180,190,225,0.5)';
  circle(mx2 - 12, my2 - 8, 7); circle(mx2 + 14, my2 + 10, 5); circle(mx2 + 4, my2 - 16, 4);
  for (let i = 0; i < 30; i++) {
    const stx = (i * 157.1) % W, sty = (i * 83.3) % 170;
    ctx.fillStyle = 'rgba(220,228,255,' + (0.16 + 0.18 * Math.abs(Math.sin(t * 1.8 + i))).toFixed(2) + ')';
    ctx.fillRect(stx, sty, 1.5, 1.5);
  }
  /* دو ساختمانِ بلندِ دو طرف کوچه — پرسپکتیو (۲۴: روشن‌تر) */
  const persp = (side) => {
    const deep = side === 'r' ? 1 : 0;
    ctx.fillStyle = deep ? '#1b2344' : '#232b54';
    ctx.beginPath();
    const ix = W * 0.5 + (deep ? 60 : -60);      // نقطه‌ی گریز
    ctx.moveTo(side === 'r' ? W : 0, 0);
    ctx.lineTo(side === 'r' ? W : 0, GROUND_Y + 2);
    ctx.lineTo(ix, GROUND_Y + 2);
    ctx.lineTo(ix, GROUND_Y - 210);
    ctx.closePath(); ctx.fill();
    /* لبه‌ی نورِ ماه روی سرداُبنی */
    ctx.strokeStyle = 'rgba(200,215,255,0.30)'; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(side === 'r' ? W : 0, 0);
    ctx.lineTo(side === 'r' ? W : 0, GROUND_Y + 2);
    ctx.stroke();
    /* پنجره‌های کوچه — روشن‌تر */
    ctx.fillStyle = 'rgba(255,195,120,0.16)';
    for (let j = 0; j < 7; j++) {
      const f = j / 7;
      const wx = side === 'r' ? W - f * (W - ix) - 30 * (1 - f) : f * (ix) + 22 * (1 - f);
      const wy = 60 + j * 26;
      const wsc = 1 - f * 0.55;
      ctx.fillRect(wx, wy, 16 * wsc, 22 * wsc);
    }
  };
  persp('l'); persp('r');
  /* ته کوچه — نورِ سردِ روشن‌ترِ انتهای مسیر */
  const eg = ctx.createLinearGradient(W * 0.5 - 110, 0, W * 0.5 + 110, 0);
  eg.addColorStop(0, 'rgba(120,145,220,0)');
  eg.addColorStop(0.5, 'rgba(130,155,230,0.26)');
  eg.addColorStop(1, 'rgba(120,145,220,0)');
  ctx.fillStyle = eg; ctx.fillRect(W * 0.5 - 110, GROUND_Y - 230, 220, 232);
  /* زمین کوچه — با بازتابِ مهتاب */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#1e2440'); gr.addColorStop(1, '#12162a');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* سطل زباله/گاری واژگونه در پیش‌زمینه */
  ctx.fillStyle = '#1a2038';
  rr(W * 0.16, GROUND_Y - 22, 30, 22, 4); ctx.fill();
  ctx.beginPath(); ctx.ellipse(W * 0.78, GROUND_Y - 5, 26, 12, 0.2, 0, Math.PI * 2); ctx.fill();
  /* مه — روشن‌تر */
  MG23.fogBands(t, GROUND_Y - 36, 5, 9, 0.09, '140,160,215');
  /* زامبی‌ها از ته کوچه — با k نزدیک می‌شوند */
  MG23.bgZombies23(t, W * 0.5 + 190, GROUND_Y - 34, 4, 44, k, 1.5);
  /* دو بازمانده ایستاده — آرشان عقب‌تر */
  MG23.walk2(W * 0.38, GROUND_Y + 26, 2.05, t * 0.6, 0);
  /* پالسِ قرمزِ خطر در لبه‌ها — ملایم‌تر */
  const pr = 0.08 + 0.08 * Math.sin(t * 3.2);
  const vgL = ctx.createLinearGradient(0, 0, 130, 0);
  vgL.addColorStop(0, 'rgba(170,40,40,' + pr.toFixed(2) + ')'); vgL.addColorStop(1, 'rgba(170,40,40,0)');
  ctx.fillStyle = vgL; ctx.fillRect(0, 0, 130, H);
  const vgR = ctx.createLinearGradient(W - 130, 0, W, 0);
  vgR.addColorStop(0, 'rgba(170,40,40,0)'); vgR.addColorStop(1, 'rgba(170,40,40,' + pr.toFixed(2) + ')');
  ctx.fillStyle = vgR; ctx.fillRect(W - 130, 0, 130, H);
  MG23.lift(1.15);
  MG23.grain();
}

/* --- صحنه ۳: پیدا کردنِ ساختمانِ نیمه‌کاره — (۲۴٫۰) چراغ‌قوه‌ها + ماهِ تابان --- */
function introScFindMG(t) {
  /* شبِ مه‌آلود — روشن‌تر */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#0e1430'); sky.addColorStop(0.7, '#1a2138'); sky.addColorStop(1, '#2c2440');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* ماهِ درشت و تابان — قوی */
  const mx = W * 0.74, my = 100;
  const mg2 = ctx.createRadialGradient(mx, my, 20, mx, my, 210);
  mg2.addColorStop(0, 'rgba(228,232,255,0.55)'); mg2.addColorStop(0.4, 'rgba(215,222,255,0.22)'); mg2.addColorStop(1, 'rgba(210,218,255,0)');
  ctx.fillStyle = mg2; circle(mx, my, 210);
  ctx.fillStyle = '#eaeefc'; circle(mx, my, 44);
  ctx.fillStyle = 'rgba(175,185,225,0.5)';
  circle(mx - 14, my - 10, 8); circle(mx + 16, my + 12, 6); circle(mx + 6, my - 18, 5);
  ctx.fillStyle = 'rgba(20,24,44,0.4)';
  ctx.beginPath(); ctx.ellipse(mx + 34, my - 12, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
  /* افقِ شهری دور — روشن‌تر */
  MG23.cityLayer(GROUND_Y + 2, 40, 100, '#1c2547', -t * 4, 91, true);
  MG23.cityLayer(GROUND_Y + 2, 20, 55, '#131a34', -t * 8, 33, false);
  /* زمین — با بازتاب مهتاب */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#1e2136'); gr.addColorStop(1, '#131526');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* دوربین: زومِ آرام به ساختمان + پنِ نرم */
  const zk = 1 + clamp(t / 9, 0, 1) * 0.16;
  ctx.save();
  ctx.translate(W * 0.42, GROUND_Y + 6);
  ctx.scale(zk, zk);
  ctx.translate(-W * 0.42, -(GROUND_Y + 6));
  /* (۲۴٫۰) دو چراغ‌قوه به سمت بنا — لحظه‌ی «بررسی» دیده می‌شود */
  const fx1 = W * 0.24, fy1 = GROUND_Y + 2;
  for (const [bx, by, tx, ty] of [[fx1 + 6, fy1 - 26, W * 0.42 - 60, GROUND_Y - 150], [fx1 - 20, fy1 - 20, W * 0.42 - 10, GROUND_Y - 190]]) {
    const cone = ctx.createLinearGradient(bx, by, tx, ty);
    cone.addColorStop(0, 'rgba(255,235,180,0.34)');
    cone.addColorStop(1, 'rgba(255,235,180,0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(bx - 5, by); ctx.lineTo(bx + 5, by);
    ctx.lineTo(tx + 52, ty + 26); ctx.lineTo(tx - 52, ty - 26);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,244,200,0.95)';
  circle(fx1 + 6, fy1 - 26, 3); circle(fx1 - 20, fy1 - 20, 2.5);
  /* ساختمانِ «موجود» — found mode + روشنایی مهتاب */
  MG23.building23(W * 0.42, GROUND_Y + 6, 1.0, t, 'found', 1.25);
  /* دو بازمانده کوچک — نگاه به بالا */
  MG23.walk2(W * 0.24, GROUND_Y + 24, 1.5, t * 0.4, 0);
  ctx.restore();
  /* مه — روشن‌تر */
  MG23.fogBands(t, GROUND_Y - 30, 6, 7, 0.085, '140,160,215');
  /* نویسه‌ی بزرگِ برجسته در لحظه‌ی پیدا شدن */
  if (t > 1.2) {
    const a = clamp((t - 1.2) / 0.8, 0, 1) * (t < 7 ? 1 : clamp(1 - (t - 7) / 0.8, 0, 1));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '900 26px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffefc0';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 14;
    ctx.fillText('سه طبقه. نیمه‌کاره. هنوز سرپا.', W * 0.42, GROUND_Y - 228);
    ctx.restore();
  }
  MG23.lift(1.2);
  MG23.grain();
}

/* --- صحنه ۴: استحکام‌بخشی — (۲۴٫۰) چراغ کارِ گرم + غروبِ روشن‌تر --- */
function introScFortMG(t) {
  /* گرادیان غروب → شب: با t تیره می‌شود (۲۴: پایانِ تیره‌ترش هم روشن‌تر) */
  const k = clamp(t / 9, 0, 1);
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, lerpColor('#232b58', '#141b38', k));
  sky.addColorStop(0.6, lerpColor('#7a3a44', '#1e2742', k));
  sky.addColorStop(1, lerpColor('#c25a34', '#2c3050', k));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* ستاره‌ها که کم‌کم ظاهر می‌شوند — روشن‌تر */
  for (let i = 0; i < 30; i++) {
    const stx = (i * 149.9) % W, sty = (i * 71.3) % 190;
    ctx.fillStyle = 'rgba(220,228,255,' + (k * (0.16 + 0.20 * Math.abs(Math.sin(t * 1.5 + i)))).toFixed(2) + ')';
    ctx.fillRect(stx, sty, 1.5, 1.5);
  }
  /* افق — روشن‌تر */
  MG23.cityLayer(GROUND_Y + 2, 36, 92, '#1e2749', -t * 3, 55, k < 0.7);
  MG23.cityLayer(GROUND_Y + 2, 18, 50, '#141a34', -t * 6, 21, false);
  /* زمین — با گرمای چراغ کار */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, lerpColor('#3c2a34', '#1e2136', k));
  gr.addColorStop(1, lerpColor('#241824', '#141729', k));
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* (۲۴٫۰) چراغ کارِ ایستاده کنار نردبان — نور گرمِ صحنه‌ی کار */
  const lx0 = W * 0.5 - 108;
  ctx.strokeStyle = '#3a3040'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lx0, GROUND_Y + 4); ctx.lineTo(lx0, GROUND_Y - 44); ctx.lineTo(lx0 + 16, GROUND_Y - 40); ctx.stroke();
  const lampFlick = 0.9 + 0.1 * Math.sin(t * 11);
  const lampG = ctx.createRadialGradient(lx0 + 18, GROUND_Y - 44, 4, lx0 + 18, GROUND_Y - 44, 120);
  lampG.addColorStop(0, 'rgba(255,214,140,' + (0.55 * lampFlick) + ')');
  lampG.addColorStop(0.5, 'rgba(255,190,110,' + (0.22 * lampFlick) + ')');
  lampG.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = lampG; circle(lx0 + 18, GROUND_Y - 44, 120);
  ctx.fillStyle = 'rgba(255,240,200,' + (0.95 * lampFlick) + ')';
  ctx.beginPath();
  ctx.moveTo(lx0 + 8, GROUND_Y - 40); ctx.lineTo(lx0 + 28, GROUND_Y - 40);
  ctx.lineTo(lx0 + 24, GROUND_Y - 52); ctx.lineTo(lx0 + 12, GROUND_Y - 52);
  ctx.closePath(); ctx.fill();
  /* حوضه‌ی نور روی زمین */
  const pool = ctx.createRadialGradient(lx0 + 18, GROUND_Y + 8, 6, lx0 + 18, GROUND_Y + 8, 90);
  pool.addColorStop(0, 'rgba(255,200,120,0.16)'); pool.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(lx0 + 18, GROUND_Y + 8, 90, 26, 0, 0, Math.PI * 2); ctx.fill();
  /* ساختمانِ استحکام‌یافته — پنجره‌ی روشنِ پررنگ‌تر */
  MG23.building23(W * 0.5, GROUND_Y + 6, 1.06, t, 'fort', 1.35);
  /* نردبان + آرشان روی نردبان در حال تخته‌کوبی — چکش بالا/پایین */
  const hx = W * 0.5 + 88;
  ctx.strokeStyle = '#4a3c24'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hx, GROUND_Y + 4); ctx.lineTo(hx - 14, GROUND_Y - 92);
  ctx.moveTo(hx + 22, GROUND_Y + 4); ctx.lineTo(hx + 8, GROUND_Y - 92);
  for (let i = 0; i < 5; i++) {
    const yy = GROUND_Y - i * 18 - 8;
    ctx.moveTo(hx - 2 - i * 1.1, yy); ctx.lineTo(hx + 20 - i * 1.1, yy + 3);
  }
  ctx.stroke();
  /* سهند پایین — نگه‌دارنده‌ی تخته */
  MG23.walk2(hx - 42, GROUND_Y + 18, 1.35, t * 0.3, 0);
  /* آرشان روی نردبان: بالاتر از طبقه دوم؛ چکش می‌زند */
  const hammer = Math.abs(Math.sin(t * 4.2));
  ctx.save();
  ctx.translate(hx + 4, GROUND_Y - 88);
  ctx.fillStyle = '#1e2540';
  /* پاها روی پله */
  ctx.strokeStyle = '#1e2540'; ctx.lineWidth = 4.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -12); ctx.lineTo(-8, -3);
  ctx.moveTo(4, -12); ctx.lineTo(10, -3);
  ctx.stroke();
  rr(-7, -24, 14, 13, 5); ctx.fill();
  circle(1, -29, 5);
  ctx.fillStyle = '#8a2a34';
  ctx.beginPath(); ctx.arc(1, -29.6, 5.4, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(-4.4, -30.8, 10.8, 2.6);
  /* بازوی چکش */
  ctx.strokeStyle = '#1e2540'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(5, -22); ctx.lineTo(12, -28 - hammer * 8);
  ctx.stroke();
  ctx.strokeStyle = '#8a7a56'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(12, -28 - hammer * 8); ctx.lineTo(20, -32 - hammer * 8);
  ctx.stroke();
  ctx.fillStyle = '#5a5a6e';
  rr(19, -36 - hammer * 8, 7, 8, 2); ctx.fill();
  ctx.restore();
  /* ذراتِ کوچک در ضربِ چکش — پررنگ */
  if (hammer > 0.9) {
    ctx.fillStyle = 'rgba(255,222,150,0.7)';
    circle(hx + 26, GROUND_Y - 118, 2.6); circle(hx + 32, GROUND_Y - 112, 1.8); circle(hx + 22, GROUND_Y - 110, 1.4);
  }
  /* نور چکش‌کوبی — فلش‌های کوتاه پررنگ‌تر */
  const spark = (Math.sin(t * 4.2) > 0.96) ? 1 : 0;
  if (spark) {
    const sg = ctx.createRadialGradient(hx + 24, GROUND_Y - 116, 2, hx + 24, GROUND_Y - 116, 58);
    sg.addColorStop(0, 'rgba(255,230,160,0.6)'); sg.addColorStop(1, 'rgba(255,230,160,0)');
    ctx.fillStyle = sg; circle(hx + 24, GROUND_Y - 116, 58);
  }
  /* زامبی‌های دور در مه — در نیمه‌ی دوم ظاهر می‌شوند */
  if (k > 0.45) {
    ctx.save(); ctx.globalAlpha = clamp((k - 0.45) / 0.4, 0, 1);
    MG23.bgZombies23(t, W - 60, GROUND_Y - 20, 3, 40, 0.2, 0.9);
    MG23.bgZombies23(t, -20, GROUND_Y - 12, 3, 40, 0.2, 0.8);
    ctx.restore();
  }
  MG23.fogBands(t, GROUND_Y - 26, 6, 8, 0.07, '140,160,215');
  MG23.title(t, 'پناهگاه آماده شد', 'طبقه اول دفاع · طبقه دوم وسایل · طبقه سوم دیده‌بانی');
  MG23.lift(1.35);
  MG23.grain();
}

/* ابزار کمکی: میان‌یابی رنگ hex */
function lerpColor(c1, c2, k) {
  const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const a = p(c1), b = p(c2);
  const r = Math.round(a[0] + (b[0] - a[0]) * k);
  const g = Math.round(a[1] + (b[1] - a[1]) * k);
  const bl = Math.round(a[2] + (b[2] - a[2]) * k);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}
