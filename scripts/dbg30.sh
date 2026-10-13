#!/bin/bash
# dbg30.sh — تشخیص v30: هم‌پوشانی دکمه‌ها در همه‌ی حالت‌ها + شبیه‌سازی textZoom گوشی واقعی
URL="http://localhost:3002/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots30
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1)
  [ "$R" = "ok" ] && break; sleep 1
done
echo "boot: $R"

# تعریف آشکارساز هم‌پوشانی + متورم‌کننده‌ی فونت روی صفحه
agent-browser eval "
window.__ovl = function(tol) {
  tol = tol || 3;
  const sel = '#wrap button, #wrap .wchip28, #wrap .bp-tile, #wrap .pd-item, #wrap .bpk-slot, #wrap .ctl-btn, #wrap .hud-item, #wrap .bp-tab, #wrap #pedReopenBtn, #wrap #bpNight, #wrap #bpFab28, #wrap #bpNightMini28, #wrap .m27-btn, #wrap .m27-primary, #wrap .btn-main, #wrap .btn-sec, #wrap .bpk-cap, #wrap .ctl-lbl';
  const els = Array.from(document.querySelectorAll(sel));
  const vis = els.filter(el => {
    const r = el.getBoundingClientRect();
    if (r.width < 6 || r.height < 6) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none' && !el.id) return false;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false;
    return true;
  });
  const out = [];
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const A = vis[i], B = vis[j];
    if (A.contains(B) || B.contains(A)) continue;
    const a = A.getBoundingClientRect(), b = B.getBoundingClientRect();
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > tol && oy > tol) out.push((A.id || ('.' + (A.className||'').toString().split(' ')[0])) + '×' + (B.id || ('.' + (B.className||'').toString().split(' ')[0])) + '[' + Math.round(ox) + 'x' + Math.round(oy) + ']');
  }
  return out.length ? out.length + ':: ' + out.slice(0, 12).join(' | ') : 'CLEAN';
};
window.__infl = function(k) {
  if (k === 0) { (window.__sv || []).forEach(p => p[0].style.fontSize = p[1]); window.__sv = null; return 'restored'; }
  window.__sv = [];
  document.querySelectorAll('#wrap *').forEach(el => {
    window.__sv.push([el, el.style.fontSize]);
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs > 0 && fs < 44) el.style.fontSize = (fs * k).toFixed(2) + 'px';
  });
  return 'inflated';
};
window.__uizv = function(){ return getComputedStyle(document.getElementById('wrap')).getPropertyValue('--uiz') + ' fit=' + (window.__fitScale||'?') + ' W=' + (typeof W!=='undefined'?W:'?') + ' H=' + (typeof H!=='undefined'?H:'?'); };
'__defs__'" >/dev/null 2>&1
echo "uiz: $(agent-browser eval "window.__uizv()" | tail -1)"

snap() { agent-browser screenshot /home/z/my-project/scripts/shots30/$1 >/dev/null 2>&1; }
ovl() { agent-browser eval "window.__ovl($2)" 2>/dev/null | tail -1; }

echo ""
echo "===== A) منوی اصلی ====="
agent-browser eval "wipeSave(); location.hash=''; 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 20); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.4
echo "menu  (inflated): $(ovl menu 3)"
snap menu.png

echo ""
echo "===== B) روز + شیت ساخت‌وساز (هر تب) ====="
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
echo "mode: $(agent-browser eval "state.mode" | tail -1)"
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null; sleep 0.7
for T in up wpn tur sur; do
  agent-browser eval "try{setBPTab('$T', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
  echo "sheet tab=$T (normal):   $(ovl t 3)"
done
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "sheet tab=sur (inflated): $(ovl t 3)"
snap sheet_sur.png
agent-browser eval "try{setBPTab('tur', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
echo "sheet tab=tur (inflated): $(ovl t 3)"
snap sheet_tur.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== C) دستفروش + شیت همزمان؟ ====="
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 3
echo "peddler here: $(agent-browser eval "state.peddler.here?1:0" | tail -1)"
echo "peddlerBox visible: $(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b && !b.classList.contains('hidden')?1:0})()" | tail -1)"
echo "buildPanel open:    $(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p && !p.classList.contains('collapsed')?1:0})()" | tail -1)"
echo "BOTH open at once:  $(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); const p=document.getElementById('buildPanel'); return b && !b.classList.contains('hidden') && p && !p.classList.contains('collapsed')?1:0})()" | tail -1)"
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
snap peddler_sheet_both.png
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "peddler (inflated):  $(ovl t 3)"
snap peddler_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
# فقط پنل دستفروش (شیت بسته)
agent-browser eval "try{setBuildPanel(true, true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.5
echo "peddler only (normal):   $(ovl t 3)"
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "peddler only (inflated): $(ovl t 3)"
snap peddler_only_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
agent-browser eval "try{hidePeddlerPanel()}catch(e){}; 'ok'" >/dev/null 2>&1

echo ""
echo "===== D) کوله‌پشتی پر ====="
agent-browser eval "try{giveItem('medkit');giveItem('canned');giveItem('battery');giveItem('airstrike');giveItem('freezeBomb');giveItem('adrenaline')}catch(e){}; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "(()=>{const b=document.getElementById('backpackBar'); if(!b) return 'n/a'; const r=b.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height)+' px | ' + Math.round(100*r.width/innerWidth) + '%W ' + Math.round(100*r.height/innerHeight) + '%H'})()" | tail -1
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "backpack (inflated): $(ovl t 3)"
agent-browser eval "(()=>{const b=document.getElementById('backpackBar'); if(!b) return 'n/a'; const r=b.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height)+' px | ' + Math.round(100*r.width/innerWidth) + '%W ' + Math.round(100*r.height/innerHeight) + '%H'})()" | tail -1
snap backpack_full_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== E) شب — گیم‌پلی + چیپ‌ها + دکمه‌های چپ ====="
agent-browser eval "try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.coins=600; attemptBuy('shotgun'); selectWeapon('shotgun'); updateHUD(); 'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
echo "night (inflated): $(ovl t 3)"
snap night_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo ""
echo "===== F) توقف + باخت + درباره ====="
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.4
echo "pause (inflated): $(ovl t 3)"
snap pause_infl.png
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4

echo ""
echo "done — shots in scripts/shots30/"
