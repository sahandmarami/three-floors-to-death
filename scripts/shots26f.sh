#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null
sleep 10.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_scene2_desk.png >/dev/null 2>&1
sleep 7
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_scene3_desk.png >/dev/null 2>&1
echo DONE
