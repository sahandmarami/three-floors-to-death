#!/bin/bash
# اسکرین‌شات‌های تأییدی v28 — گوشی 780×360
URL="http://localhost:3002/three-floors-to-survival.html"
D=/home/z/my-project/scripts/shots28v
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
sleep 1
agent-browser screenshot $D/menu.png >/dev/null 2>&1

# استوری‌موشن صحنه ۳ (پیدا کردن ساختمان — قبلاً سفید می‌شد)
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "INTRO.idx=2; INTRO.t=9.5; 'jump'" >/dev/null; sleep 2.5
for i in $(seq 1 12); do IDX=$(agent-browser eval "INTRO?INTRO.idx:'-'" 2>/dev/null | tail -1); [ "$IDX" = "3" ] && break; sleep 1.5; done
sleep 3
agent-browser screenshot $D/scene3.png >/dev/null 2>&1

# ورود به بازی
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.tower.maxHp=999999; state.tower.hp=999999; state.zombies=[]; state.spawn.queue=[]; state.spawn.timer=99999; updateHUD(); 'god'" >/dev/null 2>&1
sleep 1
agent-browser screenshot $D/gameplay.png >/dev/null 2>&1

# HUD با سلاح‌ها
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('pistol'); updateHUD(); 'ok'" >/dev/null 2>&1
sleep 0.8
agent-browser screenshot $D/hud_weapons.png >/dev/null 2>&1

# باتن‌شیت ساخت‌وساز + FAB
agent-browser eval "DLG.skip(); setBuildPanel(true,true); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser screenshot $D/buildsheet.png >/dev/null 2>&1
agent-browser eval "setBuildPanel(false,true); 'ok'" >/dev/null 2>&1; sleep 0.6
agent-browser screenshot $D/fab.png >/dev/null 2>&1

# منوی توقف
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.8
agent-browser screenshot $D/pause.png >/dev/null 2>&1
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4

# صفحه باخت
agent-browser eval "GAME.gameOver(); 'ok'" >/dev/null 2>&1; sleep 1.2
agent-browser screenshot $D/defeat.png >/dev/null 2>&1
agent-browser close --all >/dev/null 2>&1
echo "shots saved: $(ls $D | wc -l)"
