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
agent-browser eval "(()=>{const t=document.getElementById('hud').innerHTML + document.getElementById('buildPanel').innerHTML + document.getElementById('backpackBar').innerHTML + document.getElementById('lockBadge').innerHTML; const m=t.match(/⏸|🔊|🔦|👂|🔥|🔍|🛠|🌙|🎒|💀|❤/g); return m?m.join(','): 'NONE'})()" | tail -2
