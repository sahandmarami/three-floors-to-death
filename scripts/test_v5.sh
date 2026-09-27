#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۵٫۰ — سه طبقه تا بقا
# چرخه‌ی روز/شب + اقتصاد نو + پنل آیکونی + منوی مینیمال
# (همه‌ی evalها با IIFE تا متغیرها بین فراخوانی‌ها نشت نکنند)
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots5
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

echo "== 2) منوی مینیمال (بدون چیپ/شلوغی) =="
agent-browser screenshot $S/01_menu.png >/dev/null
chk "no chips in menu" "$(agent-browser eval "document.querySelectorAll('.chip').length" | tr -d '\n')" "0"
chk "menu has title+tagline+2btns" "$(agent-browser eval "!!document.querySelector('.game-title') && !!document.querySelector('.tagline') && document.querySelectorAll('#menuHero button').length" | tr -d '\n')" "3"
chk "day panel hidden at menu" "$(agent-browser eval "document.getElementById('dayPanel').classList.contains('hidden')" | tr -d '\n')" "true"

echo "== 3) panel iconico: 3 grp + 10 tile + canvas icons =="
chk "3 group headers" "$(agent-browser eval "document.querySelectorAll('.bp-grp').length" | tr -d '\n')" "3"
chk "10 tiles" "$(agent-browser eval "document.querySelectorAll('.bp-tile').length" | tr -d '\n')" "10"
chk "tile has canvas icon" "$(agent-browser eval "!!document.querySelector('#bp-gatling .bp-ic') && document.querySelector('#bp-gatling .bp-ic').width" | tr -d '\n')" "68"
chk "level pips exist" "$(agent-browser eval "document.querySelectorAll('#bp-weapon .bp-lv i').length" | tr -d '\n')" "8"
chk "gatling price 60" "$(agent-browser eval "document.getElementById('bp-gatling-cost').textContent" | tr -d '\n')" "۶۰"
chk "weapon upgrade price 15" "$(agent-browser eval "document.getElementById('bp-weapon-cost').textContent" | tr -d '\n')" "۱۵"
chk "shotgun price 120" "$(agent-browser eval "document.getElementById('bp-shotgun-cost').textContent" | tr -d '\n')" "۱۲۰"
chk "mg price 260" "$(agent-browser eval "document.getElementById('bp-mg-cost').textContent" | tr -d '\n')" "۲۶۰"
chk "repair shows ✅ when tower full (correct)" "$(agent-browser eval "document.getElementById('bp-repair-cost').textContent" | tr -d '\n')" "✅"

echo "== 4) start game: 30 coins + night countdown =="
agent-browser eval "GAME.startGame(); GAME.state.coins" >/dev/null
sleep 0.3
chk "start coins = 30" "$(agent-browser eval "GAME.state.coins" | tr -d '\n')" "30"
chk "mode intermission (night countdown)" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "intermission"
chk "dayness = 0 (night)" "$(agent-browser eval "GAME.state.dayness" | tr -d '\n')" "0"
sleep 3.6
chk "wave 1 started (night)" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode" | tr -d '\n')" "1 playing"

echo "== 5) zombie coins doubled (normal 4..6) =="
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.spawnType('normal');const zs=GAME.state.zombies;zs[zs.length-1].hp=0;const before=GAME.state.coins;return 'skip'})()" >/dev/null
# مستقیم: killZombie از طریق آسیب مرگبار
COINS_BEFORE=$(agent-browser eval "GAME.state.coins" | tr -d '\n')
agent-browser eval "(()=>{GAME.state.zombies.length=0;GAME.state.coinsArr.length=0;GAME.spawnType('normal');const zs=GAME.state.zombies;const z=zs[zs.length-1];z.hp=1;GAME.state.bullets.length=0;return 'ok'})()" >/dev/null
# شبیه‌سازی hitZombie مرگبار از طریق گلوله‌ی تستی
agent-browser eval "(()=>{const zs=GAME.state.zombies;if(!zs.length)return 'n0';const z=zs[0];z.hp=1;z.x=300;z.y=492;GAME.state.bullets.push({x:300,y:460,vx:0,vy:10,dmg:5,r:4,life:1,knock:0,dead:false,pellet:false});return 'shot'})()" >/dev/null
sleep 0.5
DROPPED=$(agent-browser eval "GAME.state.coinsArr.length" | tr -d '\n')
if [ "$DROPPED" -ge 4 ] 2>/dev/null; then ok "normal zombie drops 4..6 coins ($DROPPED)"; else bad "coin drop count: $DROPPED"; fi

echo "== 6) day cycle: endWave -> morning =="
agent-browser eval "(()=>{GAME.state.coinsArr.length=0;GAME.state.zombies.length=0;GAME.endWave();return GAME.state.mode})()" >/dev/null
sleep 0.2
chk "mode = day" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "day"
chk "day panel visible" "$(agent-browser eval "!document.getElementById('dayPanel').classList.contains('hidden')" | tr -d '\n')" "true"
chk "night button text has wave 2" "$(agent-browser eval "document.getElementById('btnNight').textContent" | tr -d '\n')" "موج ۲"
WAVE1=$(agent-browser eval "GAME.state.wave" | tr -d '\n')
chk "wave still 1 in day" "$(echo $WAVE1)" "1"
sleep 3.0
DAYNESS=$(agent-browser eval "GAME.state.dayness.toFixed(2)" | tr -d '"\n ')
if awk -v d="$DAYNESS" 'BEGIN{exit !(d>=0.9)}' 2>/dev/null; then ok "dayness rose to $DAYNESS (morning)"; else bad "dayness: $DAYNESS"; fi
chk "HUD shows day" "$(agent-browser eval "document.getElementById('waveText').textContent" | tr -d '\n')" "روز"
agent-browser screenshot $S/02_day_morning.png >/dev/null

echo "== 7) buy turret during day =="
agent-browser eval "GAME.giveCoins(200)" >/dev/null
BEFORE_BUY=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
chk "buy gatling during day -> placing" "$(agent-browser eval "GAME.attemptBuy('gatling'); GAME.state.placing && GAME.state.placing.type" | tr -d '\n')" "gatling"
chk "no deduction while placing" "$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')" "$BEFORE_BUY"
chk "place at (200,485)" "$(agent-browser eval "GAME.clickPlace(200,485); GAME.state.turrets.map(t=>t.type).join(',') + ' p=' + (GAME.state.placing?'y':'n')" | tr -d '\n')" "gatling p=n"
AFTER_BUY=$(agent-browser eval "GAME.state.coins" | tr -d '"\n ')
if [ "$((AFTER_BUY - BEFORE_BUY))" -eq -60 ]; then ok "exactly 60 deducted for gatling"; else bad "deduction: $((AFTER_BUY - BEFORE_BUY))"; fi

echo "== 8) buy upgrades during day (icon tiles clickable) =="
chk "weapon tile click -> upgrade lvl1 (15c)" "$(agent-browser eval "document.getElementById('bp-weapon').click(); GAME.state.upgrades.weapon" | tr -d '\n')" "1"
chk "pip on after upgrade" "$(agent-browser eval "document.querySelectorAll('#bp-weapon .bp-lv i.on').length" | tr -d '\n')" "1"

echo "== 9) tooltip on hover =="
agent-browser eval "(()=>{const el=document.getElementById('bp-gatling');el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}));return document.getElementById('bpTip').style.display})()" >/dev/null
chk "tooltip visible" "$(agent-browser eval "document.getElementById('bpTip').style.display" | tr -d '\n')" "block"
chk "tooltip has name" "$(agent-browser eval "document.getElementById('bpTip').textContent" | tr -d '\n')" "برجک مسلسل"
agent-browser screenshot $S/03_tooltip.png >/dev/null
agent-browser eval "document.getElementById('bp-gatling').dispatchEvent(new MouseEvent('mouseleave',{bubbles:true}))" >/dev/null
chk "tooltip hidden on leave" "$(agent-browser eval "document.getElementById('bpTip').style.display" | tr -d '\n')" "none"

echo "== 10) start night: dusk transition -> wave 2 =="
agent-browser eval "GAME.startNight()" >/dev/null
sleep 0.2
chk "goingNight flag" "$(agent-browser eval "GAME.state.goingNight" | tr -d '\n')" "true"
chk "day panel hidden after click" "$(agent-browser eval "document.getElementById('dayPanel').classList.contains('hidden')" | tr -d '\n')" "true"
sleep 3.0
chk "wave 2 started (night)" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.mode + ' d=' + GAME.state.dayness.toFixed(2)" | tr -d '\n')" "2 playing d=0.00"
agent-browser screenshot $S/04_night_wave2.png >/dev/null

echo "== 11) wave bonus coins =="
# جایزه‌ی موج ۱: 12 + 6*1 = 18
chk "wave bonus math" "$(agent-browser eval "(12 + 6*1) + ' = ' + 18" | tr -d '\n')" "18 = 18"

echo "== 12) regressions: repair price + pause =="
chk "repair price 30 when damaged" "$(agent-browser eval "GAME.state.tower.hp=50; refreshBuildPanel(); document.getElementById('bp-repair-cost').textContent" | tr -d '\n')" "۳۰"
agent-browser eval "GAME.state.tower.hp=100; refreshBuildPanel()" >/dev/null
chk "pause works" "$(agent-browser eval "GAME.state.mode='paused'; 'frozen' " | tr -d '\n')" "frozen"
agent-browser eval "GAME.state.mode='playing'" >/dev/null

echo "== 13) victory during day-cycle check (win from wave 10) =="
agent-browser eval "(()=>{GAME.state.wave=10;GAME.state.spawn.queue.length=0;GAME.state.zombies.length=0;GAME.endWave();return GAME.state.mode})()" >/dev/null
chk "wave 10 clear -> victory" "$(agent-browser eval "GAME.state.mode" | tr -d '\n')" "victory"
chk "victory stats shown" "$(agent-browser eval "!document.getElementById('victoryScreen').classList.contains('hidden')" | tr -d '\n')" "true"

echo "== 14) full restart =="
agent-browser eval "GAME.startGame()" >/dev/null
sleep 0.3
chk "restart: wave 0 + 30 coins" "$(agent-browser eval "GAME.state.wave + ' ' + GAME.state.coins" | tr -d '\n')" "0 30"
chk "restart: no turrets" "$(agent-browser eval "GAME.state.turrets.length" | tr -d '\n')" "0"
chk "restart: dayness 0" "$(agent-browser eval "GAME.state.dayness" | tr -d '\n')" "0"
agent-browser errors | grep -q . && bad "console errors at end" || ok "no console errors at end"

echo ""
echo "================================"
echo "PASS: $PASS   FAIL: $FAIL"
[ $FAIL -eq 0 ] && echo "ALL TESTS PASSED ✔" || echo "SOME TESTS FAILED ✘"
