// reproduce_molotov_bug.sh — بازتولید باگ خرید مولوتوف
B=http://localhost:3002/three-floors-to-survival.html

agent-browser open --width 780 --height 360 "$B" >/dev/null 2>&1
sleep 3
# شروع بازی
agent-browser eval "GAME.v10.startIntroCine(); GAME.skipIntro(); 'ok'" >/dev/null 2>&1
sleep 1.5
agent-browser eval "state.mode='day'; state.coins=500; 'ok'" >/dev/null 2>&1
sleep 0.5
# باز کردن پنل سرنخ
agent-browser eval "MYST.openArchive(); 'ok'" >/dev/null 2>&1
sleep 0.8
echo "=== panel HTML ==="
agent-browser eval "document.querySelector('.myst-panel') ? document.querySelector('.myst-panel').outerHTML.slice(0, 3000) : 'NO PANEL'" 2>/dev/null | tail -1
echo ""
echo "=== خرید مولوتوف (کلیک روی دکمه) ==="
agent-browser eval "(()=>{const b=document.querySelector('[data-act=molo]'); if(!b) return 'no molo btn'; b.click(); return 'clicked'})()" 2>/dev/null | tail -1
sleep 1
echo "=== بعد از خرید — عناصر متنی روی صفحه (غیر از پنل) ==="
agent-browser eval "(()=>{const out=[]; document.querySelectorAll('#wrap *').forEach(e=>{const t=(e.textContent||'').trim(); if(t && t.length>1 && !e.querySelector('*') && e.offsetParent && !e.closest('.myst-panel') && !e.closest('#buildSheet') && !e.closest('.dlgbox') && !e.closest('#announce')){out.push(e.id||e.className+' :: '+t.slice(0,60))}}); return out.join(' | ').slice(0,1500)})()" 2>/dev/null | tail -1
echo ""
agent-browser screenshot /home/z/my-project/scripts/shots30/molotov_bug.png >/dev/null 2>&1 || (mkdir -p /home/z/my-project/scripts/shots30 && agent-browser screenshot /home/z/my-project/scripts/shots30/molotov_bug.png >/dev/null 2>&1)
echo done
