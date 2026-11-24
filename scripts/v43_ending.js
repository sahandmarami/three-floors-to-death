/* ==================================================================
   سه طبقه تا مرگ — ماژول ۴۳٫۰ — بخش ب: بازسازی کامل سینمایی پایان
   ==================================================================
   همهٔ صحنه‌های «رسیدن به پناهگاه → داخل‌شدن → آژیر → اتاق کنترل →
   فرار → آتش → جدایی → پلتفرمر → ایستگاه شمالی → حرکت → اپیلوگ → تیتراژ»
   از صفر ساخته می‌شوند:
     · کاراکترهای واقعی CINE43 (صورت، لباس، راه‌رفتن، حرف‌زدن) — نه سیلوئت
     · محیط‌های پرجزئیات با نور و عمق + دوربین سینمایی (زوم/پن)
     · ادبیات تازه و منسجم (صداها با gen_voices43 ساخته شدند)
     · ریتمِ تندتر — پایان دیگر حوصله‌سر‌بر نیست
   ================================================================== */

/* ---------- دیالوگ نهایی ۴۳ — هم‌متنِ کلیپ‌های w43 ---------- */
const E43_DLG = {
  arrive: [
    { who: 'n', v: 'w43n1', text: 'پناهگاه. سی‌وشش شب جنگیدند تا بالاخره دروازه‌اش را ببینند.' },
    { who: 'g', v: 'w43g1', text: 'ایست! تا اسلحه‌ها را تحویل ندهید، هیچ‌کس داخل نمی‌شود.' },
    { who: 'p', v: 'w43p1', text: 'تمامِ دفاع‌مان همین بود... باشه. می‌ذارم.' },
  ],
  welcome: [
    { who: 'm', v: 'w43m1', text: 'خوش اومدی. من دکتر مریمم؛ مسئول بخش پزشکی. اسمت چیه؟' },
    { who: 'p', v: 'w43p2', text: 'آرش. و اون‌طرف هم ارشانه. ما سی‌وشش شب پشت یه برج نیمه‌کاره دووم آوردیم.' },
    { who: 'm', v: 'w43m2', text: 'سی‌وشش شب؟ خودتون؟ امشب غذا و تشک دارید. فردا صبح، همه‌چیز رو می‌بینم.' },
  ],
  siren: [
    { who: 'a', v: 'w43a2', text: 'نیمه‌شبه... ولی این صدا خواب نمی‌ذاره. آژیره!' },
    { who: 'm', v: 'w43m3', text: 'آژیرِ خودِ ماست — با کد قرمز! یعنی خطر، از داخلِ پناهگاهه!' },
    { who: 'p', v: 'w43p3', text: 'اتاق کنترل کجاست؟ هر چی پرونده و سند هست، باید ببینیمش!' },
  ],
  control: [
    { who: 'p', v: 'w43p4', text: 'این‌جا میزِ فرماندهیه... همه‌چیز روشنه، ولی یه نفر هم نیست.' },
    { who: 'm', v: 'w43m4', text: 'این پرونده رو دو سال پیش بسته بودم. چرا الان بازه؟' },
    { who: 'a', v: 'w43a3', text: 'پایینش نوشته: پروژهٔ Z — فاز دوم. آرش، فاز دوم!' },
    { who: 'p', v: 'w43p5', text: 'پس فاز اول... همین ویروسی بود که شهر رو بلعید؟' },
    { who: 'm', v: 'w43m5', text: 'اگه جوابِ سؤالت «آره» باشه، این ساختمون هم بخشی از نقشه‌ست. ببرش و بیا!' },
  ],
  escape: [
    { who: 'a', v: 'w43a4', text: 'راهِ اصلی بسته‌ست! از کانالِ تهویه بریم — سریع!' },
  ],
  fire: [
    { who: 'a', v: 'w43a5', text: 'خب... دیگه نمی‌خوام وانمود کنم. اون پرونده دقیقاً چی بود، مریم؟' },
    { who: 'm', v: 'w43m6', text: 'دو خط بیشتر نبود. نه اسم، نه تاریخ... فقط یه نقشه با یه علامت. سمتِ شمال.' },
    { who: 'p', v: 'w43p6', text: 'یعنی اونا ویروس رو عمداً ساختن؟ دنیای ما آزمایشگاهِ اونا بوده؟' },
    { who: 'm', v: 'w43m7', text: 'من از خودم دورش می‌کردم... ولی شواهد، چیزی غیر از این نمی‌گه.' },
    { who: 'k', v: 'w43k1', text: 'اینجا دکتر ساراست. فرکانسِ قدیمی رو باز کردم؛ تا الان گوش می‌دادم. چیزی دارم که باید ببینید — ایستگاهِ شمالی، قبل از طلوع.' },
    { who: 'p', v: 'w43p7', text: 'ایستگاه شمالی... دقیقاً همون علامتِ روی نقشه. دیگه شانسی نیست.' },
  ],
  part: [
    { who: 'm', v: 'w43m8', text: 'من با بازمانده‌ها به مقصد دوم می‌رم. رادیو روشن می‌مونه — هر چی فهمیدی، صدایم کن.' },
    { who: 'p', v: 'w43p8', text: 'مراقب خودت باش. دنیا دیگه جایِ مهربونی نیست.' },
    { who: 'a', v: 'w43a6', text: 'بریم. تا طلوعِ آفتاب، نیمهٔ راهه.' },
  ],
  station: [
    { who: 's', v: 'w43s1', text: 'دیر کردید. فکر می‌کردم دیگه هیچ‌کس اون فرکانسِ قدیمی رو یادش نمونه.' },
    { who: 'p', v: 'w43p9', text: 'تو از اونا هستی؟ از سازنده‌های پروژهٔ Z؟' },
    { who: 's', v: 'w43s2', text: 'من طراحی‌اش کردم. قرار بود درمان باشه... بعد شد سلاح. و بعد، پایانِ همه‌چیز.' },
    { who: 'p', v: 'w43p10', text: 'اون پناهگاه... تله بود؟ ما فقط دادهٔ آزمایش بودیم؟' },
    { who: 's', v: 'w43s3', text: 'شما تنها کسانی بودید که از همه‌چیز زنده رد شدید. برای همین بهتون نیاز دارم — فازِ دو باید متوقف بشه.' },
    { who: 'a', v: 'w43a7', text: 'جادهٔ شمالی سالمه. ماشین آماده‌ست — فقط بگید بریم کجا.' },
    { who: 's', v: 'w43s4', text: 'شمال. آخرین آزمایشگاه. و آخرین فرصت برای برگردوندنِ دنیا.' },
  ],
  driveoff: [
    { who: 'n', v: 'w43n3', text: 'ماشین در دلِ دره پیچید؛ سه سرنشین، یک راز، و جاده‌ای که به هیچ‌کجای نقشه نمی‌رسید.' },
  ],
  epilogue: [
    { who: 'n', v: 'w43n4', text: 'چراغ ماشین، مثل ستاره‌ای ریز، در دلِ تاریکی گم شد.' },
    { who: 'p', v: 'w43p11', text: 'فصلِ اول تمومه، ارشان. ولی از امشب، جاده‌ها مالِ ماست.' },
    { who: 'a', v: 'w43a8', text: 'هنوز زنده‌ایم. یعنی هنوز یه شانس هست.' },
  ],
  credit: [
    { who: 'n', v: 'w43n5', text: 'سه طبقه تا مرگ. پایانِ فصلِ اول... جادهٔ شمالی، هنوز ادامه دارد.' },
  ],
};

/* ---------- حداکثر مدت هر فاز (ثانیه) — ریتم تند ---------- */
const E43_CAP = {
  arrive: 16, welcome: 14, siren: 13, control: 21, escape: 4.2, fire: 24,
  part: 13, plati: 2.4, station: 24, driveoff: 6.4, epilogue: 13, creditroll: 15.5,
};
const E43_MIN = {
  arrive: 4.5, welcome: 3.5, siren: 3.5, control: 4, escape: 3.4, fire: 4,
  part: 3.5, station: 4, epilogue: 3.5, driveoff: 6.2,
};

/* ---------- وضعیت ---------- */
function e43Reset() {
  E30.t = 0; E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0; E30.walkK = 0; E30.sirenPulse = 0;
  E30.c43 = {};
}
function e43Next(ph) {
  E30.phase = ph;
  e43Reset();
  if (ph === 'siren') { try { SFX.alarm(); } catch (e) {} state.shake = 8; }
  if (ph === 'escape') { try { SFX.alarm(); } catch (e) {} state.shake = 12; try { SFX.csRumble(); } catch (e) {} }
  if (ph === 'control') { state.shake = 4; }
  if (ph === 'creditroll') {
    try { VOICE.stop(); } catch (e) {}
    try { MUSIC.set('menu'); } catch (e) {}
    try { VOICE.speak('سه طبقه تا مرگ. پایانِ فصلِ اول... جادهٔ شمالی، هنوز ادامه دارد.', 'n', 'w43n5'); } catch (e) {}
  }
}

/* ---------- شروع‌کننده‌ها (بازنویسی — همان امضا) ---------- */
function startEnding43() {
  E30.phase = 'arrive';
  e43Reset();
  PLAT30.on = false;
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
  try { SFX.dusk(); } catch (e) {}
  try { MUSIC.set('menu'); } catch (e) {}
}
function startStationCine43() {
  E30.phase = 'station';
  e43Reset();
  PLAT30.on = false;
  state.mode = 'sheltercine';
  state.mouse.down = false;
  hideOverlays();
  hideDayPanel(); hidePeddlerPanel(); hideAnnounce();
  try { setBuildPanel(true, true); } catch (e) {}
  platPadShow(false);
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
  try { SFX.dusk(); } catch (e) {}
}

/* ---------- رد کردن ---------- */
function skipEnding43() {
  SFX.click();
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  const ph = E30.phase;
  if (ph === 'creditroll') { e43Finish(); return; }
  if (ph === 'station' || ph === 'driveoff' || ph === 'epilogue') { e43Next('creditroll'); return; }
  /* از هرجای قبل → کارت فصل میانی → پلتفرمر */
  E30.phase = '';
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startPlatformer(1);
}
function e43Finish() {
  E30.phase = '';
  try { wipeSave(); } catch (e) {}
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startTbcScreen();
}

/* ================================================================
   به‌روزرسانی — ریتم کوتاه، پیشروی با دیالوگ
   ================================================================ */
function updateEnding43(dt) {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  E30.t += dt;
  DLG.update(dt);
  state.shake = Math.max(0, state.shake - dt * 18);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt);
  updateTexts(dt);
  const ph = E30.phase;
  const cap = E43_CAP[ph] || 20;
  const min = E43_MIN[ph] || 3.5;

  const startDlg = () => {
    if (!E30.dlgStarted && E30.t > 0.75) {
      E30.dlgStarted = true;
      const dl = E43_DLG[ph] || [];
      DLG.start(dl, () => { E30.dlgDone = true; });
    }
  };
  const doneOrCap = () => (E30.dlgDone || E30.t > cap);

  if (ph === 'arrive') {
    E30.walkK = clamp((E30.t - 0.4) / 7.5, 0, 1);
    startDlg();
    if (doneOrCap() && E30.t > min) e43Next('welcome');
  } else if (ph === 'welcome' || ph === 'siren' || ph === 'control' || ph === 'fire' ||
             ph === 'part' || ph === 'station' || ph === 'epilogue' || ph === 'driveoff') {
    if (ph === 'siren') {
      state.shake = Math.max(state.shake, 2.0);
      E30.sirenPulse += dt;
      if (Math.sin(E30.sirenPulse * 4.4) > 0.92 && !E30._al2) { E30._al2 = true; try { SFX.alarm(); } catch (e) {} }
      if (Math.sin(E30.sirenPulse * 4.4) < -0.92) E30._al2 = false;
    }
    startDlg();
    if (doneOrCap() && E30.t > min) {
      if (ph === 'part') e43Next('plati');
      else if (ph === 'driveoff') e43Next('epilogue');
      else if (ph === 'epilogue') e43Next('creditroll');
      else if (ph === 'station') e43Next('driveoff');
      else if (ph === 'fire') e43Next('part');
      else if (ph === 'escape') e43Next('fire');
      else if (ph === 'control') e43Next('escape');
      else if (ph === 'siren') e43Next('control');
      else if (ph === 'welcome') e43Next('siren');
      else e43Next('welcome');
    }
  } else if (ph === 'escape') {
    state.shake = Math.max(state.shake, 5);
    if (Math.random() < dt * 9) {
      spawnParticles(rand(W * 0.2, W * 0.8), -8, 2, 'rgba(150,140,130,0.7)',
        { speed: 60, life: 1.2, size: 3, grav: 260 });
    }
    startDlg();
    E30.fade = clamp((E30.t - 2.4) / 1.6, 0, 1);
    if (E30.t > min) e43Next('fire');
  } else if (ph === 'plati') {
    if (E30.t > E43_CAP.plati) {
      E30.phase = '';
      $('wrap').classList.remove('cine-mode');
      $('skipCs').classList.add('hidden');
      startPlatformer(1);
    }
  } else if (ph === 'creditroll') {
    if (E30.t > E43_CAP.creditroll) e43Finish();
  }
}

/* ================================================================
   رندر — ۱۱ صحنهٔ سینمایی
   ================================================================ */
function renderEnding43() {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  const t = E30.t, ph = E30.phase;
  ctx.save();
  if (state.shake > 0.5) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);

  if (ph === 'arrive') e43ScArrive(t);
  else if (ph === 'welcome') e43ScWelcome(t);
  else if (ph === 'siren') e43ScSiren(t);
  else if (ph === 'control') e43ScControl(t);
  else if (ph === 'escape') e43ScEscape(t);
  else if (ph === 'fire') e43ScFire(t);
  else if (ph === 'part') e43ScPart(t);
  else if (ph === 'plati') e43ScPlati(t);
  else if (ph === 'station') e43ScStation(t);
  else if (ph === 'driveoff') e43ScDriveoff(t);
  else if (ph === 'epilogue') e43ScEpilogue(t);
  else if (ph === 'creditroll') e43ScCredits(t);

  drawShootingStar();
  drawParticles();
  drawTexts();

  if (E30.fade > 0) {
    ctx.fillStyle = `rgba(4,5,10,${E30.fade.toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* ---------- محیط مشترک: شب/سپیده ---------- */
function e43Sky(top, mid, bot, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, top); sky.addColorStop(0.62, mid); sky.addColorStop(1, bot);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y + 2);
}
function e43Stars(t, n, a) { CINE43.starfield(t, n, a); }
function e43Mountains(col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 46) ctx.lineTo(x, GROUND_Y - 44 - Math.sin(x * 0.013) * 26 - Math.sin(x * 0.037) * 12);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
}

/* ---------- دیوار پناهگاه + دروازه (برای arrive/welcome/siren) ---------- */
function e43ShelterWall(t, gx, opts) {
  const o = opts || {};
  /* دیوار عظیم بتنی */
  ctx.fillStyle = '#2a3040';
  ctx.fillRect(gx - 40, GROUND_Y - 176, W - gx + 60, 176);
  ctx.fillStyle = '#222836';
  for (let bx = gx - 40; bx < W + 40; bx += 44) {
    for (let by = GROUND_Y - 170; by < GROUND_Y; by += 30) {
      ctx.fillStyle = (Math.floor(bx / 44) + Math.floor(by / 30)) % 2 ? '#282e3d' : '#242a38';
      ctx.fillRect(bx, by, 42, 28);
    }
  }
  ctx.fillStyle = '#1a202c';
  ctx.fillRect(gx - 40, GROUND_Y - 182, W - gx + 60, 8);
  /* برجک نگهبانی دوقلو */
  const tower = (tx, tw) => {
    ctx.fillStyle = '#1c222e';
    ctx.fillRect(tx, GROUND_Y - 236, tw, 236);
    ctx.fillStyle = '#171c26';
    ctx.fillRect(tx - 6, GROUND_Y - 246, tw + 12, 12);
    ctx.fillStyle = '#2c3444';
    ctx.fillRect(tx + 4, GROUND_Y - 262, tw - 8, 18);
    /* سرپناه برجک */
    ctx.fillStyle = '#12161e';
    ctx.fillRect(tx + 2, GROUND_Y - 280, tw - 4, 22);
    ctx.fillStyle = 'rgba(255,196,110,0.85)';
    ctx.fillRect(tx + 8, GROUND_Y - 274, 8, 9);
    /* جستجوگر */
    const sweep = Math.sin(t * 0.8 + tx) * 0.5;
    ctx.save();
    ctx.translate(tx + tw / 2, GROUND_Y - 270);
    ctx.rotate(1.25 + sweep * 0.35);
    const sg = ctx.createLinearGradient(0, 0, 0, 210);
    sg.addColorStop(0, 'rgba(255,240,200,0.30)');
    sg.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(52, 210); ctx.lineTo(-52, 210);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  tower(W - 74, 34);
  tower(W - 176, 30);
  /* دروازهٔ عظیم فلزی */
  ctx.fillStyle = '#39404f';
  ctx.fillRect(gx - 52, GROUND_Y - 118, 104, 118);
  ctx.strokeStyle = '#525c6e'; ctx.lineWidth = 3;
  ctx.strokeRect(gx - 52, GROUND_Y - 118, 104, 118);
  ctx.lineWidth = 2.4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(gx - 52 + i * 26, GROUND_Y - 118); ctx.lineTo(gx - 52 + i * 26, GROUND_Y); ctx.stroke();
  }
  /* نوار خطر زرد-سیاه بالای دروازه */
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? '#d8b03a' : '#181818';
    ctx.save();
    ctx.translate(gx - 52 + i * 10.4, GROUND_Y - 126);
    ctx.transform(1, 0, -0.5, 1, 0, 0);
    ctx.fillRect(0, 0, 9, 8);
    ctx.restore();
  }
  /* چراغ چرخان قرمز بالای دروازه */
  const red = 0.5 + 0.5 * Math.sin(t * 4.2);
  ctx.fillStyle = `rgba(255,70,50,${0.55 + red * 0.45})`;
  circle(gx, GROUND_Y - 134, 4);
  const rg = ctx.createRadialGradient(gx, GROUND_Y - 134, 2, gx, GROUND_Y - 134, 40);
  rg.addColorStop(0, `rgba(255,70,50,${0.5 * red})`);
  rg.addColorStop(1, 'rgba(255,70,50,0)');
  ctx.fillStyle = rg; circle(gx, GROUND_Y - 134, 40);
  /* پنجره‌های گرم دیوار */
  const winA = o.warm != null ? o.warm : 0.6;
  for (let i = 0; i < 4; i++) {
    const wx = gx + 90 + i * 74;
    if (wx > W - 90) break;
    const wg = ctx.createLinearGradient(wx, GROUND_Y - 120, wx, GROUND_Y - 84);
    wg.addColorStop(0, `rgba(255,196,110,${(0.75 * winA * (0.7 + 0.3 * Math.sin(t * 2 + i))).toFixed(2)})`);
    wg.addColorStop(1, `rgba(220,130,60,${(0.4 * winA).toFixed(2)})`);
    ctx.fillStyle = wg;
    ctx.fillRect(wx, GROUND_Y - 122, 20, 36);
    ctx.strokeStyle = 'rgba(10,12,20,0.8)'; ctx.lineWidth = 1.6;
    ctx.strokeRect(wx, GROUND_Y - 122, 20, 36);
    ctx.beginPath(); ctx.moveTo(wx, GROUND_Y - 104); ctx.lineTo(wx + 20, GROUND_Y - 104);
    ctx.moveTo(wx + 10, GROUND_Y - 122); ctx.lineTo(wx + 10, GROUND_Y - 86); ctx.stroke();
  }
}

/* ================= صحنه ۱: رسیدن ================= */
function e43ScArrive(t) {
  const k = clamp((t - 0.4) / 7.5, 0, 1);            // پیشروی قدم‌ها
  e43Sky('#141a38', '#3a2c48', '#8a4a3c', t);
  e43Stars(t, 34, 0.3);
  /* خورشیدِ پیش‌افول — سرخ پشت کوه */
  const sx = W * 0.24;
  const sg = ctx.createRadialGradient(sx, GROUND_Y - 36, 8, sx, GROUND_Y - 36, 150);
  sg.addColorStop(0, 'rgba(255,140,70,0.6)');
  sg.addColorStop(1, 'rgba(255,110,60,0)');
  ctx.fillStyle = sg; circle(sx, GROUND_Y - 36, 150);
  e43Mountains('#241c34');
  /* جاده آسفالت با خطوط */
  CINE43.groundRoad(GROUND_Y, '#1c2030', '#12141f');
  ctx.strokeStyle = 'rgba(230,220,160,0.2)'; ctx.lineWidth = 3;
  ctx.setLineDash([26, 22]);
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 42); ctx.lineTo(W, GROUND_Y + 42); ctx.stroke();
  ctx.setLineDash([]);

  /* دوربین: زوم آرام به سمت دروازه */
  ctx.save();
  const zk = 1 + k * 0.10;
  CINE43.cam(W * 0.62, GROUND_Y - 70, zk, (1 - k) * -20, 0);

  /* دیوار + دروازه */
  const gx = W * 0.70;
  e43ShelterWall(t, gx, {});

  /* چراغ خیابان جاده */
  for (const lx of [W * 0.18, W * 0.44]) {
    ctx.strokeStyle = '#2c3344'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, GROUND_Y - 104);
    ctx.quadraticCurveTo(lx + 20, GROUND_Y - 112, lx + 36, GROUND_Y - 102); ctx.stroke();
    const fl = 0.75 + 0.25 * Math.sin(t * 6 + lx);
    const lg = ctx.createRadialGradient(lx + 36, GROUND_Y - 100, 3, lx + 36, GROUND_Y - 90, 64);
    lg.addColorStop(0, `rgba(255,214,150,${0.5 * fl})`);
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = lg; circle(lx + 36, GROUND_Y - 90, 64);
    ctx.fillStyle = `rgba(255,235,190,${fl})`; circle(lx + 36, GROUND_Y - 101, 3.4);
  }

  /* نگهبان کنار دروازه — با چراغ‌قوه به سمت دو نفر */
  const gx2 = gx + 78;
  CINE43.person('guard', gx2, GROUND_Y + 2, 1.16, {
    t, face: -1, pose: k > 0.86 ? 'talk' : 'idle',
    flashlight: [gx2 - 180, GROUND_Y - 26],
  });

  /* آرش + ارشان در حال رفتن به سمت دروازه */
  const walkPh = t * 7.2;
  const bx = 90 + k * (gx - 270);
  CINE43.person('arshan', bx - 26, GROUND_Y + 2, 1.12, {
    t, walk: k < 1 ? walkPh : 0, pose: k < 1 ? 'walk' : 'idle',
  });
  CINE43.person('arash', bx + 8, GROUND_Y + 3, 1.06, {
    t, walk: k < 1 ? walkPh + 1.4 : 0, pose: k < 1 ? 'walk' : (k > 0.86 ? 'talk' : 'idle'), pack: true,
  });

  /* طناب بسته‌های اسلحه روی زمین — بعد از تحویل */
  if (k > 0.9) {
    ctx.strokeStyle = '#6e5a34'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx - 40, GROUND_Y + 8); ctx.lineTo(bx - 4, GROUND_Y + 14); ctx.stroke();
    ctx.strokeStyle = '#3c3830'; ctx.lineWidth = 4.4;
    ctx.beginPath(); ctx.moveTo(bx - 46, GROUND_Y + 6); ctx.lineTo(bx + 6, GROUND_Y + 10); ctx.stroke();
  }
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(0.9);
  CINE43.grain(t, 0.8);
  CINE43.slate('پناهگاه شمارهٔ ۷', 'سپیده‌دمِ روزِ سی‌وهفتم', t);
}

/* ================= صحنه ۲: خوش‌آمد (حیاط داخلی) ================= */
function e43ScWelcome(t) {
  const enter = clamp(t / 2.4, 0, 1);                // مریم می‌آید
  /* شبِ آرام داخل حیاط — نورهای گرم */
  e43Sky('#10162e', '#1a2242', '#2a2840', t);
  e43Stars(t, 40, 0.45);
  CINE43.moon(W * 0.80, 86, 30, t);
  /* دیوار دور */
  ctx.fillStyle = '#181e2c';
  ctx.fillRect(0, GROUND_Y - 130, W, 130);
  /* چراغ‌های ریسمانی */
  ctx.strokeStyle = 'rgba(200,190,150,0.4)'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 60) {
    const sag = Math.sin((x / W) * Math.PI) * 18;
    if (x === 0) ctx.moveTo(x, 54); else ctx.lineTo(x, 54 + sag);
  }
  ctx.stroke();
  for (let i = 0; i <= 10; i++) {
    const x = i * (W / 10);
    const sag = Math.sin((x / W) * Math.PI) * 18;
    const fl = 0.72 + 0.28 * Math.sin(t * 3 + i * 1.7);
    ctx.fillStyle = `rgba(255,206,120,${fl})`;
    circle(x, 62 + sag, 2.6);
    const lg = ctx.createRadialGradient(x, 62 + sag, 1, x, 62 + sag, 26);
    lg.addColorStop(0, `rgba(255,206,120,${0.3 * fl})`);
    lg.addColorStop(1, 'rgba(255,206,120,0)');
    ctx.fillStyle = lg; circle(x, 62 + sag, 26);
  }
  /* چادرها و جعبه‌ها */
  const tent = (x, w2, h2, c) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - w2 / 2, GROUND_Y); ctx.lineTo(x, GROUND_Y - h2); ctx.lineTo(x + w2 / 2, GROUND_Y);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,190,110,0.75)';
    ctx.beginPath();
    ctx.moveTo(x + w2 * 0.10, GROUND_Y); ctx.lineTo(x + w2 * 0.18, GROUND_Y - h2 * 0.42);
    ctx.lineTo(x + w2 * 0.28, GROUND_Y); ctx.closePath(); ctx.fill();
  };
  tent(W * 0.16, 110, 62, '#3a4456');
  tent(W * 0.30, 96, 54, '#2e3a4c');
  /* جعبه‌ها */
  ctx.fillStyle = '#4a3e2c';
  ctx.fillRect(W * 0.62, GROUND_Y - 30, 34, 30);
  ctx.fillRect(W * 0.655, GROUND_Y - 54, 30, 26);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.4;
  ctx.strokeRect(W * 0.62, GROUND_Y - 30, 34, 30);
  ctx.strokeRect(W * 0.655, GROUND_Y - 54, 30, 26);
  CINE43.groundRoad(GROUND_Y, '#20222e', '#15161f');
  /* کف‌سازی حیاط: ترک‌ها + جعبه و بشکه کنار چادرها */
  ctx.strokeStyle = 'rgba(0,0,0,0.32)'; ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const cx5 = ((i * 233 + 60) % (W - 100)) + 50;
    const cy5 = GROUND_Y + 14 + (i % 3) * 16;
    ctx.moveTo(cx5, cy5); ctx.lineTo(cx5 + 16, cy5 + 3); ctx.lineTo(cx5 + 26, cy5 + 12);
  }
  ctx.stroke();
  ctx.fillStyle = '#4a3e2c';
  ctx.fillRect(W * 0.2, GROUND_Y - 26, 30, 26);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.strokeRect(W * 0.2, GROUND_Y - 26, 30, 26);
  ctx.fillStyle = '#3c4038';
  ctx.fillRect(W * 0.845, GROUND_Y - 24, 26, 24);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.ellipse(W * 0.858, GROUND_Y - 18, 8, 3, 0, 0, Math.PI * 2); ctx.stroke();

  ctx.save();
  const zk = 1 + clamp((t - 1) / 8, 0, 1) * 0.06;
  CINE43.cam(W * 0.48, GROUND_Y - 60, zk, 0, 0);

  /* بازمانده‌ها — دور در پس‌زمینه */
  CINE43.person('survivor', W * 0.55, GROUND_Y + 4, 0.86, { t, walk: t * 3, pose: 'walk', face: -1, alpha: 0.85 });
  CINE43.person('survivor', W * 0.86, GROUND_Y + 2, 0.8, { t, pose: 'idle', face: -1, alpha: 0.7 });

  /* مریم از راست می‌آید و سلام می‌کند */
  const mx = W * 0.88 - enter * (W * 0.88 - W * 0.60);
  CINE43.person('maryam', mx, GROUND_Y + 3, 1.2, {
    t, walk: enter < 1 ? t * 6.4 : 0, pose: enter < 1 ? 'walk' : 'talk', face: -1,
  });

  /* آرش و ارشان — همان‌جا ایستاده */
  const ax = W * 0.30;
  CINE43.person('arshan', ax - 22, GROUND_Y + 2, 1.18, { t, pose: 'idle', face: 1 });
  CINE43.person('arash', ax + 12, GROUND_Y + 3, 1.13, { t, pose: t > 2.6 ? 'talk' : 'idle', face: 1, pack: true });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(0.85);
  CINE43.grain(t, 0.7);
  CINE43.slate('حیاطِ داخلی — پناهگاه', 'شبِ اولِ امن', t);
}

/* ================= صحنه ۳: آژیر ================= */
function e43ScSiren(t) {
  /* همان حیاط — اما سرخ و لرزان */
  e43ScWelcomeBase(t);
  const red = 0.5 + 0.5 * Math.sin(t * 4.4);
  /* نور گردان قرمز */
  for (const [cx2, cy2] of [[W * 0.5, 40], [W * 0.15, GROUND_Y - 150]]) {
    const ang = t * 2.6 + cx2;
    const lg = ctx.createLinearGradient(cx2, cy2, cx2 + Math.cos(ang) * 240, cy2 + Math.abs(Math.sin(ang)) * 200);
    lg.addColorStop(0, `rgba(255,50,30,${0.30 + red * 0.18})`);
    lg.addColorStop(1, 'rgba(255,50,30,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(cx2, cy2);
    ctx.lineTo(cx2 + Math.cos(ang) * 260 - 60, cy2 + Math.abs(Math.sin(ang)) * 230);
    ctx.lineTo(cx2 + Math.cos(ang) * 260 + 60, cy2 + Math.abs(Math.sin(ang)) * 230);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = `rgba(255,70,50,${0.7 + red * 0.3})`;
    circle(cx2, cy2, 5);
    const rg = ctx.createRadialGradient(cx2, cy2, 2, cx2, cy2, 46);
    rg.addColorStop(0, `rgba(255,70,50,${0.6 * red})`);
    rg.addColorStop(1, 'rgba(255,70,50,0)');
    ctx.fillStyle = rg; circle(cx2, cy2, 46);
  }
  ctx.fillStyle = `rgba(160,20,10,${0.10 + red * 0.10})`;
  ctx.fillRect(0, 0, W, H);
  /* جرقه‌های اضطراری بالای سر */
  for (let i = 0; i < 4; i++) {
    if (Math.random() < 0.4) {
      ctx.fillStyle = 'rgba(255,200,140,0.8)';
      ctx.fillRect(rand(W * 0.1, W * 0.9), rand(40, 150), 2, 2);
    }
  }
  /* بازمانده‌هایی که می‌دوند */
  ctx.save();
  CINE43.cam(W * 0.5, GROUND_Y - 60, 1.02, 0, 0);
  const rx = W * 0.74 - ((t * 60) % (W * 0.5));
  CINE43.person('survivor', W * 0.42, GROUND_Y + 6, 1.0, { t, walk: t * 11, pose: 'walk', face: -1, alpha: 0.9 });
  CINE43.person('survivor', W * 0.68, GROUND_Y + 4, 0.94, { t, walk: t * 10 + 2, pose: 'walk', face: 1, alpha: 0.8 });
  /* مریم می‌دود سمت آن‌ها */
  CINE43.person('maryam', W * 0.78 - clamp(t / 4, 0, 1) * W * 0.16, GROUND_Y + 4, 1.18, {
    t, walk: t * 9, pose: 'walk', face: -1,
  });
  /* آرش و ارشان بیدار و آماده */
  CINE43.person('arshan', W * 0.20, GROUND_Y + 3, 1.18, { t, pose: 'talk', face: 1 });
  CINE43.person('arash', W * 0.26, GROUND_Y + 4, 1.13, { t, pose: 'idle', face: 1, pack: true });
  ctx.restore();
  CINE43.letterbox(1);
  CINE43.vignette(1);
  CINE43.grain(t, 1.1);
}

/* حیاط بدون کاراکتر (پایهٔ آژیر) */
function e43ScWelcomeBase(t) {
  e43Sky('#0e1428', '#161c34', '#1c1e30', t);
  e43Stars(t, 26, 0.3);
  ctx.fillStyle = '#141926';
  ctx.fillRect(0, GROUND_Y - 130, W, 130);
  CINE43.groundRoad(GROUND_Y, '#1a1c26', '#101118');
  /* چراغ‌های ریسمانی خاموش‌تر */
  ctx.strokeStyle = 'rgba(180,175,150,0.3)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 60) {
    const sag = Math.sin((x / W) * Math.PI) * 18;
    if (x === 0) ctx.moveTo(x, 54); else ctx.lineTo(x, 54 + sag);
  }
  ctx.stroke();
}

/* ================= صحنه ۴: اتاق کنترل ================= */
function e43ScControl(t) {
  /* فضای داخلی سرد با نور مانیتورها */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0e18');
  sky.addColorStop(0.72, '#111724');
  sky.addColorStop(1, '#0c1018');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 8;
  /* کف */
  const fg2 = ctx.createLinearGradient(0, fl, 0, H);
  fg2.addColorStop(0, '#1a212e'); fg2.addColorStop(1, '#10141e');
  ctx.fillStyle = fg2; ctx.fillRect(0, fl, W, H - fl);
  /* دیوار پشتی: پنل‌ها */
  for (let px = 0; px < W; px += 120) {
    ctx.fillStyle = px % 240 ? '#141a26' : '#161c2a';
    ctx.fillRect(px, 30, 118, fl - 30);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.4;
    ctx.strokeRect(px + 2, 32, 114, fl - 36);
  }
  /* دیوارنگاره: نقشه با علامت شمال */
  ctx.fillStyle = 'rgba(230,220,180,0.10)';
  rr(W * 0.60, 58, 210, 120, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(230,220,180,0.28)'; ctx.lineWidth = 1.6;
  rr(W * 0.60, 58, 210, 120, 6); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,190,150,0.30)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.63, 150); ctx.lineTo(W * 0.67, 130); ctx.lineTo(W * 0.71, 145);
  ctx.lineTo(W * 0.75, 118); ctx.lineTo(W * 0.80, 136);
  ctx.stroke();
  const px2 = W * 0.60 + 210 - 34, py2 = 58 + 34;
  ctx.fillStyle = `rgba(255,80,60,${0.55 + 0.45 * Math.sin(t * 3.4)})`;
  circle(px2, py2, 4);
  ctx.strokeStyle = 'rgba(255,80,60,0.6)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(px2, py2, 9 + Math.sin(t * 3.4) * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(230,220,180,0.6)';
  ctx.font = 'bold 11px Vazirmatn, Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('ایستگاه شمالی', px2, py2 - 12);
  ctx.textAlign = 'left';

  /* میزهای مانیتور */
  const desk = (x, y, s2, glow) => {
    ctx.fillStyle = '#232c3c';
    ctx.fillRect(x - 46 * s2, y - 12 * s2, 92 * s2, 12 * s2);
    ctx.fillRect(x - 40 * s2, y, 6 * s2, 14 * s2);
    ctx.fillRect(x + 34 * s2, y, 6 * s2, 14 * s2);
    for (const dx of [-24, 8]) {
      ctx.fillStyle = '#10141e';
      ctx.fillRect(x + (dx - 13) * s2, y - 36 * s2, 27 * s2, 21 * s2);
      const on = 0.42 + 0.5 * Math.abs(Math.sin(t * 2.6 + dx + x));
      const mg = ctx.createLinearGradient(x, y - 34 * s2, x, y - 15 * s2);
      mg.addColorStop(0, `rgba(110,185,235,${on * glow})`);
      mg.addColorStop(1, `rgba(60,120,180,${on * glow * 0.6})`);
      ctx.fillStyle = mg;
      ctx.fillRect(x + (dx - 11) * s2, y - 34 * s2, 23 * s2, 17 * s2);
      /* خطوط داده */
      ctx.fillStyle = `rgba(200,235,255,${on * glow * 0.7})`;
      for (let r = 0; r < 3; r++) ctx.fillRect(x + (dx - 9) * s2, y - 31 * s2 + r * 5 * s2, (9 + ((x + dx + r) % 3) * 6) * s2, 1.5 * s2);
    }
  };
  desk(W * 0.16, fl - 4, 0.72, 0.5);
  desk(W * 0.38, fl + 2, 0.82, 0.55);
  desk(W * 0.9, fl - 2, 0.74, 0.45);

  /* میز کانونی + پروندهٔ Z زیر نور */
  const fx = W * 0.64, fy = fl - 24;
  const cone = ctx.createLinearGradient(0, 30, 0, fy);
  cone.addColorStop(0, 'rgba(255,226,150,0.34)');
  cone.addColorStop(1, 'rgba(255,226,150,0.02)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(fx - 16, 30); ctx.lineTo(fx + 16, 30);
  ctx.lineTo(fx + 62, fy - 6); ctx.lineTo(fx - 62, fy - 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2c3648';
  ctx.fillRect(fx - 62, fy - 12, 124, 12);
  ctx.fillRect(fx - 56, fy, 8, 24); ctx.fillRect(fx + 48, fy, 8, 24);
  /* پرونده */
  const fileGlow = 0.72 + 0.28 * Math.sin(t * 4.6);
  ctx.fillStyle = `rgba(246,230,186,${fileGlow})`;
  rr(fx - 24, fy - 24, 48, 13, 2.5); ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,40,0.85)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(fx - 24, fy - 20); ctx.lineTo(fx + 24, fy - 20); ctx.stroke();
  ctx.fillStyle = 'rgba(90,40,30,0.95)';
  ctx.font = 'bold 13px Vazirmatn, Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('Z', fx, fy - 13.6);
  /* نوشتهٔ پروژهٔ Z — فاز دوم بالای دیوار */
  ctx.fillStyle = `rgba(235,225,190,${0.5 + 0.3 * Math.sin(t * 2.2)})`;
  ctx.font = 'bold 17px Vazirmatn, Tahoma';
  ctx.fillText('پروژهٔ Z — فاز دوم', fx, 46);
  ctx.textAlign = 'left';
  const fg3 = ctx.createRadialGradient(fx, fy - 16, 4, fx, fy - 16, 70);
  fg3.addColorStop(0, `rgba(255,226,150,${0.22 * fileGlow})`);
  fg3.addColorStop(1, 'rgba(255,226,150,0)');
  ctx.fillStyle = fg3; circle(fx, fy - 16, 70);

  /* کاراکترها */
  ctx.save();
  CINE43.cam(W * 0.52, fl - 50, 1 + clamp((t - 1) / 9, 0, 1) * 0.07, 0, 0);
  const reach = clamp((t - 2.2) / 2.6, 0, 1);
  /* آرش جلوی میز — در حال برداشتن پرونده */
  CINE43.person('arash', fx - 74, fl + 4, 1.08, {
    t, face: 1, pose: reach > 0.7 ? 'reach' : 'idle', pack: false,
  });
  /* دست آرش تا پرونده */
  if (reach > 0.55) {
    ctx.strokeStyle = '#31435e'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(fx - 74 + reach * 20, fl - 40);
    ctx.quadraticCurveTo(fx - 44, fy - 30, fx - 30, fy - 16);
    ctx.stroke();
    ctx.fillStyle = '#f2c9a2'; circle(fx - 28, fy - 16, 2.6);
  }
  CINE43.person('maryam', fx - 130, fl + 6, 1.06, { t, face: 1, pose: t > 4 ? 'talk' : 'idle' });
  CINE43.person('arshan', fx - 176, fl + 4, 1.10, { t, face: 1, pose: 'idle' });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(1);
  CINE43.grain(t, 0.9);
  CINE43.slate('اتاق کنترل — طبقهٔ B2', 'پرونده‌ای که نباید باز می‌شد', t);
}

/* ================= صحنه ۵: فرار ================= */
function e43ScEscape(t) {
  /* راهرو در حال فروریختن — قرمز و آوار */
  e43ScControlBase(t);
  const red = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.fillStyle = `rgba(170,20,10,${0.14 + red * 0.13})`;
  ctx.fillRect(0, 0, W, H);
  /* جرقه‌ها */
  for (let i = 0; i < 5; i++) {
    if (Math.random() < 0.5) {
      const sxp = rand(W * 0.1, W * 0.9), syp = rand(60, 200);
      ctx.fillStyle = 'rgba(255,220,140,0.85)';
      ctx.fillRect(sxp, syp, 2.2, 2.2);
      ctx.fillStyle = 'rgba(255,180,80,0.3)';
      ctx.fillRect(sxp - 1, syp - 1, 4, 4);
    }
  }
  /* آوار در حال ریختن */
  ctx.fillStyle = 'rgba(90,84,74,0.8)';
  for (let i = 0; i < 6; i++) {
    const dy = ((t * 190 + i * 130) % (GROUND_Y + 60));
    const dx = (i * 149 + 40) % W;
    ctx.fillRect(dx, dy, 5 + (i % 3) * 3, 4);
  }
  /* سه نفر در حال دویدن به راست */
  ctx.save();
  CINE43.cam(W * 0.5, GROUND_Y - 60, 1.04, (t * 8) % 30 - 15, 0);
  const runPh = t * 13;
  const rx = W * 0.2 + t * 34;
  CINE43.person('arshan', rx, GROUND_Y + 6, 1.1, { t, walk: runPh, pose: 'walk' });
  CINE43.person('arash', rx - 34, GROUND_Y + 7, 1.05, { t, walk: runPh + 1.6, pose: 'walk' });
  CINE43.person('maryam', rx - 66, GROUND_Y + 6, 1.06, { t, walk: runPh + 3.1, pose: 'walk' });
  ctx.restore();
  CINE43.letterbox(1);
  CINE43.vignette(1);
  CINE43.grain(t, 1.3);
}
function e43ScControlBase(t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0e18'); sky.addColorStop(1, '#0e1220');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 8;
  const fg2 = ctx.createLinearGradient(0, fl, 0, H);
  fg2.addColorStop(0, '#181e2a'); fg2.addColorStop(1, '#0e121c');
  ctx.fillStyle = fg2; ctx.fillRect(0, fl, W, H - fl);
  /* ستون‌ها */
  for (const px of [W * 0.12, W * 0.5, W * 0.88]) {
    ctx.fillStyle = '#141a26';
    ctx.fillRect(px - 16, 0, 32, fl);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 8, 0, 8, fl);
  }
  /* ترک سقف */
  ctx.strokeStyle = 'rgba(8,10,16,0.8)'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(W * 0.34, 0); ctx.lineTo(W * 0.38, 60); ctx.lineTo(W * 0.33, 120); ctx.lineTo(W * 0.4, 180);
  ctx.stroke();
}

/* ================= صحنه ۶: کنار آتش ================= */
function e43ScFire(t) {
  /* شب باز — شهر ویران در پس‌زمینه */
  e43Sky('#0b0f22', '#141a30', '#1c2030', t);
  e43Stars(t, 52, 0.55);
  CINE43.moon(W * 0.78, 92, 26, t);
  /* افق شهر ویران */
  ctx.fillStyle = '#13141f';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 34) {
    const bh = 60 + Math.abs(Math.sin(x * 0.043)) * 66 + Math.sin(x * 0.011) * 30;
    ctx.lineTo(x, GROUND_Y - bh);
  }
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* یک آتش دور در شهر */
  const fx2 = W * 0.16;
  const fg2 = ctx.createRadialGradient(fx2, GROUND_Y - 60, 4, fx2, GROUND_Y - 60, 60);
  fg2.addColorStop(0, 'rgba(255,140,60,0.5)');
  fg2.addColorStop(1, 'rgba(255,140,60,0)');
  ctx.fillStyle = fg2; circle(fx2, GROUND_Y - 60, 60);
  CINE43.groundRoad(GROUND_Y, '#1a1c26', '#12131c');

  ctx.save();
  CINE43.cam(W * 0.46, GROUND_Y - 52, 1 + clamp((t - 1) / 8, 0, 1) * 0.05, 0, 0);

  /* هیزم + آتش مرکزی */
  const fx = W * 0.44, fy = GROUND_Y + 14;
  ctx.strokeStyle = '#4a3826'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(fx - 34, fy); ctx.lineTo(fx + 30, fy - 6);
  ctx.moveTo(fx - 28, fy - 6); ctx.lineTo(fx + 34, fy);
  ctx.stroke();
  const flick = 0.75 + 0.25 * Math.sin(t * 9.4) * Math.sin(t * 3.7);
  const fg3 = ctx.createRadialGradient(fx, fy - 26, 4, fx, fy - 26, 130 * flick);
  fg3.addColorStop(0, `rgba(255,180,90,${0.5 * flick})`);
  fg3.addColorStop(0.4, `rgba(255,130,50,${0.22 * flick})`);
  fg3.addColorStop(1, 'rgba(255,110,40,0)');
  ctx.fillStyle = fg3; circle(fx, fy - 26, 130 * flick);
  /* شعله‌ها */
  for (let i = 0; i < 5; i++) {
    const fh = 20 + 12 * Math.sin(t * 8 + i * 1.9);
    const fx3 = fx - 12 + i * 6;
    ctx.fillStyle = i % 2 ? `rgba(255,190,90,${0.8 * flick})` : `rgba(255,120,40,${0.75 * flick})`;
    ctx.beginPath();
    ctx.moveTo(fx3 - 4.4, fy - 2);
    ctx.quadraticCurveTo(fx3 - 6, fy - fh * 0.6, fx3, fy - fh);
    ctx.quadraticCurveTo(fx3 + 6, fy - fh * 0.6, fx3 + 4.4, fy - 2);
    ctx.closePath(); ctx.fill();
  }

  /* رادیوی دکتر مریم — چراغ چشمک‌زن */
  const rx = W * 0.56, ry = GROUND_Y + 10;
  ctx.fillStyle = '#3a3830';
  rr(rx - 20, ry - 22, 40, 22, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.4;
  rr(rx - 20, ry - 22, 40, 22, 3); ctx.stroke();
  ctx.strokeStyle = '#8a8878'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(rx + 14, ry - 22); ctx.lineTo(rx + 26, ry - 46); ctx.stroke();
  const rl = 0.5 + 0.5 * Math.sin(t * 5.2);
  ctx.fillStyle = `rgba(120,220,140,${rl})`;
  circle(rx - 12, ry - 15, 2.2);
  ctx.fillStyle = 'rgba(20,20,16,0.8)';
  ctx.fillRect(rx - 6, ry - 19, 20, 4);

  /* مریم نشسته (روبرو)، ارشان نشسته، آرش نشسته — دور آتش */
  CINE43.person('maryam', fx + 88, GROUND_Y + 6, 1.05, { t, pose: 'sit', face: -1, talk: t % 14 > 9.5 });
  CINE43.person('arshan', fx - 84, GROUND_Y + 8, 1.06, { t, pose: 'sit', face: 1 });
  CINE43.person('arash', fx - 34, GROUND_Y + 10, 1.02, { t, pose: 'sit', face: 1, talk: t % 14 < 9.5 });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(0.9);
  CINE43.grain(t, 0.8);
  CINE43.slate('توقف‌گاهِ امن — بیرونِ شهر', 'آتشِ کوچک، حرف‌های بزرگ', t);
}

/* ================= صحنه ۷: جدایی ================= */
function e43ScPart(t) {
  /* سپیده‌دم — بنفش به نارنجی */
  e43Sky('#2a2444', '#5a3a54', '#c87a4a', t);
  e43Stars(t, 18, 0.2);
  /* خورشید تازه طلوع‌کرده */
  const sx = W * 0.72;
  const sg = ctx.createRadialGradient(sx, GROUND_Y - 60, 8, sx, GROUND_Y - 60, 180);
  sg.addColorStop(0, 'rgba(255,190,110,0.75)');
  sg.addColorStop(1, 'rgba(255,150,80,0)');
  ctx.fillStyle = sg; circle(sx, GROUND_Y - 60, 180);
  ctx.fillStyle = 'rgba(255,220,160,0.95)'; circle(sx, GROUND_Y - 60, 26);
  e43Mountains('#3a2c48');
  CINE43.groundRoad(GROUND_Y, '#241e30', '#17121e');
  /* دو مسیر از تقاطع */
  ctx.strokeStyle = 'rgba(240,220,180,0.22)'; ctx.lineWidth = 3;
  ctx.setLineDash([20, 16]);
  ctx.beginPath();
  ctx.moveTo(W * 0.52, GROUND_Y + 40);
  ctx.quadraticCurveTo(W * 0.36, GROUND_Y + 10, W * 0.18, GROUND_Y - 6);
  ctx.moveTo(W * 0.52, GROUND_Y + 40);
  ctx.quadraticCurveTo(W * 0.72, GROUND_Y + 14, W * 0.94, GROUND_Y - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  CINE43.cam(W * 0.5, GROUND_Y - 56, 1.02, 0, 0);
  /* بازمانده‌ها + مریم در حال رفتن (چپ) */
  const mx = W * 0.42 - clamp((t - 2) / 5, 0, 1) * W * 0.20;
  CINE43.person('survivor', W * 0.20, GROUND_Y + 4, 0.84, { t, pose: 'idle', face: -1, alpha: 0.8 });
  CINE43.person('survivor', W * 0.26, GROUND_Y + 6, 0.8, { t, pose: 'idle', face: -1, alpha: 0.7 });
  CINE43.person('maryam', mx, GROUND_Y + 4, 1.06, {
    t, walk: t > 2 ? t * 5.6 : 0, pose: t > 2 ? 'walk' : 'talk', face: -1,
  });
  /* آرش و ارشان — نگاه به مریم */
  CINE43.person('arshan', W * 0.60, GROUND_Y + 4, 1.08, { t, pose: 'idle', face: -1 });
  CINE43.person('arash', W * 0.65, GROUND_Y + 5, 1.04, { t, pose: t > 2.4 ? 'point' : 'idle', face: -1 });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(0.85);
  CINE43.grain(t, 0.7);
}

/* ================= صحنه ۸: کارت فصل میانی ================= */
function e43ScPlati(t) {
  ctx.fillStyle = '#05060c';
  ctx.fillRect(0, 0, W, H);
  /* سیلوئت راهرو در باد */
  ctx.fillStyle = 'rgba(60,52,70,0.5)';
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, H - 60 - Math.sin(x * 0.02) * 30);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  const a = clamp(t / 0.5, 0, 1) * clamp((2.4 - t) / 0.4, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(240,225,190,0.95)';
  ctx.font = 'bold 26px Vazirmatn, Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('فصل میانی — سفر', W / 2, H * 0.44);
  ctx.font = '13.5px Vazirmatn, Tahoma';
  ctx.fillStyle = 'rgba(200,195,175,0.8)';
  ctx.fillText('خرابه‌ها · پلِ شکسته · راهِ شمالی', W / 2, H * 0.44 + 28);
  ctx.textAlign = 'left';
  ctx.restore();
}

/* ================= صحنه ۹: ایستگاه شمالی ================= */
function e43ScStation(t) {
  /* فضای داخلی ایستگاه قدیمی — سرد و تنها */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0c1018');
  sky.addColorStop(0.7, '#141a26');
  sky.addColorStop(1, '#0e121c');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 6;
  const fg2 = ctx.createLinearGradient(0, fl, 0, H);
  fg2.addColorStop(0, '#1e222c'); fg2.addColorStop(1, '#12141c');
  ctx.fillStyle = fg2; ctx.fillRect(0, fl, W, H - fl);
  /* تخته‌های کف */
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.4;
  for (let y = fl + 10; y < H; y += 16) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  /* پنجرهٔ بزرگ — برف بیرون */
  const wx = W * 0.13, wy = 64, ww = 190, wh = 150;
  ctx.fillStyle = '#18202e';
  ctx.fillRect(wx, wy, ww, wh);
  const wgr = ctx.createLinearGradient(wx, wy, wx, wy + wh);
  wgr.addColorStop(0, '#26324a'); wgr.addColorStop(1, '#1a2234');
  ctx.fillStyle = wgr; ctx.fillRect(wx + 6, wy + 6, ww - 12, wh - 12);
  /* کوه‌های برفی بیرون */
  ctx.fillStyle = '#8ea2c4';
  ctx.beginPath();
  ctx.moveTo(wx + 6, wy + wh - 6);
  for (let x = wx + 6; x <= wx + ww - 6; x += 26) ctx.lineTo(x, wy + wh - 6 - 34 - Math.sin(x * 0.08) * 22);
  ctx.lineTo(wx + ww - 6, wy + wh - 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(wx + 6, wy + wh - 6);
  for (let x = wx + 6; x <= wx + ww - 6; x += 26) ctx.lineTo(x, wy + wh - 6 - 38 - Math.sin(x * 0.08) * 22);
  ctx.lineTo(wx + ww - 6, wy + wh - 6);
  ctx.closePath(); ctx.fill();
  /* برف پشت شیشه */
  ctx.fillStyle = 'rgba(235,240,255,0.8)';
  for (let i = 0; i < 16; i++) {
    const sxp = wx + 6 + ((i * 37 + t * 14) % (ww - 12));
    const syp = wy + 6 + ((i * 53 + t * 26) % (wh - 12));
    ctx.fillRect(sxp, syp, 1.8, 1.8);
  }
  ctx.strokeStyle = '#0e1420'; ctx.lineWidth = 5;
  ctx.strokeRect(wx, wy, ww, wh);
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
  ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
  ctx.stroke();

  /* دیوار پشتی ایستگاه — تخته‌های افقی + لولهٔ بخاری + پوستر */
  ctx.strokeStyle = 'rgba(30,36,48,0.9)'; ctx.lineWidth = 2;
  for (let y = 40; y < fl; y += 26) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  /* لولهٔ بخاری سراسری */
  ctx.fillStyle = '#2c323c';
  ctx.fillRect(0, fl - 178, W, 9);
  ctx.fillStyle = '#3a424e';
  ctx.fillRect(0, fl - 178, W, 3);
  for (const px3 of [W * 0.3, W * 0.52, W * 0.86]) {
    ctx.fillStyle = '#333a46';
    ctx.fillRect(px3 - 8, fl - 170, 16, 170);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(px3 + 4, fl - 170, 4, 170);
  }
  /* پوستر کاغذی کهنه */
  ctx.fillStyle = 'rgba(214,204,168,0.16)';
  rr(W * 0.4, fl - 150, 66, 84, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(214,204,168,0.3)'; ctx.lineWidth = 1.4;
  rr(W * 0.4, fl - 150, 66, 84, 3); ctx.stroke();
  ctx.fillStyle = 'rgba(214,204,168,0.35)';
  ctx.font = 'bold 11px Vazirmatn, Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('پاسگاه', W * 0.4 + 33, fl - 130);
  ctx.fillText('شمالی', W * 0.4 + 33, fl - 116);
  ctx.font = '9px Vazirmatn, Tahoma';
  ctx.fillStyle = 'rgba(214,204,168,0.22)';
  ctx.fillText('فاصله: ۴۵ کیلومتر', W * 0.4 + 33, fl - 92);
  ctx.textAlign = 'left';

  /* دستگاه بی‌سیم بزرگ + میز */
  const ex = W * 0.62;
  ctx.fillStyle = '#2a2620';
  ctx.fillRect(ex - 90, fl - 60, 180, 60);
  ctx.fillStyle = '#332e26';
  ctx.fillRect(ex - 82, fl - 56, 164, 52);
  /* دستگاه رادیو */
  ctx.fillStyle = '#4a4438';
  rr(ex - 40, fl - 118, 84, 60, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.6;
  rr(ex - 40, fl - 118, 84, 60, 5); ctx.stroke();
  /* آنتن */
  ctx.strokeStyle = '#8a8878'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(ex + 36, fl - 118); ctx.lineTo(ex + 58, fl - 162); ctx.stroke();
  /* چراغ و دیال‌ها */
  const rl2 = 0.5 + 0.5 * Math.sin(t * 4.8);
  ctx.fillStyle = `rgba(140,230,160,${rl2})`;
  circle(ex - 28, fl - 106, 2.6);
  ctx.fillStyle = 'rgba(20,18,14,0.9)';
  ctx.fillRect(ex - 18, fl - 108, 44, 7);
  ctx.strokeStyle = '#c8b070'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    circle(ex - 24 + i * 18, fl - 92, 4.4);
    ctx.beginPath(); ctx.moveTo(ex - 24 + i * 18, fl - 92);
    ctx.lineTo(ex - 24 + i * 18 + Math.sin(t * 1.2 + i) * 3, fl - 95);
    ctx.stroke();
  }
  /* چراغ مطالعهٔ گرم روی میز */
  const lx = ex - 60;
  const lg = ctx.createRadialGradient(lx, fl - 70, 3, lx, fl - 60, 90);
  lg.addColorStop(0, 'rgba(255,214,150,0.5)');
  lg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = lg; circle(lx, fl - 60, 90);
  ctx.strokeStyle = '#3a3830'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(lx, fl); ctx.lineTo(lx, fl - 78); ctx.stroke();
  ctx.fillStyle = '#4a4438';
  ctx.beginPath(); ctx.moveTo(lx - 14, fl - 78); ctx.lineTo(lx + 14, fl - 78); ctx.lineTo(lx + 6, fl - 92); ctx.lineTo(lx - 6, fl - 92);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,230,170,0.9)';
  circle(lx, fl - 88, 3.4);

  /* کاراکترها */
  ctx.save();
  CINE43.cam(W * 0.5, fl - 46, 1 + clamp((t - 1) / 9, 0, 1) * 0.06, 0, 0);
  /* سارا پشت میز — حرف می‌زند */
  CINE43.person('sara', ex + 40, fl + 6, 1.22, { t, face: -1, pose: 'talk' });
  /* آرش و ارشان جلوی میز */
  CINE43.person('arshan', ex - 104, fl + 6, 1.18, { t, face: 1, pose: t > 2.4 && t % 16 < 5 ? 'talk' : 'idle' });
  CINE43.person('arash', ex - 60, fl + 8, 1.13, { t, face: 1, pose: t > 1.2 && t % 16 >= 5 ? 'talk' : 'idle' });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(1);
  CINE43.grain(t, 0.9);
  CINE43.slate('ایستگاه شمالی', 'آن‌که Z را ساخت', t);
}

/* ================= صحنه ۱۰: حرکت ماشین ================= */
function e43ScDriveoff(t) {
  e43Sky('#101426', '#1a2038', '#2c2438', t);
  e43Stars(t, 40, 0.5);
  CINE43.moon(W * 0.2, 90, 28, t);
  e43Mountains('#1c1828');
  /* نقشه داشبورد — گوشه */
  ctx.fillStyle = 'rgba(18,22,32,0.9)';
  rr(W - 190, 54, 168, 120, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(200,210,230,0.35)'; ctx.lineWidth = 1.6;
  rr(W - 190, 54, 168, 120, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,190,150,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 172, 150); ctx.lineTo(W - 138, 124); ctx.lineTo(W - 108, 140);
  ctx.lineTo(W - 76, 106); ctx.lineTo(W - 44, 124);
  ctx.stroke();
  const mk = W - 76;
  ctx.fillStyle = `rgba(255,90,60,${0.6 + 0.4 * Math.sin(t * 3.4)})`;
  circle(mk, 106, 4);
  ctx.strokeStyle = 'rgba(255,90,60,0.55)';
  ctx.beginPath(); ctx.arc(mk, 106, 9 + Math.sin(t * 3.4) * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(220,226,240,0.75)';
  ctx.font = '10.5px Vazirmatn, Tahoma';
  ctx.textAlign = 'center';
  ctx.fillText('آزمایشگاهِ شمالی', mk, 92);
  ctx.textAlign = 'left';

  CINE43.groundRoad(GROUND_Y, '#181c28', '#10121c');
  /* جادهٔ دره — بالای باکس دیالوگ تا ماشین کاملاً دیده شود */
  const ry = GROUND_Y - 198;
  ctx.fillStyle = '#1e2230';
  ctx.fillRect(0, ry, W, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, ry, W, 3);
  ctx.strokeStyle = 'rgba(230,220,160,0.30)'; ctx.lineWidth = 3;
  ctx.setLineDash([24, 20]);
  ctx.lineDashOffset = -t * 140;
  ctx.beginPath(); ctx.moveTo(0, ry + 27); ctx.lineTo(W, ry + 27); ctx.stroke();
  ctx.setLineDash([]);
  /* لبهٔ پرتگاه زیر جاده */
  ctx.fillStyle = '#12141f';
  ctx.fillRect(0, ry + 46, W, GROUND_Y - ry - 46);

  /* ماشین از راست به چپ (سمت شمال) — نمای نیم‌رخ روی جادهٔ بالایی */
  const cx = W * 0.78 - clamp((t - 0.4) / 5.6, 0, 1) * (W + 420);
  const cy = ry + 44;
  ctx.save();
  ctx.translate(cx, cy);
  /* هدلایت‌ها */
  const hl = ctx.createRadialGradient(52, -14, 3, 52, -14, 130);
  hl.addColorStop(0, 'rgba(255,236,180,0.5)');
  hl.addColorStop(1, 'rgba(255,236,180,0)');
  ctx.fillStyle = hl;
  ctx.beginPath();
  ctx.moveTo(50, -16); ctx.lineTo(56, -10); ctx.lineTo(190, 6); ctx.lineTo(190, -34);
  ctx.closePath(); ctx.fill();
  /* بدنه */
  ctx.fillStyle = '#37414e';
  rr(-52, -26, 104, 22, 8); ctx.fill();
  ctx.fillStyle = '#42505e';
  rr(-30, -40, 52, 18, 7); ctx.fill();
  ctx.fillStyle = 'rgba(180,210,240,0.35)';
  rr(-26, -37, 20, 12, 4); ctx.fill();
  rr(-2, -37, 18, 12, 4); ctx.fill();
  /* سرنشین‌ها — سرهای کوچک داخل شیشه */
  ctx.fillStyle = '#2c2620';
  circle(-14, -34, 3.4);
  ctx.fillStyle = '#3a2c20';
  circle(2, -34, 3.2);
  ctx.fillStyle = '#b8b4c2';
  circle(9, -34, 3.0);
  /* چرخ‌ها */
  const wh2 = t * 9;
  for (const wx3 of [-34, 34]) {
    ctx.fillStyle = '#14161c';
    circle(wx3, -4, 9);
    ctx.fillStyle = '#2e323c';
    circle(wx3, -4, 4.4);
    ctx.strokeStyle = '#3c404c'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(wx3 - 3.4, -4 - Math.sin(wh2) * 3); ctx.lineTo(wx3 + 3.4, -4 + Math.sin(wh2) * 3);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,230,170,0.95)';
  circle(52, -14, 3.4);
  ctx.fillStyle = 'rgba(255,80,60,0.9)';
  circle(-52, -14, 2.6);
  ctx.restore();

  /* غبار پشت ماشین */
  ctx.fillStyle = 'rgba(150,150,160,0.14)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(cx - 60 - i * 26, cy - 4, 20 + i * 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  /* زمینِ پایین — با درخت‌های تیرهٔ کوچک */
  ctx.fillStyle = '#0e1018';
  for (let i = 0; i < 12; i++) {
    const tx3 = (i * 131 + 40) % W;
    ctx.beginPath();
    ctx.moveTo(tx3 - 7, GROUND_Y + 8); ctx.lineTo(tx3, GROUND_Y - 26 - (i % 3) * 9); ctx.lineTo(tx3 + 7, GROUND_Y + 8);
    ctx.closePath(); ctx.fill();
  }

  CINE43.letterbox(1);
  CINE43.vignette(0.95);
  CINE43.grain(t, 0.8);
}

/* ================= صحنه ۱۱: اپیلوگ ================= */
function e43ScEpilogue(t) {
  e43Sky('#0a0e1e', '#101628', '#181c2c', t);
  e43Stars(t, 64, 0.7);
  CINE43.moon(W * 0.74, 84, 24, t);
  /* درهٔ وسیع */
  ctx.fillStyle = '#10121e';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, GROUND_Y - 40 - Math.sin(x * 0.012) * 24);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  CINE43.groundRoad(GROUND_Y, '#12141e', '#0c0d16');
  /* جادهٔ مارپیچ به دره */
  ctx.strokeStyle = 'rgba(160,160,190,0.16)'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.1, GROUND_Y + 30);
  ctx.quadraticCurveTo(W * 0.4, GROUND_Y + 6, W * 0.56, GROUND_Y - 12);
  ctx.quadraticCurveTo(W * 0.72, GROUND_Y - 30, W * 0.92, GROUND_Y - 44);
  ctx.stroke();
  /* چراغ ماشینِ دور — نقطهٔ کوچکِ متحرک */
  const kk = clamp((t - 1.4) / 8, 0, 1);
  const lx = W * 0.56 + kk * W * 0.34, ly = GROUND_Y - 12 - kk * 32;
  ctx.fillStyle = `rgba(255,236,180,${0.85 - kk * 0.3})`;
  circle(lx, ly, 2.2);
  const lg = ctx.createRadialGradient(lx, ly, 1, lx, ly, 22);
  lg.addColorStop(0, 'rgba(255,236,180,0.4)');
  lg.addColorStop(1, 'rgba(255,236,180,0)');
  ctx.fillStyle = lg; circle(lx, ly, 22);

  /* دو نفر بالا تپه — تماشا */
  ctx.save();
  CINE43.cam(W * 0.3, GROUND_Y - 40, 1.02, 0, 0);
  CINE43.person('arshan', W * 0.18, GROUND_Y + 16, 0.94, { t, pose: 'idle', face: 1 });
  CINE43.person('arash', W * 0.235, GROUND_Y + 18, 0.9, { t, pose: 'idle', face: 1, pack: true });
  ctx.restore();

  CINE43.letterbox(1);
  CINE43.vignette(0.9);
  CINE43.grain(t, 0.8);
  CINE43.slate('دلمکن — کنارِ دره', 'شبِ روشن‌تر', t);
}

/* ================= صحنه ۱۲: تیتراژ ================= */
function e43ScCredits(t) {
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, 0, W, H);
  /* ستاره‌های آرام */
  ctx.fillStyle = 'rgba(214,222,255,0.5)';
  for (let i = 0; i < 46; i++) {
    const x = (i * 173.3 + 31) % W, y = (i * 97.7 + 11) % H;
    if (Math.sin(t * 0.9 + i * 1.7) > -0.3) ctx.fillRect(x, y, 1.5, 1.5);
  }
  const lines = [
    { s: 1, text: 'سه‌طبقه تا مرگ' },
    { s: 2, text: '— پایانِ فصلِ اول —' },
    { s: 3, text: '' },
    { s: 3, text: '' },
    { s: 0, text: 'بازیگران' },
    { s: 2, text: 'آرش — صدای Liam' },
    { s: 2, text: 'ارشان — صدای Bill' },
    { s: 2, text: 'دکتر مریم — صدای Jessica' },
    { s: 2, text: 'دکتر سارا — صدای Matilda' },
    { s: 2, text: 'راوی — صدای Brian' },
    { s: 2, text: 'نگهبان — صدای Adam' },
    { s: 2, text: 'بی‌سیم — صدای George' },
    { s: 2, text: 'دستفروش مرموز — Chris · Will · Harry · Eric · River' },
    { s: 3, text: '' },
    { s: 3, text: '' },
    { s: 0, text: 'داستان' },
    { s: 2, text: 'سی‌وشش شب مقاومت در برج · پناهگاهی که تله بود · پروژهٔ Z' },
    { s: 2, text: 'و ایستگاهی در شمال، که پاسخ همه‌چیز را دارد' },
    { s: 3, text: '' },
    { s: 0, text: 'ساخت و ایده' },
    { s: 2, text: 'sahandmarami' },
    { s: 3, text: '' },
    { s: 0, text: 'صداگذاری فارسی' },
    { s: 2, text: 'ElevenLabs' },
    { s: 3, text: '' },
    { s: 3, text: '' },
    { s: 1, text: 'ادامه دارد...' },
  ];
  const scroll = t * 22;
  let y = H + 46 - scroll;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (const L of lines) {
    if (L.s === 0) {
      if (y > -10 && y < H + 10) {
        ctx.font = 'bold 13px Vazirmatn, sans-serif';
        ctx.fillStyle = 'rgba(226,186,110,0.92)';
        ctx.fillText(L.text, W / 2, y);
      }
      y += 26;
    } else if (L.s === 1) {
      if (y > -30 && y < H + 30) {
        ctx.font = 'bold 30px Vazirmatn, sans-serif';
        ctx.fillStyle = 'rgba(236,214,150,0.96)';
        ctx.fillText(L.text, W / 2, y);
      }
      y += 52;
    } else if (L.s === 2) {
      if (y > -20 && y < H + 20) {
        ctx.font = '14px Vazirmatn, sans-serif';
        ctx.fillStyle = 'rgba(214,220,238,0.85)';
        ctx.fillText(L.text, W / 2, y);
      }
      y += 30;
    } else {
      y += 22;
    }
  }
  ctx.textAlign = 'left';
  CINE43.vignette(0.6);
}

/* ---------- جایگزینی توابع سراسری (همان امضا — رَپرها جدید را صدا می‌زنند) ---------- */
try {
  updateEnding30 = updateEnding43;
  renderEnding30 = renderEnding43;
  skipEnding30 = skipEnding43;
  startEnding30 = startEnding43;
  startStationCine30 = startStationCine43;
  /* e30Next از v40 ممکن است جایی صدا زده شود — به نسخهٔ تازه بچسبانیم */
  try { window.e30Next = e43Next; } catch (e) {}
} catch (e) { console.error('v43 ending hook failed', e); }

window.__V43_END = { dlg: E43_DLG };
