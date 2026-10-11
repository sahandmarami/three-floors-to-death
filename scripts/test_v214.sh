#!/bin/bash
# تست نسخه‌ی ۲۱٫۴ — W واکنش‌گرا + منوی بازطراحی + HUD بدون له‌شدگی
URL="http://localhost:3000/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL $1"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots214

echo "===== ۱) W واکنش‌گرا: بازسازی در منو بعد از جاافتادن صفحه ====="
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 10
R=$(agent-browser eval "W" | tail -1); ck "W = ۱۲۱۳ در ۷۸۰×۳۶۰ (گرفته: $R)" "$([ "$R" = "1213" ] && echo 1 || echo 0)"
R=$(agent-browser eval "TOWER.x===W/2?1:0" | tail -1); ck "برج وسط دنیا بعد از refit" "$R"
R=$(agent-browser eval "HILLS1[HILLS1.length-1].x >= W-70?1:0" | tail -1); ck "تپه‌ها تا لبه (بازسازی‌شده)" "$R"
R=$(agent-browser eval "canvas.width===Math.round(W*(window.devicePixelRatio||1))?1:0" | tail -1); ck "بوم = W×DPR بعد از refit" "$R"

echo "===== ۲) refitWorld: شبیه‌سازی W غلطِ لحظه‌ی بارگذاری ====="
R=$(agent-browser eval "W=960; fitWrap(); (W===1213 && TOWER.x===W/2)?1:0" | tail -1); ck "W غلط ۹۶۰ → refitWorld به ۱۲۱۳ برگرداند" "$R"
R=$(agent-browser eval "Math.round(document.getElementById('wrap').getBoundingClientRect().width)" | tail -1); ck "قاب = کل عرض صفحه (گرفته: $R) ±۲px" "$([ "$(echo $R | cut -d. -f1)" -ge 778 ] && [ "$(echo $R | cut -d. -f1)" -le 782 ] && echo 1 || echo 0)"

echo "===== ۳) در گیم‌پلی refit نمی‌شود (ایمنی) ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null; sleep 2
W_BEFORE=$(agent-browser eval "W" | tail -1)
agent-browser eval "fitWrap()" >/dev/null; sleep 0.5
W_AFTER=$(agent-browser eval "W" | tail -1)
ck "وسط بازی W تغییر نمی‌کند ($W_BEFORE → $W_AFTER)" "$([ "$W_BEFORE" = "$W_AFTER" ] && echo 1 || echo 0)"

echo "===== ۴) HUD: چیپ‌ها flex:none — متن له نمی‌شود (حین گیم‌پلی) ====="
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "getComputedStyle(document.querySelector('.hud-item')).flexGrow==='0' && getComputedStyle(document.querySelector('.hud-item')).flexShrink==='0'?1:0" | tail -1); ck "چیپ HUD غرق در انقباض نیست (flex:none)" "$R"
R=$(agent-browser eval "Math.round(document.getElementById('healthText').getBoundingClientRect().width/(window.__fitScale||1))>=38?1:0" | tail -1); ck "متن جون کامل جا دارد (حین بازی)" "$R"
R=$(agent-browser eval "Math.round(document.getElementById('waveText').getBoundingClientRect().width/(window.__fitScale||1))>=60?1:0" | tail -1); ck "متن موج کامل جا دارد (حین بازی)" "$R"

echo "===== ۵) منوی ۲۱٫۴: هم‌عرضی دکمه‌ها + بدون انیمیشن‌های قدیمی ====="
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnStart').getBoundingClientRect(); const c=document.getElementById('btnContinue').getBoundingClientRect(); return Math.abs(b.width-c.width)<6?1:0})()" | tail -1); ck "دکمه‌ی اصلی و ادامه هم‌عرض‌اند" "$R"
R=$(agent-browser eval "getComputedStyle(document.querySelector('.game-title')).animation.includes('none')||getComputedStyle(document.querySelector('.game-title')).animation===''?1:0" | tail -1); ck "تیتر بدون نبض/پالس" "$R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('btnStart')).animation.includes('none')?1:0" | tail -1); ck "دکمه‌ی اصلی بدون btnGlow/btnShine" "$R"
R=$(agent-browser eval "(()=>{const m=document.querySelector('.menu-mini'); return parseInt(getComputedStyle(m).columnGap||getComputedStyle(m).gap)>=12?1:0})()" | tail -1); ck "فاصله‌ی دکمه‌های کوچک ≥۱۲px" "$R"

echo "===== ۶) «رد کردن» با فضای تنفس ====="
R=$(agent-browser eval "parseInt(getComputedStyle(document.getElementById('skipCs')).bottom)>=16?1:0" | tail -1); ck "skipCs bottom ≥16px" "$R"

echo "===== ۷) نسخه ====="
R=$(agent-browser eval "document.querySelector('.menu-ver').textContent.includes('۲۱٫۴')?1:0" | tail -1); ck "نسخه‌ی ۲۱٫۴ در منو" "$R"

echo "===== ۸) صحنه‌ی گیم‌پلی سالم بعد از refit ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "GAME.state.zombies.length>0?1:0" | tail -1); ck "زامبی‌ها زاده شدند" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots214/gameplay.png >/dev/null 2>&1

echo "===== ۹) صفر خطای کنسول ====="
ERRS=$(agent-browser console 2>/dev/null | grep -ci "error" || true)
ck "صفر خطای کنسول در کل تست" "$([ "$ERRS" = "0" ] && echo 1 || echo 0)"

echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
if [ "$F" = "0" ]; then echo "همه‌ی تست‌های ۲۱٫۴ گذرنده ✔"; else echo "خطا! رد شد ✘"; fi
agent-browser close --all >/dev/null 2>&1
