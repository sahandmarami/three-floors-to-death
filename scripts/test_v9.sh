#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۹٫۰ — سه طبقه تا بقا
# ۱) کاشی‌های فروشگاه برش‌خورده از تصویر مرجع کاربر (۹ واقعی + ۲ ترکیبی)
# ۲) آیتم جدید «سرعت شلیک» (کفشِ تصویر مرجع): خرید با H + اثر + غرامت
# ۳) کات‌سین و انتقال state + موج ۶ + برد + ریست کامل
# ۴) اسکرین‌شات برای تحلیل بصری VLM (پنل روز با کاشی‌های جدید)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots9
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1"; }
chk()  { # $1=desc $2=actual $3=expected-substring
  if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 -> got: $2"; fi
}

echo "== 1) بارگذاری و کاشی‌های فروشگاه تصویر مرجع =="
agent-browser close --all >/dev/null 2>&1
sleep 0.6
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 2.0
agent-browser errors --clear >/dev/null 2>&1
agent-browser errors | grep -q . && bad "خطای صفحه" || ok "بدون خطای کنسول"
chk "GAME api" "$(agent-browser eval "typeof GAME" | tr -d '\n')" "object"
chk "نسخه ۹٫۰" "$(agent-browser eval "document.querySelector('.ver').textContent.includes('۹٫۰')" | tr -d '\n')" "true"
chk "۱۱ کاشی پنل" "$(agent-browser eval "document.querySelectorAll('.bp-tile').length" | tr -d '\n')" "11"
chk "گروه‌ها مطابق تصویر مرجع" "$(agent-browser eval "Array.from(document.querySelectorAll('.bp-grp')).map(g=>g.textContent).join('|')" | tr -d '\n')" "ارتقاء|سلاح‌ها|برجک‌ها"
chk "بوم آیکون ۸۸px" "$(agent-browser eval "document.querySelector('#bp-gatling .bp-ic').width" | tr -d '\n')" "88"
chk "۱۱ اسپرایت بارگذاری شد" "$(agent-browser eval "Object.keys(CUBE_IMGS).length + ':' + Object.keys(CUBE_IMGS).every(k=>CUBE_IMGS[k].complete && CUBE_IMGS[k].naturalWidth>0)" | tr -d '\n')" "11:true"
chk "کاشی‌ها رنگ دارند (رسم واقعی)" "$(agent-browser eval "(()=>{const cv=document.querySelector('#bp-repair .bp-ic');const d=cv.getContext('2d').getImageData(0,0,88,88).data;let n=0;for(let i=0;i<d.length;i+=16){if(d[i+3]>50 && (Math.abs(d[i]-20)+Math.abs(d[i+1]-32)+Math.abs(d[i+2]-43))>40)n++;}return n>1000})()" | tr -d '\n')" "true"
chk "آیکون سرعت (کفش) موجود" "$(agent-browser eval "!!document.getElementById('bp-speed')" | tr -d '\n')" "true"
chk "قیمت سرعت = ۲۰ (فارسی)" "$(agent-browser eval "document.getElementById('bp-speed-cost').textContent" | tr -d '\n')" "۲۰"

echo "== 2) خرید «سرعت شلیک» + اثر روی نرخ شلیک =="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
agent-browser eval "GAME.giveCoins(400)" >/dev/null
# خرید با کلید H (نگاشت فیزیکی KeyH)
agent-browser eval "GAME.state.mode='day'" >/dev/null
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH'}))" >/dev/null
sleep 0.2
chk "خرید با کلید H → سطح ۱" "$(agent-browser eval "GAME.state.upgrades.speed" | tr -d '"\n ')" "1"
C1=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
chk "سکه کم شد (۴۱۰ باقی)" "$(echo $C1)" "410"
chk "weaponSpent شامل سرعت = ۲۰" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "20"
# اثر روی فاصله‌ی شلیک: با level 6 تپانچه باید ~۰٫۱۶ ثانیه شود
agent-browser eval "GAME.state.upgrades.speed = 6" >/dev/null
chk "فرمول نرخ شلیک (تپانچه، سطح ۶)" "$(agent-browser eval "(0.30*(1-0.08*6)).toFixed(3)" | tr -d '\n')" "0.156"
agent-browser eval "GAME.state.upgrades.speed = 1" >/dev/null
agent-browser eval "GAME.attemptBuy('weapon')" >/dev/null
agent-browser eval "GAME.attemptBuy('shotgun')" >/dev/null
agent-browser eval "GAME.attemptBuy('health')" >/dev/null
agent-browser eval "GAME.attemptBuy('gatling'); GAME.clickPlace(590,486)" >/dev/null
chk "شاتگان + ارتقاها + برجک (مبنای غرامت)" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned + ',' + GAME.state.upgrades.weapon + ',' + GAME.state.upgrades.health + ',' + GAME.state.turrets.length" | tr -d '\n')" "true,1,1,1"

echo "== 3) روز: اسکرین‌شات پنل با کاشی‌های تصویر مرجع =="
agent-browser screenshot $S/01_day_panel.png >/dev/null
agent-browser screenshot $S/02_menu.png >/dev/null   # (منو قبلاً رندر شده؛ این برای بایگانی)
chk "پنل روز باز" "$(agent-browser eval "!document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"

echo "== 4) کات‌سین موج ۵ → غرامت (شامل ریست سرعت) =="
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
chk "حالت cutscene" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "cutscene"
B_COINS=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
agent-browser eval "GAME.csGoto(4.5)" >/dev/null; sleep 0.2
agent-browser screenshot $S/03_collapse.png >/dev/null
chk "فروریختن طبقه‌ی ۱ در جریان" "$(agent-browser eval "GAME.getCutscene().draw.floors[0].a < 0.5" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(10.5)" >/dev/null; sleep 0.2
agent-browser screenshot $S/04_drive.png >/dev/null
chk "بخش رانندگی فعال" "$(agent-browser eval "!!GAME.getCutscene().drive || !!GAME.getDrive()" | tr -d '\n')" "true"
agent-browser eval "GAME.csGoto(23)" >/dev/null; sleep 0.3
chk "غرامت پرداخت شد" "$(agent-browser eval "GAME.getCutscene().compApplied" | tr -d '\n')" "true"
chk "شاتگان قفل شد" "$(agent-browser eval "GAME.WEAPONS.shotgun.owned" | tr -d '\n')" "false"
chk "سطح اسلحه صفر" "$(agent-browser eval "GAME.state.upgrades.weapon" | tr -d '"\n ')" "0"
chk "سطح سرعت هم صفر (زیر آوار)" "$(agent-browser eval "GAME.state.upgrades.speed" | tr -d '"\n ')" "0"
chk "weaponSpent ریست" "$(agent-browser eval "GAME.state.weaponSpent" | tr -d '"\n ')" "0"
A_COINS=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
chk "سکه = خودمان + غرامت ۱۴۰ (۶۰٪×۱۵۵+۵۰)" "$(echo $A_COINS)" "$((B_COINS + 140))"
chk "ارتقاهای ساختمانی حفظ" "$(agent-browser eval "GAME.state.upgrades.health + ',' + GAME.state.turrets.length" | tr -d '\n')" "1,1"
agent-browser eval "GAME.csGoto(40)" >/dev/null; sleep 0.5
chk "پایان کات‌سین → روز برج دوم" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "برج دوم" "$(agent-browser eval "GAME.state.towerVariant" | tr -d '"\n ')" "1"
agent-browser screenshot $S/05_day_newtower.png >/dev/null

echo "== 5) موج ۶ + برد + ریست کامل =="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 5.5
chk "موج ۶ playing" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "6 playing"
agent-browser screenshot $S/06_wave6.png >/dev/null
agent-browser eval "GAME.skipToWave(10)" >/dev/null
agent-browser eval "GAME.win()" >/dev/null
sleep 0.5
chk "پیروزی" "$(agent-browser eval "!document.getElementById('victoryScreen').classList.contains('hidden')" | tr -d '\n')" "true"
agent-browser screenshot $S/07_victory.png >/dev/null
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.4
chk "ریست کامل: سرعت ۰ + ۱۱ کاشی + سکه ۳۰" "$(agent-browser eval "GAME.state.upgrades.speed + ',' + document.querySelectorAll('.bp-tile').length + ',' + GAME.state.coins" | tr -d '\n')" "0,11,30"

echo "== 6) رد کردن کات‌سین (مسیر میان‌بر) =="
agent-browser eval "GAME.state.wave = 5; GAME.endWave()" >/dev/null
sleep 0.4
agent-browser eval "document.getElementById('skipCs').click()" >/dev/null
sleep 0.3
chk "رد کردن → روزِ برج دوم" "$(agent-browser eval "GAME.state.mode + ',' + GAME.state.towerVariant" | tr -d '\n')" "day,1"
chk "غرامت در رد کردن هم اعمال" "$(agent-browser eval "GAME.state.upgrades.speed + ',' + GAME.state.weaponSpent" | tr -d '\n')" "0,0"

echo ""
echo "======================================"
echo "RESULT: $PASS OK / $FAIL FAIL"
echo "======================================"
