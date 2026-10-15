#!/bin/bash
# تست نسخه‌ی ۳۴٫۰ — بازسازی کامل:
# ۱) ریل چپ: سه دایره‌ی هم‌سایز دقیقاً زیر هم (روز و شب)
# ۲) پرونده‌ی سرنخ‌ها = باتن‌شیت اندرویدی + ساخت مولوتوف بدون سیل متن
# ۳) کوله‌پشتی تعاملی: دکمه + باتن‌شیت مصرف
# ۴) تنظیمات/درباره بدون اسکرول
# ۵) سلاح‌ها بدون نام + بدون سرریز نام بقا
# ۶) منوی روشن‌تر + زامبی درشت‌تر
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "window.__V34&&window.__V34.flags===1?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "بوت سالم + ماژول v34 فعال" "$R"

to_day() {
  agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
  agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.6
  agent-browser eval "GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 2.5
  agent-browser eval "typeof DLG!=='undefined'&&DLG.active?DLG.skip():0; state.mode='day'; state.dayTarget=1; state.zombies=[]; state.spawn.queue=[]; 'ok'" >/dev/null 2>&1; sleep 1
}

echo "===== ۱) ریل چپ — سه دایره‌ی هم‌سایز دقیقاً زیر هم ====="
to_day
R=$(agent-browser eval "(()=>{const uiz=window.__uiz||1; const ids=['mystBtn','bpkBtn34']; const rs=ids.map(i=>document.getElementById(i).getBoundingClientRect()); const sameW=Math.abs(rs[0].width-rs[1].width)<0.5; const sameX=Math.abs(rs[0].x-rs[1].x)<0.5; const gap=(rs[1].y-rs[0].y)/(window.__fitScale||1); const round=getComputedStyle(document.getElementById('mystBtn')).borderRadius==='50%'; return sameW&&sameX&&Math.abs(gap-140*uiz)<4&&round?1:0})()" 2>/dev/null | tail -1)
ck "روز: سرنخ+کوله هم‌سایز/هم‌محور روی شبکه‌ی ۷۰px (۲ اسلات)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('mystBtn'); return getComputedStyle(b).display==='flex'?1:0})()" 2>/dev/null | tail -1)
ck "دکمه‌ی سرنخ‌ها در روزِ بی‌سرنخ هم دیده می‌شود (رفع باگ پنهانی)" "$R"
agent-browser eval "GAME.skipToWave(3); 'night'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "typeof DLG!=='undefined'&&DLG.active?DLG.skip():0; 'ok'" >/dev/null 2>&1
agent-browser eval "MYST.molotovs=2; 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "(()=>{const uiz=window.__uiz||1; const ids=['ctlFlash','molotovBtn','bpkBtn34']; const rs=ids.map(i=>{const e=document.getElementById(i); return e?e.getBoundingClientRect():null}); if(rs.some(r=>!r||r.width===0)) return 0; const sameW=rs.every(r=>Math.abs(r.width-rs[0].width)<0.5); const sameX=rs.every(r=>Math.abs(r.x-rs[0].x)<0.5); const g1=(rs[1].y-rs[0].y)/(window.__fitScale||1); const g2=(rs[2].y-rs[1].y)/(window.__fitScale||1); return sameW&&sameX&&Math.abs(g1-70*uiz)<3&&Math.abs(g2-70*uiz)<3?1:0})()" 2>/dev/null | tail -1)
ck "شب: چراغ‌قوه+مولوتوف+کوله — سه دایره‌ی یکدست (۷۰×uiz فاصله)" "$R"
R=$(agent-browser eval "(()=>{const e=document.getElementById('molotovBtn'); const b=e.querySelector('.rl-badge34'); return b&&/۲/.test(b.textContent)?1:0})()" 2>/dev/null | tail -1)
ck "نشان عددی مولوتوف روی دکمه (۲)" "$R"
R=$(agent-browser eval "(()=>{const e=document.getElementById('listenBtn'); return !e||getComputedStyle(e).display==='none'?1:0})()" 2>/dev/null | tail -1)
ck "دایره‌ی چهارم (شنود) وجود ندارد" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('backpackBar'); return getComputedStyle(b).display==='none'?1:0})()" 2>/dev/null | tail -1)
ck "نوار قدیمی کوله حذف شده (جای آن دکمه‌ی ریل)" "$R"

echo "===== ۲) پرونده‌ی سرنخ‌ها — باتن‌شیت + مولوتوف بدون سیل متن ====="
agent-browser eval "GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "typeof DLG!=='undefined'&&DLG.active?DLG.skip():0; state.mode='day'; state.dayTarget=1; MYST.molotovs=0; 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.coins=200; MYST.openArchive(); 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(agent-browser eval "(()=>{const p=document.getElementById('clueSheet34'); return p&&p.classList.contains('open')&&p.classList.contains('in34')?1:0})()" 2>/dev/null | tail -1)
ck "باتن‌شیت سرنخ‌ها باز و کامل بالا آمده" "$R"
R=$(agent-browser eval "(()=>{const bk=document.getElementById('sheetBk34'); return bk&&bk.classList.contains('open')?1:0})()" 2>/dev/null | tail -1)
ck "اسکریم پشت باتن‌شیت فعال (الگوی اندروید)" "$R"
ANN34=$(agent-browser eval "(()=>{document.querySelector('#clueSheet34 [data-act=molo]').click(); return 'b1'})()" >/dev/null 2>&1; sleep 0.3; agent-browser eval "(()=>{document.querySelector('#clueSheet34 [data-act=molo]').click(); const a=document.getElementById('announceBig').textContent; const sub=document.getElementById('announceSub').textContent; return (a+'|'+sub)})()" 2>/dev/null | tail -1)
sleep 0.3
R=$(agent-browser eval "MYST.molotovs===2?1:0" 2>/dev/null | tail -1)
ck "دو بار خرید مولوتوف (۴۵ سکه×۲)" "$R" "molotovs=$(agent-browser eval "MYST.molotovs" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const c=document.getElementById('moloCnt34'); return c&&c.textContent.indexOf('۲')>=0?1:0})()" 2>/dev/null | tail -1)
ck "شمارنده‌ی کارت به «۲ از ۳» رسید (فقط عدد عوض می‌شود)" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('clueSheet34').innerText.length; return t>0&&t<450?1:0})()" 2>/dev/null | tail -1)
ck "بدون سیل متن: کل متن باتن‌شیت < ۴۵۰ کاراکتر" "$R" "len=$(agent-browser eval "document.getElementById('clueSheet34').innerText.length" 2>/dev/null | tail -1)"
R=$(echo "$ANN34" | grep -q "مولوتوف" && [ $(echo "$ANN34" | awk -F'|' '{print length($2)}') -lt 25 ] && echo 1 || echo 0)
ck "اعلان کوتاه «مولوتوف X/۳» (زیرمتن ≤ ۲۵ کاراکتر)" "$R" "ann=$(echo $ANN34)"
R=$(agent-browser eval "(()=>{const cards=document.querySelectorAll('#clueSheet34 .rc34').length; return cards>=4?1:0})()" 2>/dev/null | tail -1)
ck "کارت‌های لمسی بقا/معما ≥ ۴ عدد" "$R"
agent-browser eval "try{closeSheet34()}catch(e){}; 'closed'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const p=document.getElementById('clueSheet34'); const bk=document.getElementById('sheetBk34'); return (!p||!p.classList.contains('open'))&&(!bk||!bk.classList.contains('open'))?1:0})()" 2>/dev/null | tail -1)
ck "بستن باتن‌شیت (دکمه/اسکریم) کار می‌کند" "$R"

echo "===== ۳) کوله‌پشتی تعاملی ====="
agent-browser eval "state.coins=300; buyGear('medkit'); buyGear('battery'); 'buy'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const n=state.backpack.filter(s=>s).length; const b=document.getElementById('bpkBtn34'); const em=b.querySelector('.rl-badge34'); return n===2&&em&&/۲/.test(em.textContent)?1:0})()" 2>/dev/null | tail -1)
ck "خرید ۲ وسیله → نشان «۲» روی دکمه‌ی کوله" "$R"
agent-browser eval "bpkToggle34(); 'open'" >/dev/null 2>&1; sleep 0.7
R=$(agent-browser eval "(()=>{const p=document.getElementById('bpkSheet34'); return p&&p.classList.contains('in34')?1:0})()" 2>/dev/null | tail -1)
ck "باتن‌شیت کوله باز می‌شود (مثل ساخت‌وساز)" "$R"
R=$(agent-browser eval "(()=>{const cards=document.querySelectorAll('#bpkSheet34 .bk34[data-i]').length; const uses=document.querySelectorAll('#bpkSheet34 .bk-use34').length; return cards===2&&uses===2?1:0})()" 2>/dev/null | tail -1)
ck "کارت‌های مصرف با دکمه‌ی «مصرف» برای وسایل" "$R"
agent-browser eval "document.querySelector('#bpkSheet34 .bk34[data-i=\"0\"] .bk-use34').click(); 'use'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "state.backpack.filter(s=>s).length" 2>/dev/null | tail -1)
ck "مصرف وسیله از پنل کار می‌کند (۱ باقی می‌ماند)" "$R" "left=$(echo $R)"
R=$(agent-browser eval "(()=>{const em=document.getElementById('bpkBtn34').querySelector('.rl-badge34'); return em&&/۱/.test(em.textContent)?1:0})()" 2>/dev/null | tail -1)
ck "نشان دکمه به «۱» به‌روز شد" "$R"
agent-browser eval "try{closeSheet34()}catch(e){}; 'ok'" >/dev/null 2>&1

echo "===== ۴) تنظیمات/درباره — بدون اسکرول ====="
agent-browser eval "pauseGame(); showScreen('settingsScreen'); 'ok'" >/dev/null 2>&1; sleep 0.6
R=$(agent-browser eval "(()=>{const c=document.querySelector('#settingsScreen .m27-card'); return c.scrollHeight<=c.clientHeight+2?1:0})()" 2>/dev/null | tail -1)
ck "تنظیمات بدون اسکرول (محتوا ≤ کارت)" "$R"
R=$(agent-browser eval "(()=>{const g=document.querySelectorAll('#settingsScreen .m27-grid34 .m27-row').length; const a=document.querySelectorAll('#settingsScreen .m27-acts34 .m27-btn').length; return g===4&&a===2?1:0})()" 2>/dev/null | tail -1)
ck "شبکه‌ی ۲ستونه + دو دکمه‌ی کنار هم" "$R"
agent-browser eval "hideScreen(); showScreen('aboutScreen'); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const c=document.querySelector('#aboutScreen .m27-card'); return c.scrollHeight<=c.clientHeight+2?1:0})()" 2>/dev/null | tail -1)
ck "درباره بدون اسکرول" "$R"
agent-browser eval "hideScreen(); resumeGame(); 'ok'" >/dev/null 2>&1

echo "===== ۵) سلاح‌ها بدون نام + بقا بدون سرریز ====="
agent-browser eval "state.mode='day'; toggleBuildPanel(); setBPTab('wpn', true); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const vis=Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none'); const withName=vis.filter(t=>t.querySelector('.bp-name')); return vis.length===3&&withName.length===0?1:0})()" 2>/dev/null | tail -1)
ck "تب سلاح‌ها: ۳ کاشی بدون هیچ نامی" "$R"
agent-browser eval "setBPTab('sur', true); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const vis=Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none'); const withName=vis.filter(t=>t.querySelector('.bp-name')); const ovf=vis.some(t=>{const n=t.querySelector('.bp-name'); return n&&n.scrollWidth>t.clientWidth+1}); return withName.length===4&&!ovf?1:0})()" 2>/dev/null | tail -1)
ck "تب بقا: ۴ کاشی نام‌دار، صفر سرریز (کیت اولیه فیکس)" "$R"

echo "===== ۶) منوی اصلی — روشن‌تر + زامبی درشت ====="
agent-browser eval "exitToMenu(); 'menu'" >/dev/null 2>&1; sleep 2
R=$(agent-browser eval "state.mode==='start'?1:0" 2>/dev/null | tail -1)
ck "بازگشت به منوی اصلی" "$R"
R=$(agent-browser eval "(()=>{const d=M23.draw.toString(); return d.indexOf('#161c40')>=0&&d.indexOf('#252a52')>=0&&d.indexOf('#4c2740')>=0?1:0})()" 2>/dev/null | tail -1)
ck "پالت آسمان‌ِ منو روشن‌تر شد (کدهای جدید v34)" "$R"
R=$(agent-browser eval "(()=>{const z=M23.zmb; return z.length>=6&&z.every(x=>x.d>=0.55)?1:0})()" 2>/dev/null | tail -1)
ck "زامبی‌های منو درشت‌تر (عمق ≥ ۰٫۵۵)" "$R"
R=$(agent-browser eval "(()=>{return M23.drawSilZombie.toString().indexOf('quadraticCurveTo')>=0&&M23.drawSilZombie.toString().indexOf('reach')>=0?1:0})()" 2>/dev/null | tail -1)
ck "زامبی جدید: خمیده + بازوی درازکش (v34)" "$R"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
if [ "$F" = "0" ]; then echo "ALL GREEN ✔"; else echo "FAILURES: $F"; fi
