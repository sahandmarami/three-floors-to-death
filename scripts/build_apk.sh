#!/bin/bash
# ============================================================
# ساخت APK اندرویدی «سه طبقه تا مرگ» — بدون گردل/کپاسیتور
# زنجیره: aapt2 → javac → d8 → zip → zipalign → apksigner
# خروجی: download/three-floors-to-survival.apk
# (۲۱٫۳) امضا با هر سه طرح v1+v2+v3 → گوگل‌پلی‌پروتکت کم‌ترین
#        هشدار را می‌دهد و روی نسخه‌های قبلی «به‌روزرسانی» می‌شود
# پیش‌نیاز: .android-sdk (scripts/setup_sdk_213.sh یک‌بار می‌سازدش)
# ============================================================
set -e
cd /home/z/my-project/android
SDK=/home/z/my-project/.android-sdk
BT=$SDK/build-tools/34.0.0
JAR=$SDK/platforms/android-34/android.jar
HTML=/home/z/my-project/download/three-floors-to-survival.html

echo "[1/7] assets: www/index.html (v23.0)"
mkdir -p assets/www build
cp "$HTML" assets/www/index.html

echo "[2/7] aapt2 compile (res)"
rm -rf build/compiled build/gen build/dex build/classes
mkdir -p build/compiled build/gen build/dex build/classes
$BT/aapt2 compile --dir res -o build/compiled/res.zip

echo "[3/7] aapt2 link (base.apk + R.java)"
$BT/aapt2 link -o build/base.apk \
  -I "$JAR" \
  --manifest AndroidManifest.xml \
  --java build/gen \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 230 --version-name "2.3.0" \
  -A assets \
  build/compiled/res.zip

echo "[4/7] javac (MainActivity + R)"
/home/z/my-project/.android-sdk/jdk/bin/javac -source 1.8 -target 1.8 -g:none -Xlint:-options \
  -bootclasspath "$JAR" \
  -d build/classes \
  build/gen/io/spacez/threefloors/R.java \
  java/io/spacez/threefloors/MainActivity.java 2>/dev/null || \
/home/z/my-project/.android-sdk/jdk/bin/javac -source 1.8 -target 1.8 \
  -bootclasspath "$JAR" \
  -d build/classes \
  build/gen/io/spacez/threefloors/R.java \
  java/io/spacez/threefloors/MainActivity.java

echo "[5/7] d8 (classes.dex)"
( cd build/classes && /home/z/my-project/.android-sdk/jdk/bin/jar -cf ../classes.jar . )
$BT/d8 --min-api 24 --lib "$JAR" \
  build/classes.jar \
  --output build/dex

echo "[6/7] بسته‌بندی + zipalign"
cd build/dex && zip -q -u ../base.apk classes.dex && cd ../..
$BT/zipalign -f -p 4 build/base.apk build/aligned.apk

echo "[7/7] امضا (keystore پروژه)"
KS=/home/z/my-project/scripts/ttb.keystore
if [ ! -f "$KS" ]; then
  /home/z/my-project/.android-sdk/jdk/bin/keytool -genkeypair -keystore "$KS" -alias ttb -keyalg RSA -keysize 2048 \
    -validity 10000 -storepass threefloors -keypass threefloors \
    -dname "CN=Three Floors to Survival,O=SpaceZ,C=IR" >/dev/null 2>&1
fi
$BT/apksigner sign --ks "$KS" --ks-pass pass:threefloors --key-pass pass:threefloors \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --out /home/z/my-project/download/three-floors-to-survival.apk \
  build/aligned.apk
$BT/apksigner verify --print-certs /home/z/my-project/download/three-floors-to-survival.apk | head -3

echo
echo "✔ APK ساخته شد: download/three-floors-to-survival.apk"
ls -lh /home/z/my-project/download/three-floors-to-survival.apk