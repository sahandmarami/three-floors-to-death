#!/bin/bash
# repro2 — باگ مولوتوف (سبک تست v29)
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
echo "boot mode: $R"
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "mode now: $(agent-browser eval "state.mode" | tail -1)"
agent-browser eval "state.coins=500; MYST.openArchive(); 'ok'" >/dev/null; sleep 0.5
echo "=== قبل از خرید ==="
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]'); return b?b.outerHTML.slice(0,300):'NO MOLO BTN'})()" | tail -1
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]'); if(b){b.click(); return 'CLICKED'} return 'no'})()" >/dev/null 2>&1; sleep 0.8
echo ""
echo "=== بعد از خرید: عناصر متنی بیرون پنل ==="
agent-browser eval "(()=>{const out=[]; document.querySelectorAll('#wrap *').forEach(e=>{const t=(e.textContent||'').trim(); if(t&&t.length>1&&!e.querySelector('*')&&e.offsetParent&&!e.closest('.myst-panel')&&!e.closest('#buildSheet')&&!e.closest('.dlgbox')&&!e.closest('#announce')&&!e.closest('#buildPanel')){out.push((e.id||e.className)+'::'+t.slice(0,50))}}); return out.join(' | ').slice(0,2000)})()" | tail -1
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov1.png >/dev/null 2>&1
echo "=== دوباره بخر (دومین خرید) ==="
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]'); if(b){b.click(); return 'CLICKED2'} return 'no'})()" >/dev/null 2>&1; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov2.png >/dev/null 2>&1
agent-browser eval "MYST.closePanel(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov3.png >/dev/null 2>&1
echo "done"
