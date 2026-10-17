/* ==================================================================
   سه طبقه تا مرگ — نسخهٔ ۳۰٫۰ — زنجیرهٔ پایان جدید (طبق پرامپت بخش ۲)
   ==================================================================
   جریان: پیروزی شب ۳۶ → «تموم شد... رسیدیم.»
     arrive  : دروازهٔ پناهگاه + نگهبان «اسلحه‌ها رو تحویل بدید»
     welcome : خوش‌آمد دکتر مریم
     siren   : آژیر نیمه‌شب — «این آژیر ما نیست... این پروتکل داخلیه!»
     control : اتاق کنترل — پروندهٔ «پروژهٔ Z» زیر نور
     escape  : فرار از پناهگاهِ در حال فروپاشی
     fire    : توقف‌گاه امن — کنار آتش + رادیوی دکتر سارا
     part    : تصمیم و جدایی — «می‌رسم. قول می‌دم.»
     [پلتفرمر ۳ مرحله — v4_platformer.js]
     station : ایستگاه شمالی — اعتراف دکتر سارا
     driveoff: ماشین در جاده + نقشهٔ داشبورد → «این داستان ادامه دارد...»
   ================================================================== */

const E30 = {
  phase: '', t: 0, dlgStarted: false, dlgDone: false,
  fade: 0, sub: '', walkK: 0, sirenPulse: 0,
};

const E30_DLG = {
  arrive: [
    { who: 'n', v: 'c4n1', text: 'پس از روزها مبارزه، به پناهگاهی رسیدند با نشانه‌های زندگی.' },
    { who: 'g', v: 'sa1g', text: 'اسلحه‌ها رو تحویل بدید. اینجا امنه.' },
  ],
  welcome: [
    { who: 'p', v: 'sa2p', text: 'باورم نمی‌شه... واقعاً رسیدیم.' },
    { who: 'm', v: 'sa3m', text: 'خوش اومدید به پناهگاه. من دکتر مریمم.' },
  ],
  siren: [
    { who: 'a', v: 'si1a', text: 'این دیگه چیه؟!' },
    { who: 'm', v: 'si2m', text: 'این آژیر ما نیست... این پروتکل داخلیه!' },
    { who: 'p', v: 'si3p', text: 'دارن میان تو!' },
  ],
  control: [
    { who: 'p', v: 'zf1p', text: 'پروژهٔ Z... این چیه؟' },
    { who: 'm', v: 'zf2m', text: 'فقط یه اسم رمزه... و یه جمله: پایان دنیا.' },
    { who: 'a', v: 'zf3a', text: 'یعنی چی؟ کی اینو نوشته؟' },
    { who: 'm', v: 'zf4m', text: 'نمی‌دونم. اینجا جاش نیست — برش دار، باید بریم!' },
    { who: 'a', v: 'zf5a', text: 'فرار! الان!' },
  ],
  fire: [
    { who: 'a', v: 'ss1a', text: 'خب... اون کاغذ چی بود؟ پایان دنیا یعنی چی؟' },
    { who: 'p', v: 'ss2p', text: 'فقط همین دو خطه. نه امضا، نه تاریخ... ولی ببین، یه علامت هم خورده — سمت شمال.' },
    { who: 'm', v: 'ss3m', text: 'Z... توی هیچ مقالهٔ پزشکی همچین چیزی ندیدم. این یه چیز دیگه‌ست.' },
    { who: 'a', v: 'ss4a', text: 'یعنی یکی عمداً این بلا رو سر دنیا آورده؟' },
    { who: 'm', v: 'ss5m', text: 'نمی‌دونم. ولی اگه عمدی باشه... پس پناهگاه...' },
    { who: 'p', v: 'ss6p', text: 'چی؟ بگو.' },
    { who: 'm', v: 'ss7m', text: 'هیچی. فعلاً فقط حدسه. زود قضاوت نکنیم بهتره.' },
    { who: 'k', v: 'ss8k', text: 'اگه کسی این فرکانس رو می‌شنوه... من توی ایستگاه شمالی‌ام... چیزی پیدا کردم که باید ببینید... عجله کنید.' },
    { who: 'p', v: 'ss9p', text: 'ایستگاه شمالی... همون‌جایی که روی کاغذ علامت خورده.' },
    { who: 'a', v: 'ss10a', text: 'پس راه همونه.' },
  ],
  part: [
    { who: 'a', v: 'sp1a', text: 'اعضای پناهگاه با دکتر مریم می‌رن یه جای امن. ما دوتا می‌ریم سمت ایستگاه.' },
    { who: 'm', v: 'sp2m', text: 'مراقب باشید... و اگه فهمیدید Z چیه... بهم بگید.' },
    { who: 'a', v: 'sp3a', text: 'جاده بسته‌ست. من با ماشین از راه فرعی می‌رم، تو پیاده از دل خرابه‌ها. هر کی زودتر رسید، منتظر اون یکی می‌مونه.' },
    { who: 'p', v: 'sp4p', text: 'اگه نرسیدی چی؟' },
    { who: 'a', v: 'sp5a', text: 'می‌رسم. قول می‌دم.' },
  ],
  station: [
    { who: 's', v: 'st1s', text: 'اومدی... پس فرکانس هنوز کار می‌کنه.' },
    { who: 'p', v: 'st2p', text: 'تو کی هستی؟ Z چیه؟' },
    { who: 's', v: 'st3s', text: 'من یکی از اونایی‌ام که Z رو ساختم. و قبل از اینکه بپرسی چرا... چون فکر می‌کردیم دنیا باید از صفر شروع بشه.' },
    { who: 's', v: 'st4s', text: 'Z قرار بود سلاح کنترل‌شده باشه. یه کلید داشت... ولی کلید گم شد. یا شاید هیچ‌وقت نبود.' },
    { who: 's', v: 'st5s', text: 'پناهگاه‌ها تله بودن. می‌خواستیم ببینیم Z توی مقیاس بزرگ چطور رفتار می‌کنه. شما فقط... داده بودید.' },
    { who: 'p', v: 'st6p', text: 'پس الان چی؟' },
    { who: 's', v: 'st7s', text: 'فاز دوم شروع شده. و من می‌دونم کجاست. اگه می‌خوای جلوش رو بگیری، باید باهام بیای.' },
    { who: 'a', v: 'st8a', text: 'سوار شید! زود!' },
    { who: 's', v: 'st9s', text: 'اونی که می‌ریم، دیگه برگشتی نیست.' },
    { who: 'p', v: 'st10p', text: 'برگشتی از اول هم نبود.' },
  ],
};

function startEnding30() {
  E30.phase = 'arrive';
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0; E30.walkK = 0;
  PLAT30.on = false;
  state.mode = 'sheltercine';               /* (۴۰٫۰) مسیریابی از کانال sheltercine */
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

/* ورود دوباره از پلتفرمر — سینمایی ایستگاه شمالی */
function startStationCine30() {
  E30.phase = 'station';
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0;
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

function e30Next(ph) {
  E30.phase = ph;
  E30.t = 0;
  E30.dlgStarted = false; E30.dlgDone = false;
  E30.fade = 0;
  if (ph === 'siren') { try { SFX.alarm(); } catch (e) {} state.shake = 9; }
  if (ph === 'escape') { try { SFX.alarm(); } catch (e) {} state.shake = 12; try { SFX.csRumble(); } catch (e) {} }
  if (ph === 'control') { state.shake = 4; }
  if (ph === 'plati') {
    /* کارت فصل میانی → پلتفرمر */
    E30.dlgStarted = true; E30.dlgDone = true;
  }
}

/* رد کردن: پرش به پلتفرمر (یا اگر در ایستگاه هستیم → پایان) */
function skipEnding30() {
  SFX.click();
  try { VOICE.stop(); } catch (e) {}
  try { DLG.skip(); } catch (e) {}
  if (E30.phase === 'station' || E30.phase === 'driveoff') {
    e30Finish();
    return;
  }
  E30.phase = '';
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startPlatformer(1);
}

/* پایان نهایی: پاک‌کردن سیو + صفحهٔ «این داستان ادامه دارد...» */
function e30Finish() {
  E30.phase = '';
  try { wipeSave(); } catch (e) {}
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  startTbcScreen();
}

/* ---------------------- به‌روزرسانی ---------------------- */
function updateEnding30(dt) {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  E30.t += dt;
  DLG.update(dt);
  state.shake = Math.max(0, state.shake - dt * 18);
  state.flash = Math.max(0, state.flash - dt * 2.2);
  updateParticles(dt);
  updateTexts(dt);
  const ph = E30.phase;

  const startDlg = () => {
    if (!E30.dlgStarted && E30.t > 0.8) {
      E30.dlgStarted = true;
      const dl = E30_DLG[ph === 'plati' ? 'part' : ph] || [];
      DLG.start(dl, () => { E30.dlgDone = true; });
    }
  };

  if (ph === 'arrive') {
    E30.walkK = clamp(E30.t / 9, 0, 1);
    startDlg();
    if ((E30.dlgDone || E30.t > 30) && E30.t > 4) e30Next('welcome');
  } else if (ph === 'welcome') {
    startDlg();
    if ((E30.dlgDone || E30.t > 24) && E30.t > 3) e30Next('siren');
  } else if (ph === 'siren') {
    state.shake = Math.max(state.shake, 2.2);
    E30.sirenPulse += dt;
    if (Math.sin(E30.sirenPulse * 4.4) > 0.92 && !E30._al2) { E30._al2 = true; try { SFX.alarm(); } catch (e) {} }
    if (Math.sin(E30.sirenPulse * 4.4) < -0.92) E30._al2 = false;
    startDlg();
    if ((E30.dlgDone || E30.t > 30) && E30.t > 4) e30Next('control');
  } else if (ph === 'control') {
    state.shake = Math.max(state.shake, 1.4);
    startDlg();
    if ((E30.dlgDone || E30.t > 40) && E30.t > 4) e30Next('escape');
  } else if (ph === 'escape') {
    state.shake = Math.max(state.shake, 5);
    if (Math.random() < dt * 9) {
      spawnParticles(rand(W * 0.2, W * 0.8), -8, 2, 'rgba(120,110,100,0.7)',
        { speed: 60, life: 1.2, size: 3, grav: 260 });
    }
    E30.fade = clamp((E30.t - 1.2) / 1.8, 0, 1);
    if (E30.t > 3.4) e30Next('fire');
  } else if (ph === 'fire') {
    /* برقِ آتش: ذره‌های جرقه */
    if (Math.random() < dt * 22) {
      spawnParticles(W * 0.5 + rand(-16, 16), GROUND_Y - 46, 1, 'rgba(255,170,80,0.9)',
        { speed: 24, life: 1.4, size: 2, grav: -46 });
    }
    startDlg();
    if ((E30.dlgDone || E30.t > 70) && E30.t > 4) e30Next('part');
  } else if (ph === 'part') {
    startDlg();
    if ((E30.dlgDone || E30.t > 40) && E30.t > 4) e30Next('plati');
  } else if (ph === 'plati') {
    /* کارت ۲.۶ ثانیه‌ای → شروع پلتفرمر */
    if (E30.t > 2.6) {
      E30.phase = '';
      $('wrap').classList.remove('cine-mode');
      $('skipCs').classList.add('hidden');
      startPlatformer(1);
    }
  } else if (ph === 'station') {
    startDlg();
    if ((E30.dlgDone || E30.t > 70) && E30.t > 4) e30Next('driveoff');
  } else if (ph === 'driveoff') {
    E30.fade = clamp((E30.t - 3.6) / 2.2, 0, 1);
    if (E30.t > 6.2) e30Finish();
  }
}

/* ---------------------- رندر ---------------------- */
function renderEnding30() {
  if (state.mode !== 'sheltercine' || !E30.phase) return;
  const t = E30.t, ph = E30.phase;
  ctx.save();
  if (state.shake > 0.5) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);

  if (ph === 'arrive' || ph === 'welcome') drawE30Shelter(t, ph);
  else if (ph === 'siren') drawE30Siren(t);
  else if (ph === 'control') drawE30Control(t);
  else if (ph === 'escape') drawE30Escape(t);
  else if (ph === 'fire') drawE30Fire(t);
  else if (ph === 'part') drawE30Part(t);
  else if (ph === 'plati') drawE30Plati(t);
  else if (ph === 'station') drawE30Station(t);
  else if (ph === 'driveoff') drawE30Driveoff(t);

  drawShootingStar();
  drawParticles();
  drawTexts();

  /* محوِ کلی */
  if (E30.fade > 0) {
    ctx.fillStyle = `rgba(4,5,10,${E30.fade.toFixed(2)})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* انسانِ ساده — سایه‌وار (E30) */
function e30Figure(x, y, opt) {
  const o = opt || {};
  const C = o.c || 'rgba(12,14,22,0.95)';
  const s = o.s || 1;
  const ph = o.ph || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(o.face < 0 ? -s : s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(0, 1, 12, 3, 0, 0, Math.PI * 2); ctx.fill();
  /* پاها */
  ctx.strokeStyle = C; ctx.lineWidth = 5.4; ctx.lineCap = 'round';
  const st = Math.sin(ph);
  ctx.beginPath();
  ctx.moveTo(-1, -14); ctx.lineTo(-2 + st * 5, -1);
  ctx.moveTo(2, -14); ctx.lineTo(3 - st * 5, -1);
  ctx.stroke();
  /* بدن */
  ctx.fillStyle = C;
  rr(-7.5, -30, 15, 17, 5); ctx.fill();
  /* بازو */
  ctx.strokeStyle = C; ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-4, -26); ctx.lineTo(-7 - st * 3, -15);
  ctx.moveTo(4, -26); ctx.lineTo(7 + st * 3, -15);
  ctx.stroke();
  /* سر */
  ctx.fillStyle = C;
  circle(1.6, -34.6, 5.2);
  ctx.restore();
}

/* ---- پناهگاه: دروازهٔ بزرگ + چراغ‌های گرم (پرامپت ۶-۹) ---- */
function drawE30Shelter(t, ph) {
  const welcomed = ph === 'welcome';
  /* آسمان شب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#070a18');
  sky.addColorStop(0.7, '#0d1228');
  sky.addColorStop(1, '#1a1424');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* ستاره‌ها */
  ctx.fillStyle = 'rgba(214,222,255,0.5)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 173.3) % W, y = (i * 97.7) % 240;
    if (Math.sin(t * 1.3 + i) > -0.4) ctx.fillRect(x, y, 1.4, 1.4);
  }
  /* افق کوه */
  ctx.fillStyle = '#0a0d1c';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, GROUND_Y - 40 - Math.sin(x * 0.011) * 30);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#141826'); gr.addColorStop(1, '#1c1626');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  /* دیوار پناهگاه + دروازهٔ بزرگ فلزی (راست) */
  const gx = W * 0.72;
  ctx.fillStyle = '#232838';
  ctx.fillRect(gx - 150, GROUND_Y - 170, 300, 170);
  ctx.fillStyle = '#1c2130';
  ctx.fillRect(gx - 150, GROUND_Y - 170, 300, 12);
  /* برجک‌های نگهبانی */
  ctx.fillStyle = '#1a1f2e';
  ctx.fillRect(gx - 170, GROUND_Y - 210, 26, 210);
  ctx.fillRect(gx + 144, GROUND_Y - 210, 26, 210);
  /* نور گرم پنجره‌ها */
  const winGlow = welcomed ? 0.9 : 0.55 + 0.25 * Math.sin(t * 2);
  for (let i = 0; i < 5; i++) {
    const wx = gx - 120 + i * 52;
    ctx.fillStyle = `rgba(255,196,110,${winGlow * (0.6 + 0.3 * Math.sin(i * 2.4))})`;
    ctx.fillRect(wx, GROUND_Y - 128, 22, 30);
  }
  /* دروازهٔ فلزی */
  ctx.fillStyle = '#333a4e';
  ctx.fillRect(gx - 44, GROUND_Y - 84, 88, 84);
  ctx.strokeStyle = '#4a5470'; ctx.lineWidth = 3;
  ctx.strokeRect(gx - 44, GROUND_Y - 84, 88, 84);
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(gx - 44 + i * 22, GROUND_Y - 84); ctx.lineTo(gx - 44 + i * 22, GROUND_Y); ctx.stroke();
  }
  /* نور دروازه */
  const dg = ctx.createRadialGradient(gx, GROUND_Y - 30, 6, gx, GROUND_Y - 30, 120);
  dg.addColorStop(0, `rgba(255,190,100,${welcomed ? 0.4 : 0.26})`);
  dg.addColorStop(1, 'rgba(255,190,100,0)');
  ctx.fillStyle = dg; circle(gx, GROUND_Y - 30, 120);

  /* نگهبان کنار دروازه */
  e30Figure(gx + 66, GROUND_Y, { c: 'rgba(16,20,32,0.96)', s: 1.02, ph: Math.sin(t * 1.6) * 0.4 });
  /* هالهٔ چراغ‌قوه نگهبان */
  const gg = ctx.createRadialGradient(gx + 66, GROUND_Y - 40, 3, gx + 66, GROUND_Y - 40, 42);
  gg.addColorStop(0, 'rgba(200,225,255,0.28)');
  gg.addColorStop(1, 'rgba(200,225,255,0)');
  ctx.fillStyle = gg; circle(gx + 66, GROUND_Y - 40, 42);

  /* آدم‌های داخل (بازمانده‌ها) — فقط بعد از خوش‌آمد */
  if (welcomed) {
    for (let i = 0; i < 4; i++) {
      e30Figure(gx - 200 + i * 46, GROUND_Y, { c: 'rgba(20,24,38,0.9)', s: 0.92, ph: Math.sin(t * 1.2 + i * 2) * 0.5 });
    }
    /* دکتر مریم — روپوش روشن */
    e30Figure(gx - 40, GROUND_Y, { c: 'rgba(210,220,236,0.94)', s: 1.0, ph: Math.sin(t * 2.2) * 0.4 });
  }

  /* آرش و ارشان از چپ به سمت دروازه می‌روند */
  const k = welcomed ? 1 : clamp(t / 9, 0, 1);
  const bx = 120 + k * (gx - 300);
  const walkPh = welcomed ? t * 1.2 : t * 6.5;
  e30Figure(bx - 30, GROUND_Y, { c: 'rgba(10,12,20,0.95)', s: 1.05, ph: Math.sin(walkPh) });
  e30Figure(bx, GROUND_Y, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(walkPh + 2.4) });

  /* نورِ چراغ‌های عمودی */
  for (const lx of [W * 0.2, W * 0.44]) {
    ctx.strokeStyle = '#39405a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, GROUND_Y - 96); ctx.stroke();
    const on = 0.5 + 0.3 * Math.sin(t * 9 + lx);
    ctx.fillStyle = `rgba(255,214,150,${on})`;
    circle(lx, GROUND_Y - 98, 3);
    const lg = ctx.createRadialGradient(lx, GROUND_Y - 90, 4, lx, GROUND_Y - 70, 70);
    lg.addColorStop(0, `rgba(255,200,120,${on * 0.3})`);
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = lg; circle(lx, GROUND_Y - 70, 70);
  }
}

/* ---- آژیر: پوشش قرمز + چراغ‌های اضطراری (پرامپت ۶-۱۰) ---- */
function drawE30Siren(t) {
  drawE30Shelter(t, 'welcome');
  const red = 0.5 + 0.5 * Math.sin(t * 4.4);
  ctx.fillStyle = 'rgba(170,20,10,' + (0.1 + red * 0.11).toFixed(3) + ')';
  ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vg.addColorStop(0, 'rgba(120,0,0,0)');
  vg.addColorStop(1, 'rgba(120,0,0,' + (0.26 + red * 0.16).toFixed(3) + ')');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  /* چراغ گردان چشمک‌زن روی برجک */
  const bx = W * 0.72 + 144, by = GROUND_Y - 214;
  ctx.fillStyle = `rgba(255,60,40,${0.6 + red * 0.4})`;
  circle(bx, by, 5);
  const bg2 = ctx.createRadialGradient(bx, by, 3, bx, by, 60);
  bg2.addColorStop(0, `rgba(255,60,40,${0.5 * red})`);
  bg2.addColorStop(1, 'rgba(255,60,40,0)');
  ctx.fillStyle = bg2; circle(bx, by, 60);
  /* دود */
  ctx.fillStyle = 'rgba(60,60,70,0.16)';
  for (let i = 0; i < 3; i++) {
    const sx = W * 0.5 + i * 120 - 130, sw = 60 + i * 24;
    ctx.beginPath(); ctx.ellipse(sx + Math.sin(t + i) * 8, GROUND_Y - 150 - i * 26, sw, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
}

/* ---- اتاق کنترل: میزهای مانیتور + پروندهٔ Z زیر نور (پرامپت ۶-۱۱) ---- */
function drawE30Control(t) {
  /* فضای تیرهٔ سرد */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0d16');
  sky.addColorStop(1, '#131826');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 14;
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(0, fl, W, H - fl);

  /* نور سرد از پنجره‌های بالای دیوار */
  for (let i = 0; i < 3; i++) {
    const wx = W * 0.18 + i * W * 0.3;
    ctx.fillStyle = 'rgba(150,190,240,0.10)';
    ctx.beginPath();
    ctx.moveTo(wx - 26, 60); ctx.lineTo(wx + 26, 60);
    ctx.lineTo(wx + 62, fl); ctx.lineTo(wx - 62, fl);
    ctx.closePath(); ctx.fill();
  }

  /* ردیف میزهای مانیتور (عمق دو ردیف) */
  const desk = (x, y, s, glow) => {
    ctx.fillStyle = '#242c3e';
    ctx.fillRect(x - 44 * s, y - 12 * s, 88 * s, 12 * s);
    ctx.fillRect(x - 40 * s, y, 6 * s, 14 * s);
    ctx.fillRect(x + 34 * s, y, 6 * s, 14 * s);
    /* مانیتورها */
    for (const dx of [-26, 6]) {
      ctx.fillStyle = '#11141f';
      ctx.fillRect(x + (dx - 12) * s, y - 34 * s, 26 * s, 20 * s);
      const on = 0.4 + 0.5 * Math.abs(Math.sin(t * 3 + dx + x));
      ctx.fillStyle = `rgba(120,190,235,${on * glow})`;
      ctx.fillRect(x + (dx - 10) * s, y - 32 * s, 22 * s, 16 * s);
      /* متن/داده روی مانیتور */
      ctx.fillStyle = `rgba(200,235,255,${on * glow * 0.7})`;
      for (let r = 0; r < 3; r++) ctx.fillRect(x + (dx - 8) * s, y - 30 * s + r * 5 * s, (8 + ((x + r) % 3) * 5) * s, 1.6 * s);
    }
    /* کاغذهای پخش */
    ctx.fillStyle = 'rgba(220,225,235,0.5)';
    ctx.fillRect(x - 36 * s, y - 8 * s, 10 * s, 6 * s);
    ctx.fillRect(x + 22 * s, y - 9 * s, 12 * s, 7 * s);
  };
  desk(W * 0.2, fl - 70, 0.8, 0.5);
  desk(W * 0.44, fl - 66, 0.8, 0.5);
  desk(W * 0.86, fl - 72, 0.8, 0.5);

  /* میز کانونی: پروندهٔ «پروژهٔ Z» زیر نورِ مشخص */
  const fx = W * 0.62, fy = fl - 26;
  ctx.fillStyle = '#2a3346';
  ctx.fillRect(fx - 60, fy - 12, 120, 12);
  ctx.fillRect(fx - 54, fy, 8, 26);
  ctx.fillRect(fx + 46, fy, 8, 26);
  /* مخروط نور از بالا */
  const cone = ctx.createLinearGradient(0, 40, 0, fy);
  cone.addColorStop(0, 'rgba(255,226,150,0.30)');
  cone.addColorStop(1, 'rgba(255,226,150,0.02)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(fx - 14, 30); ctx.lineTo(fx + 14, 30);
  ctx.lineTo(fx + 58, fy - 8); ctx.lineTo(fx - 58, fy - 8);
  ctx.closePath(); ctx.fill();
  /* پروندهٔ کاغذی */
  const fileGlow = 0.75 + 0.25 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(245,228,180,${fileGlow})`;
  rr(fx - 22, fy - 22, 44, 12, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120,90,40,0.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(fx - 22, fy - 18); ctx.lineTo(fx + 22, fy - 18); ctx.stroke();
  /* حرف Z بزرگ روی پرونده */
  ctx.fillStyle = 'rgba(90,40,30,0.95)';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Z', fx, fy - 12.5);
  /* هالهٔ پرونده */
  const fg = ctx.createRadialGradient(fx, fy - 16, 4, fx, fy - 16, 66);
  fg.addColorStop(0, `rgba(255,226,150,${0.22 * fileGlow})`);
  fg.addColorStop(1, 'rgba(255,226,150,0)');
  ctx.fillStyle = fg; circle(fx, fy - 16, 66);

  /* آرش نزدیک پرونده (در حال برداشتن) + مریم و ارشان پشت سر */
  const reach = clamp((t - 2) / 3, 0, 1);
  e30Figure(fx - 90 - reach * 20, fl, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 3) * 0.6 });
  e30Figure(fx - 170, fl, { c: 'rgba(210,220,236,0.9)', s: 0.98, ph: Math.sin(t * 1.5) * 0.3 });
  e30Figure(fx - 210, fl, { c: 'rgba(26,30,44,0.94)', s: 1.0, ph: Math.sin(t * 1.8 + 1) * 0.3 });

  /* ترک سقف + گردوغبار */
  ctx.strokeStyle = 'rgba(10,12,18,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.3, 0);
  ctx.lineTo(W * 0.34, 46); ctx.lineTo(W * 0.31, 92); ctx.lineTo(W * 0.36, 140);
  ctx.stroke();
}

/* ---- فرار: لرزش + قرمز + محو (پرامپت ۶-۱۰) ---- */
function drawE30Escape(t) {
  drawE30Control(t);
  const red = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.fillStyle = 'rgba(170,20,10,' + (0.13 + red * 0.13).toFixed(3) + ')';
  ctx.fillRect(0, 0, W, H);
  /* جرقه */
  if (Math.random() < 0.5) {
    ctx.fillStyle = 'rgba(255,220,140,0.8)';
    ctx.fillRect(rand(W * 0.2, W * 0.8), rand(60, 180), 2, 2);
  }
}

/* ---- توقف‌گاه امن: شب + آتش کوچک (پرامپت ۶-۱۲) ---- */
function drawE30Fire(t) {
  /* آسمان سنگین شب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#060810');
  sky.addColorStop(0.6, '#0b0e1c');
  sky.addColorStop(1, '#171522');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  ctx.fillStyle = 'rgba(210,218,250,0.4)';
  for (let i = 0; i < 30; i++) {
    const x = (i * 211.7) % W, y = (i * 83.3) % 200;
    if (Math.sin(t * 1.1 + i) > 0) ctx.fillRect(x, y, 1.2, 1.2);
  }
  /* خرابه‌های دور */
  ctx.fillStyle = 'rgba(14,16,26,0.9)';
  for (let i = 0; i < 6; i++) {
    const bx = i * W / 5.4 + 30, bh = 60 + (i * 37) % 70;
    ctx.fillRect(bx, GROUND_Y - bh, 54, bh);
    ctx.beginPath();
    ctx.moveTo(bx, GROUND_Y - bh);
    ctx.lineTo(bx + 20, GROUND_Y - bh - 14);
    ctx.lineTo(bx + 54, GROUND_Y - bh + 4);
    ctx.closePath(); ctx.fill();
  }
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#191420'); gr.addColorStop(1, '#100c14');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

  /* آتش کوچک وسط کادر */
  const fx = W * 0.5, fy = GROUND_Y - 6;
  /* سنگ‌چین */
  ctx.fillStyle = '#2c2824';
  for (let i = -4; i <= 4; i++) circle(fx + i * 9, fy - 2, 5.4 - Math.abs(i) * 0.5);
  /* هالهٔ بزرگ گرم */
  const fl = 0.75 + 0.25 * Math.sin(t * 7.3) * Math.sin(t * 2.1);
  const halo = ctx.createRadialGradient(fx, fy - 22, 8, fx, fy - 22, 240);
  halo.addColorStop(0, `rgba(255,150,60,${0.34 * fl})`);
  halo.addColorStop(0.5, `rgba(255,130,50,${0.13 * fl})`);
  halo.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = halo; circle(fx, fy - 22, 240);
  /* زبانه‌های آتش */
  for (let i = 0; i < 3; i++) {
    const wob = Math.sin(t * (6 + i * 2.4) + i * 2) * 4;
    const hgt = 34 + i * 12 + Math.sin(t * 9 + i) * 7;
    const fg = ctx.createLinearGradient(fx, fy - hgt, fx, fy);
    fg.addColorStop(0, `rgba(255,190,90,0.0)`);
    fg.addColorStop(0.35, `rgba(255,170,70,${0.75 - i * 0.16})`);
    fg.addColorStop(1, `rgba(232,90,40,${0.9 - i * 0.14})`);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(fx - 12 + i * 9 + wob * 0.4, fy - 4);
    ctx.quadraticCurveTo(fx - 16 + i * 10 + wob, fy - hgt * 0.6, fx + i * 7 + wob, fy - hgt);
    ctx.quadraticCurveTo(fx + 16 + i * 9 + wob, fy - hgt * 0.55, fx + 12 + i * 8 + wob * 0.4, fy - 4);
    ctx.closePath(); ctx.fill();
  }
  /* هیزم */
  ctx.strokeStyle = '#3a2c1e'; ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(fx - 16, fy - 2); ctx.lineTo(fx + 14, fy - 12);
  ctx.moveTo(fx - 14, fy - 12); ctx.lineTo(fx + 16, fy - 2);
  ctx.stroke();

  /* سه نفر دور آتش — با نور آتش (سمت آتش روشن‌تر) */
  e30Figure(fx - 110, GROUND_Y, { c: 'rgba(10,12,20,0.95)', s: 1.02, ph: Math.sin(t * 1.3) * 0.35, face: 1 });
  e30Figure(fx + 112, GROUND_Y, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 1.6 + 2) * 0.35, face: -1 });
  e30Figure(fx - 30, GROUND_Y - 4, { c: 'rgba(200,212,232,0.6)', s: 0.94, ph: Math.sin(t * 1.1) * 0.3, face: 1 });
  /* کاغذ در دست آرش (زیر نور) */
  ctx.save();
  ctx.translate(fx - 96, GROUND_Y - 22);
  ctx.rotate(-0.2 + Math.sin(t * 2) * 0.05);
  ctx.fillStyle = `rgba(245,228,180,${0.8 + 0.2 * fl})`;
  ctx.fillRect(-8, -6, 16, 10);
  ctx.restore();

  /* رادیو روی سنگ (برای خط دکتر سارا) */
  if (t > 36) {
    const rx = fx + 46, ry = GROUND_Y - 8;
    ctx.fillStyle = '#23262e';
    rr(rx - 10, ry - 14, 20, 14, 2); ctx.fill();
    ctx.fillStyle = `rgba(120,200,160,${0.5 + 0.4 * Math.sin(t * 8)})`;
    ctx.fillRect(rx - 7, ry - 11, 5, 4);
    ctx.strokeStyle = '#3a4050'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(rx + 6, ry - 14); ctx.lineTo(rx + 10, ry - 26); ctx.stroke();
    /* موج رادیویی */
    for (let i = 0; i < 3; i++) {
      const rr2 = 14 + i * 10 + (Math.sin(t * 3 - i) * 4 + 4);
      ctx.strokeStyle = `rgba(120,200,160,${0.3 - i * 0.08})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rx + 8, ry - 26, rr2, -0.9, 0.9); ctx.stroke();
    }
  }
}

/* ---- جدایی: جادهٔ دو شاخه + ماشین (پرامپت ۶-۱۲/۲) ---- */
function drawE30Part(t) {
  /* گرگ و میم سحرگاه */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#1a1a30');
  sky.addColorStop(0.55, '#3a2c3c');
  sky.addColorStop(1, '#6a4440');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  /* خورشیدِ پایین */
  const sg = ctx.createRadialGradient(W * 0.2, GROUND_Y - 20, 6, W * 0.2, GROUND_Y - 20, 150);
  sg.addColorStop(0, 'rgba(255,170,90,0.6)');
  sg.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = sg; circle(W * 0.2, GROUND_Y - 20, 150);
  /* افق خرابه */
  ctx.fillStyle = 'rgba(26,22,30,0.92)';
  for (let i = 0; i < 7; i++) {
    const bx = i * W / 6.2, bh = 40 + (i * 53) % 80;
    ctx.fillRect(bx, GROUND_Y - bh, 60, bh);
  }
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#2e2820'); gr.addColorStop(1, '#201a16');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* جادهٔ خاکی + شاخه شدن */
  ctx.fillStyle = '#3c342a';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 26);
  ctx.lineTo(W * 0.52, GROUND_Y + 14);
  ctx.lineTo(W, GROUND_Y + 30);
  ctx.lineTo(W, GROUND_Y + 60);
  ctx.lineTo(0, GROUND_Y + 60);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(60,52,40,0.9)'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(W * 0.52, GROUND_Y + 16);
  ctx.quadraticCurveTo(W * 0.66, GROUND_Y + 2, W, GROUND_Y + 8);
  ctx.stroke();

  /* ماشین (سمت راست) — ارشان بالای آن */
  const cx = W * 0.68, cy = GROUND_Y + 6;
  const driveK = clamp((t - 26) / 6, 0, 1);            // بعد از «قول می‌دم» حرکت می‌کند
  const carX = cx + driveK * (W * 0.5);
  ctx.save();
  ctx.globalAlpha = 1 - driveK * 0.6;
  /* بدنه */
  ctx.fillStyle = '#3d4552';
  rr(carX - 58, cy - 34, 116, 22, 7); ctx.fill();
  rr(carX - 26, cy - 50, 56, 18, 6); ctx.fill();
  ctx.fillStyle = 'rgba(180,220,240,0.4)';
  ctx.fillRect(carX - 20, cy - 46, 20, 11);
  ctx.fillRect(carX + 6, cy - 46, 18, 11);
  /* چرخ‌ها */
  ctx.fillStyle = '#16181e';
  circle(carX - 34, cy - 8, 11); circle(carX + 36, cy - 8, 11);
  ctx.fillStyle = '#3a3e48';
  circle(carX - 34, cy - 8, 4.4); circle(carX + 36, cy - 8, 4.4);
  /* چراغ جلو */
  ctx.fillStyle = `rgba(255,220,140,${0.7 + 0.3 * Math.sin(t * 4)})`;
  circle(carX + 57, cy - 24, 3.4);
  const lg = ctx.createRadialGradient(carX + 57, cy - 24, 3, carX + 57, cy - 24, 70);
  lg.addColorStop(0, 'rgba(255,220,140,0.3)');
  lg.addColorStop(1, 'rgba(255,220,140,0)');
  ctx.fillStyle = lg; circle(carX + 57, cy - 24, 70);
  /* گردوغبار پشت ماشین وقتی حرکت می‌کند */
  if (driveK > 0 && Math.random() < 0.6) {
    ctx.fillStyle = 'rgba(120,104,84,0.3)';
    ctx.beginPath(); ctx.ellipse(carX - 70, cy - 6, 18 + Math.random() * 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  /* دکتر مریم + اعضا (سمت چپ دور) */
  e30Figure(W * 0.12, GROUND_Y, { c: 'rgba(200,212,232,0.62)', s: 0.96, ph: Math.sin(t * 1.2) * 0.3 });
  e30Figure(W * 0.08, GROUND_Y, { c: 'rgba(20,24,36,0.9)', s: 0.92, ph: Math.sin(t * 1.5) * 0.3 });

  /* ارشان کنار ماشین (قبل از حرکت) */
  if (driveK <= 0) {
    e30Figure(carX - 84, GROUND_Y + 6, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 2) * 0.4 });
  }
  /* آرش — پیاده، سمت چپ، رو به خرابه‌ها */
  e30Figure(W * 0.42, GROUND_Y, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 2.4) * 0.5 });
}

/* ---- کارت فصل میانی ---- */
function drawE30Plati(t) {
  ctx.fillStyle = '#05060c';
  ctx.fillRect(0, 0, W, H);
  const a = clamp(Math.min(t * 2, (2.6 - t) * 2), 0, 1);
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aab8d8';
  ctx.font = 'bold 16px Vazirmatn, sans-serif';
  ctx.fillText('فصل میانی — سفر', W / 2, H / 2 - 44);
  ctx.fillStyle = '#ffd98a';
  ctx.font = 'bold 30px Vazirmatn, sans-serif';
  ctx.fillText('مرحلهٔ ۱ — خرابه‌های شهر', W / 2, H / 2);
  ctx.fillStyle = '#8494b8';
  ctx.font = '14px Vazirmatn, sans-serif';
  ctx.fillText('آرش، تنها و پیاده، در دل خرابه‌ها به سمت ایستگاه شمالی', W / 2, H / 2 + 34);
  ctx.globalAlpha = 1;
}

/* ---- ایستگاه شمالی: آزمایشگاه نیمه‌ویران + دکتر سارا (پرامپت ۶-۱۴) ---- */
function drawE30Station(t) {
  /* نور سرد آزمایشگاه در برابر گرما */
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0c1018');
  sky.addColorStop(1, '#161c2a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const fl = GROUND_Y - 10;
  ctx.fillStyle = '#1c2330';
  ctx.fillRect(0, fl, W, H - fl);

  /* پنجره‌های شکسته + نور سرد */
  for (let i = 0; i < 3; i++) {
    const wx = W * 0.2 + i * W * 0.28;
    ctx.fillStyle = 'rgba(160,200,245,0.12)';
    ctx.beginPath();
    ctx.moveTo(wx - 24, 74); ctx.lineTo(wx + 24, 74);
    ctx.lineTo(wx + 52, fl); ctx.lineTo(wx - 52, fl);
    ctx.closePath(); ctx.fill();
    /* قاب پنجره شکسته */
    ctx.strokeStyle = '#39435a'; ctx.lineWidth = 3;
    ctx.strokeRect(wx - 26, 60, 52, 34);
    ctx.beginPath();
    ctx.moveTo(wx - 26, 60); ctx.lineTo(wx - 4, 94);
    ctx.moveTo(wx + 12, 60); ctx.lineTo(wx + 26, 80);
    ctx.stroke();
  }

  /* تجهیزات شکسته */
  const equip = (x, h) => {
    ctx.fillStyle = '#252e40';
    rr(x, fl - h, 46, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(120,190,235,0.5)';
    ctx.fillRect(x + 8, fl - h + 10, 12, 8);
    ctx.fillRect(x + 26, fl - h + 10, 10, 8);
    ctx.fillStyle = 'rgba(220,225,235,0.4)';
    ctx.fillRect(x + 6, fl - h + 26, 34, 3);
    ctx.fillRect(x + 10, fl - h + 33, 26, 3);
  };
  equip(W * 0.08, 76);
  equip(W * 0.9, 66);

  /* کاغذهای پخش روی زمین */
  ctx.fillStyle = 'rgba(220,224,235,0.35)';
  for (let i = 0; i < 12; i++) {
    const px = (i * 137.7) % (W - 120) + 60;
    ctx.save();
    ctx.translate(px, fl + 8 + (i % 3) * 16);
    ctx.rotate((i * 1.7) % 1.2 - 0.6);
    ctx.fillRect(-9, -6, 18, 12);
    ctx.restore();
  }

  /* میز سارا + نور سرد روشن روی آن */
  const sx = W * 0.66, sy = fl - 24;
  ctx.fillStyle = '#2a3346';
  ctx.fillRect(sx - 62, sy - 12, 124, 12);
  ctx.fillRect(sx - 56, sy, 8, 24);
  ctx.fillRect(sx + 48, sy, 8, 24);
  const cone = ctx.createLinearGradient(0, 46, 0, sy);
  cone.addColorStop(0, 'rgba(170,210,250,0.24)');
  cone.addColorStop(1, 'rgba(170,210,250,0.02)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(sx - 16, 42); ctx.lineTo(sx + 16, 42);
  ctx.lineTo(sx + 60, sy - 10); ctx.lineTo(sx - 60, sy - 10);
  ctx.closePath(); ctx.fill();
  /* پرونده‌ها روی میز */
  ctx.fillStyle = 'rgba(200,205,218,0.6)';
  for (const [dx, dy, w2] of [[-40, -20, 26], [-8, -22, 30], [26, -19, 24]]) {
    ctx.save(); ctx.translate(sx + dx, sy + dy); ctx.rotate(dx / 240);
    ctx.fillRect(-w2 / 2, -5, w2, 10);
    ctx.restore();
  }

  /* دکتر سارا — زخمی، پشت میز، روپوش آزمایشگاهی خاک‌گرفته */
  ctx.save();
  ctx.translate(sx, sy + 4);
  /* بدن نشسته */
  ctx.fillStyle = 'rgba(214,222,238,0.88)';
  rr(-13, -44, 26, 34, 8); ctx.fill();
  /* بانداز بازوی چپ */
  ctx.fillStyle = 'rgba(200,80,70,0.7)';
  ctx.fillRect(-22, -34, 9, 14);
  /* سر خسته */
  ctx.fillStyle = 'rgba(224,196,168,0.95)';
  circle(2, -50, 7);
  /* موی جفیده روشن */
  ctx.fillStyle = 'rgba(120,110,100,0.9)';
  ctx.beginPath();
  ctx.arc(2, -52, 7.2, Math.PI * 0.95, Math.PI * 1.9);
  ctx.fill();
  ctx.fillRect(-5, -53, 7, 3);
  /* سایه‌ی چشم (خستگی) */
  ctx.fillStyle = 'rgba(70,60,60,0.4)';
  ctx.fillRect(-2, -51, 4, 1.6);
  ctx.fillRect(5, -51, 4, 1.6);
  ctx.restore();

  /* نور آتش بیرون از در (چپ) */
  const fireGlow = 0.6 + 0.4 * Math.sin(t * 7);
  const doorX = W * 0.06;
  const fg = ctx.createRadialGradient(doorX, fl - 30, 6, doorX, fl - 30, 110);
  fg.addColorStop(0, `rgba(255,150,60,${0.2 * fireGlow})`);
  fg.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = fg; circle(doorX, fl - 30, 110);

  /* آرش و ارشان وارد از چپ */
  const k = clamp(t / 5, 0, 1);
  const ax = 90 + k * (sx - 220);
  e30Figure(ax, fl, { c: 'rgba(10,12,20,0.96)', s: 1.02, ph: Math.sin(t * 5) });
  e30Figure(ax - 60, fl, { c: 'rgba(26,30,44,0.95)', s: 1.0, ph: Math.sin(t * 5 + 2.4) });

  /* نور چراغ ماشین از دور (انتهای گفتگو) */
  if (t > 40) {
    const hl = ctx.createRadialGradient(W - 40, fl - 20, 4, W - 40, fl - 20, 130);
    const arr = clamp((t - 40) / 4, 0, 1);
    hl.addColorStop(0, `rgba(255,240,190,${0.5 * arr})`);
    hl.addColorStop(1, 'rgba(255,240,190,0)');
    ctx.fillStyle = hl; circle(W - 40, fl - 20, 130);
  }
}

/* ---- ماشین در جاده + نقشهٔ داشبورد → پایان باز (پرامپت بخش ۲ پایان) ---- */
function drawE30Driveoff(t) {
  /* جادهٔ غروب */
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#14172a');
  sky.addColorStop(0.5, '#2e2438');
  sky.addColorStop(1, '#583830');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 2);
  const sg = ctx.createRadialGradient(W * 0.82, GROUND_Y - 26, 8, W * 0.82, GROUND_Y - 26, 170);
  sg.addColorStop(0, 'rgba(255,160,80,0.55)');
  sg.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = sg; circle(W * 0.82, GROUND_Y - 26, 170);
  /* کوه‌ها */
  ctx.fillStyle = 'rgba(22,20,30,0.9)';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 70) ctx.lineTo(x, GROUND_Y - 30 - Math.sin(x * 0.008) * 34);
  ctx.lineTo(W, GROUND_Y); ctx.closePath(); ctx.fill();
  /* زمین */
  const gr = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  gr.addColorStop(0, '#26211c'); gr.addColorStop(1, '#181410');
  ctx.fillStyle = gr; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  /* جاده */
  ctx.fillStyle = '#332e26';
  ctx.fillRect(0, GROUND_Y + 18, W, 42);
  ctx.strokeStyle = 'rgba(220,200,150,0.25)'; ctx.lineWidth = 3;
  ctx.setLineDash([26, 22]);
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 40); ctx.lineTo(W, GROUND_Y + 40); ctx.stroke();
  ctx.setLineDash([]);

  /* ماشین در حال حرکت به راست + سه سرنشین */
  const carX = W * 0.3 + clamp(t / 6, 0, 1) * W * 0.42;
  const cy = GROUND_Y + 24;
  const bump = Math.sin(t * 9) * 1.4;
  ctx.save();
  ctx.translate(0, bump);
  ctx.fillStyle = '#3d4552';
  rr(carX - 58, cy - 36, 116, 22, 7); ctx.fill();
  rr(carX - 26, cy - 52, 56, 18, 6); ctx.fill();
  ctx.fillStyle = 'rgba(190,215,240,0.42)';
  ctx.fillRect(carX - 20, cy - 48, 20, 11);
  ctx.fillRect(carX + 6, cy - 48, 18, 11);
  /* سرهای سه سرنشین */
  ctx.fillStyle = 'rgba(224,196,168,0.95)';
  circle(carX - 12, cy - 50, 4.6);
  circle(carX + 4, cy - 50, 4.6);
  circle(carX + 20, cy - 50, 4.6);
  /* چرخ‌های چرخان */
  ctx.fillStyle = '#16181e';
  circle(carX - 34, cy - 8, 11); circle(carX + 36, cy - 8, 11);
  ctx.strokeStyle = '#3a3e48'; ctx.lineWidth = 2;
  const wr = t * 9;
  for (const wx of [carX - 34, carX + 36]) {
    ctx.beginPath();
    ctx.moveTo(wx - Math.cos(wr) * 8, cy - 8 - Math.sin(wr) * 8);
    ctx.lineTo(wx + Math.cos(wr) * 8, cy - 8 + Math.sin(wr) * 8);
    ctx.stroke();
  }
  /* چراغ جلو + دنبالهٔ نور */
  ctx.fillStyle = `rgba(255,225,150,${0.7 + 0.3 * Math.sin(t * 4)})`;
  circle(carX + 57, cy - 26, 3.4);
  const lg = ctx.createRadialGradient(carX + 57, cy - 26, 3, carX + 57, cy - 26, 90);
  lg.addColorStop(0, 'rgba(255,225,150,0.32)');
  lg.addColorStop(1, 'rgba(255,225,150,0)');
  ctx.fillStyle = lg; circle(carX + 57, cy - 26, 90);
  /* گردوغبار */
  ctx.fillStyle = 'rgba(120,104,84,0.25)';
  ctx.beginPath(); ctx.ellipse(carX - 74, cy - 4, 20 + Math.random() * 12, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* نقشهٔ داشبورد با نقاط علامت‌خورده (نزدیک‌نما — پایین چپ) */
  const mapA = clamp(Math.min((t - 1.2) * 0.9, (5.6 - t) * 0.9), 0, 1);
  if (mapA > 0) {
    ctx.save();
    ctx.globalAlpha = mapA;
    const mx = W * 0.2, my = H - 132, mw = 210, mh = 118;
    ctx.fillStyle = 'rgba(24,20,16,0.92)';
    rr(mx - 12, my - 12, mw + 24, mh + 24, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(120,100,70,0.6)'; ctx.lineWidth = 2;
    rr(mx - 12, my - 12, mw + 24, mh + 24, 8); ctx.stroke();
    /* کاغذ نقشه */
    ctx.fillStyle = 'rgba(226,214,186,0.95)';
    rr(mx, my, mw, mh, 3); ctx.fill();
    /* جاده‌ها */
    ctx.strokeStyle = 'rgba(110,90,60,0.7)'; ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(mx + 14, my + mh - 20);
    ctx.quadraticCurveTo(mx + mw * 0.4, my + 26, mx + mw - 20, my + mh - 40);
    ctx.moveTo(mx + 30, my + 12);
    ctx.quadraticCurveTo(mx + mw * 0.6, my + mh * 0.55, mx + mw - 34, my + 20);
    ctx.stroke();
    /* نقاط علامت‌خورده (قرمز) */
    const dots = [[0.22, 0.72], [0.45, 0.38], [0.68, 0.6], [0.86, 0.3]];
    dots.forEach(([fx2, fy2], i) => {
      const dx = mx + mw * fx2, dy2 = my + mh * fy2;
      const pulse = 0.6 + 0.4 * Math.sin(t * 4 + i * 1.5);
      ctx.fillStyle = `rgba(190,50,40,${pulse})`;
      circle(dx, dy2, 4.4);
      ctx.strokeStyle = 'rgba(120,30,24,0.8)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(dx, dy2, 7.4, 0, Math.PI * 2); ctx.stroke();
      /* خط تا نقطهٔ بعد */
      if (i < dots.length - 1) {
        const nx = mx + mw * dots[i + 1][0], ny = my + mh * dots[i + 1][1];
        ctx.strokeStyle = 'rgba(150,40,30,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(dx, dy2); ctx.lineTo(nx, ny); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    /* نوشتهٔ کوچک */
    ctx.fillStyle = 'rgba(80,60,40,0.85)';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('مسیر فاز دوم — شمال', mx + 16, my + 14);
    ctx.restore();
  }
}
