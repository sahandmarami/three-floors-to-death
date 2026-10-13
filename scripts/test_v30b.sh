#!/bin/bash
# تست نسخه‌ی ۳۰٫۰ — اختصاص متقابل پنل‌ها + go-mode + کوله‌ی کشویی + دستفروش جادار + آیکون‌ها + متن داستان + صداهای تازه
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots30
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?'ok':'no'" 2>/dev/null | tail -1)
  [ "$R" != "no" ] && [ -n "$R" ] && break
  sleep 1
done
R=$(agent-browser eval "typeof GAME==='object'?1:0" | tail -1); ck "بوت سالم" "$R"
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null; sleep 0.8

echo "===== ۱) text-size-adjust — فونت سیستم متن‌ها را نمی‌پراند ====="
R=$(agent-browser eval "(()=>{const cs=getComputedStyle(document.documentElement); return (cs.webkitTextSizeAdjust||cs.textSizeAdjust||'').includes('100')?1:0})()" | tail -1); ck "text-size-adjust:100% روی ریشه" "$R" "$(agent-browser eval "getComputedStyle(document.documentElement).textSizeAdjust" | tail -1)"

echo "===== ۲) منو — آیکون‌های SVG + متن داستانی ====="
agent-browser eval "wipeSave(); 'ok'" >/dev/null 2>&1
agent-browser open "$URL" >/dev/null; sleep 3
for i in $(seq 1 15); do R=$(agent-browser eval "typeof state!=='undefined'&&state.mode==='start'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "var s=document.createElement('script'); s.src='/dbg30.js?r='+Date.now(); document.head.appendChild(s); 'inj'" >/dev/null; sleep 0.8
R=$(agent-browser eval "(()=>{const b=document.querySelector('#btnStart .m23-ico'); return b&&b.querySelector('svg')&&!b.textContent.trim()?1:0})()" | tail -1); ck "دکمه‌ی شروع داستان: SVG شمشیر (بدون گلیف)" "$R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('#btnContinue .m23-ico'); return b&&b.querySelector('svg')?1:0})()" | tail -1); ck "ادامه‌ی بازی: SVG پلی" "$R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('#btnSettings .m23-ico'); return b&&b.querySelector('svg')?1:0})()" | tail -1); ck "تنظیمات: SVG چرخ‌دنده" "$R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('#btnAbout .m23-ico'); return b&&b.querySelector('svg')?1:0})()" | tail -1); ck "درباره: SVG اطلاعات" "$R"
R=$(agent-browser eval "(()=>{const s=document.querySelector('.m23-sub'); return s&&!/۳۶|۴ فصل/.test(s.textContent)&&s.textContent.includes('شبی که تمام')?1:0})()" | tail -1); ck "زیرعنوان منو: داستانی (بدون تعداد مرحله)" "$R" "$(agent-browser eval "document.querySelector('.m23-sub')?.textContent.slice(0,40)" | tail -1)"
agent-browser eval "document.getElementById('btnAbout').click(); 'ok'" >/dev/null 2>&1; sleep 0.8
R=$(agent-browser eval "(()=>{const t=document.querySelector('#aboutScreen .m27-text'); return t&&t.textContent.includes('فریاد')&&t.textContent.includes('تا فردایی که')&&!t.textContent.includes('۳۶ شب')?1:0})()" | tail -1); ck "متن درباره: روایت رویدادها + «...» (بدون شمار مرحله)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/t_menu.png >/dev/null 2>&1
agent-browser screenshot /home/z/my-project/scripts/shots30/t_about.png >/dev/null 2>&1
agent-browser eval "document.getElementById('closeAbout').click(); 'ok'" >/dev/null 2>&1

echo "===== ۳) روز + اختصاص متقابل شیت ⟷ دستفروش ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "state.mode='playing'; GAME.endWave(); 'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "روز رسید" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
# شیت را باز کن
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null; sleep 0.6
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" | tail -1); ck "شیت باز شد" "$R"
# دستفروش بیا → شیت باید خودش بسته شود
agent-browser eval "state.coins=5000; try{peddlerRoll(true)}catch(e){}; 'ok'" >/dev/null 2>&1
for i in $(seq 1 10); do
  B=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" 2>/dev/null | tail -1)
  [ "$B" = "1" ] && break
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 1.5
done
agent-browser eval "try{renderPeddlerStock()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.6
R=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b&&!b.classList.contains('hidden')?1:0})()" | tail -1); ck "پنل دستفروش باز شد" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('buildPanel'); const cs=getComputedStyle(b); return b.classList.contains('collapsed')||cs.display==='none'?1:0})()" | tail -1); ck "داک/شیت خودکار بسته شد (اختصاص متقابل — ریشه‌ی «همش با هم افتاده»)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/t_peddler.png >/dev/null 2>&1
# شیت را دوباره باز کن → دستفروش باید بسته شود
agent-browser eval "try{toggleBuildPanel()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.7
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); return p&&!p.classList.contains('collapsed')?1:0})()" | tail -1); ck "شیت دوباره باز شد" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('peddlerBox'); return b.classList.contains('hidden')?1:0})()" | tail -1); ck "پنل دستفروش خودکار بسته شد" "$R"
R=$(agent-browser eval "document.getElementById('wrap').classList.contains('peddler-on')?0:1" | tail -1); ck "کلاس peddler-on پاک شد (داک برگشت)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/t_sheet.png >/dev/null 2>&1

echo "===== ۴) هر تب فقط آیتم‌های خودش ====="
for T in up wpn tur sur; do
  agent-browser eval "try{setBPTab('$T', true)}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 0.4
  R=$(agent-browser eval "(()=>{const vis=Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none'); const bad=vis.filter(t=>{const d=BUILD_DEFS.find(x=>'bp-'+x.kind===t.id); return d&&d.tab!=='$T'}); return vis.length>0&&bad.length===0?1:0})()" | tail -1)
  ck "تب $T: فقط آیتم‌های خودش (بدون آمیختن با تب دیگر/دستفروش)" "$R" "visible=$(agent-browser eval "Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>t.style.display!=='none').length" | tail -1)"
done

echo "===== ۵) کوله‌پشتی کشویی — دیگر نصف صفحه نمی‌گیرد ====="
agent-browser eval "try{setBuildPanel(true,true)}catch(e){}; try{hidePeddlerPanel()}catch(e){}; try{giveItem('medkit');giveItem('canned');giveItem('battery')}catch(e){}; refreshBackpack(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const b=document.getElementById('backpackBar'); const r=b.getBoundingClientRect(); return getComputedStyle(document.getElementById('bpkSlots')).display==='none' && r.height<=innerHeight*0.16?1:0})()" | tail -1); ck "کوله‌ی پر، بسته: فقط قرص کوچک (≤۱۶٪ ارتفاع)" "$R" "h=$(agent-browser eval "(()=>{const r=document.getElementById('backpackBar').getBoundingClientRect(); return Math.round(r.height)+'/'+innerHeight})()" | tail -1)"
agent-browser eval "document.getElementById('backpackBar').classList.add('open30'); 'ok'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "(()=>{const b=document.getElementById('backpackBar'); const r=b.getBoundingClientRect(); return getComputedStyle(document.getElementById('bpkSlots')).display==='flex' && r.height<=innerHeight*0.17 && r.width<=innerWidth*0.42?1:0})()" | tail -1); ck "کوله‌ی باز: ردیف باریک (≤۱۷٪ ارتفاع، ≤۴۲٪ عرض)" "$R" "w×h=$(agent-browser eval "(()=>{const r=document.getElementById('backpackBar').getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height)})()" | tail -1)"
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#bpkCap .ic30, #bpkCap .ic svg, #bpkCap img.ic30'); return ic?1:0})()" | tail -1); ck "آیکون کوله (PNG کاربر در کپسول)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/t_bpk.png >/dev/null 2>&1
agent-browser eval "document.getElementById('backpackBar').classList.remove('open30'); 'ok'" >/dev/null 2>&1

echo "===== ۶) آشکارساز هم‌پوشانی — هیچ دکمه‌ای روی دیگری نمی‌افتد ====="
agent-browser eval "window.__infl(1.22); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "window.__ovl(3)" 2>&1 | tail -1 | rg -q "CLEAN" && echo 1 || echo 0)
ck "روز + فونت متورم ×۱٫۲۲: بدون هیچ هم‌پوشانی" "$R" "$(agent-browser eval "window.__ovl(3)" 2>&1 | tail -1 | head -c 120)"
agent-browser eval "window.__infl(0); 'ok'" >/dev/null 2>&1

echo "===== ۷) صفحه‌ی باخت — go-mode بدون UI شناور ====="
agent-browser eval "try{startNight()}catch(e){}; 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "state.tower.hp=1; for(let i=0;i<5;i++) spawnZombie('tank'); 'ok'" >/dev/null 2>&1
for i in $(seq 1 30); do M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1); [ "$M" = "gameover" ] && break; sleep 1; done
sleep 5.6
M=$(agent-browser eval "state.mode" | tail -1 | tr -d '"')
R=$([ "$M" = "gameover" ] && echo 1 || echo 0); ck "صفحه‌ی باخت رسید" "$R" "mode=$M"
R=$(agent-browser eval "document.getElementById('wrap').classList.contains('go-mode')?1:0" | tail -1); ck "go-mode فعال شد" "$R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('backpackBar')).display==='none'?1:0" | tail -1); ck "نوار کوله در باخت مخفی (رفع هم‌پوشانی با دکمه‌ها)" "$R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('wpnChips28')).display==='none'?1:0" | tail -1); ck "چیپ‌های سلاح در باخت مخفی" "$R"
R=$(agent-browser eval "(()=>{const a=document.getElementById('btnRetryDay').getBoundingClientRect(); const b=document.getElementById('btnRestart1').getBoundingClientRect(); return a.bottom<=b.top+2?1:0})()" | tail -1); ck "دکمه‌های باخت جدا از هم" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots30/t_gameover.png >/dev/null 2>&1

echo "===== ۸) صداهای v30 (لحن جدی آرشان — grim/urgent) ====="
R=$(agent-browser eval "(()=>{const v=VOICES23; return v&&v.aw1&&Math.abs(v.aw1.d-2.83)<0.4?1:0})()" | tail -1); ck "aw1 بازضبط لحن جدی (۲٫۸۳s)" "$R" "d=$(agent-browser eval "(()=>{return VOICES23.aw1?VOICES23.aw1.d:'n/a'})()" | tail -1)"
R=$(agent-browser eval "(()=>{const v=VOICES23; return v&&v.aw4&&Math.abs(v.aw4.d-2.26)<0.4?1:0})()" | tail -1); ck "aw4 بازضبط با متن اصلاح‌شده (۲٫۲۶s — دیگر edge-tts نیست)" "$R" "d=$(agent-browser eval "(()=>{return VOICES23.aw4?VOICES23.aw4.d:'n/a'})()" | tail -1)"
R=$(agent-browser eval "(()=>{const v=VOICES23; return v&&Object.keys(v).length>=151?1:0})()" | tail -1); ck "کل ۱۵۱ خط صدا (۱۱۹ قدیمی + ۳۲ گفتگوی جدید)" "$R" "n=$(agent-browser eval "(()=>{return typeof VOICES23!=='undefined'?Object.keys(VOICES23).length:'n/a'})()" | tail -1)"

echo "===== ۹) رگرسیون — توقف دومنویی + چیپ‌های سلاح ====="
agent-browser eval "location.reload(); 'ok'" >/dev/null 2>&1; sleep 3
for i in $(seq 1 20); do R=$(agent-browser eval "typeof state!=='undefined'&&typeof GAME!=='undefined'?'ok':'no'" 2>/dev/null | tail -1); [ "$R" = "ok" ] && break; sleep 1; done
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
R=$(agent-browser eval "(()=>{const ps=document.getElementById('pauseScreen'); const vis=Array.from(ps.querySelectorAll('button')).filter(b=>b.getBoundingClientRect().width>0); const ids=vis.map(b=>b.id).filter(Boolean); const has=x=>ids.some(id=>id.includes(x)); return has('btnResume')&&has('btnSaveExit')&&ids.length<=3?1:0})()" | tail -1); ck "توقف: فقط ادامه + ذخیره و خروج" "$R" "ids=$(agent-browser eval "(()=>{Array.from(document.querySelectorAll('#pauseScreen button')).filter(b=>b.getBoundingClientRect().width>0).map(b=>b.id).join(',')})()" | tail -1)"
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4
R=$(agent-browser eval "(()=>{const b=document.getElementById('wchip28-pistol'); return b&&(b.querySelector('svg')||b.querySelector('img.ic30'))?1:0})()" | tail -1); ck "چیپ کلت: آیکون تمیز (PNG/SVG — رگرسیون v29)" "$R"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
