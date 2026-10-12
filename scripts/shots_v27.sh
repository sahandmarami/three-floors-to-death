#!/bin/bash
# شات‌های v27 برای ممیزی VLM — منو/توقف/تنظیمات/درباره/روز/دستفروش/استوری
URL="http://localhost:3002/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots27
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done

# ۱) منوی اصلی
sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_01_menu.png >/dev/null 2>&1

# ۲) استوری‌موشن صحنه ۱ و ۳
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_02_cine1.png >/dev/null 2>&1
sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_03_cine2.png >/dev/null 2>&1
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_04_cine3.png >/dev/null 2>&1
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_05_cine4.png >/dev/null 2>&1
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1

# ۳) گیم‌پلی روز — دکمه شب‌شود + کوله + ستون چپ
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_06_day.png >/dev/null 2>&1

# ۴) منوی توقف + تنظیمات + درباره
agent-browser eval "pauseGame();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_07_pause.png >/dev/null 2>&1
agent-browser eval "document.getElementById('btnPauseSettings').click();'ok'" >/dev/null; sleep 0.7
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_08_settings.png >/dev/null 2>&1
agent-browser eval "document.getElementById('closeSettings').click();'ok'" >/dev/null; sleep 0.4
agent-browser eval "document.getElementById('btnPauseAbout').click();'ok'" >/dev/null; sleep 0.7
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_09_about.png >/dev/null 2>&1
agent-browser eval "document.getElementById('closeAbout').click();'ok'" >/dev/null; sleep 0.3
agent-browser eval "resumeGame();'ok'" >/dev/null 2>&1; sleep 0.5

# ۵) دستفروش (بازدید force)
agent-browser eval "state.mode='day'; state.peddler.visits=0; GAME.v10.peddlerVisit();'ok'" >/dev/null 2>&1; sleep 5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_10_vendor.png >/dev/null 2>&1
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 0.5
sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_11_day_pedpill.png >/dev/null 2>&1

# ۶) پنل ساخت‌وساز — تب سلاح‌ها (کلت جدید)
agent-browser eval "setBPTab('wpn');'ok'" >/dev/null 2>&1; sleep 0.7
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_12_weapons.png >/dev/null 2>&1

# ۷) شب — HUD سکه واقعی + چراغ‌قوه با برچسب
agent-browser eval "startNight();'ok'" >/dev/null 2>&1; sleep 3
agent-browser screenshot /home/z/my-project/scripts/shots27/v27_13_night.png >/dev/null 2>&1

echo "shots done:"; ls /home/z/my-project/scripts/shots27/ | grep v27_ | wc -l
agent-browser close --all >/dev/null 2>&1
