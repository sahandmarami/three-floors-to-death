/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۹٫۰ — بخش ۱۲: مینی‌گیم‌های سواره (قایق/اسنوموبیل)
   ==================================================================
   (۱۹٫۰ — بازخورد کاربر: «مینی‌گیم‌ها همش چرته؛ مثل مینی‌گیم اول بکنشون
   ولی با حال‌وهوای دیگه»)
   دو مینی‌گیم تازه با همان موتور شبه‌سه‌بعدیِ رانندگی (v4_drive) اما
   با حال‌وهوای کاملاً متفاوت — به‌جای تونل تاریک و زیپ‌لاین:
     • فصل ۲→۳ «مهِ رودخانه»: قایق موتوری در کانال مه‌گرفته‌ی انبارها،
       شبِ فیروزه‌ای، آب موج‌دار با انعکاس ماه، اسکله‌ها و جرثقیل‌های
       دوردست، موانع شناور (بشکه/تنه‌درخت/زامبی شناگر)، ارشان با فانوس
       روی عقب قایق، مقصد = دروازه‌ی پاسگاه نظامی از دل مه
     • فصل ۳→۴ «توفان برفی»: اسنوموبیل روی شیب برفی، جهانِ سفید-آبی،
       تندبرف + رگبار باد (کاهش دید دوره‌ای)، درخت‌های کاج یخ‌زده،
       موانع (صخره‌ی یخ/کاج افتاده/زامبی یخ‌زده)، چراغ‌گردباد،
       مقصد = دکل مخابراتی با چراغ قرمز چشمک‌زن
   کنترل مثل رانندگی: ←/→ (یا A/D یا لمسِ یک‌سوم چپ/راست یا کج‌کردن
   گوشی) = فرمان • ↑/Space/W = گاز • ↓/S یا لمس وسط = ترمز
   ================================================================== */

/* ---- ۱۲-۱) جدول موانع هر تم ---- */
const RIVER_OBSTACLES = [
  { t: 'zSwim',   hw: 130, soft: true  },   // زامبی شناگر — له می‌شود (سبک)
  { t: 'zSwim',   hw: 130, soft: true  },
  { t: 'zTank',   hw: 175, soft: true  },   // تانکِ شناور — لای لجن
  { t: 'log',     hw: 260, soft: false },   // تنه‌ی درخت شناور — تصادف سنگین
  { t: 'barrelF', hw: 150, soft: false },   // بشکه‌ی سرگردان
  { t: 'buoy',    hw: 120, soft: false },   // بووی قرمز ناوبری
];
const SNOW_OBSTACLES = [
  { t: 'zFrozen', hw: 140, soft: true  },   // زامبی یخ‌زده — تکه می‌شود
  { t: 'zSnow',   hw: 108, soft: true  },   // زامبی سریعِ برفی
  { t: 'zFrozen', hw: 140, soft: true  },
  { t: 'iceRock', hw: 225, soft: false },   // صخره‌ی یخی
  { t: 'pineDown',hw: 300, soft: false },   // کاج افتاده — پهن
  { t: 'drift',   hw: 185, soft: true  },   // تل برف — فقط کند می‌کند
];
/* استخر موانعِ تم فعال */
function rideObsPool() {
  const th = DRV.theme || 'road';
  return th === 'river' ? RIVER_OBSTACLES : (th === 'snow' ? SNOW_OBSTACLES : DRV_OBSTACLES);
}

/* ---- ۱۲-۲) رسم مشترک موانع/آیتم مخفی (هر سه تم رانندگی-گونه) ---- */
/* موانع: دور → نزدیک با فِید مه — رسم به تفکیک تم */
function drvDrawObstacles() {
  const D = DRV;
  const vis = [];
  for (const o of D.obs) {
    if (o.hit) continue;
    const z = o.k * DRV.SEG - D.T;
    if (z > 60 && z < 6400) vis.push({ o, z });
  }
  vis.sort((a, b) => b.z - a.z);
  for (let i = 0; i < vis.length; i++) {
    const { o, z } = vis[i];
    if (DRV.theme === 'river') drawRiverObs(o, z);
    else if (DRV.theme === 'snow') drawSnowObs(o, z);
    else drawDriveObs(o, z);
  }
}

/* آیتم مخفی: ستون نور + جعبه‌ی درخشان (همان پاداش فرمان دقیق) */
function drvDrawHidden() {
  const D = DRV, HI = D.hidden;
  if (!HI || HI.got) return;
  const z = HI.T - D.T;
  if (z <= 60 || z >= 20000) return;
  const wx = roadCXf(HI.T) + HI.lane * 880;
  const sx = drvX(wx, Math.max(60, z)), sy = drvY(Math.max(60, z));
  const ppu = drvPPU(Math.max(60, z));
  const col = ((GEAR[HI.id] || RARE[HI.id]) || {}).color || '#ffd873';
  const bw = Math.max(3, 90 * ppu);
  const bg = ctx.createLinearGradient(0, sy, 0, DRV.HOR);
  bg.addColorStop(0, hexA(col, 0.5)); bg.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = bg;
  ctx.fillRect(sx - bw / 2, DRV.HOR + 2, bw, Math.max(4, sy - DRV.HOR));
  if (z < 5200) {
    const s = Math.max(0.5, ppu);
    ctx.save();
    ctx.translate(sx, sy - Math.sin(animTime * 2.6) * 6 * s * 40);
    ctx.scale(s * 40, s * 40);
    ctx.fillStyle = '#2c3440'; rr(-0.55, -0.5, 1.1, 1, 0.15); ctx.fill();
    ctx.fillStyle = col; rr(-0.4, -0.35, 0.8, 0.7, 0.1); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; circle(-0.15, -0.15, 0.1);
    ctx.restore();
  }
}

/* نور چراغ‌گردباد جلو (قایق/اسنوموبیل) — مخروط روی مسیر */
function drvDrawHeadlight(col) {
  const zEnd = 2400;
  const cxE = drvX(roadCXf(DRV.T + zEnd), zEnd), wE = drvRW(zEnd) * 0.55;
  const cx0 = 480, w0 = 250;
  for (const dx of [-0.36, 0.36]) {
    ctx.fillStyle = col || 'rgba(255,238,170,0.09)';
    ctx.beginPath();
    ctx.moveTo(cx0 + dx * w0 - 60, 556); ctx.lineTo(cx0 + dx * w0 + 60, 556);
    ctx.lineTo(cxE + dx * wE + Math.max(4, wE * 0.3), drvY(zEnd));
    ctx.lineTo(cxE + dx * wE - Math.max(4, wE * 0.3), drvY(zEnd));
    ctx.closePath(); ctx.fill();
  }
}

/* خطوط سرعت در سرعت بالا */
function drvDrawSpeedLines(col) {
  if (DRV.speed <= 2750 || TR.phase === 3) return;
  ctx.strokeStyle = col || 'rgba(200,214,240,0.16)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const yy = 300 + ((animTime * 900 + i * 97) % 240);
    const xx = (i % 2 === 0) ? 60 + i * 9 : W - 60 - i * 9;
    ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + (xx < W / 2 ? -26 : 26), yy + 34); ctx.stroke();
  }
}

/* ==================================================================
   ---- ۱۲-۳) تم رودخانه: مهِ کانال انبارها (فصل ۲→۳) ----
   ================================================================== */
/* ستاره‌های ثابت شب رودخانه */
const RIVE_STARS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 211.7) % W, y: 16 + ((i * 97.3) % 120), r: 0.6 + ((i * 37) % 9) / 11,
}));

function renderRiver() {
  const D = DRV;
  const t3 = TR.phase === 3;

  /* --- آسمان شب فیروزه‌ای + ماه + ابر مه --- */
  const g = ctx.createLinearGradient(0, -20, 0, DRV.HOR + 30);
  g.addColorStop(0, '#030a12'); g.addColorStop(0.55, '#07202b'); g.addColorStop(1, '#0f3844');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, DRV.HOR + 50);
  for (const s of RIVE_STARS) {
    const tw = 0.5 + 0.5 * Math.sin(animTime * 1.9 + s.x * 0.7);
    ctx.fillStyle = 'rgba(214,236,242,' + (0.25 + 0.4 * tw).toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  /* ماهِ کم‌جو در مه */
  ctx.fillStyle = 'rgba(226,238,240,0.9)'; circle(770, 58, 17);
  ctx.fillStyle = 'rgba(160,190,196,0.25)'; circle(762, 52, 4); circle(776, 63, 3);
  const mg = ctx.createRadialGradient(770, 58, 6, 770, 58, 78);
  mg.addColorStop(0, 'rgba(190,230,238,0.22)'); mg.addColorStop(1, 'rgba(190,230,238,0)');
  ctx.fillStyle = mg; circle(770, 58, 78);

  /* --- افق انبارها: سایه‌نما + جرثقیل و دودکش (پارالاکس کند) --- */
  const off = D.T * 0.0013, m = W + 80;
  ctx.fillStyle = '#061520';
  for (const b of SKYLINE) {
    const sx = (((b.x - off) % m) + m) % m - 40;
    ctx.fillRect(sx, DRV.HOR - 3 - b.h * 0.34, b.w, b.h * 0.34 + 5);
  }
  /* جرثقیل‌های بندر — بازوی دراز روی افق */
  ctx.strokeStyle = '#0a1c26'; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const bx = (((i * 317 - off * 1.6) % m) + m) % m - 60;
    ctx.beginPath();
    ctx.moveTo(bx, DRV.HOR - 2); ctx.lineTo(bx, DRV.HOR - 46);
    ctx.lineTo(bx + 44, DRV.HOR - 40); ctx.lineTo(bx + 56, DRV.HOR - 26);
    ctx.moveTo(bx + 44, DRV.HOR - 40); ctx.lineTo(bx + 40, DRV.HOR - 14);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,170,80,0.5)'; circle(bx, DRV.HOR - 48, 2);
  }
  /* مهِ غلیظ روی مرز آب و آسمان */
  const fogA = t3 ? 0.6 + 0.4 * clamp(TR.t / 2.6, 0, 1) : 0.5;
  const fg = ctx.createLinearGradient(0, DRV.HOR - 30, 0, DRV.HOR + 96);
  fg.addColorStop(0, 'rgba(126,158,164,' + fogA.toFixed(2) + ')');
  fg.addColorStop(1, 'rgba(126,158,164,0)');
  ctx.fillStyle = fg; ctx.fillRect(-20, DRV.HOR - 30, W + 40, 128);

  /* --- بدنه‌ی آب: تیره با موج (به‌جای زمینِ کنار جاده) --- */
  const gg = ctx.createLinearGradient(0, DRV.HOR, 0, H);
  gg.addColorStop(0, '#06222c'); gg.addColorStop(0.5, '#083038'); gg.addColorStop(1, '#0a3a42');
  ctx.fillStyle = gg; ctx.fillRect(-20, DRV.HOR - 2, W + 40, H - DRV.HOR + 24);

  /* --- قطعه‌های کانال (آب + موج‌های مرزی) — دور → نزدیک --- */
  const k0 = Math.max(0, Math.floor((D.T - 200) / DRV.SEG));
  const KN = 46;
  for (let k = k0 + KN; k >= k0; k--) {
    const z1 = Math.max(52, k * DRV.SEG - D.T);
    const z2 = Math.max(52, (k + 1) * DRV.SEG - D.T);
    if (z1 > 24000) continue;
    const y1 = drvY(z1), y2 = drvY(z2);
    const x1 = drvX(roadCX(k), z1), w1 = drvRW(z1);
    const x2 = drvX(roadCX(k + 1), z2), w2 = drvRW(z2);
    /* آبِ متناوب (بازتاب مه/آسمان) */
    ctx.fillStyle = (k % 2 === 0) ? 'rgba(16,74,86,0.55)' : 'rgba(10,52,62,0.55)';
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2); ctx.lineTo(x2 - w2, y2);
    ctx.closePath(); ctx.fill();
    /* بویه‌های لبه‌ی کانال (به‌جای rumble قرمز/سفید جاده) */
    if (z1 < 9000 && k % 2 === 0) {
      ctx.fillStyle = '#d84a38';
      const rw1 = Math.max(2.4, w1 * 0.05), rw2 = Math.max(1.4, w2 * 0.05);
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 - w1 + rw1, y1);
      ctx.lineTo(x2 - w2 + rw2, y2); ctx.lineTo(x2 - w2, y2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x1 + w1, y1); ctx.lineTo(x1 + w1 - rw1, y1);
      ctx.lineTo(x2 + w2 - rw2, y2); ctx.lineTo(x2 + w2, y2);
      ctx.closePath(); ctx.fill();
    }
    /* موج‌های عرضی نزدیک (خطوط سینوسی روشن) — فقط نزدیک، هر قطعه‌ی دیگر */
    if (z1 < 6500 && k % 2 === 0) {
      ctx.strokeStyle = 'rgba(150,214,222,0.16)'; ctx.lineWidth = Math.max(1, 30 * drvPPU(z1));
      ctx.beginPath();
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const fx = x1 - w1 + (2 * w1) * i / n;
        const fy = y1 + Math.sin(animTime * 2.2 + i * 1.4 + k) * 2.2;
        if (i === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }
    /* محوِ دور در مه */
    if (z1 > 6000) {
      const a = clamp((z1 - 6000) / 9000, 0, 0.9);
      ctx.fillStyle = 'rgba(126,158,164,' + a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 1.4, y1); ctx.lineTo(x1 + w1 * 1.4, y1);
      ctx.lineTo(x2 + w2 * 1.4, y2); ctx.lineTo(x2 - w2 * 1.4, y2);
      ctx.closePath(); ctx.fill();
    }
  }

  /* انعکاس ستون نور ماه روی آب */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const yy = DRV.HOR + 10 + i * 42;
    const ww = 26 + i * 9;
    const sh = Math.sin(animTime * 1.6 + i * 2.1) * 12;
    ctx.fillStyle = 'rgba(190,230,238,' + (0.1 - i * 0.009).toFixed(3) + ')';
    rr(770 - ww / 2 + sh, yy, ww, 7, 3.5); ctx.fill();
  }
  ctx.restore();

  /* --- اجزای کنار کانال: نیزار/تیرک پل/سکوی چوبی — دور → نزدیک --- */
  for (let k = k0 + KN; k >= k0; k--) {
    const z = k * DRV.SEG + 300 - D.T;
    if (z < 90 || z > 21000) continue;
    const hsh = (k * 2654435761) % 1000;
    const side = (hsh % 2 === 0) ? -1 : 1;
    const y = drvY(z), ppu = drvPPU(z);
    /* نیزار (هر ۳ قطعه) */
    if (hsh % 3 === 0) {
      const wx = roadCX(k) + side * (DRV.ROADW + 260 + (hsh % 5) * 120);
      const sx = drvX(wx, z);
      ctx.strokeStyle = 'rgba(28,52,44,0.9)'; ctx.lineWidth = Math.max(0.8, 26 * ppu);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const rx = sx + (i - 2) * 60 * ppu;
        const rh = (300 + (hsh + i * 97) % 200) * ppu;
        const sway = Math.sin(animTime * 1.4 + i + k) * 40 * ppu;
        ctx.moveTo(rx, y); ctx.lineTo(rx + sway, y - rh);
      }
      ctx.stroke();
    }
    /* تیرک مهار با چراغ سبز (هر ۹ قطعه) */
    if (k % 9 === 0) {
      const wx = roadCX(k) + (DRV.ROADW + 140);
      const sx = drvX(wx, z);
      const ph = 640 * ppu;
      ctx.strokeStyle = '#123038'; ctx.lineWidth = Math.max(1, 40 * ppu);
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y - ph); ctx.stroke();
      ctx.strokeStyle = '#0c222a'; ctx.lineWidth = Math.max(0.8, 22 * ppu);
      ctx.beginPath(); ctx.moveTo(sx - 80 * ppu, y); ctx.lineTo(sx, y - ph * 0.9); ctx.stroke();
      if (z < 9000) {
        const a = (0.5 + 0.2 * Math.sin(animTime * 2.6 + k)) * clamp(1 - z / 9000, 0.1, 1);
        const ga = ctx.globalAlpha;
        ctx.globalAlpha = ga * clamp(a * 0.8, 0, 1);
        ctx.drawImage(drvLampGlow('#7be389'), sx - 60 * ppu - 6, y - ph - 6, 120 * ppu + 12, 120 * ppu + 12);
        ctx.globalAlpha = ga;
        ctx.fillStyle = '#7be389'; ctx.beginPath(); ctx.arc(sx, y - ph, Math.max(1, 22 * ppu), 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* --- موانع شناور (دور → نزدیک) + آیتم مخفی --- */
  drvDrawObstacles();
  drvDrawHidden();

  /* --- نور فانوس قایق روی آب --- */
  drvDrawHeadlight('rgba(255,236,180,0.08)');

  /* --- قایق بازیکن + ارشان --- */
  drawRiverBoat();

  /* --- ردّ کف قایق (wake) ذره‌ای در سرعت --- */
  if (D.speed > 2400 && Math.random() < 0.6) {
    spawnParticles(480 + rand(-70, 70), 556, 1, 'rgba(170,222,228,0.5)',
      { speed: 60, life: 0.55, size: 2.6, grav: 130, up: true });
  }

  drvDrawSpeedLines('rgba(180,226,232,0.14)');

  /* --- فاز ۳: دروازه‌ی پاسگاه نظامی از دل مه --- */
  if (t3) {
    const k = clamp(TR.t / 3.0, 0, 1);
    const gw = 150 + k * 560, gh = 80 + k * 210;
    const gy = DRV.HOR + 26;
    /* برج‌های نگهبانی دو طرف */
    ctx.fillStyle = 'rgba(16,26,30,' + (0.6 + k * 0.3).toFixed(2) + ')';
    rr(W / 2 - gw / 2, gy - gh, 64, gh + 40, 6); ctx.fill();
    rr(W / 2 + gw / 2 - 64, gy - gh, 64, gh + 40, 6); ctx.fill();
    /* بدنه‌ی دروازه */
    ctx.fillStyle = 'rgba(24,38,44,' + (0.65 + k * 0.3).toFixed(2) + ')';
    rr(W / 2 - gw / 2 + 40, gy - gh * 0.55, gw - 80, gh * 0.55 + 40, 8); ctx.fill();
    /* نورهای گرمِنگهبان + چراغ گردان جست‌وجو */
    for (const lx of [-0.36, 0.36]) {
      ctx.fillStyle = 'rgba(255,196,110,' + (0.6 + 0.3 * Math.sin(animTime * 3 + lx * 9)).toFixed(2) + ')';
      circle(W / 2 + lx * (gw - 90), gy - gh * 0.72, 3 + k * 3);
    }
    const sweep = Math.sin(animTime * 1.1) * 90;
    ctx.save();
    ctx.translate(W / 2, gy - gh);
    ctx.rotate(-0.5 + Math.sin(animTime * 1.1) * 0.24);
    const sg = ctx.createLinearGradient(0, 0, 0, 260 + k * 160);
    sg.addColorStop(0, 'rgba(255,240,190,0.3)'); sg.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(54 + sweep * 0.2, 260 + k * 160); ctx.lineTo(-54 + sweep * 0.2, 260 + k * 160); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

/* مانع شناور رودخانه (پرسپکتیو) */
function drawRiverObs(o, z) {
  const ppu = drvPPU(z);
  const sx = drvX(o.wx, z);
  const sy = drvY(z);
  const fade = clamp(1 - (z - 3200) / 3200, 0.25, 1);
  const bob = Math.sin(animTime * 1.8 + o.k * 1.3) * 14 * ppu;
  ctx.save();
  ctx.globalAlpha = fade;
  /* حلقه‌ی موج دور مانع شناور */
  ctx.strokeStyle = 'rgba(150,214,222,0.35)';
  ctx.lineWidth = Math.max(1, 30 * ppu);
  ctx.beginPath(); ctx.ellipse(sx, sy + 4 * ppu, Math.max(4, (o.hw + 90) * ppu), Math.max(1.4, 34 * ppu), 0, 0, Math.PI * 2); ctx.stroke();

  if (o.type === 'zSwim' || o.type === 'zTank') {
    /* زامبی شناگر — بالا تنه بیرون آب، دست‌ها را می‌زند */
    const big = o.type === 'zTank';
    const body = big ? '#4a5560' : '#566b46', dark = big ? '#38424c' : '#42533a';
    const s = ppu * (big ? 1.35 : 1);
    const w2 = (big ? 420 : 300) * 0.5 * s;
    const spl = Math.sin(animTime * 7 + o.k * 1.7) * 26 * s;
    /* بازوهای کوبنده روی آب */
    ctx.strokeStyle = body; ctx.lineWidth = Math.max(1.4, 40 * s); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx - w2 * 0.8, sy - bob - 120 * s);
    ctx.lineTo(sx - w2 * 1.5 - spl, sy - bob - 40 * s + Math.abs(spl) * 0.4);
    ctx.moveTo(sx + w2 * 0.8, sy - bob - 120 * s);
    ctx.lineTo(sx + w2 * 1.5 + spl, sy - bob - 40 * s + Math.abs(spl) * 0.4);
    ctx.stroke();
    /* تنه */
    ctx.fillStyle = body;
    rr(sx - w2, sy - bob - 210 * s, (big ? 420 : 300) * s, 150 * s, 40 * s); ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(sx - w2, sy - bob - 90 * s, (big ? 420 : 300) * s, 26 * s);
    /* سر + چشم‌های سرخ */
    const hr = (big ? 420 : 300) * 0.19 * s;
    const hy = sy - bob - 260 * s;
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(sx, hy, hr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff4b3e';
    circle(sx - hr * 0.42, hy - hr * 0.1, Math.max(0.8, hr * 0.16));
    circle(sx + hr * 0.42, hy - hr * 0.1, Math.max(0.8, hr * 0.16));
    /* شال‌آب فرو ریختن */
    ctx.strokeStyle = 'rgba(150,214,222,0.5)'; ctx.lineWidth = Math.max(1, 20 * s);
    ctx.beginPath(); ctx.moveTo(sx - w2 * 0.7, sy - bob - 6 * s); ctx.lineTo(sx - w2 * 0.7, sy + 14 * s); ctx.stroke();
  } else if (o.type === 'log') {
    /* تنه‌ی درخت شناور — استوانه‌ی دراز */
    const s = ppu;
    ctx.fillStyle = '#4d3a26';
    rr(sx - 320 * s, sy - bob - 130 * s, 640 * s, 110 * s, 46 * s); ctx.fill();
    ctx.fillStyle = '#6a5236';
    rr(sx - 300 * s, sy - bob - 122 * s, 600 * s, 40 * s, 20 * s); ctx.fill();
    /* شاخه‌های چوبی */
    ctx.strokeStyle = '#3a2c1c'; ctx.lineWidth = Math.max(1, 26 * s);
    ctx.beginPath();
    ctx.moveTo(sx - 120 * s, sy - bob - 120 * s); ctx.lineTo(sx - 180 * s, sy - bob - 210 * s);
    ctx.moveTo(sx + 140 * s, sy - bob - 120 * s); ctx.lineTo(sx + 200 * s, sy - bob - 190 * s);
    ctx.stroke();
    ctx.fillStyle = '#8a97a8'; circle(sx + 320 * s, sy - bob - 75 * s, Math.max(1.4, 42 * s));
  } else if (o.type === 'barrelF') {
    /* بشکه‌ی سرگردان — نیم‌فرورفته */
    const s = ppu;
    ctx.fillStyle = '#7a4a28';
    rr(sx - 150 * s, sy - bob - 210 * s, 300 * s, 210 * s, 26 * s); ctx.fill();
    ctx.fillStyle = '#e8a13c';
    ctx.fillRect(sx - 150 * s, sy - bob - 170 * s, 300 * s, 34 * s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(sx - 150 * s, sy - bob - 120 * s, 300 * s, 8 * s);
  } else if (o.type === 'buoy') {
    /* بووی قرمز ناوبری — مخروط + چراغ چشمک‌زن */
    const s = ppu;
    ctx.fillStyle = '#c9463d';
    ctx.beginPath();
    ctx.moveTo(sx - 130 * s, sy - bob);
    ctx.lineTo(sx + 130 * s, sy - bob);
    ctx.lineTo(sx + 40 * s, sy - bob - 190 * s);
    ctx.lineTo(sx - 40 * s, sy - bob - 190 * s);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2ede2';
    ctx.fillRect(sx - 108 * s, sy - bob - 110 * s, 216 * s, 30 * s);
    const bl = Math.sin(animTime * 4 + o.k) > 0.25 ? 1 : 0.25;
    ctx.fillStyle = 'rgba(255,220,120,' + bl.toFixed(2) + ')';
    circle(sx, sy - bob - 205 * s, Math.max(1.6, 30 * s));
  }
  ctx.restore();
}

/* قایق موتوری بازیکن — نمای از پشت؛ بازیکن فرمان (چپ)، ارشان با فانوس (راست) */
function drawRiverBoat() {
  const D = DRV;
  const lean = clamp(D.steer, -1, 1) * 20;
  const cx = 480 + lean * 0.7;
  const cy = 552;
  const bob = Math.sin(animTime * 2.1) * 2.6 + Math.sin(animTime * 3.7) * 1.2;
  const braking = D.brake;
  const shallows = D.offroad > 0.25;

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(clamp(D.steer, -1, 1) * 0.025);

  /* ردّ کف قایق (V شکل) */
  ctx.fillStyle = 'rgba(170,222,228,0.28)';
  ctx.beginPath();
  ctx.moveTo(-30, -6); ctx.lineTo(-150, 10); ctx.lineTo(-120, 18); ctx.lineTo(-16, 8);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(30, -6); ctx.lineTo(150, 10); ctx.lineTo(120, 18); ctx.lineTo(16, 8);
  ctx.closePath(); ctx.fill();

  /* بدنه‌ی قایق — چوب گرم با لبه */
  const bg = ctx.createLinearGradient(0, -58, 0, 0);
  bg.addColorStop(0, '#8a5a34'); bg.addColorStop(0.55, '#6a4426'); bg.addColorStop(1, '#3f2a18');
  ctx.fillStyle = bg; rr(-104, -52, 208, 52, 16); ctx.fill();
  ctx.fillStyle = '#2c1e12';
  rr(-104, -18, 208, 14, 6); ctx.fill();
  ctx.fillStyle = '#c9975c';
  rr(-96, -52, 192, 7, 3); ctx.fill();
  /* عرشه‌ی داخلی تیره */
  ctx.fillStyle = '#241a10';
  rr(-78, -46, 156, 30, 10); ctx.fill();

  /* سکان (tiller) به سمت فرمان */
  ctx.strokeStyle = '#54626e'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -30);
  ctx.lineTo(-10 - lean * 0.9, -66);
  ctx.stroke();
  ctx.fillStyle = '#7a8a96'; circle(-10 - lean * 0.9, -66, 5);

  /* سر بازیکن (فرمان‌دهنده — چپ) */
  const pl = Math.sin(animTime * 2.6) * 1.4;
  ctx.fillStyle = '#f0c49a'; circle(-40, -66 + pl, 13);
  ctx.fillStyle = '#2c3550';
  ctx.beginPath(); ctx.arc(-40, -68 + pl, 13.6, Math.PI, Math.PI * 2); ctx.fill();
  /* کاپشن نارنجی نجات */
  ctx.fillStyle = '#d97a3a'; rr(-58, -56, 36, 22, 8); ctx.fill();

  /* ارشان (راست) — کلاه قرمز + فانوس */
  const nod = Math.sin(animTime * 3.2) * 2;
  ctx.fillStyle = '#4a7a4a'; rr(26, -56, 40, 24, 8); ctx.fill();
  ctx.fillStyle = '#f0c49a'; circle(46 + nod, -66, 13);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(46 + nod, -68, 14, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(30 + nod, -69, 32, 4);
  /* فانوس در دست ارشان — نور گرم */
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(62, -50); ctx.lineTo(78, -62); ctx.stroke();
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.drawImage(drvLampGlow(), 78 - 34, -62 - 34, 68, 68);
  ctx.restore();
  ctx.fillStyle = '#ffd873'; circle(78, -62, 4.4);
  ctx.fillStyle = 'rgba(90,60,20,0.9)'; rr(73, -72, 10, 8, 2); ctx.fill();

  /* چراغ دم اسنوموبایل نیست — چراغ سبز/قرمز طرفین قایق */
  ctx.fillStyle = '#7be389'; circle(-92, -30, 3.4);
  ctx.fillStyle = '#ff6a5a'; circle(92, -30, 3.4);

  /* موتور قایق (بیرون‌زده از وسط) + آب پاشش */
  ctx.fillStyle = '#454b57'; rr(-18, -34, 36, 26, 6); ctx.fill();
  ctx.fillStyle = '#2f3540'; rr(-8, -12, 16, 14, 4); ctx.fill();
  ctx.restore();

  /* آب پاشش از موتور در سرعت/ترمز */
  if ((D.speed > 2200 || braking) && Math.random() < 0.7) {
    spawnParticles(cx + rand(-16, 16), 550, 1, 'rgba(190,232,238,0.55)',
      { speed: 90, life: 0.5, size: 2.4, grav: 300, up: true });
  }
  /* آبِ کم‌عمق کنار کانال */
  if (shallows && Math.random() < 0.5) {
    spawnParticles(cx + rand(-100, 100), 552, 1, 'rgba(120,180,190,0.5)',
      { speed: 80, life: 0.5, size: 3, grav: 260, up: true });
  }
}

/* ==================================================================
   ---- ۱۲-۴) تم برف: توفان شیب مخابرات (فصل ۳→۴) ----
   ================================================================== */
function renderSnow() {
  const D = DRV;
  const t3 = TR.phase === 3;

  /* --- آسمان توفان برفی (خاکستری-آبی روشن) --- */
  const g = ctx.createLinearGradient(0, -20, 0, DRV.HOR + 30);
  g.addColorStop(0, '#5d7085'); g.addColorStop(0.5, '#8fa4b8'); g.addColorStop(1, '#c8d8e4');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, DRV.HOR + 50);

  /* رگبار باد (نوارهای مورب سریع) */
  if (!t3) {
    ctx.strokeStyle = 'rgba(235,244,252,0.3)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) {
      const ph = (animTime * 2.2 + i * 0.61) % 2;
      const yy = 30 + i * 22 + ph * 26;
      const xx = ((i * 173) % W) + ph * 190;
      ctx.globalAlpha = 0.24 * Math.sin(ph * Math.PI);
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - 70, yy + 12); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* --- قله‌های دور با برف‌گیر --- */
  const off = D.T * 0.0009;
  ctx.fillStyle = '#7d92a6';
  ctx.beginPath(); ctx.moveTo(-20, DRV.HOR + 4);
  for (let i = 0; i < 10; i++) {
    const px = i * 130 - (off % 130);
    ctx.lineTo(px + 65, DRV.HOR - 66 - ((i * 47) % 60));
    ctx.lineTo(px + 130, DRV.HOR - 6);
  }
  ctx.lineTo(W + 20, DRV.HOR + 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dce8f0';
  ctx.beginPath(); ctx.moveTo(-20, DRV.HOR + 4);
  for (let i = 0; i < 10; i++) {
    const px = i * 130 - (off % 130);
    ctx.lineTo(px + 65, DRV.HOR - 66 - ((i * 47) % 60));
    ctx.lineTo(px + 82, DRV.HOR - 40 - ((i * 47) % 60) * 0.5);
  }
  ctx.lineTo(W + 20, DRV.HOR + 4); ctx.closePath(); ctx.fill();

  /* مهِ توفان روی افق */
  const fogA = t3 ? 0.62 + 0.38 * clamp(TR.t / 2.6, 0, 1) : 0.5;
  const fg = ctx.createLinearGradient(0, DRV.HOR - 34, 0, DRV.HOR + 90);
  fg.addColorStop(0, 'rgba(210,224,232,' + fogA.toFixed(2) + ')');
  fg.addColorStop(1, 'rgba(210,224,232,0)');
  ctx.fillStyle = fg; ctx.fillRect(-20, DRV.HOR - 34, W + 40, 124);

  /* --- بدنه‌ی شیب برفی --- */
  const gg = ctx.createLinearGradient(0, DRV.HOR, 0, H);
  gg.addColorStop(0, '#9eb4c6'); gg.addColorStop(0.45, '#c2d4e0'); gg.addColorStop(1, '#e4eef4');
  ctx.fillStyle = gg; ctx.fillRect(-20, DRV.HOR - 2, W + 40, H - DRV.HOR + 24);

  /* --- قطعه‌های مسیر برفی (شیب) — دور → نزدیک --- */
  const k0 = Math.max(0, Math.floor((D.T - 200) / DRV.SEG));
  const KN = 46;
  for (let k = k0 + KN; k >= k0; k--) {
    const z1 = Math.max(52, k * DRV.SEG - D.T);
    const z2 = Math.max(52, (k + 1) * DRV.SEG - D.T);
    if (z1 > 24000) continue;
    const y1 = drvY(z1), y2 = drvY(z2);
    const x1 = drvX(roadCX(k), z1), w1 = drvRW(z1);
    const x2 = drvX(roadCX(k + 1), z2), w2 = drvRW(z2);
    /* برفِ شکل‌گرفته (متناوب) */
    ctx.fillStyle = (k % 2 === 0) ? 'rgba(238,246,250,0.65)' : 'rgba(214,230,240,0.65)';
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2); ctx.lineTo(x2 - w2, y2);
    ctx.closePath(); ctx.fill();
    /* تیرک‌های مسیر نارنجی (سمت‌ها) */
    if (z1 < 9000 && k % 2 === 0) {
      ctx.fillStyle = '#e8823c';
      const rw1 = Math.max(2.2, w1 * 0.045), rw2 = Math.max(1.3, w2 * 0.045);
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 - w1 + rw1, y1);
      ctx.lineTo(x2 - w2 + rw2, y2); ctx.lineTo(x2 - w2, y2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x1 + w1, y1); ctx.lineTo(x1 + w1 - rw1, y1);
      ctx.lineTo(x2 + w2 - rw2, y2); ctx.lineTo(x2 + w2, y2);
      ctx.closePath(); ctx.fill();
    }
    /* ردّ اسکی (دو خط آبی‌تر) — خطوط لاین */
    if (k % 2 === 0 && z1 < 12000) {
      ctx.fillStyle = 'rgba(148,178,200,0.75)';
      for (const lx of [-0.34, 0.34]) {
        const c1 = x1 + w1 * lx, c2 = x2 + w2 * lx;
        const lw1 = Math.max(1.2, w1 * 0.014), lw2 = Math.max(0.8, w2 * 0.014);
        ctx.beginPath();
        ctx.moveTo(c1 - lw1, y1); ctx.lineTo(c1 + lw1, y1);
        ctx.lineTo(c2 + lw2, y2); ctx.lineTo(c2 - lw2, y2);
        ctx.closePath(); ctx.fill();
      }
    }
    /* محوِ دور در توفان */
    if (z1 > 6000) {
      const a = clamp((z1 - 6000) / 9000, 0, 0.9);
      ctx.fillStyle = 'rgba(210,224,232,' + a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 1.4, y1); ctx.lineTo(x1 + w1 * 1.4, y1);
      ctx.lineTo(x2 + w2 * 1.4, y2); ctx.lineTo(x2 - w2 * 1.4, y2);
      ctx.closePath(); ctx.fill();
    }
  }

  /* --- اجزای کنار شیب: کاج یخ‌زده/صخره — دور → نزدیک --- */
  for (let k = k0 + KN; k >= k0; k--) {
    const z = k * DRV.SEG + 300 - D.T;
    if (z < 90 || z > 21000) continue;
    const hsh = (k * 2654435761) % 1000;
    const side = (hsh % 2 === 0) ? -1 : 1;
    const y = drvY(z), ppu = drvPPU(z);
    if (hsh % 3 !== 1) {
      /* کاج برفی — سه مثلث + تنه + برف‌گیر */
      const wx = roadCX(k) + side * (DRV.ROADW + 320 + (hsh % 5) * 200);
      const sx = drvX(wx, z);
      const th = 700 * ppu;
      ctx.fillStyle = 'rgba(70,100,84,0.55)';
      ctx.beginPath(); ctx.ellipse(sx, y, Math.max(1.5, 140 * ppu), Math.max(0.6, 36 * ppu), 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1e3a30';
      ctx.fillRect(sx - 20 * ppu, y - th * 0.28, 40 * ppu, th * 0.28);
      for (let i = 0; i < 3; i++) {
        const ly = y - th * (0.24 + i * 0.24);
        const lw = (300 - i * 70) * ppu;
        ctx.fillStyle = i === 2 ? '#245040' : '#1c4234';
        ctx.beginPath();
        ctx.moveTo(sx - lw, ly); ctx.lineTo(sx + lw, ly); ctx.lineTo(sx, ly - th * 0.3);
        ctx.closePath(); ctx.fill();
        /* لایه‌ی برف روی شاخه‌ها */
        ctx.fillStyle = 'rgba(238,246,250,0.85)';
        ctx.beginPath();
        ctx.moveTo(sx - lw * 0.7, ly - th * 0.09); ctx.lineTo(sx + lw * 0.7, ly - th * 0.09);
        ctx.lineTo(sx, ly - th * 0.3);
        ctx.closePath(); ctx.fill();
      }
    } else if (hsh % 7 === 3) {
      /* صخره‌ی کوچک برفی */
      const wx = roadCX(k) + side * (DRV.ROADW + 420);
      const sx = drvX(wx, z);
      const rh = 190 * ppu;
      ctx.fillStyle = '#5d6a78';
      ctx.beginPath();
      ctx.moveTo(sx - 150 * ppu, y); ctx.lineTo(sx - 60 * ppu, y - rh);
      ctx.lineTo(sx + 90 * ppu, y - rh * 0.7); ctx.lineTo(sx + 160 * ppu, y);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(238,246,250,0.9)';
      ctx.beginPath();
      ctx.moveTo(sx - 60 * ppu, y - rh); ctx.lineTo(sx + 90 * ppu, y - rh * 0.7);
      ctx.lineTo(sx + 30 * ppu, y - rh * 0.45);
      ctx.closePath(); ctx.fill();
    }
  }

  /* --- موانع + آیتم مخفی --- */
  drvDrawObstacles();
  drvDrawHidden();

  /* --- نور چراغ‌گردباد اسنوموبیل روی برف --- */
  drvDrawHeadlight('rgba(255,244,200,0.1)');

  /* --- اسنوموبایل بازیکن + ارشان --- */
  drawSnowmobile();

  /* --- تندبرف روی صفحه (شدت با سرعت) --- */
  const nFl = (typeof PERF !== 'undefined' && PERF.low) ? 34 : 64;
  const spd = 0.6 + clamp(D.speed / 3400, 0, 1) * 1.2;
  ctx.fillStyle = 'rgba(240,248,252,0.85)';
  for (let i = 0; i < nFl; i++) {
    const m = W + 60;
    const fx = (((i * 163.3 + animTime * 210 * spd) % m) + m) % m - 30 - Math.sin(animTime * 2 + i) * 26;
    const fy = ((i * 97.7 + animTime * 420 * spd) % (H + 30)) - 15;
    const r = 1 + (i % 3) * 0.7;
    ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
  }

  /* --- رگبار سفیدِ دوره‌ای (whiteout) — گاز نگه‌داشتن در آن خطرناک است --- */
  if (!t3) {
    const cyc = (D.T * 0.0011) % 10;                 // هر ~۱۰ ثانیه یک موج
    let a = 0;
    if (cyc < 2.6) a = cyc / 2.6;
    else if (cyc < 4.6) a = 1;
    else if (cyc < 7.2) a = (7.2 - cyc) / 2.6;
    a *= 0.42;
    if (a > 0.02) {
      ctx.fillStyle = 'rgba(224,236,244,' + a.toFixed(2) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  drvDrawSpeedLines('rgba(255,255,255,0.2)');

  /* --- فاز ۳: دکل مخابراتی از دل توفان --- */
  if (t3) {
    const k = clamp(TR.t / 3.0, 0, 1);
    const mx = W / 2, mtop = DRV.HOR - 30 - k * 190, mbase = DRV.HOR + 60;
    ctx.strokeStyle = 'rgba(44,62,82,' + (0.7 + k * 0.3).toFixed(2) + ')'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mx - 64 * k - 16, mbase); ctx.lineTo(mx - 12, mtop);
    ctx.moveTo(mx + 64 * k + 16, mbase); ctx.lineTo(mx + 12, mtop);
    for (let i = 0; i < 5; i++) {
      const t1 = i / 5, t2 = (i + 1) / 5;
      const w1 = 64 * k * (1 - t1) + 16, w2 = 64 * k * (1 - t2) + 16;
      const y1 = mbase - (mbase - mtop) * t1, y2 = mbase - (mbase - mtop) * t2;
      ctx.moveTo(mx - w1, y1); ctx.lineTo(mx + w2, y2);
      ctx.moveTo(mx + w1, y1); ctx.lineTo(mx - w2, y2);
    }
    ctx.stroke();
    /* سکو + چراغ قرمز چشمک‌زن */
    ctx.fillStyle = 'rgba(44,62,82,' + (0.8 + k * 0.2).toFixed(2) + ')';
    rr(mx - 26, mtop + 8, 52, 12, 3); ctx.fill();
    const bl = 0.5 + 0.5 * Math.sin(animTime * 3.2);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.drawImage(drvLampGlow('#ff4b3e'), mx - 26, mtop - 26, 52, 52);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,86,70,' + bl.toFixed(2) + ')';
    circle(mx, mtop - 4, 4 + k * 2);
    /* چراغ‌های پایه */
    for (const lx of [-0.3, 0.3]) {
      ctx.fillStyle = 'rgba(255,196,110,' + (0.6 + 0.3 * Math.sin(animTime * 3 + lx * 9)).toFixed(2) + ')';
      circle(mx + lx * 300 * k, mbase - 8, 3 + k * 2);
    }
  }
}

/* مانع برفی (پرسپکتیو) */
function drawSnowObs(o, z) {
  const ppu = drvPPU(z);
  const sx = drvX(o.wx, z);
  const sy = drvY(z);
  const fade = clamp(1 - (z - 3200) / 3200, 0.25, 1);
  ctx.save();
  ctx.globalAlpha = fade;
  /* سایه‌ی آبی روی برف */
  ctx.fillStyle = 'rgba(120,150,175,0.4)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, Math.max(2, (o.hw + 60) * ppu), Math.max(0.8, 40 * ppu), 0, 0, Math.PI * 2);
  ctx.fill();

  if (o.type === 'zFrozen' || o.type === 'zSnow') {
    const fast = o.type === 'zSnow';
    const body = fast ? '#c9a35a' : '#9ab4c4', dark = fast ? '#7a5a2e' : '#6a8494';
    const s = ppu * (fast ? 0.85 : 1);
    const cfgZ = fast ? { w: 240, h: 210 } : { w: 300, h: 240 };
    const w2 = cfgZ.w / 2;
    const run = fast ? animTime * 8 + o.k * 1.7 : animTime * 1.1 + o.k;   // یخ‌زده تقریباً ثابت
    const bob = fast ? Math.abs(Math.sin(run)) * 16 * s : Math.sin(run) * 3 * s;
    /* پاها */
    ctx.strokeStyle = dark; ctx.lineWidth = Math.max(1.5, 46 * s); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx - 40 * s, sy - bob - 40 * s); ctx.lineTo(sx - 40 * s + Math.sin(run) * (fast ? 60 : 8) * s, sy - bob);
    ctx.moveTo(sx + 40 * s, sy - bob - 40 * s); ctx.lineTo(sx + 40 * s - Math.sin(run) * (fast ? 60 : 8) * s, sy - bob);
    ctx.stroke();
    /* تنه + یخ‌قاش‌ها */
    ctx.fillStyle = body;
    rr(sx - w2 * s, sy - bob - cfgZ.h * 0.62 * s, cfgZ.w * s, cfgZ.h * 0.5 * s, 30 * s); ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillRect(sx - w2 * s, sy - bob - cfgZ.h * 0.24 * s, cfgZ.w * s, 26 * s);
    ctx.fillStyle = 'rgba(230,244,250,0.85)';      // لایه‌ی برف روی شانه‌ها
    rr(sx - w2 * s * 0.9, sy - bob - cfgZ.h * 0.62 * s, cfgZ.w * s * 0.9, 16 * s, 8 * s); ctx.fill();
    /* بازوها — یخ‌زده: صاف جلو؛ سریع: تکان‌دار */
    ctx.strokeStyle = body; ctx.lineWidth = Math.max(1.2, 38 * s);
    ctx.beginPath();
    if (fast) {
      ctx.moveTo(sx - w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
      ctx.lineTo(sx - w2 * s * 0.8 - 90 * s, sy - bob - cfgZ.h * 0.42 * s + Math.sin(run * 2) * 26 * s);
      ctx.moveTo(sx + w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
      ctx.lineTo(sx + w2 * s * 0.8 + 90 * s, sy - bob - cfgZ.h * 0.42 * s - Math.sin(run * 2) * 26 * s);
    } else {
      ctx.moveTo(sx - w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
      ctx.lineTo(sx - w2 * s * 1.3 * s, sy - bob - cfgZ.h * 0.2 * s);
      ctx.moveTo(sx + w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
      ctx.lineTo(sx + w2 * s * 1.3 * s, sy - bob - cfgZ.h * 0.2 * s);
    }
    ctx.stroke();
    /* سر + چشم‌ها (یخ‌زده: آبی کم‌نور) */
    const hr = cfgZ.w * 0.19 * s;
    const hy = sy - bob - cfgZ.h * 0.78 * s;
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(sx, hy, hr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(238,246,250,0.9)';
    ctx.beginPath(); ctx.arc(sx, hy + hr * 0.12, hr * 0.72, 0, Math.PI); ctx.fill();
    ctx.fillStyle = fast ? '#ff4b3e' : '#9fd6e8';
    circle(sx - hr * 0.42, hy - hr * 0.12, Math.max(0.8, hr * 0.16));
    circle(sx + hr * 0.42, hy - hr * 0.12, Math.max(0.8, hr * 0.16));
  } else if (o.type === 'iceRock') {
    /* صخره‌ی یخی — کریستال چندوجهی */
    const s = ppu;
    ctx.fillStyle = '#a8c8dc';
    ctx.beginPath();
    ctx.moveTo(sx - 230 * s, sy);
    ctx.lineTo(sx - 150 * s, sy - 190 * s);
    ctx.lineTo(sx - 30 * s, sy - 230 * s);
    ctx.lineTo(sx + 130 * s, sy - 150 * s);
    ctx.lineTo(sx + 230 * s, sy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d4e8f2';
    ctx.beginPath();
    ctx.moveTo(sx - 150 * s, sy - 190 * s); ctx.lineTo(sx - 30 * s, sy - 230 * s);
    ctx.lineTo(sx - 60 * s, sy - 110 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.moveTo(sx - 30 * s, sy - 230 * s); ctx.lineTo(sx + 130 * s, sy - 150 * s);
    ctx.lineTo(sx + 60 * s, sy - 160 * s); ctx.closePath(); ctx.fill();
  } else if (o.type === 'pineDown') {
    /* کاج افتاده — تنه + شاخه‌های برف‌گرفته */
    const s = ppu;
    ctx.fillStyle = '#4d3a2c';
    rr(sx - 340 * s, sy - 90 * s, 680 * s, 74 * s, 30 * s); ctx.fill();
    ctx.fillStyle = '#1c4234';
    for (let i = 0; i < 4; i++) {
      const bx = sx - 300 * s + i * 190 * s;
      ctx.beginPath();
      ctx.moveTo(bx - 60 * s, sy - 70 * s); ctx.lineTo(bx + 60 * s, sy - 70 * s);
      ctx.lineTo(bx, sy - 190 * s - (i % 2) * 40 * s);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(238,246,250,0.8)';
    rr(sx - 330 * s, sy - 96 * s, 660 * s, 22 * s, 10 * s); ctx.fill();
  } else if (o.type === 'drift') {
    /* تل برف — نرم و بی‌خطر (فقط کند می‌کند) */
    const s = ppu;
    ctx.fillStyle = 'rgba(228,240,248,0.95)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 4 * s, 260 * s, 90 * s, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(sx - 60 * s, sy - 20 * s, 120 * s, 52 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/* اسنوموبایل بازیکن — نمای از پشت؛ بازیکن راننده، ارشان پشت او چنگ‌زده */
function drawSnowmobile() {
  const D = DRV;
  const lean = clamp(D.steer, -1, 1) * 26;
  const cx = 480 + lean * 0.7;
  const cy = 554;
  const bob = Math.sin(animTime * 15) * 1.6;
  const braking = D.brake;
  const deep = D.offroad > 0.25;

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(clamp(D.steer, -1, 1) * 0.035);

  /* سایه روی برف */
  ctx.fillStyle = 'rgba(120,150,175,0.45)';
  ctx.beginPath(); ctx.ellipse(0, -4, 118, 15, 0, 0, Math.PI * 2); ctx.fill();

  /* اسکی‌های جلو — بیرون‌زده در دو طرف */
  ctx.fillStyle = '#2c3540';
  for (const sx of [-108, 108]) {
    ctx.save();
    ctx.translate(sx, -8);
    ctx.rotate(-clamp(D.steer, -1, 1) * 0.14);
    rr(-14, -16, 28, 22, 8); ctx.fill();
    ctx.fillStyle = '#d84a38'; rr(-14, -16, 28, 7, 4); ctx.fill();
    ctx.fillStyle = '#2c3540';
    ctx.restore();
  }

  /* تسمه‌ی پیاده (tread) با میله‌های متحرک */
  ctx.fillStyle = '#20262e';
  rr(-74, -40, 148, 40, 14); ctx.fill();
  ctx.fillStyle = '#39424e';
  const tw = (D.wheel % 1) * 22;
  for (let i = -1; i < 7; i++) {
    const tx = -70 + i * 22 + tw;
    if (tx > 68) continue;
    ctx.fillRect(tx, -38, 9, 36);
  }
  ctx.fillStyle = 'rgba(238,246,250,0.75)';
  rr(-74, -44, 148, 10, 5); ctx.fill();

  /* بدنه/زین قرمز-مشکی */
  const bg = ctx.createLinearGradient(0, -86, 0, -34);
  bg.addColorStop(0, '#e8563f'); bg.addColorStop(0.6, '#b23a30'); bg.addColorStop(1, '#7a2a24');
  ctx.fillStyle = bg; rr(-64, -80, 128, 48, 18); ctx.fill();
  ctx.fillStyle = '#1a1e26';
  rr(-64, -50, 128, 12, 6); ctx.fill();
  /* زین پشتی + دست‌گیره */
  ctx.fillStyle = '#8a2f26';
  rr(-30, -102, 60, 26, 10); ctx.fill();
  ctx.fillStyle = '#2c3540';
  rr(-84, -76, 18, 10, 5); ctx.fill(); rr(66, -76, 18, 10, 5); ctx.fill();

  /* بازیکن (راننده) + ارشان پشتش */
  const pl = Math.sin(animTime * 2.8) * 1.4;
  ctx.fillStyle = '#f0c49a'; circle(-14 + pl, -108, 13);
  ctx.fillStyle = '#2c3550';
  ctx.beginPath(); ctx.arc(-14 + pl, -110, 13.6, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3d6db5'; rr(-34, -98, 40, 24, 9); ctx.fill();
  const nod = Math.sin(animTime * 3.4) * 2;
  ctx.fillStyle = '#f0c49a'; circle(26 + nod, -104, 12);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(26 + nod, -106, 12.6, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(12 + nod, -107, 28, 4);
  ctx.fillStyle = '#4a7a4a'; rr(8, -94, 36, 22, 8); ctx.fill();

  /* چراغ جلو (بالای بدنه) + چراغ عقب قرمز با ترمز */
  ctx.fillStyle = '#ffe9a0'; circle(0, -96, 5);
  const tl = braking ? 1 : 0.5;
  const gl = drvTailGlow();
  ctx.globalAlpha = braking ? 0.8 : 0.35;
  ctx.drawImage(gl, -30, -62 - 10, 60, 40);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,70,55,' + tl.toFixed(2) + ')';
  rr(-14, -58, 28, 10, 4); ctx.fill();
  ctx.restore();

  /* پاشش برف از تسمه در سرعت/برف عمیق */
  if ((D.speed > 2000 || deep) && Math.random() < 0.75) {
    spawnParticles(cx + rand(-70, 70), 552, 1, 'rgba(240,248,252,0.85)',
      { speed: 130, life: 0.6, size: 2.8, grav: 380, up: true });
  }
}

/* ---- ۱۲-۵) فاز ۳ مشترک سواره‌ها: ادامه آرام + پاشش تم ---- */
function rideOutroUpdate(dt) {
  const D = DRV;
  D.speed += (2300 - D.speed) * Math.min(1, dt * 0.8);
  D.T += D.speed * dt;
  D.wheel += D.speed * dt * 0.004;
  MG.scroll = D.T * 0.12;
  const th = D.theme;
  if (th === 'river') {
    if (Math.random() < dt * 10) {
      spawnParticles(480 + rand(-60, 60), 556, 1, 'rgba(190,232,238,0.4)',
        { speed: 40, life: 0.8, size: 3, grav: 120, up: true });
    }
  } else if (th === 'snow') {
    if (Math.random() < dt * 12) {
      spawnParticles(480 + rand(-70, 70), 552, 1, 'rgba(240,248,252,0.8)',
        { speed: 80, life: 0.6, size: 3, grav: 300, up: true });
    }
  }
}

/* ---- ۱۲-۶) هاله‌ی پیش‌پخته با رنگ دلخواه (چراغ سبز/قرمز سواره‌ها) ---- */
const _rideGlows = {};
function drvLampGlow(col) {
  const key = col || '#ffd873';
  if (_rideGlows[key]) return _rideGlows[key];
  const c = document.createElement('canvas');
  c.width = 96; c.height = 96;
  const g = c.getContext('2d');
  const core = key === '#7be389' ? 'rgba(123,227,137,1)' : (key === '#ff4b3e' ? 'rgba(255,75,62,1)' : 'rgba(255,220,140,1)');
  const mid = key === '#7be389' ? 'rgba(123,227,137,0.35)' : (key === '#ff4b3e' ? 'rgba(255,75,62,0.35)' : 'rgba(255,214,130,0.35)');
  const rg = g.createRadialGradient(48, 48, 2, 48, 48, 46);
  rg.addColorStop(0, core);
  rg.addColorStop(0.45, mid);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 96, 96);
  _rideGlows[key] = c;
  return c;
}
