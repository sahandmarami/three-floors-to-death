#!/bin/bash
# شات‌های وضعیت فعلی v25 برای تحلیل بازخورد کاربر
URL="http://localhost:3000/three-floors-to-survival.html"
mkdir -p /home/z/my-project/scripts/shots26
agent-browser close --all >/dev/null 2>&1; sleep 0.5

# گوشی سامسونگ افقی ۲۳۴۰×۱۰۸۰ → CSS ~780×360 (dpr=3)
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9

# ۱) اینترو — استوری موشن (۴ صحنه با پرچم جلو رفتن)
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 3
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_intro1.png >/dev/null 2>&1
sleep 5
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_intro2.png >/dev/null 2>&1
sleep 5
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_intro3.png >/dev/null 2>&1
sleep 5
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_intro4.png >/dev/null 2>&1
sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_intro5.png >/dev/null 2>&1

# رد کردن اینترو و رفتن به گیم‌پلی
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null 2>&1; sleep 3
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_gameplay1.png >/dev/null 2>&1
sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_gameplay2.png >/dev/null 2>&1

# ۲) کادر دستفروش — شب اول تمام شود تا مرچنت بیاید
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots26/phone_merchant.png >/dev/null 2>&1

# ۳) وضعیت دکمه‌ها — مختصات واقعی همه دکمه‌های لمسی
agent-browser eval "JSON.stringify([...document.querySelectorAll('button,[id^=bp],[id*=Btn],.myst-btn,#buildBtn,#pauseBtn,#sndBtn,#listenBtn,#flBtn,#molBtn,#backpackBtn')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className.slice(0,24),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}))" | tail -1 > /home/z/my-project/scripts/shots26/btn_map_phone.json
cat /home/z/my-project/scripts/shots26/btn_map_phone.json

echo "---desktop---"
# دسکتاپ ۱۲۸۰×۷۲۰ برای مقایسه
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 9
agent-browser eval "GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.5
agent-browser eval "DLG.skip();'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.startNight();'ok'" >/dev/null 2>&1; sleep 3
agent-browser screenshot /home/z/my-project/scripts/shots26/desktop_gameplay.png >/dev/null 2>&1
agent-browser eval "GAME.skipToWave(2);'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "GAME.skipToWave(3);'ok'" >/dev/null 2>&1; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots26/desktop_merchant.png >/dev/null 2>&1
agent-browser eval "JSON.stringify([...document.querySelectorAll('button,[id^=bp],[id*=Btn],.myst-btn,#buildBtn,#pauseBtn,#sndBtn,#listenBtn,#flBtn,#molBtn,#backpackBtn')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className.slice(0,24),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}))" | tail -1 > /home/z/my-project/scripts/shots26/btn_map_desktop.json
cat /home/z/my-project/scripts/shots26/btn_map_desktop.json
echo ""
echo "DONE"
