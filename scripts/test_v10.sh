#!/bin/bash
# ============================================================
# تست خودکار مرحله‌ای نسخه‌ی ۱۰٫۰ — سه طبقه تا بقا (اصلاح‌شده)
#  مرحله ۱: فصل‌بندی و سیو • ۲: کوله/چراغ‌قوه • ۳: دستفروش
#  مرحله ۴: انتقال‌های سه‌فازی • ۵: افتتاحیه/باس/پیروزی + رگرسیون
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots10
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 -> got: $2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }   # بدون حذف فاصله‌ها

echo "===== ۰) بارگذاری ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 2.0
agent-browser errors --clear >/dev/null 2>&1
chk "بارگذاری بدون خطای صفحه" "$(ev 'typeof GAME')" "object"
chk "GAME.v10 API" "$(ev 'typeof GAME.v10')" "object"
chk "نسخه ۱۰٫۰" "$(ev "document.querySelector('.ver').textContent.includes('۱۰٫۰')")" "true"
chk "۱۵ کاشی پنل (۴ گروه)" "$(ev 'document.querySelectorAll(".bp-tile").length')" "15"
chk "گروه وسایل بقی" "$(ev "Array.from(document.querySelectorAll('.bp-grp')).map(g=>g.textContent).join('|')")" "وسایل"
chk "۶ جاخالی کوله" "$(ev 'document.querySelectorAll(".bpk-slot").length')" "6"
chk "دکمه ادامه غیرفعال (سیوی نیست)" "$(ev 'document.getElementById("btnContinue").disabled')" "true"
chk "نوار باتری چراغ در HUD" "$(ev '!!document.getElementById("battFill")')" "true"
agent-browser screenshot $S/00_menu.png >/dev/null

echo "===== ۱) مرحله ۱ — فصل‌بندی و سیو ====="
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 0.3
chk "بازی جدید → کات‌سین افتتاحیه" "$(ev 'GAME.state.mode')" "intro"
chk "تگ روایت audio موجود" "$(ev '!!document.getElementById("narrAudio")')" "true"
agent-browser screenshot $S/01_intro_scene1.png >/dev/null
agent-browser eval "GAME.v10.introGoto(19.5)" >/dev/null
chk "صحنه ۳ افتتاحیه (ساخت برج)" "$(ev 'GAME.v10.INTRO.idx')" "2"
agent-browser screenshot $S/02_intro_scene3.png >/dev/null
agent-browser eval "GAME.v10.introGoto(38)" >/dev/null
chk "صحنه ۵ (رادیو)" "$(ev 'GAME.v10.INTRO.idx')" "4"
agent-browser screenshot $S/02b_intro_radio.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 1.4
chk "پایان افتتاحیه → شروع بازی (وقفه)" "$(ev 'GAME.state.mode')" "intermission"
agent-browser eval "GAME.state.intermission=0.05" >/dev/null
sleep 0.8
chk "موج ۱ شروع شد" "$(ev 'GAME.state.mode + "," + GAME.state.wave')" "playing,1"
chk "برچسب HUD فصل ۱" "$(ev 'document.getElementById("waveText").textContent.includes("فصل ۱")')" "true"
agent-browser eval "GAME.endWave()" >/dev/null
sleep 0.5
chk "پایان موج → روز" "$(ev 'GAME.state.mode')" "day"
chk "سیو ساخته شد" "$(ev '!!GAME.v10.loadSaveData()')" "true"
chk "سیو: فصل ۱ موج ۲" "$(ev 'const d=GAME.v10.loadSaveData(); d.chapter+","+d.wave')" "1,2"
chk "دکمه ادامه فعال شد" "$(ev 'document.getElementById("btnContinue").disabled')" "false"
agent-browser screenshot $S/03_day_shop.png >/dev/null
# ریلود → ادامه
agent-browser reload >/dev/null
sleep 1.8
agent-browser eval "document.getElementById('btnContinue').click()" >/dev/null
sleep 1.2
chk "ادامه از سیو: روز فصل ۱ موج ۲" "$(ev 'GAME.state.mode + "," + GAME.state.chapter + "," + GAME.state.wave')" "day,1,1"
chk "دکمه شب: موج ۲" "$(ev "document.getElementById('btnNight').textContent.includes('۲')")" "true"
# سیو خراب → بدون کرش
agent-browser eval "localStorage.setItem('ttb3_save_v1','{bad json')" >/dev/null
agent-browser reload >/dev/null
sleep 1.8
chk "سیو خراب → ادامه غیرفعال" "$(ev 'document.getElementById("btnContinue").disabled')" "true"
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.4
chk "با سیو خراب هم بازی بالا می‌آید" "$(ev 'GAME.state.mode')" "intermission"
agent-browser eval "GAME.v10.wipeSave()" >/dev/null

echo "===== ۲) مرحله ۲ — کوله‌پشتی و چراغ‌قوه ====="
agent-browser eval "GAME.v10.startChapter(2)" >/dev/null
sleep 1.2
chk "فصل ۲: انبارها" "$(ev 'GAME.state.chapter + "," + GAME.v10.CHT.name')" "انبارها"
chk "پوسته برج فصل ۲" "$(ev 'GAME.state.towerVariant')" "1"
chk "مه فعال فصل ۲" "$(ev 'GAME.v10.CHT.theme.fog > 0.5')" "true"
chk "کارت فصل نمایش داده می‌شود" "$(ev 'document.getElementById("chapterCard").classList.contains("show")')" "true"
agent-browser screenshot $S/04_ch2_day.png >/dev/null
sleep 2.2
agent-browser eval "GAME.giveCoins(300)" >/dev/null
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyJ'}))" >/dev/null
sleep 0.25
chk "خرید چراغ‌قوه (J) → مالکیت + باتری ۱۰۰" "$(ev 'GAME.state.torch.owned + "," + Math.round(GAME.state.torch.battery)')" "true,100"
chk "سکه کم شد (۲۵۰ باقی)" "$(ev 'GAME.state.coins')" "250"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyV'}))" >/dev/null
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyC'}))" >/dev/null
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyK'}))" >/dev/null
sleep 0.3
chk "۳ آیتم در کوله" "$(ev 'GAME.state.backpack.filter(s=>s).length')" "3"
chk "جاخالی آیکون‌دار" "$(ev 'document.querySelectorAll(".bpk-slot:not(.empty)").length')" "3"
agent-browser eval "GAME.state.tower.hp=20" >/dev/null
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ'}))" >/dev/null
sleep 0.2
chk "مصرف کیت (Q) → شفای فوری" "$(ev 'Math.round(GAME.state.tower.hp)')" "90"
chk "اسلات ۱ خالی شد" "$(ev 'GAME.state.backpack[0]')" "null"
agent-browser eval "GAME.state.tower.hp=60" >/dev/null
agent-browser eval "GAME.v10.useItem(1)" >/dev/null
chk "کنسرو → regen فعال" "$(ev 'GAME.state.regen > 40')" "true"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{key:'l'}))" >/dev/null
chk "L خاموش کرد" "$(ev 'GAME.state.torch.on')" "false"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keydown',{key:'l'}))" >/dev/null
chk "L روشن کرد" "$(ev 'GAME.state.torch.on')" "true"
agent-browser eval "GAME.state.dayness=0; GAME.state.dayTarget=0" >/dev/null
sleep 0.8
chk "تاریکی مه فصل ۲ فعال (Dark>0.3)" "$(ev 'Math.round(GAME.v10.Dark.level*10) > 3')" "true"
agent-browser screenshot $S/05_ch2_fog_night.png >/dev/null
agent-browser eval "GAME.v10.setBlackout(true)" >/dev/null
sleep 1.4
chk "قطع برق → تاریکی کامل" "$(ev 'Math.round(GAME.v10.Dark.level*10) > 8')" "true"
chk "باتری در حال خالی شدن" "$(ev 'GAME.state.torch.battery < 100')" "true"
agent-browser screenshot $S/06_blackout_flashlight.png >/dev/null
agent-browser eval "GAME.v10.setBattery(1)" >/dev/null
sleep 2.2
chk "باتری تمام شد" "$(ev 'GAME.state.torch.battery')" "0"
agent-browser eval "GAME.v10.setBlackout(false)" >/dev/null
agent-browser eval "GAME.v10.setBattery(100)" >/dev/null

echo "===== ۳) مرحله ۳ — دستفروش مرموز ====="
agent-browser eval "GAME.giveCoins(700)" >/dev/null
agent-browser eval "GAME.v10.peddlerVisit()" >/dev/null
chk "دستفروش آمد (پنل)" "$(ev 'GAME.state.peddler.here + "," + (!document.getElementById("peddlerPanel").classList.contains("hidden"))')" "true,true"
chk "۱-۲ آیتم کمیاب" "$(ev 'GAME.state.peddler.stock.length >= 1 && GAME.state.peddler.stock.length <= 2')" "true"
agent-browser screenshot $S/07_peddler.png >/dev/null
agent-browser eval "const _r=Math.random; Math.random=()=>0.1;" >/dev/null
R0=$(ev 'GAME.state.backpack.filter(s=>s && GAME.v10.RARE[s.id]).length')
agent-browser eval "GAME.v10.buyRare(GAME.state.peddler.stock[0])" >/dev/null
agent-browser eval "Math.random=_r" >/dev/null
R1=$(ev 'GAME.state.backpack.filter(s=>s && GAME.v10.RARE[s.id]).length')
chk "کالای تقلبی → به کوله نرفت" "$(python3 -c "print('yes' if $R1 == $R0 else 'no')")" "yes"
agent-browser eval "GAME.v10.peddlerVisit()" >/dev/null
agent-browser eval "const _r2=Math.random; Math.random=()=>0.9;" >/dev/null
agent-browser eval "GAME.v10.buyRare(GAME.state.peddler.stock[0])" >/dev/null
agent-browser eval "Math.random=_r2" >/dev/null
chk "کالای واقعی → داخل کوله" "$(ev 'GAME.state.backpack.some(s=>s && GAME.v10.RARE[s.id])')" "true"
RID=$(ev 'GAME.state.backpack.findIndex(s=>s && GAME.v10.RARE[s.id])')
agent-browser eval "GAME.v10.useItem($RID)" >/dev/null
chk "فعال‌سازی باف کمیاب" "$(ev 'Object.values(GAME.state.buffs).some(Boolean)')" "true"

echo "===== ۴) مرحله ۴ — انتقال‌های سه‌فازی ====="
agent-browser eval "GAME.state.wave=8; GAME.state.mode='playing'; GAME.v10.startTransition(1)" >/dev/null
sleep 0.3
chk "فاز ۱ سینمایی (فروریختن)" "$(ev 'GAME.state.mode + "," + GAME.v10.TR.phase')" "transition,1"
agent-browser screenshot $S/08_tr1_collapse.png >/dev/null
agent-browser eval "GAME.v10.trGoto(6.7)" >/dev/null
agent-browser screenshot $S/09_tr1_car.png >/dev/null
chk "ماشین ارشان وارد شد" "$(ev '!!GAME.v10.TR')" "true"
agent-browser eval "GAME.v10.trGoto(8.05)" >/dev/null
chk "پایان فاز ۱ → فاز ۲ (کنترل بازیکن)" "$(ev 'GAME.v10.TR.phase')" "2"
sleep 1.0
agent-browser eval "GAME.v10.trResume()" >/dev/null
sleep 1.2
chk "موانع تولید می‌شوند" "$(ev 'MG.obs.length > 0')" "true"
chk "حالت سینمایی (UI مخفی)" "$(ev 'document.getElementById("wrap").classList.contains("cine-mode")')" "true"
agent-browser screenshot $S/10_tr2_road.png >/dev/null
agent-browser eval "GAME.v10.mgJump()" >/dev/null
chk "پرش کار می‌کند" "$(ev 'MG.pl.ground === false')" "true"
agent-browser eval "GAME.v10.trResume(); MG.scroll = MG.hidden.x - 360; MG.pl.y=-60; MG.pl.vy=0; MG.pl.ground=false" >/dev/null
sleep 0.4
chk "آیتم مخفی جمع شد → کوله" "$(ev 'MG.hidden.got')" "true"
chk "پیشرفت مسیر > ۹۰ متر" "$(python3 -c "print('yes' if $(ev 'Math.round(MG.scroll/PXM)') > 90 else 'no')")" "yes"
agent-browser eval "GAME.v10.trResume(); MG.scroll = MG.cfg.goalM * 24 + 10" >/dev/null
sleep 0.6
chk "پایان مسیر → فاز ۳" "$(ev 'GAME.v10.TR.phase')" "3"
agent-browser screenshot $S/11_tr3_outro.png >/dev/null
agent-browser eval "GAME.v10.trGoto(3.9)" >/dev/null
sleep 0.3
chk "پایان انتقال → فصل ۲ روز" "$(ev 'GAME.state.mode + "," + GAME.state.chapter')" "day,2"
chk "برجک‌ها ریست (روی برج قبلی ماندند)" "$(ev 'GAME.state.turrets.length')" "0"
chk "سیو شروع فصل" "$(ev 'GAME.v10.loadSaveData().chapter')" "2"
# تونل (۲→۳): باتری می‌خورَد
agent-browser eval "GAME.state.wave=16; GAME.state.mode='playing'; GAME.v10.startTransition(2)" >/dev/null
agent-browser eval "GAME.v10.trGoto(7.0)" >/dev/null
chk "تونل: فاز ۲" "$(ev 'GAME.v10.TR.phase')" "2"
B0=$(ev 'Math.round(GAME.state.torch.battery)')
agent-browser eval "GAME.v10.trResume()" >/dev/null
sleep 1.6
B1=$(ev 'Math.round(GAME.state.torch.battery)')
chk "باتری در تونل خالی می‌شود" "$(python3 -c "print('yes' if $B1 < $B0 else 'no')")" "yes"
agent-browser screenshot $S/12_tr2_tunnel.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 0.4
chk "رد کردن تونل → فصل ۳" "$(ev 'GAME.state.chapter + "," + GAME.v10.CHT.name')" "3,پاسگاه"
chk "فصل ۳: ماه خونی + خاکستر" "$(ev 'GAME.v10.CHT.theme.moon.blood + "," + GAME.v10.CHT.theme.ash')" "true,true"
agent-browser screenshot $S/13_ch3_day.png >/dev/null
# زیپ‌لاین (۳→۴)
agent-browser eval "GAME.state.wave=24; GAME.state.mode='playing'; GAME.v10.startTransition(3)" >/dev/null
agent-browser eval "GAME.v10.trGoto(7.2)" >/dev/null
chk "زیپ‌لاین: فاز ۲" "$(ev 'GAME.v10.TR.phase')" "2"
agent-browser eval "GAME.v10.trResume()" >/dev/null
sleep 0.8
agent-browser screenshot $S/14_tr2_zipline.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 0.4
chk "فصل ۴: برج مخابراتی + برف" "$(ev 'GAME.state.chapter + "," + GAME.v10.CHT.theme.snow')" "4,true"
agent-browser screenshot $S/15_ch4_day.png >/dev/null

echo "===== ۵) مرحله ۵ — آخرین شب و پیروزی ====="
agent-browser eval "GAME.state.wave=32; GAME.state.mode='playing'; GAME.endWave()" >/dev/null
sleep 0.5
chk "هشدار «آخرین شب» در روز" "$(ev "document.getElementById('dpHint').textContent.includes('آخرین شب')")" "true"
chk "دکمه شب = «آخرین شب»" "$(ev "document.getElementById('btnNight').textContent.includes('آخرین شب')")" "true"
agent-browser eval "GAME.startNight()" >/dev/null
sleep 0.4
chk "اسپلش هشدار آخرین شب" "$(ev 'document.getElementById("bossWarn").classList.contains("show")')" "true"
sleep 3.4
chk "آخرین شب شروع شد (موج ۳۳)" "$(ev 'GAME.state.mode + "," + GAME.state.wave')" "playing,33"
chk "نشان قفل فروشگاه" "$(ev '!document.getElementById("lockBadge").classList.contains("hidden")')" "true"
chk "تاریکی کامل آخرین شب" "$(ev 'Math.round(GAME.v10.Dark.level*10) >= 9')" "true"
sleep 2.0
chk "نگهبان آخرین شب ظاهر شد" "$(ev 'GAME.state.zombies.some(z=>z.type==="boss" && !z.dead)')" "true"
chk "نوار جون نگهبان" "$(ev 'document.getElementById("bossBar").style.display')" "block"
agent-browser screenshot $S/16_boss_finalnight.png >/dev/null
agent-browser eval "const bs=GAME.state.zombies.find(z=>z.type==='boss'); bs.ai.throwT=0.01; bs.x=200" >/dev/null
sleep 0.35
chk "آوار پرتاب شد" "$(ev 'GAME.state.projectiles.length > 0')" "true"
agent-browser eval "const pj=GAME.state.projectiles[0]; GAME.state.bullets.push({x:pj.x+4,y:pj.y,vx:0,vy:0,dmg:1,r:4,life:1,knock:0,dead:false,pellet:false})" >/dev/null
sleep 0.3
chk "گلوله آوار را ترکاند" "$(ev 'GAME.state.projectiles.length')" "0"
agent-browser eval "const bs2=GAME.state.zombies.find(z=>z.type==='boss'); bs2.ai.summonT=0.01" >/dev/null
sleep 0.4
chk "فراخوان زامبی سریع" "$(ev 'GAME.state.zombies.filter(z=>z.type==="fast").length > 0')" "true"
agent-browser eval "GAME.giveCoins(999)" >/dev/null
CB=$(ev 'GAME.state.coins')
agent-browser eval "GAME.v10.buy('health')" >/dev/null
chk "خرید در آخرین شب رد شد" "$(ev 'GAME.state.coins')" "$CB"
agent-browser eval "GAME.state.zombies.forEach(z=>{if(z.type!=='boss')z.dead=true})" >/dev/null
agent-browser eval "GAME.hurtBoss(99999)" >/dev/null
sleep 2.0
chk "مرگ نگهبان → صحنه پیروزی" "$(ev 'GAME.state.mode')" "victorycine"
agent-browser screenshot $S/16b_victory_cine.png >/dev/null
sleep 7.0
chk "پایان صحنه → صفحه برد" "$(ev 'GAME.state.mode')" "victory"
chk "آمار شب‌ها ۳۳/۳۳" "$(ev "document.getElementById('vStats').textContent.includes('۳۳')")" "true"
agent-browser screenshot $S/17_victory.png >/dev/null
chk "سیو در پیروزی پاک شد" "$(ev '!!GAME.v10.loadSaveData()')" "false"

echo "===== ۶) تنظیمات/درباره + رگرسیون ====="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.4
agent-browser eval "GAME.state.intermission=0.05" >/dev/null
sleep 0.5
agent-browser eval "document.getElementById('btnPause').click()" >/dev/null
sleep 0.2
chk "توقف کار می‌کند" "$(ev 'GAME.state.mode')" "paused"
agent-browser eval "document.getElementById('btnResume').click()" >/dev/null
sleep 0.2
chk "ادامه از توقف" "$(ev 'GAME.state.mode')" "playing"
agent-browser eval "document.getElementById('btnSettings').click()" >/dev/null
sleep 0.2
chk "پنل تنظیمات باز" "$(ev '!document.getElementById("settingsScreen").classList.contains("hidden")')" "true"
agent-browser screenshot $S/18_settings.png >/dev/null
agent-browser eval "document.getElementById('setMusic').click()" >/dev/null
sleep 0.15
chk "موسیقی خاموش + ذخیره" "$(ev 'JSON.parse(localStorage.getItem("ttb3_settings_v1")||"{}").music')" "false"
agent-browser eval "document.getElementById('setMusic').click()" >/dev/null
agent-browser eval "document.getElementById('closeSettings').click()" >/dev/null
agent-browser eval "document.getElementById('btnAbout').click()" >/dev/null
sleep 0.2
chk "درباره بازی باز" "$(ev '!document.getElementById("aboutScreen").classList.contains("hidden")')" "true"
agent-browser eval "document.getElementById('closeAbout').click()" >/dev/null
agent-browser eval "GAME.state.mouse.x=300; GAME.state.mouse.y=380" >/dev/null
agent-browser eval "GAME.state.mouse.down=true" >/dev/null
sleep 0.8
chk "شلیک رگرسیون" "$(ev 'GAME.state.stats.shots > 0')" "true"
agent-browser eval "GAME.state.mouse.down=false" >/dev/null
agent-browser eval "GAME.spawnType('normal')" >/dev/null
sleep 0.3
chk "زامبی رگرسیون" "$(ev 'GAME.state.zombies.length > 0')" "true"
agent-browser eval "GAME.hurt(999)" >/dev/null
sleep 0.6
chk "باخت واقعی" "$(ev 'GAME.state.mode')" "gameover"
agent-browser screenshot $S/19_gameover.png >/dev/null
ERRN=$(agent-browser errors 2>/dev/null | grep -c "✗")
chk "کل اجرا بدون خطای کنسول" "$(python3 -c "print('yes' if $ERRN == 0 else 'no')")" "yes"

echo "=========================================="
echo "PASS: $PASS   FAIL: $FAIL"
echo "=========================================="
agent-browser close >/dev/null 2>&1
