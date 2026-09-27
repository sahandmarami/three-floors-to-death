/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۳٫۰ — منطق بازی (بخش ۲: افکت‌ها، به‌روزرسانی و رسم)
     ۱۱) افکت‌ها (ذرات، متن شناور، برق تله، ترک خون، شهاب)
     ۱۲) حلقه به‌روزرسانی + صحنه‌ی زنده‌ی منو
     ۱۳) پایان بازی (برد/باخت)
     ۱۴) رسم صحنه با Canvas (آسمان/شهر/برج/زامبی‌ها/بازیکن/قدرت‌ها/UI)
   تازه‌های ۳٫۰ در این بخش:
     - لکه‌های خون ماندگار روی زمین، رعدوبرق، کرم شب‌تاب، چمن، برکه،
       درخت‌های خشک، تیرهای چراغ، آتش و دودِ برجِ زخمی، برفِ انجماد
     - رسم زامبی با عمق ردیف هجوم + لунجِ کوبیدن دیوار + یخ‌زدگی
     - کمبوی ضربه‌ای، حلقه‌ی زمان قدرت‌ها، فلش‌های لبه برای زامبی‌های خارج از کادر
     - نوارهای سینمایی اسلوموشن و نشانگر برخورد روی نشان هدف
   ================================================================== */

/* ---------------------- ۱۱) افکت‌ها ---------------------- */
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
    if (p.shell) p.rot += p.vr * dt;                   // چرخش پوکه
    if (p.y > GROUND_Y + 2 && p.vy > 0 && p.grav >= 0) { p.y = GROUND_Y + 2; p.vy *= -0.3; p.vx *= 0.6; } // وایراستن روی زمین
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

/* لکه‌های خون روی زمین (۳٫۰): آرام در طول زمان محو می‌شوند */
function addDecal(x, big) {
  state.decals.push({
    x: x + rand(-6, 6), y: GROUND_Y + rand(3, 10),
    r: big ? rand(7, 12) : rand(3.5, 7), a: 1,
  });
  if (state.decals.length > 45) state.decals.shift();  // سقف تعداد برای کارایی
}
function updateDecals(dt) {
  for (const d of state.decals) d.a -= dt / 18;
  state.decals = state.decals.filter(d => d.a > 0);
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

/* شهابِ گاه‌به‌گاه آسمان (در همه‌ی حالت‌ها، حتی منو) */
function updateShootingStar(dt) {
  if (shootStar) {
    shootStar.x += shootStar.vx * dt;
    shootStar.y += shootStar.vy * dt;
    shootStar.life -= dt;
    if (shootStar.life <= 0) shootStar = null;
  } else {
    shootStarT -= dt;
    if (shootStarT <= 0) {
      shootStar = { x: rand(150, W - 100), y: rand(20, 130), vx: -rand(300, 480), vy: rand(90, 160), life: 0.8 };
      shootStarT = rand(4, 9);
    }
  }
}

/* رعدوبرق گاه‌به‌گاه (۳٫۰): فقط صحنه را روشن می‌کند؛ آسیبی ندارد */
function updateLightning(dt) {
  const L = state.lightning;
  L.t -= dt;
  if (L.t <= 0) {
    L.a = 0.9; L.t = rand(13, 30);
    SFX.thunder();
  }
  if (L.a > 0) L.a = Math.max(0, L.a - dt * 2.6);
}

/* ---------------------- ۱۲) حلقه به‌روزرسانی ---------------------- */
function update(dt) {
  state.time += dt;
  fireTimer = Math.max(0, fireTimer - dt);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.fireFlash = Math.max(0, state.fireFlash - dt);
  state.recoil = Math.max(0, state.recoil - dt * 6);
  state.hitMark = Math.max(0, state.hitMark - dt);
  state.muzzleGlow = Math.max(0, state.muzzleGlow - dt);
  state.comboPop = Math.max(0, state.comboPop - dt);

  /* زمان‌سنج قدرت‌های ویژه */
  state.powerTimers.rapid = Math.max(0, state.powerTimers.rapid - dt);
  state.powerTimers.freeze = Math.max(0, state.powerTimers.freeze - dt);

  /* کمبو: اگر به‌موقع کشتار تازه نکنی محو می‌شود */
  if (state.combo > 0) {
    state.comboT -= dt;
    if (state.comboT <= 0) state.combo = 0;
  }

  /* برف ملایم هنگام انجماد (۳٫۰) */
  if (state.powerTimers.freeze > 0 && Math.random() < dt * 34) {
    state.particles.push({ x: rand(0, W), y: -6, vx: rand(-14, 14), vy: rand(30, 60),
      age: 0, life: rand(1.2, 2), size: rand(1.2, 2), color: 'rgba(225,240,255,0.85)', grav: 12 });
  }

  /* اسلحه همیشه رو به ماوس باشد؛ اگر ماوس پایین است شلیک خودکار ادامه یابد */
  updateAim();
  if (state.mouse.down && canPlay()) tryShoot();

  /* شمارش معکوس بین موج‌ها */
  if (state.mode === 'intermission') {
    state.intermission -= dt;
    if (state.intermission <= 0) startWave(state.wave + 1);
  }

  if (state.mode === 'playing') {
    /* تولد زامبی‌های صف موج فعلی — گاهی دوتایی می‌آیند (حسِ گله) */
    if (state.spawn.queue.length) {
      state.spawn.timer -= dt;
      if (state.spawn.timer <= 0) {
        const next = state.spawn.queue[0];
        if (next === 'boss' && !state.spawn.bossDelay) {
          /* ورود سینمایی پادشاه: تأخیر + زلزله + غرش */
          state.spawn.bossDelay = true;
          state.spawn.timer = 2.4;
          setAnnounce('زمین می‌لرزه... 👑', 'پادشاه زامبی‌ها داره میاد!', 2.2);
          state.shake = Math.min(12, state.shake + 8);
          SFX.roar();
        } else {
          spawnZombie(state.spawn.queue.shift());
          const burst = Math.random() < 0.12 ? 0.18 : 1;   // گاهی برس دو-تایی
          state.spawn.timer = state.spawn.interval * rand(0.7, 1.3) * burst;
        }
      }
    } else if (!state.zombies.some(z => !z.dead)) {
      waveComplete();                      // همه‌ی زامبی‌های موج از بین رفتند
    }
    updateTrap(dt);                        // تله پایه برج
    updateBossBar();                       // نوار جون پادشاه (اگر حاضر باشد)

    /* آتش و دود وقتی برج زخمی شده (۳٫۰) */
    const ratio = state.tower.hp / state.tower.maxHp;
    if (ratio < 0.4 && Math.random() < dt * (ratio < 0.2 ? 15 : 7)) {
      const spots = [
        [TOWER.x - 36, GROUND_Y - 108], [TOWER.x + 36, GROUND_Y - 108],
        [TOWER.x - 28, GROUND_Y - 176], [TOWER.x + 28, GROUND_Y - 176],
      ];
      const sp = spots[Math.floor(rand(0, 4))];
      if (Math.random() < 0.7) {
        spawnParticles(sp[0], sp[1], 1, Math.random() < 0.5 ? '#ff9a3d' : '#ffd24d',
          { dir: -Math.PI / 2, spread: 0.7, speed: 26, life: 0.7, size: 2.6, grav: -40 });
      } else {
        spawnParticles(sp[0], sp[1], 1, '#454a52',
          { dir: -Math.PI / 2, spread: 0.5, speed: 14, life: 1.5, size: 3.4, grav: -30 });
      }
    }
    /* ضربان قلب هشدار وقتی جون بحرانی است (۳٫۰) */
    if (ratio < 0.3) {
      state.heartT -= dt;
      if (state.heartT <= 0) { state.heartT = 1.15; SFX.heartbeat(); }
    }
  }

  if (canPlay()) {
    updateZombies(dt);
    updateBullets(dt);
    updateCoins(dt);
    updatePowerups(dt);
    updateDecals(dt);
  }
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
  updateAnnounce(dt);
}

/* افکت‌ها پس از پایان بازی (برد/باخت) همچنان تمام شوند */
function updateFx(dt) {
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.hitMark = Math.max(0, state.hitMark - dt);
  state.muzzleGlow = Math.max(0, state.muzzleGlow - dt);
  state.comboPop = Math.max(0, state.comboPop - dt);
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
}

/* ---------- صحنه‌ی زنده‌ی منوی اصلی ----------
   چند زامبی تزئینی دور صحنه خزند و هرگز به برج نمی‌رسند؛
   نزدیک که شدند از اولِ لبه‌ی صفحه با نوعی تازه ظاهر می‌شوند. */
const menuZ = [];
function makeMenuZombie(type, x) {
  const T = ZTYPES[type];
  return {
    type, x, y: GROUND_Y + rand(-3, 3), dir: x < W / 2 ? 1 : -1,
    radius: T.r, speed: T.spdBase * 0.7,
    walkPhase: rand(0, 6.28), attacking: false, attackAnim: 0,
    attackSide: 0, lane: 0, depth: 1, yJit: rand(-3, 3), stagger: 0,
    hitFlash: 0, dead: false, deathT: 0, hp: 1, maxHp: 1,
    biteInt: 1, biteTimer: 1, dmg: 0,
  };
}
function initMenuZ() {
  menuZ.length = 0;
  const types = ['normal', 'fast', 'tank', 'normal', 'fast'];
  const xs = [-60, W + 80, -260, W + 300, -430];
  for (let i = 0; i < types.length; i++) menuZ.push(makeMenuZombie(types[i], xs[i]));
}
function updateMenuScene(dt) {
  for (const z of menuZ) {
    z.walkPhase += dt * (4 + z.speed * 0.06);
    z.x += z.dir * z.speed * dt;
    if (Math.abs(z.x - TOWER.x) < 130) {
      /* رسید نزدیک برج: از اول بیرونِ قاب با نوعی تازه ظاهر می‌شود */
      const side = Math.random() < 0.5 ? -1 : 1;
      const type = ['normal', 'fast', 'normal', 'tank'][Math.floor(rand(0, 4))];
      Object.assign(z, makeMenuZombie(type, TOWER.x + side * (W / 2 + rand(40, 260))));
    }
  }
  updateParticles(dt); updateTexts(dt);   // ذراتِ شلیک آزمایشی/پوکه در منو هم تمام شوند
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
  const el = $('announce');
  $('announceBig').textContent = big;
  $('announceSub').textContent = sub;
  announceTimer = t;
  el.style.opacity = 1;
  /* ورود ضربه‌ای (۳٫۰) */
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}
function hideAnnounce() { $('announce').style.opacity = 0; announceTimer = 0; }

/* ---------------------- ۱۳) پایان بازی ---------------------- */
function gameOver() {
  if (state.mode === 'gameover') return;
  state.mode = 'gameover';
  state.mouse.down = false;
  state.combo = 0;
  state.shake = 14; state.flash = 1;
  /* آوار و گردوخاک سقوط برج */
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 36, '#8a6f52', { speed: 260, life: 0.9, size: 3.5, grav: 600 });
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 16, '#e04b3a', { speed: 200, life: 0.7, size: 3, grav: 600 });
  $('goSubtitle').textContent = 'برج سقوط کرد... تا موج ' + faNum(state.wave) + ' از ' + faNum(TOTAL_WAVES) + ' دووم آوردی.';
  $('goStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه جمع‌شده: <b>' + faNum(state.stats.earned) +
    '</b> &nbsp;|&nbsp; 🔥 بهترین کمبو: <b>×' + faNum(state.stats.maxCombo) + '</b> &nbsp;|&nbsp; 🔫 شلیک: <b>' + faNum(state.stats.shots) + '</b>';
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  hideAnnounce();
  SFX.gameover();
  showScreen('gameoverScreen');
}

function victory() {
  if (state.mode === 'victory') return;
  state.mode = 'victory';
  state.mouse.down = false;
  state.combo = 0;
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 30, '#ffd873', { speed: 240, life: 1.1, size: 3, grav: 350 });
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 20, '#7bd389', { speed: 200, life: 1.0, size: 2.6, grav: 350 });
  $('vStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه: <b>' + faNum(state.stats.earned) +
    '</b> &nbsp;|&nbsp; 🔥 بهترین کمبو: <b>×' + faNum(state.stats.maxCombo) + '</b> &nbsp;|&nbsp; ❤️ جون باقی‌مانده: <b>' + faNum(Math.ceil(state.tower.hp)) + '</b>';
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  hideAnnounce();
  SFX.victory();
  showScreen('victoryScreen');
}

/* ---------------------- ۱۴) رسم صحنه با Canvas ---------------------- */
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

/* آسمان شب: گرادیان آبی تیره + ستاره‌های چشمک‌زن + ماه با هاله و دهانه‌ها */
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

  /* ماه */
  const mx = 172, my = 86, mr = 34;
  const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.7);
  glow.addColorStop(0, 'rgba(244,238,210,0.30)'); glow.addColorStop(1, 'rgba(244,238,210,0)');
  ctx.fillStyle = glow; circle(mx, my, mr * 2.7);
  ctx.fillStyle = '#f2ead0'; circle(mx, my, mr);
  ctx.fillStyle = 'rgba(120,110,80,0.16)';
  circle(mx - 10, my - 6, 6); circle(mx + 8, my + 9, 4.5); circle(mx + 13, my - 11, 3);
}

/* ابرهای شناور تیره (با حرکت آرام و پیوسته از راست به چپ) */
function drawClouds() {
  ctx.fillStyle = 'rgba(13,20,44,0.85)';
  for (const c of CLOUDS) {
    const m = W + 300;
    const x = (((c.x - animTime * c.v) % m) + m) % m - 150;
    const y = c.y, s = c.s;
    ctx.beginPath();
    ctx.ellipse(x, y, 46 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 34 * s, y - 6 * s, 30 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 36 * s, y + 2 * s, 26 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* افق شهر در دوردست: آسمان‌خراش‌های سیاه‌شکلی با پنجره‌های روشن */
function drawSkyline() {
  ctx.fillStyle = '#0b1226';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
  /* لبه‌ی روشن‌ترِ پشت‌بام‌ها برای جدا شدن از آسمان */
  ctx.fillStyle = '#141d3d';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h, b.w, 2.5);
  for (const w2 of SKYLINE_WINS) {
    ctx.fillStyle = w2.c;
    ctx.fillRect(w2.x, w2.y, 2.5, 3.5);
  }
}

/* تپه‌های دوردست در دو لایه برای عمق + زمین و جاده خاکی */
function drawHills() {
  ctx.fillStyle = '#13203f'; drawHillRow(HILLS1);
  ctx.fillStyle = '#0d1731'; drawHillRow(HILLS2);

  ctx.fillStyle = '#151d0e'; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  ctx.fillStyle = '#2c261d'; ctx.fillRect(-20, GROUND_Y, W + 40, 18);
  ctx.strokeStyle = 'rgba(96,84,60,0.8)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y); ctx.lineTo(W + 20, GROUND_Y); ctx.stroke();
  ctx.fillStyle = 'rgba(120,105,80,0.35)';
  for (const p of PEBBLES) circle(p.x, GROUND_Y + p.dy, p.r);
}
function drawHillRow(pts) {
  ctx.beginPath();
  ctx.moveTo(-20, GROUND_Y);
  for (const p of pts) ctx.lineTo(p.x, GROUND_Y - p.h);
  ctx.lineTo(W + 20, GROUND_Y);
  ctx.closePath(); ctx.fill();
}

/* برکه‌های کوچک با بازتاب ماه (۳٫۰) */
function drawPuddles() {
  for (const p of PUDDLES) {
    const sh = 0.5 + 0.5 * Math.sin(animTime * 1.3 + p.x);
    ctx.fillStyle = 'rgba(120,150,205,0.10)';
    ctx.beginPath(); ctx.ellipse(p.x, GROUND_Y + 8, p.w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    /* رد بازتاب عمودی نور ماه روی آب */
    ctx.fillStyle = 'rgba(200,220,255,' + (0.05 + sh * 0.05).toFixed(2) + ')';
    ctx.fillRect(p.x - 1.2, GROUND_Y + 3, 2.4, 9);
  }
}

/* دسته‌های چمن تاب‌خورده (۳٫۰) */
function drawGrass() {
  ctx.strokeStyle = 'rgba(62,88,46,0.9)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const g of GRASS) {
    const sway = Math.sin(animTime * 1.5 + g.ph) * 2.2;
    for (let b = -1; b <= 1; b++) {
      ctx.moveTo(g.x + b * 2.4, GROUND_Y + 1);
      ctx.quadraticCurveTo(g.x + b * 2.4 + sway * 0.5, GROUND_Y - g.h * 0.6,
        g.x + b * 2.4 + sway + b * 1.5, GROUND_Y - g.h);
    }
  }
  ctx.stroke();
}

/* لکه‌های خون روی زمین (۳٫۰) */
function drawDecals() {
  for (const d of state.decals) {
    /* دو لایه: هسته‌ی پررنگ + هاله‌ی گسترده‌تر برای دیده‌شدن روی خاک تیره */
    ctx.fillStyle = 'rgba(122,26,18,' + (0.55 * d.a).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(158,40,28,' + (0.35 * d.a).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r * 0.55, d.r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/* رعدوبرق: آسمان و زمین لحظه‌ای روشن می‌شوند (۳٫۰) */
function drawLightning() {
  const a = state.lightning.a;
  if (a <= 0.02) return;
  const flick = 0.55 + 0.45 * Math.abs(Math.sin(animTime * 55));
  const k = a * flick;
  ctx.fillStyle = 'rgba(205,225,255,' + (0.30 * k).toFixed(2) + ')';
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 20);
  ctx.fillStyle = 'rgba(205,225,255,' + (0.10 * k).toFixed(2) + ')';
  ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
}

/* درخت خشک سیاه‌شکلی (۳٫۰) */
function drawTree(x, s) {
  ctx.save();
  ctx.translate(x, GROUND_Y + 2);
  ctx.scale(s, s);
  ctx.strokeStyle = '#0a0f1e'; ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(2, -44); ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(2, -40); ctx.lineTo(-14, -58);
  ctx.moveTo(2, -36); ctx.lineTo(16, -54);
  ctx.moveTo(2, -44); ctx.lineTo(-8, -70);
  ctx.moveTo(2, -42); ctx.lineTo(10, -72);
  ctx.moveTo(2, -44); ctx.lineTo(1, -80);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-14, -58); ctx.lineTo(-22, -64);
  ctx.moveTo(-8, -70); ctx.lineTo(-13, -78);
  ctx.moveTo(16, -54); ctx.lineTo(24, -60);
  ctx.moveTo(10, -72); ctx.lineTo(15, -80);
  ctx.moveTo(1, -80); ctx.lineTo(-4, -88);
  ctx.stroke();
  ctx.restore();
}

/* تیرهای چراغ با مخروط نور چشمک‌زن (۳٫۰) */
const LAMPS = [236, 724];
function drawLamps() {
  for (const lx of LAMPS) {
    /* سوسوی ملایم + چشمکِ گاه‌به‌گاه */
    let fl = 0.8 + 0.2 * Math.sin(animTime * 9 + lx) * Math.sin(animTime * 3.7 + lx * 2);
    if (Math.random() < 0.012) fl = 0.3;
    ctx.strokeStyle = '#151d33'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y + 2); ctx.lineTo(lx, GROUND_Y - 58); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y - 58); ctx.lineTo(lx + 10, GROUND_Y - 58); ctx.stroke();
    ctx.fillStyle = '#1c2742'; rr(lx + 5, GROUND_Y - 62, 12, 7, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,214,120,' + (0.75 * fl).toFixed(2) + ')';
    circle(lx + 11, GROUND_Y - 56, 3);
    /* مخروط نور به سمت زمین */
    const g = ctx.createLinearGradient(lx + 11, GROUND_Y - 54, lx + 11, GROUND_Y + 6);
    g.addColorStop(0, 'rgba(255,205,110,' + (0.15 * fl).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(255,205,110,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(lx + 5, GROUND_Y - 54); ctx.lineTo(lx + 17, GROUND_Y - 54);
    ctx.lineTo(lx + 34, GROUND_Y + 6); ctx.lineTo(lx - 12, GROUND_Y + 6);
    ctx.closePath(); ctx.fill();
    /* برکه‌ی نور روی زمین */
    ctx.fillStyle = 'rgba(255,205,110,' + (0.06 * fl).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(lx + 11, GROUND_Y + 6, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/* نور محیطیِ دهانه‌ی اسلحه (۳٫۰): دایره‌ی گرم و محو اطراف دهانه */
function drawMuzzleGlow() {
  if (state.muzzleGlow <= 0) return;
  const w = WEAPONS[state.weapon];
  const m = gunMuzzle(w.barrel);
  const a = state.muzzleGlow / 0.07;
  const g = ctx.createRadialGradient(m.x, m.y, 4, m.x, m.y, 85);
  g.addColorStop(0, 'rgba(255,225,150,' + (0.20 * a).toFixed(2) + ')');
  g.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = g; circle(m.x, m.y, 85);
}

/* کرم‌های شب‌تاب (۳٫۰) */
function drawFireflies() {
  for (const f of FIREFLIES) {
    const x = f.cx + Math.sin(animTime * f.sp + f.ph) * f.rx;
    const y = f.cy + Math.sin(animTime * f.sp * 1.7 + f.ph * 2) * f.ry;
    const a = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(animTime * 2.2 + f.ph * 3));
    ctx.fillStyle = 'rgba(205,245,150,' + (a * 0.25).toFixed(2) + ')';
    circle(x, y, 3.4);
    ctx.fillStyle = 'rgba(230,255,190,' + a.toFixed(2) + ')';
    circle(x, y, 1.3);
  }
}

/* شهاب آسمان (خط نورانی محوشونده) */
function drawShootingStar() {
  if (!shootStar) return;
  const a = clamp(shootStar.life / 0.8, 0, 1);
  const g = ctx.createLinearGradient(shootStar.x, shootStar.y,
    shootStar.x - shootStar.vx * 0.14, shootStar.y - shootStar.vy * 0.14);
  g.addColorStop(0, 'rgba(255,255,255,' + (0.9 * a).toFixed(2) + ')');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(shootStar.x, shootStar.y);
  ctx.lineTo(shootStar.x - shootStar.vx * 0.14, shootStar.y - shootStar.vy * 0.14);
  ctx.stroke();
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

  /* خارهای فلزی دو طرف پایه برج — با هر سطح بلندتر و پرتعدادتر */
  const perSide = 4 + lvl;
  for (const side of [-1, 1]) {
    for (let i = 0; i < perSide; i++) {
      const x = TOWER.x + side * (TOWER.baseHalf + 8 + i * 7);
      const h = 10 + lvl * 1.6 + (i > perSide - 2 ? -4 : 0);
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
  const ratio = state.tower.hp / state.tower.maxHp;
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

  /* پنجره‌های نورانی با سوسوی ملایم (وقتی برج زخمی است چشمک هم می‌زنند) */
  const wins = [
    { x: -36, y: GROUND_Y - 46 }, { x: 36, y: GROUND_Y - 46 },
    { x: -38, y: GROUND_Y - 108 }, { x: 38, y: GROUND_Y - 108 },
    { x: -28, y: GROUND_Y - 176 }, { x: 28, y: GROUND_Y - 176 },
  ];
  wins.forEach((w2, i) => {
    let a = 0.66 + 0.25 * Math.sin(animTime * 2.1 + i * 1.9);
    if (ratio < 0.5 && Math.random() < 0.05) a *= 0.2;   // چشمکِ برق‌گرفتگی
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

/* زامبی: بر اساس نوع رسم می‌شود (معمولی/سریع/تانک/پادشاه)
   - پاهای متحرک، دست‌های کشیده، سر خمیده و چشم‌های درخشان
   - سریع: کج به جلو + خط‌های سرعت
   - تانک: زره شانه + کلاه‌خود فولادی
   - پادشاه: تاج + هاله‌ی مهیب + چشم‌های بنفش
   - مرگ: کج شدن و محو شدن تدریجی
   - ۳٫۰: مقیاس عمق ردیف هجوم + لونجِ کوبیدن دیوار + لایه‌ی یخ هنگام انجماد */
function drawZombie(z) {
  const T = ZTYPES[z.type];
  const s = (z.radius / 15) * (z.depth || 1);   // اندازه‌ی نوع × عمق ردیف
  const flash = z.hitFlash > 0;
  const skin = flash ? '#d9f2c6' : T.skin;
  const shirt = flash ? '#9db4cc' : T.shirt;
  const pants = flash ? '#5d6a80' : T.pants;

  /* سایه روی زمین */
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(z.x, z.y + 2, 13 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();

  ctx.save();
  /* لونج: موقع حمله به سمت دیوار برج شیرجه می‌رود */
  const lunge = z.attacking ? Math.sin(z.attackAnim) * 3.5 : 0;
  ctx.translate(z.x + z.dir * lunge, z.y);

  /* انیمیشن مرگ: کج شدن به عقب + فرو رفتن + محو شدن */
  if (z.dead) {
    const t = clamp(z.deathT / 0.55, 0, 1);
    ctx.globalAlpha = 1 - t;
    ctx.rotate(-z.dir * t * 1.5);
    ctx.translate(0, t * 7);
  }

  ctx.scale(z.dir * s, s);                 // آینه بر اساس جهت حرکت + مقیاس نوع

  const walk = Math.sin(z.walkPhase);
  const bob = z.attacking ? Math.sin(z.attackAnim) * 1.5 : Math.abs(walk) * 1.2;

  /* نوع سریع: کج به جلو + خط‌های سرعت پشت سرش */
  if (z.type === 'fast' && !z.dead) {
    ctx.rotate(-0.12);
    ctx.strokeStyle = 'rgba(220,190,120,0.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-14, -20); ctx.lineTo(-24, -20);
    ctx.moveTo(-13, -14); ctx.lineTo(-21, -14);
    ctx.stroke();
  }

  /* پاها */
  ctx.strokeStyle = pants; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -13); ctx.lineTo(-4 + (z.attacking ? 0 : walk * 6), -1);
  ctx.moveTo(4, -13); ctx.lineTo(4 - (z.attacking ? 0 : walk * 6), -1);
  ctx.stroke();

  /* بدن و پارگی پیراهن */
  ctx.fillStyle = shirt; rr(-9, -31 + bob * 0.4, 18, 19, 4); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-3, -24 + bob * 0.4, 6, 7);

  /* زره‌ی شونه برای تانک و پادشاه */
  if (z.type === 'tank' || z.type === 'boss') {
    ctx.fillStyle = z.type === 'boss' ? '#3f151d' : '#39364a';
    ctx.fillRect(-11, -33 + bob * 0.4, 7, 6);
    ctx.fillRect(4, -33 + bob * 0.4, 7, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(-11, -33 + bob * 0.4, 7, 6);
    ctx.strokeRect(4, -33 + bob * 0.4, 7, 6);
  }

  /* بازوهای کشیده به جلو (موقع حمله می‌کوبند) */
  const armY = -27 + bob * 0.4;
  const armSw = z.attacking ? Math.sin(z.attackAnim) * 4 : Math.sin(z.walkPhase * 0.5) * 2;
  ctx.strokeStyle = skin; ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-5, armY + 2); ctx.lineTo(13, armY + armSw);
  ctx.moveTo(5, armY + 3); ctx.lineTo(14, armY + 5 + armSw * 0.6);
  ctx.stroke();
  ctx.fillStyle = skin;
  circle(13, armY + armSw, 3); circle(14, armY + 5 + armSw * 0.6, 3);

  /* سر + مو */
  ctx.fillStyle = skin; circle(3, -36 + bob * 0.5, 7);
  ctx.fillStyle = '#2f3b26';
  ctx.beginPath(); ctx.arc(3, -36 + bob * 0.5, 7, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();

  /* کلاه‌خود فولادی تانک */
  if (z.type === 'tank') {
    ctx.fillStyle = '#5c5f74';
    ctx.fillRect(-4, -44 + bob * 0.5, 14, 4);
  }
  /* تاجِ پادشاه */
  if (z.type === 'boss') {
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(-3, -42 + bob * 0.5); ctx.lineTo(-3, -48 + bob * 0.5); ctx.lineTo(0, -44 + bob * 0.5);
    ctx.lineTo(3, -49 + bob * 0.5); ctx.lineTo(6, -44 + bob * 0.5); ctx.lineTo(9, -48 + bob * 0.5);
    ctx.lineTo(9, -42 + bob * 0.5); ctx.closePath(); ctx.fill();
  }

  /* چشم‌های درخشان (قرمز؛ پادشاه بنفش) */
  if (!z.dead) {
    ctx.save();
    ctx.shadowColor = z.type === 'boss' ? '#c44dff' : '#ff4b3e';
    ctx.shadowBlur = 5 * s;
    ctx.fillStyle = flash ? '#ffffff' : (z.type === 'boss' ? '#c44dff' : '#ff4b3e');
    circle(5.5, -37 + bob * 0.5, 1.6); circle(8.8, -37.5 + bob * 0.5, 1.6);
    ctx.restore();
  }

  /* هاله‌ی مهیب و تپنده‌ی پادشاه */
  if (z.type === 'boss' && !z.dead) {
    ctx.strokeStyle = 'rgba(196,77,223,' + (0.22 + 0.12 * Math.sin(animTime * 3)).toFixed(2) + ')';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(4, -22, 30, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.restore();

  /* لایه‌ی یخ هنگام انجماد (۳٫۰) */
  if (!z.dead && state.powerTimers.freeze > 0) {
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#a5d8ff';
    circle(z.x, z.y - 18 * s, 14 * s + 3);
    ctx.globalAlpha = 1;
  }

  /* نوار جون بالای سر (وقتی آسیب دیده) */
  if (!z.dead && z.hp < z.maxHp - 0.001) {
    const w2 = Math.max(26, 30 * s), ratio2 = clamp(z.hp / z.maxHp, 0, 1);
    const by = z.y - 50 * s - 8;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(z.x - w2 / 2, by, w2, 4.5, 2); ctx.fill();
    ctx.fillStyle = ratio2 > 0.5 ? '#6fce62' : (ratio2 > 0.25 ? '#e7b53a' : '#e04b3a');
    ctx.fillRect(z.x - w2 / 2 + 0.75, by + 0.75, (w2 - 1.5) * ratio2, 3);
  }
}

/* بازیکن: نگهبان کوچک روی بام برج با اسلحه‌ی چرخانِ رو به ماوس */
function drawPlayer() {
  const px = TOWER.x, py = TOWER_TOP_Y;
  const bob = Math.sin(animTime * 2.4) * 1.1;
  const w = WEAPONS[state.weapon];
  ctx.save();
  ctx.translate(px, py + bob * 0.4);

  /* حلقه‌ی زردِ چرخان وقتی «شلیک سریع» فعال است (۳٫۰) */
  if (state.powerTimers.rapid > 0) {
    ctx.strokeStyle = 'rgba(255,216,115,' + (0.4 + 0.3 * Math.sin(animTime * 10)).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 1, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
  }

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
  if (state.weapon === 'pistol') {
    ctx.fillStyle = '#2b2f38'; ctx.fillRect(-4, -2.5, 9, 5);     // بدنه
    ctx.fillStyle = '#454b57'; ctx.fillRect(5, -2, 13, 4);       // لوله
  } else if (state.weapon === 'shotgun') {
    ctx.fillStyle = '#4a3320'; ctx.fillRect(-8, -3, 12, 6);      // قنداق چوبی
    ctx.fillStyle = '#2b2f38'; ctx.fillRect(2, -3, 20, 5);       // لوله‌ی دوقلو
    ctx.fillStyle = '#6b4a2c'; ctx.fillRect(8, 2, 8, 4);         // پمپ
  } else {                                                       // مسلسل
    ctx.fillStyle = '#2b2f38'; ctx.fillRect(-6, -3.5, 26, 6);    // بدنه
    ctx.fillStyle = '#454b57'; ctx.fillRect(20, -2.5, 12, 4);    // لوله
    ctx.fillStyle = '#31363f'; circle(6, 5, 5);                  // خشاب گرد
    ctx.fillRect(-6, 2.5, 4, 3);                                 // قنداق کوتاه
  }
  /* شعله‌ی دهانه‌ی اسلحه (اندازه‌اش به سلاح بستگی دارد) */
  if (state.fireFlash > 0) {
    const a = state.fireFlash / 0.07;
    ctx.fillStyle = 'rgba(255,240,170,' + a.toFixed(2) + ')';
    circle(w.barrel + 12, 0, w.flash * (0.6 + 0.4 * a));
  }
  ctx.restore();
  ctx.restore();
}

/* حلقه‌ی زمانِ قدرت‌های فعال بالای سر بازیکن (۳٫۰) */
function drawPowerTimers() {
  const defs = [
    { key: 'rapid',  color: '#ffd873', max: PTYPES.rapid.dur,  icon: 'bolt' },
    { key: 'freeze', color: '#8fd6ff', max: PTYPES.freeze.dur, icon: 'snow' },
  ];
  let i = 0;
  for (const d of defs) {
    const t = state.powerTimers[d.key];
    if (t <= 0) continue;
    const x = TOWER.x - 30 + i * 60, y = TOWER_TOP_Y - 58;
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = d.color;
    ctx.beginPath(); ctx.arc(x, y, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (t / d.max)); ctx.stroke();
    /* آیکن کوچک داخل حلقه */
    ctx.save(); ctx.translate(x, y);
    if (d.icon === 'bolt') {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.moveTo(2, -6); ctx.lineTo(-3, 1); ctx.lineTo(0, 1); ctx.lineTo(-2, 6); ctx.lineTo(4, -1); ctx.lineTo(1, -1);
      ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = d.color; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k < 3; k++) {
        const a = k * Math.PI / 3;
        ctx.moveTo(-Math.cos(a) * 6, -Math.sin(a) * 6);
        ctx.lineTo(Math.cos(a) * 6, Math.sin(a) * 6);
      }
      ctx.stroke();
    }
    ctx.restore();
    i++;
  }
}

/* گلوله با دنباله درخشان (ساچمه‌های شاتگان ریزترند) */
function drawBullet(b) {
  const tl = b.pellet ? 0.022 : 0.04;
  ctx.strokeStyle = 'rgba(255,216,115,0.45)'; ctx.lineWidth = b.pellet ? 2 : 3;
  ctx.beginPath();
  ctx.moveTo(b.x - b.vx * tl, b.y - b.vy * tl);
  ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.fillStyle = 'rgba(255,200,80,0.25)'; circle(b.x, b.y, b.pellet ? 5 : 7);
  ctx.fillStyle = '#ffe9a8'; circle(b.x, b.y, b.pellet ? 2.5 : 3.5);
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

/* آیکن برداری جعبه‌های قدرت (بدون وابستگی به فونت ایموجی) */
function drawPowerIcon(type) {
  if (type === 'medkit') {
    ctx.fillStyle = '#f2f5f9'; rr(-7, -5.5, 14, 11, 2.5); ctx.fill();
    ctx.strokeStyle = '#b9c2cf'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.rect(-7, -5.5, 14, 11); ctx.stroke();
    ctx.fillStyle = '#e04b3a';
    ctx.fillRect(-1.6, -4, 3.2, 8); ctx.fillRect(-4.5, -1.4, 9, 2.8);
  } else if (type === 'rapid') {
    ctx.fillStyle = '#ffd873';
    ctx.beginPath();
    ctx.moveTo(2.5, -8); ctx.lineTo(-3.5, 1); ctx.lineTo(-0.5, 1);
    ctx.lineTo(-2.5, 8); ctx.lineTo(4, -1.5); ctx.lineTo(1, -1.5);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a5a12'; ctx.lineWidth = 1; ctx.stroke();
  } else if (type === 'freeze') {
    ctx.strokeStyle = '#a8e2ff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI / 3;
      ctx.moveTo(-Math.cos(a) * 7, -Math.sin(a) * 7);
      ctx.lineTo(Math.cos(a) * 7, Math.sin(a) * 7);
    }
    ctx.stroke();
    ctx.fillStyle = '#e8f7ff'; circle(0, 0, 2);
  } else {   /* coin */
    for (let k = -1; k <= 1; k++) {
      ctx.fillStyle = '#f5c542'; circle(0, k * 4, 4);
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(0, k * 4, 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.fillStyle = '#fff3bd'; circle(0, 0, 1.6);
  }
}

/* جعبه‌های قدرت روی صحنه (۳٫۰): هاله‌ی رنگی + شنا شدن + چشمکِ پایان عمر */
function drawPowerups() {
  for (const p of state.powerups) {
    const def = PTYPES[p.type];
    const blink = p.t > POWER_LIFE - 2 ? (Math.sin(p.t * 18) > 0 ? 1 : 0.25) : 1;
    const by = p.phase === 'wait' ? Math.sin(animTime * 4 + p.bob) * 3 : 0;
    ctx.save();
    ctx.globalAlpha = blink;
    ctx.translate(p.x, p.y + by);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    g.addColorStop(0, hexA(def.color, 0.4));
    g.addColorStop(1, hexA(def.color, 0));
    ctx.fillStyle = g; circle(0, 0, 16);
    drawPowerIcon(p.type);
    ctx.restore();
  }
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
    if (p.glow) {
      /* ذره‌ی نورانی (روح زامبی و...) */
      ctx.save();
      ctx.shadowColor = p.color; ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      circle(p.x, p.y, p.size);
      ctx.restore();
    } else if (p.shell) {
      /* پوکه‌ی چرخان مستطیلی */
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size, -p.size * 0.55, p.size * 2, p.size * 1.1);
      ctx.restore();
    } else {
      ctx.fillStyle = p.color;
      circle(p.x, p.y, p.size);
    }
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

/* شمارنده‌ی کمبوی ضربه‌ای (۳٫۰) — بالای صحنه */
function drawCombo() {
  if (state.combo < 2 || !canPlay()) return;
  const scale = 1 + state.comboPop * 1.6;
  ctx.save();
  ctx.translate(W / 2, 118);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '900 26px Tahoma, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillText('کمبو ×' + faNum(state.combo), 2, 2);
  ctx.fillStyle = state.combo >= 8 ? '#ff9d3d' : '#ffd873';
  ctx.fillText('کمبو ×' + faNum(state.combo), 0, 0);
  ctx.restore();
}

/* فلش‌های قرمز لبه‌ی صفحه برای زامبی‌های خارج از کادر (۳٫۰) */
function drawOffscreenArrows() {
  if (state.mode !== 'playing') return;
  for (const z of state.zombies) {
    if (z.dead) continue;
    const off = z.x < -12 ? -1 : (z.x > W + 12 ? 1 : 0);
    if (!off) continue;
    const ax = off < 0 ? 14 : W - 14;
    const ay = clamp(z.y - 26, 60, GROUND_Y - 30);
    const pulse = 0.55 + 0.45 * Math.sin(animTime * 7);
    const big = z.type === 'boss';
    const s2 = big ? 1.5 : 1;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.scale(-off, 1);                     // نوکِ فلش همیشه رو به داخل صحنه
    ctx.globalAlpha = pulse;
    ctx.fillStyle = big ? '#ffd873' : '#ff5d4d';
    ctx.beginPath();
    ctx.moveTo(10 * s2, 0); ctx.lineTo(-4 * s2, -8 * s2); ctx.lineTo(-4 * s2, 8 * s2);
    ctx.closePath(); ctx.fill();
    if (big) { ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; circle(0, 0, 3); }
    ctx.restore();
  }
}

/* نشانگر هدف‌گیری ماوس */
function drawReticle() {
  if (!canPlay()) return;
  const m = state.mouse;
  const r = 9 + state.recoil * 2.5;         // با شلیک باز می‌شود
  ctx.strokeStyle = 'rgba(255,90,80,0.85)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(m.x, m.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(m.x - r - 4, m.y); ctx.lineTo(m.x - r + 2, m.y);
  ctx.moveTo(m.x + r - 2, m.y); ctx.lineTo(m.x + r + 4, m.y);
  ctx.moveTo(m.x, m.y - r - 4); ctx.lineTo(m.x, m.y - r + 2);
  ctx.moveTo(m.x, m.y + r - 2); ctx.lineTo(m.x, m.y + r + 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,90,80,0.9)'; circle(m.x, m.y, 1.5);
}

/* نشانگر برخورد گلوله روی نشان هدف (۳٫۰) */
function drawHitMark() {
  if (state.hitMark <= 0) return;
  const a = state.hitMark / 0.14;
  const m = state.mouse;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.strokeStyle = state.hitMarkCrit ? '#ffb347' : '#ffffff';
  ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  const r1 = 5, r2 = 11;
  ctx.beginPath();
  for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    ctx.moveTo(m.x + dx * r1, m.y + dy * r1);
    ctx.lineTo(m.x + dx * r2, m.y + dy * r2);
  }
  ctx.stroke();
  ctx.restore();
}

/* فلش قرمزِ تمام‌صفحه موقع آسیب دیدن برج */
function drawFlash() {
  if (state.flash > 0) {
    ctx.fillStyle = 'rgba(255,40,30,' + (state.flash * 0.20).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

/* هشدار قرمزِ تپنده وقتی جون برج بحرانی است (زیر ۳۰٪) */
function drawVignette() {
  if (!canPlay()) return;
  const ratio = state.tower.hp / state.tower.maxHp;
  if (ratio >= 0.3) return;
  const a = Math.max(0, (0.3 - ratio) / 0.3 * (0.2 + 0.12 * Math.sin(animTime * 6)));
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.78);
  g.addColorStop(0, 'rgba(180,20,20,0)');
  g.addColorStop(1, 'rgba(180,20,20,' + a.toFixed(2) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* ته‌رنگ آبی هنگام انجماد (۳٫۰) */
function drawFreezeOverlay() {
  if (state.powerTimers.freeze <= 0) return;
  const a = Math.min(0.16, state.powerTimers.freeze * 0.05);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
  g.addColorStop(0, 'rgba(140,200,255,0)');
  g.addColorStop(1, 'rgba(140,200,255,' + a.toFixed(2) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* نوارهای سینمایی اسلوموشن (۳٫۰) */
function drawCinematic() {
  if (state.slowmo <= 0) return;
  const k = Math.min(1, state.slowmo * 2.2);
  const h = Math.round(30 * k);
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, h);
  ctx.fillRect(0, H - h, W, h);
}

/* ترتیب رسم صحنه (از دور به نزدیک) — در منو زامبی‌های تزئینی رسم می‌شوند */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  if (state.shake > 0.2) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  drawSky();
  drawClouds();
  drawSkyline();
  drawHills();
  drawPuddles();
  drawGrass();
  drawDecals();
  drawLightning();
  drawTree(88, 0.95);
  drawTree(874, 0.7);
  drawLamps();
  drawMuzzleGlow();
  drawShootingStar();
  drawFireflies();
  drawTrap();
  drawTower();
  /* زامبی‌ها بر اساس عمق (y) مرتب می‌شوند تا ردیف‌های عقب پشت سر جلو دیده شوند */
  const zlist = (state.mode === 'start' ? menuZ : state.zombies).slice().sort((a, b) => a.y - b.y);
  for (const z of zlist) drawZombie(z);
  drawPlayer();
  drawPowerTimers();
  for (const b of state.bullets) drawBullet(b);
  for (const c of state.coinsArr) drawCoin(c);
  drawPowerups();
  drawZaps();
  drawParticles();
  drawTexts();
  ctx.restore();
  /* لایه‌ی UI: بدون لرزش */
  drawOffscreenArrows();
  drawReticle();
  drawHitMark();
  drawCombo();
  drawFlash();
  drawVignette();
  drawFreezeOverlay();
  drawCinematic();
}
