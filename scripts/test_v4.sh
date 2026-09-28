#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۴٫۰ — سه طبقه تا بقا
# برجک‌های دفاعی: خرید، نصب، شلیک خودکار، یخ‌زدگی، ارتقا، لغو
# (همه‌ی evalها با IIFE تا متغیرها بین فراخوانی‌ها نشت نکنند)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots4
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

echo "== 2) menu + panel =="
agent-browser screenshot $S/01_menu.png >/dev/null
chk "panel children (3 grp + 10 items = 13)" "$(agent-browser eval "document.getElementById('bpList').children.length" | tr -d '\n')" "13"
chk "3 group headers" "$(agent-browser eval "document.querySelectorAll('.bp-grp').length" | tr -d '\n')" "3"
chk "gatling item" "$(agent-browser eval "!!document.getElementById('bp-gatling')" | tr -d '\n')" "true"
chk "turretUp item" "$(agent-browser eval "!!document.getElementById('bp-turretUp')" | tr -d '\n')" "true"

echo "== 3) start + buy gatling =="
agent-browser eval "GAME.startGame(); GAME.giveCoins(1000); GAME.state.mode" >/dev/null
sleep 0.3
chk "panel click -> placing" "$(agent-browser eval "document.getElementById('bp-gatling').click(); GAME.state.placing && GAME.state.placing.type" | tr -d '\n')" "gatling"
chk "coins not deducted yet" "$(agent-browser eval "GAME.state.coins" | tr -d '\n')" "1000"
agent-browser screenshot $S/02_placing_ghost.png >/dev/null

CX=$(agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return Math.round(r.left+200/960*r.width)})()" | tr -d '\n')
CY=$(agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return Math.round(r.top+485/560*r.height)})()" | tr -d '\n')
agent-browser mouse move $CX $CY >/dev/null
sleep 0.2
agent-browser mouse down left >/dev/null
agent-browser mouse up left >/dev/null
sleep 0.3
chk "real mouse click -> placed gatling (120c)" "$(agent-browser eval "GAME.state.turrets.length+' '+GAME.state.turrets[0].type+' '+GAME.state.coins+' p='+(GAME.state.placing?'y':'n')" | tr -d '\n')" "1 gatling 880 p=n"

echo "== 4) invalid spots rejected =="
agent-browser eval "GAME.attemptBuy('sniper'); GAME.state.placing.type" >/dev/null
chk "too close to tower rejected" "$(agent-browser eval "GAME.clickPlace(480,485); GAME.state.turrets.length+' p='+GAME.state.placing.type" | tr -d '\n')" "1 p=sniper"
chk "out of ground band rejected" "$(agent-browser eval "GAME.clickPlace(200,100); GAME.state.turrets.length" | tr -d '\n')" "1"

echo "== 5) Esc cancels =="
agent-browser press Escape >/dev/null
sleep 0.2
chk "Esc -> placing null" "$(agent-browser eval "GAME.state.placing===null" | tr -d '\n')" "true"

echo "== 6) key G buy + right-click cancel =="
agent-browser press g >/dev/null
sleep 0.2
chk "key G -> placing sniper" "$(agent-browser eval "GAME.state.placing && GAME.state.placing.type" | tr -d '\n')" "sniper"
chk "right-click -> cancel" "$(agent-browser eval "document.getElementById('game').dispatchEvent(new PointerEvent('pointerdown',{button:2,clientX:300,clientY:300,bubbles:true})); GAME.state.placing===null" | tr -d '\n')" "true"

echo "== 7) gatling auto-fire =="
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.spawnType('tank');const zs=GAME.state.zombies;const z=zs[zs.length-1];z.x=250;return 'forced'})()" >/dev/null
sleep 2.5
R=$(agent-browser eval "(()=>{const zs=GAME.state.zombies.filter(z=>!z.dead);const hurt=zs.some(z=>z.hp<z.maxHp-0.5);const tur=GAME.state.bullets.some(b=>b.tur);return 'hurt='+hurt+' bullet='+tur+' kills='+GAME.state.stats.turKills})()" | tr -d '\n')
echo "     $R"
if echo "$R" | grep -qE "hurt=true|bullet=true|kills=[1-9]"; then ok "gatling auto-fires and damages"; else bad "gatling did not fire: $R"; fi
agent-browser screenshot $S/03_gatling_firing.png >/dev/null

echo "== 8) frost turret chills =="
chk "frost placed (200c)" "$(agent-browser eval "GAME.giveCoins(500); GAME.attemptBuy('frost'); GAME.clickPlace(320,500); GAME.state.turrets.map(t=>t.type).join(',')" | tr -d '\n')" "gatling,frost"
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.spawnType('tank');const zs=GAME.state.zombies;const z=zs[zs.length-1];z.x=380;return 'ok'})()" >/dev/null
sleep 2.0
chk "ice bolt -> zombie chilled" "$(agent-browser eval "(()=>{const zs=GAME.state.zombies.filter(z=>!z.dead);return zs.some(z=>z.chill>0)?'chilled':'not-chilled n='+zs.length})()" | tr -d '\n')" "chilled"
agent-browser screenshot $S/04_frost_chill.png >/dev/null

echo "== 9) sniper + upgrade =="
chk "sniper placed (300c)" "$(agent-browser eval "GAME.attemptBuy('sniper'); GAME.clickPlace(690,490); GAME.state.turrets.map(t=>t.type).join(',')" | tr -d '\n')" "gatling,frost,sniper"
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.state.bullets.length=0;GAME.spawnType('tank');const zs=GAME.state.zombies;const z=zs[zs.length-1];z.x=820;z.hp=z.maxHp;return 'hp='+z.hp})()" >/dev/null
sleep 2.2
R=$(agent-browser eval "(()=>{const zs=GAME.state.zombies.filter(z=>!z.dead);if(!zs.length)return 'killed-by-sniper';const z=zs[0];return 'hp='+Math.round(z.hp)+' max='+z.maxHp})()" | tr -d '\n')
echo "     $R"
if echo "$R" | grep -q "killed-by-sniper" || ! echo "$R" | grep -q "hp=51"; then ok "sniper dealt heavy damage"; else bad "sniper did not fire: $R"; fi
agent-browser screenshot $S/05_sniper.png >/dev/null
agent-browser press t >/dev/null
sleep 0.3
chk "key T -> turretUp lvl 1" "$(agent-browser eval "GAME.state.upgrades.turretUp+' c='+GAME.state.coins" | tr -d '\n')" "1 c="

echo "== 10) max 6 turrets =="
agent-browser eval "(()=>{GAME.giveCoins(2000);for(const p of [[120,495],[280,470],[420,500],[560,475],[640,500]])GAME.placeTurret('gatling',p[0],p[1]);return 'total='+GAME.state.turrets.length})()" > /tmp/r.txt
chk "5 test turrets added" "$(cat /tmp/r.txt | tr -d '\n')" "total=8"
chk "7th turret purchase denied" "$(agent-browser eval "GAME.state.turrets.length=6; GAME.attemptBuy('gatling'); GAME.state.placing===null?'denied':'allowed'" | tr -d '\n')" "denied"

echo "== 11) regression: player shooting =="
agent-browser eval "window._s0=GAME.state.stats.shots; 'b='+window._s0" >/dev/null
CX=$(agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return Math.round(r.left+300/960*r.width)})()" | tr -d '\n')
CY=$(agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return Math.round(r.top+300/560*r.height)})()" | tr -d '\n')
agent-browser mouse move $CX $CY >/dev/null
agent-browser mouse down left >/dev/null
sleep 0.4
agent-browser mouse up left >/dev/null
chk "player still shoots" "$(agent-browser eval "GAME.state.stats.shots>window._s0?'fired:'+GAME.state.stats.shots:'no-fire'" | tr -d '\n')" "fired:"

echo "== 12) victory/gameover stats =="
agent-browser eval "GAME.win(); 'v'" >/dev/null
sleep 0.5
chk "victory stats include turret kills" "$(agent-browser eval "document.getElementById('vStats').textContent" | tr -d '\n')" "کشتار برجک"
agent-browser screenshot $S/06_victory_stats.png >/dev/null
agent-browser eval "GAME.startGame(); GAME.startWave(1); GAME.hurt(500); 'go'" >/dev/null
sleep 0.7
chk "gameover stats include turret kills" "$(agent-browser eval "document.getElementById('goStats').textContent" | tr -d '\n')" "کشتار برجک"

echo "== 13) full reset =="
chk "restart -> turrets/upgrades reset" "$(agent-browser eval "GAME.startGame(); GAME.state.turrets.length+'/'+GAME.state.upgrades.turretUp" | tr -d '\n')" "0/0"
agent-browser errors | grep -q . && bad "console errors at end" || ok "whole run without console errors"

echo ""
echo "RESULT: $PASS passed / $FAIL failed"
agent-browser close >/dev/null 2>&1
exit $FAIL
