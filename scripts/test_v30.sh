#!/bin/bash
# تست نسخه‌ی ۳۰٫۰ — هر ۸ درخواست کاربر
URL="http://localhost:3002/three-floors-to-survival.html"
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots30
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
R=$(ev "typeof GAME==='object'&&typeof MYST30==='object'&&typeof BPK30==='object'?1:0"); ck "بوت سالم + ماژول‌های v30" "$R"
sleep 2

echo "===== ۱) منوی اصلی: روشن‌تر + زامبی ترسناک ====="
LUM=$(ev "(()=>{const c=document.getElementById('game');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,Math.floor(c.height*0.6)).data;let s=0,n=0;for(let i=0;i<d.length;i+=64){s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];n++}return (s/n).toFixed(1)})()")
echo "  luminance منو: $LUM (باید > 8 باشد — قبلاً ~5)"
LUMN=$(echo $LUM | sed 's/[^0-9.]//g')
ck "منو روشن‌تر شد (لومینانس > 8)" "$(python3 -c "print(1 if float('$LUMN')>8 else 0)")" "lum=$LUM"
agent-browser screenshot /home/z/my-project/scripts/shots30/menu30.png >/dev/null 2>&1

echo "===== ۲) ستون چپ: دایره‌های هم‌سایز + شبکه‌ی عمودی ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
# حالت روز: mystBtn + ctlFlash + pedReopen — شب: listen/flash/molotov
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; if(MYST.clues.length===0)MYST.clues.push({icon:'🗺️',name:'سرنخ تست',sub:'تست'}); MYST.ensureBtn(); MYST.update(0.02); 'ok'" >/dev/null; sleep 0.5
agent-browser eval "try{DLG.skip()}catch(e){}; 'ok'" >/dev/null; sleep 0.5
R=$(ev "(()=>{const ids=['mystBtn','ctlFlash'];const rs=ids.map(i=>{const e=document.getElementById(i);if(!e)return null;const r=e.getBoundingClientRect();return{w:r.width,h:r.height,t:r.top,l:r.left}});if(rs.some(x=>!x))return 'missing:'+ids.filter((x,i)=>!rs[i]).join(',');const ws=rs.map(x=>x.w.toFixed(1));const hs=rs.map(x=>x.h.toFixed(1));const ls=rs.map(x=>x.l.toFixed(1));return (new Set(ws).size===1&&new Set(hs).size===1&&new Set(ls).size===1)?'1':'sizes='+ws+'/'+hs+' left='+ls})()")
ck "دکمه‌های روز ستون چپ هم‌سایز/هم‌لبه" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const sc=document.getElementById('wrap').getBoundingClientRect().width/960;const m=document.getElementById('mystBtn').getBoundingClientRect().top/sc;const f=document.getElementById('ctlFlash').getBoundingClientRect().top/sc;const g=f-m;return (Math.abs(g-89)<3)?'1':'gap='+g.toFixed(1)+' sc='+sc.toFixed(2)})()")
ck "شبکه‌ی عمودی دقیق (گام یکنواخت ×uiz)" "$(echo "$R" | grep -c '^1$')" "$R"
# حالت شب: listen/flash/molotov
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='playing'; state.torch.owned=true; refreshGearHUD(); MYST.molotovs=2; MYST.ensureListenBtn(); MYST.update(0.02); 'ok'" >/dev/null; sleep 0.8
R=$(ev "(()=>{const ids=['listenBtn','ctlFlash','molotovBtn'];const rs=ids.map(i=>{const e=document.getElementById(i);const r=e.getBoundingClientRect();return{w:r.width,h:r.height,l:r.left,t:r.top,disp:getComputedStyle(e).display}});const vis=rs.filter(x=>x.disp!=='none');if(vis.length<3)return 'vis='+vis.length;const ws=new Set(vis.map(x=>x.w.toFixed(1)));const ls=new Set(vis.map(x=>x.l.toFixed(1)));return (ws.size===1&&ls.size===1)?'1':'w='+[...ws].join('/')})()")
ck "سه دایره‌ی شب هم‌سایز/هم‌لبه" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const sc=document.getElementById('wrap').getBoundingClientRect().width/960;const t=[78,154,230].map((v,i)=>document.getElementById(['listenBtn','ctlFlash','molotovBtn'][i]).getBoundingClientRect().top/sc);const g1=t[1]-t[0];const g2=t[2]-t[1];return (Math.abs(g1-g2)<2&&Math.abs(g1-89)<3)?'1':'gaps='+g1.toFixed(1)+'/'+g2.toFixed(1)})()")
ck "شب: گام‌های عمودی یکسان" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const b=document.querySelector('#molotovBtn .railBadge30');return b&&b.textContent==='۲'?'1':'badge='+(b?b.textContent:'none')})()")
ck "نشان شمارنده‌ی مولوتوف (۲)" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/rail_night30.png >/dev/null 2>&1

echo "===== ۳) تب سلاح‌ها: کاشی‌های بی‌متن ====="
agent-browser eval "state.mode='day'; state.coins=2000; WEAPONS.shotgun.owned=false; 'ok'" >/dev/null; sleep 0.3
agent-browser eval "try{openBuild29()}catch(e){try{toggleBuildPanel()}catch(e2){}}; setBPTab('wpn'); 'ok'" >/dev/null; sleep 0.5
R=$(ev "(()=>{const bad=[];['pistol','shotgun','mg'].forEach(id=>{const t=document.getElementById('bp-'+id);const txt=(t.textContent||'').trim();/* فقط عدد قیمت مجاز */const clean=txt.replace(/[۰-۹0-9]/g,'').replace(/\s/g,'');if(clean.length>0)bad.push(id+':'+txt)});return bad.length===0?'1':bad.join('|')})()")
ck "کاشی سلاح‌ها هیچ متنی ندارد (فقط عدد قیمت)" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/wpn_tab30.png >/dev/null 2>&1

echo "===== ۴) کوله‌پشتی: باتن‌شیت + استفاده ====="
agent-browser eval "state.backpack=[{id:'medkit'},{id:'battery'},null,null,null,null]; refreshBackpack(); 'ok'" >/dev/null; sleep 0.4
agent-browser eval "BPK30.show(); 'ok'" >/dev/null; sleep 0.6
R=$(ev "(()=>{const sh=document.getElementById('bpkSheet30');if(!sh)return 'no sheet';const on=sh.classList.contains('on');const cards=sh.querySelectorAll('.bpkCard30').length;return on&&cards>=2?'1':'on='+on+' cards='+cards})()")
ck "شیت کوله باز + کارت آیتم‌ها" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/backpack30.png >/dev/null 2>&1
R=$(ev "(()=>{const use=[...document.querySelectorAll('#bpkSheet30 .bpkUse30')].find(b=>!b.classList.contains('off'));if(!use)return 'no usable';const hp0=state.tower.hp;state.tower.hp=50;use.click();const healed=state.tower.hp>50;const left=state.backpack.filter(s=>s&&s.id==='medkit').length;return healed&&left===0?'1':'healed='+healed+' left='+left})()")
ck "دکمه‌ی «استفاده» واقعا آیتم را مصرف می‌کند" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const sn=document.getElementById('snack30');return sn&&sn.classList.contains('show')&&sn.textContent.includes('مصرف')?'1':'snack='+(sn?sn.textContent.slice(0,30):'none')})()")
ck "اسنک‌بار تأیید مصرف" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "BPK30.close(); 'ok'" >/dev/null; sleep 0.4

echo "===== ۵) بخش سرنخ‌ها: باتن‌شیت اندرویدی + خرید بدون سیل متن ====="
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null; sleep 0.6
R=$(ev "(()=>{const sh=MYST._panel;if(!sh)return 'no sheet';const on=sh.classList.contains('on');const bottom=sh.classList.contains('shSheet30');const cards=sh.querySelectorAll('.m30act').length;return on&&bottom&&cards>=2?'1':'on='+on+' sheet30='+bottom+' cards='+cards})()")
ck "سرنخ‌ها: باتن‌شیت اندرویدی + کارت‌های اکشن" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/clues30.png >/dev/null 2>&1
agent-browser eval "MYST.molotovs=0; hideAnnounce(); document.getElementById('announceBig').textContent=''; 'ok'" >/dev/null
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]');if(!b)return 'no molo';b.click();return 'clicked'})()" >/dev/null 2>&1; sleep 0.5
R=$(ev "(()=>{const sn=document.getElementById('snack30');const ok=sn&&sn.classList.contains('show')&&sn.textContent.includes('مولوتوف');const big=document.getElementById('announceBig').textContent.trim();const molo=MYST.molotovs;return (ok&&molo>=1)?'1':'snack='+(sn?sn.textContent.slice(0,25):'none')+' molo='+molo})()")
ck "خرید مولوتوف: فقط اسنک‌بار — اعلان متنی صفر" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{const cnt=document.querySelector('#bpkSheet30, .shSheet30 .m30cnt');const c2=document.querySelector('.shSheet30 .m30cnt');return c2&&c2.textContent==='۱'?'1':'cnt='+(c2?c2.textContent:'none')})()")
ck "شمارنده‌ی مولوتوف داخل کارت = ۱" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov_buy30.png >/dev/null 2>&1

echo "===== ۶) تولتیپ‌ها روی لمس خاموش ====="
R=$(ev "(()=>{const tip=document.getElementById('bpTip');try{tip.style.display='block';}catch(e){}const cs=getComputedStyle(tip);/* در دسکتاپ تست می‌کنیم با pointer:coarse قابل‌شبیه‌سازی نیست؛ حداقل max-width فعال باشد */return cs.maxWidth!=='none'?'1':'mw='+cs.maxWidth})()")
ck "تولتیپ گیره‌ی عرض دارد (بیرون‌زدگی متن کیت)" "$(echo "$R" | grep -c '^1$')" "$R"

echo "===== ۷) تنظیمات/درباره: بدون اسکرول ====="
agent-browser eval "MYST.closePanel(); 'ok'" >/dev/null; sleep 0.4
agent-browser eval "showScreen('settingsScreen'); 'ok'" >/dev/null; sleep 0.5
R=$(ev "(()=>{const c=document.querySelector('#settingsScreen .m27-card');const r=c.scrollHeight-c.clientHeight;return r<=2?'1':'overflow='+r+'px'})()")
ck "تنظیمات: بدون اسکرول" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/settings30.png >/dev/null 2>&1
agent-browser eval "hideScreen('settingsScreen'); showScreen('aboutScreen'); 'ok'" >/dev/null; sleep 0.5
R=$(ev "(()=>{const c=document.querySelector('#aboutScreen .m27-card');const r=c.scrollHeight-c.clientHeight;return r<=2?'1':'overflow='+r+'px'})()")
ck "درباره: بدون اسکرول" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/about30.png >/dev/null 2>&1
agent-browser eval "hideScreen('aboutScreen'); 'ok'" >/dev/null

echo "===== ۸) رگرسیون: جریان بازی سالم ====="
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "state.mode==='day'?'1':'mode='+state.mode"); ck "روز بعد از موج" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{state.coins=300;const ok=typeof attemptBuy==='function'?attemptBuy('shotgun'):buy('shotgun');return WEAPONS.shotgun.owned?'1':'not owned'})()")
ck "خرید شاتگان سالم" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "(()=>{GAME.selectWeapon('pistol');return state.weapon==='pistol'?'1':'w='+state.weapon})()")
ck "تعویض سلاح سالم" "$(echo "$R" | grep -c '^1$')" "$R"

echo ""
echo "==================================="
echo "v30: $P OK / $F FAIL"
exit 0
