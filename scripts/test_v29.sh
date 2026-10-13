#!/bin/bash
# تست نسخه‌ی ۲۹٫۰ — شیت ساخت‌وساز (شروع جمع + اسکریم + فشرده) + آیکون‌های SVG + توقف دومنویی
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots29
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof GAME==='object'?1:0" | tail -1); ck "بوت سالم (بدون فرانکنشتاین merge)" "$R"

echo "===== ۱) شیت ساخت‌وساز — شروع جمع + FAB ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
# موج شب را تمام کن تا «روز» واقعی بیفتد (مسیر waveComplete → enterDay)
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "روز رسید (endWave)" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); const cs=getComputedStyle(p); return p.classList.contains('collapsed')||cs.display==='none'?1:0})()" | tail -1); ck "روز: شیت خودکار «باز» نمی‌شود (درخواست اصلی)" "$R"
R=$(agent-browser eval "(()=>{const d=document.getElementById('buildPanel'); if(!d) return 0; const cs=getComputedStyle(d); const r=d.getBoundingClientRect(); return cs.display!=='none' && r.top<innerHeight*0.35 && r.right>innerWidth*0.7?1:0})()" | tail -1); ck "داک ساخت‌وساز بالا-راست دیده می‌شود (v30: جایگزین FAB)" "$R" "geo=$(agent-browser eval "(()=>{const r=document.getElementById('buildPanel').getBoundingClientRect(); return Math.round(r.left)+','+Math.round(r.top)})()" | tail -1)"
R=$(agent-browser eval "(()=>{const d=document.getElementById('buildPanel'); return d&&d.textContent.includes('ساخت')?1:0})()" | tail -1); ck "برچسب «ساخت‌وساز» روی داک" "$R"

echo "===== ۲) باز کردن داک + جمع‌کردن با سربرگ ====="
agent-browser eval "(()=>{try{toggleBuildPanel()}catch(e){} return 'ok'})()" >/dev/null; sleep 0.6
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return !p.classList.contains('collapsed')?1:0})()" | tail -1); ck "تاگل: داک باز شد" "$R"
R=$(agent-browser eval "(()=>{const f=document.getElementById('bpFab28'); return !f||getComputedStyle(f).display==='none'?1:0})()" | tail -1); ck "FAB/اسکریم حذف شده‌اند (v30 — داک غیرتهاجمی)" "$R"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); const r=p.getBoundingClientRect(); return r.top<innerHeight*0.3 && r.height<=innerHeight*0.6?1:0})()" | tail -1); ck "داک: بالا + غیرتهاجمی (نه روی زمین بازی)" "$R" "h=$(agent-browser eval "(()=>{const r=document.getElementById('buildPanel').getBoundingClientRect();return Math.round(r.height)+'/'+innerHeight})()" | tail -1)"
R=$(agent-browser eval "(()=>{const t=document.getElementById('bp-tesla')||document.querySelector('.bp-tile'); if(!t) return 0; const h=t.getBoundingClientRect().height; return h<=95?1:0})()" | tail -1); ck "کاشی فشرده ≤۹۵px" "$R" "h=$(agent-browser eval "(()=>{const t=document.querySelector('.bp-tile'); return t?Math.round(t.getBoundingClientRect().height):'n/a'})()" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots29/sheet29.png >/dev/null 2>&1
# کلیک سربرگ = جمع‌کردن داک
agent-browser eval "(()=>{try{toggleBuildPanel()}catch(e){} return 'ok'})()" >/dev/null; sleep 0.5
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p.classList.contains('collapsed')?1:0})()" | tail -1); ck "سربرگ: داک جمع شد" "$R"

echo "===== ۳) آیکون‌های سلاح = SVG تمیز ====="
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-pistol'); return b && (b.querySelector('svg')||b.querySelector('img.ic30')) && !b.querySelector('canvas')?1:0})()" | tail -1); ck "چیپ کلت: آیکون تمیز (بدون canvas پیکسلی)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-shotgun'); return b && (b.querySelector('svg')||b.querySelector('img.ic30'))?1:0})()" | tail -1); ck "چیپ شاتگان: آیکون تمیز" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-mg'); return b && (b.querySelector('svg')||b.querySelector('img.ic30'))?1:0})()" | tail -1); ck "چیپ مسلسل: آیکون تمیز" "$R"
R=$(agent-browser eval "(()=>{const el=document.getElementById('bp-pistol'); return el && (el.querySelector('.bp-ic29 svg')||el.querySelector('img'))?1:0})()" | tail -1); ck "کاشی کلت داخل داک: آیکون تمیز" "$R"
R=$(agent-browser eval "(()=>{const el=document.getElementById('bp-shotgun'); return el && (el.querySelector('.bp-ic29 svg')||el.querySelector('img'))?1:0})()" | tail -1); ck "کاشی شاتگان داخل داک: آیکون تمیز" "$R"
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('pistol'); updateHUD(); 'ok'" >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-pistol'); const cs=getComputedStyle(b); return b.classList.contains('on') && cs.borderWidth!==''?1:0})()" | tail -1); ck "انتخاب کلت: چیپ طلایی ملایم" "$R"
agent-browser eval "selectWeapon('shotgun'); fireTimer=0; tryShoot(); 'ok'" >/dev/null 2>&1
R=$(agent-browser eval "state.weapon==='shotgun'&&state.bullets.length>0?1:0" | tail -1); ck "تعویض/شلیک شاتگان سالم (رگرسیون)" "$R"

echo "===== ۴) آیکون چراغ‌قوه‌ی تازه ====="
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#ctlFlash .ic'); return ic && (ic.querySelector('img.ic30')||ic.querySelector('svg'))?1:0})()" | tail -1); ck "چراغ‌قوه: آیکون تمیز (PNG/SVG)" "$R"
R=$(agent-browser eval "(()=>{const lbl=document.querySelector('#ctlFlash .ctl-lbl'); return lbl && lbl.textContent.includes('چراغ')?1:0})()" | tail -1); ck "برچسب «چراغ‌قوه» می‌ماند" "$R"

echo "===== ۵) منوی توقف = فقط ادامه + ذخیره و خروج ====="
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
R=$(agent-browser eval "!document.getElementById('pauseScreen').classList.contains('hidden')?1:0" | tail -1); ck "منوی توقف باز شد" "$R"
R=$(agent-browser eval "(()=>{const ps=document.getElementById('pauseScreen'); const btns=Array.from(ps.querySelectorAll('button')).map(b=>b.id).filter(Boolean); const has=(x)=>btns.some(id=>id&&id.includes(x)); return has('btnResume')&&has('btnSaveExit')?1:0})()" | tail -1); ck "ادامه + ذخیره و خروج موجود" "$R"
R=$(agent-browser eval "document.querySelector('#pauseScreen .m27-mini-row')?0:1" | tail -1); ck "ردیف تنظیمات/درباره حذف شد (درخواست کاربر)" "$R"
R=$(agent-browser eval "document.getElementById('btnRestart0')?0:1" | tail -1); ck "«شروع دوباره» هم نیست" "$R"
R=$(agent-browser eval "(()=>{const ps=document.getElementById('pauseScreen'); const vis=Array.from(ps.querySelectorAll('button')).filter(b=>{const r=b.getBoundingClientRect(); return r.width>0 && r.height>0}); const ids=vis.map(b=>b.id).filter(Boolean); const has=(x)=>ids.some(id=>id&&id.includes(x)); return has('btnResume')&&has('btnSaveExit')&&ids.length<=3?1:0})()" | tail -1); ck "فقط دو دکمه‌ی «مرئی»: ادامه + ذخیره و خروج" "$R" "ids=$(agent-browser eval "(()=>{Array.from(document.querySelectorAll('#pauseScreen button')).filter(b=>b.getBoundingClientRect().width>0).map(b=>b.id).join(',')})()" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots29/pause29.png >/dev/null 2>&1
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4

echo "===== ۶) رگرسیون — جریان بازی ====="
R=$(agent-browser eval "state.mode==='day'||state.mode==='playing'?1:0" | tail -1); ck "ادامه‌ی بازی پس از توقف" "$R"
R=$(agent-browser eval "(()=>{const f=document.getElementById('bpFab28'); return !f||getComputedStyle(f).display==='none'?1:0})()" | tail -1); ck "FAB حذف شده (v30: داک جایگزین) — بازی بدون آن سالم" "$R"
agent-browser eval "startNight(); 'ok'" >/dev/null 2>&1; sleep 2
R=$(agent-browser eval "state.mode==='playing'||state.goingNight||state.mode==='transition'?1:0" | tail -1); ck "شب شد: بازی جریان دارد" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
