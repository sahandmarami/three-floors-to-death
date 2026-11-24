#!/bin/bash
# تست نسخهٔ ۴۳٫۰ — بازخورد جلسهٔ ۴۳
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "$3" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  (got: $3, want: $2)"; fi }
rv() { echo "$2" | tr -d '"'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/scripts/shots43"
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof window.__CINE43==='object'&&typeof window.__P43==='object'?1:0" | tail -1); ck "بوت سالم v43 (ماژول‌های چهارگانه تزریق شد)" "$R" "1"
R=$(agent-browser eval "Object.keys(VOICES23).length>=290?1:0" | tail -1); ck "کلیپ‌های صوتی کامل (۳۰۰+ با v43)" "$R" "1"
R=$(agent-browser eval "VOICES23.w43n1&&VOICES23.w43s4&&VOICES23.p43a?1:0" | tail -1); ck "کلیپ‌های تازهٔ w43 موجود" "$R" "1"

echo "===== ۱) سینمایی پایان — موتور و دیالوگ تازه ====="
agent-browser eval "(function(){ wipeSave(); hideOverlays(); introHardReset(); defeatHardReset(); try{PLAT30.on=false;}catch(e){} startEnding30(); return 'x' })()" >/dev/null; sleep 1
R=$(rv x "$(agent-browser eval "E30.phase" | tail -1)"); ck "شروع زنجیرهٔ پایان" "arrive" "$R"
R=$(agent-browser eval "updateEnding30.toString().includes('E43_DLG')?1:0" | tail -1); ck "موتور به‌روزرسانی جدید وصل است" "$R" "1"
R=$(agent-browser eval "renderEnding30.toString().includes('e43ScArrive')?1:0" | tail -1); ck "رندر سینمایی جدید وصل است" "$R" "1"
R=$(agent-browser eval "(function(){ var d=E43_DLG.arrive.map(function(x){return x.text}).join(' '); return d.indexOf('سی‌وشش شب')>=0&&d.indexOf('اسلحه')>=0?1:0 })()" | tail -1); ck "دیالوگ تازهٔ arrive (منسجم)" "$R" "1"
R=$(agent-browser eval "(function(){ var s=E43_DLG.station.map(function(x){return x.text}).join(' '); return s.indexOf('سازنده')>=0&&s.indexOf('تله')>=0?1:0 })()" | tail -1); ck "اعتراف سارا بازنویسی شده" "$R" "1"
R=$(agent-browser eval "(function(){ var f=E43_DLG.fire.length, s=E43_DLG.station.length; return f<=6&&s<=7?1:0 })()" | tail -1); ck "دیالوگ‌ها کوتاه شده‌اند (ضد حوصله‌سر‌بری)" "$R" "1"
sleep 3
R=$(rv x "$(agent-browser eval "(function(){ return DLG.lines&&DLG.lines.length? DLG.lines[0].v : 'none' })()" | tail -1)"); ck "صدای تازه روی خط اول پخش می‌شود (w43n1)" "w43n1" "$R"
agent-browser screenshot "$ROOT/scripts/shots43/ending_arrive.png" >/dev/null 2>&1

echo "===== ۲) پلتفرمر ماریوئی ====="
agent-browser eval "(function(){ try{VOICE.stop();DLG.skip();}catch(e){} startPlatformer(1); return 'x' })()" >/dev/null; sleep 1
R=$(agent-browser eval "PLAT30.on===true&&state.mode==='sheltercine'?1:0" | tail -1); ck "پلتفرمر روشن" "$R" "1"
R=$(agent-browser eval "(function(){ var g=P43.grid; var c=0; for(var r=0;r<11;r++){ if(g[r][10]==='#') c++; } return g&&g.length===14&&c===0?1:0 })()" | tail -1); ck "گرید تایل‌ها ساخته شد (۱۴ ردیف)" "$R" "1"
R=$(agent-browser eval "renderPlatformer.toString().includes('plat43')||renderPlatformer.toString().includes('SKY')?1:0" | tail -1); ck "رندر ماریوئی وصل است" "$R" "1"
R=$(agent-browser eval "(function(){ var z=P43.en.filter(function(e){return e.ty!=='c'}).length; return z>=10?1:0 })()" | tail -1); ck "دشمن‌ها روی زمین (۱۲+ زامبی مرحلهٔ ۱)" "$R" "1"
# پرش واقعی: زمین + صف پرش + حرکت مستقیم (بدون تداخل حلقهٔ رندر)
R=$(agent-browser eval "(function(){
  var p=P43.pl; p.y=11*40; p.vy=0; p.onG=true; var y0=p.y;
  PLAT30.jumpQueued=true; PLAT30.jumpHeld=true; P43.jumpWasHeld=false;
  plat43Input(1/60); P43.card=null;
  for(var i=0;i<10;i++){ plat43MoveP(1/60); }
  var dy=y0-p.y;
  return dy>40?1:0;
})()" | tail -1); ck "پرش واقعاً بالا می‌برد (>۴۰px در ۱۰ فریم)" "$R" "1"
R=$(agent-browser eval "(function(){
  var before=P43.coinsTotal;
  var p=P43.pl; p.x=10*40+20; p.y=11*40; p.vy=-720; p.onG=false; p.vx=0; P43.card=null;
  for(var i=0;i<28;i++){ plat43MoveP(1/60); }
  return P43.coinsTotal>before?1:0;
})()" | tail -1); ck "کوبیدن بلوک «؟» سکه می‌دهد" "$R" "1"
# لگدکوب دشمن
R=$(agent-browser eval "(function(){
  var alive=P43.en.filter(function(e){return !e.dead&&e.ty!=='c'});
  if(!alive.length) return 0;
  var e=alive[0]; var p=P43.pl;
  p.inv=0; p.x=e.x; p.y=e.y-28; p.vy=400; p.onG=false; P43.card=null; P43.dying=false;
  plat43Enemies(1/60); plat43Enemies(1/60);
  return e.dead===true?1:0;
})()" | tail -1); ck "لگدکوبِ دشمن از بالا کار می‌کند" "$R" "1"
# سیو
R=$(agent-browser eval "(function(){ plat43Save(); var raw=STORE.get('ttb43_plat'); return raw&&JSON.parse(raw).lvl===1?1:0 })()" | tail -1); ck "سیو پلتفرمر در STORE ذخیره می‌شود" "$R" "1"
# پایان مرحله → مرحلهٔ بعد
R=$(agent-browser eval "(function(){
  P43.pl.x=P43.flagX-6; P43.pl.y=11*40;
  for(var i=0;i<8;i++){ updatePlatformer(1/60); }
  return P43.done===true?1:0;
})()" | tail -1); ck "پرچم پایان مرحله فعال می‌شود" "$R" "1"
agent-browser screenshot "$ROOT/scripts/shots43/platformer.png" >/dev/null 2>&1

echo "===== ۳) زامبی‌های داستان — پا روی زمین ====="
R=$(agent-browser eval "MG23.bgZombies23.toString().includes('rowY')?1:0" | tail -1); ck "زامبی‌های پس‌زمینه زمین‌گیر شدند" "$R" "1"
R=$(agent-browser eval "(function(){ return typeof drawZ42==='function'?1:0 })()" | tail -1); ck "زامبی رنگی موجود" "$R" "1"

echo "===== ۴) شخصیت‌های سینمایی ====="
R=$(agent-browser eval "(function(){ var ids=['arash','arshan','maryam','sara','guard']; for(var i=0;i<ids.length;i++){ if(!CINE43.CH[ids[i]]) return 0; } return typeof CINE43.person==='function'?1:0 })()" | tail -1); ck "۵ کاراکتر سینمایی تعریف شده" "$R" "1"

echo "===== ۵) منوی سازنده — پرش به پلتفرمر/پایان ====="
agent-browser eval "(function(){ try{VOICE.stop();DLG.skip();}catch(e){} stopPlatformer(); wipeSave(); if(state.mode!=='start'){ exitToMenu(); } return 'x' })()" >/dev/null; sleep 2
agent-browser eval "document.getElementById('devBtn42').click()" >/dev/null; sleep 1
agent-browser eval "(function(){ document.querySelector('[data-go=pl2]').click(); return 'x' })()" >/dev/null; sleep 1
R=$(rv x "$(agent-browser eval "(function(){ return PLAT30.on+':'+P43.lvlNum })()" | tail -1)"); ck "پرش سازنده به پلتفرمر مرحلهٔ ۲" "true:2" "$R"
agent-browser eval "(function(){ document.getElementById('devBtn42').click(); document.querySelector('[data-go=end]').click(); return 'x' })()" >/dev/null; sleep 1
R=$(rv x "$(agent-browser eval "E30.phase" | tail -1)"); ck "پرش سازنده به سینمایی پایان" "arrive" "$R"

echo "===== ۶) دکمه‌های صفحهٔ باخت (رگرسیون) ====="
agent-browser eval "(function(){ try{VOICE.stop();DLG.skip();}catch(e){} E30.phase=''; stopPlatformer(); wipeSave(); startGame(); return 'g' })()" >/dev/null; sleep 1
agent-browser eval "(function(){ state.tower.hp=0; gameOver(); return 'x' })()" >/dev/null; sleep 7
R=$(rv x "$(agent-browser eval "state.mode" | tail -1)"); ck "رسیدن به صفحهٔ باخت" "gameover" "$R"
agent-browser eval "document.getElementById('btnRetryDay').click()" >/dev/null; sleep 2
R=$(rv x "$(agent-browser eval "state.mode" | tail -1)"); ck "«تلاش دوباره» کار می‌کند" "day" "$R"

echo "===== ۷) تیتراژ — خط تازه ====="
R=$(agent-browser eval "e43ScCredits.toString().includes('پروژهٔ Z')?1:0" | tail -1); ck "تیتراژ خلاصهٔ داستان دارد" "$R" "1"
R=$(agent-browser eval "(function(){ var e=E43_DLG.epilogue.map(function(x){return x.text}).join(' '); return e.indexOf('جاده‌ها مالِ ماست')>=0?1:0 })()" | tail -1); ck "اپیلوگ معنادار" "$R" "1"

agent-browser screenshot "$ROOT/scripts/shots43/final.png" >/dev/null 2>&1
echo "RESULT: $P OK / $F FAIL"
