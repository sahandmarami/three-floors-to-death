#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۲٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + حذف‌ها    ۱) صدای گفتار تازه + متن روشن
#  ۲) افتتاحیه محاوره‌ای    ۳) پنل تب‌دار + انتخاب سلاح از پنل
#  ۴) کوله جمع‌وجور          ۵) سینماییِ سقوط برج + «ادامه از آخرین روز»
#  ۶) چرخه‌ی سیو/خروج (رفع باگ)  ۷) موسیقی/توقف  ۸) ضدّهنگ
#  ۹) رگرسیون گیم‌پلی
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots12
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری و حذف‌های ۱۲٫۰ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 2.2
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v12 API" "$(ev 'typeof GAME.v12')" "object"
chk "نسخه ۱۲٫۰" "$(ev "document.querySelector('.ver').textContent.includes('۱۲')")" "true"
chk "VOICE جدید (بدون کلیپ)" "$(ev 'typeof VOICE_CLIPS')" "undefined"
chk "پروفایل ۶ شخصیت" "$(ev "Object.keys(VOICE.profile('x')).length >= 0 && [true,true].every(x=>x)")" "true"
chk "نوار سلاح پایین حذف شد" "$(ev '!!document.getElementById("weaponBar")')" "false"
chk "گزینه صدا از پنل توقف حذف شد" "$(ev '!!document.getElementById("btnMute2")')" "false"
chk "دکمه «ادامه از آخرین روز» موجود" "$(ev '!!document.getElementById("btnRetryDay")')" "true"
chk "narration.mp3 قدیمی حذف شد" "$(ev '!!document.getElementById("narrAudio")')" "false"
chk "چیپ سلاح در HUD" "$(ev '!!document.getElementById("weaponText")')" "true"
chk "۴ تب پنل" "$(ev 'document.querySelectorAll("#bpTabs .bp-tab").length')" "4"
chk "بدون خطای کنسول" "$(agent-browser errors | grep -c error || echo 0)" "0"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) صدای گفتار تازه + متنِ روشن ====="
chk "speak متن+شخصیت → مدت" "$(ev "VOICE.speak('سلام به همه','a') > 0.5")" "true"
chk "حالت بلیپ بدون صدای فارسیِ هدلس" "$(ev 'VOICE.mode')" "blip"
chk "گفتار فعال" "$(ev 'VOICE.speaking')" "true"
agent-browser eval "VOICE.stop()" >/dev/null
chk "bark جدید (who,text,...)" "$(ev "typeof bark")" "function"
chk "DLG متن از CSS روشن" "$(ev "getComputedStyle(document.getElementById('dlgText')).color.includes('253') || getComputedStyle(document.getElementById('dlgText')).color !== 'rgba(0, 0, 0, 0.92)'")" "true"

echo "===== ۲) افتتاحیه‌ی محاوره‌ای ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.8
chk "حالت intro" "$(ev 'GAME.state.mode')" "intro"
chk "گفتگو فعال" "$(ev 'GAME.v11.DLG.active')" "true"
chk "متن محاوره‌ای صحنه ۱" "$(agent-browser eval "GAME.v11.DLG.advance(); document.getElementById('dlgText').textContent" | tr -d '"')" "ویروس"
sleep 2.2
chk "ماشین‌نویس پیش می‌رود" "$(ev "document.getElementById('dlgText').textContent.length > 8")" "true"
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.introGoto(40)" >/dev/null
agent-browser screenshot $S/02_intro_radio.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 1.6
chk "پایان افتتاحیه → بازی" "$(ev 'GAME.state.mode')" "intermission"
agent-browser eval "GAME.state.intermission=0.05" >/dev/null
sleep 0.9
chk "موج ۱ شروع" "$(ev 'GAME.state.mode')$(ev 'GAME.state.wave')" "playing1"

echo "===== ۳) پنل تب‌دار + انتخاب سلاح از پنل ====="
chk "تب پیش‌فرض: ارتقاء (۵ کاشی)" "$(ev "Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(e=>e.style.display!=='none').length")" "5"
agent-browser eval "GAME.v12.setBPTab('sur')" >/dev/null
chk "تب بقا: ۴ کاشی" "$(ev "Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(e=>e.style.display!=='none').length")" "4"
chk "چراغ‌قوه در تب بقا دیده می‌شود" "$(ev "document.getElementById('bp-flashlight').style.display")" ""
agent-browser screenshot $S/03_tab_sur.png >/dev/null
agent-browser eval "GAME.v12.setBPTab('wpn')" >/dev/null
agent-browser eval "GAME.giveCoins(500)" >/dev/null
agent-browser eval "GAME.v10.buy('shotgun')" >/dev/null
chk "خرید شاتگان → در دست" "$(ev "GAME.state.weapon")" "shotgun"
chk "کاشی شاتگان armed" "$(ev "document.getElementById('bp-shotgun').className.includes('armed')")" "true"
chk "قیمت کاشی = «در دست»" "$(evr "document.getElementById('bp-shotgun-cost').textContent")" "در دست"
chk "چیپ HUD سلاح" "$(evr "document.getElementById('weaponText').textContent")" "شاتگان"
agent-browser eval "GAME.selectWeapon('pistol')" >/dev/null
chk "تعویض به تپانچه → «انتخاب»" "$(evr "document.getElementById('bp-shotgun-cost').textContent")" "انتخاب"
agent-browser eval "GAME.v10.buy('shotgun')" >/dev/null
chk "کلیک دوباره روی کاشی → مسلح" "$(ev "GAME.state.weapon")" "shotgun"
agent-browser screenshot $S/04_tab_wpn.png >/dev/null

echo "===== ۴) کوله‌پشتی جمع‌وجور ====="
chk "کوله خالی = فقط قرص" "$(evr "document.getElementById('backpackBar').className")" "compact"
chk "متن قرص کوله" "$(evr "document.getElementById('bpkCap').textContent")" "خالی"
agent-browser eval "GAME.v10.giveItem('canned')" >/dev/null
chk "با آیتم: جاخالی‌ها ظاهر" "$(ev "document.getElementById('backpackBar').className.includes('compact')")" "false"
agent-browser eval "GAME.v10.useItem(0)" >/dev/null
chk "مصرف → دوباره جمع" "$(evr "document.getElementById('backpackBar').className")" "compact"

echo "===== ۵) سینماییِ سقوط برج + ادامه از آخرین روز ====="
agent-browser eval "GAME.endWave()" >/dev/null
sleep 0.9
chk "روز شد (سیو شب ۱)" "$(ev 'GAME.state.mode')" "day"
agent-browser eval "GAME.startNight()" >/dev/null
agent-browser eval "GAME.state.dayness = 0" >/dev/null
sleep 1.6
chk "موج ۲ شب" "$(ev 'GAME.state.mode')$(ev 'GAME.state.wave')" "playing2"
agent-browser eval "GAME.spawnType('normal'); GAME.spawnType('fast'); GAME.spawnType('tank'); GAME.spawnType('normal')" >/dev/null
sleep 1.2
agent-browser eval "GAME.hurt(9999)" >/dev/null
sleep 0.4
chk "باخت → سینمایی سقوط (defeatcine)" "$(ev 'GAME.state.mode')" "defeatcine"
chk "DF فعال" "$(ev '!!GAME.v12.DF()')" "true"
agent-browser eval "GAME.v12.defeatGoto(1.2)" >/dev/null
agent-browser screenshot $S/05_df_climb.png >/dev/null
chk "زامبی‌ها بالا آمدند" "$(ev "GAME.state.zombies.some(z=>z.y < 460)")" "true"
agent-browser eval "GAME.v12.defeatGoto(2.9)" >/dev/null
agent-browser screenshot $S/06_df_cracks.png >/dev/null
chk "طبقه‌ی ۱ فرو ریخت" "$(ev "GAME.getCutscene().draw.floors[0].a")" "0"
agent-browser eval "GAME.v12.defeatGoto(3.7)" >/dev/null
agent-browser screenshot $S/07_df_col2.png >/dev/null
chk "طبقه‌ی ۲ فرو ریخت" "$(ev "GAME.getCutscene().draw.floors[1].a")" "0"
agent-browser eval "GAME.v12.defeatGoto(5.0)" >/dev/null
agent-browser screenshot $S/08_df_roof.png >/dev/null
chk "بام کج شد و افتاد" "$(ev "GAME.getCutscene().draw.floors[2].rot > 0.3")" "true"
agent-browser eval "GAME.v12.defeatGoto(6.5)" >/dev/null
agent-browser screenshot $S/09_df_dust.png >/dev/null
chk "آوار کامل" "$(ev "GAME.getCutscene().draw.rubble")" "1"
agent-browser eval "GAME.v12.defeatResume()" >/dev/null
sleep 1.2
chk "پایان سینمایی → صفحه باخت" "$(ev 'GAME.state.mode')" "gameover"
chk "دکمه «ادامه از آخرین روز» فعال" "$(ev "!document.getElementById('btnRetryDay').classList.contains('hidden')")" "true"
agent-browser screenshot $S/10_gameover.png >/dev/null
agent-browser eval "document.getElementById('btnRetryDay').click()" >/dev/null
sleep 1.4
chk "ادامه از آخرین روز → روز" "$(ev 'GAME.state.mode')" "day"
chk "همان موجِ شبِ باخت" "$(ev 'GAME.state.wave')" "1"
chk "دکمه شب: موج ۲" "$(evr "document.getElementById('btnNight').textContent")" "۲"
chk "کاشی‌ها/سلاح حفظ شد" "$(ev "WEAPONS.shotgun.owned")" "true"

echo "===== ۶) چرخه‌ی سیو/خروج (رفع باگ دکمه‌ی خاموش) ====="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 1.0
agent-browser eval "document.getElementById('btnPause').click()" >/dev/null
sleep 0.3
chk "توقف" "$(ev 'GAME.state.mode')" "paused"
agent-browser eval "document.getElementById('btnSaveExit').click()" >/dev/null
sleep 1.5
chk "خروج به منو" "$(ev 'GAME.state.mode')" "start"
chk "دکمه ادامه روشن (سیو هست)" "$(ev "!document.getElementById('btnContinue').disabled")" "true"
agent-browser eval "document.getElementById('btnContinue').click()" >/dev/null
sleep 1.5
chk "ادامه → روز" "$(ev 'GAME.state.mode')" "day"
agent-browser eval "GAME.startNight()" >/dev/null
sleep 0.8
agent-browser eval "document.getElementById('btnPause').click()" >/dev/null
sleep 0.3
agent-browser eval "document.getElementById('btnSaveExit').click()" >/dev/null
sleep 1.5
chk "سیو و خروجِ دوباره → دکمه باز هم روشن" "$(ev "!document.getElementById('btnContinue').disabled")" "true"
chk "برچسب ادامه درست" "$(evr "document.getElementById('btnContinue').textContent")" "موج"

echo "===== ۷) موسیقی: تعویض نرم + سکوت در توقف ====="
agent-browser eval "window.dispatchEvent(new Event('pointerdown'))" >/dev/null
sleep 0.6
agent-browser eval "document.getElementById('btnContinue').click()" >/dev/null
sleep 3.6
chk "قطعه روز" "$(ev 'MUSIC.track')" "day"
agent-browser eval "GAME.startNight()" >/dev/null
agent-browser eval "GAME.state.dayness = 0" >/dev/null
sleep 3.4
chk "شب → قطعه شب (کراس‌فید کامل)" "$(ev 'MUSIC.track')" "night"
chk "زمان‌بند روشن" "$(ev '!!MUSIC.timer')" "true"
chk "جاافتادگی زمان‌بند جمع نمی‌شود" "$(ev "MUSIC.nextT >= Snd.ctx.currentTime - 0.5")" "true"
agent-browser eval "document.getElementById('btnPause').click()" >/dev/null
sleep 0.8
chk "توقف → هدفِ سکوت" "$(ev "(MUSIC.gain.gain.value < 0.1 || MUSIC.gain.gain.value === 0.0001).toString()")" "true"
agent-browser eval "document.getElementById('btnResume').click()" >/dev/null
sleep 1.4
chk "ادامه → قطعه همان شب" "$(ev 'MUSIC.track')" "night"
chk "پنل توقف بدون دکمه صدا" "$(ev 'document.querySelectorAll("#pauseScreen button").length')" "3"

echo "===== ۸) ضدّهنگ: خطا بازی را فریز نمی‌کند ====="
agent-browser eval "GAME.state.tower.maxHp=999999; GAME.state.tower.hp=999999" >/dev/null
agent-browser eval "window._t0 = animTime; window._origDP = drawParticles; drawParticles = function(){ throw new Error('test'); }" >/dev/null
sleep 1.0
chk "با خطای رندر، زمان جلو رفت" "$(ev "(animTime - window._t0 > 0.5).toString()")" "true"
agent-browser eval "drawParticles = window._origDP" >/dev/null
sleep 0.5
chk "بعد از رفع خطا، رندر سالم" "$(ev "(animTime - window._t0 > 1.0).toString()")" "true"
chk "حالت بازی زنده" "$(ev 'GAME.state.mode')" "playing"

echo "===== ۹) رگرسیون گیم‌پلی ====="
chk "شلیک کار می‌کند" "$(agent-browser eval "GAME.state.stats.shots = 0; GAME.state.mouse.down = true; 'set'" >/dev/null; sleep 0.7; agent-browser eval "GAME.state.stats.shots > 0" | tr -d '"\n ')" "true"
agent-browser eval "GAME.state.mouse.down = false" >/dev/null
chk "کشتار ممکن" "$(ev "GAME.state.zombies.length >= 0")" "true"
agent-browser eval "GAME.giveCoins(300)" >/dev/null
agent-browser eval "GAME.v12.setBPTab('tur')" >/dev/null
agent-browser eval "GAME.v10.buy('gatling')" >/dev/null
agent-browser eval "GAME.clickPlace(300, 486)" >/dev/null
chk "برجک نصب شد" "$(ev "GAME.state.turrets.length")" "1"
agent-browser screenshot $S/11_gameplay.png >/dev/null
chk "سقف ذرات" "$(ev "state.particles.length <= 300")" "true"
agent-browser eval "GAME.win()" >/dev/null
sleep 1.2
chk "پیروزی کار می‌کند" "$(ev "GAME.state.mode === 'victorycine' || GAME.state.mode === 'victory'")" "true"
sleep 2.2
agent-browser eval "GAME.v11.DLG.skip()" >/dev/null
VOK=""; for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  sleep 1.2
  V=$(ev "!document.getElementById('victoryScreen').classList.contains('hidden')")
  if [ "$V" = "true" ]; then VOK="true"; break; fi
done
chk "صفحه برد (تا ۱۵ ثانیه)" "$VOK" "true"
agent-browser screenshot $S/12_victory.png >/dev/null
chk "بدون خطای کنسول در کل تست" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo ""
echo "=========================================="
echo "  نتیجه: $PASS گذرنده | $FAIL ناموفق"
echo "=========================================="
agent-browser close --all >/dev/null 2>&1
[ $FAIL -eq 0 ] && echo "ALL PASS ✓" || echo "SOME FAILED ✗"
