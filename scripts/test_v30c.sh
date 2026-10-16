#!/bin/bash
# تست جریان واقعی کاربر — کلیک‌های واقعی (نه API)
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }
ev() { agent-browser eval "$1" 2>/dev/null | tail -1 | sed 's/^"//;s/"$//'; }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(ev "typeof GAME!=='undefined'?state.mode:'no'")
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(4); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; MYST.update(0.02); 'ok'" >/dev/null; sleep 0.5

echo "===== کلیک واقعی روی دکمه‌ی سرنخ ====="
R=$(ev "(()=>{const b=document.getElementById('mystBtn');if(!b)return 'no btn';const disp=getComputedStyle(b).display;b.click();return disp!=='none'?'clicked':'hidden'})()")
sleep 0.7
R2=$(ev "MYST._panel&&MYST._panel.classList.contains('on')?'1':'not open'")
ck "کلیک آیکون سرنخ → شیت باز" "$(echo "$R2" | grep -c '^1$')" "$R / $R2"
agent-browser eval "MYST.closePanel(); 'ok'" >/dev/null; sleep 0.4

echo "===== کلیک واقعی روی آیکون کوله ====="
agent-browser eval "state.backpack=[{id:'medkit'},null,null,null,null,null]; refreshBackpack(); 'ok'" >/dev/null; sleep 0.4
R=$(ev "(()=>{const cap=document.getElementById('bpkCap');if(!cap)return 'no cap';cap.click();return 'clicked'})()")
sleep 0.7
R2=$(ev "document.getElementById('bpkSheet30')&&document.getElementById('bpkSheet30').classList.contains('on')?'1':'not open'")
ck "کلیک آیکون کوله → شیت باز" "$(echo "$R2" | grep -c '^1$')" "$R / $R2"
agent-browser eval "BPK30.close(); 'ok'" >/dev/null; sleep 0.3

echo "===== کلیک واقعی FAB ساخت‌وساز → شیت باز ====="
agent-browser eval "(()=>{const f=document.getElementById('bpFab28');if(f)f.click();return 'ok'})()" >/dev/null; sleep 0.6
R=$(ev "(()=>{const p=document.getElementById('buildPanel');const s=document.getElementById('bpScrim29');return (!p.classList.contains('collapsed')&&s.classList.contains('on'))?'1':'closed'})()")
ck "FAB → شیت ساخت‌وساز + اسکریم" "$(echo "$R" | grep -c '^1$')" "$R"

echo "===== خرید آیتم بقا از شیت (کیت) → کوله ====="
agent-browser eval "setBPTab('sur'); 'ok'" >/dev/null; sleep 0.4
agent-browser eval "state.coins=200; 'ok'" >/dev/null
agent-browser eval "(()=>{const t=document.getElementById('bp-medkit');if(t)t.click();return 'ok'})()" >/dev/null; sleep 0.5
R=$(ev "state.backpack.some(s=>s&&s.id==='medkit')?'1':'no medkit'")
ck "خرید کیت → داخل کوله" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "(()=>{try{setBuildPanel(true,true)}catch(e){}; return 'ok'})()" >/dev/null

echo "===== شب: کلیک واقعی مولوتوف از کوله ====="
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='playing'; GAME.startWave(4); MYST.molotovs=1; MYST.update(0.02); state.zombies.forEach(z=>{if(!z.dead){z.x=200;z.y=490}}); 'ok'" >/dev/null; sleep 1
agent-browser eval "BPK30.show(); 'ok'" >/dev/null; sleep 0.6
agent-browser eval "(()=>{const uses=[...document.querySelectorAll('#bpkSheet30 .bpkUse30')];const u=uses.find(b=>b.textContent.trim()==='پرتاب');if(!u)return 'no throw btn';u.click();return 'thrown'})()" >/dev/null; sleep 0.6
R=$(ev "MYST.molotovs===0?'1':'molo='+MYST.molotovs")
ck "دکمه‌ی «پرتاب» مولوتوف واقعا پرتاب می‌کند" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "MYST.throwFx?'1':'no fx'")
ck "جلوه‌ی انفجار مولوتوف فعال" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov_throw30.png >/dev/null 2>&1
agent-browser eval "BPK30.close(); 'ok'" >/dev/null

echo ""
echo "RESULT: $P OK / $F FAIL"
