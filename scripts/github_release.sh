#!/bin/bash
# github_release.sh — همگام‌سازی کامل گیت‌هاب: کامیت + پوش + تگ + Release + آپلود APK
# استفاده: scripts/github_release.sh <tag> <عنوان> <توضیحات>
# مثال:   scripts/github_release.sh v21.3 "نسخه‌ی ۲۱٫۳" "تمام‌صفحه + نام تازه"
# توکن از remote URL خوانده می‌شود (github_release فقط با set-url توکن‌دار کار می‌کند)
set -e
cd /home/z/my-project

TAG="$1"; TITLE="$2"; NOTES="$3"
if [ -z "$TAG" ] || [ -z "$TITLE" ] || [ -z "$NOTES" ]; then
  echo "استفاده: $0 <tag> <عنوان> <توضیحات>" >&2; exit 1
fi

TOKEN=$(git remote get-url origin | sed -n 's#https://\([^@]*\)@github.com.*#\1#p')
REPO="sahandmarami/three-floors-to-death"
if [ -z "$TOKEN" ]; then echo "خطا: توکن در remote URL نیست" >&2; exit 1; fi

APK="download/three-floors-to-survival.apk"
[ -f "$APK" ] || { echo "خطا: APK پیدا نشد" >&2; exit 1; }

# ۱) کامیت هر تغییر باقی‌مانده + پوش
git add -A
if ! git diff --cached --quiet; then
  git commit -m "$TITLE — همگام‌سازی مخزن" >/dev/null
fi
git push origin main 2>&1 | tail -1

# ۲) تگ (اگر نیست)
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  git tag -a "$TAG" -m "$TITLE" 2>/dev/null || true
  git push origin "$TAG" 2>&1 | tail -1
fi

# ۳) ساخت Release (اگر قبلاً هست، رد شو)
REL_ID=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$REPO/releases/tags/$TAG" | python3 -c "import json,sys;print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -z "$REL_ID" ]; then
  PAYLOAD=$(python3 -c "
import json,sys
print(json.dumps({'tag_name':sys.argv[1],'name':sys.argv[2],'body':sys.argv[3],'draft':False,'prerelease':False}))
" "$TAG" "$TITLE" "$NOTES")
  REL_ID=$(curl -s -X POST -H "Authorization: token $TOKEN" -H "Content-Type: application/json" \
    -d "$PAYLOAD" "https://api.github.com/repos/$REPO/releases" | python3 -c "import json,sys;print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
fi
[ -n "$REL_ID" ] || { echo "خطا: Release ساخته نشد" >&2; exit 1; }

# ۴) آپلود APK به‌عنوان asset (نام تازه: three-floors-to-death.apk)
curl -s -X POST -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary @"$APK" \
  "https://uploads.github.com/repos/$REPO/releases/$REL_ID/assets?name=three-floors-to-death.apk" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print('ASSET:',d.get('name',d.get('message','?')))" 2>/dev/null

# ۵) HTML بازی هم به‌عنوان asset (دریافت مستقیم بدون کلون)
if [ -f "download/three-floors-to-survival.html" ]; then
  curl -s -X POST -H "Authorization: token $TOKEN" \
    -H "Content-Type: text/html" \
    --data-binary @"download/three-floors-to-survival.html" \
    "https://uploads.github.com/repos/$REPO/releases/$REL_ID/assets?name=three-floors-to-death.html" \
    | python3 -c "import json,sys;d=json.load(sys.stdin);print('ASSET:',d.get('name',d.get('message','?')))" 2>/dev/null
fi

echo "RELEASE: https://github.com/$REPO/releases/tag/$TAG"
