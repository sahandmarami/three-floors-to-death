#!/bin/bash
# test_v39.sh — v39: مه‌های سفید منو حذف کامل · زامبی‌های پس‌زمینه ۷→۳ ایستاده (خزنده حذف) ·
# سفیدیِ پایین رفع (شستشوی v37 فقط آسمان؛ استاپ پایین شفاف؛ هاله فقط بالای خط زمین)
# + رگرسیون: بازی سالم می‌ماند (اینترو/شروع/موج/پایان)
PASS=0; FAIL=0
ck() { if [ "$2" == "1" ] || [ "$2" == "1.0" ]; then PASS=$((PASS+1)); echo "  ✔ $1"; else FAIL=$((FAIL+1)); echo "  ✘ $1  [$3]"; fi }
URL="http://localhost:3002/three-floors-to-survival.html"
ev() { agent-browser eval "$1" 2>/dev/null | tail -1; }

mkdir -p /home/z/my-project/scripts/shots39
agent-browser set viewport 780 360 >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; agent-browser wait 4000 >/dev/null

echo "===== ۱) مه‌های سفید — حذف کامل ====="
agent-browser eval "M23.t=8; 'ok'" >/dev/null; sleep 1.5
R=$(ev "M23.fogA.length===0&&M23.fogB.length===0?1:0"); ck "آرایه‌های مه خالی (fogA=0, fogB=0)" "$R" "a=$(ev "M23.fogA.length")/b=$(ev "M23.fogB.length")"
R=$(ev "(()=>{const s=M23.draw.toString()+M23.init.toString(); return !s.includes('fogA.push')&&!s.includes('fogB.push')?1:0})()"); ck "هیچ push مهی در init/draw (کاملاً حذف)" "$R"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height*0.88),c.width,Math.floor(c.height*0.12)).data; let w=0,n=0; for(let i=0;i<d.length;i+=16){n++; if(d[i]>185&&d[i+1]>185&&d[i+2]>190)w++;} return (w/n<0.005)?1:0})()"); ck "نوار پایین: صفرِ پیکسل سفید (مه سفید رفته)" "$R" "white%=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height*0.88),c.width,Math.floor(c.height*0.12)).data; let w=0,n=0; for(let i=0;i<d.length;i+=16){n++; if(d[i]>185&&d[i+1]>185&&d[i+2]>190)w++;} return (100*w/n).toFixed(2)+'%'})()")"

echo "===== ۲) زامبی‌های پس‌زمینه — ۳ ایستاده، بدون خزنده ====="
R=$(ev "M23.zmb.length===3?1:0"); ck "دقیقاً ۳ زامبی (قبلاً ۷ — «زیاد شدن»)" "$R" "n=$(ev "M23.zmb.length")"
R=$(ev "M23.zmb.every(z=>z.ty==='tank'||z.ty==='normal')?1:0"); ck "همه ایستاده (نوع fast/خزنده حذف)" "$R" "types=$(ev "M23.zmb.map(z=>z.ty).join(',')")"
R=$(ev "(()=>{const ds=M23.zmb.map(z=>z.d); return ds.every(d=>d>=0.8)&&ds.some(d=>d>=1.3)?1:0})()"); ck "سه عمق متمایز (همه ≥۰٫۸ + پیش‌زمینه ≥۱٫۳)" "$R" "d=$(ev "M23.zmb.map(z=>z.d).join(',')")"
R=$(ev "(()=>{const s=M23.drawSilZombie.toString(); return !s.includes('crawl')&&!s.includes(\"'fast'\")?1:0})()"); ck "کد خزنده از drawSilZombie حذف شد" "$R"
R=$(ev "M23.drawSilZombie.toString().includes('rimC')&&M23.drawSilZombie.toString().includes('claw')?1:0"); ck "زامبی ایستاده ترسناک: نور لبه + چنگال + فک" "$R"
R=$(ev "(()=>{let ok=true; for(let i=0;i<M23.zmb.length;i++){const z=M23.zmb[i]; if(z.x<40||z.x>W-40)ok=false;} return ok?1:0})()"); ck "گشت‌زنی داخل کادر (بونس ۷۰px — بدون خروج از صفحه)" "$R" "xs=$(ev "M23.zmb.map(z=>Math.round(z.x)).join(',')")"
R=$(ev "(()=>{const bx=W*0.34; let clustered=0; for(const z of M23.zmb){ if(Math.abs(z.x-bx)<60) clustered++; } return clustered<=1?1:0})()"); ck "دیگر دور برج جمع نمی‌شوند (حداکثر ۱ نزدیک برج)" "$R" "clust=$(ev "(()=>{const bx=W*0.34; let c=0; for(const z of M23.zmb){ if(Math.abs(z.x-bx)<60)c++; } return c})()")"

echo "===== ۳) سفیدیِ پایین رفع — شستشو فقط آسمان ====="
R=$(ev "(()=>{const s=M23.draw.toString(); return s.includes(\"'rgba(12,13,24,0)')\")||s.includes('rgba(12,13,24,0)')?1:0})()"); ck "استاپ پایینِ شستشو شفاف است (دیگر زمین را نمی‌شوید)" "$R"
R=$(ev "(()=>{const s=M23.draw.toString(); return /GROUND_Y - 150, W, 150/.test(s)?1:0})()"); ck "هاله‌ی گرم فقط بالای خط زمین (۱۵۰px آسمان)" "$R"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return s/n>=42?1:0})()"); ck "منو هنوز روشن: نیمه‌ی بالا ≥۴۲ (منو روشن بماند)" "$R" "lum=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n).toFixed(1)})()")"
agent-browser eval "M23.bolt.t=-999; M23.bolt.next=1e12; 'ok'" >/dev/null; sleep 0.4
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} const L=s/n; return (L>=25&&L<42)?1:0})()"); ck "پایین: تمیزِ تیره ۲۵–۴۲ (نه سفیدشده نه سیاه‌چاله)" "$R" "lum=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height/2),c.width,Math.floor(c.height/2)).data; let s=0,n=0; for(let i=0;i<d.length;i+=40){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n).toFixed(1)})()")"
R=$(ev "(()=>{const c=document.querySelector('canvas'); const x=c.getContext('2d'); const d=x.getImageData(0,Math.floor(c.height*0.93),c.width,Math.floor(c.height*0.07)).data; let s=0,n=0; for(let i=0;i<d.length;i+=16){s+=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11);n++;} return (s/n)<45?1:0})()"); ck "نوارِ آخرِ صفحه تیره (<۴۵ — دکمه‌ها خوانا)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots39/t39_menu.png >/dev/null 2>&1

echo "===== ۴) رگرسیون — بازی سالم ====="
agent-browser eval "localStorage.clear(); wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(ev "state.mode==='playing'||state.mode==='intermission'||state.mode==='day'?1:0"); ck "شروع بازی → گیم‌پلی" "$R" "mode=$(ev "state.mode")"
agent-browser eval "GAME.skipToWave(2); state.coins=500; updateHUD(); 'ok'" >/dev/null; sleep 1.5
R=$(ev "state.wave>=2?1:0"); ck "موج ۲ اجرا می‌شود" "$R" "wave=$(ev "state.wave")"
R=$(ev "(()=>{const bp=document.getElementById('bpList'); return bp&&bp.children.length>0?1:0})()"); ck "پنل ساخت‌وساز سالم" "$R" "n=$(ev "document.getElementById('bpList')?document.getElementById('bpList').children.length:0")"
R=$(ev "state.tower.hp>0?1:0"); ck "برج زنده (tower.hp>0)" "$R" "hp=$(ev "state.tower?state.tower.hp:0")"
agent-browser eval "saveGame(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(ev "STORE.ok?1:0"); ck "سیو سالم" "$R"
agent-browser eval "GAME.v11.saveAndExit(); 'ok'" >/dev/null 2>&1; sleep 1.8
R=$(ev "state.mode==='start'?1:0"); ck "خروج به منو سالم (ریست صحنه)" "$R" "mode=$(ev "state.mode")"
R=$(ev "M23.inited===true&&M23.zmb.length===3?1:0"); ck "بازگشت به منو: صحنه با ۳ زامبیِ تازه" "$R" "n=$(ev "M23.zmb.length")"
agent-browser screenshot /home/z/my-project/scripts/shots39/t39_end.png >/dev/null 2>&1

echo ""
echo "!!!! v39: $PASS PASS / $FAIL FAIL !!!!"
exit $FAIL
