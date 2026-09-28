/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۰٫۰ — بخش ۹: «آخرین شب» و صحنه‌ی پیروزی
   ==================================================================
   موج ۳۳ (پایان فصل ۴) = آخرین موج کل بازی:
     - فروشگاه/ساخت‌وساز قفل است؛ فقط موجودی کوله‌پشتی و برج
     - برق کاملاً قطع است؛ تنها چراغ‌قوه کار می‌کند؛ اگر باتری
       تمام شود چند لحظه صفحه تقریباً کاملاً تاریک می‌شود (فقط
       چشم‌های زامبی‌ها و برقِ آسمان دیده می‌شود)
     - باس «نگهبانِ آخرین شب» با الگوی حمله‌ی خاص:
         · پرتاب آوار به سمت بام (گلوله‌ات می‌تواند آوار را بترکاند)
         · فراخوان زامبی‌های سریع
         · فاز خشم زیر ۴۰٪ جون (سریع‌تر و پرتابِ بیشتر)
     - رد شدن از این موج = صحنه‌ی سحرِ پیروزی + پایان واقعی بازی
   ================================================================== */

let VC = null;      // وضعیت صحنه‌ی پیروزی (victory cinematic)

/* ---------------------- ۹-۱) هوک باس: الگوی حمله ---------------------- */
UPDATE_HOOKS.push(function bossUpdate(dt) {
  if (state.mode !== 'playing' || state.wave < FINAL_WAVE) return;
  const boss = state.zombies.find(z => z.type === 'boss' && !z.dead);
  if (boss) {
    if (!boss.ai) boss.ai = { throwT: 3.6, summonT: 11, rage: false };
    const ai = boss.ai;
    const rage = boss.hp < boss.maxHp * 0.4;
    if (rage && !ai.rage) {
      ai.rage = true;
      boss.speed *= 1.5;
      setAnnounce('🔥 نگهبان خشمگین شد!', 'سریع‌تر و پرتاب‌هایش بیشتر شد — مراقب بام باش!', 2.4);
      SFX.roar();
      state.shake = 10;
    }
    /* پرتاب آوار به سمت بام برج */
    ai.throwT -= dt;
    if (ai.throwT <= 0 && Math.abs(boss.x - TOWER.x) > 150) {
      ai.throwT = rage ? 2.7 : 4.2;
      bossThrowDebris(boss);
    }
    /* فراخوان زامبی‌های سریع */
    ai.summonT -= dt;
    if (ai.summonT <= 0 && state.zombies.filter(z => !z.dead).length < 7) {
      ai.summonT = rage ? 9 : 13;
      setAnnounce('💀 نگهبان فراخوان می‌کند!', 'زامبی‌های سریع در راه‌اند — جلویشون رو بگیر!', 1.8);
      SFX.roar();
      for (let i = 0; i < 3; i++) spawnZombie('fast');
    }
  }
  /* فیزیک آوار پرتابی + برخوردها */
  for (const p of state.projectiles) {
    if (p.dead) continue;
    p.vy += 700 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.rot += p.vr * dt;
    /* برخورد با برج: آسیب به بام */
    if (Math.abs(p.x - TOWER.x) < 40 && p.y > TOWER_TOP_Y - 26 && p.y < GROUND_Y) {
      p.dead = true;
      damageTower(16, p.x);
      debrisBurst(p.x, p.y);
      continue;
    }
    if (p.y > GROUND_Y) { p.dead = true; debrisBurst(p.x, GROUND_Y); continue; }
    if (p.x < -70 || p.x > W + 70) { p.dead = true; continue; }
    /* گلوله‌ی بازیکن/برجک‌ها می‌تواند آوار را در هوا بترکاند */
    for (const b of state.bullets) {
      if (b.dead) continue;
      const dx = b.x - p.x, dy = b.y - p.y;
      const rr2 = (p.r + b.r + 5) * (p.r + b.r + 5);
      if (dx * dx + dy * dy < rr2) {
        b.dead = true;
        p.dead = true;
        debrisBurst(p.x, p.y);
        addText(p.x, p.y - 22, 'ترکید! 💥', '#ffb347', 13);
        break;
      }
    }
  }
  state.projectiles = state.projectiles.filter(p => !p.dead);
});

/* پرتاب یک تکه آوار با قوس به سمت بام برج */
function bossThrowDebris(boss) {
  const T = 1.35;                                   // زمان پرواز
  const tx = TOWER.x + rand(-12, 12), ty = TOWER_TOP_Y - 4;
  const ox = boss.x, oy = boss.y - 60;
  state.projectiles.push({
    x: ox, y: oy,
    vx: (tx - ox) / T,
    vy: (ty - oy - 0.5 * 700 * T * T) / T,
    r: 13, rot: 0, vr: rand(-6, 6), dead: false,
  });
  SFX.csCrash();
  state.shake = Math.max(state.shake, 2.5);
  /* ژست پرتاب: جرقه از دست نگهبان */
  spawnParticles(ox + Math.sign(TOWER.x - ox) * 20, oy, 10, '#8a7a5c',
    { speed: 120, life: 0.45, size: 2.6, grav: 420 });
}

/* انفجار آوار */
function debrisBurst(x, y) {
  SFX.csBoom();
  state.shake = Math.max(state.shake, 6);
  spawnParticles(x, y, 18, '#8a7a5c', { speed: 200, life: 0.6, size: 3, grav: 500 });
  spawnParticles(x, y, 8, '#ff9a3d', { speed: 160, life: 0.5, size: 2.4, grav: 400 });
}

/* رسم آوار پرتابی (روی صحنه، بعد از گلوله‌ها) */
function drawDebris() {
  for (const p of state.projectiles) {
    if (p.dead) continue;
    /* هاله‌ی خطر نارنجی */
    const g2 = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r * 2.6);
    g2.addColorStop(0, 'rgba(255,150,60,0.25)');
    g2.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g2;
    circle(p.x, p.y, p.r * 2.6);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#6a5a44';
    rr(-p.r, -p.r * 0.8, p.r * 2, p.r * 1.6, 3); ctx.fill();
    ctx.fillStyle = '#8a7a5c';
    ctx.fillRect(-p.r * 0.5, -p.r * 0.6, p.r, p.r * 0.7);
    ctx.strokeStyle = '#ff9a3d'; ctx.lineWidth = 1.6;      // ترک‌های آتشین
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.6, -p.r * 0.3); ctx.lineTo(0, p.r * 0.2); ctx.lineTo(p.r * 0.5, -p.r * 0.4);
    ctx.stroke();
    ctx.restore();
  }
}

/* ---------------------- ۹-۲) صحنه‌ی پیروزی (سحرِ پناهگاه) ---------------------- */
/* بعد از مرگ نگهبان: اسلوموشن + بارش طلایی + طلوع + آمدن ارشان با رادیو */
function startVictoryCine() {
  if (state.mode === 'victorycine') return;
  VC = { t: 0, radio: false };
  state.mode = 'victorycine';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 1.6;                        // شروعِ سینماییِ کند
  state.dayTarget = 1;                       // سحر می‌شود
  $('lockBadge').classList.add('hidden');
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  SFX.slowmo();
}

function updateVictoryCine(dt) {
  if (!VC) return;
  VC.t += dt;
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.comboPop = Math.max(0, state.comboPop - dt);
  updateParticles(dt);
  updateTexts(dt);
  /* بارش طلایی اولِ صحنه */
  if (VC.t < 2.4 && Math.random() < dt * 20) {
    spawnParticles(rand(0, W), -8, 1, '#ffd873',
      { speed: 26, life: 2.4, size: 2.4, grav: 110 });
  }
  /* صدای رادیو در سحر */
  if (!VC.radio && VC.t > 3.2) {
    VC.radio = true;
    SFX.peddler();
  }
  if (VC.t > 4.6) {
    wipeSave();                              // پایان بازی — سیو پاک شود
    victory();
  }
}

function renderVictoryCine() {
  if (!VC) return;
  /* صحنه‌ی عادی (بدون زامبی) در نورِ طلوع */
  drawSky();
  drawClouds();
  ctx.save(); ctx.translate(-menuPar(12), 0); drawSkyline(); ctx.restore();
  ctx.save(); ctx.translate(-menuPar(26), 0); drawHills(); ctx.restore();
  drawPuddles();
  drawGrass();
  drawDecals();
  drawTree(88, 0.95, !!curCh().theme.deadTrees);
  drawTree(874, 0.7, !!curCh().theme.deadTrees);
  drawLamps();
  drawTrap();
  drawTower();
  drawChapterProps();
  drawPlayer();
  /* ارشان با رادیو از چپ می‌آید */
  if (VC.t > 2.6) {
    const k = clamp((VC.t - 2.6) / 2.0, 0, 1);
    const ax = -46 + k * (TOWER.x - 130 + 46);
    drawArshanWithRadio(ax, GROUND_Y);
  }
  drawShootingStar();
  drawFireflies();
  drawParticles();
  drawTexts();
  /* زیرنویس */
  if (VC.t > 2.9 && VC.t < 4.6) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 15px Tahoma, sans-serif';
    const txt = '— [ارشان]: شنیدی؟! پناهگاه هنوز بازه... فقط چند کیلومتر مانده.';
    const tw = ctx.measureText(txt).width + 34;
    ctx.fillStyle = 'rgba(0,0,0,0.66)';
    rr(W / 2 - tw / 2, H - 64, tw, 28, 14); ctx.fill();
    ctx.fillStyle = '#f3e9cf';
    ctx.fillText(txt, W / 2, H - 50);
  }
  /* محو به سفیدیِ سحر */
  const a = clamp((VC.t - 4.0) / 0.7, 0, 1);
  if (a > 0) {
    ctx.fillStyle = 'rgba(255,250,240,' + a.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}

/* ارشان: کاپشن سبز + کلاه قرمز + رادیو با نور و موج */
function drawArshanWithRadio(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 11, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -13); ctx.lineTo(-5, -1);
  ctx.moveTo(4, -13); ctx.lineTo(5, -1);
  ctx.stroke();
  ctx.fillStyle = '#4a7a4a'; rr(-9, -28, 18, 16, 5); ctx.fill();      // کاپشن سبز
  ctx.fillStyle = '#f0c49a'; circle(2, -33, 6.4);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(2, -33, 6.6, Math.PI, Math.PI * 2); ctx.fill();   // کلاه قرمز
  ctx.fillRect(-5, -34, 14, 3);
  ctx.fillStyle = '#1d2433'; circle(4.6, -34, 1.1); circle(0.8, -34, 1.1);
  /* رادیو در دست + نورش */
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(5, -25); ctx.lineTo(15, -30); ctx.stroke();
  ctx.fillStyle = '#3a2c1a';
  rr(12, -38, 16, 12, 3); ctx.fill();
  const gl = ctx.createRadialGradient(20, -32, 2, 20, -32, 26);
  gl.addColorStop(0, 'rgba(255,210,130,0.35)');
  gl.addColorStop(1, 'rgba(255,210,130,0)');
  ctx.fillStyle = gl; circle(20, -32, 26);
  ctx.strokeStyle = 'rgba(140,190,255,0.4)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(20, -32, 12 + (animTime * 26 % 18), -0.9, 0.5); ctx.stroke();
  ctx.restore();
}
