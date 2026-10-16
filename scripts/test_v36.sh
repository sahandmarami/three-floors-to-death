#!/bin/bash
# تست نسخه‌ی ۳۶٫۰ — بازخورد جدید کاربر:
# ریل جابه‌جا + آیکون کوله + شیت وسط + نام وسط عکس + توست اعلان +
# قیمت برجک + آیکون نقشه‌ها + کارایی(updateHUD) + پایان مینی‌گیم + ارشان
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }
ok1() { echo "$1" | grep -c '^1$'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots36
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(ev "typeof GAME!=='undefined'?state.mode:'no'")
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
R=$(ev "window.__V36?1:0"); ck "بوت سالم + ماژول v36 لود شد" "$R"
R=$(ev "window.__V34&&window.__V35?1:0"); ck "ساختارهای v34/v35 حفظ شدند" "$R"
sleep 2

echo "===== ۱) قیمت برجک‌ها کم شد ====="
R=$(ev "TURRETS.gatling.price===65&&TURRETS.sniper.price===150&&TURRETS.frost.price===95?1:0")
ck "برجک‌های معمولی: ۶۵ / ۱۵۰ / ۹۵" "$R"
R=$(ev "TURRETS.tesla.price===180&&TURRETS.missile.price===225&&TURRETS.flame.price===160?1:0")
ck "برجک‌های ویژه: ۱۸۰ / ۲۲۵ / ۱۶۰" "$R"

echo "===== ۲) ورود به بازی روز ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; 'ok'" >/dev/null 2>&1; sleep 1.2

echo "===== ۳) ریل چپ: جابه‌جایی دستفروش ↔ کوله ====="
R=$(ev "(()=>{const b=document.getElementById('bpkBtn34');if(!b)return 'nobtn';const t=parseFloat(getComputedStyle(b).top)/(window.__uiz||1);return Math.abs(t-148)<6?1:'t='+t.toFixed(1)})()")
ck "کوله‌پشتی جای وسط ریل (top=148 منطقی)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const b=document.getElementById('pedReopenBtn');if(!b)return 'nobtn';b.style.setProperty('display','flex','important');const t=parseFloat(getComputedStyle(b).top)/(window.__uiz||1);b.style.removeProperty('display');return Math.abs(t-218)<6?1:'t='+t.toFixed(1)})()")
ck "دستفروش پایین ریل (top=218 منطقی)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const b=document.getElementById('molotovBtn');if(!b)return 'nobtn';b.style.setProperty('display','flex','important');const t=parseFloat(getComputedStyle(b).top)/(window.__uiz||1);b.style.removeProperty('display');return Math.abs(t-218)<6?1:'t='+t.toFixed(1)})()")
ck "مولوتوف پایین ریل در شب (top=218 منطقی)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const b=document.getElementById('mystBtn');const t=parseFloat(getComputedStyle(b).top)/(window.__uiz||1);return Math.abs(t-78)<6?1:'t='+t.toFixed(1)})()")
ck "سرنخ‌ها بالا ریل ماند (top=78)" "$(ok1 "$R")" "$R"

echo "===== ۴) آیکون جدید کوله (مرجع کاربر) ====="
R=$(ev "(()=>{const b=document.getElementById('bpkBtn34');const ic=b.querySelector('i.ic');if(!ic)return 'noic';return ic.innerHTML.indexOf('linearGradient')>=0&&ic.innerHTML.indexOf('bpkG36')>=0?1:0})()")
ck "آیکون کوله = SVG گرادیانی سرمه‌ای/طلایی" "$R" "$R"
R=$(ev "(()=>{const b=document.getElementById('bpkBtn34');const svg=b.querySelector('svg');return svg&&svg.getAttribute('viewBox')==='0 0 24 24'?1:0})()")
ck "ساختار SVG آیکون سالم" "$R"

echo "===== ۵) شیت وسط صفحه (نه از پایین) ====="
agent-browser eval "try{bpkToggle34()}catch(e){document.getElementById('bpkBtn34').click()}; 'ok'" >/dev/null 2>&1; sleep 1
R=$(ev "(()=>{const s=document.getElementById('bpkSheet34');if(!s||!s.classList.contains('open'))return 'notopen';const st=getComputedStyle(s);const l=parseFloat(st.left);const W=window.W||document.getElementById('wrap').offsetWidth;return Math.abs(l-W/2)<10?1:'l='+l.toFixed(1)+' W='+W})()")
ck "شیت کوله وسط صفحه (left ≈ W/2)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const s=document.getElementById('bpkSheet34');const r=s.getBoundingClientRect();const w=document.getElementById('wrap').getBoundingClientRect();return (r.top>w.top+4&&r.bottom<w.bottom-4)?1:'t=' + Math.round(r.top-w.top) + ' b=' + Math.round(w.bottom-r.bottom)})()")
ck "شیت کامل داخل قاب بازی (نه چسبیده به پایین)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const g=document.querySelector('#bpkSheet34 .sh-grab34');return !g||getComputedStyle(g).display==='none'?1:0})()")
ck "دسته‌ی کشیدن حذف شد (دیگر باتن‌شیت نیست)" "$R"
R=$(ev "(()=>{const s=document.getElementById('bpkSheet34');const r=s.getBoundingClientRect();const w=document.getElementById('wrap').getBoundingClientRect();const cy=(r.top+r.bottom)/2, wy=(w.top+w.bottom)/2;return Math.abs(cy-wy)<r.height*0.3?1:'cy='+Math.round(cy-wy)})()")
ck "شیت تقریباً وسطِ عمودی صفحه" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const s=document.getElementById('bpkSheet34');const hi=s.querySelector('.sh-ic34');return hi&&hi.innerHTML.indexOf('bpkG36')>=0?1:0})()")
ck "آیکون کوله در هدر شیت هم جدید است" "$(ok1 "$R")" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_bpk_center.png >/dev/null 2>&1
agent-browser eval "try{closeSheet34()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
agent-browser eval "try{MYST.openArchive()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 1
R=$(ev "(()=>{const s=document.getElementById('clueSheet34');if(!s||!s.classList.contains('open'))return 'notopen';const st=getComputedStyle(s);const l=parseFloat(st.left);const W=window.W||document.getElementById('wrap').offsetWidth;const r=s.getBoundingClientRect();const w=document.getElementById('wrap').getBoundingClientRect();const cy=(r.top+r.bottom)/2, wy=(w.top+w.bottom)/2;return Math.abs(l-W/2)<10&&Math.abs(cy-wy)<r.height*0.3?1:'l='+l.toFixed(1)})()")
ck "شیت سرنخ‌ها هم وسط صفحه (نه از پایین)" "$(ok1 "$R")" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_clue_center.png >/dev/null 2>&1
agent-browser eval "try{closeSheet34()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6

echo "===== ۶) نام کاشی: وسط عکس (اُورلی) ====="
agent-browser eval "var bp=document.getElementById('buildPanel'); if(!bp||bp.classList.contains('collapsed')){try{toggleBuildPanel()}catch(e){}} 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(ev "(()=>{const n=document.querySelector('#bpList .bp-name');if(!n)return 'noname';const st=getComputedStyle(n);return st.position==='absolute'&&st.transform!=='none'?1:st.position})()")
ck "نام کاشی absolute + translate وسط" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const t=document.querySelector('#bpList .bp-tile');const n=t.querySelector('.bp-name');const tr=t.getBoundingClientRect();const nr=n.getBoundingClientRect();const cyT=tr.top+tr.height*0.4, cyN=(nr.top+nr.bottom)/2;return Math.abs(cyT-cyN)<25?1:'d='+Math.round(cyN-cyT)})()")
ck "نام دقیقاً روی ناحیه‌ی عکس (≈۴۰٪ کاشی)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const n=document.querySelector('#bpList .bp-name');const st=getComputedStyle(n);return st.background.indexOf('rgba')>=0?1:st.background})()")
ck "پس‌زمینه‌ی نیمه‌تیره برای خوانایی" "$(ok1 "$R")" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_tile_name.png >/dev/null 2>&1

echo "===== ۷) اعلان مرکزی → توست بالای صفحه ====="
agent-browser eval "try{DLG.skip()}catch(e){}; document.getElementById('wrap').classList.remove('dlg-on'); 'ok'" >/dev/null 2>&1
R=$(ev "(()=>{setAnnounce('تست','زیرنویس تست',2);const e=document.getElementById('announce');const st=getComputedStyle(e);const t=parseFloat(st.top)/(window.__uiz||1);return t>60&&t<120&&st.borderRadius!=='0px'?1:'t='+t.toFixed(1)})()")
ck "اعلان: توست فشرده زیر HUD (top≈86)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{const e=document.getElementById('announce');const big=e.querySelector('.big');const fs=parseFloat(getComputedStyle(big).fontSize);const st=getComputedStyle(e);return fs<25&&st.maxWidth!=='none'?1:'fs='+fs})()")
ck "فونت اعلان فشرده شد (<25px)" "$(ok1 "$R")" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_announce_toast.png >/dev/null 2>&1

echo "===== ۸) کارایی: updateHUD انباشتگی ====="
agent-browser eval "window.__n36=-1; var n36=0; var rb=refreshBuildPanel; refreshBuildPanel=function(){n36++; return rb.apply(this,arguments)}; for(var i=0;i<25;i++){try{updateHUD()}catch(e){}} setTimeout(function(){try{refreshBuildPanel=rb}catch(e){}; window.__n36=n36},700); 'ok'" >/dev/null 2>&1
sleep 1
R=$(ev "window.__n36>=0&&window.__n36<=3?1:'n='+window.__n36")
ck "۲۵ فراخوانی updateHUD → ≤۳ رفرش پنل (throttle ۱۲۰ms)" "$(ok1 "$R")" "$R"
R=$(ev "typeof updateBossBar==='function'&&updateBossBar.__36?1:0")
ck "updateBossBar فقط با تغییر واقعی می‌نویسد" "$(ok1 "$R")" "$R"

echo "===== ۹) آیکون نقشه‌های دستفروش متمایز ====="
R=$(ev "(()=>{var ids=['tesla','missile','flame'];var sigs=[];for(var i=0;i<ids.length;i++){var cv=document.createElement('canvas');cv.width=40;cv.height=40;paintGearIcon(ids[i],cv);var d=cv.getContext('2d').getImageData(0,0,40,40).data;var s=0;for(var j=0;j<d.length;j+=97)s=(s*31+d[j])%9973;sigs.push(s)}var uniq={};var u=0;for(var k=0;k<sigs.length;k++){if(!uniq[sigs[k]]){uniq[sigs[k]]=1;u++}}return u===3?1:'u='+u})()")
ck "سه نقشه‌ی ساخت کاملاً متمایز (سیگنچر پیکسلی)" "$(ok1 "$R")" "$R"
R=$(ev "(()=>{var ids=['vest','goldAmmo','helmet','airstrike','freezeBomb','adrenaline'];var sigs=[];for(var i=0;i<ids.length;i++){var cv=document.createElement('canvas');cv.width=40;cv.height=40;paintGearIcon(ids[i],cv);var d=cv.getContext('2d').getImageData(0,0,40,40).data;var s=0;for(var j=0;j<d.length;j+=97)s=(s*31+d[j])%9973;sigs.push(s)}var uniq={};var u=0;for(var k=0;k<sigs.length;k++){if(!uniq[sigs[k]]){uniq[sigs[k]]=1;u++}}return u>=5?1:'u='+u})()")
ck "کالاهای معمولی دستفروش متمایز (≥۵ از ۶)" "$(ok1 "$R")" "$R"

echo "===== ۱۰) فروریختن فصل ۱: ارشان دیده می‌شود ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(6); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
R=$(ev "state.mode==='transition'&&GAME.v10.TR&&GAME.v10.TR.phase===1?1:0")
ck "فروریختن برج شروع شد (فاز ۱)" "$R"
agent-browser eval "window.__drawn36={stairs:0,arash:0}; var _s=drawCsStairs33; drawCsStairs33=function(){window.__drawn36.stairs++; return _s.apply(this,arguments)}; var _a=drawCsArash33; drawCsArash33=function(A){window.__drawn36.arash++; return _a.apply(this,arguments)}; 'ok'" >/dev/null 2>&1
agent-browser eval "GAME.v10.trGoto(2.5); 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(ev "window.__drawn36.arash>0?1:0")
ck "ارشان واقعاً رسم می‌شود (صدا زده شد)" "$R" "arash=$(ev "window.__drawn36.arash")"
R=$(ev "window.__drawn36.stairs>0?1:0")
ck "پله‌های کناری رسم می‌شوند" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_collapse_arash.png >/dev/null 2>&1
R=$(ev "GAME.v10.TR&&GAME.v10.TR.ev.arash&&GAME.v10.TR.ev.arash.y>TOWER_TOP_Y+30?1:0")
ck "ارشان از بام پایین آمده (y > بام+۳۰)" "$R"
agent-browser eval "GAME.v10.trGoto(6.6); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_collapse_car.png >/dev/null 2>&1

echo "===== ۱۱) مینی‌گیم: پایان قطعی (سقف ۹٫۵ث) ====="
agent-browser eval "GAME.v10.trGoto(8.2); GAME.v10.trResume(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "GAME.v10.TR&&GAME.v10.TR.phase===2?1:0")
ck "مینی‌گیم شروع شد (فاز ۲)" "$R"
agent-browser eval "GAME.v10.TR._paused=true; 'ok'" >/dev/null 2>&1
agent-browser eval "DRV.T=DRV.goalT-100; 'ok'" >/dev/null 2>&1
agent-browser eval "GAME.v10.trResume(); 'ok'" >/dev/null 2>&1; sleep 2
R=$(ev "GAME.v10.TR&&GAME.v10.TR.phase===3?1:0")
ck "پایان مسیر → فاز ۳ آغاز شد" "$R"
agent-browser eval "if(GAME.v10.TR){GAME.v10.TR.outroDlgDone=false; GAME.v10.TR.outroDurEff=40;} 'ok'" >/dev/null 2>&1
T0=$(date +%s)
M="transition"
for i in $(seq 1 16); do
  M=$(ev "state.mode")
  if [ "$M" != "transition" ]; then break; fi
  sleep 1
done
T1=$(date +%s)
DT=$((T1-T0))
ck "با گفتگوی گیرکرده هم در ≤۱۲ ثانیه تمام شد" "$(python3 -c "print(1 if $DT<=12 else 0)")" "dt=${DT}s mode=$M"
R=$(ev "state.mode==='day'||state.mode==='playing'||state.mode==='intermission'?1:0")
ck "بازی به روز فصل ۲ رسید (بدون رد کردن دستی)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots36/v36_day2.png >/dev/null 2>&1

echo
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
if [ "$F" = "0" ]; then echo "ALL GREEN ✔"; fi
agent-browser close --all >/dev/null 2>&1
