#!/bin/bash
# سنجش ریز حالت روز — پیدا‌کردن مقصرِ اصلی فریم‌های ۳۰ms
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3

agent-browser eval "
window.__T={};                       /* تایمر توابع */
window.__prof=function(name,fn){return function(){const t=performance.now();try{return fn.apply(null,arguments);}finally{const d=performance.now()-t;__T[name]=(__T[name]||0)+d;}};};
/* UPDATE_HOOKS تک‌تک */
for(let i=0;i<UPDATE_HOOKS.length;i++){const f=UPDATE_HOOKS[i],n='hook'+i+'_'+(f.name||'?');UPDATE_HOOKS[i]=__prof(n,f);}
/* توابع مستقیم فریم */
if(typeof MUSIC!=='undefined')MUSIC.update=__prof('MUSIC.update',MUSIC.update);
if(typeof VOICE!=='undefined')VOICE.poll=__prof('VOICE.poll',VOICE.poll.bind(VOICE));
if(typeof DLG!=='undefined')DLG.update=__prof('DLG.update',DLG.update.bind(DLG));
window.update=__prof('update',window.update);
window.render=__prof('render',window.render);
/* setTimeout */
const _st=window.setTimeout;
window.setTimeout=function(fn,ms){if(typeof fn==='function'){const n='TO';return _st(__prof(n,fn),ms);}return _st(fn,ms);};
'installed'" >/dev/null

echo "== شروع بازی جدید و رسیدن به روز =="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();" >/dev/null
sleep 2
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 2
agent-browser eval "GAME.startNight()" >/dev/null
sleep 8
agent-browser eval "GAME.endWave()" >/dev/null
sleep 3
echo "mode: $(agent-browser eval 'state.mode' | tr -d '"')"

echo "== ۲۰ ثانیه در حالت روز =="
agent-browser eval "window.__T0=performance.now();window.__T={};window.__T={};__prof_reset=1;" >/dev/null
sleep 20

agent-browser eval "
(function(){const rows=Object.entries(__T).sort((a,b)=>b[1]-a[1]).slice(0,14);
const el=(performance.now()-__T0)/1000;
return 'elapsed='+el.toFixed(1)+'s | '+rows.map(r=>r[0]+'='+r[1].toFixed(1)+'ms').join(' | ');})()"
