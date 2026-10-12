#!/bin/bash
URL="http://localhost:3000/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null 2>&1; sleep 3
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
echo "MYST defined: $(agent-browser eval "typeof MYST" | tail -1)"
echo "listenBtn exists: $(agent-browser eval "!!document.getElementById('listenBtn')" | tail -1)"
echo "listenBtn display: $(agent-browser eval "document.getElementById('listenBtn')?document.getElementById('listenBtn').style.display:'none'" | tail -1)"
echo "molotovs: $(agent-browser eval "MYST.molotovs" | tail -1)"
echo "ICO defined: $(agent-browser eval "typeof ICO" | tail -1)"
echo "console errors:"
agent-browser console 2>/dev/null | grep -i "error\|uncaught" | tail -8
