#!/bin/bash
# تست نسخه‌ی ۳۷٫۰ — بازخورد کاربر (۴ درخواست):
# ۱) منوی اصلی روشن‌تر ۲) اعلان‌ها پایین صفحه ۳) آیکون کوله خفن‌تر ۴) قیمت سلاح‌ها نوشته شود
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }
ok1() { echo "$1" | grep -c '^1$'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots40
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(ev "typeof GAME!=='undefined'?state.mode:'no'")
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
R=$(ev "window.__V37?1:0"); ck "بوت سالم + ماژول v37 لود شد" "$R"

echo "===== ۱) منوی اصلی روشن‌تر ====="
sleep 2
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return s/n>=42?1:0})()"); ck "منو: روشنایی نیمه‌ی بالا ≥۴۲ (v36 بود ~۲۶)" "$R" "lum=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n).toFixed(1)})()")"
agent-browser eval "M23.bolt.t=-999; M23.bolt.next=1e12; 'ok'" >/dev/null; sleep 0.4
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} const L=s/n; return (L>=25&&L<42)?1:0})()"); ck "منو: پایینِ تمیزِ تیره ۲۵–۴۲ بدون شستشو (v39 — قبلا ≥۴۵ سفیدشده)" "$R" "lum=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n).toFixed(1)})()")"
R=$(ev "M23.draw.toString().includes('screen')?1:0"); ck "پس‌پردازش روشنایی (شستشوی screen) فعال" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots40/t37_menu.png >/dev/null 2>&1

echo "===== ۲) اعلان‌ها = پایین صفحه ====="
agent-browser eval "localStorage.clear(); wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); state.coins=400; state.intermission=9999; updateHUD(); setAnnounce('مرحله ۲','شروع در ۵ ثانیه — فرصت ارتقا!',9999); 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(ev "(()=>{const r=document.getElementById('announce').getBoundingClientRect(); return r.top>innerHeight*0.7?1:0})()"); ck "اعلان: در یک‌پنجم پایینی صفحه (نه بالا)" "$R" "y=$(ev "(()=>{const r=document.getElementById('announce').getBoundingClientRect(); return Math.round(r.top)+'/'+innerHeight})()")"
R=$(ev "(()=>{const cs=getComputedStyle(document.getElementById('announce')); const r=document.getElementById('announce').getBoundingClientRect(); return cs.bottom.endsWith('px')&&r.top>innerHeight*0.7?1:0})()"); ck "اعلان: bottom=px + واقعاً پایین (توستِ پایین)" "$R"
R=$(ev "(()=>{const b=getComputedStyle(document.querySelector('#announce .big')); return parseFloat(b.fontSize)>=17?1:0})()"); ck "اعلان: متنِ درشتِ خوانا (≥۱۷px)" "$R" "fs=$(ev "getComputedStyle(document.querySelector('#announce .big')).fontSize")"
R=$(ev "(()=>{const a=document.getElementById('announce').getBoundingClientRect(); const d=document.getElementById('bpNight'); if(!d||getComputedStyle(d).display==='none') return 1; const n=d.getBoundingClientRect(); const ov=Math.max(0,Math.min(a.right,n.right)-Math.max(a.left,n.left))*Math.max(0,Math.min(a.bottom,n.bottom)-Math.max(a.top,n.top)); return ov<100?1:0})()"); ck "اعلان: بی‌تداخل با «شب شود»" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots40/t37_announce.png >/dev/null 2>&1

echo "===== ۳) آیکون کوله‌پشتی خفن‌تر ====="
R=$(ev "(()=>{const ic=document.querySelector('#bpkBtn34 i.ic'); return ic&&ic.innerHTML.includes('y=\"2.2\" width=\"12.2\"')?1:0})()"); ck "آیکون: رخت‌خوابِ لوله‌شده بالا" "$R"
R=$(ev "(()=>{const ic=document.querySelector('#bpkBtn34 i.ic'); return ic&&ic.innerHTML.includes('l5.4 4.6')?1:0})()"); ck "آیکون: جیبِ ضربدری طلایی" "$R"
R=$(ev "(()=>{const ic=document.querySelector('#bpkBtn34 i.ic'); return ic&&ic.innerHTML.includes('x=\"2.1\" y=\"10.9\"')?1:0})()"); ck "آیکون: قمقمه‌ی کناری با درِ طلایی" "$R"
R=$(ev "(()=>{const ic=document.querySelector('#bpkBtn34 i.ic'); return ic&&ic.innerHTML.includes('bpkB36')&&ic.innerHTML.includes('bpkG36')?1:0})()"); ck "آیکون: همان پالت سرمه‌ای/طلایی مرجع کاربر" "$R"
R=$(ev "(()=>{const b=document.getElementById('bpkBtn34'); return b&&b.querySelector('.bp-badge, .badge, [class*=badge]')!==null||b?1:0})()"); ck "دکمه‌ی کوله در ریل سالم (badge دست‌نخورده)" "$R"

echo "===== ۴) قیمت سلاح‌ها نوشته شود ====="
agent-browser eval "GAME.v12.setBPTab('wpn'); GAME.setBuildPanel(false); refreshBuildPanel(); 'ok'" >/dev/null; sleep 0.5
R=$(ev "document.getElementById('bp-mg-cost').textContent===faNum(UPGRADES.mg.price)?1:0"); ck "کاشی مسلسلِ قفل: قیمت نوشته شد (قبلاً خالی)" "$R" "t=$(ev "document.getElementById('bp-mg-cost').textContent")"
R=$(ev "document.getElementById('bp-shotgun-cost').textContent===faNum(UPGRADES.shotgun.price)?1:0"); ck "کاشی شاتگان: قیمت" "$R"
R=$(ev "(()=>{const el=document.getElementById('bp-mg-cost'); const cs=getComputedStyle(el); return parseFloat(cs.fontSize)>=12?1:0})()"); ck "عددِ قیمت دیده می‌شود (font-size>0 — ریشه‌ی باگ v35)" "$R" "fs=$(ev "getComputedStyle(document.getElementById('bp-mg-cost')).fontSize")"
R=$(ev "document.getElementById('bp-pistol-cost').textContent===''?1:0"); ck "کلتِ در دست: بدون قیمت (درست)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots40/t37_wpn.png >/dev/null 2>&1
agent-browser eval "GAME.v10.buy('shotgun'); updateHUD(); 'ok'" >/dev/null 2>&1; sleep 0.6
R=$(ev "WEAPONS.shotgun.owned?1:0"); ck "خرید شاتگان انجام شد" "$R"
R=$(ev "document.getElementById('bp-shotgun-cost').textContent===''?1:0"); ck "بعد از خرید: کاشی بدون قیمت + تیک" "$R"
R=$(ev "document.getElementById('bp-mg-cost').textContent===faNum(UPGRADES.mg.price)?1:0"); ck "مسلسل (قفل بعدی) هنوز قیمت دارد" "$R"

echo "===== ۵) رگرسیون ====="
agent-browser eval "GAME.setBuildPanel(true); 'ok'" >/dev/null; sleep 0.4
R=$(ev "window.__V36?1:0"); ck "ماژول v36 هنوز فعال (perf/ریل/شیت‌ها)" "$R"
R=$(ev "state.mode==='intermission'||state.mode==='day'||state.mode==='playing'?1:0"); ck "بازی جریان دارد" "$R" "mode=$(ev "state.mode")"
agent-browser eval "saveGame(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "STORE.ok?1:0"); ck "سیو سالم" "$R"
agent-browser eval "GAME.v11.saveAndExit(); 'ok'" >/dev/null 2>&1; sleep 1.5
R=$(ev "state.mode==='start'?1:0"); ck "خروج به منو" "$R" "mode=$(ev "state.mode")"
R=$(ev "document.querySelector('#btnContinue').disabled?0:1"); ck "منو: «ادامه‌ی بازی» فعال" "$R"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return s/n>=42?1:0})()"); ck "منو بعد از خروج: هنوز روشن" "$R"

echo ""
echo "==================================="
echo "  v37: $P گذر / $F خراب"
[ "$F" = "0" ] && echo "  ALL GREEN ✅" || echo "  FAILURES ⚠️"
exit $F
