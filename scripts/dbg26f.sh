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
# موج را تمام کن — همه زامبی‌ها بمیرند
agent-browser eval "state.zombies.forEach(z=>{z.hp=0}); state.zombies.length=0; 'ok'" >/dev/null 2>&1
for i in $(seq 1 15); do
  M=$(agent-browser eval "state.mode" | tail -1 | tr -d '"')
  if [ "$M" = "day" ]; then break; fi
  sleep 0.7
done
echo "mode: $M"
# حالا دستفروش
agent-browser eval "state.peddler.cd=0; PED.enter(); 'ok'" >/dev/null 2>&1
sleep 5.5
echo "peddler: $(agent-browser eval "PED.phase+'/' + state.peddler.here" | tail -1)"
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
echo "box visible: $(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_day.png >/dev/null 2>&1
# X بستن
agent-browser eval "document.getElementById('pdClose').click();'ok'" >/dev/null 2>&1; sleep 1.2
echo "reopen display: $(agent-browser eval "document.getElementById('pedReopenBtn').style.display" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_reopen_day.png >/dev/null 2>&1
# دوباره باز کردن
agent-browser eval "document.getElementById('pedReopenBtn').click();'ok'" >/dev/null 2>&1; sleep 1
echo "box reopened: $(agent-browser eval "!document.getElementById('peddlerBox').classList.contains('hidden')" | tail -1)"
