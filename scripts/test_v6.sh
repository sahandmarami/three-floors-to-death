#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۶٫۰ — سه طبقه تا بقا
# ۱) پنل ساخت‌وساز: شب خودکار جمع، روز خودکار باز
# ۲) دکمه‌ی «شب شود» بالای صفحه (زیر HUD) — کف نقشه آزاد
# ۳) گرافیک ارتقایافته (بررسی رگرسیون + اسکرین‌شات برای VLM)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots6
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1"; }
chk()  { # $1=desc $2=actual $3=expected-substring
  if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1 -> got: $2"; fi
}

echo "== 1) load page =="
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 1.5
agent-browser errors | grep -q . && bad "page errors" || ok "no page errors"
chk "GAME api" "$(agent-browser eval "typeof GAME" | tr -d '\n')" "object"
chk "setBuildPanel in API" "$(agent-browser eval "typeof GAME.setBuildPanel" | tr -d '\n')" "function"

echo "== 2) menu regression (clean minimal) =="
agent-browser screenshot $S/01_menu.png >/dev/null
chk "menu title present" "$(agent-browser eval "!!document.querySelector('.game-title')" | tr -d '\n')" "true"
chk "version 6.0 shown" "$(agent-browser eval "document.querySelector('.ver').textContent.includes('۶٫۰')" | tr -d '\n')" "true"
chk "day panel hidden at menu" "$(agent-browser eval "document.getElementById('dayPanel').classList.contains('hidden')" | tr -d '\n')" "true"

echo "== 3) panel intact: 3 grp + 10 tiles + icons =="
chk "3 group headers" "$(agent-browser eval "document.querySelectorAll('.bp-grp').length" | tr -d '\n')" "3"
chk "10 tiles" "$(agent-browser eval "document.querySelectorAll('.bp-tile').length" | tr -d '\n')" "10"
chk "tile has canvas icon" "$(agent-browser eval "document.querySelector('#bp-gatling .bp-ic').width" | tr -d '\n')" "68"
chk "gatling price 60" "$(agent-browser eval "document.getElementById('bp-gatling-cost').textContent" | tr -d '\n')" "۶۰"

echo "== 4) start game -> intermission: panel OPEN =="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
chk "mode intermission" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "intermission"
chk "panel EXPANDED at start" "$(agent-browser eval "!document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"

echo "== 5) wave 1 (night): panel AUTO-COLLAPSED =="
sleep 3.6
chk "wave 1 playing" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "1 playing"
chk "panel AUTO-COLLAPSED at night" "$(agent-browser eval "document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"
PW=$(agent-browser eval "Math.round(document.getElementById('buildPanel').getBoundingClientRect().width)" | tr -d '"\n ')
if [ "$PW" -lt 150 ] 2>/dev/null; then ok "collapsed pill is small (width=$PW < 150)"; else bad "collapsed width too big: $PW"; fi
PTOP=$(agent-browser eval "Math.round(document.getElementById('buildPanel').getBoundingClientRect().top)" | tr -d '"\n ')
if [ "$PTOP" -lt 100 ] 2>/dev/null; then ok "pill sits in sky area (top=$PTOP < 100 — away from zombies)"; else bad "pill too low: $PTOP"; fi
agent-browser screenshot $S/02_night_wave1_panel_collapsed.png >/dev/null
chk "chevron shows ▸" "$(agent-browser eval "document.getElementById('bpChev').textContent" | tr -d '\n')" "▸"

echo "== 6) B key toggles panel manually =="
agent-browser press b >/dev/null; sleep 0.2
chk "B expands panel" "$(agent-browser eval "!document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"
agent-browser screenshot $S/03_night_panel_manual_open.png >/dev/null
agent-browser press b >/dev/null; sleep 0.2
chk "B collapses panel again" "$(agent-browser eval "document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"

echo "== 7) keyboard buy works while panel collapsed =="
CB=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
agent-browser eval "GAME.giveCoins(50)" >/dev/null
agent-browser press 4 >/dev/null; sleep 0.2
CAFTER=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
if [ "$CAFTER" -lt "$CB" ] 2>/dev/null || [ "$CB" = "0" ]; then ok "key 4 bought weapon upgrade while collapsed (coins $CB -> $CAFTER +50 given)"; else bad "no purchase: $CB -> $CAFTER"; fi
chk "weapon lvl >= 1" "$(agent-browser eval "GAME.state.upgrades.weapon >= 1" | tr -d '\n')" "true"

echo "== 8) day: panel AUTO-OPEN + night button at TOP =="
agent-browser eval "GAME.endWave()" >/dev/null
sleep 2.6
chk "mode = day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "panel AUTO-EXPANDED at day" "$(agent-browser eval "!document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"
chk "day panel visible" "$(agent-browser eval "!document.getElementById('dayPanel').classList.contains('hidden')" | tr -d '\n')" "true"
chk "night button text wave 2" "$(agent-browser eval "document.getElementById('btnNight').textContent" | tr -d '\n')" "موج ۲"
BTN=$(agent-browser eval "(()=>{const r=document.getElementById('btnNight').getBoundingClientRect();return Math.round(r.top)+' '+Math.round(r.bottom)+' '+Math.round(r.left+r.width/2)})()" | tr -d '"\n ')
BT=$(echo $BTN | cut -d' ' -f1); BB=$(echo $BTN | cut -d' ' -f2); BC=$(echo $BTN | cut -d' ' -f3)
if [ "$BT" -lt 120 ] 2>/dev/null; then ok "night button at TOP (top=$BT < 120)"; else bad "button top=$BT"; fi
if [ "$BB" -lt 150 ] 2>/dev/null; then ok "button well above map floor (bottom=$BB < 150)"; else bad "button bottom=$BB"; fi
if [ "$BC" -gt 460 ] && [ "$BC" -lt 640 ]; then ok "button horizontally centered (cx=$BC)"; else bad "button cx=$BC"; fi
agent-browser screenshot $S/04_day_button_top.png >/dev/null
chk "chevron shows ▾" "$(agent-browser eval "document.getElementById('bpChev').textContent" | tr -d '\n')" "▾"

echo "== 9) map floor FREE: place turrets where old button used to be =="
agent-browser eval "GAME.giveCoins(300)" >/dev/null
chk "place turret at bottom-center-right (560,486)" "$(agent-browser eval "GAME.attemptBuy('gatling'); GAME.clickPlace(560,486); GAME.state.turrets.length + ' t=' + GAME.state.turrets[GAME.state.turrets.length-1].x" | tr -d '\n')" "1 t=560"
chk "place turret at bottom-center-left (350,486)" "$(agent-browser eval "GAME.attemptBuy('sniper'); GAME.clickPlace(350,486); GAME.state.turrets.length" | tr -d '\n')" "2"
agent-browser screenshot $S/05_day_turrets_floor_free.png >/dev/null

echo "== 10) click night button -> wave 2 night, panel auto-collapses =="
agent-browser click "#btnNight" >/dev/null
sleep 3.2
chk "wave 2 playing (night)" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "2 playing"
chk "dayness back to 0" "$(agent-browser eval "GAME.state.dayness.toFixed(1)" | tr -d '"\n ')" "0.0"
chk "panel AUTO-COLLAPSED again" "$(agent-browser eval "document.getElementById('buildPanel').classList.contains('collapsed')" | tr -d '\n')" "true"
chk "turrets survived" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '\n')" "2"
sleep 2.0
agent-browser screenshot $S/06_night_wave2.png >/dev/null

echo "== 11) zombies right side: shootable (bullet hits) =="
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.spawnType('normal');const zs=GAME.state.zombies;const z=zs[zs.length-1];z.x=880;z.y=492;z.hp=1;GAME.state.bullets.push({x:860,y:470,vx:200,vy:20,dmg:9,r:4,life:1,knock:0,dead:false,pellet:false});return 'armed'})()" >/dev/null
sleep 0.6
chk "right-side zombie killed by bullet" "$(agent-browser eval "GAME.state.stats.kills >= 1" | tr -d '\n')" "true"

echo "== 12) zoom detail shots for VLM =="
agent-browser eval "document.getElementById('wrap').style.transform='scale(1.9)';document.getElementById('wrap').style.transformOrigin='30% 55%';'zoomed'" >/dev/null
sleep 0.3
agent-browser screenshot $S/07_zoom_tower_night.png >/dev/null
agent-browser eval "document.getElementById('wrap').style.transformOrigin='78% 30%';'z2'" >/dev/null
sleep 0.3
agent-browser screenshot $S/08_zoom_sky_moon.png >/dev/null
agent-browser eval "document.getElementById('wrap').style.transform='none';'reset'" >/dev/null
sleep 0.2

echo "== 13) final: no console errors =="
agent-browser errors | grep -q . && bad "console errors at end" || ok "no console errors at end"

echo ""
echo "======================================"
echo " PASS=$PASS  FAIL=$FAIL"
echo "======================================"
[ $FAIL -eq 0 ] && echo "ALL TESTS PASSED" || echo "SOME TESTS FAILED"
