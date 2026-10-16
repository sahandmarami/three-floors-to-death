#!/bin/bash
# inspect_sheet2 — شیت تمیز بدون گفتگو
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
agent-browser eval "state.coins=2000; WEAPONS.shotgun.owned=true; 'ok'" >/dev/null
agent-browser eval "try{DLG.skip()}catch(e){}; try{hideAnnounce()}catch(e){}; 'ok'" >/dev/null
# بستن پنل‌های مزاحم
agent-browser eval "try{PED.hide()}catch(e){}; try{MYST.closePanel()}catch(e){}; 'ok'" >/dev/null 2>&1
agent-browser eval "try{openBuild29()}catch(e){try{toggleBuildPanel()}catch(e2){}}; 'ok'" >/dev/null; sleep 0.8
agent-browser eval "setBPTab('wpn'); 'ok'" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots30/clean_wpn.png >/dev/null 2>&1
agent-browser eval "setBPTab('sur'); 'ok'" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots30/clean_sur.png >/dev/null 2>&1
agent-browser eval "setBPTab('up'); 'ok'" >/dev/null; sleep 0.4
agent-browser screenshot /home/z/my-project/scripts/shots30/clean_up.png >/dev/null 2>&1
echo "=== sheet rect ==="
agent-browser eval "(()=>{const p=document.getElementById('buildPanel');const r=p.getBoundingClientRect();return 'sheet '+r.width.toFixed(0)+'x'+r.height.toFixed(0)+' at y='+r.top.toFixed(0)+' | class='+p.className})()" | tail -1
echo "=== ارتفاع bpList (اسکرول) ==="
agent-browser eval "(()=>{const l=document.getElementById('bpList');const r=l.getBoundingClientRect();return 'list '+r.width.toFixed(0)+'x'+r.height.toFixed(0)+' scrollH='+l.scrollHeight})()" | tail -1
echo done
