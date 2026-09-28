/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۷٫۰ — منطق بازی (بخش ۲: افکت‌ها، به‌روزرسانی و رسم + هوک‌های کات‌سین)
     ۱۱) افکت‌ها (ذرات، متن شناور، برق تله، ترک خون، شهاب)
     ۱۲) حلقه به‌روزرسانی + صحنه‌ی زنده‌ی منو
     ۱۳) پایان بازی (برد/باخت)
     ۱۴) رسم صحنه با Canvas (آسمان/شهر/برج/زامبی‌ها/بازیکن/قدرت‌ها/UI)
   تازه‌های ۶٫۰ در این بخش (ارتقای کلی گرافیک):
     - آسمان غنی‌تر + ستاره‌های درشت چهارپر + ماه/خورشید پرجزئیات
     - ابرهای چندلایه + دکل آنتن با چراغ قرمز + مهِ پایه‌ی شهر
     - زمین با گرادیان/چمن‌لبه/مسیر فرسوده/گل‌ها + نور تاج تپه‌ها
     - برجِ بازطراحی‌شده (سکو، بافت بلوک/آجر، کنگره، پنجره‌ی قوس‌دار، بنر)
     - جزئیات زامبی (پیراهن پاره، خون دهان، برق مهتاب) + غبار گام‌ها
     - گریدینگ رنگی سینمایی: تینت سرد شب + گرمای روز + وینیت نرم
     - لکه‌های خون ماندگار روی زمین، رعدوبرق، کرم شب‌تاب، چمن، برکه،
       درخت‌های خشک، تیرهای چراغ، آتش و دودِ برجِ زخمی، برفِ انجماد
     - رسم زامبی با عمق ردیف هجوم + لунجِ کوبیدن دیوار + یخ‌زدگی
     - کمبوی ضربه‌ای، حلقه‌ی زمان قدرت‌ها، فلش‌های لبه برای زامبی‌های خارج از کادر
     - نوارهای سینمایی اسلوموشن و نشانگر برخورد روی نشان هدف
   ================================================================== */

/* ---------------------- ۱۱) افکت‌ها ---------------------- */
/* تولید ذره (پارتیکل) — o: {speed, life, size, grav, dir, spread, up}
   (۱۲٫۰) سقف ذرات: در رگبارهای سنگین دیگر بی‌مرز انباشته نمی‌شود */
const PARTS_MAX = 300;
function spawnParticles(x, y, n, color, o = {}) {
  if (state.particles.length >= PARTS_MAX) return;
  const speed = o.speed || 120, life = o.life || 0.4;
  const size = o.size || 2.5, grav = (o.grav === undefined ? 400 : o.grav);
  n = Math.min(n, PARTS_MAX - state.particles.length);
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
    if (shootStarT <= 0 && state.dayness < 0.4) {   // فقط شب (۵٫۰)
      shootStar = { x: rand(150, W - 100), y: rand(20, 130), vx: -rand(300, 480), vy: rand(90, 160), life: 0.8 };
      shootStarT = rand(4, 9);
    }
  }
}

/* رعدوبرق گاه‌به‌گاه (۳٫۰): فقط صحنه را روشن می‌کند؛ آسیبی ندارد — فقط شب (۵٫۰) */
function updateLightning(dt) {
  const L = state.lightning;
  if (state.dayness > 0.35) {              // در روز رعدوبرقی نیست
    L.a = 0;
    L.t = rand(6, 12);
    return;
  }
  L.t -= dt;
  if (L.t <= 0) {
    L.a = 0.9;
    const Lr = curCh().theme.lightning || [13, 30];   // (۱۰٫۰) فصل ۴: آسمان خشمگین‌تر
    L.t = rand(Lr[0], Lr[1]);
    SFX.thunder();
  }
  if (L.a > 0) L.a = Math.max(0, L.a - dt * 2.6);
}

/* ---------------------- ۱۲) حلقه به‌روزرسانی ---------------------- */
function update(dt) {
  state.time += dt;

  /* ---- چرخه‌ی روز و شب (۵٫۰) ----
     dayness با گذار نمایی به سمت dayTarget می‌لغزد (~۲ ثانیه):
     ۰ = شب کامل (ماه/ستاره/رعد) • ۱ = روز کامل (خورشید/آسمان روشن) */
  if (Math.abs(state.dayness - state.dayTarget) > 0.0008) {
    state.dayness += (state.dayTarget - state.dayness) * Math.min(1, dt * 1.15);
  }
  /* پایان گذار به شب بعد از کلیک «شب شود»: موج بعد شروع می‌شود */
  if (state.mode === 'day' && state.goingNight && state.dayness <= 0.08) {
    state.goingNight = false;
    state.dayness = 0;
    startWave(state.wave + 1);
  }

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
  if (state.mouse.down && canPlay() && !state.placing) tryShoot();

  /* شمارش معکوس شروع بازی (فقط قبل از موج ۱؛ بعد از هر موج به‌جای این
     وقفه، «روز» می‌شود و بازیکن خودش شب را شروع می‌کند — ۵٫۰) */
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
          /* ورود سینمایی باس: تأخیر + زلزله + غرش — (۱۰٫۰) نگهبانِ آخرین شب */
          state.spawn.bossDelay = true;
          state.spawn.timer = 2.4;
          setAnnounce(state.wave >= FINAL_WAVE ? '🌑 زمین می‌لرزه...' : 'زمین می‌لرزه... 👑',
            state.wave >= FINAL_WAVE ? 'نگهبانِ آخرین شب داره میاد!' : 'پادشاه زامبی‌ها داره میاد!', 2.2);
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
    updateTurrets(dt);                     // برجک‌های دفاعی خودکار (۴٫۰)
    updateCoins(dt);
    updatePowerups(dt);
    updateDecals(dt);
  }
  updateParticles(dt); updateTexts(dt); updateZaps(dt);
  updateAnnounce(dt);
  hooksUpdate(dt);                           // (۱۰٫۰) چراغ‌قوه/قطع برق/شفای تدریجی/کارت فصل/باس
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
    $('announceBig').textContent = 'موج بعدی: ' + faNum(waveInChapter(state.wave + 1));
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

/* ---------------------- ۱۳) پایان بازی (۱۲٫۰) ----------------------
   باخت دیگر یک‌باره نیست: اول سینماییِ سقوط برج (بالا آمدن زامبی‌ها +
   فروریختن طبقه‌طبقه + کوبیدن بام) پخش می‌شود، بعد صفحه‌ی باخت با
   «ادامه از آخرین روز» می‌آید. */
function gameOver() {
  if (state.mode === 'gameover' || state.mode === 'defeatcine') return;
  state.mouse.down = false;
  state.placing = null;                     // لغو نصبِ نیمه‌کاره
  state.combo = 0;
  state.dayTarget = 0;                      // باخت همیشه در شب رخ می‌دهد
  hideDayPanel();                           // پنل روز بسته شود
  state.shake = 14; state.flash = 1;
  /* آوار و گردوخاک سقوط برج */
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 36, '#8a6f52', { speed: 260, life: 0.9, size: 3.5, grav: 600 });
  spawnParticles(TOWER.x, TOWER_TOP_Y + 40, 16, '#e04b3a', { speed: 200, life: 0.7, size: 3, grav: 600 });
  startDefeatCine();                        // (۱۲٫۰) سینماییِ سقوط برج
}

/* مسیر مستقیمِ قدیمی (بدون سینمایی) — فقط پشتیبان */
function legacyGameOver() {
  if (state.mode === 'gameover') return;
  state.mode = 'gameover';
  $('goSubtitle').textContent = 'برج سقوط کرد... تا ' + faNum(state.wave) + ' شب از ' + faNum(FINAL_WAVE) + ' دووم آوردی.';
  $('goStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه جمع‌شده: <b>' + faNum(state.stats.earned) +
    '</b> &nbsp;|&nbsp; 🔥 بهترین کمبو: <b>×' + faNum(state.stats.maxCombo) + '</b> &nbsp;|&nbsp; 🛡 کشتار برجک‌ها: <b>' + faNum(state.stats.turKills) +
    '</b> &nbsp;|&nbsp; 🔫 شلیک: <b>' + faNum(state.stats.shots) + '</b>';
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  hideAnnounce();
  SFX.gameover();
  showScreen('gameoverScreen');
}

function victory() {
  if (state.mode === 'victory') return;
  state.mode = 'victory';
  state.mouse.down = false;
  state.placing = null;                     // لغو نصبِ نیمه‌کاره (۴٫۰)
  state.combo = 0;
  state.dayTarget = 1;                      // پیروزی در روشنایی روز (۵٫۰)
  hideDayPanel();
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 30, '#ffd873', { speed: 240, life: 1.1, size: 3, grav: 350 });
  spawnParticles(TOWER.x, TOWER_TOP_Y - 30, 20, '#7bd389', { speed: 200, life: 1.0, size: 2.6, grav: 350 });
  $('vStats').innerHTML = '🧟 کشتار: <b>' + faNum(state.stats.kills) + '</b> &nbsp;|&nbsp; 💰 سکه: <b>' + faNum(state.stats.earned) +
    '</b> &nbsp;|&nbsp; 🔥 بهترین کمبو: <b>×' + faNum(state.stats.maxCombo) + '</b> &nbsp;|&nbsp; 🛡 کشتار برجک‌ها: <b>' + faNum(state.stats.turKills) +
    '</b> &nbsp;|&nbsp; ❤️ جون باقی‌مانده: <b>' + faNum(Math.ceil(state.tower.hp)) +
    '</b> &nbsp;|&nbsp; 🌙 شب‌های زنده‌ماندن: <b>' + faNum(FINAL_WAVE) + '/' + faNum(FINAL_WAVE) + '</b>';
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

/* ترکیب دو رنگ hex با ضریب t (۵٫۰: گذار نرم روز/شب) */
function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + ((((pb >> 16) & 255) - ((pa >> 16) & 255)) * t));
  const g = Math.round(((pa >> 8) & 255) + ((((pb >> 8) & 255) - ((pa >> 8) & 255)) * t));
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return 'rgb(' + r + ',' + g + ',' + bl + ')';
}

/* آسمان شب: گرادیان آبی تیره + ستاره‌های چشمک‌زن + ماه با هاله و دهانه‌ها
   (۵٫۰: با dayness به آسمان روشن روز و خورشید گذار می‌کند)
   (۶٫۰: گرادیان چهارلایه + ستاره‌های درشتِ چهارپر + ماه/خورشید پرجزئیات)
   (۱۰٫۰) پالت آسمان از تنظیمات فصل خوانده می‌شود — محله‌ی آجری،
     انبارهای مه‌گرفته، پاسگاه سرخ‌وشب و قله‌ی بارانی هرکدام آسمان خودشان را دارند */
function drawSky() {
  const d = state.dayness;                  // ۰ = شب کامل، ۱ = روز کامل
  const th = curCh().theme;
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  const stops = [0, 0.42, 0.78, 1];
  th.sky.forEach((s, i) => g.addColorStop(stops[i], mixHex(s[0], s[1], d)));
  ctx.fillStyle = g;
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 40);

  /* افق دودی/مه‌آلود فصل‌های خرابه و انبار (۱۰٫۰) */
  if (th.smoke) {
    const a = th.smoke.a[0] + (th.smoke.a[1] - th.smoke.a[0]) * d;
    const sm = ctx.createLinearGradient(0, GROUND_Y - 170, 0, GROUND_Y);
    sm.addColorStop(0, 'rgba(' + th.smoke.c + ',0)');
    sm.addColorStop(1, 'rgba(' + th.smoke.c + ',' + a.toFixed(2) + ')');
    ctx.fillStyle = sm;
    ctx.fillRect(-20, GROUND_Y - 170, W + 40, 170);
  }

  /* ستاره‌های ریز فقط شب (با طلوع محو می‌شوند) */
  if (d < 0.98) {
    const sf = 1 - d;
    for (const s of STARS) {
      const a = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(animTime * s.sp + s.ph))) * sf;
      if (a < 0.02) continue;
      ctx.fillStyle = 'rgba(215,228,255,' + a.toFixed(2) + ')';
      circle(s.x, s.y, s.r);
    }
    /* ستاره‌های درشت با برقِ چهارپر (۶٫۰) */
    for (const s of BIGSTARS) {
      const tw = 0.5 + 0.5 * Math.sin(animTime * s.sp + s.ph);
      const a = (0.35 + 0.65 * tw) * sf;
      if (a < 0.03) continue;
      const L = s.r * (2.1 + tw * 1.6);
      ctx.strokeStyle = 'rgba(230,240,255,' + (a * 0.85).toFixed(2) + ')';
      ctx.lineWidth = 1.1; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x - L, s.y); ctx.lineTo(s.x + L, s.y);
      ctx.moveTo(s.x, s.y - L); ctx.lineTo(s.x, s.y + L);
      ctx.stroke();
      ctx.fillStyle = 'rgba(245,250,255,' + a.toFixed(2) + ')';
      circle(s.x, s.y, s.r * 0.8);
    }
  }

  /* ماه شب — (۱۰٫۰) جایگاه/اندازه/رنگ ماهِ هر فصل از تنظیمات فصل
     (فصل ۳: ماه خونیِ بزرگ سمت راست؛ فصل ۴: ماه رنگ‌پریده پشت ابرها) */
  if (d < 0.98) {
    const M = th.moon;
    const blood = !!M.blood;
    const mx = M.x, my = M.y, mr = M.r;
    ctx.globalAlpha = (1 - d) * (M.dim || 1);
    const gcol = blood ? '224,84,64' : '244,238,210';
    const glow = ctx.createRadialGradient(mx, my, mr * 0.45, mx, my, mr * (blood ? 3.6 : 3));
    glow.addColorStop(0, 'rgba(' + gcol + ',' + (blood ? 0.4 : 0.34) + ')');
    glow.addColorStop(1, 'rgba(' + gcol + ',0)');
    ctx.fillStyle = glow; circle(mx, my, mr * (blood ? 3.6 : 3));
    if (blood) {                             // هاله‌ی سرخِ گسترده‌ی ماه خونی
      const g2 = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 5.4);
      g2.addColorStop(0, 'rgba(190,50,40,0.16)'); g2.addColorStop(1, 'rgba(190,50,40,0)');
      ctx.fillStyle = g2; circle(mx, my, mr * 5.4);
    }
    const body = ctx.createRadialGradient(mx - mr * 0.45, my - mr * 0.5, mr * 0.2, mx, my, mr);
    if (blood) {
      body.addColorStop(0, '#ffb09a'); body.addColorStop(0.55, '#e2604c'); body.addColorStop(1, '#9c2c24');
    } else {
      body.addColorStop(0, '#f9f3dd'); body.addColorStop(0.55, '#efe6c4'); body.addColorStop(1, '#cfc39c');
    }
    ctx.fillStyle = body; circle(mx, my, mr);
    ctx.fillStyle = blood ? 'rgba(90,22,20,0.28)' : 'rgba(120,110,80,0.16)';
    circle(mx - 12, my - 8, 7); circle(mx + 9, my + 10, 5); circle(mx + 15, my - 12, 3.4);
    circle(mx - 2, my + 16, 3); circle(mx - 20, my + 8, 2.6);
    ctx.strokeStyle = blood ? 'rgba(255,190,170,0.5)' : 'rgba(255,252,235,0.5)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(mx, my, mr - 1, Math.PI * 0.95, Math.PI * 1.55); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* خورشید روز (۵٫۰): هاله‌ی گرم + ۱۲ پرتوِ چرخان بلندتر + برق عدسی (۶٫۰) */
  if (d > 0.02) {
    const sx = 790, sy = 92, sr = 30;
    ctx.globalAlpha = d;
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.35, sx, sy, sr * 3.4);
    glow.addColorStop(0, 'rgba(255,240,180,0.55)'); glow.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = glow; circle(sx, sy, sr * 3.4);
    ctx.fillStyle = '#ffe28a'; circle(sx, sy, sr);
    ctx.fillStyle = '#fff7cf'; circle(sx - sr * 0.25, sy - sr * 0.28, sr * 0.6);
    ctx.strokeStyle = 'rgba(255,235,160,' + (0.55 * d).toFixed(2) + ')';
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let k = 0; k < 12; k++) {
      const a = animTime * 0.25 + k * Math.PI / 6;
      const len = sr + 19 + 4 * Math.sin(animTime * 2 + k);
      ctx.moveTo(sx + Math.cos(a) * (sr + 9), sy + Math.sin(a) * (sr + 9));
      ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,246,200,' + (0.35 * d).toFixed(2) + ')';
    circle(sx - 66, sy + 40, 7); circle(sx - 108, sy + 66, 4);
    ctx.globalAlpha = 1;
  }
}

/* ابرهای شناور (۵٫۰: شب تیره، روز سفید — با حرکت آرام پیوسته از راست به چپ)
   (۶٫۰: سه‌لایه — سایه‌ی زیرین، بدنه و هایلایت بالایی — برای حجم و نرمی) */
function drawClouds() {
  const d = state.dayness;
  const dark = 'rgba(' + Math.round(9 + 185 * d) + ',' + Math.round(14 + 180 * d) + ',' + Math.round(34 + 170 * d) + ',0.82)';
  const main = 'rgba(' + Math.round(15 + 225 * d) + ',' + Math.round(22 + 220 * d) + ',' + Math.round(44 + 200 * d) + ',0.85)';
  const hi = 'rgba(' + Math.round(46 + 205 * d) + ',' + Math.round(64 + 190 * d) + ',' + Math.round(94 + 160 * d) + ',0.5)';
  for (const c of CLOUDS) {
    const m = W + 300;
    const x = (((c.x - animTime * c.v) % m) + m) % m - 150;
    const y = c.y, s = c.s;
    cloudBlob(x, y + 3 * s, s, dark);                  // سایه‌ی زیرین
    cloudBlob(x, y, s, main);                          // بدنه
    cloudBlob(x - 8 * s, y - 4 * s, s * 0.6, hi);      // هایلایت بالایی
  }
}
function cloudBlob(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(x, y, 46 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 34 * s, y - 6 * s, 30 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 36 * s, y + 2 * s, 26 * s, 10 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* افق شهر در دوردست (۵٫۰: شب سیاه‌شکلی با پنجره‌های روشن؛ روز خاکستری روشن)
   (۶٫۰: سوسوی مستقل پنجره‌ها + دکل آنتن با چراغ قرمز + مهِ پایه‌ی ساختمان‌ها) */
function drawSkyline() {
  const d = state.dayness;
  const sk = curCh().theme.skyline;           // (۱۰٫۰) افقِ مخصوص هر فصل
  if (sk === 'ruin') { drawRuinedSkyline(d); return; }            // پاسگاه نظامی (۷٫۰)
  if (sk === 'warehouse') { drawWarehouseSkyline(d); return; }    // منطقه‌ی انبارها (۱۰٫۰)
  if (sk === 'mountain') { drawMountainSkyline(d); return; }      // برج مخابراتی (۱۰٫۰)
  ctx.fillStyle = mixHex('#0b1226', '#6a7d96', d);
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
  /* لبه‌ی روشن‌ترِ پشت‌بام‌ها برای جدا شدن از آسمان */
  ctx.fillStyle = mixHex('#141d3d', '#8fa2b8', d);
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h, b.w, 2.5);
  /* پنجره‌ها فقط شب روشن‌اند (روز همه سرِ کارند!) — با سوسوی مستقل (۶٫۰) */
  if (d < 0.95) {
    const nf = 1 - d;
    for (const w2 of SKYLINE_WINS) {
      const tw = 0.7 + 0.3 * Math.sin(animTime * 1.4 + w2.ph);
      ctx.globalAlpha = nf * tw;
      ctx.fillStyle = w2.c;
      ctx.fillRect(w2.x, w2.y, 2.5, 3.5);
    }
    ctx.globalAlpha = 1;
  }
  /* دکل‌های آنتن روی پشت‌بامِ بلندها + چراغ قرمز چشمک‌زنِ هشدار (۶٫۰) */
  ctx.strokeStyle = mixHex('#0e1630', '#55667e', d);
  ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  for (const a of ANTENNAS) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.top); ctx.lineTo(a.x, a.top - a.h);
    ctx.moveTo(a.x - 3.5, a.top - a.h * 0.35); ctx.lineTo(a.x + 3.5, a.top - a.h * 0.35);
    ctx.stroke();
    if (d < 0.7) {                        // چراغ هشدار فقط شب کار می‌کند
      const blink = Math.sin(animTime * 1.6 + a.ph) > 0.1 ? 1 : 0.12;
      const aa = (1 - d) * blink;
      const g2 = ctx.createRadialGradient(a.x, a.top - a.h, 0, a.x, a.top - a.h, 5);
      g2.addColorStop(0, 'rgba(255,70,60,' + (0.8 * aa).toFixed(2) + ')');
      g2.addColorStop(1, 'rgba(255,70,60,0)');
      ctx.fillStyle = g2; circle(a.x, a.top - a.h, 5);
      ctx.fillStyle = 'rgba(255,120,110,' + aa.toFixed(2) + ')';
      circle(a.x, a.top - a.h, 1.6);
    }
  }
  /* مهِ پایه‌ی ساختمان‌ها: انتقال نرم به تپه‌ها (۶٫۰) */
  const fog = ctx.createLinearGradient(0, GROUND_Y - 46, 0, GROUND_Y);
  fog.addColorStop(0, 'rgba(90,115,165,0)');
  fog.addColorStop(1, d > 0.5 ? 'rgba(190,215,232,' + (0.20 * d).toFixed(2) + ')'
                              : 'rgba(70,95,150,' + (0.16 * (1 - d)).toFixed(2) + ')');
  ctx.fillStyle = fog;
  ctx.fillRect(-20, GROUND_Y - 46, W + 40, 46);
}

/* تپه‌های دوردست در دو لایه برای عمق + زمین (۵٫۰: رنگ روز)
   (۶٫۰: نور تاجِ تپه‌ها + خاک گرادیانی + لبه‌ی چمن + مسیر فرسوده‌ی زامبی‌ها + گل‌ها) */
function drawHills() {
  const d = state.dayness;
  const GC = curCh().theme.ground;           // (۱۰٫۰) رنگ تپه/زمین هر فصل
  ctx.fillStyle = mixHex(GC.h1[0], GC.h1[1], d); drawHillRow(HILLS1);
  strokeCrest(HILLS1, mixHex(GC.h1c[0], GC.h1c[1], d));
  ctx.fillStyle = mixHex(GC.h2[0], GC.h2[1], d); drawHillRow(HILLS2);
  strokeCrest(HILLS2, mixHex(GC.h2c[0], GC.h2c[1], d));

  /* زمین: خاک با گرادیان عمقی */
  const gg = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gg.addColorStop(0, mixHex(GC.soil[0], GC.soil[1], d));
  gg.addColorStop(1, mixHex(GC.soilD[0], GC.soilD[1], d));
  ctx.fillStyle = gg;
  ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);

  /* نوار چمنِ بالای زمین + لبه‌ی ناهموارِ تیغه‌ها */
  ctx.fillStyle = mixHex(GC.grass[0], GC.grass[1], d);
  ctx.fillRect(-20, GROUND_Y - 2, W + 40, 9);
  ctx.strokeStyle = mixHex(GC.blade[0], GC.blade[1], d);
  ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const e of GRASS_EDGE) {
    const sway = Math.sin(animTime * 1.6 + e.ph) * 1.2;
    ctx.moveTo(e.x, GROUND_Y + 2);
    ctx.lineTo(e.x + sway, GROUND_Y - e.h);
  }
  ctx.stroke();

  /* مسیر فرسوده‌ی زامبی‌ها: دو باند خاکی روشن‌تر از دو طرف برج (۶٫۰) */
  const pathA = d > 0.5 ? 0.26 + 0.10 * d : 0.30 * (1 - d * 0.4);
  ctx.fillStyle = 'rgba(112,96,64,' + pathA.toFixed(2) + ')';
  ctx.beginPath(); ctx.ellipse(TOWER.x - 185, GROUND_Y + 7, 172, 8.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(TOWER.x + 185, GROUND_Y + 7, 172, 8.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(58,48,34,0.25)';        // ردِ تیره‌تر وسط مسیر
  ctx.beginPath(); ctx.ellipse(TOWER.x - 185, GROUND_Y + 8, 128, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(TOWER.x + 185, GROUND_Y + 8, 128, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  /* رگه‌های افقی بافت خاک (۶٫۰) */
  for (const s of GROUND_STREAKS) {
    ctx.fillStyle = 'rgba(0,0,0,' + s.a.toFixed(2) + ')';
    ctx.fillRect(s.x, GROUND_Y + s.dy, s.w, 2);
    ctx.fillStyle = 'rgba(255,240,200,' + (s.a * 0.5).toFixed(2) + ')';
    ctx.fillRect(s.x + 6, GROUND_Y + s.dy + 2.4, s.w * 0.8, 1.2);
  }

  /* سنگ‌ریزه‌ها (۳٫۰) */
  ctx.fillStyle = 'rgba(120,105,80,0.35)';
  for (const p of PEBBLES) circle(p.x, GROUND_Y + p.dy, p.r);

  /* گل‌های کوچک فقط محله‌ی قدیمی؛ فصل خرابه: رد سوختگی (۱۰٫۰) */
  if (GC.scorch) {
    for (const f of FLOWERS) {
      const x = f.x, y = GROUND_Y + f.dy;
      ctx.fillStyle = 'rgba(18,12,9,0.55)';
      ctx.beginPath(); ctx.ellipse(x, y, 4.5 * f.s, 1.6 * f.s, 0, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  for (const f of FLOWERS) {
    const x = f.x, y = GROUND_Y + f.dy;
    ctx.strokeStyle = mixHex('#2c3d1c', '#4c7a34', d);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 2); ctx.lineTo(x + Math.sin(animTime + f.ph) * 1, y - 4 * f.s);
    ctx.stroke();
    if (d > 0.35) {
      ctx.fillStyle = 'hsl(' + f.hue + ',65%,' + Math.round(58 + 14 * d) + '%)';
      for (let k = 0; k < 5; k++) {
        const a = k * 1.256 + f.ph;
        circle(x + Math.cos(a) * 2.6 * f.s, y - 5 * f.s + Math.sin(a) * 2.6 * f.s, 1.5 * f.s);
      }
      ctx.fillStyle = 'rgba(255,240,160,0.95)';
      circle(x, y - 5 * f.s, 1.2 * f.s);
    } else {
      ctx.fillStyle = 'rgba(150,150,140,0.4)';
      circle(x, y - 5 * f.s, 1.4 * f.s);
    }
  }
}
function drawHillRow(pts) {
  ctx.beginPath();
  ctx.moveTo(-20, GROUND_Y);
  for (const p of pts) ctx.lineTo(p.x, GROUND_Y - p.h);
  ctx.lineTo(W + 20, GROUND_Y);
  ctx.closePath(); ctx.fill();
}
/* خط روشنِ تاج تپه‌ها (۶٫۰) — حس حجم و نور پشت صحنه */
function strokeCrest(pts, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-20, GROUND_Y - pts[0].h);
  for (const p of pts) ctx.lineTo(p.x, GROUND_Y - p.h);
  ctx.lineTo(W + 20, GROUND_Y - pts[pts.length - 1].h);
  ctx.stroke();
}

/* برکه‌های کوچک (۳٫۰): شب بازتاب ماه؛ روز آسمان آبی را برمی‌گردانند (۵٫۰) */
function drawPuddles() {
  const d = state.dayness;
  for (const p of PUDDLES) {
    const sh = 0.5 + 0.5 * Math.sin(animTime * 1.3 + p.x);
    ctx.fillStyle = d > 0.5 ? 'rgba(140,190,235,0.16)' : 'rgba(120,150,205,0.10)';
    ctx.beginPath(); ctx.ellipse(p.x, GROUND_Y + 8, p.w / 2, 5, 0, 0, Math.PI * 2); ctx.fill();
    /* رد بازتاب عمودی: شب نور ماه، روز آسمان روشن */
    const refA = (1 - d) * (0.05 + sh * 0.05) + d * 0.07;
    ctx.fillStyle = d > 0.5 ? 'rgba(190,225,255,' + refA.toFixed(2) + ')' : 'rgba(200,220,255,' + refA.toFixed(2) + ')';
    ctx.fillRect(p.x - 1.2, GROUND_Y + 3, 2.4, 9);
  }
}

/* دسته‌های چمن تاب‌خورده (۳٫۰) */
function drawGrass() {
  ctx.strokeStyle = state.towerVariant === 1 ? 'rgba(96,86,70,0.9)' : 'rgba(62,88,46,0.9)';   // (۷٫۰) کاه خاکستر
  ctx.lineWidth = 1.4; ctx.lineCap = 'round';
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
  if (a <= 0.02 || state.dayness > 0.5) return;   // فقط شب (۵٫۰)
  const flick = 0.55 + 0.45 * Math.abs(Math.sin(animTime * 55));
  const k = a * flick;
  ctx.fillStyle = 'rgba(205,225,255,' + (0.30 * k).toFixed(2) + ')';
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 20);
  ctx.fillStyle = 'rgba(205,225,255,' + (0.10 * k).toFixed(2) + ')';
  ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
}

/* درخت خشک سیاه‌شکلی (۳٫۰) */
/* درخت صحنه — dead=true: نسخه‌ی سوخته/شکسته با شاخه‌های کج و اخگرِ پای تنه (۸٫۰) */
function drawTree(x, s, dead) {
  ctx.save();
  ctx.translate(x, GROUND_Y + 2);
  ctx.scale(s, s);
  ctx.strokeStyle = dead ? '#171210' : '#0a0f1e'; ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(dead ? -4 : 2, -44); ctx.stroke();
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (dead) {
    /* شاخه‌های سوخته‌ی کوتاه‌تر و شکسته */
    ctx.moveTo(-4, -34); ctx.lineTo(-16, -46);
    ctx.moveTo(-4, -30); ctx.lineTo(10, -44);
    ctx.moveTo(-4, -38); ctx.lineTo(2, -56);
    ctx.moveTo(-4, -36); ctx.lineTo(-12, -50);
  } else {
    ctx.moveTo(2, -40); ctx.lineTo(-14, -58);
    ctx.moveTo(2, -36); ctx.lineTo(16, -54);
    ctx.moveTo(2, -44); ctx.lineTo(-8, -70);
    ctx.moveTo(2, -42); ctx.lineTo(10, -72);
    ctx.moveTo(2, -44); ctx.lineTo(1, -80);
  }
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (dead) {
    ctx.moveTo(-16, -46); ctx.lineTo(-21, -52);
    ctx.moveTo(10, -44); ctx.lineTo(15, -50);
    ctx.moveTo(-12, -50); ctx.lineTo(-16, -57);
  } else {
    ctx.moveTo(-14, -58); ctx.lineTo(-22, -64);
    ctx.moveTo(-8, -70); ctx.lineTo(-13, -78);
    ctx.moveTo(16, -54); ctx.lineTo(24, -60);
    ctx.moveTo(10, -72); ctx.lineTo(15, -80);
    ctx.moveTo(1, -80); ctx.lineTo(-4, -88);
  }
  ctx.stroke();
  if (dead) {
    /* رد سوختگی پای تنه + اخگر چشمک‌زن */
    ctx.fillStyle = 'rgba(10,7,6,0.6)';
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    const ea = 0.35 + 0.3 * Math.sin(animTime * 5 + x);
    ctx.fillStyle = 'rgba(255,120,50,' + ea.toFixed(2) + ')';
    circle(-2, -5, 1.8);
  }
  ctx.restore();
}

/* تیرهای چراغ با مخروط نور چشمک‌زن (۳٫۰) — در روز کم‌نور (۵٫۰) */
const LAMPS = [236, 724];
function drawLamps() {
  const dim = 1 - state.dayness * 0.9;      // چراغ‌ها در روز تقریباً خاموش‌اند
  const warm = state.towerVariant === 1 ? '255,110,70' : '255,214,120';   // (۷٫۰) نور اضطراری در شهر سوخته
  for (const lx of LAMPS) {
    /* سوسوی ملایم + چشمکِ گاه‌به‌گاه */
    let fl = 0.8 + 0.2 * Math.sin(animTime * 9 + lx) * Math.sin(animTime * 3.7 + lx * 2);
    if (Math.random() < 0.012) fl = 0.3;
    fl *= dim;
    ctx.strokeStyle = mixHex('#151d33', '#3a4457', state.dayness); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y + 2); ctx.lineTo(lx, GROUND_Y - 58); ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y - 58); ctx.lineTo(lx + 10, GROUND_Y - 58); ctx.stroke();
    ctx.fillStyle = '#1c2742'; rr(lx + 5, GROUND_Y - 62, 12, 7, 2); ctx.fill();
    ctx.fillStyle = 'rgba(' + warm + ',' + (0.75 * fl).toFixed(2) + ')';
    circle(lx + 11, GROUND_Y - 56, 3);
    /* مخروط نور به سمت زمین */
    const g = ctx.createLinearGradient(lx + 11, GROUND_Y - 54, lx + 11, GROUND_Y + 6);
    g.addColorStop(0, 'rgba(' + warm + ',' + (0.15 * fl).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(' + warm + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(lx + 5, GROUND_Y - 54); ctx.lineTo(lx + 17, GROUND_Y - 54);
    ctx.lineTo(lx + 34, GROUND_Y + 6); ctx.lineTo(lx - 12, GROUND_Y + 6);
    ctx.closePath(); ctx.fill();
    /* برکه‌ی نور روی زمین */
    ctx.fillStyle = 'rgba(' + warm + ',' + (0.06 * fl).toFixed(2) + ')';
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

/* کرم‌های شب‌تاب (۳٫۰) — فقط شب (۵٫۰) */
function drawFireflies() {
  const nf = 1 - state.dayness;             // با طلوع محو می‌شوند
  if (nf < 0.1) return;
  const th = curCh().theme;                  // (۱۰٫۰)
  if (th.fog > 0.4 || th.snow) return;      // انبار مه‌گرفته و قله‌ی برفی: کرم شب‌تاب نیست
  const ember = !!th.emberEyes;              // فصل خرابه: اخگر به‌جای کرم شب‌تاب
  for (const f of FIREFLIES) {
    const x = f.cx + Math.sin(animTime * f.sp + f.ph) * f.rx;
    let y = f.cy + Math.sin(animTime * f.sp * 1.7 + f.ph * 2) * f.ry;
    if (ember) y = f.cy - ((animTime * 9 + f.ph * 20) % 60);   // بالا خزیدن اخگر
    const a = (0.18 + 0.5 * (0.5 + 0.5 * Math.sin(animTime * 2.2 + f.ph * 3))) * nf;
    ctx.fillStyle = ember ? 'rgba(255,120,50,' + (a * 0.22).toFixed(2) + ')' : 'rgba(205,245,150,' + (a * 0.25).toFixed(2) + ')';
    circle(x, y, 3.4);
    ctx.fillStyle = ember ? 'rgba(255,190,120,' + a.toFixed(2) + ')' : 'rgba(230,255,190,' + a.toFixed(2) + ')';
    circle(x, y, 1.3);
  }
}

/* بارش خاکستر (۸٫۰) — فقط شهر سوخته: دانه‌های خاکستری که آرام می‌بارند؛
   شب پررنگ‌تر از روز. موقعیت خالصِ تابعی از animTime است (بدون state). */
const ASH_FLAKES = Array.from({ length: 46 }, () => ({
  x: srand() * W, y0: srand() * (GROUND_Y + 30),
  v: 16 + srand() * 26, sw: 0.4 + srand() * 0.9,
  ph: srand() * 6.28, r: 0.9 + srand() * 1.5,
}));
function drawAsh() {
  if (!curCh().theme.ash) return;           // (۱۰٫۰) فقط فصل خرابه‌ها
  const d = state.dayness;
  const a0 = 0.2 + 0.18 * (1 - d);
  for (const f of ASH_FLAKES) {
    const y = (f.y0 + animTime * f.v) % (GROUND_Y + 34) - 14;
    const x = f.x + Math.sin(animTime * f.sw + f.ph) * 13;
    const a = a0 * (0.55 + 0.45 * Math.sin(animTime * 1.7 + f.ph * 3));
    ctx.fillStyle = 'rgba(186,178,170,' + a.toFixed(2) + ')';
    ctx.fillRect(x, y, f.r, f.r);
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

/* برجک‌های دفاعی خودکار (۴٫۰) — هر نوع شکل مخصوص خودش را دارد:
   مسلسل: کیسه‌ی شن + سه لوله‌ی چرخان | تک‌تیرانداز: سه‌پایه + لوله‌ی بلند + دوربین
   یخ‌زن: پایه‌ی سنگی + بلور شناورِ درخشان. بالای سر هر برجک، پین‌های سطح ارتقا رسم می‌شود. */
function drawTurret(t) {
  const def = TURRETS[t.type];
  const lvl = state.upgrades.turretUp;
  ctx.save();
  ctx.translate(t.x, t.y);

  /* سایه روی زمین */
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, 15, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  if (t.type === 'gatling') {
    /* کیسه‌های شن دو طرف */
    ctx.fillStyle = '#6e6146';
    rr(-17, -7, 14, 8, 3); ctx.fill();
    rr(4, -7, 14, 8, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(-17, -7, 14, 8); ctx.strokeRect(4, -7, 14, 8);
    /* بدنه + جعبه‌ی مهمات */
    ctx.fillStyle = '#3a4150'; rr(-8, -17, 16, 12, 3); ctx.fill();
    ctx.fillStyle = '#8a6f3a'; rr(9, -13, 8, 6, 1.5); ctx.fill();
    /* نوار مهمات از جعبه تا سرِ لوله‌ها (حسِ مسلسل) */
    ctx.strokeStyle = '#c9a35a'; ctx.lineWidth = 1.6; ctx.setLineDash([2.5, 2]);
    ctx.beginPath(); ctx.moveTo(9, -12); ctx.quadraticCurveTo(4, -15, 1, -16.5); ctx.stroke();
    ctx.setLineDash([]);
    /* سر چرخان با سه لوله (دورشدن لوله‌ها با spin) */
    ctx.save();
    ctx.translate(0, -def.h);
    ctx.rotate(t.aim);
    ctx.translate(-t.recoil * 2, 0);
    ctx.fillStyle = '#2b2f38'; circle(0, 0, 6.5);
    for (let k = 0; k < 3; k++) {
      const off = Math.sin((t.spin || 0) + k * 2.094) * 3.2;
      ctx.strokeStyle = '#5d6575'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(2, off); ctx.lineTo(def.len, off); ctx.stroke();
    }
    /* نوکِ لوله‌ها همیشه دیده شود */
    ctx.fillStyle = '#8b93a3';
    for (let k = 0; k < 3; k++) {
      const off = Math.sin((t.spin || 0) + k * 2.094) * 3.2;
      circle(def.len, off, 1.5);
    }
    if (t.flash > 0) {
      const a = t.flash / 0.07;
      ctx.fillStyle = 'rgba(255,220,140,' + a.toFixed(2) + ')';
      circle(def.len + 3, 0, 5 * a + 2);
    }
    ctx.restore();
  } else if (t.type === 'sniper') {
    /* سه‌پایه‌ی چوبی */
    ctx.strokeStyle = '#4a3b28'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -12); ctx.lineTo(-12, 0);
    ctx.moveTo(4, -12); ctx.lineTo(12, 0);
    ctx.moveTo(0, -13); ctx.lineTo(0, 1);
    ctx.stroke();
    /* بدنه‌ی سبز تیره + لوله‌ی بلند + دوربین */
    ctx.save();
    ctx.translate(0, -def.h);
    ctx.rotate(t.aim);
    ctx.translate(-t.recoil * 4, 0);
    ctx.fillStyle = '#334632'; rr(-7, -3.5, 14, 7, 2.5); ctx.fill();
    ctx.fillStyle = '#20262b'; ctx.fillRect(6, -1.6, def.len, 3.2);
    ctx.fillStyle = '#454b57'; ctx.fillRect(6 + def.len - 4, -2.4, 4, 4.8);
    ctx.fillStyle = '#141a20'; rr(0, -6.5, 7, 4, 1.5); ctx.fill();
    ctx.fillStyle = 'rgba(140,220,255,0.75)'; circle(3.5, -4.5, 1.3);
    if (t.flash > 0) {
      const a = t.flash / 0.09;
      ctx.fillStyle = 'rgba(255,235,170,' + a.toFixed(2) + ')';
      circle(def.len + 8, 0, 8 * a + 3);
    }
    ctx.restore();
  } else {
    /* برجک یخ‌زن: پایه‌ی سنگی + بلور شناور */
    ctx.fillStyle = '#3f4a5e'; rr(-11, -10, 22, 11, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(-11, -10, 22, 11);
    ctx.fillStyle = 'rgba(160,200,240,0.25)'; rr(-11, -10, 22, 3, 2); ctx.fill();
    const bob = Math.sin(animTime * 2.6 + (t.bob || 0)) * 2.2;
    ctx.save();
    ctx.translate(0, -def.h + bob);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
    g.addColorStop(0, 'rgba(140,215,255,0.5)');
    g.addColorStop(1, 'rgba(140,215,255,0)');
    ctx.fillStyle = g; circle(0, 0, 16);
    ctx.fillStyle = t.flash > 0 ? '#eaf8ff' : '#9fdcff';
    ctx.beginPath();
    ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,120,170,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  }

  /* پین‌های سطح ارتقای برجک‌ها (هر سطح یک مثلث طلایی) */
  for (let i = 0; i < lvl; i++) {
    ctx.fillStyle = '#ffd873';
    ctx.beginPath();
    ctx.moveTo(-10 + i * 6, -30); ctx.lineTo(-7 + i * 6, -34); ctx.lineTo(-4 + i * 6, -30);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  /* حلقه‌ی برد هنگام hover روی برجک */
  if (t.hover) {
    ctx.strokeStyle = 'rgba(130,190,255,0.4)';
    ctx.lineWidth = 1.6; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 4, def.range, def.range * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* شبحِ نصب برجک (۴٫۰): دنبال ماوس می‌آید — سبز = مجاز، قرمز = نامعتبر */
function drawPlacing() {
  if (!state.placing || !canPlay()) return;
  const def = TURRETS[state.placing.type];
  const mx = state.mouse.x, my = state.mouse.y;
  const ok = placementValid(mx, my);

  /* حلقه‌ی برد + رنگ وضعیت */
  ctx.strokeStyle = ok ? 'rgba(110,225,140,0.5)' : 'rgba(235,80,70,0.55)';
  ctx.lineWidth = 1.8; ctx.setLineDash([7, 9]);
  ctx.beginPath(); ctx.ellipse(mx, my + 6, def.range, def.range * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  /* شبحِ نیمه‌شفاف برجک */
  ctx.globalAlpha = 0.62;
  drawTurret({ type: state.placing.type, x: mx, y: my, cd: 9, flash: 0, recoil: 0,
    aim: mx < TOWER.x ? 0 : Math.PI, spin: animTime * 2, hover: false, bob: 0 });
  ctx.globalAlpha = 1;

  /* علامت ✕ اگر جای نامعتبری است */
  if (!ok) {
    ctx.strokeStyle = 'rgba(235,80,70,0.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mx - 10, my - 30); ctx.lineTo(mx + 10, my - 10);
    ctx.moveTo(mx + 10, my - 30); ctx.lineTo(mx - 10, my - 10);
    ctx.stroke();
  }

  /* نوار راهنمای نصب بالای صحنه */
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 13px Tahoma, sans-serif';
  const msg = 'کلیک: نصب  •  راست‌کلیک / Esc: لغو';
  const tw = ctx.measureText(msg).width + 30;
  ctx.fillStyle = 'rgba(8,14,30,0.82)';
  rr(W / 2 - tw / 2, 86, tw, 27, 8); ctx.fill();
  ctx.strokeStyle = ok ? 'rgba(110,225,140,0.5)' : 'rgba(235,80,70,0.5)';
  ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#e8ecf5';
  ctx.fillText(msg, W / 2, 100);
  ctx.restore();
}

/* برج سه‌طبقه (۶٫۰ بازطراحی کامل گرافیکی — اندازه‌ی منطقی تغییری نکرده):
   سکوی سنگی، بافت بلوک/آجر، لبه‌های برآمده‌ی کنگره‌دار بین طبقه‌ها،
   درِ چوبی قوس‌دار با نور گرم، پنجره‌های قوس‌دار نورانی با قاب،
   بنرِ دیواری و پرچم دوبخشیِ موج‌دار. نور از سمت چپ (ماه).
   (۷٫۰) پوسته‌ی برج با TOWER_SKINS قابل تعویض است (برج دوم پس از
   کات‌سین) و حین کات‌سین، CS.draw.floors[i] تعیین می‌کند هر طبقه
   چقدر «زنده» است: a=آلفا (فروریختن)، dy=افت، rot=چرخش حین سقوط. */
function drawTower() {
  const d = state.dayness;
  const ratio = state.tower.hp / state.tower.maxHp;
  const cx = TOWER.x;
  const widths = [136, 124, 112];
  /* پوسته‌ی برج فعلی (۷٫۰: برج دوم، رنگ‌بندی متفاوت) */
  const SK = TOWER_SKINS[state.towerVariant] || TOWER_SKINS[0];
  const floors = SK.floors;
  /* وضعیت طبقه‌ها حین کات‌سین فروریختن (خارج از کات‌سین: کامل) */
  const fv = i => (CS && CS.draw ? CS.draw.floors[i] : { a: 1, dy: 0, rot: 0 });

  /* --- سکوی سنگی پایه (پلینث) --- */
  ctx.fillStyle = mixHex('#3f362b', '#8c7f6a', d);
  rr(cx - 82, GROUND_Y - 5, 164, 15, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  ctx.fillRect(cx - 82, GROUND_Y - 5, 164, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(cx - 82, GROUND_Y + 6, 164, 4);

  /* --- طبقه‌ها از پایین به بالا: گرادیان (مهتاب از چپ) + بافت + لبه ---
     (۷٫۰: طبقه‌ی فروریخته رسم نمی‌شود؛ طبقه‌ی در حال سقوط با افت/چرخش) */
  for (let i = 0; i < 3; i++) {
    const f = fv(i);
    if (f.a <= 0.02) continue;                    // این طبقه فرو ریخته است
    ctx.save();
    ctx.globalAlpha = f.a;
    if (f.rot) {                                  // چرخش حول مرکز طبقه (سقوط بام)
      const cyc = GROUND_Y - (i + 0.5) * TOWER.floorH + f.dy;
      ctx.translate(cx, cyc); ctx.rotate(f.rot); ctx.translate(-cx, -cyc);
    } else if (f.dy) ctx.translate(0, f.dy);
    const hw = widths[i] / 2;
    const yT = GROUND_Y - (i + 1) * TOWER.floorH, yB = GROUND_Y - i * TOWER.floorH;
    const F = floors[i];
    const g = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
    g.addColorStop(0, F.light);
    g.addColorStop(0.55, F.base);
    g.addColorStop(1, F.dark);
    ctx.fillStyle = g;
    ctx.fillRect(cx - hw, yT, hw * 2, TOWER.floorH);
    ctx.strokeStyle = F.edge; ctx.lineWidth = 2;
    ctx.strokeRect(cx - hw + 1, yT + 1, hw * 2 - 2, TOWER.floorH - 2);

    /* بافت بلوک‌های سنگی/آجری: ردیف‌های افقی + درزهای عمودیِ جابه‌جا (۶٫۰) */
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
    const rows = i === 1 ? 6 : 5;
    const bw = i === 1 ? 16 : 22;
    ctx.beginPath();
    for (let r2 = 0; r2 < rows; r2++) {
      const y = yT + (r2 + 1) * TOWER.floorH / rows;
      if (r2 < rows - 1) { ctx.moveTo(cx - hw + 3, y); ctx.lineTo(cx + hw - 3, y); }
      const off = (r2 % 2) * (bw / 2);
      for (let x = cx - hw + off + bw; x < cx + hw - 4; x += bw) {
        ctx.moveTo(x, y - TOWER.floorH / rows + 2); ctx.lineTo(x, y - 1);
      }
    }
    ctx.stroke();

    /* سایه‌ی جداکننده‌ی طبقه‌ها (خط پایین هر طبقه) */
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(cx - hw, yB - 4, hw * 2, 4);

    /* لبه‌ی برآمده (کورنیس) بالای طبقه‌های ۱ و ۲ (۶٫۰) */
    if (i < 2) {
      ctx.fillStyle = F.edge;
      ctx.fillRect(cx - hw - 4, yT - 5, hw * 2 + 8, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.fillRect(cx - hw - 4, yT - 5, hw * 2 + 8, 1.6);
    }
    ctx.restore();                                // پایان تبدیل این طبقه (۷٫۰)
  }

  /* --- کنگره‌های بام + پرچم (۷٫۰: همراه طبقه‌ی سوم می‌افتند) --- */
  const f2 = fv(2);
  const topW = widths[2] / 2;
  if (f2.a > 0.02) {
  ctx.save();
  ctx.globalAlpha = f2.a;
  if (f2.rot) {
    ctx.translate(cx, TOWER_TOP_Y + TOWER.floorH / 2 + f2.dy);
    ctx.rotate(f2.rot);
    ctx.translate(-cx, -(TOWER_TOP_Y + TOWER.floorH / 2));
  } else if (f2.dy) ctx.translate(0, f2.dy);
  ctx.fillStyle = floors[2].edge;
  ctx.fillRect(cx - topW - 5, TOWER_TOP_Y - 6, topW * 2 + 10, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(cx - topW - 5, TOWER_TOP_Y - 6, topW * 2 + 10, 1.5);
  ctx.fillStyle = mixHex(SK.batt[0], SK.batt[1], d);
  for (let k = 0; k < 6; k++) ctx.fillRect(cx - topW + 2 + k * 19, TOWER_TOP_Y - 9, 12, 9);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let k = 0; k < 6; k++) ctx.fillRect(cx - topW + 2 + k * 19 + 10, TOWER_TOP_Y - 9, 2, 9);

  /* --- درِ قوس‌دار چوبی + قاب سنگی + نور گرمِ درزِ در ---
     (۷٫۰: با طبقه‌ی اول می‌افتد/محو می‌شود) */
  const f0 = fv(0);
  if (f0.a > 0.02) {
  ctx.save(); ctx.globalAlpha = f0.a; ctx.translate(0, f0.dy);
  ctx.beginPath();                                     // قاب سنگی در
  ctx.moveTo(cx - 17, GROUND_Y - 2);
  ctx.lineTo(cx - 17, GROUND_Y - 24);
  ctx.arc(cx, GROUND_Y - 24, 17, Math.PI, 0);
  ctx.lineTo(cx + 17, GROUND_Y - 2);
  ctx.strokeStyle = mixHex(SK.doorFrame[0], SK.doorFrame[1], d); ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = '#241a12';                           // درِ چوبی تیره
  ctx.beginPath();
  ctx.moveTo(cx - 13, GROUND_Y - 3);
  ctx.lineTo(cx - 13, GROUND_Y - 22);
  ctx.arc(cx, GROUND_Y - 22, 13, Math.PI, 0);
  ctx.lineTo(cx + 13, GROUND_Y - 3);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath();                                     // تخته‌های چوبی
  for (const dx of [-6, 0, 6]) {
    const topY = GROUND_Y - 22 - Math.sqrt(Math.max(0, 169 - dx * dx)) + 1;
    ctx.moveTo(cx + dx, GROUND_Y - 4); ctx.lineTo(cx + dx, topY);
  }
  ctx.stroke();
  /* نور گرم از در، روی زمین (فقط شب — ۶٫۰) */
  if (d < 0.6) {
    const doorGlow = 0.5 + 0.2 * Math.sin(animTime * 2.1);
    const sp = ctx.createRadialGradient(cx, GROUND_Y - 6, 4, cx, GROUND_Y - 6, 52);
    sp.addColorStop(0, 'rgba(255,190,90,' + (0.20 * (1 - d) * doorGlow).toFixed(2) + ')');
    sp.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = sp; circle(cx, GROUND_Y - 6, 52);
  }
  ctx.restore();                                      // پایان تبدیل در (۷٫۰)
  }

  /* --- پنجره‌های قوس‌دار نورانی (۷٫۰: با طبقه‌ی خودشان می‌افتند/محو می‌شوند) --- */
  const wins = [
    { x: -36, y: GROUND_Y - 46, f: 0 }, { x: 36, y: GROUND_Y - 46, f: 0 },
    { x: -38, y: GROUND_Y - 108, f: 1 }, { x: 38, y: GROUND_Y - 108, f: 1 },
    { x: -28, y: GROUND_Y - 176, f: 2 }, { x: 28, y: GROUND_Y - 176, f: 2 },
  ];
  wins.forEach((w2, i) => {
    const fw = fv(w2.f);
    if (fw.a < 0.35) return;
    ctx.save(); ctx.globalAlpha = fw.a; ctx.translate(0, fw.dy);
    let a = 0.66 + 0.25 * Math.sin(animTime * 2.1 + i * 1.9);
    if (ratio < 0.5 && Math.random() < 0.05) a *= 0.2;   // چشمکِ برق‌گرفتگی
    archWin(cx + w2.x, w2.y, 13, 19, a);
    ctx.restore();
  });

  /* --- بنرِ دیواری طبقه‌ی دوم با نشان طلایی (۷٫۰: رنگ پوسته + همراه طبقه) --- */
  if (fv(1).a > 0.35) {
    ctx.save(); ctx.globalAlpha = fv(1).a; ctx.translate(0, fv(1).dy);
    const by = GROUND_Y - 122, tip = Math.sin(animTime * 2) * 1.2;
    ctx.fillStyle = mixHex(SK.banner[0], SK.banner[1], 0.35 + 0.3 * d);
    ctx.beginPath();
    ctx.moveTo(cx - 11, by);
    ctx.lineTo(cx + 11, by);
    ctx.lineTo(cx + 11, by + 25);
    ctx.lineTo(cx + tip, by + 33);
    ctx.lineTo(cx - 11, by + 25);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#f7c948'; circle(cx, by + 12, 4.2);
    ctx.fillStyle = SK.bannerMark; circle(cx, by + 12, 1.8);
    ctx.fillStyle = mixHex(SK.pole[0], SK.pole[1], d);
    ctx.fillRect(cx - 12, by - 2, 24, 2.5);            // میله‌ی بنر
    ctx.restore();                                      // پایان تبدیل بنر (۷٫۰)
  }

  /* --- میله‌ی پرچم با گوی + پرچم دوبخشی موج‌دار (رنگ پوسته) --- */
  ctx.fillStyle = mixHex(SK.pole[0], SK.pole[1], d);
  ctx.fillRect(cx - 1.5, TOWER_TOP_Y - 38, 3, 38);
  ctx.fillStyle = '#f7c948'; circle(cx, TOWER_TOP_Y - 39, 2.2);       // گویِ نوک میله
  const wv = Math.sin(animTime * 4), wv2 = Math.sin(animTime * 4 - 1.3);
  ctx.fillStyle = SK.flag;
  ctx.beginPath();
  ctx.moveTo(cx + 2, TOWER_TOP_Y - 36);
  ctx.bezierCurveTo(cx + 13 + wv * 2, TOWER_TOP_Y - 34.5,
                    cx + 21 + wv * 3, TOWER_TOP_Y - 32.5 + wv2,
                    cx + 27 + wv * 3, TOWER_TOP_Y - 29.5);
  ctx.lineTo(cx + 27 + wv * 3, TOWER_TOP_Y - 20.5);
  ctx.bezierCurveTo(cx + 19 + wv * 2, TOWER_TOP_Y - 22.5,
                    cx + 10, TOWER_TOP_Y - 23.5,
                    cx + 2, TOWER_TOP_Y - 21);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = SK.flagMark; circle(cx + 15 + wv * 2, TOWER_TOP_Y - 26, 2);  // نشان روی پرچم
  ctx.restore();                                      // پایان تبدیل بام/پرچم (۷٫۰)
  }

  /* --- ترک‌ها وقتی برج آسیب دیده است --- */
  ctx.strokeStyle = 'rgba(20,14,8,0.8)'; ctx.lineWidth = 2;
  if (ratio < 0.55) {
    ctx.beginPath();
    ctx.moveTo(cx - 40, GROUND_Y - 14); ctx.lineTo(cx - 33, GROUND_Y - 30); ctx.lineTo(cx - 41, GROUND_Y - 44);
    ctx.moveTo(cx + 44, GROUND_Y - 80); ctx.lineTo(cx + 37, GROUND_Y - 96);
    ctx.stroke();
  }
  if (ratio < 0.28) {
    ctx.beginPath();
    ctx.moveTo(cx + 20, GROUND_Y - 100); ctx.lineTo(cx + 13, GROUND_Y - 118); ctx.lineTo(cx + 21, GROUND_Y - 132);
    ctx.moveTo(cx - 14, GROUND_Y - 150); ctx.lineTo(cx - 7, GROUND_Y - 166);
    ctx.stroke();
    /* آوار کنار پایه (۶٫۰) */
    ctx.fillStyle = mixHex('#5d4c39', '#948268', d);
    ctx.fillRect(cx - 74, GROUND_Y - 8, 10, 6); ctx.fillRect(cx - 68, GROUND_Y - 4, 7, 4);
    ctx.fillRect(cx + 62, GROUND_Y - 7, 11, 6); ctx.fillRect(cx + 70, GROUND_Y - 3, 6, 4);
  }

  /* --- ترک‌های داستانی حین کات‌سین فروریختن (۷٫۰) --- */
  if (CS && CS.draw && CS.draw.cracks > 0.03) drawTowerCracks(CS.draw.cracks);
}

/* پنجره‌ی قوس‌دار نورانی با قاب و تقسیم‌کندها (۶٫۰) */
function archWin(x, y, w, h, glow) {
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + h / 2);
  ctx.lineTo(x - w / 2, y - h / 2 + w / 2);
  ctx.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.closePath();
  const a = Math.min(1, 0.55 + 0.45 * glow);
  const g = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
  g.addColorStop(0, 'rgba(255,238,170,' + a.toFixed(2) + ')');
  g.addColorStop(1, 'rgba(255,186,88,' + (a * 0.8).toFixed(2) + ')');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(30,22,12,0.75)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath();                                     // تقسیم‌کندهای شیشه
  ctx.moveTo(x, y - h / 2 + 2); ctx.lineTo(x, y + h / 2 - 1);
  ctx.moveTo(x - w / 2 + 2, y + h / 2 - w / 4); ctx.lineTo(x + w / 2 - 2, y + h / 2 - w / 4);
  ctx.stroke();
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

  /* سایه روی زمین (زامبی‌های پرتاب‌شده‌ی کات‌سین سایه‌ی جداگانه دارند — ۷٫۰) */
  if (!z.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(z.x, z.y + 2, 13 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
  }

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

  /* بدن و پارگی پیراهن — (۱۱٫۰) سایه‌روشن گرادیانی برای حجم بیشتر */
  ctx.fillStyle = shirt; rr(-9, -31 + bob * 0.4, 18, 19, 4); ctx.fill();
  {
    const shg = ctx.createLinearGradient(-9, -31 + bob * 0.4, 9, -12 + bob * 0.4);
    shg.addColorStop(0, 'rgba(255,255,255,0.14)');
    shg.addColorStop(0.55, 'rgba(0,0,0,0)');
    shg.addColorStop(1, 'rgba(0,0,0,0.34)');
    ctx.fillStyle = shg; rr(-9, -31 + bob * 0.4, 18, 19, 4); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-3, -24 + bob * 0.4, 6, 7);
  /* لبه‌ی پاره‌پاره‌ی پیراهن (۶٫۰) */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.moveTo(-8, -13 + bob * 0.4); ctx.lineTo(-5, -17 + bob * 0.4); ctx.lineTo(-2, -13 + bob * 0.4);
  ctx.lineTo(1, -13 + bob * 0.4); ctx.lineTo(4, -16.5 + bob * 0.4); ctx.lineTo(7, -13 + bob * 0.4);
  ctx.closePath(); ctx.fill();

  /* زره‌ی شونه برای تانک و پادشاه — (۱۱٫۰) نگهبان: خار + برق زره */
  if (z.type === 'tank' || z.type === 'boss') {
    ctx.fillStyle = z.type === 'boss' ? '#3f151d' : '#39364a';
    ctx.fillRect(-11, -33 + bob * 0.4, 7, 6);
    ctx.fillRect(4, -33 + bob * 0.4, 7, 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(-11, -33 + bob * 0.4, 7, 6);
    ctx.strokeRect(4, -33 + bob * 0.4, 7, 6);
    if (z.type === 'boss') {
      ctx.fillStyle = '#c44dff';
      ctx.beginPath();
      ctx.moveTo(-11, -33 + bob * 0.4); ctx.lineTo(-13, -39 + bob * 0.4); ctx.lineTo(-7, -34 + bob * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(11, -33 + bob * 0.4); ctx.lineTo(13, -39 + bob * 0.4); ctx.lineTo(7, -34 + bob * 0.4);
      ctx.closePath(); ctx.fill();
      if (!z.dead && z.ai && z.ai.staggerT > 0) {           // پنجره‌ی زره‌ترکیده
        ctx.strokeStyle = 'rgba(196,77,223,0.9)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-9, -31 + bob * 0.4); ctx.lineTo(-4, -26 + bob * 0.4); ctx.lineTo(-1, -30 + bob * 0.4);
        ctx.moveTo(6, -30 + bob * 0.4); ctx.lineTo(9, -25 + bob * 0.4);
        ctx.stroke();
      }
    }
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
  /* برق مهتاب روی سر (۶٫۰ — فقط شب) */
  if (state.dayness < 0.55 && !z.dead) {
    ctx.strokeStyle = 'rgba(195,220,255,' + (0.38 * (1 - state.dayness)).toFixed(2) + ')';
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(3, -36 + bob * 0.5, 7, Math.PI * 1.05, Math.PI * 1.62); ctx.stroke();
  }

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

  /* چشم‌های درخشان (قرمز؛ نگهبان بنفش؛ فصل خرابه: اخگریِ نارنجی)
     (۱۲٫۰) بدون shadowBlur — هاله با دایره‌ی کم‌آلفا: روی موبایل روان */
  if (!z.dead) {
    const emberE = !!curCh().theme.emberEyes && z.type !== 'boss';
    const eCol = z.type === 'boss' ? '#c44dff' : (emberE ? '#ff8a3c' : '#ff4b3e');
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = eCol;
    circle(5.5, -37 + bob * 0.5, 3.1); circle(8.8, -37.5 + bob * 0.5, 3.1);
    ctx.globalAlpha = 1;
    ctx.fillStyle = flash ? '#ffffff' : (z.type === 'boss' ? '#c44dff' : (emberE ? '#ffb03c' : '#ff4b3e'));
    circle(5.5, -37 + bob * 0.5, 1.6); circle(8.8, -37.5 + bob * 0.5, 1.6);
  }

  /* لکه‌ی خون گوشه‌ی دهان + چکه (۶٫۰) */
  if (!z.dead) {
    ctx.fillStyle = 'rgba(110,22,22,0.85)';
    circle(7.5, -33.4 + bob * 0.5, 1.4);
    ctx.fillRect(6.9, -33 + bob * 0.5, 1.1, 2.1);
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

  /* لایه‌ی یخِ ملایم‌تر گلوله‌ی برجک یخ‌زن (۴٫۰) */
  if (!z.dead && z.chill > 0) {
    ctx.globalAlpha = Math.min(0.30, 0.12 + z.chill * 0.09);
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

/* بازیکن: نگهبان کوچک روی بام برج با اسلحه‌ی چرخانِ رو به ماوس
   (۷٫۰: حین کات‌سین، جای/چرخش/زاویه‌ی اسلحه را خود کات‌سین تعیین می‌کند —
   سقوط از بام یا ایستادن روی ماشینِ نجات) */
function drawPlayer() {
  const P = (CS && CS.draw && CS.draw.player) || null;
  const px = P ? P.x : TOWER.x;
  const py = P ? P.y : TOWER_TOP_Y;
  const bob = Math.sin(animTime * 2.4) * 1.1;
  const w = WEAPONS[state.weapon];
  ctx.save();
  ctx.translate(px, py + bob * 0.4);
  if (P && P.rot) ctx.rotate(P.rot);          // چرخش حین سقوط/سوار شدن

  /* حلقه‌ی زردِ چرخان وقتی «شلیک سریع» فعال است (۳٫۰) */
  if (state.powerTimers.rapid > 0) {
    ctx.strokeStyle = 'rgba(255,216,115,' + (0.4 + 0.3 * Math.sin(animTime * 10)).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 1, 14, 5, 0, 0, Math.PI * 2); ctx.stroke();
  }

  /* سایه روی بام (در سقوط/سوار شدن، سایه‌ی جداگانه رسم می‌شود) */
  if (!P) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 1, 11, 3, 0, 0, Math.PI * 2); ctx.fill();
  }

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

  /* اسلحه: می‌چرخد رو به ماوس + عقب‌راندگی لحظه شلیک
     (۷٫۰: حین کات‌سین زاویه‌ی نمایشی ثابت) */
  ctx.save();
  ctx.translate(0, -17);
  ctx.rotate(P && P.aim !== undefined ? P.aim : state.aimAngle);
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

/* گلوله با دنباله درخشان — ساچمه/مسلسل ریز، تیر تک‌تیرانداز ردِ بلند، یخی لوزی (۴٫۰) */
function drawBullet(b) {
  if (b.frost) {
    /* گلوله‌ی یخی: لوزی درخشان آبی + رد محو */
    ctx.strokeStyle = 'rgba(160,225,255,0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.fillStyle = 'rgba(140,215,255,0.3)'; circle(b.x, b.y, 6);
    ctx.save();
    ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
    ctx.fillStyle = '#dff3ff';
    ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-3, 3.2); ctx.lineTo(-3, -3.2); ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  if (b.tracer) {
    /* تیر تک‌تیرانداز: ردِ بلند سفید-زرد */
    ctx.strokeStyle = 'rgba(255,244,200,0.55)'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.085, b.y - b.vy * 0.085); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,235,170,0.3)'; circle(b.x, b.y, 8);
    ctx.fillStyle = '#fff7d6'; circle(b.x, b.y, 3.2);
    return;
  }
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
      /* ذره‌ی نورانی (روح زامبی و...) — (۱۲٫۰) بدون shadowBlur:
         هاله = دایره‌ی بزرگ کم‌آلفا؛ روی موبایل هم روان */
      ctx.globalAlpha = Math.max(0, a * 0.28);
      ctx.fillStyle = p.color;
      circle(p.x, p.y, p.size * 2.4);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.color;
      circle(p.x, p.y, p.size);
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

/* نشانگر هدف‌گیری ماوس (در حالت نصب برجک مخفی می‌شود) */
function drawReticle() {
  if (!canPlay() || state.placing) return;
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

/* گریدینگ رنگی سینمایی (۶٫۰): تینت سرمای شب + گرمای روز + وینیت نرم.
   (۸٫۰) برج دوم: شب = تینت سرخِ خاکستری؛ روز = سپیای دودی — حال‌وهوای
   متفاوتِ شهر سوخته. بعد از صحنه و قبل از UI رسم می‌شود (بدون لرزش). */
function drawColorGrade() {
  const d = state.dayness;
  const v1 = curCh().theme.grade === 'ember';   // (۱۰٫۰) فصل خرابه: تینت اخگری — بقیه: سرمای آبی
  /* وینیت نرم همیشه — شب عمیق‌تر (شهر سوخته: کمی شدیدتر) */
  const vg = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.36, W / 2, H * 0.55, H * 0.88);
  const va = (v1 ? 0.13 : 0.10) + 0.16 * (1 - d);
  vg.addColorStop(0, v1 ? 'rgba(20,4,4,0)' : 'rgba(2,4,14,0)');
  vg.addColorStop(1, v1 ? 'rgba(20,4,4,' + va.toFixed(2) + ')' : 'rgba(2,4,14,' + va.toFixed(2) + ')');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  /* تینت شب: برج اول سرمای آبی؛ برج دوم سرخیِ اخگر — ضرب ملایم */
  if (d < 0.85) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = v1
      ? 'rgba(228,164,150,' + (0.15 * (1 - d)).toFixed(2) + ')'
      : 'rgba(178,192,236,' + (0.14 * (1 - d)).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
  /* گرمای روز: برج اول طلایی؛ برج دوم سپیای دودی (روشن‌سازی ملایم) */
  if (d > 0.15) {
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = v1
      ? 'rgba(255,170,110,' + (0.07 * d).toFixed(2) + ')'
      : 'rgba(255,196,96,' + (0.05 * d).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* ترتیب رسم صحنه (از دور به نزدیک) — در منو زامبی‌های تزئینی رسم می‌شوند */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save();
  if (state.shake > 0.2 && SETT.shake) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  /* (۱۰٫۰) حالت‌های تمام‌صحنه: افتتاحیه / انتقال فصل / صحنه‌ی پیروزی
     (فاز ۱ انتقال روی همان میدان بازی رندر می‌شود → شاخه‌ی عادی) */
  if (state.mode === 'intro') {
    renderIntro();                             // کات‌سین افتتاحیه — روایت داستان
  } else if (state.mode === 'victorycine') {
    renderVictoryCine();                       // صحنه‌ی سحرِ پیروزی
  } else if (state.mode === 'transition' && TR && TR.phase !== 1) {
    renderTransition();                        // فاز ۲/۳ انتقال — صحنه‌ی اختصاصی مینی‌گیم
  } else if (CS && CS.drive) {
    /* ---- صحنه‌ی رانندگی کات‌سین (۸٫۰): جاده به‌جای میدان نبرد ---- */
    drawSky();
    drawClouds();
    drawDriveScene();
    drawPlayer();                              // بازیکن روی سقف ماشین (۸٫۰)
  } else {
  drawSky();
  drawClouds();
  /* (۱۰٫۰) پارالاکس ملایم منو: افق و تپه‌ها با ماوس کمی جابه‌جا می‌شوند */
  ctx.save(); ctx.translate(-menuPar(12), 0); drawSkyline(); ctx.restore();
  ctx.save(); ctx.translate(-menuPar(26), 0); drawHills(); ctx.restore();
  drawPuddles();
  drawGrass();
  drawAsh();                                  // بارش خاکسترِ شهر سوخته (۸٫۰)
  drawChapterWeather();                        // (۱۰٫۰) مه انبارها / برف قله — و مهِ آرام منو
  drawDecals();
  drawLightning();
  drawTree(88, 0.95, !!curCh().theme.deadTrees);   // (۱۰٫۰) درخت سوخته در فصل خرابه‌ها
  drawTree(874, 0.7, !!curCh().theme.deadTrees);
  drawLamps();
  drawMuzzleGlow();
  if (!(typeof PERF !== 'undefined' && PERF.low)) {          // (۱۱٫۰) حالت کم‌بار
    drawShootingStar();
    drawFireflies();
  }
  drawTrap();
  drawTower();
  drawChapterProps();                          // (۱۰٫۰) اسباب‌متعلقات فصل (جعبه/کیسه‌شن/برف) + صحنه‌های انتقال
  if (CS) drawRubble(CS.draw.rubble);        // توده‌ی آوار زیر برج حین کات‌سین (۷٫۰)
  /* زامبی‌ها و برجک‌ها بر اساس عمق (y) با هم مرتب می‌شوند تا ردیف‌های عقب
     پشت سر جلو دیده شوند و برجک‌ها هم در جای درستِ خودشان بایستند (۴٫۰) */
  if (state.mode === 'start') {
    for (const z of menuZ.slice().sort((a, b) => a.y - b.y)) drawZombie(z);
  } else {
    const ents = [];
    for (const z of state.zombies) ents.push({ y: z.y, z });
    for (const t of state.turrets) ents.push({ y: t.y + 0.1, t });
    if (CS) {                                  // موجودیت‌های کات‌سین (۷٫۰)
      for (const z of CS.zombies) ents.push({ y: z.y, csZ: z });
      if (CS.car) ents.push({ y: CS.car.y - 1, car: CS.car });
    }
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (e.car) drawCar(e.car);               // ماشین نجات (۷٫۰)
      else if (e.csZ) drawCsZombie(e.csZ);     // زامبی‌های پرتاب‌شده (۷٫۰)
      else if (e.z) drawZombie(e.z);
      else drawTurret(e.t);
    }
  }
  drawPlayer();
  drawPlacing();                              // شبحِ نصب برجک روی همه‌چیز (۴٫۰)
  drawPowerTimers();
  for (const b of state.bullets) drawBullet(b);
  drawDebris();                                // (۱۰٫۰) آوار پرتابی نگهبانِ آخرین شب
  for (const c of state.coinsArr) drawCoin(c);
  drawPowerups();
  drawZaps();
  }
  drawParticles();
  drawTexts();
  Dark.render();                               // (۱۰٫۰) تاریکی/مه دید + دایره‌ی نور چراغ‌قوه
  drawDarkEyes();                              // (۱۰٫۰) چشم‌های زامبی‌ها در تاریکی
  ctx.restore();
  /* گریدینگ رنگی سینمایی (۶٫۰): تینت سرمای شب + گرمای روز + وینیت نرم */
  drawColorGrade();
  /* لایه‌ی UI: بدون لرزش */
  drawOffscreenArrows();
  drawReticle();
  drawHitMark();
  drawCombo();
  drawFlash();
  drawVignette();
  drawFreezeOverlay();
  drawCinematic();
  if (CS && state.mode === 'cutscene') drawCutscene();   // لایه‌ی کات‌سین (۷٫۰) — (۱۰٫۰) فقط در حالت cutscene
  if (typeof DF !== 'undefined' && DF && state.mode === 'defeatcine') drawDefeatOverlay();  // (۱۲٫۰) لایه‌ی سینماییِ سقوط
  drawTransitionOverlay();                     // (۱۰٫۰) نوار سینما/زیرنویس/پیشرفتِ انتقال فصل‌ها
}
