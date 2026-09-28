#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۵٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + دگرگونی‌های ۱۵ (حذف نسخه‌ی منو)
#  ۱) صدای نورال ۳۶ کلیپ (رگرسیون)
#  ۲) منوی تمیز + افتتاحیه
#  ۳) دکمه‌ی «شب شود» پایین‌راست — دور از برج/کوله/اعلان
#  ۴) دستفروش: استوری + پنل بالاتر (بدون تلاقی با ریل توقف)
#  ۵) تب بقا آیکون‌ها                        ۶) موبایل fitWrap
#  ۷) سیو با برجک‌ها (وسایل با باخت نمی‌روند)
#  ۸) باخت: صدای باخت نه دیالوگ + بدون «رد کردن» + صفحه‌ی ساده
#     + «تلاش دوباره» وسایل را نگه می‌دارد + «منوی اصلی» سیو را نگه می‌دارد
#  ۹) سختیِ ملایم‌تر                          ۱۰) رگرسیون گیم‌پلی
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots15
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری و دگرگونی‌های ۱۵ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v14 API" "$(ev 'typeof GAME.v14')" "object"
chk "GAME.v13 API" "$(ev 'typeof GAME.v13')" "object"
chk "GAME.v12 API (باخت)" "$(ev 'typeof GAME.v12')" "object"
chk "(۱۵) متن نسخه از منو حذف شد" "$(ev '!!document.querySelector(".ver")')" "false"
chk "شعار منو حذف شده (رگرسیون)" "$(ev '!!document.querySelector(".tagline")')" "false"
chk "STORE لایه‌ی ذخیره‌سازی" "$(ev 'typeof STORE')" "object"
chk "fitWrap تابع موجود" "$(ev 'typeof fitWrap')" "function"
chk "بدون خطای کنسول (بارگذاری)" "$(agent-browser errors | grep -c error || echo 0)" "0"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) صدای نورال ۳۶ کلیپ (رگرسیون ۱۴) ====="
chk "۳۶ کلیپ موجود" "$(ev 'GAME.v13.clipCount')" "36"
chk "همه‌ی کلیپ‌ها data URI سالم" "$(ev 'Object.values(VOICES14).every(c => c.a.startsWith("data:audio/mpeg;base64,") && !c.a.includes("base64,data:"))')" "true"
chk "کلیپ‌های داستان دستفروش موجود" "$(ev '!!VOICES14.pd1a && !!VOICES14.pd1b && !!VOICES14.pd1c && !!VOICES14.pd1l')" "true"
agent-browser eval "Snd.init(); Snd.resume(); VOICE.warmup()" >/dev/null
sleep 5
chk "پیش‌بارگیری کلیپ‌ها (≥۳۰)" "$(ev 'GAME.v13.decodedClips().length >= 30')" "true"
chk "متن افتتاحیه بازنویسی‌شده (رگرسیون)" "$(ev 'INTRO_DLGS[0][0].text.includes("آغاز شد")')" "true"

echo "===== ۲) منوی تمیز + افتتاحیه صوتی ====="
chk "فقط ۲ زامبیِ تزئینی منو" "$(ev 'menuZ.length')" "2"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.8
chk "حالت intro" "$(ev 'GAME.state.mode')" "intro"
chk "گفتگو فعال" "$(ev 'GAME.v11.DLG.active')" "true"
sleep 2
chk "پخش کلیپ در گفتگو" "$(ev 'VOICE.mode')" "clip"
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 0.6

echo "===== ۳) دکمه‌ی «شب شود» پایین‌راست — دور از برج ====="
agent-browser set viewport 632 360 >/dev/null
agent-browser wait 400
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay()" >/dev/null
sleep 0.8
chk "روز شروع شد" "$(ev 'GAME.state.mode')" "day"
DAYPOS=$(agent-browser eval "
(() => {
  const w = document.getElementById('wrap').getBoundingClientRect();
  const dp = document.getElementById('dayPanel').getBoundingClientRect();
  const cx = w.left + w.width / 2;               /* مرکز برج */
  return JSON.stringify({
    right: dp.right > w.left + w.width * 0.62,   /* در نیمه‌ی راست */
    offTower: dp.left > cx + 60,                 /* دور از پایه‌ی برج */
    bottom: dp.bottom < w.bottom - 8 && dp.bottom > w.bottom - 160,
  });
})()" | tr -d '"\' | tr -d ' ')
echo "  .. موقعیت دکمه: $DAYPOS"
chk "دکمه‌ی شب: نیمه‌ی راست صفحه" "$(echo $DAYPOS | grep -o 'right:true')" "right:true"
chk "دکمه‌ی شب: روی برج نیست" "$(echo $DAYPOS | grep -o 'offTower:true')" "offTower:true"
chk "دکمه‌ی شب: چسبیده به پایین" "$(echo $DAYPOS | grep -o 'bottom:true')" "bottom:true"
NOV=$(agent-browser eval "
(() => {
  const r = id => document.getElementById(id).getBoundingClientRect();
  const dp = r('dayPanel');
  const ov = (a, b) => !(a.bottom <= b.top || b.bottom <= a.top);
  const an = r('announce'), bp = r('backpackBar'), ts = r('saveToast');
  return JSON.stringify({ ann: ov(dp, an), bpk: ov(dp, bp), toast: ov(dp, ts) });
})()" | tr -d '"\' | tr -d ' ')
chk "بدون تلاقی با اعلان/کوله/توست" "$(echo $NOV | grep -o 'ann:false,bpk:false,toast:false')" "ann:false,bpk:false,toast:false"
agent-browser screenshot $S/02_day_bottomright.png >/dev/null

echo "===== ۴) دستفروش: پنل بالاتر + بدون تلاقی با ریل توقف ====="
agent-browser set viewport 632 360 >/dev/null
agent-browser wait 300
agent-browser eval "GAME.v14.peddlerForce()" >/dev/null
sleep 4.2
chk "فاز گفتگو (رسید پایین برج)" "$(ev 'PED.phase')" "talk"
chk "گفتگو فعال + dlg-on" "$(agent-browser eval "String(DLG.active) + '|' + String(GAME.v14.dlgOn)" | tr -d '"')" "true|true"
chk "صدای کلیپ دستفروش" "$(ev 'VOICE.mode')" "clip"
agent-browser screenshot $S/03_peddler_dlg.png >/dev/null
agent-browser eval "DLG.skip()" >/dev/null
sleep 0.3
chk "پس از گفتگو: قفسه‌ی کالا باز شد" "$(agent-browser eval "String(PED.phase) + '|' + String(!document.getElementById('peddlerPanel').classList.contains('hidden'))" | tr -d '"')" "stay|true"
PEDPOS=$(agent-browser eval "
(() => {
  const r = id => document.getElementById(id).getBoundingClientRect();
  const pd = r('peddlerPanel'), rail = r('ctlRail'), w = r('wrap');
  const ov = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  return JSON.stringify({
    noRail: !ov(pd, rail),                       /* دیگر روی دکمه‌ی توقف نمی‌افتد */
    higher: pd.top < w.top + w.height * 0.32,    /* بالاتر از قبل (top:48 در قاب 560) */
  });
})()" | tr -d '"\' | tr -d ' ')
echo "  .. موقعیت پنل: $PEDPOS"
chk "پنل دستفروش روی ریل توقف نمی‌افتد" "$(echo $PEDPOS | grep -o 'noRail:true')" "noRail:true"
chk "پنل دستفروش بالاتر قرار گرفت" "$(echo $PEDPOS | grep -o 'higher:true')" "higher:true"
agent-browser screenshot $S/04_peddler_shop.png >/dev/null
agent-browser eval "GAME.startNight()" >/dev/null
chk "شب: دستفروش در حال رفتن" "$(ev 'PED.phase')" "leave"
chk "شب: پنل فروش بسته شد" "$(ev 'document.getElementById("peddlerPanel").classList.contains("hidden")')" "true"
sleep 3.2
chk "دستفروش کاملاً رفت" "$(ev 'PED.active')" "false"

echo "===== ۵) تب بقا با آیکون واقعی (رگرسیون) ====="
agent-browser set viewport 1100 640 >/dev/null
agent-browser wait 300
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay(); setBPTab('sur')" >/dev/null
sleep 0.4
ICONS=$(agent-browser eval "
(() => {
  let good = 0;
  for (const k of ['flashlight','battery','canned','medkit']) {
    const cv = document.querySelector('#bp-' + k + ' .bp-ic');
    if (!cv) continue;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 40) if (d[i+3] > 30) n++;
    if (n > 400) good++;
  }
  return good;
})()" | tr -d '"')
chk "۴ کاشی بقا آیکون رنگی دارند" "$ICONS" "4"

echo "===== ۶) موبایل: fitWrap + عمودی (رگرسیون) ====="
agent-browser set viewport 632 360 >/dev/null
agent-browser wait 400
chk "کل بازی در صفحه جا می‌شود (۶۳۲×۳۶۰)" "$(agent-browser eval "
(() => {
  const w = document.getElementById('wrap').getBoundingClientRect();
  return (w.left >= 0 && w.right <= 632 && w.top >= 0 && w.bottom <= 360);
})()" | tr -d '"')" "true"
agent-browser set viewport 480 320 >/dev/null
agent-browser wait 400
chk "کل بازی در صفحه جا می‌شود (۴۸۰×۳۲۰)" "$(agent-browser eval "
(() => {
  const w = document.getElementById('wrap').getBoundingClientRect();
  return (w.left >= 0 && w.right <= 480 && w.top >= 0 && w.bottom <= 320);
})()" | tr -d '"')" "true"
agent-browser set viewport 380 720 >/dev/null
agent-browser wait 500
chk "عمودی: راهنمای چرخش تمام‌صفحه" "$(agent-browser eval "
(() => {
  if (window.ttbOrient) window.ttbOrient();
  const h = document.getElementById('rotateHint');
  const r = h.getBoundingClientRect();
  return !h.classList.contains('hidden') && r.width > 300 && r.height > 500;
})()" | tr -d '"')" "true"
agent-browser set viewport 1100 640 >/dev/null
agent-browser wait 400
chk "افقی: راهنما مخفی" "$(ev 'document.getElementById("rotateHint").classList.contains("hidden")')" "true"

echo "===== ۷) سیو با برجک‌ها — وسایل از دست نمی‌روند ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; GAME.state.wave=6; enterDay()" >/dev/null
agent-browser eval "GAME.giveCoins(900); GAME.v10.buy('gatling'); GAME.clickPlace(300, 486)" >/dev/null
agent-browser eval "GAME.v10.buy('sniper'); GAME.clickPlace(700, 486)" >/dev/null
sleep 0.3
chk "۲ برجک نصب شد" "$(ev 'GAME.state.turrets.length')" "2"
agent-browser eval "GAME.v10.saveGame()" >/dev/null
chk "برجک‌ها در سیو ذخیره شدند" "$(ev 'GAME.v10.loadSaveData().turrets.length')" "2"
chk "نوع برجک در سیو درست" "$(ev 'GAME.v10.loadSaveData().turrets[1].t')" "sniper"
agent-browser eval "GAME.v11.saveAndExit()" >/dev/null
sleep 0.8
chk "خروج به منو" "$(ev 'GAME.state.mode')" "start"
agent-browser eval "GAME.v10.continueGame()" >/dev/null
sleep 1.2
chk "ادامه → روز" "$(ev 'GAME.state.mode')" "day"
chk "برجک‌ها پس از ادامه برگشتند" "$(ev 'GAME.state.turrets.length')" "2"
chk "جای برجک‌ها درست" "$(agent-browser eval "Math.round(GAME.state.turrets[0].x)" | tr -d '"')" "300"
chk "کد سیو هم برجک دارد" "$(ev 'GAME.v13.exportSaveCode().length > 100')" "true"

echo "===== ۸) باخت: صدای باخت، بدون «رد کردن»، صفحه‌ی ساده، تلاش دوباره ====="
agent-browser eval "GAME.v10.wipeSave(); GAME.startGame(); GAME.state.mode='day'; enterDay()" >/dev/null
agent-browser eval "GAME.giveCoins(600); GAME.v10.buy('gatling'); GAME.clickPlace(300, 486)" >/dev/null
agent-browser eval "GAME.state.coins = 123" >/dev/null
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3
chk "شب شروع شد" "$(ev 'GAME.state.mode')" "playing"
chk "سیوِ شروع موج گرفته شد" "$(ev 'GAME.v10.loadSaveData().wave')" "1"
chk "برجک در سیوِ شب هست" "$(ev 'GAME.v10.loadSaveData().turrets.length')" "1"
agent-browser eval "GAME.hurt(99999)" >/dev/null
sleep 0.6
chk "کات‌سین باخت شروع شد" "$(ev 'GAME.state.mode')" "defeatcine"
chk "دکمه‌ی «رد کردن» هنگام باخت مخفی" "$(ev 'document.getElementById("skipCs").classList.contains("hidden")')" "true"
chk "هیچ صدای گفتاری پخش نمی‌شود" "$(ev '!VOICE.speaking && !DLG.active')" "true"
agent-browser eval "GAME.v12.defeatGoto(3.5)" >/dev/null
agent-browser screenshot $S/05_defeat_cine.png >/dev/null
agent-browser eval "GAME.v12.finishDefeatCine()" >/dev/null
sleep 0.5
chk "حالت gameover" "$(ev 'GAME.state.mode')" "gameover"
chk "صفحه‌ی باخت نمایان" "$(ev '!document.getElementById("gameoverScreen").classList.contains("hidden")')" "true"
chk "دکمه‌ی «تلاش دوباره» هست" "$(ev 'document.getElementById("btnRetryDay").textContent.includes("تلاش دوباره") && !document.getElementById("btnRetryDay").classList.contains("hidden")')" "true"
chk "دکمه‌ی «منوی اصلی» هست" "$(ev 'document.getElementById("btnRestart1").textContent.includes("منوی اصلی")')" "true"
chk "زیرنویس ساده (تا شب N)" "$(ev 'document.getElementById("goSubtitle").textContent.includes("دوام آوردی")')" "true"
chk "آمار فقط یک خط ساده" "$(ev 'document.getElementById("goStats").textContent.includes("شلیک")')" "false"
agent-browser screenshot $S/06_gameover.png >/dev/null
# --- تلاش دوباره: وسایل باید بمانند ---
agent-browser eval "GAME.v12.retryFromSave()" >/dev/null
sleep 1.2
chk "تلاش دوباره → روز" "$(ev 'GAME.state.mode')" "day"
chk "همان شب (موج ۱)" "$(agent-browser eval 'GAME.state.wave + 1' | tr -d '"')" "1"
chk "برجک سر جایش ماند (خواسته‌ی اصلی کاربر)" "$(ev 'GAME.state.turrets.length')" "1"
chk "سکه‌ها همان بود" "$(ev 'GAME.state.coins')" "123"
# --- دکمه‌ی «منوی اصلی»: سیو نباید پاک شود ---
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3
agent-browser eval "GAME.hurt(99999)" >/dev/null
sleep 0.6
agent-browser eval "GAME.v12.finishDefeatCine()" >/dev/null
sleep 0.4
agent-browser eval "document.getElementById('btnRestart1').click()" >/dev/null
sleep 0.8
chk "«منوی اصلی» → منو" "$(ev 'GAME.state.mode')" "start"
chk "سیو پاک نشد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
chk "برجک هنوز در سیو هست" "$(ev 'GAME.v10.loadSaveData().turrets.length')" "1"
chk "دکمه‌ی ادامه در منو فعال" "$(ev 'document.getElementById("btnContinue").disabled')" "false"

echo "===== ۹) سختیِ ملایم‌تر ====="
chk "زامبی معمولی: آسیب ۵" "$(ev 'ZTYPES.normal.dmg')" "5"
chk "زامبی معمولی: جون پایه ۸" "$(ev 'ZTYPES.normal.hpBase')" "8"
chk "تانک: آسیب ۱۱" "$(ev 'ZTYPES.tank.dmg')" "11"
chk "باس: جون ۳۲۰۰" "$(ev 'ZTYPES.boss.hpBase')" "3200"
chk "فصل ۱: ضریب جون ۱٫۰" "$(ev 'CHAPTERS[0].mulHp')" "1"
chk "فصل ۴: ضریب جون ۱٫۹۲" "$(ev 'CHAPTERS[3].mulHp')" "1.92"
chk "فصل ۴: ضریب تعداد ۱٫۳۸" "$(ev 'CHAPTERS[3].mulCount')" "1.38"
chk "فاصله‌ی تولد موج ۱ بازتر شد" "$(agent-browser eval 'spawnInterval(1) > 2' | tr -d '"')" "true"
chk "سرمایه‌ی شروع ۴۰" "$(agent-browser eval 'GAME.startGame(); GAME.state.coins' | tr -d '"')" "40"

echo "===== ۱۰) رگرسیون گیم‌پلی ====="
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay(); GAME.startNight()" >/dev/null
sleep 3
chk "شب شروع شد" "$(ev 'GAME.state.mode')" "playing"
agent-browser eval "GAME.state.mouse.down = true" >/dev/null
sleep 0.8
agent-browser eval "GAME.state.mouse.down = false" >/dev/null
chk "شلیک کار می‌کند" "$(ev 'GAME.state.stats.shots > 0')" "true"
chk "سقف ذرات" "$(ev 'state.particles.length <= 300')" "true"
agent-browser screenshot $S/07_night.png >/dev/null
agent-browser eval "GAME.win()" >/dev/null
sleep 1.5
chk "پیروزی کار می‌کند" "$(ev 'GAME.state.mode === "victorycine" || GAME.state.mode === "victory"')" "true"
agent-browser eval "GAME.v11.DLG.skip(); if (typeof VC !== 'undefined' && VC) VC.t = Math.max(VC.t, 17); 'fast'" >/dev/null
VOK=""; for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1.2
  V=$(ev "!document.getElementById('victoryScreen').classList.contains('hidden')")
  if [ "$V" = "true" ]; then VOK="true"; break; fi
done
chk "صفحه برد" "$VOK" "true"
chk "سیو پس از برد پاک شد" "$(ev 'GAME.v10.loadSaveData()')" "null"
chk "بدون خطای کنسول در کل تست" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo ""
echo "=========================================="
echo "  نتیجه: $PASS گذرنده | $FAIL ناموفق"
echo "=========================================="
agent-browser close --all >/dev/null 2>&1
[ $FAIL -eq 0 ] && echo "ALL PASS ✓" || echo "SOME FAILED ✗"
