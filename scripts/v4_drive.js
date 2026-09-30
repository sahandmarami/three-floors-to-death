/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۸٫۰ — بخش ۹: مینی‌گیم رانندگی شبه‌سه‌بعدی
   ==================================================================
   فصل ۱→۲: بازیکن خودش پشت فرمانِ ماشین ارشان است (نه دونده‌ی کنار جاده).
   رندر «جاده‌ی بی‌نهایت» به سبک کلاسیک (OutRun-like) با Canvas 2D خالص:
     • پروجکشن پرسپکتیو: مقیاس = عمق‌دوربین / z → جاده از خط افق به سمت
       بازیکن باز می‌شود؛ هر قطعه‌ی جاده یک ذوزنقه است که با نزدیک‌شدن
       بزرگ می‌شود و از کنار صفحه می‌گذرد
     • پیچ‌های سینوسی: مرکز جاده در جهان جابه‌جا می‌شود → جاده در افق
       مار می‌خورد و بازیکن باید فرمان بدهد تا روی آسفالت بماند
     • موانع/زامبی‌ها از دور (کوچک و کم‌رنگ در مه) زاده می‌شوند و با
       نزدیک‌شدن بزرگ/پررنگ می‌شوند؛ برخورد = کاهش سرعت
     • آیتم مخفی = جعبه‌ی درخشانِ کنار جاده با ستون نور (پاداش فرمان دقیق)
     • ارشان روی صندلی کمکی (کلاه قرمزش از شیشه‌ی عقب دیده می‌شود) و
       طبق روالِ قبل دیالوگ می‌دهد (صدای d1a1/d1a2)
   کنترل: ←/→ (یا A/D، یا لمسِ یک‌سومِ چپ/راست، یا کج‌کردن گوشی) = فرمان
           ↑ (یا Space/W، لمس: گاز خودکار) = گاز • ↓ (یا S، لمسِ وسط) = ترمز
   ================================================================== */

/* ---- ۹-۱) وضعیت و ثابت‌های پروجکشن ---- */
const DRV = {
  HOR: 196,        // y خط افق
  CAMD: 0.84,      // عمق دوربین (میدان دید ~۱۰۰ درجه)
  CAMH: 1000,      // ارتفاع دوربین از سطح جاده (واحد جهان)
  SEG: 600,        // طول هر قطعه‌ی جاده
  ROADW: 1000,     // نیم‌عرض جاده
  PLZ: 840,        // z صفحه‌ی بازیکن (CAMH × CAMD)
  /* حالت اجرا */
  T: 0, goalT: 0, speed: 0, px: 0, steer: 0, kb: false,
  gas: false, brake: false, obs: [], nextZ: 0, hidden: null,
  hits: 0, hitCool: 0, offroad: 0, itemHinted: false, wheel: 0,
};

/* مقیاس پرسپکتیو: پیکسل به‌ازای هر واحد جهان در عمق z */
function drvPPU(z) { return (DRV.CAMD / Math.max(50, z)) * (W / 2); }
/* y صفحه برای نقطه‌ای روی سطح جاده در عمق z */
function drvY(z) { return DRV.HOR + (DRV.CAMD / Math.max(50, z)) * DRV.CAMH * (H / 2); }
/* x صفحه برای نقطه‌ی (worldX, z) — دوربین دنبال بازیکن است */
function drvX(worldX, z) { return W / 2 + drvPPU(z) * (worldX - DRV.px); }
/* نیم‌عرض جاده روی صفحه در عمق z */
function drvRW(z) { return drvPPU(z) * DRV.ROADW; }

/* مرکز جاده در قطعه‌ی k — دو موج سینوسی (پیچ‌های ملایمِ بلند + کوتاه) */
function roadCX(k) { return 620 * Math.sin(k * 0.055) + 380 * Math.sin(k * 0.0213); }
/* نمونه‌ی خطیِ نرم برای عمق دلخواه */
function roadCXf(z) {
  const kk = z / DRV.SEG, k0 = Math.floor(kk), f = kk - k0;
  return roadCX(k0) + (roadCX(k0 + 1) - roadCX(k0)) * f;
}

/* ---- ۹-۲) ورودی مینی‌گیم رانندگی ---- */
function mgGas(on) {
  if (TR && TR.phase === 2 && MG.cfg && MG.cfg.theme === 'drive') DRV.gas = !!on;
}
function mgBrake(on) {
  if (TR && TR.phase === 2 && MG.cfg && MG.cfg.theme === 'drive') DRV.brake = !!on;
}
function mgSteer(v) {
  if (TR && TR.phase === 2 && MG.cfg && MG.cfg.theme === 'drive') DRV.steer = clamp(v, -1, 1);
}

/* ---- ۹-۳) ریست و به‌روزرسانی ---- */
function driveReset(cfg) {
  DRV.T = 0;
  DRV.goalT = cfg.goalM * 200;          /* ۱ متر = ۲۰۰ واحد جهان */
  DRV.speed = cfg.speed0;
  DRV.px = roadCX(0);
  DRV.steer = 0; DRV.kb = false;
  DRV.gas = false; DRV.brake = false;
  DRV.obs = [];
  DRV.nextZ = 4200;
  DRV.hidden = {
    T: DRV.goalT * cfg.hidden.at,
    lane: (Math.random() < 0.5 ? -1 : 1) * 1.06,   /* لبه‌ی جاده */
    id: cfg.hidden.id, got: false,
  };
  DRV.hits = 0; DRV.hitCool = 0;
  DRV.offroad = 0; DRV.itemHinted = false; DRV.wheel = 0;
}

const DRV_OBSTACLES = [
  { t: 'zN',    hw: 130, w: 300, h: 230 },   // زامبی معمولی (روبه‌رو می‌دود)
  { t: 'zN',    hw: 130, w: 300, h: 230 },
  { t: 'zF',    hw: 105, w: 240, h: 210 },   // زامبی سریع
  { t: 'zT',    hw: 165, w: 420, h: 285 },   // زامبی تن‌درشت
  { t: 'rock',  hw: 225, w: 460, h: 210 },   // سنگ‌لاش
  { t: 'barrel',hw: 160, w: 300, h: 330 },   // بشکه
  { t: 'wreck', hw: 330, w: 700, h: 300 },   // ماشین له‌شده
];

function driveUpdate(dt) {
  const cfg = MG.cfg, D = DRV;
  TR.fade = Math.max(0, TR.fade - dt * 1.9);
  MG.t2 += dt;
  D.hitCool = Math.max(0, D.hitCool - dt);

  /* فرمان: px = موقعیت افقی ماشین در جهان */
  D.px += D.steer * 1500 * dt;
  const rc = roadCXf(D.T);
  D.px = clamp(D.px, rc - 1450, rc + 1450);
  D.wheel += D.speed * dt * 0.004;

  /* گاز / ترمز (لمس: گاز خودکار مگر ترمز) */
  let tgt = 2050;
  const touchAuto = (typeof IS_TOUCH !== 'undefined') && IS_TOUCH;
  if (D.gas || (touchAuto && !D.brake)) tgt = 3350;
  if (D.brake) tgt = 850;
  if (D.offroad > 0.2) tgt = Math.min(tgt, 1150);       // شانه‌ی جاده = شنِ سست
  D.speed += (tgt - D.speed) * Math.min(1, dt * 1.05);
  D.T += D.speed * dt;
  MG.scroll = D.T * 0.12;                                // مترها برای نوار پیشرفت/subs

  /* بیرون‌زدن از آسفالت؟ (لرزش + غبار + افت سرعت از tgt) */
  const edge = Math.abs(D.px - roadCXf(D.T));
  D.offroad = edge > (DRV.ROADW - 250)
    ? Math.min(1, D.offroad + dt * 6)
    : Math.max(0, D.offroad - dt * 4);
  if (D.offroad > 0.25) {
    state.shake = Math.max(state.shake, 3.2);
    if (Math.random() < dt * 26) {
      spawnParticles(480 + rand(-140, 140), 540, 2, 'rgba(120,104,78,0.5)',
        { speed: 90, life: 0.5, size: 3, grav: 260, up: true });
    }
  }

  /* تولید موانع تا جلوترِ دید مفید */
  while (D.nextZ < D.T + 5600) {
    const k = Math.round(D.nextZ / DRV.SEG);
    const r = Math.random();
    if (r < 0.24) {
      /* دسته‌ی ۲-۳ زامبی کنار هم */
      const base = rand(-0.55, 0.55), n = irand(2, 3);
      for (let i = 0; i < n; i++) {
        const def = DRV_OBSTACLES[irand(0, 1)];
        D.obs.push({ k, wx: roadCX(k) + clamp(base + i * rand(-0.24, 0.24), -0.8, 0.8) * 880,
          type: def.t, hw: def.hw, hit: false });
      }
    } else {
      const def = DRV_OBSTACLES[irand(0, DRV_OBSTACLES.length - 1)];
      D.obs.push({ k, wx: roadCX(k) + rand(-0.74, 0.74) * 880,
        type: def.t, hw: def.hw, hit: false });
    }
    D.nextZ += rand(950, 1600) + D.speed * 0.22;
  }

  /* برخورد: مانع از صفحه‌ی بازیکن می‌گذرد (z ~ 740..1000) */
  for (const o of D.obs) {
    if (o.hit) continue;
    const z = o.k * DRV.SEG - D.T;
    if (z < 420) { o.hit = true; continue; }             // رد شد
    if (z < 1000 && D.hitCool <= 0 && Math.abs(o.wx - D.px) < 245 + o.hw) {
      driveHit(o);
    }
  }
  /* زادآوری آرایه (حذف رد‌شده‌ها) */
  if (D.obs.length > 90) D.obs = D.obs.filter(o => o.k * DRV.SEG - D.T > 300);

  /* آیتم مخفی: ستون نورش از دور دیده می‌شود؛ نزدیک‌شدن → هشدار ارشان */
  const HI = D.hidden;
  if (HI && !HI.got) {
    const z = HI.T - D.T;
    const hwx = roadCXf(HI.T) + HI.lane * 880;
    if (!D.itemHinted && z < 6500) {
      D.itemHinted = true;
      transBark({ who: 'a', v: 'd1a2', text: 'اون طرف یه جعبه دیدم! بگیرش!' },
        '— [ارشان]: اون طرف یه جعبه دیدم! بگیرش!', 2.8);
    }
    if (z > 640 && z < 1120 && Math.abs(hwx - D.px) < 330) {
      HI.got = true;
      giveItem(HI.id);
      SFX.csGift();
      setTransSub('💎 آیتم مخفی پیدا شد! (' + (GEAR[HI.id] || RARE[HI.id]).name + ')', 2.6);
      spawnParticles(drvX(hwx, 900), 470, 24,
        (GEAR[HI.id] || RARE[HI.id]).color, { speed: 200, life: 0.9, size: 2.8, grav: 260 });
    }
  }

  /* خط‌های ارشان (متن + صدای d1a1 برای اولی) */
  for (const s of cfg.subs) {
    if (!s.done && MG.scroll / PXM >= s.atM) {
      s.done = true;
      setTransSub(s.txt, s.dur || 3);
      SFX.peddler();
      if (s.barkV) {
        transBark({ who: 'a', v: s.barkV, text: s.barkT }, s.txt, 3.4);
      }
    }
  }

  /* دود اگزوز در گاز سنگین */
  if ((D.gas || D.speed > 2900) && Math.random() < dt * 14) {
    spawnParticles(480 + rand(-40, 40), 556, 1, 'rgba(130,130,140,0.4)',
      { speed: 30, life: 0.8, size: 3.4, grav: -20 });
  }

  /* پایان مسیر → فاز ۳ */
  if (D.T >= D.goalT) mgOutro();
}

/* برخورد: زامبی = له‌شدن (سبک) • جسم سخت = تصادف سنگین */
function driveHit(o) {
  o.hit = true;
  DRV.hits++;
  DRV.hitCool = 0.55;
  const soft = o.type === 'zN' || o.type === 'zF' || o.type === 'zT';
  if (soft) {
    DRV.speed = Math.max(700, DRV.speed * 0.8);
    state.shake = Math.max(state.shake, 5);
    SFX.csThud();
    const sx = drvX(o.wx, DRV.PLZ);
    spawnParticles(sx, 500, 16, '#7fa657', { speed: 210, life: 0.7, size: 3, grav: 520 });
    spawnParticles(sx, 496, 8, '#5a3d28', { speed: 160, life: 0.9, size: 2.4, grav: 480 });
    if (DRV.hits % 3 === 1) setTransSub(MG.cfg.hitSubs[irand(0, MG.cfg.hitSubs.length - 1)], 1.6);
  } else {
    DRV.speed = Math.max(650, DRV.speed * 0.5);
    state.shake = 10;
    state.flash = 0.7;
    SFX.csCrash();
    const sx = drvX(o.wx, DRV.PLZ);
    spawnParticles(sx, 486, 22, '#e0a13c', { speed: 300, life: 0.8, size: 3.2, grav: 560 });
    spawnParticles(sx, 480, 10, '#c9463d', { speed: 220, life: 0.7, size: 2.6, grav: 520 });
    setTransSub(MG.cfg.hitSubs[irand(0, MG.cfg.hitSubs.length - 1)], 1.8);
  }
}

/* فاز ۳: رانندگی آرام به داخل مهِ انبارها */
function driveOutroUpdate(dt) {
  DRV.speed += (2300 - DRV.speed) * Math.min(1, dt * 0.8);
  DRV.T += DRV.speed * dt;
  DRV.wheel += DRV.speed * dt * 0.004;
  MG.scroll = DRV.T * 0.12;
  if (Math.random() < dt * 10) {
    spawnParticles(480 + rand(-60, 60), 556, 1, 'rgba(150,150,160,0.35)',
      { speed: 26, life: 1.1, size: 4, grav: -14 });
  }
}

/* ---- ۹-۴) رسم ---- */
/* ستاره‌های ثابت شب (دeterministic) */
const DRV_STARS = Array.from({ length: 46 }, (_, i) => ({
  x: (i * 197.3) % W, y: 20 + ((i * 83.7) % 140), r: 0.7 + ((i * 31) % 10) / 12,
}));

function renderDrive() {
  const D = DRV;
  const t3 = TR.phase === 3;

  /* --- آسمان شب + ماه + افق شهر (پارالاکسِ بسیار کند) --- */
  const g = ctx.createLinearGradient(0, -20, 0, DRV.HOR + 30);
  g.addColorStop(0, '#04081a'); g.addColorStop(0.7, '#0c142e'); g.addColorStop(1, '#18233f');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, DRV.HOR + 50);
  for (const s of DRV_STARS) {
    const tw = 0.5 + 0.5 * Math.sin(animTime * 1.7 + s.x);
    ctx.fillStyle = 'rgba(230,238,252,' + (0.3 + 0.45 * tw).toFixed(2) + ')';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#efe6c4'; circle(150, 64, 24);
  ctx.fillStyle = 'rgba(120,110,80,0.25)'; circle(142, 58, 5); circle(158, 72, 3.6);
  /* افق شهر دور — با پیشرفت مسیر می‌گذرد */
  const off = D.T * 0.0011, m = W + 80;
  ctx.fillStyle = '#0a1022';
  for (const b of SKYLINE) {
    const sx = (((b.x - off) % m) + m) % m - 40;
    ctx.fillRect(sx, DRV.HOR - 4 - b.h * 0.4, b.w, b.h * 0.4 + 6);
  }
  /* مهِ انبارها روی افق (فصل ۲ در راه است) */
  const fogA = t3 ? 0.55 + 0.45 * clamp(TR.t / 2.6, 0, 1) : 0.42;
  const fg = ctx.createLinearGradient(0, DRV.HOR - 26, 0, DRV.HOR + 92);
  fg.addColorStop(0, 'rgba(148,160,178,' + fogA.toFixed(2) + ')');
  fg.addColorStop(1, 'rgba(148,160,178,0)');
  ctx.fillStyle = fg; ctx.fillRect(-20, DRV.HOR - 26, W + 40, 120);

  /* --- زمینِ کنار جاده (تیره) --- */
  const gg = ctx.createLinearGradient(0, DRV.HOR, 0, H);
  gg.addColorStop(0, '#0d1116'); gg.addColorStop(1, '#171b20');
  ctx.fillStyle = gg; ctx.fillRect(-20, DRV.HOR - 2, W + 40, H - DRV.HOR + 24);

  /* --- قطعه‌های جاده (نزدیک → دور رسم می‌شوند؛ ذوزنقه‌ها) --- */
  const k0 = Math.max(0, Math.floor((D.T - 200) / DRV.SEG));
  const KN = 46;
  for (let k = k0 + KN; k >= k0; k--) {
    const z1 = Math.max(52, k * DRV.SEG - D.T);
    const z2 = Math.max(52, (k + 1) * DRV.SEG - D.T);
    if (z1 > 24000) continue;
    const y1 = drvY(z1), y2 = drvY(z2);
    const x1 = drvX(roadCX(k), z1), w1 = drvRW(z1);
    const x2 = drvX(roadCX(k + 1), z2), w2 = drvRW(z2);
    /* آسفالتِ متناوب */
    ctx.fillStyle = (k % 2 === 0) ? '#26292f' : '#22252a';
    ctx.beginPath();
    ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 + w1, y1);
    ctx.lineTo(x2 + w2, y2); ctx.lineTo(x2 - w2, y2);
    ctx.closePath(); ctx.fill();
    /* شانه‌های قرمز/سفید (rumble) */
    if (z1 < 9000) {
      ctx.fillStyle = (k % 2 === 0) ? '#c9463d' : '#d8d3c6';
      const rw1 = Math.max(2, w1 * 0.055), rw2 = Math.max(1.4, w2 * 0.055);
      ctx.beginPath();
      ctx.moveTo(x1 - w1, y1); ctx.lineTo(x1 - w1 + rw1, y1);
      ctx.lineTo(x2 - w2 + rw2, y2); ctx.lineTo(x2 - w2, y2);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x1 + w1, y1); ctx.lineTo(x1 + w1 - rw1, y1);
      ctx.lineTo(x2 + w2 - rw2, y2); ctx.lineTo(x2 + w2, y2);
      ctx.closePath(); ctx.fill();
    }
    /* خط‌چین وسط + خطوط لاین‌ها */
    if (k % 2 === 0 && z1 < 12000) {
      ctx.fillStyle = 'rgba(232,217,138,0.85)';
      for (const lx of [-0.33, 0, 0.33]) {
        const c1 = x1 + w1 * lx, c2 = x2 + w2 * lx;
        const lw1 = Math.max(1.2, w1 * 0.012), lw2 = Math.max(0.8, w2 * 0.012);
        ctx.beginPath();
        ctx.moveTo(c1 - lw1, y1); ctx.lineTo(c1 + lw1, y1);
        ctx.lineTo(c2 + lw2, y2); ctx.lineTo(c2 - lw2, y2);
        ctx.closePath(); ctx.fill();
      }
    }
    /* محوِ دور در مه */
    if (z1 > 6000) {
      const a = clamp((z1 - 6000) / 9000, 0, 0.9);
      ctx.fillStyle = 'rgba(148,160,178,' + a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.moveTo(x1 - w1 * 1.4, y1); ctx.lineTo(x1 + w1 * 1.4, y1);
      ctx.lineTo(x2 + w2 * 1.4, y2); ctx.lineTo(x2 - w2 * 1.4, y2);
      ctx.closePath(); ctx.fill();
    }
  }

  /* --- اجزای کنار جاده (درخت/تیرچراغ) — دور به نزدیک --- */
  for (let k = k0 + KN; k >= k0; k--) {
    const z = k * DRV.SEG + 300 - D.T;
    if (z < 90 || z > 21000) continue;
    const hsh = (k * 2654435761) % 1000;
    const side = (hsh % 2 === 0) ? -1 : 1;
    const y = drvY(z), ppu = drvPPU(z);
    /* درخت خشک */
    if (hsh % 3 === 0) {
      const wx = roadCX(k) + side * (DRV.ROADW + 300 + (hsh % 5) * 160);
      const sx = drvX(wx, z);
      const th = 620 * ppu;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(sx, y, Math.max(1.5, 130 * ppu), Math.max(0.6, 34 * ppu), 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#241d14'; ctx.lineWidth = Math.max(1, 60 * ppu);
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + side * 20 * ppu, y - th); ctx.stroke();
      ctx.strokeStyle = '#2c2418'; ctx.lineWidth = Math.max(0.8, 34 * ppu);
      ctx.beginPath();
      ctx.moveTo(sx + side * 10 * ppu, y - th * 0.6); ctx.lineTo(sx + side * 160 * ppu, y - th * 0.82);
      ctx.moveTo(sx + side * 8 * ppu, y - th * 0.75); ctx.lineTo(sx - side * 110 * ppu, y - th * 0.95);
      ctx.stroke();
    }
    /* تیر چراغ هر ۸ قطعه (سمت راست) */
    if (k % 8 === 0) {
      const wx = roadCX(k) + (DRV.ROADW + 150);
      const sx = drvX(wx, z);
      const ph = 760 * ppu;
      ctx.strokeStyle = '#3a4150'; ctx.lineWidth = Math.max(1, 44 * ppu);
      ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx, y - ph); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx, y - ph); ctx.lineTo(sx - 180 * ppu, y - ph); ctx.stroke();
      if (z < 9000) {
        const lx = sx - 180 * ppu, ly = y - ph;
        const a = (0.5 + 0.2 * Math.sin(animTime * 2.3 + k)) * clamp(1 - z / 9000, 0.1, 1);
        /* (۱۸٫۰) هاله از اسپرایت مشترکِ پیش‌پخته — بدون گرادیانِ هر فریم */
        const r = Math.max(6, 300 * ppu);
        const ga = ctx.globalAlpha;
        ctx.globalAlpha = ga * clamp(a * 0.8, 0, 1);
        ctx.drawImage(drvLampGlow(), lx - r, ly - r, r * 2, r * 2);
        ctx.globalAlpha = ga;
        ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(lx, ly, Math.max(1.2, 26 * ppu), 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* --- آیتم مخفی: ستون نور + جعبه‌ی درخشان کنار جاده --- */
  const HI = D.hidden;
  if (HI && !HI.got) {
    const z = HI.T - D.T;
    if (z > 60 && z < 20000) {
      const wx = roadCXf(HI.T) + HI.lane * 880;
      const sx = drvX(wx, Math.max(60, z)), sy = drvY(Math.max(60, z));
      const ppu = drvPPU(Math.max(60, z));
      const col = ((GEAR[HI.id] || RARE[HI.id]) || {}).color || '#ffd873';
      /* ستون نور عمودی (از دور دیده می‌شود) */
      const bw = Math.max(3, 90 * ppu);
      const bg = ctx.createLinearGradient(0, sy, 0, DRV.HOR);
      bg.addColorStop(0, hexA(col, 0.5)); bg.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = bg;
      ctx.fillRect(sx - bw / 2, DRV.HOR + 2, bw, Math.max(4, sy - DRV.HOR));
      /* جعبه */
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
  }

  /* --- موانع و زامبی‌ها (دور → نزدیک) --- */
  const vis = [];
  for (const o of D.obs) {
    if (o.hit) continue;
    const z = o.k * DRV.SEG - D.T;
    if (z > 60 && z < 6400) vis.push({ o, z });
  }
  vis.sort((a, b) => b.z - a.z);
  for (const { o, z } of vis) drawDriveObs(o, z);

  /* --- نور چراغ‌های جلو روی آسفالت --- */
  {
    const zEnd = 2400;
    const cxE = drvX(roadCXf(D.T + zEnd), zEnd), wE = drvRW(zEnd) * 0.55;
    const cx0 = 480, w0 = 250;
    for (const dx of [-0.36, 0.36]) {
      ctx.fillStyle = 'rgba(255,238,170,0.09)';
      ctx.beginPath();
      ctx.moveTo(cx0 + dx * w0 - 60, 556); ctx.lineTo(cx0 + dx * w0 + 60, 556);
      ctx.lineTo(cxE + dx * wE + Math.max(4, wE * 0.3), drvY(zEnd));
      ctx.lineTo(cxE + dx * wE - Math.max(4, wE * 0.3), drvY(zEnd));
      ctx.closePath(); ctx.fill();
    }
  }

  /* --- ماشین بازیکن (نمای از پشت) + ارشان روی صندلی کمکی --- */
  drawDriveCar();

  /* --- خطوط سرعت در سرعت بالا --- */
  if (D.speed > 2750 && !t3) {
    ctx.strokeStyle = 'rgba(200,214,240,0.16)'; ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const yy = 300 + ((animTime * 900 + i * 97) % 240);
      const xx = (i % 2 === 0) ? 60 + i * 9 : W - 60 - i * 9;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx + (xx < W / 2 ? -26 : 26), yy + 34); ctx.stroke();
    }
  }

  /* --- فاز ۳: سیلوی انبارها در مه جلوتر --- */
  if (t3) {
    const k = clamp(TR.t / 3.0, 0, 1);
    const sw = 200 + k * 620, sh = 90 + k * 300;
    ctx.fillStyle = 'rgba(22,26,34,' + (0.75).toFixed(2) + ')';
    rr(W / 2 - sw / 2, DRV.HOR - sh + 14, sw, sh + 12, 8); ctx.fill();
    ctx.fillStyle = 'rgba(30,35,46,0.8)';
    for (let i = 0; i < 6; i++) {
      rr(W / 2 - sw / 2 + 14 + i * (sw - 28) / 6, DRV.HOR - sh + 22, (sw - 40) / 9, sh * 0.72, 4); ctx.fill();
    }
    /* چراغ‌های مه‌گرفته‌ی انبار */
    for (const lx of [-0.3, 0, 0.3]) {
      ctx.save();
      ctx.shadowColor = '#ffd873'; ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(255,216,115,' + (0.75 + 0.25 * Math.sin(animTime * 3 + lx * 9)).toFixed(2) + ')';
      circle(W / 2 + lx * sw * 0.8, DRV.HOR - sh * 0.45, 3 + k * 3);
      ctx.restore();
    }
  }
}

/* مانع/زامبی روبه‌رو (پرسپکتیو) */
function drawDriveObs(o, z) {
  const ppu = drvPPU(z);
  const sx = drvX(o.wx, z);
  const sy = drvY(z);
  const fade = clamp(1 - (z - 3200) / 3200, 0.25, 1);
  ctx.save();
  ctx.globalAlpha = fade;
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(sx, sy, Math.max(2, 170 * ppu), Math.max(0.8, 42 * ppu), 0, 0, Math.PI * 2);
  ctx.fill();

  if (o.type === 'zN' || o.type === 'zF' || o.type === 'zT') {
    /* زامبی روبه‌رو به ماشین می‌دود — بازوها به جلو */
    const cfgZ = o.type === 'zF'
      ? { w: 240, h: 210, body: '#6d8a4f', dark: '#55703c' }
      : o.type === 'zT'
        ? { w: 420, h: 285, body: '#4a5560', dark: '#38424c' }
        : { w: 300, h: 230, body: '#566b46', dark: '#42533a' };
    const s = ppu, w2 = cfgZ.w / 2;
    const run = animTime * 8 + o.k * 1.7;
    const bob = Math.abs(Math.sin(run)) * 16 * s;
    /* پاها (راه‌رفتن روبه‌رو) */
    ctx.strokeStyle = cfgZ.dark; ctx.lineWidth = Math.max(1.5, 46 * s); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx - 40 * s, sy - bob - 40 * s); ctx.lineTo(sx - 40 * s + Math.sin(run) * 60 * s, sy - bob);
    ctx.moveTo(sx + 40 * s, sy - bob - 40 * s); ctx.lineTo(sx + 40 * s - Math.sin(run) * 60 * s, sy - bob);
    ctx.stroke();
    /* بدن */
    ctx.fillStyle = cfgZ.body;
    rr(sx - w2 * s, sy - bob - cfgZ.h * 0.62 * s, cfgZ.w * s, cfgZ.h * 0.5 * s, 30 * s); ctx.fill();
    ctx.fillStyle = cfgZ.dark;
    ctx.fillRect(sx - w2 * s, sy - bob - cfgZ.h * 0.24 * s, cfgZ.w * s, 26 * s);
    /* بازوهای دراز به سمت ماشین */
    ctx.strokeStyle = cfgZ.body; ctx.lineWidth = Math.max(1.2, 38 * s);
    ctx.beginPath();
    ctx.moveTo(sx - w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
    ctx.lineTo(sx - w2 * s * 0.8 - 90 * s, sy - bob - cfgZ.h * 0.42 * s + Math.sin(run * 2) * 26 * s);
    ctx.moveTo(sx + w2 * s * 0.8, sy - bob - cfgZ.h * 0.52 * s);
    ctx.lineTo(sx + w2 * s * 0.8 + 90 * s, sy - bob - cfgZ.h * 0.42 * s - Math.sin(run * 2) * 26 * s);
    ctx.stroke();
    /* سر + چشم‌های سرخ */
    const hr = cfgZ.w * 0.19 * s;
    const hy = sy - bob - cfgZ.h * 0.78 * s;
    ctx.fillStyle = cfgZ.body; ctx.beginPath(); ctx.arc(sx, hy, hr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#97b06b'; ctx.beginPath(); ctx.arc(sx, hy + hr * 0.15, hr * 0.7, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ff4b3e';
    circle(sx - hr * 0.42, hy - hr * 0.12, Math.max(0.8, hr * 0.16));
    circle(sx + hr * 0.42, hy - hr * 0.12, Math.max(0.8, hr * 0.16));
  } else if (o.type === 'rock') {
    const s = ppu;
    ctx.fillStyle = '#4c525a';
    ctx.beginPath();
    ctx.moveTo(sx - 230 * s, sy);
    ctx.lineTo(sx - 150 * s, sy - 200 * s);
    ctx.lineTo(sx - 20 * s, sy - 210 * s);
    ctx.lineTo(sx + 140 * s, sy - 140 * s);
    ctx.lineTo(sx + 230 * s, sy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5d646d';
    ctx.beginPath();
    ctx.moveTo(sx - 150 * s, sy - 200 * s); ctx.lineTo(sx - 20 * s, sy - 210 * s);
    ctx.lineTo(sx - 60 * s, sy - 120 * s); ctx.closePath(); ctx.fill();
  } else if (o.type === 'barrel') {
    const s = ppu;
    ctx.fillStyle = '#7a4a28';
    rr(sx - 150 * s, sy - 330 * s, 300 * s, 330 * s, 26 * s); ctx.fill();
    ctx.fillStyle = '#e8a13c';
    ctx.fillRect(sx - 150 * s, sy - 260 * s, 300 * s, 40 * s);
    ctx.fillRect(sx - 150 * s, sy - 130 * s, 300 * s, 40 * s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(sx - 150 * s, sy - 220 * s, 300 * s, 8 * s);
  } else if (o.type === 'wreck') {
    const s = ppu;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(sx, sy, 380 * s, 60 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2f38';
    rr(sx - 350 * s, sy - 190 * s, 700 * s, 150 * s, 40 * s); ctx.fill();
    ctx.fillStyle = '#22262e';
    rr(sx - 210 * s, sy - 300 * s, 420 * s, 120 * s, 40 * s); ctx.fill();
    ctx.fillStyle = 'rgba(120,140,170,0.25)';
    rr(sx - 170 * s, sy - 280 * s, 340 * s, 70 * s, 20 * s); ctx.fill();
    ctx.fillStyle = '#15181f';
    circle(sx - 230 * s, sy - 20 * s, 80 * s); circle(sx + 230 * s, sy - 20 * s, 80 * s);
  }
  ctx.restore();
}

/* (۱۸٫۰) اسپرایت پیش‌پخته‌ی هاله‌ی تیرچراغ‌های جاده */
let _lampGlow = null;
function drvLampGlow() {
  if (_lampGlow) return _lampGlow;
  const c = document.createElement('canvas');
  c.width = 96; c.height = 96;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(48, 48, 2, 48, 48, 46);
  rg.addColorStop(0, 'rgba(255,220,140,1)');
  rg.addColorStop(0.45, 'rgba(255,214,130,0.35)');
  rg.addColorStop(1, 'rgba(255,220,140,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 96, 96);
  _lampGlow = c;
  return c;
}

/* (۱۸٫۰) اسپرایت پیش‌پخته‌ی هاله‌ی چراغ عقب — بدون shadowBlur هر فریم */
let _tailGlow = null;
function drvTailGlow() {
  if (_tailGlow) return _tailGlow;
  const c = document.createElement('canvas');
  c.width = 64; c.height = 44;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 22, 3, 32, 22, 24);
  rg.addColorStop(0, 'rgba(255,70,55,0.9)');
  rg.addColorStop(0.5, 'rgba(255,58,46,0.35)');
  rg.addColorStop(1, 'rgba(255,58,46,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 64, 44);
  _tailGlow = c;
  return c;
}

/* ماشین بازیکن — نمای از پشت؛ (۱۸٫۰) بازیکن پشت فرمان در سمت چپ
   (راننده در ایران چپ می‌نشیند) و ارشانِ کلاه‌قرمز صندلی کمکی راست */
function drawDriveCar() {
  const D = DRV;
  const lean = clamp(D.steer, -1, 1) * 22;
  const cx = 480 + lean * 0.7;
  const cy = 554;
  const bob = Math.sin(animTime * 16) * 1.2;
  const braking = D.brake;
  const off = D.offroad > 0.25;

  ctx.save();
  ctx.translate(cx, cy + bob);
  ctx.rotate(clamp(D.steer, -1, 1) * 0.03);

  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(0, -4, 128, 15, 0, 0, Math.PI * 2); ctx.fill();

  /* چرخ‌های عقب (بیرون‌زده) */
  for (const wx of [-116, 116]) {
    ctx.fillStyle = '#15181f'; rr(wx - 17, -34, 34, 40, 8); ctx.fill();
    ctx.fillStyle = '#2a2f38'; rr(wx - 11, -26, 22, 24, 6); ctx.fill();
  }

  /* بدنه‌ی عقب — قرمز آتشین (هم‌خانواده‌ی drawCar) */
  const bg = ctx.createLinearGradient(0, -96, 0, 0);
  bg.addColorStop(0, '#ff7a4d'); bg.addColorStop(0.5, '#e8563f'); bg.addColorStop(1, '#b23a30');
  ctx.fillStyle = bg; rr(-120, -74, 240, 68, 16); ctx.fill();
  ctx.fillStyle = 'rgba(20,16,20,0.9)'; rr(-120, -26, 240, 14, 6); ctx.fill();

  /* شیشه‌ی عقب + دو سر (بازیکن / ارشان با کلاه قرمز) */
  ctx.fillStyle = '#8f2c22';
  rr(-96, -132, 192, 62, 14); ctx.fill();
  ctx.fillStyle = 'rgba(150,205,255,0.34)';
  rr(-84, -124, 168, 46, 10); ctx.fill();
  /* سر بازیکن (راننده — چپ) */
  ctx.fillStyle = '#f0c49a'; circle(-52, -104, 13);
  ctx.fillStyle = '#2c3550';
  ctx.beginPath(); ctx.arc(-52, -106, 13.6, Math.PI, Math.PI * 2); ctx.fill();
  /* سر ارشان (صندلی کمکی — راست) + کلاه قرمزش */
  const nod = Math.sin(animTime * 3.1) * 2;
  ctx.fillStyle = '#f0c49a'; circle(52 + nod, -104, 13);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(52 + nod, -106, 14, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(36 + nod, -107, 32, 4);

  /* اسپویلر */
  ctx.fillStyle = '#8a2f26'; rr(-116, -148, 232, 10, 4); ctx.fill();
  ctx.fillStyle = '#3c4250';
  ctx.fillRect(-104, -140, 10, 18); ctx.fillRect(94, -140, 10, 18);

  /* چراغ‌های عقب — با ترمز روشن‌تر (۱۸٫۰: هاله از اسپرایت پیش‌پخته،
     بدون shadowBlur — کارایی روی گوشی) */
  const tl = braking ? 1 : 0.55;
  const gl = drvTailGlow();
  for (const lx of [-96, 96]) {
    const s = braking ? 1.35 : 0.85;
    ctx.globalAlpha = braking ? 0.75 : 0.3;
    ctx.drawImage(gl, lx - 32 * s, -72 - 12 * s, 64 * s, 44 * s);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,70,55,' + tl.toFixed(2) + ')';
    rr(lx - 16, -60, 32, 17, 5); ctx.fill();
  }
  /* چراغ سوم (بالای شیشه) */
  ctx.fillStyle = braking ? '#ff6a5a' : '#7a2f26';
  rr(-30, -140, 60, 7, 3); ctx.fill();

  /* سپر + پلاک */
  ctx.fillStyle = '#cfd6e4'; rr(-120, -14, 240, 12, 5); ctx.fill();
  ctx.fillStyle = '#e8e4d0'; rr(-26, -12, 52, 10, 2); ctx.fill();
  ctx.fillStyle = '#3a4252'; ctx.font = 'bold 7px Tahoma'; ctx.textAlign = 'center';
  ctx.fillText('۲۸-بقا', 0, -4);

  /* اگزوزها */
  for (const ex of [-74, 74]) {
    ctx.fillStyle = '#454b57'; rr(ex - 9, -6, 18, 8, 3); ctx.fill();
    ctx.fillStyle = 'rgba(140,140,150,0.5)'; circle(ex, -2, 3.4);
  }
  ctx.restore();

  /* غبار شانه‌ی جاده */
  if (off && Math.random() < 0.5) {
    spawnParticles(cx + rand(-110, 110), 552, 1, 'rgba(120,104,78,0.45)',
      { speed: 70, life: 0.5, size: 3, grav: 300, up: true });
  }
}
