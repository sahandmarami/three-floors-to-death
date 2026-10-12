#!/bin/bash
URL="http://localhost:3002/three-floors-to-survival.html?r=$RANDOM"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
# منو
agent-browser screenshot /home/z/my-project/scripts/shots26/final_menu.png >/dev/null 2>&1
# شب با آیکن‌های جدید
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "MYST.molotovs=2; MYST.update(0.016);'ok'" >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots26/final_night.png >/dev/null 2>&1
# دستفروش روز
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "peddlerRoll(true);'ok'" >/dev/null 2>&1; sleep 6
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser screenshot /home/z/my-project/scripts/shots26/final_merchant.png >/dev/null 2>&1
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/shots26/final_reopen.png >/dev/null 2>&1
echo DONE
