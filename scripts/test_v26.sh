#!/bin/bash
# تست نسخه‌ی ۲۶٫۰ — آیکن‌های SVG + ستون چپ + دیالوگ دستفروش + سامسونگ
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots26
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done

echo "===== ۱) سیستم آیکن SVG ====="
R=$(agent-browser eval "typeof ICO!=='undefined' && typeof ICO.ico('pause')==='string' && ICO.ico('pause').includes('<svg')?1:0" | tail -1); ck "ICO تعریف شده با SVG" "$R"
R=$(agent-browser eval "document.querySelectorAll('#hud svg,#pauseScreen svg,#settingsScreen svg').length>=8?1:0" | tail -1); ck "آیکن‌های SVG در HUD/پنل‌ها (>=8)" "$R" "got=$(agent-browser eval "document.querySelectorAll('#hud svg,#pauseScreen svg,#settingsScreen svg').length" | tail -1)"
R=$(agent-browser eval "document.getElementById('ctlPause').innerHTML.includes('<svg')?1:0" | tail -1); ck "توقف = SVG (نه ایموجی)" "$R"
R=$(agent-browser eval "document.getElementById('ctlMute').innerHTML.includes('<svg')?1:0" | tail -1); ck "صدا = SVG" "$R"
R=$(agent-browser eval "!/⏸|🔊|🔦|👂|🔥|🔍|🛠|🌙|🎒|💀|❤/.test(document.getElementById('hud').innerHTML + document.getElementById('buildPanel').innerHTML + document.getElementById('backpackBar').innerHTML + document.getElementById('lockBadge').innerHTML)?1:0" | tail -1); ck "هیچ ایموجی کنترلی در HUD/پنل/کوله" "$R"
R=$(agent-browser eval "(()=>{const t=document.querySelectorAll('#bpTabs .bp-tab-ic svg');return t.length===4?1:0})()" | tail -1); ck "۴ تب ساخت‌وساز همه SVG" "$R" "got=$(agent-browser eval "document.querySelectorAll('#bpTabs .bp-tab-ic svg').length" | tail -1)"
R=$(agent-browser eval "document.getElementById('bpHead').innerHTML.includes('<svg')?1:0" | tail -1); ck "سربرگ ساخت‌وساز = SVG tools" "$R"
R=$(agent-browser eval "document.getElementById('skipCs') && document.getElementById('skipCs').innerHTML.includes('<svg')?1:0" | tail -1); ck "رد کردن = SVG" "$R"

echo "===== ۲) ستون چپ — بیرون از مسیر زامبی ====="
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='playing'?1:0" | tail -1); ck "شب در جریان" "$R"
# مولوتوف بده تا دکمه‌اش هم بیاید
agent-browser eval "MYST.molotovs=2; MYST.update(0.016);'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const b=document.getElementById('listenBtn');const r=b.getBoundingClientRect();return r.y>=0 && r.y<200 && r.x<80?1:0})()" | tail -1); ck "شنود: ستون چپ بالا (y<200)" "$R" "y=$(agent-browser eval "Math.round(document.getElementById('listenBtn').getBoundingClientRect().y)" | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('ctlFlash');const r=b.getBoundingClientRect();return r.y<230 && r.x<80?1:0})()" | tail -1); ck "چراغ‌قوه: ستون چپ (y<230)" "$R" "y=$(agent-browser eval "Math.round(document.getElementById('ctlFlash').getBoundingClientRect().y)" | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('molotovBtn');const r=b.getBoundingClientRect();const zy=492*(innerHeight/560);return (r.y+r.height)<zy-20?1:0})()" | tail -1); ck "مولوتوف: بالای نوار زمین" "$R"
R=$(agent-browser eval "(()=>{const zs=[...document.querySelectorAll('#listenBtn,#ctlFlash,#molotovBtn')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect());for(let i=0;i<zs.length;i++){const a=zs[i];for(let j=i+1;j<zs.length;j++){const b=zs[j];if(a.left<b.right&&b.left<a.right&&a.top<b.bottom&&b.top<a.bottom)return 0}}return 1})()" | tail -1); ck "سه دکمه‌ی ستون چپ بدون هم‌پوشانی" "$R"
R=$(agent-browser eval "document.getElementById('listenBtn').innerHTML.includes('<svg')?1:0" | tail -1); ck "شنود = SVG گوش" "$R"
R=$(agent-browser eval "document.getElementById('ctlFlash').innerHTML.includes('<svg')?1:0" | tail -1); ck "چراغ‌قوه = SVG مشعل" "$R"

echo "===== ۳) دیالوگ دستفروش + پیل بازگشایی ====="
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "روز (پس از موج)" "$R"
agent-browser eval "peddlerRoll(true);'ok'" >/dev/null 2>&1; sleep 6
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2.5
R=$(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')?1:0" | tail -1); ck "دیالوگ خرید باز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots26/t26_merchant.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const c=document.getElementById('peddlerPanel').getBoundingClientRect();const cx=c.x+c.width/2;return Math.abs(cx-innerWidth/2)<80?1:0})()" | tail -1); ck "کارت دستفروش وسط صفحه" "$R" "cx=$(agent-browser eval "Math.round((()=>{const c=document.getElementById('peddlerPanel').getBoundingClientRect();return c.x+c.width/2})())" | tail -1)"
R=$(agent-browser eval "document.getElementById('pdClose')?1:0" | tail -1); ck "دکمه‌ی X بستن هست" "$R"
# هیچ دکمه‌ی دیگری زیر کارت گیر نکرده باشد — بک‌دراپ کلیک را می‌گیرد
R=$(agent-browser eval "getComputedStyle(document.getElementById('peddlerBox')).zIndex>=15?1:0" | tail -1); ck "بک‌دراپ بالای همه (z>=15)" "$R" "z=$(agent-browser eval "getComputedStyle(document.getElementById('peddlerBox')).zIndex" | tail -1)"
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 1.2
R=$(agent-browser eval "document.getElementById('peddlerBox').classList.contains('hidden')?1:0" | tail -1); ck "بستن با X" "$R"
sleep 1
R=$(agent-browser eval "getComputedStyle(document.getElementById('pedReopenBtn')).display==='flex'?1:0" | tail -1); ck "پیل «خرید از دستفروش» ظاهر شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots26/t26_reopen.png >/dev/null 2>&1
agent-browser eval "document.getElementById('pedReopenBtn').click();'ok'" >/dev/null 2>&1; sleep 1.2
R=$(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')?1:0" | tail -1); ck "بازگشایی با پیل" "$R"
R=$(agent-browser eval "document.querySelectorAll('#pedReopenBtn').length===1?1:0" | tail -1); ck "فقط یک pedReopenBtn (بدون تکرار)" "$R"
# شب که شد پیل مخفی شود
agent-browser eval "state.mode='playing'; MYST.update(0.016);'ok'" >/dev/null 2>&1
R=$(agent-browser eval "getComputedStyle(document.getElementById('pedReopenBtn')).display==='none'?1:0" | tail -1); ck "شب → پیل مخفی" "$R"

echo "===== ۴) استوری‌موشن — ساختمان هماهنگ با برج ====="
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "typeof MG23.building23==='function' && MG23.building23.toString().includes('FW = [158, 144, 130]')?1:0" | tail -1); ck "building23: طبقات مخروطی ۱۵۸/۱۴۴/۱۳۰" "$R"
R=$(agent-browser eval "MG23.building23.toString().includes(\"'#82705a'\") && MG23.building23.toString().includes(\"'#a04b3a'\") && MG23.building23.toString().includes(\"'#41729f'\")?1:0" | tail -1); ck "رنگ‌های فصل ۱ بازی (سنگ/آجر/آبی)" "$R"
R=$(agent-browser eval "MG23.building23.toString().includes('nB = mode') && MG23.building23.toString().includes('c23a2c')?1:0" | tail -1); ck "کنگره‌ی بام + پرچم قرمز" "$R"
R=$(agent-browser eval "MG23.bgZombies23.toString().includes('quadraticCurveTo(-10.5, -22')?1:0" | tail -1); ck "زامبی‌های پس‌زمینه‌ی بازطراحی (بدن خمیده)" "$R"
R=$(agent-browser eval "MG23.cityLayer.toString().includes('cols2') && MG23.cityLayer.toString().includes('top - 8')?1:0" | tail -1); ck "شهر: پنجره‌های شبکه‌ای + پشت‌بام" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots26/t26_intro1.png >/dev/null 2>&1
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5

echo "===== ۵) سامسونگ/ناحیه امن + منو دست‌نخورده ====="
R=$(agent-browser eval "getComputedStyle(document.documentElement).getPropertyValue('--sat-t')!==''?1:0" | tail -1); ck "متغیرهای safe-area تعریف شدند" "$R"
R=$(agent-browser eval "fitWrap.toString().includes('--sat-l')?1:0" | tail -1); ck "fitWrap ناحیه امن را کم می‌کند" "$R"
R=$(agent-browser eval "(()=>{const f=document.querySelector('.m23-foot');return f && f.textContent.includes('۲۶٫۰') && !f.textContent.includes('سازنده') && !f.textContent.includes('مرامی')})()?1:0" | tail -1); ck "منو: فوت فقط نسخه ۲۶ (بدون سازنده)" "$R"
R=$(agent-browser eval "(()=>{const m=document.querySelector('#startScreen');return m && m.innerHTML.includes('شروع داستان')?1:0})()" | tail -1); ck "منوی اصلی سالم" "$R"
R=$(agent-browser eval "document.body.innerText.includes('آخـریـن')?0:1" | tail -1); ck "بدون کشیده‌نویسی عربی" "$R"

echo "===== ۶) صداها — یکپارچگی ====="
R=$(agent-browser eval "typeof VOICES23!=='undefined' && Object.keys(VOICES23).length>=119?1:0" | tail -1); ck "۱۱۹ کلیپ صوتی حفظ شد" "$R" "got=$(agent-browser eval "Object.keys(VOICES23).length" | tail -1)"

echo ""
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ $F -eq 0 ] && echo "همه‌ی تست‌های ۲۶٫۰ گذرنده ✔"
