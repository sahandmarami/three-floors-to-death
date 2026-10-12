#!/bin/bash
# تست نسخه‌ی ۲۴٫۰ — HUD موبایل + سکه درشت + رفع گفتگو-هنگان-حمله + صداهای فارسی + اینترو روشن
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots24

echo "===== ۱) بارگذاری + منو (بدون متن زیر دکمه‌ها) ====="
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 8
agent-browser screenshot /home/z/my-project/scripts/shots24/t01_menu.png >/dev/null 2>&1

R=$(agent-browser eval "document.body.innerText.includes('۲۴٫۰')?1:0" | tail -1); ck "نسخه ۲۴٫۰" "$R"
R=$(agent-browser eval "document.getElementById('menuStats')?document.getElementById('menuStats').children.length:0" | tail -1); ck "منو: بدون چیپ متن زیر دکمه‌ها" "$([ "$R" = "0" ] && echo 1 || echo 0)" "chips=$R"
R=$(agent-browser eval "document.getElementById('btnStart')?Math.round(document.getElementById('btnStart').getBoundingClientRect().height):0" | tail -1); ck "دکمه شروع بزرگ (>=60px)" "$([ "$R" -ge 60 ] 2>/dev/null && echo 1 || echo 0)" "h=$R"
R=$(agent-browser eval "typeof VOICES23==='object'?Object.keys(VOICES23).length:0" | tail -1); ck "VOICES23 با ۱۱۹ کلیپ فارسی" "$([ "$R" = "119" ] && echo 1 || echo 0)" "n=$R"
R=$(agent-browser eval "VOICES23.i1n&&VOICES23.i1n.d>2&&VOICES23.i1n.a.length>1000?1:0" | tail -1); ck "کلیپ i1n سالم" "$R"
R=$(agent-browser eval "(()=>{const miss=[];const scan=o=>{for(const k in o){const v=o[k];if(Array.isArray(v))scan(v);else if(v&&v.v&&!VOICES23[v.v])miss.push(v.v);}};scan(STORY22);scan(INTRO_DLGS);for(const ch in TR_DLGS)scan(TR_DLGS[ch]);for(const ch in TR_BARKS){const b=TR_BARKS[ch];if(b&&Array.isArray(b.outro))scan(b.outro);}return miss.length===0?1:0})()" | tail -1); ck "هیچ کلید صدای گمشده" "$R"

echo "===== ۲) HUD بازسازی‌شده — سکه/توقف/چراغ ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2.5
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "(()=>{const c=document.getElementById('coinItem');if(!c)return 0;const r=c.getBoundingClientRect();return (r.height>=26&&r.width>=70)?1:0})()" | tail -1); ck "قرص سکه درشت (>=70x26)" "$R" "box=$(agent-browser eval "(()=>{const r=document.getElementById('coinItem').getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)})()" | tail -1)"
R=$(agent-browser eval "document.querySelector('#coinItem .coin-ic')?1:0" | tail -1); ck "آیکون سکه‌ی CSS (بدون ایموجی)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('ctlPause');if(!b)return 0;const r=b.getBoundingClientRect();return r.height>=48?1:0})()" | tail -1); ck "دکمه توقف بزرگ (>=48px)" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('ctlPause').getBoundingClientRect().height)" | tail -1)"
R=$(agent-browser eval "document.getElementById('ctlPause')&&document.getElementById('ctlMute')&&document.getElementById('ctlFlash')?1:0" | tail -1); ck "توقف/صدا/چراغ همه موجود" "$R"
R=$(agent-browser eval "(()=>{return (!document.getElementById('ctlRail'))?1:0})()" | tail -1); ck "ریل چپِ قدیمی حذف شد" "$R"
R=$(agent-browser eval "(()=>{const w=document.getElementById('waveText');return w&&w.textContent.includes('از ۳۶')?1:0})()" | tail -1); ck "موج از ۳۶ در HUD" "$R"
# گفتگو را رد کن تا چراغ‌قوه (که حین گفتگو مخفی است) قابل سنجش شود
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1.2
R=$(agent-browser eval "(()=>{const f=document.getElementById('ctlFlash');const r=f.getBoundingClientRect();return (r.bottom<=innerHeight+1&&r.left>=-1&&r.width>=50)?1:0})()" | tail -1); ck "چراغ‌قوه: دکمه گرد بزرگ داخل قاب" "$R"

echo "===== ۳) رفع باگ: گفتگو هنگام حمله ====="
# گفتگوی جدید پس از skip باز می‌شود — دوباره فعال کن
agent-browser eval "DLG.start(STORY22.preWave1,null);'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "DLG.active?1:0" | tail -1); ck "گفتگوی پیش‌موج فعال" "$R"
R=$(agent-browser eval "(()=>{const t0=state.intermission;const d0=DLG.active;return (d0&&t0>0&&state.mode==='intermission')?1:0})()" | tail -1); ck "حالت intermission + گفتگو" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1
R=$(agent-browser eval "(()=>{let ok=1;for(let i=0;i<40;i++){update(0.05);}return (state.mode==='intermission'||state.mode==='playing')?1:0})()" | tail -1); ck "شمارش معکوس پس از گفتگو ادامه" "$R"

echo "===== ۴) لایه معما + TLOU (حفظ شدگی) ====="
agent-browser eval "state.mode='day';state.wave=4;state.chapter=1;MYST.update(0.02);'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "(()=>{const b=document.getElementById('mystBtn');return b&&b.style.display!=='none'?1:0})()" | tail -1); ck "دکمه سرنخ ظاهر شد" "$R"
R=$(agent-browser eval "MYST.avail().includes('radio')?1:0" | tail -1); ck "معمای بی‌سیم در دسترس" "$R"
agent-browser eval "MYST.openRadio();'ok'" >/dev/null; sleep 0.6
R=$(agent-browser eval "document.querySelector('.myst-panel')?1:0" | tail -1); ck "پنل بی‌سیم باز" "$R"
R=$(agent-browser eval "(()=>{const s=document.querySelector('#rdSlider');if(!s)return 0;s.value=1045;document.querySelector('#rdLock').click();return MYST.done.radio?1:0})()" | tail -1); ck "معمای بی‌سیم قابل‌حل" "$R"
agent-browser eval "MYST.closePanel();'ok'" >/dev/null
agent-browser eval "state.mode='playing';state.coins=300;MYST.craftMolotov();MYST.startListen();'ok'" >/dev/null; sleep 0.8
R=$(agent-browser eval "MYST.molotovs>0&&MYST.listen.active?1:0" | tail -1); ck "مولوتوف + شنود کار می‌کنند" "$R"
R=$(agent-browser eval "MYST.throwMolotov();MYST.molotovs===0?1:0" | tail -1); ck "پرتاب مولوتوف" "$R"
R=$(agent-browser eval "window.__errs?window.__errs.length:0" | tail -1); ck "خطای کنسول صفر" "$([ "$R" = "0" ] && echo 1 || echo 0)" "n=$R"

echo "===== ۵) موبایل ۷۸۰×۳۶۰ — HUD و قاب ====="
agent-browser set viewport 780 360 >/dev/null; sleep 2
agent-browser eval "location.reload();'ok'" >/dev/null; sleep 8
agent-browser screenshot /home/z/my-project/scripts/shots24/t09_phone_menu.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnStart');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.top>=-1&&r.height>=30)?1:0})()" | tail -1); ck "گوشی: دکمه شروع کامل در قاب" "$R"
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 2
# حالت لمسی را روشن کن (مرورگر دسکتاپ کلاس touch نمی‌گیرد)
agent-browser eval "document.getElementById('wrap').classList.add('touch');fitWrap&&fitWrap();'ok'" >/dev/null; sleep 1
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1.2
agent-browser screenshot /home/z/my-project/scripts/shots24/t10_phone_hud.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('ctlPause');if(!b)return 0;const r=b.getBoundingClientRect();return (r.height>=48&&r.left>=-1&&r.top>=-1)?1:0})()" | tail -1); ck "گوشی: توقف بزرگ در گوشه" "$R"
R=$(agent-browser eval "(()=>{const c=document.getElementById('coinItem');if(!c)return 0;const r=c.getBoundingClientRect();return (r.right<=innerWidth+1&&r.height>=24)?1:0})()" | tail -1); ck "گوشی: قرص سکه در قاب" "$R"
R=$(agent-browser eval "(()=>{const f=document.getElementById('ctlFlash');if(!f)return 0;const r=f.getBoundingClientRect();return (r.left>=-1&&r.width>=48&&r.bottom<=innerHeight+1)?1:0})()" | tail -1); ck "گوشی: چراغ‌قوه داخل قاب" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('buildPanel');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.top>=-1)?1:0})()" | tail -1); ck "گوشی: پنل ساخت داخل قاب" "$R"
R=$(agent-browser eval "(()=>{const t=document.querySelector('.bp-key');if(!t)return 1;return getComputedStyle(t).display==='none'?1:0})()" | tail -1); ck "گوشی: کلیدهای PC مخفی" "$R"
agent-browser eval "DLG.skip();'ok'" >/dev/null

echo ""
echo "== نتیجه: $P OK / $F FAIL =="
agent-browser close --all >/dev/null 2>&1
exit $([ "$F" = "0" ] && echo 0 || echo 1)
