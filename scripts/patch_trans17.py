#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""وصله‌های ۱۷٫۰ روی v4_transitions.js — مسیر رانندگی + عمق تونل/زیپ‌لاین"""
import io

P = '/home/z/my-project/scripts/v4_transitions.js'
src = io.open(P, encoding='utf-8').read()
n = 0

def rep(old, new, count=1):
    global src, n
    assert src.count(old) >= count, f'NOT FOUND ({n}): {old[:80]!r}'
    src = src.replace(old, new, count)
    n += 1

# ---------- ۱) TR_DLGS[1]: خط راویِ منطقِ فرار ارشان (بعد از فریاد ارشان) ----------
rep("""const TR_DLGS = {
  1: [ { who: 'a', v: 't1a1', text: 'برج داره فرو می‌ریزه! بپر! سریع!' } ],""",
    """const TR_DLGS = {
  /* (۱۷٫۰) ت1n1: منطقِ رسیدن ارشان با ماشین — از قبل پایین بوده و ماشین
     را گرم کرده؛ برای همین لحظه‌ی فروریختن همان‌جا است (غیبت لحظه‌ای‌اش
     روی برج طبیعی به نظر می‌رسد) */
  1: [ { who: 'a', v: 't1a1', text: 'برج داره فرو می‌ریزه! بپر! سریع!' },
       { who: 'n', v: 't1n1', text: 'ارشان از قبل رفته بود پایینِ برج تا ماشین رو گرم کنه؛ برای همین همون لحظه رسید!' } ],""")

# ---------- ۲) SUBS_INTRO1: پایانِ فاز ۱ = سوار ماشین شدن (نه دویدن کنارش) ----------
rep("""  [5.3, 5.9, 'بام می‌لغزه — بپر!'],
  [6.2, 6.9, '— [ارشان]: ماشین! سوار شو!'],
  [7.0, 7.7, '— [ارشان]: زامبی‌ها ماشین رو گرفتن... در رو باز کردم، بزن بیرون و کنار ماشین بدو!'],
];""",
    """  [5.3, 5.9, 'بام می‌لغزه — بپر!'],
  [6.2, 6.9, '— [ارشان]: ماشین! سوار شو!'],
  [7.0, 7.7, '— [ارshanق]: زامبی‌ها پشت سرمون‌ان — تو پشت فرمان، من صندلی کمکی!'],
];""".replace('ارshanق', 'ارشان'))

# ---------- ۳) mgNudge: در تم رانندگی = فرمان ----------
rep("""function mgNudge(d) {
  if (!TR || TR.phase !== 2) return;
  mgKeys.left = d < 0;
  mgKeys.right = d > 0;
}""",
    """function mgNudge(d) {
  if (!TR || TR.phase !== 2) return;
  /* (۱۷٫۰) تم رانندگی: ←/→ فرمان است (نه شتاب جانبی) */
  if (MG.cfg && MG.cfg.theme === 'drive') {
    if (typeof DRV !== 'undefined') {
      DRV.steer = d < 0 ? -1 : (d > 0 ? 1 : 0);
      DRV.kb = d !== 0;                    /* کج‌کردن گوشی فقط وقتی کلید/لمس نیست */
    }
    return;
  }
  mgKeys.left = d < 0;
  mgKeys.right = d > 0;
}""")

# ---------- ۴) MG.reset: راه‌اندازی وضعیت رانندگی ----------
rep("""  reset(cfg) {
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
  },""",
    """  reset(cfg) {
    this.cfg = cfg;
    this.scroll = 0; this.speed = cfg.speed0;
    this.obs = []; this.nextObs = 560;
    this.pl = { y: 0, vy: 0, duck: false, ground: true, inv: 0, run: 0 };
    this.hits = 0;
    this.hidePlayer = false;
    this.outroPlayer = null;
    this.t2 = 0;
    if (cfg.theme === 'drive') {           /* (۱۷٫۰) مینی‌گیم رانندگی شبه‌سه‌بعدی */
      driveReset(cfg);
      this.hidden = null;
    } else {
      this.hidden = { x: cfg.goalM * PXM * cfg.hidden.at, id: cfg.hidden.id, floatY: cfg.hidden.floatY, got: false };
    }
    for (const s of cfg.subs) s.done = false;
  },""")

# ---------- ۵) mgUpdate: شاخه‌ی اختصاصی رانندگی ----------
rep("""function mgUpdate(dt) {
  const cfg = MG.cfg;
  TR.fade = Math.max(0, TR.fade - dt * 1.9);
  MG.t2 += dt;""",
    """function mgUpdate(dt) {
  const cfg = MG.cfg;
  /* (۱۷٫۰) تم رانندگی: فیزیک/رندر اختصاصی خودش را دارد */
  if (cfg.theme === 'drive') { driveUpdate(dt); return; }
  TR.fade = Math.max(0, TR.fade - dt * 1.9);
  MG.t2 += dt;""")

# ---------- ۶) تولید موانع تونل/زیپ‌لاین: عمق (dp) برای پرسپکتیو ----------
rep("""  /* تولید موانع تا جلوتر از صفحه */
  while (MG.nextObs < MG.scroll + W + 160) {
    const type = cfg.obstacles[irand(0, cfg.obstacles.length - 1)];
    MG.obs.push({ wx: MG.nextObs, type, hit: false });
    MG.nextObs += rand(cfg.obsGap[0], cfg.obsGap[1]) + MG.speed * 0.3;
  }""",
    """  /* تولید موانع تا جلوتر از صفحه — (۱۷٫۰) هر مانع عمقِ (dp) خودش را
     می‌گیرد: دورتر = کوچک‌تر/کم‌رنگ‌تر/کمی بالاتر (پرسپکتیو ساده) */
  while (MG.nextObs < MG.scroll + W + 160) {
    const type = cfg.obstacles[irand(0, cfg.obstacles.length - 1)];
    MG.obs.push({ wx: MG.nextObs, type, hit: false, dp: rand(0.62, 1) });
    MG.nextObs += rand(cfg.obsGap[0], cfg.obsGap[1]) + MG.speed * 0.3;
  }""")

# ---------- ۷) MGCFG[1]: پیکربندی تم رانندگی ----------
rep("""const MGCFG = {
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
  },""",
    """const MGCFG = {
  /* (۱۷٫۰) فصل ۱→۲: رانندگی شبه‌سه‌بعدی — بازیکن پشت فرمان، ارشان صندلی
     کمکی؛ موانع/زامبی‌ها با پرسپکتیو؛ آیتم مخفی = جعبه‌ی کنار جاده.
     فیزیک/رندر در v4_drive.js (driveUpdate/renderDrive) */
  1: {
    theme: 'drive', baseY: GROUND_Y,
    goalM: 380, speed0: 2000, speedMin: 700, speedMax: 3400,
    hidden: { id: 'medkit', at: 0.45 },
    battDrain: 0,
    startSub: '— [ارشان]: فرمان با توئه! گاز بده!',
    outroDur: 3.4,
    outroSub: '— [ارشان]: انبارهای مه‌گرفته جلوته... رسیدیم!',
    hitSubs: ['بوووم! حواست کجاست؟!', 'زدی بهش! سرعت گیر کرد!', 'مواظب باش! جاده پر الکل!'],
    subs: [
      { atM: 90,  txt: '— [ارشان]: زامبی‌ها جلو رفتن... گاز بده، رد شو!',
        barkV: 'd1a1', barkT: 'مواظب باش! تا انبارها یه راه باقی مونده!' },
      { atM: 200, txt: '— [تو]: این جاده هم پای آخر داره!' },
      { atM: 300, txt: '— [ارشان]: مهِ انبارها داره میاد... تقریباً رسیدیم!' },
    ],
    drawBG: null, drawObs: null, drawProps: null,
    outroUpdate: driveOutroUpdate, outroDraw: null,
  },""")

# ---------- ۸) renderMG: شاخه‌ی رانندگی + مرتب‌سازی عمق موانع ----------
rep("""function renderMG() {
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
  }""",
    """function renderMG() {
  if (!TR || !MG.cfg) return;
  const cfg = MG.cfg;
  /* (۱۷٫۰) تم رانندگی: رندر شبه‌سه‌بعدی اختصاصی */
  if (cfg.theme === 'drive') { renderDrive(); return; }
  const gy = cfg.baseY;
  const scroll = MG.scroll;
  const mode = cfg.theme === 'zipline' ? 'hang' : 'run';

  cfg.drawBG(scroll, gy);

  /* موانع — (۱۷٫۰) رسم از دور به نزدیک (dp کوچک = دور) با مقیاس/کم‌رنگی
     عمق و کمی جابه‌جایی عمودی: پرسپکتیوِ ساده‌ی هماهنگ با رانندگی */
  for (const o of [...MG.obs].sort((a, b) => (a.dp || 1) - (b.dp || 1))) {
    const sx = o.wx - scroll;
    if (sx > -140 && sx < W + 140) {
      const dp = o.dp || 1;
      if (dp > 0.97) cfg.drawObs(o, sx, gy);
      else {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.5 * dp;
        ctx.translate(sx, gy - (1 - dp) * 14);
        ctx.scale(dp, dp);
        ctx.translate(-sx, -(gy - (1 - dp) * 14));
        cfg.drawObs(o, sx, gy - (1 - dp) * 14);
        ctx.restore();
      }
    }
  }""")

io.open(P, 'w', encoding='utf-8').write(src)
print(f'OK — {n} وصله روی v4_transitions.js اعمال شد')
