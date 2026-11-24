/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۳٫۰ — بخش ج: پلتفرمرِ سبک ماریو
   ==================================================================
   بازسازی کامل بخش پلتفرمر قبلی (کنترا-سبک) به سبک سوپر ماریو:
     · تایل‌ها: زمینِ چمن‌دار، آجرشکسته، بلوکِ «؟» (سکه/قلب)، لولهٔ سبز
     · سکه‌های چرخان + بلوک‌هایی که از پایین می‌کوبی (سکه بیرون می‌پرد)
     · دشمن‌ها: زامبیِ شامبال (لگدکوب‌شدنی!) + کلاغِ پرنده
     · فیزیک ماریوئی: شتاب/ترمز/پرشِ متغیر (نگه‌داشتن دکمه)، کایوتی‌تایم
     · صداها: پرش، سکه، لگد، کوبیدن بلوک، آجر، آسیب، قلب، فانفار پرچم
     · سیو واقعی: چک‌پوینت + سکه/جون‌ها بین مراحل (STORE) — مرگ = ادامه از سیو
     · پرچم پایان مرحله با فانفار + کارت مرحلهٔ بعد
     · لوله‌های سبز ماریویی، تپه‌های سبز، ابرها — ظاهر شاد و تمیز
   ورودی: از همان دی‌پد قبلی (PLAT30.keys/jumpQueued/fireHeld=دویدن)
   ================================================================== */

/* ---------------- صداها (Snd.tone مستقیم) ---------------- */
const P43S = {
  play(o) { try { Snd.tone(o); } catch (e) {} },
  jump(big) {
    this.play({ type: 'square', f0: big ? 160 : 200, f1: big ? 460 : 560, dur: 0.16, vol: 0.10 });
  },
  coin() {
    this.play({ type: 'square', f0: 988, dur: 0.07, vol: 0.085 });
    this.play({ type: 'square', f0: 1319, dur: 0.22, vol: 0.085, delay: 0.07 });
  },
  stomp() {
    this.play({ type: 'square', f0: 260, f1: 90, dur: 0.14, vol: 0.11 });
    this.play({ type: 'triangle', f0: 520, f1: 780, dur: 0.1, vol: 0.06, delay: 0.02 });
  },
  bump() { this.play({ type: 'triangle', f0: 150, f1: 92, dur: 0.09, vol: 0.09 }); },
  brick() { this.play({ type: 'sawtooth', f0: 320, f1: 70, dur: 0.14, vol: 0.09 }); },
  hurt() { this.play({ type: 'sawtooth', f0: 340, f1: 80, dur: 0.26, vol: 0.11 }); },
  heart() {
    [523, 659, 784].forEach((f, i) => this.play({ type: 'triangle', f0: f, dur: 0.11, vol: 0.08, delay: i * 0.08 }));
  },
  flag() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.play({ type: 'square', f0: f, dur: 0.13, vol: 0.08, delay: i * 0.11 }));
  },
  gameover() {
    [392, 330, 262].forEach((f, i) => this.play({ type: 'triangle', f0: f, dur: 0.22, vol: 0.09, delay: i * 0.2 }));
  },
};

/* ---------------- وضعیت ---------------- */
const TS = 40;                                   // اندازهٔ تایل
const P43 = {
  on: false, lvl: null, lvlNum: 1, t: 0,
  grid: [], cols: 0, rows: 14, groundRow: 11,
  W: 0,                                          // عرض مرحله بر حسب تایل
  pl: null, en: [], coins: [], parts: [], pop: [],
  cam: 0, lives: 3, coinsTotal: 0, cpX: 0, cpOn: false,
  card: null, cardT: 0, dying: false, deadT: 0, flagT: -1, flagX: 0,
  keys: { l: false, r: false }, jumpBuf: 0, coyote: 0, jumpHeld: false,
  bark: {}, done: false, skid: false,
};

/* ---------------- سیو ---------------- */
function plat43Save() {
  try {
    STORE.set('ttb43_plat', JSON.stringify({
      lvl: P43.lvlNum, coins: P43.coinsTotal, lives: P43.lives, cp: P43.cpOn,
    }));
  } catch (e) { try { localStorage.setItem('ttb43_plat', JSON.stringify({ lvl: P43.lvlNum, coins: P43.coinsTotal, lives: P43.lives, cp: P43.cpOn })); } catch (e2) {} }
}
function plat43Load() {
  try {
    const raw = STORE.get('ttb43_plat');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  try { const raw2 = localStorage.getItem('ttb43_plat'); if (raw2) return JSON.parse(raw2); } catch (e) {}
  return null;
}

/* ---------------- سازندهٔ مراحل (DSL کوچک) ---------------- */
function L43B() {
  const rows = 14;
  const g = [];
  for (let r = 0; r < rows; r++) g.push([]);
  const A = {
    set(x, y, c) { if (x >= 0 && x < 400 && y >= 0 && y < rows) g[y][x] = c; return A; },
    ground(x0, x1, top) {                       // زمین تا کف صفحه
      top = top == null ? 11 : top;
      for (let x = x0; x <= x1; x++) for (let y = top; y < rows; y++) A.set(x, y, y === top ? '#' : '#');
      return A;
    },
    brick(x, y) { A.set(x, y, 'B'); return A; },
    q(x, y, kind) { A.set(x, y, kind || '?'); return A; },   // '?'=سکه 'M'=قلب
    plat(x0, x1, y) { for (let x = x0; x <= x1; x++) A.set(x, y, '='); return A; },
    pipe(x, top, h) {                            // لولهٔ سبز ۲عرض × hارتفاع
      for (let y = top; y < 11 && y < top + h; y++) { A.set(x, y, 'T'); A.set(x + 1, y, 'T'); }
      return A;
    },
    coins(x0, x1, y) { for (let x = x0; x <= x1; x++) if (!g[y][x]) A.set(x, y, 'o'); return A; },
    stair(x0, n, dir, base) {                    // پله — dir=1 بالا رونده
      base = base == null ? 10 : base;
      for (let i = 0; i < n; i++) {
        const x = x0 + i, hh = dir > 0 ? i + 1 : n - i;
        for (let y = base - hh + 1; y <= base; y++) A.set(x, y, '#');
      }
      return A;
    },
    z(x, ty) { A.en.push({ x: x * TS + TS / 2, ty: ty || 'n' }); return A; },
    crow(x, y) { A.en.push({ x: x * TS + TS / 2, ty: 'c', fy: y * TS }); return A; },
    cp(x) { A.cpX = x * TS + TS / 2; return A; },
    flag(x) { A.flagPx = x * TS + TS / 2; return A; },
    en: [], cpX: 0, flagPx: 0,
  };
  A._g = g;
  return A;
}

function plat43BuildLevels() {
  const L = [];

  /* ---- مرحلهٔ ۱: خرابه‌های شهر — آموزشی و شاد ---- */
  {
    const b = L43B();
    b.ground(0, 24); b.ground(28, 46); b.ground(50, 74); b.ground(78, 104); b.ground(108, 139);
    b.q(10, 7); b.q(11, 7, '?'); b.brick(12, 7); b.q(11, 3, 'M');
    b.pipe(17, 9, 2); b.pipe(23, 8, 3);
    b.brick(31, 7); b.q(32, 7); b.brick(33, 7); b.coins(31, 33, 6);
    b.plat(40, 44, 8); b.coins(40, 44, 7);
    b.plat(47, 48, 9);
    b.q(54, 7); b.q(55, 7, '?'); b.q(56, 7); b.coins(54, 56, 3);
    b.pipe(60, 9, 2);
    b.stair(65, 3, 1); b.stair(69, 3, -1);
    b.plat(75, 76, 9);
    /* زامبی ۶۶ داخل پله‌ها بود → ۷۲ */
    b.brick(84, 7); b.q(85, 7); b.brick(86, 7); b.coins(84, 86, 6);
    b.pipe(92, 8, 3);
    b.plat(100, 103, 8); b.coins(100, 103, 7);
    b.q(114, 7, 'M'); b.brick(115, 7); b.q(116, 7);
    b.pipe(122, 9, 2);
    b.stair(128, 4, 1);
    b.z(14); b.z(20); b.z(34); b.z(38); b.z(52, 'f'); b.z(58); b.z(72); b.z(82); b.z(88, 'f'); b.z(94); b.z(112); b.z(118, 'f'); b.z(126);
    b.cp(70);
    b.flag(136);
    b.meta = { name: 'خرابه‌های شهر', sub: 'مرحلهٔ ۱ از ۳ — بپر، لگد بزن، سکه جمع کن!', bark: 'p43a', tint: 'day' };
    L.push(b);
  }

  /* ---- مرحلهٔ ۲: پل شکسته — چاله‌ها و کلاغ‌ها ---- */
  {
    const b = L43B();
    b.ground(0, 14); b.ground(18, 30); b.ground(34, 44); b.ground(48, 62); b.ground(66, 80);
    b.ground(84, 96); b.ground(100, 114); b.ground(118, 139);
    b.plat(15, 17, 9); b.plat(31, 33, 8); b.plat(45, 47, 9); b.plat(63, 65, 8); b.plat(81, 83, 9);
    b.plat(97, 99, 8); b.plat(115, 117, 9);
    b.coins(15, 17, 8); b.coins(31, 33, 7); b.coins(45, 47, 8); b.coins(63, 65, 7); b.coins(81, 83, 8);
    b.brick(20, 7); b.q(21, 7, 'M'); b.brick(22, 7);
    b.q(26, 6); b.coins(26, 27, 5);
    b.pipe(38, 9, 2);
    b.q(52, 7); b.q(53, 7); b.q(54, 7, '?'); b.coins(52, 54, 3);
    b.stair(56, 3, 1); b.stair(60, 3, -1);
    b.plat(69, 73, 6); b.coins(69, 73, 5);
    /* زامبی ۵۸ داخل پله‌ها بود → ۵۹ */
    b.brick(88, 7); b.q(89, 7); b.brick(90, 7);
    b.pipe(94, 9, 2);
    b.plat(102, 107, 6); b.coins(102, 107, 5);
    b.q(112, 7, 'M');
    b.stair(122, 4, 1);
    b.plat(128, 133, 7); b.coins(128, 133, 6);
    b.z(10); b.z(24, 'f'); b.z(28); b.z(40); b.z(50, 'f'); b.z(59); b.z(70, 'f'); b.z(76); b.z(88); b.z(92, 'f'); b.z(104); b.z(110); b.z(124, 'f'); b.z(130);
    b.crow(16, 6); b.crow(32, 5); b.crow(46, 6); b.crow(64, 5); b.crow(82, 6); b.crow(98, 5); b.crow(116, 6);
    b.cp(48);
    b.flag(136);
    b.meta = { name: 'پل شکسته', sub: 'مرحلهٔ ۲ از ۳ — چاله‌ها بیدارِ منتظرند!', bark: 'p43b', tint: 'bridge' };
    L.push(b);
  }

  /* ---- مرحلهٔ ۳: راه شمالی — سخت‌تر، به ایستگاه ختم می‌شود ---- */
  {
    const b = L43B();
    b.ground(0, 20); b.ground(24, 40); b.ground(44, 58); b.ground(62, 78);
    b.ground(82, 98); b.ground(102, 118); b.ground(122, 141);
    b.plat(21, 23, 9); b.plat(41, 43, 8); b.plat(59, 61, 9); b.plat(79, 81, 8);
    b.plat(99, 101, 9); b.plat(119, 121, 8);
    b.coins(21, 23, 8); b.coins(41, 43, 7); b.coins(59, 61, 8); b.coins(79, 81, 7);
    b.q(8, 7); b.q(9, 7, '?'); b.brick(10, 7);
    b.pipe(15, 9, 2);
    b.stair(27, 4, 1); b.stair(32, 4, -1); b.coins(28, 31, 5);
    b.q(37, 6, 'M');
    b.brick(47, 7); b.brick(48, 7); b.q(49, 7); b.brick(50, 7); b.coins(47, 50, 6);
    b.pipe(54, 8, 3);
    b.plat(66, 72, 6); b.coins(66, 72, 5);
    b.stair(74, 3, 1);
    b.q(88, 7); b.q(89, 7, '?'); b.q(90, 7); b.coins(88, 90, 3);
    b.brick(94, 7); b.q(95, 7, 'M'); b.brick(96, 7);
    b.pipe(107, 9, 2);
    b.plat(111, 116, 6); b.coins(111, 116, 5);
    b.stair(125, 4, 1); b.stair(131, 4, -1);
    /* زامبی‌های داخل پله‌ها جابه‌جا شدند (۲۸→۲۶، ۳۰→۳۶، ۳۵→۳۸، ۷۵→۷۷، ۱۲۸→۱۲۹، ۱۳۴→۱۳۶) */
    b.z(12); b.z(17, 'f'); b.z(26); b.z(36, 'f'); b.z(38); b.z(46, 'f'); b.z(50); b.z(56); b.z(64, 'f'); b.z(70); b.z(77, 'f'); b.z(84); b.z(90, 'f'); b.z(94); b.z(104, 'f'); b.z(110); b.z(129, 'f'); b.z(136);
    b.crow(22, 6); b.crow(42, 5); b.crow(60, 6); b.crow(80, 5); b.crow(100, 6); b.crow(120, 5);
    b.cp(62);
    b.flag(138);
    b.meta = { name: 'راه شمالی', sub: 'مرحلهٔ ۳ از ۳ — ایستگاه، درست بعد از پرچم است', bark: 'p43c', tint: 'dusk' };
    L.push(b);
  }
  return L;
}

/* ---------------- شروع ---------------- */
function startPlatformer43(level) {
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  const sv = plat43Load();
  P43.coinsTotal = sv && typeof sv.coins === 'number' ? sv.coins : 0;
  P43.lvlNum = clamp(level || 1, 1, 3);
  P43.lives = sv && typeof sv.lives === 'number' && sv.lives > 0 ? sv.lives : 3;
  plat43StartLevel(P43.lvlNum, false);
  state.mode = 'sheltercine';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  state.shake = 0; state.flash = 0;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce(); hideChapterCard();
  try { $('lockBadge').classList.add('hidden'); } catch (e) {}
  try { $('bossBar').style.display = 'none'; bossBarVisible = false; } catch (e) {}
  try { setBuildPanel(true, true); } catch (e) {}
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  platPadShow(true);
  try {
    const bs = document.getElementById('platBS');
    if (bs) bs.innerHTML = 'دویدن';
    setTimeout(() => { const b2 = document.getElementById('platBS'); if (b2) b2.innerHTML = 'دویدن'; }, 120);
  } catch (e) {}
  PLAT30.on = true;
  try { MUSIC.set('menu'); } catch (e) {}
}

function plat43StartLevel(n, keepRun) {
  const all = P43._all = P43._all || plat43BuildLevels();
  P43.lvlNum = clamp(n, 1, 3);
  const src = all[P43.lvlNum - 1];
  /* ساخت گرید واقعی */
  const g = [];
  P43.rows = 14;
  for (let r = 0; r < P43.rows; r++) g.push(new Array(150).fill('.'));
  for (let r = 0; r < P43.rows; r++) {
    const row = src._g[r];
    for (let c = 0; c < row.length; c++) if (row[c] && row[c] !== '.') g[r][c] = row[c];
  }
  P43.lvl = src;                                   // ← مرجع مرحله برای رندر/به‌روزرسانی
  P43.grid = g;
  P43.cols = 150;
  P43.W = P43.cols * TS;
  P43.t = 0;
  P43.cam = 0;
  P43.parts = []; P43.pop = [];
  P43.cpOn = false;
  P43.cpX = src.cpX || 0;
  P43.flagX = src.flagPx || (P43.W - 160);
  P43.flagT = -1;
  P43.done = false;
  P43.dying = false; P43.deadT = 0;
  P43.card = 'intro'; P43.cardT = 0;
  P43.bark = { start: false, end: false };
  P43._lastGait = null;
  P43.jumpWasHeld = false;
  P43.en = (src.en || []).map(e => ({  
    x: e.x, y: e.ty === 'c' ? e.fy : 11 * TS, ty: e.ty,
    vx: e.ty === 'f' ? -105 : e.ty === 'c' ? -70 : -58, vy: 0,
    w: e.ty === 'c' ? 30 : 26, h: e.ty === 'c' ? 20 : 34,
    ph: Math.random() * 6.28, dead: false, deadT: 0, onG: false,
  }));
  P43.coins = [];
  P43.pl = {
    x: 2 * TS, y: 11 * TS, vx: 0, vy: 0, onG: true, face: 1,
    w: 15, h: 33, inv: 0, walk: 0, cd: 0, squash: 0, stretch: 0,
  };
  plat43Save();
}

/* ---------------- ورودی ---------------- */
function plat43Input(dt) {
  P43.keys.l = !!(PLAT30.keys && PLAT30.keys.l);
  P43.keys.r = !!(PLAT30.keys && PLAT30.keys.r);
  P43.jumpHeld = !!(PLAT30.jumpHeld);
  if (PLAT30.jumpQueued) {
    /* فقط اولِ فشردن پرش را صف می‌کنیم — تکرارِ keydown باعث پرشِ خودکار نمی‌شود */
    if (!P43.jumpWasHeld) P43.jumpBuf = 0.12;
    P43.jumpWasHeld = true;
    PLAT30.jumpQueued = false;
    PLAT30.jumpHeld = true;
  } else if (!P43.jumpHeld) {
    P43.jumpWasHeld = false;
  }
  P43.jumpBuf = Math.max(0, P43.jumpBuf - dt);
  P43.coyote = Math.max(0, P43.coyote - dt);
}

/* ---------------- تایل‌ها ---------------- */
function tile43(cx, cy) {
  if (cx < 0 || cx >= P43.cols || cy < 0 || cy >= P43.rows) return cy >= P43.rows ? '.' : (cx < 0 ? '#' : '.');
  return P43.grid[cy][cx] || '.';
}
const SOLID43 = { '#': 1, 'B': 1, '?': 1, 'M': 1, 'T': 1, '=': 1, 'U': 1 };

/* ---------------- برخورد بازیکن با تایل‌ها ---------------- */
function plat43MoveP(dt) {
  const p = P43.pl;
  const run = PLAT30.fireHeld ? 1.55 : 1;
  const maxV = 235 * run;
  const dir = (P43.keys.r ? 1 : 0) - (P43.keys.l ? 1 : 0);
  if (dir !== 0) {
    p.vx += dir * 1500 * dt;
    p.vx = clamp(p.vx, -maxV, maxV);
    if (Math.sign(p.vx) !== dir && p.onG && Math.abs(p.vx) > 120) { p.skid = true; } else p.skid = false;
    p.face = dir;
  } else {
    const fr = p.onG ? 1700 : 500;
    if (p.vx > 0) p.vx = Math.max(0, p.vx - fr * dt);
    else p.vx = Math.min(0, p.vx + fr * dt);
    p.skid = false;
  }
  if (dir !== 0 && p.onG) p.walk += dt * (7 + Math.abs(p.vx) / 34);

  /* پرش ماریوئی: بافر + کایوتی + ارتفاع متغیر */
  if (P43.jumpBuf > 0 && (p.onG || P43.coyote > 0)) {
    p.vy = -700;
    p.onG = false; P43.coyote = 0; P43.jumpBuf = 0;
    p.stretch = 0.14;
    P43S.jump(false);
    spawnParticles(p.x, p.y, 4, 'rgba(220,220,210,0.6)', { speed: 40, life: 0.3, size: 2, grav: 300 });
  }
  /* رها کردن دکمه = پرش کوتاه */
  if (!PLAT30.jumpHeld && p.vy < -320) p.vy = -320;

  p.vy += 2050 * dt;
  if (p.vy > 1180) p.vy = 1180;

  /* حرکت افقی + برخورد */
  let nx = p.x + p.vx * dt;
  const hw = p.w / 2 + 1;
  const top = p.y - p.h, bot = p.y - 2;
  if (p.vx > 0) {
    const cx1 = Math.floor((nx + hw) / TS);
    for (let cy = Math.floor(top / TS); cy <= Math.floor(bot / TS); cy++) {
      if (SOLID43[tile43(cx1, cy)]) { nx = cx1 * TS - hw - 0.1; p.vx = 0; break; }
    }
  } else if (p.vx < 0) {
    const cx0 = Math.floor((nx - hw) / TS);
    for (let cy = Math.floor(top / TS); cy <= Math.floor(bot / TS); cy++) {
      if (SOLID43[tile43(cx0, cy)]) { nx = (cx0 + 1) * TS + hw + 0.1; p.vx = 0; break; }
    }
  }
  p.x = clamp(nx, TS / 2, P43.W - TS / 2);

  /* حرکت عمودی + برخورد */
  let ny = p.y + p.vy * dt;
  const hw2 = p.w / 2 - 2;
  let hitHead = false;
  if (p.vy >= 0) {
    const cy1 = Math.floor(ny / TS);
    const landTol = 16 + p.vy * dt;                    // با سرعتِ سقوط
    for (const sx of [p.x - hw2, p.x + hw2]) {
      const s = tile43(Math.floor(sx / TS), cy1);
      if (SOLID43[s] && s !== '=') { ny = cy1 * TS; p.vy = 0; if (p.y < ny - 4) p.squash = 0.12; p.onG = true; P43.coyote = 0.09; break; }
      if (s === '=' && p.y <= cy1 * TS + landTol) { ny = cy1 * TS; p.vy = 0; if (p.y < ny - 4) p.squash = 0.12; p.onG = true; P43.coyote = 0.09; break; }
    }
  } else {
    const cy0 = Math.floor((ny - p.h) / TS);
    for (const sx of [p.x - hw2, p.x + hw2]) {
      const s = tile43(Math.floor(sx / TS), cy0);
      if (SOLID43[s] && s !== '=') {
        ny = (cy0 + 1) * TS + p.h + 0.1;
        p.vy = 0;
        hitHead = true;
        plat43HitBlock(Math.floor(sx / TS), cy0);
        break;
      }
    }
  }
  p.y = ny;

  p.squash = Math.max(0, p.squash - dt);
  p.stretch = Math.max(0, p.stretch - dt);
  p.inv = Math.max(0, p.inv - dt);

  /* سقوط در چاله */
  if (p.y > P43.rows * TS + 80) plat43Hurt(true);
}

/* کوبیدن بلوک از پایین */
function plat43HitBlock(cx, cy) {
  const s = tile43(cx, cy);
  const wx = cx * TS + TS / 2, wy = cy * TS + TS / 2;
  if (s === '?') {
    P43.grid[cy][cx] = 'U';
    P43.coinsTotal++;
    P43S.coin();
    P43.pop.push({ x: wx, y: wy - 6, vy: -260, t: 0, kind: 'coin' });
    plat43Save();
  } else if (s === 'M') {
    P43.grid[cy][cx] = 'U';
    P43.pop.push({ x: wx, y: wy - 6, vy: -70, t: 0, kind: 'heart', onTop: false });
    P43S.bump();
  } else if (s === 'B') {
    P43.grid[cy][cx] = '.';
    P43S.brick();
    for (let i = 0; i < 8; i++) {
      spawnParticles(wx, wy, 1, i % 2 ? 'rgba(200,110,70,0.95)' : 'rgba(150,70,44,0.95)',
        { speed: 150, life: 0.6, size: 4, grav: 700 });
    }
  } else if (s === 'U' || s === '#' || s === 'T') {
    P43S.bump();
    P43.bumpFx = { x: cx, y: cy, t: 0 };
  }
}

/* ---------------- آسیب / مرگ ---------------- */
function plat43Hurt(pit) {
  const p = P43.pl;
  if (p.inv > 0 && !pit) return;
  if (P43.dying) return;
  P43S.hurt();
  state.shake = 7;
  spawnParticles(p.x, p.y - 16, 8, 'rgba(200,60,50,0.85)', { speed: 90, life: 0.6, size: 2.6, grav: 400 });
  P43.lives--;
  plat43Save();
  if (P43.lives <= 0) {
    P43.dying = true; P43.deadT = 0;
    P43.card = 'over'; P43.cardT = 0;
    P43S.gameover();
  } else {
    P43.dying = true; P43.deadT = 0;
  }
}
function plat43Respawn() {
  const p = P43.pl;
  p.hp = 1;
  p.inv = 1.6;
  p.x = P43.cpOn ? P43.cpX : 2 * TS;
  p.y = 10 * TS;
  p.vx = 0; p.vy = 0;
  P43.dying = false;
  /* دشمن‌های نزدیک سیو دور می‌شوند */
  for (const e of P43.en) {
    if (!e.dead && Math.abs(e.x - p.x) < 260) e.x = p.x + (e.x > p.x ? 320 : -240);
  }
}

/* ---------------- دشمن‌ها ---------------- */
function plat43Enemies(dt) {
  const p = P43.pl;
  for (const e of P43.en) {
    if (e.dead) { e.deadT += dt; continue; }
    if (Math.abs(e.x - p.x) > W * 0.75) continue;      // فقط نزدیک‌ها فعال
    if (e.ty === 'c') {
      /* کلاغ — موجی */
      e.ph += dt * 3.4;
      e.x += e.vx * dt;
      e.y = e.ty === 'c' ? (e._baseY = e._baseY || e.y) + Math.sin(e.ph) * 26 : e.y;
      if (e.x < P43.cam - 60) { e.x = P43.cam + W + 90; e._baseY = e.fy || 6 * TS; }
      if (e.x < 40 || e.x > P43.W - 40) e.vx *= -1;
    } else {
      /* زامبی زمینی — لبه‌ها برمی‌گردد */
      const nx = e.x + e.vx * dt;
      const footCx = Math.floor(nx / TS);
      const below = tile43(footCx, Math.floor((e.y + 4) / TS));
      const wallC = Math.floor((nx + Math.sign(e.vx) * (e.w / 2)) / TS);
      const bodyR = Math.floor((e.y - e.h / 2) / TS);
      if (!SOLID43[below] || SOLID43[wallC] && wallC !== Math.floor(e.x / TS)) {
        e.vx *= -1;
      } else {
        e.x = nx;
      }
      /* جاذبه ساده */
      e.vy += 2000 * dt;
      let ny = e.y + e.vy * dt;
      const cy1 = Math.floor(ny / TS);
      let grounded = false;
      for (const sx of [e.x - e.w / 2 + 3, e.x + e.w / 2 - 3]) {
        const s = tile43(Math.floor(sx / TS), cy1);
        if (SOLID43[s] && s !== '=') { ny = cy1 * TS; e.vy = 0; grounded = true; break; }
        if (s === '=' && e.y <= cy1 * TS + 16) { ny = cy1 * TS; e.vy = 0; grounded = true; break; }
      }
      e.y = ny;
      e.onG = grounded;
      e.ph += dt * (e.ty === 'f' ? 10 : 6);
      if (e.y > P43.rows * TS + 100) { e.dead = true; e.deadT = 9; }
    }
    /* برخورد با بازیکن */
    const px2 = p.x, py2 = p.y - p.h / 2;
    const dx = Math.abs(e.x - px2), dy = Math.abs((e.y - e.h / 2) - py2);
    if (dx < e.w / 2 + p.w / 2 - 2 && dy < e.h / 2 + p.h / 2 - 2) {
      const falling = p.vy > 60 && (p.y - 6) < (e.y - e.h * 0.6);
      if (falling) {
        /* لگدکوب! */
        e.dead = true; e.deadT = 0;
        p.vy = -430;
        p.stretch = 0.14;
        P43S.stomp();
        state.shake = 4;
        spawnParticles(e.x, e.y - e.h, 10, 'rgba(120,160,90,0.9)', { speed: 110, life: 0.55, size: 2.6, grav: 500 });
        P43.pop.push({ x: e.x, y: e.y - e.h - 8, vy: -60, t: 0, kind: 'txt', txt: '+۱' });
      } else if (p.inv <= 0) {
        plat43Hurt(false);
        p.vx = Math.sign(p.x - e.x) * 240;
        p.vy = -260;
      }
    }
  }
}

/* ---------------- سکه‌ها ---------------- */
function plat43Coins(dt) {
  const p = P43.pl;
  const pcx = Math.floor(p.x / TS), pcy = Math.floor((p.y - p.h / 2) / TS);
  for (let cy = pcy - 1; cy <= pcy + 1; cy++) {
    for (let cx = pcx - 1; cx <= pcx + 1; cx++) {
      if (tile43(cx, cy) === 'o') {
        const wx = cx * TS + TS / 2, wy = cy * TS + TS / 2;
        if (Math.abs(wx - p.x) < 26 && Math.abs(wy - (p.y - p.h / 2)) < 30) {
          P43.grid[cy][cx] = '.';
          P43.coinsTotal++;
          P43S.coin();
          P43.pop.push({ x: wx, y: wy - 4, vy: -140, t: 0, kind: 'txt', txt: '+۱' });
          plat43Save();
        }
      }
    }
  }
  /* قلب‌های بیرون‌پریده */
  for (let i = P43.pop.length - 1; i >= 0; i--) {
    const q = P43.pop[i];
    q.t += dt;
    if (q.kind === 'heart') {
      q.y += q.vy * dt;
      const blockTop = (Math.floor(q.y / TS)) * TS;
      if (q.t > 0.8) q.vy = 0;
    } else {
      q.y += q.vy * dt;
      q.vy += (q.kind === 'coin' ? 620 : -30) * dt;
    }
    if (q.kind === 'coin' && q.t > 0.75) {
      /* سکهٔ بیرون‌پریده جمع می‌شود */
      P43.pop.splice(i, 1);
      continue;
    }
    /* قلب قابل برداشتن */
    if (q.kind === 'heart' && q.t > 0.7) {
      if (Math.abs(q.x - p.x) < 26 && Math.abs(q.y - (p.y - p.h / 2)) < 30) {
        P43.lives++;
        P43S.heart();
        plat43Save();
        P43.pop.splice(i, 1);
        continue;
      }
    }
    if (q.t > 6) P43.pop.splice(i, 1);
  }
}

/* ---------------- پرچم پایان ---------------- */
function plat43Flag(dt) {
  const p = P43.pl;
  if (P43.done) return;
  if (Math.abs(p.x - P43.flagX) < 22 && p.y > 4 * TS) {
    P43.done = true;
    P43.flagT = 0;
    P43S.flag();
    P43.card = 'done'; P43.cardT = -0.9;               // فانفار اول، کارت بعد
    spawnParticles(p.x, p.y - 20, 24, 'rgba(255,220,130,0.95)', { speed: 150, life: 1.1, size: 3, grav: 300 });
    plat43Save();
  }
}

/* ---------------- به‌روزرسانی ---------------- */
function updatePlatformer43(dt) {
  if (!PLAT30.on || state.mode !== 'sheltercine') return;
  P43.t += dt;
  try { MUSIC.update(); } catch (e) {}
  try { PERF.update(dt); } catch (e) {}
  updateTexts(dt);
  state.shake = Math.max(0, state.shake - dt * 16);
  if (P43.bumpFx) { P43.bumpFx.t += dt; if (P43.bumpFx.t > 0.3) P43.bumpFx = null; }

  /* کارت‌ها */
  if (P43.card) {
    P43.cardT += dt;
    const dur = P43.card === 'intro' ? 2.0 : P43.card === 'over' ? 2.2 : 1.9;
    if (P43.card === 'intro' && P43.cardT >= dur) { P43.card = null; P43.cardT = 0; }
    else if (P43.card === 'over' && P43.cardT >= dur) {
      /* گیم‌اور: جون‌ها ریست، همان مرحله از اول */
      P43.lives = 3;
      P43.cpOn = false;
      plat43StartLevel(P43.lvlNum, true);
      P43.card = null; P43.cardT = 0;
      plat43Save();
      return;
    }
    else if (P43.card === 'done' && P43.cardT >= dur) {
      P43.card = null; P43.cardT = 0;
      stopPlatformer();
      if (P43.lvlNum >= 3) { startStationCine30(); return; }
      plat43StartLevel(P43.lvlNum + 1, true);
      plat43Save();
      return;
    }
    if (P43.card === 'intro' || P43.card === 'over') { plat43Input(dt); return; }
  }

  if (P43.dying) {
    P43.deadT += dt;
    if (P43.card !== 'over' && P43.deadT > 1.3) plat43Respawn();
    return;
  }

  plat43Input(dt);
  plat43MoveP(dt);
  plat43Enemies(dt);
  plat43Coins(dt);
  plat43Flag(dt);

  /* چک‌پوینت */
  if (!P43.cpOn && P43.cpX && Math.abs(P43.pl.x - P43.cpX) < 26) {
    P43.cpOn = true;
    P43S.heart();
    try { bark('cpOn30', null, '', '🚩 ایستگاه سیو فعال شد', 'اگه بمیری از همین‌جا ادامه می‌دی', 2.2); } catch (e) {}
    plat43Save();
  }

  /* دوربین نرم */
  const target = clamp(P43.pl.x - W * 0.38, 0, P43.W - W);
  P43.cam += (target - P43.cam) * Math.min(1, dt * 7);

  /* بارک‌های شروع/پایان */
  const meta = (P43.lvl && P43.lvl.meta) || P43._all[P43.lvlNum - 1].meta;
  if (!P43.bark.start && P43.t > 2.3 && meta.bark) {
    P43.bark.start = true;
    const tx = {
      p43a: 'تنها مونده... فقط باید سریع‌تر از شب باشم.',
      p43b: 'پل از وسط شکسته... از روی سکوها می‌پرم.',
      p43c: 'نور ایستگاه! درست همون‌جاست که نقشه گفت.',
    };
    try { bark(meta.bark, 'p', tx[meta.bark] || '', '🥾 [آرش]:', tx[meta.bark] || '', 2.4); } catch (e) {}
  }
  if (!P43.bark.end && P43.lvlNum === 3 && P43.pl.x > P43.flagX - 500) {
    P43.bark.end = true;
    try { bark('pb3p', 'p', 'ایستگاه... اونجاست.', '📡 [آرش]:', 'ایستگاه... اونجاست.', 2.4); } catch (e) {}
  }
}

/* ================================================================
   رندر — دنیای شادِ ماریوئی
   ================================================================ */
function renderPlatformer43() {
  if (!PLAT30.on || !P43.lvl || state.mode !== 'sheltercine') return;
  const t = P43.t;
  const meta = (P43.lvl && P43.lvl.meta) || P43._all[P43.lvlNum - 1].meta;
  const tint = meta.tint;
  ctx.save();
  if (state.shake > 0.5) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);

  /* --- آسمان --- */
  const SKY = {
    day: ['#4e9be8', '#8ec8f4', '#c8e6fa'],
    bridge: ['#3f8fd8', '#7ab8e8', '#b8dcf4'],
    dusk: ['#7a4a9a', '#c86a5a', '#f2b070'],
  }[tint] || ['#4e9be8', '#8ec8f4', '#c8e6fa'];
  const sky = ctx.createLinearGradient(0, 0, 0, P43.rows * TS);
  sky.addColorStop(0, SKY[0]); sky.addColorStop(0.62, SKY[1]); sky.addColorStop(1, SKY[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, P43.rows * TS + 40);
  /* خورشید */
  const sx2 = W * 0.82, sy2 = 90;
  const sg = ctx.createRadialGradient(sx2, sy2, 8, sx2, sy2, 90);
  sg.addColorStop(0, 'rgba(255,244,200,0.9)');
  sg.addColorStop(1, 'rgba(255,244,200,0)');
  ctx.fillStyle = sg; circle(sx2, sy2, 90);
  ctx.fillStyle = 'rgba(255,250,220,0.95)'; circle(sx2, sy2, 30);

  /* --- ابرها (پارالاکس) --- */
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 9; i++) {
    const cx3 = ((i * 260 + t * 12 - P43.cam * 0.25) % (W + 420)) - 210;
    const cy3 = 54 + (i % 4) * 52;
    ctx.beginPath();
    circle(cx3, cy3, 22); circle(cx3 + 22, cy3 - 8, 17); circle(cx3 - 22, cy3 - 4, 15); circle(cx3 + 6, cy3 + 6, 16);
    ctx.fill();
  }
  /* --- تپه‌های سبز دور --- */
  const hillCol = tint === 'dusk' ? '#3e7a4e' : '#4e9a58';
  ctx.fillStyle = hillCol;
  for (let i = -1; i < 12; i++) {
    const hx = ((i * 300 - P43.cam * 0.4) % (W + 600)) - 100;
    ctx.beginPath();
    ctx.arc(hx, P43.rows * TS - 20, 110, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(60,130,72,0.85)';
  for (let i = -1; i < 16; i++) {
    const hx = ((i * 220 + 90 - P43.cam * 0.62) % (W + 440)) - 60;
    ctx.beginPath();
    ctx.arc(hx, P43.rows * TS - 14, 66, Math.PI, 0);
    ctx.fill();
  }

  /* --- دنیا با دوربین --- */
  ctx.save();
  ctx.translate(-Math.round(P43.cam), 0);
  const c0 = Math.max(0, Math.floor(P43.cam / TS) - 1);
  const c1 = Math.min(P43.cols - 1, Math.ceil((P43.cam + W) / TS) + 1);

  for (let cy = 0; cy < P43.rows; cy++) {
    for (let cx = c0; cx <= c1; cx++) {
      const s = tile43(cx, cy);
      if (s === '.') continue;
      const x = cx * TS, y = cy * TS;
      if (s === '#') {
        /* زمین: چمن + خاک */
        const above = tile43(cx, cy - 1);
        ctx.fillStyle = '#8a5a38';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        ctx.fillRect(x + TS - 3, y, 3, TS);
        ctx.fillRect(x, y + TS - 3, TS, 3);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(x + 3, y + 3, 8, 5);
        if (above === '.' || above === 'o') {
          ctx.fillStyle = '#57a84e';
          ctx.fillRect(x, y, TS, 13);
          ctx.fillStyle = '#6fc45e';
          ctx.fillRect(x, y, TS, 7);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(x + 5, y + 1.6, 10, 2.6);
        }
      } else if (s === 'B') {
        /* آجر */
        ctx.fillStyle = '#c86a3a';
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = 'rgba(90,40,20,0.6)'; ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
        ctx.beginPath();
        ctx.moveTo(x, y + TS / 2); ctx.lineTo(x + TS, y + TS / 2);
        ctx.moveTo(x + TS / 2, y); ctx.lineTo(x + TS / 2, y + TS / 2);
        ctx.moveTo(x + TS / 4, y + TS / 2); ctx.lineTo(x + TS / 4, y + TS);
        ctx.moveTo(x + TS * 3 / 4, y + TS / 2); ctx.lineTo(x + TS * 3 / 4, y + TS);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x + 2, y + 2, TS - 4, 3);
      } else if (s === '?' || s === 'M') {
        /* بلوک سؤال — طلایی تپنده */
        const pu = 0.5 + 0.5 * Math.sin(t * 4.4 + cx);
        ctx.fillStyle = `rgb(${222 + pu * 20},${168 + pu * 24},58)`;
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = '#8a5c1c'; ctx.lineWidth = 2.6;
        ctx.strokeRect(x + 1.4, y + 1.4, TS - 2.8, TS - 2.8);
        ctx.fillStyle = 'rgba(90,60,20,0.65)';
        for (const [dx2, dy2] of [[7, 7], [TS - 11, 7], [7, TS - 11], [TS - 11, TS - 11]]) ctx.fillRect(x + dx2, y + dy2, 4, 4);
        ctx.fillStyle = `rgba(255,255,240,${0.75 + pu * 0.25})`;
        ctx.font = 'bold 24px Vazirmatn, Tahoma';
        ctx.textAlign = 'center';
        ctx.fillText(s === 'M' ? '♥' : '؟', x + TS / 2, y + TS / 2 + 9);
        ctx.textAlign = 'left';
      } else if (s === 'U') {
        ctx.fillStyle = '#7a6248';
        ctx.fillRect(x, y, TS, TS);
        ctx.strokeStyle = 'rgba(50,36,20,0.7)'; ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, TS - 2, TS - 2);
      } else if (s === 'T') {
        /* لولهٔ سبز */
        const isTop = tile43(cx, cy - 1) !== 'T';
        const isLeft = tile43(cx - 1, cy) !== 'T';
        ctx.fillStyle = '#3e9e3e';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#57c25a';
        if (isLeft) ctx.fillRect(x + 2, y, 8, TS);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        if (!isLeft) ctx.fillRect(x + TS - 6, y, 6, TS);
        if (isTop) {
          ctx.fillStyle = '#2e8a34';
          ctx.fillRect(x - (isLeft ? 4 : 0), y, TS + 4, 12);
          ctx.fillStyle = '#57c25a';
          ctx.fillRect(x - (isLeft ? 4 : 0), y, TS + 4, 5);
        }
      } else if (s === '=') {
        /* سکوی معلق سنگی */
        ctx.fillStyle = '#b8894e';
        ctx.fillRect(x, y, TS, 18);
        ctx.fillStyle = '#8a6438';
        ctx.fillRect(x, y + 18, TS, 8);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(x, y, TS, 3.4);
        ctx.strokeStyle = 'rgba(70,46,20,0.5)'; ctx.lineWidth = 1.4;
        ctx.strokeRect(x + 1, y + 1, TS - 2, 24);
      } else if (s === 'o') {
        /* سکهٔ چرخان */
        const sp = Math.abs(Math.sin(t * 3.2 + cx * 0.7));
        ctx.fillStyle = '#f2c23a';
        ctx.beginPath();
        ctx.ellipse(x + TS / 2, y + TS / 2, 9 * Math.max(0.25, sp), 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a87c1c'; ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,230,0.85)';
        ctx.beginPath();
        ctx.ellipse(x + TS / 2 - 2 * sp, y + TS / 2 - 3, 2.4 * sp + 0.6, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* افکت کوبیدن بلوک */
  if (P43.bumpFx) {
    const k = P43.bumpFx.t / 0.3;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(P43.bumpFx.x * TS, P43.bumpFx.y * TS - 8 * Math.sin(k * Math.PI), TS, TS);
  }

  /* پرچم پایان */
  drawPlat43Flag(t);

  /* چک‌پوینت */
  if (P43.cpX) {
    const cx4 = P43.cpX;
    ctx.strokeStyle = '#8a8878'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx4, 11 * TS); ctx.lineTo(cx4, 11 * TS - 64); ctx.stroke();
    ctx.fillStyle = '#f2c23a';
    circle(cx4, 11 * TS - 66, 3.4);
    const wave = Math.sin(t * 3.4) * 3;
    ctx.fillStyle = P43.cpOn ? '#4ec25a' : '#c8c0a8';
    ctx.beginPath();
    ctx.moveTo(cx4, 11 * TS - 62);
    ctx.lineTo(cx4 + 26, 11 * TS - 54 + wave);
    ctx.lineTo(cx4, 11 * TS - 44);
    ctx.closePath(); ctx.fill();
  }

  /* سکه‌ها/قلب‌های بیرون‌پریده */
  for (const q of P43.pop) {
    if (q.kind === 'coin') {
      const sp = Math.abs(Math.sin(q.t * 9));
      ctx.fillStyle = '#f2c23a';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y, 8 * Math.max(0.3, sp), 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a87c1c'; ctx.stroke();
    } else if (q.kind === 'heart') {
      drawHeart43(q.x, q.y, 9 + Math.sin(q.t * 5) * 1.2);
    } else if (q.kind === 'txt') {
      ctx.fillStyle = 'rgba(255,244,200,' + clamp(1 - q.t / 0.9, 0, 1).toFixed(2) + ')';
      ctx.font = 'bold 14px Vazirmatn, Tahoma';
      ctx.textAlign = 'center';
      ctx.fillText(q.txt, q.x, q.y);
      ctx.textAlign = 'left';
    }
  }

  /* دشمن‌ها */
  for (const e of P43.en) {
    if (e.dead) {
      if (e.deadT < 0.5) {
        /* له‌شده */
        ctx.save();
        ctx.translate(e.x, e.y - 4);
        ctx.scale(1.25, 0.35);
        plat43ZombieBody(e, t);
        ctx.restore();
      }
      continue;
    }
    if (Math.abs(e.x - P43.pl.x) > W) continue;
    if (e.ty === 'c') drawPlatCrow(e, t);
    else plat43Zombie(e, t);
  }

  /* بازیکن */
  drawPlat43Player(P43.pl, t);

  /* ذرات (مختصات دنیا) */
  drawParticles();

  ctx.restore();    // دوربین

  /* HUD */
  drawPlat43HUD();

  /* کارت مرحله */
  if (P43.card) drawPlat43Card();

  /* مرگ */
  if (P43.dying) {
    const a = clamp(P43.deadT / 1.0, 0, 0.72);
    ctx.fillStyle = `rgba(30,8,8,${a})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* ---- قلب ---- */
function drawHeart43(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#e84a5a';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.72);
  ctx.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.62, -r * 0.94, 0, -r * 0.34);
  ctx.bezierCurveTo(r * 0.62, -r * 0.94, r * 1.3, -r * 0.1, 0, r * 0.72);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.ellipse(-r * 0.4, -r * 0.34, r * 0.2, r * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ---- پرچم پایان ---- */
function drawPlat43Flag(t) {
  const x = P43.flagX;
  const top = 5 * TS, base = 11 * TS;
  ctx.strokeStyle = '#c8c8c8'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, top); ctx.stroke();
  ctx.fillStyle = '#f2c23a';
  circle(x, top - 4, 5);
  /* پرچم که پایین می‌آید بعد از بردن */
  const fy = P43.flagT >= 0 ? top + 16 + clamp(P43.flagT / 1.2, 0, 1) * (base - top - 40) : top + 16;
  const wave = Math.sin(t * 4) * 3;
  ctx.fillStyle = '#d8453a';
  ctx.beginPath();
  ctx.moveTo(x - 3, fy);
  ctx.quadraticCurveTo(x - 22, fy + 5 + wave, x - 38, fy + 2 + wave);
  ctx.lineTo(x - 38, fy + 22 + wave);
  ctx.quadraticCurveTo(x - 22, fy + 25 + wave, x - 3, fy + 20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f2c23a';
  circle(x - 20, fy + 11 + wave * 0.5, 3);
  /* پایه */
  ctx.fillStyle = '#3e9e3e';
  ctx.fillRect(x - 14, base - 8, 28, 8);
}

/* ---- زامبی پلتفرمر — سبک ماریو (شامبالِ بامزه) ---- */
function plat43ZombieBody(e, t) {
  /* بدنهٔ له‌شده یا عادی */
  ctx.fillStyle = '#7d8b58';
  ctx.beginPath(); ctx.ellipse(0, -8, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4e5a34';
  ctx.beginPath(); ctx.ellipse(0, -2, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
}
function plat43Zombie(e, t) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const dir = Math.sign(e.vx) || 1;
  ctx.scale(dir < 0 ? -1 : 1, 1);
  const ph = e.ph;
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(0, 1, 13, 3.6, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = '#39432a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const st = Math.sin(ph);
  ctx.beginPath();
  ctx.moveTo(-3, -12); ctx.lineTo(-4 + st * 5, -1);
  ctx.moveTo(3, -12); ctx.lineTo(4 - st * 5, -1);
  ctx.stroke();
  /* بدنهٔ کوچک */
  const g = ctx.createLinearGradient(0, -30, 0, -10);
  g.addColorStop(0, '#7d8b58'); g.addColorStop(1, '#39432a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.quadraticCurveTo(-11, -22, -6, -27);
  ctx.quadraticCurveTo(0, -31, 6.5, -27);
  ctx.quadraticCurveTo(11, -22, 9, -10);
  ctx.closePath(); ctx.fill();
  /* پیراهن پاره */
  ctx.fillStyle = e.ty === 'f' ? '#6e3b2e' : '#4a3355';
  ctx.beginPath();
  ctx.moveTo(-8, -11);
  ctx.quadraticCurveTo(-9.5, -19, -5.5, -24);
  ctx.lineTo(0, -22); ctx.lineTo(-2, -14); ctx.lineTo(4, -16); ctx.lineTo(6.5, -11);
  ctx.closePath(); ctx.fill();
  /* دست‌های جلو — زامبی‌وار */
  const reach = Math.sin(ph * 0.7) * 2;
  ctx.strokeStyle = '#4e5a34'; ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(4, -24);
  ctx.quadraticCurveTo(12, -22 + reach, 17, -15 + reach);
  ctx.moveTo(-4, -24);
  ctx.quadraticCurveTo(-10, -20, -13, -14);
  ctx.stroke();
  ctx.fillStyle = '#7d8b58';
  circle(17, -14 + reach, 2.4); circle(-13, -13, 2.2);
  /* سر */
  ctx.save();
  ctx.translate(3, -30);
  ctx.rotate(0.14 + Math.sin(ph) * 0.06);
  const hg = ctx.createRadialGradient(-1, -3, 2, 0, 0, 9);
  hg.addColorStop(0, '#8ea064'); hg.addColorStop(1, '#4e5a34');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(0, -1, 7.4, 7, 0, 0, Math.PI * 2); ctx.fill();
  /* موی ژولیده */
  ctx.strokeStyle = '#2e3422'; ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, -6); ctx.lineTo(-7, -3);
  ctx.moveTo(-2, -7.6); ctx.lineTo(-3, -5);
  ctx.stroke();
  /* چشم سرخ تابان */
  const er = 0.6 + 0.4 * Math.abs(Math.sin(t * 2.2 + ph));
  ctx.fillStyle = `rgba(255,70,44,${er})`;
  circle(2.4, -1.6, 1.5); circle(-1.6, -1.8, 1.4);
  ctx.fillStyle = 'rgba(20,8,6,0.9)';
  circle(2.6, -1.5, 0.6); circle(-1.4, -1.7, 0.55);
  /* فک باز + دندان */
  ctx.fillStyle = '#39432a';
  ctx.beginPath();
  ctx.moveTo(-4, 2.6);
  ctx.quadraticCurveTo(0.6, 7.4, 5, 3);
  ctx.quadraticCurveTo(2.6, 1.6, -4, 2.6);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(220,214,200,0.9)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2.4, 2.6); ctx.lineTo(-2.2, 4.2);
  ctx.moveTo(0.4, 3.1); ctx.lineTo(0.6, 4.6);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/* ---- کلاغ ---- */
function drawPlatCrow(e, t) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const dir = Math.sign(e.vx) || 1;
  ctx.scale(dir < 0 ? -1 : 1, 1);
  const fl = Math.sin(t * 9 + e.ph);
  /* سایه روی زمین (اگر نزدیک) */
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  ctx.beginPath(); ctx.ellipse(0, 12 * TS - e.y, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
  /* بال‌ها */
  ctx.fillStyle = '#2e3440';
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(-8, -10 - fl * 8, -18, -4 - fl * 10);
  ctx.quadraticCurveTo(-8, 2, 0, 2);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(8, -10 - fl * 8, 18, -4 - fl * 10);
  ctx.quadraticCurveTo(8, 2, 0, 2);
  ctx.closePath(); ctx.fill();
  /* بدن */
  ctx.fillStyle = '#262c38';
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 6.4, 0, 0, Math.PI * 2); ctx.fill();
  /* سر + نوک */
  ctx.fillStyle = '#1e2430';
  circle(7, -4, 4.4);
  ctx.fillStyle = '#e8a03a';
  ctx.beginPath();
  ctx.moveTo(10, -5); ctx.lineTo(17, -3.4); ctx.lineTo(10, -1.6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,80,60,0.9)';
  circle(8, -5.4, 1.1);
  ctx.restore();
}

/* ---- بازیکن: آرش با کلاه سرخ (هومِیج ماریو) ---- */
function drawPlat43Player(p, t) {
  const blink = p.inv > 0 && Math.floor(t * 14) % 2 === 0;
  if (blink) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  const dir = p.face;
  ctx.scale(dir < 0 ? -1 : 1, 1);
  const sq = p.squash > 0 ? 1 - p.squash * 1.4 : 1;
  const st = p.stretch > 0 ? 1 + p.stretch * 1.1 : 1;
  ctx.scale(2 - sq > 1.14 ? 1.14 : 2 - sq, sq * st);
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1.5, 11, 3.4, 0, 0, Math.PI * 2); ctx.fill();

  const air = !p.onG;
  const legSw = air ? 0 : Math.sin(p.walk);
  const lean = p.skid ? -0.16 * (p.vx > 0 ? 1 : -1) : 0;

  /* پاها */
  ctx.strokeStyle = '#2e3444'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (air) {
    ctx.beginPath();
    ctx.moveTo(-2, -13); ctx.lineTo(-6, -4);
    ctx.moveTo(3, -13); ctx.lineTo(7, -7);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-1.5, -13); ctx.lineTo(-1 + legSw * 7, -1);
    ctx.moveTo(2.5, -13); ctx.lineTo(2.5 - legSw * 7, -1);
    ctx.stroke();
  }
  /* کفش‌های قهوه‌ای */
  ctx.fillStyle = '#6e4a2a';
  if (air) {
    ctx.beginPath(); ctx.ellipse(-7, -3.4, 4.6, 2.6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8.4, -6.6, 4.6, 2.6, 0.2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.beginPath(); ctx.ellipse(-1 + legSw * 7 + 2, -1.4, 4.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(2.5 - legSw * 7 + 2, -1.4, 4.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.rotate(lean * 0.3);
  /* بدنه — آبی سرمه‌ای */
  const g = ctx.createLinearGradient(0, -30, 0, -10);
  g.addColorStop(0, '#3e5e8e'); g.addColorStop(1, '#2a3f60');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-8, -11);
  ctx.quadraticCurveTo(-10, -20, -6.5, -26);
  ctx.quadraticCurveTo(0, -30, 6.5, -26);
  ctx.quadraticCurveTo(10, -20, 8, -11);
  ctx.closePath(); ctx.fill();
  /* کمربند + دکمه‌ها */
  ctx.fillStyle = 'rgba(20,16,12,0.55)';
  ctx.fillRect(-7.6, -13.4, 15.4, 2.6);
  ctx.fillStyle = '#f2c23a';
  circle(0, -14.2, 1.3);
  /* بازوها */
  const arm = air ? -0.9 : (p.skid ? 1.2 : Math.sin(p.walk + Math.PI) * 0.7);
  ctx.strokeStyle = '#3e5e8e'; ctx.lineWidth = 4.8;
  ctx.beginPath();
  ctx.moveTo(5, -23);
  ctx.quadraticCurveTo(10 + arm * 4, -18 + arm * 3, 12 + arm * 6, -12 + arm * 5);
  ctx.moveTo(-5, -23);
  ctx.quadraticCurveTo(-10 - arm * 4, -18 - arm * 3, -12 - arm * 6, -12 - arm * 5);
  ctx.stroke();
  ctx.fillStyle = '#f2c9a2';
  circle(12 + arm * 6, -11 + arm * 5, 2.4);
  circle(-12 - arm * 6, -11 - arm * 5, 2.4);

  /* سر */
  ctx.save();
  ctx.translate(1.4, -31);
  const hg = ctx.createRadialGradient(-1.6, -2.6, 2, 0, 0, 8.4);
  hg.addColorStop(0, '#f8d0a6'); hg.addColorStop(1, '#d8a878');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.ellipse(0, 0, 7.6, 7.2, 0, 0, Math.PI * 2); ctx.fill();
  /* کلاه سرخ — برندِ آرش */
  ctx.fillStyle = '#d8453a';
  ctx.beginPath(); ctx.ellipse(0.4, -3.4, 8, 4.6, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b8352c';
  rr(-1.4, -4.6, 12.4, 3.4, 1.6); ctx.fill();
  ctx.fillStyle = '#f8f4e8';
  circle(2.6, -5.6, 2.2);
  ctx.fillStyle = '#d8453a';
  ctx.font = 'bold 6px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('آ', 2.6, -3.6);
  /* صورت */
  const blinkEye = Math.sin(t * 0.9) > 0.985 ? 0.2 : 1;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath(); ctx.ellipse(3.4, 0.4, 2, 1.6 * blinkEye, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#26303e';
  circle(4, 0.4, 0.9);
  ctx.strokeStyle = 'rgba(60,44,32,0.7)'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(2, -1.8); ctx.lineTo(5.2, -1.6);
  ctx.stroke();
  /* دهان — گرم و امیدوار */
  ctx.strokeStyle = 'rgba(120,60,44,0.9)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (air) { ctx.arc(4.6, 3.4, 2, 0, Math.PI); }
  else { ctx.moveTo(3, 3.6); ctx.quadraticCurveTo(5.4, 4.6, 7, 3.2); }
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

/* ---- HUD ---- */
function drawPlat43HUD() {
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  /* پس‌زمینهٔ شیشه‌ای */
  ctx.fillStyle = 'rgba(8,12,22,0.55)';
  rr(12, 12, 232, 44, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(140,170,220,0.35)'; ctx.lineWidth = 1.4;
  rr(12, 12, 232, 44, 12); ctx.stroke();
  /* جون‌ها */
  for (let i = 0; i < Math.min(5, P43.lives); i++) drawHeart43(38 + i * 24, 34, 8);
  if (P43.lives > 5) {
    ctx.fillStyle = '#ffd873';
    ctx.font = 'bold 13px Vazirmatn, Tahoma';
    ctx.fillText('×' + faNum(P43.lives), 158, 39);
  }
  /* سکه‌ها */
  ctx.fillStyle = '#f2c23a';
  circle(196, 34, 9);
  ctx.strokeStyle = '#a87c1c'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(196, 34, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff8e0';
  ctx.font = 'bold 14px Vazirmatn, Tahoma';
  ctx.textAlign = 'left';
  ctx.fillText(faNum(P43.coinsTotal), 212, 39);
  /* نوار پیشرفت تا پرچم */
  const prog = clamp(P43.pl.x / P43.flagX, 0, 1);
  ctx.fillStyle = 'rgba(8,12,22,0.55)';
  rr(W / 2 - 110, H - 40, 220, 16, 8); ctx.fill();
  ctx.fillStyle = 'rgba(242,194,58,0.9)';
  rr(W / 2 - 107, H - 37, 214 * prog, 10, 5); ctx.fill();
  ctx.fillStyle = '#d8453a';
  circle(W / 2 + 107, H - 32, 5);
  /* نام مرحله */
  ctx.fillStyle = 'rgba(232,238,250,0.85)';
  ctx.font = '600 12px Vazirmatn, Tahoma';
  ctx.textAlign = 'right';
  ctx.fillText(((P43.lvl && P43.lvl.meta) || P43._all[P43.lvlNum - 1].meta).name, W - 16, 30);
  ctx.textAlign = 'left';
  ctx.restore();
}

/* ---- کارت شروع/پایان/گیم‌اور ---- */
function drawPlat43Card() {
  const ct = P43.cardT;
  const a = clamp(ct / 0.35, 0, 1) * (P43.card === 'intro' ? clamp((2.0 - ct) / 0.3, 0, 1) : 1);
  ctx.fillStyle = `rgba(6,10,20,${0.62 * a})`;
  ctx.fillRect(0, 0, W, H);
  const meta = P43._all[P43.lvlNum - 1].meta;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  const meta2 = (P43.lvl && P43.lvl.meta) || P43._all[P43.lvlNum - 1].meta;
  if (P43.card === 'intro') {
    ctx.fillStyle = 'rgba(240,225,190,0.96)';
    ctx.font = 'bold 28px Vazirmatn, Tahoma';
    ctx.fillText(meta2.name, W / 2, H * 0.4);
    ctx.font = '14px Vazirmatn, Tahoma';
    ctx.fillStyle = 'rgba(210,206,190,0.85)';
    ctx.fillText(meta2.sub, W / 2, H * 0.4 + 30);
    ctx.font = '12px Vazirmatn, Tahoma';
    ctx.fillStyle = 'rgba(160,175,205,0.8)';
    ctx.fillText('◀ ▶ حرکت  ·  ⤒ پرش (نگه‌دار = بلندتر)  ·  دویدن = سرعت', W / 2, H * 0.4 + 58);
  } else if (P43.card === 'done') {
    ctx.fillStyle = 'rgba(255,222,140,0.96)';
    ctx.font = 'bold 26px Vazirmatn, Tahoma';
    ctx.fillText('مرحلهٔ ' + faNum(P43.lvlNum) + ' تمام شد!', W / 2, H * 0.42);
    ctx.font = '14px Vazirmatn, Tahoma';
    ctx.fillStyle = 'rgba(230,226,210,0.9)';
    ctx.fillText(P43.lvlNum >= 3 ? 'ایستگاه شمالی، از این‌جا شروع می‌شود...' : 'مرحلهٔ بعدی: ' + ((P43._all[P43.lvlNum] && P43._all[P43.lvlNum].meta) ? P43._all[P43.lvlNum].meta.name : ''), W / 2, H * 0.42 + 30);
  } else if (P43.card === 'over') {
    ctx.fillStyle = 'rgba(240,120,110,0.96)';
    ctx.font = 'bold 26px Vazirmatn, Tahoma';
    ctx.fillText('جون‌ها تمام شد!', W / 2, H * 0.42);
    ctx.font = '14px Vazirmatn, Tahoma';
    ctx.fillStyle = 'rgba(230,226,210,0.9)';
    ctx.fillText('از اولِ همین مرحله — با ۳ جون تازه', W / 2, H * 0.42 + 30);
  }
  ctx.textAlign = 'left';
  ctx.restore();
}

/* ---------------- جایگزینی سراسری ---------------- */
try {
  startPlatformer = startPlatformer43;
  updatePlatformer = updatePlatformer43;
  renderPlatformer = renderPlatformer43;
} catch (e) { console.error('v43 plat hook failed', e); }

window.__P43 = P43;
