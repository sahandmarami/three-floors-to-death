#!/bin/bash
# تست نسخه‌ی ۳۲٫۰ — بازخورد کاربر (جلسه‌ی ۳۲):
# ۱) دکمه سرنخ بازطراحی ۲) انیمیشن پنل مرکزچین ۳) حذف نوار سلاح
# ۴) لوگوهای درشت ۵) آیکون چراغ‌قوه SVG ۶) خرید در شروع بازی
# ۷) «ذخیره شد» سریع ۸) منوی سرنخ‌های پرونده‌ای
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done
R=$(agent-browser eval "typeof SVG32!=='undefined'&&typeof MYST!=='undefined'&&(window.__V34&&window.__V34.flags===1)?1:0" 2>/dev/null | tail -1)
ck "بوت سالم + ماژول v34 فعال (جایگزین v32)" "$R"

to_game() {
  agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
  agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
  agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
}
to_day4() {
  to_game
  agent-browser eval "state.wave=4; state.mode='day'; state.dayTarget=1; state.goingNight=false; state.zombies=[]; state.spawn.queue=[]; state.peddler.here=false; hidePeddlerPanel&&hidePeddlerPanel(); 'ok'" >/dev/null 2>&1; sleep 1
}

echo "===== ۱) نوار سلاح پایین — حذف کامل (درخواست اصلی) ====="
to_game
R=$(agent-browser eval "(()=>{const c=document.getElementById('wpnChips28'); const cs=getComputedStyle(c); return cs.display==='none'?1:0})()" 2>/dev/null | tail -1)
ck "نوار سلاح در وقفه‌ی اول دیده نمی‌شود" "$R"
R=$(agent-browser eval "(()=>{state.mode='playing'; const c=document.getElementById('wpnChips28'); return getComputedStyle(c).display==='none'?1:0})()" 2>/dev/null | tail -1)
ck "نوار سلاح در شب (نبرد) هم دیده نمی‌شود" "$R"
R=$(agent-browser eval "(()=>{state.mode='day'; const c=document.getElementById('wpnChips28'); return getComputedStyle(c).display==='none'?1:0})()" 2>/dev/null | tail -1)
ck "نوار سلاح در روز هم دیده نمی‌شود" "$R"

echo "===== ۲) خرید و تعویض سلاح فقط از ساخت‌وساز ====="
R=$(agent-browser eval "(()=>{state.mode='intermission'; state.coins=600; toggleBuildPanel(); setBPTab('wpn', true); const t=document.getElementById('bp-shotgun'); const r=t.getBoundingClientRect(); return r.width>40?1:0})()" 2>/dev/null | tail -1)
ck "کاشی سلاح‌ها در داک قابل دیدن است" "$R"
R=$(agent-browser eval "(()=>{const before=state.coins; document.getElementById('bp-shotgun').dispatchEvent(new MouseEvent('click',{bubbles:true})); return WEAPONS.shotgun.owned&&state.weapon==='shotgun'?1:0})()" 2>/dev/null | tail -1)
ck "خرید شاتگان از داک کار می‌کند" "$R"
R=$(agent-browser eval "(()=>{document.getElementById('bp-pistol').dispatchEvent(new MouseEvent('click',{bubbles:true})); const back=state.weapon==='pistol'; document.getElementById('bp-shotgun').dispatchEvent(new MouseEvent('click',{bubbles:true})); return back&&state.weapon==='shotgun'?1:0})()" 2>/dev/null | tail -1)
ck "تعویض رفت‌وبرگشت کلت↔شاتگان از داک" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('bp-shotgun'); return t.classList.contains('armed')?1:0})()" 2>/dev/null | tail -1)
ck "کاشی سلاحِ در دست = طلایی (armed)" "$R"

echo "===== ۳) خرید در شروع بازی (باگ گزارش‌شده) ====="
agent-browser eval "wipeSave(); GAME.v10.startNewGame(); 'ok'" >/dev/null 2>&1; sleep 1
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null 2>&1; sleep 2.5
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.5
R=$(agent-browser eval "(()=>{const c0=state.coins; toggleBuildPanel(); setBPTab('up', true); document.getElementById('bp-weapon').dispatchEvent(new MouseEvent('click',{bubbles:true})); return state.coins<c0&&state.upgrades.weapon===1?1:0})()" 2>/dev/null | tail -1)
ck "خرید ارتقای اسلحه در وقفه‌ی اول کار می‌کند" "$R"
R=$(agent-browser eval "(()=>{const c0=state.coins; document.getElementById('bp-health').dispatchEvent(new MouseEvent('click',{bubbles:true})); return state.coins<c0&&state.upgrades.health===1?1:0})()" 2>/dev/null | tail -1)
ck "خرید جون برج در وقفه‌ی اول کار می‌کند" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('bp-weapon'); const cs=getComputedStyle(t); return cs.touchAction==='manipulation'?1:0})()" 2>/dev/null | tail -1)
ck "کاشی‌ها touch-action=manipulation (لمس مطمئن)" "$R"
R=$(agent-browser eval "(()=>{state.mode='day'; state.dayTarget=1; const c0=state.coins; state.coins=5; document.getElementById('bp-trap').dispatchEvent(new MouseEvent('click',{bubbles:true})); state.coins=c0; return 1})()" 2>/dev/null | tail -1); sleep 0.35
R2=$(agent-browser eval "(()=>{const a=document.getElementById('announce'); const big=document.querySelector('#announce .big'); return a&&+a.style.opacity===1&&big&&/کافی/.test(big.textContent)?1:0})()" 2>/dev/null | tail -1)
ck "رد شدن خرید = اعلان مرئی «سکه کافی نیست»" "$R2"

echo "===== ۴) دکمه‌ی «سرنخ» بازطراحی‌شده ====="
to_day4
R=$(agent-browser eval "(()=>{const b=document.getElementById('mystBtn'); const svg=b.querySelector('.ic svg'); const badge=document.getElementById('clueBadge34'); return b&&svg&&badge?1:0})()" 2>/dev/null | tail -1)
ck "دکمه سرنخ: آیکون SVG + نشان شمارنده (v34)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('mystBtn'); const lbl=b.querySelector('span'); const cs=getComputedStyle(b); return (!lbl||!lbl.textContent.trim())&&cs.borderRadius==='50%'?1:0})()" 2>/dev/null | tail -1)
ck "دکمه سرنخ: دایره‌ی بدون برچسب متنی (v34)" "$R"
agent-browser eval "MYST.clues.length=0; MYST.clues.push({icon:'📻',name:'مسیر کانال',sub:'فرکانس ۱۰۴٫۵'},{icon:'🗺️',name:'نقشه برج',sub:'دره شرقی'}); MYST._badge32(); 'ok'" >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.getElementById('clueBadge34'); return b&&b.textContent==='۲'&&getComputedStyle(b).display!=='none'?1:0})()" 2>/dev/null | tail -1)
ck "نشان شمارنده = «۲» (فارسی، v34)" "$R"

echo "===== ۵) پنل سرنخ — باتن‌شیت اندرویدی (v34) ====="
agent-browser eval "MYST.closePanel(); try{closeSheet34()}catch(e){} document.getElementById('mystBtn').click(); 'open'" >/dev/null 2>&1
sleep 0.08
R=$(agent-browser eval "(()=>{const p=document.getElementById('clueSheet34'); if(!p) return 0; const cs=getComputedStyle(p); return cs.display==='flex'&&p.classList.contains('open')?1:0})()" 2>/dev/null | tail -1)
ck "باتن‌شیت در ۸۰ms اول باز شده" "$R"
sleep 0.45
R=$(agent-browser eval "(()=>{const p=document.getElementById('clueSheet34'); const r=p.getBoundingClientRect(); const in34=p.classList.contains('in34'); const w=document.getElementById('wrap').getBoundingClientRect(); const centered=Math.abs((r.top+r.bottom)/2-(w.top+w.bottom)/2)<r.height*0.3; return in34&&centered?1:0})()" 2>/dev/null | tail -1)
ck "پس از انیمیشن: کامل باز و وسط صفحه (v36)" "$R"
R=$(agent-browser eval "(()=>{const bk=document.getElementById('sheetBk34'); const p=document.getElementById('clueSheet34'); const r=p.getBoundingClientRect(); const w=document.getElementById('wrap').getBoundingClientRect(); const centered=Math.abs((r.left+r.right)/2-(w.left+w.right)/2)<20; const scrim=bk&&bk.classList.contains('open'); const capped=r.height<=w.height*0.9; return centered&&scrim&&capped?1:0})()" 2>/dev/null | tail -1)
ck "دیالوگ اندرویدی: وسط صفحه + اسکریم + سقف ارتفاع (v36)" "$R"
agent-browser eval "try{closeSheet34()}catch(e){} document.getElementById('mystBtn').click(); 'reopen'" >/dev/null 2>&1
sleep 0.12
R=$(agent-browser eval "(()=>{const p=document.getElementById('clueSheet34'); return p.classList.contains('open')?1:0})()" 2>/dev/null | tail -1)
ck "باز شدن مجدد باتن‌شیت" "$R"

echo "===== ۶) منوی سرنخ‌ها — پرونده‌ی مستندات ====="
R=$(agent-browser eval "(()=>{const ev=Array.from(document.querySelectorAll('#clueSheet34 .rc34')); return ev.length>=6?1:0})()" 2>/dev/null | tail -1)
ck "کارت‌های شواهد+اکشن در باتن‌شیت (v34)" "$R"
R=$(agent-browser eval "(()=>{const nums=Array.from(document.querySelectorAll('#clueSheet34 .rc34 em')).map(e=>e.textContent); return nums.some(t=>/۰۱/.test(t))?1:0})()" 2>/dev/null | tail -1)
ck "شماره‌گذاری فارسی شواهد (۰۱، ۰۲…)" "$R"
<<<<<<< HEAD
R=$(agent-browser eval "(()=>{return document.querySelector('#clueSheet34 [data-act=radio].gold34')&&document.querySelector('#clueSheet34 .rc-go34')?1:0})()" 2>/dev/null | tail -1)
ck "کارت معمای فعال (کهربایی + chevron)" "$R"
=======
R=$(agent-browser eval "(()=>{return document.querySelector('#clueSheet34 [data-act=radio].gold34')&&!document.querySelector('#clueSheet34 .rc-go34')?1:0})()" 2>/dev/null | tail -1)
ck "کارت معمای فعال (کهربایی — chevron حذف شد v38)" "$R"
>>>>>>> 863fa02 (نسخه‌ی ۳۸٫۰ — متن داستان پایین صفحه + آیکون جدید بازی + حذف مه‌های سفید منو + زامبی‌های باحال + بدون علامت در سرنخ‌ها — ۴۳۹ تست سبز)
R=$(agent-browser eval "(()=>{const h=document.querySelector('#clueSheet34 .sh-sec34'); return h&&getComputedStyle(h).display==='flex'?1:0})()" 2>/dev/null | tail -1)
ck "سرصفحه‌های بخش با خط‌کشی (نه متن معلق)" "$R"
R=$(agent-browser eval "(()=>{return document.querySelectorAll('#clueSheet34 .rc34[data-act]').length===4?1:0   /* جست‌وجو + مولوتوف + شنود + معما */})()" 2>/dev/null | tail -1)
ck "اکشن‌های بقا = کارت‌های ردیفی لمسی" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots32/clue_menu32.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const b=document.querySelector('#clueSheet34 [data-act=radio]'); if(!b) return 0; b.dispatchEvent(new MouseEvent('click',{bubbles:true})); return document.querySelector('.radio-dial')?1:0})()" 2>/dev/null | tail -1)
ck "کلیک کارت معما → پنل کوک بی‌سیم باز می‌شود" "$R"
agent-browser eval "MYST.closePanel(); try{closeSheet34()}catch(e){}; 'ok'" >/dev/null 2>&1

echo "===== ۷) لوگوهای درشت + آیکون چراغ‌قوه SVG ====="
R=$(agent-browser eval "(()=>{const ic=document.querySelector('#bpHead img.ic30'); return ic&&ic.getBoundingClientRect().width>=30?1:0})()" 2>/dev/null | tail -1)
ck "لوگوی داک ساخت‌وساز ≥ ۳۰px (قبلاً ~۲۴)" "$R" "w=$(agent-browser eval "(()=>{const ic=document.querySelector('#bpHead img.ic30'); return ic?Math.round(ic.getBoundingClientRect().width):0})()" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('bpkBtn34'); const r=b.getBoundingClientRect(); return r.width>=48?1:0})()" 2>/dev/null | tail -1)
ck "دکمه‌ی کوله‌پشتی ریل ≥ ۴۸px (v34 — جایگزین نوار قدیمی)" "$R" "w=$(agent-browser eval "(()=>{const b=document.getElementById('bpkBtn34'); return b?Math.round(b.getBoundingClientRect().width):0})()" 2>/dev/null | tail -1)"
agent-browser eval "state.mode='playing'; 'night'" >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const cf=document.getElementById('ctlFlash'); const prev=cf.style.display; cf.style.display='flex'; const ic=cf.querySelector('.ic svg'); const r=ic?ic.getBoundingClientRect():null; const logical=r?r.width/(window.__fitScale||1):0; cf.style.display=prev; return logical>=26?1:0})()" 2>/dev/null | tail -1)
ck "آیکون چراغ‌قوه SVG درشت (منطقی ≥ ۲۶px)" "$R" "w=$(agent-browser eval "(()=>{const cf=document.getElementById('ctlFlash'); const prev=cf.style.display; cf.style.display='flex'; const ic=cf.querySelector('.ic svg'); const r=ic?ic.getBoundingClientRect():null; const logical=r?r.width/(window.__fitScale||1):0; cf.style.display=prev; return Math.round(logical)})()" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const b=document.getElementById('ctlFlash'); return b.querySelector('img.ic30')?0:1})()" 2>/dev/null | tail -1)
ck "PNG قدیمی چراغ‌قوه حذف شده" "$R"
R=$(agent-browser eval "(()=>{const h=document.getElementById('bpHead'); return h.getBoundingClientRect().height>=38?1:0})()" 2>/dev/null | tail -1)
ck "سربرگ داک درشت‌تر (≥۳۸px — لمس آسان)" "$R"

echo "===== ۸) «ذخیره شد» سریع‌تر ====="
agent-browser eval "MYST.clues.length=1; pauseGame(); saveAndExit(); 'ok'" >/dev/null 2>&1
sleep 0.9
R=$(agent-browser eval "(()=>{const a=document.getElementById('announce'); return a&&+a.style.opacity===1?1:0})()" 2>/dev/null | tail -1)
ck "«ذخیره شد» هنوز دیده می‌شود (~۰٫۹s)" "$R"
sleep 0.9
R=$(agent-browser eval "(()=>{const a=document.getElementById('announce'); return a&&+a.style.opacity===0?1:0})()" 2>/dev/null | tail -1)
ck "«ذخیره شد» تا ۱٫۸s محو شده (سریع)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots32/menu32.png >/dev/null 2>&1

echo "===== ۹) رگرسیون — داک لمسی + جریان روز/شب ====="
to_day4
agent-browser eval "document.getElementById('wrap').classList.add('touch'); toggleBuildPanel(); 'ok'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "(()=>{const p=document.getElementById('buildPanel'); const r=p.getBoundingClientRect(); const sc=window.__fitScale||1; const lw=r.width/sc; return lw>=380?1:0})()" 2>/dev/null | tail -1)
ck "داک در لمس: عرض ≥ ۳۸۰px منطقی (نه ستون ۲۱۰px)" "$R" "logicalW=$(agent-browser eval "(()=>{const r=document.getElementById('buildPanel').getBoundingClientRect(); return Math.round(r.width/(window.__fitScale||1))})()" 2>/dev/null | tail -1)"
R=$(agent-browser eval "(()=>{const l=document.getElementById('bpList'); return getComputedStyle(l).flexWrap==='wrap'?1:0})()" 2>/dev/null | tail -1)
ck "ردیف کاشی‌ها wrap می‌شود (بدون اسکرول افقی)" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots32/dock_touch32.png >/dev/null 2>&1
R=$(agent-browser eval "(()=>{const n=document.querySelectorAll('#bpList .bp-tile').length; const vis=Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>{const cs=getComputedStyle(t); const r=t.getBoundingClientRect(); return cs.display!=='none'&&r.width>0}).length; return vis>=4&&vis<=5?1:0})()" 2>/dev/null | tail -1)
ck "تب ارتقاء: ۵ کاشی قابل دیدن" "$R" "vis=$(agent-browser eval "(()=>{return Array.from(document.querySelectorAll('#bpList .bp-tile')).filter(t=>{const cs=getComputedStyle(t); const r=t.getBoundingClientRect(); return cs.display!=='none'&&r.width>0}).length})()" 2>/dev/null | tail -1)"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
[ $F -eq 0 ] && echo "ALL GREEN ✔" || echo "FAILURES: $F"
