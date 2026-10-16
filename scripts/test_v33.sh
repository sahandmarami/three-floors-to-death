#!/bin/bash
# تست نسخه‌ی ۳۳٫۰ — موارد باقی‌مانده‌ی بازخورد کاربر:
# ۱) ماشین خودش به چپ نمی‌رود (حذف فرمان شیب گوشی) ۲) رد کردن در مینی‌گیم ممنوع
# ۳) کات‌سین فروریختن: آرش از پله‌ها + ماشین پارک + زیرنویس دیالوگ‌دار + صدا
# ۴) حذف دکمه‌ی شنود → کارت «گوش بسپار» ۵) نام کاشی‌های ساخت‌وساز
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
R=$(agent-browser eval "typeof window.__V33!=='undefined'&&window.__V33.tiltOff&&window.__V33.arashStairs?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "بوت سالم + ماژول v33 فعال" "$R"

echo "===== ۱) فرمان شیب گوشی حذف شده — ماشین خودش نمی‌لغزد ====="
R=$(agent-browser eval "TR={phase:2,t:1,ch:1,subT:0,fade:0,ev:{},_paused:false,outroDurEff:8}; MG.cfg={theme:'drive',speed0:2050,goalM:60,subs:[],hidden:{at:.5,id:'x'},outroDur:8}; DRV.steer=0; DRV.kb=false; try{var ev=new Event('deviceorientation'); ev.gamma=-22; window.dispatchEvent(ev);}catch(e){} DRV.steer===0?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "gamma=-22 → فرمان صفر می‌ماند (قبلاً منفی می‌شد)" "$R"
R=$(agent-browser eval "mgSteer(-0.7); Math.abs(DRV.steer+0.7)<0.01?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "فرمان لمسی/کلیدی هنوز کار می‌کند (mgSteer)" "$R"
R=$(agent-browser eval "DRV.steer=0; TR=null; MG.cfg=null; 1" 2>/dev/null | tail -1 | tr -d '"')
ck "پاک‌سازی وضعیت تست" "$R"

echo "===== ۲) مینی‌گیم قابل رد کردن نیست ====="
R=$(agent-browser eval "TR={phase:2,t:1,ch:1,subT:0,fade:0,ev:{},_paused:false,outroDurEff:8}; var before=TR; try{skipTransition();}catch(e){} var kept=(typeof TR!=='undefined'&&TR===before); TR=null; kept?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "skipTransition در فاز ۲ بی‌اثر است" "$R"
R=$(agent-browser eval "typeof mgBegin!=='undefined'&&mgBegin.toString().indexOf('skipCs')>=0&&typeof mgOutro!=='undefined'&&mgOutro.toString().indexOf('skipCs')>=0?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "mgBegin دکمه را مخفی می‌کند + mgOutro برمی‌گرداند" "$R"

echo "===== ۳) فروریختن برج (انتقال فصل ۱) — آرش از پله‌ها + ماشین پارک ====="
R=$(agent-browser eval "SUBS_INTRO1.some(function(c){return c[2].indexOf('ارشان')>=0})?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "زیرنویس‌های فروریختن دیالوگِ ارشان دارند" "$R"
R=$(agent-browser eval "SUBS_INTRO1.some(function(c){return c[2].indexOf('زمین می‌لرزه')>=0})?0:1" 2>/dev/null | tail -1 | tr -d '"')
ck "زیرنویس قدیمیِ بدون‌شخصیت حذف شد" "$R"
# مسیر واقعی: موج ۶ (پایان فصل ۱) → گفتگوی پایان فصل → انتقال
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(6); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
R=$(agent-browser eval "state.mode==='transition'&&GAME.v10.TR&&GAME.v10.TR.ch===1&&GAME.v10.TR.phase===1?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "پایان موج ۶ → انتقال فصل ۱ فاز ۱ (فروریختن)" "$R"
agent-browser eval "GAME.v10.trGoto(2.5); 'ok'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ev.arash&&GAME.v10.TR.ev.arash.st==='stairs'?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=2.5s: ارشان در حال پایین‌آمدن از پله‌ها" "$R"
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ev.arash.y>TOWER_TOP_Y+30?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "ارشان واقعاً پایین آمده (y > بام+۳۰)" "$R"
R=$(agent-browser eval "CS&&CS.car&&Math.abs(CS.car.x-(TOWER.x-205))<30?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=2.5s: ماشین هنوز پارک کنار برج (نه ورود از لبه)" "$R"
agent-browser eval "GAME.v10.trGoto(4.8); 'ok'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ev.arash.st==='run'?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=4.8s: ارشان می‌دود سمت ماشین" "$R"
agent-browser eval "GAME.v10.trGoto(6.5); 'ok'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ev.arash.st==='in'?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=6.5s: ارشان سوار ماشین شد" "$R"
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ev.catchBark?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "بارک «گرفتمت» بعد از فرود بازیکن شلیک شد (t>5.85)" "$R"
R=$(agent-browser eval "CS&&CS.car&&Math.abs(CS.car.x-330)<40?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=6.5s: ماشین زیر برج (x≈330 کنار بازیکن فرودآمده)" "$R"
agent-browser eval "GAME.v10.trGoto(8.2); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.phase===2&&MG.cfg&&MG.cfg.theme==='drive'?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "t=8.2s: مینی‌گیم رانندگی شروع شد (theme=drive)" "$R"
R=$(agent-browser eval "document.getElementById('skipCs').classList.contains('hidden')?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "در مینی‌گیم دکمه‌ی «رد کردن» مخفی است" "$R"
# خروج تمیز از انتقال (skip در فاز ۲ ممنوع است → پایان طبیعی)
agent-browser eval "GAME.v10.trResume(); if(TR){TR._paused=false;} try{finishTransition()}catch(e){} 'ok'" >/dev/null 2>&1
sleep 1.5
agent-browser eval "if(GAME.v10.TR){GAME.v10.TR._paused=false;} 'ok'" >/dev/null 2>&1

echo "===== ۴) حذف دکمه‌ی شنود → کارت «گوش بسپار» ====="
R=$(agent-browser eval "typeof MYST!=='undefined'&&MYST._listenBtn?getComputedStyle(MYST._listenBtn).display==='none'?1:0:1" 2>/dev/null | tail -1 | tr -d '"')
ck "دکمه‌ی شناور شنود نمایش داده نمی‌شود" "$R"
R=$(agent-browser eval "(()=>{try{MYST.openArchive();}catch(e){return 'err'} const p=document.getElementById('clueSheet34'); if(!p) return 'npx'; const h=p.innerHTML; const ok=h.indexOf('گوش بسپار')>=0&&h.indexOf('listen')>=0?1:0; try{closeSheet34()}catch(e){} return ok})()" 2>/dev/null | tail -1 | tr -d '"')
ck "کارت «گوش بسپار» در پرونده‌ی سرنخ‌ها (باتن‌شیت v34) هست" "$R"
R=$(agent-browser eval "var b=document.getElementById('listenBtn'); !b||getComputedStyle(b).display==='none'?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "rail چپ: فقط چراغ‌قوه + مولوتوف (بدون دایره‌ی سوم)" "$R"

echo "===== ۵) نام کاشی‌های ساخت‌وساز ====="
agent-browser eval "var bp=document.getElementById('buildPanel'); if(!bp||bp.classList.contains('collapsed')){try{toggleBuildPanel()}catch(e){}} 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(agent-browser eval "document.querySelectorAll('#bpList .bp-name').length===BUILD_DEFS.filter(function(d){return d.tab!=='wpn'}).length?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "همه‌ی کاشی‌ها به‌جز سلاح‌ها برچسب نام دارند (v34)" "$R"
R=$(agent-browser eval "var els=document.querySelectorAll('#bpList .bp-name'); var ok=1; for(var i=0;i<els.length;i++){if(!els[i].textContent.trim()){ok=0;break}} ok" 2>/dev/null | tail -1 | tr -d '"')
ck "هیچ نامی خالی نیست (تب بقا: همه نام‌دار)" "$R"
R=$(agent-browser eval "var n=document.querySelector('#bpList .bp-name'); var r=n.getBoundingClientRect(); r.height>6?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "نام کاشی واقعاً مرئی است (ارتفاع > 6px)" "$R"
R=$(agent-browser eval "var nm=[].map.call(document.querySelectorAll('#bpList .bp-name'),function(e){return e.textContent.trim()}); nm.indexOf('کیت کمک‌های اولیه')>=0&&nm.indexOf('چراغ‌قوه')>=0?1:0" 2>/dev/null | tail -1 | tr -d '"')
ck "نام‌های سراغ بقا: «کیت کمک‌های اولیه» و «چراغ‌قوه»" "$R"

echo
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
if [ "$F" = "0" ]; then echo "ALL GREEN ✔"; fi
agent-browser close --all >/dev/null 2>&1
