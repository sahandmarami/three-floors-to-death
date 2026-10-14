#!/bin/bash
# انتشار v32.0 در گیت‌هاب
set -e
cd /home/z/my-project
TOKEN=$(git remote get-url origin | sed 's|https://\([^@]*\)@.*|\1|')
REPO="sahandmarami/three-floors-to-death"

# حذف ریلیر قبلی اگر هست
curl -s -H "Authorization: token $TOKEN" -X DELETE "https://api.github.com/repos/$REPO/releases/tags/v32.0" >/dev/null 2>&1 || true
curl -s -H "Authorization: token $TOKEN" -X DELETE "https://api.github.com/repos/$REPO/git/refs/tags/v32.0" >/dev/null 2>&1 || true

cat > /tmp/rel32.json << 'EOF'
{
  "tag_name": "v32.0",
  "name": "نسخه‌ی ۳۲٫۰ — حذف نوار سلاح + پرونده‌ی سرنخ‌ها (بر اساس گزارش شما)",
  "body": "## چه چیزهایی درست شد؟ (دقیقاً بر اساس گزارش‌های شما)\n\n### 🔫 نوار سلاح پایین — حذف کامل\n- سه تفنگی که پایین صفحه بودند کلاً برداشته شدند\n- خرید و عوض‌کردن سلاح حالا **فقط از بخش ساخت‌وساز** (تب «سلاح‌ها») انجام می‌شود\n\n### 🔎 دکمه و منوی «سرنخ» — بازطراحی کامل\n- دکمه‌ی تازه به سبک پرونده‌ی مستندات + نشان قرمز شمارنده‌ی سرنخ‌ها\n- منوی سرنخ‌ها حالا یک پرونده‌ی واقعی است: کارت‌های شواهد شماره‌دار (۰۱، ۰۲، …)، کارت‌های کهرباییِ معماهای فعال، و سرصفحه‌های خط‌کشی‌شده — نه یک فهرست خسته‌کننده\n\n### 🎬 انیمیشن پنل سرنخ — رفع «اول پایین میاد بعد می‌ره وسط»\n- ریشه: انیمیشن قدیمی مرکزچینیِ پنل را له می‌کرد و پنل اول پایین می‌افتاد بعد وسط می‌پرید\n- حالا پنل از همان لحظه‌ی اول وسط صفحه باز می‌شود (اسکیل نرم)\n\n### 💰 خرید در شروع بازی\n- کاشی‌ها درشت‌تر (۹۴px) + داک ساخت‌وساز در حالت لمس عرضِ کامل می‌گیرد (قبلاً ستونِ ۲۱۰px فقط ۲٫۵ کاشی را جا می‌داد)\n- ردیف کاشی‌ها دیگر اسکرول افقی ندارد (wrap) — لمس‌ها مطمئن работают\n- وقتی پول کافی نیست، پیام «⛔ سکه کافی نیست» روی صفحه دیده می‌شود\n\n### 📏 لوگوهای درشت‌تر\n- لوگوی جعبه‌ی ساخت‌وساز ۲۴→۳۴px و لوگوی کوله‌پشتی ۳۰→۳۸px\n- آیکون چراغ‌قوه = SVG خطی تمیز (به‌جای PNG بدبرش)\n\n### 💾 «ذخیره شد» سریع‌تر\n- پیام ذخیره حالا ~۱ ثانیه دیده می‌شود و می‌رود (قبلاً ۳٫۴ ثانیه می‌ماند)\n\n## تست‌ها\n۲۸۳ تست سبز (v32=۳۴ جدید + رگرسیون v31/v28/v27/v25/v213/v20) + ممیزی VLM: روز ۹/۱۰ · منوی سرنخ ۸/۱۰ · داک ۹/۱۰ · شب ۹/۱۰\n\n**APK: versionCode 320 (v3.2.0) — روی نسخه‌های قبلی نصب و به‌روزرسانی می‌شود**",
  "draft": false,
  "prerelease": false
}
EOF
curl -s -H "Authorization: token $TOKEN" -H "Content-Type: application/json" \
  -d @/tmp/rel32.json "https://api.github.com/repos/$REPO/releases" | python3 -c "
import json,sys
r = json.load(sys.stdin)
print('release id:', r.get('id'), '| tag:', r.get('tag_name'), '| error:', r.get('message',''))
import os
os.environ['RELID'] = str(r.get('id',''))
with open('/tmp/rel32_id.txt','w') as f: f.write(str(r.get('id','')))
"
RELID=$(cat /tmp/rel32_id.txt)
echo "uploading assets to release $RELID..."

# آپلود APK (سه‌باره تلاش)
for i in 1 2 3; do
  curl -s -H "Authorization: token $TOKEN" -H "Content-Type: application/vnd.android.package-archive" \
    --data-binary @download/three-floors-to-death.apk \
    "https://uploads.github.com/repos/$REPO/releases/$RELID/assets?name=three-floors-to-death.apk" | head -c 200
  echo ""
  AURL=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/$RELID/assets" | python3 -c "
import json,sys
try:
  for a in json.load(sys.stdin):
    if a['name']=='three-floors-to-death.apk': print(a['id']); break
except: print('')
")
  if [ -n "$AURL" ] && [ "$AURL" != "" ]; then echo "APK asset id: $AURL"; break; fi
  sleep 3
done

# آپلود HTML
for i in 1 2 3; do
  curl -s -H "Authorization: token $TOKEN" -H "Content-Type: text/html" \
    --data-binary @download/three-floors-to-death.html \
    "https://uploads.github.com/repos/$REPO/releases/$RELID/assets?name=three-floors-to-death.html" | head -c 200
  echo ""
  HURL=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/$RELID/assets" | python3 -c "
import json,sys
try:
  for a in json.load(sys.stdin):
    if a['name']=='three-floors-to-death.html': print(a['id']); break
except: print('')
")
  if [ -n "$HURL" ] && [ "$HURL" != "" ]; then echo "HTML asset id: $HURL"; break; fi
  sleep 3
done

echo "=== final assets ==="
curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/$RELID/assets" | python3 -c "
import json,sys
for a in json.load(sys.stdin):
  print(a['name'], a['size'], 'bytes | state:', a['state'])
"
