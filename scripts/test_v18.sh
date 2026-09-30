#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۸٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + موج‌های ۴/۶/۸/۱۰ + حذف backdrop-filter
#  ۱) افتتاحیه محاوره‌ای (رگرسیون) + کارایی گفتگو (FPS)
#  ۲) صداهای بازتولیدشده (t1n1/aw5) + متن‌های منطقی جدید
#  ۳) ارشان روی بام: جای جدید + پایین‌رفتن با ترک + برگشتن
#  ۴) مینی‌گیم رانندگی: فرمان/ترمز/گاز/برخورد/آیتم + صندلی‌ها
#  ۵) مرزهای فصل: انتقال در موج ۴/۱۰/۱۸ + باس در ۲۸
#  ۶) سیو قدیمی ۳۳موجی + تونل/زیپ‌لاین + بدون خطای کنسول
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=/home/z/my-project/scripts/shots18
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری + ساختار موج‌های جدید ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v18 API (v17 ارث)" "$(ev 'typeof GAME.v17')" "object"
chk "موج‌های فصل‌ها ۴/۶/۸/۱۰" "$(ev 'JSON.stringify(GAME.v10.WAVES_CH)')" "[4,6,8,10]"
chk "موج آخر = ۲۸" "$(ev 'GAME.v10.FINAL_WAVE')" "28"
chk "مرز فصل‌ها (4,10,18,28)" "$(ev '[4,10,18,28].map(GAME.v10.waveChapter).join(",")')" "1,2,3,4"
chk "موج درون‌فصلی (5,11,19)" "$(ev '[5,11,19].map(GAME.v10.waveInChapter).join(",")')" "1,1,1"
chk "سختی: اول فصل = ۱" "$(ev 'GAME.v10.wvEff(5).toFixed(1)')" "1.0"
chk "سختی: آخر فصل = ۸" "$(ev 'GAME.v10.wvEff(10).toFixed(1)')" "8.0"
chk "سختی: آخرین شب = ۸" "$(ev 'GAME.v10.wvEff(28).toFixed(1)')" "8.0"
chk "سیو ۳۳موجی → ۲۸" "$(ev 'GAME.v10.compatWave(33)')" "28"
chk "هیچ عنصری backdrop-filter ندارد" "$(ev 'Array.from(document.querySelectorAll("#wrap, #wrap *")).filter(e=>{try{return getComputedStyle(e).backdropFilter!="none"}catch(x){return false}}).length')" "0"
chk "بدون خطای کنسول (بارگذاری)" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo "===== ۱) افتتاحیه + کارایی گفتگو ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
TXT=""
for i in $(seq 1 32); do
  M=$(ev 'GAME.state.mode'); L=$(ev 'document.getElementById("dlgText").textContent.length')
  if [ "$M" = "intro" ] && [ "$L" -gt 3 ] 2>/dev/null; then TXT=1; break; fi
  sleep 0.4
done
chk "گفتگوی افتتاحیه زنده است" "$TXT" "1"
chk "راوی اولین خط را می‌گوید" "$(evr 'document.getElementById("dlgWho").textContent')" "راوی"
chk "دیالوگ محاوره‌ای (اومد وسط)" "$(ev 'GAME.v11.INTRO_DLGS[0][0].text.indexOf("اومد وسط") >= 0')" "true"
# سنجش FPS حین تایپ فعال (قبلاً با backdrop-filter می‌افتاد)
agent-browser eval "
window.__P={samples:[]};
(function(){const r=requestAnimationFrame;let last=0;
 function probe(t){r(probe);if(last){__P.samples.push(t-last);}last=t;}
 r(probe);})();
'done'" >/dev/null
sleep 7
FPS=$(agent-browser eval "(function(){const s=__P.samples;if(!s.length)return 0;return Math.round(1000/(s.reduce((a,b)=>a+b,0)/s.length));})()" | tr -d '"\n ')
if [ "$FPS" -ge 50 ] 2>/dev/null; then ok "FPS حین گفتگوی فعال = $FPS (≥50)"; else bad "FPS گفتگو" "$FPS"; fi
agent-browser screenshot $S/01_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 2.5
chk "بعد از رد کردن → بازی" "$(ev 'GAME.state.mode === "playing" || GAME.state.mode === "intermission"')" "true"

echo "===== ۲) صداهای بازتولیدشده + متن منطقی ====="
chk "t1n1 تازه (طناب)" "$(ev 'TR_DLGS[1][1].text.indexOf("طناب") >= 0')" "true"
chk "t1n1 قدیمی حذف شد (از قبل رفته بود)" "$(ev 'TR_DLGS[1][1].text.indexOf("از قبل رفته بود") === -1')" "true"
chk "aw5 تازه (می‌رم پایین)" "$(ev 'GAME.v17.ARSHAN_BARKS.aw5.text.indexOf("می‌رم پایین") >= 0')" "true"
chk "کلیپ t1n1 (~۶٫۱ث)" "$(ev 'Math.abs(GAME.v13.VOICES.t1n1.d - 6.14) < 1.2')" "true"
chk "کلیپ aw5 (~۴٫۸ث)" "$(ev 'Math.abs(GAME.v13.VOICES.aw5.d - 4.78) < 1.2')" "true"
chk "۶۳ کلیپ صوتی کامل (۱۹٫۰)" "$(ev 'GAME.v13.clipCount')" "63"

# (۱۸٫۰) نگاشت دقیق بوم → صفحه (بازی در ویوپورت اسکیل می‌شود)
getrect() { agent-browser eval "(()=>{const r=document.getElementById('game').getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(x=>Math.round(x*100)/100).join('|')})()" | tr -d '"'; }

echo "===== ۳) ارشان روی بام برج ====="
chk "منو: ارشان روی بام دیده می‌شود" "$(ev 'GAME.v17.arshanOnRoof()')" "true"
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
sleep 2
chk "افتتاحیه: ارشان پشت صحنه است" "$(ev 'GAME.v17.arshanOnRoof()')" "false"
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 2
agent-browser eval "GAME.startNight()" >/dev/null
sleep 5
chk "شب: ارشان روی بام است" "$(ev 'GAME.v17.arshanOnRoof()')" "true"
chk "موج ۱ فصل ۱ (۴موجی)" "$(evr 'waveLabel()')" "فصل ۱ • موج ۱/۴"
agent-browser eval "GAME.v17.arshanForce('aw5')" >/dev/null
sleep 0.4
chk "بارک aw5 جدید (می‌رم پایین)" "$(evr 'document.getElementById("announce").textContent.indexOf("می‌رم پایین") >= 0')" "true"
agent-browser screenshot $S/02_arshan_roof_night.png >/dev/null
# پایین‌رفتن با ترک برج
agent-browser eval "GAME.hurt(75)" >/dev/null
sleep 1.2
chk "برج ترک خورد → ارشان پایین رفت" "$(ev 'GAME.v17.ARSHAN.vis < 0.15')" "true"
# هیسترزیس: کمی جون بالا (۳۸٪) → هنوز پایین
agent-browser eval "GAME.state.tower.hp = GAME.state.tower.maxHp * 0.38" >/dev/null
sleep 1
chk "هیسترزیس: هنوز پایین (۳۸٪)" "$(ev 'GAME.v17.ARSHAN.vis < 0.5')" "true"
# تعمیر کامل → برگشت
agent-browser eval "GAME.state.tower.hp = GAME.state.tower.maxHp" >/dev/null
sleep 2
chk "تعمیر → ارشان برگشت روی بام" "$(ev 'GAME.v17.arshanOnRoof()')" "true"
agent-browser eval "GAME.endWave()" >/dev/null
sleep 2
chk "روز: ارشان روی بام است" "$(ev 'GAME.v17.arshanOnRoof()')" "true"
agent-browser screenshot $S/03_arshan_roof_day.png >/dev/null
# پیکسل: کلاه قرمز روی بام (جهان ~518, 492-198-33) — بالای خط کنگره‌ها
RECT=$(getrect)
PIX=$(RECT="$RECT" python3 - << 'PYEOF'
import os
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/03_arshan_roof_day.png').convert('RGB')
W, H = img.size
L, T, CW, CH = map(float, os.environ['RECT'].split('|'))
kx = CW / 960.0
ky = CH / 560.0
n = 0
for dx in range(-16, 17):
    for dy in range(-40, 6):
        sx, sy = int(L + kx * (518 + dx)), int(T + ky * (294 + dy))
        if 0 <= sx < W and 0 <= sy < H:
            r, g, b = img.getpixel((sx, sy))
            if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                n += 1
print('redcap=' + str(n))
PYEOF
)
chk "کلاه قرمز ارشان روی بام (پیکسل)" "$(echo $PIX | awk -F= '{print ($2>=4)?"YES":"NO"}')" "YES"
# در انتقال، ارshan نباید روی بام باشد
agent-browser eval "GAME.state.tower.hp = 900; GAME.v10.startTransition(1)" >/dev/null
sleep 1.5
chk "انتقال: ارشان کنار بازیکن است (نه بام)" "$(ev 'GAME.v17.arshanOnRoof()')" "false"

echo "===== ۴) مینی‌گیم رانندگی + صندلی‌های درست ====="
agent-browser eval "GAME.v10.trGoto(8.0)" >/dev/null
chk "تم رانندگی فعال" "$(ev 'MG.cfg.theme')" "drive"
chk "فیزیک DRV آماده" "$(ev 'DRV.speed > 500 && DRV.obs.length > 0')" "true"
# فرمان صفر → ماشین دقیقاً وسط (برای چک پیکسلی صندلی‌ها)
agent-browser eval "DRV.steer=0; DRV.px=roadCXf(DRV.T)" >/dev/null
sleep 0.3
agent-browser screenshot $S/04_drive_car.png >/dev/null
# صندلی‌ها: بازیکن راننده چپ (کلاه تیره)، ارشان راست (کلاه قرمز)
RECT2=$(getrect)
SEAT=$(RECT="$RECT2" python3 - << 'PYEOF'
import os
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots18/04_drive_car.png').convert('RGB')
W, H = img.size
L, T, CW, CH = map(float, os.environ['RECT'].split('|'))
kx = CW / 960.0
ky = CH / 560.0
# ماشین: cx=480 → سر بازیکن (428, 450) و ارشان (532, 450)
Lred = Rred = Ldark = Lskin = 0
for dx in range(-8, 9):
    for dy in range(-8, 9):
        for side, x0 in (('L', 428), ('R', 532)):
            sx, sy = int(L + kx * (x0 + dx)), int(T + ky * (450 + dy))
            if 0 <= sx < W and 0 <= sy < H:
                r, g, b = img.getpixel((sx, sy))
                if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                    if side == 'L': Lred += 1
                    else: Rred += 1
                if r < 75 and 30 < g < 85 and 60 < b < 130 and b > r:
                    if side == 'L': Ldark += 1
                if r > 200 and g > 150 and 100 < b < 200:
                    if side == 'L': Lskin += 1
print('Lred=%d Rred=%d Ldark=%d Lskin=%d' % (Lred, Rred, Ldark, Lskin))
PYEOF
)
chk "ارشان (کلاه قرمز) سمت راست" "$(echo $SEAT | awk '{print ($2 ~ /Rred=([1-9][0-9])/) ? "YES":"NO"}')" "YES"
chk "بازیکن (کلاه تیره) راننده‌ی چپ" "$(echo $SEAT | awk '{print ($3 ~ /Ldark=([1-9][0-9])/) ? "YES":"NO"}')" "YES"
chk "سمت چپ کلاه قرمز نیست" "$(echo $SEAT | awk '{print ($1 ~ /Lred=[0-9][0-9]$/) ? "NO":"YES"}')" "YES"
# فرمان/ترمز/گاز
agent-browser eval "GAME.v10.trResume()" >/dev/null
sleep 0.4
agent-browser eval "mgNudge(0); DRV.px = roadCXf(DRV.T); DRV.steer = 0; DRV.hitCool = 0" >/dev/null
PX0=$(ev 'Math.round(DRV.px)')
agent-browser eval "mgNudge(1)" >/dev/null
sleep 0.8
PX1=$(ev 'Math.round(DRV.px)')
agent-browser eval "mgNudge(0)" >/dev/null
if [ "$PX1" -gt "$((PX0 + 500))" ] 2>/dev/null; then ok "فرمان ←/→ (+$((PX1-PX0)))"; else bad "فرمان" "$PX0 → $PX1"; fi
agent-browser eval "DRV.px = roadCXf(DRV.T); DRV.offroad = 0; DRV.hitCool = 99; DRV.speed = 2400" >/dev/null
sleep 0.3
agent-browser eval "mgBrake(true)" >/dev/null
sleep 0.9
SP1=$(ev 'Math.round(DRV.speed)')
agent-browser eval "mgBrake(false); DRV.px = roadCXf(DRV.T); DRV.offroad = 0; mgGas(true)" >/dev/null
sleep 1.0
SP2=$(ev 'Math.round(DRV.speed)')
agent-browser eval "mgGas(false); DRV.hitCool = 0" >/dev/null
if [ "$SP1" -lt 2100 ] 2>/dev/null; then ok "ترمز (2400 → $SP1)"; else bad "ترمز" "$SP1"; fi
if [ "$SP2" -gt "$((SP1 + 600))" ] 2>/dev/null; then ok "گاز ($SP1 → $SP2)"; else bad "گاز" "$SP1 → $SP2"; fi
# برخورد + آیتم مخفی
H0=$(ev 'DRV.hits')
agent-browser eval "const o=DRV.obs.find(o=>!o.hit); if(o){o.k=Math.ceil((DRV.T+880)/600); o.wx=DRV.px}" >/dev/null
sleep 0.8
H1=$(ev 'DRV.hits')
if [ "$H1" -gt "$H0" ] 2>/dev/null; then ok "برخورد ثبت شد ($H0 → $H1)"; else bad "برخورد" "$H0 → $H1"; fi
agent-browser eval "DRV.hidden.got=false; DRV.hidden.T=DRV.T+900; DRV.hidden.lane=0.3; DRV.px=roadCXf(DRV.hidden.T)+0.3*880; DRV.itemHinted=true" >/dev/null
sleep 0.9
chk "آیتم مخفی جمع شد" "$(ev 'DRV.hidden.got')" "true"
chk "آیتم به کوله رفت" "$(ev 'GAME.state.backpack.some(x=>x)')" "true"
agent-browser eval "DRV.T = DRV.goalT - 60" >/dev/null
sleep 1.2
chk "پایان مسیر → فاز ۳" "$(ev 'TR.phase')" "3"
agent-browser eval "GAME.v10.trGoto(4.5)" >/dev/null
sleep 1
chk "رسیدن به فصل ۲" "$(ev 'GAME.state.mode + "/" + GAME.state.chapter')" "day/2"

echo "===== ۵) مرزهای فصل جدید ====="
agent-browser eval "GAME.skipToWave(9); GAME.startNight()" >/dev/null
sleep 4
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.5
chk "پایان موج ۹ (وسط فصل ۲) → روز" "$(ev 'GAME.state.mode')" "day"
agent-browser eval "GAME.skipToWave(10); GAME.startNight()" >/dev/null
sleep 4
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.5
chk "پایان موج ۱۰ (آخر فصل ۲) → انتقال قایق" "$(ev "GAME.state.mode + '/' + (GAME.v10.TR ? GAME.v10.TR.ch : 0)")" "transition/2"
agent-browser eval "GAME.v10.trGoto(7.0); GAME.v10.trResume()" >/dev/null
sleep 0.6
chk "قایق: فاز ۲ + تم رودخانه (۱۹٫۰)" "$(ev "TR.phase + '/' + DRV.theme")" "2/river"
agent-browser screenshot $S/05_boat.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 1
agent-browser eval "GAME.skipToWave(18); GAME.startNight()" >/dev/null
sleep 4
agent-browser eval "GAME.endWave()" >/dev/null
sleep 1.5
chk "پایان موج ۱۸ (آخر فصل ۳) → انتقال اسنوموبیل" "$(ev "GAME.state.mode + '/' + (GAME.v10.TR ? GAME.v10.TR.ch : 0)")" "transition/3"
agent-browser eval "GAME.v10.trGoto(7.2); GAME.v10.trResume()" >/dev/null
sleep 0.6
chk "اسنوموبیل: فاز ۲ + تم برفی (۱۹٫۰)" "$(ev "TR.phase + '/' + DRV.theme")" "2/snow"
agent-browser screenshot $S/06_snow.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 1
chk "بعد از زیپ‌لاین → فصل ۴" "$(ev 'GAME.state.chapter')" "4"
chk "آخرین شب = موج ۲۸ (باس)" "$(ev 'JSON.stringify(GAME.v10.buildWaveQueue(28))')" "boss"

echo "===== ۶) سیو قدیمی + رگرسیون کلی ====="
agent-browser eval "GAME.v10.saveGame()" >/dev/null
chk "سیو کار می‌کند" "$(ev 'GAME.v10.loadSaveData() !== null')" "true"
agent-browser eval "localStorage.setItem('ttb3_save_v1', JSON.stringify({v:1,chapter:4,wave:33,coins:777,hp:900,maxHp:1000,upgrades:{weapon:3,health:0,trap:0,turretUp:0,speed:0},weapon:'mg',owned:{shotgun:true,mg:true},turrets:[],backpack:['medkit',null,null,null,null,null],flash:{owned:true,battery:80},buffs:{},peddlerCd:0,weaponSpent:0,stats:{kills:100,earned:900,shots:50,maxCombo:9,turKills:3}}))" >/dev/null
agent-browser eval "GAME.v10.continueGame()" >/dev/null
sleep 3
chk "سیو ۳۳موجی خوانده شد (موج ۲۸)" "$(ev "GAME.state.mode + '/' + (GAME.state.wave + 1)")" "day/28"
chk "سکه‌های سیو حفظ شد" "$(ev 'GAME.state.coins')" "777"
chk "بدون خطای کنسول (پایان)" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo
echo "=========================================="
echo "PASS=$PASS  FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "همه‌ی تست‌های ۱۸٫۰ گذرنده ✔" || echo "شکست در تست‌ها!"
