#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۸٫۰ — سه طبقه تا بقا
# ۱) اسپرایت‌های مکعب پیکسل‌آرت پنل ساخت‌وساز
# ۲) کات‌سین کند/منطقی: ترک→طبقه۱→طبقه۲→بام→سقوط بازیکن→ماشین
# ۳) بخش رانندگی تعاملی: گاز/ترمز کیبورد + لمس + زامبی/مانع جاده
# ۴) اسلحه‌ها سوختند + غرامت سکه + انتقال صحیح state
# ۵) برج دوم: ماه خونی/خاکستر/شهر سوخته + موج ۶ تا برد + ریست
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots8
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1"; }
chk()  { # $1=desc $2=actual $3=expected-substring
  if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 -> got: $2"; fi
}

echo "== 1) بارگذاری و اسپرایت‌های مکعب =="
agent-browser close --all >/dev/null 2>&1   # جلسه‌ی تازه — خطاهای جلسه‌ی قبلی پاک شود
sleep 0.6
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 1.8
agent-browser errors --clear >/dev/null 2>&1
agent-browser errors | grep -q . && bad "خطای صفحه" || ok "بدون خطای کنسول"
chk "GAME api" "$(agent-browser eval "typeof GAME" | tr -d '\n')" "object"
chk "نسخه ۸٫۰" "$(agent-browser eval "document.querySelector('.ver').textContent.includes('۸٫۰')" | tr -d '\n')" "true"
chk "دکمه‌ی رد کردن مخفی در منو" "$(agent-browser eval "document.getElementById('skipCs').classList.contains('hidden')" | tr -d '\n')" "true"
chk "۱۰ کاشی پنل" "$(agent-browser eval "document.querySelectorAll('.bp-tile').length" | tr -d '\n')" "10"
chk "بوم آیکون ۷۶px" "$(agent-browser eval "document.querySelector('#bp-gatling .bp-ic').width" | tr -d '\n')" "76"
chk "تصاویر مکعب بارگذاری شدند" "$(agent-browser eval "Object.keys(CUBE_IMGS).every(k=>CUBE_IMGS[k].complete && CUBE_IMGS[k].naturalWidth>0)" | tr -d '\n')" "true"
chk "کاشی‌ها پیکسل غیرشفاف دارند (اسپرایت رسم شده)" "$(agent-browser eval "(()=>{const cv=document.querySelector('#bp-gatling .bp-ic');const d=cv.getContext('2d').getImageData(0,0,76,76).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>50)n++;return n>1500})()" | tr -d '\n')" "true"

echo "== 2) خرید اسلحه‌ها قبل از کات‌سین (مبنای غرامت) =="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
agent-browser eval "GAME.giveCoins(500)" >/dev/null
agent-browser eval "GAME.attemptBuy('weapon')" >/dev/null   # ۱۵
agent-browser eval "GAME.attemptBuy('weapon')" >/dev/null   # ۲۵ → weaponSpent=40
agent-browser eval "GAME.attemptBuy('shotgun')" >/dev/null  # ۱۲۰ → weaponSpent=160
agent-browser eval "GAME.attemptBuy('health')" >/dev/null   # ارتقای ساختمانی (باید حفظ شود)
agent-browser eval "GAME.attemptBuy('gatling'); GAME.clickPlace(590,486)" >/dev/null  # برجک (باید حفظ شود)
chk "سطح اسلحه ۲" "$(agent-browser eval "GAME.state.upgrades.weapon" | tr -d '"\n ')" "2"
chk "شاتگان خریده شد" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "true"
chk "weaponSpent = 160" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "160"
chk "برجک نصب شد" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '"\n ')" "1"
chk "ارتقای جون ۱" "$(agent-browser eval "GAME.state.upgrades.health" | tr -d '"\n ')" "1"

echo "== 3) پایان موج ۵ → شروع کات‌سین =="
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
chk "حالت cutscene" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "cutscene"
chk "دکمه‌ی رد کردن باز" "$(agent-browser eval "!document.getElementById('skipCs').classList.contains('hidden')" | tr -d '\n')" "true"
chk "cs-mode فعال" "$(agent-browser eval "document.getElementById('wrap').classList.contains('cs-mode')" | tr -d '\n')" "true"
B_COINS=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
B_HP=$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')
echo "   سکه: $B_COINS | جون: $B_HP"

echo "== 4) فروریختن منطقی و کند (پرش زمانی دقیق) =="
agent-browser eval "GAME.csGoto(1.9)" >/dev/null; sleep 0.25
agent-browser screenshot $S/01_shake.png >/dev/null
chk "ترک‌ها فعال (t=1.9)" "$(agent-browser eval "GAME.getCutscene().draw.cracks > 0.4" | tr -d '\n')" "true"
chk "همه طبقه‌ها هنوز سر جا" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a + ',' + GAME.getCutscene().draw.floors[1].a + ',' + GAME.getCutscene().draw.floors[2].a" | tr -d '\n')" "1,1,1"
agent-browser eval "GAME.csGoto(4.8)" >/dev/null; sleep 0.25
agent-browser screenshot $S/02_floor1.png >/dev/null
chk "طبقه‌ی اول در حال محو (t=4.8)" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a < 0.45" | tr -d '\n')" "true"
chk "طبقه‌ی دوم هنوز سالم (توالی منطقی)" "$(agent-browser eval "GAME.getCutscene().draw.floors[1].a" | tr -d '"\n ')" "1"
chk "طبقه‌های بالا نشسته‌اند (dy>40)" "$(agent-browser eval "GAME.getCutscene().draw.floors[2].dy > 40" | tr -d '\n')" "true"
chk "بازیکن روی بامِ در حال نشستن" "$(agent-browser eval "GAME.getCutscene().draw.player.y > 310" | tr -d '\n')" "true"
chk "آوار در حال رشد" "$(agent-browser eval "GAME.getCutscene().draw.rubble > 0.15" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(6.2)" >/dev/null; sleep 0.25
agent-browser screenshot $S/03_floor2.png >/dev/null
chk "طبقه‌ی اول کاملاً رفته (t=6.2)" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a" | tr -d '"\n ')" "0"
chk "طبقه‌ی دوم در حال محو" "$(agent-browser eval "GAME.getCutscene().draw.floors[1].a < 0.6" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(7.7)" >/dev/null; sleep 0.25
agent-browser screenshot $S/04_roof_player.png >/dev/null
chk "بام در حال لغزش/سقوط" "$(agent-browser eval "GAME.getCutscene().draw.floors[2].dy > 125" | tr -d '\n')" "true"
chk "بازیکن در حال جهش/سقوط قوسی" "$(agent-browser eval "GAME.getCutscene().draw.player.y > 340 && GAME.getCutscene().draw.player.rot > 0.1" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(9.0)" >/dev/null; sleep 0.25
agent-browser screenshot $S/05_caught.png >/dev/null
chk "بازیکن روی ماشین نشست" "$(agent-browser eval "GAME.getCutscene().caught && Math.abs(GAME.getCutscene().draw.player.y - (492+14-54)) < 10" | tr -d '\n')" "true"
chk "چند زامبی زیر ماشین رفت" "$(agent-browser eval "GAME.getCutscene().zombies.filter(z=>z.hit).length >= 2" | tr -d '\n')" "true"

echo "== 5) بخش رانندگی تعاملی =="
agent-browser eval "GAME.csGoto(10.6)" >/dev/null; sleep 0.25
chk "بخش رانندگی فعال" "$(agent-browser eval "!!GAME.getDrive()" | tr -d '\n')" "true"
chk "پیشرفت مسیر > ۱٪" "$(agent-browser eval "GAME.getDrive().progress > 0.01" | tr -d '\n')" "true"
chk "ماشین در جای رانندگی (x=330)" "$(agent-browser eval "Math.round(GAME.getCutscene().car.x)" | tr -d '"\n ')" "330"
chk "بازیکن روی ماشین در جاده" "$(agent-browser eval "Math.abs(GAME.getCutscene().draw.player.y - (492+14-54)) < 10" | tr -d '\n')" "true"
agent-browser screenshot $S/06_drive.png >/dev/null
# ورودی کیبورد: گاز با ArrowRight
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowRight',key:'ArrowRight',bubbles:true}))" >/dev/null
chk "کلید گاز فعال شد" "$(agent-browser eval "GAME.getDrive().keys.a" | tr -d '\n')" "true"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keyup',{code:'ArrowRight',bubbles:true}))" >/dev/null
chk "کلید گاز آزاد شد" "$(agent-browser eval "!GAME.getDrive().keys.a" | tr -d '\n')" "true"
# ورودی لمسی: لمس نیمه‌ی راست = گاز
agent-browser eval "(()=>{const cv=document.getElementById('game');const r=cv.getBoundingClientRect();cv.dispatchEvent(new MouseEvent('pointerdown',{clientX:r.left+0.8*r.width,clientY:r.top+0.5*r.height,button:0,bubbles:true}));return GAME.getDrive().touch.a})()" >/dev/null
chk "لمس راست = گاز" "$(agent-browser eval "GAME.getDrive().touch.a" | tr -d '\n')" "true"
agent-browser eval "window.dispatchEvent(new MouseEvent('pointerup',{bubbles:true}))" >/dev/null
chk "لمس آزاد شد" "$(agent-browser eval "!GAME.getDrive().touch.a" | tr -d '\n')" "true"
# ادامه‌ی رانندگی: زامبی‌ها و موانع جاده
agent-browser eval "GAME.csGoto(13.5)" >/dev/null; sleep 0.25
agent-browser screenshot $S/07_drive_zombies.png >/dev/null
chk "پیشرفت > ۳۰٪" "$(agent-browser eval "GAME.getDrive().progress > 0.3" | tr -d '\n')" "true"
chk "زامبی‌های جاده آمدند" "$(agent-browser eval "GAME.getDrive().zombies.length + GAME.getDrive().zombies.filter(z=>z.hit).length >= 1" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(16.5)" >/dev/null; sleep 0.25
agent-browser screenshot $S/08_drive_late.png >/dev/null
chk "پیشرفت > ۵۵٪ (شهر سوخته در افق)" "$(agent-browser eval "GAME.getDrive().progress > 0.55" | tr -d '\n')" "true"
chk "ماشین هنوز زنده" "$(agent-browser eval "!!GAME.getCutscene().car" | tr -d '\n')" "true"

echo "== 6) پایان رانندگی → سیاهی → غرامت → برج جدید =="
agent-browser eval "GAME.csGoto(21.5)" >/dev/null; sleep 0.3
chk "رانندگی تمام شد (پیش از پایان کات‌سین)" "$(agent-browser eval "GAME.getDrive().ended" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(23)" >/dev/null; sleep 0.3
chk "سیاهی کامل + غرامت اعمال شد" "$(agent-browser eval "GAME.getCutscene().compApplied" | tr -d '\n')" "true"
agent-browser screenshot $S/06b_black_comp.png >/dev/null
agent-browser eval "GAME.csGoto(40)" >/dev/null; sleep 0.5
chk "کات‌سین تمام شد → day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "برج دوم (variant=1)" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '"\n ')" "1"
chk "cutsceneDone" "$(agent-browser eval "GAME.state.cutsceneDone" | tr -d '\n')" "true"
chk "موج هنوز ۵" "$(agent-browser eval "GAME.state.wave" | tr -d '"\n ')" "5"
chk "جون برج حفظ شد" "$(agent-browser eval "Math.round(GAME.state.tower.hp)" | tr -d '"\n ')" "$B_HP"
chk "ارتقای جون حفظ شد" "$(agent-browser eval "GAME.state.upgrades.health" | tr -d '"\n ')" "1"
chk "برجک حفظ شد" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '"\n ')" "1"
chk "شاتگان زیر آوار رفت (قفل)" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "false"
chk "مسلسل قفل" "$(agent-browser eval "GAME.WEAPONS.mg.owned" | tr -d '\n')" "false"
chk "سطح اسلحه صفر شد" "$(agent-browser eval "GAME.state.upgrades.weapon" | tr -d '"\n ')" "0"
chk "سلاح = تپانچه" "$(agent-browser eval "GAME.state.weapon" | tr -d '\n')" "pistol"
chk "weaponSpent صفر شد" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "0"
chk "غرامت ۱۵۰ سکه (۶۰٪ ۱۶۰ + ۵۰)" "$(agent-browser eval "GAME.state.coins - $B_COINS" | tr -d '"\n ')" "150"
chk "دکمه‌ی شب: موج ۶" "$(agent-browser eval "document.getElementById('btnNight').textContent.includes('۶')" | tr -d '\n')" "true"
agent-browser screenshot $S/09_day_newtower.png >/dev/null

echo "== 7) موج ۶ شب روی برج دوم (ماه خونی/خاکستر/شهر سوخته) =="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 5.5
chk "موج ۶ playing" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "6 playing"
chk "ترکیب موج ۶ = ۲۸ زامبی" "$(agent-browser eval "GAME.state.spawn.queue.length + GAME.state.zombies.filter(z=>!z.dead).length" | tr -d '"\n ')" "28"
agent-browser screenshot $S/10_wave6_bloodmoon.png >/dev/null
agent-browser eval "GAME.giveCoins(200); GAME.attemptBuy('shotgun')" >/dev/null
chk "خرید دوباره‌ی شاتگان با پول غرامت" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "true"
chk "weaponSpent دوباره شمارش می‌شود" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "120"
# شلیک واقعی
agent-browser eval "(()=>{const cv=document.getElementById('game');const r=cv.getBoundingClientRect();cv.dispatchEvent(new MouseEvent('pointerdown',{clientX:r.left+460/960*r.width,clientY:r.top+300/560*r.height,button:0,bubbles:true}));return GAME.state.stats.shots})()" >/dev/null
sleep 0.3
chk "شلیک کار می‌کند" "$(agent-browser eval "GAME.state.stats.shots > 0" | tr -d '\n')" "true"

echo "== 8) برد از موج ۱۰ + ریست کامل =="
agent-browser eval "GAME.win()" >/dev/null
sleep 0.5
chk "صفحه‌ی برد" "$(agent-browser eval "!document.getElementById('victoryScreen').classList.contains('hidden')" | tr -d '\n')" "true"
agent-browser screenshot $S/11_victory.png >/dev/null
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
chk "ریست به برج اول" "$(agent-browser eval "GAME.state.towerVariant + ' ' + GAME.state.cutsceneDone + ' ' + GAME.state.mode" | tr -d '\n')" "0 false intermission"
chk "کات‌سین بسته" "$(agent-browser eval "GAME.getCutscene() === null" | tr -d '\n')" "true"
chk "شاتگان قفل دوباره" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "false"
chk "weaponSpent ریست" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "0"

echo "== 9) رد کردن کات‌سین =="
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
chk "کات‌سین شروع شد" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "cutscene"
B2=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
agent-browser click "#skipCs" >/dev/null
sleep 0.4
chk "رد کردن → day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "برج دوم بعد از رد کردن" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '"\n ')" "1"
chk "غرامت حداقلی بعد از رد کردن (۶۰ — بازی تازه بدون اسلحه)" "$(agent-browser eval "GAME.state.coins - $B2" | tr -d '"\n ')" "60"
chk "اسلحه‌ها بعد از رد کردن هم سوختند" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned + ' ' + GAME.state.upgrades.weapon" | tr -d '\n')" "false 0"
chk "بدون کات‌سین معلق" "$(agent-browser eval "GAME.getCutscene() === null" | tr -d '\n')" "true"

echo "== 10) رگرسیون پنل مکعبی روی برج دوم =="
agent-browser eval "GAME.giveCoins(100)" >/dev/null
agent-browser eval "GAME.attemptBuy('gatling'); GAME.clickPlace(600,486)" >/dev/null
chk "نصب برجک روی زمینِ برج دوم (بازی تازه → ۱)" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '"\n ')" "1"
agent-browser screenshot $S/12_cubes_panel_v2.png >/dev/null

echo "== 11) خطاهای نهایی =="
agent-browser errors | grep -q . && { bad "خطاهای کنسول"; agent-browser errors; } || ok "بدون هیچ خطای کنسول در کل تست"

echo ""
echo "======================================"
echo "  PASS: $PASS   FAIL: $FAIL"
echo "======================================"
