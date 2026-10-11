/* ==================================================================
   سه طبقه تا مرگ — نسخه‌ی ۲۳٫۰ — منوی اصلی جدید (بازسازی کامل)
   ==================================================================
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
    /* زامبی‌های سایه‌وار — عمق‌دار (d=0.42..1.12) */
    this.zmb = [];
    const zs = [
      { d: 0.46, x0: 0.13, ty: 'tank' }, { d: 0.62, x0: 0.86, ty: 'normal' },
      { d: 0.78, x0: 0.30, ty: 'normal' }, { d: 0.9, x0: 0.68, ty: 'fast' },
      { d: 1.0, x0: 0.05, ty: 'normal' }, { d: 1.12, x0: 0.93, ty: 'tank' },
    ];
    for (const z of zs) {
      this.zmb.push({
        d: z.d, ty: z.ty, x: z.x0 * W, ph: rnd() * 6.28,
        dir: (z.x0 < 0.4 ? 1 : -1), spd: 5 + rnd() * 4,
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
      z.ph += dt * (1.6 + z.d * 1.8);
      z.x += z.dir * z.spd * z.d * dt;
      const bx = W * 0.34;
      if (Math.abs(z.x - bx) < 110 * z.d) z.dir *= -1;
      if (z.x < -80) { z.x = -80; z.dir = 1; }
      if (z.x > W + 80) { z.x = W + 80; z.dir = -1; }
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

    /* --- ۱) آسمان --- */
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#05060f');
    sky.addColorStop(0.55, '#0a0a1a');
    sky.addColorStop(0.85, '#170b18');
    sky.addColorStop(1, '#24101c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND_Y + 2);
    if (flash > 0) { ctx.fillStyle = 'rgba(150,170,235,' + (0.16 * flash) + ')'; ctx.fillRect(0, 0, W, GROUND_Y); }

    /* --- ۲) ستاره‌ها --- */
    for (const s of this.stars) {
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(s.ph));
      ctx.fillStyle = 'rgba(214,222,255,' + (0.34 * tw).toFixed(2) + ')';
      ctx.fillRect(s.x + par * -4, s.y, s.r, s.r);
    }

    /* --- ۳) ماه خونی --- */
    const mx = W * 0.72 + par * -9, my = 112 + parY * -5, mr = 62;
    const mg = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.4);
    mg.addColorStop(0, 'rgba(255,140,80,0.30)');
    mg.addColorStop(0.4, 'rgba(255,110,70,0.10)');
    mg.addColorStop(1, 'rgba(255,110,70,0)');
    ctx.fillStyle = mg; circle(mx, my, mr * 3.4);
    const moon = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.2, mx, my, mr);
    moon.addColorStop(0, '#ffd9a8');
    moon.addColorStop(0.55, '#f0a05c');
    moon.addColorStop(1, '#c96a3a');
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

    /* --- ۵) زمین + بازتاب ماه --- */
    const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gr.addColorStop(0, '#0c0e17');
    gr.addColorStop(0.5, '#12101a');
    gr.addColorStop(1, '#1a1420');
    ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    const refl = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    refl.addColorStop(0, 'rgba(255,140,80,0.14)');
    refl.addColorStop(0.45, 'rgba(255,120,70,0.05)');
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

    /* --- ۱۲) وینیت + گرادیان پایین --- */
    const vg = ctx.createRadialGradient(W / 2, H * 0.44, H * 0.38, W / 2, H * 0.5, W * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(2,3,8,0.55)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const bt = ctx.createLinearGradient(0, H - 120, 0, H);
    bt.addColorStop(0, 'rgba(5,6,14,0)');
    bt.addColorStop(1, 'rgba(5,6,14,0.72)');
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

  /* زامبی سایه‌وار با چشم سرخ و چرخه‌ی راه‌رفتن */
  drawSilZombie(z, t, flash) {
    const d = z.d, x = z.x + this._press.x * -22 * d;
    const y = GROUND_Y + (d - 0.6) * 16;
    const s = d * (z.ty === 'tank' ? 1.25 : z.ty === 'fast' ? 0.9 : 1.05);
    const ph = z.ph;
    const sway = Math.sin(ph) * 0.09;
    const bodyC = flash > 0.4 ? 'rgba(30,34,60,0.95)' : 'rgba(4,5,12,0.94)';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(z.dir < 0 ? -s : s, s);
    /* سایه‌ی زیر پا */
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 2, 13, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(sway * 0.5);
    /* پاها */
    ctx.strokeStyle = bodyC; ctx.lineWidth = 6.2; ctx.lineCap = 'round';
    ctx.beginPath();
    const l1 = Math.sin(ph) * 7, l2 = Math.sin(ph + Math.PI) * 7;
    ctx.moveTo(-2, -13); ctx.lineTo(-3 + l1, -1);
    ctx.moveTo(3, -13); ctx.lineTo(4 + l2, -1);
    ctx.stroke();
    /* بدن خمیده */
    ctx.fillStyle = bodyC;
    rr(-8, -27, 16, 15, 5); ctx.fill();
    /* بازوهای آویزان که تاب می‌خورند */
    ctx.strokeStyle = bodyC; ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(-6, -24); ctx.lineTo(-9 - Math.sin(ph) * 4, -13);
    ctx.moveTo(6, -24); ctx.lineTo(9 + Math.sin(ph + 1.4) * 4, -13);
    ctx.stroke();
    /* سرِ کج */
    ctx.fillStyle = bodyC;
    circle(2, -32, 5.4);
    /* چشم‌های سرخِ سوسوزن */
    const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.8 + ph * 0.6));
    ctx.fillStyle = 'rgba(255,60,40,' + er.toFixed(2) + ')';
    circle(3.4, -33, 1.1); circle(5.9, -33, 1.1);
    ctx.fillStyle = 'rgba(255,60,40,' + (er * 0.22).toFixed(2) + ')';
    circle(4.6, -33, 4.2);
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
