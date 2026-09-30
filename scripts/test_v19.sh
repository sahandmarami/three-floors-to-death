#!/bin/bash
# تست نسخه‌ی ۱۹٫۰ — مینی‌گیم‌های سواره + دود متحرک + باس + پناهگاه + برد
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3

echo "===== ۱) ساختار: تم‌های سواره + حذف کد مرده + صداها ====="
R=$(agent-browser eval "MGCFG[1].theme==='drive'&&MGCFG[2].theme==='river'&&MGCFG[3].theme==='snow'?1:0" | tail -1); ck "سه تم: drive/river/snow" "$R"
R=$(agent-browser eval "typeof tunnelBG==='undefined'&&typeof ziplineBG==='undefined'&&typeof drawRunner==='undefined'&&typeof renderTunnelDark==='undefined'?1:0" | tail -1); ck "کد مرده‌ی تونل/زیپ‌لاین/دونده حذف شد" "$R"
R=$(agent-browser eval "isRideTheme('drive')&&isRideTheme('river')&&isRideTheme('snow')&&!isRideTheme('tunnel')?1:0" | tail -1); ck "isRideTheme درست کار می‌کند" "$R"
R=$(agent-browser eval "GAME.v13.clipCount===63?1:0" | tail -1); ck "۶۳ کلیپ صدا (۴۵+۱۸)" "$R"
R=$(agent-browser eval "VOICES17.sh3m&&VOICES17.tbc1n&&VOICES17.b1a1&&VOICES17.s1a1&&VOICES17.fbz1?1:0" | tail -1); ck "کلیدهای تازه: sh3m/tbc1n/b1a1/s1a1/fbz1" "$R"
R=$(agent-browser eval "DLG_WHO.m&&DLG_WHO.m.name.indexOf('مریم')>=0?1:0" | tail -1); ck "شخصیت گفتگوی «دکتر مریم» (m)" "$R"

echo "===== ۲) کوله‌پشتی: پایین‌تر و جمع‌تر + کلاس sui ====="
R=$(agent-browser eval "parseFloat(getComputedStyle(document.getElementById('backpackBar')).bottom)<=3?1:0" | tail -1); ck "کوله‌پشتی چسبیده به لبه‌ی پایین (<=3px)" "$R"
R=$(agent-browser eval "document.querySelector('.bpk-slot').offsetWidth<=48?1:0" | tail -1); ck "اسلات‌های کوچک‌تر (<=48px)" "$R"
agent-browser set viewport 480 320 >/dev/null; sleep 0.6
agent-browser eval "GAME.v14.fitWrap();'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "document.getElementById('wrap').classList.contains('sui')?1:0" | tail -1); ck "صفحه‌ی کوچک → کلاس sui فعال" "$R"
R=$(agent-browser eval "document.querySelector('.bpk-slot').offsetWidth<=40?1:0" | tail -1); ck "sui → اسلات ۳۸px" "$R"
agent-browser set viewport 1100 640 >/dev/null; sleep 0.6
agent-browser eval "GAME.v14.fitWrap();'ok'" >/dev/null; sleep 0.3
R=$(agent-browser eval "!document.getElementById('wrap').classList.contains('sui')?1:0" | tail -1); ck "صفحه‌ی بزرگ → sui خاموش" "$R"

echo "===== ۳) مینی‌گیم قایق (فصل ۲→۳): انتقال کامل ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.skipToWave(10);GAME.startNight();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ch===2&&GAME.v10.TR.phase===1?1:0" | tail -1); ck "پایان موج ۱۰ → انتقال فصل ۲ (فاز ۱)" "$R"
agent-browser eval "GAME.v10.trGoto(7.2);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.phase===2?1:0" | tail -1); ck "فاز ۲ شروع شد" "$R"
R=$(agent-browser eval "MG.cfg.theme==='river'&&DRV.theme==='river'?1:0" | tail -1); ck "تم رودخانه فعال (river)" "$R"
R=$(agent-browser eval "MG.cfg.goalM===360&&MG.cfg.hidden.id==='battery'?1:0" | tail -1); ck "هدف ۳۶۰م + آیتم مخفی باتری" "$R"
# فرمان (مستقیم روی DRV) و گاز (نیاز به حلقه‌ی زنده — trResume)
agent-browser eval "GAME.v17.mgSteer(1);'ok'" >/dev/null; sleep 0.4
R=$(agent-browser eval "DRV.steer>0.5?1:0" | tail -1); ck "فرمان راست (mgSteer)" "$R"
R=$(agent-browser eval "DRV.obs.every(o=>o.soft!==undefined)&&DRV.obs.length>3?1:0" | tail -1); ck "موانع شناور با پرچم soft ساخته می‌شوند" "$R"
R=$(agent-browser eval "RIVER_OBSTACLES.some(d=>d.t==='log')&&RIVER_OBSTACLES.some(d=>d.t==='zSwim')?1:0" | tail -1); ck "موانع قایق: log/zSwim" "$R"
agent-browser eval "GAME.v10.trResume();DRV.obs.length=0;DRV.steer=0;DRV.kb=false;DRV.px=roadCXf(DRV.T);DRV.offroad=0;GAME.v17.mgGas(true);'ok'" >/dev/null; sleep 1.6
R=$(agent-browser eval "DRV.speed>2400?1:0" | tail -1); ck "گاز → سرعت بالا (حلقه‌ی زنده)" "$R"
agent-browser eval "GAME.v17.mgSteer(0);GAME.v17.mgGas(false);'ok'" >/dev/null
# اسکرین‌شات قایق (وسط مسیر)
mkdir -p /home/z/my-project/scripts/shots19
sleep 1.2
agent-browser screenshot /home/z/my-project/scripts/shots19/01_boat_river.png >/dev/null
# فاز ۳ و ورود به فصل ۳ (نزدیک به هدف می‌رویم تا فاز ۳ بیاید)
agent-browser eval "GAME.v10.trResume();DRV.T=DRV.goalT-40;DRV.px=roadCXf(DRV.T);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.phase===3?1:0" | tail -1); ck "فاز ۳ (رسیدن به پاسگاه)" "$R"
agent-browser eval "GAME.v10.trResume();'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "state.mode!=='transition'&&state.chapter===3?1:0" | tail -1); ck "پایان انتقال → فصل ۳ شروع شد" "$R"

echo "===== ۴) مینی‌گیم اسنوموبیل (فصل ۳→۴) ====="
agent-browser eval "GAME.skipToWave(18);GAME.startNight();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v10.TR&&GAME.v10.TR.ch===3&&GAME.v10.TR.phase===1?1:0" | tail -1); ck "پایان موج ۱۸ → انتقال فصل ۳" "$R"
agent-browser eval "GAME.v10.trGoto(7.5);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "MG.cfg.theme==='snow'&&DRV.theme==='snow'?1:0" | tail -1); ck "تم برفی فعال (snow)" "$R"
R=$(agent-browser eval "SNOW_OBSTACLES.some(d=>d.t==='iceRock')&&SNOW_OBSTACLES.some(d=>d.t==='pineDown')?1:0" | tail -1); ck "موانع برفی: iceRock/pineDown" "$R"
agent-browser eval "GAME.v10.trGoto(12);'ok'" >/dev/null; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots19/02_snowmobile.png >/dev/null
agent-browser eval "GAME.v10.trResume();DRV.T=DRV.goalT-40;DRV.px=roadCXf(DRV.T);'ok'" >/dev/null; sleep 5
R=$(agent-browser eval "state.mode!=='transition'&&state.chapter===4?1:0" | tail -1); ck "پایان انتقال → فصل ۴ شروع شد" "$R"

echo "===== ۵) رگرسیون: مینی‌گیم رانندگی (فصل ۱→۲) ====="
agent-browser eval "GAME.skipToWave(4);GAME.startNight();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.trGoto(8.5);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "MG.cfg.theme==='drive'&&DRV.theme==='road'?1:0" | tail -1); ck "تم جاده (road) دست‌نخورده" "$R"
agent-browser eval "GAME.v10.trResume();DRV.T=DRV.goalT-40;DRV.px=roadCXf(DRV.T);'ok'" >/dev/null; sleep 5
R=$(agent-browser eval "state.chapter===2?1:0" | tail -1); ck "پایان انتقال → فصل ۲" "$R"

echo "===== ۶) دود متحرک خانه‌های سوخته (فصل ۳) + دودکش انبار (فصل ۲) ====="
agent-browser eval "GAME.skipToWave(14);GAME.startNight();'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "typeof drawRuinLiveFx==='function'&&typeof smokeSpr==='function'&&smokeSpr().width===64?1:0" | tail -1); ck "لایه‌ی زنده‌ی دود + اسپرایت ۶۴px" "$R"
agent-browser eval "window.__smk=0;const _o=drawRuinLiveFx;drawRuinLiveFx=function(){window.__smk++;return _o.apply(null,arguments)};'ok'" >/dev/null; sleep 0.8
R=$(agent-browser eval "window.__smk>=20?1:0" | tail -1); ck "drawRuinLiveFx هر فریم صدا می‌شود (>=20/0.8s)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots19/03_ch3_smoke_a.png >/dev/null
sleep 0.55
agent-browser screenshot /home/z/my-project/scripts/shots19/04_ch3_smoke_b.png >/dev/null
python3 /home/z/my-project/scripts/smoke_diff.py && P=$((P+1)) && echo "  OK  پیکسل: دودِ افق فصل ۳ بین دو فریم تغییر می‌کند" || { F=$((F+1)); echo "  FAIL  پیکسل: دودِ افق فصل ۳ تغییر نکرد"; }
agent-browser eval "GAME.skipToWave(8);GAME.startNight();'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "typeof drawWhLiveSmoke==='function'&&WH_SKYLINE.some(b=>b.stack)?1:0" | tail -1); ck "دودکش‌های انبار (فصل ۲) + تابع زنده" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots19/05_ch2_chimneys.png >/dev/null

echo "===== ۷) باسِ سخت‌تر: آمار + فاز دوم + شکست یورش ====="
agent-browser eval "GAME.skipToWave(28);GAME.startNight();'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "ZTYPES.boss.hpBase===5400?1:0" | tail -1); ck "جون باس ۵۴۰۰" "$R"
R=$(agent-browser eval "const b=state.zombies.find(z=>z.type==='boss');b&&Math.round(b.maxHp)===5400?1:0" | tail -1); ck "باسِ تولدشده با ۵۴۰۰ جون" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');return b&&b.ai&&('chargeT' in b.ai)&&('breakAcc' in b.ai)?1:0})()" | tail -1); ck "فیلدهای یورش در AI باس" "$R"
# فاز دوم با کاهش جون
agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(b)b.hp=b.maxHp*0.5;return 'ok'})()" >/dev/null; sleep 0.6
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');return b&&b.ai&&b.ai.hardened===true?1:0})()" | tail -1); ck "۵۰٪ جون → فاز دوم (زره سنگین)" "$R"
# شکست یورش: دمیج متمرکز در حالت شارژ
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.charge=0.5;b.ai.dash=0;b.ai.breakAcc=0;b.ai.staggerT=0;hitZombie(b,400,b.x,b.y-40,1,false,0,'t');return (b.ai.charge===0&&b.ai.staggerT>0)?1:0})()" | tail -1); ck "یورش با آتش متمرکز (۴۰۰ خام → ~۱۴۰ بعد از زره) قطع می‌شود" "$R"
# زره: ضربه‌ی معمولی نیم‌اثر
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.staggerT=0;b.ai.dmgAcc=0;b.hp=b.maxHp;const hp0=b.hp;hitZombie(b,100,b.x,b.y-40,1,false,0,'t');return (hp0-b.hp)<=60?1:0})()" | tail -1); ck "زره: ضربه‌ی ۱۰۰ → حداکثر ~۴۵-۶۰ دمیج" "$R"
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1

echo "===== ۸) کات‌سین پناهگاه: مراحل + گفتگو + آژیر ====="
agent-browser eval "GAME.v19.startShelterCine();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "state.mode==='sheltercine'&&SHEL.phase==='walk'?1:0" | tail -1); ck "شروع کات‌سین (فاز walk)" "$R"
agent-browser eval "GAME.v19.shelterGoto('inside',1.2);'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "GAME.v11.DLG.active===true?1:0" | tail -1); ck "داخل پناهگاه → گفتگو فعال" "$R"
R=$(agent-browser eval "GAME.v11.DLG.lines.length===6?1:0" | tail -1); ck "گفتگو: ۶ خط (دکتر مریم/ارشان/بازیکن)" "$R"
agent-browser eval "GAME.v19.shelterGoto('alarm',0.9);'ok'" >/dev/null; sleep 0.6
R=$(agent-browser eval "SHEL.phase==='alarm'&&SHEL.dlgStarted?1:0" | tail -1); ck "فاز آژیر + گفتگوی رادیو" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots19/06_shelter_alarm.png >/dev/null
agent-browser eval "GAME.v19.shelterGoto('inside',1.2);'ok'" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots19/07_shelter_inside.png >/dev/null

echo "===== ۹) «این داستان ادامه دارد...» + صفحه‌ی برد ====="
agent-browser eval "GAME.v19.startTbcScreen();'ok'" >/dev/null; sleep 1.6
R=$(agent-browser eval "document.getElementById('tbcTitle').textContent.length>4?1:0" | tail -1); ck "تایپ تدریجی متن آغاز شد" "$R"
sleep 2.6
R=$(agent-browser eval "document.getElementById('tbcTitle').textContent.indexOf('ادامه دارد')>=0?1:0" | tail -1); ck "متن کامل «این داستان ادامه دارد...»" "$R"
R=$(agent-browser eval "document.getElementById('tbcSub').classList.contains('on')?1:0" | tail -1); ck "تیتر سری دوم ظاهر شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots19/08_tbc.png >/dev/null
agent-browser eval "GAME.v19.tbcContinueToVictory();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "state.mode==='victory'&&!document.getElementById('victoryScreen').classList.contains('hidden')?1:0" | tail -1); ck "ادامه → صفحه‌ی برد سینمایی" "$R"
R=$(agent-browser eval "document.querySelectorAll('#vStats .vic-card').length===6?1:0" | tail -1); ck "۶ کارت آمار" "$R"
R=$(agent-browser eval "document.querySelector('.vic-medal')&&document.querySelector('.vic-next')?1:0" | tail -1); ck "مدال + قلاب سری دوم" "$R"
sleep 2.2
R=$(agent-browser eval "state.particles.length>4?1:0" | tail -1); ck "آتش‌بازیِ پشتِ پنل (ذرات)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots19/09_victory.png >/dev/null

echo "===== ۱۰) جریان کامل پایان: برد واقعی → سحر → پناهگاه ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.5
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.win();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='victorycine'?1:0" | tail -1); ck "برد شبیه‌سازی‌شده → سحرِ پیروزی" "$R"
agent-browser eval "VC&&(VC.t=7,VC.done=true);'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='sheltercine'?1:0" | tail -1); ck "سحر تمام → کات‌سین پناهگاه خودکار" "$R"

E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

agent-browser close --all >/dev/null 2>&1
echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۱۹٫۰ گذرنده ✔"
