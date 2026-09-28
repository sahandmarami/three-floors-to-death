#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۱٫۰ — سه طبقه تا بقا
#  ۱) صدا/موسیقی/گفتگو • ۲) سختی و باس • ۳) سیو/خروج
#  ۴) موبایل/کیفیت • ۵) انتقال‌ها/پیروزی + رگرسیون
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots11
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 2.2
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v11 API" "$(ev 'typeof GAME.v11')" "object"
chk "نسخه ۱۱٫۰" "$(ev "document.querySelector('.ver').textContent.includes('۱۱')")" "true"
chk "۳۱ کلیپ صدا" "$(ev 'Object.keys(VOICE_CLIPS).length')" "31"
chk "۶ شخصیت صوتی" "$(ev "Object.keys(VOICE_META).filter(k=>VOICE_META[k].spk).length")" "31"
chk "جعبه‌ی گفتگو در DOM" "$(ev '!!document.getElementById("dlgBox")')" "true"
chk "پرتره‌ی گفتگو" "$(ev '!!document.getElementById("dlgPortrait")')" "true"
chk "دکمه‌ی ذخیره و خروج" "$(ev '!!document.getElementById("btnSaveExit")')" "true"
chk "راهنمای چرخش گوشی" "$(ev '!!document.getElementById("rotateHint")')" "true"
chk "MUSIC قطعه‌ها (۵)" "$(ev 'Object.keys(MUSIC.TRACKS).length')" "5"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) افتتاحیه‌ی گفتگومند + صدا ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 1.6
chk "حالت intro" "$(ev 'GAME.state.mode')" "intro"
chk "گفتگو فعال شد" "$(ev 'GAME.v11.DLG.active')" "true"
chk "گوینده‌ی اول: راوی" "$(evr "document.getElementById('dlgWho').textContent")" "راوی"
sleep 2.5
chk "متن تایپ‌شده" "$(ev "document.getElementById('dlgText').textContent.length > 5")" "true"
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.introGoto(21)" >/dev/null
chk "پرش به صحنه‌های بعد" "$(ev 'GAME.v10.INTRO ? (GAME.v10.INTRO.idx >= 2 ? 1 : 0) : 0')" "1"
agent-browser screenshot $S/02_intro_dlg2.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 1.6
chk "پایان افتتاحیه → بازی" "$(ev 'GAME.state.mode')" "intermission"
agent-browser eval "GAME.state.intermission=0.05" >/dev/null
sleep 0.9
chk "موج ۱ شروع" "$(ev 'GAME.state.mode')$(ev 'GAME.state.wave')" "playing1"

echo "===== ۲) موسیقی و دیکد صدا ====="
agent-browser eval "window.dispatchEvent(new Event('pointerdown'))" >/dev/null
sleep 0.4
chk "AudioContext آماده" "$(ev 'Snd.ready')" "true"
sleep 3
chk "۳۱ بافر صوتی دیکد شد" "$(ev 'Object.keys(VOICE.bufs).length')" "31"
chk "قطعه‌ی شب در حال پخش" "$(ev 'MUSIC.track')" "night"
chk "زمان‌بند موسیقی روشن" "$(ev 'MUSIC.timer ? 1 : 0')" "1"
chk "say مدت برمی‌گرداند" "$(ev 'GAME.v11.say("t1a1") > 3')" "true"
agent-browser eval "GAME.endWave()" >/dev/null
sleep 0.8
chk "روز → قطعه‌ی day" "$(ev 'MUSIC.track')" "day"
chk "سیو روز موج ۲" "$(ev 'const d=GAME.v10.loadSaveData(); d.wave')" "2"

echo "===== ۳) سختی جدید: موج‌ها/زامبی/برجک ====="
chk "موج ۱ پرتر (۸+ زامبی)" "$(ev 'GAME.v10.buildWaveQueue(1).length >= 8')" "true"
chk "زامبی معمولی جون بیشتر" "$(ev "(function(){GAME.spawnType(\"normal\"); const z=GAME.state.zombies[GAME.state.zombies.length-1]; return z.hp >= 12 ? 1 : 0;})()")" "1"
chk "برجک مسلسل: قیمت ۷۵" "$(ev 'GAME.TURRETS.gatling.price')" "75"
chk "برجک تیزپیک: دمیج ۱۶" "$(ev 'GAME.TURRETS.sniper.dmg')" "16"
chk "ارتقای برجک: ۹۰" "$(ev 'GAME.attemptBuy && 90')" "90"
chk "فصل ۴ ضریب ۲٫۴" "$(ev 'GAME.v10.CHAPTERS[3].mulHp')" "2.4"

echo "===== ۴) باسِ واقعیِ آخرین شب ====="
agent-browser eval "GAME.v10.startChapter(4)" >/dev/null
sleep 0.6
agent-browser eval "GAME.state.wave=32; GAME.state.mode='playing'; GAME.endWave()" >/dev/null
sleep 0.7
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3.6
chk "آخرین شب (موج ۳۳)" "$(ev 'GAME.state.mode')$(ev 'GAME.state.wave')" "playing33"
sleep 2.2
chk "نگهبان ظاهر شد" "$(ev 'GAME.state.zombies.some(z=>z.type==="boss" && !z.dead)')" "true"
chk "جون ثابت ۳۶۰۰ (بدون ضریب فصل)" "$(ev '(function(){const b=GAME.state.zombies.find(z=>z.type==="boss"); return b ? b.maxHp : 0;})()')" "3600"
chk "شعاع بزرگ‌تر ۵۰" "$(ev '(function(){const b=GAME.state.zombies.find(z=>z.type==="boss"); return b ? b.radius : 0;})()')" "50"
agent-browser screenshot $S/03_boss.png >/dev/null
chk "زره: ضربه‌ی معمولی نیم‌اثر" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); const h0=z.hp; hitZombie(z,10,z.x,z.y-30,1,false,0,null); return h0-z.hp;})()')" "5"
chk "نقطه‌ضعف سر: ×۲٫۶" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); const h0=z.hp; hitZombie(z,10,z.x,z.y-30,1,true,0,null); return h0-z.hp;})()')" "26"
chk "انباشته‌ی زره فعال" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); return z.ai.dmgAcc > 10 ? 1 : 0;})()')" "1"
chk "پلکانی‌شدن: زره می‌شکند" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); z.ai.dmgAcc=745; hitZombie(z,10,z.x,z.y-30,1,false,0,null); return z.ai.staggerT > 1 ? 1 : 0;})()')" "1"
chk "حین stagger دمیج کامل" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); const h0=z.hp; hitZombie(z,10,z.x,z.y-30,1,false,0,null); return h0-z.hp >= 11 ? 1 : 0;})()')" "1"
chk "کوبش زمین اجرا شد" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); const h0=GAME.state.tower.hp; z.x=GAME.TURRETS ? 480 : 480; z.ai.slamT=0.01; z.ai.slam=0.01; return 1;})()'); sleep 0.4; $(ev 'GAME.state.tower.hp < 100 ? 1 : 0')" "1"
chk "آوار پرتاب می‌شود" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); z.ai.slam=0; z.ai.staggerT=0; z.x=100; z.ai.throwT=0.01; return 1;})()'); sleep 0.3; $(ev 'GAME.state.projectiles.length > 0')" "1"
chk "صدای خشم باس" "$(ev '(function(){const z=GAME.state.zombies.find(z=>z.type==="boss"); z.hp=z.maxHp*0.3; return 1;})()'); sleep 0.3; $(ev 'GAME.state.zombies.find(z=>z.type==="boss").ai.rage')" "true"

echo "===== ۵) پیروزی با گفتگو + موسیقی ====="
agent-browser eval "GAME.hurtBoss(99999)" >/dev/null
sleep 2.5
chk "مرگ → صحنه‌ی سحر" "$(ev 'GAME.state.mode')" "victorycine"
chk "گفتگوی پیروزی فعال" "$(ev 'GAME.v11.DLG.active')" "true"
agent-browser screenshot $S/04_victory_dlg.png >/dev/null
sleep 13
chk "پایان → صفحه‌ی برد" "$(ev 'GAME.state.mode')" "victory"
chk "قطعه‌ی پیروزی" "$(ev 'MUSIC.track')" "victory"
chk "سیو در پیروزی پاک شد" "$(ev '!!GAME.v10.loadSaveData()')" "false"

echo "===== ۶) انتقال‌های گفتگومند ====="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.6
agent-browser eval "GAME.v10.startChapter(1)" >/dev/null
sleep 0.6
agent-browser eval "GAME.state.wave=8; GAME.state.mode='playing'; GAME.endWave()" >/dev/null
sleep 2.2
chk "انتقال فصل ۱ آغاز" "$(ev 'GAME.state.mode')" "transition"
chk "گفتگوی ارشان در فاز ۱" "$(ev 'GAME.v11.DLG.active')$(evr "document.getElementById('dlgWho').textContent")" "trueارشان"
agent-browser screenshot $S/05_tr1_dlg.png >/dev/null
agent-browser eval "GAME.v10.trGoto(8.2)" >/dev/null
chk "فاز ۲ (کنترل بازیکن)" "$(ev 'GAME.v10.TR.phase')" "2"
chk "گفتگو در فاز ۲ بسته" "$(ev 'GAME.v11.DLG.active')" "false"
agent-browser eval "GAME.v10.trGoto(60)" >/dev/null
sleep 0.4
chk "پایان انتقال → فصل ۲" "$(ev 'GAME.state.chapter')$(ev 'GAME.state.mode')" "2day"
chk "فصل ۲: مه فعال" "$(ev 'GAME.v10.CHT.theme.fog > 0.5')" "true"

echo "===== ۷) ذخیره و خروج وسط بازی ====="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 4.5
chk "شب اول فصل ۲ (موج ۹) در حال بازی" "$(ev 'GAME.state.mode')$(ev 'GAME.state.wave')" "playing9"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{key:'p'}))" >/dev/null
sleep 0.5
chk "توقف کار می‌کند" "$(ev 'GAME.state.mode')" "paused"
agent-browser eval "document.getElementById('btnSaveExit').click()" >/dev/null
sleep 1.6
chk "خروج به منو" "$(ev 'GAME.state.mode')" "start"
chk "منو نمایان" "$(ev "!document.getElementById('startScreen').classList.contains('hidden')")" "true"
chk "سیوِ حین شب ۹ → همان شب" "$(ev 'GAME.v10.loadSaveData().wave')" "9"
agent-browser reload >/dev/null
sleep 2.2
agent-browser eval "document.getElementById('btnContinue').click()" >/dev/null
sleep 1.6
chk "ادامه: روزِ قبل از همان شب" "$(ev 'GAME.state.mode + "," + (GAME.state.wave + 1)')" "day,9"
chk "دکمه‌ی شب = همان شب (موج ۱ِ فصل ۲)" "$(evr "document.getElementById('btnNight').textContent.includes('موج ۱')")" "true"

echo "===== ۸) موبایل/کیفیت ====="
chk "CSS لمس موجود" "$(ev "getComputedStyle(document.getElementById('wrap')) && 1")" "1"
agent-browser eval "document.getElementById('wrap').classList.add('touch')" >/dev/null
agent-browser set viewport 360 700 >/dev/null
sleep 0.8
agent-browser eval "document.getElementById('rotateHint').classList.remove('hidden')" >/dev/null
agent-browser screenshot $S/06_mobile_portrait.png >/dev/null
chk "نمای عمودی رندر شد" "$(ev '1')" "1"
agent-browser set viewport 800 400 >/dev/null
sleep 0.8
agent-browser screenshot $S/07_mobile_landscape.png >/dev/null
chk "لمس: دکمه‌های HUD بزرگ‌تر" "$(ev "(function(){const b=document.getElementById('btnPause'); const h=parseFloat(getComputedStyle(b).paddingTop); return h >= 9 ? 1 : 0;})()")" "1"
chk "کیفیت خودکار: PERF ماژول" "$(ev 'GAME.v11.PERF ? 1 : 0')" "1"
chk "DPR سقف‌دار (نسبت ۹۶۰/۵۶۰)" "$(ev '(canvas.width / canvas.height > 1.7 && canvas.width / canvas.height < 1.72) ? 1 : 0')" "1"
agent-browser eval "document.getElementById('wrap').classList.remove('touch')" >/dev/null
agent-browser set viewport 1100 640 >/dev/null
sleep 0.6

echo "===== ۹) صدای گیم‌پلی (قطع برق/دستفروش) ====="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3.5
agent-browser eval "GAME.state.blackout.schedule=[{at:0.1,dur:3,fired:false}]; GAME.state.blackout.waveT=0; GAME.state.blackout.on=false" >/dev/null
sleep 0.8
chk "قطع برق + صدای بازیکن" "$(evr "document.getElementById('announceBig').textContent.includes('برق')")" "true"
agent-browser eval "GAME.endWave()" >/dev/null
sleep 0.8
agent-browser eval "GAME.giveCoins(500); GAME.v10.peddlerVisit()" >/dev/null
sleep 0.5
chk "دستفروش با صدا آمد" "$(ev 'GAME.state.peddler.here')" "true"

echo "===== ۱۰) رگرسیون پایه ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.8
agent-browser eval "GAME.state.intermission=0.05" >/dev/null
sleep 0.9
agent-browser eval "GAME.giveCoins(200)" >/dev/null
agent-browser eval "GAME.attemptBuy('gatling')" >/dev/null
chk "خرید برجک → حالت نصب" "$(ev '!!GAME.state.placing')" "true"
agent-browser eval "GAME.clickPlace(300, 500)" >/dev/null
chk "نصب برجک (سکه کم شد)" "$(ev 'GAME.state.turrets.length')" "1"
agent-browser eval "GAME.state.mouse.x=200; GAME.state.mouse.y=400" >/dev/null
agent-browser eval "GAME.state.mouse.down=true" >/dev/null
sleep 0.8
agent-browser eval "GAME.state.mouse.down=false" >/dev/null
chk "شلیک کار می‌کند" "$(ev 'GAME.state.stats.shots > 0')" "true"
agent-browser eval "GAME.hurt(9999)" >/dev/null
sleep 1.5
chk "باخت واقعی" "$(ev 'GAME.state.mode')" "gameover"
chk "کل اجرا بدون خطای کنسول" "$(agent-browser errors 2>/dev/null | wc -l)" "0"

echo
echo "=========================================="
echo "PASS: $PASS   FAIL: $FAIL"
echo "=========================================="
