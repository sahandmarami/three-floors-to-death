/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۹٫۰ — بخش ۷: انتقال‌های بین فصل‌ها
   ==================================================================
   هر انتقال «سه فاز» دارد (هیچ فازی حذف نمی‌شود):
     فاز ۱) افتتاحیه‌ی سینمایی (بدون کنترل): فروریختن برج / انفجار دیوار /
             گلوله‌باران + ورود دراماتیک ارشان و وسیله‌ی فرار — با لرزش،
             ذرات، دود، نور و حرکت دوربین (فاز ۱ روی همان میدان بازی رندر
             می‌شود با شبه‌کات‌سین CS)
     فاز ۲) بخش قابل‌کنترل — مینی‌گیمِ سواره‌ی شبه‌سه‌بعدی با همان موتور
             (v4_drive + v4_ride): فرمان/گاز/ترمز؛ دوربین/نور/اتمسفر سینمایی
             فعال می‌ماند. در هر فرار یک «آیتم مخفی» وجود دارد.
     فاز ۳) پایان‌بندی سینمایی (بدون کنترل): رسیدن دراماتیک + محو
             → کارت فصل جدید → روزِ فصل بعد
   سه انتقال (۱۹٫۰ — بازخورد کاربر: مینی‌گیم‌ها مثلِ رانندگی شوند):
     فصل ۱→۲: فروریختن طبقه‌طبقه + ماشین ارشان در جاده‌ی شب (تم road)
     فصل ۲→۳: انفجار دیوار اسکله + قایق موتوری در کانالِ مه‌گرفته (تم river)
     فصل ۳→۴: گلوله‌باران + اسنوموبیل روی شیب برفیِ توفانی (تم snow)
   ================================================================== */

let TR = null;          // وضعیت انتقال فعال (null = انتقالی در جریان نیست)
const PXM = 24;         // پیکسل به «متر» برای نمایش پیشرفت فرار

/* (۱۲٫۰) گفتگوی صوتی فاز ۱ هر انتقال + صداهای فاز ۲/۳ — متن محاوره‌ای */
const TR_DLGS = {
  /* (۲۲٫۰) فصل ۱→۲: فروریختن برج و فرار — همان متن فوری */
  1: [ { who: 'a', v: 't1a1', text: 'برج داره فرو می‌ریزه! بپر! سریع!' },
       { who: 'n', v: 't1n1', text: 'ارشان با طناب از برج پایین رفت و ماشین رو گرم کرد — درها بازه، بپر تو!' } ],
  /* (۲۲٫۰) فصل ۲→۳: پیش از عبور از کانال */
  2: [ { who: 'a', v: 'tb2p1', text: 'قایق قدیمیه، ولی هنوز می‌تونه حرکت کنه.' },
       { who: 'p', v: 'tb2p2', text: 'وسایل رو محکم کن. چیزی نباید وسط راه داخل آب بیفته.' },
       { who: 'a', v: 'tb2p3', text: 'آماده‌ای؟' },
       { who: 'p', v: 'tb2p4', text: 'نه کاملاً. ولی دیگه وقت زیادی نداریم. حرکت کن.' } ],
  /* (۲۲٫۰) فصل ۳→۴: در مسیر دشوار — سرد و خسته */
  3: [ { who: 'a', v: 't3h1', text: 'هوا سردتر شده. دستام دیگه درست کار نمی‌کنن.' },
       { who: 'p', v: 't3h2', text: 'کمی استراحت می‌کنیم، اما مدت زیادی نمی‌تونیم اینجا بمونیم.' },
       { who: 'a', v: 't3h3', text: 'فکر می‌کنی هنوز کسی در برج باشه؟' },
       { who: 'p', v: 't3h4', text: 'نمی‌دونم. ولی اگه هیچ‌کس هم نباشه، شاید بتونیم پیام اضطراری بفرستیم.' } ],
};
/* (۲۲٫۰) outro = آرایه‌ی خطوط گفتگو (چندخطی) یا تک‌بارک */
const TR_BARKS = {
  1: { catch: { who: 'a', v: 'tb1c', text: 'گرفتمت! محکم خودت رو بگیر!' },
       start: { who: 'a', v: 'tb1s', text: 'فرمان با توئه! گاز بده!' },
       outro: [ { who: 'n', v: 't2n1', text: 'ساختمان سه‌طبقه دیگر نمی‌توانست امنیت همیشگی آن‌ها باشد. آن‌ها با وسایل باقی‌مانده حرکت کردند؛ بدون اینکه بدانند آن سوی کانال چه چیزی انتظارشان را می‌کشد.' },
                { who: 'a', v: 't2a1', text: 'هنوز باورم نمی‌شه مجبور شدیم اونجا رو ترک کنیم.' },
                { who: 'p', v: 't2p1', text: 'ما اونجا رو برای زنده موندن آماده کردیم، نه برای اینکه تا ابد داخلش زندانی بشیم.' },
                { who: 'a', v: 't2a2', text: 'امیدوارم پیام بی‌سیم درست بوده باشه.' },
                { who: 'p', v: 't2p2', text: 'تا وقتی مسیر رو بررسی نکردیم، به هیچ چیزی اعتماد نمی‌کنیم.' } ] },
  2: { catch: null,
       start: { who: 'a', v: 'tb2s', text: 'فرمان قایق با توئه! گاز بده!' },
       outro: [ { who: 'a', v: 'tb2o1', text: 'بالاخره رسیدیم! از اینجا می‌تونیم به راه ادامه بدیم.' },
                { who: 'p', v: 'tb2o2', text: 'هنوز تموم نشده. باید بفهمیم ایستگاه امدادی کجاست.' },
                { who: 'a', v: 'tb2o3', text: 'حداقل حالا از اون کانال لعنتی رد شدیم.' },
                { who: 'p', v: 'tb2o4', text: 'و فهمیدیم هر قدم جلوتر، یه خطر تازه داره.' } ] },
  3: { catch: null,
       start: { who: 'a', v: 'tb3s', text: 'گاز بده! از برف رد شو!' },
       outro: [ { who: 'a', v: 't3r1', text: 'بالاخره رسیدیم! تجهیزاتش هنوز اینجان.' },
                { who: 'p', v: 't3r2', text: 'باید برق و ارتباط رو بررسی کنیم. دست به چیزی نزن تا مطمئن بشیم.' },
                { who: 'r', v: 't3rr', text: 'اگر کسی این پیام را دریافت می‌کند، پناهگاه جنوبی هنوز فعال است. مسیر دره شرقی را دنبال کنید. از جاده اصلی دور بمانید.' },
                { who: 'a', v: 't3r3', text: 'پناهگاه جنوبی! این همون چیزیه که دنبالش بودیم!' },
                { who: 'p', v: 't3r4', text: 'حالا مسیر داریم. باید قبل از اینکه هوا بدتر بشه حرکت کنیم.' } ] },
};
/* صدای کوتاه + زیرنویس انتقال (بدون بلوک ورودی) — ۱۲٫۰: متن با صدای شخصیت */
function transBark(b, txt, dur) {
  const d = (b && b.text && !(typeof SETT !== 'undefined' && !SETT.sfx)) ? VOICE.speak(b.text, b.who, b.v) : 0;
  setTransSub(txt || '', dur || Math.max(2.4, d + 0.4));
}

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
  [7.0, 7.7, '— [ارشان]: زامبی‌ها پشت سرمون‌ان — تو پشت فرمان، من صندلی کمکی!'],
];
const SUBS_INTRO2 = [
  [0.4, 1.6, 'صدای پای گله‌ی بزرگ میاد...'],
  [2.0, 3.4, '— [ارشان]: دیوارِ اسکله منفجر شد! یه قایق موتوری اون پایینه!'],
  [3.6, 4.4, '— [ارشان]: بپر تو قایق! من پشتتم!'],
  [4.6, 5.6, 'مهِ کانال همه‌جا رو گرفته... فقط چراغ‌های مسیر...'],
];
const SUBS_INTRO3 = [
  [0.4, 1.8, 'گلوله‌بارانِ پاسگاه شروع شده...'],
  [2.0, 3.6, '— [ارشان]: گله از هر طرف داره میاد! اسنوموبیلِ گاراژ هنوز سالمه!'],
  [3.8, 4.6, '— [ارشان]: سوار شو! بالای شیب برفی، برج مخابراتیه!'],
  [4.8, 5.7, 'باد یخ... برف تند... محکم بشین!'],
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

/* ---- فاز ۱ فصل ۲→۳: محاصره + انفجار دیوار اسکله + سوارشدن قایق ---- */
function introUpdate2(dt) {
  const t = TR.t;
  /* گله از دو طرف می‌آید */
  if (t < 2.2 && Math.random() < dt * 5.2) {
    const type = Math.random() < 0.3 ? 'fast' : 'normal';
    CS.zombies.push(makeCsWalkZombie(type, Math.random() < 0.5 ? -40 : W + 40));
  }
  csWalkStep(dt);
  /* انفجار دیوار اسکله (چپ) — لنگرگاهِ قایق باز می‌شود */
  if (!TR.ev.boom && t >= 1.8) {
    TR.ev.boom = 1;
    SFX.csBoom();
    state.shake = 13; state.flash = 0.9;
    spawnParticles(200, GROUND_Y - 34, 34, '#ff9a3d', { speed: 300, life: 0.8, size: 3.4, grav: 320 });
    spawnParticles(200, GROUND_Y - 28, 20, '#454a52', { speed: 170, life: 1.5, size: 4.2, grav: -22 });
  }
  /* موتور قایق روشن می‌شود (صدای دوربین) */
  if (!TR.ev.engine && t >= 3.0) {
    TR.ev.engine = 1;
    SFX.csEngine();
  }
  /* بازیکن: روی برج → جهش به اسکله → سوار قایق */
  if (t < 3.6) {
    CS.draw.player = { x: TOWER.x, y: TOWER_TOP_Y, aim: -2.3 };
  } else {
    const k = clamp((t - 3.6) / 0.9, 0, 1);
    CS.draw.player = {
      x: TOWER.x - (TOWER.x - 200) * k,
      y: TOWER_TOP_Y + (GROUND_Y - 6 - TOWER_TOP_Y) * k * k,
      rot: k * 1.1, aim: -2.7,
    };
    if (k >= 1 && !TR.ev.aboard) {
      TR.ev.aboard = 1;
      SFX.csLand();
      state.shake = 4;
      /* موج کوچک دور قایق */
      spawnParticles(200, GROUND_Y, 12, 'rgba(170,222,228,0.7)', { speed: 120, life: 0.6, size: 2.6, grav: 300, up: true });
    }
  }
  if (t >= 5.6) TR.fade = clamp((t - 5.6) / 0.7, 0, 1);
  setTimedSubs(SUBS_INTRO2, t);
}

/* ---- فاز ۱ فصل ۳→۴: گلوله‌باران + سوارشدن اسنوموبیل ---- */
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
  /* موتور اسنوموبیل از راست جواب می‌دهد */
  if (!TR.ev.engine && t >= 2.6) {
    TR.ev.engine = 1;
    SFX.csEngine();
  }
  /* بازیکن: برج → جهش به اسنوموبیلِ پارک‌شده در راست */
  if (t < 4.0) {
    CS.draw.player = { x: TOWER.x, y: TOWER_TOP_Y, aim: 0.5 };
  } else if (t < 5.0) {
    const k = clamp((t - 4.0) / 0.85, 0, 1);
    CS.draw.player = {
      x: TOWER.x + (772 - TOWER.x) * k,
      y: TOWER_TOP_Y - Math.sin(k * Math.PI) * 84 + (GROUND_Y - 10 - TOWER_TOP_Y) * k,
      rot: 0.4, aim: 0.3,
    };
    if (!TR.ev.jumpSfx) { TR.ev.jumpSfx = 1; SFX.csWhoosh(); }
  } else {
    CS.draw.player = { x: 772, y: GROUND_Y - 10, aim: 0 };
    if (!TR.ev.seated) {
      TR.ev.seated = 1;
      SFX.csLand();
      state.shake = 5;
      /* پاشش برف دور تسمه */
      spawnParticles(772, GROUND_Y, 16, 'rgba(240,248,252,0.9)', { speed: 150, life: 0.6, size: 2.8, grav: 320, up: true });
    }
  }
  if (t >= 6.0) TR.fade = clamp((t - 6.0) / 0.65, 0, 1);
  setTimedSubs(SUBS_INTRO3, t);
}

/* اسباب فاز ۱ که روی میدان بازی رسم می‌شود (از drawChapterProps صدا زده می‌شود) */
function drawTransitionIntroProps() {
  if (!TR || TR.phase !== 1 || !CS) return;
  const d = state.dayness;
  if (TR.ch === 2 && TR.ev.boom) {
    /* (۱۹٫۰) لنگرگاهِ بازشده: اسکله‌ی چوبی + قایق موتوری با چراغ روشن */
    const hx = 200, hy = GROUND_Y;
    /* لبه‌ی اسکله + تیرک‌های چوبی */
    ctx.fillStyle = mixHex('#3a2c1a', '#7a6248', d);
    rr(hx - 78, hy - 10, 156, 10, 3); ctx.fill();
    ctx.fillStyle = mixHex('#2c2012', '#5a4630', d);
    for (const px of [-70, -24, 28, 68]) ctx.fillRect(hx + px, hy - 2, 8, 14);
    /* بدنه‌ی قایق لنگر — سرِ موتور روشن */
    ctx.save();
    ctx.translate(hx + 26, hy - 12);
    ctx.rotate(Math.sin(animTime * 1.6) * 0.02);
    ctx.fillStyle = mixHex('#6a4426', '#8a6a44', d);
    rr(-52, -20, 104, 20, 8); ctx.fill();           // بدنه
    ctx.fillStyle = mixHex('#241a10', '#4a3a28', d);
    rr(-38, -16, 76, 10, 5); ctx.fill();            // عرشه
    ctx.fillStyle = mixHex('#454b57', '#6a7480', d);
    rr(-8, -30, 16, 14, 4); ctx.fill();             // موتور
    /* چراغ دم سبز + برقِ آب دور بدنه */
    ctx.fillStyle = '#7be389'; circle(-46, -12, 3);
    ctx.strokeStyle = 'rgba(170,222,228,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 2, 58, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    /* هاله‌ی گرم چراغ قایق */
    const glow = ctx.createRadialGradient(hx + 26, hy - 30, 4, hx + 26, hy - 30, 44);
    glow.addColorStop(0, 'rgba(255,200,110,' + (0.3 + 0.1 * Math.sin(animTime * 3)).toFixed(2) + ')');
    glow.addColorStop(1, 'rgba(255,200,110,0)');
    ctx.fillStyle = glow; circle(hx + 26, hy - 30, 44);
  }
  if (TR.ch === 3) {
    /* (۱۹٫۰) اسنوموبیلِ پارک‌شده در راست — تسمه پوشیده از برف + چراغ عقب */
    const mx = 772, my = GROUND_Y;
    /* تل برف دور تسمه */
    ctx.fillStyle = mixHex('#c2d4e0', '#e4eef4', d);
    ctx.beginPath(); ctx.ellipse(mx, my + 2, 66, 12, 0, 0, Math.PI * 2); ctx.fill();
    /* بدنه + تسمه + اسکی */
    ctx.save();
    ctx.translate(mx, my - 6);
    ctx.fillStyle = mixHex('#20262e', '#3a424e', d);
    rr(-52, -26, 104, 26, 10); ctx.fill();          // تسمه
    ctx.fillStyle = 'rgba(238,246,250,0.8)';
    rr(-52, -29, 104, 8, 4); ctx.fill();            // برف روی تسمه
    const bg2 = ctx.createLinearGradient(0, -60, 0, -24);
    bg2.addColorStop(0, mixHex('#e8563f', '#f07a5a', d));
    bg2.addColorStop(1, mixHex('#7a2a24', '#a44a3a', d));
    ctx.fillStyle = bg2;
    rr(-38, -56, 76, 34, 12); ctx.fill();           // بدنه/زین
    ctx.fillStyle = mixHex('#2c3540', '#4a5664', d);
    for (const sx of [-56, 56]) { rr(sx - 9, -12, 18, 14, 6); ctx.fill(); }   // اسکی‌ها
    /* چراغ عقب قرمز چشمک‌زن (موتور روشن) */
    const bl = 0.55 + 0.45 * Math.sin(animTime * 4);
    ctx.fillStyle = 'rgba(255,70,55,' + bl.toFixed(2) + ')';
    rr(-10, -40, 20, 7, 3); ctx.fill();
    ctx.restore();
    /* بخارِ اگزوز در سرما */
    if (Math.sin(animTime * 9) > 0.3) {
      ctx.fillStyle = 'rgba(220,232,240,0.3)';
      circle(mx + rand(-6, 6), my - 64 - (animTime * 26 % 22), 3 + (animTime * 7 % 3));
    }
  }
}

/* ---------------------- ۷-۳) فاز ۲ — موتور مینی‌گیم‌های سواره ----------------------
   (۱۹٫۰) هر سه فرار سواره‌اند (road/river/snow) و همان موتور شبه‌سه‌بعدی
   v4_drive را دارند: MG فقط «پوششِ» پیکربندی و شمارنده‌هاست. */
const MG = {
  cfg: null, scroll: 0, speed: 0, hits: 0, t2: 0,
  reset(cfg) {
    this.cfg = cfg;
    this.scroll = 0; this.speed = cfg.speed0;
    this.hits = 0;
    this.t2 = 0;
    driveReset(cfg);                     /* فیزیک/موانع/آیتم مخفی — سه تم */
    for (const s of cfg.subs) s.done = false;
  },
};

/* ورودی مینی‌گیم (از listener های بخش ۲) — (۱۹٫۰) همه‌ی تم‌ها فرمان دارند */
function mgNudge(d) {
  if (!TR || TR.phase !== 2) return;
  if (MG.cfg && isRideTheme(MG.cfg.theme)) {
    if (typeof DRV !== 'undefined') {
      DRV.steer = d < 0 ? -1 : (d > 0 ? 1 : 0);
      DRV.kb = d !== 0;                  /* کج‌کردن گوشی فقط وقتی کلید/لمس نیست */
    }
  }
}
/* سازگاری ورودی‌های قدیمی پرش/خم‌شدن — تم‌های دونده حذف شدند؛ بی‌اثر */
function mgJump() {}
function mgDuck(on) {}

/* شروع فاز ۲ */
function mgBegin() {
  TR.phase = 2;
  TR.t = 0;
  TR.fade = 1;                       // با سیاهی کوتاه شروع می‌شود
  TR.fadeWhite = false;
  DLG.skip();                        // (۱۱٫۰) گفتگوی فاز ۱ حتماً بسته شود
  MG.reset(MGCFG[TR.ch]);
  setTransSub(MGCFG[TR.ch].startSub, 3.2);
  const b = TR_BARKS[TR.ch];         /* (۱۲٫۰) صدای شروع مینی‌گیم */
  if (b && b.start) transBark(b.start, MGCFG[TR.ch].startSub, 3.4);
}

function mgUpdate(dt) {
  /* (۱۷٫۰/۱۹٫۰) هر سه تمِ سواره فیزیک اختصاصی خود را دارند */
  driveUpdate(dt);
}

/* شروع فاز ۳ */
function mgOutro() {
  TR.phase = 3;
  TR.t = 0;
  TR.ev = {};
  MG.obs = [];
  TR.outroDurEff = MGCFG[TR.ch].outroDur;
  const sc = Math.round(typeof DRV !== 'undefined' ? (DRV.score || 0) : 0);
  setTransSub(MGCFG[TR.ch].outroSub, 2.2);
  setTimeout(() => { try { setTransSub('\U0001F3C1 امتیاز فرار: ' + faNum(sc) + (MG.hits ? ' — برخوردها: ' + faNum(MG.hits) : ' — بدون برخورد! ✨'), 2.4); } catch (e) {} }, 2400);
  SFX.clear();
  const b = TR_BARKS[TR.ch];         /* (۱۲٫۰) صدای پایان فرار */
  /* (۲۲٫۰) outro آرایه‌ای = گفتگوی چندخطیِ داستانی — تا پایانش صبر می‌کنیم */
  if (b && Array.isArray(b.outro)) {
    try {
      let sum = 0;
      for (const L of b.outro) sum += ((typeof VOICES22 !== 'undefined' && VOICES22[L.v]) ? VOICES22[L.v].d : 3.2) + 0.7;
      TR.outroDurEff = Math.max(TR.outroDurEff, sum + 2.4);
      TR.outroDlgDone = false;
      DLG.start(b.outro, () => { if (TR) TR.outroDlgDone = true; });
    } catch (e) {}
  } else if (b && b.outro) {
    transBark(b.outro, MGCFG[TR.ch].outroSub, 3.2);
  }
}

/* فاز ۳ مشترک: حرکت خودکار + محوِ پایانی */
function mgOutroUpdate(dt) {
  const cfg = MG.cfg;
  MG.scroll += Math.min(MG.speed + 130, cfg.speedMax + 170) * dt;
  cfg.outroUpdate && cfg.outroUpdate(dt);
  const od = TR.outroDurEff || cfg.outroDur;   /* (۲۲٫۰) مدت مؤثر با گفتگو */
  TR.fade = Math.max(TR.fade, clamp((TR.t - (od - 1.15)) / 1.0, 0, 1));
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
    DLG.update(dt);                                  /* (۲۲٫۰) گفتگوی چندخطی outro */
    mgOutroUpdate(dt);
    if (TR.t >= (TR.outroDurEff || MG.cfg.outroDur) && (TR.outroDlgDone !== false || TR.t > 62)) finishTransition();
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

/* ---------------------- ۷-۷) پیکربندی سه مینی‌گیم سواره ---------------------- */
const MGCFG = {
  /* (۱۷٫۰) فصل ۱→۲: رانندگی شبه‌سه‌بعدی — بازیکن پشت فرمان، ارشان صندلی
     کمکی؛ موانع/زامبی‌ها با پرسپکتیو؛ آیتم مخفی = جعبه‌ی کنار جاده.
     فیزیک/رندر در v4_drive.js (driveUpdate/renderDrive) */
  1: {
    theme: 'drive',
    goalM: 380, speed0: 2000, speedMin: 700, speedMax: 3400,
    hidden: { id: 'medkit', at: 0.45 },
    hiddenBark: { v: 'd1a2', text: 'اون طرف یه جعبه دیدم! بگیرش!' },
    startSub: '— [ارشان]: فرمان با توئه! گاز بده!',
    outroDur: 3.4,
    outroSub: '— جاده‌ی شمالی... راهِ کانال باز است',
    hitSubs: ['بوووم! حواست کجاست؟!', 'زدی بهش! سرعت گیر کرد!', 'مواظب باش! جاده پر الکل!'],
    subs: [
      { atM: 90,  txt: '— [ارشان]: زامبی‌ها جلو رفتن... گاز بده، رد شو!',
        barkV: 'd1a1', barkT: 'مواظب باش! تا انبارها یه راه باقی مونده!' },
      { atM: 200, txt: '— [تو]: این جاده هم پای آخر داره!' },
      { atM: 300, txt: '— [ارشان]: مهِ انبارها داره میاد... تقریباً رسیدیم!' },
    ],
    outroUpdate: driveOutroUpdate,
  },
  /* (۱۹٫۰) فصل ۲→۳: قایق موتوری در کانالِ مه‌گرفته — بازیکن پشت سکان،
     ارشان با فانوس روی عقب قایق؛ موانع شناور؛ انعکاس ماه روی آب؛
     مقصد = دروازه‌ی پاسگاه نظامی. رندر: v4_ride.js (renderRiver) */
  2: {
    theme: 'river',
    goalM: 360, speed0: 1900, speedMin: 700, speedMax: 3200,
    hidden: { id: 'battery', at: 0.45 },
    hiddenBark: { v: 'b1a2', text: 'اون آخرِ کانال یه چراغ چشمک می‌زنه! نزدیکش شو!' },
    startSub: '— [ارشان]: فرمان قایق با توئه! از موانع رد شو!',
    outroDur: 3.4,
    outroSub: '— ساحلِ اون طرفِ کانال... رسیدیم!',
    hitSubs: ['شال‌آب اومد تو! مواظب باش!', 'زدی بهش! سرعت قایق گیر کرد!', 'بوووم! حواست کجاست؟!'],
    subs: [
      { atM: 80,  txt: '— [ارشان]: رادیو می‌گه ایستگاهی اون طرفِ کاناله...',
        barkV: 'b1a1', barkT: 'گاز بده! از این کانال فقط یه راه به اون طرف هست!' },
      { atM: 190, txt: '— [تو]: این مه انقدر غلیظه که انگار داریم تو شیر می‌ریم!' },
      { atM: 285, txt: '— [ارشان]: چراغ‌های اون طرف رو می‌بینی؟ تقریباً رسیدیم!' },
    ],
    outroUpdate: rideOutroUpdate,
  },
  /* (۱۹٫۰) فصل ۳→۴: اسنوموبیل روی شیب برفی توفانی — بازیکن راننده،
     ارشان پشتش؛ صخره‌های یخ/کاج افتاده/زامبی‌های یخ‌زده؛ تندبرف و
     رگبار سفیدِ دوره‌ای؛ مقصد = دکل مخابراتی. رندر: v4_ride.js (renderSnow) */
  3: {
    theme: 'snow',
    goalM: 390, speed0: 2000, speedMin: 750, speedMax: 3400,
    hidden: { id: 'goldAmmo', at: 0.5 },
    hiddenBark: { v: 's1a2', text: 'اون بالا یه جعبه دیدم! بهش نزدیک شو!' },
    startSub: '— [ارشان]: گاز بده! از برف رد شو!',
    outroDur: 3.8,
    outroSub: '— برج مخابراتی... آخرین قله!',
    hitSubs: ['خوردی به برف! مواظب باش!', 'برخورد! محکم‌تر بچسب!', 'صخره بود! حواست جمع باشه!'],
    subs: [
      { atM: 90,  txt: '— [ارشان]: وقتی مهِ سفید میاد، سرعتت رو کم کن!',
        barkV: 's1a1', barkT: 'توفان برف میاد! تو رگبارش گاز نده!' },
      { atM: 200, txt: '— [تو]: انگار دارم تو یخ‌شکن رانندگی می‌کنم!' },
      { atM: 305, txt: '— [ارشان]: چراغ قرمز دکل رو می‌بینی؟ همون آخرِ کاره!' },
    ],
    outroUpdate: rideOutroUpdate,
  },
};

/* ---------------------- ۷-۸) رندر مینی‌گیم (فاز ۲ و ۳) ---------------------- */
function renderMG() {
  if (!TR || !MG.cfg) return;
  /* (۱۷٫۰/۱۹٫۰) هر سه تمِ سواره رندر شبه‌سه‌بعدی مشترک دارند:
     renderDrive خودش بر اساس DRV.theme بین جاده/رودخانه/برف جدا می‌کند */
  renderDrive();
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
    /* (۲۰٫۰) چیپ امتیاز + کمبوی «نزدک بود!» — بالا-راست */
    if (typeof DRV !== 'undefined') {
      const D = DRV;
      const scoreTxt = '⭐ ' + faNum(Math.round(D.score || 0));
      ctx.font = 'bold 13px Tahoma, sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      const sw2 = ctx.measureText(scoreTxt).width + 26;
      ctx.fillStyle = 'rgba(5,9,22,0.92)';
      rr(W - sw2 - 14, by - 26, sw2, 24, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.5)'; ctx.lineWidth = 1.4;
      rr(W - sw2 - 14, by - 26, sw2, 24, 12); ctx.stroke();
      ctx.fillStyle = '#ffd873';
      ctx.fillText(scoreTxt, W - 26, by - 13.5);
      if ((D.combo || 0) >= 2) {
        const pulse = 0.75 + 0.25 * Math.sin(animTime * 9);
        ctx.globalAlpha = pulse;
        const cTxt = '🔥 کمبو ×' + faNum(D.combo) + (D.boost > 0 ? '  ⚡بوست' : '');
        const cw2 = ctx.measureText(cTxt).width + 24;
        ctx.fillStyle = 'rgba(64,28,10,0.92)';
        rr(W - cw2 - 14, by - 54, cw2, 24, 12); ctx.fill();
        ctx.strokeStyle = 'rgba(255,154,61,0.65)';
        rr(W - cw2 - 14, by - 54, cw2, 24, 12); ctx.stroke();
        ctx.fillStyle = '#ffb26e';
        ctx.fillText(cTxt, W - 26, by - 41.5);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'center';
    }
    /* (۲۰٫۰) موبایل: نشانگرهای لمسیِ نیمه‌شفاف فرمان/ترمز — همیشه دیده شوند */
    if ((typeof IS_TOUCH !== 'undefined') && IS_TOUCH && TR.phase === 2) {
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.1 * Math.sin(animTime * 2.4);
      ctx.fillStyle = '#dfe8f5';
      ctx.strokeStyle = 'rgba(223,232,245,0.8)'; ctx.lineWidth = 2;
      /* چپ: فرمان */
      circle(56, H - 64, 30); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(66, H - 64); ctx.lineTo(46, H - 74); ctx.lineTo(46, H - 54);
      ctx.closePath(); ctx.fill();
      /* راست: فرمان */
      circle(W - 56, H - 64, 30); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W - 66, H - 64); ctx.lineTo(W - 46, H - 74); ctx.lineTo(W - 46, H - 54);
      ctx.closePath(); ctx.fill();
      /* وسط: ترمز */
      circle(W / 2, H - 52, 20); ctx.stroke();
      ctx.fillRect(W / 2 - 7, H - 58, 14, 5);
      ctx.fillRect(W / 2 - 7, H - 49, 14, 5);
      ctx.restore();
    }
    /* راهنمای کنترل (۵ ثانیه‌ی اول) — (۱۷٫۰) رانندگی متن خودش را دارد */
    const k = clamp(MG.t2 / 0.5, 0, 1) * clamp((5.6 - MG.t2) / 0.8, 0, 1);
    if (k > 0.03) {
      ctx.globalAlpha = k;
      const isDrive = isRideTheme(cfg.theme);   /* (۱۹٫۰) هر سه تم سواره */
      const hw = isDrive ? 500 : 470, hx = (W - hw) / 2, hy = by + 26;
      ctx.fillStyle = 'rgba(4,7,18,0.94)';
      rr(hx, hy, hw, 34, 17); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,115,0.6)'; ctx.lineWidth = 1.6;
      rr(hx, hy, hw, 34, 17); ctx.stroke();
      ctx.font = 'bold 13.5px Tahoma, sans-serif';
      if (isDrive) {
        ctx.fillStyle = '#ffd873';
        ctx.fillText('فرمان', hx + hw - 92, hy + 17);
        ctx.fillStyle = '#8fd6ff';
        ctx.fillText('گاز', hx + 190, hy + 17);
        ctx.fillStyle = '#ff9d8f';
        ctx.fillText('ترمز', hx + 52, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 12px Tahoma, sans-serif';
        ctx.fillText('← / →', hx + hw - 40, hy + 17);
        ctx.fillText('↑', hx + 226, hy + 17);
        ctx.fillText('↓', hx + 92, hy + 17);
        ctx.fillStyle = '#c3cdea';
        ctx.font = 'bold 10.5px Tahoma, sans-serif';
        ctx.fillText('لمس: چپ/راست فرمان — وسط ترمز (گاز خودکار) • کج‌کردن گوشی = فرمان', W / 2 - 62, hy + 17);
      } else {
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
      }
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
