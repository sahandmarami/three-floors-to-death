#!/bin/bash
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
inj() { agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null 2>&1; sleep 0.6; }
ovl() { T=$(agent-browser eval "typeof window.__ovl" 2>&1 | tail -1); if [ "$T" != '"function"' ]; then inj; fi; agent-browser eval "window.__ovl(3)" 2>&1 | tail -1; }
geo() { T=$(agent-browser eval "typeof window.__geo" 2>&1 | tail -1); if [ "$T" != '"function"' ]; then inj; fi; agent-browser eval "window.__geo('$1')" 2>&1 | tail -1; }
infl() { agent-browser eval "window.__infl($1)" 2>&1 | tail -1; }
snap() { agent-browser screenshot /home/z/my-project/scripts/shots30/$1 >/dev/null 2>&1; }
inj
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
agent-browser eval "try{renderPeddlerStock()}catch(e){}; try{hidePeddlerPanel()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
echo "== روز: پیل دستفروش (شیار ۳) + کوله باز =="
echo "geo pedReopenBtn: $(geo pedReopenBtn)"
agent-browser eval "try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike');giveItem('freezeBomb');giveItem('adrenaline')}catch(e){}; refreshBackpack(); document.getElementById('backpackBar').classList.add('open30'); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo bpk باز: $(geo backpackBar)"
infl 1.22; sleep 0.5
echo "همه‌چیز باز + فونت متورم: $(ovl)"
snap v5_day_all_infl.png; infl 0
echo "geo bpk-cap: $(geo bpkCap) | geo molotovBtn: $(geo molotovBtn) | geo ctlFlash: $(geo ctlFlash)"
echo "done"
