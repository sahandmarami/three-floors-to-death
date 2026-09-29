/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۷٫۰ — بخش ۱۰: ارشان روی برج
   ==================================================================
   حضور منطقیِ ارشان در طول گیم‌پلی دفاعی (نه فقط کات‌سین‌ها):
     • روی لبه‌ی طبقه‌ی دوم برج می‌ایستد — کنار برجک‌ها و پنل ساخت‌وساز
     • انیمیشن ساده: دیده‌بانی با دوربین (وقتی دسته از دور می‌آید)،
       مهمات‌رسانی (وقتی بازیکن رگبار می‌ریزد)، نگاه به سمت خطر
     • با سیستم بارک صوتی موجود، وسط موج جمله‌های کوتاه محاوره‌ای می‌گوید:
       هشدار گروه بزرگ / تشویق بعد از کشتار / باتری چراغ‌قوه / ترک برج /
       صبح بخیر بعد از هر موج — ۶ کلیپ تازه (aw1..aw6 در voices17)
   رندر: drawTowerArshan() از render() صدا زده می‌شود؛ آلفایش با طبقه‌ی
   دوم برج هم‌گام است (حین فروریختن/باخت همراه طبقه محو می‌شود).
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
};

const ARSHAN_BARKS = {
  aw1: { who: 'a', v: 'aw1', text: 'من همین‌جام! دیده‌بانی با من — تو فقط شلیک کن!', title: '🧭 [ارشان]:', sub: 'من همین‌جام! دیده‌بانی با من — تو فقط شلیک کن!' },
  aw2: { who: 'a', v: 'aw2', text: 'حواست باشه! یه گروه بزرگ از اون طرف داره میاد!', title: '⚠️ [ارشان]:', sub: 'حواست باشه! یه گروه بزرگ از اون طرف داره میاد!' },
  aw3: { who: 'a', v: 'aw3', text: 'دمت گرم! همین‌جوری بزن!', title: '🔥 [ارشان]:', sub: 'دمت گرم! همین‌جوری بزن!' },
  aw4: { who: 'a', v: 'aw4', text: 'باتری چراغ‌قوه‌ت داره تموم می‌شه!', title: '🔋 [ارشان]:', sub: 'باتری چراغ‌قوه‌ت داره تموم می‌شه!' },
  aw5: { who: 'a', v: 'aw5', text: 'برج ترک خورده! حواست جمع باشه!', title: '🧱 [ارشان]:', sub: 'برج ترک خورده! حواست جمع باشه!' },
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

/* ---- ۱۰-۲) منطق: بارک‌های وسط موج (UPDATE_HOOKS) ---- */
UPDATE_HOOKS.push(function arshanUpdate(dt) {
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

/* ---- ۱۰-۳) رسم ارشان روی لبه‌ی طبقه‌ی دوم برج ---- */
/* از render() بعد از drawTower() صدا زده می‌شود؛ آلفا با طبقه‌ی دوم
   هم‌گام است (فروریختن/باخت) — در منو هم دیده می‌شود (صحنه‌ی زنده) */
function drawTowerArshan() {
  if (typeof TOWER === 'undefined') return;
  /* آلفای طبقه‌ی دوم (کات‌سین فروریختن/باخت) */
  const f1 = (CS && CS.draw) ? CS.draw.floors[1] : null;
  const alpha = f1 ? f1.a : 1;
  if (alpha < 0.35) return;

  const ax = TOWER.x + 44;
  const ay = GROUND_Y - 137;              // روی لبه‌ی برآمده‌ی طبقه‌ی دوم
  const bob = Math.sin(animTime * 2.2) * 1.1;
  const look = ARSHAN.look;
  const binoc = ARSHAN.binoc > 0;
  const ammo = ARSHAN.ammo > 0;
  const night = state.dayness < 0.45;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(0, f1 && f1.dy ? f1.dy : 0);

  /* نور فانوس شب */
  if (night) {
    const lg = ctx.createRadialGradient(ax, ay - 22, 3, ax, ay - 22, 46);
    lg.addColorStop(0, 'rgba(255,214,130,' + (0.22 + 0.06 * Math.sin(animTime * 3)).toFixed(2) + ')');
    lg.addColorStop(1, 'rgba(255,214,130,0)');
    ctx.fillStyle = lg; circle(ax, ay - 22, 46);
  }

  /* سایه روی لبه */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(ax, ay + 2, 11, 3.2, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(ax, ay + bob);
  if (binoc) ctx.translate(0, -1.5);

  /* پاها */
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 4.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3.4, -12); ctx.lineTo(-4.6 + look * 1.4, 0);
  ctx.moveTo(3.4, -12); ctx.lineTo(4.6 + look * 1.4, 0);
  ctx.stroke();

  /* بدن — کاپشن سبز ارشان */
  ctx.fillStyle = '#4a7a4a';
  rr(-8, -27, 16, 16, 5); ctx.fill();
  ctx.fillStyle = '#3a6238';
  ctx.fillRect(-8, -13, 16, 3);

  /* بازوها */
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 3.6;
  ctx.beginPath();
  if (binoc) {
    /* دوربین جلوی چشم‌ها */
    ctx.moveTo(-4, -23); ctx.lineTo(-1, -31);
    ctx.moveTo(4, -23); ctx.lineTo(1, -31);
  } else if (ammo) {
    /* جعبه‌ی مهمات جلو داده‌شده */
    const push = Math.sin(animTime * 6) * 1.4;
    ctx.moveTo(-4, -23); ctx.lineTo(-9 - push, -19);
    ctx.moveTo(4, -23); ctx.lineTo(9 + push, -19);
  } else {
    const sway = Math.sin(animTime * 2.2) * 1.6;
    ctx.moveTo(-4, -23); ctx.lineTo(-7, -15 + sway);
    ctx.moveTo(4, -23); ctx.lineTo(7, -15 - sway);
  }
  ctx.stroke();

  /* سر + کلاه قرمز ارشان */
  ctx.fillStyle = '#f0c49a'; circle(look * 1.2, -32, 6.2);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(look * 1.2, -32.6, 6.6, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(look * 1.2 - 7, -33.4, 14, 2.6);

  /* دوربین دوچشمی هنگام دیده‌بانی */
  if (binoc) {
    ctx.fillStyle = '#1d2433';
    rr(look * 1.2 - 4.6, -33.5, 4, 4.6, 1.4); ctx.fill();
    rr(look * 1.2 + 0.6, -33.5, 4, 4.6, 1.4); ctx.fill();
    ctx.fillStyle = 'rgba(160,215,255,0.8)';
    ctx.fillRect(look * 1.2 - 3.8, -31.6, 2.4, 1.4);
    ctx.fillRect(look * 1.2 + 1.4, -31.6, 2.4, 1.4);
    /* برق لنز */
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillRect(look * 1.2 - 3.2, -32.8, 1.1, 1.1);
    ctx.fillRect(look * 1.2 + 2, -32.8, 1.1, 1.1);
  }

  /* چشم‌ها (وقتی دوربین بالا نیست) */
  if (!binoc) {
    ctx.fillStyle = '#1d2433';
    circle(look * 1.2 + look * 2 - 1.6, -33, 1);
    circle(look * 1.2 + look * 2 + 1.8, -33, 1);
  }

  /* جعبه‌ی مهمات در دست‌ها */
  if (ammo) {
    const push = Math.sin(animTime * 6) * 1.4;
    ctx.save();
    ctx.translate(0, -18);
    ctx.fillStyle = '#8a6a3c'; rr(-8 - push * 0.4, -5, 16, 10, 2); ctx.fill();
    ctx.fillStyle = '#6d5230';
    ctx.fillRect(-8 - push * 0.4, -1.5, 16, 2);
    ctx.fillStyle = '#ffd873';
    circle(-3, -2.5, 1.1); circle(2.5, -2.5, 1.1);
    ctx.restore();
    /* برق مهمات که بالا می‌رود (حس رساندن به بازیکن) */
    if (Math.random() < 0.12) {
      spawnParticles(ax + rand(-6, 6), ay - 26, 1, '#ffd873',
        { speed: 40, life: 0.6, size: 1.6, grav: -60 });
    }
  }

  /* فانوس کوچک شب (دست راست) */
  if (night && !ammo && !binoc) {
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(6, -20); ctx.lineTo(10, -13); ctx.stroke();
    ctx.fillStyle = '#ffd873';
    ctx.save();
    ctx.shadowColor = '#ffd873'; ctx.shadowBlur = 8;
    circle(10.4, -11.6, 2.8); ctx.restore();
  }

  ctx.restore();
}
