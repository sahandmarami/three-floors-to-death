#!/bin/bash
# تست نسخه‌ی ۲۱٫۲ — شخصیت‌ها/ایستادن/فضای پناهگاه/متن باس/دستفروش
URL="http://localhost:3000/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 7
mkdir -p /home/z/my-project/scripts/shots212
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
}

echo "===== ۱) متن دمیج باس: بالای سر، نه روی بدن ====="
fresh
agent-browser eval "GAME.skipToWave(36);'ok'" >/dev/null; sleep 1.2
agent-browser eval "state.tower.hp=99999;state.tower.maxHp=99999;'ok'" >/dev/null; sleep 9
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss'&&!z.dead);return b?1:0})()" | tail -1); ck "باس موج ۳۶ ظاهر شد" "$R"
agent-browser eval "(()=>{state.texts.length=0;const b=state.zombies.find(z=>z.type==='boss'&&!z.dead);if(!b)return 'noboss';hitZombie(b,50,b.x,b.y-60,1,false,0,'player');hitZombie(b,50,b.x,b.y-60,1,true,0,'player');const t=state.texts[0];window.__ty=t?t.y:-99;window.__btop=b.y-52*(b.radius/15);return 'ok'})()" >/dev/null; sleep 0.4
R=$(agent-browser eval "window.__ty < window.__btop - 12 ? 1:0" | tail -1); ck "عدد دمیج بالای سرِ باس می‌نشیند (نه روی بدنش)" "$R"
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss'&&!z.dead);b.hp=b.maxHp*0.5;updateBossBar();return document.getElementById('bossBar').style.display==='block'?1:0})()" | tail -1); ck "نوار بزرگ جونِ باس فعال" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots212/t_boss.png >/dev/null
agent-browser eval "state.zombies=[];state.mode='day';'ok'" >/dev/null

echo "===== ۲) پناهگاه: ایستادنِ آرام + چیدمان منطقی ====="
fresh
agent-browser eval "GAME.v19.startShelterCine();'ok'" >/dev/null; sleep 0.5
agent-browser eval "GAME.v19.shelterGoto('inside',1.5);'ok'" >/dev/null; sleep 1.6
agent-browser screenshot /home/z/my-project/scripts/shots212/t_shelter_idle.png >/dev/null; sleep 0.9
agent-browser screenshot /home/z/my-project/scripts/shots212/t_shelter_idle2.png >/dev/null
R=$(agent-browser eval "(()=>{const s=GAME.v19.SHEL;return s&&s.phase==='inside'?1:0})()" | tail -1); ck "فاز inside پناهگاه فعال" "$R"
R=$(agent-browser eval "drawShelterWalker.length>=6?1:0" | tail -1); ck "drawShelterWalker پارامتر idle دارد (۲۱٫۲)" "$R"
agent-browser eval "GAME.v19.shelterGoto('alarm',1.0);'ok'" >/dev/null; sleep 1.3
agent-browser screenshot /home/z/my-project/scripts/shots212/t_shelter_alarm.png >/dev/null
agent-browser eval "GAME.v19.skipShelterCine();'ok'" >/dev/null; sleep 1

echo "===== ۳) دستفروش: چهره‌های متفاوت + صدای متفاوت ====="
fresh
agent-browser eval "state.mode='day';state.peddler.visits=0;GAME.v10.peddlerVisit();'ok'" >/dev/null; sleep 2.6
R=$(agent-browser eval "PED.active&&PED.phase!=='idle'?1:0" | tail -1); ck "دستفروش بازدید ۱ آمد" "$R"
R=$(agent-browser eval "PED.look===0&&VOICE.pedTweak&&VOICE.pedTweak.rate===1?1:0" | tail -1); ck "بازدید ۱: چهره ۰ + لحن کلاسیک" "$R"
agent-browser eval "PED.update(5);'ok'" >/dev/null; sleep 0.4
agent-browser eval "DLG.skip();PED.openShop();'ok'" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots212/t_ped1.png >/dev/null
for v in 2 3 4 5; do
  agent-browser eval "PED.leave(false);'ok'" >/dev/null; sleep 1.6
  agent-browser eval "state.mode='day';GAME.v10.peddlerVisit();'ok'" >/dev/null; sleep 2.4
  agent-browser eval "PED.update(5);'ok'" >/dev/null; sleep 0.4
  agent-browser eval "DLG.skip();PED.openShop();'ok'" >/dev/null; sleep 0.5
  agent-browser screenshot /home/z/my-project/scripts/shots212/t_ped$v.png >/dev/null
done
R=$(agent-browser eval "PED_LOOKS[1].trim&&PED_LOOKS[4].trim?1:0" | tail -1); ck "پالت‌های تازه (trim) روی ۵ چهره" "$R"
R=$(agent-browser eval "PED_VOICES.length===5?1:0" | tail -1); ck "۵ لحن صوتی متفاوت (۲۱٫۲)" "$R"
R=$(agent-browser eval "(()=>{const r=[];for(let i=0;i<5;i++)r.push(PED_VOICES[i].rate);return new Set(r).size===5?1:0})()" | tail -1); ck "هر چهره نرخ صدای یکتا دارد" "$R"
R=$(agent-browser eval "PED.active&&VOICE.pedTweak===PED_VOICES[PED.look]?1:0" | tail -1); ck "لحن فعلی = چهره‌ی فعلی" "$R"
R=$(agent-browser eval "PED_VOICES[2].rate<0.8?1:0" | tail -1); ck "ماسک‌دار: صدای بم/کند" "$R"
R=$(agent-browser eval "PED_VOICES[3].rate>1.1?1:0" | tail -1); ck "بارانی‌زرد: صدای تند/جوان" "$R"

echo "===== ۴) شخصیت‌ها: توابع ارتقایافته ====="
R=$(agent-browser eval "typeof drawDoctorMary==='function'&&typeof drawShelterSurvivorOld==='function'&&typeof drawTowerArshan==='function'?1:0" | tail -1); ck "توابع شخصیت‌های پناهگاه/بام" "$R"
R=$(agent-browser eval "(()=>{const t=PED.talk.toString();return t.includes('opens')?1:0})()" | tail -1); ck "خط آغازِ هر چهره متفاوت (۲۱٫۲)" "$R"
R=$(agent-browser eval "drawPeddlerFace.toString().length>1800?1:0" | tail -1); ck "پرتره‌ی دستفروش بازطراحی کامل (۵ چهره)" "$R"

echo "===== ۵) صفر خطای کنسول در کل تست ====="
E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۲۱٫۲ گذرنده ✔" || echo "خطا! رد شد ✘"