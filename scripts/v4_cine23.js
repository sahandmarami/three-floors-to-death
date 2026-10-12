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
    ctx.fillRect(0, H * 0.16 - 40 * Math.max(1, window.__uiz || 1), W, 92 * Math.max(1, window.__uiz || 1));
    ctx.font = '900 ' + Math.round(34 * Math.max(1, window.__uiz || 1)) + 'px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 10;
    ctx.fillText(main, W / 2, H * 0.16);
    if (sub) {
      ctx.font = 'bold ' + Math.round(16 * Math.max(1, window.__uiz || 1)) + 'px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle = '#cfd9f2';
      ctx.shadowBlur = 6;
      ctx.fillText(sub, W / 2, H * 0.16 + 30 * Math.max(1, window.__uiz || 1));
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

  /* افق شهری پارالاکس — (۲۶٫۰) بازسازی: پنجره‌های شبکه‌ای + آبانوار/آنتن/
     یخچال پشت‌بام + کورنیس سقف — دیگر مستطیل‌های خالی نیست */
  cityLayer(yBase, hMin, hMax, col, drift, seed, windowGlow) {
    let s = seed;
    const rd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    let x = -60 + drift % 90;
    let guard = 0;
    while (x < W + 60 && guard++ < 70) {
      const bw = 50 + rd() * 74;
      const bh = hMin + rd() * hMax;
      const top = yBase - bh;
      /* بدنه + کمی روشنیِ لبه */
      ctx.fillStyle = col;
      ctx.fillRect(x, top, bw, bh + 4);
      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      ctx.fillRect(x, top, 3.5, bh + 4);
      /* کورنیس سقف */
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.fillRect(x - 2, top, bw + 4, 3);
      /* پشت‌بام: آبانوار / آنتن / یخچال هوا */
      ctx.fillStyle = col;
      if (rd() < 0.3) { ctx.fillRect(x + bw * 0.18, top - 8, 13, 8); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x + bw * 0.18, top - 8, 13, 2.4); }
      ctx.fillStyle = col;
      if (rd() < 0.42) { ctx.fillRect(x + bw * 0.55, top - 12, 2.6, 12); ctx.fillRect(x + bw * 0.55 - 2, top - 12, 6.6, 2.2); }
      if (rd() < 0.24) ctx.fillRect(x + bw * 0.78, top - 6, 9, 6);
      /* شبکه‌ی پنجره‌ها — تیره با چند روشنِ گرم */
      const cols2 = Math.max(2, Math.floor(bw / 15));
      const rows2 = Math.max(2, Math.floor(bh / 17));
      for (let cx2 = 0; cx2 < cols2; cx2++) {
        for (let cy2 = 0; cy2 < rows2; cy2++) {
          const wx = x + 6 + cx2 * ((bw - 10) / cols2);
          const wy = top + 7 + cy2 * ((bh - 12) / rows2);
          const lit = windowGlow && rd() < 0.085;
          if (lit) {
            ctx.fillStyle = 'rgba(255,186,105,' + (0.5 + rd() * 0.3) + ')';
            ctx.fillRect(wx, wy, 4.6, 6.4);
          } else {
            ctx.fillStyle = 'rgba(0,0,0,0.30)';
            ctx.fillRect(wx, wy, 4.6, 6.4);
          }
        }
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

  /* ساختمانِ «موجودِ» نیمه‌کاره — (۲۶٫۰) بازسازی کامل برای «همان بودن»
     با برجِ داخل بازی: طبقات مخروطی (پهن → باریک)، رنگ‌های فصل ۱
     (سنگ شنی / آجر سرخ / آبی)، بافت بلوک، کورنیس‌ها، درِ قوس‌دار،
     بنر نشان طلایی، میله پرچم و کنگره‌ی بام — در found خراب و
     نیمه‌کاره، در fort استحکام‌یافته با تخته و پرچم.
     حالت‌ها: found = پیدا شدن (خرابه) | fort = استحکام‌یافته */
  building23(x, y, s, t, mode, duskK) {
    const fh = 62;
    const FW = [158, 144, 130];                     /* پهنای طبقات: مخروطی مثل برج بازی */
    /* پالت فصل ۱ داخل بازی — با تیرگی شب مه‌آلود */
    const DK = 0.52;                                /* ضریب شب‌شدگی رنگ بدنه */
    const FL = [
      { l: lerpColor('#82705a', '#1c2036', DK), b: lerpColor('#6e5a44', '#181c30', DK), d: lerpColor('#4d3f2f', '#12162a', DK), e: lerpColor('#453a2c', '#101426', DK) },
      { l: lerpColor('#b25a47', '#232640', DK), b: lerpColor('#a04b3a', '#1f2238', DK), d: lerpColor('#7c3527', '#161a2c', DK), e: lerpColor('#6e2f24', '#141828', DK) },
      { l: lerpColor('#4f83b5', '#202a48', DK), b: lerpColor('#41729f', '#1c2640', DK), d: lerpColor('#2f557c', '#161e34', DK), e: lerpColor('#2a4b6b', '#141c30', DK) },
    ];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const H3 = fh * 3;

    /* --- سایه روی زمین --- */
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.moveTo(-FW[0] / 2, 3); ctx.lineTo(FW[0] / 2, 3);
    ctx.lineTo(FW[0] / 2 - 92, 26); ctx.lineTo(-FW[0] / 2 - 118, 26);
    ctx.closePath(); ctx.fill();

    /* --- سکوی سنگی پایه (پلینث) مثل برج بازی --- */
    ctx.fillStyle = lerpColor('#3f362b', '#141828', DK);
    rr(-FW[0] / 2 - 9, -6, FW[0] + 18, 14, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(-FW[0] / 2 - 9, -6, FW[0] + 18, 2);

    /* --- آوار و خرده‌سنگ کنار پایه (حالت found) --- */
    if (mode === 'found') {
      ctx.fillStyle = lerpColor('#5d4c39', '#20243a', DK);
      ctx.beginPath();
      ctx.moveTo(-FW[0] / 2 - 30, 2); ctx.lineTo(-FW[0] / 2 - 12, -13); ctx.lineTo(-FW[0] / 2 - 4, -6);
      ctx.lineTo(-FW[0] / 2 + 8, -17); ctx.lineTo(-FW[0] / 2 + 18, -5); ctx.lineTo(-FW[0] / 2 + 2, 2);
      ctx.closePath(); ctx.fill();
      ctx.fillRect(FW[0] / 2 + 10, -8, 13, 7); ctx.fillRect(FW[0] / 2 + 20, -4, 8, 4);
    }

    /* --- طبقات از پایین به بالا --- */
    for (let i = 0; i < 3; i++) {
      const hw = FW[i] / 2;
      const yT = -fh * (i + 1) - 6, yB = -fh * i - 6;
      const F = FL[i];
      const g = ctx.createLinearGradient(-hw, 0, hw, 0);
      g.addColorStop(0, F.l); g.addColorStop(0.55, F.b); g.addColorStop(1, F.d);
      ctx.fillStyle = g;
      ctx.fillRect(-hw, yT, hw * 2, fh);
      ctx.strokeStyle = F.e; ctx.lineWidth = 2;
      ctx.strokeRect(-hw + 1, yT + 1, hw * 2 - 2, fh - 2);
      /* بافت بلوک‌های سنگی/آجری — مثل برج بازی */
      ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
      const rows = i === 1 ? 5 : 4;
      const bw2 = i === 1 ? 15 : 20;
      ctx.beginPath();
      for (let r2 = 0; r2 < rows; r2++) {
        const yy = yT + (r2 + 1) * fh / rows;
        if (r2 < rows - 1) { ctx.moveTo(-hw + 3, yy); ctx.lineTo(hw - 3, yy); }
        const off = (r2 % 2) * (bw2 / 2);
        for (let xx = -hw + off + bw2; xx < hw - 4; xx += bw2) {
          ctx.moveTo(xx, yy - fh / rows + 2); ctx.lineTo(xx, yy - 1);
        }
      }
      ctx.stroke();
      /* سایه‌ی جداکننده‌ی طبقه‌ها */
      ctx.fillStyle = 'rgba(0,0,0,0.30)';
      ctx.fillRect(-hw, yB - 4, hw * 2, 4);
      /* کورنیس برآمده بالای طبقه‌های ۱ و ۲ */
      if (i < 2) {
        ctx.fillStyle = F.e;
        ctx.fillRect(-hw - 4, yT - 5, hw * 2 + 8, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(-hw - 4, yT - 5, hw * 2 + 8, 1.6);
      }
      /* لبه‌ی مهتاب سمت چپ */
      ctx.strokeStyle = 'rgba(205,218,255,0.22)'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(-hw, yT); ctx.lineTo(-hw, yB); ctx.stroke();
    }

    /* --- طبقه‌ی سومِ نیمه‌کاره در found: میل‌گرد + بام ناقص --- */
    if (mode === 'found') {
      ctx.strokeStyle = lerpColor('#2a3158', '#39405e', 0.3); ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const rx = -FW[2] / 2 + 14 + i * 13;
        ctx.moveTo(rx, -H3 - 6 + 2); ctx.lineTo(rx + 2, -H3 - 6 - 14 - (i % 3) * 5);
      }
      ctx.stroke();
      ctx.fillStyle = FL[2].e;
      ctx.fillRect(-FW[2] / 2 - 6, -H3 - 6 - 9, FW[2] * 0.66, 10);
    }

    /* --- کنگره‌ی بام (fort کامل / found ناقص) --- */
    const topW = FW[2] / 2;
    ctx.fillStyle = FL[2].e;
    ctx.fillRect(-topW - 6, -H3 - 6 - 7, topW * 2 + 12, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(-topW - 6, -H3 - 6 - 7, topW * 2 + 12, 1.6);
    const nB = mode === 'fort' ? 6 : 4;
    for (let k = 0; k < nB; k++) {
      const bx = -topW + 3 + k * ((topW * 2 - 8) / Math.max(1, nB - 1));
      ctx.fillStyle = FL[2].e;
      ctx.fillRect(bx - 6, -H3 - 6 - 13, 12, 7);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(bx + 4.6, -H3 - 6 - 13, 2.4, 7);
    }
    if (mode === 'found') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(topW - 26, -H3 - 6 - 13, 12, 6);
      ctx.fillRect(-topW + 14, -H3 - 6 - 13, 12, 5);
    }

    /* --- میله‌ی پرچم + گوی (پرچم فقط در fort — «پناهگاه شد») --- */
    ctx.fillStyle = lerpColor('#4a3b2a', '#20243a', DK);
    ctx.fillRect(-1.6, -H3 - 6 - 40, 3.2, 40);
    ctx.fillStyle = '#f7c948';
    circle(0, -H3 - 6 - 41, 2.6);
    if (mode === 'fort') {
      const wv = Math.sin(t * 3.2) * 3.5;
      ctx.fillStyle = '#c23a2c';
      ctx.beginPath();
      ctx.moveTo(1.4, -H3 - 6 - 38);
      ctx.quadraticCurveTo(16, -H3 - 6 - 36 + wv * 0.4, 30, -H3 - 6 - 33 + wv);
      ctx.lineTo(30, -H3 - 6 - 21 + wv);
      ctx.quadraticCurveTo(16, -H3 - 6 - 23 + wv * 0.4, 1.4, -H3 - 6 - 21);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7c948';
      circle(14, -H3 - 6 - 27 + wv * 0.5, 3);
    } else {
      ctx.strokeStyle = lerpColor('#4a3b2a', '#20243a', DK); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -H3 - 6 - 40); ctx.lineTo(6, -H3 - 6 - 44); ctx.stroke();
    }

    /* --- پنجره‌ها — شبکه‌ی برج بازی: ۲ در هر طبقه --- */
    const win23 = (wx, wy, ww, wh, state23) => {
      ctx.fillStyle = '#0a0e1c';
      rr(wx, wy, ww, wh, 2.5); ctx.fill();
      ctx.strokeStyle = FL.e; ctx.lineWidth = 1.4;
      rr(wx, wy, ww, wh, 2.5); ctx.stroke();
      if (state23 === 'broken') {
        ctx.strokeStyle = 'rgba(170,195,240,0.6)'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(wx + 3, wy + 5); ctx.lineTo(wx + ww * 0.45, wy + wh * 0.5); ctx.lineTo(wx + 5, wy + wh - 4);
        ctx.moveTo(wx + ww - 4, wy + 4); ctx.lineTo(wx + ww * 0.55, wy + wh * 0.4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,255,0.10)';
        rr(wx, wy, ww, wh, 2.5); ctx.fill();
      } else if (state23 === 'board') {
        ctx.strokeStyle = lerpColor('#5c4722', '#8a6a34', 0.35); ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(wx - 3, wy + 5); ctx.lineTo(wx + ww + 3, wy + 9);
        ctx.moveTo(wx - 3, wy + wh - 8); ctx.lineTo(wx + ww + 3, wy + wh - 12);
        ctx.stroke();
        ctx.fillStyle = 'rgba(220,220,230,0.5)';
        ctx.fillRect(wx + 4, wy + 7, 1.6, 1.6); ctx.fillRect(wx + ww - 6, wy + wh - 10, 1.6, 1.6);
      } else if (state23 === 'lit') {
        const wm = 0.8 + 0.2 * Math.sin(t * 2.2) * Math.sin(t * 0.8);
        const g2 = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        g2.addColorStop(0, 'rgba(255,198,112,' + (0.9 * wm * duskK) + ')');
        g2.addColorStop(1, 'rgba(220,130,60,' + (0.62 * wm * duskK) + ')');
        ctx.fillStyle = g2;
        rr(wx, wy, ww, wh, 2.5); ctx.fill();
        ctx.strokeStyle = 'rgba(18,14,8,0.85)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
        ctx.stroke();
        const hg = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 3, wx + ww / 2, wy + wh / 2, 54);
        hg.addColorStop(0, 'rgba(255,170,80,' + (0.17 * wm * duskK) + ')');
        hg.addColorStop(1, 'rgba(255,170,80,0)');
        ctx.fillStyle = hg; circle(wx + ww / 2, wy + wh / 2, 54);
      }
    };
    if (mode === 'found') {
      win23(-FW[0] / 2 + 16, -fh - 6 + 12, 28, 34, 'broken');
      win23(FW[0] / 2 - 44, -fh - 6 + 12, 28, 34, 'dark');
      win23(-FW[1] / 2 + 16, -fh * 2 - 6 + 12, 28, 34, 'broken');
      win23(FW[1] / 2 - 44, -fh * 2 - 6 + 12, 28, 34, 'broken');
      win23(-FW[2] / 2 + 16, -fh * 3 - 6 + 12, 28, 34, 'broken');
      win23(FW[2] / 2 - 44, -fh * 3 - 6 + 12, 28, 34, 'dark');
      /* ترک‌های دیوار */
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-FW[0] / 2 + 30, -fh - 6 + 8);
      ctx.lineTo(-FW[0] / 2 + 38, -fh - 6 + 34);
      ctx.lineTo(-FW[0] / 2 + 33, -fh - 6 + 56);
      ctx.moveTo(FW[0] / 2 - 40, -fh * 2 - 6 + 6);
      ctx.lineTo(FW[0] / 2 - 33, -fh * 2 - 6 + 30);
      ctx.stroke();
      /* دیوارنگاره‌ی مبهم — «زنده بمان» */
      ctx.fillStyle = 'rgba(232,84,64,0.5)';
      ctx.font = 'bold 15px Vazirmatn, Tahoma';
      ctx.textAlign = 'center';
      ctx.fillText('زنده بمان', 0, -fh * 2 - 20);
    } else {
      /* fort: طبقه بالا روشن (دیده‌بانی)، بقیه تخته‌کوبی */
      win23(-FW[2] / 2 + 16, -fh * 3 - 6 + 12, 28, 34, 'lit');
      win23(FW[2] / 2 - 44, -fh * 3 - 6 + 12, 28, 34, 'dark');
      win23(-FW[1] / 2 + 16, -fh * 2 - 6 + 12, 28, 34, 'board');
      win23(FW[1] / 2 - 44, -fh * 2 - 6 + 12, 28, 34, 'board');
      win23(-FW[0] / 2 + 16, -fh - 6 + 12, 28, 34, 'board');
      win23(FW[0] / 2 - 44, -fh - 6 + 12, 28, 34, 'board');
    }

    /* --- درِ قوس‌دار: found = شکسته/تاریک · fort = ورق فلزی --- */
    if (mode === 'found') {
      ctx.fillStyle = '#0e1424';
      ctx.beginPath();
      ctx.moveTo(-17, -2); ctx.lineTo(-17, -40);
      ctx.quadraticCurveTo(0, -52, 17, -40); ctx.lineTo(17, -2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = FL[0].e; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-21, -2); ctx.lineTo(-21, -40);
      ctx.quadraticCurveTo(0, -54, 21, -40); ctx.lineTo(21, -2);
      ctx.stroke();
      /* درِ یک‌طرفه آویزان */
      ctx.fillStyle = lerpColor('#241a12', '#1a1a2e', 0.4);
      ctx.save(); ctx.translate(-8, -2); ctx.rotate(-0.18);
      ctx.fillRect(0, -36, 15, 36); ctx.restore();
    } else {
      ctx.fillStyle = '#101828';
      ctx.beginPath();
      ctx.moveTo(-17, -2); ctx.lineTo(-17, -40);
      ctx.quadraticCurveTo(0, -52, 17, -40); ctx.lineTo(17, -2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = lerpColor('#323846', '#4a5262', 0.3);
      ctx.beginPath();
      ctx.moveTo(-14, -2); ctx.lineTo(-14, -38);
      ctx.quadraticCurveTo(0, -48, 14, -38); ctx.lineTo(14, -2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#10182a'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) { ctx.moveTo(-14, -34 + i * 11); ctx.lineTo(14, -34 + i * 11); }
      ctx.stroke();
      ctx.strokeStyle = FL[0].e; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-21, -2); ctx.lineTo(-21, -40);
      ctx.quadraticCurveTo(0, -54, 21, -40); ctx.lineTo(21, -2);
      ctx.stroke();
      const dg = ctx.createRadialGradient(0, -20, 3, 0, -20, 52);
      dg.addColorStop(0, 'rgba(255,190,100,' + (0.24 * duskK) + ')');
      dg.addColorStop(1, 'rgba(255,190,100,0)');
      ctx.fillStyle = dg; circle(0, -20, 52);
    }

    /* --- بنرِ دیواری طبقه‌ی دوم با نشان طلایی (مثل برج بازی) --- */
    {
      const by = -fh * 2 - 6 + 18;
      ctx.fillStyle = mode === 'fort' ? '#a12a20' : lerpColor('#a12a20', '#3a1e2e', 0.55);
      ctx.beginPath();
      ctx.moveTo(34, by);
      ctx.lineTo(56, by);
      ctx.lineTo(56, by + 24);
      ctx.lineTo(45, by + 31);
      ctx.lineTo(34, by + 24);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#f7c948';
      circle(45, by + 11, 4);
      ctx.fillStyle = mode === 'fort' ? '#7a1f18' : '#5a2a2a';
      circle(45, by + 11, 1.7);
      if (mode === 'found') {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(38, by + 4); ctx.lineTo(42, by + 14); ctx.lineTo(39, by + 22); ctx.stroke();
      }
    }
    ctx.restore();
  },

  /* زامبی‌های پس‌زمینه — (۲۶٫۰) بازطراحی کامل: به‌جای آدمکِ خطی،
     سایه‌واره‌های خمیده با بدنه‌ی پُر، دست‌های آویزانِ لگن‌دار،
     سرِ کج و چشم‌های سرخِ تابان، دامنِ پاره و راه‌رفتنِ لکنت‌دار. */
  bgZombies23(t, x0, y, n, spread, k, scale) {
    for (let i = 0; i < n; i++) {
      const ph = t * 1.7 + i * 2.3;
      const zx = x0 + i * spread - k * (40 + i * 22);
      const zz = 0.55 + (i % 3) * 0.28;
      const zs = scale * zz;
      const lurch = Math.sin(ph) * 0.09;
      const bob = Math.abs(Math.sin(ph)) * 2.2;
      const sway = Math.sin(ph * 0.5) * 3.5;
      ctx.save();
      ctx.translate(zx + sway, y + (1 - zz) * 8 - bob);
      ctx.scale(zs, zs);
      ctx.rotate(lurch);
      /* سایه روی زمین */
      ctx.fillStyle = 'rgba(0,0,0,0.34)';
      ctx.beginPath(); ctx.ellipse(0, 2, 13, 3.4, 0, 0, Math.PI * 2); ctx.fill();
      /* دود پای پا */
      ctx.fillStyle = 'rgba(150,165,210,0.10)';
      ctx.beginPath(); ctx.ellipse(-4 - Math.sin(ph) * 3, 1, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
      const BODY = 'rgba(16,20,36,0.97)';
      /* پاها: گام‌های لرزان */
      ctx.strokeStyle = BODY; ctx.lineWidth = 5.2; ctx.lineCap = 'round';
      ctx.beginPath();
      const st1 = Math.sin(ph), st2 = Math.sin(ph + Math.PI);
      ctx.moveTo(-1, -13); ctx.lineTo(-2 + st1 * 5.5, -1);
      ctx.moveTo(2.5, -13); ctx.lineTo(3.5 + st2 * 5.5, -1);
      ctx.stroke();
      /* بدنه‌ی خمیده: پُکِ پشت + شکم */
      ctx.fillStyle = BODY;
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.quadraticCurveTo(-10.5, -22, -6, -27.5);
      ctx.quadraticCurveTo(-2, -32, 3.5, -30);
      ctx.quadraticCurveTo(9, -28, 8.5, -22);
      ctx.quadraticCurveTo(8, -16, 5, -13);
      ctx.lineTo(-8, -13);
      ctx.closePath(); ctx.fill();
      /* دامنِ پاره — دندانه‌ای */
      ctx.beginPath();
      ctx.moveTo(-8, -13);
      ctx.lineTo(-5.5, -10.5); ctx.lineTo(-3, -13.5); ctx.lineTo(0, -10.8);
      ctx.lineTo(2.6, -13.6); ctx.lineTo(5, -11); ctx.lineTo(5, -13);
      ctx.closePath(); ctx.fill();
      /* دست‌های آویزانِ بی‌جان */
      ctx.strokeStyle = BODY; ctx.lineWidth = 4.6;
      ctx.beginPath();
      const aSw = Math.sin(ph + 1.1) * 4;
      ctx.moveTo(2.5, -28); ctx.quadraticCurveTo(9 + aSw, -22, 10.5 + aSw, -12.5);
      ctx.moveTo(-1.5, -29); ctx.quadraticCurveTo(-9 - aSw * 0.7, -22, -10 - aSw * 0.7, -13);
      ctx.stroke();
      /* سر: کج + فک آویزان */
      ctx.save();
      ctx.translate(5.2, -33.4); ctx.rotate(0.32 + Math.sin(ph * 0.7) * 0.06);
      ctx.fillStyle = BODY;
      ctx.beginPath();
      ctx.moveTo(-4.4, 3);
      ctx.quadraticCurveTo(-5.2, -2.4, -1.5, -4.6);
      ctx.quadraticCurveTo(2.6, -6.2, 5, -3.4);
      ctx.quadraticCurveTo(6.6, -0.6, 5.2, 2.2);
      ctx.quadraticCurveTo(3.6, 4.6, 1.2, 4.2);
      ctx.quadraticCurveTo(-2, 5.4, -4.4, 3);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,20,16,0.55)';
      ctx.beginPath(); ctx.ellipse(2.2, 2.4, 2.6, 1.7, 0.25, 0, Math.PI * 2); ctx.fill();
      const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.2 + i * 1.7));
      ctx.shadowColor = 'rgba(255,52,36,0.9)'; ctx.shadowBlur = 7 * er;
      ctx.fillStyle = 'rgba(255,84,56,' + Math.min(1, er + 0.3) + ')';
      circle(0.2, -1.6, 1.55); circle(3.8, -1.2, 1.4);
      ctx.shadowBlur = 0;
      ctx.restore();
      /* لبه‌ی مهتاب — جدا شدن از پس‌زمینه */
      ctx.strokeStyle = 'rgba(200,215,255,0.13)'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-6, -26); ctx.quadraticCurveTo(-11, -22, -9.5, -15);
      ctx.stroke();
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
  }
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
  }
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
    ctx.font = '900 26px Vazirmatn, Tahoma, sans-serif';
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
  /* (۲۶٫۰) زمینِ کارگاه: تخته‌های خوابیده + جعبه‌ابزار قرمز + ارابه‌کوهی */
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
