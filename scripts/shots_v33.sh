#!/bin/bash
# shots_v33.sh — اسکرین‌شات‌های ممیزی v33
URL="http://localhost:3002/three-floors-to-survival.html"
D=/home/z/my-project/scripts/shots33
mkdir -p $D
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 6

# ۱) منوی اصلی (روشنایی + زامبی)
agent-browser screenshot $D/menu.png >/dev/null 2>&1

# ۲) فروریختن: لحظه‌های مختلف
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(6); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "GAME.v10.trGoto(2.5); 'ok'" >/dev/null 2>&1; sleep 0.3
agent-browser screenshot $D/collapse_stairs.png >/dev/null 2>&1
agent-browser eval "GAME.v10.trGoto(6.5); 'ok'" >/dev/null 2>&1; sleep 0.3
agent-browser screenshot $D/collapse_car.png >/dev/null 2>&1
agent-browser eval "GAME.v10.trGoto(5.6); 'ok'" >/dev/null 2>&1; sleep 0.3
agent-browser screenshot $D/collapse_jump.png >/dev/null 2>&1

# ۳) خروج و پنل ساخت‌وساز با نام‌ها + پرونده سرنخ‌ها
agent-browser eval "GAME.v10.trResume(); if(TR){TR._paused=false;} try{finishTransition()}catch(e){} 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "var bp=document.getElementById('buildPanel'); if(!bp||bp.classList.contains('collapsed')){try{toggleBuildPanel()}catch(e){}} 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser screenshot $D/build_names.png >/dev/null 2>&1
agent-browser eval "setBPTab('sur', true); 'ok'" >/dev/null 2>&1; sleep 0.6
agent-browser screenshot $D/build_survival.png >/dev/null 2>&1
agent-browser eval "try{MYST.openArchive()}catch(e){} 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser screenshot $D/clue_listen.png >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
ls -la $D/ | grep png | head -8
