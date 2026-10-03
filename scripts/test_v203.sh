#!/bin/bash
# ============================================================
# تست نسخه‌ی ۲۰٫۳ — منوی بازطراحی‌شده + اصلاح ادبی اینترو
# ============================================================
cd /home/z/my-project
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
mkdir -p scripts/shots203
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
}

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3

echo "===== ۱) ساختار فایل ====="
G=download/three-floors-to-survival.html
gq(){ grep -q "$1" $G && echo 1 || echo 0; }
ngq(){ grep -qE "$1" $G && echo 0 || echo 1; }
R=$(gq "menu-tagline"); ck "تگ‌لاین منو در فایل (CSS+HTML)" "$R"
R=$(gq "شهر ساکت است... و شب‌ها تازه شروع شده‌اند"); ck "متن تگ‌لاین" "$R"
R=$(gq "menu-divider"); ck "جداکننده‌ی طلایی" "$R"
R=$(gq "btnShine"); ck "انیمیشن برقِ دکمه (btnShine)" "$R"
R=$(gq "btnGlow"); ck "نبض نور دکمه (btnGlow)" "$R"
R=$(gq "menuHeroIn"); ck "انیمیشن ورود منو" "$R"
R=$(gq "بی‌خبر و بی‌صدا، اومد وسطِ مون"); ck "i1n1 اصلاح شد" "$R"
R=$(gq "کلِ این شهر مالِ خودمون شده"); ck "i3a1 اصلاح شد" "$R"
R=$(gq "شاید فقط خودمون موندیم"); ck "i4p1 اصلاح شد" "$R"
R=$(gq "هر چی که دم دستشون بود"); ck "i6n1 اصلاح شد" "$R"
R=$(gq "باید بهش برسیم"); ck "i10a1 اصلاح شد" "$R"
R=$(gq "زنده بیرون بیام"); ck "i11p1 اصلاح شد" "$R"
R=$(ngq "ممکنه فقط خودمون باشیم|برسیم بهش|زنده بیرون بیایم"); ck "متن‌های معیوب قدیمی حذف شدند" "$R"

echo "===== ۲) منوی جدید در مرورگر ====="
R=$(agent-browser eval "document.querySelector('.menu-tagline')&&document.querySelector('.menu-tagline').textContent.indexOf('شهر ساکت')>=0?1:0" | tail -1); ck "تگ‌لاین زیر عنوان رندر شد" "$R"
R=$(agent-browser eval "document.querySelector('.menu-divider')?1:0" | tail -1); ck "جداکننده‌ی طلایی رندر شد" "$R"
R=$(agent-browser eval "getComputedStyle(document.getElementById('btnStart')).fontSize==='18px'?1:0" | tail -1); ck "دکمه‌ی اصلی بزرگ‌تر (۱۸px)" "$R"
R=$(agent-browser eval "(()=>{const a=getComputedStyle(document.getElementById('btnStart'),'::after');return a&&a.animationName&&a.animationName.indexOf('btnShine')>=0?1:0})()" | tail -1); ck "برقِ متحرک روی دکمه‌ی اصلی فعال" "$R"
R=$(agent-browser eval "(()=>{const a=getComputedStyle(document.getElementById('btnStart')).animationName;return a&&a.indexOf('btnGlow')>=0?1:0})()" | tail -1); ck "نبض نور دکمه فعال" "$R"
R=$(agent-browser eval "(()=>{const t=getComputedStyle(document.getElementById('menuHero')).animationName;return t&&t.indexOf('menuHeroIn')>=0?1:0})()" | tail -1); ck "انیمیشن ورود منو" "$R"
R=$(agent-browser eval "document.getElementById('btnStart')&&document.getElementById('btnContinue')&&document.getElementById('btnSettings')&&document.getElementById('btnAbout')?1:0" | tail -1); ck "هر ۴ دکمه/شناسه سالم (سازگاری)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots203/01_menu.png >/dev/null

echo "===== ۳) دیالوگ‌های اصلاح‌شده در اینترو ====="
fresh
R=$(agent-browser eval "INTRO_DLGS[0][0].text.indexOf('بی‌خبر و بی‌صدا')>=0?1:0" | tail -1); ck "i1n1 متن جدید در INTRO_DLGS" "$R"
R=$(agent-browser eval "INTRO_DLGS[1][0].text.indexOf('کلِ این شهر مالِ خودمون شده')>=0?1:0" | tail -1); ck "i3a1 متن جدید" "$R"
R=$(agent-browser eval "INTRO_DLGS[1][1].text.indexOf('شاید فقط خودمون موندیم')>=0?1:0" | tail -1); ck "i4p1 متن جدید" "$R"
R=$(agent-browser eval "INTRO_DLGS[2][1].text.indexOf('هر چی که دم دستشون')>=0?1:0" | tail -1); ck "i6n1 متن جدید" "$R"
R=$(agent-browser eval "INTRO_DLGS[4][1].text.indexOf('باید بهش برسیم')>=0?1:0" | tail -1); ck "i10a1 متن جدید" "$R"
R=$(agent-browser eval "INTRO_DLGS[4][2].text.indexOf('زنده بیرون بیام')>=0?1:0" | tail -1); ck "i11p1 متن جدید" "$R"

echo "===== ۴) صداهای بازتولیدشده ====="
R=$(agent-browser eval "(()=>{const v=VOICES17['i1n1'];return v&&v.d>6&&v.d<8&&v.a.length>30000?1:0})()" | tail -1); ck "i1n1 صدا+مدت تازه (۶٫۸۹s)" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES17['i3a1'];return v&&v.d>4&&v.d<5.5?1:0})()" | tail -1); ck "i3a1 صدا+مدت تازه (۴٫۷۳s)" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES17['i4p1'];return v&&v.d>6&&v.d<7.5?1:0})()" | tail -1); ck "i4p1 صدا+مدت تازه (۶٫۵s)" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES17['i10a1'];return v&&v.d>5&&v.d<6?1:0})()" | tail -1); ck "i10a1 صدا+مدت تازه (۵٫۲۸s)" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES17['i2n1'];return v&&v.d>0?1:0})()" | tail -1); ck "صداهای دست‌نخورده سالم (i2n1)" "$R"

echo "===== ۵) رگرسیون: جریان اصلی ====="
fresh
R=$(agent-browser eval "['playing','day','intermission'].includes(state.mode)?1:0" | tail -1); ck "شروع بازی سالم" "$R"
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='playing'&&state.zombies.length>0?1:0" | tail -1); ck "موج ۱: زامبی‌ها می‌آیند" "$R"
R=$(agent-browser eval "document.getElementById('aboutScreen').textContent.indexOf('ساخته شده توسط')>=0?1:0" | tail -1); ck "درباره: خط سازنده ماند" "$R"
R=$(agent-browser eval "(()=>{let errs=0;window.addEventListener('error',e=>errs=1);return 1})()" | tail -1); ck "شنود خطا نصب شد" "$R"
sleep 2
R=$(agent-browser eval "WAVES_CH.join()==='6,8,10,12'&&FINAL_WAVE===36?1:0" | tail -1); ck "ساختار ۳۶ شب دست‌نخورده" "$R"

echo ""
echo "نتیجه: $P پاس / $F خطا"
[ "$F" = "0" ] && echo "PASS ✔" || echo "FAIL ✘"
