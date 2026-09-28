/* ==================================================================
   سه طبقه تا بقا — نسخه‌ی ۱۱٫۰ — بخش ۸: کات‌سین افتتاحیه + تنظیمات
   ==================================================================
   کات‌سین افتتاحیه فقط بعد از «بازی جدید» یک‌بار پخش می‌شود:
     ۵ صحنه‌ی Canvas + گفتگوی داستانیِ صوتی (DLG — پرتره + ماشین‌نویس
     همگام با صدا؛ صداهای واقعی از voices_data.js).
   هر صحنه وقتی پیش می‌رود که گفتگویش تمام شود.
   ================================================================== */

let INTRO = null;      // وضعیت کات‌سین افتتاحیه

/* ---------------------- ۸-۱) صحنه‌ها و زیرنویس‌ها ---------------------- */
const INTRO_SCENES = [
  { dur: 5,  draw: introScCity },      // ۱: شهر در غروبِ خالی‌شدن
  { dur: 6,  draw: introScStreet },    // ۲: خیابان متروک
  { dur: 6,  draw: introScBuild },     // ۳: ساخت برج
  { dur: 6,  draw: introScNight },     // ۴: شبِ محاصره
  { dur: 7,  draw: introScRadio },     // ۵: رادیو + نقشه‌ی پناهگاه
];

/* (۱۱٫۰) گفتگوی صوتی هر صحنه — who: n=راوی a=ارشان p=بازیکن r=رادیو */
const INTRO_DLGS = [
  [ { who: 'n', voice: 'i1n1', text: 'چند ماه پیش، یک ویروس ناشناخته از حومه‌ی شهر نشت کرد.' },
    { who: 'n', voice: 'i1n2', text: 'ظرف چند هفته، شهر خالی شد.' } ],
  [ { who: 'a', voice: 'i2a1', text: 'وای... چه قدر ساکت شده. فکر کنم فقط ما دو تا مونده‌ایم.' },
    { who: 'p', voice: 'i2p1', text: 'شاید. ولی تا وقتی این برج وایساده، ما هم وایساده‌ایم.' } ],
  [ { who: 'a', voice: 'i3a1', text: 'بیار ببین... طبقه‌ی سوم بهترین جاست. از بالا همه جا رو می‌بینیم.' },
    { who: 'n', voice: 'i3n1', text: 'با هر چیزی که در دستتان رسید، برجی ساختید.' } ],
  [ { who: 'a', voice: 'i4a1', text: 'صداشون رو می‌شنوی؟ دارن میان!' },
    { who: 'p', voice: 'i4p1', text: 'آره. امشب، اولین شبِ محاصره‌ست. آماده باش!' } ],
  [ { who: 'r', voice: 'i5r1', text: 'به همه‌ی بازمانده‌ها: به سمت پاسگاه شمالی حرکت کنید. این پیام تکرار می‌شود.' },
    { who: 'a', voice: 'i5a1', text: 'شنیدی؟ یه جای امن هست! باید برسیمش!' },
    { who: 'p', voice: 'i5p1', text: 'اول باید از این شب زنده بمونیم. بعد حرف می‌زنیم.' },
    { who: 'n', voice: 'i5n1', text: 'هر شبی که دوام بیاری، یک قدم به پناهگاه نزدیک‌تری.' } ],
];
/* (۱۱٫۰) INTRO_SUBS حذف شد — گفتگوی صوتی INTRO_DLGS جایگزین زیرنویس است */

/* ---------------------- ۸-۲) اجرا/توقف/رد کردن ---------------------- */
function startIntroCine() {
  introHardReset();
  INTRO = { t: 0, idx: 0, _paused: false, dlgStarted: false, dlgDone: false, noDlg: false };
  state.mode = 'intro';
  state.mouse.down = false;
  hideOverlays();
  hideDayPanel();
  hidePeddlerPanel();
  hideAnnounce();
  $('wrap').classList.add('cine-mode');
  $('skipCs').classList.remove('hidden');
}

/* روایت اختیاری — هر خطایی بی‌صدا بلعیده می‌شود (فایل نبود = فقط زیرنویس) */
function tryPlayNarration() {
  try {
    const a = $('narrAudio');
    if (!a) return;
    a.volume = 0.95;
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* بدون روایت ادامه بده */ }
}
function stopNarration() {
  try { const a = $('narrAudio'); if (a) a.pause(); } catch (e) {}
}

function updateIntro(dt) {
  if (!INTRO || INTRO._paused) return;
  INTRO.t += dt;
  const S = INTRO_SCENES[INTRO.idx];
  DLG.update(dt);                                   // (۱۱٫۰) گفتگوی صوتی صحنه
  /* شروع گفتگو کمی بعد از ورود صحنه */
  if (!INTRO.dlgStarted && INTRO.t > 0.75 && !INTRO.noDlg) {
    INTRO.dlgStarted = true;
    const dlg = INTRO_DLGS[INTRO.idx];
    if (dlg && dlg.length) DLG.start(dlg, () => { if (INTRO) INTRO.dlgDone = true; });
    else INTRO.dlgDone = true;
  }
  /* صحنه‌ی بعد وقتی گفتگو تمام شد (حداقل نفسِ ۲.۲ ثانیه‌ای صحنه) */
  if ((INTRO.dlgDone || INTRO.noDlg) && INTRO.t >= (INTRO.noDlg ? 0.05 : 2.2)) {
    INTRO.idx++;
    INTRO.t = 0; INTRO.dlgStarted = false; INTRO.dlgDone = false;
    if (INTRO.idx >= INTRO_SCENES.length) { endIntro(); return; }
    SFX.csWhoosh();
  }
  /* غبار/کاغذ صحنه‌ها */
  updateParticles(dt);
  updateTexts(dt);
}

function skipIntro() {
  if (!INTRO) return;
  SFX.click();
  DLG.skip();
  endIntro();
}

function endIntro() {
  stopNarration();
  VOICE.stop();
  DLG.skip();
  INTRO = null;
  $('wrap').classList.remove('cine-mode');
  $('skipCs').classList.add('hidden');
  doFade(() => {
    startGame();
    setAnnounce('🧟 شب اول شروع شد!', 'برای شلیک کلیک کن — هدف: ' + faNum(FINAL_WAVE) + ' شب زنده موندی', 3);
  }, 0.5);
}

function introHardReset() {
  INTRO = null;
  stopNarration();
  $('wrap').classList.remove('cine-mode');
}

/* زمان جهانی کات‌سین (برای زیرنویس‌ها) */
function introGlobalT() {
  let T = 0;
  for (let i = 0; i < INTRO.idx; i++) T += INTRO_SCENES[i].dur;
  return T + INTRO.t;
}

/* ---------------------- ۸-۳) رندر کات‌سین ---------------------- */
function renderIntro() {
  if (!INTRO) return;
  const S = INTRO_SCENES[INTRO.idx];
  if (S) S.draw(INTRO.t);
  /* محوِ ورود هر صحنه */
  const a = 1 - clamp(INTRO.t / 0.6, 0, 1);
  if (a > 0.01) {
    ctx.fillStyle = 'rgba(0,0,0,' + a.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  /* ویگنت سینمایی */
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.4, W / 2, H * 0.5, H * 0.85);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  /* (۱۱٫۰) زیرنویس حذف شد — گفتگوی صوتی DLG (پرتره + حباب) جایگزین است */
  /* نوارهای سینمایی */
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, 28);
  ctx.fillRect(0, H - 28, W, 28);
  /* راهنمای رد کردن (چند ثانیه‌ی اول) */
  const T = introGlobalT();
  if (T < 5) {
    ctx.globalAlpha = clamp(1 - T / 5, 0, 1) * 0.8;
    ctx.font = 'bold 11.5px Tahoma, sans-serif';
    ctx.fillStyle = '#c3cdea';
    ctx.textAlign = 'left';
    ctx.fillText('⏭ رد کردن', 16, H - 44);
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1;
  }
}

/* --- صحنه ۱: شهر در غروبِ خالی‌شدن + کلاغ‌ها + مه --- */
function introScCity(t) {
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#2c1e4a'); g.addColorStop(0.45, '#7a3a52');
  g.addColorStop(0.8, '#c46a4a'); g.addColorStop(1, '#e8a05c');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, GROUND_Y + 20);
  /* خورشیدِ در حال غروب */
  const sg = ctx.createRadialGradient(700, 296, 12, 700, 296, 130);
  sg.addColorStop(0, 'rgba(255,205,125,0.5)'); sg.addColorStop(1, 'rgba(255,205,125,0)');
  ctx.fillStyle = sg; circle(700, 296, 130);
  ctx.fillStyle = '#ffd88a'; circle(700, 296, 33);
  /* کلاغ‌ها */
  ctx.strokeStyle = 'rgba(20,12,26,0.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 260 + t * 46) % (W + 120)) - 60;
    const cy = 80 + i * 34 + Math.sin(t * 2 + i) * 8;
    const fl = Math.sin(t * 7 + i * 2) * 4;
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + fl); ctx.quadraticCurveTo(cx, cy - 4, cx + 7, cy + fl);
    ctx.stroke();
  }
  /* افق شهر */
  ctx.fillStyle = '#1a1226';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h * 0.8, b.w, b.h * 0.8);
  ctx.fillStyle = '#241832';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h * 0.8, b.w, 3);
  /* مه زرد روی زمین */
  const fog = ctx.createLinearGradient(0, GROUND_Y - 80, 0, GROUND_Y);
  fog.addColorStop(0, 'rgba(196,155,110,0)');
  fog.addColorStop(1, 'rgba(196,155,110,0.38)');
  ctx.fillStyle = fog; ctx.fillRect(-20, GROUND_Y - 80, W + 40, 80);
  /* زمین خالی */
  ctx.fillStyle = '#241a20'; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  /* کاغذهای ول‌گذشته */
  ctx.fillStyle = 'rgba(220,205,180,0.5)';
  for (let i = 0; i < 6; i++) {
    const x = ((i * 173 + t * 55) % (W + 60)) - 30;
    const y = GROUND_Y - 14 - (i % 3) * 20 - Math.abs(Math.sin(t * 1.7 + i)) * 16;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3 + i) * 0.8);
    ctx.fillRect(-3, -2, 6, 4);
    ctx.restore();
  }
}

/* --- صحنه ۲: خیابان متروک با چراغ سوسوزن و ماشین رهاشده --- */
function introScStreet(t) {
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#060a1c'); g.addColorStop(0.5, '#0e1834'); g.addColorStop(1, '#1e2c50');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, GROUND_Y + 20);
  /* ماه */
  ctx.fillStyle = '#efe6c4'; circle(180, 84, 30);
  ctx.fillStyle = 'rgba(120,110,80,0.2)'; circle(172, 78, 5); circle(190, 92, 3.6);
  /* افق */
  ctx.fillStyle = '#0b1226';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h * 0.9, b.w, b.h * 0.9);
  /* زمین/آسفالت */
  ctx.fillStyle = '#191d24'; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  ctx.fillStyle = 'rgba(230,200,120,0.5)';
  for (let x = ((t * 26) % 56) - 56; x < W + 56; x += 56) ctx.fillRect(x, GROUND_Y + 34, 30, 4);
  /* چراغ خیابان — یکی سوسو می‌زند */
  for (const [lx, flick] of [[300, true], [660, false]]) {
    ctx.strokeStyle = '#2c3038'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(lx, GROUND_Y); ctx.lineTo(lx, GROUND_Y - 92);
    ctx.quadraticCurveTo(lx, GROUND_Y - 102, lx + 18, GROUND_Y - 100); ctx.stroke();
    const on = flick ? (Math.sin(t * 13) > -0.25 ? 1 : 0.12) : 1;
    const lg = ctx.createRadialGradient(lx + 18, GROUND_Y - 96, 4, lx + 18, GROUND_Y - 96, 70);
    lg.addColorStop(0, 'rgba(255,220,140,' + (0.5 * on) + ')');
    lg.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = lg; circle(lx + 18, GROUND_Y - 96, 70);
    ctx.fillStyle = 'rgba(255,235,170,' + on + ')';
    circle(lx + 18, GROUND_Y - 96, 3.4);
  }
  /* ماشین رهاشده با لاستیک خالی */
  ctx.save();
  ctx.translate(560, GROUND_Y + 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 4, 62, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22262e';
  rr(-56, -26, 112, 22, 8); ctx.fill();
  ctx.fillStyle = '#191d24';
  ctx.beginPath();
  ctx.moveTo(-30, -26); ctx.lineTo(-20, -48); ctx.lineTo(22, -48); ctx.lineTo(34, -26);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0d1016';
  circle(-34, -2, 11); circle(34, -2, 11);         // لاستیک‌های خوابیده
  ctx.restore();
  /* کاغذهای بادکن */
  ctx.fillStyle = 'rgba(220,205,180,0.42)';
  for (let i = 0; i < 8; i++) {
    const x = ((i * 131 + t * 80) % (W + 80)) - 40;
    const y = GROUND_Y - 10 - (i % 4) * 26 - Math.abs(Math.sin(t * 2.2 + i * 1.7)) * 30;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 4 + i) * 1.1);
    ctx.fillRect(-3, -2, 6, 4);
    ctx.restore();
  }
}

/* --- صحنه ۳: ساخت برج در شب (آجرچین‌های خسته) --- */
function introScBuild(t) {
  const k = clamp(t / 8.2, 0, 1);            // پیشرفت ساخت
  const g = ctx.createLinearGradient(0, -20, 0, GROUND_Y);
  g.addColorStop(0, '#060a1c'); g.addColorStop(0.55, '#101c3c'); g.addColorStop(1, '#223258');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, GROUND_Y + 20);
  /* ماه در حال بالا آمدن */
  const my = 150 - k * 74;
  ctx.fillStyle = '#efe6c4'; circle(790, my, 28);
  /* افق */
  ctx.fillStyle = '#0b1226';
  for (const b of SKYLINE) ctx.fillRect(b.x, GROUND_Y - b.h * 0.85, b.w, b.h * 0.85);
  /* زمین */
  ctx.fillStyle = '#1c222c'; ctx.fillRect(-20, GROUND_Y, W + 40, H - GROUND_Y + 20);
  /* برج نیمه‌ساخته: طبقه‌ها به‌ترتیب با پیشرفت */
  const cx = TOWER.x;
  const built = k * 3;                        // چند طبقه ساخته شده
  const widths = [136, 124, 112];
  const cols = [
    ['#82705a', '#6e5a44', '#4d3f2f'],
    ['#b25a47', '#a04b3a', '#7c3527'],
    ['#4f83b5', '#41729f', '#2f557c'],
  ];
  for (let i = 0; i < 3; i++) {
    const f = clamp(built - i, 0, 1);
    if (f <= 0.02) continue;
    const hw = widths[i] / 2;
    const yB = GROUND_Y - i * TOWER.floorH;
    const h = TOWER.floorH * f;
    const gr = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
    gr.addColorStop(0, cols[i][0]); gr.addColorStop(0.55, cols[i][1]); gr.addColorStop(1, cols[i][2]);
    ctx.fillStyle = gr;
    ctx.fillRect(cx - hw, yB - h, hw * 2, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.4;
    /* درزهای آجرچینی تا ارتفاع ساخته‌شده */
    ctx.beginPath();
    for (let ry = 0; ry < h; ry += 13) {
      ctx.moveTo(cx - hw + 3, yB - ry); ctx.lineTo(cx + hw - 3, yB - ry);
      const off = (ry / 13 % 2) * 11;
      for (let bx = cx - hw + off + 22; bx < cx + hw - 6; bx += 22) {
        ctx.moveTo(bx, yB - ry); ctx.lineTo(bx, yB - Math.min(ry + 13, h));
      }
    }
    ctx.stroke();
  }
  /* داربست کنار برج */
  ctx.strokeStyle = '#4a3b2a'; ctx.lineWidth = 2.4;
  ctx.beginPath();
  const sx2 = cx + 78;
  ctx.moveTo(sx2, GROUND_Y); ctx.lineTo(sx2, GROUND_Y - 200 * k - 20);
  ctx.moveTo(sx2 + 26, GROUND_Y); ctx.lineTo(sx2 + 26, GROUND_Y - 200 * k - 20);
  for (let i = 0; i < 7; i++) {
    const yy = GROUND_Y - i * 30;
    if (yy < GROUND_Y - 200 * k - 20) break;
    ctx.moveTo(sx2, yy); ctx.lineTo(sx2 + 26, yy);
    ctx.moveTo(sx2, yy - 15); ctx.lineTo(sx2 + 26, yy);
  }
  ctx.stroke();
  /* نردبان */
  ctx.strokeStyle = '#6a5a44'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 86, GROUND_Y); ctx.lineTo(cx - 86, GROUND_Y - 196 * k - 18);
  ctx.moveTo(cx - 74, GROUND_Y); ctx.lineTo(cx - 74, GROUND_Y - 196 * k - 18);
  for (let yy = GROUND_Y - 12; yy > GROUND_Y - 196 * k - 18; yy -= 16) {
    ctx.moveTo(cx - 86, yy); ctx.lineTo(cx - 74, yy);
  }
  ctx.stroke();
  /* دو دوستِ آجرچین: تیر چوبی بلند را با هم جابه‌جا می‌کنند */
  const walk = Math.sin(t * 0.5) * 60;
  drawIntroWorker(cx - 60 + walk, GROUND_Y, '#3d6db5');
  drawIntroWorker(cx - 24 + walk, GROUND_Y, '#4a7a4a');
  ctx.strokeStyle = '#6a4a2c'; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 66 + walk, GROUND_Y - 26); ctx.lineTo(cx - 18 + walk, GROUND_Y - 26);
  ctx.stroke();
}
function drawIntroWorker(x, y, jacket) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 2, 9, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2c3550'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -12); ctx.lineTo(-4, -1); ctx.moveTo(3, -12); ctx.lineTo(4, -1);
  ctx.stroke();
  ctx.fillStyle = jacket; rr(-7, -25, 14, 14, 4); ctx.fill();
  ctx.fillStyle = '#f0c49a'; circle(1, -30, 5);
  ctx.fillStyle = '#5a3d28';
  ctx.beginPath(); ctx.arc(1, -30, 5, Math.PI, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#f0c49a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(3, -22); ctx.lineTo(9, -27); ctx.stroke();
  ctx.restore();
}

/* --- صحنه ۴: شبِ محاصره — برج آماده و زامبی‌ها می‌آیند --- */
function introScNight(t) {
  /* از موتور اصلی بازی استفاده می‌کنیم: آسمان/برج/بازیکن زنده‌اند */
  drawSky();
  drawClouds();
  drawSkyline();
  drawHills();
  drawPuddles();
  drawGrass();
  drawDecals();
  drawTree(88, 0.95, false);
  drawTree(874, 0.7, false);
  drawLamps();
  drawTrap();
  drawTower();
  drawPlayer();
  /* دسته‌ی زامبی از دو طرف — با زمان نزدیک می‌شوند */
  const k = clamp(t / 9, 0, 1);
  const zs = [
    { x0: -60,  type: 'normal' }, { x0: -190, type: 'fast' },
    { x0: -320, type: 'normal' }, { x0: W + 60, type: 'normal' },
    { x0: W + 190, type: 'tank' }, { x0: W + 330, type: 'fast' },
  ];
  for (let i = 0; i < zs.length; i++) {
    const z = zs[i];
    const target = z.x0 < 0 ? 150 + i * 24 : W - 150 - (i - 3) * 24;
    const x = z.x0 + (target - z.x0) * k;
    const zz = {
      type: z.type, x, y: GROUND_Y + rand(-1, 1), dir: z.x0 < 0 ? 1 : -1,
      radius: ZTYPES[z.type].r, walkPhase: t * 4 + i * 1.7,
      attacking: false, attackAnim: 0, attackSide: 0, lane: 0, depth: 1,
      yJit: (i % 3) * 2 - 2, stagger: 0, chill: 0, hitFlash: 0, dead: false, deathT: 0,
    };
    drawZombie(zz);
  }
  drawFireflies();
  drawShootingStar();
}

/* --- صحنه ۵: رادیو + نقشه‌ی راه پناهگاه --- */
function introScRadio(t) {
  ctx.fillStyle = '#04050c';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  /* هاله‌ی گرم رادیو */
  const rx = 300, ry = 300;
  const rg = ctx.createRadialGradient(rx, ry, 8, rx, ry, 200);
  rg.addColorStop(0, 'rgba(255,190,110,0.22)');
  rg.addColorStop(1, 'rgba(255,190,110,0)');
  ctx.fillStyle = rg; circle(rx, ry, 200);
  /* ارشان: سایه‌ی کلاه‌قرمز که رادیو را گرفته */
  ctx.save();
  ctx.translate(170, 420);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(30, 4, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#101422'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(18, -14); ctx.lineTo(14, 0); ctx.moveTo(34, -14); ctx.lineTo(38, 0);
  ctx.stroke();
  ctx.fillStyle = '#101826'; rr(8, -34, 40, 22, 6); ctx.fill();
  ctx.fillStyle = '#0d1420'; circle(28, -40, 8);
  ctx.fillStyle = '#5e1f28';
  ctx.beginPath(); ctx.arc(28, -40, 8.4, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(19, -41, 18, 3);
  /* دست‌ها به سمت رادیو */
  ctx.strokeStyle = '#0d1420'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(20, -28); ctx.lineTo(66, -40); ctx.moveTo(38, -26); ctx.lineTo(72, -34); ctx.stroke();
  ctx.restore();
  /* رادیوی قدیمی: جعبه چوبی + آنتن + صفحه‌ی سوسوزن */
  ctx.save();
  ctx.translate(rx, ry);
  ctx.fillStyle = '#3a2c1a';
  rr(-46, -34, 92, 68, 8); ctx.fill();
  ctx.strokeStyle = '#1c1408'; ctx.lineWidth = 2.4;
  rr(-46, -34, 92, 68, 8); ctx.stroke();
  /* آنتن */
  ctx.strokeStyle = '#8a97a8'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(30, -34); ctx.lineTo(52, -84); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(38, -34); ctx.lineTo(58, -74); ctx.stroke();
  /* صفحه‌ی فرکانس */
  const dial = 0.55 + 0.45 * Math.sin(t * 2.4);
  ctx.fillStyle = '#c9a24e';
  rr(-34, -22, 68, 30, 4); ctx.fill();
  ctx.fillStyle = 'rgba(40,26,8,0.9)';
  rr(-30, -18, 60, 22, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,140,' + dial + ')'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const fx = -24 + i * 10;
    ctx.moveTo(fx, -8); ctx.lineTo(fx + 3, -14);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,90,70,0.9)';
  circle(-24 + ((t * 12) % 56), -11, 2);       // عقربه‌ی فرکانس
  /* دکمه‌ها */
  ctx.fillStyle = '#8a7a5c';
  for (let i = 0; i < 3; i++) circle(-20 + i * 20, 20, 4);
  /* موج‌های رادیویی */
  ctx.strokeStyle = 'rgba(140,190,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.8 + i * 0.33) % 1;
    ctx.globalAlpha = (1 - ph) * 0.5;
    ctx.beginPath();
    ctx.arc(46, -20, 20 + ph * 130, -0.9, 0.6);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  /* نقشه‌ی راه: ۴ برج + مسیر نقطه‌چین تا پناهگاه */
  const mk = clamp((t - 1.5) / 6, 0, 1);
  ctx.save();
  ctx.translate(650, 300);
  ctx.rotate(-0.06);
  ctx.fillStyle = 'rgba(210,190,150,0.9)';
  rr(-120, -90, 240, 180, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(90,70,40,0.6)'; ctx.lineWidth = 2;
  rr(-120, -90, 240, 180, 6); ctx.stroke();
  ctx.fillStyle = 'rgba(120,100,60,0.25)';       // لکه‌های کاغذ کهنه
  circle(-80, -50, 18); circle(70, 40, 14); circle(30, -60, 10);
  /* مسیر نقطه‌چین */
  ctx.strokeStyle = 'rgba(90,60,30,0.75)';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(-95, 55);
  ctx.lineTo(-40, 10); ctx.lineTo(10, 48); ctx.lineTo(60, -18); ctx.lineTo(95, -55);
  ctx.stroke();
  ctx.setLineDash([]);
  /* برج‌ها به‌ترتیب روشن می‌شوند */
  const towers = [[-95, 55], [-40, 10], [10, 48], [60, -18]];
  for (let i = 0; i < 4; i++) {
    const on = mk > i * 0.24 + 0.05;
    ctx.strokeStyle = on ? '#e8a13c' : 'rgba(90,70,40,0.5)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(towers[i][0] - 5, towers[i][1] + 8);
    ctx.lineTo(towers[i][0], towers[i][1] - 10);
    ctx.lineTo(towers[i][0] + 5, towers[i][1] + 8);
    ctx.closePath();
    on ? ctx.fill() : ctx.stroke();
  }
  /* نشان پناهگاه */
  if (mk > 0.85) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 4);
    ctx.save();
    ctx.shadowColor = '#7be389'; ctx.shadowBlur = 12 * pulse;
    ctx.fillStyle = '#7be389';
    ctx.beginPath();
    ctx.moveTo(95, -66); ctx.lineTo(99, -54); ctx.lineTo(107, -54);
    ctx.lineTo(101, -47); ctx.lineTo(103, -38); ctx.lineTo(95, -44);
    ctx.lineTo(87, -38); ctx.lineTo(89, -47); ctx.lineTo(83, -54);
    ctx.lineTo(91, -54); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#3a5a2c';
    ctx.font = 'bold 12px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('پناهگاه', 95, -20);
  }
  ctx.restore();
}

/* ---------------------- ۸-۴) تنظیمات (SETT) ---------------------- */
const SETT_KEY = 'ttb3_settings_v1';
let SETT = { sfx: true, music: true, shake: true, vol: 55 };

function loadSettings() {
  try {
    const d = JSON.parse(localStorage.getItem(SETT_KEY));
    if (d && typeof d === 'object') SETT = Object.assign(SETT, d);
  } catch (e) {}
  applySettings();
}
function saveSettings() {
  try { localStorage.setItem(SETT_KEY, JSON.stringify(SETT)); } catch (e) {}
}
function applySettings() {
  Snd.muted = !SETT.sfx;
  if (Snd.master) Snd.master.gain.value = SETT.sfx ? (SETT.vol / 100) * 0.9 : 0;
  Snd.musicOn = !!SETT.music;
  if (Snd.musicGain && Snd.ctx) Snd.setMusic(SETT.music);
  /* آیکون‌های بی‌صدا */
  for (const id of ['btnMute', 'btnMute0', 'btnMute2']) {
    const b = $(id);
    if (!b) continue;
    b.textContent = SETT.sfx
      ? (id === 'btnMute2' ? '🔊 صدا روشن' : '🔊')
      : (id === 'btnMute2' ? '🔇 صدا خاموش' : '🔇');
  }
  updateSettingsUI();
}

function initSettingsUI() {
  loadSettings();
  $('setSfx').addEventListener('change', e => { SETT.sfx = e.target.checked; saveSettings(); applySettings(); if (SETT.sfx) SFX.click(); });
  $('setMusic').addEventListener('change', e => { SETT.music = e.target.checked; saveSettings(); applySettings(); });
  $('setShake').addEventListener('change', e => { SETT.shake = e.target.checked; saveSettings(); });
  $('setVol').addEventListener('input', e => { SETT.vol = +e.target.value; saveSettings(); applySettings(); });
  updateSettingsUI();
}
function updateSettingsUI() {
  $('setSfx').checked = !!SETT.sfx;
  $('setMusic').checked = !!SETT.music;
  $('setShake').checked = !!SETT.shake;
  $('setVol').value = SETT.vol;
}
