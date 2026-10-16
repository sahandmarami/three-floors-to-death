#!/bin/bash
# inspect_sheet — دیدن شیت ساخت‌وساز در حالت موبایل
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 30); do
  R=$(agent-browser eval "typeof GAME!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ -n "$R" ] && [ "$R" != "no" ]; then break; fi
  sleep 1
done
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "state.coins=2000; WEAPONS.shotgun.owned=true; WEAPONS.mg.owned=false; 'ok'" >/dev/null
# باز کردن شیت ساخت‌وساز
agent-browser eval "try{openBuild29()}catch(e){try{toggleBuildPanel()}catch(e2){document.getElementById('buildPanel').classList.remove('collapsed')}}; 'ok'" >/dev/null; sleep 0.6
# تب سلاح‌ها
agent-browser eval "setBPTab('wpn'); 'ok'" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots30/sheet_wpn.png >/dev/null 2>&1
echo "=== wpn tab DOM (tiles) ==="
agent-browser eval "(()=>{const out=[];document.querySelectorAll('#bpList .bp-tile').forEach(t=>{if(t.style.display!=='none'){const txt=(t.textContent||'').trim();out.push(t.id+' ['+t.getBoundingClientRect().width.toFixed(0)+'x'+t.getBoundingClientRect().height.toFixed(0)+'] text="'+txt+'"')}});return out.join('\\n')})()" | tail -5
# تب بقا (medkit)
agent-browser eval "setBPTab('sur'); 'ok'" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots30/sheet_sur.png >/dev/null 2>&1
echo "=== sur tab tiles ==="
agent-browser eval "(()=>{const out=[];document.querySelectorAll('#bpList .bp-tile').forEach(t=>{if(t.style.display!=='none'){out.push(t.id+' ['+t.getBoundingClientRect().width.toFixed(0)+'x'+t.getBoundingClientRect().height.toFixed(0)+']')}});return out.join(' | ')})()" | tail -1
echo "=== overflow check: متن از کاشی بیرون می‌زند؟ ==="
agent-browser eval "(()=>{const t=document.getElementById('bp-medkit'); if(!t) return 'no tile'; const r=t.getBoundingClientRect(); const cs=getComputedStyle(t); return 'tile '+r.width.toFixed(0)+'x'+r.height.toFixed(0)+' | fontSize(price)='+getComputedStyle(t.querySelector('.bp-price')).fontSize+' | display='+cs.display})()" | tail -1
done_marker=1
