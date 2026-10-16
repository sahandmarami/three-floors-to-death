#!/bin/bash
# تست نسخه‌ی ۳۵٫۰ — وصله روی v34: زامبی ترسناک + روشنایی + کاشی بی‌متن + معما شیت
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots30
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(ev "typeof GAME!=='undefined'?state.mode:'no'")
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
R=$(ev "window.__V35?1:0"); ck "بوت سالم + ماژول v35 لود شد" "$R"
R=$(ev "window.__V34&&window.__V34.flags===1?1:0"); ck "ساختارهای v34 حفظ شدند" "$R"
sleep 2

echo "===== ۱) منو: روشن‌تر + زامبی ترسناک ====="
LUM=$(ev "(()=>{const c=document.getElementById('game');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,Math.floor(c.height*0.6)).data;let s=0,n=0;for(let i=0;i<d.length;i+=64){s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];n++}return (s/n).toFixed(1)})()")
LUMN=$(echo $LUM | sed 's/[^0-9.]//g')
ck "منو روشن‌تر (لومینانس > 8)" "$(python3 -c "print(1 if float('$LUMN')>8 else 0)")" "lum=$LUM"
R=$(ev "M23.zmb.length>=3?'1':'n='+M23.zmb.length"); ck "زامبی‌های منو (۳ ایستاده — v39؛ قبلا ۷)" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "M23.zmb.some(z=>z.d>=1.3)?'1':'no big'"); ck "زامبی‌های پیش‌زمینه درشت (d≥1.3)" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "M23.zmb.every(z=>typeof z.hurt==='number'&&typeof z.stare==='number')?'1':'fields missing'"); ck "فیلدهای لکنت/خیرگی فعال" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_menu.png >/dev/null 2>&1

echo "===== ۲) ریل v34 حفظ + کار می‌کند ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; 'ok'" >/dev/null 2>&1; sleep 1
R=$(ev "(()=>{const b=document.getElementById('mystBtn');const r=b.getBoundingClientRect();return r.width>50?'1':'w='+r.width})()")
ck "دکمه‌ی سرنخ ریل سالم" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const b=document.getElementById('bpkBtn34');const r=b.getBoundingClientRect();return r.width>50?'1':'w='+r.width})()")
ck "دکمه‌ی کوله ریل سالم" "$(echo "$R" | grep -c '^1$')" "$R"

echo "===== ۳) کاشی سلاح‌ها: بی‌متن ====="
agent-browser eval "state.coins=2000; try{openBuild29()}catch(e){try{toggleBuildPanel()}catch(e2){}}; setBPTab('wpn'); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "(()=>{const bad=[];['pistol','shotgun','mg'].forEach(id=>{const t=document.getElementById('bp-'+id);if(t){const txt=(t.textContent||'').trim();const clean=txt.replace(/[۰-۹0-9]/g,'').replace(/\s/g,'');if(clean.length>0)bad.push(id+':'+txt.slice(0,25))}});return bad.length===0?'1':bad.join('|')})()")
ck "کاشی سلاح‌ها هیچ متنی ندارد" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_wpn.png >/dev/null 2>&1

echo "===== ۴) بخش سرنخ v34 + معماها در شیت ====="
agent-browser eval "GAME.skipToWave(4); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; MYST.update(0.02); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null 2>&1; sleep 0.7
R=$(ev "(()=>{const s=document.getElementById('clueSheet34');return s&&s.classList.contains('open')?'1':'no sheet'})()")
ck "آرشیو سرنخ: باتن‌شیت v34 باز" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_clues.png >/dev/null 2>&1
# معمای رادیو — حالا باید شیت شود نه مودال قدیمی
agent-browser eval "(()=>{const b=document.querySelector('[data-act=radio]');if(b)b.click();return 'ok'})()" >/dev/null 2>&1; sleep 0.7
R=$(ev "(()=>{const p=MYST._panel;if(!p)return 'no panel';const isSheet=p.classList.contains('sheet34');const slider=p.querySelector('#rdSlider');return isSheet&&slider?'1':'sheet34='+isSheet+' slider='+(!!slider)+' id='+(p.id||p.className)})()")
ck "معمای رادیو: باتن‌شیت اندرویدی (نه مودال قدیمی)" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_radio.png >/dev/null 2>&1
# حل معما
agent-browser eval "(()=>{const s=document.querySelector('#rdSlider');s.value=1045;s.dispatchEvent(new Event('input'));document.querySelector('#rdLock').click();return 'ok'})()" >/dev/null 2>&1; sleep 0.5
R=$(ev "MYST.done.radio===true?'1':'not'"); ck "معمای رادیو حل شد" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "MYST.closePanel(); 'ok'" >/dev/null 2>&1; sleep 0.4

echo "===== ۵) خرید مولوتوف: اسنک‌بار + بدون سیل ====="
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null 2>&1; sleep 0.7
agent-browser eval "MYST.molotovs=0; hideAnnounce(); 'ok'" >/dev/null 2>&1
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]');if(!b)return 'no btn';b.click();return 'ok'})()" >/dev/null 2>&1; sleep 0.5
R=$(ev "(()=>{const sn=document.getElementById('snack35');const ok=sn&&sn.classList.contains('show')&&sn.textContent.indexOf('مولوتوف')>=0;return ok&&MYST.molotovs>=1?'1':'snack='+(sn?sn.textContent.slice(0,25):'none')+' molo='+MYST.molotovs})()")
ck "خرید مولوتوف → اسنک‌بار کوچک" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_molo.png >/dev/null 2>&1
agent-browser eval "MYST.closePanel(); 'ok'" >/dev/null 2>&1; sleep 0.3

echo "===== ۶) کوله v34 + مصرف ====="
agent-browser eval "state.backpack=[{id:'medkit'},null,null,null,null,null]; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.4
agent-browser eval "(()=>{const b=document.getElementById('bpkBtn34');if(b)b.click();return 'ok'})()" >/dev/null 2>&1; sleep 0.7
R=$(ev "(()=>{const s=document.getElementById('bpkSheet34');return s&&s.classList.contains('open')?'1':'no'})()")
ck "کوله: شیت v34 باز" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/v35_bpk.png >/dev/null 2>&1
agent-browser eval "(()=>{try{closeSheet34()}catch(e){}; return 'ok'})()" >/dev/null 2>&1

echo "===== ۷) تنظیمات/درباره بدون اسکرول (v34 حفظ) ====="
agent-browser eval "showScreen('settingsScreen'); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "(()=>{const c=document.querySelector('#settingsScreen .m27-card');return (c.scrollHeight-c.clientHeight)<=2?'1':'overflow='+(c.scrollHeight-c.clientHeight)})()")
ck "تنظیمات: بدون اسکرول" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "hideScreen('settingsScreen'); showScreen('aboutScreen'); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "(()=>{const c=document.querySelector('#aboutScreen .m27-card');return (c.scrollHeight-c.clientHeight)<=2?'1':'overflow='+(c.scrollHeight-c.clientHeight)})()")
ck "درباره: بدون اسکرول" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "hideScreen('aboutScreen'); 'ok'" >/dev/null 2>&1

echo "===== ۸) رگرسیون جریان ====="
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "state.mode==='day'?'1':'mode='+state.mode"); ck "روز بعد از موج" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{state.coins=300;try{attemptBuy('shotgun')}catch(e){try{buy('shotgun')}catch(e2){}};return WEAPONS.shotgun.owned?'1':'not'})()")
ck "خرید شاتگان" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{GAME.selectWeapon('pistol');return state.weapon==='pistol'?'1':'w='+state.weapon})()")
ck "تعویض سلاح" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{GAME.pauseGame?0:0; pauseGame(); const ok=state.mode==='paused'; resumeGame(); return ok?'1':'pause fail'})()")
ck "توقف/ادامه" "$(echo "$R" | grep -c '^1$')" "$R"

echo ""
echo "==================================="
echo "v35: $P OK / $F FAIL"
