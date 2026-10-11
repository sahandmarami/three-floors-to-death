#!/bin/bash
# تست نسخه‌ی ۲۲٫۰ — داستان کامل + صداهای جدید + UI + پایان سینمایی
URL="http://localhost:3000/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots22v
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.8
}

echo "===== ۱) بارگذاری + داده‌ی صداها ====="
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
R=$(agent-browser eval "typeof VOICES22==='object'?Object.keys(VOICES22).length:0" | tail -1); ck "VOICES22 با ۱۷۰ کلیپ (گرفته: $R)" "$([ "$R" = "170" ] && echo 1 || echo 0)"
R=$(agent-browser eval "VOICES22.i1n && VOICES22.i1n.d>8 && VOICES22.i1n.a.length>1000?1:0" | tail -1); ck "کلیپ i1n: مدت و base64 سالم" "$R"
R=$(agent-browser eval "document.querySelector('.menu-ver').textContent.includes('\u06F2\u06F2')?1:0" | tail -1); ck "پلاک نسخه ۲۲٫۰" "$R"
R=$(agent-browser eval "typeof STORY22==='object'?1:0" | tail -1); ck "STORY22 تعریف شده" "$R"
R=$(agent-browser eval "(()=>{const k=['i1n','i2n','i3a','i4p','w1a','c1w1a','c1w4r','c1er','t2n1','tb2p1','tb2o1','c3n1','c3ca','c3ea','t3h1','t3r1','c4n1','c4m1','c4f1','c4v1','c4vr','e1n','e2a','e3p','tbc1n','pd1a0','pd1l','fb1b2','fbz2'];return k.every(x=>VOICES22[x])?1:0})()" | tail -1); ck "همه‌ی کلیدهای صدای داستان موجودند" "$R"
R=$(agent-browser eval "(()=>{const miss=[];const scan=o=>{for(const k in o){const v=o[k];if(Array.isArray(v))scan(v);else if(v&&v.v&&!VOICES22[v.v])miss.push(v.v);}};scan(STORY22);scan(INTRO_DLGS);for(const ch in TR_DLGS)scan(TR_DLGS[ch]);for(const ch in TR_BARKS){const b=TR_BARKS[ch];if(b&&Array.isArray(b.outro))scan(b.outro);}return miss.length===0?1:0})()" | tail -1); ck "هیچ کلید صدای گمشده‌ای در دیالوگ‌ها نیست" "$R"
R=$(agent-browser eval "window.__errs?window.__errs.length:0" | tail -1); ck "خطای کنسول صفر (گرفته: $R)" "$([ "$R" = "0" ] && echo 1 || echo 0)"

echo "===== ۲) منوی بازطراحی‌شده ====="
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnContinue');return b&&getComputedStyle(b).borderColor&&!b.disabled?getComputedStyle(b).backgroundColor:'x'})()" | tail -1)
echo "    continue-btn bg: $R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('.ctl-btn');return b?getComputedStyle(b).borderColor:'x'})()" | tail -1)
echo "    ctl-btn border: $R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('skipCs')).display==='none'||document.getElementById('skipCs').classList.contains('hidden')?1:1" | tail -1); ck "skipCs موجودة" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/01_menu.png >/dev/null

echo "===== ۳) افتتاحیه‌ی جدید (۴ صحنه + متن رسمی) ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='intro'?1:0" | tail -1); ck "حالت intro فعال" "$R"
R=$(agent-browser eval "INTRO_SCENES.length===4?1:0" | tail -1); ck "۴ صحنه (رادیو به فاصله‌ی آرام رفت)" "$R"
R=$(agent-browser eval "INTRO_DLGS[0][0].v==='i1n'&&INTRO_DLGS[3].length===8?1:0" | tail -1); ck "دیالوگ صحنه ۱=i1n، صحنه ۴=۸ خط" "$R"
R=$(agent-browser eval "DLG.active?1:0" | tail -1); ck "گفتگوی افتتاحیه شروع شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/02_intro_dlg.png >/dev/null
R=$(agent-browser eval "document.getElementById('dlgWho').textContent" | tail -1)
echo "    گوینده: $R"
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 2.2
R=$(agent-browser eval "['playing','intermission'].includes(state.mode)?1:0" | tail -1); ck "بازی شروع شد پس از افتتاحیه" "$R"
sleep 2
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='w1a'?1:0" | tail -1); ck "گفتگوی «پیش از موج اول» (w1a) پخش شد" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null

echo "===== ۴) قلاب‌های داستانِ پس از موج (فصل ۱) ====="
agent-browser eval "state.wave=1;state.mode='playing';state.zombies=[];waveComplete();'ok'" >/dev/null; sleep 2.2
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "پنل روز پس از موج ۱" "$R"
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c1w1a'?1:0" | tail -1); ck "گفتگوی پس از موج ۱ (c1w1a) خودکار پخش شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/03_day_dlg.png >/dev/null
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.5

echo "===== ۵) فاصله‌ی آرام بی‌سیم (پس از موج ۴) ====="
agent-browser eval "state.wave=4;state.mode='playing';state.zombies=[];waveComplete();'ok'" >/dev/null; sleep 2.2
R=$(agent-browser eval "DLG.active&&DLG.lines.some(l=>l.who==='r')?1:0" | tail -1); ck "پیام بی‌سیم در فاصله‌ی آرام (r) پخش شد" "$R"
R=$(agent-browser eval "DLG.lines.find(l=>l.who==='r').v==='c1w4r'?1:0" | tail -1); ck "کلید c1w4r (صدای رادیویی)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.5

echo "===== ۶) پایان فصل ۱ → گفتگو → انتقال ماشین ====="
agent-browser eval "state.wave=6;state.mode='playing';state.zombies=[];waveComplete();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c1er'?1:0" | tail -1); ck "گفتگوی پایان فصل ۱ (پیام کانال) شروع شد" "$R"
R=$(agent-browser eval "TR===null?1:0" | tail -1); ck "انتقال هنوز شروع نشده (صبر برای گفتگو)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "TR!==null&&TR.ch===1?1:0" | tail -1); ck "بعد از گفتگو: انتقال فصل ۱ آغاز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/04_trans1_dlg.png >/dev/null
R=$(agent-browser eval "DLG.active&&(DLG.lines[0].v==='t1a1')?1:0" | tail -1); ck "دیالوگ فاز ۱ انتقال (فروریختن برج)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1

echo "===== ۷) outro چندخطی انتقال ۱ (شروع فصل ۲) ====="
agent-browser eval "(()=>{if(TR){TR.phase=2;try{mgBegin()}catch(e){};mgOutro();}return 'ok'})()" >/dev/null; sleep 2
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='t2n1'?1:0" | tail -1); ck "دیالوگ چندخطی outro: راویِ شروع فصل ۲ (t2n1)" "$R"
R=$(agent-browser eval "TR.outroDurEff>10?1:0" | tail -1); ck "مدت مؤثر outro طولانی شد برای گفتگو" "$R"
agent-browser eval "DLG.skip();if(TR){TR.outroDurEff=0.1;TR.outroDlgDone=true;TR.t=Math.max(TR.t,1);}'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "state.chapter===2?1:0" | tail -1); ck "فصل ۲ شروع شد پس از outro" "$R"
R=$(agent-browser eval "curCh().name.includes('\u0645\u0647')?1:0" | tail -1); ck "نام فصل ۲ = «مسیر مه‌آلود»" "$R"

echo "===== ۸) فصل ۳: شروع + سرنخ (موج ۱۸) ====="
agent-browser eval "GAME.v10.startChapter(3);'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c3n1'?1:0" | tail -1); ck "گفتگوی شروع فصل ۳ (ایستگاه متروکه)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1
agent-browser eval "state.wave=18;state.mode='playing';state.zombies=[];waveComplete();'ok'" >/dev/null; sleep 2.2
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c3ca'?1:0" | tail -1); ck "سرنجم برج مخابراتی پس از موج ۱۸ (c3ca)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.5

echo "===== ۹) فصل ۴: کات‌سین رسیدن به پناهگاه ====="
agent-browser eval "GAME.v10.startChapter(4);'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='sheltercine'&&SHEL.kind==='arrive'?1:0" | tail -1); ck "کات‌سین «رسیدن» فعال (kind=arrive)" "$R"
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c4n1'?1:0" | tail -1); ck "راوی: «پس از روزها فرار و مبارزه...»" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/05_arrival_walk.png >/dev/null
agent-browser eval "DLG.skip();if(SHEL){SHEL.phase='gate';SHEL.t=3.9}'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "SHEL&&SHEL.phase==='inside'?1:0" | tail -1); ck "فاز inside (ملاقات دکتر مریم)" "$R"
R=$(agent-browser eval "DLG.active&&DLG.lines.some(l=>l.who==='m')?1:0" | tail -1); ck "دکتر مریم حرف می‌زند (m)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/06_arrival_inside.png >/dev/null
R=$(agent-browser eval "(()=>{const el=document.getElementById('dlgWho');const t=el.textContent;const seh='\u0633\u0647\u0646\u062F';return DLG.lines[DLG.idx].who==='p'?t.includes(seh)?1:0:1})()" | tail -1); ck "نام بازیکن = «سهند» در DLG" "$R"
agent-browser eval "GAME.v19.skipShelterCine();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='day'&&state.wave===24?1:0" | tail -1); ck "پس از رسیدن: روز، موج بعدی ۲۵" "$R"

echo "===== ۱۰) پیش از موج پایانی (۳۶) ====="
agent-browser eval "state.wave=35;state.mode='day';state.goingNight=false;'ok'" >/dev/null
agent-browser eval "startNight();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c4f1'?1:0" | tail -1); ck "گفتگوی تنش پیش از موج ۳۶ (c4f1)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1

echo "===== ۱۱) پایان سینمایی کامل ====="
agent-browser eval "GAME.win();'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='victorycine'&&VC&&VC.phase==='dawn'?1:0" | tail -1); ck "سحر پیروزی (فاز dawn)" "$R"
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c4v1'?1:0" | tail -1); ck "«تموم شد؟ واقعاً تموم شد؟» (c4v1)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/07_victory_dawn.png >/dev/null
agent-browser eval "DLG.skip();VC.t=9;'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "VC&&VC.phase==='alarm'?1:0" | tail -1); ck "فاز آژیر (هشدار بی‌سیم)" "$R"
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='c4vr'?1:0" | tail -1); ck "هشدار بی‌سیم (c4vr) پخش شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/08_alarm.png >/dev/null
agent-browser eval "DLG.skip();VC.t=7;'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='sheltercine'&&SHEL&&SHEL.phase==='ending'?1:0" | tail -1); ck "پایان سینمایی: فاز ending (دوربین دور)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots22v/09_ending_cine.png >/dev/null
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='e1n'?1:0" | tail -1); ck "راوی پایان (e1n)" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "DLG.active&&DLG.lines[0].v==='e2a'?1:0" | tail -1); ck "آخرین گفتگو ارشان↔سهند (e2a)" "$R"
agent-browser eval "DLG.skip();SHEL._fadeT=(SHEL.t-9);'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "SHEL&&SHEL.phase==='tbc'?1:0" | tail -1); ck "صفحه‌ی «این داستان ادامه دارد...»" "$R"
sleep 4.5
agent-browser screenshot /home/z/my-project/scripts/shots22v/10_tbc.png >/dev/null
R=$(agent-browser eval "document.getElementById('tbcTitle').textContent.length>10?1:0" | tail -1); ck "تیتر «ادامه دارد» تایپ شد" "$R"
R=$(agent-browser eval "document.getElementById('tbcRestart')&&document.getElementById('tbcContinue')?1:0" | tail -1); ck "دکمه‌های «شروع دوباره» + «بازگشت به منوی اصلی»" "$R"
agent-browser eval "document.getElementById('tbcRestart').click();'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='intro'?1:0" | tail -1); ck "«شروع دوباره» → بازی جدید (افتتاحیه)" "$R"

echo "===== ۱۲) کش LRU صدا + warmup سبک ====="
agent-browser eval "GAME.v10.wipeSave();VOICE.warmup();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "VOICE._warmAll===true?1:0" | tail -1); ck "warmup انجام شد" "$R"
R=$(agent-browser eval "Object.keys(VOICE._bufs).length<=12?1:0" | tail -1); ck "فقط چند کلیپ گرم شد (رم کم)" "$R"

echo "===== ۱۳) سازگاری سیو قدیمی ====="
agent-browser eval "(()=>{localStorage.setItem('ttb3_save_v1',JSON.stringify({v:1,chapter:2,wave:9,coins:80,hp:120,maxHp:120,upgrades:{weapon:1,health:0,trap:0,turretUp:0,speed:0},owned:{pistol:true,shotgun:false,mg:false},stats:{kills:40,earned:200,shots:120,maxCombo:3},flash:{owned:true,battery:60},peddlerVisits:1}));const d=loadSaveData();return d&&d.wave===9?1:0})()" | tail -1; ck "سیو قدیمی v1 خوانده می‌شود" "$R"
R=$(agent-browser eval "(()=>{GAME.v10.continueGame();return 'ok'})()" >/dev/null; sleep 1.5; agent-browser eval "state.wave===8&&state.chapter===2?1:0" | tail -1); ck "ادامه از سیو: روزِ موج ۹ فصل ۲" "$R"

echo ""
echo "=================================="
echo "PASS: $P   FAIL: $F"
[ $F -eq 0 ] && echo "ALL GREEN ✅" || echo "SOME FAILURES ❌"
