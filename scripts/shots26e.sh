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
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null
# گرفتن وضعیت در هر نقطه‌ی زمانی
for T in 2 6 11 16 21 26 31 36; do
  sleep 4
  M=$(agent-browser eval "state.mode + ' | seq=' + (typeof INTRO_SEQ!=='undefined'?INTRO_SEQ._i:'?') + ' | t=' + (typeof INTRO_SEQ!=='undefined'?(INTRO_SEQ.t||0).toFixed(1):'?')" 2>/dev/null | tail -1)
  echo "t=${T}s → $M"
done
