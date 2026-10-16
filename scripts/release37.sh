#!/bin/bash
# release37.sh — ساخت Release v37.0 با APK (API مستقیم — gh نصب نیست)
set -e
TOKEN=$(git -C /home/z/my-project config --get remote.origin.url | sed -E "s#https://([^@]+)@.*#\1#")
[ -z "$TOKEN" ] && { echo "no token in remote url"; exit 1; }
REPO="sahandmarami/three-floors-to-death"
APK="/home/z/my-project/download/three-floors-to-survival.apk"
HTML="/home/z/my-project/download/three-floors-to-survival.html"

TAG="v37.0"
NAME="نسخه‌ی ۳۷٫۰ — منوی روشن‌تر + اعلان‌های پایین صفحه + کوله‌ی خفن + قیمت تفنگ‌ها"

BODY=$(cat <<'EOF'
## چه چیزهایی درست شد؟ (۴ درخواست شما)

### ۱) منوی اصلی روشن‌تر 🌙
- روشنایی صحنه‌ی منو تقریباً **۲ برابر** شد (شستشوی رنگی پس از رسم + هاله‌ی گرمِ افق)
- ماه، ساختمان و زامبی‌ها حالا واضح دیده می‌شوند — ولی حسِ شبِ ترسناک حفظ شده

### ۲) نوشته‌های بازی = پایین صفحه 📜
- اعلان‌های «مرحله / صبح شد / شب می‌شود / کمبو» دیگر از **بالای** صفحه نمی‌آیند — الان **پایین** صفحه هستند
- متن درشت‌تر با سایه‌ی قوی‌تر تا روی زمینِ بازی هم خوانا باشد

### ۳) لوگوی کوله‌پشتی خفن‌تر 🎒
- کوله‌ی تاکتیکالِ بقا: **رخت‌خوابِ لوله‌شده** بالا + **جیبِ ضربدری** + **قمقمه‌ی کناری** + بندهای طلایی
- همان پالت سرمه‌ای/طلایی که خودت فرستادی

### ۴) قیمت تفنگ‌ها نوشته شد 💰
- باگ ریشه‌ای پیدا شد: عددِ قیمت **هرگز نوشته نمی‌شد** (فقط آیکون سکه دیده می‌شد!)
- الان: کلت/شاتگان/مسلسل همه **عدد قیمت** دارند — حتی سلاحِ قفل‌شده

---
**نصب:** فایل APK را دانلود و نصب کنید — روی نسخه‌های قبلی به‌روزرسانی می‌شود (همان امضا). سیو بازی حفظ می‌شود.
EOF
)

# ۱) ساخت release (اگر هست، بروascript جلو)
JSON=$(python3 - "$TAG" "$NAME" "$BODY" <<'PYEOF'
import json, sys
print(json.dumps({"tag_name": sys.argv[1], "name": sys.argv[2], "body": sys.argv[3], "draft": False, "prerelease": False}))
PYEOF
)

RES=$(curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$JSON" \
  "https://api.github.com/repos/$REPO/releases")
REL_ID=$(echo "$RES" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id','')); import sys as s; s.stderr.write(d.get('message','')[:200]+'\n')" 2>/dev/null)
if [ -z "$REL_ID" ]; then
  echo "RELEASE CREATE FAILED:"
  echo "$RES" | head -5
  # شاید هست — ID را بگیر
  REL_ID=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/tags/$TAG" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")
  [ -z "$REL_ID" ] && exit 1
fi
echo "Release ID: $REL_ID"

# ۲) حذف asset های هم‌نام قبلی (درس v28: POST روی asset موجود 409 می‌دهد)
for NAME_A in three-floors-to-survival.apk three-floors-to-survival.html; do
  AID=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/$REL_ID/assets" | python3 -c "
import json,sys
for a in json.load(sys.stdin):
    if a['name']=='$NAME_A': print(a['id']); break")
  if [ -n "$AID" ]; then
    curl -s -X DELETE -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/assets/$AID"
    echo "old asset $NAME_A deleted"
  fi
done

# ۳) آپلود APK
curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary "@$APK" \
  "https://uploads.github.com/repos/$REPO/releases/$REL_ID/assets?name=three-floors-to-survival.apk" | python3 -c "import json,sys; d=json.load(sys.stdin); print('APK:', d.get('browser_download_url', d.get('message','')))"

# ۴) آپلود HTML (نسخه‌ی مرورگر)
curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: text/html" \
  --data-binary "@$HTML" \
  "https://uploads.github.com/repos/$REPO/releases/$REL_ID/assets?name=three-floors-to-survival.html" | python3 -c "import json,sys; d=json.load(sys.stdin); print('HTML:', d.get('browser_download_url', d.get('message','')))"

echo "DONE"
