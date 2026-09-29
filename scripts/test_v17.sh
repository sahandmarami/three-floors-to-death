#!/bin/bash
# ============================================================
# تست خودکار نسخه‌ی ۱۷٫۰ — سه طبقه تا بقا
#  ۰) بارگذاری + API v17 + ۴۵ کلیپ + دیالوگ محاوره‌ای
#  ۱) افتتاحیه: متن محاوره‌ای زنده (DOM) + پرتره + جریان
#  ۲) صداهای تازه (aw1..aw6 / d1a1 / d1a2 / t1n1)
#  ۳) مینی‌گیم رانندگی شبه‌سه‌بعدی: فرمان/گاز/ترمز/برخورد/
#     آیتم مخفی/پایان → فصل ۲
#  ۴) ارشان روی برج: بارک اجباری + طبیعی + انیمیشن + پیکسل کلاه
#  ۵) تونل/زیپ‌لاین: عمق (dp) + پرش (رگرسیون)
#  ۶) رگرسیون کلی + بدون خطای کنسول
# ============================================================
URL="file:///home/z/my-project/download/three-floors-to-survival.html"
S=scripts/shots17
mkdir -p $S
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  OK  $1"; }
bad()  { FAIL=$((FAIL+1)); echo "  XX  $1 -> got: $2"; }
chk()  { if echo "$2" | grep -q "$3"; then ok "$1"; else bad "$1" "$2"; fi; }
ev()   { agent-browser eval "$1" | tr -d '"\n '; }
evr()  { agent-browser eval "$1" | tr -d '"'; }

echo "===== ۰) بارگذاری و دگرگونی‌های ۱۷ ====="
agent-browser close --all >/dev/null 2>&1
sleep 0.5
agent-browser set viewport 1100 640 >/dev/null
agent-browser open "$URL" >/dev/null
sleep 3
agent-browser errors --clear >/dev/null 2>&1
chk "GAME.v17 API" "$(ev 'typeof GAME.v17')" "object"
chk "۴۵ کلیپ صوتی" "$(ev 'GAME.v13.clipCount')" "45"
chk "دیالوگ ۱ محاوره‌ای (اومد وسطِ مون)" "$(ev 'GAME.v11.INTRO_DLGS[0][0].text.indexOf("اومد وسط") >= 0')" "true"
chk "دیالوگ ۸ محاوره‌ای (شبِ اوله)" "$(ev 'GAME.v11.INTRO_DLGS[3][1].text.indexOf("شبِ اوله") >= 0')" "true"
chk "دیالوگ ۱۱ محاوره‌ای (بعداً می‌گیم)" "$(ev 'GAME.v11.INTRO_DLGS[4][2].text.indexOf("بعداً می‌گیم") >= 0')" "true"
chk "متن ادبی قدیمی حذف شد (آغاز شد)" "$(ev 'JSON.stringify(GAME.v11.INTRO_DLGS).indexOf("آغاز شد") === -1')" "true"
chk "متن ادبی قدیمی حذف شد (می‌مانیم)" "$(ev 'JSON.stringify(GAME.v11.INTRO_DLGS).indexOf("می‌مانیم") === -1')" "true"
chk "متن ادبی قدیمی حذف شد (به سکوت نشستند)" "$(ev 'JSON.stringify(GAME.v11.INTRO_DLGS).indexOf("سکوت نشستند") === -1')" "true"
chk "بدون خطای کنسول (بارگذاری)" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo "===== ۱) افتتاحیه: متن زنده + پرتره ====="
agent-browser eval "GAME.v10.wipeSave()" >/dev/null
agent-browser eval "GAME.v10.startNewGame()" >/dev/null
TXT=""
for i in $(seq 1 32); do
  M=$(ev 'GAME.state.mode'); L=$(ev 'document.getElementById("dlgText").textContent.length')
  if [ "$M" = "intro" ] && [ "$L" -gt 3 ] 2>/dev/null; then TXT=1; break; fi
  sleep 0.4
done
chk "گفتگوی افتتاحیه شروع و تایپ شد" "$TXT" "1"
chk "راوی اولین خط را می‌گوید" "$(evr 'document.getElementById("dlgWho").textContent')" "راوی"
chk "متن در حال تایپ زنده است" "$(ev 'document.getElementById("dlgText").textContent.length > 2')" "true"
chk "پرتره‌ی راوی رندر می‌شود (پیکسل)" "$(agent-browser eval "(()=>{const c=document.getElementById('dlgPortrait');const d=c.getContext('2d').getImageData(30,30,36,36).data;let n=0;for(let i=0;i<d.length;i+=4){if(d[i]+d[i+1]+d[i+2]>90)n++}return n>40})()" | tr -d '"\n ')" "true"
agent-browser screenshot $S/02_intro_dlg.png >/dev/null
agent-browser eval "GAME.v10.skipIntro()" >/dev/null
sleep 2.5
chk "بعد از رد کردن → بازی" "$(ev 'GAME.state.mode === "playing" || GAME.state.mode === "intermission"')" "true"

echo "===== ۲) صداهای تازه‌ی ۱۷ ====="
for k in aw1 aw2 aw3 aw4 aw5 aw6 d1a1 d1a2 t1n1; do
  chk "کلیپ $k موجود" "$(ev "GAME.v13.VOICES.$k ? GAME.v13.VOICES.$k.d > 0.5 : false")" "true"
done
chk "i3a1 بازسازی شد (مدت جدید)" "$(ev 'Math.abs(GAME.v13.VOICES.i3a1.d - 4.68) < 1.5')" "true"

echo "===== ۳) مینی‌گیم رانندگی شبه‌سه‌بعدی ====="
agent-browser eval "GAME.state.tower.hp = 900; GAME.v10.startTransition(1)" >/dev/null
sleep 1
chk "گفتگوی فاز ۱ دو خطی شد (t1n1)" "$(ev 'GAME.v11.TR_DLGS ? 0 : 0; TR_DLGS[1].length')" "2"
chk "خط منطق فرار ارشان موجود" "$(ev 'TR_DLGS[1][1].v')" "t1n1"
agent-browser eval "GAME.v10.trGoto(8.0)" >/dev/null
chk "تم رانندگی فعال" "$(ev 'MG.cfg.theme')" "drive"
chk "فیزیک DRV آماده" "$(ev 'DRV.speed > 500 && DRV.obs.length > 0')" "true"
agent-browser eval "GAME.v10.trResume()" >/dev/null
sleep 0.4
agent-browser eval "mgNudge(0); DRV.px = roadCXf(DRV.T); DRV.steer = 0; DRV.hitCool = 0" >/dev/null
PX0=$(ev 'Math.round(DRV.px)')
agent-browser eval "mgNudge(1)" >/dev/null
sleep 0.8
PX1=$(ev 'Math.round(DRV.px)')
agent-browser eval "mgNudge(0)" >/dev/null
if [ "$PX1" -gt "$((PX0 + 500))" ] 2>/dev/null; then ok "فرمان ←/→ موقعیت افقی را می‌برد (+$((PX1-PX0)))"; else bad "فرمان" "$PX0 → $PX1"; fi
SP0=2400
agent-browser eval "mgNudge(0); DRV.px = roadCXf(DRV.T); DRV.offroad = 0; DRV.hitCool = 99; DRV.speed = 2400" >/dev/null
sleep 0.3
agent-browser eval "mgBrake(true)" >/dev/null
sleep 0.9
SP1=$(ev 'Math.round(DRV.speed)')
agent-browser eval "mgBrake(false); DRV.px = roadCXf(DRV.T); DRV.offroad = 0; mgGas(true)" >/dev/null
sleep 1.0
SP2=$(ev 'Math.round(DRV.speed)')
agent-browser eval "mgGas(false); DRV.hitCool = 0" >/dev/null
if [ "$SP1" -lt "$((SP0 - 300))" ] 2>/dev/null; then ok "ترمز سرعت را می‌گیرد ($SP0 → $SP1)"; else bad "ترمز" "$SP0 → $SP1"; fi
if [ "$SP2" -gt "$((SP1 + 600))" ] 2>/dev/null; then ok "گاز سرعت را می‌دهد ($SP1 → $SP2)"; else bad "گاز" "$SP1 → $SP2"; fi
chk "موانع با عمق زاده می‌شوند" "$(ev 'DRV.obs.length >= 3')" "true"
chk "موانع در جهان جابه‌جا می‌شوند (z متغیر)" "$(ev 'DRV.obs.some(o => o.k*600-DRV.T > 200 && o.k*600-DRV.T < 6000)')" "true"
agent-browser screenshot $S/01_drive_mid.png >/dev/null
# برخورد: یک مانع را دقیقاً جلوی ماشین بگذار
H0=$(ev 'DRV.hits')
agent-browser eval "const o=DRV.obs.find(o=>!o.hit); if(o){o.k=Math.ceil((DRV.T+880)/600); o.wx=DRV.px; o.type=o.type}" >/dev/null
sleep 0.8
H1=$(ev 'DRV.hits')
if [ "$H1" -gt "$H0" ] 2>/dev/null; then ok "برخورد با مانع ثبت شد ($H0 → $H1)"; else bad "برخورد" "$H0 → $H1"; fi
# آیتم مخفی: جعبه را جلوی ماشین بگذار
agent-browser eval "DRV.hidden.got=false; DRV.hidden.T=DRV.T+900; DRV.hidden.lane=0.3; DRV.px=roadCXf(DRV.hidden.T)+0.3*880; DRV.itemHinted=true" >/dev/null
sleep 0.9
chk "آیتم مخفی کنار جاده جمع شد" "$(ev 'DRV.hidden.got')" "true"
chk "آیتم به کوله رفت" "$(ev 'GAME.state.backpack.some(x=>x)')" "true"
agent-browser screenshot $S/01b_drive_item.png >/dev/null
# پایان مسیر → فاز ۳ → فصل ۲
agent-browser eval "DRV.T = DRV.goalT - 60" >/dev/null
sleep 1.2
chk "پایان مسیر → فاز ۳" "$(ev 'TR.phase')" "3"
agent-browser eval "GAME.v10.trGoto(4.5)" >/dev/null
sleep 1
chk "رسیدن به فصل ۲ (روز)" "$(ev 'GAME.state.mode + "/" + GAME.state.chapter')" "day/2"

echo "===== ۴) ارشان روی برج ====="
agent-browser eval "GAME.giveCoins(300); GAME.state.tower.hp = GAME.state.tower.maxHp" >/dev/null
agent-browser eval "GAME.startNight()" >/dev/null
sleep 3
chk "موج فصل ۲ شروع شد" "$(ev 'GAME.state.mode')" "playing"
chk "وضعیت ARSHAN فعال" "$(ev 'ARSHAN.playT > 0')" "true"
agent-browser eval "GAME.v17.arshanForce('aw2')" >/dev/null
sleep 0.5
chk "بارک ارشان (گروه بزرگ)" "$(evr 'document.getElementById("announce").textContent.indexOf("گروه بزرگ") >= 0')" "true"
chk "آخرین بارک ثبت شد" "$(ev 'ARSHAN.lastBark > 0')" "true"
# بارک طبیعی: برج کم‌جون
agent-browser eval "GAME.state.tower.hp = 25; ARSHAN.lastBark = GAME.state.time - 14; ARSHAN.flags.tower = undefined; GAME.state.zombies.forEach(z=>z.hp=9999)" >/dev/null
sleep 1.4
chk "بارک طبیعی (برج ترک خورد)" "$(evr 'document.getElementById("announce").textContent.indexOf("ترک خورده") >= 0')" "true"
agent-browser eval "GAME.state.tower.hp = 999" >/dev/null
# انیمیشن دیده‌بانی: زامبی دور → دوربین بالا
agent-browser eval "GAME.spawnType('normal'); GAME.state.zombies.forEach(z=>{z.hp=9999; z.x = 40})" >/dev/null
sleep 6
chk "انیمیشن دیده‌بانی/مهمات چرخه دارد" "$(ev 'ARSHAN.binoc > 0 || ARSHAN.ammo > 0 || ARSHAN.binocNext < 12')" "true"
agent-browser screenshot $S/03_arshan_night.png >/dev/null
# پیکسل کلاه در «روز» (بدون لایه‌ی تاریکی شب → قطعی)؛ شب با VLM تأیید می‌شود
agent-browser eval "GAME.endWave()" >/dev/null
sleep 2
chk "روز بعد از موج (برای پیکسل چک)" "$(ev 'GAME.state.mode')" "day"
agent-browser screenshot $S/03b_arshan_day.png >/dev/null
# پیکسل: کلاه قرمز ارشان روی لبه‌ی طبقه‌ی دوم
PIX=$(python3 - << 'PYEOF'
from PIL import Image
img = Image.open('/home/z/my-project/scripts/shots17/03b_arshan_day.png').convert('RGB')
W, H = img.size
OX, OY = (W - 960) // 2, (H - 560) // 2
# ارشان: جهان (480+44, 492-137) → کلاه ~ ۲۲px بالاتر (بازه‌ی وسیع + نور شب)
n = 0
for dx in range(-18, 19):
    for dy in range(-52, 12):
        sx, sy = OX + 524 + dx, OY + 355 + dy
        if 0 <= sx < W and 0 <= sy < H:
            r, g, b = img.getpixel((sx, sy))
            if 65 < r < 210 and g < 95 and b < 95 and (r - g) > 35:
                n += 1
print('redcap=' + str(n))
PYEOF
)
chk "کلاه قرمز ارشان دیده می‌شود (پیکسل)" "$(echo $PIX | awk -F= '{print ($2>=4)?"YES":"NO"}')" "YES"

echo "===== ۵) تونل و زیپ‌لاین: عمق + رگرسیون ====="
agent-browser eval "GAME.state.tower.hp = 900; GAME.endWave()" >/dev/null
sleep 1.5
agent-browser eval "GAME.startNight()" >/dev/null
sleep 2.5
agent-browser eval "GAME.state.tower.hp = 900; GAME.v10.startTransition(2)" >/dev/null
sleep 0.6
agent-browser eval "GAME.v10.trGoto(7.0); GAME.v10.trResume()" >/dev/null
sleep 0.6
chk "تونل: فاز ۲" "$(ev 'TR.phase')" "2"
chk "تونل: موانع عمق دارند" "$(ev 'MG.obs.length > 0 && MG.obs.every(o => o.dp >= 0.6 && o.dp <= 1)')" "true"
agent-browser eval "mgJump()" >/dev/null
sleep 0.25
chk "تونل: پرش کار می‌کند (رگرسیون)" "$(ev 'MG.pl.y < -20')" "true"
agent-browser screenshot $S/04_tunnel_depth.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 1
agent-browser eval "GAME.state.tower.hp = 900; GAME.v10.startTransition(3)" >/dev/null
sleep 0.6
agent-browser eval "GAME.v10.trGoto(7.2); GAME.v10.trResume()" >/dev/null
sleep 0.6
chk "زیپ‌لاین: فاز ۲" "$(ev 'TR.phase')" "2"
chk "زیپ‌لاین: موانع عمق دارند" "$(ev 'MG.obs.length > 0 && MG.obs.every(o => o.dp >= 0.6 && o.dp <= 1)')" "true"
agent-browser screenshot $S/05_zipline_depth.png >/dev/null
agent-browser eval "GAME.v10.skipTransition()" >/dev/null
sleep 1

echo "===== ۶) رگرسیون کلی ====="
chk "منو/بازی سالم" "$(ev 'GAME.state.mode')" "day"
agent-browser eval "GAME.v10.saveGame()" >/dev/null
chk "سیو کار می‌کند" "$(ev 'GAME.v10.loadSaveData() !== null')" "true"
chk "بدون خطای کنسول (پایان)" "$(agent-browser errors | grep -c error || echo 0)" "0"

echo
echo "=========================================="
echo "PASS=$PASS  FAIL=$FAIL"
[ $FAIL -eq 0 ] && echo "همه‌ی تست‌های ۱۷٫۰ گذرنده ✔" || echo "شکست در تست‌ها!"
