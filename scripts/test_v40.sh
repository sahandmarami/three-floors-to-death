#!/bin/bash
# تست نسخهٔ ۴۰٫۰ — داستان کامل پرامپت + پلتفرمر + زنجیرهٔ پایان + ۵ چهرهٔ دستفروش (روی پایهٔ v39)
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots40
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof GAME==='object'?1:0" | tail -1); ck "بوت سالم v40 (پایهٔ v39 + ماژول)" "$R"

echo "===== ۱) منوی اصلی — رفع مه v39 حفظ شد ====="
agent-browser reload >/dev/null; sleep 4
R=$(agent-browser eval "M23.zmb.length===3?1:0" | tail -1); ck "زامبی‌های منو = ۳ (رفع v39 پابرجا)" "$R" "n=$(agent-browser eval "M23.zmb.length" | tail -1)"
R=$(agent-browser eval "typeof M23.draw.toString()==='function' && M23.draw.toString().includes('fogA')===false || M23.fogA.length===0?1:0" | tail -1); ck "مه سفید منو غیرفعال (v39)" "$R"

echo "===== ۲) شخصیت‌ها طبق پرامپت — آرش/ارشان/مریم/سارا ====="
R=$(agent-browser eval "DLG_WHO.p.name==='آرش'?1:0" | tail -1); ck "بازیکن = آرش (نه سهند)" "$R" "got=$(agent-browser eval "DLG_WHO.p.name" | tail -1)"
R=$(agent-browser eval "DLG_WHO.a.name==='ارشان'?1:0" | tail -1); ck "رفیق = ارشان" "$R"
R=$(agent-browser eval "DLG_WHO.q.name.includes('مریم') && DLG_WHO.k.name.includes('سارا') && DLG_WHO.s.name==='دکتر سارا' && DLG_WHO.g.name==='نگهبان'?1:0" | tail -1); ck "گوینده‌های جدید: مریم(رادیو)/سارا(رادیو)/دکتر سارا/نگهبان" "$R"
R=$(agent-browser eval "DLG_WHO.b.name==='هیولای آخر' && ['d1','d2','d3','d4','d5'].every(k=>DLG_WHO[k])?1:0" | tail -1); ck "باس = هیولای آخر + پنج چهرهٔ دستفروش" "$R"

echo "===== ۳) دیالوگ‌های پرامپت در قلاب‌های داستان ====="
R=$(agent-browser eval "STORY22.chEnd[1][0].v==='c1n1p' && STORY22.chEnd[1][2].v==='c1n3p'?1:0" | tail -1); ck "پایان فصل ۱: «شیش شب گذشت» + «تله نباشه» (پرامپت)" "$R"
R=$(agent-browser eval "STORY22.chEnd[3].some(l=>l.v==='c3eq1') && STORY22.chEnd[3][0].who==='q'?1:0" | tail -1); ck "پایان فصل ۳: تماس رادیویی دکتر مریم (q)" "$R"
R=$(agent-browser eval "STORY22.chStart[4] && STORY22.chStart[4][0].v==='ch4q1'?1:0" | tail -1); ck "شروع فصل ۴: «از برج دیده‌بانی شما رو می‌بینم»" "$R"
R=$(agent-browser eval "STORY22.afterFinal.length===1 && STORY22.afterFinal[0].v==='af1' && STORY22.afterFinal[0].text==='تموم شد... رسیدیم.'?1:0" | tail -1); ck "پس از موج نهایی: «تموم شد... رسیدیم.»" "$R"
R=$(agent-browser eval "CHAPTERS.map(c=>c.name).join('|')==='برج اصلی|حاشیهٔ شهر|برج مخابراتی|برج دیده‌بانی'?1:0" | tail -1); ck "نام فصل‌ها طبق پرامپت" "$R" "got=$(agent-browser eval "CHAPTERS.map(c=>c.name).join('|')" | tail -1)"
R=$(agent-browser eval "INTRO_DLGS[0][0].v==='in1p' && INTRO_DLGS[0][0].text.includes('شهر چی شده')?1:0" | tail -1); ck "اینترو: «وای... شهر چی شده...» (پرامپت صحنه ۱)" "$R"
R=$(agent-browser eval "VOICES23.df1p && VOICES23.df2a && VOICES23.tbc1n?1:0" | tail -1); ck "کلیپ‌های شکست و پایان باز موجود" "$R"

echo "===== ۴) دستفروش — بانک پنج چهره (پرامپت بخش ۷) ====="
R=$(agent-browser eval "PED30_BANKS.length===5?1:0" | tail -1); ck "۵ بانک چهره" "$R"
R=$(agent-browser eval "PED30_BANKS[0].intro.length===3 && PED30_BANKS[2].intro.some(x=>x.v==='pd3i1')?1:0" | tail -1); ck "بانک‌ها: شنل‌پوش ۳ خط آغازین + ماسک‌گاز «...کالا. بخر.»" "$R"
R=$(agent-browser eval "PED30_DOUBTS.length===5 && PED30_MYSTERY.length===5?1:0" | tail -1); ck "۵ شک آرش + ۵ اشارهٔ مرموز" "$R"
R=$(agent-browser eval "VOICES23.pd3i1 && VOICES23.pd2f1 && VOICES23.pd5f1 && VOICES23.pmh3 && VOICES23.pdf1?1:0" | tail -1); ck "کلیپ‌های صدای پنج چهره موجود" "$R"

echo "===== ۵) زنجیرهٔ پایان — پناهگاه → آژیر → پروندهٔ Z → جدایی ====="
agent-browser eval "wipeSave(); startEnding30(); 'ok'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='sheltercine' && E30.phase==='arrive'?1:0" | tail -1); ck "فاز arrive: دروازهٔ پناهگاه" "$R" "ph=$(agent-browser eval "E30.phase" | tail -1)"
R=$(agent-browser eval "DLG.lines.some(l=>l.v==='sa1g' && l.who==='g')?1:0" | tail -1); ck "نگهبان: «اسلحه‌ها رو تحویل بدید»" "$R"
agent-browser eval "for(let i=0;i<8;i++) DLG.skip(); 'x'" >/dev/null; sleep 2
agent-browser eval "for(let i=0;i<8;i++) DLG.skip(); 'x'" >/dev/null; sleep 2
agent-browser eval "for(let i=0;i<8;i++) DLG.skip(); 'x'" >/dev/null; sleep 3
R=$(agent-browser eval "['siren','control','escape','fire','part','plati'].includes(E30.phase)?1:0" | tail -1); ck "زنجیره جلو رفت (آژیر/پرونده/آتش/جدایی)" "$R" "ph=$(agent-browser eval "E30.phase" | tail -1)"
R=$(agent-browser eval "VOICES23.si2m && VOICES23.zf2m && VOICES23.ss8k && VOICES23.sp5a?1:0" | tail -1); ck "کلیپ‌های آژیر/پرونده Z/رادیو سارا/«قول می‌دم»" "$R"

echo "===== ۶) پلتفرمر — فصل میانی (۳ مرحله + چک‌پوینت + لمسی) ====="
agent-browser eval "skipEnding30(); 'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "PLAT30.on && PLAT30.level===1?1:0" | tail -1); ck "پلتفرمر مرحلهٔ ۱ شروع شد (skip از زنجیره)" "$R"
R=$(agent-browser eval "document.getElementById('platPad') && document.getElementById('platPad').style.display==='block'?1:0" | tail -1); ck "دی‌پد + دکمه‌های پرش/شلیک نمایان" "$R"
R=$(agent-browser eval "document.getElementById('platBL') && document.getElementById('platBJ') && document.getElementById('platBS') && document.getElementById('platBR')?1:0" | tail -1); ck "چهار دکمهٔ لمسی: ◀ ▶ پرش شلیک" "$R"
# فیزیک: دویدن + پرش
X0=$(agent-browser eval "Math.round(PLAT30.pl.x)" | tail -1)
agent-browser eval "PLAT30.keys.r=true; setTimeout(()=>{PLAT30.jumpQueued=true;},400); 'go'" >/dev/null; sleep 1.6
agent-browser eval "PLAT30.keys.r=false; 'stop'" >/dev/null
X1=$(agent-browser eval "Math.round(PLAT30.pl.x)" | tail -1)
R=$([ "$X1" -gt "$X0" ] && echo 1 || echo 0); ck "فیزیک: آرش به راست دوید ($X0 → $X1)" "$R"
R=$(agent-browser eval "PLAT30.pl.onG?1:0" | tail -1); ck "فرود پس از پرش (onG)" "$R"
# شلیک — قطعی: زامبی جلوی بازیکن + شلیک
agent-browser eval "PLAT30.zs[0].x = PLAT30.pl.x + 80; PLAT30.zs[0].y = PLAT30.pl.y; PLAT30.zs[0].dead=false; PLAT30.zs[0].hp=3; 'setup'" >/dev/null
agent-browser eval "PLAT30.fireHeld=true; setTimeout(()=>{PLAT30.fireHeld=false;},600); 'fire'" >/dev/null; sleep 1.6
R=$(agent-browser eval "PLAT30.zs[0].dead || PLAT30.zs.some(z=>z.dead)?1:0" | tail -1); ck "شلیک کار می‌کند (گلوله/زامبی کشته)" "$R"
# چک‌پوینت
agent-browser eval "PLAT30.pl.x = PLAT30.LVL.cp; 'cp'" >/dev/null; sleep 1
R=$(agent-browser eval "PLAT30.cpOn?1:0" | tail -1); ck "چک‌پوینت وسط مرحله فعال شد" "$R"
# مرگ و ری‌اسپاون
agent-browser eval "PLAT30.pl.hp=1; PLAT30.pl.inv=0; platHurt(1,false); 'hurt'" >/dev/null; sleep 2
R=$(agent-browser eval "PLAT30.dying===false && Math.abs(PLAT30.pl.x - PLAT30.LVL.cp)<60?1:0" | tail -1); ck "مرگ → ری‌اسپاون از چک‌پوینت (نه اول مرحله)" "$R" "x=$(agent-browser eval "Math.round(PLAT30.pl.x)" | tail -1)/cp=$(agent-browser eval "PLAT30.LVL.cp" | tail -1)"
# اتمام مرحله ۱ → ۲
agent-browser eval "PLAT30.pl.x = PLAT30.LVL.exitX + 20; 'exit'" >/dev/null; sleep 2.6
R=$(agent-browser eval "PLAT30.level===2?1:0" | tail -1); ck "مرحلهٔ ۱ تمام → مرحلهٔ ۲ (پل شکسته)" "$R"

echo "===== ۷) ایستگاه + پایان باز ====="
agent-browser eval "PLAT30.pl.x = PLAT30.LVL.exitX + 20; 'e2'" >/dev/null
for i in $(seq 1 24); do L=$(agent-browser eval "PLAT30.level" 2>/dev/null | tail -1); [ "$L" = "3" ] && break; sleep 0.5; done
agent-browser eval "PLAT30.pl.x = PLAT30.LVL.exitX + 20; 'e3'" >/dev/null
for i in $(seq 1 30); do M=$(agent-browser eval "state.mode" 2>/dev/null | tail -1); [ "$M" = "end30" ] && break; sleep 0.5; done
R=$(agent-browser eval "E30.phase==='station'?1:0" | tail -1); ck "پایان مرحلهٔ ۳ → سینمایی ایستگاه شمالی" "$R" "ph=$(agent-browser eval "E30.phase" | tail -1)"
R=$(agent-browser eval "DLG.lines.some(l=>l.v==='st3s' && l.who==='s')?1:0" | tail -1); ck "دکتر سارا: «من یکی از اونایی‌ام که Z رو ساختم»" "$R"
# پایان باز + پاک‌شدن سیو
agent-browser eval "try{STORE.set('ttb3_save_v1','X')}catch(e){localStorage.setItem('ttb3_save_v1','X')}; skipEnding30(); 'skip'" >/dev/null; sleep 3.2
R=$(agent-browser eval "document.getElementById('tbcTitle') && document.getElementById('tbcTitle').textContent.includes('ادامه دارد')?1:0" | tail -1); ck "پایان باز: «این داستان ادامه دارد...»" "$R"
R=$(agent-browser eval "(function(){try{return STORE.get('ttb3_save_v1')===null}catch(e){return localStorage.getItem('ttb3_save_v1')===null}})()?1:0" | tail -1); ck "سیو پس از اتمام بازی پاک شد (wipeSave)" "$R"
R=$(agent-browser eval "typeof tbcContinueToMenu==='function'?1:0" | tail -1); ck "دکمهٔ بازگشت به منو موجود" "$R"

echo "===== ۸) رگرسیون‌های حیاتی ====="
agent-browser eval "tbcContinueToMenu(); 'menu'" >/dev/null; sleep 2
R=$(agent-browser eval "state.mode==='start'?1:0" | tail -1); ck "بازگشت سالم به منو" "$R"
R=$(agent-browser eval "typeof VOICES23!=='undefined' && Object.keys(VOICES23).length===175?1:0" | tail -1); ck "۱۷۵ کلیپ صوتی v40" "$R"
R=$(agent-browser eval "VOICES23.aw3 && VOICES23.aw6?1:0" | tail -1); ck "کلیپ‌های aw3/aw6 (بارک ارشان) بازتولید شدند" "$R"

echo
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
[ "$F" = "0" ] && echo "همهٔ تست‌های ۳۰٫۰ گذرنده ✔" || echo "خطاها باید رفع شوند ✗"
