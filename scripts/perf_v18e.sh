#!/bin/bash
# تست کارایی: حالت روز با جعبه گفتگوی فعالِ در حال تایپ (قبلاً ۴۲fps)
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3

agent-browser eval "
window.__P={samples:[]};
(function(){const r=requestAnimationFrame;let last=0;
 function probe(t){r(probe);if(last){__P.samples.push(t-last);}last=t;}
 r(probe);})();
window.__fps=function(n){const s=__P.samples.slice(-n);if(!s.length)return 'no';
 s.sort((a,b)=>a-b);const k=s.length;
 return 'avg='+(1000/(s.reduce((a,b)=>a+b,0)/k)).toFixed(0)+' p95='+(1000/s[Math.floor(k*0.95)]).toFixed(0)+' min='+(1000/s[k-1]).toFixed(0);};
'done'" >/dev/null

agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro()" >/dev/null; sleep 1

echo "== افتتاحیه: دیالوگ‌های زنده (۱۲ خط با تایپ فعال) =="
agent-browser eval "GAME.v10.startNewGame()" >/dev/null; sleep 2
sleep 12
echo "افتتاحیه (تایپ فعال): $(agent-browser eval '__fps(720)')"

echo "== شب موج ۱ (۲۰ث) =="
agent-browser eval "GAME.v10.skipIntro()" >/dev/null; sleep 1
agent-browser eval "GAME.startNight()" >/dev/null; sleep 20
echo "شب: $(agent-browser eval '__fps(1200)')"

echo "== روز با DLG فعال (تایپ) =="
agent-browser eval "GAME.endWave()" >/dev/null; sleep 1
agent-browser eval "GAME.v11.DLG.start(GAME.v11.INTRO_DLGS[0])" >/dev/null
sleep 10
echo "روز+DLG تایپ: $(agent-browser eval '__fps(600)')"
echo "خطاها: $(agent-browser errors | grep -c error || echo 0)"
agent-browser close --all >/dev/null 2>&1
