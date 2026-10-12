#!/bin/bash
# اسکرین‌شات‌های v25 برای تحلیل VLM — گوشی ۷۸۰×۳۶۰ (اندروید افقی)
URL="http://localhost:3002/three-floors-to-survival.html"
SH=/home/z/my-project/scripts/shots25
mkdir -p $SH
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser screenshot $SH/p01_menu.png >/dev/null 2>&1
echo "menu ✓"

# جعبه تأیید بازی جدید (با سیو)
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2.5
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "GAME.skipToWave(5);GAME.v10.saveGame();exitToMenu();'ok'" >/dev/null; sleep 3
agent-browser eval "document.getElementById('btnStart').click();'ok'" >/dev/null; sleep 1
agent-browser screenshot $SH/p02_confirm.png >/dev/null 2>&1
echo "confirm ✓"

# کات‌سین افتتاحیه (استوری موشن) — صحنه ۱ + تیتر
agent-browser eval "document.getElementById('cfNo').click();'ok'" >/dev/null; sleep 0.5
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 4
agent-browser screenshot $SH/p03_cine.png >/dev/null 2>&1
echo "cine scene ✓"

# گفتگو درون کات‌سین (بزرگ‌شده)
sleep 3
agent-browser screenshot $SH/p04_cine_dlg.png >/dev/null 2>&1
echo "cine dlg ✓"

# گیم‌پلی + HUD
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null; sleep 3
agent-browser screenshot $SH/p05_game.png >/dev/null 2>&1
echo "gameplay ✓"

agent-browser close --all >/dev/null 2>&1
echo "done — $SH"
