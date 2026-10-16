#!/bin/bash
# تست معماهای سرنخ در شیت جدید + زامبی‌های منو
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
sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots30/menu_zombies.png >/dev/null 2>&1
echo "===== معماهای سرنخ در شیت اندرویدی جدید ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(4); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "try{DLG.skip()}catch(e){}; state.mode='day'; 'ok'" >/dev/null; sleep 0.5
# معمای رادیو در موج ۴+
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null; sleep 0.6
R=$(ev "(()=>{const b=document.querySelector('[data-act=radio]');return b?'1':'no radio card'})()")
ck "کارت معمای رادیو موجود" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser eval "(()=>{const b=document.querySelector('[data-act=radio]');if(b)b.click();return 'ok'})()" >/dev/null; sleep 0.6
R=$(ev "(()=>{const sh=MYST._panel;if(!sh)return 'no sheet';const slider=sh.querySelector('#rdSlider');const is30=sh.classList.contains('shSheet30');return slider&&is30?'1':'sheet30='+is30+' slider='+(!!slider)})()")
ck "معمای رادیو داخل باتن‌شیت + اسلایدر" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/radio30.png >/dev/null 2>&1
# حل معما → سرنخ + سکه
agent-browser eval "(()=>{const s=document.querySelector('#rdSlider');s.value=1045;s.dispatchEvent(new Event('input'));document.querySelector('#rdLock').click();return MYST.done.radio?'solved':'not'})()" >/dev/null; sleep 0.5
R=$(ev "MYST.done.radio===true?'1':'not solved'")
ck "معمای رادیو حل شد" "$(echo "$R" | grep -c '^1$')" "$R"
R=$(ev "MYST.clues.length>=1?'1':'clues=0'")
ck "سرنخ آرشیو شد" "$(echo "$R" | grep -c '^1$')" "$R"
# آرشیو با سرنخ
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null; sleep 0.5
R=$(ev "(()=>{const c=document.querySelector('.m30clue');return c?'1':'no clue card'})()")
ck "کارت سرنخ در آرشیو" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/clue_card30.png >/dev/null 2>&1
# بستن با اسکریم
agent-browser eval "(()=>{document.getElementById('shScrim30').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return 'ok'})()" >/dev/null; sleep 0.6
R=$(ev "MYST._panel===null?'1':'still open'")
ck "لمس اسکریم = بستن شیت" "$(echo "$R" | grep -c '^1$')" "$R"
# کوله: مولوتوف کارت پرتاب شب
agent-browser eval "state.mode='playing'; state.backpack=[{id:'canned'},null,null,null,null,null]; MYST.molotovs=1; refreshBackpack(); 'ok'" >/dev/null; sleep 0.5
agent-browser eval "BPK30.show(); 'ok'" >/dev/null; sleep 0.6
R=$(ev "(()=>{const names=[...document.querySelectorAll('#bpkSheet30 .bpkName30')].map(x=>x.textContent).join('|');return (names.indexOf('مولوتوف')>=0&&names.indexOf('کنسرو')>=0)?'1':'items='+names})()")
ck "کوله: کارت مولوتوف + کنسرو" "$(echo "$R" | grep -c '^1$')" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/backpack_molo30.png >/dev/null 2>&1
agent-browser eval "BPK30.close(); 'ok'" >/dev/null
echo ""
echo "RESULT: $P OK / $F FAIL"
