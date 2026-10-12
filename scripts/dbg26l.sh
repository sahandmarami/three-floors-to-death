#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html?r=$RANDOM"
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
agent-browser eval "hidePeddlerPanel(); MYST.update(0.016); 'done'" >/dev/null 2>&1
echo "count of pedReopenBtn: $(agent-browser eval "document.querySelectorAll('#pedReopenBtn').length" | tail -1)"
echo "MYST._pedBtn display: $(agent-browser eval "MYST._pedBtn ? MYST._pedBtn.style.display : 'null'" | tail -1)"
echo "MYST._pedBtn has hidden class: $(agent-browser eval "MYST._pedBtn ? MYST._pedBtn.className : 'null'" | tail -1)"
echo "first pedReopenBtn computed display: $(agent-browser eval "getComputedStyle(document.getElementById('pedReopenBtn')).display" | tail -1)"
