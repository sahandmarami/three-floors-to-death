#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html?t=$(date +%s)"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
echo "MYST.update source (first 600 chars):"
agent-browser eval "MYST.update.toString().slice(0,600)" | tail -5
