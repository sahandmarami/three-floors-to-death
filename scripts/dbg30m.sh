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
echo "== M1) منو (متورم) =="
agent-browser eval "wipeSave(); 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 15); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
inj
infl 1.22; sleep 0.5
echo "menu: $(ovl)"; snap m1_menu.png; infl 0

echo "== M2) روز: داک بالا + چیپ‌ها + پیل دستفروش + کوله =="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
echo "mode: $(agent-browser eval 'state.mode' | tail -1)"
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
echo "پنل دستفروش باز: $B | داکِ همزمان (باید hidden باشد): $(agent-browser eval "getComputedStyle(document.getElementById('buildPanel')).display" 2>&1 | tail -1) | peddler-on: $(agent-browser eval "document.getElementById('wrap').classList.contains('peddler-on')?1:0" 2>&1 | tail -1)"
infl 1.22; sleep 0.5
echo "peddler infl: $(ovl)"; snap m2_peddler.png; infl 0
echo "geo peddlerPanel: $(geo peddlerPanel)"
# بستن دستفروش → داک برگردد
agent-browser eval "try{hidePeddlerPanel()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.5
echo "بعد از بستن: داک display: $(agent-browser eval "getComputedStyle(document.getElementById('buildPanel')).display" 2>&1 | tail -1) | peddler-on: $(agent-browser eval "document.getElementById('wrap').classList.contains('peddler-on')?1:0" 2>&1 | tail -1)"
# کوله پر + باز
agent-browser eval "try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike');giveItem('freezeBomb');giveItem('adrenaline')}catch(e){}; refreshBackpack(); document.getElementById('backpackBar').classList.add('open30'); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo bpk باز: $(geo backpackBar) | geo pedReopenBtn: $(geo pedReopenBtn)"
infl 1.22; sleep 0.5
echo "همه‌چیز باز + متورم: $(ovl)"; snap m3_day_all.png; infl 0

echo "== M3) شب: داک + چیپ‌ها + شنود/مولوتوف =="
agent-browser eval "document.getElementById('backpackBar').classList.remove('open30'); try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('shotgun'); updateHUD(); state.torch.owned=true; state.torch.battery=80; refreshGearHUD(); 'ok'" >/dev/null 2>&1; sleep 0.5
infl 1.22; sleep 0.5
echo "night infl: $(ovl)"; snap m4_night.png; infl 0
for ID in wpnChips28 buildPanel ctlFlash listenBtn molotovBtn bpNight backpackBar; do echo "geo $ID: $(geo $ID)"; done

echo "== M4) باخت: go-mode =="
agent-browser eval "state.tower.hp=1; for(let i=0;i<5;i++) spawnZombie('tank'); 'ok'" >/dev/null 2>&1
for i in $(seq 1 30); do M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1 | tr -d '\"'); [ "$M" = "gameover" ] && break; sleep 1; done
sleep 5.6
echo "mode: $(agent-browser eval 'state.mode' | tail -1) | go-mode: $(agent-browser eval "document.getElementById('wrap').classList.contains('go-mode')?1:0" 2>&1 | tail -1)"
infl 1.22; sleep 0.4
echo "gameover infl: $(ovl)"; snap m5_gameover.png; infl 0
echo "geo backpackBar: $(geo backpackBar) | geo btnRetryDay: $(geo btnRetryDay)"
echo "done"
