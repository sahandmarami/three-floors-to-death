#!/bin/bash
# (۲۱٫۳) بازسازی محیط ساخت APK — cmdline-tools + platform-34 + build-tools 34 + JDK
set -e
cd /home/z/my-project
mkdir -p .android-sdk && cd .android-sdk

echo "[1/4] JDK (با javac)..."
if [ ! -x jdk/bin/javac ]; then
  apt-get install -y --no-install-recommends openjdk-21-jdk-headless >/dev/null 2>&1 && \
    ln -sfn /usr/lib/jvm/java-21-openjdk-amd64 jdk || {
      echo "apt نصب نشد — دانلود Temurin 17..."
      curl -sL "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse" -o jdk.tar.gz
      mkdir -p jdkdir && tar -xzf jdk.tar.gz -C jdkdir --strip-components=1 && mv jdkdir jdk && rm jdk.tar.gz
    }
fi
jdk/bin/javac -version

echo "[2/4] cmdline-tools..."
if [ ! -d cmdline-tools/latest ]; then
  curl -sL "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o clt.zip
  mkdir -p cmdline-tools
  unzip -q clt.zip -d cmdline-tools
  mv cmdline-tools/cmdline-tools cmdline-tools/latest
  rm clt.zip
fi

echo "[3/4] platform-34 + build-tools 34.0.0..."
yes | cmdline-tools/latest/bin/sdkmanager --sdk_root="$PWD" --licenses >/dev/null 2>&1 || true
cmdline-tools/latest/bin/sdkmanager --sdk_root="$PWD" "platforms;android-34" "build-tools;34.0.0" >/dev/null

echo "[4/4] بررسی ابزارها..."
ls build-tools/34.0.0/aapt2 build-tools/34.0.0/d8 build-tools/34.0.0/zipalign build-tools/34.0.0/apksigner platforms/android-34/android.jar
echo "SDK آماده است."
