/* ==================================================================
   سه طبقه تا مرگ — v35 — وصله‌ی تکمیلی روی v34
   ==================================================================
   چرا: v34 همه‌ی ساختارها را داشت اما دو چیز «در عمل» شکست خورده بود:
     ۱) زامبی‌های منو همچنان کوچک/مسخره دیده می‌شدند و صحنه تاریک
        (بازخورد کاربر: «قیافشون مسخره هست... تا ترسناک» + «کمی روشنش کن»)
     ۲) زیر کاشی‌های سلاح‌ها هنوز متن بود («در دست ✅» و «🔒»)
        (بازخورد کاربر: «ایشون رو لازم نیست بنویسی»)
     ۳) معماها (رادیو/قفل/فیوز) هنذا در مودال وسط‌چینِ قدیمی باز
        می‌شدند — نه باتن‌شیت اندرویدی (بازخورد: «کلا بازسازی کن»)
   این ماژول:
     · M23 کامل را با زامبی‌های ترسناکِ درشت (فک باز + دندان + چنگال +
       چشم سرخ تابان + لباس پاره + لکنت) و پالت روشن‌تر جایگزین می‌کند
     · کاشی سلاح‌ها را بی‌متن می‌کند (آیکن + قیمت سکه‌ای + قفل + طلایی)
     · پوسته‌ی معماهای MYST را باتن‌شیت اندرویدی می‌کند (هم‌خانواده‌ی v34)
     · اسنک‌بار متریال برای بازخورد خرید مولوتوف
   ================================================================== */
(function v35boot() {
'use strict';
if (window.__V35) return;
window.__V35 = { zombies: 1, bright: 1, wpnTiles: 1, puzzleSheet: 1, snack: 1 };

/* ---------- ۳۵-۰) اسنک‌بار متریال ---------- */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '#snack35{position:absolute;bottom:calc(64px * var(--uiz,1));left:50%;transform:translateX(-50%) translateY(18px);' +
    'z-index:60;display:flex;align-items:center;gap:calc(9px * var(--uiz,1));' +
    'background:linear-gradient(180deg,#2b3150,#1a2038);border:1.5px solid #4d5f9e;' +
    'border-radius:calc(13px * var(--uiz,1));padding:calc(9px * var(--uiz,1)) calc(16px * var(--uiz,1));' +
    'font-size:calc(13px * var(--uiz,1));font-weight:800;color:#eef3ff;white-space:nowrap;' +
    'box-shadow:0 10px 34px rgba(0,0,0,.65),inset 0 1.5px 0 rgba(255,255,255,.1);' +
    'opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;font-family:inherit}' +
    '#snack35.show{opacity:1;transform:translateX(-50%) translateY(0)}' +
    '#wrap.menu-mode #snack35,#wrap.cine-mode #snack35{display:none!important}';
  document.head.appendChild(st);
})();
var _snackT35 = null;
function snack35(text) {
  var el = document.getElementById('snack35');
  if (!el) { el = document.createElement('div'); el.id = 'snack35'; document.getElementById('wrap').appendChild(el); }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(_snackT35);
  _snackT35 = setTimeout(function () { el.classList.remove('show'); }, 2100);
}

/* ---------- ۳۵-۱) M23 — زامبی‌های ترسناک + پالت روشن ----------
   بدن خمیده‌ی درشت با فک باز و دندان، چشم سرخ تابان، چنگال،
   لبه‌ی پارگی لباس، قدم لکنت‌دار؛ محاصره‌ی خبیث: به‌سوی برج
   می‌خزند و جلویش می‌ایستند و خیره می‌شوند. */
(function () {
  /* پیکربندی تازه: ۷ زامبی، تا مقیاس ۱٫۵ (درشت در پیش‌زمینه) */
  M23.init = function () {
    if (this.inited) return;
    this.inited = true;
    this.t = 0;
    var s = 1234567;
    var rnd = function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    this.stars = [];
    for (var i = 0; i < 84; i++) {
      this.stars.push({ x: rnd() * W, y: rnd() * 250, r: 0.5 + rnd() * 1.3, ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.8 });
    }
    this.wisps = [];
    for (var j = 0; j < 5; j++) {
      this.wisps.push({ x: rnd() * W, y: 60 + rnd() * 120, w: 130 + rnd() * 210, h: 10 + rnd() * 16, v: 2.5 + rnd() * 3.5, a: 0.10 + rnd() * 0.14 });
    }
    this.zmb = [];
    var zs = [
      { d: 0.5, x0: 0.13, ty: 'tank' }, { d: 0.66, x0: 0.86, ty: 'normal' },
      { d: 0.8, x0: 0.3, ty: 'normal' }, { d: 0.95, x0: 0.68, ty: 'fast' },
      { d: 1.18, x0: 0.04, ty: 'normal' }, { d: 1.34, x0: 0.95, ty: 'tank' },
      { d: 1.5, x0: 0.55, ty: 'fast' },
    ];
    for (var k = 0; k < zs.length; k++) {
      var z = zs[k];
      this.zmb.push({
        d: z.d, ty: z.ty, x: z.x0 * W, ph: rnd() * 6.28,
        dir: (z.x0 < 0.4 ? 1 : -1), spd: 4.5 + rnd() * 3.5,
        stare: 0, hurt: rnd() * 6.28,
      });
    }
    this.embers = [];
    for (var e = 0; e < 24; e++) {
      this.embers.push({ x: rnd() * W, y: GROUND_Y - rnd() * 200, v: 3 + rnd() * 7, sw: rnd() * 6.28, r: 0.7 + rnd() * 1.6, a: 0.25 + rnd() * 0.5 });
    }
    this.fogA = []; this.fogB = [];
    for (var a = 0; a < 9; a++) this.fogA.push({ x: rnd() * W, y: GROUND_Y - 26 - rnd() * 30, w: 170 + rnd() * 240, v: 4 + rnd() * 5, a: 0.05 + rnd() * 0.05 });
    for (var b = 0; b < 8; b++) this.fogB.push({ x: rnd() * W, y: GROUND_Y + 8 + rnd() * 26, w: 220 + rnd() * 300, v: 8 + rnd() * 8, a: 0.07 + rnd() * 0.06 });
  };

  /* حرکت: خزش لکنت‌دار به‌سوی برج + توقفِ خیرگی جلوی آن */
  M23.update = function (dt) {
    this.init();
    this.t += dt;
    for (var i = 0; i < this.stars.length; i++) this.stars[i].ph += dt * this.stars[i].sp;
    for (var w = 0; w < this.wisps.length; w++) { var wp = this.wisps[w]; wp.x += wp.v * dt; if (wp.x - wp.w > W) wp.x = -wp.w; }
    var bx = W * 0.34;
    for (var z = 0; z < this.zmb.length; z++) {
      var zb = this.zmb[z];
      zb.ph += dt * (1.1 + zb.d * 0.9);
      zb.hurt += dt * 2.2;
      if (zb.stare > 0) {
        zb.stare -= dt;
        if (zb.stare <= 0) {
          var side = Math.random() < 0.5 ? -1 : 1;
          zb.x = side < 0 ? -60 - rand(120) : W + 60 + rand(120);
          zb.dir = side < 0 ? 1 : -1;
        }
      } else {
        var limp = 0.55 + 0.45 * Math.abs(Math.sin(zb.hurt));
        zb.x += zb.dir * zb.spd * zb.d * limp * dt;
        if (Math.abs(zb.x - bx) < 120 * zb.d + 40) {
          zb.stare = 5 + rand(6);
          zb.dir = zb.x < bx ? 1 : -1;
        }
        if (zb.x < -100) { zb.x = -100; zb.dir = 1; }
        if (zb.x > W + 100) { zb.x = W + 100; zb.dir = -1; }
      }
    }
    for (var e2 = 0; e2 < this.embers.length; e2++) {
      var em = this.embers[e2];
      em.y -= em.v * dt; em.sw += dt * 1.7; em.x += Math.sin(em.sw) * 0.35;
      if (em.y < 160) { em.y = GROUND_Y - rand(-4, 30); em.x = rand(0, W); }
    }
    for (var f1 = 0; f1 < this.fogA.length; f1++) { var fa = this.fogA[f1]; fa.x += fa.v * dt; if (fa.x - fa.w > W) fa.x = -fa.w; }
    for (var f2 = 0; f2 < this.fogB.length; f2++) { var fb = this.fogB[f2]; fb.x += fb.v * dt; if (fb.x - fb.w > W) fb.x = -fb.w; }
    this.bolt.t -= dt;
    if (this.bolt.t < -this.bolt.next) { this.bolt.t = 0.30; this.bolt.next = 6 + rand(3, 9); this.bolt.x = rand(W * 0.2, W * 0.8); }
  };
})();

  /* رسم: پالت روشن‌تر — آسمان/ماه/زمین واضح، وینیت ملایم */
  M23.draw = function () {
    this.init();
    var t = this.t;
    var par = this._press.x, parY = this._press.y;
    var flash = this.bolt.t > 0 ? Math.max(0, this.bolt.t / 0.30) : 0;

    /* آسمان — (۳۵) روشن‌تر */
    var sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, '#0b1026');
    sky.addColorStop(0.55, '#131838');
    sky.addColorStop(0.85, '#261a38');
    sky.addColorStop(1, '#3a2446');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND_Y + 2);
    if (flash > 0) { ctx.fillStyle = 'rgba(170,190,245,' + (0.2 * flash) + ')'; ctx.fillRect(0, 0, W, GROUND_Y); }

    /* ستاره‌ها */
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      var tw = 0.45 + 0.55 * Math.abs(Math.sin(s.ph));
      ctx.fillStyle = 'rgba(214,222,255,' + (0.34 * tw).toFixed(2) + ')';
      ctx.fillRect(s.x + par * -4, s.y, s.r, s.r);
    }

    /* ماه — هاله‌ی قوی‌تر */
    var mx = W * 0.72 + par * -9, my = 112 + parY * -5, mr = 64;
    var mg = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.4);
    mg.addColorStop(0, 'rgba(255,150,95,0.42)');
    mg.addColorStop(0.4, 'rgba(255,125,85,0.16)');
    mg.addColorStop(1, 'rgba(255,110,70,0)');
    ctx.fillStyle = mg; circle(mx, my, mr * 3.4);
    var moon = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.2, mx, my, mr);
    moon.addColorStop(0, '#ffe8c2');
    moon.addColorStop(0.55, '#f7b070');
    moon.addColorStop(1, '#d67c48');
    ctx.fillStyle = moon; circle(mx, my, mr);
    ctx.fillStyle = 'rgba(120,55,30,0.30)';
    circle(mx - 18, my - 12, 9); circle(mx + 14, my + 8, 13); circle(mx + 26, my - 20, 6); circle(mx - 8, my + 22, 7);
    for (var w = 0; w < this.wisps.length; w++) {
      var wp = this.wisps[w];
      ctx.fillStyle = 'rgba(10,10,22,' + wp.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(wp.x + par * -6, wp.y, wp.w / 2, wp.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* افق شهری دو لایه */
    var s2 = 777;
    var rd = function () { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x7fffffff; };
    var skyline = function (yBase, hMin, hMax, col, off) {
      ctx.fillStyle = col;
      var x = -30, i2 = 0;
      while (x < W + 30) {
        var bw = 46 + rd() * 60;
        var bh = hMin + rd() * hMax;
        ctx.fillRect(x + off, yBase - bh, bw, bh);
        if (rd() < 0.16) {
          ctx.fillStyle = 'rgba(255,190,110,0.22)';
          ctx.fillRect(x + off + bw * 0.3, yBase - bh + 12, 3, 4);
          ctx.fillStyle = col;
        }
        x += bw + 8 + rd() * 26; i2++;
        if (i2 > 60) break;
      }
    };
    skyline(GROUND_Y + 2, 44, 120, '#111430', par * -7);
    skyline(GROUND_Y + 2, 26, 70, '#0b0e1d', par * -14);

    /* زمین + بازتاب ماه — روشن‌تر */
    var gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gr.addColorStop(0, '#181c2c');
    gr.addColorStop(0.5, '#201a2a');
    gr.addColorStop(1, '#2a2032');
    ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    var refl = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    refl.addColorStop(0, 'rgba(255,150,95,0.2)');
    refl.addColorStop(0.45, 'rgba(255,130,80,0.08)');
    refl.addColorStop(1, 'rgba(255,110,60,0)');
    ctx.fillStyle = refl;
    ctx.fillRect(mx - mr * 1.5, GROUND_Y, mr * 3, H - GROUND_Y);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, GROUND_Y, W, 3);

    /* برج قهرمان */
    this.drawBuilding(W * 0.34 + par * -16, t, flash);

    /* مه پشتی */
    for (var f1 = 0; f1 < this.fogA.length; f1++) {
      var fa = this.fogA[f1];
      ctx.fillStyle = 'rgba(122,140,190,' + fa.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(fa.x, fa.y, fa.w / 2, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* زامبی‌های ترسناک */
    for (var z = 0; z < this.zmb.length; z++) this.drawSilZombie(this.zmb[z], t, flash);

    /* مه جلویی */
    for (var f2 = 0; f2 < this.fogB.length; f2++) {
      var fb = this.fogB[f2];
      ctx.fillStyle = 'rgba(134,152,200,' + fb.a.toFixed(2) + ')';
      ctx.beginPath();
      ctx.ellipse(fb.x, fb.y, fb.w / 2, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* اخگرها */
    for (var e = 0; e < this.embers.length; e++) {
      var em = this.embers[e];
      var fl = 0.6 + 0.4 * Math.sin(em.sw * 2.2);
      ctx.fillStyle = 'rgba(255,' + Math.round(150 + 70 * fl) + ',90,' + (em.a * fl).toFixed(2) + ')';
      ctx.fillRect(em.x, em.y, em.r, em.r);
    }

    /* رعدوبرق */
    if (flash > 0) {
      ctx.fillStyle = 'rgba(190,205,255,' + (0.10 * flash) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(220,232,255,' + (0.75 * flash) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var bx2 = this.bolt.x, by = 0;
      ctx.moveTo(bx2, by);
      while (by < 200) { bx2 += rand(-26, 26); by += rand(22, 44); ctx.lineTo(bx2, by); }
      ctx.stroke();
    }

    /* وینیت خیلی ملایم — صفحه روشن می‌ماند */
    var vg = ctx.createRadialGradient(W / 2, H * 0.44, H * 0.42, W / 2, H * 0.5, W * 0.68);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(4,6,16,0.30)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    var bt = ctx.createLinearGradient(0, H - 120, 0, H);
    bt.addColorStop(0, 'rgba(10,12,24,0)');
    bt.addColorStop(1, 'rgba(10,12,24,0.42)');
    ctx.fillStyle = bt; ctx.fillRect(0, H - 120, W, 120);
  };

  /* زامبی سایه‌وارِ ترسناک — بدن خمیده‌ی درشت، فک باز با دندان،
     چشم‌های سرخ تابان، چنگال، لبه‌ی پارگی لباس، قدم لکنت‌دار */
  M23.drawSilZombie = function (z, t, flash) {
    var d = z.d, x = z.x + this._press.x * -22 * d;
    var y = GROUND_Y + (d - 0.6) * 16;
    var s = d * (z.ty === 'tank' ? 1.5 : z.ty === 'fast' ? 1.12 : 1.3);
    var ph = z.ph;
    var stare = z.stare > 0;
    var bodyC = flash > 0.4 ? 'rgba(34,38,64,0.96)' : 'rgba(6,7,14,0.96)';
    var bodyC2 = flash > 0.4 ? 'rgba(44,48,78,0.96)' : 'rgba(12,13,24,0.96)';
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(z.dir < 0 ? -s : s, s);
    /* سایه تیره زیر پا */
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(0, 2, 17, 4, 0, 0, Math.PI * 2); ctx.fill();
    /* بدن رو به برج خم */
    var hunch = stare ? 0.34 + Math.sin(t * 1.6 + ph) * 0.03 : 0.3 + Math.sin(ph) * 0.04;
    ctx.rotate(-hunch * 0.5);
    /* پاها — گام لکنت‌دار */
    var lim = Math.sin(ph), lim2 = Math.sin(ph + Math.PI);
    var drag = Math.sin(z.hurt) * 2.2;
    ctx.strokeStyle = bodyC; ctx.lineWidth = 6.8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, -15); ctx.lineTo(-5 + lim * 8, -2 + Math.abs(lim) * 1.6);
    ctx.moveTo(3.5, -15); ctx.lineTo(5 + lim2 * 8 + drag, -2 + Math.abs(lim2) * 1.6);
    ctx.stroke();
    /* بالاتنه خمیده — پهن و سنگین با لبه‌ی پارگی لباس */
    ctx.fillStyle = bodyC;
    ctx.beginPath();
    ctx.moveTo(-9, -14);
    ctx.quadraticCurveTo(-11.5, -26, -6, -33);
    ctx.quadraticCurveTo(1, -38, 8, -33);
    ctx.quadraticCurveTo(12, -26, 10, -14);
    ctx.lineTo(7, -11); ctx.lineTo(5.5, -13.5); ctx.lineTo(3, -10.5);
    ctx.lineTo(0.5, -13); ctx.lineTo(-2, -10); ctx.lineTo(-4.5, -12.5); ctx.lineTo(-7, -10);
    ctx.closePath(); ctx.fill();
    /* حجم پشت */
    ctx.fillStyle = bodyC2;
    ctx.beginPath();
    ctx.moveTo(-6, -16); ctx.quadraticCurveTo(-8, -26, -4, -31);
    ctx.quadraticCurveTo(0, -34, 3, -31); ctx.quadraticCurveTo(5, -25, 3.5, -16);
    ctx.closePath(); ctx.fill();
    /* بازوهای بلند آویزان */
    ctx.strokeStyle = bodyC; ctx.lineWidth = 5.4;
    ctx.beginPath();
    ctx.moveTo(-5, -29); ctx.quadraticCurveTo(-13, -22 + Math.sin(ph + 1.1) * 3, -15, -11 + Math.sin(ph + 1.1) * 2.4);
    ctx.moveTo(6, -30); ctx.quadraticCurveTo(13.5, -24 + Math.sin(ph + 2.2) * 3, 15.5, -13 + Math.sin(ph + 2.2) * 2.4);
    ctx.stroke();
    /* چنگال‌ها — سه انگشت خمیده */
    ctx.lineWidth = 2.1;
    var claw = function (cx, cy) {
      ctx.beginPath();
      for (var ci = -1; ci <= 1; ci++) {
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + ci * 2.4, cy + 2.2, cx + ci * 3.1, cy + 5.4);
      }
      ctx.stroke();
    };
    claw(-15, -11 + Math.sin(ph + 1.1) * 2.4);
    claw(15.5, -13 + Math.sin(ph + 2.2) * 2.4);
    /* سر کج با جمجمه + فک باز */
    var tilt = 0.22 + Math.sin(t * 0.9 + ph) * 0.05;
    ctx.save();
    ctx.translate(7.5, -34.5);
    ctx.rotate(tilt);
    ctx.fillStyle = bodyC;
    ctx.beginPath(); ctx.ellipse(0, -1.5, 6.4, 7, 0, 0, Math.PI * 2); ctx.fill();
    /* فک پایین باز */
    ctx.beginPath();
    ctx.moveTo(-4.5, 2.2);
    ctx.quadraticCurveTo(0.5, 7.8, 5, 3.4);
    ctx.quadraticCurveTo(3.4, 1.2, -4.5, 2.2);
    ctx.closePath(); ctx.fill();
    /* دندان‌ها */
    ctx.strokeStyle = 'rgba(210,214,226,0.85)'; ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (var di = 0; di < 4; di++) {
      var tx = -3.4 + di * 1.9;
      ctx.moveTo(tx, 1.6); ctx.lineTo(tx + 0.75, 3.4);
    }
    ctx.stroke();
    /* چشم‌های سرخ تابان */
    var er = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.8 + ph * 0.6));
    ctx.fillStyle = 'rgba(255,60,40,' + er.toFixed(2) + ')';
    circle(1.6, -3.4, 1.25); circle(4.6, -3.2, 1.25);
    ctx.fillStyle = 'rgba(255,60,40,' + (er * 0.26).toFixed(2) + ')';
    circle(3, -3.3, 5.4);
    ctx.restore();
    /* مه تیره دور پا */
    ctx.fillStyle = 'rgba(24,28,44,0.4)';
    ctx.beginPath(); ctx.ellipse(0, 1, 24, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  /* ریست صحنه منو با زامبی‌های تازه */
  try {
    M23.inited = false;
    M23.init();
    if (state && state.mode === 'start') M23.t = 0;
  } catch (e) {}

/* ---------- ۳۵-۲) کاشی سلاح‌ها: بی‌متن (آیکن + قیمت سکه‌ای + قفل + طلایی) ---------- */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '#bpList .bp-tile[id^=bp-pistol] .bp-key,#bpList .bp-tile[id^=bp-shotgun] .bp-key,#bpList .bp-tile[id^=bp-mg] .bp-key{display:none!important}' +
    '#bpList .bp-tile[id^=bp-pistol] .bp-price,#bpList .bp-tile[id^=bp-shotgun] .bp-price,#bpList .bp-tile[id^=bp-mg] .bp-price{' +
    'font-size:0!important;line-height:1!important;overflow:visible!important;' +
    'background:rgba(20,15,4,.85)!important;border:1.5px solid #c9922e!important;' +
    'border-radius:99px!important;padding:calc(2px * var(--uiz,1)) calc(8px * var(--uiz,1))!important;' +
    'min-height:0!important;width:auto!important;align-self:center!important}' +
    '#bpList .bp-tile[id^=bp-pistol] .bp-price::before,#bpList .bp-tile[id^=bp-shotgun] .bp-price::before,#bpList .bp-tile[id^=bp-mg] .bp-price::before{' +
    "content:'';display:inline-block;vertical-align:-2px;" +
    'width:calc(13px * var(--uiz,1));height:calc(13px * var(--uiz,1));border-radius:50%;' +
    'background:radial-gradient(circle at 35% 30%,#ffe9a8,#d9a63f 60%,#a8741f);' +
    'box-shadow:0 0 4px rgba(255,215,100,.5);margin-inline-end:calc(3px * var(--uiz,1))}' +
    '#bpList .bp-tile .bp-price:empty{display:none!important}' +
    '#bpList .bp-tile.locked{position:relative}' +
    "#bpList .bp-tile.locked::after{content:'';position:absolute;top:calc(5px * var(--uiz,1));inset-inline-end:calc(5px * var(--uiz,1));" +
    'width:calc(15px * var(--uiz,1));height:calc(15px * var(--uiz,1));border-radius:calc(4px * var(--uiz,1));' +
    'background:rgba(8,12,26,.78) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ffd873\'><path d=\'M7 10V8a5 5 0 0 1 10 0v2h.6c.8 0 1.4.6 1.4 1.4v7.2c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4v-7.2c0-.8.6-1.4 1.4-1.4H7zm2 0h6V8a3 3 0 0 0-6 0v2z\'/></svg>") center/74% no-repeat}' +
    '#bpList .bp-tile.owned{position:relative}' +
    "#bpList .bp-tile.owned::after{content:'';position:absolute;top:calc(5px * var(--uiz,1));inset-inline-end:calc(5px * var(--uiz,1));" +
    'width:calc(16px * var(--uiz,1));height:calc(16px * var(--uiz,1));border-radius:50%;' +
    'background:rgba(10,30,16,.85) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2377e29a\' stroke-width=\'3.2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M5 13l4 4L19 7\'/></svg>") center/72% no-repeat;' +
    'box-shadow:0 0 6px rgba(80,220,120,.4)}' +
    '#bpList .bp-tile.armed{border-color:#ffd873!important;' +
    'box-shadow:0 0 12px rgba(255,216,115,.35),inset 0 1.5px 0 rgba(255,255,255,.14)!important}' +
    '@media (pointer:coarse){#bpTip{display:none!important}}' +
    '#bpTip{max-width:calc(190px * var(--uiz,1))!important;overflow:hidden!important;word-break:break-word!important}' +
    '#bpTip b{white-space:normal!important;overflow-wrap:break-word!important}';
  document.head.appendChild(st);

  var _rbp = refreshBuildPanel;
  refreshBuildPanel = function () {
    _rbp.apply(null, arguments);
    try {
      var WORDER = ['pistol', 'shotgun', 'mg'];
      for (var i = 0; i < WORDER.length; i++) {
        var id = WORDER[i];
        var cost = document.getElementById('bp-' + id + '-cost');
        if (!cost) continue;
        var owned = !!(typeof WEAPONS !== 'undefined' && WEAPONS[id] && WEAPONS[id].owned);
        var isCur = (typeof state !== 'undefined' && state.weapon === id);
        var idx = WORDER.indexOf(id);
        var curIdx = WORDER.indexOf(typeof state !== 'undefined' ? state.weapon : 'pistol');
        var isFar = !owned && idx > curIdx + 1;
        if (isCur || owned || isFar) {
          cost.textContent = '';
          cost.classList.remove('poor');
        } else if (typeof UPGRADES !== 'undefined' && UPGRADES[id]) {
          cost.textContent = faNum(UPGRADES[id].price);
          cost.classList.toggle('poor', state.coins < UPGRADES[id].price);
        }
      }
    } catch (e) {}
  };
  refreshBuildPanel.__35 = true;
  try { refreshBuildPanel(); } catch (e) {}
})();

/* ---------- ۳۵-۳) معماها هم باتن‌شیت اندرویدی شوند ---------- */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '.sheet34 .myst-body{padding:calc(4px * var(--uiz,1)) calc(14px * var(--uiz,1)) calc(16px * var(--uiz,1))!important;' +
    'gap:calc(9px * var(--uiz,1))!important}' +
    '.myst-hint{font-size:calc(12.5px * var(--uiz,1))!important;line-height:1.9!important;text-align:center;' +
    'background:rgba(255,255,255,.05);border-radius:calc(11px * var(--uiz,1));' +
    'padding:calc(9px * var(--uiz,1)) calc(11px * var(--uiz,1))!important}' +
    '.radio-dial input[type=range]{height:calc(46px * var(--uiz,1))!important}' +
    '.radio-read{font-size:calc(22px * var(--uiz,1))!important}' +
    '.radio-static{font-size:calc(13px * var(--uiz,1))!important;min-height:calc(22px * var(--uiz,1))}' +
    '.code-disp{font-size:calc(24px * var(--uiz,1))!important;letter-spacing:calc(7px * var(--uiz,1))!important;' +
    'padding:calc(10px * var(--uiz,1)) 0!important}' +
    '.code-key{width:calc(56px * var(--uiz,1))!important;height:calc(48px * var(--uiz,1))!important;' +
    'font-size:calc(18px * var(--uiz,1))!important;border-radius:calc(12px * var(--uiz,1))!important}' +
    '.fuse-wire{min-height:calc(58px * var(--uiz,1))!important}' +
    '.fuse-wire span{font-size:calc(13px * var(--uiz,1))!important}' +
    '.fuse-log{font-size:calc(12.5px * var(--uiz,1))!important}' +
    '.myst-act{min-height:calc(54px * var(--uiz,1))!important;font-size:calc(14.5px * var(--uiz,1))!important;' +
    'border-radius:calc(13px * var(--uiz,1))!important}';
  document.head.appendChild(st);

  var CLUE_ICON =
    '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="10.2" cy="10.2" r="6.4"/><path d="M14.9 14.9L20.5 20.5"/>' +
    '<path d="M7.3 10.6c0-1.7 1.3-3 3-3 1.6 0 2.9 1.2 3 2.8" opacity=".9"/>' +
    '<path d="M7.3 13.6c.2.9.8 1.6 1.6 2" opacity=".55"/>' +
    '</svg>';

  MYST.panelShell = function (title) {
    this.closePanel();
    var el = (typeof shEl34 === 'function')
      ? shEl34('mystPuzzle35', CLUE_ICON, title, 'معمای داستانی')
      : null;
    if (!el) {
      el = document.createElement('div');
      el.className = 'sheet34';
      el.id = 'mystPuzzle35';
      el.innerHTML = '<div class="sh-grab34"></div><div class="sh-head34"><span class="sh-ic34">' + CLUE_ICON + '</span>' +
        '<div class="sh-tx34"><b>' + title + '</b><span>معمای داستانی</span></div>' +
        '<button class="sh-x34">✕</button></div><div class="sh-body34 myst-body"></div>';
      el.querySelector('.sh-x34').addEventListener('click', function () { try { MYST.closePanel(); } catch (e) {} });
      document.getElementById('wrap').appendChild(el);
    } else {
      el.querySelector('.sh-body34').classList.add('myst-body');
    }
    if (typeof openSheet34 === 'function') { try { openSheet34(el); } catch (e) { el.classList.add('open'); } }
    else el.classList.add('open');
    if (window.__V34) window.__V34.openSheet = 'puzzle';
    this._panel = el;
    return el;
  };

  MYST.closePanel = function () {
    if (this._radioNoise) { try { this._radioNoise.stop(); } catch (e) {} this._radioNoise = null; }
    if (this._panel) {
      var p = this._panel;
      if (typeof closeSheet34 === 'function') { try { closeSheet34(); } catch (e) { p.classList.remove('open'); setTimeout(function () { p.remove(); }, 280); } }
      else { p.classList.remove('open'); setTimeout(function () { p.remove(); }, 280); }
      this._panel = null;
    } else if (typeof closeSheet34 === 'function') {
      try { closeSheet34(); } catch (e) {}
    }
  };

  /* خرید مولوتوف داخل شیت سرنخ v34: فازِ capture جایگزین اعلان می‌شود —
     فقط اسنک‌بار کوچک + به‌روزرسانی عدد کارت (هیچ سیل متنی) */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-act=molo]') : null;
    if (!t) return;
    var host = t.closest('.sh-body34, .myst-body');
    if (!host) return;
    e.stopPropagation();
    e.preventDefault();
    try { SFX.click(); } catch (err) {}
    if (MYST.molotovs >= 3) { try { SFX.deny(); } catch (err) {} snack35('مولوتوف پر است — حداکثر ۳ تا'); return; }
    if (state.coins < 45) { try { SFX.deny(); } catch (err) {} snack35('سکه کافی نیست — ۴۵ سکه لازم است'); return; }
    state.coins -= 45;
    MYST.molotovs++;
    try { SFX.placeT(); } catch (err) {}
    var cnt = document.getElementById('moloCnt34');
    if (cnt) cnt.textContent = 'داردی: ' + faNum(MYST.molotovs) + ' از ۳';
    try { updateHUD(); } catch (err) {}
    try { if (typeof moloBadge34 === 'function') moloBadge34(); } catch (err) {}
    snack35('مولوتوف ساخته شد — ' + faNum(MYST.molotovs) + ' از ۳');
  }, true);
  /* بقیه‌ی مسیرها (مثل اسکریپت/تست) همچنان از craftMolotov می‌گذرند */
  var _craft = MYST.craftMolotov;
  if (_craft && !_craft.__35) {
    MYST.craftMolotov = function () {
      var before = this.molotovs;
      var ok = _craft.apply(this, arguments);
      if (ok && this.molotovs > before) snack35('مولوتوف ساخته شد — ' + faNum(this.molotovs) + ' از ۳');
      return ok;
    };
    MYST.craftMolotov.__35 = true;
  }
})();

/* ---------- ۳۵-۴) ضد سرریز متن‌ها ---------- */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '.m30act .m30s,.mc-sub,.pd-item .pd-sub,.sh-tx34 span{overflow-wrap:break-word!important;word-break:break-word!important}' +
    '.pd-item .pd-sub{overflow:hidden!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important}';
  document.head.appendChild(st);
})();

})();
