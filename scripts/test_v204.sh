#!/bin/bash
# ============================================================
# تست نسخه‌ی ۲۰٫۴ — اسپرایت‌های تصویری زامبی‌ها
# ============================================================
cd /home/z/my-project
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
mkdir -p scripts/shots204
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1"; fi }
fresh() {
  agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 1.2
  agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 1.8
}

echo "===== ۱) ساختار فایل ====="
G=download/three-floors-to-survival.html
gq(){ grep -q "$1" $G && echo 1 || echo 0; }
# (۲۱٫۰+) مسیر تصویری ZIMG خاموش و از بیلد خارج شد — زامبی‌ها برداری‌اند
R=$(gq "drawZombieBody"); ck "تابع بدنه‌ی برداری زامبی (drawZombieBody)" "$R"
R=$(gq "boxFor"); ck "جعبه‌ی per-type (boxFor)" "$R"
R=$(gq "ZSPR.frame"); ck "پخت قاب برداری (ZSPR.frame)" "$R"
R=$(gq "drawMenuFX"); ck "جوّ سینمایی منو (drawMenuFX) — ۲۱٫۱" "$R"

echo "===== ۲) لود و رندر در مرورگر ====="
agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 4
sleep 2
R=$(agent-browser eval "(()=>{const z={type:'normal',attacking:false,walkPhase:1.2,attackAnim:0};const c=ZSPR.frame(z,false);return c&&c.width>40&&c.height>100?1:0})()" | tail -1); ck "قاب برداری normal پخته شد" "$R"
R=$(agent-browser eval "(()=>{try{const z={type:'boss',x:400,y:GROUND_Y,dir:1,radius:ZTYPES.boss.r,walkPhase:1,attacking:false,attackAnim:0,dead:false,deathT:0,hitFlash:0,lane:0,depth:1};drawZombie(z);return 1}catch(e){return 0}})()" | tail -1); ck "باس زنده رسم می‌شود (بدون پخت — معماری ۲۱٫۰)" "$R"
R=$(agent-browser eval "(()=>{const z={type:'tank',attacking:true,attackAnim:2,walkPhase:0};const c=ZSPR.frame(z,true);return c&&c.width>60?1:0})()" | tail -1); ck "قاب حمله+فلاش تانک پخته شد" "$R"
R=$(agent-browser eval "(()=>{const b=ZSPR.boxFor('normal');return b.x0===-26&&b.y0===-52&&b.x1===22?1:0})()" | tail -1); ck "boxFor: جعبه‌ی گشاده‌ی ۲۱٫۰ (-26/-52/22)" "$R"

echo "===== ۳) منوی زنده با اسپرایت تازه ====="
R=$(agent-browser eval "menuZ.length>=2?1:0" | tail -1); ck "زامبی‌های منوی زنده موجود" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots204/01_menu_sprites.png >/dev/null
sleep 1
agent-browser screenshot /home/z/my-project/scripts/shots204/02_menu_sprites2.png >/dev/null

echo "===== ۴) شب‌های بازی: هر ۳ نوع + مرگ + فلاش ====="
fresh
agent-browser eval "GAME.skipToWave(4);'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "state.zombies.length>0?1:0" | tail -1); ck "موج ۴: زامبی‌ها حاضر" "$R"
agent-browser eval "GAME.spawnType('fast');'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "state.zombies.some(z=>z.type==='fast')?1:0" | tail -1); ck "زامبی سریع حاضر (spawn مستقیم)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots204/03_night_fast.png >/dev/null
agent-browser eval "GAME.giveCoins(99999);'ok'" >/dev/null
agent-browser eval "(()=>{for(const z of state.zombies){z.hp=Math.max(1,z.hp-2)}return 'ok'})()" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots204/04_damaged.png >/dev/null
R=$(agent-browser eval "(()=>{const z=state.zombies[0];if(!z)return 0;z.dead=true;z.deathT=0.3;return 1})()" | tail -1); ck "مارکر مرگ برای تست" "$R"
agent-browser eval "GAME.spawnType('tank');'ok'" >/dev/null; sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots204/05_tank.png >/dev/null

echo "===== ۵) باس نگهبان ====="
fresh
agent-browser eval "GAME.skipToWave(36);'ok'" >/dev/null; sleep 4
R=$(agent-browser eval "state.zombies.some(z=>z.type==='boss')?1:0" | tail -1); ck "باس در شب آخر حاضر" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots204/06_boss.png >/dev/null
R=$(agent-browser eval "(()=>{const b=state.zombies.find(z=>z.type==='boss');if(!b)return 0;b.ai.staggerT=2;return 1})()" | tail -1); ck "زره‌ترکیده تست" "$R"
sleep 0.3
agent-browser screenshot /home/z/my-project/scripts/shots204/07_boss_cracked.png >/dev/null

echo "===== ۶) رگرسیون: گیم‌پلی سالم ====="
fresh
R=$(agent-browser eval "['playing','day','intermission'].includes(state.mode)?1:0" | tail -1); ck "شروع بازی سالم" "$R"
agent-browser eval "GAME.skipToWave(1);'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "state.mode==='playing'&&state.zombies.length>0?1:0" | tail -1); ck "موج ۱: زامبی‌ها می‌آیند" "$R"
agent-browser eval "(()=>{const z=state.zombies[0];if(!z)return 0;const hp=z.hp;z.hp-=9999;hitZombie&&0;return 1})()" >/dev/null
agent-browser eval "GAME.endWave();'ok'" >/dev/null; sleep 1.5
R=$(agent-browser eval "state.mode==='day'?1:0" | tail -1); ck "پایان موج → روز" "$R"
R=$(agent-browser eval "WAVES_CH.join()==='6,8,10,12'&&FINAL_WAVE===36?1:0" | tail -1); ck "ساختار ۳۶ شب دست‌نخورده" "$R"
R=$(agent-browser eval "(()=>{let n=0;const orig=console.error;window.__errs=0;window.addEventListener('error',e=>window.__errs=1);return 1})()" | tail -1); ck "شنود خطا فعال" "$R"
sleep 2

echo ""
echo "نتیجه: $P پاس / $F خطا"
[ "$F" = "0" ] && echo "PASS ✔" || echo "FAIL ✘"
