#!/bin/bash
# سنجش کارایی نسخه‌ی ۱۷ — FPS و هزینه‌ی update/render در حالت‌های مختلف
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3

# نصب سنجش FPS + wrapper برای update/render
agent-browser eval "
window.__P={samples:[],uc:0,ut:0,rc:0,rt:0,gc:0};
(function(){const r=requestAnimationFrame;let last=0;
 function probe(t){r(probe);if(last){__P.samples.push(t-last);}last=t;}
 r(probe);})();
const _u=window.update,_r=window.render;
window.update=function(a){const t=performance.now();try{_u(a);}finally{__P.ut+=performance.now()-t;__P.uc++;}};
window.render=function(){const t=performance.now();try{_r();}finally{__P.rt+=performance.now()-t;__P.rc++;}};
'installed'" >/dev/null

report() {
  agent-browser eval "
  (function(){const s=__P.samples.slice(-$1);if(!s.length)return 'no-samples';
  s.sort((a,b)=>a-b);const n=s.length;
  const avg=1000/(s.reduce((a,b)=>a+b,0)/n);
  const p95=1000/s[Math.floor(n*0.95)];
  const min=1000/s[n-1];
  const mem=(performance.memory)?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'n/a';
  const upd=__P.uc?(__P.ut/__P.uc).toFixed(2):'0';
  const rnd=__P.rc?(__P.rt/__P.rc).toFixed(2):'0';
  const zombies=(typeof state!=='undefined')?state.zombies.filter(z=>!z.dead).length:0;
  return 'fps_avg='+avg.toFixed(0)+' p95='+p95.toFixed(0)+' min='+min.toFixed(0)+' update_ms='+upd+' render_ms='+rnd+' zombies='+zombies+' heap='+mem;})()"
}

echo "== ۱) منو (۵ث) =="
sleep 5; report 300

echo "== ۲) بازی جدید + پرش به روز (skip intro) =="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 2
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 2
echo "mode: $(agent-browser eval 'state.mode' | tr -d '"')"
sleep 3; report 300

echo "== ۳) شب — موج ۲ با برجک‌ها (۱۵ث) =="
agent-browser eval "GAME.giveCoins(600);GAME.placeTurret('gun',260,0);GAME.placeTurret('gun',700,0);GAME.placeTurret('laser',930,0);'turrets'" >/dev/null
agent-browser eval "GAME.startNight()" >/dev/null
sleep 15; report 900

echo "== ۴) استرس: ۴۵ زامبی + رگبار (۱۰ث) =="
agent-browser eval "for(let i=0;i<45;i++)GAME.spawnType(['walker','runner','brute','tank'][i%4]);'spawned'" >/dev/null
agent-browser eval "GAME.selectWeapon('auto')" >/dev/null
agent-browser eval "window.__hold=setInterval(()=>{GAME.hurtBoss(0);},100)" >/dev/null
sleep 10
agent-browser eval "clearInterval(window.__hold)" >/dev/null
report 600

echo "== ۵) صبح — حالت روز (۵ث) =="
agent-browser eval "GAME.endWave()" >/dev/null
sleep 5; report 300

echo "== ۶) مینی‌گیم رانندگی (۱۰ث) =="
agent-browser eval "GAME.v10.startChapter(2)" >/dev/null
sleep 2
agent-browser eval "GAME.v10.TR.phase" | tr -d '"'
sleep 10; report 600

echo "== خطاهای کنسول =="
agent-browser errors | head -10
agent-browser close --all >/dev/null 2>&1
