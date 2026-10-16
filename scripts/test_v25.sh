#!/bin/bash
# تست نسخه‌ی ۲۵٫۰ — فونت وزیرمتن + منو بدون سازنده + تأیید اندرویدی + مرحله X + استوری‌موشن درشت
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots25

echo "===== ۱) فونت فارسی وزیرمتن ====="
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 8
agent-browser screenshot /home/z/my-project/scripts/shots25/t01_menu.png >/dev/null 2>&1

R=$(agent-browser eval "document.querySelectorAll('style')[0].textContent.includes(\"font-family:'Vazirmatn'\")?1:0" | tail -1); ck "@font-face وزیرمتن تعبیه شده" "$R"
R=$(agent-browser eval "document.fonts.check('16px Vazirmatn')?1:0" | tail -1); ck "فونت وزیرمتن لود شده" "$R"
R=$(agent-browser eval "getComputedStyle(document.body).fontFamily.includes('Vazirmatn')?1:0" | tail -1); ck "فونت پایه body = وزیرمتن" "$R"
R=$(agent-browser eval "getComputedStyle(document.body).fontFamily.includes('Naskh')?0:1" | tail -1); ck "Noto Naskh Arabic حذف از پشته" "$R"
R=$(agent-browser eval "document.fonts.check('900 34px Vazirmatn')?1:0" | tail -1); ck "وزن ۹۰۰ (تیتر کات‌سین) موجود" "$R"

echo "===== ۲) منو: بدون اسم سازنده + نسخه ====="
R=$(agent-browser eval "!document.querySelector('#startScreen .m23-foot')?1:0" | tail -1); ck "منو: پلاک نسخه حذف شد (۲۷)" "$R"
R=$(agent-browser eval "!document.getElementById('startScreen').textContent.includes('مرامی')&&!document.getElementById('startScreen').textContent.includes('سازنده')?1:0" | tail -1); ck "منو: اسم سازنده حذف شد" "$R"
R=$(agent-browser eval "document.getElementById('aboutScreen')&&document.getElementById('aboutScreen').innerHTML.includes('سهند مرامی')?1:0" | tail -1); ck "درباره: اعتبار سازنده حفظ شد" "$R"
R=$(agent-browser eval "document.body.innerText.includes('آخـریـن')?0:1" | tail -1); ck "کشیده‌نویسی عربی (آخـریـن) حذف شد" "$R"

echo "===== ۳) جعبه تأیید اندرویدی (بازی جدید با سیو موجود) ====="
# سیو بساز
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2.5
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1
agent-browser eval "GAME.skipToWave(3);GAME.v10.saveGame();exitToMenu();'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "GAME.v10.loadSaveData()?1:0" | tail -1); ck "سیو موجود ساخته شد" "$R"
# دکمه بازی جدید → جعبه تأیید جدید
agent-browser eval "document.getElementById('btnStart').click();'ok'" >/dev/null; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots25/t02_confirm.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('confirmBox');return b&&!b.classList.contains('hidden')?1:0})()" | tail -1); ck "جعبه تأیید باز شد" "$R"
R=$(agent-browser eval "document.getElementById('confirmBox').querySelector('.cf-card')?1:0" | tail -1); ck "کارت متریال cf-card" "$R"
R=$(agent-browser eval "document.getElementById('cfTitle').textContent.includes('بازی جدید')?1:0" | tail -1); ck "عنوان: بازی جدید رو شروع کنم؟" "$R"
R=$(agent-browser eval "document.getElementById('confirmBox').classList.contains('danger')?1:0" | tail -1); ck "حالت خطر (دکمه قرمز)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('cfYes');const r=b.getBoundingClientRect();return r.height>=44?1:0})()" | tail -1); ck "دکمه تأیید درشت (>=44px)" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('cfYes').getBoundingClientRect().height)" | tail -1)"
R=$(agent-browser eval "document.getElementById('cfNo').textContent.startsWith('نه')?1:0" | tail -1); ck "دکمه انصراف متن‌دار اندرویدی" "$R" "got=$(agent-browser eval "document.getElementById('cfNo').textContent" | tail -1)"
agent-browser eval "document.getElementById('cfNo').click();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "document.getElementById('confirmBox').classList.contains('hidden')?1:0" | tail -1); ck "بستن جعبه با «نه»" "$R"

echo "===== ۴) نمایش «مرحله X» (بدون فصل/موج/کل) ====="
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2.5
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.6
R=$(agent-browser eval "GAME.startNight();'ok'" 2>/dev/null | tail -1); sleep 1.5
R=$(agent-browser eval "(()=>{const w=document.getElementById('waveText');return w&&/^مرحله ./.test(w.textContent.trim())?1:0})()" | tail -1); ck "HUD: فقط «مرحله X»" "$R" "got=$(agent-browser eval "document.getElementById('waveText').textContent" | tail -1)"
R=$(agent-browser eval "document.getElementById('waveText').textContent.includes('از ۳۶')?0:1" | tail -1); ck "بدون «از ۳۶»" "$R"
R=$(agent-browser eval "document.getElementById('waveText').textContent.includes('فصل')?0:1" | tail -1); ck "بدون «فصل»" "$R"
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 3.8
R=$(agent-browser eval "(()=>{const s=document.getElementById('announceSub');const b=document.getElementById('announceBig');return (b.textContent.includes('مرحله')&&b.textContent.includes('ثانیه'))||s.textContent.includes('ارتقا')?1:0})()" | tail -1); ck "اعلان وقفه: «مرحله X»" "$R" "big=$(agent-browser eval "document.getElementById('announceBig').textContent" | tail -1)"

echo "===== ۵) حذف دکمه تمام‌صفحه + صداهای فارسی ====="
R=$(agent-browser eval "document.getElementById('btnFull')?0:1" | tail -1); ck "دکمه تمام‌صفحه حذف شد" "$R"
R=$(agent-browser eval "typeof VOICES23==='object'?Object.keys(VOICES23).length:0" | tail -1); ck "VOICES23 با کلیپ‌های فارسی کافی (≥119)" "$([ "$R" -ge 119 ] 2>/dev/null && echo 1 || echo 0)" "n=$R"
R=$(agent-browser eval "VOICES23.i1n&&VOICES23.i1n.d>2&&VOICES23.i1n.a.length>1000?1:0" | tail -1); ck "کلیپ i1n سالم" "$R"

echo "===== ۶) گوشی کوچک ۷۸۰×۳۶۰ — استوری‌موشن درشت ====="
# اول به منو برگرد (در حالت start، refitWorld دنیا را با نسبت گوشی بازمی‌سازد)
agent-browser eval "exitToMenu();'ok'" >/dev/null; sleep 2.5
agent-browser set viewport 780 360 >/dev/null; sleep 1.8
agent-browser eval "(()=>{window.dispatchEvent(new Event('resize'));return 'ok'})()" >/dev/null; sleep 1
R=$(agent-browser eval "window.__uiz>=1.3?1:0" | tail -1); ck "مقیاس UI گوشی (__uiz>=1.3)" "$R" "uiz=$(agent-browser eval "window.__uiz" | tail -1)"
# گفتگو باز کن
agent-browser eval "DLG.start(STORY22.preWave1,null);'ok'" >/dev/null; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots25/t03_dlg_phone.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const t=document.getElementById('dlgText');const fs=parseFloat(getComputedStyle(t).fontSize);return fs>=20?1:0})()" | tail -1); ck "متن گفتگو درشت (>=20px منطقی)" "$R" "fs=$(agent-browser eval "Math.round(parseFloat(getComputedStyle(document.getElementById('dlgText')).fontSize)*10)/10" | tail -1)"
R=$(agent-browser eval "(()=>{const p=document.getElementById('dlgPortrait');const w=parseFloat(getComputedStyle(p).width);return w>=120?1:0})()" | tail -1); ck "پرتره گفتگو درشت (>=120px منطقی)" "$R" "w=$(agent-browser eval "Math.round(parseFloat(getComputedStyle(document.getElementById('dlgPortrait')).width))" | tail -1)"
R=$(agent-browser eval "(()=>{const s=document.getElementById('skipCs');s.classList.remove('hidden');const r=s.getBoundingClientRect();const h=r.height/(window.__fitScale||1);return h>=40?1:0})()" | tail -1); ck "دکمه رد کردن درشت (>=40px منطقی)" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('skipCs').getBoundingClientRect().height/(window.__fitScale||1))" | tail -1)"
agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 0.5
# قاب بازی پر شده؟ (بعد از refit در منو)
R=$(agent-browser eval "(()=>{const w=document.getElementById('wrap');const r=w.getBoundingClientRect();const covW=r.width/innerWidth,covH=r.height/innerHeight;return (covW>=0.95&&covH>=0.95)?1:0})()" | tail -1); ck "قاب بازی تمام‌صفحه گوشی (>=95%)" "$R" "cov=$(agent-browser eval "(()=>{const r=document.getElementById('wrap').getBoundingClientRect();return Math.round(r.width/innerWidth*100)+'x'+Math.round(r.height/innerHeight*100)})()" | tail -1)"

echo "===== ۷) صحت دیتای صوتی + کلیدهای گمشده ====="
R=$(agent-browser eval "(()=>{const miss=[];const scan=o=>{for(const k in o){const v=o[k];if(Array.isArray(v))scan(v);else if(v&&v.v&&!VOICES23[v.v])miss.push(v.v);}};scan(STORY22);scan(INTRO_DLGS);for(const ch in TR_DLGS)scan(TR_DLGS[ch]);for(const ch in TR_BARKS){const b=TR_BARKS[ch];if(b&&Array.isArray(b.outro))scan(b.outro);}return miss.length===0?1:0})()" | tail -1); ck "هیچ کلید صدای گمشده" "$R"

agent-browser close --all >/dev/null 2>&1
echo ""
echo "نتیجه: $P پاس / $F خطا"
[ $F -eq 0 ] && echo "همه تست‌ها سبز ✓" || echo "خطاها باید رفع شوند ✗"
exit $([ $F -eq 0 ] && echo 0 || echo 1)
