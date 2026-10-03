#!/bin/bash
# تست نسخه‌ی ۲۰٫۰ — سختی/فروشنده/برجک ویژه/پیشرفت سلاح/امتیاز/TBC/APK
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }
# بازی تازه + رد کردن افتتاحیه (با تأخیرِ doFade حساب می‌کنیم)
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
}

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3
mkdir -p /home/z/my-project/scripts/shots20

echo "===== ۱) ساختار: طول بازی + سختی + برجک‌های ویژه ====="
R=$(agent-browser eval "WAVES_CH.join()==='6,8,10,12'&&FINAL_WAVE===36?1:0" | tail -1); ck "موج‌ها ۶/۸/۱۰/۱۲ → ۳۶ شب" "$R"
R=$(agent-browser eval "waveChapter(6)===1&&waveChapter(7)===2&&waveChapter(14)===2&&waveChapter(15)===3&&waveChapter(24)===3&&waveChapter(25)===4?1:0" | tail -1); ck "مرزهای فصل: ۶/۱۴/۲۴" "$R"
R=$(agent-browser eval "buildWaveQueue(36).join()==='boss'?1:0" | tail -1); ck "موج ۳۶ = فقط نگهبان" "$R"
R=$(agent-browser eval "ZTYPES.normal.hpBase===11&&ZTYPES.tank.hpBase===64&&ZTYPES.boss.hpBase===7000?1:0" | tail -1); ck "جون زامبی‌ها/باس بالاتر (۱۱/۶۴/۷۰۰۰)" "$R"
R=$(agent-browser eval "TURRETS.gatling.dmg===1.6&&TURRETS.sniper.dmg===12&&TURRETS.tesla.chain===3&&TURRETS.missile.splash===95&&TURRETS.flame.burn===2.4?1:0" | tail -1); ck "برجک‌ها: تنزل پایه + سه برجک ویژه" "$R"
R=$(agent-browser eval "CHAPTERS[3].mulHp===2.10&&CHAPTERS[0].mulHp===1.10?1:0" | tail -1); ck "ضریب جون فصل‌ها بالا رفت (۱٫۱/۲٫۱)" "$R"
R=$(agent-browser eval "RARE.airstrike&&RARE.freezeBomb&&RARE.adrenaline&&BLUEPRINTS.tesla&&BLUEPRINTS.missile&&BLUEPRINTS.flame?1:0" | tail -1); ck "کالاهای تازه + ۳ نقشه‌ی برجک" "$R"
R=$(agent-browser eval "PED_LOOKS.length===5?1:0" | tail -1); ck "۵ چهره‌ی فروشنده" "$R"

echo "===== ۲) پیشرفت سلاح: کلت → شاتگان → مسلسل ====="
fresh
agent-browser eval "state.mode='day';'ok'" >/dev/null
R=$(agent-browser eval "WEAPONS.pistol.owned===true&&state.weapon==='pistol'?1:0" | tail -1); ck "شروع: کلت در دست" "$R"
R=$(agent-browser eval "GAME.v12.setBPTab('wpn',true);document.getElementById('bp-pistol').style.display!=='none'&&document.getElementById('bp-shotgun').style.display!=='none'&&document.getElementById('bp-mg').style.display!=='none'?1:0" | tail -1); ck "تب سلاح: هر سه تفنگ دیده می‌شوند (۲۱٫۱)" "$R"
R=$(agent-browser eval "document.getElementById('bp-pistol').classList.contains('armed')&&document.getElementById('bp-mg').classList.contains('locked')&&document.getElementById('bp-mg-cost').textContent==='🔒'?1:0" | tail -1); ck "کلت در دست؛ مسلسل با نشان قفل" "$R"
agent-browser eval "GAME.giveCoins(800);GAME.attemptBuy('shotgun');'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "WEAPONS.shotgun.owned===true&&WEAPONS.pistol.owned===false&&state.weapon==='shotgun'?1:0" | tail -1); ck "خرید شاتگان → کلت تحویل شد" "$R"
R=$(agent-browser eval "GAME.v12.setBPTab('wpn',true);document.getElementById('bp-shotgun').classList.contains('armed')&&document.getElementById('bp-mg').classList.contains('locked')===false?1:0" | tail -1); ck "بعد از خرید: شاتگان در دست؛ مسلسل قابل خرید (۲۱٫۱)" "$R"
R=$(agent-browser eval "GAME.selectWeapon('pistol');state.weapon==='shotgun'?1:0" | tail -1); ck "انتخاب کلتِ تحویل‌شده رد می‌شود" "$R"
agent-browser eval "GAME.attemptBuy('mg');'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "WEAPONS.mg.owned===true&&WEAPONS.shotgun.owned===false&&state.weapon==='mg'?1:0" | tail -1); ck "خرید مسلسل → شاتگان تحویل شد" "$R"
R=$(agent-browser eval "collectSave().owned.pistol===false&&collectSave().owned.mg===true?1:0" | tail -1); ck "سیو: مالکیت کلت/مسلسل ذخیره می‌شود" "$R"

echo "===== ۳) برجک‌های ویژه: قفل → نقشه → نصب → شلیک ====="
agent-browser eval "GAME.v12.setBPTab('tur',true);'ok'" >/dev/null
R=$(agent-browser eval "document.getElementById('bp-tesla').style.display==='none'&&document.getElementById('bp-missile').style.display==='none'&&document.getElementById('bp-flame').style.display==='none'?1:0" | tail -1); ck "بدون نقشه: سه برجک ویژه پنهان‌اند" "$R"
R=$(agent-browser eval "GAME.attemptBuy('tesla');state.turrets.length===0?1:0" | tail -1); ck "خرید بدون نقشه رد می‌شود" "$R"
agent-browser eval "GAME.v20.setBP('tesla');GAME.v20.setBP('missile');GAME.v20.setBP('flame');'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "document.getElementById('bp-tesla').style.display!=='none'&&document.getElementById('bp-missile').style.display!=='none'&&document.getElementById('bp-flame').style.display!=='none'?1:0" | tail -1); ck "با نقشه: هر سه ظاهر می‌شوند" "$R"
agent-browser eval "GAME.placeTurret('tesla',240,GROUND_Y+6);GAME.placeTurret('missile',700,GROUND_Y+6);GAME.placeTurret('flame',180,GROUND_Y+6);'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "state.turrets.filter(t=>t.type==='tesla').length===1&&state.turrets.filter(t=>t.type==='missile').length===1&&state.turrets.filter(t=>t.type==='flame').length===1?1:0" | tail -1); ck "نصب تسلا/موشک/شعله" "$R"
agent-browser eval "(()=>{state.zombies=[];state.mode='playing';spawnZombie('normal');const q=state.zombies[0];q.x=250;q.y=GROUND_Y;q.hp=500;q.maxHp=500;return 'ok'})()" >/dev/null; sleep 1.4
R=$(agent-browser eval "(()=>{const q=state.zombies.find(z=>!z.dead);return q&&q.hp<500?1:0})()" | tail -1); ck "تسلا به زامبیِ در برد آذرخش زد" "$R"
agent-browser eval "(()=>{state.zombies=state.zombies.filter(z=>z.dead);spawnZombie('tank');const q=state.zombies[state.zombies.length-1];q.x=690;q.y=GROUND_Y;q.hp=900;q.maxHp=900;return 'ok'})()" >/dev/null; sleep 3.2
R=$(agent-browser eval "(()=>{const q=state.zombies.find(z=>!z.dead&&Math.abs(z.x-700)<200);return q&&q.hp<900?1:0})()" | tail -1); ck "موشک‌انداز: انفجارِ نزدیکِ هدف" "$R"
agent-browser eval "(()=>{state.zombies=state.zombies.filter(z=>z.dead);spawnZombie('normal');const q=state.zombies[0];q.x=190;q.y=GROUND_Y;q.hp=300;q.maxHp=300;window.__burn0=q.hp;return 'ok'})()" >/dev/null; sleep 1.8
R=$(agent-browser eval "(()=>{const q=state.zombies.find(z=>!z.dead);return q&&(q.burn>0||q.hp<window.__burn0)?1:0})()" | tail -1); ck "شعله‌افکن: آتش‌گیرندگی فعال" "$R"
R=$(agent-browser eval "state.bps.tesla===true&&collectSave().bps.tesla===true?1:0" | tail -1); ck "سیو: نقشه‌های ساخت ذخیره می‌شوند" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/01_special_turrets.png >/dev/null
agent-browser eval "state.zombies=[];state.turrets=[];'ok'" >/dev/null

echo "===== ۴) فروشنده‌ی مرموز: چهره + جهت + کالای تازه ====="
fresh
agent-browser eval "state.mode='day';state.peddler.visits=0;GAME.v10.peddlerVisit();'ok'" >/dev/null
R=$(agent-browser eval "PED.active===true&&PED.look===0&&PED.dirFrom===1?1:0" | tail -1); ck "بازدید ۱: چهره‌ی کلاسیک از چپ" "$R"
R=$(agent-browser eval "state.peddler.visits===1&&state.peddler.here===true?1:0" | tail -1); ck "شمارنده‌ی بازدید = ۱" "$R"
R=$(agent-browser eval "state.peddler.stock.length>=1&&state.peddler.stock.every(it=>it.bp?BLUEPRINTS[it.id]:RARE[it.id])?1:0" | tail -1); ck "قفسه از استخرِ معتبر" "$R"
agent-browser eval "PED.update(4.2);'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "PED.phase==='talk'?1:0" | tail -1); ck "رسید به برج → گفتگو (فاز talk)" "$R"
agent-browser eval "DLG.skip();PED.openShop();'ok'" >/dev/null; sleep 0.4
R=$(agent-browser eval "!document.getElementById('peddlerPanel').classList.contains('hidden')?1:0" | tail -1); ck "قفسه‌ی کالا باز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/02_peddler_look0.png >/dev/null
# بازدید دوم: چهره و جهت دیگر
fresh
agent-browser eval "state.mode='day';state.peddler.visits=1;GAME.v10.peddlerVisit();'ok'" >/dev/null
R=$(agent-browser eval "PED.look===1&&PED.dirFrom===-1&&PED.x>W-60?1:0" | tail -1); ck "بازدید ۲: چهره‌ی کلاه‌لبه‌گرد از راست" "$R"
agent-browser eval "PED.update(4.2);'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "PED.phase==='talk'&&PED.x<TOWER.x+200?1:0" | tail -1); ck "از راست به سمت برج رسید" "$R"
agent-browser eval "DLG.skip();PED.openShop();'ok'" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots20/03_peddler_look1.png >/dev/null
# خرید نقشه از قفسه
R=$(agent-browser eval "(()=>{if(!state.peddler.stock.some(it=>it.bp&&!it.bought))state.peddler.stock.push({id:'tesla',bp:true,bought:false});const bp=state.peddler.stock.find(it=>it.bp&&!it.bought);GAME.giveCoins(2000);buyRare(bp);return state.bps[bp.id]===true?1:0})()" | tail -1); ck "خرید نقشه → برجک باز شد" "$R"
R=$(agent-browser eval "(()=>{const it=state.peddler.stock.find(i=>!i.bp&&!i.bought);if(!it)return 0;GAME.giveCoins(2000);const _mr=Math.random;Math.random=()=>0.9;buyRare(it);Math.random=_mr;return state.backpack.some(s=>s&&s.id===it.id)?1:0})()" | tail -1); ck "خرید کالای معمولی → کوله (بدون کلک)" "$R"

echo "===== ۵) کالاهای تازه: حمله‌ی هوایی/بمب یخی/آدرنالین ====="
agent-browser eval "state.mode='day';'ok'" >/dev/null
agent-browser eval "(()=>{state.zombies=[];spawnZombie('normal');const q=state.zombies[0];q.x=200;q.hp=200;q.maxHp=200;return 'ok'})()" >/dev/null
agent-browser eval "state.backpack=[{id:'airstrike'},null,null,null,null,null];GAME.v10.useItem(0);'ok'" >/dev/null; sleep 0.4
R=$(agent-browser eval "(()=>{const q=state.zombies.find(z=>!z.dead);return !q||q.hp<200?1:0})()" | tail -1); ck "حمله‌ی هوایی: زامبی کوبیده شد" "$R"
R=$(agent-browser eval "state.backpack[0]===null?1:0" | tail -1); ck "آیتم مصرف‌شده حذف شد" "$R"
agent-browser eval "state.backpack=[{id:'freezeBomb'},null,null,null,null,null];GAME.v10.useItem(0);'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "state.powerTimers.freeze>=5?1:0" | tail -1); ck "بمب یخی → انجماد فعال" "$R"
agent-browser eval "state.backpack=[{id:'adrenaline'},null,null,null,null,null];GAME.v10.useItem(0);'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "state.adren>10&&state.powerTimers.rapid>10?1:0" | tail -1); ck "آدرنالین → تایمرها فعال" "$R"
R=$(agent-browser eval "weaponDmg(WEAPONS.pistol)>WEAPONS.pistol.dmg?1:0" | tail -1); ck "آدرنالین: دمیج دوبرابر (weaponDmg)" "$R"

echo "===== ۶) مینی‌گیم: امتیاز + کمبوی «نزدک بود!» + بوست ====="
fresh
agent-browser eval "GAME.skipToWave(6);'ok'" >/dev/null; sleep 2.2
R=$(agent-browser eval "state.mode==='playing'?1:0" | tail -1); ck "موج ۶ (آخرِ فصل ۱) شروع شد" "$R"
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ch===1&&GAME.v10.TR.phase===1?1:0" | tail -1); ck "پایان موج ۶ → انتقال فصل ۱" "$R"
agent-browser eval "GAME.v10.trGoto(8.5);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "MG.cfg.theme==='drive'&&DRV.score>=0?1:0" | tail -1); ck "مینی‌گیم رانندگی فعال" "$R"
agent-browser eval "GAME.v10.trResume();'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "DRV.score>50?1:0" | tail -1); ck "امتیازِ مسافت جمع می‌شود (>۵۰)" "$R"
agent-browser eval "(()=>{window.__sc0=DRV.score;drvNearMiss({k:1,wx:DRV.px+430,hw:130});return 'ok'})()" >/dev/null; sleep 0.2
R=$(agent-browser eval "(()=>{return (DRV.combo>=1&&DRV.boost>0&&DRV.score>window.__sc0+20)?1:0})()" | tail -1); ck "«نزدک بود!» → کمبو + بوست + امتیاز" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/04_mg_score.png >/dev/null
agent-browser eval "GAME.v10.trResume();DRV.T=DRV.goalT-40;DRV.px=roadCXf(DRV.T);'ok'" >/dev/null; sleep 4.5
R=$(agent-browser eval "state.chapter===2?1:0" | tail -1); ck "پایان انتقال → فصل ۲" "$R"

echo "===== ۷) باس ۲۰٫۰: جون + زره ضدِّبرجک ====="
fresh
agent-browser eval "GAME.skipToWave(36);'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');return b&&Math.round(b.maxHp)===7000?1:0})()" | tail -1); ck "باس با ۷۰۰۰ جون متولد شد" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.dmgAcc=0;b.ai.staggerT=0;b.hp=b.maxHp;const hp0=b.hp;hitZombie(b,100,b.x,b.y-40,1,false,0,'gatling');return (hp0-b.hp)<=34?1:0})()" | tail -1); ck "گلوله‌ی برجک ×۰٫۳۳ (۱۰۰ → ~۱۰)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.dmgAcc=0;b.ai.staggerT=0;b.hp=b.maxHp;const hp0=b.hp;hitZombie(b,100,b.x,b.y-40,1,false,0,'player');return (hp0-b.hp)<=38?1:0})()" | tail -1); ck "تیر بازیکن: زره معمولی (~۳۰)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.dmgAcc=0;b.ai.staggerT=0;b.hp=b.maxHp;const hp0=b.hp;hitZombie(b,100,b.x,b.y-40,1,true,0,'player');return (hp0-b.hp)>100?1:0})()" | tail -1); ck "کریتِ بازیکن ×۱٫۲۲×۲ (>۱۰۰)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.staggerT=1;b.ai.dmgAcc=0;b.hp=b.maxHp;const hp0=b.hp;hitZombie(b,100,b.x,b.y-40,1,false,0,'gatling');return (hp0-b.hp)>=95?1:0})()" | tail -1); ck "پنجره‌ی زره‌ترکیده: برجک کامل می‌خورَد" "$R"
agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(b)b.hp=b.maxHp*0.6;return 'ok'})()" >/dev/null; sleep 0.6
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');return b&&b.ai&&b.ai.hardened===true?1:0})()" | tail -1); ck "۶۲٪ → فاز دوم (زره سنگین)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.charge=0.5;b.ai.dash=0;b.ai.breakAcc=0;b.ai.staggerT=0;hitZombie(b,600,b.x,b.y-40,1,false,0,'player');return (b.ai.charge===0&&b.ai.staggerT>0)?1:0})()" | tail -1); ck "یورش با آتش متمرکز قطع می‌شود (آستانه ۱۳۰)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');return b&&b.ai&&b.ai.turretWarned===true?1:0})()" | tail -1); ck "هشدار «زره ضدِّبرجک» ارشان داده شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/05_boss.png >/dev/null

echo "===== ۸) پناهگاه + پایان: TBC → منو (بدون صفحه‌ی برد) ====="
agent-browser eval "GAME.v19.startShelterCine();'ok'" >/dev/null; sleep 0.5
agent-browser eval "GAME.v19.shelterGoto('inside',1.5);'ok'" >/dev/null; sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots20/06_shelter_inside.png >/dev/null
agent-browser eval "GAME.v19.startTbcScreen();'ok'" >/dev/null; sleep 4.5
R=$(agent-browser eval "document.getElementById('tbcTitle').textContent.indexOf('ادامه دارد')>=0?1:0" | tail -1); ck "متن کامل «این داستان ادامه دارد...»" "$R"
R=$(agent-browser eval "document.getElementById('tbcContinue').textContent.indexOf('منوی اصلی')>=0&&document.getElementById('tbcContinue').textContent.indexOf('پیروزی')<0?1:0" | tail -1); ck "دکمه‌ی اصلی: «بازگشت به منوی اصلی» (بدون برد)" "$R"
R=$(agent-browser eval "document.getElementById('tbcStats')?1:0" | tail -1); ck "دکمه‌ی کوچک کارنامه موجود است" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/07_tbc.png >/dev/null
agent-browser eval "GAME.v19.tbcContinueToMenu();'ok'" >/dev/null; sleep 1.2
R=$(agent-browser eval "state.mode==='start'&&!document.getElementById('startScreen').classList.contains('hidden')?1:0" | tail -1); ck "ادامه → مستقیم منوی اصلی" "$R"
agent-browser eval "GAME.v19.startShelterCine();GAME.v19.startTbcScreen();'ok'" >/dev/null; sleep 0.3
agent-browser eval "GAME.v19.tbcShowStats();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "state.mode==='victory'&&document.getElementById('vicNights').textContent==='۳۶'?1:0" | tail -1); ck "کارنامه → صفحه‌ی برد با «۳۶ شب»" "$R"

echo "===== ۹) APK-ready: متا + دکمه‌ی بازگشت + بسته ====="
R=$(agent-browser eval "document.querySelector('meta[name=viewport]').content.indexOf('viewport-fit=cover')>=0?1:0" | tail -1); ck "viewport-fit=cover (ناچ/ایفون)" "$R"
R=$(agent-browser eval "typeof apkBackButton==='function'&&typeof GAME.v20.apkBackButton==='function'?1:0" | tail -1); ck "هندلر دکمه‌ی بازگشت اندروید" "$R"
R=$(agent-browser eval "getComputedStyle(document.body).overscrollBehavior==='none'?1:0" | tail -1); ck "overscroll-behavior: none (بدون pull-to-refresh)" "$R"
fresh
R=$(agent-browser eval "(()=>{apkBackButton();return state.mode==='paused'?1:0})()" | tail -1); ck "Back وسط بازی → توقف" "$R"
R=$(agent-browser eval "(()=>{apkBackButton();return ['playing','day','intermission'].includes(state.mode)?1:0})()" | tail -1); ck "Back دوباره → ادامه‌ی بازی" "$R"
R=$(test -f /home/z/my-project/download/apk/www/index.html && echo 1 || echo 0); ck "بسته‌ی APK: www/index.html موجود" "$R"
R=$(test -f /home/z/my-project/download/apk/capacitor.config.json && echo 1 || echo 0); ck "بسته‌ی APK: capacitor.config.json" "$R"
R=$(test -f /home/z/my-project/download/apk/README-APK.md && echo 1 || echo 0); ck "بسته‌ی APK: راهنمای فارسی ساخت" "$R"
R=$(test -f /home/z/my-project/download/apk/icon.png && echo 1 || echo 0); ck "بسته‌ی APK: آیکون ۵۱۲px" "$R"

echo "===== ۱۰) رگرسیون: جریان اصلی + صفر خطا ====="
fresh
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "state.mode==='playing'&&state.zombies.length>0?1:0" | tail -1); ck "موج ۲: زامبی‌ها می‌آیند" "$R"
R=$(agent-browser eval "state.zombies.every(z=>z.maxHp>=Math.round(ZTYPES[z.type].hpBase))?1:0" | tail -1); ck "جون زامبی‌ها با مقادیر تازه" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots20/08_wave2.png >/dev/null
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "پایان موج → روز/فروشگاه" "$R"

E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

agent-browser close --all >/dev/null 2>&1
echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۲۰٫۰ گذرنده ✔"
