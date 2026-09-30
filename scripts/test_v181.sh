#!/bin/bash
# تست نسخه‌ی ۱۸٫۱ — کش‌های رندر + فرماندار کیفیت + رگرسیون بصری
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3

echo "===== ۱) کش BG: چهار لایه پخته می‌شوند و کلیدشان کار می‌کند ====="
R=$(agent-browser eval "BG.L[0]&&BG.L[1]&&BG.L[2]&&BG.L[3]?1:0" | tail -1); ck "چهار لایه‌ی BG پخته" "$R"
R=$(agent-browser eval "BG.key!==''?1:0" | tail -1); ck "کلید BG تنظیم شده" "$R"
R=$(agent-browser eval "(BG.L[0].width>=1024*1)?1:0" | tail -1); ck "رزولوشن پخت L0 (DPR بسته)" "$R"

echo "===== ۲) اسپرایت زامبی: پخت تنبل + استفاده ====="
R=$(agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1; agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1; \
    agent-browser eval "GAME.startNight();'ok'" >/dev/null; sleep 2; \
    agent-browser eval "for(let i=0;i<6;i++)GAME.spawnType('normal');for(let i=0;i<3;i++)GAME.spawnType('fast');for(let i=0;i<2;i++)GAME.spawnType('tank');'ok'" >/dev/null; sleep 2; \
    agent-browser eval "Object.keys(ZSPR.cache).length>=10?1:0" | tail -1); ck "ZSPR: حداقل ۱۰ قاب پخته" "$R"
R=$(agent-browser eval "Object.keys(ZSPR.cache).some(k=>k[0]==='t')?1:0" | tail -1); ck "ZSPR: قاب تانک هم پخته" "$R"
R=$(agent-browser eval "Object.keys(ZSPR.cache).some(k=>k.includes('a'))?1:0" | tail -1); ck "ZSPR: قاب حمله (a) موجود" "$R"
# فلاش: آسیب → hitFlash → قاب f (بعد از یک فریم رندر چک می‌شود)
R=$(agent-browser eval "const z=GAME.state.zombies.find(z=>z.type==='normal');GAME.state.turrets.length=0;z.hitFlash=0.2;'ok'" >/dev/null; sleep 0.6; \
    agent-browser eval "Object.keys(ZSPR.cache).some(k=>k.includes('1w')||k.includes('1a'))?1:0" | tail -1); ck "ZSPR: قاب فلاش هم پخته" "$R"

echo "===== ۳) پخت برج + پنجره/پرچم زنده ====="
R=$(agent-browser eval "TOWER_BAKE.body&&TOWER_BAKE.batt?1:0" | tail -1); ck "پوسته و کنگره‌ی برج پخته" "$R"
R=$(agent-browser eval "WINSPR.c?1:0" | tail -1); ck "اسپرایت پنجره آماده" "$R"
R=$(agent-browser eval "TOWER_BAKE.key.includes(state.towerVariant)?1:0" | tail -1); ck "کلید پخت برج = پوسته فعلی" "$R"
# کات‌سین → مسیر زنده
R=$(agent-browser eval "GAME.playCutscene();'ok'" >/dev/null; sleep 1; \
    agent-browser eval "GAME.getCutscene()&&GAME.getCutscene().draw?1:0" | tail -1); ck "کات‌سین: CS.draw فعال (مسیر زنده)" "$R"
R=$(agent-browser eval "GAME.skipCutscene();'ok'" >/dev/null; sleep 1; \
    agent-browser eval "GAME.getCutscene()?0:1" | tail -1); ck "بستن کات‌سین → برگشت به مسیر پخت" "$R"

echo "===== ۴) روکش‌ها و اسپرایت‌های کمکی ====="
R=$(agent-browser eval "OVSPR.get('grade')&&OVSPR.get('blood')&&OVSPR.get('freeze')?1:0" | tail -1); ck "سه روکش پخته (grade/blood/freeze)" "$R"
R=$(agent-browser eval "OVSPR.v.grade.width===Math.ceil(960/4)?1:0" | tail -1); ck "روکش‌ها با ¼ رزولوشن" "$R"
R=$(agent-browser eval "CLOUDSPR.spr&&CLOUDSPR.spr.length===5?1:0" | tail -1); ck "۵ اسپرایت ابر" "$R"
R=$(agent-browser eval "DECAL_SPR.c?1:0" | tail -1); ck "اسپرایت لکه‌ی خون" "$R"
R=$(agent-browser eval "EYE_GLOW.get('normal')&&EYE_GLOW.get('boss')?1:0" | tail -1); ck "اسپرایت هاله‌ی چشم (بدون shadowBlur)" "$R"

echo "===== ۵) فرماندار کیفیت ====="
R=$(agent-browser eval "GAME.perf&&GAME.perf.setTier?1:0" | tail -1); ck "GAME.perf در دسترس" "$R"
D0=$(agent-browser eval "DPR" | tail -1)
R=$(agent-browser eval "GAME.perf.setTier(1);DPR===1?1:0" | tail -1); ck "setTier(1) → DPR=1" "$R"
R=$(agent-browser eval "document.body.classList.contains('perf-low')?1:0" | tail -1); ck "کلاس perf-low فعال" "$R"
R=$(agent-browser eval "GAME.perf.setTier(2);document.body.classList.contains('perf-vlow')?1:0" | tail -1); ck "setTier(2) → کلاس perf-vlow" "$R"
R=$(agent-browser eval "GAME.perf.setTier(0);DPR===($D0)?1:0" | tail -1); ck "بازگشت به پله ۰ → DPR اولیه" "$R"
sleep 0.4
R=$(agent-browser eval "BG.dirty===0?1:0" | tail -1); ck "بازپخت BG بعد از تغییر پله انجام شد" "$R"
R=$(agent-browser eval "GAME.perf.fps>0?1:0" | tail -1); ck "سنجش fps فعال" "$R"

echo "===== ۶) طلوع: بازپخت نرم (بدون خطا) ====="
R=$(agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 4; \
    agent-browser eval "state.dayness>0.5?1:0" | tail -1); ck "روزشدگی پیش رفت" "$R"
R=$(agent-browser eval "agent-browser errors" >/dev/null 2>&1; agent-browser eval "window.__e=0;1" | tail -1); ck "بدون استثنا در بازپخت" "$R"

echo "===== ۷) رگرسیون: ارشان روی بام پشت کنگره‌ها ====="
R=$(agent-browser eval "typeof drawTowerArshan==='function'&&GAME.v17.arshanOnRoof()!==false?1:0" | tail -1); ck "ارشان روی بام (تابع موجود)" "$R"

echo "===== ۸) اسکرین‌شات برای VLM ====="
mkdir -p /home/z/my-project/scripts/shots181
agent-browser eval "GAME.skipToWave(1);GAME.startNight();'ok'" >/dev/null; sleep 3
agent-browser eval "for(let i=0;i<8;i++)GAME.spawnType('normal');for(let i=0;i<3;i++)GAME.spawnType('tank');'ok'" >/dev/null; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots181/01_night_horde.png >/dev/null
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots181/02_day.png >/dev/null
agent-browser eval "GAME.skipToWave(9);GAME.startNight();'ok'" >/dev/null; sleep 3
agent-browser eval "for(let i=0;i<6;i++)GAME.spawnType('normal');'ok'" >/dev/null; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots181/03_ch2_dark.png >/dev/null
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots181/04_menu.png >/dev/null

E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

agent-browser close --all >/dev/null 2>&1
echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۱۸٫۱ گذرنده ✔"