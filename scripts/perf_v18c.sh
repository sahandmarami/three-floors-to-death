#!/bin/bash
# تأیید مقصرها: ۱) backdrop-filter جعبه گفتگو ۲) رانندگی ۳) shadowBlur ارشان
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3

agent-browser eval "
window.__P={samples:[]};
(function(){const r=requestAnimationFrame;let last=0;
 function probe(t){r(probe);if(last){__P.samples.push(t-last);}last=t;}
 r(probe);})();
window.__fps=function(n){const s=__P.samples.slice(-n);if(!s.length)return 'no';
 s.sort((a,b)=>a-b);const k=s.length;
 return 'avg='+(1000/(s.reduce((a,b)=>a+b,0)/k)).toFixed(0)+' p95='+(1000/s[Math.floor(k*0.95)]).toFixed(0)+' min='+(1000/s[k-1]).toFixed(0);};
window.__T={};window.__prof=function(name,fn){return function(){const t=performance.now();try{return fn.apply(null,arguments);}finally{__T[name]=(__T[name]||0)+performance.now()-t;}};};
if(typeof drawTowerArshan!=='undefined')window.drawTowerArshan=__prof('arshan',window.drawTowerArshan);
'done'" >/dev/null

echo "== A) حالت روز با جعبه گفتگوی باز (۸ث) =="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();" >/dev/null
sleep 2; agent-browser eval "GAME.v10.skipIntro()" >/dev/null; sleep 2
agent-browser eval "GAME.startNight()" >/dev/null; sleep 7
agent-browser eval "GAME.endWave()" >/dev/null; sleep 4
echo "mode=$(agent-browser eval 'state.mode' | tr -d '"') DLG.active=$(agent-browser eval 'DLG.active' | tr -d '"') dlgVisible=$(agent-browser eval '!document.getElementById(\"dlgBox\").classList.contains(\"hidden\")' | tr -d '"')"
sleep 8
echo "با گفتگو: $(agent-browser eval '__fps(480)')"

echo "== B) همان حالت ولی بدون backdrop-filter (تزریق CSS) (۸ث) =="
agent-browser eval "
const st=document.createElement('style');st.textContent='#dlgTextWrap{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}';
document.head.appendChild(st);__P.samples.length=0;'css-patched'" >/dev/null
sleep 8
echo "بدون backdrop-filter: $(agent-browser eval '__fps(480)')"

echo "== C) همان حالت با رد کردن گفتگو (کلیک ادامه) (۸ث) =="
agent-browser eval "
document.getElementById('wrap').removeChild(document.getElementById('wrap').querySelector('style'));
DLG.hide();__P.samples.length=0;'dlg-hidden'" >/dev/null
sleep 8
echo "بدون جعبه گفتگو: $(agent-browser eval '__fps(480)')"

echo "== D) مینی‌گیم رانندگی — ۱۰ ثانیه (۸ث سنجش) =="
agent-browser eval "GAME.v10.startChapter(2)" >/dev/null
sleep 3
echo "TR.phase=$(agent-browser eval 'GAME.v10.TR && GAME.v10.TR.phase' | tr -d '"')"
sleep 8
echo "رانندگی: $(agent-browser eval '__fps(480)')"

echo "== E) شب با ارشان — ۸ث =="
agent-browser eval "GAME.v10.skipTransition && GAME.v10.skipTransition()" >/dev/null
sleep 3
echo "mode=$(agent-browser eval 'state.mode' | tr -d '"')"
agent-browser eval "__P.samples.length=0" >/dev/null
sleep 8
echo "شب+ارشان: $(agent-browser eval '__fps(480)')"
agent-browser eval "
(function(){const r=Object.entries(__T).map(x=>x[0]+'='+x[1].toFixed(0)+'ms');return r.join(' | ');})()"
agent-browser close --all >/dev/null 2>&1
