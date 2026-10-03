#!/bin/bash
# ============================================================
# تست نسخه‌ی ۲۰٫۲ — «درباره» ادبی + پایان معلق
# ============================================================
cd /home/z/my-project
mkdir -p scripts/shots202
G=download/three-floors-to-survival.html
P=0; F=0
ck(){ if [ "$2" = "1" ]; then P=$((P+1)); echo "  ✓ $1"; else F=$((F+1)); echo "  ✗ $1"; fi }

echo "— ساختار —"
[ -s "$G" ] && ck "فایل بازی ساخته شد ($(du -h $G|cut -f1))" 1 || ck "فایل بازی" 0
R=$(grep -c "سکوت، از حاشیه‌ی شهر به راه افتاد" $G); ck "سطر ادبی ۱ (سکوت/حاشیه‌ی شهر)" "$R"
R=$(grep -c "اما قصه‌ی واقعی، از همین‌جا آغاز می‌شود" $G); ck "پایان معلق «اما قصه‌ی واقعی، از همین‌جا آغاز می‌شود...»" "$R"
R=$(grep -c "شروع شد که بی‌خبر" $G); [ "$R" = "0" ] && ck "متن محاوره‌ای قدیمی حذف شد" 1 || ck "متن قدیمی" 0
R=$(grep -c "ساخته شده توسط <b>سهند مرامی</b>" $G); ck "خط سازنده (سهند مرامی) در انتها" "$R"
R=$(grep -c "howtoScreen\|btnHowto" $G); [ "$R" = "0" ] && ck "راهنما همچنان کاملاً حذف" 1 || ck "راهنما" 0

echo "— رفتار در مرورگر —"
agent-browser open "file://$(realpath $G)" >/dev/null; sleep 2
R=$(agent-browser eval "(()=>{const e=0;window.onerror=m=>{e=1};return 1})()" | tail -1)
agent-browser eval "skipIntro&&skipIntro()" >/dev/null; sleep 1
R=$(agent-browser eval "document.getElementById('menuSmall')?document.getElementById('menuSmall').textContent.indexOf('راهنما')<0?1:0:1" | tail -1); ck "منو بدون «راهنما»" "$R"
agent-browser eval "showScreen('aboutScreen')" >/dev/null; sleep 1
R=$(agent-browser eval "!document.getElementById('aboutScreen').classList.contains('hidden')?1:0" | tail -1); ck "درباره باز شد" "$R"
R=$(agent-browser eval "document.getElementById('aboutScreen').textContent.indexOf('ساخته شده توسط')>=0&&document.getElementById('aboutScreen').textContent.indexOf('سهند مرامی')>=0?1:0" | tail -1); ck "پایانِ صفحه: «ساخته شده توسط سهند مرامی»" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('aboutScreen').textContent;return t.indexOf('سکوت')>=0&&t.indexOf('ارشان')>=0&&t.indexOf('رادیو')>=0&&t.indexOf('پناهگاه')>=0&&t.indexOf('آغاز می‌شود...')>=0?1:0})()" | tail -1); ck "روایت ادبی: سکوت + ارشان + رادیو + پناهگاه + «آغاز می‌شود...»" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('aboutScreen').textContent;return t.indexOf('HTML5')<0&&t.indexOf('فصل،')<0&&t.indexOf('فرار سینمایی')<0?1:0})()" | tail -1); ck "بدون متن فنی/گیم‌پلی" "$R"
R=$(agent-browser eval "document.querySelectorAll('#aboutScreen .howto > div:not(.about-credit)').length===6?1:0" | tail -1); ck "۶ سطر روایی (خلاصه)" "$R"
R=$(agent-browser eval "(()=>{const els=document.querySelectorAll('#aboutScreen .howto > div:not(.about-credit)');const last=els[els.length-1];return last.textContent.indexOf('آغاز می‌شود...')>=0?1:0})()" | tail -1); ck "آخرین سطرِ داستان = پایان معلق" "$R"
R=$(agent-browser eval "(()=>{const els=document.querySelectorAll('#aboutScreen .howto > div:not(.about-credit)');let bad=0;els.forEach(e=>{if(e.textContent.length>170)bad=1});return bad?0:1})()" | tail -1); ck "سطرها کوتاه و خلاصه (≤۱۷۰ نویسه)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots202/01_about.png >/dev/null
agent-browser eval "closeAbout&&closeAbout()" >/dev/null; sleep 1
R=$(agent-browser eval "document.getElementById('aboutScreen').classList.contains('hidden')?1:0" | tail -1); ck "«برگرد» درباره را می‌بندد" "$R"
R=$(agent-browser eval "startGame&&startGame();return 1" | tail -1) >/dev/null; sleep 1
R=$(agent-browser eval "typeof wave==='number'?1:0" | tail -1); ck "بازی سالم شروع شد (موج ۱)" "$R"

echo ""
echo "نتیجه: $P پاس / $F خطا"
[ "$F" = "0" ] && echo "PASS ✔" || echo "FAIL ✘"
