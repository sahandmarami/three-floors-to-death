#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "peddlerRoll(true); 'ok'" >/dev/null 2>&1
sleep 6
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "hidePeddlerPanel();'ok'" >/dev/null 2>&1
echo "--- manual MYST.update call ---"
agent-browser eval "MYST.update(0.016); 'done'" >/dev/null 2>&1
echo "after manual update: $(agent-browser eval "document.getElementById('pedReopenBtn').style.display" | tail -1)"
echo "--- mode check ---"
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
