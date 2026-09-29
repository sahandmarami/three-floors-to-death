#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۴٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + دگرگونی‌های ۱۴        ۱) صدای نورال ۳۶ کلیپ + همگامی متن/صدا
#  ۲) منوی تمیز (بدون شعار/متن اضافی)   ۳) رفع هم‌پوشانی: اعلان/دکمه‌ی شب + صفحه‌ی سیو
#  ۴) دستفروش استوری‌مود (آمدن/گفتگو/فروش/رفتن)
#  ۵) تب بقا با آیکون واقعی             ۶) موبایل: fitWrap + portrait
#  ۷) سیو اطمینانی (STORE/خودکار/کد سیو)
#  ۸) رگرسیون گیم‌پلی (شلیک/برجک/برد)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots14
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری و دگرگونی‌های ۱۴ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v14 API" "$(ev 'typeof GAME.v14')" "object"
chk "GAME.v13 API" "$(ev 'typeof GAME.v13')" "object"
chk "نسخه ۱۴ در منو" "$(ev "document.querySelector('.ver').textContent.includes('۱۴')")" "true"
chk "شعار منو حذف شد" "$(ev '!!document.querySelector(".tagline")')" "false"
chk "toast ذخیره موجود" "$(ev '!!document.getElementById("saveToast")')" "true"
chk "STORE لایه‌ی ذخیره‌سازی" "$(ev 'typeof STORE')" "object"
chk "fitWrap تابع موجود" "$(ev 'typeof fitWrap')" "function"
chk "بدون خطای کنسول (بارگذاری)" "$(agent-browser errors | grep -c error || echo 0)" "0"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) صدای نورال ۳۶ کلیپ + همگامی متن/صدا ====="
chk "۳۶ کلیپ موجود" "$(ev 'GAME.v13.clipCount')" "36"
chk "همه‌ی کلیپ‌ها data URI سالم" "$(ev 'Object.values(VOICES14).every(c => c.a.startsWith("data:audio/mpeg;base64,") && !c.a.includes("base64,data:"))')" "true"
chk "کلیپ‌های داستان دستفروش موجود" "$(ev '!!VOICES14.pd1a && !!VOICES14.pd1b && !!VOICES14.pd1c && !!VOICES14.pd1l')" "true"
chk "متن افتتاحیه بازنویسی ادبی" "$(ev 'INTRO_DLGS[0][0].text.includes("آغاز شد")')" "true"
chk "دستور درست: «می‌مانیم»" "$(ev 'INTRO_DLGS[1][1].text.includes("سرپا می‌مانیم")')" "true"
agent-browser eval "Snd.init(); Snd.resume(); VOICE.warmup()" >/dev/null
sleep 6
chk "پیش‌بارگیری همه‌ی کلیپ‌ها (۳۶)" "$(ev 'GAME.v13.decodedClips().length')" "36"
# همگامی: کلیپ غیردیکد → clipwait → متن صفر تا شروع صدا
# مسیر ۱: کلیپ در صف دیکد گیر کرده → ماشین‌نویس صبر می‌کند + مهلت ایمنی
agent-browser eval "VOICE.stop(); VOICE._bufs.pd1b = null; DLG.start([{who:'p', v:'pd1b', text:'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟'}], null); 'q'" >/dev/null
S1=$(agent-browser eval "VOICE.mode + '|' + document.getElementById('dlgText').textContent.length" | tr -d '"')
chk "clipwait: متن تا دیکد صفر می‌ماند" "$S1" "clipwait|0"
sleep 3.4
S2=$(agent-browser eval "VOICE.mode + '|' + document.getElementById('dlgText').textContent.length > 0" | tr -d '"')
chk "مهلت ایمنی: بعد از ۲٫۸s صدای جایگزین" "$(echo "$S2" | grep -qv clipwait && echo yes)" "yes"
agent-browser eval "DLG.skip(); VOICE.stop()" >/dev/null
# مسیر ۲: دیکد واقعی → صدا و متن «با هم» شروع می‌شوند
agent-browser eval "VOICE.stop(); delete VOICE._bufs.pd1b; DLG.start([{who:'p', v:'pd1b', text:'کالای کمیاب؟ از کجا معلوم تقلبی نباشد؟'}], null); 'q2'" >/dev/null
sleep 1.2
S3=$(agent-browser eval "VOICE.mode + '|' + VOICE.speaking + '|' + document.getElementById('dlgText').textContent.length" | tr -d '"')
chk "دیکد واقعی: صدا شروع + متن هم‌زمان" "$S3" "clip|true|"
agent-browser eval "DLG.skip(); VOICE.stop()" >/dev/null
chk "صحنه‌ی گفتگو بسته شد" "$(ev 'DLG.active')" "false"

echo "===== ۲) منوی تمیز + گفتگوی صوتی افتتاحیه ====="
chk "فقط ۲ زامبیِ تزئینی منو" "$(ev 'menuZ.length')" "2"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.8
chk "حالت intro" "$(ev 'GAME.state.mode')" "intro"
chk "گفتگو فعال" "$(ev 'GAME.v11.DLG.active')" "true"
chk "خط ۱ با کلید صدا" "$(ev 'GAME.v11.DLG.lines[0].v')" "i1n1"
sleep 2
chk "ماشین‌نویس پیش می‌رود" "$(ev "document.getElementById('dlgText').textContent.length > 6")" "true"
chk "پخش کلیپ در گفتگو" "$(ev 'VOICE.mode')" "clip"
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 0.6

echo "===== ۳) رفع هم‌پوشانی متن‌ها (روز + صفحه‌ی سیو) ====="
agent-browser set viewport 632 360 >/dev/null
agent-browser wait 400
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay()" >/dev/null
sleep 0.8
chk "روز شروع شد" "$(ev 'GAME.state.mode')" "day"
OVER=$(agent-browser eval "
(() => {
  setAnnounce('☀️ صبح شد!', 'موج ۸ پاک شد — ارتقا بخر و شب را شروع کن', 3);
  const an = document.getElementById('announce').getBoundingClientRect();
  const dp = document.getElementById('dayPanel').getBoundingClientRect();
  return !(an.bottom < dp.top || dp.bottom < an.top);
})()" | tr -d '"')
chk "اعلان «صبح شد» روی دکمه‌ی «شب شود» نمی‌افتد" "$OVER" "false"
chk "دکمه‌ی شب در پایین صفحه است" "$(agent-browser eval "document.getElementById('dayPanel').getBoundingClientRect().top > 150" | tr -d '"')" "true"
agent-browser screenshot $S/02_day_bottom.png >/dev/null
# صفحه‌ی کد سیو در نمای باریک
agent-browser eval "showScreen('saveCodeScreen'); document.getElementById('scText').value = GAME.v13.exportSaveCode() || 'TTB13.x'" >/dev/null
sleep 0.4
SC=$(agent-browser eval "
(() => {
  const r = id => document.getElementById(id).getBoundingClientRect();
  const h = r('scHint'), x = r('scText'), b = r('scCopy');
  const ov = (a, c) => !(a.bottom <= c.top || c.bottom <= a.top);
  return ov(h, x) || ov(x, b);
})()" | tr -d '"')
chk "صفحه‌ی کد سیو بدون هم‌پوشانی" "$SC" "false"
agent-browser eval "hideScreen('saveCodeScreen')" >/dev/null
agent-browser screenshot $S/03_savecode_632.png >/dev/null

echo "===== ۴) دستفروش مرموز استوری‌مود ====="
agent-browser set viewport 1100 640 >/dev/null
agent-browser wait 300
agent-browser eval "GAME.v14.peddlerForce()" >/dev/null
sleep 4.2
chk "فاز گفتگو (رسید پایین برج)" "$(ev 'PED.phase')" "talk"
DO=$(agent-browser eval "String(DLG.active) + '|' + String(GAME.v14.dlgOn)" | tr -d '"')
chk "گفتگو فعال + کلاس dlg-on" "$DO" "true|true"
chk "خط ۱ دستفروش" "$(ev 'DLG.lines[0].v')" "pd1a"
chk "صدای کلیپ دستفروش" "$(ev 'VOICE.mode')" "clip"
chk "پنل فروش در حالت گفتگو مخفی" "$(ev 'document.getElementById("peddlerPanel").classList.contains("hidden")')" "true"
sleep 2
chk "ماشین‌نویس داستان پیش می‌رود" "$(ev "document.getElementById('dlgText').textContent.length > 6")" "true"
agent-browser screenshot $S/04_peddler_dlg.png >/dev/null
agent-browser eval "DLG.skip()" >/dev/null
sleep 0.3
SH=$(agent-browser eval "String(PED.phase) + '|' + String(!document.getElementById('peddlerPanel').classList.contains('hidden'))" | tr -d '"')
chk "پس از گفتگو: قفسه‌ی کالا باز شد" "$SH" "stay|true"
agent-browser screenshot $S/05_peddler_shop.png >/dev/null
# شب شود → بدرقه
agent-browser eval "GAME.startNight()" >/dev/null
chk "شب: دستفروش در حال رفتن" "$(ev 'PED.phase')" "leave"
chk "شب: پنل فروش بسته شد" "$(ev 'document.getElementById("peddlerPanel").classList.contains("hidden")')" "true"
sleep 3.4
chk "دستفروش کاملاً رفت" "$(ev 'PED.active')" "false"

echo "===== ۵) تب بقا با آیکون واقعی ====="
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
agent-browser screenshot $S/06_surtab_icons.png >/dev/null

echo "===== ۶) موبایل: fitWrap + عمودی ====="
agent-browser set viewport 632 360 >/dev/null
agent-browser wait 400
FW=$(agent-browser eval "
(() => {
  const w = document.getElementById('wrap').getBoundingClientRect();
  return (w.left >= 0 && w.right <= 632 && w.top >= 0 && w.bottom <= 360);
})()" | tr -d '"')
chk "کل بازی در صفحه جا می‌شود (۶۳۲×۳۶۰)" "$FW" "true"
agent-browser set viewport 480 320 >/dev/null
agent-browser wait 400
FW2=$(agent-browser eval "
(() => {
  const w = document.getElementById('wrap').getBoundingClientRect();
  return (w.left >= 0 && w.right <= 480 && w.top >= 0 && w.bottom <= 320);
})()" | tr -d '"')
chk "کل بازی در صفحه جا می‌شود (۴۸۰×۳۲۰)" "$FW2" "true"
agent-browser screenshot $S/07_fit_480.png >/dev/null
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

echo "===== ۷) سیو اطمینانی (رگرسیون ۱۳) ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; GAME.state.wave=6; GAME.state.coins=777; GAME.v10.saveGame()" >/dev/null
chk "سیو نوشته شد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
chk "موج ذخیره‌شده ۷" "$(ev 'GAME.v10.loadSaveData().wave')" "7"
chk "سکه ذخیره شد" "$(ev 'GAME.v10.loadSaveData().coins')" "777"
agent-browser eval "GAME.v11.saveAndExit()" >/dev/null
sleep 0.8
chk "خروج به منو" "$(ev 'GAME.state.mode')" "start"
chk "دکمه‌ی ادامه فعال" "$(ev 'document.getElementById("btnContinue").disabled')" "false"
agent-browser eval "GAME.v10.continueGame()" >/dev/null
sleep 1.2
chk "ادامه → روز" "$(ev 'GAME.state.mode')" "day"
chk "همان سکه‌ها برگشت" "$(ev 'GAME.state.coins')" "777"
agent-browser eval "GAME.v10.saveGame()" >/dev/null
chk "سیو بعد از ادامه هم نوشته شد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
agent-browser eval "window.__c = GAME.v13.exportSaveCode()" >/dev/null
chk "کد سیو TTB13" "$(ev 'window.__c.slice(0,6)')" "TTB13"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v13.importSaveCode(window.__c)" >/dev/null
chk "بارگذاری کد سیو" "$(ev 'GAME.v10.loadSaveData().coins')" "777"
chk "کد خراب رد می‌شود" "$(ev 'GAME.v13.importSaveCode("TTB13.xxx")')" "false"

echo "===== ۸) رگرسیون گیم‌پلی ====="
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay(); GAME.startNight()" >/dev/null
sleep 3
chk "شب شروع شد" "$(ev 'GAME.state.mode')" "playing"
agent-browser eval "GAME.state.mouse.down = true" >/dev/null
sleep 0.8
agent-browser eval "GAME.state.mouse.down = false" >/dev/null
chk "شلیک کار می‌کند" "$(ev 'GAME.state.stats.shots > 0')" "true"
agent-browser eval "GAME.giveCoins(500); GAME.v10.buy('gatling')" >/dev/null
agent-browser eval "GAME.clickPlace(300, 486)" >/dev/null
chk "برجک نصب شد" "$(ev 'GAME.state.turrets.length')" "1"
chk "سقف ذرات" "$(ev 'state.particles.length <= 300')" "true"
agent-browser screenshot $S/08_night.png >/dev/null
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
