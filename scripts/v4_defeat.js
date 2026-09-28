/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۵٫۰ — بخش ۱۲: کات‌سین باخت «سقوط برج»
   ==================================================================
   وقتی جون برج صفر می‌شود، بازی دیگر یک‌باره تمام نمی‌شود؛ اول
   سینماییِ واقعیِ نابودی پخش می‌شود:
     ۱) زامبی‌های محاصره‌کننده از دیوار برج بالا می‌آیند (طبقه ۱/۲/بام)
     ۲) ترک‌ها زیاد می‌شوند، لرزش شدید می‌شود، زامبی‌ها پایه را می‌خ側ند
     ۳) طبقه‌ی اول فرو می‌ریزد → طبقه‌ی دوم → بام می‌لغزد و کج می‌شود
        و روی زمین می‌کوبد (بازیکن همراهش می‌افتد و کنار می‌غلتد)
     ۴) زامبی‌ها روی توده‌ی آوار هجوم می‌آورند؛ غبار می‌نشیند
     ۵) محوِ تیره → صفحه‌ی باخت با دو دکمه: «تلاش دوباره» و «منوی اصلی»
   - (۱۵٫۰ — بازخورد کاربر) هنگام سقوط برج «صدای باخت» پخش می‌شود،
     نه دیالوگ/راوی؛ دکمه‌ی «رد کردن» هنگام باخت حذف شد؛ کات‌سین
     ~۲۰٪ کوتاه‌تر و صفحه‌ی باخت ساده و بی‌شلوغی شد.
   - از موتور رسم فروریختن (CS.draw.floors/cracks/rubble — بخش ۴)
     دوباره استفاده می‌شود؛ همه‌چیز از t محاسبه می‌شود (تست‌پذیر).
   ================================================================== */

let DF = null;        // وضعیت کات‌سین باخت (null = نیست)

/* زمان‌بندی مراحل (ثانیه) — (۱۵٫۰) ~۲۰٪ فشرده‌تر */
const DF_T = {
  climbEnd: 1.35,     // پایان بالا آمدن زامبی‌ها
  biteEnd: 2.0,       // گاز گرفتن پایه‌ها / ترک‌ها کامل
  col1: 2.0, col1Dur: 0.45,    // فروریختن طبقه‌ی ۱
  col2: 2.65, col2Dur: 0.45,   // فروریختن طبقه‌ی ۲
  roofStart: 3.3, roofDur: 0.7,    // لغزیدن و کوبیدن بام روی زمین
  playerDrop: 3.7, playerDur: 0.65,  // سقوط و غلتیدن بازیکن
  swarm: 4.25,        // هجوم زامبی‌ها روی آوار
  fadeStart: 4.6, fadeDur: 0.8,  // محو تیره
  end: 5.6,           // پایان → صفحه‌ی باخت
};

/* زیرنویس‌های کات‌سین باخت: [شروع، پایان، متن] — (۱۵٫۰) زمان‌بندی جدید */
const DF_CAPS = [
  [0.4, 1.5, 'زامبی‌ها دارن بالا می‌آن...!'],
  [1.75, 2.0, 'پایه‌ها داره می‌شکنه...'],
  [2.0, 2.35, 'طبقه‌ی اول فرو ریخت!'],
  [2.65, 3.0, 'طبقه‌ی دوم هم...!'],
  [3.3, 3.95, 'بام می‌لغزه...!'],
  [4.25, 4.6, 'برج... از بین رفت.'],
];

/* (۱۵٫۰) صدای باخت — به‌جای راوی/دیالوگ: پایین‌رویِ غمگین + غرش سقوط */
SFX.defeatSting = function () {
  try {
    Snd.noise({ dur: 1.6, vol: 0.34, freq: 95, q: 0.35 });
    [392, 311, 262, 196, 147].forEach((f, i) =>
      Snd.tone({ type: 'triangle', f0: f, dur: 0.5, vol: 0.16, delay: i * 0.22 }));
    Snd.tone({ type: 'sine', f0: 72, f1: 36, dur: 1.5, vol: 0.22, delay: 0.9 });
  } catch (e) {}
};

/* شروع کات‌سین باخت — از gameOver() صدا می‌شود */
function startDefeatCine() {
  if (state.mode === 'defeatcine' || state.mode === 'gameover') return;
  /* (۱۵٫۰) هیچ گفتگو/راوی‌ای پخش نمی‌شود — فقط «صدای باخت» */
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  try { SFX.defeatSting(); } catch (e) {}
  const alive = state.zombies.filter(z => !z.dead);
  /* نزدیک‌ترین‌ها بالا می‌روند (حداکثر ۶) — بقیه به سمت برج می‌دوند */
  const near = alive.slice().sort((a, b) => Math.abs(a.x - TOWER.x) - Math.abs(b.x - TOWER.x)).slice(0, 6);
  const floorsOf = [0, 0, 1, 1, 2, 2];
  DF = { t: 0, _paused: false, ended: false, fade: 0, climbers: [], walkers: [] };
  alive.forEach(z => {
    if (near.includes(z)) {
      DF.climbers.push({
        z, floor: floorsOf[DF.climbers.length % 6],
        side: z.x < TOWER.x ? -1 : 1,
        y0: z.y, phase: 'climb', fallT: 0,
      });
    } else DF.walkers.push({ z, side: z.x < TOWER.x ? -1 : 1 });
  });
  /* اگر (به هر دلیلی) زامبی زنده نبود، خودمان چند تا می‌آوریم تا صحنه برقرار بماند */
  if (!DF.climbers.length) {
    for (let i = 0; i < 3; i++) spawnZombie(i === 1 ? 'fast' : 'normal');
    const zs = state.zombies.filter(z => !z.dead);
    zs.forEach((z, i) => DF.climbers.push({
      z, floor: i % 3, side: z.x < TOWER.x ? -1 : 1, y0: z.y, phase: 'climb', fallT: 0,
    }));
  }
  state.mode = 'defeatcine';
  state.mouse.down = false;
  state.placing = null;
  state.bullets = [];
  state.projectiles = [];
  state.coinsArr = [];
  state.powerups = [];
  state.zaps = [];
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  hideChapterCard();
  $('lockBadge').classList.add('hidden');
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  setBuildPanel(true, true);                    // پنل جمع: حالت سینمایی
  $('wrap').classList.add('cs-mode');           // پنل‌ها/نوارها مخفی (CSS)
  /* (۱۵٫۰) دکمه‌ی «رد کردن» هنگام باخت دیگر نشان داده نمی‌شود */
  /* CS ساختگی برای drawTower / drawRubble / drawPlayer / drawTowerCracks
     (zombies/car خالی — رندرکننده‌ی موجودیت‌های کات‌سین به آن‌ها نگاه می‌کند) */
  CS = {
    t: 0, paused: false,
    zombies: [], car: null, drive: null,
    draw: {
      floors: [{ a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }],
      cracks: 0, rubble: 0,
      player: { x: TOWER.x, y: TOWER_TOP_Y, rot: 0, aim: -Math.PI / 2 },
    },
  };
  SFX.csRumble();
  updateHUD();
}

/* پایان کات‌سین → صفحه‌ی باخت (۱۵٫۰: ساده — فقط یک خط آمار) */
function finishDefeatCine() {
  if (!DF || DF.ended) return;
  DF.ended = true;
  DF = null;
  CS = null;
  state.mode = 'gameover';
  state.shake = 0; state.flash = 0;
  $('wrap').classList.remove('cs-mode');
  $('skipCs').classList.add('hidden');
  hideAnnounce();
  $('goSubtitle').textContent = 'تا شب ' + faNum(state.wave) + ' از ' + faNum(FINAL_WAVE) + ' دوام آوردی';
  $('goStats').innerHTML = 'کشتار: <b>' + faNum(state.stats.kills) +
    '</b> &nbsp;•&nbsp; بهترین کمبو: <b>×' + faNum(state.stats.maxCombo) + '</b>';
  /* «تلاش دوباره» فقط وقتی سیو معتبری هست (با سیوِ شروع موج تقریباً همیشه هست) */
  const hasSave = !!loadSaveData();
  $('btnRetryDay').classList.toggle('hidden', !hasSave);
  SFX.gameover();
  showScreen('gameoverScreen');
}

/* رد کردن */
function skipDefeatCine() {
  if (!DF) return;
  SFX.click();
  finishDefeatCine();
}

/* ریست کامل (شروع مجدد/خروج) */
function defeatHardReset() {
  DF = null;
}

/* ---------- به‌روزرسانی ---------- */
function updateDefeatCine(dt) {
  if (!DF || DF._paused) return;
  DF.t += dt;
  const t = DF.t;
  const D = CS.draw;
  updateParticles(dt);
  updateTexts(dt);
  try { MUSIC.update(); } catch (e) {}
  try { PERF.update(dt); } catch (e) {}

  /* --- ۱) لرزش و ترک رشد می‌کنند --- */
  state.shake = t < DF_T.biteEnd ? Math.min(8, 1.5 + t * 3.2)
    : t < DF_T.roofStart + DF_T.roofDur ? 11
    : Math.max(0, 11 - (t - DF_T.roofStart - DF_T.roofDur) * 6);
  D.cracks = clamp(t / DF_T.biteEnd, 0, 1);
  if (t < DF_T.col1 && Math.random() < dt * 2.4) SFX.csRumble();

  /* --- ۲) زامبی‌ها بالا می‌آیند / می‌خزند / می‌افتند --- */
  const colT = f => (f === 0 ? DF_T.col1 : f === 1 ? DF_T.col2 : DF_T.roofStart);
  for (const c of DF.climbers) {
    const z = c.z;
    if (z.dead) continue;
    const yFloor = GROUND_Y - (c.floor + 0.45) * TOWER.floorH;
    const wallX = TOWER.x + c.side * (TOWER.baseHalf - 10);
    if (c.phase === 'climb') {
      const k = clamp(t / DF_T.climbEnd, 0, 1);
      z.x = TOWER.x + c.side * (TOWER.baseHalf + 8 + (1 - k) * 14);
      z.y = c.y0 + (yFloor - c.y0) * k;
      z.walkPhase += dt * 7;
      if (k >= 1) c.phase = 'hold';
    } else if (c.phase === 'hold') {
      z.x = wallX;
      z.y = yFloor + Math.sin(t * 22 + c.floor) * 1.5;
      z.attacking = true;
      z.attackAnim += dt * 6;
      if (Math.random() < dt * 1.2) SFX.towerHit();
      if (t >= colT(c.floor)) c.phase = 'fall';
    } else if (c.phase === 'fall') {
      c.fallT += dt;
      const k = clamp(c.fallT / 0.55, 0, 1);
      z.x = wallX + (TOWER.x + c.side * rand(22, 44) - wallX) * k * 0.4 + c.side * k * 18;
      z.y = yFloor + (GROUND_Y + 8 - yFloor) * (k * k);
      z.walkPhase += dt * 5;
      if (k >= 1) c.phase = 'swarm';
    } else {                                    // swarm: هجوم روی آوار
      const tx = TOWER.x + c.side * (14 + (c.floor * 17) % 40);
      z.x += Math.sign(tx - z.x) * Math.min(Math.abs(tx - z.x), 46 * dt);
      z.y = GROUND_Y + 8 - (1 - clamp((t - DF_T.swarm) / 1.2, 0, 1)) * 10;
      z.attacking = true;
      z.attackAnim += dt * 5;
    }
  }
  /* زامبی‌های دور: به سمت برج می‌دوند */
  for (const w of DF.walkers) {
    const z = w.z;
    if (z.dead) continue;
    const tx = TOWER.x + w.side * (60 + rand(0, 30));
    z.x += Math.sign(tx - z.x) * Math.min(Math.abs(tx - z.x), 55 * dt);
    z.y += (GROUND_Y + 6 - z.y) * Math.min(1, dt * 4);
    z.walkPhase += dt * 6;
  }

  /* --- ۳) فروریختن طبقه‌ها --- */
  const floorH = TOWER.floorH;
  const collapse = (i, t0, dur) => {
    const k = clamp((t - t0) / dur, 0, 1);
    D.floors[i].a = 1 - k;
    if (k > 0 && !D['b' + i]) {
      D['b' + i] = 1;
      csBrickBurst(i, 1); csBrickBurst(i, 2);
      SFX.csBoom();
      state.shake = Math.max(state.shake, 14);
    }
    if (k > 0.45 && !D['b2' + i]) { D['b2' + i] = 1; csBrickBurst(i, 3); }
    /* نشستن طبقه‌های بالا وقتی پایینی فرو می‌ریزد */
    for (let j = i + 1; j < 3; j++) D.floors[j].dy = Math.max(D.floors[j].dy, k * floorH * 0.6);
    D.rubble = Math.max(D.rubble, k * (i === 0 ? 0.45 : i === 1 ? 0.75 : 1));
  };
  if (t >= DF_T.col1) collapse(0, DF_T.col1, DF_T.col1Dur);
  if (t >= DF_T.col2) collapse(1, DF_T.col2, DF_T.col2Dur);

  /* --- ۴) بام: لغزیدن + کج شدن + کوبیدن روی زمین --- */
  if (t >= DF_T.roofStart) {
    const k = clamp((t - DF_T.roofStart) / DF_T.roofDur, 0, 1);
    const f2 = D.floors[2];
    f2.rot = k * 0.52;
    f2.dy = k * k * floorH * 2.05;
    if (k >= 1 && !D.roofHit) {
      D.roofHit = 1;
      csBrickBurst(2, 4); csBrickBurst(2, 5);
      SFX.csBoom(); SFX.csLand();
      state.shake = 20;
      /* ابر غبار بزرگ فرود */
      for (let i = 0; i < 10; i++) {
        state.particles.push({
          x: TOWER.x + rand(-70, 70), y: GROUND_Y - rand(2, 26),
          vx: rand(-60, 60), vy: rand(-90, -30),
          age: 0, life: rand(1.2, 1.9), size: rand(12, 22),
          color: 'rgba(168,148,118,0.34)', grav: -12,
        });
      }
      D.rubble = 1;
    }
    if (k >= 1) f2.a = Math.max(0, 1 - clamp((t - DF_T.roofStart - DF_T.roofDur) / 0.4, 0, 1));
  }

  /* --- ۵) بازیکن: همراه بام می‌افتد و کنار می‌غلتد --- */
  const P = D.player;
  if (t < DF_T.roofStart) {
    P.x = TOWER.x; P.y = TOWER_TOP_Y + (D.floors[2].dy || 0); P.rot = (D.floors[2].rot || 0) * 0.7;
  } else if (t < DF_T.playerDrop) {
    P.x = TOWER.x; P.y = TOWER_TOP_Y + (D.floors[2].dy || 0); P.rot = (D.floors[2].rot || 0);
  } else {
    const k = clamp((t - DF_T.playerDrop) / DF_T.playerDur, 0, 1);
    P.x = TOWER.x + k * 74;
    P.y = (TOWER_TOP_Y + floorH * 2.05) + (GROUND_Y - TOWER_TOP_Y - floorH * 2.05) * (k * k);
    P.rot = k * 1.45;                                   // غلتیدن روی زمین
  }

  /* --- ۶) محو تیره و پایان --- */
  DF.fade = clamp((t - DF_T.fadeStart) / DF_T.fadeDur, 0, 1);
  if (t >= DF_T.end) finishDefeatCine();
}

/* ---------- لایه‌ی نمایشی (نوار سینما + زیرنویس + محو) ---------- */
function drawDefeatOverlay() {
  if (!DF) return;
  const t = DF.t;
  /* نوارهای سینمایی */
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 42);
  ctx.fillRect(0, H - 42, W, 42);
  /* زیرنویس‌های مرحله‌ای */
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 17px Tahoma, sans-serif';
  for (const [a, b, txt] of DF_CAPS) {
    if (t >= a && t <= b) {
      const alpha = Math.min(1, (t - a) / 0.18, (b - t) / 0.25);
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillText(txt, W / 2 + 1, H - 63);
      ctx.fillStyle = '#ffd9a0';
      ctx.fillText(txt, W / 2, H - 64);
      ctx.globalAlpha = 1;
    }
  }
  /* محوِ تیره‌ی پایان */
  if (DF.fade > 0) {
    ctx.fillStyle = 'rgba(8,2,4,' + DF.fade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}
