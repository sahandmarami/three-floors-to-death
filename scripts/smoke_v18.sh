#!/bin/bash
# تست دودی سریع v18 قبل از تست کامل
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3
agent-browser errors --clear >/dev/null 2>&1

ev() { agent-browser eval "$1" | tr -d '"\n '; }

echo "== بارگذاری =="
echo "errors: $(agent-browser errors | grep -c error || echo 0)"
echo "WAVES_CH: $(ev 'JSON.stringify(GAME.v10.WAVES_CH)')"
echo "FINAL_WAVE: $(ev 'GAME.v10.FINAL_WAVE')"
echo "waveChapter(4,5,10,11,18,19,28): $(ev '[4,5,10,11,18,19,28].map(GAME.v10.waveChapter).join(",")')"
echo "waveInChapter(4,5,10,28): $(ev '[4,5,10,28].map(GAME.v10.waveInChapter).join(",")')"
echo "wvEff(1,4,5,10,11,18,19,28): $(ev '[1,4,5,10,11,18,19,28].map(x=>GAME.v10.wvEff(x).toFixed(1)).join(",")')"
echo "compatWave(33,20,9): $(ev '[33,20,9].map(GAME.v10.compatWave).join(",")')"
echo "backdrop-filter count: $(ev 'document.styleSheets[0] ? Array.from(document.querySelectorAll("*")).filter(e=>getComputedStyle(e).backdropFilter!="none").length : -1')"

echo "== شروع بازی + موج اول (۴موجی فصل ۱) =="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro()" >/dev/null; sleep 2
echo "mode: $(ev 'state.mode') chapter: $(ev 'state.chapter')"
agent-browser eval "GAME.startNight()" >/dev/null; sleep 3
echo "wave: $(ev 'state.wave') label: $(agent-browser eval 'waveLabel()' | tr -d '"')"
echo "queue len (موج ۱): $(ev 'state.spawn.queue.length')"

echo "== ارشان روی بام؟ =="
echo "vis: $(ev 'GAME.v17.ARSHAN.vis.toFixed(2)') mode: $(ev 'state.mode')"
agent-browser eval "GAME.v10.skipToWave(2);GAME.startNight()" >/dev/null; sleep 4
echo "vis در شب: $(ev 'GAME.v17.ARSHAN.vis.toFixed(2)')"

echo "== ترک برج → پایین رفتن ارشان =="
agent-browser eval "GAME.hurt(70)" >/dev/null; sleep 2
echo "hp ratio: $(ev '(state.tower.hp/state.tower.maxHp).toFixed(2)') vis: $(ev 'GAME.v17.ARSHAN.vis.toFixed(2)')"

echo "== تعمیر → برگشتن =="
agent-browser eval "state.tower.hp=state.tower.maxHp" >/dev/null; sleep 3
echo "vis بعد از تعمیر: $(ev 'GAME.v17.ARSHAN.vis.toFixed(2)')"

echo "== پایان موج ۴ فصل ۱ → انتقال رانندگی =="
agent-browser eval "GAME.v10.skipToWave(4)" >/dev/null; sleep 1
agent-browser eval "GAME.startNight()" >/dev/null; sleep 2
agent-browser eval "GAME.endWave()" >/dev/null; sleep 3
echo "mode: $(ev 'state.mode') TR: $(ev '!!GAME.v10.TR')"

echo "== خطاهای نهایی =="
agent-browser errors | head -8
agent-browser close --all >/dev/null 2>&1
