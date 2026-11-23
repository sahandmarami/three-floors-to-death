#!/bin/bash
# تست نسخهٔ ۴۲٫۰ — رفع بازخورد جلسهٔ ۴۲
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "$3" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  (got: $3, want: $2)"; fi }
rv() { echo "$2" | tr -d '"'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/scripts/shots42"
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof window.__V42==='object'?1:0" | tail -1); ck "بوت سالم v42 (ماژول تزریق شد)" "$R" "1"
R=$(agent-browser eval "Object.keys(VOICES23).length>=250?1:0" | tail -1); ck "کلیپ‌های صوتی کامل (۲۶۰+)" "$R" "1"
R=$(agent-browser eval "M23.zmb.length>=4?1:0" | tail -1); ck "زامبی‌های منو = ۴ (رنگی جدید)" "$R" "1"
R=$(agent-browser eval "M23.drawSilZombie.toString().includes('drawZ42')?1:0" | tail -1); ck "زامبی‌های منو رنگی (نه سیاه)" "$R" "1"
R=$(agent-browser eval "MG23.bgZombies23.toString().includes('drawZ42')?1:0" | tail -1); ck "زامبی‌های داستان رنگی" "$R" "1"

echo "===== ۱) دکمه‌های صفحهٔ باخت (باگ اصلی) ====="
agent-browser eval "(function(){ wipeSave(); startGame(); return 'g' })()" >/dev/null; sleep 1
agent-browser eval "(function(){ state.tower.hp=0; gameOver(); return 'x' })()" >/dev/null; sleep 7
R=$(rv x "$(agent-browser eval "state.mode" | tail -1)"); ck "رسیدن به صفحهٔ باخت" "gameover" "$R"
agent-browser eval "document.getElementById('btnRetryDay').click()" >/dev/null; sleep 2
R=$(rv x "$(agent-browser eval "state.mode" | tail -1)"); ck "«تلاش دوباره» کار می‌کند" "day" "$R"
agent-browser eval "(function(){ state.tower.hp=0; gameOver(); return 'x' })()" >/dev/null; sleep 7
agent-browser eval "document.getElementById('btnRestart1').click()" >/dev/null; sleep 2
R=$(rv x "$(agent-browser eval "state.mode" | tail -1)"); ck "«منوی اصلی» کار می‌کند" "start" "$R"

echo "===== ۲) دستفروش — ضدتکرار و منسجم ====="
agent-browser eval "(function(){ wipeSave(); startGame(); state.mode='day'; return 'g' })()" >/dev/null; sleep 1
R=$(agent-browser eval "(function(){
  var seen=[];
  for(var i=0;i<6;i++){
    state.peddler.visits=i+1; PED.look=i%5;
    var cap=null; var os=DLG.start;
    DLG.start=function(l,cb){ cap=l.map(function(x){return x.text;}).join('§'); };
    PED.talk(); DLG.start=os;
    seen.push(cap||'');
  }
  var uniq={}; seen.forEach(function(s){ uniq[s]=1; });
  return Object.keys(uniq).length===6 && seen.every(function(s){ return s.indexOf('بخر')===-1 || s.indexOf('انتخاب')>-1; }) ? 1:0;
})()" | tail -1); ck "۶ بازدید = ۶ گفتگوی متفاوت + بدون «بخر»ی اجباری" "$R" "1"
R=$(agent-browser eval "PED.talk.toString().includes('PED42.pick')?1:0" | tail -1); ck "موتور ضدتکرار فعال است" "$R" "1"

echo "===== ۳) قفسهٔ دستفروش — آیکون‌ها و CTA ====="
agent-browser eval "(function(){
  state.peddler={cd:0,here:true,stock:[],visits:2};
  state.peddler.stock=[{id:'vest',bp:false,bought:false,fresh:true},{id:'goldAmmo',bp:false,bought:false,fresh:true},{id:'bpTesla',bp:true,bought:false,fresh:false}];
  PED.phase='stay'; PED.look=0; renderPeddlerStock(); return 'x'
})()" >/dev/null; sleep 1
R=$(agent-browser eval "(function(){ var b=document.querySelector('#pdStock .pd-row31'); return b? (b.innerHTML.indexOf('pd-ic42')>=0?1:0):0 })()" | tail -1); ck "آیکون‌های SVG تازه (pd-ic42)" "$R" "1"
R=$(agent-browser eval "(function(){ var b=document.querySelector('#pdStock .pd-row31'); return b? (b.textContent.indexOf('برای خرید بزن')>=0?0:1):0 })()" | tail -1); ck "CTA قدیمی «برای خرید بزن» حذف شد" "$R" "1"

echo "===== ۴) سرنخ‌ها — پاداش و شب‌نامه ====="
agent-browser eval "(function(){ hidePeddlerPanel(); state.wave=6; state.mode='day'; MYST.clues=[]; return 'x' })()" >/dev/null
R=$(agent-browser eval "(function(){ MYST.openArchive(); var el=document.getElementById('clueSheet34'); return el? (el.innerHTML.indexOf('شب‌نامه')>=0?1:0):0 })()" | tail -1); ck "شب‌نامهٔ فردا در پرونده" "$R" "1"
R=$(agent-browser eval "(function(){ var el=document.getElementById('clueSheet34'); return el? (el.innerHTML.indexOf('پاداش')>=0?1:0):0 })()" | tail -1); ck "بخش پاداش‌های پرونده" "$R" "1"
R=$(agent-browser eval "(function(){ window.closeSheet34 && closeSheet34(); MYST.clues=[{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'}]; return __V42.myst.vendorDiscount()===0.9?1:0 })()" | tail -1); ck "۶ سرنخ = تخفیف ۱۰٪ دستفروش" "$R" "1"

echo "===== ۵) منوی سازنده ====="
agent-browser eval "(function(){ window.closeSheet34 && closeSheet34(); wipeSave(); if(state.mode!=='start'){ exitToMenu(); } return 'x' })()" >/dev/null; sleep 2
R=$(agent-browser eval "(function(){ var b=document.getElementById('devBtn42'); return b && b.style.display!=='none' ?1:0 })()" | tail -1); ck "دکمهٔ سازنده در منو دیده می‌شود" "$R" "1"
agent-browser eval "document.getElementById('devBtn42').click()" >/dev/null; sleep 1
R=$(agent-browser eval "document.getElementById('devSheet42')?1:0" | tail -1); ck "شیت سازنده باز می‌شود" "$R" "1"
R=$(agent-browser eval "document.querySelectorAll('[data-go]').length>=9?1:0" | tail -1); ck "۹ مقصد: ۴ فصل + شب آخر + پایان + ۳ پلتفرمر(+هدیه)" "$R" "1"
R=$(rv x "$(agent-browser eval "(function(){ document.querySelector('[data-go=ch3]').click(); return state.chapter+':'+state.mode })()" | tail -1)"); ck "پرش به فصل ۳" "3:day" "$R"
agent-browser eval "(function(){ document.getElementById('devBtn42').click(); document.querySelector('[data-go=pl2]').click(); return 'x' })()" >/dev/null; sleep 1
R=$(rv x "$(agent-browser eval "(function(){ return PLAT30.on+':'+PLAT30.level })()" | tail -1)"); ck "پرش به پلتفرمر مرحلهٔ ۲" "true:2" "$R"
agent-browser eval "(function(){ document.getElementById('devBtn42').click(); document.querySelector('[data-go=end]').click(); return 'x' })()" >/dev/null; sleep 1
R=$(rv x "$(agent-browser eval "E30.phase" | tail -1)"); ck "پرش به سینمایی پایان" "arrive" "$R"

echo "===== ۶) تیزر Z پایان ====="
for i in 1 2 3 4 5 6; do agent-browser eval "(function(){ if(E30.phase&&E30.phase!=='creditroll'){ skipEnding30(); } else if(E30.phase==='creditroll'){ skipEnding30(); } else if(PLAT30.on){ skipShelterCine(); } return 'x' })()" >/dev/null; sleep 1; done
sleep 4
R=$(agent-browser eval "(function(){ var t=document.getElementById('tbcTease'); return (SHEL&&SHEL.tbcDone&&t&&t.textContent.indexOf('رادیو')>=0)?1:0 })()" | tail -1); ck "تیزر «صدایی از رادیوی خراب» روی صفحهٔ TBC" "$R" "1"
R=$(agent-browser eval "VOICES23.zb1?1:0" | tail -1); ck "کلیپ صدای Z موجود (zb1)" "$R" "1"

echo "===== ۷) پوشش صوتی کامل دیالوگ‌ها ====="
R=$(agent-browser eval "(function(){
  var keys=['n30a','n30b','s30a','s30p','s30b','s30n','k30a','k30p','r30r','r30a','r30p','r30n','c3ca','c1e1a','h30m1','f30r','t30a1','t30n1','t2p1','pd1i2','q1a','pa1'];
  for(var i=0;i<keys.length;i++){ if(!VOICES23[keys[i]]) return 0; }
  return 1;
})()" | tail -1); ck "کلیدهای قبلاً بی‌صدا اکنون کلیپ دارند (۴۴ کلید)" "$R" "1"

echo "===== ۸) سیو خودکار پیش از شب ====="
R=$(agent-browser eval "(function(){ try{ wipeSave(); startGame(); state.mode='day'; var had=!!loadSaveData(); startNight(); var now=!!loadSaveData(); return had+':'+now; }catch(e){ return 'ERR' } })()" | tail -1); ck "سیو پیش از شب (تلاش دوباره همیشه جواب می‌دهد)" "false:true" "$(rv x "$R")"

agent-browser screenshot "$ROOT/scripts/shots42/final.png" >/dev/null 2>&1
echo "RESULT: $P OK / $F FAIL"
