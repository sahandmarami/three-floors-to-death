#!/bin/bash
# repro3 — بررسی دقیق DOM بعد از خرید مولوتوف (شامل announce)
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "state.coins=500; 'ok'" >/dev/null
echo "=== ALL overlays hidden check ==="
agent-browser eval "(()=>{const bw=document.getElementById('bossWarn'); return 'bossWarn display='+getComputedStyle(bw).display+' | announce opacity='+getComputedStyle(document.getElementById('announce')).opacity})()" | tail -1
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null; sleep 0.5
echo "=== buy molotov #1 ==="
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]'); b.click(); return MYST.molotovs})()" | tail -1
sleep 0.3
echo "=== announce content after buy ==="
agent-browser eval "(()=>{return 'big=['+document.getElementById('announceBig').textContent+'] sub=['+document.getElementById('announceSub').textContent+'] opacity='+getComputedStyle(document.getElementById('announce')).opacity})()" | tail -1
echo "=== همه عناصر متنی DOM با موقعیت (بعد خرید) ==="
agent-browser eval "(()=>{const sc=window.__fitScale||1;const out=[];document.querySelectorAll('#wrap, #wrap *').forEach(e=>{const t=(e.childElementCount===0?e.textContent:e.textContent).trim();const cs=getComputedStyle(e);if(t&&t.length>1&&cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'&&e.getBoundingClientRect().width>0){const r=e.getBoundingClientRect();out.push((e.id||e.className.toString().slice(0,24))+' @'+(r.left/sc).toFixed(0)+','+(r.top/sc).toFixed(0)+' "'+t.slice(0,40)+'"')}});return out.slice(0,40).join('\\n')})()" | tail -45
agent-browser screenshot /home/z/my-project/scripts/shots30/mol_after.png >/dev/null 2>&1
echo done
