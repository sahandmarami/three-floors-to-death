/* ==================================================================
   سه طبقه تا مرگ — نسخهٔ ۳۰٫۰ — فصل میانی: سفر (پلتفرمر کنترا-سبک)
   ==================================================================
   طبق پرامپت (بخش ۲ «فصل میانی» + بخش ۴-۲):
     · آرش پیاده، با تفنگ، در حال دویدن و پریدن بین خرابه‌ها و شلیک
     · ۳ مرحله: خرابه‌های شهر / پل شکسته / راه شمالی — هر کدام حس
       متفاوت: پستی‌وبلندی، سکوها، سنگ‌ها و موانع، چاله‌ها
     · چک‌پوینت وسط هر مرحله — مرگ = ادامه از همان‌جا
     · دی‌پد مجازی (◀ ▶) + دکمهٔ پرش + دکمهٔ شلیک (بخش ۴-۲)
     · مهمات بی‌نهایت («بیاید! مهماتم تموم نمی‌شه!»)
   حالت: state.mode === 'plat' — dispatch در v3_part3/part4.
   ================================================================== */

/* ---------------------- ۳۰-پ-۱) داده‌ی مراحل ---------------------- */
/* زمین‌ها: {x,y,w,h} — y = بالای سطح. سکوها: kind:'plat' (پرش از پایین آزاد؟
   نه — سکو از بالا قابل فرود است و از پایین برخورد می‌کند = یکطرفه) */
function platBuildLevels() {
  const G = GROUND_Y;
  const L = [];

  /* ---- مرحلهٔ ۱: خرابه‌های شهر — خیابان ویران + ماشین‌ها + سکوهای بتنی ---- */
  {
    const solids = [], props = [], zs = [];
    // زمین پلکانی (پستی‌وبلندی ملایم)
    const segs = [
      [0, 0, 520], [520, -26, 300], [820, 0, 420], [1240, -40, 360],
      [1600, 0, 500], [2100, -22, 340], [2440, 0, 560],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    // سکوهای بتنیِ شکسته
    solids.push({ x: 620, y: G - 118, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 980, y: G - 96, w: 190, h: 16, kind: 'plat' });
    solids.push({ x: 1360, y: G - 150, w: 170, h: 16, kind: 'plat' });
    solids.push({ x: 1740, y: G - 104, w: 210, h: 16, kind: 'plat' });
    solids.push({ x: 2160, y: G - 128, w: 180, h: 16, kind: 'plat' });
    // ماشین‌های رهاشده (موانع پرشی)
    props.push({ x: 430, kind: 'car', v: 0 }, { x: 1120, kind: 'car', v: 1 }, { x: 1980, kind: 'car', v: 2 }, { x: 2620, kind: 'car', v: 0 });
    // سنگ/آوار
    props.push({ x: 700, kind: 'rock' }, { x: 1520, kind: 'rock' }, { x: 2340, kind: 'rock' });
    // زامبی‌ها
    const spawn = [360, 560, 640, 760, 900, 1050, 1150, 1300, 1480, 1560, 1700, 1900, 2050, 2200, 2350, 2500, 2650];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 7 === 6 ? 'f' : 'n' }));
    L.push({
      name: 'خرابه‌های شهر', sub: 'مرحلهٔ ۱ از ۳',
      len: 3000, cp: 1500, exitX: 2880, solids, props, zs,
      sky: [['#2a1f2e', '#8a5f4a'], ['#3a2836', '#a8765a'], ['#4a3040', '#c99770']],
      sun: { x: 0.78, y: 150, r: 54, c: 'rgba(255,196,120,' },
    });
  }

  /* ---- مرحلهٔ ۲: پل شکسته — چاله‌ها + عرشه‌های مرتفع ---- */
  {
    const solids = [], props = [], zs = [];
    const segs = [
      [0, 0, 430], [430, -30, 260],           // چالهٔ ۶۹۰..۷۶۰
      [760, 0, 240], [1000, -50, 300],        // چاله
      [1300, -30, 260], [1560, 0, 340],       // چالهٔ ۱۵۶۰
      [1900, -46, 420], [2320, 0, 680],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    // سکوهای نجات روی چاله‌ها
    solids.push({ x: 700, y: G - 110, w: 120, h: 14, kind: 'plat' });
    solids.push({ x: 950, y: G - 140, w: 130, h: 14, kind: 'plat' });
    solids.push({ x: 1260, y: G - 120, w: 110, h: 14, kind: 'plat' });
    solids.push({ x: 1530, y: G - 150, w: 120, h: 14, kind: 'plat' });
    solids.push({ x: 1800, y: G - 130, w: 140, h: 14, kind: 'plat' });
    solids.push({ x: 2100, y: G - 170, w: 150, h: 14, kind: 'plat' });
    // نرده‌های پل + ستون‌ها
    props.push({ x: 460, kind: 'rail' }, { x: 1020, kind: 'rail' }, { x: 1580, kind: 'rail' }, { x: 2350, kind: 'rail' });
    props.push({ x: 820, kind: 'rock' }, { x: 1700, kind: 'rock' }, { x: 2560, kind: 'rock' });
    const spawn = [220, 340, 480, 560, 830, 900, 1040, 1120, 1350, 1430, 1620, 1700, 1950, 2050, 2150, 2400, 2520, 2660];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 5 === 4 ? 'f' : 'n' }));
    L.push({
      name: 'پل شکسته', sub: 'مرحلهٔ ۲ از ۳',
      len: 3000, cp: 1480, exitX: 2890, solids, props, zs,
      sky: [['#1c2233', '#5a6a88'], ['#28324a', '#7890ac'], ['#36445e', '#98b4cc']],
      sun: { x: 0.16, y: 130, r: 40, c: 'rgba(200,220,255,' },
    });
  }

  /* ---- مرحلهٔ ۳: راه شمالی — تپه‌ها + سنگ‌ها + تانک‌ها + ایستگاه ---- */
  {
    const solids = [], props = [], zs = [];
    const segs = [
      [0, 0, 380], [380, -52, 300], [680, -104, 320], [1000, -52, 280],
      [1280, 0, 340], [1620, -40, 300], [1920, -88, 340], [2260, -40, 300],
      [2560, 0, 640],
    ];
    for (const [x, dy, w] of segs) solids.push({ x, y: G + dy, w, h: H - (G + dy), kind: 'ground' });
    solids.push({ x: 470, y: G - 160, w: 140, h: 16, kind: 'plat' });
    solids.push({ x: 800, y: G - 205, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 1130, y: G - 150, w: 160, h: 16, kind: 'plat' });
    solids.push({ x: 1700, y: G - 150, w: 150, h: 16, kind: 'plat' });
    solids.push({ x: 2050, y: G - 190, w: 170, h: 16, kind: 'plat' });
    // طاق ویران + سنگ‌ها + تابلوی راه
    props.push({ x: 300, kind: 'arch' }, { x: 1420, kind: 'arch' }, { x: 2450, kind: 'arch' });
    props.push({ x: 560, kind: 'rock' }, { x: 900, kind: 'rock' }, { x: 1560, kind: 'rock' }, { x: 2160, kind: 'rock' });
    props.push({ x: 2700, kind: 'sign' });
    const spawn = [260, 400, 500, 740, 860, 1000, 1120, 1350, 1500, 1660, 1800, 1980, 2100, 2280, 2400, 2600, 2740];
    spawn.forEach((x, i) => zs.push({ x, ty: i % 6 === 5 ? 't' : (i % 3 === 2 ? 'f' : 'n') }));
    L.push({
      name: 'راه شمالی', sub: 'مرحلهٔ ۳ از ۳',
      len: 3200, cp: 1560, exitX: 3060, solids, props, zs,
      sky: [['#241a2c', '#7a4a3a'], ['#332436', '#9a6248'], ['#45303f', '#c08a60']],
      sun: { x: 0.85, y: 140, r: 46, c: 'rgba(255,180,110,' },
    });
  }
  return L;
}

/* ---------------------- ۳۰-پ-۲) وضعیت ---------------------- */
const PLAT30 = {
  active: false, level: 1, t: 0, LVL: null, all: null,
  cam: 0, pl: null, zs: [], bullets: [], cpOn: false, exitDone: false,
  bark: {}, card: null, cardT: 0, keys: { l: false, r: false }, fireHeld: false,
  jumpQueued: false, shake: 0, deadT: 0, dying: false,
};

function startPlatformer(level) {
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  PLAT30.all = PLAT30.all || platBuildLevels();
  PLAT30.level = clamp(level, 1, 3);
  PLAT30.LVL = PLAT30.all[PLAT30.level - 1];
  PLAT30.t = 0;
  PLAT30.cam = 0;
  PLAT30.pl = {
    x: 60, y: GROUND_Y, vx: 0, vy: 0, onG: true, face: 1,
    hp: 3, inv: 0, cd: 0, walk: 0, muzzle: 0, deadT: 0,
  };
  PLAT30.zs = PLAT30.LVL.zs.map(z => ({
    x: z.x, y: GROUND_Y, vx: 0, vy: 0, ty: z.ty, hp: z.ty === 't' ? 6 : z.ty === 'f' ? 2 : 3,
    walk: Math.random() * 6.28, dead: false, deadT: 0, w: z.ty === 't' ? 30 : 20, h: z.ty === 't' ? 46 : 40,
    spd: z.ty === 't' ? 26 : z.ty === 'f' ? 96 : 52,
  }));
  PLAT30.bullets = [];
  PLAT30.cpOn = false;
  PLAT30.exitDone = false;
  PLAT30.bark = {};
  PLAT30.card = 'intro';
  PLAT30.cardT = 0;
  PLAT30.shake = 0; PLAT30.dying = false; PLAT30.deadT = 0;
  state.mode = 'plat';
  state.mouse.down = false;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce(); hideChapterCard();
  try { $('wrap').classList.add('cine-mode'); } catch (e) {}
  try { $('lockBadge').classList.add('hidden'); } catch (e) {}
  try { $('bossBar').style.display = 'none'; bossBarVisible = false; } catch (e) {}
  try { setBuildPanel(true, true); } catch (e) {}
  platPadShow(true);
  try { MUSIC.set('menu'); } catch (e) {}
}

function stopPlatformer() {
  PLAT30.active = false;
  platPadShow(false);
  try { $('wrap').classList.remove('cine-mode'); } catch (e) {}
}

/* ---------------------- ۳۰-پ-۳) کنترل لمسی + کیبورد ---------------------- */
let _platPadMade = false;
function platPadMake() {
  if (_platPadMade) return;
  _platPadMade = true;
  const wrap = $('wrap');
  const pad = document.createElement('div');
  pad.id = 'platPad';
  pad.style.cssText = 'position:absolute;inset:0;z-index:26;pointer-events:none;display:none;';
  const btn = (id, label, css) => {
    const b = document.createElement('div');
    b.id = id;
    b.style.cssText = css;
    b.innerHTML = label;
    pad.appendChild(b);
    return b;
  };
  const u = 'calc(var(--uiz,1) * ';
  // دی‌پد چپ
  btn('platBL', '◀', `${u}68px);height:${u}68px);left:${u}18px);bottom:${u}20px);` +
    'position:absolute;border-radius:18px;background:rgba(18,24,40,.72);border:2px solid rgba(120,150,220,.55);' +
    'display:flex;align-items:center;justify-content:center;color:#cfe0ff;font-size:' + u + '26px);' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  btn('platBR', '▶', `${u}68px);height:${u}68px);left:${u}104px);bottom:${u}20px);` +
    'position:absolute;border-radius:18px;background:rgba(18,24,40,.72);border:2px solid rgba(120,150,220,.55);' +
    'display:flex;align-items:center;justify-content:center;color:#cfe0ff;font-size:' + u + '26px);' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  // پرش و شلیک راست
  btn('platBJ', 'پرش', `${u}76px);height:${u}76px);right:${u}18px);bottom:${u}20px);` +
    'position:absolute;border-radius:50%;background:rgba(46,58,30,.78);border:2px solid rgba(190,220,120,.6);' +
    'display:flex;align-items:center;justify-content:center;color:#eaf6c8;font-size:' + u + '17px);font-weight:900;' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  btn('platBS', 'شلیک', `${u}66px);height:${u}66px);right:${u}112px);bottom:${u}30px);` +
    'position:absolute;border-radius:50%;background:rgba(84,34,30,.78);border:2px solid rgba(255,150,130,.6);' +
    'display:flex;align-items:center;justify-content:center;color:#ffd9c8;font-size:' + u + '15px);font-weight:900;' +
    'pointer-events:auto;touch-action:none;user-select:none;box-shadow:0 4px 14px rgba(0,0,0,.4);');
  wrap.appendChild(pad);

  const bind = (el, key, isJump, isFire) => {
    const set = (v, e) => {
      e.preventDefault();
      if (isJump && v) PLAT30.jumpQueued = true;
      else if (isFire) PLAT30.fireHeld = v;
      else PLAT30.keys[key] = v;
      el.style.filter = v ? 'brightness(1.55)' : 'none';
    };
    el.addEventListener('touchstart', e => set(true, e), { passive: false });
    el.addEventListener('touchend', e => set(false, e), { passive: false });
    el.addEventListener('touchcancel', e => set(false, e), { passive: false });
    el.addEventListener('pointerdown', e => set(true, e));
    el.addEventListener('pointerup', e => set(false, e));
    el.addEventListener('pointerleave', e => set(false, e));
    el.addEventListener('contextmenu', e => e.preventDefault());
  };
  bind($('platBL'), 'l', false, false);
  bind($('platBR'), 'r', false, false);
  bind($('platBJ'), 'j', true, false);
  bind($('platBS'), 's', false, true);

  // کیبورد
  window.addEventListener('keydown', e => {
    if (state.mode !== 'plat') return;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) PLAT30.keys.l = true;
    if (['ArrowRight', 'KeyD'].includes(e.code)) PLAT30.keys.r = true;
    if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { PLAT30.jumpQueued = true; e.preventDefault(); }
    if (['KeyJ', 'KeyX', 'Enter'].includes(e.code)) PLAT30.fireHeld = true;
  });
  window.addEventListener('keyup', e => {
    if (state.mode !== 'plat') return;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) PLAT30.keys.l = false;
    if (['ArrowRight', 'KeyD'].includes(e.code)) PLAT30.keys.r = false;
    if (['KeyJ', 'KeyX', 'Enter'].includes(e.code)) PLAT30.fireHeld = false;
  });
}

function platPadShow(v) {
  platPadMake();
  const p = $('platPad');
  if (p) p.style.display = v ? 'block' : 'none';
}

/* ---------------------- ۳۰-پ-۴) فیزیک ---------------------- */
const PLAT_GRAV = 2000, PLAT_SPD = 250, PLAT_JUMP = 640, PLAT_BSPD = 840;

function platSolidAt(x, y0, y1) {
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w && y1 >= s.y && y0 <= s.y + s.h) return s;
  }
  return null;
}

function platMovePlayer(dt) {
  const p = PLAT30.pl, LV = PLAT30.LVL;
  const dir = (PLAT30.keys.r ? 1 : 0) - (PLAT30.keys.l ? 1 : 0);
  p.vx = dir * PLAT_SPD;
  if (dir !== 0) { p.face = dir; p.walk += dt * 9; } else p.walk = 0;
  if (PLAT30.jumpQueued && p.onG) {
    p.vy = -PLAT_JUMP; p.onG = false;
    try { SFX.click(); } catch (e) {}
  }
  PLAT30.jumpQueued = false;
  p.vy += PLAT_GRAV * dt;
  if (p.vy > 1300) p.vy = 1300;

  /* عمودی */
  let ny = p.y + p.vy * dt;
  let ground = null;
  for (const s of LV.solids) {
    if (p.x + 8 > s.x && p.x - 8 < s.x + s.w) {
      const wasAbove = p.y <= s.y + 2;
      if (wasAbove && ny >= s.y && p.vy >= 0) { ground = s; ny = s.y; break; }
    }
  }
  if (ground) { p.vy = 0; p.onG = true; }
  else p.onG = false;
  p.y = ny;

  /* افقی */
  let nx = p.x + p.vx * dt;
  for (const s of LV.solids) {
    if (s.kind !== 'ground') continue;
    if (p.y > s.y + 4 && p.y - 42 < s.y + s.h) {         // هم‌ارتفاع با بدنه
      if (nx + 8 > s.x && p.x + 8 <= s.x && p.vx > 0) nx = s.x - 8;
      if (nx - 8 < s.x + s.w && p.x - 8 >= s.x + s.w && p.vx < 0) nx = s.x + s.w + 8;
    }
  }
  p.x = clamp(nx, 20, LV.len - 20);

  /* سقوط در چاله */
  if (p.y > H + 80) platHurt(1, true);
}

function platHurt(dmg, pit) {
  const p = PLAT30.pl;
  if (p.inv > 0 || PLAT30.dying) return;
  p.hp -= dmg;
  p.inv = 1.25;
  PLAT30.shake = 7;
  try { SFX.towerHit(); } catch (e) {}
  spawnParticles(p.x, p.y - 24, 8, 'rgba(200,60,50,0.8)', { speed: 90, life: 0.6, size: 2.6, grav: 400 });
  if (p.hp <= 0) {
    PLAT30.dying = true; PLAT30.deadT = 0;
  } else if (pit) {
    p.x = PLAT30.cpOn ? PLAT30.LVL.cp : 60;
    p.y = GROUND_Y - 200; p.vy = 0; p.vx = 0;
  }
}

function platRespawn() {
  const p = PLAT30.pl;
  p.hp = 3;
  p.inv = 2;
  p.x = PLAT30.cpOn ? PLAT30.LVL.cp : 60;
  p.y = GROUND_Y - 60; p.vy = 0;
  PLAT30.dying = false;
  /* زامبی‌های خیلی نزدیک به چک‌پوینت دور می‌شوند */
  for (const z of PLAT30.zs) {
    if (!z.dead && Math.abs(z.x - p.x) < 300) z.x = p.x + (z.x > p.x ? 340 : -260);
  }
}

function platShoot() {
  const p = PLAT30.pl;
  if (p.cd > 0) return;
  p.cd = 0.24;
  p.muzzle = 0.09;
  PLAT30.bullets.push({ x: p.x + p.face * 22, y: p.y - 27, vx: p.face * PLAT_BSPD, life: 1.1 });
  try { SFX.sniperShot(); } catch (e) {}
  spawnParticles(p.x + p.face * 26, p.y - 27, 3, 'rgba(255,220,140,0.9)', { speed: 60, life: 0.22, size: 2, grav: 0 });
}

/* ---------------------- ۳۰-پ-۵) به‌روزرسانی ---------------------- */
function updatePlatformer(dt) {
  if (state.mode !== 'plat') return;
  PLAT30.t += dt;
  try { MUSIC.update(); } catch (e) {}
  try { PERF.update(dt); } catch (e) {}
  updateParticles(dt);
  updateTexts(dt);
  PLAT30.shake = Math.max(0, PLAT30.shake - dt * 16);
  const p = PLAT30.pl, LV = PLAT30.LVL;

  /* کارت شروع/پایان مرحله */
  if (PLAT30.card) {
    PLAT30.cardT += dt;
    const dur = PLAT30.card === 'intro' ? 2.2 : 1.8;
    if (PLAT30.cardT >= dur) {
      const kind = PLAT30.card;
      PLAT30.card = null; PLAT30.cardT = 0;
      if (kind === 'done') {
        /* مرحلهٔ بعد یا ایستگاه */
        stopPlatformer();
        if (PLAT30.level >= 3) { startStationCine30(); return; }
        startPlatformer(PLAT30.level + 1);
        return;
      }
    }
    if (kind === 'intro' && PLAT30.cardT < dur) return;   // در کارت شروع، بازی می‌ایستد
  }

  /* مرگ و ری‌اسپاون */
  if (PLAT30.dying) {
    PLAT30.deadT += dt;
    if (PLAT30.deadT > 1.4) platRespawn();
    return;
  }

  platMovePlayer(dt);
  if (PLAT30.fireHeld) platShoot();
  p.cd = Math.max(0, p.cd - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.muzzle = Math.max(0, p.muzzle - dt);

  /* چک‌پوینت */
  if (!PLAT30.cpOn && p.x >= LV.cp) {
    PLAT30.cpOn = true;
    try { bark('cpOn30', null, '', '🚩 ایستگاه سیو فعال شد', 'اگه بمیری از همین‌جا ادامه می‌دی', 2.2); } catch (e) {}
    try { SFX.buy(); } catch (e) {}
  }

  /* زامبی‌ها */
  for (const z of PLAT30.zs) {
    if (z.dead) { z.deadT += dt; continue; }
    const dx = p.x - z.x;
    if (Math.abs(dx) < 620) {
      z.vx = Math.sign(dx) * z.spd;
      z.walk += dt * (z.ty === 'f' ? 11 : z.ty === 't' ? 3.5 : 6.5);
      z.vy += PLAT_GRAV * dt;
      let ny = z.y + z.vy * dt, ground = null;
      for (const s of LV.solids) {
        if (z.x + z.w / 2 > s.x && z.x - z.w / 2 < s.x + s.w) {
          if (z.y <= s.y + 2 && ny >= s.y && z.vy >= 0) { ground = s; ny = s.y; break; }
        }
      }
      if (!ground) {
        /* (۳۰٫۰) فرو رفته در زمین/سکوی بالاتر؟ به سطح بیرون بیا */
        for (const s of LV.solids) {
          if (z.x + z.w / 2 > s.x && z.x - z.w / 2 < s.x + s.w && z.y > s.y && z.y - z.h < s.y + s.h) {
            ground = s; ny = s.y; z.vy = 0; break;
          }
        }
      }
      if (ground) { z.vy = 0; }
      z.y = ny;
      /* زمین را رد نکند */
      if (z.y > H + 60) { z.y = GROUND_Y; z.vy = 0; z.x -= Math.sign(dx) * 200; }
      /* برخورد با بازیکن */
      if (Math.abs(z.x - p.x) < z.w / 2 + 9 && Math.abs((z.y - z.h / 2) - (p.y - 24)) < 34) {
        platHurt(1, false);
        p.vx = 0; p.x -= Math.sign(z.x - p.x) * 3;
      }
    }
  }

  /* گلوله‌ها */
  for (let i = PLAT30.bullets.length - 1; i >= 0; i--) {
    const b = PLAT30.bullets[i];
    b.x += b.vx * dt; b.life -= dt;
    let hit = false;
    for (const z of PLAT30.zs) {
      if (z.dead) continue;
      if (b.x > z.x - z.w / 2 && b.x < z.x + z.w / 2 && b.y > z.y - z.h - 8 && b.y < z.y + 6) {
        z.hp--;
        hit = true;
        spawnParticles(b.x, b.y, 4, 'rgba(180,40,40,0.85)', { speed: 70, life: 0.4, size: 2.2, grav: 500 });
        if (z.hp <= 0) {
          z.dead = true; z.deadT = 0;
          spawnParticles(z.x, z.y - z.h / 2, 12, 'rgba(150,30,30,0.8)', { speed: 110, life: 0.7, size: 3, grav: 600 });
          try { SFX.hit(); } catch (e) {}
        }
        break;
      }
    }
    if (hit || b.life <= 0 || b.x < PLAT30.cam - 40 || b.x > PLAT30.cam + W + 40) PLAT30.bullets.splice(i, 1);
  }

  /* دوربین */
  PLAT30.cam = clamp(p.x - W * 0.36, 0, LV.len - W);

  /* بارک‌ها */
  const prog = p.x / LV.exitX;
  if (!PLAT30.bark.p1 && prog > 0.33) {
    PLAT30.bark.p1 = true;
    try { bark('pb1p', 'p', 'فقط یه کم دیگه...', '🥾 [آرش]:', 'فقط یه کم دیگه...', 2); } catch (e) {}
  }
  if (!PLAT30.bark.p2 && PLAT30.zs.filter(z => !z.dead && Math.abs(z.x - p.x) < 300).length >= 3) {
    PLAT30.bark.p2 = true;
    try { bark('pb2p', 'p', 'بیاید! مهماتم تموم نمی‌شه!', '🔫 [آرش]:', 'بیاید! مهماتم تموم نمی‌شه!', 2.4); } catch (e) {}
  }
  if (!PLAT30.bark.p3 && PLAT30.level === 3 && prog > 0.8) {
    PLAT30.bark.p3 = true;
    try { bark('pb3p', 'p', 'ایستگاه... اونجاست.', '📡 [آرش]:', 'ایستگاه... اونجاست.', 2.4); } catch (e) {}
  }

  /* رسیدن به خروجی */
  if (!PLAT30.exitDone && p.x >= LV.exitX) {
    PLAT30.exitDone = true;
    PLAT30.card = 'done'; PLAT30.cardT = 0;
    try { SFX.slowmo(); } catch (e) {}
    spawnParticles(p.x, p.y - 30, 26, 'rgba(255,220,130,0.9)', { speed: 130, life: 1.2, size: 2.8, grav: 300 });
  }
}

/* ---------------------- ۳۰-پ-۶) رندر ---------------------- */
function renderPlatformer() {
  if (state.mode !== 'plat' || !PLAT30.LVL) return;
  const LV = PLAT30.LVL, p = PLAT30.pl, t = PLAT30.t;
  ctx.save();
  if (PLAT30.shake > 0.5) ctx.translate((Math.random() - 0.5) * PLAT30.shake, (Math.random() - 0.5) * PLAT30.shake);

  /* --- آسمان (غروبِ گرفته — پرامپت ۶-۱۳) --- */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, LV.sky[0][0]);
  sky.addColorStop(0.6, LV.sky[1][0]);
  sky.addColorStop(1, LV.sky[2][0]);
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, W + 40, GROUND_Y + 40);
  /* خورشیدِ گرفته + غبار نور */
  const sx = W * LV.sun.x, sy = LV.sun.y;
  const sg = ctx.createRadialGradient(sx, sy, 6, sx, sy, LV.sun.r * 3.2);
  sg.addColorStop(0, LV.sun.c + '0.5)');
  sg.addColorStop(0.4, LV.sun.c + '0.16)');
  sg.addColorStop(1, LV.sun.c + '0)');
  ctx.fillStyle = sg; circle(sx, sy, LV.sun.r * 3.2);
  ctx.fillStyle = LV.sun.c + '0.85)'; circle(sx, sy, LV.sun.r);
  /* پرتوهای غروب */
  ctx.fillStyle = 'rgba(255,200,140,0.05)';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - 520, GROUND_Y); ctx.lineTo(sx + 300, GROUND_Y);
  ctx.closePath(); ctx.fill();

  /* --- افقِ خرابه‌ها (پارالاکس دور) --- */
  let s2 = 91;
  const rd = () => { s2 = (s2 * 1103515245 + 12345) & 0x7fffffff; return s2 / 0x7fffffff; };
  const ruinsLayer = (par, base, hMin, hMax, col) => {
    ctx.fillStyle = col;
    const off = -PLAT30.cam * par;
    const step = 130;
    const i0 = Math.floor((-off) / step) - 1;
    for (let i = i0; i < i0 + Math.ceil(W / step) + 3; i++) {
      const bx = i * step + off;
      const bh = hMin + rd() * hMax;
      const bw = 60 + rd() * 58;
      ctx.fillRect(bx, base - bh, bw, bh);
      /* لبهٔ شکسته */
      ctx.beginPath();
      ctx.moveTo(bx, base - bh);
      ctx.lineTo(bx + bw * 0.3, base - bh - 10 - rd() * 16);
      ctx.lineTo(bx + bw * 0.65, base - bh - 4);
      ctx.lineTo(bx + bw, base - bh - 14 - rd() * 10);
      ctx.lineTo(bx + bw, base - bh + 2);
      ctx.lineTo(bx, base - bh + 2);
      ctx.closePath(); ctx.fill();
      /* چند پنجره */
      if (rd() < 0.5) {
        ctx.fillStyle = 'rgba(30,24,36,0.7)';
        ctx.fillRect(bx + 14 + rd() * 20, base - bh + 16, 5, 7);
        ctx.fillRect(bx + 40 + rd() * 14, base - bh + 30, 5, 7);
        ctx.fillStyle = col;
      }
    }
  };
  ruinsLayer(0.25, GROUND_Y + 6, 120, 190, 'rgba(38,30,44,0.55)');
  ruinsLayer(0.55, GROUND_Y + 10, 60, 120, 'rgba(28,22,34,0.8)');

  /* --- دنیا (با دوربین) --- */
  ctx.save();
  ctx.translate(-Math.round(PLAT30.cam), 0);

  /* زمین و سکوها */
  for (const s of LV.solids) {
    const g1 = ctx.createLinearGradient(0, s.y, 0, s.y + (s.kind === 'plat' ? s.h : 70));
    if (s.kind === 'plat') { g1.addColorStop(0, '#6a6258'); g1.addColorStop(1, '#4a443c'); }
    else { g1.addColorStop(0, '#54493e'); g1.addColorStop(1, '#2e2820'); }
    ctx.fillStyle = g1;
    ctx.fillRect(s.x, s.y, s.w, s.kind === 'plat' ? s.h : H - s.y + 20);
    /* لبهٔ روشنِ بالا + ترک */
    ctx.fillStyle = 'rgba(255,205,150,0.28)';
    ctx.fillRect(s.x, s.y, s.w, 3);
    ctx.fillStyle = 'rgba(20,16,12,0.5)';
    for (let tx = s.x + 24; tx < s.x + s.w - 10; tx += 90) {
      ctx.fillRect(tx, s.y + 4, 2, 10 + ((tx * 7) % 14));
    }
    /* میلگرد از لبه‌ها */
    if (s.kind === 'plat') {
      ctx.strokeStyle = 'rgba(120,90,60,0.8)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x + 3, s.y + 4); ctx.lineTo(s.x - 6, s.y + 16);
      ctx.moveTo(s.x + s.w - 3, s.y + 4); ctx.lineTo(s.x + s.w + 7, s.y + 18);
      ctx.stroke();
    }
  }

  /* پیش‌سازی‌ها (ماشین/سنگ/نرده/طاق/تابلو) */
  for (const pr of LV.props) drawPlatProp(pr);

  /* چک‌پوینت */
  drawPlatCheckpoint(LV.cp, PLAT30.cpOn, t);

  /* خروجی پایان مرحله */
  drawPlatExit(LV.exitX, PLAT30.level, t);

  /* زامبی‌ها */
  for (const z of PLAT30.zs) drawPlatZombie(z, t);

  /* گلوله‌ها */
  ctx.fillStyle = '#ffe9a8';
  for (const b of PLAT30.bullets) {
    ctx.fillRect(b.x - 7, b.y - 1.6, 14, 3.2);
    ctx.fillStyle = 'rgba(255,180,80,0.5)';
    ctx.fillRect(b.x - 13, b.y - 1, 6, 2);
    ctx.fillStyle = '#ffe9a8';
  }

  /* بازیکن — آرش */
  drawPlatPlayer(p, t);

  /* ذرات */
  drawParticles();

  ctx.restore();   // دوربین

  /* --- HUD --- */
  drawPlatHUD();

  /* --- کارت شروع/پایان --- */
  if (PLAT30.card) drawPlatCard();

  /* مرگ */
  if (PLAT30.dying) {
    ctx.fillStyle = `rgba(20,4,4,${clamp(PLAT30.deadT / 1.1, 0, 0.72)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function drawPlatProp(pr) {
  const G = GROUND_Y;
  /* زمین زیر پیش‌سازی: نزدیک‌ترین سطح */
  let gy = G;
  for (const s of PLAT30.LVL.solids) {
    if (pr.x >= s.x - 40 && pr.x <= s.x + s.w + 40 && s.y < gy) { if (pr.x >= s.x && pr.x <= s.x + s.w) gy = s.y; }
  }
  ctx.save();
  if (pr.kind === 'car') {
    const cols = ['#4a3a52', '#3a4a5a', '#5a4a3a'];
    const c = cols[pr.v || 0];
    ctx.fillStyle = c;
    rr(pr.x - 34, gy - 30, 68, 16, 5); ctx.fill();          // بدنه
    rr(pr.x - 16, gy - 44, 34, 15, 5); ctx.fill();          // کابین
    ctx.fillStyle = 'rgba(180,220,240,0.35)';
    ctx.fillRect(pr.x - 12, gy - 41, 26, 9);                // شیشه
    ctx.fillStyle = '#1a1a20';
    circle2r(pr.x - 20, gy - 12, 8); circle2r(pr.x + 20, gy - 12, 8);
    ctx.fillStyle = 'rgba(255,190,120,0.25)';
    circle(pr.x + 32, gy - 22, 2);
  } else if (pr.kind === 'rock') {
    ctx.fillStyle = '#4c453e';
    ctx.beginPath();
    ctx.moveTo(pr.x - 22, gy);
    ctx.lineTo(pr.x - 12, gy - 20);
    ctx.lineTo(pr.x + 4, gy - 26);
    ctx.lineTo(pr.x + 20, gy - 12);
    ctx.lineTo(pr.x + 24, gy);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,210,160,0.22)';
    ctx.beginPath();
    ctx.moveTo(pr.x - 12, gy - 20); ctx.lineTo(pr.x + 4, gy - 26); ctx.lineTo(pr.x + 2, gy - 18);
    ctx.closePath(); ctx.fill();
  } else if (pr.kind === 'rail') {
    ctx.strokeStyle = '#5a5148'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pr.x - 60, gy - 34); ctx.lineTo(pr.x + 60, gy - 34);
    ctx.moveTo(pr.x - 52, gy - 34); ctx.lineTo(pr.x - 52, gy);
    ctx.moveTo(pr.x + 52, gy - 34); ctx.lineTo(pr.x + 52, gy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,205,150,0.25)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pr.x - 60, gy - 34); ctx.lineTo(pr.x + 60, gy - 34); ctx.stroke();
  } else if (pr.kind === 'arch') {
    ctx.fillStyle = '#463e36';
    ctx.fillRect(pr.x - 46, gy - 88, 16, 88);
    ctx.fillRect(pr.x + 30, gy - 88, 16, 88);
    ctx.beginPath();
    ctx.moveTo(pr.x - 46, gy - 88);
    ctx.quadraticCurveTo(pr.x, gy - 126, pr.x + 46, gy - 88);
    ctx.lineTo(pr.x + 46, gy - 76);
    ctx.quadraticCurveTo(pr.x, gy - 110, pr.x - 46, gy - 76);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(20,14,10,0.5)';
    ctx.fillRect(pr.x - 6, gy - 30, 4, 30);
  } else if (pr.kind === 'sign') {
    ctx.strokeStyle = '#5a5148'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(pr.x, gy); ctx.lineTo(pr.x, gy - 64); ctx.stroke();
    ctx.fillStyle = '#3a5a6a';
    rr(pr.x - 30, gy - 84, 60, 24, 3); ctx.fill();
    ctx.fillStyle = 'rgba(230,240,250,0.85)';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شمال ↑', pr.x, gy - 68);
  }
  ctx.restore();
}
function circle2r(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function drawPlatCheckpoint(x, on, t) {
  let gy = GROUND_Y;
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w) { gy = Math.min(gy, s.y); break; }
  }
  ctx.save();
  /* میله */
  ctx.strokeStyle = '#6a6055'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 62); ctx.stroke();
  /* فانوس */
  const glow = on ? 0.65 + 0.35 * Math.sin(t * 5) : 0.18;
  const g = ctx.createRadialGradient(x, gy - 46, 2, x, gy - 46, 42);
  g.addColorStop(0, `rgba(255,196,110,${glow})`);
  g.addColorStop(1, 'rgba(255,196,110,0)');
  ctx.fillStyle = g; circle(x, gy - 46, 42);
  ctx.fillStyle = on ? '#ffca6e' : '#7a6a4e';
  rr(x - 5, gy - 52, 10, 13, 2); ctx.fill();
  /* پرچم */
  ctx.fillStyle = on ? '#d8453a' : '#7a5a52';
  ctx.beginPath();
  ctx.moveTo(x + 2, gy - 60);
  ctx.lineTo(x + 26 + Math.sin(t * 4) * 3, gy - 54);
  ctx.lineTo(x + 2, gy - 46);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawPlatExit(x, level, t) {
  let gy = GROUND_Y;
  for (const s of PLAT30.LVL.solids) {
    if (x >= s.x && x <= s.x + s.w) { gy = Math.min(gy, s.y); break; }
  }
  ctx.save();
  if (level === 3) {
    /* ایستگاه شمالی — سیلوئت ساختمان علمی */
    ctx.fillStyle = '#3a3630';
    ctx.fillRect(x - 90, gy - 110, 180, 110);
    ctx.fillStyle = '#2c2a26';
    ctx.fillRect(x - 104, gy - 92, 22, 92);
    ctx.fillRect(x + 82, gy - 92, 22, 92);
    /* آنتن + چراغ چشمک‌زن */
    ctx.strokeStyle = '#5a544c'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x + 40, gy - 110); ctx.lineTo(x + 40, gy - 168); ctx.stroke();
    const bl = Math.sin(t * 3.4) > 0.25 ? 0.95 : 0.2;
    ctx.fillStyle = `rgba(255,70,60,${bl})`;
    circle(x + 40, gy - 170, 3);
    /* نور سرد آزمایشگاهی از در */
    const dg = ctx.createLinearGradient(x - 20, gy - 52, x + 20, gy);
    dg.addColorStop(0, 'rgba(180,220,255,0.5)');
    dg.addColorStop(1, 'rgba(180,220,255,0.05)');
    ctx.fillStyle = dg;
    ctx.fillRect(x - 20, gy - 52, 40, 52);
    ctx.fillStyle = 'rgba(180,220,255,0.75)';
    ctx.fillRect(x - 20, gy - 52, 40, 3);
  } else {
    /* دروازهٔ مرحله */
    ctx.fillStyle = 'rgba(30,26,22,0.9)';
    rr(x - 34, gy - 76, 68, 76, 6); ctx.fill();
    const g = ctx.createRadialGradient(x, gy - 30, 4, x, gy - 30, 60);
    g.addColorStop(0, 'rgba(255,206,120,0.5)');
    g.addColorStop(1, 'rgba(255,206,120,0)');
    ctx.fillStyle = g; circle(x, gy - 30, 60);
    ctx.fillStyle = `rgba(255,214,130,${0.55 + 0.3 * Math.sin(t * 3)})`;
    ctx.fillRect(x - 22, gy - 54, 44, 4);
    ctx.font = 'bold 13px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,224,160,0.95)';
    ctx.fillText(level === 1 ? 'ادامهٔ مسیر ←' : 'پایان پل ←', x, gy - 70);
  }
  ctx.restore();
}

function drawPlatZombie(z, t) {
  if (z.dead && z.deadT > 2.4) return;
  ctx.save();
  const x = z.x, y = z.y;
  const sc = z.ty === 't' ? 1.32 : z.ty === 'f' ? 0.92 : 1.04;
  const C = z.ty === 't' ? 'rgba(52,38,36,0.96)' : z.ty === 'f' ? 'rgba(30,26,40,0.94)' : 'rgba(22,20,30,0.94)';
  if (z.dead) {
    ctx.globalAlpha = clamp(1 - (z.deadT - 1.4) / 1, 0, 1);
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2 * clamp(z.deadT / 0.5, 0, 1));
    ctx.translate(-x, -y);
  }
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = C; ctx.lineWidth = 4.6; ctx.lineCap = 'round';
  const st = Math.sin(z.walk);
  ctx.beginPath();
  ctx.moveTo(-1, -13); ctx.lineTo(-2 + st * 5, -1);
  ctx.moveTo(2, -13); ctx.lineTo(3 - st * 5, -1);
  ctx.stroke();
  /* بدن خمیده */
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.moveTo(-7, -13);
  ctx.quadraticCurveTo(-9.5, -21, -5, -26);
  ctx.quadraticCurveTo(-1, -30, 3.5, -28);
  ctx.quadraticCurveTo(8, -26, 7.5, -20);
  ctx.quadraticCurveTo(7, -15, 4, -13);
  ctx.closePath(); ctx.fill();
  /* دست‌ها به سمت بازیکن */
  ctx.strokeStyle = C; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(2, -25); ctx.quadraticCurveTo(9, -21, 11, -16);
  ctx.moveTo(-1, -26); ctx.quadraticCurveTo(-8, -22, -9, -17);
  ctx.stroke();
  /* سر */
  ctx.save();
  ctx.translate(4.6, -30.6); ctx.rotate(0.3);
  ctx.fillStyle = C;
  ctx.beginPath();
  ctx.moveTo(-4, 2.6); ctx.quadraticCurveTo(-4.6, -2, -1.2, -4);
  ctx.quadraticCurveTo(2.4, -5.6, 4.6, -3);
  ctx.quadraticCurveTo(6, -0.6, 4.8, 2);
  ctx.quadraticCurveTo(3, 4, 1, 3.8);
  ctx.quadraticCurveTo(-1.8, 4.6, -4, 2.6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(110,20,16,0.6)';
  ctx.beginPath(); ctx.ellipse(2, 2.2, 2.2, 1.5, 0.2, 0, Math.PI * 2); ctx.fill();
  const er = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.4 + z.x));
  ctx.shadowColor = 'rgba(255,52,36,0.9)'; ctx.shadowBlur = 6 * er;
  ctx.fillStyle = `rgba(255,84,56,${Math.min(1, er + 0.25)})`;
  circle(0.2, -1.4, 1.4); circle(3.4, -1, 1.3);
  ctx.shadowBlur = 0;
  ctx.restore();
  /* نشان جان تانک */
  if (z.ty === 't' && !z.dead) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-9, -40, 18, 3.4);
    ctx.fillStyle = '#c8483c';
    ctx.fillRect(-9, -40, 18 * clamp(z.hp / 6, 0, 1), 3.4);
  }
  ctx.restore();
}

function drawPlatPlayer(p, t) {
  ctx.save();
  /* چشمکِ آسیب */
  if (p.inv > 0 && Math.floor(p.inv * 14) % 2 === 0) ctx.globalAlpha = 0.35;
  const dy = p.onG ? 0 : 0;
  ctx.translate(p.x, p.y + dy);
  /* سایه */
  if (p.onG) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 1, 13, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.scale(p.face, 1);
  /* پاهای دوندگان */
  const run = p.onG ? Math.sin(p.walk) : 0.6;
  ctx.strokeStyle = '#3d4a63'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -14); ctx.lineTo(-3 + run * 8, -1);
  ctx.moveTo(2, -14); ctx.lineTo(4 - run * 8, -1);
  ctx.stroke();
  /* بدن — کاپشن */
  const bg = ctx.createLinearGradient(-8, -30, 8, -12);
  bg.addColorStop(0, '#4a5c74'); bg.addColorStop(1, '#37455c');
  ctx.fillStyle = bg;
  rr(-8, -30, 15, 17, 5); ctx.fill();
  /* کوله‌پشتی */
  ctx.fillStyle = '#6a5636';
  rr(-12, -29, 6, 13, 3); ctx.fill();
  /* سر + مو */
  ctx.fillStyle = '#f0c49a';
  circle(2, -35, 5.6);
  ctx.fillStyle = '#3a2c20';
  ctx.beginPath();
  ctx.arc(2, -36.5, 5.6, Math.PI, Math.PI * 1.95);
  ctx.fill();
  ctx.fillRect(-3.5, -37, 5, 2.6);
  /* تفنگ — به سمت جلو */
  ctx.strokeStyle = '#23262e'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -22); ctx.lineTo(17, -23.5);
  ctx.stroke();
  ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-1, -20); ctx.lineTo(3, -18);
  ctx.stroke();
  /* شعلهٔ دهانه */
  if (p.muzzle > 0) {
    const mg = ctx.createRadialGradient(20, -23.5, 1, 20, -23.5, 16);
    mg.addColorStop(0, 'rgba(255,230,150,0.95)');
    mg.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = mg; circle(20, -23.5, 16);
    ctx.fillStyle = '#fff2c0';
    ctx.beginPath();
    ctx.moveTo(17, -23.5); ctx.lineTo(26, -25.5); ctx.lineTo(26, -21.5);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawPlatHUD() {
  const p = PLAT30.pl, LV = PLAT30.LVL;
  ctx.save();
  ctx.textAlign = 'left';
  /* قلب‌ها */
  for (let i = 0; i < 3; i++) {
    const x = 16 + i * 26, y = 18;
    const on = i < p.hp;
    ctx.fillStyle = on ? `rgba(226,74,64,${0.8 + 0.2 * Math.sin(PLAT30.t * 6 + i)})` : 'rgba(50,44,54,0.8)';
    ctx.save();
    ctx.translate(x + 9, y + 8);
    ctx.beginPath();
    ctx.moveTo(0, 4.5);
    ctx.bezierCurveTo(-9.5, -3, -5, -10.5, 0, -5);
    ctx.bezierCurveTo(5, -10.5, 9.5, -3, 0, 4.5);
    ctx.fill();
    ctx.restore();
  }
  /* چیپ مرحله */
  ctx.font = 'bold 13px Vazirmatn, sans-serif';
  ctx.fillStyle = 'rgba(12,16,26,0.66)';
  rr(W / 2 - 92, 8, 184, 26, 13); ctx.fill();
  ctx.fillStyle = '#e8eefc';
  ctx.textAlign = 'center';
  ctx.fillText('سفر — ' + LV.name, W / 2, 26);
  /* نوار پیشرفت */
  const bw = Math.min(360, W * 0.4);
  const bx = W / 2 - bw / 2, by = 44;
  ctx.fillStyle = 'rgba(12,16,26,0.6)';
  rr(bx, by, bw, 7, 4); ctx.fill();
  const prog = clamp(p.x / LV.exitX, 0, 1);
  ctx.fillStyle = '#e8b23c';
  rr(bx + bw - bw * prog, by, bw * prog, 7, 4); ctx.fill();
  /* نشان چک‌پوینت */
  if (PLAT30.cpOn) {
    const cx = bx + bw - bw * clamp(LV.cp / LV.exitX, 0, 1);
    ctx.fillStyle = '#d8453a';
    ctx.fillRect(cx - 1.5, by - 3, 3, 13);
  }
  ctx.restore();
}

function drawPlatCard() {
  const k = PLAT30.card, tt = PLAT30.cardT;
  const a = clamp(Math.min(tt * 2.4, (2.2 - tt) * 2.4), 0, 1) * (k === 'intro' ? 0.92 : 0.88);
  ctx.save();
  ctx.fillStyle = `rgba(8,10,18,${a})`;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  const LV = PLAT30.LVL;
  if (k === 'intro') {
    ctx.fillStyle = '#c8d4ec';
    ctx.font = 'bold 15px Vazirmatn, sans-serif';
    ctx.fillText('فصل میانی — سفر', W / 2, H / 2 - 46);
    ctx.fillStyle = '#ffd98a';
    ctx.font = 'bold 27px Vazirmatn, sans-serif';
    ctx.fillText(LV.name, W / 2, H / 2 - 6);
    ctx.fillStyle = '#93a4c8';
    ctx.font = '14px Vazirmatn, sans-serif';
    ctx.fillText(LV.sub + ' — آرش، تنها و پیاده', W / 2, H / 2 + 26);
    ctx.fillStyle = 'rgba(140,155,190,0.8)';
    ctx.font = '12.5px Vazirmatn, sans-serif';
    ctx.fillText('◀ ▶ حرکت  ·  پرش  ·  شلیک — چک‌پوینت وسط راه', W / 2, H / 2 + 56);
  } else {
    ctx.fillStyle = '#a8f0c0';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.fillText('مرحله تمام شد!', W / 2, H / 2 - 12);
    ctx.fillStyle = '#c8d4ec';
    ctx.font = '14px Vazirmatn, sans-serif';
    ctx.fillText(PLAT30.level >= 3 ? 'ایستگاه شمالی در دید است...' : 'مرحلهٔ بعد: ' + PLAT30.all[PLAT30.level].name, W / 2, H / 2 + 22);
  }
  ctx.restore();
}
