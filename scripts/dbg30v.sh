#!/bin/bash
URL="http://localhost:3002/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1)
  [ "$R" = "ok" ] && break; sleep 1
done
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null; sleep 0.8
inj() { agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null 2>&1; sleep 0.6; }
ovl() { T=$(agent-browser eval "typeof window.__ovl" 2>&1 | tail -1); if [ "$T" != '"function"' ]; then inj; fi; agent-browser eval "window.__ovl(3)" 2>&1 | tail -1; }
geo() { T=$(agent-browser eval "typeof window.__geo" 2>&1 | tail -1); if [ "$T" != '"function"' ]; then inj; fi; agent-browser eval "window.__geo('$1')" 2>&1 | tail -1; }
infl() { agent-browser eval "window.__infl($1)" 2>&1 | tail -1; }
snap() { agent-browser screenshot /home/z/my-project/scripts/shots30/$1 >/dev/null 2>&1; }
echo "== V1) منو: آیکون‌های SVG دکمه‌ها =="
agent-browser eval "wipeSave(); 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 15); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null; sleep 0.8
echo "btnStart svg: $(agent-browser eval "(()=>{const b=document.querySelector('#btnStart .m23-ico'); return b&&b.querySelector('svg')?1:0})()" 2>&1 | tail -1) (بدون گلیف ⚔: $(agent-browser eval "(()=>{const b=document.querySelector('#btnStart .m23-ico'); return b&&b.textContent.trim()===''?1:0})()" 2>&1 | tail -1))"
echo "btnContinue svg: $(agent-browser eval "(()=>{const b=document.querySelector('#btnContinue .m23-ico'); return b&&b.querySelector('svg')?1:0})()" 2>&1 | tail -1)"
echo "btnSettings svg: $(agent-browser eval "(()=>{const b=document.querySelector('#btnSettings .m23-ico'); return b&&b.querySelector('svg')?1:0})()" 2>&1 | tail -1)"
echo "btnAbout svg: $(agent-browser eval "(()=>{const b=document.querySelector('#btnAbout .m23-ico'); return b&&b.querySelector('svg')?1:0})()" 2>&1 | tail -1)"
infl 1.22; sleep 0.5
echo "menu infl ovl: $(ovl)"; snap v1_menu.png; infl 0
# متن درباره
agent-browser eval "document.getElementById('btnAbout').click(); 'ok'" >/dev/null 2>&1; sleep 0.8
echo "about text new: $(agent-browser eval "(()=>{const t=document.querySelector('#aboutScreen .m27-text'); return t&&t.textContent.includes('فریاد')&&t.textContent.includes('تا فردایی که')&&!t.textContent.includes('۳۶')?1:0})()" 2>&1 | tail -1)"
snap v1_about.png
agent-browser eval "document.getElementById('closeAbout').click(); 'ok'" >/dev/null 2>&1

echo ""
echo "== V2) روز + شیت + دستفروش — اختصاص متقابل =="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
echo "پنل دستفروش باز: $B | شیتِ همزمان: $(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" 2>&1 | tail -1) (باید 0 باشد)"
infl 1.22; sleep 0.5
echo "peddler infl: $(ovl)"; snap v2_peddler.png; infl 0
echo "geo peddlerPanel: $(geo peddlerPanel)"
# حالا شیت را باز کن → دستفروش باید بسته شود
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.7
echo "شیت باز: $(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" 2>&1 | tail -1) | پنل دستفروشِ همزمان: $(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>&1 | tail -1) (باید 0 باشد)"
infl 1.22; sleep 0.5
echo "sheet infl: $(ovl)"; snap v2_sheet.png; infl 0
# تب‌ها: هر تب فقط آیتم‌های خودش
for T in up wpn tur sur; do
  agent-browser eval "try{setBPTab('$T', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
  V=$(agent-browser eval "(()=>{const vis=Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none'); const others=vis.filter(t=>{const d=BUILD_DEFS.find(x=>'bp-'+x.kind===t.id); return d&&d.tab!=='$T'}); return vis.length>0&&others.length===0?1:0})()" 2>&1 | tail -1)
  echo "تب $T فقط آیتم‌های خودش: $V (visible=$(agent-browser eval "Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none').length" 2>&1 | tail -1))"
done
agent-browser eval "try{setBuildPanel(true,true)}catch(e){}; try{hidePeddlerPanel()}catch(e){}; 'ok'" >/dev/null 2>&1

echo ""
echo "== V3) کوله‌پشتی کشویی =="
agent-browser eval "try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike')}catch(e){}; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "geo bpk بسته: $(geo backpackBar) | slots display: $(agent-browser eval "getComputedStyle(document.getElementById('bpkSlots')).display" 2>&1 | tail -1)"
agent-browser eval "document.getElementById('backpackBar').classList.add('open30'); 'ok'" >/dev/null 2>&1; sleep 0.4
echo "geo bpk باز:  $(geo backpackBar) | slots display: $(agent-browser eval "getComputedStyle(document.getElementById('bpkSlots')).display" 2>&1 | tail -1)"
infl 1.22; sleep 0.5
echo "bpk باز infl ovl: $(ovl)"; snap v3_bpk_open.png; infl 0
echo "geo pedReopenBtn: $(geo pedReopenBtn)"
agent-browser eval "document.getElementById('backpackBar').classList.remove('open30'); 'ok'" >/dev/null 2>&1

echo ""
echo "== V4) صفحه‌ی باخت — go-mode =="
agent-browser eval "try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "state.tower.hp=1; for(let i=0;i<5;i++) spawnZombie('tank'); 'ok'" >/dev/null 2>&1
for i in $(seq 1 30); do M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1); [ "$M" = "gameover" ] && break; sleep 1; done
sleep 5.6
M=$(agent-browser eval "state.mode" 2>&1 | tail -1)
echo "mode: $M | go-mode class: $(agent-browser eval "document.getElementById('wrap').classList.contains('go-mode')?1:0" 2>&1 | tail -1) | bpk display: $(agent-browser eval "getComputedStyle(document.getElementById('backpackBar')).display" 2>&1 | tail -1)"
infl 1.22; sleep 0.4
echo "gameover infl: $(ovl)"; snap v4_gameover.png; infl 0
echo "geo backpackBar: $(geo backpackBar) | geo btnRetryDay: $(geo btnRetryDay)"
echo "done"
