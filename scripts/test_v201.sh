#!/bin/bash
# تست نسخه‌ی ۲۰٫۱ — حذف راهنما + درباره‌ی فقط‌داستان + نام سازنده
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.6
}

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 3
mkdir -p /home/z/my-project/scripts/shots201

echo "===== ۱) حذف کامل راهنما ====="
R=$(agent-browser eval "(!document.getElementById('btnHowto')&&!document.getElementById('howtoScreen')&&!document.getElementById('closeHowto'))?1:0" | tail -1); ck "دکمه/صفحه/دکمه‌ی برگشت راهنما وجود ندارند" "$R"
R=$(agent-browser eval "document.body.textContent.indexOf('راهنمای بازی')<0?1:0" | tail -1); ck "متن «راهنمای بازی» در صفحه نیست" "$R"
R=$(agent-browser eval "(document.getElementById('btnSettings')&&document.getElementById('btnAbout')&&document.getElementById('btnStart')&&document.getElementById('btnContinue'))?1:0" | tail -1); ck "منو: بازی جدید/ادامه/تنظیمات/درباره سالم‌اند" "$R"
R=$(agent-browser eval "document.querySelectorAll('#menuHero .menu-mini .mini-btn').length===2?1:0" | tail -1); ck "منوی کوچک: فقط ۲ دکمه (تنظیمات + درباره)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots201/01_menu.png >/dev/null

echo "===== ۲) درباره: فقط داستان + سازنده ====="
agent-browser eval "document.getElementById('btnAbout').click();'ok'" >/dev/null; sleep 0.5
R=$(agent-browser eval "!document.getElementById('aboutScreen').classList.contains('hidden')?1:0" | tail -1); ck "صفحه‌ی درباره باز شد" "$R"
R=$(agent-browser eval "document.getElementById('aboutScreen').textContent.indexOf('ساخته شده توسط')>=0&&document.getElementById('aboutScreen').textContent.indexOf('سهند مرامی')>=0?1:0" | tail -1); ck "پایانِ صفحه: «ساخته شده توسط سهند مرامی»" "$R"
R=$(agent-browser eval "document.querySelector('#aboutScreen .about-credit')?1:0" | tail -1); ck "خط سازنده با استایل طلایی (.about-credit)" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('aboutScreen').textContent;return t.indexOf('ویروس')>=0&&t.indexOf('ارشان')>=0&&t.indexOf('رادیو')>=0&&t.indexOf('پناهگاه')>=0?1:0})()" | tail -1); ck "داستان: ویروس + ارشان + رادیو + پناهگاه" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('aboutScreen').textContent;return t.indexOf('HTML5')<0&&t.indexOf('فصل،')<0&&t.indexOf('فرار سینمایی')<0&&t.indexOf('آخرین شب')<0?1:0})()" | tail -1); ck "بدون متن فنی/گیم‌پلی (HTML5، شمارش فصل‌ها، فرارها...)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots201/02_about.png >/dev/null
agent-browser eval "document.getElementById('closeAbout').click();'ok'" >/dev/null; sleep 0.4
R=$(agent-browser eval "document.getElementById('aboutScreen').classList.contains('hidden')?1:0" | tail -1); ck "«برگرد» درباره را می‌بندد" "$R"

echo "===== ۳) جریان اصلی بدون راهنما (hideOverlays/Escape) ====="
fresh
R=$(agent-browser eval "['playing','day','intermission'].includes(state.mode)?1:0" | tail -1); ck "شروع بازی: hideOverlays بدون howtoScreen → بدون خطا" "$R"
agent-browser eval "(()=>{const ev=new KeyboardEvent('keydown',{key:'Escape',bubbles:true});document.dispatchEvent(ev);return 'ok'})()" >/dev/null; sleep 0.5
R=$(agent-browser eval "state.mode==='paused'?1:0" | tail -1); ck "Escape وسط بازی → توقف (هندلر تمیز شد)" "$R"
agent-browser eval "(()=>{const ev=new KeyboardEvent('keydown',{key:'Escape',bubbles:true});document.dispatchEvent(ev);return 'ok'})()" >/dev/null; sleep 0.5
R=$(agent-browser eval "['playing','day','intermission'].includes(state.mode)?1:0" | tail -1); ck "Escape دوباره → ادامه" "$R"
R=$(agent-browser eval "GAME.v20.apkBackButton&&typeof GAME.v20.apkBackButton==='function'?1:0" | tail -1); ck "دکمه‌ی بازگشت APK سالم" "$R"
R=$(agent-browser eval "(()=>{showScreen('aboutScreen');apkBackButton();return document.getElementById('aboutScreen').classList.contains('hidden')?1:0})()" | tail -1); ck "Back اندروید با درباره‌ی باز → می‌بندد" "$R"

echo "===== ۴) موج و رگرسیون سبک ====="
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 2.5
R=$(agent-browser eval "state.mode==='playing'&&state.zombies.length>0?1:0" | tail -1); ck "موج ۱: زامبی‌ها می‌آیند" "$R"
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "پایان موج → روز/فروشگاه" "$R"
R=$(agent-browser eval "WAVES_CH.join()==='6,8,10,12'&&FINAL_WAVE===36?1:0" | tail -1); ck "ساختار ۲۰٫۰ دست‌نخورده (۳۶ شب)" "$R"

E=$(agent-browser errors 2>/dev/null | grep -c "error" || true)
E=$(echo "$E" | head -1); [ -z "$E" ] && E=0
ck "صفر خطای کنسول در کل تست" "$([ "$E" = "0" ] && echo 1 || echo 0)"

agent-browser close --all >/dev/null 2>&1
echo
echo "=========================================="
echo "PASS=$P  FAIL=$F"
[ "$F" = "0" ] && echo "همه‌ی تست‌های ۲۰٫۱ گذرنده ✔"
