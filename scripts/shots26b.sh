#!/bin/bash
# شات‌های v26 — اینترو + گیم‌پلی + دستفروش
URL="http://localhost:3000/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots26
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9

agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 3
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro1.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro2.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro3.png >/dev/null 2>&1
sleep 5.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro4.png >/dev/null 2>&1
sleep 4.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_intro5.png >/dev/null 2>&1

agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null 2>&1; sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_gameplay_night.png >/dev/null 2>&1
# مختصات دکمه‌ها
agent-browser eval "JSON.stringify([...document.querySelectorAll('button,.bp-tab,#bpHead,#peddlerPanel')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className.slice(0,20),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}))" | tail -1 > scripts/shots26/btn26_night.json
cat scripts/shots26/btn26_night.json | python3 -c "import json,sys; d=json.loads(json.loads(sys.stdin.read())); print('\n'.join(f\"{b['id']}: x={b['x']} y={b['y']} w={b['w']} h={b['h']}\" for b in d))"

# دستفروش — روز بعد موج دوم
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "state.peddler.cd=0; PED.enter(); PED.x=PED.x; PED.phase='stay'; state.peddler.here=true; renderPeddlerStock(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant.png >/dev/null 2>&1
# بستن پنل → پیل بازگشایی
agent-browser eval "hidePeddlerPanel();'ok'" >/dev/null 2>&1; sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots26/v26_merchant_closed.png >/dev/null 2>&1
echo "DONE"
