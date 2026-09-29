#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۶٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + عناصر قدیمی حذف / عنصر جدید موجود
#  ۱) «شب شود» داخل پنل ساخت‌وساز: نمایان در روز، کلیک=شب،
#     حالت جمع‌شده، مخفی حین گفتگو، جای درست (داخل پنل)
#  ۲) کوله‌پشتی: قاب رنگی هر وسیله + شمارنده + اندازه‌ی جدید
#  ۳) تاریکیِ لکه‌ای فصل ۲ (تحلیل پیکسلی: دامنه/پراکندگی)
#  ۴) قطع برق: تاریک‌تر ولی همچنان لکه‌ای + نور چراغ‌قوه
#  ۵) دریفت لکه‌ها (حرکت در زمان)
#  ۶) رگرسیون: شب/موج/بدون خطای کنسول
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots16
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }
pix()  { python3 scripts/pix_v16.py "$1" "$2"; }

echo "===== ۰) بارگذاری و دگرگونی‌های ۱۶ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v14 API (رگرسیون)" "$(ev 'typeof GAME.v14')" "object"
chk "dayPanel حذف شد" "$(ev 'document.getElementById("dayPanel") === null')" "true"
chk "btnNight حذف شد" "$(ev 'document.getElementById("btnNight") === null')" "true"
chk "dpHint حذف شد" "$(ev 'document.getElementById("dpHint") === null')" "true"
chk "bpNight موجود" "$(ev '!!document.getElementById("bpNight")')" "true"
chk "bpNight داخل buildPanel" "$(ev 'document.getElementById("bpNight").parentElement.id')" "buildPanel"
chk "بدون خطای کنسول (بارگذاری)" "$(agent-browser errors | grep -c error || echo 0)" "0"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) «شب شود» داخل پنل ساخت‌وساز ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.5
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
for i in $(seq 1 30); do
  M=$(ev 'GAME.state.mode'); [ "$M" = "playing" ] && break; sleep 0.4
done
chk "موج ۱ شروع شد (intermission خودکار)" "$(ev 'GAME.state.mode + "/" + GAME.state.wave')" "playing/1"
# پایان موج → روز
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.2
# اگر دستفروش آمد برو (تست قطعی شود)
agent-browser eval "if (typeof PED !== 'undefined' && PED.st !== 'off' && PED.st !== 'none') PED.leave(false)" >/dev/null 2>&1
sleep 0.8
chk "روز شد" "$(ev 'GAME.state.mode')" "day"
chk "bpNight نمایان در روز" "$(ev '!document.getElementById("bpNight").classList.contains("hidden")')" "true"
chk "برچسب bpNight = شب شود/آخرین شب" "$(evr 'document.getElementById("bpNight").textContent')" "شب شود"
chk "متن موج در برچسب" "$(evr 'document.getElementById("bpNight").textContent')" "موج"
chk "برچسب موجِ درون‌فصلی درست (۲)" "$(evr 'document.getElementById("bpNight").textContent')" "موج ۲"
# موقعیت: داخل مرزهای پنل، سمت راست صفحه، نه گوشه‌ی پایین
POS=$(agent-browser eval "(()=>{const b=document.getElementById('bpNight').getBoundingClientRect(),p=document.getElementById('buildPanel').getBoundingClientRect(),w=document.getElementById('wrap').getBoundingClientRect();return JSON.stringify({inX:b.left>=p.left-1&&b.right<=p.right+1,inY:b.top>=p.top-1&&b.bottom<=p.bottom+1,topRel:((b.top-w.top)/w.height).toFixed(2)})})()" | tr -d '\n')
chk "داخل مرز پنل (X و Y)" "$(echo $POS | tr -d '\\' | grep -o '"inX":[a-z]*')" '"inX":true'
chk "داخل مرز پنل — عمودی" "$(echo $POS | tr -d '\\' | grep -o '"inY":[a-z]*')" '"inY":true'
chk "بالای صفحه‌ی پنل است نه پایینِ گوشه" "$(echo $POS | tr -d '\\' | grep -o '"topRel":"[0-9.]*"')" '"topRel":"0.1'
agent-browser screenshot $S/01_day_panel.png >/dev/null
# حالت جمع‌شده: دکمه هنوز دیده شود
agent-browser eval "GAME.setBuildPanel(true)" >/dev/null
sleep 0.4
chk "در پنلِ جمع‌شده هم دیده می‌شود" "$(ev 'document.getElementById("bpNight").offsetParent !== null')" "true"
agent-browser eval "GAME.setBuildPanel(false)" >/dev/null
sleep 0.4
# مخفی حین گفتگو (کلاس dlg-on)
agent-browser eval "document.getElementById('wrap').classList.add('dlg-on')" >/dev/null
sleep 0.2
chk "حین گفتگو مخفی (dlg-on)" "$(ev 'getComputedStyle(document.getElementById("bpNight")).display')" "none"
agent-browser eval "document.getElementById('wrap').classList.remove('dlg-on')" >/dev/null
# کلیک واقعی → شب
agent-browser eval "document.getElementById('bpNight').click()" >/dev/null
sleep 2.2
chk "کلیک bpNight → شب/موج ۲" "$(ev 'GAME.state.mode + "/" + GAME.state.wave')" "playing/2"
chk "بعد از شروع شب مخفی شد" "$(ev 'document.getElementById("bpNight").classList.contains("hidden")')" "true"

echo "===== ۲) کوله‌پشتی: قاب رنگی + شمارنده ====="
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.2
agent-browser eval "if (typeof PED !== 'undefined' && PED.st !== 'off' && PED.st !== 'none') PED.leave(false)" >/dev/null 2>&1
sleep 0.8
agent-browser eval "GAME.v10.giveItem('flashlight'); GAME.v10.giveItem('battery'); GAME.v10.giveItem('canned'); GAME.v10.giveItem('medkit')" >/dev/null
agent-browser eval "GAME.state.coins += 900; GAME.state.backpack[4] = {id:'vest'}; GAME.state.buffs.vest = true; refreshBackpack()" >/dev/null
sleep 0.5
chk "شمارنده کوله ۵/۶" "$(evr 'document.getElementById("bpkCap").textContent')" "۵/۶"
chk "اندازه‌ی جدید اسلات = 50px" "$(ev 'getComputedStyle(document.getElementById("bpk-0")).width')" "50px"
chk "گردی 12px" "$(ev 'getComputedStyle(document.getElementById("bpk-0")).borderRadius')" "12px"
chk "قاب آماده‌ها سبز (فلش)" "$(ev 'getComputedStyle(document.getElementById("bpk-0")).borderColor')" "95,174,106"
chk "قاب جلیقه‌ی فعال = آبیِ خودش" "$(ev 'getComputedStyle(document.getElementById("bpk-4")).borderColor')" "143,214,255"
chk "هاله‌ی رنگی جلیقه" "$(ev 'getComputedStyle(document.getElementById("bpk-4")).boxShadow != "none"')" "true"
chk "جاخالیِ خالی = خط‌چین" "$(ev 'getComputedStyle(document.getElementById("bpk-5")).borderStyle')" "dashed"
chk "جاخالیِ خالی «+» دارد" "$(ev 'getComputedStyle(document.getElementById("bpk-5"), "::after").content')" "+"
chk "بوم آیکون بزرگ‌تر 46px" "$(ev 'getComputedStyle(document.getElementById("bpk-0").querySelector("canvas")).width')" "46px"
agent-browser screenshot $S/02_backpack.png >/dev/null
# مصرف: کلیک روی جاخالی‌ی کنسرو
agent-browser eval "useItem(2)" >/dev/null
sleep 0.5
chk "مصرف کنسرو → خالی" "$(ev 'GAME.state.backpack[2] === null')" "true"
chk "شمارنده بعد از مصرف ۴/۶" "$(evr 'document.getElementById("bpkCap").textContent')" "۴/۶"

echo "===== ۳) تاریکیِ لکه‌ای فصل ۲ ====="
# skipToWave از حالت روز، گذار شب را رد می‌کند → شب را دستی کامل می‌کنیم
agent-browser eval "GAME.state.tower.hp = 800; GAME.state.dayness = 0; GAME.state.dayTarget = 0; GAME.skipToWave(9)" >/dev/null
for i in $(seq 1 30); do
  M=$(ev 'GAME.state.mode'); [ "$M" = "playing" ] && break; sleep 0.4
done
chk "موج ۹ (فصل ۲) شروع شد" "$(ev 'GAME.state.mode + "/" + GAME.state.wave + "/" + GAME.state.chapter')" "playing/9/2"
sleep 4
chk "سطح تاریکی فصل ۲ ~۰٫۶" "$(ev '(GAME.v10.Dark.level > 0.5 && GAME.v10.Dark.level < 0.75)')" "true"
chk "۴ لکه‌ی شناور موجود" "$(ev 'GAME.v10.Dark._field().length')" "4"
agent-browser screenshot $S/03_ch2_night.png >/dev/null
echo "  --- تحلیل پیکسلی نوار زمین/میانه (بدون هاله‌ی بازیکن) ---"
OUT=$(pix $S/03_ch2_night.png ch2)
echo "  $OUT"
chk "فصل ۲: تاریکی لکه‌ای است (دامنه+پراکندگی)" "$(echo "$OUT" | tail -1)" "PASS"
chk "فصل ۲: همه‌جا سیاه نیست (میانه روشن)" "$(echo "$OUT" | grep -o 'mean=[0-9.]*' | grep -o '[0-9.]*' | head -1 | awk '{print ($1>=27)?"BRIGHT":"DARK"}')" "BRIGHT"
chk "فصل ۲: سوراخ نورِ بازیکن زنده است" "$(echo "$OUT" | grep -o 'light=[0-9.]*' | grep -o '[0-9.]*' | awk '{print ($1>=60)?"LIGHT":"DARK"}')" "LIGHT"

echo "===== ۴) قطع برق: سنگین ولی لکه‌ای ====="
agent-browser eval "GAME.state.tower.hp = 800; GAME.v10.giveItem('flashlight'); GAME.state.torch.owned = true; GAME.state.torch.battery = 100; toggleFlashlight()" >/dev/null 2>&1
agent-browser eval "GAME.v10.setBlackout(true); GAME.state.blackout.until = 9999" >/dev/null
sleep 3
chk "سطح تاریکی قطع برق ~۱" "$(ev 'GAME.v10.Dark.level > 0.85')" "true"
agent-browser screenshot $S/04_blackout.png >/dev/null
OUT=$(pix $S/04_blackout.png blackout)
echo "  $OUT"
chk "قطع برق: همچنان لکه‌ای (دامنه)" "$(echo "$OUT" | tail -1)" "PASS"
chk "قطع برق: چراغ‌قوه روشن" "$(echo "$OUT" | grep -o 'light=[0-9.]*' | grep -o '[0-9.]*' | awk '{print ($1>=55)?"LIGHT":"DARK"}')" "LIGHT"
agent-browser eval "GAME.v10.setBlackout(false)" >/dev/null

echo "===== ۵) دریفت لکه‌ها ====="
X1=$(ev 'GAME.v10.Dark._field().map(b=>Math.round(b.x)).join(",")')
sleep 1.6
X2=$(ev 'GAME.v10.Dark._field().map(b=>Math.round(b.x)).join(",")')
if [ "$X1" != "$X2" ]; then ok "لکه‌ها در زمان جابه‌جا می‌شوند"; else bad "لکه‌ها جابه‌جا می‌شوند" "$X1 == $X2"; fi

echo "===== ۶) رگرسیون ====="
chk "چراغ‌قوه روشن ماند" "$(ev 'GAME.state.torch.on')" "true"
chk "باتری مصرف می‌شود" "$(ev 'GAME.state.torch.battery < 100')" "true"
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.5
agent-browser eval "if (typeof PED !== 'undefined' && PED.st !== 'off' && PED.st !== 'none') PED.leave(false)" >/dev/null 2>&1
sleep 0.8
chk "روز بعد از موج ۹" "$(ev 'GAME.state.mode')" "day"
chk "bpNight دوباره نمایان" "$(ev '!document.getElementById("bpNight").classList.contains("hidden")')" "true"
agent-browser eval "GAME.startNight()" >/dev/null
sleep 2.2
chk "startNight API → موج ۱۰" "$(ev 'GAME.state.mode + "/" + GAME.state.wave')" "playing/10"
chk "بدون خطای کنسول (پایان)" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo
echo "=========================================="
echo "PASS=$PASS  FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "همه‌ی تست‌های ۱۶٫۰ گذرنده ✔" || echo "شکست در تست‌ها!"
