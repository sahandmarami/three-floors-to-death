/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۰٫۰ — بخش ۷: انتقال‌های بین فصل‌ها
   ==================================================================
   هر انتقال «سه فاز» دارد (هیچ فازی حذف نمی‌شود):
     فاز ۱) افتتاحیه‌ی سینمایی (بدون کنترل): فروریختن برج / انفجار دیوار /
             گلوله‌باران + ورود دراماتیک ارشان و وسیله‌ی فرار — با لرزش،
             ذرات، دود، نور و حرکت دوربین (فاز ۱ روی همان میدان بازی رندر
             می‌شود با شبه‌کات‌سین CS)
     فاز ۲) بخش قابل‌کنترل (مینی‌گیم داخل همان صحنه): با کلیدهای جهت‌دار
             می‌دود، می‌پرد (↑/Space) و خم می‌شود (↓)؛ دوربین/نور/اتمسفر
             سینمایی فعال می‌ماند. در هر فرار یک «آیتم مخفی» وجود دارد.
     فاز ۳) پایان‌بندی سینمایی (بدون کنترل): فرود/رسیدن دراماتیک + محو
             → کارت فصل جدید → روزِ فصل بعد
   سه انتقال:
     فصل ۱→۲: فروریختن طبقه‌طبقه + ماشین ارشان + دویدن کنار ماشین در جاده
     فصل ۲→۳: انفجار دیوار انبار + فرار از تونل تاریک (فقط نور چراغ‌قوه)
     فصل ۳→۴: گلوله‌باران + زیپ‌لاین روی دره برفی/بارانی
   ================================================================== */

let TR = null;          // وضعیت انتقال فعال (null = انتقالی در جریان نیست)
const PXM = 24;         // پیکسل به «متر» برای نمایش پیشرفت فرار

/* (۱۱٫۰) گفتگوی صوتی فاز ۱ هر انتقال + صداهای فاز ۲/۳ */
const TR_DLGS = {
  1: [ { who: 'a', voice: 't1a1', text: 'برج داره فرو می‌ریزه! بپر! سریع!' } ],
  2: [ { who: 'p', voice: 't2p1', text: 'همه چی سیاهه... نمی‌تونم چیزی ببینم.' },
       { who: 'a', voice: 't2a1', text: 'چراغ‌قوه‌ت رو روشن کن! و موانع رو رد کن!' } ],
  3: [ { who: 'a', voice: 't3a1', text: 'راه زمینی بسته‌ست! باید از روی دره بریم!' },
       { who: 'p', voice: 't3p1', text: 'از بالای دره؟ تو دیوونه‌ای!' } ],
};
const TR_BARKS = {
  1: { catch: 't1a2', start: 't1a3', outro: 't1a4' },
  2: { catch: null,   start: 't2a2', outro: 't2a3' },
  3: { catch: 't3a2', start: null,   outro: 't3a3' },
};
/* صدای کوتاه + زیرنویس انتقال (بدون بلوک ورودی) */
function transBark(voiceId, txt, dur) {
  const d = (voiceId && VOICE.speak(voiceId, 1)) || 0;
  setTransSub(txt || '', dur || Math.max(2.4, d + 0.4));
}

/* ورودی مینی‌گیم */
const mgKeys = { left: false, right: false, duck: false };

/* ---------------------- ۷-۱) زیرنویس و ابزار مشترک ---------------------- */
function setTransSub(txt, dur) {
  if (!TR) return;
  TR.sub = txt || '';
  TR.subT = dur || 2.8;
}
/* زیرنویس‌های زمان‌دار فاز ۱: [شروع، پایان، متن] */
function setTimedSubs(list, t) {
  for (const s of list) {
    if (t >= s[0] && t <= s[1] && TR.sub !== s[2]) setTransSub(s[2], s[1] - s[0]);
  }
}

/* شروع انتقال از فصل fromCh (بعد از پاک‌سازی موج ۸ آن فصل) */
function startTransition(fromCh) {
  if (TR) return;
  transitionHardReset();
  TR = {
    ch: clamp(fromCh, 1, 3),
    phase: 1, t: 0, fade: 0, fadeWhite: false,
    sub: '', subT: 0, ev: {}, _paused: false,
  };
  state.mode = 'transition';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  state.powerTimers = { rapid: 0, freeze: 0 };
  state.goingNight = false;
  /* پاداش‌های معلق صحنه بلافاصله جمع شوند */
  for (const c of state.coinsArr) collectCoin(c);
  state.coinsArr = [];
  state.powerups = [];
  state.zombies = [];
  state.bullets = [];
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  hideChapterCard();
  $('wrap').classList.add('cine-mode');       // همه‌ی UI مخفی (حالت سینمایی کامل)
  $('skipCs').classList.remove('hidden');     // دکمه‌ی «رد کردن»
  setupTransitionIntro(TR.ch);
  /* (۱۱٫۰) گفتگوی صوتی آغاز انتقال */
  const dl = TR_DLGS[TR.ch];
  if (dl) DLG.start(dl, null);
  SFX.csRumble();
  updateHUD();
}

/* پاک‌سازی کامل حالت انتقال */
function transitionHardReset() {
  TR = null;
  CS = null;                                  // شبه‌کات‌سینِ فاز ۱ هم پاک شود
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
}

/* رد کردن انتقال: مستقیم فصل بعد (بدون آیتم مخفی) */
function skipTransition() {
  if (!TR) return;
  SFX.click();
  const ch = TR.ch;
  transitionHardReset();
  startChapter(ch + 1);
}

/* پایان انتقال → کارت فصل بعد */
function finishTransition() {
  const ch = TR ? TR.ch : 1;
  transitionHardReset();
  startChapter(ch + 1);
}

/* ---------------------- ۷-۲) فاز ۱ — افتتاحیه‌های سینمایی ---------------------- */
/* شبه‌کات‌سین CS فقط برای داده‌های رندر (طبقه‌ها/ماشین/بازیکن) ساخته می‌شود؛
   منطق زمانی این‌جاست */
function setupTransitionIntro(ch) {
  CS = {
    t: 0, paused: false, drive: null, post: null,
    zombies: [], car: null,
    draw: {
      floors: [{ a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }, { a: 1, dy: 0, rot: 0 }],
      cracks: 0, rubble: 0, player: null,
    },
  };
}

/* زامبیِ راه‌رونده‌ی صحنه‌ی سینمایی (به سمت برج می‌خزد) */
function makeCsWalkZombie(type, x) {
  const T = ZTYPES[type];
  return {
    type, x, y: GROUND_Y + rand(-2, 6), dir: x < TOWER.x ? 1 : -1,
    radius: T.r, speed: T.spdBase * 0.85, hp: 10, maxHp: 10,
    walkPhase: rand(0, 6.28), attacking: false, attackAnim: 0, attackSide: 0,
    lane: 0, depth: 1.05, yJit: rand(-3, 3), stagger: 0, chill: 0,
    hitFlash: 0, dead: false, deathT: 0,
  };
}
function csWalkStep(dt) {
  for (const z of CS.zombies) {
    z.walkPhase += dt * 5;
    const dx = TOWER.x - z.x;
    if (Math.abs(dx) > 118) z.x += Math.sign(dx) * z.speed * dt;
  }
}

/* موج آجر/خاک حین فروریختن (با گیت زمانی) */
function brickBurstStep(i, dt) {
  TR.ev['burst' + i] = (TR.ev['burst' + i] || 0) + dt;
  if (TR.ev['burst' + i] > 0.42) { TR.ev['burst' + i] = 0; csBrickBurst(i, 1); }
}

/* ---- زیرنویس‌های فاز ۱ هر فصل ---- */
const SUBS_INTRO1 = [
  [0.4, 2.0, 'زمین می‌لرزه... برجِ محله داره ترک می‌خوره!'],
  [2.1, 3.5, 'طبقه‌ی اول فرو می‌ریزه!'],
  [3.7, 5.0, 'طبقه‌ی دوم هم...!'],
  [5.3, 5.9, 'بام می‌لغزه — بپر!'],
  [6.2, 6.9, '— [ارشان]: ماشین! سوار شو!'],
  [7.0, 7.7, '— [ارشان]: زامبی‌ها ماشین رو گرفتن... در رو باز کردم، بزن بیرون و کنار ماشین بدو!'],
];
const SUBS_INTRO2 = [
  [0.4, 1.6, 'صدای پای گله‌ی بزرگ میاد...'],
  [2.0, 3.4, '— [ارشان]: دیوار انبار منفجر شد! سردابه‌ش بازه — یه تونلِ زیرزمینی!'],
  [3.6, 4.4, '— [ارشان]: برو تو! من پشتتم!'],
  [4.6, 5.6, 'تاریکیِ تونل... فقط صدای نفسِ خودت...'],
];
const SUBS_INTRO3 = [
  [0.4, 1.8, 'گلوله‌بارانِ پاسگاه شروع شده...'],
  [2.0, 3.6, '— [ارشان]: قشونِ زامبی‌ها رسیگه! زیپ‌لاین رو ببین — تا برج مخابراتی!'],
  [3.8, 4.6, '— [ارشان]: بالا بپر! سکوش آماده‌ست!'],
  [4.8, 5.7, 'قلاب رو چسبوندی؟ نفس عمیق...'],
  [5.9, 6.6, '— [ارشان]: بروووو!'],
];

/* ---- فاز ۱ فصل ۱→۲: فروریختن منطقیِ کندِ طبقه‌طبقه + ماشین ---- */
function introUpdate1(dt) {
  const t = TR.t;
  const F = CS.draw.floors;
  state.shake = Math.max(state.shake, Math.min(9, t * 3.4));
  CS.draw.cracks = clamp(t / 2.0, 0, 1);
  if (Math.random() < dt * 12) {
    spawnParticles(TOWER.x + rand(-58, 58), GROUND_Y - rand(20, 180), 1,
      'rgba(170,150,120,0.4)', { speed: 28, life: 1.3, size: 3, grav: -18 });
  }
  /* طبقه‌ی اول: ۲٫۰ تا ۳٫۶ — خرد/محو + نشستن طبقه‌های بالا */
  if (t >= 2.0 && t < 3.6) {
    if (!TR.ev.b1) { TR.ev.b1 = 1; SFX.csBoom(); state.shake = 12; }
    F[0].a = clamp(1 - (t - 2.0) / 1.6, 0, 1);
    F[1].dy = (t - 2.0) / 1.6 * 40;
    F[2].dy = F[1].dy;
    brickBurstStep(0, dt);
  }
  /* طبقه‌ی دوم: ۳٫۶ تا ۵٫۲ */
  if (t >= 3.6 && t < 5.2) {
    if (!TR.ev.b2) { TR.ev.b2 = 1; SFX.csBoom(); state.shake = 12; }
    F[1].a = clamp(1 - (t - 3.6) / 1.6, 0, 1);
    F[2].dy = 40 + (t - 3.6) / 1.6 * 38;
    brickBurstStep(1, dt);
  }
  CS.draw.rubble = clamp((t - 2.0) / 3.4, 0, 1);
  /* بازیکن روی بامِ نشسته */
  if (t < 5.2) {
    CS.draw.player = { x: TOWER.x, y: TOWER_TOP_Y + F[2].dy, aim: -0.9 };
  } else if (t < 5.9) {
    /* بام می‌لغزد و بازیکن جهش قوسی می‌زند */
    F[2].rot = clamp((t - 5.2) / 1.4, 0, 1) * 0.42;
    const k = clamp((t - 5.2) / 0.7, 0, 1);
    CS.draw.player = {
      x: TOWER.x - k * 66,
      y: TOWER_TOP_Y + 40 - Math.sin(k * Math.PI) * 66 + k * 28,
      rot: -k * 0.8, aim: -1.2,
    };
    if (!TR.ev.whistle) { TR.ev.whistle = 1; SFX.csWhistle(); }
  }
  /* ماشین ارشان از چپ می‌رسد */
  if (t >= 4.2) {
    const cx = clamp(-170 + (t - 4.2) * 240, -170, 316);
    CS.car = { x: cx, y: GROUND_Y + 8, kick: 0, spin: t * 9, hand: t < 5.9 ? 1 : 0 };
    if (!TR.ev.engine) { TR.ev.engine = 1; SFX.csEngine(); }
  }
  /* فرود روی ماشین */
  if (t >= 5.9) {
    CS.draw.player = { x: 330, y: GROUND_Y + 8 - 57, aim: 0.2 };
    if (!TR.ev.landed) { TR.ev.landed = 1; SFX.csLand(); state.shake = 5; }
  }
  /* محو به سیاهی قبل از مینی‌گیم */
  if (t >= 7.2) TR.fade = clamp((t - 7.2) / 0.55, 0, 1);
  setTimedSubs(SUBS_INTRO1, t);
}

/* ---- فاز ۱ فصل ۲→۳: محاصره + انفجار دیوار + درِ سردابه ---- */
function introUpdate2(dt) {
  const t = TR.t;
  /* گله از دو طرف می‌آید */
  if (t < 2.2 && Math.random() < dt * 5.2) {
    const type = Math.random() < 0.3 ? 'fast' : 'normal';
    CS.zombies.push(makeCsWalkZombie(type, Math.random() < 0.5 ? -40 : W + 40));
  }
  csWalkStep(dt);
  /* انفجار دیوار سمت چپ */
  if (!TR.ev.boom && t >= 1.8) {
    TR.ev.boom = 1;
    SFX.csBoom();
    state.shake = 13; state.flash = 0.9;
    spawnParticles(200, GROUND_Y - 34, 34, '#ff9a3d', { speed: 300, life: 0.8, size: 3.4, grav: 320 });
    spawnParticles(200, GROUND_Y - 28, 20, '#454a52', { speed: 170, life: 1.5, size: 4.2, grav: -22 });
  }
  /* بازیکن: روی برج → جهش به درِ سردابه */
  if (t < 3.6) {
    CS.draw.player = { x: TOWER.x, y: TOWER_TOP_Y, aim: -2.3 };
  } else {
    const k = clamp((t - 3.6) / 0.9, 0, 1);
    CS.draw.player = {
      x: TOWER.x - (TOWER.x - 200) * k,
      y: TOWER_TOP_Y + (GROUND_Y - 6 - TOWER_TOP_Y) * k * k,
      rot: k * 1.1, aim: -2.7,
    };
    if (k >= 1 && !TR.ev.hatch) {
      TR.ev.hatch = 1;
      SFX.csLand();
      spawnParticles(200, GROUND_Y, 10, '#7a6a4c', { speed: 100, life: 0.5, size: 2.4, grav: 350, up: true });
    }
  }
  if (t >= 5.6) TR.fade = clamp((t - 5.6) / 0.7, 0, 1);
  setTimedSubs(SUBS_INTRO2, t);
}

/* ---- فاز ۱ فصل ۳→۴: گلوله‌باران + دکل زیپ‌لاین ---- */
function introUpdate3(dt) {
  const t = TR.t;
  /* گلوله‌باران پس‌زمینه */
  if (Math.random() < dt * 1.5) {
    const bx = rand(60, W - 60), by = rand(60, GROUND_Y - 130);
    spawnParticles(bx, by, 10, '#ff9a3d', { speed: 190, life: 0.6, size: 3, grav: 60 });
    spawnParticles(bx, by, 6, '#454a52', { speed: 80, life: 1.7, size: 4.2, grav: -12 });
    state.shake = Math.max(state.shake, 3);
    if (Math.random() < 0.35) SFX.csBoom();
  }
  /* هجوم بزرگ */
  if (t < 2.4 && Math.random() < dt * 6) {
    const r = Math.random();
    CS.zombies.push(makeCsWalkZombie(r < 0.22 ? 'tank' : (r < 0.55 ? 'fast' : 'normal'),
      Math.random() < 0.5 ? -40 : W + 40));
  }
  csWalkStep(dt);
  /* بازیکن: برج → جهش به سکوی دکل → چسبیدن به کابل */
  if (t < 4.0) {
    CS.draw.player = { x: TOWER.x, y: TOWER_TOP_Y, aim: 0.5 };
  } else if (t < 5.0) {
    const k = clamp((t - 4.0) / 0.85, 0, 1);
    CS.draw.player = {
      x: TOWER.x + (772 - TOWER.x) * k,
      y: TOWER_TOP_Y - Math.sin(k * Math.PI) * 84 + (GROUND_Y - 150 - TOWER_TOP_Y) * k,
      rot: 0.4, aim: 0.3,
    };
    if (!TR.ev.jumpSfx) { TR.ev.jumpSfx = 1; SFX.csWhoosh(); }
  } else {
    CS.draw.player = { x: 772, y: GROUND_Y - 150, aim: 0 };
    if (!TR.ev.clamp) { TR.ev.clamp = 1; SFX.click(); }
  }
  if (t >= 6.0) TR.fade = clamp((t - 6.0) / 0.65, 0, 1);
  setTimedSubs(SUBS_INTRO3, t);
}

/* اسباب فاز ۱ که روی میدان بازی رسم می‌شود (از drawChapterProps صدا زده می‌شود) */
function drawTransitionIntroProps() {
  if (!TR || TR.phase !== 1 || !CS) return;
  const d = state.dayness;
  if (TR.ch === 2 && TR.ev.boom) {
    /* درِ سردابه‌ی باز + نور گرمش */
    const hx = 200, hy = GROUND_Y;
    ctx.fillStyle = '#14100a';
    rr(hx - 34, hy - 12, 68, 12, 3); ctx.fill();
    ctx.fillStyle = '#3a2c14';
    ctx.save(); ctx.translate(hx, hy - 12);
    ctx.rotate(-0.5);
    rr(0, -5, 40, 10, 3); ctx.fill();
    ctx.restore();
    const glow = ctx.createRadialGradient(hx, hy - 12, 4, hx, hy - 12, 48);
    glow.addColorStop(0, 'rgba(255,200,110,' + (0.34 + 0.12 * Math.sin(animTime * 3)).toFixed(2) + ')');
    glow.addColorStop(1, 'rgba(255,200,110,0)');
    ctx.fillStyle = glow; circle(hx, hy - 12, 48);
  }
  if (TR.ch === 3) {
    /* دکل زیپ‌لاین + سکو + کابل به بیرونِ راست */
    const mx = 772, my = GROUND_Y;
    ctx.strokeStyle = mixHex('#2c3038', '#6a7078', d); ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mx - 14, my); ctx.lineTo(mx, my - 150);
    ctx.moveTo(mx + 14, my); ctx.lineTo(mx, my - 150);
    ctx.stroke();
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(mx - 12, my - 44); ctx.lineTo(mx + 12, my - 44);
    ctx.moveTo(mx - 9, my - 94); ctx.lineTo(mx + 9, my - 94);
    ctx.stroke();
    ctx.fillStyle = mixHex('#3a4048', '#7d8890', d);
    rr(mx - 18, my - 158, 36, 8, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(200,210,220,0.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(mx + 10, my - 152);
    ctx.quadraticCurveTo((mx + W) / 2, my - 178, W + 30, my - 168);
    ctx.stroke();
  }
}

/* ---------------------- ۷-۳) فاز ۲ — موتور مینی‌گیم فرار ---------------------- */
/* انواع موانع: «پرش» = باید بپری • «خم» = باید زیرش خم شوی */
const OBTYPE = {
  rubble: 'jump', pothole: 'jump', grabber: 'jump', barrel: 'jump', pit: 'jump', pylon: 'jump',
  sign: 'duck', beam: 'duck', flyer: 'duck',
};

const MG = {
  cfg: null, scroll: 0, speed: 0, obs: [], nextObs: 520,
  pl: { y: 0, vy: 0, duck: false, ground: true, inv: 0, run: 0 },
  hits: 0, hidden: null, hidePlayer: false, outroPlayer: null, t2: 0,
  reset(cfg) {
    this.cfg = cfg;
    this.scroll = 0; this.speed = cfg.speed0;
    this.obs = []; this.nextObs = 560;
    this.pl = { y: 0, vy: 0, duck: false, ground: true, inv: 0, run: 0 };
    this.hits = 0;
    this.hidePlayer = false;
    this.outroPlayer = null;
    this.t2 = 0;
    this.hidden = { x: cfg.goalM * PXM * cfg.hidden.at, id: cfg.hidden.id, floatY: cfg.hidden.floatY, got: false };
    for (const s of cfg.subs) s.done = false;
  },
};

/* ورودی مینی‌گیم (از listener های بخش ۲) */
function mgJump() {
  if (!TR || TR.phase !== 2) return;
  const pl = MG.pl;
  if (pl.ground) {
    pl.ground = false;
    pl.vy = MG.cfg.jumpV;
    SFX.csWhoosh();
  }
}
function mgDuck(on) { if (TR && TR.phase === 2) mgKeys.duck = !!on; }
function mgNudge(d) {
  if (!TR || TR.phase !== 2) return;
  mgKeys.left = d < 0;
  mgKeys.right = d > 0;
}

/* شروع فاز ۲ */
function mgBegin() {
  TR.phase = 2;
  TR.t = 0;
  TR.fade = 1;                       // با سیاهی کوتاه شروع می‌شود
  TR.fadeWhite = false;
  DLG.skip();                        // (۱۱٫۰) گفتگوی فاز ۱ حتماً بسته شود
  MG.reset(MGCFG[TR.ch]);
  setTransSub(MGCFG[TR.ch].startSub, 3.2);
  const b = TR_BARKS[TR.ch];         // (۱۱٫۰) صدای شروع مینی‌گیم
  if (b && b.start) transBark(b.start, MGCFG[TR.ch].startSub, 3.4);
}

function mgUpdate(dt) {
  const cfg = MG.cfg;
  TR.fade = Math.max(0, TR.fade - dt * 1.9);
  MG.t2 += dt;

  /* سرعت: رشد خودکار + فرمان ←/→ */
  let nudge = 0;
  if (mgKeys.left) nudge = -1;
  else if (mgKeys.right) nudge = 1;
  MG.speed = clamp(MG.speed + (cfg.accel + nudge * 210) * dt, cfg.speedMin, cfg.speedMax);
  MG.scroll += MG.speed * dt;

  /* فیزیک بازیکن */
  const pl = MG.pl;
  pl.inv = Math.max(0, pl.inv - dt);
  if (!pl.ground) {
    pl.vy += cfg.grav * dt;
    pl.y += pl.vy * dt;
    if (pl.y >= 0) {
      pl.y = 0; pl.vy = 0; pl.ground = true;
      SFX.csThud();
      spawnParticles(360, cfg.baseY, 5, '#8a7a5c', { speed: 70, life: 0.35, size: 2, grav: 300, up: true });
    }
  }
  pl.duck = !!mgKeys.duck && pl.ground;
  pl.run += dt * (7 + MG.speed * 0.013);

  /* تولید موانع تا جلوتر از صفحه */
  while (MG.nextObs < MG.scroll + W + 160) {
    const type = cfg.obstacles[irand(0, cfg.obstacles.length - 1)];
    MG.obs.push({ wx: MG.nextObs, type, hit: false });
    MG.nextObs += rand(cfg.obsGap[0], cfg.obsGap[1]) + MG.speed * 0.3;
  }

  /* برخورد: بازیکن روی x=۳۶۰ صفحه است */
  const PX = 360;
  for (const o of MG.obs) {
    if (o.hit) continue;
    const sx = o.wx - MG.scroll;
    if (sx < -140) { o.hit = true; continue; }         // رد شد
    if (Math.abs(sx - PX) < 25 && pl.inv <= 0) {
      const need = OBTYPE[o.type];
      if ((need === 'jump' && pl.y > -36) || (need === 'jumpclear' && pl.y > -36) ||
          (need === 'duck' && !pl.duck)) {
        mgHit(o);
      }
    }
  }

  /* آیتم مخفی: در اوج پرش قابل برداشتن است (پاداش دقت) */
  const H = MG.hidden;
  if (H && !H.got) {
    const sx = H.x - MG.scroll;
    if (Math.abs(sx - PX) < 34 && pl.y < -52) {
      H.got = true;
      giveItem(H.id);
      SFX.csGift();
      setTransSub('💎 آیتم مخفی پیدا شد! (' + (GEAR[H.id] || RARE[H.id]).name + ')', 2.6);
      spawnParticles(PX, cfg.baseY + pl.y - 40, 22, (GEAR[H.id] || RARE[H.id]).color,
        { speed: 190, life: 0.8, size: 2.8, grav: 260 });
    }
  }

  /* مصرف باتری چراغ‌قوه در تونل */
  if (cfg.battDrain && state.torch.owned && state.torch.battery > 0) {
    state.torch.battery = Math.max(0, state.torch.battery - cfg.battDrain * dt);
    if (state.torch.battery <= 0) setTransSub('🔋 باتری چراغ‌قوه تمام شد... پابه‌پا برو!', 2.2);
  }

  /* خط‌های رادیویی ارشان */
  for (const s of cfg.subs) {
    if (!s.done && MG.scroll / PXM >= s.atM) {
      s.done = true;
      setTransSub(s.txt, s.dur || 3);
      SFX.peddler();
    }
  }

  /* پایان مسیر → فاز ۳ */
  if (MG.scroll >= cfg.goalM * PXM) mgOutro();
}

/* برخورد با مانع: سرعت می‌گیرد + لرزش + جرقه */
function mgHit(o) {
  o.hit = true;
  MG.hits++;
  MG.pl.inv = 1.15;
  MG.speed = Math.max(MG.cfg.speedMin, MG.speed * 0.7);
  state.shake = 7;
  state.flash = 0.75;
  SFX.csThud();
  spawnParticles(360, MG.cfg.baseY - 22, 12, '#e06a5a', { speed: 160, life: 0.5, size: 2.6, grav: 420 });
  setTransSub(MG.cfg.hitSubs[irand(0, MG.cfg.hitSubs.length - 1)], 1.5);
}

/* شروع فاز ۳ */
function mgOutro() {
  TR.phase = 3;
  TR.t = 0;
  TR.ev = {};
  MG.obs = [];
  setTransSub(MGCFG[TR.ch].outroSub, 2.6);
  SFX.clear();
  const b = TR_BARKS[TR.ch];         // (۱۱٫۰) صدای پایان فرار
  if (b && b.outro) transBark(b.outro, MGCFG[TR.ch].outroSub, 3.2);
}

/* فاز ۳ مشترک: حرکت خودکار + محوِ پایانی */
function mgOutroUpdate(dt) {
  const cfg = MG.cfg;
  MG.scroll += Math.min(MG.speed + 130, cfg.speedMax + 170) * dt;
  MG.pl.run += dt * 12;
  MG.pl.ground = true;
  MG.pl.y = 0;
  cfg.outroUpdate && cfg.outroUpdate(dt);
  TR.fade = Math.max(TR.fade, clamp((TR.t - (cfg.outroDur - 1.15)) / 1.0, 0, 1));
}

/* ---------------------- ۷-۴) حلقه به‌روزرسانی انتقال ---------------------- */
function updateTransition(dt) {
  if (!TR || TR._paused) return;
  TR.t += dt;
  /* زیرنویس/لرزش/فلش مشترک */
  if (TR.subT > 0) TR.subT -= dt;
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  state.comboPop = Math.max(0, state.comboPop - dt);

  if (TR.phase === 1) {
    DLG.update(dt);                                     // (۱۱٫۰) گفتگوی صوتی
    if (TR.ch === 1) introUpdate1(dt);
    else if (TR.ch === 2) introUpdate2(dt);
    else introUpdate3(dt);
    /* (۱۱٫۰) لحظه‌ی گرفتن بازیکن توسط ماشین ارشان (چ۱) / جهش زیپ‌لاین (چ۳) */
    const b = TR_BARKS[TR.ch];
    if (b && b.catch && !TR.ev.catchBark && TR.t > (TR.ch === 1 ? 4.9 : 4.2)) {
      TR.ev.catchBark = true;
      transBark(b.catch, TR.ch === 1 ? '— [ارشان]: گرفتمت! محکم خودت رو بگیر!' : '— [ارشان]: دیوونه‌ی زنده! برو! من پشتتم!', 2.6);
    }
    if (TR.t >= TRCFG[TR.ch].introDur) mgBegin();
  } else if (TR.phase === 2) {
    mgUpdate(dt);
  } else {
    mgOutroUpdate(dt);
    if (TR.t >= MG.cfg.outroDur) finishTransition();
  }
  updateParticles(dt);
  updateTexts(dt);
}

/* زمان‌بندی فاز ۱ هر فصل (فاز ۳ در MGCFG.outroDur) */
const TRCFG = {
  1: { introDur: 7.9 },
  2: { introDur: 6.6 },
  3: { introDur: 6.9 },
};

/* ---------------------- ۷-۵) رندر انتقال ---------------------- */
/* فاز ۱ = صحنه‌ی عادی بازی + شبه‌کات‌سین؛ فاز ۲/۳ = صحنه‌ی اختصاصی مینی‌گیم */
function renderTransition() {
  if (!TR) return;
  if (TR.phase === 1) return;                 // رندر عادی + CS
  renderMG();
}

/* بازیکنِ دونده (پرش/خم/آویزان) — رسم مشترک هر سه تم */
function drawRunner(x, gy, mode) {
  const pl = MG.pl;
  const hang = mode === 'hang';
  const duck = pl.duck;
  if (!hang) {
    const sh = clamp(1 + pl.y / 170, 0.35, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath(); ctx.ellipse(x, gy + 3, 13 * sh, 4 * sh, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save();
  ctx.translate(x, gy + pl.y + (hang && duck ? 22 : 0));
  if (duck && !hang) ctx.scale(1, 0.7);
  if (MG.outroPlayer && MG.outroPlayer.rot) ctx.rotate(MG.outroPlayer.rot);
  const run = pl.run;
  const legA = pl.ground && !duck ? Math.sin(run) * 13 : (duck ? 4 : -7);
  /* پاها */
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  if (hang) {
    ctx.moveTo(0, -14); ctx.lineTo(-4 + Math.sin(run * 0.7) * 3, 9);
    ctx.moveTo(0, -14); ctx.lineTo(5 - Math.sin(run * 0.7) * 3, 9);
  } else {
    ctx.moveTo(-3, -13); ctx.lineTo(-3 + legA, -1);
    ctx.moveTo(3, -13); ctx.lineTo(3 - legA, -1);
  }
  ctx.stroke();
  /* بدن + کوله پشتی */
  ctx.fillStyle = '#3d6db5'; rr(-8, -27, 16, 16, 5); ctx.fill();
  ctx.fillStyle = '#26324d'; ctx.fillRect(-8, -14, 16, 3);
  ctx.fillStyle = '#6a4a2c'; rr(-14, -26, 6, 11, 2); ctx.fill();
  /* سر */
  ctx.fillStyle = '#f0c49a'; circle(2, -32, 6);
  ctx.fillStyle = '#5a3d28';
  ctx.beginPath(); ctx.arc(2, -32, 6, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1d2433'; circle(4.4, -33, 1.1); circle(0.8, -33, 1.1);
  /* بازوها */
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
  ctx.beginPath();
  if (hang) {
    ctx.moveTo(-3, -24); ctx.lineTo(1, -41);
    ctx.moveTo(4, -24); ctx.lineTo(7, -41);
  } else if (!pl.ground) {
    ctx.moveTo(-4, -24); ctx.lineTo(-12, -34);
    ctx.moveTo(4, -24); ctx.lineTo(12, -34);
  } else {
    ctx.moveTo(-3, -24); ctx.lineTo(-3 - legA * 0.7, -16);
    ctx.moveTo(4, -24); ctx.lineTo(4 + legA * 0.7, -16);
  }
  ctx.stroke();
  /* اسلحه روی شانه */
  ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(9, -31); ctx.stroke();
  ctx.restore();
  /* چراغ‌قوه به کمر (اگر دارد) */
  if (state.torch.owned) {
    ctx.fillStyle = state.torch.on ? '#ffe9a0' : '#8a7a50';
    circle(x - 12, gy + pl.y - 18 + (hang && duck ? 22 : 0), 2.6);
  }
}

/* آیتم مخفی: جعبه‌ی کوچک درخشان معلق */
function drawHiddenPickup(sx, sy, id) {
  const def = GEAR[id] || RARE[id];
  const col = (def && def.color) || '#ffd873';
  ctx.save();
  ctx.translate(sx, sy + Math.sin(animTime * 2.6) * 5);
  const g2 = ctx.createRadialGradient(0, 0, 3, 0, 0, 30);
  g2.addColorStop(0, hexA(col, 0.5)); g2.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g2; circle(0, 0, 30);
  ctx.fillStyle = '#2c3440'; rr(-11, -10, 22, 20, 3); ctx.fill();
  ctx.fillStyle = col; rr(-8, -7, 16, 14, 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; circle(-3, -3, 2);
  ctx.restore();
}

/* ---------------------- ۷-۶) تم‌های مینی‌گیم ---------------------- */
/* === تم جاده (فصل ۱→۲): دویدن کنار ماشین ارشان === */
function roadBG(scroll, gy) {
  const g = ctx.createLinearGradient(0, -20, 0, gy);
  g.addColorStop(0, '#050a18'); g.addColorStop(0.55, '#0d1834'); g.addColorStop(1, '#1c2a4e');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, gy + 20);
  ctx.fillStyle = '#efe6c4'; circle(118, 62, 25);
  ctx.fillStyle = 'rgba(120,110,80,0.22)'; circle(110, 56, 5); circle(126, 70, 3.4);
  /* افق شهر با پارالاکس کند */
  const m = W + 80, off = scroll * 0.16;
  ctx.fillStyle = '#0b1226';
  for (const b of SKYLINE) {
    const sx = (((b.x - off) % m) + m) % m - 40;
    ctx.fillRect(sx, gy - b.h * 0.66, b.w, b.h * 0.66);
  }
  /* جاده */
  const rg = ctx.createLinearGradient(0, gy, 0, H);
  rg.addColorStop(0, '#23262c'); rg.addColorStop(1, '#14161b');
  ctx.fillStyle = rg; ctx.fillRect(-20, gy, W + 40, H - gy + 20);
  ctx.fillStyle = '#2e3238'; ctx.fillRect(-20, gy, W + 40, 5);
  ctx.fillStyle = 'rgba(245,205,90,0.9)';
  const dash = 46, gap = 34, mm = dash + gap, ph = scroll % mm;
  for (let x = -mm; x < W + mm; x += mm) { rr(x + ph, gy + 18, dash, 6, 3); ctx.fill(); }
  /* اجزای کنار جاده (درخت/چراغ/بوته/سنگ — از بخش رانندگی ۸٫۰) */
  for (const p of DRIVE_PROPS) {
    const sx = p.wx - scroll * 0.98;
    if (sx > -90 && sx < W + 90) drawRoadProp(p, sx);
  }
}
function roadObs(o, sx, gy) {
  const d = 0;
  if (o.type === 'rubble') {
    ctx.fillStyle = '#6e5a44';
    rr(sx - 20, gy - 26, 40, 26, 3); ctx.fill();
    ctx.fillStyle = '#8a6f52';
    ctx.fillRect(sx - 14, gy - 34, 16, 9); ctx.fillRect(sx + 2, gy - 30, 12, 7);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.2;
    ctx.strokeRect(sx - 20, gy - 26, 40, 26);
    ctx.beginPath(); ctx.moveTo(sx - 6, gy - 26); ctx.lineTo(sx - 2, gy - 34); ctx.stroke();
  } else if (o.type === 'pothole') {
    ctx.fillStyle = '#0a0b0e';
    ctx.beginPath(); ctx.ellipse(sx, gy + 6, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, gy + 6, 26, 9, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#2c3038';
    for (const dx of [-18, 12]) ctx.fillRect(sx + dx, gy - 4, 8, 5);
  } else if (o.type === 'grabber') {
    /* زامبی یورغ‌زننده از کانال — باید از رویش بپری */
    ctx.save();
    ctx.translate(sx, gy);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 2, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
    const lun = Math.sin(animTime * 8) * 4;
    ctx.scale(-1, 1);
    ctx.strokeStyle = '#7fa657'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(-6, -1); ctx.moveTo(3, -12); ctx.lineTo(6, -1); ctx.stroke();
    ctx.fillStyle = '#4a5d73'; rr(-8, -28, 16, 17, 4); ctx.fill();
    ctx.strokeStyle = '#7fa657'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-4, -24); ctx.lineTo(12, -30 - lun); ctx.moveTo(4, -24); ctx.lineTo(13, -24 + lun); ctx.stroke();
    ctx.fillStyle = '#7fa657'; circle(2, -33, 6.4);
    ctx.save(); ctx.shadowColor = '#ff4b3e'; ctx.shadowBlur = 5;
    ctx.fillStyle = '#ff4b3e'; circle(4.5, -34, 1.5); circle(7.6, -34.5, 1.5); ctx.restore();
    ctx.restore();
  } else if (o.type === 'sign') {
    /* تابلوی افتاده — از زیرش رد شو (خم شو) */
    ctx.strokeStyle = '#4a4a52'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx - 34, gy); ctx.lineTo(sx - 22, gy - 44); ctx.stroke();
    ctx.fillStyle = '#2c3f70';
    ctx.save();
    ctx.translate(sx - 22, gy - 44);
    ctx.rotate(0.28);
    rr(0, -16, 58, 22, 3); ctx.fill();
    ctx.fillStyle = '#ffd873'; ctx.fillRect(6, -10, 40, 3.5);
    ctx.fillStyle = '#8fa3cf'; ctx.fillRect(6, -4, 28, 3);
    ctx.restore();
    ctx.strokeStyle = '#ffb03c'; ctx.lineWidth = 2;    // هشدار
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(sx - 8, gy - 52); ctx.lineTo(sx + 12, gy - 44); ctx.stroke();
    ctx.setLineDash([]);
  }
}
function roadProps(scroll, gy) {
  /* ماشین ارشان جلوتر — چرخ‌ها با اسکرول می‌چرخند */
  const carX = 612 + (TR.phase === 3 ? Math.max(0, TR.t - 0.5) * 250 : Math.sin(animTime * 0.8) * 6);
  drawCar({ x: carX, y: gy + 8, kick: 0, spin: scroll * 0.055, hand: 0 });
  /* دود اگزوز */
  if (Math.random() < 0.16) {
    spawnParticles(carX - 78, gy - 10, 1, 'rgba(120,120,130,0.4)',
      { speed: 26, life: 0.9, size: 3.2, grav: -16 });
  }
  /* دو زامبی تعقیب‌کننده پشت سر */
  for (const [zx, sp] of [[102, 1], [58, 0.8]]) {
    const z = {
      type: 'normal', x: zx, y: gy + 4, dir: 1, radius: 15,
      walkPhase: animTime * 6 * sp, attacking: false, attackAnim: 0,
      attackSide: 0, lane: 0, depth: 1, yJit: 0, stagger: 0, chill: 0,
      hitFlash: 0, dead: false, deathT: 0,
    };
    drawZombie(z);
  }
}
function roadOutroUpdate(dt) {
  /* پرش به ماشین و رفتن */
  if (TR.t >= 1.3 && !TR.ev.inCar) {
    TR.ev.inCar = 1;
    MG.hidePlayer = true;
    SFX.csLand();
    spawnParticles(612, GROUND_Y - 40, 10, '#c9b38a', { speed: 120, life: 0.5, size: 2.4, grav: 300 });
  }
}
function roadOutroDraw(gy) {
  if (TR.t > 0.6 && TR.t < 1.6) {
    /* جهش بازیکن به ماشین */
    const k = clamp((TR.t - 0.6) / 0.7, 0, 1);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(360 + (612 - 360) * k, gy - 20 - Math.sin(k * Math.PI) * 64 + k * 10);
    ctx.rotate(k * 0.5);
    ctx.fillStyle = '#3d6db5'; rr(-8, -20, 16, 16, 5); ctx.fill();
    ctx.fillStyle = '#f0c49a'; circle(2, -25, 6);
    ctx.restore();
  }
}

/* === تم تونل (فصل ۲→۳): تاریکی + فقط نور چراغ‌قوه === */
function tunnelBG(scroll, gy) {
  ctx.fillStyle = '#020309';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  /* قوس‌های تونل */
  const spacing = 200, off = scroll * 0.85;
  ctx.strokeStyle = '#161e2c'; ctx.lineWidth = 5;
  for (let i = -1; i < W / spacing + 2; i++) {
    const sx = i * spacing - (off % spacing);
    ctx.beginPath();
    ctx.moveTo(sx - 46, H);
    ctx.quadraticCurveTo(sx - 46, gy - 155, sx, gy - 155);
    ctx.quadraticCurveTo(sx + 46, gy - 155, sx + 46, H);
    ctx.stroke();
  }
  /* کف تونل + ریل */
  ctx.fillStyle = '#0b0e15'; ctx.fillRect(-20, gy, W + 40, H - gy + 20);
  ctx.strokeStyle = '#1e2836'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-20, gy + 20); ctx.lineTo(W + 20, gy + 20); ctx.stroke();
  ctx.fillStyle = '#151d29';
  const ph = (scroll * 1.0) % 60;
  for (let x = -60; x < W + 60; x += 60) ctx.fillRect(x + ph, gy + 34, 26, 4);
  /* لوله‌های بالای تونل */
  ctx.strokeStyle = '#131a26'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-20, gy - 148); ctx.lineTo(W + 20, gy - 148); ctx.stroke();
  ctx.strokeStyle = '#1b2534'; ctx.lineWidth = 2;
  for (let x = -40 - (scroll * 0.85 % 90); x < W + 40; x += 90) {
    ctx.beginPath(); ctx.moveTo(x, gy - 148); ctx.lineTo(x, gy - 160); ctx.stroke();
  }
}
function tunnelObs(o, sx, gy) {
  if (o.type === 'pit') {
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(sx, gy + 5, 25, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#232c3c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, gy + 5, 25, 8, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (o.type === 'barrel') {
    ctx.fillStyle = '#3a3038';
    rr(sx - 13, gy - 28, 26, 28, 4); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(sx - 13, gy - 19, 26, 3);
    ctx.fillStyle = '#e8a13c';
    ctx.fillRect(sx - 13, gy - 24, 26, 4);          // نوار خطر
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.2;
    rr(sx - 13, gy - 28, 26, 28, 4); ctx.stroke();
  } else if (o.type === 'beam') {
    /* تیرآهن فولادی — خم شو! */
    ctx.fillStyle = '#2c3440';
    ctx.fillRect(sx - 30, gy - 62, 60, 16);
    ctx.fillStyle = '#3a4452';
    ctx.fillRect(sx - 30, gy - 62, 60, 4);
    ctx.fillStyle = '#ffb03c';                       // راه‌راه هشدار
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 26 + i * 12, gy - 54, 7, 6);
    ctx.strokeStyle = '#1a2028'; ctx.lineWidth = 2;
    ctx.strokeRect(sx - 30, gy - 62, 60, 16);
    /* مهارهای کناری */
    ctx.strokeStyle = '#232c3c'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 28, gy - 46); ctx.lineTo(sx - 34, gy);
    ctx.moveTo(sx + 28, gy - 46); ctx.lineTo(sx + 34, gy);
    ctx.stroke();
  }
}
function tunnelProps(scroll, gy) {
  /* ارشان با فانوس جلوتر (سایه‌ی روشن) */
  ctx.save();
  ctx.translate(560, gy);
  const lg = ctx.createRadialGradient(0, -26, 3, 0, -26, 54);
  lg.addColorStop(0, 'rgba(255,210,130,0.20)'); lg.addColorStop(1, 'rgba(255,210,130,0)');
  ctx.fillStyle = lg; circle(0, -26, 54);
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const run = animTime * 9;
  ctx.beginPath();
  ctx.moveTo(-3, -13); ctx.lineTo(-3 + Math.sin(run) * 10, -1);
  ctx.moveTo(3, -13); ctx.lineTo(3 - Math.sin(run) * 10, -1);
  ctx.stroke();
  ctx.fillStyle = '#4a7a4a'; rr(-8, -28, 16, 16, 5); ctx.fill();     // کاپشن سبز ارشان
  ctx.fillStyle = '#f0c49a'; circle(2, -33, 6);
  ctx.fillStyle = '#7a2a2a';
  ctx.beginPath(); ctx.arc(2, -33, 6.2, Math.PI, Math.PI * 2); ctx.fill();  // کلاه قرمز
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(4, -24); ctx.lineTo(13, -30); ctx.stroke();  // فانوس در دست
  ctx.fillStyle = '#ffd873';
  ctx.save(); ctx.shadowColor = '#ffd873'; ctx.shadowBlur = 8;
  circle(14, -31, 3.4); ctx.restore();
  ctx.restore();
}
function tunnelOutroUpdate(dt) {
  if (TR.t >= 1.4 && !TR.ev.run) {
    TR.ev.run = 1;
    setTransSub('— نورِ آخر تونل... بزن بیرون!', 2);
  }
}
function tunnelOutroDraw(gy) {
  /* چرخنده‌ی نور آخر تونل */
  const r = 30 + clamp(TR.t / 1.8, 0, 1) * 560;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g2 = ctx.createRadialGradient(W + 40, gy - 30, 10, W + 40, gy - 30, r);
  g2.addColorStop(0, 'rgba(255,250,235,0.95)');
  g2.addColorStop(0.4, 'rgba(255,240,210,0.5)');
  g2.addColorStop(1, 'rgba(255,240,210,0)');
  ctx.fillStyle = g2;
  circle(W + 40, gy - 30, r);
  ctx.restore();
}

/* === تم زیپ‌لاین (فصل ۳→۴): دره برفی و بارانی === */
function ziplineBG(scroll, gy) {
  const g = ctx.createLinearGradient(0, -20, 0, H);
  g.addColorStop(0, '#0a101e'); g.addColorStop(0.5, '#1a2438'); g.addColorStop(1, '#2c3a52');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  /* ابرهای تند طوفان */
  for (const c of CLOUDS) {
    const m = W + 300;
    const x = (((c.x - animTime * c.v * 2.2) % m) + m) % m - 150;
    ctx.fillStyle = 'rgba(16,22,36,0.85)';
    cloudBlob(x, c.y, c.s * 0.9, 'rgba(16,22,36,0.85)');
  }
  /* کوهستان دور (پارالاکس) */
  const off = scroll * 0.22;
  ctx.fillStyle = '#131b2c';
  ctx.beginPath(); ctx.moveTo(-20, gy + 60);
  for (let i = 0; i < 16; i++) {
    const x = i * 92 - (off % 92);
    ctx.lineTo(x + 46, gy - 44 - ((i * 41) % 66));
    ctx.lineTo(x + 92, gy + 34);
  }
  ctx.lineTo(W + 20, gy + 60); ctx.closePath(); ctx.fill();
  /* دره + رودخانه زیر پا */
  ctx.fillStyle = '#0b1220'; ctx.fillRect(-20, gy + 58, W + 40, H - gy);
  const wsh = Math.sin(animTime * 1.8) * 5;
  ctx.fillStyle = 'rgba(120,160,210,0.10)';
  ctx.fillRect(-20, gy + 84 + wsh, W + 40, 12);
  ctx.fillStyle = 'rgba(150,190,235,0.07)';
  ctx.fillRect(-20, gy + 96 - wsh, W + 40, 8);
  /* برف ریزان (تندتر از صحنه‌ی بازی) */
  for (const f of SNOW_FLAKES) {
    const m = W + 40;
    const x = (((f.x - animTime * 34) % m) + m) % m - 20 + Math.sin(animTime * f.sw + f.ph) * 20;
    const y = (f.y0 + animTime * f.v * 1.5) % (H + 24) - 12;
    ctx.fillStyle = 'rgba(235,244,252,0.8)';
    ctx.beginPath(); ctx.arc(x, y, f.r, 0, Math.PI * 2); ctx.fill();
  }
  /* کابل زیپ‌لاین (موج ملایم) */
  ctx.strokeStyle = 'rgba(205,215,228,0.85)'; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-20, gy - 38 + Math.sin(animTime * 1.3) * 2);
  ctx.quadraticCurveTo(W / 2, gy - 46, W + 20, gy - 40);
  ctx.stroke();
  /* مهارهای عمودی از دره تا کابل */
  const m2 = 340, ph2 = scroll % m2;
  ctx.strokeStyle = 'rgba(70,85,110,0.55)'; ctx.lineWidth = 2.6;
  for (let x = -m2; x < W + m2; x += m2) {
    const sx = x - ph2;
    ctx.beginPath(); ctx.moveTo(sx, gy - 40); ctx.lineTo(sx, gy + 60); ctx.stroke();
    ctx.fillStyle = 'rgba(70,85,110,0.55)';
    ctx.fillRect(sx - 5, gy + 54, 10, 8);
  }
}
function ziplineObs(o, sx, gy) {
  if (o.type === 'pylon') {
    /* تیرک شکسته از دره بالا آمده — بپر از رویش */
    ctx.strokeStyle = '#2e3a4e'; ctx.lineWidth = 7; ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(sx, gy + 56);
    ctx.lineTo(sx - 6, gy - 10);
    ctx.lineTo(sx + 4, gy - 34);
    ctx.stroke();
    ctx.strokeStyle = '#46536a'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 3, gy + 18); ctx.lineTo(sx + 7, gy - 6);
    ctx.moveTo(sx - 2, gy + 36); ctx.lineTo(sx - 9, gy + 10);
    ctx.stroke();
    ctx.fillStyle = '#ffb03c';
    circle(sx + 4, gy - 34, 3);                      // چراغ هشدار
  } else if (o.type === 'flyer') {
    /* زامبی پرنده — خم شو! */
    ctx.save();
    ctx.translate(sx, gy - 46);
    ctx.scale(-1, 1);
    const flap = Math.sin(animTime * 10) * 8;
    ctx.strokeStyle = '#7fa657'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2, -8); ctx.lineTo(-16, -8 - flap);    // بال‌های باز
    ctx.moveTo(2, -8); ctx.lineTo(15, -8 + flap * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#4a5d73'; rr(-8, -14, 16, 14, 4); ctx.fill();
    ctx.fillStyle = '#7fa657'; circle(3, -18, 6);
    ctx.save(); ctx.shadowColor = '#ff4b3e'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#ff4b3e'; circle(5, -19, 1.6); circle(8, -19.5, 1.6); ctx.restore();
    ctx.strokeStyle = '#7fa657'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-9, 8); ctx.moveTo(4, -2); ctx.lineTo(9, 8); ctx.stroke();
    ctx.restore();
    /* ردِ پرواز */
    ctx.strokeStyle = 'rgba(200,220,240,0.18)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(sx - 70, gy - 70); ctx.quadraticCurveTo(sx - 30, gy - 40, sx, gy - 46); ctx.stroke();
  }
}
function ziplineProps(scroll, gy) {
  /* دسته‌ی زیپ‌لاین روی کابل بالای بازیکن */
  ctx.fillStyle = '#3a4250';
  rr(352, gy - 46, 16, 10, 3); ctx.fill();
  ctx.fillStyle = '#ffb03c';
  circle(360, gy - 41, 2.2);
  /* جرقه‌ی اصطکاک کابل */
  if (Math.random() < 0.2) {
    spawnParticles(360 - MG.speed * 0.05, gy - 44, 1, '#ffd88a',
      { speed: 60, life: 0.3, size: 1.6, grav: 200 });
  }
}
function ziplineOutroUpdate(dt) {
  /* رها کردن کابل + فرود غلتکی روی برف */
  if (TR.t >= 0.45 && !TR.ev.release) {
    TR.ev.release = 1;
    SFX.csWhistle();
  }
  if (TR.ev.release) {
    const k = clamp((TR.t - 0.45) / 0.85, 0, 1);
    MG.outroPlayer = {
      x: 360 + k * 430,
      y: 330 + (470 - 330) * k * k,
      rot: k * Math.PI * 2.2,
    };
    if (k >= 1 && !TR.ev.landed) {
      TR.ev.landed = 1;
      MG.outroPlayer.y = 470;
      MG.outroPlayer.rot = 0;
      SFX.csLand();
      state.shake = 6;
      spawnParticles(790, 470, 22, 'rgba(235,244,252,0.9)', { speed: 190, life: 0.7, size: 2.8, grav: 240, up: true });
      setTransSub('— [ارشان]: رسیدیم... به آخرین برج.', 2.4);
    }
  }
}
function ziplineOutroDraw(gy) {
  /* سکوی مخابراتی مقصد در راست */
  ctx.fillStyle = '#2c3648';
  rr(836, 424, 120, 14, 3); ctx.fill();
  ctx.fillStyle = '#3a4254';
  ctx.fillRect(846, 438, 12, 44); ctx.fillRect(932, 438, 12, 44);
  /* دکل پس‌زمینه با چراغ قرمز */
  ctx.strokeStyle = '#243044'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(886, 424); ctx.lineTo(886, 316);
  ctx.moveTo(866, 424); ctx.lineTo(886, 348);
  ctx.moveTo(906, 424); ctx.lineTo(886, 348);
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = '#ff4b3e'; ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(255,75,62,' + (0.5 + 0.5 * Math.sin(animTime * 3)) + ')';
  circle(886, 314, 3);
  ctx.restore();
}

/* تاریکیِ تونل: فقط دایره‌ی نور چراغ‌قوه دور دونده */
function renderTunnelDark(gy) {
  const x = 360, y = gy + MG.pl.y - 24;
  let r;
  if (state.torch.owned && state.torch.on && state.torch.battery > 0) {
    r = 118 + 78 * state.torch.battery / 100;
  } else if (state.torch.owned) {
    r = 56;
  } else {
    r = 42;
  }
  r *= 0.92 + 0.08 * Math.sin(animTime * 19);
  /* بوم جدا برای تاریکی تونل — سوراخِ نور این‌جا زده می‌شود تا موانعِ داخل
     دایره‌ی نور دیده بمانند (destination-out مستقیم صحنه را هم پاک می‌کرد) */
  if (!Dark.cv) { Dark.cv = document.createElement('canvas'); Dark.cv.width = W; Dark.cv.height = H; }
  const c = Dark.cv.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  c.fillStyle = 'rgba(1,2,8,0.94)';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'destination-out';
  const g2 = c.createRadialGradient(x, y, r * 0.12, x, y, r);
  g2.addColorStop(0, 'rgba(0,0,0,0.98)');
  g2.addColorStop(0.6, 'rgba(0,0,0,0.5)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g2;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = 'source-over';
  ctx.drawImage(Dark.cv, 0, 0);
  /* گرمای نور روی خود بازیکن */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g3 = ctx.createRadialGradient(x, y, 2, x, y, Math.min(r, 72));
  g3.addColorStop(0, 'rgba(255,225,160,0.15)');
  g3.addColorStop(1, 'rgba(255,225,160,0)');
  ctx.fillStyle = g3;
  circle(x, y, Math.min(r, 72));
  ctx.restore();
}

/* ---------------------- ۷-۷) پیکربندی سه مینی‌گیم ---------------------- */
const MGCFG = {
  1: {
    theme: 'road', baseY: GROUND_Y,
    goalM: 240, speed0: 265, speedMin: 180, speedMax: 470, accel: 15,
    jumpV: -600, grav: 1500, obsGap: [330, 540],
    obstacles: ['rubble', 'grabber', 'pothole', 'sign', 'rubble', 'grabber'],
    hidden: { id: 'medkit', at: 0.45, floatY: -118 },
    battDrain: 0,
    startSub: '— [ارشان]: کنار ماشین بدو! سرعتت رو کم نکن!',
    outroDur: 3.4,
    outroSub: '— [ارشان]: انبارهای مه‌گرفته جلوته... بپر توی ماشین!',
    hitSubs: ['آخ! مواظب باش!', 'برخوردی! سرعت گیر کرد!', 'حواست کجاست؟!'],
    subs: [
      { atM: 62,  txt: '— [ارشان]: زامبی‌ها پشت سرمون‌ان! بدو!' },
      { atM: 118, txt: '— [تو]: نفس... نفس... هنوز کیلومتره؟!' },
      { atM: 176, txt: '— [ارشان]: جلو یه منطقه‌ی مه‌گرفته‌ست... برج بعدی همون‌جاست!' },
    ],
    drawBG: roadBG, drawObs: roadObs, drawProps: roadProps,
    outroUpdate: roadOutroUpdate, outroDraw: roadOutroDraw,
  },
  2: {
    theme: 'tunnel', baseY: 458,
    goalM: 200, speed0: 235, speedMin: 150, speedMax: 400, accel: 13,
    jumpV: -560, grav: 1450, obsGap: [300, 480],
    obstacles: ['pit', 'beam', 'barrel', 'pit', 'beam', 'barrel'],
    hidden: { id: 'goldAmmo', at: 0.6, floatY: -112 },
    battDrain: 1.15,                        // باتری چراغ‌قوه در تونل خالی می‌شود
    startSub: '— [ارشان]: فقط نور چراغ‌قوه‌ت! تیرآهن‌ها رو خم شو رد شو!',
    outroDur: 3.4,
    outroSub: '— [ارشان]: نور آخر تونل! بزن بیرون!',
    hitSubs: ['صدای برخورد در تاریکی!', 'چیزی ندیدی؟! مواظب باش!', 'آخ! پاته؟!'],
    subs: [
      { atM: 50,  txt: '— [ارشان]: رادیو می‌گه پاسگاه نظامی چند کیلومتر جلوتره...' },
      { atM: 100, txt: '— [تو]: این تونل تا کجا ادامه داره؟' },
      { atM: 150, txt: '— [ارشان]: ساکت باش... صدای چیزی میاد...' },
    ],
    drawBG: tunnelBG, drawObs: tunnelObs, drawProps: tunnelProps,
    outroUpdate: tunnelOutroUpdate, outroDraw: tunnelOutroDraw,
  },
  3: {
    theme: 'zipline', baseY: 330,
    goalM: 260, speed0: 300, speedMin: 210, speedMax: 500, accel: 16,
    jumpV: -540, grav: 1350, obsGap: [340, 540],
    obstacles: ['pylon', 'flyer', 'pylon', 'flyer', 'pylon'],
    hidden: { id: 'battery', at: 0.55, floatY: -96 },
    battDrain: 0,
    startSub: '— [ارشان]: به کابل بچسب! تیرک‌ها رو بپر، زامبی‌های پرنده رو خم شو رد شو!',
    outroDur: 3.8,
    outroSub: '— [ارشان]: سکوی مخابراتی! آماده‌ی فرود باش!',
    hitSubs: ['نصفه‌شب تو برف خوردی!', 'برخورد! کابل رو محکم بگیر!', 'حواست به تیرک‌ها باشه!'],
    subs: [
      { atM: 65,  txt: '— [ارشان]: دره رو ببین... عمیقه! ول نکن!' },
      { atM: 130, txt: '— [تو]: باد داره منو هی می‌کوبه!' },
      { atM: 195, txt: '— [ارشان]: چراغ قرمز رو می‌بینی؟ همون برجِ آخره!' },
    ],
    drawBG: ziplineBG, drawObs: ziplineObs, drawProps: ziplineProps,
    outroUpdate: ziplineOutroUpdate, outroDraw: ziplineOutroDraw,
  },
};

/* ---------------------- ۷-۸) رندر مینی‌گیم (فاز ۲ و ۳) ---------------------- */
function renderMG() {
  if (!TR || !MG.cfg) return;
  const cfg = MG.cfg;
  const gy = cfg.baseY;
  const scroll = MG.scroll;
  const mode = cfg.theme === 'zipline' ? 'hang' : 'run';

  cfg.drawBG(scroll, gy);

  /* موانع */
  for (const o of MG.obs) {
    const sx = o.wx - scroll;
    if (sx > -100 && sx < W + 100) cfg.drawObs(o, sx, gy);
  }
  /* آیتم مخفی */
  const H = MG.hidden;
  if (H && !H.got) {
    const sx = H.x - scroll;
    if (sx > -70 && sx < W + 70) drawHiddenPickup(sx, gy + H.floatY, H.id);
  }

  /* اجزای تم (ماشین/ارشان/کابل) */
  cfg.drawProps(scroll, gy);

  /* بازیکن */
  if (!MG.hidePlayer) {
    if (MG.outroPlayer) {
      ctx.save();
      ctx.translate(MG.outroPlayer.x, MG.outroPlayer.y);
      if (MG.outroPlayer.rot) ctx.rotate(MG.outroPlayer.rot);
      ctx.fillStyle = '#3d6db5'; rr(-8, -27, 16, 16, 5); ctx.fill();
      ctx.fillStyle = '#f0c49a'; circle(2, -32, 6);
      ctx.fillStyle = '#5a3d28';
      ctx.beginPath(); ctx.arc(2, -32, 6, Math.PI, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else {
      drawRunner(360, gy, mode);
    }
  }

  /* تاریکی تونل روی همه‌چیز (بعد از موانع = موانع در تاریکی پنهان‌اند) */
  if (cfg.theme === 'tunnel' && TR.phase === 2) renderTunnelDark(gy);

  /* فاز ۳: پایان‌بندی اختصاصی */
  if (TR.phase === 3 && cfg.outroDraw) cfg.outroDraw(gy);
}

/* لایه‌ی رویی انتقال: نوار سینما + زیرنویس + پیشرفت + راهنما + محو */
function drawTransitionOverlay() {
  if (state.mode !== 'transition' || !TR) return;
  /* نوارهای سینمایی */
  const L = Math.round(30 * clamp(TR.t / 0.5, 0, 1));
  if (L > 0) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, L);
    ctx.fillRect(0, H - L, W, L);
  }
  /* زیرنویس فعلی */
  if (TR.subT > 0 && TR.sub) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 14.5px Tahoma, sans-serif';
    const a = Math.min(1, TR.subT / 0.3);
    ctx.globalAlpha = a;
    const tw = ctx.measureText(TR.sub).width + 30;
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    rr(W / 2 - tw / 2, H - L - 42, tw, 27, 13); ctx.fill();
    ctx.fillStyle = '#f3e9cf';
    ctx.fillText(TR.sub, W / 2, H - L - 28);
    ctx.globalAlpha = 1;
  }
  /* نوار پیشرفت فاز ۲ + راهنمای کنترل */
  if (TR.phase === 2 && MG.cfg) {
    const cfg = MG.cfg;
    const distM = MG.scroll / PXM;
    const pct = clamp(distM / cfg.goalM, 0, 1);
    const bw = 430, bx = (W - bw) / 2, by = 54;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 13px Tahoma, sans-serif';
    ctx.fillStyle = '#e8ecf5';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
    ctx.fillText('فرار — ' + faNum(Math.round(cfg.goalM - distM)) + ' متر مانده', W / 2, by - 14);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(5,9,22,0.92)';
    rr(bx, by, bw, 14, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,216,115,0.55)'; ctx.lineWidth = 1.5;
    rr(bx, by, bw, 14, 7); ctx.stroke();
    const fw = (bw - 6) * pct;
    if (fw > 4) {
      const fg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      fg.addColorStop(0, '#f0b53c'); fg.addColorStop(1, '#ffd873');
      ctx.fillStyle = fg;
      rr(bx + 3, by + 3, fw, 8, 4); ctx.fill();
    }
    /* نشان بازیکن + مقصد */
    ctx.fillStyle = '#e8563f';
    rr(bx + 3 + Math.max(0, fw - 8), by + 1.5, 15, 11, 3); ctx.fill();
    drawMiniTower(bx + bw + 22, by + 14);
    /* راهنمای کنترل (۵ ثانیه‌ی اول) */
    const k = clamp(MG.t2 / 0.5, 0, 1) * clamp((5.6 - MG.t2) / 0.8, 0, 1);
    if (k > 0.03) {
      ctx.globalAlpha = k;
      const hw = 470, hx = (W - hw) / 2, hy = by + 26;
      ctx.fillStyle = 'rgba(4,7,18,0.94)';
      rr(hx, hy, hw, 34, 17); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.6)'; ctx.lineWidth = 1.6;
      rr(hx, hy, hw, 34, 17); ctx.stroke();
      ctx.font = 'bold 13.5px Tahoma, sans-serif';
      ctx.fillStyle = '#ffd873';
      ctx.fillText('پرش', hx + hw - 130, hy + 17);
      ctx.fillStyle = '#8fd6ff';
      ctx.fillText('خم‌شدن', hx + 168, hy + 17);
      ctx.fillStyle = '#c3cdea';
      ctx.font = 'bold 12px Tahoma, sans-serif';
      ctx.fillText('↑ یا Space', hx + hw - 74, hy + 17);
      ctx.fillText('↓', hx + 108, hy + 17);
      ctx.fillStyle = '#c3cdea';
      ctx.font = 'bold 11.5px Tahoma, sans-serif';
      ctx.fillText('سرعت: ←/→      (لمس صفحه = پرش)', W / 2 - 60, hy + 17);
      ctx.globalAlpha = 1;
    }
    /* شمارنده‌ی برخوردها */
    if (MG.hits > 0) {
      ctx.font = 'bold 11px Tahoma, sans-serif';
      ctx.fillStyle = 'rgba(255,150,140,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText('برخورد: ' + faNum(MG.hits), 14, H - L - 18);
      ctx.textAlign = 'center';
    }
  }
  /* محوی فاز (سیاه یا سفید) */
  if (TR.fade > 0.003) {
    ctx.fillStyle = TR.fadeWhite
      ? 'rgba(245,248,252,' + TR.fade.toFixed(3) + ')'
      : 'rgba(0,0,0,' + TR.fade.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}
