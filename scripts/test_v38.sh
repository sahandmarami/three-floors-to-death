#!/bin/bash
# تست نسخه‌ی ۳۸٫۰ — بازخورد کاربر (۵ درخواست):
# ۱) متن داستان/کات‌سین پایین صفحه (نه بالا) ۲) آیکون جدید بازی ۳) مه‌های سفید منو کم شود
# ۴) زامبی‌های منو باحال‌تر ۵) حذف علامت جلوی «گوش بسپار/جستجوی محیط»
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }
ok1() { echo "$1" | grep -c '^1$'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots38
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(ev "typeof GAME!=='undefined'?state.mode:'no'")
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
R=$(ev "window.__V37?1:0"); ck "بوت سالم + زنجیره‌ی v37 دست‌نخورده" "$R"

echo "===== ۱) متن داستان/کات‌سین: پایین صفحه ====="
R=$(ev "(()=>{const css=[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch(e){return[]}}).filter(r=>r.selectorText&&r.selectorText.includes('trans-mode')&&r.selectorText.includes('dlgBox')); return css.length>0?1:0})()"); ck "CSS جدید: trans-mode (فقط انتقال بالا می‌ماند)" "$R"
R=$(ev "(()=>{const css=[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules]}catch(e){return[]}}).filter(r=>r.selectorText&&r.selectorText.includes('cine-mode')&&r.selectorText.includes('#dlgBox')); return css.length===0?1:0})()"); ck "CSS قدیمی cine-mode→top حذف شد (گفتگوی داستان آزاد)" "$R"
# اینترو: گفتگو باید پایین باشد
agent-browser eval "GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 2.5
R=$(ev "(()=>{const r=document.getElementById('dlgBox').getBoundingClientRect(); return (r.top>innerHeight*0.55&&r.bottom>innerHeight*0.8)?1:0})()"); ck "اینترو: جعبه‌ی گفتگو در پایین صفحه (≥۵۵٪)" "$R" "top=$(ev "(()=>{const r=document.getElementById('dlgBox').getBoundingClientRect(); return Math.round(r.top)+'/'+innerHeight})()")"
agent-browser screenshot /home/z/my-project/scripts/shots38/t38_intro.png >/dev/null 2>&1
# صحنه ۲ اینترو هم پایین بماند
agent-browser eval "DLG.skip(); 'ok'" >/dev/null; sleep 2.5
R=$(ev "(()=>{const r=document.getElementById('dlgBox').getBoundingClientRect(); const vis=!document.getElementById('dlgBox').classList.contains('hidden'); return (!vis)||(r.top>innerHeight*0.55)?1:0})()"); ck "صحنه‌ی بعدی اینترو: گفتگو همچنان پایین" "$R"
# انتقال فصل: ماشین پایین است → گفتگو بالا بماند (اصلاح v36 حفظ شد)
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "startTransition(1); 'ok'" >/dev/null; sleep 2
R=$(ev "document.getElementById('wrap').classList.contains('trans-mode')?1:0"); ck "انتقال: کلاس trans-mode فعال" "$R"
R=$(ev "(()=>{const r=document.getElementById('dlgBox').getBoundingClientRect(); return (r.top<innerHeight*0.25)?1:0})()"); ck "انتقال: گفتگو بالا (ماشین/ارشان پایین آزاد — v36 حفظ شد)" "$R" "top=$(ev "(()=>{const r=document.getElementById('dlgBox').getBoundingClientRect(); return Math.round(r.top)+'/'+innerHeight})()")"
agent-browser screenshot /home/z/my-project/scripts/shots38/t38_trans.png >/dev/null 2>&1
agent-browser eval "skipTransition(); 'ok'" >/dev/null 2>&1; sleep 2

echo "===== ۲) آیکون جدید بازی ====="
R=$(ev "(()=>{const l=document.querySelector('link[rel=icon]'); return l&&l.href.startsWith('data:image/png;base64,')&&l.href.length>2000?1:0})()"); ck "favicon جدید (base64 آیکون کاربر) در HTML" "$R" "len=$(ev "(()=>{const l=document.querySelector('link[rel=icon]'); return l?l.href.length:0})()")"
R=$([ "$(md5sum /home/z/my-project/android/res/mipmap-xxxhdpi/ic_launcher.png | cut -c1-8)" != "$(md5sum /tmp/feedback_v30/ایکون_بازی.png | cut -c1-8)" ] && echo 1 || echo 0); ck "آیکون launcher اندروید جایگزین شد (mipmap)" "$R"

echo "===== ۳) مه‌های سفید منو کم شود ====="
agent-browser open "$URL" >/dev/null; agent-browser wait 4000 >/dev/null
agent-browser eval "M23.t=8; 'ok'" >/dev/null; sleep 1.5
R=$(ev "M23.fogA.length<=4&&M23.fogB.length<=3?1:0"); ck "تعداد لایه‌های مه نصف شد (۹/۸ → ۳/۲)" "$R" "a=$(ev "M23.fogA.length")/b=$(ev "M23.fogB.length")"
R=$(ev "(()=>{const a=M23.fogA.reduce((m,f)=>Math.max(m,f.a),0); const b=M23.fogB.reduce((m,f)=>Math.max(m,f.a),0); return (a<0.06&&b<0.07)?1:0})()"); ck "شفافیت هر لایه‌ی مه به‌شدت کم (~نصف)" "$R" "maxA=$(ev "(()=>{return M23.fogA.reduce((m,f)=>Math.max(m,f.a),0).toFixed(3)})()")"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height*0.88),c.width,Math.floor(c.height*0.12)).data; let w=0,n=0; for(let i=0;i<d.length;i+=16){n++; if(d[i]>185&&d[i+1]>185&&d[i+2]>190)w++;} return (w/n<0.02)?1:0})()"); ck "نوار پایین منو: بدون سیلِ پیکسل سفید (مه سفید رفته)" "$R" "white%=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height*0.88),c.width,Math.floor(c.height*0.12)).data; let w=0,n=0; for(let i=0;i<d.length;i+=16){n++; if(d[i]>185&&d[i+1]>185&&d[i+2]>190)w++;} return (100*w/n).toFixed(1)+'%'})()")"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return s/n>=45?1:0})()"); ck "منو همچنان روشن (v37 حفظ شد — lum پایین ≥۴۵)" "$R" "lum=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n).toFixed(1)})()")"
agent-browser screenshot /home/z/my-project/scripts/shots38/t38_menu.png >/dev/null 2>&1

echo "===== ۴) زامبی‌های منو باحال‌تر ====="
R=$(ev "M23.drawSilZombie.toString().includes('crawl')?1:0"); ck "زامبی خزنده (نوع fast چهاردست‌وپا)" "$R"
R=$(ev "M23.drawSilZombie.toString().includes('rimC')?1:0"); ck "نورِ لبه‌ی ماه خونی روی بدن/جمجمه" "$R"
R=$(ev "M23.drawSilZombie.toString().includes('rdapvsh')||M23.drawSilZombie.toString().includes('wf')?1:0"); ck "دنباله‌های رداپوش موج‌دار در باد" "$R"
R=$(ev "(()=>{const zs=M23.zmb.filter(z=>z.ty==='tank'||z.ty==='normal'); return zs.length>0?1:0})()"); ck "زامبی‌های ایستاده بولد موجود" "$R"
R=$(ev "M23.drawSilZombie.toString().includes('flare')?1:0"); ck "هنگام رعدوبرق: چشم‌ها شعله‌ور" "$R"
R=$(ev "(()=>{const s=M23.drawSilZombie.toString(); return s.includes('1.8')&&s.includes('1.55')?1:0})()"); ck "مقیاس بزرگ‌تر (~۲۵٪)" "$R"

echo "===== ۵) حذف علامت جلوی گزینه‌های سرنخ ====="
agent-browser eval "localStorage.clear(); wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null; sleep 1
R=$(ev "(()=>{const sh=document.querySelector('#clueSheet34'); if(!sh) return 0; return sh.querySelectorAll('.rc-go34').length===0?1:0})()"); ck "هیچ علامت chevron › در شیت سرنخ نیست" "$R" "count=$(ev "(()=>{const sh=document.querySelector('#clueSheet34'); return sh?sh.querySelectorAll('.rc-go34').length:-1})()")"
R=$(ev "(()=>{const sh=document.querySelector('#clueSheet34'); if(!sh) return 0; const sc=sh.querySelector('[data-act=scav]'); return sc&&sc.textContent.includes('جست‌وجوی محیط')?1:0})()"); ck "گزینه‌ی «جست‌وجوی محیط» سالم (بدون علامت)" "$R"
R=$(ev "(()=>{const sh=document.querySelector('#clueSheet34'); if(!sh) return 0; const li=sh.querySelector('[data-act=listen]'); return li&&li.textContent.includes('گوش بسپار')?1:0})()"); ck "گزینه‌ی «گوش بسپار» سالم (بدون علامت)" "$R"
R=$(ev "(()=>{const sh=document.querySelector('#clueSheet34'); if(!sh) return 0; const mo=sh.querySelector('[data-act=molo]'); return mo&&mo.querySelector('.rc-price34')?1:0})()"); ck "قیمت مولوتوف (۴۵) دست‌نخورده — علامتِ معنادار" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots38/t38_clues.png >/dev/null 2>&1
# کلیک روی گوش بسپار کار کند
agent-browser eval "(()=>{const sh=document.querySelector('#clueSheet34'); const li=sh.querySelector('[data-act=listen]'); if(li) li.click(); return 'ok'})()" >/dev/null; sleep 1
R=$(ev "MYST.listen.cd>0?1:0"); ck "عملکرد گزینه‌ی گوش بسپار سالم (شنیدن فعال شد)" "$R"

echo "===== ۶) رگرسیون ====="
agent-browser eval "closeSheet34(); 'ok'" >/dev/null 2>&1
R=$(ev "window.__V36?1:0"); ck "ماژول v36 فعال" "$R"
R=$(ev "(()=>{const t=document.querySelector('canvas').getContext('2d'); return t?1:0})()"); ck "بوم سالم" "$R"
R=$(ev "state.mode==='playing'||state.mode==='intermission'||state.mode==='day'?1:0"); ck "بازی جریان دارد" "$R" "mode=$(ev "state.mode")"
agent-browser eval "saveGame(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "STORE.ok?1:0"); ck "سیو سالم" "$R"
agent-browser eval "GAME.v11.saveAndExit(); 'ok'" >/dev/null 2>&1; sleep 1.5
R=$(ev "state.mode==='start'?1:0"); ck "خروج به منو سالم" "$R" "mode=$(ev "state.mode")"

echo ""
echo "==================================="
echo "  v38: $P گذر / $F خراب"
[ "$F" = "0" ] && echo "  ALL GREEN ✅" || echo "  FAILURES ⚠️"
exit $F
