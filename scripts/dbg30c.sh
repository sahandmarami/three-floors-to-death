#!/bin/bash
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1)
  [ "$R" = "ok" ] && break; sleep 1
done
inj() {
  agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" 2>&1 | tail -1
  sleep 0.6
}
inj
ovl() {
  T=$(agent-browser eval "typeof window.__ovl" 2>&1 | tail -1)
  if [ "$T" != '"function"' ]; then inj; fi
  agent-browser eval "window.__ovl(3)" 2>&1 | tail -1
}
geo() {
  T=$(agent-browser eval "typeof window.__geo" 2>&1 | tail -1)
  if [ "$T" != '"function"' ]; then inj; fi
  agent-browser eval "window.__geo('$1')" 2>&1 | tail -1
}
infl() { agent-browser eval "window.__infl($1)" 2>&1 | tail -1; }
snap() { agent-browser screenshot /home/z/my-project/scripts/shots30/$1 >/dev/null 2>&1; }
echo "boot=$R helper=$(agent-browser eval 'typeof window.__ovl' 2>&1 | tail -1)"

echo "== A) menu (infl 1.22) =="
agent-browser eval "wipeSave(); 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 15); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
inj; infl 1.22; sleep 0.5
echo "menu: $(ovl)"; snap a_menu_infl.png; infl 0

echo "== B) sheet tabs (infl) =="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
echo "mode=$(agent-browser eval 'state.mode' 2>&1 | tail -1)"
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null; sleep 0.7
infl 1.22; sleep 0.5
for T in up wpn tur sur; do
  agent-browser eval "try{setBPTab('$T', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
  echo "sheet $T: $(ovl)"
done
snap b_sheet_wpn_infl.png; infl 0

echo "== C) peddler =="
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
echo "sheetOpen=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" 2>&1 | tail -1) peddlerOpen=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>&1 | tail -1)"
echo "peddler normal: $(ovl)"
infl 1.22; sleep 0.5
echo "peddler infl: $(ovl)"; snap c_peddler_infl.png; infl 0
echo "geo peddlerPanel: $(geo peddlerPanel)"

echo "== D) backpack full =="
agent-browser eval "try{hidePeddlerPanel(); setBuildPanel(true,true)}catch(e){}; try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike');giveItem('freezeBomb');giveItem('adrenaline')}catch(e){}; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo bpk(normal): $(geo backpackBar)"
infl 1.22; sleep 0.5
echo "geo bpk(infl): $(geo backpackBar)"; echo "ovl: $(ovl)"; snap d_backpack_infl.png; infl 0

echo "== E) night =="
agent-browser eval "try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('shotgun'); updateHUD(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "state.torch.owned=true; state.torch.battery=80; refreshGearHUD(); 'ok'" >/dev/null 2>&1
infl 1.22; sleep 0.5
echo "night infl: $(ovl)"; snap e_night_infl.png; infl 0
for ID in wpnChips28 ctlListen ctlFlash ctlMolotov bpNight bpFab28; do echo "geo $ID: $(geo $ID)"; done

echo "== F) gameover =="
agent-browser eval "state.tower.hp=1; for(let i=0;i<5;i++) spawnZombie('tank'); 'ok'" >/dev/null 2>&1
for i in $(seq 1 30); do M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1); [ "$M" = "gameover" ] && break; sleep 1; done
sleep 5.6
echo "mode=$(agent-browser eval 'state.mode' 2>&1 | tail -1)"
infl 1.22; sleep 0.4
echo "gameover infl: $(ovl)"; snap f_gameover_infl.png; infl 0
for ID in backpackBar btnRetryDay btnRestart1; do echo "geo $ID: $(geo $ID)"; done
echo "done"
