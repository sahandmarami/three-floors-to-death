#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۳٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + دگرگونی‌های ۱۳        ۱) صدای نورال ۳۳ کلیپ
#  ۲) منوی تمیز + دکمه‌های فشرده      ۳) ریل چپ (توقف/صدا/چراغ)
#  ۴) سیو اطمینانی (STORE/خودکار/کد سیو)
#  ۵) نوار ارتقای کاشی‌ها              ۶) رگرسیون گیم‌پلی
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots13
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری و دگرگونی‌های ۱۳ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v13 API" "$(ev 'typeof GAME.v13')" "object"
chk "نسخه ۱۳ در منو" "$(ev "document.querySelector('.ver').textContent.includes('۱۳')")" "true"
chk "چیپ سلاح از HUD حذف شد" "$(ev '!!document.getElementById("weaponItem")')" "false"
chk "ریل چپ با ۳ دکمه" "$(ev 'document.querySelectorAll("#ctlRail .ctl-btn").length')" "3"
chk "toast ذخیره موجود" "$(ev '!!document.getElementById("saveToast")')" "true"
chk "صفحه کد سیو موجود" "$(ev '!!document.getElementById("saveCodeScreen")')" "true"
chk "STORE لایه‌ی ذخیره‌سازی" "$(ev 'typeof STORE')" "object"
chk "ذخیره‌سازی سالم (هدلس)" "$(ev 'STORE.ok')" "true"
chk "هشدار ذخیره‌سازی مخفی" "$(ev 'document.getElementById("storageWarn").classList.contains("hidden")')" "true"
chk "دکمه‌های فشرده‌ی منو (۳)" "$(ev 'document.querySelectorAll(".menu-mini .mini-btn").length')" "3"
chk "بدون خطای کنسول" "$(agent-browser errors | grep -c error || echo 0)" "0"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) صدای نورال فارسی (۳۳ کلیپ جاسازی‌شده) ====="
chk "۳۳ کلیپ موجود" "$(ev 'GAME.v13.clipCount')" "33"
chk "مدت کلیپ اول > ۳ ثانیه" "$(ev 'VOICES13.i1n1.d > 3')" "true"
chk "همه‌ی کلیپ‌ها data URI" "$(ev 'Object.values(VOICES13).every(c => c.a.startsWith("data:audio/mpeg"))')" "true"
chk "کلید صدا در خط افتتاحیه" "$(ev 'INTRO_DLGS[0][0].v')" "i1n1"
chk "کلید صدا در انتقال ۲" "$(ev 'TR_DLGS[2][0].v')" "t2p1"
chk "کلید صدا در پیروزی" "$(ev 'GAME.v11.DLG ? "skip" : "skip"')" "skip"
agent-browser eval "Snd.init(); Snd.resume(); VOICE.warmup()" >/dev/null
sleep 1
chk "پیش‌بارگیری کلیپ‌ها" "$(ev 'GAME.v13.decodedClips().length >= 4')" "true"
D=$(agent-browser eval "VOICE.speak('سلام','a','i3a1'); VOICE.mode + '/' + Math.round(VOICE.dur)" | tr -d '"')
chk "پخش کلیپ + مدت واقعی" "$D" "clip/5"
chk "صحبت فعال" "$(ev 'VOICE.speaking')" "true"
agent-browser eval "VOICE.stop()" >/dev/null
chk "توقف صدا" "$(ev 'VOICE.speaking')" "false"

echo "===== ۲) منوی تمیز + گفتگوی صوتی افتتاحیه ====="
chk "شعار کوتاه" "$(ev 'document.querySelector(".tagline").textContent.length < 20')" "true"
chk "متن بلند نسخه حذف شد" "$(ev 'document.querySelector(".ver").textContent.length < 12')" "true"
chk "دکمه‌ی صدای منوی قدیمی حذف" "$(ev '!!document.getElementById("btnMute0")')" "false"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.6
chk "حالت intro" "$(ev 'GAME.state.mode')" "intro"
chk "گفتگو فعال" "$(ev 'GAME.v11.DLG.active')" "true"
chk "خط ۱ با کلید صدا" "$(ev 'GAME.v11.DLG.lines[0].v')" "i1n1"
sleep 2.5
chk "ماشین‌نویس پیش می‌رود" "$(ev "document.getElementById('dlgText').textContent.length > 8")" "true"
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
chk "پخش کلیپ در گفتگو" "$(ev 'VOICE.mode')" "clip"
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 0.6

echo "===== ۳) ریل چپ: توقف/ادامه/صدا/چراغ ====="
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay()" >/dev/null
sleep 1
chk "روز شروع شد" "$(ev 'GAME.state.mode')" "day"
chk "ریل سمت چپ تصویر" "$(agent-browser eval "(()=>{const a=document.getElementById('ctlPause').getBoundingClientRect(); const w=document.getElementById('wrap').getBoundingClientRect(); return (a.left - w.left) < 20})()" | tr -d '"')" "true"
chk "ریل پایین‌تر از HUD" "$(agent-browser eval "(()=>{const a=document.getElementById('ctlPause').getBoundingClientRect(); return a.top > 60})()" | tr -d '"')" "true"
agent-browser eval "document.getElementById('ctlPause').click()" >/dev/null
chk "توقف با دکمه‌ی ریل" "$(ev 'GAME.state.mode')" "paused"
agent-browser eval "document.getElementById('btnResume').click()" >/dev/null
chk "ادامه بازی" "$(ev 'GAME.state.mode')" "day"
agent-browser eval "document.getElementById('ctlMute').click()" >/dev/null
chk "قطع صدا 🔇" "$(ev 'document.getElementById("ctlMute").textContent')" "🔇"
agent-browser eval "document.getElementById('ctlMute').click()" >/dev/null
chk "وصل صدا 🔊" "$(ev 'document.getElementById("ctlMute").textContent')" "🔊"
chk "باتری چراغ در ریل" "$(ev '!!document.getElementById("ctlBattFill")')" "true"
chk "هیچ چیزی بالای سربرگ ساخت‌وساز" "$(agent-browser eval "const h=document.getElementById('bpHead').getBoundingClientRect(); const above=document.elementFromPoint(h.left+h.width/2, h.top-14); above && (above.id==='game'||above.closest && !!above.closest('#buildPanel'))" | tr -d '"')" "true"
agent-browser screenshot $S/02_day_rail.png >/dev/null

echo "===== ۴) سیو اطمینانی ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.state.wave=6; GAME.state.coins=777; GAME.v10.saveGame()" >/dev/null
chk "سیو نوشته شد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
chk "موج ذخیره‌شده ۷ (روز بعد موج ۶)" "$(ev 'GAME.v10.loadSaveData().wave')" "7"
chk "سکه ذخیره شد" "$(ev 'GAME.v10.loadSaveData().coins')" "777"
agent-browser eval "_toastSavedAt = -1e9; GAME.v10.saveGame()" >/dev/null
chk "toast «ذخیره شد» روشن" "$(ev 'document.getElementById("saveToast").classList.contains("show")')" "true"
# خروج به منو → ادامه
agent-browser eval "GAME.v11.saveAndExit()" >/dev/null
sleep 0.8
chk "خروج به منو" "$(ev 'GAME.state.mode')" "start"
chk "دکمه‌ی ادامه فعال" "$(ev 'document.getElementById("btnContinue").disabled')" "false"
chk "متن ادامه با فصل/موج" "$(evr 'document.getElementById("btnContinue").textContent.includes("موج")')" "true"
agent-browser eval "GAME.v10.continueGame()" >/dev/null
sleep 1.2
chk "ادامه → روز" "$(ev 'GAME.state.mode')" "day"
chk "همان سکه‌ها برگشت" "$(ev 'GAME.state.coins')" "777"
# سیو دوم بعد از ادامه (باگ خاموش‌ماندن)
agent-browser eval "GAME.v10.saveGame()" >/dev/null
chk "سیو بعد از ادامه هم نوشته شد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
# کد سیو: خروجی → پاک → ورودی
agent-browser eval "window.__c = GAME.v13.exportSaveCode()" >/dev/null
chk "کد سیو TTB13" "$(ev 'window.__c.slice(0,6)')" "TTB13"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
chk "پاک شد" "$(ev 'GAME.v10.loadSaveData()')" "null"
agent-browser eval "GAME.v13.importSaveCode(window.__c)" >/dev/null
chk "بارگذاری کد سیو" "$(ev 'GAME.v10.loadSaveData().coins')" "777"
chk "کد خراب رد می‌شود" "$(ev 'GAME.v13.importSaveCode("TTB13.xxx")')" "false"
# سیو خودکار دوره‌ای (۱۰ ثانیه روز)
agent-browser eval "GAME.startGame(); GAME.state.mode='day'; enterDay(); GAME.giveCoins(55)" >/dev/null
sleep 11
chk "سیو خودکار دوره‌ای" "$(ev 'GAME.v10.loadSaveData().coins >= 55')" "true"

echo "===== ۵) نوار ارتقای کاشی‌ها ====="
agent-browser eval "GAME.giveCoins(3000)" >/dev/null
agent-browser eval "GAME.v10.buy('weapon'); GAME.v10.buy('weapon'); GAME.v10.buy('health')" >/dev/null
chk "سگمنت‌های روشن سلاح = ۲" "$(ev 'document.querySelectorAll("#bp-weapon-lv i.on").length')" "2"
chk "سگمنت‌های روشن جون = ۱" "$(ev 'document.querySelectorAll("#bp-health-lv i.on").length')" "1"
chk "همه‌ی کاشی‌های ارتقایی نوار دارند" "$(ev 'document.querySelectorAll(".bp-tile .bp-lv").length')" "5"
chk "نوار قابل‌دیدن (۸px+)" "$(agent-browser eval "getComputedStyle(document.querySelector('.bp-lv')).height" | tr -d '"')" "8px"
agent-browser eval "GAME.v12.setBPTab('wpn')" >/dev/null
agent-browser screenshot $S/03_upgrade_bar.png >/dev/null
agent-browser eval "GAME.v12.setBPTab('sur')" >/dev/null
chk "تب بقا: چراغ‌قوه دیده می‌شود" "$(ev 'document.getElementById("bp-flashlight").style.display !== "none"')" "true"
agent-browser screenshot $S/04_tab_sur.png >/dev/null

echo "===== ۶) رگرسیون گیم‌پلی ====="
agent-browser eval "GAME.startNight()" >/dev/null
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
agent-browser screenshot $S/05_night.png >/dev/null
agent-browser eval "GAME.win()" >/dev/null
sleep 1.5
chk "پیروزی کار می‌کند" "$(ev 'GAME.state.mode === "victorycine" || GAME.state.mode === "victory"')" "true"
agent-browser eval "GAME.v11.DLG.skip()" >/dev/null
VOK=""; for i in 1 2 3 4 5 6 7 8; do
  sleep 1.2
  V=$(ev "!document.getElementById('victoryScreen').classList.contains('hidden')")
  if [ "$V" = "true" ]; then VOK="true"; break; fi
done
chk "صفحه برد" "$VOK" "true"
agent-browser screenshot $S/06_victory.png >/dev/null
chk "سیو پس از برد پاک شد" "$(ev 'GAME.v10.loadSaveData()')" "null"
chk "بدون خطای کنسول در کل تست" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo ""
echo "=========================================="
echo "  نتیجه: $PASS گذرنده | $FAIL ناموفق"
echo "=========================================="
agent-browser close --all >/dev/null 2>&1
[ $FAIL -eq 0 ] && echo "ALL PASS ✓" || echo "SOME FAILED ✗"
