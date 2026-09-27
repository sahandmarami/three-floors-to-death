
/* ==================================================================
   سه طبقه تا بقا — منطق بازی (بخش ۲)
   ۱۰) افکت‌ها (ذرات، متن‌های شناور، قوس برق تله)
   ۱۱) حلقه به‌روزرسانی      ۱۲) پایان بازی (برد/باخت)
   ۱۳) رسم صحنه با Canvas   ۱۴) رابط کاربری (HUD/فروشگاه/اورلی‌ها)
   ۱۵) حلقه اصلی و راه‌اندازی
   ================================================================== */

/* ---------------------- ۱۰) افکت‌ها ---------------------- */
/* تولید ذره (پارتیکل) — o: {speed, life, size, grav, dir, spread, up} */
function spawnParticles(x, y, n, color, o = {}) {
  const speed = o.speed || 120, life = o.life || 0.4;
  const size = o.size || 2.5, grav = (o.grav === undefined ? 400 : o.grav);
  for (let i = 0; i < n; i++) {
    let a;
    if (o.dir !== undefined) a = o.dir + rand(-(o.spread || 1) / 2, (o.spread || 1) / 2);
    else if (o.up) a = rand(-Math.PI, -0.2);            // فقط رو به بالا
    else a = rand(0, Math.PI * 2);
    const sp = speed * rand(0.5, 1.15);
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      age: 0, life: life * rand(0.7, 1.2), size: size * rand(0.7, 1.3), color, grav,
    });
  }
}
function updateParticles(dt) {
  for (const p of state.particles) {
    p.age += dt; p.vy += p.grav * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > GROUND_Y + 2 && p.vy > 0) { p.y = GROUND_Y + 2; p.vy *= -0.3; p.vx *= 0.6; } // وایراستن روی زمین
  }
  state.particles = state.particles.filter(p => p.age < p.life);
}

/* متن شناور (عدد دمیج و...) */
function addText(x, y, str, color, size) {
  state.texts.push({ x, y, str, color, size, age: 0, life: 0.8 });
}
function updateTexts(dt) {
  for (const t of state.texts) { t.age += dt; t.y -= 45 * dt; }
  state.texts = state.texts.filter(t => t.age < t.life);
}

/* قوس برق تله: خط زیگزاگ از خار پایه برج تا زامبی */
function addZap(tx, ty) {
  const side = tx < TOWER.x ? -1 : 1;
  const ox = TOWER.x + side * (TOWER.baseHalf + 8 + Math.random() * 26), oy = GROUND_Y - 10;
  const pts = [{ x: ox, y: oy }];
  for (let i = 1; i < 5; i++) {
    const t = i / 5;
    pts.push({ x: ox + (tx - ox) * t + rand(-7, 7), y: oy + (ty - oy) * t + rand(-7, 7) });
  }
  pts.push({ x: tx, y: ty });
  state.zaps.push({ pts, age: 0, life: 0.16 });
}
function updateZaps(dt) {
  for (const z of state.zaps) z.age += dt;
  state.zaps = state.zaps.filter(z => z.age < z.life);
}

/* ---------------------- ۱۱) حلقه به‌روزرسانی ---------------------- */
function update(dt) {
  state.time += dt;
  fireTimer = Math.max(0, fireTimer - dt);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.fireFlash = Math.max(0, state.fireFlash - dt);
  state.recoil = Math.max(0, state.recoil - dt * 6);

  /* اسلحه همیشه رو به ماوس باشد؛ اگر ماوس پایین است شلیک خودکار ادامه یابد */
  updateAim();
  if (state.mouse.down && canPlay()) tryShoot();

  /* شمارش معکوس بین موج‌ها */
  if (state.mode === 'intermission') {
    state.intermission -= dt;
    if (state.intermission <= 0) startWave(state.wave + 1);
  }

  if (state.mode === 'playing') {
    /* تولید زامبی‌های موج فعلی */
    if (state.spawn.remaining > 0) {
      state.spawn.timer -= dt;
      if (state.spawn.timer <= 0) {
        spawnZombie();
        state.spawn.remaining--;
        state.spawn.timer = state.spawn.interval * rand(0.7, 1.3);
      }
    } else if (state.zombies.length === 0) {
      waveComplete();                      // همه‌ی زامبی‌های موج از بین رفتند
    }
    updateTrap(dt);                        // تله پایه برج
  }

  if (canPlay()) {
    updateZombies(dt);
    updateBullets(dt);
    updateCoins(dt);
  }
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
  updateAnnounce(dt);
}

/* افکت‌ها پس از پایان بازی (برد/باخت) همچنان تمام شوند */
function updateFx(dt) {
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
}

/* اعلان مرکزی: در وقفه «موج بعدی + شمارش» و در شروع موج بنر موقت */
function updateAnnounce(dt) {
  const el = $('announce');
  if (state.mode === 'intermission') {
    $('announceBig').textContent = 'موج بعدی: ' + faNum(state.wave + 1);
    $('announceSub').textContent = 'شروع در ' + faNum(Math.max(1, Math.ceil(state.intermission))) + ' ثانیه — 🛠 فرصت ارتقا!';
    el.style.opacity = 1;
  } else if (announceTimer > 0) {
    announceTimer -= dt;
    if (announceTimer <= 0) el.style.opacity = 0;
    else el.style.opacity = Math.min(1, announceTimer / 0.45);
  } else el.style.opacity = 0;
}
function setAnnounce(big, sub, t) {
  $('announceBig').textContent = big;
  $('announceSub').textContent = sub;
  announceTimer = t;
  $('announce').style.opacity = 1;
}
function hideAnnounce() { $('announce').style.opacity = 0; announceTimer = 0; }

/* ---------------------- ۱۲) پایان بازی ---------------------- */
function gameOver() {
  if (state.mode === 'gameover') return;
  state.mode = 'gameover';
  state.mouse.down = false;
  state.shake = 14; state.flash = 1;
  /* آوار و گردوخاک سقوط برج */
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 36, '#8a6f52', { speed: 260, life: 0.9, size: 3.5, grav: 600 });
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 16, '#e04b3a', { speed: 200, life: 0.7, size: 3, grav: 600 });
  $('goSubtitle').textContent = 'برج سقوط کرد... تا موج ' + faNum(state.wave) + ' از ' + faNum(TOTAL_WAVES) + ' دووم آوردی.';
  $('goStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه جمع‌شده: <b>' + faNum(state.stats.earned) + '</b>';
  hideAnnounce();
  showScreen('gameoverScreen');
}

function victory() {
  if (state.mode === 'victory') return;
  state.mode = 'victory';
  state.mouse.down = false;
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 30, '#ffd873', { speed: 240, life: 1.1, size: 3, grav: 350 });
  $('vStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه: <b>' + faNum(state.coins) +
    '</b> &nbsp;|&nbsp; ❤️ جون باقی‌مانده: <b>' + faNum(Math.ceil(state.tower.hp)) + '</b>';
  hideAnnounce();
  showScreen('victoryScreen');
}

/* ---------------------- ۱۳) رسم صحنه با Canvas ---------------------- */
/* ابزارهای رسم */
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

/* آسمان شب: گرادیان آبی تیره + ستاره‌های چشمک‌زن + ماه + تپه‌ها + زمین و جاده */
function drawSky() {
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#080e22'); g.addColorStop(0.5, '#101c3e'); g.addColorStop(1, '#1d2d58');
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 40);

  for (const s of STARS) {
    const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(animTime * s.sp + s.ph));
    ctx.fillStyle = 'rgba(215,228,255,' + a.toFixed(2) + ')';
    circle(s.x, s.y, s.r);
  }

  /* ماه با هاله و دهانه‌ها */
  const mx = 172, my = 86, mr = 34;
  const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.7);
  glow.addColorStop(0, 'rgba(244,238,210,0.30)'); glow.addColorStop(1, 'rgba(244,238,210,0)');
  ctx.fillStyle = glow; circle(mx, my, mr * 2.7);
  ctx.fillStyle = '#f2ead0'; circle(mx, my, mr);
  ctx.fillStyle = 'rgba(120,110,80,0.16)';
  circle(mx - 10, my - 6, 6); circle(mx + 8, my + 9, 4.5); circle(mx + 13, my - 11, 3);

  /* تپه‌های دوردست در دو لایه برای عمق */
  drawHills(HILLS1, '#13203f');
  drawHills(HILLS2, '#0d1731');

  /* زمین و جاده خاکی که زامبی‌ها روی آن راه می‌روند */
  ctx.fillStyle = '#151d0e'; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  ctx.fillStyle = '#2c261d'; ctx.fillRect(-20, GROUND_Y, W + 40, 18);
  ctx.strokeStyle = 'rgba(96,84,60,0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y); ctx.lineTo(W + 20, GROUND_Y); ctx.stroke();
  ctx.fillStyle = 'rgba(120,105,80,0.35)';
  for (const p of PEBBLES) circle(p.x, GROUND_Y + p.dy, p.r);
}
function drawHills(pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, GROUND_Y);
  for (const p of pts) ctx.lineTo(p.x, GROUND_Y - p.h);
  ctx.lineTo(W + 20, GROUND_Y);
  ctx.closePath(); ctx.fill();
}

/* تله پایه برج: خارهای فلزی + محدوده اثر + قوس‌های برق */
function drawTrap() {
  const lvl = state.upgrades.trap;
  if (lvl <= 0) return;
  const R = UPGRADES.trap.radius;

  /* محدوده اثر تله روی زمین (بیضی خط‌چین کم‌رنگ) */
  ctx.strokeStyle = 'rgba(255,130,80,' + (0.12 + 0.05 * Math.sin(animTime * 3)).toFixed(2) + ')';
  ctx.lineWidth = 2; ctx.setLineDash([6, 9]);
  ctx.beginPath(); ctx.ellipse(TOWER.x, GROUND_Y + 6, R, 16, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  /* نور هشدار نارنجی پای برج */
  const g = ctx.createRadialGradient(TOWER.x, GROUND_Y, 10, TOWER.x, GROUND_Y, 90);
  g.addColorStop(0, 'rgba(255,110,60,0.16)'); g.addColorStop(1, 'rgba(255,110,60,0)');
  ctx.fillStyle = g; circle(TOWER.x, GROUND_Y, 90);

  /* خارهای فلزی دو طرف پایه برج */
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = TOWER.x + side * (TOWER.baseHalf + 8 + i * 7);
      const h = i > 3 ? 10 : 14;
      ctx.fillStyle = '#8b93a3';
      ctx.beginPath();
      ctx.moveTo(x - 4, GROUND_Y + 2); ctx.lineTo(x + 4, GROUND_Y + 2); ctx.lineTo(x, GROUND_Y + 2 - h);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#3c4250'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}

/* برج سه‌طبقه: هر طبقه رنگ و جزئیات متفاوت (سنگی/آجری/آبی) + پرچم */
function drawTower() {
  const widths = [136, 124, 112];
  const floors = [
    { c: '#6e5a44', edge: '#453a2c' },   // طبقه اول: سنگی
    { c: '#a04b3a', edge: '#6e2f24' },   // طبقه دوم: آجری
    { c: '#41729f', edge: '#2a4b6b' },   // طبقه سوم: آبی
  ];
  for (let i = 0; i < 3; i++) {
    const hw = widths[i] / 2;
    const yT = GROUND_Y - (i + 1) * TOWER.floorH, yB = GROUND_Y - i * TOWER.floorH;
    ctx.fillStyle = floors[i].c;
    ctx.fillRect(TOWER.x - hw, yT, hw * 2, TOWER.floorH);
    ctx.strokeStyle = floors[i].edge; ctx.lineWidth = 2;
    ctx.strokeRect(TOWER.x - hw + 1, yT + 1, hw * 2 - 2, TOWER.floorH - 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(TOWER.x - hw, yB - 3, hw * 2, 3);   // سایه جداکننده طبقه‌ها
  }

  /* درِ قوس‌دار تیره در طبقه اول */
  ctx.fillStyle = '#241a12';
  ctx.beginPath();
  ctx.moveTo(TOWER.x - 14, GROUND_Y);
  ctx.lineTo(TOWER.x - 14, GROUND_Y - 22);
  ctx.arc(TOWER.x, GROUND_Y - 22, 14, Math.PI, 0);
  ctx.lineTo(TOWER.x + 14, GROUND_Y);
  ctx.closePath(); ctx.fill();

  /* پنجره‌های نورانی با سوسوی ملایم */
  const wins = [
    { x: -36, y: GROUND_Y - 46 }, { x: 36, y: GROUND_Y - 46 },
    { x: -38, y: GROUND_Y - 108 }, { x: 38, y: GROUND_Y - 108 },
    { x: -28, y: GROUND_Y - 176 }, { x: 28, y: GROUND_Y - 176 },
  ];
  wins.forEach((w2, i) => {
    const a = 0.66 + 0.25 * Math.sin(animTime * 2.1 + i * 1.9);
    ctx.fillStyle = 'rgba(255,214,110,' + a.toFixed(2) + ')';
    ctx.fillRect(TOWER.x + w2.x - 7, w2.y - 9, 14, 18);
    ctx.strokeStyle = 'rgba(40,30,10,0.6)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(TOWER.x + w2.x - 7, w2.y - 9, 14, 18);
    ctx.beginPath(); ctx.moveTo(TOWER.x + w2.x, w2.y - 9); ctx.lineTo(TOWER.x + w2.x, w2.y + 9); ctx.stroke();
  });

  /* کنگره‌های بام */
  ctx.fillStyle = '#2f5378';
  for (let k = 0; k < 5; k++) ctx.fillRect(TOWER.x - 52 + k * 22, TOWER_TOP_Y - 9, 14, 9);

  /* میله و پرچم موج‌دار */
  ctx.fillStyle = '#4a3b2a';
  ctx.fillRect(TOWER.x - 1.5, TOWER_TOP_Y - 36, 3, 36);
  const wv = Math.sin(animTime * 4) * 2.5;
  ctx.fillStyle = '#d8453a';
  ctx.beginPath();
  ctx.moveTo(TOWER.x + 1.5, TOWER_TOP_Y - 35);
  ctx.lineTo(TOWER.x + 24 + wv, TOWER_TOP_Y - 28);
  ctx.lineTo(TOWER.x + 1.5, TOWER_TOP_Y - 21);
  ctx.closePath(); ctx.fill();

  /* ترک‌ها وقتی برج آسیب دیده است */
  const ratio = state.tower.hp / state.tower.maxHp;
  ctx.strokeStyle = 'rgba(20,14,8,0.8)'; ctx.lineWidth = 2;
  if (ratio < 0.55) {
    ctx.beginPath();
    ctx.moveTo(TOWER.x - 40, GROUND_Y - 14); ctx.lineTo(TOWER.x - 33, GROUND_Y - 30); ctx.lineTo(TOWER.x - 41, GROUND_Y - 44);
    ctx.moveTo(TOWER.x + 44, GROUND_Y - 80); ctx.lineTo(TOWER.x + 37, GROUND_Y - 96);
    ctx.stroke();
  }
  if (ratio < 0.28) {
    ctx.beginPath();
    ctx.moveTo(TOWER.x + 20, GROUND_Y - 100); ctx.lineTo(TOWER.x + 13, GROUND_Y - 118); ctx.lineTo(TOWER.x + 21, GROUND_Y - 132);
    ctx.moveTo(TOWER.x - 14, GROUND_Y - 150); ctx.lineTo(TOWER.x - 7, GROUND_Y - 166);
    ctx.stroke();
  }
}

/* زامبی: پاهای متحرک، دست‌های کشته، سر خمیده و چشم‌های قرمز */
function drawZombie(z) {
  const flash = z.hitFlash > 0;
  const skin = flash ? '#d9f2c6' : '#7fa657';
  const shirt = flash ? '#9db4cc' : '#4a5d73';
  const pants = flash ? '#5d6a80' : '#333d4d';

  /* سایه روی زمین */
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(z.x, z.y + 2, 13, 4, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(z.dir, 1);                     // آینه بر اساس جهت حرکت
  const walk = Math.sin(z.walkPhase);
  const bob = z.attacking ? Math.sin(z.attackAnim) * 1.5 : Math.abs(walk) * 1.2;

  /* پاها */
  ctx.strokeStyle = pants; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -13); ctx.lineTo(-4 + (z.attacking ? 0 : walk * 6), -1);
  ctx.moveTo(4, -13); ctx.lineTo(4 - (z.attacking ? 0 : walk * 6), -1);
  ctx.stroke();

  /* بدن و پارگی پیراهن */
  ctx.fillStyle = shirt; rr(-9, -31 + bob * 0.4, 18, 19, 4); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-3, -24 + bob * 0.4, 6, 7);

  /* بازوهای کشیده به جلو */
  const armY = -27 + bob * 0.4;
  const armSw = z.attacking ? Math.sin(z.attackAnim) * 4 : Math.sin(z.walkPhase * 0.5) * 2;
  ctx.strokeStyle = skin; ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-5, armY + 2); ctx.lineTo(13, armY + armSw);
  ctx.moveTo(5, armY + 3); ctx.lineTo(14, armY + 5 + armSw * 0.6);
  ctx.stroke();
  ctx.fillStyle = skin;
  circle(13, armY + armSw, 3); circle(14, armY + 5 + armSw * 0.6, 3);

  /* سر + مو + چشم‌های قرمز */
  ctx.fillStyle = skin; circle(3, -36 + bob * 0.5, 7);
  ctx.fillStyle = '#2f3b26';
  ctx.beginPath(); ctx.arc(3, -36 + bob * 0.5, 7, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.fillStyle = flash ? '#ffffff' : '#ff4b3e';
  circle(5.5, -37 + bob * 0.5, 1.5); circle(8.8, -37.5 + bob * 0.5, 1.5);
  ctx.restore();

  /* نوار جون بالای سر (وقتی آسیب دیده) */
  if (z.hp < z.maxHp - 0.001) {
    const w2 = 26, ratio = clamp(z.hp / z.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(z.x - w2 / 2, z.y - 50, w2, 4.5);
    ctx.fillStyle = ratio > 0.5 ? '#6fce62' : (ratio > 0.25 ? '#e7b53a' : '#e04b3a');
    ctx.fillRect(z.x - w2 / 2 + 0.75, z.y - 49.25, (w2 - 1.5) * ratio, 3);
  }
}

/* بازیکن: نگهبان کوچک روی بام برج با اسلحه چرخان رو به ماوس */
function drawPlayer() {
  const px = TOWER.x, py = TOWER_TOP_Y;
  const bob = Math.sin(animTime * 2.4) * 1.1;
  ctx.save();
  ctx.translate(px, py + bob * 0.4);

  /* سایه روی بام */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1, 11, 3, 0, 0, Math.PI * 2); ctx.fill();

  /* پاها و بدن */
  ctx.fillStyle = '#2c3550';
  ctx.fillRect(-7, -6, 6, 6); ctx.fillRect(1, -6, 6, 6);
  ctx.fillStyle = '#3d6db5'; rr(-9, -25, 18, 20, 5); ctx.fill();
  ctx.fillStyle = '#26324d'; ctx.fillRect(-9, -9, 18, 3);

  /* سر و مو */
  ctx.fillStyle = '#f0c49a'; circle(0, -30, 6.5);
  ctx.fillStyle = '#5a3d28';
  ctx.beginPath(); ctx.arc(0, -30, 6.5, Math.PI, Math.PI * 2); ctx.fill();

  /* چشم‌ها رو به جهت هدف */
  const look = Math.cos(state.aimAngle) >= 0 ? 1 : -1;
  ctx.fillStyle = '#1d2433';
  circle(look * 2.5 - 1.8, -31, 1.1); circle(look * 2.5 + 1.8, -31, 1.1);

  /* اسلحه: می‌چرخد رو به ماوس + عقب‌راندگی لحظه شلیک */
  ctx.save();
  ctx.translate(0, -17);
  ctx.rotate(state.aimAngle);
  ctx.translate(-state.recoil * 3, 0);
  ctx.fillStyle = '#2b2f38'; ctx.fillRect(-5, -3, 10, 6);   // بدنه اسلحه
  ctx.fillStyle = '#454b57'; ctx.fillRect(5, -2.5, 18, 5);  // لوله
  if (state.fireFlash > 0) {                                // شعله دهانه
    ctx.fillStyle = 'rgba(255,240,170,' + (state.fireFlash / 0.07).toFixed(2) + ')';
    circle(25, 0, 6);
  }
  ctx.restore();
  ctx.restore();
}

/* گلوله با دنباله درخشان */
function drawBullet(b) {
  ctx.strokeStyle = 'rgba(255,216,115,0.45)'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(b.x - b.vx * 0.04, b.y - b.vy * 0.04);
  ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.fillStyle = 'rgba(255,200,80,0.25)'; circle(b.x, b.y, 7);
  ctx.fillStyle = '#ffe9a8'; circle(b.x, b.y, 3.5);
}

/* سکه در حال چرخش (افکت سه‌بعدی با scale افقی) */
function drawCoin(c) {
  const s = Math.max(0.18, Math.abs(Math.cos(c.t * 5)));
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.fillStyle = 'rgba(245,197,66,0.22)'; circle(0, 0, 9);
  ctx.scale(s, 1);
  ctx.fillStyle = '#f5c542'; circle(0, 0, 6);
  ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffe98a'; circle(0, 0, 3);
  ctx.restore();
}

/* قوس‌های برق تله */
function drawZaps() {
  for (const zp of state.zaps) {
    const a = 1 - zp.age / zp.life;
    const passes = [
      [4, 'rgba(255,227,110,' + (a * 0.25).toFixed(2) + ')'],
      [2, 'rgba(255,240,160,' + a.toFixed(2) + ')'],
    ];
    for (const [lw, col] of passes) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(zp.pts[0].x, zp.pts[0].y);
      for (let i = 1; i < zp.pts.length; i++) ctx.lineTo(zp.pts[i].x, zp.pts[i].y);
      ctx.stroke();
    }
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const a = 1 - p.age / p.life;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = p.color;
    circle(p.x, p.y, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawTexts() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of state.texts) {
    const a = 1 - t.age / t.life;
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = 'bold ' + t.size + 'px Tahoma, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * a).toFixed(2) + ')';  // سایه متن
    ctx.fillText(t.str, t.x + 1, t.y + 1);
    ctx.fillStyle = t.color;
    ctx.fillText(t.str, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

/* نشانگر هدف‌گیری ماوس */
function drawReticle() {
  if (!canPlay()) return;
  const m = state.mouse;
  ctx.strokeStyle = 'rgba(255,90,80,0.85)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(m.x, m.y, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(m.x - 13, m.y); ctx.lineTo(m.x - 5, m.y);
  ctx.moveTo(m.x + 5, m.y); ctx.lineTo(m.x + 13, m.y);
  ctx.moveTo(m.x, m.y - 13); ctx.lineTo(m.x, m.y - 5);
  ctx.moveTo(m.x, m.y + 5); ctx.lineTo(m.x, m.y + 13);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,90,80,0.9)'; circle(m.x, m.y, 1.5);
}

/* فلش قرمز لبه صفحه موقع آسیب دیدن برج */
function drawFlash() {
  if (state.flash > 0) {
    ctx.fillStyle = 'rgba(255,40,30,' + (state.flash * 0.20).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

/* ترتیب رسم صحنه (از دور به نزدیک) */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  if (state.shake > 0.2) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  drawSky();
  drawTrap();
  drawTower();
  for (const z of state.zombies) drawZombie(z);
  drawPlayer();
  for (const b of state.bullets) drawBullet(b);
  for (const c of state.coinsArr) drawCoin(c);
  drawZaps();
  drawParticles();
  drawTexts();
  ctx.restore();
  drawReticle();   // لایه UI: بدون لرزش
  drawFlash();
}

/* ---------------------- ۱۴) رابط کاربری ---------------------- */
function showScreen(id) { $(id).classList.remove('hidden'); }
function hideScreen(id) { $(id).classList.add('hidden'); }
function hideOverlays() {
  ['startScreen', 'shopScreen', 'pauseScreen', 'gameoverScreen', 'victoryScreen'].forEach(hideScreen);
}

function pauseGame() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'paused';
  showScreen('pauseScreen');
  $('btnPause').textContent = '▶ ادامه';
}
function resumeGame() {
  if (state.mode !== 'paused') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('pauseScreen');
  $('btnPause').textContent = '⏸ توقف';
}
function openShop() {
  if (!canPlay()) return;
  state.prevMode = state.mode; state.mode = 'shop';
  refreshShop();
  showScreen('shopScreen');
}
function closeShop() {
  if (state.mode !== 'shop') return;
  state.mode = state.prevMode || 'playing';
  hideScreen('shopScreen');
}

/* به‌روزرسانی HUD (نوار جون، سکه، موج) */
function updateHUD() {
  const t = state.tower, ratio = t.hp / t.maxHp;
  const fill = $('healthFill');
  fill.style.width = (ratio * 100).toFixed(1) + '%';
  fill.className = ratio > 0.5 ? '' : (ratio > 0.25 ? 'mid' : 'low');
  $('healthText').textContent = faNum(Math.ceil(t.hp)) + '/' + faNum(t.maxHp);
  $('coinText').textContent = faNum(state.coins);
  $('waveText').textContent = 'موج ' + faNum(clamp(state.wave, 1, TOTAL_WAVES)) + '/' + faNum(TOTAL_WAVES);
}

/* به‌روزرسانی کارت‌های منوی ساخت‌وساز */
function setBuyBtn(btnId, kind) {
  const btn = $(btnId), u = UPGRADES[kind], lvl = state.upgrades[kind];
  if (lvl >= u.max) { btn.disabled = true; btn.textContent = 'حداکثر ✅'; return; }
  const price = priceOf(kind);
  btn.disabled = state.coins < price;
  btn.textContent = 'خرید — ' + faNum(price) + ' 💰';
}
function refreshShop() {
  $('shopCoins').textContent = faNum(state.coins);
  const w = state.upgrades.weapon, h = state.upgrades.health, t = state.upgrades.trap;

  $('weaponDesc').textContent = 'قدرت گلوله: ' + faNum(bulletDamage()) +
    (w < UPGRADES.weapon.max ? ' ← ' + faNum(bulletDamage() + 1) : '');
  $('weaponLvl').textContent = 'سطح ' + faNum(w) + ' از ' + faNum(UPGRADES.weapon.max);
  setBuyBtn('buyWeapon', 'weapon');

  $('healthDesc').textContent = 'حداکثر جون: ' + faNum(state.tower.maxHp) +
    (h < UPGRADES.health.max ? ' ← ' + faNum(state.tower.maxHp + UPGRADES.health.bonus) + ' (+' + faNum(UPGRADES.health.bonus) + ')' : '');
  $('healthLvl').textContent = 'سطح ' + faNum(h) + ' از ' + faNum(UPGRADES.health.max);
  setBuyBtn('buyHealth', 'health');

  $('trapDesc').textContent = t === 0
    ? 'آسیب خودکار به زامبی‌های نزدیک برج (' + faNum(trapDps(1)) + ' دمیج در ثانیه)'
    : 'آسیب خودکار: ' + faNum(trapDps(t)) + (t < UPGRADES.trap.max ? ' ← ' + faNum(trapDps(t + 1)) : '') + ' در ثانیه';
  $('trapLvl').textContent = 'سطح ' + faNum(t) + ' از ' + faNum(UPGRADES.trap.max);
  setBuyBtn('buyTrap', 'trap');
}

/* ---------------------- ۱۵) حلقه اصلی و راه‌اندازی ---------------------- */
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // سقف dt برای جلوگیری از پرش فیزیک
  last = now;
  animTime += dt;                                // زمان نمایشی همیشه جلو می‌رود
  if (state.mode === 'playing' || state.mode === 'intermission') update(dt);
  else if (state.mode === 'gameover' || state.mode === 'victory') updateFx(dt);
  render();
  requestAnimationFrame(frame);
}

function init() {
  /* اتصال دکمه‌ها */
  $('btnStart').addEventListener('click', startGame);
  $('btnPause').addEventListener('click', () => {
    if (state.mode === 'paused') resumeGame(); else pauseGame();
  });
  $('btnShop').addEventListener('click', openShop);
  $('closeShop').addEventListener('click', closeShop);
  $('btnResume').addEventListener('click', resumeGame);
  $('btnRestart0').addEventListener('click', startGame);
  $('btnRestart1').addEventListener('click', startGame);
  $('btnRestart2').addEventListener('click', startGame);
  $('buyWeapon').addEventListener('click', () => attemptBuy('weapon'));
  $('buyHealth').addEventListener('click', () => attemptBuy('health'));
  $('buyTrap').addEventListener('click', () => attemptBuy('trap'));

  updateHUD();
  refreshShop();
  requestAnimationFrame(frame);
}
init();

/* رابط اشکال‌زدایی/تست خودکار — برای توسعه‌های بعدی در دسترس است */
window.GAME = {
  state, startGame, startWave, spawnZombie, damageTower,
  giveCoins(n) { state.coins += n; updateHUD(); refreshShop(); },
  /* پرش سریع به موج n (برای تست) */
  skipToWave(n) {
    n = clamp(n, 1, TOTAL_WAVES);
    state.zombies = []; state.bullets = [];
    state.wave = n - 1;
    state.spawn = { remaining: 0, timer: 0, interval: 1 };
    if (state.mode === 'playing') waveComplete();
    else if (state.mode !== 'start' && state.mode !== 'gameover' && state.mode !== 'victory') {
      state.mode = 'intermission'; state.intermission = 0.3;
    }
  },
  /* شبیه‌سازی برد (برای تست) */
  win() {
    state.wave = TOTAL_WAVES;
    state.spawn = { remaining: 0, timer: 0, interval: 1 };
    state.zombies = []; state.bullets = [];
    if (state.mode === 'playing') waveComplete();
  },
};
</script>
</body>
</html>
