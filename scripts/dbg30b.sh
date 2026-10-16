#!/bin/bash
# dbg30b.sh — تشخیص v30 (نسخه‌ی درست): هم‌پوشانی دکمه‌ها + شبیه‌سازی textZoom
URL="http://localhost:3002/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots30
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1)
  [ "$R" = "ok" ] && break; sleep 1
done
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js'; document.head.appendChild(s); 'ok'" >/dev/null
sleep 1
echo "boot: $R | uiz=$(agent-browser eval "getComputedStyle(document.getElementById('wrap')).getPropertyValue('--uiz')" 2>/dev/null | tail -1)"

snap() { agent-browser screenshot /home/z/my-project/scripts/shots30/$1 >/dev/null 2>&1; }
ovl() { agent-browser eval "window.__ovl(3)" 2>/dev/null | tail -1; }
geo() { agent-browser eval "window.__geo('$1')" 2>/dev/null | tail -1; }

echo ""
echo "===== A) منوی اصلی (فونت متورم ×۱.۲۲) ====="
agent-browser eval "wipeSave(); 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 20); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "menu:   $(ovl)"
snap a_menu_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== B) شیت ساخت‌وساز (هر تب، فونت متورم) ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null; sleep 0.7
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
for T in up wpn tur sur; do
  agent-browser eval "try{setBPTab('$T', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
  echo "sheet $T: $(ovl)"
done
snap b_sheet_wpn_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== C) دستفروش (پنل تنها + همزمان با شیت) ====="
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
echo "peddlerBox visible after skips: $B"
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
echo "sh-at same time: sheetOpen=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" | tail -1) peddlerOpen=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" | tail -1)"
echo "peddler normal:   $(ovl)"
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "peddler inflated: $(ovl)"
snap c_peddler_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
echo "geo peddlerPanel: $(geo peddlerPanel)"

echo ""
echo "===== D) کوله‌پشتی پر (در روز) ====="
agent-browser eval "try{hidePeddlerPanel()}catch(e){}; 'ok'" >/dev/null 2>&1
agent-browser eval "try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike');giveItem('freezeBomb');giveItem('adrenaline')}catch(e){}; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo backpackBar (normal):   $(geo backpackBar)"
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo backpackBar (inflated): $(geo backpackBar)"
echo "ovl (inflated): $(ovl)"
snap d_backpack_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== E) شب — گیم‌پلی + چیپ‌ها + ستون چپ ====="
agent-browser eval "try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('shotgun'); updateHUD(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "state.torch.owned=true; state.torch.battery=80; refreshGearHUD(); 'ok'" >/dev/null 2>&1
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "night inflated: $(ovl)"
snap e_night_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
for ID in wpnChips28 ctlListen ctlFlash ctlMolotov bpNight bpFab28; do echo "geo $ID: $(geo $ID)"; done

echo ""
echo "===== F) صفحه‌ی باخت (تا آخر: زامبی‌ها برج را بخورند) ====="
agent-browser eval "state.tower.hp=1; state.tower.maxHp=100; for(let i=0;i<5;i++) spawnZombie('tank'); 'ok'" >/dev/null 2>&1
for i in $(seq 1 30); do
  M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1)
  [ "$M" = "gameover" ] && break
  sleep 1
done
echo "mode now: $M"
sleep 5.6
M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1)
echo "mode after cine: $M"
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.4
echo "gameover inflated: $(ovl)"
snap f_gameover_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
for ID in backpackBar btnRetryDay btnRestart1; do echo "geo $ID: $(geo $ID)"; done

echo ""
echo "===== G) توقف (متورم) ====="
agent-browser eval "location.reload(); 'ok'" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode!=='undefined'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js'; document.head.appendChild(s); 'ok'" >/dev/null; sleep 0.5
agent-browser eval "GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.4
echo "pause inflated: $(ovl)"
snap g_pause_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "done — shots in scripts/shots30/"
