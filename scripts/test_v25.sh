#!/bin/bash
# ============================================================
# تست‌های v25.0 — «سه طبقه تا مرگ»
# تازه‌های ۲۵٫۰ (بازخورد کاربر):
#   - حذف کامل دکمه‌ی تمام‌صفحه
#   - CTA «شروع شب» وسط-پایین (جای قشنگ + متن باحال)
#   - برچسب فقط «مرحله X» — بدون شمارش موج
#   - قیمت‌های ارزان‌تر (ساخت‌وساز + دستفروش)
#   - دستفروش فقط بعد از گفتگو (deferred) + پنل چپ بدون هم‌پوشانی
#   - سکه‌ی انیمیشنی + نوار جون کپسولی + چیپ مرحله
#   - منوی توقف اندرویدی با آمار
# ============================================================
cd /home/z/my-project
F=download/three-floors-to-survival.html
PASS=0; FAIL=0
ck() { # ck <توضیح> <بایت‌ها>
  if grep -q "$2" "$F"; then PASS=$((PASS+1)); echo "  ✓ $1"
  else FAIL=$((FAIL+1)); echo "  ✗ $1"; fi
}
ckn() { # نبود
  if grep -q "$2" "$F"; then FAIL=$((FAIL+1)); echo "  ✗ $1"
  else PASS=$((PASS+1)); echo "  ✓ $1"; fi
}

echo "== v25: دکمه‌ی تمام‌صفحه کاملاً حذف =="
ckn "btnFull حذف" 'btnFull'
ckn "toggleFullscreen حذف" 'toggleFullscreen'
ckn "⛶ (آیکون تمام‌صفحه) حذف" '⛶'

echo "== v25: CTA شروع شب =="
ck "دکمه‌ی nightCTA موجود" 'id="nightCTA"'
ck "متن اصلی CTA" 'id="ncMain"'
ck "ماهِ CTA" 'nc-moon'
ck "استایل final برای آخرین شب" 'nightCTA.final'
ck "کلیک CTA → startNight" "nightCTA').addEventListener('click', startNight"
ck "متن «شروع شب»" 'شروع شب'
ckn "دکمه‌ی قدیمی bpNight حذف" 'bpNight'

echo "== v25: فقط «مرحله X» =="
ck "waveLabel مرحله" "return 'مرحله ' + faNum"
ckn "«موج Y از Z» در HUD حذف" 'موج '+"' '+ faNum(w) + ' از"
ckn "«از ۳۶» حذف" 'از '+"' '+ faNum(FINAL_WAVE)"
ck "چیپ مرحله در HTML" 'id="waveItem"'
ckn "شمارش «باقی» حذف" "' باقی'"

echo "== v25: قیمت‌های جدید =="
ck "گاتلینگ ۵۵" 'price: 55'
ck "اسنایپر ۱۳۰" 'price: 130'
ck "شاتگان ۷۵" 'price: 75'
ck "مسلسل ۱۶۰" 'price: 160'
ck "تسلا ۱۵۰" 'price: 150'
ck "جلیقه ۱۵۰" "vest:     { name: 'جلیقه‌ی ضدّ گازگزش', price: 150"
ck "چراغ‌قوه ۵۵" "flashlight: { name: 'چراغ‌قوه',            price: 55"
ck "نقشه تسلا ۲۴۰" "tesla:   { name: 'نقشه‌ی برجک تسلا',       price: 240"
ck "سرمایه شروع ۶۰" 'state.coins = 60'
ck "جایزه ۱۸+۵w" '18 + state.wave \* 5'

echo "== v25: دستفروش مؤدب (بدون قطع گفتگو) =="
ck "peddlerRollDeferred موجود" 'function peddlerRollDeferred'
ck "enterDay از deferred استفاده می‌کند" 'peddlerRollDeferred();'
ck "PED صبر می‌کند تا گفتگو تمام شود" 'if (!(typeof DLG !== .undefined. && DLG.active)) this.talk()'
ck "پنل دستفروش چپ" 'left:calc(10px \* var(--uiz2,1))'

echo "== v25: HUD جدید =="
ck "سکه‌ی انیمیشنی" 'coinBreath'
ck "درخشش سکه" 'coinSheen'
ck "قلب تپنده" 'heartBeat'
ck "تیک‌های نوار جون" 'hp-ticks'
ck "پرچم چیپ مرحله" 'wv-ic'
ck "پس‌زمینه‌ی اسلات کوله" 'linear-gradient(180deg,rgba(20,32,66,.92)'

echo "== v25: منوی توقف اندرویدی =="
ck "پنل pz-panel" 'pz-panel'
ck "آمار توقف" 'pzStats'
ck "پر کردن آمار در pauseGame" "pzStats');"
ck "چیپ مرحله در توقف" "مرحله <b>' + faNum"

echo "== v25: بیلد =="
ck "نسخه ۲۵ در منو" 'نسخه‌ی ۲۵٫۰'
ck "بدون شمارش ۳۶ در منو" '۴ فصل داستانی'
ck "پنل ساخت‌وساز top از --uiz2" 'top:calc(66px \* var(--uiz2,1))'
ck "max-height کشو" 'max-height:calc(100% - calc(172px'
ck "hint لمس گفتگو" 'برای ادامه، لمس کن'

echo "== سازگاری: ۴ فصل/۳۶ موج/سیو حفظ شده =="
ck "FINAL_WAVE" 'FINAL_WAVE'
ck "کلید سیو" "ttb3_save_v1"
ck "چهار فصل CHAPTERS" 'const CHAPTERS'
ck "کات‌سین پناهگاه" 'startShelterArrival'
ck "معماهای Kalagh-سبک" 'mystery23\|MYST'
ck "شنود TLOU" 'listenBtn'
ck "مولوتوف" 'molotovBtn'

echo ""
echo "نتیجه: $PASS سبز / $FAIL قرمز"
[ $FAIL -eq 0 ] && echo "ALL GREEN ✅" || echo "HAS FAILURES ❌"
