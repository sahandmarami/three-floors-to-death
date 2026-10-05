/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۸٫۰ — بخش ۱۰: ارشان روی برج
   ==================================================================
   حضور منطقیِ ارشان در طول گیم‌پلی دفاعی (نه فقط کات‌سین‌ها):
     • (۱۸٫۰) روی بامِ برج می‌ایستد — پشت کنگره‌ها، کنار بازیکن.
       «جای دیده‌بان» است: پاها روی سکوی واقعیِ بام، نه لبه‌ی
       معلقِ طبقه‌ی دوم. حین فروریختن، همراه بام حرکت/محو می‌شود.
     • انیمیشن ساده: دیده‌بانی با دوربین (وقتی دسته از دور می‌آید)،
       مهمات‌رسانی (وقتی بازیکن رگبار می‌ریزد)، نگاه به سمت خطر
     • (۱۸٫۰) منطق «پایین‌رفتن»: وقتی برج ترک می‌خورد (جون < ۳۲٪)
       با طناب پایین می‌رود (محو می‌شود) — هم‌زمان با بارک aw5؛
       تا جون ۴۵٪ برنگردد (هیسترزیس). صبحِ روزِ تعمیرشده برمی‌گردد.
       در کات‌سین/انتقال/افتتاحیه حاضر نیست (با بازیکن است).
     • با سیستم بارک صوتی موجود، وسط موج جمله‌های کوتاه محاوره‌ای
       می‌گوید: هشدار گروه بزرگ / تشویق / باتری چراغ‌قوه / ترک برج /
       صبح بخیر بعد از هر موج — ۶ کلیپ (aw1..aw6 در voices17)
     • (۱۸٫۰) کارایی: هاله‌ی فانوس شب از یک اسپرایت پیش‌پخته
       رسم می‌شود (drawImage) — دیگر shadowBlur هر فریم نیست.
   رندر: drawTowerArshan() از داخل drawTower() بین «طبقه‌ها» و
   «کنگره‌ها» صدا زده می‌شود — کنگره‌ها پایین‌تنه‌اش را می‌پوشانند.
   ================================================================== */

/* ---- ۱۰-۱) وضعیت ارشان روی برج ---- */
const ARSHAN = {
  playT: 0, dayT: 0, dayDone: false,
  lastBark: -99,
  wave: -1,
  flags: {},          /* پرچم‌های یک‌بار-در-موج: start/group/batt/tower */
  killsMark: 0,
  binoc: 0, binocNext: 5,   /* تایمر دیده‌بانی با دوربین */
  ammo: 0, ammoNext: 8,     /* تایمر مهمات‌رسانی */
  fireHeat: 0,              /* آیا بازیکن در حال رگبار است؟ */
  look: 1,                   /* جهت نگاه: -1 چپ / 1 راست */
  vis: 1, visT: 1,          /* (۱۸٫۰) حضور روی بام (۰..۱) + هدف */
  _glow: null,               /* (۱۸٫۰) اسپرایت پیش‌پخته‌ی هاله‌ی فانوس */
};

const ARSHAN_BARKS = {
  aw1: { who: 'a', v: 'aw1', text: 'من همین‌جام! دیده‌بانی با من — تو فقط شلیک کن!', title: '🧭 [ارشان]:', sub: 'من همین‌جام! دیده‌بانی با من — تو فقط شلیک کن!' },
  aw2: { who: 'a', v: 'aw2', text: 'حواست باشه! یه گروه بزرگ از اون طرف داره میاد!', title: '⚠️ [ارشان]:', sub: 'حواست باشه! یه گروه بزرگ از اون طرف داره میاد!' },
  aw3: { who: 'a', v: 'aw3', text: 'دمت گرم! همین‌جوری بزن!', title: '🔥 [ارشان]:', sub: 'دمت گرم! همین‌جوری بزن!' },
  aw4: { who: 'a', v: 'aw4', text: 'باتری چراغ‌قوه‌ت داره تموم می‌شه!', title: '🔋 [ارشان]:', sub: 'باتری چراغ‌قوه‌ت داره تموم می‌شه!' },
  /* (۱۸٫۰) هم‌زمان با پایین‌رفتنِ تصویری‌اش با طناب وقتی برج ترک می‌خورد */
  aw5: { who: 'a', v: 'aw5', text: 'برج ترک خورده! من می‌رم پایین — تو فقط حواست جمع باشه!', title: '🧱 [ارشان]:', sub: 'برج ترک خورده! من می‌رم پایین — تو فقط حواست جمع باشه!' },
  aw6: { who: 'a', v: 'aw6', text: 'خسته نباشی! موج بعدی رو من رصد می‌کنم.', title: '🌤 [ارشان]:', sub: 'خسته نباشی! موج بعدی رو من رصد می‌کنم.' },
};

/* گفتنِ دستی یک بارک (تست/دیباگ) */
function arshanForce(key) {
  const b = ARSHAN_BARKS[key];
  if (!b) return false;
  ARSHAN.lastBark = state.time;
  try { bark(b.v, b.who, b.text, b.title, b.sub, 3); } catch (e) {}
  return true;
}

/* ---- ۱۰-۲) منطق: حضور روی بام + بارک‌های وسط موج ---- */
UPDATE_HOOKS.push(function arshanUpdate(dt) {
  /* (۱۸٫۰) هدفِ حضور: فقط در صحنه‌های دفاعی/روز/منو روی بام است؛
     در کات‌سین/انتقال/افتتاحیه/باخت با بازیکن است (نامرئی) */
  ARSHAN.visT = 1;
  if (!(state.mode === 'playing' || state.mode === 'day' || state.mode === 'intermission' || state.mode === 'start')) {
    ARSHAN.visT = 0;
  } else if (state.mode === 'playing') {
    const ratio = state.tower.hp / state.tower.maxHp;
    /* برج ترک خورده؟ با طناب پایین می‌رود؛ تا تعمیرِ محسوس برنمی‌گردد */
    if (ratio < 0.32) ARSHAN.visT = 0;
    else if (ratio < 0.45) ARSHAN.visT = ARSHAN.vis < 0.5 ? 0 : 1;   /* هیسترزیس */
  }
  ARSHAN.vis += (ARSHAN.visT - ARSHAN.vis) * Math.min(1, dt * 3.2);

  if (state.mode === 'playing') {
    ARSHAN.playT += dt;
    ARSHAN.dayT = 0; ARSHAN.dayDone = false;

    /* ریست پرچم‌ها در موج تازه */
    if (state.wave !== ARSHAN.wave) {
      ARSHAN.wave = state.wave;
      ARSHAN.flags = {};
      ARSHAN.killsMark = state.stats.kills;
    }
    /* گرمای شلیک بازیکن (برای انیمیشن مهمات‌رسانی) */
    ARSHAN.fireHeat = Math.max(0, ARSHAN.fireHeat - dt * 0.5);
    if (state.fireFlash > 0) ARSHAN.fireHeat = Math.min(3, ARSHAN.fireHeat + dt * 4);

    /* --- انیمیشن‌ها: دوربین/جعبه مهمات --- */
    ARSHAN.binocNext -= dt;
    if (ARSHAN.binoc > 0) {
      ARSHAN.binoc -= dt;
    } else if (ARSHAN.binocNext <= 0) {
      const far = state.zombies.some(z => !z.dead && Math.abs(z.x - TOWER.x) > 340);
      if (far) { ARSHAN.binoc = 2.6; ARSHAN.binocNext = 7 + Math.random() * 5; }
      else ARSHAN.binocNext = 3;
    }
    ARSHAN.ammoNext -= dt;
    if (ARSHAN.ammo > 0) {
      ARSHAN.ammo -= dt;
    } else if (ARSHAN.ammoNext <= 0) {
      if (ARSHAN.fireHeat > 1.2) { ARSHAN.ammo = 2; ARSHAN.ammoNext = 6 + Math.random() * 4; }
      else ARSHAN.ammoNext = 2.5;
    }
    /* نگاه به سمت نزدیک‌ترین زامبی */
    let nearest = null, nd = 1e9;
    for (const z of state.zombies) {
      if (z.dead) continue;
      const d = Math.abs(z.x - TOWER.x);
      if (d < nd) { nd = d; nearest = z; }
    }
    if (nearest) ARSHAN.look = nearest.x < TOWER.x ? -1 : 1;

    /* --- بارک‌ها: اولویت + فاصله‌ی حداقل ۱۳ ثانیه + بدون هم‌پوشانی گفتگو --- */
    const canBark = ARSHAN.playT > 3 &&
      (state.time - ARSHAN.lastBark) > 13 &&
      !(typeof DLG !== 'undefined' && DLG.active);
    if (canBark) {
      const alive = state.zombies.filter(z => !z.dead);
      const ratio = state.tower.hp / state.tower.maxHp;
      let key = null;
      if (ratio < 0.32 && !ARSHAN.flags.tower) key = 'aw5';
      else if (state.torch.owned && state.torch.on && state.torch.battery <= 22 && !ARSHAN.flags.batt) key = 'aw4';
      else if (!ARSHAN.flags.group) {
        const left = alive.filter(z => z.x < TOWER.x).length;
        const right = alive.length - left;
        if (Math.max(left, right) >= 8 && alive.length >= 12) key = 'aw2';
      }
      if (!key && !ARSHAN.flags.kills && state.stats.kills - ARSHAN.killsMark >= 15) key = 'aw3';
      if (!key && !ARSHAN.flags.start && alive.length > 0) key = 'aw1';
      if (key) {
        ARSHAN.flags[key === 'aw5' ? 'tower' : key === 'aw4' ? 'batt' : key === 'aw2' ? 'group' : key === 'aw3' ? 'kills' : 'start'] = true;
        if (key === 'aw3') ARSHAN.killsMark = state.stats.kills;
        ARSHAN.lastBark = state.time;
        const b = ARSHAN_BARKS[key];
        try { bark(b.v, b.who, b.text, b.title, b.sub, 3); } catch (e) {}
      }
    }
  } else if (state.mode === 'day') {
    /* صبحِ بعد از موج: یک «خسته نباشی» بعد از محوشدن اعلانِ صبح */
    ARSHAN.dayT += dt;
    ARSHAN.binoc = 0; ARSHAN.ammo = 0;
    if (!ARSHAN.dayDone && ARSHAN.dayT > 4.2 &&
        (state.time - ARSHAN.lastBark) > 10 &&
        !(typeof DLG !== 'undefined' && DLG.active)) {
      ARSHAN.dayDone = true;
      ARSHAN.lastBark = state.time;
      const b = ARSHAN_BARKS.aw6;
      try { bark(b.v, b.who, b.text, b.title, b.sub, 3); } catch (e) {}
    }
  } else {
    ARSHAN.fireHeat = Math.max(0, ARSHAN.fireHeat - dt);
  }
});

/* ---- ۱۰-۳) (۱۸٫۰) اسپرایت پیش‌پخته‌ی هاله‌ی فانوس ----
   یک‌بار ساخته می‌شود؛ هر فریم فقط drawImage — بدون shadowBlur */
function arshanGlow() {
  if (ARSHAN._glow) return ARSHAN._glow;
  const c = document.createElement('canvas');
  c.width = 96; c.height = 96;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(48, 48, 4, 48, 48, 46);
  rg.addColorStop(0, 'rgba(255,214,130,0.85)');
  rg.addColorStop(0.35, 'rgba(255,205,120,0.32)');
  rg.addColorStop(1, 'rgba(255,200,110,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 96, 96);
  ARSHAN._glow = c;
  return c;
}

/* (۱۸٫۰) آیا ارشان الان روی بام رسم می‌شود؟ — فقط صحنه‌های دفاعی/روز/منو.
   دروازه در خودِ رسم است (نه فقط هوک) چون هوک‌ها در intro/transition/
   cutscene اجرا نمی‌شوند و vis همان لحظه صفر نمی‌شود */
function arshanOnRoof() {
  return ARSHAN.vis > 0.35 &&
    (state.mode === 'playing' || state.mode === 'day' ||
     state.mode === 'intermission' || state.mode === 'start');
}

/* ---- ۱۰-۴) رسم ارشان روی بامِ برج (پشت کنگره‌ها) ----
   از drawTower() بین طبقه‌ها و کنگره‌ها صدا زده می‌شود — تبدیلِ
   طبقه‌ی سوم (چرخش/سقوط) را فراخواننده اعمال کرده است.
   مختصات محلی: پاها روی خط بام (TOWER_TOP_Y)، سمت راستِ پرچم. */
function drawTowerArshan() {
  if (!arshanOnRoof()) return;               /* (۱۸٫۰) دروازه‌ی حالت — مستقل از هوک‌ها */
  const ax = TOWER.x + 38;
  const ay = TOWER_TOP_Y - 1;
  const bob = Math.sin(animTime * 2.2) * 1.1;
  const look = ARSHAN.look;
  const binoc = ARSHAN.binoc > 0;
  const ammo = ARSHAN.ammo > 0;
  const night = state.dayness < 0.45;

  ctx.save();
  ctx.globalAlpha *= ARSHAN.vis;

  /* نور فانوس شب — اسپرایت پیش‌پخته (۱۸٫۰) */
  if (night) {
    const gs = arshanGlow();
    const fl = 0.5 + 0.16 * Math.sin(animTime * 3);   /* سوسوِ ملایم */
    const sc = 1 + 0.06 * Math.sin(animTime * 3);
    const ga = ctx.globalAlpha;
    ctx.globalAlpha = ga * fl;
    ctx.drawImage(gs, ax - 48 * sc, ay - 22 + bob - 48 * sc, 96 * sc, 96 * sc);
    ctx.globalAlpha = ga;
  }

  /* سایه روی کفِ بام */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(ax, ay + 1, 10, 2.8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(ax, ay + bob);
  if (binoc) ctx.translate(0, -1.5);

  /* پاها — (۲۱٫۲) سایه‌روشن + بوت */
  ctx.strokeStyle = 'rgba(8,12,20,0.5)'; ctx.lineWidth = 5.6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3.2, -12); ctx.lineTo(-4.4 + look * 1.4, 0);
  ctx.moveTo(3.2, -12); ctx.lineTo(4.4 + look * 1.4, 0);
  ctx.stroke();
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(-3.2, -12); ctx.lineTo(-4.4 + look * 1.4, 0);
  ctx.moveTo(3.2, -12); ctx.lineTo(4.4 + look * 1.4, 0);
  ctx.stroke();
  ctx.fillStyle = '#1a2033';
  rr(-7.4 + look * 1.4, -2.2, 6, 2.6, 1); ctx.fill();
  rr(1.4 + look * 1.4, -2.2, 6, 2.6, 1); ctx.fill();

  /* بدن — کاپشن سبز ارشان (۲۱٫۲: گرادیان + زیپ + یقه) */
  const ajG = ctx.createLinearGradient(-7.6, -26, 7.6, -11);
  ajG.addColorStop(0, '#5b8f5b'); ajG.addColorStop(0.5, '#4a7a4a'); ajG.addColorStop(1, '#335233');
  ctx.fillStyle = ajG;
  rr(-7.6, -26, 15.2, 15, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(8,12,20,0.5)'; ctx.lineWidth = 1;
  rr(-7.6, -26, 15.2, 15, 5); ctx.stroke();
  ctx.fillStyle = '#3a6238';
  ctx.fillRect(-7.6, -12.5, 15.2, 3);
  ctx.strokeStyle = '#d8e2f2'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(0, -24.5); ctx.lineTo(0, -13.5); ctx.stroke();   // زیپ
  ctx.fillStyle = 'rgba(255,255,255,0.13)'; rr(-6.8, -25.2, 5.6, 2.6, 1.2); ctx.fill();  // هایلایت شانه
  ctx.fillStyle = '#c9a24e'; ctx.fillRect(-1.8, -12.5, 3.6, 3);              // سگک کمربند

  /* بازوها — (۲۱٫۲) با لبه‌ی تیره */
  ctx.strokeStyle = 'rgba(8,12,20,0.5)'; ctx.lineWidth = 4.6;
  ctx.beginPath();
  if (binoc) {
    ctx.moveTo(-4, -22); ctx.lineTo(-1, -30);
    ctx.moveTo(4, -22); ctx.lineTo(1, -30);
  } else if (ammo) {
    const push = Math.sin(animTime * 6) * 1.4;
    ctx.moveTo(-4, -22); ctx.lineTo(-9 - push, -18);
    ctx.moveTo(4, -22); ctx.lineTo(9 + push, -18);
  } else {
    const sway = Math.sin(animTime * 2.2) * 1.6;
    ctx.moveTo(-4, -22); ctx.lineTo(-7, -14 + sway);
    ctx.moveTo(4, -22); ctx.lineTo(7, -14 - sway);
  }
  ctx.stroke();
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 3.4;
  ctx.beginPath();
  if (binoc) {
    /* دوربین جلوی چشم‌ها */
    ctx.moveTo(-4, -22); ctx.lineTo(-1, -30);
    ctx.moveTo(4, -22); ctx.lineTo(1, -30);
  } else if (ammo) {
    /* جعبه‌ی مهمات جلو داده‌شده */
    const push = Math.sin(animTime * 6) * 1.4;
    ctx.moveTo(-4, -22); ctx.lineTo(-9 - push, -18);
    ctx.moveTo(4, -22); ctx.lineTo(9 + push, -18);
  } else {
    const sway = Math.sin(animTime * 2.2) * 1.6;
    ctx.moveTo(-4, -22); ctx.lineTo(-7, -14 + sway);
    ctx.moveTo(4, -22); ctx.lineTo(7, -14 - sway);
  }
  ctx.stroke();

  /* سر + کلاه قرمز ارشان — (۲۱٫۲) باک‌اسکی با تا + چین + گوش */
  ctx.fillStyle = '#f0c49a'; circle(look * 1.2, -31, 6);
  ctx.beginPath(); ctx.arc(look * 1.2 - 4.8, -31.4, 2, Math.PI * 0.4, Math.PI * 1.6); ctx.fill();  // گوش
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(look * 1.2, -31.6, 6.4, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(look * 1.2 - 6.8, -32.4, 13.6, 2.5);
  ctx.fillStyle = '#8f3838';                                              // تا‌ی کلاه
  ctx.beginPath(); ctx.moveTo(look * 1.2 - 3.6, -37.2); ctx.lineTo(look * 1.2 + 0.6, -37.6); ctx.lineTo(look * 1.2 + 0.2, -34.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(8,12,20,0.45)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(look * 1.2, -31.6, 6.4, Math.PI, Math.PI * 2); ctx.stroke();

  /* دوربین دوچشمی هنگام دیده‌بانی */
  if (binoc) {
    ctx.fillStyle = '#1d2433';
    rr(look * 1.2 - 4.4, -32.5, 3.8, 4.4, 1.3); ctx.fill();
    rr(look * 1.2 + 0.6, -32.5, 3.8, 4.4, 1.3); ctx.fill();
    ctx.fillStyle = 'rgba(160,215,255,0.8)';
    ctx.fillRect(look * 1.2 - 3.6, -30.7, 2.3, 1.3);
    ctx.fillRect(look * 1.2 + 1.4, -30.7, 2.3, 1.3);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(look * 1.2 - 3, -31.8, 1, 1);
    ctx.fillRect(look * 1.2 + 2, -31.8, 1, 1);
  }

  /* چشم‌ها (وقتی دوربین بالا نیست) */
  if (!binoc) {
    ctx.fillStyle = '#1d2433';
    circle(look * 1.2 + look * 2 - 1.5, -32, 1);
    circle(look * 1.2 + look * 2 + 1.7, -32, 1);
  }

  /* جعبه‌ی مهمات در دست‌ها */
  if (ammo) {
    const push = Math.sin(animTime * 6) * 1.4;
    ctx.save();
    ctx.translate(0, -17);
    ctx.fillStyle = '#8a6a3c'; rr(-7.6 - push * 0.4, -4.8, 15.2, 9.5, 2); ctx.fill();
    ctx.fillStyle = '#6d5230';
    ctx.fillRect(-7.6 - push * 0.4, -1.4, 15.2, 2);
    ctx.fillStyle = '#ffd873';
    circle(-2.8, -2.4, 1.05); circle(2.4, -2.4, 1.05);
    ctx.restore();
    /* برق مهمات که بالا می‌رود (حس رساندن به بازیکن) */
    if (Math.random() < 0.1) {
      spawnParticles(ax + rand(-6, 6), ay - 25, 1, '#ffd873',
        { speed: 40, life: 0.6, size: 1.5, grav: -60 });
    }
  }

  /* فانوس کوچک شب (دست راست) — بدون shadowBlur (۱۸٫۰) */
  if (night && !ammo && !binoc) {
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(6, -19); ctx.lineTo(9.4, -12.6); ctx.stroke();
    ctx.fillStyle = '#ffd873';
    circle(9.8, -11.2, 2.6);
    ctx.fillStyle = 'rgba(255,236,170,0.9)';
    circle(9.8, -11.2, 1.2);
  }

  ctx.restore();
}
