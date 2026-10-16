#!/bin/bash
# تست نسخه‌ی ۲۸٫۰ — رفع باگ‌ها + UI جدید + رگرسیون
URL="http://localhost:3002/three-floors-to-survival.html"
P=0; F=0
ck() { if [ "$2" = "1" ]; then P=$((P+1)); echo "  OK  $1"; else F=$((F+1)); echo "  FAIL  $1  ($3)"; fi }

agent-browser close --all >/dev/null 2>&1; sleep 0.5
mkdir -p /home/z/my-project/scripts/shots28t
agent-browser set viewport 780 360 >/dev/null
agent-browser open "$URL" >/dev/null
for i in $(seq 1 40); do
  R=$(agent-browser eval "typeof GAME!=='undefined'&&typeof state!=='undefined'?state.mode:'no'" 2>/dev/null | tail -1)
  if [ "$R" != "no" ] && [ -n "$R" ]; then break; fi
  sleep 1
done

echo "===== ۱) فونت وزیرمتن ====="
R=$(agent-browser eval "document.fonts.check('16px Vazirmatn') && document.fonts.check('900 16px Vazirmatn')?1:0" | tail -1); ck "فونت وزیرمتن لود (۴۰۰+۹۰۰)" "$R"

echo "===== ۲) رفع صفحه‌ی سفید استوری‌موشن (rays27) ====="
R=$(agent-browser eval "(()=>{try{MG23.rays27(100,30,150,330,-0.5,0.05,'rgba(150,180,255,');return 'NOERR'}catch(e){return 'ERROR'}})()" | tail -1); ck "rays27 با hue خطا نمی‌دهد" "$(python3 -c "print(1 if 'NOERR' in '''$R''' else 0)")" "$R"
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 1.5
# پرش مستقیم به صحنه ۳ (پیدا کردن ساختمان) و بررسی رنگ پیکسل‌ها
agent-browser eval "INTRO.idx=2; INTRO.t=7.9; 'jump'" >/dev/null; sleep 2.2
for i in $(seq 1 12); do IDX=$(agent-browser eval "INTRO?INTRO.idx:'-'" | tail -1); [ "$IDX" = "3" ] && break; sleep 1.5; done
sleep 2
agent-browser screenshot /home/z/my-project/scripts/shots28t/t28_scene3.png >/dev/null 2>&1
W=$(python3 -c "
from PIL import Image
im = Image.open('/home/z/my-project/scripts/shots28t/t28_scene3.png').convert('RGB')
px = list(im.getdata()); n=len(px)
print(round(sum(1 for c in px if c[0]>230 and c[1]>230 and c[2]>230)/n*100,1))
" 2>/dev/null)
ck "صحنه‌ی ساختمان: بدون سفیدی (white%=$W)" "$(python3 -c "print(1 if float('$W' or 99)<20 else 0)")" "white%=$W"
sleep 4
agent-browser screenshot /home/z/my-project/scripts/shots28t/t28_scene3b.png >/dev/null 2>&1
W2=$(python3 -c "
from PIL import Image
im = Image.open('/home/z/my-project/scripts/shots28t/t28_scene3b.png').convert('RGB')
px = list(im.getdata()); n=len(px)
print(round(sum(1 for c in px if c[0]>230 and c[1]>230 and c[2]>230)/n*100,1))
" 2>/dev/null)
ck "صحنه‌ی ساختمان پایدار (white%=$W2)" "$(python3 -c "print(1 if float('$W2' or 99)<20 else 0)")" "white%=$W2"

echo "===== ۳) رد کردن با یک ضربه (رویداد لمس واقعی) ====="
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 3
R=$(agent-browser eval "
(() => {
  if (!DLG.active) return 'no-dlg';
  const btn = document.getElementById('skipCs');
  const r = btn.getBoundingClientRect();
  btn.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, cancelable:true, pointerId:1, pointerType:'touch', clientX:r.x+r.width/2, clientY:r.y+r.height/2}));
  btn.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, cancelable:true, pointerId:1, pointerType:'touch'}));
  btn.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true}));
  return 'tapped';
})()" | tail -1)
sleep 1.2
R2=$(agent-browser eval "state.mode" | tail -1)
ck "یک ضربه = پرش کامل (حالت: $R2)" "$( [ "$R2" != '"intro"' ] && echo 1 || echo 0 )" "mode=$R2"
# لمس بوم هنوز خط گفتگو را جلو می‌برد
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 2.5
agent-browser eval "
(() => { const cv = document.getElementById('game');
  cv.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true, cancelable:true, pointerId:4, pointerType:'touch', clientX:400, clientY:200}));
  cv.dispatchEvent(new PointerEvent('pointerup', {bubbles:true, cancelable:true, pointerId:4, pointerType:'touch'}));
  return 'ok'; })()" >/dev/null
R=$(agent-browser eval "DLG.active?1:0" | tail -1); ck "لمس بوم: گفتگو همچنان جلو می‌رود" "$R"

echo "===== ۴) ورود به بازی ====="
agent-browser eval "wipeSave(); GAME.v10.startIntroCine(); 'ok'" >/dev/null; sleep 1.2
agent-browser eval "GAME.v10.skipIntro(); 'ok'" >/dev/null; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 0.8
agent-browser eval "GAME.skipToWave(2); 'ok'" >/dev/null 2>&1; sleep 3
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
agent-browser eval "DLG.skip(); 'ok'" >/dev/null 2>&1; sleep 2
R=$(agent-browser eval "state.mode" | tail -1); ck "بازی جریان دارد" "$( [ "$R" != '"start"' ] && echo 1 || echo 0 )" "mode=$R"
# حالت خدا: برج نامیرا + زامبی/صف تولد پاک — تست‌ها قطعی می‌شوند
agent-browser eval "state.tower.maxHp=999999; state.tower.hp=999999; state.zombies=[]; state.spawn.queue=[]; state.spawn.timer=99999; state.blackout&&(state.blackout.schedule=[]); 'god'" >/dev/null 2>&1
agent-browser eval "updateHUD(); 'hud'" >/dev/null 2>&1

echo "===== ۵) سلاح‌ها — مالکیت دائمی + تعویض آزاد ====="
agent-browser eval "state.coins=600; 'ok'" >/dev/null
agent-browser eval "attemptBuy('shotgun'); 'ok'" >/dev/null
R=$(agent-browser eval "WEAPONS.shotgun.owned && WEAPONS.pistol.owned?1:0" | tail -1); ck "خرید شاتگان: کلت می‌ماند (تحویل حذف)" "$R"
R=$(agent-browser eval "document.getElementById('wchip28-pistol') && document.getElementById('wchip28-shotgun') && document.getElementById('wchip28-mg')?1:0" | tail -1); ck "چیپ‌های سلاح موجودند" "$R"
agent-browser eval "selectWeapon('pistol'); 'ok'" >/dev/null
R=$(agent-browser eval "state.weapon==='pistol'?1:0" | tail -1); ck "برگشت به کلت ممکن شد" "$R"
agent-browser eval "selectWeapon('shotgun'); fireTimer=0; tryShoot(); 'ok'" >/dev/null
R=$(agent-browser eval "state.weapon==='shotgun' && state.bullets.length>=6?1:0" | tail -1); ck "شاتگان شلیک می‌کند (۶+ ساچمه)" "$R"
agent-browser eval "selectWeapon('pistol'); fireTimer=0; tryShoot(); 'ok'" >/dev/null
R=$(agent-browser eval "state.weapon==='pistol' && state.bullets.length>=7?1:0" | tail -1); ck "پس از تعویض، شلیک برمی‌گردد (باگ شلیک رفع)" "$R"
# پادبان سلاح نامعتبر
R=$(agent-browser eval "(()=>{const sv=state.weapon, so=WEAPONS.shotgun.owned; WEAPONS.shotgun.owned=false; state.weapon='shotgun'; fireTimer=0; tryShoot(); const ok=state.weapon==='pistol' && state.bullets.length>0; WEAPONS.shotgun.owned=so; state.weapon=sv; return ok?1:0})()" | tail -1); ck "پادبان: سلاح نامعتبر → کلت + شلیک" "$R"
# چیپ در دست
agent-browser eval "selectWeapon('shotgun'); 'ok'" >/dev/null
R=$(agent-browser eval "document.getElementById('wchip28-shotgun').classList.contains('on') && document.getElementById('wchip28-pistol').classList.contains('on')===false?1:0" | tail -1); ck "چیپ سلاحِ در دست = روشن طلایی" "$R"
R=$(agent-browser eval "(()=>{const t=document.getElementById('bp-shotgun'); return t && t.classList.contains('armed')?1:0})()" | tail -1); ck "کاشی شاتگان: حالت «در دست» (v35: قاب طلایی، بی‌متن)" "$R"

echo "===== ۶) باتن‌شیت ساخت‌وساز + FAB ====="
# شیت را ببند تا FAB قابل اندازه‌گیری باشد + گفتگو نماند
agent-browser eval "DLG.skip(); setBuildPanel(true); 'closed'" >/dev/null 2>&1; sleep 0.4
R=$(agent-browser eval "(()=>{const n=document.getElementById('bpNight'); if(!n) return 0; const cs=getComputedStyle(n); const b=parseFloat(cs.bottom)||999, r=parseFloat(cs.right)||999; return b<60 && r<60?1:0})()" | tail -1); ck "(۳۰) «شب شود» گوشه‌ی پایین-راست (جای FAB — حین نبرد مخفی است)" "$R" "css=$(agent-browser eval "(()=>{const cs=getComputedStyle(document.getElementById('bpNight')); return cs.bottom+'/'+cs.right})()" | tail -1)"

echo "===== ۷) کوله‌پشتی — پایین-چپ بدون متن وسط ====="
agent-browser eval "DLG.skip(); setBuildPanel(true); 'closed'" >/dev/null 2>&1; sleep 0.3
R=$(agent-browser eval "(()=>{const b=document.getElementById('bpkBtn34'); return b && getComputedStyle(b).display!=='none'?1:0})()" | tail -1); ck "کوله: دکمه‌ی ریل چپ (v34+، وسط ریل در v36)" "$R"
R=$(agent-browser eval "document.getElementById('bpkCap').textContent.includes('کوله خالی')?0:1" | tail -1); ck "متن «کوله خالی» حذف شد" "$R"

echo "===== ۸) HUD اندرویدی ====="
R=$(agent-browser eval "(()=>{const h=document.getElementById('healthBar'); const s=getComputedStyle(h); return parseFloat(s.borderRadius)>=90?1:0})()" | tail -1); ck "نوار جان: قاب گرد پیل" "$R"
R=$(agent-browser eval "(()=>{const el=document.querySelector('#hud .hud-item[title=\"مرحله\"]'); return el?1:0})()" | tail -1); ck "چیپ مرحله موجود" "$R"
R=$(agent-browser eval "(()=>{const b=document.querySelector('.ctl-btn.hud-pause'); const s=getComputedStyle(b); return parseFloat(s.borderRadius)>=10 && s.background.includes('gradient')?1:0})()" | tail -1); ck "دکمه استپ: متریال گرادیانی" "$R"

echo "===== ۹) منوی توقف — ادامه + ذخیره و خروج ====="
agent-browser eval "pauseGame(); 'ok'" >/dev/null; sleep 0.7
R=$(agent-browser eval "!document.getElementById('pauseScreen').classList.contains('hidden')?1:0" | tail -1); ck "منوی توقف باز شد" "$R"
R=$(agent-browser eval "document.getElementById('btnRestart0')?0:1" | tail -1); ck "«شروع دوباره» از توقف حذف شد" "$R"
R=$(agent-browser eval "document.getElementById('btnResume') && document.getElementById('btnSaveExit')?1:0" | tail -1); ck "ادامه + ذخیره و خروج موجود" "$R"
R=$(agent-browser eval "document.querySelector('#pauseScreen .m27-mini-row')?0:1" | tail -1); ck "ردیف کوچک حذف شد (v29: فقط ادامه+سیو)" "$R"
R=$(agent-browser eval "(()=>{const b=document.getElementById('btnResume'); const r=b.getBoundingClientRect(); return r.height>=50?1:0})()" 2>&1 | tail -1); ck "ادامه: دکمه درشت ≥۵۰px" "$R"
agent-browser screenshot /home/z/my-project/scripts/shots28t/t28_pause.png >/dev/null 2>&1
agent-browser eval "resumeGame(); 'ok'" >/dev/null; sleep 0.4

echo "===== ۱۰) صفحه‌ی باخت — کارت متریال ====="
R=$(agent-browser eval "document.querySelector('#gameoverScreen .m28-card')?1:0" | tail -1); ck "کارت m28 باخت موجود" "$R"
R=$(agent-browser eval "document.querySelector('#gameoverScreen .m28-skull')?1:0" | tail -1); ck "جمجمه‌ی درخشان موجود" "$R"
R=$(agent-browser eval "(()=>{const g=document.getElementById('goStats'); return g && g.innerHTML.includes('m28-stat')?1:0})()" | tail -1); ck "آمار = چیپ" "$R"

echo "===== ۱۱) رگرسیون — ارث ۲۷ ====="
R=$(agent-browser eval "typeof COIN27==='string' && COIN27.startsWith('data:image/png')?1:0" | tail -1); ck "سکه واقعی COIN27" "$R"
R=$(agent-browser eval "typeof VOICES23!=='undefined' && Object.keys(VOICES23).length===151?1:0" | tail -1); ck "۱۵۱ خط صدا (۱۱۹+۳۲ جدید)" "$R"
R=$(agent-browser eval "!document.getElementById('btnSaveCode') && !document.getElementById('saveCodeScreen')?1:0" | tail -1); ck "کد سیو حذف" "$R"
R=$(agent-browser eval "(()=>{const s=document.getElementById('startScreen'); return s && !s.textContent.includes('نسخه')?1:0})()" | tail -1); ck "منو بدون نسخه" "$R"
R=$(agent-browser eval "(()=>{const s=MG23.building23.toString(); return s.includes('[136, 124, 112]')?1:0})()" | tail -1); ck "ساختمان استوری = برج بازی" "$R"
R=$(agent-browser eval "(()=>{const o=drawPlacing.toString(); return o.includes('Math.round')?1:0})()" | tail -1); ck "چیدن برجک snap" "$R"
R=$(agent-browser eval "(()=>{for(const ss of document.styleSheets){try{for(const r of ss.cssRules){if(r.selectorText==='#pedReopenBtn'&&r.cssText.includes('296px'))return 1}}catch(e){}}return 0})()" | tail -1); ck "پیل دستفروش شیار ۴" "$R"
R=$(agent-browser eval "typeof Snd!=='undefined' && Snd.ctx && Snd.ctx.onstatechange!==null?1:0" | tail -1); ck "نگهبان صدا فعال" "$R"

echo "===== ۱۲) صداهای بازسازی‌شده (لحن موقعیت) ====="
R=$(agent-browser eval "(()=>{const v=VOICES23.aw1; return v && v.d>1.2 && v.a.length>4000?1:0})()" | tail -1); ck "کلیپ aw1 (فوری) تازه" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES23.c4v4; return v && v.d>1.5 && v.a.length>4000?1:0})()" | tail -1); ck "کلیپ c4v4 (ترس) تازه" "$R"
R=$(agent-browser eval "(()=>{const v=VOICES23.t1a1; return v && v.d>1.4 && v.a.length>4000?1:0})()" | tail -1); ck "کلیپ t1a1 (وحشت) تازه" "$R"

echo ""
echo "======================================"
echo "RESULT: $P OK / $F FAIL"
echo "======================================"
agent-browser close --all >/dev/null 2>&1
exit $F
