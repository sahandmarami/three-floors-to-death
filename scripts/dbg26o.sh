#!/bin/bash
URL="http://localhost:3002/three-floors-to-survival.html?r=$RANDOM"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
agent-browser eval "(()=>{const els=[...document.querySelectorAll('#hud *,#buildPanel *,#backpackBar *,#lockBadge *')];for(const e of els){if(e.innerHTML && e.innerHTML.includes('🎒') && e.children.length===0)return e.id||e.className}return 'text-node-parent'})()" | tail -2
agent-browser eval "document.getElementById('bpkCap').innerHTML.slice(0,120)" | tail -2
