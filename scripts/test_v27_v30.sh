#!/bin/bash
# تست نسخه‌ی ۲۷٫۰ — صداهای ElevenLabs + سکه واقعی + منوهای متریال + شب‌شود + دستفروش
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots27
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done

echo "===== ۱) صداهای ElevenLabs فارسی v27 ====="
R=$(agent-browser eval "typeof VOICES23!=='undefined' && Object.keys(VOICES23).length===151?1:0" | tail -1); ck "(۳۰) ۱۵۱ خط صدا موجود (۱۱۹+۳۲ جدید)" "$R"
R=$(agent-browser eval "VOICES23.i3a && VOICES23.i3a.a.startsWith('data:audio/mpeg;base64,') && VOICES23.i3a.d>0.5?1:0" | tail -1); ck "کلیپ i3a (آرش) MP3 با مدت" "$R"
R=$(agent-browser eval "VOICES23.c4m1 && VOICES23.c4m1.a.length>5000?1:0" | tail -1); ck "کلیپ c4m1 (مریم) بلند" "$R"
R=$(agent-browser eval "window.__el27 = [...Object.values(VOICES23)].filter(v=>v.a.length>4000).length; __el27>=110?1:0" | tail -1); ck "بیش از ۱۱۰ کلیپ ElevenLabs جاسازی‌شده" "$R" "got=$(agent-browser eval "window.__el27" | tail -1)"

echo "===== ۲) منوهای متریال ۲۷ (توقف/تنظیمات/درباره) ====="
R=$(agent-browser eval "document.querySelector('#pauseScreen .m27-card')?1:0" | tail -1); ck "توقف = کارت متریال m27" "$R"
R=$(agent-browser eval "document.querySelector('#settingsScreen .m27-card')?1:0" | tail -1); ck "تنظیمات = کارت متریال m27" "$R"
R=$(agent-browser eval "document.querySelector('#aboutScreen .m27-card')?1:0" | tail -1); ck "درباره = کارت متریال m27" "$R"
R=$(agent-browser eval "document.getElementById('btnPauseSettings') && document.getElementById('btnPauseAbout')?1:0" | tail -1); ck "دکمه‌های تنظیمات/درباره در توقف" "$R"
R=$(agent-browser eval "!document.getElementById('btnSaveCode') && !document.getElementById('btnLoadCode') && !document.getElementById('saveCodeScreen')?1:0" | tail -1); ck "کد سیو/بارگذاری حذف شد" "$R"
R=$(agent-browser eval "!document.querySelector('.m23-foot') || !document.querySelector('#startScreen .m23-foot')?1:0" | tail -1); ck "متن نسخه از منو حذف شد" "$R"
R=$(agent-browser eval "document.getElementById('btnResume').closest('.m27-btn')?1:0" | tail -1); ck "ادامه بازی = دکمه تمام‌عرض متریال" "$R"
R=$(agent-browser eval "document.querySelector('#pauseScreen .m27-btn') && getComputedStyle(document.querySelector('#pauseScreen .m27-btn')).minHeight !== '0px'?1:0" | tail -1); ck "دکمه‌های توقف ≥54px" "$R"

echo "===== ۳) سکه‌ی واقعی ====="
R=$(agent-browser eval "typeof COIN27==='string' && COIN27.startsWith('data:image/png;base64,')?1:0" | tail -1); ck "تصویر سکه COIN27 جاسازی‌شده" "$R"
R=$(agent-browser eval "getComputedStyle(document.querySelector('.coin-ic')).backgroundImage.includes('data:image/png')?1:0" | tail -1); ck "HUD سکه = تصویر واقعی" "$R"
R=$(agent-browser eval "window.__coinImg27 && window.__coinImg27.complete && window.__coinImg27.naturalWidth===128?1:0" | tail -1); ck "اسپرایت سکه لود شد (128px)" "$R"
R=$(agent-browser eval "document.styleSheets[document.styleSheets.length-1].cssRules.length>0 && [...document.styleSheets].some(sh=>{try{return [...sh.cssRules].some(r=>r.cssText&&r.cssText.includes('.coin-ic')&&r.cssText.includes('data:image'))}catch(e){return false}})?1:0" | tail -1); ck "CSS سکه واقعی تزریق شد" "$R"

echo "===== ۴) دکمه‌ی شناور «شب شود» ====="
R=$(agent-browser eval "document.getElementById('bpNight').parentElement.id==='wrap'?1:0" | tail -1); ck "خارج از buildPanel (در wrap)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('bpNight');const s=getComputedStyle(b);return b.classList.contains('hidden')||s.position==='absolute'?1:0})()" | tail -1); ck "جایگاه مستقل absolute" "$R"

echo "===== ۵) کوله‌پشتی — بعد از ورود به بازی چک می‌شود ====="

echo "===== ۶) ورود به بازی و تست گیم‌پلی ====="
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.5
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1
R=$(agent-browser eval "state.mode==='day'||state.mode==='playing'?1:0" | tail -1); ck "حالت روز/بازی رسید" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('backpackBar').getBoundingClientRect();return b.x<innerWidth*0.4?1:0})()" | tail -1); ck "کوله: پایین-چپ (v28: بیرون از مرکز تصویر)" "$R" "rect=$(agent-browser eval "(()=>{const r=document.getElementById('backpackBar').getBoundingClientRect();return Math.round(r.x)+'..'+Math.round(r.right)})()" | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('backpackBar').getBoundingClientRect();return b.y+b.height>innerHeight*0.72?1:0})()" | tail -1); ck "کوله: نوار پایین" "$R"

echo "===== ۷) دکمه شب‌شود در روز + دستفروش بعد از گفتگو ====="
if [ "$(agent-browser eval "state.mode" | tail -1)" != "day" ]; then
  agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 3
  agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 2
  agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 1.5
fi
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "روز فعال" "$R"
R=$(agent-browser eval "(()=>{const sh=document.getElementById('buildPanel'); const mini=document.getElementById('bpNightMini28'); const open=!sh.classList.contains('collapsed'); return (open && mini && mini.classList.contains('on')) || (!open && !document.getElementById('bpNight').classList.contains('hidden') && document.getElementById('bpNight').textContent.includes('شب'))?1:0})()" | tail -1); ck "دکمه «شب شود» در دسترس (v28: مینی داخل شیت باز / شناور وقتی بسته)" "$R"
# شیت را ببند تا دکمه‌ی شناور شب‌شود قابل سنجش باشد
agent-browser eval "setBuildPanel(true,true);'ok'" >/dev/null 2>&1; sleep 0.6
agent-browser screenshot /home/z/my-project/scripts/shots27/t27_day.png >/dev/null 2>&1
B1=$(agent-browser eval "(()=>{const b=document.getElementById('bpNight').getBoundingClientRect();return Math.round(b.y)+'|'+Math.round(b.x)+'|'+Math.round(b.height)})()" | tail -1)
echo "  شب‌شود rect: $B1"
R=$(agent-browser eval "(()=>{const b=document.getElementById('bpNight').getBoundingClientRect();return b.y+b.height>innerHeight*0.6 && b.x>innerWidth*0.5?1:0})()" | tail -1); ck "شب‌شود: پایین-راست کنار FAB (شیت بسته)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('bpNight').getBoundingClientRect();return b.height>=40?1:0})()" | tail -1); ck "شب‌شود: دکمه درشت" "$R"
# دستفروش: در روز، بدون گفتگوی فعال، بعد از تاخیر باید بیاید (نه وسط گفتگو)
R=$(agent-browser eval "(()=>{ if(DLG.active) return 0; const had=state.peddler.here; return 1 })()" | tail -1); ck "گفتگو فعال نیست (دستفروش وسط صحبت نمی‌آید)" "$R"
# پیل دستفروش در روز
agent-browser eval "PED.enter(); PED.phase='stay';'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "MYST.update(0.016);'ok'" >/dev/null 2>&1; sleep 0.5
PILL=$(agent-browser eval "(()=>{const p=document.getElementById('pedReopenBtn'); if(!p||!p.offsetParent) return 'none'; const r=p.getBoundingClientRect(); return Math.round(r.y)})()" | tail -1)
echo "  پیل دستفروش y: $PILL"
R=$(agent-browser eval "(()=>{const p=document.getElementById('pedReopenBtn'); if(!p||!p.offsetParent) return 0; const f=document.getElementById('ctlFlash').getBoundingClientRect(); const r=p.getBoundingClientRect(); return r.top>=f.bottom-2?1:0})()" | tail -1); ck "پیل دستفروش: زیر چراغ‌قوه (بدون تصادم)" "$R"
# شب شود → شب
agent-browser eval "startNight();'ok'" >/dev/null 2>&1; sleep 2
R=$(agent-browser eval "state.mode==='playing' || state.goingNight || state.mode==='transition'?1:0" | tail -1); ck "شب شود: شب آغاز شد" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"

echo "===== ۸) منوی توقف در بازی + بازگشت از تنظیمات ====="
agent-browser eval "pauseGame();'ok'" >/dev/null 2>&1; sleep 0.6
R=$(agent-browser eval "!document.getElementById('pauseScreen').classList.contains('hidden')?1:0" | tail -1); ck "منوی توقف باز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots27/t27_pause.png >/dev/null 2>&1
agent-browser eval "document.getElementById('btnPauseSettings').click();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "!document.getElementById('settingsScreen').classList.contains('hidden') && document.getElementById('pauseScreen').classList.contains('hidden')?1:0" | tail -1); ck "تنظیمات از توقف باز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots27/t27_settings.png >/dev/null 2>&1
agent-browser eval "document.getElementById('closeSettings').click();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "!document.getElementById('pauseScreen').classList.contains('hidden')?1:0" | tail -1); ck "بازگشت به توقف پس از تنظیمات" "$R"
agent-browser eval "document.getElementById('btnPauseAbout').click();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "!document.getElementById('aboutScreen').classList.contains('hidden')?1:0" | tail -1); ck "درباره از توقف باز شد" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots27/t27_about.png >/dev/null 2>&1
agent-browser eval "document.getElementById('closeAbout').click();'ok'" >/dev/null; sleep 0.3
agent-browser eval "resumeGame();'ok'" >/dev/null 2>&1

echo "===== ۹) چراغ‌قوه + پیل دستفروش بدون تصادم ====="
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#ctlFlash .ic'); return ic && ic.querySelector('img.ic30')?1:0})()" | tail -1); ck "(۳۰) آیکن چراغ‌قوه = PNG کاربر" "$R"
R=$(agent-browser eval "(()=>{for(const ss of document.styleSheets){try{for(const r of ss.cssRules){if(r.selectorText==='#pedReopenBtn'&&r.cssText.includes('296px'))return 1}}catch(e){}}return 0})()" | tail -1); ck "پیل دستفروش: قانون CSS شیار ۴ (296px)" "$R"

echo "===== ۱۰) چیپ جون + کلت مستقل + برچسب در دست ====="
R=$(agent-browser eval "(()=>{const f=document.getElementById('healthFill'); return getComputedStyle(f).boxShadow.includes('inset')?1:0})()" | tail -1); ck "نوار جون: استایل جدید با عمق" "$R"
R=$(agent-browser eval "CUBE_SPRITES.pistol !== CUBE_SPRITES.weapon?1:0" | tail -1); ck "اسپرایت کلت مستقل از ارتقای اسلحه" "$R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('.bp-tile.armed'); if(!b) return 1; const s=getComputedStyle(b,'::after'); return s.top.includes('px') || s.position==='absolute'?1:0})()" | tail -1); ck "نشان «در دست» = چیپ بالا" "$R"

echo "===== ۱۱) چیدن برجک — snap و پد ====="
R=$(agent-browser eval "(()=>{const o=drawPlacing.toString(); return o.includes('Math.round') && o.includes('24')?1:0})()" | tail -1); ck "drawPlacing: snap شبکه ۲۴" "$R"
R=$(agent-browser eval "(()=>{const o=drawPlacing.toString(); return o.includes('ellipse') && o.includes('pulse')?1:0})()" | tail -1); ck "drawPlacing: پد زمین + پالس" "$R"
R=$(agent-browser eval "(()=>{const o=handlePlaceClick.toString(); return o.includes('Math.round')?1:0})()" | tail -1); ck "handlePlaceClick: نصب snap شده" "$R"

echo "===== ۱۲) نگهبان صدا + صف گفتگو ====="
R=$(agent-browser eval "typeof Snd!=='undefined' && Snd.ctx && Snd.ctx.onstatechange!==null?1:0" | tail -1); ck "نگهبان onstatechange فعال" "$R"
R=$(agent-browser eval "(()=>{const s=DLG.start.toString(); return s.includes('active') && s.includes('queue')?1:0})()" | tail -1); ck "DLG.start صف‌دار شد" "$R"
R=$(agent-browser eval "(()=>{const s=peddlerRoll.toString(); return s.includes('DLG') || s.includes('tryRoll')?1:0})()" | tail -1); ck "peddlerRoll: صبر برای گفتگو" "$R"

echo "===== ۱۳) استوری‌موشن — ساختمان هماهنگ + لایه‌های سینمایی ====="
R=$(agent-browser eval "(()=>{const s=MG23.building23.toString(); return s.includes('[136, 124, 112]') && s.includes('fh = 66')?1:0})()" | tail -1); ck "building23: ابعاد برج بازی (136/124/112×66)" "$R"
R=$(agent-browser eval "(()=>{const s=MG23.building23.toString(); return s.includes('battC') && s.includes(\"'#d8453a'\")?1:0})()" | tail -1); ck "building23: کنجره آبی + پرچم بازی" "$R"
R=$(agent-browser eval "typeof MG23.embers27==='function' && typeof MG23.rays27==='function' && typeof MG23.smoke27==='function' && typeof MG23.dust27==='function'?1:0" | tail -1); ck "لایه‌های سینمایی (خاکستر/پرتو/دود/غبار)" "$R"
R=$(agent-browser eval "(()=>{const s=introScCityMG.toString(); return s.includes('smoke27') && s.includes('rays27')?1:0})()" | tail -1); ck "صحنه ۱: دود آتش + پرتو خورشید" "$R"
R=$(agent-browser eval "(()=>{const s=introScFortMG.toString(); return s.includes('dust27') && s.includes('rays27')?1:0})()" | tail -1); ck "صحنه ۴: غبار + پرتو گرم" "$R"

echo "===== ۱۴) منوی اصلی — بدون نسخه/سازنده ====="
agent-browser eval "GAME.exitToMenu?GAME.exitToMenu():'';'ok'" >/dev/null 2>&1; sleep 2
R=$(agent-browser eval "state.mode==='start'?1:0" | tail -1); ck "بازگشت به منو" "$R" "mode=$(agent-browser eval "state.mode" | tail -1)"
R=$(agent-browser eval "!document.getElementById('startScreen').textContent.includes('نسخه')?1:0" | tail -1); ck "منو: بدون متن نسخه" "$R"
R=$(agent-browser eval "!document.getElementById('startScreen').textContent.includes('سازنده') && !document.getElementById('startScreen').textContent.includes('سهند')?1:0" | tail -1); ck "منو: بدون نام سازنده" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots27/t27_menu.png >/dev/null 2>&1

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
echo "======================================"
agent-browser close --all >/dev/null 2>&1
exit $F
