#!/bin/bash
# تست نسخه‌ی ۲۱٫۳ — تمام‌صفحه/عرض تطبیقی/تغییر نام/رفع flex-shrink
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots213
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
}
# نام بازی برای eval با escape یونیکد (م:0645 ر:0631 گ:06AF ب:0628 ا:0627 ق:0642)
MARG='\u0645\u0631\u06AF'
BAQA='\u0628\u0642\u0627'

echo "===== ۱) گوشیِ عریض ۲۳۴۰×۱۰۸۰ (CSS: ۷۸۰×۳۶۰) — تمام‌صفحه ====="
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 10
R=$(agent-browser eval "W" | tail -1); ck "W تطبیقی = ۱۲۱۳ (گرفته: $R)" "$([ "$R" = "1213" ] && echo 1 || echo 0)"
R=$(agent-browser eval "TOWER.x===W/2?1:0" | tail -1); ck "برج وسط دنیا" "$R"
R=$(agent-browser eval "(()=>{const r=document.getElementById('wrap').getBoundingClientRect();return (Math.abs(r.width-780)<3&&Math.abs(r.height-360)<3)?1:0})()" | tail -1); ck "قاب دقیقاً کل صفحه را پر می‌کند (بدون نوار سیاه)" "$R"
R=$(agent-browser eval "(()=>{const s=window.__fitScale||0;return Math.abs(s-360/560)<0.01?1:0})()" | tail -1); ck "مقیاس transform = ۰٫۶۴ (ارتفاع کامل)" "$R"
R=$(agent-browser eval "canvas.width===Math.round(W*(window.devicePixelRatio||1))?1:0" | tail -1); ck "بوم پشتیبان = W×DPR (شارپ)" "$R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('wrap')).flexShrink==='0'?1:0" | tail -1); ck "flex:none — قاب دیگر له نمی‌شود (رفع باگ ۲۱٫۳)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots213/phone_menu.png >/dev/null

echo "===== ۲) تغییر نام: «سه طبقه تا مرگ» ====="
R=$(agent-browser eval "document.title.includes('$MARG')?1:0" | tail -1); ck "عنوان تب «سه طبقه تا مرگ»" "$R"
R=$(agent-browser eval "document.querySelector('.m23-title').textContent.includes('$MARG')?1:0" | tail -1); ck "تیتر منو «سه طبقه تا مرگ»" "$R"
R=$(agent-browser eval "document.body.innerText.includes('\u0633\u0647 \u0637\u0628\u0642\u0647 \u062a\u0627 '+'$BAQA')?0:1" | tail -1); ck "اثری از نام قدیمی «سه طبقه تا بقا» نیست (تب کوله «بقا» مجاز)" "$R"
R=$(agent-browser eval "document.body.innerText.includes('\u06F2\u06F4')?1:0" | tail -1); ck "پلاک نسخه ۲۴٫۰" "$R"

echo "===== ۳) صحنه‌ی بازی روی گوشی عریض ====="
fresh
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null; sleep 6
R=$(agent-browser eval "state.zombies.length>0?1:0" | tail -1); ck "زامبی‌ها زاده شدند" "$R"
R=$(agent-browser eval "(()=>{const zs=state.zombies;return zs.length?Math.max(...zs.map(z=>z.x))>W*0.7||Math.min(...zs.map(z=>z.x))<W*0.3?1:0:0})()" | tail -1); ck "زامبی‌ها در دنیای عریض پخش شده‌اند" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots213/phone_wave.png >/dev/null
R=$(agent-browser eval "['playing','day','intermission'].includes(state.mode)?1:0" | tail -1); ck "بازی در جریان است" "$R"

echo "===== ۴) پناهگاه روی صفحه عریض — چیدمان با اتاق جابه‌جا ====="
fresh
agent-browser eval "GAME.v19.startShelterCine();'ok'" >/dev/null; sleep 0.5
agent-browser eval "GAME.v19.shelterGoto('inside',1.5);'ok'" >/dev/null; sleep 1.6
R=$(agent-browser eval "(()=>{const s=GAME.v19.SHEL;return s&&s.phase==='inside'?1:0})()" | tail -1); ck "فاز inside پناهگاه فعال" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots213/phone_shelter.png >/dev/null
agent-browser eval "GAME.v19.shelterGoto('walk',1.0);'ok'" >/dev/null; sleep 0.6
agent-browser screenshot /home/z/my-project/scripts/shots213/phone_walk.png >/dev/null
agent-browser eval "GAME.v19.shelterGoto('gate',2.0);'ok'" >/dev/null; sleep 0.6
agent-browser screenshot /home/z/my-project/scripts/shots213/phone_gate.png >/dev/null
agent-browser eval "GAME.v19.skipShelterCine();'ok'" >/dev/null; sleep 1

echo "===== ۵) دسکتاپ ۱۲۸۰×۷۲۰ — دنیای ۹۹۶ و قاب کامل ====="
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
R=$(agent-browser eval "W" | tail -1); ck "W = ۹۹۶ روی ۱۶:۹ (گرفته: $R)" "$([ "$R" = "996" ] && echo 1 || echo 0)"
R=$(agent-browser eval "(()=>{const r=document.getElementById('wrap').getBoundingClientRect();return (Math.abs(r.width-1280)<4&&Math.abs(r.height-720)<4)?1:0})()" | tail -1); ck "قاب کامل ۱۲۸۰×۷۲۰" "$R"
R=$(agent-browser eval "HILLS1[HILLS1.length-1].x >= W-70?1:0" | tail -1); ck "تپه‌ها تا لبه‌ی دنیا کشیده شده‌اند" "$R"
R=$(agent-browser eval "SKYLINE[SKYLINE.length-1].x+SKYLINE[SKYLINE.length-1].w >= W-45?1:0" | tail -1); ck "افق شهر تا لبه‌ی دنیا" "$R"
R=$(agent-browser eval "LAMPS[1]===Math.round(W*0.755)?1:0" | tail -1); ck "چراغ‌ها متقارن نسبت به W" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots213/desktop_menu.png >/dev/null

echo "===== ۶) تولتیپ‌ها با مقیاس transform ====="
R=$(agent-browser eval "positionTip.toString().includes('__fitScale')?1:0" | tail -1); ck "positionTip مقیاس را لحاظ می‌کند" "$R"
R=$(agent-browser eval "showBpkTip.toString().includes('__fitScale')?1:0" | tail -1); ck "showBpkTip مقیاس را لحاظ می‌کند" "$R"

echo "===== ۷) رنگ‌ها: متا color-scheme + DPR ====="
R=$(agent-browser eval "document.querySelector('meta[name=color-scheme]')?1:0" | tail -1); ck "متای color-scheme (ضد کم‌رنگ شدن WebView)" "$R"
R=$(agent-browser eval "DPR0>=1?1:0" | tail -1); ck "DPR اولیه >= ۱ (شارپ)" "$R"

echo "===== ۸) مرورگر بدون تغییر رفتار: بازی هنوز جواب می‌دهد ====="
agent-browser set viewport 1100 640 >/dev/null; sleep 1.2
fresh
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "state.zombies.length>0?1:0" | tail -1); ck "موج ۱: زامبی‌ها زاده شدند" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots213/desktop_wave.png >/dev/null

echo "===== ۹) صفر خطای کنسول در کل تست ====="
E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۲۱٫۳ گذرنده ✔" || echo "خطا! رد شد ✘"
