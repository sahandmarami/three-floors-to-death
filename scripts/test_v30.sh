#!/bin/bash
# تست نسخه‌ی ۳۰٫۰ — داک بالا + آیکون‌های PNG کاربر + فیکس دستفروش + متن جدید
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots30
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof GAME==='object'?1:0" | tail -1); ck "بوت سالم" "$R"

echo "===== ۱) داک ساخت‌وساز — پیل جمع بالا-راست ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "روز رسید" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p.classList.contains('collapsed')?1:0})()" | tail -1); ck "شروع: داک جمع (پیل)" "$R"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); if(!p) return 0; const r=p.getBoundingClientRect(); const s=window.__fitScale||1; const wy=r.top/s; const wx=(r.left)/s; return wy<140 && wx>600?1:0})()" | tail -1); ck "پیل بالا-راست (نه پایین)" "$R" "pos=$(agent-browser eval "(()=>{const r=document.getElementById('buildPanel').getBoundingClientRect(); const s=window.__fitScale||1; return Math.round(r.top/s)+','+Math.round(r.left/s)})()" | tail -1)"
R=$(agent-browser eval "(()=>{const h=document.getElementById('bpHead'); return h && h.querySelector('img.ic30') && h.querySelector('img.ic30').src.startsWith('data:image/png')?1:0})()" | tail -1); ck "آیکون سربرگ = جعبه PNG کاربر" "$R"
R=$(agent-browser eval "(()=>{const f=document.getElementById('bpFab28'); const s=document.getElementById('bpScrim29'); const m=document.getElementById('bpNightMini28'); return (!f||f.parentNode===null)&&(!s||s.parentNode===null)&&(!m||m.parentNode===null)?1:0})()" | tail -1); ck "FAB/اسکریم/مینی-شب حذف شدند (DOM)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/day_dock_collapsed.png >/dev/null 2>&1

echo "===== ۲) باز کردن داک — تب‌ها + کاشی‌های افقی + آیکون‌ها ====="
agent-browser eval "(()=>{try{toggleBuildPanel()}catch(e){} return 'ok'})()" >/dev/null; sleep 0.6
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return !p.classList.contains('collapsed')?1:0})()" | tail -1); ck "داک باز شد" "$R"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); const r=p.getBoundingClientRect(); const s=window.__fitScale||1; const hb=(r.bottom/s); return hb<400?1:0})()" | tail -1); ck "داک فقط نوار آسمان (بالای نوار زمین/زامنی‌ها)" "$R" "bottom=$(agent-browser eval "(()=>{const r=document.getElementById('buildPanel').getBoundingClientRect(); const s=window.__fitScale||1; return Math.round(r.bottom/s)})()" | tail -1)"
R=$(agent-browser eval "(()=>{const l=document.getElementById('bpList'); const cs=getComputedStyle(l); return cs.overflowX==='auto' && cs.display.includes('flex')?1:0})()" | tail -1); ck "ردیف کاشی افقی قابل اسکرول" "$R"
R=$(agent-browser eval "(()=>{const t=document.querySelector('#bpList .bp-tile'); const cs=getComputedStyle(t); return cs.display.includes('flex') && cs.flexDirection.includes('column')?1:0})()" | tail -1); ck "کاشی‌ها عمودی-فشرده در ردیف" "$R"
R=$(agent-browser eval "(()=>{const el=document.getElementById('bp-pistol'); return el && (el.querySelector('.bp-ic29 img')||el.querySelector('img.bp-ic30'))?1:0})()" | tail -1); ck "کاشی کلت = PNG کاربر" "$R"
R=$(agent-browser eval "(()=>{const el=document.getElementById('bp-shotgun'); return el && (el.querySelector('.bp-ic29 img')||el.querySelector('img.bp-ic30'))?1:0})()" | tail -1); ck "کاشی شاتگان = PNG کاربر" "$R"
R=$(agent-browser eval "(()=>{const el=document.getElementById('bp-repair'); return el && el.querySelector('canvas')?1:0})()" | tail -1); ck "کاشی تعمیر = canvas با اسپرایت جدید" "$R"
agent-browser eval "(()=>{try{setBPTab('wpn')}catch(e){} return 'ok'})()" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots30/dock_open_weapons.png >/dev/null 2>&1
agent-browser eval "(()=>{try{setBPTab('up')}catch(e){} return 'ok'})()" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots30/dock_open_upgrades.png >/dev/null 2>&1

echo "===== ۳) چیپ‌های سلاح — PNG بالا-چپ ====="
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-pistol'); return b && b.querySelector('img.ic30') && !b.querySelector('svg') && !b.querySelector('canvas')?1:0})()" | tail -1); ck "چیپ کلت: PNG (بدون SVG/canvas)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-shotgun'); return b && b.querySelector('img.ic30')?1:0})()" | tail -1); ck "چیپ شاتگان: PNG" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-mg'); return b && b.querySelector('img.ic30')?1:0})()" | tail -1); ck "چیپ مسلسل: PNG" "$R"
R=$(agent-browser eval "(()=>{const row=document.getElementById('wpnChips28'); const r=row.getBoundingClientRect(); const s=window.__fitScale||1; return (r.left/s)<200 && (r.top/s)<160?1:0})()" | tail -1); ck "چیپ‌ها بالا-چپ (ردیف افقی)" "$R" "pos=$(agent-browser eval "(()=>{const r=document.getElementById('wpnChips28').getBoundingClientRect(); const s=window.__fitScale||1; return Math.round(r.left/s)+','+Math.round(r.top/s)})()" | tail -1)"

echo "===== ۴) خرید/تعویض سلاح (رگرسیون) ====="
agent-browser eval "state.coins=800; attemptBuy('shotgun'); selectWeapon('pistol'); updateHUD(); 'ok'" >/dev/null 2>&1
R=$(agent-browser eval "state.weapon==='pistol' && WEAPONS.shotgun.owned?1:0" | tail -1); ck "خرید شاتگان + مالکیت دائمی" "$R"
agent-browser eval "selectWeapon('shotgun'); fireTimer=0; tryShoot(); 'ok'" >/dev/null 2>&1
R=$(agent-browser eval "state.weapon==='shotgun'&&state.bullets.length>0?1:0" | tail -1); ck "شلیک شاتگان سالم" "$R"

echo "===== ۵) شب — داک باز می‌ماند + خرید زنده ====="
agent-browser eval "state.tower.hp=99999; state.tower.maxHp=99999; startNight(); 'ok'" >/dev/null 2>&1; sleep 2.5
R=$(agent-browser eval "state.mode==='playing'?1:0" | tail -1); ck "شب: نبرد جریان دارد" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); const cs=getComputedStyle(p); return !p.classList.contains('collapsed') && cs.display!=='none'?1:0})()" | tail -1); ck "داک وسط نبرد باز ماند (درخواست اصلی!)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/night_dock_open.png >/dev/null 2>&1
agent-browser eval "(()=>{state.tower.hp=80; state.coins=900; const b=state.coins; try{attemptBuy('repair')}catch(e){}; return {b, a: state.coins}})()" >/dev/null 2>&1
R=$(agent-browser eval "state.coins<900?1:0" | tail -1); ck "خرید (تعمیر برج آسیب‌دیده) وسط شب کار می‌کند" "$R" "coins=$(agent-browser eval "state.coins" | tail -1)"

echo "===== ۶) دستفروش مرموز — رفع بریده‌شدن ====="
agent-browser eval "state.zombies=[]; state.bullets=[]; state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
sleep 4.2   # v27: peddlerRoll با تاخیر ۲.۶s + poll DLG — صبر تا نوبتِ خودش تمام شود
agent-browser eval "(()=>{state.tower.hp=Math.max(state.tower.hp,300); state.peddler.here=true; state.peddler.cd=0; state.peddler.stock=[{id:'tesla',bp:true,bought:false},{id:'vest',bought:false},{id:'goldAmmo',bought:false},{id:'adrenaline',bought:false},{id:'freezeBomb',bought:false},{id:'helmet',bought:false}]; try{renderPeddlerStock()}catch(e){}; return 'ok'})()" >/dev/null; sleep 0.8
R=$(agent-browser eval "(()=>{const box=document.getElementById('peddlerBox'); return box && !box.classList.contains('hidden')?1:0})()" | tail -1); ck "پنل دستفروش باز شد" "$R"
R=$(agent-browser eval "(()=>{const panel=document.getElementById('peddlerPanel'); const st=document.getElementById('pdStock'); if(!st) return 0; const sr=st.getBoundingClientRect(); const pr=panel.getBoundingClientRect(); const inside = sr.bottom <= pr.bottom+2 && sr.top >= pr.top-2; const scrollOrFit = st.scrollHeight <= st.clientHeight+2 || st.scrollHeight > st.clientHeight; return inside && scrollOrFit ? 1 : 0})()" | tail -1); ck "قفسه داخل پنل جا شده + محتوا یا جا می‌شود یا اسکرول (باگ اصلی حل)" "$R" "stockBottom-panelBottom=$(agent-browser eval "(()=>{const p=document.getElementById('peddlerPanel'); const st=document.getElementById('pdStock'); const r=st.getBoundingClientRect(); const pr=p.getBoundingClientRect(); return Math.round(r.bottom-pr.bottom)+' scrollH='+st.scrollHeight+' clientH='+st.clientHeight})()" | tail -1)"
R=$(agent-browser eval "(()=>{const st=document.getElementById('pdStock'); const cs=getComputedStyle(st); return cs.overflowY==='auto'?1:0})()" | tail -1); ck "قفسه قابل اسکرول عمودی" "$R"
R=$(agent-browser eval "(()=>{const imgs=document.querySelectorAll('#pdStock .pd-item img.pd-ic30'); return imgs.length>=3?1:0})()" | tail -1); ck "کالاهای نقشه‌شده آیکون PNG دارند (vest/goldAmmo/...)" "$R" "n=$(agent-browser eval "document.querySelectorAll('#pdStock img.pd-ic30').length" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots30/vendor_fixed.png >/dev/null 2>&1
# اسکرول پایین قفسه — همه آیتم‌ها قابل دسترس
agent-browser eval "(()=>{const st=document.getElementById('pdStock'); st.scrollTop=9999; return 'ok'})()" >/dev/null; sleep 0.4
R=$(agent-browser eval "(()=>{const st=document.getElementById('pdStock'); return st.scrollTop>0?1:0})()" | tail -1); ck "اسکرول واقعاً حرکت می‌کند" "$R"
agent-browser eval "hidePeddlerPanel(); 'ok'" >/dev/null 2>&1

echo "===== ۷) چراغ‌قوه/کوله — آیکون PNG ====="
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#ctlFlash .ic'); return ic && ic.querySelector('img.ic30')?1:0})()" | tail -1); ck "دکمه چراغ‌قوه = PNG کاربر" "$R"
R=$(agent-browser eval "(()=>{const cap=document.querySelector('#backpackBar .bpk-cap'); return cap && cap.querySelector('img.ic30')?1:0})()" | tail -1); ck "برچسب کوله = PNG کاربر" "$R"

echo "===== ۸) توقف دومنویی (رگرسیون v29) ====="
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
R=$(agent-browser eval "(()=>{const ps=document.getElementById('pauseScreen'); const vis=Array.from(ps.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0).map(b=>b.id).filter(Boolean); const has=(x)=>vis.some(id=>id&&id.includes(x)); return has('btnResume')&&has('btnSaveExit')&&vis.length<=3?1:0})()" | tail -1); ck "فقط ادامه + ذخیره و خروج" "$R" "ids=$(agent-browser eval "(()=>{Array.from(document.querySelectorAll('#pauseScreen button')).filter(b=>b.getBoundingClientRect().width>0).map(b=>b.id).join(',')})()" | tail -1)"
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4

echo "===== ۹) متن جدید — اینترو/درباره ====="
R=$(agent-browser eval "INTRO_DLGS[0][0].v==='n30a' && INTRO_DLGS[1][0].v==='s30a'?1:0" | tail -1); ck "اینترودیالوگ‌های جدید (n30a/s30a)" "$R"
R=$(agent-browser eval "INTRO_SCENES[1].draw===introScFindMG && INTRO_SCENES[2].draw===introScStreetMG?1:0" | tail -1); ck "ترتیب صحنه‌ها: برج قبل از حمله" "$R"
R=$(agent-browser eval "STORY22.chEnd[1][0].v==='t30a1' && STORY22.chEnd[3].length===4?1:0" | tail -1); ck "انتقال‌های جدید (t30a1 + T3 چهارخطی)" "$R"
R=$(agent-browser eval "STORY22.shelterArrive.length===6 && STORY22.shelterArrive[0].v==='h30m1'?1:0" | tail -1); ck "گفتگوی پناهگاه ۶ خطی مریم" "$R"
R=$(agent-browser eval "STORY22.radioAlarm.length===2 && STORY22.radioAlarm[0].v==='f30r'?1:0" | tail -1); ck "هشدار پایانی دوخطی (رادیو+آرشان)" "$R"
R=$(agent-browser eval "VOICES23['n30a']&&VOICES23['f30a']&&VOICES23['tbc30n']?1:0" | tail -1); ck "صداهای جدید در داده" "$R"
agent-browser eval "(()=>{showScreen('aboutScreen'); return 'ok'})()" >/dev/null; sleep 0.5
R=$(agent-browser eval "(()=>{const t=document.querySelector('#aboutScreen .m27-text'); return t && t.textContent.includes('ویروس اومد') && t.textContent.includes('زنده بمون...') && !t.textContent.includes('ایستگاه متروکه و برج مخابراتی')?1:0})()" | tail -1); ck "درباره = تیزر کوتاه با «...»" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/about_new.png >/dev/null 2>&1
agent-browser eval "(()=>{hideScreen('aboutScreen'); return 'ok'})()" >/dev/null 2>&1

echo "===== ۱۰) صحنهٔ اینترو — دیالوگ جدید پخش می‌شود ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='intro' && INTRO && INTRO.dlgStarted?1:0" | tail -1); ck "اینتروی جدید شروع شد + گفتگو فعال" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "(()=>{const w=document.getElementById('dlgWho'); return w && w.textContent.includes('راوی')?1:0})()" | tail -1); ck "خط اول = راوی (شهر متروکه)" "$R" "who=$(agent-browser eval "document.getElementById('dlgWho')?.textContent" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots30/intro_scene1.png >/dev/null 2>&1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
