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
echo "merchant box: $(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_day.png >/dev/null 2>&1
# بستن با X
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 1.5
echo "count pedReopenBtn: $(agent-browser eval "document.querySelectorAll('#pedReopenBtn').length" | tail -1)"
echo "pill display: $(agent-browser eval "document.getElementById('pedReopenBtn') ? getComputedStyle(document.getElementById('pedReopenBtn')).display : 'missing'" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_reopen_day.png >/dev/null 2>&1
# کلیک روی پیل → باز شدن
agent-browser eval "document.getElementById('pedReopenBtn').click();'ok'" >/dev/null 2>&1; sleep 1.2
echo "box reopened: $(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')" | tail -1)"
