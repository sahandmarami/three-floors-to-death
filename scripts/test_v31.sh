#!/bin/bash
# تست نسخه‌ی ۳۱٫۰ — بازسازی UI بر اساس عکس‌های واقعی گوشی
# ۱) فیلترینگ تب ساخت‌وساز (computed!) ۲) چیپ سلاح پایین‌وسط ۳) دستفروع بازسازی
# ۴) نویز رادیو ۵) آیکون‌های درشت ۶) منوی تمیز ۷) قطع صدا ۸) ممیزی هم‌پوشانی
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots31
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof GAME==='object'&&typeof exitToMenu==='function'&&exitToMenu.__31===true?1:0" 2>/dev/null | tail -1); ck "بوت سالم + ماژول v31 فعال" "$R"

# ---------- کمکی: رسیدن به روزِ موج ۲ ----------
to_day() {
  agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
  agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
  agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
  agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 2
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
}
# ---------- کمکی: شب ----------
to_night() { agent-browser eval "startNight(); 'ok'" >/dev/null 2>&1; sleep 3; }

echo "===== ۱) فیلترینگ تب ساخت‌وساز (بررسی computed — نه inline!) ====="
to_day
agent-browser eval "(()=>{toggleBuildPanel(); return 'ok'})()" >/dev/null 2>&1; sleep 0.5
for T in "up:repair,speed,health,weapon,trap" "wpn:pistol,shotgun,mg" "tur:gatling,sniper,frost,turretUp" "sur:flashlight,battery,canned,medkit"; do
  TAB="${T%%:*}"; WANT="${T#*:}"
  agent-browser eval "setBPTab('$TAB', true); 'ok'" >/dev/null 2>&1; sleep 0.35
  GOT=$(agent-browser eval "(()=>{const vis=Array.from(document.querySelectorAll('.bp-tile')).filter(t=>{const cs=getComputedStyle(t); return cs.display!=='none'&&t.getBoundingClientRect().width>0}).map(t=>t.id.replace('bp-','')); return vis.join(',')})()" 2>/dev/null | tail -1 | tr -d '"')
  ck "تب $TAB فقط آیتم‌های خودش را می‌آورد" "$([ "$GOT" = "$WANT" ] && echo 1 || echo 0)" "got=$GOT want=$WANT"
done
agent-browser screenshot /home/z/my-project/scripts/shots31/build_tur31.png >/dev/null 2>&1

echo "===== ۲) چیپ سلاح‌ها — پایین‌وسط، دور از توقف/سرنخ ====="
to_night
R=$(agent-browser eval "(()=>{const c=document.getElementById('wpnChips28'); const r=c.getBoundingClientRect(); const pause=document.querySelector('#pauseBtn,[title*=توقف]'); const pr=pause?pause.getBoundingClientRect():null; const clashPause=pr&&!(r.x>pr.right||r.x+r.width<pr.x||r.y>pr.bottom||r.y+r.height<pr.y); const lowEnough=r.y>200; const centered=Math.abs((r.x+r.width/2)-innerWidth/2)<30; return (!clashPause&&lowEnough&&centered)?1:0})()" 2>/dev/null | tail -1)
ck "چیپ‌ها: پایین صفحه + وسط + بدون برخورد با توقف" "$R" "pos=$(agent-browser eval "(()=>{const r=document.getElementById('wpnChips28').getBoundingClientRect(); return Math.round(r.x)+','+Math.round(r.y)})()" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const c=document.getElementById('wpnChips28').getBoundingClientRect(); const m=document.getElementById('mystBtn')||document.getElementById('listenBtn'); if(!m) return 1; const mr=m.getBoundingClientRect(); if(mr.width===0) return 1; return !(c.x<mr.right&&c.x+c.width>mr.x&&c.y<mr.bottom&&c.y+c.height>mr.y)?1:0})()" 2>/dev/null | tail -1)
ck "چیپ‌ها: بدون برخورد با ستون چپ (سرنخ/شنود)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots31/night31.png >/dev/null 2>&1

echo "===== ۳) دستفروش مرموز — ردیف بازسازی‌شده ====="
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "peddlerRoll(true); 'ok'" >/dev/null 2>&1; sleep 3.5
agent-browser eval "PED.phase='stay'; PED.openShop(); 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "(()=>{const rows=document.querySelectorAll('#pdStock .pd-row31'); return rows.length>=1&&document.querySelectorAll('#pdStock .pd-item').length===0?1:0})()" 2>/dev/null | tail -1)
ck "قفسه: ردیف‌های تازه v31 (نه چیدمان قدیمی)" "$R" "rows=$(agent-browser eval "document.querySelectorAll('#pdStock .pd-row31').length" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const rows=Array.from(document.querySelectorAll('.pd-row31')); for(const el of rows){const pr=el.querySelector('.pd-price31'); const rr=el.getBoundingClientRect(); const r2=pr.getBoundingClientRect(); if(r2.x<rr.x-2||r2.right>rr.right+2||r2.y<rr.y-2||r2.bottom>rr.bottom+2) return 0} return 1})()" 2>/dev/null | tail -1)
ck "قیمت: هر قرص کامل داخل ردیف خودش (نه روی متن دیگر)" "$R"
R=$(agent-browser eval "(()=>{const p=document.getElementById('peddlerPanel').getBoundingClientRect(); return (p.right<=innerWidth+2&&p.bottom<=innerHeight+2)?1:0})()" 2>/dev/null | tail -1)
ck "پنل دستفروش: داخل صفحه (بریده نمی‌شود)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots31/merchant31.png >/dev/null 2>&1
agent-browser eval "hidePeddlerPanel(); 'ok'" >/dev/null 2>&1

echo "===== ۴) نویز رادیو — بعد از بستن قطع می‌شود ====="
R=$(agent-browser eval "(()=>{MYST.openRadio(); MYST.radioNoise(0.8); const had=!!MYST._radioNoise; const st1=MYST._radioNoise?MYST._radioNoise.src.state:''; MYST.closePanel(); const gone=!MYST._radioNoise; const st2=st1; return had&&gone?1:0})()" 2>/dev/null | tail -1)
ck "نویز رادیو: ایجاد و پاک‌سازی صحیح (closePanel)" "$R"
agent-browser eval "(()=>{window.__stopCalls31=0; if(!AudioBufferSourceNode.prototype.__p31){const o=AudioBufferSourceNode.prototype.stop; AudioBufferSourceNode.prototype.__p31=true; AudioBufferSourceNode.prototype.stop=function(){window.__stopCalls31++; try{return o.apply(this,arguments)}catch(e){}}} MYST.openRadio(); MYST.radioNoise(0.8); MYST.closePanel(); return 'ok'})()" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "window.__stopCalls31>=1?1:'no-stop-call'" 2>/dev/null | tail -1)
ck "منبع صدا واقعاً stop شد (state=closed/finished)" "$R"

echo "===== ۵) آیکون‌های درشت چراغ‌قوه/کوله ====="
to_night
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#ctlFlash .ic img.ic30,#ctlFlash .ic svg'); if(!ic) return 0; const w=ic.getBoundingClientRect().width; return w>=33?1:0})()" 2>/dev/null | tail -1)
ck "آیکون چراغ‌قوه ≥ ۳۳px (قبلاً ۲۲)" "$R" "w=$(agent-browser eval "(()=>{const ic=document.querySelector('#ctlFlash .ic img.ic30,#ctlFlash .ic svg'); return ic?Math.round(ic.getBoundingClientRect().width):0})()" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const cap=document.querySelector('#backpackBar .bpk-cap img.ic30,#backpackBar .bpk-cap .ic'); if(!cap) return 0; const w=cap.getBoundingClientRect().width; return w>=26?1:0})()" 2>/dev/null | tail -1)
ck "آیکون کوله ≥ ۲۶px (قبلاً ۱۵)" "$R" "w=$(agent-browser eval "(()=>{const cap=document.querySelector('#backpackBar .bpk-cap img.ic30,#backpackBar .bpk-cap .ic'); return cap?Math.round(cap.getBoundingClientRect().width):0})()" 2>/dev/null | tail -1)"

echo "===== ۶) ذخیره و خروج — منوی تمیز + «ذخیره شد» یک‌بار ====="
agent-browser eval "MYST.clues.push({icon:'📻',name:'تست سرنخ',sub:'تست'}); 'ok'" >/dev/null 2>&1
agent-browser eval "pauseGame(); saveAndExit(); 'ok'" >/dev/null 2>&1; sleep 1.2
R=$(agent-browser eval "(()=>{const m=document.getElementById('mystBtn'); if(!m) return 1; const cs=getComputedStyle(m); return cs.display==='none'||m.getBoundingClientRect().width===0?1:0})()" 2>/dev/null | tail -1)
ck "دکمه‌ی سرنخ دیگر در منو دیده نمی‌شود" "$R"
R=$(agent-browser eval "(()=>{const a=document.getElementById('announce'); return a&&+a.style.opacity===1?1:0})()" 2>/dev/null | tail -1)
ck "«ذخیره شد» در منو ظاهر شد (z-index بالا)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots31/menu_saved31.png >/dev/null 2>&1
sleep 3.2
R=$(agent-browser eval "(()=>{const a=document.getElementById('announce'); return a&&+a.style.opacity===0?1:0})()" 2>/dev/null | tail -1)
ck "«ذخیره شد» بعد از ~۳.۴s خودش رفت" "$R"

echo "===== ۷) خروج = قطع کامل صدا ====="
R=$(agent-browser eval "(()=>{return (window.__menuSilent31===true&&(!MUSIC.timer)&&MUSIC.track===null)?1:0})()" 2>/dev/null | tail -1)
ck "موسیقی بعد از خروج کاملاً قطع (پرچم بی‌صدا + timer خاموش)" "$R" "state=$(agent-browser eval "JSON.stringify({f:window.__menuSilent31,t:MUSIC.track,timer:!!MUSIC.timer})" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{return window.__menuSilent31===true?1:0})()" 2>/dev/null | tail -1)
ck "پرچم «منوی بی‌صدا» فعال: update() دیگر امبینت برنمی‌گرداند" "$R"
agent-browser eval "(()=>{state.mode='day'; return 'ok'})()" >/dev/null 2>&1; sleep 0.6
R=$(agent-browser eval "window.__menuSilent31===false?1:0" 2>/dev/null | tail -1)
ck "شروع بازی (هر حالت غیر از منو): پرچم پاک + صدا برمی‌گردد" "$R"
agent-browser eval "(()=>{try{exitToMenu()}catch(e){}; return 'menu-restored'})()" >/dev/null 2>&1; sleep 0.5

echo "===== ۸) آیکون شروع بازی + تک‌تیرانداز ====="
R=$(agent-browser eval "(()=>{const b=document.querySelector('.m23-ico[data-ico=sword30]'); if(!b) return 0; const svg=b.querySelector('svg'); if(!svg) return 0; const w=svg.getBoundingClientRect().width; return w>=30?1:0})()" 2>/dev/null | tail -1)
ck "آیکون شروع: SVG شمشیرهای متقاطع ≥ ۳۰px" "$R"
R=$(agent-browser eval "(()=>{const s=CUBE_IMGS.sniper&&CUBE_IMGS.sniper.src||''; const binoc=(typeof ICONS30!=='undefined')?ICONS30.binoculars:''; return s&&s!==binoc&&s.includes('CAMAAADVRocK')?1:0})()" 2>/dev/null | tail -1)
ck "برجک تک‌تیرانداز: اسپرایت اصلی برگشت (نه دوربین شب)" "$R"

echo "===== ۹) ممیزی هم‌پوشانی دکمه‌ها (خواسته‌ی اصلی) ====="
agent-browser eval "(()=>{try{hideScreen('confirmBox')}catch(e){}; return 'ok'})()" >/dev/null 2>&1
AUDIT_JS="(() => {
  const els = Array.from(document.querySelectorAll('#wrap button, #wrap .bp-tile, #wrap .bp-tab, #wrap .bpk-slot, #wrap .pd-row31'));
  const vis = els.filter(el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    return r.width > 6 && r.height > 6 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  });
  const bad = [];
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const a = vis[i], b = vis[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.x, rb.x);
    const oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.y, rb.y);
    if (ox > 8 && oy > 8) bad.push((a.id || a.className.toString().split(' ')[0]) + '×' + (b.id || b.className.toString().split(' ')[0]));
  }
  return bad.length === 0 ? 'CLEAN' : 'CLASH:' + bad.slice(0, 6).join('|');
})()"
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "حالت منو: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
to_day
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "حالت روز: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
to_night
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "حالت شب: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
agent-browser eval "(()=>{toggleBuildPanel(); return 'ok'})()" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "داک باز: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots31/dock_open31.png >/dev/null 2>&1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 2; agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "peddlerRoll(true); 'ok'" >/dev/null 2>&1; sleep 3.5; agent-browser eval "PED.phase='stay'; PED.openShop(); 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "دستفروش باز: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots31/merchant_audit31.png >/dev/null 2>&1
agent-browser eval "hidePeddlerPanel(); pauseGame(); 'ok'" >/dev/null 2>&1; sleep 0.7
R=$(agent-browser eval "$AUDIT_JS" 2>/dev/null | tail -1 | tr -d '"')
ck "منوی توقف: بدون هم‌پوشانی" "$([ "$R" = "CLEAN" ] && echo 1 || echo 0)" "$R"
R=$(agent-browser eval "(()=>{const ps=document.getElementById('pauseScreen'); const vis=Array.from(ps.querySelectorAll('button')).filter(b=>{const r=b.getBoundingClientRect(); return r.width>0}); const ids=vis.map(b=>b.id).filter(Boolean); return ids.includes('btnResume')&&ids.includes('btnSaveExit')?1:0})()" 2>/dev/null | tail -1)
ck "توقف: فقط ادامه + ذخیره و خروج" "$R"

echo "===== ۱۰) رگرسیون جریان بازی ====="
agent-browser eval "resumeGame(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "state.mode==='day'||state.mode==='playing'?1:0" 2>/dev/null | tail -1)
ck "بازی بعد از توقف ادامه می‌یابد" "$R"
R=$(agent-browser eval "(()=>{state.coins=600; const b=state.coins; attemptBuy('shotgun'); const got=!!WEAPONS.shotgun.owned; selectWeapon('shotgun'); fireTimer=0; tryShoot(); return got&&state.weapon==='shotgun'&&state.bullets.length>0?1:0})()" 2>/dev/null | tail -1)
ck "خرید/تعویض/شلیک شاتگان (رگرسیون)" "$R"
R=$(agent-browser eval "(()=>{selectWeapon('pistol'); updateHUD(); const c=document.getElementById('wchip28-pistol'); return c&&c.classList.contains('on')?1:0})()" 2>/dev/null | tail -1)
ck "چیپ کلت طلایی بعد از تعویض" "$R"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
[ $F -eq 0 ] && echo "ALL GREEN ✔" || echo "FAILURES: $F"
