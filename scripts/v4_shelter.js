/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۹٫۰ — بخش ۱۳: پایانِ سینمایی + پناهگاه
   ==================================================================
   (۱۹٫۰ — بازخورد کاربر: «وقتی رسیدیم به پناهگاه، داخل‌رفتنمون به
   صورت ویدیو نشون بده... حرف بزنیم و دنبال راه‌چاره باشیم که یهو یه
   اتفاق بد بیفته... بعد بنویسه این داستان ادامه دارد... صفحه‌ی
   پیروزی هم خواص باشه و منوش جذاب»)
   جریانِ پایان بعد از شکستِ نگهبان:
     ۱) سحرِ پیروزی (v4_final — همان سحنه‌ی سحر) →
     ۲) کات‌سین «رسیدن به پناهگاه» (SHEL):
        • پیاده‌روی سحرگاهی تا درِ فولادی پناهگاه (P1 walk)
        • بازشدن دروازه و سیل نور (P2 gate)
        • داخلِ پناهگاه: گفتگو با دکتر مریم و بازمانده‌ها + چاره‌جویی
          (P3 inside — گفتگوی DLG با صدای جدید «م» = دکتر مریم)
        • اتفاق بد: آژیر قرمز + رادیو: «گله‌ی بزرگ به سمت پناهگاه»
          (P4 alarm — قلابِ سری دوم)
     ۳) صفحه‌ی «این داستان ادامه دارد...» — تایپ تدریجی + تیترِ
        سری دوم: «محاصره‌ی پناهگاه» (DOM + صدا)
     ۴) صفحه‌ی بردِ سینمایی: مدال طلایی + پرتوهای چرخان + کارت‌های
        آمار + منوی کامل + آتش‌بازیِ پشتِ پنل (victory بازنویسی شد)
   ================================================================== */

let SHEL = null;      // وضعیت کات‌سین پناهگاه
const VICFX = { t: 0 };   // تایمر آتش‌بازی صفحه‌ی برد

/* ---------------------- ۱۳-۱) شروع کات‌سین پناهگاه ---------------------- */
function startShelterCine() {
  if (state.mode === 'sheltercine') return;
  try { wipeSave(); } catch (e) {}             /* بازی تمام شد — سیو پاک */
  SHEL = {
    t: 0, phase: 'walk', dlgStarted: false, dlgDone: false,
    sub: '', subT: 0, typed: 0, tbcDone: false,
  };
  state.mode = 'sheltercine';
  state.mouse.down = false;
  state.placing = null;
  state.slowmo = 0;
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  SFX.morning();
}

function shelterHardReset() {
  SHEL = null;
  hideScreen('tbcScreen');
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  VOICE.stop();
  try { DLG.skip(); } catch (e) {}
}

/* رد کردن: مستقیم صفحه‌ی «ادامه دارد» (۲۰٫۰ — دیگر به صفحه‌ی برد نمی‌رود) */
function skipShelterCine() {
  if (!SHEL) return;
  SFX.click();
  const wasTbc = SHEL.phase === 'tbc';
  if (!wasTbc) {
    SHEL.phase = 'alarm';
    SHEL.dlgDone = true;                 /* گفتگو را وارونه رد کن */
    SHEL.t = 6.0;
    startTbcScreen();
  }
}

/* گفتگوی داخل پناهگاه — با صدای دکتر مریم (m) و رادیو (r) */
const SHEL_DLGS = [
  { who: 'm', v: 'sh3m', text: 'خوش اومدید... ما شما رو از دیده‌بان دیدیم. شب‌ها زنده موندن کارِ هر کسی نیست.' },
  { who: 'a', v: 'sh4a', text: 'این‌جا واقعاً امنه؟' },
  { who: 'm', v: 'sh5m', text: 'دیوارها هنوز سرِ پانه... ولی آذوقه دو هفته بیشتر نداره و رادیومون نیم‌سوخته‌ست.' },
  { who: 'p', v: 'sh6p', text: 'رادیو رو من درست می‌کنم... فقط یه آنتنِ بلند لازم داریم.' },
  { who: 'a', v: 'sh7a', text: 'و منم دیوارها رو محکم می‌کنم. این بار فقط دوتا نیستیم!' },
  { who: 'm', v: 'sh8m', text: 'خیلی خب... استراحت کنید. فردا روزِ سختیه.' },
];
/* اتفاق بد: آژیر + خبرِ رادیو + جمله‌ی پایانی ارشان و راوی */
const SHEL_DLGS2 = [
  { who: 'r', v: 'sh9r',  text: 'تمامِ واحدها گوش کنید! گله‌ی بزرگ از دره‌ی شمالی به سمتِ پناهگاه شما حرکت کرده... زمان ندارید!' },
  { who: 'a', v: 'sh10a', text: 'می‌شنوی زنگِ خطر رو؟... این تازه اولِ کاره.' },
];

/* زمان‌بندی زیرنویس مراحل سینمایی (شروع، پایان، متن) */
const SHEL_SUBS = {
  walk: [
    [0.4, 2.4, '— [تو]: اون‌جا... اون قله رو می‌بینی؟ همونجاست!'],
    [2.8, 5.2, '— [ارشان]: پناهگاه... واقعاً وجود داشت!'],
  ],
  gate: [
    [0.5, 2.2, '— [ارشان]: در باز می‌شه! زود باش!'],
    [2.6, 3.9, 'صدای سنگینِ درِ فولادی...'],
  ],
};

/* ---------------------- ۱۳-۲) به‌روزرسانی کات‌سین ---------------------- */
function updateShelterCine(dt) {
  if (!SHEL) return;
  SHEL.t += dt;
  DLG.update(dt);
  state.shake = Math.max(0, state.shake - dt * 22);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt);
  updateTexts(dt);
  if (SHEL.subT > 0) SHEL.subT -= dt;
  const ph = SHEL.phase;

  if (ph === 'walk') {
    setTimedShelterSubs(SHEL_SUBS.walk);
    /* صدای ورود (اولین بار) — صدا + زیرنویسِ خودِ سینمایی (بدون اعلان) */
    if (!SHEL.hello && SHEL.t > 0.4) {
      SHEL.hello = true;
      const d1 = VOICE.speak('اونجاست! درِ پناهگاه رو می‌بینم! زود باش!', 'a', 'sh1a');
      SHEL.sub = '— [ارشان]: اونجاست! درِ پناهگاه رو می‌بینم! زود باش!';
      SHEL.subT = Math.max(2.2, d1 + 0.3);
    }
    if (!SHEL.narr && SHEL.t > 3.4) {
      SHEL.narr = true;
      const d2 = VOICE.speak('دری فولادی در دلِ تپه... و صدایی که می‌گه هنوز جایی برای موندن هست.', 'n', 'sh2n');
      SHEL.sub = 'دری فولادی در دلِ تپه... و صدایی که می‌گه هنوز جایی برای موندن هست.';
      SHEL.subT = Math.max(2.6, d2 + 0.3);
    }
    if (SHEL.t >= 6.2) { SHEL.phase = 'gate'; SHEL.t = 0; SFX.csRumble(); }
  } else if (ph === 'gate') {
    setTimedShelterSubs(SHEL_SUBS.gate);
    if (!SHEL.doorSfx && SHEL.t > 0.3) {
      SHEL.doorSfx = true;
      SFX.csEngine(); state.shake = 5;
    }
    /* نورِ ریخته از در وقتی باز می‌شود (۲۱٫۳: نسبت به W) */
    if (SHEL.t > 1.0 && Math.random() < dt * 14) {
      spawnParticles(W * 0.73 + rand(-60, 60), 330 + rand(-30, 30), 1, 'rgba(255,226,168,0.5)',
        { speed: 16, life: 1.6, size: 2.4, grav: -8 });
    }
    if (SHEL.t >= 4.0) { SHEL.phase = 'inside'; SHEL.t = 0; }
  } else if (ph === 'inside') {
    /* گفتگوی پناهگاه (کمی بعد از ورود) */
    if (!SHEL.dlgStarted && SHEL.t > 0.8) {
      SHEL.dlgStarted = true;
      DLG.start(SHEL_DLGS, () => { if (SHEL) SHEL.dlgDone = true; });
    }
    /* چراغ‌های سقفی سوسوزن + بخارِ تنفس سرد */
    if (Math.random() < dt * 3) {
      spawnParticles(rand(80, W - 80), 300, 1, 'rgba(255,226,168,0.22)',
        { speed: 6, life: 2.2, size: 2, grav: 6 });
    }
    if (SHEL.dlgDone && SHEL.t > 1.0 && !SHEL.alarmStarted) {
      SHEL.alarmStarted = true;
      SHEL.phase = 'alarm'; SHEL.t = 0;
      SHEL.dlgStarted = false; SHEL.dlgDone = false;
      SFX.alarm();
      state.shake = 8;
    }
  } else if (ph === 'alarm') {
    /* آژیر: چراغ قرمز چرخان + لرزش + ریزش غبار */
    state.shake = Math.max(state.shake, 2.5);
    if (Math.random() < dt * 16) {
      spawnParticles(rand(60, W - 60), 240, 1, 'rgba(160,140,110,0.4)',
        { speed: 20, life: 1.4, size: 2, grav: 60 });
    }
    if (Math.sin(SHEL.t * 4.4) > 0.92 && !SHEL._al2) { SHEL._al2 = true; SFX.alarm(); }
    if (Math.sin(SHEL.t * 4.4) < -0.92) SHEL._al2 = false;
    if (!SHEL.dlgStarted && SHEL.t > 0.7) {
      SHEL.dlgStarted = true;
      DLG.start(SHEL_DLGS2, () => { if (SHEL) SHEL.dlgDone = true; });
    }
    /* جمله‌ی آخرِ راوی بعد از گفتگو → محو به «ادامه دارد» */
    if (SHEL.dlgDone && SHEL.t > 1.2) {
      if (!SHEL.lastN) {
        SHEL.lastN = true;
        try { VOICE.speak('و شب، وقتی همه خواب بودند... داستان هنوز تمام نشده بود.', 'n', 'sh11n'); } catch (e) {}
      }
      SHEL.fade = clamp((SHEL.t - 3.6) / 1.6, 0, 1);
      if (SHEL.t >= 5.4) startTbcScreen();
    }
  } else if (ph === 'tbc') {
    /* تایپ تدریجی «این داستان ادامه دارد...» */
    const full = 'این داستان ادامه دارد...';
    if (SHEL.typed < full.length) {
      SHEL.typeAcc = (SHEL.typeAcc || 0) + dt * 7.5;
      while (SHEL.typeAcc >= 1 && SHEL.typed < full.length) {
        SHEL.typeAcc -= 1;
        SHEL.typed++;
        if (SHEL.typed % 3 === 0) SFX.click();
      }
      const el = $('tbcTitle');
      if (el) el.innerHTML = full.slice(0, SHEL.typed) + '<span class="tbccaret">▌</span>';
    } else {
      if (!SHEL.tbcDone) {
        SHEL.tbcDone = true;
        const el = $('tbcTitle');
        if (el) el.textContent = full;
        $('tbcSub').classList.add('on');
        $('tbcTease').classList.add('on');
        $('tbcRow').classList.add('on');
        try { VOICE.speak(full, 'n', 'tbc1n'); } catch (e) {}
        SFX.heartbeat();
      }
      SHEL.teaseT = (SHEL.teaseT || 0) + dt;
      if (SHEL.teaseT > 2.2) { SHEL.teaseT = 0; SFX.heartbeat(); }
    }
  }
}

function setTimedShelterSubs(list) {
  if (!list) return;
  for (const s of list) {
    if (SHEL.t >= s[0] && SHEL.t <= s[1] && SHEL.sub !== s[2]) {
      SHEL.sub = s[2]; SHEL.subT = s[1] - s[0];
    }
  }
}

/* ---------------------- ۱۳-۳) «این داستان ادامه دارد...» ---------------------- */
function startTbcScreen() {
  if (!SHEL) return;
  SHEL.phase = 'tbc';
  SHEL.t = 0;
  SHEL.typed = 0;
  DLG.skip();
  VOICE.stop();
  $('tbcTitle').textContent = '';
  $('tbcSub').classList.remove('on');
  $('tbcTease').classList.remove('on');
  $('tbcRow').classList.remove('on');
  showScreen('tbcScreen');
  SFX.slowmo();
}

/* دکمه‌ی اصلی «ادامه دارد» (۲۰٫۰): بازگشت به منو — طبق بازخورد کاربر،
   دکمه دیگر به صفحه‌ی پیروزی نمی‌رود؛ کارنامه از دکمه‌ی کوچک جدا باز می‌شود */
function tbcContinueToMenu() {
  if (!SHEL) return;
  SFX.click();
  shelterHardReset();
  exitToMenu();
}
/* دکمه‌ی کوچک: فقط دیدن کارنامه‌ی آمار (اختیاری) */
function tbcShowStats() {
  if (!SHEL) return;
  SFX.click();
  shelterHardReset();
  victory();
}

/* ---------------------- ۱۳-۴) رندر کات‌سین پناهگاه ---------------------- */
function renderShelterCine() {
  if (!SHEL) return;
  const ph = SHEL.phase;
  const t = SHEL.t;
  ctx.save();
  if (state.shake > 0.2 && SETT.shake) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);

  if (ph === 'walk') renderShelterWalk(t);
  else if (ph === 'gate') renderShelterGate(t);
  else if (ph === 'inside' || ph === 'alarm' || ph === 'tbc') renderShelterInside(t, ph);

  /* زیرنویس سینمایی (مراحل بدون DLG) */
  if (SHEL.subT > 0 && SHEL.sub && ph !== 'tbc') {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 14.5px Tahoma, sans-serif';
    const a = Math.min(1, SHEL.subT / 0.3);
    ctx.globalAlpha = a;
    const tw = ctx.measureText(SHEL.sub).width + 30;
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    rr(W / 2 - tw / 2, H - 60, tw, 27, 13); ctx.fill();
    ctx.fillStyle = '#f3e9cf';
    ctx.fillText(SHEL.sub, W / 2, H - 46);
    ctx.globalAlpha = 1;
  }
  /* محوِ سیاهِ انتقال‌ها */
  if (SHEL.fade > 0.003) {
    ctx.fillStyle = 'rgba(0,0,0,' + SHEL.fade.toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  drawParticles();
  drawTexts();
  ctx.restore();
}

/* --- صحنه‌ی ۱: پیاده‌روی سحرگاهی تا پناهگاه --- */
function renderShelterWalk(t) {
  const d = 0.9;                                   /* سحرِ روشن */
  /* آسمانِ سحر گرم */
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#2c2440'); g.addColorStop(0.45, '#7a4a3a'); g.addColorStop(0.8, '#d88a4e'); g.addColorStop(1, '#f0c884');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, GROUND_Y + 40);
  /* خورشیدِ تازه‌درآمده (۲۱٫۳: نسبت به W) */
  const sx = Math.round(W * 0.135), sy = 120;
  const sg = ctx.createRadialGradient(sx, sy, 8, sx, sy, 120);
  sg.addColorStop(0, 'rgba(255,220,150,0.8)'); sg.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = sg; circle(sx, sy, 120);
  ctx.fillStyle = '#ffe9a8'; circle(sx, sy, 26);
  /* تپه‌های دور */
  ctx.fillStyle = '#3a2c34';
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y - 40);
  const hn = Math.ceil((W + 60) / 130);        /* (۲۱٫۳) تعداد تپه‌ها نسبت به عرض */
  for (let i = 0; i < hn; i++) {
    const x = i * 130 - 30;
    ctx.lineTo(x + 65, GROUND_Y - 96 - ((i * 53) % 70));
    ctx.lineTo(x + 130, GROUND_Y - 34);
  }
  ctx.lineTo(W + 20, GROUND_Y - 40); ctx.closePath(); ctx.fill();
  /* تپه‌ی پناهگاه (راست) + درِ فولادی + چراغ‌هایش — (۲۱٫۳: نسبت به W) */
  const hx = Math.round(W * 0.8), hy = GROUND_Y;
  ctx.fillStyle = '#2c2230';
  ctx.beginPath();
  ctx.moveTo(hx - 190, hy);
  ctx.quadraticCurveTo(hx - 150, hy - 210, hx + 10, hy - 236);
  ctx.quadraticCurveTo(hx + 160, hy - 210, hx + 190, hy);
  ctx.closePath(); ctx.fill();
  /* درِ فولادی وسطِ تپه */
  const dw = 108, dh = 128;
  ctx.fillStyle = '#39424e';
  rr(hx - dw / 2, hy - dh, dw, dh, 9); ctx.fill();
  ctx.fillStyle = '#4a5664';
  for (let i = 0; i < 5; i++) ctx.fillRect(hx - dw / 2 + 10, hy - dh + 12 + i * 24, dw - 20, 6);
  ctx.strokeStyle = '#242c36'; ctx.lineWidth = 3;
  rr(hx - dw / 2, hy - dh, dw, dh, 9); ctx.stroke();
  /* چراغ‌های سبز دو طرف در */
  ctx.fillStyle = '#7be389'; circle(hx - dw / 2 - 12, hy - dh - 8, 3.4);
  ctx.fillStyle = '#7be389'; circle(hx + dw / 2 + 12, hy - dh - 8, 3.4);
  const lg = ctx.createRadialGradient(hx - dw / 2 - 12, hy - dh - 8, 2, hx - dw / 2 - 12, hy - dh - 8, 22);
  lg.addColorStop(0, 'rgba(123,227,137,0.5)'); lg.addColorStop(1, 'rgba(123,227,137,0)');
  ctx.fillStyle = lg; circle(hx - dw / 2 - 12, hy - dh - 8, 22);
  /* دکل رادیویی بالای تپه + چراغ قرمز */
  ctx.strokeStyle = '#241c28'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hx + 6, hy - 228); ctx.lineTo(hx + 6, hy - 316);
  ctx.moveTo(hx - 4, hy - 252); ctx.lineTo(hx + 16, hy - 262);
  ctx.moveTo(hx - 4, hy - 282); ctx.lineTo(hx + 16, hy - 292);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,86,70,' + (0.5 + 0.5 * Math.sin(animTime * 3)).toFixed(2) + ')';
  circle(hx + 6, hy - 318, 3);
  /* زمین */
  const gg = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gg.addColorStop(0, '#4a3a30'); gg.addColorStop(1, '#2c221c');
  ctx.fillStyle = gg; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  ctx.fillStyle = 'rgba(255,200,130,0.12)';
  ctx.fillRect(-20, GROUND_Y, W + 40, 3);
  /* جاده‌ی خاکی تا در (۲۱٫۳: نسبت به W) */
  ctx.fillStyle = 'rgba(96,74,56,0.6)';
  ctx.beginPath();
  ctx.moveTo(W * 0.31, H); ctx.lineTo(W * 0.58, GROUND_Y - 6);
  ctx.lineTo(W * 0.71, GROUND_Y - 6); ctx.lineTo(W * 0.92, H);
  ctx.closePath(); ctx.fill();
  /* دو مسافر (بازیکن + ارشان) که نزدیک می‌شوند — (۲۱٫۳: نسبت به W) */
  const k = clamp(t / 6.2, 0, 1);
  const bx = W * 0.31 + k * W * 0.34;
  const sc = 1.25 + k * 0.5;
  drawShelterWalker(bx, GROUND_Y - 2, sc, -0.9, false);
  drawShelterWalker(bx - 34 * sc, GROUND_Y + 2, sc * 0.96, -0.7, true);
}

/* مسافرِ سحرگاهی — ارشان=true: کلاه قرمز + رادیو روی شانه
   (۲۱٫۲) پارامتر idle: ایستادنِ آرام با نفس‌کشیدن — قبلاً پاها حتی
   وقتی شخصیت ساکن ایستاده بود هم قدم می‌زدند (درخواست کاربر).
   کیفیت رسم هم بالا رفت: اندام دوبندی، سایه‌روشن، جزئیات لباس. */
function drawShelterWalker(x, y, sc, aim, arshan, idle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const OUT = 'rgba(8,12,20,0.5)';
  const breathe = Math.sin(animTime * 1.7) * 0.8;
  const step = idle ? 0 : animTime * 7 + (arshan ? 1.4 : 0);
  const legA = idle ? 0 : Math.sin(step) * 12;
  const bob = idle ? breathe * 0.6 : Math.abs(Math.sin(step)) * 0.9;
  ctx.translate(0, -bob);
  /* سایه */
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها (در حالت idle صاف و کنار هم) */
  ctx.strokeStyle = OUT; ctx.lineWidth = 6.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -13); ctx.lineTo(-3 + legA, -1);
  ctx.moveTo(3, -13); ctx.lineTo(3 - legA, -1);
  ctx.stroke();
  ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-3, -13); ctx.lineTo(-3 + legA, -1);
  ctx.moveTo(3, -13); ctx.lineTo(3 - legA, -1);
  ctx.stroke();
  /* بوت‌ها */
  ctx.fillStyle = '#1a2033';
  rr(-6.4 + legA, -1.8, 6, 2.6, 1); ctx.fill();
  rr(0.4 - legA, -1.8, 6, 2.6, 1); ctx.fill();
  /* کوله‌پشتی */
  ctx.fillStyle = '#6a4a2c'; rr(-14.6, -27, 6.4, 12, 2.5); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 0.9; rr(-14.6, -27, 6.4, 12, 2.5); ctx.stroke();
  ctx.fillStyle = '#4a3320'; ctx.fillRect(-14.6, -22, 6.4, 1.4);
  /* بدن (بازیکن: آبی؛ ارشان: سبز) + سایه‌روشن */
  const bodyG = ctx.createLinearGradient(-8, -28, 8, -11);
  if (arshan) { bodyG.addColorStop(0, '#5b8f5b'); bodyG.addColorStop(0.5, '#4a7a4a'); bodyG.addColorStop(1, '#315231'); }
  else { bodyG.addColorStop(0, '#4a7cc9'); bodyG.addColorStop(0.5, '#3d6db5'); bodyG.addColorStop(1, '#26324d'); }
  ctx.fillStyle = bodyG;
  rr(-8, -27, 16, 16, 5); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(-8, -27, 16, 16, 5); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; rr(-7.2, -26.2, 6, 3, 1.5); ctx.fill();
  ctx.strokeStyle = '#d8e2f2'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(0, -25.5); ctx.lineTo(0, -13); ctx.stroke();   // زیپ
  /* سر */
  ctx.fillStyle = '#f0c49a'; circle(2, -32, 6);
  ctx.fillStyle = arshan ? '#7a2a2a' : '#2c3550';
  ctx.beginPath(); ctx.arc(2, -32, 6.2, Math.PI, Math.PI * 2); ctx.fill();
  if (arshan) ctx.fillRect(-4.4, -33, 13, 3.4);   // لبه‌ی کلاه باک‌اسکی
  ctx.fillStyle = '#1d2433';
  circle(0.4, -33, 0.95); circle(4.6, -33, 0.95); // چشم‌ها
  ctx.strokeStyle = OUT; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(2, -32, 6.2, Math.PI, Math.PI * 2); ctx.stroke();
  /* رادیوی روی شانه‌ی ارشان */
  if (arshan) {
    ctx.fillStyle = '#3a2c1a'; rr(-6.4, -38.5, 8, 5.6, 1.6); ctx.fill();
    ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0.4, -38.5); ctx.lineTo(2.4, -43); ctx.stroke();
    ctx.fillStyle = '#c9a24e'; ctx.fillRect(-5, -37.4, 5, 2.4);
  }
  /* بازوها: راه‌رفتن (تقابل با پاها) / ایستادن (آرام کنار بدن) */
  const armA = idle ? 0.5 : legA * 0.7;
  ctx.strokeStyle = OUT; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-3, -24); ctx.lineTo(-3 - armA, -16);
  ctx.moveTo(4, -24); ctx.lineTo(4 + armA, -16);
  ctx.stroke();
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(-3, -24); ctx.lineTo(-3 - armA, -16);
  ctx.moveTo(4, -24); ctx.lineTo(4 + armA, -16);
  ctx.stroke();
  ctx.restore();
}

/* --- صحنه‌ی ۲: بازشدن دروازه --- */
function renderShelterGate(t) {
  const k = clamp((t - 0.3) / 2.6, 0, 1);          /* در بالا می‌رود */
  /* پس‌زمینه: دهلیز تیره + درِ بالا رونده */
  ctx.fillStyle = '#0a0c14'; ctx.fillRect(-20, -20, W + 40, H + 40);
  /* قاب دروازه */
  const gx = W / 2, gy = GROUND_Y + 46;
  const dw = 300, dh = 330;
  ctx.fillStyle = '#1c222e';
  rr(gx - dw / 2 - 26, gy - dh - 26, dw + 52, dh + 26, 14); ctx.fill();
  /* نورِ داخل پناهگاه که از در می‌ریزد */
  const glow = ctx.createLinearGradient(0, gy - dh, 0, gy);
  glow.addColorStop(0, 'rgba(255,214,138,' + (0.25 + k * 0.5).toFixed(2) + ')');
  glow.addColorStop(1, 'rgba(255,214,138,' + (0.1 + k * 0.25).toFixed(2) + ')');
  ctx.fillStyle = glow;
  ctx.fillRect(gx - dw / 2, gy - dh, dw, dh);
  /* درِ فولادی که بالا می‌رود */
  const rise = k * dh * 0.86;
  ctx.fillStyle = '#39424e';
  rr(gx - dw / 2, gy - dh - rise, dw, dh, 8); ctx.fill();
  ctx.fillStyle = '#4a5664';
  for (let i = 0; i < 9; i++) ctx.fillRect(gx - dw / 2 + 14, gy - dh - rise + 16 + i * 34, dw - 28, 8);
  ctx.strokeStyle = '#242c36'; ctx.lineWidth = 4;
  rr(gx - dw / 2, gy - dh - rise, dw, dh, 8); ctx.stroke();
  /* پرتوهای نور از شکاف پایینِ در */
  if (k > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a2 = (i - 2.5) * 0.1;
      const lg = ctx.createLinearGradient(gx, gy - rise, gx + a2 * 300, gy);
      lg.addColorStop(0, 'rgba(255,220,150,' + (0.16 * k).toFixed(2) + ')');
      lg.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.moveTo(gx - 60, gy - rise - 10); ctx.lineTo(gx + 60, gy - rise - 10);
      ctx.lineTo(gx + 60 + a2 * 300 + 90, gy); ctx.lineTo(gx - 60 + a2 * 300 - 90, gy);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  /* زمینِ دهلیز */
  ctx.fillStyle = '#141822';
  ctx.fillRect(-20, gy, W + 40, H - gy + 20);
  ctx.fillStyle = 'rgba(255,214,138,' + (0.1 + k * 0.14).toFixed(2) + ')';
  ctx.fillRect(gx - dw / 2, gy, dw, 5);
  /* سایه‌ی دو مسافر که وارد نور می‌شوند (از پایینِ قاب) */
  const wx = gx - 40 - k * 30;
  ctx.save();
  ctx.globalAlpha = 0.92;
  drawShelterWalker(wx, gy - 4, 2.2, 0, false);
  drawShelterWalker(wx - 60, gy + 2, 2.1, 0, true);
  ctx.restore();
}

/* --- صحنه‌ی ۳: داخل پناهگاه — بازطراحی ۲۰٫۰ ---
   (بازخورد کاربر: «داخل پناهگاه خیلی بد دیده می‌شه»)
   حالا یک سالنِ بتنیِ «تک‌نقطه‌ای» با عمق واقعی است:
     • دیوارهای جانبی همگرا + سقف تیرک‌دار با لوله‌ها و سیم‌های کشیده
     • کف با شیارهای همگرا + بازتاب چراغ‌ها
     • دیوار انتهایی: درِ فولادی چرخ‌دار + نقشه‌ی شهر سنجاقی + تخته‌گچی
     • چپ: آشپزخانه (قفسه‌ی کنسرو + بخاریِ ذغالی با لوله و شعله) • راست:
       تخت‌های دوطبقه + جعبه‌ها و بشکه‌ها + بند رخت با لباس
     • میز رادیو وسط + ایستگاه کمک‌های دکتر مریم + ۵ بازمانده‌ی زنده
       (پیرمردِ عصایی، زنِ بافتنی، بچه‌ی خوابیده، نگهبانِ در، پتوپیچ)
     • سه چراغ آویز با مخروط نورِ حجمی + گردوغبار معلق + وینیت */
function renderShelterInside(t, ph) {
  const alarm = ph === 'alarm' || ph === 'tbc';
  /* نقطه‌ی گریز پرسپکتیو و قاب دیوار انتهایی */
  const VX = W / 2, VY = 232;
  const BW = 300, BH = 262;                       /* پهنای دیوار عقب */
  const bx0 = VX - BW / 2, bx1 = VX + BW / 2;      /* 330..630 */
  const byT = VY - BH / 2 + 12, byB = VY + BH / 2 + 12;   /* ~123..385 */
  /* (21.3) DX: furniture designed for 960-world; on wide screens the room
     widens around VX so the whole layout shifts with it (zero at W=960) */
  const DX = VX - 480;

  /* ===== پس‌زمینه‌ی کلی ===== */
  ctx.fillStyle = '#0d1018'; ctx.fillRect(-20, -20, W + 40, H + 40);

  /* ===== دیوار انتهایی ===== */
  const wg = ctx.createLinearGradient(0, byT, 0, byB);
  wg.addColorStop(0, '#1a1f2c'); wg.addColorStop(0.6, '#232a3a'); wg.addColorStop(1, '#2c3546');
  ctx.fillStyle = wg; ctx.fillRect(bx0, byT, BW, BH);
  /* درزهای بتنی دیوار عقب */
  ctx.strokeStyle = 'rgba(8,10,16,0.55)'; ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    const y = byT + (BH / 4) * i;
    ctx.beginPath(); ctx.moveTo(bx0, y); ctx.lineTo(bx1, y); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(VX, byT); ctx.lineTo(VX, byB); ctx.stroke();

  /* ===== دیوارهای جانبیِ همگرا ===== */
  const wallL = ctx.createLinearGradient(0, 0, bx0, 0);
  wallL.addColorStop(0, '#151a26'); wallL.addColorStop(1, '#232a3a');
  ctx.fillStyle = wallL;
  ctx.beginPath();
  ctx.moveTo(-20, -20); ctx.lineTo(bx0, byT); ctx.lineTo(bx0, byB); ctx.lineTo(-20, H + 20);
  ctx.closePath(); ctx.fill();
  const wallR = ctx.createLinearGradient(W, 0, bx1, 0);
  wallR.addColorStop(0, '#151a26'); wallR.addColorStop(1, '#232a3a');
  ctx.fillStyle = wallR;
  ctx.beginPath();
  ctx.moveTo(W + 20, -20); ctx.lineTo(bx1, byT); ctx.lineTo(bx1, byB); ctx.lineTo(W + 20, H + 20);
  ctx.closePath(); ctx.fill();
  /* درزهای موربِ دیوار جانبی */
  ctx.strokeStyle = 'rgba(8,10,16,0.4)'; ctx.lineWidth = 1.6;
  for (let i = 1; i <= 4; i++) {
    const k = i / 5;
    ctx.beginPath();
    ctx.moveTo(-20, k * (H + 20));
    ctx.lineTo(bx0, byT + k * (byB - byT));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W + 20, k * (H + 20));
    ctx.lineTo(bx1, byT + k * (byB - byT));
    ctx.stroke();
  }

  /* ===== سقف: تیرک‌ها + لوله‌ها + سیم‌ها ===== */
  const cg = ctx.createLinearGradient(0, 0, 0, byT);
  cg.addColorStop(0, '#0e1219'); cg.addColorStop(1, '#1c2230');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(-20, -20); ctx.lineTo(W + 20, -20); ctx.lineTo(bx1, byT); ctx.lineTo(bx0, byT);
  ctx.closePath(); ctx.fill();
  /* تیرک‌های عرضی (به سمت گریز) */
  ctx.strokeStyle = 'rgba(6,9,14,0.75)'; ctx.lineWidth = 7;
  for (let i = 0; i < 5; i++) {
    const k = (i + 0.6) / 5.4;
    const xL = -20 + (bx0 + 20) * k, xR = W + 20 - (W + 20 - bx1) * k;
    const y = -18 + (byT + 18) * k;
    ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xR, y); ctx.stroke();
  }
  /* دو لوله‌ی بخار در طول سقفِ راست */
  ctx.strokeStyle = '#39424e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(W + 16, 44); ctx.lineTo(bx1 - 8, byT + 34); ctx.stroke();
  ctx.strokeStyle = '#4a5664'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(W + 16, 26); ctx.lineTo(bx1 - 20, byT + 22); ctx.stroke();
  /* یقه‌های لوله */
  ctx.fillStyle = '#5d6a7a';
  for (let i = 0; i < 4; i++) {
    const k = (i + 0.5) / 4;
    const x = W + 16 - (W + 16 - bx1 + 8) * k, y = 44 - (44 - byT - 34) * k;
    ctx.fillRect(x - 4, y - 6, 8, 12);
  }
  /* سیم برق آویزان روی چپ */
  ctx.strokeStyle = 'rgba(16,20,28,0.9)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-16, 30);
  ctx.quadraticCurveTo(VX - 40, 96, bx0 + 10, byT + 28);
  ctx.stroke();

  /* ===== کف: بتنی با شیارهای همگرا ===== */
  const fg = ctx.createLinearGradient(0, byB, 0, H);
  fg.addColorStop(0, '#232a38'); fg.addColorStop(1, '#2e3748');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-20, H + 20); ctx.lineTo(bx0, byB); ctx.lineTo(bx1, byB); ctx.lineTo(W + 20, H + 20);
  ctx.closePath(); ctx.fill();
  /* شیارها */
  ctx.strokeStyle = 'rgba(10,13,20,0.5)'; ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(VX + i * 46, byB);
    ctx.lineTo(VX + i * 240, H + 20);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const k = (i + 0.7) / 4;
    ctx.beginPath();
    ctx.moveTo(-20, byB + k * (H - byB) * 1.1);
    ctx.lineTo(W + 20, byB + k * (H - byB) * 1.1);
    ctx.stroke();
  }

  /* ===== دیوار عقب: درِ فولادی + نقشه + تخته‌گچی ===== */
  /* درِ فولادی وسط */
  const dw2 = 76, dx = VX - dw2 / 2, dyT = byT + 62, dyB = byB - 4;
  ctx.fillStyle = '#39424e'; rr(dx, dyT, dw2, dyB - dyT, 7); ctx.fill();
  ctx.fillStyle = '#4a5664';
  for (let i = 0; i < 5; i++) ctx.fillRect(dx + 7, dyT + 10 + i * 24, dw2 - 14, 5);
  ctx.strokeStyle = '#242c36'; ctx.lineWidth = 2.4; rr(dx, dyT, dw2, dyB - dyT, 7); ctx.stroke();
  /* چرخِ قفل در */
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 3;
  circle(VX, dyT + (dyB - dyT) / 2, 9); ctx.stroke();
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.moveTo(VX + Math.cos(a) * 9, dyT + (dyB - dyT) / 2 + Math.sin(a) * 9);
    ctx.lineTo(VX + Math.cos(a) * 13, dyT + (dyB - dyT) / 2 + Math.sin(a) * 13);
  }
  ctx.stroke();
  ctx.fillStyle = alarm && Math.sin(t * 8) > 0 ? '#ff4b3e' : '#7be389';
  circle(dx - 12, dyT - 8, 3);
  circle(dx + dw2 + 12, dyT - 8, 3);
  /* نقشه‌ی شهر سنجاقی (چپِ در) */
  ctx.save();
  ctx.translate(bx0 + 24, byT + 26);
  ctx.fillStyle = '#cbb98a'; rr(0, 0, 66, 52, 3); ctx.fill();
  ctx.fillStyle = 'rgba(60,54,40,0.25)'; rr(0, 0, 66, 52, 3); ctx.fill();
  ctx.strokeStyle = '#5a5040'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(8, 12); ctx.lineTo(26, 8); ctx.lineTo(44, 18); ctx.lineTo(58, 12);
  ctx.moveTo(12, 34); ctx.lineTo(30, 26); ctx.lineTo(50, 36);
  ctx.stroke();
  /* پین‌های قرمز = آلودگی */
  ctx.fillStyle = '#d84a3a';
  circle(20, 18, 2.6); circle(40, 30, 2.6); circle(52, 15, 2.6);
  /* دایره‌ی سبز = پناهگاه */
  ctx.strokeStyle = '#2e8a4a'; ctx.lineWidth = 1.8;
  circle(46, 40, 6); ctx.stroke();
  ctx.restore();
  /* تخته‌گچی (راستِ در): خط‌کشیِ روزهای مانده */
  ctx.save();
  ctx.translate(bx1 - 92, byT + 24);
  ctx.fillStyle = '#2c3630'; rr(0, 0, 70, 48, 3); ctx.fill();
  ctx.strokeStyle = '#4a5a4e'; ctx.lineWidth = 2; rr(0, 0, 70, 48, 3); ctx.stroke();
  ctx.strokeStyle = 'rgba(226,232,240,0.75)'; ctx.lineWidth = 1.2;
  for (let r = 0; r < 4; r++) {
    for (let c2 = 0; c2 < 7; c2++) {
      if (r * 7 + c2 > 26) break;
      ctx.beginPath();
      ctx.moveTo(8 + c2 * 8.6, 10 + r * 9.5);
      ctx.lineTo(12 + c2 * 8.6, 14 + r * 9.5);
      ctx.stroke();
    }
  }
  ctx.restore();

  /* ===== آشپزخانه چپ (۲۱٫۲: همه‌چیز به دیوار/کف چسبیده — چیدمان منطقی) ===== */
  /* قفسه‌ی کنسرو دوطبقه — روی دیوار جانبی */
  ctx.save(); ctx.translate(DX, 0);            /* (21.3) kitchen block */
  for (let s = 0; s < 2; s++) {
    const sx = 88 + s * 8, sy = 288 + s * 66;
    const sw = 168 - s * 10;
    ctx.fillStyle = '#3a2c1a'; rr(sx, sy, sw, 9, 3); ctx.fill();
    ctx.strokeStyle = '#241a10'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx + 5, sy); ctx.lineTo(sx + 1, sy + 52);
    ctx.moveTo(sx + sw - 5, sy); ctx.lineTo(sx + sw - 1, sy + 52);
    ctx.stroke();
    for (let j = 0; j < 6; j++) {
      ctx.fillStyle = ['#7a4a28', '#5a6a3a', '#8a5a3a', '#4a5a6a'][(s * 6 + j) % 4];
      rr(sx + 8 + j * (sw - 16) / 6, sy - 21, 15, 21, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(sx + 8 + j * (sw - 16) / 6, sy - 19, 15, 4);
    }
  }
  /* گلدان آب روی قفسه‌ی دوم — دیگر وسط هوا شناور نیست */
  ctx.fillStyle = '#7fb3c9'; rr(146, 324, 22, 30, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(146, 324, 22, 6);
  ctx.strokeStyle = '#5d8ba3'; ctx.lineWidth = 1.4; rr(146, 324, 22, 30, 4); ctx.stroke();
  ctx.fillStyle = '#8fc9dd'; rr(150, 318, 14, 7, 2); ctx.fill();
  /* بخاری ذغالی — کنجِ دیوار (پایه‌ش روی خط دیوار/کف) + لوله در امتداد دیوار */
  const stx = 252, sty = 428;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(stx, sty, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c2622'; rr(stx - 22, sty - 54, 44, 54, 6); ctx.fill();
  ctx.strokeStyle = '#4a4038'; ctx.lineWidth = 2; rr(stx - 22, sty - 54, 44, 54, 6); ctx.stroke();
  const fireA = 0.65 + 0.35 * Math.sin(t * 7.3);
  const fr = ctx.createRadialGradient(stx, sty - 26, 3, stx, sty - 26, 26);
  fr.addColorStop(0, 'rgba(255,150,60,' + (0.55 * fireA).toFixed(2) + ')');
  fr.addColorStop(1, 'rgba(255,110,40,0)');
  ctx.fillStyle = fr; circle(stx, sty - 26, 26);
  ctx.fillStyle = 'rgba(255,180,80,' + (0.8 * fireA).toFixed(2) + ')';
  rr(stx - 10, sty - 32, 20, 14, 4); ctx.fill();
  ctx.strokeStyle = '#39424e'; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(stx + 14, sty - 50);
  ctx.quadraticCurveTo(stx + 44, sty - 92, stx + 58, sty - 140);
  ctx.stroke();
  ctx.restore();                                /* (21.3) end kitchen block */

  /* تخت دوطبقه */
  ctx.save(); ctx.translate(DX, 0);            /* (21.3) sleeping-area block */
  const bx = 688, by = 300;
  ctx.strokeStyle = '#39424e'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx, by); ctx.lineTo(bx, by + 210);
  ctx.moveTo(bx + 150, by - 8); ctx.lineTo(bx + 150, by + 210);
  ctx.stroke();
  for (let lvl = 0; lvl < 2; lvl++) {
    const ly = by + 34 + lvl * 86;
    ctx.fillStyle = '#2c3440'; rr(bx - 4, ly, 158, 11, 4); ctx.fill();
    /* پتو + بالش */
    ctx.fillStyle = lvl ? '#7a6a8a' : '#5a7a6a';
    rr(bx + 4, ly - 7, 92, 10, 4); ctx.fill();
    ctx.fillStyle = '#d8d2c4'; rr(bx + 118, ly - 9, 30, 12, 5); ctx.fill();
  }
  /* بچه‌ی خوابیده روی تخت پایین (پتوپیچِ نفس‌کش) */
  const kidB = Math.sin(animTime * 1.4) * 1.3;
  ctx.save();
  ctx.translate(bx + 46, by + 120 + kidB);
  ctx.fillStyle = '#8a7f9a';
  ctx.beginPath(); ctx.ellipse(0, -4, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c9a084'; circle(26, -8, 6.4);
  ctx.fillStyle = '#4a3d2a';
  ctx.beginPath(); ctx.arc(26, -8, 6.6, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();
  ctx.restore();
  /* جعبه‌ها و بشکه‌ها */
  ctx.fillStyle = '#4a3a22'; rr(660, 430, 52, 46, 4); ctx.fill();
  ctx.strokeStyle = '#2c2012'; ctx.lineWidth = 2; rr(660, 430, 52, 46, 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(660, 452); ctx.lineTo(712, 452); ctx.stroke();
  ctx.fillStyle = '#3f4a5e'; rr(668, 476, 34, 40, 4); ctx.fill();
  ctx.strokeStyle = '#5d6a7a'; ctx.lineWidth = 1.5; rr(668, 476, 34, 40, 4); ctx.stroke();
  /* بشکه‌ی سوخت با علامت خطر */
  ctx.fillStyle = '#7a4a28'; rr(832, 440, 34, 44, 5); ctx.fill();
  ctx.fillStyle = '#e8b54a';
  ctx.font = 'bold 13px Tahoma'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('⚡', 849, 462);
  ctx.restore();                                /* (21.3) end sleeping-area block */
  /* بند رخت با دو لباس — (۲۱٫۳: نقاط نسبت به VX؛ سرِ بند به دیوار راست) */
  ctx.strokeStyle = 'rgba(200,205,215,0.35)'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(W + 10, 250);
  ctx.quadraticCurveTo(VX + 300, 300, VX + 220, 286);
  ctx.stroke();
  ctx.fillStyle = '#6a5a8a';
  ctx.beginPath();
  ctx.moveTo(VX + 310, 280); ctx.lineTo(VX + 326, 280); ctx.lineTo(VX + 323, 318); ctx.lineTo(VX + 313, 318);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a6a4a';
  ctx.beginPath();
  ctx.moveTo(VX + 268, 288); ctx.lineTo(VX + 280, 288); ctx.lineTo(VX + 278, 320); ctx.lineTo(VX + 270, 320);
  ctx.closePath(); ctx.fill();

  /* ===== قالیچه‌ی گفتگو — محدوده‌ی میز/گروه را مشخص می‌کند (۲۱٫۲ — ۲۱٫۳: +DX) ===== */
  ctx.fillStyle = 'rgba(122,58,58,0.30)';
  ctx.beginPath();
  ctx.moveTo(452 + DX, 396); ctx.lineTo(588 + DX, 396);
  ctx.lineTo(640 + DX, 548); ctx.lineTo(396 + DX, 548);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(201,162,78,0.22)'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(458 + DX, 400); ctx.lineTo(582 + DX, 400);
  ctx.lineTo(632 + DX, 543); ctx.lineTo(404 + DX, 543);
  ctx.closePath(); ctx.stroke();

  /* ===== بازمانده‌ها (۲۱٫۲: هر کس سرِ جای منطقی خودش — ۲۱٫۳: +DX) ===== */
  drawShelterSurvivorOld(296 + DX, 470, animTime);       /* پیرمردِ عصایی کنارِ بخاری */
  drawShelterSurvivorKnit(258 + DX, 505, animTime);      /* زنِ بافتنی زیر چراغِ اول */
  drawShelterSurvivor(612 + DX, 392, '#6a5a8a', 0);      /* پتوپیچ کنار تخت‌ها */
  drawShelterGuard(bx1 - 40, byB - 10, animTime);      /* نگهبانِ کنارِ درِ فولادی (وابسته به دیوار) */

  /* ===== میز رادیو وسط + ایستگاه دکتر (۲۱٫۳: rx با DX) ===== */
  const rx = 468 + DX, ry = 512;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(rx, ry + 4, 86, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2c1a'; rr(rx - 72, ry - 42, 144, 42, 6); ctx.fill();
  ctx.fillStyle = '#2c2012';
  ctx.fillRect(rx - 64, ry - 4, 11, 34); ctx.fillRect(rx + 53, ry - 4, 11, 34);
  /* رادیوی بزرگ روی میز */
  ctx.fillStyle = '#4a3a22'; rr(rx - 42, ry - 92, 84, 50, 7); ctx.fill();
  ctx.fillStyle = '#c9a24e'; rr(rx - 32, ry - 84, 64, 26, 5); ctx.fill();
  ctx.fillStyle = 'rgba(30,20,6,0.9)'; rr(rx - 28, ry - 80, 56, 18, 4); ctx.fill();
  const dial = alarm ? Math.sin(t * 22) * 20 : Math.sin(t * 2) * 6;
  ctx.strokeStyle = 'rgba(255,90,70,0.9)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(rx, ry - 71); ctx.lineTo(rx + dial, ry - 75); ctx.stroke();
  ctx.fillStyle = alarm && Math.sin(t * 10) > 0 ? '#ff4b3e' : '#7a5a2e';
  circle(rx + 30, ry - 56, 3);
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(rx + 34, ry - 92); ctx.lineTo(rx + 54, ry - 130); ctx.stroke();
  const rwA = alarm ? 0.55 : 0.22;
  ctx.strokeStyle = 'rgba(140,190,255,' + rwA.toFixed(2) + ')';
  for (let i = 0; i < 3; i++) {
    const ph2 = (animTime * (alarm ? 1.6 : 0.7) + i * 0.33) % 1;
    ctx.globalAlpha = (1 - ph2) * 0.6;
    ctx.beginPath();
    ctx.arc(rx + 42, ry - 104, 16 + ph2 * (alarm ? 150 : 80), -0.9, 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  /* ایستگاه کمک‌های اولیه (۲۱٫۲: کابینت به دیوارِ چپ چسبیده، پشتِ دکتر —
     قبلاً صندوق و ستاند سرم وسطِ راهرو‌ی ورودی وسط هوا شناور بودند) */
  ctx.save(); ctx.translate(DX, 0);            /* (21.3) med-station block */
  ctx.fillStyle = '#5a2220'; rr(216, 398, 46, 58, 4); ctx.fill();
  ctx.strokeStyle = '#7a3a34'; ctx.lineWidth = 2; rr(216, 398, 46, 58, 4); ctx.stroke();
  ctx.fillStyle = '#8a3a30'; rr(222, 406, 34, 22, 3); ctx.fill();      // صندوق قرمز روی کابینت
  ctx.fillStyle = '#e8ecf5';
  ctx.fillRect(230, 412, 10, 3.6); ctx.fillRect(230, 419, 10, 3.6);   // علامت صلیب
  ctx.fillStyle = 'rgba(232,236,245,0.75)';
  ctx.fillRect(224, 440, 30, 1.8); ctx.fillRect(224, 448, 30, 1.8);   // درزهای کابینت
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(276, 460); ctx.lineTo(276, 396); ctx.stroke();
  ctx.fillStyle = 'rgba(140,190,255,0.3)';
  ctx.beginPath(); ctx.moveTo(276, 396); ctx.lineTo(270, 408); ctx.lineTo(282, 408);
  ctx.closePath(); ctx.fill();
  /* کیسه‌ی سرمِ آویزان از ستاند */
  ctx.fillStyle = 'rgba(140,190,255,0.5)'; rr(271, 404, 10, 16, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(140,190,255,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(276, 420); ctx.quadraticCurveTo(276, 444, 284, 452); ctx.stroke();
  ctx.restore();                                /* (21.3) end med-station block */

  /* دکتر مریم — جلوی ایستگاهش، رو به بازیکن */
  drawDoctorMary(rx - 128, ry - 8, animTime);
  /* بازیکن (۲۱٫۲: وسطِ جمعیت — کنارِ دکتر و میز؛ ایستاده و آرام) */
  drawShelterWalker(392 + DX, 542, 2.5, 0.3, false, true);
  /* ارشان — پشت میز، دست روی رادیو */
  {
    const ax = rx + 104, ay = ry - 6;
    ctx.save();
    ctx.translate(ax, ay);
    const lean = alarm ? Math.sin(t * 9) * 1.6 : Math.sin(animTime * 2.2) * 1.2;
    ctx.rotate(lean * 0.02);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-5, -1); ctx.moveTo(4, -16); ctx.lineTo(5, -1); ctx.stroke();
    ctx.fillStyle = '#4a7a4a'; rr(-11, -38, 22, 24, 6); ctx.fill();
    ctx.fillStyle = '#f0c49a'; circle(2, -44, 8);
    ctx.fillStyle = '#7a2a2a';
    ctx.beginPath(); ctx.arc(2, -44, 8.4, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(-7, -45, 18, 4);
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-38, -54); ctx.stroke();
    ctx.restore();
  }

  /* ===== سه چراغ آویز + مخروط نور حجمی ===== */
  for (let i = 0; i < 3; i++) {
    const lx = VX - 272 + i * 272;             /* (21.3) lamps follow room center */
    const flick = 0.8 + 0.2 * Math.sin(animTime * (3 + i) + i * 2);
    ctx.strokeStyle = '#0e1218'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, 30); ctx.lineTo(lx, 118); ctx.stroke();
    const col = alarm ? '255,80,60' : '255,214,138';
    ctx.fillStyle = alarm ? '#5a2430' : '#3a3630';
    rr(lx - 13, 118, 26, 11, 5); ctx.fill();
    ctx.fillStyle = 'rgba(' + col + ',' + (0.9 * flick).toFixed(2) + ')';
    circle(lx, 133, 5.5);
    /* مخروط نور حجمی */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cone = ctx.createLinearGradient(0, 133, 0, 520);
    cone.addColorStop(0, 'rgba(' + col + ',' + (0.13 * flick).toFixed(2) + ')');
    cone.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(lx - 9, 133); ctx.lineTo(lx + 9, 133);
    ctx.lineTo(lx + 108, 520); ctx.lineTo(lx - 108, 520);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    /* بازتاب روی کف */
    const pool = ctx.createRadialGradient(lx, 512, 10, lx, 512, 120);
    pool.addColorStop(0, 'rgba(' + col + ',' + (0.10 * flick).toFixed(2) + ')');
    pool.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = pool;
    ctx.beginPath(); ctx.ellipse(lx, 512, 120, 26, 0, 0, Math.PI * 2); ctx.fill();
    /* گردوغبار معلق داخل نور */
    if (Math.random() < 0.16) {
      state.particles.push({
        x: lx + rand(-40, 40), y: rand(150, 460),
        vx: rand(-4, 4), vy: rand(3, 9),
        age: 0, life: rand(1.5, 3.2), size: rand(0.8, 1.6),
        color: 'rgba(255,226,168,0.30)', grav: 0,
      });
    }
  }

  /* ===== آژیر: جاروب قرمز + غبار ===== */
  if (alarm) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4.4);
    ctx.fillStyle = 'rgba(200,30,20,' + (0.1 + pulse * 0.16).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
    const ax = W / 2 + Math.sin(t * 4.4) * 110;
    const ag = ctx.createRadialGradient(ax, 96, 4, ax, 96, 130);
    ag.addColorStop(0, 'rgba(255,60,40,' + (0.4 + pulse * 0.3).toFixed(2) + ')');
    ag.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = ag; circle(ax, 96, 130);
    ctx.fillStyle = '#ff4b3e'; circle(ax, 96, 6);
  }

  /* ===== وینیت سینمایی ===== */
  const vg = ctx.createRadialGradient(VX, 300, 240, VX, 300, 660);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/* بازمانده‌ی پتوپیچ (کنار تخت‌ها) — (۲۱٫۲) پتوی پشمی با بافت */
function drawShelterSurvivor(x, y, col, seed) {
  ctx.save();
  ctx.translate(x, y);
  const breathe = Math.sin(animTime * 1.6 + seed * 2) * 1.4;
  const OUT = 'rgba(8,12,20,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
  const blankG = ctx.createLinearGradient(-14, -34, 14, 0);
  blankG.addColorStop(0, col); blankG.addColorStop(1, 'rgba(30,24,40,0.9)');
  ctx.fillStyle = blankG;
  rr(-14, -34 + breathe, 28, 34, 8); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(-14, -34 + breathe, 28, 34, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(232,226,212,0.22)'; ctx.lineWidth = 1.2;   // بافت پتو
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(-12, -28 + breathe + i * 8); ctx.lineTo(12, -28 + breathe + i * 8);
  }
  ctx.stroke();
  ctx.fillStyle = '#c9a084';
  circle(0, -40 + breathe, 7);
  ctx.fillStyle = 'rgba(30,24,40,0.85)';
  ctx.beginPath(); ctx.arc(0, -40 + breathe, 7.4, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  ctx.fillStyle = '#1d2433'; circle(-2.6, -40 + breathe, 0.9); circle(2.6, -40 + breathe, 0.9);
  ctx.restore();
}

/* پیرمردِ عصایی — روی جعبه‌ی چوبی نشسته کنار بخاری، دست‌ش روی عصا می‌لرزد
   (۲۱٫۲) جعبه‌ی نشیمن + کلاهِ شاپو + سایه‌روشن */
function drawShelterSurvivorOld(x, y, t2) {
  ctx.save();
  ctx.translate(x, y);
  const tremble = Math.sin(t2 * 5.2) * 0.9;
  const OUT = 'rgba(8,12,20,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 19, 5, 0, 0, Math.PI * 2); ctx.fill();
  /* جعبه‌ی چوبی نشیمن */
  ctx.fillStyle = '#4a3a22'; rr(-16, -14, 32, 14, 2); ctx.fill();
  ctx.strokeStyle = '#2c2012'; ctx.lineWidth = 1.6; rr(-16, -14, 32, 14, 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(44,32,18,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-16, -9); ctx.lineTo(16, -9); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(-14, -13, 28, 2);
  /* پالتوی کهنه با گرادیان */
  const coatG = ctx.createLinearGradient(-15, -32, 15, 0);
  coatG.addColorStop(0, '#6a564c'); coatG.addColorStop(0.5, '#54423a'); coatG.addColorStop(1, '#3a2e28');
  ctx.fillStyle = coatG;
  rr(-15, -30, 30, 24, 9); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(-15, -30, 30, 24, 9); ctx.stroke();
  ctx.strokeStyle = '#3a2e28'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, -8); ctx.stroke();   // درز پالتو
  ctx.fillStyle = '#8a97a8'; circle(-2, -24, 0.9); circle(-2, -18, 0.9); // دکمه‌ها
  /* سر + شاپو + موی سفید */
  ctx.fillStyle = '#c9a084'; circle(0, -36, 7);
  ctx.fillStyle = '#d8d2c4';
  ctx.beginPath(); ctx.arc(0, -36, 7.4, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  ctx.beginPath(); ctx.arc(-6.6, -35, 2.6, Math.PI * 0.3, Math.PI * 1.7); ctx.fill();  // ژولای پشت
  ctx.fillStyle = '#4a4038';                                            // شاپو
  ctx.beginPath(); ctx.ellipse(0, -42, 7.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  rr(-5, -46, 10, 5, 2); ctx.fill();
  ctx.fillStyle = '#5a4d44'; ctx.fillRect(-5, -43.4, 10, 1.6);          // نوار شاپو
  ctx.fillStyle = '#1d2433'; circle(-2.6, -36, 0.9); circle(2.6, -36, 0.9);
  ctx.strokeStyle = 'rgba(90,60,50,0.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, -32.4, 1.8, 0.3, Math.PI - 0.3); ctx.stroke();  // لبخند آرام
  /* عصا + دست لرزان روی آن */
  ctx.strokeStyle = '#6a543a'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(20, -26); ctx.stroke();
  ctx.strokeStyle = '#8a7455'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(14.6, -6); ctx.lineTo(19.4, -24); ctx.stroke();  // هایلایت عصا
  ctx.fillStyle = '#8a6f3a'; rr(17.6, -28.4, 5, 4, 1.6); ctx.fill();    // دسته‌ی خمیده
  ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(6 + tremble, -14); ctx.stroke();
  ctx.strokeStyle = '#c9a084'; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.moveTo(-8, -22); ctx.lineTo(6 + tremble, -14); ctx.stroke();
  ctx.restore();
}

/* زنِ بافتنی — روی صندلی، سوزن‌ها حرکت آرام
   (۲۱٫۲) شالِ راه‌راه + صندلی با پشتی + گلوله‌های پشم رنگی */
function drawShelterSurvivorKnit(x, y, t2) {
  ctx.save();
  ctx.translate(x, y);
  const knit = Math.sin(t2 * 3.1) * 2.4;
  const OUT = 'rgba(8,12,20,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 17, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  /* صندلی چوبی با پشتی */
  ctx.strokeStyle = '#4a3b28'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 0); ctx.lineTo(-10, -22); ctx.moveTo(10, 0); ctx.lineTo(10, -22);
  ctx.stroke();
  ctx.strokeStyle = '#5a4832'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(-10, -22); ctx.moveTo(10, -50); ctx.lineTo(10, -22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, -48); ctx.quadraticCurveTo(0, -53, 10, -48); ctx.stroke();
  /* شالِ راه‌راه با گرادیان */
  const shG = ctx.createLinearGradient(-12, -46, 12, -20);
  shG.addColorStop(0, '#7a5a6a'); shG.addColorStop(0.5, '#6a4a5a'); shG.addColorStop(1, '#4d3644');
  ctx.fillStyle = shG;
  rr(-12, -46, 24, 26, 8); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(-12, -46, 24, 26, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(201,162,78,0.5)'; ctx.lineWidth = 1.4;   // راه‌راه شال
  ctx.beginPath();
  ctx.moveTo(-8, -44); ctx.lineTo(-8, -22); ctx.moveTo(0, -44); ctx.lineTo(0, -22); ctx.moveTo(8, -44); ctx.lineTo(8, -22);
  ctx.stroke();
  /* سر + مو + چهره */
  ctx.fillStyle = '#c9a084'; circle(0, -52, 6.6);
  ctx.fillStyle = '#3a2d22';
  ctx.beginPath(); ctx.arc(0, -52, 7, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  ctx.beginPath(); ctx.arc(-6.2, -51, 2.2, Math.PI * 0.3, Math.PI * 1.7); ctx.fill();  // گوجه‌ی مو
  ctx.fillStyle = '#1d2433'; circle(-2.4, -52, 0.9); circle(2.4, -52, 0.9);
  ctx.strokeStyle = 'rgba(90,60,50,0.8)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(0, -48.6, 1.7, 0.3, Math.PI - 0.3); ctx.stroke();  // لبخند
  /* دست‌ها + سوزن‌ها */
  ctx.strokeStyle = OUT; ctx.lineWidth = 4.6;
  ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-6 + knit, -24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -32); ctx.lineTo(6 - knit, -24); ctx.stroke();
  ctx.strokeStyle = '#c9a084'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-6 + knit, -24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -32); ctx.lineTo(6 - knit, -24); ctx.stroke();
  ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 1;                  // سوزن‌های بافت
  ctx.beginPath();
  ctx.moveTo(-6 + knit, -24); ctx.lineTo(-8 + knit, -18);
  ctx.moveTo(6 - knit, -24); ctx.lineTo(8 - knit, -18);
  ctx.stroke();
  /* دو گلوله پشم رنگی + کارِ در جریان */
  ctx.fillStyle = '#b0533f'; circle(0, -22, 3);
  ctx.fillStyle = '#5a7a9a'; circle(6, -20, 2.4);
  ctx.fillStyle = '#b0533f';
  ctx.beginPath(); ctx.moveTo(-4 + knit * 0.4, -20); ctx.lineTo(4 + knit * 0.4, -20);
  ctx.lineTo(3 + knit * 0.4, -16.5); ctx.lineTo(-3 + knit * 0.4, -16.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* نگهبانِ در — کنارِ درِ فولادی، تفنگ بغل
   (۲۱٫۲) جلیقه‌ی تاکتیکی + کلاه‌برد + سایه‌روشن */
function drawShelterGuard(x, y, t2) {
  ctx.save();
  ctx.translate(x, y);
  const breathe = Math.sin(t2 * 1.5) * 1.1;
  const OUT = 'rgba(8,12,20,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = OUT; ctx.lineWidth = 5.8; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -14); ctx.lineTo(-6, -1); ctx.moveTo(3, -14); ctx.lineTo(6, -1);
  ctx.stroke();
  ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-3, -14); ctx.lineTo(-6, -1); ctx.moveTo(3, -14); ctx.lineTo(6, -1);
  ctx.stroke();
  /* جلیقه‌ی تاکتیکی با گرادیان + جیب‌ها */
  const vestG = ctx.createLinearGradient(-9, -34, 9, -12);
  vestG.addColorStop(0, '#5d5546'); vestG.addColorStop(0.5, '#4a4436'); vestG.addColorStop(1, '#332f26');
  ctx.fillStyle = vestG;
  rr(-9, -34 + breathe, 18, 22, 6); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1; rr(-9, -34 + breathe, 18, 22, 6); ctx.stroke();
  ctx.fillStyle = '#3a352b';                                    // جیب‌های سینه
  rr(-7, -30 + breathe, 6, 7, 1.5); ctx.fill(); rr(1, -30 + breathe, 6, 7, 1.5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  rr(-8, -33 + breathe, 7, 2.4, 1); ctx.fill();                 // هایلایت شانه
  ctx.fillStyle = '#c9a24e'; ctx.fillRect(-2.6, -24 + breathe, 5.2, 2);  // نوارِ شناسه
  /* سر + کلاه‌برد + چهره (نگران، رو به در) */
  ctx.fillStyle = '#c9a084'; circle(1, -40 + breathe, 6.6);
  ctx.fillStyle = '#2c2620';
  ctx.beginPath(); ctx.arc(1, -40 + breathe, 6.9, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a3128';
  ctx.beginPath(); ctx.ellipse(1, -41.5 + breathe, 8.4, 2, 0, 0, Math.PI * 2); ctx.fill();  // لبه‌ی کلاه
  ctx.fillStyle = '#1d2433'; circle(-1.4, -40 + breathe, 0.95); circle(3.6, -40 + breathe, 0.95);
  ctx.strokeStyle = '#3a2d22'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-3.4, -42.4 + breathe); ctx.lineTo(0.2, -42.8 + breathe);
  ctx.moveTo(1.8, -42.8 + breathe); ctx.lineTo(5.4, -42.4 + breathe); ctx.stroke();
  /* تفنگِ بغل با بند */
  ctx.strokeStyle = '#33302a'; ctx.lineWidth = 2.8;
  ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(12, -20); ctx.stroke();
  ctx.strokeStyle = '#5a5040'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-8, -11); ctx.lineTo(-2, -13.4); ctx.stroke();
  ctx.strokeStyle = 'rgba(180,160,120,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-12, -10.6); ctx.lineTo(4, -18.4); ctx.stroke();   // هایلایت لوله
  ctx.strokeStyle = 'rgba(90,80,60,0.9)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-10, -16); ctx.quadraticCurveTo(-2, -26, 6, -28 + breathe); ctx.stroke();  // بند
  ctx.restore();
}

/* دکتر مریم — روسریِ فیروزه‌ای + روپوش + گوشیِ پزشکی
   (۲۱٫۲) بازطراحی کیفی: سایه‌روشنِ روپوش، چین‌های روسری، شناسه‌ی پزشکی،
   لبخند و ابروهای آرام — چهره‌ای که اعتماد می‌دهد */
function drawDoctorMary(x, y, t2) {
  ctx.save();
  ctx.translate(x, y);
  const breathe = Math.sin(t2 * 1.8) * 1.2;
  const OUT = 'rgba(8,12,20,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, 15, 4.4, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها + کفش */
  ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(-5, -1); ctx.moveTo(4, -18); ctx.lineTo(5, -1); ctx.stroke();
  ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(-5, -1); ctx.moveTo(4, -18); ctx.lineTo(5, -1); ctx.stroke();
  ctx.fillStyle = '#e8ecf5';
  rr(-8, -2.6, 7, 2.8, 1.2); ctx.fill(); rr(1, -2.6, 7, 2.8, 1.2); ctx.fill();
  /* روپوش سفید-نقره‌ای با گرادیان + یقه و دکمه */
  const coatG = ctx.createLinearGradient(-12, -44, 12, -16);
  coatG.addColorStop(0, '#eef2f8'); coatG.addColorStop(0.55, '#cfd6e4'); coatG.addColorStop(1, '#a8b2c6');
  ctx.fillStyle = coatG;
  rr(-12, -44 + breathe, 24, 28, 8); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 1;
  rr(-12, -44 + breathe, 24, 28, 8); ctx.stroke();
  ctx.fillStyle = '#a8b2c6';
  rr(-12, -26 + breathe, 24, 8, 4); ctx.fill();
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(0, -38 + breathe); ctx.lineTo(0, -20 + breathe); ctx.stroke();  // درز روپوش
  ctx.fillStyle = '#8a97a8';
  circle(-3, -34 + breathe, 1); circle(-3, -29 + breathe, 1); circle(-3, -24 + breathe, 1);  // دکمه‌ها
  /* شناسه‌ی پزشکی روی سینه */
  ctx.fillStyle = '#2e8a7a'; rr(5, -38 + breathe, 7, 9, 1.6); ctx.fill();
  ctx.fillStyle = '#e8ecf5'; ctx.fillRect(6.6, -36 + breathe, 3.8, 1.4); ctx.fillRect(6.6, -33.6 + breathe, 3.8, 1.4);
  /* سر + روسری فیروزه‌ای با چین */
  ctx.fillStyle = '#e8c49a'; circle(1, -50 + breathe, 8.4);
  ctx.fillStyle = '#2e8a7a';
  ctx.beginPath(); ctx.arc(1, -51 + breathe, 9, Math.PI * 0.92, Math.PI * 2.08); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -50 + breathe); ctx.quadraticCurveTo(-12, -36 + breathe, -6, -26 + breathe);
  ctx.lineTo(2, -28 + breathe); ctx.quadraticCurveTo(-4, -40 + breathe, -6, -50 + breathe);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#236a5e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-7, -46 + breathe); ctx.quadraticCurveTo(-9, -38 + breathe, -5, -30 + breathe); ctx.stroke();
  ctx.fillStyle = '#c9a24e'; circle(1, -59 + breathe, 2.2);                 // سنجاق روسری
  /* چهره: چشم‌ها + ابروهای آرام + لبخند */
  ctx.fillStyle = '#1d2433';
  circle(-2.4, -51 + breathe, 1.15); circle(4.4, -51 + breathe, 1.15);
  ctx.strokeStyle = '#5a4436'; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-4.6, -53.4 + breathe); ctx.lineTo(-1, -53.8 + breathe);
  ctx.moveTo(2.6, -53.8 + breathe); ctx.lineTo(6.2, -53.4 + breathe);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(90,50,40,0.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(1, -46.4 + breathe, 2.4, 0.25, Math.PI - 0.25); ctx.stroke();
  /* گوشی پزشکی روی سینه */
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -40 + breathe); ctx.quadraticCurveTo(6, -36 + breathe, 8, -30 + breathe);
  ctx.stroke();
  ctx.fillStyle = '#39424e'; circle(8.6, -30 + breathe, 3);
  ctx.fillStyle = '#c9a24e'; circle(8.6, -30 + breathe, 1.2);
  /* دست‌ها آرام روی هم */
  ctx.strokeStyle = OUT; ctx.lineWidth = 5.6;
  ctx.beginPath(); ctx.moveTo(-8, -34 + breathe); ctx.lineTo(8, -32 + breathe); ctx.stroke();
  ctx.strokeStyle = '#e8c49a'; ctx.lineWidth = 4.4;
  ctx.beginPath(); ctx.moveTo(-8, -34 + breathe); ctx.lineTo(8, -32 + breathe); ctx.stroke();
  ctx.restore();
}

/* ---------------------- ۱۳-۵) صفحه‌ی بردِ سینمایی (بازنویسی) ----------------------
   تعریف قدیمی در v3_part3 با این جایگزین می‌شود (تعریفِ آخر برنده است):
   مدال طلایی + پرتوهای چرخان (CSS) + کارت‌های آمار + آتش‌بازیِ
   پشتِ پنل (ذراتِ canvas از حلقه‌ی اصلی) + منوی کامل + قلابِ سری دوم */
function victory() {
  if (state.mode === 'victory') return;
  state.mode = 'victory';
  state.mouse.down = false;
  state.placing = null;
  state.combo = 0;
  state.dayTarget = 1;
  state.shake = 0; state.flash = 0;
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  $('bossBar').style.display = 'none'; bossBarVisible = false;
  hideScreen('tbcScreen');
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  /* کارت‌های آمار */
  const cards = [
    ['🧟', faNum(state.stats.kills), 'کشتار'],
    ['💰', faNum(state.stats.earned), 'سکه‌ی جمع‌شده'],
    ['🔥', '×' + faNum(state.stats.maxCombo), 'بهترین کمبو'],
    ['🛡', faNum(state.stats.turKills), 'کشتار برجک‌ها'],
    ['❤️', faNum(Math.ceil(state.tower.hp)), 'جونِ برجِ آخر'],
    ['🌙', faNum(FINAL_WAVE) + '/' + faNum(FINAL_WAVE), 'شبِ زنده‌ماندن'],
  ];
  $('vStats').innerHTML = cards.map(c =>
    '<div class="vic-card"><div class="vc-ic">' + c[0] + '</div><div class="vc-n">' + c[1] +
    '</div><div class="vc-l">' + c[2] + '</div></div>').join('');
  /* شلیکِ اولین آتش‌بازی + زنگِ پیروزی */
  VICFX.t = 0.2;
  SFX.victory();
  const vn = $('vicNights');
  if (vn) vn.textContent = faNum(FINAL_WAVE);
  showScreen('victoryScreen');
}

/* آتش‌بازی صفحه‌ی برد — از updateFx صدا می‌شود (حالت victory)؛
   UPDATE_HOOKS فقط در playing/intermission/day می‌چرخد */
function victoryFireworks(dt) {
  if (state.mode !== 'victory') return;
  const vs = document.getElementById('victoryScreen');
  if (!vs || vs.classList.contains('hidden')) return;
  VICFX.t -= dt;
  if (VICFX.t > 0) return;
  VICFX.t = 1.05 + Math.random() * 0.85;
  const x = rand(110, W - 110), y = rand(70, 250);
  const cols = ['#ffd873', '#7bd389', '#ff8a72', '#8fd6ff', '#f0b53c', '#d8a3ff'];
  const col = cols[irand(0, cols.length - 1)];
  spawnParticles(x, y, 26, col, { speed: 150 + Math.random() * 140, life: 1.25, size: 2.7, grav: 95 });
  spawnParticles(x, y, 9, '#fff3cf', { speed: 90, life: 1.0, size: 1.9, grav: 70 });
  try { SFX.combo(irand(5, 11)); } catch (e) {}
}

/* ---------------------- ۱۳-۶) صداها و اتصال‌ها ---------------------- */
/* صدای آژیر پناهگاه — دو نُتِ برجسته‌ی تکراری */
try {
  SFX.alarm = function () {
    Snd.tone({ type: 'square', f0: 880, f1: 660, dur: 0.18, vol: 0.09 });
    Snd.tone({ type: 'square', f0: 660, f1: 880, dur: 0.18, vol: 0.09, delay: 0.2 });
  };
} catch (e) {}

/* دکمه‌های جدید صفحه‌ی برد و «ادامه دارد» */
window.addEventListener('load', () => {
  const vm = $('btnVicMenu');
  if (vm) vm.addEventListener('click', () => { SFX.click(); exitToMenu(); });
  const tc = $('tbcContinue');
  if (tc) tc.addEventListener('click', tbcContinueToMenu);
  const ts = $('tbcStats');
  if (ts) ts.addEventListener('click', tbcShowStats);
});

/* دیباگ/تست: پرش مستقیم به کات‌سین پناهگاه و مراحلش */
window.addEventListener('load', () => {
  if (typeof window.GAME === 'undefined') return;
  GAME.v19 = {
    startShelterCine, skipShelterCine, startTbcScreen, tbcContinueToMenu, tbcShowStats,
    get SHEL() { return SHEL; },
    shelterGoto(phase, t) {          /* پرش به فاز مشخص (برای تست فریم‌ها) */
      if (!SHEL) startShelterCine();
      SHEL.phase = phase; SHEL.t = t || 0; SHEL.dlgStarted = false; SHEL.dlgDone = false;
      if (phase === 'tbc') startTbcScreen();
    },
  };
});
