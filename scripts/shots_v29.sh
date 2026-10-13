#!/bin/bash
# اسکرین‌شات‌های تأییدی v29 — سه درخواست کاربر
URL="http://localhost:3002/three-floors-to-survival.html"
D=/home/z/my-project/scripts/shots29v
mkdir -p $D
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.2
# ۱) روز: شیت خودکار باز نیست — کل صفحه آزاد + FAB با برچسب
agent-browser eval "state.tower.maxHp=999999; state.tower.hp=999999; updateHUD(); 'god'" >/dev/null 2>&1
agent-browser screenshot $D/day_free.png >/dev/null 2>&1
# ۲) شیت باز + اسکریم — فشرده
agent-browser eval "setBuildPanel(false,true); 'ok'" >/dev/null 2>&1; sleep 0.9
agent-browser screenshot $D/sheet_open.png >/dev/null 2>&1
agent-browser eval "setBuildPanel(true,true); 'ok'" >/dev/null 2>&1; sleep 0.5
# ۳) سلاح‌ها: چیپ‌های SVG
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('pistol'); updateHUD(); 'ok'" >/dev/null 2>&1; sleep 0.6
agent-browser screenshot $D/weapons.png >/dev/null 2>&1
# زوم چیپ‌ها
python3 -c "
from PIL import Image
im = Image.open('$D/weapons.png')
w,h = im.size
im.crop((w-300, 40, w, 300)).resize((600,520), Image.LANCZOS).save('$D/weapons_zoom.png')
im2 = Image.open('$D/day_free.png')
im2.crop((0, 60, 360, 700)).resize((720,1280), Image.LANCZOS).save('$D/flash_zoom.png')
" 2>/dev/null
# ۴) توقف: فقط ادامه + ذخیره و خروج
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.9
agent-browser screenshot $D/pause.png >/dev/null 2>&1
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4
agent-browser close --all >/dev/null 2>&1
echo "shots: $(ls $D | wc -l)"
