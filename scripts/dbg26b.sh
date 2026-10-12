#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null 2>&1
# صبر تا playing
for i in $(seq 1 20); do
  M=$(agent-browser eval "state.mode" | tail -1 | tr -d '"')
  if [ "$M" = "playing" ]; then break; fi
  sleep 0.7
done
echo "mode: $M"
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_gameplay_night.png >/dev/null 2>&1
agent-browser eval "JSON.stringify([...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className.slice(0,20),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}))" | tail -1 > scripts/shots26/btn26_night.json
python3 -c "
import json
d=json.loads(open('scripts/shots26/btn26_night.json').read())
d=json.loads(d)
print('\n'.join(f\"{b['id']}: x={b['x']} y={b['y']} w={b['w']} h={b['h']}\" for b in d))
print()
print('پایین‌ترین y دکمه‌ها:', max(b['y']+b['h'] for b in d))
print('GROUND_Y منطقی 492 → CSS:', round(492*(360/560)) if 560>0 else '?')
"
