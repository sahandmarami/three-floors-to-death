#!/bin/bash
# سنجش کارایی مینی‌گیم رانندگی در فاز ۲
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
if(typeof renderDrive!=='undefined')window.renderDrive=__prof('renderDrive',window.renderDrive);
if(typeof drawDriveCar!=='undefined')window.drawDriveCar=__prof('drawDriveCar',window.drawDriveCar);
if(typeof drawTowerArshan!=='undefined')window.drawTowerArshan=__prof('arshan',window.drawTowerArshan);
'done'" >/dev/null

echo "== رسیدن به فاز ۲ رانندگی =="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();" >/dev/null
sleep 2; agent-browser eval "GAME.v10.skipIntro()" >/dev/null; sleep 1
agent-browser eval "GAME.state.tower.hp = 900; GAME.v10.startTransition(1)" >/dev/null
sleep 2
agent-browser eval "GAME.v10.trGoto(8.0); GAME.v10.trResume()" >/dev/null
sleep 1
echo "phase=$(agent-browser eval 'TR.phase' | tr -d '"')"
agent-browser eval "__P.samples.length=0" >/dev/null
echo "-- ۱۰ث بدون ورودی --"; sleep 10
echo "رانندگی(خودکار): $(agent-browser eval '__fps(600)')"
echo "-- ۱۰ث با گاز و فرمان --"
agent-browser eval "window.__k=new KeyboardEvent('keydown',{key:'ArrowUp',code:'ArrowUp'});window.dispatchEvent(__k);window.__k2=new KeyboardEvent('keydown',{key:'ArrowRight',code:'ArrowRight'});window.dispatchEvent(__k2);" >/dev/null
sleep 10
echo "رانندگی(گاز): $(agent-browser eval '__fps(600)')"
agent-browser eval "window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowUp'}));window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight'}));" >/dev/null
agent-browser eval "(function(){return Object.entries(__T).map(r=>r[0]+'='+r[1].toFixed(0)+'ms').join(' | ');})()"

echo "== شب دفاعی با ارشان (فصل ۲ — تاریکی) =="
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 2
echo "mode=$(agent-browser eval 'state.mode' | tr -d '"')"
agent-browser eval "GAME.startNight()" >/dev/null
agent-browser eval "__P.samples.length=0;__T={}" >/dev/null
sleep 10
echo "شب+ارشان+تاریکی: $(agent-browser eval '__fps(600)')"
agent-browser eval "(function(){return Object.entries(__T).map(r=>r[0]+'='+r[1].toFixed(0)+'ms').join(' | ');})()"
echo "Dark.level=$(agent-browser eval 'GAME.v10.Dark.level' | tr -d '"')"
agent-browser close --all >/dev/null 2>&1
