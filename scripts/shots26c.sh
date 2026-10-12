#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots26
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 3.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro1.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro2.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro3.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro4.png >/dev/null 2>&1
sleep 4.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro5.png >/dev/null 2>&1
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_night.png >/dev/null 2>&1
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 3
# دستفروش اجباری
agent-browser eval "state.peddler.cd=0; PED.active=true; PED.phase='stay'; state.peddler.here=true; renderPeddlerStock(); 'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant.png >/dev/null 2>&1
agent-browser eval "hidePeddlerPanel();'ok'" >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_closed.png >/dev/null 2>&1
# منو برای مقایسه (نباید تغییر کرده باشد)
agent-browser eval "GAME.exitToMenu ? 'has' : 'no'" | tail -1
echo DONE
