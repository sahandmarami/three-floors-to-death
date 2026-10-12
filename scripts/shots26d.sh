#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
# صبر تا بازی واقعاً لود شود
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
echo "loaded, mode=$R"
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
M=$(agent-browser eval "state.mode" | tail -1)
echo "after startNewGame: mode=$M"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro1.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro2.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro3.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro4.png >/dev/null 2>&1
sleep 4.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro5.png >/dev/null 2>&1
echo "intro shots done"
