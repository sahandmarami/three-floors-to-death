'use strict';
/* ==================================================================
   سه طبقه تا بقا — منطق بازی (بخش ۱)
   ساختار کد برای گسترش‌پذیری ماژولار طراحی شده:
     ۱) ثابت‌ها و تنظیمات    ۲) ابزارهای کمکی    ۳) وضعیت بازی
     ۴) ورودی (ماوس/کیبورد)  ۵) جریان موج‌ها      ۶) شلیک و گلوله
     ۷) زامبی‌ها و آسیب برج   ۸) سکه‌ها            ۹) اقتصاد و ارتقاها
    (رسم و رابط کاربری در بخش ۲ ادامه دارد)
   ================================================================== */

/* ---------------------- ۱) ثابت‌ها و تنظیمات ---------------------- */
const W = 960, H = 560;                    // ابعاد منطقی دنیای بازی
const GROUND_Y = 492;                      // خط زمین (پای زامبی‌ها)
const TOWER = { x: W / 2, baseHalf: 68, floorH: 66, floors: 3 };
const TOWER_TOP_Y = GROUND_Y - TOWER.floorH * TOWER.floors; // سقف برج = محل ایستادن بازیکن

const TOTAL_WAVES = 10;                    // تعداد کل موج‌ها
const INTERMISSION_TIME = 5;               // ثانیه وقفه بین موج‌ها
const INTERMISSION_FIRST = 3;              // شمارش معکوس کوتاه‌تر قبل از موج اول

/* تنظیمات زامبی: با هر موج تعداد/سرعت/جون بیشتر می‌شود */
const ZOMBIE_CFG = {
  baseSpeed: 26, speedPerWave: 7,          // سرعت پایه + رشد هر موج
  baseHp: 2, hpPerWave: 1,                 // جون پایه + رشد هر موج
  damage: 5,                               // آسیب هر گاز به برج
  biteInterval: 1,                         // فاصله زمانی بین گازها (ثانیه)
  radius: 15,                              // شعاع برخورد گلوله/تله
};

/* تنظیمات بازیکن و شلیک */
const PLAYER_CFG = {
  fireCooldown: 0.18,                      // حداقل فاصله بین شلیک‌ها (ثانیه)
  bulletSpeed: 720,                        // سرعت گلوله
  baseDamage: 1,                           // آسیب پایه گلوله (با ارتقا اسلحه زیاد می‌شود)
};

/* تنظیمات فروشگاه: قیمت‌ها تصاعدی هستند (growth^سطح) */
const UPGRADES = {
  weapon: { name: 'ارتقای اسلحه',   base: 25, growth: 1.75, max: 5 },
  health: { name: 'افزایش جون برج', base: 20, growth: 1.6,  max: 6, bonus: 25 },
  trap:   { name: 'نصب تله پایه برج', base: 35, growth: 1.8, max: 5,
            dps: 10, dpsPerLvl: 8, radius: 95 }, // آسیب در ثانیه و شعاع مؤثر تله
};

/* ---------------------- ۲) ابزارهای کمکی ---------------------- */
const $ = id => document.getElementById(id);

/* تبدیل ارقام لاتین به فارسی (۰-۹) */
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
function faNum(n) { return String(n).replace(/\d/g, d => FA_DIGITS[d]); }

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }

/* عدد تصادفیِ «Seed دار» — برای تولید ستاره/تپه‌های ثابت (تا در هر فریم عوض نشوند) */
let _seed = 1379;
function srand() { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; }

/* عناصر ثابت صحنه: ستاره‌ها، تپه‌ها و سنگ‌ریزه‌های جاده یک بار ساخته می‌شوند */
const STARS = Array.from({ length: 80 }, () => ({
  x: srand() * W, y: srand() * (GROUND_Y - 90), r: 0.6 + srand() * 1.4,
  ph: srand() * 6.28, sp: 0.5 + srand() * 1.6,
}));
const HILLS1 = Array.from({ length: 18 }, (_, i) => ({ x: -30 + i * 60, h: 22 + srand() * 36 }));
const HILLS2 = Array.from({ length: 13 }, (_, i) => ({ x: -40 + i * 85, h: 10 + srand() * 18 }));
const PEBBLES = Array.from({ length: 26 }, () => ({ x: srand() * W, dy: 2 + srand() * 12, r: 0.8 + srand() * 1.6 }));

/* ---------------------- ۳) وضعیت بازی ---------------------- */
/* mode (وضعیت‌های بازی):
   start        صفحه شروع
   playing      درگیر موج فعلی
   intermission وقفه بین موج‌ها (شمارش معکوس + فرصت خرید)
   shop         منوی ساخت‌وساز باز است (بازی متوقف)
   paused       توقف دستی
   gameover     باخت (جون برج صفر)
   victory      برد (پاک‌سازی هر ۱۰ موج)
*/
const state = {
  mode: 'start', prevMode: null,
  time: 0,                                 // زمان منطقی بازی (در توقف ثابت می‌ماند)
  wave: 0,                                 // موج فعلی (۰ = هنوز شروع نشده)
  intermission: 0,                         // ثانیه باقی‌مانده تا موج بعد
  spawn: { remaining: 0, timer: 0, interval: 2 }, // وضعیت تولید زامبی موج فعلی
  coins: 0,
  tower: { hp: 100, maxHp: 100 },
  upgrades: { weapon: 0, health: 0, trap: 0 },
  zombies: [], bullets: [], coinsArr: [], particles: [], texts: [], zaps: [],
  mouse: { x: W / 2, y: 120, down: false },
  aimAngle: -Math.PI / 2,                  // زاویه اسلحه بازیکن رو به ماوس
  shake: 0, flash: 0,                      // لرزش دوربین و فلش قرمزِ آسیب برج
  fireFlash: 0, recoil: 0,                 // جلوه شلیک (نور دهانه + عقب‌راندگی اسلحه)
  stats: { kills: 0, earned: 0 },
};

let animTime = 0;                          // زمان نمایشی (همیشه جلو می‌رود؛ برای سوسو ستاره‌ها و پرچم)
let fireTimer = 0;                         // کول‌داون شلیک
let announceTimer = 0;                     // مدت نمایش اعلان موقت (مثل «موج ۲»)

/* قاب و بوم */
const canvas = $('game');
const ctx = canvas.getContext('2d');
const DPR = Math.min(window.devicePixelRatio || 1, 2); // شفافیت نمایش در صفحه‌های رتینا
canvas.width = W * DPR;
canvas.height = H * DPR;
try { ctx.direction = 'rtl'; } catch (e) { /* مرورگرهای قدیمی */ }

/* ---------------------- ۴) ورودی: ماوس/لمس و کیبورد ---------------------- */
function canPlay() { return state.mode === 'playing' || state.mode === 'intermission'; }

/* تبدیل مختصات رویداد ماوس به مختصات منطقی دنیای بازی */
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}

/* به‌روزرسانی زاویه اسلحه بر اساس موقعیت فعلی ماوس */
function updateAim() {
  state.aimAngle = Math.atan2(state.mouse.y - (TOWER_TOP_Y - 17), state.mouse.x - TOWER.x);
}

canvas.addEventListener('pointermove', e => {
  const p = canvasPos(e); state.mouse.x = p.x; state.mouse.y = p.y;
  updateAim();
});
canvas.addEventListener('pointerdown', e => {
  const p = canvasPos(e); state.mouse.x = p.x; state.mouse.y = p.y;
  updateAim();                             // هدف‌گیری قبل از شلیک به‌روز شود
  state.mouse.down = true;
  if (canPlay()) tryShoot();               // شلیک فوری در لحظه‌ی کلیک
  e.preventDefault();
});
window.addEventListener('pointerup', () => { state.mouse.down = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault()); // منوی راست‌کلیک باز نشود

/* کیبورد: P یا Esc برای توقف/ادامه، Esc برای بستن فروشگاه */
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (state.mode === 'shop') closeShop();
    else if (state.mode === 'paused') resumeGame();
    else if (canPlay()) pauseGame();
  } else if (e.key === 'p' || e.key === 'P') {
    if (state.mode === 'paused') resumeGame();
    else if (canPlay()) pauseGame();
  }
});
/* اگر تب/پنجره از حالت نمایش خارج شد، بازی خودکار متوقف شود */
window.addEventListener('blur', () => { if (state.mode === 'playing') pauseGame(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'playing') pauseGame();
});

/* ---------------------- ۵) جریان موج‌ها ---------------------- */
/* شروع/ریست کامل بازی */
function startGame() {
  state.mode = 'intermission';
  state.prevMode = null;
  state.time = 0; state.wave = 0;
  state.coins = 0;
  state.tower.hp = 100; state.tower.maxHp = 100;
  state.upgrades = { weapon: 0, health: 0, trap: 0 };
  state.zombies = []; state.bullets = []; state.coinsArr = [];
  state.particles = []; state.texts = []; state.zaps = [];
  state.shake = 0; state.flash = 0;
  state.stats = { kills: 0, earned: 0 };
  state.spawn = { remaining: 0, timer: 0, interval: 2 };
  state.mouse.down = false; fireTimer = 0; announceTimer = 0;
  state.intermission = INTERMISSION_FIRST; // شمارش معکوس کوتاه قبل از موج ۱
  hideOverlays();
  $('btnPause').textContent = '⏸ توقف';
  $('btnShop').classList.remove('attention');
  updateHUD(); refreshShop();
}

/* آغاز موج n */
function startWave(n) {
  state.wave = n;
  state.mode = 'playing';
  state.spawn = {
    remaining: 5 + 3 * n,                                  // تعداد زامبی‌های این موج
    timer: 1.2,                                            // تأخیر اولین تولد
    interval: Math.max(2.3 - n * 0.16, 0.55),              // فاصله بین تولدها (کم‌تر هر موج)
  };
  setAnnounce('موج ' + faNum(n), 'دفاع کن! 🧟', 2);
  $('btnShop').classList.remove('attention');
  updateHUD();
}

/* پایان موج فعلی: برد، یا ورود به وقفه قبل از موج بعد */
function waveComplete() {
  if (state.wave >= TOTAL_WAVES) { victory(); return; }
  state.mode = 'intermission';
  state.intermission = INTERMISSION_TIME;
  setAnnounce('موج بعدی: ' + faNum(state.wave + 1), '', INTERMISSION_TIME + 0.2);
  $('btnShop').classList.add('attention');  // راهنمایی بصری: فرصت خرید رسید
}

/* تولید یک زامبی از لبه چپ یا راست */
function spawnZombie() {
  const side = Math.random() < 0.5 ? -1 : 1;
  const hp = ZOMBIE_CFG.baseHp + ZOMBIE_CFG.hpPerWave * state.wave;
  state.zombies.push({
    x: side < 0 ? -30 : W + 30,
    y: GROUND_Y + rand(-4, 4),             // کمی پراکندگی عمودی برای خوانایی دسته‌جمعی
    dir: side < 0 ? 1 : -1,                // جهت گام (به سمت برج)
    hp, maxHp: hp,
    speed: (ZOMBIE_CFG.baseSpeed + ZOMBIE_CFG.speedPerWave * state.wave) * rand(0.8, 1.2),
    radius: ZOMBIE_CFG.radius,
    biteTimer: rand(0.2, 0.6),             // اولین گاز کمی زودتر/دیرتر
    walkPhase: Math.random() * Math.PI * 2,
    attackAnim: 0,
    attacking: false, hitFlash: 0, dead: false,
  });
}

/* ---------------------- ۶) شلیک و گلوله‌ها ---------------------- */
/* آسیب هر گلوله بر اساس سطح ارتقای اسلحه */
function bulletDamage() { return PLAYER_CFG.baseDamage + state.upgrades.weapon; }

/* محل دهانه اسلحه (نوک لوله در بالای برج) */
function gunMuzzle() {
  const gx = TOWER.x, gy = TOWER_TOP_Y - 17, L = 23;
  return { x: gx + Math.cos(state.aimAngle) * L, y: gy + Math.sin(state.aimAngle) * L };
}

function tryShoot() {
  if (fireTimer > 0) return;
  updateAim();                             // اطمینان از جهت صحیح گلوله
  fireTimer = PLAYER_CFG.fireCooldown;
  const m = gunMuzzle();
  state.bullets.push({
    x: m.x, y: m.y,
    vx: Math.cos(state.aimAngle) * PLAYER_CFG.bulletSpeed,
    vy: Math.sin(state.aimAngle) * PLAYER_CFG.bulletSpeed,
    dmg: bulletDamage(), r: 4, life: 2, dead: false,
  });
  state.fireFlash = 0.07; state.recoil = 1;
  spawnParticles(m.x, m.y, 3, '#ffe9a8', { speed: 90, life: 0.18, size: 2, grav: 0,
    dir: state.aimAngle, spread: Math.PI / 3 });
}

/* برخورد گلوله با زامبی‌ها + خروج گلوله از صحنه */
function updateBullets(dt) {
  for (const b of state.bullets) {
    if (b.dead) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.y > GROUND_Y + 4) {              // گلوله به زمین خورد
      b.dead = true;
      spawnParticles(b.x, GROUND_Y, 4, '#6a5a43', { speed: 70, life: 0.3, size: 2, grav: 300, up: true });
      continue;
    }
    if (b.x < -40 || b.x > W + 40 || b.y < -40 || b.life <= 0) { b.dead = true; continue; }
    for (const z of state.zombies) {
      if (z.dead) continue;
      const dx = z.x - b.x, dy = (z.y - 20) - b.y; // مرکز بدن زامبی
      const rr = z.radius + b.r + 3;
      if (dx * dx + dy * dy < rr * rr) {
        b.dead = true;
        hitZombie(z, b.dmg, b.x, b.y);
        break;
      }
    }
  }
  state.bullets = state.bullets.filter(b => !b.dead);
}

/* ---------------------- ۷) زامبی‌ها: حرکت، حمله، تله ---------------------- */
function updateZombies(dt) {
  for (const z of state.zombies) {
    if (z.dead) continue;
    z.hitFlash = Math.max(0, z.hitFlash - dt);
    const dx = TOWER.x - z.x;
    const stop = TOWER.baseHalf + z.radius; // فاصله توقف از مرکز برج

    if (Math.abs(dx) > stop) {
      /* راه رفتن به سمت برج */
      z.attacking = false;
      z.x += Math.sign(dx) * z.speed * dt;
      z.walkPhase += dt * (4 + z.speed * 0.06);
    } else {
      /* رسید به برج: گاز گرفتن با فاصله زمانی ثابت */
      z.attacking = true;
      z.attackAnim += dt * 5;
      z.biteTimer -= dt;
      if (z.biteTimer <= 0) {
        z.biteTimer = ZOMBIE_CFG.biteInterval;
        damageTower(ZOMBIE_CFG.damage, z.x);
      }
    }
  }
  state.zombies = state.zombies.filter(z => !z.dead);
}

/* آسیب گلوله به زامبی */
function hitZombie(z, dmg, bx, by) {
  if (z.dead) return;
  z.hp -= dmg;
  z.hitFlash = 0.15;
  addText(z.x, z.y - 46, faNum(dmg), '#ffffff', 12);
  spawnParticles(bx, by, 4, '#8fd06a', { speed: 110, life: 0.3, size: 2, grav: 400 });
  if (z.hp <= 0) killZombie(z);
}

/* مرگ زامبی: افکت + ریختن سکه */
function killZombie(z) {
  if (z.dead) return;
  z.dead = true;
  state.stats.kills++;
  spawnParticles(z.x, z.y - 18, 14, '#5f8f3e', { speed: 170, life: 0.55, size: 3, grav: 500 });
  spawnParticles(z.x, z.y - 18, 5, '#7a2f2f', { speed: 120, life: 0.45, size: 2.5, grav: 500 });
  dropCoins(z.x, z.y - 18);
}

/* کاهش جون برج (دست زامبی) */
function damageTower(amount, srcX) {
  if (state.mode !== 'playing') return;
  state.tower.hp = Math.max(0, state.tower.hp - amount);
  state.flash = 1;
  state.shake = Math.min(10, state.shake + 5);
  const side = srcX < TOWER.x ? -1 : 1;
  addText(TOWER.x + side * (TOWER.baseHalf + 6), GROUND_Y - 60, faNum(amount), '#ff6b5e', 16);
  spawnParticles(TOWER.x + side * TOWER.baseHalf, GROUND_Y - rand(20, 60), 6, '#8a6f52',
    { speed: 120, life: 0.4, size: 2.5, grav: 500 });
  updateHUD();
  if (state.tower.hp <= 0) gameOver();
}

/* تله پایه برج: آسیب خودکار و پیوسته به زامبی‌های نزدیک */
function updateTrap(dt) {
  const lvl = state.upgrades.trap;
  if (lvl <= 0) return;
  const dps = UPGRADES.trap.dps + UPGRADES.trap.dpsPerLvl * (lvl - 1);
  for (const z of state.zombies) {
    if (z.dead) continue;
    if (Math.abs(z.x - TOWER.x) < UPGRADES.trap.radius) {
      z.hp -= dps * dt;
      z.hitFlash = Math.max(z.hitFlash, 0.06);
      if (Math.random() < dt * 6) addZap(z.x, z.y - 18);   // قوس برق نمایشی
      if (z.hp <= 0) killZombie(z);
    }
  }
}

/* ---------------------- ۸) سکه‌ها: ریختن، زمین‌خوردن، جمع‌شدن ---------------------- */
/* با مرگ هر زامبی چند سکه می‌پرد بیرون */
function dropCoins(x, y) {
  const n = 3 + Math.floor(state.wave / 2) + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    state.coinsArr.push({
      x, y, vx: rand(-90, 90), vy: rand(-260, -120),
      phase: 'drop', t: 0, bounces: 0, flySpeed: 420, dead: false,
    });
  }
}

/* محل شمارنده سکه در HUD (تبدیل مختصات صفحه به مختصات بوم تا سکه‌ها دقیقاً به آن پرو کنند) */
function coinTarget() {
  try {
    const r = canvas.getBoundingClientRect();
    const c = $('coinItem').getBoundingClientRect();
    return {
      x: (c.left + c.width / 2 - r.left) / r.width * W,
      y: (c.top + c.height / 2 - r.top) / r.height * H,
    };
  } catch (e) { return { x: W - 150, y: 26 }; }
}

function updateCoins(dt) {
  const target = coinTarget(); // یک بار در هر فریم محاسبه می‌شود
  for (const c of state.coinsArr) {
    if (c.dead) continue;
    c.t += dt;
    if (c.phase === 'drop') {
      /* پرتاب اولیه + جاذبه + وایراستن روی زمین */
      c.vy += 900 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.y > GROUND_Y - 6) {
        c.y = GROUND_Y - 6;
        c.vy *= -0.45; c.vx *= 0.7; c.bounces++;
        if (Math.abs(c.vy) < 40 || c.bounces >= 2 || c.t > 0.9) c.phase = 'fly';
      }
    } else {
      /* پرو شتاب‌دار به سمت شمارنده سکه در HUD */
      const dx = target.x - c.x, dy = target.y - c.y;
      const d = Math.hypot(dx, dy) || 1;
      c.flySpeed += 1400 * dt;
      const step = Math.min(d, c.flySpeed * dt);
      c.x += dx / d * step; c.y += dy / d * step;
      if (d < 18) { collectCoin(c); continue; }
    }
    if (c.t > 4) collectCoin(c); // بیمه: سکه گم‌نشده جمع شود
  }
  state.coinsArr = state.coinsArr.filter(c => !c.dead);
}

function collectCoin(c) {
  if (c.dead) return;
  c.dead = true;
  state.coins++;
  state.stats.earned++;
  updateHUD();
  pulseCoins();
}

/* پالس بصری شمارنده سکه در HUD */
function pulseCoins() {
  const el = $('coinItem');
  el.classList.remove('pulse');
  void el.offsetWidth;                     // ریست انیمیشن
  el.classList.add('pulse');
}

/* ---------------------- ۹) اقتصاد و ارتقاها (منوی ساخت‌وساز) ---------------------- */
/* قیمت ارتقای kind در سطح فعلی (گردشده به مضرب ۵) */
function priceOf(kind) {
  const u = UPGRADES[kind], lvl = state.upgrades[kind];
  return Math.round(u.base * Math.pow(u.growth, lvl) / 5) * 5;
}

function attemptBuy(kind) {
  const u = UPGRADES[kind];
  const lvl = state.upgrades[kind];
  if (lvl >= u.max) return;
  const price = priceOf(kind);
  const btn = $('buy' + kind[0].toUpperCase() + kind.slice(1));
  if (state.coins < price) {
    /* سکه کافی نیست: لرزش دکمه */
    btn.classList.remove('deny'); void btn.offsetWidth; btn.classList.add('deny');
    return;
  }
  state.coins -= price;
  state.upgrades[kind] = lvl + 1;
  if (kind === 'health') {
    /* هم حداکثر جون زیاد می‌شود هم همین الان ترمیم می‌شود */
    state.tower.maxHp += u.bonus;
    state.tower.hp = Math.min(state.tower.maxHp, state.tower.hp + u.bonus);
    addText(TOWER.x, TOWER_TOP_Y - 40, '+' + faNum(u.bonus), '#6fce62', 15);
  }
  if (kind === 'trap' && lvl === 0) {
    /* نصب اول تله: جلوه بصری نصب */
    spawnParticles(TOWER.x, GROUND_Y - 8, 16, '#ffcf6e', { speed: 150, life: 0.5, size: 2.5, grav: 300, up: true });
    state.shake = Math.min(8, state.shake + 4);
  }
  updateHUD(); refreshShop(); pulseCoins();
}

/* آسیب فعلی تله (برای نمایش در فروشگاه) */
function trapDps(lvl) { return lvl <= 0 ? 0 : UPGRADES.trap.dps + UPGRADES.trap.dpsPerLvl * (lvl - 1); }
