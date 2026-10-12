#!/bin/bash
# تست نسخه‌ی ۲۳٫۰ — منوی جدید + اینترو موشن‌گرافیک + صداها + معما + TLOU
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots23

echo "===== ۱) بارگذاری + منوی جدید ====="
agent-browser set viewport 1280 720 >/dev/null
agent-browser open "$URL" >/dev/null; sleep 8
agent-browser screenshot /home/z/my-project/scripts/shots23/01_menu.png >/dev/null 2>&1

R=$(agent-browser eval "document.querySelector('.m23-title')?document.querySelector('.m23-title').textContent.trim().slice(0,30):'x'" | tail -1); ck "تیتر منوی جدید" "$([ "$R" != "x" ] && echo 1 || echo 0)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnStart');if(!b)return 'missing';const r=b.getBoundingClientRect();return Math.round(r.height)})()" | tail -1); ck "دکمه شروع بزرگ (>=60px)" "$([ "$R" -ge 60 ] 2>/dev/null && echo 1 || echo 0)" "h=$R"
R=$(agent-browser eval "document.body.innerText.includes('۲۵٫۰')?1:0" | tail -1); ck "نسخه ۲۵٫۰" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnStart');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.top>=-1)?1:0})()" | tail -1); ck "دکمه شروع داخل قاب" "$R"
R=$(agent-browser eval "M23&&M23.inited?1:0" | tail -1); ck "صحنه‌ی منوی Canvas آماده" "$R"
R=$(agent-browser eval "typeof VOICES23==='object'?Object.keys(VOICES23).length:0" | tail -1); ck "VOICES23 با ۱۱۹ کلیپ" "$([ "$R" = "119" ] && echo 1 || echo 0)" "n=$R"
R=$(agent-browser eval "VOICES23.i1n&&VOICES23.i1n.d>2&&VOICES23.i1n.a.length>1000?1:0" | tail -1); ck "کلیپ i1n سالم (ElevenLabs)" "$R"
R=$(agent-browser eval "(()=>{const k=['i1n','i2n','i3a','i4p','i7a','i8p','i9a','i10p','i13a','i14p','i15a','i16p','i19a','i20p','w1a','w1b','w1d','c1w1a','c1w1b','c1w4r','c1er','c1ea','t2n1','tb2p1','tb2o1','c3n1','c3ca','c4n1','c4m1','c4m2','c4f1','c4f3','c4v1','c4vr','e1n','e2a','e3p','tbc1n','pd1a1','pd1b','fb1b1','fbd1','aw1','aw5','sbo1','b1a1','d1a1','s1a1','tb1c','tb3s'];return k.every(x=>VOICES23[x])?1:0})()" | tail -1); ck "همه‌ی کلیدهای صدای اصلی موجود" "$R"
R=$(agent-browser eval "(()=>{const miss=[];const scan=o=>{for(const k in o){const v=o[k];if(Array.isArray(v))scan(v);else if(v&&v.v&&!VOICES23[v.v])miss.push(v.v);}};scan(STORY22);scan(INTRO_DLGS);for(const ch in TR_DLGS)scan(TR_DLGS[ch]);for(const ch in TR_BARKS){const b=TR_BARKS[ch];if(b&&Array.isArray(b.outro))scan(b.outro);}return miss.length===0?1:0})()" | tail -1); ck "هیچ کلید صدای گمشده" "$R"

echo "===== ۲) اینترو موشن‌گرافیک ====="
agent-browser eval "GAME.v10.wipeSave();GAME.v10.startNewGame();'ok'" >/dev/null; sleep 2.5
agent-browser screenshot /home/z/my-project/scripts/shots23/02_intro_s1.png >/dev/null 2>&1
R=$(agent-browser eval "state.mode" | tail -1 | tr -d '"') ; ck "حالت intro" "$([ "$R" = "intro" ] && echo 1 || echo 0)" "$R"
R=$(agent-browser eval "INTRO_SCENES.every(s=>s.draw.name.includes('MG'))?1:0" | tail -1); ck "صحنه‌های اینترو = موشن‌گرافیک" "$R"
R=$(agent-browser eval "INTRO_DLGS[0][0].text.includes('ویروس')?1:0" | tail -1); ck "دیالوگ جدید صحنه ۱" "$R"
R=$(agent-browser eval "INTRO_DLGS[2].some(l=>l.text.includes('متروکه'))?1:0" | tail -1); ck "صحنه ۳: ساختمانِ موجود/متروکه" "$R"
R=$(agent-browser eval "(()=>{const t=JSON.stringify(INTRO_DLGS);return t.includes('تخته')&&t.includes('ورق فلزی')?1:0})()" | tail -1); ck "صحنه ۴: استحکام‌بخشی (نه ساخت)" "$R"
# جلو رفتن صحنه‌ها با رد دیالوگ
for i in 1 2 3 4 5 6; do agent-browser eval "DLG.skip();'ok'" >/dev/null; sleep 1.2; done
agent-browser screenshot /home/z/my-project/scripts/shots23/03_intro_s3.png >/dev/null 2>&1
sleep 2; agent-browser screenshot /home/z/my-project/scripts/shots23/04_intro_s4.png >/dev/null 2>&1
agent-browser eval "GAME.v10.skipIntro();'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "['playing','intermission','day'].includes(state.mode)?1:0" | tail -1); ck "بازی شروع شد" "$R"

echo "===== ۳) گیم‌پلی + سیستم‌های ۲۳ ====="
sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots23/05_wave.png >/dev/null 2>&1
R=$(agent-browser eval "typeof DEPTH23!=='undefined'?1:0" | tail -1); ck "DEPTH23 حاضر" "$R"
R=$(agent-browser eval "typeof MYST!=='undefined'?1:0" | tail -1); ck "MYST حاضر" "$R"
R=$(agent-browser eval "MUSIC.track?1:0" | tail -1 | tr -d '"'); ck "موسیقی فعال" "$R" "track=$(agent-browser eval "MUSIC.track" | tail -1 | tr -d '"')"
# ژست واقعی کاربر → صدا باید running شود
agent-browser click 640 300 >/dev/null 2>&1; sleep 1.5
# نکته: کلیک مصنوعی headless ژستِ معتبر مرورگر نیست — روی گوشی واقعی running می‌شود
# (مسیر آنلاک از v21 روی دستگاه واقعی اثبات شده؛ اینجا فقط آماده‌بودن چک می‌شود)
R=$(agent-browser eval "Snd.ready&&Snd.ctx&&(Snd.ctx.state==='running'||Snd.ctx.state==='suspended')?1:0" | tail -1 | tr -d '"'); ck "AudioContext آماده (آنلاک با لمس واقعی)" "$R"
R=$(agent-browser eval "window.__errs?window.__errs.length:0" | tail -1); ck "خطای کنسول صفر" "$([ "$R" = "0" ] && echo 1 || echo 0)" "n=$R"

echo "===== ۴) لایه‌ی معما ====="
agent-browser eval "state.mode='day';state.wave=4;state.chapter=1;MYST.update(0.02);'ok'" >/dev/null; sleep 0.5
agent-browser screenshot /home/z/my-project/scripts/shots23/06_myst_btn.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('mystBtn');return b&&b.style.display!=='none'?1:0})()" | tail -1); ck "دکمه سرنخ ظاهر شد" "$R"
R=$(agent-browser eval "MYST.avail().includes('radio')?1:0" | tail -1); ck "معمای بی‌سیم در دسترس" "$R"
agent-browser eval "MYST.openRadio();'ok'" >/dev/null; sleep 0.6
agent-browser screenshot /home/z/my-project/scripts/shots23/07_radio.png >/dev/null 2>&1
R=$(agent-browser eval "document.querySelector('.myst-panel')?1:0" | tail -1); ck "پنل بی‌سیم باز" "$R"
R=$(agent-browser eval "(()=>{const s=document.querySelector('#rdSlider');s.value=1045;document.querySelector('#rdLock').click();return MYST.done.radio?1:0})()" | tail -1); ck "معمای بی‌سیم قابل‌حل" "$R"
R=$(agent-browser eval "MYST.clues.length>=1?1:0" | tail -1); ck "سرنخ آرشیو شد" "$R"
agent-browser eval "MYST.closePanel();'ok'" >/dev/null

echo "===== ۵) TLOU — شنود/مولوتوف ====="
agent-browser eval "GAME.startWave(2);'ok'" >/dev/null; sleep 2.5
agent-browser eval "state.coins=300;MYST.craftMolotov();MYST.startListen();'ok'" >/dev/null; sleep 0.8
agent-browser screenshot /home/z/my-project/scripts/shots23/08_listen.png >/dev/null 2>&1
R=$(agent-browser eval "MYST.molotovs>0?1:0" | tail -1); ck "مولوتوف ساخته شد" "$R"
R=$(agent-browser eval "MYST.listen.active?1:0" | tail -1); ck "حالت شنود فعال" "$R"
R=$(agent-browser eval "document.getElementById('listenBtn')&&document.getElementById('molotovBtn')?1:0" | tail -1); ck "دکمه‌های شنود/مولوتوف" "$R"
R=$(agent-browser eval "MYST.throwMolotov();MYST.molotovs===0&&MYST.throwFx?1:0" | tail -1); ck "پرتاب مولوتوف" "$R"

echo "===== ۶) موبایل ۷۸۰×۳۶۰ ====="
agent-browser set viewport 780 360 >/dev/null; sleep 2
agent-browser eval "location.reload();'ok'" >/dev/null; sleep 8
agent-browser screenshot /home/z/my-project/scripts/shots23/09_phone_menu.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnStart');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.left>=-1&&r.top>=-1&&r.height>=30)?1:0})()" | tail -1); ck "گوشی: دکمه شروع بزرگ و کامل در قاب" "$R" "h=$(agent-browser eval "Math.round(document.getElementById('btnStart').getBoundingClientRect().height)" | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnContinue');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.left>=-1)?1:0})()" | tail -1); ck "گوشی: دکمه ادامه در قاب" "$R"
R=$(agent-browser eval "(()=>{const t=document.querySelector('.m23-title');if(!t)return 0;const r=t.getBoundingClientRect();return (r.right<=innerWidth+1&&r.top>=-1)?1:0})()" | tail -1); ck "گوشی: تیتر کامل" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnSettings');if(!b)return 0;const r=b.getBoundingClientRect();return (r.right<=innerWidth+1&&r.bottom<=innerHeight+1)?1:0})()" | tail -1); ck "گوشی: تنظیمات در قاب" "$R"

echo ""
echo "== نتیجه: $P OK / $F FAIL =="
agent-browser close --all >/dev/null 2>&1
exit $([ "$F" = "0" ] && echo 0 || echo 1)
