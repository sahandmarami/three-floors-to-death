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

/* رد کردن: مستقیم صفحه‌ی برد (برای دوباره‌بازی/تست) */
function skipShelterCine() {
  if (!SHEL) return;
  SFX.click();
  shelterHardReset();
  doFade(() => victory(), 0.35);
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
    /* نورِ ریخته از در وقتی باز می‌شود */
    if (SHEL.t > 1.0 && Math.random() < dt * 14) {
      spawnParticles(700 + rand(-60, 60), 330 + rand(-30, 30), 1, 'rgba(255,226,168,0.5)',
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
      spawnParticles(rand(80, 880), 300, 1, 'rgba(255,226,168,0.22)',
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
      spawnParticles(rand(60, 900), 240, 1, 'rgba(160,140,110,0.4)',
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

/* دکمه‌ی ادامه: از «ادامه دارد» به صفحه‌ی برد */
function tbcContinueToVictory() {
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
  /* خورشیدِ تازه‌درآمده */
  const sx = 130, sy = 120;
  const sg = ctx.createRadialGradient(sx, sy, 8, sx, sy, 120);
  sg.addColorStop(0, 'rgba(255,220,150,0.8)'); sg.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = sg; circle(sx, sy, 120);
  ctx.fillStyle = '#ffe9a8'; circle(sx, sy, 26);
  /* تپه‌های دور */
  ctx.fillStyle = '#3a2c34';
  ctx.beginPath(); ctx.moveTo(-20, GROUND_Y - 40);
  for (let i = 0; i < 9; i++) {
    const x = i * 130 - 30;
    ctx.lineTo(x + 65, GROUND_Y - 96 - ((i * 53) % 70));
    ctx.lineTo(x + 130, GROUND_Y - 34);
  }
  ctx.lineTo(W + 20, GROUND_Y - 40); ctx.closePath(); ctx.fill();
  /* تپه‌ی پناهگاه (راست) + درِ فولادی + چراغ‌هایش */
  const hx = 770, hy = GROUND_Y;
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
  /* جاده‌ی خاکی تا در */
  ctx.fillStyle = 'rgba(96,74,56,0.6)';
  ctx.beginPath();
  ctx.moveTo(300, H); ctx.lineTo(560, GROUND_Y - 6);
  ctx.lineTo(680, GROUND_Y - 6); ctx.lineTo(880, H);
  ctx.closePath(); ctx.fill();
  /* دو مسافر (بازیکن + ارشان) که نزدیک می‌شوند */
  const k = clamp(t / 6.2, 0, 1);
  const bx = 300 + k * 330;
  const sc = 1.25 + k * 0.5;
  drawShelterWalker(bx, GROUND_Y - 2, sc, -0.9, false);
  drawShelterWalker(bx - 34 * sc, GROUND_Y + 2, sc * 0.96, -0.7, true);
}

/* مسافرِ سحرگاهی — ارشان=true: کلاه قرمز + رادیو روی شانه */
function drawShelterWalker(x, y, sc, aim, arshan) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  const step = animTime * 7 + (arshan ? 1.4 : 0);
  const legA = Math.sin(step) * 12;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -13); ctx.lineTo(-3 + legA, -1);
  ctx.moveTo(3, -13); ctx.lineTo(3 - legA, -1);
  ctx.stroke();
  /* بدن (بازیکن: آبی؛ ارشان: سبز) + کوله */
  ctx.fillStyle = arshan ? '#4a7a4a' : '#3d6db5';
  rr(-8, -27, 16, 16, 5); ctx.fill();
  ctx.fillStyle = '#6a4a2c'; rr(-14, -26, 6, 11, 2); ctx.fill();
  /* سر */
  ctx.fillStyle = '#f0c49a'; circle(2, -32, 6);
  ctx.fillStyle = arshan ? '#7a2a2a' : '#2c3550';
  ctx.beginPath(); ctx.arc(2, -32, 6.2, Math.PI, Math.PI * 2); ctx.fill();
  /* بازوها (راه‌رفتن) */
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-3, -24); ctx.lineTo(-3 - legA * 0.7, -16);
  ctx.moveTo(4, -24); ctx.lineTo(4 + legA * 0.7, -16);
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

/* --- صحنه‌ی ۳: داخل پناهگاه (گفتگو / آژیر) --- */
function renderShelterInside(t, ph) {
  const alarm = ph === 'alarm' || ph === 'tbc';
  /* دیوارهای بتنی + کف */
  ctx.fillStyle = '#181c26'; ctx.fillRect(-20, -20, W + 40, H + 40);
  const wg = ctx.createLinearGradient(0, 0, 0, H);
  wg.addColorStop(0, '#141822'); wg.addColorStop(1, '#1e2432');
  ctx.fillStyle = wg; ctx.fillRect(-20, 60, W + 40, H - 40);
  /* درزهای بتنی */
  ctx.strokeStyle = 'rgba(8,10,16,0.7)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const y = 110 + i * 108;
    ctx.beginPath(); ctx.moveTo(-20, y); ctx.lineTo(W + 20, y); ctx.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = 70 + i * 140;
    ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, H); ctx.stroke();
  }
  /* کف */
  ctx.fillStyle = '#232a38'; ctx.fillRect(-20, GROUND_Y + 30, W + 40, H - GROUND_Y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-20, GROUND_Y + 30, W + 40, 4);

  /* قفسه‌های آذوقه (چپ) */
  for (let i = 0; i < 3; i++) {
    const sx = 60 + i * 6, sy = 180 + i * 74;
    ctx.fillStyle = '#3a2c1a';
    rr(sx, sy, 190, 10, 3); ctx.fill();
    ctx.strokeStyle = '#241a10'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(sx + 6, sy); ctx.lineTo(sx + 6, sy + 64); ctx.moveTo(sx + 184, sy); ctx.lineTo(sx + 184, sy + 64); ctx.stroke();
    /* قوطی‌ها */
    for (let j = 0; j < 7; j++) {
      ctx.fillStyle = ['#7a4a28', '#5a6a3a', '#8a5a3a', '#4a5a6a'][(i * 7 + j) % 4];
      rr(sx + 12 + j * 24, sy - 22, 18, 22, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(sx + 12 + j * 24, sy - 20, 18, 4);
    }
  }
  /* تخت‌های اردوگاهی (راست) */
  for (let i = 0; i < 2; i++) {
    const bx = 720, by = 250 + i * 96;
    ctx.fillStyle = '#2c3440';
    rr(bx, by, 170, 12, 4); ctx.fill();
    ctx.fillStyle = '#4a5664';
    ctx.fillRect(bx + 6, by + 12, 8, 34); ctx.fillRect(bx + 156, by + 12, 8, 34);
    ctx.fillStyle = '#7a6a8a';
    rr(bx + 8, by - 8, 70, 10, 4); ctx.fill();           // پتوی روی تخت
  }
  /* بازمانده‌ها: سه سایه‌ی نشسته دورِ میز (پشت) */
  drawShelterSurvivor(380, 330, '#6a5a8a', 0);
  drawShelterSurvivor(452, 336, '#5a6a4a', 1);
  drawShelterSurvivor(520, 330, '#6a4a4a', 2);

  /* میز رادیو وسط + ارشان کنارش */
  const rx = 468, ry = GROUND_Y + 6;
  ctx.fillStyle = '#3a2c1a';
  rr(rx - 64, ry - 40, 128, 40, 5); ctx.fill();
  ctx.fillStyle = '#2c2012';
  ctx.fillRect(rx - 58, ry - 4, 10, 30); ctx.fillRect(rx + 48, ry - 4, 10, 30);
  /* رادیوی بزرگ روی میز */
  ctx.fillStyle = '#4a3a22';
  rr(rx - 40, ry - 86, 80, 48, 6); ctx.fill();
  ctx.fillStyle = '#c9a24e';
  rr(rx - 30, ry - 78, 60, 24, 4); ctx.fill();
  ctx.fillStyle = 'rgba(30,20,6,0.9)';
  rr(rx - 26, ry - 74, 52, 16, 3); ctx.fill();
  /* عقربه‌ی فرکانس — حین آژیر می‌پرد */
  const dial = alarm ? Math.sin(t * 22) * 18 : Math.sin(t * 2) * 6;
  ctx.strokeStyle = 'rgba(255,90,70,0.9)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(rx, ry - 66); ctx.lineTo(rx + dial, ry - 70); ctx.stroke();
  /* LED رادیو */
  ctx.fillStyle = alarm && Math.sin(t * 10) > 0 ? '#ff4b3e' : '#7a5a2e';
  circle(rx + 28, ry - 52, 3);
  /* آنتن */
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(rx + 32, ry - 86); ctx.lineTo(rx + 52, ry - 122); ctx.stroke();
  /* موج‌های رادیو (حین خبرِ بد پررنگ) */
  const rwA = alarm ? 0.55 : 0.22;
  ctx.strokeStyle = 'rgba(140,190,255,' + rwA.toFixed(2) + ')';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ph2 = (animTime * (alarm ? 1.6 : 0.7) + i * 0.33) % 1;
    ctx.globalAlpha = (1 - ph2) * 0.6;
    ctx.beginPath();
    ctx.arc(rx + 40, ry - 96, 16 + ph2 * (alarm ? 150 : 80), -0.9, 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  /* دکتر مریم — کنار میز، رو به بازیکن */
  drawDoctorMary(rx - 130, ry, animTime);
  /* بازیکن (چپِ صحنه، تازه‌وارد) */
  drawShelterWalker(200, GROUND_Y + 24, 2.3, 0.3, false);
  /* ارشان — پشت میز، دست روی رادیو */
  {
    const ax = rx + 96, ay = ry - 4;
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
    /* دستِ دراز به رادیو */
    ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-6, -32); ctx.lineTo(-34, -52); ctx.stroke();
    ctx.restore();
  }

  /* چراغ‌های آویزی: سه لامپ با حوضچه‌ی نور */
  for (let i = 0; i < 3; i++) {
    const lx = 200 + i * 280;
    const flick = 0.8 + 0.2 * Math.sin(animTime * (3 + i) + i * 2);
    ctx.strokeStyle = '#0e1218'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, 60); ctx.lineTo(lx, 150); ctx.stroke();
    ctx.fillStyle = alarm ? '#5a2430' : '#3a3630';
    rr(lx - 12, 150, 24, 10, 4); ctx.fill();
    const col = alarm ? '255,80,60' : '255,214,138';
    ctx.fillStyle = 'rgba(' + col + ',' + (0.85 * flick).toFixed(2) + ')';
    circle(lx, 164, 5);
    const pool = ctx.createRadialGradient(lx, 168, 8, lx, 168, 150);
    pool.addColorStop(0, 'rgba(' + col + ',' + (0.16 * flick).toFixed(2) + ')');
    pool.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = pool; circle(lx, 168, 150);
  }

  /* آژیر: چراغ گردان قرمز روی همه‌چیز */
  if (alarm) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 4.4);
    ctx.fillStyle = 'rgba(200,30,20,' + (0.1 + pulse * 0.16).toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
    /* چراغ گردان سقف */
    const ax = W / 2 + Math.sin(t * 4.4) * 90;
    const ag = ctx.createRadialGradient(ax, 96, 4, ax, 96, 120);
    ag.addColorStop(0, 'rgba(255,60,40,' + (0.4 + pulse * 0.3).toFixed(2) + ')');
    ag.addColorStop(1, 'rgba(255,60,40,0)');
    ctx.fillStyle = ag; circle(ax, 96, 120);
    ctx.fillStyle = '#ff4b3e'; circle(ax, 96, 6);
  }
}

/* بازمانده‌ی نشسته — سایه‌ی رنگی با سرِ کم‌جان */
function drawShelterSurvivor(x, y, col, seed) {
  ctx.save();
  ctx.translate(x, y);
  const breathe = Math.sin(animTime * 1.6 + seed * 2) * 1.4;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;
  rr(-14, -34 + breathe, 28, 34, 8); ctx.fill();           // پتو/شانه‌ها
  ctx.fillStyle = '#c9a084';
  circle(0, -40 + breathe, 7);
  ctx.fillStyle = 'rgba(30,24,40,0.85)';
  ctx.beginPath(); ctx.arc(0, -40 + breathe, 7.4, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  ctx.restore();
}

/* دکتر مریم — روسریِ فیروزه‌ای + روپوش + گوشیِ پزشکی */
function drawDoctorMary(x, y, t2) {
  ctx.save();
  ctx.translate(x, y);
  const breathe = Math.sin(t2 * 1.8) * 1.2;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 2, 15, 4.4, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = '#2c3040'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -18); ctx.lineTo(-5, -1); ctx.moveTo(4, -18); ctx.lineTo(5, -1); ctx.stroke();
  /* روپوش سفید-نقره‌ای */
  ctx.fillStyle = '#cfd6e4';
  rr(-12, -44 + breathe, 24, 28, 8); ctx.fill();
  ctx.fillStyle = '#a8b2c6';
  rr(-12, -26 + breathe, 24, 8, 4); ctx.fill();
  /* سر + روسری فیروزه‌ای */
  ctx.fillStyle = '#e8c49a';
  circle(1, -50 + breathe, 8.4);
  ctx.fillStyle = '#2e8a7a';
  ctx.beginPath(); ctx.arc(1, -51 + breathe, 9, Math.PI * 0.92, Math.PI * 2.08); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -50 + breathe); ctx.quadraticCurveTo(-12, -36 + breathe, -6, -26 + breathe);
  ctx.lineTo(2, -28 + breathe); ctx.quadraticCurveTo(-4, -40 + breathe, -6, -50 + breathe);
  ctx.closePath(); ctx.fill();
  /* گوشی پزشکی روی سینه */
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -40 + breathe); ctx.quadraticCurveTo(6, -36 + breathe, 8, -30 + breathe);
  ctx.stroke();
  ctx.fillStyle = '#39424e'; circle(8.6, -30 + breathe, 3);
  /* دست‌ها آرام روی هم */
  ctx.strokeStyle = '#e8c49a'; ctx.lineWidth = 4.6;
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
  if (tc) tc.addEventListener('click', tbcContinueToVictory);
});

/* دیباگ/تست: پرش مستقیم به کات‌سین پناهگاه و مراحلش */
window.addEventListener('load', () => {
  if (typeof window.GAME === 'undefined') return;
  GAME.v19 = {
    startShelterCine, skipShelterCine, startTbcScreen, tbcContinueToVictory,
    get SHEL() { return SHEL; },
    shelterGoto(phase, t) {          /* پرش به فاز مشخص (برای تست فریم‌ها) */
      if (!SHEL) startShelterCine();
      SHEL.phase = phase; SHEL.t = t || 0; SHEL.dlgStarted = false; SHEL.dlgDone = false;
      if (phase === 'tbc') startTbcScreen();
    },
  };
});
