#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۷٫۰ — سه طبقه تا بقا
# ۱) کات‌سین داستانی بعد از موج ۵: همه‌ی مراحل + انتقال صحیح state
# ۲) برج دوم + شهر سوخته + ادامه‌ی موج ۶ تا ۱۰
# ۳) رد کردن کات‌سین + ریست کامل بعد از برد
# ۴) مکعب‌های پنل ساخت‌وساز (رگرسیون + اسکرین‌شات برای VLM)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots7
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1"; }
chk()  { # $1=desc $2=actual $3=expected-substring
  if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 -> got: $2"; fi
}

echo "== 1) بارگذاری صفحه =="
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 1.8
agent-browser errors | grep -q . && bad "خطای صفحه" || ok "بدون خطای کنسول"
chk "GAME api" "$(agent-browser eval "typeof GAME" | tr -d '\n')" "object"
chk "playCutscene در API" "$(agent-browser eval "typeof GAME.playCutscene" | tr -d '\n')" "function"
chk "نسخه ۷٫۰" "$(agent-browser eval "document.querySelector('.ver').textContent.includes('۷٫۰')" | tr -d '\n')" "true"
chk "دکمه‌ی رد کردن مخفی در منو" "$(agent-browser eval "document.getElementById('skipCs').classList.contains('hidden')" | tr -d '\n')" "true"

echo "== 2) شروع بازی → پایان موج ۵ → شروع کات‌سین =="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
chk "intermission شروع" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "intermission"
chk "برج اول" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '\n')" "0"
# شبیه‌سازی پایان موج ۵ (کات‌سین باید شروع شود)
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
chk "حالت cutscene" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "cutscene"
chk "دکمه‌ی رد کردن باز" "$(agent-browser eval "!document.getElementById('skipCs').classList.contains('hidden')" | tr -d '\n')" "true"
chk "حالت سینمایی (cs-mode)" "$(agent-browser eval "document.getElementById('wrap').classList.contains('cs-mode')" | tr -d '\n')" "true"
chk "نوار سلاح مخفی" "$(agent-browser eval "getComputedStyle(document.getElementById('weaponBar')).display" | tr -d '\n')" "none"
chk "پنل ساخت‌وساز مخفی" "$(agent-browser eval "getComputedStyle(document.getElementById('buildPanel')).display" | tr -d '\n')" "none"
B_COINS=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
B_HP=$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')
B_UPG=$(agent-browser eval "JSON.stringify(GAME.state.upgrades)" | tr -d '\n')
echo "   سکه: $B_COINS | جون: $B_HP | ارتقاها: $B_UPG"

echo "== 3) فریم‌های کات‌سین (پرش زمانی دقیق) =="
# مرحله ۱: لرزش و ترک
agent-browser eval "GAME.csGoto(0.9)" >/dev/null; sleep 0.3
agent-browser screenshot $S/01_shake.png >/dev/null
chk "ترک‌ها فعال" "$(agent-browser eval "GAME.getCutscene().draw.cracks > 0.4" | tr -d '\n')" "true"
chk "همه طبقه‌ها هنوز سر جایشان" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a + ',' + GAME.getCutscene().draw.floors[1].a" | tr -d '\n')" "1,1"
chk "زامبی‌های ول‌گرد در صحنه" "$(agent-browser eval "GAME.getCutscene().zombies.length" | tr -d '"\n ')" "7"
# مرحله ۲: فروریختن طبقه‌ها
agent-browser eval "GAME.csGoto(2.5)" >/dev/null; sleep 0.3
agent-browser screenshot $S/02_collapse.png >/dev/null
chk "طبقه‌ی اول در حال محو" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a < 0.4" | tr -d '\n')" "true"
chk "طبقه‌ی دوم در حال محو" "$(agent-browser eval "GAME.getCutscene().draw.floors[1].a < 0.5" | tr -d '\n')" "true"
chk "آوار رشد کرده" "$(agent-browser eval "GAME.getCutscene().draw.rubble > 0.25" | tr -d '\n')" "true"
# مرحله ۳: سقوط بام + ورود ماشین
agent-browser eval "GAME.csGoto(3.9)" >/dev/null; sleep 0.3
agent-browser screenshot $S/03_car_enter.png >/dev/null
chk "ماشین وارد شده" "$(agent-browser eval "GAME.getCutscene().car && GAME.getCutscene().car.x > 0" | tr -d '\n')" "true"
chk "بازیکن در حال سقوط" "$(agent-browser eval "GAME.getCutscene().draw.player.y > 330" | tr -d '\n')" "true"
chk "تخته‌بام در حال سقوط" "$(agent-browser eval "GAME.getCutscene().draw.floors[2].dy > 60" | tr -d '\n')" "true"
# مرحله ۴: سوار شدن + زامبی‌های پرتابی
agent-browser eval "GAME.csGoto(4.9)" >/dev/null; sleep 0.3
agent-browser screenshot $S/04_catch.png >/dev/null
chk "بازیکن روی ماشین نشست" "$(agent-browser eval "GAME.getCutscene().caught && Math.abs(GAME.getCutscene().draw.player.y - (492+14-54)) < 12" | tr -d '\n')" "true"
chk "چند زامبی زیر ماشین رفت" "$(agent-browser eval "GAME.getCutscene().zombies.filter(z=>z.hit).length >= 2" | tr -d '\n')" "true"
# مرحله ۵: هدیه‌ی راننده
agent-browser eval "GAME.csGoto(5.6)" >/dev/null; sleep 0.3
agent-browser screenshot $S/05_gift.png >/dev/null
chk "هدیه اعمال شد" "$(agent-browser eval "GAME.getCutscene().giftApplied" | tr -d '\n')" "true"
chk "شاتگان آنلاک شد" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "true"
chk "سکه‌ها += ۸۰" "$(agent-browser eval "GAME.state.coins - $B_COINS" | tr -d '"\n ')" "80"
# مرحله ۶: سیاهی + متن
agent-browser eval "GAME.csGoto(7.8)" >/dev/null; sleep 0.3
agent-browser screenshot $S/06_black.png >/dev/null
chk "سیاهی کامل" "$(agent-browser eval "GAME.getCutscene().fade > 0.95" | tr -d '\n')" "true"
chk "صحنه هنوز عوض نشده (تا ۸٫۱)" "$(agent-browser eval "GAME.getCutscene().switched" | tr -d '\n')" "false"
# مرحله ۷: تعویض صحنه + بازگشت
agent-browser eval "GAME.csGoto(9.1)" >/dev/null; sleep 0.3
agent-browser screenshot $S/07_fadein.png >/dev/null
chk "برج دوم فعال (variant=1)" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '"\n ')" "1"
chk "cutsceneDone" "$(agent-browser eval "GAME.state.cutsceneDone" | tr -d '\n')" "true"

echo "== 4) پایان کات‌سین → روزِ برج دوم =="
agent-browser eval "GAME.csResume()" >/dev/null
sleep 1.3
chk "حالت day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "موج هنوز ۵ (بعدی = ۶)" "$(agent-browser eval "GAME.state.wave" | tr -d '\n')" "5"
chk "جون برج حفظ شد" "$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')" "$B_HP"
chk "ارتقاها حفظ شدند (سطح اسلحه)" "$(agent-browser eval "GAME.state.upgrades.weapon" | tr -d '"\n ')" "0"
chk "شاتگان هنوز آنلاک" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "true"
chk "هدیه فقط یک‌بار (سکه = قبل+۸۰)" "$(agent-browser eval "GAME.state.coins - $B_COINS" | tr -d '"\n ')" "80"
chk "دکمه‌ی شب: موج ۶" "$(agent-browser eval "document.getElementById('btnNight').textContent.includes('۶')" | tr -d '\n')" "true"
chk "cs-mode برداشته شد" "$(agent-browser eval "!document.getElementById('wrap').classList.contains('cs-mode')" | tr -d '\n')" "true"
chk "نوار سلاح برگشت" "$(agent-browser eval "getComputedStyle(document.getElementById('weaponBar')).display" | tr -d '\n')" "flex"
chk "پنل ساخت‌وساز برگشت + باز" "$(agent-browser eval "!document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"
agent-browser screenshot $S/08_day_second_tower.png >/dev/null

echo "== 5) موج ۶ روی برج دوم (همان منطق سختی) =="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3.5
chk "موج ۶ playing" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "6 playing"
chk "ترکیب موج ۶ = ۲۸ زامبی (۱۶n/۹f/۳t)" "$(agent-browser eval "GAME.state.spawn.queue.length + GAME.state.zombies.filter(z=>!z.dead).length" | tr -d '"\n ')" "28"
agent-browser screenshot $S/09_wave6_newtower.png >/dev/null
# شلیک واقعی از طریق رویداد ماوس روی بوم + آسیب برج
agent-browser eval "(()=>{const cv=document.getElementById('game');const r=cv.getBoundingClientRect();cv.dispatchEvent(new MouseEvent('pointerdown',{clientX:r.left+460/960*r.width,clientY:r.top+300/560*r.height,button:0,bubbles:true}));return GAME.state.stats.shots})()" >/dev/null
sleep 0.3
chk "شلیک کار می‌کند" "$(agent-browser eval "GAME.state.stats.shots > 0" | tr -d '\n')" "true"
HPB=$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')
agent-browser eval "GAME.hurt(10)" >/dev/null
chk "آسیب برج کار می‌کند" "$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')" "$((HPB-10))"

echo "== 6) برد از موج ۱۰ + ریست کامل =="
agent-browser eval "GAME.win()" >/dev/null
sleep 0.5
chk "صفحه‌ی برد" "$(agent-browser eval "!document.getElementById('victoryScreen').classList.contains('hidden')" | tr -d '\n')" "true"
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
chk "ریست به برج اول" "$(agent-browser eval "GAME.state.towerVariant + ' ' + GAME.state.cutsceneDone + ' ' + GAME.state.mode" | tr -d '\n')" "0 false intermission"
chk "کات‌سین بسته" "$(agent-browser eval "GAME.getCutscene() === null" | tr -d '\n')" "true"
chk "شاتگان قفل دوباره" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "false"

echo "== 7) رد کردن کات‌سین (برای بازی دوباره) =="
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
chk "کات‌سین دوباره شروع شد" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "cutscene"
B2=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
agent-browser click "#skipCs" >/dev/null
sleep 0.4
chk "رد کردن → day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "برج دوم بعد از رد کردن" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '\n')" "1"
chk "هدیه بعد از رد کردن هم داده شد" "$(agent-browser eval "GAME.state.coins - $B2" | tr -d '"\n ')" "80"
chk "دکمه‌ی رد کردن مخفی شد" "$(agent-browser eval "document.getElementById('skipCs').classList.contains('hidden')" | tr -d '\n')" "true"
chk "بدون کات‌سین معلق" "$(agent-browser eval "GAME.getCutscene() === null" | tr -d '\n')" "true"

echo "== 8) رگرسیون مکعب‌های پنل + خرید =="
chk "۱۰ کاشی مکعبی" "$(agent-browser eval "document.querySelectorAll('.bp-tile').length" | tr -d '\n')" "10"
chk "آیکون کاشی = canvas" "$(agent-browser eval "document.querySelector('#bp-gatling .bp-ic').width" | tr -d '\n')" "68"
agent-browser eval "GAME.giveCoins(200)" >/dev/null
agent-browser eval "GAME.attemptBuy('weapon')" >/dev/null
chk "خرید ارتقا در روزِ برج دوم" "$(agent-browser eval "GAME.state.upgrades.weapon" | tr -d '\n')" "1"
agent-browser eval "GAME.attemptBuy('gatling'); GAME.clickPlace(590,486)" >/dev/null
chk "نصب برجک روی زمینِ برج دوم" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '\n')" "1"
agent-browser screenshot $S/10_day_cubes_panel.png >/dev/null

echo "== 9) خطاهای نهایی =="
agent-browser errors | grep -q . && { bad "خطاهای کنسول"; agent-browser errors; } || ok "بدون هیچ خطای کنسول در کل تست"

echo ""
echo "======================================"
echo "  PASS: $PASS   FAIL: $FAIL"
echo "======================================"
