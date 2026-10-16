/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — منوی اصلی جدید (بازسازی کامل)
   (۳۰٫۰) روشن‌تر: آسمان/ماه/زمین روشن‌تر + وینیت ملایم‌تر — درخواست کاربر
   (۳۰٫۰) زامبی‌های پس‌زمینه: بازطراحی ترسناک — بدن خمیده‌ی بزرگ،
      فک باز با دندان، چشم سرخ تابان، چنگال، لبه‌ی پارگی لباس،
      قدم لکنت‌دار؛ به‌جای رفت‌وآمدِ رفت‌وبرگشتیِ مضحک، به‌سوی برج
      خزیده و آنجا توقف/تکان می‌خورند (محاصره‌ی خبیث)
   صحنه‌ی سینمایی Canvas به‌جای رندر دنیای بازی:
     · ماه خونی بزرگ + ابرهای عبوری + ستاره‌های چشمک‌زن
     · افق شهری دو لایه (سایه‌وار) + بازتاب ماه روی زمین خیس
     · ساختمان سه‌طبقه‌ی قهرمانِ قاب: سایه با نماهای ۲.۵بعدی،
       پنجره‌های گرمِ سوسوزن، درِ تخته‌کوبی‌شده، نور ریخته روی زمین
     · مه‌ی دونده + زامبی‌های سایه‌وار با چشم‌های سرخ (عمق‌دار)
     · اخگرهای معلق + رعدوبرق گاه‌به‌گاه + وینیت
   رابط DOM: دکمه‌های خیلی بزرگ لمسی (در v3_part1 بازسازی شد)
   ================================================================== */

const M23 = {
  t: 0, inited: false,
  stars: [], wisps: [], zmb: [], embers: [], fogA: [], fogB: [],
  bolt: { next: 7, t: -1, x: 0 },
  _press: { x: 0, y: 0, t: 0 },   // لمس/موس → پارالاکس ملایم

  init() {
    if (this.inited) return;
    this.inited = true;
    /* ستاره‌ها — ثابت با seed */
    let s = 1234567;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    this.stars = [];
    for (let i = 0; i < 84; i++) {
      this.stars.push({ x: rnd() * W, y: rnd() * 250, r: 0.5 + rnd() * 1.3, ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.8 });
    }
    /* ابرهای عبوری ماه */
    this.wisps = [];
    for (let i = 0; i < 5; i++) {
      this.wisps.push({ x: rnd() * W, y: 60 + rnd() * 120, w: 130 + rnd() * 210, h: 10 + rnd() * 16, v: 2.5 + rnd() * 3.5, a: 0.10 + rnd() * 0.14 });
    }
    /* زامبی‌های سایه‌وار — عمق‌دار (d=0.46..1.12) — (۳۰) چندتا درشت‌تر برای ترس */
    this.zmb = [];
    const zs = [
      { d: 0.5, x0: 0.13, ty: 'tank' }, { d: 0.66, x0: 0.86, ty: 'normal' },
      { d: 0.8, x0: 0.3, ty: 'normal' }, { d: 0.95, x0: 0.68, ty: 'fast' },
      { d: 1.18, x0: 0.04, ty: 'normal' }, { d: 1.34, x0: 0.95, ty: 'tank' },
      { d: 1.5, x0: 0.55, ty: 'fast' },
    ];
    for (const z of zs) {
      this.zmb.push({
        d: z.d, ty: z.ty, x: z.x0 * W, ph: rnd() * 6.28,
        dir: (z.x0 < 0.4 ? 1 : -1), spd: 4.5 + rnd() * 3.5,
        stare: 0,           /* (۳۰) توقفِ خیرگی جلوی برج */
        hurt: rnd() * 6.28, /* (۳۰) لکنت راه‌رفتن */
      });
    }
    /* اخگرها */
    this.embers = [];
    for (let i = 0; i < 24; i++) {
      this.embers.push({ x: rnd() * W, y: GROUND_Y - rnd() * 200, v: 3 + rnd() * 7, sw: rnd() * 6.28, r: 0.7 + rnd() * 1.6, a: 0.25 + rnd() * 0.5 });
    }
    /* دو نوار مه */
    this.fogA = []; this.fogB = [];
    for (let i = 0; i < 9; i++) this.fogA.push({ x: rnd() * W, y: GROUND_Y - 26 - rnd() * 30, w: 170 + rnd() * 240, v: 4 + rnd() * 5, a: 0.05 + rnd() * 0.05 });
    for (let i = 0; i < 8; i++) this.fogB.push({ x: rnd() * W, y: GROUND_Y + 8 + rnd() * 26, w: 220 + rnd() * 300, v: 8 + rnd() * 8, a: 0.07 + rnd() * 0.06 });
  },

  update(dt) {
    this.init();
    this.t += dt;
    const px = this._press.x, py = this._press.y;
    for (const s of this.stars) s.ph += dt * s.sp;
    for (const w of this.wisps) { w.x += w.v * dt; if (w.x - w.w > W) w.x = -w.w; }
    for (const z of this.zmb) {
      z.ph += dt * (1.1 + z.d * 0.9);
      z.hurt += dt * 2.2;
      const bx = W * 0.34;
      /* (۳۰) محاصره‌ی خبیث: به‌سوی برج می‌خزد؛ نزدیک که شد می‌ایستد و
         با لکنت خیره می‌شود — بعد از مدتی دوباره از بیرون قاب می‌آید */
      if (z.stare > 0) {
        z.stare -= dt;
        if (z.stare <= 0) {
          const side = Math.random() < 0.5 ? -1 : 1;
          z.x = side < 0 ? -60 - rnd(120) : W + 60 + rnd(120);
          z.dir = side < 0 ? 1 : -1;
        }
      } else {
        /* خزش لکنت‌دار — سرعت نامنظم */
        const limp = 0.55 + 0.45 * Math.abs(Math.sin(z.hurt));
        z.x += z.dir * z.spd * z.d * limp * dt;
        if (Math.abs(z.x - bx) < 120 * z.d + 40) {
          z.stare = 5 + rnd(6);
          z.dir = z.x < bx ? 1 : -1;   /* رو به برج بایستد */
        }
        if (z.x < -100) { z.x = -100; z.dir = 1; }
        if (z.x > W + 100) { z.x = W + 100; z.dir = -1; }
      }
    }
    for (const e of this.embers) {
      e.y -= e.v * dt; e.sw += dt * 1.7; e.x += Math.sin(e.sw) * 0.35;
      if (e.y < 160) { e.y = GROUND_Y - rand(-4, 30); e.x = rand(0, W); }
    }
    for (const f of this.fogA) { f.x += f.v * dt; if (f.x - f.w > W) f.x = -f.w; }
    for (const f of this.fogB) { f.x += f.v * dt; if (f.x - f.w > W) f.x = -f.w; }
    /* رعدوبرق */
    this.bolt.t -= dt;
    if (this.bolt.t < -this.bolt.next) { this.bolt.t = 0.30; this.bolt.next = 6 + rand(3, 9); this.bolt.x = rand(W * 0.2, W * 0.8); }
    void px; void py;
  },

  /* پارالاکس با موقعیت اشاره‌گر */
  pointer(x, y) { this._press.x = (x - W / 2) / W; this._press.y = (y - 260) / H; },

  draw() {
    this.init();
    const t = this.t;
    const par = this._press.x, parY = this._press.y;
    const flash = this.bolt.t > 0 ? Math.max(0, this.bolt.t / 0.30) : 0;

    /* --- ۱) آسمان — (۳۰) روشن‌تر --- */
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#0b1026');
    sky.addColorStop(0.55, '#131838');
    sky.addColorStop(0.85, '#261a38');
    sky.addColorStop(1, '#3a2446');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND_Y + 2);
    if (flash > 0) { ctx.fillStyle = 'rgba(170,190,245,' + (0.2 * flash) + ')'; ctx.fillRect(0, 0, W, GROUND_Y); }

    /* --- ۲) ستاره‌ها --- */
    for (const s of this.stars) {
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(s.ph));
      ctx.fillStyle = 'rgba(214,222,255,' + (0.34 * tw).toFixed(2) + ')';
      ctx.fillRect(s.x + par * -4, s.y, s.r, s.r);
    }

    /* --- ۳) ماه خونی — (۳۰) هاله‌ی قوی‌تر و روشن‌تر --- */
    const mx = W * 0.72 + par * -9, my = 112 + parY * -5, mr = 64;
    const mg = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.4);
    mg.addColorStop(0, 'rgba(255,150,95,0.42)');
    mg.addColorStop(0.4, 'rgba(255,125,85,0.16)');
    mg.addColorStop(1, 'rgba(255,110,70,0)');
    ctx.fillStyle = mg; circle(mx, my, mr * 3.4);
    const moon = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.2, mx, my, mr);
    moon.addColorStop(0, '#ffe8c2');
    moon.addColorStop(0.55, '#f7b070');
    moon.addColorStop(1, '#d67c48');
    ctx.fillStyle = moon; circle(mx, my, mr);
    /* دهانه‌های ماه */
    ctx.fillStyle = 'rgba(120,55,30,0.30)';
    circle(mx - 18, my - 12, 9); circle(mx + 14, my + 8, 13); circle(mx + 26, my - 20, 6); circle(mx - 8, my + 22, 7);
    /* ابرهای عبوری */
    for (const w of this.wisps) {
      ctx.fillStyle = 'rgba(10,10,22,' + w.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(w.x + par * -6, w.y, w.w / 2, w.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- ۴) افق شهری دو لایه --- */
    let s2 = 777;
    const rd = () => { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x7fffffff; };
    const skyline = (yBase, hMin, hMax, col, step, off) => {
      ctx.fillStyle = col;
      let x = -30;
      let i = 0;
      while (x < W + 30) {
        const bw = 46 + rd() * 60;
        const bh = hMin + rd() * hMax;
        ctx.fillRect(x + off, yBase - bh, bw, bh);
        /* چند پنجره‌ی روشنِ نادر در افق */
        if (rd() < 0.16) {
          ctx.fillStyle = 'rgba(255,190,110,0.20)';
          ctx.fillRect(x + off + bw * 0.3, yBase - bh + 12, 3, 4);
          ctx.fillStyle = col;
        }
        x += bw + 8 + rd() * 26; i++;
        if (i > 60) break;
      }
    };
    skyline(GROUND_Y + 2, 44, 120, '#0d0f20', 0, par * -7);
    skyline(GROUND_Y + 2, 26, 70, '#080a15', 0, par * -14);

    /* --- ۵) زمین + بازتاب ماه — (۳۰) روشن‌تر --- */
    const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gr.addColorStop(0, '#181c2c');
    gr.addColorStop(0.5, '#201a2a');
    gr.addColorStop(1, '#2a2032');
    ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    const refl = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    refl.addColorStop(0, 'rgba(255,150,95,0.2)');
    refl.addColorStop(0.45, 'rgba(255,130,80,0.08)');
    refl.addColorStop(1, 'rgba(255,110,60,0)');
    ctx.fillStyle = refl;
    ctx.fillRect(mx - mr * 1.5, GROUND_Y, mr * 3, H - GROUND_Y);
    /* خط زمین */
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, GROUND_Y, W, 3);

    /* --- ۶) ساختمان سه‌طبقه‌ی قهرمان (سایه + ۲.۵بعدی) --- */
    this.drawBuilding(W * 0.34 + par * -16, t, flash);

    /* --- ۷) مه‌ی پشتی --- */
    for (const f of this.fogA) {
      ctx.fillStyle = 'rgba(122,140,190,' + f.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.w / 2, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- ۸) زامبی‌های سایه‌وار --- */
    for (const z of this.zmb) this.drawSilZombie(z, t, flash);

    /* --- ۹) مه‌ی جلویی --- */
    for (const f of this.fogB) {
      ctx.fillStyle = 'rgba(134,152,200,' + f.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y, f.w / 2, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* --- ۱۰) اخگرها --- */
    for (const e of this.embers) {
      const fl = 0.6 + 0.4 * Math.sin(e.sw * 2.2);
      ctx.fillStyle = 'rgba(255,' + Math.round(150 + 70 * fl) + ',90,' + (e.a * fl).toFixed(2) + ')';
      ctx.fillRect(e.x, e.y, e.r, e.r);
    }

    /* --- ۱۱) برق: فلش + لرزش نور --- */
    if (flash > 0) {
      ctx.fillStyle = 'rgba(190,205,255,' + (0.10 * flash) + ')';
      ctx.fillRect(0, 0, W, H);
      /* رگه‌ی برق */
      ctx.strokeStyle = 'rgba(220,232,255,' + (0.75 * flash) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let bx = this.bolt.x, by = 0;
      ctx.moveTo(bx, by);
      while (by < 200) { bx += rand(-26, 26); by += rand(22, 44); ctx.lineTo(bx, by); }
      ctx.stroke();
    }

    /* --- ۱۲) وینیت + گرادیان پایین — (۳۰) خیلی ملایم‌تر: صفحه روشن می‌ماند --- */
    const vg = ctx.createRadialGradient(W / 2, H * 0.44, H * 0.42, W / 2, H * 0.5, W * 0.68);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(4,6,16,0.30)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const bt = ctx.createLinearGradient(0, H - 120, 0, H);
    bt.addColorStop(0, 'rgba(10,12,24,0)');
    bt.addColorStop(1, 'rgba(10,12,24,0.42)');
    ctx.fillStyle = bt; ctx.fillRect(0, H - 120, W, 120);
  },

  /* ساختمان قهرمانِ منو — سایه‌ی تیره با نما/ضلع ۲.۵بعدی و پنجره‌های گرم */
  drawBuilding(bx, t, flash) {
    const bw = 152, fh = 66, by = GROUND_Y;
    const top = by - fh * 3;
    const warm = 0.8 + 0.2 * Math.sin(t * 2.1) * Math.sin(t * 0.7 + 1.3);
    ctx.save();
    /* سایه‌ی بلندِ روی زمین به سمت مقابل ماه */
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2, by + 2);
    ctx.lineTo(bx + bw / 2, by + 2);
    ctx.lineTo(bx + bw / 2 - 90, by + 26);
    ctx.lineTo(bx - bw / 2 - 130, by + 26);
    ctx.closePath(); ctx.fill();
    /* ضلع راست (عمق ۲.۵بعدی) */
    ctx.fillStyle = flash > 0 ? '#12142a' : '#0a0c1a';
    ctx.beginPath();
    ctx.moveTo(bx + bw / 2, by);
    ctx.lineTo(bx + bw / 2 + 26, by - 10);
    ctx.lineTo(bx + bw / 2 + 26, top - 10);
    ctx.lineTo(bx + bw / 2, top);
    ctx.closePath(); ctx.fill();
    /* نمای اصلی */
    const fg = ctx.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0);
    fg.addColorStop(0, '#131730');
    fg.addColorStop(0.6, '#101328');
    fg.addColorStop(1, '#0c0e20');
    ctx.fillStyle = flash > 0 ? '#1b1f3c' : fg;
    ctx.fillRect(bx - bw / 2, top, bw, fh * 3);
    /* کتنه‌ی بام */
    ctx.fillStyle = flash > 0 ? '#232848' : '#181c38';
    ctx.fillRect(bx - bw / 2 - 7, top - 9, bw + 14, 10);
    ctx.fillRect(bx + bw / 2 + 19, top - 17, 12, 10);
    /* آنتن */
    ctx.strokeStyle = '#2a3050'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2 + 18, top - 9); ctx.lineTo(bx - bw / 2 + 18, top - 42);
    ctx.moveTo(bx - bw / 2 + 10, top - 30); ctx.lineTo(bx - bw / 2 + 18, top - 42);
    ctx.moveTo(bx - bw / 2 + 26, top - 30); ctx.lineTo(bx - bw / 2 + 18, top - 42);
    ctx.stroke();
    /* چراغ قرمزِ آنتن — چشمک */
    const bl = (Math.sin(t * 2.4) > 0.2) ? 0.9 : 0.25;
    ctx.fillStyle = 'rgba(255,70,60,' + bl + ')';
    circle(bx - bw / 2 + 18, top - 44, 2.6);
    ctx.fillStyle = 'rgba(255,70,60,' + (bl * 0.25) + ')';
    circle(bx - bw / 2 + 18, top - 44, 7);

    /* پنجره‌های طبقه‌ها — تیره‌ها و روشنِ سوسوزن */
    const win = (wx, wy, ww, wh, lit) => {
      if (lit > 0) {
        const g2 = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        g2.addColorStop(0, 'rgba(255,196,110,' + (0.88 * lit) + ')');
        g2.addColorStop(1, 'rgba(226,140,60,' + (0.66 * lit) + ')');
        ctx.fillStyle = g2;
        rr(wx, wy, ww, wh, 2); ctx.fill();
        /* صلیبِ پنجره */
        ctx.strokeStyle = 'rgba(20,16,10,0.8)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
        ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
        ctx.stroke();
        /* هاله */
        const hg = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 2, wx + ww / 2, wy + wh / 2, 46);
        hg.addColorStop(0, 'rgba(255,170,80,' + (0.14 * lit) + ')');
        hg.addColorStop(1, 'rgba(255,170,80,0)');
        ctx.fillStyle = hg; circle(wx + ww / 2, wy + wh / 2, 46);
      } else {
        ctx.fillStyle = '#070810';
        rr(wx, wy, ww, wh, 2); ctx.fill();
        ctx.strokeStyle = '#1e2340'; ctx.lineWidth = 1.2;
        rr(wx, wy, ww, wh, 2); ctx.stroke();
      }
    };
    /* طبقه‌ی سوم — دیده‌بانی: یک پنجره روشن */
    win(bx - bw / 2 + 18, top + 12, 30, 38, warm);
    win(bx + bw / 2 - 48, top + 12, 30, 38, 0);
    /* طبقه‌ی دوم — انبار: دو پنجره، یکی کم‌سو */
    win(bx - bw / 2 + 18, top + fh + 12, 30, 38, warm * 0.5);
    win(bx + bw / 2 - 48, top + fh + 12, 30, 38, 0.15 + 0.1 * Math.sin(t * 1.3));
    /* طبقه‌ی اول — دفاع: پنجره‌های تخته‌کوبی‌شده */
    const bwin = (wx) => {
      ctx.fillStyle = '#06070d'; rr(wx, by - fh + 12, 30, 38, 2); ctx.fill();
      ctx.strokeStyle = '#3a2f1e'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wx - 3, by - fh + 18); ctx.lineTo(wx + 33, by - fh + 14);
      ctx.moveTo(wx - 3, by - fh + 34); ctx.lineTo(wx + 33, by - fh + 38);
      ctx.stroke();
    };
    bwin(bx - bw / 2 + 18); bwin(bx + bw / 2 - 48);
    /* در ورودیِ تخته‌کوبی‌شده */
    ctx.fillStyle = '#0a0c14';
    rr(bx - 17, by - 46, 34, 46, 3); ctx.fill();
    ctx.strokeStyle = '#4a3a24'; ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(bx - 21, by - 38); ctx.lineTo(bx + 21, by - 30);
    ctx.moveTo(bx - 21, by - 16); ctx.lineTo(bx + 21, by - 22);
    ctx.stroke();
    /* نور گرم در محدوده‌ی در + پاشیدگی روی زمین */
    const dg = ctx.createRadialGradient(bx, by - 8, 4, bx, by - 8, 64);
    dg.addColorStop(0, 'rgba(255,180,90,' + (0.16 * warm) + ')');
    dg.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = dg; circle(bx, by - 8, 64);
    const sp = ctx.createRadialGradient(bx, by + 10, 6, bx, by + 10, 84);
    sp.addColorStop(0, 'rgba(255,170,80,' + (0.10 * warm) + ')');
    sp.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = sp; circle(bx, by + 10, 84);
    /* خطوط طبقات */
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - bw / 2, top + fh); ctx.lineTo(bx + bw / 2, top + fh);
    ctx.moveTo(bx - bw / 2, top + fh * 2); ctx.lineTo(bx + bw / 2, top + fh * 2);
    ctx.moveTo(bx + bw / 2, top + fh); ctx.lineTo(bx + bw / 2 + 26, top + fh - 10);
    ctx.moveTo(bx + bw / 2, top + fh * 2); ctx.lineTo(bx + bw / 2 + 26, top + fh * 2 - 10);
    ctx.stroke();
    ctx.restore();
  },

  /* (۳۰) زامبی سایه‌وارِ ترسناک — بدن خمیده‌ی بزرگ با فک باز و دندان،
     چشم‌های سرخِ تابان، چنگال‌های آویزان، لبه‌ی پارگی لباس، قدم لکنت‌دار.
     حالت «stare»: جلوی برج می‌ایستد، تاب می‌خورد و خیره می‌شود. */
  drawSilZombie(z, t, flash) {
    const d = z.d, x = z.x + this._press.x * -22 * d;
    const y = GROUND_Y + (d - 0.6) * 16;
    const s = d * (z.ty === 'tank' ? 1.5 : z.ty === 'fast' ? 1.12 : 1.3);
    const ph = z.ph;
    const stare = z.stare > 0;
    const bodyC = flash > 0.4 ? 'rgba(34,38,64,0.96)' : 'rgba(6,7,14,0.96)';
    const bodyC2 = flash > 0.4 ? 'rgba(44,48,78,0.96)' : 'rgba(12,13,24,0.96)';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(z.dir < 0 ? -s : s, s);
    /* سایه‌ی تیره‌تر زیر پا */
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, 2, 17, 4, 0, 0, Math.PI * 2); ctx.fill();
    /* کل بدن رو به برج خم می‌شود — هیکل خمیده‌ی زامبی */
    const hunch = stare ? 0.34 + Math.sin(t * 1.6 + ph) * 0.03 : 0.3 + Math.sin(ph) * 0.04;
    ctx.rotate(-hunch * 0.5);
    /* گام لکنت‌دار — پاها با زانوی خمیده و کف له‌شده */
    const lim = Math.sin(ph), lim2 = Math.sin(ph + Math.PI);
    const drag = z.hurt ? Math.sin(z.hurt) * 2.2 : 0;
    ctx.strokeStyle = bodyC; ctx.lineWidth = 6.8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, -15); ctx.lineTo(-5 + lim * 8, -2 + Math.abs(lim) * 1.6);
    ctx.moveTo(3.5, -15); ctx.lineTo(5 + lim2 * 8 + drag, -2 + Math.abs(lim2) * 1.6);
    ctx.stroke();
    /* بدن خمیده — بالاتنه به‌جلو خم شده، پهن و سنگین */
    ctx.fillStyle = bodyC;
    ctx.beginPath();
    ctx.moveTo(-9, -14);
    ctx.quadraticCurveTo(-11.5, -26, -6, -33);
    ctx.quadraticCurveTo(1, -38, 8, -33);
    ctx.quadraticCurveTo(12, -26, 10, -14);
    /* لبه‌ی پارگی لباس — دندانه‌های نامنظم پایین تنه */
    ctx.lineTo(7, -11); ctx.lineTo(5.5, -13.5); ctx.lineTo(3, -10.5);
    ctx.lineTo(0.5, -13); ctx.lineTo(-2, -10); ctx.lineTo(-4.5, -12.5); ctx.lineTo(-7, -10);
    ctx.closePath(); ctx.fill();
    /* لکه‌ی روشن‌ترِ پشت (حجم) */
    ctx.fillStyle = bodyC2;
    ctx.beginPath();
    ctx.moveTo(-6, -16); ctx.quadraticCurveTo(-8, -26, -4, -31);
    ctx.quadraticCurveTo(0, -34, 3, -31); ctx.quadraticCurveTo(5, -25, 3.5, -16);
    ctx.closePath(); ctx.fill();
    /* بازوهای بلندِ آویزان با چنگال — تاب غیرهمزمان */
    ctx.strokeStyle = bodyC; ctx.lineWidth = 5.4;
    ctx.beginPath();
    ctx.moveTo(-5, -29); ctx.quadraticCurveTo(-13, -22 + Math.sin(ph + 1.1) * 3, -15, -11 + Math.sin(ph + 1.1) * 2.4);
    ctx.moveTo(6, -30); ctx.quadraticCurveTo(13.5, -24 + Math.sin(ph + 2.2) * 3, 15.5, -13 + Math.sin(ph + 2.2) * 2.4);
    ctx.stroke();
    /* چنگال‌ها — سه انگشت خمیده */
    ctx.lineWidth = 2.1;
    const claw = (cx, cy, k) => {
      ctx.beginPath();
      for (let i = -1; i <= 1; i++) {
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + i * 2.4, cy + 2.2, cx + i * 3.1, cy + 4.6 + k);
      }
      ctx.stroke();
    };
    claw(-15, -11 + Math.sin(ph + 1.1) * 2.4, 0.8);
    claw(15.5, -13 + Math.sin(ph + 2.2) * 2.4, 0.8);
    /* سرِ کجِ به‌عقب — جمجمه با فک باز */
    const tilt = 0.22 + Math.sin(t * 0.9 + ph) * 0.05;
    ctx.save();
    ctx.translate(7.5, -34.5);
    ctx.rotate(tilt);
    ctx.fillStyle = bodyC;
    ctx.beginPath(); ctx.ellipse(0, -1.5, 6.4, 7, 0, 0, Math.PI * 2); ctx.fill();
    /* فک پایینِ باز — لِه‌شده به پایین */
    ctx.beginPath();
    ctx.moveTo(-4.5, 2.2);
    ctx.quadraticCurveTo(0.5, 7.8, 5, 3.4);
    ctx.quadraticCurveTo(3.4, 1.2, -4.5, 2.2);
    ctx.closePath(); ctx.fill();
    /* دندان‌های بالای فکِ باز */
    ctx.strokeStyle = 'rgba(210,214,226,0.85)'; ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const tx = -3.4 + i * 1.9;
      ctx.moveTo(tx, 1.6); ctx.lineTo(tx + 0.75, 3.4);
    }
    ctx.stroke();
    /* چشم‌های سرخِ تابان — گود افتاده با هاله‌ی خون */
    const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.8 + ph * 0.6));
    ctx.fillStyle = 'rgba(255,60,40,' + er.toFixed(2) + ')';
    circle(1.6, -3.4, 1.25); circle(4.6, -3.2, 1.25);
    ctx.fillStyle = 'rgba(255,60,40,' + (er * 0.26).toFixed(2) + ')';
    circle(3, -3.3, 5.4);
    ctx.restore();
    /* مهِ تیره دور پا — حضورِ مرده‌وار */
    ctx.fillStyle = 'rgba(24,28,44,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 1, 24, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
};

/* رسم صحنه‌ی منوی جدید — از render() صدا زده می‌شود */
function drawMenuScene23() { M23.draw(); }

/* پارالاکس منو با اشاره‌گر (قلاب از سیستم ورودی موجود) */
(function () {
  try {
    window.addEventListener('pointermove', (e) => {
      if (state && state.mode === 'start' && M23) {
        const r = (typeof canvas !== 'undefined' && canvas.getBoundingClientRect) ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
        if (r.width > 0) M23.pointer((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
      }
    }, { passive: true });
  } catch (e) {}
})();

/* ورود به منو → موسیقی منو (۲۳٫۰: شروعِ خودکار در اندروید با autoplay) */
function menu23Enter() {
  try { M23.init(); } catch (e) {}
  try { MUSIC.set('menu'); } catch (e) {}
  try { Snd.init(); Snd.resume(); } catch (e) {}
}
