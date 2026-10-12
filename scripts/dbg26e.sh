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
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
echo "mode after wave2: $(agent-browser eval "state.mode" | tail -1)"
# دستفروش واقعی روز
agent-browser eval "state.peddler.cd=0; PED.enter(); 'ok'" >/dev/null 2>&1
sleep 5
echo "peddler phase: $(agent-browser eval "PED.phase + ' here=' + state.peddler.here" | tail -1)"
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_real.png >/dev/null 2>&1
# حالا بستن با دکمه X
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 1.2
echo "reopen pill display: $(agent-browser eval "const b=document.getElementById('pedReopenBtn'); b? b.style.display : 'missing'" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_reopen.png >/dev/null 2>&1
# کلیک روی پیل → پنل دوباره باز شود
agent-browser eval "document.getElementById('pedReopenBtn').click();'ok'" >/dev/null 2>&1; sleep 1
echo "box hidden after reopen click: $(agent-browser eval "document.getElementById('peddlerBox').classList.contains('hidden')" | tail -1)"
