#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_gameplay_night.png >/dev/null 2>&1
agent-browser eval "JSON.stringify([...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className.slice(0,20),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}))" | tail -1 > scripts/shots26/btn26_night.json
python3 -c "
import json
d=json.loads(json.loads(open('scripts/shots26/btn26_night.json').read()))
print('\n'.join(f\"{b['id']}: x={b['x']} y={b['y']} w={b['w']} h={b['h']}\" for b in d))
print()
zs = round(492*(360/560))
print('نوار راه رفتن زامبی در CSS: y ~', zs-40, 'تا', zs)
mx = max((b['y']+b['h']) for b in d if b['id'] in ('listenBtn','ctlFlash','molotovBtn','mystBtn'))
print('پایین دکمه‌های عملیاتی:', mx, '→', 'OK بیرون از مسیر' if mx < zs-40 else '⚠️ داخل مسیر!')
"
